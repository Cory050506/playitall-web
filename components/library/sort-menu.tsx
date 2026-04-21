"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import type { LibrarySortOption, SortOptionItem } from "@/lib/library/sort";

type SortMenuProps = {
  value: LibrarySortOption;
  options: SortOptionItem[];
  onChange: (value: LibrarySortOption) => void;
};

export function SortMenu({ value, options, onChange }: SortMenuProps) {
  return (
    <label className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--accent)_13%,transparent)] pl-4 pr-10 text-sm font-bold text-[var(--accent)]">
      <ArrowUpDown size={16} className="pointer-events-none shrink-0" />
      <span className="pointer-events-none">Sort:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as LibrarySortOption)}
        className="min-w-[120px] cursor-pointer appearance-none bg-transparent py-2 pr-1 text-sm font-bold text-[var(--accent)] outline-none"
        aria-label="Sort collection"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
      />
    </label>
  );
}
