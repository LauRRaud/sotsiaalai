import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAnalyzeAcceptAttr,
  DEFAULT_ANALYZE_ALLOWED_MIME,
  DEFAULT_ANALYZE_MAX_UPLOAD_MB,
  parseAnalyzeAllowedMime,
  readAnalyzeMaxUploadMb,
  resolveAnalyzeMimeType
} from "../../lib/chat/analyzeFileConfig.js";

test("analyze file config falls back to the shared MIME defaults", () => {
  assert.deepEqual(parseAnalyzeAllowedMime(""), DEFAULT_ANALYZE_ALLOWED_MIME);
});

test("analyze file config resolves MIME from request, browser type, or file extension", () => {
  assert.equal(
    resolveAnalyzeMimeType({
      mimeTypeFromRequest: "text/plain",
      mimeTypeFromFile: "",
      fileName: "notes.md"
    }),
    "text/plain"
  );

  assert.equal(
    resolveAnalyzeMimeType({
      mimeTypeFromRequest: "",
      mimeTypeFromFile: "",
      fileName: "haapsalu-linn.rag.md"
    }),
    "text/markdown"
  );

  assert.equal(
    resolveAnalyzeMimeType({
      mimeTypeFromRequest: "",
      mimeTypeFromFile: "",
      fileName: "preview.html"
    }),
    "text/html"
  );
});

test("analyze file config builds a file input accept list from the shared MIME defaults", () => {
  const acceptAttr = buildAnalyzeAcceptAttr();
  assert.match(acceptAttr, /application\/pdf/);
  assert.match(acceptAttr, /\.docx/);
  assert.match(acceptAttr, /\.md/);
  assert.match(acceptAttr, /\.html/);
});

test("analyze file config keeps the upload size fallback aligned at 25 MB", () => {
  assert.equal(readAnalyzeMaxUploadMb(undefined), DEFAULT_ANALYZE_MAX_UPLOAD_MB);
  assert.equal(readAnalyzeMaxUploadMb("50"), 50);
  assert.equal(readAnalyzeMaxUploadMb("invalid"), DEFAULT_ANALYZE_MAX_UPLOAD_MB);
});
