export type SyncedLyricLine = {
  time: number;
  text: string;
};

export type LyricsPayload = {
  plain: string;
  synced: SyncedLyricLine[];
  source: "subsonic" | "lrclib" | "none";
};

export function emptyLyrics(): LyricsPayload {
  return {
    plain: "",
    synced: [],
    source: "none",
  };
}

export function parseLrc(value: string) {
  const lines: SyncedLyricLine[] = [];
  const pattern = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)/g;

  for (const rawLine of value.split(/\r?\n/)) {
    pattern.lastIndex = 0;
    const matches = [...rawLine.matchAll(pattern)];
    if (!matches.length) continue;

    for (const match of matches) {
      const minutes = Number(match[1] ?? 0);
      const seconds = Number(match[2] ?? 0);
      const fraction = match[3] ?? "0";
      const fractionSeconds = Number(fraction.padEnd(3, "0").slice(0, 3)) / 1000;
      const text = (match[4] ?? "").trim();

      if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) continue;

      lines.push({
        time: minutes * 60 + seconds + fractionSeconds,
        text,
      });
    }
  }

  return lines
    .filter((line) => line.text.length > 0)
    .sort((a, b) => a.time - b.time);
}

export function plainFromSynced(lines: SyncedLyricLine[]) {
  return lines.map((line) => line.text).join("\n");
}
