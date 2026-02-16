# Chat Page System Map

## Scope

This document covers `/vestlus` end-to-end behavior:
- personal conversations
- room (group) mode
- streaming
- voice features (`listen`, `speak`, `dictate`)
- persistence and refresh behavior

Date: 2026-02-15

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
- `components/chat/RightRail.jsx`

## End-to-End Flows

### 1) Personal chat message flow

1. User sends text in `ChatComposer`.
2. `useChatStream.sendMessage` appends local `user` message.
3. `POST /api/chat` with `stream: true`, `persist: true`, `convId`, locale, role, history.
4. SSE events are consumed:
   - `meta`: sources + crisis flag
   - `delta`: streamed text chunks
   - `done`: finalize response
5. Local message is finalized and marked non-streaming.
6. `sotsiaalai:refresh-conversations` event refreshes sidebar list.

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

### 3) Room mode flow

1. `roomId` enables room mode in `ChatBody`.
2. `useRoomMessages` loads messages from `/api/rooms/{roomId}/messages`.
3. It opens SSE to `/api/rooms/{roomId}/messages/stream`.
4. If SSE fails, polling fallback continues.
5. Sending message:
   - `POST /api/rooms/{roomId}/messages` writes the user room message
   - optional assistant relay uses `/api/chat` with `roomId`
6. Backend persists assistant room message and publishes room event.

### 4) Voice flow (`listen`, `speak`, `dictate`)

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
  - RAG retrieval + context build
  - OpenAI call (streaming or non-streaming)
  - conversation persistence (`persistInit/Append/Done`)
  - room assistant message publish when `roomId` is set

- `GET /api/chat/run?convId=...`
  - used by frontend to hydrate latest conversation state

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
- `POST /api/chat`
  - when ephemeral chunks are present, server builds document context by relevance to current question (not document prefix only)
  - applies role-aware char/chunk budgets:
    - `CLIENT`: smaller context budget by default
    - `SOCIAL_WORKER`: larger context budget by default
  - in extended mode (`combineSources=true`) document budget is reduced to leave room for RAG context

## Storage and State

- sessionStorage:
  - active conversation id (`sotsiaalai:chat:convId`)
  - per-user chat cache in `useChatConversationState`
- DB:
  - `conversation`
  - `conversationMessage`
  - `roomMessage`
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
