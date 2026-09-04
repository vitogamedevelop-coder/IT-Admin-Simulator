import { generateThemencheck, classifyQuestion } from '../src/lib/academyThemencheck.js';

const categories = ['fundamentals', 'cisco-packet-tracer', 'active-directory-virtualbox', 'information-security', 'linux-virtualbox'];
const RUNS = 30;

let exit = 0;
function warn(msg) { console.log(`[WARN] ${msg}`); }
function pass(msg) { console.log(`[PASS] ${msg}`); }
function fail(msg) { console.log(`[FAIL] ${msg}`); exit = 1; }

console.log('=== Themencheck Competency Mix Audit ===');

for (const cat of categories) {
  const totals = { recall: 0, interpretation: 0, diagnosis: 0, transfer: 0 };
  let totalQs = 0;
  for (let i = 0; i < RUNS; i++) {
    const qs = generateThemencheck(cat);
    if (!qs.length) continue;
    totalQs += qs.length;
    for (const q of qs) {
      const c = classifyQuestion(q);
      totals[c] = (totals[c] || 0) + 1;
    }
  }
  if (totalQs === 0) {
    console.log(`[INFO] ${cat}: no questions`);
    continue;
  }
  const pct = Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, (v / totalQs * 100).toFixed(1) + '%']));
  console.log(`\n--- ${cat} ---`);
  console.log(`  total ${totalQs} questions over ${RUNS} runs`);
  console.log(`  recall ${pct.recall}, interpretation ${pct.interpretation}, diagnosis ${pct.diagnosis}, transfer ${pct.transfer}`);

  if ((totals.recall / totalQs) > 0.55) warn(`${cat}: recall > 55%`);
  if ((totals.diagnosis / totalQs) < 0.10 && totals.diagnosis > 0) warn(`${cat}: diagnosis < 10% despite available pool`);
  const distinctComp = Object.values(totals).filter((v) => v > 0).length;
  if (distinctComp >= 3) {
    pass(`${cat}: at least 3 competencies present`);
  } else if (totalQs < 200) {
    warn(`${cat}: fewer than 3 competencies, but pool is small (${totalQs} questions)`);
  } else {
    fail(`${cat}: fewer than 3 competencies`);
  }
}

if (exit) {
  console.log('\n=== Competency Mix Audit FAILED ===');
  process.exit(1);
}
console.log('\n=== Competency Mix Audit passed ===');
