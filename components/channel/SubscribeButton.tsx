"use client";

import { useEffect, useState, useTransition } from "react";
import { BellRing, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth-context";
import { getSubscriptionStatus, toggleSubscribe, getSubscriberCount } from "@/utility/requests";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SubscribeButtonProps {
  channelId: string;
  initialSubscribed?: boolean;
  initialCount?: number;
  showCount?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function SubscribeButton({
  channelId,
  initialSubscribed = false,
  initialCount = 0,
  showCount = true,
  size = "default",
  className = "",
}: SubscribeButtonProps) {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [subscriberCount, setSubscriberCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const [isLoaded, setIsLoaded] = useState(false);

  const isSelf = user?.userId === channelId;

  // Sync state from server on mount
  useEffect(() => {
    let isCancelled = false;
    async function loadStatus() {
      try {
        if (isAuthenticated && token) {
          const res = await getSubscriptionStatus(channelId, token);
          if (!isCancelled) {
            setIsSubscribed(Boolean(res.isSubscribed ?? res.subscribed));
            setSubscriberCount(res.subscriberCount ?? 0);
            setIsLoaded(true);
          }
        } else {
          const res = await getSubscriberCount(channelId);
          if (!isCancelled) {
            setSubscriberCount(res.subscriberCount ?? 0);
            setIsLoaded(true);
          }
        }
      } catch {
        if (!isCancelled) setIsLoaded(true);
      }
    }

    if (channelId) {
      loadStatus();
    }

    return () => {
      isCancelled = true;
    };
  }, [channelId, isAuthenticated, token]);

  const handleToggle = () => {
    if (!isAuthenticated || !token) {
      toast.error("Sign in to subscribe to this channel", {
        action: {
          label: "Sign In",
          onClick: () => router.push("/auth/login"),
        },
      });
      return;
    }

    if (isSelf) {
      toast.info("You cannot subscribe to your own channel");
      return;
    }

    const previousSubscribed = isSubscribed;
    const previousCount = subscriberCount;

    // Optimistic update
    const nextSubscribed = !previousSubscribed;
    const nextCount = nextSubscribed
      ? previousCount + 1
      : Math.max(0, previousCount - 1);

    setIsSubscribed(nextSubscribed);
    setSubscriberCount(nextCount);

    startTransition(async () => {
      try {
        const res = await toggleSubscribe(channelId, token);
        const serverSubscribed = Boolean(res.isSubscribed ?? res.subscribed);
        setIsSubscribed(serverSubscribed);
        setSubscriberCount(res.subscriberCount ?? nextCount);

        if (serverSubscribed) {
          toast.success("Subscribed to channel! 🔔", {
            description: "You'll see new videos from this creator in your feed.",
          });
        } else {
          toast.info("Subscription removed");
        }
      } catch {
        // Rollback
        setIsSubscribed(previousSubscribed);
        setSubscriberCount(previousCount);
        toast.error("Failed to update subscription. Please try again.");
      }
    });
  };

  if (isSelf) {
    return null; // Don't show subscribe button to self
  }

  const formattedCount =
    subscriberCount >= 1000000
      ? `${(subscriberCount / 1000000).toFixed(1)}M`
      : subscriberCount >= 1000
      ? `${(subscriberCount / 1000).toFixed(1)}K`
      : subscriberCount.toString();

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      size={size}
      variant={isSubscribed ? "secondary" : "default"}
      className={`rounded-full font-semibold transition-all shadow-xs ${
        isSubscribed
          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50"
          : "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
      } ${className}`}
      aria-label={isSubscribed ? "Subscribed to channel" : "Subscribe to channel"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
      ) : isSubscribed ? (
        <BellRing className="w-4 h-4 mr-1.5 text-primary fill-primary/20" />
      ) : (
        <UserPlus className="w-4 h-4 mr-1.5" />
      )}
      <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
      {showCount && isLoaded && subscriberCount > 0 && (
        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-black/20 dark:bg-white/10">
          {formattedCount}
        </span>
      )}
    </Button>
  );
}
