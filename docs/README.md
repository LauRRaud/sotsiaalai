# Documentation Map

Date: 2026-03-07

This folder contains both current platform documentation and older internal
working documents.

## Current System Docs

- `architecture-overview.md`
  - concise project architecture: routing, auth, data, APIs, AI, extension points
- `feature-map.md`
  - feature-by-feature map of frontend surfaces, APIs, and core data models
- `assistant-agent-RAG-overview.md`
  - current AI architecture: assistant, agent, shared RAG service
- `chat-page-system-map.md`
  - current chat page behavior and flow map, including locked document/help
    workflows and role-based chat document results
- `internal/help-feature-smoke-checklist.md`
  - current pre-release checklist for help workflows, listings panels, and chat-native confirmations
- `RAG_SETUP.md`
  - current RAG service setup notes
- `LOCAL_DEV.md`
  - local development notes
- `payment-*.md`
  - payment readiness, runbooks, and production checks

## Internal Product and Design Docs

These are useful for implementation history or internal reference, but they are
not the main source of truth for current platform behavior:

- `internal/design-system-spec.md`
  - implementation-derived design audit/spec
- `internal/invite-flow.md`
  - invite flow design and business-rule working document
- `internal/invite-email-*.txt`
  - raw invite email text drafts
- `internal/tailwind-variants.md`
  - narrow engineering note for custom Tailwind variants

## Historical or Working Docs

These files are still useful internally, but they are not the main source of
truth for the current platform behavior:

- `internal/agent-artifacts-flow.md`
  - historical contract with a current implementation overlay for draft/final
    behavior and role-based result surfaces
- `internal/platform-production-audit.md`
  - large audit log / working review document
- `internal/route-review-tracker.md`
  - route-by-route review tracker
- `internal/css-imports.txt`
  - raw inventory / helper output
- `internal/routes.txt`
  - raw route inventory / helper output

## Source of Truth Rule

When a historical document conflicts with live implementation:

1. trust the code first
2. use `assistant-agent-RAG-overview.md` for the current AI architecture
3. use `chat-page-system-map.md` for `/vestlus` runtime behavior
4. treat older implementation-contract docs as historical context
