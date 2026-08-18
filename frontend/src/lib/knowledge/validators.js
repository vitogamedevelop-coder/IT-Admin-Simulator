// =============================================================================
// Knowledge Layer – Validatoren
//
// Phase-1 validators check the shape and semantic consistency of Knowledge
// Items without requiring any UI or conversation integration.
// =============================================================================

import { ACADEMY_TOPICS, topicKey } from '../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from './types.js';
import { isAmbiguous } from './ambiguityChecker.js';

const VALID_KNOWLEDGE_TYPES = Object.values(KNOWLEDGE_TYPES);
const VALID_ARCHETYPES = Object.values(QUESTION_ARCHETYPES);
const VALID_DIFFICULTIES = Object.values(DIFFICULTY);

const VALID_TOPIC_KEYS = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));

// Concept clusters used in Phase 1. Later phases may expand this list.
const VALID_CONCEPT_CLUSTERS = new Set([
  'osi.layers',
  'osi.encapsulation',
  'osi.tcpipMapping',
  'binary.values',
  'binary.calculation',
  'binary.range',
  'ipv4.structure',
  'ipv4.ranges',
  'ipv4.special',
  'ipv4.cidr',
  'subnetting.mask',
  'subnetting.calculation',
  'switching.devices',
  'switching.macTable',
  'switching.actions',
  'switching.domains',
  'vlan.concept',
  'vlan.reasons',
  'vlan.ports',
  'ssh.protocol',
  'ssh.version',
  'ssh.procedure',
  'ssh.rsa',
  'ssh.vty',
  'ssh.svi',
  'ssh.reachability',
  'ssh.troubleshooting',
  'ssh.verification',
]);

const REQUIRED_FIELDS_PER_TYPE = {
  [KNOWLEDGE_TYPES.DEFINITION]: ['definition'],
  [KNOWLEDGE_TYPES.PROPERTY]: ['description'],
  [KNOWLEDGE_TYPES.RELATION]: ['description'],
  [KNOWLEDGE_TYPES.MAPPING]: ['description'],
  [KNOWLEDGE_TYPES.ORDER]: ['description'],
  [KNOWLEDGE_TYPES.COMPARE]: ['description', 'items'],
  [KNOWLEDGE_TYPES.CALCULATION]: ['description', 'calculator'],
  [KNOWLEDGE_TYPES.RANGE]: ['description'],
  [KNOWLEDGE_TYPES.PROCEDURE]: ['description', 'steps'],
  [KNOWLEDGE_TYPES.TROUBLESHOOT]: ['description'],
};

export class KnowledgeValidationError extends Error {
  constructor(message, itemId = null, field = null) {
    super(message);
    this.name = 'KnowledgeValidationError';
    this.itemId = itemId;
    this.field = field;
  }
}

/**
 * Validates a single Knowledge Item.
 * Returns an array of error messages (empty if valid).
 */
export function validateKnowledgeItem(item, allItemsById = {}) {
  const errors = [];
  const add = (field, message) => errors.push({ itemId: item.id, field, message });

  if (!item || typeof item !== 'object') {
    add(null, 'Item is not an object');
    return errors;
  }

  // id
  if (!item.id || typeof item.id !== 'string') {
    add('id', 'id is required and must be a string');
  } else if (!/^[a-z0-9_.-]+$/i.test(item.id)) {
    add('id', 'id must only contain letters, digits, dots, underscores and hyphens');
  }

  // topicKey
  if (!item.topicKey || typeof item.topicKey !== 'string') {
    add('topicKey', 'topicKey is required and must be a string');
  } else if (!VALID_TOPIC_KEYS.has(item.topicKey)) {
    add('topicKey', `topicKey "${item.topicKey}" does not exist in ACADEMY_TOPICS`);
  }

  // sourceTopicKey
  if (!item.sourceTopicKey || typeof item.sourceTopicKey !== 'string') {
    add('sourceTopicKey', 'sourceTopicKey is required');
  } else if (!VALID_TOPIC_KEYS.has(item.sourceTopicKey)) {
    add('sourceTopicKey', `sourceTopicKey "${item.sourceTopicKey}" does not exist in ACADEMY_TOPICS`);
  }

  // conceptCluster
  if (!item.conceptCluster || typeof item.conceptCluster !== 'string') {
    add('conceptCluster', 'conceptCluster is required');
  } else if (!VALID_CONCEPT_CLUSTERS.has(item.conceptCluster)) {
    add('conceptCluster', `conceptCluster "${item.conceptCluster}" is not in the phase-1 allowlist`);
  }

  // type
  if (!item.type || !VALID_KNOWLEDGE_TYPES.includes(item.type)) {
    add('type', `type must be one of ${VALID_KNOWLEDGE_TYPES.join(', ')}`);
  }

  // difficulty
  if (!item.difficulty || !VALID_DIFFICULTIES.includes(item.difficulty)) {
    add('difficulty', `difficulty must be one of ${VALID_DIFFICULTIES.join(', ')}`);
  }

  // allowedQuestionTypes
  if (!Array.isArray(item.allowedQuestionTypes) || item.allowedQuestionTypes.length === 0) {
    add('allowedQuestionTypes', 'allowedQuestionTypes must be a non-empty array');
  } else {
    item.allowedQuestionTypes.forEach((qt) => {
      if (!VALID_ARCHETYPES.includes(qt)) {
        add('allowedQuestionTypes', `"${qt}" is not a valid question archetype`);
      }
    });
  }

  // data
  if (!item.data || typeof item.data !== 'object') {
    add('data', 'data object is required');
  } else {
    const required = REQUIRED_FIELDS_PER_TYPE[item.type] || [];
    required.forEach((field) => {
      if (!(field in item.data)) {
        add(`data.${field}`, `data.${field} is required for type ${item.type}`);
      }
    });
  }

  // siblings
  if (item.siblings) {
    if (!Array.isArray(item.siblings)) {
      add('siblings', 'siblings must be an array of Knowledge Item IDs');
    } else {
      item.siblings.forEach((sib) => {
        if (Object.keys(allItemsById).length > 0 && !allItemsById[sib]) {
          add('siblings', `sibling "${sib}" is not a known Knowledge Item`);
        }
      });
    }
  }

  // relatedTopicKeys
  if (item.relatedTopicKeys) {
    if (!Array.isArray(item.relatedTopicKeys)) {
      add('relatedTopicKeys', 'relatedTopicKeys must be an array');
    } else {
      item.relatedTopicKeys.forEach((rtk) => {
        if (!VALID_TOPIC_KEYS.has(rtk)) {
          add('relatedTopicKeys', `relatedTopicKey "${rtk}" does not exist in ACADEMY_TOPICS`);
        }
      });
    }
  }

  return errors;
}

/**
 * Validates the whole registry.
 * Returns { ok: boolean, errors: [...], stats: {...} }
 */
export function validateKnowledgeRegistry(items) {
  const errors = [];
  const seenIds = new Set();
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  const stats = {
    total: items.length,
    byType: {},
    byTopic: {},
    byCluster: {},
  };

  items.forEach((item) => {
    // duplicate id check
    if (seenIds.has(item.id)) {
      errors.push({ itemId: item.id, field: 'id', message: `duplicate Knowledge Item id "${item.id}"` });
    }
    seenIds.add(item.id);

    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    stats.byTopic[item.topicKey] = (stats.byTopic[item.topicKey] || 0) + 1;
    stats.byCluster[item.conceptCluster] = (stats.byCluster[item.conceptCluster] || 0) + 1;

    const itemErrors = validateKnowledgeItem(item, byId);
    errors.push(...itemErrors);
  });

  return { ok: errors.length === 0, errors, stats };
}

/**
 * Convenience: validates the built-in registry from index.js.
 */
export async function validateBuiltinRegistry(getAllItemsFn) {
  const items = await getAllItemsFn();
  return validateKnowledgeRegistry(items);
}

// =============================================================================
// Question Instance validation
// =============================================================================

const REQUIRED_INSTANCE_FIELDS = [
  'instanceId',
  'topicKey',
  'knowledgeItemId',
  'conceptCluster',
  'questionArchetype',
  'difficulty',
  'prompt',
  'sourceTopicKey',
  'explanation',
];

/**
 * Validates a generated Question Instance.
 * Returns an array of error objects (empty if valid).
 */
export function validateQuestionInstance(instance) {
  const errors = [];
  const add = (field, message) => errors.push({ instanceId: instance.instanceId || null, field, message });

  if (!instance || typeof instance !== 'object') {
    add(null, 'Question Instance is not an object');
    return errors;
  }

  for (const field of REQUIRED_INSTANCE_FIELDS) {
    if (!(field in instance) || instance[field] === undefined || instance[field] === null) {
      add(field, `Required field "${field}" is missing or empty`);
    }
  }

  if (instance.questionArchetype && !VALID_ARCHETYPES.includes(instance.questionArchetype)) {
    add('questionArchetype', `Invalid archetype "${instance.questionArchetype}"`);
  }

  if (instance.difficulty && !VALID_DIFFICULTIES.includes(instance.difficulty)) {
    add('difficulty', `Invalid difficulty "${instance.difficulty}"`);
  }

  // Archetype-specific validation
  if (instance.questionArchetype === QUESTION_ARCHETYPES.ORDERING) {
    if (!Array.isArray(instance.items) || instance.items.length === 0) {
      add('items', 'Ordering question must have items');
    }
    if (!Array.isArray(instance.correctOrderIds) || instance.correctOrderIds.length !== instance.items?.length) {
      add('correctOrderIds', 'Ordering question must have correctOrderIds matching items length');
    }
  }

  if (instance.questionArchetype === QUESTION_ARCHETYPES.MATCHING) {
    if (!instance.pairs || !Array.isArray(instance.pairs.left) || !Array.isArray(instance.pairs.right)) {
      add('pairs', 'Matching question must have pairs.left and pairs.right arrays');
    }
    if (!Array.isArray(instance.correctPairs) || instance.correctPairs.length === 0) {
      add('correctPairs', 'Matching question must have non-empty correctPairs');
    }
  }

  // MC-compatible archetypes
  const mcArchetypes = [
    QUESTION_ARCHETYPES.RECALL,
    QUESTION_ARCHETYPES.MAPPING,
    QUESTION_ARCHETYPES.SELECT_BEST,
    QUESTION_ARCHETYPES.COMPARE,
    QUESTION_ARCHETYPES.SCENARIO,
    QUESTION_ARCHETYPES.TROUBLESHOOT,
    QUESTION_ARCHETYPES.CALCULATION,
    QUESTION_ARCHETYPES.INPUT,
  ];

  if (mcArchetypes.includes(instance.questionArchetype)) {
    if (!Array.isArray(instance.options) || instance.options.length < 2) {
      add('options', 'MC-compatible question must have at least two options');
    } else {
      const labels = instance.options.map((o) => String(o.label).trim().toLowerCase());
      const uniqueLabels = new Set(labels);
      if (uniqueLabels.size !== labels.length) {
        add('options', 'Duplicate option labels detected');
      }
      const hasCorrect = instance.options.some((o) => o.id === instance.correctOptionId);
      if (!hasCorrect) {
        add('correctOptionId', 'correctOptionId must reference one of the options');
      }
      const correctCount = instance.options.filter((o) => o.id === instance.correctOptionId).length;
      if (correctCount !== 1) {
        add('correctOptionId', 'Exactly one option must be marked as correct');
      }
    }
  }

  // Ambiguity checks
  if (isAmbiguous(instance)) {
    add('prompt', 'Question prompt is flagged as ambiguous');
  }

  return errors;
}

/**
 * Validates a batch of Question Instances.
 * Returns { ok: boolean, errors: [...], stats: {...} }
 */
export function validateQuestionInstances(instances) {
  const errors = [];
  const seenIds = new Set();
  const stats = { total: instances.length, byArchetype: {} };

  instances.forEach((instance) => {
    if (seenIds.has(instance.instanceId)) {
      errors.push({ instanceId: instance.instanceId, field: 'instanceId', message: `Duplicate instanceId "${instance.instanceId}"` });
    }
    seenIds.add(instance.instanceId);

    stats.byArchetype[instance.questionArchetype] = (stats.byArchetype[instance.questionArchetype] || 0) + 1;
    errors.push(...validateQuestionInstance(instance));
  });

  return { ok: errors.length === 0, errors, stats };
}
