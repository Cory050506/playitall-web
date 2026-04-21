import type { AlbumID3, ArtistID3, Genre, Playlist, Song } from "@/lib/subsonic/types";

export type LibrarySortOption =
  | "default"
  | "recentlyAdded"
  | "titleAZ"
  | "titleZA"
  | "artistAZ"
  | "albumAZ"
  | "durationShort"
  | "durationLong";

export type SortOptionItem = {
  value: LibrarySortOption;
  label: string;
};

export const trackSortOptions: SortOptionItem[] = [
  { value: "default", label: "Default" },
  { value: "recentlyAdded", label: "Recently Added" },
  { value: "titleAZ", label: "Title A-Z" },
  { value: "titleZA", label: "Title Z-A" },
  { value: "artistAZ", label: "Artist" },
  { value: "albumAZ", label: "Album" },
  { value: "durationShort", label: "Shortest" },
  { value: "durationLong", label: "Longest" },
];

export const albumSortOptions: SortOptionItem[] = [
  { value: "default", label: "Default" },
  { value: "recentlyAdded", label: "Recently Added" },
  { value: "titleAZ", label: "Title A-Z" },
  { value: "titleZA", label: "Title Z-A" },
  { value: "artistAZ", label: "Artist" },
];

export const titleSortOptions: SortOptionItem[] = [
  { value: "default", label: "Default" },
  { value: "titleAZ", label: "Title A-Z" },
  { value: "titleZA", label: "Title Z-A" },
];

export function sortSongs(songs: Song[], option: LibrarySortOption) {
  return stableSort(songs, option, (song) => ({
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: song.duration,
    created: song.created,
  }));
}

export function sortAlbums(albums: AlbumID3[], option: LibrarySortOption) {
  return stableSort(albums, option, (album) => ({
    title: album.name,
    artist: album.artist,
    album: album.name,
    duration: album.duration,
    created: album.created,
  }));
}

export function sortArtists(artists: ArtistID3[], option: LibrarySortOption) {
  return stableSort(artists, option, (artist) => ({
    title: artist.name,
  }));
}

export function sortGenres(genres: Genre[], option: LibrarySortOption) {
  return stableSort(genres, option, (genre) => ({
    title: genre.value ?? "Unknown",
  }));
}

export function sortPlaylists(playlists: Playlist[], option: LibrarySortOption) {
  return stableSort(playlists, option, (playlist) => ({
    title: playlist.name,
    duration: playlist.duration,
  }));
}

function stableSort<T>(
  items: T[],
  option: LibrarySortOption,
  values: (item: T) => {
    title: string;
    artist?: string;
    album?: string;
    duration?: number;
    created?: string;
  }
) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const left = values(a.item);
      const right = values(b.item);
      let result = 0;

      switch (option) {
        case "recentlyAdded":
          result =
            Date.parse(right.created ?? "") - Date.parse(left.created ?? "");
          break;
        case "titleAZ":
          result = compareText(left.title, right.title);
          break;
        case "titleZA":
          result = compareText(right.title, left.title);
          break;
        case "artistAZ":
          result =
            compareText(left.artist ?? "", right.artist ?? "") ||
            compareText(left.title, right.title);
          break;
        case "albumAZ":
          result =
            compareText(left.album ?? "", right.album ?? "") ||
            compareText(left.title, right.title);
          break;
        case "durationShort":
          result = (left.duration ?? Number.MAX_SAFE_INTEGER) - (right.duration ?? Number.MAX_SAFE_INTEGER);
          break;
        case "durationLong":
          result = (right.duration ?? 0) - (left.duration ?? 0);
          break;
        case "default":
          result = 0;
      }

      return result || a.index - b.index;
    })
    .map(({ item }) => item);
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}
