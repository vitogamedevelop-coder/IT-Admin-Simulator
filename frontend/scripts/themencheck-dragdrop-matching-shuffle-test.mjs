const { getAllDragDropQuestions, shuffleDragDropItems } = await import('../src/lib/dragDropQuestions.js');

const matching = getAllDragDropQuestions().filter((q) => q.mode === 'matching' || q.mode === 'categorization');

let exit = 0;
console.log('=== Themencheck Drag & Drop Matching/Categorization Shuffle Test ===');

for (const q of matching) {
  let sawDifferent = false;

  for (let run = 0; run < 30; run++) {
    const s = shuffleDragDropItems(q);
    if (s.items.length !== q.items.length) {
      console.log(`[FAIL] ${q.semanticKey}: item count changed`);
      exit = 1;
      break;
    }
    const labels = s.items.map((it) => it.label);
    if (new Set(labels).size !== labels.length) {
      console.log(`[FAIL] ${q.semanticKey}: duplicate labels after shuffle`);
      exit = 1;
      break;
    }
    for (const it of q.items) {
      const mapped = s.items.find((x) => x.id === it.id);
      if (!mapped || mapped.label !== it.label) {
        console.log(`[FAIL] ${q.semanticKey}: item id/label lost`);
        exit = 1;
        break;
      }
    }
    if (s.items.map((it) => it.id).join(',') !== q.items.map((it) => it.id).join(',')) {
      sawDifferent = true;
    }
  }

  if (!sawDifferent) {
    console.log(`[WARN] ${q.semanticKey}: order did not vary across 30 shuffles`);
  }
}

if (exit) {
  console.log('\n=== Matching/Categorization Shuffle Test FAILED ===');
  process.exit(1);
}
console.log('\n=== Matching/Categorization Shuffle Test passed ===');
