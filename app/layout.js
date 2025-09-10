// app/layout.js
import "./globals.css";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import Script from "next/script";
import localFont from "next/font/local";

export const metadata = {
  title: "SotsiaalAI",
  description: "SotsiaalAI platvorm",
  icons: {
    icon: [{ url: "/logo/favicon.png", type: "image/png" }],
    apple: [{ url: "/logo/favicon.png" }],
  },
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
