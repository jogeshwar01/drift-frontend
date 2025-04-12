import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        tls: false,
        net: false, // Disables the polyfill for 'net' module
        dgram: false, // Disables the polyfill for 'dgram' module
        dns: false, // Disables the polyfill for 'dgram' module
      };
    }

    if (process.env.VERCEL_ENV === "preview") {
      config.optimization.minimize = false;
    }

    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        fs: { browser: "./node-browser-compatibility.js" },
        net: { browser: "./node-browser-compatibility.js" },
        dns: { browser: "./node-browser-compatibility.js" },
        tls: { browser: "./node-browser-compatibility.js" },
        crypto: { browser: "crypto-browserify" },
      },
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

export default nextConfig;
