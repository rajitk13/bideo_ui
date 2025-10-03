import { api_instance } from "@/global";

export interface LoginPayload {
  email: string;
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
  user_name: string;
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

export interface VideoResponse {
  videoId: string;
  video_title: string;
  video_uploadDate: string;
  video_views: number;
  m3u8Url: string;
  video_duration: string;
  video_uploader: VideoUploader;
}

export interface User {
  userId: string;
  user_email: string;
  user_name: string;
  avatar_url: string;
}

export interface UploadVideo {
  videoTitle: string;
  file: File;
  userId: string;
}

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
  const formData = new FormData();
  formData.append("email", payload.email);
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
  const formData = new FormData();
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("avatar_url", payload.avatar_url);
  formData.append("user_name", payload.user_name);

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
