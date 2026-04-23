import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useRandomSongs, useSearch } from "@/lib/subsonic/queries";
import { DesktopSection } from "../components/DesktopSection";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const { data: randomSongs = [] } = useRandomSongs();
  const { data: results, isLoading } = useSearch(trimmed);

  const sampleSuggestions = useMemo(
    () => randomSongs.slice(0, 5).map((song) => song.title),
    [randomSongs]
  );

  return (
    <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
      <div className="mb-6">
        <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">Search</h1>
      </div>

      <DesktopSection title="Desktop search probe">
        <div className="flex h-12 items-center gap-3 rounded-full border border-[var(--hairline)] bg-[var(--soft-fill)] px-4">
          <SearchIcon size={18} className="swift-tertiary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Songs, albums, artists"
            className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-2)]"
          />
        </div>

        {!trimmed ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {sampleSuggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="rounded-full bg-[var(--soft-fill)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
              >
                {item}
              </button>
            ))}
          </div>
        ) : isLoading ? (
          <div className="mt-4 swift-subtitle">Searching…</div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ResultCard label="Songs" count={results?.songs?.length ?? 0} />
            <ResultCard label="Albums" count={results?.albums?.length ?? 0} />
            <ResultCard label="Artists" count={results?.artists?.length ?? 0} />
          </div>
        )}
      </DesktopSection>
    </div>
  );
}

function ResultCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-[22px] border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 py-4">
      <div className="text-sm font-semibold swift-subtitle">{label}</div>
      <div className="mt-2 text-3xl font-black text-[var(--foreground)]">{count}</div>
    </div>
  );
}
