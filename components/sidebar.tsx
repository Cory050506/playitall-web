"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Library,
  PanelLeftClose,
  Search,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/glass/glass-panel";
import { AppLogo } from "@/components/app-logo";
import { usePreferencesStore } from "@/stores/preferences-store";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = usePreferencesStore((s) => s.sidebarCollapsed);
  const setCollapsed = usePreferencesStore((s) => s.setSidebarCollapsed);

  return (
    <>
    <aside className="fixed left-3 top-3 z-40 hidden lg:block">
      <GlassPanel
        dark
        className={cn(
          "h-[calc(100vh-24px)] rounded-[22px] p-3 transition-[width] duration-300",
          collapsed ? "w-[76px]" : "w-[228px]"
        )}
      >
        <div
          className={cn(
            "mb-3 flex items-center pt-1",
            collapsed ? "justify-center" : "justify-between px-3"
          )}
        >
          {!collapsed ? (
            <div className="flex min-w-0 items-center gap-3">
              <AppLogo className="h-9 w-9 shrink-0 rounded-[11px]" />
              <div className="min-w-0 text-sm font-semibold swift-subtitle">
                Play It All
              </div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--soft-fill)] text-[var(--foreground)] transition hover:bg-[var(--soft-fill-hover)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <AppLogo className="h-8 w-8 rounded-[10px]" />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-[14px] py-3 text-[15px] font-semibold transition-all",
                  collapsed ? "justify-center px-0" : "gap-3 px-4",
                  active
                    ? "bg-[var(--accent)] text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                    : "swift-subtitle hover:bg-[var(--soft-fill-hover)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={20} />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </GlassPanel>
    </aside>

    <nav className="mobile-bottom-nav safe-bottom fixed inset-x-3 z-50 lg:hidden">
      <GlassPanel dark className="rounded-full px-2 py-2">
        <div className="grid grid-cols-4 gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-full text-[11px] font-semibold transition-all",
                  active
                    ? "mobile-nav-active text-white"
                    : "swift-subtitle hover:bg-[var(--soft-fill-hover)]"
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-full bg-[var(--accent)] shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                    transition={{ type: "spring", stiffness: 410, damping: 34 }}
                  />
                ) : null}
                <span className="relative z-10 inline-flex flex-col items-center gap-1">
                  <Icon size={19} />
                  <span className="truncate">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </GlassPanel>
    </nav>
    </>
  );
}
