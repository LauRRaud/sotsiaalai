// Matched-rules inventory for CSS cleanup — surfaces "one element, N designs"
// (e.g. a button styled by 10 scattered rules where only the last wins). For
// each target selector it asks the browser, via CDP, EVERY CSS rule that
// matches — across all themes and forced :hover/:focus/:active states — and
// reports each rule's source file:line + declared properties. The browser does
// the matching (incl. pseudo-states via CSS.forcePseudoState), so this is robust
// — no fragile cascade re-implementation. Use it to find scattered/legacy rules
// that should collapse into a canonical component (components/ui/Button.jsx etc.)
// + theme tokens; then verify the consolidation with css-snapshot + css-snapshot-diff.
//
// Usage:
//   node scripts/css-matched-rules.mjs --selector ".invite-refresh-btn" --out report.json
//   node scripts/css-matched-rules.mjs --targets <file> --out <file>
//        [--pseudo normal,hover,focus] [--token <t>] [--base-url <url>] [--headed]
//
// Auth: env SNAPSHOT_SESSION (next-auth.session-token), or --token, or
// auto-generated via scripts/tmp-create-login-token.mjs. A target route default
// is /vestlus; override per target.
//
// Output per rule: its selector text, the declared properties, and `[N/6
// states]` — how many of the 6 themes it applied in (e.g. [1/6] = a single
// theme/contrast override, [6/6] = unconditional). Locations point at the dev
// server's COMPILED css chunk (line included), not the source file — grep the
// selector text in app/styles + components to find the source. Note: on Git
// Bash, run with `MSYS_NO_PATHCONV=1` so a `/route` arg is not path-mangled.

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

function parseArgs(argv) {
  const out = { targets: null, selector: null, route: "/vestlus", out: null, token: null, baseUrl: "http://localhost:3000", headed: false, pseudo: ["normal", "hover", "focus"] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--targets") out.targets = argv[++i];
    else if (a === "--selector") out.selector = argv[++i];
    else if (a === "--route") out.route = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--token") out.token = argv[++i];
    else if (a === "--base-url") out.baseUrl = argv[++i];
    else if (a === "--pseudo") out.pseudo = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--headed") out.headed = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!out.out) throw new Error("--out <file> is required");
  if (!out.targets && !out.selector) throw new Error("provide --selector <sel> or --targets <file>");
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
    let prefs = {};
    try {
      prefs = JSON.parse(window.localStorage.getItem("a11y_prefs") || "{}");
    } catch {
      prefs = {};
    }
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
        contrast === "hc" ? true : theme === "light" ? cls.includes("theme-light") && !cls.includes("theme-mid") : theme === "mid" ? cls.includes("theme-mid") : theme === "night" ? cls.includes("theme-night") : theme === "mono" ? cls.includes("theme-mono") : !/theme-(light|mid|night|mono)/.test(cls);
      return contrastOk && themeOk;
    },
    theme,
    { timeout: 30000, polling: 100 }
  );
}

// Build styleSheetId -> source url map from CSS.styleSheetAdded events.
function sheetTracker(cdp) {
  const sheets = new Map();
  cdp.on("CSS.styleSheetAdded", ({ header }) => {
    sheets.set(header.styleSheetId, header.sourceURL || header.sourceMapURL || `inline#${header.styleSheetId}`);
  });
  return sheets;
}

function ruleLocation(sheets, rule) {
  const url = sheets.get(rule.styleSheetId) || `sheet#${rule.styleSheetId}`;
  const file = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0] || url;
  const r = rule.style?.range;
  const line = r ? r.startLine + 1 : null; // CDP lines are 0-based
  return line ? `${file}:${line}` : file;
}

async function matchedRulesFor(page, cdp, sheets, selector, forcedPseudo) {
  // Wait for the element to actually mount (the rail/orbital mount after
  // hydration) and let layout flush, so the query below sees it.
  const handle = await page.waitForSelector(selector, { state: "attached", timeout: 30000 }).catch(() => null);
  if (!handle) return { found: false, rules: [] };
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  // Populate the frontend DOM tree first — without it DOM.requestNode resolves
  // objectIds to nodeId 0 (invalid) and CSS.getMatchedStylesForNode rejects.
  await cdp.send("DOM.getDocument", { depth: -1 });
  // Resolve the node via Runtime → DOM.requestNode: this pushes the node to the
  // frontend so CSS.* methods accept its id.
  const evalRes = await cdp.send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(selector)})`, returnByValue: false });
  const objectId = evalRes.result?.objectId;
  if (!objectId) return { found: false, rules: [] };
  const { nodeId } = await cdp.send("DOM.requestNode", { objectId });
  if (!nodeId) return { found: false, rules: [] };
  if (forcedPseudo && forcedPseudo !== "normal") {
    await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [forcedPseudo] });
  }
  const matched = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
  // reset forced state so it doesn't leak into the next query
  if (forcedPseudo && forcedPseudo !== "normal") {
    await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
  }
  const rules = (matched.matchedCSSRules || []).map(({ rule }) => ({
    selector: rule.selectorList?.text ?? "",
    at: ruleLocation(sheets, rule),
    origin: rule.origin, // "regular" | "user-agent" | "injected" | "inspector"
    declarations: (rule.style?.cssProperties || [])
      .filter((p) => p.text && !p.disabled && p.value !== undefined)
      .map((p) => `${p.name}: ${p.value}${p.important ? " !important" : ""}`),
  }));
  // keep only author rules (drop the user-agent sheet noise)
  return { found: true, rules: rules.filter((r) => r.origin === "regular") };
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
  // Generous but finite: real route-compile slowness passes; a dead server
  // errors instead of hanging forever.
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(30000);
  if (token) await login(page, args.baseUrl, token);

  const cdp = await context.newCDPSession(page);
  const sheets = sheetTracker(cdp);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");

  const report = { capturedAt: new Date().toISOString(), pseudo: args.pseudo, targets: {} };
  for (const target of targets) {
    process.stderr.write(`inspecting ${target.name} (${target.route ?? args.route})...\n`);
    const route = target.route ?? args.route;
    const perTarget = {};
    for (const theme of THEMES) {
      await page.goto(`${args.baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      await applyTheme(page, theme);
      for (const pseudo of args.pseudo) {
        const { found, rules } = await matchedRulesFor(page, cdp, sheets, target.selector, pseudo);
        perTarget[`${theme.id}/${pseudo}`] = found ? rules : null;
      }
    }
    // dedupe: collect the union of distinct rules (selector@location) seen, with
    // the set of states each appears in — the cleanup target list.
    const seen = new Map();
    for (const [state, rules] of Object.entries(perTarget)) {
      for (const r of rules || []) {
        const key = `${r.selector}  @  ${r.at}`;
        if (!seen.has(key)) seen.set(key, { selector: r.selector, at: r.at, declarations: r.declarations, states: [] });
        seen.get(key).states.push(state);
      }
    }
    report.targets[target.name] = { selector: target.selector, route, byState: perTarget, distinctRules: [...seen.values()] };
  }

  await browser.close();
  mkdirSync(path.dirname(args.out), { recursive: true });
  writeFileSync(args.out, JSON.stringify(report, null, 2));

  // human summary to stderr
  for (const [name, t] of Object.entries(report.targets)) {
    process.stderr.write(`\n${name}  (${t.selector})  — ${t.distinctRules.length} distinct author rules:\n`);
    for (const r of t.distinctRules) {
      process.stderr.write(`  ${r.at}\n    ${r.selector}\n    [${r.states.length}/${THEMES.length * args.pseudo.length} states] ${r.declarations.slice(0, 4).join("; ")}${r.declarations.length > 4 ? " …" : ""}\n`);
    }
  }
  process.stderr.write(`\nwrote ${args.out}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
