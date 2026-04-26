import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const ragServicePath = path.join(repoRoot, "rag-service", "main.py");

function readRagServiceMain() {
  return fs.readFileSync(ragServicePath, "utf8");
}

function extractPythonFunction(source, name) {
  const startMarker = `def ${name}(`;
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `${name} not found in rag-service/main.py`);

  const nextDef = source.indexOf("\ndef ", start + startMarker.length);
  assert.notEqual(nextDef, -1, `could not find end of ${name}`);
  return source.slice(start, nextDef);
}

test("RAG service ingest payload defines V2 source contract fields before metadata use", () => {
  const fn = extractPythonFunction(readRagServiceMain(), "_build_ingest_payload");
  const fields = [
    "source_id",
    "document_id",
    "legacy_source_type",
    "authority",
    "url_canonical",
    "retrieved_at",
    "last_checked",
    "valid_from",
    "valid_to",
    "historical",
    "source_status",
    "canonical_item_id",
    "content_hash"
  ];

  for (const field of fields) {
    const assignment = fn.indexOf(`${field} =`);
    const metadataUse = fn.indexOf(`"${field}": ${field}`);
    assert.notEqual(assignment, -1, `${field} assignment missing`);
    assert.notEqual(metadataUse, -1, `${field} metadata use missing`);
    assert.ok(
      assignment < metadataUse,
      `${field} must be assigned before it is written into chunk metadata`
    );
  }
});

test("RAG service PDF metadata ingest logs unexpected failures with source identifiers", () => {
  const fn = extractPythonFunction(readRagServiceMain(), "ingest_pdf_with_metadata");

  assert.match(fn, /except HTTPException:\s+raise/s);
  assert.match(fn, /logger\.exception\(/);
  assert.match(fn, /PDF metadata ingest failed/);
  assert.match(fn, /doc_id/);
  assert.match(fn, /original_doc_id/);
  assert.match(fn, /source_type/);
});
