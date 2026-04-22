"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { SettingsRow } from "@/components/ui/settings-row";
import { ServerSettingsCard } from "@/components/settings/server-settings-card";
import { AppUpdateCard } from "@/components/settings/app-update-card";
import { useSessionStore } from "@/stores/session-store";

export default function SettingsPage() {
  const serverUrl = useSessionStore((s) => s.serverUrl);
  const username = useSessionStore((s) => s.username);

  return (
    <AppShell>
      <div className="mx-auto max-w-[760px] px-[18px] pt-5">
        <h1 className="swift-title mb-6 text-4xl">
          Settings
        </h1>

        <div className="space-y-6">
          <GlassPanel className="overflow-hidden rounded-[28px]">
            <Link href="/settings/appearance">
              <SettingsRow title="Appearance" />
            </Link>
            <Link href="/settings/library">
              <SettingsRow title="Library" />
            </Link>
            <Link href="/settings/quality">
              <SettingsRow title="Quality" />
            </Link>
            <Link href="/settings/offline">
              <SettingsRow title="Offline Listening" />
            </Link>
          </GlassPanel>

          <ServerSettingsCard />

          <AppUpdateCard />

          <div>
            <div className="mb-3 text-lg font-semibold text-[var(--foreground)]">About</div>

            <GlassPanel className="rounded-[24px] px-4 py-4">
              <div className="space-y-2 text-sm swift-subtitle">
                <p>
                  A design-forward self-hosted music player for Subsonic-compatible
                  servers.
                </p>
                <p>
                  Connected as <span className="font-semibold text-[var(--foreground)]">{username}</span>
                </p>
                <p className="truncate">{serverUrl}</p>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
