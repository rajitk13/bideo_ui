"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVideos } from "@/utility/requests";
import VideoCard from "@/components/video/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { InfiniteData } from "@tanstack/react-query";
import { MESSAGES } from "@/constants/messages";

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
  videoStatus: "PENDING" | "PROCESSING" | "COMPLETED" | string;
};

type PaginatedVideoResponse = {
  content: Video[];
  number: number;
  last: boolean;
};

export default function ExplorePage() {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<
    PaginatedVideoResponse,
    Error,
    InfiniteData<PaginatedVideoResponse>,
    ["videos"],
    number
  >({
    queryKey: ["videos"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchVideos(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 60 * 1000,
    retry: 1,
  });
  // Preserve order and deduplicate
  const videoMap = new Set<number>();
  const videoList: Video[] = [];

  data?.pages.forEach((page) => {
    page.content.forEach((video) => {
      if (video.videoStatus === "COMPLETED" && !videoMap.has(video.videoId)) {
        videoList.push(video);
        videoMap.add(video.videoId);
      }
    });
  });

  // Toast on error
  useEffect(() => {
    if (error) toast.error(MESSAGES.EXPLORE_VIDEO_ERROR);
  }, [error]);

  // Infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full lg:max-w-[80%] sm:max-w-full px-4 py-4 space-y-6">
        <h1 className="text-2xl font-bold px-2">Explore Videos</h1>

        <div className="grid gap-y-10 gap-x-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-around sm:w-full">
          {isLoading && videoList.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-video rounded-xl" />
              ))
            : videoList.map((video) => (
                <VideoCard key={video.videoId} video={video} />
              ))}

          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={`loading-${i}`}
                className="w-full aspect-video rounded-xl"
              />
            ))}
        </div>

        <div ref={observerRef} className="h-1" />

        {!hasNextPage && videoList.length > 0 && (
          <p className="text-center text-muted-foreground py-6">
            {MESSAGES.END_OF_VIDEO_LIST}
          </p>
        )}
      </div>
    </div>
  );
}
