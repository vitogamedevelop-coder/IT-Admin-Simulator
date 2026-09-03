// =============================================================================
// Knowledge Items – Active Directory Thema 22
// Replikationsgrundlagen & AD-Datenbank
// Source: frontend/src/lib/academyLessons/adReplicationBasics.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const THEME_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-basics');

function facetItem(id, cluster, type, fields) {
  return {
    id,
    topicKey: THEME_TOPIC_KEY,
    sourceTopicKey: THEME_TOPIC_KEY,
    sourceSection: 'ad-replication-basics',
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

export const adReplicationBasicsKnowledgeItems = [
  facetItem('ad.replication.definition', 'ad.replication', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'AD-Replikation',
    definition: 'AD-Replikation sorgt dafür, dass Verzeichnisinformationen auf den Domain Controllern konsistent und aktuell gehalten werden.',
    distractorDefinitions: [
      'AD-Replikation löscht alte Objekte automatisch.',
      'AD-Replikation kopiert bei jeder Änderung die gesamte Datenbank.',
      'AD-Replikation findet nur zwischen Domänen, nicht zwischen DCs, statt.',
    ],
  }),
  facetItem('ad.replication.consistency', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Konsistenz zwischen DCs',
    description: 'Mehrere DCs derselben Umgebung müssen dieselben Verzeichnisinformationen kennen, damit Anmeldungen und Verwaltung überall gleich funktionieren. Replikation gleicht Unterschiede ab.',
    distractorDescriptions: [
      'Jeder DC darf völlig unabhängige Daten halten.',
      'Konsistenz ist nur bei Schemaänderungen wichtig.',
      'Replikation synchronisiert nur DNS-Einträge.',
    ],
  }),
  facetItem('ad.replication.multiMaster', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Multi-Master Grundidee',
    description: 'Active Directory arbeitet grundsätzlich als Multi-Master-System: Änderungen können auf mehreren schreibbaren DCs erfolgen und werden später abgeglichen.',
    distractorDescriptions: [
      'Im Multi-Master-Modell darf nur ein DC jemals schreiben.',
      'Multi-Master bedeutet, dass es keine Replikation gibt.',
      'Multi-Master ersetzt jegliche FSMO-Rollen.',
    ],
  }),
  facetItem('ad.replication.fsmoException', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'FSMO als Ausnahme vom Multi-Master',
    description: 'FSMO-Rollen sind gezielte Ausnahmen vom Multi-Master-Grundsatz. Sie koordinieren bestimmte Sonderaufgaben mit einem eindeutigen Rolleninhaber.',
    distractorDescriptions: [
      'FSMO-Rollen ersetzen den Multi-Master-Grundsatz vollständig.',
      'Multi-Master und FSMO sind identisch.',
      'FSMO-Rollen gelten für alle normalen Objektänderungen.',
    ],
  }),
  facetItem('ad.replication.rodc', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'RODC',
    description: 'Ein Read-Only Domain Controller hält eine schreibgeschützte Kopie der AD-Datenbank. Er ist kein normaler schreibbarer Multi-Master-DC.',
    distractorDescriptions: [
      'Ein RODC ist ein normaler schreibbarer DC.',
      'Ein RODC besitzt keine AD-Datenbankkopie.',
      'Ein RODC ersetzt den Global Catalog.',
    ],
  }),
  facetItem('ad.replication.ntdsDit', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'NTDS.DIT',
    description: 'NTDS.DIT ist die zentrale AD-Datenbankdatei eines Domain Controllers. Sie ist logisch in mehrere Verzeichnispartitionen gegliedert, nicht in separate physische Dateien pro Partition.',
    distractorDescriptions: [
      'NTDS.DIT ist eine separate Datei pro Partition.',
      'NTDS.DIT ist ein Replikationsprotokoll.',
      'NTDS.DIT existiert nur auf dem Schema Master.',
    ],
  }),
  facetItem('ad.replication.partitionPurpose', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Zweck der Partitionen',
    description: 'Partitionen teilen die AD-Datenbank logisch auf, sodass nicht jede Information an jeden DC repliziert werden muss. Ihr Scope steuert den Replikationsumfang.',
    distractorDescriptions: [
      'Partitionen sind physische Kopien der Datenbank auf verschiedenen Laufwerken.',
      'Partitionen haben keinen Einfluss auf den Replikationsumfang.',
      'Jede Partition ist eine eigene NTDS.DIT-Datei.',
    ],
  }),
  facetItem('ad.replication.schemaPartition', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Schema-Partition',
    description: 'Die Schema-Partition beschreibt erlaubte Objekttypen und Attribute. Sie gilt forestweit und wird an alle DCs des Forests repliziert.',
    distractorDescriptions: [
      'Die Schema-Partition gilt nur für eine Domain.',
      'Die Schema-Partition enthält alle Benutzerkonten.',
      'Die Schema-Partition wird niemals repliziert.',
    ],
  }),
  facetItem('ad.replication.configurationPartition', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Configuration-Partition',
    description: 'Die Configuration-Partition enthält forestweite Konfiguration wie AD-Struktur, Replikationszusammenhänge, Trusts und Sites. Sie wird an alle DCs des Forests repliziert.',
    distractorDescriptions: [
      'Die Configuration-Partition enthält nur Benutzerkonten.',
      'Die Configuration-Partition gilt nur innerhalb einer Domain.',
      'Die Configuration-Partition wird von Anwendungen konfiguriert, nicht vom AD.',
    ],
  }),
  facetItem('ad.replication.domainPartition', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Domain-Partition',
    description: 'Die Domain-Partition enthält Objekte einer bestimmten Domain wie Benutzer, Gruppen, Computer und OUs. Sie wird nur an die DCs dieser Domain repliziert.',
    distractorDescriptions: [
      'Die Domain-Partition wird forestweit an alle DCs repliziert.',
      'Die Domain-Partition enthält nur Gruppenrichtlinien.',
      'Die Domain-Partition enthält das Schema.',
    ],
  }),
  facetItem('ad.replication.applicationPartition', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Anwendungsverzeichnispartition',
    description: 'Anwendungsverzeichnispartitionen enthalten anwendungsspezifische Daten wie AD-integrierte DNS-Informationen. Ihr Replikationsscope ist anwendungs- bzw. szenarioabhängig.',
    distractorDescriptions: [
      'Anwendungsverzeichnispartitionen werden immer an alle DCs des Forests repliziert.',
      'Anwendungsverzeichnispartitionen enthalten nur Benutzerobjekte.',
      'Anwendungsverzeichnispartitionen haben keinen konfigurierbaren Scope.',
    ],
  }),
  facetItem('ad.replication.scopeSummary', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Replikationsscopes im Vergleich',
    description: 'Schema- und Configuration-Partition werden forestweit repliziert. Domain-Partitionen sind domänenspezifisch. Anwendungsverzeichnispartitionen haben einen definierbaren Scope.',
    distractorDescriptions: [
      'Alle Partitionen werden immer an jeden DC repliziert.',
      'Nur die Domain-Partition wird repliziert.',
      'Partitionen haben keine Auswirkung auf Replikation.',
    ],
  }),
  facetItem('ad.replication.triggers', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Replikationsauslöser',
    description: 'Typische Auslöser für AD-Replikation sind das Erstellen, Ändern, Verschieben und Löschen von Verzeichnisobjekten.',
    distractorDescriptions: [
      'Replikation wird nur bei der Installation eines neuen DCs ausgelöst.',
      'Replikation startet stündlich unabhängig von Änderungen.',
      'Nur Schemaänderungen lösen Replikation aus.',
    ],
  }),
  facetItem('ad.replication.delta', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Delta-Replikation',
    description: 'Bei der AD-Replikation werden Änderungen übertragen, nicht jedes Mal der komplette Datenbestand.',
    distractorDescriptions: [
      'Delta-Replikation überträgt die komplette NTDS.DIT bei jeder Änderung.',
      'Delta-Replikation repliziert nur neue Objekte, keine Attributänderungen.',
      'Delta-Replikation findet nur zwischen Domänen statt.',
    ],
  }),
  facetItem('ad.replication.storeForward', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Store-and-Forward',
    description: 'Store-and-Forward bedeutet, dass Änderungen über Replikationspartner weitergegeben werden können, ohne dass jeder DC direkt mit jedem anderen kommunizieren muss.',
    distractorDescriptions: [
      'Store-and-Forward erfordert, dass jeder DC direkt mit allen anderen verbunden ist.',
      'Store-and-Forward bedeutet, dass die ganze Datenbank zwischengespeichert wird.',
      'Store-and-Forward gilt nur für E-Mails, nicht für AD.',
    ],
  }),
  facetItem('ad.replication.stateTracking', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Statusinformationen',
    description: 'DCs halten Informationen darüber, welche Änderungen bereits bekannt sind. Dadurch erkennen sie, welche Änderungen neu oder noch ausstehend sind.',
    distractorDescriptions: [
      'DCs speichern keine Statusinformationen zu Replikation.',
      'Statusinformationen enthalten alle Passwörter im Klartext.',
      'Statusinformationen ersetzen NTDS.DIT.',
    ],
  }),
  facetItem('ad.replication.noDeepSites', 'ad.replication', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Keine Sites/KCC-Details',
    description: 'Dieses Thema behandelt nur die Replikationsgrundlagen. Konfiguration von Sites, Subnetzen, Site Links, KCC und Replikationszeitplänen folgt in späteren Themen.',
    distractorDescriptions: [
      'Der KCC wird in diesem Thema detailliert konfiguriert.',
      'Sites und Subnetze sind Bestandteil dieses Grundlagengebiets.',
      'Replikationszeitpläne werden hier erstellt.',
    ],
  }),
];
