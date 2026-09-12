import { Router } from 'express';
import { db } from '../db';
import {
  teams, teamMembers, teamRequests, hackathonParticipants,
  candidateSkills, skills, profiles, users, assessmentSessions, assessments,
  notifications,
} from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { MatchingService } from '../services/matching.service';
import { AuditService } from '../services/audit.service';

export const teamsRouter = Router();

// ─── Teams CRUD ───────────────────────────────────────────────────────────────

// POST /api/teams
teamsRouter.post('/', requireAuth, async (req, res) => {
  const { hackathonId, name, description, requiredSkills, maxMembers } = req.body;
  const [team] = await db.insert(teams).values({
    hackathonId, name, description, ownerId: req.user!.id,
    requiredSkills: requiredSkills ?? [], maxMembers: maxMembers ?? 5,
  }).returning();
  await db.insert(teamMembers).values({ teamId: team.id, userId: req.user!.id, role: 'Team Lead' });
  res.status(201).json(team);
});

// GET /api/teams/:id
teamsRouter.get('/:id', requireAuth, async (req, res) => {
  const team = await db.query.teams.findFirst({ where: eq(teams.id, req.params.id) });
  if (!team) return res.status(404).json({ error: 'Not found' });
  const members = await db.query.teamMembers.findMany({ where: eq(teamMembers.teamId, team.id) });
  res.json({ ...team, members });
});

// GET /api/teams/hackathon/:hackathonId — all teams in a hackathon
teamsRouter.get('/hackathon/:hackathonId', requireAuth, async (req, res) => {
  const rows = await db.query.teams.findMany({ where: eq(teams.hackathonId, req.params.hackathonId) });
  res.json(rows);
});

// ─── Discover Candidates (Matching Algorithm) ─────────────────────────────────

// GET /api/teams/:id/discover — ranked candidates for a team
teamsRouter.get('/:id/discover', requireAuth, async (req, res) => {
  const team = await db.query.teams.findFirst({ where: eq(teams.id, req.params.id) });
  if (!team) return res.status(404).json({ error: 'Team not found' });

  // Current team member skill coverage
  const memberRows = await db.query.teamMembers.findMany({ where: eq(teamMembers.teamId, team.id) });
  const memberIds = memberRows.map(m => m.userId);

  // Get all participants in the hackathon who are not yet in this team
  const participants = await db.query.hackathonParticipants.findMany({
    where: eq(hackathonParticipants.hackathonId, team.hackathonId),
  });
  const candidateIds = participants.map(p => p.userId).filter(id => !memberIds.includes(id));
  if (candidateIds.length === 0) return res.json([]);

  // Get required skill IDs
  const requiredSkillNames: string[] = Array.isArray(team.requiredSkills) ? team.requiredSkills : [];
  const allSkills = requiredSkillNames.length > 0
    ? await db.query.skills.findMany({ where: inArray(skills.name, requiredSkillNames) })
    : [];
  const requiredSkillIds = allSkills.map(s => s.id);

  // Build team's existing skill coverage
  const teamSkillRows = memberIds.length > 0
    ? await db.select().from(candidateSkills)
        .where(and(inArray(candidateSkills.userId, memberIds), eq(candidateSkills.verificationStatus, 'VERIFIED')))
    : [];
  const coveredSkillIds = new Set(teamSkillRows.map(r => r.skillId));

  // Score each candidate
  const results = await Promise.all(candidateIds.map(async (candidateId) => {
    const candSkills = await db.query.candidateSkills.findMany({
      where: eq(candidateSkills.userId, candidateId),
    });

    let rawScore = 0;
    const explanations: string[] = [];
    const skillBreakdown: { skill: string; score: number | null; verified: boolean; matched: boolean }[] = [];

    for (const reqSkillId of requiredSkillIds) {
      const reqSkill = allSkills.find(s => s.id === reqSkillId)!;
      const candSkill = candSkills.find(cs => cs.skillId === reqSkillId);

      if (candSkill?.verificationStatus === 'VERIFIED' && candSkill.verifiedScore) {
        const contribution = candSkill.verifiedScore;
        rawScore += contribution;
        const fills = !coveredSkillIds.has(reqSkillId);
        if (fills) explanations.push(`✓ ${reqSkill.name} fills a gap (${candSkill.verifiedScore}/100, Verified)`);
        else explanations.push(`✓ ${reqSkill.name} matched (${candSkill.verifiedScore}/100, Verified)`);
        skillBreakdown.push({ skill: reqSkill.name, score: candSkill.verifiedScore, verified: true, matched: true });
      } else if (candSkill) {
        rawScore += 30; // low weight for unverified claims
        explanations.push(`~ ${reqSkill.name} claimed (unverified)`);
        skillBreakdown.push({ skill: reqSkill.name, score: null, verified: false, matched: true });
      } else {
        skillBreakdown.push({ skill: reqSkill.name, score: null, verified: false, matched: false });
      }
    }

    // Complementarity bonus — fills a gap not covered by existing members
    const fills = skillBreakdown.filter(s => s.matched && !coveredSkillIds.has(requiredSkillIds[skillBreakdown.indexOf(s)])).length;
    const complementarityBonus = fills * 5;
    const matchScore = Math.min(
      requiredSkillIds.length > 0
        ? Math.round(rawScore / requiredSkillIds.length + complementarityBonus)
        : 50,
      100
    );

    const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, candidateId) });
    return { userId: candidateId, profile, matchScore, explanations, skillBreakdown };
  }));

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);
  res.json(results);
});

// ─── Team Requests ────────────────────────────────────────────────────────────

// POST /api/teams/requests/invite — team lead invites candidate
teamsRouter.post('/requests/invite', requireAuth, async (req, res) => {
  const { teamId, toUserId, message } = req.body;
  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) });
  if (!team || team.ownerId !== req.user!.id) return res.status(403).json({ error: 'Not team owner' });

  const [request] = await db.insert(teamRequests).values({
    teamId, fromUserId: req.user!.id, toUserId, direction: 'invite', message,
  }).returning();
  res.status(201).json(request);
});

// POST /api/teams/requests/apply — candidate applies to team
teamsRouter.post('/requests/apply', requireAuth, async (req, res) => {
  const { teamId, message } = req.body;
  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) });
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const [request] = await db.insert(teamRequests).values({
    teamId, fromUserId: req.user!.id, toUserId: team.ownerId, direction: 'application', message,
  }).returning();
  res.status(201).json(request);
});

// GET /api/teams/requests/mine — incoming and outgoing requests for current user
teamsRouter.get('/requests/mine', requireAuth, async (req, res) => {
  const incoming = await db.query.teamRequests.findMany({
    where: and(eq(teamRequests.toUserId, req.user!.id), eq(teamRequests.status, 'pending')),
  });
  const outgoing = await db.query.teamRequests.findMany({
    where: and(eq(teamRequests.fromUserId, req.user!.id), eq(teamRequests.status, 'pending')),
  });
  res.json({ incoming, outgoing });
});

// PATCH /api/teams/requests/:id/respond — accept or reject
teamsRouter.patch('/requests/:id/respond', requireAuth, async (req, res) => {
  const { action } = req.body; // 'accept' | 'reject'
  const request = await db.query.teamRequests.findFirst({ where: eq(teamRequests.id, req.params.id) });
  if (!request) return res.status(404).json({ error: 'Not found' });
  if (request.toUserId !== req.user!.id && request.fromUserId !== req.user!.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const status = action === 'accept' ? 'accepted' : 'rejected';
  await db.update(teamRequests).set({ status, updatedAt: new Date() }).where(eq(teamRequests.id, request.id));

  if (action === 'accept') {
    // Add member to team
    const candidateId = request.direction === 'invite' ? request.toUserId : request.fromUserId;
    await db.insert(teamMembers).values({ teamId: request.teamId, userId: candidateId });
  }

  res.json({ status });
});

// POST /api/teams/requests/:id/challenge — trigger a verification challenge
teamsRouter.post('/requests/:id/challenge', requireAuth, async (req, res) => {
  const { assessmentId } = req.body;
  const request = await db.query.teamRequests.findFirst({ where: eq(teamRequests.id, req.params.id) });
  if (!request) return res.status(404).json({ error: 'Not found' });

  // Create a session for the candidate
  const assessment = await db.query.assessments.findFirst({ where: eq(assessments.id, assessmentId) });
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

  const candidateId = request.direction === 'invite' ? request.toUserId : request.fromUserId;
  const expiresAt = new Date(Date.now() + (assessment.durationMinutes + 5) * 60_000);
  const [session] = await db.insert(assessmentSessions).values({
    userId: candidateId, assessmentId, status: 'NOT_STARTED', expiresAt,
  }).returning();

  // Link session to request
  await db.update(teamRequests)
    .set({ verificationSessionId: session.id })
    .where(eq(teamRequests.id, request.id));

  res.status(201).json({ sessionId: session.id });
});

// ─── Hackathon Buddy & Explainable Teammate Matching ──────────────────────────

// POST /api/teams/find-teammates
teamsRouter.post('/find-teammates', async (req, res) => {
  try {
    const currentUserId = (req as any).user?.id;
    const {
      requiredSkills,
      optionalSkills,
      minCredibilityScore,
      verifiedOnly,
      searchQuery,
      experienceLevel,
      locationPreference,
      hackathonId,
    } = req.body;

    const matches = await MatchingService.findMatches({
      currentUserId,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      optionalSkills: Array.isArray(optionalSkills) ? optionalSkills : [],
      minCredibilityScore: Number(minCredibilityScore) || 0,
      verifiedOnly: Boolean(verifiedOnly),
      searchQuery: typeof searchQuery === 'string' ? searchQuery : undefined,
      experienceLevel: typeof experienceLevel === 'string' ? experienceLevel : undefined,
      locationPreference: typeof locationPreference === 'string' ? locationPreference : undefined,
      hackathonId: typeof hackathonId === 'string' ? hackathonId : undefined,
    });

    res.json({ matches });
  } catch (err: any) {
    console.error('Error in find-teammates:', err);
    res.status(500).json({ error: 'Failed to find teammates' });
  }
});

// POST /api/teams/direct-invite
teamsRouter.post('/direct-invite', async (req, res) => {
  try {
    let fromUserId = (req as any).user?.id;
    if (!fromUserId) {
      const defaultUser = await db.query.users.findFirst({ where: eq(users.email, 'alex@demo.local') });
      fromUserId = defaultUser?.id;
    }
    const { candidateId, teamId, message } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }

    let targetTeamId = teamId;
    if (!targetTeamId) {
      const owned = await db.query.teams.findFirst({ where: eq(teams.ownerId, fromUserId) });
      if (owned) {
        targetTeamId = owned.id;
      } else {
        const anyTeam = await db.query.teams.findFirst();
        targetTeamId = anyTeam?.id;
      }
    }

    if (!targetTeamId) {
      return res.status(400).json({ error: 'No active team found to send invite from' });
    }

    const [request] = await db.insert(teamRequests).values({
      teamId: targetTeamId,
      fromUserId,
      toUserId: candidateId,
      direction: 'invite',
      status: 'pending',
      message: message || 'We would love to have you on our hackathon team based on your verified skills!',
    }).returning();

    // In-app notification
    await db.insert(notifications).values({
      userId: candidateId,
      type: 'TEAM_INVITE',
      title: 'Hackathon Team Invitation',
      message: message || 'You received an invitation to join a hackathon team!',
      actionUrl: '/teams/requests',
      metadata: { teamRequestId: request.id, teamId: targetTeamId },
      isRead: false,
    });

    // Audit log
    await AuditService.record({
      actorId: fromUserId,
      action: 'TEAM_INVITE_SENT',
      entityType: 'TEAM_REQUEST',
      entityId: request.id,
      details: { toUserId: candidateId, teamId: targetTeamId },
    });

    res.status(201).json({ success: true, request });
  } catch (err: any) {
    console.error('Error sending direct invite:', err);
    res.status(500).json({ error: 'Failed to send direct invite' });
  }
});

// POST /api/teams/direct-challenge
teamsRouter.post('/direct-challenge', async (req, res) => {
  try {
    let fromUserId = (req as any).user?.id;
    if (!fromUserId) {
      const defaultUser = await db.query.users.findFirst({ where: eq(users.email, 'alex@demo.local') });
      fromUserId = defaultUser?.id;
    }
    const { candidateId, skillName, message } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }

    const [notif] = await db.insert(notifications).values({
      userId: candidateId,
      type: 'VERIFICATION_REQUEST',
      title: `Verification Challenge: ${skillName || 'Skill Competency'}`,
      message: message || `A team has requested proof of competency in ${skillName || 'your claimed skills'}.`,
      actionUrl: '/assessments',
      metadata: { skillName, requestedBy: fromUserId },
      isRead: false,
    }).returning();

    await AuditService.record({
      actorId: fromUserId,
      action: 'VERIFICATION_CHALLENGE_REQUESTED',
      entityType: 'NOTIFICATION',
      entityId: notif.id,
      details: { targetCandidateId: candidateId, skillName },
    });

    res.status(201).json({ success: true, challengeSent: true });
  } catch (err: any) {
    console.error('Error sending direct challenge:', err);
    res.status(500).json({ error: 'Failed to send challenge' });
  }
});

