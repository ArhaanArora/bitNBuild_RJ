import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { users, profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['candidate', 'organizer', 'recruiter']).default('candidate'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signTokens(payload: { id: string; email: string; role: string }) {
  const access = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refresh = jwt.sign({ id: payload.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { access, refresh };
}

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, firstName, lastName, role } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({ email, passwordHash, role }).returning();
  await db.insert(profiles).values({ userId: user.id, firstName, lastName });

  const tokens = signTokens({ id: user.id, email: user.email, role: user.role });
  res.status(201).json({ user: { id: user.id, email, role, firstName, lastName }, ...tokens });
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
  const tokens = signTokens({ id: user.id, email: user.email, role: user.role });

  res.json({
    user: { id: user.id, email: user.email, role: user.role, firstName: profile?.firstName, lastName: profile?.lastName },
    ...tokens,
  });
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
    const user = await db.query.users.findFirst({ where: eq(users.id, payload.id) });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const tokens = signTokens({ id: user.id, email: user.email, role: user.role });
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.id) });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
  res.json({ id: user.id, email: user.email, role: user.role, profile });
});
