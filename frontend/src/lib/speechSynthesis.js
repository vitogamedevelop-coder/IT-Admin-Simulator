// Isolated text-to-speech utility for the Sam TTS test.
// Set this to false to disable the test feature with a single change.
export const ENABLE_SAM_TTS_TEST = true;

const TTS_SETTINGS_KEY = 'it-learn:tts-settings-v2';

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

export function getTtsSettings() {
  try {
    const raw = localStorage.getItem(TTS_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { enabled: true, useSystemVoice: true, voiceId: null };
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

// ---------- Native voice discovery ----------

async function initializeNativeTTS() {
  if (nativeInitPromise) return nativeInitPromise;
  if (!CapacitorTTS || !isNativePlatform()) {
    nativeInitPromise = Promise.resolve();
    return nativeInitPromise;
  }

  nativeInitPromise = (async () => {
    try {
      const { voices } = await CapacitorTTS.getSupportedVoices();
      nativeVoices = (voices || []).map((v, i) => ({ ...v, index: i }));
      // eslint-disable-next-line no-console
      console.log('[TTS] supported voices:', nativeVoices.map((v) => ({
        index: v.index,
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        localService: v.localService,
        default: v.default,
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

export function getVoices() {
  return nativeVoices || [];
}

export function getGermanVoices() {
  return (nativeVoices || []).filter((v) => v.lang?.toLowerCase().startsWith('de'));
}

function getVoiceById(voiceId) {
  if (!voiceId || !nativeVoices) return null;
  return nativeVoices.find((v) => v.index === voiceId.index && v.voiceURI === voiceId.voiceURI) || null;
}

function selectVoiceIndex() {
  if (!nativeVoices || nativeVoices.length === 0) return undefined;

  const settings = getTtsSettings();
  if (!settings.useSystemVoice) {
    const saved = getVoiceById(settings.voiceId);
    if (saved) {
      // eslint-disable-next-line no-console
      console.log('[TTS] using saved voice:', { index: saved.index, voiceURI: saved.voiceURI, name: saved.name });
      return saved.index;
    }
    const deVoices = nativeVoices.filter((v) => v.lang?.toLowerCase().startsWith('de'));
    if (deVoices.length) {
      const localDe = deVoices.find((v) => v.localService) || deVoices[0];
      // eslint-disable-next-line no-console
      console.log('[TTS] fallback to German voice:', { index: localDe.index, voiceURI: localDe.voiceURI, name: localDe.name });
      return localDe.index;
    }
    // eslint-disable-next-line no-console
    console.log('[TTS] falling back to first available voice:', { index: 0, voiceURI: nativeVoices[0].voiceURI, name: nativeVoices[0].name });
    return 0;
  }

  // eslint-disable-next-line no-console
  console.log('[TTS] using system voice (no index)');
  return -1;
}

export function getDisplayVoiceLabel(voice) {
  if (!voice) return 'Unbekannt';
  if (voice.voiceURI) return `${voice.name || voice.lang} – ${voice.voiceURI}`;
  return voice.name || voice.lang || `Stimme ${voice.index}`;
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
  return webVoiceCache.find((v) => v.lang?.toLowerCase().startsWith('de')) || webVoiceCache[0] || null;
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

async function speakNative(text, voiceIndex, useSystemVoice, callbacks = {}) {
  if (!CapacitorTTS) return;
  try {
    await initializeNativeTTS();
    if (callbacks.onStart) callbacks.onStart();
    // eslint-disable-next-line no-console
    console.log('[TTS] speaking:', { index: voiceIndex, useSystemVoice });
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

export async function speak(text, callbacks = {}) {
  if (!ENABLE_SAM_TTS_TEST || !isTtsEnabled()) return;
  await stop();
  if (await checkNativeTts()) {
    const settings = getTtsSettings();
    const useSystemVoice = settings.useSystemVoice !== false;
    const index = useSystemVoice ? -1 : selectVoiceIndex();
    await speakNative(text, index, useSystemVoice, callbacks);
  } else if (isWebSpeechSupported()) {
    speakWeb(text, callbacks);
  }
}

export async function speakWithVoice(text, voice, callbacks = {}) {
  if (!ENABLE_SAM_TTS_TEST || !isTtsEnabled()) return;
  if (!voice) return speak(text, callbacks);
  await stop();
  if (await checkNativeTts()) {
    await speakNative(text, voice.index, false, callbacks);
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

// Kick off native voice discovery early on Android so logs are ready.
if (isNativePlatform()) {
  initializeNativeTTS().catch(() => {});
}
