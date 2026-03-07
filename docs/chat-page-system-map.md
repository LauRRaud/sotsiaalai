# Chat Page System Map

## Scope

This document covers `/vestlus` end-to-end behavior:
- personal conversations
- room (group) mode
- streaming
- voice features (`listen`, `speak`, `dictate`)
- persistence and refresh behavior

Date: 2026-03-07

## Frontend Structure

Main orchestrator:
- `components/alalehed/ChatBody.jsx`

Main presentational container:
- `components/alalehed/chat/ChatBodyView.jsx`

Primary hooks and responsibilities:
- `components/chat/hooks/useChatConversationState.js`
  - local chat state, convId bootstrapping, sessionStorage hydration, server hydration from `/api/chat/run`
- `components/chat/hooks/useChatStream.js`
  - send user text, stream AI answer via SSE from `/api/chat`, stop/abort handling, fallback to non-stream response
- `components/chat/hooks/useSpeech.js`
  - speech synthesis and dictation (microphone + STT upload)
- `components/alalehed/chat/hooks/useChatRoomMode.js`
  - room mode mapping and assistant visibility handling
- `components/rooms/useRoomMessages.js`
  - room messages sync via SSE + polling fallback
- `components/chat/hooks/useChatAnalysisController.js`
  - document upload/analyze panel and ephemeral chunk flow

Chat sidebar and drawer:
- `components/ChatSidebar.jsx`
- `components/alalehed/ConversationDrawer.jsx`
- `components/chat/LeftRail.jsx`
- `components/chat/RightRail.jsx`
- `components/chat/HelpListingsPanel.jsx`
- `components/chat/SelectedListingContext.jsx`

## Page shell model

The chat page is now intended to behave as:

- LeftRail
  - platform browsing
  - chats
  - help requests
  - help offers
- Chat area
  - active work area
  - AI conversation
  - mode confirmation
  - help workflows
  - selected listing context
  - Room conversation
- RightRail
  - personal workspace
  - profile
  - rooms
  - add people
  - my help requests
  - my help offers

## End-to-End Flows

### 1) Personal chat message flow

1. User sends text in `ChatComposer`.
2. `useChatStream.sendMessage` appends local `user` message.
3. `POST /api/chat` with `stream: true`, `persist: true`, `convId`, locale, role, history.
4. The backend may first return a natural mode-confirmation prompt before
   routing into help, document, or information flow.
5. SSE events are consumed:
   - `meta`: sources + crisis flag
   - `delta`: streamed text chunks
   - `done`: finalize response
6. Local message is finalized and marked non-streaming.
7. `sotsiaalai:refresh-conversations` event refreshes sidebar list.

Auth/error handling in stream path:
- `401` from `/api/chat` -> sign-in redirect flow
- `403` from `/api/chat` -> localized error banner (or subscription redirect when backend provides `requireSubscription + redirect`)

### 2) New conversation flow (sidebar/drawer)

1. `ChatSidebar.onNew` creates conversation via `POST /api/chat/conversations`.
2. Sidebar immediately calls `activateConversation(nextId, { force: true })`.
3. It writes `sotsiaalai:chat:convId` to sessionStorage.
4. It dispatches `sotsiaalai:switch-conversation` with `convId`.
5. `ChatBody` listens for this event and immediately resets visible chat state to the new conversation.

Result: no extra click is required after pressing "new conversation".

### 3) Mode confirmation gate

1. The user writes a substantive new message in the main chat.
2. `POST /api/chat` infers the most likely mode:
   - information and guidance
   - document/report drafting
   - help request
   - help offer
3. The assistant asks for confirmation in plain language.
4. If the user answers `jah`, the suggested mode is used.
5. If the user answers `ei`, the assistant offers the other modes in plain
   language.
6. Technical labels such as `RAG` are not shown to the end user.

### 4) Room mode flow

1. `roomId` enables room mode in `ChatBody`.
2. `useRoomMessages` loads messages from `/api/rooms/{roomId}/messages`.
3. It opens SSE to `/api/rooms/{roomId}/messages/stream`.
4. If SSE fails, polling fallback continues.
5. Sending message:
   - `POST /api/rooms/{roomId}/messages` writes the user room message
   - optional assistant relay uses `/api/chat` with `roomId`
6. Backend persists assistant room message and publishes room event.

### 5) Help requests and offers inside chat

1. User writes natural language in the main composer.
2. `POST /api/chat` first asks the user to confirm that this should become a
   help request or help offer.
3. After `jah`, help workflow state is loaded from persisted conversation metadata.
4. Help intent detection uses offer/request/mediation patterns, not category or
   municipality words alone.
5. The backend either:
   - asks for missing request / offer fields
   - shows confirmation before save
   - saves a structured help record only after a text confirmation such as
     `jah` or `salvesta`
   - returns ranked browse candidates
   - creates a `HelpMatch` and Room only on explicit connect action
6. LeftRail can open global help requests / help offers panels.
7. RightRail can open `my help requests` / `my help offers`.
8. Selecting a listing opens a human-readable listing context in the chat area.
9. From selected listing context the user can:
   - contact / offer help
   - edit own listing
   - close own listing
   - delete own listing
   - ask AI about the selected listing

### 6) Document drafting inside chat

1. User writes a natural message that suggests document drafting.
2. `POST /api/chat` asks for one plain-language confirmation before entering
   the document flow.
3. After `jah`, document workflow state is locked into the conversation.
4. The original user message is reused as the initial document brief.
5. The backend extracts document fields from each reply and asks only for the
   next missing required item.
6. If document flow is active, the composer shows a paperclip next to the `+`
   button.
7. Files added with that paperclip are treated as chat-session material for the
   current document flow only.
8. Chat-session file limits are role-based:
   - `CLIENT`: up to `2`
   - `SOCIAL_WORKER`: up to `10`
9. Before generation, the backend returns a short summary preview.
10. The user can reply with edits in natural language instead of restarting.
11. `jah` generates the draft and stores it as `AgentArtifact.status = DRAFT`.
12. The draft text is shown immediately in chat.
13. Role-specific result destination after generation:
   - `SOCIAL_WORKER`: Documents page results + artifact detail
   - `CLIENT`: Agent mode page result area
14. Drafts are not directly downloadable; DOCX/PDF downloads are enabled only
   after approval (`FINAL`).

### 7) Voice flow (`listen`, `speak`, `dictate`)

`listen/speak`:
- Trigger: `speakLatestReply` in `useSpeech`
- For `ru` or `en`: browser `speechSynthesis`
- For other locales: `POST /api/tts` first, browser fallback if API fails
- `/api/tts` provider order: Google TTS -> OpenAI TTS fallback

`dictate`:
- Trigger: mic button in `ChatComposer`
- Browser captures audio via `MediaRecorder`
- `POST /api/stt` with form-data audio blob
- Returned text is appended into draft input
- `/api/stt` provider order: external STT (`STT_SERVER_URL`) -> OpenAI transcription fallback
- STT error payloads (`messageKey`) are resolved in UI before fallback generic mic error

## Backend Services and Contracts

### Core chat

- `POST /api/chat`
  - auth/subscription gate
  - optional room membership gate
  - natural mode-selection gate for new substantive chat turns
  - locked document/help workflow continuation after confirmation
  - RAG retrieval + context build
  - OpenAI call (streaming or non-streaming)
  - conversation persistence (`persistInit/Append/Done`)
  - room assistant message publish when `roomId` is set

- `GET /api/chat/run?convId=...`
  - used by frontend to hydrate latest conversation state

- `GET /api/help/listings`
  - paged listing browse
  - supports global or `scope=mine`

- `GET /api/help/listings/{kind}/{id}`
  - selected listing detail for chat context

- `PATCH /api/help/listings/{kind}/{id}`
  - owner edit and close actions

- `DELETE /api/help/listings/{kind}/{id}`
  - owner delete action

- `POST /api/help/matches`
  - explicit HelpMatch + Room creation

- `GET/POST /api/chat/conversations`
  - list/create conversation shells

- `GET/PUT/DELETE /api/chat/conversations/{id}`
  - read/restore/archive single conversation

- `GET /api/chat/conversations/{id}/messages`
  - paged history fetch

### Room services

- `GET /api/rooms`
- `GET /api/rooms/{roomId}/members`
- `GET/POST /api/rooms/{roomId}/messages`
- `GET /api/rooms/{roomId}/messages/stream`

### Voice services

- `POST /api/stt`
  - rate limit: default 20/min per user+ip
  - provider: external STT (`STT_SERVER_URL`) or OpenAI (`OPENAI_STT_MODEL`)

- `POST /api/tts`
  - rate limit: default 30/min per user+ip
  - provider priority:
    - Google TTS if `GOOGLE_APPLICATION_CREDENTIALS` is present
    - OpenAI TTS fallback otherwise

### Document analysis

- `POST /api/chat/analyze-file`
  - quota checked in DB (`analyzeUsage`)
  - forwards file to RAG analyze service with bounded `maxChunks`
  - returns ephemeral chunks/preview for the current chat context
  - current chat UI uses this path for document-flow paperclip uploads
- `POST /api/chat`
  - when ephemeral chunks are present, server builds document context by relevance to current question (not document prefix only)
  - applies role-aware char/chunk budgets:
    - `CLIENT`: smaller context budget by default
    - `SOCIAL_WORKER`: larger context budget by default
  - in extended mode (`combineSources=true`) document budget is reduced to leave room for RAG context
  - uses only chat-session uploaded material for chat document flow, not
    `agentAllowed` selections from `/documents` or `/agendireziim`

## Storage and State

- sessionStorage:
  - active conversation id (`sotsiaalai:chat:convId`)
  - per-user chat cache in `useChatConversationState`
- DB:
  - `conversation`
  - `conversationMessage`
  - `roomMessage`
  - `municipality`
  - `helpRequest`
  - `helpOffer`
  - `helpMatch`
  - `analyzeUsage`
- Room event transport:
  - local in-memory subscribers
  - optional Redis fanout in `lib/roomStream.js`

## Known Risks and Launch Notes

1. i18n consistency for chat surfaces (`FIXED`):
   - Chat/room/stt/tts/analyze API routes now use `messageKey`-first error payloads.
   - Sidebar, rooms page, and analyze hook now resolve API errors via `resolveApiMessage`.
   - `api.*` key coverage is now present in `messages/en.json`, `messages/et.json`, `messages/ru.json`.

2. STT payload guard (`MONITOR`):
   - `/api/stt` has rate limiting but no explicit max upload size check.
   - Recommended: enforce size/type cap server-side.

3. Distributed rate limiting (`MONITOR`):
   - Room message POST limiter is in-memory map.
   - In multi-instance deploys it is not globally consistent.

4. SSE reconnect lifecycle (`FIXED`):
   - `useRoomMessages` now clears pending reconnect timeout on cleanup to avoid stale reconnect attempts.

5. Encoding hygiene (`FIX`):
   - Some files still contain mojibake/non-ASCII artifacts in literals.
   - Recommended: run encoding check in CI as release gate.

## Quick Pre-Launch Checks (Chat)

1. Verify new conversation switches immediately in both sidebar and drawer mode.
2. Verify stop-stream behavior and interrupted message state.
3. Verify room mode with SSE disconnect and polling fallback.
4. Verify `listen/speak/dictate` in `et`, `ru`, `en`.
5. Verify subscription and room membership gates.
6. Verify conversation list refresh after each assistant reply.
7. Verify LeftRail global help browse, RightRail my listings, and selected listing context.
8. Verify explicit connect action opens or reuses a Room conversation.
9. Verify new conversations use natural mode confirmation before entering help
   or document workflows.
10. Verify document flow lock after `jah`, including cancel/restart/switch.
11. Verify the paperclip appears only during document flow and respects role
    file limits.
12. Verify a generated draft appears in chat, then in:
    - Documents results for `SOCIAL_WORKER`
    - Agent mode recent results for `CLIENT`
13. Verify sponsored room access disappears after sponsored subscription expiry
    unless the user has activated their own subscription.
