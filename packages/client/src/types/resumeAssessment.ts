export interface ResumeAnalysis {
  resumeId: string;
  userId: string;
  extractedSkills: string[];
  extractedTools: string[];
  projects: { name: string; description: string; skillsUsed: string[] }[];
  likelyExpertiseAreas: string[];
  rawTextHash: string;
  createdAt: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'objective' | 'subjective';
  options?: string[]; // length 4 if objective
  correctAnswer?: string; // stored/revealed for local-first grading
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IntegrityEvent {
  type: 'fullscreen_exit' | 'tab_blur' | 'visibility_hidden' | 'nav_attempt';
  timestamp: string;
}

export interface AssessmentSessionData {
  assessmentId: string;
  startedAt: string;
  deadline: string;
  timeLimitSeconds: number; // 3600
  questions: AssessmentQuestion[];
}

export interface SubmittedAnswer {
  questionId: string;
  answer: string;
}

export interface QuestionTelemetry {
  questionId: string;
  timeDisplayedMs: number;
  timeAnsweredMs: number;
  durationMs: number;
}

export interface CameraCheckRecord {
  triggeredAt: string;
  status: 'completed' | 'dismissed' | 'not_available' | 'timed_out';
  durationSeconds: number;
}

export interface RoughWorkEvidence {
  provided: boolean;
  imageUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  uploadedAt?: string;
}

export interface RapidFireQuestion {
  id: string;
  prompt: string;
  relatedSkill: string;
  contextType: 'edge_case' | 'trade_off' | 'reasoning' | 'consequence';
  options: string[];
  correctOptionIndex: number;
}

export interface RapidFireAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  selectedText?: string;
  durationMs: number;
  skipped: boolean;
  correct: boolean;
}

export interface MultiSignalEvaluation {
  answerAccuracy: number; // 0 - 100
  responseConsistency: 'Strong' | 'Moderate' | 'Review Recommended';
  assessmentSpeed: 'Fast' | 'Consistent' | 'Deliberate';
  rapidFirePerformance: 'Strong' | 'Moderate' | 'Limited';
  integritySignals: 'Low Concern' | 'Moderate Concern' | 'Review Recommended';
  supportingEvidence: 'Provided' | 'Not Provided';
  compositeCredibilityScore: number; // 0 - 100
  verificationLevel: 'Strong Evidence' | 'Moderate Evidence' | 'Limited Evidence';
  verifiedSkills: Array<{
    name: string;
    score: number;
    status: 'VERIFIED' | 'CLAIMED';
    evidence: string;
  }>;
  integrityDetails: {
    totalDurationSeconds: number;
    avgResponseTimeSeconds: number;
    tabSwitches: number;
    fullscreenExits: number;
    cameraCheckStatus: string;
    roughWorkProvided: boolean;
    rapidFireCompleted: string;
    flags: string[];
  };
}

export interface QuestionResult {
  questionId: string;
  question?: string;
  skill?: string;
  type?: 'objective' | 'subjective';
  candidateAnswer?: string;
  correctAnswer?: string;
  correct?: boolean;
  score?: number; // 0-100
  rationale?: string;
  durationMs?: number;
}

export interface EvaluationResult {
  overallScore: number; // 0-100
  skillScores: Record<string, number>;
  questionResults: QuestionResult[];
  verificationLevel: 'Strong Evidence' | 'Moderate Evidence' | 'Limited Evidence' | 'Insufficient Evidence';
  integrityEventsCount: number;
  multiSignal?: MultiSignalEvaluation;
  roughWork?: RoughWorkEvidence;
  telemetrySummary?: {
    totalDurationSeconds: number;
    avgResponseTimeSeconds: number;
    fastestResponseSeconds: number;
    slowestResponseSeconds: number;
  };
}
