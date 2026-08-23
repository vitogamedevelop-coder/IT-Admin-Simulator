// =============================================================================
// Knowledge Layer – Validatoren
//
// Phase-1 validators check the shape and semantic consistency of Knowledge
// Items without requiring any UI or conversation integration.
// =============================================================================

import { ACADEMY_TOPICS, topicKey } from '../academyTopics.js';
import {
  KNOWLEDGE_TYPES,
  QUESTION_ARCHETYPES,
  DIFFICULTY,
  PROMPT_STYLES,
  CONTEXT_DEPENDENCIES,
} from './types.js';
import { isAmbiguous } from './ambiguityChecker.js';

const VALID_KNOWLEDGE_TYPES = Object.values(KNOWLEDGE_TYPES);
const VALID_ARCHETYPES = Object.values(QUESTION_ARCHETYPES);
const VALID_DIFFICULTIES = Object.values(DIFFICULTY);

const VALID_TOPIC_KEYS = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));

// Concept clusters are validated by the registry they belong to: any well-formed
// dotted identifier (e.g. "domain.subdomain" or "security.cia") is accepted.

const REQUIRED_FIELDS_PER_TYPE = {
  [KNOWLEDGE_TYPES.DEFINITION]: ['definition'],
  [KNOWLEDGE_TYPES.PROPERTY]: ['description'],
  [KNOWLEDGE_TYPES.RELATION]: ['description'],
  [KNOWLEDGE_TYPES.MAPPING]: ['description'],
  [KNOWLEDGE_TYPES.ORDER]: ['description'],
  [KNOWLEDGE_TYPES.COMPARE]: ['description', 'items'],
  [KNOWLEDGE_TYPES.CALCULATION]: ['description', 'calculationFamily'],
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
  const CLUSTER_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*(?:\.[a-zA-Z][a-zA-Z0-9_-]*)+$/;
  if (!item.conceptCluster || typeof item.conceptCluster !== 'string') {
    add('conceptCluster', 'conceptCluster is required');
  } else if (!CLUSTER_PATTERN.test(item.conceptCluster)) {
    add('conceptCluster', `conceptCluster "${item.conceptCluster}" must be a dotted, alphanumeric cluster identifier (e.g. "domain.subdomain")`);
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

const VALID_PROMPT_STYLES = Object.values(PROMPT_STYLES);
const VALID_CONTEXT_DEPENDENCIES = Object.values(CONTEXT_DEPENDENCIES);

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

      // Phase 6: avoid mixing numeric and non-numeric options (giveaway risk).
      const numericLabels = labels.filter((l) => /^\d+([.,]\d+)?$/.test(l));
      if (numericLabels.length > 0 && numericLabels.length < labels.length) {
        add('options', 'Mixed numeric/non-numeric option labels may give away the answer');
      }

      // Phase 6: full-sentence options should have similar lengths to avoid a giveaway.
      const sentenceLabels = instance.options.filter((o) => {
        const t = String(o.label).trim();
        return /[.!?]$/.test(t) && t.split(/\s+/).length >= 3;
      });
      if (sentenceLabels.length > 0 && sentenceLabels.length === labels.length) {
        const lengths = labels.map((l) => l.split(/\s+/).length);
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const maxDev = Math.max(...lengths.map((l) => Math.abs(l - avg)));
        if (maxDev > 8) {
          add('options', `Full-sentence option lengths vary too much (max deviation ${maxDev.toFixed(1)} words)`);
        }
      }
    }
  }

  // Answer format sanity (optional field used by calculation/input questions)
  if (instance.answerFormat) {
    const allowedTypes = ['binary', 'number', 'ipv4-address', 'ipv4-mask', 'prefix', 'text'];
    if (!allowedTypes.includes(instance.answerFormat.type)) {
      add('answerFormat.type', `Unknown answer format type "${instance.answerFormat.type}"`);
    }
  }

  // Calculation params sanity (optional)
  if (instance.calculationParams) {
    if (typeof instance.calculationParams !== 'object') {
      add('calculationParams', 'calculationParams must be an object');
    }
  }

  // Conversation metadata
  if (instance.promptStyle && !VALID_PROMPT_STYLES.includes(instance.promptStyle)) {
    add('promptStyle', `Invalid promptStyle "${instance.promptStyle}"`);
  }
  if (instance.contextDependency && !VALID_CONTEXT_DEPENDENCIES.includes(instance.contextDependency)) {
    add('contextDependency', `Invalid contextDependency "${instance.contextDependency}"`);
  }
  if (instance.contextDependency === CONTEXT_DEPENDENCIES.SCENARIO && !instance.conversationText) {
    add('conversationText', 'Scenario-style questions must provide a conversationText');
  }

  // Single-owner language check: avoid stacked actor phrases.
  if (instance.conversationText) {
    const actorPhrases = ['Ein Techniker meldet', 'Ein Techniker stellt fest', 'Ein Kollege fragt', 'Ein Kollege berichtet'];
    const found = actorPhrases.filter((phrase) => instance.conversationText.includes(phrase));
    if (found.length > 1) {
      add('conversationText', `Multiple actor phrases detected: ${found.join(', ')}`);
    }
  }

  // Ambiguity checks
  if (isAmbiguous(instance)) {
    add('prompt', 'Question prompt is flagged as ambiguous');
  }

  return errors;
}

/**
 * Validates a generated Question Instance specifically for conversation rendering.
 * Checks semantic coherence between prompt, conversationText, and context metadata.
 */
export function validateConversationInstance(instance) {
  const errors = validateQuestionInstance(instance);
  const add = (field, message) => errors.push({ instanceId: instance.instanceId || null, field, message });

  if (instance.contextDependency === CONTEXT_DEPENDENCIES.PARAMETRIC && instance.calculationParams) {
    const params = instance.calculationParams;
    const text = instance.conversationText || instance.prompt || '';
    // Binary calculation context must not claim a non-mask value is a subnet mask octet.
    if (params.decimal !== undefined && text.includes('Subnetzmaske')) {
      const maskOctets = [0, 128, 192, 224, 240, 248, 252, 254, 255];
      if (!maskOctets.includes(params.decimal)) {
        add('conversationText', `Value ${params.decimal} is not a valid subnet mask octet, but the scenario claims a subnet mask context`);
      }
    }
  }

  return errors;
}

// Broader semantic domains used for distractor plausibility. Distractors may
// come from any cluster within the same group; only distractors from a
// different group are flagged as cross-domain.
const DISTRACTOR_DOMAIN_GROUPS = [
  ['grundbegriffe', 'topologien', 'kommunikation', 'tcpudp', 'dns', 'dhcp', 'routing', 'vlsm', 'supernetting'],
  ['cisco'],
  ['osi'],
  ['binary', 'ipv4', 'subnetting', 'switching', 'vlan', 'ssh'],
];

function getDistractorDomain(cluster) {
  const prefix = cluster.split('.')[0];
  return DISTRACTOR_DOMAIN_GROUPS.find((g) => g.includes(prefix));
}

/**
 * Validates that MC distractors for a Knowledge Item do not leak in from a
 * completely unrelated concept domain. Distractors from the same broader domain
 * (e.g. DNS vs. DHCP, MAC vs. IP) are allowed. Returns an array of issue objects.
 */
export function validateDistractorDomain(question, item, allItemsById) {
  const issues = [];
  if (question.type !== 'mc' || !question.options) return issues;
  const correctCluster = item?.conceptCluster;
  if (!correctCluster) return issues;
  const correctDomain = getDistractorDomain(correctCluster);
  for (const opt of question.options) {
    if (opt.id === question.correctOptionId) continue;
    // Try to find which item a distractor label came from.
    const source = Object.values(allItemsById).find((i) => {
      if (i.id === item.id) return false;
      const sibLabel = i.data?.definition || i.data?.description;
      return sibLabel && sibLabel === opt.label;
    });
    if (!source) continue;
    if (source.conceptCluster === correctCluster) continue;
    const sourceDomain = getDistractorDomain(source.conceptCluster);
    if (correctDomain && sourceDomain && correctDomain === sourceDomain) continue;
    issues.push({ type: 'cross-domain-distractor', option: opt.label, sourceItem: source.id, sourceCluster: source.conceptCluster, correctCluster });
  }
  return issues;
}

/**
 * Validates that ordering item labels do not leak their target position
 * (e.g. "2. Foo", "zweite", "1."). Returns an array of issue objects.
 */
export function validateOrderingPositionLeak(question) {
  const issues = [];
  if (question.type !== 'ordering' || !Array.isArray(question.items)) return issues;
  const leakPatterns = [
    /^\d+\.\s/, // leading "2. "
    /^\d+\s/,   // leading number
    /\b(erste|zweite|dritte|vierte|fünfte|sechste|siebte|achte)\b/i,
    /\b(1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.)\b/,
  ];
  for (const it of question.items) {
    const label = it.label || '';
    if (leakPatterns.some((re) => re.test(label))) {
      issues.push({ type: 'ordering-position-leak', itemId: it.id, label });
    }
  }
  return issues;
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

// =============================================================================
// Phase 7.2 – Solvability validators for structured question types
// =============================================================================

function labelIsUsable(label) {
  return typeof label === 'string' && label.trim().length > 0 && !label.includes('[object Object]');
}

export function validateSolvability(question) {
  const issues = [];

  // Generic sanity: no object-Object leaks anywhere
  const json = JSON.stringify(question);
  if (json.includes('[object Object]')) {
    issues.push({ type: 'object-object-leak', message: 'Question contains the literal "[object Object]"' });
  }

  if (question.type === 'matching') {
    const leftItems = Array.isArray(question.leftItems) ? question.leftItems : [];
    const rightItems = Array.isArray(question.rightItems) ? question.rightItems : [];
    const correctPairs = Array.isArray(question.correctPairs) ? question.correctPairs : [];

    if (leftItems.length < 2) issues.push({ type: 'unsolvable-matching', message: `Only ${leftItems.length} left item(s)` });
    if (rightItems.length < 2) issues.push({ type: 'unsolvable-matching', message: `Only ${rightItems.length} right item(s)` });
    if (correctPairs.length === 0) issues.push({ type: 'unsolvable-matching', message: 'No correct pairs defined' });

    const leftIds = new Set();
    const rightIds = new Set();

    leftItems.forEach((it, i) => {
      if (!it?.id) issues.push({ type: 'invalid-matching-item', index: i, message: 'Left item has no id' });
      if (!labelIsUsable(it?.label)) issues.push({ type: 'invalid-matching-item', index: i, message: `Left item ${i} has unusable label` });
      if (leftIds.has(it.id)) issues.push({ type: 'duplicate-id', id: it.id, message: `Duplicate left id ${it.id}` });
      leftIds.add(it.id);
    });

    rightItems.forEach((it, i) => {
      if (!it?.id) issues.push({ type: 'invalid-matching-item', index: i, message: 'Right item has no id' });
      if (!labelIsUsable(it?.label)) issues.push({ type: 'invalid-matching-item', index: i, message: `Right item ${i} has unusable label` });
      if (rightIds.has(it.id)) issues.push({ type: 'duplicate-id', id: it.id, message: `Duplicate right id ${it.id}` });
      rightIds.add(it.id);
    });

    correctPairs.forEach((p, i) => {
      const leftId = p?.leftId ?? p?.left;
      const rightId = p?.rightId ?? p?.right;
      if (!leftId || !rightId) {
        issues.push({ type: 'invalid-correct-pair', index: i, message: `Pair ${i} is missing ids` });
      } else {
        if (!leftIds.has(leftId)) issues.push({ type: 'invalid-correct-pair', index: i, message: `Left id ${leftId} not in leftItems` });
        if (!rightIds.has(rightId)) issues.push({ type: 'invalid-correct-pair', index: i, message: `Right id ${rightId} not in rightItems` });
      }
    });
  }

  if (question.type === 'ordering') {
    const items = Array.isArray(question.items) ? question.items : [];
    const correctOrderIds = Array.isArray(question.correctOrderIds) ? question.correctOrderIds : [];

    if (items.length < 2) issues.push({ type: 'unsolvable-ordering', message: `Only ${items.length} ordering item(s)` });
    if (correctOrderIds.length !== items.length) {
      issues.push({ type: 'invalid-ordering-answer', message: `correctOrderIds length ${correctOrderIds.length} does not match items ${items.length}` });
    }

    const ids = new Set();
    items.forEach((it, i) => {
      if (!it?.id) issues.push({ type: 'invalid-ordering-item', index: i, message: 'Ordering item has no id' });
      if (!labelIsUsable(it?.label)) issues.push({ type: 'invalid-ordering-item', index: i, message: `Ordering item ${i} has unusable label` });
      if (ids.has(it.id)) issues.push({ type: 'duplicate-id', id: it.id, message: `Duplicate ordering id ${it.id}` });
      ids.add(it.id);
    });

    const leakPatterns = [
      /^\d+\.\s/,
      /^\d+\s/,
      /\b(erste|zweite|dritte|vierte|fünfte|sechste|siebte|achte)\b/i,
      /\b(1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.)\b/,
    ];

    items.forEach((it, i) => {
      if (leakPatterns.some((re) => re.test(it.label))) {
        issues.push({ type: 'ordering-position-leak', index: i, label: it.label, message: 'Ordering label leaks position' });
      }
    });

    correctOrderIds.forEach((id) => {
      if (!ids.has(id)) issues.push({ type: 'invalid-ordering-answer', message: `correctOrderId ${id} not in items` });
    });
  }

  if (question.type === 'mc') {
    const options = Array.isArray(question.options) ? question.options : [];
    const labels = new Set();
    if (options.length < 2) issues.push({ type: 'unsolvable-mc', message: `Only ${options.length} option(s)` });
    options.forEach((opt, i) => {
      if (!opt?.id) issues.push({ type: 'invalid-mc-option', index: i, message: 'MC option has no id' });
      if (!labelIsUsable(opt?.label)) issues.push({ type: 'invalid-mc-option', index: i, message: `MC option ${i} has unusable label` });
      if (labels.has(opt.label)) issues.push({ type: 'duplicate-mc-label', label: opt.label, message: `Duplicate MC label` });
      labels.add(opt.label);
    });
    if (!options.some((o) => o.id === question.correctOptionId)) {
      issues.push({ type: 'invalid-mc-answer', message: `correctOptionId ${question.correctOptionId} not in options` });
    }
  }

  if (question.type === 'input') {
    const answers = Array.isArray(question.answers) ? question.answers : [];
    if (answers.length === 0) issues.push({ type: 'unsolvable-input', message: 'No accepted answers defined' });
    answers.forEach((a, i) => {
      if (typeof a !== 'string' || a.trim().length === 0) issues.push({ type: 'invalid-input-answer', index: i, message: 'Empty/non-string input answer' });
    });
  }

  // Prompt must be usable and must not leak the answer
  if (!labelIsUsable(question.prompt)) issues.push({ type: 'invalid-prompt', message: 'Prompt is empty or contains [object Object]' });

  return issues;
}
