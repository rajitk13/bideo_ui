"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/store/auth-context";
import {
  fetchPlaylistDetails,
  removeVideoFromPlaylist,
  PlaylistDetailDTO,
} from "@/utility/requests";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ListMusic,
  Play,
  Trash2,
  ArrowLeft,
  Loader2,
  Lock,
  Globe,
  Film,
} from "lucide-react";

export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params?.id as string;
  const { token, user } = useAuth();

  const [playlist, setPlaylist] = useState<PlaylistDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!playlistId) return;

    let isMounted = true;
    setLoading(true);

    fetchPlaylistDetails(playlistId, token || undefined)
      .then((data) => {
        if (!isMounted) return;
        setPlaylist(data);
      })
      .catch((err) => {
        console.error("Failed to load playlist", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [playlistId, token]);

  const handleRemoveVideo = (videoId: number) => {
    if (!token || !playlist) return;

    // Optimistic remove
    setPlaylist((prev) =>
      prev
        ? {
            ...prev,
            videos: prev.videos.filter((v) => v.videoId !== videoId),
            videoCount: Math.max(0, (prev.videoCount ?? 1) - 1),
          }
        : null
    );

    startTransition(async () => {
      try {
        await removeVideoFromPlaylist(Number(playlistId), videoId, token);
        toast.success("Video removed from playlist");
      } catch {
        toast.error("Failed to remove video. Please refresh.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="w-full flex justify-center py-12 px-4">
        <Card className="border border-border/50 max-w-md w-full text-center p-8 space-y-4">
          <ListMusic className="w-10 h-10 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">Playlist Not Found</h2>
          <p className="text-sm text-muted-foreground">
            This playlist does not exist or may be set to private.
          </p>
          <Link href="/playlists">
            <Button variant="outline">Back to Playlists</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isOwner = user?.userId === playlist.userId;
  const firstVideo = playlist.videos && playlist.videos.length > 0 ? playlist.videos[0] : null;
  const firstVideoHref = firstVideo
    ? firstVideo.slug
      ? `/watch/${firstVideo.slug}`
      : `/watch/${firstVideo.videoId}`
    : "#";

  return (
    <div className="w-full flex justify-center py-6 sm:py-10 px-4">
      <div className="w-full lg:max-w-[85%] sm:max-w-full space-y-6">
        {/* Navigation */}
        <div>
          <Link
            href="/playlists"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to All Playlists
          </Link>
        </div>

        {/* Playlist Hero Banner */}
        <div className="flex flex-col md:flex-row items-start gap-6 p-6 sm:p-8 rounded-2xl bg-card/85 border border-border/50 backdrop-blur-md">
          {/* Cover Art */}
          <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30 flex items-center justify-center shrink-0 border border-border/40 shadow-md">
            {firstVideo?.thumbnail_url ? (
              <Image
                src={firstVideo.thumbnail_url}
                alt={playlist.title}
                fill
                className="object-cover"
              />
            ) : (
              <ListMusic className="w-12 h-12 text-primary opacity-80" />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/70 text-white backdrop-blur-xs">
                {playlist.videos?.length ?? 0} Videos
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {playlist.title}
              </h1>
              {playlist.visibility === "PRIVATE" ? (
                <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  Public
                </Badge>
              )}
            </div>

            {playlist.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {playlist.description}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              {firstVideo && (
                <Link href={firstVideoHref}>
                  <Button className="gap-2 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-blue-500/20">
                    <Play className="w-4 h-4 fill-white" />
                    Play All
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            Tracks in Playlist
          </h2>

          {!playlist.videos || playlist.videos.length === 0 ? (
            <Card className="p-10 text-center space-y-3 border-dashed border-border/60">
              <ListMusic className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
              <p className="text-sm text-muted-foreground">
                No videos in this playlist yet. Browse videos and click &ldquo;Save&rdquo; to add them here!
              </p>
              <Link href="/">
                <Button size="sm" variant="outline">
                  Explore Videos
                </Button>
              </Link>
            </Card>
          ) : (
            playlist.videos.map((video, idx) => {
              const videoHref = video.slug ? `/watch/${video.slug}` : `/watch/${video.videoId}`;

              return (
                <div
                  key={video.videoId}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-card/60 border border-border/30 hover:border-border/70 transition-all group"
                >
                  <Link href={videoHref} className="flex items-center gap-3.5 flex-1 min-w-0">
                    <span className="text-xs font-mono font-bold text-muted-foreground w-6 text-center shrink-0">
                      #{idx + 1}
                    </span>

                    <div className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden bg-muted shrink-0">
                      {video.thumbnail_url ? (
                        <Image
                          src={video.thumbnail_url}
                          alt={video.video_title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      {video.video_duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 rounded">
                          {video.video_duration}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {video.video_title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {video.video_uploader?.user_name || "Creator"}
                      </p>
                    </div>
                  </Link>

                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVideo(video.videoId)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
