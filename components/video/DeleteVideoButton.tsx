"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MESSAGES } from "@/constants/messages";
import { deleteVideo } from "@/utility/requests";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAuth } from "@/store/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteVideoButton({ videoId }: { videoId: number }) {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!user?.userId) {
      toast.error(MESSAGES.DELETED_ERROR);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteVideo(user.userId, videoId, token as string);
      toast.success(MESSAGES.DELETED_SUCCESS);
      // Invalidate userVideos query so the table immediately updates
      queryClient.invalidateQueries({ queryKey: ["userVideos"] });
      setOpen(false);
    } catch (error) {
      console.error("Delete video failed:", error);
      toast.error(MESSAGES.DELETED_ERROR);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete video"
          aria-label="Delete video"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Delete video?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            This action cannot be undone. This video and all its associated data
            will be permanently removed from your channel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete Video"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
