export type SkillVerificationStatus = 'VERIFIED' | 'CLAIMED';
export type PortfolioEvidenceRating = 'Strong' | 'Moderate' | 'Limited';
export type GithubEvidenceStatus = 'Verified Repos' | 'Active Commits' | 'Partial' | 'Unverified';
export type ExperienceTier = 'Entry' | 'Intermediate' | 'Senior' | 'Lead' | 'Any';
export type JobTypePreference = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
export type CandidateAvailability = 'Available Now' | 'Part-time' | 'Open to Offers' | '2 Weeks Notice';

export interface HiringSkill {
  name: string;
  category?: string;
  status: SkillVerificationStatus;
  score?: number; // 0 - 100
  assessmentScore?: number; // 0 - 100
  selfDeclaredProficiency?: 'Beginner' | 'Intermediate' | 'Advanced';
  portfolioRating?: PortfolioEvidenceRating;
  githubStatus?: GithubEvidenceStatus;
  evidenceSummary?: string;
}

export interface HiringProject {
  title: string;
  role: string;
  tech: string[];
  description: string;
  evidenceNotes: string;
  liveUrl?: string;
  githubUrl?: string;
  isVerified?: boolean;
}

export interface HiringContact {
  email: string;
  phone: string;
  whatsapp?: string;
  preferred: 'Email' | 'WhatsApp' | 'Phone';
  isOptedIn: boolean; // Consent flag: visibility activated via Get Hired
}

export interface HiringCandidate {
  id: string;
  name: string;
  role: string;
  college: string;
  location: string;
  experienceTier: ExperienceTier;
  avatar: string;
  headline: string;
  bio: string;
  credibilityScore: number; // 0 - 100 (consistent with platform credibility)
  assessmentScore: number; // 0 - 100 (overall platform assessment)
  verifiedProjectsCount: number;
  portfolioEvidence: PortfolioEvidenceRating;
  githubEvidence: GithubEvidenceStatus;
  skills: HiringSkill[];
  projects: HiringProject[];
  contact: HiringContact;
  availability: CandidateAvailability;
  resume?: {
    name: string;
    url?: string;
    sizeBytes?: number;
    uploadedAt?: string;
  };
  isCurrentUser?: boolean; // For when the current user opts into Get Hired
  integrityRating?: 'Low Concern' | 'Moderate Concern' | 'Review Recommended';
  supportingEvidence?: string[];
  roughWorkUrl?: string;
}

export interface HiringRequirement {
  role: string;
  requiredSkills: string[];
  experience: string; // 'Any' | 'Entry' | 'Intermediate' | 'Senior'
  location: string; // 'Nearby' | 'Remote' | 'Delhi NCR' | 'Bangalore' | 'Mumbai' | 'All Locations'
  jobType?: JobTypePreference;
}

export interface HiringMatch {
  candidate: HiringCandidate;
  matchScore: number; // 0 - 100
  reasoningBullets: string[];
  matchedSkills: string[];
  missingSkills: string[];
  verifiedSkillCount: number;
  claimedSkillCount: number;
}

export interface UserHiringProfile {
  skills: HiringSkill[];
  resume: {
    name: string;
    size: number;
    lastModified: number;
  } | null;
  recruiterVisibility: boolean; // 🟢 ON or ⚪ OFF
  activated: boolean;
  updatedAt: string;
  credibilityScore?: number;
  integrityRating?: 'Low Concern' | 'Moderate Concern' | 'Review Recommended';
  supportingEvidence?: string[];
  roughWorkUrl?: string;
}
