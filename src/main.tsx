// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n'; // Initialize i18n before rendering
import App from './App';

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, app still works
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
