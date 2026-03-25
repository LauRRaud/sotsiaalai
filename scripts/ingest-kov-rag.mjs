#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const RAW_RAG_HOST = String(process.env.RAG_INTERNAL_HOST || process.env.RAG_API_BASE || "127.0.0.1:8000").trim();
const RAG_KEY = String(process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

function usage() {
  console.log(`
Usage:
  node scripts/ingest-kov-rag.mjs <dir|base-path|file> [--slug <slug>] [--skip-validate] [--bundle-only]

Examples:
  node scripts/ingest-kov-rag.mjs output/parnu-linn
  npm run rag:ingest:kov -- output --slug parnu-linn
`.trim());
}

function normalizeBaseFromHost(host) {
  const trimmed = String(host || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://127.0.0.1:8000";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function deriveAudienceStorage(audience) {
  const values = Array.isArray(audience) ? audience : [];
  const cleaned = [...new Set(values.map((value) => String(value || "").trim().toUpperCase()).filter(Boolean))];
  if (cleaned.length === 1) return cleaned[0];
  return "BOTH";
}

function formatList(lines, emptyValue = "Puudub.") {
  const cleaned = Array.isArray(lines) ? lines.map((line) => String(line || "").trim()).filter(Boolean) : [];
  if (!cleaned.length) return emptyValue;
  return cleaned.map((line) => `- ${line}`).join("\n");
}

function formatForms(forms) {
  const cleaned = Array.isArray(forms) ? forms.filter((entry) => isObject(entry)) : [];
  if (!cleaned.length) return "Puudub.";
  return cleaned
    .map((entry) => {
      const title = String(entry.title || "").trim() || "Vorm";
      const format = String(entry.format || "").trim();
      const url = String(entry.url || "").trim();
      return `- ${title}${format ? ` (${format})` : ""}${url ? `: ${url}` : ""}`;
    })
    .join("\n");
}

function formatContacts(contacts) {
  const cleaned = Array.isArray(contacts) ? contacts.filter((entry) => isObject(entry)) : [];
  if (!cleaned.length) return "Puudub.";
  return cleaned
    .map((entry) => {
      const parts = [
        String(entry.name || "").trim(),
        String(entry.role || "").trim(),
        String(entry.phone || "").trim(),
        String(entry.email || "").trim(),
        String(entry.url || "").trim()
      ].filter(Boolean);
      return parts.length ? `- ${parts.join(" | ")}` : null;
    })
    .filter(Boolean)
    .join("\n") || "Puudub.";
}

function formatLegalBasis(entries) {
  const cleaned = Array.isArray(entries) ? entries.filter((entry) => isObject(entry)) : [];
  if (!cleaned.length) return "Puudub.";
  return cleaned
    .map((entry) => {
      const parts = [
        String(entry.title || "").trim(),
        String(entry.citation || "").trim(),
        String(entry.url || "").trim()
      ].filter(Boolean);
      return parts.length ? `- ${parts.join(" | ")}` : null;
    })
    .filter(Boolean)
    .join("\n") || "Puudub.";
}

function buildItemText(item, sourceMap) {
  const sourceLines = (Array.isArray(item.sourceKeys) ? item.sourceKeys : [])
    .map((key) => {
      const source = sourceMap.get(key);
      if (!source) return `- ${key}`;
      return `- ${key}: ${source.title || key}${source.url ? ` | ${source.url}` : ""}`;
    })
    .join("\n") || "Puudub.";
  const provider = item.provider && isObject(item.provider)
    ? [item.provider.name, item.provider.type, item.provider.unit, item.provider.url].filter(Boolean).join(" | ")
    : "Puudub.";
  const pricing = item.pricingOrAmount && isObject(item.pricingOrAmount)
    ? [
        item.pricingOrAmount.type,
        item.pricingOrAmount.value != null ? String(item.pricingOrAmount.value) : "",
        item.pricingOrAmount.currency,
        item.pricingOrAmount.note
      ].filter(Boolean).join(" | ") || "Puudub."
    : "Puudub.";

  return [
    `# ${item.title}`,
    "",
    `Liik: ${item.itemType}`,
    `Staatus: ${item.status}`,
    `Sihtrühm: ${formatList(item.targetGroup, "Puudub.").replace(/^- /, "")}`,
    `Auditoorium: ${(Array.isArray(item.audience) ? item.audience : []).join(", ") || "Puudub."}`,
    `Kokkuvõte: ${item.summary || "Puudub."}`,
    item.resourceType ? `Ressursi tüüp: ${item.resourceType}` : null,
    "",
    "Taotlemine:",
    formatList(item.application?.channels, "Puudub."),
    Array.isArray(item.application?.steps) && item.application.steps.length ? "Sammud:" : null,
    Array.isArray(item.application?.steps) && item.application.steps.length ? formatList(item.application.steps) : null,
    item.application?.deadline ? `Tähtaeg: ${item.application.deadline}` : null,
    item.application?.decisionTime ? `Otsuse aeg: ${item.application.decisionTime}` : null,
    item.application?.notes ? `Märkused: ${item.application.notes}` : null,
    "",
    "Vormid:",
    formatForms(item.forms),
    "",
    `Haldaja / teenuseosutaja: ${provider}`,
    "",
    "Kontaktid:",
    formatContacts(item.contacts),
    "",
    `Tasulisus või summa: ${pricing}`,
    "",
    "Õiguslik alus:",
    formatLegalBasis(item.legalBasis),
    "",
    "Allikad:",
    sourceLines
  ].filter(Boolean).join("\n");
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function resolveDatasetPaths(inputArg, slugArg) {
  const input = path.isAbsolute(inputArg) ? inputArg : path.resolve(rootDir, inputArg);
  let stats = null;
  try {
    stats = await fs.stat(input);
  } catch {
    stats = null;
  }

  let dirPath = input;
  let slug = slugArg || "";
  if (stats?.isDirectory()) {
    dirPath = input;
    if (!slug) {
      const names = await fs.readdir(dirPath);
      const candidates = names.filter((name) => name.endsWith(".sources.json")).map((name) => name.slice(0, -13));
      if (candidates.length !== 1) throw new Error("Pass --slug when directory contains zero or multiple datasets");
      slug = candidates[0];
    }
  } else if (stats?.isFile()) {
    dirPath = path.dirname(input);
    const fileName = path.basename(input);
    if (!slug) {
      if (fileName.endsWith(".sources.json")) slug = fileName.slice(0, -13);
      else if (fileName.endsWith(".meta.json")) slug = fileName.slice(0, -10);
      else if (fileName.endsWith(".rag.md")) slug = fileName.slice(0, -7);
      else if (fileName.endsWith(".json")) slug = fileName.slice(0, -5);
      else throw new Error(`Cannot derive slug from ${fileName}`);
    }
  } else {
    dirPath = path.dirname(input);
    slug = slug || path.basename(input);
  }

  return {
    dirPath,
    slug,
    sourcesPath: path.join(dirPath, `${slug}.sources.json`),
    datasetPath: path.join(dirPath, `${slug}.json`),
    metaPath: path.join(dirPath, `${slug}.meta.json`),
    ragPath: path.join(dirPath, `${slug}.rag.md`)
  };
}

function parseArgs(argv) {
  let slug = "";
  let skipValidate = false;
  let bundleOnly = false;
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = String(argv[index] || "");
    if (!arg) continue;
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--slug") {
      slug = String(argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (arg === "--skip-validate") {
      skipValidate = true;
      continue;
    }
    if (arg === "--bundle-only") {
      bundleOnly = true;
      continue;
    }
    positional.push(arg);
  }

  if (!positional.length) {
    usage();
    process.exit(1);
  }

  return {
    input: positional[0],
    slug,
    skipValidate,
    bundleOnly
  };
}

async function ingestText(baseUrl, payload) {
  const response = await fetch(`${baseUrl}/ingest/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": RAG_KEY,
      "X-Observability-Route": "script/ingest-kov-rag",
      "X-Observability-Stage": "rag_ingest"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.detail || data?.message || `RAG ingest failed with HTTP ${response.status}`);
  }
  return data;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!RAG_KEY) throw new Error("RAG_SERVICE_API_KEY or RAG_API_KEY is missing");

  const baseUrl = normalizeBaseFromHost(RAW_RAG_HOST);
  const paths = await resolveDatasetPaths(args.input, args.slug);

  if (!args.skipValidate) {
    const validation = spawnSync(process.execPath, [path.join(rootDir, "scripts", "validate-kov-rag.mjs"), paths.dirPath, "--slug", paths.slug], {
      stdio: "inherit"
    });
    if (validation.status !== 0) {
      process.exit(validation.status ?? 1);
    }
  }

  const [sources, dataset, meta, ragText] = await Promise.all([
    readJson(paths.sourcesPath),
    readJson(paths.datasetPath),
    readJson(paths.metaPath),
    fs.readFile(paths.ragPath, "utf8")
  ]);

  const sourceMap = new Map((sources.sources || []).map((entry) => [entry.key, entry]));
  const unionAudience = [...new Set((dataset.items || []).flatMap((item) => Array.isArray(item.audience) ? item.audience : []))];
  const bundleDocId = `kov::${paths.slug}::bundle`;

  const bundleResult = await ingestText(baseUrl, {
    doc_id: bundleDocId,
    text: ragText,
    metadata: {
      title: meta.title,
      description: `${meta.municipality} sotsiaalteenused, sotsiaaltoetused ja ressursid`,
      audience: deriveAudienceStorage(unionAudience),
      audiences: unionAudience,
      tags: meta.tags || [],
      language: meta.language || "et",
      collection_id: meta.collection_id || "kov_services",
      country: meta.country || "EE",
      county: meta.county,
      jurisdiction_level: meta.jurisdiction_level || "MUNICIPALITY",
      municipality_name: meta.municipality_name || meta.municipality,
      district_name: meta.district_name ?? null,
      checked_at: meta.checkedAt,
      item_type: "bundle",
      content_status: "active",
      source_keys: (sources.sources || []).map((entry) => entry.key),
      source_urls: (sources.sources || []).map((entry) => entry.url),
      source_register_file: path.basename(paths.sourcesPath),
      source_count: Array.isArray(sources.sources) ? sources.sources.length : 0,
      source_type: "kov_dataset_bundle",
      source_path: paths.ragPath,
      source_url: sources.indexUrl,
      fileName: path.basename(paths.ragPath),
      mimeType: "text/markdown"
    }
  });

  let itemCount = 0;
  let chunkCount = Number(bundleResult?.inserted || 0);
  if (!args.bundleOnly) {
    for (const item of dataset.items || []) {
      const itemText = buildItemText(item, sourceMap);
      const itemDocId = `kov::${paths.slug}::item::${item.id}`;
      const result = await ingestText(baseUrl, {
        doc_id: itemDocId,
        text: itemText,
        metadata: {
          title: item.title,
          description: item.summary,
          section: item.itemType === "service" ? "Teenused" : item.itemType === "benefit" ? "Toetused" : "Ressursid",
          audience: deriveAudienceStorage(item.audience),
          audiences: Array.isArray(item.audience) ? item.audience : [],
          tags: [...new Set([...(meta.tags || []), item.itemType, item.resourceType].filter(Boolean))],
          language: meta.language || "et",
          collection_id: meta.collection_id || "kov_services",
          country: meta.country || "EE",
          county: meta.county,
          jurisdiction_level: meta.jurisdiction_level || "MUNICIPALITY",
          municipality_name: meta.municipality_name || meta.municipality,
          district_name: meta.district_name ?? null,
          checked_at: dataset.checkedAt,
          item_type: item.itemType,
          content_status: item.status,
          resource_type: item.resourceType,
          source_keys: item.sourceKeys || [],
          source_urls: item.sourceUrls || [],
          source_register_file: path.basename(paths.sourcesPath),
          source_count: Array.isArray(sources.sources) ? sources.sources.length : 0,
          administering_body: item.provider && isObject(item.provider) ? item.provider.name || null : null,
          source_type: "kov_dataset_item",
          source_url: Array.isArray(item.sourceUrls) && item.sourceUrls.length ? item.sourceUrls[0] : sources.indexUrl,
          mimeType: "text/markdown"
        }
      });
      itemCount += 1;
      chunkCount += Number(result?.inserted || 0);
    }
  }

  console.log(`[rag:ingest:kov] OK: ${paths.slug}`);
  console.log(`  - bundle doc: ${bundleDocId}`);
  console.log(`  - item docs: ${itemCount}`);
  console.log(`  - inserted chunks: ${chunkCount}`);
}

main().catch((error) => {
  console.error("[rag:ingest:kov] Failed:", error.message);
  process.exit(1);
});
