import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    domains: [
      "github.com",
      "cdn.jsdelivr.net",
      "bideo-tech-uploads.s3.ap-south-1.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bideo.tech",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
