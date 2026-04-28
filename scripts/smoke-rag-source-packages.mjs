#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

function usage() {
  return [
    "Usage:",
    "  npm run rag:smoke:source-packages",
    "  npm run rag:smoke:source-packages -- --base-url https://sotsiaal.ai",
    "",
    "Environment:",
    "  SOTSIAALAI_SMOKE_BASE_URL=https://sotsiaal.ai",
    "  SOTSIAALAI_SMOKE_COOKIE=\"...\"",
    "  SOTSIAALAI_SMOKE_BEARER=\"...\"",
    "  SOTSIAALAI_SMOKE_ROLE=SOCIAL_WORKER",
    "",
    "Checks that a live chat/RAG flow exposes safe rag_trace.source_packages for a Jogeva KOV service question."
  ].join("\n");
}

function parseArgs(argv = []) {
  const args = {
    baseUrl: process.env.SOTSIAALAI_SMOKE_BASE_URL || process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL,
    cookie: process.env.SOTSIAALAI_SMOKE_COOKIE || process.env.SMOKE_COOKIE || "",
    bearer: process.env.SOTSIAALAI_SMOKE_BEARER || process.env.SMOKE_BEARER || "",
    role: process.env.SOTSIAALAI_SMOKE_ROLE || "SOCIAL_WORKER",
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--base-url") args.baseUrl = argv[++index] || args.baseUrl;
    else if (arg === "--cookie") args.cookie = argv[++index] || "";
    else if (arg === "--bearer") args.bearer = argv[++index] || "";
    else if (arg === "--role") args.role = argv[++index] || args.role;
    else throw new Error(`Unknown option: ${arg}`);
  }

  return args;
}

function endpoint(baseUrl = "", path = "") {
  return `${String(baseUrl || "").replace(/\/+$/u, "")}${path}`;
}

function authHeaders(args, json = false) {
  const out = {};
  if (json) out["Content-Type"] = "application/json";
  if (args.cookie) out.Cookie = args.cookie;
  if (args.bearer) out.Authorization = `Bearer ${args.bearer}`;
  return out;
}

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJsonResponse(res, label) {
  const raw = await res.text();
  assertCondition(res.ok, `${label}: HTTP ${res.status} ${raw.slice(0, 300)}`);
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`${label}: expected JSON response`);
  }
}

async function postChat(args) {
  const res = await fetch(endpoint(args.baseUrl, "/api/chat"), {
    method: "POST",
    headers: authHeaders(args, true),
    body: JSON.stringify({
      message: "Jõgeva vald koduteenus",
      history: [],
      role: args.role,
      persist: false,
      uiLocale: "et",
      chatMode: "rag",
      forceSources: true
    })
  });
  return readJsonResponse(res, "source_package_chat");
}

function sourcePackages(payload = {}) {
  const trace = payload?.rag_trace && typeof payload.rag_trace === "object" ? payload.rag_trace : {};
  if (Array.isArray(trace.source_packages)) return trace.source_packages;
  if (Array.isArray(trace.sourcePackages)) return trace.sourcePackages;
  return [];
}

function sectionCounts(pkg = {}) {
  if (pkg.section_counts && typeof pkg.section_counts === "object") return pkg.section_counts;
  const sections = pkg.sections && typeof pkg.sections === "object" ? pkg.sections : {};
  return Object.fromEntries(Object.entries(sections).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
}

function sections(pkg = {}) {
  return pkg.sections && typeof pkg.sections === "object" ? pkg.sections : {};
}

function summarizePackage(pkg = {}) {
  return {
    package_id: pkg.package_id || null,
    canonical_item_id: pkg.canonical_item_id || null,
    package_type: pkg.package_type || null,
    municipality_id: pkg.municipality_id || null,
    section_counts: sectionCounts(pkg),
    missing_sections: Array.isArray(pkg.missing_sections) ? pkg.missing_sections : [],
    source_ids: Array.isArray(pkg.source_ids) ? pkg.source_ids : []
  };
}

function assertSafeTrace(packages = []) {
  const serialized = JSON.stringify(packages);
  const forbiddenKeys = [
    "evidenceText",
    "evidence_text",
    "body_preview",
    "model_context",
    "prompt",
    "userMessage",
    "message"
  ];
  for (const key of forbiddenKeys) {
    assertCondition(!serialized.includes(key), `source_packages: unsafe trace key ${key} must not appear`);
  }
}

function assertPackageContract(packages = []) {
  assertCondition(packages.length > 0, "source_packages: at least one package must be present");
  const jogeva = packages.find(pkg => pkg?.municipality_id === "jogeva_vald");
  assertCondition(jogeva, "source_packages: expected a jogeva_vald package");
  assertCondition(jogeva.canonical_item_id, "source_packages: expected canonical_item_id");
  assertCondition(jogeva.section_counts || jogeva.sections, "source_packages: expected section_counts or sections summary");
  assertCondition(Array.isArray(jogeva.missing_sections), "source_packages: missing_sections must be an array");

  for (const pkg of packages) {
    assertCondition(pkg.municipality_id === "jogeva_vald", `source_packages: unexpected municipality ${pkg.municipality_id || "(missing)"}`);
    const pkgSections = sections(pkg);
    for (const sectionName of ["legal_basis", "forms", "contacts"]) {
      const list = Array.isArray(pkgSections[sectionName]) ? pkgSections[sectionName] : [];
      for (const source of list) {
        assertCondition(source?.municipality_id === undefined || source.municipality_id === "jogeva_vald", `${sectionName}: wrong municipality source`);
        assertCondition(source?.source_type !== "journal_article", `${sectionName}: journal_article must not be current evidence`);
      }
    }
  }

  assertSafeTrace(packages);
  return summarizePackage(jogeva);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  if (!args.cookie && !args.bearer) {
    console.log(JSON.stringify({
      ok: true,
      skipped: true,
      reason: "missing_auth",
      note: "Set SOTSIAALAI_SMOKE_COOKIE or SOTSIAALAI_SMOKE_BEARER to run the live source package smoke."
    }, null, 2));
    return;
  }

  const payload = await postChat(args);
  const packages = sourcePackages(payload);
  const summary = assertPackageContract(packages);
  console.log(JSON.stringify({
    ok: true,
    skipped: false,
    package_count: packages.length,
    package: summary
  }, null, 2));
}

main().catch((error) => {
  console.error(`[rag:smoke:source-packages] ${error?.message || String(error)}`);
  process.exitCode = 1;
});
