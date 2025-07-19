import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    domains: ["github.com", "cdn.jsdelivr.net"],
  },
};

export default nextConfig;
