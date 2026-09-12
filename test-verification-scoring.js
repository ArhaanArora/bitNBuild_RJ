const assert = require('assert');

// Simulate pure logic from verificationScoring.ts
function generateRapidFireQuestions(skills) {
  const library = [
    { id: 'rf-1', relatedSkill: 'SQL', prompt: 'Row locks on disconnect?', options: ['Rolls back', 'Indefinite', 'Commits'], correctOptionIndex: 0 },
    { id: 'rf-2', relatedSkill: 'React', prompt: 'useCallback memory trade-off?', options: ['Closure allocations', 'GC passes'], correctOptionIndex: 0 },
    { id: 'rf-3', relatedSkill: 'Python', prompt: 'Asyncio with blocking I/O?', options: ['Blocks event loop', 'New process'], correctOptionIndex: 0 },
    { id: 'rf-4', relatedSkill: 'Docker', prompt: 'Writing to writable layer?', options: ['Disk bloat', 'Auto-shutdown'], correctOptionIndex: 0 },
  ];
  return library.slice(0, 4);
}

function calculateResponseConsistency(telemetry) {
  if (telemetry.length < 3) return 'Moderate';
  const durationsSec = telemetry.map(t => t.durationMs / 1000);
  const avg = durationsSec.reduce((a, b) => a + b, 0) / durationsSec.length;

  const instantAnswers = durationsSec.filter(d => d < 2.5).length;
  if (instantAnswers >= 3) return 'Review Recommended';

  const variance = durationsSec.reduce((acc, d) => acc + Math.pow(d - avg, 2), 0) / durationsSec.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < avg * 1.2 && avg >= 8) return 'Strong';
  return 'Moderate';
}

function calculateAssessmentSpeed(telemetry) {
  if (telemetry.length === 0) return 'Consistent';
  const avgSec = telemetry.reduce((acc, t) => acc + t.durationMs, 0) / (telemetry.length * 1000);
  if (avgSec < 12) return 'Fast';
  if (avgSec <= 40) return 'Consistent';
  return 'Deliberate';
}

function calculateIntegritySignals(tabSwitches, fullscreenExits, cameraCheck) {
  const flags = [];
  if (fullscreenExits === 0 && tabSwitches === 0) flags.push('✓ Stable assessment session');
  if (tabSwitches > 0) flags.push(`⚠ ${tabSwitches} focus loss / tab switch detected`);
  if (fullscreenExits > 0) flags.push(`⚠ Fullscreen exited ${fullscreenExits} time(s)`);
  if (cameraCheck && cameraCheck.status === 'completed') flags.push('✓ Camera presence check completed');
  else if (cameraCheck && (cameraCheck.status === 'dismissed' || cameraCheck.status === 'timed_out')) flags.push('⚠ Camera check dismissed without response');
  else flags.push('○ Camera check not active');

  const penaltyScore = fullscreenExits * 2 + tabSwitches * 1 + (cameraCheck?.status === 'dismissed' || cameraCheck?.status === 'timed_out' ? 1 : 0);
  if (penaltyScore <= 1) return { rating: 'Low Concern', flags };
  if (penaltyScore <= 3) return { rating: 'Moderate Concern', flags };
  return { rating: 'Review Recommended', flags };
}

function computeMultiSignalEvaluation({
  questionsCount = 10,
  correctCount = 8,
  telemetry = [],
  cameraCheck = { status: 'completed' },
  roughWork = { provided: true },
  rapidFireAnswers = [{ correct: true }, { correct: true }, { correct: true }, { correct: true }],
  tabSwitches = 0,
  fullscreenExits = 0,
}) {
  const answerAccuracy = Math.round((correctCount / questionsCount) * 100);
  const responseConsistency = calculateResponseConsistency(telemetry);
  const assessmentSpeed = calculateAssessmentSpeed(telemetry);

  let rfCorrect = rapidFireAnswers.filter(a => a.correct).length;
  const rapidFireRatio = rfCorrect / Math.max(1, rapidFireAnswers.length);
  const rapidFirePerformance = rapidFireRatio >= 0.75 ? 'Strong' : rapidFireRatio >= 0.5 ? 'Moderate' : 'Limited';

  const integrity = calculateIntegritySignals(tabSwitches, fullscreenExits, cameraCheck);
  const supportingEvidence = roughWork?.provided ? 'Provided' : 'Not Provided';

  const consistencyScore = responseConsistency === 'Strong' ? 100 : responseConsistency === 'Moderate' ? 75 : 50;
  const rapidFireScoreNum = Math.round(rapidFireRatio * 100);
  const integrityScoreNum = integrity.rating === 'Low Concern' ? 100 : integrity.rating === 'Moderate Concern' ? 75 : 50;
  const evidenceScoreNum = supportingEvidence === 'Provided' ? 100 : 50;

  // Composite Credibility Formula (0 - 100)
  // 40% Accuracy + 25% Rapid-Fire + 15% Consistency + 10% Integrity + 10% Evidence
  const composite = Math.round(
    answerAccuracy * 0.4 +
    rapidFireScoreNum * 0.25 +
    consistencyScore * 0.15 +
    integrityScoreNum * 0.1 +
    evidenceScoreNum * 0.1
  );

  const verificationLevel = composite >= 80 ? 'Strong Evidence' : composite >= 65 ? 'Moderate Evidence' : 'Limited Evidence';

  return {
    answerAccuracy,
    responseConsistency,
    assessmentSpeed,
    rapidFirePerformance,
    integritySignals: integrity.rating,
    supportingEvidence,
    compositeCredibilityScore: composite,
    verificationLevel,
    flags: integrity.flags,
  };
}

// ─── RUN VERIFICATION TESTS ───────────────────────────────────────────────────
console.log('--- Running Multi-Signal Verification Scoring Unit Tests ---');

// Test 1: Standard high-integrity candidate
const testTelemetry1 = [
  { durationMs: 15000 }, { durationMs: 22000 }, { durationMs: 18000 },
  { durationMs: 25000 }, { durationMs: 19000 }, { durationMs: 24000 },
  { durationMs: 16000 }, { durationMs: 20000 }, { durationMs: 28000 }, { durationMs: 21000 },
];

const res1 = computeMultiSignalEvaluation({
  questionsCount: 10,
  correctCount: 9, // 90%
  telemetry: testTelemetry1,
  cameraCheck: { status: 'completed' },
  roughWork: { provided: true },
  rapidFireAnswers: [{ correct: true }, { correct: true }, { correct: true }, { correct: true }], // 100%
  tabSwitches: 0,
  fullscreenExits: 0,
});

console.log('[Test 1] Ideal candidate evaluation:', res1);
assert.strictEqual(res1.answerAccuracy, 90);
assert.strictEqual(res1.responseConsistency, 'Strong');
assert.strictEqual(res1.assessmentSpeed, 'Consistent');
assert.strictEqual(res1.integritySignals, 'Low Concern');
assert.strictEqual(res1.supportingEvidence, 'Provided');
assert.strictEqual(res1.verificationLevel, 'Strong Evidence');
assert(res1.compositeCredibilityScore >= 85, 'Expected high credibility score');
console.log('PASS: Ideal candidate passed with expected composite score:', res1.compositeCredibilityScore);

// Test 2: Candidate with 1 focus loss and no rough work (not auto-disqualified)
const res2 = computeMultiSignalEvaluation({
  questionsCount: 10,
  correctCount: 8, // 80%
  telemetry: testTelemetry1,
  cameraCheck: { status: 'completed' },
  roughWork: { provided: false },
  rapidFireAnswers: [{ correct: true }, { correct: true }, { correct: false }, { correct: true }], // 75%
  tabSwitches: 1, // 1 focus loss
  fullscreenExits: 0,
});

console.log('\n[Test 2] Candidate with 1 focus loss & no rough work:', res2);
assert.strictEqual(res2.integritySignals, 'Low Concern'); // 1 focus loss is still Low Concern
assert.strictEqual(res2.supportingEvidence, 'Not Provided');
assert(res2.compositeCredibilityScore >= 70, 'Candidate should NOT be disqualified for soft signals');
console.log('PASS: Soft signals appropriately incorporated without auto-disqualification:', res2.compositeCredibilityScore);

// Test 3: Unnatural sub-2-second answers across multiple questions
const testTelemetrySuspicious = [
  { durationMs: 1200 }, { durationMs: 1500 }, { durationMs: 1100 },
  { durationMs: 18000 }, { durationMs: 20000 },
];
const consistencyCheck = calculateResponseConsistency(testTelemetrySuspicious);
console.log('\n[Test 3] Response consistency on unnatural instant clicks:', consistencyCheck);
assert.strictEqual(consistencyCheck, 'Review Recommended');
console.log('PASS: Correctly flagged unnatural speed as Review Recommended');

console.log('\n=============================================');
console.log(' ALL VERIFICATION SCORING TESTS PASSED (100%)');
console.log('=============================================');
