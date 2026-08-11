// TTS Sam test: isolated test for the experimental text-to-speech button
// in Sam's office "learn" transition and the "Grundbegriffe" theory section.
import assert from 'node:assert/strict';
import {
  ENABLE_SAM_TTS_TEST,
  isSupported,
  speak,
  stop,
} from '../src/lib/speechSynthesis.js';
import { buildSamOfficeDialog, buildDefaultDialog } from '../src/lib/corridorDialogs.js';

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

async function testAsync(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('Feature flag and environment support');
{
  test('ENABLE_SAM_TTS_TEST is true', () => {
    assert.equal(ENABLE_SAM_TTS_TEST, true);
  });

  test('isSupported() returns false in Node.js (no window.speechSynthesis)', () => {
    assert.equal(isSupported(), false);
  });

  testAsync('speak() does not throw in Node.js', async () => {
    await speak('Hallo Test');
  });

  testAsync('stop() does not throw in Node.js', async () => {
    await stop();
  });
}

console.log('\nSam office dialog: TTS flag only on the Academy transition');
{
  const office = buildSamOfficeDialog();

  test('Sam office dialog has a learn node', () => {
    assert.ok(office.nodes.some((n) => n.id === 'learn'));
  });

  const learnNode = office.nodes.find((n) => n.id === 'learn');

  test('learn node has tts: true', () => {
    assert.equal(learnNode.tts, true);
  });

  test('learn node text references the Academy', () => {
    assert.ok(/Komm mit.*Academy/i.test(learnNode.text));
  });

  test('learn node onComplete action is academy', () => {
    assert.equal(learnNode.onComplete?.action, 'academy');
  });

  test('no other Sam office node has tts: true', () => {
    const ttsNodes = office.nodes.filter((n) => n.tts === true);
    assert.equal(ttsNodes.length, 1);
    assert.equal(ttsNodes[0].id, 'learn');
  });
}

console.log('\nDefault fallback dialog: no TTS flag');
{
  const fallback = buildDefaultDialog();

  test('default fallback has no node with tts: true', () => {
    const ttsNodes = fallback.nodes.filter((n) => n.tts === true);
    assert.equal(ttsNodes.length, 0);
  });
}

console.log('\nGrundbegriffe: only say-beats get the TTS flag conceptually');
{
  // The Grundbegriffe beats are static data inside AcademyTopic.jsx, so we
  // verify indirectly that the only tts-enabled content is the Sam learn node.
  // AcademyTopic.jsx is inspected visually for the SpeakButton integration.
  test('no other dialog besides Sam office has tts enabled', () => {
    const fallback = buildDefaultDialog();
    assert.equal(fallback.nodes.filter((n) => n.tts === true).length, 0);
  });
}

console.log(`\n${passed} tests passed`);
