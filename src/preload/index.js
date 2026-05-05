import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  fetchData: (url) => ipcRenderer.invoke("fetch-data", url)
});