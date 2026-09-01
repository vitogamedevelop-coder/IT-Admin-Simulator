// =============================================================================
// Knowledge Items – Active Directory Delegation & Objektverwaltung (Thema 16)
//
// Source: Lehrgangsmaterial des Nutzers, Delegation / Objektverwaltung zuweisen
// Source classifications:
//   COURSE_FACT          = unproblematische Lehrgangsaussage
//   COURSE_SIMPLIFICATION = didaktisch vereinfachte Darstellung
//   VERIFIED_FACT        = allgemein technisch gültige Einordnung
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const AD_DELEGATION_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-delegation');

export const adDelegationKnowledgeItems = [
  {
    id: 'ad.delegation.definition',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-why',
    conceptCluster: 'ad.delegation.definition',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Delegation',
      definition: 'Delegation bedeutet, eine klar definierte Verwaltungsaufgabe auf einen bestimmten Bereich zu übertragen, ohne dem Empfänger pauschal umfassende Administratorrechte zu geben.',
      distractorDefinitions: [
        'Delegation gibt immer Vollzugriff auf die Domäne.',
        'Delegation ersetzt Active Directory vollständig.',
        'Delegation ist nur eine grafische Ansicht in der MMC.',
      ],
    },
    roleHints: ['support', 'technical', 'management'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.delegation.leastPrivilege',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-least-privilege',
    conceptCluster: 'ad.delegation.leastPrivilege',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      term: 'Least Privilege bei Delegation',
      definition: 'Least Privilege bedeutet, dass der Hilfsadmin nur die kleinste notwendige Aufgabe im kleinsten notwendigen Scope erhält.',
      distractorDefinitions: [
        'Jeder Hilfsadmin bekommt Domain-Admin-Rechte.',
        'Je mehr Rechte, desto sicherer.',
        'Least Privilege gilt nur für Benutzerkonten, nicht für Gruppen.',
      ],
    },
    roleHints: ['security', 'support', 'technical'],
    sourceClassification: 'VERIFIED_FACT',
  },
  {
    id: 'ad.delegation.groupModel',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-group-model',
    conceptCluster: 'ad.delegation.groupModel',
    type: KNOWLEDGE_TYPES.SKILL,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      skill: 'AGDLP-Gruppenmodell anwenden',
      description: 'Für Delegation verschachtelt man: S6Offz in die globale Funktionsgruppe G_S6, G_S6 in die domänenlokale Berechtigungsgruppe DL_StabPwReset. Die Berechtigungsgruppe erhält die Delegation.',
      distractorDescriptions: [
        'Man delegiert direkt an den Benutzer.',
        'Man verwendet nur eine Verteilergruppe.',
        'Funktionsgruppe und Berechtigungsgruppe sind austauschbar.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.delegation.principalGroup',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-principal',
    conceptCluster: 'ad.delegation.principalGroup',
    type: KNOWLEDGE_TYPES.SKILL,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      skill: 'Prinzipal im Delegation Wizard wählen',
      description: 'Im Delegation Wizard trägt man die Berechtigungsgruppe DL_StabPwReset ein, nicht den Einzelbenutzer S6Offz. So bleibt die Delegation bei Personalwechsel stabil.',
      distractorDescriptions: [
        'Man wählt S6Offz direkt, um schneller zu sein.',
        'Man wählt die Funktionsgruppe G_S6.',
        'Man wählt die OU Stab als Prinzipal.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.delegation.scope',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-scope',
    conceptCluster: 'ad.delegation.scope',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Scope einer Delegation',
      description: 'Delegation wird immer auf einen Bereich angewendet. Hier ist das die OU Stab. Recht und Scope gehören zusammen.',
      distractorDescriptions: [
        'Delegation gilt automatisch für die gesamte Domäne.',
        'Scope spielt bei Delegation keine Rolle.',
        'Delegation kann nur auf dem Domain Controller gesetzt werden.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.delegation.ouScope',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-scope',
    conceptCluster: 'ad.delegation.ouScope',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'OU Stab als Scope',
      description: 'Die OU Stab ist der sinnvolle Scope für das Szenario, weil das Passwortreset-Recht dann nur für Objekte in dieser OU gilt.',
      distractorDescriptions: [
        'Die Domain Root wäre ein besserer Scope.',
        'Das Schema ist der richtige Scope.',
        'Scopes sind in Active Directory nicht relevant.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.delegation.wizard',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-wizard',
    conceptCluster: 'ad.delegation.wizard',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.ORDERING],
    data: {
      procedure: 'Delegation Wizard starten',
      steps: ['ADUC öffnen', 'OU Stab auswählen', 'Rechtsklick', 'Objektverwaltung zuweisen', 'Wizard folgen'],
      commonErrors: ['Im Startmenü nach dem Wizard suchen', 'Im Datei-Menü nach Delegation suchen', 'Auf dem Benutzer statt der OU rechtsklicken'],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.delegation.passwordReset',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-task',
    conceptCluster: 'ad.delegation.passwordReset',
    type: KNOWLEDGE_TYPES.SKILL,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      skill: 'Passwortreset delegieren',
      description: 'Für das Szenario wählt man im Delegation Wizard die Aufgabe "Kennwort zurücksetzen" für Benutzerkonten.',
      distractorDescriptions: [
        'Man wählt "Benutzerkonten erstellen und löschen" für dasselbe Szenario.',
        'Man wählt "Domänenname ändern".',
        'Man wählt "DNS-Zonen verwalten".',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.delegation.uiVsPermission',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-vs-mmc',
    conceptCluster: 'ad.delegation.uiVsPermission',
    type: KNOWLEDGE_TYPES.MISCONCEPTION,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      statement: 'Eine eingeschränkte MMC-Oberfläche kann Delegation ersetzen.',
      isCorrect: false,
      correctExplanation: 'MMC beschränkt nur die Benutzeroberfläche. Delegation erteilt echte AD-Berechtigungen. Beides arbeitet auf unterschiedlichen Ebenen.',
      commonMisconception: 'Wenn ein Benutzer etwas in der MMC sieht, darf er es auch technisch ausführen.',
    },
    roleHints: ['security', 'support', 'technical'],
    sourceClassification: 'VERIFIED_FACT',
  },
  {
    id: 'ad.delegation.verify',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-verification',
    conceptCluster: 'ad.delegation.verify',
    type: KNOWLEDGE_TYPES.SKILL,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      skill: 'Delegation verifizieren',
      description: 'Nach der Delegation testet man: Passwortreset in OU Stab funktioniert, außerhalb der OU Stab nicht, andere Adminaufgaben sind nicht möglich.',
      distractorDescriptions: [
        'Man testet nur, ob die MMC startet.',
        'Man prüft Domänenadmin-Rechte.',
        'Man testet, ob man Benutzer in anderen Domänen löschen kann.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'ad.delegation.personnelChange',
    topicKey: AD_DELEGATION_TOPIC_KEY,
    sourceTopicKey: AD_DELEGATION_TOPIC_KEY,
    sourceSection: 'ad-delegation-preview',
    conceptCluster: 'ad.delegation.personnelChange',
    type: KNOWLEDGE_TYPES.SKILL,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      skill: 'Personalwechsel im Gruppenmodell abbilden',
      description: 'Wenn eine andere Person die Rolle übernimmt, ändert man die Mitgliedschaft in der Funktionsgruppe G_S6. Die Delegation selbst bleibt bestehen.',
      distractorDescriptions: [
        'Man löscht die OU und erstellt sie neu.',
        'Man führt den Delegation Wizard erneut durch.',
        'Man ändert das Schema.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_SIMPLIFICATION',
  },
];
