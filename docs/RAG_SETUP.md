# RAG Setup

Date: 2026-03-04

This project uses a separate FastAPI RAG service. The web app talks to it over
HTTP.

Current roles:

- the chat assistant uses the RAG service for retrieval
- the document agent uses the same RAG service for document indexing and
  retrieval
- the RAG service is the only embedding pipeline in the system

## Main Environment Variables

Web app:

- `RAG_API_BASE`: full RAG service URL, for example `https://rag.sotsiaal.ai`
- `RAG_API_KEY`: shared secret sent as `X-API-Key`
- `RAG_MAX_UPLOAD_MB`: upload limit for the web app
- `NEXT_PUBLIC_RAG_MAX_UPLOAD_MB`: same limit for UI hints
- `NEXT_PUBLIC_RAG_ALLOWED_MIME`: allowed MIME types in the UI
- `OPENAI_API_KEY`: OpenAI key used by the web app chat and agent flows
- `OPENAI_MODEL`: response model, currently `gpt-5-mini`

RAG service:

- `RAG_SERVICE_API_KEY`: shared secret required by the RAG service
- `RAG_STORAGE_DIR`: local storage and Chroma persistence directory
- `RAG_COLLECTION`: Chroma collection name
- `RAG_SERVER_MAX_MB`: max upload size
- `RAG_ALLOWED_MIME`: allowed MIME types on the RAG service
- `RAG_ALLOWED_ORIGINS`: CORS allowlist
- `OPENAI_API_KEY`: OpenAI key used by the RAG service for embeddings
- `RAG_EMBED_MODEL`: embedding model, currently `text-embedding-3-large`

## Chunking Defaults

The RAG service is token-aware by default:

- `RAG_CHUNK_MODE=tokens`
- `RAG_CHUNK_TOKENS=700`
- `RAG_CHUNK_TOKENS_OVERLAP=120`
- `RAG_SINGLE_CHUNK_TOKEN_LIMIT=1200`
- `RAG_ALWAYS_CHUNK=false` unless explicitly enabled

If `tiktoken` is unavailable, the service falls back to character-based chunking.

## Current Chat Retrieval Settings

Current web-app retrieval settings:

- `RAG_TOP_K=12`
- `RAG_CONTEXT_GROUPS_MAX=6`
- `RAG_CTX_MAX_CHARS=4500`
- `RAG_GROUP_BODY_MAX_CHARS=1100`
- `RAG_MMR_LAMBDA=0.5`

These are quality-oriented defaults, not the earlier stricter cost-optimized
settings.

## Agent Retrieval Notes

The current agent is retrieval-first:

1. Node extracts document text
2. Node sends text to the RAG service through `/ingest/text`
3. Python chunks and embeds the text
4. The agent searches only within selected documents through `/search`
5. Retrieved results are limited per source document before evidence assembly:
   - default: max `2` chunks per document
   - detailed mode: max `3` chunks per document
6. If retrieval fails completely, the agent falls back to a bounded
   source-material excerpt flow instead of sending large raw document text

## Agent Fallback Limits

The fallback path is intentionally constrained:

- `AGENT_SOURCE_FALLBACK_MAX_CHARS=4000` by default
- fallback excerpts use:
  - beginning
  - middle
  - end

This keeps fallback prompts bounded while still preserving:

- document opening context
- core body content
- closing or summary context

## Local Run

```bash
cd rag-service
python -m venv .venv
. .venv/bin/activate
pip install -U pip wheel
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

The live system behavior is documented in:

- `docs/assistant-agent-RAG-overview.md`
