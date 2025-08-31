import "./globals.css";
import BackgroundLayer from "../components/backgrounds/BackgroundLayer";
import Script from "next/script";

export const metadata = { title: "SotsiaalAI" };

export default function RootLayout({ children }) {
  return (
    <html lang="et" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/logo/favicon.svg" type="image/svg+xml" />

        {/* No-flash: otsusta teema enne kui React käivitub */}
        <Script id="set-theme" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var el = document.documentElement;
                var ls = localStorage.getItem('theme');
                var saved = (ls === 'dark' || ls === 'light') ? ls : null;
                var dark = saved ? (saved === 'dark')
                  : window.matchMedia('(prefers-color-scheme: dark)').matches;

                // üks rida: sea klass ja data-atribuut
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
