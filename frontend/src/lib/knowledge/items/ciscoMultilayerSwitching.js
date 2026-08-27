// =============================================================================
// Knowledge Items – Cisco Multilayer Switching (cisco-packet-tracer/multilayer-switching)
//
// Source: frontend/src/lib/academyLessons/ciscoMultilayerSwitching.js
//
// Scope note: VLAN, Trunk, Router-Basics, Static Routing and Router-on-a-Stick
// concepts are already covered by their own knowledge items. This file covers
// what the Multilayer-Switch lesson adds: L2 vs L3 capabilities, routed ports,
// "no switchport", SVIs, "ip routing", SVI state dependencies, and the
// comparison to Router-on-a-Stick.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_MULTILAYER_SWITCHING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'multilayer-switching');

export const ciscoMultilayerSwitchingKnowledgeItems = [
  {
    id: 'multilayer.l2VsL3',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'l2-l3-classic',
    conceptCluster: 'multilayer.role',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.COMPARE],
    roleHints: ['technical'],
    data: {
      items: [
        { name: 'L2-Switch', capability: 'Vermittelt innerhalb eines VLANs anhand von MAC-Adressen (Layer 2).' },
        { name: 'Multilayer-Switch', capability: 'Kann zusätzlich zwischen VLANs routen (Layer 3), aber erst nach "ip routing".' },
      ],
      description: 'Ein Multilayer-Switch vereint L2-Switching und L3-Routing; Routing muss jedoch global aktiviert werden.',
    },
    siblings: [],
  },
  {
    id: 'multilayer.routedPort',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'routed-port-classic',
    conceptCluster: 'multilayer.routedPort',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      steps: [
        'interface <Interface> (Port auswählen)',
        'no switchport (Layer-2-Funktion deaktivieren)',
        'ip address <IP> <Maske> (Layer-3-Adresse vergeben)',
      ],
      restore: 'switchport (setzt den Port wieder in den Layer-2-Modus zurück)',
      description: 'Mit "no switchport" wird ein physischer Switchport zu einem Layer-3-Routed Port; er bekommt dann eine IP-Adresse.',
    },
    siblings: [],
  },
  {
    id: 'multilayer.routedPortVsSvi',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'routed-vs-svi-visual',
    conceptCluster: 'multilayer.routedPortVsSvi',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      items: [
        { name: 'Routed Port', purpose: 'Physischer Layer-3-Port für Punkt-zu-Punkt-Verbindungen ohne VLAN-Trunk-Semantik.' },
        { name: 'SVI', purpose: 'Virtuelles Interface für genau ein VLAN; dient als Default Gateway für Hosts in diesem VLAN.' },
      ],
      description: 'Routed Port und SVI sind beides Layer-3-Interfaces auf einem Multilayer-Switch, aber mit unterschiedlicher Verwendung.',
    },
    siblings: [],
  },
  {
    id: 'multilayer.ipRouting',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'ip-routing-classic',
    conceptCluster: 'multilayer.ipRouting',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical'],
    data: {
      command: 'ip routing',
      effect: 'Aktiviert globales Layer-3-Routing auf dem Multilayer-Switch.',
      consequenceIfMissing: 'SVIs existieren, aber der Switch leitet keine Pakete zwischen verschiedenen VLANs weiter.',
      description: 'Ohne "ip routing" routet ein Multilayer-Switch nicht, auch wenn SVIs und IP-Adressen konfiguriert sind.',
    },
    siblings: [],
  },
  {
    id: 'multilayer.sviState',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'svi-status-classic',
    conceptCluster: 'multilayer.svi',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      requirements: [
        'Das VLAN muss auf dem Switch existieren.',
        'Die SVI muss mit "no shutdown" aktiviert sein.',
        'Es muss mindestens ein aktiver L2-Port oder Trunk für dieses VLAN geben.',
      ],
      statuses: {
        'up/up': 'SVI ist bereit und das VLAN ist aktiv.',
        'up/down': 'SVI ist aktiv, aber das VLAN hat keinen aktiven Port oder existiert nicht.',
        'administratively down/down': 'Die SVI ist mit "shutdown" deaktiviert.',
      },
      description: 'Eine SVI ist erst vollständig funktionsfähig, wenn das VLAN existiert und ein aktiver L2-Port/Trunk dafür vorhanden ist.',
    },
    siblings: [],
  },
  {
    id: 'multilayer.defaultGatewayVsRoute',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'gateway-vs-default-classic',
    conceptCluster: 'multilayer.defaultRoute',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      items: [
        { name: 'ip default-gateway <IP>', purpose: 'Für nicht-routende Switches, z. B. reiner L2-Switch für Management-Erreichbarkeit.' },
        { name: 'ip route 0.0.0.0 0.0.0.0 <Next-Hop>', purpose: 'Auf einem routenden Multilayer-Switch ("ip routing") für unbekannte Ziele.' },
      ],
      description: '"ip default-gateway" und "ip route 0.0.0.0/0" sind unterschiedliche Mechanismen für unterschiedliche Betriebsmodi.',
    },
    siblings: [],
  },
  {
    id: 'multilayer.roasComparison',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'l2-l3-classic',
    conceptCluster: 'multilayer.roasComparison',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      items: [
        { name: 'Router-on-a-Stick', purpose: 'Externer Router + Trunk + Subinterfaces; einfach, aber begrenzte Bandbreite auf dem Uplink.' },
        { name: 'Multilayer-Switch mit SVI', purpose: 'Routing direkt auf dem Switch via SVIs; oft schneller und ohne zusätzliches Gerät.' },
      ],
      description: 'Beide Architekturen lösen Inter-VLAN-Routing, unterscheiden sich aber in Geräteaufbau und Skalierung.',
    },
    siblings: [],
  },
  {
    id: 'multilayer.verify',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'verify-flow-classic',
    conceptCluster: 'multilayer.verify',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      commands: [
        'show vlan brief (VLANs und Ports prüfen)',
        'show interfaces trunk (Trunk-Erlaubnis prüfen)',
        'show ip interface brief (SVI- und Routed-Port-Status)',
        'show ip route (Routing-Tabelle prüfen)',
        'show interfaces status (Port-Modus access/trunk/routed)',
      ],
      note: 'Ein Gateway-Ping allein beweist kein Inter-VLAN-Routing; End-to-End-Tests zwischen Hosts verschiedener VLANs sind nötig.',
      description: 'Die Multilayer-Switch-Verifizierung kombiniert VLAN-, Trunk-, Interface- und Routing-Checks.',
    },
    siblings: [],
  },
  {
    id: 'multilayer.troubleshooting',
    topicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceTopicKey: CISCO_MULTILAYER_SWITCHING_TOPIC_KEY,
    sourceSection: 'verify-flow-classic',
    conceptCluster: 'multilayer.troubleshooting',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      symptoms: [
        {
          symptom: 'SVIs sind korrekt, aber Hosts in verschiedenen VLANs können nicht kommunizieren',
          cause: '"ip routing" ist nicht aktiviert.',
        },
        {
          symptom: 'SVI bleibt im Zustand up/down',
          cause: 'Das VLAN existiert nicht oder hat keinen aktiven L2-Port/Trunk.',
        },
        {
          symptom: 'Uplink soll mehrere VLANs transportieren, aber es funktioniert nicht',
          cause: 'Der Uplink wurde versehentlich als Routed Port statt als Trunk konfiguriert.',
        },
        {
          symptom: 'Host kann Gateway anpingen, aber nicht Hosts anderer VLANs',
          cause: 'Nur die lokale SVI ist erreichbar; Routing oder Rückweg ist noch nicht korrekt.',
        },
      ],
      description: 'Die häufigsten Multilayer-Switch-Fehler sind fehlendes "ip routing", nicht aktive VLANs/SVIs, falscher Uplink-Modus und unvollständige End-to-End-Verifikation.',
    },
    siblings: [],
  },
];
