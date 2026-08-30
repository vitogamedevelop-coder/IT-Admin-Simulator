// =============================================================================
// Knowledge Items – Active Directory Logical Components
//
// Source: frontend/src/lib/academyLessons/adLogicalComponents.js
// Primary references: Microsoft Learn – Active Directory Domain Services
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const AD_DOMAIN_TOPIC_KEY = topicKey('active-directory-virtualbox', 'domain');
export const AD_OU_TOPIC_KEY = topicKey('active-directory-virtualbox', 'organizational-units');
export const AD_DC_TOPIC_KEY = topicKey('active-directory-virtualbox', 'domain-controller');

export const adLogicalComponentsKnowledgeItems = [
  // ---------------------------------------------------------------------------
  // Domain
  // ---------------------------------------------------------------------------
  {
    id: 'ad.logicalPhysical.definition',
    topicKey: AD_DOMAIN_TOPIC_KEY,
    sourceTopicKey: AD_DOMAIN_TOPIC_KEY,
    sourceSection: 'domain-logisch-physikalisch-classic',
    conceptCluster: 'ad.logicalPhysical',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'logische vs. physische Komponenten in AD',
      definition: 'Logische Komponenten beschreiben die organisatorische Struktur (Domäne, OU, Objekt). Physische Komponenten sind Geräte, Server und Infrastruktur.',
      distractorDefinitions: [
        'Physische Komponenten sind Benutzer und Gruppen.',
        'Logische Komponenten sind Kabel und Server.',
        'Domäne und Domain Controller sind beides physische Server.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.domain.definition',
    topicKey: AD_DOMAIN_TOPIC_KEY,
    sourceTopicKey: AD_DOMAIN_TOPIC_KEY,
    sourceSection: 'domain-definition-classic',
    conceptCluster: 'ad.domain',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Domäne in Active Directory',
      definition: 'Eine Domäne ist eine grundlegende logische Struktur in AD, die einen Verwaltungsbereich und einen Namensraum bildet.',
      distractorDefinitions: [
        'Eine Domäne ist ein physischer Server.',
        'Eine Domäne ist eine Sicherheitsgruppe.',
        'Eine Domäne ist dasselbe wie ein Domain Controller.',
      ],
    },
    roleHints: ['technical', 'management'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.domain.namespace',
    topicKey: AD_DOMAIN_TOPIC_KEY,
    sourceTopicKey: AD_DOMAIN_TOPIC_KEY,
    sourceSection: 'domain-definition-classic',
    conceptCluster: 'ad.domain',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'DNS-Namensraum einer AD-Domäne',
      description: 'Eine AD-Domäne verwendet einen DNS-Namensraum, zum Beispiel nexus.local. Sie ist aber nicht in jeder Hinsicht identisch mit einer DNS-Zone.',
      distractorDescriptions: [
        'AD-Domäne und DNS-Zone sind immer identisch.',
        'Eine Domäne braucht keinen DNS-Namensraum.',
        'Der DNS-Namensraum ersetzt die OU-Struktur.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.domain.vsOu',
    topicKey: AD_DOMAIN_TOPIC_KEY,
    sourceTopicKey: AD_DOMAIN_TOPIC_KEY,
    sourceSection: 'domain-vs-ou-classic',
    conceptCluster: 'ad.domain',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      term: 'Domäne vs. OU',
      description: 'Die Domäne ist der übergeordnete logische Verwaltungs- und Namensraum. Eine OU liegt innerhalb einer Domäne und organisiert Objekte.',
      distractorDescriptions: [
        'Eine OU ist größer als eine Domäne.',
        'Eine OU ersetzt eine Domäne.',
        'Jede Abteilung braucht automatisch eine eigene Domäne.',
      ],
    },
    roleHints: ['technical', 'management'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.domain.vsDc',
    topicKey: AD_DOMAIN_TOPIC_KEY,
    sourceTopicKey: AD_DOMAIN_TOPIC_KEY,
    sourceSection: 'domain-vs-dc-classic',
    conceptCluster: 'ad.domain',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      term: 'Domäne vs. Domain Controller',
      description: 'Die Domäne ist ein logischer Verwaltungsraum. Der Domain Controller ist ein Server, der AD DS bereitstellt.',
      distractorDescriptions: [
        'Domäne und Domain Controller sind dasselbe.',
        'Eine Domäne ist ein physischer Server.',
        'Ein Domain Controller ist eine OU.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  // ---------------------------------------------------------------------------
  // Organizational Units
  // ---------------------------------------------------------------------------
  {
    id: 'ad.ou.definition',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-definition-classic',
    conceptCluster: 'ad.ou',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Organisationseinheit (OU)',
      definition: 'Eine OU ist ein Container in Active Directory, der Objekte innerhalb einer Domäne logisch und administrativ organisiert.',
      distractorDefinitions: [
        'Eine OU ist eine Sicherheitsgruppe.',
        'Eine OU ist eine eigene Domäne.',
        'Eine OU ersetzt den Domain Controller.',
      ],
    },
    roleHints: ['technical', 'management'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.ou.purpose',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-definition-classic',
    conceptCluster: 'ad.ou',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Zweck einer OU',
      description: 'OUs gruppieren Objekte, bilden organisatorische Strukturen ab, verbessern die Auffindbarkeit und vereinfachen die Verwaltung.',
      distractorDescriptions: [
        'OUs vergeben Berechtigungen wie Sicherheitsgruppen.',
        'OUs ersetzen Domain Controller.',
        'OUs definieren das AD-Schema.',
      ],
    },
    roleHints: ['technical', 'management'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.ou.vsGroup',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-vs-gruppe-classic',
    conceptCluster: 'ad.ou',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      term: 'OU vs. Gruppe',
      description: 'Eine OU strukturiert Objekte organisatorisch. Eine Gruppe verwaltet typischerweise Mitgliedschaften und Berechtigungen.',
      distractorDescriptions: [
        'OU und Gruppe sind dasselbe.',
        'Eine OU erteigt Berechtigungen, eine Gruppe strukturiert.',
        'Gruppen dürfen keine Benutzer enthalten.',
      ],
    },
    roleHints: ['technical', 'management', 'security'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.object.hierarchy',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-hierarchie-classic',
    conceptCluster: 'ad.object',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.ORDERING],
    data: {
      subject: 'AD-Hierarchie',
      description: 'Die logische Hierarchie lautet: Domäne → OU → Objekt.',
      distractorDescriptions: [
        'Objekt liegt über der Domäne.',
        'OU liegt über der Domäne.',
        'Domäne liegt unter dem Objekt.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.dn.definition',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'dn-einfuehrung-classic',
    conceptCluster: 'ad.dn',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Distinguished Name (DN)',
      definition: 'Ein Distinguished Name beschreibt die eindeutige Position eines Objekts innerhalb der AD-Namensstruktur.',
      distractorDefinitions: [
        'Ein DN ist der Name eines Domain Controllers.',
        'Ein DN ersetzt das AD-Schema.',
        'Ein DN ist ein physisches Netzwerkkabel.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.dn.components',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'dn-einfuehrung-classic',
    conceptCluster: 'ad.dn',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.MATCHING],
    data: {
      subject: 'Komponenten eines Distinguished Name',
      description: 'CN steht für Common Name, OU für Organizational Unit und DC für Domain Component.',
      distractorDescriptions: [
        'CN bedeutet Computer Name.',
        'DC im DN bedeutet Domain Controller.',
        'OU bedeutet Output Unit.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.dc.ambiguity',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'dn-dc-missverstaendnis-classic',
    conceptCluster: 'ad.dc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      term: 'DC-Zweideutigkeit',
      description: 'DC als Serverrolle bedeutet Domain Controller. DC im Distinguished Name bedeutet Domain Component.',
      distractorDescriptions: [
        'DC bedeutet in beiden Kontexten dasselbe.',
        'DC im DN steht für Data Center.',
        'Ein Domain Controller ist ein Domain Component.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  // ---------------------------------------------------------------------------
  // Domain Controller
  // ---------------------------------------------------------------------------
  {
    id: 'ad.dc.definition',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'dc-definition-classic',
    conceptCluster: 'ad.dc',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Domain Controller',
      definition: 'Ein Domain Controller ist ein Server, auf dem Active Directory Domain Services installiert sind und der Verzeichnisdaten sowie Authentifizierung bereitstellt.',
      distractorDefinitions: [
        'Ein Domain Controller ist die gesamte Domäne.',
        'Ein Domain Controller ist ein Client-PC.',
        'Ein Domain Controller ist eine OU.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.dc.role',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'dc-definition-classic',
    conceptCluster: 'ad.dc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Aufgaben eines Domain Controllers',
      description: 'Ein DC hostet AD DS, hält eine Kopie der Verzeichnisdatenbank, verarbeitet Verzeichnisanfragen und unterstützt die Authentifizierung.',
      distractorDescriptions: [
        'Ein DC verwaltet nur lokale Benutzerkonten.',
        'Ein DC ersetzt DNS vollständig.',
        'Ein DC ist ausschließlich für Dateifreigaben zuständig.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.dc.redundancy',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'dc-mehrere-classic',
    conceptCluster: 'ad.dc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Mehrere Domain Controller',
      description: 'Eine Domäne kann mehrere Domain Controller haben, um Verfügbarkeit und Redundanz zu erhöhen.',
      distractorDescriptions: [
        'Mehrere DCs ersetzen die Notwendigkeit von OUs.',
        'Jeder DC benötigt seine eigene Domäne.',
        'Mehrere DCs verhindern jegliche Replikation.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.dc.physicalLogical',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'dc-physisch-logisch-classic',
    conceptCluster: 'ad.dc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      term: 'Physisch vs. logisch am DC',
      description: 'Ein Domain Controller ist physisch oder virtuell ein Server. Domäne, OU und Objekte sind logische Strukturen, die dieser Server bereitstellt.',
      distractorDescriptions: [
        'Eine Domäne ist ein physischer Server.',
        'Ein Domain Controller ist eine logische Struktur ohne Hardware.',
        'OUs sind physische Geräte.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
];
