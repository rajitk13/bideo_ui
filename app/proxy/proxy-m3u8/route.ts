// app/api/proxy-m3u8/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL param" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    const text = await res.text();

    const basePath = url.substring(0, url.lastIndexOf("/") + 1);

    // Replace relative segment URLs with proxy URLs
    const rewrittenText = text.replace(/^(?!#)(.+\.ts)/gm, (line) => {
      const segmentUrl = basePath + line.trim();
      return `/proxy/proxy-m3u8-segment?url=${encodeURIComponent(segmentUrl)}`;
    });

    return new NextResponse(rewrittenText, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch m3u8" },
      { status: 500 }
    );
  }
}
