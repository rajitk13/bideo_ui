import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Segment proxy failed:", err);
    return new NextResponse("Failed to fetch TS segment", { status: 500 });
  }
}
