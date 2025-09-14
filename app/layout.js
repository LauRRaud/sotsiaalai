// app/layout.js
import "./globals.css";
import BackgroundLayer from "@/components/backgrounds/BackgroundLayer";
import localFont from "next/font/local";

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

// Next 15+: themeColor läheb viewporti kaudu
export const viewport = {
  themeColor: "#0d111b",
};

// Põhikirja font (Aino)
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
      className={[
        aino.variable,
        ainoHeadline.variable,
      ].join(" ")}
    >
      <head>
        {/* Valikuline: preloadi sagedasti kasutatavad pildid/logod */}
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
        <BackgroundLayer />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
