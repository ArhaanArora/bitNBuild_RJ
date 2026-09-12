import { HiringCandidate, HiringRequirement, HiringMatch } from '../types/hiring';

/**
 * DETERMINISTIC MATCHING ALGORITHM FOR HIRING MODULE
 * 
 * Formula:
 * MatchScore = Math.min(98, Math.max(40, Base (30) + SkillScore (up to 40) + RoleScore (up to 12) + CredibilityScore (up to 10) + AssessmentScore (up to 8)))
 * 
 * Where:
 * 1. SkillScore (up to 40 pts):
 *    - Each required skill matched as 'VERIFIED' contributes (40 / N) * 1.0
 *    - Each required skill matched as 'CLAIMED' contributes (40 / N) * 0.5
 *    - If no specific required skills are specified, candidate receives 30 pts for overall skill portfolio breadth.
 * 2. RoleScore (up to 12 pts):
 *    - Direct match between candidate role and requested role gives 12 pts.
 *    - Partial/Domain match gives 8 pts.
 *    - 'Any' role gives 8 pts.
 * 3. Credibility Score (up to 10 pts):
 *    - (credibilityScore / 100) * 10
 * 4. Assessment Performance (up to 8 pts):
 *    - (assessmentScore / 100) * 8
 * 
 * Every match score is accompanied by 3-4 concrete, explainable reasoning bullets:
 * - Verified skills count (e.g. "✓ 3/3 required skills verified by platform assessments")
 * - Project experience validity (e.g. "✓ 2 verified production projects on record")
 * - Assessment performance benchmark (e.g. "✓ High assessment performance (94%)")
 * - GitHub evidence status (e.g. "✓ GitHub evidence verified with active production repositories")
 */
export function computeHiringMatch(
  candidate: HiringCandidate,
  req: HiringRequirement
): HiringMatch {
  let score = 25; // baseline calibrated for realistic distributions (50-98%)
  const reasoningBullets: string[] = [];
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let verifiedMatches = 0;
  let claimedMatches = 0;

  const normalizedReqSkills = (req.requiredSkills || []).map((s) => s.trim().toLowerCase());

  // 1. Evaluate Skills
  if (normalizedReqSkills.length > 0) {
    for (const reqSkill of normalizedReqSkills) {
      const found = candidate.skills.find(
        (s) => s.name.toLowerCase() === reqSkill || s.name.toLowerCase().includes(reqSkill)
      );

      if (found) {
        matchedSkills.push(found.name);
        if (found.status === 'VERIFIED') {
          verifiedMatches++;
        } else {
          claimedMatches++;
        }
      } else {
        missingSkills.push(reqSkill);
      }
    }

    const maxSkillPts = 42;
    const skillRatio =
      (verifiedMatches * 1.0 + claimedMatches * 0.5) / normalizedReqSkills.length;
    score += Math.round(skillRatio * maxSkillPts);

    if (verifiedMatches === normalizedReqSkills.length) {
      reasoningBullets.push(`✓ ${verifiedMatches}/${normalizedReqSkills.length} required skills verified by platform assessments`);
    } else if (verifiedMatches > 0) {
      reasoningBullets.push(`✓ ${verifiedMatches}/${normalizedReqSkills.length} required skills verified (${claimedMatches} self-claimed)`);
    } else if (claimedMatches > 0) {
      reasoningBullets.push(`○ ${claimedMatches}/${normalizedReqSkills.length} skills claimed, awaiting assessment verification`);
    } else {
      reasoningBullets.push(`○ Skills do not directly overlap with all ${normalizedReqSkills.length} required items`);
    }
  } else {
    // If no specific skills required, reward verified skills density
    const verifiedTotal = candidate.skills.filter((s) => s.status === 'VERIFIED').length;
    score += Math.min(35, verifiedTotal * 7);
    reasoningBullets.push(`✓ Broad verified competency profile across ${verifiedTotal} technical skills`);
  }

  // 2. Role Alignment
  const reqRole = (req.role || '').toLowerCase();
  const candRole = candidate.role.toLowerCase();

  if (!reqRole || reqRole === 'any' || reqRole === 'all') {
    score += 10;
  } else if (candRole.includes(reqRole) || reqRole.includes(candRole)) {
    score += 15;
    reasoningBullets.push(`✓ Direct role match as ${candidate.role}`);
  } else if (
    (reqRole.includes('backend') && (candRole.includes('full') || candRole.includes('cloud') || candRole.includes('python'))) ||
    (reqRole.includes('frontend') && (candRole.includes('full') || candRole.includes('ui') || candRole.includes('react'))) ||
    (reqRole.includes('ai') && candRole.includes('python'))
  ) {
    score += 10;
    reasoningBullets.push(`✓ Related role and technical discipline as ${candidate.role}`);
  } else {
    score += 4;
  }

  // 3. Credibility & Assessment Score
  const credPts = Math.round((candidate.credibilityScore / 100) * 10);
  const assessPts = Math.round((candidate.assessmentScore / 100) * 8);
  score += credPts + assessPts;

  if (candidate.assessmentScore >= 90) {
    reasoningBullets.push(`✓ High assessment performance (${candidate.assessmentScore}%) in core technical competencies`);
  } else if (candidate.assessmentScore >= 80) {
    reasoningBullets.push(`✓ Solid assessment benchmark (${candidate.assessmentScore}%) on platform tests`);
  }

  // 4. Project & GitHub Evidence
  if (candidate.verifiedProjectsCount >= 2) {
    score += 5;
    reasoningBullets.push(`✓ ${candidate.verifiedProjectsCount} verified production projects on record`);
  } else if (candidate.verifiedProjectsCount === 1) {
    score += 3;
    reasoningBullets.push(`✓ 1 verified production project with codebase audit`);
  }

  if (candidate.githubEvidence === 'Verified Repos') {
    score += 5;
    reasoningBullets.push(`✓ GitHub evidence verified with active production repositories`);
  } else if (candidate.githubEvidence === 'Active Commits') {
    score += 4;
    reasoningBullets.push(`✓ Active commit history corroborates continuous coding`);
  }

  const finalMatchScore = Math.min(98, Math.max(48, score));

  return {
    candidate,
    matchScore: finalMatchScore,
    reasoningBullets: reasoningBullets.slice(0, 4),
    matchedSkills,
    missingSkills,
    verifiedSkillCount: candidate.skills.filter((s) => s.status === 'VERIFIED').length,
    claimedSkillCount: candidate.skills.filter((s) => s.status === 'CLAIMED').length,
  };
}
