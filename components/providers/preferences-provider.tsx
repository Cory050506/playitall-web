"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences-store";

const accentMap: Record<string, string> = {
  sunset: "#ff6a3d",
  ocean: "#1fa1e8",
  lime: "#78c940",
  rose: "#e85480",
};

const textSizeMap = {
  small: "15px",
  medium: "16px",
  large: "17px",
  "extra-large": "18px",
};

export function PreferencesProvider() {
  const accent = usePreferencesStore((s) => s.accent);
  const mode = usePreferencesStore((s) => s.mode);
  const textSize = usePreferencesStore((s) => s.textSize);
  const higherContrastCards = usePreferencesStore((s) => s.higherContrastCards);

  useEffect(() => {
    const root = document.documentElement;

    const normalizedAccent =
      accent === "blue"
        ? "ocean"
        : accent === "green"
          ? "lime"
          : accent === "violet"
            ? "rose"
            : accent;

    root.style.setProperty("--accent", accentMap[normalizedAccent]);
    root.style.setProperty("--app-text-size", textSizeMap[textSize]);

    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedDark =
      mode === "system" ? systemDark : mode === "dark";

    root.dataset.theme = resolvedDark ? "dark" : "light";
    root.dataset.contrast = higherContrastCards ? "high" : "normal";
  }, [accent, mode, textSize, higherContrastCards]);

  return null;
}
