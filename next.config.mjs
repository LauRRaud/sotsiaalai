// next.config.mjs
import { fileURLToPath } from "url";
import path from "path";
import bundleAnalyzer from "@next/bundle-analyzer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withBundleAnalyzer = bundleAnalyzer({
  // lülita analüsaator sisse, kui keskkonnamuutuja ANALYZE on "true"
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  turbopack: {
    // vaigista "inferred workspace root" hoiatus
    root: __dirname,
  },
};

export default withBundleAnalyzer(baseConfig);
