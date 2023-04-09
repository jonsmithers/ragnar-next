// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['mysql2'],
  },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
