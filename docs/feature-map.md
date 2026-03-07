# Feature Map

Date: 2026-03-07

This document maps the main platform features to their frontend surfaces, API
entrypoints, and primary data models.

## 1. Authentication and Account

- User-facing functions:
  - register account
  - sign in with email + PIN
  - verify sign-in with OTP when required
  - manage profile email and PIN
  - reset forgotten PIN
  - verify email address
  - admin role preview
- Frontend surfaces:
  - registration page
  - login modal / login flow
  - profile page
  - reset password pages
- API:
  - `app/api/register/route.js`
  - `app/api/auth/login-step1/route.js`
  - `app/api/auth/login-step2/route.js`
  - `app/api/auth/login-resend-otp/route.js`
  - `app/api/auth/password/reset/route.js`
  - `app/api/verify-email/route.js`
  - `app/api/profile/route.js`
  - `app/api/profile/view-role/route.js`
  - `pages/api/auth/[...nextauth].js`
- Data models:
  - `User`
  - `Profile`
  - `VerificationToken`
  - `EmailOtpCode`
  - `TrustedDevice`
  - `LoginTempToken`
  - `Account`
  - `Session`

## 2. Subscription and Billing

- User-facing functions:
  - view current subscription
  - start subscription checkout
  - cancel subscription
  - process payment callbacks and webhooks
  - see sponsored access end date and expiry warnings
- Frontend surfaces:
  - subscription page
  - payment result handling
- API:
  - `app/api/subscription/route.js`
  - `app/api/subscription/init/route.js`
  - `app/api/subscription/callback/route.js`
  - `app/api/subscription/webhook/route.js`
- Data models:
  - `Subscription`
  - `Payment`

## 3. Chat Assistant

- User-facing functions:
  - ask questions in chat
  - confirm in plain language whether the current turn should be treated as
    information/guidance, document drafting, help request, or help offer
  - continue locked document/help workflows after one confirmation
  - receive grounded AI answers
  - stream answers live
  - continue saved conversations
  - export generated summaries
  - analyze uploaded file context
- Frontend surfaces:
  - `/vestlus`
  - chat sidebar and conversation drawer
  - chat message and source panels
- API:
  - `app/api/chat/route.js`
  - `app/api/chat/run/route.js`
  - `app/api/chat/conversations/route.js`
  - `app/api/chat/conversations/[id]/route.js`
  - `app/api/chat/conversations/[id]/messages/route.js`
  - `app/api/chat/export/route.js`
  - `app/api/chat/analyze-file/route.js`
  - `app/api/chat/analyze-usage/route.js`
- Data models:
  - `Conversation`
  - `ConversationMessage`
  - `ConversationRun`
  - `AnalyzeUsage`
  - `ChatLog`

## 4. Shared RAG Knowledge Layer

- Platform functions:
  - retrieve knowledge snippets before answering
  - filter sources by audience and metadata
  - support both central library content and user-document retrieval
  - expose admin access to the RAG backend
- Frontend surfaces:
  - admin RAG page
  - admin self-test / retrieval health tooling
- API:
  - `app/api/rag/[...path]/route.js`
  - `app/api/rag/selftest/route.js`
  - `app/api/admin/retrieval-stats/route.js`
- Backend services:
  - `rag-service/main.py`
  - `lib/documents/ragService.js`
  - `lib/chat/ragContext.js`
- Data models:
  - `RagDocument`
  - `ChatLog`

## 5. Documents Library

- User-facing functions:
  - upload documents
  - list owned documents
  - view metadata
  - download originals
  - mark documents as agent-allowed
- Frontend surfaces:
  - `/documents`
  - document dropdowns and detail views
- API:
  - `app/api/documents/route.js`
  - `app/api/documents/[id]/route.js`
  - `app/api/documents/[id]/download/route.js`
- Data models:
  - `UserDocument`
  - `DocumentAudit`

## 6. Agent Workspace and Artifacts

- User-facing functions:
  - select source documents
  - use optional templates
  - generate first draft
  - refine draft with additional instructions
  - save draft
  - approve final result
  - download DOCX or PDF
  - show chat-generated drafts in different result surfaces by role
- Frontend surfaces:
  - `/agendireziim`
  - `components/agent/AgentModePage.jsx`
  - `/documents`
  - document artifact detail views
- API:
  - `app/api/documents/artifacts/route.js`
  - `app/api/documents/artifacts/generate/route.js`
  - `app/api/documents/artifacts/refine/route.js`
  - `app/api/documents/artifacts/[id]/route.js`
  - `app/api/documents/artifacts/[id]/approve/route.js`
  - `app/api/documents/artifacts/[id]/download/route.js`
- Backend modules:
  - `lib/documents/generation.js`
  - `lib/documents/embeddings.js`
  - `lib/documents/search.js`
  - `lib/documents/evidence.js`
- Data models:
  - `AgentArtifact`
  - `AgentArtifactSourceDocument`
  - `UserDocument`
  - `DocumentAudit`

Current role split:

- `SOCIAL_WORKER`
  - primary results surface: `/documents` -> results list and artifact detail
  - chat-generated drafts link back to Documents
- `CLIENT`
  - primary results surface: `/agendireziim`
  - recent chat-generated drafts appear there and open in the same workspace
- draft download is blocked until approval; only `FINAL` artifacts expose DOCX
  and PDF download URLs
- artifact lists now omit full `content` by default and load it only when a
  detail or copy action explicitly needs it

## 7. Deep Research

- User-facing functions:
  - submit a larger research question
  - run planner -> retrieval -> synthesis
  - stream progress updates
  - receive structured summary with evidence references
- Frontend surfaces:
  - chat/research mode hooks and progress UI
- API:
  - `app/api/research/jobs/route.js`
  - `app/api/research/jobs/[id]/route.js`
  - `app/api/research/jobs/[id]/stream/route.js`
- Backend modules:
  - `lib/research/pipeline.js`
  - `lib/research/jobStore.js`
  - `lib/research/auth.js`
- Data models:
  - no dedicated persistent job table
  - optional result persistence into conversation records

## 8. Rooms and Collaboration

- User-facing functions:
  - list rooms
  - open a room
  - send and stream messages
  - track unread state
  - manage members
  - leave room
  - allow sponsored members to access the room only while their sponsored or
    own subscription is active
- Frontend surfaces:
  - `/rooms`
  - `/room/[roomId]`
- API:
  - `app/api/rooms/route.js`
  - `app/api/rooms/[roomId]/route.js`
  - `app/api/rooms/[roomId]/messages/route.js`
  - `app/api/rooms/[roomId]/messages/stream/route.js`
  - `app/api/rooms/[roomId]/messages/[msgId]/route.js`
  - `app/api/rooms/[roomId]/members/route.js`
  - `app/api/rooms/[roomId]/read/route.js`
  - `app/api/rooms/[roomId]/leave/route.js`
- Data models:
  - `Room`
  - `RoomMember`
  - `RoomMessage`

## 9. Help Requests, Offers, and Matching

- User-facing functions:
  - create a help request in chat
  - create a help offer in chat
  - confirm save in plain chat text (`jah`, `salvesta`) before a listing is
    written to the database
  - browse global help requests
  - browse global help offers
  - manage own help listings from the chat page
  - open selected listing context in the chat area
  - explicitly connect a request and offer
  - continue the real conversation in an existing Room flow
- Frontend surfaces:
  - `/vestlus`
  - `components/chat/LeftRail.jsx`
  - `components/chat/RightRail.jsx`
  - `components/chat/HelpListingsPanel.jsx`
  - `components/chat/SelectedListingContext.jsx`
  - `components/alalehed/ChatBody.jsx`
- API:
  - `app/api/chat/route.js`
  - `app/api/help/listings/route.js`
  - `app/api/help/listings/[kind]/[id]/route.js`
  - `app/api/help/matches/route.js`
- Backend modules:
  - `lib/chat/modeSelection.js`
  - `lib/help/chatWorkflow.js`
  - `lib/help/requests.js`
  - `lib/help/offers.js`
  - `lib/help/matches.js`
  - `lib/help/listingViews.js`
  - `lib/help/locationNormalization.js`
  - `lib/help/municipalities.js`
- Data models:
  - `Municipality`
  - `HelpCategory`
  - `TargetGroup`
  - `HelpRequest`
  - `HelpOffer`
  - `HelpMatch`
  - `HelpRequestCategory`
  - `HelpOfferCategory`
  - `HelpRequestTargetGroup`
  - `HelpOfferTargetGroup`

## 10. Invites

- User-facing functions:
  - invite people into rooms by email
  - resend or revoke invites
  - accept invite
  - support self-paid and sponsored invite modes
  - allow a sponsor to pay one month of access for the invited person
- Frontend surfaces:
  - invite modal
  - join page
- API:
  - `app/api/invites/route.js`
  - `app/api/invites/[id]/accept/route.js`
  - `app/api/invites/[id]/resend/route.js`
  - `app/api/invites/[id]/revoke/route.js`
  - `app/api/invites/sponsored/init/route.js`
  - `app/api/invites/sponsored/callback/route.js`
- Data models:
  - `Invite`
  - related `Room`, `RoomMember`, `Subscription`, `Payment`

Current sponsored invite rule:

- sponsor pays one month of access
- invitee is not automatically converted to self-paid billing afterwards
- if invitee already has their own active subscription, sponsored checkout is
  blocked

## 11. Admin and Analytics

- User-facing functions:
  - view platform analytics
  - inspect retrieval statistics
  - manage RAG content
  - dispatch payment alerts
- Frontend surfaces:
  - `/admin/analytics`
  - `/admin/rag`
- API:
  - `app/api/admin/analytics/summary/route.js`
  - `app/api/admin/analytics/events/route.js`
  - `app/api/admin/analytics/users/route.js`
  - `app/api/admin/analytics/reset/route.js`
  - `app/api/admin/analytics/payment-alerts/dispatch/route.js`
  - `app/api/admin/retrieval-stats/route.js`
- Data models:
  - `ChatLog`
  - `RagDocument`
  - `Subscription`
  - `Payment`

## 12. Speech, Accessibility, and Platform UX

- User-facing functions:
  - text-to-speech
  - speech-to-text
  - accessibility preferences
  - locale switching
  - installable PWA behavior
- Frontend surfaces:
  - accessibility provider and modal
  - speech hooks in chat
  - service worker registration
- API:
  - `app/api/tts/route.js`
  - `app/api/stt/route.js`
- Supporting modules:
  - `components/accessibility/*`
  - `components/pwa/*`
  - `lib/i18n/*`

## Architectural Pattern

The platform is structured as a modular application monolith:

- Next.js App Router for UI and HTTP APIs
- Prisma + PostgreSQL for core persistence
- separate Python RAG service for retrieval and embeddings
- domain logic grouped under `lib/`
- feature UIs grouped under `components/`

The strongest current feature domains are:

- chat assistant
- help requests / help offers / matching
- document agent workspace
- retrieval-backed knowledge access
- collaboration via rooms and invites
