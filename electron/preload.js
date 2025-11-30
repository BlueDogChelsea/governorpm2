const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    ensureFolder: (path) => ipcRenderer.invoke('ensure-folder', path),
    readJSON: (path) => ipcRenderer.invoke('read-json', path),
    writeJSON: (path, data) => ipcRenderer.invoke('write-json', path, data)
});
