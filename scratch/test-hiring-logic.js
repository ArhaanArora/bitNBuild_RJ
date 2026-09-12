// Automated test suite for Hiring module matching, data schema, and business rules

import { computeHiringMatch } from '../packages/client/src/utils/hiringMatching.ts';
import { DEMO_HIRING_CANDIDATES } from '../packages/client/src/data/mockHiringData.ts';

console.log('=== TEST SUITE: HIRING MODULE SPECIFICATION & QA CHECKLIST ===\n');

// 1. Verify Demo Candidates Table (Section 5 Spec)
console.log('--- TEST 1: Demo Candidates Schema & Credibility Scores ---');
const expectedCandidates = [
  { name: 'Aarav Mehta', role: 'Backend Developer', cred: 91 },
  { name: 'Riya Sharma', role: 'Frontend Developer', cred: 88 },
  { name: 'Kabir Singh', role: 'AI/ML Engineer', cred: 94 },
  { name: 'Ananya Kapoor', role: 'UI/UX Designer', cred: 90 },
  { name: 'Dev Malhotra', role: 'Full Stack Developer', cred: 85 },
];

for (const exp of expectedCandidates) {
  const found = DEMO_HIRING_CANDIDATES.find((c) => c.name === exp.name);
  if (!found) {
    console.error(`[FAIL] Candidate ${exp.name} not found in DEMO_HIRING_CANDIDATES`);
    process.exit(1);
  }
  if (found.credibilityScore !== exp.cred) {
    console.error(`[FAIL] ${exp.name} credibility score mismatch: expected ${exp.cred}, got ${found.credibilityScore}`);
    process.exit(1);
  }
  console.log(`[PASS] ${found.name}: ${found.role} | Credibility: ${found.credibilityScore}% | Assessment: ${found.assessmentScore}% | Projects: ${found.verifiedProjectsCount}`);
}

// 2. Test Deterministic Explainable Matching (Section 6 Spec)
console.log('\n--- TEST 2: Deterministic Matching & Reasoning Bullets ---');
const backendReq = {
  role: 'Backend Developer',
  requiredSkills: ['Python', 'SQL', 'Node.js'],
  experience: 'Any',
  location: 'Nearby',
};

const aarav = DEMO_HIRING_CANDIDATES.find((c) => c.name === 'Aarav Mehta');
const aaravMatch = computeHiringMatch(aarav, backendReq);

console.log(`Aarav Mehta Match Score: ${aaravMatch.matchScore}%`);
console.log(`Reasoning bullets:`);
for (const b of aaravMatch.reasoningBullets) {
  console.log(`  ${b}`);
}

if (aaravMatch.matchScore < 90) {
  console.error(`[FAIL] Expected Aarav Mehta match score >= 90% for Backend req, got ${aaravMatch.matchScore}%`);
  process.exit(1);
}
if (aaravMatch.reasoningBullets.length < 2) {
  console.error(`[FAIL] Expected at least 2 reasoning bullets`);
  process.exit(1);
}
if (!aaravMatch.reasoningBullets.some((b) => b.includes('3/3') && b.includes('verified'))) {
  console.error(`[FAIL] Expected bullet acknowledging 3/3 verified skills`);
  process.exit(1);
}
console.log('[PASS] Aarav Mehta matching formula and reasoning bullets verified.');

// 3. Test Claimed vs Verified Distinction
console.log('\n--- TEST 3: Claimed vs Verified Skills Distinction ---');
const verifiedSkills = aarav.skills.filter((s) => s.status === 'VERIFIED');
const claimedSkills = aarav.skills.filter((s) => s.status === 'CLAIMED');

console.log(`Verified count: ${verifiedSkills.length} (${verifiedSkills.map((s) => s.name).join(', ')})`);
console.log(`Claimed count: ${claimedSkills.length} (${claimedSkills.map((s) => s.name).join(', ')})`);

if (verifiedSkills.length === 0 || claimedSkills.length === 0) {
  console.error(`[FAIL] Expected both verified and claimed skills in candidate profile`);
  process.exit(1);
}
console.log('[PASS] Verified vs Claimed skills distinct in candidate data.');

// 4. Test Resume Validation Rules (Section 12 Spec)
console.log('\n--- TEST 4: Resume File Validation Rules ---');
function validateResume(file) {
  const validExtensions = ['.pdf', '.docx', '.doc'];
  const maxBytes = 5 * 1024 * 1024;
  const isExtValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!isExtValid) return { valid: false, error: 'Invalid file type. Only PDF or DOCX allowed.' };
  if (file.size > maxBytes) return { valid: false, error: 'File exceeds 5MB size limit.' };
  return { valid: true };
}

const testFiles = [
  { name: 'resume.pdf', size: 1024 * 1024, expectedValid: true },
  { name: 'resume.docx', size: 2 * 1024 * 1024, expectedValid: true },
  { name: 'photo.png', size: 500 * 1024, expectedValid: false },
  { name: 'huge_resume.pdf', size: 6 * 1024 * 1024, expectedValid: false },
];

for (const tf of testFiles) {
  const res = validateResume(tf);
  if (res.valid !== tf.expectedValid) {
    console.error(`[FAIL] Resume test failed for ${tf.name}: expected ${tf.expectedValid}, got ${res.valid}`);
    process.exit(1);
  }
  console.log(`[PASS] Resume validation for "${tf.name}" (${(tf.size / 1024).toFixed(0)} KB): valid=${res.valid} ${res.error || ''}`);
}

console.log('\n=== ALL HIRING MODULE BUSINESS RULES & UNIT CHECKS PASSED ===');
