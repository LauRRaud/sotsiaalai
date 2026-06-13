// Computed-style snapshot harness for CSS cleanup verification.
//
// Captures getComputedStyle for chosen selectors × properties across every
// theme and viewport, into a JSON "golden master". Run it BEFORE a CSS change
// and AFTER, then `css-snapshot-diff.mjs` proves whether anything visual moved
// — far more reliable than eyeballing screenshots (contract tests do not catch
// visual regressions). See reports/css-struktuuriplaan-2026-06-11.md §9.
//
// Usage:
//   node scripts/css-snapshot.mjs --out reports/css-snapshots/<name>.json
//   node scripts/css-snapshot.mjs --targets <file> --out <file> [--token <t>]
//                                 [--base-url http://localhost:3000] [--headed]
//
// Auth: pages behind login need a session. Options, in priority order:
//   1. env SNAPSHOT_SESSION — a next-auth.session-token cookie value (set
//      directly on the browser context; nothing is written to disk or logged).
//   2. --token <t> — a temp login token (runs the NextAuth credentials flow).
//   3. otherwise generate a token via scripts/tmp-create-login-token.mjs.
// Targets whose `auth` is false are captured without logging in.

import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

// Theme is driven through the app's real mechanism: localStorage "theme" +
// "a11y_prefs".contrast, read by the layout.js boot script AND by React (some
// theming is JS-prop-driven, e.g. SVG icons via isLightTheme — a raw root-class
// toggle would miss those). We set storage then reload so both paths apply.
const THEMES = [
  { id: "light", theme: "light", contrast: "normal" },
  { id: "mid", theme: "mid", contrast: "normal" },
  { id: "dark", theme: "dark", contrast: "normal" },
  { id: "night", theme: "night", contrast: "normal" },
  { id: "mono", theme: "mono", contrast: "normal" },
  { id: "hc", theme: "dark", contrast: "hc" }, // app forces theme=dark under hc
];

const VIEWPORTS = [
  { id: "desktop", width: 1180, height: 820 },
  { id: "mobile", width: 390, height: 780 },
];

function parseArgs(argv) {
  const out = { targets: "scripts/css-snapshot.targets.json", out: null, token: null, baseUrl: "http://localhost:3000", headed: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--targets") out.targets = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--token") out.token = argv[++i];
    else if (a === "--base-url") out.baseUrl = argv[++i];
    else if (a === "--headed") out.headed = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!out.out) throw new Error("--out <file> is required");
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
    const body = new URLSearchParams({
      csrfToken: csrf.csrfToken,
      temp_login_token: tok,
      callbackUrl: "/vestlus",
      json: "true",
    });
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

async function applyTheme(page, theme, settleMs) {
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
  // Reload so the layout.js boot script + AccessibilityProvider re-apply the
  // theme (class + data-contrast) and React re-hydrates isLightTheme.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(settleMs);
}

async function captureTarget(page, target) {
  const result = {};
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // domcontentloaded, not networkidle: chat/profile keep long-lived
    // connections (polling/ws) so networkidle never fires. A fixed settle
    // covers hydration + the orbital/rail mount.
    await page.goto(`${page.context()._baseUrl}${target.route}`, { waitUntil: "domcontentloaded" });
    const settle = target.settleMs ?? 1200;
    for (const theme of THEMES) {
      await applyTheme(page, theme, settle); // sets localStorage + reloads
      if (target.waitFor) await page.waitForSelector(target.waitFor, { timeout: 8000 }).catch(() => {});
      const captured = await page.evaluate(
        ({ selectors, properties }) => {
          const out = {};
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (!el) {
              out[sel] = null;
              continue;
            }
            const cs = getComputedStyle(el);
            const props = {};
            for (const p of properties) props[p] = cs.getPropertyValue(p);
            out[sel] = props;
          }
          return out;
        },
        { selectors: target.selectors, properties: target.properties }
      );
      for (const [sel, props] of Object.entries(captured)) {
        result[sel] ??= {};
        result[sel][`${theme.id}/${vp.id}`] = props;
      }
    }
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const targets = JSON.parse(readFileSync(args.targets, "utf8"));
  const needsAuth = targets.some((t) => t.auth !== false);
  const sessionCookie = process.env.SNAPSHOT_SESSION || null;
  const token = needsAuth && !sessionCookie ? args.token || generateToken() : null;

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  context._baseUrl = args.baseUrl;

  if (needsAuth && sessionCookie) {
    const { hostname } = new URL(args.baseUrl);
    await context.addCookies([
      { name: "next-auth.session-token", value: sessionCookie, domain: hostname, path: "/", httpOnly: true, sameSite: "Lax" },
    ]);
  }

  const page = await context.newPage();
  page.context()._baseUrl = args.baseUrl;

  if (token) await login(page, args.baseUrl, token);

  const snapshot = { capturedAt: new Date().toISOString(), baseUrl: args.baseUrl, targets: {} };
  for (const target of targets) {
    process.stderr.write(`capturing ${target.name} (${target.route})...\n`);
    snapshot.targets[target.name] = await captureTarget(page, target);
  }

  await browser.close();
  mkdirSync(path.dirname(args.out), { recursive: true });
  const { writeFileSync } = await import("node:fs");
  writeFileSync(args.out, JSON.stringify(snapshot, null, 2));
  process.stderr.write(`\nwrote ${args.out}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
