"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useLibraryCatalog } from "@/lib/subsonic/queries";
import {
  librarySnapshotKey,
  loadFreshLibrarySnapshot,
} from "@/lib/subsonic/library-snapshot";
import { useSessionStore } from "@/stores/session-store";

export function LibraryWarmupProvider() {
  const pathname = usePathname();
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const isConnected = useSessionStore((s) => s.isConnected);
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);

  const snapshotKey =
    serverUrl && username ? librarySnapshotKey(serverUrl, username) : null;

  const hasFreshSnapshot = useMemo(() => {
    if (!snapshotKey) return false;
    return Boolean(loadFreshLibrarySnapshot(snapshotKey));
  }, [snapshotKey]);

  const warmupEnabled =
    hasHydrated &&
    isConnected &&
    pathname !== "/login" &&
    pathname !== "/settings/offline";

  const libraryQuery = useLibraryCatalog(warmupEnabled);
  const showOverlay =
    warmupEnabled &&
    !hasFreshSnapshot &&
    (libraryQuery.isPending || libraryQuery.isFetching);

  if (!showOverlay) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(9,10,14,0.78)] px-5 backdrop-blur-xl">
      <div className="player-glass w-full max-w-[420px] rounded-[30px] p-6 text-center sm:p-7">
        <div className="text-sm font-semibold uppercase tracking-[0.22em] swift-tertiary">
          Preparing Library
        </div>
        <h2 className="mt-3 text-2xl font-black text-[var(--foreground)] sm:text-3xl">
          Loading your songs
        </h2>
        <p className="mt-3 text-sm leading-relaxed swift-subtitle sm:text-base">
          We’re pulling in your full library now so songs, artists, albums, queueing,
          and related playback are ready right away.
        </p>

        <div className="mt-6 overflow-hidden rounded-full bg-[var(--soft-fill)] p-1">
          <div className="relative h-3 overflow-hidden rounded-full bg-[var(--range-track)]">
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-[var(--accent)]"
              animate={{ x: ["-15%", "115%"] }}
              transition={{ duration: 1.25, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </div>

        <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] swift-tertiary">
          This can take a moment on bigger libraries.
        </div>
      </div>
    </div>
  );
}
