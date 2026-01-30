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
      {
        protocol: "http",
        hostname: "141.95.114.231",
        port: "15711",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "cloud.quayomobility.ca",
        port: "15711",
        pathname: "/**",
      },
    ],
  },
  i18n: {
    locales: ["fr", "en"], // Add your supported locales
    defaultLocale: "en", // Set the default locale
  },
};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// module.exports = nextConfig;
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  ...nextConfig,
});
