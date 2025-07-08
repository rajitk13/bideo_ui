'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
    } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);

        return () => {
            hls.destroy();
        };
    } else {
        console.error('HLS is not supported in this browser');
    }
    }, [src]);


  return (
    <div className="w-full max-w-3xl mx-auto">
      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg shadow-lg"
        poster="/poster.jpg"
      />
    </div>
  );
}
