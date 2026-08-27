// =============================================================================
// Knowledge Items – Cisco Static Routing (cisco-packet-tracer/static-routing)
//
// Source: frontend/src/lib/academyLessons/ciscoStaticRouting.js
//
// Scope note: abstract routing concepts are in fundamentals/routing. This file
// covers the Cisco-specific static routing CLI, return path, configured vs
// active routes, and verification.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_STATIC_ROUTING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'static-routing');

export const ciscoStaticRoutingKnowledgeItems = [
  {
    id: 'staticRoute.syntax',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'static.syntax',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      steps: [
        'ip route <Zielnetz> <Subnetzmaske> <Next-Hop>',
      ],
      description: 'Eine statische Route braucht Zielnetz, Subnetzmaske und Next Hop (oder Ausgangsschnittstelle).',
    },
    siblings: [],
  },
  {
    id: 'staticRoute.defaultRoute',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'static.defaultRoute',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      syntax: 'ip route 0.0.0.0 0.0.0.0 <Next-Hop>',
      meaning: 'Passt auf jedes Ziel, für das keine spezifischere Route existiert.',
      description: 'Die Default Route ist die unspezifischste Route (0.0.0.0/0) und dient als Auffang für alles andere.',
    },
    siblings: [],
  },
  {
    id: 'staticRoute.returnPath',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'fehlersuche-classic',
    conceptCluster: 'static.returnPath',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    data: {
      statement: 'Ein Paket braucht Hin- und Rückweg, damit bidirektionale Kommunikation funktioniert.',
      consequence: 'Wenn nur R1 eine Route zum Remote-Netz kennt, aber R2 keine Route zurück zum Quellnetz, kommen Antworten nicht an.',
      description: 'Für erfolgreiche Kommunikation muss auch der Ziel-Router eine Route zurück zum Ursprungsnetz haben.',
    },
    siblings: [],
  },
  {
    id: 'staticRoute.configuredVsActive',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'fehlersuche-classic',
    conceptCluster: 'static.troubleshooting',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    data: {
      configured: 'Route ist in der running-config sichtbar.',
      active: 'Route erscheint in "show ip route" und wird tatsächlich verwendet.',
      commonCause: 'Der Next Hop ist nicht erreichbar, daher installiert IOS die Route nicht.',
      description: 'Eine konfigurierte statische Route ist nicht automatisch aktiv; der Next Hop muss erreichbar sein.',
    },
    siblings: [],
  },
  {
    id: 'staticRoute.verify',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'fehlersuche-classic',
    conceptCluster: 'static.verify',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      commands: [
        'show ip route (zeigt alle aktiven Routen)',
        'show ip route <IP> (zeigt die Route für ein bestimmtes Ziel)',
        'show running-config | include ip route (zeigt konfigurierte statische Routen)',
      ],
      description: 'Statische Routen werden mit "show ip route" und "show running-config" verifiziert; wichtig ist der Unterschied zwischen konfiguriert und aktiv.',
    },
    siblings: [],
  },
  {
    id: 'staticRoute.showIpRouteCodes',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'fehlersuche-classic',
    conceptCluster: 'static.verify',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['technical'],
    data: {
      codes: [
        { code: 'C', meaning: 'Connected' },
        { code: 'L', meaning: 'Local' },
        { code: 'S', meaning: 'Static' },
        { code: 'S*', meaning: 'Static + Kandidat für Default Route' },
        { code: 'O', meaning: 'OSPF' },
      ],
      description: 'In "show ip route" zeigen Codes wie C, L, S oder O an, wie eine Route gelernt wurde.',
    },
    siblings: [],
  },
];
