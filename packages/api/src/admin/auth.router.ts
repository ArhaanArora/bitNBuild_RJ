import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { admins, auditLogs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '../middleware/auth';

export const adminAuthRouter = Router();

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signAdminToken(admin: { id: string; email: string; adminRole: string; name: string }) {
  return jwt.sign(
    { id: admin.id, email: admin.email, adminRole: admin.adminRole, name: admin.name, isAdmin: true },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
}

// POST /api/admin/auth/login
adminAuthRouter.post('/login', async (req, res) => {
  try {
    const parsed = adminLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Valid email and password required' });
    }

    const { email, password } = parsed.data;
    const admin = await db.query.admins.findFirst({
      where: eq(admins.email, email.toLowerCase()),
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials or account not authorized.' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'This admin account has been suspended or revoked.' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      // Record failed security attempt
      await db.insert(auditLogs).values({
        actorEmail: email,
        actorRole: 'ANONYMOUS_ADMIN_ATTEMPT',
        action: 'ADMIN_LOGIN_FAILED',
        entityType: 'ADMIN',
        entityId: admin.id,
        reason: 'Failed password verification attempt',
        ipAddress: req.ip,
      });
      return res.status(401).json({ error: 'Invalid admin credentials or account not authorized.' });
    }

    // Update lastLoginAt
    await db.update(admins).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(admins.id, admin.id));

    // Audit log successful login
    await db.insert(auditLogs).values({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.adminRole,
      action: 'ADMIN_LOGIN_SUCCESS',
      entityType: 'ADMIN',
      entityId: admin.id,
      reason: 'Admin Security Console session opened',
      ipAddress: req.ip,
    });

    const token = signAdminToken(admin);

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        adminRole: admin.adminRole,
        status: admin.status,
      },
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error during admin authentication' });
  }
});

// GET /api/admin/auth/me
adminAuthRouter.get('/me', async (req, res, next) => {
  const guard = await requireAdmin('support_admin');
  return guard(req, res, next);
}, async (req, res) => {
  res.json({ admin: req.admin });
});
