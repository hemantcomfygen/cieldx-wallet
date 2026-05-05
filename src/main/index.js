import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { autoUpdater } from "electron-updater";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

let mainWindow;

// ------------------------------------------------------
// Create Window
// ------------------------------------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 1080,
    title: "CieldX Wallet",
    icon: path.join(__dirname, "../resources/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.maximize();

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

// ------------------------------------------------------
// Send to renderer safely
// ------------------------------------------------------
function sendToRenderer(channel, data) {
  if (mainWindow) {
    mainWindow.webContents.send(channel, data);
  }
}

// ------------------------------------------------------
// AUTO UPDATER EVENTS
// ------------------------------------------------------
autoUpdater.logger = console;
autoUpdater.logger.transports.file.level = "info";

// Optional but useful
autoUpdater.autoDownload = true;

autoUpdater.on("checking-for-update", () => {
  console.log("Checking for update...");
});

autoUpdater.on("update-available", () => {
  console.log("Update available");
  sendToRenderer("update-available");
});

autoUpdater.on("update-not-available", () => {
  console.log("No updates found");
});

autoUpdater.on("download-progress", (progress) => {
  console.log("Download:", progress.percent);
  sendToRenderer("update-progress", progress.percent);
});

autoUpdater.on("update-downloaded", () => {
  console.log("Update downloaded");
  sendToRenderer("update-downloaded");
});

// ------------------------------------------------------
// IPC
// ------------------------------------------------------
ipcMain.handle("fetch-data", async (_, url) => {
  try {
    const res = await axios.get(url);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Install trigger
ipcMain.on("install-update", () => {
  if (process.platform !== "linux") {
    autoUpdater.quitAndInstall();
  } else {
    console.log("Linux → manual restart required");
  }
});

// ------------------------------------------------------
// APP READY
// ------------------------------------------------------
app.whenReady().then(() => {
  createWindow();

  if (!isDev) {
    // 🔥 IMPORTANT: Explicit GitHub config
    autoUpdater.setFeedURL({
      provider: "github",
      owner: "hemantcomfygen",
      repo: "cieldx-wallet",
    });

    // 🔥 Better method
    autoUpdater.checkForUpdatesAndNotify();

    // Debug force check
    setTimeout(() => {
      console.log("FORCE CHECK...");
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});