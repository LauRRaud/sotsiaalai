import "./globals.css";

import { aino, ainoHeadline } from "@/lib/fonts";
import { DEFAULT_PREFERENCES, preferenceToHtmlAttrs } from "@/lib/preferences";
import { resolvePreferenceContext } from "@/lib/server/preferences";

export const metadata = {
  title: {
    default: "SotsiaalAI",
    template: "%s – SotsiaalAI",
  },
  description:
    "SotsiaalAI ühendab killustatud sotsiaalvaldkonna info ja pakub arusaadavat tuge nii spetsialistidele kui eluküsimusega pöörd
ajatele.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({ children }) {
  const preferenceContext = await resolvePreferenceContext();
  const htmlAttrs = preferenceToHtmlAttrs(
    preferenceContext?.effective ?? DEFAULT_PREFERENCES
  );

  return (
    <html
      lang={htmlAttrs.lang}
      data-app-lang={htmlAttrs.lang}
      data-contrast={htmlAttrs.contrast}
      data-fs={htmlAttrs.fontSize}
      data-motion={htmlAttrs.motion}
      className={`${aino.variable} ${ainoHeadline.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen w-full overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
