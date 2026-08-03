export const employees = [
  { id: 'greta', name: 'Greta Müller', department: 'Buchhaltung', pc: 'PC-BUCH-01', phone: '221', notes: 'Arbeitet oft mit dem Buchhaltungsserver.' },
  { id: 'tom', name: 'Tom Schmid', department: 'Vertrieb', pc: 'PC-VER-12', phone: '312', notes: 'Nutzt oft das CRM und den Fileserver.' },
  { id: 'lisa', name: 'Lisa Weber', department: 'Einkauf', pc: 'PC-EIN-05', phone: '145', notes: 'Hat häufig Probleme mit dem Drucker.' },
  { id: 'marc', name: 'Marc Hoffmann', department: 'Entwicklung', pc: 'PC-DEV-03', phone: '402', notes: 'Braucht Zugriff auf den Linux-Webserver.' },
  { id: 'sabine', name: 'Sabine Krause', department: 'Personal', pc: 'PC-HR-02', phone: '101', notes: 'Kümmert sich um neue Mitarbeiteraccounts.' },
];

export const workstations = [
  { id: 'PC-BUCH-01', name: 'PC-BUCH-01', user: 'Greta Müller', ip: '192.168.10.47', mac: 'A4-B1-C2-D3-E4-F5', gateway: '192.168.10.1', dns: ['192.168.10.10'], os: 'Windows 11', status: 'online' },
  { id: 'PC-VER-12', name: 'PC-VER-12', user: 'Tom Schmid', ip: '192.168.10.25', mac: 'B2-C3-D4-E5-F6-A7', gateway: '192.168.10.1', dns: ['192.168.10.10'], os: 'Windows 11', status: 'online' },
  { id: 'PC-EIN-05', name: 'PC-EIN-05', user: 'Lisa Weber', ip: '192.168.10.52', mac: 'C4-D5-E6-F7-A8-B9', gateway: '192.168.10.1', dns: ['192.168.10.10'], os: 'Windows 10', status: 'online' },
  { id: 'PC-DEV-03', name: 'PC-DEV-03', user: 'Marc Hoffmann', ip: '192.168.10.33', mac: 'D6-E7-F8-A9-B0-C1', gateway: '192.168.10.1', dns: ['192.168.10.10'], os: 'Linux Mint', status: 'online' },
  { id: 'PC-HR-02', name: 'PC-HR-02', user: 'Sabine Krause', ip: '192.168.10.12', mac: 'E8-F9-A0-B1-C2-D3', gateway: '192.168.10.1', dns: ['192.168.10.10'], os: 'Windows 11', status: 'online' },
];

export const servers = [
  { id: 'FS01', name: 'FS01 (Fileserver)', fqdn: 'fs01.nexus.local', ip: '192.168.10.10', role: 'Dateifreigaben, DNS, DHCP', status: 'online' },
  { id: 'DC01', name: 'DC01 (Domain Controller)', fqdn: 'dc01.nexus.local', ip: '192.168.10.5', role: 'Active Directory, Authentifizierung', status: 'warning' },
  { id: 'WEB01', name: 'WEB01 (Webserver)', fqdn: 'web01.nexus.local', ip: '192.168.10.20', role: 'Interne Webanwendungen', status: 'locked' },
];

export const networkDevices = [
  { id: 'router', name: 'Router (Gateway)', ip: '192.168.10.1', role: 'Internet-Router, Standardgateway', status: 'online' },
  { id: 'switch-core', name: 'Core-Switch', ip: '192.168.10.2', role: 'Zentrale Verteilung', status: 'online' },
];

export function findWorkstation(query) {
  const lower = query.toLowerCase();
  return workstations.find((w) => w.id.toLowerCase() === lower || w.user.toLowerCase().includes(lower) || w.ip === query);
}

export function findEmployee(query) {
  const lower = query.toLowerCase();
  return employees.find((e) => e.id.toLowerCase() === lower || e.name.toLowerCase().includes(lower));
}
