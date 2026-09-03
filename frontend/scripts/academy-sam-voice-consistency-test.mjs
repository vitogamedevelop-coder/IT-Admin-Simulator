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

const VOICES = [
  { voiceURI: 'de-mara', name: 'Deutsch Stimme 1', lang: 'de-DE', index: 59, localService: true },
  { voiceURI: 'de-sam', name: 'Deutsch Stimme 3', lang: 'de-DE', index: 62, localService: true },
  { voiceURI: 'de-aylin', name: 'Deutsch Stimme 6', lang: 'de-DE', index: 61, localService: true },
  { voiceURI: 'de-david', name: 'Deutsch Stimme 4', lang: 'de-DE', index: 64, localService: true },
  { voiceURI: 'de-thomas', name: 'Deutsch Stimme 7', lang: 'de-DE', index: 63, localService: true },
];

let onvoiceschangedHandler = null;
globalThis.window = {
  dispatchEvent: () => {},
  speechSynthesis: {
    getVoices: () => VOICES,
    set onvoiceschanged(fn) { onvoiceschangedHandler = fn; },
    get onvoiceschanged() { return onvoiceschangedHandler; },
    cancel: () => {},
    speak: () => {},
    paused: false,
    resume: () => {},
  },
};
globalThis.Event = class { constructor(t) { this.type = t; } };

const { resolveCharacterVoice, getCharacterVoice, voiceKeyFromVoice } = await import('../src/lib/speechSynthesis.js');

console.log('=== Academy Sam Voice Consistency Test ===');

console.log('A. resolveCharacterVoice mapping...');
assert.strictEqual(resolveCharacterVoice('Sam'), 'sam', 'Sam => sam');
assert.strictEqual(resolveCharacterVoice('Sam Richter'), 'sam', 'Sam Richter => sam');
assert.strictEqual(resolveCharacterVoice('Senior Admin Sam'), 'sam', 'Senior Admin Sam => sam');
assert.strictEqual(resolveCharacterVoice('senior admin'), 'sam', 'senior admin => sam');
assert.strictEqual(resolveCharacterVoice('mara'), 'mara', 'mara => mara');
assert.strictEqual(resolveCharacterVoice('Mara'), 'mara', 'Mara => mara');
assert.strictEqual(resolveCharacterVoice('Unknown'), null, 'Unknown => null');

console.log('B. getCharacterVoice for Sam from different labels...');
const hallwaySam = await getCharacterVoice('sam');
assert(hallwaySam, 'Hallway Sam voice resolved');
assert.strictEqual(hallwaySam.index, 62, `Hallway Sam voice index must be 62, got ${hallwaySam.index}`);

const academySam = await getCharacterVoice('Sam Richter');
assert(academySam, 'Academy Sam voice resolved');
assert.strictEqual(academySam.index, 62, `Academy Sam voice index must be 62, got ${academySam.index}`);
assert.strictEqual(hallwaySam.voiceURI, academySam.voiceURI, 'Hallway Sam and Academy Sam use the same voice URI');

console.log('C. voice key is identical...');
assert.deepStrictEqual(voiceKeyFromVoice(hallwaySam), voiceKeyFromVoice(academySam), 'voice keys identical');

console.log('D. other characters keep their own voices...');
const mara = await getCharacterVoice('mara');
assert(mara, 'Mara voice resolved');
assert.strictEqual(mara.index, 59, `Mara voice index must be 59, got ${mara.index}`);

const david = await getCharacterVoice('david');
assert(david, 'David voice resolved');
assert.strictEqual(david.index, 64, `David voice index must be 64, got ${david.index}`);

console.log('=== Academy Sam Voice Consistency Test passed ===');





