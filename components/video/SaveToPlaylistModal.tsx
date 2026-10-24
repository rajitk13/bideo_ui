"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchMyPlaylists,
  createPlaylist,
  addVideoToPlaylist,
  toggleWatchLater,
  PlaylistDTO,
} from "@/utility/requests";
import { useAuth } from "@/store/auth-context";
import { toast } from "sonner";
import { Clock, Plus, Check, Loader2, ListPlus, Lock, Globe } from "lucide-react";
import Link from "next/link";

interface SaveToPlaylistModalProps {
  videoId: number;
  videoTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SaveToPlaylistModal({
  videoId,
  videoTitle,
  isOpen,
  onClose,
}: SaveToPlaylistModalProps) {
  const { token, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWatchLaterAdded, setIsWatchLaterAdded] = useState(false);
  const [watchLaterLoading, setWatchLaterLoading] = useState(false);

  // New playlist state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVisibility, setNewVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [createLoading, setCreateLoading] = useState(false);
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;
    setLoading(true);

    fetchMyPlaylists(token)
      .then((data) => {
        if (!isMounted) return;
        setPlaylists(data || []);
      })
      .catch(() => {
        // Fallback
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, token]);

  const handleToggleWatchLater = async () => {
    if (!token) return;
    setWatchLaterLoading(true);
    try {
      await toggleWatchLater(videoId, token);
      setIsWatchLaterAdded(!isWatchLaterAdded);
      toast.success(
        !isWatchLaterAdded ? "Saved to Watch Later" : "Removed from Watch Later"
      );
    } catch {
      toast.error("Failed to update Watch Later");
    } finally {
      setWatchLaterLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!token) return;
    try {
      await addVideoToPlaylist(playlistId, videoId, token);
      setAddedMap((prev) => ({ ...prev, [playlistId]: true }));
      toast.success("Added to playlist!");
    } catch {
      toast.error("Failed to add video to playlist");
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !token) return;

    setCreateLoading(true);
    try {
      const created = await createPlaylist(
        {
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          visibility: newVisibility,
        },
        token
      );

      // Automatically add this video to the newly created playlist
      await addVideoToPlaylist(created.playlistId, videoId, token);

      setPlaylists((prev) => [created, ...prev]);
      setAddedMap((prev) => ({ ...prev, [created.playlistId]: true }));
      setNewTitle("");
      setNewDesc("");
      setIsCreating(false);
      toast.success(`Created "${created.title}" and saved video!`);
    } catch {
      toast.error("Failed to create playlist");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border/50 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg min-w-0">
            <ListPlus className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">Save video to...</span>
          </DialogTitle>
          <DialogDescription className="truncate text-xs text-muted-foreground">
            {videoTitle || `Video #${videoId}`}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in to save videos to your playlists and Watch Later list.
            </p>
            <Link href="/auth/login" onClick={onClose}>
              <Button className="w-full">Sign In to Save</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Quick Watch Later button */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Watch Later</p>
                  <p className="text-xs text-muted-foreground truncate">Quick private queue</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={isWatchLaterAdded ? "secondary" : "outline"}
                disabled={watchLaterLoading}
                onClick={handleToggleWatchLater}
                className="gap-1.5"
              >
                {watchLaterLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isWatchLaterAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Saved
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Save
                  </>
                )}
              </Button>
            </div>

            {/* Existing Playlists */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Playlists
              </p>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : playlists.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">
                  You haven&apos;t created any custom playlists yet.
                </p>
              ) : (
                playlists.map((pl) => {
                  const isAdded = addedMap[pl.playlistId];
                  return (
                    <div
                      key={pl.playlistId}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-card border border-border/30 hover:border-border/60 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {pl.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          {pl.visibility === "PRIVATE" ? (
                            <Lock className="w-3 h-3 shrink-0" />
                          ) : (
                            <Globe className="w-3 h-3 shrink-0" />
                          )}
                          <span className="truncate">{pl.videoCount ?? 0} videos</span>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={isAdded ? "secondary" : "ghost"}
                        onClick={() => handleAddToPlaylist(pl.playlistId)}
                        disabled={isAdded}
                        className="text-xs h-7 px-2.5"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Create New Playlist Accordion */}
            {!isCreating ? (
              <Button
                variant="outline"
                className="w-full justify-center gap-1.5 text-xs font-semibold"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="w-4 h-4" />
                Create New Playlist
              </Button>
            ) : (
              <form onSubmit={handleCreateNew} className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <p className="text-xs font-semibold text-foreground">New Playlist</p>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Playlist title (e.g. Favorite Coding Beats)"
                  maxLength={100}
                  required
                  className="h-8 text-xs bg-background"
                />
                <Textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  maxLength={300}
                  className="text-xs bg-background resize-none"
                />
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <select
                    value={newVisibility}
                    onChange={(e) => setNewVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                    className="text-xs bg-background border border-border/50 rounded-md px-2 py-1 text-foreground"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>

                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCreating(false)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={createLoading || !newTitle.trim()}
                      className="text-xs h-7"
                    >
                      {createLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create & Save"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
