const envUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

// Strictly reject and sanitize legacy domain bideo.rajit.cc if lingering in cached environments
const sanitizedApiUrl =
  envUrl && !envUrl.includes("bideo.rajit.cc")
    ? envUrl
    : "https://buzzclips.app/api";

export const api_instance = sanitizedApiUrl;
