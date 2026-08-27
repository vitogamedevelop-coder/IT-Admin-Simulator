// =============================================================================
// Knowledge Items – Cisco-Theorie (Phase 7)
//
// Sources:
//   - frontend/src/lib/academyLessons/ciscoGrundlagen.js
//   - frontend/src/lib/academyLessons/ciscoRouterBasics.js
//   - frontend/src/lib/academyLessons/ciscoStaticRouting.js
//
// Covers only conceptual understanding; no CLI command recall drills.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const CISCO_GRUNDLAGEN_TOPIC_KEY = topicKey('cisco-packet-tracer', 'grundlagen');
export const CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY = topicKey('cisco-packet-tracer', 'basic-device-configuration');
export const CISCO_ROUTER_BASICS_TOPIC_KEY = topicKey('cisco-packet-tracer', 'router-basics');
export const CISCO_STATIC_ROUTING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'static-routing');

// ---------------------------------------------------------------------------
// cisco-packet-tracer/grundlagen
// ---------------------------------------------------------------------------

const GRUNDLAGEN_ITEMS = [
  {
    id: 'ct.grundlagen.ios',
    topicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceSection: 'ios-classic',
    conceptCluster: 'cisco.ios',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Cisco IOS',
      definition: 'Internetwork Operating System – das Betriebssystem auf Cisco-Switches und -Routern, das die Kommandozeile (CLI) zur Konfiguration und Überwachung bereitstellt.',
      description: 'Cisco IOS ist das Betriebssystem auf Cisco-Geräten; es stellt die CLI bereit.',
      distractorDefinitions: [
        'Ein speicherbasiertes Modul auf Cisco-Geräten, das die aktuelle Konfiguration vor einem Neustart sichert.',
        'Das Routing-Protokoll, das Cisco-Router verwenden, um Netze automatisch zu erlernen.',
        'Ein proprietäres Diagnoseprogramm, das nur während des POST-Bootvorgangs ausgeführt wird.',
      ],
    },
    siblings: ['ct.grundlagen.memory', 'ct.grundlagen.boot', 'ct.grundlagen.modes', 'ct.grundlagen.configFiles'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.grundlagen.memory',
    topicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceSection: 'speicher-classic',
    conceptCluster: 'cisco.memory',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.MATCHING],
    data: {
      pairs: [
        { key: 'ROM', value: 'Bootstrap-Programm und ROMMON (nicht flüchtig, nicht veränderbar)' },
        { key: 'Flash', value: 'IOS-Image (nicht flüchtig, überschreibbar)' },
        { key: 'NVRAM', value: 'startup-config (nicht flüchtig)' },
        { key: 'RAM', value: 'running-config und laufendes IOS (flüchtig)' },
      ],
      description: 'Jede Speicherkomponente eines Cisco-Geräts hat einen bestimmten Inhalt und eine bestimmte Flüchtigkeit.',
    },
    siblings: ['ct.grundlagen.ios', 'ct.grundlagen.boot', 'ct.grundlagen.modes', 'ct.grundlagen.configFiles'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.grundlagen.boot',
    topicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceSection: 'boot-classic',
    conceptCluster: 'cisco.boot',
    type: KNOWLEDGE_TYPES.ORDER,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      steps: [
        { id: 'post', label: 'POST – Hardware-Selbsttest' },
        { id: 'bootstrap', label: 'Bootstrap-Programm sucht das IOS-Image' },
        { id: 'ios', label: 'IOS-Image aus dem Flash in den RAM laden' },
        { id: 'config', label: 'startup-config aus dem NVRAM laden' },
      ],
      description: 'Der Bootvorgang läuft in einer festen Reihenfolge ab: POST, Bootstrap, IOS laden, Konfiguration laden.',
    },
    siblings: ['ct.grundlagen.ios', 'ct.grundlagen.memory', 'ct.grundlagen.modes', 'ct.grundlagen.configFiles'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.grundlagen.modes',
    topicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceSection: 'modi-classic',
    conceptCluster: 'cisco.modes',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.MATCHING],
    data: {
      pairs: [
        { key: 'User EXEC Mode', value: 'Eingeschränkter Modus direkt nach dem Login' },
        { key: 'Privileged EXEC Mode', value: 'Erweiterte Rechte, alle show-/Diagnosebefehle' },
        { key: 'Global Configuration Mode', value: 'Änderungen, die das gesamte Gerät betreffen' },
        { key: 'Interface Configuration Mode', value: 'Änderungen an einer bestimmten Schnittstelle' },
      ],
      description: 'Die IOS-Konfigurationsmodi unterscheiden sich in ihrem Zweck und ihrem Berechtigungsgrad.',
    },
    siblings: ['ct.grundlagen.ios', 'ct.grundlagen.memory', 'ct.grundlagen.boot', 'ct.grundlagen.configFiles'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.grundlagen.configFiles',
    topicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceTopicKey: CISCO_GRUNDLAGEN_TOPIC_KEY,
    sourceSection: 'configfiles-classic',
    conceptCluster: 'cisco.configFiles',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      compareOn: 'purpose',
      items: [
        { name: 'running-config', volatility: 'flüchtig (RAM)', purpose: 'aktiv genutzte Konfiguration' },
        { name: 'startup-config', volatility: 'nicht flüchtig (NVRAM)', purpose: 'beim nächsten Start geladen' },
      ],
      description: 'running-config und startup-config unterscheiden sich in Speicherort, Flüchtigkeit und Bedeutung.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// cisco-packet-tracer/basic-device-configuration
// ---------------------------------------------------------------------------

const BASIC_DEVICE_CONFIG_ITEMS = [
  {
    id: 'ct.basicConfig.noShutdown',
    topicKey: CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY,
    sourceTopicKey: CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY,
    sourceSection: 'interface-ip-classic',
    conceptCluster: 'cisco.basicConfig.interfaceEnable',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'no shutdown',
      description: 'Cisco-Interfaces sind standardmäßig administrativ deaktiviert; erst "no shutdown" aktiviert sie, auch wenn IP-Adresse und Maske korrekt konfiguriert sind.',
      distractorDescriptions: [
        '"no shutdown" löscht die Interface-Konfiguration und setzt den Port auf Werkseinstellungen zurück.',
        '"no shutdown" speichert die aktuelle Konfiguration dauerhaft im NVRAM.',
        '"no shutdown" deaktiviert den Port, um ihn vor unbefugtem Zugriff zu schützen.',
      ],
    },
    siblings: ['ct.basicConfig.noDomainLookup', 'ct.basicConfig.saveConfig', 'ct.basicConfig.doCommand'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.basicConfig.noDomainLookup',
    topicKey: CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY,
    sourceTopicKey: CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY,
    sourceSection: 'domain-lookup-classic',
    conceptCluster: 'cisco.basicConfig.noDomainLookup',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'no ip domain-lookup',
      description: 'Deaktiviert den Versuch des Geräts, unbekannte CLI-Eingaben per DNS als Hostnamen aufzulösen, und vermeidet so Wartezeiten bei Tippfehlern.',
      distractorDescriptions: [
        '"no ip domain-lookup" entfernt den konfigurierten Domainnamen des Geräts.',
        '"no ip domain-lookup" verhindert, dass Hosts im Netz DNS-Anfragen erhalten.',
        '"no ip domain-lookup" ist nur im User EXEC Mode verfügbar.',
      ],
    },
    siblings: ['ct.basicConfig.noShutdown', 'ct.basicConfig.saveConfig', 'ct.basicConfig.doCommand'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.basicConfig.saveConfig',
    topicKey: CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY,
    sourceTopicKey: CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY,
    sourceSection: 'speichern-classic',
    conceptCluster: 'cisco.basicConfig.saveConfig',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'copy running-config startup-config',
      description: 'Überträgt die aktuell im RAM befindliche running-config dauerhaft ins NVRAM als startup-config, damit sie einen Neustart übersteht.',
      distractorDescriptions: [
        '"copy running-config startup-config" lädt die gespeicherte Konfiguration in den RAM.',
        '"copy running-config startup-config" löscht die startup-config.',
        '"copy running-config startup-config" ist nur im User EXEC Mode erlaubt.',
      ],
    },
    siblings: ['ct.basicConfig.noShutdown', 'ct.basicConfig.noDomainLookup', 'ct.basicConfig.doCommand'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.basicConfig.doCommand',
    topicKey: CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY,
    sourceTopicKey: CISCO_BASIC_DEVICE_CONFIG_TOPIC_KEY,
    sourceSection: 'do-classic',
    conceptCluster: 'cisco.basicConfig.doCommand',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'do <Befehl>',
      description: 'Führt einen Privileged-EXEC-Befehl (z. B. show-Befehle) direkt aus einem Konfigurationsmodus aus, ohne diesen vorher zu verlassen.',
      distractorDescriptions: [
        '"do" wechselt in den Global Configuration Mode.',
        '"do" speichert die Konfiguration dauerhaft.',
        '"do" ist nur im User EXEC Mode verfügbar.',
      ],
    },
    siblings: ['ct.basicConfig.noShutdown', 'ct.basicConfig.noDomainLookup', 'ct.basicConfig.saveConfig'],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// cisco-packet-tracer/router-basics
// ---------------------------------------------------------------------------

const ROUTER_BASICS_ITEMS = [
  {
    id: 'ct.router.function',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'intro-classic',
    conceptCluster: 'cisco.router.purpose',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Router',
      definition: 'Ein Router verbindet unterschiedliche Netzwerke und entscheidet anhand der Ziel-IP-Adresse eines Pakets, über welche Schnittstelle es weitergeleitet wird.',
      description: 'Ein Router leitet Pakete zwischen unterschiedlichen Netzen anhand von IP-Adressen weiter.',
      distractorDefinitions: [
        'Ein Switch verbindet Endgeräte innerhalb desselben Netzes anhand von MAC-Adressen.',
        'Eine Firewall überwacht und filtert Datenverkehr anhand von Sicherheitsregeln.',
        'Ein Access Point stellt drahtlose Verbindungen für Endgeräte in einem LAN bereit.',
      ],
    },
    siblings: ['ct.router.table', 'ct.router.nextHop', 'ct.router.ad'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.router.table',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'entscheidung-classic',
    conceptCluster: 'cisco.router.table',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Routingtabelle',
      description: 'Die Routingtabelle enthält Einträge mit Zielnetz, Next Hop, Ausgangsschnittstelle und Metrik.',
      distractorDescriptions: [
        'Eine Tabelle, die MAC-Adressen den Switch-Ports zuordnet, an denen die Geräte angeschlossen sind.',
        'Eine Liste aller aktiven Benutzersitzungen auf dem Router mit ihren Berechtigungen.',
        'Ein Protokoll, das automatisch Routing-Informationen zwischen benachbarten Routern austauscht.',
      ],
    },
    siblings: ['ct.router.nextHop', 'ct.router.ad'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.router.nextHop',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'entscheidung-classic',
    conceptCluster: 'cisco.router.table',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Next Hop',
      description: 'Der Next Hop ist die IP-Adresse des nächsten Routers, an den ein Paket auf dem Weg zum Zielnetz weitergegeben wird.',
      distractorDescriptions: [
        'Die physische Port-Nummer, über die das Paket den Router verlässt.',
        'Die MAC-Adresse des nächsten Netzwerkgeräts im lokalen Segment.',
        'Die Ziel-IP-Adresse des Endgeräts, an das das Paket letztendlich ausgeliefert wird.',
      ],
    },
    siblings: ['ct.router.table', 'ct.router.ad'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.router.lpm',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'entscheidung-classic',
    conceptCluster: 'cisco.router.decision',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Longest Prefix Match',
      description: 'Wenn mehrere Routing-Einträge passen, gewinnt immer der spezifischere Eintrag mit der längeren Subnetzmaske.',
      distractorDescriptions: [
        'Wenn mehrere Routing-Einträge passen, gewinnt immer der Eintrag mit der niedrigsten Metrik.',
        'Wenn mehrere Routing-Einträge passen, wählt der Router zufällig einen aus, um Last zu verteilen.',
        'Wenn mehrere Routing-Einträge passen, gewinnt immer die älteste bekannte Route in der Tabelle.',
      ],
    },
    siblings: ['ct.router.ad'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.router.ad',
    topicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceTopicKey: CISCO_ROUTER_BASICS_TOPIC_KEY,
    sourceSection: 'ad-metrik-classic',
    conceptCluster: 'cisco.router.ad',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Administrative Distance',
      description: 'Die Administrative Distance bewertet, wie vertrauenswürdig eine Routing-Quelle ist; niedrigere Werte gewinnen, wenn mehrere Quellen dieselbe Route liefern.',
      distractorDescriptions: [
        'Die Administrative Distance gibt die Anzahl der Router an, die ein Paket bis zum Ziel passieren darf.',
        'Die Administrative Distance misst die physische Entfernung zwischen zwei Routern in Metern.',
        'Die Administrative Distance ist die maximale Anzahl gleichzeitiger Verbindungen auf einem Router.',
      ],
    },
    siblings: ['ct.router.table', 'ct.router.nextHop', 'ct.router.lpm'],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// cisco-packet-tracer/static-routing
// ---------------------------------------------------------------------------

const STATIC_ROUTING_ITEMS = [
  {
    id: 'ct.static.definition',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'intro-classic',
    conceptCluster: 'cisco.static.purpose',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Statische Route',
      definition: 'Ein manuell vom Administrator eingetragener Weg zu einem entfernten Netz; geeignet für kleine, stabile Netze oder als Default Route.',
      description: 'Eine statische Route wird manuell eingetragen, um ein entferntes Netz über einen definierten Next Hop zu erreichen.',
      distractorDefinitions: [
        'Eine Route, die Router automatisch über ein Routing-Protokoll wie OSPF austauschen.',
        'Ein temporärer Pfad, der bei jedem Neustart des Routers neu ausgehandelt werden muss.',
        'Eine vom DHCP-Server verteilte Standardroute für alle Clients im Netzwerk.',
      ],
    },
    siblings: ['ct.static.components', 'ct.static.defaultRoute'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.static.components',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'begriffe-classic',
    conceptCluster: 'cisco.static.components',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.MATCHING],
    data: {
      pairs: [
        { key: 'Zielnetz', value: 'Das entfernte Netzwerk, das erreichbar werden soll' },
        { key: 'Subnetzmaske', value: 'Legt fest, wie groß das Zielnetz ist' },
        { key: 'Next Hop', value: 'IP-Adresse des nächsten Routers auf dem Weg zum Ziel' },
      ],
      description: 'Eine statische Route beantwortet die Frage: Um welches Netz mit welcher Maske zu erreichen, schicke ich Pakete an welchen Next Hop.',
    },
    siblings: ['ct.static.definition', 'ct.static.defaultRoute'],
    roleHints: ['technical'],
  },
  {
    id: 'ct.static.defaultRoute',
    topicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceTopicKey: CISCO_STATIC_ROUTING_TOPIC_KEY,
    sourceSection: 'cli-classic',
    conceptCluster: 'cisco.static.defaultRoute',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Default Route',
      description: 'Die Default Route passt auf jedes Ziel, für das keine spezifischere Route existiert; typischerweise der Weg ins Internet.',
      distractorDescriptions: [
        'Die Default Route ist die Route mit der geringsten Bandbreite im gesamten Netzwerk.',
        'Die Default Route wird nur für Pakete verwendet, die an das lokale Subnetz adressiert sind.',
        'Die Default Route ist eine dynamisch gelernte Route mit der höchsten Priorität.',
      ],
    },
    siblings: ['ct.static.definition', 'ct.static.components'],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export const CISCO_THEORY_ITEMS = [
  ...GRUNDLAGEN_ITEMS,
  ...BASIC_DEVICE_CONFIG_ITEMS,
  ...ROUTER_BASICS_ITEMS,
  ...STATIC_ROUTING_ITEMS,
];
