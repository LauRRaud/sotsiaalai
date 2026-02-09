// next.config.mjs
import { fileURLToPath } from "url";
import path from "path";
import bundleAnalyzer from "@next/bundle-analyzer";

/** Enable bundle analyzer only when ANALYZE=true */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,

  compiler: { styledComponents: true },

  images: {
    formats: ["image/avif", "image/webp"],
    domains: [],
  },

  // säilita turbopack config
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  async headers() {
    const headers = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }
    return [
      {
        source: "/:path*",
        headers,
      },
    ];
  },

  webpack(config, { dev: _dev, isServer: _isServer }) {
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

export default withBundleAnalyzer(baseConfig);
