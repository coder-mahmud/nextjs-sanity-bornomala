import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.ecolebornomala.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'bornomala.local',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'bornomala-issue.local',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'admin.ecolebornomala.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
