"use client";

import React, { useRef, useState } from "react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { LiveChannel } from "@/constants/liveChannels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface LiveTvPlayerProps {
  channel: LiveChannel;
}

export function LiveTvPlayer({ channel }: LiveTvPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* 16:9 Class-Leading Live Player */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video ring-1 ring-border/50 shadow-2xl shadow-black/40 group">
        <VideoPlayer
          key={channel.id}
          ref={playerRef}
          src={channel.streamUrl}
          poster={channel.logo}
          isLive={true}
        />
      </div>

      {/* Channel Metadata Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card/75 border border-border/40 backdrop-blur-sm shadow-sm">
        <div className="space-y-1.5 min-w-0">
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
              Live 24x7
            </span>
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
export default LiveTvPlayer;
