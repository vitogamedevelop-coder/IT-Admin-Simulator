// Mission planner for guided daily missions.
// Phase 0 reset: legacy module-based mission generation has been replaced
// with an empty placeholder. The new adaptive mission system will build
// missions from the skill tree / competency model instead of from static
// backend seed modules.
import { estimateMissionMinutes, readCompetencies } from './competency.js';

export function buildDailyMission() {
  const selected = [];
  const weakTopic = 'IT-Grundlagen';
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
    const mb = b.knowledge * 0.3 + b.application * 0.3 + b.stability * 0.2 + b.speed * 0.1;
    return ma - mb;
  });
  const [topic] = entries[0];
  return { path: '/mission', title: `${topic} trainieren`, reason: 'Diese Kompetenz bringt dir aktuell den größten Lernfortschritt.', minutes: 4 };
}
