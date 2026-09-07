import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

import {
  recordSectionCompletion,
  recordQuestionAnswer,
  recordExerciseCompletion,
  recordLessonCompletion,
} from '../src/lib/academyEngine.js';
import { getTopicProgress } from '../src/lib/academyProgress.js';

console.log('Topic status + evidence integration tests...');

const CAT = 'fundamentals';
const TOPIC = 'osi-model';

function status() {
  return getTopicProgress(CAT, TOPIC).status;
}

store.clear();

// 1. Fresh topic is available (or started after lesson start)
const startStatus = status();
assert.ok(['available', 'started'].includes(startStatus), `initial status acceptable: ${startStatus}`);

// 2. Viewing/completing sections still drives theoryCompletion; status may move to started
recordSectionCompletion(CAT, TOPIC, 'intro', 'Einführung', 5);
recordSectionCompletion(CAT, TOPIC, 'layer1', 'Schicht 1', 5);
assert.equal(getTopicProgress(CAT, TOPIC).theoryCompletion, 40, 'theoryCompletion 2/5');

// 3. Correct questions do not break status computation
recordQuestionAnswer(CAT, TOPIC, 'q1', 'theory', true, 'recognized', ['osi.layer1.name']);
recordQuestionAnswer(CAT, TOPIC, 'q2', 'theory', true, 'recognized', ['osi.layer2.name']);
const s = status();
assert.ok(['available', 'started', 'learned'].includes(s), `status stable after questions: ${s}`);

// 4. Exercises still award practiceScore
const beforePractice = getTopicProgress(CAT, TOPIC).practiceScore;
recordExerciseCompletion(CAT, TOPIC, 'ex1', 'understood', ['osi.ordering']);
const afterPractice = getTopicProgress(CAT, TOPIC).practiceScore;
assert.ok(afterPractice > beforePractice, 'practiceScore increased');

// 5. Lesson completion remains possible and sets theoryCompletion 100
recordLessonCompletion(CAT, TOPIC, 'classic');
assert.equal(getTopicProgress(CAT, TOPIC).theoryCompletion, 100, 'lesson completion sets theoryCompletion 100');

console.log('All topic status + evidence integration tests passed.');
