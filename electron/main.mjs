import { app, BrowserWindow, ipcMain, shell } from "electron";
import updater from "electron-updater";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";

const APP_PORT = Number(process.env.PLAYITALL_PORT || 3765);
const APP_URL =
  process.env.PLAYITALL_DEV_SERVER_URL || `http://127.0.0.1:${APP_PORT}`;
const { autoUpdater } = updater;

app.commandLine.appendSwitch("enable-features", "MediaRouter");
app.commandLine.appendSwitch("load-media-router-component-extension");

let mainWindow;
let nextProcess;
let updateStatus = {
  state: "idle",
  message: "Updates are checked automatically.",
  version: app.getVersion(),
  availableVersion: null,
  error: null,
};

function setUpdateStatus(nextStatus) {
  updateStatus = {
    ...updateStatus,
    ...nextStatus,
    version: app.getVersion(),
  };

  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("updates:status", updateStatus);
  }
}

function updateErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function waitForPort(port, host = "127.0.0.1", timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function tryConnect() {
      const socket = net.createConnection({ port, host }, () => {
        socket.end();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }

        setTimeout(tryConnect, 250);
      });
    }

    tryConnect();
  });
}

async function startNextServer() {
  if (process.env.PLAYITALL_DEV_SERVER_URL) {
    console.log("Using external dev server:", process.env.PLAYITALL_DEV_SERVER_URL);
    return Promise.resolve();
  }

  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, "standalone", "server.js")
    : path.join(app.getAppPath(), ".next", "standalone", "server.js");

  console.log("Starting standalone Next.js server on port", APP_PORT);
  nextProcess = spawn(process.execPath, [serverPath], {
    cwd: path.dirname(serverPath),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      PORT: String(APP_PORT),
    },
    stdio: "inherit",
  });

  nextProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`Standalone Next.js server exited with code ${code}`);
    }
  });

  return waitForPort(APP_PORT);
}

function configureAutoUpdater() {
  if (!app.isPackaged) return;

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
    console.error("Auto-update error:", error);
    setUpdateStatus({
      state: "error",
      message: "Update check failed.",
      error: updateErrorMessage(error),
    });
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available; downloading.");
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
    console.log("Update downloaded; it will install on quit.");
    setUpdateStatus({
      state: "downloaded",
      message: "Update ready. Restart to install.",
      availableVersion: info?.version ?? updateStatus.availableVersion,
      error: null,
    });
  });

  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((error) => {
      console.error("Update check failed:", error);
    });
  }, 10000);

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((error) => {
      console.error("Update check failed:", error);
    });
  }, 6 * 60 * 60 * 1000);
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
  if (updateStatus.state !== "downloaded") {
    return updateStatus;
  }

  autoUpdater.quitAndInstall(false, true);
  return updateStatus;
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: "Play It All",
    icon: path.join(app.getAppPath(), "electron", "assets", "icon.png"),
    backgroundColor: "#0b0c10",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(app.getAppPath(), "electron", "preload.cjs"),
      sandbox: true,
    },
  });

  mainWindow.webContents.setUserAgent(
    app.userAgentFallback.replace(/\sElectron\/[^\s]+/, "")
  );

  mainWindow.loadURL(APP_URL);

  mainWindow.webContents.once("did-finish-load", () => {
    console.log("Window loaded successfully");
    mainWindow.show();
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error("Failed to load window:", errorCode, errorDescription);
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  try {
    console.log("App ready, starting Next.js server...");
    await startNextServer();
    console.log("Next.js server started, creating window...");
    createWindow();
    configureAutoUpdater();
    console.log("Window created");
  } catch (error) {
    console.error("Failed to start app:", error);
    app.quit();
  }

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

app.on("before-quit", () => {
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
});
