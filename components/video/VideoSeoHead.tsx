"use client";

import { useEffect } from "react";
import { VideoDTO } from "@/types/video";

interface VideoSeoHeadProps {
  video: VideoDTO;
}

export const VideoSeoHead: React.FC<VideoSeoHeadProps> = ({ video }) => {
  const seo = video.seo;

  useEffect(() => {
    if (!seo) return;

    // Document title
    document.title = `${seo.title} | bideo.rajit.cc`;

    // Helper to set or create meta tags
    const setMetaTag = (property: string, content: string, isName = false) => {
      const selector = isName
        ? `meta[name="${property}"]`
        : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        if (isName) element.setAttribute("name", property);
        else element.setAttribute("property", property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Standard description
    if (seo.description) {
      setMetaTag("description", seo.description, true);
    }

    // OpenGraph
    if (seo.openGraph) {
      Object.entries(seo.openGraph).forEach(([key, value]) => {
        if (value) setMetaTag(key, value);
      });
    }

    // Twitter Cards
    if (seo.twitterCard) {
      Object.entries(seo.twitterCard).forEach(([key, value]) => {
        if (value) setMetaTag(key, value, true);
      });
    }

    // Canonical link
    if (seo.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", seo.canonicalUrl);
    }

    // Schema.org JSON-LD VideoObject script tag
    const scriptId = "video-schema-jsonld";
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (seo.jsonLdVideoObject) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(seo.jsonLdVideoObject);
    }

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };
  }, [seo]);

  // Also render direct ld+json tag in client DOM for immediate crawling
  if (!seo?.jsonLdVideoObject) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(seo.jsonLdVideoObject),
      }}
    />
  );
};
