// TTS voice selection test.
//
// Mocks localStorage and the Capacitor TTS plugin, then validates the
// discovery, fallback and persistence logic in src/lib/speechSynthesis.js.
// The real Capacitor plugin is NOT imported here; the speech module reads
// the injected mock from globalThis.__CAPACITOR_TTS_MOCK__.
import assert from 'node:assert/strict';

// ---------- localStorage mock ----------
class LocalStorageMock {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const localStorage = new LocalStorageMock();
globalThis.localStorage = localStorage;

// ---------- Capacitor TTS plugin mock ----------
function makeMockTts(voices, emptyForN = 0) {
  return {
    voices,
    emptyForN,
    callCount: 0,
    async getSupportedVoices() {
      this.callCount += 1;
      if (this.callCount <= this.emptyForN) {
        return { voices: [] };
      }
      return { voices: this.voices };
    },
    async getSupportedLanguages() {
      return { languages: ['de-DE', 'en-US'] };
    },
    async getTtsDiagnostics() {
      return { diagnostics: 'defaultEngine=com.google.android.tts' };
    },
    async stop() {},
  };
}

const sampleVoices = [
  { voiceURI: 'en-us-x-sfg-local', name: 'English US', lang: 'en-US', localService: true },
  { voiceURI: 'de-de-x-isf-local', name: 'Deutsch Deutschland', lang: 'de-DE', localService: true },
  { voiceURI: 'de-de-x-gpp-local', name: 'Deutsch Deutschland', lang: 'de-DE', localService: true },
  { voiceURI: 'de-de-x-rad-network', name: 'Deutsch Deutschland', lang: 'de-DE', localService: false },
];

// The first getSupportedVoices call is intentionally empty so the retry logic
// is exercised.  After that the voices appear, just like on a real Android
// device where the plugin needs a short moment to warm up.
globalThis.__CAPACITOR_TTS_MOCK__ = {
  tts: makeMockTts(sampleVoices, 1),
  capacitor: { isNativePlatform: () => true },
};

// Keep the retry loop short for the test runner.
globalThis.__TTS_TEST_CONFIG__ = {
  discoveryTimeoutMs: 250,
  discoveryInitialDelayMs: 20,
  discoveryMaxDelayMs: 100,
  discoveryEmptyCooldownMs: 50,
};

const {
  getTtsSettings,
  setTtsSettings,
  getVoices,
  getGermanVoices,
  getSelectedVoice,
  getTtsVoiceDiagnostics,
  voiceKeyFromVoice,
  __resetTtsDiscovery,
} = await import('../src/lib/speechSynthesis.js');

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

(async () => {
  console.log('Default settings and persistence');
  {
    test('default useSystemVoice is false', () => {
      const settings = getTtsSettings();
      assert.equal(settings.enabled, true);
      assert.equal(settings.useSystemVoice, false);
      assert.equal(settings.voiceKey, null);
    });

    test('settings persist to localStorage', () => {
      const savedKey = voiceKeyFromVoice(sampleVoices[2]);
      setTtsSettings({ enabled: false, useSystemVoice: true, voiceKey: savedKey });
      const settings = getTtsSettings();
      assert.equal(settings.enabled, false);
      assert.equal(settings.useSystemVoice, true);
      assert.deepEqual(settings.voiceKey, savedKey);
    });

    // Reset to the new defaults for the rest of the tests.
    localStorage.clear();
  }

  console.log('\nVoice discovery and selection');
  {
    await testAsync('getVoices returns voices with indices', async () => {
      const voices = await getVoices();
      assert.equal(voices.length, sampleVoices.length);
      assert.ok(voices.every((v) => typeof v.index === 'number'));
      assert.ok(voices.some((v) => v.voiceURI === 'de-de-x-gpp-local'));
    });

    await testAsync('getGermanVoices filters German voices', async () => {
      const voices = await getGermanVoices();
      assert.equal(voices.length, 3);
      assert.ok(voices.every((v) => v.lang?.toLowerCase().startsWith('de')));
    });

    await testAsync('preferred male German voice is selected when no voiceKey is set', async () => {
      const selected = await getSelectedVoice();
      assert.equal(selected.useSystemVoice, false);
      assert.ok(selected.voice);
      assert.equal(selected.voice.voiceURI, 'de-de-x-gpp-local');
    });

    await testAsync('saved voice is restored when still present', async () => {
      const saved = voiceKeyFromVoice(sampleVoices[1]); // de-de-x-isf-local
      setTtsSettings({ enabled: true, useSystemVoice: false, voiceKey: saved });
      const selected = await getSelectedVoice();
      assert.equal(selected.useSystemVoice, false);
      assert.equal(selected.voice.voiceURI, 'de-de-x-isf-local');
      // Reset settings.
      setTtsSettings({ enabled: true, useSystemVoice: false, voiceKey: null });
    });

    await testAsync('saved voice falls back when missing', async () => {
      const saved = { uri: 'de-de-x-xxx-local', name: '', lang: 'de-DE' };
      setTtsSettings({ enabled: true, useSystemVoice: false, voiceKey: saved });
      const selected = await getSelectedVoice();
      assert.equal(selected.useSystemVoice, false);
      assert.equal(selected.voice.voiceURI, 'de-de-x-gpp-local');
      setTtsSettings({ enabled: true, useSystemVoice: false, voiceKey: null });
    });
  }

  console.log('\nDiagnostics and empty voice list');
  {
    await testAsync('getTtsVoiceDiagnostics combines plugin diagnostics with voice list', async () => {
      const diag = await getTtsVoiceDiagnostics();
      assert.ok(typeof diag === 'string');
      assert.ok(diag.includes('Discovery status: ready'));
      assert.ok(diag.includes('Total voices: 4'));
      assert.ok(diag.includes('German voices: 3'));
      assert.ok(diag.includes('de-de-x-gpp-local'));
    });

    await testAsync('empty voice list is handled gracefully', async () => {
      const ttsMock = globalThis.__CAPACITOR_TTS_MOCK__.tts;
      ttsMock.voices = [];
      ttsMock.emptyForN = 0;
      ttsMock.callCount = 0;
      __resetTtsDiscovery();

      const voices = await getVoices();
      assert.deepEqual(voices, []);

      const selected = await getSelectedVoice();
      assert.equal(selected.useSystemVoice, true);
      assert.equal(selected.voice, undefined);

      // Restore the original voices so the test runner can continue cleanly.
      ttsMock.voices = sampleVoices;
      ttsMock.emptyForN = 0;
      ttsMock.callCount = 0;
      __resetTtsDiscovery();
    });
  }

  console.log(`\n${passed} tests passed`);
})();
