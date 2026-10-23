import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { fetchVideos } from "@/utility/requests";
import { SITE_URL, generateFaqSchema } from "@/utility/seo";
import { PaginatedVideoResponse, VideoDTO } from "@/types/video";
import ExploreClient from "@/components/explore/ExploreClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Zap, ShieldCheck, Video, HelpCircle } from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration every 60s

export const metadata: Metadata = {
  title: "BuzzClips - Stream Trending Video Clips, Creator Shorts & Entertainment",
  description:
    "Watch, share, and stream trending video clips, gaming highlights, tech tutorials, and viral entertainment on BuzzClips. Adaptive HLS playback with zero lag.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "BuzzClips - Stream Trending Video Clips & Creator Shorts",
    description:
      "Watch trending videos, creator clips, and high-speed streaming on BuzzClips with adaptive HLS video playback.",
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
    title: "BuzzClips - Stream Trending Video Clips & Creator Shorts",
    description:
      "Watch trending videos, creator clips, and high-speed streaming on BuzzClips.",
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

const FAQS = [
  {
    q: "What is BuzzClips?",
    a: "BuzzClips is a next-generation video streaming and creator clip platform that delivers lightning-fast, buffer-free video playback powered by adaptive HLS technology. Viewers can watch trending viral clips, gaming highlights, tech tutorials, and entertainment videos, while creators can upload and share content effortlessly.",
  },
  {
    q: "Is BuzzClips completely free to watch and use?",
    a: "Yes! BuzzClips is 100% free to explore, stream, and share videos. Anyone can watch high-definition videos with adaptive bitrate streaming without any subscription fee.",
  },
  {
    q: "How does BuzzClips provide buffer-free video streaming?",
    a: "BuzzClips utilizes automated HTTP Live Streaming (HLS) transcoding and adaptive bitrate switching. The player dynamically adjusts resolution in real-time according to your network bandwidth, ensuring instant playback on mobile and desktop devices.",
  },
  {
    q: "How do I upload and share video clips on BuzzClips?",
    a: "Simply create a free BuzzClips account or sign in, navigate to the Upload Video section, select your MP4 or WebM video file, and add your title, category, and tags. BuzzClips automatically processes and optimizes your video for immediate worldwide streaming.",
  },
  {
    q: "What categories of video content are available on BuzzClips?",
    a: "BuzzClips offers an expansive range of categories including Tech & Coding, Gaming, Education & Tutorials, Entertainment & Comedy, Music & Beats, News, Sports & Fitness, and Lifestyle vlogs.",
  },
];

const TRENDING_TAGS = [
  "buzzclips",
  "tech",
  "coding",
  "gaming",
  "entertainment",
  "music",
  "viral",
  "tutorials",
  "highlights",
  "lifestyle",
];

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

  const faqSchema = generateFaqSchema(SITE_URL);

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

      <script
        id="home-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

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

      {/* Main Explore Video Feed */}
      <Suspense fallback={<ExploreSkeleton />}>
        <ExploreClient
          initialVideos={initialVideos}
          initialPage={initialPage}
        />
      </Suspense>

      {/* SEO & Discoverability Hub Section */}
      <section className="w-full flex justify-center py-12 border-t border-border/40 bg-card/20">
        <div className="w-full lg:max-w-[85%] px-4 space-y-12">
          {/* Trending Topics & Tags */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Trending on BuzzClips
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/60 transition-all duration-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Zero-Lag Adaptive HLS
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automated transcoding with multi-bitrate resolution switching ensures fast, instantaneous video playback on every device.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Built for Video Creators
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Effortless video uploads, custom tagging, thumbnail selection, and real-time community engagement with like/dislike metrics.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Safe & Free Community
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enjoy unlimited video streaming completely free with strong community guidelines, copyright safety, and cross-device sync.
              </p>
            </div>
          </div>

          {/* Frequently Asked Questions (FAQ) with Schema Integration */}
          <div className="space-y-6 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Frequently Asked Questions about BuzzClips
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Learn more about how BuzzClips delivers high-performance video streaming and creator tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FAQS.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-200 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground">
                    <span>{faq.q}</span>
                    <span className="shrink-0 ml-2 text-primary transition duration-300 group-open:-rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
