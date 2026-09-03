import { generateQuestion } from '../src/lib/knowledge/questionGenerator.js';

const EXPECTED_COMMAND = 'ip helper-address 192.168.0.1';

console.log('=== Cisco DHCP Relay Command Recall Test ===\n');

// Force the "goal to command" template so the question asks for the command itself.
const q = generateQuestion('ciscoCmd.ipHelperAddress', 'cisco.command.goalToCommand', {
  seed: 'dhcp-relay-test',
  contextType: 'direct_question',
});

console.log(`Prompt: ${q.prompt}`);
const labels = q.options.map((o) => o.label);
console.log(`Options: ${labels.join(' | ')}`);
console.log(`Correct: ${labels[q.correct]}`);

if (labels[q.correct] !== EXPECTED_COMMAND) {
  console.error(`FAILED: expected correct answer "${EXPECTED_COMMAND}", got "${labels[q.correct]}"`);
  process.exit(1);
}

const wrongs = labels.filter((_, idx) => idx !== q.correct);
const hasPlausibleWrong = wrongs.some((w) => /ip default-gateway 192\.168\.0\.1|ip route 192\.168\.0\.1|ip address 192\.168\.0\.1/i.test(w));
if (!hasPlausibleWrong) {
  console.error('FAILED: expected a plausible distractor with 192.168.0.1 (e.g. ip default-gateway).');
  process.exit(1);
}

if (!q.explanation || !q.explanation.includes('192.168.0.1')) {
  console.error('FAILED: explanation should mention the DHCP-server IP 192.168.0.1.');
  process.exit(1);
}

console.log('\n=== Cisco DHCP Relay Command Recall Test passed ===');








