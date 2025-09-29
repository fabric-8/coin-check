"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const os_1 = require("os");
let mainWindow = null;
let tray = null;
const isDev = process.env.NODE_ENV !== 'production';
const isMac = (0, os_1.platform)() === 'darwin';
function createTray() {
    // Fix icon path for development
    const iconPath = isDev
        ? path.join(__dirname, '../../src/assets/icon.png')
        : path.join(__dirname, '../assets/icon.png');
    console.log('Loading icon from:', iconPath);
    const trayIcon = electron_1.nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    tray = new electron_1.Tray(trayIcon);
    tray.setToolTip('CoinCheck - Crypto Price Tracker');
    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            }
            else {
                showWindow();
            }
        }
    });
    tray.on('right-click', () => {
        const contextMenu = electron_1.Menu.buildFromTemplate([
            { label: 'Show CoinCheck', click: () => showWindow() },
            { label: 'Preferences', click: () => openPreferences() },
            { type: 'separator' },
            { label: 'Quit', click: () => electron_1.app.quit() }
        ]);
        tray?.popUpContextMenu(contextMenu);
    });
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 400,
        height: 500,
        show: true, // Show immediately for debugging
        frame: false,
        resizable: isDev, // Allow resize in dev
        fullscreenable: false,
        transparent: false,
        backgroundColor: '#1f2937', // Set a background color
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
    }
    else {
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
    if (!mainWindow)
        return;
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
electron_1.app.whenReady().then(() => {
    createTray();
    createWindow();
    // Hide dock icon on macOS - TEMPORARILY DISABLED for debugging
    // if (isMac && app.dock) {
    //   app.dock.hide();
    // }
});
electron_1.app.on('window-all-closed', () => {
    // Don't quit on macOS when all windows are closed
    if (!isMac) {
        electron_1.app.quit();
    }
});
// IPC handlers for renderer communication
electron_1.ipcMain.handle('get-prices', async () => {
    // This will be handled by the renderer's API service
    return { success: true };
});
electron_1.ipcMain.handle('set-currency', async (event, currency) => {
    // Store currency preference
    return { success: true, currency };
});
electron_1.ipcMain.on('hide-window', () => {
    mainWindow?.hide();
});
