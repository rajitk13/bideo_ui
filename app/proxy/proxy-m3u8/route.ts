import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL param" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch playlist: ${res.statusText}` },
        { status: res.status }
      );
    }
    const text = await res.text();

    const basePath = url.substring(0, url.lastIndexOf("/") + 1);

    // 1. Replace relative sub-playlists (.m3u8) with proxy URLs
    let rewrittenText = text.replace(/^(?!#)(.+\.m3u8[^\r\n]*)/gm, (line) => {
      const trimmed = line.trim();
      const subUrl =
        trimmed.startsWith("http://") || trimmed.startsWith("https://")
          ? trimmed
          : basePath + trimmed;
      return `/proxy/proxy-m3u8?url=${encodeURIComponent(subUrl)}`;
    });

    // 2. Replace relative segment URLs (.ts) with proxy segment URLs
    rewrittenText = rewrittenText.replace(/^(?!#)(.+\.ts[^\r\n]*)/gm, (line) => {
      const trimmed = line.trim();
      const segmentUrl =
        trimmed.startsWith("http://") || trimmed.startsWith("https://")
          ? trimmed
          : basePath + trimmed;
      return `/proxy/proxy-m3u8-segment?url=${encodeURIComponent(segmentUrl)}`;
    });

    // Detect if live stream (live playlists lack #EXT-X-ENDLIST)
    const isLiveStream = !text.includes("#EXT-X-ENDLIST");
    const cacheHeader = isLiveStream
      ? "no-cache, no-store, must-revalidate"
      : "public, max-age=60";

    return new NextResponse(rewrittenText, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": cacheHeader,
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
