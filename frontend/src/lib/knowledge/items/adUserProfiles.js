// =============================================================================
// Knowledge Items – Active Directory Benutzerprofile (Kapitel 3)
//
// Source: Lehrgangsmaterial des Nutzers, Kapitel 3
// Source classifications:
//   COURSE_FACT          = unproblematische Lehrgangsaussage
//   COURSE_SIMPLIFICATION = didaktisch vereinfachte Darstellung
//   COURSE_ERROR         = problematische oder zu pauschale Lehrgangsaussage
//   VERIFIED_FACT        = allgemein technisch gültige Einordnung
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const AD_USER_PROFILES_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-user-profiles');

export const adUserProfilesKnowledgeItems = [
  {
    id: 'adup.account.user',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'active-directory-konten',
    conceptCluster: 'ad.userProfiles.account',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'ein Benutzerkonto',
      definition: 'Ein Benutzerkonto ist ein AD-Objekt, das eine reale Person oder einen logischen Zweck repräsentiert und mit Rechten ausgestattet werden kann.',
      distractorDefinitions: [
        'Ein Netzwerkkabel, das den Client mit dem Switch verbindet.',
        'Ein Verzeichnis auf der lokalen Festplatte.',
        'Ein Authentifizierungsprotokoll.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.account.computer',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'active-directory-konten',
    conceptCluster: 'ad.userProfiles.account',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'ein Computerkonto',
      definition: 'Ein Computerkonto ist ein AD-Objekt, das einen Computer in der Domäne repräsentiert und beim Domänenbeitritt automatisch oder manuell angelegt werden kann.',
      distractorDefinitions: [
        'Ein Benutzerkonto für den IT-Helpdesk.',
        'Ein Protokoll zur Dateifreigabe.',
        'Eine zentrale Speicherdatei.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.account.functional',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'active-directory-konten',
    conceptCluster: 'ad.userProfiles.account',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'ein funktionales Konto',
      definition: 'Ein funktionales Konto existiert für einen bestimmten Zweck, z. B. als Dienstkonto, Anwendungskonto, Monitoring-Konto oder Administratorkonto.',
      distractorDefinitions: [
        'Ein Konto für eine reale Person mit Vor- und Nachnamen.',
        'Ein Client mit lokal gespeichertem Profil.',
        'Ein Netzwerkdrucker.',
      ],
    },
    roleHints: ['technical', 'security'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.profile.local',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'benutzerprofile',
    conceptCluster: 'ad.userProfiles.profile',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'lokales Benutzerprofil',
      description: 'Ein lokales Benutzerprofil wird auf dem jeweiligen Client gespeichert. Änderungen gelten nur auf diesem Rechner und werden nicht automatisch auf andere Clients übertragen.',
      distractorDescriptions: [
        'Das Profil liegt zentral auf einem Server und wird bei jeder Anmeldung geladen.',
        'Einstellungen werden automatisch auf alle Domänenclients repliziert.',
        'Das Profil kann nur von Administratoren gelesen werden.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.profile.roaming',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'benutzerprofile',
    conceptCluster: 'ad.userProfiles.profile',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'servergespeichertes Profil',
      description: 'Ein servergespeichertes Profil liegt auf einer zentralen Netzwerkfreigabe. Beim Anmelden wird es auf den Client geladen, beim Abmelden werden Änderungen auf den Server zurückgeschrieben.',
      distractorDescriptions: [
        'Das Profil wird immer automatisch bei jeder Domänenanmeldung verwendet, ohne jede Konfiguration.',
        'Lokale Profile sind schneller und immer der einzige zulässige Profiltyp.',
        'Servergespeicherte Profile haben keine Auswirkung auf die Anmeldegeschwindigkeit.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_SIMPLIFICATION',
  },
  {
    id: 'adup.profile.folderRedirection',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'ordnerumleitung',
    conceptCluster: 'ad.userProfiles.profile',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Ordnerumleitung',
      description: 'Ordnerumleitung legt bestimmte Benutzerordner auf einer zentralen Netzwerkfreigabe ab. Sie reduziert die Menge an Daten, die als Teil eines Benutzerprofils übertragen werden muss.',
      distractorDescriptions: [
        'Ordnerumleitung bedeutet, dass kein lokales Profil mehr existiert und keine Offline-Anmeldung möglich ist.',
        'Ordnerumleitung ersetzt alle NTFS-Berechtigungen.',
        'Ordnerumleitung wird automatisch für alle Domänenbenutzer ohne Konfiguration aktiv.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.home',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'home-verzeichnis',
    conceptCluster: 'ad.userProfiles.home',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Home-Verzeichnis / Basisordner',
      definition: 'Das Home-Verzeichnis ist ein zentraler Speicherort für persönliche Benutzerdateien. Es unterscheidet sich vom Benutzerprofil, das Einstellungen und profilbezogene Daten enthält.',
      distractorDefinitions: [
        'Das Home-Verzeichnis ist dasselbe wie das Benutzerprofil.',
        'Das Home-Verzeichnis speichert ausschließlich Desktop-Hintergründe.',
        'Das Home-Verzeichnis wird nur auf dem lokalen Rechner angelegt.',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.unc',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'unc',
    conceptCluster: 'ad.userProfiles.unc',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.INPUT],
    data: {
      term: 'UNC-Pfad',
      definition: 'Ein UNC-Pfad folgt der Form \\\\Servername\\Freigabename und wird verwendet, um auf Netzwerkressourcen zuzugreifen.',
      distractorDefinitions: [
        'C:\\Benutzer\\Max\\Dokumente',
        'http://www.example.com',
        '192.168.10.1\\freigabe',
      ],
    },
    roleHints: ['support', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.adminTier',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'admin-tier',
    conceptCluster: 'ad.userProfiles.tier',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Admin-Tier-Modell',
      description: 'Das Tier-Modell trennt Administrative nach Schutzbedürfnis: Tier 0 umfasst hochprivilegierte Domäneninfrastruktur, Tier 1 Serveradministration und Tier 2 Clientadministration/Helpdesk.',
      distractorDescriptions: [
        'Tier-0-Konten dürfen sich auf jedem beliebigen Client anmelden.',
        'Tier-2-Konten werden für Domänencontroller verwendet.',
        'Das Tier-Modell verbietet jede Anmeldung an Servern.',
      ],
    },
    roleHints: ['security', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.passTheHash',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'admin-tier',
    conceptCluster: 'ad.userProfiles.tier',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      subject: 'Pass-the-Hash',
      description: 'Bei Pass-the-Hash-Angriffen werden abgegriffene Authentifizierungsinformationen bzw. NTLM-Hashes missbraucht, ohne das Klartextkennwort zu kennen.',
      distractorDescriptions: [
        'Pass-the-Hash erfordert das Klartextkennwort.',
        'Pass-the-Hash ist nur ein theoretisches Konzept ohne praktische Relevanz.',
        'Pass-the-Hash betrifft nur lokale Benutzerprofile.',
      ],
    },
    roleHints: ['security', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.whoCanCreateUser',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'wer-darf-benutzer-anlegen',
    conceptCluster: 'ad.userProfiles.administration',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      subject: 'Konten mit Berechtigung zum Anlegen von Benutzern',
      description: 'Im Lehrgang werden für das Anlegen von Benutzern Domänen-Admins, Organisations-Admins und Konten-Operatoren genannt.',
      distractorDescriptions: [
        'Jeder normale Benutzer kann standardmäßig Benutzer in allen OUs anlegen.',
        'Nur Helpdesk-Mitarbeiter ohne Gruppenmitgliedschaft dürfen Benutzer anlegen.',
        'Computerkonten können Benutzerkonten selbst anlegen.',
      ],
    },
    roleHints: ['management', 'technical'],
    sourceClassification: 'COURSE_FACT',
  },
  {
    id: 'adup.newADUser',
    topicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceTopicKey: AD_USER_PROFILES_TOPIC_KEY,
    sourceSection: 'powershell-new-aduser',
    conceptCluster: 'ad.userProfiles.powershell',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    data: {
      subject: 'New-ADUser Parameter',
      description: 'Der Lehrgangsbefehl New-ADUser verwendet Parameter wie Name, SamAccountName, UserPrincipalName, Path, AccountPassword und Enabled.',
      distractorDescriptions: [
        'New-ADUser verwendet ausschließlich die Parameter IPAddress und SubnetMask.',
        'New-ADUser legt Computerkonten an.',
        'New-ADUser erfordert die Angabe der MAC-Adresse.',
      ],
    },
    roleHints: ['technical'],
    sourceClassification: 'COURSE_FACT',
  },
];
