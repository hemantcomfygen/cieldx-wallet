import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

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

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
