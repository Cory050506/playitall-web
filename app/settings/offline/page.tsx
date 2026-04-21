"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { SettingsShell } from "@/components/settings/settings-shell";
import { SettingSelectRow } from "@/components/settings/setting-select-row";
import { SettingSliderRow } from "@/components/settings/setting-slider-row";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { SettingNoteCard } from "@/components/settings/setting-note-card";
import { usePreferencesStore } from "@/stores/preferences-store";

export default function OfflineSettingsPage() {
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const {
    enableOfflineDownloads,
    offlineSaveAs,
    preferOfflineCopies,
    allowDownloadsOverCellular,
    offlineCacheGB,
    setEnableOfflineDownloads,
    setOfflineSaveAs,
    setPreferOfflineCopies,
    setAllowDownloadsOverCellular,
    setOfflineCacheGB,
  } = usePreferencesStore();

  return (
    <SettingsShell title="Offline Listening">
      <div className="space-y-6">
        <div>
          <div className="mb-3 text-lg font-semibold text-[var(--foreground)]">Downloads</div>

          <GlassPanel className="overflow-hidden rounded-[28px]">
            <SettingToggleRow
              label="Enable offline downloads"
              checked={enableOfflineDownloads}
              onChange={setEnableOfflineDownloads}
            />

            <SettingSelectRow
              label="Save as"
              value={offlineSaveAs}
              onChange={(value) => setOfflineSaveAs(value as typeof offlineSaveAs)}
              options={[
                { label: "Original File", value: "original" },
                { label: "MP3 Cache", value: "mp3-cache" },
              ]}
            />

            <SettingToggleRow
              label="Prefer offline copies"
              checked={preferOfflineCopies}
              onChange={setPreferOfflineCopies}
            />

            <SettingToggleRow
              label="Allow downloads over cellular"
              checked={allowDownloadsOverCellular}
              onChange={setAllowDownloadsOverCellular}
            />

            <SettingSliderRow
              label="Offline cache"
              value={offlineCacheGB}
              min={1}
              max={32}
              step={1}
              valueSuffix=" GB"
              onChange={setOfflineCacheGB}
            />
          </GlassPanel>
        </div>

        <SettingNoteCard>
          Original keeps the source file quality and size. MP3 Cache saves a smaller
          transcoded copy.
        </SettingNoteCard>

        <div>
          <div className="mb-3 text-lg font-semibold text-[var(--foreground)]">Quick Actions</div>

          <GlassPanel className="overflow-hidden rounded-[28px]">
            <button
              type="button"
              onClick={() =>
                setActionStatus("Offline downloads are not available in the web app yet.")
              }
              className="block w-full border-b border-[var(--hairline)] px-4 py-4 text-left text-[var(--accent)] transition hover:bg-[var(--soft-fill)]"
            >
              Download Current Song
            </button>
            <button
              type="button"
              onClick={() => setActionStatus("There are no web downloads to clear.")}
              className="block w-full px-4 py-4 text-left swift-tertiary transition hover:bg-[var(--soft-fill)]"
            >
              Clear Offline Cache
            </button>
          </GlassPanel>

          {actionStatus ? (
            <div className="mt-3 rounded-[20px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3 text-sm swift-subtitle">
              {actionStatus}
            </div>
          ) : null}
        </div>

        <div>
          <div className="mb-3 text-lg font-semibold text-[var(--foreground)]">Status</div>

          <GlassPanel className="overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-4">
              <span className="text-[15px] font-medium text-[var(--foreground)]">Saved Tracks</span>
              <span className="text-sm swift-subtitle">0</span>
            </div>
            <div className="px-4 py-4 text-sm swift-subtitle">
              {enableOfflineDownloads
                ? "Downloads are enabled."
                : "Downloads are disabled."}
            </div>
          </GlassPanel>
        </div>
      </div>
    </SettingsShell>
  );
}
