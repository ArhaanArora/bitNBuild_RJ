import { Router } from 'express';
import { db } from '../db';
import { hackathons, hackathonParticipants } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth';
import { cache } from '../services/cache.service';

export const hackathonsRouter = Router();

// GET /api/hackathons
hackathonsRouter.get('/', requireAuth, async (_req, res) => {
  const rows = await cache.get('hackathons:published', () =>
    db.query.hackathons.findMany({ where: eq(hackathons.isPublished, true) }),
    120000
  );
  res.json(rows);
});

// GET /api/hackathons/:id
hackathonsRouter.get('/:id', requireAuth, async (req, res) => {
  const hackathon = await db.query.hackathons.findFirst({ where: eq(hackathons.id, req.params.id) });
  if (!hackathon) return res.status(404).json({ error: 'Not found' });

  const participants = await db.query.hackathonParticipants.findMany({
    where: eq(hackathonParticipants.hackathonId, req.params.id),
  });
  res.json({ ...hackathon, participantCount: participants.length });
});

// POST /api/hackathons — organizer only
hackathonsRouter.post('/', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const { name, description, startDate, endDate, registrationDeadline, maxTeamSize, requiredSkills } = req.body;
  const [h] = await db.insert(hackathons).values({
    name, description, organizerId: req.user!.id,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
    maxTeamSize: maxTeamSize ?? 5,
    requiredSkills: requiredSkills ?? [],
    isPublished: true,
  }).returning();
  cache.del('hackathons:published');
  res.status(201).json(h);
});

// POST /api/hackathons/:id/join
hackathonsRouter.post('/:id/join', requireAuth, async (req, res) => {
  const existing = await db.query.hackathonParticipants.findFirst({
    where: and(eq(hackathonParticipants.hackathonId, req.params.id), eq(hackathonParticipants.userId, req.user!.id)),
  });
  if (existing) return res.status(409).json({ error: 'Already joined' });

  await db.insert(hackathonParticipants).values({ hackathonId: req.params.id, userId: req.user!.id });
  res.status(201).json({ joined: true });
});

// POST /api/hackathons/:id/leave
hackathonsRouter.post('/:id/leave', requireAuth, async (req, res) => {
  await db.delete(hackathonParticipants)
    .where(and(eq(hackathonParticipants.hackathonId, req.params.id), eq(hackathonParticipants.userId, req.user!.id)));
  res.json({ left: true });
});

// GET /api/hackathons/:id/participants
hackathonsRouter.get('/:id/participants', requireAuth, async (req, res) => {
  const rows = await db.query.hackathonParticipants.findMany({
    where: eq(hackathonParticipants.hackathonId, req.params.id),
  });
  res.json(rows);
});
