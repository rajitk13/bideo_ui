"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Play, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

type VideoCardProps = {
  video: {
    videoId: number;
    video_title: string;
    video_uploadDate: string;
    video_views: number;
    m3u8Url: string;
    video_duration: string;
    thumbnail_url: string;
    video_uploader: {
      userId: string;
      user_name: string;
      user_email: string;
      avatar_url: string;
    };
  };
};

export default function VideoCard({ video }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const timeAgo = formatDistanceToNow(new Date(video.video_uploadDate), {
    addSuffix: true,
  });

  const formattedViews =
    video.video_views > 100000
      ? `${(video.video_views / 100000).toFixed(1)}L`
      : video.video_views > 1000
        ? `${(video.video_views / 1000).toFixed(1)}K`
        : `${video.video_views.toLocaleString()}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const videoUrl = `${window.location.origin}/video/${video.videoId}/view`;
    try {
      await navigator.clipboard.writeText(videoUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error(err);
    }
  };

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="group w-full max-w-sm"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail with hover preview */}
      <Link href={`/video/${video.videoId}/view`} className="block">
        <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
          {/* Poster/Thumbnail */}
          <video
            ref={videoRef}
            src={video.m3u8Url}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            playsInline
            preload="metadata"
            poster={video.thumbnail_url}
            loop
          />

          {/* Hover overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play icon on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md transition-all duration-300 group-hover:bottom-3 group-hover:right-3">
            <Clock className="w-3 h-3" />
            {video.video_duration}
          </div>

          {/* Share button (appears on hover) */}
          <button
            onClick={handleShare}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 scale-75 group-hover:scale-100"
            aria-label="Share video"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </Link>

      {/* Video info */}
      <div className="flex items-start gap-3 mt-3">
        <Link href={`/profile/${video.video_uploader.userId}`} className="shrink-0">
          <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/20">
            <AvatarImage
              src={video.video_uploader?.avatar_url || ""}
              alt={video.video_uploader.user_name || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
              {video.video_uploader.user_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/video/${video.videoId}/view`}>
            <h3 className="text-sm font-semibold line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
              {video.video_title}
            </h3>
          </Link>
          <p className="text-muted-foreground text-xs mt-1 truncate hover:text-foreground transition-colors duration-200">
            {video.video_uploader.user_name}
          </p>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-0.5">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formattedViews} views
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
