import { VideoDTO } from "@/types/video";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://bideo.rajit.cc";

/**
 * Normalizes any duration format (seconds, "MM:SS", "HH:MM:SS", or ISO 8601)
 * into a valid ISO 8601 duration string (e.g., "PT2M30S" or "PT1H12M45S")
 * required by Google VideoObject structured data.
 */
export function formatToIsoDuration(
  duration?: string | number | null
): string | undefined {
  if (!duration) return undefined;

  // Already valid ISO 8601 (e.g. PT1M30S or PT45S)
  if (typeof duration === "string" && /^PT(\d+H)?(\d+M)?(\d+S)?$/i.test(duration.trim())) {
    return duration.trim().toUpperCase();
  }

  let totalSeconds = 0;

  if (typeof duration === "number") {
    totalSeconds = Math.max(0, Math.floor(duration));
  } else if (typeof duration === "string") {
    const parts = duration.trim().split(":").map((p) => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      totalSeconds = parts[0] * 60 + parts[1];
    } else if (
      parts.length === 3 &&
      !isNaN(parts[0]) &&
      !isNaN(parts[1]) &&
      !isNaN(parts[2])
    ) {
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      const parsed = parseInt(duration, 10);
      if (!isNaN(parsed) && parsed > 0) {
        totalSeconds = parsed;
      }
    }
  }

  if (totalSeconds <= 0) return undefined;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let iso = "PT";
  if (hours > 0) iso += `${hours}H`;
  if (minutes > 0) iso += `${minutes}M`;
  if (seconds > 0 || (hours === 0 && minutes === 0)) iso += `${seconds}S`;

  return iso;
}

/**
 * Schema.org WebSite structured data with SearchAction for Google Sitelinks Searchbox.
 */
export function generateWebSiteSchema(siteUrl: string = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "BuzzClips",
    alternateName: ["BuzzClips", "BuzzClips App", "BuzzClips Streaming", "BuzzClips Video Platform"],
    description:
      "Next-Gen Video Streaming Platform with adaptive HLS playback, community creator tools, and fast video discovery.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Schema.org Organization structured data for brand authority & Knowledge Graph entity.
 */
export function generateOrganizationSchema(siteUrl: string = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "BuzzClips",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/favicon.ico`,
      width: 64,
      height: 64,
    },
    sameAs: [
      "https://github.com/rajitk13/bideo_ui",
      "https://linkedin.com/in/rajitkuthiala",
    ],
  };
}

/**
 * BreadcrumbList schema for enhanced SERP presentation.
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Google-compliant VideoObject schema for watch pages.
 */
export function generateVideoJsonLd(
  video: VideoDTO,
  siteUrl: string = SITE_URL
) {
  const watchUrl = `${siteUrl}/watch/${video.slug || video.videoId}`;
  const title = video.seo?.title || video.video_title || "Watch Video";
  const description =
    video.seo?.description ||
    video.description ||
    `Watch ${title} on BuzzClips. Fast adaptive HLS streaming with instant playback.`;
  const thumbnailUrl = video.thumbnail_url || `${siteUrl}/favicon.ico`;
  const uploadDate = video.video_uploadDate
    ? new Date(video.video_uploadDate).toISOString()
    : new Date().toISOString();

  const durationIso =
    formatToIsoDuration(video.iso_duration) ||
    formatToIsoDuration(video.video_duration);

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description,
    thumbnailUrl: [thumbnailUrl],
    uploadDate,
    contentUrl: video.m3u8Url,
    embedUrl: watchUrl,
    inLanguage: "en",
    ...(durationIso ? { duration: durationIso } : {}),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: { "@type": "https://schema.org/WatchAction" },
      userInteractionCount: video.video_views || 0,
    },
    author: {
      "@type": "Person",
      name: video.video_uploader?.user_name || "BuzzClips Creator",
      url: video.video_uploader?.userId
        ? `${siteUrl}/profile/${video.video_uploader.userId}`
        : siteUrl,
    },
    ...(video.tags && video.tags.length > 0
      ? { keywords: video.tags.join(", ") }
      : {}),
  };
}
