// =============================================================================
// Knowledge Items – Cisco Access-Port (cisco-packet-tracer/access-port)
//
// Source: frontend/src/lib/academyLessons/ciscoAccessPort.js
//
// Scope note: the abstract Access-vs-Trunk distinction already exists as
// knowledge/items/switchingVlan.js's "vlan.accessVsTrunk" (fundamentals/
// vlan-basics). These items instead cover what the Academy's Access-Port
// lesson actually adds: the concrete CLI procedure, interface range usage,
// the applied "why does THIS port not need a trunk" reasoning in a real
// NEXUS scenario, and the concrete misconfiguration/troubleshooting space
// (wrong mode, missing VLAN, typoed interface). Closes the gap the Phase 9A
// Consistency Audit found (cisco-packet-tracer/access-port had 0 items).
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_ACCESS_PORT_TOPIC_KEY = topicKey('cisco-packet-tracer', 'access-port');

export const ciscoAccessPortKnowledgeItems = [
  {
    id: 'accessPort.purpose',
    topicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceTopicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceSection: 'wozu-classic',
    conceptCluster: 'accessPort.purpose',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      definition: 'Ein Access-Port verbindet genau EIN Endgerät (PC, Drucker, IP-Telefon, Access Point) mit dem Switch und überträgt Frames für genau EIN VLAN, und zwar ungetaggt.',
      contrast: 'Im Gegensatz zum Trunk-Port, der mehrere VLANs zwischen Netzwerkgeräten transportiert.',
      description: 'Ein Access-Port ist der Port-Typ für praktisch jeden normalen Benutzeranschluss.',
    },
    siblings: [],
  },
  {
    id: 'accessPort.configCommands',
    topicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceTopicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'accessPort.procedure',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      steps: [
        'interface <Interface> (Schnittstelle auswählen)',
        'switchport mode access (Port-Typ festlegen)',
        'switchport access vlan <VLAN-ID> (VLAN zuweisen)',
        'show vlan brief oder show interfaces switchport (Ergebnis prüfen)',
      ],
      description: 'Ein Access-Port wird ausgewählt, als Access-Modus festgelegt, einem VLAN zugewiesen und anschließend verifiziert.',
    },
    siblings: [],
  },
  {
    id: 'accessPort.rangeConfig',
    topicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceTopicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceSection: 'mehrere-ports-classic',
    conceptCluster: 'accessPort.range',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      command: 'interface range <Interface-Liste>',
      effect: 'Wählt mehrere Schnittstellen gleichzeitig aus; alle danach eingegebenen Befehle gelten für jeden Port in der Liste.',
      whenToUse: 'Wenn mehrere Ports (z. B. ein ganzer Bereich von Benutzer-Ports) dieselbe Konfiguration erhalten sollen.',
      description: '"interface range" erspart es, dieselbe Konfiguration für viele Ports einzeln zu wiederholen.',
    },
    siblings: [],
  },
  {
    id: 'accessPort.whyNotTrunk',
    topicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceTopicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceSection: 'wozu-classic',
    conceptCluster: 'accessPort.accessVsTrunkApplication',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.COMPARE],
    roleHints: ['technical', 'support', 'management'],
    data: {
      items: [
        { name: 'Arbeitsplatz-Port (Access)', reason: 'bedient genau ein Endgerät, das nur einem VLAN angehört - Tagging wäre unnötiger Aufwand' },
        { name: 'Uplink zu einem anderen Switch (Trunk)', reason: 'muss mehrere VLANs gleichzeitig transportieren, deshalb werden Frames dort getaggt' },
      ],
      description: 'Ob ein Port Access oder Trunk sein soll, hängt davon ab, ob dahinter ein einzelnes Endgerät (ein VLAN) oder eine Verbindung zu einem weiteren Netzwerkgerät (mehrere VLANs) hängt.',
    },
    siblings: [],
  },
  {
    id: 'accessPort.misconfigurationDiagnosis',
    topicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceTopicKey: CISCO_ACCESS_PORT_TOPIC_KEY,
    sourceSection: 'fehler-classic',
    conceptCluster: 'accessPort.troubleshooting',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      symptoms: [
        {
          symptom: 'Ein PC an Fa0/4 soll zum Personal-VLAN gehören, der Port zeigt aber weiterhin VLAN 30 (ein anderes VLAN) in "show vlan brief"',
          cause: 'Der Port wurde nicht (oder falsch) dem Personal-VLAN zugewiesen - "switchport access vlan <richtige ID>" fehlt oder wurde mit der falschen ID ausgeführt.',
        },
        {
          symptom: 'Ein Endgerät bekommt trotz korrektem VLAN keine erwartete Verbindung, der Port zeigt "Administrative Mode: trunk"',
          cause: 'Der Port wurde versehentlich als Trunk statt Access konfiguriert ("switchport mode trunk" statt "switchport mode access").',
        },
        {
          symptom: 'Die Konfiguration wurde eingegeben, landet aber offenbar auf dem falschen Port',
          cause: 'Ein Tippfehler in der Interface-Bezeichnung (z. B. "fa0/3" statt "fa0/13").',
        },
      ],
      description: 'Die häufigsten Access-Port-Fehler sind: falsches/fehlendes VLAN, versehentlicher Trunk-Modus, oder ein falsch adressiertes Interface.',
    },
    siblings: [],
  },
];
