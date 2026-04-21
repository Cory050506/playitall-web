"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { testSubsonicConnection } from "@/lib/subsonic/client";
import { normalizeBaseUrl } from "@/lib/subsonic/helpers";
import { useSessionStore } from "@/stores/session-store";
import { GlassPanel } from "@/components/glass/glass-panel";

export default function LoginPage() {
  const router = useRouter();

  const {
    serverUrl,
    username,
    password,
    rememberMe,
    setField,
    setRememberMe,
    setConnectionState,
  } = useSessionStore();

  const [localError, setLocalError] = useState<string | null>(null);

  const isConnecting = useSessionStore((s) => s.isConnecting);

  const canSubmit = useMemo(() => {
    return (
      serverUrl.trim().length > 0 &&
      username.trim().length > 0 &&
      password.trim().length > 0
    );
  }, [serverUrl, username, password]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);

    const normalizedUrl = normalizeBaseUrl(serverUrl);
    setField("serverUrl", normalizedUrl);
    setConnectionState({
      isConnecting: true,
      isConnected: false,
      error: null,
    });

    const result = await testSubsonicConnection({
      serverUrl: normalizedUrl,
      username,
      password,
    });

    if (!result.ok) {
      setConnectionState({
        isConnecting: false,
        isConnected: false,
        error: result.error,
      });
      setLocalError(result.error);
      return;
    }

    setConnectionState({
      isConnecting: false,
      isConnected: true,
      error: null,
    });

    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassPanel
        dark
        className="w-full max-w-[520px] rounded-[32px] p-6 sm:p-8"
      >
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
            Play It All
          </div>
          <h1 className="mt-3 text-4xl font-bold text-white">
            Connect your server
          </h1>
          <p className="mt-3 text-white/60">
            Sign in to your Navidrome or other Subsonic-compatible server.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/75">
              Server URL
            </label>
            <input
              value={serverUrl}
              onChange={(e) => setField("serverUrl", e.target.value)}
              placeholder="https://music.yourdomain.com"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none placeholder:text-white/30 focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/75">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setField("username", e.target.value)}
              placeholder="Username"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none placeholder:text-white/30 focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/75">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder="Password"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none placeholder:text-white/30 focus:border-[var(--accent)]"
            />
          </div>

          <label className="flex items-center gap-3 pt-1 text-sm text-white/70">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10"
            />
            Remember this server on this device
          </label>

          {localError && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {localError}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.30)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <LogIn size={18} />
            )}
            Connect
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}