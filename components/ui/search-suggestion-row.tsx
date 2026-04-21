"use client";

import { Search } from "lucide-react";

type SearchSuggestionRowProps = {
  label: string;
  onClick?: () => void;
};

export function SearchSuggestionRow({
  label,
  onClick,
}: SearchSuggestionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-[var(--hairline)] px-4 py-4 text-left transition hover:bg-[var(--soft-fill)] last:border-b-0"
    >
      <Search size={18} className="text-[var(--accent)]" />
      <span className="text-[15px] text-[var(--foreground)]">{label}</span>
    </button>
  );
}
