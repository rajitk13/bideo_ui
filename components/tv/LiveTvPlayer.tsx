"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import {
  MediaController,
  MediaControlBar,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaPipButton,
} from "media-chrome/react";
import { LiveChannel } from "@/constants/liveChannels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Share2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface LiveTvPlayerProps {
  channel: LiveChannel;
}

export function LiveTvPlayer({ channel }: LiveTvPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset error state when channel switches
  useEffect(() => {
    setHasError(false);
    setIsPlaying(true);
  }, [channel.id]);

  const handleShare = async () => {
    const url = `${window.location.origin}/tv?channel=${channel.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${channel.name} Live Stream - BuzzClips India`,
          text: `Watch ${channel.name} (${channel.hindiName}) live free on BuzzClips!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("Live stream link copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const proxySrc = `/proxy/proxy-m3u8?url=${encodeURIComponent(channel.streamUrl)}`;

  return (
    <div className="space-y-4">
      {/* 16:9 Live Video Player Shell */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video ring-1 ring-border/50 shadow-2xl shadow-black/40 group">
        {/* Floating Top Overlays */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-none">
          {/* Flashing 🔴 LIVE badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/90 text-white shadow-lg shadow-red-600/30 backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white inline-block animate-ping" />
            <span>LIVE</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white border border-white/10 backdrop-blur-md">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>HD Broadcast</span>
          </div>
        </div>

        {/* Video stream via proxy */}
        {!hasError ? (
          <MediaController
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <ReactPlayer
              ref={playerRef}
              slot="media"
              src={proxySrc}
              playing={isPlaying}
              muted={false}
              controls={false}
              pip={true}
              width="100%"
              height="100%"
              onError={() => setHasError(true)}
            />

            {/* Custom Bottom Control Bar */}
            <MediaControlBar>
              <MediaPlayButton />
              <MediaMuteButton />
              <MediaVolumeRange />
              <MediaTimeDisplay showDuration={false} />
              <div className="flex-1" />
              <MediaPipButton />
              <MediaFullscreenButton />
            </MediaControlBar>
          </MediaController>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-zinc-950">
            <AlertCircle className="w-8 h-8 text-amber-500 animate-bounce" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Live Broadcast Connecting...</p>
              <p className="text-xs text-zinc-400 max-w-sm">
                Establishing low-latency connection to {channel.name}.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setHasError(false);
                setIsPlaying(true);
              }}
              className="text-xs h-7"
            >
              Retry Stream
            </Button>
          </div>
        )}
      </div>

      {/* Channel Metadata Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card/75 border border-border/40 backdrop-blur-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {channel.name}
            </h1>
            <span className="text-sm font-semibold text-primary font-mono">
              ({channel.hindiName})
            </span>
            <Badge variant="outline" className="text-[11px] font-medium uppercase tracking-wide bg-primary/10 text-primary border-primary/20">
              {channel.category}
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              {channel.broadcaster}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {channel.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="gap-1.5 text-xs h-8 rounded-full bg-muted/40 hover:bg-muted border-border/50"
            title="Share Live TV Channel"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
