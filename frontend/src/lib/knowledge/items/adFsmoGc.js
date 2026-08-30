// =============================================================================
// Knowledge Items – Active Directory FSMO & Global Catalog
// Source: frontend/src/lib/academyLessons/adLogicalComponents.js
// Primary references: Microsoft Learn – Active Directory Domain Services
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const AD_DC_TOPIC_KEY = topicKey('active-directory-virtualbox', 'domain-controller');

export const adFsmoGcKnowledgeItems = [
  // ---------------------------------------------------------------------------
  // FSMO Concept
  // ---------------------------------------------------------------------------
  {
    id: 'ad.fsmo.definition',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'fsmo-ueberblick-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'FSMO-Rolle',
      definition: 'Flexible Single Master Operations sind besondere AD-Rollen, die für bestimmte Aufgaben einen eindeutigen Rolleninhaber in einer Domäne oder einem Forest festlegen. Sie ergänzen die normalerweise verteilte Multi-Master-Replikation.',
      distractorDefinitions: [
        'FSMO-Rollen ersetzen die Multi-Master-Replikation vollständig.',
        'FSMO-Rollen bedeuten, dass AD prinzipiell Single-Master arbeitet.',
        'Jeder DC in einer Domäne besitzt automatisch jede FSMO-Rolle.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.fsmo.multimasterException',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'fsmo-ueberblick-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'FSMO als Ausnahme von Multi-Master',
      description: 'Active Directory Domain Services arbeiten grundsätzlich verteilt über mehrere Domain Controller. FSMO-Rollen sind gezielte Ausnahmen für Aufgaben, bei denen ein eindeutiger Zuständiger Konflikte vermeidet.',
      distractorDescriptions: [
        'FSMO-Rollen sind der Normalfall; ohne sie kann AD nicht replizieren.',
        'AD verwendet ausschließlich Single-Master-Replikation.',
        'FSMO-Rollen machen jeden DC zum Alleinherrscher.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.fsmo.scope.forest',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'fsmo-ueberblick-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Forest-weite FSMO-Rollen',
      description: 'Schema Master und Domain Naming Master gelten für den gesamten Forest. Eine Gesamtstruktur kann eine oder mehrere Domänen enthalten.',
      distractorDescriptions: [
        'RID Master und PDC Emulator sind forest-weit.',
        'Schema Master und Infrastructure Master sind domänen-weit.',
        'Domain Naming Master verwaltet DNS-Zoneinträge für den Forest.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.fsmo.scope.domain',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'fsmo-ueberblick-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Domänen-weite FSMO-Rollen',
      description: 'RID Master, PDC Emulator und Infrastructure Master gelten jeweils einmal pro Domäne. RID Master verteilt RID-Bereiche, PDC Emulator übernimmt Koordinationsaufgaben und Infrastructure Master hält domänenübergreifende Referenzen aktuell.',
      distractorDescriptions: [
        'Schema Master und Domain Naming Master gelten pro Domäne.',
        'Jede FSMO-Rolle gilt sowohl forest- als auch domänen-weit.',
        'Domänen-weite Rollen werden von allen DCs gleichzeitig ausgeführt.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },

  // ---------------------------------------------------------------------------
  // RID / SID
  // ---------------------------------------------------------------------------
  {
    id: 'ad.sid.rid.relationship',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'rid-master-classic',
    conceptCluster: 'ad.sid',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'SID und RID',
      description: 'Eine Sicherheitskennung (SID) setzt sich vereinfacht aus einem domänenspezifischen Anteil und einem Relative Identifier (RID) zusammen. Der RID macht die SID innerhalb der Domäne eindeutig.',
      distractorDescriptions: [
        'Der RID ist die komplette SID.',
        'Der RID identifiziert den Domänencontroller.',
        'RID und SID sind austauschbare Bezeichnungen.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.fsmo.rid.purpose',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'rid-master-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'RID Master',
      description: 'Der RID Master verteilt RID-Bereiche an Domain Controller, damit diese eindeutige Sicherheitskennungen für neue Objekte vergeben können.',
      distractorDescriptions: [
        'Der RID Master stellt Kerberos-Tickets aus.',
        'Der RID Master synchronisiert die Domänenzeit.',
        'Der RID Master speichert alle Gruppenrichtlinien.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.fsmo.rid.pool',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'rid-master-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'RID-Pool',
      description: 'Ein Domain Controller erhält vom RID Master einen Bereich verfügbarer RIDs. Er nutzt daraus Kennungen für neue Sicherheitsprinzipale, ohne den RID Master bei jeder Objekterstellung kontaktieren zu müssen.',
      distractorDescriptions: [
        'Ein RID-Pool enthält alle Passwörter der Domäne.',
        'Der RID-Pool ersetzt den Global Catalog.',
        'Jeder DC darf RIDs nur für andere DCs vergeben.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },

  // ---------------------------------------------------------------------------
  // PDC Emulator
  // ---------------------------------------------------------------------------
  {
    id: 'ad.fsmo.pdc.password',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'pdc-emulator-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'PDC Emulator und Kennwortänderungen',
      description: 'Kennwortänderungen werden bevorzugt und schnell zum PDC Emulator repliziert. Wenn ein anderer DC eine Anmeldung mit einem gerade geänderten Kennwort skeptisch bewertet, kann der PDC Emulator bei der Prüfung helfen.',
      distractorDescriptions: [
        'Nur der PDC Emulator kennt jemals alle Passwörter.',
        'Der PDC Emulator gibt jedem DC stündlich neue Passwörter aus.',
        'Kennwortänderungen werden niemals repliziert.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.fsmo.pdc.time',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'pdc-emulator-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'PDC Emulator und Zeit-Hierarchie',
      description: 'Der PDC Emulator spielt in der Windows-Domänenzeithierarchie eine zentrale Rolle. Zu große Zeitabweichungen können Kerberos-Authentifizierung verhindern.',
      distractorDescriptions: [
        'Alle Clients holen ihre Uhrzeit direkt vom PDC Emulator.',
        'Der PDC Emulator ist die einzige Quelle für die Zeitzone.',
        'Zeitabweichungen stören nur die Dateianzeige, nicht Kerberos.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.fsmo.pdc.adminRole',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'pdc-emulator-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'PDC Emulator und administrative Vorgänge',
      description: 'Bestimmte Verwaltungstools verwenden den PDC Emulator bevorzugt, um Konflikte zu reduzieren. Group Policy selbst ist jedoch repliziert und nicht exklusiv auf dem PDC gespeichert.',
      distractorDescriptions: [
        'Nur der PDC Emulator darf GPOs ändern.',
        'GPOs existieren nur auf dem PDC Emulator.',
        'Der PDC Emulator verwaltet alle DNS-Zonen.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },

  // ---------------------------------------------------------------------------
  // Infrastructure Master
  // ---------------------------------------------------------------------------
  {
    id: 'ad.fsmo.infrastructure.purpose',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'infrastructure-master-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Infrastructure Master',
      description: 'Der Infrastructure Master ist in einer Domäne dafür zuständig, Referenzen auf Objekte anderer Domänen aktuell zu halten.',
      distractorDescriptions: [
        'Der Infrastructure Master vergibt RIDs.',
        'Der Infrastructure Master synchronisiert die Uhrzeit aller DCs.',
        'Der Infrastructure Master erstellt neue Domänen im Forest.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.fsmo.infrastructure.crossDomain',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'infrastructure-master-classic',
    conceptCluster: 'ad.fsmo',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Infrastructure Master in Multi-Domain-Umgebungen',
      description: 'Wenn ein Objekt aus einer anderen Domäne umbenannt oder verschoben wird, aktualisiert der Infrastructure Master die entsprechenden Referenzen in seiner eigenen Domäne.',
      distractorDescriptions: [
        'Der Infrastructure Master erzeugt neue Sicherheitsgruppen.',
        'Der Infrastructure Master ist nur in Single-Domain-Umgebungen relevant.',
        'Der Infrastructure Master ersetzt den Global Catalog.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },

  // ---------------------------------------------------------------------------
  // Global Catalog
  // ---------------------------------------------------------------------------
  {
    id: 'ad.gc.definition',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'global-catalog-classic',
    conceptCluster: 'ad.gc',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Global Catalog',
      definition: 'Ein Global Catalog ist ein Dienst auf einem Domain Controller. Er enthält alle Objekte der eigenen Domäne vollständig und aus anderen Domänen des Forests einen ausgewählten Attributsatz, um forestweite Suche und bestimmte Anmeldeszenarien zu ermöglichen.',
      distractorDefinitions: [
        'Der Global Catalog ist eine FSMO-Rolle.',
        'Der Global Catalog ist ein zentraler Backup-Server für alle DCs.',
        'Der Global Catalog speichert ausschließlich Gruppenrichtlinien.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.gc.partialReplica',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'global-catalog-classic',
    conceptCluster: 'ad.gc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Partial Attribute Set',
      description: 'Ein Global Catalog hält die eigene Domäne vollständig. Für andere Domänen speichert er einen Teilattributesatz, der ausreicht für forestweite Suchen und Anmeldeinformationen.',
      distractorDescriptions: [
        'Ein GC speichert alle Domänen komplett.',
        'Ein GC speichert nur die eigene Domäne.',
        'Ein GC speichert keine Verzeichnisdaten, sondern nur Logs.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.gc.search',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'global-catalog-classic',
    conceptCluster: 'ad.gc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Forestweite Suche',
      description: 'Mithilfe eines Global Catalog kann ein Benutzer oder Administrator nach Objekten suchen, ohne die Domäne des Objekts im Voraus zu kennen.',
      distractorDescriptions: [
        'Eine forestweite Suche erfordert immer einen eigenen SQL-Server.',
        'Nur der PDC Emulator kann Objekte finden.',
        'Forestweite Suche ist nur mit einem Backup des GC möglich.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.gc.logon',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'global-catalog-classic',
    conceptCluster: 'ad.gc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Global Catalog und Anmeldung',
      description: 'Ein Global Catalog unterstützt bestimmte Anmeldeszenarien, insbesondere in Multi-Domain-Umgebungen, indem er Universal-Group-Mitgliedschaften bereitstellt.',
      distractorDescriptions: [
        'Der Global Catalog authentifiziert Benutzer direkt statt des DCs.',
        'Der Global Catalog ist für die Zeit-Synchronisation zuständig.',
        'Anmeldungen funktionieren nur, wenn ein GC im selben Subnetz installiert ist.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.gc.vsFsmo',
    topicKey: AD_DC_TOPIC_KEY,
    sourceTopicKey: AD_DC_TOPIC_KEY,
    sourceSection: 'fsmo-gc-zusammenfassung-classic',
    conceptCluster: 'ad.gc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Global Catalog vs. FSMO',
      description: 'FSMO-Rollen vergeben für bestimmte Aufgaben einen eindeutigen Zuständigen. Der Global Catalog ist kein FSMO-Rolleninhaber, sondern ein optional aktivierbarer Dienst auf einem DC.',
      distractorDescriptions: [
        'Global Catalog ist eine FSMO-Rolle.',
        'FSMO-Rollen und Global Catalog sind identische Konzepte.',
        'Jeder DC muss gleichzeitig GC und FSMO-Rolleninhaber sein.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
];
