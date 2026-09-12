import { Router } from 'express';
import multer from 'multer';
import { db } from '../db';
import {
  assessmentSessions, questionResponses, integrityEvents,
  cameraChecks, roughWorkFiles, questions, assessments, candidateSkills,
} from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

export const sessionsRouter = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `rw-${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Scoring Engine ───────────────────────────────────────────────────────────

const INTEGRITY_DEDUCTIONS: Record<string, number> = {
  TAB_SWITCH: 5, FULLSCREEN_EXIT: 5, COPY_ATTEMPT: 8,
  PASTE_ATTEMPT: 8, CUT_ATTEMPT: 5, RIGHT_CLICK: 3,
};
const INTEGRITY_CAPS: Record<string, number> = {
  TAB_SWITCH: 20, FULLSCREEN_EXIT: 15, COPY_ATTEMPT: 24,
  PASTE_ATTEMPT: 24, CUT_ATTEMPT: 15, RIGHT_CLICK: 9,
};

function calcIntegrityScore(events: { eventType: string }[], cameras: { passed: boolean | null; timedOut: boolean | null }[], fastFlags: number, hasRoughWork: boolean): number {
  let score = 100;

  // Event deductions
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.eventType] = (counts[e.eventType] ?? 0) + 1;
  }
  for (const [type, count] of Object.entries(counts)) {
    const deduct = Math.min(count * (INTEGRITY_DEDUCTIONS[type] ?? 3), INTEGRITY_CAPS[type] ?? 9);
    score -= deduct;
  }

  // Camera check deductions
  const missedCameras = cameras.filter(c => !c.passed || c.timedOut).length;
  score -= Math.min(missedCameras * 10, 30);

  // Fast response flags
  score -= Math.min(fastFlags * 4, 20);

  // No rough work
  if (!hasRoughWork) score -= 5;

  return Math.max(0, Math.round(score));
}

function scoreShortAnswer(answer: string, hints: string): number {
  // Deterministic rule-based scoring for MVP (P0)
  if (!answer || answer.trim().length < 20) return 0;
  if (answer.trim().length < 60) return 1;
  const words = answer.trim().split(/\s+/).length;
  // Check for keyword coverage from hints
  const hintKeywords = hints.toLowerCase().match(/\b\w{4,}\b/g) ?? [];
  const answerLower = answer.toLowerCase();
  const hits = hintKeywords.filter(kw => answerLower.includes(kw)).length;
  const coverage = hintKeywords.length > 0 ? hits / hintKeywords.length : 0.5;
  if (words >= 80 && coverage >= 0.4) return 3;
  if (words >= 50 && coverage >= 0.25) return 2;
  return 1;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/sessions/start
sessionsRouter.post('/start', requireAuth, async (req, res) => {
  const { assessmentId, candidateSkillId } = req.body;
  if (!assessmentId) return res.status(400).json({ error: 'assessmentId required' });

  const assessment = await db.query.assessments.findFirst({ where: eq(assessments.id, assessmentId) });
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

  const expiresAt = new Date(Date.now() + (assessment.durationMinutes + 5) * 60_000);

  const [session] = await db.insert(assessmentSessions).values({
    userId: req.user!.id,
    assessmentId,
    candidateSkillId: candidateSkillId || null,
    status: 'IN_PROGRESS',
    startedAt: new Date(),
    expiresAt,
  }).returning();

  // Mark candidate skill as IN_PROGRESS
  if (candidateSkillId) {
    await db.update(candidateSkills)
      .set({ verificationStatus: 'IN_PROGRESS' })
      .where(and(eq(candidateSkills.id, candidateSkillId), eq(candidateSkills.userId, req.user!.id)));
  }

  res.status(201).json({ sessionId: session.id, expiresAt });
});

// GET /api/sessions/my — all sessions for current user
sessionsRouter.get('/my', requireAuth, async (req, res) => {
  const rows = await db.query.assessmentSessions.findMany({
    where: eq(assessmentSessions.userId, req.user!.id),
  });
  res.json(rows);
});

// GET /api/sessions/:id
sessionsRouter.get('/:id', requireAuth, async (req, res) => {
  const session = await db.query.assessmentSessions.findFirst({
    where: and(eq(assessmentSessions.id, req.params.id), eq(assessmentSessions.userId, req.user!.id)),
  });
  if (!session) return res.status(404).json({ error: 'Not found' });
  res.json(session);
});

// POST /api/sessions/:id/answer
sessionsRouter.post('/:id/answer', requireAuth, async (req, res) => {
  const { questionId, answer, startedAt, answeredAt } = req.body;
  const session = await db.query.assessmentSessions.findFirst({
    where: and(eq(assessmentSessions.id, req.params.id), eq(assessmentSessions.userId, req.user!.id)),
  });
  if (!session || session.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Session not active' });

  const question = await db.query.questions.findFirst({ where: eq(questions.id, questionId) });
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const started = startedAt ? new Date(startedAt) : new Date();
  const answered = answeredAt ? new Date(answeredAt) : new Date();
  const timeSpentMs = answered.getTime() - started.getTime();
  const flaggedFast = timeSpentMs < (question.fastResponseThresholdSec ?? 10) * 1000;

  // Auto-score MCQ
  let isCorrect: boolean | undefined;
  let pointsAwarded = 0;
  if (question.type === 'mcq') {
    isCorrect = answer?.trim() === question.correctAnswer?.trim();
    pointsAwarded = isCorrect ? question.points : 0;
  } else if (question.type === 'short_answer') {
    const score = scoreShortAnswer(answer ?? '', question.scoringHints ?? '');
    pointsAwarded = Math.min(score, question.points);
  } else if (question.type === 'practical') {
    // Practical: award partial points based on length/effort
    const words = (answer ?? '').trim().split(/\s+/).length;
    pointsAwarded = words > 30 ? question.points : words > 10 ? question.points * 0.5 : 0;
  }

  // Adaptive follow-up trigger: MCQ answered very fast AND correct on hard question
  let adaptiveFollowup: string | undefined;
  if (question.type === 'mcq' && flaggedFast && isCorrect && (question.points ?? 0) >= 2) {
    adaptiveFollowup = `You answered quickly. Can you briefly explain why you selected that answer?`;
  }

  // Upsert response
  const existing = await db.query.questionResponses.findFirst({
    where: and(eq(questionResponses.sessionId, req.params.id), eq(questionResponses.questionId, questionId)),
  });

  if (existing) {
    await db.update(questionResponses)
      .set({ answer, isCorrect, pointsAwarded, answeredAt: answered, timeSpentMs, changedAnswer: true, flaggedFast, adaptiveFollowup })
      .where(eq(questionResponses.id, existing.id));
  } else {
    await db.insert(questionResponses).values({
      sessionId: req.params.id, questionId, answer,
      isCorrect, pointsAwarded, startedAt: started, answeredAt: answered,
      timeSpentMs, flaggedFast, adaptiveFollowup,
    });
  }

  res.json({ isCorrect: question.type === 'mcq' ? isCorrect : null, pointsAwarded, flaggedFast, adaptiveFollowup });
});

// POST /api/sessions/:id/event
sessionsRouter.post('/:id/event', requireAuth, async (req, res) => {
  const { eventType, questionId, metadata } = req.body;
  const [evt] = await db.insert(integrityEvents).values({
    sessionId: req.params.id, eventType, questionId: questionId || null, metadata,
  }).returning();
  res.status(201).json(evt);
});

// POST /api/sessions/:id/camera
sessionsRouter.post('/:id/camera', requireAuth, async (req, res) => {
  const { promptType, passed, timedOut } = req.body;
  const [check] = await db.insert(cameraChecks).values({
    sessionId: req.params.id, promptType,
    passed: passed ?? null, timedOut: timedOut ?? false,
    respondedAt: new Date(),
  }).returning();
  res.status(201).json(check);
});

// POST /api/sessions/:id/roughwork — upload files
sessionsRouter.post('/:id/roughwork', requireAuth, upload.array('files', 5), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) return res.status(400).json({ error: 'No files uploaded' });

  const inserted = await Promise.all(files.map(f =>
    db.insert(roughWorkFiles).values({
      sessionId: req.params.id, userId: req.user!.id, fileUrl: `/uploads/${f.filename}`,
    }).returning()
  ));
  res.status(201).json(inserted.map(r => r[0]));
});

// POST /api/sessions/:id/submit — calculate scores, update skill status
sessionsRouter.post('/:id/submit', requireAuth, async (req, res) => {
  const session = await db.query.assessmentSessions.findFirst({
    where: and(eq(assessmentSessions.id, req.params.id), eq(assessmentSessions.userId, req.user!.id)),
  });
  if (!session || session.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Session not active' });

  const allQuestions = await db.query.questions.findMany({ where: eq(questions.assessmentId, session.assessmentId) });
  const responses = await db.query.questionResponses.findMany({ where: eq(questionResponses.sessionId, session.id) });
  const events = await db.query.integrityEvents.findMany({ where: eq(integrityEvents.sessionId, session.id) });
  const cameras = await db.query.cameraChecks.findMany({ where: eq(cameraChecks.sessionId, session.id) });
  const roughWork = await db.query.roughWorkFiles.findMany({ where: eq(roughWorkFiles.sessionId, session.id) });

  // ── Technical score ──────────────────────────────────────────────────────
  const mcqs = allQuestions.filter(q => q.type === 'mcq');
  const practicals = allQuestions.filter(q => q.type === 'practical');
  const shortAnswers = allQuestions.filter(q => q.type === 'short_answer');

  const getScore = (qs: typeof allQuestions) => {
    if (qs.length === 0) return null;
    const totalPoints = qs.reduce((s, q) => s + q.points, 0);
    const earnedPoints = responses
      .filter(r => qs.some(q => q.id === r.questionId))
      .reduce((s, r) => s + (r.pointsAwarded ?? 0), 0);
    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const knowledgeScore = getScore(mcqs);
  const practicalScore = getScore(practicals);
  const explanationScore = getScore(shortAnswers);

  const weights = { knowledge: 0.35, practical: 0.40, explanation: 0.25 };
  let technicalScore = 0;
  let totalWeight = 0;
  if (knowledgeScore !== null) { technicalScore += knowledgeScore * weights.knowledge; totalWeight += weights.knowledge; }
  if (practicalScore !== null) { technicalScore += practicalScore * weights.practical; totalWeight += weights.practical; }
  if (explanationScore !== null) { technicalScore += explanationScore * weights.explanation; totalWeight += weights.explanation; }
  if (totalWeight > 0) technicalScore = Math.round(technicalScore / totalWeight);

  // ── Integrity score ──────────────────────────────────────────────────────
  const fastFlags = responses.filter(r => r.flaggedFast).length;
  const integrityScore = calcIntegrityScore(events, cameras, fastFlags, roughWork.length > 0);

  // ── Update session ───────────────────────────────────────────────────────
  await db.update(assessmentSessions)
    .set({
      status: 'SUBMITTED', submittedAt: new Date(),
      technicalScore, knowledgeScore: knowledgeScore ?? undefined,
      practicalScore: practicalScore ?? undefined,
      explanationScore: explanationScore ?? undefined,
      integrityScore,
    })
    .where(eq(assessmentSessions.id, session.id));

  // ── Update candidate skill ───────────────────────────────────────────────
  if (session.candidateSkillId) {
    const newStatus = technicalScore >= 60 ? 'VERIFIED' : 'UNVERIFIED';
    await db.update(candidateSkills)
      .set({
        verificationStatus: newStatus,
        verifiedScore: technicalScore,
        integrityScore,
        lastVerifiedAt: new Date(),
      })
      .where(eq(candidateSkills.id, session.candidateSkillId));
  }

  res.json({ technicalScore, knowledgeScore, practicalScore, explanationScore, integrityScore });
});

// GET /api/sessions/:id/result — full result + breakdown
sessionsRouter.get('/:id/result', requireAuth, async (req, res) => {
  const session = await db.query.assessmentSessions.findFirst({
    where: and(eq(assessmentSessions.id, req.params.id), eq(assessmentSessions.userId, req.user!.id)),
  });
  if (!session || session.status !== 'SUBMITTED') return res.status(404).json({ error: 'Result not ready' });

  const responses = await db.query.questionResponses.findMany({ where: eq(questionResponses.sessionId, session.id) });
  const events = await db.query.integrityEvents.findMany({ where: eq(integrityEvents.sessionId, session.id) });
  const cameras = await db.query.cameraChecks.findMany({ where: eq(cameraChecks.sessionId, session.id) });
  const roughWork = await db.query.roughWorkFiles.findMany({ where: eq(roughWorkFiles.sessionId, session.id) });

  const integrityBreakdown = {
    tabSwitches: events.filter(e => e.eventType === 'TAB_SWITCH').length,
    fullscreenExits: events.filter(e => e.eventType === 'FULLSCREEN_EXIT').length,
    copyAttempts: events.filter(e => e.eventType === 'COPY_ATTEMPT').length,
    pasteAttempts: events.filter(e => e.eventType === 'PASTE_ATTEMPT').length,
    fastResponseFlags: responses.filter(r => r.flaggedFast).length,
    cameraChecks: { total: cameras.length, passed: cameras.filter(c => c.passed).length },
    roughWorkSubmitted: roughWork.length > 0,
  };

  res.json({ session, responses, integrityBreakdown, cameras, roughWork });
});
