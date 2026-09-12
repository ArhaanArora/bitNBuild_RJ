import { Candidate, CandidateMatch, TeamRequirement } from '../types/buddy';

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Priya Sharma',
    college: 'Thapar Institute of Eng. & Tech.',
    location: 'Patiala, Punjab',
    role: 'UI/UX Designer',
    experienceLevel: 'Advanced',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    headline: 'Product Designer & Design Systems Architect',
    bio: 'Passionate about human-centered design systems, micro-interactions, and accessible UI. 3x hackathon winner specializing in turning messy problem statements into production-ready Figma prototypes.',
    credibilityScore: 95,
    assessmentOverallScore: 93,
    portfolioEvidenceRating: 'Strong',
    githubEvidenceStatus: 'Active Commits',
    hackathonsAttended: 4,
    availability: 'Available Now',
    skills: [
      {
        name: 'Figma',
        category: 'Design',
        status: 'VERIFIED',
        score: 96,
        assessmentScore: 95,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Scored in top 2% on Component Variant & Token Architecture benchmark.',
      },
      {
        name: 'UI/UX',
        category: 'Design',
        status: 'VERIFIED',
        score: 94,
        assessmentScore: 92,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Wireframes and usability testing metrics validated against live case studies.',
      },
      {
        name: 'Prototyping',
        category: 'Design',
        status: 'VERIFIED',
        score: 91,
        assessmentScore: 90,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'High-fidelity mobile flows verified with interactive transition logic.',
      },
      {
        name: 'TailwindCSS',
        category: 'Frontend',
        status: 'VERIFIED',
        score: 88,
        assessmentScore: 89,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Component library implementation verified on GitHub repository.',
      },
      {
        name: 'User Research',
        category: 'Design',
        status: 'CLAIMED',
        score: 78,
        portfolioRating: 'Moderate',
        evidenceSummary: 'Self-reported heuristic evaluation coursework; no platform proctored exam yet.',
      },
    ],
    projects: [
      {
        title: 'PulseCare — Telehealth Patient Portal',
        role: 'Lead UI/UX Designer & Prototyper',
        tech: ['Figma', 'Prototyping', 'TailwindCSS', 'Design Tokens'],
        description: 'Complete end-to-end appointment booking and triage dashboard with 40+ interactive components and WCAG AAA color contrast.',
        evidenceNotes: 'Portfolio case study validated with user journey maps and live Figma prototype link.',
        liveUrl: 'https://figma.com/@priya_pulsecare_demo',
        githubUrl: 'https://github.com/priyasharma-demo/pulsecare-ui',
      },
      {
        title: 'FinTrack — Micro-Budgeting App',
        role: 'Product Designer',
        tech: ['Figma', 'UI/UX', 'Mobile Design'],
        description: 'Gamified spending tracker built during TIET HackFest 2025; won 1st Place for Most Intuitive Interface.',
        evidenceNotes: 'Verified hackathon submission badge and judge appraisal report on file.',
      },
    ],
    contact: {
      email: 'priya.sharma.design@demo.mail',
      phone: '+91 98765 43210',
      discord: 'priya_ux#4412',
      preferred: 'Discord',
    },
  },
  {
    id: 'cand-2',
    name: 'Rohan Verma',
    college: 'PEC Chandigarh',
    location: 'Chandigarh',
    role: 'Full-Stack Developer',
    experienceLevel: 'Advanced',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    headline: 'High-Performance Web Systems & API Engineer',
    bio: 'Full-stack developer focused on TypeScript, React, and scalable Node.js architectures. Love building reliable real-time collaborative apps under 36-hour hackathon deadlines.',
    credibilityScore: 93,
    assessmentOverallScore: 92,
    portfolioEvidenceRating: 'Strong',
    githubEvidenceStatus: 'Verified Repos',
    hackathonsAttended: 5,
    availability: 'Available Now',
    skills: [
      {
        name: 'React',
        category: 'Frontend',
        status: 'VERIFIED',
        score: 95,
        assessmentScore: 94,
        portfolioRating: 'Strong',
        githubStatus: 'Verified Repos',
        evidenceSummary: 'Custom hooks, state normalization, and virtualized list verified via live code runner.',
      },
      {
        name: 'TypeScript',
        category: 'Language',
        status: 'VERIFIED',
        score: 92,
        assessmentScore: 91,
        portfolioRating: 'Strong',
        githubStatus: 'Verified Repos',
        evidenceSummary: 'Generics and discriminated union patterns evaluated in timed coding assessment.',
      },
      {
        name: 'Node.js',
        category: 'Backend',
        status: 'VERIFIED',
        score: 90,
        assessmentScore: 89,
        portfolioRating: 'Strong',
        githubStatus: 'Verified Repos',
        evidenceSummary: 'Express middleware, async worker threads, and rate-limiting patterns verified.',
      },
      {
        name: 'PostgreSQL',
        category: 'Database',
        status: 'VERIFIED',
        score: 89,
        assessmentScore: 88,
        portfolioRating: 'Strong',
        githubStatus: 'Verified Repos',
        evidenceSummary: 'Indexed queries, relational schema migrations, and transactions tested.',
      },
      {
        name: 'Docker',
        category: 'DevOps',
        status: 'CLAIMED',
        score: 76,
        portfolioRating: 'Moderate',
        evidenceSummary: 'Multi-stage Dockerfiles present in GitHub repos; no formal assessment completed.',
      },
    ],
    projects: [
      {
        title: 'SyncBoard — Realtime Collaborative Canvas',
        role: 'Full-Stack Lead',
        tech: ['React', 'TypeScript', 'Node.js', 'WebSocket', 'Redis'],
        description: 'Multiplayer whiteboard handling 100+ concurrent cursor updates with zero lag using optimistic CRDT synchronization.',
        evidenceNotes: 'Public GitHub repo with 140+ verified commits and production deployment on Render.',
        liveUrl: 'https://syncboard-demo.app',
        githubUrl: 'https://github.com/rohanverma-demo/syncboard',
      },
    ],
    contact: {
      email: 'rohan.verma.dev@demo.mail',
      phone: '+91 98123 45678',
      discord: 'rohan_v#1029',
      preferred: 'Email',
    },
  },
  {
    id: 'cand-3',
    name: 'Aarav Mehta',
    college: 'IIT Jodhpur',
    location: 'Jodhpur, Rajasthan',
    role: 'AI/ML Engineer',
    experienceLevel: 'Expert',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    headline: 'LLM Systems, Fine-Tuning & Multi-Agent RAG',
    bio: 'Senior undergrad researching RAG evaluation and agentic tool-use pipelines. Experienced with PyTorch, LangChain, vector databases, and lightweight model inference optimization.',
    credibilityScore: 96,
    assessmentOverallScore: 95,
    portfolioEvidenceRating: 'Strong',
    githubEvidenceStatus: 'Verified Repos',
    hackathonsAttended: 6,
    availability: 'Available Now',
    skills: [
      {
        name: 'Python',
        category: 'Language',
        status: 'VERIFIED',
        score: 97,
        assessmentScore: 96,
        portfolioRating: 'Strong',
        githubStatus: 'Verified Repos',
        evidenceSummary: 'Top 1% algorithmic problem solving score & memory management benchmark.',
      },
      {
        name: 'PyTorch',
        category: 'AI/ML',
        status: 'VERIFIED',
        score: 94,
        assessmentScore: 93,
        portfolioRating: 'Strong',
        githubStatus: 'Verified Repos',
        evidenceSummary: 'Custom loss function and GPU batch training pipeline verified via repository audit.',
      },
      {
        name: 'LangChain',
        category: 'AI/ML',
        status: 'VERIFIED',
        score: 91,
        assessmentScore: 90,
        portfolioRating: 'Strong',
        githubStatus: 'Verified Repos',
        evidenceSummary: 'Retrieval augmentation pipelines with hybrid keyword-vector indexing validated.',
      },
      {
        name: 'FastAPI',
        category: 'Backend',
        status: 'VERIFIED',
        score: 90,
        assessmentScore: 89,
        portfolioRating: 'Strong',
        githubStatus: 'Verified Repos',
        evidenceSummary: 'Async model streaming endpoints and Pydantic schema validation evaluated.',
      },
      {
        name: 'Computer Vision',
        category: 'AI/ML',
        status: 'CLAIMED',
        score: 80,
        portfolioRating: 'Moderate',
        evidenceSummary: 'Claimed coursework in YOLO and OpenCV; platform assessment pending.',
      },
    ],
    projects: [
      {
        title: 'VeritasRAG — Automated Grounded Truth Evaluator',
        role: 'AI Researcher & Backend Dev',
        tech: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'ChromaDB'],
        description: 'Multi-agent hallucination detector comparing LLM output sentences against indexed raw PDF evidence with semantic attribution scores.',
        evidenceNotes: 'Accepted for presentation at Student AI Summit; GitHub codebase fully open-sourced.',
        githubUrl: 'https://github.com/aaravmehta-demo/veritas-rag',
      },
    ],
    contact: {
      email: 'aarav.mehta.ai@demo.mail',
      phone: '+91 97234 56789',
      discord: 'aarav_ai#8821',
      preferred: 'Discord',
    },
  },
  {
    id: 'cand-4',
    name: 'Ananya Gupta',
    college: 'BITS Pilani',
    location: 'Pilani, Rajasthan',
    role: 'Frontend Developer',
    experienceLevel: 'Advanced',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    headline: 'Creative Frontend Technologist & 3D WebGL Explorer',
    bio: 'Crafting buttery smooth web interfaces with React, Next.js, and Three.js/R3F. Believes that visual wow-factor combined with strict accessibility creates winning hackathon submissions.',
    credibilityScore: 91,
    assessmentOverallScore: 90,
    portfolioEvidenceRating: 'Strong',
    githubEvidenceStatus: 'Active Commits',
    hackathonsAttended: 3,
    availability: 'Available Now',
    skills: [
      {
        name: 'React',
        category: 'Frontend',
        status: 'VERIFIED',
        score: 93,
        assessmentScore: 92,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Demonstrated mastery in React hooks, memory profiler optimization, and code splitting.',
      },
      {
        name: 'Next.js',
        category: 'Frontend',
        status: 'VERIFIED',
        score: 90,
        assessmentScore: 89,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Server Components, dynamic route handlers, and streaming SSR verified.',
      },
      {
        name: 'Three.js',
        category: 'Frontend',
        status: 'VERIFIED',
        score: 89,
        assessmentScore: 88,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'WebGL shader logic, orbit controls, and mesh performance tested in lab session.',
      },
      {
        name: 'TailwindCSS',
        category: 'Frontend',
        status: 'VERIFIED',
        score: 95,
        assessmentScore: 94,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Responsive grid architecture and custom plugin extensions evaluated.',
      },
      {
        name: 'Figma',
        category: 'Design',
        status: 'CLAIMED',
        score: 79,
        portfolioRating: 'Moderate',
        evidenceSummary: 'Self-proclaimed UI designer; imports Figma assets into code with fidelity.',
      },
    ],
    projects: [
      {
        title: 'Solaris — Interactive 3D Planetarium Experience',
        role: 'Frontend Architect',
        tech: ['Next.js', 'Three.js', 'TailwindCSS', 'Web Audio API'],
        description: 'Spatial solar system simulator with real celestial coordinates, ambient synth audio, and 60fps WebGL rendering.',
        evidenceNotes: 'Lighthouse accessibility score 98/100, live domain verified.',
        liveUrl: 'https://solaris-3d-demo.vercel.app',
        githubUrl: 'https://github.com/ananyagupta-demo/solaris-3d',
      },
    ],
    contact: {
      email: 'ananya.gupta.web@demo.mail',
      phone: '+91 96543 21098',
      discord: 'ananya_g#3310',
      preferred: 'Discord',
    },
  },
  {
    id: 'cand-5',
    name: 'Kabir Singh',
    college: 'MNIT Jaipur',
    location: 'Jaipur, Rajasthan',
    role: 'Backend Developer',
    experienceLevel: 'Advanced',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
    headline: 'High-Concurrency Go & Distributed Cloud Engineer',
    bio: 'Systems engineer obsessed with low latency, robust database transactions, and zero-downtime microservices. Can bootstrap a production-ready cloud backend in under 4 hours.',
    credibilityScore: 89,
    assessmentOverallScore: 91,
    portfolioEvidenceRating: 'Moderate',
    githubEvidenceStatus: 'Active Commits',
    hackathonsAttended: 4,
    availability: 'Looking for Team',
    skills: [
      {
        name: 'Go',
        category: 'Language',
        status: 'VERIFIED',
        score: 93,
        assessmentScore: 92,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Goroutines, channels, and benchmarked memory pooling verified in timed test.',
      },
      {
        name: 'Python',
        category: 'Language',
        status: 'VERIFIED',
        score: 89,
        assessmentScore: 88,
        portfolioRating: 'Moderate',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Asyncio, Celery queues, and ORM query optimization validated.',
      },
      {
        name: 'Docker',
        category: 'DevOps',
        status: 'VERIFIED',
        score: 88,
        assessmentScore: 87,
        portfolioRating: 'Moderate',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Multi-stage build pipelines and container networking audited in project test.',
      },
      {
        name: 'PostgreSQL',
        category: 'Database',
        status: 'VERIFIED',
        score: 87,
        assessmentScore: 86,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'EXPLAIN ANALYZE tuning and ACID boundary design verified.',
      },
      {
        name: 'Kubernetes',
        category: 'DevOps',
        status: 'CLAIMED',
        score: 75,
        portfolioRating: 'Limited',
        evidenceSummary: 'Self-reported experience deploying Helm charts on Minikube.',
      },
    ],
    projects: [
      {
        title: 'KubeStream — Event Ingestion Pipeline',
        role: 'Backend Architect',
        tech: ['Go', 'PostgreSQL', 'Docker', 'Redis'],
        description: 'High-throughput event queue processing 12,000 requests/sec with persistent PostgreSQL write batches.',
        evidenceNotes: 'Load test results and benchmark script included in repository.',
        githubUrl: 'https://github.com/kabirsingh-demo/kubestream-engine',
      },
    ],
    contact: {
      email: 'kabir.singh.cloud@demo.mail',
      phone: '+91 95432 10987',
      discord: 'kabir_go#7182',
      preferred: 'Phone',
    },
  },
  {
    id: 'cand-6',
    name: 'Ishita Sen',
    college: 'Chitkara University',
    location: 'Rajpura / Chandigarh',
    role: 'UI/UX Designer',
    experienceLevel: 'Intermediate',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    headline: 'User Researcher & Visual Interface Specialist',
    bio: 'Product thinker focused on accessibility, user interviews, and iterative design sprints. Experienced in creating complete pitch decks and interactive prototypes for startup hackathons.',
    credibilityScore: 87,
    assessmentOverallScore: 86,
    portfolioEvidenceRating: 'Strong',
    githubEvidenceStatus: 'Partial',
    hackathonsAttended: 2,
    availability: 'Available Now',
    skills: [
      {
        name: 'Figma',
        category: 'Design',
        status: 'VERIFIED',
        score: 89,
        assessmentScore: 88,
        portfolioRating: 'Strong',
        githubStatus: 'Partial',
        evidenceSummary: 'Auto-layout, responsive constraints, and typography scales tested.',
      },
      {
        name: 'UI/UX',
        category: 'Design',
        status: 'VERIFIED',
        score: 87,
        assessmentScore: 86,
        portfolioRating: 'Strong',
        githubStatus: 'Partial',
        evidenceSummary: 'Cognitive walkthrough and information architecture diagrams validated.',
      },
      {
        name: 'Wireframing',
        category: 'Design',
        status: 'VERIFIED',
        score: 86,
        assessmentScore: 85,
        portfolioRating: 'Strong',
        githubStatus: 'Partial',
        evidenceSummary: 'Low-to-high fidelity user flow translations verified in platform assessment.',
      },
      {
        name: 'Prototyping',
        category: 'Design',
        status: 'CLAIMED',
        score: 76,
        portfolioRating: 'Moderate',
        evidenceSummary: 'Figma prototypes present in portfolio; timed assessment not yet taken.',
      },
      {
        name: 'HTML/CSS',
        category: 'Frontend',
        status: 'CLAIMED',
        score: 72,
        portfolioRating: 'Moderate',
        evidenceSummary: 'Basic markup knowledge used to inspect and polish design handoffs.',
      },
    ],
    projects: [
      {
        title: 'MedEcho — Rural Prescription Reader',
        role: 'Lead UI/UX Researcher',
        tech: ['Figma', 'User Research', 'Wireframing'],
        description: 'Inclusive voice-first interface designed for regional language speakers to decode and schedule medical doses.',
        evidenceNotes: 'Case study backed by 15 user testing recordings and survey data.',
        liveUrl: 'https://figma.com/@ishita_medecho_case',
      },
    ],
    contact: {
      email: 'ishita.sen.ux@demo.mail',
      phone: '+91 94321 09876',
      discord: 'ishita_s#9142',
      preferred: 'Discord',
    },
  },
  {
    id: 'cand-7',
    name: 'Sahil Malik',
    college: 'Thapar Institute of Eng. & Tech.',
    location: 'Patiala, Punjab',
    role: 'Frontend Developer',
    experienceLevel: 'Intermediate',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    headline: 'Cross-Platform App & Frontend Developer',
    bio: 'Builder of responsive cross-platform apps using Flutter and React. Experienced with Firebase backends, offline-first storage, and clean UI animations.',
    credibilityScore: 88,
    assessmentOverallScore: 89,
    portfolioEvidenceRating: 'Moderate',
    githubEvidenceStatus: 'Active Commits',
    hackathonsAttended: 3,
    availability: 'Looking for Team',
    skills: [
      {
        name: 'Flutter',
        category: 'Mobile',
        status: 'VERIFIED',
        score: 92,
        assessmentScore: 91,
        portfolioRating: 'Moderate',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Bloc state management, animation controllers, and native bridges validated.',
      },
      {
        name: 'React',
        category: 'Frontend',
        status: 'VERIFIED',
        score: 88,
        assessmentScore: 87,
        portfolioRating: 'Moderate',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Standard component patterns and REST API integration verified.',
      },
      {
        name: 'Firebase',
        category: 'Backend',
        status: 'VERIFIED',
        score: 87,
        assessmentScore: 88,
        portfolioRating: 'Strong',
        githubStatus: 'Active Commits',
        evidenceSummary: 'Firestore security rules and authentication triggers tested.',
      },
      {
        name: 'TailwindCSS',
        category: 'Frontend',
        status: 'CLAIMED',
        score: 78,
        portfolioRating: 'Moderate',
        evidenceSummary: 'Used in personal portfolio website; assessment not completed.',
      },
    ],
    projects: [
      {
        title: 'CampusRide — Peer Carpooling App',
        role: 'Mobile Lead',
        tech: ['Flutter', 'Firebase', 'Google Maps API'],
        description: 'Verified student carpooling network across Patiala & Chandigarh with live GPS tracking and split payment.',
        evidenceNotes: 'Published on Google Play internal testing track with 150+ student testers.',
        githubUrl: 'https://github.com/sahilmalik-demo/campus-ride',
      },
    ],
    contact: {
      email: 'sahil.malik.app@demo.mail',
      phone: '+91 93210 98765',
      discord: 'sahil_m#5201',
      preferred: 'Email',
    },
  },
];

/**
 * Deterministically computes match percentage and 3-4 transparent, honest reasoning bullets
 */
export function computeCandidateMatch(
  candidate: Candidate,
  req: TeamRequirement
): CandidateMatch {
  let score = 0;
  const reasoningBullets: string[] = [];
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const verificationHighlights: string[] = [];

  // 1. Role match (up to 30 points)
  const reqRoleLower = req.role.toLowerCase().trim();
  const candRoleLower = candidate.role.toLowerCase().trim();

  const isExactRole = reqRoleLower === candRoleLower || reqRoleLower === 'any' || reqRoleLower === 'all';
  const isPartialRole =
    reqRoleLower.includes('designer') && candRoleLower.includes('design') ||
    reqRoleLower.includes('frontend') && candRoleLower.includes('frontend') ||
    reqRoleLower.includes('backend') && candRoleLower.includes('backend') ||
    reqRoleLower.includes('ai') && candRoleLower.includes('ml') ||
    candRoleLower.includes('full-stack');

  if (isExactRole) {
    score += 30;
  } else if (isPartialRole) {
    score += 24;
  } else {
    score += 10;
  }

  // 2. Required skills match (up to 40 points)
  const reqSkills = req.requiredSkills.map(s => s.toLowerCase().trim()).filter(Boolean);
  let verifiedMatches = 0;
  let claimedMatches = 0;

  for (const rSkill of reqSkills) {
    const found = candidate.skills.find(
      s => s.name.toLowerCase().trim() === rSkill || rSkill.includes(s.name.toLowerCase().trim())
    );
    if (found) {
      matchedSkills.push(found.name);
      if (found.status === 'VERIFIED') {
        verifiedMatches++;
        verificationHighlights.push(`${found.name} (${found.score}%)`);
      } else {
        claimedMatches++;
      }
    } else {
      missingSkills.push(rSkill);
    }
  }

  if (reqSkills.length > 0) {
    const skillRatio = (verifiedMatches * 1.0 + claimedMatches * 0.6) / reqSkills.length;
    score += Math.min(40, Math.round(skillRatio * 40));

    // Bullet 1: Skills verification summary
    if (verifiedMatches === reqSkills.length) {
      reasoningBullets.push(`✓ ${verifiedMatches}/${reqSkills.length} required skills verified by platform assessments`);
    } else if (verifiedMatches > 0) {
      reasoningBullets.push(`✓ ${verifiedMatches}/${reqSkills.length} required skills verified (${claimedMatches} self-claimed)`);
    } else if (claimedMatches > 0) {
      reasoningBullets.push(`○ ${claimedMatches}/${reqSkills.length} skills claimed, awaiting assessment verification`);
    } else {
      reasoningBullets.push(`○ No direct skill overlap with your ${reqSkills.length} required skills`);
    }
  } else {
    score += 35;
    reasoningBullets.push(`✓ Broad competency profile across ${candidate.skills.length} technical domains`);
  }

  // 3. Credibility & Assessment Score (up to 20 points)
  const credPoints = Math.round((candidate.credibilityScore / 100) * 20);
  score += credPoints;

  // Bullet 2: Assessment strength
  if (candidate.assessmentOverallScore >= 90) {
    reasoningBullets.push(`✓ Top-tier platform assessment score (${candidate.assessmentOverallScore}%) in ${candidate.role}`);
  } else if (candidate.assessmentOverallScore >= 80) {
    reasoningBullets.push(`✓ Solid verified assessment benchmark (${candidate.assessmentOverallScore}%)`);
  } else {
    reasoningBullets.push(`○ Assessment benchmark (${candidate.assessmentOverallScore}%) below top quartile`);
  }

  // 4. Portfolio & GitHub Evidence (up to 10 points)
  if (candidate.portfolioEvidenceRating === 'Strong') {
    score += 5;
    reasoningBullets.push(`✓ Portfolio case studies strongly back claimed production experience`);
  } else if (candidate.portfolioEvidenceRating === 'Moderate') {
    score += 3;
    reasoningBullets.push(`○ Portfolio provides partial coverage of claimed production projects`);
  } else {
    reasoningBullets.push(`○ Limited independent portfolio evidence on file`);
  }

  if (candidate.githubEvidenceStatus === 'Verified Repos') {
    score += 5;
    reasoningBullets.push(`✓ GitHub evidence verified with active production repositories`);
  } else if (candidate.githubEvidenceStatus === 'Active Commits') {
    score += 4;
    reasoningBullets.push(`✓ Active commit history corroborates daily code contributions`);
  } else {
    reasoningBullets.push(`○ GitHub activity is partial or unlinked`);
  }

  // Cap score between 40 and 99
  const finalMatchScore = Math.min(98, Math.max(45, score));

  return {
    candidate,
    matchScore: finalMatchScore,
    reasoningBullets: reasoningBullets.slice(0, 4),
    matchedSkills,
    missingSkills,
    verificationHighlights,
  };
}
