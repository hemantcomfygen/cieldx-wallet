import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { autoUpdater } from "electron-updater";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect dev mode
const isDev = !app.isPackaged;


// ------------------------------------------------------
// Create Browser Window
// ------------------------------------------------------
function createWindow() {
  const win = new BrowserWindow({
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

  win.maximize();

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

// ------------------------------------------------------
// Safe Renderer Sender
// ------------------------------------------------------
function sendToRenderer(channel, data) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data);
  }
}

// ------------------------------------------------------
// IPC Handler (Renderer → Main → Axios → Renderer)
// ------------------------------------------------------
ipcMain.handle("fetch-data", async (event, url) => {
  try {
    const res = await axios.get(url);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.on("install-update", () => {
  if (process.platform === "linux") {
    console.log("Linux detected - quitting app for manual update");
    app.quit();
  } else {
    autoUpdater.quitAndInstall();
  }
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});


let isCheckingForUpdate = false;

// ------------------------------------------------------
// App Lifecycle
// ------------------------------------------------------
app.whenReady().then(() => {
  createWindow();

  if (!isDev) {
    // isCheckingForUpdate = true;

    try {
      autoUpdater.logger = console;

      if (autoUpdater.logger?.transports?.file) {
        autoUpdater.logger.transports.file.level = "info";
      }

      autoUpdater.on("update-available", (info) => {
        sendToRenderer("update-available", {
          version: info.version,
        });
      });

      autoUpdater.on("download-progress", (progress) => {
        sendToRenderer("update-progress", progress.percent);
      });

      autoUpdater.on("update-downloaded", () => {
        sendToRenderer("update-downloaded");
      });

      autoUpdater.checkForUpdates();
      autoUpdater.checkForUpdatesAndNotify();

    } catch (err) {
      console.error(err);
    }
  }

  // macOS behavior
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});