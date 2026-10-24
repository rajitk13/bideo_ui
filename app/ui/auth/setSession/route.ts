import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, uid } = await req.json();

  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  const isSecure =
    process.env.NODE_ENV === "production" &&
    (req.headers.get("x-forwarded-proto") === "https" ||
      req.url.startsWith("https"));

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  response.cookies.set("uid", uid, {
    httpOnly: true,
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  return response;
}
