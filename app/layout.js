// app/layout.js
import "./globals.css";
import localFont from "next/font/local";
import { cookies } from "next/headers";

import Providers from "./providers"; // JUURTASAND: ./providers
import ViewportLayoutSetter from "@/components/ViewportLayoutSetter";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";

export const metadata = {
  title: "SotsiaalAI",
  description: "SotsiaalAI platvorm",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
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
  preload: false,
});

/** Sõnumite kaardid – impordime serveris küpsise järgi */
const MESSAGES = {
  et: () => import("@/messages/et.json"),
  ru: () => import("@/messages/ru.json"),
  en: () => import("@/messages/en.json"),
};

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

  const skipText =
    messages?.common?.skip_to_content ??
    (locale === "ru" ? "Перейти к содержимому" : locale === "en" ? "Skip to content" : "Jätka sisuni");

  return (
    <html lang={locale} className={`${aino.variable} ${ainoHeadline.variable}`}>
      <head>
        {/* Valikulised preloadid – võid soovi korral eemaldada */}
        <link rel="preload" as="image" href="/logo/aivalge.svg" />
        <link rel="preload" as="image" href="/logo/saimust.svg" />
        <link rel="preload" as="image" href="/logo/smust.svg" />
        <link rel="preload" as="image" href="/logo/saivalge.svg" />
        <link rel="preload" as="image" href="/logo/logomust.svg" />
        <link rel="preload" as="image" href="/login/google1.png" />
        <link rel="preload" as="image" href="/login/smart.svg" />
        <link rel="preload" as="image" href="/login/mobiil.png" />
      </head>

      <body className="antialiased min-h-screen w-full overflow-x-hidden">
        <Providers initialLocale={locale} messages={messages}>
          {/* Skip-link ligipääsetavuseks */}
          <a href="#main" className="skip-link">{skipText}</a>

          <ViewportLayoutSetter />

          {/* Taust alati taha: ei kata sisu ega püüa klikke */}
          <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <BackgroundLayer />
          </div>

          <ServiceWorkerRegistrar />

          {/* Sisu on taustast kõrgemal kihil */}
          <main id="main" tabIndex={-1} className="relative" style={{ zIndex: 10 }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
