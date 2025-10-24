// app/[locale]/layout.js
import "../globals.css";
import ViewportLayoutSetter from "@/components/ViewportLayoutSetter";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import localFont from "next/font/local";
import Providers from "../providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { loadMessages, SUPPORTED_LOCALES } from "@/i18n/i18n";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";
import { resolvePreferenceContext } from "@/lib/server/preferences";

export const metadata = {
  title: "SotsiaalAI",
  description: "SotsiaalAI platvorm",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = { themeColor: "#0d111b" };

const aino = localFont({
  src: [
    { path: "../fonts/Aino-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Aino-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Aino-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/Aino-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-aino",
  display: "swap",
  preload: true,
});

const ainoHeadline = localFont({
  src: [{ path: "../fonts/Aino-Headline.woff2", weight: "400", style: "normal" }],
  variable: "--font-aino-headline",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  // ⬇️ Next 16: params on Promise
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  const messages = await loadMessages(locale);
  const preferenceContext = await resolvePreferenceContext();

  const preferred = preferenceContext?.effective ?? DEFAULT_PREFERENCES;
  const contrastAttr = preferred.contrast ?? DEFAULT_PREFERENCES.contrast;
  const fontSizeAttr = preferred.fontSize ?? DEFAULT_PREFERENCES.fontSize;
  const motionAttr = preferred.motion ?? DEFAULT_PREFERENCES.motion;

  return (
    <html
      lang={locale}
      data-app-lang={locale}
      data-contrast={contrastAttr}
      data-fs={fontSizeAttr}
      data-motion={motionAttr}
      suppressHydrationWarning
      className={[aino.variable, ainoHeadline.variable].join(" ")}
    >
      <head>
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ViewportLayoutSetter />
            <BackgroundLayer />
            <ServiceWorkerRegister />
            <main className="relative z-10">{children}</main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
