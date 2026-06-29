import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const APP_VERSION = '20260629-deadline-v1'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    const currentVersion = localStorage.getItem('app_version')
    if (currentVersion !== APP_VERSION) {
      console.log('🔄 New version detected, updating SW...', APP_VERSION)
      regs.forEach(reg => reg.update())
      localStorage.setItem('app_version', APP_VERSION)
      if (currentVersion) {
        window.location.reload(true)
      }
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
