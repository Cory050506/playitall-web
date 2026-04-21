"use client";

import { useMemo } from "react";
import { SubsonicClient } from "@/lib/subsonic/client";
import { useSessionStore } from "@/stores/session-store";

export function useCoverArtUrl(coverArtId?: string, size = 500) {
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);
  const password = useSessionStore((s) => s.password);

  return useMemo(() => {
    if (!coverArtId || !serverUrl || !username || !password) return null;

    const client = new SubsonicClient({
      serverUrl,
      username,
      password,
    });

    return client.getCoverArtUrl(coverArtId, size);
  }, [coverArtId, size, serverUrl, username, password]);
}