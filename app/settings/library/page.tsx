"use client";

import { GlassPanel } from "@/components/glass/glass-panel";
import { SettingsShell } from "@/components/settings/settings-shell";
import { SettingSelectRow } from "@/components/settings/setting-select-row";
import { usePreferencesStore } from "@/stores/preferences-store";

export default function LibrarySettingsPage() {
  const libraryLayout = usePreferencesStore((s) => s.libraryLayout);
  const setLibraryLayout = usePreferencesStore((s) => s.setLibraryLayout);

  return (
    <SettingsShell title="Library">
      <GlassPanel className="overflow-hidden rounded-[28px]">
        <SettingSelectRow
          label="Layout"
          value={libraryLayout}
          onChange={(value) => setLibraryLayout(value as typeof libraryLayout)}
          options={[
            { label: "Grid", value: "grid" },
            { label: "List", value: "list" },
          ]}
        />
      </GlassPanel>
    </SettingsShell>
  );
}
