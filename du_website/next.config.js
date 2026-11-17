/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, tls: false, net: false };

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // {
      //   protocol: "http",
      //   hostname: "192.168.160.18",
      //   port: "4198",
      //   pathname: "/**",
      // },
      {
        protocol: "http",
        hostname: "159.195.23.130",
        port: "4198",
        pathname: "/**",
      },
      // {
      //   protocol: "http",
      //   hostname: "cloud.quayomobility.ca",
      //   port: "15711",
      //   pathname: "/**",
      // },
      {
        protocol: "http",
        hostname: "10.100.0.3",
        port: "4198",
        pathname: "/**",
      },
    ],
  },
  i18n: {
    locales: ["fr", "en"], // Add your supported locales
    defaultLocale: "en", // Set the default locale
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// module.exports = nextConfig;
const runtimeCaching = require("next-pwa/cache");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // first match wins, so this goes before the defaults
    { urlPattern: /\/_next\/data\/.+\.json$/i, handler: "NetworkOnly" },
    ...runtimeCaching,
  ],
});

module.exports = withPWA({
  ...nextConfig,
});
