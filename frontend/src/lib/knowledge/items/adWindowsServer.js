// =============================================================================
// Knowledge Items – Active Directory Windows Server Core Management
// Source: frontend/src/lib/academyLessons/adWindowsServer.js
// Primary references: Active Directory – Konfiguration
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const AD_WINDOWS_SERVER_TOPIC_KEY = topicKey('active-directory-virtualbox', 'windows-server');

export const adWindowsServerKnowledgeItems = [
  {
    id: 'ad.windowsServer.coreVsGui',
    topicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceTopicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceSection: 'windows-server-core-vs-gui-classic',
    conceptCluster: 'ad.windowsServer',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Server Core vs. Server mit GUI',
      description: 'Server Core bietet keine vollständige lokale grafische Verwaltung. Eine Server mit Desktop Experience bietet den gewohnten Desktop und Server Manager lokal.',
      distractorDescriptions: [
        'Server Core kann keine Serverrollen installieren.',
        'Server Core ist nur ein Client-Betriebssystem.',
        'Server Core enthält keine PowerShell.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.windowsServer.remoteManagement',
    topicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceTopicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceSection: 'windows-server-remote-management-classic',
    conceptCluster: 'ad.windowsServer',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Remoteverwaltung über Server Manager',
      description: 'Ein Server mit grafischer Oberfläche kann über den Server Manager auch Server Core-Systeme fernverwalten, ohne dass man sich direkt anmelden muss.',
      distractorDescriptions: [
        'Server Core kann nicht remote verwaltet werden.',
        'Remoteverwaltung erfordert immer einen RDP-Zugriff.',
        'Server Manager funktioniert nur auf dem lokalen Rechner.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.windowsServer.addServer',
    topicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceTopicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceSection: 'windows-server-add-server-classic',
    conceptCluster: 'ad.windowsServer',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Server in Server Manager aufnehmen',
      description: 'Über Manage → Add Servers kann ein Domänenmitglied wie FILE01 in die zentrale Serverliste aufgenommen werden. Danach erscheint es unter All Servers.',
      distractorDescriptions: [
        'Server werden automatisch im Server Manager bekannt.',
        'Add Servers installiert Rollen.',
        'Server können nur über DNS hinzugefügt werden.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.windowsServer.targetServer',
    topicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceTopicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceSection: 'windows-server-target-selection-classic',
    conceptCluster: 'ad.windowsServer',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Zielserver im Wizard prüfen',
      description: 'Im Wizard für Rollen und Features muss der Zielserver bewusst geprüft werden. Startet man auf DC01, ist nicht automatisch DC01 das Ziel.',
      distractorDescriptions: [
        'Der Zielserver wird immer automatisch richtig gewählt.',
        'Remoteinstallation installiert immer auf dem Verwaltungsserver.',
        'Der Zielserver spielt keine Rolle bei Rolleninstallationen.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.windowsServer.roleVsManagementTool',
    topicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceTopicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceSection: 'windows-server-role-vs-tool-classic',
    conceptCluster: 'ad.windowsServer',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Rolle vs. Verwaltungstool',
      description: 'Die Rolle oder der Dienst läuft auf dem Zielserver. Das Verwaltungstool kann auf einem anderen Server installiert sein, von dem aus fernverwaltet wird.',
      distractorDescriptions: [
        'Rolle und Verwaltungstool müssen auf dem gleichen Server liegen.',
        'Eine installierte Rolle bringt automatisch alle Verwaltungstools auf dem lokalen Server mit.',
        'Verwaltungstools lassen sich nicht nachträglich installieren.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.windowsServer.getWindowsFeature',
    topicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceTopicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceSection: 'windows-server-powershell-classic',
    conceptCluster: 'ad.windowsServer',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Get-WindowsFeature',
      description: 'Get-WindowsFeature zeigt verfügbare und installierte Serverrollen und Features an, ohne etwas zu installieren.',
      distractorDescriptions: [
        'Get-WindowsFeature installiert Features.',
        'Get-WindowsFeature zeigt nur Fehler an.',
        'Get-WindowsFeature öffnet den Server Manager.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
  {
    id: 'ad.windowsServer.installWindowsFeature',
    topicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceTopicKey: AD_WINDOWS_SERVER_TOPIC_KEY,
    sourceSection: 'windows-server-powershell-classic',
    conceptCluster: 'ad.windowsServer',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Install-WindowsFeature',
      description: 'Install-WindowsFeature installiert eine angegebene Serverrolle oder ein Feature am lokalen Server.',
      distractorDescriptions: [
        'Install-WindowsFeature zeigt nur Rollen an.',
        'Install-WindowsFeature funktioniert nur mit GUI.',
        'Install-WindowsFeature installiert Clients.',
      ],
    },
    roleHints: ['technical'],
    sourceStatus: 'verified',
  },
];
