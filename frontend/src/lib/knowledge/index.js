// =============================================================================
// NEXUS Knowledge Layer – Phase 1 Pilot
//
// Central, read-only registry for structured Knowledge Items derived from the
// Academy lessons. This is the "Knowledge Layer" part of the hybrid solution:
// Academy lessons stay the single source of truth; this layer provides the
// conversation engine with optimized, validated, question-ready data.
//
// Phase 1 scope (pilot):
//   - OSI-Modell
//   - Binärsystem
//   - IPv4 / Subnetting
//   - Switching / VLAN
//   - SSH
//
// No runtime KI generation. No duplicate math. No new UI. Existing systems
// keep working unchanged.
// =============================================================================

import { topicKey } from '../academyTopics.js';
import { osiKnowledgeItems } from './items/osi.js';
import { binaryKnowledgeItems } from './items/binary.js';
import { ipv4SubnettingKnowledgeItems } from './items/ipv4.js';
import { switchingVlanKnowledgeItems } from './items/switchingVlan.js';
import { sshKnowledgeItems } from './items/ssh.js';

// Shared constants live in a separate file to avoid circular imports between
// the registry and individual item modules.
export { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from './types.js';
export { createRng } from './random.js';
export { validateQuestionInstance, validateQuestionInstances, validateKnowledgeRegistry, validateKnowledgeItem } from './validators.js';
export { generateQuestion, generateRandomQuestion, listApplicableTemplates, TEMPLATES } from './questionGenerator.js';
export { checkAmbiguity, isAmbiguous, KNOWN_AMBIGUITIES } from './ambiguityChecker.js';
export { generateCalculationData, getSupportedCalculationFamilies } from './calculationGenerators.js';

const PILOT_ITEMS = [
  ...osiKnowledgeItems,
  ...binaryKnowledgeItems,
  ...ipv4SubnettingKnowledgeItems,
  ...switchingVlanKnowledgeItems,
  ...sshKnowledgeItems,
];

const REGISTRY = new Map(PILOT_ITEMS.map((item) => [item.id, item]));

export function getKnowledgeItem(id) {
  return REGISTRY.get(id) || null;
}

export function getAllKnowledgeItems() {
  return Array.from(REGISTRY.values());
}

export function getKnowledgeItemsByTopic(topicKeyOrFn) {
  if (typeof topicKeyOrFn === 'function') {
    return getAllKnowledgeItems().filter(topicKeyOrFn);
  }
  return getAllKnowledgeItems().filter((item) => item.topicKey === topicKeyOrFn);
}

export function getKnowledgeItemsByCluster(conceptCluster) {
  return getAllKnowledgeItems().filter((item) => item.conceptCluster === conceptCluster);
}

export function getKnowledgeItemsByType(type) {
  return getAllKnowledgeItems().filter((item) => item.type === type);
}

// Re-export topicKey from academyTopics for convenience.
export { topicKey };
