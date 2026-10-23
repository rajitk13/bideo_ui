import { api_instance } from "@/global";
import {
  VideoDTO,
  UserDTO,
  UsernameCheckResult,
  VideoMetadataUpdateRequest,
  PaginatedVideoResponse,
  VideoCategory,
  PageResponse,
} from "@/types/video";

export * from "@/types/video";

export interface LoginPayload {
  email?: string;
  identifier?: string;
  password: string;
}

export interface LoginResponse {
  idToken?: string;
  refreshToken?: string;
  uid?: string;
}

export interface createUserPayload {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  user_name?: string;
  avatar_url: string;
}

export interface VideoPageProps {
  id: string;
}

export interface VideoUploader {
  userId: string;
  user_name: string;
  user_email: string;
  avatar_url: string | null;
}

// Kept for backward-compatibility with existing components
export type VideoResponse = VideoDTO;

export interface User {
  userId: string;
  user_email: string;
  user_name: string;
  avatar_url: string;
  username?: string;
  fullName?: string;
  full_name?: string;
  user_role?: string;
}

export interface UploadVideo {
  videoTitle: string;
  file: File;
  userId: string;
}

export const checkUsernameAvailability = async (
  username: string
): Promise<UsernameCheckResult> => {
  const res = await fetch(
    `${api_instance}/app/check-username?username=${encodeURIComponent(username)}`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Username check failed with status ${res.status}: ${text}`);
  }
  return res.json();
};

export const searchUsers = async (
  query: string,
  limit = 10
): Promise<UserDTO[]> => {
  try {
    const res = await fetch(
      `${api_instance}/user/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};

export const verifyToken = async (idToken: string): Promise<{ id: string }> => {
  const res = await fetch(`${api_instance}/app/verifyToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: idToken,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token verification failed: ${error}`);
  }

  return res.json(); // { id: 'uid123' }
};

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const ident = payload.identifier || payload.email || "";
  const formData = new FormData();
  formData.append("email", ident);
  formData.append("username", ident);
  formData.append("identifier", ident);
  formData.append("user_name", ident);
  formData.append("password", payload.password);

  const res = await fetch(`${api_instance}/app/login`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed with status ${res.status}: ${text}`);
  }

  const result: LoginResponse = await res.json();
  const uid = await verifyToken(result.idToken || "");

  await fetch("/ui/auth/setSession", {
    method: "POST",
    body: JSON.stringify({
      token: result.idToken,
      uid: uid.id,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    idToken: result.idToken,
    refreshToken: result.refreshToken,
    uid: uid.id,
  };
};

export const createUser = async (
  payload: createUserPayload
): Promise<string> => {
  const handle = payload.username || payload.user_name || "";
  const fullName = payload.fullName || payload.user_name || handle;

  const formData = new FormData();
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("avatar_url", payload.avatar_url);
  formData.append("username", handle);
  formData.append("user_name", handle);
  formData.append("fullName", fullName);

  const res = await fetch(`${api_instance}/app/createUser`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`User creation failed: ${res.status} - ${text}`);
  }

  return res.statusText;
};

export const getVideoData = async (
  payload: VideoPageProps
): Promise<VideoResponse> => {
  const res = await fetch(`${api_instance}/vid/view/${payload.id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to Load Video: ${res.status} - ${text}`);
  }

  return res.json();
};

export const getUser = async (uid: string, token: string): Promise<User> => {
  const res = await fetch(`${api_instance}/user/getUser/${uid}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get user failed: ${res.status} - ${text}`);
  }

  return res.json();
};

export const updateUser = async (data: User, token: string): Promise<void> => {
  const formData = new FormData();
  formData.append("user_email", data.user_email);
  formData.append("avatar_url", data.avatar_url);
  formData.append("user_name", data.user_name);
  formData.append("userId", data.userId);
  if (data.fullName) formData.append("fullName", data.fullName);
  if (data.username) formData.append("username", data.username);

  const res = await fetch(`${api_instance}/user/update`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Update user failed: ${res.status}`);
  }
};

// TODO : not needed , due to axios call in page itself, depricate it or modularise actual call
export const uploadVideo = async (
  values: UploadVideo,
  token: string
): Promise<void> => {
  const formData = new FormData();
  formData.append("videoTitle", values.videoTitle);
  formData.append("file", values.file);
  formData.append("userId", values.userId);

  const res = await fetch(`${api_instance}/vid/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Video upload failed: ${res.status} - ${text}`);
  }
};

export const sendResetPasswordEmail = async (email: string): Promise<void> => {
  const formData = new FormData();
  formData.append("email", email);

  const res = await fetch(`${api_instance}/app/reset`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`User Password could not be reset : ${text}`);
  }
};

export const fetchVideos = async (page: number) => {
  const res = await fetch(`${api_instance}/vid/all?page=${page}&size=12`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch videos failed: ${res.status}`);
  }

  return res.json();
};

export async function fetchUserVideos(
  page: number,
  userId: string,
  token: string
) {
  const res = await fetch(
    `${api_instance}/vid/user/${userId}?page=${page}&size=10`,
    {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch user videos");
  return res.json();
}

export async function deleteVideo(
  userId: string,
  videoId: number,
  token: string
) {
  const res = await fetch(`${api_instance}/vid/user/${userId}/${videoId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user videos");
  return res.text();
}

export const getVideoBySlug = async (slug: string): Promise<VideoDTO> => {
  const res = await fetch(`${api_instance}/vid/slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load video by slug: ${res.status} - ${text}`);
  }
  return res.json();
};

export const getVideoById = async (id: string | number): Promise<VideoDTO> => {
  const res = await fetch(`${api_instance}/vid/view/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load video: ${res.status} - ${text}`);
  }
  return res.json();
};

export const updateVideoMetadata = async (
  videoId: number,
  userId: string,
  payload: VideoMetadataUpdateRequest,
  token: string
): Promise<VideoDTO> => {
  const res = await fetch(
    `${api_instance}/vid/${videoId}?userId=${encodeURIComponent(userId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update video metadata: ${res.status} - ${text}`);
  }

  return res.json();
};

export interface SearchVideosParams {
  query?: string;
  categories?: VideoCategory[];
  category?: string;
  tags?: string[];
  tag?: string;
  page?: number;
  size?: number;
}

export const searchVideos = async (
  paramsOrQuery?: SearchVideosParams | string,
  category?: string,
  tag?: string,
  page = 0,
  size = 12
): Promise<PageResponse<VideoDTO>> => {
  let queryVal: string | undefined;
  let categoriesList: string[] = [];
  let tagsList: string[] = [];
  let pageVal = 0;
  let sizeVal = 12;

  if (typeof paramsOrQuery === "object" && paramsOrQuery !== null) {
    queryVal = paramsOrQuery.query;
    if (paramsOrQuery.categories && paramsOrQuery.categories.length > 0) {
      categoriesList = paramsOrQuery.categories.filter(
        (c) => (c as string) !== "ALL"
      );
    } else if (paramsOrQuery.category && paramsOrQuery.category !== "ALL") {
      categoriesList = [paramsOrQuery.category];
    }

    if (paramsOrQuery.tags && paramsOrQuery.tags.length > 0) {
      tagsList = paramsOrQuery.tags
        .filter((t) => t && t.trim())
        .map((t) => t.trim().replace(/^#/, ""));
    } else if (paramsOrQuery.tag && paramsOrQuery.tag.trim()) {
      tagsList = [paramsOrQuery.tag.trim().replace(/^#/, "")];
    }

    pageVal = paramsOrQuery.page ?? 0;
    sizeVal = paramsOrQuery.size ?? 12;
  } else {
    queryVal = paramsOrQuery;
    if (category && category !== "ALL") {
      categoriesList = [category];
    }
    if (tag && tag.trim()) {
      tagsList = [tag.trim().replace(/^#/, "")];
    }
    pageVal = page;
    sizeVal = size;
  }

  const params = new URLSearchParams();
  if (queryVal && queryVal.trim()) {
    params.append("query", queryVal.trim());
  }
  if (categoriesList.length > 0) {
    params.append("category", categoriesList.join(","));
  }
  if (tagsList.length > 0) {
    params.append("tag", tagsList.join(","));
  }
  params.append("page", pageVal.toString());
  params.append("size", sizeVal.toString());

  const res = await fetch(`${api_instance}/vid/search?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Search videos failed: ${res.status}`);
  }

  return res.json();
};

export const getPublicUser = async (
  userId: string
): Promise<UserDTO | null> => {
  try {
    const res = await fetch(
      `${api_instance}/user/getUser/${encodeURIComponent(userId)}`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

export const getPublicUserVideos = async (
  userId: string,
  page = 0,
  size = 24
): Promise<PaginatedVideoResponse | null> => {
  try {
    const res = await fetch(
      `${api_instance}/vid/user/${encodeURIComponent(userId)}?page=${page}&size=${size}`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};


export interface ServiceHealth {
  status: "UP" | "DOWN" | "DEGRADED";
  latencyMs: number;
  details?: string;
}

export interface SystemHealthResponse {
  status: "UP" | "DOWN" | "DEGRADED";
  timestamp: number;
  services: {
    postgres?: ServiceHealth;
    redis?: ServiceHealth;
    rabbitmq?: ServiceHealth;
    firebase?: ServiceHealth;
    s3?: ServiceHealth;
    [key: string]: ServiceHealth | undefined;
  };
}

export const fetchSystemHealth = async (): Promise<SystemHealthResponse> => {
  const res = await fetch(`${api_instance}/health`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Health check returned HTTP ${res.status}`);
  }
  return res.json();
};

export const recordVideoView = async (
  videoId: string | number
): Promise<boolean> => {
  try {
    const res = await fetch(`${api_instance}/vid/${videoId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
};
