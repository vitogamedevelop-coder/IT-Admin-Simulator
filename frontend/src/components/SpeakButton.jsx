import { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { speak, stop, isSupported } from '../lib/speechSynthesis';

export default function SpeakButton({ text, className = '' }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSupported();

  useEffect(() => {
    // Stop current speech when the displayed text changes (new section).
    return () => {
      stop().catch(() => {});
    };
  }, [text]);

  if (!supported) return null;

  async function toggle(e) {
    e?.stopPropagation();
    if (speaking) {
      await stop();
      setSpeaking(false);
      return;
    }
    await speak(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-2 text-xs text-[#00f0ff] hover:text-white transition-colors ${className}`}
      aria-label={speaking ? 'Vorlesen stoppen' : 'Vorlesen'}
    >
      {speaking ? <Square size={14} fill="currentColor" /> : <Volume2 size={14} />}
      <span>{speaking ? 'Stoppen' : 'Vorlesen'}</span>
    </button>
  );
}
