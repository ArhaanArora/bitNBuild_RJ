# Changelog

All notable changes to the **SkillVerify** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-09-13

### Added
- **AI-Powered Super Admin Command Center (Master Build v2 Refined)**:
  - 12 comprehensive administrative functional modules unified under a responsive, enterprise `AdminShell`:
    1. **Overview & Executive Telemetry**: Real PostgreSQL database metrics, priority triage queues for unreviewed claims & pending orgs, server heap/latency health matrix.
    2. **AI Inference Architecture (Section 20A)**: Task-based model routing (`VERIFICATION_DOC`, `MESSAGE_TRIAGE`, `CODE_ANALYSIS`, `CMS_ASSISTANT`, `AUTO_FIX`), fallback chains, cost ceilings, latency SLAs, live inference logs, token spend tracking, drift calculation, and human overturn rates.
    3. **Candidates Directory & Passports**: Complete candidate directory with standardized `CAND-2026-XXXXXX` identifiers, verified skill coverage, average scores, and direct public passport inspect links.
    4. **Recruiters & Partners Directory**: Partner roster with `RECR-2026-XXXXXX` IDs, enterprise company affiliations, and active vetted access permissions.
    5. **Hackathon Organizers**: Authorized organizer management with `ORGN-2026-XXXXXX` IDs and managed event rosters.
    6. **Users & Role-Based Access Control (RBAC)**: Comprehensive user directory with immediate role transitions (`candidate`, `recruiter`, `organizer`, `admin`) and immutable audit tracking.
    7. **Client Organizations & KYB Vetting**: Enterprise onboarding, corporate domain matching, risk scoring, AI verification notes, and human approve/reject/suspend gating with `ORG-2026-XXXXXX` identifiers.
    8. **Skill Verification Moderation Queue**: Evidence inspector, proctoring adherence signals (98%+ integrity), score overrides, and approve/reject/revoke actions with notifications dispatched to candidates.
    9. **Hackathons & Formed Teams**: Publication toggling, registration limits, team composition checks, and vector skill balance scoring.
    10. **Canonical Skills Taxonomy**: Standardized technology dictionary, aliases array mapping, and new canonical skill registration.
    11. **Unified Inquiries & Communications Inbox**: Incoming candidate appeals and recruiter partnership queries with `MSG-2026-XXXXXX` IDs, AI triage analysis, AI-drafted responses, and 1-click human authorization.
    12. **Website CMS & Public Sync**: Edge-synchronized JSON content editor for `home`, `announcements`, and `faq`, version history snapshots, 1-click instant rollback, and live preview modal.
    13. **Live Spatial Operations & Self-Healing**: Dynamic toggle between interactive Three.js 3D spatial node topology and WCAG 2.2 AA accessible 2D matrix, with 4 zero-downtime self-healing triggers (Purge Cache, Rotate GitHub Tokens, Re-index Vectors, Restart Worker Pool).
    14. **Platform Feature Flags**: Real-time feature flag toggles (`ADMIN_3D_OPERATIONS`, `AI_VERIFICATION_GATE`, `LIVE_METRICS_STREAM`, `CMS_PUBLIC_SYNC`, `AI_AUTO_HEAL`, `TEAM_FORMATION_V2`) and progressive rollout sliders.
    15. **Cryptographic Audit Trail**: Immutable ledger of all administrative events with `AUD-2026-XXXXXX` identifiers and expandable JSON details drawer.
  - **Command Palette (`Ctrl+K`)**: Keyboard-first global search modal for instant navigation and quick actions.
- **Database Schema v3 (Neon PostgreSQL)**:
  - Added tables: `organizations`, `messages`, `cms_pages`, `cms_versions`, `feature_flags`, `ai_model_registry`, `ai_inference_logs`, `system_incidents`.
  - Added unique indexed `public_id` columns to `users`, `projects`, `hackathons`, and `audit_logs`.
- **Public CMS API**:
  - `GET /api/public/cms/:slug` serving live published CMS content to guest visitors.

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
