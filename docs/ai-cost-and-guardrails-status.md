# AI Cost And Guardrails Status

This document captures the current implemented AI/OpenAI policy and guardrail state in this repository as of the current codebase. It describes actual behavior, not a future plan.

For a shorter management-level summary of current state, main gaps, and next decisions, see [SotsiaalAI AI Governance: Current State, Gaps, Next Decisions](./sotsiaalai-ai-governance-current-state-gaps-next-decisions.md).

## 1. Current model and parameter policy

### Standard text model

- Standard text Responses flows share one model setting from `OPENAI_MODEL`, with fallback `gpt-5.4-mini`.
- This shared path is used by chat, document generation/refinement, research planner/synthesizer, and RAG selftest.
- The setting is env-driven, not hardcoded per flow.

Relevant files:
- `lib/chat/settings.js`
- `lib/chat/promptBuilder.js`
- `lib/documents/generation.js`
- `lib/research/pipeline.js`
- `app/api/rag/selftest/route.js`

### Reasoning policy

- Standard text Responses flows are hardcoded to `reasoning.effort: "low"`.
- Chat orchestration still computes complexity/mode metadata, but reasoning selection is fixed to `low`.
- There is no active medium/high reasoning path in standard text flows.

Relevant files:
- `lib/chat/promptBuilder.js`
- `lib/chat/orchestrationPolicy.js`
- `lib/documents/generation.js`
- `lib/research/pipeline.js`
- `app/api/rag/selftest/route.js`

### Verbosity policy

- Standard text Responses flows are hardcoded to `text.verbosity: "low"`.

Relevant files:
- `lib/chat/promptBuilder.js`
- `lib/documents/generation.js`
- `lib/research/pipeline.js`
- `app/api/rag/selftest/route.js`

### Max output token policy

- Chat uses role-based defaults:
  - client: `OPENAI_MAX_OUTPUT_TOKENS_CLIENT`, fallback `900`
  - social worker: `OPENAI_MAX_OUTPUT_TOKENS_WORKER`, fallback `1200`
- Documents use `AGENT_MAX_OUTPUT_TOKENS`, fallback to `OPENAI_MAX_OUTPUT_TOKENS`, then `1800`.
- Research uses profile-based limits:
  - light: `RESEARCH_MAX_OUTPUT_TOKENS_LIGHT`, default `550`
  - standard: `RESEARCH_MAX_OUTPUT_TOKENS`, default `900`

Relevant files:
- `lib/chat/promptBuilder.js`
- `lib/documents/generation.js`
- `lib/research/settings.js`

## 2. Current technical guardrails

These are implemented technical controls. They should not be read as finalized customer-facing business policy unless separately documented as such.

### Chat and session guardrails

- Chat API POST rate limit: `24/min` by default.
- Chat API GET rate limit: `120/min` by default.
- Room message POST rate limit: `20/min` by default.
- Conversation IDs are validated before persistence.
- Subscription gating is enforced for normal user-facing chat and research access.

Relevant files:
- `app/api/chat/route.js`
- `lib/chat-api-rate-limit.js`
- `app/api/rooms/[roomId]/messages/route.js`
- `lib/authz.js`

### Deep research guardrails

- Research POST rate limit: `12/min` by default.
- Only one active research job per user at a time.
- Daily research quota:
  - client: `3/day`
  - social worker: `5/day`
- Query length is capped at `6000` characters.
- Research profiles enforce technical caps for time budget, retrieval concurrency, snippets, RAG context size, and output tokens.

Relevant files:
- `app/api/research/jobs/route.js`
- `lib/research/guardrails.js`
- `lib/research/settings.js`
- `lib/research/jobStore.js`

### Document generation and refinement guardrails

- Artifact create/generate/refine routes use document rate limiting with default `20/min`.
- Saved artifact refinement is capped at `3` refinements per artifact.
- Max source documents per artifact: `10`.
- Max artifact content length constant: `120000` characters.

Relevant files:
- `app/api/documents/artifacts/route.js`
- `app/api/documents/artifacts/generate/route.js`
- `app/api/documents/artifacts/refine/route.js`
- `lib/documents/constants.js`
- `lib/documents/rateLimit.js`

### Upload and storage guardrails

- User document upload max file size: `25 MB`.
- RAG service ingest/upload file max: `20 MB` by default.
- Remote URL fetch into RAG is capped by `RAG_URL_FETCH_MAX_BYTES`, defaulting to the same `20 MB`.
- Materials upload request:
  - max files per request: `10`
  - route rate limit: `8 / 15 min`
- Storage quota:
  - client: `50 MB`
  - social worker: `100 MB`
- Daily upload quota: `100 MB`

Relevant files:
- `lib/documents/constants.js`
- `lib/documents/server.js`
- `app/api/materials/route.js`
- `lib/storageGuardrails.js`
- `rag-service/main.py`

### Guardrails that are operational, not final business policy

- Monthly budget checks for chat/STT/TTS are implemented as internal operational controls.
- AI cost analytics thresholds and `internal_usage_units` are internal monitoring constructs, not exact provider billing and not final product pricing policy.

Relevant files:
- `lib/usageBudget.js`
- `app/api/admin/analytics/ai-costs/route.js`

## 3. Current observability coverage

### `openai_usage`

- Stored in `ChatLog`.
- Covers standard text Responses flows.
- Currently logs:
  - `model`
  - `route`
  - `stage`
  - `latency_ms`
  - `input_tokens`
  - `cached_tokens`
  - `output_tokens`
  - `reasoning_tokens`
  - `userId` when provided
  - `role` when provided
- This usage is direct from OpenAI response usage fields.

Relevant files:
- `lib/openaiUsage.js`
- `app/api/chat/route.js`
- `lib/documents/generation.js`
- `lib/research/pipeline.js`
- `app/api/rag/selftest/route.js`

### `rag_cost_usage`

- Emitted in two places:
  - structured service logs from `rag-service`
  - mirrored into app-side `ChatLog` through `/api/internal/rag-cost-usage`
- Covers OpenAI embeddings cost in:
  - RAG search
  - RAG ingest/indexing
- Logs direct usage from embeddings response:
  - `prompt_tokens`
  - `total_tokens`
  - `model`
  - `latency_ms`
  - `embedding_calls`
  - `embedding_input_count`
- Also logs route/stage and attribution metadata:
  - `route`
  - `stage`
  - `upstream_route`
  - `upstream_stage`
  - `userId`
  - `role`
  - `conversation_id`
  - `artifact_id`
  - `research_job_id`
  - `chunk_count`
  - `result_count`
  - `top_k`
- This is direct usage, not estimated.

Relevant files:
- `rag-service/main.py`
- `app/api/internal/rag-cost-usage/route.js`
- `lib/documents/ragService.js`
- `app/api/chat/route.js`
- `lib/research/pipeline.js`
- `lib/documents/generation.js`

### `tts_cost_usage`

- Stored in `ChatLog` for direct OpenAI TTS calls.
- Logs:
  - `model`
  - `route`
  - `stage`
  - `latency_ms`
  - `request_size_bytes`
  - `text_chars`
  - `audio_bytes`
  - `voice`
  - `cost_read_directly: false`
  - `cost_estimation_basis: "text_chars"`
- OpenAI TTS does not currently provide direct usage in this path, so cost observability is estimated from text length.

Relevant file:
- `app/api/tts/route.js`

### `stt_cost_usage`

- Stored in `ChatLog` for direct OpenAI STT calls.
- Logs:
  - `model`
  - `route`
  - `stage`
  - `latency_ms`
  - `request_size_bytes`
  - `file_size_bytes`
  - `text_chars`
  - `mime_type`
  - `language`
- If OpenAI returns usage, the event stores direct usage fields:
  - `usage_type`
  - `duration_seconds`
  - `input_tokens`
  - `output_tokens`
  - `total_tokens`
  - `audio_tokens`
  - `text_tokens`
- If usage is absent, token/duration fields are `null` and estimation basis falls back to `file_size_bytes`.

Relevant file:
- `app/api/stt/route.js`

## 4. Current analytics coverage

### What AI cost analytics currently includes

- `GET /api/admin/analytics/ai-costs` aggregates from `ChatLog`.
- Included events:
  - `openai_usage`
  - `tts_cost_usage`
  - `stt_cost_usage`
  - `rag_cost_usage` only once mirrored rows are actually present in `ChatLog`
- Coverage is explicit in the endpoint response. RAG is marked included only when mirrored data is queryable in-app.

Relevant files:
- `app/api/admin/analytics/ai-costs/route.js`
- `components/admin/AnalyticsDashboard.jsx`

### Available groupings

- by role
- by package
- by route
- by stage
- by model
- top features
- top users
- per-user budget tracking
- per-package budget tracking

Package attribution is derived by joining users to their latest subscription plan in analytics.

### `internal_usage_units` and threshold logic

- AI analytics v2 uses `internal_usage_units`, not exact provider billing.
- `unit_model` is returned by the endpoint and documents the weighting constants.
- Thresholds are:
  - warning: `70%`
  - high: `85%`
  - exceeded: `100%`
- Package utilization is computed as:
  - `sum(user internal_usage_units) / sum(user budget_units_monthly)`
- Current UI and API present coverage status at summary, per-user, and per-package level.

Relevant files:
- `app/api/admin/analytics/ai-costs/route.js`
- `components/admin/AnalyticsDashboard.jsx`

### Raw-log support

- Admin raw-log filtering uses `GET /api/admin/analytics/events`.
- Raw-log UI now supports filtering and readable detail display for:
  - `openai_usage`
  - `rag_cost_usage`
  - `tts_cost_usage`
  - `stt_cost_usage`
- `rag_cost_usage` raw-log rendering includes route/stage, upstream route/stage, model, userId, role, tokens, embedding counts, result counts, latency, and propagated correlation IDs.

Relevant files:
- `app/api/admin/analytics/events/route.js`
- `components/admin/AnalyticsDashboard.jsx`

## 5. Current user/package attribution state

### Text flows

- `openai_usage` uses `ChatLog.userId` and `ChatLog.role` when the caller passes them.
- Chat explicitly logs both `userId` and `role`.
- Document generate/refine logs `userId`; current `openai_usage` calls there do not also pass `role`.
- Research text usage logging is route/stage aware; package grouping is still resolved from `userId` through subscription joins.

Relevant files:
- `app/api/chat/route.js`
- `lib/documents/generation.js`
- `lib/openaiUsage.js`
- `app/api/admin/analytics/ai-costs/route.js`

### Audio flows

- `tts_cost_usage` and `stt_cost_usage` both log `userId` and `role` directly into `ChatLog`.
- Package attribution comes from analytics-side join on `userId`.

Relevant files:
- `app/api/tts/route.js`
- `app/api/stt/route.js`
- `app/api/admin/analytics/ai-costs/route.js`

### RAG flows

- App-side callers propagate attribution into `rag-service` via headers.
- `rag-service` preserves:
  - `route`
  - `stage`
  - `upstream_route`
  - `upstream_stage`
- For normal user-facing flows that know them, it also carries:
  - `userId`
  - `role`
  - `conversation_id`
  - `artifact_id`
  - `research_job_id`
- The mirrored internal endpoint persists the full payload into `ChatLog`, enabling user/package attribution in analytics.

Relevant files:
- `lib/documents/ragService.js`
- `app/api/chat/route.js`
- `lib/research/pipeline.js`
- `lib/documents/generation.js`
- `rag-service/main.py`
- `app/api/internal/rag-cost-usage/route.js`

## 6. Decisions already made

### Why `gpt-5.4-mini` is the current standard model

- The codebase was deliberately cleaned up to use one shared standard text model setting across standard Responses flows.
- The current operational default is `OPENAI_MODEL`, with fallback `gpt-5.4-mini`.
- That makes `gpt-5.4-mini` the default behavior whenever the env override is not set.

### Why `low` reasoning and `low` verbosity are the current standard policy

- The repository now explicitly hardcodes `reasoning.effort: "low"` and `text.verbosity: "low"` across standard text flows.
- Medium/high reasoning paths and separate text verbosity policies were intentionally removed from the standard flow path.
- The codebase now favors explicit consistency over per-flow tuning.

### Why `gpt-5 mini` or `gpt-5.4 nano` are not the primary assistant models

- There is no standard text flow in the current repo that selects them as the primary assistant model.
- The implemented policy is one shared standard text model path, not multiple competing assistant defaults.
- Audio remains separate because TTS/STT use dedicated audio model settings, which is a different class of workload.

### Why the current approach favors simplicity first

- The repository currently standardizes:
  - one standard text model path
  - one low-only reasoning policy
  - one low-only verbosity policy
  - centralized usage logging patterns
- This reduces misleading configuration branches and makes analytics, cost tracking, and policy decisions easier to reason about.

## 7. Known gaps and limitations

- `internal_usage_units` are still internal analytics units, not exact provider billing.
- TTS cost observability is estimated from `text_chars`; it is not based on direct provider usage.
- STT cost observability is mixed:
  - direct when usage is returned
  - estimated when usage is absent
- RAG inclusion in AI analytics depends on mirrored `rag_cost_usage` rows actually existing in `ChatLog`. The endpoint handles this explicitly, but a fresh environment with no mirrored rows will still show RAG as not yet included.
- Text-flow attribution is not fully symmetrical:
  - chat text usage logs both `userId` and `role`
  - document text usage currently logs `userId` but not always `role`
- Current budgets, quotas, and thresholds are implemented operational guardrails. They should not yet be treated as finalized pricing or customer-facing policy.
- The repo contains operational and business-adjacent controls in multiple places:
  - rate limits
  - daily quotas
  - monthly budget checks
  - analytics thresholds
  These are implemented, but not all are final product policy.

## 8. Recommended next steps

### Nearest technical next step

- Tighten attribution consistency for standard text `openai_usage`, especially in document/research flows, so `role` coverage matches chat/audio/RAG more consistently.

### Nearest analytics/product step

- Decide whether `internal_usage_units` should remain the main admin budget metric or whether the admin view should start showing an additional approximate-EUR view alongside it.

### Nearest business/policy step

- Separate finalized business policy from technical guardrails:
  - which quotas are customer-facing policy
  - which are internal safety controls
  - which monthly budget values are operational only
