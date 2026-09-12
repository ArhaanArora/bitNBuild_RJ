import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import { db } from './index';
import {
  users, profiles, skills, candidateSkills, projects, projectSkills,
  assessments, questions, assessmentSessions, questionResponses,
  integrityEvents, cameraChecks, hackathons, hackathonParticipants,
  teams, teamMembers, teamRequests, notifications, auditLogs,
} from './schema';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding production-grade database with Canonical Skills and Real Candidate profiles…');

  // Clear existing seed data in order of foreign keys
  console.log('Cleaning existing records...');
  await db.delete(teamRequests);
  await db.delete(teamMembers);
  await db.delete(teams);
  await db.delete(hackathonParticipants);
  await db.delete(hackathons);
  await db.delete(cameraChecks);
  await db.delete(integrityEvents);
  await db.delete(questionResponses);
  await db.delete(assessmentSessions);
  await db.delete(questions);
  await db.delete(assessments);
  await db.delete(projectSkills);
  await db.delete(projects);
  await db.delete(candidateSkills);
  await db.delete(profiles);
  await db.delete(notifications);
  await db.delete(auditLogs);
  await db.delete(users);
  await db.delete(skills);

  // ─── 1. Canonical Skills ───────────────────────────────────────────────────
  console.log('Inserting Canonical Skills...');
  const canonicalSkillsData = [
    {
      name: 'Python',
      slug: 'python',
      category: 'Programming',
      aliases: ['py', 'python3', 'cpython'],
      description: 'General-purpose programming language for backend, data science, and AI/ML.',
      status: 'active',
    },
    {
      name: 'Django',
      slug: 'django',
      category: 'Backend',
      aliases: ['django-rest-framework', 'drf', 'django-orm'],
      description: 'High-level Python web framework that enables rapid, clean development.',
      status: 'active',
    },
    {
      name: 'React',
      slug: 'react',
      category: 'Frontend',
      aliases: ['reactjs', 'react.js', 'react-router', 'create-react-app'],
      description: 'Declarative, component-based JavaScript library for building user interfaces.',
      status: 'active',
    },
    {
      name: 'PostgreSQL',
      slug: 'postgresql',
      category: 'Database',
      aliases: ['postgres', 'psql', 'pg', 'neon-pg'],
      description: 'Enterprise open-source relational database with advanced JSON and indexing support.',
      status: 'active',
    },
    {
      name: 'REST APIs',
      slug: 'rest-apis',
      category: 'Backend',
      aliases: ['rest', 'restful', 'api-design', 'openapi'],
      description: 'Architectural style for hypermedia, stateless web services, and robust APIs.',
      status: 'active',
    },
    {
      name: 'TypeScript',
      slug: 'typescript',
      category: 'Programming',
      aliases: ['ts', 'tsc'],
      description: 'Typed superset of JavaScript providing static types and modern tooling.',
      status: 'active',
    },
    {
      name: 'Node.js',
      slug: 'nodejs',
      category: 'Backend',
      aliases: ['node', 'node.js', 'express', 'nest'],
      description: 'Asynchronous event-driven JavaScript runtime for server-side engineering.',
      status: 'active',
    },
    {
      name: 'Machine Learning',
      slug: 'machine-learning',
      category: 'AI/ML',
      aliases: ['ml', 'deep-learning', 'pytorch', 'tensorflow', 'scikit-learn'],
      description: 'Predictive modeling, neural networks, supervised/unsupervised statistical algorithms.',
      status: 'active',
    },
    {
      name: 'UI/UX Design',
      slug: 'ui-ux-design',
      category: 'Design',
      aliases: ['figma', 'ui-design', 'ux', 'product-design', 'wireframing'],
      description: 'User-centered visual systems, design tokens, interaction prototyping, and wireframing.',
      status: 'active',
    },
    {
      name: 'Docker',
      slug: 'docker',
      category: 'DevOps',
      aliases: ['containerization', 'containers', 'docker-compose'],
      description: 'Platform for developing, shipping, and running applications in lightweight containers.',
      status: 'active',
    },
    {
      name: 'Next.js',
      slug: 'nextjs',
      category: 'Frontend',
      aliases: ['next', 'next.js', 'ssr'],
      description: 'React production framework with SSR, static export, and server components.',
      status: 'active',
    },
    {
      name: 'TailwindCSS',
      slug: 'tailwindcss',
      category: 'Frontend',
      aliases: ['tailwind', 'tw'],
      description: 'Utility-first CSS framework for rapid interface development.',
      status: 'active',
    },
    {
      name: 'FastAPI',
      slug: 'fastapi',
      category: 'Backend',
      aliases: ['fast-api', 'pydantic', 'starlette'],
      description: 'Modern, high-performance web framework for building APIs with Python 3.8+.',
      status: 'active',
    },
    {
      name: 'Solidity',
      slug: 'solidity',
      category: 'Web3',
      aliases: ['smart-contracts', 'web3', 'ethereum', 'evm'],
      description: 'Statically-typed language for developing smart contracts on EVM-compatible blockchains.',
      status: 'active',
    },
    {
      name: 'Flutter',
      slug: 'flutter',
      category: 'Mobile',
      aliases: ['dart', 'flutter-mobile'],
      description: 'Multi-platform UI framework created by Google to craft natively compiled apps.',
      status: 'active',
    },
    {
      name: 'GraphQL',
      slug: 'graphql',
      category: 'Backend',
      aliases: ['gql', 'apollo'],
      description: 'Query language for APIs providing precise data fetching and schema definitions.',
      status: 'active',
    },
  ];

  const insertedSkills = await db.insert(skills).values(canonicalSkillsData).returning();
  const skillMap: Record<string, string> = {};
  insertedSkills.forEach(s => { skillMap[s.slug] = s.id; skillMap[s.name] = s.id; });
  console.log(`✓ Inserted ${insertedSkills.length} canonical skills`);

  // ─── 2. Users & Credentials ───────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hashSync(p, 10);
  console.log('Inserting real users...');

  // Admin
  const [adminUser] = await db.insert(users).values({
    email: 'admin@demo.local',
    passwordHash: hash('Admin1234!'),
    role: 'admin',
  }).returning();

  // Candidates
  const [alex] = await db.insert(users).values({
    email: 'alex@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'candidate',
  }).returning();

  const [priya] = await db.insert(users).values({
    email: 'priya@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'candidate',
  }).returning();

  const [rohan] = await db.insert(users).values({
    email: 'rohan@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'candidate',
  }).returning();

  const [aarav] = await db.insert(users).values({
    email: 'aarav@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'candidate',
  }).returning();

  const [ananya] = await db.insert(users).values({
    email: 'ananya@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'candidate',
  }).returning();

  const [kabir] = await db.insert(users).values({
    email: 'kabir@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'candidate',
  }).returning();

  const [ishita] = await db.insert(users).values({
    email: 'ishita@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'candidate',
  }).returning();

  const [sahil] = await db.insert(users).values({
    email: 'sahil@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'candidate',
  }).returning();

  // Organizer & Recruiter
  const [organizer] = await db.insert(users).values({
    email: 'organizer@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'organizer',
  }).returning();

  const [recruiter] = await db.insert(users).values({
    email: 'recruiter@demo.local',
    passwordHash: hash('Demo1234!'),
    role: 'recruiter',
  }).returning();

  console.log('✓ Users inserted');

  // ─── 3. Profiles ──────────────────────────────────────────────────────────
  await db.insert(profiles).values([
    {
      userId: adminUser.id,
      firstName: 'System',
      lastName: 'Administrator',
      bio: 'Platform trust governance, canonical registry and audit log operator.',
      education: 'Security Operations & Governance',
    },
    {
      userId: alex.id,
      firstName: 'Alex',
      lastName: 'Chen',
      bio: 'Full-stack developer passionate about resilient systems, Python, and React.',
      education: 'B.Tech Computer Science, IIT Delhi 2025',
      githubUrl: 'https://github.com/alexchen-dev',
      linkedinUrl: 'https://linkedin.com/in/alexchen',
      portfolioUrl: 'https://alexchen.dev',
    },
    {
      userId: priya.id,
      firstName: 'Priya',
      lastName: 'Sharma',
      bio: 'Backend & ML specialist with high-concurrency experience and proven hackathon wins.',
      education: 'B.Tech Computer Science, BITS Pilani 2025',
      githubUrl: 'https://github.com/priyasharma-ai',
      linkedinUrl: 'https://linkedin.com/in/priyasharma',
      portfolioUrl: 'https://priyasharma.io',
    },
    {
      userId: rohan.id,
      firstName: 'Rohan',
      lastName: 'Mehta',
      bio: 'Cloud infra engineer and systems enthusiast. Loves Kubernetes, Docker, and distributed storage.',
      education: 'B.Tech Information Technology, DTU 2024',
      githubUrl: 'https://github.com/rohanmehta-cloud',
      linkedinUrl: 'https://linkedin.com/in/rohanmehta',
    },
    {
      userId: aarav.id,
      firstName: 'Aarav',
      lastName: 'Patel',
      bio: 'Design engineer bridging the gap between Figma design systems and production React applications.',
      education: 'B.Des & Human-Computer Interaction, NID 2025',
      githubUrl: 'https://github.com/aaravpatel-ui',
      portfolioUrl: 'https://aaravpatel.design',
    },
    {
      userId: ananya.id,
      firstName: 'Ananya',
      lastName: 'Iyer',
      bio: 'AI/ML researcher focused on production LLM agents, retrieval evaluation, and FastHTML dashboards.',
      education: 'M.Tech AI/Data Science, IIIT Hyderabad 2025',
      githubUrl: 'https://github.com/ananya-iyer-ml',
      linkedinUrl: 'https://linkedin.com/in/ananyaiyer',
    },
    {
      userId: kabir.id,
      firstName: 'Kabir',
      lastName: 'Sen',
      bio: 'Smart contract developer and mobile enthusiast. Built and audited DeFi vault protocols.',
      education: 'B.Tech Computer Science, RVCE Bengaluru 2025',
      githubUrl: 'https://github.com/kabirsen-web3',
    },
    {
      userId: ishita.id,
      firstName: 'Ishita',
      lastName: 'Verma',
      bio: 'Data engineer specializing in scalable ETL pipelines, PostgreSQL query optimization, and Spark.',
      education: 'B.Tech Data Science, VIT Vellore 2024',
      githubUrl: 'https://github.com/ishitaverma-data',
    },
    {
      userId: sahil.id,
      firstName: 'Sahil',
      lastName: 'Nair',
      bio: 'Full-stack TypeScript developer with deep Node.js and automated CI/CD pipeline skills.',
      education: 'B.Tech Computer Science, MIT Manipal 2025',
      githubUrl: 'https://github.com/sahilnair-dev',
    },
    {
      userId: organizer.id,
      firstName: 'Raj',
      lastName: 'Malhotra',
      bio: 'BitNBuild Rajasthan Hackathon Director.',
    },
    {
      userId: recruiter.id,
      firstName: 'Maya',
      lastName: 'Kapoor',
      bio: 'Head of Technical Talent Acquisition at Nexus Ventures.',
    },
  ]);
  console.log('✓ Profiles inserted');

  // ─── 4. Candidate Skills with Pipeline Statuses ─────────────────────────────
  console.log('Inserting candidate skills with evidence and verification states...');

  await db.insert(candidateSkills).values([
    // Priya (94% Trust)
    {
      userId: priya.id,
      skillId: skillMap['python'],
      claimedLevel: 'expert',
      verificationStatus: 'VERIFIED',
      verifiedScore: 96,
      integrityScore: 98,
      evidenceNotes: 'Production repo analyzed: 4,200 lines, 100% commit authorship verified, AST static analysis clean.',
      evidenceUrl: 'https://github.com/priyasharma-ai/neural-rag-engine',
      portfolioRating: 95,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-20'),
    },
    {
      userId: priya.id,
      skillId: skillMap['django'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 93,
      integrityScore: 96,
      evidenceNotes: 'Completed DRF challenge with 0 tab switches and clean REST endpoints.',
      portfolioRating: 92,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-22'),
    },
    {
      userId: priya.id,
      skillId: skillMap['postgresql'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 91,
      integrityScore: 95,
      evidenceNotes: 'Tested index optimization and connection pooling on PostgreSQL 16.',
      portfolioRating: 88,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-24'),
    },
    {
      userId: priya.id,
      skillId: skillMap['machine-learning'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 95,
      integrityScore: 97,
      evidenceNotes: 'Validated PyTorch multi-head attention implementation with reproducible training log.',
      portfolioRating: 96,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-25'),
    },

    // Rohan (91% Trust)
    {
      userId: rohan.id,
      skillId: skillMap['docker'],
      claimedLevel: 'expert',
      verificationStatus: 'VERIFIED',
      verifiedScore: 94,
      integrityScore: 95,
      evidenceNotes: 'Multi-stage Docker builds optimized from 1.2GB down to 42MB distroless.',
      evidenceUrl: 'https://github.com/rohanmehta-cloud/k8s-mesh-operator',
      portfolioRating: 90,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-18'),
    },
    {
      userId: rohan.id,
      skillId: skillMap['postgresql'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 89,
      integrityScore: 92,
      evidenceNotes: 'Partitioning strategy and vacuum analysis benchmarked in production.',
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-19'),
    },
    {
      userId: rohan.id,
      skillId: skillMap['nodejs'],
      claimedLevel: 'intermediate',
      verificationStatus: 'UNDER_REVIEW',
      evidenceNotes: 'Microservices gateway repository submitted for agent verification.',
      githubStatus: 'pending',
    },

    // Aarav (88% Trust)
    {
      userId: aarav.id,
      skillId: skillMap['react'],
      claimedLevel: 'expert',
      verificationStatus: 'VERIFIED',
      verifiedScore: 92,
      integrityScore: 96,
      evidenceNotes: 'Design system component library built with accessibility tokens & storybook.',
      evidenceUrl: 'https://github.com/aaravpatel-ui/quantum-tokens',
      portfolioRating: 94,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-15'),
    },
    {
      userId: aarav.id,
      skillId: skillMap['ui-ux-design'],
      claimedLevel: 'expert',
      verificationStatus: 'VERIFIED',
      verifiedScore: 96,
      integrityScore: 99,
      evidenceNotes: 'Interactive Figma design system, auto-layout 5.0, dark mode tokens.',
      evidenceUrl: 'https://figma.com/@aarav',
      portfolioRating: 98,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-10'),
    },
    {
      userId: aarav.id,
      skillId: skillMap['tailwindcss'],
      claimedLevel: 'expert',
      verificationStatus: 'VERIFIED',
      verifiedScore: 90,
      integrityScore: 94,
      lastVerifiedAt: new Date('2026-08-12'),
      githubStatus: 'verified',
    },

    // Ananya (96% Trust)
    {
      userId: ananya.id,
      skillId: skillMap['machine-learning'],
      claimedLevel: 'expert',
      verificationStatus: 'VERIFIED',
      verifiedScore: 98,
      integrityScore: 99,
      evidenceNotes: 'Published paper preprint on agentic multi-hop retrieval and self-correction.',
      evidenceUrl: 'https://github.com/ananya-iyer-ml/rag-agents-eval',
      portfolioRating: 98,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-28'),
    },
    {
      userId: ananya.id,
      skillId: skillMap['python'],
      claimedLevel: 'expert',
      verificationStatus: 'VERIFIED',
      verifiedScore: 97,
      integrityScore: 98,
      lastVerifiedAt: new Date('2026-08-29'),
      githubStatus: 'verified',
    },
    {
      userId: ananya.id,
      skillId: skillMap['fastapi'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 94,
      integrityScore: 96,
      lastVerifiedAt: new Date('2026-08-29'),
      githubStatus: 'verified',
    },

    // Kabir (84% Trust)
    {
      userId: kabir.id,
      skillId: skillMap['solidity'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 86,
      integrityScore: 90,
      evidenceNotes: 'Smart contracts audited with Slither, reentrancy guards and ERC4626 standard.',
      evidenceUrl: 'https://github.com/kabirsen-web3/vault-contracts',
      portfolioRating: 85,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-05'),
    },
    {
      userId: kabir.id,
      skillId: skillMap['flutter'],
      claimedLevel: 'intermediate',
      verificationStatus: 'CLAIMED',
      evidenceNotes: 'Mobile dApp wallet submitted for verification challenge.',
      githubStatus: 'unverified',
    },

    // Ishita (89% Trust)
    {
      userId: ishita.id,
      skillId: skillMap['postgresql'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 92,
      integrityScore: 94,
      evidenceNotes: 'OLAP query tuning, materialized views, and pg_stat_statements tuning.',
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-14'),
    },
    {
      userId: ishita.id,
      skillId: skillMap['python'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 88,
      integrityScore: 91,
      lastVerifiedAt: new Date('2026-08-14'),
      githubStatus: 'verified',
    },

    // Sahil (82% Trust)
    {
      userId: sahil.id,
      skillId: skillMap['nodejs'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 84,
      integrityScore: 88,
      evidenceNotes: 'Express and Fastify API benchmarks with unit test suites.',
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-02'),
    },
    {
      userId: sahil.id,
      skillId: skillMap['typescript'],
      claimedLevel: 'intermediate',
      verificationStatus: 'ASSESSMENT_REQUIRED',
      evidenceNotes: 'Requested skill verification for advanced generic utilities.',
      githubStatus: 'unverified',
    },

    // Alex (CurrentUser)
    {
      userId: alex.id,
      skillId: skillMap['python'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 89,
      integrityScore: 94,
      evidenceNotes: 'Verified via live practical assessment and code analysis.',
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-15'),
    },
    {
      userId: alex.id,
      skillId: skillMap['react'],
      claimedLevel: 'intermediate',
      verificationStatus: 'VERIFIED',
      verifiedScore: 86,
      integrityScore: 91,
      evidenceNotes: 'State management and hook testing verified.',
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-16'),
    },
    {
      userId: alex.id,
      skillId: skillMap['rest-apis'],
      claimedLevel: 'advanced',
      verificationStatus: 'VERIFIED',
      verifiedScore: 90,
      integrityScore: 93,
      githubStatus: 'verified',
      lastVerifiedAt: new Date('2026-08-17'),
    },
  ]);
  console.log('✓ Candidate skills inserted');

  // ─── 5. Verified Projects ──────────────────────────────────────────────────
  console.log('Inserting verified projects...');
  const [priyaProj] = await db.insert(projects).values({
    userId: priya.id,
    name: 'Neural RAG Engine',
    description: 'Production-ready self-correcting RAG pipeline with dense & sparse hybrid retrieval, multi-query routing, and automated citation verification.',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Machine Learning'],
    role: 'Lead Architect & ML Engineer',
    projectUrl: 'https://neuralrag.demo.local',
    githubUrl: 'https://github.com/priyasharma-ai/neural-rag-engine',
  }).returning();

  const [rohanProj] = await db.insert(projects).values({
    userId: rohan.id,
    name: 'KubeMesh Operator',
    description: 'Custom Kubernetes controller for automated canary deployments, zero-downtime rollouts, and eBPF network telemetry.',
    technologies: ['Docker', 'PostgreSQL', 'Node.js'],
    role: 'DevOps & Systems Lead',
    githubUrl: 'https://github.com/rohanmehta-cloud/k8s-mesh-operator',
  }).returning();

  const [aaravProj] = await db.insert(projects).values({
    userId: aarav.id,
    name: 'Quantum Design System',
    description: 'Universal accessible UI component kit featuring 50+ token-driven components, fluid dark mode, and sub-millisecond interaction latency.',
    technologies: ['React', 'UI/UX Design', 'TailwindCSS'],
    role: 'Design Technologist',
    projectUrl: 'https://quantum-tokens.design',
    githubUrl: 'https://github.com/aaravpatel-ui/quantum-tokens',
  }).returning();

  const [ananyaProj] = await db.insert(projects).values({
    userId: ananya.id,
    name: 'Agentic Auto-Evaluator',
    description: 'Benchmarking harness for evaluating hallucination rates and tool execution fidelity across autonomous LLM workflows.',
    technologies: ['Python', 'FastAPI', 'Machine Learning'],
    role: 'Principal Researcher',
    githubUrl: 'https://github.com/ananya-iyer-ml/rag-agents-eval',
  }).returning();

  const [alexProj] = await db.insert(projects).values({
    userId: alex.id,
    name: 'SkillVerify Core Platform',
    description: 'Cryptographic proof-of-competence platform matching vetted developers with hackathon teams and recruiters.',
    technologies: ['Python', 'React', 'REST APIs', 'PostgreSQL'],
    role: 'Full-Stack Lead',
    githubUrl: 'https://github.com/alexchen-dev/skill-verify',
  }).returning();

  // Link project skills
  await db.insert(projectSkills).values([
    { projectId: priyaProj.id, skillId: skillMap['python'] },
    { projectId: priyaProj.id, skillId: skillMap['django'] },
    { projectId: priyaProj.id, skillId: skillMap['postgresql'] },
    { projectId: rohanProj.id, skillId: skillMap['docker'] },
    { projectId: aaravProj.id, skillId: skillMap['react'] },
    { projectId: aaravProj.id, skillId: skillMap['ui-ux-design'] },
    { projectId: ananyaProj.id, skillId: skillMap['machine-learning'] },
    { projectId: alexProj.id, skillId: skillMap['python'] },
    { projectId: alexProj.id, skillId: skillMap['react'] },
  ]);
  console.log('✓ Projects inserted');

  // ─── 6. Hackathons & Teams ─────────────────────────────────────────────────
  console.log('Inserting hackathons and teams...');
  const [hackathon] = await db.insert(hackathons).values({
    name: 'BitNBuild Rajasthan 2026',
    description: 'State-level hackathon connecting top builders in AI, Web3, FinTech, and Cloud Infrastructure.',
    organizerId: organizer.id,
    startDate: new Date('2026-10-15T09:00:00Z'),
    endDate: new Date('2026-10-17T18:00:00Z'),
    registrationDeadline: new Date('2026-10-10T23:59:59Z'),
    maxTeamSize: 4,
    requiredSkills: ['Python', 'React', 'Docker', 'PostgreSQL', 'Machine Learning'],
    isPublished: true,
  }).returning();

  // Add participants
  await db.insert(hackathonParticipants).values([
    { hackathonId: hackathon.id, userId: alex.id },
    { hackathonId: hackathon.id, userId: priya.id },
    { hackathonId: hackathon.id, userId: rohan.id },
    { hackathonId: hackathon.id, userId: aarav.id },
    { hackathonId: hackathon.id, userId: ananya.id },
    { hackathonId: hackathon.id, userId: kabir.id },
    { hackathonId: hackathon.id, userId: ishita.id },
    { hackathonId: hackathon.id, userId: sahil.id },
  ]);

  // Teams
  const [teamNeural] = await db.insert(teams).values({
    hackathonId: hackathon.id,
    name: 'NeuralCraft',
    description: 'Developing an adaptive spatial AI interface for enterprise incident root cause analysis.',
    ownerId: priya.id,
    requiredSkills: ['Python', 'Machine Learning', 'React', 'UI/UX Design'],
    maxMembers: 4,
  }).returning();

  await db.insert(teamMembers).values([
    { teamId: teamNeural.id, userId: priya.id, role: 'Team Lead & ML Architect' },
    { teamId: teamNeural.id, userId: ananya.id, role: 'AI Researcher' },
  ]);

  const [teamChain] = await db.insert(teams).values({
    hackathonId: hackathon.id,
    name: 'ChainForge',
    description: 'Decentralized verifiable credential registry for academic micro-degrees.',
    ownerId: kabir.id,
    requiredSkills: ['Solidity', 'React', 'Docker', 'TypeScript'],
    maxMembers: 4,
  }).returning();

  await db.insert(teamMembers).values([
    { teamId: teamChain.id, userId: kabir.id, role: 'Smart Contract Lead' },
  ]);

  // Team invite from NeuralCraft (Priya) to Alex
  await db.insert(teamRequests).values({
    teamId: teamNeural.id,
    fromUserId: priya.id,
    toUserId: alex.id,
    direction: 'invite',
    status: 'pending',
    message: 'Hey Alex! We loved your Python and React verification evidence. We have 1 spot left on NeuralCraft for a verified full-stack lead. Join us?',
  });

  console.log('✓ Hackathons & Teams inserted');

  // ─── 7. In-App Notifications ───────────────────────────────────────────────
  console.log('Inserting notifications...');
  await db.insert(notifications).values([
    {
      userId: alex.id,
      type: 'TEAM_INVITE',
      title: 'Hackathon Team Invitation',
      message: 'Priya Sharma invited you to join team NeuralCraft for BitNBuild Rajasthan 2026!',
      actionUrl: '/teams/requests',
      metadata: { teamId: teamNeural.id, senderName: 'Priya Sharma' },
      isRead: false,
    },
    {
      userId: alex.id,
      type: 'VERIFICATION_RESULT',
      title: 'Skill Verified: Python (89/100)',
      message: 'Your Python verification scored in the 94th percentile with 0 integrity flags.',
      actionUrl: '/profile',
      metadata: { skill: 'Python', score: 89 },
      isRead: true,
    },
    {
      userId: alex.id,
      type: 'SYSTEM_ALERT',
      title: 'Match Engine Active',
      message: 'Explainable teammate matching is now evaluating candidates based on verified credentials.',
      actionUrl: '/find-teammate',
      isRead: false,
    },
    {
      userId: priya.id,
      type: 'SYSTEM_ALERT',
      title: 'Profile Credibility Rating: 94%',
      message: 'Your profile is currently one of the top verified profiles in Rajasthan.',
      isRead: false,
    },
  ]);
  console.log('✓ Notifications inserted');

  // ─── 8. Audit Logs ────────────────────────────────────────────────────────
  console.log('Inserting audit log entries...');
  await db.insert(auditLogs).values([
    {
      actorId: adminUser.id,
      action: 'CANONICAL_SKILL_REGISTERED',
      entityType: 'SKILL',
      entityId: skillMap['python'],
      details: { name: 'Python', slug: 'python', category: 'Programming' },
    },
    {
      actorId: priya.id,
      action: 'PROJECT_VERIFICATION_INITIATED',
      entityType: 'PROJECT',
      entityId: priyaProj.id,
      details: { name: priyaProj.name, repo: priyaProj.githubUrl },
    },
    {
      actorId: adminUser.id,
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'SYSTEM',
      entityId: 'SYSTEM',
      details: { environment: 'development', version: '2.0.0-production-grade' },
    },
  ]);
  console.log('✓ Audit logs inserted');

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETE! ALL 7 CANDIDATES + CANONICAL SKILLS ACTIVE');
  console.log('======================================================');
  console.log('Credentials:');
  console.log('  Admin:       admin@demo.local     / Admin1234!');
  console.log('  Alex (User): alex@demo.local      / Demo1234!');
  console.log('  Priya (94%): priya@demo.local     / Demo1234!');
  console.log('  Rohan (91%): rohan@demo.local     / Demo1234!');
  console.log('  Aarav (88%): aarav@demo.local     / Demo1234!');
  console.log('  Ananya (96%):ananya@demo.local    / Demo1234!');
  console.log('  Kabir (84%): kabir@demo.local     / Demo1234!');
  console.log('  Ishita (89%):ishita@demo.local    / Demo1234!');
  console.log('  Sahil (82%): sahil@demo.local     / Demo1234!');
  console.log('  Organizer:   organizer@demo.local / Demo1234!');
  console.log('  Recruiter:   recruiter@demo.local / Demo1234!');
  console.log('======================================================\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
