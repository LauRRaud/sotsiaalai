#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DEFAULT_IMPORT_ROOT = "imports/ajakiri_sotsiaaltoo";
const DEFAULT_LOG_PATH = "logs/ajakiri-sotsiaaltoo-ingest.jsonl";
const DEFAULT_ALL_EXCLUDED_ISSUES = new Set(["20-2", "25-3", "MÕTISKLUSI"]);
const RAW_RAG_HOST = String(process.env.RAG_INTERNAL_HOST || process.env.RAG_API_BASE || "127.0.0.1:8000").trim();
const RAG_KEY = String(process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

function usage() {
  console.log(`
Usage:
  node scripts/ingest-ajakiri-sotsiaaltoo.mjs --issue 17-4 --dry-run
  node scripts/ingest-ajakiri-sotsiaaltoo.mjs --issue 17-4
  node scripts/ingest-ajakiri-sotsiaaltoo.mjs --all --dry-run
  node scripts/ingest-ajakiri-sotsiaaltoo.mjs --all --resume --concurrency 2

Options:
  --root <path>         Import root. Default: ${DEFAULT_IMPORT_ROOT}
  --issue <name>        Ingest one issue folder. Can be passed multiple times.
  --all                 Ingest every issue folder under root.
  --exclude <name>      Exclude an issue folder. Can be passed multiple times.
  --include-problem-issues
                        With --all, include default excluded issue folders.
  --dry-run             Validate pairs without sending to RAG.
  --resume              Skip items already logged as ok.
  --skip-existing       Check RAG registry and skip existing resolved docIds.
  --limit <n>           Process at most n JSON files after filtering.
  --concurrency <n>     Parallel uploads. Default: 1. Recommended: 1-2.
  --log <path>          JSONL log path. Default: ${DEFAULT_LOG_PATH}
  --base-url <url>      RAG service URL. Default from env or http://127.0.0.1:8000
  --stop-on-error       Stop after the first ingest error.
`.trim());
}

function parseArgs(argv) {
  const args = {
    root: DEFAULT_IMPORT_ROOT,
    issues: [],
    excludes: [],
    all: false,
    includeProblemIssues: false,
    dryRun: false,
    resume: false,
    skipExisting: false,
    stopOnError: false,
    limit: 0,
    concurrency: 1,
    logPath: DEFAULT_LOG_PATH,
    baseUrl: normalizeBaseFromHost(RAW_RAG_HOST)
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = String(argv[i] || "");
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--root") {
      args.root = String(argv[++i] || "").trim();
      continue;
    }
    if (arg === "--issue") {
      const value = String(argv[++i] || "").trim();
      if (value) args.issues.push(value);
      continue;
    }
    if (arg === "--all") {
      args.all = true;
      continue;
    }
    if (arg === "--exclude") {
      const value = String(argv[++i] || "").trim();
      if (value) args.excludes.push(value);
      continue;
    }
    if (arg === "--include-problem-issues") {
      args.includeProblemIssues = true;
      continue;
    }
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--resume") {
      args.resume = true;
      continue;
    }
    if (arg === "--skip-existing") {
      args.skipExisting = true;
      continue;
    }
    if (arg === "--stop-on-error") {
      args.stopOnError = true;
      continue;
    }
    if (arg === "--limit") {
      args.limit = Math.max(0, Number.parseInt(String(argv[++i] || "0"), 10) || 0);
      continue;
    }
    if (arg === "--concurrency") {
      args.concurrency = Math.max(1, Math.min(5, Number.parseInt(String(argv[++i] || "1"), 10) || 1));
      continue;
    }
    if (arg === "--log") {
      args.logPath = String(argv[++i] || "").trim() || DEFAULT_LOG_PATH;
      continue;
    }
    if (arg === "--base-url") {
      args.baseUrl = normalizeBaseFromHost(String(argv[++i] || ""));
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.all && !args.issues.length) {
    throw new Error("Pass --issue <name> or --all. Use --dry-run before real ingest.");
  }
  if (args.all && args.issues.length) {
    throw new Error("Use either --all or --issue, not both.");
  }
  if (!args.dryRun && !RAG_KEY) {
    throw new Error("RAG_SERVICE_API_KEY or RAG_API_KEY is missing.");
  }
  return args;
}

function normalizeBaseFromHost(host) {
  const trimmed = String(host || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://127.0.0.1:8000";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

function resolveWorkspacePath(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(rootDir, inputPath);
}

function safeDocIdSegment(value) {
  const raw = String(value || "").trim().toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || crypto.createHash("sha1").update(String(value || "")).digest("hex").slice(0, 12);
}

function resolveExpectedDocId(meta) {
  const originalDocId = String(meta?.doc_id || meta?.docId || "").trim();
  let docId = originalDocId;
  const articleId = String(meta?.article_id || meta?.articleId || "").trim();
  if (!docId || !articleId) return { docId, originalDocId, articleId };

  const articleSegment = safeDocIdSegment(articleId);
  if (articleSegment && !safeDocIdSegment(docId).includes(articleSegment)) {
    docId = `${docId.replace(/[-_:]+$/g, "")}-${articleSegment}`;
  }
  return { docId, originalDocId, articleId };
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function listIssueDirs(importRoot, args) {
  if (args.all) {
    const excluded = new Set([
      ...(args.includeProblemIssues ? [] : [...DEFAULT_ALL_EXCLUDED_ISSUES]),
      ...args.excludes
    ]);
    const entries = await fs.readdir(importRoot, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .filter(entry => !excluded.has(entry.name))
      .map(entry => path.join(importRoot, entry.name))
      .sort((a, b) => path.basename(a).localeCompare(path.basename(b), "et", { numeric: true }));
  }
  const excluded = new Set(args.excludes);
  return args.issues.filter(issue => !excluded.has(issue)).map(issue => path.join(importRoot, issue));
}

async function collectJsonFiles(issueDirs) {
  const files = [];
  for (const issueDir of issueDirs) {
    const entries = await fs.readdir(issueDir, { withFileTypes: true }).catch(error => {
      throw new Error(`Cannot read issue folder ${issueDir}: ${error.message}`);
    });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        files.push(path.join(issueDir, entry.name));
      }
    }
  }
  return files.sort((a, b) => a.localeCompare(b, "et", { numeric: true }));
}

async function loadCompletedDocIds(logPath) {
  const completed = new Set();
  if (!(await pathExists(logPath))) return completed;
  const raw = await fs.readFile(logPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const item = JSON.parse(line);
      if (item.status === "ok" && item.expectedDocId) completed.add(String(item.expectedDocId));
    } catch {
      // Ignore damaged log lines; future writes remain append-only.
    }
  }
  return completed;
}

async function appendLog(logPath, entry) {
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.appendFile(logPath, `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`, "utf8");
}

async function buildPlan(jsonFiles, completedDocIds) {
  const items = [];
  const seenArticleIds = new Map();
  const seenExpectedDocIds = new Map();

  for (const jsonPath of jsonFiles) {
    const issue = path.basename(path.dirname(jsonPath));
    let meta;
    try {
      meta = await readJson(jsonPath);
    } catch (error) {
      items.push({ status: "invalid_json", issue, jsonPath, error: error.message });
      continue;
    }

    const sourcePath = String(meta?.source_path || "").trim();
    const { docId: expectedDocId, originalDocId, articleId } = resolveExpectedDocId(meta);
    const title = String(meta?.title || "").trim();
    const pdfPath = sourcePath ? path.resolve(path.dirname(jsonPath), sourcePath) : "";

    let status = "ready";
    let error = "";
    if (!sourcePath) {
      status = "missing_source_path";
      error = "JSON does not contain source_path";
    } else if (!(await pathExists(pdfPath))) {
      status = "missing_pdf";
      error = `PDF not found: ${sourcePath}`;
    } else if (!expectedDocId) {
      status = "missing_doc_id";
      error = "JSON does not contain docId/doc_id";
    } else if (!articleId) {
      status = "missing_article_id";
      error = "JSON does not contain articleId/article_id";
    } else if (!title) {
      status = "missing_title";
      error = "JSON does not contain title";
    } else if (completedDocIds.has(expectedDocId)) {
      status = "resume_skip";
      error = "Already logged as ok";
    }

    if (articleId) {
      const previous = seenArticleIds.get(articleId);
      if (previous && status === "ready") {
        status = "duplicate_article_id";
        error = `Duplicate articleId also used by ${path.relative(rootDir, previous)}`;
      } else {
        seenArticleIds.set(articleId, jsonPath);
      }
    }

    if (expectedDocId) {
      const previous = seenExpectedDocIds.get(expectedDocId);
      if (previous && status === "ready") {
        status = "duplicate_doc_id";
        error = `Duplicate expected docId also used by ${path.relative(rootDir, previous)}`;
      } else {
        seenExpectedDocIds.set(expectedDocId, jsonPath);
      }
    }

    items.push({
      status,
      issue,
      jsonPath,
      pdfPath,
      sourcePath,
      expectedDocId,
      originalDocId,
      articleId,
      title,
      error
    });
  }
  return items;
}

async function isDocumentExisting(baseUrl, expectedDocId) {
  const response = await fetch(`${baseUrl}/documents/${encodeURIComponent(expectedDocId)}`, {
    method: "GET",
    headers: { "X-API-Key": RAG_KEY }
  });
  if (response.status === 404) return false;
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`registry check failed HTTP ${response.status}: ${text.slice(0, 180)}`);
  }
  return true;
}

async function ingestItem(baseUrl, item) {
  const [rawPdf, rawJson] = await Promise.all([
    fs.readFile(item.pdfPath),
    fs.readFile(item.jsonPath, "utf8")
  ]);
  const formData = new FormData();
  formData.append("file", new Blob([rawPdf], { type: "application/pdf" }), path.basename(item.pdfPath));
  formData.append("metadata_text", rawJson);

  const response = await fetch(`${baseUrl}/ingest/pdf-with-metadata`, {
    method: "POST",
    headers: {
      "X-API-Key": RAG_KEY,
      "X-Observability-Route": "script/ingest-ajakiri-sotsiaaltoo",
      "X-Observability-Stage": "rag_ingest"
    },
    body: formData
  });

  const data = await response.json().catch(async () => ({ detail: await response.text().catch(() => "") }));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.detail || data?.message || `RAG ingest failed with HTTP ${response.status}`);
  }
  return data;
}

function printSummary(items) {
  const counts = new Map();
  for (const item of items) counts.set(item.status, (counts.get(item.status) || 0) + 1);
  const rows = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [status, count] of rows) {
    console.log(`  ${status}: ${count}`);
  }
}

async function runPool(items, concurrency, worker) {
  let index = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await worker(current);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const importRoot = resolveWorkspacePath(args.root);
  const logPath = resolveWorkspacePath(args.logPath);

  if (!(await pathExists(importRoot))) {
    throw new Error(`Import root does not exist: ${importRoot}`);
  }

  const issueDirs = await listIssueDirs(importRoot, args);
  const jsonFilesAll = await collectJsonFiles(issueDirs);
  const completed = args.resume ? await loadCompletedDocIds(logPath) : new Set();
  let plan = await buildPlan(jsonFilesAll, completed);
  if (args.limit > 0) plan = plan.slice(0, args.limit);

  console.log(`[ajakiri:ingest] root: ${path.relative(rootDir, importRoot) || importRoot}`);
  console.log(`[ajakiri:ingest] mode: ${args.dryRun ? "dry-run" : "ingest"}`);
  console.log(`[ajakiri:ingest] issues: ${args.all ? "all" : args.issues.join(", ")}`);
  if (args.all && !args.includeProblemIssues) {
    console.log(`[ajakiri:ingest] default excluded: ${[...DEFAULT_ALL_EXCLUDED_ISSUES].join(", ")}`);
  }
  if (args.excludes.length) {
    console.log(`[ajakiri:ingest] extra excluded: ${args.excludes.join(", ")}`);
  }
  console.log(`[ajakiri:ingest] json files: ${plan.length}`);
  printSummary(plan);

  const ready = plan.filter(item => item.status === "ready");
  const blocked = plan.filter(item => item.status !== "ready" && item.status !== "resume_skip");
  for (const item of blocked.slice(0, 20)) {
    console.log(`[blocked] ${item.status} ${path.relative(rootDir, item.jsonPath)} ${item.error || ""}`);
  }
  if (blocked.length > 20) console.log(`[blocked] ... ${blocked.length - 20} more`);

  if (args.dryRun) {
    console.log(`[ajakiri:ingest] dry-run complete. Ready to ingest: ${ready.length}`);
    return;
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  await runPool(ready, args.concurrency, async item => {
    try {
      if (args.skipExisting && await isDocumentExisting(args.baseUrl, item.expectedDocId)) {
        skipped += 1;
        await appendLog(logPath, { ...logEntryBase(item), status: "skip_existing" });
        console.log(`[skip] ${item.expectedDocId}`);
        return;
      }
      const result = await ingestItem(args.baseUrl, item);
      ok += 1;
      await appendLog(logPath, {
        ...logEntryBase(item),
        status: "ok",
        responseDocId: result?.docId || null,
        inserted: result?.inserted ?? null
      });
      console.log(`[ok] ${item.expectedDocId} chunks=${result?.inserted ?? "?"}`);
    } catch (error) {
      failed += 1;
      await appendLog(logPath, { ...logEntryBase(item), status: "ingest_error", error: error.message });
      console.error(`[error] ${item.expectedDocId}: ${error.message}`);
      if (args.stopOnError) throw error;
    }
  });

  console.log(`[ajakiri:ingest] done ok=${ok} skipped=${skipped} failed=${failed} log=${path.relative(rootDir, logPath)}`);
  if (failed > 0) process.exitCode = 1;
}

function logEntryBase(item) {
  return {
    issue: item.issue,
    jsonPath: path.relative(rootDir, item.jsonPath),
    pdfPath: item.pdfPath ? path.relative(rootDir, item.pdfPath) : null,
    sourcePath: item.sourcePath,
    expectedDocId: item.expectedDocId,
    originalDocId: item.originalDocId,
    articleId: item.articleId,
    title: item.title
  };
}

main().catch(error => {
  console.error("[ajakiri:ingest] Failed:", error.message);
  process.exit(1);
});
