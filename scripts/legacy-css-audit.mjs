import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = [
  path.join(ROOT, "app", "styles", "pages"),
  path.join(ROOT, "app", "styles", "components"),
];

const NEAR_EMPTY_RULES = 1;
const NEAR_EMPTY_BYTES = 256;

const stripComments = (content) => content.replace(/\/\*[\s\S]*?\*\//g, "");
const countRules = (content) => {
  const withoutComments = stripComments(content);
  return (withoutComments.match(/{/g) || []).length;
};

const formatBytes = (bytes) => `${bytes.toString().padStart(7)} B`;

const scanDir = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
    .map((entry) => path.join(dir, entry.name));

  const results = [];
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const rules = countRules(content);
    const size = Buffer.byteLength(content, "utf8");
    const nearEmpty = rules <= NEAR_EMPTY_RULES || size <= NEAR_EMPTY_BYTES;
    results.push({
      file: path.relative(ROOT, file),
      rules,
      size,
      nearEmpty,
    });
  }

  return results.sort((a, b) => a.rules - b.rules || a.size - b.size);
};

const run = async () => {
  const allResults = [];
  for (const dir of TARGET_DIRS) {
    try {
      const results = await scanDir(dir);
      allResults.push(...results);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  if (allResults.length === 0) {
    console.log("[legacy-css-audit] No CSS files found.");
    return;
  }

  console.log("legacy-css-audit:");
  for (const entry of allResults) {
    const flag = entry.nearEmpty ? "near-empty" : "";
    const line = [
      entry.file.padEnd(48),
      formatBytes(entry.size),
      `rules:${entry.rules.toString().padStart(3)}`,
      flag,
    ]
      .filter(Boolean)
      .join("  ");
    console.log(line);
  }
};

run().catch((error) => {
  console.error("[legacy-css-audit] Failed:", error);
  process.exitCode = 1;
});
