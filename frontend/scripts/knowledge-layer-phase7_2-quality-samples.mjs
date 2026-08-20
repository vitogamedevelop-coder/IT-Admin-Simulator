import { generateQuestion } from '../src/lib/knowledge/index.js';
import { evaluateEmployeeAnswer } from '../src/lib/employeeConversations.js';

const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {}, location: { href: '' } };
global.document = { createElement: () => ({}) };

function sample(label, itemId, answerBuilder) {
  const q = generateQuestion(itemId, null, { contextType: 'coworker_question', seed: '0' });
  console.log(`\n## ${label}`);
  console.log(`Prompt: ${q.prompt}`);
  if (q.type === 'matching') {
    console.log(`Links: ${q.leftItems.map((l) => l.label).join(', ')}`);
    console.log(`Rechts: ${q.rightItems.map((r) => r.label).join(' | ')}`);
  } else if (q.type === 'ordering') {
    console.log(`Elemente: ${q.items.map((i) => i.label).join(', ')}`);
  }
  const answer = answerBuilder(q);
  const conv = { currentTopicKey: q.topicKey, employee: { id: 'sam' }, question: q, questions: [] };
  const res = evaluateEmployeeAnswer(conv, answer);
  console.log(`Bewertung: ${res.correct ? 'richtig' : 'falsch'}`);
  if (res.samExplanation) console.log(`Sam: ${res.samExplanation}`);
}

// 1. DNS Matching korrekt
sample('DNS Matching – korrekt', 'nb.dns.records', (q) => {
  const answer = {};
  q.correctPairs.forEach((p) => { answer[p.leftId] = p.rightId; });
  return answer;
});

// 2. DNS Matching mit A und CNAME vertauscht
sample('DNS Matching – A und CNAME vertauscht', 'nb.dns.records', (q) => {
  const answer = {};
  q.correctPairs.forEach((p) => { answer[p.leftId] = p.rightId; });
  const aId = q.leftItems.find((l) => l.label === 'A').id;
  const cnameId = q.leftItems.find((l) => l.label === 'CNAME').id;
  const aRight = q.rightItems.find((r) => r.label.includes('IPv4')).id;
  const cnameRight = q.rightItems.find((r) => r.label.includes('Alias')).id;
  answer[aId] = cnameRight;
  answer[cnameId] = aRight;
  return answer;
});

// 3. Anderes Matching (Cisco Speicher)
sample('Cisco Memory Mapping – korrekt', 'ct.grundlagen.memory', (q) => {
  const answer = {};
  q.correctPairs.forEach((p) => { answer[p.leftId] = p.rightId; });
  return answer;
});

// 4. OSI Ordering falsch
sample('OSI Ordering – erste zwei vertauscht', 'osi.encapsulationOrder', (q) => {
  const answer = [...q.correctOrderIds];
  [answer[0], answer[1]] = [answer[1], answer[0]];
  return answer;
});

// 5. Network Scope Ordering falsch
sample('Network Scope Ordering – WAN zuerst', 'nb.grundbegriffe.networkScopeOrder', (q) => {
  const answer = [...q.correctOrderIds];
  [answer[0], answer[3]] = [answer[3], answer[0]];
  return answer;
});

// 6. Binary Ordering falsch
sample('Binary Bit Values – erste zwei vertauscht', 'binary.bitValues', (q) => {
  const answer = [...q.correctOrderIds];
  [answer[0], answer[1]] = [answer[1], answer[0]];
  return answer;
});

console.log('\n✅ Phase 7.2 quality samples generated');
