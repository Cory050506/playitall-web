"use client";

type SettingSliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  valueSuffix?: string;
  onChange: (value: number) => void;
};

export function SettingSliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  valueSuffix = "",
  onChange,
}: SettingSliderRowProps) {
  return (
    <div className="border-b border-white/8 px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[15px] font-medium text-white">{label}</div>
        <div className="text-sm text-white/45">
          {value}
          {valueSuffix}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
    </div>
  );
}