# Assistant, Agent and RAG Overview

Date: 2026-03-04

This document describes the current AI architecture of the SotsiaalAI project:

- the chat assistant
- the document drafting agent
- the shared Python RAG service

It reflects the current retrieval-first agent implementation and the current chat prompt / RAG configuration.

## High-Level Split

The platform has two separate AI workflows:

1. Chat assistant at `/vestlus`
2. Document drafting agent at `/agendireziim`

They share:

- the OpenAI API
- the Python RAG backend
- some document extraction infrastructure

But they solve different problems:

- the assistant is a conversational, RAG-grounded answer system
- the agent is a retrieval-first drafting workflow for user-selected documents

## 1. Chat Assistant

### Purpose

The assistant answers user questions in a chat interface using:

- recent conversation turns
- retrieved RAG evidence
- optional uploaded-document context

### Main files

- `app/vestlus/page.js`
- `components/alalehed/ChatBody.jsx`
- `components/chat/hooks/useChatConversationState.js`
- `components/chat/hooks/useChatStream.js`
- `components/chat/hooks/useChatAnalysisController.js`
- `app/api/chat/route.js`
- `app/api/chat/run/route.js`
- `lib/chat/promptBuilder.js`
- `lib/chat/ragContext.js`
- `lib/chat/settings.js`
- `lib/chat/persistence.js`

### Message flow

1. The user sends a message from `ChatBody`.
2. `useChatStream` posts it to `/api/chat`.
3. The backend:
   - validates auth and subscription
   - normalizes recent history
   - caps the model-facing user message
   - optionally retrieves RAG matches
   - optionally builds temporary document context from uploaded file chunks
4. The backend builds the prompt and calls OpenAI.
5. The response is streamed back via SSE.
6. The conversation is persisted in the database.

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

## 2. Document Drafting Agent

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

## 3. Shared Python RAG Service

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

## 4. Agent Retrieval and Observability

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

## 5. Data and Persistence

### Chat

Chat persistence stores:

- conversations
- conversation messages
- room messages

Main persistence file:

- `lib/chat/persistence.js`

### Agent

Agent persistence stores:

- `UserDocument`
- `AgentArtifact`
- `AgentArtifactSourceDocument`
- `DocumentAudit`

Relevant schema:

- `prisma/schema.prisma`

## 6. What the User Sees vs What Stays Internal

### User-facing

Users see:

- assistant responses
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

## 7. Current Production Position

From an architecture perspective, the platform is now in a much stronger state than before:

- chat prompt is smaller and more controlled
- agent is retrieval-first instead of sending huge raw source blobs by default
- Python RAG remains the single embedding pipeline
- fallback behavior preserves reliability
- retrieval observability exists for operators

The current balance is:

- more quality-oriented than the earlier strict cost-optimized configuration
- still bounded enough to avoid obvious prompt explosion

## 8. Important Note About Older Docs

`docs/internal/agent-artifacts-flow.md` contains historical assumptions that are no longer fully accurate.

Specifically, it says uploaded documents are out of scope for RAG retrieval in the agent workflow.

That is no longer true for the current implementation.

The current source of truth for the actual system behavior is:

- the live code
- this overview document
