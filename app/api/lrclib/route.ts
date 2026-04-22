import { NextRequest, NextResponse } from "next/server";
import { emptyLyrics, parseLrc, plainFromSynced } from "@/lib/lyrics";

type LrclibResponse = {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
};

function toLyricsPayload(input?: LrclibResponse | null) {
  if (!input) return emptyLyrics();

  const synced = input.syncedLyrics ? parseLrc(input.syncedLyrics) : [];
  const plain = input.plainLyrics?.trim() || plainFromSynced(synced);

  return {
    plain,
    synced,
    source: plain || synced.length ? "lrclib" : "none",
  };
}

async function fetchLrclib(url: URL) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PlayItAll-Web/0.1 (https://localhost)",
      Accept: "application/json",
    },
    next: {
      revalidate: 60 * 60 * 24,
    },
  });

  if (!response.ok) return null;
  return response.json();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trackName = searchParams.get("track_name")?.trim();
  const artistName = searchParams.get("artist_name")?.trim();
  const albumName = searchParams.get("album_name")?.trim();
  const duration = searchParams.get("duration")?.trim();

  if (!trackName || !artistName) {
    return NextResponse.json(emptyLyrics());
  }

  const url = new URL("https://lrclib.net/api/get");
  url.searchParams.set("track_name", trackName);
  url.searchParams.set("artist_name", artistName);
  if (albumName) url.searchParams.set("album_name", albumName);
  if (duration) url.searchParams.set("duration", String(Math.round(Number(duration))));

  try {
    const exact = (await fetchLrclib(url)) as LrclibResponse | null;
    const exactPayload = toLyricsPayload(exact);
    if (exactPayload.plain || exactPayload.synced.length) {
      return NextResponse.json(exactPayload);
    }

    const fallbackUrl = new URL("https://lrclib.net/api/search");
    fallbackUrl.searchParams.set("track_name", trackName);
    fallbackUrl.searchParams.set("artist_name", artistName);
    if (duration) fallbackUrl.searchParams.set("duration", String(Math.round(Number(duration))));

    const fallback = (await fetchLrclib(fallbackUrl)) as LrclibResponse[] | null;
    const fallbackPayload = toLyricsPayload(
      fallback?.find((item) => item.syncedLyrics || item.plainLyrics) ?? null
    );

    return NextResponse.json(fallbackPayload);
  } catch {
    return NextResponse.json(emptyLyrics());
  }
}
