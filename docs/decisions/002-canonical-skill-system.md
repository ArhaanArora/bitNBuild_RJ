# ADR 002: Centralized Canonical Skill System and Verification State Machine

## Status
Accepted

## Context
Candidates and hackathon participants frequently submit technologies using informal naming (e.g., "py", "python3", "ReactJS", "django-rest-framework"). Without a standardized taxonomy:
1. Team searches miss qualified candidates due to string mismatch.
2. Verification scores become fragmented across synonymous skills.
3. Verification state lacks clear lifecycle semantics between self-declaration, automated review, and verified badge issuance.

## Decision
1. **Canonical Skill Registry**:
   - Each technology possesses a unique slug (`slug`), canonical name (`name`), category (`category`), and an array of aliases (`aliases: jsonb`).
   - Case-insensitive resolver (`CanonicalSkillService.resolveSkill`) translates any incoming alias or search term into the single canonical record.
   - Enforce a database unique constraint on `candidate_skills(user_id, skill_id)`.

2. **Verification State Machine**:
   Every candidate skill follows an 8-state pipeline:
   - `CLAIMED`: User declared skill on profile.
   - `PENDING`: Verification requested or queued.
   - `UNDER_REVIEW`: Automated agent or peer reviewer analyzing evidence.
   - `ASSESSMENT_REQUIRED`: Practical coding or MCQ challenge needed.
   - `ASSESSMENT_FAILED`: Candidate scored below passing threshold (< 70%).
   - `VERIFIED`: Confirmed by proctored assessment or verified GitHub AST analysis.
   - `REVOKED`: Manually revoked by administrator due to integrity violation.
   - `EXPIRED`: Time-based expiration requiring re-assessment.

## Consequences
- **Positive**: 100% resolution rate for common variants during teammate matching and recruiter searches.
- **Positive**: Auditable verification progression prevents unearned trust badges.
- **Positive**: Database deduplication guarantees one score entry per user per skill.
