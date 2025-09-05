
import "./globals.css";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import Script from "next/script";

export const metadata = {
  title: "SotsiaalAI",
  description:
    "SotsiaalAI ühendab killustatud sotsiaalvaldkonna info ja pakub arusaadavat tuge nii spetsialistidele kui eluküsimusega pöördujatele.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sotsiaal.ai"),
  openGraph: {
    title: "SotsiaalAI",
    description: "Tehisintellekt sotsiaaltööks ja elulisteks küsimusteks.",
    url: "/",
    siteName: "SotsiaalAI",
    images: [{ url: "/og/sotsiaalai-og.jpg", width: 1200, height: 630, alt: "SotsiaalAI" }],
    type: "website",
    locale: "et_EE",
  },
  twitter: {
    card: "summary_large_image",
    title: "SotsiaalAI",
    description: "Tehisintellekt sotsiaaltööks ja elulisteks küsimusteks.",
    images: ["/og/sotsiaalai-og.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="et" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/logo/favicon.svg" type="image/svg+xml" />

        <link
          rel="preload"
          href="/fonts/Aino-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Aino-Headline.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
          <link
    rel="preload"
    href="/fonts/Aino-Bold.woff2"
    as="font"
    type="font/woff2"
    crossOrigin="anonymous"
  />
        <Script id="set-theme" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var el = document.documentElement;
                var ls = localStorage.getItem('theme');
                var saved = (ls === 'dark' || ls === 'light') ? ls : null;
                var dark = saved ? (saved === 'dark')
                  : window.matchMedia('(prefers-color-scheme: dark)').matches;
                el.classList.toggle('dark-mode', dark);
                el.dataset.theme = dark ? 'dark' : 'light';
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body>
        <BackgroundLayer />
        <main className="relative z-0">{children}</main>
      </body>
    </html>
  );
}
