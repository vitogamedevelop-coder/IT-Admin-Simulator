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

const { generateThemencheck, saveThemencheckResult } = await import('../src/lib/academyThemencheck.js');

function findDuplicates(runs) {
  const dupes = [];
  for (const { name, questions } of runs) {
    const seen = new Map();
    for (let i = 0; i < questions.length; i++) {
      const text = (questions[i].question || questions[i].prompt || '').trim();
      if (text) {
        if (seen.has(text) && seen.get(text) !== i) {
          dupes.push(`${name}: q${seen.get(text) + 1} == q${i + 1}: ${text.substring(0, 60)}`);
        } else {
          seen.set(text, i);
        }
      }
    }
  }
  return dupes;
}

function runBatch(categories, runsPerCategory = 20) {
  const runs = [];
  for (const categoryId of categories) {
    for (let run = 0; run < runsPerCategory; run++) {
      const q = generateThemencheck(categoryId);
      const answers = q.map((qu) => ({
        selectedIndex: 0,
        correct: true,
        sourceTopicId: qu.sourceTopicId,
        questionText: qu.question,
      }));
      saveThemencheckResult(categoryId, {
        questions: q,
        answers,
        startedAt: Date.now() - 1000,
        finishedAt: Date.now(),
      });
      runs.push({ name: `${categoryId}#${run + 1}`, questions: q });
    }
  }
  return runs;
}

const categories = ['fundamentals', 'cisco-packet-tracer', 'active-directory-virtualbox'];
const runs = runBatch(categories, 20);

let exit = 0;
const duplicates = findDuplicates(runs);
if (duplicates.length > 0) {
  console.log(`[FAIL] ${duplicates.length} duplicate questions detected within ${categories.length} x 20 runs`);
  duplicates.slice(0, 20).forEach((d) => console.log(`  - ${d}`));
  exit = 1;
} else {
  console.log('[PASS] No duplicate questions within any run');
}

// Cross-run overlap: for each category, compare consecutive runs
for (const categoryId of categories) {
  const catRuns = runs.filter((r) => r.name.startsWith(`${categoryId}#`)).map((r) => r.questions);
  let overlap = 0;
  let total = 0;
  for (let i = 1; i < catRuns.length; i++) {
    const prev = new Set(catRuns[i - 1].map((q) => (q.question || q.prompt || '').trim()));
    const cur = catRuns[i].map((q) => (q.question || q.prompt || '').trim());
    const common = cur.filter((q) => prev.has(q));
    overlap += common.length;
    total += cur.length;
  }
  const pct = total > 0 ? (overlap / total) * 100 : 0;
  if (pct > 20) {
    console.log(`[FAIL] ${categoryId}: ${overlap}/${total} (${pct.toFixed(1)}%) consecutive-run overlaps`);
    exit = 1;
  } else {
    console.log(`[PASS] ${categoryId}: ${overlap}/${total} (${pct.toFixed(1)}%) consecutive-run overlaps`);
  }
}

if (exit) process.exit(1);
console.log('\n=== Themencheck No Duplicate Question Audit passed ===');
