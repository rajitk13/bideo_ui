import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BuzzClips - Next-Gen Video Streaming Platform",
    short_name: "BuzzClips",
    description:
      "Explore, share, and stream high-quality videos on BuzzClips. Powered by adaptive HLS streaming and creator-first tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
