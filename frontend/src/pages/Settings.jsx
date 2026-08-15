import { useEffect, useState, useCallback } from 'react';
import { RotateCcw, Trash2, AlertTriangle, Info, Volume2, ExternalLink } from 'lucide-react';
import { resetOnboarding } from '../components/Onboarding';
import { getVersionLabel } from '../lib/version';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';
import {
  isSupported,
  isNativeTtsSupported,
  getTtsSettings,
  setTtsSettings,
  getVoiceLanguages,
  getVoicesForLanguage,
  getDisplayVoiceLabel,
  voiceKeyFromVoice,
  voiceMatchesKey,
  openTtsSettings,
  getTtsVoiceDiagnostics,
  getSelectedVoice,
  speakWithVoice,
  speak,
  stop,
} from '../lib/speechSynthesis';

const TEST_SENTENCE = 'Hallo, ich bin Sam. So würde ich dir die Academy vorlesen.';

function useTtsVoiceSelection(hasTts) {
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [voices, setVoices] = useState([]);
  const [voicesLoading, setVoicesLoading] = useState(false);

  useEffect(() => {
    if (!hasTts) return undefined;
    let mounted = true;
    setLanguagesLoading(true);
    getVoiceLanguages().then((langs) => {
      if (!mounted) return;
      setLanguages(langs);
      setLanguagesLoading(false);
    }).catch(() => {
      if (mounted) setLanguagesLoading(false);
    });
    return () => { mounted = false; };
  }, [hasTts]);

  useEffect(() => {
    if (!hasTts || !selectedLanguage) {
      setVoices([]);
      return undefined;
    }
    let mounted = true;
    setVoicesLoading(true);
    getVoicesForLanguage(selectedLanguage).then((list) => {
      if (!mounted) return;
      setVoices(list);
      setVoicesLoading(false);
    }).catch(() => {
      if (mounted) setVoicesLoading(false);
    });
    return () => { mounted = false; };
  }, [hasTts, selectedLanguage]);

  return {
    languages,
    languagesLoading,
    selectedLanguage,
    setSelectedLanguage,
    voices,
    voicesLoading,
  };
}

export default function Settings() {
  const [confirmReset, setConfirmReset] = useState(false);
  const [settings, setSettings] = useState(getTtsSettings);
  const {
    languages,
    languagesLoading,
    selectedLanguage,
    setSelectedLanguage,
    voices,
    voicesLoading,
  } = useTtsVoiceSelection(isSupported());
  const [speaking, setSpeaking] = useState(false);
  const [diagnostics, setDiagnostics] = useState('');
  const [diagLoading, setDiagLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const hasTts = isSupported();
  const hasNativeTts = isNativeTtsSupported();

  // Declared before any useEffect that references it to avoid TDZ in production.
  const refreshDiagnostics = useCallback(async () => {
    if (!hasNativeTts) return;
    setDiagLoading(true);
    try {
      const diag = await getTtsVoiceDiagnostics();
      setDiagnostics(diag);
    } catch (err) {
      setDiagnostics(`ERR: ${err?.message || err}`);
    } finally {
      setDiagLoading(false);
    }
  }, [hasNativeTts]);

  function updateSettings(partial) {
    const next = { ...settings, ...partial };
    setSettings(next);
    setTtsSettings(next);
  }

  // Single-select: exactly one voice card can be selected at a time. The
  // shared voiceMatchesKey() identity (uri > index > name+lang) prevents the
  // "every same-named Android voice looks selected" bug.
  function isVoiceSelected(voice) {
    const key = selectedVoice ? voiceKeyFromVoice(selectedVoice) : settings.voiceKey;
    if (!key) return false;
    return voiceMatchesKey(voice, key);
  }

  async function playTest() {
    const selected = await getSelectedVoice();
    setSpeaking(true);
    if (selected.useSystemVoice || !selected.voice) {
      await speak(TEST_SENTENCE, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } else {
      await speakWithVoice(TEST_SENTENCE, selected.voice, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  }

  async function stopTest() {
    await stop();
    setSpeaking(false);
  }

  function selectVoice(voice) {
    setSelectedVoice(voice);
    updateSettings({ voiceKey: voiceKeyFromVoice(voice), useSystemVoice: false });
  }

  function handleLanguageChange(lang) {
    setSelectedLanguage(lang);
  }

  function resetAllProgress() {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  }

  useEffect(() => {
    if (!isSupported() || settings.useSystemVoice) {
      setSelectedVoice(null);
      return undefined;
    }
    let mounted = true;
    getSelectedVoice().then((selected) => {
      if (!mounted) return;
      setSelectedVoice(selected.voice || null);
      if (selected.voice?.lang) {
        setSelectedLanguage(selected.voice.lang);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, [settings.useSystemVoice, settings.voiceKey, setSelectedLanguage]);

  useAppBack();

  useEffect(() => {
    if (hasNativeTts) refreshDiagnostics();
    return () => {
      stop().catch(() => {});
    };
  }, [hasNativeTts, refreshDiagnostics]);

  useEffect(() => {
    if (hasNativeTts) refreshDiagnostics();
  }, [hasNativeTts, refreshDiagnostics, settings.useSystemVoice, settings.enabled]);

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Arbeitsplatz" />
      <div className="cyber-card p-4">
        <h2 className="font-bold text-[#00f0ff]">einstellungen</h2>
        <p className="mt-1 text-xs text-[#8b949e]">IT-Learn läuft komplett offline. Dein Fortschritt wird auf diesem Gerät gespeichert.</p>
      </div>
      <div className="cyber-card p-4">
        <h3 className="font-bold text-[#00f0ff] text-sm flex items-center gap-2"><Info size={16} />Version</h3>
        <p className="mt-1 text-xs text-[#8b949e]">{getVersionLabel()}</p>
        <p className="mt-1 text-[10px] text-[#5a6573]">Semantic Versioning: MAJOR.MINOR.PATCH</p>
      </div>

      {hasTts && (
        <div className="cyber-card p-4">
          <h3 className="font-bold text-[#00f0ff] text-sm flex items-center gap-2"><Volume2 size={16} />Vorlesefunktion</h3>
          <p className="mt-1 text-xs text-[#8b949e]">Stimme und Sprachausgabe für Sams Test-Vorlesefunktion.</p>

          <div className="mt-3 flex items-center gap-2">
            <input
              id="tts-enabled"
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              className="h-4 w-4 accent-[#00f0ff]"
            />
            <label htmlFor="tts-enabled" className="text-sm text-[#c9d1d9]">Vorlesefunktion aktiviert</label>
          </div>

          {settings.enabled && (
            <>
              {hasNativeTts && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    id="tts-system-voice"
                    type="checkbox"
                    checked={settings.useSystemVoice}
                    onChange={(e) => updateSettings({ useSystemVoice: e.target.checked })}
                    className="h-4 w-4 accent-[#00f0ff]"
                  />
                  <label htmlFor="tts-system-voice" className="text-sm text-[#c9d1d9]">Systemstimme verwenden</label>
                </div>
              )}

              {!settings.useSystemVoice && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs text-[#8b949e] block mb-1">Sprache auswählen</label>
                    {languagesLoading ? (
                      <div className="text-xs text-[#8b949e]">Sprachen werden geladen...</div>
                    ) : languages.length === 0 ? (
                      <div className="text-xs text-[#ffcc00]">Keine Sprachen gefunden.</div>
                    ) : (
                      <select
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-xs rounded p-2 focus:border-[#00f0ff] outline-none"
                      >
                        <option value="">Sprache wählen</option>
                        {languages.map((l) => (
                          <option key={l.lang} value={l.lang}>{l.label}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {selectedLanguage && (
                    <div>
                      <label className="text-xs text-[#8b949e] block mb-1">Stimme auswählen</label>
                      {voicesLoading ? (
                        <div className="text-xs text-[#8b949e]">Stimmen werden geladen...</div>
                      ) : voices.length === 0 ? (
                        <div className="text-xs text-[#ffcc00]">Keine Stimmen für diese Sprache gefunden.</div>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                          {voices.map((voice) => (
                            <button
                              key={`${voice.voiceURI || ''}-${voice.name || ''}-${voice.index ?? ''}`}
                              type="button"
                              onClick={() => selectVoice(voice)}
                              className={`text-left p-2 rounded border text-xs ${isVoiceSelected(voice) ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white' : 'border-[#30363d] text-[#c9d1d9] hover:border-[#00f0ff]/60'}`}
                            >
                              <div className="font-bold">{getDisplayVoiceLabel(voice)}</div>
                              <div className="text-[10px] text-[#8b949e]">{voice.localService ? 'lokal' : 'Netzwerk'}{voice.index !== undefined ? ` · ID ${voice.index}` : ''}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={speaking ? stopTest : playTest}
                  className="cyber-btn-outline text-xs px-3 py-2"
                >
                  {speaking ? 'Test stoppen' : 'Stimme testen'}
                </button>
                {hasNativeTts && typeof openTtsSettings === 'function' && (
                  <button
                    type="button"
                    onClick={openTtsSettings}
                    className="cyber-btn-outline text-xs px-3 py-2 flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Text-zu-Sprache-Einstellungen
                  </button>
                )}
              </div>

              {hasNativeTts && settings.useSystemVoice && (
                <>
                  <p className="mt-2 text-[10px] text-[#8b949e]">
                    Android verwendet die in den System-Einstellungen gewählte Stimme.
                  </p>
                  <p className="mt-1 text-[10px] text-[#5a6573]">
                    Stimme über die Einstellungen deiner bevorzugten Sprach-Engine auswählen.
                  </p>
                </>
              )}

              {hasNativeTts && (
                <div className="mt-4 p-3 rounded border border-[#ffcc00]/30 bg-[#ffcc00]/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-bold text-[#ffcc00] uppercase tracking-wider">TTS Diagnose (temporär)</h4>
                    <button
                      type="button"
                      onClick={refreshDiagnostics}
                      className="text-[10px] text-[#00f0ff] hover:underline"
                    >
                      Aktualisieren
                    </button>
                  </div>
                  {diagLoading ? (
                    <div className="text-[10px] text-[#8b949e]">Lade Diagnose...</div>
                  ) : (
                    <div className="text-[10px] font-mono text-[#c9d1d9] whitespace-pre-wrap break-words">{diagnostics || 'Keine Diagnose verfügbar.'}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!hasTts && (
        <div className="cyber-card p-4">
          <h3 className="font-bold text-[#00f0ff] text-sm flex items-center gap-2"><Volume2 size={16} />Vorlesefunktion</h3>
          <p className="mt-1 text-xs text-[#8b949e]">Auf diesem Gerät ist keine Sprachausgabe verfügbar.</p>
        </div>
      )}

      <div className="cyber-card p-4">
        <h3 className="font-bold text-[#00f0ff] text-sm flex items-center gap-2"><RotateCcw size={16} />Onboarding wiederholen</h3>
        <p className="mt-1 text-xs text-[#8b949e]">Sam wird dich beim nächsten Start erneut begrüßen und die Einführung zeigen.</p>
        <button onClick={resetOnboarding} className="cyber-btn-outline text-xs mt-3 px-3 py-2">Onboarding zurücksetzen</button>
      </div>

      <div className="cyber-card p-4 border-[#ff3355]/30">
        <h3 className="font-bold text-[#ff3355] text-sm flex items-center gap-2"><AlertTriangle size={16} />Fortschritt löschen</h3>
        <p className="mt-1 text-xs text-[#8b949e]">Löscht alle lokal gespeicherten Daten: Spielstand, Notizen, E-Mails, Lernerfolge und Einstellungen. Kann nicht rückgängig gemacht werden.</p>
        {confirmReset ? (
          <div className="flex gap-2 mt-3">
            <button onClick={() => setConfirmReset(false)} className="cyber-btn-outline text-xs px-3 py-2">Abbrechen</button>
            <button onClick={resetAllProgress} className="cyber-btn text-xs px-3 py-2 bg-[#ff3355]/20 border-[#ff3355] hover:bg-[#ff3355]/30 flex items-center gap-1"><Trash2 size={14} />Alles löschen</button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="cyber-btn-outline text-xs mt-3 px-3 py-2 text-[#ff3355] border-[#ff3355] hover:bg-[#ff3355]/10">Fortschritt zurücksetzen</button>
        )}
      </div>
    </div>
  );
}
