# OpenAI Model And Reasoning Policy

Date: 2026-03-24

## Standard text Responses flows

The standard text Responses flows all use the same fixed model path and the same low-only generation settings:

- model: `gpt-5.4-mini`
- `text.verbosity: "low"`
- `reasoning.effort: "low"`

This applies to:

- chat
- documents
- research
- RAG selftest

## Implementation rule

Every standard Responses request must set both of these fields explicitly in the payload:

- `text.verbosity`
- `reasoning.effort`

The codebase does not rely on per-flow model overrides for the standard text paths.

## Optional help workflow extraction

The help request / help offer workflow can optionally run a narrow draft-patching step after the deterministic parser.
This is off by default and is not part of the standard text Responses path.

- enable with: `HELP_WORKFLOW_AI_EXTRACTOR=1`
- model override: `HELP_WORKFLOW_EXTRACTOR_MODEL`
- default extractor model: `gpt-5.4-nano`
- purpose: classify or correct structured draft fields before the next help-workflow question

## Other OpenAI uses

Speech and audio features remain separate from the standard text Responses policy.

- STT uses a transcription model
- TTS uses a speech model

Those paths are outside this document.

## Why this policy exists

- keep the implementation simple and consistent
- keep latency and cost bounded
- make usage logging comparable across flows

