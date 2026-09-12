import { Router } from 'express';
import { db } from '../db';
import {
  users, profiles, skills, candidateSkills, auditLogs,
  teams, notifications, projects,
} from '../db/schema';
import { eq, desc, count, and } from 'drizzle-orm';
import { AuditService } from '../services/audit.service';
import { CanonicalSkillService, slugify } from '../services/canonicalSkill.service';

export const adminRouter = Router();

// GET /api/admin/stats - Overview metrics
adminRouter.get('/stats', async (_req, res) => {
  try {
    const [userCount] = await db.select({ val: count() }).from(users);
    const [verifiedCount] = await db
      .select({ val: count() })
      .from(candidateSkills)
      .where(eq(candidateSkills.verificationStatus, 'VERIFIED'));
    const [teamCount] = await db.select({ val: count() }).from(teams);
    const [auditCount] = await db.select({ val: count() }).from(auditLogs);
    const [skillsCount] = await db.select({ val: count() }).from(skills);

    res.json({
      stats: {
        totalUsers: Number(userCount?.val || 0),
        verifiedSkills: Number(verifiedCount?.val || 0),
        totalTeams: Number(teamCount?.val || 0),
        totalAuditLogs: Number(auditCount?.val || 0),
        canonicalSkills: Number(skillsCount?.val || 0),
      },
    });
  } catch (err: any) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/audit-logs - Append-only audit log stream
adminRouter.get('/audit-logs', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;

    const logs = await db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.createdAt)],
      limit,
      offset,
    });

    res.json({ logs });
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /api/admin/skills - All canonical skills
adminRouter.get('/skills', async (_req, res) => {
  try {
    const allSkills = await CanonicalSkillService.listCanonical();
    res.json({ skills: allSkills });
  } catch (err: any) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// POST /api/admin/skills - Register new canonical skill
adminRouter.post('/skills', async (req, res) => {
  try {
    const { name, category, aliases = [], description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const slug = slugify(name);
    const [created] = await db.insert(skills).values({
      name: name.trim(),
      slug,
      category: category || 'General',
      aliases,
      description: description || null,
      status: 'active',
    }).returning();

    await AuditService.record({
      actorId: (req as any).user?.id || null,
      action: 'CANONICAL_SKILL_CREATED',
      entityType: 'SKILL',
      entityId: created.id,
      details: { name: created.name, slug: created.slug, aliases },
    });

    res.status(201).json({ success: true, skill: created });
  } catch (err: any) {
    console.error('Error creating canonical skill:', err);
    res.status(500).json({ error: 'Failed to create canonical skill' });
  }
});

// GET /api/admin/verifications - Review queue
adminRouter.get('/verifications', async (_req, res) => {
  try {
    const reviews = await db
      .select({
        candidateSkill: candidateSkills,
        skill: skills,
        user: users,
        profile: profiles,
      })
      .from(candidateSkills)
      .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
      .innerJoin(users, eq(candidateSkills.userId, users.id))
      .innerJoin(profiles, eq(candidateSkills.userId, profiles.userId))
      .orderBy(desc(candidateSkills.createdAt))
      .limit(50);

    res.json({ verifications: reviews });
  } catch (err: any) {
    console.error('Error fetching verification queue:', err);
    res.status(500).json({ error: 'Failed to fetch verification queue' });
  }
});

// POST /api/admin/verifications/:id/review - Review and moderate claim
adminRouter.post('/verifications/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, score, notes } = req.body; // action: 'APPROVE' | 'REJECT' | 'REVOKE'

    let newStatus: 'VERIFIED' | 'REVOKED' | 'ASSESSMENT_FAILED' = 'VERIFIED';
    if (action === 'REVOKE') newStatus = 'REVOKED';
    else if (action === 'REJECT') newStatus = 'ASSESSMENT_FAILED';

    const [updated] = await db
      .update(candidateSkills)
      .set({
        verificationStatus: newStatus,
        verifiedScore: score ? Number(score) : (newStatus === 'VERIFIED' ? 90 : 40),
        evidenceNotes: notes || null,
        lastVerifiedAt: new Date(),
      })
      .where(eq(candidateSkills.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Candidate skill not found' });
    }

    // Record audit log
    await AuditService.record({
      actorId: (req as any).user?.id || null,
      action: `SKILL_VERIFICATION_${action}`,
      entityType: 'CANDIDATE_SKILL',
      entityId: updated.id,
      details: { newStatus, score, notes },
    });

    // Notify candidate
    await db.insert(notifications).values({
      userId: updated.userId,
      type: 'VERIFICATION_RESULT',
      title: `Skill Verification ${action === 'APPROVE' ? 'Approved' : action === 'REVOKE' ? 'Revoked' : 'Rejected'}`,
      message: `Your verification status was updated to ${newStatus}${notes ? `: ${notes}` : ''}`,
      actionUrl: '/profile',
      metadata: { candidateSkillId: updated.id, status: newStatus },
      isRead: false,
    });

    res.json({ success: true, candidateSkill: updated });
  } catch (err: any) {
    console.error('Error moderating verification claim:', err);
    res.status(500).json({ error: 'Failed to moderate verification claim' });
  }
});
