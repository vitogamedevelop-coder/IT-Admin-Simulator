// =============================================================================
// NEXUS Knowledge Layer – Question Instance Generator
//
// Connects Knowledge Items with Templates to produce validated Question
// Instances deterministically.
//
// Usage:
//   import { generateQuestion } from './questionGenerator.js';
//   const q = generateQuestion('osi.layer3', 'osi.layer.taskToLayer', { seed: 'abc' });
// =============================================================================

import { createRng } from './random.js';
import { getKnowledgeItem, getAllKnowledgeItems } from './index.js';
import { TEMPLATES, findTemplatesForItem } from './templates.js';

export class QuestionGenerationError extends Error {
  constructor(message, knowledgeItemId, templateId) {
    super(message);
    this.name = 'QuestionGenerationError';
    this.knowledgeItemId = knowledgeItemId;
    this.templateId = templateId;
  }
}

/**
 * Generate a Question Instance from a Knowledge Item and a template.
 *
 * @param {string} knowledgeItemId
 * @param {string|null} templateId – if null, picks a matching template randomly.
 * @param {object} options
 * @param {string} options.seed – deterministic seed.
 * @param {string} options.contextType – 'direct_question' | 'coworker_question'.
 * @param {string|null} options.archetype – restrict to a specific question archetype.
 * @param {string|null} options.difficulty – override item difficulty for parametric generation.
 * @returns {object} Question Instance
 */
export function generateQuestion(knowledgeItemId, templateId = null, options = {}) {
  const { seed = '0', contextType = 'direct_question', archetype = null, difficulty = null } = options;
  const item = getKnowledgeItem(knowledgeItemId);
  if (!item) {
    throw new QuestionGenerationError(`Unknown Knowledge Item: ${knowledgeItemId}`, knowledgeItemId, templateId);
  }

  const allItemsById = Object.fromEntries(getAllKnowledgeItems().map((i) => [i.id, i]));

  let candidates = findTemplatesForItem(item, archetype);
  if (candidates.length === 0) {
    throw new QuestionGenerationError(
      `No template found for Knowledge Item ${knowledgeItemId}${archetype ? ` and archetype ${archetype}` : ''}`,
      knowledgeItemId,
      templateId,
    );
  }

  if (templateId) {
    candidates = candidates.filter((t) => t.id === templateId);
    if (candidates.length === 0) {
      throw new QuestionGenerationError(
        `Template ${templateId} does not apply to Knowledge Item ${knowledgeItemId}`,
        knowledgeItemId,
        templateId,
      );
    }
  }

  const effectiveDifficulty = difficulty || item.difficulty;
  // ContextType intentionally NOT part of the RNG seed: it may change the
  // wording, but must not change the generated parameters or the math answer.
  const rng = createRng(`${knowledgeItemId}|${templateId || '*'}|${effectiveDifficulty}|${seed}`);
  const template = candidates.length === 1
    ? candidates[0]
    : candidates[Math.floor(rng.next() * candidates.length)];

  const instance = template.generate(item, allItemsById, rng, { contextType, seed, difficulty: effectiveDifficulty });
  if (!instance || typeof instance !== 'object') {
    throw new QuestionGenerationError(`Template ${template.id} returned no instance`, knowledgeItemId, template.id);
  }
  return instance;
}

/**
 * Generate a question for a random Knowledge Item (optionally filtered).
 * Useful for mass tests.
 */
export function generateRandomQuestion(options = {}) {
  const { seed = 'random', filter = () => true, contextType = 'direct_question', archetype = null, difficulty = null } = options;
  const rng = createRng(String(seed));
  const allItems = getAllKnowledgeItems();
  // Only consider items that actually have applicable templates.
  const candidates = allItems
    .filter(filter)
    .filter((item) => findTemplatesForItem(item, archetype).length > 0);
  if (candidates.length === 0) {
    throw new QuestionGenerationError('No Knowledge Items match the given filter and have applicable templates');
  }
  const item = candidates[Math.floor(rng.next() * candidates.length)];
  const itemDifficulty = difficulty || item.difficulty;
  return generateQuestion(item.id, null, { seed, contextType, archetype, difficulty: itemDifficulty });
}

/**
 * Returns all template ids that can be applied to a Knowledge Item.
 */
export function listApplicableTemplates(knowledgeItemId) {
  const item = getKnowledgeItem(knowledgeItemId);
  if (!item) return [];
  return findTemplatesForItem(item).map((t) => ({ id: t.id, archetype: t.archetype }));
}

export { TEMPLATES };
