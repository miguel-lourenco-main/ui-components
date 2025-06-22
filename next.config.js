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
  // Enable build-time optimizations
  experimental: {
    // Optimize bundle splitting
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-toggle',
      '@radix-ui/react-tooltip',
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

    // Optimize Monaco Editor loading
    if (!dev && !isServer) {
      // Split Monaco Editor into separate chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            monaco: {
              name: 'monaco-editor',
              test: /[\\/]node_modules[\\/](@monaco-editor|monaco-editor)[\\/]/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
            radixui: {
              name: 'radix-ui',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              maxSize: 200000, // 200KB chunks
            },
          },
        },
      };

      // Add performance hints for large assets
      config.performance = {
        ...config.performance,
        maxAssetSize: 300000, // 300KB
        maxEntrypointSize: 300000, // 300KB
        assetFilter: function(assetFilename) {
          // Ignore source maps and known large files
          return !assetFilename.endsWith('.map') && 
                 !assetFilename.includes('monaco-editor');
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

    return config;
  },
}

module.exports = nextConfig 