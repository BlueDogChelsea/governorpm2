const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // In development, load from the Vite dev server
    // In production, load the built index.html
    const isDev = !app.isPackaged;

    if (isDev) {
        win.loadURL('http://localhost:5173');
        // Open the DevTools.
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// IPC Handlers for JSON Persistence
ipcMain.handle('ensure-folder', async (event, folderPath) => {
    const fullPath = path.join(app.getAppPath(), folderPath);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
});

ipcMain.handle('read-json', async (event, filePath) => {
    const fullPath = path.join(app.getAppPath(), filePath);
    if (fs.existsSync(fullPath)) {
        const data = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
});

ipcMain.handle('write-json', async (event, filePath, data) => {
    const fullPath = path.join(app.getAppPath(), filePath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    return true;
});

ipcMain.handle('list-dir', async (event, dirPath) => {
    const fullPath = path.join(app.getAppPath(), dirPath);
    if (fs.existsSync(fullPath)) {
        return fs.readdirSync(fullPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    }
    return [];
});

ipcMain.handle('delete-path', async (event, targetPath) => {
    const fullPath = path.join(app.getAppPath(), targetPath);
    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        return true;
    }
    return false;
});

ipcMain.handle('rename-path', async (event, oldPath, newPath) => {
    const fullOld = path.join(app.getAppPath(), oldPath);
    const fullNew = path.join(app.getAppPath(), newPath);
    if (fs.existsSync(fullOld)) {
        fs.renameSync(fullOld, fullNew);
        return true;
    }
    return false;
});

ipcMain.handle('path-exists', async (event, targetPath) => {
    const fullPath = path.join(app.getAppPath(), targetPath);
    return fs.existsSync(fullPath);
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
