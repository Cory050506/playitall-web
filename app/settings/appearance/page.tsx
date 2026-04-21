"use client";

import { GlassPanel } from "@/components/glass/glass-panel";
import { SettingsShell } from "@/components/settings/settings-shell";
import { SettingSelectRow } from "@/components/settings/setting-select-row";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { usePreferencesStore } from "@/stores/preferences-store";

export default function AppearanceSettingsPage() {
  const {
    accent,
    mode,
    textSize,
    artworkStyle,
    higherContrastCards,
    waveformMotion,
    setAccent,
    setMode,
    setTextSize,
    setArtworkStyle,
    setHigherContrastCards,
    setWaveformMotion,
  } = usePreferencesStore();

  return (
    <SettingsShell title="Appearance">
      <GlassPanel className="overflow-hidden rounded-[28px]">
        <SettingSelectRow
          label="Accent"
          value={accent}
          onChange={(value) => setAccent(value as typeof accent)}
          options={[
            { label: "Sunset", value: "sunset" },
            { label: "Ocean", value: "ocean" },
            { label: "Lime", value: "lime" },
            { label: "Rose", value: "rose" },
          ]}
        />

        <SettingSelectRow
          label="Mode"
          value={mode}
          onChange={(value) => setMode(value as typeof mode)}
          options={[
            { label: "Match Device", value: "system" },
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
          ]}
        />

        <SettingSelectRow
          label="Text Size"
          value={textSize}
          onChange={(value) => setTextSize(value as typeof textSize)}
          options={[
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
            { label: "Extra Large", value: "extra-large" },
          ]}
        />

        <SettingSelectRow
          label="Artwork"
          value={artworkStyle}
          onChange={(value) => setArtworkStyle(value as typeof artworkStyle)}
          options={[
            { label: "Rounded", value: "rounded" },
            { label: "Square", value: "square" },
            { label: "Soft Glow", value: "soft" },
          ]}
        />

        <SettingToggleRow
          label="Higher contrast cards"
          checked={higherContrastCards}
          onChange={setHigherContrastCards}
        />

        <SettingToggleRow
          label="Waveform motion"
          checked={waveformMotion}
          onChange={setWaveformMotion}
        />
      </GlassPanel>
    </SettingsShell>
  );
}
