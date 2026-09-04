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

const scenarios = getDiagnosticScenariosForCategory('active-directory-virtualbox');

const expected = [
  'ad-foundation', 'ad-groups', 'ntfs-permissions', 'ad-replication-sites',
  'ad-replication-practice', 'ad-group-policy-basics',
];

const byTopic = new Map();
for (const s of scenarios) byTopic.set(s.sourceTopicId, (byTopic.get(s.sourceTopicId) || 0) + 1);

let exit = 0;
console.log('=== Active Directory Troubleshooting Coverage Audit ===');
console.log(`${scenarios.length} AD diagnostic scenarios total.`);

for (const id of expected) {
  const count = byTopic.get(id) || 0;
  if (count >= 1) {
    console.log(`[PASS] ${id}: ${count} scenario(s)`);
  } else {
    console.log(`[WARN] ${id}: no diagnostic scenario yet`);
  }
}

if (scenarios.length < 5) {
  console.log(`[FAIL] Too few AD diagnostic scenarios (found ${scenarios.length}, expected >= 5)`);
  exit = 1;
} else {
  console.log(`[PASS] At least 5 AD diagnostic scenarios (found ${scenarios.length})`);
}

if (exit) process.exit(1);
console.log('\n=== Active Directory Troubleshooting Coverage Audit passed ===');
