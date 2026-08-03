export const defaultMissionScenarios = {
  'first-day': {
    hostname: 'PC-12-BUERO',
    adapters: [
      { name: 'Ethernet-Adapter Büro', mac: 'A4-B1-C2-D3-E4-F5', ipv4: '169.254.31.8', mask: '255.255.0.0', gateway: null, dhcp: 'Ja', dns: [] },
    ],
    reachability: { '192.168.10.1': false, '8.8.8.8': false, '127.0.0.1': true },
    dnsRecords: {},
  },
  'dns-outage': {
    hostname: 'PC-07-VERTRIEB',
    adapters: [
      { name: 'Ethernet-Adapter Vertrieb', mac: 'B2-C3-D4-E5-F6-A7', ipv4: '192.168.10.25', mask: '255.255.255.0', gateway: '192.168.10.1', dhcp: 'Ja', dns: ['192.168.10.10'] },
    ],
    reachability: { '192.168.10.25': true, '192.168.10.45': true, '8.8.8.8': true, 'fs01.nexus.local': true },
    dnsRecords: { 'fs01.nexus.local': '192.168.10.25' },
  },
};

export function getScenario(missionId) {
  return defaultMissionScenarios[missionId] || defaultMissionScenarios['first-day'];
}
