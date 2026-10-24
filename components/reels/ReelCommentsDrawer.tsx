"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CommentsSection from "@/components/video/CommentsSection";
import { MessageCircle } from "lucide-react";

interface ReelCommentsDrawerProps {
  videoId: number;
  videoTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReelCommentsDrawer({
  videoId,
  videoTitle,
  isOpen,
  onClose,
}: ReelCommentsDrawerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-md border-border/50 max-h-[80vh] overflow-y-auto w-full p-4 sm:p-6">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span>Comments</span>
          </DialogTitle>
          {videoTitle && (
            <DialogDescription className="text-xs text-muted-foreground truncate">
              {videoTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-2">
          <CommentsSection videoId={videoId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
