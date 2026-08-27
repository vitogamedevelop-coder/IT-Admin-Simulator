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
import { ciscoBasicConfigKnowledgeItems } from './items/ciscoBasicConfig.js';
import { ciscoStpKnowledgeItems } from './items/ciscoStp.js';
import { ciscoVlanPracticeKnowledgeItems } from './items/ciscoVlanPractice.js';
import { ciscoAccessPortKnowledgeItems } from './items/ciscoAccessPort.js';
import { ciscoTrunkKnowledgeItems } from './items/ciscoTrunk.js';
import { ciscoRouterBasicsKnowledgeItems } from './items/ciscoRouterBasics.js';
import { ciscoStaticRoutingKnowledgeItems } from './items/ciscoStaticRouting.js';
import { ciscoInterVlanRoutingKnowledgeItems } from './items/ciscoInterVlanRouting.js';
import { NETWORK_BASICS_ITEMS } from './items/networkBasics.js';
import { CISCO_THEORY_ITEMS } from './items/ciscoTheory.js';
import { informationSecurityKnowledgeItems } from './items/informationSecurity.js';
import { adFoundationKnowledgeItems } from './items/adFoundation.js';
import { adUserProfilesKnowledgeItems } from './items/adUserProfiles.js';
import { adPermissionsKnowledgeItems } from './items/adPermissions.js';

// Shared constants live in a separate file to avoid circular imports between
// the registry and individual item modules.
export {
  KNOWLEDGE_TYPES,
  QUESTION_ARCHETYPES,
  DIFFICULTY,
  PROMPT_STYLES,
  CONTEXT_DEPENDENCIES,
} from './types.js';
export { createRng } from './random.js';
export { validateQuestionInstance, validateQuestionInstances, validateKnowledgeRegistry, validateKnowledgeItem } from './validators.js';
export { generateQuestion, generateRandomQuestion, generateBalancedQuestion, listApplicableTemplates, TEMPLATES } from './questionGenerator.js';
export { checkAmbiguity, isAmbiguous, KNOWN_AMBIGUITIES } from './ambiguityChecker.js';
export { generateCalculationData, getSupportedCalculationFamilies } from './calculationGenerators.js';
export {
  createSemanticHistory,
  pushHistoryRecord,
  clearSessionHistory,
  clearLongTermHistory,
  readLongTermHistory,
  writeLongTermHistory,
  recordAsk,
  getRecent,
  getLongTermRecent,
} from './semanticHistory.js';
export {
  getFacetMasteryScore,
  updateFacetMasteryScore,
  recordFacetCorrect,
  recordFacetWrong,
  resetFacetMastery,
  getAllFacetMasteryScores,
  getFacetMasteryMap,
  getFacetCooldownInfo,
  gapSinceFacet,
  setFacetMasteryOverride,
} from './facetMastery.js';
export {
  selectCandidate,
  createBalancerState,
  pickWeakestTopicKeys,
  DEFAULT_WEIGHTS,
} from './semanticBalancer.js';

const PILOT_ITEMS = [
  ...osiKnowledgeItems,
  ...binaryKnowledgeItems,
  ...ipv4SubnettingKnowledgeItems,
  ...switchingVlanKnowledgeItems,
  ...sshKnowledgeItems,
  ...ciscoBasicConfigKnowledgeItems,
  ...ciscoStpKnowledgeItems,
  ...ciscoVlanPracticeKnowledgeItems,
  ...ciscoAccessPortKnowledgeItems,
  ...ciscoTrunkKnowledgeItems,
  ...ciscoRouterBasicsKnowledgeItems,
  ...ciscoStaticRoutingKnowledgeItems,
  ...ciscoInterVlanRoutingKnowledgeItems,
  ...NETWORK_BASICS_ITEMS,
  ...CISCO_THEORY_ITEMS,
  ...informationSecurityKnowledgeItems,
  ...adFoundationKnowledgeItems,
  ...adUserProfilesKnowledgeItems,
  ...adPermissionsKnowledgeItems,
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
