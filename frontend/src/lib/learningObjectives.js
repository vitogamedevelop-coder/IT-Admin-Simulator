// Side mission / learning objective registry.
// Phase 0 reset: legacy demo objectives have been removed.

export const learningObjectives = [];
export const foundationalObjectives = [];

export function objectivesUnlocked(completedQuests) {
  return learningObjectives.filter((objective) => completedQuests.includes(objective.unlockQuest));
}

export function objectiveById(id) {
  return learningObjectives.find((objective) => objective.id === id);
}
