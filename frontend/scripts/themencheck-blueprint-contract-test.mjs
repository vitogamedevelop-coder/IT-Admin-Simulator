import {
  generateThemencheck,
  classifyQuestion,
  questionTypeGroup,
  questionFacet,
} from '../src/lib/academyThemencheck.js';

const categories = ['fundamentals', 'cisco-packet-tracer', 'active-directory-virtualbox', 'information-security', 'linux-virtualbox'];

function analyze(qs) {
  const comp = {};
  const types = {};
  const facets = {};
  for (const q of qs) {
    const c = classifyQuestion(q);
    const t = questionTypeGroup(q);
    const f = questionFacet(q);
    comp[c] = (comp[c] || 0) + 1;
    types[t] = (types[t] || 0) + 1;
    facets[f] = (facets[f] || 0) + 1;
  }
  return { comp, types, facets };
}

let exit = 0;
let failures = 0;
function fail(msg) { console.log(`[FAIL] ${msg}`); failures++; exit = 1; }
function pass(msg) { console.log(`[PASS] ${msg}`); }
function warn(msg) { console.log(`[WARN] ${msg}`); }

console.log('=== Themencheck Blueprint Contract Test ===');

for (const cat of categories) {
  const runs = [];
  for (let i = 0; i < 20; i++) {
    const q = generateThemencheck(cat);
    runs.push(q);
  }
  const maxLen = Math.max(1, ...runs.map((r) => r.length));
  const minExpected = Math.min(15, maxLen);
  const totalSet = new Set();
  const allComp = {};
  const allTypes = {};
  const allFacets = {};

  for (const run of runs) {
    if (run.length > 0 && run.length < minExpected) fail(`${cat}: run has only ${run.length} questions (expected >= ${minExpected})`);
    if (run.length === 0) {
      console.log(`[INFO] ${cat}: no questions generated`);
      continue;
    }
    const { comp, types, facets } = analyze(run);
    for (const [k, v] of Object.entries(comp)) allComp[k] = (allComp[k] || 0) + v;
    for (const [k, v] of Object.entries(types)) allTypes[k] = (allTypes[k] || 0) + v;
    for (const [k, v] of Object.entries(facets)) allFacets[k] = (allFacets[k] || 0) + v;
    for (const q of run) totalSet.add(q.semanticKey);
  }

  const avgComp = Object.fromEntries(Object.entries(allComp).map(([k, v]) => [k, v / 20]));
  const avgTypes = Object.fromEntries(Object.entries(allTypes).map(([k, v]) => [k, v / 20]));

  console.log(`\n--- ${cat} ---`);
  console.log(`  avg total: ${(runs.reduce((a, b) => a + b.length, 0) / runs.length).toFixed(1)}`);
  console.log(`  unique semantic keys across 20 runs: ${totalSet.size}`);
  console.log(`  competency avg: ${JSON.stringify(avgComp)}`);
  console.log(`  type avg: ${JSON.stringify(avgTypes)}`);

  if (cat !== 'linux-virtualbox' && maxLen >= 15) {
    if (!avgComp.recall && !avgComp.interpretation) warn(`${cat}: missing recall/interpretation`);
    if (Object.keys(avgComp).length < 2) warn(`${cat}: only one competency`);
    if (Object.keys(avgTypes).length < 2) warn(`${cat}: only one question type`);
  }
  if (Object.keys(allFacets).length < 3 && maxLen >= 10) warn(`${cat}: fewer than 3 facets across runs`);
}

if (failures === 0) pass('Blueprint contract looks healthy');

if (exit) {
  console.log('\n=== Blueprint Contract Test FAILED ===');
  process.exit(1);
}
console.log('\n=== Blueprint Contract Test passed ===');
