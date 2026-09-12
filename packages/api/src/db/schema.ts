import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, real, pgEnum } from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['candidate', 'organizer', 'recruiter', 'admin']);
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced', 'expert']);
export const verificationStatusEnum = pgEnum('verification_status', ['UNVERIFIED', 'IN_PROGRESS', 'VERIFIED', 'EXPIRED']);
export const sessionStatusEnum = pgEnum('session_status', ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED']);
export const questionTypeEnum = pgEnum('question_type', ['mcq', 'short_answer', 'practical']);
export const integrityEventTypeEnum = pgEnum('integrity_event_type', [
  'TAB_SWITCH', 'FULLSCREEN_EXIT', 'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'CUT_ATTEMPT', 'RIGHT_CLICK',
]);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'accepted', 'rejected', 'withdrawn']);
export const requestDirectionEnum = pgEnum('request_direction', ['invite', 'application']);

// ─── Users & Profiles ────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('candidate'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  education: text('education'),
  resumeUrl: text('resume_url'),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Skills ──────────────────────────────────────────────────────────────────

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const candidateSkills = pgTable('candidate_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id),
  claimedLevel: skillLevelEnum('claimed_level').notNull().default('intermediate'),
  verificationStatus: verificationStatusEnum('verification_status').notNull().default('UNVERIFIED'),
  verifiedScore: real('verified_score'),
  integrityScore: real('integrity_score'),
  lastVerifiedAt: timestamp('last_verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  technologies: jsonb('technologies').$type<string[]>().default([]),
  role: text('role'),
  projectUrl: text('project_url'),
  githubUrl: text('github_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projectSkills = pgTable('project_skills', {
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id),
});

// ─── Assessments ─────────────────────────────────────────────────────────────

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  skillIds: jsonb('skill_ids').$type<string[]>().default([]),
  createdBy: uuid('created_by').references(() => users.id),
  durationMinutes: integer('duration_minutes').notNull().default(30),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  type: questionTypeEnum('type').notNull(),
  body: text('body').notNull(),
  options: jsonb('options').$type<{ id: string; text: string }[]>(),
  correctAnswer: text('correct_answer'),
  expectedTimeSec: integer('expected_time_sec').default(60),
  fastResponseThresholdSec: integer('fast_response_threshold_sec').default(10),
  points: real('points').notNull().default(1),
  order: integer('order').notNull().default(0),
  skillId: uuid('skill_id').references(() => skills.id),
  scoringHints: text('scoring_hints'),
});

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const assessmentSessions = pgTable('assessment_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id),
  candidateSkillId: uuid('candidate_skill_id').references(() => candidateSkills.id),
  status: sessionStatusEnum('status').notNull().default('NOT_STARTED'),
  startedAt: timestamp('started_at'),
  submittedAt: timestamp('submitted_at'),
  expiresAt: timestamp('expires_at'),
  technicalScore: real('technical_score'),
  knowledgeScore: real('knowledge_score'),
  practicalScore: real('practical_score'),
  explanationScore: real('explanation_score'),
  integrityScore: real('integrity_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questionResponses = pgTable('question_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => assessmentSessions.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id),
  answer: text('answer'),
  isCorrect: boolean('is_correct'),
  pointsAwarded: real('points_awarded').default(0),
  startedAt: timestamp('started_at').notNull(),
  answeredAt: timestamp('answered_at'),
  timeSpentMs: integer('time_spent_ms'),
  changedAnswer: boolean('changed_answer').default(false),
  skipped: boolean('skipped').default(false),
  flaggedFast: boolean('flagged_fast').default(false),
  adaptiveFollowup: text('adaptive_followup'),
  adaptiveAnswer: text('adaptive_answer'),
});

export const integrityEvents = pgTable('integrity_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => assessmentSessions.id, { onDelete: 'cascade' }),
  eventType: integrityEventTypeEnum('event_type').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  questionId: uuid('question_id').references(() => questions.id),
  metadata: jsonb('metadata'),
});

export const cameraChecks = pgTable('camera_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => assessmentSessions.id, { onDelete: 'cascade' }),
  promptType: text('prompt_type').notNull(),
  triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
  passed: boolean('passed'),
  timedOut: boolean('timed_out').default(false),
});

export const roughWorkFiles = pgTable('rough_work_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => assessmentSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  fileUrl: text('file_url').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// ─── Hackathons ───────────────────────────────────────────────────────────────

export const hackathons = pgTable('hackathons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  organizerId: uuid('organizer_id').notNull().references(() => users.id),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  registrationDeadline: timestamp('registration_deadline'),
  maxTeamSize: integer('max_team_size').notNull().default(5),
  requiredSkills: jsonb('required_skills').$type<string[]>().default([]),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hackathonParticipants = pgTable('hackathon_participants', {
  hackathonId: uuid('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  hackathonId: uuid('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  requiredSkills: jsonb('required_skills').$type<string[]>().default([]),
  maxMembers: integer('max_members').notNull().default(5),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const teamMembers = pgTable('team_members', {
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const teamRequests = pgTable('team_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  fromUserId: uuid('from_user_id').notNull().references(() => users.id),
  toUserId: uuid('to_user_id').notNull().references(() => users.id),
  direction: requestDirectionEnum('direction').notNull(),
  status: requestStatusEnum('status').notNull().default('pending'),
  message: text('message'),
  verificationSessionId: uuid('verification_session_id').references(() => assessmentSessions.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Project Verification & Trust Analysis ──────────────────────────────────

export const projectAnalyses = pgTable('project_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('QUEUED'), // QUEUED, RUNNING, COMPLETED, FAILED
  overallScore: real('overall_score'),
  confidence: real('confidence'),
  verificationCode: text('verification_code').unique(),
  breakdownJson: jsonb('breakdown_json'),
  reportJson: jsonb('report_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const analysisAgentRuns = pgTable('analysis_agent_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id').notNull().references(() => projectAnalyses.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull(),
  agentName: text('agent_name').notNull(),
  status: text('status').notNull().default('QUEUED'),
  score: real('score'),
  weight: real('weight').notNull().default(0),
  confidence: real('confidence'),
  summary: text('summary'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analysisFindings = pgTable('analysis_findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id').notNull().references(() => projectAnalyses.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  risk: text('risk').notNull().default('INFO'), // CRITICAL, HIGH, MEDIUM, LOW, INFO
  confidence: real('confidence').notNull().default(80),
  location: text('location').notNull(),
  detectionMethod: text('detection_method').notNull(),
  reasoning: text('reasoning').notNull(),
  falsePositiveExplanation: text('false_positive_explanation'),
  recommendation: text('recommendation').notNull(),
  evidenceSnippet: text('evidence_snippet'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
