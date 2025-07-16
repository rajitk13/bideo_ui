"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchVideos } from "@/utility/getRequests";

type UserDTO = {
  userId: string;
  user_name: string;
  user_email: string;
  avatar_url: string;
};

type Video = {
  videoId: number;
  video_title: string;
  video_uploadDate: string;
  video_views: number;
  m3u8Url: string;
  video_uploader: UserDTO;
  video_duration: string;
  thumbnail_url: string;
};

export default function ExplorePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadVideos = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetchVideos(page);
      if (res.content.length < 10) setHasMore(false);
      setVideos((prev) => {
        const allVideos = [...prev, ...res.content];
        const uniqueMap = new Map<number, Video>();
        allVideos.forEach((video) => uniqueMap.set(video.videoId, video));
        return Array.from(uniqueMap.values());
      });
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  useEffect(() => {
    loadVideos();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoading]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-7xl px-4 py-4 space-y-6">
        <h1 className="text-2xl font-bold px-2">Explore Videos</h1>

        <div className="grid gap-y-10 gap-x-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {videos.length === 0 && isLoading
            ? // Skeletons for first load
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-video rounded-xl" />
              ))
            : // Render videos
              videos.map((video) => (
                <VideoCard key={video.videoId} video={video} />
              ))}

          {/* Skeletons for infinite scroll */}
          {videos.length > 0 &&
            isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={`loading-${i}`}
                className="w-full aspect-video rounded-xl"
              />
            ))}
        </div>

        <div ref={observerRef} className="h-1" />

        {!hasMore && videos.length > 0 && (
          <p className="text-center text-muted-foreground py-6">
            You’ve reached the end.
          </p>
        )}
      </div>
    </div>
  );
}
