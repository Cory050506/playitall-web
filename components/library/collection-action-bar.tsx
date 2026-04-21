"use client";

import { Download, Play, Shuffle } from "lucide-react";

type CollectionActionBarProps = {
  onPlay: () => void;
  onShuffle: () => void;
  onDownload?: () => void;
  disabled?: boolean;
  downloadDisabled?: boolean;
};

export function CollectionActionBar({
  onPlay,
  onShuffle,
  onDownload,
  disabled = false,
  downloadDisabled = false,
}: CollectionActionBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex">
      <button
        type="button"
        onClick={onPlay}
        disabled={disabled}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(0,0,0,0.14)] transition hover:brightness-105 disabled:opacity-45"
      >
        <Play size={17} fill="currentColor" />
        Play
      </button>
      <button
        type="button"
        onClick={onShuffle}
        disabled={disabled}
        className="liquid-glass inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[var(--foreground)] transition disabled:opacity-45"
      >
        <Shuffle size={17} />
        Shuffle
      </button>
      {onDownload ? (
        <button
          type="button"
          onClick={onDownload}
          disabled={downloadDisabled}
          className="liquid-glass col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[var(--foreground)] transition disabled:opacity-45 sm:col-span-1"
        >
          <Download size={17} />
          Download
        </button>
      ) : null}
    </div>
  );
}
