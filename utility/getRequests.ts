import Cookies from "js-cookie";

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
  const res = await fetch("https://bideo.tech/api/app/verifyToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: idToken, // Send token as plain string
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token verification failed: ${error}`);
  }

  const data = await res.json();
  return data; // { id: 'uid123' }
};

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append("email", payload.email);
  formData.append("password", payload.password);

  const res = await fetch('https://bideo.tech/api/app/login', {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed with status ${res.status}: ${text}`);
  }

  const result: LoginResponse = await res.json();
  const uid = await verifyToken(result.idToken || "");
  if (result.idToken) {
    Cookies.set("token", result.idToken, { expires: 7 }); // 7 days
    Cookies.set("uid", uid.id, { expires: 7 }); // 7 days
  }

  return {
    idToken: result.idToken,
    refreshToken: result.refreshToken,
    uid: uid.id, // Return the verified UID
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

  const res = await fetch('https://bideo.tech/api/app/createUser', {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed with status ${res.status}: ${text}`);
  } else return res.statusText;
};

export const getVideoData = async (
  payload: VideoPageProps
): Promise<VideoResponse> => {
  const res = await fetch(`https://bideo.tech/api/vid/view/${payload.id}`, {
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

export const getUser = async (uid: string): Promise<User> => {
  const res = await fetch(`https://bideo.tech/api/user/getUser/${uid}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${Cookies.get("token") || ""}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get user failed with status ${res.status}: ${text}`);
  }

  return res.json();
};

export const updateUser = async (data: User) => {
  const formData = new FormData();
  formData.append("user_email", data.user_email);
  formData.append("avatar_url", data.avatar_url);
  formData.append("user_name", data.user_name);
  formData.append("userId", data.userId);

  await fetch(`https://bideo.tech/api/user/update`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    }
  }).catch((err) => {
    console.error(err);
  });
};

export const uploadVideo = async (values: UploadVideo) => {
  const formData = new FormData();
  formData.append("videoTitle", values.videoTitle);
  formData.append("file", values.file);
  if (values.userId) formData.append("userId", values.userId);

  await fetch("https://bideo.tech/api/vid/upload", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    }
  }).catch((err) => {
    console.error(err);
  });
};

export const fetchVideos = async (page: number) => {
  try {
    const res = await fetch(
      `https://bideo.tech/api/vid/all?page=${page}&size=10`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error loading videos", err);
  }
};
