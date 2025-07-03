import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './LanguageContext.tsx';
import { GameProvider } from './GameContext.tsx';
import { SettingsProvider } from './SettingsContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <SettingsProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </SettingsProvider>
    </LanguageProvider>
  </React.StrictMode>
);