import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, BookMarked, BookOpen, BriefcaseBusiness, Building2, Clock, Inbox, Radio, ShieldAlert, Armchair, Upload } from 'lucide-react';
import { gameSummary, getReturnSummary } from '../lib/gameState';
import { availableQuests, recommendedQuest } from '../lib/questData';
import { sortedInbox } from '../lib/sideMissionEngine';
import { companyAsset } from '../lib/rpgAssets';
import { companyStage } from '../lib/officeWorld';
import { seedInitialNotifications, tickScheduler } from '../lib/notificationSystem';
import { questPath } from '../lib/questRouter';

export default function Dashboard() {
  const navigate = useNavigate();
  const [returnSummary, setReturnSummary] = useState(() => getReturnSummary());
  const { state, career } = useMemo(() => gameSummary(), []);
  const recommended = recommendedQuest(state);
  const available = availableQuests(state);
  const inbox = useMemo(() => sortedInbox(), []);
  const online = Object.values(state.infrastructure).filter((item) => item.unlocked && item.status === 'online').length;
  const unlocked = Object.values(state.infrastructure).filter((item) => item.unlocked).length;
  const stage = companyStage(state.completedQuests.length);

  useEffect(() => {
    seedInitialNotifications();
    tickScheduler();
  }, []);

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card overflow-hidden relative">
        <img src={companyAsset(stage.id)} alt={`Firmenstufe ${stage.id}`} className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#8b949e]">NEXUS Systems · Einsatzzentrale</div>
          <div className="flex items-start justify-between mt-2">
            <div><h2 className="text-lg font-bold text-white">Guten Dienst, Operator.</h2><p className="text-xs text-[#00f0ff] mt-1">{career.title} · Stufe {career.level}</p></div>
            <div className="flex items-center gap-1 text-xs text-[#00ff66]"><Activity size={14} /> {online}/{unlocked}</div>
          </div>
        </div>
      </div>

      {returnSummary && <div className="cyber-card p-4 border-l-4 border-[#00f0ff]"><div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Sam Richter · Schichtübergabe</div><p className="text-sm text-[#c9d1d9] mt-2">„{returnSummary}“</p><button onClick={() => setReturnSummary(null)} className="text-xs text-[#00f0ff] mt-3">verstanden</button></div>}

      {inbox.length > 0 && <button onClick={() => navigate(`/side-mission/${encodeURIComponent(inbox[0].id)}`)} className="cyber-card p-3 text-left flex items-center gap-3 border-l-4 border-[#ffcc00]"><Inbox size={20} className="text-[#ffcc00]" /><div className="flex-1"><div className="text-[10px] uppercase tracking-widest text-[#8b949e]">{inbox[0].channel === 'phone' ? 'Telefon' : inbox[0].channel === 'mail' ? 'E-Mail' : 'Monitoring'} · {inbox[0].priority}</div><div className="text-sm text-white font-bold mt-1">{inbox[0].title}</div></div><ArrowRight size={15} className="text-[#ffcc00]" /></button>}

      {recommended ? (
        <button data-tour="operations" onClick={() => navigate(questPath(recommended.id))} className={`cyber-card p-5 text-left border-l-4 ${recommended.boss ? 'border-[#ff3355]' : 'border-[#00ff66]'}`}>
          <div className="flex items-center justify-between"><span className={`text-[10px] uppercase tracking-widest ${recommended.boss ? 'text-[#ff3355]' : 'text-[#00f0ff]'}`}>{recommended.boss ? 'Kritischer Vorfall' : state.activeQuest ? 'Aktiver Einsatz' : 'Nächster Einsatz'}</span><Radio size={16} className={recommended.boss ? 'text-[#ff3355]' : 'text-[#00ff66]'} /></div>
          <h3 className="text-lg font-bold text-white mt-2">{recommended.title}</h3>
          <p className="text-sm text-[#c9d1d9] mt-1">{recommended.subtitle}</p>
          <p className="text-xs text-[#8b949e] mt-3 line-clamp-2">{recommended.briefing}</p>
          <div className="flex items-center justify-between mt-4"><span className="flex items-center gap-1 text-xs text-[#ffcc00]"><Clock size={13} /> ca. {recommended.minutes} Min.</span><span className="flex items-center gap-1 text-xs font-bold text-[#00ff66]">Einsatz öffnen <ArrowRight size={14} /></span></div>
        </button>
      ) : (
        <div className="cyber-card p-4 text-center"><ShieldAlert size={32} className="mx-auto text-[#00ff66]" /><p className="text-sm text-white mt-2">Alle aktuellen Vorfälle gelöst.</p></div>
      )}

      {available.length > 1 && <div className="cyber-card p-3"><div className="text-[10px] text-[#8b949e] uppercase tracking-widest">Weitere offene Tickets</div><div className="flex gap-2 mt-2 overflow-x-auto">{available.slice(1).map((quest) => <button key={quest.id} onClick={() => navigate(questPath(quest.id))} className="shrink-0 border border-[#30363d] rounded px-3 py-2 text-left"><div className="text-xs text-white">{quest.title}</div><div className="text-[10px] text-[#8b949e]">{quest.minutes} Min.</div></button>)}</div></div>}

      <div className="grid grid-cols-2 gap-3">
        <NavCard tour="inbox" icon={Inbox} title="Eingang" subtitle={`${inbox.length} Meldungen`} onClick={() => navigate('/inbox')} />
        <NavCard icon={Armchair} title="Arbeitsplatz" subtitle="PC, Telefon, Terminal" onClick={() => navigate('/workspace')} />
        <NavCard tour="infrastructure" icon={Building2} title="Infrastruktur" subtitle={`${unlocked} Systeme`} onClick={() => navigate('/infrastructure')} />
        <NavCard icon={BriefcaseBusiness} title="Karriere" subtitle={`${state.incidentsResolved} Vorfälle`} onClick={() => navigate('/career')} />
        <NavCard icon={BookMarked} title="Runbooks" subtitle={`${state.runbooks?.length || 0} Einträge`} onClick={() => navigate('/runbooks')} />
        <NavCard tour="training" icon={BookOpen} title="Training" subtitle="Alle Lerninhalte" onClick={() => navigate('/training')} />
        <NavCard icon={Upload} title="Lehrgangsimport" subtitle="Inhalte einlesen" onClick={() => navigate('/import')} />
      </div>

      {state.completedQuests.length > 0 && <div className="cyber-card p-4"><div className="text-xs uppercase tracking-widest text-[#8b949e]">Einsatzchronik</div><div className="flex flex-col gap-2 mt-3">{state.completedQuests.slice(-3).reverse().map((id) => <div key={id} className="flex items-center gap-2 text-xs text-[#c9d1d9]"><span className="w-2 h-2 rounded-full bg-[#00ff66]" /> {id.replaceAll('-', ' ')}</div>)}</div></div>}
    </div>
  );
}

function NavCard({ icon: Icon, title, subtitle, onClick, tour }) {
  return <button data-tour={tour} onClick={onClick} className="cyber-card p-4 text-left"><Icon size={23} className="text-[#00f0ff]" /><div className="font-bold text-white text-sm mt-3">{title}</div><div className="text-[10px] text-[#8b949e] mt-1">{subtitle}</div></button>;
}
