"use client";

type SettingToggleRowProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SettingToggleRow({
  label,
  checked,
  onChange,
}: SettingToggleRowProps) {
  return (
    <div className="flex min-h-[62px] items-center justify-between gap-4 border-b border-[var(--hairline)] px-4 py-3 last:border-b-0">
      <div className="min-w-0 text-[15px] font-medium text-[var(--foreground)]">{label}</div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-[var(--accent)]" : "bg-[var(--soft-fill-hover)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
