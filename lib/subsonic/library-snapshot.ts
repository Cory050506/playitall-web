import type { LibraryCatalog } from "@/lib/subsonic/library-catalog";

const SNAPSHOT_PREFIX = "play-it-all-library-snapshot";
const SNAPSHOT_MAX_AGE_MS = 12 * 60 * 60 * 1000;

type CachedLibraryCatalog = {
  savedAt: number;
  catalog: LibraryCatalog;
};

export function librarySnapshotKey(serverUrl: string, username: string) {
  return `${SNAPSHOT_PREFIX}:${serverUrl}:${username}`;
}

export function loadLibrarySnapshot(key: string) {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;

    const cached = JSON.parse(raw) as CachedLibraryCatalog;
    if (!cached.catalog || !cached.savedAt) return undefined;

    return cached;
  } catch {
    return undefined;
  }
}

export function loadFreshLibrarySnapshot(key: string) {
  const cached = loadLibrarySnapshot(key);
  if (!cached) return undefined;

  const isFresh = Date.now() - cached.savedAt < SNAPSHOT_MAX_AGE_MS;
  return isFresh ? cached : undefined;
}

export function saveLibrarySnapshot(key: string, catalog: LibraryCatalog) {
  if (typeof window === "undefined") return;

  try {
    const cached: CachedLibraryCatalog = {
      savedAt: Date.now(),
      catalog,
    };
    window.localStorage.setItem(key, JSON.stringify(cached));
  } catch {
    // Storage can be unavailable or full; the app can still use in-memory data.
  }
}

export function clearLibrarySnapshot(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}
