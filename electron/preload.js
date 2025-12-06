const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    ensureFolder: (path) => ipcRenderer.invoke('ensure-folder', path),
    readJSON: (path) => ipcRenderer.invoke('read-json', path),
    writeJSON: (path, data) => ipcRenderer.invoke('write-json', path, data),
    listDir: (path) => ipcRenderer.invoke('list-dir', path),
    deletePath: (path) => ipcRenderer.invoke('delete-path', path),
    renamePath: (oldPath, newPath) => ipcRenderer.invoke('rename-path', oldPath, newPath),
    pathExists: (path) => ipcRenderer.invoke('path-exists', path)
});
