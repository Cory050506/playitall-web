"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlbumCard } from "@/components/home/album-card";
import { CollectionActionBar } from "@/components/library/collection-action-bar";
import { SortMenu } from "@/components/library/sort-menu";
import { SongRow } from "@/components/home/song-row";
import {
  useAlbums,
  useAllSongs,
  useArtistIndexes,
  useGenres,
  usePlaylists,
} from "@/lib/subsonic/queries";
import { formatDuration } from "@/lib/format";
import {
  albumSortOptions,
  sortAlbums,
  sortArtists,
  sortGenres,
  sortPlaylists,
  sortSongs,
  titleSortOptions,
  trackSortOptions,
  type LibrarySortOption,
} from "@/lib/library/sort";
import { usePlaybackStore } from "@/stores/playback-store";

const titles = {
  songs: {
    title: "Songs",
    subtitle: "A playable mix from your library",
  },
  albums: {
    title: "Albums",
    subtitle: "Album and release picks",
  },
  artists: {
    title: "Artists",
    subtitle: "Browse by artist",
  },
  genres: {
    title: "Genres",
    subtitle: "Tap into a mood",
  },
  playlists: {
    title: "Playlists",
    subtitle: "Saved playlists",
  },
  downloads: {
    title: "Downloads",
    subtitle: "Offline music",
  },
} as const;

type LibraryKind = keyof typeof titles;

const EMPTY_ARRAY: never[] = [];

export default function LibraryCollectionPage() {
  const params = useParams<{ kind: string }>();
  const [sort, setSort] = useState<LibrarySortOption>("default");
  const [status, setStatus] = useState<string | null>(null);
  const setQueue = usePlaybackStore((s) => s.setQueue);
  const kind = params.kind as LibraryKind;
  const isKnownKind = Boolean(titles[kind]);

  const needsCatalog =
    isKnownKind && ["songs", "albums", "artists", "genres"].includes(kind);

  const songsQuery = useAllSongs(needsCatalog);
  const albumsQuery = useAlbums(
    "alphabeticalByName",
    undefined,
    isKnownKind && kind === "albums"
  );
  const artistsQuery = useArtistIndexes(isKnownKind && kind === "artists");
  const genresQuery = useGenres(isKnownKind && kind === "genres");
  const playlistsQuery = usePlaylists(isKnownKind && kind === "playlists");

  if (!isKnownKind) notFound();

  const isLoading =
    (kind === "songs" && songsQuery.isLoading) ||
    (kind === "albums" && albumsQuery.isLoading) ||
    (kind === "artists" && artistsQuery.isLoading) ||
    (kind === "genres" && genresQuery.isLoading) ||
    (kind === "playlists" && playlistsQuery.isLoading);

  const hasError =
    (kind === "songs" && songsQuery.error) ||
    (kind === "albums" && albumsQuery.error) ||
    (kind === "artists" && artistsQuery.error) ||
    (kind === "genres" && genresQuery.error) ||
    (kind === "playlists" && playlistsQuery.error);

  const artists = useMemo(
    () => artistsQuery.data?.flatMap((group) => group.artist ?? []) ?? EMPTY_ARRAY,
    [artistsQuery.data]
  );
  const songs = songsQuery.data ?? EMPTY_ARRAY;
  const albums = albumsQuery.data ?? EMPTY_ARRAY;
  const genres = genresQuery.data ?? EMPTY_ARRAY;
  const playlists = playlistsQuery.data ?? EMPTY_ARRAY;

  const sortOptions =
    kind === "songs"
      ? trackSortOptions
      : kind === "albums"
        ? albumSortOptions
        : titleSortOptions;
  const activeSort = sortOptions.some((option) => option.value === sort)
    ? sort
    : "default";

  const sortedSongs = useMemo(() => sortSongs(songs, activeSort), [songs, activeSort]);
  const sortedAlbums = useMemo(() => sortAlbums(albums, activeSort), [albums, activeSort]);
  const sortedArtists = useMemo(() => sortArtists(artists, activeSort), [artists, activeSort]);
  const sortedGenres = useMemo(() => sortGenres(genres, activeSort), [genres, activeSort]);
  const sortedPlaylists = useMemo(
    () => sortPlaylists(playlists, activeSort),
    [playlists, activeSort]
  );

  const playableSongs = songs;

  function playAll(shuffled = false) {
    if (playableSongs.length === 0) return;
    if (shuffled) {
      const queue = [...playableSongs].sort(() => Math.random() - 0.5);
      setQueue(queue, 0, { originalQueue: playableSongs, isShuffled: true });
      return;
    }

    setQueue(playableSongs, 0);
  }

  function downloadUnavailable() {
    setStatus("Offline song caching is not available in the web app yet.");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
        <div className="mb-6">
          <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">{titles[kind].title}</h1>
          <p className="mt-2 text-[15px] swift-subtitle">
            {titles[kind].subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="swift-subtitle">
            Loading {titles[kind].title.toLowerCase()}...
            {kind === "songs" ? " This can take a moment for larger libraries." : ""}
          </div>
        ) : hasError ? (
          <div className="text-red-500">Couldn’t load {titles[kind].title.toLowerCase()}.</div>
        ) : (
          <>
            {kind !== "downloads" ? (
              <div className="mb-5 space-y-3">
                <CollectionActionBar
                  onPlay={() => playAll(false)}
                  onShuffle={() => playAll(true)}
                  onDownload={downloadUnavailable}
                  disabled={playableSongs.length === 0}
                />
                <div className="flex">
                  <SortMenu value={activeSort} options={sortOptions} onChange={setSort} />
                </div>
                {status ? (
                  <div className="rounded-[20px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3 text-sm swift-subtitle">
                    {status}
                  </div>
                ) : null}
              </div>
            ) : null}

            {kind === "songs" ? (
              <div className="grid gap-3">
            {sortedSongs.map((song) => (
              <SongRow
                key={song.id}
                song={song}
                queue={sortedSongs}
                title={song.title}
                artist={song.artist}
                album={song.album}
                coverArtId={song.coverArt}
                duration={song.duration}
              />
            ))}
          </div>
        ) : kind === "albums" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,164px))] justify-center gap-5 sm:justify-start">
            {sortedAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                title={album.name}
                subtitle={album.artist}
                coverArtId={album.coverArt}
                href={`/library/albums/${encodeURIComponent(album.id)}`}
              />
            ))}
          </div>
        ) : kind === "artists" ? (
          <div className="grid gap-3">
            {sortedArtists.map((artist) => (
              <CollectionLink
                key={artist.id}
                href={`/library/artists/${encodeURIComponent(artist.id)}`}
                title={artist.name}
                subtitle={`${artist.albumCount ?? 0} albums`}
              />
            ))}
          </div>
        ) : kind === "genres" ? (
          <div className="grid gap-3">
            {sortedGenres.map((genre) => {
              const name = genre.value ?? "Unknown";
              return (
                <CollectionLink
                  key={name}
                  href={`/library/genres/${encodeURIComponent(name)}`}
                  title={name}
                  subtitle={`${genre.songCount ?? 0} songs • ${genre.albumCount ?? 0} albums`}
                />
              );
            })}
          </div>
        ) : kind === "playlists" ? (
          <div className="grid gap-3">
            {sortedPlaylists.map((playlist) => (
              <CollectionLink
                key={playlist.id}
                href={`/library/playlists/${encodeURIComponent(playlist.id)}`}
                title={playlist.name}
                subtitle={`${playlist.songCount ?? 0} songs${
                  playlist.duration ? ` • ${formatDuration(playlist.duration)}` : ""
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-5 swift-subtitle">
            Download support is wired in settings, but offline web storage is not enabled yet.
          </div>
        )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function CollectionLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="liquid-glass flex items-center justify-between rounded-[24px] px-4 py-4 transition hover:-translate-y-0.5"
    >
      <div className="min-w-0">
        <div className="truncate text-[15px] font-bold text-[var(--foreground)]">
          {title}
        </div>
        <div className="mt-1 truncate text-sm swift-subtitle">{subtitle}</div>
      </div>
      <ChevronRight size={18} className="shrink-0 swift-tertiary" />
    </Link>
  );
}
