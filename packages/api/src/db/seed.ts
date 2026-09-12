import 'dotenv/config';
import { db } from './index';
import {
  users, profiles, skills, candidateSkills, projects, projectSkills,
  assessments, questions, assessmentSessions, questionResponses,
  integrityEvents, cameraChecks, hackathons, hackathonParticipants,
  teams, teamMembers, teamRequests,
} from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database…');

  // ─── Skills ───────────────────────────────────────────────────────────────
  const skillData = [
    { name: 'Python', category: 'Programming' },
    { name: 'Django', category: 'Backend' },
    { name: 'React', category: 'Frontend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'REST APIs', category: 'Backend' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'UI/UX Design', category: 'Design' },
    { name: 'Docker', category: 'DevOps' },
  ];

  const insertedSkills = await db.insert(skills).values(skillData).returning();
  const skillMap: Record<string, string> = {};
  insertedSkills.forEach(s => { skillMap[s.name] = s.id; });
  console.log('✓ Skills inserted');

  // ─── Users ────────────────────────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const [candidate1] = await db.insert(users).values({
    email: 'alex@demo.local', passwordHash: hash('Demo1234!'), role: 'candidate',
  }).returning();

  const [candidate2] = await db.insert(users).values({
    email: 'priya@demo.local', passwordHash: hash('Demo1234!'), role: 'candidate',
  }).returning();

  const [organizer] = await db.insert(users).values({
    email: 'organizer@demo.local', passwordHash: hash('Demo1234!'), role: 'organizer',
  }).returning();

  const [recruiter] = await db.insert(users).values({
    email: 'recruiter@demo.local', passwordHash: hash('Demo1234!'), role: 'recruiter',
  }).returning();

  console.log('✓ Users inserted');

  // ─── Profiles ─────────────────────────────────────────────────────────────
  await db.insert(profiles).values([
    {
      userId: candidate1.id, firstName: 'Alex', lastName: 'Chen',
      bio: 'Full-stack developer passionate about Python and React.',
      education: 'B.Tech Computer Science, 2024',
      githubUrl: 'https://github.com/alexchen',
      linkedinUrl: 'https://linkedin.com/in/alexchen',
    },
    {
      userId: candidate2.id, firstName: 'Priya', lastName: 'Sharma',
      bio: 'ML engineer with Django backend experience.',
      education: 'M.Tech AI/ML, 2025',
      githubUrl: 'https://github.com/priyasharma',
    },
    {
      userId: organizer.id, firstName: 'Raj', lastName: 'Organizer',
      bio: 'Hackathon organizer at TechFest.',
    },
    {
      userId: recruiter.id, firstName: 'Maya', lastName: 'Recruiter',
      bio: 'Talent scout at TechCorp.',
    },
  ]);
  console.log('✓ Profiles inserted');

  // ─── Candidate Skills ─────────────────────────────────────────────────────
  // Alex — Python VERIFIED, Django VERIFIED, React IN_PROGRESS
  const [alexPython] = await db.insert(candidateSkills).values({
    userId: candidate1.id, skillId: skillMap['Python'],
    claimedLevel: 'advanced', verificationStatus: 'VERIFIED',
    verifiedScore: 89, integrityScore: 94,
    lastVerifiedAt: new Date('2026-08-15'),
  }).returning();

  const [alexDjango] = await db.insert(candidateSkills).values({
    userId: candidate1.id, skillId: skillMap['Django'],
    claimedLevel: 'intermediate', verificationStatus: 'VERIFIED',
    verifiedScore: 87, integrityScore: 91,
    lastVerifiedAt: new Date('2026-08-15'),
  }).returning();

  await db.insert(candidateSkills).values({
    userId: candidate1.id, skillId: skillMap['React'],
    claimedLevel: 'advanced', verificationStatus: 'UNVERIFIED',
  });

  // Priya — Python VERIFIED, Machine Learning VERIFIED
  const [priyaPython] = await db.insert(candidateSkills).values({
    userId: candidate2.id, skillId: skillMap['Python'],
    claimedLevel: 'expert', verificationStatus: 'VERIFIED',
    verifiedScore: 95, integrityScore: 97,
    lastVerifiedAt: new Date('2026-09-01'),
  }).returning();

  await db.insert(candidateSkills).values({
    userId: candidate2.id, skillId: skillMap['Machine Learning'],
    claimedLevel: 'advanced', verificationStatus: 'VERIFIED',
    verifiedScore: 91, integrityScore: 95,
    lastVerifiedAt: new Date('2026-09-01'),
  });

  console.log('✓ Candidate skills inserted');

  // ─── Projects ─────────────────────────────────────────────────────────────
  const [proj1] = await db.insert(projects).values({
    userId: candidate1.id, name: 'BuildMate',
    description: 'A construction project management tool built with Django + React + Redis caching.',
    technologies: ['Python', 'Django', 'React', 'PostgreSQL', 'Redis'],
    role: 'Backend Developer',
    githubUrl: 'https://github.com/alexchen/buildmate',
  }).returning();

  await db.insert(projectSkills).values([
    { projectId: proj1.id, skillId: skillMap['Python'] },
    { projectId: proj1.id, skillId: skillMap['Django'] },
    { projectId: proj1.id, skillId: skillMap['React'] },
    { projectId: proj1.id, skillId: skillMap['PostgreSQL'] },
  ]);

  const [proj2] = await db.insert(projects).values({
    userId: candidate2.id, name: 'MLPipeline',
    description: 'End-to-end ML pipeline for sentiment analysis using Python + FastAPI.',
    technologies: ['Python', 'Machine Learning', 'FastAPI'],
    role: 'ML Engineer',
    githubUrl: 'https://github.com/priyasharma/mlpipeline',
  }).returning();

  await db.insert(projectSkills).values([
    { projectId: proj2.id, skillId: skillMap['Python'] },
    { projectId: proj2.id, skillId: skillMap['Machine Learning'] },
  ]);

  console.log('✓ Projects inserted');

  // ─── Assessment ───────────────────────────────────────────────────────────
  const [assessment] = await db.insert(assessments).values({
    title: 'Python + Django Backend Verification',
    description: 'Verify your Python and Django skills through knowledge, practical, and explanation questions.',
    skillIds: [skillMap['Python'], skillMap['Django']],
    createdBy: organizer.id,
    durationMinutes: 30,
    isPublished: true,
  }).returning();

  const questionData = [
    // MCQ — Python
    {
      assessmentId: assessment.id, type: 'mcq' as const, order: 1,
      body: 'What does the GIL (Global Interpreter Lock) in Python prevent?',
      options: [
        { id: 'a', text: 'Multiple threads from executing Python bytecodes simultaneously' },
        { id: 'b', text: 'Python from running on multiple CPUs' },
        { id: 'c', text: 'Memory allocation errors' },
        { id: 'd', text: 'Importing modules concurrently' },
      ],
      correctAnswer: 'a', expectedTimeSec: 45, fastResponseThresholdSec: 5, points: 2,
      skillId: skillMap['Python'],
    },
    {
      assessmentId: assessment.id, type: 'mcq' as const, order: 2,
      body: 'Which of the following is NOT a Python built-in data structure?',
      options: [
        { id: 'a', text: 'List' }, { id: 'b', text: 'Dictionary' },
        { id: 'c', text: 'LinkedList' }, { id: 'd', text: 'Tuple' },
      ],
      correctAnswer: 'c', expectedTimeSec: 30, fastResponseThresholdSec: 4, points: 1,
      skillId: skillMap['Python'],
    },
    {
      assessmentId: assessment.id, type: 'mcq' as const, order: 3,
      body: 'What is the time complexity of dictionary lookup in Python?',
      options: [
        { id: 'a', text: 'O(n)' }, { id: 'b', text: 'O(log n)' },
        { id: 'c', text: 'O(1) average' }, { id: 'd', text: 'O(n²)' },
      ],
      correctAnswer: 'c', expectedTimeSec: 30, fastResponseThresholdSec: 4, points: 1,
      skillId: skillMap['Python'],
    },
    // MCQ — Django
    {
      assessmentId: assessment.id, type: 'mcq' as const, order: 4,
      body: 'In Django, what does the `select_related()` method do?',
      options: [
        { id: 'a', text: 'Performs a SQL JOIN to fetch related objects in a single query' },
        { id: 'b', text: 'Caches related objects in Redis' },
        { id: 'c', text: 'Lazy loads related objects one by one' },
        { id: 'd', text: 'Filters objects by a related field' },
      ],
      correctAnswer: 'a', expectedTimeSec: 50, fastResponseThresholdSec: 6, points: 2,
      skillId: skillMap['Django'],
    },
    {
      assessmentId: assessment.id, type: 'mcq' as const, order: 5,
      body: 'Which Django ORM method would you use to avoid the N+1 query problem for many-to-many relationships?',
      options: [
        { id: 'a', text: 'filter()' }, { id: 'b', text: 'prefetch_related()' },
        { id: 'c', text: 'values()' }, { id: 'd', text: 'annotate()' },
      ],
      correctAnswer: 'b', expectedTimeSec: 50, fastResponseThresholdSec: 6, points: 2,
      skillId: skillMap['Django'],
    },
    // Short answer
    {
      assessmentId: assessment.id, type: 'short_answer' as const, order: 6,
      body: 'Explain what a Python decorator is and give a brief real-world example of when you would use one.',
      expectedTimeSec: 120, fastResponseThresholdSec: 15, points: 3,
      skillId: skillMap['Python'],
      scoringHints: 'Look for: function wrapping, @syntax, real example (logging/auth/timing), understanding of higher-order functions',
    },
    {
      assessmentId: assessment.id, type: 'short_answer' as const, order: 7,
      body: 'In your BuildMate project, Django + Redis was used for caching. Why was Redis chosen, and what could go wrong if cached data becomes stale?',
      expectedTimeSec: 150, fastResponseThresholdSec: 20, points: 4,
      skillId: skillMap['Django'],
      scoringHints: 'Look for: speed/memory reasoning, cache invalidation strategy, staleness handling, awareness of data consistency trade-offs',
    },
    // Practical
    {
      assessmentId: assessment.id, type: 'practical' as const, order: 8,
      body: 'Write a Python function `most_frequent(lst)` that returns the most frequently occurring element in a list. If there is a tie, return the element that appears first. Example: most_frequent([3, 1, 3, 2, 1, 3]) → 3',
      expectedTimeSec: 300, fastResponseThresholdSec: 30, points: 5,
      skillId: skillMap['Python'],
      scoringHints: 'Accept: counter/dict approach, collections.Counter, O(n) solution. Bonus for handling edge cases.',
    },
    {
      assessmentId: assessment.id, type: 'practical' as const, order: 9,
      body: 'Write a Django model for a Blog Post with fields: title, content, author (FK to User), created_at, is_published. Then write a query to fetch all published posts by a specific author, ordered by newest first.',
      expectedTimeSec: 300, fastResponseThresholdSec: 30, points: 5,
      skillId: skillMap['Django'],
      scoringHints: 'Look for: models.Model, CharField/TextField, ForeignKey, DateTimeField auto_now_add, filter(is_published=True, author=...).order_by("-created_at")',
    },
    {
      assessmentId: assessment.id, type: 'mcq' as const, order: 10,
      body: 'What HTTP status code should a REST API return when a resource is successfully created?',
      options: [
        { id: 'a', text: '200 OK' }, { id: 'b', text: '201 Created' },
        { id: 'c', text: '204 No Content' }, { id: 'd', text: '202 Accepted' },
      ],
      correctAnswer: 'b', expectedTimeSec: 20, fastResponseThresholdSec: 3, points: 1,
      skillId: skillMap['REST APIs'],
    },
  ];

  await db.insert(questions).values(questionData);
  console.log('✓ Assessment + questions inserted');

  // ─── Hackathons ───────────────────────────────────────────────────────────
  const [hackathon] = await db.insert(hackathons).values({
    name: 'AI Buildathon 2026',
    description: 'Build AI-powered products in 48 hours. Open to all skill levels.',
    organizerId: organizer.id,
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-10-03'),
    registrationDeadline: new Date('2026-09-25'),
    maxTeamSize: 5,
    requiredSkills: ['Python', 'Machine Learning', 'React', 'Django'],
    isPublished: true,
  }).returning();

  const [hackathon2] = await db.insert(hackathons).values({
    name: 'FullStack Challenge 2026',
    description: 'Ship a full-stack product from scratch. Focus on clean architecture.',
    organizerId: organizer.id,
    startDate: new Date('2026-11-01'),
    endDate: new Date('2026-11-02'),
    registrationDeadline: new Date('2026-10-28'),
    maxTeamSize: 4,
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    isPublished: true,
  }).returning();

  // Register participants
  await db.insert(hackathonParticipants).values([
    { hackathonId: hackathon.id, userId: candidate1.id },
    { hackathonId: hackathon.id, userId: candidate2.id },
    { hackathonId: hackathon2.id, userId: candidate1.id },
  ]);

  console.log('✓ Hackathons inserted');

  // ─── Teams ────────────────────────────────────────────────────────────────
  const [team] = await db.insert(teams).values({
    hackathonId: hackathon.id,
    name: 'ByteForce',
    description: 'Building an AI-powered productivity tool.',
    ownerId: candidate2.id,
    requiredSkills: ['React', 'Django', 'Python'],
    maxMembers: 4,
  }).returning();

  await db.insert(teamMembers).values({
    teamId: team.id, userId: candidate2.id, role: 'Team Lead',
  });

  // Pending invite from ByteForce to Alex
  await db.insert(teamRequests).values({
    teamId: team.id,
    fromUserId: candidate2.id,
    toUserId: candidate1.id,
    direction: 'invite',
    status: 'pending',
    message: 'Hey Alex! We need a Django developer. Your verification scores look great. Join us?',
  });

  console.log('✓ Teams + requests inserted');
  console.log('\n✅ Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  Candidate 1:  alex@demo.local     / Demo1234!');
  console.log('  Candidate 2:  priya@demo.local     / Demo1234!');
  console.log('  Organizer:    organizer@demo.local / Demo1234!');
  console.log('  Recruiter:    recruiter@demo.local / Demo1234!');

  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
