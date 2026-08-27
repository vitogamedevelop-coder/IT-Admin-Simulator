// =============================================================================
// Knowledge Items – Cisco Packet Filter / Stateful Inspection
//
// Source: frontend/src/lib/academyLessons/ciscoPacketfilter.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_PACKETFILTER_TOPIC_KEY = topicKey('cisco-packet-tracer', 'packet-filter');

export const ciscoPacketFilterKnowledgeItems = [
  {
    id: 'ciscoPacketFilter.stateless',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'stateless-classic',
    conceptCluster: 'packetfilter.fundamentals',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      statement: 'Ein stateless Paketfilter entscheidet für jedes Paket isoliert anhand der konfigurierten Regeln.',
      consequence: 'Der Filter kennt keine vorherigen Pakete und merkt sich keinen Verbindungszustand.',
      implementation: 'In diesem Lehrgang basiert ein stateless Filter auf Extended ACLs.',
      description: 'Stateless bedeutet: jedes Paket wird einzeln geprüft, ohne Bezug zur Kommunikationshistorie.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.returnTrafficProblem',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'stateless-problems-classic',
    conceptCluster: 'packetfilter.fundamentals',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    data: {
      statement: 'Statische Paketfilter haben Schwierigkeiten beim Rückverkehr, weil sie die zugehörige Anfrage nicht kennen.',
      problems: [
        'Rückverkehr muss separat erlaubt werden.',
        'Regelwerke werden schnell größer und unübersichtlich.',
        'Zu weit gefasste Freigaben entstehen leicht.',
        'Hoher manueller Pflegeaufwand.',
      ],
      description: 'Weil stateless Filter keine Verbindungen kennen, müssen Antwortpakete explizit im Regelwerk berücksichtigt werden.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.stateful',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'stateful-classic',
    conceptCluster: 'packetfilter.fundamentals',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      statement: 'Ein stateful Paketfilter berücksichtigt den Zustand einer Verbindung.',
      flow: [
        'Client initiiert Verbindung nach außen.',
        'Paketfilter erlaubt ausgehenden Verkehr.',
        'Stateful Inspection speichert die Session.',
        'Antwortpaket kommt zurück.',
        'Paketfilter erkennt die Session und lässt die Antwort durch.',
      ],
      description: 'Stateful merkt sich initiierte Verbindungen und erlaubt passenden Rückverkehr automatisch.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.cbacInspect',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'cbac-classic',
    conceptCluster: 'packetfilter.spi',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.ORDERING],
    data: {
      statement: 'Cisco CBAC implementiert Stateful Inspection über ip inspect.',
      context: 'Klassisches Cisco IOS-/Packet-Tracer-Lernprofil, nicht universelle moderne Best-Practice.',
      examples: [
        { command: 'ip inspect name INTERNET tcp' },
        { command: 'ip inspect name INTERNET udp' },
      ],
      description: 'ip inspect name <NAME> <Protokoll> definiert, welche Protokolle inspiziert werden.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.established',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'established-classic',
    conceptCluster: 'packetfilter.spi',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    data: {
      statement: 'established in Extended ACLs prüft TCP-Flags, speichert aber keine echte Verbindungstabelle.',
      examples: [
        { command: 'permit tcp any any established' },
      ],
      difference: 'established ist ein Flag-Check; CBAC/ip inspect speichert Session-Zustände.',
      description: 'established erlaubt ACK/RST-Pakete, ist aber keine vollständige Stateful Inspection.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.aclInspectRelationship',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'acl-inspect-classic',
    conceptCluster: 'packetfilter.spi',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    data: {
      statement: 'ACL und ip inspect arbeiten zusammen, SPI ersetzt die ACL nicht.',
      roles: [
        { role: 'ACL', purpose: 'Legt fest, welcher ausgehende Verkehr grundsätzlich erlaubt ist.' },
        { role: 'ip inspect', purpose: 'Merkt sich Sessions und erlaubt passenden Rückverkehr temporär.' },
      ],
      description: 'Die ACL definiert die Baseline-Policy; SPI ergänzt dynamische Session-Freigaben.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.bindingDirection',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'binding-visual',
    conceptCluster: 'packetfilter.spi',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    data: {
      statement: 'SPI muss in Flussrichtung der ausgehenden Anfrage liegen; die ACL blockiert typischerweise entgegengesetzte eingehende Verkehr.',
      examples: [
        { binding: 'ip inspect INTERNET out', note: 'Beobachtet ausgehende Verbindungen auf g0/1' },
        { binding: 'ip access-group WAN_IN in', note: 'Blockiert unerwünschten eingehenden Verkehr auf g0/1' },
      ],
      description: 'Richtungen werden aus Sicht des Router-Interfaces betrachtet; SPI und ACL können auf demselben Interface in entgegengesetzte Richtungen wirken.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.sessionTemp',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'session-classic',
    conceptCluster: 'packetfilter.spi',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      statement: 'Stateful-Einträge sind temporär.',
      lifecycle: [
        'Session wird durch ausgehende Anfrage erzeugt.',
        'Passender Rückverkehr wird temporär erlaubt.',
        'Nach Verbindungsende oder Timeout verschwindet die Session.',
      ],
      description: 'Temporäre Regeln ersetzen keinen dauerhaften ACL-Eintrag.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.verify',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'verify-classic',
    conceptCluster: 'packetfilter.verify',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      mapping: [
        { command: 'show ip inspect config', purpose: 'Konfigurierte Inspection Rules und Bindungen' },
        { command: 'show ip inspect interfaces', purpose: 'Interfaces mit SPI-Bindung und Richtung' },
        { command: 'show ip inspect sessions', purpose: 'Aktive inspizierte Sessions' },
        { command: 'show ip inspect statistics', purpose: 'Session-Count, Paket-Statistik' },
        { command: 'show access-lists', purpose: 'ACL-Regeln und Match-Zähler' },
        { command: 'show ip interface <IF>', purpose: 'ACL- und SPI-Bindung auf dem Interface' },
      ],
      description: 'Verifizierung zeigt Rule-Definition, Bindung und aktive Sessions.',
    },
    siblings: [],
  },
  {
    id: 'ciscoPacketFilter.troubleshooting',
    topicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceTopicKey: CISCO_PACKETFILTER_TOPIC_KEY,
    sourceSection: 'troubleshooting-classic',
    conceptCluster: 'packetfilter.troubleshoot',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      symptoms: [
        { symptom: 'ACL blockiert Verkehr bereits', cause: 'First Match / implicit deny / falsche Reihenfolge' },
        { symptom: 'Rückverkehr kommt nicht an', cause: 'ip inspect fehlt, falsches Interface oder falsche Richtung' },
        { symptom: 'Bestimmtes Protokoll funktioniert nicht', cause: 'Protokoll nicht in ip inspect name enthalten' },
        { symptom: 'Verkehr funktionierte kurz, jetzt nicht mehr', cause: 'Session abgelaufen' },
        { symptom: 'ip inspect wird nicht angewendet', cause: 'Inspection Rule nicht definiert' },
      ],
      description: 'Packet-Filter-Probleme lassen sich über ACL-Regeln, SPI-Definition, Bindung/Richtung und Sessions eingrenzen.',
    },
    siblings: [],
  },
];
