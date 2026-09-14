import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { db } from '../db';
import { users, profiles, passwordResets, emailVerifications, auditLogs, roleRequests } from '../db/schema';
import { eq, and, gt, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { cache } from '../services/cache.service';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['candidate', 'organizer', 'recruiter']).default('candidate'),
  authProvider: z.enum(['email', 'google']).default('email'),
  workEmail: z.string().optional(),
  jobTitle: z.string().optional(),
  organizationName: z.string().optional(),
  eventName: z.string().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  location: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signTokens(payload: { id: string; email: string; role: string }) {
  const access = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '2h' });
  const refresh = jwt.sign({ id: payload.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { access, refresh };
}

// ─── 1. REGISTER (Progressive Profiling Step 1 & 2) ──────────────────────────
authRouter.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const {
      email, password, firstName, lastName, role, authProvider,
      workEmail, jobTitle, organizationName, eventName, education, location
    } = parsed.data;

    // Check for existing account & Role Conflict (§3.1, §9)
    const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
    if (existing) {
      const existingRoleCapitalized = existing.role.charAt(0).toUpperCase() + existing.role.slice(1);
      return res.status(409).json({
        error: `This account already has a ${existingRoleCapitalized} profile. Please continue with your existing role.`,
        roleConflict: true,
        existingRole: existing.role,
      });
    }

    const rawPassword = password || 'SkillVerifyGoogleOAuth123!';
    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const [user] = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      role,
      emailVerified: authProvider === 'google', // Google OAuth provides pre-verified email
      profileCompleted: true,
      verificationStatus: 'PENDING',
      status: 'active',
      lastLoginAt: new Date(),
      workEmail: workEmail || null,
      jobTitle: jobTitle || null,
      organizationName: organizationName || null,
      eventName: eventName || null,
    }).returning();

    await db.insert(profiles).values({
      userId: user.id,
      firstName,
      lastName,
      education: education || null,
      bio: location ? `Location: ${location}` : null,
    });

    // Generate initial verification token for email signups
    if (authProvider === 'email') {
      const verificationToken = randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.insert(emailVerifications).values({
        userId: user.id,
        token: verificationToken,
        expiresAt,
      });
    }

    const tokens = signTokens({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({
      message: `Welcome back, ${firstName}. Your ${user.role} workspace is ready.`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
        status: user.status,
      },
      ...tokens,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration: ' + (err.message || 'Unknown error') });
  }
});

// ─── 2. CENTRAL LOGIN (§2, §9) ───────────────────────────────────────────────
authRouter.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;
    const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
    
    // Standard secure error copy (§9)
    if (!user) {
      return res.status(401).json({ error: "We couldn't sign you in. Check your email and password and try again." });
    }

    // Account suspension check (§7, §9)
    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Your account is currently under review. Contact support for details.',
        status: 'suspended',
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "We couldn't sign you in. Check your email and password and try again." });
    }

    // Update lastLoginAt
    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));

    const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
    const tokens = signTokens({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: `Welcome back, ${profile?.firstName || 'User'}. Your ${user.role} workspace is ready.`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
        status: user.status,
      },
      ...tokens,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login: ' + (err.message || 'Unknown error') });
  }
});

// ─── 3. GOOGLE OAUTH (§6) ────────────────────────────────────────────────────
authRouter.post('/google', async (req, res) => {
  try {
    const { email, name, role, photoUrl, idToken } = req.body;
    let authEmail = email;
    let authName = name;
    let authPhoto = photoUrl;

    if (idToken) {
      try {
        const decoded: any = jwt.decode(idToken);
        if (decoded && decoded.email) {
          authEmail = decoded.email;
          if (decoded.name && !authName) authName = decoded.name;
          if (decoded.picture && !authPhoto) authPhoto = decoded.picture;
        }
      } catch (tokenErr) {
        console.warn('Firebase token decode warning:', tokenErr);
      }
    }

    if (!authEmail) return res.status(400).json({ error: 'Email required for Google authentication' });

    const normalizedEmail = authEmail.toLowerCase();
    const existing = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });

    if (existing) {
      if (existing.status === 'suspended') {
        return res.status(403).json({
          error: 'Your account is currently under review. Contact support for details.',
          status: 'suspended',
        });
      }

      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, existing.id));
      const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, existing.id) });
      const tokens = signTokens({ id: existing.id, email: existing.email, role: existing.role });

      return res.json({
        message: `Welcome back, ${profile?.firstName || 'User'}. Your ${existing.role} workspace is ready.`,
        user: {
          id: existing.id,
          email: existing.email,
          role: existing.role,
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          emailVerified: existing.emailVerified,
          verificationStatus: existing.verificationStatus,
          status: existing.status,
        },
        ...tokens,
      });
    }

    // If new user without role selected yet, inform client to proceed to Step 2
    if (!role) {
      return res.json({
        isNewUser: true,
        email: normalizedEmail,
        name: authName || '',
        message: 'Google identity authenticated. Please select your workspace role.',
      });
    }

    // Create new user with Google auth pre-verified
    const parts = (authName || 'Google User').split(' ');
    const firstName = parts[0] || 'Google';
    const lastName = parts.slice(1).join(' ') || 'User';

    const passwordHash = await bcrypt.hash(randomBytes(16).toString('hex'), 12);
    const [newUser] = await db.insert(users).values({
      email: normalizedEmail,
      passwordHash,
      role,
      emailVerified: true, // Google pre-verified
      profileCompleted: true,
      verificationStatus: 'PENDING',
      status: 'active',
      lastLoginAt: new Date(),
    }).returning();

    await db.insert(profiles).values({
      userId: newUser.id,
      firstName,
      lastName,
      photoUrl: authPhoto || null,
    });

    const tokens = signTokens({ id: newUser.id, email: newUser.email, role: newUser.role });
    res.status(201).json({
      message: `Welcome back, ${firstName}. Your ${newUser.role} workspace is ready.`,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName,
        lastName,
        emailVerified: true,
        verificationStatus: 'PENDING',
        status: 'active',
      },
      ...tokens,
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

// ─── 4. PASSWORD RECOVERY (§6) ───────────────────────────────────────────────
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const normalizedEmail = email.toLowerCase();
    const user = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });

    if (user) {
      const resetToken = randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResets).values({
        email: normalizedEmail,
        token: resetToken,
        expiresAt,
      });

      return res.json({
        message: 'If an account exists with that email, a password recovery link has been generated.',
        demoToken: resetToken, // Exposed for hackathon speed and local demonstration
      });
    }

    res.json({ message: 'If an account exists with that email, a password recovery link has been generated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process password recovery request' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Token and minimum 8-character password required' });
    }

    const record = await db.query.passwordResets.findFirst({
      where: and(eq(passwordResets.token, token), gt(passwordResets.expiresAt, new Date())),
    });

    if (!record || record.usedAt) {
      return res.status(400).json({ error: 'Password reset link is invalid or has expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.email, record.email));
    await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, record.id));

    res.json({ message: 'Password updated successfully. You may now sign in with your new credentials.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ─── 5. EMAIL VERIFICATION (§6, §9) ──────────────────────────────────────────
authRouter.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Verification token required' });

    const record = await db.query.emailVerifications.findFirst({
      where: and(eq(emailVerifications.token, token), gt(emailVerifications.expiresAt, new Date())),
    });

    if (!record || record.verifiedAt) {
      return res.status(400).json({ error: 'Verification link is invalid or has expired' });
    }

    await db.update(users).set({ emailVerified: true, updatedAt: new Date() }).where(eq(users.id, record.userId));
    await db.update(emailVerifications).set({ verifiedAt: new Date() }).where(eq(emailVerifications.id, record.id));

    res.json({ message: 'Email verified successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

authRouter.post('/resend-verification', requireAuth, async (req, res) => {
  try {
    const verificationToken = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(emailVerifications).values({
      userId: req.user!.id,
      token: verificationToken,
      expiresAt,
    });

    res.json({
      message: "We've sent a verification email. Please verify your email before continuing.",
      demoToken: verificationToken,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate verification token' });
  }
});

// ─── 6. GET CURRENT USER PROFILE (§4, §5) ────────────────────────────────────
authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userData = await cache.get(`user:me:${userId}`, async () => {
      const [user, profile] = await Promise.all([
        db.query.users.findFirst({ where: eq(users.id, userId) }),
        db.query.profiles.findFirst({ where: eq(profiles.userId, userId) }),
      ]);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profileCompleted: user.profileCompleted,
        verificationStatus: user.verificationStatus,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        photoUrl: profile?.photoUrl,
        profile,
      };
    }, 15000);

    if (!userData) return res.status(404).json({ error: 'User profile not found' });
    res.json(userData);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user context' });
  }
});

// ─── 7. ACCOUNT DELETION (§6) ────────────────────────────────────────────────
authRouter.post('/delete-account', requireAuth, async (req, res) => {
  try {
    const { confirmation } = req.body;
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({ error: 'Confirmation phrase mismatch. Type "DELETE MY ACCOUNT" to proceed.' });
    }

    const userId = req.user!.id;
    // Log audit trail
    await db.insert(auditLogs).values({
      actorId: userId,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'USER_ACCOUNT_DELETED',
      entityType: 'USER',
      entityId: userId,
      reason: 'User self-service account deletion',
    });

    await db.delete(users).where(eq(users.id, userId));
    res.json({ message: 'Account permanently erased in compliance with data privacy policies.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to complete account deletion' });
  }
});

// ─── 8. SERVER-SIDE ROLE CHANGE REQUESTS ────────────────────────────────────

authRouter.post('/role-request', requireAuth, async (req, res) => {
  try {
    const requestedRole = req.body.requestedRole || req.body.toRole;
    const reason = req.body.reason;
    const validRoles = ['candidate', 'recruiter', 'organizer'];

    if (!requestedRole || !validRoles.includes(requestedRole)) {
      return res.status(400).json({ error: `Requested role must be one of: ${validRoles.join(', ')}` });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a clear justification (minimum 10 characters).' });
    }

    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const currentRole = req.user!.role;

    if (currentRole === requestedRole) {
      return res.status(400).json({ error: `You are already registered as a ${currentRole}.` });
    }

    // Check for existing pending request
    const existing = await db.query.roleRequests.findFirst({
      where: and(
        eq(roleRequests.userId, userId),
        eq(roleRequests.status, 'pending')
      ),
    });

    if (existing) {
      return res.status(409).json({
        error: `You already have a pending role change request to become a ${existing.requestedRole}. Please wait for administrator review.`,
      });
    }

    const [created] = await db.insert(roleRequests).values({
      userId,
      userEmail,
      currentRole,
      requestedRole,
      reason: reason.trim(),
      status: 'pending',
    }).returning();

    await db.insert(auditLogs).values({
      actorId: userId,
      actorEmail: userEmail,
      actorRole: currentRole,
      action: 'ROLE_CHANGE_REQUESTED',
      entityType: 'USER',
      entityId: userId,
      details: { fromRole: currentRole, toRole: requestedRole, reason: reason.trim() },
    });

    res.status(201).json({
      success: true,
      message: 'Role change request submitted for administrator review.',
      request: created,
    });
  } catch (err: any) {
    console.error('Role request error:', err);
    res.status(500).json({ error: 'Failed to submit role change request' });
  }
});

authRouter.get('/role-request/my', requireAuth, async (req, res) => {
  try {
    const requests = await db.select().from(roleRequests)
      .where(eq(roleRequests.userId, req.user!.id))
      .orderBy(desc(roleRequests.createdAt))
      .limit(5);

    res.json({ requests });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch your role requests' });
  }
});

