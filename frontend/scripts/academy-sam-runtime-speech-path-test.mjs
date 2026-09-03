import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  get length() { return store.size; },
  key: (i) => Array.from(store.keys())[i] ?? null,
};
globalThis.window = { speechSynthesis: null, dispatchEvent: () => {} };
globalThis.Event = class { constructor(t) { this.type = t; } };

let lastUtterance = null;
let germanMale = null;
let germanFemale = null;

async function resetVoices() {
  lastUtterance = null;
  // Two German voices: a female and the desired Sam male voice.
  germanFemale = {
    name: 'Deutsch Stimme 1',
    voiceURI: 'urn:chrome-voice:de-de-female',
    lang: 'de-DE',
    localService: true,
  };
  germanMale = {
    name: 'Deutsch Stimme 3',
    voiceURI: 'urn:chrome-voice:de-de-male',
    lang: 'de-DE',
    localService: true,
  };
  const voices = [germanFemale, germanMale];

  globalThis.window.speechSynthesis = {
    getVoices: () => voices,
    cancel: () => {},
    resume: () => {},
    speak: (u) => { lastUtterance = u; },
    paused: false,
    onvoiceschanged: undefined,
  };

  globalThis.window.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };

  // Force the TTS module to pick up the new voices on first call.
  const { __resetTtsDiscovery } = await import('../src/lib/speechSynthesis.js');
  __resetTtsDiscovery();
}

// The module caches voices; reset voices then import the speech helpers.
await resetVoices();
const { resolveCharacterVoice, getCharacterVoice, speakAs } = await import('../src/lib/speechSynthesis.js');

console.log('=== Academy Sam Runtime Speech Path Test ===');

console.log('A. resolveCharacterVoice canonical mapping...');
assert.strictEqual(resolveCharacterVoice('Sam'), 'sam', 'Sam resolves to canonical sam');
assert.strictEqual(resolveCharacterVoice('sam richter'), 'sam', 'sam richter resolves to sam');

console.log('B. getCharacterVoice picks the Sam profile voice...');
const samVoice = await getCharacterVoice('sam');
assert(samVoice, 'getCharacterVoice must return a voice for sam');
assert.strictEqual(samVoice.voiceURI, germanMale.voiceURI, `Sam must get the male voice, got ${samVoice.name}`);

console.log('C. speakAs with speakerId sam sets the utterance voice...');
await speakAs('Hallo, ich bin Sam.', { speakerId: 'sam', speechText: 'Hallo, ich bin Sam.' });
assert(lastUtterance, 'speakAs must call speechSynthesis.speak');
assert(lastUtterance.voice, 'Sam utterance must have a voice assigned');
assert.strictEqual(lastUtterance.voice.voiceURI, germanMale.voiceURI, 'Academy/Hallway Sam must use the same final voice');
assert.strictEqual(lastUtterance.lang, 'de-DE', 'Utterance must be de-DE');

console.log('D. speakAs without speakerId falls back to selected German voice...');
lastUtterance = null;
await speakAs('Hallo', { speechText: 'Hallo' });
assert(lastUtterance, 'speakAs fallback must call speechSynthesis.speak');
assert(lastUtterance.voice, 'Fallback utterance must have a voice');
assert.strictEqual(lastUtterance.voice.lang.toLowerCase().startsWith('de'), true, 'Fallback voice must still be German');

console.log('=== Academy Sam Runtime Speech Path Test passed ===');



