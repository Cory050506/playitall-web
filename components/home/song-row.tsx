"use client";

import Image from "next/image";
import { Clock3, Music } from "lucide-react";
import type { Song } from "@/lib/subsonic/types";
import { useCoverArtUrl } from "@/lib/subsonic/use-cover-art";
import { usePlaybackStore } from "@/stores/playback-store";

type SongRowProps = {
  song?: Song;
  queue?: Song[];
  title: string;
  artist?: string;
  album?: string;
  coverArtId?: string;
  duration?: number;
};

function formatDuration(seconds?: number) {
  if (!seconds || Number.isNaN(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function SongRow({
  song,
  queue,
  title,
  artist,
  album,
  coverArtId,
  duration,
}: SongRowProps) {
  const playSong = usePlaybackStore((s) => s.playSong);
  const imageUrl = useCoverArtUrl(coverArtId, 200);

  function handleClick() {
    if (song) playSong(song, queue);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="liquid-glass flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-left transition hover:-translate-y-0.5 disabled:cursor-default"
      disabled={!song}
    >
      <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_34%,#ffffff),color-mix(in_srgb,var(--accent)_16%,#171412))]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : null}
        <Music size={18} className="absolute bottom-2 right-2 text-white/88" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-[15px] font-bold leading-tight text-[var(--foreground)]">{title}</div>
        <div className="mt-1 truncate text-sm swift-subtitle">
          {[artist, album].filter(Boolean).join(" • ")}
        </div>
      </div>

      <div className="hidden items-center gap-1 text-sm swift-tertiary sm:flex">
        <Clock3 size={14} />
        <span>{formatDuration(duration)}</span>
      </div>
    </button>
  );
}
