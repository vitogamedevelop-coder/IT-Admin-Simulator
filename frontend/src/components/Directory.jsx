import { useMemo, useState } from 'react';
import { Search, Users, Monitor, Server, Network } from 'lucide-react';
import { employees, workstations, servers, networkDevices } from '../lib/directory';

export default function Directory({ onClose }) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('employees');

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    switch (tab) {
      case 'employees': return employees.filter((e) => e.name.toLowerCase().includes(lower) || e.department.toLowerCase().includes(lower));
      case 'workstations': return workstations.filter((w) => w.name.toLowerCase().includes(lower) || w.user.toLowerCase().includes(lower) || w.ip.includes(query));
      case 'servers': return servers.filter((s) => s.name.toLowerCase().includes(lower) || s.role.toLowerCase().includes(lower));
      case 'network': return networkDevices.filter((n) => n.name.toLowerCase().includes(lower) || n.role.toLowerCase().includes(lower));
      default: return [];
    }
  }, [query, tab]);

  return (
    <div className="flex flex-col h-full">
      {onClose && (
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onClose} className="p-2 rounded border border-[#30363d] text-[#8b949e]">←</button>
          <h2 className="font-bold text-[#00f0ff]">Verzeichnis</h2>
        </div>
      )}
      <div className="cyber-card p-2 mb-2 flex items-center gap-2">
        <Search size={16} className="text-[#8b949e]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Suche Name, PC, IP..." className="bg-transparent text-sm w-full outline-none text-white" />
      </div>
      <div className="grid grid-cols-4 gap-1 mb-2">
        <TabButton active={tab === 'employees'} onClick={() => setTab('employees')} icon={Users} label="Mitarbeiter" />
        <TabButton active={tab === 'workstations'} onClick={() => setTab('workstations')} icon={Monitor} label="PCs" />
        <TabButton active={tab === 'servers'} onClick={() => setTab('servers')} icon={Server} label="Server" />
        <TabButton active={tab === 'network'} onClick={() => setTab('network')} icon={Network} label="Netzwerk" />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
        {filtered.map((item) => (
          <div key={item.id} className="cyber-card p-3 text-sm">
            <div className="font-bold text-white">{item.name}</div>
            {'department' in item && <div className="text-[#8b949e] text-xs mt-1">Abteilung: {item.department}</div>}
            {'pc' in item && <div className="text-[#8b949e] text-xs mt-1">PC: {item.pc} · Telefon: {item.phone}</div>}
            {'user' in item && <div className="text-[#8b949e] text-xs mt-1">Nutzer: {item.user}</div>}
            {'ip' in item && <div className="text-[#00f0ff] text-xs mt-1">IP: {item.ip}</div>}
            {'mac' in item && <div className="text-[#8b949e] text-xs mt-1">MAC: {item.mac}</div>}
            {'gateway' in item && <div className="text-[#8b949e] text-xs mt-1">Gateway: {item.gateway}</div>}
            {'dns' in item && <div className="text-[#8b949e] text-xs mt-1">DNS: {item.dns.join(', ')}</div>}
            {'role' in item && 'fqdn' in item && <div className="text-[#8b949e] text-xs mt-1">{item.role} · {item.fqdn}</div>}
            {'notes' in item && item.notes && <div className="text-[#c9d1d9] text-xs mt-2 italic">„{item.notes}“</div>}
          </div>
        ))}
        {filtered.length === 0 && <div className="text-xs text-[#8b949e]">Kein Eintrag gefunden.</div>}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`p-2 rounded text-[10px] flex flex-col items-center gap-1 ${active ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]' : 'border border-[#30363d] text-[#8b949e]'}`}>
      <Icon size={16} />
      {label}
    </button>
  );
}
