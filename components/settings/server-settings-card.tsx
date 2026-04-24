"use client";

import { useState } from "react";
import { LogOut, Save } from "lucide-react";
import { testSubsonicConnection } from "@/lib/subsonic/client";
import { isElectronRuntime } from "@/lib/runtime";
import { normalizeBaseUrl } from "@/lib/subsonic/helpers";
import { useSessionStore } from "@/stores/session-store";
import { GlassPanel } from "@/components/glass/glass-panel";

export function ServerSettingsCard() {
  const {
    serverUrl,
    username,
    password,
    clearSession,
    setField,
    setConnectionState,
  } = useSessionStore();

  const [draftUrl, setDraftUrl] = useState(serverUrl);
  const [draftUsername, setDraftUsername] = useState(username);
  const [draftPassword, setDraftPassword] = useState(password);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveChanges() {
    setSaving(true);
    setStatus(null);

    const normalizedUrl = normalizeBaseUrl(draftUrl);

    const result = await testSubsonicConnection({
      serverUrl: normalizedUrl,
      username: draftUsername,
      password: draftPassword,
    });

    if (!result.ok) {
      setSaving(false);
      setStatus(result.error);
      return;
    }

    setField("serverUrl", normalizedUrl);
    setField("username", draftUsername);
    setField("password", draftPassword);
    setConnectionState({
      isConnected: true,
      isConnecting: false,
      error: null,
    });

    setSaving(false);
    setStatus("Saved and connected.");
  }

  function logout() {
    clearSession();
    if (isElectronRuntime()) {
      window.location.assign("/#/login");
      return;
    }
    window.location.assign("/login");
  }

  return (
    <GlassPanel className="rounded-[24px] p-4">
      <div className="mb-4 text-lg font-semibold text-[var(--foreground)]">Server</div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm swift-subtitle">Server URL</label>
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 text-[var(--foreground)] outline-none placeholder:text-[var(--muted-2)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm swift-subtitle">Username</label>
          <input
            value={draftUsername}
            onChange={(e) => setDraftUsername(e.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 text-[var(--foreground)] outline-none placeholder:text-[var(--muted-2)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm swift-subtitle">Password</label>
          <input
            type="password"
            value={draftPassword}
            onChange={(e) => setDraftPassword(e.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 text-[var(--foreground)] outline-none placeholder:text-[var(--muted-2)]"
          />
        </div>

        {status ? (
          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 py-3 text-sm swift-subtitle">
            {status}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-2.5 font-medium text-white transition hover:brightness-105 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 py-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
