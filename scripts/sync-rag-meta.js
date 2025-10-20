#!/usr/bin/env node
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const trim = (value) => (typeof value === "string" ? value.trim() : value);

const pickEnv = (...keys) => {
  for (const key of keys) {
    const val = trim(process.env[key]);
    if (val) return val;
  }
  return "";
};

const normalizeBase = (raw) => {
  const trimmed = (raw || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  const isLocal =
    lower.startsWith("localhost") ||
    lower.startsWith("127.") ||
    lower.startsWith("0.0.0.0") ||
    lower.startsWith("[::1") ||
    lower.startsWith("::1");
  return `${isLocal ? "http" : "https"}://${trimmed}`;
};

const ragBase = normalizeBase(
  pickEnv("RAG_SERVICE_URL", "RAG_INTERNAL_HOST", "RAG_API_BASE")
);
const apiKey = pickEnv("RAG_SERVICE_API_KEY", "RAG_API_KEY");

if (!ragBase || !apiKey) {
  console.error(
    "[sync-rag-meta] RAG base URL või API võti puudub (.env -> RAG_SERVICE_URL/RAG_API_BASE ja RAG_SERVICE_API_KEY)."
  );
  process.exit(1);
}

const targetBase = ragBase.replace(/\/+$/, "");

const parseAuthors = (authors) =>
  Array.isArray(authors) ? authors.map((a) => String(a).trim()).filter(Boolean) : undefined;

const summarize = ({ success, failed, skipped }) =>
  `kokku ${success + failed + skipped}, uuendatud ${success}, vahele jäetud ${skipped}, vead ${failed}`;

try {
  const docs = await prisma.ragDocument.findMany();
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const doc of docs) {
    const docId = doc.remoteId || doc.id;
    if (!docId) {
      skipped += 1;
      continue;
    }

    const payload = {
      title: trim(doc.title) || undefined,
      description: trim(doc.description) || undefined,
      audience: trim(doc.audience) || undefined,
      authors: parseAuthors(doc.authors),
      journalTitle: trim(doc.journalTitle) || undefined,
      issueLabel: trim(doc.issueLabel) || undefined,
      issueId: trim(doc.issueId) || undefined,
      year: typeof doc.year === "number" ? doc.year : undefined,
      section: trim(doc.section) || undefined,
      pageRange: trim(doc.pageRange) || undefined,
      articleId: trim(doc.articleId) || undefined,
      sourceUrl: trim(doc.sourceUrl) || undefined,
      fileName: trim(doc.fileName) || undefined,
      mimeType: trim(doc.mimeType) || undefined,
    };

    // Remove empty arrays/values
    Object.keys(payload).forEach((key) => {
      const val = payload[key];
      if (
        val === undefined ||
        val === null ||
        (typeof val === "string" && !val.trim()) ||
        (Array.isArray(val) && val.length === 0)
      ) {
        delete payload[key];
      }
    });

    if (dryRun) {
      console.log(`[dry-run] ${docId}`, payload);
      skipped += 1;
      continue;
    }

    try {
      const res = await fetch(`${targetBase}/documents/${encodeURIComponent(docId)}/meta`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        failed += 1;
        const text = await res.text().catch(() => "");
        console.error(
          `[sync-rag-meta] FAIL ${docId}: ${res.status} ${res.statusText} ${text ? `→ ${text}` : ""}`
        );
        continue;
      }

      success += 1;
    } catch (err) {
      failed += 1;
      console.error(`[sync-rag-meta] ERR ${docId}:`, err?.message || err);
    }
  }

  console.log(`[sync-rag-meta] Valmis – ${summarize({ success, failed, skipped })}`);
} catch (err) {
  console.error("[sync-rag-meta] Fataalne viga:", err?.message || err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
