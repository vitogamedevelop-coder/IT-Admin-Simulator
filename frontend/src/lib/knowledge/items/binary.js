// =============================================================================
// Knowledge Items – Binärsystem
//
// Source: frontend/src/lib/academyLessons/binarySystem.js
// Math reference: frontend/src/lib/networking/ipv4Math.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const BINARY_TOPIC_KEY = topicKey('fundamentals', 'binary-system');

export const binaryKnowledgeItems = [
  {
    id: 'binary.bitValues',
    topicKey: BINARY_TOPIC_KEY,
    sourceTopicKey: BINARY_TOPIC_KEY,
    sourceSection: 'intro-classic',
    conceptCluster: 'binary.values',
    type: KNOWLEDGE_TYPES.ORDER,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.RECALL],
    data: {
      values: [128, 64, 32, 16, 8, 4, 2, 1],
      description: 'Ein IPv4-Oktett besteht aus acht Bits. Das linkeste Bit ist 128, das rechteste 1.',
      rule: 'Aktive Bits addieren sich. Alle acht Bits gesetzt ergeben 255, keine davon ergibt 0.',
    },
    siblings: [],
  },
  {
    id: 'binary.decimalToBinary',
    topicKey: BINARY_TOPIC_KEY,
    sourceTopicKey: BINARY_TOPIC_KEY,
    sourceSection: 'conversion-classic',
    conceptCluster: 'binary.calculation',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      description: 'Wandle eine Dezimalzahl zwischen 0 und 255 in einen 8-Bit-Binärstring um.',
      minValue: 0,
      maxValue: 255,
      // Refer to ipv4Math.js; do not duplicate the conversion logic here.
      calculator: 'decimalToBinaryOctet',
    },
    siblings: [],
  },
  {
    id: 'binary.binaryToDecimal',
    topicKey: BINARY_TOPIC_KEY,
    sourceTopicKey: BINARY_TOPIC_KEY,
    sourceSection: 'conversion-classic',
    conceptCluster: 'binary.calculation',
    type: KNOWLEDGE_TYPES.CALCULATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      description: 'Wandle einen 8-Bit-Binärstring in eine Dezimalzahl um.',
      minBits: 8,
      maxBits: 8,
      calculator: 'binaryOctetToDecimal',
    },
    siblings: [],
  },
  {
    id: 'binary.octetRange',
    topicKey: BINARY_TOPIC_KEY,
    sourceTopicKey: BINARY_TOPIC_KEY,
    sourceSection: 'why-binary-classic',
    conceptCluster: 'binary.range',
    type: KNOWLEDGE_TYPES.RANGE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      description: 'Ein Oktett kann mit acht Bit Werte von 0 bis 255 darstellen.',
      min: 0,
      max: 255,
    },
    siblings: [],
  },
];
