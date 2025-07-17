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

};

export default nextConfig;
