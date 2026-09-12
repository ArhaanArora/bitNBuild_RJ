import { Router } from 'express';
import { db } from '../db';
import { profiles, candidateSkills, skills, assessmentSessions, projects, users } from '../db/schema';
import { eq, gte, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

export const verificationRouter = Router();

// GET /api/verification/profile/:userId — full verified skill card (for recruiters, team leads)
verificationRouter.get('/profile/:userId', requireAuth, async (req, res) => {
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, req.params.userId) });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const candSkills = await db.select({ cs: candidateSkills, skill: skills })
    .from(candidateSkills)
    .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
    .where(eq(candidateSkills.userId, req.params.userId));

  const projs = await db.query.projects.findMany({ where: eq(projects.userId, req.params.userId) });

  const sessions = await db.query.assessmentSessions.findMany({
    where: and(
      eq(assessmentSessions.userId, req.params.userId),
      eq(assessmentSessions.status, 'SUBMITTED'),
    ),
  });

  // Recruiter candidate search support — filter by min score
  const minScore = req.query.minScore ? Number(req.query.minScore) : 0;
  const filteredSkills = candSkills
    .filter(r => r.cs.verificationStatus === 'VERIFIED' && (r.cs.verifiedScore ?? 0) >= minScore)
    .map(r => ({
      skillName: r.skill.name,
      category: r.skill.category,
      claimedLevel: r.cs.claimedLevel,
      verificationStatus: r.cs.verificationStatus,
      verifiedScore: r.cs.verifiedScore,
      integrityScore: r.cs.integrityScore,
      lastVerifiedAt: r.cs.lastVerifiedAt,
    }));

  res.json({
    profile,
    verifiedSkills: filteredSkills,
    allSkills: candSkills.map(r => ({
      skillName: r.skill.name,
      verificationStatus: r.cs.verificationStatus,
      verifiedScore: r.cs.verifiedScore,
    })),
    projects: projs,
    assessmentCount: sessions.length,
    latestIntegrityScore: sessions.sort((a, b) =>
      (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0))[0]?.integrityScore ?? null,
  });
});

// GET /api/verification/search — recruiter search: filter candidates by verified skill + min score
verificationRouter.get('/search', requireAuth, async (req, res) => {
  const { skill, minScore } = req.query;
  if (!skill) return res.status(400).json({ error: 'skill query param required' });

  const skill_row = await db.query.skills.findFirst({ where: eq(skills.name, skill as string) });
  if (!skill_row) return res.json([]);

  const rows = await db.select({ cs: candidateSkills, profile: profiles })
    .from(candidateSkills)
    .innerJoin(profiles, eq(candidateSkills.userId, profiles.userId))
    .where(
      and(
        eq(candidateSkills.skillId, skill_row.id),
        eq(candidateSkills.verificationStatus, 'VERIFIED'),
        minScore ? gte(candidateSkills.verifiedScore, Number(minScore)) : undefined,
      )
    );

  res.json(rows.map(r => ({
    userId: r.cs.userId,
    profile: r.profile,
    verifiedScore: r.cs.verifiedScore,
    integrityScore: r.cs.integrityScore,
    lastVerifiedAt: r.cs.lastVerifiedAt,
  })));
});
