from __future__ import annotations

import base64
import json
import os
import re
import hashlib
from io import BytesIO
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

# --- optional libmagic (fall back if missing) ---
try:
    import magic  # type: ignore
    _MAGIC_OK = True
except Exception:
    magic = None  # type: ignore
    _MAGIC_OK = False

import requests
from bs4 import BeautifulSoup
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import chromadb
from chromadb.config import Settings

# OpenAI embeddings (better quality than lite local models)
from openai import OpenAI

# --------------------
# ENV & GLOBALS
# --------------------
RAG_SERVICE_API_KEY = os.getenv("RAG_SERVICE_API_KEY", "")
STORAGE_DIR = Path(os.getenv("RAG_STORAGE_DIR", "./storage")).resolve()
REGISTRY_PATH = STORAGE_DIR / "registry.json"
COLLECTION_NAME = os.getenv("RAG_COLLECTION", "sotsiaalai")

# OpenAI embeddings (default to high-quality model)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBED_MODEL = os.getenv("RAG_EMBED_MODEL", os.getenv("EMBEDDING_MODEL", "text-embedding-3-small"))

MAX_MB = int(os.getenv("RAG_SERVER_MAX_MB", "20"))

# Lubatud MIME – kui env on tühi, kasuta mõistlikku vaikimisi komplekti
_DEFAULT_ALLOWED = (
    "application/pdf,"
    "text/plain,"
    "text/markdown,"
    "text/html,"
    "application/msword,"
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)
ALLOWED_MIME = set(
    m.strip() for m in (os.getenv("RAG_ALLOWED_MIME", _DEFAULT_ALLOWED).split(",")) if m.strip()
)

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("RAG_ALLOWED_ORIGINS", "*").split(",") if o.strip()]

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing for RAG embeddings")

STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Chroma client (persistent) – we send precomputed OpenAI embeddings
client = chromadb.Client(Settings(persist_directory=str(STORAGE_DIR / "chroma")))
collection = client.get_or_create_collection(name=COLLECTION_NAME)

# OpenAI client
oa = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="SotsiaalAI RAG Service (OpenAI embeddings)", version="3.4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# Utils
# --------------------
AUDIENCE_VALUES = {"SOCIAL_WORKER", "CLIENT", "BOTH"}

def normalize_audience(value: Optional[str]) -> Optional[str]:
    if not value:
        return "BOTH"
    v = str(value).strip().upper()
    return v if v in AUDIENCE_VALUES else "BOTH"

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _load_registry() -> Dict[str, Dict]:
    if REGISTRY_PATH.exists():
        try:
            return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}

def _save_registry(data: Dict[str, Dict]) -> None:
    REGISTRY_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def _require_key(x_api_key: Optional[str] = Header(default=None, alias="X-API-Key")) -> None:
    if not RAG_SERVICE_API_KEY:
        return  # auth disabled
    if not x_api_key or x_api_key != RAG_SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")

def _bytes_mb(b: bytes) -> float:
    return len(b) / (1024 * 1024)

def _detect_mime(name: str, data: bytes, declared: Optional[str]) -> str:
    if declared:
        return declared
    if _MAGIC_OK:
        try:
            return magic.from_buffer(data, mime=True)  # type: ignore
        except Exception:
            pass
    import mimetypes
    return mimetypes.guess_type(name)[0] or "application/octet-stream"

def _clean_text(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()

def _extract_text_from_pdf(buff: bytes) -> str:
    from pypdf import PdfReader
    try:
        reader = PdfReader(BytesIO(buff))
        pages = []
        for p in reader.pages:
            t = p.extract_text() or ""
            pages.append(t)
        return "\n".join(pages)
    except Exception as e:
        raise HTTPException(422, f"PDF parse failed: {e}")

def _extract_text_from_docx(buff: bytes) -> str:
    import tempfile, docx2txt
    try:
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=True) as tf:
            tf.write(buff)
            tf.flush()
            text = docx2txt.process(tf.name) or ""
        return text
    except Exception as e:
        raise HTTPException(422, f"DOCX parse failed: {e}")

def _extract_text_from_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for t in soup(["script", "style", "noscript"]):
        t.decompose()
    txt = soup.get_text(separator=" ")
    return _clean_text(txt)

def _split_chunks(text: str, max_chars: int = 1600, stride: int = 1000) -> List[str]:
    chunks: List[str] = []
    i = 0
    while i < len(text):
        chunk = text[i:i+max_chars]
        chunk = _clean_text(chunk)
        if chunk:
            chunks.append(chunk)
        i += stride
    return chunks

def _doc_dir_hashed(doc_id: str) -> Path:
    return STORAGE_DIR / "docs" / hashlib.sha1(doc_id.encode("utf-8")).hexdigest()[:12]

def _doc_dir(doc_id: str) -> Path:
    d = _doc_dir_hashed(doc_id)
    d.mkdir(parents=True, exist_ok=True)
    return d

# --- OpenAI embedding helpers ---
def _embed_batch(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    resp = oa.embeddings.create(model=EMBED_MODEL, input=texts)
    return [d.embedding for d in resp.data]

# --------------------
# Schemas
# --------------------
class IngestFile(BaseModel):
    docId: str
    fileName: str
    mimeType: Optional[str] = None
    data: str  # base64
    title: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None  # NEW

class IngestURL(BaseModel):
    docId: str
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None  # NEW

class SearchIn(BaseModel):
    query: str
    top_k: int = 5
    filterDocId: Optional[str] = None
    where: Optional[dict] = None  # NEW: generic filters (e.g. {"audience": {"$in": ["CLIENT","BOTH"]}})

# --------------------
# Core ingest
# --------------------
def _ingest_text(doc_id: str, text: str, meta_common: Dict) -> int:
    text = _clean_text(text)
    chunks = _split_chunks(text)
    if not chunks:
        return 0

    # Generate unique ids
    base = hashlib.sha1(f"{doc_id}-{now_iso()}".encode()).hexdigest()[:10]
    ids = [f"{doc_id}:{base}:{i}" for i in range(len(chunks))]

    metadatas = []
    for _ in chunks:
        m = {
            "doc_id": doc_id,
            "title": meta_common.get("title"),
            "description": meta_common.get("description"),
            # ---- FLATTENED SOURCE FIELDS (no dicts!) ----
            "source_type": meta_common.get("source_type"),
            "source_path": meta_common.get("source_path"),
            "source_url": meta_common.get("source_url"),
            # ---------------------------------------------
            "mimeType": meta_common.get("mimeType"),
            "audience": normalize_audience(meta_common.get("audience")),  # normalized
            "createdAt": now_iso(),
        }
        metadatas.append({k: v for k, v in m.items() if v is not None})

    embeddings = _embed_batch(chunks)
    collection.upsert(documents=chunks, metadatas=metadatas, ids=ids, embeddings=embeddings)
    return len(chunks)

def _register(doc_id: str, entry: Dict) -> None:
    reg = _load_registry()
    e = reg.get(doc_id, {})
    if not e.get("createdAt"):
        e["createdAt"] = now_iso()
    e.update(entry)
    e["docId"] = doc_id
    e["updatedAt"] = now_iso()
    reg[doc_id] = e
    _save_registry(reg)

# --------------------
# Routes
# --------------------
@app.get("/health")
def health():
    reg = _load_registry()
    try:
        n = collection.count()
    except Exception:
        n = -1
    return {
        "ok": True,
        "status": "ok",           # ← lisatud
        "vectors": n,
        "documents": len(reg),
        "embed_model": EMBED_MODEL,
        "collection": COLLECTION_NAME,
    }

@app.post("/ingest/file", dependencies=[Depends(_require_key)])
def ingest_file(payload: IngestFile):
    raw = base64.b64decode(payload.data)
    size_mb = _bytes_mb(raw)
    if size_mb > MAX_MB:
        raise HTTPException(413, f"File too large ({size_mb:.1f}MB > {MAX_MB}MB)")

    mime = _detect_mime(payload.fileName, raw, payload.mimeType)
    if ALLOWED_MIME and mime not in ALLOWED_MIME:
        raise HTTPException(415, f"MIME not allowed: {mime}")

    # save raw
    d = _doc_dir(payload.docId)
    raw_path = d / payload.fileName
    raw_path.write_bytes(raw)

    # extract text
    if mime == "application/pdf":
        text = _extract_text_from_pdf(raw)
    elif mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        text = _extract_text_from_docx(raw)
    elif mime == "text/html":
        text = _extract_text_from_html(raw.decode("utf-8", errors="ignore"))
    else:
        # text/plain, text/markdown, application/msword (best effort), etc.
        text = raw.decode("utf-8", errors="ignore")

    inserted = _ingest_text(
        payload.docId,
        text,
        meta_common={
            "title": payload.title,
            "description": payload.description,
            "source_type": "file",
            "source_path": str(raw_path),
            "mimeType": mime,
            "audience": normalize_audience(payload.audience),
        },
    )

    reg_entry = {
        "type": "FILE",
        "fileName": payload.fileName,
        "mimeType": mime,
        "lastIngested": now_iso(),
        "path": str(raw_path),
        "title": payload.title,
        "description": payload.description,
        "audience": normalize_audience(payload.audience),
    }
    _register(payload.docId, reg_entry)

    return {"ok": True, "inserted": inserted, "docId": payload.docId}

@app.post("/ingest/url", dependencies=[Depends(_require_key)])
def ingest_url(payload: IngestURL):
    try:
        r = requests.get(payload.url, timeout=30, headers={"User-Agent": "SotsiaalAI-RAG/1.0"})
        r.raise_for_status()
    except Exception as e:
        raise HTTPException(422, f"Fetch failed: {e}")

    html = r.text
    text = _extract_text_from_html(html)

    # save html dump
    d = _doc_dir(payload.docId)
    html_path = d / "source.html"
    html_path.write_text(html, encoding="utf-8")

    inserted = _ingest_text(
        payload.docId,
        text,
        meta_common={
            "title": payload.title,
            "description": payload.description,
            "source_type": "url",
            "source_url": payload.url,
            "source_path": str(html_path),
            "mimeType": "text/html",
            "audience": normalize_audience(payload.audience),
        },
    )

    reg_entry = {
        "type": "URL",
        "url": payload.url,
        "lastIngested": now_iso(),
        "path": str(html_path),
        "title": payload.title,
        "description": payload.description,
        "audience": normalize_audience(payload.audience),
    }
    _register(payload.docId, reg_entry)

    return {"ok": True, "inserted": inserted, "docId": payload.docId}

@app.get("/documents", dependencies=[Depends(_require_key)])
def documents():
    reg = _load_registry()
    out = []
    # sort updatedAt desc (kui olemas), muidu doc_id järgi
    def _key(item):
        _meta = item[1]
        return (_meta.get("updatedAt") or _meta.get("createdAt") or "", item[0])
    for doc_id, meta in sorted(reg.items(), key=_key, reverse=True):
        try:
            got = collection.get(where={"doc_id": doc_id}, include=["metadatas"], limit=100000)
            ids = got.get("ids", []) or []
            count = len(ids)
        except Exception:
            count = 0
        out.append({
            "id": doc_id,            # UI ootab 'id'
            "docId": doc_id,
            "status": "COMPLETED",   # ← vaikimisi valmis (teenus ei halda töövoo staatusi)
            "chunks": count,
            "title": meta.get("title"),
            "description": meta.get("description"),
            "type": meta.get("type") or "FILE",
            "fileName": meta.get("fileName"),
            "sourceUrl": meta.get("url"),
            "mimeType": meta.get("mimeType"),
            "audience": meta.get("audience"),
            "createdAt": meta.get("createdAt"),
            "updatedAt": meta.get("updatedAt"),
            "lastIngested": meta.get("lastIngested"),
            **{k: v for k, v in meta.items() if k not in {
                "title","description","type","fileName","url","mimeType",
                "audience","createdAt","updatedAt","lastIngested"
            }},
        })
    return out

@app.post("/documents/{doc_id}/reindex", dependencies=[Depends(_require_key)])
def reindex(doc_id: str):
    reg = _load_registry()
    entry = reg.get(doc_id)
    if not entry:
        raise HTTPException(404, "Document not in registry")

    # delete old vectors for this doc
    try:
        collection.delete(where={"doc_id": doc_id})
    except Exception:
        pass

    # re-ingest from stored source
    if entry.get("type") == "FILE":
        p = Path(entry["path"])
        raw = p.read_bytes()
        mime = entry.get("mimeType") or _detect_mime(p.name, raw, None)
        if mime == "application/pdf":
            text = _extract_text_from_pdf(raw)
        elif mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            text = _extract_text_from_docx(raw)
        elif mime == "text/html":
            text = _extract_text_from_html(raw.decode("utf-8", errors="ignore"))
        else:
            text = raw.decode("utf-8", errors="ignore")

        inserted = _ingest_text(doc_id, text, meta_common={
            "title": entry.get("title"),
            "description": entry.get("description"),
            "source_type": "file",
            "source_path": entry.get("path"),
            "mimeType": mime,
            "audience": normalize_audience(entry.get("audience")),
        })
        entry["lastIngested"] = now_iso()
        _register(doc_id, entry)
        return {"ok": True, "inserted": inserted, "doc": entry}

    if entry.get("type") == "URL":
        html_path = Path(entry["path"])
        html = html_path.read_text(encoding="utf-8")
        text = _extract_text_from_html(html)
        inserted = _ingest_text(doc_id, text, meta_common={
            "title": entry.get("title"),
            "description": entry.get("description"),
            "source_type": "url",
            "source_url": entry.get("url"),
            "source_path": entry.get("path"),
            "mimeType": "text/html",
            "audience": normalize_audience(entry.get("audience")),
        })
        entry["lastIngested"] = now_iso()
        _register(doc_id, entry)
        return {"ok": True, "inserted": inserted, "doc": entry}

    raise HTTPException(400, "Unsupported registry entry type")

@app.delete("/documents/{doc_id}", dependencies=[Depends(_require_key)])
def delete_doc(doc_id: str):
    # delete vectors
    try:
        collection.delete(where={"doc_id": doc_id})
    except Exception:
        pass

    # delete registry entry and files
    reg = _load_registry()
    had = doc_id in reg
    if had:
        reg.pop(doc_id, None)
        _save_registry(reg)

    # remove files directory
    try:
        sub = _doc_dir_hashed(doc_id)
        if sub.exists():
            for p in sub.glob("*"):
                try:
                    p.unlink(missing_ok=True)
                except Exception:
                    pass
            sub.rmdir()
    except Exception:
        pass

    return {"ok": True, "deleted": doc_id, "hadEntry": had}

@app.post("/search", dependencies=[Depends(_require_key)])
def search(payload: SearchIn):
    # Build Chroma metadata filter
    md_where: Dict[str, object] = {}

    # Legacy single-doc filter
    if payload.filterDocId:
        md_where["doc_id"] = payload.filterDocId

    # New: accept {"audience": "..."} or {"audience": {"$in": [...]}}
    if isinstance(payload.where, dict):
        aud = payload.where.get("audience")
        if isinstance(aud, dict) and "$in" in aud:
            md_where["audience"] = {"$in": [normalize_audience(a) for a in list(aud["$in"])]}
        elif isinstance(aud, str):
            md_where["audience"] = normalize_audience(aud)

        # allow direct doc_id in where
        if "doc_id" in payload.where and isinstance(payload.where["doc_id"], str):
            md_where["doc_id"] = payload.where["doc_id"]

    # Embed the query with OpenAI and use query_embeddings
    q_embeds = _embed_batch([payload.query])
    if not q_embeds:
        return {"results": []}
    q_emb = q_embeds[0]

    try:
        res = collection.query(
            query_embeddings=[q_emb],
            n_results=max(1, min(50, payload.top_k or 5)),
            where=md_where or None,
            include=["documents", "metadatas"],  # 'ids' ei ole lubatud include'is
        )
    except Exception:
        return {"results": []}

    docs = (res.get("documents") or [[]])[0] if res.get("documents") else []
    metas = (res.get("metadatas") or [[]])[0] if res.get("metadatas") else []
    ids = (res.get("ids") or [[]])[0] if res.get("ids") else []

    out = []
    for i, ch in enumerate(docs):
        md = metas[i] if i < len(metas) else {}
        out.append({
            "id": ids[i] if i < len(ids) else None,
            "doc_id": md.get("doc_id"),
            "title": md.get("title"),
            "description": md.get("description"),
            "audience": md.get("audience"),
            "chunk": ch,
            # flattened source mirrors
            "url": md.get("source_url"),
            "filePath": md.get("source_path"),
            "source_type": md.get("source_type"),
            "page": md.get("page"),
        })
    return {"results": out}
