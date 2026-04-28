const PACKAGE_SECTION_KEYS = [
  "description",
  "eligibility",
  "application",
  "forms",
  "contacts",
  "legal_basis",
  "fees",
  "deadlines"
];

const JOURNAL_SOURCE_TYPES = new Set(["journal_article", "article"]);
const LEGAL_BASIS_SOURCE_TYPES = new Set(["kov_regulation", "municipal_regulation"]);
const FORM_SOURCE_TYPES = new Set(["application_form", "web_form", "pdf_form", "official_form"]);
const CONTACT_SOURCE_TYPES = new Set(["official_contact", "contact_page"]);
const SERVICE_SOURCE_TYPES = new Set([
  "kov_service",
  "kov_service_info",
  "municipality_service",
  "municipality_web",
  "kov_web"
]);

const GENERAL_SOCIAL_ASSISTANCE_REGULATION_TERMS = [
  "sotsiaalhoolekandelise abi andmise kord",
  "sotsiaalhoolekandelise abi",
  "sotsiaalabi andmise kord",
  "sotsiaalhoolekande kord"
];

function clean(value) {
  const text = String(value || "").trim();
  return text || null;
}

function cleanArray(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  if (typeof value === "string") return value.split(/[,;]/).map(clean).filter(Boolean);
  return [];
}

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function sourceId(entry = {}, index = 0) {
  return clean(
    entry.source_id ||
    entry.id ||
    entry.sourceId ||
    entry.raw_source_id ||
    entry.chunkId ||
    entry.chunk_id ||
    entry.canonicalItemId ||
    entry.canonical_item_id ||
    `source-${index}`
  );
}

function sourceType(entry = {}) {
  return clean(entry.source_type || entry.sourceType);
}

function itemType(entry = {}) {
  return clean(entry.item_type || entry.itemType);
}

function canonicalItemId(entry = {}) {
  return clean(entry.canonical_item_id || entry.canonicalItemId);
}

function municipalityId(entry = {}) {
  return clean(entry.municipality_id || entry.municipalityId);
}

function municipalityName(entry = {}) {
  return clean(entry.municipality_name || entry.municipalityName);
}

function lastChecked(entry = {}) {
  return clean(entry.last_checked || entry.lastChecked);
}

function sourceStatus(entry = {}) {
  return clean(entry.source_status || entry.sourceStatus);
}

function historicalFlag(entry = {}) {
  if (entry.historical === true) return true;
  if (entry.is_current_version === false || entry.isCurrentVersion === false) return true;
  return undefined;
}

function currentAwareSourceStatus(entry = {}) {
  return sourceStatus(entry) ||
    (entry.is_current_version === true || entry.isCurrentVersion === true ? "active" : null);
}

function sectionHints(entry = {}) {
  return cleanArray(entry.sections_present || entry.sectionsPresent);
}

function relatedCanonicalItemIds(entry = {}) {
  return cleanArray(
    entry.related_canonical_item_ids ||
    entry.relatedCanonicalItemIds ||
    entry.related_to ||
    entry.relatedTo
  );
}

function explicitEvidenceStrength(entry = {}) {
  return clean(entry.evidence_strength || entry.evidenceStrength);
}

function hasSourceType(entry, set) {
  const type = sourceType(entry);
  return type ? set.has(type) : false;
}

function packageTypeFromItem(type) {
  if (type === "benefit" || type === "toetus") return "kov_benefit";
  if (type === "form") return "kov_form";
  if (type === "contact") return "kov_contact";
  return "kov_service";
}

function packageIdFor(muniId, canonicalId) {
  const muniSlug = slug(muniId);
  const itemSlug = slug(canonicalId);
  const base = muniSlug && itemSlug && !itemSlug.startsWith(`${muniSlug}_`)
    ? `${muniSlug}_${itemSlug}`
    : itemSlug || muniSlug || "source_package";
  return `${base}_package`;
}

function seedPackageSectionsForEntry(entry = {}) {
  if (hasSourceType(entry, JOURNAL_SOURCE_TYPES)) return [];
  if (hasSourceType(entry, LEGAL_BASIS_SOURCE_TYPES)) return [];
  if (hasSourceType(entry, FORM_SOURCE_TYPES)) return [];
  if (hasSourceType(entry, CONTACT_SOURCE_TYPES)) return [];
  const type = itemType(entry);
  if (hasSourceType(entry, SERVICE_SOURCE_TYPES) || type === "service" || type === "benefit" || type === "toetus") {
    const hints = sectionHints(entry).filter(section => PACKAGE_SECTION_KEYS.includes(section));
    if (hints.length) return hints.filter(section => !["legal_basis", "forms", "contacts", "fees", "deadlines"].includes(section));
    return ["description", "eligibility", "application"];
  }
  return [];
}

function isServicePackageEntry(entry = {}) {
  const type = itemType(entry);
  return hasSourceType(entry, SERVICE_SOURCE_TYPES) || type === "service" || type === "benefit" || type === "toetus";
}

function associationSectionsForEntry(entry = {}, pkg = {}) {
  if (!pkg?.canonical_item_id || !pkg?.municipality_id) return [];
  if (municipalityId(entry) !== pkg.municipality_id) return [];
  if (hasSourceType(entry, JOURNAL_SOURCE_TYPES)) return [];

  const directCanonicalMatch = canonicalItemId(entry) === pkg.canonical_item_id;
  const relatedMatch = relatedCanonicalItemIds(entry).includes(pkg.canonical_item_id);
  const generalKovRegulation = isGeneralKovRegulation(entry);

  if (hasSourceType(entry, FORM_SOURCE_TYPES) || itemType(entry) === "form") {
    return directCanonicalMatch || relatedMatch ? ["forms"] : [];
  }
  if (hasSourceType(entry, CONTACT_SOURCE_TYPES) || itemType(entry) === "contact") {
    return directCanonicalMatch || relatedMatch ? ["contacts"] : [];
  }
  if (hasSourceType(entry, LEGAL_BASIS_SOURCE_TYPES)) {
    if (directCanonicalMatch || relatedMatch) return ["legal_basis", "fees", "deadlines"];
    if (generalKovRegulation) return ["legal_basis", "fees", "deadlines"];
  }
  return [];
}

function isGeneralKovRegulation(entry = {}) {
  if (!hasSourceType(entry, LEGAL_BASIS_SOURCE_TYPES)) return false;
  const text = [
    entry.title,
    entry.act_title,
    entry.actTitle,
    entry.collection_id,
    entry.collectionId
  ].map(value => String(value || "").toLowerCase()).join(" ");
  return GENERAL_SOCIAL_ASSISTANCE_REGULATION_TERMS.some(term => text.includes(term)) ||
    text.includes("kov_regulations");
}

function isPartialAssociation(entry = {}, pkg = {}, section) {
  if (!hasSourceType(entry, LEGAL_BASIS_SOURCE_TYPES)) return false;
  if (canonicalItemId(entry) === pkg.canonical_item_id) return false;
  if (relatedCanonicalItemIds(entry).includes(pkg.canonical_item_id)) return false;
  return section === "legal_basis" || section === "fees" || section === "deadlines";
}

function safeSectionSource(entry = {}, index = 0) {
  return Object.fromEntries(Object.entries({
    source_id: sourceId(entry, index),
    title: clean(entry.title),
    source_type: sourceType(entry),
    collection_id: clean(entry.collection_id || entry.collectionId),
    item_type: itemType(entry),
    resource_type: clean(entry.resource_type || entry.resourceType),
    municipality_id: municipalityId(entry),
    municipality_name: municipalityName(entry),
    source_status: currentAwareSourceStatus(entry),
    last_checked: lastChecked(entry),
    historical: historicalFlag(entry),
    evidence_strength: explicitEvidenceStrength(entry)
  }).filter(([, value]) => value !== null && typeof value !== "undefined"));
}

function buildEmptySections() {
  return Object.fromEntries(PACKAGE_SECTION_KEYS.map(key => [key, []]));
}

function sectionFilledCount(sections = {}) {
  return PACKAGE_SECTION_KEYS.filter(key => Array.isArray(sections[key]) && sections[key].length).length;
}

function confidenceForPackage(sections = {}) {
  const count = sectionFilledCount(sections);
  if (count >= 5) return "high";
  if (count >= 2) return "medium";
  return "low";
}

function latestDate(values = []) {
  const cleaned = values.map(clean).filter(Boolean).sort();
  return cleaned.length ? cleaned[cleaned.length - 1] : null;
}

function sectionCounts(sections = {}) {
  return Object.fromEntries(PACKAGE_SECTION_KEYS.map(key => [
    key,
    Array.isArray(sections[key]) ? sections[key].length : 0
  ]));
}

export function buildRuntimeSourcePackages(entries = []) {
  if (!Array.isArray(entries) || !entries.length) return [];

  const packages = new Map();
  entries.forEach((entry, index) => {
    const canonicalId = canonicalItemId(entry);
    const muniId = municipalityId(entry);
    const sections = seedPackageSectionsForEntry(entry);
    if (!canonicalId || !muniId || !sections.length) return;

    const key = `${muniId}::${canonicalId}`;
    if (!packages.has(key)) {
      const type = itemType(entry);
      packages.set(key, {
        package_id: packageIdFor(muniId, canonicalId),
        canonical_item_id: canonicalId,
        package_type: packageTypeFromItem(type),
        title: clean(entry.title) || canonicalId,
        municipality_id: muniId,
        municipality_name: municipalityName(entry) || undefined,
        sections: buildEmptySections(),
        source_ids: [],
        last_checked_values: [],
        confidence: "low",
        missing_sections: []
      });
    }

    const pkg = packages.get(key);
    if (!isServicePackageEntry(entry)) return;
    const id = sourceId(entry, index);
    const safeSource = safeSectionSource(entry, index);
    if (id && !pkg.source_ids.includes(id)) pkg.source_ids.push(id);
    if (lastChecked(entry)) pkg.last_checked_values.push(lastChecked(entry));
    if (!pkg.title && entry.title) pkg.title = clean(entry.title);
    for (const section of sections) {
      if (!Array.isArray(pkg.sections[section])) continue;
      if (!pkg.sections[section].some(item => item.source_id === safeSource.source_id)) {
        pkg.sections[section].push(safeSource);
      }
    }
  });

  entries.forEach((entry, index) => {
    const id = sourceId(entry, index);
    if (!id) return;
    for (const pkg of packages.values()) {
      const sections = associationSectionsForEntry(entry, pkg);
      if (!sections.length) continue;
      const safeSource = safeSectionSource({
        ...entry,
        evidence_strength: isPartialAssociation(entry, pkg, sections[0])
          ? "partial"
          : explicitEvidenceStrength(entry)
      }, index);
      if (lastChecked(entry)) pkg.last_checked_values.push(lastChecked(entry));
      if (!pkg.source_ids.includes(id)) pkg.source_ids.push(id);
      for (const section of sections) {
        if (!Array.isArray(pkg.sections[section])) continue;
        const sourceForSection = isPartialAssociation(entry, pkg, section)
          ? { ...safeSource, evidence_strength: "partial" }
          : safeSource;
        if (!pkg.sections[section].some(item => item.source_id === sourceForSection.source_id)) {
          pkg.sections[section].push(sourceForSection);
        }
      }
    }
  });

  return Array.from(packages.values()).map(pkg => {
    const last = latestDate(pkg.last_checked_values);
    const missing = PACKAGE_SECTION_KEYS.filter(key => !pkg.sections[key]?.length);
    return Object.fromEntries(Object.entries({
      package_id: pkg.package_id,
      canonical_item_id: pkg.canonical_item_id,
      package_type: pkg.package_type,
      title: pkg.title,
      municipality_id: pkg.municipality_id,
      municipality_name: pkg.municipality_name,
      sections: pkg.sections,
      section_counts: sectionCounts(pkg.sections),
      source_ids: pkg.source_ids,
      last_checked: last || undefined,
      confidence: confidenceForPackage(pkg.sections),
      missing_sections: missing
    }).filter(([, value]) => typeof value !== "undefined"));
  }).sort((a, b) => String(a.package_id).localeCompare(String(b.package_id)));
}

export function sourcePackageSectionKeys() {
  return [...PACKAGE_SECTION_KEYS];
}
