import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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
const samVoice = {
  name: 'Deutsch Stimme 3',
  voiceURI: 'urn:chrome-voice:de-de-male',
  lang: 'de-DE',
  localService: true,
};

async function setupVoices() {
  globalThis.window.speechSynthesis = {
    getVoices: () => [samVoice],
    cancel: () => {},
    resume: () => {},
    speak: (u) => { lastUtterance = u; },
    paused: false,
    onvoiceschanged: undefined,
  };
  globalThis.window.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };
  const { __resetTtsDiscovery } = await import('../src/lib/speechSynthesis.js');
  __resetTtsDiscovery();
}

await setupVoices();
const { resolveCharacterVoice, getCharacterVoice, speakAs } = await import('../src/lib/speechSynthesis.js');

console.log('=== App Update Voice Regression Test ===');

const lessonRunnerSrc = fs.readFileSync(path.resolve('src/components/LessonRunner.jsx'), 'utf8');
const employeeConversationSrc = fs.readFileSync(path.resolve('src/components/EmployeeConversation.jsx'), 'utf8');

console.log('A. LessonRunner SpeakButton uses the shared speakAs pipeline ...');
assert(lessonRunnerSrc.includes('resolveCharacterVoice'), 'LessonRunner must resolve the speaker');
assert(lessonRunnerSrc.includes('speakAs'), 'LessonRunner must call speakAs, not the legacy speak()');
assert(!/\bspeak\s*\(\s*text/.test(lessonRunnerSrc), 'LessonRunner must not call the unqualified speak(text, ...) function');

console.log('B. EmployeeConversation uses the same speakAs pipeline ...');
assert(employeeConversationSrc.includes('speakerId:'), 'EmployeeConversation must pass speakerId to speakAs');
assert(employeeConversationSrc.includes('speakAs'), 'EmployeeConversation must call speakAs');

console.log('C. Sam resolves to the canonical key and picks the male voice ...');
assert.strictEqual(resolveCharacterVoice('Sam'), 'sam', 'Sam resolves to sam');
const voice = await getCharacterVoice('sam');
assert(voice, 'getCharacterVoice(sam) must return a voice');
assert.strictEqual(voice.voiceURI, samVoice.voiceURI, 'Sam must use the male German voice');

console.log('D. speakAs with speakerId sam assigns the voice at runtime ...');
await speakAs('Test', { speakerId: 'sam', speechText: 'Test' });
assert(lastUtterance, 'speakAs must produce an utterance');
assert.strictEqual(lastUtterance.voice.voiceURI, samVoice.voiceURI, 'utterance must use Sam voice');

console.log('=== App Update Voice Regression Test passed ===');




