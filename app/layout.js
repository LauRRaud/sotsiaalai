// app/layout.js
import "./globals.css";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import Providers from "./providers"; // JUURTASAND: ./providers
import ViewportLayoutSetter from "@/components/ViewportLayoutSetter";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import { authConfig } from "@/auth";
export const metadata = {
  title: "SotsiaalAI",
  description: "SotsiaalAI platvorm",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};
export const viewport = { themeColor: "#0d111b" };
/** Fondid JUURTASANDIL (NB! teed: ./fonts/...) */
const aino = localFont({
  src: [
    { path: "./fonts/Aino-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Aino-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Aino-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/Aino-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-aino",
  display: "swap",
  preload: true,
});
const ainoHeadline = localFont({
  src: [{ path: "./fonts/Aino-Headline.woff2", weight: "400", style: "normal" }],
  variable: "--font-aino-headline",
  display: "swap",
  preload: true, // preloading avoids first-render swap jump on titles
});
/** Sõnumite kaardid – impordime serveris küpsise järgi */
const MESSAGES = {
  et: () => import("@/messages/et.json"),
  ru: () => import("@/messages/ru.json"),
  en: () => import("@/messages/en.json"),
};
function parseA11yPrefs(jar) {
  const raw = jar.get("a11y_prefs")?.value;
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    const contrast = obj?.contrast;
    const theme = obj?.theme === "light" ? "light" : "dark";
    return {
      textScale: obj?.textScale,
      contrast,
      reduceMotion: !!obj?.reduceMotion,
      theme: contrast === "hc" ? "dark" : theme,
    };
  } catch {
    return null;
  }
}
export default async function RootLayout({ children }) {
  // Loe locale küpsisest; middleware seab NEXT_LOCALE kui kasutaja külastab /et, /ru, /en
  const jar = await cookies();
  const cookieLocale = jar.get("NEXT_LOCALE")?.value;
  const locale = ["et", "ru", "en"].includes(cookieLocale || "") ? cookieLocale : "et";
  // Lae sõnumid serveris – stabiilne SSR HTML (vältimaks hydration mismatch)
  let messages = {};
  try {
    messages = (await MESSAGES[locale]()).default ?? {};
  } catch {}
  const session = await getServerSession(authConfig);
  const initialA11yPrefs = parseA11yPrefs(jar);
  const skipText =
    messages?.common?.skip_to_content ??
    (locale === "ru" ? "Перейти к содержимому" : locale === "en" ? "Skip to content" : "Jätka sisuni");
  return (
    <html lang={locale} className={`${aino.variable} ${ainoHeadline.variable} ${initialA11yPrefs?.theme === "light" ? "theme-light" : ""}`.trim()} suppressHydrationWarning>
      <head>
        {/* Valikulised preloadid – võid soovi korral eemaldada */}
        <link rel="preload" as="image" href="/logo/aivalge.svg" />
        <link rel="preload" as="image" href="/logo/saimust.svg" />
        <link rel="preload" as="image" href="/logo/smust.svg" />
        <link rel="preload" as="image" href="/logo/saivalge.svg" />
        <link rel="preload" as="image" href="/logo/logomust.svg" />
        <link rel="preload" as="image" href="/logo/tagasinupp.svg" />
        <link rel="preload" as="image" href="/logo/sisenehall.svg" />
        <link rel="preload" as="image" href="/logo/sisenehallhele.svg" />
        <link rel="preload" as="image" href="/logo/ümbrik.svg" />
        <link rel="preload" as="image" href="/logo/rümbrik.svg" />
        <link rel="preload" as="image" href="/logo/onoffroheline.svg" />
        <link rel="preload" as="image" href="/logo/onoffrohelinehele.svg" />
        <link rel="preload" as="image" href="/logo/onoffhall.svg" />
        {/* Removed deprecated login provider assets */}
      </head>
      <body className="antialiased min-h-screen w-full overflow-x-hidden">
        <Providers initialLocale={locale} messages={messages} session={session} initialA11yPrefs={initialA11yPrefs}>
          {/* Skip-link ligipääsetavuseks */}
          <a href="#main" className="skip-link">{skipText}</a>
          <ViewportLayoutSetter />
          {/* Taust: renderdatakse root-tasemel ühe fixed kihina (BackgroundLayer haldab ise oma konteinerit) */}
          <BackgroundLayer />
          <ServiceWorkerRegistrar />
          {/* Sisu on taustast kõrgemal kihil */}
          <main id="main" role="main" tabIndex={-1} className="relative" style={{ zIndex: 10 }}>
            {children}
          </main>
        </Providers>
        
      </body>
    </html>
  );
}




