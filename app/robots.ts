import { MetadataRoute } from "next";
import { SITE_URL } from "@/utility/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/search",
          "/history",
          "/playlists",
          "/my-videos",
          "/video/upload",
          "/proxy",
          "/profile/edit",
          "/profile/*/edit",
          "/auth/",
        ],
      },
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Googlebot-Video",
          "Bingbot",
          "Slurp",
          "DuckDuckBot",
          "Baiduspider",
          "YandexBot",
          "facebookexternalhit",
          "Twitterbot",
          "LinkedInBot",
          "Discordbot",
        ],
        allow: [
          "/",
          "/watch/*",
          "/channel/*",
          "/category/*",
          "/tag/*",
          "/trending",
          "/favicon.ico",
          "/icon*",
          "/apple-touch-icon*",
          "/opengraph-image*",
          "/manifest.webmanifest",
        ],
        disallow: [
          "/search",
          "/history",
          "/playlists",
          "/my-videos",
          "/video/upload",
          "/proxy",
          "/profile/edit",
          "/profile/*/edit",
          "/auth/",
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/video-sitemap.xml`,
    ],
    host: baseUrl,
  };
}
