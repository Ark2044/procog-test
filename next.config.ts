import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['fra.cloud.appwrite.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
        port: '',
        pathname: '/v1/storage/buckets/**',
      },
    ],
  },
};

export default nextConfig;
