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
const UI_SCALE_INIT_SCRIPT = `(function () {
  var KEY = ${JSON.stringify(UI_SCALE_STORAGE_KEY)};
  function normalizeMode(value) {
    if (value === "lg" || value === "xl") return "lg";
    if (value === "sm" || value === "md" || value === "auto") return "sm";
    return null;
  }
  function resolveScale(mode) {
    if (mode === "lg") return 1.25;
    return 1;
  }
  function apply(mode) {
    var root = document.documentElement;
    if (!root) return;
    var resolvedMode = normalizeMode(mode) || "sm";
    root.style.setProperty("--ui-scale", String(resolveScale(resolvedMode)));
    root.setAttribute("data-ui-scale", resolvedMode);
    root.setAttribute("data-ui-scale-auto", "0");
  }
  var mode = null;
  try {
    mode = normalizeMode(window.localStorage.getItem(KEY));
  } catch {}
  if (!mode) {
    try {
      var rawPrefs = window.localStorage.getItem("a11y_prefs");
      var prefs = rawPrefs ? JSON.parse(rawPrefs) : null;
      mode = normalizeMode((prefs && (prefs.uiScale || prefs.textScale)) || null);
    } catch {}
  }
  apply(mode || "sm");
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
  themeColor: "#0d111b"
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
      rawTheme === "night"
        ? rawTheme
        : rawTheme === "light-mono"
          ? "light"
          : rawTheme === "dark-mono" || rawTheme === "monochrome"
            ? "dark"
          : "dark";
    return {
      uiScale: obj?.uiScale ?? obj?.textScale,
      contrast,
      reduceMotion: !!obj?.reduceMotion,
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
  const session = await getServerSession(authConfig);
  const initialA11yPrefs = parseA11yPrefs(jar);
  const skipText = messages?.common?.skip_to_content ?? (locale === "ru" ? "ŠŠµŃ€ŠµŠ¹Ń‚Šø Šŗ ŃŠ¾Š´ŠµŃ€Š¶ŠøŠ¼Š¾Š¼Ń" : locale === "en" ? "Skip to content" : "JĆ¤tka sisuni");
  return <html lang={locale} data-color-theme={initialA11yPrefs?.colorTheme || "default"} data-ui-scale="sm" data-ui-scale-auto="0" className={`${aino.variable} ${ainoHeadline.variable} ${initialA11yPrefs?.theme === "light" || initialA11yPrefs?.theme === "mid" ? "theme-light" : ""} ${initialA11yPrefs?.theme === "mid" ? "theme-mid" : ""} ${initialA11yPrefs?.theme === "night" ? "theme-night" : ""}`.trim()} suppressHydrationWarning>
      <head>
        <Script id="ui-scale-init" strategy="beforeInteractive">
          {UI_SCALE_INIT_SCRIPT}
        </Script>
      </head>
      <body className="app-root">
        <Providers initialLocale={locale} messages={messages} session={session} initialA11yPrefs={initialA11yPrefs}>
          {}
          <a href="#main" className="skip-link">
            {skipText}
          </a>
          <ViewportLayoutSetter />
          {}
          <BackgroundLayer />
          <ServiceWorkerRegistrar />
          {}
          <main id="main" role="main" tabIndex={-1} style={{
          zIndex: 10
        }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>;
}
