"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CollectionActionBar } from "@/components/library/collection-action-bar";
import { SongRow } from "@/components/home/song-row";
import { usePlaylist } from "@/lib/subsonic/queries";
import { usePlaybackStore } from "@/stores/playback-store";

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const { data: playlist, isLoading, error } = usePlaylist(id);
  const setQueue = usePlaybackStore((s) => s.setQueue);
  const [status, setStatus] = useState<string | null>(null);
  const songs = playlist?.song ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
        {isLoading ? (
          <div className="swift-subtitle">Loading playlist...</div>
        ) : error || !playlist ? (
          <div className="text-red-500">Couldn’t load playlist.</div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">{playlist.name}</h1>
              <p className="mt-2 text-[15px] swift-subtitle">
                {playlist.songCount ?? songs.length} songs
              </p>
            </div>

            <CollectionActionBar
              onPlay={() => setQueue(songs, 0)}
              onShuffle={() =>
                setQueue([...songs].sort(() => Math.random() - 0.5), 0, {
                  originalQueue: songs,
                  isShuffled: true,
                })
              }
              onDownload={() =>
                setStatus("Offline song caching is not available in the web app yet.")
              }
              disabled={songs.length === 0}
            />
            {status ? (
              <div className="mt-3 rounded-[20px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3 text-sm swift-subtitle">
                {status}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3">
              {songs.map((song) => (
                <SongRow
                  key={song.id}
                  song={song}
                  queue={songs}
                  title={song.title}
                  artist={song.artist}
                  album={song.album}
                  coverArtId={song.coverArt}
                  duration={song.duration}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
