import { MetadataRoute } from "next";
import { api_instance } from "@/global";
import { PaginatedVideoResponse } from "@/types/video";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bideo.rajit.cc";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tech-stack`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const res = await fetch(`${api_instance}/vid/all?page=0&size=500`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data: PaginatedVideoResponse = await res.json();
      const videoPages: MetadataRoute.Sitemap = (data.content || [])
        .filter(
          (v) =>
            (v.videoStatus === "COMPLETED" || !v.videoStatus) &&
            v.visibility !== "PRIVATE"
        )
        .map((video) => ({
          url: `${baseUrl}/watch/${video.slug || video.videoId}`,
          lastModified: video.video_uploadDate
            ? new Date(video.video_uploadDate)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));

      return [...staticPages, ...videoPages];
    }
  } catch {
    // Fallback if backend is unreachable during static analysis
  }

  return staticPages;
}
