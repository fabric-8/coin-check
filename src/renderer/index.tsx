import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Declare the electronAPI on window
declare global {
  interface Window {
    electronAPI?: {
      getPrices: () => Promise<any>;
      setCurrency: (currency: string) => Promise<any>;
      hideWindow: () => void;
    };
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);