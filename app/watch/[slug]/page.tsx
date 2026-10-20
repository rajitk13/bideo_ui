import ViewVideo from "@/components/video/ViewVideo";
import { Metadata } from "next";
import { getVideoBySlug } from "@/utility/requests";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const video = await getVideoBySlug(slug);
    if (video?.seo) {
      return {
        title: `${video.seo.title} | bideo.rajit.cc`,
        description: video.seo.description,
        alternates: {
          canonical: video.seo.canonicalUrl,
        },
        openGraph: {
          title: video.seo.title,
          description: video.seo.description,
          url: video.seo.canonicalUrl,
          images: video.thumbnail_url ? [{ url: video.thumbnail_url }] : [],
        },
        twitter: {
          card: "summary_large_image",
          title: video.seo.title,
          description: video.seo.description,
          images: video.thumbnail_url ? [video.thumbnail_url] : [],
        },
      };
    }
  } catch {
    // Fallback if not reachable or during static analysis
  }

  return {
    title: "Watch Video | bideo.rajit.cc",
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ViewVideo slug={slug} />;
}
