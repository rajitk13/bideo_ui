import React from "react";
import { render } from "@testing-library/react";
import { VideoSeoHead } from "@/components/video/VideoSeoHead";
import { VideoDTO } from "@/types/video";

describe("VideoSeoHead", () => {
  const mockVideoWithSeo: VideoDTO = {
    videoId: 1,
    video_title: "How to Build Next.js Apps",
    slug: "how-to-build-nextjs-apps",
    video_uploadDate: "2026-01-01T10:00:00Z",
    video_views: 1250,
    videoStatus: "COMPLETED",
    seo: {
      title: "How to Build Next.js Apps",
      description: "A complete step-by-step tutorial on Next.js 15.",
      canonicalUrl: "https://buzzclips.app/watch/how-to-build-nextjs-apps",
      openGraph: {
        "og:title": "How to Build Next.js Apps",
        "og:description": "A complete step-by-step tutorial on Next.js 15.",
        "og:type": "video.other",
      },
      twitterCard: {
        "twitter:card": "summary_large_image",
        "twitter:title": "How to Build Next.js Apps",
      },
      jsonLdVideoObject: {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: "How to Build Next.js Apps",
        description: "A complete step-by-step tutorial on Next.js 15.",
        uploadDate: "2026-01-01T10:00:00Z",
      },
    },
  };

  afterEach(() => {
    document.title = "";
    document.head.querySelectorAll("meta, link, script").forEach((el) => {
      el.remove();
    });
  });

  it("updates document.title and description meta tag", () => {
    render(<VideoSeoHead video={mockVideoWithSeo} />);

    expect(document.title).toBe("How to Build Next.js Apps | BuzzClips");

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta).not.toBeNull();
    expect(descMeta?.getAttribute("content")).toBe(
      "A complete step-by-step tutorial on Next.js 15."
    );
  });

  it("sets OpenGraph and Twitter card meta tags correctly", () => {
    render(<VideoSeoHead video={mockVideoWithSeo} />);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute("content")).toBe("How to Build Next.js Apps");

    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute("content")).toBe("summary_large_image");
  });

  it("sets canonical link tag", () => {
    render(<VideoSeoHead video={mockVideoWithSeo} />);

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).not.toBeNull();
    expect(canonical?.getAttribute("href")).toBe(
      "https://buzzclips.app/watch/how-to-build-nextjs-apps"
    );
  });

  it("injects Schema.org JSON-LD VideoObject script tag", () => {
    render(<VideoSeoHead video={mockVideoWithSeo} />);

    const scriptTag = document.getElementById(
      "video-schema-jsonld"
    ) as HTMLScriptElement;
    expect(scriptTag).not.toBeNull();
    expect(scriptTag.type).toBe("application/ld+json");

    const parsedJson = JSON.parse(scriptTag.text);
    expect(parsedJson["@type"]).toBe("VideoObject");
    expect(parsedJson.name).toBe("How to Build Next.js Apps");
  });

  it("handles video without SEO metadata gracefully", () => {
    const videoWithoutSeo: VideoDTO = {
      videoId: 2,
      video_title: "Plain Video",
      video_uploadDate: "2026-01-01",
      video_views: 10,
    };

    const { container } = render(<VideoSeoHead video={videoWithoutSeo} />);
    expect(container.firstChild).toBeNull();
    expect(document.querySelector('meta[name="description"]')).toBeNull();
  });
});
