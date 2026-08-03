// Determines the correct route for a quest based on whether it uses
// the new diagnostic gameplay loop or the legacy linear format.
import { diagnosticQuests } from './diagnosticQuestData.js';

export function questPath(questId) {
  if (diagnosticQuests[questId]) return `/diagnostic/${questId}`;
  return `/quest/${questId}`;
}
