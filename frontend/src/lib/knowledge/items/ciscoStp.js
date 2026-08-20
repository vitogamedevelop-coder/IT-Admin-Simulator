// =============================================================================
// Knowledge Items – PortFast, BPDU Guard, Native VLAN (Phase 9A)
//
// Source: frontend/src/lib/academyLessons/ciscoStp.js (PortFast/BPDU Guard
// section) and ciscoTrunk.js (Native VLAN section). Closes the P1 Knowledge-
// Layer gaps identified by the Cisco Coverage Audit:
//   A) PortFast + BPDU Guard had Academy theory but no knowledge items.
//   B) Native VLAN had Academy theory + CLI state but no knowledge items.
//
// Cisco primary-source facts encoded here (verified against Cisco IOS
// documentation, not just course notes):
//   - PortFast is for ports connected to end devices; it must NOT be enabled
//     on switch-to-switch uplinks (that could allow a forwarding loop to form
//     before STP would normally have blocked it).
//   - BPDU Guard puts a port into err-disable the moment it receives ANY BPDU
//     - it is a hard trigger, not a warning.
//   - The Native VLAN carries a trunk's UNTAGGED traffic. It is independent
//     from the access VLAN of any access port and from the trunk's allowed-
///    VLAN list.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const STP_TOPIC_KEY = topicKey('cisco-packet-tracer', 'stp');
export const TRUNK_TOPIC_KEY = topicKey('cisco-packet-tracer', 'trunk');

export const ciscoStpKnowledgeItems = [
  {
    id: 'stp.portfastPurpose',
    topicKey: STP_TOPIC_KEY,
    sourceTopicKey: STP_TOPIC_KEY,
    sourceSection: 'portfast-bpduguard-classic',
    conceptCluster: 'stp.portfast',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical'],
    data: {
      command: 'spanning-tree portfast',
      suitableFor: 'Access-Ports mit genau einem Endgerät (PC, Drucker, ...)',
      unsuitableFor: 'Uplinks/Trunks zu anderen Switches',
      reason: 'PortFast überspringt Listening/Learning und geht sofort in Forwarding. Auf einem Switch-Uplink könnte das kurzzeitig eine Schleife entstehen lassen, bevor STP sie regulär verhindert hätte.',
      description: 'PortFast beschleunigt den Verbindungsaufbau für Endgeräte, ist aber kein "STP ausschalten" und gehört ausschließlich auf Access-Ports mit Endgeräten.',
    },
    siblings: [],
  },
  {
    id: 'stp.bpduGuardPurpose',
    topicKey: STP_TOPIC_KEY,
    sourceTopicKey: STP_TOPIC_KEY,
    sourceSection: 'portfast-bpduguard-classic',
    conceptCluster: 'stp.bpduGuard',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical', 'security'],
    data: {
      command: 'spanning-tree bpduguard enable',
      trigger: 'Empfang einer BPDU (Bridge Protocol Data Unit) auf diesem Port',
      reaction: 'Der Port wird sofort in den err-disable-Zustand versetzt (abgeschaltet).',
      typicalPairing: 'Wird praktisch immer zusammen mit PortFast auf demselben Port konfiguriert.',
      meaning: 'Ein Access-Port sollte NIE eine BPDU sehen - ihr Auftauchen deutet auf einen nicht vorgesehenen zusätzlichen Switch/Hub an diesem Port hin.',
      description: 'BPDU Guard schützt PortFast-Ports davor, unbemerkt Teil der Switching-Topologie zu werden, wenn dort ein unautorisiertes Gerät angeschlossen wird.',
    },
    siblings: [],
  },
  {
    id: 'stp.portfastBpduGuardMisplacement',
    topicKey: STP_TOPIC_KEY,
    sourceTopicKey: STP_TOPIC_KEY,
    sourceSection: 'portfast-bpduguard-classic',
    conceptCluster: 'stp.misplacement',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      symptoms: [
        {
          symptom: 'PortFast + BPDU Guard wurden versehentlich auf dem Uplink zum restlichen Netz aktiviert',
          cause: 'Der Uplink empfängt regulär BPDUs von anderen Switches - er würde sofort err-disabled und den gesamten Switch vom Netz trennen.',
        },
        {
          symptom: 'Ein Arbeitsplatz-Port mit PortFast + BPDU Guard fällt plötzlich aus (err-disabled)',
          cause: 'Am Port wurde vermutlich ein weiterer, nicht vorgesehener Switch angeschlossen, der BPDUs sendet.',
        },
        {
          symptom: 'BPDU Guard ist konfiguriert, aber PortFast fehlt auf demselben Port',
          cause: 'BPDU Guard funktioniert technisch trotzdem, aber die übliche NEXUS-Konvention koppelt beide Befehle auf jedem Endgeräte-Port.',
        },
      ],
      description: 'Die Wirkung von PortFast/BPDU Guard hängt entscheidend von der Rolle des Ports ab: richtig auf Endgeräte-Ports, falsch auf Uplinks.',
    },
    siblings: [],
  },
  {
    id: 'trunk.nativeVlanVsAccessAllowed',
    topicKey: TRUNK_TOPIC_KEY,
    sourceTopicKey: TRUNK_TOPIC_KEY,
    sourceSection: 'native-vlan-classic',
    conceptCluster: 'trunk.nativeVlan',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      items: [
        { name: 'Native VLAN', command: 'switchport trunk native vlan <id>', meaning: 'VLAN für UNGETAGGTEN Traffic auf einem 802.1Q-Trunk' },
        { name: 'Access VLAN', command: 'switchport access vlan <id>', meaning: 'VLAN eines einzelnen Access-Ports (kein Trunk)' },
        { name: 'Allowed-VLAN-Liste', command: 'switchport trunk allowed vlan <ids>', meaning: 'welche VLANs überhaupt über den Trunk transportiert werden dürfen' },
      ],
      description: 'Alle drei betreffen VLAN-Zuordnung an einem Port, meinen aber unterschiedliche Dinge - ein korrektes Allowed-VLAN sagt nichts über das Native VLAN aus und umgekehrt.',
    },
    siblings: [],
  },
];
