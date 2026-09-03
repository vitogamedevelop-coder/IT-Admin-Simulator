import { LESSONS } from '../src/lib/academyLessonData.js';

function normalizeItem(item, i) {
  if (typeof item === 'string') {
    return { id: String(i), label: item };
  }
  if (item && typeof item === 'object') {
    const id = item.id ?? String(i);
    const label = item.label ?? item.text ?? item.title ?? item.value ?? id;
    return { id, label };
  }
  return { id: String(i), label: String(item) };
}

console.log('=== Academy Ordering Exercise Render Audit ===');
const errors = [];
const audit = { exercises: 0, badItems: 0 };

for (const [key, lesson] of Object.entries(LESSONS)) {
  if (!Array.isArray(lesson.exercises)) continue;
  for (const ex of lesson.exercises) {
    if (ex.type !== 'ordering') continue;
    audit.exercises += 1;
    if (!ex.id) {
      errors.push(`[${key}] ordering exercise missing id`);
      continue;
    }
    if (!Array.isArray(ex.items) || ex.items.length === 0) {
      errors.push(`[${key}] ordering exercise ${ex.id} has no items`);
      continue;
    }

    const labels = new Set();
    const ids = new Set();
    for (let i = 0; i < ex.items.length; i += 1) {
      const normalized = normalizeItem(ex.items[i], i);
      if (!normalized.label || !String(normalized.label).trim()) {
        errors.push(`[${key}] ${ex.id} item[${i}] has empty label`);
        audit.badItems += 1;
      }
      if (labels.has(normalized.label)) {
        errors.push(`[${key}] ${ex.id} duplicate label: ${normalized.label}`);
      }
      labels.add(normalized.label);

      const itemId = normalized.id ?? String(i);
      if (ids.has(itemId)) {
        errors.push(`[${key}] ${ex.id} duplicate id: ${itemId}`);
      }
      ids.add(itemId);

      if (ex.correctOrder && !ex.correctOrder.includes(itemId)) {
        errors.push(`[${key}] ${ex.id} correctOrder does not include item id ${itemId}`);
      }
    }

    if (Array.isArray(ex.correctOrder) && ex.correctOrder.length !== ex.items.length) {
      errors.push(`[${key}] ${ex.id} correctOrder length ${ex.correctOrder.length} != items ${ex.items.length}`);
    }
  }
}

console.log(`  ordering exercises: ${audit.exercises}, bad items: ${audit.badItems}`);
if (errors.length > 0) {
  console.log('FAILURES:');
  for (const err of errors) {
    console.log('  -', err);
  }
  throw new Error(`ordering audit failed with ${errors.length} issue(s)`);
}

console.log('=== Academy Ordering Exercise Render Audit passed ===');



