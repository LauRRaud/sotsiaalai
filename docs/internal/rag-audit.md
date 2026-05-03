# SotsiaalAI RAG Runtime Audit

STATUS: current engineering audit

Last reviewed: 2026-05-03

This document summarizes the current `lib/chat` and `lib/rag` architecture, with a file-by-file assessment of role, maturity, limitations and likely conflicts.

The goal is to make it easy to inspect whether each file has a clear function, whether the function is implemented well enough, and where the next quality improvements should be made.

## Rating Scale

| Rating | Meaning |
| --- | --- |
| A | Mature or narrow module; role is clear and implementation is mostly fit for purpose. |
| B | Works and has useful structure, but needs cleanup, stronger tests, or clearer contracts. |
| C | Functional but overloaded, fragmented, or architecturally risky. |
| D | Technical debt; should be redesigned before expanding the feature surface. |

## Executive Summary

SotsiaalAI is not a simple `question -> vector search -> top chunks -> answer` system. The codebase already has a real RAG pipeline:

1. Source need detection.
2. Query planning.
3. Hybrid retrieval.
4. Context grouping and selection.
5. SourcePackage construction.
6. Package-aware answer context.
7. Section-level attribution.
8. Answer source attribution.
9. Displayed-source enforcement.
10. RAG trace and quality metrics.

The main limitation is not that RAG does not exist. The main limitation is that the planner role is split across several files, so the system does not yet have one explicit, auditable `question_plan` object that says:

```json
{
  "mode": "overview_synthesis",
  "role": "social_worker",
  "domain": "lastekaitse",
  "needs_multiple_sources": true,
  "preferred_source_count": 6,
  "source_layers": ["journal_articles", "guides", "studies", "statistics"]
}
```

This creates the current quality risk: broad topic questions can retrieve material, but still answer too narrowly or from too few documents.

The highest-value next patch is to make `overview_synthesis` a first-class mode with document-level source diversity guarantees.

## Implemented Changes

### V1.1 Overview Synthesis Production Hardening

Status: DONE

- `queryPlanner.js`: added `overview_synthesis` mode, `needs_multiple_sources = true`, `selection_strategy = overview_diversity_then_depth`, and `preferred_source_count = {5..8}`.
- `ragContext.js`: added `resolveDocumentIdentity()` and `selectOverviewSynthesisGroups()`.
- `retrievalContextAssembler.js`: connected the overview selector into context selection and added the overview prompt instruction.
- `mainResponseHandler.js`: added sanitized `rag_trace.overview_synthesis` metadata.
- `sourceAttribution.js`: added minimal overview mode support.
- Hotfix: overview prompt mojibake was fixed in `buildOverviewSynthesisInstruction()`.
- This documentation-only/hotfix work package did not run smoke tests, automated tests, or build.

### V1.2 Source Attribution + Displayed Sources Metrics

Status: DONE

- `sourceAttribution.js`: added count/subset metadata for selected, answer, displayed and filtered sources.
- `mainResponseHandler.js`: added source layer metrics to `rag_trace`.
- `sourceQualityMetrics.js`: added `displayed-source-not-in-selected-context` contract checking.
- This documentation-only/hotfix work package did not run smoke tests, automated tests, or build.

### V1.3 Workflow / Mode Selection Conflict Reduction

Status: DONE

- Problem fixed: an old pending mode-selection/help/document workflow can no longer trap a clearly new substantive social-domain question.
- `modeSelection.js`: added substantive-question bypass detection for pending mode-selection prompts. The rule uses general question shape plus social/KOV/service/guidance/practice/risk/legal/public-service/organization/contact/material/disability-support signals, not hardcoded article, file, organization or municipality names.
- `modeSelection.js`: added an assistant-capability guard so prompts such as "Kas sa saad teha PDF?" and "Kas saad dokumendi vormistada?" do not bypass a pending document workflow into RAG.
- `modeSelection.js`: aligned general domain signals with `sourceNeed.js` for SHS, SKA, Sotsiaalkindlustusamet, Töötukassa, töövõime, STAR, infosüsteem, õigusakt, määrus, paragrahv and Riigi Teataja style questions.
- `sourceNeed.js`: concrete named-source follow-up terms remain limited to recent-source follow-up routing (`hasHistory && hasRecentAssistantSources`); this is a known risk to revisit in V2, but it does not currently narrow broad overview retrieval.
- `requestBootstrap.js`: active help/document workflows are bypassed for clearly new substantive questions when no explicit forced mode is set.
- Workflow continuations are preserved for short confirmations, negative replies, numeric choices and document format choices such as `jah`, `ei`, `1`, `2`, `PDF` and `DOCX`.
- `tests/chat/workflowBypass.test.js`: added regressions for overview questions, general social-work questions, guidance/practice questions, AI/social-work questions, KOV/SourcePackage questions, organization/contact/disability/material questions, legal/public-sector/information-system questions, assistant capability questions, confirmations, numeric choices, negative confirmation and document format replies.
- Focused V1.3 tests and `npm run build` passed. Live/server smoke tests were not run in this work package.

### V1.4 Mojibake / Encoding Cleanup

Status: DONE

- `sourceNeed.js`: removed mojibake variants from RAG source-need regexes and kept normalized ASCII terms that match `normalizeSourceNeedText()`.
- Verified `lib/chat` and `lib/rag` runtime files no longer contain the scanned mojibake markers.
- No business logic, planner, retrieval, SourcePackage or workflow behavior was intentionally changed.
- Focused RAG/workflow/source-attribution tests, broader SourcePackage regressions and `npm run build` passed.

### V1.5 Trace and Quality Metrics Expansion

Status: DONE

- `sourceQualityMetrics.js`: added overview-synthesis quality metrics based on `rag_trace.overview_synthesis`.
- Metrics now summarize overview trace count, used count, distinct candidate/relevant/selected document counts, document-count averages, depth-pass added chunks, limited-diversity rate, limited-diversity reasons, dominant-document share and dominant-document exceptions.
- Quality guard now flags `overview_synthesis_low_source_diversity` when at least three relevant documents exist but selected context contains fewer than three distinct documents.
- Quality guard now flags `overview_synthesis_unallowed_dominant_document` when one document dominates an overview answer without an allowed exception while enough relevant alternatives exist.
- `tests/rag/sourceQualityMetrics.test.js`: added regressions for normal overview diversity, too-narrow overview selection and acceptable limited-diversity cases.
- Local V1 acceptance passed: 189 focused RAG/chat/SourcePackage/knowledge tests, lisatest knowledge metadata validation, and `npm run build`.
- Server acceptance: `rag:smoke:source-packages` passed against `https://sotsiaal.ai` for the local Alutaguse fixture with `--answering --attribution --no-persist`. `rag:smoke:v1` against `https://sotsiaal.ai` returned HTTP 401 because this shell has no `SOTSIAALAI_SMOKE_COOKIE` or bearer token configured; this is an access/setup limitation, not a V1.5 code failure.

### Knowledge-doc lisatest metadata check

Status: DONE / superseded by 2026-05-03 folder ingest

- `Andmebaasi/lisatest`: 5 PDF files and 5 matching `knowledge-doc-v1` metadata JSON files are present.
- Each metadata file has a valid `source_path` pointing to a PDF in the same folder.
- Metadata passes `npm run knowledge:validate -- --root "Andmebaasi\lisatest"` with `ingest_ready_count = 5` and no errors.
- Minimal metadata fixes were limited to the lisatest JSON files: `jurisdiction_level`, allowed `document_kind`, allowed `collection_id`, one `source_type` alignment for the Tarkvanem worksheet, and missing `legal_entitlement` in `disallowed_claim_types` where needed.
- Remaining warnings are non-blocking: empty `sectionIndex` for all files and missing `year/publication_date` recommendation for the Peaasi PDF.
- `knowledge:smoke` was later generalized so mixed knowledge-doc folders without the historical hardcoded guideline sample can be checked.
- This lisatest folder is only a small future ingest/retrieval test fixture and is not used to hardcode V1.3 workflow routing.

### Knowledge-doc and Organization Folder Ingest 2026-05-03

Status: DONE / server ingested / smoke green

- Added `scripts/ingest-knowledge-doc-folder.mjs` for local PDF + `knowledge-doc-v1` metadata folders.
- Added npm commands:
  - `knowledge:folder:plan`
  - `knowledge:folder:ingest`
- The folder ingest script supports dry-run by default, `--ingest`, `--skip-existing`, `--doc-id`, `--limit`, `--analyze-pdf`, `--require-section-index`, `--base-url`, `--request-timeout-ms` and `--json`.
- The script sends local PDFs to RAG service `/ingest/pdf-with-metadata` with `metadata_text` and requires `RAG_SERVICE_API_KEY` or `RAG_API_KEY` for ingest mode.
- `--analyze-pdf` can run during dry-run as well as ingest, so PDF TOC/heading section signals can be inspected before writing to RAG.
- Added `scripts/ingest-organization-rag-folder.mjs` for organization 4-file packages (`<slug>.sources.json`, `<slug>.json`, `<slug>.meta.json`, `<slug>.rag.md`) read directly from a folder.
- Added npm commands:
  - `organization:ingest:plan`
  - `organization:ingest`
- Organization folder ingest posts the profile `rag.md` text plus organization metadata to RAG service `/ingest/text`.
- Organization `documents[]` references remain separate document candidates. They are not automatically ingested by the organization profile script.
- `scripts/smoke-knowledge-docs.mjs` now validates all metadata files and ingest payload shapes in a folder, while still running stricter sample assertions only if the historical sample guideline is present.

Server run on 2026-05-03:

- `Andmebaasi/lisatest`: 5 PDF knowledge-doc files ingested.
- `Andmebaasi/uuringud ja juhendid`: 1 PDF knowledge-doc file ingested.
- `Andmebaasi/organisatsioonid`: 1 organization profile package ingested (`organization-astangu`).
- `knowledge:smoke` passed for both `lisatest` and `uuringud ja juhendid`.
- `organization:audit-metadata -- --slug astangu` passed with `metadata_valid = true` and `ingest_ready = true`.
- `rag:smoke:v1` passed.
- `rag:smoke:v2 -- --chat --legal-exact` passed.

Manual smoke observations:

- `Kuidas toetada terviseprobleemiga lapse peret?` routed to `overview_synthesis`, selected multiple sources and displayed the new `Terviseprobleemiga laste ja nende perede toetamise hea tava` PDF as a source.
- `Mis materjale on laste vaimse tervise kohta koolis?` found and displayed the new `Koolilaste ja noorte vaimne tervis` material plus related background articles.
- `Millised organisatsioonid või materjalid aitavad puudega inimest?` still routed as `default` and was dominated by SHS legal sources. This is a planner/source-layer issue, not an ingest failure.

Known metadata quality follow-up:

- V2 smoke remains green, but metadata quality summaries show some `organizations` / `unknown` records missing `authority`, `last_checked`, `url_canonical` and `content_hash`.
- This should be handled by source metadata contract/backfill work, not by reingesting the same files blindly.

### Organization Profile Attribution Fix 2026-05-03

Status: DONE / local tests and build green

Problem:

- The query `Mida Astangu Keskus pakub?` retrieved and selected Astangu sources, but the UI displayed no sources.
- Trace showed selected context existed (`retrieved: 10`, `selected: 2`), so the failure was in answer-source attribution, not frontend rendering or ingest.

Fix:

- `sourceAttribution.js` now includes organization identity fields in attribution matching:
  - `organization_name`
  - `organizationName`
  - `organization_id`
  - `organizationId`
  - `organization_slug`
  - `organizationSlug`
  - matching `metadata.*` aliases
- `sourceAttribution.js` treats `organization_profile` and `organizations` as synthesis/background source candidates where appropriate.
- `riskPolicy.js` now treats `organization_profile` as background evidence, so low-risk organization profile questions can display the selected organization source instead of failing with `insufficient_evidence_strength`.
- `sourceAttribution.js` now normalizes organization URL aliases (`official_website`, `officialWebsite` and matching `metadata.*` fields) into a displayed `url` / `url_canonical`, so the UI can render `Ava allikas` for organization profile sources.
- `components/chat/utils/sources.js` and `components/chat/hooks/useConversationSources.js` now recognize the same organization URL aliases when building clickable source-panel entries.
- Added a regression test for an Astangu-style named organization question.

Validation:

- `tests/chat/sourceAttribution.test.js` passed.
- `tests/chat/sourceUtils.test.js` and `tests/chat/conversationSources.test.js` passed for organization URL alias normalization.
- A wider focused attribution/sourceNeed/retrieval/sourceQuality test batch passed (`55/55`).
- `npm run build` passed.

Expected behavior after deploy:

- `Mida Astangu Keskus pakub?` should display the Astangu organization profile source and expose its official website as a clickable `Ava allikas` link when the source metadata contains an official website URL.

## Current Next Steps

1. Deploy the organization-profile attribution/link fix and retest `Mida Astangu Keskus pakub?` on the live chat.
2. Add a narrow `resource_discovery` / `organization_material_discovery` planning path before the full V2 planner, or make it the first small V2 planner use case.
3. That mode should recognize questions such as `Millised organisatsioonid...`, `Millised materjalid...`, `Kust leida abi...`, `Kelle poole poorduda...`, `Millised kontaktid...` and prefer `organizations`, `organization_materials`, `national_guidelines` and `training_materials` over legal-only results.
4. Start V2 central `questionPlanner.js` after the above targeted source-layer issue is either fixed directly or included as the first planner mode.
5. Keep V2 incremental: structured planner output first, then role/life-situation mapping, retrieval strategy selector and EvidencePackage later.

## Current Runtime Flow

Approximate runtime flow:

```text
requestBootstrap
  -> role, auth, subscription, crisis, language, history, workflow state

workflow / mode layer
  -> help workflow?
  -> document workflow?
  -> mode selection?

retrievalContextAssembler
  -> should RAG run?
  -> query plan
  -> legal/KOV/source/thematic route
  -> retrieval orchestration

retrievalOrchestrator
  -> query variants
  -> recent-source anchors
  -> hybrid retrievers
  -> multi-query search

ragContext
  -> normalize matches
  -> group matches
  -> rank/diversify
  -> render RAG_CONTEXT

sourcePackages / packageAwareContext / sectionAttribution
  -> runtime SourcePackage
  -> package-aware context
  -> section-level attribution summary

promptBuilder / openaiRuntime
  -> system prompt
  -> RAG_CONTEXT
  -> grounding/risk instructions
  -> model answer

mainResponseHandler / sourceAttribution
  -> answer source attribution
  -> displayed sources
  -> rag_trace
  -> persistence
  -> final response
```

## Main Architectural Findings

### What Is Strong

- Hybrid retrieval exists. The runtime can use `dense`, `bm25`, `title_match` and `exact_phrase`.
- Displayed sources are not raw retrieved sources. They are filtered through `sourceAttribution.js`.
- SourcePackage is part of the answer context, not only an admin artifact.
- Section-level attribution exists for package-aware and high-risk answers.
- Legal exact is separated from SourcePackage attribution.
- RAG trace includes source layers, query plan, SourcePackage data, attribution decisions and displayed-source IDs.
- `lib/rag/sourceQualityMetrics.js` can already evaluate displayed-source contract violations and wrong municipality leakage.

### What Is Weak

- There is no single first-class `questionPlanner.js` yet.
- `overview_synthesis` is now a distinct V1 mode with document-diversity selection and trace metrics.
- Multi-source synthesis now has a V1 quality guard for distinct selected documents when enough relevant documents exist.
- Source attribution can hide useful sources if evidence text or metadata is incomplete.
- Several files still contain mojibake/encoding artifacts in regex strings and comments.
- Some modules are too large and combine planning, retrieval, selection, tracing and context construction.

### Most Important Next Fix

Add the V2 central `questionPlanner.js` in a small first patch:

- Produce one structured planning object before retrieval.
- Keep existing `queryPlanner.js`, `sourceNeed.js` and retrieval behavior as consumers during the first V2 step.
- Do not replace SourcePackage, legal exact, overview synthesis or source attribution in the first V2 patch.

## lib/chat Audit

### Core RAG Routing and Planning

| File | Role | Rating | Notes |
| --- | --- | --- | --- |
| `sourceNeed.js` | Decides whether a turn needs external/RAG sources. | B | Improved so substantive user text triggers RAG by default. Still regex-heavy and contains encoding artifacts. Should eventually become part of a central planner. |
| `queryPlanner.js` | Builds RAG query plan: mode, filters, topK, selection strategy and trace summary. | B/C | Important and functional. It already handles legal, temporal, municipality, source lookup and thematic modes. It is too broad and should later split into planner plus retrieval strategy selector. Missing first-class `overview_synthesis`. |
| `retrievalOrchestrator.js` | Builds retrieval queries, recent-source anchors, thematic expansions and multi-query search. | B | Hybrid retrieval and partial failure handling are useful. Exact-name query expansion is intentionally deactivated so broad RAG quality does not depend on rare named anchors. Risk: thematic expansion can become hand-tuned by topic. Needs a cleaner document discovery layer. |
| `retrievalContextAssembler.js` | Main RAG assembly layer. Runs planning, retrieval, selection, SourcePackage, risk policy and metadata assembly. | C | Functional but overloaded. This is the central integration point and the largest refactor candidate. It should eventually delegate planner, source package, evidence package and trace assembly more cleanly. |
| `retrievalPlanning.js` | Temporal/year retrieval planning and topic hints. | B | Useful helper. Not the main bottleneck. |
| `queryAnchors.js` | Extracts exact entity/name anchors such as `OTT`, `Woebot`, `Wysa`. | B | Optional helper only. It is deactivated for RAG gating and retrieval query expansion, and remains useful only as a source-attribution guard for rare exact-name questions. Do not build V1/V2 quality around this file. |

### Context Selection and Rendering

| File | Role | Rating | Notes |
| --- | --- | --- | --- |
| `ragContext.js` | Normalizes matches, groups them, ranks/diversifies them and renders `RAG_CONTEXT`. | B/C | Very important. It has MMR and multi-source selection, but broad overview questions need a stronger document-level selector. Add `selectOverviewSynthesisGroups()`. |
| `promptBuilder.js` | Builds model input, system prompt, `RAG_CONTEXT`, grounding messages and output token settings. | B | Good structure. Needs a dedicated overview-synthesis instruction when query plan asks for multi-source overview. |
| `systemPrompts/et.js` | Estonian system prompt. | B | Good evidence discipline. Can make answers cautious when retrieval is weak. Do not solve retrieval failures by weakening this prompt. |
| `systemPrompts/en.js` | English system prompt. | B | Should stay aligned with Estonian prompt. |
| `systemPrompts/ru.js` | Russian system prompt. | B | Should stay aligned with Estonian prompt. |
| `systemPrompts/common.js` | Shared system prompt rendering helpers. | A | Small and clear. |
| `systemPrompts/index.js` | Language-specific prompt selector. | A | Small and clear. |

### SourcePackage and Attribution

| File | Role | Rating | Notes |
| --- | --- | --- | --- |
| `sourcePackages.js` | Builds runtime SourcePackages from selected/retrieved context and canonical KOV relation files. | B/C | Core KOV package logic is useful and now supports forms, contacts and legal basis. Risk: historical special cases remain. Canonical fallback should be fully generic across all KOV bundles. |
| `packageAwareContext.js` | Converts SourcePackages into compact answer context. | A/B | Good V3.2 layer. It makes package structure visible to the model and exposes missing sections. |
| `sectionAttribution.js` | Builds V3.4A section-level attribution for SourcePackage/high-risk answers. | B | Good foundation. Not claim-level attribution and should not be treated as a full claim store. |
| `sourceAttribution.js` | Filters selected sources into displayed/answer sources. | B | Essential layer. Good legal, package-aware and synthesis branches. V1.1 added overview support and 2026-05-03 added organization identity fields for named organization questions. Remaining risk: may hide correct sources if evidence text or metadata is incomplete. |
| `mainResponseHandler.js` | Runs OpenAI response handling, attribution, trace, SourcePackage persistence and final response assembly. | A/B | Strong final contract. Persistence failure is isolated. File is long and has stream/non-stream duplication, but conceptually sound. |

### Legal and Risk

| File | Role | Rating | Notes |
| --- | --- | --- | --- |
| `legalLookup.js` | Detects exact legal lookups and builds legal query entries. | A/B | Important and reasonably isolated. Must remain opt-out from SourcePackage section attribution. |
| `safety.js` | Crisis/greeting detection and simple grounding strength. | B | Small and useful. Crisis detection is regex-based and should not be considered comprehensive clinical/safety triage. |
| `guardrails.js` | Turn limit helpers. | A | Narrow and clear. |

### Request, Workflow and Response Plumbing

| File | Role | Rating | Notes |
| --- | --- | --- | --- |
| `requestBootstrap.js` | Auth, rate limit, role, language, subscription, crisis and workflow bootstrap. | B | Important and large. Works as route entry orchestration. Risk: workflow state can affect normal RAG turns. |
| `requestContext.js` | Municipality detection, document context, source request detection and chat IDs. | B/C | Useful but mixed responsibilities. Municipality and source-intent logic should eventually be owned by the planner. |
| `mainRouteRuntime.js` | Route helpers, error shape, orchestration metadata and missing municipality instruction. | B | Mostly clean support layer. |
| `modeSelection.js` | Mode selection workflow for RAG/help/document work. | C | Useful, but risky. A new substantive user question should be able to cancel or bypass a pending mode selection. |
| `workflowBranchHandlers.js` | Help/document workflow branch handlers. | C | Functional but broad. Keep separated from normal RAG path. |
| `workflowModeRouting.js` | Help workflow mode routing. | A/B | Small and clear. |
| `orchestrationPolicy.js` | Work modes, complexity and reasoning-depth policy. | B | Useful but not a full RAG planner. |
| `documentOrchestration.js` | Document workflow orchestration. | C | Very large and separate from core RAG. Should not absorb general RAG planning responsibilities. |
| `documentWorkflowState.js` | Document workflow state helpers. | A | Small and clear. |
| `documentWorkflowText.js` | Document workflow i18n wrapper. | A | Small and clear. |
| `responseFinalizer.js` | Final response persistence and response construction. | B | Good separation from main handler. |
| `openaiRuntime.js` | OpenAI call/stream wrapper. | B | Narrow enough. |
| `persistence.js` | Conversation persistence. | B | Clear role. |
| `logger.js` | Event logging wrapper. | B | Small. Depends on Prisma/log model. |
| `routeServerUtils.js` | Chat route auth and no-store utilities. | A/B | Clear support module. |
| `subscriptionGate.js` | Subscription bypass/gate logic. | A | Narrow. |
| `conversationRoles.js` | Conversation role normalization. | A | Narrow. |
| `messageMarkdown.js` | Assistant markdown block parsing. | A/B | Narrow utility. |
| `exportDocument.js` | PDF/Word export from text. | B | Separate feature, not central to RAG. |
| `analyzeFileConfig.js` | Upload file MIME/size helpers. | A | Narrow and clear. |
| `documentWorkflowText.js` | Document workflow labels. | A | Narrow and clear. |

## lib/rag Audit

| File | Role | Rating | Notes |
| --- | --- | --- | --- |
| `sourceMetadata.js` | Canonical RAG metadata contract, source types and validation. | A/B | Very important. Should remain the single source of truth for source types and readiness metadata. Runtime and ingest must not drift from this file. |
| `sourceFreshness.js` | Freshness policy and audit summaries. | B | Useful and detailed. Currently more audit/admin than runtime ranking. Later selection should use freshness more directly. |
| `riskPolicy.js` | Risk classification and source evidence strength. | B | Good evidence guard. `organization_profile` is now accepted as background evidence for low-risk organization profile answers. Regex-based risk classification is useful but not sufficient as final planner. |
| `sourcePackageSnapshots.js` | Persisted SourcePackage snapshot hash/versioning. | A/B | Strong V3.1/V3.3 layer. Keep tests around normalized duplicate identity and active version cleanup. |
| `sourceQualityMetrics.js` | Trace quality metrics: displayed/answer contract, wrong municipality, legal precision and overview source diversity. | A/B | Valuable observability layer. V1.5 now flags too-narrow overview selection and unallowed dominant-document cases. |
| `metadataBackfillPlan.js` | Metadata backfill planning. | B | Good migration/ops helper. Not runtime. |
| `ragServiceFreshnessFallback.js` | Fallback fetch of RAG service documents for freshness audit. | B | Useful operational fallback. |
| `legacyAjakiriCleanup.js` | Legacy Sotsiaaltöö/Ajakiri cleanup planning. | B | Useful cleanup helper. Not runtime. |

## Key Conflicts and Limitations

### 1. Planner Is Fragmented

The planner is spread across:

- `sourceNeed.js`
- `queryPlanner.js`
- `retrievalOrchestrator.js`
- `retrievalContextAssembler.js`
- `ragContext.js`

This means the system can make a correct decision in one file and then lose the intention later. Example: a broad thematic question may be detected, but context selection may still not enforce enough distinct source documents.

### 2. Overview Questions Need a Stronger Contract

Questions like:

- "Millised on probleemid lastekaitses?"
- "Mis raskused on omastehooldajatel?"
- "Millised teemad korduvad sotsiaaltöö praktikas?"

should not default to one article or one document. They need:

- document-level discovery;
- 5-8 source candidates where available;
- maximum 1-2 chunks per document;
- at least 3 distinct documents if at least 3 relevant documents exist;
- displayed sources from the sources actually used in the synthesis.

### 3. Attribution Can Hide Good Sources

`sourceAttribution.js` is necessary because it prevents random retrieved sources from appearing in the source modal. But it can also hide useful sources if:

- source metadata lacks the relevant title/entity;
- `evidenceText` is missing;
- exact anchors are only present in chunk text but not in displayed source metadata;
- the query has many anchors and the source only partially matches them.

This is especially important for named systems like `Woebot`, `Wysa`, `Vivibot`, `XiaoE`, `OTT`, `STAR` and similar.

The 2026-05-03 Astangu fix closed one concrete instance of this class for organization profiles: organization identity metadata is now part of attribution matching, and `organization_profile` is accepted as low-risk background evidence. The broader rule remains: every new source family must expose its identity fields to attribution, otherwise retrieval may select the right source while displayed sources stay empty.

### 4. SourcePackage Is Strong but KOV Fallback Should Be General

`sourcePackages.js` now supports a lot of correct KOV behavior:

- service description/application/eligibility;
- forms;
- contacts;
- legal basis;
- conservative fees/deadlines;
- journal articles cannot confirm current forms/contacts/legal basis.

But KOV canonical relation fallback still has historical special-case shape. It should become a generic resolver for all `KOV/<slug>/<slug>.json` and `<slug>.sources.json` bundles.

### 5. Encoding/Mojibake Artifacts Should Be Cleaned

Some files contain corrupted text fragments in regexes or stopword lists. They may not break every case because parallel ASCII alternatives often exist, but they reduce confidence and make future debugging harder.

This should be a separate cleanup patch with tests.

### 6. Workflow State Can Interfere With New Questions

`modeSelection.js` and workflow state are useful, but a fresh substantive question should not remain trapped behind an old pending mode-selection state.

## Recommended Next Patch

The next small, high-impact patch should be:

1. Add explicit `overview_synthesis` mode.
2. Add `selectOverviewSynthesisGroups()` to `ragContext.js`.
3. Add source diversity trace fields:
   - `overview_synthesis_used`
   - `distinct_selected_document_count`
   - `selected_document_ids`
   - `max_chunks_per_document`
4. Add overview prompt instruction:
   - synthesize across sources;
   - do not summarize a single article unless only one relevant source exists;
   - mention if the available source base is narrow.
5. Add tests:
   - broad lastekaitse question chooses multiple document IDs;
   - concrete article question can still focus on one article;
   - displayed sources remain answer-source based;
   - legal exact remains separate.

## Suggested Future Module Split

Longer term, split the current planner work into explicit modules:

```text
lib/chat/questionPlanner.js
  -> role, mode, source layers, risk, source count, location need

lib/chat/retrievalStrategySelector.js
  -> converts question plan into retrieval channels, filters and topK

lib/chat/documentDiscovery.js
  -> document-level discovery and source diversity

lib/chat/evidencePackage.js
  -> non-KOV multi-source evidence package

lib/chat/sourceSelectionTrace.js
  -> trace reasons and source diversity metrics
```

This should be done gradually. The current system is functional enough to improve incrementally.

## Practical Interpretation

Current system quality:

- KOV package-aware answering: good and improving.
- Legal exact: good, but must be protected from planner changes.
- Displayed-source enforcement: good.
- Section attribution: good foundation.
- General thematic RAG: partially working, but not yet reliable enough for broad synthesis questions.
- PDF/future document ingest: metadata contract exists, but retrieval quality depends on document-level discovery, section titles, chunk metadata and source diversity.

The most important product-quality goal is:

> A broad user question should trigger a broad evidence-seeking plan, not a narrow nearest-chunk answer.

That is the next RAG architecture step.

## V1.1 Test Data And Manual Regression Checklist

STATUS: planned for Overview Synthesis Production Hardening

Use the local data folders below when validating V1.1 and later RAG hardening work:

| Corpus | Path | Use |
| --- | --- | --- |
| KOV / RT / SourcePackage files | `C:\Users\rauds\Desktop\SotsiaalAI\KOV` | KOV service, benefit, regulation and SourcePackage regression checks. |
| Articles, studies and guides | `C:\Users\rauds\Desktop\SotsiaalAI\Andmebaasi` | `overview_synthesis`, methodology, practice and multi-source synthesis checks. |

### Corpus Boundary

Overview synthesis tests should primarily use the articles, studies and guidance corpus, not the KOV SourcePackage path.

KOV service or benefit regression tests should use the KOV folder and must confirm that V1.1 does not route concrete municipality-service questions into a generic overview mode.

Concrete rule:

> If a question mentions a specific municipality and a specific service or benefit, the system should prefer the KOV/SourcePackage path, not `overview_synthesis`.

### Manual Overview Synthesis Questions

Use these questions against the articles, studies and guides corpus:

1. "Millised on probleemid lastekaitses?"
2. "Anna ülevaade probleemidest lastekaitses."
3. "Mis raskused on omastehooldajatel?"
4. "Kuidas toetada puudega lapse peret?"
5. "Millised on peamised kitsaskohad sotsiaaltöös?"
6. "Millised teemad korduvad sotsiaaltöö praktikas?"

Expected behavior:

- query plan mode is `overview_synthesis`;
- selected context uses multiple distinct documents when multiple relevant documents exist;
- answer is a synthesis across sources, not a single article summary;
- displayed sources come from selected/answer sources;
- trace explains if source diversity was limited.

### Manual KOV / SourcePackage Regression Questions

Use these questions against the KOV corpus:

1. "Millised on Harku valla koduteenuse tingimused?"
2. "Kuidas taotleda Harku vallas sotsiaaltransporditeenust?"
3. "Millised vormid on seotud koduteenusega?"
4. "Mis kontaktile pöörduda sotsiaalteenuse küsimuses?"

Expected behavior:

- concrete KOV service/benefit questions do not become `overview_synthesis`;
- SourcePackage remains active where a package can be built;
- KOV web, KOV RT, forms and contacts remain separate evidence roles;
- missing forms, contacts, fees or deadlines are treated as gaps unless the package sources confirm them;
- legal exact and RT regression paths remain green.

### Automated Test Fallback

If local folders are not directly available in automated tests, use mock data for unit tests and keep the manual checklist above as a required smoke procedure.

Minimum automated coverage for V1.1:

1. Query planner mock test: broad topic question returns `mode = overview_synthesis`.
2. Specific document regression: "Tee kokkuvõte artiklist X" does not become `overview_synthesis`.
3. Source diversity selector: five candidate documents produce at least three selected document IDs.
4. Dominance test: one high-scoring document cannot dominate the selected context when other relevant documents exist.
5. Depth pass test: a strong document can contribute additional chunks after diversity is satisfied.
6. Limited diversity test: one or two relevant documents set `source_diversity_limited = true`.
7. KOV regression test: concrete municipality-service question keeps the KOV/SourcePackage path.
