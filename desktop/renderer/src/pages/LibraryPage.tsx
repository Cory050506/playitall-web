import { useLibraryStats } from "@/lib/subsonic/queries";
import { DesktopSection } from "../components/DesktopSection";

export function LibraryPage() {
  const { data, isLoading, error } = useLibraryStats();

  return (
    <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
      <div className="mb-6">
        <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">Library</h1>
        <p className="mt-2 text-base swift-subtitle">
          This page proves the new desktop renderer can already talk to the shared Subsonic
          query layer.
        </p>
      </div>

      <DesktopSection title="Library stats">
        {isLoading ? (
          <div className="swift-subtitle">Loading your library…</div>
        ) : error ? (
          <div className="text-sm text-red-400">Couldn&apos;t load library stats yet.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Songs", data?.songCount ?? 0],
              ["Albums", data?.albumCount ?? 0],
              ["Artists", data?.artistCount ?? 0],
              ["Genres", data?.genreCount ?? 0],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-[22px] border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 py-4"
              >
                <div className="text-sm font-semibold swift-subtitle">{label}</div>
                <div className="mt-2 text-3xl font-black text-[var(--foreground)]">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </DesktopSection>
    </div>
  );
}
