# Architecture Overview

Date: 2026-03-04

This is a concise implementation-based architecture summary of the SotsiaalAI
project.

## 1. Framework and Routing

- The app is built on Next.js App Router with `next@16` and React 19.
- The root shell lives in `app/layout.js` and wraps the app with session, i18n,
  accessibility, background, and PWA providers.
- The main user-facing pages are flat App Router routes such as:
  - `/` -> landing page
  - `/vestlus` -> chat
  - `/documents` -> documents and artifacts
  - `/agendireziim` -> agent workspace
  - `/rooms` and `/room/[roomId]` -> rooms
  - `/admin/*` -> admin pages
- Backend endpoints are implemented as route handlers under `app/api/*`.
- `pages/api/auth/[...nextauth].js` is retained only as the NextAuth bridge.
- Locale-prefixed URLs are normalized by `proxy.js`, which stores the locale in
  a cookie instead of using route-segment based i18n.

## 2. Authentication

- Authentication is built with NextAuth using a custom credentials provider from
  `auth.js`.
- Session strategy is JWT.
- The login flow is custom and two-step:
  - `app/api/auth/login-step1/route.js`
    - validates email + PIN
    - checks trusted device state
    - creates a temporary login token
    - sends OTP email when required
  - `app/api/auth/login-step2/route.js`
    - verifies OTP
    - can register a trusted device cookie
- The final sign-in uses the temporary login token through NextAuth.
- Registration, email verification, password reset, and profile updates are
  handled in dedicated App Router API routes.
- Authorization helpers in `lib/authz.js` centralize admin checks, effective
  role resolution, and subscription gating.

## 3. Database Layer

- The database layer uses Prisma 7 with PostgreSQL.
- Prisma client setup is in `lib/prisma.js`.
- The schema is in `prisma/schema.prisma`.
- Main model groups:
  - Identity and auth:
    - `User`, `Profile`, `Account`, `Session`, `VerificationToken`
    - `EmailOtpCode`, `TrustedDevice`, `LoginTempToken`
  - Billing:
    - `Subscription`, `Payment`
  - RAG library:
    - `RagDocument`
  - Chat:
    - `ConversationRun`, `Conversation`, `ConversationMessage`, `AnalyzeUsage`,
      `ChatLog`
  - Rooms and invites:
    - `Room`, `RoomMember`, `Invite`, `RoomMessage`
  - Documents and agent artifacts:
    - `UserDocument`, `AgentArtifact`, `AgentArtifactSourceDocument`,
      `DocumentAudit`

## 4. API Routes and Backend Logic

- `app/api/chat/route.js`
  - main chat orchestration endpoint
  - performs auth, rate limiting, subscription checks, RAG retrieval, OpenAI
    calls, streaming, and persistence
- `app/api/chat/conversations/*`
  - conversation lifecycle and message history
- `app/api/documents/*`
  - document upload, retrieval, download, and metadata actions
- `app/api/documents/artifacts/*`
  - agent artifact create, generate, refine, approve, and download flows
- `app/api/research/jobs/*`
  - async deep-research job creation, polling, and SSE streaming
- `app/api/rooms/*` and `app/api/invites/*`
  - room membership, room messages, invite creation, resend, revoke, accept
- `app/api/subscription/*`
  - subscription state, checkout init, callback, and webhook handling
- `app/api/admin/*`
  - analytics, retrieval stats, payment alert dispatch, and RAG admin features

Business logic is intentionally pushed into `lib/*` modules instead of being
embedded directly in route handlers.

## 5. AI Integration and RAG

- Chat generation uses the OpenAI Responses API from `app/api/chat/route.js`.
- Document artifact drafting and refinement use OpenAI through
  `lib/documents/generation.js`.
- Deep research uses a planner -> retrieval -> synthesis pipeline in
  `lib/research/pipeline.js`.
- Retrieval is backed by a separate Python FastAPI service in `rag-service/`.
- The RAG service:
  - uses OpenAI embeddings
  - stores vectors in ChromaDB
  - exposes ingest and search endpoints
- The Next.js app reaches the RAG service either:
  - directly through internal fetch calls
  - or through wrapper helpers such as `lib/documents/ragService.js`
- User-uploaded documents for agent workflows are indexed on demand via
  `lib/documents/embeddings.js` and queried via `lib/documents/search.js`.

## 6. Folder Structure and Key Modules

- `app/`
  - pages, route handlers, root layout, error/loading boundaries
- `components/`
  - frontend UI and feature components
  - important areas: `chat`, `documents`, `rooms`, `agent`, `auth`, `ui`
- `lib/`
  - shared application logic grouped by domain
  - key subfolders: `chat`, `documents`, `research`, `payments`, `auth`,
    `admin`, `i18n`
- `prisma/`
  - schema and migrations
- `rag-service/`
  - separate Python retrieval service
- `messages/`
  - translation dictionaries
- `public/`
  - static assets and metadata templates
- `pages/`
  - legacy compatibility surface, mainly NextAuth
- `generated/`
  - generated Prisma client output

## 7. Clean Place for an "Agent Portal"

The cleanest extension point is around the existing document-agent workspace,
not inside the generic chat surface.

- Current portal-like entrypoint:
  - `app/agendireziim/page.js`
  - `components/agent/AgentModePage.jsx`
- Clean expansion path:
  - add a dedicated route such as `app/agents/page.js` or evolve
    `/agendireziim` into a fuller portal shell
  - create a new bounded context under `app/api/agents/*` and `lib/agents/*`
  - reuse existing modules from `lib/documents/*` and `lib/research/*`
  - add dedicated Prisma models if workflow state is needed instead of
    overloading `Conversation` or `AgentArtifact`

That keeps the separation clean:

- chat remains conversational
- documents and artifacts remain document-centric
- a future agent portal becomes the orchestration layer above both
