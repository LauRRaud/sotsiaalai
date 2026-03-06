# Assistant, Agent and RAG Overview

Date: 2026-03-06

This document describes the current AI architecture of the SotsiaalAI project:

- the main chat orchestrator
- chat-native help and document workflows
- the shared Python RAG service

It reflects the current retrieval-first agent implementation and the current chat prompt / RAG configuration.

## High-Level Split

The intended product behavior is one continuous chat experience with internal
mode switching.

The current runtime split is:

1. Main chat orchestrator at `/vestlus`
2. Legacy document workspace at `/agendireziim`

They share:

- the OpenAI API
- the Python RAG backend
- document extraction and retrieval infrastructure
- conversation persistence

Inside `/vestlus`, the orchestrator now routes between:

- information / RAG guidance
- help request creation
- help offer creation
- browse / retrieval
- deterministic match handoff
- document drafting entry into the existing document flow

The user does not choose assistant vs agent as separate products.

## 1. Main Chat Orchestrator

### Purpose

The main chat route answers user questions and starts structured workflows using:

- recent conversation turns
- retrieved RAG evidence
- optional uploaded-document context
- workflow state persisted in conversation metadata

### Main files

- `app/vestlus/page.js`
- `components/alalehed/ChatBody.jsx`
- `components/chat/hooks/useChatConversationState.js`
- `components/chat/hooks/useChatStream.js`
- `components/chat/hooks/useChatAnalysisController.js`
- `app/api/chat/route.js`
- `app/api/chat/run/route.js`
- `lib/chat/orchestrationPolicy.js`
- `lib/chat/documentOrchestration.js`
- `lib/chat/promptBuilder.js`
- `lib/chat/ragContext.js`
- `lib/chat/settings.js`
- `lib/chat/persistence.js`
- `lib/help/chatWorkflow.js`

### Message flow

1. The user sends a message from `ChatBody`.
2. `useChatStream` posts it to `/api/chat`.
3. The backend:
   - validates auth and subscription
   - normalizes recent history
   - caps the model-facing user message
   - optionally retrieves RAG matches
   - optionally builds temporary document context from uploaded file chunks
4. The backend chooses work mode and reasoning depth by policy.
5. The backend builds the prompt and calls OpenAI.
6. If help workflow is active, the backend can save listings, browse matches,
   or create HelpMatch + Room on explicit action.
7. The response is streamed back via SSE.
8. The conversation is persisted in the database.

### Current orchestration rule

`GPT-5 mini` is treated as the main orchestration model behind the conversation
page, but reasoning depth is chosen by server policy, not by the user.

Current policy shape:

- low
  - browse, retrieval, connect, short RAG answers
- medium
  - help workflow refinement, structured guidance, confirmation summaries,
    ordinary document drafting
- high
  - reports, formal drafting, deeper synthesis

### Current prompt structure

The assistant now uses a smaller prompt layout:

- `SYSTEM`
  - small permanent policy only
- `RAG_CONTEXT`
  - bounded evidence text
- `RECENT_MESSAGES`
  - bounded recent turns
- `USER_MESSAGE`

### Current chat optimization settings

Current chat-side limits:

- user message sent to model: max `1500` chars
- recent history: max `8` messages
- max chars per history message: `800`
- `RAG_TOP_K = 12`
- `RAG_CONTEXT_GROUPS_MAX = 6`
- `RAG_CTX_MAX_CHARS = 4500`
- `RAG_GROUP_BODY_MAX_CHARS = 1100`

These values are designed to keep quality reasonably high while still limiting prompt growth.

## 2. Help Workflows Inside Chat

### Purpose

The help domain lets the user create and work with:

- help requests
- help offers
- ranked candidate matches
- Room-based continuation after explicit connection

### Main files

- `lib/help/chatWorkflow.js`
- `lib/help/requests.js`
- `lib/help/offers.js`
- `lib/help/matches.js`
- `lib/help/listingViews.js`
- `lib/help/locationNormalization.js`
- `components/chat/LeftRail.jsx`
- `components/chat/RightRail.jsx`
- `components/chat/SelectedListingContext.jsx`
- `components/alalehed/ChatBody.jsx`

### Current architecture

The help feature is chat-native:

1. user writes a natural message
2. intent detection starts request/offer workflow when appropriate
3. draft state persists across turns
4. only missing fields are asked
5. confirmation happens before save
6. after save, the same chat can browse matches or continue toward contact

Matching is not done by AI over raw text.

The backend does:

- hard filters over structured fields
- weighted ranking over structured fields
- `HelpMatch` creation only on explicit user contact action
- `Room` creation or reuse for real connection

## 3. Document Drafting Workflow

### Purpose

The agent creates and refines drafts from user-selected documents, such as:

- reports
- case briefs
- meeting summaries
- checklists
- letters

### Main files

- `app/agendireziim/page.js`
- `components/agent/AgentModePage.jsx`
- `app/api/documents/artifacts/generate/route.js`
- `app/api/documents/artifacts/refine/route.js`
- `app/api/documents/artifacts/route.js`
- `app/api/documents/artifacts/[id]/route.js`
- `app/api/documents/artifacts/[id]/approve/route.js`
- `lib/documents/generation.js`
- `lib/documents/embeddings.js`
- `lib/documents/search.js`
- `lib/documents/evidence.js`
- `lib/documents/sourceMaterial.js`
- `lib/documents/retrievalObservability.js`

### Current architecture

The agent is now retrieval-first.

Current flow:

1. User selects source documents.
2. Node extracts document text.
3. Each document is ensured to be indexed in the Python RAG service.
4. The user instruction is used as the retrieval query.
5. Relevant chunks are searched only within the selected documents.
6. Evidence blocks are built from the retrieved chunks.
7. OpenAI generates or refines the draft using those evidence blocks.

Fallback flow:

If indexing or retrieval fails completely, the system falls back to the previous source-material behavior:

1. extract text
2. build bounded source-document excerpts
3. send only those excerpts to the model

This preserves backward compatibility.

### Agent action model

The agent does not use an autonomous planner or function-calling loop.

The application decides the action:

- no current draft -> generate
- existing draft -> refine
- save -> persist draft
- approve -> finalize artifact

This logic is implemented in `components/agent/AgentModePage.jsx`.

### Agent evidence settings

Current evidence budgets:

- short: `1500` tokens
- standard: `4000` tokens
- detailed: `4500` tokens

This is intentionally larger than the earlier cost-optimized configuration because long reports need more grounded context.

Current retrieval diversity limits:

- default: max `2` chunks per document
- detailed: max `3` chunks per document

This reduces semantic duplication when retrieval would otherwise return many very similar chunks from the same source document.

Current fallback excerpt limit:

- fallback source material: max `4000` chars total

The fallback excerpt keeps:

- the beginning
- the middle
- the end

This keeps fallback prompts bounded even when retrieval fails completely.

## 4. Shared Python RAG Service

### Purpose

The Python RAG service is the shared retrieval backend for the platform.

It performs:

- chunking
- embeddings
- Chroma vector storage
- semantic search
- file analysis/extraction support

### Main file

- `rag-service/main.py`

### Shared responsibilities

The RAG service is used in two different ways:

1. Chat assistant:
   - searches platform knowledge / indexed source documents
2. Agent:
   - indexes selected user documents
   - retrieves relevant excerpts for drafting

### Important design rule

The Python RAG service is the only embedding pipeline.

Node does not create a second embedding pipeline.

For the agent:

- Node extracts text
- Python handles chunking and embeddings through `/ingest/text`
- Python handles vector search through `/search`

## 5. Document Retrieval and Observability

The agent now includes internal observability for retrieval behavior.

### What is tracked

- retrieval mode
- chunks used
- documents indexed
- token budget
- fallback reason

### Main file

- `lib/documents/retrievalObservability.js`

### Current diagnostics

Structured logs:

- `AGENT_RETRIEVAL mode=rag documents=... chunks=... token_budget=...`
- `AGENT_RETRIEVAL mode=fallback_source_material reason=...`
- `RAG_AGENT_INGEST doc_id=... chunks=... status=ok`
- `RAG_AGENT_INGEST doc_id=... status=error reason=...`

Development-only chunk logs:

- `AGENT_RETRIEVAL_CHUNKS ...`

Admin diagnostics endpoint:

- `GET /api/admin/retrieval-stats`

Returned counters:

- `total_requests`
- `retrieval_success`
- `fallback_count`
- `fallback_rate`

### Persistence of retrieval diagnostics

Retrieval debug metadata is linked to artifact lifecycle through document audit records.

Current persisted diagnostic fields include:

- `retrievalMode`
- `chunksUsed`
- `fallbackUsed`
- `fallbackReason`
- `documentsIndexed`
- `tokenBudget`

These are stored in audit metadata, not exposed to end users.

## 6. Data and Persistence

### Chat

Chat persistence stores:

- conversations
- conversation messages
- room messages
- workflow metadata for help/document orchestration

Main persistence file:

- `lib/chat/persistence.js`

### Help domain

Help-domain persistence stores:

- `Municipality`
- `HelpCategory`
- `TargetGroup`
- `HelpRequest`
- `HelpOffer`
- `HelpMatch`

### Documents

Agent persistence stores:

- `UserDocument`
- `AgentArtifact`
- `AgentArtifactSourceDocument`
- `DocumentAudit`

Relevant schema:

- `prisma/schema.prisma`

## 7. What the User Sees vs What Stays Internal

### User-facing

Users see:

- assistant responses
- help request / help offer listing cards
- selected listing detail context in chat
- explicit contact actions that continue into Rooms
- agent draft/refine results
- artifact save/approve/export behavior

### Internal-only

Users do not see:

- retrieval debug metadata
- ingest logs
- fallback reasons
- internal prompt structure
- retrieval counters

This is intentional.

## 8. Current Production Position

From an architecture perspective, the platform is now in a much stronger state than before:

- chat orchestration is centralized and policy-driven
- help requests and offers are integrated into the main chat shell
- agent is retrieval-first instead of sending huge raw source blobs by default
- Python RAG remains the single embedding pipeline
- fallback behavior preserves reliability
- retrieval observability exists for operators

The current balance is:

- more quality-oriented than the earlier strict cost-optimized configuration
- still bounded enough to avoid obvious prompt explosion

## 9. Important Note About Older Docs

`docs/internal/agent-artifacts-flow.md` contains historical assumptions that are no longer fully accurate.

Specifically:

- it predates the retrieval-first document workflow
- it predates the single-chat orchestration policy
- it predates the help request / help offer domain inside `/vestlus`

Those older assumptions are no longer the source of truth for the current
system.

The current source of truth for the actual system behavior is:

- the live code
- this overview document
