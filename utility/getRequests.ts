import Cookies from "js-cookie";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  idToken?: string;
  refreshToken?: string;
}

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
  if (result.idToken) {
    Cookies.set("token", result.idToken, { expires: 7 }); // 7 days
  }

  return result;
};
