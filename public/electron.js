const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const electron = require('electron'),
    ipc = electron.ipcMain;

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        // titleBarStyle: 'hidden',
        // titleBarOverlay: {
        //     color: '#2f3241',
        //     symbolColor: '#74b1be'
        // },
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true,
            nodeIntegrationInSubFrames: true,
            webSecurity: false
        },
    });

    // and load the index.html of the app.
    // win.loadFile("./index.html");
    // win.loadURL(url.format({
    //     pathname: path.join(__dirname, 'index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    win.loadURL('http://localhost:3000');
    // Open the DevTools.
    // if (isDev) {
    //     win.webContents.openDevTools({ mode: 'detach' });
    // }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

async function runCommand(command) {
    const { stdout, stderr, error } = await exec(command);
    if (stderr) { console.error('stderr:', stderr); }
    if (error) { console.error('error:', error); }
    return stdout;
}

ipc.on('exit', async (event, payload) => {
    console.log({ payload });
    const result = await runCommand('shutdown /s');
});