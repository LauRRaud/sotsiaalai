import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const CAREER_DATA_DIR = path.resolve(process.cwd(), "components", "career");
const CLASSIFIER_FILE = path.join(
  CAREER_DATA_DIR,
  "ametite-klassifikaator-2025-03-27.xlsx"
);
const OCCUPATIONS_FILE = path.join(CAREER_DATA_DIR, "ametid.xlsx");
const LINKS_FILE = path.join(CAREER_DATA_DIR, "ametilingid.docx");

const cacheState = {
  catalog: null,
  loadingPromise: null,
};

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values = []) {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function normalizeLookupText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s/-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value = "") {
  return normalizeLookupText(value)
    .replace(/\//g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripLeadingCode(value) {
  return String(value || "")
    .replace(/^\s*\d+(?:[.\-]\d+)*\s*[:.)-]?\s*/u, "")
    .trim();
}

function decodeXmlEntities(value = "") {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/giu, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10))
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function decodeOfficeEscapes(value = "") {
  return String(value || "")
    .replace(/_x000D_/gi, "\n")
    .replace(/_x([0-9a-f]{4})_/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    );
}

function extractXmlText(fragment = "") {
  const texts = [];
  const pattern = /<[^:>]*:?t\b[^>]*>([\s\S]*?)<\/[^:>]*:?t>/giu;
  for (const match of String(fragment || "").matchAll(pattern)) {
    texts.push(decodeXmlEntities(match[1]));
  }

  return decodeOfficeEscapes(texts.join("")).replace(/\s+/g, " ").trim();
}

function findEndOfCentralDirectory(buffer) {
  const signature = 0x06054b50;
  const minimum = Math.max(0, buffer.length - 65557);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === signature) {
      return offset;
    }
  }

  throw new Error("ZIP EOCD not found");
}

function readZipEntries(buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const directoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();

  let offset = directoryOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Invalid ZIP central directory entry");
    }

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);

    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);

    entries.set(name, {
      compressionMethod,
      compressedData,
    });

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function readZipTextEntry(entries, name) {
  const entry = entries.get(name);
  if (!entry) return "";

  if (entry.compressionMethod === 0) {
    return entry.compressedData.toString("utf8");
  }

  if (entry.compressionMethod === 8) {
    return zlib.inflateRawSync(entry.compressedData).toString("utf8");
  }

  throw new Error(`Unsupported ZIP compression method: ${entry.compressionMethod}`);
}

function parseSharedStrings(xml = "") {
  return Array.from(
    String(xml || "").matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/giu),
    (match) => extractXmlText(match[1])
  );
}

function parseWorksheetRows(xml = "", sharedStrings = []) {
  const rows = [];

  for (const rowMatch of String(xml || "").matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/giu)) {
    const row = {};
    const rowXml = rowMatch[1];

    for (const cellMatch of rowXml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/giu)) {
      const attributes = cellMatch[1];
      const inner = cellMatch[2];
      const column = /\br="([A-Z]+)\d+"/u.exec(attributes)?.[1];

      if (!column) continue;

      const type = /\bt="([^"]+)"/u.exec(attributes)?.[1] || "";
      let value = "";

      if (type === "s") {
        const index = Number.parseInt(/<v>([\s\S]*?)<\/v>/u.exec(inner)?.[1] || "", 10);
        value = sharedStrings[index] || "";
      } else if (type === "inlineStr") {
        value = extractXmlText(inner);
      } else {
        const raw = /<v>([\s\S]*?)<\/v>/u.exec(inner)?.[1] || "";
        value = decodeOfficeEscapes(decodeXmlEntities(raw)).trim();
      }

      row[column] = value;
    }

    rows.push(row);
  }

  return rows;
}

function rowsToObjects(rows = []) {
  const [headerRow, ...dataRows] = toSafeArray(rows);
  if (!headerRow) return [];

  const columns = Object.keys(headerRow).sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true })
  );
  const headers = new Map(
    columns
      .map((column) => [column, coerceString(headerRow[column])])
      .filter(([, header]) => header)
  );

  return dataRows
    .map((row) =>
      Object.fromEntries(
        Array.from(headers.entries()).map(([column, header]) => [
          header,
          coerceString(row[column]) || "",
        ])
      )
    )
    .filter((row) => Object.values(row).some((value) => coerceString(value)));
}

async function readXlsxRows(filePath) {
  const buffer = await fs.readFile(filePath);
  const entries = readZipEntries(buffer);
  const sharedStrings = parseSharedStrings(
    readZipTextEntry(entries, "xl/sharedStrings.xml")
  );
  const worksheetName = Array.from(entries.keys())
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/u.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))[0];

  if (!worksheetName) {
    return [];
  }

  return rowsToObjects(
    parseWorksheetRows(readZipTextEntry(entries, worksheetName), sharedStrings)
  );
}

function parseRelationshipTargets(xml = "") {
  const relations = new Map();
  const pattern = /<Relationship\b[^>]*\bId="([^"]+)"[^>]*\bTarget="([^"]+)"[^>]*\/>/giu;

  for (const match of String(xml || "").matchAll(pattern)) {
    relations.set(match[1], decodeXmlEntities(match[2]));
  }

  return relations;
}

async function readDocxLinks(filePath) {
  const buffer = await fs.readFile(filePath);
  const entries = readZipEntries(buffer);
  const relations = parseRelationshipTargets(
    readZipTextEntry(entries, "word/_rels/document.xml.rels")
  );
  const documentXml = readZipTextEntry(entries, "word/document.xml");
  const links = [];

  const pattern = /<w:hyperlink\b[^>]*r:id="([^"]+)"[^>]*>([\s\S]*?)<\/w:hyperlink>/giu;
  for (const match of documentXml.matchAll(pattern)) {
    const relationId = match[1];
    const url = relations.get(relationId);
    const label = stripLeadingCode(extractXmlText(match[2]));
    if (!url || !label) continue;

    links.push({
      label,
      url,
      slug: url.split("/").filter(Boolean).pop() || null,
    });
  }

  return links;
}

function buildLinkLookup(links = []) {
  const byNormalizedLabel = new Map();
  const bySlug = new Map();

  for (const link of toSafeArray(links)) {
    const normalizedLabel = normalizeLookupText(link.label);
    if (normalizedLabel && !byNormalizedLabel.has(normalizedLabel)) {
      byNormalizedLabel.set(normalizedLabel, link);
    }

    const slug = coerceString(link.slug);
    if (slug && !bySlug.has(slug)) {
      bySlug.set(slug, link);
    }
  }

  return {
    byNormalizedLabel,
    bySlug,
  };
}

function createLocalOccupationRecord(detailRow = {}, classifierRow = {}, linkLookup) {
  const code = coerceString(
    detailRow["Klassifikaatori kood"] || classifierRow.code
  );
  const labelEt = coerceString(
    classifierRow["display#et"] || detailRow["Ameti nimetus"]
  );

  if (!code || !labelEt) {
    return null;
  }

  const slug = slugify(labelEt);
  const matchedLink =
    linkLookup.bySlug.get(slug) ||
    linkLookup.byNormalizedLabel.get(normalizeLookupText(labelEt)) ||
    null;

  return {
    code,
    label: labelEt,
    labels: {
      et: labelEt,
      en: coerceString(classifierRow["display#en"]),
      ru: coerceString(classifierRow["display#ru"]),
    },
    definitions: {
      et: coerceString(
        classifierRow["definition#et"] || detailRow["Töö kirjeldus"]
      ),
      en: coerceString(classifierRow["definition#en"]),
      ru: coerceString(classifierRow["definition#ru"]),
    },
    field: coerceString(detailRow["Töö erialane valdkond"]),
    group: coerceString(detailRow.Ametirühm),
    parentCode: coerceString(classifierRow.parent),
    version: coerceString(classifierRow.codeSystemVersion),
    codeSystem: coerceString(classifierRow.codeSystem),
    externalUrl: matchedLink?.url || null,
    slug: matchedLink?.slug || slug || null,
  };
}

function buildLocalOccupationCatalog(detailRows = [], classifierRows = [], links = []) {
  const classifierByCode = new Map(
    toSafeArray(classifierRows)
      .map((row) => [coerceString(row.code), row])
      .filter(([code]) => code)
  );
  const linkLookup = buildLinkLookup(links);

  const occupations = toSafeArray(detailRows)
    .map((detailRow) =>
      createLocalOccupationRecord(
        detailRow,
        classifierByCode.get(coerceString(detailRow["Klassifikaatori kood"])) || {},
        linkLookup
      )
    )
    .filter(Boolean);

  const byCode = new Map();
  const byNormalizedLabel = new Map();

  for (const occupation of occupations) {
    const parentLabel =
      occupations.find((item) => item.code === occupation.parentCode)?.label || null;
    occupation.parentLabel = parentLabel;

    byCode.set(occupation.code, occupation);

    for (const candidate of uniqueStrings([
      occupation.label,
      occupation.labels.et,
      occupation.labels.en,
      occupation.labels.ru,
    ])) {
      const normalized = normalizeLookupText(candidate);
      if (normalized && !byNormalizedLabel.has(normalized)) {
        byNormalizedLabel.set(normalized, occupation);
      }
    }
  }

  return {
    occupations,
    byCode,
    byNormalizedLabel,
    meta: {
      occupationCount: occupations.length,
      linkCount: links.length,
    },
  };
}

function findLocalMatchForOccupation(entity, catalog) {
  const candidates = uniqueStrings([
    coerceString(entity?.code),
    coerceString(entity?.label),
    ...toSafeArray(entity?.aliases),
  ]);

  for (const candidate of candidates) {
    if (catalog.byCode.has(candidate)) {
      return catalog.byCode.get(candidate);
    }

    const normalized = normalizeLookupText(candidate);
    if (normalized && catalog.byNormalizedLabel.has(normalized)) {
      return catalog.byNormalizedLabel.get(normalized);
    }
  }

  return null;
}

function mergeEntityWithLocalOccupation(entity, localOccupation, locale = "et") {
  if (!localOccupation) return entity;

  const localizedLabel =
    localOccupation.labels?.[locale] ||
    localOccupation.labels?.et ||
    entity.label ||
    localOccupation.label;
  const localizedDefinition =
    localOccupation.definitions?.[locale] ||
    localOccupation.definitions?.et ||
    entity.description ||
    null;

  const aliases = uniqueStrings([
    ...toSafeArray(entity.aliases),
    localOccupation.labels?.et,
    localOccupation.labels?.en,
    localOccupation.labels?.ru,
  ]);
  const fieldLabels = uniqueStrings([
    ...toSafeArray(entity.fieldLabels),
    localOccupation.field,
  ]);

  const tags = uniqueStrings([
    ...toSafeArray(entity.tags),
    localOccupation.field,
    localOccupation.group,
    "local_catalog",
  ]);

  return {
    ...entity,
    code: entity.code || localOccupation.code,
    label: entity.label || localizedLabel,
    aliases,
    description: entity.description || localizedDefinition,
    summary: entity.summary || localizedDefinition,
    fieldLabels,
    parentCode: entity.parentCode || localOccupation.parentCode || null,
    parentLabel: entity.parentLabel || localOccupation.parentLabel || null,
    tags,
    searchTerms: uniqueStrings([
      ...toSafeArray(entity.searchTerms),
      localizedLabel,
      ...aliases,
      ...fieldLabels,
      localOccupation.group,
    ]),
    externalUrl: entity.externalUrl || localOccupation.externalUrl || null,
    occupationGroup: entity.occupationGroup || localOccupation.group || null,
    localizedLabels: {
      ...(entity.localizedLabels || {}),
      ...localOccupation.labels,
    },
    localizedDefinitions: {
      ...(entity.localizedDefinitions || {}),
      ...localOccupation.definitions,
    },
    localCatalog: {
      code: localOccupation.code,
      field: localOccupation.field,
      group: localOccupation.group,
      parentCode: localOccupation.parentCode,
      parentLabel: localOccupation.parentLabel,
      version: localOccupation.version,
      codeSystem: localOccupation.codeSystem,
      externalUrl: localOccupation.externalUrl,
    },
  };
}

function createOccupationEntityFromLocal(localOccupation, locale = "et") {
  const label =
    localOccupation.labels?.[locale] ||
    localOccupation.labels?.et ||
    localOccupation.label;
  const description =
    localOccupation.definitions?.[locale] ||
    localOccupation.definitions?.et ||
    null;
  const aliases = uniqueStrings([
    localOccupation.labels?.et,
    localOccupation.labels?.en,
    localOccupation.labels?.ru,
  ].filter((item) => item && item !== label));
  const fieldLabels = uniqueStrings([localOccupation.field]);
  const tags = uniqueStrings([localOccupation.field, localOccupation.group, "local_catalog"]);

  return {
    type: "occupation",
    id: `local:${localOccupation.code}`,
    code: localOccupation.code,
    label,
    aliases,
    description,
    summary: description,
    fieldCodes: [],
    fieldLabels,
    skillCodes: [],
    skillLabels: [],
    knowledgeAreas: [],
    parentCode: localOccupation.parentCode || null,
    parentLabel: localOccupation.parentLabel || null,
    workConditions: [],
    goodToKnow: [],
    educationLevels: [],
    toolLabels: [],
    careerOpportunities: [],
    akCodes: [],
    iscedfCode: null,
    emtakCode: null,
    tags,
    searchTerms: uniqueStrings([
      label,
      ...aliases,
      ...fieldLabels,
      localOccupation.group,
    ]),
    externalUrl: localOccupation.externalUrl || null,
    occupationGroup: localOccupation.group || null,
    localizedLabels: { ...localOccupation.labels },
    localizedDefinitions: { ...localOccupation.definitions },
    localCatalog: {
      code: localOccupation.code,
      field: localOccupation.field,
      group: localOccupation.group,
      parentCode: localOccupation.parentCode,
      parentLabel: localOccupation.parentLabel,
      version: localOccupation.version,
      codeSystem: localOccupation.codeSystem,
      externalUrl: localOccupation.externalUrl,
    },
    raw: {
      localCatalog: localOccupation,
    },
  };
}

async function buildCatalog() {
  const [detailRows, classifierRows, links] = await Promise.all([
    readXlsxRows(OCCUPATIONS_FILE),
    readXlsxRows(CLASSIFIER_FILE),
    readDocxLinks(LINKS_FILE),
  ]);

  return buildLocalOccupationCatalog(detailRows, classifierRows, links);
}

export async function loadCareerLocalOccupationCatalog() {
  if (cacheState.catalog) {
    return cacheState.catalog;
  }

  if (!cacheState.loadingPromise) {
    cacheState.loadingPromise = buildCatalog()
      .then((catalog) => {
        cacheState.catalog = catalog;
        return catalog;
      })
      .finally(() => {
        cacheState.loadingPromise = null;
      });
  }

  return cacheState.loadingPromise;
}

export function mergeLocalOccupationsIntoDataset(
  dataset = {},
  catalog,
  options = {}
) {
  if (!catalog || !toSafeArray(catalog.occupations).length) {
    return dataset;
  }

  const locale =
    options.locale || options.language || options.documentLanguage || "et";
  const existingCodes = new Set();

  const occupations = toSafeArray(dataset.occupations).map((entity) => {
    const localOccupation = findLocalMatchForOccupation(entity, catalog);
    const merged = mergeEntityWithLocalOccupation(entity, localOccupation, locale);
    existingCodes.add(merged.code || entity.code);
    if (localOccupation) {
      existingCodes.add(localOccupation.code);
    }
    return merged;
  });

  for (const localOccupation of toSafeArray(catalog.occupations)) {
    if (existingCodes.has(localOccupation.code)) continue;
    occupations.push(createOccupationEntityFromLocal(localOccupation, locale));
    existingCodes.add(localOccupation.code);
  }

  return {
    ...dataset,
    occupations,
    meta: {
      ...dataset.meta,
      occupationCount: occupations.length,
      localOccupationCount: catalog.meta?.occupationCount ?? 0,
      localLinkCount: catalog.meta?.linkCount ?? 0,
    },
  };
}

