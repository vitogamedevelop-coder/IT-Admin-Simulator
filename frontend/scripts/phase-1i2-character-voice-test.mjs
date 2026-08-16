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
    { voiceURI: 'de-2', name: 'Deutsch Stimme 2', lang: 'de-DE', localService: true, index: 60 },
    { voiceURI: 'de-3', name: 'Deutsch Stimme 3', lang: 'de-DE', localService: true, index: 62 },
    { voiceURI: 'de-4', name: 'Deutsch Stimme 4', lang: 'de-DE', localService: true, index: 64 },
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
  assert.equal(maraVoice.name, 'Deutsch Stimme 1', 'Mara uses Deutsch Stimme 1');

  const davidVoice = await getCharacterVoice('david');
  assert.ok(davidVoice, 'David voice resolved');
  assert.equal(davidVoice.name, 'Deutsch Stimme 4', 'David uses Deutsch Stimme 4');

  const samVoice = await getCharacterVoice('sam');
  assert.ok(samVoice, 'Sam voice resolved');
  assert.equal(samVoice.name, 'Deutsch Stimme 3', 'Sam uses Deutsch Stimme 3');

  const aylinVoice = await getCharacterVoice('aylin');
  assert.ok(aylinVoice, 'Aylin voice resolved');
  assert.equal(aylinVoice.name, 'Deutsch Stimme 6', 'Aylin uses Deutsch Stimme 6');

  const thomasVoice = await getCharacterVoice('thomas');
  assert.ok(thomasVoice, 'Thomas voice resolved');
  assert.equal(thomasVoice.name, 'Deutsch Stimme 7', 'Thomas uses Deutsch Stimme 7');

  const unknown = await getCharacterVoice('nonexistent');
  assert.equal(unknown, null, 'Unknown character returns null');
});

withLocalStorage(async () => {
  // When the exact preferred voice is missing, fall back to any German voice
  // instead of a non-German one, and never to a fixed global female fallback.
  const voices = [
    { voiceURI: 'de-2', name: 'Deutsch Stimme 2', lang: 'de-DE', localService: true, index: 60 },
    { voiceURI: 'en-1', name: 'English Voice 1', lang: 'en-US', localService: true, index: 0 },
  ];
  globalThis.window.speechSynthesis = {
    getVoices() { return voices; },
    onvoiceschanged: null,
  };

  const voice = await getCharacterVoice('mara');
  assert.ok(voice, 'Falls back to a German voice when preferred voice is absent');
  assert.ok(voice.lang.toLowerCase().startsWith('de'), 'Fallback is German');
});

withLocalStorage(async () => {
  // Index alone must not be confused between characters.
  // Give every character the wrong index but the right name and verify name wins.
  const voices = [
    { voiceURI: 'mara-wrong', name: 'Deutsch Stimme 1', lang: 'de-DE', localService: true, index: 999 },
    { voiceURI: 'david-wrong', name: 'Deutsch Stimme 4', lang: 'de-DE', localService: true, index: 999 },
    { voiceURI: 'sam-wrong', name: 'Deutsch Stimme 3', lang: 'de-DE', localService: true, index: 999 },
    { voiceURI: 'aylin-wrong', name: 'Deutsch Stimme 6', lang: 'de-DE', localService: true, index: 999 },
    { voiceURI: 'thomas-wrong', name: 'Deutsch Stimme 7', lang: 'de-DE', localService: true, index: 999 },
  ];
  globalThis.window.speechSynthesis = {
    getVoices() { return voices; },
    onvoiceschanged: null,
  };

  assert.equal((await getCharacterVoice('mara')).name, 'Deutsch Stimme 1', 'Name match wins over index for Mara');
  assert.equal((await getCharacterVoice('david')).name, 'Deutsch Stimme 4', 'Name match wins over index for David');
  assert.equal((await getCharacterVoice('sam')).name, 'Deutsch Stimme 3', 'Name match wins over index for Sam');
  assert.equal((await getCharacterVoice('aylin')).name, 'Deutsch Stimme 6', 'Name match wins over index for Aylin');
  assert.equal((await getCharacterVoice('thomas')).name, 'Deutsch Stimme 7', 'Name match wins over index for Thomas');
});

console.log('Phase 1I.2 Character Voice Tests: OK');
