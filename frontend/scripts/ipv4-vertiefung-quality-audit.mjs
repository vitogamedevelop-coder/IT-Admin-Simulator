import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';
import {
  prefixToSubnetMask, subnetMaskToPrefix, calculateNetworkId, calculateBroadcast,
  calculateFirstHost, calculateLastHost, calculateJumpSize, getSubnetBlockBounds,
} from '../src/lib/networking/ipv4Math.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';

const lesson = LESSONS['fundamentals/ipv4'];
assert(lesson, 'IPv4-Lektion ist registriert');
const serialized = JSON.stringify(lesson);
for (const term of ['Netzanteil', 'Hostanteil', 'Subnetzmaske', 'CIDR', 'Netz-ID', 'Broadcastadresse', 'Hostadressen', 'Sprungweite', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '127.0.0.1', '169.254.0.0/16', '255.255.255.255', '0.0.0.0/0']) {
  assert(serialized.includes(term), `Lektion enthält ${term}`);
}
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(serialized), 'kein sichtbarer Lehrgang-Metatext');
assert(serialized.includes('historisch') && serialized.includes('CIDR'), 'Netzklassen werden historisch von CIDR getrennt');
for (const sectionId of ['network-host-classic', 'mask-representations-classic', 'address-roles-classic', 'classful-classic', 'jump-intro-classic', 'private-classic']) {
  assert(lesson.explanations.some((entry) => entry.id === sectionId), `${sectionId} ist vorhanden`);
}
for (const sectionId of ['network-host-classic', 'mask-representations-classic', 'address-roles-classic']) {
  assert(lesson.explanations.find((entry) => entry.id === sectionId).blocks.some((block) => block.type === 'diagram'), `${sectionId} ist visualisiert`);
}
for (const exerciseId of ['ipv4-mask-cidr-22', 'ipv4-address-role-24', 'ipv4-special-addresses', 'ipv4-jump-size-27']) {
  assert(lesson.exercises.some((exercise) => exercise.id === exerciseId), `${exerciseId} ist vorhanden`);
}
const questions = collectQuestionsFromLesson(lesson, 'ipv4');
for (const facet of ['network-host', 'cidr', 'address-role', 'apipa', 'limited-broadcast', 'default-route', 'classful-cidr', 'block-size']) {
  assert(questions.some((question) => question.facet === facet), `Fragenfacet ${facet} ist vorhanden`);
}

for (let prefix = 0; prefix <= 32; prefix += 1) {
  const mask = prefixToSubnetMask(prefix).decimal;
  assert.equal(subnetMaskToPrefix(mask), prefix, `CIDR/Masken-Roundtrip /${prefix}`);
  if (prefix >= 1) assert.equal(calculateJumpSize(prefix), 2 ** (8 - (prefix % 8 || 8)), `Sprungweite /${prefix}`);
}
let state = 123456;
const random = () => ((state = (state * 16807) % 2147483647) - 1) / 2147483646;
for (let index = 0; index < 500; index += 1) {
  const prefix = 8 + Math.floor(random() * 23);
  const ip = `${1 + Math.floor(random() * 223)}.${Math.floor(random() * 256)}.${Math.floor(random() * 256)}.${1 + Math.floor(random() * 254)}`;
  const network = calculateNetworkId(ip, prefix);
  const broadcast = calculateBroadcast(ip, prefix);
  const first = calculateFirstHost(ip, prefix);
  const last = calculateLastHost(ip, prefix);
  const bounds = getSubnetBlockBounds(ip, prefix);
  assert.equal(network, bounds.network, `Netz-ID ${ip}/${prefix}`);
  assert.equal(broadcast, bounds.broadcast, `Broadcast ${ip}/${prefix}`);
  assert(Number(first.split('.').at(-1)) >= 0 && Number(last.split('.').at(-1)) <= 255, `Hostbereich ${ip}/${prefix}`);
}
const allItems = getAllKnowledgeItems();
assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length, 'keine Duplicate Knowledge IDs');
for (const id of ['ipv4.networkHost', 'ipv4.addressRoles', 'ipv4.limitedBroadcast', 'ipv4.defaultRoute', 'ipv4.classfulVsCidr', 'ipv4.blockSizeIntro']) {
  assert(allItems.some((item) => item.id === id), `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question, `${id} erzeugt eine Frage`);
    assert.deepEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}
console.log(`ipv4-vertiefung-quality-audit: PASS (33 prefixes, 500 random networks, ${lesson.exercises.length} exercises, ${questions.length} questions)`);
