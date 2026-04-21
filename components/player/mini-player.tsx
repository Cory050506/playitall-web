"use client";

import Image from "next/image";
import { Pause, Play, SkipForward, Airplay, AudioLines } from "lucide-react";
import { usePlaybackStore } from "@/stores/playback-store";
import { useCoverArtUrl } from "@/lib/subsonic/use-cover-art";
import { usePlayerUiStore } from "@/stores/player-ui-store";
import { usePreferencesStore } from "@/stores/preferences-store";

export function MiniPlayer() {
  const currentSong = usePlaybackStore((s) => s.currentSong);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const togglePlayPause = usePlaybackStore((s) => s.togglePlayPause);
  const next = usePlaybackStore((s) => s.next);

  const openNowPlaying = usePlayerUiStore((s) => s.openNowPlaying);
  const waveformMotion = usePreferencesStore((s) => s.waveformMotion);
  const higherContrastCards = usePreferencesStore((s) => s.higherContrastCards);

  const coverUrl = useCoverArtUrl(currentSong?.coverArt, 200);

  if (!currentSong) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[88px] z-40 flex justify-center px-3 lg:bottom-4 lg:z-50">
      <div
        className="
          pointer-events-auto
          w-full max-w-[760px]
          rounded-full
          px-[14px] py-[10px]
          player-glass
        "
        style={{
          background: higherContrastCards
            ? "color-mix(in srgb, var(--foreground) 15%, transparent)"
            : undefined,
        }}
      >
        <div className="flex items-center gap-[14px]">
          <button
            type="button"
            onClick={openNowPlaying}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-[14px] rounded-full text-left transition-all duration-200 active:scale-[0.995]"
          >
            <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_34%,#ffffff),color-mix(in_srgb,var(--accent)_16%,#171412))]">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={currentSong.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 text-[15px] font-bold leading-tight text-[var(--foreground)]">
                {currentSong.title}
              </div>
              <div className="truncate text-[14px] swift-subtitle">
                {currentSong.artist || "Unknown Artist"}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-[18px] text-[var(--accent)]">
            <span className="hidden sm:inline-flex">
              {waveformMotion ? <AudioLines size={22} /> : <Airplay size={22} />}
            </span>
            <button
              type="button"
              onClick={togglePlayPause}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.04] active:scale-[0.94]"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={next}
              className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.04] active:scale-[0.94] sm:inline-flex"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
