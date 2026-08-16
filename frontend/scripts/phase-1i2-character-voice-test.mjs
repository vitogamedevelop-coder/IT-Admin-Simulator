import assert from 'node:assert/strict';
import { getCharacterVoice } from '../src/lib/speechSynthesis.js';

function withLocalStorage(fn) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = {
    speechSynthesis: {
      getVoices() { return []; },
      onvoiceschanged: null,
    },
    dispatchEvent: () => {},
  };
  try {
    fn();
  } finally {
    delete globalThis.localStorage;
  }
}

withLocalStorage(async () => {
  const voices = [
    { voiceURI: 'de-1', name: 'Deutsch Stimme 1', lang: 'de-DE', localService: true, index: 59 },
    { voiceURI: 'de-4', name: 'Deutsch Stimme 4', lang: 'de-DE', localService: true, index: 64 },
    { voiceURI: 'de-3', name: 'Deutsch Stimme 3', lang: 'de-DE', localService: true, index: 62 },
    { voiceURI: 'de-6', name: 'Deutsch Stimme 6', lang: 'de-DE', localService: true, index: 61 },
    { voiceURI: 'de-7', name: 'Deutsch Stimme 7', lang: 'de-DE', localService: true, index: 63 },
    { voiceURI: 'en-1', name: 'English Voice 1', lang: 'en-US', localService: true, index: 0 },
  ];

  globalThis.window.speechSynthesis = {
    getVoices() { return voices; },
    onvoiceschanged: null,
  };

  const maraVoice = await getCharacterVoice('mara');
  assert.ok(maraVoice, 'Mara voice resolved');
  assert.equal(maraVoice.index, 59, 'Mara uses preferred German voice index 59');

  const davidVoice = await getCharacterVoice('david');
  assert.ok(davidVoice, 'David voice resolved');
  assert.equal(davidVoice.index, 64, 'David uses preferred German voice index 64');

  const samVoice = await getCharacterVoice('sam');
  assert.ok(samVoice, 'Sam voice resolved');
  assert.equal(samVoice.index, 62, 'Sam uses preferred German voice index 62');

  const aylinVoice = await getCharacterVoice('aylin');
  assert.ok(aylinVoice, 'Aylin voice resolved');
  assert.equal(aylinVoice.index, 61, 'Aylin uses preferred German voice index 61');

  const thomasVoice = await getCharacterVoice('thomas');
  assert.ok(thomasVoice, 'Thomas voice resolved');
  assert.equal(thomasVoice.index, 63, 'Thomas uses preferred German voice index 63');

  const unknown = await getCharacterVoice('nonexistent');
  assert.equal(unknown, null, 'Unknown character returns null');
});

withLocalStorage(async () => {
  // When preferred index is missing, fall back to a German voice instead of a non-German one.
  const voices = [
    { voiceURI: 'de-2', name: 'Deutsch Stimme 2', lang: 'de-DE', localService: true, index: 60 },
    { voiceURI: 'en-1', name: 'English Voice 1', lang: 'en-US', localService: true, index: 0 },
  ];
  globalThis.window.speechSynthesis = {
    getVoices() { return voices; },
    onvoiceschanged: null,
  };

  const voice = await getCharacterVoice('mara');
  assert.ok(voice, 'Falls back to a German voice when preferred index is absent');
  assert.ok(voice.lang.toLowerCase().startsWith('de'), 'Fallback is German');
});

console.log('Phase 1I.2 Character Voice Tests: OK');
