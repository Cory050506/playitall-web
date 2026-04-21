"use client";

import Image from "next/image";
import Link from "next/link";
import { SquareStack } from "lucide-react";
import { useCoverArtUrl } from "@/lib/subsonic/use-cover-art";
import { usePreferencesStore } from "@/stores/preferences-store";

type AlbumCardProps = {
  title: string;
  subtitle?: string;
  coverArtId?: string;
  href?: string;
};

export function AlbumCard({ title, subtitle, coverArtId, href }: AlbumCardProps) {
  const imageUrl = useCoverArtUrl(coverArtId, 500);
  const artworkStyle = usePreferencesStore((s) => s.artworkStyle);

  const artworkRadius =
    artworkStyle === "square"
      ? "rounded-[10px]"
      : artworkStyle === "soft"
        ? "rounded-[28px]"
        : "rounded-[22px]";

  const content = (
    <>
      <div
        className={`liquid-glass relative h-[164px] w-[164px] overflow-hidden ${artworkRadius} bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_38%,#ffffff),color-mix(in_srgb,var(--accent)_18%,#1a1716))]`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        <SquareStack
          size={30}
          className="absolute bottom-3 right-3 text-white/90 drop-shadow"
        />
      </div>

      <div className="mt-3">
        <div className="line-clamp-2 text-[15px] font-semibold leading-tight text-[var(--foreground)]">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 line-clamp-2 text-sm leading-tight swift-subtitle">{subtitle}</div>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="group block w-[164px] text-left">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="group w-[164px] text-left">
      {content}
    </button>
  );
}
