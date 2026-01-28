/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    ],
  },
};

module.exports = nextConfig;
