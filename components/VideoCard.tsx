"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical } from "lucide-react";

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
  const timeAgo = formatDistanceToNow(new Date(video.video_uploadDate), {
    addSuffix: true,
  });

  const formattedViews =
    video.video_views > 100000
      ? `${(video.video_views / 100000).toFixed(1)} lakh views`
      : `${video.video_views.toLocaleString()} views`;

  return (
    <Link href={`/video/${video.videoId}/view`}>
      <div className="w-full max-w-sm cursor-pointer space-y-2">
        {/* Thumbnail with duration badge */}
        <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
          <video
            src={video.m3u8Url}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
            poster={video.thumbnail_url}
          />
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {video.video_duration}
          </span>
        </div>

        {/* Uploader info */}
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage
              src={video.video_uploader?.avatar_url || ""}
              alt={video.video_uploader.user_name || "User"}
            />
            <AvatarFallback>
              {video.video_uploader.user_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="text-sm font-semibold line-clamp-2">
              {video.video_title}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {video.video_uploader.user_name}
            </p>
            <p className="text-muted-foreground text-xs">
              {formattedViews} • {timeAgo}
            </p>
          </div>

          <MoreVertical className="text-muted-foreground w-4 h-4 mt-1" />
        </div>
      </div>
    </Link>
  );
}
