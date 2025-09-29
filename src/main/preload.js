const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPrices: () => ipcRenderer.invoke('get-prices'),
  setCurrency: (currency) => ipcRenderer.invoke('set-currency', currency),
  hideWindow: () => ipcRenderer.send('hide-window')
});