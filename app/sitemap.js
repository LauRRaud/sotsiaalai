// app/sitemap.js
export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sotsiaal.ai";
  const now = new Date().toISOString();

  const paths = [
    "/",
    "/vestlus",
    "/profiil",
    "/registreerimine",
    "/kasutustingimused",
    "/privaatsus",          // ✅ kontrolli, et see on tegelik route
    "/meist",
    "/unustasin-parooli",
    "/tellimus",
  ];

  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1.0 : 0.7,
  }));
}
