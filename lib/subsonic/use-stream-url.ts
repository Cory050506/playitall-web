"use client";

import { useMemo } from "react";
import { SubsonicClient } from "@/lib/subsonic/client";
import { isElectronRuntime } from "@/lib/runtime";
import { useSessionStore } from "@/stores/session-store";
import { usePreferencesStore } from "@/stores/preferences-store";

export function useStreamUrl(songId?: string | null) {
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);
  const password = useSessionStore((s) => s.password);

  const enableTranscoding = usePreferencesStore((s) => s.enableTranscoding);
  const preferredBitrate = usePreferencesStore((s) => s.preferredBitrate);

  return useMemo(() => {
    if (!songId || !serverUrl || !username || !password) return null;

    const client = new SubsonicClient({
      serverUrl,
      username,
      password,
    });

    let maxBitRate: number | undefined = undefined;

    if (enableTranscoding && preferredBitrate !== "auto") {
      maxBitRate = Number(preferredBitrate);
    }

    const directStreamUrl = client.getStreamUrl(songId, maxBitRate);

    return isElectronRuntime()
      ? directStreamUrl
      : `/api/stream?url=${encodeURIComponent(directStreamUrl)}`;
  }, [
    songId,
    serverUrl,
    username,
    password,
    enableTranscoding,
    preferredBitrate,
  ]);
}
