"use client";

import { Sidebar } from "@/components/sidebar";
import { MiniPlayer } from "@/components/player/mini-player";
import { NowPlayingModal } from "@/components/player/now-playing-modal";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <Sidebar />

      <main className="min-h-screen pb-[178px] lg:pb-36 lg:pl-[244px] lg:pr-4">
        {children}
      </main>

      <MiniPlayer />
      <NowPlayingModal />
    </div>
  );
}
