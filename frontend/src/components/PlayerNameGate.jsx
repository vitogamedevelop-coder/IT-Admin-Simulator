import { useState } from 'react';
import { Shield } from 'lucide-react';
import { setPlayerName } from '../lib/gameState';

const PROMPTED_KEY = 'it-learn:name-prompted';

// One-time, purely local display-name prompt shown before the tutorial on
// first launch. NOT an account/login - just a nickname stored on the
// existing gameState profile (see gameState.js playerName). Skipping is
// always allowed; the rest of the app (Sam's greetings, etc.) already
// tolerates a missing name.
export default function PlayerNameGate({ onDone }) {
  const [visible, setVisible] = useState(() => localStorage.getItem(PROMPTED_KEY) !== 'true');
  const [name, setName] = useState('');

  function finish(submittedName) {
    if (submittedName) setPlayerName(submittedName);
    localStorage.setItem(PROMPTED_KEY, 'true');
    setVisible(false);
    onDone?.();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#030508]/95 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#00f0ff] bg-[#0d1117] p-6 shadow-[0_0_3rem_rgba(0,240,255,0.3)]">
        <div className="flex items-center gap-2 text-[#00ff66]"><Shield size={22} /><span className="font-bold tracking-wider">NEXUS Systems</span></div>
        <p className="mt-4 text-sm text-[#c9d1d9]">Willkommen bei NEXUS Systems.</p>
        <p className="mt-1 text-sm text-[#c9d1d9]">Wie dürfen wir dich nennen?</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') finish(name); }}
          maxLength={20}
          placeholder="Anzeigename (optional)"
          className="mt-3 w-full rounded-lg border border-[#1f2937] bg-[#050505] px-3 py-2 text-sm text-white placeholder:text-[#8b949e] focus:border-[#00f0ff] focus:outline-none"
        />
        <button onClick={() => finish(name)} className="cyber-btn mt-4 w-full">Weiter</button>
        <button onClick={() => finish('')} className="mt-2 w-full text-xs text-[#8b949e]">Ohne Namen fortfahren</button>
      </div>
    </div>
  );
}
