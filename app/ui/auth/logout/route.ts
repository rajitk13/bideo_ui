// app/api/auth/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("uid");

  return NextResponse.json({ success: true });
}
