import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { skills, candidateSkills } from '../db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

export const skillsRouter = Router();

// GET /api/skills — all skills (autocomplete)
skillsRouter.get('/', async (req, res) => {
  const q = req.query.q as string | undefined;
  const rows = q
    ? await db.select().from(skills).where(ilike(skills.name, `%${q}%`))
    : await db.select().from(skills);
  res.json(rows);
});

// GET /api/skills/mine — candidate's claimed skills
skillsRouter.get('/mine', requireAuth, async (req, res) => {
  const rows = await db
    .select({ cs: candidateSkills, skill: skills })
    .from(candidateSkills)
    .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
    .where(eq(candidateSkills.userId, req.user!.id));

  res.json(rows.map(r => ({ ...r.cs, skillName: r.skill.name, skillCategory: r.skill.category })));
});

const claimSchema = z.object({
  skillId: z.string().uuid(),
  claimedLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
});

// POST /api/skills/mine
skillsRouter.post('/mine', requireAuth, async (req, res) => {
  const parsed = claimSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await db.query.candidateSkills.findFirst({
    where: and(eq(candidateSkills.userId, req.user!.id), eq(candidateSkills.skillId, parsed.data.skillId)),
  });
  if (existing) return res.status(409).json({ error: 'Skill already claimed' });

  const [row] = await db.insert(candidateSkills).values({
    userId: req.user!.id,
    skillId: parsed.data.skillId,
    claimedLevel: parsed.data.claimedLevel,
  }).returning();
  res.status(201).json(row);
});

// PATCH /api/skills/mine/:id
skillsRouter.patch('/mine/:id', requireAuth, async (req, res) => {
  const { claimedLevel } = req.body;
  const [updated] = await db.update(candidateSkills)
    .set({ claimedLevel })
    .where(and(eq(candidateSkills.id, req.params.id), eq(candidateSkills.userId, req.user!.id)))
    .returning();
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

// DELETE /api/skills/mine/:id
skillsRouter.delete('/mine/:id', requireAuth, async (req, res) => {
  await db.delete(candidateSkills)
    .where(and(eq(candidateSkills.id, req.params.id), eq(candidateSkills.userId, req.user!.id)));
  res.status(204).send();
});
