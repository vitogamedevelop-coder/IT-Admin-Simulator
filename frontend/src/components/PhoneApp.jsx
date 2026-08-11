import { useState } from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import DialogView from './DialogView';
import { colleagues } from '../lib/officeWorld';

export default function PhoneApp({ onClose }) {
  const [activeCall, setActiveCall] = useState(null);

  if (activeCall) {
    const person = colleagues.find((c) => c.id === activeCall.personId) || { name: 'Unbekannt', role: '' };
    return (
      <div className="h-full flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => { setActiveCall(null); if (onClose) onClose(); }} className="p-2 rounded border border-[#30363d] text-[#8b949e]"><ArrowLeft size={18} /></button>
          <span className="text-xs text-[#8b949e]">Anrufliste</span>
        </div>
        <DialogView
          dialog={activeCall}
          person={person}
          onComplete={() => setActiveCall(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 text-[#00f0ff]"><Phone size={20} /><h2 className="font-bold">Telefon</h2></div>
      <p className="text-xs text-[#8b949e]">Eingehende und ausgehende Anrufe werden hier angezeigt.</p>
      <div className="cyber-card p-4 text-sm text-[#8b949e]">
        Aktuell liegen keine eingehenden Anrufe vor. Neue Fälle erscheinen, sobald Missionsszenarien verfügbar sind.
      </div>
    </div>
  );
}
