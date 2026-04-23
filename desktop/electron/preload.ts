import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("playItAllElectron", {
  isElectron: true,
  getVersion: () => ipcRenderer.invoke("app:get-version"),
  getUpdateStatus: () => ipcRenderer.invoke("updates:get-status"),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  onUpdateStatus: (
    callback: (status: {
      state: string;
      message: string;
      version?: string | null;
      availableVersion?: string | null;
      error?: string | null;
    }) => void
  ) => {
    const listener = (_event: unknown, status: unknown) => callback(status as never);
    ipcRenderer.on("updates:status", listener);
    return () => ipcRenderer.removeListener("updates:status", listener);
  },
});
