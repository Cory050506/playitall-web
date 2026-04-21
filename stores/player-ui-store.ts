"use client";

import { create } from "zustand";

type PlayerUiState = {
  isNowPlayingOpen: boolean;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
};

export const usePlayerUiStore = create<PlayerUiState>()((set) => ({
  isNowPlayingOpen: false,
  openNowPlaying: () => set({ isNowPlayingOpen: true }),
  closeNowPlaying: () => set({ isNowPlayingOpen: false }),
}));