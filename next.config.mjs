// next.config.mjs
import { fileURLToPath } from "url";
import path from "path";

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,

  compiler: {
    styledComponents: true,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    domains: [],
  },

  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default baseConfig;
