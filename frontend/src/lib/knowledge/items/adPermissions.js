// =============================================================================
// Knowledge Items – Active Directory Berechtigungsverwaltung (Kapitel 4)
//
// Source: Lehrgangsmaterial des Nutzers, Kapitel 4
// Source classifications:
//   COURSE_FACT          = unproblematische Lehrgangsaussage
//   COURSE_SIMPLIFICATION = didaktisch vereinfachte Darstellung
//   COURSE_ERROR         = problematische oder zu pauschale Lehrgangsaussage
//   VERIFIED_FACT        = allgemein technisch gültige Einordnung
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const AD_PERMISSIONS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-permissions');

export const adPermissionsKnowledgeItems = [
  {
    id: 'adp.leastPrivilege',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'least-privilege',
    conceptCluster: 'ad.permissions.privilege',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      term: 'Least Privilege',
      definition: 'Least Privilege bedeutet, dass Benutzer, Computer und Dienste nur die Rechte erhalten, die sie für ihre Aufgabe tatsächlich benötigen.',
      distractorDefinitions: [
        'Jeder Benutzer erhält maximal mögliche Rechte, um Verwaltungsaufwand zu vermeiden.',
        'Administratorkonten dürfen keine Rechte haben.',
        'Rechte werden immer an Einzelpersonen vergeben.',
      ],
    },
    roleHints: ['security', 'management', 'technical'],
    sourceClassification: 'VERIFIED_FACT',
  },
  {
    id: 'adp.group.security',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'gruppentypen',
    conceptCluster: 'ad.permissions.group',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Sicherheitsgruppe',
      definition: 'Eine Sicherheitsgruppe wird für Berechtigungen und Zugriff auf Ressourcen verwendet.',
      distractorDefinitions: [
        'Eine Sicherheitsgruppe dient ausschließlich der E-Mail-Verteilung.',
        'Sicherheitsgruppen können nicht für NTFS-Berechtigungen genutzt werden.',
        'Sicherheitsgruppen ersetzen den DNS-Server.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adp.group.distribution',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'gruppentypen',
    conceptCluster: 'ad.permissions.group',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Verteilergruppe',
      definition: 'Eine Verteilergruppe dient vor allem der Verteilung bzw. Adressierung, typischerweise für E-Mail, und ist nicht für Zugriffsberechtigungen vorgesehen.',
      distractorDefinitions: [
        'Eine Verteilergruppe kann direkt für NTFS-Berechtigungen verwendet werden.',
        'Verteilergruppen sind Sicherheitsgruppen mit besonderen Rechten.',
        'Verteilergruppen ersetzen Benutzerkonten.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adp.group.global',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'gruppenbereiche',
    conceptCluster: 'ad.permissions.group.scope',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      subject: 'globale Gruppe',
      description: 'Globale Gruppen organisieren Benutzer oder Computer mit ähnlichen Anforderungen. Laut Lehrgang können sie auf Ressourcen innerhalb der Gesamtstruktur verwendet werden.',
      distractorDescriptions: [
        'Globale Gruppen dürfen keine Benutzer als Mitglieder enthalten.',
        'Eine globale Gruppe greift eigenständig auf Ressourcen zu, ohne dass Berechtigungen vergeben wurden.',
        'Globale Gruppen können nur in derselben OU existieren.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_SIMPLIFICATION',
  },
  {
    id: 'adp.group.dl',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'gruppenbereiche',
    conceptCluster: 'ad.permissions.group.scope',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      subject: 'domänenlokale Gruppe',
      description: 'Domänenlokale Gruppen werden vor allem für Berechtigungen auf Ressourcen einer bestimmten Domäne genutzt.',
      distractorDescriptions: [
        'Domänenlokale Gruppen dürfen keine globalen Gruppen als Mitglieder enthalten.',
        'Domänenlokale Gruppen sind nur für E-Mail-Verteilung gedacht.',
        'Domänenlokale Gruppen können ausschließlich Benutzer aus anderen Gesamtstrukturen enthalten.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adp.group.universal',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'gruppenbereiche',
    conceptCluster: 'ad.permissions.group.scope',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      subject: 'universelle Gruppe',
      description: 'Universelle Gruppen können Konten und geeignete Gruppen aus verschiedenen Domänen derselben Gesamtstruktur zusammenfassen.',
      distractorDescriptions: [
        'Universelle Gruppen sind nur in einer einzigen Domäne gültig.',
        'Universelle Gruppen können keine Berechtigungen über Domänengrenzen hinweg erhalten.',
        'Universelle Gruppen dürfen nur Computerkonten enthalten.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adp.nesting',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'verschachtelung',
    conceptCluster: 'ad.permissions.nesting',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Gruppenverschachtelung',
      description: 'Eine Gruppe kann Mitglied einer anderen Gruppe sein. Dadurch erhalten die Mitglieder der untergeordneten Gruppe indirekt die Berechtigungen, die der übergeordneten Gruppe zugewiesen wurden.',
      distractorDescriptions: [
        'Gruppen erben Berechtigungen automatisch, ohne dass sie Mitglied einer anderen Gruppe sind.',
        'Verschachtelte Gruppen haben keinen Einfluss auf effektive Berechtigungen.',
        'Nur Domänen-Admins dürfen Gruppen verschachteln.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adp.agdlp',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'a-g-d-l-p',
    conceptCluster: 'ad.permissions.agdlp',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.ORDERING],
    data: {
      subject: 'A-G-DL-P',
      description: 'A-G-DL-P bedeutet: Account → globale Funktionsgruppe → domänenlokale Berechtigungsgruppe → Permission. NTFS-Rechte werden der domänenlokalen Berechtigungsgruppe zugewiesen.',
      distractorDescriptions: [
        'Accounts erhalten NTFS-Rechte direkt.',
        'Domänenlokale Gruppen enthalten Benutzer, globale Gruppen enthalten Berechtigungsgruppen.',
        'A-G-DL-P ist ein Routing-Protokoll.',
      ],
    },
    roleHints: ['technical', 'support'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adp.aggp',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'a-g-g-p',
    conceptCluster: 'ad.permissions.aggp',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      subject: 'A-G-G-P',
      description: 'A-G-G-P bedeutet: Account → globale Funktionsgruppe → globale Berechtigungsgruppe → Permission. NTFS-Rechte werden der globalen Berechtigungsgruppe zugewiesen.',
      distractorDescriptions: [
        'A-G-G-P verwendet ausschließlich domänenlokale Gruppen.',
        'A-G-G-P ist ein E-Mail-Verteilerprinzip.',
        'A-G-G-P bedeutet Account → globale Gruppe → lokale Gruppe → Profil.',
      ],
    },
    roleHints: ['technical', 'support'],
    sourceClassification: 'COURSE_SIMPLIFICATION',
  },
  {
    id: 'adp.directAccess',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'berechtigungsverwaltung',
    conceptCluster: 'ad.permissions.problem',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'direkte Benutzerberechtigungen',
      description: 'Direkte Vergabe von Berechtigungen an einzelne Benutzer skaliert schlecht. Bei Personalwechseln müssten viele Ressourcen einzeln angepasst werden.',
      distractorDescriptions: [
        'Direkte Benutzerberechtigungen sind am einfachsten zu verwalten.',
        'Direkte Benutzerberechtigungen skalieren hervorragend in großen Umgebungen.',
        'Gruppenbasierte Berechtigungen sind immer ungeeignet.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adp.groupNaming',
    topicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceTopicKey: AD_PERMISSIONS_TOPIC_KEY,
    sourceSection: 'a-g-d-l-p',
    conceptCluster: 'ad.permissions.agdlp',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      subject: 'A-G-DL-P Namensschema',
      description: 'Im Lehrgang werden domänenlokale Berechtigungsgruppen nach Muster DL_NameDerFreigabe_L, DL_NameDerFreigabe_AE, DL_NameDerFreigabe_VZ benannt. Globale Gruppen werden nach Funktion benannt, z. B. G_Stab.',
      distractorDescriptions: [
        'Domänenlokale Gruppen heißen immer G_L_*.',
        'Funktionsgruppen heißen immer DL_*.',
        'Namenskonventionen haben keinen Einfluss auf die Berechtigungsvergabe.',
      ],
    },
    roleHints: ['technical', 'support'],
    sourceClassification: 'COURSE_FACT',
  },
];
