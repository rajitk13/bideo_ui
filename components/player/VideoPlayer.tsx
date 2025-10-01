"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("16/9");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    let player: Plyr | null = null;

    const handleMetadata = () => {
      if (video.videoWidth && video.videoHeight) {
        setAspectRatio(`${video.videoWidth}/${video.videoHeight}`);
      }
    };

    if (Hls.isSupported()) {
      hls = new Hls();
      const PROXIED_SRC = `/proxy/proxy-m3u8?url=${encodeURIComponent(src)}`;
      hls.loadSource(PROXIED_SRC);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.addEventListener("loadedmetadata", handleMetadata);
        player = new Plyr(video, {
          controls: ["play", "progress", "volume", "fullscreen"],
        });
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", handleMetadata);
      player = new Plyr(video);
    }

    return () => {
      if (hls) hls.destroy();
      if (player) player.destroy();
      video?.removeEventListener("loadedmetadata", handleMetadata);
    };
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-center w-[80%] h-[80%]"
        style={{ aspectRatio }}
      >
        <video
          ref={videoRef}
          controls
          preload="metadata"
          playsInline
          poster={poster || ""}
          crossOrigin="anonymous"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
}
