// Effective-render CSS audit — full-platform dead-code candidate generator.
//
// WHY this exists (and how it differs from the other two CSS tools):
//   - scripts/audit-css-usage.mjs  → STATIC: "is this class a token in source?"
//     Knows nothing about runtime; many false positives (dynamic/theme/state).
//   - scripts/css-matched-rules.mjs → per-selector CDP probe (investigation).
//   - THIS                          → crawls every page × every theme and asks,
//     for the ACTUALLY-RENDERED DOM, two questions the others cannot:
//       (1) existence  — does the element this rule targets ever render at all?
//       (2) behaviour  — for state rules (:hover/:active/:focus/:disabled), does
//                        forcing that state ACTUALLY change anything on screen?
//     An element is not just its idle look; it is its full behavioural surface.
//     A `:hover` rule whose forced-hover computed style is identical to idle does
//     nothing → dead, even though it "matches" and ships in the bundle.
//
// This measures the WINNING / effective render (the project thesis: the browser's
// effective computed style IS the spec), NOT loaded-bundle coverage. Bundle
// coverage over-keeps overridden rules; this does not.
//
// IMPORTANT — this is a CANDIDATE GENERATOR, never an auto-deleter. Two known
// residual false-positive sources remain and MUST be cleared by hand before
// removing anything, through the existing snapshot gate (css-snapshot-diff):
//   - JS-mounted states: modals, dropdowns, error/empty states, [data-state]
//     toggles — DOM that only exists after a click. forcePseudoState cannot
//     reach these; they look dead until opened. (e.g. .help-listings-empty is
//     reserved + test-guarded — it WILL show here as a candidate; it is not dead.)
//   - Cross-viewport @media: a desktop-only element tested at a mobile width (or
//     vice-versa) may not exist there. We test every viewport and treat a match
//     at ANY viewport as "exists", which errs toward KEEPING — safe.
// The report cross-references the static css:audit so a candidate flagged by BOTH
// signals is high-confidence; flagged by only one = inspect by hand.
//
// Run against a PRODUCTION build (`next build` + `next start`), not the dev
// server — applyTheme reloads heavily and dev dies on repeated reloads.
//
// Usage:
//   node scripts/css-effective-audit.mjs \
//     [--routes scripts/css-effective-audit.routes.json] \
//     [--out reports/css-effective-audit/<date>.json] \
//     [--base-url http://localhost:3000] [--token <t>] [--headed] \
//     [--no-states]            skip the pseudo-state behaviour pass (faster)
//     [--max-state-els N]      cap base-matching elements probed per rule (default 6)
//
// Auth: same as css-snapshot.mjs — env SNAPSHOT_SESSION (session-token cookie)
//   or --token (temp login token), else a token is generated. auth:false routes
//   are crawled logged-out.

import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

import fg from "fast-glob";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";

const ROOT = process.cwd();

// ---- theme + auth infra (mirrors css-snapshot.mjs; kept in sync by hand) -----

const THEMES = [
  { id: "light", theme: "light", contrast: "normal" },
  { id: "mid", theme: "mid", contrast: "normal" },
  { id: "dark", theme: "dark", contrast: "normal" },
  { id: "night", theme: "night", contrast: "normal" },
  { id: "mono", theme: "mono", contrast: "normal" },
  { id: "hc", theme: "dark", contrast: "hc" }, // app forces theme=dark under hc
];

// Widths chosen to land inside EVERY @media band the CSS uses (768/769 main
// split, plus 1180/1280/1440 desktop bands and 1760 ultrawide). Two viewports
// (390+1920) miss combined desktop bands like (min-width:769)and(max-width:1440)
// — neither 390 nor 1920 triggers them → false "dead". These four cover them.
const VIEWPORTS = [
  { id: "mobile", width: 390, height: 780 },
  { id: "tablet", width: 1024, height: 800 },
  { id: "desktop", width: 1440, height: 900 },
  { id: "wide", width: 1920, height: 1080 },
];

const CSS_GLOBS = ["app/styles/**/*.css"];
const IGNORE = ["**/.next/**", "**/node_modules/**", "**/.git/**", "**/safety_snapshots/**"];

// Dynamic (state) pseudo-classes — these are what the behaviour pass forces.
// Structural pseudos (:not/:is/:where/:has/:nth-*/:first-*) are KEPT in the base
// selector because querySelector can match them directly.
const DYNAMIC_PSEUDOS = [
  "hover", "active", "focus", "focus-visible", "focus-within",
  "visited", "target", "enabled", "disabled", "checked",
  "default", "indeterminate", "placeholder-shown", "autofill",
];
// longest-first so the stripping alternation prefers full names (focus-visible
// before focus); the (?![-\w]) lookahead then stops :focus matching inside it.
const PSEUDO_ALT = [...DYNAMIC_PSEUDOS].sort((a, b) => b.length - a.length).join("|");
// CDP CSS.forcePseudoState only understands this subset; the rest we treat as
// "exists ⇒ keep" (cannot force them, so we never call them dead via behaviour).
const FORCEABLE = new Set([
  "active", "focus", "focus-within", "focus-visible", "hover", "visited", "target", "enabled", "disabled",
]);

function parseArgs(argv) {
  const out = {
    routes: "scripts/css-effective-audit.routes.json",
    out: null,
    token: null,
    baseUrl: "http://localhost:3000",
    headed: false,
    states: true,
    maxStateEls: 6,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--routes") out.routes = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--token") out.token = argv[++i];
    else if (a === "--base-url") out.baseUrl = argv[++i];
    else if (a === "--headed") out.headed = true;
    else if (a === "--no-states") out.states = false;
    else if (a === "--max-state-els") out.maxStateEls = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!out.out) {
    const date = new Date().toISOString().slice(0, 10);
    out.out = `reports/css-effective-audit/${date}.json`;
  }
  return out;
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
    const r = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      redirect: "manual",
    });
    return { status: r.status, text: (await r.text()).slice(0, 200) };
  }, token);
  if (res.status >= 400) throw new Error(`login failed: ${res.status} ${res.text}`);
}

async function applyTheme(page, theme) {
  await page.evaluate(({ theme, contrast }) => {
    window.localStorage.setItem("theme", theme);
    let prefs = {};
    try { prefs = JSON.parse(window.localStorage.getItem("a11y_prefs") || "{}"); } catch { prefs = {}; }
    prefs.theme = theme;
    prefs.contrast = contrast;
    window.localStorage.setItem("a11y_prefs", JSON.stringify(prefs));
  }, theme);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    ({ theme, contrast }) => {
      const root = document.documentElement;
      const cls = root.className || "";
      const contrastOk = contrast === "hc" ? root.getAttribute("data-contrast") === "hc" : root.getAttribute("data-contrast") !== "hc";
      const themeOk =
        contrast === "hc" ? true
          : theme === "light" ? cls.includes("theme-light") && !cls.includes("theme-mid")
          : theme === "mid" ? cls.includes("theme-mid")
          : theme === "night" ? cls.includes("theme-night")
          : theme === "mono" ? cls.includes("theme-mono")
          : !/theme-(light|mid|night|mono)/.test(cls);
      return contrastOk && themeOk;
    },
    theme,
    { timeout: 30000, polling: 100 }
  );
}

async function freezeMotion(page) {
  await page
    .addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" })
    .catch(() => {});
}

const flush = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

// ---- source CSS universe (postcss) -------------------------------------------

// Split a comma selector list into individual selectors, respecting parens so
// ":is(a, b)" / ":not(.x, .y)" are not split mid-function.
function splitSelectorList(sel) {
  const out = [];
  let depth = 0;
  let buf = "";
  for (const ch of sel) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(buf.trim()); buf = ""; }
    else buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

// A dynamic pseudo can be forced on the SUBJECT element only if it sits on the
// subject — NOT inside :has(...) (state is on a descendant) or :not(...) (state
// negates the match). Forcing :hover on `.x:has(.y:focus-within)` or
// `.card:not(:hover)` proves nothing, so those must be excluded from the
// state-no-op verdict. Strip :has()/:not() contents, then see what remains.
function subjectPseudosOf(selector) {
  let s = selector;
  let prev;
  do { prev = s; s = s.replace(/:(has|not)\([^()]*\)/g, ""); } while (s !== prev);
  return DYNAMIC_PSEUDOS.filter((p) => new RegExp(`:${p}(?![-\\w])`).test(s));
}

// Strip pseudo-ELEMENTS and DYNAMIC pseudo-classes, leaving a selector that
// querySelector can test for plain existence. Returns { base, pseudos, subjectPseudos }.
function toBase(selector) {
  const pseudos = [];
  // record dynamic pseudo-classes present (for the behaviour pass). (?![-\w])
  // so :focus is not matched inside :focus-visible / :focus-within.
  for (const p of DYNAMIC_PSEUDOS) {
    if (new RegExp(`:${p}(?![-\\w])`).test(selector)) pseudos.push(p);
  }
  const subjectPseudos = subjectPseudosOf(selector);
  let base = selector
    // pseudo-elements: ::before, ::after, ::placeholder, ::-webkit-scrollbar...
    .replace(/::[-a-z]+(\([^)]*\))?/g, "")
    // dynamic pseudo-classes
    .replace(new RegExp(`:(${PSEUDO_ALT})(?![-\\w])`, "g"), "");
  // clean degenerate functional-pseudo remnants left behind, e.g. ":is(, , )"
  // from ".x:is(:hover, :focus)" → host should become ".x".
  let prev;
  do {
    prev = base;
    base = base
      .replace(/\(\s*,/g, "(")
      .replace(/,\s*\)/g, ")")
      .replace(/,\s*,/g, ",")
      .replace(/:(is|where|not|has)\(\s*\)/g, "");
  } while (base !== prev);
  // a trailing combinator left behind (e.g. "a:hover >" → "a >") is invalid
  base = base.replace(/[>+~]\s*$/g, "").trim();
  return { base, pseudos, subjectPseudos };
}

function loadCssUniverse() {
  const files = fg.sync(CSS_GLOBS, { cwd: ROOT, absolute: true, ignore: IGNORE }).sort();
  const rules = [];
  let id = 0;
  for (const file of files) {
    const css = readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file);
    const root = postcss().process(css, { from: file, parser: safeParser }).root;
    root.walkRules((rule) => {
      // skip @keyframes step rules (selectors are "0%"/"from", not DOM selectors)
      let p = rule.parent;
      let media = null;
      while (p && p.type === "atrule") {
        if (/keyframes/i.test(p.name)) return;
        if (/media|supports/i.test(p.name)) media = media || `@${p.name} ${p.params}`;
        p = p.parent;
      }
      const line = rule.source?.start?.line ?? 1;
      for (const sel of splitSelectorList(rule.selector)) {
        if (!sel) continue;
        const { base, pseudos, subjectPseudos } = toBase(sel);
        // forceable pseudos that actually sit on the subject element — only
        // these can be proven no-op by forcing state on the matched node.
        const forcePseudos = subjectPseudos.filter((p) => FORCEABLE.has(p));
        rules.push({
          id: id++,
          file: rel,
          line,
          selector: sel,
          base: base || sel,
          pseudos,
          forcePseudos,
          media,
          // testable base? empty/odd bases get keep-by-default (testable=false)
          testable: Boolean(base) && !/^[>+~]/.test(base),
        });
      }
    });
  }
  return rules;
}

// ---- crawl -------------------------------------------------------------------

async function existencePass(page, rules) {
  // One round-trip: test every testable base selector with querySelector.
  const payload = rules.filter((r) => r.testable).map((r) => ({ id: r.id, base: r.base }));
  return page.evaluate((items) => {
    const seen = [];
    const invalid = [];
    for (const it of items) {
      try {
        if (document.querySelector(it.base)) seen.push(it.id);
      } catch {
        invalid.push(it.id); // invalid selector for querySelector — keep by default
      }
    }
    return { seen, invalid };
  }, payload);
}

// For each rule that has a forceable dynamic pseudo and whose base matches in the
// current DOM, force that pseudo on up to N matching elements and diff computed
// style idle-vs-forced. Returns the set of rule ids that produced ANY change.
async function behaviourPass(cdp, rootNodeId, rules, maxEls) {
  const effective = new Set();
  // only rules whose forceable pseudo sits on the SUBJECT — :has()/:not()-internal
  // state cannot be exercised by forcing on the matched node (would be false no-op).
  const stateRules = rules.filter((r) => r.forcePseudos.length > 0);
  for (const r of stateRules) {
    if (!r.testable) continue;
    const forced = r.forcePseudos;
    let nodeIds;
    try {
      ({ nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: rootNodeId, selector: r.base }));
    } catch {
      continue; // base invalid for the agent
    }
    let checked = 0;
    for (const nodeId of nodeIds) {
      if (checked >= maxEls) break;
      checked++;
      let idle, hot;
      try {
        idle = await cdp.send("CSS.getComputedStyleForNode", { nodeId });
        await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: forced });
        hot = await cdp.send("CSS.getComputedStyleForNode", { nodeId });
      } catch {
        await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] }).catch(() => {});
        continue;
      }
      await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] }).catch(() => {});
      if (computedDiffers(idle.computedStyle, hot.computedStyle)) {
        effective.add(r.id);
        break; // one positive is enough — the state does something
      }
    }
  }
  return effective;
}

function computedDiffers(a, b) {
  const mapA = new Map(a.map((p) => [p.name, p.value]));
  for (const p of b) {
    if (mapA.get(p.name) !== p.value) return true;
  }
  return false;
}

// ---- static css:audit cross-reference ----------------------------------------

function staticNotSeen() {
  try {
    const raw = execSync("node scripts/audit-css-usage.mjs --json --top 0", { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    const data = JSON.parse(raw);
    const set = new Set();
    for (const f of data.files ?? []) for (const u of f.unused ?? []) set.add(u.className);
    return set;
  } catch (e) {
    process.stderr.write(`  ⚠ static css:audit cross-reference skipped: ${String(e.message).split("\n")[0]}\n`);
    return new Set();
  }
}

function firstClass(selector) {
  const m = selector.replace(/\\\./g, "").match(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/);
  return m ? m[1] : null;
}

// ---- main --------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const routesDoc = JSON.parse(readFileSync(args.routes, "utf8"));
  const routes = routesDoc.routes ?? routesDoc;
  const rules = loadCssUniverse();
  process.stderr.write(`source universe: ${rules.length} rule-selectors across ${new Set(rules.map((r) => r.file)).size} files\n`);

  const everSeen = new Set();   // rule ids whose base matched somewhere
  const everEffective = new Set(); // state rule ids whose forced state changed computed
  const keepInvalid = new Set(); // rule ids whose base is invalid for querySelector

  const needsAuth = routes.some((r) => r.auth !== false);
  const sessionCookie = process.env.SNAPSHOT_SESSION || null;
  const token = needsAuth && !sessionCookie ? args.token || generateToken() : null;

  // reducedMotion + GPU-light flags: every page mounts a heavy animated
  // background (WebGL/canvas) that crashes the headless renderer under repeated
  // theme reloads. reduced-motion routes the app to its cheap static background;
  // the DOM stays present so CSS rules still match.
  const browser = await chromium.launch({
    headless: !args.headed,
    args: ["--disable-dev-shm-usage", "--disable-gpu"],
  });
  const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: "reduce" });
  if (needsAuth && sessionCookie) {
    const { hostname } = new URL(args.baseUrl);
    await context.addCookies([{ name: "next-auth.session-token", value: sessionCookie, domain: hostname, path: "/", httpOnly: true, sameSite: "Lax" }]);
  }
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(30000);
  page.on("crash", () => process.stderr.write("  ⚠ page renderer crashed\n"));
  if (token) await login(page, args.baseUrl, token);

  const cdp = await context.newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");

  for (const r of routes) {
    if (r.auth !== false && !needsAuth) continue;
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      let landed;
      try {
        const resp = await page.goto(`${args.baseUrl}${r.route}`, { waitUntil: "domcontentloaded" });
        landed = resp?.status() ?? 0;
      } catch (e) {
        process.stderr.write(`  ⚠ ${r.route} @${vp.id}: navigation failed (${String(e.message).split("\n")[0]})\n`);
        continue;
      }
      let okThemes = 0;
      for (const theme of THEMES) {
        try {
          await applyTheme(page, theme);
          await freezeMotion(page);
          await flush(page);

          const { seen, invalid } = await existencePass(page, rules);
          for (const id of seen) everSeen.add(id);
          for (const id of invalid) keepInvalid.add(id);

          if (args.states) {
            const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
            const eff = await behaviourPass(cdp, root.nodeId, rules, args.maxStateEls);
            for (const id of eff) everEffective.add(id);
          }
          okThemes += 1;
        } catch (e) {
          process.stderr.write(`  ⚠ ${r.route} @${vp.id} theme=${theme.id}: ${String(e.message).split("\n")[0]}\n`);
          if (page.isClosed()) throw new Error("page/browser closed — aborting run");
        }
      }
      // android existence pass: rules like `body[data-platform="android"] .x`
      // never match unless the attribute is set (the crawl runs as no-platform).
      // Force it on the phone viewport and re-test existence so they are not
      // falsely flagged dead. (android is phone-only, so mobile width only.)
      if (vp.id === "mobile" && !page.isClosed()) {
        try {
          await page.evaluate(() => {
            document.documentElement.setAttribute("data-platform", "android");
            document.body?.setAttribute("data-platform", "android");
          });
          await flush(page);
          const { seen } = await existencePass(page, rules);
          for (const id of seen) everSeen.add(id);
        } catch (e) {
          process.stderr.write(`  ⚠ ${r.route} @${vp.id} android-pass: ${String(e.message).split("\n")[0]}\n`);
        }
      }
      process.stderr.write(`  ✓ ${r.route} @${vp.id} (HTTP ${landed}, ${okThemes}/${THEMES.length} themes)\n`);
    }
  }
  await browser.close();

  // ---- classify ----
  const staticDead = staticNotSeen();
  const deadNoElement = [];   // base never matched anything anywhere
  const deadStateNoOp = [];   // element exists but forced state changed nothing
  for (const r of rules) {
    if (!r.testable || keepInvalid.has(r.id)) continue;
    if (!everSeen.has(r.id)) {
      deadNoElement.push(r);
    } else if (args.states && r.forcePseudos.length > 0 && !everEffective.has(r.id)) {
      deadStateNoOp.push(r);
    }
  }

  const decorate = (r) => {
    const cls = firstClass(r.selector);
    return {
      file: r.file, line: r.line, selector: r.selector,
      media: r.media || undefined,
      alsoStaticDead: cls ? staticDead.has(cls) : undefined,
    };
  };

  const report = {
    capturedAt: new Date().toISOString(),
    baseUrl: args.baseUrl,
    statesPass: args.states,
    routes: routes.length,
    themes: THEMES.map((t) => t.id),
    viewports: VIEWPORTS.map((v) => v.id),
    universe: rules.length,
    summary: {
      deadNoElement: deadNoElement.length,
      deadStateNoOp: deadStateNoOp.length,
      keptInvalidBase: keepInvalid.size,
    },
    deadNoElement: deadNoElement.map(decorate).sort(sortCand),
    deadStateNoOp: deadStateNoOp.map(decorate).sort(sortCand),
  };

  mkdirSync(path.dirname(args.out), { recursive: true });
  writeFileSync(args.out, JSON.stringify(report, null, 2));
  writeMarkdown(args.out.replace(/\.json$/, ".md"), report);

  process.stderr.write(
    `\nwrote ${args.out}\n` +
      `  dead (element never renders): ${deadNoElement.length}\n` +
      `  dead (state changes nothing): ${deadStateNoOp.length}\n` +
      `  high-confidence (also static-dead): ${report.deadNoElement.filter((c) => c.alsoStaticDead).length}\n` +
      `\nNEXT: these are CANDIDATES. Verify each via the snapshot gate before removal —\n` +
      `JS-mounted states (modals/empty/error) and reserved/test-guarded CSS show here too.\n`
  );
}

function sortCand(a, b) {
  return (Number(b.alsoStaticDead) - Number(a.alsoStaticDead)) || a.file.localeCompare(b.file) || a.line - b.line;
}

function writeMarkdown(file, report) {
  const lines = [];
  lines.push(`# Effective CSS audit — ${report.capturedAt.slice(0, 10)}`);
  lines.push("");
  lines.push(`Crawled ${report.routes} routes × ${report.themes.length} themes × ${report.viewports.length} viewports against ${report.baseUrl}.`);
  lines.push(`Universe: ${report.universe} rule-selectors. States pass: ${report.statesPass ? "on" : "off"}.`);
  lines.push("");
  lines.push("> Candidates, NOT a delete list. Verify each through the snapshot gate.");
  lines.push("> JS-mounted states (modals, empty/error views, [data-state]) and reserved/");
  lines.push("> test-guarded CSS will appear here — they are not dead. `✓` = also flagged by");
  lines.push("> the static css:audit (class not a token in source) = highest confidence.");
  lines.push("");
  const section = (title, items, note) => {
    lines.push(`## ${title} — ${items.length}`);
    if (note) lines.push(`_${note}_`);
    lines.push("");
    if (!items.length) { lines.push("_none_", ""); return; }
    for (const c of items) {
      const tag = c.alsoStaticDead ? "✓ " : "  ";
      const media = c.media ? ` _(${c.media})_` : "";
      lines.push(`- ${tag}\`${c.file}:${c.line}\` — \`${c.selector}\`${media}`);
    }
    lines.push("");
  };
  section("Dead — element never renders", report.deadNoElement,
    "Base selector matched zero elements on any page/theme/viewport.");
  section("Dead — state changes nothing", report.deadStateNoOp,
    "Element exists, but forcing :hover/:active/:focus/:disabled changed no computed value.");
  writeFileSync(file, lines.join("\n"));
}

main().catch((e) => { console.error(e); process.exit(1); });
