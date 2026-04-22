"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EqualizerPreset } from "@/lib/equalizer-presets";

export type AccentOption =
  | "sunset"
  | "ocean"
  | "lime"
  | "rose"
  | "blue"
  | "green"
  | "violet";

export type AppearanceMode = "system" | "dark" | "light";
export type TextSizeOption = "small" | "medium" | "large" | "extra-large";
export type ArtworkStyle = "rounded" | "square" | "soft";
export type LibraryLayout = "list" | "grid";
export type PreferredFormat = "original" | "mp3" | "aac" | "opus";
export type PreferredBitrate = "auto" | "96" | "128" | "192" | "256" | "320";
export type OfflineSaveAs = "original" | "mp3-cache";

type PreferencesState = {
  accent: AccentOption;
  mode: AppearanceMode;
  textSize: TextSizeOption;
  artworkStyle: ArtworkStyle;
  higherContrastCards: boolean;
  waveformMotion: boolean;
  sidebarCollapsed: boolean;

  libraryLayout: LibraryLayout;

  enableTranscoding: boolean;
  preferredFormat: PreferredFormat;
  preferredBitrate: PreferredBitrate;
  equalizerPreset: EqualizerPreset;

  enableOfflineDownloads: boolean;
  offlineSaveAs: OfflineSaveAs;
  preferOfflineCopies: boolean;
  allowDownloadsOverCellular: boolean;
  offlineCacheGB: number;

  setAccent: (value: AccentOption) => void;
  setMode: (value: AppearanceMode) => void;
  setTextSize: (value: TextSizeOption) => void;
  setArtworkStyle: (value: ArtworkStyle) => void;
  setHigherContrastCards: (value: boolean) => void;
  setWaveformMotion: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;

  setLibraryLayout: (value: LibraryLayout) => void;

  setEnableTranscoding: (value: boolean) => void;
  setPreferredFormat: (value: PreferredFormat) => void;
  setPreferredBitrate: (value: PreferredBitrate) => void;
  setEqualizerPreset: (value: EqualizerPreset) => void;

  setEnableOfflineDownloads: (value: boolean) => void;
  setOfflineSaveAs: (value: OfflineSaveAs) => void;
  setPreferOfflineCopies: (value: boolean) => void;
  setAllowDownloadsOverCellular: (value: boolean) => void;
  setOfflineCacheGB: (value: number) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      accent: "sunset",
      mode: "system",
      textSize: "medium",
      artworkStyle: "rounded",
      higherContrastCards: false,
      waveformMotion: true,
      sidebarCollapsed: false,

      libraryLayout: "grid",

      enableTranscoding: true,
      preferredFormat: "original",
      preferredBitrate: "auto",
      equalizerPreset: "flat",

      enableOfflineDownloads: true,
      offlineSaveAs: "original",
      preferOfflineCopies: true,
      allowDownloadsOverCellular: false,
      offlineCacheGB: 8,

      setAccent: (value) => set({ accent: value }),
      setMode: (value) => set({ mode: value }),
      setTextSize: (value) => set({ textSize: value }),
      setArtworkStyle: (value) => set({ artworkStyle: value }),
      setHigherContrastCards: (value) => set({ higherContrastCards: value }),
      setWaveformMotion: (value) => set({ waveformMotion: value }),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

      setLibraryLayout: (value) => set({ libraryLayout: value }),

      setEnableTranscoding: (value) => set({ enableTranscoding: value }),
      setPreferredFormat: (value) => set({ preferredFormat: value }),
      setPreferredBitrate: (value) => set({ preferredBitrate: value }),
      setEqualizerPreset: (value) => set({ equalizerPreset: value }),

      setEnableOfflineDownloads: (value) => set({ enableOfflineDownloads: value }),
      setOfflineSaveAs: (value) => set({ offlineSaveAs: value }),
      setPreferOfflineCopies: (value) => set({ preferOfflineCopies: value }),
      setAllowDownloadsOverCellular: (value) =>
        set({ allowDownloadsOverCellular: value }),
      setOfflineCacheGB: (value) =>
        set({ offlineCacheGB: Math.max(1, Math.min(32, value)) }),
    }),
    {
      name: "play-it-all-preferences",
    }
  )
);
