"use client";

import VideoPlayer from '@/components/VideoPlayer';
import { getVideoData } from "@/utility/getRequests";
import { useEffect, useState } from "react";

export default function ViewVideo({ id }: { id: any }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const url = await getVideoData({ id: id }); 
        setVideoUrl(url);
      } catch (err: any) {
        setError(err.message || "Failed to load video.");
      }
    }

    fetchVideo();
  }, [id]);

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!videoUrl) {
    return <div className="p-4">Loading video...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Video ID: {id}</h2>
        <VideoPlayer src={videoUrl} /> 
    </div>
  );
}
