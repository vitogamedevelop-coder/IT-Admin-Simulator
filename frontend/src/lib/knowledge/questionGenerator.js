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
import { selectCandidate, createBalancerState } from './semanticBalancer.js';
import { getFacetCooldownInfo, gapSinceFacet } from './facetMastery.js';

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

function probeTemplateFacet(template, item, allItemsById, archetype, difficulty) {
  try {
    const rng = createRng(`${item.id}|${template.id}|facet-probe|${archetype || '*'}|${difficulty || '*'}`);
    const instance = template.generate(item, allItemsById, rng, { contextType: 'direct_question', seed: 'facet-probe', difficulty });
    return instance.knowledgeFacet || null;
  } catch {
    return null;
  }
}

function weightedPickTemplate(templatesWithFacets, state, rng) {
  if (templatesWithFacets.length === 0) return null;
  if (templatesWithFacets.length === 1) return templatesWithFacets[0].template;

  const records = [...(state.history?.longTerm || []), ...(state.history?.session || [])];
  const weighted = templatesWithFacets.map(({ template, facet }) => {
    let weight = 1.0;
    if (facet) {
      const info = getFacetCooldownInfo(facet);
      if (info.score <= 0) {
        weight *= Math.max(0.5, 1 + info.priorityBoost);
      } else {
        weight *= Math.max(0.1, 1 - info.score * 0.12);
      }
      const gap = gapSinceFacet(records, facet);
      if (gap >= info.maxGap) weight *= 1.5;
      else if (gap === Infinity) weight *= 1.1;
    }
    return { template, weight };
  });

  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let roll = rng.next() * total;
  for (const w of weighted) {
    if (roll < w.weight) return w.template;
    roll -= w.weight;
  }
  return weighted[weighted.length - 1].template;
}

/**
 * Generate a question using the semantic balancer to pick the next
 * Knowledge Item. The balancer decides WHAT to ask; the Question Generator
 * decides HOW the concrete instance looks.
 *
 * Phase 6: after an item is chosen, the template is selected based on the
 * facet mastery state so weak facets are more likely to be practiced.
 *
 * @param {object} state – balancer state (history, progressByTopic, lastResult, difficultyProfile, facetMasteryMap).
 * @param {object} options
 * @param {string} options.seed – deterministic selection seed.
 * @param {string} options.contextType – 'direct_question' | 'coworker_question'.
 * @param {string|null} options.archetype – restrict to a specific question archetype.
 * @param {string|null} options.difficulty – override item difficulty for parametric generation.
 * @param {Array|null} options.candidates – optional candidate list; defaults to unlocked knowledge items.
 * @param {object} options.balancerWeights – optional weight overrides.
 * @returns {object} Question Instance
 */
export function generateBalancedQuestion(state, options = {}) {
  const {
    seed = '0',
    contextType = 'direct_question',
    archetype = null,
    difficulty = null,
    candidates = null,
    balancerWeights = null,
  } = options;

  let candidateList = candidates || getAllKnowledgeItems();
  // Always ensure candidates actually have applicable templates.
  candidateList = candidateList.filter((item) => findTemplatesForItem(item, archetype).length > 0);
  if (candidateList.length === 0) {
    throw new QuestionGenerationError('No candidate Knowledge Items for balanced selection');
  }

  const balancerState = createBalancerState(state);
  const selected = selectCandidate(candidateList, balancerState, {
    seed,
    weights: balancerWeights,
  });
  if (!selected) {
    throw new QuestionGenerationError('Semantic balancer returned no candidate');
  }

  const itemDifficulty = difficulty || selected.difficulty;
  const templates = findTemplatesForItem(selected, archetype);
  const allItemsById = Object.fromEntries(getAllKnowledgeItems().map((i) => [i.id, i]));
  const templateRng = createRng(`${seed}|template-pick|${selected.id}`);
  const templatesWithFacets = templates.map((t) => ({
    template: t,
    facet: probeTemplateFacet(t, selected, allItemsById, archetype, itemDifficulty),
  }));
  const template = weightedPickTemplate(templatesWithFacets, state, templateRng);
  if (!template) {
    throw new QuestionGenerationError(`No template could be chosen for item ${selected.id}`);
  }

  return generateQuestion(selected.id, template.id, { seed, contextType, archetype, difficulty: itemDifficulty });
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
