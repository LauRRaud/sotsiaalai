from __future__ import annotations

import base64
import uuid
import copy
import json
import os
import re
import hashlib
from io import BytesIO
import logging
import mimetypes
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Callable, Dict, List, Optional, Tuple, TypeVar

# --- optional libmagic (fall back if missing) ---
try:
    import magic  # type: ignore
    _MAGIC_OK = True
except Exception:
    magic = None  # type: ignore
    _MAGIC_OK = False

import requests
from bs4 import BeautifulSoup
from fastapi import Depends, FastAPI, Header, HTTPException, Request, UploadFile, File, Form, Path as FastPath, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, field_validator

import chromadb
from chromadb.config import Settings

# OpenAI embeddings
from openai import OpenAI

# PDF utils
from pypdf import PdfReader, PdfWriter

# --------------------
# ENV & GLOBALS
# --------------------
RAG_SERVICE_API_KEY = os.getenv("RAG_SERVICE_API_KEY", "")
STORAGE_DIR = Path(os.getenv("RAG_STORAGE_DIR", "./storage")).resolve()
REGISTRY_PATH = STORAGE_DIR / "registry.json"
COLLECTION_NAME = os.getenv("RAG_COLLECTION", "sotsiaalai")
REGISTRY_LOCK = Lock()
T = TypeVar("T")

# OpenAI embeddings — hoia kooskõlas olemasoleva kollektsiooniga
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBED_MODEL = os.getenv("RAG_EMBED_MODEL", os.getenv("EMBEDDING_MODEL", "text-embedding-3-large"))

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
logger = logging.getLogger("rag-service")

app = FastAPI(title="SotsiaalAI RAG Service (OpenAI embeddings)", version="4.0-clean")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def handle_request_validation_error(request: Request, exc: RequestValidationError):
    body_preview = ""
    if isinstance(exc.body, (bytes, bytearray)):
        try:
            body_preview = base64.b64encode(exc.body[:64]).decode("ascii")
        except Exception:
            body_preview = "<binary>"
    elif isinstance(exc.body, str):
        body_preview = exc.body[:64]

    try:
        logger.warning(
            "Validation error on %s: %s (body preview: %s)",
            request.url.path,
            exc.errors(),
            body_preview,
        )
    except Exception:
        logger.warning("Validation error on %s (body preview: %s)", request.url.path, body_preview)

    return JSONResponse(
        status_code=422,
        content={
            "ok": False,
            "detail": "Invalid payload. Upload endpoint expects JSON body with base64 encoded 'data'.",
            "code": "INVALID_PAYLOAD",
        },
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
        s = value.strip()
        if not s:
            return []
        try:
            arr = json.loads(s)
            if isinstance(arr, list):
                return [str(x).strip() for x in arr if str(x).strip()][:12]
        except Exception:
            pass
        return [x.strip() for x in re.split(r"[,;\n]+", s) if x.strip()][:12]
    authors: List[str] = []
    if isinstance(value, (list, tuple, set)):
        for item in value:
            if not item:
                continue
            if isinstance(item, str):
                cleaned = item.strip()
                if cleaned:
                    authors.append(cleaned)
    return authors[:12]

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
    if value is None or value == "":
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
        return out[:50]
    if isinstance(value, (list, tuple, set)):
        for item in value:
            try:
                num = int(item)
                out.append(num)
            except (TypeError, ValueError):
                continue
    return out[:50]

def _stringify_meta(value) -> Optional[str]:
    """
    Chroma metadata does not accept arrays; flatten lists/sets to comma separated strings.
    Keep None as None, other scalars unchanged.
    """
    if value is None:
        return None
    if isinstance(value, (list, tuple, set)):
        parts = []
        for item in value:
            if item is None:
                continue
            s = str(item).strip()
            if s:
                parts.append(s)
        return ", ".join(parts) if parts else None
    return value

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
    """Return issue id/label/year for display (no hard-coded journal)."""
    issue = (meta.get("issue") or meta.get("issue_id") or "").strip()
    if issue:
        return issue
    year = meta.get("year")
    if isinstance(year, int):
        return str(year)
    try:
        yy = int(str(year))
        return str(yy)
    except Exception:
        return ""

def _make_short_ref(meta, pages_compact):
    author = _first_author(meta.get("authors"))
    title = (meta.get("title") or "").strip()
    year = meta.get("year")
    issue = _short_issue(meta)
    journal = (meta.get("journal_title") or meta.get("journalTitle") or "").strip()
    issue_str = " ".join([p for p in [journal, issue] if p]).strip()
    pages_str = f"lk {pages_compact}" if pages_compact else ""
    # Compose
    parts = []
    if author and year and title:
        parts.append(f"{author} ({year}) — {title}")
    elif author and title:
        parts.append(f"{author} — {title}")
    elif title:
        parts.append(title)
    elif author:
        parts.append(author)
    if issue_str:
        parts.append(issue_str)
    if pages_str:
        parts.append(pages_str)
    return (". ".join(parts).strip() + ".") if parts else ""

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _read_registry_file() -> Dict[str, Dict]:
    if REGISTRY_PATH.exists():
        try:
            with REGISTRY_PATH.open("r", encoding="utf-8") as fh:
                return json.load(fh)
        except Exception:
            pass
    return {}


def _save_registry(data: Dict[str, Dict]) -> None:
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = REGISTRY_PATH.with_suffix(".tmp")
    tmp_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp_path, REGISTRY_PATH)


def _load_registry() -> Dict[str, Dict]:
    with REGISTRY_LOCK:
        return copy.deepcopy(_read_registry_file())


def _update_registry(mutator: Callable[[Dict[str, Dict]], T]) -> T:
    with REGISTRY_LOCK:
        data = _read_registry_file()
        result = mutator(data)
        _save_registry(data)
        return result

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
    return mimetypes.guess_type(name)[0] or "application/octet-stream"

def _clean_text(s: str) -> str:
    """
    Normaliseeri tekst:
    - CRLF/CR -> LF
    - Eemalda hüüdega poolitused: 'sotsiaal-\\ntöö' -> 'sotsiaaltöö' (väike+väike)
    - Jäta hüüdega sidekriips alles muudel juhtudel: 'COVID-\\n19' -> 'COVID-19'
    - Ülejäänud reavahetused -> tühik; mitmik-tühikud -> üks
    """
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    # 1) poolitus: väiketäht + '-\\n' + väiketäht  => liida kokku ilma kriipsuta
    s = re.sub(r"([a-zäöüõ])-\s*\n\s*([a-zäöüõ])", r"\1\2", s, flags=re.IGNORECASE)
    # 2) muu '-\\n' jääb sidekriipsuga (nt COVID-\\n19)
    s = re.sub(r"-\s*\n\s*", "-", s)
    # 3) ülejäänud reavahetused tühikuks
    s = re.sub(r"\s*\n\s*", " ", s)
    # 4) mitmik-tühikud üheks
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()

# --- PDF / DOCX / HTML extractors ---
def _extract_text_from_pdf(buff: bytes) -> List[Tuple[int, str]]:
    """
    Proovi järjest:
      1) PyMuPDF – kõige töökindlam uute ajakirja PDF-idega
      2) pdfminer.six – hea fallback keeruliste fontidega
      3) pypdf – viimane varuvariant
    Tagasta: [(page_no, text), ...], page_no on 1-based.
    """
    # --- 1) PyMuPDF (fitz) ---
    try:
        import fitz  # type: ignore

        doc = fitz.open(stream=buff, filetype="pdf")
        out_fitx: List[Tuple[int, str]] = []
        for i, page in enumerate(doc, start=1):
            text = page.get_text("text") or ""
            out_fitx.append((i, _clean_text(text)))
        doc.close()
        if any(text for _, text in out_fitx):
            return out_fitx
    except Exception:
        pass

    # --- 2) pdfminer.six ---
    try:
        from io import StringIO
        from pdfminer.high_level import extract_text_to_fp  # type: ignore
        from pdfminer.layout import LAParams  # type: ignore
        from pypdf import PdfReader as _PdfReader  # type: ignore

        reader = _PdfReader(BytesIO(buff))
        out_pdfminer: List[Tuple[int, str]] = []
        for page_index in range(len(reader.pages)):
            sio = StringIO()
            extract_text_to_fp(
                BytesIO(buff),
                sio,
                laparams=LAParams(),
                page_numbers=[page_index],
                output_type="text",
                codec=None,
            )
            txt = sio.getvalue() or ""
            out_pdfminer.append((page_index + 1, _clean_text(txt)))
        if any(text for _, text in out_pdfminer):
            return out_pdfminer
    except Exception:
        pass

    # --- 3) pypdf (praegune fallback) ---
    try:
        from pypdf import PdfReader as _FallbackReader  # type: ignore

        reader = _FallbackReader(BytesIO(buff))
        out: List[Tuple[int, str]] = []
        for i, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            out.append((i, _clean_text(text)))
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
        candidates = [window.rfind(". "), window.rfind("! "), window.rfind("? "), window.rfind("\n\n")]
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

# --- OpenAI embedding helpers (batched) ---
def _embed_batch(texts: List[str], batch_size: int = 64) -> List[List[float]]:
    if not texts:
        return []
    out: List[List[float]] = []
    for i in range(0, len(texts), max(1, batch_size)):
        chunk = texts[i:i + batch_size]
        resp = oa.embeddings.create(model=EMBED_MODEL, input=chunk)
        out.extend([d.embedding for d in resp.data])
    return out

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
    audience: Optional[str] = None
    authors: Optional[List[str]] = None
    issueId: Optional[str] = None
    issueLabel: Optional[str] = None
    year: Optional[int] = None
    articleId: Optional[str] = None
    section: Optional[str] = None
    pages: Optional[List[int]] = None
    pageRange: Optional[str] = None
    journalTitle: Optional[str] = None  # UUS

class IngestURL(BaseModel):
    docId: str
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None
    authors: Optional[List[str]] = None
    issueId: Optional[str] = None
    issueLabel: Optional[str] = None
    year: Optional[int] = None
    articleId: Optional[str] = None
    section: Optional[str] = None
    pages: Optional[List[int]] = None
    pageRange: Optional[str] = None
    journalTitle: Optional[str] = None  # UUS

class IngestArticle(BaseModel):
    title: str
    pageRange: Optional[str] = None
    offset: Optional[int] = None
    startPage: Optional[int] = None
    endPage: Optional[int] = None
    authors: Optional[List[str]] = None
    section: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None
    journalTitle: Optional[str] = None
    issueLabel: Optional[str] = None
    articleId: Optional[str] = None
    audience: Optional[str] = None

class IngestArticlesIn(BaseModel):
    docId: Optional[str] = None
    articles: List[IngestArticle]

class DocumentMetaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None
    authors: Optional[List[str]] = None
    journalTitle: Optional[str] = None
    issueTitle: Optional[str] = None  # backwards compat alias
    issueLabel: Optional[str] = None
    issueId: Optional[str] = None
    year: Optional[int] = None
    section: Optional[str] = None
    pageRange: Optional[str] = None
    articleId: Optional[str] = None
    sourceUrl: Optional[str] = None
    fileName: Optional[str] = None
    mimeType: Optional[str] = None

ALLOWED_INCLUDE = {"documents", "embeddings", "metadatas", "distances", "uris", "data"}

def clean_include(include):
    if not isinstance(include, list):
        return []
    cleaned = []
    for item in include:
        s = str(item).strip()
        if not s or s == "ids":
            continue
        if s in ALLOWED_INCLUDE:
            cleaned.append(s)
    return cleaned

class SearchIn(BaseModel):
    query: str
    top_k: int = 5
    filterDocId: Optional[str] = None
    where: Optional[dict] = None
    include: Optional[List[str]] = None

    @field_validator("include")
    @classmethod
    def validate_include(cls, value):
        if not value:
            return []
        out = []
        for v in value:
            s = str(v).strip()
            if s and s != "ids" and s in ALLOWED_INCLUDE:
                out.append(s)
        return out

# --------------------
# Core ingest (shared)
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
    journal_title = (meta_common.get("journal_title") or meta_common.get("journalTitle") or "").strip() or None

    # PREFIKS – lisame chunk’i teksti ette (autor/pealkiri/jne saavad embeddingusse)
    prefix_lines: List[str] = []
    if title:         prefix_lines.append(f"[TITLE] {title}")
    if description:   prefix_lines.append(f"[DESC] {description}")
    if authors:       prefix_lines.append(f"[AUTHORS] {', '.join(authors)}")
    if journal_title: prefix_lines.append(f"[JOURNAL] {journal_title}")
    if issue_label:   prefix_lines.append(f"[ISSUE] {issue_label}")
    elif issue_id:    prefix_lines.append(f"[ISSUE] {issue_id}")
    if section:       prefix_lines.append(f"[SECTION] {section}")
    if year:          prefix_lines.append(f"[YEAR] {year}")
    if page_range:    prefix_lines.append(f"[PAGES] {page_range}")
    prefix = ("\n".join(prefix_lines) + "\n") if prefix_lines else ""

    # Teksti tükeldamine
    if isinstance(text_or_pages, list) and text_or_pages and isinstance(text_or_pages[0], tuple):
        full_text = _clean_text(" ".join(t or "" for _, t in text_or_pages))
        if len(full_text) <= SINGLE_CHUNK_CHAR_LIMIT:
            chunks = [full_text]
            first_page = next((p for p, _ in text_or_pages if p is not None), None)
            page_nums = [first_page]
        else:
            chunks, page_nums = _split_chunks_with_pages(text_or_pages)
    else:
        text = _clean_text(str(text_or_pages or ""))
        if len(text) <= SINGLE_CHUNK_CHAR_LIMIT:
            chunks = [text]
            page_nums = [None]
        else:
            chunks = _split_chunks(text)
            page_nums = [None] * len(chunks)

    if not chunks:
        return 0

    final_texts = [(prefix + ch).strip() if prefix else ch for ch in chunks]

    # STABIILNE ID: doc_id + jrk + 8-kohaline hash chunkist
    ids = []
    for i, txt in enumerate(final_texts):
        h = hashlib.sha1(txt.encode("utf-8")).hexdigest()[:8]
        ids.append(f"{doc_id}:{i}:{h}")

    metadatas = []
    for i, _ in enumerate(final_texts):
        m = {
            "doc_id": doc_id,
            "title": title or None,
            "description": description or None,
            "authors": _stringify_meta(authors),
            "issue_id": issue_id or None,
            "issue_label": issue_label or None,
            "article_id": article_id or None,
            "section": section or None,
            "year": year,
            "pageRange": page_range,
            "journal_title": journal_title,
            "journalTitle": journal_title,
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
    def mutator(registry: Dict[str, Dict]) -> Dict:
        existing = dict(registry.get(doc_id, {}))
        if not existing.get("createdAt"):
            existing["createdAt"] = now_iso()
        existing.update(entry)
        existing["docId"] = doc_id
        existing["updatedAt"] = now_iso()
        registry[doc_id] = existing
        return existing

    _update_registry(mutator)

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
        "allowed_mime": sorted(list(ALLOWED_MIME)),
        "storage_dir": str(STORAGE_DIR),
    }

# --- shared worker for file ingestion (used by JSON + multipart) ---
def _process_ingest_file(
    doc_id: str,
    file_name: str,
    raw: bytes,
    mime_declared: Optional[str],
    meta: Dict,
) -> Dict:
    size_mb = _bytes_mb(raw)
    if size_mb > MAX_MB:
        raise HTTPException(413, f"File too large ({size_mb:.1f}MB > {MAX_MB}MB)")

    mime = _detect_mime(file_name, raw, mime_declared)
    if ALLOWED_MIME and mime not in ALLOWED_MIME:
        raise HTTPException(415, f"MIME not allowed: {mime}")

    # save raw
    d = _doc_dir(doc_id)
    raw_path = d / file_name
    raw_path.write_bytes(raw)

    # extract text
    if mime == "application/pdf":
        text_or_pages = _extract_text_from_pdf(raw)
    elif mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        text_or_pages = _extract_text_from_docx(raw)
    elif mime == "text/html":
        text_or_pages = _extract_text_from_html(raw.decode("utf-8", errors="ignore"))
    else:
        text_or_pages = raw.decode("utf-8", errors="ignore")

    inserted = _ingest_text(
        doc_id,
        text_or_pages,
        meta_common={
            **meta,
            "source_type": "file",
            "source_path": str(raw_path),
            "mimeType": mime,
            "audience": normalize_audience(meta.get("audience")),
        },
    )

    reg_entry = {
        "type": "FILE",
        "fileName": file_name,
        "mimeType": mime,
        "lastIngested": now_iso(),
        "path": str(raw_path),
        "title": meta.get("title"),
        "description": meta.get("description"),
        "audience": normalize_audience(meta.get("audience")),
        "authors": normalize_authors(meta.get("authors")),
        "issueId": normalize_issue_id(meta.get("issue_id") or meta.get("issueId")),
        "issueLabel": normalize_issue_label(meta.get("issue_label") or meta.get("issueLabel")),
        "year": normalize_year(meta.get("year")),
        "articleId": normalize_article_id(meta.get("article_id") or meta.get("articleId")),
        "section": normalize_section(meta.get("section")),
        "pages": normalize_pages(meta.get("pages")),
        "pageRange": (meta.get("pageRange") or "").strip() or None,
        "journalTitle": (meta.get("journal_title") or meta.get("journalTitle") or None),
    }
    _register(doc_id, reg_entry)

    return {"ok": True, "inserted": inserted, "docId": doc_id}

# --- JSON ingest (existing) ---
class _IngestFileModel(IngestFile): pass

@app.post("/ingest/file", dependencies=[Depends(_require_key)])
def ingest_file(payload: _IngestFileModel):
    raw = base64.b64decode(payload.data)
    return _process_ingest_file(
        doc_id=payload.docId,
        file_name=payload.fileName,
        raw=raw,
        mime_declared=payload.mimeType,
        meta={
            "title": payload.title,
            "description": payload.description,
            "authors": payload.authors,
            "issueId": payload.issueId,
            "issue_id": payload.issueId,
            "issueLabel": payload.issueLabel,
            "issue_label": payload.issueLabel,
            "year": payload.year,
            "article_id": payload.articleId,
            "articleId": payload.articleId,
            "section": payload.section,
            "pages": payload.pages,
            "pageRange": payload.pageRange,
            "audience": payload.audience,
            "journal_title": payload.journalTitle,
            "journalTitle": payload.journalTitle,
        },
    )

# --- Multipart ingest (compat with older UI / direct browser forms) ---
@app.post("/upload", dependencies=[Depends(_require_key)])
async def upload(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    audience: Optional[str] = Form(None),
    authors: Optional[str] = Form(None),
    issueId: Optional[str] = Form(None),
    issueLabel: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    articleId: Optional[str] = Form(None),
    section: Optional[str] = Form(None),
    pages: Optional[str] = Form(None),
    pageRange: Optional[str] = Form(None),
    journalTitle: Optional[str] = Form(None),
    docId: Optional[str] = Form(None),
    fileName: Optional[str] = Form(None),
    mimeType: Optional[str] = Form(None),
):
    raw = await file.read()
    if not raw:
        raise HTTPException(400, "Empty file")

    _doc_id = (docId or str(uuid.uuid4())).strip()
    _name = (fileName or file.filename or "file").strip()
    if not _name:
        _name = "file"

    # kui aasta tuli stringina, proovi intiks
    year_val = normalize_year(year)

    return _process_ingest_file(
        doc_id=_doc_id,
        file_name=_name,
        raw=raw,
        mime_declared=(mimeType or file.content_type),
        meta={
            "title": (title or "").strip() or None,
            "description": (description or "").strip() or None,
            "authors": normalize_authors(authors),
            "issueId": issueId,
            "issue_id": issueId,
            "issueLabel": issueLabel,
            "issue_label": issueLabel,
            "year": year_val,
            "article_id": articleId,
            "articleId": articleId,
            "section": section,
            "pages": normalize_pages(pages),
            "pageRange": pageRange,
            "audience": audience,
            "journal_title": journalTitle,
            "journalTitle": journalTitle,
        },
    )

@app.post("/ingest/url", dependencies=[Depends(_require_key)])
def ingest_url(payload: IngestURL):
    try:
        r = requests.get(payload.url, timeout=30, headers={"User-Agent": "SotsiaalAI-RAG/1.0"})
        r.raise_for_status()
    except Exception as e:
        raise HTTPException(422, f"Fetch failed: {e}")

    html = r.text
    text = _extract_text_from_html(html)

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
            "journal_title": payload.journalTitle,
            "journalTitle": payload.journalTitle,
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
        "journalTitle": payload.journalTitle,
    }
    _register(payload.docId, reg_entry)

    return {"ok": True, "inserted": inserted, "docId": payload.docId}

# ------------- Ingest ARTICLES (magazine workflow) ----------------
def _parse_range(range_str: str) -> Optional[Tuple[int, int]]:
    if not range_str:
        return None
    s = str(range_str).strip()
    # accept hyphen, en dash, em dash
    s = s.replace("—", "-").replace("–", "-")
    m = re.match(r"^\s*(\d+)\s*-\s*(\d+)\s*$", s)
    if not m:
        # single page like "7"
        m1 = re.match(r"^\s*(\d+)\s*$", s)
        if m1:
            n = int(m1.group(1))
            return (n, n)
        return None
    a, b = int(m.group(1)), int(m.group(2))
    if a <= 0 or b <= 0:
        return None
    if b < a:
        a, b = b, a
    return (a, b)

def _subset_pages(pdf_pages: List[Tuple[int, str]], start: int, end: int) -> List[Tuple[int, str]]:
    return [(pno, txt) for (pno, txt) in pdf_pages if isinstance(pno, int) and start <= pno <= end]

def _require_pdf_registry(entry: Dict):
    if not entry:
        raise HTTPException(404, "Document not in registry")
    if entry.get("type") != "FILE":
        raise HTTPException(400, "Articles ingest requires a FILE (PDF) document.")
    if (entry.get("mimeType") or "").lower() != "application/pdf":
        raise HTTPException(400, "Articles ingest requires a PDF source.")

def _load_pdf_pages(entry: Dict) -> List[Tuple[int, str]]:
    p = Path(entry["path"])
    raw = p.read_bytes()
    return _extract_text_from_pdf(raw)

def _article_meta_common(entry: Dict, a: IngestArticle) -> Dict:
    return {
        "title": a.title,
        "description": (a.description or "").strip() or None,
        "authors": normalize_authors(a.authors),
        "section": normalize_section(a.section),
        "year": normalize_year(a.year) or normalize_year(entry.get("year")),
        "issue_label": normalize_issue_label(a.issueLabel) or normalize_issue_label(entry.get("issueLabel")),
        "issueId": entry.get("issueId"),
        "issue_id": entry.get("issueId"),
        "journal_title": a.journalTitle or entry.get("journalTitle"),
        "journalTitle": a.journalTitle or entry.get("journalTitle"),
        "article_id": normalize_article_id(a.articleId),
        "articleId": normalize_article_id(a.articleId),
        "pages": None,  # we set pageRange instead
        "pageRange": (a.pageRange or "").strip() or None,
        "source_type": "file",
        "source_path": entry.get("path"),
        "mimeType": entry.get("mimeType"),
        "audience": normalize_audience(a.audience or entry.get("audience")),
    }

@app.post("/ingest/articles", dependencies=[Depends(_require_key)])
def ingest_articles(payload: IngestArticlesIn):
    if not payload.docId:
        raise HTTPException(400, "docId is required.")
    if not payload.articles:
        raise HTTPException(400, "articles array is required.")

    reg = _load_registry()
    entry = reg.get(payload.docId)
    _require_pdf_registry(entry)

    pdf_pages = _load_pdf_pages(entry)
    total_inserted = 0
    inserted_per_article: List[Dict] = []

    for art in payload.articles:
        # determine PDF page range
        sp: Optional[int] = art.startPage if isinstance(art.startPage, int) else None
        ep: Optional[int] = art.endPage if isinstance(art.endPage, int) else None

        if sp is None or ep is None:
            pr = _parse_range(art.pageRange or "")
            if pr:
                off = int(art.offset) if art.offset is not None else None
                if off is not None:
                    sp, ep = pr[0] + off, pr[1] + off
                else:
                    sp, ep = pr
        if sp is None or ep is None:
            raise HTTPException(400, f"Article '{art.title}': provide pageRange(+offset) or startPage/endPage.")

        if sp <= 0 or ep <= 0:
            raise HTTPException(400, f"Article '{art.title}': invalid page numbers.")

        subset = _subset_pages(pdf_pages, sp, ep)
        if not subset:
            raise HTTPException(400, f"Article '{art.title}': no PDF text found for pages {sp}–{ep}.")

        meta = _article_meta_common(entry, art)
        # store human-readable trükis range even if offset used
        if not meta.get("pageRange"):
            meta["pageRange"] = f"{sp}–{ep}"

        inserted = _ingest_text(payload.docId, subset, meta)
        total_inserted += inserted
        inserted_per_article.append({"title": art.title, "inserted": inserted, "startPage": sp, "endPage": ep})

    # touch lastIngested
    entry["lastIngested"] = now_iso()
    _register(payload.docId, entry)

    return {"ok": True, "count": total_inserted, "inserted": inserted_per_article, "docId": payload.docId}

@app.post("/ingest/articles/{doc_id}", dependencies=[Depends(_require_key)])
def ingest_articles_path(doc_id: str = FastPath(...), payload: IngestArticlesIn = None):
    # support :docId in path (Next.js config)
    if payload is None:
        raise HTTPException(400, "Body is required.")
    payload.docId = payload.docId or doc_id
    return ingest_articles(payload)

# ---------------- Documents -----------------
@app.get("/documents", dependencies=[Depends(_require_key)])
def documents(limit: Optional[int] = None):
    reg = _load_registry()
    out = []

    def _key(item):
        _meta = item[1]
        return (_meta.get("updatedAt") or _meta.get("createdAt") or "", item[0])

    items = sorted(reg.items(), key=_key, reverse=True)
    if isinstance(limit, int) and limit > 0:
        items = items[: min(limit, 100)]

    for doc_id, meta in items:
        try:
            got = collection.get(where={"doc_id": doc_id}, include=["ids"], limit=100000)
            ids = got.get("ids", []) or []
            count = len(ids)
        except Exception:
            count = 0
        out.append({
            "id": doc_id,
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
            "journalTitle": meta.get("journalTitle"),
            "createdAt": meta.get("createdAt"),
            "updatedAt": meta.get("updatedAt"),
            "lastIngested": meta.get("lastIngested"),
            **{k: v for k, v in meta.items() if k not in {
                "title","description","type","fileName","url","mimeType",
                "audience","createdAt","updatedAt","lastIngested","journalTitle"
            }},
        })
    return out

@app.get("/documents/{doc_id}", dependencies=[Depends(_require_key)])
def get_document(doc_id: str):
    reg = _load_registry()
    meta = reg.get(doc_id)
    if not meta:
        raise HTTPException(404, "Document not in registry")
    try:
        got = collection.get(where={"doc_id": doc_id}, include=["ids"], limit=100000)
        count = len(got.get("ids", []) or [])
    except Exception:
        count = 0
    return {
        "id": doc_id,
        "docId": doc_id,
        "status": "COMPLETED",
        "chunks": count,
        **meta,
    }

@app.put("/documents/{doc_id}/meta", dependencies=[Depends(_require_key)])
def update_document_meta(doc_id: str, patch: DocumentMetaUpdate):
    snapshot = _load_registry()
    if doc_id not in snapshot:
        raise HTTPException(404, "Document not in registry")

    data = patch.model_dump(exclude_unset=True)
    if "issueTitle" in data and "issueLabel" not in data:
        data["issueLabel"] = data.pop("issueTitle")

    if "audience" in data:
        data["audience"] = normalize_audience(data["audience"])
    if "authors" in data:
        data["authors"] = normalize_authors(data["authors"])
    if "issueLabel" in data:
        data["issueLabel"] = normalize_issue_label(data["issueLabel"])
    if "issueId" in data:
        data["issueId"] = normalize_issue_id(data["issueId"])
    if "journalTitle" in data and data["journalTitle"]:
        data["journalTitle"] = data["journalTitle"].strip()
    if "year" in data:
        normalized_year = normalize_year(data["year"])
        data["year"] = normalized_year
    if "section" in data:
        data["section"] = normalize_section(data["section"])
    if "pageRange" in data and data["pageRange"]:
        data["pageRange"] = str(data["pageRange"]).strip()
    if "articleId" in data:
        data["articleId"] = normalize_article_id(data["articleId"])
    if "mimeType" in data and data["mimeType"]:
        data["mimeType"] = str(data["mimeType"])

    def mutator(registry: Dict[str, Dict]) -> Dict[str, object]:
        entry = dict(registry.get(doc_id, {}))
        for key, value in data.items():
            if value is None:
                continue
            if key == "issueId":
                entry["issueId"] = value
                entry["issue_id"] = value
            elif key == "issueLabel":
                entry["issueLabel"] = value
                entry["issue_label"] = value
            elif key == "journalTitle":
                entry["journalTitle"] = value
                entry["journal_title"] = value
            else:
                entry[key] = value
        entry["updatedAt"] = now_iso()
        registry[doc_id] = entry
        return entry

    updated_entry = _update_registry(mutator)
    logger.info("Document meta updated via admin sync: %s", doc_id)
    return {"ok": True, "docId": doc_id, "meta": updated_entry}

@app.post("/documents/{doc_id}/reindex", dependencies=[Depends(_require_key)])
def reindex(doc_id: str):
    reg = _load_registry()
    entry = reg.get(doc_id)
    if not entry:
        raise HTTPException(404, "Document not in registry")

    try:
        collection.delete(where={"doc_id": doc_id})
    except Exception:
        pass

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
            "journal_title": entry.get("journalTitle"),
            "journalTitle": entry.get("journalTitle"),
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
            "journal_title": entry.get("journalTitle"),
            "journalTitle": entry.get("journalTitle"),
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
    try:
        collection.delete(where={"doc_id": doc_id})
    except Exception:
        pass

    def remover(registry: Dict[str, Dict]) -> bool:
        return registry.pop(doc_id, None) is not None

    had = _update_registry(remover)

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

# ---------------- Search -----------------
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
        include_items = payload.include or ["documents", "metadatas", "distances"]

        res = collection.query(
            query_embeddings=[q_emb],
            n_results=max(1, min(50, payload.top_k or 5)),
            where=md_where or None,
            include=include_items,
        )
    except Exception as e:
        return {"results": [], "groups": [], "error": f"query_failed: {e.__class__.__name__}: {e}"}

    ids = (res.get("ids") or [[]])[0] if res.get("ids") else []
    docs = (res.get("documents") or [[]])[0] if res.get("documents") else []
    metas = (res.get("metadatas") or [[]])[0] if res.get("metadatas") else []
    dists = (res.get("distances") or [[]])[0] if res.get("distances") else []

    flat = []
    for i, _id in enumerate(ids):
        ch = docs[i] if i < len(docs) and isinstance(docs[i], str) else ""
        md = metas[i] if i < len(metas) and isinstance(metas[i], dict) else {}
        source_path = md.get("source_path")
        file_name = None
        if source_path:
            try:
                file_name = Path(source_path).name
            except Exception:
                file_name = source_path
        issue_val = md.get("issue_label") or md.get("issueLabel") or md.get("issue_id") or md.get("issueId") or None
        flat.append({
            "id": _id,
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
            "journalTitle": md.get("journal_title") or md.get("journalTitle"),
            "chunk": ch,
            "url": md.get("source_url"),
            "fileName": file_name,
            "source_type": md.get("source_type"),
            "page": md.get("page"),
            "distance": dists[i] if i < len(dists) else None,
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
                "journalTitle": r.get("journalTitle"),
                "pages_all": [],
                "page_ranges": [],
                "items": [],
            }
            groups_map[key] = g
        if isinstance(r.get("page"), int):
            g["pages_all"].append(r["page"])
        if isinstance(r.get("pages"), list):
            for p in r["pages"]:
                if isinstance(p, int):
                    g["pages_all"].append(p)
        if isinstance(r.get("pageRange"), str) and r["pageRange"]:
            g["page_ranges"].append(r["pageRange"])
        g["items"].append(r)

    def _collapse_pages_local(pages):
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

    groups = []
    for g in groups_map.values():
        pages_compact = _collapse_pages_local(g["pages_all"]) or (", ".join(sorted(set(g["page_ranges"]))) if g["page_ranges"] else "")
        meta_for_ref = {
            "authors": g["authors"],
            "title": g["title"],
            "year": g["year"],
            "issue": g["issue"],
            "issue_id": g["issue"],
            "journal_title": g.get("journalTitle"),
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
            "journalTitle": g["journalTitle"],
            "pages": pages_compact,
            "short_ref": short_ref,
            "count": len(g["items"]),
            "items": g["items"],
        })

    groups.sort(key=lambda x: (-x["count"], x["title"] or ""))
    return {"results": flat, "groups": groups}

# ---------------- Auto TOC + Article PDF -----------------

_TOCTITLE_RX = re.compile(r"\b(sisukord|sisukorra|contents|toc)\b", re.IGNORECASE)
_PAGENUM_AT_END_RX = re.compile(r"(.+?)\s+(\d{1,4})$")  # "Pealkiri .... 12"
_AUTHOR_SPLIT_RX = re.compile(r"\s*[–—-]\s*")  # en dash/em dash/hyphen as title-author separator

def _is_likely_toc_page(txt: str) -> bool:
    """Heuristics: contains 'Sisukord' OR many lines ending with page numbers."""
    if _TOCTITLE_RX.search(txt):
        return True
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    has = sum(1 for l in lines if _PAGENUM_AT_END_RX.search(l))
    return has >= 6  # at least 6 entries look like "..... 12"

def _extract_toc_items(txt: str) -> List[Dict]:
    """
    Return [{title, authors[], page}], where page is *print* page (human).
    We try to parse lines ending with a page number.
    Supports a few common patterns:
      - 'Pealkiri — Autor 12'
      - 'Rubriik: Pealkiri 12'
      - 'Pealkiri 12'
    """
    items = []
    for raw in txt.splitlines():
        line = " ".join(raw.strip().split())
        if not line:
            continue
        m = _PAGENUM_AT_END_RX.search(line)
        if not m:
            continue
        left, pnum = m.group(1).strip(), int(m.group(2))
        title = left
        authors: List[str] = []

        # try split "Title — Author"
        parts = _AUTHOR_SPLIT_RX.split(left)
        # if looks like "Title — Authors", take last chunk as authors if it contains a space and is short-ish
        if len(parts) >= 2:
            maybe_auth = parts[-1].strip()
            if len(maybe_auth.split()) <= 6 and any(c.isalpha() for c in maybe_auth):
                title = " — ".join(parts[:-1]).strip()
                authors = [a.strip() for a in re.split(r"[;,/]+", maybe_auth) if a.strip()]

        # clean dotted leaders "........"
        title = re.sub(r"\.{3,}", " ", title).strip(" .–—-")
        if title:
            items.append({"title": title, "authors": authors, "page": pnum})
    # dedupe by (title,page)
    uniq = []
    seen = set()
    for it in items:
        k = (it["title"].lower(), it["page"])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(it)
    return uniq

def _guess_offset_by_search(pdf_pages: List[Tuple[int, str]], toc_items: List[Dict]) -> Optional[int]:
    """
    Try to infer PDF offset automatically:
    For the first reliable title, find the first PDF page that contains that title words,
    then offset = pdf_page - print_page.
    """
    for it in toc_items:
        title = it["title"]
        if not title or len(title) < 5:
            continue
        # build a loose search string (first 4-7 words)
        words = [w for w in re.split(r"\W+", title) if w]
        if len(words) < 2:
            continue
        probe = " ".join(words[: min(7, max(4, len(words))) ])
        probe = re.sub(r"\s+", " ", probe).strip()
        if not probe:
            continue
        # find in PDF pages
        for (pno, txt) in pdf_pages:
            t = _clean_text(txt or "")
            if probe.lower() in t.lower():
                # offset = pdf_page - print_page
                return int(pno) - int(it["page"])
    return None

def _build_ranges_from_toc(toc: List[Dict]) -> List[Tuple[Dict, Optional[int], Optional[int]]]:
    """
    From sorted TOC items by print page, derive (item, start_print_page, end_print_page).
    End page is next item's start-1; last item has None as end (caller can fill or leave None).
    """
    if not toc:
        return []
    toc_sorted = sorted(toc, key=lambda x: int(x["page"]))
    out = []
    for i, it in enumerate(toc_sorted):
        startp = int(it["page"])
        endp = None
        if i + 1 < len(toc_sorted):
            endp = int(toc_sorted[i+1]["page"]) - 1 if int(toc_sorted[i+1]["page"]) > startp else None
        out.append((it, startp, endp))
    return out

# --- Endpoint: parse issue (TOC) --------------------------------------------
class ParseIssueIn(BaseModel):
    docId: str
    offset: Optional[int] = None  # optional override
    maxItems: Optional[int] = None

@app.post("/parse/issue", dependencies=[Depends(_require_key)])
def parse_issue(payload: ParseIssueIn):
    reg = _load_registry()
    entry = reg.get(payload.docId)
    _require_pdf_registry(entry)
    pdf_pages = _load_pdf_pages(entry)

    # find likely TOC pages
    candidates = []
    for (pno, txt) in pdf_pages:
        if _is_likely_toc_page(txt or ""):
            candidates.append((pno, txt))
    # if none matched, also try first 6 pages (many magazines place TOC early)
    if not candidates:
        for (pno, txt) in pdf_pages[:6]:
            if txt and len(txt) > 1000:  # somewhat dense page
                candidates.append((pno, txt))

    toc_items: List[Dict] = []
    for _, txt in candidates:
        toc_items.extend(_extract_toc_items(txt or ""))

    if not toc_items:
        logger.warning("parse_issue: no TOC items detected for docId=%s", payload.docId)

    # heuristic offset
    auto_offset = _guess_offset_by_search(pdf_pages, toc_items) if toc_items else None
    use_offset = payload.offset if payload.offset is not None else auto_offset

    # propose article ranges in *print* pages
    ranges = _build_ranges_from_toc(toc_items)
    max_items = max(1, min(200, int(payload.maxItems or 0))) if payload.maxItems else None
    if max_items:
        ranges = ranges[:max_items]

    # build drafts with both print and (if offset known) PDF start/end
    drafts = []
    for (it, start_print, end_print) in ranges:
        item = {
            "title": it.get("title"),
            "authors": it.get("authors") or [],
            "pageRange": f"{start_print}–{end_print}" if end_print else str(start_print),
            "startPage": None,
            "endPage": None,
            "section": None,
            "audience": entry.get("audience") or "BOTH",
            "description": None,
        }
        if isinstance(use_offset, int):
            item["startPage"] = start_print + use_offset
            item["endPage"] = (end_print + use_offset) if isinstance(end_print, int) else None
        drafts.append(item)

    return {
        "ok": True,
        "docId": payload.docId,
        "foundTocItems": len(toc_items),
        "autoOffset": auto_offset,
        "usingOffset": use_offset,
        "drafts": drafts,
    }

# --- Endpoint: slice article PDF --------------------------------------------
@app.get("/article/pdf/{doc_id}", dependencies=[Depends(_require_key)])
def article_pdf(doc_id: str, start: int = Query(..., ge=1), end: int = Query(..., ge=1), filename: Optional[str] = None):
    if start <= 0 or end <= 0:
        raise HTTPException(400, "Invalid start/end")
    if end < start:
        start, end = end, start

    reg = _load_registry()
    entry = reg.get(doc_id)
    _require_pdf_registry(entry)
    p = Path(entry["path"])
    raw = p.read_bytes()
    try:
        reader = PdfReader(BytesIO(raw))
        writer = PdfWriter()
        # PDF pages are 1-based in our metadata; PyPDF uses 0-based
        s, e = start - 1, end - 1
        n = len(reader.pages)
        if s < 0 or e >= n:
            raise HTTPException(400, f"Page out of range: PDF has {n} pages")
        for i in range(s, e + 1):
            writer.add_page(reader.pages[i])
        buff = BytesIO()
        writer.write(buff)
        buff.seek(0)
        fname = (filename or f"article_{start}-{end}.pdf").strip()
        if not fname.lower().endswith(".pdf"):
            fname += ".pdf"
        headers = {
            "Content-Disposition": f'attachment; filename="{fname}"',
            "X-Source-Doc": p.name,
        }
        return StreamingResponse(buff, media_type="application/pdf", headers=headers)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"PDF slice failed: {e}")
