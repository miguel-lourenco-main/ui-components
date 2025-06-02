/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['gitlab.com'],
  },
  webpack: (config) => {
    // Fallback for Node.js modules in client-side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
}

module.exports = nextConfig 