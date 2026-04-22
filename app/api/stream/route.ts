import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing stream URL." }, { status: 400 });
  }

  let streamUrl: URL;
  try {
    streamUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid stream URL." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(streamUrl.protocol)) {
    return NextResponse.json({ error: "Unsupported stream URL." }, { status: 400 });
  }

  const range = request.headers.get("range");
  const upstream = await fetch(streamUrl, {
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  });

  const headers = new Headers();
  const passthroughHeaders = [
    "accept-ranges",
    "content-length",
    "content-range",
    "content-type",
    "etag",
    "last-modified",
  ];

  for (const header of passthroughHeaders) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }

  headers.set("cache-control", "no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
