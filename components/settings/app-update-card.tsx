"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, DownloadCloud, ExternalLink, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-panel";

type UpdateStatus = Awaited<
  ReturnType<NonNullable<Window["playItAllElectron"]>["getUpdateStatus"]>
>;

type GitHubRelease = {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  published_at: string | null;
  draft: boolean;
  prerelease: boolean;
};

const RELEASES_URL =
  "https://api.github.com/repos/Cory050506/playitall-web/releases?per_page=8";

const DEFAULT_STATUS: UpdateStatus = {
  state: "idle",
  message: "Updates are checked automatically in the Electron app.",
  version: null,
  availableVersion: null,
  error: null,
};

export function AppUpdateCard() {
  const [status, setStatus] = useState<UpdateStatus>(DEFAULT_STATUS);
  const [checking, setChecking] = useState(false);
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [releasesLoading, setReleasesLoading] = useState(true);
  const electronApi =
    typeof window !== "undefined" ? window.playItAllElectron : undefined;
  const latestRelease = useMemo(
    () => releases.find((release) => !release.draft && !release.prerelease),
    [releases]
  );

  useEffect(() => {
    if (!electronApi) return;

    let mounted = true;
    void electronApi.getUpdateStatus().then((nextStatus) => {
      if (mounted) setStatus(nextStatus);
    });

    const unsubscribe = electronApi.onUpdateStatus((nextStatus) => {
      setStatus(nextStatus);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [electronApi]);

  useEffect(() => {
    let cancelled = false;

    async function loadReleases() {
      setReleasesLoading(true);
      try {
        const response = await fetch(RELEASES_URL, {
          headers: {
            Accept: "application/vnd.github+json",
          },
        });
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        const data = (await response.json()) as GitHubRelease[];
        if (!cancelled) setReleases(data);
      } catch {
        if (!cancelled) setReleases([]);
      } finally {
        if (!cancelled) setReleasesLoading(false);
      }
    }

    void loadReleases();

    return () => {
      cancelled = true;
    };
  }, []);

  async function checkForUpdates() {
    if (!electronApi) {
      toast.message("Update checks run inside the Electron app.");
      return;
    }

    setChecking(true);
    try {
      const nextStatus = await electronApi.checkForUpdates();
      setStatus(nextStatus);
      toast.message(nextStatus.message);
    } finally {
      setChecking(false);
    }
  }

  async function installUpdate() {
    if (!electronApi) return;
    await electronApi.installUpdate();
  }

  return (
    <div>
      <div className="mb-3 text-lg font-semibold text-[var(--foreground)]">
        Updates
      </div>

      <GlassPanel className="overflow-hidden rounded-[28px]">
        <div className="border-b border-[var(--hairline)] px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--foreground)]">
                {status.state === "downloaded" ? (
                  <DownloadCloud size={18} className="text-[var(--accent)]" />
                ) : (
                  <CheckCircle2 size={18} className="text-[var(--accent)]" />
                )}
                Play It All {status.version ? `v${status.version}` : ""}
              </div>
              <p className="mt-1 text-sm swift-subtitle">{status.message}</p>
              {status.error ? (
                <p className="mt-1 text-xs font-semibold text-red-500">
                  {status.error}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {status.state === "downloaded" ? (
                <button
                  type="button"
                  onClick={installUpdate}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:brightness-105"
                >
                  <RotateCcw size={16} />
                  Restart
                </button>
              ) : null}
              <button
                type="button"
                onClick={checkForUpdates}
                disabled={checking}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--soft-fill)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)] disabled:opacity-55"
              >
                <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
                Check
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-bold text-[var(--foreground)]">
                Changelog
              </div>
              <p className="text-sm swift-subtitle">
                Latest release notes and previous versions from GitHub.
              </p>
            </div>
            {latestRelease ? (
              <a
                href={latestRelease.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
                aria-label="Open latest release"
              >
                <ExternalLink size={16} />
              </a>
            ) : null}
          </div>

          {releasesLoading ? (
            <div className="text-sm swift-subtitle">Loading releases...</div>
          ) : releases.length ? (
            <div className="space-y-3">
              {releases.map((release) => (
                <details
                  key={release.id}
                  className="rounded-[20px] bg-[var(--soft-fill)] px-4 py-3"
                  open={release.id === latestRelease?.id}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-[var(--foreground)]">
                        {release.name || release.tag_name}
                      </div>
                      <div className="text-xs swift-tertiary">
                        {release.published_at
                          ? new Date(release.published_at).toLocaleDateString()
                          : "Unpublished"}
                      </div>
                    </div>
                    <span className="text-xs font-bold swift-subtitle">
                      {release.tag_name}
                    </span>
                  </summary>
                  <div className="mt-3 max-h-52 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed swift-subtitle">
                    {release.body?.trim() || "No release notes yet."}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="text-sm swift-subtitle">
              No GitHub releases published yet.
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
