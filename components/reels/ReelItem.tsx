"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { VideoDTO } from "@/types/video";
import { ReelActionRail } from "./ReelActionRail";
import { ReelBottomOverlay } from "./ReelBottomOverlay";
import { ReelCommentsDrawer } from "./ReelCommentsDrawer";
import { SaveToPlaylistModal } from "@/components/video/SaveToPlaylistModal";
import { Play, Pause, Heart } from "lucide-react";

interface ReelItemProps {
  video: VideoDTO;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function ReelItem({ video, isActive, isMuted, onToggleMute }: ReelItemProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  // Modals state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  // Sync play/pause with isActive
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setProgressPercent(0);
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
      }
    }
  }, [isActive]);

  const handleProgress = (state: any) => {
    if (state && typeof state.played === "number") {
      setProgressPercent(state.played * 100);
    } else if (state && state.target && state.target.currentTime && state.target.duration) {
      setProgressPercent((state.target.currentTime / state.target.duration) * 100);
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap -> Like heart burst
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    } else {
      // Single tap -> Play / Pause
      const nextPlay = !isPlaying;
      setIsPlaying(nextPlay);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    }
    setLastTap(now);
  };

  const videoSrc = video.m3u8Url
    ? `/proxy/proxy-m3u8?url=${encodeURIComponent(video.m3u8Url)}`
    : "";

  return (
    <div
      onClick={handleTap}
      className="relative w-full h-full bg-black select-none flex items-center justify-center overflow-hidden cursor-pointer"
    >
      {/* 9:16 Video Player */}
      {videoSrc ? (
        <div className="w-full h-full flex items-center justify-center relative pointer-events-none">
          <ReactPlayer
            ref={playerRef}
            src={videoSrc}
            playing={isPlaying && isActive}
            muted={isMuted}
            loop={true}
            playsInline={true}
            width="100%"
            height="100%"
            onProgress={handleProgress as any}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              objectFit: "cover",
            }}
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs">
          Loading clip...
        </div>
      )}

      {/* Play/Pause Central Tap Indicator */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-2xl animate-out fade-out zoom-out duration-300">
            {isPlaying ? (
              <Play className="w-8 h-8 fill-white ml-1" />
            ) : (
              <Pause className="w-8 h-8 fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Double Tap Heart Burst Animation */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart className="w-24 h-24 fill-red-500 text-red-500 drop-shadow-2xl animate-ping duration-500" />
        </div>
      )}

      {/* Right Side Action Rail */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-3 sm:right-4 bottom-20 z-30"
      >
        <ReelActionRail
          video={video}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onOpenComments={() => setCommentsOpen(true)}
          onOpenSaveModal={() => setSaveModalOpen(true)}
        />
      </div>

      {/* Bottom Info Overlay */}
      <div onClick={(e) => e.stopPropagation()}>
        <ReelBottomOverlay video={video} progressPercent={progressPercent} />
      </div>

      {/* Slide-Up Comments Drawer */}
      <div onClick={(e) => e.stopPropagation()}>
        <ReelCommentsDrawer
          videoId={video.videoId}
          videoTitle={video.video_title}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      </div>

      {/* Save to Playlist Modal */}
      <div onClick={(e) => e.stopPropagation()}>
        <SaveToPlaylistModal
          videoId={video.videoId}
          videoTitle={video.video_title}
          isOpen={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
        />
      </div>
    </div>
  );
}
