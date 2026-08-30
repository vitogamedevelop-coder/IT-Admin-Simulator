import {
  getHostOctet, getRelevantOctet, calculateNetworkId, calculateBroadcast, calculateFirstHost, calculateLastHost,
  calculateUsableHosts, calculateTotalAddresses, calculateJumpSize, getSubnetBlockBounds,
} from '../src/lib/networking/ipv4Math.js';

let failures = 0;
function assert(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!condition) failures += 1;
}

const cases = [
  { ip: '10.25.140.18', prefix: 21, network: '10.25.136.0', broadcast: '10.25.143.255', first: '10.25.136.1', last: '10.25.143.254', usable: 2046, total: 2048, jump: 8, hostOctet: 2, boundaryOctet: 2, lower: 136, upper: 143 },
  { ip: '192.168.50.75', prefix: 26, network: '192.168.50.64', broadcast: '192.168.50.127', first: '192.168.50.65', last: '192.168.50.126', usable: 62, total: 64, jump: 64, hostOctet: 3, boundaryOctet: 3, lower: 64, upper: 127 },
  { ip: '10.0.0.5', prefix: 8, network: '10.0.0.0', broadcast: '10.255.255.255', first: '10.0.0.1', last: '10.255.255.254', usable: 16777214, total: 16777216, jump: 1, hostOctet: 1, boundaryOctet: 0, lower: 0, upper: 255 },
  { ip: '172.16.5.7', prefix: 16, network: '172.16.0.0', broadcast: '172.16.255.255', first: '172.16.0.1', last: '172.16.255.254', usable: 65534, total: 65536, jump: 1, hostOctet: 2, boundaryOctet: 1, lower: 0, upper: 255 },
  { ip: '192.168.1.10', prefix: 24, network: '192.168.1.0', broadcast: '192.168.1.255', first: '192.168.1.1', last: '192.168.1.254', usable: 254, total: 256, jump: 1, hostOctet: 3, boundaryOctet: 2, lower: 0, upper: 255 },
  { ip: '10.20.30.40', prefix: 17, network: '10.20.0.0', broadcast: '10.20.127.255', first: '10.20.0.1', last: '10.20.127.254', usable: 32766, total: 32768, jump: 128, hostOctet: 2, boundaryOctet: 2, lower: 0, upper: 127 },
  { ip: '10.20.30.40', prefix: 25, network: '10.20.30.0', broadcast: '10.20.30.127', first: '10.20.30.1', last: '10.20.30.126', usable: 126, total: 128, jump: 128, hostOctet: 3, boundaryOctet: 3, lower: 0, upper: 127 },
];

for (const c of cases) {
  const net = calculateNetworkId(c.ip, c.prefix);
  const bc = calculateBroadcast(c.ip, c.prefix);
  const first = calculateFirstHost(c.ip, c.prefix);
  const last = calculateLastHost(c.ip, c.prefix);
  const usable = calculateUsableHosts(c.prefix);
  const total = calculateTotalAddresses(c.prefix);
  const jump = calculateJumpSize(c.prefix);
  const bounds = getSubnetBlockBounds(c.ip, c.prefix);
  assert(`Netz-ID /${c.prefix} ${c.ip}`, net === c.network);
  assert(`Broadcast /${c.prefix} ${c.ip}`, bc === c.broadcast);
  assert(`Erster Host /${c.prefix} ${c.ip}`, first === c.first);
  assert(`Letzter Host /${c.prefix} ${c.ip}`, last === c.last);
  assert(`Nutzbare Hosts /${c.prefix} ${c.ip}`, usable === c.usable);
  assert(`Gesamtadressen /${c.prefix} ${c.ip}`, total === c.total);
  assert(`Sprungweite /${c.prefix} ${c.ip}`, jump === c.jump);
  assert(`Host-Oktett /${c.prefix} ${c.ip}`, getHostOctet(c.prefix) === c.hostOctet);
  assert(`Boundary-Oktett /${c.prefix} ${c.ip}`, getRelevantOctet(c.prefix) === c.boundaryOctet);
  assert(`BlockBounds lower /${c.prefix} ${c.ip}`, bounds.lower === c.lower, `got ${bounds.lower}`);
  assert(`BlockBounds upper /${c.prefix} ${c.ip}`, bounds.upper === c.upper, `got ${bounds.upper}`);
  assert(`BlockBounds relevant /${c.prefix} ${c.ip}`, bounds.relevantOctet === c.hostOctet);
}

assert('/32 boundary exists and hostOctet is 3', getHostOctet(32) === 3);
assert('/0 hostOctet is 0', getHostOctet(0) === 0);

console.log('');
if (failures === 0) {
  console.log('Subnetting relevant-octet regression test passed.');
  process.exit(0);
}
console.log(`${failures} failures.`);
process.exit(1);
