// =============================================================================
// Knowledge Items – Cisco Grundkonfiguration
//
// Source: frontend/src/lib/academyLessons/ciscoBasicDeviceConfiguration.js and
// ciscoGrundkonfiguration.js. Phase 9A closes the Knowledge-Layer gap for
// Grundkonfiguration identified by the Cisco Coverage Audit: theory existed
// in the Academy, but no structured knowledge items existed yet.
//
// Deliberately NOT just term-recall ("what does X do?"). Several items focus
// on the DEPENDENCY between commands (why "password" alone is not enough,
// why "login local" needs a local user, why "login" and "login local" are
// mutually exclusive on the same line) - the exact class of bug this audit
// series has repeatedly found and fixed in the mission evaluator.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const BASIC_CONFIG_TOPIC_KEY = topicKey('cisco-packet-tracer', 'basic-device-configuration');

export const ciscoBasicConfigKnowledgeItems = [
  {
    id: 'basicConfig.passwordVsSecret',
    topicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceTopicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceSection: 'enable-secret-classic',
    conceptCluster: 'basicConfig.passwordVsSecret',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    data: {
      items: [
        { name: 'enable password', storage: 'Klartext bzw. schwach reversibel', recommended: false },
        { name: 'enable secret', storage: 'MD5-Hash, nicht umkehrbar', recommended: true },
      ],
      description: '"enable secret" wird immer bevorzugt und überschreibt bei gleichzeitiger Konfiguration sogar "enable password".',
    },
    siblings: [],
  },
  {
    id: 'basicConfig.consoleAuthModes',
    topicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceTopicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceSection: 'login-classic',
    conceptCluster: 'basicConfig.consoleAuth',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      items: [
        { name: 'Line-Passwort', commands: 'password <pw> + login', db: 'das eine Passwort dieser Line' },
        { name: 'Lokale Benutzerdatenbank', commands: 'username <user> secret <pw> + login local', db: 'alle global angelegten Benutzer' },
      ],
      description: 'Beide Varianten sichern die Konsole ab, prüfen aber gegen unterschiedliche Datenbanken und dürfen nicht vermischt werden.',
    },
    siblings: [],
  },
  {
    id: 'basicConfig.consoleLoginDependency',
    topicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceTopicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceSection: 'login-classic',
    conceptCluster: 'basicConfig.consoleAuth',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      symptoms: [
        {
          symptom: 'line console 0 / password cisco ist gesetzt, aber die Konsole fragt beim Verbinden trotzdem kein Passwort ab',
          cause: 'Es fehlt "login" - ein Line-Passwort allein aktiviert noch keine Passwortabfrage.',
        },
        {
          symptom: 'username admin secret X ist angelegt, line console 0 hat nur "login" (ohne local)',
          cause: '"login" prüft gegen das Line-Passwort, nicht gegen die lokale Benutzerdatenbank - der lokale Benutzer wird dabei nicht verwendet.',
        },
        {
          symptom: 'login local ist gesetzt, aber es existiert kein "username ... secret/password"',
          cause: '"login local" ohne lokalen Benutzer sperrt den Zugang faktisch aus, da keine gültigen Zugangsdaten existieren.',
        },
      ],
      description: 'Console-Absicherung besteht immer aus ZWEI Teilen: einer Zugangsdatenquelle (Passwort oder Benutzer) UND der passenden Aktivierung (login bzw. login local).',
    },
    roleHints: ['technical'],
    siblings: [],
  },
  {
    id: 'basicConfig.execTimeoutPurpose',
    topicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceTopicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceSection: 'exec-timeout',
    conceptCluster: 'basicConfig.execTimeout',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    roleHints: ['technical', 'security'],
    data: {
      command: 'exec-timeout <minuten> <sekunden>',
      description: 'Beendet eine inaktive EXEC-Sitzung nach der angegebenen Zeit automatisch - verhindert, dass eine vergessene, offene Sitzung dauerhaft ein Sicherheitsrisiko bleibt.',
      defaultValue: '10 Minuten (Standardwert ohne explizite Konfiguration)',
    },
    siblings: [],
  },
  {
    id: 'basicConfig.servicePasswordEncryption',
    topicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceTopicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceSection: 'service-password-encryption',
    conceptCluster: 'basicConfig.servicePasswordEncryption',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT],
    roleHints: ['technical', 'security'],
    data: {
      command: 'service password-encryption',
      strength: 'Type 7 - ein schwacher, umkehrbarer Verschleierungsalgorithmus, kein echter Hash.',
      description: 'Verschleiert Klartext-Passwörter (z. B. das Line-Passwort) in der gespeicherten Konfiguration gegen zufälliges Mitlesen - ersetzt aber NICHT die starke Hash-Absicherung von "enable secret".',
    },
    siblings: [],
  },
  {
    id: 'basicConfig.runningVsStartupConfig',
    topicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceTopicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceSection: 'speichern-classic',
    conceptCluster: 'basicConfig.persistence',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    roleHints: ['technical'],
    data: {
      items: [
        { name: 'running-config', persistence: 'nur im Arbeitsspeicher (RAM) - geht bei einem Neustart verloren' },
        { name: 'startup-config', persistence: 'im NVRAM gespeichert - bleibt auch nach einem Neustart erhalten' },
      ],
      command: 'copy running-config startup-config (oder write)',
      description: 'Jede CLI-Änderung landet zunächst nur in der running-config. Erst "copy running-config startup-config" bzw. "write" sichert sie dauerhaft in die startup-config.',
    },
    siblings: [],
  },
  {
    id: 'basicConfig.configOrder',
    topicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceTopicKey: BASIC_CONFIG_TOPIC_KEY,
    sourceSection: 'grundkonfiguration-classic',
    conceptCluster: 'basicConfig.order',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    data: {
      steps: [
        'Hostname vergeben',
        'Enable Secret setzen',
        'Lokalen Benutzer anlegen (falls login local geplant ist)',
        'Konsolen-Line absichern (Passwort + login ODER lokaler Benutzer + login local)',
        'EXEC-Timeout setzen',
        'service password-encryption aktivieren',
        'Konfiguration speichern',
      ],
      description: 'Die Grundkonfiguration eines Cisco-Geräts folgt einer sinnvollen Reihenfolge: erst Identität und privilegierter Zugriff, dann Zugangsschutz, dann Härtung, zuletzt Persistenz.',
    },
    siblings: [],
  },
];
