import {
  AssessmentQuestion,
  QuestionTelemetry,
  CameraCheckRecord,
  RoughWorkEvidence,
  RapidFireQuestion,
  RapidFireAnswer,
  MultiSignalEvaluation,
  SubmittedAnswer,
} from '../types/resumeAssessment';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SKILLVERIFY MULTI-SIGNAL LOCAL VERIFICATION ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * Combines 6 distinct verification signals into a composite credibility score:
 * 1. Answer Accuracy (Quiz): 40%
 * 2. Rapid-Fire Understanding: 25%
 * 3. Response Consistency: 15%
 * 4. Integrity Signals: 10%
 * 5. Supporting Evidence (Rough Work): 10%
 *
 * NOTE ON INTEGRITY:
 * We never claim browser signals "prove" cheating or dishonesty. Every signal
 * is supporting evidence for human review, framed neutrally and honestly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function generateRapidFireQuestions(skills: string[]): RapidFireQuestion[] {
  const normalized = skills.map((s) => s.trim().toLowerCase());

  const library: RapidFireQuestion[] = [
    {
      id: 'rf-1',
      relatedSkill: 'SQL',
      contextType: 'edge_case',
      prompt:
        'In your database queries, what happens to uncommitted row locks if a client connection drops unexpectedly inside a transaction?',
      options: [
        'The database engine automatically rolls back the transaction and releases all locks.',
        'The locks remain held indefinitely until the server is restarted.',
        'The transaction is automatically committed to prevent data loss.',
        'The locks are converted into advisory locks for other connections.',
      ],
      correctOptionIndex: 0,
    },
    {
      id: 'rf-2',
      relatedSkill: 'React',
      contextType: 'trade_off',
      prompt:
        'You discussed optimizing rendering performance. What is the primary memory trade-off of wrapping every callback in useCallback?',
      options: [
        'Each useCallback allocates closure memory and reference arrays, which can exceed the cost of re-rendering lightweight children.',
        'It causes the React reconciler to trigger synchronous garbage collection passes.',
        'It converts functional components into legacy class component lifecycles.',
        'It disables React Fast Refresh during local development.',
      ],
      correctOptionIndex: 0,
    },
    {
      id: 'rf-3',
      relatedSkill: 'Python',
      contextType: 'reasoning',
      prompt:
        'Why does using asyncio with blocking synchronous file I/O degrade FastAPI server throughput?',
      options: [
        'Blocking I/O halts the single-threaded event loop, preventing all concurrent coroutines from running until the read completes.',
        'Python forces the operating system to spawn a new process per file descriptor.',
        'FastAPI will reject subsequent HTTP requests with a 429 Too Many Requests status.',
        'The Global Interpreter Lock terminates the async worker thread immediately.',
      ],
      correctOptionIndex: 0,
    },
    {
      id: 'rf-4',
      relatedSkill: 'Docker',
      contextType: 'consequence',
      prompt:
        'What consequence occurs if your Docker container processes write logs directly to the writable layer instead of stdout/stderr?',
      options: [
        'Disk usage grows indefinitely without rotation, and native container log drivers cannot capture output.',
        'Docker daemon shuts down the container once the log exceeds 100MB.',
        'The container loses network bridge connectivity to host ports.',
        'The image layer becomes automatically invalidated on restart.',
      ],
      correctOptionIndex: 0,
    },
    {
      id: 'rf-5',
      relatedSkill: 'TypeScript',
      contextType: 'edge_case',
      prompt:
        'What is the runtime consequence of using a type assertion (as SomeType) when the actual payload differs from the interface?',
      options: [
        'TypeScript assertions exist only at compile time; runtime behavior is unchanged and will fail if properties are missing.',
        'The JavaScript runtime throws a TypeError at the assertion statement.',
        'The runtime automatically injects default values for missing properties.',
        'The compiler compiles the file in loose compatibility mode.',
      ],
      correctOptionIndex: 0,
    },
  ];

  // Pick questions matching candidate skills, or fallback to general technical questions
  const matched = library.filter((item) =>
    normalized.some(
      (s) => item.relatedSkill.toLowerCase().includes(s) || s.includes(item.relatedSkill.toLowerCase())
    )
  );

  const selected = matched.length >= 3 ? matched.slice(0, 4) : library.slice(0, 4);
  return selected;
}

/**
 * Evaluates response consistency across question durations.
 * Detects whether candidate maintained regular, plausible pacing.
 */
export function calculateResponseConsistency(
  telemetry: QuestionTelemetry[]
): 'Strong' | 'Moderate' | 'Review Recommended' {
  if (telemetry.length < 3) return 'Moderate';

  const durationsSec = telemetry.map((t) => t.durationMs / 1000);
  const avg = durationsSec.reduce((a, b) => a + b, 0) / durationsSec.length;

  // Unnatural sub-2-second answers across multiple questions
  const instantAnswers = durationsSec.filter((d) => d < 2.5).length;
  if (instantAnswers >= 3) {
    return 'Review Recommended';
  }

  // Calculate standard deviation
  const variance =
    durationsSec.reduce((acc, d) => acc + Math.pow(d - avg, 2), 0) / durationsSec.length;
  const stdDev = Math.sqrt(variance);

  // If variance is within normal human bounds (thoughtful reading & answering)
  if (stdDev < avg * 1.2 && avg >= 8) {
    return 'Strong';
  }

  return 'Moderate';
}

/**
 * Evaluates assessment speed relative to normal expected reading and problem-solving.
 */
export function calculateAssessmentSpeed(
  telemetry: QuestionTelemetry[]
): 'Fast' | 'Consistent' | 'Deliberate' {
  if (telemetry.length === 0) return 'Consistent';

  const avgSec =
    telemetry.reduce((acc, t) => acc + t.durationMs, 0) / (telemetry.length * 1000);

  if (avgSec < 12) return 'Fast';
  if (avgSec <= 40) return 'Consistent';
  return 'Deliberate';
}

/**
 * Evaluates browser integrity events into neutral concern buckets.
 */
export function calculateIntegritySignals(
  tabSwitches: number,
  fullscreenExits: number,
  cameraCheck: CameraCheckRecord | null
): {
  rating: 'Low Concern' | 'Moderate Concern' | 'Review Recommended';
  flags: string[];
} {
  const flags: string[] = [];

  if (fullscreenExits === 0 && tabSwitches === 0) {
    flags.push('✓ Stable assessment session');
  }
  if (tabSwitches > 0) {
    flags.push(`⚠ ${tabSwitches} focus loss / tab switch detected`);
  }
  if (fullscreenExits > 0) {
    flags.push(`⚠ Fullscreen exited ${fullscreenExits} time(s)`);
  }
  if (cameraCheck && cameraCheck.status === 'completed') {
    flags.push('✓ Camera presence check completed');
  } else if (cameraCheck && (cameraCheck.status === 'dismissed' || cameraCheck.status === 'timed_out')) {
    flags.push('⚠ Camera check dismissed without response');
  } else {
    flags.push('○ Camera check not active');
  }

  const penaltyScore =
    fullscreenExits * 2 +
    tabSwitches * 1 +
    (cameraCheck?.status === 'dismissed' || cameraCheck?.status === 'timed_out' ? 1 : 0);

  if (penaltyScore <= 1) {
    return { rating: 'Low Concern', flags };
  }
  if (penaltyScore <= 3) {
    return { rating: 'Moderate Concern', flags };
  }
  return { rating: 'Review Recommended', flags };
}

/**
 * Deterministic multi-signal composite credibility calculation.
 */
export function computeMultiSignalEvaluation(params: {
  questions: AssessmentQuestion[];
  answers: SubmittedAnswer[];
  telemetry: QuestionTelemetry[];
  cameraCheck: CameraCheckRecord | null;
  roughWork: RoughWorkEvidence | null;
  rapidFireAnswers: RapidFireAnswer[];
  tabSwitches: number;
  fullscreenExits: number;
}): MultiSignalEvaluation {
  const {
    questions,
    answers,
    telemetry,
    cameraCheck,
    roughWork,
    rapidFireAnswers,
    tabSwitches,
    fullscreenExits,
  } = params;

  // 1. Answer Accuracy (Quiz)
  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));
  let correctCount = 0;
  const skillScoresAccum: Record<string, { total: number; count: number }> = {};

  for (const q of questions) {
    if (!skillScoresAccum[q.skill]) {
      skillScoresAccum[q.skill] = { total: 0, count: 0 };
    }

    const candidateAns = (answerMap.get(q.id) || '').trim();
    let isCorrect = false;

    if (q.type === 'objective') {
      if (q.correctAnswer) {
        isCorrect = candidateAns.toLowerCase() === q.correctAnswer.toLowerCase();
      } else {
        // Fallback: non-empty candidate answer
        isCorrect = candidateAns.length > 0;
      }
    } else {
      // Subjective: plausible technical length
      isCorrect = candidateAns.length >= 30;
    }

    if (isCorrect) correctCount += 1;

    const qScore = isCorrect ? 90 : 45;
    skillScoresAccum[q.skill].total += qScore;
    skillScoresAccum[q.skill].count += 1;
  }

  const answerAccuracy = Math.round((correctCount / Math.max(1, questions.length)) * 100);

  // 2. Response Consistency
  const responseConsistency = calculateResponseConsistency(telemetry);

  // 3. Assessment Speed
  const assessmentSpeed = calculateAssessmentSpeed(telemetry);

  // 4. Rapid-Fire Performance
  let rapidFireCorrect = 0;
  const rapidFireTotal = Math.max(1, rapidFireAnswers.length);
  for (const rfa of rapidFireAnswers) {
    if (rfa.correct) rapidFireCorrect += 1;
  }
  const rapidFireRatio = rapidFireCorrect / rapidFireTotal;
  const rapidFirePerformance: MultiSignalEvaluation['rapidFirePerformance'] =
    rapidFireRatio >= 0.75 ? 'Strong' : rapidFireRatio >= 0.5 ? 'Moderate' : 'Limited';

  // 5. Integrity Signals
  const integrity = calculateIntegritySignals(tabSwitches, fullscreenExits, cameraCheck);

  // 6. Supporting Evidence
  const supportingEvidence = roughWork?.provided ? 'Provided' : 'Not Provided';

  // ─── COMPOSITE FORMULA ───────────────────────────────────────────────────────
  // Weights:
  // - Accuracy: 40%
  // - Rapid-Fire: 25%
  // - Response Consistency: 15% (Strong: 100, Moderate: 75, Review: 50)
  // - Integrity: 10% (Low: 100, Moderate: 75, Review: 50)
  // - Supporting Evidence: 10% (Provided: 100, Not Provided: 50)
  const consistencyScore =
    responseConsistency === 'Strong' ? 100 : responseConsistency === 'Moderate' ? 75 : 50;

  const rapidFireScoreNum = Math.round(rapidFireRatio * 100);

  const integrityScoreNum =
    integrity.rating === 'Low Concern' ? 100 : integrity.rating === 'Moderate Concern' ? 75 : 50;

  const evidenceScoreNum = supportingEvidence === 'Provided' ? 100 : 50;

  const compositeRaw =
    answerAccuracy * 0.4 +
    rapidFireScoreNum * 0.25 +
    consistencyScore * 0.15 +
    integrityScoreNum * 0.1 +
    evidenceScoreNum * 0.1;

  const compositeCredibilityScore = Math.max(10, Math.min(99, Math.round(compositeRaw)));

  const verificationLevel: MultiSignalEvaluation['verificationLevel'] =
    compositeCredibilityScore >= 80
      ? 'Strong Evidence'
      : compositeCredibilityScore >= 65
      ? 'Moderate Evidence'
      : 'Limited Evidence';

  // Per-skill verified results
  const verifiedSkills: MultiSignalEvaluation['verifiedSkills'] = [];
  for (const [sName, data] of Object.entries(skillScoresAccum)) {
    const rawSkillAvg = data.count > 0 ? Math.round(data.total / data.count) : 75;
    // Blend with composite credibility for cohesive skill representation
    const finalSkillScore = Math.round(rawSkillAvg * 0.6 + compositeCredibilityScore * 0.4);
    const isVerified = finalSkillScore >= 70;

    verifiedSkills.push({
      name: sName,
      score: finalSkillScore,
      status: isVerified ? 'VERIFIED' : 'CLAIMED',
      evidence: isVerified
        ? `Verified via 10-Q assessment + rapid-fire follow-up (${finalSkillScore}% benchmark).`
        : `Assessment score ${finalSkillScore}%; needs additional evidence.`,
    });
  }

  // Telemetry summary
  const totalDurationSeconds = Math.round(
    telemetry.reduce((acc, t) => acc + t.durationMs, 0) / 1000
  );
  const avgResponseTimeSeconds =
    telemetry.length > 0
      ? Math.round((totalDurationSeconds / telemetry.length) * 10) / 10
      : 20;

  return {
    answerAccuracy,
    responseConsistency,
    assessmentSpeed,
    rapidFirePerformance,
    integritySignals: integrity.rating,
    supportingEvidence,
    compositeCredibilityScore,
    verificationLevel,
    verifiedSkills,
    integrityDetails: {
      totalDurationSeconds,
      avgResponseTimeSeconds,
      tabSwitches,
      fullscreenExits,
      cameraCheckStatus: cameraCheck?.status || 'not_available',
      roughWorkProvided: Boolean(roughWork?.provided),
      rapidFireCompleted: `${rapidFireCorrect} / ${rapidFireTotal} completed`,
      flags: integrity.flags,
    },
  };
}
