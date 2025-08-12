/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Enable build-time optimizations (conservative for static export)
  experimental: {
    // Only optimize the largest packages to avoid over-splitting
    optimizePackageImports: [
      'lucide-react',
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Only apply fallbacks on client-side, keep Node.js modules available on server-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Conservative chunk splitting optimized for GitLab Pages static hosting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          minSize: 100000, // Minimum 100KB chunks to reduce HTTP requests
          maxSize: 500000, // Maximum 500KB chunks for reasonable file sizes
          cacheGroups: {
            // Default Next.js groups but with larger minimums
            default: {
              name: false,
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              minSize: 100000, // Larger minimum to reduce file count
            },
            // Large vendor libraries only
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: -10,
              reuseExistingChunk: true,
              minSize: 150000, // Only create vendor chunks for larger libraries
              maxSize: 800000, // Allow larger vendor chunks
            },
            // Monaco Editor as separate chunk only if it's large enough
            monaco: {
              name: 'monaco-editor',
              test: /[\\/]node_modules[\\/](@monaco-editor|monaco-editor)[\\/]/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
              enforce: true, // Always split Monaco due to its size
            },
          },
        },
      };

      // Relax performance hints for fewer, larger files
      config.performance = {
        ...config.performance,
        maxAssetSize: 800000, // 800KB - allow larger files to reduce HTTP requests
        maxEntrypointSize: 800000, // 800KB
        assetFilter: function(assetFilename) {
          return !assetFilename.endsWith('.map');
        },
      };
    }

    // Optimize for better tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure better tree shaking for React
      'react/jsx-runtime.js': 'react/jsx-runtime',
      'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
    };

    // Support importing source files as raw strings using ?raw
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      resourceQuery: /raw/,
      type: 'asset/source',
    });

    return config;
  },
}

module.exports = nextConfig 