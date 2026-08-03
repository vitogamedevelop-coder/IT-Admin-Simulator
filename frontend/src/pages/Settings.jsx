import { useState } from 'react';
import { RotateCcw, Trash2, AlertTriangle, Info } from 'lucide-react';
import { resetOnboarding } from '../components/Onboarding';
import { getVersionLabel } from '../lib/version';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

export default function Settings() {
  const [confirmReset, setConfirmReset] = useState(false);
  useAppBack();

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
