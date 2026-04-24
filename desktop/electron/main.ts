import { app, BrowserWindow, ipcMain, shell } from "electron";
import updater from "electron-updater";
import { join } from "node:path";

const { autoUpdater } = updater;

let mainWindow: BrowserWindow | null = null;
const manualMacUpdates = process.platform === "darwin";
let updateStatus = {
  state: "idle",
  message: manualMacUpdates
    ? "This macOS build uses manual updates. Download the latest release from GitHub."
    : "Updates are checked automatically.",
  version: app.getVersion(),
  availableVersion: null as string | null,
  error: null as string | null,
  canInstall: !manualMacUpdates,
  manualOnly: manualMacUpdates,
};

app.commandLine.appendSwitch("enable-features", "MediaRouter");
app.commandLine.appendSwitch("load-media-router-component-extension");

function setUpdateStatus(
  nextStatus: Partial<{
    state: string;
    message: string;
    version: string;
    availableVersion: string | null;
      error: string | null;
      canInstall: boolean;
      manualOnly: boolean;
  }>
) {
  updateStatus = {
    ...updateStatus,
    ...nextStatus,
    version: app.getVersion(),
    canInstall: manualMacUpdates ? false : (nextStatus.canInstall ?? updateStatus.canInstall),
    manualOnly: manualMacUpdates ? true : (nextStatus.manualOnly ?? updateStatus.manualOnly),
  };

  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("updates:status", updateStatus);
  }
}

function updateErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function configureAutoUpdater() {
  if (!app.isPackaged || manualMacUpdates) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    setUpdateStatus({
      state: "checking",
      message: "Checking for updates...",
      error: null,
    });
  });

  autoUpdater.on("error", (error) => {
    setUpdateStatus({
      state: "error",
      message: "Update check failed.",
      error: updateErrorMessage(error),
    });
  });

  autoUpdater.on("update-available", (info) => {
    setUpdateStatus({
      state: "available",
      message: "Update available. Downloading...",
      availableVersion: info?.version ?? null,
      error: null,
    });
  });

  autoUpdater.on("update-not-available", () => {
    setUpdateStatus({
      state: "not-available",
      message: "You are on the latest version.",
      availableVersion: null,
      error: null,
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    setUpdateStatus({
      state: "downloading",
      message: `Downloading update... ${Math.round(progress.percent || 0)}%`,
      error: null,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    setUpdateStatus({
      state: "downloaded",
      message: "Update ready. Restart to install.",
      availableVersion: info?.version ?? updateStatus.availableVersion,
      error: null,
    });
  });

  setTimeout(() => {
    void autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }, 10000);

  setInterval(() => {
    void autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }, 6 * 60 * 60 * 1000);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    title: "Play It All",
    backgroundColor: "#0b0c10",
    autoHideMenuBar: true,
    titleBarStyle: "default",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setUserAgent(
    app.userAgentFallback.replace(/\sElectron\/[^\s]+/, "")
  );

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

ipcMain.handle("app:get-version", () => app.getVersion());
ipcMain.handle("updates:get-status", () => updateStatus);
ipcMain.handle("updates:check", async () => {
  if (!app.isPackaged) {
    setUpdateStatus({
      state: "idle",
      message: "Update checks only run in the packaged app.",
      availableVersion: null,
      error: null,
    });
    return updateStatus;
  }

  if (manualMacUpdates) {
    setUpdateStatus({
      state: "idle",
      message: "Automatic install is disabled for this unsigned macOS build. Use the GitHub release download below.",
      availableVersion: null,
      error: null,
      canInstall: false,
      manualOnly: true,
    });
    return updateStatus;
  }

  setUpdateStatus({
    state: "checking",
    message: "Checking for updates...",
    error: null,
  });

  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    setUpdateStatus({
      state: "error",
      message: "Update check failed.",
      error: updateErrorMessage(error),
    });
  }

  return updateStatus;
});

ipcMain.handle("updates:install", () => {
  if (manualMacUpdates) {
    setUpdateStatus({
      state: "idle",
      message: "Automatic install is disabled for this unsigned macOS build. Use the GitHub release download below.",
      canInstall: false,
      manualOnly: true,
    });
    return updateStatus;
  }

  if (updateStatus.state !== "downloaded") {
    return updateStatus;
  }

  autoUpdater.quitAndInstall(false, true);
  return updateStatus;
});

app.whenReady().then(() => {
  createWindow();
  configureAutoUpdater();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
