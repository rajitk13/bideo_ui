"use client";

import { useEffect, useRef } from "react";
import { api_instance } from "@/global";

interface UseResumePlaybackProps {
  videoId?: number;
  playerRef: React.RefObject<any>;
  token?: string;
}

export function useResumePlayback({
  videoId,
  playerRef,
  token,
}: UseResumePlaybackProps) {
  const lastHeartbeat = useRef(0);
  const initialSeekDone = useRef(false);

  // 1. Fetch saved position on mount and seek
  useEffect(() => {
    if (!token || !videoId) return;

    let isMounted = true;
    initialSeekDone.current = false;

    fetch(`${api_instance}/vid/${videoId}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const savedSeconds = data?.progressSeconds || 0;
        if (savedSeconds > 5 && !data?.completed && !initialSeekDone.current) {
          initialSeekDone.current = true;
          // ReactPlayer seekTo
          if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(savedSeconds, "seconds");
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [videoId, token, playerRef]);

  // 2. Throttled heartbeat during playback (called from onProgress / onTimeUpdate)
  const onTimeUpdate = () => {
    if (!token || !videoId || !playerRef.current) return;
    const now = Date.now();

    // Send heartbeat every 10 seconds
    if (now - lastHeartbeat.current > 10000) {
      lastHeartbeat.current = now;

      let currentSeconds = 0;
      let durationSeconds = 0;

      if (typeof playerRef.current.getCurrentTime === "function") {
        currentSeconds = Math.floor(playerRef.current.getCurrentTime());
      }
      if (typeof playerRef.current.getDuration === "function") {
        durationSeconds = Math.floor(playerRef.current.getDuration());
      }

      if (currentSeconds > 0) {
        fetch(
          `${api_instance}/vid/${videoId}/progress?seconds=${currentSeconds}&duration=${durationSeconds}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => {});
      }
    }
  };

  return { onTimeUpdate };
}

export default useResumePlayback;
