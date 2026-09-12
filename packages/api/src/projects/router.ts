import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { projects, projectSkills, skills } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

export const projectsRouter = Router();

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  role: z.string().optional(),
  projectUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  skillIds: z.array(z.string().uuid()).default([]),
});

// GET /api/projects/mine
projectsRouter.get('/mine', requireAuth, async (req, res) => {
  const rows = await db.query.projects.findMany({
    where: eq(projects.userId, req.user!.id),
  });
  // Attach skill names
  const withSkills = await Promise.all(rows.map(async (p) => {
    const ps = await db.select({ skill: skills })
      .from(projectSkills)
      .innerJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(eq(projectSkills.projectId, p.id));
    return { ...p, skills: ps.map(s => s.skill) };
  }));
  res.json(withSkills);
});

// POST /api/projects/mine
projectsRouter.post('/mine', requireAuth, async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { skillIds, ...data } = parsed.data;

  const [proj] = await db.insert(projects).values({ ...data, userId: req.user!.id }).returning();

  if (skillIds.length > 0) {
    await db.insert(projectSkills).values(skillIds.map(skillId => ({ projectId: proj.id, skillId })));
  }
  res.status(201).json(proj);
});

// PATCH /api/projects/mine/:id
projectsRouter.patch('/mine/:id', requireAuth, async (req, res) => {
  const parsed = projectSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { skillIds, ...data } = parsed.data;

  const [updated] = await db.update(projects)
    .set(data)
    .where(and(eq(projects.id, req.params.id), eq(projects.userId, req.user!.id)))
    .returning();
  if (!updated) return res.status(404).json({ error: 'Not found' });

  if (skillIds) {
    await db.delete(projectSkills).where(eq(projectSkills.projectId, updated.id));
    if (skillIds.length > 0) {
      await db.insert(projectSkills).values(skillIds.map(skillId => ({ projectId: updated.id, skillId })));
    }
  }
  res.json(updated);
});

// DELETE /api/projects/mine/:id
projectsRouter.delete('/mine/:id', requireAuth, async (req, res) => {
  await db.delete(projects)
    .where(and(eq(projects.id, req.params.id), eq(projects.userId, req.user!.id)));
  res.status(204).send();
});
