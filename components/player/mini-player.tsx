"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import { Pause, Play, SkipForward, Airplay } from "lucide-react";
import { usePlaybackStore } from "@/stores/playback-store";
import { useCoverArtUrl } from "@/lib/subsonic/use-cover-art";
import { usePlayerUiStore } from "@/stores/player-ui-store";
import { usePreferencesStore } from "@/stores/preferences-store";

export function MiniPlayer() {
  const currentSong = usePlaybackStore((s) => s.currentSong);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const currentTime = usePlaybackStore((s) => s.currentTime);
  const duration = usePlaybackStore((s) => s.duration);
  const togglePlayPause = usePlaybackStore((s) => s.togglePlayPause);
  const next = usePlaybackStore((s) => s.next);

  const openNowPlaying = usePlayerUiStore((s) => s.openNowPlaying);
  const waveformMotion = usePreferencesStore((s) => s.waveformMotion);
  const higherContrastCards = usePreferencesStore((s) => s.higherContrastCards);

  const coverUrl = useCoverArtUrl(currentSong?.coverArt, 200);
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!currentSong) return null;

  function seekFromProgress(event: PointerEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    window.dispatchEvent(
      new CustomEvent("play-it-all-seek", { detail: ratio * duration })
    );
  }

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
        <div
          role="slider"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration || 0)}
          aria-valuenow={Math.floor(currentTime || 0)}
          tabIndex={0}
          onPointerDown={seekFromProgress}
          className="absolute inset-x-5 bottom-[5px] h-1 cursor-pointer rounded-full bg-[var(--range-track)]"
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

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
              {waveformMotion ? <WaveformIndicator active={isPlaying} /> : <Airplay size={22} />}
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

function WaveformIndicator({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-7 items-center justify-center gap-0.5"
    >
      {[0.45, 0.78, 1, 0.62, 0.86].map((height, index) => (
        <span
          key={`${height}-${index}`}
          data-active={active}
          className="waveform-bar h-5 w-1 rounded-full bg-current"
          style={{
            animationDelay: `${index * 110}ms`,
            transform: `scaleY(${active ? height : 0.45})`,
          }}
        />
      ))}
    </span>
  );
}
