// =============================================================================
// Knowledge Items – Cisco Inter-VLAN Routing (cisco-packet-tracer/inter-vlan-routing)
//
// Source: frontend/src/lib/academyLessons/ciscoInterVlanRouting.js
//
// Scope note: abstract VLAN and trunking concepts are in fundamentals/vlan-basics
// and switchingVlan.js. This file covers Router-on-a-Stick specifics:
// subinterfaces, encapsulation dot1q, physical interface activation, and
// troubleshooting.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_INTER_VLAN_ROUTING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'inter-vlan-routing');

export const ciscoInterVlanRoutingKnowledgeItems = [
  {
    id: 'interVlan.physicalInterface',
    topicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceSection: 'subinterface-classic',
    conceptCluster: 'intervlan.physical',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical'],
    data: {
      subject: 'Physische Schnittstelle bei Router-on-a-Stick',
      ipAddress: 'Bekommt in diesem Modell normalerweise KEINE IP-Adresse für VLAN-Netze.',
      activation: 'Muss mit "no shutdown" aktiviert werden.',
      description: 'Die physische Router-Schnittstelle transportiert die getaggten Frames; die IP-Gateway-Adressen liegen auf den Subinterfaces.',
    },
    siblings: [],
  },
  {
    id: 'interVlan.subinterfaceConfig',
    topicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'intervlan.subinterface',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      steps: [
        'interface <PhysischesInterface>.<ID> (Subinterface anlegen / auswählen)',
        'encapsulation dot1q <VLAN-ID> (VLAN-Zuordnung und Tagging)',
        'ip address <Gateway-IP> <Maske> (Gateway-IP für das VLAN vergeben)',
      ],
      description: 'Ein Subinterface wird pro VLAN angelegt, mit encapsulation dot1q dem VLAN zugeordnet und mit einer Gateway-IP versehen.',
    },
    siblings: [],
  },
  {
    id: 'interVlan.encapsulationDot1q',
    topicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'intervlan.encapsulation',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      command: 'encapsulation dot1q <VLAN-ID>',
      purpose: 'Ordnet ein Subinterface einem VLAN zu und aktiviert 802.1Q-Tagging für dieses Subinterface.',
      description: '"encapsulation dot1q" verbindet Subinterface und VLAN, damit der Router getaggte Frames richtig verarbeiten kann.',
    },
    siblings: [],
  },
  {
    id: 'interVlan.trunkRequirement',
    topicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'intervlan.trunk',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      statement: 'Der switch-seitige Port zum Router muss ein Trunk sein, der alle beteiligten VLANs erlaubt.',
      consequence: 'Ohne Trunk erreichen die getaggten Frames der verschiedenen VLANs den Router nicht.',
      description: 'Router-on-a-Stick braucht auf der Switch-Seite einen Trunk, der alle zu routenden VLANs erlaubt.',
    },
    siblings: [],
  },
  {
    id: 'interVlan.verify',
    topicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'intervlan.verify',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      commands: [
        'show ip interface brief (zeigt physische und logische Interfaces mit Status/IP)',
        'show running-config (zeigt Subinterface-Konfiguration)',
      ],
      description: '"show ip interface brief" zeigt, ob physische und Subinterfaces aktiv und adressiert sind.',
    },
    siblings: [],
  },
  {
    id: 'interVlan.troubleshooting',
    topicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_INTER_VLAN_ROUTING_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'intervlan.troubleshooting',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      symptoms: [
        {
          symptom: 'VLANs können nicht VLAN-übergreifend kommunizieren, obwohl Subinterfaces und Gateways korrekt aussehen',
          cause: 'Der Switch-Port zum Router ist kein Trunk oder erlaubt nicht alle beteiligten VLANs.',
        },
        {
          symptom: 'Alle Subinterfaces sind konfiguriert, aber g0/0 bleibt administratively down',
          cause: 'Auf der physischen Schnittstelle fehlt "no shutdown".',
        },
        {
          symptom: 'Nur ein VLAN funktioniert, andere nicht',
          cause: 'Das betroffene Subinterface hat in "encapsulation dot1q" die falsche VLAN-ID.',
        },
      ],
      description: 'Häufige Router-on-a-Stick-Fehler sind fehlender Trunk am Switch, fehlendes "no shutdown" auf dem physischen Interface und falsche VLAN-ID in der Encapsulation.',
    },
    siblings: [],
  },
];
