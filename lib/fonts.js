import localFont from "next/font/local";

export const aino = localFont({
  src: [
    { path: "../app/fonts/Aino-Regular.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/Aino-Bold.woff2", weight: "700", style: "normal" },
    { path: "../app/fonts/Aino-Italic.woff2", weight: "400", style: "italic" },
    { path: "../app/fonts/Aino-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-aino",
  display: "swap",
  preload: true,
});

export const ainoHeadline = localFont({
  src: [
    { path: "../app/fonts/Aino-Headline.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-aino-headline",
  display: "swap",
  preload: false,
});
