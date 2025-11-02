// app/robots.js
export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sotsiaal.ai";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/profiil", "/vestlus", "/tellimus"], // tundlikud lehed
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
