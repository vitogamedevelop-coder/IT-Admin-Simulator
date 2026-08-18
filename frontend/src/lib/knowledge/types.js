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
