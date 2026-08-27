// =============================================================================
// Knowledge Items – Cisco Router Basics (cisco-packet-tracer/router-basics)
//
// Source: frontend/src/lib/academyLessons/ciscoRouterBasics.js
//
// Scope note: the abstract routing concepts are already covered by
// knowledge/items/routing.js under fundamentals/routing. This file covers
// what the Cisco Router Basics lesson adds: interface configuration, no shutdown,
// show ip interface brief, and the routing decision process (LPM, AD, metric).
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_ROUTER_BASICS_TOPIC_KEY = topicKey('cisco-packet-tracer', 'router-basics');

export const ciscoRouterBasicsKnowledgeItems = [
  {
    id: 'router.interfaceConfig',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'interface-cli-classic',
    conceptCluster: 'router.interface',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      steps: [
        'interface <Interface> (Schnittstelle auswählen)',
        'ip address <IP> <Subnetzmaske> (Adresse vergeben)',
        'no shutdown (Schnittstelle aktivieren)',
      ],
      description: 'Ein Router-Interface wird ausgewählt, mit IP und Maske versehen und anschließend mit "no shutdown" aktiviert.',
    },
    siblings: [],
  },
  {
    id: 'router.noShutdownReason',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'interface-cli-classic',
    conceptCluster: 'router.interface',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical', 'support'],
    data: {
      subject: 'Router Interface Status',
      defaultState: 'Router-Interfaces sind im Auslieferungszustand administrativ deaktiviert (shutdown).',
      action: 'Mit "no shutdown" wird die Schnittstelle aktiviert.',
      description: 'Router-Interfaces sind standardmäßig administrativ down und brauchen "no shutdown".',
    },
    siblings: [],
  },
  {
    id: 'router.longestPrefixMatch',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'entscheidung-classic',
    conceptCluster: 'route_selection.lpm',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      rule: 'Bei mehreren passenden Routen gewinnt die Route mit dem längsten (spezifischsten) Präfix.',
      example: 'Ein Paket an 192.168.10.5 passt auf 192.168.0.0/16 und 192.168.10.0/24 - die /24-Route gewinnt.',
      description: 'Longest Prefix Match bevorzugt die spezifischste passende Route, unabhängig von AD oder Metrik.',
    },
    siblings: [],
  },
  {
    id: 'router.administrativeDistance',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'ad-metrik-classic',
    conceptCluster: 'route_selection.ad',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['technical'],
    data: {
      values: [
        { source: 'Connected', ad: '0' },
        { source: 'Static', ad: '1' },
        { source: 'OSPF', ad: '110' },
      ],
      description: 'Administrative Distance bewertet die Vertrauenswürdigkeit der Routing-Quelle. Niedrigere Werte gewinnen bei gleichem Präfix.',
    },
    siblings: [],
  },
  {
    id: 'router.metric',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'ad-metrik-classic',
    conceptCluster: 'route_selection.metric',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      subject: 'Metrik',
      whenUsed: 'Nur wenn mehrere Wege derselben Routing-Quelle mit gleicher AD existieren.',
      description: 'Die Metrik vergleicht Wege innerhalb derselben Routing-Quelle; sie entscheidet erst nach Longest Prefix Match und AD.',
    },
    siblings: [],
  },
  {
    id: 'router.verifyInterface',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'interface-cli-classic',
    conceptCluster: 'router.verify',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      command: 'show ip interface brief',
      shows: ['Interface', 'IP-Adresse', 'Status', 'Protocol'],
      description: '"show ip interface brief" ist der schnellste Weg, um Interface-IP und Status zu prüfen.',
    },
    siblings: [],
  },
];
