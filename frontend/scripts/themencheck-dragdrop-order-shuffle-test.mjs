const { getAllDragDropQuestions, shuffleDragDropItems } = await import('../src/lib/dragDropQuestions.js');

const ordering = getAllDragDropQuestions().filter((q) => q.mode === 'ordering');

let exit = 0;
console.log('=== Themencheck Drag & Drop Ordering Shuffle Test ===');

for (const q of ordering) {
  let sawDifferent = false;
  let sawNonSolved = 0;

  for (let run = 0; run < 30; run++) {
    const s = shuffleDragDropItems(q);
    if (s.items.length !== q.items.length) {
      console.log(`[FAIL] ${q.semanticKey}: item count changed`);
      exit = 1;
      break;
    }
    const startIds = s.items.map((it) => it.id);
    if (new Set(startIds).size !== startIds.length) {
      console.log(`[FAIL] ${q.semanticKey}: duplicate items after shuffle`);
      exit = 1;
      break;
    }
    if (startIds.join(',') !== q.correctOrder.join(',')) {
      sawNonSolved++;
    }
    if (startIds.join(',') !== q.items.map((it) => it.id).join(',')) {
      sawDifferent = true;
    }
  }

  if (!sawDifferent) {
    console.log(`[WARN] ${q.semanticKey}: order did not vary across 30 shuffles (unlikely but possible)`);
  }
  if (sawNonSolved < 25) {
    console.log(`[FAIL] ${q.semanticKey}: started pre-solved too often`);
    exit = 1;
  }
}

if (exit) {
  console.log('\n=== Ordering Shuffle Test FAILED ===');
  process.exit(1);
}
console.log('\n=== Ordering Shuffle Test passed ===');
