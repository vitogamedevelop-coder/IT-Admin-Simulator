import { useState } from 'react';
import { BookMarked, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { readGameState } from '../lib/gameState';
import { questById } from '../lib/questData';
import GlossaryText from '../components/GlossaryText';
import ContextHint from '../components/ContextHint';
import { rpgAssets } from '../lib/rpgAssets';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

export default function Runbooks() {
  const [open, setOpen] = useState(null);
  useAppBack();
  const state = readGameState();
  const stored = state.runbooks || [];
  const migrated = state.completedQuests.filter((id) => !stored.some((item) => item.id === id)).map((id) => {
    const quest = questById(id);
    return quest ? { id, title: quest.title, category: quest.department, symptom: quest.subtitle, cause: quest.resolution, steps: quest.steps.map((step) => step.options.find((option) => option.correct)?.label).filter(Boolean), mistakes: quest.steps.flatMap((step) => step.options.filter((option) => !option.correct).map((option) => option.label)).slice(0, 4), tools: quest.unlockTools || [] } : null;
  }).filter(Boolean);
  const runbooks = [...stored, ...migrated];
  return <div className="flex flex-col gap-4 py-2"><BackBar label="Arbeitsplatz" /><ContextHint id="runbooks" person="Sam Richter · Senior-Administrator" character="sam" title="Deine Betriebsbibliothek">Aus jedem gelösten Hauptvorfall entsteht automatisch ein Runbook. Nutze es später als bewährte Anleitung und zum Nachlesen.</ContextHint><div className="cyber-card overflow-hidden"><img src={rpgAssets.locations.serverRoom} alt="Serverraum" className="h-32 w-full object-cover" /><div className="p-4"><div className="flex items-center gap-2 text-[#00f0ff]"><BookMarked size={20} /><h2 className="font-bold">NEXUS Runbook-Bibliothek</h2></div><p className="text-xs text-[#8b949e] mt-2">Erfolgreiche Hauptmissionen werden automatisch als nachvollziehbare Betriebsanleitungen dokumentiert.</p></div></div>{runbooks.length ? <div className="flex flex-col gap-2">{runbooks.map((runbook) => { const expanded = open === runbook.id; return <div key={runbook.id} className="cyber-card overflow-hidden"><button onClick={() => setOpen(expanded ? null : runbook.id)} className="w-full p-4 flex items-center justify-between text-left"><div><div className="text-[9px] uppercase tracking-widest text-[#00f0ff]">{runbook.category || 'Betrieb'}</div><div className="font-bold text-white text-sm mt-1">{runbook.title}</div><div className="text-xs text-[#8b949e] mt-1">{runbook.symptom}</div></div>{expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>{expanded && <div className="border-t border-[#1f2937] p-4"><h3 className="text-xs font-bold text-[#00f0ff]">Bewährter Ablauf</h3><ol className="list-decimal list-inside text-sm text-[#c9d1d9] mt-2 flex flex-col gap-2">{runbook.steps.map((step, index) => <li key={index}><GlossaryText>{step}</GlossaryText></li>)}</ol>{runbook.mistakes?.length > 0 && <><h3 className="text-xs font-bold text-[#ffcc00] mt-4">Typische Fehlwege</h3><ul className="list-disc list-inside text-xs text-[#8b949e] mt-2">{runbook.mistakes.map((mistake, index) => <li key={index}><GlossaryText>{mistake}</GlossaryText></li>)}</ul></>}<h3 className="text-xs font-bold text-[#00f0ff] mt-4">Ursache und Ergebnis</h3><GlossaryText as="p" className="text-sm text-[#c9d1d9] mt-2">{runbook.cause}</GlossaryText>{runbook.tools.length > 0 && <div className="mt-4 flex items-center gap-2 text-xs text-[#ffcc00]"><Terminal size={14} /> {runbook.tools.join(' · ')}</div>}</div>}</div>; })}</div> : <div className="cyber-card p-6 text-center"><BookMarked size={42} className="mx-auto text-[#8b949e]" /><p className="text-sm text-[#c9d1d9] mt-3">Noch keine Runbooks vorhanden.</p><p className="text-xs text-[#8b949e] mt-1">Schließe einen Hauptvorfall ab, um das erste Runbook anzulegen.</p></div>}</div>;
}
