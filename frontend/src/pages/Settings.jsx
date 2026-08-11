import { useEffect, useState } from 'react';
import { RotateCcw, Trash2, AlertTriangle, Info, Volume2, ExternalLink } from 'lucide-react';
import { resetOnboarding } from '../components/Onboarding';
import { getVersionLabel } from '../lib/version';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';
import {
  isNativeTtsSupported,
  getTtsSettings,
  setTtsSettings,
  getNativeVoices,
  getDisplayVoiceLabel,
  openTtsSettings,
  speakWithVoice,
  stop,
} from '../lib/speechSynthesis';

const TEST_SENTENCE = 'Hallo, ich bin Sam. So würde ich dir die Academy vorlesen.';

function useTtsVoices() {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!isNativeTtsSupported()) {
      setLoading(false);
      return undefined;
    }
    getNativeVoices().then((all) => {
      if (!mounted) return;
      // Sort German voices first, then everything else.
      const sorted = [...all].sort((a, b) => {
        const aDe = a.lang?.toLowerCase().startsWith('de') ? 1 : 0;
        const bDe = b.lang?.toLowerCase().startsWith('de') ? 1 : 0;
        if (aDe !== bDe) return bDe - aDe;
        return (a.name || '').localeCompare(b.name || '');
      });
      setVoices(sorted);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { voices, loading };
}

export default function Settings() {
  const [confirmReset, setConfirmReset] = useState(false);
  const [settings, setSettings] = useState(getTtsSettings);
  const { voices, loading } = useTtsVoices();
  const [speaking, setSpeaking] = useState(false);
  const [testVoice, setTestVoice] = useState(null);
  const hasNativeTts = isNativeTtsSupported();
  useAppBack();

  useEffect(() => {
    return () => {
      stop().catch(() => {});
    };
  }, []);

  function updateSettings(partial) {
    const next = { ...settings, ...partial };
    setSettings(next);
    setTtsSettings(next);
  }

  async function playTest() {
    const chosen = testVoice || voices.find((v) => settings.voiceId && v.index === settings.voiceId.index && v.voiceURI === settings.voiceId.voiceURI) || voices[0];
    if (!chosen) return;
    await stop();
    setSpeaking(true);
    await speakWithVoice(TEST_SENTENCE, chosen, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  async function stopTest() {
    await stop();
    setSpeaking(false);
  }

  function selectVoice(voice) {
    updateSettings({ voiceId: { index: voice.index, voiceURI: voice.voiceURI } });
    setTestVoice(voice);
  }

  function resetAllProgress() {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  }

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

      {hasNativeTts && (
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
              <div className="mt-3">
                <label className="text-xs text-[#8b949e] block mb-1">Stimme auswählen</label>
                {loading ? (
                  <div className="text-xs text-[#8b949e]">Stimmen werden geladen...</div>
                ) : voices.length === 0 ? (
                  <div className="text-xs text-[#ffcc00]">Keine Stimmen gefunden.</div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {voices.map((voice) => (
                      <button
                        key={voice.index}
                        type="button"
                        onClick={() => selectVoice(voice)}
                        className={`text-left p-2 rounded border text-xs ${settings.voiceId?.index === voice.index && settings.voiceId?.voiceURI === voice.voiceURI ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white' : 'border-[#30363d] text-[#c9d1d9] hover:border-[#00f0ff]/60'}`}
                      >
                        <div className="font-bold">{getDisplayVoiceLabel(voice)}</div>
                        <div className="text-[10px] text-[#8b949e]">{voice.lang} · {voice.localService ? 'lokal' : 'Netzwerk'} · ID {voice.index}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={speaking ? stopTest : playTest}
                  disabled={voices.length === 0}
                  className="cyber-btn-outline text-xs px-3 py-2 disabled:opacity-50"
                >
                  {speaking ? 'Test stoppen' : 'Stimme testen'}
                </button>
                {typeof openTtsSettings === 'function' && (
                  <button
                    type="button"
                    onClick={openTtsSettings}
                    className="cyber-btn-outline text-xs px-3 py-2 flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    System-Sprachoptionen
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="cyber-card p-4">
        <h3 className="font-bold text-[#00f0ff] text-sm">Einweisung</h3>
        <p className="mt-1 text-xs text-[#8b949e]">Die erste Arbeitsplatz-Einweisung erneut ansehen.</p>
        <button onClick={resetOnboarding} className="cyber-btn-outline mt-3 w-full"><RotateCcw size={15} className="mr-2" />Einweisung neu starten</button>
      </div>
      <div className="cyber-card p-4 border border-[#ff3355]">
        <h3 className="font-bold text-[#ff3355] text-sm flex items-center gap-2"><AlertTriangle size={16} />Fortschritt löschen</h3>
        <p className="mt-1 text-xs text-[#8b949e]">Löscht alle Spielstände, Quests, Notizen und Einstellungen. Kann nicht rückgängig gemacht werden.</p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="cyber-btn-outline mt-3 w-full border-[#ff3355] text-[#ff3355]"><Trash2 size={15} className="mr-2" />Alles zurücksetzen</button>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <div className="text-xs text-[#ff3355]">Bist du sicher? Dies löscht alles.</div>
            <button onClick={resetAllProgress} className="cyber-btn w-full bg-[#ff3355]"><Trash2 size={15} className="mr-2" />Ja, alles löschen</button>
            <button onClick={() => setConfirmReset(false)} className="cyber-btn-outline w-full">Abbrechen</button>
          </div>
        )}
      </div>
    </div>
  );
}
