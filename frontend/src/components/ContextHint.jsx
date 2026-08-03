import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { characterAsset } from '../lib/rpgAssets';

const PREFIX = 'it-learn:hint-seen:';

const CHARACTER_BY_PERSON = {
  'Sam Richter · Senior-Administrator': 'sam',
  'Mara König · Helpdesk': 'mara',
  'Lea Novak · Security Operations': 'lea',
  'David Chen · Netzwerkadministration': 'david',
  'Thomas Weber · Geschäftsführung': 'weber',
  'Aylin Demir · Netzwerkadministration': 'aylin',
};

export default function ContextHint({ id, person = 'Sam Richter · Senior-Administrator', title, children, character }) {
  const [visible, setVisible] = useState(() => localStorage.getItem(`${PREFIX}${id}`) !== 'true');
  const [failed, setFailed] = useState(false);
  if (!visible) return null;
  function close() {
    localStorage.setItem(`${PREFIX}${id}`, 'true');
    setVisible(false);
  }
  const characterId = character || CHARACTER_BY_PERSON[person];
  const portrait = characterId && !failed ? characterAsset(characterId) : null;
  return <div className="cyber-card p-4 border-l-4 border-[#00f0ff]">
    <div className="flex items-start gap-3">
      {portrait ? <img src={portrait} alt={person} onError={() => setFailed(true)} className="h-11 w-11 shrink-0 rounded-full border border-[#00f0ff] object-cover" /> : <Info size={19} className="text-[#00f0ff] shrink-0 mt-0.5" />}
      <div className="flex-1"><div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Kurze Einweisung · {person}</div><div className="font-bold text-white text-sm mt-1">{title}</div><p className="text-xs text-[#c9d1d9] leading-relaxed mt-2">„{children}“</p></div><button onClick={close} aria-label="Hinweis schließen" className="text-[#8b949e]"><X size={16} /></button></div>
  </div>;
}
