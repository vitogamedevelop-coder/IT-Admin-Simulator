// =============================================================================
// Knowledge Items – Active Directory OU Management
// Source: frontend/src/lib/academyLessons/adLogicalComponents.js
// Primary references: Active Directory – Konfiguration
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const AD_OU_TOPIC_KEY = topicKey('active-directory-virtualbox', 'organizational-units');

export const adOuManagementKnowledgeItems = [
  {
    id: 'ad.ou.standardContainerDifference',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-standardcontainer-classic',
    conceptCluster: 'ad.ou',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Standard-Container vs. Organisationseinheit',
      description: 'Active Directory enthält vordefinierte Container wie Users, Computers und Builtin. Eine OU ist ein selbst angelegter organisatorischer Container und unterscheidet sich funktional von diesen Standard-Containern.',
      distractorDescriptions: [
        'Users und Computers sind dieselben Objekte wie eigene OUs.',
        'Eigene OUs werden automatisch bei der Installation erstellt.',
        'Standard-Container sind ausschließlich für Gruppen vorgesehen.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.ou.gpoLinkContext',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-standardcontainer-classic',
    conceptCluster: 'ad.ou',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'OU als späterer Verknüpfungspunkt für Gruppenrichtlinien',
      description: 'An Organisationseinheiten können später Gruppenrichtlinien verknüpft werden. Die eingebauten Container Users und Computers sind typischerweise keine normalen Ziele für solche Verknüpfungen.',
      distractorDescriptions: [
        'OUs ersetzen Gruppenrichtlinien vollständig.',
        'Jeder Standard-Container ist automatisch ein Gruppenrichtlinienverknüpfungspunkt.',
        'Gruppenrichtlinien werden ausschließlich auf Domänenebene verknüpft.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.ou.accidentalDeletionProtection',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-erstellen-classic',
    conceptCluster: 'ad.ou',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Schutz vor versehentlichem Löschen',
      description: 'Beim Anlegen einer OU kann ein Schutz vor versehentlichem Löschen gesetzt werden. Dieser Schutz verhindert normale Löschvorgänge durch Bedienfehler, bis die Option mit ausreichenden Rechten entfernt wird.',
      distractorDescriptions: [
        'Eine geschützte OU kann niemals gelöscht werden.',
        'Der Schutz erteilt zusätzliche Berechtigungen.',
        'Der Schutz verhindert jede Änderung an der OU.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.ou.moveObject',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-verschieben-classic',
    conceptCluster: 'ad.ou',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Objekte zwischen OUs verschieben',
      description: 'Ein Objekt kann aus einem Container oder einer OU in eine andere OU verschoben werden. Dabei wird das Objekt nicht neu angelegt, sondern seine Position in der Verzeichnisstruktur geändert.',
      distractorDescriptions: [
        'Verschieben erzeugt ein neues Objekt mit neuer Identität.',
        'Verschieben ist nur für Benutzer, nicht für Computer möglich.',
        'Nach dem Verschieben ändert sich das Objektkennwort automatisch.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.ou.moveChangesDn',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-verschieben-classic',
    conceptCluster: 'ad.dn',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Verschieben verändert den Distinguished Name',
      description: 'Wenn ein Objekt in eine andere OU verschoben wird, ändert sich sein Distinguished Name, weil sich die Position in der Hierarchie geändert hat. Die Identität des Objekts bleibt erhalten.',
      distractorDescriptions: [
        'Der Distinguished Name bleibt beim Verschieben unverändert.',
        'Das Objekt erhält beim Verschieben eine neue SID.',
        'Der Common Name ändert sich immer auf den neuen OU-Namen.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.ou.designPurpose',
    topicKey: AD_OU_TOPIC_KEY,
    sourceTopicKey: AD_OU_TOPIC_KEY,
    sourceSection: 'ou-design-classic',
    conceptCluster: 'ad.ou',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Zweck einer OU-Struktur',
      description: 'OU-Strukturen werden nach administrativen Anforderungen geplant. Die Organisationsstruktur kann dabei helfen, ist aber nicht der einzige mögliche Entwurfsgrund.',
      distractorDescriptions: [
        'OUs müssen immer exakt dem Organigramm entsprechen.',
        'OUs dürfen niemals weitere OUs enthalten.',
        'OUs vergeben automatisch Dateiberechtigungen.',
      ],
    },
    roleHints: ['technical', 'management'],
    sourceStatus: 'verified',
  },
];
