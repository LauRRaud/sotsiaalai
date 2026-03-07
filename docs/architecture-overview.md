# Architecture Overview

Date: 2026-03-07

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
  - `/agendireziim` -> document workspace and client results surface
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
  - performs auth, rate limiting, subscription checks, natural mode
    confirmation, intent routing, RAG retrieval, OpenAI calls, streaming, and
    persistence
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

Subscription and invite behavior now includes a dedicated one-month sponsored
access path:

- a room owner can pay one month of access for an invited person
- sponsored checkout is blocked if the invitee already has their own active
  subscription
- sponsored access does not auto-convert into ongoing self-paid billing
- room access for `SPONSORED_BY_HOST` membership is revalidated against active
  subscription state, not just room membership metadata

Business logic is intentionally pushed into `lib/*` modules instead of being
embedded directly in route handlers.

## 5. AI Integration and RAG

- Chat generation uses the OpenAI Responses API from `app/api/chat/route.js`.
- GPT-5 mini acts as the primary chat-page orchestrator:
  - asks for natural-language confirmation before entering document drafting,
    information/guidance, help request, or help offer flow
  - chooses work mode by intent and workflow state
  - chooses reasoning depth by server-side policy
  - routes into guidance, help workflows, document workflows, browse, or room
    continuation without exposing model mechanics to the user
- The chat-native document workflow now uses the same locked-flow pattern as
  help workflows:
  - one plain-language confirmation
  - flow lock after `jah`
  - slot-filling over only missing fields
  - preview before generation
  - natural-language edits before draft creation
- Chat document drafting can use files uploaded in the current chat session via
  the composer paperclip, without inheriting `agentAllowed` selections from the
  Documents or Agent mode pages.
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

The central interaction rule is:

- the user describes what they need in ordinary language
- the platform suggests the most likely work mode in ordinary language
- the user confirms with chat text such as `jah` or corrects it with `ei`
- only then does the system commit to document, guidance, help-request, or
  help-offer workflow

The current intended shell is:

- LeftRail
  - platform browsing
  - chats
  - help requests
  - help offers
- Chat area
  - active work area
  - assistant answers
  - mode confirmation
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

`/agendireziim` still exists as the dedicated document workspace and also acts
as the primary results surface for the client role.

`/tellimus` is also the user-facing status surface for sponsored access:

- it shows the sponsored-until date
- warns when sponsored access is close to ending
- prompts the user to activate their own subscription after expiry

Current role-based document result behavior:

- `SOCIAL_WORKER`
  - chat-generated drafts are stored as `AgentArtifact` records
  - the user is directed to the Documents page results area and artifact detail
    views
- `CLIENT`
  - chat-generated drafts are stored as `AgentArtifact` records
  - the user is directed to `/agendireziim`, where recent results and the
    active draft are shown
- DOCX/PDF download remains available only after approval (`FINAL`), not while
  the artifact is still a draft
- artifact list endpoints now return lighter list payloads by default; full
  draft content is fetched on demand from artifact detail endpoints

## 8. Help Requests and Offers in the Main Chat

The new help mediation feature is implemented as a domain inside the main chat
ecosystem:

- user writes naturally in `/vestlus`
- chat orchestrator confirms whether this should become guidance, document
  drafting, a help request, or a help offer
- help intent uses offer/request/mediation signal patterns instead of category
  words alone
- help workflow builds draft state across turns
- user confirms before save with ordinary chat text
- records are saved with structured fields
- browsing happens through LeftRail and RightRail panels
- candidate matching is deterministic backend logic
- real contact creates a `HelpMatch` and reuses existing `Room` chat

Important design rules now in code:

- `municipalityId` is the structured saved location
- `municipalities.rich.json` is the municipality source of truth
- `HelpCategory` controls category semantics
- `TargetGroup` is separate from category
- municipality or category terms alone do not start help mediation
- matching is backend/domain logic, not AI free-form matching
