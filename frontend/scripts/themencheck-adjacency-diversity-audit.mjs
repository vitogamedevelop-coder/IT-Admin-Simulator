import { generateThemencheck, classifyQuestion, questionTypeGroup, questionFacet } from '../src/lib/academyThemencheck.js';

const categories = ['fundamentals', 'cisco-packet-tracer', 'active-directory-virtualbox', 'information-security', 'linux-virtualbox'];
const RUNS = 20;

let exit = 0;
function pass(msg) { console.log(`[PASS] ${msg}`); }
function warn(msg) { console.log(`[WARN] ${msg}`); }

console.log('=== Themencheck Adjacency Diversity Audit ===');

function maxStreak(arr) {
  if (arr.length === 0) return 0;
  let max = 1;
  let cur = 1;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) { cur++; max = Math.max(max, cur); }
    else cur = 1;
  }
  return max;
}

function streakSummary(runs, keyFn) {
  const streaks = { facet: [], type: [], comp: [] };
  for (const run of runs) {
    if (!run.length) continue;
    streaks.facet.push(maxStreak(run.map(keyFn.facet)));
    streaks.type.push(maxStreak(run.map(keyFn.type)));
    streaks.comp.push(maxStreak(run.map(keyFn.comp)));
  }
  return {
    facet: { max: Math.max(...streaks.facet, 0), avg: (streaks.facet.reduce((a, b) => a + b, 0) / streaks.facet.length).toFixed(2) },
    type: { max: Math.max(...streaks.type, 0), avg: (streaks.type.reduce((a, b) => a + b, 0) / streaks.type.length).toFixed(2) },
    comp: { max: Math.max(...streaks.comp, 0), avg: (streaks.comp.reduce((a, b) => a + b, 0) / streaks.comp.length).toFixed(2) },
  };
}

for (const cat of categories) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(generateThemencheck(cat));
  const summary = streakSummary(runs, {
    facet: (q) => questionFacet(q),
    type: (q) => questionTypeGroup(q),
    comp: (q) => classifyQuestion(q),
  });
  console.log(`\n--- ${cat} ---`);
  console.log(`  facet streaks: max ${summary.facet.max}, avg ${summary.facet.avg}`);
  console.log(`  type streaks:  max ${summary.type.max}, avg ${summary.type.avg}`);
  console.log(`  comp streaks:  max ${summary.comp.max}, avg ${summary.comp.avg}`);

  if (summary.facet.max > 3) warn(`${cat}: facet streak > 3`);
  if (summary.type.max > 4) warn(`${cat}: type streak > 4`);
  if (summary.comp.max > 4) warn(`${cat}: competency streak > 4`);
  pass(`${cat}: adjacency checked`);
}

if (exit) {
  console.log('\n=== Adjacency Diversity Audit FAILED ===');
  process.exit(1);
}
console.log('\n=== Adjacency Diversity Audit passed ===');
