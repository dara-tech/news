/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow SVG images to be loaded
    dangerouslyAllowSVG: true,
    
    // Define remote image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com', // Dicebear API for avatars
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary for hosted images
        pathname: '/**', // Allow all paths under this domain
      },
    ],
  },
  
  // Enable CORS for API routes
  async headers() {
    return [
      {
        // Apply these headers to all routes
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
  
  // Enable server-side rendering for all pages
  output: 'standalone',
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
