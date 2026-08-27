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
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      description: 'Wandle eine Dezimalzahl zwischen 0 und 255 in einen 8-Bit-Binärstring um.',
      calculationFamily: 'decimalToBinary',
      difficultyRanges: {
        easy: { min: 0, max: 63 },
        medium: { min: 0, max: 255 },
        hard: { min: 128, max: 255 },
      },
      distractorStrategy: 'decimalToBinary',
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
    allowedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      description: 'Wandle einen 8-Bit-Binärstring in eine Dezimalzahl um.',
      calculationFamily: 'binaryToDecimal',
      difficultyRanges: {
        easy: { min: 0, max: 63 },
        medium: { min: 0, max: 255 },
        hard: { min: 128, max: 255 },
      },
      distractorStrategy: 'binaryToDecimal',
    },
    siblings: [],
  },
  {
    id: 'binary.numberSystems',
    topicKey: BINARY_TOPIC_KEY,
    sourceTopicKey: BINARY_TOPIC_KEY,
    sourceSection: 'number-systems-classic',
    conceptCluster: 'binary.numberSystems.mapping',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    data: {
      subject: 'Zahlensysteme',
      pairs: [
        { key: 'Dezimal', value: 'Basis 10, Ziffern 0–9' },
        { key: 'Binär', value: 'Basis 2, Ziffern 0 und 1' },
        { key: 'Hexadezimal', value: 'Basis 16, Zeichen 0–9 und A–F' },
        { key: 'Oktal', value: 'Basis 8, Ziffern 0–7' },
      ],
      description: 'Die Basis bestimmt die erlaubten Zeichen und Stellenwerte eines Zahlensystems.',
    },
    siblings: [],
  },
  {
    id: 'binary.hexRelation',
    topicKey: BINARY_TOPIC_KEY,
    sourceTopicKey: BINARY_TOPIC_KEY,
    sourceSection: 'hex-conversion-classic',
    conceptCluster: 'binary.hex.property',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      subject: 'Binär-Hexadezimal-Zusammenhang',
      description: 'Eine Hexadezimalstelle entspricht genau vier Binärbits; A bis F stehen für die Dezimalwerte 10 bis 15.',
      distractorDescriptions: ['Eine Hexadezimalstelle entspricht immer acht Dezimalziffern.', 'Hexadezimal verwendet ausschließlich die Ziffern 0 und 1.', 'A bis F sind nur Trennzeichen ohne eigenen Wert.'],
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
