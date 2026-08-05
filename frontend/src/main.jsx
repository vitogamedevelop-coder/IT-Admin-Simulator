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

// After a new deploy, an already-open tab still has the previous build's
// chunk URLs (content-hashed filenames) baked into its loaded modules. Once
// the old files are gone from the server, any later lazy `import()` for a
// route the user hasn't visited yet (e.g. Academy) 404s with "Failed to
// fetch dynamically imported module". Vite dispatches `vite:preloadError`
// for exactly this case, so we recover by reloading once to pick up the
// current build instead of leaving the user stuck. The sessionStorage guard
// prevents a reload loop if the failure is a real, persistent network issue.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  const key = 'vite-preload-reload-at'
  const last = Number(sessionStorage.getItem(key) || 0)
  if (Date.now() - last > 10000) {
    sessionStorage.setItem(key, String(Date.now()))
    window.location.reload()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

export { restoreGitHubPagesRedirect }
