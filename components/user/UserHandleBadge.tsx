import React from "react";
import Link from "next/link";
import { UserDTO } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";

export interface UserHandleBadgeProps {
  user?: UserDTO | null;
  size?: "sm" | "md" | "lg";
  showAvatar?: boolean;
  linkToChannel?: boolean;
  className?: string;
}

export const UserHandleBadge: React.FC<UserHandleBadgeProps> = ({
  user,
  size = "md",
  showAvatar = true,
  linkToChannel = true,
  className,
}) => {
  if (!user) {
    return <span className="text-muted-foreground text-xs font-medium">Anonymous</span>;
  }

  const displayName = user.fullName || user.user_name || "Creator";
  const handle = user.username
    ? `@${user.username}`
    : user.user_name
    ? `@${user.user_name}`
    : "";

  const channelHref = user.username
    ? `/channel/@${user.username}`
    : user.userId
    ? `/channel/${user.userId}`
    : "#";

  const avatarSizeClass =
    size === "sm" ? "h-6 w-6" : size === "lg" ? "h-11 w-11" : "h-8 w-8";
  const textSizeClass =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base font-bold" : "text-sm font-semibold";
  const handleSizeClass =
    size === "sm" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-[11px]";

  const content = (
    <div
      className={clsx(
        "inline-flex items-center gap-2 group transition-colors",
        className
      )}
    >
      {showAvatar && (
        <Avatar
          className={clsx(
            avatarSizeClass,
            "ring-1 ring-border/50 group-hover:ring-primary/40 transition-all shrink-0"
          )}
        >
          <AvatarImage
            src={user.avatar_url || "https://buzzclips.app/default-thumbnail.jpg"}
            alt={displayName}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-xs">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col min-w-0">
        <span
          className={clsx(
            textSizeClass,
            "text-foreground group-hover:text-primary transition-colors truncate leading-tight"
          )}
        >
          {displayName}
        </span>
        {handle && (
          <span
            className={clsx(
              handleSizeClass,
              "text-muted-foreground/75 font-mono group-hover:text-muted-foreground transition-colors truncate leading-tight"
            )}
          >
            {handle}
          </span>
        )}
      </div>
    </div>
  );

  if (linkToChannel && channelHref !== "#") {
    return (
      <Link href={channelHref} className="inline-block hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
};

export default UserHandleBadge;
