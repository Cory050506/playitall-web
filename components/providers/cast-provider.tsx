"use client";

import { useEffect } from "react";
import { canUseGoogleCastWebSdk } from "@/lib/runtime";

declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
  }

  const chrome:
    | {
        cast?: {
          AutoJoinPolicy?: {
            ORIGIN_SCOPED: string;
          };
          media?: {
            DEFAULT_MEDIA_RECEIVER_APP_ID: string;
          };
        };
      }
    | undefined;

  const cast:
    | {
        framework?: {
          CastContext?: {
            getInstance: () => {
              setOptions: (options: {
                receiverApplicationId?: string;
                autoJoinPolicy?: string;
              }) => void;
            };
          };
        };
      }
    | undefined;
}

const CAST_SDK_SRC =
  "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";

export function CastProvider() {
  useEffect(() => {
    if (!canUseGoogleCastWebSdk()) {
      return;
    }

    window.__onGCastApiAvailable = (isAvailable) => {
      if (!isAvailable) return;

      const receiverApplicationId =
        chrome?.cast?.media?.DEFAULT_MEDIA_RECEIVER_APP_ID;

      if (!receiverApplicationId) return;

      cast?.framework?.CastContext?.getInstance().setOptions({
        receiverApplicationId,
        autoJoinPolicy: chrome?.cast?.AutoJoinPolicy?.ORIGIN_SCOPED,
      });
    };

    if (document.querySelector(`script[src="${CAST_SDK_SRC}"]`)) return;

    const script = document.createElement("script");
    script.src = CAST_SDK_SRC;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      delete window.__onGCastApiAvailable;
    };
  }, []);

  return null;
}
