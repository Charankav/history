import type { NextConfig } from 'next';

// Static export for GitHub Pages (https://charankav.github.io/history)
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/history',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
