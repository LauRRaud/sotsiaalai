// Data-driven primitive inventory: for every class token in the CSS universe,
// count how many DISTINCT files contain a rule mentioning it. High file-spread =
// "one logical element styled across many files" = the consolidation symptom.
// This replaces guessing the primitive list with deriving it from the cascade.
import fg from "fast-glob";
import { readFileSync } from "fs";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";

const files = fg.sync(["app/styles/**/*.css", "components/**/*.css"], {
  ignore: ["**/.next/**", "**/node_modules/**", "**/*.module.css"],
}).sort();

// class -> Set(files)
const classFiles = new Map();
const classRules = new Map(); // class -> rule count
for (const file of files) {
  const css = readFileSync(file, "utf8");
  const root = postcss().process(css, { from: file, parser: safeParser }).root;
  root.walkRules((rule) => {
    let p = rule.parent;
    while (p && p.type === "atrule") { if (/keyframes/i.test(p.name)) return; p = p.parent; }
    const classes = new Set([...rule.selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]));
    for (const c of classes) {
      if (!classFiles.has(c)) { classFiles.set(c, new Set()); classRules.set(c, 0); }
      classFiles.get(c).add(file);
      classRules.set(c, classRules.get(c) + 1);
    }
  });
}

// rank by file-spread (then rule count)
const ranked = [...classFiles.entries()]
  .map(([c, set]) => ({ cls: c, files: set.size, rules: classRules.get(c) }))
  .filter((x) => x.files >= 4)
  .sort((a, b) => b.files - a.files || b.rules - a.rules);

console.log(`Klassid mis esinevad ≥4 failis (hajutatud = konsolideerimis-kandidaadid): ${ranked.length}\n`);
console.log("FAILE  REEGLEID  KLASS");
ranked.slice(0, 40).forEach((x) => console.log(String(x.files).padStart(5), String(x.rules).padStart(9), "  ." + x.cls));

// group by semantic suffix to reveal primitives
const prim = (c) => {
  for (const k of ["dropdown", "select", "menu", "modal", "btn", "button", "card", "chip", "panel", "tooltip", "field", "input", "badge", "tab", "toggle", "pill"]) {
    if (c.toLowerCase().includes(k)) return k;
  }
  return null;
};
const byPrim = {};
for (const x of ranked) { const k = prim(x.cls); if (k) (byPrim[k] ??= { files: new Set(), n: 0 }), byPrim[k] && (byPrim[k].n += x.files); }
console.log("\n=== Primitiivi-tüübid (hajutatud klasside summa-failispread) ===");
Object.entries(byPrim).sort((a, b) => b[1].n - a[1].n).forEach(([k, v]) => console.log(String(v.n).padStart(5), k));
