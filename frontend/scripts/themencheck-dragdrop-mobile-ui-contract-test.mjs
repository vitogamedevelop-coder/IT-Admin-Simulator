import { readFile } from 'fs/promises';
import path from 'path';
const { getAllDragDropQuestions } = await import('../src/lib/dragDropQuestions.js');

const questions = getAllDragDropQuestions();

let exit = 0;
console.log('=== Themencheck Drag & Drop Mobile UI Contract Test ===');

const componentPath = path.resolve('src/components/ThemencheckDragDrop.jsx');
const source = await readFile(componentPath, 'utf-8');

if (!source.includes('onClick') && !source.includes('onPointerDown')) {
  console.log('[FAIL] DragDrop component uses neither onClick nor onPointerDown');
  exit = 1;
} else {
  console.log('[PASS] DragDrop uses click/touch handlers');
}

if (source.includes('draggable') || source.includes('onDrag') || source.includes('onDrop')) {
  console.log('[FAIL] DragDrop component depends on HTML5 drag events (bad for mobile)');
  exit = 1;
} else {
  console.log('[PASS] DragDrop does not use native HTML5 drag events');
}

if (source.includes('hover:') && !source.includes('focus:')) {
  console.log('[WARN] DragDrop uses hover: classes; ensure tap feedback is visible');
} else {
  console.log('[PASS] No hover-only interactions detected');
}

const labelCounts = { short: 0, long: 0 };
for (const q of questions) {
  for (const it of q.items) {
    if (it.label.length > 60) {
      console.log(`[WARN] ${q.semanticKey}: item label too long for mobile: "${it.label.slice(0, 50)}..."`);
      labelCounts.long++;
    } else {
      labelCounts.short++;
    }
  }
}

if (labelCounts.long === 0) {
  console.log('[PASS] All item labels fit mobile width');
} else {
  console.log(`[INFO] ${labelCounts.long} labels > 60 chars (may wrap on small screens)`);
}

if (exit) {
  console.log('\n=== Mobile UI Contract Test FAILED ===');
  process.exit(1);
}
console.log('\n=== Mobile UI Contract Test passed ===');
