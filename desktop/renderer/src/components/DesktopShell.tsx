import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Library,
  Search,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { TopControls } from "@/components/top-controls";
import { MiniPlayer } from "@/components/player/mini-player";
import { NowPlayingModal } from "@/components/player/now-playing-modal";
import { UniversalBackButton } from "@/components/universal-back-button";
import { getBrandAssetPath } from "@/lib/assets";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences-store";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/library", label: "Library", icon: Library },
  { to: "/search", label: "Search", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function DesktopShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const sidebarCollapsed = usePreferencesStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <aside className="fixed left-3 top-3 z-40 hidden lg:block">
        <GlassPanel
          dark
          className={cn(
            "h-[calc(100vh-24px)] rounded-[22px] p-3 transition-[width] duration-300",
            sidebarCollapsed ? "w-[88px]" : "w-[240px]"
          )}
        >
          <div
            className={cn(
              "mb-5 flex items-center",
              sidebarCollapsed ? "justify-center" : "justify-between px-3"
            )}
          >
            {!sidebarCollapsed ? (
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={getBrandAssetPath("playitall-icon.png")}
                  alt="Play It All"
                  className="h-10 w-10 rounded-[12px] object-cover"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--foreground)]">
                    Play It All
                  </div>
                  <div className="text-xs swift-tertiary">Desktop migration</div>
                </div>
              </div>
            ) : (
              <img
                src={getBrandAssetPath("playitall-icon.png")}
                alt="Play It All"
                className="h-10 w-10 rounded-[12px] object-cover"
              />
            )}
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center rounded-[14px] py-3 text-[15px] font-semibold transition-all",
                    sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4",
                    active
                      ? "bg-[var(--accent)] text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                      : "swift-subtitle hover:bg-[var(--soft-fill-hover)] hover:text-[var(--foreground)]"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[18px] border border-[var(--hairline)] bg-[var(--soft-fill)] p-3">
            <div className="text-sm font-semibold text-[var(--foreground)]">
              Feishin-style migration
            </div>
            <div className="mt-1 text-xs leading-relaxed swift-tertiary">
              New desktop shell on Electron + Vite. We can port routes into this without
              keeping the bundled Next server.
            </div>
          </div>
        </GlassPanel>
      </aside>

      <TopControls />
      <UniversalBackButton />

      <main
        className={cn(
          "min-h-screen pb-[calc(var(--mobile-nav-height)+var(--mini-player-bottom)+2rem)] pt-[calc(3.75rem+env(safe-area-inset-top))] transition-[padding] duration-300 lg:pb-36 lg:pr-4 lg:pt-0",
          sidebarCollapsed ? "lg:pl-[104px]" : "lg:pl-[256px]"
        )}
      >
        {children}
      </main>

      <div className="fixed bottom-3 right-3 z-40 hidden lg:flex">
        <a
          href="https://github.com/jeffvli/feishin"
          target="_blank"
          rel="noreferrer"
          className="player-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
        >
          Feishin reference
          <ArrowUpRight size={15} />
        </a>
      </div>

      <MiniPlayer />
      <NowPlayingModal />
    </div>
  );
}
