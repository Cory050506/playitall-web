"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AlbumCard } from "@/components/home/album-card";
import { CollectionActionBar } from "@/components/library/collection-action-bar";
import { SongRow } from "@/components/home/song-row";
import { useArtist, useLibraryCatalog } from "@/lib/subsonic/queries";
import { usePlaybackStore } from "@/stores/playback-store";

export default function ArtistDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const { data: artist, isLoading, error } = useArtist(id);
  const { data: catalog } = useLibraryCatalog(!!artist);
  const setQueue = usePlaybackStore((s) => s.setQueue);
  const [status, setStatus] = useState<string | null>(null);
  const artistSongs =
    catalog?.songs.filter((song) => {
      return song.artistId === id || song.artist === artist?.name;
    }) ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
        {isLoading ? (
          <div className="swift-subtitle">Loading artist...</div>
        ) : error || !artist ? (
          <div className="text-red-500">Couldn’t load artist.</div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">{artist.name}</h1>
              <p className="mt-2 text-[15px] swift-subtitle">
                {artist.albumCount ?? artist.album?.length ?? 0} albums • {artistSongs.length} songs
              </p>
            </div>

            <CollectionActionBar
              onPlay={() => setQueue(artistSongs, 0)}
              onShuffle={() =>
                setQueue([...artistSongs].sort(() => Math.random() - 0.5), 0, {
                  originalQueue: artistSongs,
                  isShuffled: true,
                })
              }
              onDownload={() =>
                setStatus("Offline song caching is not available in the web app yet.")
              }
              disabled={artistSongs.length === 0}
            />

            {status ? (
              <div className="mt-3 rounded-[20px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3 text-sm swift-subtitle">
                {status}
              </div>
            ) : null}

            <h2 className="mb-4 mt-7 text-xl font-bold text-[var(--foreground)]">
              Albums
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,164px))] justify-center gap-5 sm:justify-start">
              {(artist.album ?? []).map((album) => (
                <AlbumCard
                  key={album.id}
                  title={album.name}
                  subtitle={album.artist ?? artist.name}
                  coverArtId={album.coverArt}
                  href={`/library/albums/${encodeURIComponent(album.id)}`}
                />
              ))}
            </div>

            <h2 className="mb-4 mt-8 text-xl font-bold text-[var(--foreground)]">
              Songs
            </h2>
            {artistSongs.length ? (
              <div className="grid gap-3">
                {artistSongs.map((song) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    queue={artistSongs}
                    title={song.title}
                    artist={song.artist}
                    album={song.album}
                    coverArtId={song.coverArt}
                    duration={song.duration}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-5 swift-subtitle">
                Songs are still loading or unavailable for this artist.
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
