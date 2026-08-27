import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';

const basicConfigKey = topicKey('cisco-packet-tracer', 'basic-device-configuration');
const lesson = LESSONS[basicConfigKey];
const allTexts = [
  ...(lesson?.explanations || []).flatMap((e) => e.blocks.map((b) => b.content || b.title || JSON.stringify(b.rows || b.items || b.options || []))),
  ...(lesson?.exercises || []).map((e) => `${e.id} ${e.question} ${e.explanation}`),
  ...(lesson?.quiz || []).map((q) => `${q.question} ${q.explanation}`),
  ...(lesson?.cliTasks || []).map((t) => `${t.prompt} ${t.explanation}`),
].join(' ');

function covers(text, ...phrases) {
  const t = text.toLowerCase();
  return phrases.some((p) => t.includes(p.toLowerCase()));
}

console.log('length', allTexts.length);
console.log('no shutdown present?', allTexts.toLowerCase().includes('no shutdown'));
console.log('covers no?', covers(allTexts, 'no ', 'no-'));
console.log('covers hostname?', covers(allTexts, 'hostname'));
console.log('first 200 chars:', allTexts.slice(0, 200));
