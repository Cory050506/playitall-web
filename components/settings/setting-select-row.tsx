"use client";

import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type SettingSelectRowProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export function SettingSelectRow({
  label,
  value,
  options,
  onChange,
}: SettingSelectRowProps) {
  return (
    <div className="flex min-h-[62px] max-w-full items-center justify-between gap-4 overflow-hidden border-b border-[var(--hairline)] px-4 py-3 last:border-b-0">
      <div className="min-w-0 text-[15px] font-medium text-[var(--foreground)]">{label}</div>

      <div className="relative h-10 w-[min(10rem,42vw)] shrink-0 overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--soft-fill)] transition hover:bg-[var(--soft-fill-hover)] sm:w-40">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent pl-2 pr-8 text-right text-sm font-semibold text-[var(--accent)] outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[var(--background)] text-[var(--foreground)]">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--accent)]"
        />
      </div>
    </div>
  );
}
