// Milestone C6 (part 1): tests for the Cisco CLI answer-checking engine
// (lib/ciscoCli.js) used by the new "cli-input" exercise type and the
// CLI-task pool mixed into Praxis/Fachgespräch (see collectCliTasksFromLesson
// in academyThemencheck.js).
import assert from 'node:assert/strict';
import { normalizeCiscoLine, ciscoLineMatches, checkCiscoInput } from '../src/lib/ciscoCli.js';

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('normalizeCiscoLine / ciscoLineMatches');
test('case-insensitive + whitespace tolerant', () => {
  assert.equal(normalizeCiscoLine('  Hostname   SW1  '), 'hostname sw1');
});
test('enable <-> en', () => {
  assert.ok(ciscoLineMatches('en', 'enable'));
  assert.ok(ciscoLineMatches('Enable', 'en'));
});
test('configure terminal <-> conf t / config t', () => {
  assert.ok(ciscoLineMatches('conf t', 'configure terminal'));
  assert.ok(ciscoLineMatches('config t', 'configure terminal'));
  assert.ok(ciscoLineMatches('CONF TERM', 'configure terminal'));
});
test('show running-config <-> show run / sh run', () => {
  assert.ok(ciscoLineMatches('show run', 'show running-config'));
  assert.ok(ciscoLineMatches('sh run', 'show running-config'));
});
test('copy running-config startup-config <-> copy run start / write / wr', () => {
  assert.ok(ciscoLineMatches('copy run start', 'copy running-config startup-config'));
  assert.ok(ciscoLineMatches('write', 'copy running-config startup-config'));
  assert.ok(ciscoLineMatches('wr', 'copy running-config startup-config'));
});
test('generic sh -> show prefix', () => {
  assert.ok(ciscoLineMatches('sh vlan brief', 'show vlan brief'));
  assert.ok(ciscoLineMatches('sh ip route', 'show ip route'));
  assert.ok(ciscoLineMatches('sh interfaces trunk', 'show interfaces trunk'));
});
test('generic int -> interface prefix', () => {
  assert.ok(ciscoLineMatches('int fa0/1', 'interface fa0/1'));
});
test('interface type long <-> short form', () => {
  assert.ok(ciscoLineMatches('interface fastethernet0/1', 'interface fa0/1'));
  assert.ok(ciscoLineMatches('interface gi0/1', 'interface gigabitethernet0/1'));
  assert.ok(ciscoLineMatches('int Fa0/1', 'interface fastethernet0/1'));
});
test('spacing around slash and commas is ignored', () => {
  assert.ok(ciscoLineMatches('interface fa 0 / 1', 'interface fa0/1'));
  assert.ok(ciscoLineMatches('switchport trunk allowed vlan 10, 20', 'switchport trunk allowed vlan 10,20'));
});
test('does not falsely match unrelated commands', () => {
  assert.ok(!ciscoLineMatches('enable', 'disable'));
  assert.ok(!ciscoLineMatches('show run', 'show vlan brief'));
  assert.ok(!ciscoLineMatches('interface fa0/1', 'interface fa0/2'));
});
test('accepts an explicit array of alternative phrasings', () => {
  assert.ok(ciscoLineMatches('no shutdown', ['no shutdown', 'no shut']));
  assert.ok(ciscoLineMatches('no shut', ['no shutdown', 'no shut']));
});

console.log('checkCiscoInput');
test('all lines correct, exact order, various abbreviations', () => {
  const input = 'en\nconf t\nvlan 20\nname Verwaltung\nexit\nint fa0/3\nswitchport mode access\nswitchport access vlan 20';
  const expected = ['enable', 'configure terminal', 'vlan 20', 'name Verwaltung', 'exit', 'interface fa0/3', 'switchport mode access', 'switchport access vlan 20'];
  const outcome = checkCiscoInput(input, expected);
  assert.equal(outcome.allCorrect, true);
  // "exit" is filtered out of both sides (see the dedicated tests below), so
  // one fewer result than the raw expected-lines count.
  assert.equal(outcome.results.length, expected.length - 1);
  assert.ok(outcome.results.every((r) => r.ok));
});
test('wrong order fails even if the same lines are all present', () => {
  const input = 'vlan 20\nenable';
  const expected = ['enable', 'vlan 20'];
  const outcome = checkCiscoInput(input, expected);
  assert.equal(outcome.allCorrect, false);
});
test('missing line is reported and fails', () => {
  const input = 'enable';
  const expected = ['enable', 'configure terminal'];
  const outcome = checkCiscoInput(input, expected);
  assert.equal(outcome.allCorrect, false);
  assert.equal(outcome.results[1].ok, false);
  assert.equal(outcome.results[1].userLine, undefined);
});
test('extra unexpected line fails and is reported', () => {
  const input = 'enable\nconfigure terminal\nhostname SW1';
  const expected = ['enable', 'configure terminal'];
  const outcome = checkCiscoInput(input, expected);
  assert.equal(outcome.allCorrect, false);
  assert.deepEqual(outcome.extraLines, ['hostname SW1']);
});
test('blank lines in the input are ignored', () => {
  const input = 'enable\n\n\nconfigure terminal';
  const expected = ['enable', 'configure terminal'];
  const outcome = checkCiscoInput(input, expected);
  assert.equal(outcome.allCorrect, true);
});
test('"exit" is optional: present or omitted are both correct', () => {
  const expected = ['vlan 20', 'name Gaeste', 'exit', 'vlan 30', 'name Produktion'];
  // With "exit" typed, exactly as authored.
  const withExit = checkCiscoInput('vlan 20\nname Gaeste\nexit\nvlan 30\nname Produktion', expected);
  assert.equal(withExit.allCorrect, true);
  // Real IOS behaviour: skip "exit" and go straight to the next "vlan" line.
  const withoutExit = checkCiscoInput('vlan 20\nname Gaeste\nvlan 30\nname Produktion', expected);
  assert.equal(withoutExit.allCorrect, true);
});
test('"ex" abbreviation for exit is also optional', () => {
  const expected = ['line console 0', 'exit', 'username admin secret Bundeswehr123'];
  assert.equal(checkCiscoInput('line console 0\nex\nusername admin secret Bundeswehr123', expected).allCorrect, true);
  assert.equal(checkCiscoInput('line console 0\nusername admin secret Bundeswehr123', expected).allCorrect, true);
});
test('extra "exit" lines the learner adds anywhere are never flagged as wrong', () => {
  const expected = ['vlan 10', 'name Verwaltung'];
  assert.equal(checkCiscoInput('exit\nvlan 10\nname Verwaltung\nexit', expected).allCorrect, true);
});
test('per-line alternatives array is supported inside a sequence', () => {
  const input = 'enable\nconfigure terminal\ncopy running-config startup-config';
  const expected = ['enable', 'configure terminal', ['write', 'copy running-config startup-config']];
  const outcome = checkCiscoInput(input, expected);
  assert.equal(outcome.allCorrect, true);
  const input2 = 'enable\nconfigure terminal\nwrite';
  assert.equal(checkCiscoInput(input2, expected).allCorrect, true);
});

console.log(`\n${passed} passed`);
if (process.exitCode) {
  console.error('SOME TESTS FAILED');
} else {
  console.log('ALL TESTS PASSED');
}
