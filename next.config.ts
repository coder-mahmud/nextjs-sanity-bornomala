import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bornomala.premiumchickenltd.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
