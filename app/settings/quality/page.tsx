"use client";

import { GlassPanel } from "@/components/glass/glass-panel";
import { SettingsShell } from "@/components/settings/settings-shell";
import { SettingSelectRow } from "@/components/settings/setting-select-row";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { SettingNoteCard } from "@/components/settings/setting-note-card";
import { usePreferencesStore } from "@/stores/preferences-store";

export default function QualitySettingsPage() {
  const {
    enableTranscoding,
    preferredFormat,
    preferredBitrate,
    setEnableTranscoding,
    setPreferredFormat,
    setPreferredBitrate,
  } = usePreferencesStore();

  return (
    <SettingsShell title="Quality">
      <div className="space-y-6">
        <div>
          <div className="mb-3 text-lg font-semibold text-[var(--foreground)]">Transcoding</div>

          <GlassPanel className="overflow-hidden rounded-[28px]">
            <SettingToggleRow
              label="Enable transcoding"
              checked={enableTranscoding}
              onChange={setEnableTranscoding}
            />

            <SettingSelectRow
              label="Preferred format"
              value={preferredFormat}
              onChange={(value) => setPreferredFormat(value as typeof preferredFormat)}
              options={[
                { label: "Original", value: "original" },
                { label: "MP3", value: "mp3" },
                { label: "AAC", value: "aac" },
                { label: "Opus", value: "opus" },
              ]}
            />

            <SettingSelectRow
              label="Preferred bitrate"
              value={preferredBitrate}
              onChange={(value) =>
                setPreferredBitrate(value as typeof preferredBitrate)
              }
              options={[
                { label: "Auto", value: "auto" },
                { label: "96 kbps", value: "96" },
                { label: "128 kbps", value: "128" },
                { label: "192 kbps", value: "192" },
                { label: "256 kbps", value: "256" },
                { label: "320 kbps", value: "320" },
              ]}
            />
          </GlassPanel>
        </div>

        <div>
          <div className="mb-3 text-lg font-semibold text-[var(--foreground)]">Streaming</div>
          <SettingNoteCard>
            Playback requests use your selected format and bitrate.
          </SettingNoteCard>
        </div>
      </div>
    </SettingsShell>
  );
}
