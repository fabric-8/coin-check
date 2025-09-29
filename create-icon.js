const fs = require('fs');
const path = require('path');

// Create a simple 16x16 PNG icon
// This is a base64 encoded PNG of a simple coin icon
const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEYSURBVDiNpZMxTsMwFIa/Z06aQqGCgQEJiY2BiStw0nIDLsAB2Bm5AjfgBByBiYGFhQEJqVKbtH7PDrFjOzQSf2TJlt/3/+9Znmdw4EopAIA551jbGGPgnEPfRUQAAGutF0qpUCm1MMa0IYSt975xzm2dc1trLXvvCSG0xpjFz1oppbC2RCSttaGU0lprpZQihEBrzd57nHMQQsAYg1IqXNsYExYRMcZ4IQRKKVFKCWstay1LCFFK8ZxTSomIGGP8YhFRrLXsrGWtZWcta+vj2jLGRN8UEQGAOI7neZ6/5nn+Nk3ThYPMsuxpkiTvURRd7gcQEQgh7pxzV865GyHE/b8vISJ67LquPu26rjpF/P36ZP/xH9K/AJSN7d2DAAAAAElFTkSuQmCC';

const iconBuffer = Buffer.from(iconBase64, 'base64');
const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');

fs.writeFileSync(iconPath, iconBuffer);
console.log('Icon created at:', iconPath);