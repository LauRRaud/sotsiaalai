import "./styles/globals.css";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import Script from "next/script";
import Providers from "./providers";
import ViewportLayoutSetter from "@/components/ViewportLayoutSetter";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import { authConfig } from "@/auth";
const ICON_VERSION = "v20260214";
const UI_SCALE_STORAGE_KEY = "sotsiaalai.uiScale";
const UI_PROFILE_STORAGE_KEY = "sotsiaalai.uiProfile";
const UI_SCALE_INIT_SCRIPT = `(function () {
  var SCALE_KEY = ${JSON.stringify(UI_SCALE_STORAGE_KEY)};
  var PROFILE_KEY = ${JSON.stringify(UI_PROFILE_STORAGE_KEY)};
  function normalizeTextScale(value) {
    if (value === "sm" || value === "md" || value === "lg" || value === "xl") return value;
    return null;
  }
  function normalizeProfile(value) {
    if (value === "mac") return "mac";
    if (value === "lg" || value === "xl") return "lg";
    if (value === "sm" || value === "md") return "sm";
    return null;
  }
  function resolveTextScale(value) {
    if (value === "sm") return 0.9375;
    if (value === "lg") return 1.125;
    if (value === "xl") return 1.25;
    return 1;
  }
  function resolveProfileScale(value) {
    var profile = normalizeProfile(value);
    if (profile === "lg") return 1.25;
    if (profile === "mac") return 1.18;
    return 1;
  }
  function apply(textScale, profile) {
    var root = document.documentElement;
    if (!root) return;
    var resolvedTextScale = normalizeTextScale(textScale) || "md";
    var resolvedProfile = normalizeProfile(profile) || normalizeProfile(resolvedTextScale) || "sm";
    root.style.setProperty(
      "--ui-scale",
      String(resolveTextScale(resolvedTextScale) * resolveProfileScale(resolvedProfile))
    );
    root.setAttribute("data-text-scale", resolvedTextScale);
    root.setAttribute("data-ui-scale", resolvedProfile);
    root.setAttribute("data-ui-profile", resolvedProfile);
    root.setAttribute("data-ui-scale-auto", "0");
  }
  var textScale = null;
  var profile = null;
  try {
    textScale = normalizeTextScale(window.localStorage.getItem(SCALE_KEY));
  } catch {}
  try {
    profile = normalizeProfile(window.localStorage.getItem(PROFILE_KEY));
  } catch {}
  if (!textScale || !profile) {
    try {
      var rawPrefs = window.localStorage.getItem("a11y_prefs");
      var prefs = rawPrefs ? JSON.parse(rawPrefs) : null;
      textScale = normalizeTextScale((prefs && (prefs.uiScale || prefs.textScale)) || null);
      profile = normalizeProfile((prefs && (prefs.uiProfile || prefs.screenProfile || prefs.uiScale || prefs.textScale)) || null);
    } catch {}
  }
  apply(textScale || "md", profile || null);
})();`;
const THEME_INIT_SCRIPT = `(function () {
  var root = document.documentElement;
  if (!root) return;
  var THEMES = { light: true, mid: true, dark: true, night: true, mono: true };
  var COLOR_THEMES = { default: true, green: true, blue: true, neutral: true, gold: true, red: true, purple: true };
  function normalizeTheme(value) {
    return THEMES[value] ? value : null;
  }
  function normalizeColorTheme(value) {
    return COLOR_THEMES[value] ? value : "default";
  }
  function readPrefs() {
    try {
      var raw = window.localStorage.getItem("a11y_prefs");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function readTheme(prefs) {
    var theme = normalizeTheme(prefs && prefs.theme);
    if (!theme) {
      try {
        theme = normalizeTheme(window.localStorage.getItem("theme"));
      } catch {}
    }
    return theme || normalizeTheme(root.getAttribute("data-theme-mode")) || "mono";
  }
  function resolveChromeColor(theme, contrast) {
    if (contrast === "hc") return "#10151d";
    if (theme === "light") return "#f4f2ee";
    if (theme === "mid") return "#6f5853";
    if (theme === "night") return "#0e1420";
    if (theme === "mono") return "#101010";
    return "#111418";
  }
  function ensureMeta(name) {
    var meta = document.querySelector('meta[name="' + name + '"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      document.head.appendChild(meta);
    }
    return meta;
  }
  function applyHomeFlag() {
    var pathname = window.location && window.location.pathname ? window.location.pathname : "/";
    var normalized = pathname.replace(/^\\/(et|ru|en)(?=\\/|$)/, "") || "/";
    if (normalized === "/") root.setAttribute("data-initial-page", "home");
    else root.removeAttribute("data-initial-page");
  }
  var prefs = readPrefs();
  var contrast = (prefs && prefs.contrast) || root.getAttribute("data-contrast") || "normal";
  var theme = contrast === "hc" ? "dark" : readTheme(prefs);
  var colorTheme = normalizeColorTheme((prefs && prefs.colorTheme) || root.getAttribute("data-color-theme"));
  root.setAttribute("data-theme-mode", contrast === "hc" ? "dark" : theme);
  root.setAttribute("data-color-theme", colorTheme);
  root.setAttribute("data-contrast", contrast);
  if (prefs) {
    root.setAttribute("data-reduce-motion", prefs.reduceMotion ? "1" : "0");
    root.setAttribute(
      "data-reduce-transparency",
      (prefs.reduceTransparency == null ? prefs.reduceMotion : prefs.reduceTransparency) ? "1" : "0"
    );
  }
  root.classList.toggle("theme-light", contrast !== "hc" && (theme === "light" || theme === "mid"));
  root.classList.toggle("theme-mid", contrast !== "hc" && theme === "mid");
  root.classList.toggle("theme-night", contrast !== "hc" && theme === "night");
  root.classList.toggle("theme-mono", contrast !== "hc" && theme === "mono");
  ensureMeta("theme-color").setAttribute("content", resolveChromeColor(theme, contrast));
  ensureMeta("apple-mobile-web-app-status-bar-style").setAttribute(
    "content",
    theme === "light" || theme === "mid" ? "default" : "black-translucent"
  );
  applyHomeFlag();
})();`;
const LAYOUT_INIT_SCRIPT = `(function () {
  var root = document.documentElement;
  if (!root) return;
  function isMobileViewport() {
    try {
      return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
    } catch {}
    return window.innerWidth <= 768;
  }
  function syncLayoutFlag() {
    if (isMobileViewport()) {
      root.setAttribute("data-layout", "mobile");
    } else {
      root.removeAttribute("data-layout");
    }
  }
  syncLayoutFlag();
  window.requestAnimationFrame(syncLayoutFlag);
  window.addEventListener("resize", syncLayoutFlag);
  window.visualViewport && window.visualViewport.addEventListener("resize", syncLayoutFlag);
  window.addEventListener("pageshow", function () {
    syncLayoutFlag();
  });
  window.addEventListener("load", syncLayoutFlag);
})();`;
export const metadata = {
  title: "SotsiaalAI",
  description: "Platvormil on kaks rollipõhist tehisintellekti assistenti: üks sotsiaalvaldkonna spetsialistidele ja teine eluküsimusega pöördujatele.",
  manifest: `/site.webmanifest?${ICON_VERSION}`,
  icons: {
    icon: [{
      url: `/icons/icon-192-${ICON_VERSION}.png`,
      sizes: "192x192",
      type: "image/png"
    }, {
      url: `/icons/icon-512-${ICON_VERSION}.png`,
      sizes: "512x512",
      type: "image/png"
    }, {
      url: `/favicon.ico?${ICON_VERSION}`
    }],
    shortcut: `/icons/icon-192-${ICON_VERSION}.png`,
    apple: `/apple-touch-icon-${ICON_VERSION}.png`
  }
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#101010" }
  ]
};
const aino = localFont({
  src: [{
    path: "./fonts/Aino-Regular.woff2",
    weight: "400",
    style: "normal"
  }, {
    path: "./fonts/Aino-Bold.woff2",
    weight: "700",
    style: "normal"
  }, {
    path: "./fonts/Aino-Italic.woff2",
    weight: "400",
    style: "italic"
  }, {
    path: "./fonts/Aino-BoldItalic.woff2",
    weight: "700",
    style: "italic"
  }],
  variable: "--font-aino",
  display: "swap",
  preload: true
});
const ainoHeadline = localFont({
  src: [{
    path: "./fonts/Aino-Headline.woff2",
    weight: "400",
    style: "normal"
  }],
  variable: "--font-aino-headline",
  display: "swap",
  preload: true
});
const MESSAGES = {
  et: () => import("@/messages/et.json"),
  ru: () => import("@/messages/ru.json"),
  en: () => import("@/messages/en.json")
};
function normalizeColorTheme(colorTheme) {
  const allowed = new Set(["default", "green", "blue", "neutral", "gold", "red", "purple"]);
  return allowed.has(colorTheme) ? colorTheme : "default";
}
function normalizeUiProfile(uiProfile) {
  if (uiProfile === "mac") return "mac";
  if (uiProfile === "lg" || uiProfile === "xl") return "lg";
  return "sm";
}
function normalizeTextScale(uiScale) {
  if (uiScale === "sm" || uiScale === "md" || uiScale === "lg" || uiScale === "xl") return uiScale;
  return "md";
}
function parseA11yPrefs(jar) {
  const raw = jar.get("a11y_prefs")?.value;
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    const contrast = obj?.contrast;
    const rawTheme = obj?.theme;
    const theme =
      rawTheme === "light" ||
      rawTheme === "mid" ||
      rawTheme === "dark" ||
      rawTheme === "night" ||
      rawTheme === "mono"
        ? rawTheme
        : "mono";
    return {
      uiScale: obj?.uiScale ?? obj?.textScale,
      uiProfile: obj?.uiProfile ?? obj?.screenProfile ?? obj?.uiScale ?? obj?.textScale,
      contrast,
      reduceMotion: !!obj?.reduceMotion,
      reduceTransparency: obj?.reduceTransparency == null ? !!obj?.reduceMotion : !!obj?.reduceTransparency,
      theme: contrast === "hc" ? "dark" : theme,
      colorTheme: normalizeColorTheme(obj?.colorTheme)
    };
  } catch {
    return null;
  }
}
export default async function RootLayout({
  children
}) {
  const jar = await cookies();
  const cookieLocale = jar.get("NEXT_LOCALE")?.value;
  const locale = ["et", "ru", "en"].includes(cookieLocale || "") ? cookieLocale : "et";
  let messages = {};
  try {
    messages = (await MESSAGES[locale]()).default ?? {};
  } catch {}
  const session = await getServerSession(authConfig).catch(() => null);
  const initialA11yPrefs = parseA11yPrefs(jar);
  const initialTheme = initialA11yPrefs?.theme || "mono";
  const initialUiProfile = normalizeUiProfile(initialA11yPrefs?.uiProfile);
  const initialTextScale = normalizeTextScale(initialA11yPrefs?.uiScale);
  return <html lang={locale} data-theme-mode={initialTheme} data-color-theme={initialA11yPrefs?.colorTheme || "default"} data-ui-scale={initialUiProfile} data-ui-profile={initialUiProfile} data-text-scale={initialTextScale} data-ui-scale-auto="0" data-contrast={initialA11yPrefs?.contrast || "normal"} data-reduce-motion={initialA11yPrefs?.reduceMotion ? "1" : "0"} data-reduce-transparency={initialA11yPrefs?.reduceTransparency ? "1" : "0"} className={`${aino.variable} ${ainoHeadline.variable} ${initialTheme === "light" || initialTheme === "mid" ? "theme-light" : ""} ${initialTheme === "mid" ? "theme-mid" : ""} ${initialTheme === "night" ? "theme-night" : ""} ${initialTheme === "mono" ? "theme-mono" : ""}`.trim()} suppressHydrationWarning>
      <head>
        <meta
          name="format-detection"
          content="telephone=no, email=no, address=no, date=no"
        />
        <script
          id="app-layout-init"
          dangerouslySetInnerHTML={{ __html: LAYOUT_INIT_SCRIPT }}
        />
        <Script id="ui-scale-init" strategy="beforeInteractive">
          {UI_SCALE_INIT_SCRIPT}
        </Script>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="app-root">
        <Providers initialLocale={locale} messages={messages} session={session} initialA11yPrefs={initialA11yPrefs}>
          <ViewportLayoutSetter />
          <BackgroundLayer />
          <ServiceWorkerRegistrar />
          <main id="main" role="main" tabIndex={-1} style={{
          zIndex: 10
        }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>;
}
