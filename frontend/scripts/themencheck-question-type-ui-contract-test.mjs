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

const { generateThemencheck } = await import('../src/lib/academyThemencheck.js');

const categories = ['fundamentals', 'cisco-packet-tracer', 'information-security', 'linux-virtualbox', 'active-directory-virtualbox'];

let exit = 0;
let failures = 0;

function fail(msg) {
  console.log(`[FAIL] ${msg}`);
  failures++;
  exit = 1;
}

function pass(msg) {
  console.log(`[PASS] ${msg}`);
}

console.log('=== Themencheck Question Type UI Contract Test ===');

for (const categoryId of categories) {
  const counts = { 'single-select': 0, 'multi-select': 0, diagnostic: 0 };
  for (let run = 0; run < 20; run++) {
    const q = generateThemencheck(categoryId);
    for (const qu of q) {
      const type = qu.type === 'multi-select' ? 'multi-select' : qu.isDiagnostic ? 'diagnostic' : 'single-select';
      counts[type]++;
      if (qu.type === 'multi-select') {
        if (!Array.isArray(qu.correctIndices) || qu.correctIndices.length < 2) {
          fail(`${qu.semanticKey}: multi-select needs correctIndices array with >=2 entries`);
        }
      } else if (typeof qu.correct !== 'number') {
        fail(`${qu.semanticKey}: single-select needs numeric correct index`);
      }
    }
  }
  const total = counts['single-select'] + counts['multi-select'] + counts.diagnostic;
  if (total === 0) {
    console.log(`  [INFO] ${categoryId}: no questions generated (topic pool empty)`);
    continue;
  } else {
    const multiPct = (counts['multi-select'] / total) * 100;
    console.log(`  ${categoryId}: ${counts['single-select']} single, ${counts['multi-select']} multi, ${counts.diagnostic} diagnostic, multi ${multiPct.toFixed(1)}%`);
    if (counts['multi-select'] === 0 && ['cisco-packet-tracer', 'active-directory-virtualbox', 'information-security'].includes(categoryId)) {
      fail(`${categoryId}: expected some multi-select questions`);
    }
  }
}

if (failures === 0) {
  pass('Question type distribution and shape look healthy');
}

if (exit) {
  console.log('\n=== UI Contract Test FAILED ===');
  process.exit(1);
}
console.log('\n=== UI Contract Test passed ===');
