# 🚀 Frontend Integration Guide for Video SEO, Metadata & Player Features (BuzzClips)

This production guide provides instructions and copy-pasteable TypeScript & Next.js 15 / React 19 code snippets to integrate backend SEO metadata, server-rendered Schema.org JSON-LD, slug-based routing, video upload/edit workflows, engagement, and timestamp-based commenting into the frontend application (**BuzzClips**).

---

## 1. Domain & API Architecture

- **Production Domain**: `https://buzzclips.app` (or configured via `process.env.NEXT_PUBLIC_SITE_URL`)
- **Backend API Base**: `https://buzzclips.app/api` (or `http://localhost:8085/api` during local development)

### Available API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vid/slug/{slug}` | **Primary Video Lookup** (returns video + precomputed SEO & Schema.org data) |
| `GET` | `/api/vid/view/{videoId}` | Lookup by numeric ID (increments views) |
| `POST` | `/api/vid/upload` | Multipart upload with `description`, `tags`, `category`, `visibility` |
| `PUT` | `/api/vid/{videoId}?userId={userId}` | Edit video title, description, tags, category, visibility |
| `GET` | `/api/vid/search?query=&category=&tag=&page=&size=` | Search & filter public completed videos |
| `GET` | `/api/vid/all?page=&size=` | Public completed videos feed with pagination |
| `GET` | `/api/vid/{videoId}/engagement` | Real-time O(1) Redis likes/dislikes & user reaction |
| `POST` | `/api/vid/{videoId}/like` | Toggle like (switches from dislike if active) |
| `POST` | `/api/vid/{videoId}/dislike` | Toggle dislike (switches from like if active) |
| `GET` | `/api/vid/{videoId}/comments` | Threaded comments sorted by `newest` or `top` |
| `POST` | `/api/vid/{videoId}/comments` | Post comment with optional video timestamp |
| `GET/POST`| `/api/vid/{videoId}/progress` | Cross-device watch progress heartbeat & resume |

---

## 2. TypeScript Data Transfer Objects (`types/video.ts`)

```typescript
export type VideoCategory =
  | 'TECH'
  | 'EDUCATION'
  | 'GAMING'
  | 'ENTERTAINMENT'
  | 'MUSIC'
  | 'NEWS'
  | 'SPORTS'
  | 'LIFESTYLE'
  | 'OTHER';

export type VideoVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

export type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SeoMetadataDTO {
  title: string;
  description: string;
  canonicalUrl: string;
  jsonLdVideoObject: Record<string, unknown>;
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
}

export interface UserDTO {
  userId: string;
  user_name: string;
  user_email?: string;
  user_role?: string;
  avatar_url?: string;
}

export interface VideoDTO {
  videoId: number;
  video_title: string;
  slug: string;
  description?: string;
  tags?: string[];
  category?: VideoCategory;
  visibility?: VideoVisibility;
  video_uploadDate: string;
  video_views: number;
  m3u8Url?: string;
  video_duration?: string;
  iso_duration?: string;
  thumbnail_url?: string;
  videoStatus: VideoStatus;
  video_uploader?: UserDTO;
  seo?: SeoMetadataDTO;
}

export interface VideoMetadataUpdateRequest {
  videoTitle?: string;
  description?: string;
  tags?: string[];
  category?: VideoCategory;
  visibility?: VideoVisibility;
}

export interface EngagementDTO {
  videoId: number;
  likesCount: number;
  dislikesCount: number;
  userReaction: 'LIKE' | 'DISLIKE' | 'NONE';
}

export interface CommentDTO {
  commentId: number;
  content: string;
  timestampInSeconds?: number;
  likeCount: number;
  isPinned: boolean;
  replyCount: number;
  createdAt: string;
  user: UserDTO;
}
```

---

## 3. Server-Side SEO & Schema.org Utilities (`utility/seo.ts`)

> [!IMPORTANT]
> **Why Server-Side SEO?** Search crawlers (Googlebot, Bingbot) and social platform scrapers (Twitterbot, Discordbot, WhatsApp, Facebook) do **not** wait for client-side `useEffect` to execute. Metadata and JSON-LD must be emitted in the initial SSR HTML payload.

```typescript
import { VideoDTO } from "@/types/video";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://buzzclips.app";

/**
 * Normalizes any duration format (seconds, "MM:SS", "HH:MM:SS", or ISO 8601)
 * into a valid ISO 8601 duration string (e.g. "PT2M30S") required by Google VideoObject.
 */
export function formatToIsoDuration(
  duration?: string | number | null
): string | undefined {
  if (!duration) return undefined;
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
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      const parsed = parseInt(duration, 10);
      if (!isNaN(parsed) && parsed > 0) totalSeconds = parsed;
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
 * Google-compliant VideoObject schema for rich video snippets & carousels.
 */
export function generateVideoJsonLd(video: VideoDTO, siteUrl: string = SITE_URL) {
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

/**
 * Schema.org BreadcrumbList for clean SERP navigation paths.
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
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
```

---

## 4. Next.js 15 Server-Rendered Watch Page (`app/watch/[slug]/page.tsx`)

This Server Component executes `generateMetadata` during SSR to serve complete OpenGraph, Twitter Cards, Canonical links, and Google `VideoObject` structured data before client hydration:

```tsx
import { Metadata } from "next";
import { getVideoBySlug } from "@/utility/requests";
import ViewVideo from "@/components/video/ViewVideo";
import {
  SITE_URL,
  generateVideoJsonLd,
  generateBreadcrumbSchema,
} from "@/utility/seo";

export const revalidate = 60; // Incremental Static Regeneration every 60s

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = SITE_URL;
  const canonicalUrl = `${baseUrl}/watch/${slug}`;

  try {
    const video = await getVideoBySlug(slug);
    if (video) {
      const title = video.seo?.title || video.video_title;
      const description =
        video.seo?.description ||
        video.description ||
        `Watch ${video.video_title} on BuzzClips. Adaptive HLS playback with instant discovery.`;
      const thumbnailUrl = video.thumbnail_url || `${baseUrl}/favicon.ico`;

      return {
        title: `${title} | BuzzClips`,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
          type: "video.other",
          siteName: "BuzzClips",
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
    // Graceful fallback during initial static analysis
  }

  return {
    title: "Watch Video | BuzzClips",
    alternates: { canonical: canonicalUrl },
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = SITE_URL;
  const video = await getVideoBySlug(slug).catch(() => null);

  const watchUrl = `${baseUrl}/watch/${slug}`;
  const title = video?.seo?.title || video?.video_title || "Watch Video";

  // Google VideoObject & Breadcrumbs structured data
  const jsonLdVideoObject = video ? generateVideoJsonLd(video, baseUrl) : null;
  const breadcrumbSchema = video
    ? generateBreadcrumbSchema([
        { name: "Home", url: baseUrl },
        {
          name: video.category || "Videos",
          url: `${baseUrl}/?category=${video.category || "ALL"}`,
        },
        { name: title, url: watchUrl },
      ])
    : null;

  return (
    <>
      {jsonLdVideoObject && (
        <script
          id="video-schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdVideoObject) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          id="breadcrumb-schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ViewVideo slug={slug} initialVideo={video || undefined} />
    </>
  );
}
```

---

## 5. Video Upload & Metadata Editing

### Upload Action with Category & Tags
```typescript
export const uploadVideoWithMetadata = async (
  file: File,
  title: string,
  userId: string,
  description?: string,
  tags?: string[],
  category: string = "OTHER",
  visibility: string = "PUBLIC"
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("videoTitle", title);
  formData.append("userId", userId);
  if (description) formData.append("description", description);
  if (tags && tags.length > 0) {
    tags.forEach((tag) => formData.append("tags", tag));
  }
  formData.append("category", category);
  formData.append("visibility", visibility);

  const response = await fetch(`/api/vid/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  return response.json();
};
```

### Video Metadata Update (Title, Description, Tags)
```typescript
export const updateVideoMetadata = async (
  videoId: number,
  userId: string,
  payload: VideoMetadataUpdateRequest,
  token: string
) => {
  const response = await fetch(
    `/api/vid/${videoId}?userId=${encodeURIComponent(userId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Update metadata failed: ${response.status}`);
  }

  return response.json();
};
```

---

## 6. Real-Time O(1) Video Engagement Component (`EngagementButtons.tsx`)

Redis-backed instant toggle with optimistic UI feedback:

```tsx
"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EngagementDTO } from "@/types/video";

export const EngagementButtons: React.FC<{
  videoId: number;
  initialEngagement?: EngagementDTO;
  token?: string;
}> = ({ videoId, initialEngagement, token }) => {
  const [data, setData] = useState<EngagementDTO>(
    initialEngagement || {
      videoId,
      likesCount: 0,
      dislikesCount: 0,
      userReaction: "NONE",
    }
  );

  const handleLike = async () => {
    if (!token) return toast.error("Please sign in to like this video");

    // Optimistic UI state update
    const prev = { ...data };
    setData((curr) => ({
      ...curr,
      likesCount:
        curr.userReaction === "LIKE" ? curr.likesCount - 1 : curr.likesCount + 1,
      dislikesCount:
        curr.userReaction === "DISLIKE" ? curr.dislikesCount - 1 : curr.dislikesCount,
      userReaction: curr.userReaction === "LIKE" ? "NONE" : "LIKE",
    }));

    try {
      const res = await fetch(`/api/vid/${videoId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
      else setData(prev);
    } catch {
      setData(prev);
    }
  };

  const handleDislike = async () => {
    if (!token) return toast.error("Please sign in to dislike this video");

    const prev = { ...data };
    setData((curr) => ({
      ...curr,
      dislikesCount:
        curr.userReaction === "DISLIKE"
          ? curr.dislikesCount - 1
          : curr.dislikesCount + 1,
      likesCount:
        curr.userReaction === "LIKE" ? curr.likesCount - 1 : curr.likesCount,
      userReaction: curr.userReaction === "DISLIKE" ? "NONE" : "DISLIKE",
    }));

    try {
      const res = await fetch(`/api/vid/${videoId}/dislike`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
      else setData(prev);
    } catch {
      setData(prev);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-muted/60 border border-border/50 backdrop-blur-sm rounded-full p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`gap-1.5 rounded-full px-3 h-8 text-xs font-semibold ${
            data.userReaction === "LIKE"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{data.likesCount.toLocaleString()}</span>
        </Button>
        <span className="h-4 w-px bg-border/60 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDislike}
          className={`rounded-full px-2.5 h-8 text-xs ${
            data.userReaction === "DISLIKE"
              ? "text-red-500 bg-red-500/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Link copied to clipboard!");
        }}
        className="rounded-full gap-1.5 h-10 px-4 text-xs font-medium border-border/60"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </Button>
    </div>
  );
};
```

---

## 7. Interactive Threaded Comments with Timestamp Seeking (`CommentsSection.tsx`)

Allows viewers to click video timestamps (e.g., `02:15`) inside comments to jump the player directly:

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pin, Play, MessageSquare } from "lucide-react";
import { CommentDTO } from "@/types/video";

export const CommentsSection: React.FC<{
  videoId: number;
  token?: string;
  onSeekTo?: (seconds: number) => void;
}> = ({ videoId, token, onSeekTo }) => {
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/vid/${videoId}/comments?sort=newest`);
      if (res.ok) {
        const json = await res.json();
        setComments(json.content || []);
      }
    } catch (e) {
      console.error("Failed to load comments", e);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/vid/${videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold tracking-tight">
          {comments.length} Comments
        </h3>
      </div>

      {token && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment... (Tip: include 01:23 to jump to timestamps!)"
            className="flex-1 bg-card/70 border-border/60 rounded-full px-4 h-11"
          />
          <Button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="rounded-full px-6 h-11 font-semibold"
          >
            Comment
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.commentId}
            className={`p-4 rounded-2xl border transition-colors ${
              comment.isPinned
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-border/40 bg-card/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={comment.user?.avatar_url || ""} />
                  <AvatarFallback className="text-xs">
                    {comment.user?.user_name?.slice(0, 2).toUpperCase() || "BC"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground">
                  {comment.user?.user_name}
                </span>
                {comment.isPinned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed">
              {comment.content}
              {comment.timestampInSeconds != null && onSeekTo && (
                <button
                  type="button"
                  onClick={() => onSeekTo(comment.timestampInSeconds!)}
                  className="inline-flex items-center gap-1 ml-2 text-xs font-mono font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  {Math.floor(comment.timestampInSeconds / 60)}:
                  {(comment.timestampInSeconds % 60).toString().padStart(2, "0")}
                </button>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 8. Cross-Device Resume Playback Hook (`useResumePlayback.ts`)

Automatically fetches saved watch progress upon video load and sends throttled heartbeats:

```typescript
import { useEffect, useRef } from "react";

export function useResumePlayback(
  videoId: number,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  token?: string
) {
  const lastHeartbeat = useRef(0);

  // 1. Fetch saved position on mount and seek
  useEffect(() => {
    if (!token || !videoId) return;

    fetch(`/api/vid/${videoId}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const savedSeconds = data?.progressSeconds || 0;
        if (savedSeconds > 5 && !data?.completed && videoRef.current) {
          videoRef.current.currentTime = savedSeconds;
        }
      })
      .catch(console.error);
  }, [videoId, token, videoRef]);

  // 2. Throttled heartbeat every 10 seconds during playback
  const onTimeUpdate = () => {
    if (!token || !videoRef.current) return;
    const now = Date.now();
    if (now - lastHeartbeat.current > 10000) {
      lastHeartbeat.current = now;
      const current = Math.floor(videoRef.current.currentTime);
      const duration = Math.floor(videoRef.current.duration || 0);

      fetch(`/api/vid/${videoId}/progress?seconds=${current}&duration=${duration}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  return { onTimeUpdate };
}
```

---

## 9. Robots & Video Sitemap Checklist for Googlebot-Video

- **Robots Route (`app/robots.ts`)**:
  Must explicitly declare permission for `Googlebot-Video` on `/watch/*` and expose `video-sitemap.xml`.
- **Video Sitemap (`app/video-sitemap.xml/route.ts`)**:
  Generates XML under the `http://www.google.com/schemas/sitemap-video/1.1` namespace with required tags: `<video:thumbnail_loc>`, `<video:title>`, `<video:description>`, `<video:content_loc>`, `<video:duration>`, and `<video:publication_date>`.
