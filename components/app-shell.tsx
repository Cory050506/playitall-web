"use client";

import { Sidebar } from "@/components/sidebar";
import { MiniPlayer } from "@/components/player/mini-player";
import { NowPlayingModal } from "@/components/player/now-playing-modal";
import { TopControls } from "@/components/top-controls";
import { usePreferencesStore } from "@/stores/preferences-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = usePreferencesStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <Sidebar />
      <TopControls />

      <main
        className={cn(
          "min-h-screen pb-[calc(var(--mobile-nav-height)+var(--mini-player-bottom)+2rem)] pt-[calc(3.75rem+env(safe-area-inset-top))] transition-[padding] duration-300 lg:pb-36 lg:pr-4 lg:pt-0",
          sidebarCollapsed ? "lg:pl-[92px]" : "lg:pl-[244px]"
        )}
      >
        {children}
      </main>

      <MiniPlayer />
      <NowPlayingModal />
    </div>
  );
}
