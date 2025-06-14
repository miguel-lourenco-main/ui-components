/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // Configure for GitLab Pages - detect if we're using a project subdomain or branch deployment
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.CI_COMMIT_REF_SLUG && process.env.CI_COMMIT_REF_SLUG !== 'main'
    ? `/${process.env.CI_COMMIT_REF_SLUG}`
    : process.env.NODE_ENV === 'production' ? '' : '',
  basePath: process.env.NODE_ENV === 'production' && process.env.CI_COMMIT_REF_SLUG && process.env.CI_COMMIT_REF_SLUG !== 'main'
    ? `/${process.env.CI_COMMIT_REF_SLUG}`
    : '',
  images: {
    domains: ['gitlab.com'],
    unoptimized: true, // Required for static export
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
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