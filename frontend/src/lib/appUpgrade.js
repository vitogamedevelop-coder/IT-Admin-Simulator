// =============================================================================
// App upgrade handling
//
// Detects when the app has been updated to a new version and performs a
// controlled, idempotent migration:
// 1. normalize the academy save against the current code's rules
// 2. purge stale app-owned caches
// 3. kick the service worker to adopt the new versioned cache bucket
// 4. reload once if needed so the new build's assets take over
//
// User saves (localStorage: cyberlearn:academy-progress-v1 etc.) are NEVER
// cleared here. Only build-specific runtime caches are dropped.
// =============================================================================
import { APP_VERSION } from './version.js';
import { readAcademyProgress, writeAcademyProgress } from './academyProgress.js';

const VERSION_KEY = 'cyberlearn:app-version';
const RELOADED_KEY = 'cyberlearn:upgrade-reloaded';

const KNOWN_CACHE_PREFIXES = ['cyberlearn-'];

function getKnownCacheNames(version) {
  return [`cyberlearn-v${version}`];
}

// Drop every app-owned cache except the bucket for the current version.
async function clearStaleAppCaches(version) {
  if (!('caches' in window)) return;
  try {
    const keep = getKnownCacheNames(version);
    const keys = await caches.keys();
    const toDelete = keys.filter((k) =>
      KNOWN_CACHE_PREFIXES.some((p) => k.startsWith(p)) && !keep.includes(k)
    );
    if (toDelete.length) {
      console.log('[CyberLearn upgrade] clearing stale caches:', toDelete);
      await Promise.all(toDelete.map((k) => caches.delete(k)));
    }
  } catch (e) {
    console.error('[CyberLearn upgrade] cache cleanup failed:', e);
  }
}

// Ask any active service worker to move to the waiting state immediately.
function kickServiceWorker() {
  if (!navigator.serviceWorker) return Promise.resolve();
  return new Promise((resolve) => {
    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage({ type: 'SKIP_WAITING' });
    }
    // Give the message a moment to travel; if the controller is not there
    // the next load will pick up the new registration anyway.
    setTimeout(resolve, 100);
  });
}

async function registerVersionedServiceWorker() {
  if (!navigator.serviceWorker) return;
  try {
    const baseUrl = import.meta.env?.BASE_URL || '/'
    const reg = await navigator.serviceWorker.register(
      `${baseUrl}sw.js?v=${APP_VERSION}`,
      { updateViaCache: 'none' }
    );
    if (reg.installing) {
      console.log('[CyberLearn upgrade] new service worker installing');
      return new Promise((resolve) => {
        const listener = () => {
          if (!reg.installing) {
            resolve();
          }
        };
        reg.addEventListener('updatefound', listener);
        setTimeout(resolve, 500);
      });
    }
  } catch (e) {
    console.error('[CyberLearn upgrade] service worker registration failed:', e);
  }
}

// Validates the running bundle against the build manifest shipped with it.
async function verifyBundleVersion() {
  try {
    const baseUrl = import.meta.env?.BASE_URL || '/'
    const resp = await fetch(`${baseUrl}build-info.json?v=${Date.now()}`);
    const info = await resp.json();
    if (info.version !== APP_VERSION) {
      console.warn('[CyberLearn upgrade] bundle version mismatch:', info.version, '!=', APP_VERSION);
      return false;
    }
    console.log('[CyberLearn upgrade] verified bundle:', info.version, info.buildHash);
    return true;
  } catch (e) {
    console.warn('[CyberLearn upgrade] build-info.json not available', e);
    return true; // be permissive; the build can still work
  }
}

// Public: call once at startup before rendering the app.
// Returns true when a reload has been requested and rendering should abort.
export async function handleAppUpgrade() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion === APP_VERSION) {
    return false;
  }

  console.log(`[CyberLearn upgrade] ${storedVersion ?? 'none'} -> ${APP_VERSION}`);

  // 1. Normalize the academy save so status/theory stay consistent with the
  //    current code. User progress is preserved, only computed/legacy fields
  //    are reconciled.
  const normalized = readAcademyProgress();
  writeAcademyProgress(normalized);

  // 2. Register the versioned service worker first; the new SW will install
  //    a new cache bucket in parallel.
  await registerVersionedServiceWorker();

  // 3. Delete old app-owned caches from the main thread as a belt-and-suspenders.
  await clearStaleAppCaches(APP_VERSION);

  // 4. Force the active controller to hand over to the waiting one.
  await kickServiceWorker();

  // 5. Persist the new version marker.
  localStorage.setItem(VERSION_KEY, APP_VERSION);

  // 6. Reload once to guarantee the new build's assets are loaded.
  //    sessionStorage guard prevents an infinite reload loop.
  if (!sessionStorage.getItem(RELOADED_KEY)) {
    sessionStorage.setItem(RELOADED_KEY, '1');
    console.log('[CyberLearn upgrade] reloading to activate new assets...');
    window.location.reload();
    return true;
  }

  // If the app already reloaded once in this session and still reports a
  // version change, something is wrong. Continue anyway and log a mismatch.
  const bundleOk = await verifyBundleVersion();
  if (!bundleOk) {
    console.error('[CyberLearn upgrade] stale assets detected after reload');
  }
  return false;
}
