import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5207',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'magaza.adalyasolar.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
