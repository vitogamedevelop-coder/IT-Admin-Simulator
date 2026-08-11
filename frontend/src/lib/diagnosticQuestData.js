// Diagnostic Quest Data Format
// Generic and reusable for any quest that follows the diagnostic format.
// Phase 0 reset: legacy demo diagnostic quests have been removed.

export const diagnosticQuests = {};

export function diagnosticQuestById(id) {
  return diagnosticQuests[id] || null;
}
