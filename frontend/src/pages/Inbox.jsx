import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Mail, Monitor, Phone, ShieldAlert, Wrench } from 'lucide-react';
import { readGameState } from '../lib/gameState';
import { availableQuests } from '../lib/questData';
import { changeMissionAvailable, sortedInbox } from '../lib/sideMissionEngine';
import ContextHint from '../components/ContextHint';
import { characterAsset } from '../lib/rpgAssets';
import { questPath } from '../lib/questRouter';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

const icons = { phone: Phone, mail: Mail, monitor: Monitor };
const priorityColor = { P1: 'text-[#ff3355] border-[#ff3355]', P2: 'text-[#ffcc00] border-[#ffcc00]', P3: 'text-[#8b949e] border-[#30363d]' };

export default function Inbox() {
  const navigate = useNavigate();
  useAppBack();
  const state = readGameState();
  const sideMissions = sortedInbox();
  const mainQuests = availableQuests(state);
  return <div className="flex flex-col gap-4 py-2">
    <BackBar label="Arbeitsplatz" />
    <ContextHint id="inbox" person="Mara König · Helpdesk" character="mara" title="Unser gemeinsamer Eingang">Hier landen Anrufe, E-Mails und Monitoring-Alarme. P1 kommt zuerst; Nebenmissionen sind bekannte Fälle, mit denen dein Wissen frisch bleibt.</ContextHint>
    <div className="cyber-card p-4"><h2 className="font-bold text-[#00f0ff]">Kommunikations- & Ereigniseingang</h2><p className="text-xs text-[#8b949e] mt-2">P1 bedroht Betrieb oder Sicherheit, P2 beeinträchtigt mehrere Personen, P3 ist planbar. Arbeite nach Auswirkung und Dringlichkeit.</p></div>
    {mainQuests.length > 0 && <div><h3 className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2">Hauptvorfälle · neues Wissen</h3><div className="flex flex-col gap-2">{mainQuests.map((quest) => <button key={quest.id} onClick={() => navigate(questPath(quest.id))} className="cyber-card p-4 text-left flex items-center gap-3"><ShieldAlert size={22} className={quest.boss ? 'text-[#ff3355]' : 'text-[#00f0ff]'} /><div className="flex-1"><div className="font-bold text-white text-sm">{quest.title}</div><div className="text-xs text-[#8b949e]">{quest.subtitle}</div></div><span className={quest.boss ? 'text-[#ff3355]' : 'text-[#ffcc00]'}>{quest.boss ? 'P1' : 'P2'}</span></button>)}</div></div>}
    <div><h3 className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2">Nebenmissionen · bekanntes Wissen festigen</h3>{sideMissions.length ? <div className="flex flex-col gap-2">{sideMissions.map((mission) => { const Icon = icons[mission.channel] || Mail; const portrait = mission.channel !== 'monitor' ? characterAsset(mission.personId) || characterAsset('sam') : null; return <button key={mission.id} onClick={() => navigate(`/side-mission/${encodeURIComponent(mission.id)}`)} className="cyber-card p-4 text-left flex items-center gap-3">{portrait ? <img src={portrait} alt={mission.personName} className="h-10 w-10 rounded-full border border-[#00f0ff] object-cover" /> : <Icon size={21} className="text-[#00f0ff]" />}<div className="flex-1"><div className="font-bold text-white text-sm">{mission.title}</div><div className="text-xs text-[#8b949e] mt-1">{mission.topic} · {mission.personRole}</div></div><span className={`text-xs border rounded px-2 py-1 ${priorityColor[mission.priority]}`}>{mission.priority}</span></button>; })}</div> : <div className="cyber-card p-4 text-sm text-[#8b949e]">Momentan keine Wiederholungsfälle. Nach abgeschlossenen Hauptquests tauchen bekannte Probleme realistisch wieder auf.</div>}</div>
    {changeMissionAvailable() && <button onClick={() => navigate('/change-management')} className="cyber-card p-4 text-left flex items-center gap-3"><Wrench size={22} className="text-[#ffcc00]" /><div className="flex-1"><div className="font-bold text-white text-sm">Geplante Änderung</div><div className="text-xs text-[#8b949e]">Change planen, Risiko prüfen und Rollback vorbereiten</div></div></button>}
    <div className="cyber-card p-3 flex items-start gap-2 text-xs text-[#8b949e]"><AlertTriangle size={15} className="text-[#ffcc00] shrink-0" /> Wiederkehrende Probleme sind keine inhaltliche Rückstufung. Sie prüfen, ob Grundlagen auch mit zeitlichem Abstand und in einem neuen Kontext sicher sitzen.</div>
  </div>;
}
