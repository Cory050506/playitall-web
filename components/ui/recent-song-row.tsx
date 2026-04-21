"use client";

import Image from "next/image";
import type { Song } from "@/lib/subsonic/types";
import { useCoverArtUrl } from "@/lib/subsonic/use-cover-art";
import { usePlaybackStore } from "@/stores/playback-store";

type RecentSongRowProps = {
  song?: Song;
  queue?: Song[];

  title?: string;
  artist?: string;
  album?: string;
  duration?: string;
  coverArtId?: string;
};

export function RecentSongRow({
  song,
  queue,
  title,
  artist,
  album,
  duration,
  coverArtId,
}: RecentSongRowProps) {
  const playSong = usePlaybackStore((s) => s.playSong);

  const resolvedTitle = song?.title ?? title ?? "Unknown Song";
  const resolvedArtist = song?.artist ?? artist ?? "Unknown Artist";
  const resolvedAlbum = song?.album ?? album ?? "";
  const resolvedCoverArtId = song?.coverArt ?? coverArtId;

  const coverUrl = useCoverArtUrl(resolvedCoverArtId, 120);

  function handleClick() {
    if (!song) return;
    playSong(song, queue);
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center gap-3 border-b border-[var(--hairline)] px-4 py-3 text-left transition hover:bg-[var(--soft-fill)] last:border-b-0"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_34%,#ffffff),color-mix(in_srgb,var(--accent)_16%,#171412))]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={resolvedTitle}
            fill
            unoptimized
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-[var(--foreground)]">
          {resolvedTitle}
        </div>
        <div className="truncate text-sm swift-subtitle">{resolvedArtist}</div>
      </div>

      {resolvedAlbum ? (
        <div className="hidden max-w-[240px] flex-1 truncate text-sm swift-tertiary lg:block">
          {resolvedAlbum}
        </div>
      ) : (
        <div className="hidden flex-1 lg:block" />
      )}

      {duration ? <div className="text-sm swift-tertiary">{duration}</div> : null}
    </button>
  );
}
