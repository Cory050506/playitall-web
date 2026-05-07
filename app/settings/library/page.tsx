"use client";

import { GlassPanel } from "@/components/glass/glass-panel";
import { SettingsShell } from "@/components/settings/settings-shell";
import { SettingSelectRow } from "@/components/settings/setting-select-row";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { usePreferencesStore } from "@/stores/preferences-store";

export default function LibrarySettingsPage() {
  const libraryLayout = usePreferencesStore((s) => s.libraryLayout);
  const libraryStartSection = usePreferencesStore((s) => s.libraryStartSection);
  const showSearchSuggestions = usePreferencesStore((s) => s.showSearchSuggestions);
  const keepMusicPlaying = usePreferencesStore((s) => s.keepMusicPlaying);
  const setLibraryLayout = usePreferencesStore((s) => s.setLibraryLayout);
  const setLibraryStartSection = usePreferencesStore((s) => s.setLibraryStartSection);
  const setShowSearchSuggestions = usePreferencesStore((s) => s.setShowSearchSuggestions);
  const setKeepMusicPlaying = usePreferencesStore((s) => s.setKeepMusicPlaying);

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
        <SettingSelectRow
          label="Default Section"
          value={libraryStartSection}
          onChange={(value) => setLibraryStartSection(value as typeof libraryStartSection)}
          options={[
            { label: "Albums", value: "albums" },
            { label: "Artists", value: "artists" },
            { label: "Songs", value: "songs" },
          ]}
        />
        <SettingToggleRow
          label="Suggested Searches"
          checked={showSearchSuggestions}
          onChange={setShowSearchSuggestions}
        />
        <SettingToggleRow
          label="Keep Music Playing"
          checked={keepMusicPlaying}
          onChange={setKeepMusicPlaying}
        />
      </GlassPanel>
    </SettingsShell>
  );
}
