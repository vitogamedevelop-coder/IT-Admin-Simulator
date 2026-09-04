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
const { topicsForCategory } = await import('../src/lib/academyTopics.js');

const scenarios = getDiagnosticScenariosForCategory('cisco-packet-tracer');
const topics = topicsForCategory('cisco-packet-tracer');

const byTopic = new Map();
for (const s of scenarios) byTopic.set(s.sourceTopicId, (byTopic.get(s.sourceTopicId) || 0) + 1);

const covered = topics.filter((t) => byTopic.has(t.topicId));
const expected = [
  'router-basics', 'static-routing', 'inter-vlan-routing', 'dhcp', 'vlan', 'trunk',
  'acl', 'stp', 'nat',
];

let exit = 0;
console.log('=== Cisco Troubleshooting Coverage Audit ===');
console.log(`Covered ${covered.length}/${topics.length} topics, ${scenarios.length} scenarios total.`);

for (const id of expected) {
  const count = byTopic.get(id) || 0;
  if (count >= 1) {
    console.log(`[PASS] ${id}: ${count} scenario(s)`);
  } else {
    console.log(`[WARN] ${id}: no diagnostic scenario yet`);
  }
}

if (scenarios.length < 8) {
  console.log(`[FAIL] Too few Cisco diagnostic scenarios (found ${scenarios.length}, expected >= 8)`);
  exit = 1;
} else {
  console.log(`[PASS] At least 8 Cisco diagnostic scenarios (found ${scenarios.length})`);
}

if (exit) process.exit(1);
console.log('\n=== Cisco Troubleshooting Coverage Audit passed ===');
