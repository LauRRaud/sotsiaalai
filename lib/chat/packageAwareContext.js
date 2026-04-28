const HIGH_RISK_MISSING_SECTIONS = ["forms", "contacts", "legal_basis", "fees", "deadlines"];
const SECTION_LABELS_ET = {
  description: "kirjeldus",
  eligibility: "tingimused/sihtrühm",
  application: "taotlemine",
  forms: "vormid",
  contacts: "kontaktid",
  legal_basis: "õiguslik alus",
  fees: "tasud",
  deadlines: "tähtajad"
};

function clean(value) {
  const text = String(value || "").trim();
  return text || null;
}

function unique(values = []) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function normalizeSections(sections = {}) {
  return sections && typeof sections === "object" ? sections : {};
}

function packageSourceIds(pkg = {}) {
  const ids = new Set(Array.isArray(pkg.source_ids) ? pkg.source_ids.map(clean).filter(Boolean) : []);
  for (const list of Object.values(normalizeSections(pkg.sections))) {
    if (!Array.isArray(list)) continue;
    for (const source of list) {
      const id = clean(source?.source_id);
      if (id) ids.add(id);
    }
  }
  return [...ids];
}

function sectionSourceLines(section, sources = []) {
  if (!Array.isArray(sources) || !sources.length) return [`- ${SECTION_LABELS_ET[section] || section}: missing`];
  return sources.slice(0, 6).map(source => {
    const parts = [
      `source_id=${clean(source.source_id) || "unknown"}`,
      clean(source.title),
      clean(source.source_type) ? `source_type=${clean(source.source_type)}` : "",
      clean(source.resource_type) ? `resource_type=${clean(source.resource_type)}` : ""
    ].filter(Boolean);
    return `- ${SECTION_LABELS_ET[section] || section}: ${parts.join("; ")}`;
  });
}

function sectionCounts(pkg = {}) {
  if (pkg.section_counts && typeof pkg.section_counts === "object") return pkg.section_counts;
  const sections = normalizeSections(pkg.sections);
  return Object.fromEntries(Object.entries(sections).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
}

export function buildPackageAwareContext(sourcePackages = [], options = {}) {
  const packages = (Array.isArray(sourcePackages) ? sourcePackages : [])
    .filter(pkg => pkg && typeof pkg === "object")
    .filter(pkg => clean(pkg.package_id) && clean(pkg.canonical_item_id) && clean(pkg.municipality_id))
    .slice(0, Number.isFinite(Number(options.maxPackages)) ? Math.max(1, Number(options.maxPackages)) : 3);

  if (!packages.length) {
    return {
      used: false,
      contextText: "",
      usedPackageIds: [],
      missingSectionsUsed: [],
      packageDisplayedSourceIds: [],
      packageAnswerFlags: []
    };
  }

  const blocks = [];
  const usedPackageIds = [];
  const missingSections = new Set();
  const displayedSourceIds = new Set();
  const answerFlags = new Set();

  packages.forEach((pkg, index) => {
    usedPackageIds.push(pkg.package_id);
    for (const id of packageSourceIds(pkg)) displayedSourceIds.add(id);
    const missing = unique(pkg.missing_sections || []).filter(section => HIGH_RISK_MISSING_SECTIONS.includes(section));
    for (const section of missing) {
      missingSections.add(section);
      answerFlags.add(`missing_${section}`);
    }

    const sections = normalizeSections(pkg.sections);
    const counts = sectionCounts(pkg);
    const lines = [
      `SOURCE PACKAGE ${index + 1}: ${clean(pkg.title) || clean(pkg.canonical_item_id) || "KOV service"}`,
      `package_id=${pkg.package_id}`,
      `canonical_item_id=${pkg.canonical_item_id}`,
      `package_type=${clean(pkg.package_type) || "unknown"}`,
      `municipality_id=${pkg.municipality_id}`,
      pkg.municipality_name ? `municipality_name=${pkg.municipality_name}` : "",
      pkg.confidence ? `confidence=${pkg.confidence}` : "",
      `missing_sections=${missing.length ? missing.join(",") : "none"}`,
      `section_counts=${Object.entries(counts).map(([key, value]) => `${key}:${value}`).join(",")}`,
      "",
      "Confirmed package sections:"
    ].filter(line => typeof line === "string");

    for (const section of ["description", "eligibility", "application", "forms", "contacts", "legal_basis", "fees", "deadlines"]) {
      lines.push(...sectionSourceLines(section, sections[section]));
    }
    blocks.push(lines.join("\n"));
  });

  const guardrails = [
    "PACKAGE-AWARE ANSWERING RULES:",
    "- Kasuta SourcePackage'i esmase struktuurina KOV teenuse või toetuse vastuses.",
    "- Ära leiuta puuduvat vormi, kontakti, tasu, tähtaega ega õiguslikku alust.",
    "- Kui forms, contacts, legal_basis, fees või deadlines on missing, ütle seda loomulikult siis, kui kasutaja küsib taotlemist, vormi, kontakti, õiguslikku alust, tasu või tähtaega.",
    "- journal_article võib olla taust, aga mitte current teenuse, vormi, kontakti, tasu, tähtaja või õigusliku aluse kinnitus.",
    "- Kasutajale kuvatavad allikad peavad tulema package'i kinnitatud source_id väärtustest."
  ].join("\n");

  return {
    used: true,
    contextText: [guardrails, ...blocks].join("\n\n"),
    usedPackageIds,
    missingSectionsUsed: [...missingSections].sort(),
    packageDisplayedSourceIds: [...displayedSourceIds].sort(),
    packageAnswerFlags: [...answerFlags].sort()
  };
}
