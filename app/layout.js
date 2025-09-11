// app/layout.js
import "./globals.css";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import Script from "next/script";
import localFont from "next/font/local";

export const metadata = {
  title: "SotsiaalAI",
  description: "SotsiaalAI platvorm",
  // Ikonid määrame käsitsi <head> sees
};

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

export default function RootLayout({ children }) {
  return (
    <html
      lang="et"
      suppressHydrationWarning
      className={`dark-mode ${aino.variable} ${ainoHeadline.variable}`}
      data-theme="dark"
    >
      <head>
        <meta name="color-scheme" content="dark light" />

        {/* Teema eelhäälestus enne Reacti */}
        <Script id="set-theme" strategy="beforeInteractive">{`
          (function () {
            try {
              var el = document.documentElement;
              var ls = localStorage.getItem('theme');
              var saved = (ls === 'dark' || ls === 'light') ? ls : null;
              var dark = saved ? (saved === 'dark')
                : window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (dark) {
                el.classList.add('dark-mode');
                el.dataset.theme = 'dark';
              } else {
                el.classList.remove('dark-mode');
                el.dataset.theme = 'light';
              }
            } catch (e) {}
          })();
        `}</Script>

        {/* Faviconid – failid public/ kaustas */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* PWA ja Safari (valikuline) */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/favicon.svg" color="#0d111b" />

        {/* UX mobiilis */}
        <meta name="theme-color" content="#0d111b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Preload logodele ja loginipiltidele */}
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
        {/* Taustakihid */}
        <BackgroundLayer />
        {/* Sisu */}
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
