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
  getVoiceLanguages,
  getVoicesForLanguage,
  getSelectedVoice,
  getTtsVoiceDiagnostics,
  getDisplayVoiceLabel,
  voiceKeyFromVoice,
  voiceMatchesKey,
  __resetTtsDiscovery,
} = await import('../src/lib/speechSynthesis.js');

function looksLikeRawVoiceUri(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[a-z]{2}-[a-z]{2}-x-/i.test(str) || /^urn:moz-tts:/i.test(str) || /^[a-z]+:\/\//i.test(str);
}

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

    await testAsync('getVoiceLanguages groups voices by language', async () => {
      const languages = await getVoiceLanguages();
      assert.ok(languages.length >= 2);
      assert.ok(languages.some((l) => l.lang === 'de-DE'));
      assert.ok(languages.some((l) => l.lang === 'en-US'));
      assert.ok(languages.every((l) => l.label && !looksLikeRawVoiceUri(l.label)));
    });

    await testAsync('getVoicesForLanguage returns neutral display names', async () => {
      const voices = await getVoicesForLanguage('de-DE');
      assert.equal(voices.length, 3);
      assert.ok(voices.every((v) => v.displayName));
      assert.ok(voices.every((v) => !looksLikeRawVoiceUri(v.displayName)));
      assert.ok(voices[0].displayName.includes('Stimme'));
    });

    await testAsync('getDisplayVoiceLabel does not expose raw Android voice URIs', async () => {
      const voices = await getVoicesForLanguage('de-DE');
      for (const v of voices) {
        const label = getDisplayVoiceLabel(v);
        assert.ok(label);
        assert.ok(!looksLikeRawVoiceUri(label), `label should not be a raw URI: ${label}`);
      }
      const raw = { voiceURI: 'de-de-x-gpp-local', name: 'de-de-x-gpp-local', lang: 'de-DE', index: 0 };
      const label = getDisplayVoiceLabel(raw);
      assert.ok(!label.includes('de-de-x-gpp-local'));
    });

    await testAsync('fallback selects a German local voice without inventing gender', async () => {
      const selected = await getSelectedVoice();
      assert.equal(selected.useSystemVoice, false);
      assert.ok(selected.voice);
      assert.ok(selected.voice.lang?.toLowerCase().startsWith('de'));
      assert.equal(selected.voice.localService, true);
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

    await testAsync('saved voice falls back to a German local voice when missing', async () => {
      const saved = { uri: 'de-de-x-xxx-local', name: '', lang: 'de-DE' };
      setTtsSettings({ enabled: true, useSystemVoice: false, voiceKey: saved });
      const selected = await getSelectedVoice();
      assert.equal(selected.useSystemVoice, false);
      assert.ok(selected.voice);
      assert.ok(selected.voice.lang?.toLowerCase().startsWith('de'));
      assert.equal(selected.voice.localService, true);
      setTtsSettings({ enabled: true, useSystemVoice: false, voiceKey: null });
    });
  }

  console.log('\nSingle-select identity (Phase 1G regression: duplicate-name Android voices)');
  {
    // All three German sample voices intentionally share the exact same
    // generic `name` ("Deutsch Deutschland"), mirroring real Android TTS
    // engines. Only voiceURI/index must disambiguate them - never name+lang.
    const [, isf, gpp, rad] = sampleVoices;
    test('same-named voices are distinguished by voiceURI', () => {
      const key = voiceKeyFromVoice(gpp);
      assert.equal(voiceMatchesKey(isf, key), false);
      assert.equal(voiceMatchesKey(gpp, key), true);
      assert.equal(voiceMatchesKey(rad, key), false);
    });

    test('exactly one voice matches a given key among duplicates', async () => {
      const list = await getVoicesForLanguage('de-DE');
      const key = voiceKeyFromVoice(list[1]);
      const matches = list.filter((v) => voiceMatchesKey(v, key));
      assert.equal(matches.length, 1, `expected exactly one match, got ${matches.length}`);
    });

    test('switching selection deselects the previous voice (radio-button behavior)', async () => {
      const list = await getVoicesForLanguage('de-DE');
      let selectedKey = voiceKeyFromVoice(list[0]);
      assert.equal(list.filter((v) => voiceMatchesKey(v, selectedKey)).length, 1);
      assert.ok(voiceMatchesKey(list[0], selectedKey));
      assert.ok(!voiceMatchesKey(list[1], selectedKey));
      assert.ok(!voiceMatchesKey(list[2], selectedKey));

      // Select a different voice - the old selection must lose its state.
      selectedKey = voiceKeyFromVoice(list[2]);
      assert.ok(!voiceMatchesKey(list[0], selectedKey));
      assert.ok(!voiceMatchesKey(list[1], selectedKey));
      assert.ok(voiceMatchesKey(list[2], selectedKey));
    });

    test('a key without uri/index still falls back to name+lang (legacy persisted data)', () => {
      const legacyKey = { uri: '', name: 'Deutsch Deutschland', lang: 'de-DE', index: null };
      // Legacy keys genuinely cannot disambiguate - this documents the
      // fallback behavior for old persisted settings, not the normal path.
      assert.ok(voiceMatchesKey(isf, legacyKey));
    });

    await testAsync('persisted voiceKey selects the exact saved voice, not a same-named sibling', async () => {
      const saved = voiceKeyFromVoice(gpp);
      setTtsSettings({ enabled: true, useSystemVoice: false, voiceKey: saved });
      const selected = await getSelectedVoice();
      assert.equal(selected.voice.voiceURI, 'de-de-x-gpp-local');
      assert.notEqual(selected.voice.voiceURI, isf.voiceURI);
      assert.notEqual(selected.voice.voiceURI, rad.voiceURI);
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
