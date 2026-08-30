import { LESSONS } from '../src/lib/academyLessonData.js';
import { selectDirectTheoryExercises, getDirectExerciseLimit } from '../src/lib/lessonExerciseSelector.js';

let failures = 0;
function assert(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!condition) failures += 1;
}

const RECOMMENDED_LIMITS = {
  small: [2, 3],
  normal: [3, 5],
  large: [4, 6],
  veryLarge: [6, 8],
};

console.log('=== Academy Direct Exercise Load Audit ===');

const report = [];
for (const [topicId, lesson] of Object.entries(LESSONS)) {
  const full = lesson.exercises || [];
  const selected = selectDirectTheoryExercises(full, topicId);
  const limit = getDirectExerciseLimit(full.length);

  let sizeBucket = 'small';
  if (full.length > 14) sizeBucket = 'veryLarge';
  else if (full.length > 10) sizeBucket = 'large';
  else if (full.length > 5) sizeBucket = 'normal';

  const [min, max] = RECOMMENDED_LIMITS[sizeBucket];
  const withinRange = full.length === 0 ? selected.length === 0 : (selected.length >= min && selected.length <= max);

  report.push({ topicId, full: full.length, direct: selected.length, limit, bucket: sizeBucket });
  if (full.length > 0) {
    assert(`Direct exercise count for ${topicId}`, withinRange, `full=${full.length} direct=${selected.length} bucket=${sizeBucket} expected ${min}-${max}`);
  } else {
    assert(`No exercises for ${topicId} (direct=0)`, selected.length === 0);
  }
  assert(`Direct exercises do not exceed full pool for ${topicId}`, selected.length <= full.length);
  assert(`Limit matches selector for ${topicId}`, selected.length === Math.min(full.length, limit));
}

console.log('\nSummary:');
for (const r of report) {
  console.log(`  ${r.topicId}: full=${r.full} → direct=${r.direct} (limit=${r.limit}) [${r.bucket}]`);
}

console.log('');
if (failures === 0) {
  console.log('Academy direct exercise load audit passed.');
  process.exit(0);
}
console.log(`${failures} failures.`);
process.exit(1);
