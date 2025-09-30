from __future__ import annotations

import base64
import json
import os
import hashlib
from io import BytesIO
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional, Tuple

import requests
from bs4 import BeautifulSoup
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

import chromadb
from chromadb.utils import embedding_functions

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    PdfReader = None

try:
    import docx2txt
except ImportError:  # pragma: no cover
    docx2txt = None

MAX_UPLOAD_MB = float(os.environ.get("RAG_SERVER_MAX_MB", "25"))
STORAGE_ROOT = Path(os.environ.get("RAG_STORAGE_DIR", "./storage")).resolve()
RAW_DIR = STORAGE_ROOT / "raw"
HTML_DIR = STORAGE_ROOT / "urls"
REGISTRY_PATH = STORAGE_ROOT / "registry.json"

EMBED_MODEL = os.environ.get("RAG_EMBED_MODEL", "all-MiniLM-L6-v2")
COLLECTION_NAME = os.environ.get("RAG_COLLECTION", "sotsiaalai")

for folder in (STORAGE_ROOT, RAW_DIR, HTML_DIR):
    folder.mkdir(parents=True, exist_ok=True)

client = chromadb.PersistentClient(path=str(STORAGE_ROOT / "chroma"))
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBED_MODEL)
collection = client.get_or_create_collection(name=COLLECTION_NAME, embedding_function=embedding_fn)

app = FastAPI(title="SotsiaalAI RAG Service", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("RAG_ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def load_registry() -> Dict[str, Dict]:
    if not REGISTRY_PATH.exists():
        return {}
    try:
        return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}

def save_registry(data: Dict[str, Dict]) -> None:
    tmp_path = REGISTRY_PATH.with_suffix(".tmp")
    tmp_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp_path.replace(REGISTRY_PATH)

registry = load_registry()

def require_api_key(x_api_key: Optional[str] = Header(default=None)) -> None:
    expected = os.environ.get("RAG_SERVICE_API_KEY")
    if expected and x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")

class FileIngestRequest(BaseModel):
    docId: str
    fileName: str
    mimeType: str
    data: str
    title: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None

class UrlIngestRequest(BaseModel):
    docId: str
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None

class ReindexRequest(BaseModel):
    docId: str

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 4
    where: Optional[Dict[str, str]] = None

def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> list[str]:
    if not text:
        return []
    chunks: list[str] = []
    length = len(text)
    start = 0
    step = max(1, chunk_size - overlap)
    while start < length:
        end = min(length, start + chunk_size)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= length:
            break
        start += step
    return chunks

def ensure_utf8(text: str) -> str:
    return "\n".join(line.strip() for line in text.splitlines() if line.strip())

def normalize_audience(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    upper = str(value).upper().strip()
    if upper in {"SOCIAL_WORKER", "CLIENT", "BOTH"}:
        return upper
    return None

def extract_pdf_text(data: bytes) -> Optional[str]:
    if PdfReader is None:
        return None
    try:
        reader = PdfReader(BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip() or None
    except Exception:
        return None

def extract_docx_text(data: bytes) -> Optional[str]:
    if docx2txt is None:
        return None
    tmp_dir = RAW_DIR / "_tmp"
    tmp_dir.mkdir(exist_ok=True)
    tmp_file = tmp_dir / "temp.docx"
    tmp_file.write_bytes(data)
    try:
        text = docx2txt.process(str(tmp_file))
        return text
    except Exception:
        return None
    finally:
        try:
            tmp_file.unlink()
        except Exception:
            pass

def extract_text_from_bytes(data: bytes, mime: str) -> Optional[str]:
    mime = (mime or "").lower()
    if mime.startswith("text/") or mime in {"application/json", "application/xml"}:
        try:
            return data.decode("utf-8", errors="ignore")
        except Exception:
            return data.decode("latin-1", errors="ignore")
    if mime in {"text/html", "application/xhtml+xml"}:
        soup = BeautifulSoup(data.decode("utf-8", errors="ignore"), "html.parser")
        return soup.get_text("\n", strip=True)
    if mime == "application/pdf":
        return extract_pdf_text(data)
    if mime in {"application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}:
        return extract_docx_text(data)
    return None

def fetch_url_text(url: str) -> Tuple[str, str]:
    headers = {"User-Agent": os.environ.get("RAG_USER_AGENT", "SotsiaalAI-RAG/0.1")}
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    html = response.text
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text("\n", strip=True)
    return text, html

def write_raw_file(doc_id: str, file_name: str, data: bytes) -> str:
    doc_dir = RAW_DIR / doc_id
    doc_dir.mkdir(parents=True, exist_ok=True)
    target = doc_dir / file_name
    target.write_bytes(data)
    return str(target.relative_to(STORAGE_ROOT))

def write_html_file(doc_id: str, html: str) -> str:
    target = HTML_DIR / f"{doc_id}.html"
    target.write_text(html, encoding="utf-8")
    return str(target.relative_to(STORAGE_ROOT))

def upsert_document(doc_id: str, title: Optional[str], description: Optional[str], text: str, source_meta: Dict[str, str]) -> Dict:
    prepared = ensure_utf8(text)
    chunks = chunk_text(prepared)
    if not chunks:
        raise HTTPException(status_code=422, detail="Text content is empty after processing.")

    collection.delete(where={"docId": doc_id})

    ids = [f"{doc_id}::{i}" for i in range(len(chunks))]
    metadatas = []
    for index in range(len(chunks)):
        meta = {"docId": doc_id, "chunk": index}
        meta.update(source_meta)
        if title:
            meta["title"] = title
        if description:
            meta["description"] = description
        metadatas.append(meta)

    collection.add(ids=ids, documents=chunks, metadatas=metadatas)

    inserted = now_iso()
    registry[doc_id] = {
        "docId": doc_id,
        "title": title,
        "description": description,
        "source": source_meta,
        "chunks": len(chunks),
        "lastIngested": inserted,
        "audience": source_meta.get("audience"),
    }
    save_registry(registry)

    return {"status": "COMPLETED", "remoteId": doc_id, "insertedAt": inserted}

@app.post("/ingest/file")
async def ingest_file(payload: FileIngestRequest, _: None = Depends(require_api_key)):
    try:
        raw = base64.b64decode(payload.data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Failed to decode base64 payload.") from exc

    max_bytes = int(MAX_UPLOAD_MB * 1024 * 1024)
    if len(raw) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds limit of {MAX_UPLOAD_MB} MB.")

    text = extract_text_from_bytes(raw, payload.mimeType)
    if not text:
        raise HTTPException(status_code=422, detail="Unsupported or unreadable file format.")

    stored_file = write_raw_file(payload.docId, payload.fileName, raw)
    file_hash = hashlib.sha256(raw).hexdigest()

    audience = normalize_audience(payload.audience)

    source_meta = {
        "type": "FILE",
        "fileName": payload.fileName,
        "mimeType": payload.mimeType,
        "storedFile": stored_file,
        "hash": file_hash,
    }
    if audience:
        source_meta["audience"] = audience

    result = upsert_document(
        doc_id=payload.docId,
        title=payload.title,
        description=payload.description,
        text=text,
        source_meta=source_meta,
    )
    return result

@app.post("/ingest/url")
async def ingest_url(payload: UrlIngestRequest, _: None = Depends(require_api_key)):
    try:
        text, html = fetch_url_text(payload.url)
    except requests.HTTPError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"Failed to fetch URL: {exc.response.reason}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Failed to fetch URL content.") from exc

    if not text.strip():
        raise HTTPException(status_code=422, detail="Fetched page did not contain readable text.")

    stored_html = write_html_file(payload.docId, html)

    audience = normalize_audience(payload.audience)

    source_meta = {
        "type": "URL",
        "url": payload.url,
        "storedHtml": stored_html,
    }
    if audience:
        source_meta["audience"] = audience

    result = upsert_document(
        doc_id=payload.docId,
        title=payload.title,
        description=payload.description,
        text=text,
        source_meta=source_meta,
    )
    registry[payload.docId]["lastFetched"] = now_iso()
    if audience:
        registry[payload.docId]["audience"] = audience
    save_registry(registry)
    return result

@app.post("/search")
async def search(payload: SearchRequest, _: None = Depends(require_api_key)):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query is required.")

    top_k = payload.top_k or 4
    try:
        top_k = max(1, min(int(top_k), 20))
    except Exception:
        top_k = 4

    query_result = collection.query(
        query_texts=[payload.query],
        n_results=top_k,
        where=payload.where or None,
    )

    ids = query_result.get("ids") or []
    if not ids:
        return {"matches": []}

    docs = []
    documents = query_result.get("documents") or []
    metadatas = query_result.get("metadatas") or []
    distances = query_result.get("distances") or []

    first_ids = ids[0] if ids else []
    first_docs = documents[0] if documents else []
    first_metas = metadatas[0] if metadatas else []
    first_distances = distances[0] if distances else []

    for idx, match_id in enumerate(first_ids):
        docs.append({
            "id": match_id,
            "text": first_docs[idx] if idx < len(first_docs) else None,
            "metadata": first_metas[idx] if idx < len(first_metas) else None,
            "distance": first_distances[idx] if idx < len(first_distances) else None,
        })

    return {"matches": docs}

@app.post("/ingest/reindex")
async def reindex(payload: ReindexRequest, _: None = Depends(require_api_key)):
    entry = registry.get(payload.docId)
    if not entry:
        raise HTTPException(status_code=404, detail="Document not found in registry.")

    source = entry.get("source", {})
    doc_type = source.get("type")

    if doc_type == "FILE":
        relative_path = source.get("storedFile")
        if not relative_path:
            raise HTTPException(status_code=400, detail="Stored file path missing.")
        file_path = STORAGE_ROOT / relative_path
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Stored file is missing from disk.")
        raw = file_path.read_bytes()
        text = extract_text_from_bytes(raw, source.get("mimeType") or "")
        if not text:
            raise HTTPException(status_code=422, detail="Could not re-extract text from stored file.")
        result = upsert_document(
            doc_id=payload.docId,
            title=entry.get("title"),
            description=entry.get("description"),
            text=text,
            source_meta=source,
        )
        return result

    if doc_type == "URL":
        url = source.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="URL missing from registry entry.")
        text, html = fetch_url_text(url)
        stored_html = write_html_file(payload.docId, html)
        source["storedHtml"] = stored_html
        result = upsert_document(
            doc_id=payload.docId,
            title=entry.get("title"),
            description=entry.get("description"),
            text=text,
            source_meta=source,
        )
        registry[payload.docId]["lastFetched"] = now_iso()
        save_registry(registry)
        return result

    raise HTTPException(status_code=400, detail="Unsupported registry entry type.")

@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok", "documents": str(len(registry))}
