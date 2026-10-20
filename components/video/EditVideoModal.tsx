"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  VideoDTO,
  VideoCategory,
  VideoVisibility,
  VideoMetadataUpdateRequest,
} from "@/types/video";
import { updateVideoMetadata } from "@/utility/requests";
import { useAuth } from "@/store/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Loader2, Sparkles, Tag } from "lucide-react";

const CATEGORIES: VideoCategory[] = [
  "TECH",
  "EDUCATION",
  "GAMING",
  "ENTERTAINMENT",
  "MUSIC",
  "NEWS",
  "SPORTS",
  "LIFESTYLE",
  "OTHER",
];

interface EditVideoModalProps {
  video: VideoDTO;
}

export function EditVideoModal({ video }: EditVideoModalProps) {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(video.video_title || "");
  const [description, setDescription] = useState(video.description || "");
  const [category, setCategory] = useState<VideoCategory>(
    video.category || "OTHER"
  );
  const [visibility, setVisibility] = useState<VideoVisibility>(
    video.visibility || "PUBLIC"
  );
  const [tagsInput, setTagsInput] = useState((video.tags || []).join(", "));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user?.userId) {
      toast.error("You must be logged in to edit video metadata");
      return;
    }

    if (!title.trim()) {
      toast.error("Video title cannot be empty");
      return;
    }

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const payload: VideoMetadataUpdateRequest = {
      videoTitle: title.trim(),
      description: description.trim(),
      category,
      visibility,
      tags: tagsArray,
    };

    setIsSubmitting(true);
    try {
      await updateVideoMetadata(video.videoId, user.userId, payload, token);
      toast.success("Video metadata updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["userVideos"] });
      setOpen(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update video metadata.";
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Edit video metadata"
          aria-label="Edit video"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-lg">
        <DialogHeader>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 w-fit mb-1">
            <Sparkles className="w-3 h-3" />
            Video Metadata
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Edit Video Details
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update your video title, description, SEO tags, and visibility.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Title
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {title.length}/100
              </span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              maxLength={100}
              required
              className="h-10 text-sm bg-muted/30 border-muted-foreground/15"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video (powers SEO description)..."
              rows={3}
              maxLength={2000}
              className="text-sm bg-muted/30 border-muted-foreground/15 resize-none"
            />
          </div>

          {/* Category & Visibility Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VideoCategory)}
                className="w-full h-10 px-3 rounded-md bg-muted/30 border border-muted-foreground/15 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-popover text-foreground">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Visibility
              </Label>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as VideoVisibility)
                }
                className="w-full h-10 px-3 rounded-md bg-muted/30 border border-muted-foreground/15 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              >
                <option value="PUBLIC" className="bg-popover text-foreground">
                  Public (Everyone)
                </option>
                <option value="UNLISTED" className="bg-popover text-foreground">
                  Unlisted (Direct link)
                </option>
                <option value="PRIVATE" className="bg-popover text-foreground">
                  Private (Only you)
                </option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags (Comma-separated)
              </Label>
            </div>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. springboot, nextjs, tutorial"
              className="h-10 text-sm bg-muted/30 border-muted-foreground/15"
            />
            <p className="text-[11px] text-muted-foreground">
              Used for keyword search and Schema.org video tags.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
