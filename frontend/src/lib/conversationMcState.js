/**
 * Determines the visual state of a single Multiple-Choice option after
 * (or before) evaluation in an employee conversation.
 *
 * Possible states:
 *   - 'neutral'              – not selected, not relevant after evaluation
 *   - 'selected'             – user's current choice before submission
 *   - 'correct'              – the factually correct option
 *   - 'incorrect-selected' – the option the user selected and it was wrong
 */
export function getMcOptionState({ optionId, selectedId, correctOptionId, submitted, isCorrect }) {
  if (!submitted) {
    return selectedId === optionId ? 'selected' : 'neutral';
  }
  if (isCorrect) {
    return selectedId === optionId ? 'correct' : 'neutral';
  }
  if (optionId === selectedId) return 'incorrect-selected';
  if (optionId === correctOptionId) return 'correct';
  return 'neutral';
}
