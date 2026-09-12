import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { assessments, questions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth';

export const assessmentsRouter = Router();

// GET /api/assessments — list published assessments
assessmentsRouter.get('/', requireAuth, async (_req, res) => {
  const rows = await db.query.assessments.findMany({
    where: eq(assessments.isPublished, true),
  });
  res.json(rows);
});

// GET /api/assessments/:id — with questions (no correct answers for candidates)
assessmentsRouter.get('/:id', requireAuth, async (req, res) => {
  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, req.params.id),
  });
  if (!assessment) return res.status(404).json({ error: 'Not found' });

  const qs = await db.query.questions.findMany({
    where: eq(questions.assessmentId, req.params.id),
  });

  // Strip correct answers unless organizer/admin
  const role = req.user!.role;
  const sanitized = qs.map(q => ({
    ...q,
    correctAnswer: (role === 'organizer' || role === 'admin') ? q.correctAnswer : undefined,
  }));

  res.json({ ...assessment, questions: sanitized.sort((a, b) => a.order - b.order) });
});

// POST /api/assessments — organizer only
assessmentsRouter.post('/', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const { title, description, skillIds, durationMinutes } = req.body;
  const [assessment] = await db.insert(assessments).values({
    title, description, skillIds, durationMinutes: durationMinutes || 30,
    createdBy: req.user!.id,
  }).returning();
  res.status(201).json(assessment);
});

// POST /api/assessments/:id/questions
assessmentsRouter.post('/:id/questions', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const questionData = { ...req.body, assessmentId: req.params.id };
  const [q] = await db.insert(questions).values(questionData).returning();
  res.status(201).json(q);
});

// PATCH /api/assessments/:id/publish
assessmentsRouter.patch('/:id/publish', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const [updated] = await db.update(assessments)
    .set({ isPublished: true })
    .where(eq(assessments.id, req.params.id))
    .returning();
  res.json(updated);
});
