// Force clear service worker cache khi có version mới
const APP_VERSION = '1.0.7';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      registrations.forEach(reg => reg.unregister());
      localStorage.setItem('app_version', APP_VERSION);
      if (storedVersion !== null) window.location.reload();
      else localStorage.setItem('app_version', APP_VERSION);
    }
  });
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
