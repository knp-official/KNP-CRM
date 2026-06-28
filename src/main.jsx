// Force clear service worker cache khi có version mới
const APP_VERSION = '1.0.9';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    try {
      const storedVersion = localStorage.getItem('app_version');
      if (storedVersion !== APP_VERSION) {
        registrations.forEach(reg => reg.unregister());
        localStorage.setItem('app_version', APP_VERSION);
        // Chỉ reload 1 lần nếu trước đó đã có version cũ (không phải lần đầu)
        if (storedVersion !== null) {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error('[SW] version check error:', e);
    }
  }).catch(e => console.error('[SW] getRegistrations error:', e));

  // Guard chống reload loop: chỉ reload 1 lần mỗi session khi SW mới activate
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (sessionStorage.getItem('sw_reloaded')) return;
    sessionStorage.setItem('sw_reloaded', '1');
    window.location.reload();
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
