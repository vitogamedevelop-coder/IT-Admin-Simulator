// =============================================================================
// Knowledge Items – Cisco VLAN practice (cisco-packet-tracer/vlan)
//
// Source: frontend/src/lib/academyLessons/ciscoVlan.js
//
// IMPORTANT scope note: "was ist ein VLAN" / "warum VLANs" / Access-vs-Trunk
// as an abstract concept are already covered by knowledge/items/switchingVlan.js
// under the fundamentals/vlan-basics topic - the ciscoVlan.js Academy lesson
// explicitly does NOT re-teach that, and neither do these items. This file
// only covers what the cisco-packet-tracer/vlan lesson actually ADDS on top:
// VLAN-ID ranges in practice, the Default VLAN's real behavior, the
// intra-/inter-VLAN distinction applied to a real device, and the concrete
// create/verify CLI procedure plus its most common dependency fault.
//
// Concept clusters use a "vlanCli.*" prefix (distinct from the "vlan.*"
// clusters in switchingVlan.js) so mastery/cooldown for the practical,
// device-facing knowledge here is tracked separately from the abstract
// fundamentals - closing exactly the gap the Phase 9A Consistency Audit
// found (cisco-packet-tracer/vlan had 0 Knowledge Layer items).
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_VLAN_TOPIC_KEY = topicKey('cisco-packet-tracer', 'vlan');

export const ciscoVlanPracticeKnowledgeItems = [
  {
    id: 'vlanCli.idRanges',
    topicKey: CISCO_VLAN_TOPIC_KEY,
    sourceTopicKey: CISCO_VLAN_TOPIC_KEY,
    sourceSection: 'id-bereiche-classic',
    conceptCluster: 'vlanCli.idRanges',
    type: KNOWLEDGE_TYPES.RANGE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['technical'],
    data: {
      ranges: [
        { name: 'Normal Range', ids: '1 - 1005', usage: 'für den täglichen Gebrauch - fast immer verwendet' },
        { name: 'Reserviert', ids: '1002 - 1005', usage: 'historisch für Token Ring/FDDI, in modernen Netzen ungenutzt' },
        { name: 'Extended Range', ids: '1006 - 4094', usage: 'nur auf moderneren Switches, für sehr große Umgebungen' },
      ],
      description: 'In der Praxis werden VLAN-IDs fast immer aus dem Normal Range (1-1005) vergeben, typischerweise gut merkbare zweistellige Nummern.',
    },
    siblings: [],
  },
  {
    id: 'vlanCli.defaultVlanBehavior',
    topicKey: CISCO_VLAN_TOPIC_KEY,
    sourceTopicKey: CISCO_VLAN_TOPIC_KEY,
    sourceSection: 'default-vlan-classic',
    conceptCluster: 'vlanCli.defaultVlan',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical', 'support'],
    data: {
      vlanId: 1,
      facts: [
        'Existiert auf jedem Cisco-Switch automatisch.',
        'Kann nicht gelöscht und nicht umbenannt werden.',
        'Jeder Switchport ist ihm im Auslieferungszustand zugewiesen, solange kein anderes VLAN konfiguriert wurde.',
      ],
      securityNote: 'In der Praxis wird VLAN 1 aus Sicherheitsgründen meist nicht für produktiven Datenverkehr verwendet.',
      description: 'VLAN 1 ist das nicht löschbare Default VLAN; ein Port ohne explizite VLAN-Zuweisung landet automatisch dort.',
    },
    siblings: [],
  },
  {
    id: 'vlanCli.intraVsInterCommunication',
    topicKey: CISCO_VLAN_TOPIC_KEY,
    sourceTopicKey: CISCO_VLAN_TOPIC_KEY,
    sourceSection: 'kommunikation-classic',
    conceptCluster: 'vlanCli.communication',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical', 'support'],
    data: {
      sameVlan: 'Der Switch vermittelt direkt anhand der Ziel-MAC-Adresse (Layer 2) - kein Router nötig.',
      differentVlan: 'Ein Switch leitet standardmäßig NICHTS zwischen VLANs weiter - dafür wird ein Layer-3-Gerät (Router oder Multilayer-Switch) benötigt, das anhand der IP-Adresse routet.',
      description: 'Innerhalb eines VLANs reicht Layer 2; zwischen VLANs ist immer ein Layer-3-Gerät nötig - wie das konkret aufgebaut wird, ist Inhalt späterer Lektionen.',
    },
    siblings: [],
  },
  {
    id: 'vlanCli.createVerifyProcedure',
    topicKey: CISCO_VLAN_TOPIC_KEY,
    sourceTopicKey: CISCO_VLAN_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'vlanCli.procedure',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      steps: [
        'vlan <VLAN-ID> (VLAN anlegen bzw. dessen Konfigurationsmodus betreten)',
        'name <Name> (VLAN benennen)',
        'exit (VLAN-Konfigurationsmodus verlassen)',
        'show vlan brief (Ergebnis kompakt prüfen)',
      ],
      description: 'Ein VLAN wird angelegt, benannt, der Modus verlassen und die Konfiguration anschließend verifiziert.',
    },
    siblings: [],
  },
  {
    id: 'vlanCli.assignmentDependency',
    topicKey: CISCO_VLAN_TOPIC_KEY,
    sourceTopicKey: CISCO_VLAN_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'vlanCli.dependency',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical', 'support'],
    data: {
      symptoms: [
        {
          symptom: '"switchport access vlan 30" auf einem Port zeigt keine Wirkung / das Gerät landet nicht im erwarteten VLAN',
          cause: 'VLAN 30 wurde noch nicht mit "vlan 30" angelegt - ein Port kann keinem VLAN zugewiesen werden, das nicht existiert.',
        },
        {
          symptom: 'Ein Kollege fragt, ob es reicht, ein VLAN nur auf dem Switch anzulegen, damit der neue Arbeitsplatz funktioniert',
          cause: 'Nein - das VLAN allein bewirkt nichts. Zusätzlich muss der jeweilige Port diesem VLAN als Access-Port zugewiesen werden.',
        },
      ],
      description: 'Ein VLAN muss zuerst existieren, bevor es einem Port zugewiesen werden kann; das Anlegen allein reicht nicht - der Port muss zusätzlich zugewiesen werden.',
    },
    siblings: [],
  },
];
