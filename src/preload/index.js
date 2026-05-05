import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  fetchData: (url) => ipcRenderer.invoke("fetch-data", url),

  onUpdateAvailable: (callback) =>
    ipcRenderer.on("update-available", () => callback()),

  onUpdateProgress: (callback) =>
    ipcRenderer.on("update-progress", (event, percent) => callback(percent)),

  onUpdateDownloaded: (callback) =>
    ipcRenderer.on("update-downloaded", () => callback()),

  installUpdate: () => ipcRenderer.send("install-update")
});