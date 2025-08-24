/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // Configure for GitLab Pages - detect if we're using a project subdomain or branch deployment
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.CI_COMMIT_REF_SLUG && process.env.CI_COMMIT_REF_SLUG !== 'main'
    ? `/${process.env.CI_COMMIT_REF_SLUG}`
    : process.env.NODE_ENV === 'production' ? '' : '',
  basePath: process.env.NODE_ENV === 'production' && process.env.CI_COMMIT_REF_SLUG && process.env.CI_COMMIT_REF_SLUG !== 'main'
    ? `/${process.env.CI_COMMIT_REF_SLUG}`
    : '',
  output: 'export',
  images: {
    domains: ['gitlab.com'],
    unoptimized: true, // Required for static export
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
  // Enable build-time optimizations for better tree shaking
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'react-hook-form',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
    ],
    // Enable more aggressive tree shaking
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Enable compression for better performance
  compress: true,
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

    // Optimized chunk splitting for GitLab Pages static hosting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 200000, // Increased minimum size to reduce chunk count
          maxSize: 1000000, // Increased maximum size for better consolidation
          cacheGroups: {
            // React and React DOM as a single chunk
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            // Next.js framework as a single chunk
            next: {
              name: 'next',
              test: /[\\/]node_modules[\\/](next)[\\/]/,
              chunks: 'all',
              priority: 35,
              enforce: true,
            },
            // Monaco Editor as separate chunk
            monaco: {
              name: 'monaco-editor',
              test: /[\\/]node_modules[\\/](@monaco-editor|monaco-editor)[\\/]/,
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            // Large UI libraries grouped together
            ui: {
              name: 'ui-libs',
              test: /[\\/]node_modules[\\/](@radix-ui|class-variance-authority|clsx|tailwind-merge|tailwindcss-animate|vaul|cmdk|embla-carousel-react|input-otp|sonner)[\\/]/,
              chunks: 'all',
              priority: 25,
              enforce: true,
            },
            // Chart and PDF libraries
            charts: {
              name: 'charts-pdf',
              test: /[\\/]node_modules[\\/](recharts|react-pdf|react-resizable-panels)[\\/]/,
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            // Form and table libraries
            forms: {
              name: 'forms-tables',
              test: /[\\/]node_modules[\\/](react-hook-form|@tanstack|react-day-picker)[\\/]/,
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
            // Babel and code parsing libraries
            babel: {
              name: 'babel-parser',
              test: /[\\/]node_modules[\\/](@babel|acorn|eslint-scope)[\\/]/,
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            // Remaining vendor libraries consolidated
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: -10,
              reuseExistingChunk: true,
              minSize: 300000, // Higher minimum to avoid tiny vendor chunks
            },
            // Default group for shared code
            default: {
              name: false,
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              minSize: 200000, // Higher minimum to reduce file count
            },
          },
        },
        // Enable more aggressive tree shaking
        usedExports: true,
        sideEffects: false,
      };

      // Relax performance hints for fewer, larger files
      config.performance = {
        ...config.performance,
        maxAssetSize: 1200000, // 1.2MB - allow larger files to reduce HTTP requests
        maxEntrypointSize: 1200000, // 1.2MB
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
    // Ensure raw source imports (e.g., file.tsx?raw) return the untransformed file contents
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      resourceQuery: /raw/,
      type: 'asset/source',
      exclude: /node_modules/,
    });

    return config;
  },
}

module.exports = nextConfig 