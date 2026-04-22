"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { CastProvider } from "@/components/providers/cast-provider";
import { AudioEngine } from "@/components/player/audio-engine";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider />
      <CastProvider />
      <AudioEngine />
      <Toaster richColors position="top-center" />
      {children}
    </QueryClientProvider>
  );
}
