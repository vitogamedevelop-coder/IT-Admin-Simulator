import { generateThemencheck, questionFacet } from '../src/lib/academyThemencheck.js';

const categories = ['fundamentals', 'cisco-packet-tracer', 'active-directory-virtualbox', 'information-security', 'linux-virtualbox'];
const RUNS = 20;

let exit = 0;
function fail(msg) { console.log(`[FAIL] ${msg}`); exit = 1; }
function pass(msg) { console.log(`[PASS] ${msg}`); }
function warn(msg) { console.log(`[WARN] ${msg}`); }

console.log('=== Themencheck Facet Balance Audit ===');

for (const cat of categories) {
  let maxFacetShare = 0;
  let minFacets = Infinity;
  let dominanceWarnings = 0;
  for (let i = 0; i < RUNS; i++) {
    const qs = generateThemencheck(cat);
    if (!qs.length) continue;
    const facets = {};
    for (const q of qs) facets[questionFacet(q)] = (facets[questionFacet(q)] || 0) + 1;
    const distinct = Object.keys(facets).length;
    minFacets = Math.min(minFacets, distinct);
    const maxCount = Math.max(...Object.values(facets));
    const share = maxCount / qs.length;
    maxFacetShare = Math.max(maxFacetShare, share);
    if (share > 0.30) dominanceWarnings++;
  }
  console.log(`\n--- ${cat} ---`);
  console.log(`  min facets per run: ${minFacets === Infinity ? 0 : minFacets}`);
  console.log(`  max single-facet share: ${(maxFacetShare * 100).toFixed(1)}%`);
  console.log(`  runs with >30% single facet: ${dominanceWarnings}/${RUNS}`);

  if (minFacets < 3 && cat !== 'linux-virtualbox') fail(`${cat}: fewer than 3 facets per run`);
  if (maxFacetShare > 0.35) warn(`${cat}: a single facet exceeds 35%`);
  if (dominanceWarnings > RUNS * 0.5 && cat !== 'linux-virtualbox') warn(`${cat}: frequent facet dominance`);
  pass(`${cat}: facet balance checked`);
}

if (exit) {
  console.log('\n=== Facet Balance Audit FAILED ===');
  process.exit(1);
}
console.log('\n=== Facet Balance Audit passed ===');
