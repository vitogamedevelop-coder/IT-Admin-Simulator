// =============================================================================
// Knowledge Items – OSI-Modell
//
// Source: frontend/src/lib/academyLessons/osi.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const OSI_TOPIC_KEY = topicKey('fundamentals', 'osi-model');
export const TCP_IP_TOPIC_KEY = topicKey('fundamentals', 'tcp-ip-model');

const OSI_LAYERS = [
  { num: 1, de: 'Bitübertragungsschicht', en: 'Physical Layer', pdu: 'Bits', devices: ['Netzwerkkarte', 'Hub', 'Repeater', 'Kabel'], protocols: ['Ethernet-PHY', 'USB', 'Bluetooth-PHY', 'DSL'], responsibility: 'elektrische, optische oder funk­basierte Übertragung von Rohdaten', typicalFaults: ['Kabelbruch', 'nicht eingestecktes Kabel', 'defekter Port'], mnemonic: 'Bitübertragung: Kabel und Funk sind hier zuhause.' },
  { num: 2, de: 'Sicherungsschicht', en: 'Data Link Layer', pdu: 'Frames', devices: ['Switch', 'Bridge', 'Access Point'], protocols: ['Ethernet', 'ARP als Verbindung zur IP-Schicht', 'PPP', 'WLAN (MAC)'], responsibility: 'lokale Übertragung von Frames über MAC-Adressen sowie Medienzugriff', typicalFaults: ['unbekannte Ziel-MAC und Flooding', 'falsche MAC-Zuordnung', 'Layer-2-Schleife'], mnemonic: 'Sicherung: Switche kennen MAC-Adressen und Frames.' },
  { num: 3, de: 'Vermittlungsschicht', en: 'Network Layer', pdu: 'Packets', devices: ['Router', 'Layer-3-Switch'], protocols: ['IPv4', 'IPv6', 'ICMP', 'OSPF', 'BGP'], responsibility: 'wegweisendes Routing zwischen Netzwerken anhand IP-Adressen', typicalFaults: ['Falsche IP', 'fehlende Route', 'falsches Gateway'], mnemonic: 'Vermittlung: Router finden den Weg durchs Netz.' },
  { num: 4, de: 'Transportschicht', en: 'Transport Layer', pdu: 'Segments', devices: ['Betriebssystem-Stack', 'Firewalls (Stateful)'], protocols: ['TCP', 'UDP', 'SCTP'], responsibility: 'Ende-zu-Ende-Verbindungen, Ports und ggf. Zuverlässigkeit', typicalFaults: ['Blockierter Port', 'TCP-Timeout'], mnemonic: 'Transport: TCP liefert zuverlässig, UDP schnell.' },
  { num: 5, de: 'Sitzungsschicht', en: 'Session Layer', pdu: 'Data', devices: ['Application-Proxy', 'Load-Balancer'], protocols: ['NetBIOS', 'RPC', 'PPTP'], responsibility: 'Aufbau, Steuerung und Beendigung von Kommunikationsdialogen', typicalFaults: ['Abgebrochene Sitzung'], mnemonic: 'Sitzung: Wer darf wann mit wem reden?' },
  { num: 6, de: 'Darstellungsschicht', en: 'Presentation Layer', pdu: 'Data', devices: ['Gateways', 'Verschlüsselungsbeschleuniger'], protocols: ['TLS/SSL', 'JPEG', 'MPEG', 'ASCII', 'UTF-8'], responsibility: 'Umsetzung von Anwendungsdaten in ein einheitliches Format', typicalFaults: ['Falsche Zeichensatzkodierung', 'fehlende Verschlüsselung'], mnemonic: 'Darstellung: Daten werden lesbar und sicher.' },
  { num: 7, de: 'Anwendungsschicht', en: 'Application Layer', pdu: 'Data', devices: ['Server', 'Client-Anwendungen'], protocols: ['HTTP', 'SMTP', 'FTP', 'DNS', 'SSH'], responsibility: 'Schnittstelle für Anwendungen wie Browser, Mail und Dateifreigabe', typicalFaults: ['Anwendungsfehler', 'falsche Konfiguration des Dienstes'], mnemonic: 'Anwendung: Hier arbeiten Browser und Mail.' },
];

// Layer data is mirrored from academyLessons/osi.js OSI_LAYERS.
export function buildOsiLayerItems() {
  return OSI_LAYERS.map((layer) => ({
    id: `osi.layer${layer.num}`,
    topicKey: OSI_TOPIC_KEY,
    sourceTopicKey: OSI_TOPIC_KEY,
    sourceSection: `layer${layer.num}-classic`,
    conceptCluster: 'osi.layers',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [
      QUESTION_ARCHETYPES.RECALL,
      QUESTION_ARCHETYPES.MAPPING,
      QUESTION_ARCHETYPES.SCENARIO,
      QUESTION_ARCHETYPES.TROUBLESHOOT,
    ],
    data: {
      description: `${layer.de} – ${layer.responsibility}`,
      layer: layer.num,
      name: layer.de,
      enName: layer.en,
      pdu: layer.pdu,
      devices: layer.devices,
      protocols: layer.protocols,
      responsibility: layer.responsibility,
      typicalFaults: layer.typicalFaults,
      mnemonic: layer.mnemonic,
    },
    siblings: OSI_LAYERS.filter((l) => l.num !== layer.num).map((l) => `osi.layer${l.num}`),
  }));
}

export const osiKnowledgeItems = [
  ...buildOsiLayerItems(),
  {
    id: 'osi.encapsulationOrder',
    topicKey: OSI_TOPIC_KEY,
    sourceTopicKey: OSI_TOPIC_KEY,
    sourceSection: 'summary-classic',
    conceptCluster: 'osi.encapsulation',
    type: KNOWLEDGE_TYPES.ORDER,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      senderOrder: [7, 6, 5, 4, 3, 2, 1],
      receiverOrder: [1, 2, 3, 4, 5, 6, 7],
      description: 'Beim Senden kapseln Daten von Schicht 7 nach Schicht 1; beim Empfangen entkapseln sie von 1 nach 7.',
    },
    siblings: [],
  },
  {
    id: 'osi.toTcpIp',
    topicKey: OSI_TOPIC_KEY,
    sourceTopicKey: OSI_TOPIC_KEY,
    sourceSection: 'intro-classic',
    conceptCluster: 'osi.tcpipMapping',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.SELECT_BEST],
    // OSI ↔ TCP/IP mapping is only valid when the tcp-ip-model topic is also
    // unlocked. The unlock check below references the prerequisite topic.
    data: {
      mapping: {
        7: { tcpIpLayer: 4, tcpIpName: 'Anwendung' },
        6: { tcpIpLayer: 4, tcpIpName: 'Anwendung' },
        5: { tcpIpLayer: 4, tcpIpName: 'Anwendung' },
        4: { tcpIpLayer: 3, tcpIpName: 'Transport' },
        3: { tcpIpLayer: 2, tcpIpName: 'Internet' },
        2: { tcpIpLayer: 1, tcpIpName: 'Netzzugang' },
        1: { tcpIpLayer: 1, tcpIpName: 'Netzzugang' },
      },
      description: 'OSI-Schichten lassen sich grob auf das vierstufige TCP/IP-Modell abbilden.',
    },
    siblings: [],
    // Mark additional prerequisite for cross-model questions.
    relatedTopicKeys: [TCP_IP_TOPIC_KEY],
  },
];
