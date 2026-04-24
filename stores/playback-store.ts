"use client";

import { create } from "zustand";
import type { Song } from "@/lib/subsonic/types";

type PlaybackState = {
  queue: Song[];
  originalQueue: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isQueueShuffled: boolean;

  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  setQueue: (
    songs: Song[],
    startIndex?: number,
    options?: { originalQueue?: Song[]; isShuffled?: boolean }
  ) => void;
  playSong: (song: Song, queue?: Song[]) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;

  next: () => void;
  previous: () => void;

  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;

  setIndex: (index: number) => void;
  appendToQueue: (songs: Song[]) => void;
  toggleQueueShuffle: () => void;
};

function shuffleSongs(songs: Song[]) {
  const shuffled = [...songs];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export const usePlaybackStore = create<PlaybackState>()((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  currentSong: null,
  isQueueShuffled: false,

  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,

  setQueue: (songs, startIndex = 0, options) => {
    const safeIndex =
      songs.length === 0 ? -1 : Math.max(0, Math.min(startIndex, songs.length - 1));

    set({
      queue: songs,
      originalQueue: options?.originalQueue ?? songs,
      currentIndex: safeIndex,
      currentSong: safeIndex >= 0 ? songs[safeIndex] : null,
      isQueueShuffled: options?.isShuffled ?? false,
      currentTime: 0,
      duration: 0,
      isPlaying: safeIndex >= 0,
    });
  },

  playSong: (song, queue) => {
    if (queue && queue.length > 0) {
      const index = queue.findIndex((item) => item.id === song.id);
      set({
        queue,
        originalQueue: queue,
        currentIndex: index >= 0 ? index : 0,
        currentSong: song,
        isQueueShuffled: false,
        currentTime: 0,
        duration: 0,
        isPlaying: true,
      });
      return;
    }

    set({
      queue: [song],
      originalQueue: [song],
      currentIndex: 0,
      currentSong: song,
      isQueueShuffled: false,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const { queue, currentIndex } = get();
    if (!queue.length) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) return;

    set({
      currentIndex: nextIndex,
      currentSong: queue[nextIndex],
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    });
  },

  previous: () => {
    const { queue, currentIndex, currentTime } = get();
    if (!queue.length) return;

    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      set({ currentTime: 0 });
      return;
    }

    set({
      currentIndex: prevIndex,
      currentSong: queue[prevIndex],
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setIndex: (index) => {
    const { queue } = get();
    if (index < 0 || index >= queue.length) return;

    set({
      currentIndex: index,
      currentSong: queue[index],
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    });
  },
  appendToQueue: (songs) => {
    if (!songs.length) return;

    set((state) => {
      const seen = new Set(state.queue.map((song) => song.id));
      const additions = songs.filter((song) => !seen.has(song.id));
      if (!additions.length) {
        return state;
      }

      return {
        queue: [...state.queue, ...additions],
        originalQueue: [...state.originalQueue, ...additions],
      };
    });
  },
  toggleQueueShuffle: () => {
    const state = get();
    if (!state.queue.length || !state.currentSong) return;

    const sourceQueue = state.originalQueue.length ? state.originalQueue : state.queue;
    const currentSongId = state.currentSong.id;
    const originalIndex = sourceQueue.findIndex((song) => song.id === currentSongId);

    if (state.isQueueShuffled) {
      const restoredIndex = originalIndex >= 0 ? originalIndex : state.currentIndex;
      set({
        queue: sourceQueue,
        currentIndex: restoredIndex,
        currentSong: restoredIndex >= 0 ? sourceQueue[restoredIndex] : state.currentSong,
        isQueueShuffled: false,
      });
      return;
    }

    if (originalIndex < 0) {
      set({
        queue: shuffleSongs(state.queue),
        originalQueue: state.queue,
        currentIndex: 0,
        currentSong: state.currentSong,
        isQueueShuffled: true,
      });
      return;
    }

    const beforeCurrent = sourceQueue.slice(0, originalIndex);
    const afterCurrent = shuffleSongs(sourceQueue.slice(originalIndex + 1));
    const nextQueue = [...beforeCurrent, state.currentSong, ...afterCurrent];

    set({
      queue: nextQueue,
      originalQueue: sourceQueue,
      currentIndex: beforeCurrent.length,
      currentSong: state.currentSong,
      isQueueShuffled: true,
    });
  },
}));
