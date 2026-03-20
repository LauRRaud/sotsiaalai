# OpenAI Model And Reasoning Policy

Date: 2026-03-20

## Current baseline

- Default text model: `gpt-5.4-mini`
- Default fallback reasoning: `low`
- Allowed runtime reasoning levels in chat orchestration:
  - `low`
  - `medium`
- `high` is intentionally not used in the platform anymore.

Relevant config:

- `.env`
- `.env.local`
- `.env.production`
- `/etc/sotsiaalai/frontend.env` on VPS

## How reasoning works

`OPENAI_REASONING_EFFORT=low` is only a fallback.

If a flow passes an explicit runtime reasoning value, that runtime value overrides the env fallback.

This means:

- env `low` does **not** prevent runtime `medium`
- chat and workflow orchestration can still choose `medium`
- flows without explicit reasoning use fallback `low`

## Current routing policy

### Always low

- browse help requests
- browse help offers
- connect to request
- connect to offer
- match or handoff
- help workflow steps:
  - `detect`
  - `extract`
  - `save`
  - `browse`
  - `connect`

### Can use medium

- general question:
  - normal complexity
  - complex complexity
- service guidance:
  - normal complexity
  - complex complexity
- help workflow steps:
  - `refine`
  - `confirm`
- document drafting
- report drafting

## Flow-by-flow summary

### Chat

- model: `gpt-5.4-mini`
- reasoning: dynamic `low|medium` via orchestration

### Document workflow triggered from chat

- model: `gpt-5.4-mini`
- reasoning: inherited from document orchestration plan
- current practical ceiling: `medium`

### Direct documents API (`/api/documents/artifacts/...`)

- model: `gpt-5.4-mini`
- no explicit orchestration reasoning passed today
- practical behavior: fallback `low`

### Research pipeline

- model: `RESEARCH_MODEL` if set, otherwise default model
- current default: `gpt-5.4-mini`
- no explicit reasoning passed today
- practical behavior: fallback `low` / no explicit reasoning override

### RAG selftest

- model: `gpt-5.4-mini`
- no explicit reasoning override

### STT / TTS

- separate models:
  - `gpt-4o-mini-transcribe`
  - `gpt-4o-mini-tts`
- not part of text reasoning policy

## Why this policy exists

- platform tasks are relatively bounded
- platform uses its own RAG layer
- stronger base model quality is preferred over raising reasoning effort
- lower reasoning reduces latency and cost
- `medium` remains available where workflows genuinely benefit from extra structured reasoning

## If we change this later

Recommended next escalation order:

1. keep model at `gpt-5.4-mini`
2. raise only selected flows from `low` to `medium`
3. do not reintroduce `high` unless a specific measured use case clearly justifies it
