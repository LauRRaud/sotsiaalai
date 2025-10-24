// app/[locale]/layout.js
import "../globals.css";
import ViewportLayoutSetter from "@/components/ViewportLayoutSetter";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import Providers from "../providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { loadMessages, SUPPORTED_LOCALES } from "@/i18n/i18n";

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

  return (
    <>
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

      <NextIntlClientProvider locale={locale} messages={messages}>
        <Providers>
          <ViewportLayoutSetter />
          <BackgroundLayer />
          <ServiceWorkerRegister />
          <main className="relative z-10">{children}</main>
        </Providers>
      </NextIntlClientProvider>
    </>
  );
}
