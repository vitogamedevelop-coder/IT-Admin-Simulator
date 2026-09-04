import { generateThemencheck, questionTypeGroup } from '../src/lib/academyThemencheck.js';

const categories = ['fundamentals', 'cisco-packet-tracer', 'active-directory-virtualbox', 'information-security', 'linux-virtualbox'];
const RUNS = 30;

let exit = 0;
function fail(msg) { console.log(`[FAIL] ${msg}`); exit = 1; }
function pass(msg) { console.log(`[PASS] ${msg}`); }
function warn(msg) { console.log(`[WARN] ${msg}`); }

console.log('=== Themencheck Question Type Mix Audit ===');

for (const cat of categories) {
  const totals = {};
  let totalQs = 0;
  for (let i = 0; i < RUNS; i++) {
    const qs = generateThemencheck(cat);
    if (!qs.length) continue;
    totalQs += qs.length;
    for (const q of qs) {
      const t = questionTypeGroup(q);
      totals[t] = (totals[t] || 0) + 1;
    }
  }
  if (totalQs === 0) {
    console.log(`[INFO] ${cat}: no questions`);
    continue;
  }
  const pct = Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, (v / totalQs * 100).toFixed(1) + '%']));
  console.log(`\n--- ${cat} ---`);
  console.log(`  total ${totalQs} questions over ${RUNS} runs`);
  console.log(`  ${JSON.stringify(pct)}`);

  const distinct = Object.keys(totals).filter((k) => totals[k] > 0).length;
  if (cat === 'cisco-packet-tracer' || cat === 'active-directory-virtualbox' || cat === 'information-security') {
    if (!totals['single-select'] || totals['single-select'] === 0) warn(`${cat}: no single-select questions`);
    if (!totals['multi-select'] || totals['multi-select'] === 0) warn(`${cat}: no multi-select`);
    if (!totals['drag-drop'] || totals['drag-drop'] === 0) warn(`${cat}: no drag-drop`);
    if (!totals['diagnostic'] || totals['diagnostic'] === 0) warn(`${cat}: no diagnostic`);
    if (distinct >= 3) pass(`${cat}: rich question type mix`);
    else fail(`${cat}: fewer than 3 question types`);
  } else {
    if (distinct >= 2) pass(`${cat}: at least 2 question types`);
    else warn(`${cat}: only one question type available in pool`);
  }
}

if (exit) {
  console.log('\n=== Question Type Mix Audit FAILED ===');
  process.exit(1);
}
console.log('\n=== Question Type Mix Audit passed ===');
