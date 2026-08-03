import { useState } from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import DialogView from './DialogView';
import { examplePhoneDialog } from '../lib/dialogSystem';
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
      <button onClick={() => setActiveCall(examplePhoneDialog)} className="cyber-card p-3 text-left flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#00f0ff]/10 flex items-center justify-center"><Phone size={18} className="text-[#00f0ff]" /></div>
        <div>
          <div className="font-bold text-white text-sm">Mara König</div>
          <div className="text-xs text-[#8b949e]">Helpdesk · Neuer Netzwerkfall</div>
        </div>
      </button>
    </div>
  );
}
