const { getAllMultiSelectQuestions } = await import('../src/lib/multiSelectQuestions.js');

const questions = getAllMultiSelectQuestions();

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

console.log('=== Themencheck Multi-Select Contract Test ===');

if (questions.length < 26) {
  fail(`At least 26 multi-select questions expected, found ${questions.length}`);
} else {
  pass(`${questions.length} multi-select questions defined`);
}

for (const q of questions) {
  if (!Array.isArray(q.options) || q.options.length < 3) {
    fail(`${q.semanticKey}: needs >=3 options`);
    continue;
  }
  if (!Array.isArray(q.correctIndices) || q.correctIndices.length < 2) {
    fail(`${q.semanticKey}: needs >=2 correct indices`);
  }
  const wrongCount = q.options.length - q.correctIndices.length;
  if (wrongCount < 1) {
    fail(`${q.semanticKey}: needs >=1 incorrect option`);
  }
  if (new Set(q.options).size !== q.options.length) {
    fail(`${q.semanticKey}: duplicate option labels`);
  }
  for (const opt of q.options) {
    if (!opt || opt.trim() === '') {
      fail(`${q.semanticKey}: empty or null option`);
    }
  }
  for (const idx of q.correctIndices) {
    if (typeof idx !== 'number' || idx < 0 || idx >= q.options.length) {
      fail(`${q.semanticKey}: correct index out of bounds: ${idx}`);
    }
  }
  if (q.type !== 'multi-select') {
    fail(`${q.semanticKey}: type must be 'multi-select'`);
  }
  if (!q.explanation || q.explanation.trim().length < 20) {
    fail(`${q.semanticKey}: explanation missing or too short`);
  }
  const labels = q.options.map((o) => o.toLowerCase().trim());
  const bad = ['alle antworten', 'keine der antworten', 'keines davon', 'keine der oben'];
  for (const o of labels) {
    if (bad.some((b) => o === b || o.includes(b))) {
      fail(`${q.semanticKey}: contains forbidden meta option`);
    }
  }
}

if (failures === 0) {
  pass('All multi-select questions satisfy the contract');
}

if (exit) {
  console.log('\n=== Themencheck Multi-Select Contract Test FAILED ===');
  process.exit(1);
}
console.log('\n=== Themencheck Multi-Select Contract Test passed ===');
