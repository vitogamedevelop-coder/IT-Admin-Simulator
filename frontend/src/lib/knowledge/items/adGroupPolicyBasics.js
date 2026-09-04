// =============================================================================
// Knowledge Items – Active Directory Thema 27
// Gruppenrichtlinien – Grundlagen
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const THEME_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-group-policy-basics');

function facetItem(id, cluster, type, fields) {
  return {
    id,
    topicKey: THEME_TOPIC_KEY,
    sourceTopicKey: THEME_TOPIC_KEY,
    sourceSection: 'ad-group-policy-basics',
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

export const adGroupPolicyBasicsKnowledgeItems = [
  facetItem('ad.gpo.definition', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Gruppenrichtlinie',
    definition: 'Richtlinien, mit denen Einstellungen für Benutzer und Computer in einer Windows-Domäne zentral oder lokal vorgegeben werden.',
    distractorDefinitions: [
      'Ein Tool zur DNS-Verwaltung.',
      'Ein Ersatz für Backups.',
      'Ein Verfahren zum Löschen von AD-Objekten.',
    ],
  }),
  facetItem('ad.gpo.object', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'GPO',
    definition: 'Group Policy Object = Gruppenrichtlinienobjekt, das viele einzelne Richtlinieneinstellungen enthält.',
    distractorDefinitions: [
      'Ein einzelner Registry-Wert.',
      'Eine DNS-Zone.',
      'Eine OU.',
    ],
  }),
  facetItem('ad.gpo.userConfiguration', 'ad.gpo', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Benutzerkonfiguration',
    description: 'Einstellungen in einem GPO, die auf Benutzer wirken, z.B. Startmenü, Desktop, benutzerbezogene Optionen.',
    distractorDescriptions: [
      'Betrifft den Rechner unabhängig vom Benutzer.',
      'Ist der SYSVOL-Anteil.',
      'Ist das Verwaltungstool.',
    ],
  }),
  facetItem('ad.gpo.computerConfiguration', 'ad.gpo', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Computerkonfiguration',
    description: 'Einstellungen in einem GPO, die auf Computer wirken, z.B. Systemverhalten, Sicherheitsoptionen, Rechnerkonfiguration.',
    distractorDescriptions: [
      'Betrifft nur den angemeldeten Benutzer.',
      'Verwaltet DNS-Zonen.',
      'Speichert Gruppenmitgliedschaften.',
    ],
  }),
  facetItem('ad.gpo.localPolicy', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Lokale Gruppenrichtlinie',
    definition: 'Richtlinie, die nur auf einem einzelnen Rechner gilt und lokal im Local Group Policy Editor verwaltet wird.',
    distractorDefinitions: [
      'Wird zentral im Active Directory verwaltet.',
      'Gilt forestweit.',
      'Ist der SYSVOL-Dateianteil.',
    ],
  }),
  facetItem('ad.gpo.domainPolicy', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Zentrale Gruppenrichtlinie',
    definition: 'Richtlinie, die im Active Directory über GPOs verwaltet und für viele Benutzer/Computer gelten kann.',
    distractorDefinitions: [
      'Gilt nur auf einem Rechner.',
      'Ist der AD-Papierkorb.',
      'Ist ein DNS-Record.',
    ],
  }),
  facetItem('ad.gpo.localVsCentral', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Lokal vs Zentral',
    definition: 'Lokale Richtlinien gelten nur auf einem Rechner; zentrale GPOs werden im AD verwaltet und erreichen viele Objekte.',
    distractorDefinitions: [
      'Beide werden im Local Group Policy Editor verwaltet.',
      'Beide gelten nur lokal.',
      'Beide ersetzen Backups.',
    ],
  }),
  facetItem('ad.gpo.linkSite', 'ad.gpo', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'GPO an Site verknüpfen',
    description: 'Ein GPO kann an eine Site verknüpft werden. Site ist ein möglicher Verknüpfungsort, keine Details zur Verarbeitungsreihenfolge.',
    distractorDescriptions: [
      'GPOs können nicht an Sites verknüpft werden.',
      'Site ist das einzige erlaubte Zielobjekt.',
      'Verknüpfung an Site wirkt auf die Site als Objekt.',
    ],
  }),
  facetItem('ad.gpo.linkDomain', 'ad.gpo', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'GPO an Domain verknüpfen',
    description: 'Ein GPO kann an eine Domain verknüpft werden.',
    distractorDescriptions: [
      'Domains können keine GPOs erhalten.',
      'Eine Domain-GPO wirkt auf die Domain-Objekte selbst.',
      'Nur OUs können GPOs erhalten.',
    ],
  }),
  facetItem('ad.gpo.linkOu', 'ad.gpo', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'GPO an OU verknüpfen',
    description: 'Ein GPO kann an eine OU verknüpft werden, wirkt aber auf Benutzer/Computer im Scope, nicht auf die OU selbst.',
    distractorDescriptions: [
      'OU ist das einzig mögliche Link-Ziel.',
      'GPO wirkt auf die OU als Objekt.',
      'GPOs können nicht an OUs verknüpft werden.',
    ],
  }),
  facetItem('ad.gpo.linkVsTarget', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Link vs Target',
    definition: 'GPO-Links sind möglich an Site, Domain, OU. Ziel der Einstellungen sind Benutzer oder Computer im Scope.',
    distractorDefinitions: [
      'OU ist das Zielobjekt.',
      'Site ist das Zielobjekt.',
      'GPO wirkt direkt auf das Containerobjekt.',
    ],
  }),
  facetItem('ad.gpo.gpmc', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'GPMC',
    definition: 'Group Policy Management Console = zentrale Verwaltungskonsole für GPOs im Active Directory.',
    distractorDefinitions: [
      'Group Policy Container.',
      'Group Policy Template.',
      'Local Group Policy Editor.',
    ],
  }),
  facetItem('ad.gpo.gpc', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'GPC',
    definition: 'Group Policy Container = AD-Anteil eines GPOs mit Metadaten.',
    distractorDefinitions: [
      'Dateisystemanteil in SYSVOL.',
      'Ein GPO-Verwaltungstool.',
      'Eine Benutzerkonfiguration.',
    ],
  }),
  facetItem('ad.gpo.gpt', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'GPT',
    definition: 'Group Policy Template = Dateisystemanteil eines GPOs in SYSVOL.',
    distractorDefinitions: [
      'AD-Anteil eines GPOs.',
      'Zentrale Verwaltungskonsole.',
      'Eine OU.',
    ],
  }),
  facetItem('ad.gpo.sysvol', 'ad.gpo', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'SYSVOL',
    definition: 'Freigabe auf Domain-Controllern, in der unter anderem der Dateianteil (GPT) der Gruppenrichtlinien gespeichert wird.',
    distractorDefinitions: [
      'Container für gelöschte Objekte.',
      'DNS-Zone.',
      'Schema-Partition.',
    ],
  }),
  facetItem('ad.gpo.cliPreview', 'ad.gpo', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'gpupdate / gpresult Ausblick',
    description: 'gpupdate aktualisiert Richtlinien, gpresult zeigt angewendete Richtlinien an. In Thema 27 nur als Ausblick, Details folgen später.',
    distractorDescriptions: [
      'gpupdate löscht GPOs.',
      'gpresult erstellt GPOs.',
      'gpupdate zeigt GPC an.',
    ],
  }),
];
