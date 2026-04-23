"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Airplay,
  MonitorCog,
  Moon,
  Paintbrush,
  SlidersHorizontal,
  Sparkles,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePreferencesStore } from "@/stores/preferences-store";
import { EQUALIZER_OPTIONS } from "@/lib/equalizer-presets";

function requestCast() {
  window.dispatchEvent(new CustomEvent("play-it-all-cast"));
}

export function TopControls() {
  const [open, setOpen] = useState(false);
  const mode = usePreferencesStore((s) => s.mode);
  const setMode = usePreferencesStore((s) => s.setMode);
  const equalizerPreset = usePreferencesStore((s) => s.equalizerPreset);
  const setEqualizerPreset = usePreferencesStore((s) => s.setEqualizerPreset);

  function toggleMode() {
    setMode(mode === "dark" ? "light" : "dark");
  }

  return (
    <div className="mobile-top-controls fixed right-3 top-3 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={requestCast}
        className="player-glass inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-[var(--foreground)] transition hover:scale-[1.04] active:scale-[0.94] sm:px-4"
        aria-label="Open Cast or AirPlay picker"
        title="Open Cast or AirPlay picker"
      >
        <Airplay size={18} />
        <span className="hidden sm:inline">Cast</span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="player-glass inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-[var(--foreground)] transition hover:scale-[1.02] active:scale-[0.98] sm:px-4"
          aria-label="Quick settings"
          aria-expanded={open}
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Quick</span>
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute right-0 top-14 w-64 overflow-hidden rounded-[22px] border border-[var(--hairline)] bg-[var(--player-surface-strong)] p-2 shadow-[0_18px_44px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
            >
              <button
                type="button"
                onClick={toggleMode}
                className="flex h-12 w-full items-center justify-between rounded-[16px] px-3 text-left text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
              >
                <span className="inline-flex items-center gap-3">
                  {mode === "dark" ? <Moon size={17} /> : <Sun size={17} />}
                  {mode === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
                <span className="text-xs swift-tertiary">Toggle</span>
              </button>

              <div className="rounded-[16px] px-3 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-3 text-sm font-bold text-[var(--foreground)]">
                    <Sparkles size={17} />
                    Equalizer
                  </span>
                  <span className="text-xs capitalize swift-tertiary">
                    {equalizerPreset.replace("-", " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {EQUALIZER_OPTIONS.slice(0, 6).map((option) => {
                    const active = option.value === equalizerPreset;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setEqualizerPreset(option.value)}
                        className={`h-9 cursor-pointer rounded-full px-3 text-xs font-bold transition ${
                          active
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--soft-fill)] text-[var(--foreground)] hover:bg-[var(--soft-fill-hover)]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <Link
                  href="/settings/quality"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex h-10 items-center justify-center rounded-full bg-[var(--soft-fill)] text-xs font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
                >
                  More presets
                </Link>
              </div>

              <Link
                href="/settings/appearance"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center gap-3 rounded-[16px] px-3 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
              >
                <Paintbrush size={17} />
                Appearance
              </Link>

              <Link
                href="/settings/library"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center gap-3 rounded-[16px] px-3 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
              >
                <MonitorCog size={17} />
                Library Settings
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
