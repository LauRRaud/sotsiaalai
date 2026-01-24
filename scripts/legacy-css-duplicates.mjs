import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const ROOT = process.cwd();
const CSS_DIR = path.join(ROOT, "app", "styles");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "generated",
  "coverage",
  "analyze",
  "public",
  "dist",
]);

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const walk = async (dir) => {
  const files = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return files;
    throw error;
  }

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith(".css")) {
      files.push(full);
    }
  }
  return files;
};

const buildContext = (node) => {
  const stack = [];
  let parent = node.parent;
  while (parent && parent.type !== "root") {
    if (parent.type === "atrule") {
      const params = parent.params ? ` ${parent.params}` : "";
      stack.push(`@${parent.name}${params}`);
    }
    parent = parent.parent;
  }
  return stack.reverse().map(normalizeWhitespace).join(" | ");
};

const collectRuleEntries = async (file) => {
  const raw = await fs.readFile(file, "utf8");
  const root = postcss.parse(raw, { from: file });
  const entries = [];

  root.walkRules((rule) => {
    const selector = normalizeWhitespace(rule.selector || "");
    if (!selector) return;

    const decls = [];
    for (const node of rule.nodes || []) {
      if (node.type !== "decl") continue;
      const important = node.important ? " !important" : "";
      decls.push(`${node.prop}:${normalizeWhitespace(node.value)}${important}`);
    }

    if (decls.length === 0) return;

    entries.push({
      selector,
      decls: decls.join(";"),
      declCount: decls.length,
      context: buildContext(rule),
    });
  });

  return entries;
};

const relative = (file) => path.relative(ROOT, file).replace(/\\/g, "/");

const parseArgs = () => {
  const args = process.argv.slice(2);
  const getArg = (name, fallback) => {
    const direct = args.find((arg) => arg.startsWith(`${name}=`));
    if (direct) return direct.split("=")[1];
    const idx = args.indexOf(name);
    if (idx >= 0 && args[idx + 1]) return args[idx + 1];
    return fallback;
  };

  return {
    showAll: args.includes("--all"),
    minSelectorHits: Number(getArg("--min-selector", "2")),
    minDeclHits: Number(getArg("--min-decls", "3")),
    minDeclsPerRule: Number(getArg("--min-decls-per-rule", "2")),
  };
};

const run = async () => {
  const opts = parseArgs();
  const cssFiles = await walk(CSS_DIR);
  if (cssFiles.length === 0) {
    console.log("[legacy-css-duplicates] No CSS files found.");
    return;
  }

  const selectorMap = new Map();
  const declMap = new Map();
  let ruleCount = 0;

  for (const file of cssFiles) {
    const entries = await collectRuleEntries(file);
    for (const entry of entries) {
      ruleCount += 1;
      const selectorKey = `${entry.context}||${entry.selector}`;
      const selectorGroup = selectorMap.get(selectorKey) || {
        selector: entry.selector,
        context: entry.context,
        entries: [],
      };
      selectorGroup.entries.push({
        file,
        decls: entry.decls,
        declCount: entry.declCount,
      });
      selectorMap.set(selectorKey, selectorGroup);

      if (entry.declCount >= opts.minDeclsPerRule) {
        const declKey = `${entry.context}||${entry.decls}`;
        const declGroup = declMap.get(declKey) || {
          context: entry.context,
          decls: entry.decls,
          entries: [],
        };
        declGroup.entries.push({
          file,
          selector: entry.selector,
        });
        declMap.set(declKey, declGroup);
      }
    }
  }

  const selectorDuplicates = Array.from(selectorMap.values()).filter(
    (group) => group.entries.length >= opts.minSelectorHits,
  );
  selectorDuplicates.sort((a, b) => b.entries.length - a.entries.length);

  const declDuplicates = Array.from(declMap.values()).filter(
    (group) => group.entries.length >= opts.minDeclHits,
  );
  declDuplicates.sort((a, b) => b.entries.length - a.entries.length);

  console.log("legacy-css-duplicates:");
  console.log(`- css files: ${cssFiles.length}`);
  console.log(`- rules parsed: ${ruleCount}`);
  console.log(`- duplicate selectors: ${selectorDuplicates.length}`);
  console.log(`- duplicate decl blocks: ${declDuplicates.length}`);

  if (selectorDuplicates.length > 0) {
    console.log("\nDuplicate selectors (same selector in multiple files):");
    const list = opts.showAll ? selectorDuplicates : selectorDuplicates.slice(0, 20);
    for (const group of list) {
      const declVariants = new Set(group.entries.map((entry) => entry.decls)).size;
      const context = group.context ? ` [${group.context}]` : "";
      console.log(`- ${group.selector}${context} (${group.entries.length}x, ${declVariants} decl variant(s))`);
      if (opts.showAll) {
        for (const entry of group.entries) {
          console.log(`  - ${relative(entry.file)} (${entry.declCount} decls)`);
        }
      }
    }
    if (!opts.showAll && selectorDuplicates.length > 20) {
      console.log("  ... use --all to list every duplicate selector.");
    }
  }

  if (declDuplicates.length > 0) {
    console.log("\nDuplicate declaration blocks (same decls across selectors):");
    const list = opts.showAll ? declDuplicates : declDuplicates.slice(0, 20);
    for (const group of list) {
      const context = group.context ? ` [${group.context}]` : "";
      console.log(`- ${group.entries.length} selectors share decls${context}`);
      if (opts.showAll) {
        for (const entry of group.entries) {
          console.log(`  - ${entry.selector} (${relative(entry.file)})`);
        }
      }
    }
    if (!opts.showAll && declDuplicates.length > 20) {
      console.log("  ... use --all to list every duplicate decl block.");
    }
  }
};

run().catch((error) => {
  console.error("[legacy-css-duplicates] Failed:", error);
  process.exitCode = 1;
});
