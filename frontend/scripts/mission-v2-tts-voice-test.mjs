// Regression test: TTS voice persistence across the new speechSynthesis.js
// and Settings page.  Ensures:
//   - voiceKey is stored, migrated and restored
//   - speak() prefers the saved voice over a random fallback
//   - Web Speech / native voice selection uses the same storage format
//   - Settings TDZ regression does not reappear

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

function read(file) {
  return readFileSync(join(srcDir, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// 1. speechSynthesis.js must store voiceKey (not only voiceId).
const speechSynthesis = read('lib/speechSynthesis.js');
assert(speechSynthesis.includes("TTS_SETTINGS_KEY = 'it-learn:tts-settings-v3'"), 'TTS settings key should be v3');
assert(speechSynthesis.includes('function migrateLegacySettings'), 'TTS should migrate legacy voiceId to voiceKey');
assert(speechSynthesis.includes('voiceKey:'), 'TTS settings should contain voiceKey');
assert(speechSynthesis.includes('function findNativeVoiceByKey'), 'Native voice lookup should use voiceKey');
assert(speechSynthesis.includes('function findWebVoiceByKey'), 'Web voice lookup should use voiceKey');
assert(speechSynthesis.includes('function voiceKeyFromVoice'), 'voiceKeyFromVoice helper should exist');
assert(speechSynthesis.includes('getWebVoices'), 'getWebVoices should be exported');
assert(speechSynthesis.includes('export function isWebTtsSupported'), 'isWebTtsSupported should be exported');
assert(speechSynthesis.includes('export function loadVoices'), 'loadVoices should be exported');

// 2. selectVoice must prefer saved voice.
assert(speechSynthesis.includes('findNativeVoiceByKey(settings.voiceKey)'), 'selectVoice should search native by voiceKey');
assert(speechSynthesis.includes('findWebVoiceByKey(settings.voiceKey)'), 'selectVoice should search web by voiceKey');

// 3. Settings.jsx must not re-import removed exports and must use voiceKey.
const settings = read('pages/Settings.jsx');
assert(!settings.includes('getNativeVoices'), 'Settings should not import removed getNativeVoices');
assert(!settings.includes('isWebTtsSupported'), 'Settings should not import unused isWebTtsSupported');
assert(settings.includes('voiceKeyFromVoice'), 'Settings should use voiceKeyFromVoice');
assert(settings.includes('settings.voiceKey'), 'Settings should display and store voiceKey');
assert(settings.includes('isVoiceSelected'), 'Settings should have isVoiceSelected helper');

// 4. Settings TDZ: refreshDiagnostics is declared before useEffect in the main component.
const componentStart = settings.indexOf('export default function Settings()');
const refreshIndex = settings.indexOf('const refreshDiagnostics = useCallback');
const firstUseEffectIndex = settings.indexOf('useEffect(', componentStart);
assert(refreshIndex > componentStart && firstUseEffectIndex > refreshIndex, 'refreshDiagnostics must be declared before useEffect (TDZ regression)');

// 5. DialogView.jsx still imports loadVoices and it is exported.
const dialogView = read('components/DialogView.jsx');
assert(dialogView.includes('loadVoices'), 'DialogView should still import loadVoices');
assert(speechSynthesis.includes('export function loadVoices'), 'loadVoices must be exported from speechSynthesis');

console.log('TTS voice persistence regression test passed.');
