/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // Configure for GitLab Pages - detect if we're using a project subdomain
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  basePath: '',
  images: {
    domains: ['gitlab.com'],
    unoptimized: true, // Required for static export
  },
  webpack: (config, { isServer }) => {
    // Only apply fallbacks on client-side, keep Node.js modules available on server-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 