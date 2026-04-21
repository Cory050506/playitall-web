"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/glass/glass-panel";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
    <aside className="fixed left-3 top-3 z-40 hidden lg:block">
      <GlassPanel
        dark
        className="h-[calc(100vh-24px)] w-[228px] rounded-[22px] p-3"
      >
        <div className="mb-3 px-3 pt-1 text-sm font-semibold swift-subtitle">
          Play It All
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
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-[15px] font-semibold transition-all",
                  active
                    ? "bg-[var(--accent)] text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                    : "swift-subtitle hover:bg-[var(--soft-fill-hover)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </GlassPanel>
    </aside>

    <nav className="safe-bottom fixed inset-x-3 bottom-3 z-50 lg:hidden">
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
                  "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-full text-[11px] font-semibold transition-all",
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "swift-subtitle hover:bg-[var(--soft-fill-hover)]"
                )}
              >
                <Icon size={19} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </GlassPanel>
    </nav>
    </>
  );
}
