#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

function usage() {
  return [
    "Usage:",
    "  npm run rag:smoke:source-packages",
    "  npm run rag:smoke:source-packages -- --persist",
    "  npm run rag:smoke:source-packages -- --answering",
    "  npm run rag:smoke:source-packages -- --answering --persist --attribution",
    "  npm run rag:smoke:source-packages -- --base-url https://sotsiaal.ai",
    "",
    "Environment:",
    "  SOTSIAALAI_SMOKE_BASE_URL=https://sotsiaal.ai",
    "  SOTSIAALAI_SMOKE_COOKIE=\"...\"",
    "  SOTSIAALAI_SMOKE_BEARER=\"...\"",
    "  SOTSIAALAI_SMOKE_ROLE=SOCIAL_WORKER",
    "  DATABASE_URL=postgresql://...",
    "",
    "Checks that a live chat/RAG flow exposes safe rag_trace.source_packages for a Jogeva KOV service question.",
    "With --persist, or when DATABASE_URL is present, also checks SourcePackageSnapshot DB persistence.",
    "With --attribution, also checks deterministic section-level attribution for package-aware answers."
  ].join("\n");
}

function parseArgs(argv = []) {
  const args = {
    baseUrl: process.env.SOTSIAALAI_SMOKE_BASE_URL || process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL,
    cookie: process.env.SOTSIAALAI_SMOKE_COOKIE || process.env.SMOKE_COOKIE || "",
    bearer: process.env.SOTSIAALAI_SMOKE_BEARER || process.env.SMOKE_BEARER || "",
    role: process.env.SOTSIAALAI_SMOKE_ROLE || "SOCIAL_WORKER",
    persist: false,
    noPersist: false,
    answering: false,
    attribution: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--base-url") args.baseUrl = argv[++index] || args.baseUrl;
    else if (arg === "--cookie") args.cookie = argv[++index] || "";
    else if (arg === "--bearer") args.bearer = argv[++index] || "";
    else if (arg === "--role") args.role = argv[++index] || args.role;
    else if (arg === "--persist") args.persist = true;
    else if (arg === "--no-persist") args.noPersist = true;
    else if (arg === "--answering") args.answering = true;
    else if (arg === "--attribution") args.attribution = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  args.checkPersistence = !args.noPersist && (args.persist || !!process.env.DATABASE_URL);
  if (args.attribution) args.answering = true;
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
      message: args.answering
        ? "Kuidas Jõgeva vallas koduteenust taotleda ja kust vormi või kontakti leiab?"
        : "Jõgeva vald koduteenus",
      history: [],
      role: args.role,
      persist: args.checkPersistence === true,
      uiLocale: "et",
      chatMode: "rag",
      forceSources: true
    })
  });
  return readJsonResponse(res, "source_package_chat");
}

async function loadPersistenceTools() {
  try {
    const [{ prisma }, { buildSourcePackageSnapshots }] = await Promise.all([
      import("../lib/prisma.js"),
      import("../lib/rag/sourcePackageSnapshots.js")
    ]);
    const delegate = prisma?.sourcePackageSnapshot;
    if (!delegate) {
      return {
        ok: false,
        reason: "sourcePackageSnapshot delegate unavailable"
      };
    }
    return {
      ok: true,
      prisma,
      delegate,
      buildSourcePackageSnapshots
    };
  } catch (error) {
    return {
      ok: false,
      reason: error?.message || String(error)
    };
  }
}

function sourcePackages(payload = {}) {
  const trace = payload?.rag_trace && typeof payload.rag_trace === "object" ? payload.rag_trace : {};
  if (Array.isArray(trace.source_packages)) return trace.source_packages;
  if (Array.isArray(trace.sourcePackages)) return trace.sourcePackages;
  return [];
}

function ragTrace(payload = {}) {
  return payload?.rag_trace && typeof payload.rag_trace === "object" ? payload.rag_trace : {};
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

function assertSafeSnapshots(rows = []) {
  const serialized = JSON.stringify(rows.map(row => ({
    sectionSummary: row.sectionSummary,
    sourceMembership: row.sourceMembership
  })));
  const forbiddenValues = [
    "evidenceText",
    "evidence_text",
    "body_preview",
    "model_context",
    "prompt",
    "userMessage",
    "message",
    "Jõgeva vald koduteenus"
  ];
  for (const value of forbiddenValues) {
    assertCondition(!serialized.includes(value), `SourcePackageSnapshot persisted unsafe value: ${value}`);
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

function assertPackageAwareAnswering(payload = {}, packages = []) {
  const trace = ragTrace(payload);
  assertCondition(trace.package_aware_answering_used === true, "package-aware answering must be used");
  assertCondition(Array.isArray(trace.used_package_ids) && trace.used_package_ids.length > 0, "used_package_ids must not be empty");
  assertCondition(Array.isArray(trace.missing_sections_used), "missing_sections_used must be present");
  assertCondition(Array.isArray(trace.package_displayed_source_ids), "package_displayed_source_ids must be present");

  const packageSourceIds = new Set(packages.flatMap(pkg => Array.isArray(pkg.source_ids) ? pkg.source_ids : []));
  const displayed = Array.isArray(payload.displayed_sources) ? payload.displayed_sources : [];
  for (const source of displayed) {
    const id = String(source?.id || source?.source_id || source?.sourceId || "").trim();
    assertCondition(!id || packageSourceIds.has(id), `displayed source ${id} is not package-confirmed`);
  }

  const reply = String(payload.reply || payload.message || payload.text || "").toLowerCase();
  if (trace.missing_sections_used.includes("forms")) {
    assertCondition(!/(taotlusvorm on olemas|vorm on olemas|laadi vorm)/i.test(reply), "reply must not claim a missing form exists");
  }
  if (trace.missing_sections_used.includes("contacts")) {
    assertCondition(!/(telefon\s*:|e-post\s*:|@)/i.test(reply), "reply must not invent missing contact details");
  }
}

const FORM_SECTION_SOURCE_TYPES = new Set(["application_form", "web_form", "pdf_form", "form"]);
const CONTACT_SECTION_SOURCE_TYPES = new Set(["official_contact", "contact_page", "contact"]);

function sourceTypeForSmoke(source = {}) {
  return String(
    source.source_type ||
    source.sourceType ||
    source.resource_type ||
    source.resourceType ||
    source.item_type ||
    source.itemType ||
    ""
  ).trim();
}

function packageSectionSources(packages = [], sectionName = "") {
  return packages.flatMap(pkg => {
    const pkgSections = sections(pkg);
    return Array.isArray(pkgSections[sectionName]) ? pkgSections[sectionName] : [];
  });
}

function assertMissingSectionEntry(entry = {}, sectionName = "") {
  assertCondition(entry.evidence_strength === "missing", `${sectionName}: expected missing evidence strength`);
  assertCondition(entry.evidence_statuses.includes("missing_section"), `${sectionName}: expected missing_section status`);
  assertCondition(entry.source_ids.length === 0, `${sectionName}: missing section must not carry source_ids`);
}

function assertOptionalEvidenceSection(trace = {}, packages = [], sectionName = "", allowedSourceTypes = new Set()) {
  const entry = trace.section_attribution.find(item => item?.section === sectionName);
  assertCondition(entry, `section_attribution must include ${sectionName}`);

  if (entry.evidence_strength === "missing") {
    assertMissingSectionEntry(entry, sectionName);
    return;
  }

  assertCondition(["strong", "partial"].includes(entry.evidence_strength), `${sectionName}: expected strong or partial evidence strength`);
  assertCondition(entry.source_ids.length > 0, `${sectionName}: present section must carry source_ids`);

  const sectionSources = packageSectionSources(packages, sectionName);
  const sourceById = new Map(sectionSources.map(source => [
    String(source?.source_id || "").trim(),
    source
  ]).filter(([id]) => Boolean(id)));

  for (const id of entry.source_ids) {
    const source = sourceById.get(id);
    assertCondition(source, `${sectionName}: source ${id} is not in package ${sectionName}`);
    const type = sourceTypeForSmoke(source);
    assertCondition(allowedSourceTypes.has(type), `${sectionName}: source ${id} has unsupported type ${type || "(missing)"}`);
  }
}

function assertSectionAttribution(payload = {}, packages = []) {
  const trace = ragTrace(payload);
  assertCondition(trace.package_attribution_checked === true, "section attribution must check package attribution");
  assertCondition(Array.isArray(trace.section_attribution), "section_attribution must be an array");
  assertCondition(trace.section_attribution.length > 0, "section_attribution must not be empty");
  assertCondition(Array.isArray(trace.attribution_flags), "attribution_flags must be an array");

  for (const entry of trace.section_attribution) {
    assertCondition(Array.isArray(entry.evidence_statuses), `section_attribution ${entry.section || "(missing)"} evidence_statuses must be an array`);
    assertCondition(Array.isArray(entry.source_ids), `section_attribution ${entry.section || "(missing)"} source_ids must be an array`);
  }

  assertOptionalEvidenceSection(trace, packages, "forms", FORM_SECTION_SOURCE_TYPES);
  assertOptionalEvidenceSection(trace, packages, "contacts", CONTACT_SECTION_SOURCE_TYPES);

  const legalBasis = trace.section_attribution.find(item => item?.section === "legal_basis");
  assertCondition(legalBasis, "section_attribution must include legal_basis");
  if (legalBasis.evidence_strength === "missing") {
    assertMissingSectionEntry(legalBasis, "legal_basis");
  } else {
    assertCondition(["strong", "partial"].includes(legalBasis.evidence_strength), "legal_basis: expected strong or partial evidence strength");
    assertCondition(legalBasis.source_ids.length > 0, "legal_basis: present section must carry source_ids");
    const legalBasisSources = packageSectionSources(packages, "legal_basis");
    const legalBasisSourceIds = new Set(legalBasisSources.map(source => String(source?.source_id || "").trim()).filter(Boolean));
    const legalBasisSourceTypes = new Map(legalBasisSources.map(source => [
      String(source?.source_id || "").trim(),
      String(source?.source_type || source?.sourceType || "").trim()
    ]));
    for (const id of legalBasis.source_ids) {
      assertCondition(legalBasisSourceIds.has(id), `legal_basis: source ${id} is not in package legal_basis`);
      assertCondition(legalBasisSourceTypes.get(id) === "kov_regulation", `legal_basis: source ${id} must be kov_regulation`);
    }
  }

  for (const sectionName of ["fees", "deadlines"]) {
    const entry = trace.section_attribution.find(item => item?.section === sectionName);
    assertCondition(entry, `section_attribution must include ${sectionName}`);
    assertMissingSectionEntry(entry, sectionName);
  }

  const packageSourceIds = new Set(packages.flatMap(pkg => Array.isArray(pkg.source_ids) ? pkg.source_ids : []));
  const displayedIds = Array.isArray(trace.package_displayed_source_ids) ? trace.package_displayed_source_ids : [];
  for (const id of displayedIds) {
    assertCondition(packageSourceIds.has(id), `package_displayed_source_ids contains non-package source ${id}`);
  }

  const serialized = JSON.stringify({
    section_attribution: trace.section_attribution,
    attribution_flags: trace.attribution_flags
  });
  for (const unsafe of ["prompt", "userMessage", "model_context", "evidenceText", "evidence_text", "body_preview"]) {
    assertCondition(!serialized.includes(unsafe), `section attribution trace contains unsafe value ${unsafe}`);
  }
}

async function beforePersistenceSnapshot(args) {
  if (!args.checkPersistence) {
    return {
      checked: false,
      reason: "persistence check disabled; pass --persist or set DATABASE_URL"
    };
  }

  const tools = await loadPersistenceTools();
  if (!tools.ok) {
    return {
      checked: false,
      reason: tools.reason
    };
  }

  try {
    return {
      checked: true,
      tools,
      before: await tools.delegate.count()
    };
  } catch (error) {
    await tools.prisma?.$disconnect?.().catch(() => {});
    return {
      checked: false,
      reason: error?.message || String(error)
    };
  }
}

async function afterPersistenceSnapshot(state, packages = []) {
  if (!state?.checked) return state || { checked: false, reason: "persistence check was not initialized" };
  const { delegate, buildSourcePackageSnapshots, prisma } = state.tools;
  const expected = buildSourcePackageSnapshots(packages);
  const after = await delegate.count();

  if (!expected.length) {
    await prisma?.$disconnect?.().catch(() => {});
    return {
      checked: true,
      before: state.before,
      after,
      created_or_existing: 0,
      reason: "trace source packages did not produce snapshot identities"
    };
  }

  const matchingRows = await delegate.findMany({
    where: {
      OR: expected.map(snapshot => ({
        packageId: snapshot.packageId,
        packageHash: snapshot.packageHash
      }))
    },
    select: {
      packageId: true,
      packageHash: true,
      version: true,
      active: true,
      sectionSummary: true,
      sourceMembership: true
    }
  });

  const expectedKeys = new Set(expected.map(snapshot => `${snapshot.packageId}::${snapshot.packageHash}`));
  const matchedKeys = new Set(matchingRows.map(row => `${row.packageId}::${row.packageHash}`));
  for (const key of expectedKeys) {
    assertCondition(matchedKeys.has(key), `SourcePackageSnapshot missing expected package hash ${key}`);
  }
  for (const key of expectedKeys) {
    const duplicateCount = matchingRows.filter(row => `${row.packageId}::${row.packageHash}` === key).length;
    assertCondition(duplicateCount === 1, `SourcePackageSnapshot duplicate package hash ${key}`);
  }
  assertSafeSnapshots(matchingRows);

  await prisma?.$disconnect?.().catch(() => {});
  return {
    checked: true,
    before: state.before,
    after,
    created_or_existing: expected.length,
    package_hashes: expected.map(snapshot => ({
      package_id: snapshot.packageId,
      package_hash: snapshot.packageHash.slice(0, 12)
    }))
  };
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
      note: "Set SOTSIAALAI_SMOKE_COOKIE or SOTSIAALAI_SMOKE_BEARER to run the live source package smoke.",
      trace: {
        checked: false,
        source_packages_present: false
      },
      snapshot_persistence: {
        checked: false,
        reason: "missing_auth"
      }
    }, null, 2));
    return;
  }

  const persistenceBefore = await beforePersistenceSnapshot(args);
  const payload = await postChat(args);
  const packages = sourcePackages(payload);
  const summary = assertPackageContract(packages);
  if (args.answering) {
    assertPackageAwareAnswering(payload, packages);
  }
  if (args.attribution) {
    assertSectionAttribution(payload, packages);
  }
  const persistence = await afterPersistenceSnapshot(persistenceBefore, packages);
  const trace = ragTrace(payload);

  console.log(JSON.stringify({
    ok: true,
    skipped: false,
    package_count: packages.length,
    trace: {
      checked: true,
      source_packages_present: packages.length > 0,
      package_aware_answering_used: trace.package_aware_answering_used === true,
      used_package_ids: trace.used_package_ids || [],
      missing_sections_used: trace.missing_sections_used || [],
      package_displayed_source_ids: trace.package_displayed_source_ids || [],
      package_attribution_checked: trace.package_attribution_checked === true,
      high_risk_attribution_checked: trace.high_risk_attribution_checked === true,
      section_attribution_count: Array.isArray(trace.section_attribution) ? trace.section_attribution.length : 0,
      missing_section_attribution: Array.isArray(trace.section_attribution)
        ? trace.section_attribution
          .filter(entry => entry?.evidence_strength === "missing")
          .map(entry => ({
            section: entry.section,
            source_ids: entry.source_ids || [],
            evidence_strength: entry.evidence_strength,
            evidence_statuses: entry.evidence_statuses || []
          }))
        : []
    },
    snapshot_persistence: persistence,
    package: summary
  }, null, 2));
}

main().catch((error) => {
  console.error(`[rag:smoke:source-packages] ${error?.message || String(error)}`);
  process.exitCode = 1;
});
