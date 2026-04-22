import type { SubsonicClient } from "@/lib/subsonic/client";
import type { AlbumID3, Genre, Playlist, Song } from "@/lib/subsonic/types";

const ALBUM_PAGE_SIZE = 500;
const GENRE_PAGE_SIZE = 500;
const ALBUM_DETAIL_CONCURRENCY = 24;

type AlbumListType = "newest" | "recent" | "random" | "alphabeticalByName";

export type LibraryCatalog = {
  albums: AlbumID3[];
  songs: Song[];
  genres: Genre[];
  playlists: Playlist[];
  artistCount: number;
  partialAlbumSongFailures: number;
};

export async function fetchAllAlbums(
  client: SubsonicClient,
  type: AlbumListType = "alphabeticalByName"
) {
  const albums: AlbumID3[] = [];
  const seen = new Set<string>();

  for (let offset = 0; offset < 50_000; offset += ALBUM_PAGE_SIZE) {
    const res = await client.getAlbumList2(type, ALBUM_PAGE_SIZE, offset);
    const page = res["subsonic-response"]?.albumList2?.album ?? [];

    for (const album of page) {
      if (!seen.has(album.id)) {
        seen.add(album.id);
        albums.push(album);
      }
    }

    if (page.length < ALBUM_PAGE_SIZE) break;
  }

  return albums;
}

export async function fetchAllSongsForAlbums(
  client: SubsonicClient,
  albums: AlbumID3[]
) {
  const songs: Song[] = [];
  const seen = new Set<string>();
  let failures = 0;

  for (let i = 0; i < albums.length; i += ALBUM_DETAIL_CONCURRENCY) {
    const batch = albums.slice(i, i + ALBUM_DETAIL_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((album) => client.getAlbum(album.id))
    );

    for (const result of results) {
      if (result.status === "rejected") {
        failures += 1;
        continue;
      }

      const albumSongs =
        result.value["subsonic-response"]?.album?.song?.filter(
          (song) => !song.isDir
        ) ?? [];

      for (const song of sortAlbumSongs(albumSongs)) {
        if (!seen.has(song.id)) {
          seen.add(song.id);
          songs.push(song);
        }
      }
    }
  }

  return { songs: sortSongs(songs), failures };
}

export async function fetchSongsByGenrePaged(
  client: SubsonicClient,
  genre: string
) {
  const songs: Song[] = [];
  const seen = new Set<string>();

  for (let offset = 0; offset < 50_000; offset += GENRE_PAGE_SIZE) {
    const res = await client.getSongsByGenre(genre, GENRE_PAGE_SIZE, offset);
    const page = res["subsonic-response"]?.songsByGenre?.song ?? [];

    for (const song of page) {
      if (!seen.has(song.id)) {
        seen.add(song.id);
        songs.push(song);
      }
    }

    if (page.length < GENRE_PAGE_SIZE) break;
  }

  return songs;
}

function sortAlbumSongs(songs: Song[]) {
  return [...songs].sort((a, b) => {
    const discA = a.discNumber ?? 0;
    const discB = b.discNumber ?? 0;
    if (discA !== discB) return discA - discB;

    const trackA = a.track ?? 0;
    const trackB = b.track ?? 0;
    if (trackA !== trackB) return trackA - trackB;

    return a.title.localeCompare(b.title);
  });
}

function sortSongs(songs: Song[]) {
  return [...songs].sort((a, b) => {
    const title = a.title.localeCompare(b.title);
    if (title !== 0) return title;
    return (a.artist ?? "").localeCompare(b.artist ?? "");
  });
}

export async function fetchLibraryCatalog(client: SubsonicClient) {
  const [albums, indexesRes, playlistsRes, genresRes] = await Promise.all([
    fetchAllAlbums(client, "alphabeticalByName"),
    client.getIndexes(),
    client.getPlaylists(),
    client.getGenres(),
  ]);

  const indexes = indexesRes["subsonic-response"]?.indexes?.index ?? [];
  const playlists = playlistsRes["subsonic-response"]?.playlists?.playlist ?? [];
  const genres = genresRes["subsonic-response"]?.genres?.genre ?? [];
  const artistCount = indexes.reduce((sum, group) => {
    return sum + (group.artist?.length ?? 0);
  }, 0);

  const { songs, failures } = await fetchAllSongsForAlbums(client, albums);

  return {
    albums,
    songs,
    genres,
    playlists,
    artistCount,
    partialAlbumSongFailures: failures,
  } satisfies LibraryCatalog;
}
