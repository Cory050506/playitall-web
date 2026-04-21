"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";

type SettingsShellProps = {
  title: string;
  children: React.ReactNode;
};

export function SettingsShell({ title, children }: SettingsShellProps) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[760px] px-[18px] pt-5">
        <div className="mb-4">
          <Link
            href="/settings"
            className="swift-material inline-flex h-10 w-10 items-center justify-center rounded-full transition"
          >
            <ChevronLeft size={20} />
          </Link>
        </div>

        <h1 className="swift-title mb-6 text-4xl">{title}</h1>

        {children}
      </div>
    </AppShell>
  );
}
