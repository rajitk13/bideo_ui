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
  thumbnail_url: string;
}

export interface User {
  userId: string;
  user_email: string;
  user_name: string;
  thumbnail_url: string;
}

export interface UploadVideo {
  videoTitle: string;
  file: File;
  userId: string;
}

const myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

export const verifyToken = async (idToken: string): Promise<{ id: string }> => {
  const res = await fetch("http://localhost:8085/app/verifyToken", {
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

  const res = await fetch("http://localhost:8085/app/login", {
    method: "POST",
    body: formData,
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
  formData.append("thumbnail_url", payload.thumbnail_url);
  formData.append("user_name", payload.user_name);

  const res = await fetch("http://localhost:8085/app/createUser", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed with status ${res.status}: ${text}`);
  } else return res.statusText;
};

export const getUser = async (uid: string): Promise<User> => {
  const res = await fetch(`http://localhost:8085/user/getUser/${uid}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${Cookies.get("token") || ""}`,
      "Content-Type": "application/json",
      // cross orgin header allow
      "Access-Control-Allow-Origin": "*",
      refererPolicy: "no-referrer",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
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
  formData.append("thumbnail_url", data.thumbnail_url);
  formData.append("user_name", data.user_name);
  formData.append("userId", data.userId);

  await fetch(`http://localhost:8085/user/update`, {
    method: "POST",
    body: formData,
    headers: myHeaders,
  }).catch((err) => {
    console.error(err);
  });
};

export const uploadVideo = async (values: UploadVideo) => {
  const formData = new FormData();
  formData.append("videoTitle", values.videoTitle);
  formData.append("file", values.file);
  if (values.userId) formData.append("userId", values.userId);

  await fetch("http://localhost:8085/video/upload", {
    method: "POST",
    body: formData,
    headers: myHeaders,
  }).catch((err) => {
    console.error(err);
  });
};
