"use client";

import VideoPlayer from "@/components/VideoPlayer";
import { getVideoData } from "@/utility/getRequests";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoUploader {
  userId: string;
  user_name: string;
  user_email: string;
  avatar_url?: string | null;
}

interface VideoResponse {
  videoId: string;
  video_title: string;
  video_uploadDate: string;
  video_views: number;
  m3u8Url: string;
  video_duration: string;
  video_uploader: VideoUploader;
}

export default function ViewVideo({ id }: { id: any }) {
  const [videoResponse, setVideoResponse] = useState<VideoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchVideo() {
      try {
        const data = await getVideoData({ id });
        if (isMounted) setVideoResponse(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load video.");
      }
    }

    fetchVideo();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  const skeletonPlayer = (
    <div className="h-full w-full p-4 space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
    </div>
  );

  const skeletonDetails = (
    <div className="p-4 space-y-4">
      <Skeleton className="w-3/4 h-6 rounded-md" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-40 h-4 rounded-md" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-1/2 h-4 rounded-md" />
    </div>
  );

  const video = videoResponse;

  return (
    <div className="h-full w-full">
      <div className="flex flex-col md:flex-row h-full w-full border rounded-lg overflow-hidden">
        {/* Left (Video) */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-2 md:p-4">
          {video ? (
            <VideoPlayer src={video.m3u8Url} />
          ) : (
            skeletonPlayer
          )}
        </div>

        {/* Right (Details) */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-t md:border-t-0 md:border-l p-4 space-y-4">
          {video ? (
            <>
              <h2 className="text-lg md:text-xl font-semibold">{video.video_title}</h2>
              <div className="flex items-center gap-3">
                {video.video_uploader.avatar_url ? (
                  <Image
                    src={video.video_uploader.avatar_url}
                    alt="Uploader"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold text-white">
                    {video.video_uploader.user_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm md:text-base">
                    {video.video_uploader.user_name}
                  </p>
                  <span className="text-xs text-muted-foreground block mt-1">
                    {new Date(video.video_uploadDate)
                      .toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                      .replace(",", "")
                      .replace(/ /g, "-")
                      .replace(/-(\d{2}):/, " $1:")}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Views: {video.video_views}
              </p>
            </>
          ) : (
            skeletonDetails
          )}
        </div>
      </div>
    </div>
  );
}
