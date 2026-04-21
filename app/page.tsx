"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AlbumCard } from "@/components/home/album-card";
import { SongRow } from "@/components/home/song-row";
import {
  useNewestAlbums,
  usePlaylists,
  useRandomSongs,
} from "@/lib/subsonic/queries";
import { useSessionStore } from "@/stores/session-store";

export default function HomePage() {
  const router = useRouter();
  const isConnected = useSessionStore((s) => s.isConnected);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);

  const {
    data: newestAlbums = [],
    isLoading: albumsLoading,
    error: albumsError,
  } = useNewestAlbums();

  const {
    data: randomSongs = [],
    isLoading: randomLoading,
    error: randomError,
  } = useRandomSongs();

  const {
    data: playlists = [],
    isLoading: playlistsLoading,
  } = usePlaylists();

  useEffect(() => {
    if (hasHydrated && !isConnected) {
      router.replace("/login");
    }
  }, [hasHydrated, isConnected, router]);

  if (!hasHydrated) return null;
  if (!isConnected) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
        <div className="mb-8">
          <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">Welcome</h1>
          <p className="mt-2 text-[15px] swift-subtitle">Tap a song to start playing.</p>
        </div>

        <section className="mb-9">
          <div className="mb-4">
            <h2 className="text-[22px] font-bold text-[var(--foreground)]">Recently Added</h2>
            <p className="text-[15px] swift-subtitle">Newest albums from your library</p>
          </div>

          {albumsLoading ? (
            <div className="swift-subtitle">Loading albums...</div>
          ) : albumsError ? (
            <div className="text-red-500">Couldn’t load albums.</div>
          ) : (
            <div className="-mx-[18px] overflow-x-auto px-[18px] pb-2 lg:mx-0 lg:grid lg:grid-cols-[repeat(auto-fit,164px)] lg:gap-5 lg:overflow-visible lg:px-0">
              <div className="flex gap-4 lg:contents">
                {newestAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    title={album.name}
                    subtitle={album.artist}
                    coverArtId={album.coverArt}
                    href={`/library/albums/${encodeURIComponent(album.id)}`}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mb-9">
          <div className="mb-4">
            <h2 className="text-[22px] font-bold text-[var(--foreground)]">Random Picks</h2>
            <p className="text-[15px] swift-subtitle">A quick mix from your collection</p>
          </div>

          {randomLoading ? (
            <div className="swift-subtitle">Loading songs...</div>
          ) : randomError ? (
            <div className="text-red-500">Couldn’t load random songs.</div>
          ) : (
            <div className="grid gap-3">
              {randomSongs.slice(0, 10).map((song) => (
                <SongRow
                  key={song.id}
                  song={song}
                  queue={randomSongs}
                  title={song.title}
                  artist={song.artist}
                  album={song.album}
                  coverArtId={song.coverArt}
                  duration={song.duration}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="mb-4">
            <h2 className="text-[22px] font-bold text-[var(--foreground)]">Playlists</h2>
            <p className="text-[15px] swift-subtitle">Your saved collections</p>
          </div>

          {playlistsLoading ? (
            <div className="swift-subtitle">Loading playlists...</div>
          ) : playlists.length === 0 ? (
            <div className="swift-tertiary">No playlists found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  href={`/library/playlists/${encodeURIComponent(playlist.id)}`}
                  className="liquid-glass rounded-[22px] px-4 py-4 transition hover:-translate-y-0.5"
                >
                  <div className="text-base font-bold text-[var(--foreground)]">
                    {playlist.name}
                  </div>
                  <div className="mt-1 text-sm swift-subtitle">
                    {playlist.songCount ?? 0} songs
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
