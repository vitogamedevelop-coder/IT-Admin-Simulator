const { getAllDragDropQuestions } = await import('../src/lib/dragDropQuestions.js');

const questions = getAllDragDropQuestions();

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

console.log('=== Themencheck Drag & Drop Contract Test ===');

if (questions.length < 25) {
  fail(`At least 25 drag-drop questions expected, found ${questions.length}`);
} else {
  pass(`${questions.length} drag-drop questions defined`);
}

const modes = { matching: 0, ordering: 0, categorization: 0 };

for (const q of questions) {
  modes[q.mode] = (modes[q.mode] || 0) + 1;

  if (!['matching', 'ordering', 'categorization'].includes(q.mode)) {
    fail(`${q.semanticKey}: invalid mode ${q.mode}`);
  }
  if (!Array.isArray(q.items) || q.items.length < 2) {
    fail(`${q.semanticKey}: needs >=2 items`);
  }
  if (q.items.some((it) => !it.id || !it.label || it.label.trim() === '')) {
    fail(`${q.semanticKey}: invalid item`);
  }
  const ids = q.items.map((it) => it.id);
  if (new Set(ids).size !== ids.length) {
    fail(`${q.semanticKey}: duplicate item ids`);
  }
  if (q.type !== 'drag-drop') {
    fail(`${q.semanticKey}: type must be 'drag-drop'`);
  }

  if (q.mode === 'matching') {
    if (!Array.isArray(q.targets) || q.targets.length < 2) fail(`${q.semanticKey}: matching needs >=2 targets`);
    if (!q.correctMapping || Object.keys(q.correctMapping).length !== q.items.length) {
      fail(`${q.semanticKey}: matching needs complete correctMapping`);
    }
    for (const [k, v] of Object.entries(q.correctMapping)) {
      if (!ids.includes(k) || !q.targets.includes(v)) fail(`${q.semanticKey}: bad mapping ${k} => ${v}`);
    }
  } else if (q.mode === 'categorization') {
    if (!Array.isArray(q.categories) || q.categories.length < 2) fail(`${q.semanticKey}: categorization needs >=2 categories`);
    if (!q.correctMapping || Object.keys(q.correctMapping).length !== q.items.length) {
      fail(`${q.semanticKey}: categorization needs complete correctMapping`);
    }
    for (const [k, v] of Object.entries(q.correctMapping)) {
      if (!ids.includes(k) || !q.categories.includes(v)) fail(`${q.semanticKey}: bad mapping ${k} => ${v}`);
    }
  } else if (q.mode === 'ordering') {
    if (!Array.isArray(q.correctOrder) || q.correctOrder.length !== q.items.length) {
      fail(`${q.semanticKey}: ordering needs correctOrder matching items`);
    }
    if (new Set(q.correctOrder).size !== q.correctOrder.length) fail(`${q.semanticKey}: duplicate in correctOrder`);
    for (const id of q.correctOrder) {
      if (!ids.includes(id)) fail(`${q.semanticKey}: unknown id in correctOrder: ${id}`);
    }
  }

  if (!q.explanation || q.explanation.trim().length < 20) {
    fail(`${q.semanticKey}: explanation too short`);
  }
}

console.log(`  matching: ${modes.matching}, ordering: ${modes.ordering}, categorization: ${modes.categorization}`);

if (failures === 0) pass('All drag-drop questions satisfy the contract');

if (exit) {
  console.log('\n=== Drag & Drop Contract Test FAILED ===');
  process.exit(1);
}
console.log('\n=== Drag & Drop Contract Test passed ===');
