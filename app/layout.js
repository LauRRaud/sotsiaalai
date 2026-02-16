import "./styles/globals.css";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import Providers from "./providers";
import ViewportLayoutSetter from "@/components/ViewportLayoutSetter";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import { authConfig } from "@/auth";
const ICON_VERSION = "v20260214";
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
      theme: contrast === "hc" ? "dark" : theme
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
  return <html lang={locale} className={`${aino.variable} ${ainoHeadline.variable} ${initialA11yPrefs?.theme === "light" ? "theme-light" : ""}`.trim()} suppressHydrationWarning>
      <head>
        {}
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
