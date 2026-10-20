import type { NextConfig } from "next";
import { execSync } from "child_process";

function getGitCommitSha(): string {
  try {
    const rawSha =
      process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT ||
      process.env.GITHUB_SHA ||
      execSync("git rev-parse --short HEAD").toString().trim();
    return rawSha ? rawSha.trim().slice(0, 7) : "dev";
  } catch {
    return "dev";
  }
}

function getBuildNumber(): string {
  return (
    process.env.NEXT_PUBLIC_BUILD_NUMBER ||
    process.env.BUILD_NUMBER ||
    ""
  ).trim();
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA: getGitCommitSha(),
    NEXT_PUBLIC_BUILD_NUMBER: getBuildNumber(),
  },
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
