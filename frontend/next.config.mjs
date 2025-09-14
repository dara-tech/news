import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow production builds to complete even with ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
  
  // Optimize development server startup
  experimental: {
    // Enable faster refresh
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Fix workspace root detection - use relative path to avoid hardcoded paths
  outputFileTracingRoot: '../',

  // External packages for server components
  serverExternalPackages: ['mongoose'],

  // Bundle optimization
  compress: true,
  
  // Code splitting configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -5,
            reuseExistingChunk: true,
          },
          // Split large libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui',
            priority: 15,
            chunks: 'all',
          },
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|clsx)[\\/]/,
            name: 'utils',
            priority: 10,
            chunks: 'all',
          },
        },
      };
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

  // Add redirects to handle common URL patterns and prevent 404s
  async redirects() {
    return [
      // Redirect old pagination URLs to main pages
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
      // Redirect search with query parameters to basic search
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
      // Redirect old article URLs to new format
      {
        source: '/article/:slug',
        destination: '/news/:slug',
        permanent: true,
      },
      // Redirect category pages with pagination
      {
        source: '/category/:slug/page/:page',
        destination: '/category/:slug',
        permanent: true,
      },
    ];
  },

  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      { protocol: 'https', hostname: 'www.khmertimeskh.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'www.washingtonpost.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  output: 'standalone',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default bundleAnalyzer(nextConfig);
