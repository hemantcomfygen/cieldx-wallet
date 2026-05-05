import { contextBridge, ipcRenderer } from "electron";

// Store listeners safely
const listeners = {
  updateAvailable: null,
  updateProgress: null,
  updateDownloaded: null,
};

contextBridge.exposeInMainWorld("api", {
  // ----------------------------
  // API CALL
  // ----------------------------
  fetchData: (url) => ipcRenderer.invoke("fetch-data", url),

  // ----------------------------
  // UPDATE EVENTS
  // ----------------------------
  onUpdateAvailable: (callback) => {
    if (listeners.updateAvailable) {
      ipcRenderer.removeListener("update-available", listeners.updateAvailable);
    }

    listeners.updateAvailable = (_, data) => callback(data);
    ipcRenderer.on("update-available", listeners.updateAvailable);
  },

  onUpdateProgress: (callback) => {
    if (listeners.updateProgress) {
      ipcRenderer.removeListener("update-progress", listeners.updateProgress);
    }

    listeners.updateProgress = (_, percent) => callback(percent);
    ipcRenderer.on("update-progress", listeners.updateProgress);
  },

  onUpdateDownloaded: (callback) => {
    if (listeners.updateDownloaded) {
      ipcRenderer.removeListener("update-downloaded", listeners.updateDownloaded);
    }

    listeners.updateDownloaded = () => callback();
    ipcRenderer.on("update-downloaded", listeners.updateDownloaded);
  },

  // ----------------------------
  // CLEANUP (VERY IMPORTANT)
  // ----------------------------
  removeAllUpdateListeners: () => {
    if (listeners.updateAvailable) {
      ipcRenderer.removeListener("update-available", listeners.updateAvailable);
      listeners.updateAvailable = null;
    }

    if (listeners.updateProgress) {
      ipcRenderer.removeListener("update-progress", listeners.updateProgress);
      listeners.updateProgress = null;
    }

    if (listeners.updateDownloaded) {
      ipcRenderer.removeListener("update-downloaded", listeners.updateDownloaded);
      listeners.updateDownloaded = null;
    }
  },

  // ----------------------------
  // INSTALL UPDATE
  // ----------------------------
  installUpdate: () => ipcRenderer.send("install-update"),
});