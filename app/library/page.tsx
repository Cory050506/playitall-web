"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Disc3,
  Album,
  MicVocal,
  AudioLines,
  ListMusic,
  Download,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useLibraryStats } from "@/lib/subsonic/queries";
import { formatCount } from "@/lib/format";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useSessionStore } from "@/stores/session-store";
import {
  clearLibrarySnapshot,
  librarySnapshotKey,
} from "@/lib/subsonic/library-snapshot";

type LibraryItem = {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count?: string | number;
};

export default function LibraryPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, isFetching } = useLibraryStats();
  const libraryLayout = usePreferencesStore((s) => s.libraryLayout);
  const libraryStartSection = usePreferencesStore((s) => s.libraryStartSection);
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);

  function refreshLibrary() {
    if (serverUrl && username) {
      clearLibrarySnapshot(librarySnapshotKey(serverUrl, username));
    }
    void queryClient.invalidateQueries({ queryKey: ["subsonic"] });
  }

  const items = [
    {
      href: "/library/songs",
      icon: <Disc3 size={20} />,
      title: "Songs",
      subtitle: "Every playable track",
      count: formatCount(data?.songCount),
    },
    {
      href: "/library/albums",
      icon: <Album size={20} />,
      title: "Albums",
      subtitle: "Album and release picks",
      count: formatCount(data?.albumCount),
    },
    {
      href: "/library/artists",
      icon: <MicVocal size={20} />,
      title: "Artists",
      subtitle: "Browse by artist",
      count: formatCount(data?.artistCount),
    },
    {
      href: "/library/genres",
      icon: <AudioLines size={20} />,
      title: "Genres",
      subtitle: "Tap into a mood",
      count: formatCount(data?.genreCount),
    },
    {
      href: "/library/playlists",
      icon: <ListMusic size={20} />,
      title: "Playlists",
      subtitle: "Saved playlists",
      count: formatCount(data?.playlistCount),
    },
    {
      href: "/library/downloads",
      icon: <Download size={20} />,
      title: "Downloads",
      subtitle: "Offline music",
      count: formatCount(data?.downloadCount),
    },
  ];
  const prioritizedItems = [
    ...items.filter((item) => item.href === `/library/${libraryStartSection}`),
    ...items.filter((item) => item.href !== `/library/${libraryStartSection}`),
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">
            Library
          </h1>
          <button
            type="button"
            onClick={refreshLibrary}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--soft-fill)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="swift-subtitle">
            Loading library... Full song counts can take a moment on larger servers.
          </div>
        ) : error ? (
          <div className="text-red-500">Couldn’t load library stats.</div>
        ) : libraryLayout === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {prioritizedItems.map((item) => (
              <LibraryCard
                key={item.title}
                item={item}
                variant="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {prioritizedItems.map((item) => (
              <LibraryCard
                key={item.title}
                item={item}
                variant="list"
              />
            ))}
          </div>
        )}

        {data?.partialAlbumSongFailures ? (
          <div className="mt-5 rounded-[20px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3 text-sm swift-subtitle">
            {data.partialAlbumSongFailures} albums could not be scanned for tracks.
            Counts may be slightly low.
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function LibraryCard({
  item,
  variant,
}: {
  item: LibraryItem;
  variant: "grid" | "list";
}) {
  if (variant === "grid") {
    return (
      <Link
        href={item.href}
        className="liquid-glass group flex min-h-[154px] flex-col rounded-[24px] p-4 text-left transition hover:-translate-y-0.5 sm:min-h-[168px] sm:rounded-[26px] sm:p-[18px]"
      >
        <div className="mb-auto flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
          {item.icon}
        </div>
        <div className="mt-5">
          <div className="text-[15px] font-bold text-[var(--foreground)]">
            {item.title}
          </div>
          <div className="mt-1 text-sm leading-snug swift-subtitle">
            {item.subtitle}
          </div>
          <div className="mt-3 text-xs font-semibold swift-tertiary">
            {item.count ?? ""}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
        className="liquid-glass flex w-full items-center justify-between rounded-[24px] px-4 py-4 text-left transition hover:-translate-y-0.5"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
          {item.icon}
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-[var(--foreground)]">
            {item.title}
          </div>
          <div className="text-sm swift-subtitle">{item.subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm swift-tertiary">{item.count ?? ""}</div>
        <ChevronRight size={18} className="swift-tertiary" />
      </div>
    </Link>
  );
}
