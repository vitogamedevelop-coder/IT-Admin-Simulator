// =============================================================================
// Knowledge Items – Cisco Trunk (cisco-packet-tracer/trunk)
//
// Source: frontend/src/lib/academyLessons/ciscoTrunk.js
//
// Scope note: the abstract Access-vs-Trunk distinction and basic VLAN theory are
// already covered by knowledge/items/switchingVlan.js under
// fundamentals/vlan-basics. This file covers what the Cisco Trunk lesson
// adds: 802.1Q tagging, native VLAN, allowed VLAN list semantics, the
// allowed/active distinction, DTP basics, and trunk troubleshooting.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_TRUNK_TOPIC_KEY = topicKey('cisco-packet-tracer', 'trunk');

export const ciscoTrunkKnowledgeItems = [
  {
    id: 'trunk.tagging',
    topicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceTopicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceSection: 'tagging-classic',
    conceptCluster: 'trunk.tagging',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      trunk: 'Frames werden mit einem 802.1Q-Tag versehen, das die VLAN-ID enthält, damit der Zielswitch sie korrekt zuordnen kann.',
      access: 'Frames bleiben ungetaggt, weil das Endgerät nur einem VLAN angehört und nichts von VLANs "weiß".',
      description: 'Ein Trunk transportiert mehrere VLANs über dieselbe Leitung, indem er Frames mit 802.1Q-Tags kennzeichnet; Access-Ports senden ungetaggt.',
    },
    siblings: [],
  },
  {
    id: 'trunk.nativeVlan',
    topicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceTopicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceSection: 'native-vlan-classic',
    conceptCluster: 'trunk.nativeVlan',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical', 'support'],
    data: {
      subject: 'Native VLAN',
      defaultValue: 'VLAN 1',
      behavior: 'Frames des Native VLAN werden auf dem Trunk ungetaggt übertragen.',
      important: 'Beide Enden eines Trunks müssen dasselbe Native VLAN haben, sonst entsteht ein Mismatch.',
      securityNote: 'Aus Sicherheitsgründen wird empfohlen, das Native VLAN auf ein ungenutztes VLAN zu ändern.',
      description: 'Das Native VLAN ist das einzige VLAN, dessen Frames auf einem Trunk ohne 802.1Q-Tag übertragen werden; beide Enden müssen übereinstimmen.',
    },
    siblings: [],
  },
  {
    id: 'trunk.allowedSemantics',
    topicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceTopicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceSection: 'allowed-semantics-classic',
    conceptCluster: 'trunk.allowed',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      steps: [
        'switchport trunk allowed vlan 10,20 - ersetzt die Liste durch VLAN 10 und 20',
        'switchport trunk allowed vlan add 30 - ergänzt VLAN 30 zur bestehenden Liste',
        'switchport trunk allowed vlan remove 20 - entfernt VLAN 20 aus der bestehenden Liste',
      ],
      description: 'Ohne "add" oder "remove" ersetzt "switchport trunk allowed vlan" die komplette erlaubte VLAN-Liste - ein häufiger Fehler.',
    },
    siblings: [],
  },
  {
    id: 'trunk.allowedVsActive',
    topicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceTopicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceSection: 'verify-flow-classic',
    conceptCluster: 'trunk.verify',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      allowed: 'VLAN ist auf dem Trunk erlaubt und könnte theoretisch übertragen werden.',
      active: 'VLAN existiert auf dem Switch und ist auch auf dem Trunk aktiv/forwarding.',
      symptom: 'allowed, aber nicht active → VLAN fehlt auf dem Switch (noch nicht mit "vlan <ID>" angelegt).',
      description: '"allowed" und "active" sind zwei unterschiedliche Spalten in "show interfaces trunk". allowed bedeutet nicht automatisch active.',
    },
    siblings: [],
  },
  {
    id: 'trunk.dtp',
    topicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceTopicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceSection: 'dtp-classic',
    conceptCluster: 'trunk.dtp',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      subject: 'Dynamic Trunking Protocol (DTP)',
      description: 'DTP kann Trunks dynamisch aushandeln, aber das Default-Verhalten hängt von Switch-Modell und IOS ab. In der Praxis konfiguriert man Portmodi explizit und deaktiviert die Aushandlung bei Bedarf mit "switchport nonegotiate".',
    },
    siblings: [],
  },
  {
    id: 'trunk.troubleshooting',
    topicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceTopicKey: CISCO_TRUNK_TOPIC_KEY,
    sourceSection: 'verify-flow-classic',
    conceptCluster: 'trunk.troubleshooting',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      symptoms: [
        {
          symptom: 'VLAN 10 funktioniert nicht über den Trunk zwischen zwei Switches',
          cause: 'VLAN 10 fehlt in der "switchport trunk allowed vlan"-Liste auf mindestens einer Seite oder ist auf einem Switch nicht angelegt.',
        },
        {
          symptom: 'Ungetaggte Frames landen im falschen VLAN auf der Gegenseite',
          cause: 'Native VLAN ist auf beiden Trunk-Enden unterschiedlich konfiguriert (Native VLAN mismatch).',
        },
        {
          symptom: 'Getaggte Frames werden auf einem Switch falsch zugeordnet',
          cause: 'Auf einer Seite ist der Port Trunk, auf der anderen Access - Access-Ports können getaggte Frames nicht korrekt verarbeiten.',
        },
      ],
      description: 'Die häufigsten Trunk-Probleme sind fehlende/ersetzte allowed-VLAN-Listen, Native-VLAN-Mismatch und Port-Modus-Mismatch.',
    },
    siblings: [],
  },
];
