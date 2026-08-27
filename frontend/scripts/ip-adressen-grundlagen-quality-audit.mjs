import assert from 'node:assert/strict';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import {
  decimalToBinary, binaryToDecimal, decimalToHex, hexToDecimal, binaryToHex, hexToBinary,
  decimalToOctal, octalToDecimal, decimalToIpv4Binary, ipv4BinaryToDecimal,
} from '../src/lib/networking/numberSystems.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';

const binaryTopic = ACADEMY_TOPICS.find((topic) => topic.categoryId === 'fundamentals' && topic.topicId === 'binary-system');
const ipTopic = ACADEMY_TOPICS.find((topic) => topic.categoryId === 'fundamentals' && topic.topicId === 'ipv4');
assert(binaryTopic && ipTopic, 'bestehende Topics werden verwendet');
assert.deepEqual(ipTopic.prerequisites, ['tcp-ip-model', 'binary-system'], 'Zahlensysteme liegen vor IP-Adressen');
const binaryLesson = LESSONS['fundamentals/binary-system'];
const ipLesson = LESSONS['fundamentals/ipv4'];
assert(binaryLesson && ipLesson, 'beide Lektionen sind registriert');

const binaryText = JSON.stringify(binaryLesson);
const ipText = JSON.stringify(ipLesson);
for (const [term, text] of [
  ['Basis 2', binaryText], ['Basis 10', binaryText], ['Basis 16', binaryText], ['Basis 8', binaryText],
  ['128, 64, 32, 16, 8, 4, 2, 1', binaryText], ['vier Binärbits', binaryText],
  ['32 Bit', ipText], ['128 Bit', ipText], ['Dezimalpunktschreibweise', ipText], ['Hexadezimal', ipText],
  ['Layer 3', ipText], ['MAC-Adresse', ipText],
]) assert(text.toLocaleLowerCase('de-DE').includes(term.toLocaleLowerCase('de-DE')), `${term} ist abgedeckt`);
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(binaryText + ipText), 'kein sichtbarer Lehrgang-Metatext');
assert(binaryLesson.exercises.some((exercise) => exercise.type === 'adaptive-number-systems'), 'adaptiver Rechentrainer ist vorhanden');
assert(ipLesson.exercises.some((exercise) => exercise.id === 'ipv4-to-binary'), 'IPv4 zu Binär ist vorhanden');
assert(ipLesson.exercises.some((exercise) => exercise.id === 'binary-to-ipv4'), 'Binär zu IPv4 ist vorhanden');

let state = 90210;
const random = () => ((state = (state * 16807) % 2147483647) - 1) / 2147483646;
for (let index = 0; index < 500; index += 1) {
  const value = Math.floor(random() * 65536);
  assert.equal(binaryToDecimal(decimalToBinary(value)), value, `Binär-Roundtrip ${value}`);
  assert.equal(hexToDecimal(decimalToHex(value)), value, `Hex-Roundtrip ${value}`);
  assert.equal(octalToDecimal(decimalToOctal(value)), value, `Oktal-Roundtrip ${value}`);
  const bits = decimalToBinary(value, Math.max(1, Math.ceil(decimalToBinary(value).length / 4) * 4));
  assert.equal(hexToBinary(binaryToHex(bits)), bits, `Binär-Hex-Roundtrip ${value}`);
  const ip = `${Math.floor(random() * 256)}.${Math.floor(random() * 256)}.${Math.floor(random() * 256)}.${Math.floor(random() * 256)}`;
  assert.equal(ipv4BinaryToDecimal(decimalToIpv4Binary(ip)), ip, `IPv4-Roundtrip ${ip}`);
}

const allItems = getAllKnowledgeItems();
assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length, 'keine Duplicate Knowledge IDs');
for (const id of ['binary.numberSystems', 'binary.hexRelation', 'ipv4.definition', 'ipv4.ipVsMac', 'ipv4.ipVersions']) {
  assert(allItems.some((item) => item.id === id), `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question, `${id} erzeugt eine Frage`);
    assert.deepEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}
console.log(`ip-adressen-grundlagen-quality-audit: PASS (500 conversion sets, ${binaryLesson.exercises.length} number exercises, ${ipLesson.exercises.length} IP exercises)`);
