import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SessionState = {
  serverUrl: string;
  username: string;
  password: string;
  rememberMe: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  hasHydrated: boolean;
  error: string | null;
  setField: (field: "serverUrl" | "username" | "password", value: string) => void;
  setRememberMe: (value: boolean) => void;
  setConnectionState: (input: {
    isConnected?: boolean;
    isConnecting?: boolean;
    error?: string | null;
  }) => void;
  setHasHydrated: (value: boolean) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      serverUrl: "",
      username: "",
      password: "",
      rememberMe: true,
      isConnected: false,
      isConnecting: false,
      hasHydrated: false,
      error: null,

      setField: (field, value) =>
        set({ [field]: value } as Partial<SessionState>),

      setRememberMe: (value) => set({ rememberMe: value }),

      setConnectionState: (input) => set(input),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      clearSession: () => {
        const rememberMe = get().rememberMe;
        const serverUrl = rememberMe ? get().serverUrl : "";
        const username = rememberMe ? get().username : "";
        const password = rememberMe ? get().password : "";

        set({
          serverUrl,
          username,
          password,
          isConnected: false,
          isConnecting: false,
          error: null,
        });
      },
    }),
    {
      name: "play-it-all-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        serverUrl: state.rememberMe ? state.serverUrl : "",
        username: state.rememberMe ? state.username : "",
        password: state.rememberMe ? state.password : "",
        rememberMe: state.rememberMe,
        isConnected: state.rememberMe ? state.isConnected : false,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);