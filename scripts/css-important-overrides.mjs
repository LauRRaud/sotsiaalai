// What does a winning !important override? — cascade resolver for the
// !important-reduction loop. For each target element (selector × route), across
// all 6 themes + forced pseudo-states, it asks the browser (CDP
// CSS.getMatchedStylesForNode) for EVERY matching rule, then RESOLVES the
// cascade per property: which rule WINS, and which rules it OVERRIDES.
//
// For every property a rule wins with `!important`, it classifies WHY the
// !important is (or isn't) load-bearing — the exact question in the manual
// loop "find what it overrides, then drop the !important":
//
//   REDUNDANT          no other rule declares this property → !important does
//                      nothing; drop it (gate will stay green).
//   WINS-BY-SPECIFICITY winner already has the strictly-highest specificity
//                      among all rules declaring the property → !important is
//                      not needed to win; drop it (gate-verify).
//   DEAD-DUPLICATE     an overridden rule declares the SAME value → that
//                      overridden rule is a dead duplicate; remove it.
//   IMPORTANT-WAR      an overridden rule is also !important with >= specificity
//                      and a DIFFERENT value → the !important IS load-bearing;
//                      to drop it you must first eliminate that competitor
//                      (which, if it never wins in any state, is itself dead).
//
// The cascade winner is taken from the browser's own rule order (CDP returns
// matchedCSSRules from lowest to highest precedence), NOT a re-implemented
// cascade — only specificity (for the verdict heuristic) is computed here, and
// every verdict is meant to be confirmed by the css-snapshot-diff gate before a
// rule is actually removed. Author rules only (user-agent sheets dropped).
//
// Usage:
//   node scripts/css-important-overrides.mjs --selector ".glass-ring--desktop-stable" \
//     --route /kasutusjuhend --headed --out reports/css-cleanup/state/overrides.json
//   node scripts/css-important-overrides.mjs --targets <file> --out <file> [--headed]
//     [--pseudo normal,hover,focus] [--props box-shadow,background,color] [--token t]
//
// Auth: env SNAPSHOT_SESSION, or --token, or auto via tmp-create-login-token.mjs.
// Git Bash: prefix `MSYS_NO_PATHCONV=1` so a /route arg is not path-mangled.

import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const THEMES = [
  { id: "light", theme: "light", contrast: "normal" },
  { id: "mid", theme: "mid", contrast: "normal" },
  { id: "dark", theme: "dark", contrast: "normal" },
  { id: "night", theme: "night", contrast: "normal" },
  { id: "mono", theme: "mono", contrast: "normal" },
  { id: "hc", theme: "dark", contrast: "hc" },
];

// Surface props are the !important theme-war hot zone; default to them but allow
// override. Empty list = every property any matched rule declares.
const DEFAULT_PROPS = [
  "box-shadow", "background", "background-color", "background-image",
  "color", "border", "border-color", "border-top-color", "outline",
  "backdrop-filter", "-webkit-backdrop-filter", "opacity", "filter",
];

function parseArgs(argv) {
  const out = { targets: null, selector: null, route: "/vestlus", out: null, token: null, baseUrl: "http://localhost:3000", headed: false, pseudo: ["normal"], props: DEFAULT_PROPS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--targets") out.targets = argv[++i];
    else if (a === "--selector") out.selector = argv[++i];
    else if (a === "--route") out.route = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--token") out.token = argv[++i];
    else if (a === "--base-url") out.baseUrl = argv[++i];
    else if (a === "--pseudo") out.pseudo = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--props") { const v = argv[++i]; out.props = v === "all" ? [] : v.split(",").map((s) => s.trim()).filter(Boolean); }
    else if (a === "--headed") out.headed = true;
  }
  if (!out.out) throw new Error("--out <file> is required");
  if (!out.targets && !out.selector) throw new Error("provide --selector <sel> or --targets <file>");
  return out;
}

// --- specificity (a,b,c); :is/:not/:has = max(arg), :where = 0 -------------
function specificity(sel) {
  let s = sel.trim();
  let a = 0, b = 0, c = 0;
  // pull out functional pseudo-classes that take selector lists
  s = s.replace(/:(is|not|has|matches)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/gi, (_, fn, inner) => {
    const parts = inner.split(",");
    let best = [0, 0, 0];
    for (const p of parts) {
      const sp = specificity(p);
      if (sp[0] !== best[0] ? sp[0] > best[0] : sp[1] !== best[1] ? sp[1] > best[1] : sp[2] > best[2]) best = sp;
    }
    a += best[0]; b += best[1]; c += best[2];
    return " ";
  });
  s = s.replace(/:where\([^()]*(?:\([^()]*\)[^()]*)*\)/gi, " "); // :where = 0
  a += (s.match(/#[\w-]+/g) || []).length;
  b += (s.match(/\.[\w-]+/g) || []).length;              // classes
  b += (s.match(/\[[^\]]+\]/g) || []).length;            // attributes
  b += (s.match(/:[\w-]+(?:\([^)]*\))?/g) || []).length; // pseudo-classes
  c += (s.match(/::[\w-]+/g) || []).length;              // pseudo-elements
  c += (s.match(/(^|[\s>+~])([a-z][\w-]*)/gi) || []).length; // type selectors
  return [a, b, c];
}
const cmpSpec = (x, y) => (x[0] - y[0]) || (x[1] - y[1]) || (x[2] - y[2]);

// --- value canonicalization (mirror css-snapshot-diff) ---------------------
function parseColor(str) {
  const s = str.trim();
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("") + "ff";
    else if (h.length === 4) h = h.split("").map((c) => c + c).join("");
    else if (h.length === 6) h = h + "ff";
    if (h.length !== 8) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), parseInt(h.slice(6, 8), 16)];
  }
  m = s.match(/^rgba?\(([^)]*)\)$/i);
  if (m) {
    const p = m[1].split(/[,/\s]+/).filter(Boolean);
    if (p.length < 3) return null;
    const al = p[3] != null ? parseFloat(p[3]) : 1;
    return [Math.round(parseFloat(p[0])), Math.round(parseFloat(p[1])), Math.round(parseFloat(p[2])), Math.round(al * 255)];
  }
  return null;
}
const hx = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
function canon(val) {
  if (val == null) return val;
  return String(val)
    .replace(/rgba?\([^)]*\)/gi, (m) => { const c = parseColor(m); return c ? `#${hx(c[0])}${hx(c[1])}${hx(c[2])}${hx(c[3])}` : m; })
    .replace(/#[0-9a-fA-F]{3,8}\b/g, (m) => { const c = parseColor(m); return c ? `#${hx(c[0])}${hx(c[1])}${hx(c[2])}${hx(c[3])}` : m; })
    .replace(/\s+/g, " ").trim();
}
// Substitute var(--x[, fallback]) with the element's computed custom-prop value,
// so a rule's declared value (often `var(--token)`) can be compared to the
// element's computed value — the cascade TRUTH that already accounts for layers
// and the !important layer-inversion (so a Tailwind `!` in @layer beating an
// unlayered hand-CSS `!important` is reflected correctly).
function resolveValue(value, vars) {
  let v = String(value);
  for (let i = 0; i < 6 && v.includes("var("); i++) {
    v = v.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/g, (_, name, fb) => {
      const rv = vars[name];
      return rv && rv.length ? rv : fb != null ? fb : "";
    });
  }
  return v.trim();
}

function generateToken() {
  const raw = execSync("npx tsx scripts/tmp-create-login-token.mjs", { encoding: "utf8" });
  const m = raw.match(/TOKEN:\s*([a-f0-9]+)/i);
  if (!m) throw new Error("could not parse token from tmp-create-login-token.mjs output");
  return m[1];
}
async function login(page, baseUrl, token) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const res = await page.evaluate(async (tok) => {
    const csrf = await (await fetch("/api/auth/csrf")).json();
    const body = new URLSearchParams({ csrfToken: csrf.csrfToken, temp_login_token: tok, callbackUrl: "/vestlus", json: "true" });
    const r = await fetch("/api/auth/callback/credentials", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString(), redirect: "manual" });
    return { status: r.status };
  }, token);
  if (res.status >= 400) throw new Error(`login failed: ${res.status}`);
}
async function applyTheme(page, theme) {
  await page.evaluate(({ theme, contrast }) => {
    window.localStorage.setItem("theme", theme);
    let prefs = {};
    try { prefs = JSON.parse(window.localStorage.getItem("a11y_prefs") || "{}"); } catch { prefs = {}; }
    prefs.theme = theme; prefs.contrast = contrast;
    const prefsJson = JSON.stringify(prefs);
    window.localStorage.setItem("a11y_prefs", prefsJson);
    // CRITICAL: the app's theme TRUTH is the a11y_prefs COOKIE (read by both the
    // server boot script and React). Set it too, else SSR renders the default
    // theme → hydration mismatch + the matched rules can reflect the wrong theme.
    document.cookie = "a11y_prefs=" + encodeURIComponent(prefsJson) + "; path=/; max-age=31536000; SameSite=Lax";
  }, theme);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(({ theme, contrast }) => {
    const root = document.documentElement;
    const cls = root.className || "";
    const contrastOk = contrast === "hc" ? root.getAttribute("data-contrast") === "hc" : root.getAttribute("data-contrast") !== "hc";
    const themeOk = contrast === "hc" ? true : theme === "light" ? cls.includes("theme-light") && !cls.includes("theme-mid") : theme === "mid" ? cls.includes("theme-mid") : theme === "night" ? cls.includes("theme-night") : theme === "mono" ? cls.includes("theme-mono") : !/theme-(light|mid|night|mono)/.test(cls);
    return contrastOk && themeOk;
  }, theme, { timeout: 30000, polling: 100 });
}
function sheetTracker(cdp) {
  const sheets = new Map();
  cdp.on("CSS.styleSheetAdded", ({ header }) => { sheets.set(header.styleSheetId, header.sourceURL || header.sourceMapURL || `inline#${header.styleSheetId}`); });
  return sheets;
}
function ruleLocation(sheets, rule) {
  const url = sheets.get(rule.styleSheetId) || `sheet#${rule.styleSheetId}`;
  const file = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0] || url;
  const r = rule.style?.range;
  const line = r ? r.startLine + 1 : null;
  return line ? `${file}:${line}` : file;
}

// Matched author rules in CDP cascade order (index 0 = lowest precedence) plus
// the element's computed values for the props we care about.
async function captureNode(page, cdp, sheets, selector, forcedPseudo, props) {
  await page.waitForSelector(selector, { state: "attached", timeout: 30000 }).catch(() => null);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await cdp.send("DOM.getDocument", { depth: -1 });
  const evalRes = await cdp.send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(selector)})`, returnByValue: false });
  const objectId = evalRes.result?.objectId;
  if (!objectId) return { found: false };
  const { nodeId } = await cdp.send("DOM.requestNode", { objectId });
  if (!nodeId) return { found: false };
  if (forcedPseudo && forcedPseudo !== "normal") await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [forcedPseudo] });
  const matched = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
  const computedArr = (await cdp.send("CSS.getComputedStyleForNode", { nodeId })).computedStyle || [];
  if (forcedPseudo && forcedPseudo !== "normal") await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });

  const computed = {};
  for (const { name, value } of computedArr) computed[name] = value;

  // resolve custom properties referenced by any candidate value (for the var()→
  // computed comparison that makes winner detection layer-aware)
  const varNames = new Set();
  for (const entry of matched.matchedCSSRules || []) {
    for (const p of entry.rule.style?.cssProperties || []) {
      if (!p.value) continue;
      for (const m of String(p.value).matchAll(/var\(\s*(--[\w-]+)/g)) varNames.add(m[1]);
    }
  }
  const vars = await page.evaluate(({ sel, names }) => {
    const el = document.querySelector(sel);
    const cs = el ? getComputedStyle(el) : null;
    const out = {};
    if (cs) for (const n of names) out[n] = cs.getPropertyValue(n).trim();
    return out;
  }, { sel: selector, names: [...varNames] });

  // matchedCSSRules: lowest→highest precedence. Keep author rules, with the
  // specificity of the actually-matching selector (max over matchingSelectors).
  const rules = [];
  for (const entry of matched.matchedCSSRules || []) {
    const rule = entry.rule;
    if (rule.origin !== "regular") continue;
    const selectors = rule.selectorList?.selectors || [];
    const idxs = entry.matchingSelectors && entry.matchingSelectors.length ? entry.matchingSelectors : selectors.map((_, i) => i);
    let spec = [0, 0, 0];
    for (const i of idxs) {
      const t = selectors[i]?.text;
      if (!t) continue;
      const sp = specificity(t);
      if (cmpSpec(sp, spec) > 0) spec = sp;
    }
    const decls = {};
    for (const p of rule.style?.cssProperties || []) {
      if (!p.text || p.disabled || p.value === undefined) continue;
      decls[p.name] = { value: p.value, important: !!p.important };
    }
    rules.push({ selector: rule.selectorList?.text ?? "", at: ruleLocation(sheets, rule), spec, decls });
  }
  return { found: true, rules, computed, vars };
}

// Resolve, per property, which rule wins and which it overrides, + verdict.
function resolveProp(prop, rules, computed, vars) {
  const declaring = rules
    .map((r, i) => ({ ...r, order: i, decl: r.decls[prop] }))
    .filter((r) => r.decl);
  if (declaring.length === 0) return null;

  const importants = declaring.filter((r) => r.decl.important);
  const cval = canon(computed[prop]);
  // Cascade winner = the declaring rule whose value, with var() resolved to the
  // element's computed custom props, equals the computed value (the browser's
  // layer- and importance-aware truth). This correctly handles a Tailwind `!`
  // (layered !important) beating an unlayered hand-CSS `!important`. Fall back to
  // last-!important-in-order only if no candidate resolves to computed.
  let winner = null;
  for (let i = declaring.length - 1; i >= 0; i--) {
    if (canon(resolveValue(declaring[i].decl.value, vars || {})) === cval) { winner = declaring[i]; break; }
  }
  const computedMatched = !!winner;
  if (!winner) { const pool = importants.length ? importants : declaring; winner = pool[pool.length - 1]; }
  const overridden = declaring.filter((r) => r !== winner);

  const winnerImportant = winner.decl.important;
  // Tailwind `!` modifier compiles to an escaped class `.\!utility` inside
  // @layer utilities. Per the cascade, a layered !important BEATS an unlayered
  // (hand-CSS) !important — so a Tailwind `!` competitor can win even when our
  // order-based fallback picked a hand-CSS rule. Detect & flag it explicitly.
  const isTwImp = (r) => /\\!/.test(r.selector) && r.decl.important;
  const tailwindImportantCompetitor = overridden.some(isTwImp);
  const winnerIsTailwindImportant = isTwImp(winner);
  let verdict, removable = [];

  if (!winnerImportant) {
    verdict = "winner-not-important";
  } else if (overridden.length === 0) {
    verdict = "REDUNDANT"; // nothing to override
  } else {
    // ANY other !important declaring this prop makes the winner's !important
    // load-bearing: dropping it demotes the winner to normal, and any !important
    // (even lower-specificity) then beats it.
    const otherImportants = overridden.filter((r) => r.decl.important);
    const maxOtherSpec = overridden.reduce((m, r) => (cmpSpec(r.spec, m) > 0 ? r.spec : m), [0, 0, 0]);
    // dead duplicates: overridden rules whose value canonically equals the winner
    const dup = overridden.filter((r) => canon(r.decl.value) === canon(winner.decl.value) || canon(r.decl.value) === cval);
    if (otherImportants.length === 0 && cmpSpec(winner.spec, maxOtherSpec) > 0) {
      verdict = "WINS-BY-SPECIFICITY"; // only normal competitors + winner strictly highest spec → !important not needed
    } else if (dup.length) {
      verdict = "DEAD-DUPLICATE";
      removable = dup.map((r) => ({ at: r.at, selector: r.selector, value: r.decl.value, important: r.decl.important }));
    } else {
      verdict = "IMPORTANT-WAR";
    }
  }
  // A Tailwind !important competitor (layered) outranks an unlayered hand-CSS
  // !important regardless of specificity — if our winner is hand-CSS, the real
  // winner may be the Tailwind rule. Surface it (Root-A cross-system conflict).
  if (tailwindImportantCompetitor && winnerImportant && !winnerIsTailwindImportant && !computedMatched) {
    verdict = "CHECK-TAILWIND-LAYER";
  }
  return {
    winner: { at: winner.at, selector: winner.selector, value: winner.decl.value, important: winnerImportant, spec: winner.spec },
    computed: computed[prop],
    computedMatched, // false = var() could not be resolved to computed; verdict is best-effort
    tailwindImportantCompetitor, // a Tailwind `!` (layered !important) also declares this prop
    winnerIsTailwindImportant,
    overridden: overridden.map((r) => ({ at: r.at, selector: r.selector, value: r.decl.value, important: r.decl.important, spec: r.spec, tailwind: isTwImp(r) })),
    verdict,
    removable,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const targets = args.targets ? JSON.parse(readFileSync(args.targets, "utf8")) : [{ name: args.selector, route: args.route, selector: args.selector }];
  const sessionCookie = process.env.SNAPSHOT_SESSION || null;
  const token = sessionCookie ? null : args.token || generateToken();

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext();
  if (sessionCookie) {
    const { hostname } = new URL(args.baseUrl);
    await context.addCookies([{ name: "next-auth.session-token", value: sessionCookie, domain: hostname, path: "/", httpOnly: true, sameSite: "Lax" }]);
  }
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(30000);
  if (token) await login(page, args.baseUrl, token);
  const cdp = await context.newCDPSession(page);
  const sheets = sheetTracker(cdp);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");

  const report = { capturedAt: new Date().toISOString(), props: args.props.length ? args.props : "all", targets: {} };
  const removalCandidates = [];
  for (const target of targets) {
    process.stderr.write(`inspecting ${target.name} (${target.route ?? args.route})...\n`);
    const route = target.route ?? args.route;
    const byState = {};
    for (const theme of THEMES) {
      await page.goto(`${args.baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      await applyTheme(page, theme);
      for (const pseudo of args.pseudo) {
        const cap = await captureNode(page, cdp, sheets, target.selector, pseudo, args.props);
        if (!cap.found) { byState[`${theme.id}/${pseudo}`] = null; continue; }
        const propList = args.props.length ? args.props : [...new Set(cap.rules.flatMap((r) => Object.keys(r.decls)))];
        const perProp = {};
        for (const prop of propList) {
          const res = resolveProp(prop, cap.rules, cap.computed, cap.vars);
          if (res && res.winner.important) perProp[prop] = res; // only !important winners
        }
        byState[`${theme.id}/${pseudo}`] = perProp;
      }
    }
    report.targets[target.name] = { selector: target.selector, route, byState };
  }

  await browser.close();
  mkdirSync(path.dirname(args.out), { recursive: true });

  // Removal candidates = a declaration that NEVER wins in ANY captured state but
  // is dead-duplicate / overridden. Aggregate across states; only emit if the
  // (at, selector, prop) never appears as a winner anywhere.
  // A rule is a removal candidate if it appears as OVERRIDDEN somewhere and is
  // NEVER a winner in any captured state. `dup` = it lost to an identical value
  // (safest: removing it can't change the paint even if cascade shifts). CAVEAT:
  // "never wins for THIS selector" ≠ "unused elsewhere" — the same rule may win
  // for another element. Cross-check global use + run the css-snapshot-diff gate
  // before removing. Theme+element-specific selectors are the safe sweet spot.
  const winnersSeen = new Set();
  const deadSeen = new Map();
  for (const t of Object.values(report.targets)) {
    for (const perProp of Object.values(t.byState)) {
      if (!perProp) continue;
      for (const [prop, res] of Object.entries(perProp)) {
        winnersSeen.add(`${res.winner.at}|${prop}`);
        const dupKeys = new Set(res.removable.map((r) => `${r.at}`));
        for (const o of res.overridden) {
          const key = `${o.at}|${prop}`;
          if (!deadSeen.has(key)) deadSeen.set(key, { at: o.at, selector: o.selector, value: o.value, important: o.important, prop, dup: dupKeys.has(o.at) });
        }
      }
    }
  }
  for (const [key, rm] of deadSeen) if (!winnersSeen.has(key)) removalCandidates.push(rm);
  removalCandidates.sort((a, b) => (b.dup ? 1 : 0) - (a.dup ? 1 : 0)); // safest (dup) first
  report.removalCandidates = removalCandidates;
  writeFileSync(args.out, JSON.stringify(report, null, 2));

  // human summary
  for (const [name, t] of Object.entries(report.targets)) {
    process.stderr.write(`\n${name}  (${t.selector})\n`);
    for (const [state, perProp] of Object.entries(t.byState)) {
      if (!perProp || !Object.keys(perProp).length) continue;
      for (const [prop, res] of Object.entries(perProp)) {
        process.stderr.write(`  [${state}] ${prop}: ${res.verdict}\n`);
        process.stderr.write(`      WINNER  ${res.winner.at}  (${res.winner.value})\n`);
        for (const o of res.overridden) process.stderr.write(`      ↳ over  ${o.at}  (${o.value})${o.important ? " !important" : ""}\n`);
      }
    }
  }
  if (removalCandidates.length) {
    process.stderr.write(`\n${removalCandidates.length} removal candidate(s) (dead in every captured state — gate-verify before removing):\n`);
    for (const rm of removalCandidates) process.stderr.write(`  ${rm.at}  ${rm.prop}: ${rm.value}\n`);
  }
  process.stderr.write(`\nwrote ${args.out}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
