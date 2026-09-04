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

const { getDiagnosticScenariosForCategory } = await import('../src/lib/diagnosticScenarios.js');

const scenarios = getDiagnosticScenariosForCategory('information-security');

let exit = 0;
console.log('=== InfoSec Scenario Question Quality Audit ===');
console.log(`${scenarios.length} InfoSec scenario questions total.`);

for (const s of scenarios) {
  const text = (s.question || '').toLowerCase();
  const hasNoCli = !/interface|vlan|show ip|switchport|enable secret|ip route/.test(text);
  const hasPrinciple = /least privilege|verfügbarkeit|vertraulichkeit|integrität|vulnerability|threat|control|risk|cia/.test(text);
  if (hasNoCli && hasPrinciple) {
    console.log(`[PASS] ${s.semanticKey}: scenario-based, no fake CLI`);
  } else {
    console.log(`[WARN] ${s.semanticKey}: may contain technical/CLI distractors`);
    if (!hasNoCli) exit = 1;
  }
}

if (scenarios.length < 4) {
  console.log(`[FAIL] Too few InfoSec scenarios (found ${scenarios.length}, expected >= 4)`);
  exit = 1;
} else {
  console.log(`[PASS] At least 4 InfoSec scenarios (found ${scenarios.length})`);
}

if (exit) process.exit(1);
console.log('\n=== InfoSec Scenario Question Quality Audit passed ===');
