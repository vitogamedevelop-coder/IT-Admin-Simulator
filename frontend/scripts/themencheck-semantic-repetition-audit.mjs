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

import { generateThemencheck, saveThemencheckResult } from '../src/lib/academyThemencheck.js';

const categories = ['fundamentals', 'cisco-packet-tracer', 'active-directory-virtualbox', 'information-security', 'linux-virtualbox'];
const RUNS = 10;

let exit = 0;
function fail(msg) { console.log(`[FAIL] ${msg}`); exit = 1; }
function pass(msg) { console.log(`[PASS] ${msg}`); }

console.log('=== Themencheck Semantic Repetition Audit ===');

for (const cat of categories) {
  const seenKeys = new Set();
  const keyOccurrences = {};
  let zeroSemanticKey = 0;
  for (let i = 0; i < RUNS; i++) {
    const qs = generateThemencheck(cat);
    for (const q of qs) {
      const key = q.semanticKey;
      if (!key) {
        zeroSemanticKey++;
        continue;
      }
      seenKeys.add(key);
      keyOccurrences[key] = (keyOccurrences[key] || 0) + 1;
    }
  }

  const duplicateWithinRun = Object.entries(keyOccurrences).filter(([, v]) => v > RUNS);
  console.log(`\n--- ${cat} ---`);
  console.log(`  unique semantic keys across ${RUNS} runs: ${seenKeys.size}`);
  console.log(`  questions without semanticKey: ${zeroSemanticKey}`);
  console.log(`  keys seen more than ${RUNS} times (same run duplicates): ${duplicateWithinRun.length}`);

  if (zeroSemanticKey > 0) fail(`${cat}: ${zeroSemanticKey} questions lack a semanticKey`);
  if (duplicateWithinRun.length > 0) fail(`${cat}: ${duplicateWithinRun.length} semantic keys repeated within the same run`);
}

// Cross-run history sanity: a result save updates existing entries (no duplicate within the same run).
const cat = 'cisco-packet-tracer';
const qs = generateThemencheck(cat);
const result = {
  questions: qs,
  answers: qs.map((q) => ({ selectedIndex: 0, correct: true, sourceTopicId: q.sourceTopicId, questionText: q.question })),
  startedAt: Date.now() - 1000,
  finishedAt: Date.now(),
};
saveThemencheckResult(cat, result);
const historyRaw = globalThis.localStorage.getItem('cyberlearn:themencheck-history-v1');
const history = historyRaw ? JSON.parse(historyRaw) : [];
const catHistory = history.filter((h) => h.categoryId === cat);
const byRun = new Map();
for (const h of catHistory) {
  const run = h.runIndex ?? 'saved';
  const key = `${run}::${h.semanticKey}`;
  byRun.set(key, (byRun.get(key) || 0) + 1);
}
const duplicateInRun = [...byRun.entries()].filter(([, v]) => v > 1);
console.log(`\n--- history sanity (${cat}) ---`);
console.log(`  history entries: ${catHistory.length}, distinct run/key pairs: ${byRun.size}`);
if (duplicateInRun.length > 0) {
  fail('history contains duplicate semanticKey entries within the same run');
} else {
  pass('history separates questions by runIndex and does not duplicate within a run');
}

// A shuffled drag-drop question must keep the same semanticKey and not be treated as a new question.
const dragQs = qs.filter((q) => q.type === 'drag-drop');
if (dragQs.length > 0) {
  const dragKey = dragQs[0].semanticKey;
  const secondRun = generateThemencheck(cat);
  const dragMatch = secondRun.filter((q) => q.type === 'drag-drop' && q.semanticKey === dragKey);
  console.log(`  drag-drop sample key ${dragKey ? 'present' : 'missing'} across runs`);
  if (dragMatch.length === 0) {
    fail('same drag-drop question lost its semanticKey across runs');
  } else {
    pass('drag-drop semanticKey stable across runs');
  }
}

if (exit) {
  console.log('\n=== Semantic Repetition Audit FAILED ===');
  process.exit(1);
}
console.log('\n=== Semantic Repetition Audit passed ===');
