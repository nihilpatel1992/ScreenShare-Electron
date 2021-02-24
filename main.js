// JavaScript source code
const { app, BrowserWindow } = require('electron');

//ipcMain.on('dom-ready-command', (event, height) => {
//    clipboardWindow.setSize(config.WIDTH, height, false);
//    clipboardWindow.setPosition(clipwin_x, clipwin_y, false);

//})

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    })

    win.loadFile('screenShare.html')
    
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
