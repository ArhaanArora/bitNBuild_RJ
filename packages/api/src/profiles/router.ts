import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { db } from '../db';
import { profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

export const profilesRouter = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const patchSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bio: z.string().optional(),
  education: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
}).partial();

// GET /api/profiles/me
profilesRouter.get('/me', requireAuth, async (req, res) => {
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, req.user!.id) });
  res.json(profile ?? null);
});

// PATCH /api/profiles/me
profilesRouter.patch('/me', requireAuth, async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [updated] = await db.update(profiles)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profiles.userId, req.user!.id))
    .returning();
  res.json(updated);
});

// POST /api/profiles/me/photo
profilesRouter.post('/me/photo', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photoUrl = `/uploads/${req.file.filename}`;
  await db.update(profiles).set({ photoUrl }).where(eq(profiles.userId, req.user!.id));
  res.json({ photoUrl });
});

// POST /api/profiles/me/resume
profilesRouter.post('/me/resume', requireAuth, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const resumeUrl = `/uploads/${req.file.filename}`;
  await db.update(profiles).set({ resumeUrl }).where(eq(profiles.userId, req.user!.id));
  res.json({ resumeUrl });
});

// GET /api/profiles/:userId — public (recruiter/team lead view)
profilesRouter.get('/:userId', requireAuth, async (req, res) => {
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, req.params.userId) });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});
