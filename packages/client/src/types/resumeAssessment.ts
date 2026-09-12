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
}

export interface EvaluationResult {
  overallScore: number; // 0-100
  skillScores: Record<string, number>;
  questionResults: QuestionResult[];
  verificationLevel: 'Strong Evidence' | 'Moderate Evidence' | 'Limited Evidence' | 'Insufficient Evidence';
  integrityEventsCount: number;
}
