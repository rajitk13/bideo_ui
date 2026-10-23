"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pin, Play, MessageSquare, Send } from "lucide-react";
import { CommentDTO } from "@/types/video";
import { api_instance } from "@/global";
import { useAuth } from "@/store/auth-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CommentsSectionProps {
  videoId: number;
  onSeekTo?: (seconds: number) => void;
}

/**
 * Parses timestamp strings like "01:23" or "10:45" to seconds
 */
function parseTimestamp(timeStr: string): number {
  const parts = timeStr.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  videoId,
  onSeekTo,
}) => {
  const { token, user } = useAuth();

  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${api_instance}/vid/${videoId}/comments?sort=newest`);
      if (res.ok) {
        const json = await res.json();
        setComments(json.content || []);
      }
    } catch {
      // Fallback gracefully
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) {
      toast.error("Please sign in to post a comment");
      return;
    }

    setLoading(true);
    try {
      // Detect if comment contains timestamp e.g. 01:23
      const timestampMatch = newComment.match(/\b(\d{1,2}:\d{2})\b/);
      const timestampInSeconds = timestampMatch
        ? parseTimestamp(timestampMatch[1])
        : undefined;

      const res = await fetch(`${api_instance}/vid/${videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          timestampInSeconds,
        }),
      });

      if (res.ok) {
        setNewComment("");
        toast.success("Comment posted!");
        fetchComments();
      } else {
        toast.error("Failed to post comment");
      }
    } catch {
      toast.error("An error occurred while posting comment");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render comment text with clickable timestamps
  const renderCommentContent = (content: string) => {
    const timestampRegex = /(\b\d{1,2}:\d{2}\b)/g;
    const parts = content.split(timestampRegex);

    return parts.map((part, index) => {
      if (timestampRegex.test(part)) {
        const seconds = parseTimestamp(part);
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSeekTo?.(seconds)}
            className="inline-flex items-center gap-0.5 mx-1 px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title={`Jump to ${part}`}
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border/40">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h2>
        </div>
      </div>

      {/* Comment Input Box */}
      {token ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5 items-start">
          <Avatar className="w-9 h-9 shrink-0 ring-1 ring-border/50">
            <AvatarImage src={user?.user_name ? "" : ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {(user?.user_name || "ME").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (Tip: type 01:23 to tag a timestamp!)"
              className="bg-card/75 border-border/60 rounded-xl px-4 h-11 text-sm focus-visible:border-primary/50"
            />
            <div className="flex justify-end gap-2">
              {newComment.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewComment("")}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={loading || !newComment.trim()}
                className="rounded-full px-4 h-8 text-xs font-semibold bg-primary text-primary-foreground gap-1.5 hover:bg-primary/90"
              >
                <Send className="w-3 h-3" />
                Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-card/60 border border-border/40 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Sign in to join the conversation and leave timestamped comments.
          </p>
          <Link href="/auth/login" className="inline-block">
            <Button size="sm" variant="outline" className="rounded-full text-xs">
              Sign In to Comment
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3.5">
        {comments.map((comment) => {
          const timeAgo = comment.createdAt
            ? formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })
            : "";

          return (
            <div
              key={comment.commentId}
              className={`p-4 rounded-xl border transition-colors ${
                comment.isPinned
                  ? "border-amber-500/30 bg-amber-500/5 shadow-sm"
                  : "border-border/40 bg-card/40 hover:bg-card/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {(() => {
                    const author = comment.user;
                    const authorName =
                      author?.fullName ||
                      author?.full_name ||
                      author?.user_name ||
                      "BuzzClips User";
                    const authorHandle = author?.username
                      ? `@${author.username}`
                      : author?.user_name
                      ? `@${author.user_name}`
                      : "";
                    const channelHref = author?.username
                      ? `/channel/@${author.username}`
                      : author?.userId
                      ? `/channel/${author.userId}`
                      : undefined;

                    const avatarElem = (
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={author?.avatar_url || ""} />
                        <AvatarFallback className="text-xs bg-muted font-semibold">
                          {(authorName || "BC").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    );

                    return (
                      <>
                        {channelHref ? (
                          <Link href={channelHref} className="shrink-0">
                            {avatarElem}
                          </Link>
                        ) : (
                          avatarElem
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {channelHref ? (
                            <Link
                              href={channelHref}
                              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {authorName}
                            </Link>
                          ) : (
                            <span className="text-sm font-semibold text-foreground">
                              {authorName}
                            </span>
                          )}
                          {authorHandle && (
                            <span className="text-xs font-mono text-muted-foreground/70">
                              {authorHandle}
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                  {comment.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                  {timeAgo && (
                    <span className="text-xs text-muted-foreground">
                      {timeAgo}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-foreground/90 leading-relaxed pl-9">
                {renderCommentContent(comment.content)}
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
