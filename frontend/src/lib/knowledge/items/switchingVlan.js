// =============================================================================
// Knowledge Items – Switching & VLAN
//
// Sources:
//   - frontend/src/lib/academyLessons/switching.js
//   - frontend/src/lib/academyLessons/vlanBasics.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const SWITCHING_TOPIC_KEY = topicKey('fundamentals', 'switching');
export const VLAN_BASICS_TOPIC_KEY = topicKey('fundamentals', 'vlan-basics');

export const switchingVlanKnowledgeItems = [
  // ---------------------------------------------------------------------------
  // Switching
  // ---------------------------------------------------------------------------
  {
    id: 'switching.deviceCompare',
    topicKey: SWITCHING_TOPIC_KEY,
    sourceTopicKey: SWITCHING_TOPIC_KEY,
    sourceSection: 'vergleich-classic',
    conceptCluster: 'switching.devices',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      items: [
        { name: 'Hub', osiLayer: 1, behavior: 'Sendet jedes eingehende Signal an alle Ports', status: 'veraltet' },
        { name: 'Switch', osiLayer: 2, behavior: 'Sendet Frames gezielt anhand der Ziel-MAC', status: 'Standard in modernen LANs' },
        { name: 'Router', osiLayer: 3, behavior: 'Leitet Pakete zwischen Netzen anhand von IP weiter', status: 'Standard für Routing' },
      ],
      description: 'Hub, Switch und Router unterscheiden sich in der OSI-Schicht und im Weiterleitungsverhalten.',
    },
    siblings: [],
  },
  {
    id: 'switching.macLearning',
    topicKey: SWITCHING_TOPIC_KEY,
    sourceTopicKey: SWITCHING_TOPIC_KEY,
    sourceSection: 'mac-tabelle-classic',
    conceptCluster: 'switching.macTable',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      steps: [
        'Ein Frame trifft an einem Port ein.',
        'Der Switch liest die Absender-MAC-Adresse aus.',
        'Switch trägt MAC-Adresse und Eingangsport in die MAC-Adresstabelle ein.',
        'Vorgang wiederholt sich für jeden weiteren Frame.',
      ],
      description: 'Ein Switch lernt durch eingehende Frames, welche MAC-Adresse an welchem Port erreichbar ist.',
    },
    siblings: [],
  },
  {
    id: 'switching.forwardFloodFilter',
    topicKey: SWITCHING_TOPIC_KEY,
    sourceTopicKey: SWITCHING_TOPIC_KEY,
    sourceSection: 'forwarding-classic',
    conceptCluster: 'switching.actions',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    data: {
      cases: [
        { condition: 'Ziel-MAC bekannt', action: 'Forward', meaning: 'Frame geht nur an den passenden Port.' },
        { condition: 'Ziel-MAC unbekannt oder Broadcast', action: 'Flood', meaning: 'Frame geht an alle Ports außer dem Eingangsport.' },
        { condition: 'Quelle und Ziel am selben Port', action: 'Filter', meaning: 'Frame wird nicht auf einen anderen Port weitergeleitet.' },
      ],
      description: 'Der Switch entscheidet pro Frame anhand seiner MAC-Tabelle, ob er weiterleitet, flutet oder filtert.',
    },
    siblings: [],
  },
  {
    id: 'switching.domains',
    topicKey: SWITCHING_TOPIC_KEY,
    sourceTopicKey: SWITCHING_TOPIC_KEY,
    sourceSection: 'domaenen-classic',
    conceptCluster: 'switching.domains',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.COMPARE],
    data: {
      collisionDomain: 'Jeder Switch-Port bildet für sich eine eigene Kollisionsdomäne.',
      broadcastDomain: 'Alle an einen (oder mehrere verbundene) Switch angeschlossenen Geräte bilden ohne VLANs eine gemeinsame Broadcast-Domäne.',
      description: 'Switching trennt Kollisionsdomänen pro Port, nicht aber Broadcast-Domänen.',
    },
    siblings: [],
  },

  // ---------------------------------------------------------------------------
  // VLAN
  // ---------------------------------------------------------------------------
  {
    id: 'vlan.definition',
    topicKey: VLAN_BASICS_TOPIC_KEY,
    sourceTopicKey: VLAN_BASICS_TOPIC_KEY,
    sourceSection: 'was-classic',
    conceptCluster: 'vlan.concept',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      definition: 'Ein VLAN (Virtual Local Area Network) teilt ein physisches Netzwerk logisch in mehrere getrennte Netze auf.',
      effect: 'VLANs teilen eine gemeinsame Broadcast-Domäne in mehrere kleinere auf.',
      description: 'VLANs ermöglichen logische Trennung unabhängig von der physischen Verkabelung.',
    },
    siblings: [],
  },
  {
    id: 'vlan.benefits',
    topicKey: VLAN_BASICS_TOPIC_KEY,
    sourceTopicKey: VLAN_BASICS_TOPIC_KEY,
    sourceSection: 'warum-classic',
    conceptCluster: 'vlan.reasons',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      benefits: [
        { name: 'Sicherheit', description: 'Abteilungen logisch trennen, auch am selben Switch' },
        { name: 'Weniger Broadcast-Verkehr', description: 'Kleinere Broadcast-Domänen pro VLAN' },
        { name: 'Flexibilität', description: 'VLAN-Zugehörigkeit unabhängig vom physischen Standort' },
        { name: 'Struktur', description: 'Netzwerke nach Funktion statt Standort organisieren' },
      ],
      description: 'VLANs verbessern Sicherheit, Reduzieren Broadcast-Verkehr, erhöhen Flexibilität und Struktur.',
    },
    siblings: [],
  },
  {
    id: 'vlan.accessVsTrunk',
    topicKey: VLAN_BASICS_TOPIC_KEY,
    sourceTopicKey: VLAN_BASICS_TOPIC_KEY,
    sourceSection: 'ports-classic',
    conceptCluster: 'vlan.ports',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      items: [
        { name: 'Access-Port', carries: 'genau ein VLAN', endpoint: 'Endgerät', tagged: false },
        { name: 'Trunk-Port', carries: 'mehrere VLANs', endpoint: 'Switch ↔ Switch/Router', tagged: true },
      ],
      description: 'Access-Ports bedienen ein einzelnes Endgerät; Trunk-Ports transportieren mehrere VLANs zwischen Netzwerkgeräten.',
    },
    siblings: [],
  },
  {
    id: 'vlan.tagging',
    topicKey: VLAN_BASICS_TOPIC_KEY,
    sourceTopicKey: VLAN_BASICS_TOPIC_KEY,
    sourceSection: 'tagging-classic',
    conceptCluster: 'vlan.ports',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      standard: 'IEEE 802.1Q',
      description: 'Auf Trunk-Leitungen wird jedem Frame ein VLAN-Tag mit der VLAN-ID hinzugefügt, damit der empfangende Switch das VLAN erkennt.',
      accessPortNote: 'Auf Access-Ports kommen beim Endgerät ungetaggte Frames an.',
    },
    siblings: [],
  },
  {
    id: 'vlan.problemSolved',
    topicKey: VLAN_BASICS_TOPIC_KEY,
    sourceTopicKey: VLAN_BASICS_TOPIC_KEY,
    sourceSection: 'probleme-classic',
    conceptCluster: 'vlan.reasons',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    data: {
      problem: 'Zu große, gemeinsame Broadcast-Domäne und fehlende logische Trennung.',
      solution: 'VLANs teilen das physische Netz in mehrere kleine, logisch getrennte Broadcast-Domänen auf.',
      description: 'Das Hauptproblem, das VLANs lösen, ist die Aufteilung großer Broadcast-Domänen.',
    },
    siblings: [],
  },
];
