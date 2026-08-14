// Isolated text-to-speech utility for the Sam TTS test.
// Set this to false to disable the test feature with a single change.
export const ENABLE_SAM_TTS_TEST = true;

const TTS_SETTINGS_KEY = 'it-learn:tts-settings-v3';
const LEGACY_TTS_SETTINGS_KEY = 'it-learn:tts-settings-v2';

// Test-only configuration hook.  In production this is always undefined.
const TEST_CONFIG = (typeof globalThis !== 'undefined' && globalThis.__TTS_TEST_CONFIG__) || {};

const VOICE_DISCOVERY_TIMEOUT_MS = TEST_CONFIG.discoveryTimeoutMs ?? 5000;
const VOICE_DISCOVERY_INITIAL_DELAY_MS = TEST_CONFIG.discoveryInitialDelayMs ?? 100;
const VOICE_DISCOVERY_MAX_DELAY_MS = TEST_CONFIG.discoveryMaxDelayMs ?? 800;
const VOICE_DISCOVERY_EMPTY_COOLDOWN_MS = TEST_CONFIG.discoveryEmptyCooldownMs ?? 2000;

let nativeTtsAvailable = null;
let nativeVoices = null;
let nativeInitPromise = null;
let nativeInitPromiseGeneration = 0;
let nativeDiscoveryStatus = 'idle';
let lastNativeDiscoveryAt = 0;
let nativeDiscoveryGeneration = 0;
let webVoiceCache = null;
let webVoiceCachePromise = null;

// Lazy, safe Capacitor import.  A test harness can inject a mock before this
// module is imported by setting globalThis.__CAPACITOR_TTS_MOCK__.
let CapacitorTTS = null;
let Capacitor = null;

const INJECTED_MOCK = (typeof globalThis !== 'undefined' && globalThis.__CAPACITOR_TTS_MOCK__) || null;

if (INJECTED_MOCK) {
  CapacitorTTS = INJECTED_MOCK.tts || null;
  Capacitor = INJECTED_MOCK.capacitor || null;
}

if (!CapacitorTTS || !Capacitor) {
  try {
    // eslint-disable-next-line import/no-unresolved
    const ttsModule = await import('@capacitor-community/text-to-speech');
    CapacitorTTS = ttsModule.TextToSpeech || null;
  } catch {
    CapacitorTTS = null;
  }

  try {
    // eslint-disable-next-line import/no-unresolved
    const capModule = await import('@capacitor/core');
    Capacitor = capModule.Capacitor || null;
  } catch {
    Capacitor = null;
  }
}

function isNativePlatform() {
  return !!(Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
}

async function checkNativeTts() {
  if (nativeTtsAvailable !== null) return nativeTtsAvailable;
  if (!CapacitorTTS || !isNativePlatform()) {
    nativeTtsAvailable = false;
    return false;
  }
  try {
    await CapacitorTTS.getSupportedLanguages();
    nativeTtsAvailable = true;
    return true;
  } catch {
    nativeTtsAvailable = false;
    return false;
  }
}

function isWebSpeechSupported() {
  return (
    ENABLE_SAM_TTS_TEST
    && typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && !!window.speechSynthesis
  );
}

export function isSupported() {
  if (!ENABLE_SAM_TTS_TEST) return false;
  if (isNativePlatform()) return true;
  return isWebSpeechSupported();
}

export function isNativeTtsSupported() {
  return isSupported() && isNativePlatform();
}

export function isWebTtsSupported() {
  return !isNativePlatform() && isWebSpeechSupported();
}

// A voice key is a small, persistable identifier that works for both native
// and Web Speech voices.  Native voices may report stable `voiceURI` values
// across app restarts; the same is true for Web Speech voices in most browsers.
// We store `uri`, `name` and `lang` and match by URI first, then by name+lang.
function migrateLegacySettings(raw) {
  if (!raw) return null;
  try {
    const legacy = JSON.parse(raw);
    if (legacy.voiceId && legacy.voiceId.voiceURI) {
      return {
        enabled: legacy.enabled !== false,
        useSystemVoice: legacy.useSystemVoice === true,
        voiceKey: {
          uri: legacy.voiceId.voiceURI,
          name: legacy.voiceId.name || '',
          lang: legacy.voiceId.lang || '',
        },
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function getTtsSettings() {
  const defaults = { enabled: true, useSystemVoice: false, voiceKey: null };
  try {
    const raw = localStorage.getItem(TTS_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
    const legacy = localStorage.getItem(LEGACY_TTS_SETTINGS_KEY);
    const migrated = migrateLegacySettings(legacy);
    if (migrated) {
      setTtsSettings(migrated);
      return { ...defaults, ...migrated };
    }
  } catch {
    // ignore
  }
  return defaults;
}

export function setTtsSettings(settings) {
  try {
    localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function isTtsEnabled() {
  return getTtsSettings().enabled !== false;
}

export async function getTtsDiagnostics() {
  if (!CapacitorTTS || !isNativePlatform()) return 'N/A';
  try {
    const result = await CapacitorTTS.getTtsDiagnostics();
    return result?.diagnostics || 'N/A';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[TTS] diagnostics error:', err);
    return `ERR: ${err?.message || err}`;
  }
}

// ---------- Voice discovery ----------

async function initializeNativeTTS() {
  const now = Date.now();

  // Already discovered voices – nothing to do.
  if (nativeVoices && nativeVoices.length > 0) {
    return Promise.resolve();
  }

  // A discovery run is currently in progress (and not stale).
  if (nativeInitPromise && nativeDiscoveryStatus === 'pending' && nativeInitPromiseGeneration === nativeDiscoveryGeneration) {
    return nativeInitPromise;
  }

  // A recent empty/timeout result is still cooling down.  This prevents
  // hammering the native plugin when it is genuinely not ready.
  if (nativeInitPromise && now - lastNativeDiscoveryAt < VOICE_DISCOVERY_EMPTY_COOLDOWN_MS && nativeInitPromiseGeneration === nativeDiscoveryGeneration) {
    return nativeInitPromise;
  }

  // Otherwise start a fresh discovery run.  Do not permanently cache an
  // empty list: a previous timeout can be retried on the next call.
  nativeInitPromise = null;
  const runGeneration = ++nativeDiscoveryGeneration;
  nativeInitPromiseGeneration = runGeneration;

  const isStale = () => runGeneration !== nativeDiscoveryGeneration;

  if (!CapacitorTTS || !isNativePlatform()) {
    nativeInitPromise = Promise.resolve();
    if (isStale()) return;
    nativeDiscoveryStatus = 'n/a';
    lastNativeDiscoveryAt = now;
    return nativeInitPromise;
  }

  nativeInitPromise = (async () => {
    if (isStale()) return;
    nativeDiscoveryStatus = 'pending';
    const startTime = Date.now();
    let delay = VOICE_DISCOVERY_INITIAL_DELAY_MS;
    let attempts = 0;
    let lastError = null;

    while (Date.now() - startTime < VOICE_DISCOVERY_TIMEOUT_MS) {
      attempts += 1;
      try {
        const result = await CapacitorTTS.getSupportedVoices();
        const voices = (result?.voices || []).map((v, i) => ({ ...v, index: i }));
        if (isStale()) return;
        if (voices.length > 0) {
          nativeDiscoveryStatus = 'ready';
          nativeVoices = voices;
          lastNativeDiscoveryAt = Date.now();
          return;
        }
        nativeDiscoveryStatus = 'empty';
      } catch (err) {
        if (isStale()) return;
        lastError = err;
        nativeDiscoveryStatus = 'error';
        // eslint-disable-next-line no-console
        console.warn(`[TTS] voice discovery attempt ${attempts} failed:`, err);
      }

      await new Promise((resolve) => { setTimeout(resolve, delay); });
      delay = Math.min(delay * 2, VOICE_DISCOVERY_MAX_DELAY_MS);
    }

    // Timed out.  Keep the promise resolved but leave the door open for
    // another discovery attempt once the cooldown has passed.
    if (isStale()) return;
    nativeDiscoveryStatus = 'timeout';
    nativeVoices = nativeVoices || [];
    lastNativeDiscoveryAt = Date.now();
    if (lastError) {
      // eslint-disable-next-line no-console
      console.warn('[TTS] voice discovery timed out:', lastError);
    }
  })();

  return nativeInitPromise;
}

export async function getNativeVoices() {
  await initializeNativeTTS();
  return nativeVoices || [];
}

function loadWebVoicesInternal() {
  if (!isWebSpeechSupported()) return Promise.resolve([]);
  if (webVoiceCache) return Promise.resolve(webVoiceCache);
  if (webVoiceCachePromise) return webVoiceCachePromise;

  webVoiceCachePromise = new Promise((resolve) => {
    const store = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        webVoiceCache = voices;
        resolve(webVoiceCache);
      }
    };

    store();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      const handler = () => {
        store();
        window.speechSynthesis.onvoiceschanged = null;
      };
      window.speechSynthesis.onvoiceschanged = handler;
    }

    setTimeout(() => {
      if (!webVoiceCache) {
        store();
      }
      if (!webVoiceCache) {
        webVoiceCache = [];
        resolve(webVoiceCache);
      }
    }, 1500);
  });

  return webVoiceCachePromise;
}

export async function getWebVoices() {
  return loadWebVoicesInternal();
}

export function loadVoices() {
  loadWebVoicesInternal().catch(() => {});
}

export async function getVoices() {
  if (isNativePlatform()) return getNativeVoices();
  return getWebVoices();
}

export async function getGermanVoices() {
  const voices = await getVoices();
  return voices.filter((v) => v.lang?.toLowerCase().startsWith('de'));
}

const LANG_LABEL_FALLBACK = {
  'de-DE': 'Deutsch (Deutschland)',
  'de-AT': 'Deutsch (Österreich)',
  'de-CH': 'Deutsch (Schweiz)',
  de: 'Deutsch',
  'en-US': 'English (United States)',
  'en-GB': 'English (United Kingdom)',
  en: 'English',
  'fr-FR': 'Français (France)',
  fr: 'Français',
  'es-ES': 'Español (España)',
  es: 'Español',
  'it-IT': 'Italiano (Italia)',
  it: 'Italiano',
};

const LANG_NAME_FALLBACK = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
};

function getLanguageLabel(lang) {
  if (!lang) return 'Unbekannt';
  try {
    const display = new Intl.DisplayNames(lang, { type: 'language' }).of(lang);
    if (display && display !== lang) return display;
  } catch {
    // fall through to fallback
  }
  return LANG_LABEL_FALLBACK[lang] || LANG_LABEL_FALLBACK[lang.split('-')[0]] || lang;
}

function getLanguageName(lang) {
  if (!lang) return 'Unbekannt';
  const base = lang.split('-')[0];
  try {
    return new Intl.DisplayNames(lang, { type: 'language' }).of(base);
  } catch {
    return LANG_NAME_FALLBACK[base] || base;
  }
}

function getVoiceNumberWord(lang) {
  const base = (lang || '').toLowerCase().split('-')[0];
  const numberWords = {
    de: 'Stimme',
    en: 'Voice',
    fr: 'Voix',
    es: 'Voz',
    it: 'Voce',
    pt: 'Voz',
    nl: 'Stem',
    pl: 'Głos',
    ru: 'Голос',
    ja: '音声',
    zh: '语音',
    ko: '목소리',
  };
  return numberWords[base] || 'Voice';
}

export async function getVoiceLanguages() {
  const voices = await getVoices();
  const seen = new Map();
  for (const v of voices) {
    const lang = v.lang || 'unknown';
    const key = lang.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, lang);
    }
  }

  const languages = Array.from(seen.values()).map((lang) => ({
    lang,
    label: getLanguageLabel(lang),
  }));
  languages.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  return languages;
}

export async function getVoicesForLanguage(lang) {
  if (!lang) return [];
  const voices = await getVoices();
  const filtered = voices.filter((v) => v?.lang?.toLowerCase() === lang.toLowerCase());
  const languageName = getLanguageName(lang);
  const numberWord = getVoiceNumberWord(lang);

  const sorted = [...filtered].sort((a, b) => {
    const aLocal = a.localService ? 1 : 0;
    const bLocal = b.localService ? 1 : 0;
    if (aLocal !== bLocal) return bLocal - aLocal;
    const byName = (a.name || '').localeCompare(b.name || '');
    if (byName !== 0) return byName;
    return (a.index ?? 0) - (b.index ?? 0);
  });

  return sorted.map((v, i) => ({
    ...v,
    displayName: `${languageName} – ${numberWord} ${i + 1}`,
  }));
}

function voiceMatchesKey(voice, key) {
  if (!voice || !key) return false;
  if (key.uri && (voice.voiceURI === key.uri || voice.voiceURI === `urn:moz-tts:${key.uri}?0`)) return true;
  if (voice.name && key.name && voice.name === key.name) {
    if (key.lang && voice.lang !== key.lang) return false;
    return true;
  }
  return false;
}

function findNativeVoiceByKey(key) {
  if (!nativeVoices || !key) return null;
  return nativeVoices.find((v) => voiceMatchesKey(v, key)) || null;
}

async function findWebVoiceByKey(key) {
  const voices = await loadWebVoicesInternal();
  if (!voices.length || !key) return null;
  return voices.find((v) => voiceMatchesKey(v, key)) || null;
}

function pickFallbackVoice(voices) {
  if (!voices || voices.length === 0) return null;
  return [...voices].sort((a, b) => {
    const aDe = a.lang?.toLowerCase().startsWith('de') ? 1 : 0;
    const bDe = b.lang?.toLowerCase().startsWith('de') ? 1 : 0;
    if (aDe !== bDe) return bDe - aDe;
    const aLocal = a.localService ? 1 : 0;
    const bLocal = b.localService ? 1 : 0;
    if (aLocal !== bLocal) return bLocal - aLocal;
    const byName = (a.name || '').localeCompare(b.name || '');
    if (byName !== 0) return byName;
    return (a.index ?? 0) - (b.index ?? 0);
  })[0];
}

async function selectVoice() {
  const settings = getTtsSettings();

  if (settings.useSystemVoice) {
    return { index: -1, useSystemVoice: true };
  }

  if (isNativePlatform()) {
    await initializeNativeTTS();
    if (!nativeVoices || nativeVoices.length === 0) {
      return { index: -1, useSystemVoice: true };
    }
    const saved = findNativeVoiceByKey(settings.voiceKey);
    if (saved) {
      return { index: saved.index, useSystemVoice: false, voice: saved };
    }
    const fallback = pickFallbackVoice(nativeVoices);
    return { index: fallback ? fallback.index : -1, useSystemVoice: false, voice: fallback };
  }

  // Web Speech path.
  const voices = await loadWebVoicesInternal();
  if (voices.length === 0) {
    return { index: null, useSystemVoice: false, voice: null };
  }
  const saved = await findWebVoiceByKey(settings.voiceKey);
  if (saved) {
    return { index: null, useSystemVoice: false, voice: saved };
  }
  const fallback = pickFallbackVoice(voices);
  return { index: null, useSystemVoice: false, voice: fallback };
}

export async function getSelectedVoice() {
  return selectVoice();
}

function looksLikeRawVoiceUri(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[a-z]{2}-[a-z]{2}-x-/i.test(str) || /^urn:moz-tts:/i.test(str) || /^[a-z]+:\/\//i.test(str);
}

export function getDisplayVoiceLabel(voice) {
  if (!voice) return 'Unbekannt';
  if (voice.displayName) return voice.displayName;
  if (voice.name && !looksLikeRawVoiceUri(voice.name)) return voice.name;
  if (voice.lang && typeof voice.index === 'number') return `${voice.lang} ${voice.index}`;
  if (voice.lang) return voice.lang;
  return 'Unbekannt';
}

export function voiceKeyFromVoice(voice) {
  if (!voice) return null;
  return {
    uri: voice.voiceURI || '',
    name: voice.name || '',
    lang: voice.lang || '',
  };
}

export async function openTtsSettings() {
  if (CapacitorTTS && CapacitorTTS.openInstall && isNativePlatform()) {
    try {
      await CapacitorTTS.openInstall();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[TTS] openInstall failed:', err);
    }
  }
}

export async function getTtsVoiceDiagnostics() {
  const raw = await getTtsDiagnostics();
  const selected = await getSelectedVoice();
  const voices = await getVoices();
  const germanVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith('de'));
  const settings = getTtsSettings();

  const selectedText = selected.useSystemVoice
    ? 'Systemstimme'
    : (selected.voice
        ? `${getDisplayVoiceLabel(selected.voice)} (URI: ${selected.voice.voiceURI || '-'})`
        : 'keine');

  const lines = [
    `Discovery status: ${nativeDiscoveryStatus}`,
    `Total voices: ${voices.length}`,
    `German voices: ${germanVoices.length}`,
    `Saved voice key: ${settings.voiceKey ? (settings.voiceKey.uri || settings.voiceKey.name || '-') : '-'}`,
    `Selected voice: ${selectedText}`,
    '',
    'Raw diagnostics:',
    raw,
  ];

  if (germanVoices.length > 0) {
    lines.push('', 'German voices:');
    for (const v of germanVoices) {
      lines.push(`  ${getDisplayVoiceLabel(v)} (URI: ${v.voiceURI || '-'})`);
    }
  }

  return lines.join('\n');
}

// ---------- TTS text normalization for technical/Cisco content ----------

function normalizeCiscoText(text) {
  if (typeof text !== 'string') return '';

  let t = text;

  // Common Cisco command expansions (order matters - longer phrases first).
  t = t.replace(/show ip ospf neighbor/gi, 'Show I P O S P F Nachbar');
  t = t.replace(/show ip ospf interface/gi, 'Show I P O S P F Interface');
  t = t.replace(/show ip protocols/gi, 'Show I P Protokolle');
  t = t.replace(/show ip route/gi, 'Show I P Route');
  t = t.replace(/show ip ospf/gi, 'Show I P O S P F');
  t = t.replace(/default-information originate/gi, 'Default Information Originate');
  t = t.replace(/passive-interface/gi, 'passive Interface');
  t = t.replace(/message-digest-key/gi, 'Message Digest Schlüssel');
  t = t.replace(/message-digest/gi, 'Message Digest');
  t = t.replace(/authentication-key/gi, 'Authentifizierungsschlüssel');
  t = t.replace(/ip ospf authentication/gi, 'I P O S P F Authentifizierung');
  t = t.replace(/ip ospf/gi, 'I P O S P F');
  t = t.replace(/router ospf/gi, 'Router O S P F');
  t = t.replace(/area 0 authentication/gi, 'Area Null Authentifizierung');
  t = t.replace(/area 0/gi, 'Area Null');

  // Interface references like g0/0, g0/0-2, s0/0/0, fa0/1 etc.
  t = t.replace(/\b([gfs]\d+)(?:\/([\d-]+))(?:\/([\d-]+))?\b/gi, (match, pre, part1, part2) => {
    const base = pre.toUpperCase();
    const first = part1.replace(/-/g, ' bis ');
    if (part2) return `${base} ${first} Schrägstrich ${part2.replace(/-/g, ' bis ')}`;
    return `${base} ${first}`;
  });

  // Dotted-decimal IPv4 addresses.
  t = t.replace(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g, (match) => match.replace(/\./g, ' Punkt '));

  // CIDR prefix length after an IP.
  t = t.replace(/(\d{1,3} Punkt \d{1,3} Punkt \d{1,3} Punkt \d{1,3})\/(\d{1,2})/g, '$1 Schrägstrich $2');

  // Common abbreviations.
  // NAT expansions (must be before generic \bip\b replacement).
  t = t.replace(/show ip nat statistics/gi, 'Show I P N A T Statistik');
  t = t.replace(/show ip nat translations/gi, 'Show I P N A T Übersetzungen');
  t = t.replace(/show ip nat/gi, 'Show I P N A T');
  t = t.replace(/clear ip nat translation/gi, 'Clear I P N A T Übersetzung');
  t = t.replace(/ip nat inside source static tcp/gi, 'I P N A T inside source static T C P');
  t = t.replace(/ip nat inside source static/gi, 'I P N A T inside source static');
  t = t.replace(/ip nat inside source list/gi, 'I P N A T inside source list');
  t = t.replace(/ip nat pool/gi, 'I P N A T Pool');
  t = t.replace(/ip nat outside/gi, 'I P N A T outside');
  t = t.replace(/ip nat inside/gi, 'I P N A T inside');
  t = t.replace(/\bnat\b/gi, 'N A T');
  t = t.replace(/\bpat\b/gi, 'P A T');

  // ACL / packet filter expansions.
  t = t.replace(/ip inspect/gi, 'I P Inspect');
  t = t.replace(/ip access-list resequence/gi, 'I P Access List resequence');
  t = t.replace(/ip access-list/gi, 'I P Access List');
  t = t.replace(/access-class/gi, 'Access Class');
  t = t.replace(/access-group/gi, 'Access Group');
  t = t.replace(/access-list/gi, 'Access List');
  t = t.replace(/\bstateful\b/gi, 'stateful');
  t = t.replace(/\bstateless\b/gi, 'stateless');
  t = t.replace(/\bcbac\b/gi, 'C B A C');

  // Common abbreviations and ACL keywords.
  t = t.replace(/\bip\b/gi, 'I P');
  t = t.replace(/\bospf\b/gi, 'O S P F');
  t = t.replace(/\bmd5\b/gi, 'M D 5');
  t = t.replace(/\bacl\b/gi, 'A C L');
  t = t.replace(/\bace\b/gi, 'A C E');
  t = t.replace(/\beq\b/gi, 'gleich');
  t = t.replace(/\bpermit\b/gi, 'permit');
  t = t.replace(/\bdeny\b/gi, 'deny');

  return t;
}

function collectTextFromBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  const parts = [];
  for (const block of blocks) {
    if (block.type === 'text') parts.push(block.content);
    else if (block.type === 'list') {
      parts.push(block.title || '');
      parts.push(...(block.items || []));
    } else if (block.type === 'table') {
      parts.push((block.headers || []).join('. '));
      for (const row of (block.rows || [])) parts.push(row.join('. '));
    } else if (block.type === 'question') {
      parts.push(block.question);
      parts.push(...(block.options || []));
      parts.push(block.explanation || '');
    }
  }
  return parts.filter(Boolean).join('. ');
}

export { normalizeCiscoText };

export function ttsTextFromBlocks(blocks) {
  return normalizeCiscoText(collectTextFromBlocks(blocks));
}

export async function speak(text, callbacks = {}) {
  if (!ENABLE_SAM_TTS_TEST || !isTtsEnabled()) return;
  await stop();

  const normalized = normalizeCiscoText(text);
  const { index, useSystemVoice, voice } = await selectVoice();

  if (isNativePlatform() && (await checkNativeTts())) {
    await speakNative(normalized, index, useSystemVoice, callbacks);
  } else if (isWebSpeechSupported()) {
    speakWeb(normalized, voice, callbacks);
  }
}

export async function speakWithVoice(text, voice, callbacks = {}) {
  if (!ENABLE_SAM_TTS_TEST || !isTtsEnabled()) return;
  if (!voice) return speak(text, callbacks);
  await stop();

  const normalized = normalizeCiscoText(text);

  if (isNativePlatform() && (await checkNativeTts())) {
    await speakNative(normalized, voice.index, false, callbacks);
  } else if (isWebSpeechSupported()) {
    speakWeb(normalized, voice, callbacks);
  }
}

export async function stop() {
  stopWeb();
  if (CapacitorTTS && isNativePlatform()) {
    try {
      await CapacitorTTS.stop();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[TTS] native stop error:', err);
    }
  }
}

// ---------- Web Speech implementation ----------

function stopWeb() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function speakWeb(text, voice, callbacks = {}) {
  if (!isWebSpeechSupported()) return;
  stopWeb();

  if (window.speechSynthesis.paused) window.speechSynthesis.resume();

  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 1;
  utterance.pitch = 1;

  if (voice) utterance.voice = voice;

  utterance.onstart = () => { if (callbacks.onStart) callbacks.onStart(); };
  utterance.onend = () => { if (callbacks.onEnd) callbacks.onEnd(); };
  utterance.onerror = (event) => {
    // eslint-disable-next-line no-console
    console.warn('[TTS] speechSynthesis error:', event.error);
    if (callbacks.onError) callbacks.onError(event);
  };

  window.speechSynthesis.speak(utterance);
}

async function speakNative(text, voiceIndex, useSystemVoice, callbacks = {}) {
  if (!CapacitorTTS) return;
  try {
    await initializeNativeTTS();
    if (callbacks.onStart) callbacks.onStart();
    await CapacitorTTS.speak({
      text,
      lang: 'de-DE',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voice: voiceIndex,
      useSystemVoice,
    });
    if (callbacks.onEnd) callbacks.onEnd();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[TTS] native TTS error:', err);
    if (callbacks.onError) callbacks.onError(err);
  }
}

// Test-only helper to force a fresh voice discovery run.
export function __resetTtsDiscovery() {
  nativeInitPromise = null;
  nativeVoices = null;
  nativeTtsAvailable = null;
  nativeDiscoveryStatus = 'idle';
  lastNativeDiscoveryAt = 0;
  nativeDiscoveryGeneration += 1;
}

// Kick off native voice discovery early on Android so logs are ready.
if (isNativePlatform()) {
  initializeNativeTTS().catch(() => {});
}
