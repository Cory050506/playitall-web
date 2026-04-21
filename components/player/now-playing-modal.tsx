"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  ListMusic,
  Mic2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePlaybackStore } from "@/stores/playback-store";
import { usePlayerUiStore } from "@/stores/player-ui-store";
import { useCoverArtUrl } from "@/lib/subsonic/use-cover-art";
import { useDownloadUrl } from "@/lib/subsonic/use-download-url";
import { useLyrics } from "@/lib/subsonic/queries";
import { formatDuration } from "@/lib/format";
import type { LyricsPayload } from "@/lib/lyrics";

function dispatchSeek(time: number) {
  window.dispatchEvent(new CustomEvent("play-it-all-seek", { detail: time }));
}

const EMPTY_SYNCED_LINES: LyricsPayload["synced"] = [];

export function NowPlayingModal() {
  const [activePanel, setActivePanel] = useState<"lyrics" | "queue" | null>(null);
  const isOpen = usePlayerUiStore((s) => s.isNowPlayingOpen);
  const closeNowPlaying = usePlayerUiStore((s) => s.closeNowPlaying);

  const currentSong = usePlaybackStore((s) => s.currentSong);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const currentTime = usePlaybackStore((s) => s.currentTime);
  const duration = usePlaybackStore((s) => s.duration);
  const volume = usePlaybackStore((s) => s.volume);
  const queue = usePlaybackStore((s) => s.queue);
  const currentIndex = usePlaybackStore((s) => s.currentIndex);

  const togglePlayPause = usePlaybackStore((s) => s.togglePlayPause);
  const previous = usePlaybackStore((s) => s.previous);
  const next = usePlaybackStore((s) => s.next);
  const setVolume = usePlaybackStore((s) => s.setVolume);
  const setIndex = usePlaybackStore((s) => s.setIndex);

  const coverUrl = useCoverArtUrl(currentSong?.coverArt, 900);
  const downloadUrl = useDownloadUrl(currentSong?.id);
  const { data: lyrics, isLoading: lyricsLoading } = useLyrics(
    currentSong?.id,
    currentSong?.artist,
    currentSong?.title,
    currentSong?.album,
    currentSong?.duration
  );
  const visibleQueue = useMemo(
    () => queue.slice(Math.max(currentIndex, 0)),
    [queue, currentIndex]
  );
  const remainingQueueCount =
    currentIndex >= 0 ? Math.max(queue.length - currentIndex, 0) : queue.length;

  return (
    <AnimatePresence>
      {isOpen && currentSong ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div
            className="absolute inset-0 cursor-pointer bg-black/30 backdrop-blur-xl"
            onClick={closeNowPlaying}
          />

          <div
            className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4"
            onClick={closeNowPlaying}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 36 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 28 }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                flex h-[calc(100dvh-18px)] w-full max-w-[760px] flex-col
                rounded-t-[34px] sm:h-[min(900px,92vh)] sm:rounded-[38px]
                px-4 py-4 sm:px-6 sm:py-6
                player-glass
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeNowPlaying}
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--foreground)] transition-all duration-200 hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94]"
                >
                  <ChevronDown size={22} />
                </button>

                <div className="text-center">
                  <div className="text-[11px] uppercase tracking-[0.24em] swift-tertiary">
                    Now Playing
                  </div>
                </div>

                <div className="h-11 w-11" />
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  {activePanel ? (
                    <div className="relative min-h-[min(420px,42dvh)] rounded-[30px] border border-[var(--hairline)] bg-[var(--soft-fill)] p-4 sm:min-h-[470px] sm:p-5">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover opacity-20 blur-2xl"
                        />
                      ) : null}
                      <div className="relative h-full">
                        {activePanel === "lyrics" ? (
                          <LyricsPanel
                            lyrics={lyrics}
                            currentTime={currentTime}
                            isLoading={lyricsLoading}
                          />
                        ) : (
                          <QueuePanel
                            queue={visibleQueue}
                            currentIndex={currentIndex}
                            setIndex={setIndex}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative mx-auto aspect-square w-full max-w-[min(460px,52dvh)] overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_34%,#ffffff),color-mix(in_srgb,var(--accent)_16%,#171412))] shadow-[0_22px_60px_rgba(0,0,0,0.22)] sm:rounded-[34px]">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt=""
                          fill
                          unoptimized
                          className="scale-110 object-cover opacity-35 blur-2xl"
                        />
                      ) : null}
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={currentSong.title}
                          fill
                          unoptimized
                          className="scale-[0.94] rounded-[24px] object-cover shadow-[0_16px_38px_rgba(0,0,0,0.22)] sm:rounded-[28px]"
                        />
                      ) : null}
                    </div>
                  )}

                <div className="mt-5 text-center sm:mt-6">
                  <h2 className="line-clamp-2 text-2xl font-black tracking-normal text-[var(--foreground)] sm:text-3xl">
                    {currentSong.title}
                  </h2>
                  <p className="mt-2 line-clamp-1 text-base swift-subtitle">
                    {currentSong.artist || "Unknown Artist"}
                  </p>
                  {currentSong.album ? (
                    <p className="mt-1 line-clamp-1 text-sm swift-tertiary">
                      {currentSong.album}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 sm:mt-8">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={1}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={(e) => dispatchSeek(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[var(--accent)]"
                  />

                  <div className="mt-2 flex items-center justify-between text-xs swift-tertiary">
                    <span>{formatDuration(Math.floor(currentTime))}</span>
                    <span>{formatDuration(Math.floor(duration))}</span>
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-center gap-4 sm:mt-8">
                  <button
                    type="button"
                    onClick={previous}
                    className="inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--accent)] transition-all duration-200 hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94]"
                  >
                    <SkipBack size={24} />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="inline-flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_18px_38px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.04] active:scale-[0.94]"
                  >
                    {isPlaying ? (
                      <Pause size={30} />
                    ) : (
                      <Play size={30} className="ml-1" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--accent)] transition-all duration-200 hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94]"
                  >
                    <SkipForward size={24} />
                  </button>
                </div>

                <div className="mt-7 flex items-center gap-3 sm:mt-8">
                  <Volume2 size={18} className="swift-tertiary" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[var(--accent)]"
                  />
                </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <PanelButton
                    icon={<Mic2 size={16} />}
                    label="Lyrics"
                    active={activePanel === "lyrics"}
                    onClick={() =>
                      setActivePanel(activePanel === "lyrics" ? null : "lyrics")
                    }
                  />
                  <PanelButton
                    icon={<ListMusic size={16} />}
                    label={remainingQueueCount ? `${remainingQueueCount} Up Next` : "Up Next"}
                    active={activePanel === "queue"}
                    onClick={() =>
                      setActivePanel(activePanel === "queue" ? null : "queue")
                    }
                  />
                  {downloadUrl ? (
                    <a
                      href={downloadUrl}
                      download
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--soft-fill)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PanelButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
        active
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--soft-fill)] text-[var(--foreground)] hover:bg-[var(--soft-fill-hover)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LyricsPanel({
  lyrics,
  currentTime,
  isLoading,
}: {
  lyrics?: LyricsPayload;
  currentTime: number;
  isLoading: boolean;
}) {
  const synced = lyrics?.synced ?? EMPTY_SYNCED_LINES;
  const currentLineIndex = useMemo(() => {
    if (!synced.length) return -1;

    let activeIndex = -1;
    for (let index = 0; index < synced.length; index += 1) {
      if (currentTime >= synced[index].time) {
        activeIndex = index;
      } else {
        break;
      }
    }
    return activeIndex;
  }, [currentTime, synced]);

  return (
    <div className="flex h-full min-h-[inherit] flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-black text-[var(--foreground)]">Lyrics</h3>
        {lyrics?.source && lyrics.source !== "none" ? (
          <div className="rounded-full bg-[var(--soft-fill)] px-3 py-2 text-xs font-bold uppercase tracking-wide swift-subtitle">
            {lyrics.source}
          </div>
        ) : null}
      </div>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm swift-subtitle">
          Loading lyrics...
        </div>
      ) : synced.length ? (
        <div className="flex flex-col gap-3 py-6">
          {synced.map((line, index) => {
            const isCurrent = index === currentLineIndex;
            const isPast = index < currentLineIndex;

            return (
              <button
                key={`${line.time}-${index}`}
                type="button"
                onClick={() => dispatchSeek(line.time)}
                className={`rounded-[18px] px-3 py-2 text-center text-lg font-black leading-snug transition ${
                  isCurrent
                    ? "scale-[1.03] text-[var(--foreground)] shadow-[0_0_24px_rgba(0,0,0,0.14)]"
                    : isPast
                      ? "text-[var(--muted)]"
                      : "text-[var(--muted-2)]"
                }`}
              >
                {line.text}
              </button>
            );
          })}
        </div>
      ) : lyrics?.plain?.trim() ? (
        <div className="whitespace-pre-line text-center text-lg font-bold leading-relaxed text-[var(--foreground)]">
          {lyrics.plain}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-center text-lg font-bold swift-subtitle">
          Lyrics unavailable.
        </div>
      )}
    </div>
  );
}

function QueuePanel({
  queue,
  currentIndex,
  setIndex,
}: {
  queue: ReturnType<typeof usePlaybackStore.getState>["queue"];
  currentIndex: number;
  setIndex: (index: number) => void;
}) {
  return (
    <div className="flex h-full min-h-[inherit] flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black text-[var(--foreground)]">Up Next</h3>
          <p className="text-sm font-semibold swift-subtitle">
            Tap a song to jump ahead.
          </p>
        </div>
        <div className="rounded-full bg-[var(--soft-fill)] px-3 py-2 text-sm font-bold swift-subtitle">
          {queue.length}
        </div>
      </div>

      {queue.length ? (
        <div className="grid gap-3">
          {queue.map((song, offset) => {
            const absoluteIndex = Math.max(currentIndex, 0) + offset;
            const isCurrent = offset === 0;

            return (
              <button
                key={`${song.id}-${absoluteIndex}`}
                type="button"
                onClick={() => setIndex(absoluteIndex)}
                className={`flex items-center gap-3 rounded-[20px] px-3 py-3 text-left transition ${
                  isCurrent
                    ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                    : "bg-[var(--soft-fill)] hover:bg-[var(--soft-fill-hover)]"
                }`}
              >
                <div className="w-7 shrink-0 text-center text-xs font-black swift-tertiary">
                  {absoluteIndex + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-bold text-[var(--foreground)]">
                    {song.title}
                  </div>
                  <div className="line-clamp-1 text-xs swift-subtitle">
                    {song.artist || "Unknown Artist"}
                  </div>
                </div>
                <div className="text-xs font-semibold swift-tertiary">
                  {formatDuration(song.duration)}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-center text-lg font-bold swift-subtitle">
          Your queue is empty.
        </div>
      )}
    </div>
  );
}
