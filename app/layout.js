// app/layout.js
import "./globals.css";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import Script from "next/script";
import localFont from "next/font/local";

export const metadata = {
  title: "SotsiaalAI",
  description: "SotsiaalAI platvorm",
  icons: {
    icon: "/logo/favicon.png",
    apple: "/logo/favicon.png",
  },
};

const aino = localFont({
  src: [
    { path: "./fonts/Aino-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Aino-Bold.woff2", weight: "700", style: "normal" },
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
    <html
      lang="et"
      suppressHydrationWarning
      className="dark-mode"
      data-theme="dark"
    >
      <head>
        <meta name="color-scheme" content="dark light" />
        <link rel="icon" href="/logo/favicon.png" sizes="any" type="image/png" />
        <link rel="apple-touch-icon" href="/logo/favicon.png" />
        <Script id="set-theme" strategy="beforeInteractive">
          {`
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
          `}
        </Script>
      </head>
      <body className={`${aino.variable} ${ainoHeadline.variable} antialiased`}>
        <BackgroundLayer />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
