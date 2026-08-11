// Isolated text-to-speech utility for the Sam TTS test.
// Set this to false to disable the test feature with a single change.
export const ENABLE_SAM_TTS_TEST = true;

const PREFERRED_VOICE_KEY = 'it-learn:tts-preferred-voice';

let nativeTtsAvailable = null;
let nativeVoices = null;
let nativeInitPromise = null;
let webVoiceCache = null;
let webVoiceCacheInitialized = false;

// Lazy, safe Capacitor import.
let CapacitorTTS = null;
let Capacitor = null;

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

// ---------- Voice metadata helpers ----------

function getPreferredVoiceKey() {
  try {
    const raw = localStorage.getItem(PREFERRED_VOICE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setPreferredVoiceKey(key) {
  try {
    if (key == null) {
      localStorage.removeItem(PREFERRED_VOICE_KEY);
    } else {
      localStorage.setItem(PREFERRED_VOICE_KEY, JSON.stringify(key));
    }
  } catch {
    // ignore storage errors
  }
}

function voiceGenderHint(voice) {
  const name = (voice.name || '').toLowerCase();
  const uri = (voice.voiceURI || '').toLowerCase();
  const combined = `${name} ${uri}`;

  if (/(?:^|[^a-z0-9])deu-?deu?-?1(?:[^a-z0-9]|$)/.test(uri)) return 'female';
  if (/(?:^|[^a-z0-9])deu-?deu?-?2(?:[^a-z0-9]|$)/.test(uri)) return 'male';
  if (/(?:^|[^a-z0-9])de-?de-?1(?:[^a-z0-9]|$)/.test(uri)) return 'female';
  if (/(?:^|[^a-z0-9])de-?de-?2(?:[^a-z0-9]|$)/.test(uri)) return 'male';
  if (/samsung.*deutsch.*1/.test(combined)) return 'female';
  if (/samsung.*deutsch.*2/.test(combined)) return 'male';
  if (/de-de-(standard|wavenet|neural)-[bcd]\b/.test(combined)) return 'male';
  if (/de-de-(standard|wavenet|neural)-[ae]\b/.test(combined)) return 'female';

  const maleMarkers = ['male', 'man', 'männlich', 'mann'];
  const femaleMarkers = ['female', 'woman', 'weiblich', 'frau'];
  if (maleMarkers.some((m) => combined.includes(m))) return 'male';
  if (femaleMarkers.some((f) => combined.includes(f))) return 'female';

  const uriLastNumber = uri.match(/(\d+)(?:\D*)$/);
  if (uriLastNumber) {
    const n = parseInt(uriLastNumber[1], 10);
    if (Number.isFinite(n)) return n % 2 === 0 ? 'male' : 'female';
  }
  return null;
}

// ---------- Native voice discovery & selection ----------

async function initializeNativeTTS() {
  if (nativeInitPromise) return nativeInitPromise;
  if (!CapacitorTTS || !isNativePlatform()) {
    nativeInitPromise = Promise.resolve();
    return nativeInitPromise;
  }

  nativeInitPromise = (async () => {
    try {
      const { voices } = await CapacitorTTS.getSupportedVoices();
      nativeVoices = (voices || []).map((v, i) => ({ ...v, index: i, genderHint: voiceGenderHint(v) }));
      const { languages } = await CapacitorTTS.getSupportedLanguages();
      const deVoices = nativeVoices.filter((v) => v.lang?.toLowerCase().startsWith('de'));
      // eslint-disable-next-line no-console
      console.log('[TTS] all supported voices:', nativeVoices.map((v) => ({
        index: v.index,
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        localService: v.localService,
        default: v.default,
        genderHint: v.genderHint,
      })));
      // eslint-disable-next-line no-console
      console.log('[TTS] supported languages:', languages);
      // eslint-disable-next-line no-console
      console.log('[TTS] German voices:', deVoices.map((v) => ({
        index: v.index,
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        localService: v.localService,
        default: v.default,
        genderHint: v.genderHint,
      })));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[TTS] failed to load native voices:', err);
      nativeVoices = [];
    }
  })();

  return nativeInitPromise;
}

export async function getNativeVoices() {
  await initializeNativeTTS();
  return nativeVoices || [];
}

export function getGermanVoices() {
  return (nativeVoices || []).filter((v) => v.lang?.toLowerCase().startsWith('de'));
}

function resolveVoiceIndex() {
  if (!nativeVoices || nativeVoices.length === 0) return undefined;

  const preferred = getPreferredVoiceKey();
  if (preferred != null) {
    const byIndex = nativeVoices.find((v) => v.index === preferred.index);
    if (byIndex && byIndex.voiceURI === preferred.voiceURI) {
      // eslint-disable-next-line no-console
      console.log('[TTS] using preferred voice:', { index: byIndex.index, voiceURI: byIndex.voiceURI, name: byIndex.name });
      return byIndex.index;
    }
  }

  const deVoices = nativeVoices.filter((v) => v.lang?.toLowerCase().startsWith('de'));
  const deMale = deVoices.filter((v) => v.genderHint === 'male');
  if (deMale.length) {
    const localMale = deMale.find((v) => v.localService) || deMale[0];
    // eslint-disable-next-line no-console
    console.log('[TTS] auto-selected German male voice:', { index: localMale.index, voiceURI: localMale.voiceURI, name: localMale.name });
    return localMale.index;
  }
  if (deVoices.length) {
    const localDe = deVoices.find((v) => v.localService) || deVoices[0];
    // eslint-disable-next-line no-console
    console.log('[TTS] auto-selected German voice:', { index: localDe.index, voiceURI: localDe.voiceURI, name: localDe.name });
    return localDe.index;
  }
  const anyMale = nativeVoices.filter((v) => v.genderHint === 'male');
  if (anyMale.length) {
    // eslint-disable-next-line no-console
    console.log('[TTS] auto-selected non-German male voice:', { index: anyMale[0].index, voiceURI: anyMale[0].voiceURI, name: anyMale[0].name });
    return anyMale[0].index;
  }
  // eslint-disable-next-line no-console
  console.log('[TTS] falling back to first available voice:', { index: 0, voiceURI: nativeVoices[0].voiceURI, name: nativeVoices[0].name });
  return 0;
}

export function savePreferredVoice(voice) {
  if (!voice) return;
  setPreferredVoiceKey({ index: voice.index, voiceURI: voice.voiceURI });
}

export function getPreferredVoice() {
  const key = getPreferredVoiceKey();
  if (!key) return null;
  const found = (nativeVoices || []).find((v) => v.index === key.index && v.voiceURI === key.voiceURI);
  return found || null;
}

// ---------- Web Speech API helpers ----------

export function loadVoices() {
  if (!isWebSpeechSupported() || webVoiceCacheInitialized) return;
  webVoiceCacheInitialized = true;

  const storeVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) webVoiceCache = voices;
  };

  storeVoices();

  if (!webVoiceCache && window.speechSynthesis.onvoiceschanged !== undefined) {
    const handler = () => {
      storeVoices();
      window.speechSynthesis.onvoiceschanged = null;
    };
    window.speechSynthesis.onvoiceschanged = handler;
    setTimeout(() => {
      storeVoices();
      window.speechSynthesis.onvoiceschanged = null;
    }, 1500);
  }
}

function findWebGermanVoice() {
  if (!webVoiceCache) return null;
  const deVoices = webVoiceCache.filter((v) => v.lang?.toLowerCase().startsWith('de'));
  const male = deVoices.find((v) => voiceGenderHint(v) === 'male');
  return male || deVoices[0] || null;
}

function speakWeb(text, callbacks = {}) {
  if (!isWebSpeechSupported()) return;
  stopWeb();
  loadVoices();

  if (window.speechSynthesis.paused) window.speechSynthesis.resume();

  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 1;
  utterance.pitch = 1;

  const voice = findWebGermanVoice();
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

async function speakNative(text, voiceIndex, callbacks = {}) {
  if (!CapacitorTTS) return;
  try {
    await initializeNativeTTS();
    const index = voiceIndex ?? resolveVoiceIndex();
    const chosen = (nativeVoices || []).find((v) => v.index === index) || nativeVoices?.[0];
    // eslint-disable-next-line no-console
    console.log('[TTS] speaking with voice:', { index, voiceURI: chosen?.voiceURI, name: chosen?.name, lang: chosen?.lang, localService: chosen?.localService });
    if (callbacks.onStart) callbacks.onStart();
    await CapacitorTTS.speak({
      text,
      lang: 'de-DE',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voice: index,
    });
    if (callbacks.onEnd) callbacks.onEnd();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[TTS] native TTS error:', err);
    if (callbacks.onError) callbacks.onError(err);
  }
}

export async function speak(text, callbacks = {}) {
  if (!ENABLE_SAM_TTS_TEST) return;
  await stop();
  if (await checkNativeTts()) {
    await speakNative(text, undefined, callbacks);
  } else if (isWebSpeechSupported()) {
    speakWeb(text, callbacks);
  }
}

export async function speakWithVoice(text, voice, callbacks = {}) {
  if (!ENABLE_SAM_TTS_TEST) return;
  if (!voice) return speak(text, callbacks);
  await stop();
  if (await checkNativeTts()) {
    await speakNative(text, voice.index, callbacks);
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

function stopWeb() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Kick off native voice discovery early on Android so the console log is
// available as soon as the app starts.
if (isNativePlatform()) {
  initializeNativeTTS().catch(() => {});
}
