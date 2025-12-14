// next.config.mjs
import { fileURLToPath } from "url";
import path from "path";

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,

  compiler: { styledComponents: true },

  experimental: {
    // Work around a Next.js dev-only bug on Windows where the Segment Explorer
    // client module can be missing from the RSC client manifest.
    devtoolSegmentExplorer: false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    domains: [],
  },

  // säilita turbopack config
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },

  webpack(config, { dev, isServer }) {
    // Add SVGR loader for SVG imports in JS/TS files
    // NOTE: using the package name string for the loader is ESM-safe (no require)
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
                { name: "prefixIds" }, // avoid id collisions for gradients/defs
              ],
            },
            titleProp: true,
            ref: true,
          },
        },
      ],
    });

    return config;
  },
};

export default baseConfig;
