// Mission Hint System (Mission System V2)
//
// Provides several escalating hint levels.  Every used hint level is stored
// in the skill profile so weak skills reappear later.
//
// Flow: Problem -> self-diagnose -> targeted hint -> stronger hint ->
//       solution -> skill gets a "helped" event -> similar skill reappears.

import { recordSkillEvent, SKILL_DIMENSION } from './skillTree.js';

export const HINT_LEVEL = {
  NONE: 0,
  NUDGE: 1,      // "Prüfe den Zustand des Interfaces."
  FOCUS: 2,      // "Das Interface ist administratively down."
  DIRECTIVE: 3,  // "Welcher Cisco-Befehl aktiviert ein administrativ deaktiviertes Interface?"
  SOLUTION: 4,   // "no shutdown" plus full explanation
};

export const HINT_LEVEL_LABELS = {
  [HINT_LEVEL.NONE]: 'Kein Hinweis',
  [HINT_LEVEL.NUDGE]: 'Erster Hinweis',
  [HINT_LEVEL.FOCUS]: 'Gezielter Hinweis',
  [HINT_LEVEL.DIRECTIVE]: 'Anweisung',
  [HINT_LEVEL.SOLUTION]: 'Lösung',
};

// A hint ladder for a specific subskill or mission task.
// Each level contains:
//   text      – what Sam/NPC says
//   level     – escalation level
//   cost      – future impact on skill mastery (solution costs more)
//   solution  – for HINT_LEVEL.SOLUTION: the exact answer + explanation
export function defineHintLadder({ subskillPath, nudge, focus, directive, solution }) {
  return {
    subskillPath,
    steps: [
      { level: HINT_LEVEL.NUDGE, text: nudge, cost: 0.05 },
      { level: HINT_LEVEL.FOCUS, text: focus, cost: 0.10 },
      { level: HINT_LEVEL.DIRECTIVE, text: directive, cost: 0.20 },
      { level: HINT_LEVEL.SOLUTION, text: solution.answer, explanation: solution.explanation, cost: 0.40 },
    ],
  };
}

// Example ladder for the classic "no shutdown" misconception.
export const HINT_NO_SHUTDOWN = defineHintLadder({
  subskillPath: 'cisco.basic_configuration.interface_enable',
  nudge: 'Prüfe den Zustand des Interfaces.',
  focus: 'Das Interface ist administratively down.',
  directive: 'Welcher Cisco-Befehl aktiviert ein administrativ deaktiviertes Interface?',
  solution: {
    answer: 'no shutdown',
    explanation: 'Cisco-Interfaces sind im Auslieferungszustand administrativ deaktiviert. Mit "no shutdown" wird das Interface aktiviert. "show ip interface brief" zeigt danach den Status up/up.',
  },
});

// Per-mission hint state.  The runtime stores which hints have already been
// requested for the current task/mission.
export function createHintState(ladders = []) {
  return {
    ladders: Object.fromEntries(ladders.map((l) => [l.subskillPath, { ...l, currentLevel: HINT_LEVEL.NONE }])),
    history: [],
  };
}

export function getNextHint(state, subskillPath) {
  const ladder = state.ladders[subskillPath];
  if (!ladder) return null;
  const next = ladder.steps.find((s) => s.level > ladder.currentLevel);
  if (!next) return null;
  return next;
}

export function consumeHint(state, subskillPath, domainId, skillId, subskillId) {
  const ladder = state.ladders[subskillPath];
  if (!ladder) return state;
  const next = ladder.steps.find((s) => s.level > ladder.currentLevel);
  if (!next) return state;

  ladder.currentLevel = next.level;
  state.history.push({
    subskillPath,
    level: next.level,
    text: next.text,
    at: Date.now(),
  });

  // Record the help event in the skill tree.  If the player asked for the
  // full solution, mark it as a revealedSolution event so it does NOT count
  // as an independent successful application.
  const isSolution = next.level === HINT_LEVEL.SOLUTION;
  recordSkillEvent(domainId, skillId, subskillId, {
    dimension: SKILL_DIMENSION.CONFIGURE,
    revealedSolution: isSolution,
    usedHint: !isSolution,
    correct: isSolution,
    hintLevel: next.level,
    hintText: next.text,
  });

  return state;
}

// Full solution view.  Always records a revealedSolution event.
export function revealSolution(state, subskillPath, domainId, skillId, subskillId, { answer, explanation, verificationCommand }) {
  state.history.push({
    subskillPath,
    level: HINT_LEVEL.SOLUTION,
    text: answer,
    explanation,
    verificationCommand,
    at: Date.now(),
  });

  recordSkillEvent(domainId, skillId, subskillId, {
    dimension: SKILL_DIMENSION.CONFIGURE,
    revealedSolution: true,
    correct: false,
    solutionText: answer,
    verificationCommand,
  });

  return state;
}

// Generates the final explanation text when the solution is revealed.
// The player should understand what was wrong, why the solution works,
// where the error was visible and which verification command would have helped.
export function buildSolutionExplanation({
  whatWasWrong,
  whyItWorks,
  whereToRecognize,
  verificationCommand,
}) {
  return [
    `Fehler: ${whatWasWrong}`,
    `Lösung: ${whyItWorks}`,
    `Erkennbar an: ${whereToRecognize}`,
    `Verifikation: ${verificationCommand}`,
  ].join('\n\n');
}

// Helper to avoid "needle in a haystack" situations.  If a player is stuck
// because of a single forgotten command, the runtime can offer a diagnostic
// hint chain without immediately giving the answer.
export function stuckHintFor(subskillPath, context = {}) {
  if (subskillPath === 'cisco.basic_configuration.interface_enable') return HINT_NO_SHUTDOWN;
  // More ladders will be added as concrete missions are built.
  return defineHintLadder({
    subskillPath,
    nudge: 'Sammle noch einmal die Fakten. Welche Symptome siehst du?',
    focus: `Das Problem liegt wahrscheinlich bei ${context.suspectedSkill || 'dem aktuellen Thema'}.`,
    directive: 'Welcher Befehl würde an dieser Stelle helfen?',
    solution: { answer: context.answer || '', explanation: context.explanation || '' },
  });
}
