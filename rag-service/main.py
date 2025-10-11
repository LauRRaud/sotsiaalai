from __future__ import annotations

import base64
import json
import os
import re
import hashlib
from io import BytesIO
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

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

# OpenAI embeddings
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

# Chunking from ENV (defaults 1200 / 200)
CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "1200"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "200"))
SINGLE_CHUNK_CHAR_LIMIT = int(
    os.getenv("RAG_SINGLE_CHUNK_CHAR_LIMIT", str(max(4000, CHUNK_SIZE * 2)))
)

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

app = FastAPI(title="SotsiaalAI RAG Service (OpenAI embeddings)", version="3.5")

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

def normalize_authors(value) -> List[str]:
    if not value:
        return []
    if isinstance(value, str):
        v = value.strip()
        return [v] if v else []
    authors: List[str] = []
    if isinstance(value, (list, tuple, set)):
        for item in value:
            if not item:
                continue
            if isinstance(item, str):
                cleaned = item.strip()
                if cleaned:
                    authors.append(cleaned)
    return authors

def normalize_issue_id(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    v = value.strip()
    return v or None

def normalize_issue_label(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    v = value.strip()
    return v or None

def normalize_article_id(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    v = value.strip()
    return v or None

def normalize_section(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    v = value.strip()
    return v or None

def normalize_year(value) -> Optional[int]:
    if value is None:
        return None
    try:
        year = int(value)
        return year if 1800 <= year <= 2100 else None
    except (TypeError, ValueError):
        return None

def normalize_pages(value) -> List[int]:
    if value is None:
        return []
    out: List[int] = []
    if isinstance(value, str):
        parts = re.split(r"[,\s;]+", value)
        for part in parts:
            if not part:
                continue
            try:
                out.append(int(part))
            except ValueError:
                continue
        return out
    if isinstance(value, (list, tuple, set)):
        for item in value:
            try:
                num = int(item)
                out.append(num)
            except (TypeError, ValueError):
                continue
    return out


# --- Helpers for short references -------------------------------------------
def _collapse_pages(pages):
    """[3,4,28,30,33] -> '3–4, 28, 30, 33'"""
    s = sorted({p for p in pages if isinstance(p, int)})
    if not s:
        return ""
    out = []
    start = prev = None
    for p in s:
        if start is None:
            start = prev = p
            continue
        if p == prev + 1:
            prev = p
            continue
        out.append(f"{start}" if start == prev else f"{start}–{prev}")
        start = prev = p
    out.append(f"{start}" if start == prev else f"{start}–{prev}")
    return ", ".join(out)


def _first_author(authors):
    if not authors:
        return None
    if isinstance(authors, list):
        return authors[0] if authors else None
    return str(authors).strip() or None


def _short_issue(meta):
    issue = (meta.get("issue") or meta.get("issue_id") or "").strip()
    if issue:
        return issue
    year = meta.get("year")
    if isinstance(year, int):
        return str(year)[-2:]
    try:
        yy = int(str(year))
        return str(yy)[-2:]
    except Exception:
        return ""


def _make_short_ref(meta, pages_compact):
    author = _first_author(meta.get("authors"))
    title = (meta.get("title") or "").strip()
    year = meta.get("year")
    issue = _short_issue(meta)
    issue_str = f"Sotsiaaltöö {issue}" if issue else "Sotsiaaltöö"
    pages_str = f"lk {pages_compact}" if pages_compact else ""

    if author and year and title and pages_compact:
        return f"{author} ({year}) — {title}. {issue_str}, {pages_str}."
    if author and title:
        return f"{author} — {title} ({issue_str})."
    if author and (issue or pages_compact):
        parts = [author]
        if issue:
            parts.append(issue_str)
        if pages_str:
            parts.append(pages_str)
        return ", ".join(parts) + "."
    if title and (issue or pages_compact):
        parts = [title]
        if issue:
            parts.append(issue_str)
        if pages_str:
            parts.append(pages_str)
        return ", ".join(parts) + "."
    return issue_str + (f", {pages_str}" if pages_str else "") + "."

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

# --- PDF / DOCX / HTML extractors ---
def _extract_text_from_pdf(buff: bytes) -> List[Tuple[int, str]]:
    """Tagasta list (page_no, text)."""
    from pypdf import PdfReader
    try:
        reader = PdfReader(BytesIO(buff))
        out: List[Tuple[int, str]] = []
        for i, p in enumerate(reader.pages, start=1):
            t = p.extract_text() or ""
            out.append((i, t))
        return out
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

# --- Chunking ---
def _split_chunks(text: str, max_chars: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Lõiguja, mis püüab hoida lausepiire:
    - lõikame kuni max_chars
    - kui võimalik, nihutame lõpu lähima lauselõpu ('. ', '! ', '? ') juurde
    - katvus (overlap) tagatakse stardisammu vähendamisega
    """
    text = _clean_text(text)
    if not text:
        return []

    chunks: List[str] = []
    n = len(text)
    step = max(1, max_chars - max(0, overlap))
    start = 0

    while start < n:
        end = min(n, start + max_chars)
        window = text[start:end]
        cut = len(window)

        # proovi leida lause lõpp akna teises pooles (et mitte liiga varakult lõigata)
        candidates = [
            window.rfind(". "),
            window.rfind("! "),
            window.rfind("? "),
            window.rfind("\n\n"),
        ]
        best = max(candidates)
        if best != -1 and best > len(window) * 0.5:
            cut = best + 1  # hoia punkt sees

        chunk = _clean_text(window[:cut])
        if chunk:
            chunks.append(chunk)

        start += step

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
    authors: Optional[List[str]] = None  # NEW
    issueId: Optional[str] = None  # NEW
    issueLabel: Optional[str] = None  # NEW
    year: Optional[int] = None  # NEW
    articleId: Optional[str] = None  # NEW
    section: Optional[str] = None  # NEW
    pages: Optional[List[int]] = None  # NEW
    pageRange: Optional[str] = None  # NEW

class IngestURL(BaseModel):
    docId: str
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None  # NEW
    authors: Optional[List[str]] = None  # NEW
    issueId: Optional[str] = None  # NEW
    issueLabel: Optional[str] = None  # NEW
    year: Optional[int] = None  # NEW
    articleId: Optional[str] = None  # NEW
    section: Optional[str] = None  # NEW
    pages: Optional[List[int]] = None  # NEW
    pageRange: Optional[str] = None  # NEW

class SearchIn(BaseModel):
    query: str
    top_k: int = 5
    filterDocId: Optional[str] = None
    where: Optional[dict] = None  # NEW

# --------------------
# Core ingest
# --------------------
def _split_chunks_with_pages(pages: List[Tuple[Optional[int], str]]) -> Tuple[List[str], List[Optional[int]]]:
    docs: List[str] = []
    pnums: List[Optional[int]] = []
    for page_no, txt in pages:
        for ch in _split_chunks(txt):
            docs.append(ch)
            pnums.append(page_no)
    return docs, pnums

def _ingest_text(doc_id: str, text_or_pages, meta_common: Dict) -> int:
    """
    text_or_pages:
      - plain string (HTML/TXT/DOCX)
      - List[(page_no:int|None, text:str)] (PDF)
    Lisame TITLE/DESCRIPTION prefiksi igale chunkile enne embeddingut.
    """
    title = (meta_common.get("title") or "").strip()
    description = (meta_common.get("description") or "").strip()
    authors = normalize_authors(meta_common.get("authors"))
    issue_id = normalize_issue_id(meta_common.get("issue_id") or meta_common.get("issueId"))
    issue_label = normalize_issue_label(meta_common.get("issue_label") or meta_common.get("issueLabel"))
    article_id = normalize_article_id(meta_common.get("article_id") or meta_common.get("articleId"))
    section = normalize_section(meta_common.get("section"))
    year = normalize_year(meta_common.get("year"))
    page_range = (meta_common.get("pageRange") or meta_common.get("page_range") or "").strip() or None
    pages_list = normalize_pages(meta_common.get("pages"))

    prefix_lines: List[str] = []
    if title:
        prefix_lines.append(f"[TITLE] {title}")
    if description:
        prefix_lines.append(f"[DESC] {description}")
    if authors:
        prefix_lines.append(f"[AUTHORS] {', '.join(authors)}")
    if issue_label:
        prefix_lines.append(f"[ISSUE] {issue_label}")
    elif issue_id:
        prefix_lines.append(f"[ISSUE] {issue_id}")
    if section:
        prefix_lines.append(f"[SECTION] {section}")
    if year:
        prefix_lines.append(f"[YEAR] {year}")
    if page_range:
        prefix_lines.append(f"[PAGES] {page_range}")
    prefix = ("\n".join(prefix_lines) + "\n") if prefix_lines else ""

    if isinstance(text_or_pages, list) and text_or_pages and isinstance(text_or_pages[0], tuple):
        full_text = _clean_text(" ".join(t or "" for _, t in text_or_pages))
        if len(full_text) <= SINGLE_CHUNK_CHAR_LIMIT:
            chunks = [full_text]
            first_page = next((p for p, _ in text_or_pages if p is not None), None)
            page_nums = [first_page]
        else:
            chunks, page_nums = _split_chunks_with_pages(text_or_pages)  # PDF
    else:
        text = _clean_text(str(text_or_pages or ""))
        if len(text) <= SINGLE_CHUNK_CHAR_LIMIT:
            chunks = [text]
            page_nums = [None]
        else:
            chunks = _split_chunks(text)                                 # muu
            page_nums = [None] * len(chunks)

    if not chunks:
        return 0

    # lisa prefix nii embeddingu kui salvestatud teksti ette
    final_texts = [(prefix + ch).strip() if prefix else ch for ch in chunks]

    # Generate unique ids
    base = hashlib.sha1(f"{doc_id}-{now_iso()}".encode()).hexdigest()[:10]
    ids = [f"{doc_id}:{base}:{i}" for i in range(len(final_texts))]

    metadatas = []
    for i, _ in enumerate(final_texts):
        m = {
            "doc_id": doc_id,
            "title": title or None,
            "description": description or None,
            "authors": authors or None,
            "issue_id": issue_id or None,
            "issue_label": issue_label or None,
            "article_id": article_id or None,
            "section": section or None,
            "year": year,
            "pages": pages_list if pages_list else None,
            "pageRange": page_range,
            "source_type": meta_common.get("source_type"),
            "source_path": meta_common.get("source_path"),
            "source_url": meta_common.get("source_url"),
            "mimeType": meta_common.get("mimeType"),
            "audience": normalize_audience(meta_common.get("audience")),
            "page": page_nums[i],
            "createdAt": now_iso(),
        }
        metadatas.append({k: v for k, v in m.items() if v is not None})

    embeddings = _embed_batch(final_texts)
    collection.upsert(documents=final_texts, metadatas=metadatas, ids=ids, embeddings=embeddings)
    return len(final_texts)

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
        "status": "ok",
        "vectors": n,
        "documents": len(reg),
        "embed_model": EMBED_MODEL,
        "collection": COLLECTION_NAME,
        "chunk_size": CHUNK_SIZE,
        "chunk_overlap": CHUNK_OVERLAP,
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
        text_or_pages = _extract_text_from_pdf(raw)  # List[(page_no, text)]
    elif mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        text_or_pages = _extract_text_from_docx(raw)
    elif mime == "text/html":
        text_or_pages = _extract_text_from_html(raw.decode("utf-8", errors="ignore"))
    else:
        # text/plain, text/markdown, application/msword (best effort), etc.
        text_or_pages = raw.decode("utf-8", errors="ignore")

    inserted = _ingest_text(
        payload.docId,
        text_or_pages,
        meta_common={
            "title": payload.title,
            "description": payload.description,
            "authors": payload.authors,
            "issue_id": payload.issueId,
            "issue_label": payload.issueLabel,
            "year": payload.year,
            "article_id": payload.articleId,
            "section": payload.section,
            "pages": payload.pages,
            "pageRange": payload.pageRange,
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
        "authors": normalize_authors(payload.authors),
        "issueId": normalize_issue_id(payload.issueId),
        "issueLabel": normalize_issue_label(payload.issueLabel),
        "year": normalize_year(payload.year),
        "articleId": normalize_article_id(payload.articleId),
        "section": normalize_section(payload.section),
        "pages": normalize_pages(payload.pages),
        "pageRange": (payload.pageRange or "").strip() or None,
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
            "authors": payload.authors,
            "issue_id": payload.issueId,
            "issue_label": payload.issueLabel,
            "year": payload.year,
            "article_id": payload.articleId,
            "section": payload.section,
            "pages": payload.pages,
            "pageRange": payload.pageRange,
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
        "authors": normalize_authors(payload.authors),
        "issueId": normalize_issue_id(payload.issueId),
        "issueLabel": normalize_issue_label(payload.issueLabel),
        "year": normalize_year(payload.year),
        "articleId": normalize_article_id(payload.articleId),
        "section": normalize_section(payload.section),
        "pages": normalize_pages(payload.pages),
        "pageRange": (payload.pageRange or "").strip() or None,
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
            "status": "COMPLETED",
            "chunks": count,
            "title": meta.get("title"),
            "description": meta.get("description"),
            "type": meta.get("type") or "FILE",
            "fileName": meta.get("fileName"),
            "sourceUrl": meta.get("url"),
            "mimeType": meta.get("mimeType"),
            "audience": meta.get("audience"),
            "authors": meta.get("authors"),
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
            text_or_pages = _extract_text_from_pdf(raw)
        elif mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            text_or_pages = _extract_text_from_docx(raw)
        elif mime == "text/html":
            text_or_pages = _extract_text_from_html(raw.decode("utf-8", errors="ignore"))
        else:
            text_or_pages = raw.decode("utf-8", errors="ignore")

        inserted = _ingest_text(doc_id, text_or_pages, meta_common={
            "title": entry.get("title"),
            "description": entry.get("description"),
            "authors": entry.get("authors"),
            "issue_id": entry.get("issueId") or entry.get("issue_id"),
            "issue_label": entry.get("issueLabel") or entry.get("issue_label"),
            "year": entry.get("year"),
            "article_id": entry.get("articleId") or entry.get("article_id"),
            "section": entry.get("section"),
            "pages": entry.get("pages"),
            "pageRange": entry.get("pageRange"),
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
            "authors": entry.get("authors"),
            "issue_id": entry.get("issueId") or entry.get("issue_id"),
            "issue_label": entry.get("issueLabel") or entry.get("issue_label"),
            "year": entry.get("year"),
            "article_id": entry.get("articleId") or entry.get("article_id"),
            "section": entry.get("section"),
            "pages": entry.get("pages"),
            "pageRange": entry.get("pageRange"),
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
    md_where: Dict[str, object] = {}

    if payload.filterDocId:
        md_where["doc_id"] = payload.filterDocId

    if isinstance(payload.where, dict):
        aud = payload.where.get("audience")
        if isinstance(aud, dict) and "$in" in aud:
            md_where["audience"] = {"$in": [normalize_audience(a) for a in list(aud["$in"])]}
        elif isinstance(aud, str):
            md_where["audience"] = normalize_audience(aud)

        if "doc_id" in payload.where and isinstance(payload.where["doc_id"], str):
            md_where["doc_id"] = payload.where["doc_id"]

        if "authors" in payload.where:
            md_where["authors"] = payload.where["authors"]

    q_embeds = _embed_batch([payload.query])
    if not q_embeds:
        return {"results": [], "groups": []}
    q_emb = q_embeds[0]

    try:
        res = collection.query(
            query_embeddings=[q_emb],
            n_results=max(1, min(50, payload.top_k or 5)),
            where=md_where or None,
            include=["documents", "metadatas", "ids"],
        )
    except Exception:
        return {"results": [], "groups": []}

    docs = (res.get("documents") or [[]])[0] if res.get("documents") else []
    metas = (res.get("metadatas") or [[]])[0] if res.get("metadatas") else []
    ids = (res.get("ids") or [[]])[0] if res.get("ids") else []

    flat = []
    for i, ch in enumerate(docs):
        md = metas[i] if i < len(metas) else {}
        source_path = md.get("source_path")
        file_name = None
        if source_path:
            try:
                file_name = Path(source_path).name
            except Exception:
                file_name = source_path
        issue_val = (
            md.get("issue_label")
            or md.get("issueLabel")
            or md.get("issue_id")
            or md.get("issueId")
            or None
        )
        flat.append({
            "id": ids[i] if i < len(ids) else None,
            "doc_id": md.get("doc_id"),
            "title": md.get("title"),
            "description": md.get("description"),
            "audience": md.get("audience"),
            "authors": md.get("authors"),
            "issue": issue_val,
            "issueLabel": md.get("issue_label") or md.get("issueLabel"),
            "issueId": md.get("issue_id") or md.get("issueId"),
            "year": md.get("year"),
            "articleId": md.get("article_id") or md.get("articleId"),
            "section": md.get("section"),
            "pages": md.get("pages"),
            "pageRange": md.get("pageRange"),
            "chunk": ch,
            "url": md.get("source_url"),
            "fileName": file_name,
            "source_type": md.get("source_type"),
            "page": md.get("page"),
        })

    groups_map: Dict[Tuple[str, str, str], Dict] = {}
    for r in flat:
        article_id = r.get("articleId") or ""
        doc_id = r.get("doc_id") or ""
        title_key = (r.get("title") or "").strip()
        key = (article_id, doc_id, title_key)
        g = groups_map.get(key)
        if not g:
            g = {
                "doc_id": doc_id or None,
                "title": r.get("title"),
                "authors": r.get("authors"),
                "year": r.get("year"),
                "issue": r.get("issue"),
                "audience": r.get("audience"),
                "url": r.get("url"),
                "source_type": r.get("source_type"),
                "fileName": r.get("fileName"),
                "section": r.get("section"),
                "articleId": r.get("articleId"),
                "pages_all": [],
                "page_ranges": [],
                "items": [],
            }
            groups_map[key] = g
        if isinstance(r.get("page"), int):
            g["pages_all"].append(r["page"])
        pages_meta = r.get("pages")
        if isinstance(pages_meta, list):
            for p in pages_meta:
                if isinstance(p, int):
                    g["pages_all"].append(p)
        if isinstance(r.get("pageRange"), str) and r["pageRange"]:
            g["page_ranges"].append(r["pageRange"])
        g["items"].append(r)

    groups = []
    for g in groups_map.values():
        pages_compact = _collapse_pages(g["pages_all"])
        if not pages_compact and g["page_ranges"]:
            pages_compact = ", ".join(sorted(set(g["page_ranges"])))
        meta_for_ref = {
            "authors": g["authors"],
            "title": g["title"],
            "year": g["year"],
            "issue": g["issue"],
            "issue_id": g["issue"],
        }
        short_ref = _make_short_ref(meta_for_ref, pages_compact)
        groups.append({
            "doc_id": g["doc_id"],
            "title": g["title"],
            "authors": g["authors"],
            "year": g["year"],
            "issue": g["issue"],
            "audience": g["audience"],
            "url": g["url"],
            "source_type": g["source_type"],
            "fileName": g["fileName"],
            "section": g["section"],
            "articleId": g["articleId"],
            "pages": pages_compact,
            "short_ref": short_ref,
            "count": len(g["items"]),
            "items": g["items"],
        })

    groups.sort(key=lambda x: (-x["count"], x["title"] or ""))

    return {"results": flat, "groups": groups}
