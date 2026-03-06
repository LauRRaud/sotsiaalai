# Architecture Overview

Date: 2026-03-06

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
  - `/agendireziim` -> legacy document-agent workspace
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
  - Help mediation domain:
    - `Municipality`, `HelpCategory`, `TargetGroup`
    - `HelpRequest`, `HelpOffer`, `HelpMatch`
    - `HelpRequestCategory`, `HelpOfferCategory`
    - `HelpRequestTargetGroup`, `HelpOfferTargetGroup`
  - Documents and agent artifacts:
    - `UserDocument`, `AgentArtifact`, `AgentArtifactSourceDocument`,
      `DocumentAudit`

## 4. API Routes and Backend Logic

- `app/api/chat/route.js`
  - main chat orchestration endpoint
  - performs auth, rate limiting, subscription checks, intent routing, RAG
    retrieval, OpenAI calls, streaming, and persistence
- `app/api/chat/conversations/*`
  - conversation lifecycle and message history
- `app/api/help/listings/*`
  - global and user-scoped help listing browse, detail, edit, close, delete
- `app/api/help/matches/route.js`
  - explicit HelpMatch + Room creation on user action
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
- GPT-5 mini acts as the primary chat-page orchestrator:
  - chooses work mode by intent and workflow state
  - chooses reasoning depth by server-side policy
  - routes into guidance, help workflows, document workflows, browse, or room
    continuation without exposing model mechanics to the user
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
  - important areas: `chat`, `documents`, `rooms`, `agent`, `help`, `auth`,
    `ui`
- `lib/`
  - shared application logic grouped by domain
  - key subfolders: `chat`, `help`, `documents`, `research`, `payments`,
    `auth`, `admin`, `i18n`
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

## 7. Chat-Shell Product Shape

The product direction is now a single-chat ecosystem, not separate assistant and
agent products.

The current intended shell is:

- LeftRail
  - platform browsing
  - chats
  - help requests
  - help offers
- Chat area
  - active work area
  - assistant answers
  - help request / help offer workflows
  - selected listing context
  - Room-based person-to-person communication
- RightRail
  - personal workspace and communication controls
  - profile
  - rooms
  - add people
  - my help requests
  - my help offers

The older `/agendireziim` route still exists for document work, but it is not
the main product architecture for the new help domain.

## 8. Help Requests and Offers in the Main Chat

The new help mediation feature is implemented as a domain inside the main chat
ecosystem:

- user writes naturally in `/vestlus`
- chat orchestrator detects intent
- help workflow builds draft state across turns
- user confirms before save
- records are saved with structured fields
- browsing happens through LeftRail and RightRail panels
- candidate matching is deterministic backend logic
- real contact creates a `HelpMatch` and reuses existing `Room` chat

Important design rules now in code:

- `municipalityId` is the structured saved location
- `municipalities.rich.json` is the municipality source of truth
- `HelpCategory` controls category semantics
- `TargetGroup` is separate from category
- matching is backend/domain logic, not AI free-form matching
