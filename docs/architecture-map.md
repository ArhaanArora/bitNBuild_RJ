# System Architecture Map

## SkillVerify — Production-Grade Skill Verification & Teammate Matching Platform

### 1. High-Level Architecture Overview

SkillVerify is an enterprise-grade platform connecting developers, hackathon teams, and technical recruiters through cryptographic proof-of-competence, multi-agent automated code verification, and explainable teammate matching.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Client Application                              │
│                   React 18 + TypeScript + Vite + TailwindCSS                │
│       Port: 6969  (Proxies /api and /uploads to API server on 6970)         │
├───────────────────────┬───────────────────────────────┬─────────────────────┤
│   3D WebGL Canvas     │    Hackathon Buddy / Teams    │  Dashboard & Admin  │
│  Three.js / WebGL     │  Explainable Match UI         │  Audit Log Ledger   │
│  Trust Constellation  │  Candidate Evidence Cards     │  Canonical Registry │
│  Accessible Toggle    │  Direct Invites & Challenges  │  Claims Moderation  │
└───────────▲───────────┴───────────────▲───────────────┴──────────▲──────────┘
            │                           │                          │
            │                  HTTP REST / JSON                    │
            │                           │                          │
┌───────────▼───────────────────────────▼──────────────────────────▼──────────┐
│                             API Server (Express)                            │
│                  Node.js + Express + TypeScript (Port: 6970)                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ├── Auth Router: JWT access/refresh tokens & bcrypt credential hashing      │
│ ├── Matching Service: Batch-loaded real candidate scoring & explainability  │
│ ├── 12-Agent Verification Engine: AST, git, security, test analysis        │
│ ├── Canonical Skill Service: Slugification, alias resolution, taxonomy      │
│ ├── Notifications Router: In-app notification queue & read receipts         │
│ ├── Admin Router: Tamper-evident audit log stream & moderation actions      │
│ └── Sessions & Proctoring: Keystroke timing, camera check, integrity score │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Drizzle ORM / pg connection pool
                                       │ SSL verify-full
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    Neon Serverless PostgreSQL Database                      │
│                AWS us-east-2 · Branch: main · High-Availability             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tables: users, profiles, skills, candidate_skills, projects, project_skills, │
│ hackathons, hackathon_participants, teams, team_members, team_requests,      │
│ assessments, questions, assessment_sessions, question_responses,            │
│ integrity_events, camera_checks, rough_work_files, project_analyses,        │
│ analysis_agent_runs, analysis_findings, notifications, audit_logs, files   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Core Subsystems

#### A. Centralized Canonical Skill Registry
- **Source of Truth**: `skills` table in PostgreSQL.
- **Slug & Normalization**: Case-insensitive alphanumeric slug generation (`slugify`), e.g., `"react.js"` and `"ReactJS"` map to canonical `"react"`.
- **JSONB Aliases**: Array of known aliases preventing technology fragmentation across applicant submissions.
- **Audit Integration**: Any registration or alias change triggers an append-only audit event in `audit_logs`.

#### B. Claim → Verification Pipeline State Machine
A candidate's competency claim follows an explicit state transition lifecycle:
```
UNVERIFIED
   │
   ▼
CLAIMED ──────► UNDER_REVIEW ──────► ASSESSMENT_REQUIRED
                     │                         │
                     ▼                         ▼
                 VERIFIED ◄───────────── (Score >= 75%)
                     │                         │
                     ▼                         ▼
                  REVOKED              ASSESSMENT_FAILED
```

#### C. Explainable Teammate Matching Engine (`MatchingService`)
- Operates directly on live registered candidates in PostgreSQL (zero mock or hardcoded data in production paths).
- Eliminates N+1 queries through grouped batch queries on candidate profiles, skills, projects, and active team memberships.
- Multi-factor scoring formula:
  - Skill Overlap Weight (50%): Ratio of candidate skills matching target hackathon roles.
  - Verified Competency Score (35%): Proctored assessment and automated analysis percentile.
  - Availability & Integrity (15%): Open team status and proctoring trust score.
- Returns explicit reasoning bullets detailing exact skill matches, published portfolio evidence, and proctoring integrity history.

#### D. In-App Notification Engine
- **Table**: `notifications` with unread index `(user_id, is_read)`.
- **Types**: `TEAM_INVITE`, `TEAM_APPLICATION`, `TEAM_ACCEPTED`, `TEAM_REJECTED`, `VERIFICATION_REQUEST`, `VERIFICATION_RESULT`, `SYSTEM_ALERT`.
- **Client**: `NotificationBell` component with live counter badge, automated polling, and mark-as-read endpoints.

#### E. Append-Only Audit Logging
- **Table**: `audit_logs` capturing `actor_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, and immutable `created_at`.
- Immutable schema without update or delete permissions in application paths.
- Admin dashboard exposes live queryable audit stream for security compliance.

#### F. Multi-Agent AI Project Verification Engine
- 12 coordinated analytical agents:
  1. `ARCHITECTURE`: Framework and structure analysis.
  2. `DEPENDENCY_SECURITY`: Vulnerability and CVE dependency scanning.
  3. `CODE_QUALITY`: Cyclomatic complexity and smell detection.
  4. `TEST_COMPLETENESS`: Unit/integration test coverage inspection.
  5. `GIT_AUTHORSHIP`: Git commit trail and author consistency.
  6. `AI_ATTRIBUTION`: AI-generation probability and pattern detection.
  7. `API_CONTRACT`: REST/OpenAPI and schema consistency.
  8. `PERFORMANCE`: Algorithmic complexity and bundle footprint.
  9. `DOCUMENTATION`: Readme, docstring, and architectural documentation.
  10. `STATIC_TYPING`: TypeScript/typing strictness and coverage.
  11. `INTEGRITY_CHECK`: Anomaly, plagiarism, and obfuscation detection.
  12. `FINAL_JUDGE`: Synthesis into trust score, confidence, and badge.
