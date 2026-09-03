// =============================================================================
// Knowledge Items – Active Directory Thema 20
// Forest-weite FSMO-Rollen & privilegierte Admin-Gruppen
// Source: frontend/src/lib/academyLessons/adFsmoAdminGroups.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const THEME_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-fsmo-admin-groups');

function facetItem(id, cluster, type, fields) {
  return {
    id,
    topicKey: THEME_TOPIC_KEY,
    sourceTopicKey: THEME_TOPIC_KEY,
    sourceSection: 'fsmo-admin-theory',
    conceptCluster: cluster,
    type,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SCENARIO],
    data: fields,
    roleHints: ['technical'],
    sourceStatus: 'verified',
    siblings: [],
  };
}

export const adFsmoAdminGroupsKnowledgeItems = [
  facetItem('ad.fsmo.forestRoles.definition', 'ad.fsmo.forestRoles', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'FSMO-Rollen',
    definition: 'Flexible Single Master Operations sind besondere AD-Rollen, die für bestimmte Aufgaben einen eindeutigen Rolleninhaber in einer Domäne oder einem Forest festlegen. Sie ergänzen die normalerweise verteilte Multi-Master-Replikation.',
    distractorDefinitions: [
      'FSMO-Rollen ersetzen die Multi-Master-Replikation vollständig.',
      'FSMO-Rollen bedeuten, dass AD prinzipiell Single-Master arbeitet.',
      'Jeder DC in einer Domäne besitzt automatisch jede FSMO-Rolle.',
    ],
  }),
  facetItem('ad.fsmo.forestRoles.multiMasterException', 'ad.fsmo.forestRoles', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'FSMO als Ausnahme von Multi-Master',
    description: 'Active Directory arbeitet grundsätzlich verteilt über mehrere Domain Controller. FSMO-Rollen sind gezielte Ausnahmen für Aufgaben, bei denen ein eindeutiger Zuständiger Konflikte vermeidet.',
    distractorDescriptions: [
      'FSMO-Rollen sind der Normalfall; ohne sie kann AD nicht replizieren.',
      'AD verwendet ausschließlich Single-Master-Replikation.',
      'FSMO-Rollen machen jeden DC zum Alleinherrscher.',
    ],
  }),
  facetItem('ad.fsmo.forestRoles.forestWide', 'ad.fsmo.forestRoles', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Forest-weite FSMO-Rollen',
    description: 'Schema Master und Domain Naming Master gelten für den gesamten Forest. Eine Gesamtstruktur kann eine oder mehrere Domänen enthalten.',
    distractorDescriptions: [
      'RID Master und PDC Emulator sind forest-weit.',
      'Schema Master und Infrastructure Master sind domänen-weit.',
      'Domain Naming Master verwaltet DNS-Zoneinträge für den Forest.',
    ],
  }),
  facetItem('ad.fsmo.forestRoles.domainWide', 'ad.fsmo.forestRoles', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Domänen-weite FSMO-Rollen',
    description: 'RID Master, PDC Emulator und Infrastructure Master gelten jeweils einmal pro Domäne.',
    distractorDescriptions: [
      'Schema Master und Domain Naming Master gelten pro Domäne.',
      'Jede FSMO-Rolle gilt sowohl forest- als auch domänen-weit.',
      'Domänen-weite Rollen werden von allen DCs gleichzeitig ausgeführt.',
    ],
  }),
  facetItem('ad.fsmo.forestRoles.roleCount', 'ad.fsmo.forestRoles', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Anzahl FSMO-Rollen in Multi-Domain-Forests',
    description: 'Ein Forest mit drei Domänen besitzt zwei forestweite Rollen und drei domänenweite Rollen je Domäne, also insgesamt elf Rolleninstanzen.',
    distractorDescriptions: [
      'In jedem Forest gibt es immer genau fünf Rolleninstanzen.',
      'Jede Domäne besitzt alle fünf FSMO-Rollen.',
      'Forestweite Rollen existieren pro Domäne einmal.',
    ],
  }),
  facetItem('ad.fsmo.domainNamingMaster.purpose', 'ad.fsmo.domainNamingMaster', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Domain Naming Master',
    description: 'Der Domain Naming Master koordiniert Änderungen am Domain-Namespace des Forests, also das Hinzufügen, Entfernen oder Umbenennen von Domänen. Er stellt sicher, dass der Forest-Namespace konsistent bleibt.',
    distractorDescriptions: [
      'Der Domain Naming Master verwaltet DNS-Zoneinträge.',
      'Der Domain Naming Master koordiniert Schemaänderungen.',
      'Der Domain Naming Master ist für die Zeit-Synchronisation zuständig.',
    ],
  }),
  facetItem('ad.fsmo.schemaMaster.purpose', 'ad.fsmo.schemaMaster', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Schema Master',
    description: 'Der Schema Master kontrolliert Änderungen am Active-Directory-Schema für den gesamten Forest. Das Schema legt Objekttypen, Attribute und erlaubte Strukturen fest.',
    distractorDescriptions: [
      'Der Schema Master fügt neue Domänen zum Forest hinzu.',
      'Der Schema Master ist ein Dienst auf jedem Domain Controller.',
      'Der Schema Master verwaltet Gruppenrichtlinien.',
    ],
  }),
  facetItem('ad.fsmo.forestRoles.failureBehavior', 'ad.fsmo.forestRoles', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Ausfallverhalten forestweiter FSMO-Rollen',
    description: 'Ein Ausfall von Schema Master oder Domain Naming Master stoppt den laufenden Betrieb nicht sofort. Schemaänderungen oder Domainstrukturänderungen sind jedoch blockiert.',
    distractorDescriptions: [
      'Ausfall einer forestweiten Rolle führt sofort zum Totalausfall.',
      'Ein ausgefallener Schema Master stoppt die Replikation.',
      'Ohne Domain Naming Master können sich keine Benutzer mehr anmelden.',
    ],
  }),
  facetItem('ad.fsmo.placement.design', 'ad.fsmo.placement', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'FSMO-Platzierung',
    description: 'Die Platzierung der FSMO-Rollen ist eine Designentscheidung, die von Umgebung, Latenz, Verfügbarkeit und Forest-Struktur abhängt. Es gibt keine universelle, technisch zwingende Schablone.',
    distractorDescriptions: [
      'FSMO-Rollen müssen immer auf dem ersten DC des Forests liegen.',
      'Die Platzierung wird von Windows automatisch optimiert und ist unveränderlich.',
      'FSMO-Rollen dürfen nie auf einem Global Catalog liegen.',
    ],
  }),
  facetItem('ad.admin.localAdmins.scope', 'ad.admin.scope', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Lokale Administratoren',
    description: 'Die lokale Gruppe „Administratoren“ gewährt umfangreiche Rechte auf dem jeweiligen Computer. Ihr Scope ist nicht forestweit.',
    distractorDescriptions: [
      'Lokale Administratoren haben domänenweite Rechte.',
      'Lokale Administratoren können das AD-Schema ändern.',
      'Lokale Administratoren haben forestweite Rechte.',
    ],
  }),
  facetItem('ad.admin.domainAdmins.scope', 'ad.admin.scope', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Domain Admins',
    description: 'Domain Admins haben sehr weitreichende Rechte innerhalb einer Domäne. Sie sind für administrative Aufgaben in dieser einen Domäne zuständig.',
    distractorDescriptions: [
      'Domain Admins haben automatisch forestweite Rechte.',
      'Domain Admins können das AD-Schema ändern.',
      'Domain Admins existieren nur in der Root Domain.',
    ],
  }),
  facetItem('ad.admin.enterpriseAdmins.scope', 'ad.admin.scope', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Enterprise Admins',
    description: 'Enterprise Admins (Organisations-Admins) haben forestweite administrative Rechte. Sie existieren nur in der Root Domain des Forests.',
    distractorDescriptions: [
      'Enterprise Admins sind nur stärkere Domain Admins.',
      'Enterprise Admins existieren in jeder Domäne.',
      'Enterprise Admins haben nur Rechte auf einem einzelnen Computer.',
    ],
  }),
  facetItem('ad.admin.schemaAdmins.scope', 'ad.admin.scope', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Schema Admins',
    description: 'Schema Admins dürfen Schemaänderungen im Forest durchführen. Die Mitgliedschaft sollte nur bestehen, wenn Schemaänderungen wirklich notwendig sind.',
    distractorDescriptions: [
      'Schema Admins verwalten alle Gruppenrichtlinien.',
      'Schema Admins haben nur Rechte in einer einzelnen Domäne.',
      'Schema Admins sind für die Zeit-Synchronisation zuständig.',
    ],
  }),
  facetItem('ad.admin.scopeDistinction', 'ad.admin.scope', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Scope-Abgrenzung privilegierter Gruppen',
    description: 'Lokale Administratoren wirken auf einem Computer, Domain Admins domänenweit, Enterprise Admins forestweit und Schema Admins auf das AD-Schema. Sie sind nicht einfach nach Macht zu sortieren, sondern haben unterschiedliche Verantwortungsbereiche.',
    distractorDescriptions: [
      'Domain Admins sind generell mächtiger als Enterprise Admins.',
      'Enterprise Admins haben nur lokale Rechte.',
      'Alle privilegierten Gruppen haben denselben Scope.',
    ],
  }),
  facetItem('ad.admin.leastPrivilege', 'ad.admin.leastPrivilege', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Least Privilege',
    description: 'Hochprivilegierte Gruppen wie Domain Admins, Enterprise Admins oder Schema Admins sollten nur vergeben werden, wenn sie wirklich erforderlich sind. Für gezielte Aufgaben wie Passwortresets ist Delegation auf OU-Ebene vorzuziehen.',
    distractorDescriptions: [
      'Least Privilege bedeutet, alle Admins in Schema Admins zu packen.',
      'Für Passwortresets muss man Domain Admin sein.',
      'Hochprivilegierte Gruppen ersetzen gezielte Delegation.',
    ],
  }),
  facetItem('ad.admin.criticalAccount', 'ad.admin.leastPrivilege', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Kritische Administrator-Konten',
    description: 'Das eingebaute Administrator-Konto der ersten Domain und hochprivilegierte Konten müssen besonders geschützt werden: starke Authentifizierung, keine Alltagsnutzung, getrennte Admin-Konten und minimale Exposition.',
    distractorDefinitions: [
      'Das Built-in Administrator-Konto ist automatisch Mitglied aller Gruppen.',
      'Hochprivilegierte Konten dürfen für Alltagsaufgaben verwendet werden.',
      'Kritische Konten brauchen keine zusätzliche Absicherung.',
    ],
  }),
];
