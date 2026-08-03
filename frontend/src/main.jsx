import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { showDailyReminderIfDue } from './lib/offline'
import { enableUiSounds } from './lib/sound'

// GitHub Pages SPA redirect restoration: if a 404 redirect stored the
// intended path, navigate there after the app has loaded.
function restoreGitHubPagesRedirect(navigate) {
  try {
    const stored = sessionStorage.getItem('gh-pages-redirect')
    if (stored) {
      sessionStorage.removeItem('gh-pages-redirect')
      navigate(stored, { replace: true })
    }
  } catch {
    // ignore storage errors
  }
}

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(console.error)
  showDailyReminderIfDue()
  enableUiSounds()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

export { restoreGitHubPagesRedirect }
