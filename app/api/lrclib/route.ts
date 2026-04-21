import { NextRequest, NextResponse } from "next/server";
import { emptyLyrics, parseLrc, plainFromSynced } from "@/lib/lyrics";

type LrclibResponse = {
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
};

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
  if (duration) url.searchParams.set("duration", String(Number(duration) * 1000));

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PlayItAll-Web/0.1 (https://localhost)",
        Accept: "application/json",
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    });

    if (!response.ok) {
      return NextResponse.json(emptyLyrics());
    }

    const json = (await response.json()) as LrclibResponse;
    const synced = json.syncedLyrics ? parseLrc(json.syncedLyrics) : [];
    const plain = json.plainLyrics?.trim() || plainFromSynced(synced);

    return NextResponse.json({
      plain,
      synced,
      source: plain || synced.length ? "lrclib" : "none",
    });
  } catch {
    return NextResponse.json(emptyLyrics());
  }
}
