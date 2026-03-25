# AI Attribution Symmetry Technical Backlog

This document turns the attribution-symmetry goal into concrete engineering work items.

The target is simple:

all user-facing standard text `openai_usage` events should consistently carry:

- `userId`
- `role`
- `route`
- `stage`

This backlog is intentionally scoped to standard text observability. It does not try to redesign all analytics or all AI governance at once.

## 1. Goal

Make attribution for standard text AI usage symmetric across the main user-facing flows so that analytics, budget tracking, and role/package comparisons are reliable.

## 2. Current issue summary

Current repo state:

- chat text usage already logs `userId` and `role`
- document generation/refine currently logs `userId`, but not consistently `role`
- research text usage currently logs `userId`, but not consistently `role`
- selftest logs `route` and `stage`, but is not a normal user-facing flow

## 3. Definition of done

The attribution-symmetry work is done when:

1. all user-facing standard text flows log `userId`, `role`, `route`, and `stage`
2. document generation and refine flows include `role` in `openai_usage`
3. research planner and synthesizer flows include `role` in `openai_usage`
4. internal/admin-only flows are explicitly marked as out of scope or intentionally unattributed
5. there is a regression check, test, or smoke-check for missing `role` in standard text usage logging
6. admin analytics no longer shows avoidable `unknown role` rows for these flows

## 4. Scope

In scope:

- chat standard text usage
- document generation and refinement text usage
- research planner and synthesizer text usage
- observability helper consistency
- analytics completeness checks for attribution

Out of scope for this backlog:

- TTS/STT attribution redesign
- RAG embedding attribution redesign
- pricing redesign
- package policy redesign
- career-agent specific observability unless explicitly brought under the same standard later

## 5. Technical backlog tickets

## ATTR-1: Define the attribution contract for standard text flows

Purpose:

Write down the exact observability contract for standard text `openai_usage`.

Required fields:

- `userId` for user-facing flows
- `role` for user-facing flows
- `route`
- `stage`

Implementation notes:

- keep `logOpenAIUsage` as the common entry point
- explicitly document when `userId` and `role` may be omitted
- internal diagnostics like selftest should be intentionally classified, not left ambiguous

Files:

- `lib/openaiUsage.js`
- `docs/ai-cost-and-guardrails-status.md`
- `docs/ai-analytics-admin-guide.md`

Acceptance criteria:

- a short written contract exists in docs or code comments
- internal vs user-facing flows are explicitly distinguished
- engineers can tell when missing `role` is a bug and when it is intentional

## ATTR-2: Add `role` to document generation `openai_usage`

Purpose:

Make document draft generation log the same attribution fields as chat.

Current gap:

- draft generation passes `userId`
- draft generation does not consistently pass `role` into `logOpenAIUsage`

Primary files:

- `lib/documents/generation.js`
- `app/api/documents/artifacts/generate/route.js`

Implementation notes:

- ensure route-level caller passes effective role into generation pipeline
- ensure `logOpenAIUsage` call for generation includes `role`
- preserve existing `route` and `stage`

Acceptance criteria:

- generated artifact text usage rows include `userId` and `role`
- no regression to existing document generation behavior
- route and stage remain unchanged

## ATTR-3: Add `role` to document refinement `openai_usage`

Purpose:

Make document refinement attribution symmetric with generation and chat.

Current gap:

- refinement flow passes `userId`
- refinement flow does not consistently pass `role` into `logOpenAIUsage`

Primary files:

- `lib/documents/generation.js`
- `app/api/documents/artifacts/refine/route.js`

Implementation notes:

- pass effective role from route into refine pipeline
- ensure refine `logOpenAIUsage` call includes `role`
- keep current artifact/audit behavior unchanged

Acceptance criteria:

- refined artifact text usage rows include `userId` and `role`
- route and stage remain stable
- no change to refinement limit or document audit behavior

## ATTR-4: Add `role` to research planner and synthesizer `openai_usage`

Purpose:

Make deep research text usage comparable by role and package.

Current gap:

- research payload already knows `userRole`
- `logOpenAIUsage` in research currently logs `userId`, but not consistently `role`

Primary files:

- `lib/research/pipeline.js`
- `app/api/research/jobs/route.js`

Implementation notes:

- propagate `userRole` through research model-call helpers
- include `role` in planner and synthesizer `logOpenAIUsage`
- keep existing `route` and `stage` split, especially:
  - `research_planner`
  - `research_synthesizer`

Acceptance criteria:

- planner usage rows include `userId` and `role`
- synthesizer usage rows include `userId` and `role`
- analytics can group research text cost by role without fallback guessing

## ATTR-5: Classify selftest and other internal text flows explicitly

Purpose:

Avoid ambiguity between missing attribution because of a bug and missing attribution because the flow is internal.

Current state:

- `api/rag/selftest` logs text usage with `route` and `stage`
- it does not represent normal end-user product activity

Primary files:

- `app/api/rag/selftest/route.js`
- `docs/ai-cost-and-guardrails-status.md`

Implementation notes:

- either keep selftest unattributed and document it as internal
- or add an explicit internal marker pattern if that fits current analytics conventions better

Acceptance criteria:

- selftest attribution behavior is intentional and documented
- analytics interpretation of selftest is unambiguous

## ATTR-6: Add attribution completeness checks to analytics

Purpose:

Make missing attribution visible instead of discovering it manually later.

Primary files:

- `app/api/admin/analytics/ai-costs/route.js`
- `components/admin/AnalyticsDashboard.jsx`

Implementation options:

- add summary counts or percentages for:
  - `% of openai_usage rows with userId`
  - `% of openai_usage rows with role`
- optionally break completeness down by route/stage

Acceptance criteria:

- admin can see whether standard text attribution is complete
- missing `role` coverage becomes measurable
- regressions are visible without inspecting raw logs manually

## ATTR-7: Add regression coverage for attribution symmetry

Purpose:

Prevent future code changes from silently dropping `role` or `userId`.

Suggested test strategy:

- unit tests around `logOpenAIUsage` payload behavior where feasible
- route-level or helper-level tests for:
  - document generate
  - document refine
  - research planner/synthesizer
- if full automated tests are too expensive immediately, add a documented smoke-check script or checklist

Possible files:

- new tests under a project-owned `tests` folder
- or a dedicated internal verification note in `docs`

Acceptance criteria:

- there is at least one repeatable regression check for attribution symmetry
- the check covers documents and research, not only chat

## 6. Suggested implementation order

1. `ATTR-1` define the contract
2. `ATTR-2` document generation role propagation
3. `ATTR-3` document refinement role propagation
4. `ATTR-4` research role propagation
5. `ATTR-5` selftest/internal classification
6. `ATTR-6` analytics completeness visibility
7. `ATTR-7` regression coverage

## 7. Smallest useful first release

If this work needs to be split into a minimal first release, do this first:

1. add `role` to document generation/refine
2. add `role` to research planner/synthesizer
3. document selftest as intentionally internal

That first release already fixes the biggest analytics distortion.
