// =============================================================================
// Knowledge Items – Cisco Grundkonfiguration (L2-Switch-Einstieg)
//
// Source: frontend/src/lib/academyLessons/ciscoGrundkonfiguration.js
//
// Note: This topic is a compact entry-level lesson that bundles VLANs,
// Access-/Trunk-Ports, unused-port hardening and basic IOS configuration.
// The knowledge items here focus on the *integration* and *completion*
// perspective rather than duplicating the deeper facets covered by the
// dedicated VLAN/Access/Trunk/Basic-Config topics.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_GRUNDKONFIGURATION_TOPIC_KEY = topicKey('cisco-packet-tracer', 'grundkonfiguration');

export const ciscoGrundkonfigurationKnowledgeItems = [
  {
    id: 'ciscoGrundkonfiguration.scope',
    topicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceSection: 'intro-classic',
    conceptCluster: 'grundkonfiguration.fundamentals',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      statement: 'Eine vollständige L2-Switch-Grundkonfiguration umfasst Geräteidentität, Zugangssicherheit, VLANs, Access-/Trunk-Ports, unsichere Ports und das Speichern der Konfiguration.',
      components: [
        'Hostname und Domain Name',
        'Enable secret, lokaler Benutzer, Console/VTY',
        'VLANs anlegen',
        'Access-Ports zuweisen',
        'Trunk-Ports konfigurieren',
        'Ungenutzte Ports absichern',
        'Konfiguration speichern',
      ],
      description: 'Dieses Topic bündelt den Einstieg in die Konfiguration eines L2-Switches.',
    },
    siblings: [],
  },
  {
    id: 'ciscoGrundkonfiguration.vlanAccessIntegration',
    topicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceSection: 'vlan-access-config-classic',
    conceptCluster: 'grundkonfiguration.configuration',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      statement: 'Ein VLAN muss existieren, bevor es einem Access-Port zugewiesen werden kann.',
      steps: [
        'vlan <ID>',
        'name <Name>',
        'interface <Port>',
        'switchport mode access',
        'switchport access vlan <ID>',
      ],
      verify: 'show vlan brief',
      description: 'VLAN anlegen/benennen, Port als Access markieren und VLAN zuweisen.',
    },
    siblings: [],
  },
  {
    id: 'ciscoGrundkonfiguration.trunkAllowed',
    topicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceSection: 'trunk-config-classic',
    conceptCluster: 'grundkonfiguration.configuration',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      statement: 'Auf einem Trunk muss ein VLAN sowohl erlaubt als auch auf dem Switch angelegt sein, um aktiv zu werden.',
      commands: [
        'switchport mode trunk',
        'switchport trunk allowed vlan <Liste>',
      ],
      verify: 'show interfaces trunk',
      description: 'Der allowed-Befehl filtert, welche VLANs auf dem Trunk transportiert werden dürfen.',
    },
    siblings: [],
  },
  {
    id: 'ciscoGrundkonfiguration.unusedPorts',
    topicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceSection: 'ungenutzt-classic',
    conceptCluster: 'grundkonfiguration.hardening',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      statement: 'Ungenutzte Ports werden in ein isoliertes VLAN gelegt und administrativ deaktiviert, um Sicherheitsrisiken zu minimieren.',
      commands: ['interface range <Liste>', 'switchport mode access', 'switchport access vlan <Default/Parking>', 'shutdown'],
      reason: 'Ein aktiver, freier Port kann von Unbefugten für unbemerkten Netzzugang genutzt werden.',
      description: 'Port-Hardening verhindert, dass freie Ports Angriffsvektoren bilden.',
    },
    siblings: [],
  },
  {
    id: 'ciscoGrundkonfiguration.saveConfig',
    topicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceSection: 'ios-speichern-classic',
    conceptCluster: 'grundkonfiguration.persistence',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      statement: 'Änderungen an der running-config liegen im RAM und gehen beim Neustart verloren, wenn sie nicht in die startup-config gespeichert werden.',
      commands: ['write', 'copy running-config startup-config', 'do write'],
      description: 'Das Speichern ist der letzte Schritt einer Konfiguration, damit sie dauerhaft erhalten bleibt.',
    },
    siblings: [],
  },
  {
    id: 'ciscoGrundkonfiguration.verifyBasics',
    topicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDKONFIGURATION_TOPIC_KEY,
    sourceSection: 'troubleshooting-classic',
    conceptCluster: 'grundkonfiguration.verify',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      mapping: [
        { command: 'show ip interface brief', purpose: 'Status und IP aller Interfaces' },
        { command: 'show vlan brief', purpose: 'VLANs und zugewiesene Ports' },
        { command: 'show interfaces trunk', purpose: 'Trunk-Ports und erlaubte VLANs' },
        { command: 'show interfaces status', purpose: 'Gesamtüberblick über alle Ports' },
      ],
      description: 'Die wichtigsten show-Befehle für einen schnellen Zustandsüberblick am L2-Switch.',
    },
    siblings: [],
  },
];
