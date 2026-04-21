"use client";

import { useMemo } from "react";
import { SubsonicClient } from "@/lib/subsonic/client";
import { useSessionStore } from "@/stores/session-store";

export function useDownloadUrl(songId?: string | null) {
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);
  const password = useSessionStore((s) => s.password);

  return useMemo(() => {
    if (!songId || !serverUrl || !username || !password) return null;

    const client = new SubsonicClient({
      serverUrl,
      username,
      password,
    });

    return client.getDownloadUrl(songId);
  }, [songId, serverUrl, username, password]);
}
