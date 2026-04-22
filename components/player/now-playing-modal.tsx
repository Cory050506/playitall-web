"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  Airplay,
  ChevronDown,
  Download,
  ListMusic,
  Maximize2,
  MoreHorizontal,
  Mic2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  X,
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

function requestCast() {
  window.dispatchEvent(new CustomEvent("play-it-all-cast"));
}

export function NowPlayingModal() {
  const [activePanel, setActivePanel] = useState<"lyrics" | "queue" | null>(null);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isLyricsFullscreen, setIsLyricsFullscreen] = useState(false);
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

  function handleClose() {
    setIsOverflowOpen(false);
    setIsVolumeOpen(false);
    setIsLyricsFullscreen(false);
    closeNowPlaying();
  }

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
            onClick={handleClose}
          />

          <div
            className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4"
            onClick={handleClose}
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
                now-playing-card
                relative
                flex h-[calc(100dvh-12px)] w-full max-w-[760px] flex-col
                rounded-t-[34px] sm:h-[min(820px,92vh)] sm:rounded-[38px]
                px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:py-5
                player-glass
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="now-playing-header mb-3 flex shrink-0 items-center justify-between sm:mb-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--foreground)] transition-all duration-200 hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94]"
                >
                  <ChevronDown size={22} />
                </button>

                <div className="text-center">
                  <div className="text-[11px] uppercase tracking-[0.24em] swift-tertiary">
                    Now Playing
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsOverflowOpen((value) => !value)}
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--foreground)] transition-all duration-200 hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94]"
                    aria-label="More options"
                    aria-expanded={isOverflowOpen}
                  >
                    <MoreHorizontal size={22} />
                  </button>

                  <AnimatePresence>
                    {isOverflowOpen ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-[18px] border border-[var(--hairline)] bg-[var(--player-surface-strong)] p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            requestCast();
                            setIsOverflowOpen(false);
                          }}
                          className="flex h-11 w-full items-center gap-3 rounded-[14px] px-3 text-left text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
                        >
                          <Airplay size={16} />
                          Cast / AirPlay
                        </button>
                        {downloadUrl ? (
                          <a
                            href={downloadUrl}
                            download
                            onClick={() => setIsOverflowOpen(false)}
                            className="flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
                          >
                            <Download size={16} />
                            Download
                          </a>
                        ) : (
                          <div className="flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-bold swift-tertiary">
                            <Download size={16} />
                            Download unavailable
                          </div>
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-visible">
                  {activePanel ? (
                    <div className="now-playing-panel relative h-[min(260px,28dvh)] overflow-hidden rounded-[26px] border border-[var(--hairline)] bg-[var(--soft-fill)] p-4 sm:h-[min(360px,42dvh)] sm:rounded-[28px] sm:p-5">
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
                            isPlaying={isPlaying}
                            isLoading={lyricsLoading}
                            onExpand={() => setIsLyricsFullscreen(true)}
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
                    <div className="now-playing-art relative mx-auto aspect-square w-full max-w-[min(290px,30dvh)] overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_34%,#ffffff),color-mix(in_srgb,var(--accent)_16%,#171412))] shadow-[0_22px_60px_rgba(0,0,0,0.22)] sm:max-w-[min(390px,42dvh)] sm:rounded-[34px]">
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

                <div className="now-playing-meta mt-3 text-center sm:mt-5">
                  <h2 className="now-playing-title line-clamp-1 text-xl font-black tracking-normal text-[var(--foreground)] sm:line-clamp-2 sm:text-3xl">
                    {currentSong.title}
                  </h2>
                  <div className="mt-2 flex min-w-0 justify-center">
                    {currentSong.artistId ? (
                      <Link
                        href={`/library/artists/${encodeURIComponent(currentSong.artistId)}`}
                        onClick={handleClose}
                        className="line-clamp-1 text-base swift-subtitle transition hover:text-[var(--accent)]"
                      >
                        {currentSong.artist || "Unknown Artist"}
                      </Link>
                    ) : (
                      <p className="line-clamp-1 text-base swift-subtitle">
                        {currentSong.artist || "Unknown Artist"}
                      </p>
                    )}
                  </div>
                  {currentSong.album ? (
                    <div className="mt-1 flex min-w-0 justify-center">
                      {currentSong.albumId ? (
                        <Link
                          href={`/library/albums/${encodeURIComponent(currentSong.albumId)}`}
                          onClick={handleClose}
                            className="now-playing-album line-clamp-1 text-sm swift-tertiary transition hover:text-[var(--accent)]"
                        >
                          {currentSong.album}
                        </Link>
                      ) : (
                        <p className="now-playing-album line-clamp-1 text-sm swift-tertiary">
                          {currentSong.album}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="now-playing-tabs mt-3 flex shrink-0 items-center justify-center gap-2">
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
                </div>

                <div className="now-playing-progress mt-3 sm:mt-5">
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

                <div className="now-playing-controls mt-4 flex shrink-0 items-center justify-center gap-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={previous}
                    className="now-playing-skip inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--accent)] transition-all duration-200 hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94]"
                  >
                    <SkipBack size={24} />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="now-playing-play inline-flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_18px_38px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.04] active:scale-[0.94]"
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
                    className="now-playing-skip inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--accent)] transition-all duration-200 hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94]"
                  >
                    <SkipForward size={24} />
                  </button>

                  <motion.div
                    layout
                    className={`now-playing-volume flex h-14 items-center justify-center overflow-visible rounded-full bg-[var(--soft-fill)] text-[var(--accent)] transition-colors duration-200 hover:bg-[var(--soft-fill-hover)] ${
                      isVolumeOpen ? "w-40 px-3" : "w-14"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setIsVolumeOpen((value) => !value)}
                      className="inline-flex h-14 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.04] active:scale-[0.94]"
                      aria-label="Volume"
                      aria-expanded={isVolumeOpen}
                    >
                      <Volume2 size={22} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isVolumeOpen ? (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 76 }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="flex h-8 items-center overflow-visible"
                        >
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="h-8 w-[76px] cursor-pointer accent-[var(--accent)]"
                            aria-label="Volume"
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                </div>
                </div>

              </div>
            </motion.div>
          </div>
          <AnimatePresence>
            {isLyricsFullscreen ? (
              <motion.div
                className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={() => setIsLyricsFullscreen(false)}
              >
                <div className="absolute inset-0 bg-black/45 backdrop-blur-2xl" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 18 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="player-glass relative flex h-[calc(100dvh-16px)] w-full max-w-[1120px] flex-col overflow-hidden rounded-[30px] p-4 sm:h-[min(860px,calc(100dvh-40px))] sm:rounded-[40px] sm:p-7"
                  onClick={(event) => event.stopPropagation()}
                >
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt=""
                      fill
                      unoptimized
                      className="pointer-events-none object-cover opacity-15 blur-3xl"
                    />
                  ) : null}
                  <div className="relative z-10 mb-4 flex shrink-0 items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black uppercase tracking-[0.24em] swift-tertiary">
                        Full Screen Lyrics
                      </div>
                      <div className="mt-1 line-clamp-1 text-xl font-black text-[var(--foreground)] sm:text-3xl">
                        {currentSong.title}
                      </div>
                      <div className="line-clamp-1 text-sm font-semibold swift-subtitle sm:text-base">
                        {currentSong.artist || "Unknown Artist"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLyricsFullscreen(false)}
                      className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--foreground)] transition hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94]"
                      aria-label="Close full screen lyrics"
                    >
                      <X size={21} />
                    </button>
                  </div>
                  <div className="relative z-10 min-h-0 flex-1">
                    <LyricsPanel
                      lyrics={lyrics}
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      isLoading={lyricsLoading}
                      fullscreen
                    />
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
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
  icon: ReactNode;
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
  isPlaying,
  isLoading,
  fullscreen = false,
  onExpand,
}: {
  lyrics?: LyricsPayload;
  currentTime: number;
  isPlaying: boolean;
  isLoading: boolean;
  fullscreen?: boolean;
  onExpand?: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const resumeFollowTimer = useRef<number | null>(null);
  const [userScrolling, setUserScrolling] = useState(false);
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

  useEffect(() => {
    return () => {
      if (resumeFollowTimer.current) {
        window.clearTimeout(resumeFollowTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || userScrolling || currentLineIndex < 0) return;
    lineRefs.current[currentLineIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentLineIndex, isPlaying, userScrolling]);

  function handleLyricsScroll() {
    if (!isPlaying) return;
    setUserScrolling(true);
    if (resumeFollowTimer.current) {
      window.clearTimeout(resumeFollowTimer.current);
    }
    resumeFollowTimer.current = window.setTimeout(() => {
      setUserScrolling(false);
    }, 3200);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
        <h3 className={fullscreen ? "text-2xl font-black text-[var(--foreground)] sm:text-4xl" : "text-xl font-black text-[var(--foreground)] sm:text-2xl"}>
          Lyrics
        </h3>
        <div className="flex items-center gap-2">
          {lyrics?.source && lyrics.source !== "none" ? (
            <div className="rounded-full bg-[var(--soft-fill)] px-3 py-2 text-xs font-bold uppercase tracking-wide swift-subtitle">
              {lyrics.source}
            </div>
          ) : null}
          {onExpand ? (
            <button
              type="button"
              onClick={onExpand}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
              aria-label="Open full screen lyrics"
            >
              <Maximize2 size={16} />
            </button>
          ) : null}
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm swift-subtitle">
          Loading lyrics...
        </div>
      ) : synced.length ? (
        <div
          ref={scrollerRef}
          onScroll={handleLyricsScroll}
          className={`scrollbar-subtle -mx-2 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 ${
            fullscreen ? "gap-4 py-[24dvh] sm:gap-6" : "gap-2 py-8"
          }`}
        >
          {synced.map((line, index) => {
            const isCurrent = index === currentLineIndex;
            const isPast = index < currentLineIndex;

            return (
              <motion.button
                key={`${line.time}-${index}`}
                ref={(node) => {
                  lineRefs.current[index] = node;
                }}
                type="button"
                onClick={() => dispatchSeek(line.time)}
                animate={{
                  opacity: isCurrent ? 1 : isPast ? 0.58 : 0.42,
                  scale: isCurrent ? (fullscreen ? 1.08 : 1.055) : 1,
                  y: isCurrent ? -1 : 0,
                }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`px-3 py-1 text-center leading-snug transition-colors ${
                  fullscreen ? "text-2xl sm:text-4xl lg:text-5xl" : "text-lg sm:text-xl"
                } ${
                  isCurrent
                    ? "font-black text-[var(--foreground)]"
                    : isPast
                      ? "font-bold text-[var(--muted)]"
                      : "font-semibold text-[var(--muted-2)]"
                }`}
              >
                {line.text}
              </motion.button>
            );
          })}
        </div>
      ) : lyrics?.plain?.trim() ? (
        <div
          className={`scrollbar-subtle min-h-0 flex-1 overflow-y-auto whitespace-pre-line text-center font-bold leading-relaxed text-[var(--foreground)] ${
            fullscreen ? "px-2 py-8 text-2xl sm:text-4xl" : "text-lg"
          }`}
        >
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
  function handleQueueKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    absoluteIndex: number
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIndex(absoluteIndex);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-[var(--foreground)] sm:text-2xl">Up Next</h3>
          <p className="text-sm font-semibold swift-subtitle">
            Tap a song to jump ahead.
          </p>
        </div>
        <div className="rounded-full bg-[var(--soft-fill)] px-3 py-2 text-sm font-bold swift-subtitle">
          {queue.length}
        </div>
      </div>

      {queue.length ? (
        <div className="scrollbar-subtle grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
          {queue.map((song, offset) => {
            const absoluteIndex = Math.max(currentIndex, 0) + offset;
            const isCurrent = offset === 0;

            return (
              <div
                key={`${song.id}-${absoluteIndex}`}
                role="button"
                tabIndex={0}
                onClick={() => setIndex(absoluteIndex)}
                onKeyDown={(event) => handleQueueKeyDown(event, absoluteIndex)}
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
                    {song.artistId ? (
                      <Link
                        href={`/library/artists/${encodeURIComponent(song.artistId)}`}
                        onClick={(event) => event.stopPropagation()}
                        className="hover:text-[var(--accent)]"
                      >
                        {song.artist || "Unknown Artist"}
                      </Link>
                    ) : (
                      song.artist || "Unknown Artist"
                    )}
                  </div>
                </div>
                <div className="text-xs font-semibold swift-tertiary">
                  {formatDuration(song.duration)}
                </div>
              </div>
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
