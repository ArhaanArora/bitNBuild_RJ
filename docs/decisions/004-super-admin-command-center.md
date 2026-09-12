# ADR 004: Super Admin Command Center Architecture & Operations Mode

## Status
Accepted (v3.0.0)

## Context
The platform required a unified, enterprise-grade administrative operating system to govern candidates, recruiters, hackathon organizers, client enterprise organizations, canonical skills, verifications, communications, website CMS, operations, and security. A flat demo or cosmetic dashboard would fail to meet security, operational observability, and regulatory trust requirements.

## Decision
1. **Modular Enterprise Shell (`AdminShell`)**:
   Organized into 5 functional areas with 12 distinct modules:
   - Executive (Overview, Section 20A AI Command Center)
   - Ecosystem (Candidates, Recruiters, Organizers, Organizations KYB, Users & RBAC)
   - Verification & Competitions (Skill Claim Moderation, Canonical Skills, Hackathons & Teams)
   - Content & Communications (Unified Inbox with AI Triage, Website CMS & Edge Sync)
   - Infrastructure & Operations (Live 3D/2D Spatial Operations, Feature Flags, Cryptographic Audit Trail)

2. **Standardized ID Generation**:
   All entities utilize structured public identifiers (`CAND-2026-XXXXXX`, `RECR-2026-XXXXXX`, `ORGN-2026-XXXXXX`, `ORG-2026-XXXXXX`, `HACK-2026-XXXXXX`, `VER-2026-XXXXXX`, `AUD-2026-XXXXXX`, `MSG-2026-XXXXXX`).

3. **Dual Spatial Operations (3D WebGL & 2D Accessible Mode)**:
   A toggleable Three.js/React Three Fiber 3D spatial view renders the active service mesh (Gateway, DB, AI Engine, Worker, Auth, Cache) with Green/Yellow/Red health signals. In accordance with WCAG 2.2 AA accessibility standards, the standard 2D view is maintained as the accessible default.

4. **Zero Mock Data Enforcement**:
   Every table, metric, and log reflects real tables on Neon PostgreSQL (`organizations`, `messages`, `cms_pages`, `cms_versions`, `feature_flags`, `ai_model_registry`, `ai_inference_logs`, `system_incidents`).

## Consequences
- Single administrative pane of glass for all platform stakeholders.
- Live observability and instantaneous self-healing capability.
- Full compliance with audit trail regulations and human-in-the-loop verification gating.
