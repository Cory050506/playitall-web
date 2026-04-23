import { usePreferencesStore } from "@/stores/preferences-store";
import { useSessionStore } from "@/stores/session-store";
import { DesktopSection } from "../components/DesktopSection";

export function SettingsPage() {
  const mode = usePreferencesStore((s) => s.mode);
  const setMode = usePreferencesStore((s) => s.setMode);
  const keepMusicPlaying = usePreferencesStore((s) => s.keepMusicPlaying);
  const setKeepMusicPlaying = usePreferencesStore((s) => s.setKeepMusicPlaying);
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);

  return (
    <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
      <div className="mb-6">
        <h1 className="swift-title text-[34px] leading-tight sm:text-4xl">Settings</h1>
      </div>

      <DesktopSection title="Shared preferences">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            className="rounded-[22px] border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 py-4 text-left"
          >
            <div className="text-sm font-semibold swift-subtitle">Appearance</div>
            <div className="mt-2 text-lg font-bold text-[var(--foreground)]">
              {mode === "dark" ? "Dark Mode" : mode === "light" ? "Light Mode" : "System"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setKeepMusicPlaying(!keepMusicPlaying)}
            className="rounded-[22px] border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 py-4 text-left"
          >
            <div className="text-sm font-semibold swift-subtitle">Playback</div>
            <div className="mt-2 text-lg font-bold text-[var(--foreground)]">
              Keep Music Playing: {keepMusicPlaying ? "On" : "Off"}
            </div>
          </button>
        </div>
      </DesktopSection>

      <DesktopSection title="Current session">
        <div className="space-y-2 text-sm swift-subtitle">
          <div>
            <span className="font-semibold text-[var(--foreground)]">Server:</span>{" "}
            {serverUrl || "Not connected yet"}
          </div>
          <div>
            <span className="font-semibold text-[var(--foreground)]">User:</span>{" "}
            {username || "Not signed in"}
          </div>
        </div>
      </DesktopSection>
    </div>
  );
}
