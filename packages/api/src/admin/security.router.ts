import { Router } from 'express';
import { db } from '../db';
import { users, profiles, candidateSkills, skills, organizations, auditLogs, systemIncidents } from '../db/schema';
import { eq, desc, count, ilike, or, and, sql } from 'drizzle-orm';
import { requireAdmin } from '../middleware/auth';

export const adminSecurityRouter = Router();

// ─── 1. SECURITY OVERVIEW METRICS (§8) ───────────────────────────────────────
adminSecurityRouter.get('/overview', async (req, res, next) => {
  const guard = await requireAdmin('support_admin');
  return guard(req, res, next);
}, async (_req, res) => {
  try {
    const [totalUsers] = await db.select({ val: count() }).from(users);
    const [candidateCount] = await db.select({ val: count() }).from(users).where(eq(users.role, 'candidate'));
    const [recruiterCount] = await db.select({ val: count() }).from(users).where(eq(users.role, 'recruiter'));
    const [organizerCount] = await db.select({ val: count() }).from(users).where(eq(users.role, 'organizer'));

    // Verification state metrics
    const [pendingUsers] = await db.select({ val: count() }).from(users).where(eq(users.verificationStatus, 'PENDING'));
    const [suspendedUsers] = await db.select({ val: count() }).from(users).where(eq(users.status, 'suspended'));
    const [pendingSkillReviews] = await db.select({ val: count() }).from(candidateSkills).where(eq(candidateSkills.verificationStatus, 'UNDER_REVIEW'));

    // Security alerts / incidents
    const [alertsCount] = await db.select({ val: count() }).from(auditLogs).where(
      or(
        eq(auditLogs.action, 'ADMIN_LOGIN_FAILED'),
        eq(auditLogs.action, 'SECURITY_ALERT'),
        eq(auditLogs.action, 'INTEGRITY_ANOMALY')
      )
    );

    // Recent critical audit events
    const recentAuditLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8);

    res.json({
      metrics: {
        totalUsers: totalUsers.val,
        candidateCount: candidateCount.val,
        recruiterCount: recruiterCount.val,
        organizerCount: organizerCount.val,
        pendingVerifications: pendingUsers.val + pendingSkillReviews.val,
        suspendedUsers: suspendedUsers.val,
        securityAlerts: alertsCount.val,
      },
      recentAuditLogs,
    });
  } catch (err: any) {
    console.error('Security overview error:', err);
    res.status(500).json({ error: 'Failed to fetch security metrics' });
  }
});

// ─── 2. USER SECURITY DIRECTORY (§8) ─────────────────────────────────────────
adminSecurityRouter.get('/users', async (req, res, next) => {
  const guard = await requireAdmin('support_admin');
  return guard(req, res, next);
}, async (req, res) => {
  try {
    const { role, status, search, limit = '50', offset = '0' } = req.query;

    const conditions: any[] = [];
    if (role && typeof role === 'string' && role !== 'all') {
      conditions.push(eq(users.role, role as any));
    }
    if (status && typeof status === 'string' && status !== 'all') {
      conditions.push(eq(users.status, status));
    }
    if (search && typeof search === 'string') {
      conditions.push(or(ilike(users.email, `%${search}%`), ilike(users.publicId, `%${search}%`)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const userList = await db.select({
      id: users.id,
      publicId: users.publicId,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      profileCompleted: users.profileCompleted,
      verificationStatus: users.verificationStatus,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      organizationName: users.organizationName,
      jobTitle: users.jobTitle,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(Math.min(parseInt(limit as string) || 50, 100))
    .offset(parseInt(offset as string) || 0);

    res.json({ users: userList });
  } catch (err: any) {
    console.error('Get security users error:', err);
    res.status(500).json({ error: 'Failed to query user records' });
  }
});

// ─── 3. USER STATUS & SUSPENSION CONTROL (§8) ────────────────────────────────
adminSecurityRouter.post('/users/:id/status', async (req, res, next) => {
  const guard = await requireAdmin('security_admin');
  return guard(req, res, next);
}, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "active" or "suspended"' });
    }
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ error: 'A justification reason (min 5 characters) is required for audit logs' });
    }

    const targetUser = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!targetUser) return res.status(404).json({ error: 'Target user account not found' });

    const previousStatus = targetUser.status;
    await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id));

    // Immutable Audit Log write
    await db.insert(auditLogs).values({
      actorId: req.admin!.id,
      actorEmail: req.admin!.email,
      actorRole: req.admin!.adminRole,
      action: status === 'suspended' ? 'USER_ACCOUNT_SUSPENDED' : 'USER_ACCOUNT_REACTIVATED',
      entityType: 'USER',
      entityId: id,
      details: { previousStatus, newStatus: status, targetEmail: targetUser.email, targetRole: targetUser.role },
      reason,
      ipAddress: req.ip,
    });

    res.json({
      message: `User account successfully updated to ${status}.`,
      user: { id, status },
    });
  } catch (err: any) {
    console.error('Update user status error:', err);
    res.status(500).json({ error: 'Failed to update user security status' });
  }
});

// ─── 4. VERIFICATION QUEUE & DECISIONS (§8) ──────────────────────────────────
adminSecurityRouter.get('/verification-queue', async (req, res, next) => {
  const guard = await requireAdmin('verification_admin');
  return guard(req, res, next);
}, async (_req, res) => {
  try {
    const skillReviews = await db.select({
      id: candidateSkills.id,
      userId: candidateSkills.userId,
      skillId: candidateSkills.skillId,
      skillName: skills.name,
      candidateEmail: users.email,
      claimedLevel: candidateSkills.claimedLevel,
      verificationStatus: candidateSkills.verificationStatus,
      evidenceNotes: candidateSkills.evidenceNotes,
      evidenceUrl: candidateSkills.evidenceUrl,
      createdAt: candidateSkills.createdAt,
    })
    .from(candidateSkills)
    .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
    .innerJoin(users, eq(candidateSkills.userId, users.id))
    .where(or(
      eq(candidateSkills.verificationStatus, 'UNDER_REVIEW'),
      eq(candidateSkills.verificationStatus, 'PENDING')
    ))
    .orderBy(desc(candidateSkills.createdAt))
    .limit(20);

    const orgReviews = await db.select().from(organizations).where(eq(organizations.verificationStatus, 'PENDING')).limit(10);

    res.json({ skillReviews, orgReviews });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch verification queue' });
  }
});

adminSecurityRouter.post('/verify', async (req, res, next) => {
  const guard = await requireAdmin('verification_admin');
  return guard(req, res, next);
}, async (req, res) => {
  try {
    const { type, targetId, decision, reason } = req.body;
    if (!['candidate_skill', 'organization'].includes(type)) {
      return res.status(400).json({ error: 'Type must be candidate_skill or organization' });
    }
    if (!['VERIFIED', 'REJECTED', 'REVOKED'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be VERIFIED, REJECTED, or REVOKED' });
    }

    if (type === 'candidate_skill') {
      await db.update(candidateSkills).set({
        verificationStatus: decision as any,
        lastVerifiedAt: decision === 'VERIFIED' ? new Date() : null,
      }).where(eq(candidateSkills.id, targetId));
    } else {
      await db.update(organizations).set({
        verificationStatus: decision,
        reviewedBy: req.admin!.id as any,
        reviewedAt: new Date(),
      }).where(eq(organizations.id, targetId));
    }

    // Immutable Audit Log write
    await db.insert(auditLogs).values({
      actorId: req.admin!.id,
      actorEmail: req.admin!.email,
      actorRole: req.admin!.adminRole,
      action: `VERIFICATION_${decision}`,
      entityType: type.toUpperCase(),
      entityId: targetId,
      details: { decision, type },
      reason: reason || 'Reviewed by verification operator',
      ipAddress: req.ip,
    });

    res.json({ message: `Verification recorded as ${decision}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record verification decision' });
  }
});

// ─── 5. IMMUTABLE AUDIT LOGS (§8) ────────────────────────────────────────────
adminSecurityRouter.get('/audit-logs', async (req, res, next) => {
  const guard = await requireAdmin('security_admin');
  return guard(req, res, next);
}, async (req, res) => {
  try {
    const { action, entityType, limit = '50', offset = '0' } = req.query;

    const conditions: any[] = [];
    if (action && typeof action === 'string') {
      conditions.push(eq(auditLogs.action, action));
    }
    if (entityType && typeof entityType === 'string') {
      conditions.push(eq(auditLogs.entityType, entityType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db.select().from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(Math.min(parseInt(limit as string) || 50, 100))
      .offset(parseInt(offset as string) || 0);

    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});
