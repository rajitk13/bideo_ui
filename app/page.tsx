import { Metadata } from "next";
import { Suspense } from "react";
import { fetchVideos } from "@/utility/requests";
import { SITE_URL } from "@/utility/seo";
import { PaginatedVideoResponse, VideoDTO } from "@/types/video";
import ExploreClient from "@/components/explore/ExploreClient";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60; // Incremental Static Regeneration every 60s

export const metadata: Metadata = {
  title: "BuzzClips - Next-Gen Video Streaming & Creator Platform",
  description:
    "Discover, watch, and search trending videos, creator clips, gaming highlights, and tutorials on BuzzClips with adaptive HLS streaming and instant video discovery.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "BuzzClips - Explore Trending Videos & Creators",
    description:
      "Watch trending videos, creator clips, and high-quality streaming on BuzzClips.",
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "BuzzClips - Next-Gen Video Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzClips - Explore Trending Videos & Creators",
    description:
      "Watch trending videos, creator clips, and high-quality streaming on BuzzClips.",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

function ExploreSkeleton() {
  return (
    <div className="w-full flex justify-center py-6">
      <div className="w-full lg:max-w-[85%] px-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-11 w-full max-w-md rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-video rounded-xl" />
              <div className="flex gap-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-2/3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  let initialPage: PaginatedVideoResponse | null = null;
  let initialVideos: VideoDTO[] = [];

  try {
    initialPage = await fetchVideos(0);
    initialVideos = (initialPage?.content || []).filter(
      (v: VideoDTO) =>
        (v.videoStatus === "COMPLETED" || !v.videoStatus) &&
        v.visibility !== "PRIVATE"
    );
  } catch (err) {
    console.error("SSR fetch videos failed for homepage:", err);
  }

  // Schema.org ItemList structured data for search engine carousels
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending Videos on BuzzClips",
    itemListElement: initialVideos.map((video, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/watch/${video.slug || video.videoId}`,
      name: video.video_title,
      description:
        video.description ||
        `Watch ${video.video_title} on BuzzClips. High performance video streaming.`,
      image: video.thumbnail_url || `${SITE_URL}/favicon.ico`,
    })),
  };

  return (
    <>
      {initialVideos.length > 0 && (
        <script
          id="home-itemlist-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListSchema),
          }}
        />
      )}

      {/* Crawlable noscript list for search engines that do not execute client JS */}
      {initialVideos.length > 0 && (
        <noscript>
          <div className="sr-only">
            <h2>Trending Videos on BuzzClips</h2>
            <ul>
              {initialVideos.map((video) => (
                <li key={video.videoId}>
                  <a href={`/watch/${video.slug || video.videoId}`}>
                    {video.video_title}
                  </a>
                  <p>{video.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </noscript>
      )}

      <Suspense fallback={<ExploreSkeleton />}>
        <ExploreClient
          initialVideos={initialVideos}
          initialPage={initialPage}
        />
      </Suspense>
    </>
  );
}
