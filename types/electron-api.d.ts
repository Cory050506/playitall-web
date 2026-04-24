export {};

type PlayItAllUpdateStatus = {
  state:
    | "idle"
    | "checking"
    | "available"
    | "not-available"
    | "downloading"
    | "downloaded"
    | "error";
  message: string;
  version?: string | null;
  availableVersion?: string | null;
  error?: string | null;
  canInstall?: boolean;
  manualOnly?: boolean;
};

declare global {
  interface Window {
    playItAllElectron?: {
      isElectron: true;
      getVersion: () => Promise<string>;
      getUpdateStatus: () => Promise<PlayItAllUpdateStatus>;
      checkForUpdates: () => Promise<PlayItAllUpdateStatus>;
      installUpdate: () => Promise<PlayItAllUpdateStatus>;
      onUpdateStatus: (
        callback: (status: PlayItAllUpdateStatus) => void
      ) => () => void;
    };
  }
}
