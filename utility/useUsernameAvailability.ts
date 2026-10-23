import { useState, useEffect, useRef } from "react";
import { api_instance } from "@/global";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export const RESERVED_HANDLES = new Set([
  "admin",
  "administrator",
  "root",
  "system",
  "support",
  "help",
  "buzzclips",
  "bideo",
  "api",
  "auth",
  "login",
  "logout",
  "signup",
  "explore",
  "trending",
  "subscriptions",
  "playlists",
  "feed",
  "channel",
  "video",
  "videos",
  "embed",
  "settings",
  "profile",
  "null",
  "undefined",
  "anonymous",
  "moderator",
]);

export function cleanHandle(input?: string | null): string {
  if (!input) return "";
  let s = input.trim();
  if (s.startsWith("@")) s = s.substring(1).trim();
  return s;
}

export type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid";

export function useUsernameAvailability(initialValue = "", debounceMs = 300) {
  const [username, setUsername] = useState(initialValue);
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handle = cleanHandle(username);

    if (!handle) {
      setStatus("idle");
      setMessage("");
      return;
    }

    // 1. Instant local validation
    if (handle.length < 3 || handle.length > 30) {
      setStatus("invalid");
      setMessage("Handle must be 3-30 characters");
      return;
    }

    if (!USERNAME_REGEX.test(handle)) {
      setStatus("invalid");
      setMessage("Letters, numbers, and underscores only");
      return;
    }

    if (RESERVED_HANDLES.has(handle.toLowerCase())) {
      setStatus("invalid");
      setMessage(`@${handle} is reserved`);
      return;
    }

    // 2. Debounced Bloom Filter verification
    setStatus("checking");
    setMessage("Checking availability...");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${api_instance}/app/check-username?username=${encodeURIComponent(
            handle
          )}`
        );
        if (!res.ok) {
          setStatus("idle");
          setMessage("Could not verify handle");
          return;
        }

        const data = await res.json();

        if (!data.valid) {
          setStatus("invalid");
          setMessage("Invalid handle format");
        } else if (data.available) {
          setStatus("available");
          setMessage(`@${handle} is available!`);
        } else {
          setStatus("taken");
          setMessage(`@${handle} is already taken`);
        }
      } catch {
        setStatus("idle");
        setMessage("Could not verify username");
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [username, debounceMs]);

  return {
    username,
    setUsername,
    status,
    message,
    isAvailable: status === "available",
    isChecking: status === "checking",
    isValid: status !== "invalid",
  };
}
