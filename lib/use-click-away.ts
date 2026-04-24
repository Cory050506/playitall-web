"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

type MaybeElement = HTMLElement | null;

export function useClickAway(
  refs: Array<RefObject<MaybeElement>>,
  active: boolean,
  onAway: () => void
) {
  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      const clickedInside = refs.some((ref) => {
        const node = ref.current;
        return node ? node.contains(target) : false;
      });

      if (!clickedInside) {
        onAway();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onAway();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, onAway, refs]);
}
