// app/layout.js
import "./globals.css";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import Script from "next/script";
import localFont from "next/font/local";

export const metadata = { /* ... sinu metadata ... */ };

const aino = localFont({
  src: [
    { path: "./fonts/Aino-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Aino-Bold.woff2",    weight: "700", style: "normal" },
  ],
  variable: "--font-aino",
  display: "swap",
  preload: true,
});

const ainoHeadline = localFont({
  src: [{ path: "./fonts/Aino-Headline.woff2", weight: "400", style: "normal" }],
  variable: "--font-aino-headline",
  display: "swap",
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="et" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo/favicon.svg" type="image/svg+xml" />
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
      <body className={`${aino.variable} ${ainoHeadline.variable}`}>
        <BackgroundLayer />
        <main className="relative z-0">{children}</main>
      </body>
    </html>
  );
}
