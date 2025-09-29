# SotsiaalAI RAG Service

This folder contains a minimal FastAPI service that matches the `/ingest/file`, `/ingest/url`, `/ingest/reindex` and `/search` endpoints consumed by the admin panel.

## Quick start (virtualenv)

```
cd rag-service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `RAG_SERVICE_API_KEY` | Optional shared secret, checked from `X-API-Key` header | *(unset)* |
| `RAG_STORAGE_DIR` | Directory for persisted raw files, HTML dumps and Chroma data | `./storage` |
| `RAG_SERVER_MAX_MB` | Maximum upload size in megabytes | `25` |
| `RAG_EMBED_MODEL` | SentenceTransformer model for embeddings | `all-MiniLM-L6-v2` |
| `RAG_COLLECTION` | Chroma collection name | `sotsiaalai` |
| `RAG_ALLOWED_ORIGINS` | CORS allowlist (comma separated) | `*` |

## Deploy on the VPS

1. Copy this folder to the server, e.g. `scp -r rag-service ubuntu@uvn-72-147.tll01.zonevs.eu:~/`.
2. Create a virtualenv and install requirements.
3. Start the API with `uvicorn` or create a `systemd` unit. Example:

ini
# /etc/systemd/system/rag.service
[Unit]
Description=SotsiaalAI RAG service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/rag-service
Environment="RAG_SERVICE_API_KEY=supersecret"
Environment="RAG_STORAGE_DIR=/home/ubuntu/rag-storage"
ExecStart=/home/ubuntu/rag-service/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target

bash
sudo systemctl daemon-reload
sudo systemctl enable --now rag.service
```

## API responses

```
POST /ingest/file    -> {"status":"COMPLETED","remoteId":"...","insertedAt":"2025-09-27T12:34:56+00:00"}
POST /ingest/url     -> {"status":"COMPLETED","remoteId":"...","insertedAt":"..."}
POST /ingest/reindex -> {"status":"COMPLETED","remoteId":"...","insertedAt":"..."}
POST /search         -> {"matches":[{"id":"doc::0","text":"..."}]}
GET  /health         -> {"status":"ok","documents":"5"}
```

Raw files and HTML pages are stored under `storage/`, while processed chunks live in the persistent Chroma collection.


