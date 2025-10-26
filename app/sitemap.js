// app/sitemap.js
import { localizePath, LOCALES } from "@/lib/localizePath";

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sotsiaal.ai";
  const now = new Date().toISOString();

  const paths = [
    "/",
    "/vestlus",
    "/profiil",
    "/registreerimine",
    "/kasutustingimused",
    "/privaatsustingimused",
    "/meist",
    "/unustasin-parooli",
    "/tellimus",
    "/start",
  ];

  return paths.flatMap((pathname) => {
    return LOCALES.map((locale) => {
      const localizedPath = localizePath(pathname, locale);
      const url = `${base}${localizedPath === "/" ? "" : localizedPath}`;
      const languages = Object.fromEntries(
        LOCALES.map((loc) => {
          const locPath = localizePath(pathname, loc);
          return [loc, `${base}${locPath === "/" ? "" : locPath}`];
        }),
      );

      return {
        url,
        lastModified: now,
        changeFrequency: pathname === "/" ? "daily" : "weekly",
        priority: pathname === "/" ? 1.0 : 0.7,
        alternates: { languages },
      };
    });
  });
}
