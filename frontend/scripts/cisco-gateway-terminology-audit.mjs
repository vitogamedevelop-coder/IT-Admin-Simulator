

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  get length() { return store.size; },
  key: (i) => Array.from(store.keys())[i] ?? null,
};
globalThis.window = { dispatchEvent: () => {} };
globalThis.Event = class { constructor(t) { this.type = t; } };

const { LESSONS } = await import('../src/lib/academyLessonData.js');

const PROBLEMATIC = /\bmit\s+Gateway\b/gi;
const GATEWAY_IP = /\bGateway\s+(?:\d+\.\d+\.\d+\.\d+|\d+\/\d+|IP\b)/gi;
const GATEWAY_ADRESSE = /\bGateway-[a-zA-Z]+\b/gi;

function isSvg(value) {
  return typeof value === 'string' && value.trimStart().startsWith('<svg');
}

function collectStrings(obj, path, acc = []) {
  if (obj === null || obj === undefined) return acc;
  if (typeof obj === 'string') {
    if (isSvg(obj)) return acc;
    acc.push({ path, value: obj });
    return acc;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectStrings(item, `${path}[${i}]`, acc));
    return acc;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'id' || (k === 'explanation' && typeof v === 'object')) { continue; }
      collectStrings(v, `${path}.${k}`, acc);
    }
    return acc;
  }
  return acc;
}

function findIssues(text, context) {
  const issues = [];
  if (PROBLEMATIC.test(text)) issues.push(`"mit Gateway" at ${context}`);
  if (GATEWAY_IP.test(text)) issues.push(`"Gateway <IP>" at ${context}`);
  if (GATEWAY_ADRESSE.test(text)) issues.push(`"Gateway-..." term at ${context}`);
  return issues;
}

const allowList = [
  'Default Gateway',
  'Default-Gateway',
  'Default-Gateway-IP',
  'ip default-gateway',
  'Default-Gateway-Adresse',
  'Gateway-Interface',
];

function allowed(text) {
  return allowList.some((term) => text.toLowerCase().includes(term.toLowerCase()));
}

console.log('=== Cisco Gateway Terminology Audit ===');
let issues = [];
for (const [key, lesson] of Object.entries(LESSONS)) {
  if (!key.startsWith('cisco-packet-tracer/')) continue;
  const strings = collectStrings(lesson, key);
  for (const { path, value } of strings) {
    if (allowed(value)) continue;
    const found = findIssues(value, path);
    if (found.length) {
      issues = issues.concat(found);
      console.log(`[FLAG] ${path}:`);
      console.log(`       "${value.length > 160 ? value.slice(0, 160) + '...' : value}"`);
    }
  }
}

if (issues.length > 0) {
  console.log(`\nFound ${issues.length} terminology issues.`);
  process.exit(1);
}
console.log('No problematic "Gateway" terminology found in Cisco exercises/prompts.');
console.log('=== Cisco Gateway Terminology Audit passed ===');








