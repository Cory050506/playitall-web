"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { usePreferencesStore } from "@/stores/preferences-store";
import { cn } from "@/lib/utils";

const ROOT_PATHS = new Set(["/", "/library", "/search", "/settings", "/login"]);

function getFallbackPath(pathname: string) {
  if (pathname.startsWith("/settings/")) return "/settings";
  if (pathname.startsWith("/library/")) return "/library";
  return "/";
}

export function UniversalBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarCollapsed = usePreferencesStore((s) => s.sidebarCollapsed);

  if (!pathname || ROOT_PATHS.has(pathname)) {
    return null;
  }

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(getFallbackPath(pathname));
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        "fixed left-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--player-surface-strong)] text-[var(--foreground)] shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition hover:scale-[1.04] hover:bg-[var(--soft-fill-hover)] active:scale-[0.94] lg:top-4",
        sidebarCollapsed ? "lg:left-[108px]" : "lg:left-[260px]"
      )}
      aria-label="Go back"
      title="Go back"
    >
      <ChevronLeft size={22} />
    </button>
  );
}
