// next.config.mjs
import { fileURLToPath } from "url";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

/** 
 * @type {import('next').NextConfig} 
 * Põhikonfiguratsioon SotsiaalAI jaoks
 */
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

// Integreeri next-intl (kasutab juurkaustas olevat next-intl.config.js ja vaikimisi i18n/request.js)
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(baseConfig);
