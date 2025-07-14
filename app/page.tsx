"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      await fetchVideos(page).then((res) => {
        if (res.content.length < 10) setHasMore(false);
        setVideos((prev) => [...prev, ...res.content]);
      });
    })();
    setIsLoading(false);
  }, [page]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-7xl px-4 py-4 space-y-6">
        <h1 className="text-2xl font-bold px-2">Explore Videos</h1>

        <div className="grid gap-y-10 gap-x-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.videoId} video={video} />
          ))}

          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-video rounded-xl" />
            ))}
        </div>

        {hasMore && !isLoading && (
          <div className="flex justify-center pt-4">
            <Button onClick={() => setPage((prev) => prev + 1)}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
