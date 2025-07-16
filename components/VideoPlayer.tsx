"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    let hls: Hls | null = null;
    let player: Plyr | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.onloadedmetadata = () => {
          video.currentTime = 0;
        };
        player = new Plyr(video);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.onloadedmetadata = () => {
        video.currentTime = 0;
      };
      player = new Plyr(video);
    }

    return () => {
      if (hls) hls.destroy();
      if (player) player.destroy();
    };
  }, [src]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        controls
        className="w-full h-auto max-h-full object-contain rounded-xl shadow-lg transition-all duration-300"
        preload="metadata"
        poster=""
        playsInline
      />
    </div>
  );
}
