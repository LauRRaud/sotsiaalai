import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "scripts", "legacy-css-baseline.json");

const stripComments = (content) => content.replace(/\/\*[\s\S]*?\*\//g, "");
const countRules = (content) => {
  const withoutComments = stripComments(content);
  return (withoutComments.match(/{/g) || []).length;
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith(".css")) {
      files.push(full);
    }
  }
  return files;
};

const loadBaseline = async () => {
  try {
    const raw = await fs.readFile(BASELINE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Failed to read baseline at ${BASELINE_PATH}: ${error.message}`,
    );
  }
};

const formatDelta = (value) => (value > 0 ? `+${value}` : `${value}`);

const run = async () => {
  const baseline = await loadBaseline();
  if (!baseline?.files || !baseline?.totals) {
    throw new Error("Baseline JSON is missing required fields.");
  }

  const targetDir = path.join(ROOT, "app", "styles");
  const files = await walk(targetDir);
  const current = {};
  let totalBytes = 0;
  let totalRules = 0;

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const rules = countRules(content);
    const bytes = Buffer.byteLength(content, "utf8");
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    current[rel] = { bytes, rules };
    totalBytes += bytes;
    totalRules += rules;
  }

  const baselineFiles = baseline.files || {};

  const newPageFiles = Object.keys(current).filter(
    (file) => file.startsWith("app/styles/pages/") && !baselineFiles[file],
  );

  const grownFiles = [];
  for (const [file, metrics] of Object.entries(current)) {
    const base = baselineFiles[file];
    if (!base) continue;
    const bytesDelta = metrics.bytes - base.bytes;
    const rulesDelta = metrics.rules - base.rules;
    if (bytesDelta > 0 || rulesDelta > 0) {
      grownFiles.push({ file, bytesDelta, rulesDelta });
    }
  }

  const baselineTotals = baseline.totals;
  const bytesDeltaTotal = totalBytes - baselineTotals.bytes;
  const rulesDeltaTotal = totalRules - baselineTotals.rules;

  const violations = [];
  if (newPageFiles.length > 0) {
    violations.push("New CSS files under app/styles/pages detected.");
  }
  if (bytesDeltaTotal > 0) {
    violations.push("Total CSS bytes increased.");
  }
  if (rulesDeltaTotal > 0) {
    violations.push("Total CSS rule count increased.");
  }

  if (violations.length > 0) {
    console.error("[css:guard] Guardrail violation(s):");
    for (const item of violations) {
      console.error(`- ${item}`);
    }

    if (newPageFiles.length > 0) {
      console.error("\nNew page CSS files:");
      for (const file of newPageFiles) {
        console.error(`- ${file}`);
      }
    }

    console.error("\nTotals:");
    console.error(`- files: ${baselineTotals.files} -> ${files.length}`);
    console.error(
      `- bytes: ${baselineTotals.bytes} -> ${totalBytes} (${formatDelta(bytesDeltaTotal)})`,
    );
    console.error(
      `- rules: ${baselineTotals.rules} -> ${totalRules} (${formatDelta(rulesDeltaTotal)})`,
    );

    if (grownFiles.length > 0) {
      console.error("\nFiles that grew:");
      for (const entry of grownFiles) {
        const bytesDelta = formatDelta(entry.bytesDelta);
        const rulesDelta = formatDelta(entry.rulesDelta);
        console.error(
          `- ${entry.file} (bytes ${bytesDelta}, rules ${rulesDelta})`,
        );
      }
    }

    process.exit(1);
  }

  console.log("[css:guard] OK. No legacy CSS growth detected.");
};

run().catch((error) => {
  console.error("[css:guard] Failed:", error.message);
  process.exit(1);
});
