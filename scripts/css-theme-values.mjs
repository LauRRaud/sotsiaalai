// Theme value table — captures the WINNING token value of each button (or any)
// archetype across every route × every theme, so the per-theme design lives in ONE
// derived file instead of being guessed from scattered CSS.
//
// WHY (and how it differs from the siblings):
//   - css-effective-audit.mjs → crawls all pages × themes but records only
//     liveness (dead/alive); it reads getComputedStyleForNode and THROWS the
//     values away. This tool reuses that same crawl/theme machinery and KEEPS the
//     values, keyed archetype × theme.
//   - css-snapshot.mjs → captures values too, but for a hand-listed target set and
//     as a before/after GATE. This tool auto-aggregates across all routes and
//     surfaces DISTINCT values per theme (drift detection), to DERIVE tokens.
//   - css-matched-rules.mjs → per-selector rule provenance (investigation).
//
// We do NOT read the matched button's own rendered background: primary/glow
// buttons paint their themed surface via <BorderGlow> on a CANVAS (and hover via
// ::before), so the element's own computed background is a flat fallback. Instead
// we read TOKEN values via a PROBE: append a probe child to each matched element,
// apply the token to a real CSS property, and read the resolved longhand back.
// Custom properties inherit, so the probe resolves the button's EFFECTIVE token
// (theme baseline + any feature/element override). This is faithful to the
// contract (reports/css-button-system.md): theme files set :root.theme-X tokens;
// this table is their derived source of truth.
//
// Output per archetype × theme:
//   - ONE value tuple = the token value to write into :root.theme-X { --…: }.
//   - MORE THAN ONE = drift to reconcile (routes listed for each).
//
// Run against a PRODUCTION build (`next build` + `next start`); the dev server
// dies under repeated theme reloads.
//
// Usage:
//   node scripts/css-theme-values.mjs \
//     [--targets scripts/css-theme-values.targets.json] \
//     [--routes scripts/css-effective-audit.routes.json] \
//     [--out reports/css-theme-values/<date>.json] \
//     [--base-url http://localhost:3000] [--token <t>] [--headed]
//
// Auth: env SNAPSHOT_SESSION (session-token cookie) or --token (temp login token),
// else a token is generated. auth:false routes are crawled logged-out.

import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

// 6 themes — identical axis to css-effective-audit / css-snapshot (hc forces
// theme=dark + data-contrast=hc in the app).
const THEMES = [
  { id: "light", theme: "light", contrast: "normal" },
  { id: "mid", theme: "mid", contrast: "normal" },
  { id: "dark", theme: "dark", contrast: "normal" },
  { id: "night", theme: "night", contrast: "normal" },
  { id: "mono", theme: "mono", contrast: "normal" },
  { id: "hc", theme: "dark", contrast: "hc" },
];

// Two viewports straddle the 768/769 split: a mobile-only or desktop-only button
// still gets captured at the width where it renders.
const VIEWPORTS = [
  { id: "mobile", width: 390, height: 780 },
  { id: "desktop", width: 1440, height: 900 },
];

function parseArgs(argv) {
  const out = {
    targets: "scripts/css-theme-values.targets.json",
    routes: "scripts/css-effective-audit.routes.json",
    out: null,
    token: null,
    baseUrl: "http://localhost:3000",
    headed: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--targets") out.targets = argv[++i];
    else if (a === "--routes") out.routes = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--token") out.token = argv[++i];
    else if (a === "--base-url") out.baseUrl = argv[++i];
    else if (a === "--headed") out.headed = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!out.out) {
    const date = new Date().toISOString().slice(0, 10);
    out.out = `reports/css-theme-values/${date}.json`;
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

// For each archetype, for each matched element, append a probe child, apply each
// token to its real CSS property, and read the resolved longhands. The probe
// inherits the element's custom properties, so it resolves the EFFECTIVE token.
// Value key = `${token}::${readProp}`. Returns archetype → rows[{selector,values}].
async function readArchetypes(page, archetypes) {
  return page.evaluate(({ archetypes }) => {
    const out = {};
    for (const [name, def] of Object.entries(archetypes)) {
      const rows = [];
      for (const sel of def.selectors) {
        let els;
        try { els = document.querySelectorAll(sel); } catch { continue; }
        for (const el of els) {
          const probe = document.createElement("span");
          probe.style.position = "absolute";
          probe.style.visibility = "hidden";
          probe.style.pointerEvents = "none";
          el.appendChild(probe);
          const values = {};
          for (const spec of def.probe) {
            probe.style.cssText += `;${spec.apply}: var(${spec.token});`;
            const cs = getComputedStyle(probe);
            for (const rp of spec.read) values[`${spec.token}::${rp}`] = cs[rp];
            // reset applied property so specs don't bleed into each other
            probe.style.removeProperty(spec.apply);
          }
          probe.remove();
          rows.push({ selector: sel, values });
        }
      }
      out[name] = rows;
    }
    return out;
  }, { archetypes });
}

// stable key for a value tuple so identical designs collapse to one bucket
function tupleKey(values) {
  return Object.keys(values).sort().map((k) => `${k}=${values[k]}`).join(" | ");
}

// ordered value-key list for an archetype (token::read, in config order)
function archetypeKeys(def) {
  const keys = [];
  for (const spec of def.probe) for (const rp of spec.read) keys.push(`${spec.token}::${rp}`);
  return keys;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = JSON.parse(readFileSync(args.targets, "utf8"));
  const archetypes = cfg.archetypes;
  const routesDoc = JSON.parse(readFileSync(args.routes, "utf8"));
  const routes = routesDoc.routes ?? routesDoc;

  process.stderr.write(
    `archetypes: ${Object.keys(archetypes).join(", ")}\n` +
    `routes: ${routes.length} · themes: ${THEMES.length} · viewports: ${VIEWPORTS.length}\n`
  );

  const needsAuth = routes.some((r) => r.auth !== false);
  const sessionCookie = process.env.SNAPSHOT_SESSION || null;
  const token = needsAuth && !sessionCookie ? args.token || generateToken() : null;

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

  // agg[archetype][themeId] = Map(tupleKey → { values, hits:[{route,viewport,selector}] })
  const agg = {};
  for (const name of Object.keys(archetypes)) {
    agg[name] = {};
    for (const t of THEMES) agg[name][t.id] = new Map();
  }

  for (const r of routes) {
    if (r.auth !== false && !needsAuth) continue;
    const route = r.route ?? r;
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      try {
        await page.goto(`${args.baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      } catch (e) {
        process.stderr.write(`  ⚠ ${route} @${vp.id}: navigation failed (${String(e.message).split("\n")[0]})\n`);
        continue;
      }
      let okThemes = 0;
      let hits = 0;
      for (const theme of THEMES) {
        try {
          await applyTheme(page, theme);
          await freezeMotion(page);
          await flush(page);
          const found = await readArchetypes(page, archetypes);
          for (const [name, rows] of Object.entries(found)) {
            for (const row of rows) {
              const key = tupleKey(row.values);
              const bucket = agg[name][theme.id];
              if (!bucket.has(key)) bucket.set(key, { values: row.values, hits: [] });
              bucket.get(key).hits.push({ route, viewport: vp.id, selector: row.selector });
              hits++;
            }
          }
          okThemes++;
        } catch (e) {
          process.stderr.write(`  ⚠ ${route} @${vp.id} theme=${theme.id}: ${String(e.message).split("\n")[0]}\n`);
          if (page.isClosed()) throw new Error("page/browser closed — aborting run");
        }
      }
      process.stderr.write(`  ✓ ${route} @${vp.id} (${okThemes}/${THEMES.length} themes, ${hits} hits)\n`);
    }
  }
  await browser.close();

  // ---- build report ----
  const table = {};
  let driftCount = 0;
  for (const [name, def] of Object.entries(archetypes)) {
    table[name] = { keys: archetypeKeys(def), themes: {} };
    for (const t of THEMES) {
      const bucket = agg[name][t.id];
      const variants = [...bucket.values()].map((v) => ({
        values: v.values,
        count: v.hits.length,
        routes: [...new Set(v.hits.map((h) => h.route))].sort(),
        selectors: [...new Set(v.hits.map((h) => h.selector))].sort(),
      })).sort((a, b) => b.count - a.count);
      if (variants.length > 1) driftCount++;
      table[name].themes[t.id] = { distinct: variants.length, variants };
    }
  }

  const report = {
    capturedAt: new Date().toISOString(),
    baseUrl: args.baseUrl,
    themes: THEMES.map((t) => t.id),
    viewports: VIEWPORTS.map((v) => v.id),
    routes: routes.length,
    summary: { archetypes: Object.keys(archetypes).length, themeCellsWithDrift: driftCount },
    table,
  };

  mkdirSync(path.dirname(args.out), { recursive: true });
  writeFileSync(args.out, JSON.stringify(report, null, 2));
  writeMarkdown(args.out.replace(/\.json$/, ".md"), report);

  process.stderr.write(
    `\nwrote ${args.out}\n` +
    `  archetypes: ${Object.keys(archetypes).length} · theme-cells with drift (>1 value): ${driftCount}\n` +
    `  drift = same archetype, >1 effective token value in one theme → reconcile or make a real variant.\n`
  );
}

function shorten(v, n = 72) {
  if (v == null) return v;
  return v.length > n ? v.slice(0, n - 1) + "…" : v;
}

// a read value worth printing (skip empty/neutral defaults)
function meaningful(val) {
  return val && val !== "none" && val !== "rgba(0, 0, 0, 0)" && val !== "0px" && val !== "auto";
}

function writeMarkdown(file, report) {
  const L = [];
  L.push(`# Theme value table — ${report.capturedAt.slice(0, 10)}`);
  L.push("");
  L.push(`Effective **token** values per archetype × theme, probed across ${report.routes} routes × ${report.viewports.length} viewports against ${report.baseUrl}.`);
  L.push("");
  L.push("> ONE value per cell = the token value to write into `:root.theme-X { --…: }`.");
  L.push("> **⚠ DRIFT** = more than one effective token value for the same archetype in one");
  L.push("> theme → a feature/element override sets the token differently on some page.");
  L.push("> Reconcile, or promote the difference to a real variant. Routes listed below.");
  L.push("");
  for (const [name, entry] of Object.entries(report.table)) {
    L.push(`## ${name}`);
    L.push("");
    for (const themeId of report.themes) {
      const cell = entry.themes[themeId];
      if (!cell || cell.distinct === 0) { L.push(`### ${themeId} — _(no instances rendered)_`); L.push(""); continue; }
      const drift = cell.distinct > 1 ? ` ⚠ DRIFT (${cell.distinct} values)` : "";
      L.push(`### ${themeId}${drift}`);
      L.push("");
      for (const v of cell.variants) {
        L.push(`- **×${v.count}** · routes: ${v.routes.join(", ")}`);
        for (const key of entry.keys) {
          const val = v.values[key];
          if (meaningful(val)) L.push(`  - \`${key}\`: \`${shorten(val)}\``);
        }
      }
      L.push("");
    }
  }
  writeFileSync(file, L.join("\n"));
}

main().catch((e) => { console.error(e); process.exit(1); });
