import { modules } from './localData.js';
import { estimateMissionMinutes, readCompetencies, topicForQuestion } from './competency.js';

function allQuestions() {
  return modules.flatMap((module) => (module.questions || []).map((question) => ({
    ...question,
    options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options,
    moduleId: module.id,
    moduleTitle: module.title,
    facultyId: module.faculty_id,
    topic: topicForQuestion(question, module),
  })));
}

function scoreQuestion(question, competency, index) {
  const topic = competency.topics[question.topic];
  const mastery = topic ? topic.knowledge * 0.4 + topic.application * 0.3 + topic.stability * 0.2 + topic.speed * 0.1 : 0.1;
  const due = !topic?.nextReview || topic.nextReview <= Date.now();
  const difficulty = Number(question.difficulty) || 2;
  const desiredDifficulty = index === 0 ? 1.5 : index === 4 ? 2 : Math.min(4, 1 + mastery * 4);
  const scenarioBonus = index === 2 && question.type === 'scenario' ? 1.5 : 0;
  const reviewBonus = index === 3 && due ? 1.2 : 0;
  return Math.abs(difficulty - desiredDifficulty) - scenarioBonus - reviewBonus + mastery;
}

export function buildDailyMission(length = 5) {
  const competency = readCompetencies();
  const pool = allQuestions();
  const selected = [];
  for (let index = 0; index < Math.min(length, pool.length); index += 1) {
    const candidates = pool.filter((question) => !selected.some((item) => item.id === question.id));
    candidates.sort((a, b) => scoreQuestion(a, competency, index) - scoreQuestion(b, competency, index));
    const top = candidates.slice(0, Math.min(4, candidates.length));
    selected.push(top[Math.floor(Math.random() * top.length)]);
  }
  const weakTopic = selected[0]?.topic || 'IT-Grundlagen';
  return {
    title: `${weakTopic} festigen`,
    description: 'Kurze geführte Mission aus Einstieg, Anwendung, Wiederholung und Abschluss.',
    questions: selected,
    minutes: estimateMissionMinutes(selected),
  };
}

export function nextRecommendation() {
  const competency = readCompetencies();
  const entries = Object.entries(competency.topics);
  if (entries.length === 0) return { path: '/mission', title: 'Grundlagen-Mission starten', reason: 'Die App lernt dabei dein aktuelles Niveau kennen.', minutes: 4 };
  entries.sort(([, a], [, b]) => {
    const ma = a.knowledge * 0.4 + a.application * 0.3 + a.stability * 0.2 + a.speed * 0.1;
    const mb = b.knowledge * 0.4 + b.application * 0.3 + b.stability * 0.2 + b.speed * 0.1;
    return ma - mb;
  });
  const [topic] = entries[0];
  return { path: '/mission', title: `${topic} trainieren`, reason: 'Diese Kompetenz bringt dir aktuell den größten Lernfortschritt.', minutes: 4 };
}
