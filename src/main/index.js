import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { autoUpdater } from "electron-updater";

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
    // Development (Vite dev server)
    win.loadURL("http://localhost:5173");
  } else {
    // Production (Load built index.html)
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

function sendToRenderer(channel, data) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send(channel, data);
  }
}

autoUpdater.on("checking-for-update", () => {
  sendToRenderer("update-checking");
});

autoUpdater.on("update-available", () => {

  console.log("update available")
  sendToRenderer("update-available");
});

autoUpdater.on("update-not-available", () => {
  sendToRenderer("update-not-available");
});

autoUpdater.on("download-progress", (progress) => {
  sendToRenderer("update-progress", progress.percent);
});

autoUpdater.on("update-downloaded", () => {
  sendToRenderer("update-downloaded");
});

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

// ------------------------------------------------------
// App Lifecycle
// ------------------------------------------------------
app.whenReady().then(() => {
  createWindow();

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
