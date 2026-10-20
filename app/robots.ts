import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://bideo.rajit.cc";

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
