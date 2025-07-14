"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import VideoPlayer from '@/components/VideoPlayer';
import { getVideoData } from "@/utility/getRequests";
import { useEffect, useState } from "react";

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
    async function fetchVideo() {
      try {
        const data = await getVideoData({ id }); 
        setVideoResponse(data);
      } catch (err: any) {
        setError(err.message || "Failed to load video.");
      }
    }

    fetchVideo();
  }, [id]);

  if (error) {
    return <div className="text-red-600 p-1">{error}</div>;
  }

  if (!videoResponse) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  const {
    video_title,
    video_views,
    video_uploadDate,
    m3u8Url,
    video_uploader,
  } = videoResponse;

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={70} minSize={35} maxSize={85}>
        <div className="h-full w-full p-4">
          <VideoPlayer src={m3u8Url} />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={30}>
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">{video_title}</h2>
          <div className="flex items-center gap-3">
            {video_uploader.avatar_url ? (
              <img
                src={video_uploader.avatar_url}
                alt="Uploader"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold text-white">
                {video_uploader.user_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{video_uploader.user_name}</p>
              <span className="text-sm text-muted-foreground">
                {new Date(video_uploadDate).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }).replace(',', '').replace(/ /g, '-').replace(/-(\d{2}):/, ' $1:')}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Views: {video_views}
          </p>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
