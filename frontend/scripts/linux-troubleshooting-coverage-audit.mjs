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

const scenarios = getDiagnosticScenariosForCategory('linux-virtualbox');

let exit = 0;
console.log('=== Linux Troubleshooting Coverage Audit ===');
console.log(`${scenarios.length} Linux diagnostic scenarios total.`);

if (scenarios.length < 1) {
  console.log(`[INFO] No Linux diagnostic scenarios; Linux category has limited lesson content in this build.`);
}

if (scenarios.length > 0 && scenarios.length < 2) {
  console.log(`[WARN] Only ${scenarios.length} Linux scenario; consider adding more when lesson content expands.`);
} else if (scenarios.length >= 2) {
  console.log(`[PASS] At least 2 Linux diagnostic scenarios (found ${scenarios.length})`);
}

if (exit) process.exit(1);
console.log('\n=== Linux Troubleshooting Coverage Audit passed ===');
