import { useNavigate } from 'react-router-dom';
import { Award, BarChart3, BookOpen, BrainCircuit, Bug, CalendarCheck, ClipboardList, Code, FolderOpen, GraduationCap, Network, Shuffle, Terminal, Ticket, Zap } from 'lucide-react';
import { rpgAssets } from '../lib/rpgAssets';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

// TEMPORARY DEV ACCESS: Sam is not yet a persistent hallway NPC, so this
// entry point is a stand-in for "im Flur ansprechen -> Kannst du mir etwas
// beibringen?". Sam's hallway smalltalk (Workspace.jsx defaultDialog) is the
// real, intended entry point going forward. Remove this single item once
// that flow is the sole way in.
const DEV_ACADEMY_ACCESS = { path: '/academy', label: 'NEXUS Academy (Dev-Zugang)', desc: 'Vorschau - wird später durch Sam im Flur ersetzt', icon: GraduationCap };

const groups = [
  { title: 'Akademien', items: [
    DEV_ACADEMY_ACCESS,
    { path: '/it', label: 'IT & Systeme', desc: 'Alle 14 Admin-Module', icon: BookOpen },
    { path: '/coding', label: 'Coding Academy', desc: 'C# und Unity', icon: Code },
  ] },
  { title: 'Praktisches Training', items: [
    { path: '/subnet', label: 'Subnetting-Trainer', desc: 'Netze berechnen', icon: Network },
    { path: '/ticket', label: 'Klassischer Ticket-Simulator', desc: 'Supportfall üben', icon: Ticket },
    { path: '/fillblanks', label: 'Befehls-Lückentext', desc: 'Syntax abrufen', icon: ClipboardList },
    { path: '/flashcards', label: 'Karteikasten', desc: 'Spaced Repetition', icon: BrainCircuit },
    { path: '/retrieval', label: 'Abruftraining', desc: 'Gemischte Fragen', icon: Shuffle },
    { path: '/speedrun/it', label: 'Speed-Run', desc: 'Tempo-Quiz', icon: Zap },
    { path: '/patch', label: 'Patch Center', desc: 'Fehler wiederholen', icon: Bug },
  ] },
  { title: 'Werkzeuge', items: [
    { path: '/cheat', label: 'Cheat-Sheet Terminal', desc: 'Befehle nachschlagen', icon: Terminal },
    { path: '/custom', label: 'Eigene Inhalte', desc: 'Karten und Merksätze', icon: FolderOpen },
    { path: '/challenge', label: 'Tageschallenge', desc: 'Kurze tägliche Frage', icon: CalendarCheck },
    { path: '/exam', label: 'Abschlussprüfung', desc: 'Fachbereich testen', icon: Award },
    { path: '/ihk', label: 'IHK-Vorbereitung', desc: 'Prüfungsnahe Aufgaben', icon: GraduationCap },
    { path: '/stats', label: 'Lernstatistik', desc: 'Kompetenzen ansehen', icon: BarChart3 },
  ] },
];

export default function TrainingArchive() {
  const navigate = useNavigate();
  useAppBack();
  return <div className="flex flex-col gap-5 py-2"><BackBar label="Arbeitsplatz" /><div className="cyber-card overflow-hidden"><img src={rpgAssets.locations.development} alt="Schulungsraum" className="h-32 w-full object-cover" /><div className="p-4"><h2 className="font-bold text-[#00f0ff]">Trainingsarchiv</h2><p className="text-xs text-[#8b949e] mt-2">Alle bisherigen Lerninhalte bleiben vollständig erhalten und können jederzeit frei trainiert werden.</p></div></div>{groups.map((group) => <div key={group.title}><h3 className="text-xs uppercase tracking-widest text-[#8b949e] mb-2">{group.title}</h3><div className="grid grid-cols-1 gap-2">{group.items.map((item) => { const Icon = item.icon; return <button key={item.path} onClick={() => navigate(item.path)} className="cyber-card p-3 text-left flex items-center gap-3"><Icon size={21} className="text-[#00f0ff]" /><div><div className="font-bold text-white text-sm">{item.label}</div><div className="text-xs text-[#8b949e]">{item.desc}</div></div></button>; })}</div></div>)}</div>;
}
