import { Activity, Cable, CheckCircle, CircleOff, Network, Router, Save, Server, ShieldCheck, Wifi } from 'lucide-react';

function shortInterface(name = '') {
  return name
    .replace(/^GigabitEthernet/i, 'Gi')
    .replace(/^FastEthernet/i, 'Fa')
    .replace(/^TenGigabitEthernet/i, 'Te')
    .replace(/^Loopback/i, 'Lo');
}

function interfaceRole(interfaceId, parameters = {}) {
  if ((parameters.personalPorts || []).includes(interfaceId)) return 'Personal';
  if ((parameters.buchhaltungPorts || []).includes(interfaceId)) return 'Buchhaltung';
  if ((parameters.unusedPorts || []).includes(interfaceId)) return 'Unbelegt';
  if (parameters.uplinkPort === interfaceId) return 'Uplink';
  if (parameters.routerPhysicalPort === interfaceId) return 'Router-Link';
  for (const vlan of parameters.vlans || []) {
    if ((vlan.accessPorts || []).includes(interfaceId)) return vlan.name || `VLAN ${vlan.id}`;
  }
  if (interfaceId.includes('.')) return `Subinterface ${interfaceId.split('.').pop()}`;
  return 'Schnittstelle';
}

function interfaceState(iface) {
  if (iface.errDisabled) return { label: 'ERR-DISABLED', tone: 'text-[#ff3355] border-[#ff3355]/40 bg-[#ff3355]/10', dot: 'bg-[#ff3355]' };
  if (iface.administrativelyDown) return { label: 'ADMIN DOWN', tone: 'text-[#ffcc00] border-[#ffcc00]/35 bg-[#ffcc00]/5', dot: 'bg-[#ffcc00]' };
  if (iface.operationalStatus === 'connected' || iface.operationalStatus === 'up' || iface.type === 'subinterface') return { label: 'UP', tone: 'text-[#00ff66] border-[#00ff66]/35 bg-[#00ff66]/5', dot: 'bg-[#00ff66]' };
  return { label: 'NO LINK', tone: 'text-[#8b949e] border-[#30363d] bg-[#0d1117]', dot: 'bg-[#8b949e]' };
}

function meaningfulInterfaces(interfaces, parameters) {
  const referenced = new Set([
    ...(parameters.personalPorts || []),
    ...(parameters.buchhaltungPorts || []),
    ...(parameters.unusedPorts || []),
    parameters.uplinkPort,
    parameters.routerPhysicalPort,
    ...(parameters.vlans || []).flatMap((vlan) => vlan.accessPorts || []),
  ].filter(Boolean));
  const values = Object.values(interfaces || {});
  const meaningful = values.filter((iface) => referenced.has(iface.id)
    || iface.type === 'subinterface'
    || iface.errDisabled
    || iface.switchportMode
    || iface.accessVlan
    || iface.ipv4
    || iface.operationalStatus === 'connected');
  return (meaningful.length ? meaningful : values).slice(0, 14);
}

function deviceLabel(type) {
  if (type === 'router') return 'Cisco Router';
  if (type === 'layer3_switch') return 'Cisco L3-Switch';
  if (type === 'router_on_a_stick') return 'Switch + Router';
  return 'Cisco L2-Switch';
}

export default function CiscoNetworkStatePanel({ device, scenario, compact = false }) {
  if (!device?.runningConfig) return null;
  const config = device.runningConfig;
  const parameters = scenario?.parameters || {};
  const interfaces = meaningfulInterfaces(config.interfaces, parameters);
  const vlans = Object.values(config.vlans || {}).sort((a, b) => a.id - b.id);
  const upCount = Object.values(config.interfaces || {}).filter((iface) => !iface.administrativelyDown && (iface.operationalStatus === 'connected' || iface.operationalStatus === 'up' || iface.type === 'subinterface')).length;
  const faultCount = Object.values(config.interfaces || {}).filter((iface) => iface.errDisabled).length;
  const sshActive = Boolean(config.cryptoKey?.exists && config.ipSshVersion === 2 && config.lines?.vty?.loginLocal && config.lines?.vty?.transportInput === 'ssh');
  const showSsh = scenario?.missionId === 'cisco-main-003' || Boolean(config.ipDomainName || config.cryptoKey?.exists || config.ipSshVersion);

  return (
    <section className={`rounded-xl border border-[#00f0ff]/25 bg-[#07111d]/90 ${compact ? 'p-3' : 'p-4'}`} aria-label="Live-Netzwerkzustand">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Network size={16} className="text-[#00f0ff]" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#00f0ff]">Live-System</div>
            <div className="text-[9px] text-[#8b949e]">Beobachteter Zustand · keine Musterlösung</div>
          </div>
        </div>
        <div className={`h-2.5 w-2.5 rounded-full ${faultCount ? 'bg-[#ff3355]' : 'bg-[#00ff66]'} shadow-[0_0_8px_currentColor]`} />
      </div>

      <div className="mt-3 rounded-lg border border-[#00f0ff]/25 bg-[#0a1628] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10">
            {device.type === 'router' ? <Router size={21} className="text-[#00f0ff]" /> : <Server size={21} className="text-[#00f0ff]" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold text-white">{device.hostname}</div>
            <div className="text-[10px] text-[#8b949e]">{deviceLabel(device.type)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[#00ff66]">{upCount}</div>
            <div className="text-[9px] uppercase text-[#8b949e]">Links up</div>
          </div>
        </div>
      </div>

      <div className={`mt-3 grid gap-2 text-[10px] ${showSsh ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="rounded border border-[#30363d] bg-[#0d1117]/80 p-2">
          <div className="flex items-center gap-1.5 text-[#8b949e]"><Save size={12} /> Startup-Config</div>
          <div className={`mt-1 font-bold ${device.startupConfig ? 'text-[#00ff66]' : 'text-[#ffcc00]'}`}>{device.startupConfig ? 'GESPEICHERT' : 'NICHT GESPEICHERT'}</div>
        </div>
        {showSsh && <div className="rounded border border-[#30363d] bg-[#0d1117]/80 p-2">
          <div className="flex items-center gap-1.5 text-[#8b949e]"><ShieldCheck size={12} /> SSH</div>
          <div className={`mt-1 font-bold ${sshActive ? 'text-[#00ff66]' : 'text-[#8b949e]'}`}>{sshActive ? 'BEREIT' : 'NICHT BEREIT'}</div>
        </div>}
      </div>

      {vlans.length > 1 && (
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8b949e]"><Wifi size={12} /> Aktuelle VLAN-Datenbank</div>
          <div className="flex flex-wrap gap-1.5">
            {vlans.map((vlan) => <span key={vlan.id} className="rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-[10px] text-[#c9d1d9]"><strong className="text-[#00f0ff]">{vlan.id}</strong> {vlan.name}</span>)}
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8b949e]"><span className="flex items-center gap-1.5"><Cable size={12} /> Sichtbare Schnittstellen</span><span>{interfaces.length}</span></div>
        <div className={`grid gap-1.5 ${compact ? 'sm:grid-cols-2' : ''}`}>
          {interfaces.map((iface) => {
            const state = interfaceState(iface);
            return (
              <div key={iface.id} className={`rounded border p-2 ${state.tone}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 font-bold"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${state.dot}`} /><span className="truncate">{shortInterface(iface.name)}</span></span>
                  <span className="shrink-0 text-[8px] font-bold">{state.label}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-[#8b949e]">
                  <span>{interfaceRole(iface.id, parameters)}</span>
                  {iface.switchportMode && <span>{iface.switchportMode.toUpperCase()}</span>}
                  {iface.accessVlan && <span>VLAN {iface.accessVlan}</span>}
                  {iface.trunkAllowedVlans?.length > 0 && <span>VLANs {iface.trunkAllowedVlans.join(', ')}</span>}
                  {iface.encapsulationVlan && <span>802.1Q {iface.encapsulationVlan}</span>}
                  {iface.ipv4 && <span>{iface.ipv4}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {config.ipDefaultGateway && <div className="mt-3 flex items-center gap-2 rounded border border-[#30363d] bg-[#0d1117]/80 p-2 text-[10px]"><Activity size={12} className="text-[#00f0ff]" /><span className="text-[#8b949e]">Default Gateway</span><strong className="ml-auto text-[#c9d1d9]">{config.ipDefaultGateway}</strong></div>}
      {faultCount > 0 && <div className="mt-3 flex items-center gap-2 rounded border border-[#ff3355]/35 bg-[#ff3355]/10 p-2 text-[10px] text-[#ff8899]"><CircleOff size={13} /> {faultCount} Schnittstelle{faultCount === 1 ? '' : 'n'} im Fehlerzustand</div>}
      {!faultCount && upCount > 0 && <div className="mt-3 flex items-center gap-2 text-[10px] text-[#00ff66]"><CheckCircle size={12} /> Zustandsänderungen werden direkt aus der Simulation gelesen.</div>}
    </section>
  );
}
