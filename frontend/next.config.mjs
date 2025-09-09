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
  webpack(config) {
    return config;
  },
};

export default bundleAnalyzer(nextConfig);
