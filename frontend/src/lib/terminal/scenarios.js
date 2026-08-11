// Terminal scenarios for mission-driven terminal sessions.
// Phase 0 reset: legacy demo scenarios have been removed.

export const defaultScenario = {
  hostname: 'PC-00-DEFAULT',
  adapters: [
    { name: 'Ethernet-Adapter', mac: '00-00-00-00-00-00', ipv4: '127.0.0.1', mask: '255.0.0.0', gateway: '127.0.0.1', dhcp: 'Nein', dns: ['127.0.0.1'] },
  ],
  reachability: { '127.0.0.1': true },
  dnsRecords: {},
};

export const defaultMissionScenarios = {};

export function getScenario(missionId) {
  return defaultMissionScenarios[missionId] || defaultScenario;
}
