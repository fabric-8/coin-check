import { app, BrowserWindow, Tray, Menu, nativeImage, shell, ipcMain } from 'electron';
import * as path from 'path';
import { platform } from 'os';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = process.env.NODE_ENV !== 'production';
const isMac = platform() === 'darwin';

function createTray() {
  // Fix icon path for development
  const iconPath = isDev
    ? path.join(__dirname, '../../src/assets/icon.png')
    : path.join(__dirname, '../assets/icon.png');
  console.log('Loading icon from:', iconPath);
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('CoinCheck - Crypto Price Tracker');

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        showWindow();
      }
    }
  });

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show CoinCheck', click: () => showWindow() },
      { label: 'Preferences', click: () => openPreferences() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray?.popUpContextMenu(contextMenu);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    show: true, // Show immediately for debugging
    frame: false,
    resizable: isDev,  // Allow resize in dev
    fullscreenable: false,
    transparent: false,
    backgroundColor: '#1f2937',  // Set a background color
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    // Wait a bit for webpack dev server to be ready
    setTimeout(() => {
      mainWindow?.loadURL('http://localhost:3000');
      // Open DevTools to see any errors
      mainWindow?.webContents.openDevTools({ mode: 'detach' });
    }, 1000);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('blur', () => {
    // Only hide on blur in production
    if (!isDev) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isFocused()) {
          mainWindow.hide();
        }
      }, 200);
    }
  });
}

function showWindow() {
  if (!mainWindow) return;

  const trayBounds = tray?.getBounds();
  if (trayBounds) {
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - 400 / 2);
    const y = isMac ? trayBounds.y + trayBounds.height : trayBounds.y - 500;

    mainWindow.setPosition(x, y, false);
  }

  mainWindow.show();
  mainWindow.focus();
}

function openPreferences() {
  // TODO: Implement preferences window
  showWindow();
}

app.whenReady().then(() => {
  createTray();
  createWindow();

  // Hide dock icon on macOS - TEMPORARILY DISABLED for debugging
  // if (isMac && app.dock) {
  //   app.dock.hide();
  // }
});

app.on('window-all-closed', () => {
  // Don't quit on macOS when all windows are closed
  if (!isMac) {
    app.quit();
  }
});

// IPC handlers for renderer communication
ipcMain.handle('get-prices', async () => {
  // This will be handled by the renderer's API service
  return { success: true };
});

ipcMain.handle('set-currency', async (event, currency: string) => {
  // Store currency preference
  return { success: true, currency };
});

ipcMain.on('hide-window', () => {
  mainWindow?.hide();
});