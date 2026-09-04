const { getAllMultiSelectQuestions } = await import('../src/lib/multiSelectQuestions.js');
const { getAllDiagnosticScenarios } = await import('../src/lib/diagnosticScenarios.js');

const multi = getAllMultiSelectQuestions();
const diagnostic = getAllDiagnosticScenarios();

const diagnosticMulti = multi.filter((q) => q.isDiagnostic || q.diagnostic);

console.log('=== Diagnostic Multi-Select Quality Audit ===');
console.log(`Diagnostic scenarios: ${diagnostic.length}`);
console.log(`Multi-select questions: ${multi.length}`);
console.log(`Diagnostic-aware multi-select: ${diagnosticMulti.length}`);

if (diagnosticMulti.length === 0) {
  console.log('[INFO] No explicit diagnostic multi-select questions in this build. Phase 2B is additive to 2A.');
  console.log('\n=== Diagnostic Multi-Select Quality Audit passed ===');
  process.exit(0);
}

let exit = 0;
for (const q of diagnosticMulti) {
  if (!q.diagnostic?.problem || !q.diagnostic?.rootCause) {
    console.log(`[FAIL] ${q.semanticKey}: missing diagnostic fields`);
    exit = 1;
  }
  if (!Array.isArray(q.correctIndices) || q.correctIndices.length < 2) {
    console.log(`[FAIL] ${q.semanticKey}: needs >=2 correct answers`);
    exit = 1;
  }
}

if (exit) {
  console.log('\n=== Diagnostic Multi-Select Quality Audit FAILED ===');
  process.exit(1);
}
console.log('\n=== Diagnostic Multi-Select Quality Audit passed ===');
