import { app, BrowserWindow, shell } from "electron";
import http from "node:http";
import path from "node:path";
import next from "next";

const APP_PORT = Number(process.env.PLAYITALL_PORT || 3765);
const APP_URL =
  process.env.PLAYITALL_DEV_SERVER_URL || `http://127.0.0.1:${APP_PORT}`;

let mainWindow;
let nextServer;

async function startNextServer() {
  if (process.env.PLAYITALL_DEV_SERVER_URL) return Promise.resolve();

  const nextApp = next({
    dev: false,
    dir: app.getAppPath(),
    hostname: "127.0.0.1",
    port: APP_PORT,
  });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  nextServer = http.createServer((request, response) => {
    handle(request, response);
  });

  await new Promise((resolve, reject) => {
    nextServer.once("error", reject);
    nextServer.listen(APP_PORT, "127.0.0.1", resolve);
  });
}

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
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  await startNextServer();
  createWindow();

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
  if (nextServer) {
    nextServer.close();
    nextServer = null;
  }
});
