import { Metadata } from "next";
import { Suspense } from "react";
import { LiveTvClient } from "@/components/tv/LiveTvClient";
import { INDIAN_LIVE_CHANNELS } from "@/constants/liveChannels";
import {
  SITE_URL,
  generateLiveTvSchema,
  generateBreadcrumbSchema,
  generateChannelListSchema,
  generateLiveTvFaqSchema,
} from "@/utility/seo";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60;

interface LiveTvPageProps {
  searchParams: Promise<{ channel?: string }>;
}

export async function generateMetadata({
  searchParams,
}: LiveTvPageProps): Promise<Metadata> {
  const { channel: channelId } = await searchParams;
  const channel =
    INDIAN_LIVE_CHANNELS.find((c) => c.id === channelId) ||
    INDIAN_LIVE_CHANNELS[0];

  const isSpecificChannel = Boolean(channelId);
  const title = isSpecificChannel
    ? `${channel.name} (${channel.hindiName}) Live Stream - BuzzClips TV | Free HD Online`
    : `BuzzClips TV - Free Indian Live TV Streaming | Watch 12+ Official HD Channels Online`;

  const description = isSpecificChannel
    ? `Watch ${channel.name} (${channel.hindiName}) live stream online free in HD on BuzzClips TV. Official Indian Free-To-Air TV broadcasting Doordarshan national, news, sports, and culture with zero buffering.`
    : `Watch 12+ Indian Free-To-Air Live TV channels online free in HD on BuzzClips TV. Stream DD National, DD Sports, DD News, Sansad TV Lok Sabha & Rajya Sabha with zero login and zero lag.`;

  const canonicalUrl = `${SITE_URL}/tv${isSpecificChannel ? `?channel=${channel.id}` : ""}`;

  return {
    title,
    description,
    keywords: [
      // Primary BuzzClips TV Brand Queries
      "buzzclips tv",
      "buzzclips live tv",
      "buzzclips tv streaming",
      "watch buzzclips tv",
      "buzzclips tv online",
      "buzzclips free tv",
      "buzzclips live channels",
      // Channel-Specific Keywords
      `${channel.name} live`,
      `${channel.name} live stream`,
      `${channel.name} online free`,
      `${channel.hindiName} लाइव`,
      "DD National live",
      "DD Sports live streaming",
      "DD News live online",
      "Sansad TV Lok Sabha live",
      "Sansad TV Rajya Sabha live stream",
      "DD India live",
      "DD Bharati live stream",
      // Generic High-Intent Queries
      "Indian free live TV channels",
      "watch Indian news live",
      "DD Free Dish online streaming",
      "free live TV India web",
      "Prasar Bharati live stream",
      "official Indian TV stream",
      "डीडी नेशनल लाइव",
      "डीडी स्पोर्ट्स लाइव",
      "लाइव टीवी भारत",
      "Made in India live tv streaming",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "video.other",
      locale: "en_IN",
      siteName: "BuzzClips TV",
      images: [
        {
          url: channel.logo || `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${channel.name} Live on BuzzClips TV`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [channel.logo || `${SITE_URL}/opengraph-image`],
    },
  };
}

export default async function LiveTvPage({ searchParams }: LiveTvPageProps) {
  const { channel: channelId } = await searchParams;
  const activeChannel =
    INDIAN_LIVE_CHANNELS.find((c) => c.id === channelId) ||
    INDIAN_LIVE_CHANNELS[0];

  const liveTvSchema = generateLiveTvSchema(activeChannel, SITE_URL);
  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "BuzzClips TV (लाइव टीवी)", url: `${SITE_URL}/tv` },
    { name: activeChannel.name, url: `${SITE_URL}/tv?channel=${activeChannel.id}` },
  ]);
  const channelListSchema = generateChannelListSchema(INDIAN_LIVE_CHANNELS, SITE_URL);
  const faqSchema = generateLiveTvFaqSchema(SITE_URL);

  return (
    <>
      <script
        id="livetv-broadcast-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(liveTvSchema),
        }}
      />
      <script
        id="livetv-breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsSchema),
        }}
      />
      <script
        id="livetv-channellist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(channelListSchema),
        }}
      />
      <script
        id="livetv-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <Suspense
        fallback={
          <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Skeleton className="lg:col-span-7 aspect-video rounded-2xl" />
              <Skeleton className="lg:col-span-5 h-[400px] rounded-2xl" />
            </div>
          </div>
        }
      >
        <LiveTvClient initialChannelId={activeChannel.id} />
      </Suspense>
    </>
  );
}
