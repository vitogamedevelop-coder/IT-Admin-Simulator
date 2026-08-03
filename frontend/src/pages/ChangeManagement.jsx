import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { changeMissionAvailable } from '../lib/sideMissionEngine';
import ContextHint from '../components/ContextHint';
import { rpgAssets } from '../lib/rpgAssets';

const phases = [
  { title: 'Ziel und Umfang', prompt: 'DNS-Server DC-01 soll auf eine neue IP migriert werden. Was muss der Change beschreiben?', options: ['Ziel, betroffene Systeme, Abhängigkeiten und Erfolgskriterien', 'Nur die neue IP', 'Nur den Termin'], answer: 'Ziel, betroffene Systeme, Abhängigkeiten und Erfolgskriterien' },
  { title: 'Risiko', prompt: 'Welches zentrale Risiko besteht?', options: ['Clients und AD-Dienste finden DNS nicht mehr', 'Der Monitor wird dunkler', 'Mauszeiger wird langsam'], answer: 'Clients und AD-Dienste finden DNS nicht mehr' },
  { title: 'Vorbereitung', prompt: 'Was gehört vor die Umsetzung?', options: ['Backup, Konfigurationssicherung, Kommunikations- und Testplan', 'Logs löschen', 'Unangekündigt starten'], answer: 'Backup, Konfigurationssicherung, Kommunikations- und Testplan' },
  { title: 'Rollback', prompt: 'Was ist ein belastbarer Rollback?', options: ['Alte IP und DNS-Konfiguration dokumentiert wiederherstellen', 'Auf gut Glück neu starten', 'Änderung ignorieren'], answer: 'Alte IP und DNS-Konfiguration dokumentiert wiederherstellen' },
  { title: 'Validierung', prompt: 'Wie wird der Change abgeschlossen?', options: ['DNS, AD-Dienste, Clients und Monitoring testen und dokumentieren', 'Nur prüfen, ob der Server eingeschaltet ist', 'Sofort Ticket schließen'], answer: 'DNS, AD-Dienste, Clients und Monitoring testen und dokumentieren' },
];

export default function ChangeManagement() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  if (!changeMissionAvailable()) return <div className="flex flex-col gap-4 py-2"><ContextHint id="change-locked" person="Thomas Weber · Geschäftsführung" character="weber" title="Change Management">Change Management wird freigeschaltet, sobald die Firma gewachsen ist und mehrere Kompetenzen stabil aufgebaut wurden.</ContextHint><div className="cyber-card p-5 text-sm text-[#8b949e]">Noch nicht freigeschaltet.</div></div>;
  if (index >= phases.length) return <div className="flex flex-col items-center gap-4 py-10 text-center"><ClipboardCheck size={56} className="text-[#00ff66]" /><h2 className="text-xl font-bold text-white">Change freigegeben</h2><p className="text-sm text-[#c9d1d9]">Du hast Ziel, Risiko, Vorbereitung, Rollback und Validierung berücksichtigt.</p><button onClick={() => navigate('/runbooks')} className="cyber-btn w-full">Runbooks öffnen</button></div>;
  const phase = phases[index];
  const result = results[index];
  function check() { setResults((items) => [...items, selected === phase.answer]); }
  function next() { setIndex((value) => value + 1); setSelected(null); }
  return <div className="flex flex-col gap-4 py-2"><ContextHint id="change-management" person="Thomas Weber · Geschäftsführung" character="weber" title="Produktive Änderungen">Ein Change braucht Ziel, Risikoanalyse, Backup, Test und Rollback. Deshalb wird dieser Bereich erst mit ausreichender Erfahrung freigeschaltet.</ContextHint>
      <div className="cyber-card overflow-hidden"><img src={rpgAssets.locations.meetingRoom} alt="Besprechungsraum" className="h-32 w-full object-cover" /><div className="p-4"><div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Change Request CR-1042 · Schritt {index + 1}/{phases.length}</div><h2 className="font-bold text-[#00f0ff] mt-2">{phase.title}</h2></div></div><div className="cyber-card p-4"><h3 className="font-bold text-white mb-4">{phase.prompt}</h3><div className="flex flex-col gap-2">{phase.options.map((option) => <button key={option} disabled={result !== undefined} onClick={() => setSelected(option)} className={`p-3 text-left rounded border text-sm ${selected === option ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#30363d] text-[#c9d1d9]'}`}>{option}</button>)}</div>{result !== undefined && <div className={`mt-4 text-sm ${result ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>{result ? 'Sauber geplant.' : `Wichtiger Punkt: ${phase.answer}`}</div>}{result === undefined ? <button onClick={check} disabled={!selected} className="cyber-btn w-full mt-4">Entscheidung prüfen</button> : <button onClick={next} className="cyber-btn w-full mt-4">weiter</button>}</div></div>;
}
