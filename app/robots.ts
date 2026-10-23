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
          "/my-videos",
          "/video/upload",
          "/proxy",
          "/profile/*/edit",
        ],
      },
      {
        userAgent: [
          "Googlebot",
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
        allow: ["/", "/watch/*", "/profile/*"],
        disallow: ["/my-videos", "/video/upload", "/proxy"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/video-sitemap.xml`,
    ],
    host: baseUrl,
  };
}
