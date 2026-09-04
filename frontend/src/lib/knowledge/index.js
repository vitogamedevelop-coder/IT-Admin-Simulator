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
import { ciscoMultilayerSwitchingKnowledgeItems } from './items/ciscoMultilayerSwitching.js';
import { ciscoDhcpKnowledgeItems } from './items/ciscoDhcp.js';
import { ciscoOspfKnowledgeItems } from './items/ciscoOspf.js';
import { ciscoAclKnowledgeItems } from './items/ciscoAcl.js';
import { ciscoPacketFilterKnowledgeItems } from './items/ciscoPacketFilter.js';
import { ciscoNatKnowledgeItems } from './items/ciscoNat.js';
import { ciscoTroubleshootingKnowledgeItems } from './items/ciscoTroubleshooting.js';
import { ciscoGrundkonfigurationKnowledgeItems } from './items/ciscoGrundkonfiguration.js';
import { ciscoCommandRecallKnowledgeItems } from './items/ciscoCommandRecall.js';
import { NETWORK_BASICS_ITEMS } from './items/networkBasics.js';
import { CISCO_THEORY_ITEMS } from './items/ciscoTheory.js';
import { informationSecurityKnowledgeItems } from './items/informationSecurity.js';
import { adFoundationKnowledgeItems } from './items/adFoundation.js';
import { adUserProfilesKnowledgeItems } from './items/adUserProfiles.js';
import { adUsersKnowledgeItems } from './items/adUsers.js';
import { adSharesKnowledgeItems } from './items/adShares.js';
import { adNtfsPermissionsKnowledgeItems } from './items/adNtfsPermissions.js';
import { adPermissionsKnowledgeItems } from './items/adPermissions.js';
import { adLogicalComponentsKnowledgeItems } from './items/adLogicalComponents.js';
import { adFsmoGcKnowledgeItems } from './items/adFsmoGc.js';
import { adOuManagementKnowledgeItems } from './items/adOuManagement.js';
import { adWindowsServerKnowledgeItems } from './items/adWindowsServer.js';
import { adMmcBasicsKnowledgeItems } from './items/adMmcBasics.js';
import { adDelegationKnowledgeItems } from './items/adDelegation.js';
import { adMmcHelpdeskKnowledgeItems } from './items/adMmcHelpdesk.js';
import { adTreeForestKnowledgeItems } from './items/adTreeForest.js';
import { adTrustsKnowledgeItems } from './items/adTrusts.js';
import { adFsmoAdminGroupsKnowledgeItems } from './items/adFsmoAdminGroups.js';
import { adFsmoTransferKnowledgeItems } from './items/adFsmoTransfer.js';
import { adReplicationBasicsKnowledgeItems } from './items/adReplicationBasics.js';
import { adReplicationSitesKnowledgeItems } from './items/adReplicationSites.js';
import { adReplicationTopologyKnowledgeItems } from './items/adReplicationTopology.js';
import { adReplicationSiteConfigKnowledgeItems } from './items/adReplicationSiteConfig.js';
import { adRecycleBinKnowledgeItems } from './items/adRecycleBin.js';
import { adGroupPolicyBasicsKnowledgeItems } from './items/adGroupPolicyBasics.js';

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
  ...ciscoMultilayerSwitchingKnowledgeItems,
  ...ciscoDhcpKnowledgeItems,
  ...ciscoOspfKnowledgeItems,
  ...ciscoAclKnowledgeItems,
  ...ciscoPacketFilterKnowledgeItems,
  ...ciscoNatKnowledgeItems,
  ...ciscoTroubleshootingKnowledgeItems,
  ...ciscoGrundkonfigurationKnowledgeItems,
  ...ciscoCommandRecallKnowledgeItems,
  ...NETWORK_BASICS_ITEMS,
  ...CISCO_THEORY_ITEMS,
  ...informationSecurityKnowledgeItems,
  ...adFoundationKnowledgeItems,
  ...adLogicalComponentsKnowledgeItems,
  ...adFsmoGcKnowledgeItems,
  ...adOuManagementKnowledgeItems,
  ...adWindowsServerKnowledgeItems,
  ...adUserProfilesKnowledgeItems,
  ...adUsersKnowledgeItems,
  ...adSharesKnowledgeItems,
  ...adNtfsPermissionsKnowledgeItems,
  ...adPermissionsKnowledgeItems,
  ...adMmcBasicsKnowledgeItems,
  ...adDelegationKnowledgeItems,
  ...adMmcHelpdeskKnowledgeItems,
  ...adTreeForestKnowledgeItems,
  ...adTrustsKnowledgeItems,
  ...adFsmoAdminGroupsKnowledgeItems,
  ...adFsmoTransferKnowledgeItems,
  ...adReplicationBasicsKnowledgeItems,
  ...adReplicationSitesKnowledgeItems,
  ...adReplicationTopologyKnowledgeItems,
  ...adReplicationSiteConfigKnowledgeItems,
  ...adRecycleBinKnowledgeItems,
  ...adGroupPolicyBasicsKnowledgeItems,
];

// Curriculum-Merge v1.93.0: alte Topic-Keys auf neue konsolidierte Topic-Keys mappen,
// ohne die Source-Files anfassen zu müssen.
const AD_KNOWLEDGE_TOPIC_REMAP = {
  'active-directory-virtualbox/domain': 'active-directory-virtualbox/ad-foundation',
  'active-directory-virtualbox/domain-controller': 'active-directory-virtualbox/ad-install',
  'active-directory-virtualbox/ad-permissions': 'active-directory-virtualbox/ad-groups',
  'active-directory-virtualbox/ad-group-practice': 'active-directory-virtualbox/ad-groups',
  'active-directory-virtualbox/ad-mmc-basics': 'active-directory-virtualbox/ad-administration',
  'active-directory-virtualbox/ad-delegation': 'active-directory-virtualbox/ad-administration',
  'active-directory-virtualbox/ad-fsmo-admin-groups': 'active-directory-virtualbox/ad-trusts',
  'active-directory-virtualbox/ad-replication-site-config': 'active-directory-virtualbox/ad-replication-practice',
  'active-directory-virtualbox/ad-recycle-bin': 'active-directory-virtualbox/ad-replication-practice',
  'active-directory-virtualbox/shares': 'active-directory-virtualbox/windows-server',
};

const MAPPED_PILOT_ITEMS = PILOT_ITEMS.map((item) => {
  const newTopicKey = AD_KNOWLEDGE_TOPIC_REMAP[item.topicKey];
  if (!newTopicKey) return item;
  const newSourceTopicKey = item.sourceTopicKey
    ? (AD_KNOWLEDGE_TOPIC_REMAP[item.sourceTopicKey] || item.sourceTopicKey)
    : newTopicKey;
  return { ...item, topicKey: newTopicKey, sourceTopicKey: newSourceTopicKey };
});

const REGISTRY = new Map(MAPPED_PILOT_ITEMS.map((item) => [item.id, item]));

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
