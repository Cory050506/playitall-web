"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { SearchSuggestionRow } from "@/components/ui/search-suggestion-row";
import { RecentSongRow } from "@/components/ui/recent-song-row";
import { AlbumCard } from "@/components/home/album-card";
import { useLibraryCatalog, useSearch } from "@/lib/subsonic/queries";
import { formatDuration } from "@/lib/format";
import { usePreferencesStore } from "@/stores/preferences-store";
import { usePlaybackStore } from "@/stores/playback-store";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const trimmed = deferredQuery.trim();
  const searching = trimmed.length > 0;
  const showSearchSuggestions = usePreferencesStore((s) => s.showSearchSuggestions);
  const recentHistory = usePlaybackStore((s) => s.recentHistory);

  const { data: catalog } = useLibraryCatalog();
  const { data: results, isLoading, error } = useSearch(trimmed);

  const recentSongs = useMemo(() => recentHistory.slice(0, 8), [recentHistory]);
  const suggestions = useMemo(() => {
    if (!catalog) return [];

    const picks: string[] = [];
    const usedArtists = new Set<string>();
    const usedLabels = new Set<string>();

    const addPick = (label?: string | null, artist?: string | null) => {
      const normalized = label?.trim().toLowerCase();
      if (!label || !normalized || usedLabels.has(normalized)) return false;
      picks.push(label);
      usedLabels.add(normalized);
      if (artist) usedArtists.add(artist.trim().toLowerCase());
      return true;
    };

    for (const song of catalog.songs) {
      if (song.artist && addPick(song.artist, song.artist)) break;
    }

    for (const album of catalog.albums) {
      const albumArtist = album.artist?.trim().toLowerCase();
      if (albumArtist && usedArtists.has(albumArtist)) continue;
      if (addPick(album.name, album.artist)) break;
    }

    for (const song of catalog.songs) {
      const songArtist = song.artist?.trim().toLowerCase();
      if (songArtist && usedArtists.has(songArtist)) continue;
      if (addPick(song.title, song.artist)) break;
    }

    for (const album of catalog.albums) {
      if (picks.length >= 4) break;
      addPick(album.name, album.artist);
    }

    for (const song of catalog.songs) {
      if (picks.length >= 4) break;
      addPick(song.title, song.artist);
    }

    return picks.slice(0, 4);
  }, [catalog]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">Search</h1>
          </div>

          <div className="hidden md:block">
            <div className="flex h-11 w-[255px] items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--panel)] px-4">
              <SearchIcon size={18} className="swift-tertiary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Songs, albums, artists"
                className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-2)]"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 md:hidden">
          <div className="liquid-glass flex h-12 items-center gap-2 rounded-full px-4">
            <SearchIcon size={18} className="swift-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Songs, albums, artists"
              className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-2)]"
            />
          </div>
        </div>

        {!searching ? (
          <>
            {showSearchSuggestions && suggestions.length ? (
              <section className="mb-6">
                <div className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                  Suggested Searches
                </div>

                <GlassPanel className="overflow-hidden rounded-[28px]">
                  {suggestions.map((item) => (
                    <SearchSuggestionRow
                      key={item}
                      label={item}
                      onClick={() => setQuery(item)}
                    />
                  ))}
                </GlassPanel>
              </section>
            ) : null}

            <section>
              <div className="mb-3 text-xl font-semibold text-[var(--foreground)]">Recent Songs</div>

              <GlassPanel className="overflow-hidden rounded-[28px]">
                {recentSongs.length ? (
                  recentSongs.map((song) => (
                    <RecentSongRow
                      key={song.id}
                      song={song}
                      queue={recentSongs}
                      duration={formatDuration(song.duration)}
                    />
                  ))
                ) : (
                  <div className="px-4 py-4 swift-subtitle">
                    Start playing songs and they’ll show up here.
                  </div>
                )}
              </GlassPanel>
            </section>
          </>
        ) : (
          <div className="space-y-8">
            {isLoading ? (
              <div className="swift-subtitle">Searching...</div>
            ) : error ? (
              <div className="text-red-500">Search failed.</div>
            ) : (
              <>
                <section>
                  <div className="mb-3 text-xl font-semibold text-[var(--foreground)]">Songs</div>
                  <GlassPanel className="overflow-hidden rounded-[28px]">
                    {results?.songs?.length ? (
                      results.songs.map((song) => (
                        <RecentSongRow
                          key={song.id}
                          song={song}
                          queue={results.songs}
                          duration={formatDuration(song.duration)}
                        />
                      ))
                    ) : (
                      <div className="px-4 py-4 swift-subtitle">No songs found.</div>
                    )}
                  </GlassPanel>
                </section>

                <section>
                  <div className="mb-3 text-xl font-semibold text-[var(--foreground)]">Albums</div>
                  {results?.albums?.length ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,164px))] justify-center gap-5 sm:justify-start">
                      {results.albums.map((album) => (
                        <AlbumCard
                          key={album.id}
                          title={album.name}
                          subtitle={album.artist}
                          coverArtId={album.coverArt}
                          href={`/library/albums/${encodeURIComponent(album.id)}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="swift-subtitle">No albums found.</div>
                  )}
                </section>

                <section>
                  <div className="mb-3 text-xl font-semibold text-[var(--foreground)]">Artists</div>
                  <GlassPanel className="overflow-hidden rounded-[28px]">
                    {results?.artists?.length ? (
                      results.artists.map((artist) => (
                        <Link
                          key={artist.id}
                          href={`/library/artists/${encodeURIComponent(artist.id)}`}
                          className="flex w-full items-center justify-between border-b border-[var(--hairline)] px-4 py-4 text-left transition hover:bg-[var(--soft-fill)] last:border-b-0"
                        >
                          <div>
                            <div className="text-[15px] font-semibold text-[var(--foreground)]">
                              {artist.name}
                            </div>
                            <div className="text-sm swift-subtitle">
                              {artist.albumCount ?? 0} albums
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-4 swift-subtitle">No artists found.</div>
                    )}
                  </GlassPanel>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
