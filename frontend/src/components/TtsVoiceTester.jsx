import { useEffect, useState } from 'react';
import { Volume2, Square, Check } from 'lucide-react';
import {
  getNativeVoices,
  getPreferredVoice,
  savePreferredVoice,
  speakWithVoice,
  stop,
} from '../lib/speechSynthesis';

export default function TtsVoiceTester({ text }) {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [preferred, setPreferred] = useState(null);

  useEffect(() => {
    getNativeVoices().then((all) => {
      const de = all.filter((v) => v.lang?.toLowerCase().startsWith('de'));
      setVoices(de);
      setPreferred(getPreferredVoice());
      setLoading(false);
    });

    return () => {
      stop().catch(() => {});
    };
  }, []);

  async function play(voice) {
    await stop();
    setSpeakingIndex(voice.index);
    await speakWithVoice(text, voice, {
      onStart: () => setSpeakingIndex(voice.index),
      onEnd: () => setSpeakingIndex(null),
      onError: () => setSpeakingIndex(null),
    });
  }

  async function stopPlaying() {
    await stop();
    setSpeakingIndex(null);
  }

  function selectAsPreferred(voice) {
    savePreferredVoice(voice);
    setPreferred(voice);
  }

  if (loading) {
    return <div className="text-xs text-[#8b949e] mt-3">Stimmen werden geladen...</div>;
  }

  if (voices.length === 0) {
    return <div className="text-xs text-[#ffcc00] mt-3">Keine deutschen Stimmen gefunden.</div>;
  }

  return (
    <div className="mt-3 cyber-card p-3">
      <div className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2">TTS Voice-Test (nur für Sam)</div>
      <div className="flex flex-col gap-2">
        {voices.map((voice) => (
          <div
            key={voice.index}
            className={`flex items-center justify-between gap-2 p-2 rounded border ${preferred?.index === voice.index ? 'border-[#00ff66] bg-[#00ff66]/5' : 'border-[#30363d] bg-[#0d1117]'}`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#c9d1d9] font-bold truncate">
                #{voice.index} {voice.voiceURI || voice.name}
              </div>
              <div className="text-[10px] text-[#8b949e]">
                {voice.lang} · {voice.localService ? 'lokal' : 'Netzwerk'} · Gender-Hinweis: {voice.genderHint || 'unbekannt'}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => (speakingIndex === voice.index ? stopPlaying() : play(voice))}
                className="p-1.5 rounded text-[#00f0ff] hover:bg-[#00f0ff]/10"
                aria-label={speakingIndex === voice.index ? 'Stoppen' : 'Probehören'}
              >
                {speakingIndex === voice.index ? <Square size={14} fill="currentColor" /> : <Volume2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => selectAsPreferred(voice)}
                className={`p-1.5 rounded hover:bg-[#00ff66]/10 ${preferred?.index === voice.index ? 'text-[#00ff66]' : 'text-[#8b949e]'}`}
                aria-label="Als Sam-Stimme verwenden"
                title="Als Sam-Stimme verwenden"
              >
                <Check size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {preferred && (
        <div className="text-[10px] text-[#00ff66] mt-2">
          Bevorzugt für Sam: #{preferred.index} {preferred.voiceURI}
        </div>
      )}
    </div>
  );
}
