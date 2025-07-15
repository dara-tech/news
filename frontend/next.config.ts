import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('http://localhost:5001/**'),
      new URL('https://res.cloudinary.com/**'),
    ],
  },
  // other config options...
};

export default nextConfig;
