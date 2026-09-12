export type SkillStatus = 'VERIFIED' | 'CLAIMED';
export type PortfolioEvidenceRating = 'Strong' | 'Moderate' | 'Limited';
export type GithubEvidenceStatus = 'Verified Repos' | 'Active Commits' | 'Partial' | 'Unverified';
export type ExperienceTier = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type CandidateAvailability = 'Available Now' | 'Part-time' | 'Looking for Team';

export interface SkillEvidenceItem {
  name: string;
  category: string;
  status: SkillStatus;
  score: number; // 0 - 100
  assessmentScore?: number; // 0 - 100
  portfolioRating?: PortfolioEvidenceRating;
  githubStatus?: GithubEvidenceStatus;
  evidenceSummary?: string;
}

export interface ProjectEvidence {
  title: string;
  role: string;
  tech: string[];
  description: string;
  evidenceNotes: string;
  liveUrl?: string;
  githubUrl?: string;
}

export interface CandidateContact {
  email: string;
  phone: string;
  discord: string;
  preferred: 'Discord' | 'Email' | 'Phone';
}

export interface Candidate {
  id: string;
  name: string;
  college: string;
  location: string;
  role: string;
  experienceLevel: ExperienceTier;
  avatar: string;
  headline: string;
  bio: string;
  credibilityScore: number; // 0 - 100
  assessmentOverallScore: number; // 0 - 100
  portfolioEvidenceRating: PortfolioEvidenceRating;
  githubEvidenceStatus: GithubEvidenceStatus;
  skills: SkillEvidenceItem[];
  projects: ProjectEvidence[];
  contact: CandidateContact;
  hackathonsAttended: number;
  availability: CandidateAvailability;
}

export interface TeamRequirement {
  role: string;
  requiredSkills: string[];
  optionalSkills?: string[];
  experienceLevel: string; // 'Any' | 'Beginner' | 'Intermediate' | 'Advanced'
  locationPreference: string; // 'Nearby' | 'All' | specific city
  hackathon: string;
}

export interface CandidateMatch {
  candidate: Candidate;
  matchScore: number; // 0 - 100
  reasoningBullets: string[];
  matchedSkills: string[];
  missingSkills: string[];
  verificationHighlights: string[];
}

export type CandidateRequestState = 'IDLE' | 'REQUEST_SENT' | 'CHALLENGE_SENT';
