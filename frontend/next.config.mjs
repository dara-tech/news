import withBundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-*'],
    scrollRestoration: true,
    // Memory optimization
    memoryBasedWorkersCount: true,
    workerThreads: false,
  },
  
  // Turbopack configuration (replaces deprecated turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Compress responses
  compress: true,
  
  // Fix workspace root warning
  outputFileTracingRoot: path.join(__dirname, '..'),
  
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  
  // Optimize images
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      { protocol: 'https', hostname: 'www.khmertimeskh.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'www.washingtonpost.com' },
    ],
    // Disable optimization for external images to prevent 404 errors
    unoptimized: true,
  },

  // Advanced webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Development memory optimizations
    if (dev) {
      // Reduce memory usage in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Disable source maps in development to save memory
      config.devtool = false;
    }
    
    // Production optimizations
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 244000,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -5,
            reuseExistingChunk: true,
            maxSize: 244000,
          },
          // Split large libraries
          react: {
            test: /[\/]node_modules[\/](react|react-dom)[\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          ui: {
            test: /[\/]node_modules[\/](@radix-ui|lucide-react)[\/]/,
            name: 'ui',
            priority: 15,
            chunks: 'all',
          },
          utils: {
            test: /[\/]node_modules[\/](lodash|date-fns|clsx)[\/]/,
            name: 'utils',
            priority: 10,
            chunks: 'all',
          },
          // AI services - separate chunk
          ai: {
            test: /[\/]node_modules[\/](@google[\/]generative-ai)[\/]/,
            name: 'ai',
            priority: 5,
            chunks: 'all',
          },
        },
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Module concatenation
      config.optimization.concatenateModules = true;
    }
    
    return config;
  },

  // Proxy API calls to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/:path*`,
      },
    ];
  },

  // Add redirects to handle common URL patterns
  async redirects() {
    return [
      {
        source: '/news/page/:page',
        destination: '/news',
        permanent: true,
      },
      {
        source: '/archive/page/:page',
        destination: '/archive',
        permanent: true,
      },
      {
        source: '/categories/page/:page',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/search',
        has: [
          {
            type: 'query',
            key: 'q',
          },
        ],
        destination: '/search',
        permanent: false,
      },
      {
        source: '/article/:slug',
        destination: '/news/:slug',
        permanent: true,
      },
      {
        source: '/category/:slug/page/:page',
        destination: '/category/:slug',
        permanent: true,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  output: 'standalone',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default withNextIntl(bundleAnalyzer(nextConfig));