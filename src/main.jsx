import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { storageService } from './utils/storage';
import { nativeService } from './services/nativeService';

async function bootstrap() {
  try {
    await storageService.init();
    await nativeService.init();
  } catch (err) {
    console.warn('[Bootstrap] Error during pre-render init:', err);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
