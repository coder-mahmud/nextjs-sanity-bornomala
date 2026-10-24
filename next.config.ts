import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Remote Image Patterns */
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
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },

  /* Security Headers for YouTube Embeds & Iframes */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;