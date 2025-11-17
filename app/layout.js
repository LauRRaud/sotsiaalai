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
  icons: { icon: "/logo/silma.svg", shortcut: "/logo/silma.svg", apple: "/logo/silma.svg" },
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
/** SĆµnumite kaardid ā€“ impordime serveris kĆ¼psise jĆ¤rgi */
const MESSAGES = {
  et: () => import("@/messages/et.json"),
  ru: () => import("@/messages/ru.json"),
  en: () => import("@/messages/en.json"),
};
export default async function RootLayout({ children }) {
  // Loe locale kĆ¼psisest; middleware seab NEXT_LOCALE kui kasutaja kĆ¼lastab /et, /ru, /en
  const jar = await cookies();
  const cookieLocale = jar.get("NEXT_LOCALE")?.value;
  const locale = ["et", "ru", "en"].includes(cookieLocale || "") ? cookieLocale : "et";
  // Lae sĆµnumid serveris ā€“ stabiilne SSR HTML (vĆ¤ltimaks hydration mismatch)
  let messages = {};
  try {
    messages = (await MESSAGES[locale]()).default ?? {};
  } catch {}
  const session = await getServerSession(authConfig);
  const skipText =
    messages?.common?.skip_to_content ??
    (locale === "ru" ? "ŠŠµŃ€ŠµŠ¹Ń‚Šø Šŗ ŃŠ¾Š´ŠµŃ€Š¶ŠøŠ¼Š¾Š¼Ń" : locale === "en" ? "Skip to content" : "JĆ¤tka sisuni");
  return (
    <html lang={locale} className={`${aino.variable} ${ainoHeadline.variable}`}>
      <head>
        {/* Valikulised preloadid ā€“ vĆµid soovi korral eemaldada */}
        <link rel="preload" as="image" href="/logo/aivalge.svg" />
        <link rel="preload" as="image" href="/logo/saimust.svg" />
        <link rel="preload" as="image" href="/logo/smust.svg" />
        <link rel="preload" as="image" href="/logo/saivalge.svg" />
        <link rel="preload" as="image" href="/logo/logomust.svg" />
        {/* Removed deprecated login provider assets */}
      </head>
      <body className="antialiased min-h-screen w-full overflow-x-hidden">
        <Providers initialLocale={locale} messages={messages} session={session}>
          {/* Skip-link ligipĆ¤Ć¤setavuseks */}
          <a href="#main" className="skip-link">{skipText}</a>
          <ViewportLayoutSetter />
          {/* Taust alati taha: ei kata sisu ega pĆ¼Ć¼a klikke */}
          <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <BackgroundLayer />
          </div>
          <ServiceWorkerRegistrar />
          {/* Sisu on taustast kĆµrgemal kihil */}
          <main id="main" tabIndex={-1} className="relative" style={{ zIndex: 10 }}>
            {children}
          </main>
        </Providers>
        
      </body>
    </html>
  );
}


