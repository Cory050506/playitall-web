import { useQuery } from "@tanstack/react-query";
import { SubsonicClient } from "@/lib/subsonic/client";
import {
  fetchAllAlbums,
  fetchLibraryCatalog,
  fetchSongsByGenrePaged,
} from "@/lib/subsonic/library-catalog";
import {
  librarySnapshotKey,
  loadFreshLibrarySnapshot,
  saveLibrarySnapshot,
} from "@/lib/subsonic/library-snapshot";
import {
  emptyLyrics,
  plainFromSynced,
  type LyricsPayload,
  type SyncedLyricLine,
} from "@/lib/lyrics";
import { useSessionStore } from "@/stores/session-store";

const LIBRARY_STALE_TIME = 12 * 60 * 60 * 1000;

function useClient() {
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);
  const password = useSessionStore((s) => s.password);

  if (!serverUrl || !username || !password) {
    return null;
  }

  return new SubsonicClient({
    serverUrl,
    username,
    password,
  });
}

export function useNewestAlbums() {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "albums", "newest"],
    enabled: !!client,
    queryFn: async () => {
      if (!client) throw new Error("No client");
      const res = await client.getAlbumList2("newest", 24, 0);
      return res["subsonic-response"]?.albumList2?.album ?? [];
    },
  });
}

export function useAlbums(
  type: "newest" | "recent" | "random" | "alphabeticalByName" = "alphabeticalByName",
  size?: number,
  enabled = true
) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "albums", type, size],
    staleTime: LIBRARY_STALE_TIME,
    enabled: enabled && !!client,
    queryFn: async () => {
      if (!client) throw new Error("No client");
      if (size) {
      const res = await client.getAlbumList2(type, size, 0);
      return res["subsonic-response"]?.albumList2?.album ?? [];
      }
      return fetchAllAlbums(client, type);
    },
  });
}

export function useLibraryCatalog(enabled = true) {
  const client = useClient();
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);
  const snapshotKey =
    serverUrl && username ? librarySnapshotKey(serverUrl, username) : null;
  const cachedSnapshot = snapshotKey
    ? loadFreshLibrarySnapshot(snapshotKey)
    : undefined;

  return useQuery({
    queryKey: ["subsonic", "library-catalog"],
    staleTime: LIBRARY_STALE_TIME,
    enabled: enabled && !!client,
    initialData: cachedSnapshot?.catalog,
    initialDataUpdatedAt: cachedSnapshot?.savedAt,
    queryFn: async () => {
      if (!client) throw new Error("No client");
      const catalog = await fetchLibraryCatalog(client);
      if (snapshotKey) saveLibrarySnapshot(snapshotKey, catalog);
      return catalog;
    },
  });
}

export function useAllSongs(enabled = true) {
  const catalog = useLibraryCatalog(enabled);

  return {
    ...catalog,
    data: catalog.data?.songs ?? [],
  };
}

export function useAlbum(id?: string) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "album", id],
    enabled: !!client && !!id,
    queryFn: async () => {
      if (!client || !id) throw new Error("No album");
      const res = await client.getAlbum(id);
      return res["subsonic-response"]?.album ?? null;
    },
  });
}

export function useArtist(id?: string) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "artist", id],
    enabled: !!client && !!id,
    queryFn: async () => {
      if (!client || !id) throw new Error("No artist");
      const res = await client.getArtist(id);
      return res["subsonic-response"]?.artist ?? null;
    },
  });
}

export function useRandomSongs() {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "songs", "random"],
    enabled: !!client,
    queryFn: async () => {
      if (!client) throw new Error("No client");
      const res = await client.getRandomSongs(18);
      return res["subsonic-response"]?.randomSongs?.song ?? [];
    },
  });
}

export function usePlaylists(enabled = true) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "playlists"],
    enabled: enabled && !!client,
    queryFn: async () => {
      if (!client) throw new Error("No client");
      const res = await client.getPlaylists();
      return res["subsonic-response"]?.playlists?.playlist ?? [];
    },
  });
}

export function usePlaylist(id?: string) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "playlist", id],
    enabled: !!client && !!id,
    queryFn: async () => {
      if (!client || !id) throw new Error("No playlist");
      const res = await client.getPlaylist(id);
      return res["subsonic-response"]?.playlist ?? null;
    },
  });
}

export function useGenres(enabled = true) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "genres"],
    enabled: enabled && !!client,
    queryFn: async () => {
      if (!client) throw new Error("No client");
      const res = await client.getGenres();
      return res["subsonic-response"]?.genres?.genre ?? [];
    },
  });
}

export function useSongsByGenre(genre?: string) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "songs-by-genre", genre],
    staleTime: LIBRARY_STALE_TIME,
    enabled: !!client && !!genre,
    queryFn: async () => {
      if (!client || !genre) throw new Error("No genre");
      return fetchSongsByGenrePaged(client, genre);
    },
  });
}

export function useArtistIndexes(enabled = true) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "artist-indexes"],
    enabled: enabled && !!client,
    queryFn: async () => {
      if (!client) throw new Error("No client");
      const res = await client.getIndexes();
      return res["subsonic-response"]?.indexes?.index ?? [];
    },
  });
}

export function useLibraryStats() {
  const catalog = useLibraryCatalog();

  return {
    ...catalog,
    data: catalog.data
      ? {
          songCount: catalog.data.songs.length,
          albumCount: catalog.data.albums.length,
          artistCount: catalog.data.artistCount,
          genreCount: catalog.data.genres.length,
          playlistCount: catalog.data.playlists.length,
          downloadCount: 0,
          partialAlbumSongFailures: catalog.data.partialAlbumSongFailures,
        }
      : undefined,
  };
}

export function useSearch(query: string) {
  const client = useClient();

  return useQuery({
    queryKey: ["subsonic", "search3", query],
    enabled: !!client && query.trim().length > 0,
    queryFn: async () => {
      if (!client) throw new Error("No client");
      const res = await client.search3(query);
      return {
        artists: res["subsonic-response"]?.searchResult3?.artist ?? [],
        albums: res["subsonic-response"]?.searchResult3?.album ?? [],
        songs: res["subsonic-response"]?.searchResult3?.song ?? [],
      };
    },
  });
}

export function useLyrics(
  songId?: string,
  artist?: string,
  title?: string,
  album?: string,
  duration?: number
) {
  const client = useClient();

  return useQuery({
    queryKey: ["lyrics", songId, artist, title, album, duration],
    enabled: !!client && (!!songId || (!!artist && !!title)),
    staleTime: LIBRARY_STALE_TIME,
    queryFn: async () => {
      if (!client) throw new Error("No client");

      if (songId) {
        try {
          const byId = await client.getLyricsBySongId(songId);
          const structuredLines =
            byId["subsonic-response"]?.lyricsList?.structuredLyrics?.[0]?.line ?? [];
          const synced = structuredLines
            .map((line) => ({
              text: line.value?.trim() ?? "",
              time: normalizeLyricStart(line.start),
            }))
            .filter((line): line is SyncedLyricLine => {
              return line.text.length > 0 && line.time !== null;
            });

          if (synced.length) {
            return {
              plain: plainFromSynced(synced),
              synced,
              source: "subsonic",
            } satisfies LyricsPayload;
          }
        } catch {
          // Older Subsonic servers may not support getLyricsBySongId.
        }
      }

      if (!artist || !title) return emptyLyrics();

      try {
        const lyrics = await client.getLyrics(artist, title);
        const plain = lyrics["subsonic-response"]?.lyrics?.value?.trim() ?? "";
        if (plain) {
          return {
            plain,
            synced: [],
            source: "subsonic",
          } satisfies LyricsPayload;
        }
      } catch {
        // Continue to LRCLIB fallback.
      }

      const params = new URLSearchParams({
        track_name: title,
        artist_name: artist,
      });
      if (album) params.set("album_name", album);
      if (duration) params.set("duration", String(duration));

      const response = await fetch(`/api/lrclib?${params.toString()}`);
      if (!response.ok) return emptyLyrics();

      return (await response.json()) as LyricsPayload;
    },
  });
}

function normalizeLyricStart(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  return value > 1000 ? value / 1000 : value;
}
