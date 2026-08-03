import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Building2, CheckCircle, Lock, Server, TriangleAlert, Wrench } from 'lucide-react';
import { gameSummary } from '../lib/gameState';
import { companyStage } from '../lib/officeWorld';
import { companyAsset } from '../lib/rpgAssets';
import { questPath } from '../lib/questRouter';
import BackBar from '../components/BackBar';
import { useAppBack } from '../lib/useAppBack';

const icons = { clients: Building2, network: Activity, domain: Server, fileserver: Server, linux: Server, backup: Server, soc: Activity };
const status = {
  online: { label: 'online', color: 'text-[#00ff66]', Icon: CheckCircle },
  warning: { label: 'prüfen – antippen', color: 'text-[#ffcc00]', Icon: TriangleAlert },
  locked: { label: 'noch nicht erschlossen', color: 'text-[#8b949e]', Icon: Lock },
};

export default function Infrastructure() {
  const navigate = useNavigate();
  useAppBack();
  const [message, setMessage] = useState('');
  const { state } = gameSummary();
  const stage = companyStage(state.completedQuests.length);

  function inspect(key, item) {
    if (!item.unlocked) {
      setMessage(`${item.name} wird durch spätere Hauptmissionen freigeschaltet.`);
      return;
    }
    if (item.status !== 'warning') {
      setMessage(`${item.name}: Alle bekannten Prüfungen sind aktuell ohne Befund.`);
      return;
    }
    if (key === 'domain') {
      navigate(state.completedQuests.includes('first-day') ? questPath('dns-outage') : questPath('first-day'));
      return;
    }
    navigate('/inbox');
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <BackBar label="Arbeitsplatz" />
      <div className="cyber-card overflow-hidden">
        <img src={companyAsset(stage.id)} alt={`Firmenstufe ${stage.id}`} className="h-36 w-full object-cover" />
        <div className="p-4">
          <div className="flex items-center gap-2 text-[#00f0ff]"><Building2 size={20} /><h2 className="font-bold">{state.company}</h2></div>
          <div className="text-sm text-[#00ff66] mt-2">Ausbaustufe {stage.id}: {stage.title}</div>
          <p className="text-xs text-[#8b949e] mt-1">{stage.description}</p>
        </div>
      </div>
      {message && <div className="cyber-card p-3 text-sm text-[#c9d1d9] border-l-4 border-[#00f0ff]">{message}</div>}
      <div className="grid grid-cols-1 gap-3">{Object.entries(state.infrastructure).map(([key, item]) => {
        const Icon = icons[key] || Server;
        const meta = status[item.unlocked ? item.status : 'locked'];
        const StatusIcon = meta.Icon;
        return <button key={key} onClick={() => inspect(key, item)} className={`cyber-card p-4 text-left ${!item.unlocked ? 'opacity-60' : ''} ${item.status === 'warning' ? 'border-[#ffcc00]' : ''}`}><div className="flex items-center gap-3"><div className="p-2 rounded border border-[#1f2937]"><Icon size={22} className={item.unlocked ? 'text-[#00f0ff]' : 'text-[#8b949e]'} /></div><div className="flex-1"><div className="font-bold text-white">{item.name}</div><div className={`text-xs flex items-center gap-1 mt-1 ${meta.color}`}><StatusIcon size={12} /> {meta.label}</div></div></div></button>;
      })}</div>
      <div className="cyber-card p-4"><div className="flex items-center gap-2 text-[#ffcc00] font-bold text-sm"><Wrench size={17} /> Werkzeugkoffer</div><div className="flex flex-wrap gap-2 mt-3">{state.tools.map((tool) => <span key={tool} className="px-2 py-1 rounded border border-[#30363d] text-xs text-[#c9d1d9]">{tool}</span>)}</div></div>
    </div>
  );
}
