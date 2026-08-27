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

function assertTrue(value, message) {
  if (!value) throw new Error(message);
}

function answerForQuestion(q) {
  const answer = {};
  q.correctPairs.forEach((p) => { answer[p.leftId] = p.rightId; });
  return answer;
}

function findLeft(q, label) {
  return q.leftItems.find((l) => l.label === label)?.id;
}

function findRight(q, text) {
  return q.rightItems.find((r) => r.label.includes(text))?.id;
}

let seenAllFour = true;
let seenPromptContext = true;
let noObjectObject = true;
let correctEvaluatedTrue = true;
let partialEvaluatedFalse = true;
let partialFeedbackSpecific = true;

for (let seed = 0; seed < 20; seed += 1) {
  const q = generateQuestion('nb.dns.records', null, { contextType: 'coworker_question', seed: String(seed) });

  const labels = q.leftItems.map((l) => l.label);
  if (!['A', 'AAAA', 'CNAME', 'MX', 'PTR', 'SRV', 'SOA', 'NS'].every((l) => labels.includes(l))) seenAllFour = false;

  if (!q.prompt.toLowerCase().includes('dns') && !q.prompt.toLowerCase().includes('record')) seenPromptContext = false;
  assertTrue(q.rightItems.length === 8, 'right side has 8 descriptions');
  assertTrue(q.leftItems.length === 8, 'left side has 8 records');

  // Correct answer
  const correct = answerForQuestion(q);
  const convCorrect = { currentTopicKey: 'fundamentals/dns', employee: { id: 'sam' }, question: q, questions: [] };
  const resCorrect = evaluateEmployeeAnswer(convCorrect, correct);
  if (!resCorrect.correct) correctEvaluatedTrue = false;
  if (resCorrect.samExplanation.includes('[object Object]')) noObjectObject = false;

  // Swap A and CNAME, keep MX and PTR correct
  const aId = findLeft(q, 'A');
  const cnameId = findLeft(q, 'CNAME');
  const aRight = findRight(q, 'IPv4');
  const cnameRight = findRight(q, 'Alias');
  const partial = { ...correct };
  partial[aId] = cnameRight;
  partial[cnameId] = aRight;

  const convPartial = { currentTopicKey: 'fundamentals/dns', employee: { id: 'sam' }, question: q, questions: [] };
  const resPartial = evaluateEmployeeAnswer(convPartial, partial);
  if (resPartial.correct) partialEvaluatedFalse = false;
  if (resPartial.samExplanation.includes('[object Object]')) noObjectObject = false;
  const hasAError = resPartial.samExplanation.includes('A') && (resPartial.samExplanation.includes('IPv4') || resPartial.samExplanation.includes('Alias'));
  const hasCnameError = resPartial.samExplanation.includes('CNAME') && (resPartial.samExplanation.includes('IPv4') || resPartial.samExplanation.includes('Alias'));
  const hasCorrectPraise = resPartial.samExplanation.includes('MX') && resPartial.samExplanation.includes('PTR');
  if (!(hasAError && hasCnameError && hasCorrectPraise)) partialFeedbackSpecific = false;
}

assertTrue(seenAllFour, 'all four DNS records appear in every seed');
assertTrue(seenPromptContext, 'prompt references DNS/records context');
assertTrue(noObjectObject, 'feedback never contains [object Object]');
assertTrue(correctEvaluatedTrue, 'correct answer is evaluated as correct');
assertTrue(partialEvaluatedFalse, 'partially wrong answer is evaluated as incorrect');
assertTrue(partialFeedbackSpecific, 'partial feedback names swapped records and praises correct ones');

console.log('✅ Phase 7.2 DNS matching regression test passed');
