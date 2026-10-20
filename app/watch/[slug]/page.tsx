import ViewVideo from "@/components/video/ViewVideo";
import { Metadata } from "next";
import { getVideoBySlug } from "@/utility/requests";
import { VideoDTO } from "@/types/video";

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = "https://bideo.rajit.cc";
  const canonicalUrl = `${baseUrl}/watch/${slug}`;

  try {
    const video = await getVideoBySlug(slug);
    if (video) {
      const title = video.seo?.title || video.video_title;
      const description =
        video.seo?.description ||
        video.description ||
        `Watch ${video.video_title} on bideo. Fast adaptive HLS streaming with instant playback.`;
      const thumbnailUrl = video.thumbnail_url || `${baseUrl}/favicon.ico`;

      return {
        title: `${title} | bideo`,
        description,
        alternates: {
          canonical: canonicalUrl,
        },
        other: {
          "alternate-oembed": `${baseUrl}/api/oembed?url=${encodeURIComponent(
            canonicalUrl
          )}&format=json`,
        },
        openGraph: {
          type: "video.other",
          siteName: "bideo",
          title,
          description,
          url: canonicalUrl,
          images: [
            {
              url: thumbnailUrl,
              width: 1280,
              height: 720,
              alt: title,
            },
          ],
          videos: video.m3u8Url
            ? [
                {
                  url: video.m3u8Url,
                  type: "application/x-mpegURL",
                  width: 1280,
                  height: 720,
                },
              ]
            : [],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [thumbnailUrl],
        },
      };
    }
  } catch {
    // Fallback if not reachable or during static analysis
  }

  return {
    title: "Watch Video | bideo",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = "https://bideo.rajit.cc";
  let video: VideoDTO | null = null;

  try {
    video = await getVideoBySlug(slug);
  } catch {
    // Handled in ViewVideo
  }

  const watchUrl = `${baseUrl}/watch/${slug}`;
  const title = video?.seo?.title || video?.video_title || "Watch Video";
  const description =
    video?.seo?.description ||
    video?.description ||
    `Watch ${title} on bideo.`;
  const thumbnailUrl = video?.thumbnail_url || `${baseUrl}/favicon.ico`;
  const uploadDate = video?.video_uploadDate
    ? new Date(video.video_uploadDate).toISOString()
    : new Date().toISOString();

  // Construct Google-compliant Schema.org VideoObject for SSR
  const jsonLdVideoObject = video
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: title,
        description,
        thumbnailUrl: [thumbnailUrl],
        uploadDate,
        contentUrl: video.m3u8Url,
        embedUrl: watchUrl,
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: { "@type": "https://schema.org/WatchAction" },
          userInteractionCount: video.video_views || 0,
        },
        author: {
          "@type": "Person",
          name: video.video_uploader?.user_name || "bideo Creator",
          url: video.video_uploader?.userId
            ? `${baseUrl}/profile/${video.video_uploader.userId}`
            : baseUrl,
        },
        ...(video.tags && video.tags.length > 0
          ? { keywords: video.tags.join(", ") }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLdVideoObject && (
        <script
          id="server-video-schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdVideoObject),
          }}
        />
      )}
      <ViewVideo slug={slug} initialVideo={video || undefined} />
    </>
  );
}
