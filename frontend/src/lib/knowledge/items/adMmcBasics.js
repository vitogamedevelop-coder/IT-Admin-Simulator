// =============================================================================
// Knowledge Items – Active Directory Microsoft Management Console (Thema 15)
//
// Source: Lehrgangsmaterial des Nutzers, MMC-Basics
// Source classifications:
//   COURSE_FACT          = unproblematische Lehrgangsaussage
//   COURSE_SIMPLIFICATION = didaktisch vereinfachte Darstellung
//   VERIFIED_FACT        = allgemein technisch gültige Einordnung
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const AD_MMC_BASICS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-mmc-basics');

export const adMmcBasicsKnowledgeItems = [
  {
    id: 'ad.mmc.definition',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-definition',
    conceptCluster: 'ad.mmc.definition',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Microsoft Management Console',
      definition: 'Die Microsoft Management Console (MMC) ist ein Verwaltungsrahmen, der selbst keine Verwaltungsaufgaben ausführt, sondern Snap-Ins hostet.',
      distractorDefinitions: [
        'Die MMC ist ein eigenständiges Verwaltungstool für Benutzerkonten.',
        'Die MMC ist ein Serverdienst, der im Hintergrund läuft.',
        'Die MMC ersetzt Active Directory Berechtigungen.',
      ],
    },
    roleHints: ['support', 'technical', 'management'],
    sourceClassification: 'VERIFIED_FACT',
  },
  {
    id: 'ad.mmc.snapin',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-snapin',
    conceptCluster: 'ad.mmc.snapin',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      term: 'Snap-In',
      definition: 'Ein Snap-In ist ein Verwaltungstool, das innerhalb der MMC ausgeführt wird und die eigentliche Verwaltungsfunktion bereitstellt.',
      distractorDefinitions: [
        'Ein Snap-In ist die grafische Oberfläche der MMC selbst.',
        'Ein Snap-In ist ein Sicherheitsmodell für Hilfsadmins.',
        'Ein Snap-In ist ein Netzwerkprotokoll.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.mmc.msc',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-msc',
    conceptCluster: 'ad.mmc.msc',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: '.msc-Datei',
      description: 'Dateien mit der Endung .msc sind typischerweise gespeicherte Microsoft Management Console-Konfigurationen, die bestimmte Snap-Ins enthalten.',
      distractorDescriptions: [
        '.msc-Dateien sind ausführbare Programmdateien.',
        '.msc ist das Dateiformat für Windows-Update-Pakete.',
        '.msc bezeichnet ein Netzwerkkonfigurationsprotokoll.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'VERIFIED_FACT',
  },
  {
    id: 'ad.mmc.toolSelection',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-tools',
    conceptCluster: 'ad.mmc.toolSelection',
    type: KNOWLEDGE_TYPES.SKILL,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      skill: 'Snap-In auswählen',
      description: 'Für unterschiedliche Verwaltungsaufgaben wählt man das passende Snap-In: AD-Benutzer und -Computer für Benutzer, DNS-Manager für DNS, Ereignisanzeige für Logs, Dienste für Dienste.',
      distractorDescriptions: [
        'Jedes Snap-In kann alle Aufgaben gleich gut erledigen.',
        'Der DNS-Manager verwaltet Benutzerkonten.',
        'Die Ereignisanzeige startet und stoppt Windows-Dienste.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.mmc.addRemoveSnapin',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-add',
    conceptCluster: 'ad.mmc.addRemoveSnapin',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.ORDERING],
    data: {
      procedure: 'Snap-In hinzufügen',
      steps: [
        'MMC öffnen',
        'Datei',
        'Snap-In hinzufügen/entfernen',
        'Snap-In auswählen',
        'Hinzufügen',
        'OK',
      ],
      commonErrors: ['Snap-In direkt auf dem Desktop platzieren', 'Im Bearbeiten-Menü suchen', 'Die Konsole speichern ohne Snap-In'],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.mmc.authorMode',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-modes',
    conceptCluster: 'ad.mmc.authorMode',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Autorenmodus',
      description: 'Im Autorenmodus kann eine MMC umfassend angepasst werden, insbesondere Snap-Ins hinzugefügt und entfernt sowie die Fensterstruktur verändert werden.',
      distractorDescriptions: [
        'Im Autorenmodus darf man keine Berechtigungen vergeben.',
        'Im Autorenmodus sind alle Snap-Ins schreibgeschützt.',
        'Im Autorenmodus sieht der Benutzer nur einen Ausschnitt der Konsole.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.mmc.userModeFull',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-modes',
    conceptCluster: 'ad.mmc.userModeFull',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Benutzermodus – Vollzugriff',
      description: 'Im Benutzermodus mit Vollzugriff kann der Benutzer alle bereitgestellten Verwaltungsfunktionen nutzen, aber die Konsole nicht wie ein Autor umbauen.',
      distractorDescriptions: [
        'Vollzugriff erlaubt das Hinzufügen neuer Snap-Ins.',
        'Vollzugriff verhindert jegliche Verwaltung.',
        'Vollzugriff zeigt nur einen einzelnen Bereich.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.mmc.userModeRestrictedMulti',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-modes',
    conceptCluster: 'ad.mmc.userModeRestrictedMulti',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Benutzermodus – beschränkter Zugriff, mehrere Fenster',
      description: 'Dieser Modus zeigt nur die beim Speichern bereitgestellten Bereiche und erlaubt neue Fenster, verhindert aber eine freie Strukturanpassung.',
      distractorDescriptions: [
        'Der Benutzer kann Snap-Ins hinzufügen.',
        'Der Benutzer kann keine neuen Fenster öffnen.',
        'Der Benutzer sieht die komplette MMC-Struktur.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.mmc.userModeRestrictedSingle',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-modes',
    conceptCluster: 'ad.mmc.userModeRestrictedSingle',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Benutzermodus – beschränkter Zugriff, Einzelfenster',
      description: 'Der Einzelfenster-Modus zeigt nur den vorgesehenen Bereich und erlaubt keine zusätzlichen Fenster. Er ist besonders für Hilfsadministratoren mit engem Aufgabenbereich geeignet.',
      distractorDescriptions: [
        'Der Benutzer kann neue Fenster öffnen.',
        'Der Modus vergibt automatisch eingeschränkte AD-Rechte.',
        'Der Modus erlaubt das Entfernen von Snap-Ins.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.mmc.uiVsPermission',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-ui-vs-permission',
    conceptCluster: 'ad.mmc.uiVsPermission',
    type: KNOWLEDGE_TYPES.MISCONCEPTION,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      statement: 'Eine eingeschränkte MMC-Oberfläche ersetzt AD-Berechtigungen.',
      isCorrect: false,
      correctExplanation: 'Eine eingeschränkte MMC beschränkt nur die Benutzeroberfläche. Die tatsächlichen Berechtigungen müssen separat über Active Directory oder Windows-Rechte delegiert werden.',
      commonMisconception: 'Nur weil etwas in der MMC nicht sichtbar ist, besitzt der Benutzer technisch trotzdem möglicherweise die passenden Rechte.',
    },
    roleHints: ['security', 'support', 'technical'],
    sourceClassification: 'VERIFIED_FACT',
  },
  {
    id: 'ad.mmc.delegationPreview',
    topicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceTopicKey: AD_MMC_BASICS_TOPIC_KEY,
    sourceSection: 'ad-mmc-preview',
    conceptCluster: 'ad.mmc.delegationPreview',
    type: KNOWLEDGE_TYPES.SKILL,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      skill: 'MMC für Hilfsadmin vorbereiten',
      description: 'Später wird gezeigt, wie man Berechtigungen delegiert und eine eingeschränkte MMC mit den passenden Snap-Ins für einen Hilfsadministrator erstellt.',
      distractorDescriptions: [
        'Eine eingeschränkte MMC erteilt automatisch alle Rechte.',
        'Hilfsadmins benötigen alle Server-Verwaltungswerkzeuge.',
        'Delegation erfolgt in der MMC, ohne AD-Rechte zu ändern.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_SIMPLIFICATION',
  },
];
