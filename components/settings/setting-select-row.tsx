"use client";

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
    <div className="flex min-h-[62px] items-center justify-between border-b border-[var(--hairline)] px-4 py-3 last:border-b-0">
      <div className="text-[15px] font-medium text-[var(--foreground)]">{label}</div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-transparent bg-transparent text-right text-[var(--accent)] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[var(--background)] text-[var(--foreground)]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
