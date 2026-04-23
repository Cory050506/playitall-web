"use client";

import Image from "next/image";
import { getBrandAssetPath } from "@/lib/assets";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  imageClassName?: string;
};

export function AppLogo({ className, imageClassName }: AppLogoProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] bg-[var(--soft-fill)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
        className
      )}
    >
      <Image
        src={getBrandAssetPath("playitall-icon.png")}
        alt="Play It All"
        fill
        sizes="48px"
        className={cn("object-cover", imageClassName)}
        priority
      />
    </div>
  );
}
