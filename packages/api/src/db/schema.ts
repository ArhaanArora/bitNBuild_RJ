import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, real, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['candidate', 'organizer', 'recruiter', 'admin']);
export const adminRoleEnum = pgEnum('admin_role', ['super_admin', 'security_admin', 'verification_admin', 'support_admin']);
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced', 'expert']);
export const verificationStatusEnum = pgEnum('verification_status', [
  'UNVERIFIED',
  'CLAIMED',
  'PENDING',
  'UNDER_REVIEW',
  'ASSESSMENT_REQUIRED',
  'ASSESSMENT_FAILED',
  'VERIFIED',
  'REVOKED',
  'EXPIRED',
  'IN_PROGRESS',
]);
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
  publicId: text('public_id').unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('candidate'),
  emailVerified: boolean('email_verified').notNull().default(false),
  profileCompleted: boolean('profile_completed').notNull().default(false),
  verificationStatus: text('verification_status').notNull().default('PENDING'),
  status: text('status').notNull().default('active'),
  lastLoginAt: timestamp('last_login_at'),
  workEmail: text('work_email'),
  jobTitle: text('job_title'),
  organizationName: text('organization_name'),
  eventName: text('event_name'),
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
  slug: text('slug').notNull().unique(),
  category: text('category'),
  aliases: jsonb('aliases').$type<string[]>().default([]),
  description: text('description'),
  status: text('status').notNull().default('active'),
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
  evidenceNotes: text('evidence_notes'),
  evidenceUrl: text('evidence_url'),
  portfolioRating: real('portfolio_rating'),
  githubStatus: text('github_status'),
  lastVerifiedAt: timestamp('last_verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userSkillIdx: uniqueIndex('candidate_skills_user_skill_idx').on(table.userId, table.skillId),
}));

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  publicId: text('public_id').unique(),
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
  publicId: text('public_id').unique(),
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

// ─── Notifications ──────────────────────────────────────────────────────────

export const notificationTypeEnum = pgEnum('notification_type', [
  'TEAM_INVITE',
  'TEAM_APPLICATION',
  'TEAM_ACCEPTED',
  'TEAM_REJECTED',
  'VERIFICATION_REQUEST',
  'VERIFICATION_RESULT',
  'SYSTEM_ALERT',
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull().default('SYSTEM_ALERT'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionUrl: text('action_url'),
  metadata: jsonb('metadata'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Audit Logs ─────────────────────────────────────────────────────────────

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  publicId: text('public_id'),
  actorId: text('actor_id'),
  actorEmail: text('actor_email'),
  actorRole: text('actor_role'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  details: jsonb('details'),
  reason: text('reason'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Admin Security Domain (Isolated Credential Space) ─────────────────────

export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  adminRole: adminRoleEnum('admin_role').notNull().default('super_admin'),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'suspended'
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Password Resets & Email Verifications ──────────────────────────────────

export const passwordResets = pgTable('password_resets', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailVerifications = pgTable('email_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Role Requests (Server-Side Governance) ──────────────────────────────────

export const roleRequests = pgTable('role_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull(),
  currentRole: text('from_role').notNull(),
  requestedRole: text('to_role').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  reviewedBy: uuid('reviewed_by'),
  reviewNotes: text('review_notes'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// ─── Files ──────────────────────────────────────────────────────────────────

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploaderId: uuid('uploader_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  originalName: text('original_name').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Organizations ─────────────────────────────────────────────────────────

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  publicId: text('public_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull().default('Enterprise'),
  website: text('website'),
  contactEmail: text('contact_email'),
  location: text('location'),
  verificationStatus: text('verification_status').notNull().default('PENDING'),
  riskScore: real('risk_score').default(10),
  aiVerificationNotes: jsonb('ai_verification_notes'),
  humanDecision: text('human_decision').default('PENDING'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Unified Messages & Inquiries (Inbox) ──────────────────────────────────

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  publicId: text('public_id').notNull().unique(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'set null' }),
  receiverId: uuid('receiver_id').references(() => users.id, { onDelete: 'set null' }),
  senderEmail: text('sender_email').notNull(),
  senderName: text('sender_name').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  category: text('category').notNull().default('SUPPORT'),
  status: text('status').notNull().default('NEW'),
  priority: text('priority').notNull().default('NORMAL'),
  aiTriageNotes: jsonb('ai_triage_notes'),
  aiSuggestedResponse: text('ai_suggested_response'),
  humanApproved: boolean('human_approved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── CMS Pages & Versioning ────────────────────────────────────────────────

export const cmsPages = pgTable('cms_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: jsonb('content').notNull(),
  publishedVersion: integer('published_version').notNull().default(1),
  status: text('status').notNull().default('PUBLISHED'),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cmsVersions = pgTable('cms_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').notNull().references(() => cmsPages.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  content: jsonb('content').notNull(),
  changeSummary: text('change_summary'),
  publishedBy: uuid('published_by').references(() => users.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
});

// ─── Feature Flags ─────────────────────────────────────────────────────────

export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(true),
  rolloutPercentage: integer('rollout_percentage').notNull().default(100),
  environment: text('environment').notNull().default('all'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── AI Model Registry & Inference Logs (Section 20A) ───────────────────────

export const aiModelRegistry = pgTable('ai_model_registry', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskType: text('task_type').notNull().unique(),
  primaryModel: text('primary_model').notNull(),
  fallbackModel: text('fallback_model').notNull(),
  latencyBudgetMs: integer('latency_budget_ms').notNull().default(3000),
  costCeilingCents: integer('cost_ceiling_cents').notNull().default(50),
  status: text('status').notNull().default('active'),
});

export const aiInferenceLogs = pgTable('ai_inference_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: text('agent_id').notNull(),
  taskType: text('task_type').notNull(),
  modelUsed: text('model_used').notNull(),
  promptVersion: text('prompt_version').notNull().default('v1.0'),
  tokensIn: integer('tokens_in').notNull().default(0),
  tokensOut: integer('tokens_out').notNull().default(0),
  latencyMs: integer('latency_ms').notNull().default(0),
  costDollars: real('cost_dollars').notNull().default(0),
  status: text('status').notNull().default('SUCCESS'),
  cached: boolean('cached').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── System Incidents & Self-Healing ────────────────────────────────────────

export const systemIncidents = pgTable('system_incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  service: text('service').notNull(),
  severity: text('severity').notNull().default('INFO'),
  status: text('status').notNull().default('RESOLVED'),
  timelineJson: jsonb('timeline_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// ─── Model Types ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type CandidateSkill = typeof candidateSkills.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamRequest = typeof teamRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type FileRecord = typeof files.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type CmsPage = typeof cmsPages.$inferSelect;
export type CmsVersion = typeof cmsVersions.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type AiModelRegistry = typeof aiModelRegistry.$inferSelect;
export type AiInferenceLog = typeof aiInferenceLogs.$inferSelect;
export type SystemIncident = typeof systemIncidents.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type RoleRequest = typeof roleRequests.$inferSelect;



