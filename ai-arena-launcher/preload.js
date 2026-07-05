const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("launcher", {
  onPhase: (cb) => ipcRenderer.on("phase", (_event, data) => cb(data)),
  retry: () => ipcRenderer.send("retry"),
  quit: () => ipcRenderer.send("quit"),
});
