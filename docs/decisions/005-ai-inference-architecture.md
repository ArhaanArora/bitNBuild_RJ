# ADR 005: Section 20A AI Inference Architecture & Model Routing

## Status
Accepted (v3.0.0)

## Context
As the platform orchestrates diverse AI tasks (document verification, code repository analysis, inbox triage, marketing CMS co-piloting, and automated self-healing), hardcoding a single LLM provider creates single-point-of-failure vulnerabilities, cost runaways, and latency degradation.

## Decision
1. **Dynamic Task Routing Registry (`ai_model_registry`)**:
   Every agentic task maps to a designated primary LLM (`gpt-4o`, `claude-3-5-sonnet`, `gpt-4o-mini`) and an automated fallback chain.
   - `VERIFICATION_DOC` -> Primary: `gpt-4o` | Fallback: `gpt-4o-mini` | Latency SLA: 3500ms | Ceiling: 25¢
   - `MESSAGE_TRIAGE` -> Primary: `gpt-4o-mini` | Fallback: `gpt-3.5-turbo` | Latency SLA: 1200ms | Ceiling: 5¢
   - `CODE_ANALYSIS` -> Primary: `claude-3-5-sonnet` | Fallback: `gpt-4o` | Latency SLA: 5000ms | Ceiling: 50¢
   - `CMS_ASSISTANT` -> Primary: `gpt-4o-mini` | Fallback: `gpt-4o` | Latency SLA: 2000ms | Ceiling: 10¢
   - `AUTO_FIX` -> Primary: `gpt-4o` | Fallback: `claude-3-5-sonnet` | Latency SLA: 4500ms | Ceiling: 40¢

2. **Inference Observability & Cost Ceiling (`ai_inference_logs`)**:
   Every model call logs agent ID, prompt version, input/output tokens, roundtrip latency, dollar cost, and execution status (`SUCCESS`, `FALLBACK_TRIGGERED`).
   Cost ceilings are enforced per task to prevent runaway token spend.

3. **Drift & Human Overturn Metrics**:
   The admin command center calculates real-time human overturn rates (e.g. human rejection of AI-proposed verification claims or triage categorization) and semantic drift tracking.

4. **Human Decision Gating**:
   AI outputs are structurally segregated in the database schema (`aiVerificationNotes`, `aiSuggestedResponse`) from authoritative human sign-offs (`humanDecision`, `humanApproved`).

## Consequences
- Cost predictability and adherence to token budgets.
- High availability via automatic fallback transitions.
- Defensible audit trail and governance for AI-assisted human evaluations.
