const { getDragDropQuestionsForCategory, getAllDragDropQuestions } = await import('../src/lib/dragDropQuestions.js');

function auditCategory(categoryId, minTotal) {
  const questions = getDragDropQuestionsForCategory(categoryId);
  const byMode = { matching: 0, ordering: 0, categorization: 0 };
  for (const q of questions) byMode[q.mode]++;

  let exit = 0;
  console.log(`\n--- ${categoryId} ---`);
  console.log(`  total: ${questions.length} (min ${minTotal})`);
  console.log(`  matching: ${byMode.matching}, ordering: ${byMode.ordering}, categorization: ${byMode.categorization}`);

  if (questions.length < minTotal) {
    console.log(`[FAIL] ${categoryId}: too few drag-drop questions (${questions.length} < ${minTotal})`);
    exit = 1;
  } else {
    console.log(`[PASS] ${categoryId}: enough drag-drop questions`);
  }

  if (byMode.matching < 1 && byMode.ordering < 1 && byMode.categorization < 1) {
    console.log(`[WARN] ${categoryId}: only one drag-drop mode available`);
  }

  return exit;
}

let exit = 0;
console.log('=== Themencheck Drag & Drop Coverage Audit ===');
exit += auditCategory('cisco-packet-tracer', 10);
exit += auditCategory('active-directory-virtualbox', 8);
exit += auditCategory('linux-virtualbox', 1); // Linux has limited lesson pool in this build
exit += auditCategory('information-security', 5);

const total = getAllDragDropQuestions().length;
console.log(`\nTotal drag-drop questions: ${total}`);
if (total < 25) {
  console.log(`[FAIL] Total below 25`);
  exit += 1;
} else {
  console.log(`[PASS] Total >= 25`);
}

if (exit) {
  console.log('\n=== Drag & Drop Coverage Audit FAILED ===');
  process.exit(1);
}
console.log('\n=== Drag & Drop Coverage Audit passed ===');
