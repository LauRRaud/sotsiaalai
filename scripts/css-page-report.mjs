// Per-page CSS/Tailwind report — crawls every route × theme in a HEADED browser
// (faithful render) and, for each configured primitive selector, records what
// actually renders: semantic classes, Tailwind utilities, computed key props,
// resolved tokens, the matched author rules grouped by STATE (resting/hover/
// focus/active) WITH their source stylesheet, and empirically-dead classes.
//
// WHY HEADED: headless Playwright does NOT faithfully render this app's
// JS/token/canvas components (GlassRing, BorderGlow, glass-field-hole) — tokens
// come back "undefined", surfaces flat. Proven: the same primary button reads
// `--btn-primary-bg: none` headless but the real per-theme gradient headed. So
// this crawler runs headed. (Structural "element never renders" dead-code is
// already covered by css-effective-audit; this adds the WIN/provenance/state
// picture headless can't give.)
//
// The inspection logic lives in scripts/browser-inspect.js (also usable
// standalone via the Claude Chrome extension); this script injects it per page.
//
// Three things the plain crawl was BLIND to, now covered:
//   1. flows[]  — primitives revealed only behind a click (portaled modals,
//      overlay panels) are opened per-theme and inspected; output keyed
//      "<route>#<flowName>". Without this a portaled modal's buttons are never
//      seen, so a broken CSS-var inheritance (e.g. --btn-primary-shadow) is
//      invisible.
//   2. hover     — after the resting inspect, :hover is forced via CDP
//      (CSS.forcePseudoState) on the elements that rendered and they are
//      re-measured, so the report carries the RESOLVED hover design, not just
//      which selectors match in hover.
//   3. consistency.md — fingerprints every visible instance of each selector by
//      its design (tokens + paint props, resting AND hover) and flags any
//      selector that paints >1 design within a theme — the "these two buttons
//      should be identical but aren't" check, done automatically.
//
// Outputs (under --out dir):
//   <route>.md         human-readable per-route report (one section per theme),
//                      now incl. a "hover Δ" line per instance
//   report.json        full structured data (all routes × themes, incl. hover)
//   dead-candidates.md classes that appeared on inspected elements but NEVER
//                      contributed to the key props anywhere → delete candidates
//                      (scoped to the inspected primitives + keyProps; verify).
//   consistency.md     selector×theme groups where one primitive paints >1 design
//
// Run against a PRODUCTION build (`next build` + `next start`).
//
// Usage:
//   node scripts/css-page-report.mjs \
//     [--targets scripts/css-page-report.targets.json] \
//     [--routes scripts/css-effective-audit.routes.json] \
//     [--out reports/css-page-report/<date>] \
//     [--base-url http://localhost:3000] [--token <t>] [--headless]
//
// Auth: env SNAPSHOT_SESSION (session-token cookie) or --token, else generated.

import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const INSPECT_PATH = path.join(ROOT, "scripts", "browser-inspect.js");

const THEMES = [
  { id: "light", theme: "light", contrast: "normal" },
  { id: "mid", theme: "mid", contrast: "normal" },
  { id: "dark", theme: "dark", contrast: "normal" },
  { id: "night", theme: "night", contrast: "normal" },
  { id: "mono", theme: "mono", contrast: "normal" },
  { id: "hc", theme: "dark", contrast: "hc" },
];

function parseArgs(argv) {
  const out = {
    targets: "scripts/css-page-report.targets.json",
    routes: "scripts/css-effective-audit.routes.json",
    out: null, token: null, baseUrl: "http://localhost:3000", headless: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--targets") out.targets = argv[++i];
    else if (a === "--routes") out.routes = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--token") out.token = argv[++i];
    else if (a === "--base-url") out.baseUrl = argv[++i];
    else if (a === "--headless") out.headless = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!out.out) out.out = `reports/css-page-report/${new Date().toISOString().slice(0, 10)}`;
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
    const r = await fetch("/api/auth/callback/credentials", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString(), redirect: "manual" });
    return { status: r.status };
  }, token);
  if (res.status >= 400) throw new Error(`login failed: ${res.status}`);
}

async function applyTheme(page, theme) {
  await page.evaluate(({ theme, contrast }) => {
    window.localStorage.setItem("theme", theme);
    let prefs = {}; try { prefs = JSON.parse(window.localStorage.getItem("a11y_prefs") || "{}"); } catch { prefs = {}; }
    prefs.theme = theme; prefs.contrast = contrast;
    window.localStorage.setItem("a11y_prefs", JSON.stringify(prefs));
  }, theme);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(({ theme, contrast }) => {
    const root = document.documentElement; const cls = root.className || "";
    const contrastOk = contrast === "hc" ? root.getAttribute("data-contrast") === "hc" : root.getAttribute("data-contrast") !== "hc";
    const themeOk = contrast === "hc" ? true
      : theme === "light" ? cls.includes("theme-light") && !cls.includes("theme-mid")
      : theme === "mid" ? cls.includes("theme-mid")
      : theme === "night" ? cls.includes("theme-night")
      : theme === "mono" ? cls.includes("theme-mono")
      : !/theme-(light|mid|night|mono)/.test(cls);
    return contrastOk && themeOk;
  }, theme, { timeout: 30000, polling: 100 });
}

async function freezeMotion(page) {
  await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" }).catch(() => {});
}
const flush = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

const runInspect = (page, sels, keyProps, tokens) =>
  page.evaluate(({ sels, keyProps, tokens }) => window.__inspect(sels, keyProps, tokens), { sels, keyProps, tokens });

// Force (or clear) :hover on every element matching the given selectors, via CDP
// — physical mouse-hover is unreliable here, but CSS.forcePseudoState makes the
// real engine resolve the hover cascade so "the browser is the judge" still holds.
async function forcePseudoHover(client, sels, on) {
  let rootNodeId;
  try { rootNodeId = (await client.send("DOM.getDocument", { depth: 0 })).root.nodeId; } catch { return; }
  for (const sel of sels) {
    let nodeIds;
    try { nodeIds = (await client.send("DOM.querySelectorAll", { nodeId: rootNodeId, selector: sel })).nodeIds; } catch { continue; }
    for (const nodeId of nodeIds) {
      try { await client.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: on ? ["hover"] : [] }); } catch {}
    }
  }
}

// Inspect resting state, then force :hover on the elements that actually rendered
// and re-inspect, merging the hover-resolved computed/tokens onto each instance as
// hoverComputed/hoverTokens. (Inspect script must already be injected.)
async function inspectWithHover(page, client, sels, keyProps, tokens) {
  const resting = await runInspect(page, sels, keyProps, tokens);
  const hitSels = Object.entries(resting.targets).filter(([, t]) => t.count).map(([s]) => s);
  if (!hitSels.length) return resting;
  await forcePseudoHover(client, hitSels, true);
  await flush(page);
  const hover = await runInspect(page, sels, keyProps, tokens);
  await forcePseudoHover(client, hitSels, false);
  await flush(page);
  for (const [sel, t] of Object.entries(resting.targets)) {
    const ht = hover.targets[sel];
    if (!t.instances || !ht?.instances) continue;
    t.instances.forEach((inst, i) => {
      const hi = ht.instances[i];
      if (!hi) return;
      inst.hoverComputed = hi.computed;
      inst.hoverTokens = hi.tokens;
    });
  }
  return resting;
}

// Run one flow step against the live page. Steps reveal primitives behind clicks.
// NB: motion is NOT frozen here — reveal/open animations must run so the target
// becomes visible+clickable; the caller freezes once, after all steps settle.
async function runFlowStep(page, baseUrl, step) {
  if (step.goto != null) await page.goto(`${baseUrl}${step.goto}`, { waitUntil: "domcontentloaded" });
  else if (step.click != null) await page.click(step.click, { timeout: 8000, force: step.force === true });
  else if (step.waitFor != null) await page.waitForSelector(step.waitFor, { state: "visible", timeout: 8000 });
  else if (step.waitMs != null) await page.waitForTimeout(step.waitMs);
  else throw new Error(`unknown flow step: ${JSON.stringify(step)}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = JSON.parse(readFileSync(args.targets, "utf8"));
  const { selectors, keyProps, tokens } = cfg;
  const flows = cfg.flows || [];
  const routesDoc = JSON.parse(readFileSync(args.routes, "utf8"));
  const routes = routesDoc.routes ?? routesDoc;
  const inspectSrc = readFileSync(INSPECT_PATH, "utf8");

  process.stderr.write(`selectors: ${selectors.length} · routes: ${routes.length} · themes: ${THEMES.length} · headed: ${!args.headless}\n`);

  const needsAuth = routes.some((r) => r.auth !== false);
  const sessionCookie = process.env.SNAPSHOT_SESSION || null;
  const token = needsAuth && !sessionCookie ? args.token || generateToken() : null;

  // HEADED for faithful render; reducedMotion routes to the cheap static
  // background so 222 reloads don't tax the WebGL layer (tokens are CSS, so
  // motion does not affect them).
  const browser = await chromium.launch({ headless: args.headless, args: ["--disable-dev-shm-usage"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  if (needsAuth && sessionCookie) {
    const { hostname } = new URL(args.baseUrl);
    await context.addCookies([{ name: "next-auth.session-token", value: sessionCookie, domain: hostname, path: "/", httpOnly: true, sameSite: "Lax" }]);
  }
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(30000);
  // CDP session drives the :hover pass (CSS.forcePseudoState). One per page.
  const client = await context.newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  if (token) await login(page, args.baseUrl, token);

  // data[route][themeId] = inspect report  (flows keyed as "<route>#<name>")
  const data = {};
  // dead-candidate aggregation: class -> { seen:Set("route@theme"), alive:Set }
  const classStats = new Map();
  const note = (cls, key, alive) => {
    if (!classStats.has(cls)) classStats.set(cls, { seen: new Set(), alive: new Set() });
    const s = classStats.get(cls); s.seen.add(key); if (alive) s.alive.add(key);
  };
  const aggregateDead = (rep, key) => {
    for (const t of Object.values(rep.targets)) {
      if (!t.instances) continue;
      for (const inst of t.instances) {
        const dead = new Set(inst.deadAtThisState || []);
        for (const c of inst.semantic || []) note(c, key, !dead.has(c));
      }
    }
  };

  for (const r of routes) {
    if (r.auth !== false && !needsAuth) continue;
    const route = r.route ?? r;
    data[route] = {};
    for (const theme of THEMES) {
      try {
        // Reset to blank first to stop any in-flight pushWithTransition from the
        // previous route, which can fire a navigation mid-inspect and destroy context.
        await page.goto("about:blank", { waitUntil: "domcontentloaded" }).catch(() => {});
        await page.goto(`${args.baseUrl}${route}`, { waitUntil: "domcontentloaded" });
        // Skip routes that redirect away (client-side auth guards, etc.)
        const landed = new URL(page.url()).pathname;
        if (landed !== route) {
          process.stderr.write(`  ↷ ${route} → redirected to ${landed} (skipped)\n`);
          continue;
        }
        await applyTheme(page, theme);
        await freezeMotion(page);
        await flush(page);
        await page.addScriptTag({ content: inspectSrc });
        const rep = await inspectWithHover(page, client, selectors, keyProps, tokens);
        data[route][theme.id] = rep;
        aggregateDead(rep, `${route}@${theme.id}`);
        const hits = Object.values(rep.targets).reduce((n, t) => n + (t.count || 0), 0);
        process.stderr.write(`  ✓ ${route} @${theme.id} (${hits} primitive hits)\n`);
      } catch (e) {
        process.stderr.write(`  ⚠ ${route} @${theme.id}: ${String(e.message).split("\n")[0]}\n`);
        if (page.isClosed()) throw new Error("page/browser closed — aborting");
      }
    }
  }

  // ---- flows: primitives revealed only behind interactions (portaled modals) ----
  for (const flow of flows) {
    const flowSelectors = [...selectors, ...(flow.selectors || [])];
    const key = `${flow.route}#${flow.name}`;
    data[key] = {};
    for (const theme of THEMES) {
      try {
        await page.goto("about:blank", { waitUntil: "domcontentloaded" }).catch(() => {});
        await page.goto(`${args.baseUrl}${flow.route}`, { waitUntil: "domcontentloaded" });
        const landed = new URL(page.url()).pathname;
        if (landed !== flow.route) {
          process.stderr.write(`  ↷ ${key} → redirected to ${landed} (skipped)\n`);
          continue;
        }
        await applyTheme(page, theme); // sets+persists theme; steps may re-navigate
        for (const step of flow.steps) await runFlowStep(page, args.baseUrl, step);
        await freezeMotion(page);
        await flush(page);
        await page.addScriptTag({ content: inspectSrc });
        const rep = await inspectWithHover(page, client, flowSelectors, keyProps, tokens);
        data[key][theme.id] = rep;
        aggregateDead(rep, `${key}@${theme.id}`);
        const hits = Object.values(rep.targets).reduce((n, t) => n + (t.count || 0), 0);
        process.stderr.write(`  ✓ ${key} @${theme.id} (${hits} primitive hits)\n`);
      } catch (e) {
        process.stderr.write(`  ⚠ ${key} @${theme.id}: ${String(e.message).split("\n")[0]}\n`);
        if (page.isClosed()) throw new Error("page/browser closed — aborting");
      }
    }
  }
  await browser.close();

  // ---- write outputs ----
  mkdirSync(args.out, { recursive: true });
  writeFileSync(path.join(args.out, "report.json"), JSON.stringify({ capturedAt: new Date().toISOString(), themes: THEMES.map((t) => t.id), selectors, data }, null, 2));

  for (const [route, themes] of Object.entries(data)) {
    const anyHit = Object.values(themes).some((rep) => Object.values(rep.targets).some((t) => t.count));
    if (!anyHit) continue;
    writeFileSync(path.join(args.out, routeFile(route) + ".md"), routeMarkdown(route, themes, keyProps));
  }
  writeFileSync(path.join(args.out, "dead-candidates.md"), deadMarkdown(classStats));
  const { md: consistencyMd, divergences } = consistencyMarkdown(data, tokens);
  writeFileSync(path.join(args.out, "consistency.md"), consistencyMd);

  const candidates = [...classStats.entries()].filter(([, s]) => s.alive.size === 0).length;
  process.stderr.write(`\nwrote ${args.out}/\n  per-route reports + report.json\n  dead-candidates.md: ${candidates} class(es) never contributed to key props anywhere (verify before delete)\n  consistency.md: ${divergences} selector×theme group(s) where one primitive paints >1 design (inconsistency)\n`);
}

// Props that define a button's DESIGN identity (not its position on the page).
// A primary button at /vestlus and the same in a modal SHOULD share these; if
// they don't, that's the inconsistency the route crawl alone can't surface.
const DESIGN_PROPS = ["backgroundImage", "color", "boxShadow", "borderTopColor", "borderTopWidth", "borderTopStyle", "borderTopLeftRadius"];
// Hover fingerprint = the DISCRETE, deterministic hover signals only. The
// background-swap is the real hover-bug class (e.g. ui-glow.css's `!important`
// var(--btn-primary-bg-hover)). Hover box-shadow/color on glass buttons carry
// BorderGlow canvas noise (JS/mouse-reactive, sub-pixel, non-deterministic), so
// they'd flag false positives — they stay in the per-route "hover Δ" line for
// human review but don't drive the consistency fingerprint.
const HOVER_DESIGN_PROPS = ["backgroundImage", "backgroundColor"];

// Collapse sub-pixel / sub-unit render noise (canvas glow, layout rounding) so
// only real, discrete design differences survive the fingerprint. Lengths & rgb
// channels → nearest 1; alpha & other sub-unit values → nearest 0.05. The target
// bug class (inset-vs-soft shadow, gradient-stop swaps, on/off shadow) is discrete
// and survives untouched.
// getComputedStyle preserves whatever CSS color-function authored the value, so
// the SAME color can serialize as rgb(34,34,34) on one button and
// color(srgb 0.133 0.133 0.133) on another — that would flag identical colors as
// different. Canonicalise sRGB color() back to rgb() integers before fingerprinting.
const normColor = (s) => String(s).replace(
  /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/g,
  (_, r, g, b, a) => `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)}${a != null ? ` / ${a}` : ""})`);

const quantize = (v) => normColor(v).replace(/-?\d+(\.\d+)?/g, (m) => {
  const n = parseFloat(m);
  if (Number.isNaN(n)) return m;
  return Math.abs(n) >= 1 ? String(Math.round(n)) : String(Math.round(n * 20) / 20);
});

// For each selector × theme, fingerprint every rendered instance by its resolved
// design (tokens + paint props, RESTING and HOVER). >1 distinct fingerprint means
// the same primitive renders more than one design across routes/modals → flag it.
function consistencyMarkdown(data, tokenNames) {
  // "selector @variant" -> theme -> Map(fingerprint -> { props, origins:Set }).
  // Grouping by data-variant too means a class shared across variants (e.g. a
  // sizing class on both a primary and a danger button) compares primary-with-
  // primary, not flagging the intentional primary-vs-danger difference.
  const groups = new Map();
  for (const [origin, themes] of Object.entries(data)) {
    for (const [themeId, rep] of Object.entries(themes)) {
      for (const [sel, t] of Object.entries(rep.targets)) {
        if (!t.instances) continue;
        for (const inst of t.instances) {
          if (inst.visible === false) continue; // hidden instances don't define the design
          const groupKey = inst.variant ? `${sel} @${inst.variant}` : sel;
          const fp = {};
          for (const p of DESIGN_PROPS) fp[`r:${p}`] = quantize(inst.computed?.[p] ?? "");
          for (const p of HOVER_DESIGN_PROPS) fp[`h:${p}`] = quantize(inst.hoverComputed?.[p] ?? inst.computed?.[p] ?? "");
          // Tokens define design identity ONLY for variant-bearing buttons that
          // actually consume them. Raw alias buttons (e.g. transparent .back-button)
          // merely inherit --btn-primary-* unused, so including them here would flag
          // harmless inherited-context noise — compare those by painted result only.
          if (inst.variant) for (const tk of tokenNames) fp[`t:${tk}`] = inst.tokens?.[tk] ?? "";
          const fpKey = JSON.stringify(fp);
          if (!groups.has(groupKey)) groups.set(groupKey, new Map());
          const byTheme = groups.get(groupKey);
          if (!byTheme.has(themeId)) byTheme.set(themeId, new Map());
          const byFp = byTheme.get(themeId);
          if (!byFp.has(fpKey)) byFp.set(fpKey, { props: fp, origins: new Map() });
          const g = byFp.get(fpKey);
          g.origins.set(origin, (g.origins.get(origin) || 0) + 1);
        }
      }
    }
  }

  const L = ["# Button consistency — divergences", "",
    "> For each inspected selector × theme, visible instances are grouped by a",
    "> DESIGN fingerprint: resolved tokens + paint props, RESTING **and** HOVER",
    "> (position/transform/visibility excluded — those legitimately vary). A",
    "> selector showing >1 group should be ONE design but isn't — the same",
    "> primitive paints differently across routes, modals or hover. This is the",
    "> class of bug the per-route crawl is blind to (it never opens modals and",
    "> never resolves hover).", ""];
  let divergences = 0;
  for (const [sel, byTheme] of groups) {
    for (const [themeId, byFp] of byTheme) {
      if (byFp.size < 2) continue;
      divergences++;
      const variants = [...byFp.values()].sort((a, b) => total(b.origins) - total(a.origins));
      L.push(`## \`${sel}\` @${themeId} — ${byFp.size} variants`, "");
      variants.forEach((v, i) => {
        const tag = String.fromCharCode(65 + i);
        const originList = [...v.origins.entries()].map(([o, n]) => (n > 1 ? `${o}×${n}` : o)).join(", ");
        L.push(`- **variant ${tag}** (${total(v.origins)}×): ${originList}`);
        const diffKeys = Object.keys(v.props).filter((k) => variants.some((o) => o.props[k] !== v.props[k]));
        for (const k of diffKeys) L.push(`    - ${k.replace(/^r:/, "").replace(/^h:/, "hover ").replace(/^t:/, "")} = ${short(v.props[k], 60)}`);
      });
      L.push("");
    }
  }
  if (!divergences) L.push("_No divergences — every inspected primitive paints one consistent design per theme._", "");
  return { md: L.join("\n"), divergences };
}
const total = (m) => [...m.values()].reduce((a, b) => a + b, 0);

function routeFile(route) { return (route === "/" ? "_root" : route.replace(/^\//, "").replace(/\//g, "_")) || "_root"; }
const short = (s, n = 70) => (s == null ? s : String(s).length > n ? String(s).slice(0, n - 1) + "…" : String(s));

function routeMarkdown(route, themes, keyProps) {
  const L = [`# ${route} — primitive CSS report`, ""];
  for (const [themeId, rep] of Object.entries(themes)) {
    const targetsWithHits = Object.entries(rep.targets).filter(([, t]) => t.count);
    if (!targetsWithHits.length) continue;
    L.push(`## ${themeId}`, "");
    for (const [sel, t] of targetsWithHits) {
      L.push(`### \`${sel}\` ×${t.count}`, "");
      for (const inst of t.instances) {
        const flags = [inst.visible === false ? "hidden" : "visible", inst.disabled ? "disabled" : null].filter(Boolean).join(", ");
        L.push(`- **<${inst.tag}>** [${flags}] semantic: \`${inst.semantic.join(" ")}\`${inst.modules.length ? ` · modules: ${[...new Set(inst.modules)].join(",")}` : ""}`);
        if (inst.tailwind?.length) L.push(`  - tailwind (${inst.tailwind.length}): \`${short(inst.tailwind.join(" "), 110)}\``);
        const comp = keyProps.map((p) => inst.computed[p]).filter((v) => v && v !== "none" && v !== "rgba(0, 0, 0, 0)" && v !== "0px").length;
        L.push(`  - computed: ${keyProps.filter((p) => inst.computed[p] && inst.computed[p] !== "none" && inst.computed[p] !== "rgba(0, 0, 0, 0)" && inst.computed[p] !== "0px").map((p) => `${p}=${short(inst.computed[p], 34)}`).join(" · ") || "(none)"}`);
        const toks = Object.entries(inst.tokens).filter(([, v]) => v).map(([k, v]) => `${k}=${short(v, 34)}`);
        if (toks.length) L.push(`  - tokens: ${toks.join(" · ")}`);
        // hover: only the props whose RESOLVED value actually changes on :hover
        if (inst.hoverComputed) {
          const deltas = keyProps.filter((p) => inst.hoverComputed[p] && inst.hoverComputed[p] !== inst.computed[p] && inst.hoverComputed[p] !== "none");
          if (deltas.length) L.push(`  - hover Δ: ${deltas.map((p) => `${p}=${short(inst.hoverComputed[p], 34)}`).join(" · ")}`);
        }
        if (inst.deadAtThisState?.length) L.push(`  - dead@state: \`${inst.deadAtThisState.join(" ")}\``);
        // matched rules grouped by state
        const byState = {};
        for (const m of inst.matched) (byState[m.state] = byState[m.state] || []).push(`${m.src} | ${short(m.sel, 56)} → [${m.props.join(",")}]`);
        for (const st of ["resting", "hover", "focus-visible", "focus", "active"]) {
          if (!byState[st]) continue;
          L.push(`  - ${st}:`);
          for (const line of [...new Set(byState[st])]) L.push(`    - ${line}`);
        }
        L.push("");
      }
    }
  }
  return L.join("\n");
}

function deadMarkdown(classStats) {
  const rows = [...classStats.entries()].map(([cls, s]) => ({ cls, seen: s.seen.size, alive: s.alive.size }));
  rows.sort((a, b) => a.alive - b.alive || b.seen - a.seen);
  const L = ["# Dead-class candidates (scoped to inspected primitives + keyProps)", "",
    "> A semantic class that appeared on an inspected element but NEVER contributed",
    "> to the key computed props in ANY route/theme/resting-state. Strong delete",
    "> candidate FOR THESE PROPS — but a class may still set props not measured",
    "> (appearance/transition) or only matter in hover/active. Verify before deleting.",
    "", "| class | seen (route@theme) | contributed | verdict |", "|---|---|---|---|"];
  for (const r of rows) L.push(`| \`${r.cls}\` | ${r.seen} | ${r.alive} | ${r.alive === 0 ? "**never — candidate**" : "alive"} |`);
  return L.join("\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
