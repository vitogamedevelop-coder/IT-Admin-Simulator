import assert from 'node:assert/strict';
import { APP_VERSION } from '../src/lib/version.js';

// Mock persistence globals needed by the upgrade layer.
const localStore = new Map();
const sessionStore = new Map();
const cacheStore = new Map();
let reloaded = false;

function makeStorage(store) {
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] ?? null,
  };
}

globalThis.localStorage = makeStorage(localStore);
globalThis.sessionStorage = makeStorage(sessionStore);
globalThis.window = {
  dispatchEvent: () => {},
  location: {
    reload: () => { reloaded = true; },
  },
};
// Mirror the new globals onto window because the upgrade layer checks window.caches.
globalThis.window.caches = globalThis.caches;
globalThis.window.navigator = globalThis.navigator;
globalThis.Event = class { constructor(t) { this.type = t; } };
Object.defineProperty(globalThis, 'navigator', { value: { serviceWorker: null }, configurable: true });
Object.defineProperty(globalThis, 'caches', {
  value: {
    open: async (name) => {
      if (!cacheStore.has(name)) cacheStore.set(name, new Map());
      return cacheStore.get(name);
    },
    keys: async () => Array.from(cacheStore.keys()),
    delete: async (name) => { const had = cacheStore.has(name); cacheStore.delete(name); return had; },
  },
  configurable: true,
});

const { handleAppUpgrade } = await import('../src/lib/appUpgrade.js');

console.log('=== App Cache Version Invalidation Test ===');

// Simulate an older version, an intermediate version, the current version bucket,
// and an unrelated browser cache that must be left alone.
cacheStore.set('cyberlearn-v1.77.3', new Map());
cacheStore.set('cyberlearn-v1.77.4', new Map());
cacheStore.set(`cyberlearn-v${APP_VERSION}`, new Map());
cacheStore.set('other-site-cache', new Map());

// User save must NOT be touched.
localStore.set('cyberlearn:app-version', '1.77.3');
localStore.set('cyberlearn:academy-progress-v1', JSON.stringify({
  stateVersion: 10,
  playerProfile: {},
  topics: {},
}));

console.log('A. Old cache exists, version stored = 1.77.3 ...');

const reloading = await handleAppUpgrade();

assert(reloading, 'handleAppUpgrade must request a reload on version change');
assert(!cacheStore.has('cyberlearn-v1.77.3'), 'stale cyberlearn-v1.77.3 cache must be deleted');
assert(!cacheStore.has('cyberlearn-v1.77.4'), 'stale cyberlearn-v1.77.4 cache must be deleted');
assert(cacheStore.has(`cyberlearn-v${APP_VERSION}`), `current cyberlearn-v${APP_VERSION} cache must be preserved`);
assert(cacheStore.has('other-site-cache'), 'non-cyberlearn caches must not be touched');
assert.strictEqual(localStore.get('cyberlearn:app-version'), APP_VERSION, 'app version marker must be updated');
assert(sessionStore.get('cyberlearn:upgrade-reloaded'), '1', 'upgrade-reloaded flag must be set to prevent reload loop');
assert(reloaded, 'window.location.reload must be called once');

console.log('B. User save was preserved ...');
const save = JSON.parse(localStore.get('cyberlearn:academy-progress-v1'));
assert(save, 'academy save must still exist');

console.log('=== App Cache Version Invalidation Test passed ===');









