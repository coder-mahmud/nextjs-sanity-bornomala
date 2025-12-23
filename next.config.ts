import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'bornomala.local',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
