// =============================================================================
// Knowledge Items – IPv4 & Subnetting
//
// Sources:
//   - frontend/src/lib/academyLessons/ipv4.js
//   - frontend/src/lib/academyLessons/subnetMasks.js
//   - frontend/src/lib/academyLessons/subnetting.js
// Math reference: frontend/src/lib/networking/ipv4Math.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const IPV4_TOPIC_KEY = topicKey('fundamentals', 'ipv4');
export const SUBNET_MASKS_TOPIC_KEY = topicKey('fundamentals', 'subnet-masks');
export const SUBNETTING_TOPIC_KEY = topicKey('fundamentals', 'subnetting');

export const ipv4SubnettingKnowledgeItems = [
  // ---------------------------------------------------------------------------
  // IPv4 structure & properties
  // ---------------------------------------------------------------------------
  {
    id: 'ipv4.structure',
    topicKey: IPV4_TOPIC_KEY,
    sourceTopicKey: IPV4_TOPIC_KEY,
    sourceSection: 'structure-classic',
    conceptCluster: 'ipv4.structure',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      totalBits: 32,
      octets: 4,
      bitsPerOctet: 8,
      notation: 'punktierte Dezimalnotation',
      description: 'Eine IPv4-Adresse hat 32 Bit, aufgeteilt in vier Oktette zu je 8 Bit.',
    },
    siblings: [],
  },
  {
    id: 'ipv4.privateRanges',
    topicKey: IPV4_TOPIC_KEY,
    sourceTopicKey: IPV4_TOPIC_KEY,
    sourceSection: 'private-classic',
    conceptCluster: 'ipv4.ranges',
    type: KNOWLEDGE_TYPES.RANGE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      ranges: [
        { network: '10.0.0.0/8', label: '10.0.0.0/8' },
        { network: '172.16.0.0/12', label: '172.16.0.0/12' },
        { network: '192.168.0.0/16', label: '192.168.0.0/16' },
      ],
      description: 'Private Adressen werden in internen Netzen verwendet und im öffentlichen Internet nicht direkt geroutet.',
    },
    siblings: [],
  },
  {
    id: 'ipv4.loopback',
    topicKey: IPV4_TOPIC_KEY,
    sourceTopicKey: IPV4_TOPIC_KEY,
    sourceSection: 'private-classic',
    conceptCluster: 'ipv4.special',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      description: 'Loopback-Bereich: ein Gerät spricht mit sich selbst.',
      range: '127.0.0.0/8',
      typical: '127.0.0.1',
      meaning: 'Loopback: Ein Gerät spricht mit sich selbst.',
    },
    siblings: [],
  },
  {
    id: 'ipv4.apipa',
    topicKey: IPV4_TOPIC_KEY,
    sourceTopicKey: IPV4_TOPIC_KEY,
    sourceSection: 'private-classic',
    conceptCluster: 'ipv4.special',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      description: 'APIPA/Link-Local-Bereich: zeigt oft an, dass kein DHCP erreichbar war.',
      range: '169.254.0.0/16',
      meaning: 'Link-Local/APIPA: deutet oft darauf hin, dass kein DHCP erreichbar war.',
    },
    siblings: [],
  },
  {
    id: 'ipv4.cidrPrefix',
    topicKey: IPV4_TOPIC_KEY,
    sourceTopicKey: IPV4_TOPIC_KEY,
    sourceSection: 'prefix-classic',
    conceptCluster: 'ipv4.cidr',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      min: 0,
      max: 32,
      description: 'Der CIDR-Präfix gibt an, wie viele Bits zum Netzanteil gehören.',
    },
    siblings: [],
  },

  // ---------------------------------------------------------------------------
  // Subnet masks / CIDR mapping
  // ---------------------------------------------------------------------------
  {
    id: 'subnetMasks.prefixToMask',
    topicKey: SUBNET_MASKS_TOPIC_KEY,
    sourceTopicKey: SUBNET_MASKS_TOPIC_KEY,
    sourceSection: 'prefix-to-mask-classic',
    conceptCluster: 'subnetting.mask',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      description: 'Bestimme die Subnetzmaske zu einem gegebenen Präfix.',
      calculationFamily: 'prefixToMask',
      difficultyRanges: {
        easy: { prefixMin: 24, prefixMax: 26 },
        medium: { prefixMin: 16, prefixMax: 30 },
        hard: { prefixMin: 8, prefixMax: 30 },
      },
      distractorStrategy: 'prefixToMask',
    },
    siblings: [],
  },
  {
    id: 'subnetMasks.maskToPrefix',
    topicKey: SUBNET_MASKS_TOPIC_KEY,
    sourceTopicKey: SUBNET_MASKS_TOPIC_KEY,
    sourceSection: 'bitwerte-classic',
    conceptCluster: 'subnetting.mask',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      description: 'Bestimme den Präfix zu einer gegebenen Subnetzmaske.',
      calculationFamily: 'maskToPrefix',
      difficultyRanges: {
        easy: { prefixMin: 24, prefixMax: 26 },
        medium: { prefixMin: 16, prefixMax: 30 },
        hard: { prefixMin: 8, prefixMax: 30 },
      },
      distractorStrategy: 'maskToPrefix',
    },
    siblings: [],
  },

  // ---------------------------------------------------------------------------
  // Subnetting calculations
  // ---------------------------------------------------------------------------
  {
    id: 'subnetting.networkId',
    topicKey: SUBNETTING_TOPIC_KEY,
    sourceTopicKey: SUBNETTING_TOPIC_KEY,
    sourceSection: 'classic-method',
    conceptCluster: 'subnetting.calculation',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      description: 'Berechne die Netz-ID aus IP und Präfix.',
      calculationFamily: 'subnetting',
      target: 'networkId',
      difficultyRanges: {
        easy: { prefixMin: 24, prefixMax: 26, allowOctetChange: false, privateOnly: true },
        medium: { prefixMin: 16, prefixMax: 30, allowOctetChange: true, privateOnly: true },
        hard: { prefixMin: 8, prefixMax: 30, allowOctetChange: true, privateOnly: true },
      },
      distractorStrategy: 'subnettingNetworkId',
    },
    siblings: [
      'subnetting.broadcast',
      'subnetting.firstHost',
      'subnetting.lastHost',
      'subnetting.usableHosts',
      'subnetting.jumpSize',
    ],
  },
  {
    id: 'subnetting.broadcast',
    topicKey: SUBNETTING_TOPIC_KEY,
    sourceTopicKey: SUBNETTING_TOPIC_KEY,
    sourceSection: 'classic-method',
    conceptCluster: 'subnetting.calculation',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      description: 'Berechne die Broadcast-Adresse aus IP und Präfix.',
      calculationFamily: 'subnetting',
      target: 'broadcast',
      difficultyRanges: {
        easy: { prefixMin: 24, prefixMax: 26, allowOctetChange: false, privateOnly: true },
        medium: { prefixMin: 16, prefixMax: 30, allowOctetChange: true, privateOnly: true },
        hard: { prefixMin: 8, prefixMax: 30, allowOctetChange: true, privateOnly: true },
      },
      distractorStrategy: 'subnettingBroadcast',
    },
    siblings: [
      'subnetting.networkId',
      'subnetting.firstHost',
      'subnetting.lastHost',
      'subnetting.usableHosts',
      'subnetting.jumpSize',
    ],
  },
  {
    id: 'subnetting.firstHost',
    topicKey: SUBNETTING_TOPIC_KEY,
    sourceTopicKey: SUBNETTING_TOPIC_KEY,
    sourceSection: 'classic-method',
    conceptCluster: 'subnetting.calculation',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      description: 'Berechne die erste nutzbare Hostadresse aus IP und Präfix.',
      calculationFamily: 'subnetting',
      target: 'firstHost',
      difficultyRanges: {
        easy: { prefixMin: 24, prefixMax: 26, allowOctetChange: false, privateOnly: true },
        medium: { prefixMin: 16, prefixMax: 30, allowOctetChange: true, privateOnly: true },
        hard: { prefixMin: 8, prefixMax: 30, allowOctetChange: true, privateOnly: true },
      },
      distractorStrategy: 'subnettingFirstHost',
    },
    siblings: [
      'subnetting.networkId',
      'subnetting.broadcast',
      'subnetting.lastHost',
      'subnetting.usableHosts',
      'subnetting.jumpSize',
    ],
  },
  {
    id: 'subnetting.lastHost',
    topicKey: SUBNETTING_TOPIC_KEY,
    sourceTopicKey: SUBNETTING_TOPIC_KEY,
    sourceSection: 'classic-method',
    conceptCluster: 'subnetting.calculation',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      description: 'Berechne die letzte nutzbare Hostadresse aus IP und Präfix.',
      calculationFamily: 'subnetting',
      target: 'lastHost',
      difficultyRanges: {
        easy: { prefixMin: 24, prefixMax: 26, allowOctetChange: false, privateOnly: true },
        medium: { prefixMin: 16, prefixMax: 30, allowOctetChange: true, privateOnly: true },
        hard: { prefixMin: 8, prefixMax: 30, allowOctetChange: true, privateOnly: true },
      },
      distractorStrategy: 'subnettingLastHost',
    },
    siblings: [
      'subnetting.networkId',
      'subnetting.broadcast',
      'subnetting.firstHost',
      'subnetting.usableHosts',
      'subnetting.jumpSize',
    ],
  },
  {
    id: 'subnetting.usableHosts',
    topicKey: SUBNETTING_TOPIC_KEY,
    sourceTopicKey: SUBNETTING_TOPIC_KEY,
    sourceSection: 'classic-method',
    conceptCluster: 'subnetting.calculation',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      description: 'Berechne die Anzahl nutzbarer Hostadressen aus dem Präfix.',
      calculationFamily: 'subnetting',
      target: 'usableHosts',
      difficultyRanges: {
        easy: { prefixMin: 24, prefixMax: 26, allowOctetChange: false, privateOnly: true },
        medium: { prefixMin: 16, prefixMax: 30, allowOctetChange: true, privateOnly: true },
        hard: { prefixMin: 8, prefixMax: 30, allowOctetChange: true, privateOnly: true },
      },
      distractorStrategy: 'subnettingUsableHosts',
    },
    siblings: [
      'subnetting.networkId',
      'subnetting.broadcast',
      'subnetting.firstHost',
      'subnetting.lastHost',
      'subnetting.jumpSize',
    ],
  },
  {
    id: 'subnetting.jumpSize',
    topicKey: SUBNETTING_TOPIC_KEY,
    sourceTopicKey: SUBNETTING_TOPIC_KEY,
    sourceSection: 'intuitive-jump-table',
    conceptCluster: 'subnetting.calculation',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      description: 'Berechne die Sprungweite im relevanten Oktett aus dem Präfix.',
      calculationFamily: 'subnetting',
      target: 'jumpSize',
      difficultyRanges: {
        easy: { prefixMin: 24, prefixMax: 26, allowOctetChange: false, privateOnly: true },
        medium: { prefixMin: 16, prefixMax: 30, allowOctetChange: true, privateOnly: true },
        hard: { prefixMin: 8, prefixMax: 30, allowOctetChange: true, privateOnly: true },
      },
      distractorStrategy: 'subnettingJumpSize',
    },
    siblings: [
      'subnetting.networkId',
      'subnetting.broadcast',
      'subnetting.firstHost',
      'subnetting.lastHost',
      'subnetting.usableHosts',
    ],
  },
];
