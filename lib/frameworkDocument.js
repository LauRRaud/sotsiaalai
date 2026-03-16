import { readFile } from "node:fs/promises";
import path from "node:path";

const FRAMEWORK_DOCUMENT_PATH = path.join(
  process.cwd(),
  "docs",
  "legal",
  "SotsiaalAI_raamdokument_extracted.txt"
);

const TOP_LEVEL_HEADING_RE = /^\d+\.\s+/;
const SUB_HEADING_RE = /^\d+\.\d+\s+/;
const BULLET_RE = /^(?:\u2022|•)\s*/;
const CHECKBOX_RE = /(?:\u2610|☐)\s*/g;
const CHECKLIST_RE = /^(?:\u2610|☐)\s*/;

function normalizeLines(raw) {
  return String(raw || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isShortStandaloneHeading(line) {
  const text = String(line || "").trim();
  if (!text) return false;
  if (text.length > 48) return false;
  if (/[.!?;:]$/.test(text)) return false;
  if (/^\d/.test(text)) return false;
  return /^[A-ZÕÄÖÜ]/.test(text);
}

function parseBlocks(lines) {
  const blocks = [];
  let activeList = null;

  const flushList = () => {
    if (!activeList?.items?.length) {
      activeList = null;
      return;
    }

    blocks.push({
      type: activeList.type,
      items: [...activeList.items]
    });
    activeList = null;
  };

  for (const rawLine of lines) {
    const line = String(rawLine || "").trim();
    if (!line) continue;

    const checkboxMatches = Array.from(line.matchAll(CHECKBOX_RE));
    if (checkboxMatches.length >= 2) {
      flushList();
      const options = line
        .split(CHECKBOX_RE)
        .map((part) => part.trim())
        .filter(Boolean);

      blocks.push({
        type: "checkOptionsRow",
        options
      });
      continue;
    }

    const bulletMatch = line.match(BULLET_RE);
    if (bulletMatch) {
      const item = line.replace(BULLET_RE, "").trim();
      if (!activeList || activeList.type !== "bulletList") {
        flushList();
        activeList = { type: "bulletList", items: [] };
      }
      activeList.items.push(item);
      continue;
    }

    const checklistMatch = line.match(CHECKLIST_RE);
    if (checklistMatch) {
      const item = line.replace(CHECKLIST_RE, "").trim();
      if (!activeList || activeList.type !== "checkList") {
        flushList();
        activeList = { type: "checkList", items: [] };
      }
      activeList.items.push(item);
      continue;
    }

    flushList();

    if (TOP_LEVEL_HEADING_RE.test(line)) {
      blocks.push({ type: "heading", text: line });
      continue;
    }

    if (SUB_HEADING_RE.test(line)) {
      blocks.push({ type: "subheading", text: line });
      continue;
    }

    if (isShortStandaloneHeading(line)) {
      blocks.push({ type: "label", text: line });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}

function getEmptyFrameworkDocument() {
  return {
    title: "Tööalase kasutuse raamistik",
    prefaceBlocks: [],
    documentBlocks: []
  };
}

export async function loadFrameworkDocument() {
  try {
    const raw = await readFile(FRAMEWORK_DOCUMENT_PATH, "utf8");
    const lines = normalizeLines(raw);

    if (!lines.length) {
      return getEmptyFrameworkDocument();
    }

    const title = lines[0];
    const firstSectionIndex = lines.findIndex((line) => TOP_LEVEL_HEADING_RE.test(line));
    const prefaceLines = firstSectionIndex > 0 ? lines.slice(1, firstSectionIndex) : lines.slice(1);
    const documentLines = firstSectionIndex > 0 ? lines.slice(firstSectionIndex) : [];

    return {
      title,
      prefaceBlocks: parseBlocks(prefaceLines),
      documentBlocks: parseBlocks(documentLines)
    };
  } catch (error) {
    console.error("[frameworkDocument] load failed", error);
    return getEmptyFrameworkDocument();
  }
}
