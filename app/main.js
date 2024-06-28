const { app, BrowserWindow } = require('electron');
  
  const path = require('path');

  app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
  app.commandLine.appendSwitch ("disable-http-cache");

  let mainWindow = null;
  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      fullscreen: false,
      fullscreenable: true,
      frame: true,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        preload: path.join(__dirname, './preload.js')
      },
    });
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/public/index.html`);

    mainWindow.webContents.once('dom-ready', () => {

    });
    };

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });

    app.whenReady().then(createWindow);
    app.whenReady().then(() => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });