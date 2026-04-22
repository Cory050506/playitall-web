"use client";

import { GlassPanel } from "@/components/glass/glass-panel";

export function SettingNoteCard({ children }: { children: React.ReactNode }) {
  return (
    <GlassPanel className="rounded-[24px] px-4 py-4 text-sm swift-subtitle">
      {children}
    </GlassPanel>
  );
}
