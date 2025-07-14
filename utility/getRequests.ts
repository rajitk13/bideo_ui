import Cookies from "js-cookie";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  idToken?: string;
  refreshToken?: string;
}

export interface createUserPayload {
  email: string;
  password: string;
  user_name: string;
  thumbnail_url: string;
}

export interface VideoPageProps {
    id: string;
}

export interface VideoUploader {
  userId: string;
  user_name: string;
  user_email: string;
  thumbnail_url: string | null;
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

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append("email", payload.email);
  formData.append("password", payload.password);

  const res = await fetch('http://localhost:8085/app/login', {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed with status ${res.status}: ${text}`);
  }

  const result: LoginResponse = await res.json();
  if (result.idToken) {
    Cookies.set("token", result.idToken, { expires: 7 }); // 7 days
  }

  return result;
};

export const createUser = async (
  payload: createUserPayload
): Promise<string> => {
  const formData = new FormData();
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("thumbnail_url", payload.thumbnail_url);
  formData.append("user_name", payload.user_name);

  const res = await fetch('http://localhost:8085/app/createUser', {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed with status ${res.status}: ${text}`);
  } else return res.statusText;
};

export const getVideoData = async (
  payload: VideoPageProps
): Promise<VideoResponse> => {
  const res = await fetch(`http://localhost:8085/video/view/${payload.id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to Load Video ${res.status}: ${text}`);
  }
  const data: VideoResponse = await res.json();
  console.log("Video Data:", data);
  return {
    videoId: payload.id,
    video_title: data.video_title,
    video_uploadDate: data.video_uploadDate,
    video_views: data.video_views,
    m3u8Url: data.m3u8Url,
    video_duration: data.video_duration,
    video_uploader: data.video_uploader
  };
};
