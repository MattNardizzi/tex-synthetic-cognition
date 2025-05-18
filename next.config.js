// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,      // keep what you already had
  experimental: {
    appDir: true,             // 👈  THIS turns on the App Router
  },
};

module.exports = nextConfig;
