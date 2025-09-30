# SotsiaalAI RAG Service (Pro)

FastAPI + ChromaDB püsisalvestusega RAG teenus. Töötleb TXT/HTML/PDF/DOCX,
salvestab tooriku kettale ja vektorid Chroma kollektsiooni. Autentimine päisega
`X-API-Key` (võrreldakse `RAG_SERVICE_API_KEY` env-väärtusega).

## Endpoints

- `GET  /health`
- `POST /ingest/file`        – { docId, fileName, mimeType, data(base64), [title], [description] }
- `POST /ingest/url`         – { docId, url, [title], [description] }
- `GET  /documents`
- `POST /documents/{docId}/reindex`
- `DELETE /documents/{docId}`
- `POST /search`             – { query, top_k?=5, filterDocId? }

## Keskkonnamuutujad

| Key                   | Selgitus                                             | Vaikimisi                      |
|-----------------------|------------------------------------------------------|--------------------------------|
| `RAG_SERVICE_API_KEY` | Kui seatud, nõuab päist `X-API-Key` selle väärtusega | *(unset)*                      |
| `RAG_STORAGE_DIR`     | Kataloog toorfailidele, html dumpidele, registrile   | `./storage`                    |
| `RAG_COLLECTION`      | Chroma kollektsiooni nimi                            | `sotsiaalai`                   |
| `RAG_EMBED_MODEL`     | sentence-transformers mudel                          | `intfloat/multilingual-e5-small` |
| `RAG_SERVER_MAX_MB`   | Max upload (MB)                                     | `20`                           |
| `RAG_ALLOWED_MIME`    | Lubatud MIME’d, komaeraldatud                        | *(piiramata)*                  |
| `RAG_ALLOWED_ORIGINS` | CORS lubatud päritolud (komaeraldatud)               | `*`                            |

## Kiire start

```bash
cd rag-service
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip wheel
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
