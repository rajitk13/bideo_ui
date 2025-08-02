import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, uid } = await req.json();

  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  response.cookies.set("uid", uid, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  return response;
}
