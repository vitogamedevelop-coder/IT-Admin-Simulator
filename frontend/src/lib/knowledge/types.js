// =============================================================================
// NEXUS Knowledge Layer – shared constants
//
// Kept in a separate file to avoid circular imports between the registry and
// the individual knowledge-item modules.
// =============================================================================

export const KNOWLEDGE_TYPES = {
  DEFINITION: 'DEFINITION',
  PROPERTY: 'PROPERTY',
  RELATION: 'RELATION',
  MAPPING: 'MAPPING',
  ORDER: 'ORDER',
  COMPARE: 'COMPARE',
  CALCULATION: 'CALCULATION',
  RANGE: 'RANGE',
  PROCEDURE: 'PROCEDURE',
  TROUBLESHOOT: 'TROUBLESHOOT',
};

export const QUESTION_ARCHETYPES = {
  RECALL: 'recall',
  MAPPING: 'mapping',
  MATCHING: 'matching',
  ORDERING: 'ordering',
  SELECT_BEST: 'select-best',
  INPUT: 'input',
  COMPARE: 'compare',
  SCENARIO: 'scenario',
  TROUBLESHOOT: 'troubleshoot',
  CALCULATION: 'calculation',
};

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// -----------------------------------------------------------------------------
// Conversation rendering metadata
// -----------------------------------------------------------------------------

export const PROMPT_STYLES = {
  BARE: 'bare',                     // plain question core; composer may add a neutral lead
  SELF_CONTAINED: 'self-contained', // full employee utterance; composer renders as-is
  SCENARIO: 'scenario',             // full scenario-based employee utterance
};

export const CONTEXT_DEPENDENCIES = {
  NEUTRAL: 'neutral',     // no scenario constraints; any neutral lead works
  SCENARIO: 'scenario',   // lead/scenario must semantically fit the question
  PARAMETRIC: 'parametric', // generated parameters constrain which scenarios are valid
};

// -----------------------------------------------------------------------------
// Facet mastery scoring
// -----------------------------------------------------------------------------

export const FACET_MASTERY = {
  MIN_SCORE: -5,
  MAX_SCORE: 5,
  DEFAULT_SCORE: 0,
  CORRECT_DELTA: 1,
  WRONG_DELTA: -1,
  // Minimum number of other questions before a facet may reappear, by score.
  MIN_GAP_BY_SCORE: {
    '-5': 2,
    '-4': 2,
    '-3': 3,
    '-2': 3,
    '-1': 4,
    '0': 5,
    '1': 7,
    '2': 9,
    '3': 12,
    '4': 16,
    '5': 20,
  },
  MAX_GAP: 20,
};
