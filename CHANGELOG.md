# Changelog

All notable changes to the **SkillVerify** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-09-13

### Added
- **Canonical Skill System**:
  - Centralized taxonomy registry in PostgreSQL with slugification (`slug`) and JSONB aliases.
  - `CanonicalSkillService` supporting case-insensitive alias resolution and duplicate prevention.
  - Initialized with 16 canonical technologies across Programming, Backend, Frontend, Database, DevOps, AI/ML, Design, and Web3.
- **Verification Pipeline Lifecycle**:
  - Extended verification status enum: `CLAIMED`, `PENDING`, `UNDER_REVIEW`, `ASSESSMENT_REQUIRED`, `ASSESSMENT_FAILED`, `VERIFIED`, `REVOKED`, `EXPIRED`.
  - Candidate skill evidence fields: `evidenceNotes`, `evidenceUrl`, `portfolioRating`, and `githubStatus`.
  - Unique composite index on `candidate_skills(user_id, skill_id)`.
- **Explainable Teammate Matching Engine**:
  - Batch-loading candidate query engine (`MatchingService`) operating strictly on real registered PostgreSQL candidates.
  - Explainable reasoning engine generating human-readable bullets detailing skill coverage, evidence ratings, and integrity records.
  - Endpoints: `POST /api/teams/find-teammates`, `POST /api/teams/direct-invite`, and `POST /api/teams/direct-challenge`.
- **In-App Notification Queue**:
  - `notifications` table indexed by `(user_id, is_read)` with type categorization.
  - `NotificationBell` header component with live unread counter badge, auto-polling, and read receipts.
  - Endpoints: `GET /api/notifications`, `PATCH /:id/read`, `PATCH /read-all`, and `POST /`.
- **Append-Only Audit Logging & Governance**:
  - `audit_logs` table recording actor, action, entity type, entity ID, metadata JSONB, and IP address.
  - `AdminDashboard` page at `/admin` featuring metrics cards, tamper-evident audit ledger, canonical skill manager, and claims moderation queue.
- **7 Real Database Candidate Profiles**:
  - Seeded realistic candidates (Alex, Priya, Rohan, Aarav, Ananya, Kabir, Ishita, Sahil) with full portfolios, verified projects, and assessment scores.
- **File Metadata Registry**:
  - `files` table for tracking uploaded assets, MIME types, byte sizes, and ownership.

### Fixed
- Replaced mock candidate data arrays in teammate matching with real database matching backed by Neon PostgreSQL.
- Resolved type inference conflicts in 3D WebGL scene node graphs.
- Fixed nullability handling for camera check integrity timeouts.

---

## [1.2.0] - 2026-09-12

### Added
- **Hackathon Buddy Module**:
  - "Find Your Hackathon Teammate" interface with role search and evidence chips.
  - Detailed Candidate Profile Modal, Contact Modal, Team Request Modal, and Verification Challenge Modal.
  - Real-time score filtering by credibility, assessment score, and verified skills.

---

## [1.1.0] - 2026-09-12

### Added
- **12-Agent AI Verification & Analysis Engine**:
  - Architecture, Dependency Security, Code Quality, Test Completeness, Git Authorship, AI Attribution, API Contract, Performance, Documentation, Static Typing, Integrity Check, and Final Judge.
- **3D WebGL Spatial Interfaces**:
  - Interactive WebGL Trust Constellation with orbiting agent satellites.
  - Accessible flat view toggle complying with WCAG standards.
  - 3D Evidence Shell, Skill Lattice, Recruiter Compare, and Team Graph scenes.

---

## [1.0.0] - 2026-09-12

### Added
- Initial MVP release of SkillVerify platform.
- Drizzle ORM schema on PostgreSQL with authentication, profiles, candidate skills, assessments, and hackathons.
- Anti-cheating proctoring engine with keystroke timing, tab-switch tracking, and camera checks.
