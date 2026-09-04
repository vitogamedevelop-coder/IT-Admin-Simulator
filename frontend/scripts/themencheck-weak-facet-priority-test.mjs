import { generateThemencheck, questionFacet } from '../src/lib/academyThemencheck.js';
import { setFacetMasteryOverride, resetFacetMastery } from '../src/lib/knowledge/index.js';

const cat = 'cisco-packet-tracer';
const weakFacet = 'cisco-packet-tracer/dhcp';
const RUNS = 20;

function facetShare(qs, facet) {
  return qs.filter((q) => questionFacet(q) === facet || questionFacet(q).startsWith(facet)).length / qs.length;
}

function runBaseline() {
  resetFacetMastery();
  const shares = [];
  for (let i = 0; i < RUNS; i++) {
    const qs = generateThemencheck(cat);
    shares.push(facetShare(qs, weakFacet));
  }
  return shares.reduce((a, b) => a + b, 0) / shares.length;
}

function runWeak() {
  const map = {};
  map[weakFacet] = -4;
  setFacetMasteryOverride(map);
  const shares = [];
  for (let i = 0; i < RUNS; i++) {
    const qs = generateThemencheck(cat);
    shares.push(facetShare(qs, weakFacet));
  }
  return shares.reduce((a, b) => a + b, 0) / shares.length;
}

console.log('=== Themencheck Weak Facet Priority Test ===');
const baseline = runBaseline();
const weak = runWeak();

console.log(`  baseline ${weakFacet} share: ${(baseline * 100).toFixed(1)}%`);
console.log(`  weak ${weakFacet} share: ${(weak * 100).toFixed(1)}%`);

if (weak > baseline) {
  console.log('[PASS] weak facet is boosted');
} else {
  console.log('[FAIL] weak facet not boosted');
  process.exit(1);
}

if (weak > 0.30) {
  console.log('[WARN] weak facet dominates the check (>30%)');
}

resetFacetMastery();
console.log('\n=== Weak Facet Priority Test passed ===');
