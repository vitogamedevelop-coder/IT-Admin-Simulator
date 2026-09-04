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

const { getAllDiagnosticScenarios } = await import('../src/lib/diagnosticScenarios.js');

const scenarios = getAllDiagnosticScenarios();

function check(cond, msg) {
  if (!cond) {
    console.log(`[FAIL] ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`[PASS] ${msg}`);
  }
}

console.log('=== Themencheck Diagnostic Scenario Quality Audit ===');

check(scenarios.length >= 15, `At least 15 diagnostic scenarios defined (found ${scenarios.length})`);

let issues = 0;
for (const s of scenarios) {
  if (!s.diagnostic) { issues++; continue; }
  const d = s.diagnostic;
  if (!d.problem || !d.observations?.length || !d.rootCause || !d.reasoning || !d.fix) {
    issues++;
    console.log(`[WARN] Incomplete scenario: ${s.semanticKey}`);
  }
  if (typeof s.question !== 'string' || s.question.trim().length < 30) {
    issues++;
    console.log(`[WARN] Scenario question too short: ${s.semanticKey}`);
  }
  if (!Array.isArray(s.options) || s.options.length < 2 || typeof s.correct !== 'number') {
    issues++;
    console.log(`[WARN] Bad options/correct: ${s.semanticKey}`);
  }
  const labels = new Set(s.options);
  if (labels.size !== s.options.length) {
    issues++;
    console.log(`[WARN] Duplicate option labels: ${s.semanticKey}`);
  }
  if (!s.explanation || s.explanation.length < 20) {
    issues++;
    console.log(`[WARN] Weak feedback: ${s.semanticKey}`);
  }
}

check(issues === 0, `All ${scenarios.length} scenarios pass structure/quality checks`);

if (!process.exitCode) {
  console.log('\n=== Themencheck Diagnostic Scenario Quality Audit passed ===');
} else {
  console.log('\n=== Themencheck Diagnostic Scenario Quality Audit FAILED ===');
  process.exit(1);
}
