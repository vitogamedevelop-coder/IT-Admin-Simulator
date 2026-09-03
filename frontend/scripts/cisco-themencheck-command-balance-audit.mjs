import { generateThemencheck } from '../src/lib/academyThemencheck.js';

const SEED_COUNT = 20;
const CATEGORY = 'cisco-packet-tracer';

function summarize(run) {
  const commandCount = run.filter((q) => q.isCommandRecall).length;
  const uniqueQuestions = new Set(run.map((q) => q.question)).size;
  const topicCounts = {};
  for (const q of run) {
    topicCounts[q.sourceTopicId] = (topicCounts[q.sourceTopicId] || 0) + 1;
  }
  return { total: run.length, commandCount, uniqueQuestions, topicCounts };
}

let commandTotal = 0;
let totalQuestions = 0;
let minCommand = Infinity;
let maxCommand = -Infinity;
const topicSet = new Set();

console.log('=== Cisco Themencheck Command Balance Audit ===\n');

for (let i = 0; i < SEED_COUNT; i++) {
  // generateThemencheck uses Math.random; we cannot seed it directly, so we
  // rely on repeated runs producing different shuffles.
  const run = generateThemencheck(CATEGORY);
  const s = summarize(run);
  commandTotal += s.commandCount;
  totalQuestions += s.total;
  minCommand = Math.min(minCommand, s.commandCount);
  maxCommand = Math.max(maxCommand, s.commandCount);
  Object.keys(s.topicCounts).forEach((t) => topicSet.add(t));
  console.log(`Run ${i + 1}: total=${s.total}, commands=${s.commandCount}, unique=${s.uniqueQuestions}/${s.total}`);
}

const avgCommand = totalQuestions === 0 ? 0 : commandTotal / totalQuestions;

console.log('\n--- Summary ---');
console.log(`Runs: ${SEED_COUNT}`);
console.log(`Total questions generated: ${totalQuestions}`);
console.log(`Command recall questions: ${commandTotal}`);
console.log(`Average command share: ${(avgCommand * 100).toFixed(1)}%`);
console.log(`Min commands per run: ${minCommand}`);
console.log(`Max commands per run: ${maxCommand}`);
console.log(`Topics touched: ${topicSet.size}`);

if (totalQuestions === 0) {
  console.error('Audit FAILED: no themencheck questions produced.');
  process.exit(1);
}

if (commandTotal === 0) {
  console.error('Audit FAILED: no command recall questions appeared in any run.');
  process.exit(1);
}

const share = commandTotal / totalQuestions;
if (share < 0.20) {
  console.error('Audit FAILED: command share below 20%.');
  process.exit(1);
}

if (share > 0.45) {
  console.error('Audit FAILED: command share above 45%.');
  process.exit(1);
}

if (minCommand < 1) {
  console.error('Audit FAILED: at least one run had no command recall question.');
  process.exit(1);
}

console.log('\n=== Cisco Themencheck Command Balance Audit passed ===');








