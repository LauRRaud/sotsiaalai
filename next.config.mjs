// next.config.mjs
import { fileURLToPath } from "url";
import path from "path";
import bundleAnalyzer from "@next/bundle-analyzer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundle analyzer wrapper (aktiveerub ainult kui BUNDLE_ANALYZE=true)
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,

  // styled-components SSR ja className optimeerimine
  compiler: {
    styledComponents: true,
  },

  // Piltide optimeerimine
  images: {
    formats: ["image/avif", "image/webp"],
    domains: [], // lisa vajadusel Zone/CDN domeenid
  },

  // Turbopack – vaigistab "inferred workspace root" hoiatuse
  turbopack: {
    root: __dirname,
  },
};

export default withBundleAnalyzer(baseConfig);
