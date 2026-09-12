export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type AIAssistanceLikelihood = 'Low' | 'Moderate' | 'High' | 'Inconclusive';

export type VerificationBadge = 
  | 'PLATINUM_VERIFIED'
  | 'GOLD_VERIFIED'
  | 'SILVER_VERIFIED'
  | 'FLAGGED_REVIEW'
  | 'UNVERIFIED';

export interface Finding {
  id: string;
  agentId: string;
  category: string;
  title: string;
  risk: RiskLevel;
  confidence: number; // 0 - 100
  location: string;
  detectionMethod: string;
  reasoning: string;
  falsePositiveExplanation: string;
  recommendation: string;
  evidenceSnippet?: string;
}

export interface AgentResult {
  agentId: string;
  name: string;
  weight: number;
  score: number; // 0 - 100
  confidence: number; // 0 - 100
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  summary: string;
  findings: Finding[];
  metrics?: Record<string, any>;
}

export interface TrustScoreBreakdown {
  overallScore: number; // 0 - 100
  codeQualityScore: number; // 0 - 15
  functionalityScore: number; // 0 - 15
  securityScore: number; // 0 - 15
  skillVerificationScore: number; // 0 - 15
  architectureScore: number; // 0 - 10
  documentationScore: number; // 0 - 10
  claimConsistencyScore: number; // 0 - 10
  authorshipScore: number; // 0 - 5
  aiAssistanceScore: number; // 0 - 5
  aiAssistanceLikelihood: AIAssistanceLikelihood;
  overallConfidence: number; // 0 - 100
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  humanReviewRecommended: boolean;
  verificationBadge: VerificationBadge;
}

export interface ConstellationNode {
  id: string;
  label: string;
  role: 'core' | 'satellite';
  agentId?: string;
  score: number;
  weight: number;
  confidence: number;
  risk: RiskLevel;
  color: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  findingsCount: number;
  description: string;
}

export interface ConstellationEdge {
  source: string;
  target: string;
  type: 'synergy' | 'contradiction' | 'flow';
  intensity: number; // 0 - 1
  pulseRate: number;
  label?: string;
}

export interface ConstellationSceneData {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  particleCount: number;
  ambientTheme: 'emerald' | 'amber' | 'rose' | 'neutral';
}

export interface ProjectVerificationReport {
  id: string;
  projectId: string;
  projectName: string;
  verificationCode: string;
  verifiedAt: string;
  submissionType: 'github' | 'zip' | 'url' | 'local';
  sourceUrl?: string;
  claimedSkills: string[];
  breakdown: TrustScoreBreakdown;
  agents: AgentResult[];
  constellation: ConstellationSceneData;
  projectSummary: {
    description: string;
    techStack: string[];
    architectureSummary: string;
    codeLines: number;
    filesCount: number;
  };
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    targetAgent: string;
  }>;
}
