// =============================================================================
// Knowledge Items – Netzwerk-Grundlagen (Phase 7)
//
// Sources:
//   - frontend/src/lib/employeeConversations.js (Grundbegriffe)
//   - frontend/src/lib/academyLessonData.js (Topologien)
//   - frontend/src/lib/academyLessons/kommunikationUebertragung.js
//   - frontend/src/lib/academyLessons/tcpUdp.js
//   - frontend/src/lib/academyLessons/dns.js
//   - frontend/src/lib/academyLessons/dhcp.js
//   - frontend/src/lib/academyLessons/routing.js
//   - frontend/src/lib/academyLessons/vlsm.js
//   - frontend/src/lib/academyLessons/supernetting.js
//
// Covers only conceptual understanding from the Academy lessons; no CLI drills.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const GRUNDBEGRIFFE_TOPIC_KEY = topicKey('fundamentals', 'grundbegriffe');
export const TOPOLOGIEN_TOPIC_KEY = topicKey('fundamentals', 'topologien');
export const KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY = topicKey('fundamentals', 'kommunikation-uebertragung');
export const TCP_UDP_TOPIC_KEY = topicKey('fundamentals', 'tcp-udp');
export const DNS_TOPIC_KEY = topicKey('fundamentals', 'dns');
export const DHCP_TOPIC_KEY = topicKey('fundamentals', 'dhcp');
export const ROUTING_TOPIC_KEY = topicKey('fundamentals', 'routing');
export const VLSM_TOPIC_KEY = topicKey('fundamentals', 'vlsm');
export const SUPERNETTING_TOPIC_KEY = topicKey('fundamentals', 'supernetting');

// ---------------------------------------------------------------------------
// fundamentals/grundbegriffe
// Only facts actually present in the conversation content are included.
// (LAN/WAN distinction exists; MAN/PAN/WLAN/GAN are not defined there.)
// ---------------------------------------------------------------------------

const NETWORK_SCOPE_DEFINITION_SIBLINGS = [
  'nb.grundbegriffe.pan',
  'nb.grundbegriffe.lan',
  'nb.grundbegriffe.man',
  'nb.grundbegriffe.wan',
  'nb.grundbegriffe.mac',
  'nb.grundbegriffe.ip',
];

const GRUNDBEGRIFFE_ITEMS = [
  {
    id: 'nb.grundbegriffe.pan',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.networkSizes.definition',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'PAN',
      definition: 'Personal Area Network – sehr kleiner persönlicher Bereich, typischerweise um ein einzelnes Gerät herum (z. B. Bluetooth-Geräte).',
      description: 'Personal Area Network – sehr kleiner persönlicher Bereich, typischerweise um ein einzelnes Gerät herum (z. B. Bluetooth-Geräte).',
      distractorDefinitions: [
        'Local Area Network – Netzwerk innerhalb eines begrenzten Bereichs wie eines Büros, einer Etage oder eines Gebäudes.',
        'Metropolitan Area Network – Netzwerk, das eine Stadt- oder Metropolregion abdeckt.',
        'Wide Area Network – verbindet geografisch getrennte Standorte, typischerweise über Provider-Leitungen.',
      ],
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS.filter((id) => id !== 'nb.grundbegriffe.pan'),
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.grundbegriffe.lan',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.networkSizes.definition',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'LAN',
      definition: 'Local Area Network – lokales Netzwerk innerhalb eines begrenzten Bereichs wie eines Büros, einer Etage oder eines Gebäudes.',
      description: 'Local Area Network – lokales Netzwerk innerhalb eines begrenzten Bereichs wie eines Büros, einer Etage oder eines Gebäudes.',
      distractorDefinitions: [
        'Personal Area Network – sehr kleiner persönlicher Bereich, typischerweise um ein einzelnes Gerät herum.',
        'Metropolitan Area Network – Netzwerk, das eine Stadt- oder Metropolregion abdeckt.',
        'Wide Area Network – verbindet geografisch getrennte Standorte, typischerweise über Provider-Leitungen.',
      ],
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS.filter((id) => id !== 'nb.grundbegriffe.lan'),
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.grundbegriffe.man',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.networkSizes.definition',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'MAN',
      definition: 'Metropolitan Area Network – Netzwerk, das eine Stadt- oder Metropolregion abdeckt.',
      description: 'Metropolitan Area Network – Netzwerk, das eine Stadt- oder Metropolregion abdeckt.',
      distractorDefinitions: [
        'Personal Area Network – sehr kleiner persönlicher Bereich, typischerweise um ein einzelnes Gerät herum.',
        'Local Area Network – lokales Netzwerk innerhalb eines begrenzten Bereichs wie eines Büros, einer Etage oder eines Gebäudes.',
        'Wide Area Network – verbindet geografisch getrennte Standorte, typischerweise über Provider-Leitungen.',
      ],
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS.filter((id) => id !== 'nb.grundbegriffe.man'),
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.grundbegriffe.wan',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.networkSizes.definition',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'WAN',
      definition: 'Wide Area Network – verbindet geografisch getrennte Standorte, typischerweise über Provider-Leitungen.',
      description: 'Wide Area Network – verbindet geografisch getrennte Standorte, typischerweise über Provider-Leitungen.',
      distractorDefinitions: [
        'Personal Area Network – sehr kleiner persönlicher Bereich, typischerweise um ein einzelnes Gerät herum.',
        'Local Area Network – lokales Netzwerk innerhalb eines begrenzten Bereichs wie eines Büros, einer Etage oder eines Gebäudes.',
        'Metropolitan Area Network – Netzwerk, das eine Stadt- oder Metropolregion abdeckt.',
      ],
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS.filter((id) => id !== 'nb.grundbegriffe.wan'),
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.grundbegriffe.mac',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.addressing',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'MAC-Adresse',
      definition: 'Media Access Control – weltweit eindeutige, vom Hersteller vergebene physikalische Adresse eines Netzwerkinterfaces.',
      description: 'Die MAC-Adresse wird vom Hersteller vergeben und ist auf dem Netzwerkinterface physikalisch hinterlegt.',
      distractorDefinitions: [
        'Internet Protocol – logische, routbare Adresse für die Kommunikation zwischen Netzwerken.',
        'Ein vom Administrator vergebener logischer Hostname für ein Gerät im lokalen Netz.',
        'Eine dynamische Adresse, die sich bei jedem Netzwerkwechsel automatisch ändert.',
      ],
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS.filter((id) => id !== 'nb.grundbegriffe.mac'),
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.grundbegriffe.ip',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.addressing',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'IP-Adresse',
      definition: 'Internet Protocol – logische, routbare Adresse für die Kommunikation zwischen Netzwerken.',
      description: 'Die IP-Adresse ist logisch und routbar.',
      distractorDefinitions: [
        'Media Access Control – weltweit eindeutige, vom Hersteller vergebene physikalische Adresse eines Netzwerkinterfaces.',
        'Ein vom DHCP-Server generierter Hostname für die DNS-Namensauflösung.',
        'Eine feste Seriennummer des Netzwerkadapters, die sich nicht ändern lässt.',
      ],
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS.filter((id) => id !== 'nb.grundbegriffe.ip'),
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.grundbegriffe.networkScopeOrder',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.networkSizes.relativeSize',
    type: KNOWLEDGE_TYPES.ORDER,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      steps: [
        { id: 'pan', label: 'PAN' },
        { id: 'lan', label: 'LAN' },
        { id: 'man', label: 'MAN' },
        { id: 'wan', label: 'WAN' },
      ],
      description: 'Netzwerktypen lassen sich nach typischer geografischer Ausdehnung ordnen: PAN < LAN < MAN < WAN.',
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS,
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.grundbegriffe.networkScopeMapping',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.networkSizes.identification',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.MATCHING],
    data: {
      pairs: [
        { key: 'PAN', value: 'persönlicher Nahbereich' },
        { key: 'LAN', value: 'lokales Gebäude/Standortnetz' },
        { key: 'MAN', value: 'Stadt-/Metropolregion' },
        { key: 'WAN', value: 'große geografische Entfernung / mehrere Standorte' },
      ],
      description: 'Jeder Netzwerktyp lässt sich einer typischen Größenordnung zuordnen.',
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS,
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.grundbegriffe.networkScopeScenarios',
    topicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceTopicKey: GRUNDBEGRIFFE_TOPIC_KEY,
    sourceSection: 'conversation',
    conceptCluster: 'grundbegriffe.networkSizes.scenarioClassification',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      compareOn: 'scenario',
      items: [
        { name: 'PAN', scenario: 'Geräte im Umkreis einer Person, z. B. Kopfhörer und Handy' },
        { name: 'LAN', scenario: 'Netz innerhalb eines Bürogebäudes' },
        { name: 'MAN', scenario: 'Verbindung mehrerer Stadtteile' },
        { name: 'WAN', scenario: 'Standorte in verschiedenen Städten über Provider-Leitungen' },
      ],
      description: 'Netzwerktypen unterscheiden sich durch ihre typische räumliche Ausdehnung und den Einsatzfall.',
    },
    siblings: NETWORK_SCOPE_DEFINITION_SIBLINGS,
    roleHints: ['technical', 'support'],
  },
];

// ---------------------------------------------------------------------------
// fundamentals/topologien
// ---------------------------------------------------------------------------

const TOPOLOGY_DATA = {
  bus: {
    name: 'Bus',
    tagline: 'Alle Geräte hängen an einem einzigen Kabelstrang.',
    description: 'Bei einer Bus-Topologie sind alle Geräte an ein gemeinsames Übertragungsmedium angeschlossen.',
    resilience: 'Niedrig: ein einzelner Fehler im Backbone unterbricht die Kommunikation für alle.',
    cost: 'Sehr günstig bei wenigen Teilnehmern.',
    scalability: 'Schlecht: ab etwa 20-30 aktiven Geräten steigen Kollisionen und die Leistung sinkt.',
    useCases: 'Historisch in klassischen Ethernet-Netzen mit Koaxialkabel.',
    distractorDescriptions: [
      'Jedes Gerät ist mit genau zwei Nachbarn verbunden und bildet einen geschlossenen Kreis.',
      'Alle Endgeräte sind über eigene Leitungen mit einem zentralen Gerät verbunden.',
      'Jeder wichtige Knoten ist mit mehreren anderen direkt verbunden, um Ausfallsicherheit zu schaffen.',
    ],
  },
  ring: {
    name: 'Ring',
    tagline: 'Jedes Gerät ist mit genau zwei Nachbarn verbunden und bildet einen Kreis.',
    description: 'In einer Ring-Topologie ist jedes Gerät mit genau zwei anderen verbunden; Daten laufen in eine Richtung um den Kreis.',
    resilience: 'Mittel bis niedrig: ein Single-Ring fällt bei einem Fehler aus.',
    cost: 'Mittel: weniger Kabel als Stern, aber Token-Management notwendig.',
    scalability: 'Befriedigend für kleine bis mittlere Netze; bei vielen Stationen steigt die Latenz pro Umlauf.',
    useCases: 'Token-Ring-Netze und FDDI als Glasfaser-Ring.',
    distractorDescriptions: [
      'Alle Geräte hängen an einem gemeinsamen Kabelstrang, der als Backbone dient.',
      'Mehrere Stern-Netze sind hierarchisch über weitere Sterne miteinander verbunden.',
      'Alle Endgeräte sind über eigene Leitungen mit einem zentralen Gerät verbunden.',
    ],
  },
  star: {
    name: 'Stern',
    tagline: 'Alle Endgeräte laufen in einem zentralen Verteiler zusammen.',
    description: 'Bei einer Stern-Topologie ist jedes Endgerät über einen eigenen Link mit einem zentralen Gerät verbunden.',
    resilience: 'Hoch für Endgeräte-Links, niedrig für das zentrale Gerät.',
    cost: 'Niedrig bis mittel: Standard-Switche und Patchkabel sind günstig.',
    scalability: 'Sehr gut: Switche lassen sich stapeln und verbinden.',
    useCases: 'Fast alle modernen Ethernet-LANs und Büroetagen.',
    distractorDescriptions: [
      'Alle Geräte hängen an einem einzigen gemeinsamen Kabelstrang.',
      'Jedes Gerät ist mit genau zwei Nachbarn verbunden und bildet einen Kreis.',
      'Mehrere Stern-Netze sind hierarchisch über weitere Sterne miteinander verbunden.',
    ],
  },
  tree: {
    name: 'Baum',
    tagline: 'Mehrere Sterne werden über weitere Sterne miteinander verbunden.',
    description: 'Eine Baum-Topologie entsteht, wenn mehrere Stern-Netze hierarchisch miteinander verbunden werden.',
    resilience: 'Mittel: Fehler in einem Blatt bleiben lokal, Wurzel-Ausfall beeinträchtigt viele Geräte.',
    cost: 'Mittel bis hoch: mehr Switche, aber durch Standardkomponenten beherrschbar.',
    scalability: 'Sehr gut: Bäume lassen sich durch zusätzliche Ebenen vergrößern.',
    useCases: 'Mehrstöckige Firmengebäude und Campus-Netze.',
    distractorDescriptions: [
      'Alle Geräte hängen an einem einzigen gemeinsamen Kabelstrang.',
      'Jedes Gerät ist mit genau zwei Nachbarn verbunden und bildet einen Kreis.',
      'Alle Endgeräte sind über eigene Leitungen mit einem zentralen Gerät verbunden.',
    ],
  },
  mesh: {
    name: 'Vermascht',
    tagline: 'Jedes wichtige Gerät ist mit mehreren anderen direkt verbunden.',
    description: 'In einer vermaschten Topologie gibt es viele direkte Verbindungen zwischen den Knoten.',
    resilience: 'Sehr hoch: Solange ein alternativer Pfad existiert, bleibt das Netz erreichbar.',
    cost: 'Hoch: viele Leitungen, Switche/Router und Routing-Protokolle erforderlich.',
    scalability: 'Gut für definierte Bereiche, aber voll vermaschte Netze wachsen quadratisch im Aufwand.',
    useCases: 'Internet-Backbone, Rechenzentren und kritische Infrastrukturen.',
    distractorDescriptions: [
      'Alle Geräte hängen an einem einzigen gemeinsamen Kabelstrang.',
      'Jedes Gerät ist mit genau zwei Nachbarn verbunden und bildet einen Kreis.',
      'Mehrere Stern-Netze sind hierarchisch über weitere Sterne miteinander verbunden.',
    ],
  },
};

const TOPOLOGIE_ITEMS = [
  ...Object.entries(TOPOLOGY_DATA).map(([key, topo]) => ({
    id: `nb.topologien.${key}`,
    topicKey: TOPOLOGIEN_TOPIC_KEY,
    sourceTopicKey: TOPOLOGIEN_TOPIC_KEY,
    sourceSection: `${key}-classic`,
    conceptCluster: 'topologien.properties',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: `${topo.name}-Topologie`,
      name: topo.name,
      tagline: topo.tagline,
      description: topo.description,
      resilience: topo.resilience,
      cost: topo.cost,
      scalability: topo.scalability,
      useCases: topo.useCases,
      distractorDescriptions: topo.distractorDescriptions,
    },
    siblings: Object.keys(TOPOLOGY_DATA).filter((k) => k !== key).map((k) => `nb.topologien.${k}`),
    roleHints: ['technical'],
  })),
  {
    id: 'nb.topologien.resilienceCompare',
    topicKey: TOPOLOGIEN_TOPIC_KEY,
    sourceTopicKey: TOPOLOGIEN_TOPIC_KEY,
    sourceSection: 'intro-classic',
    conceptCluster: 'topologien.compare',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      compareOn: 'resilience',
      items: Object.values(TOPOLOGY_DATA).map((t) => ({ name: t.name, resilience: t.resilience })),
      description: 'Die fünf Grundtopologien unterscheiden sich deutlich in ihrer Ausfallsicherheit.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
  {
    id: 'nb.topologien.taglineMapping',
    topicKey: TOPOLOGIEN_TOPIC_KEY,
    sourceTopicKey: TOPOLOGIEN_TOPIC_KEY,
    sourceSection: 'intro-classic',
    conceptCluster: 'topologien.identification',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.MATCHING],
    data: {
      pairs: Object.entries(TOPOLOGY_DATA).map(([_, t]) => ({ key: t.name, value: t.tagline })),
      description: 'Jede Topologie hat eine charakteristische Struktur, die sich anhand eines kurzen Merksatzes erfassen lässt.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// fundamentals/kommunikation-uebertragung
// ---------------------------------------------------------------------------

const KOMMUNIKATION_ITEMS = [
  {
    id: 'nb.kommu.unicast',
    topicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceTopicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceSection: 'kommunikation-classic',
    conceptCluster: 'kommunikation.types',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Unicast',
      definition: 'Ein Sender kommuniziert mit genau einem Empfänger (1-zu-1).',
      description: 'Unicast ist die 1-zu-1-Kommunikation.',
      distractorDefinitions: [
        'Ein Sender sendet an alle Geräte im selben Netzwerksegment (1-zu-alle).',
        'Ein Sender sendet an eine ausgewählte Gruppe von Empfängern (1-zu-Gruppe).',
        'Ein Sender sendet an alle angeschlossenen Netzwerkknoten außer an sich selbst.',
      ],
    },
    siblings: ['nb.kommu.broadcast', 'nb.kommu.multicast'],
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.kommu.broadcast',
    topicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceTopicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceSection: 'kommunikation-classic',
    conceptCluster: 'kommunikation.types',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Broadcast',
      definition: 'Ein Sender sendet an alle Geräte im Netzwerk (1-zu-alle).',
      description: 'Broadcast sendet an alle Teilnehmer im Netzwerksegment.',
      distractorDefinitions: [
        'Ein Sender kommuniziert mit genau einem Empfänger (1-zu-1).',
        'Ein Sender sendet an eine ausgewählte Gruppe von Empfängern (1-zu-Gruppe).',
        'Ein Sender sendet an genau zwei Empfänger, die ein direktes Gespräch führen.',
      ],
    },
    siblings: ['nb.kommu.unicast', 'nb.kommu.multicast'],
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.kommu.multicast',
    topicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceTopicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceSection: 'kommunikation-classic',
    conceptCluster: 'kommunikation.types',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Multicast',
      definition: 'Ein Sender sendet an eine ausgewählte Gruppe von Empfängern (1-zu-Gruppe).',
      description: 'Multicast adressiert gezielt eine Gruppe, nicht alle und nicht nur einen.',
      distractorDefinitions: [
        'Ein Sender kommuniziert mit genau einem Empfänger (1-zu-1).',
        'Ein Sender sendet an alle Geräte im Netzwerk (1-zu-alle).',
        'Ein Sender sendet an alle Empfänger nacheinander, bis jeder einzelne erreicht ist.',
      ],
    },
    siblings: ['nb.kommu.unicast', 'nb.kommu.broadcast'],
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.kommu.operatingModes',
    topicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceTopicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceSection: 'betrieb-classic',
    conceptCluster: 'kommunikation.operatingModes',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      compareOn: 'description',
      items: [
        { name: 'Simplex', description: 'Übertragung nur in eine Richtung', example: 'Radio-Rundfunk' },
        { name: 'Halbduplex', description: 'Beide Seiten können senden und empfangen, aber nicht gleichzeitig', example: 'Walkie-Talkie' },
        { name: 'Vollduplex', description: 'Beide Seiten können gleichzeitig senden und empfangen', example: 'Telefonanruf, moderne Netzwerkkabel' },
      ],
      description: 'Simplex, Halbduplex und Vollduplex beschreiben, in welche Richtungen Daten gleichzeitig übertragen werden können.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
  {
    id: 'nb.kommu.mediaMapping',
    topicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceTopicKey: KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY,
    sourceSection: 'medien-classic',
    conceptCluster: 'kommunikation.media',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.MATCHING],
    data: {
      pairs: [
        { key: 'Kupferkabel', value: 'Elektrische Signale' },
        { key: 'Glasfaser', value: 'Lichtimpulse' },
        { key: 'Funk (z. B. WLAN)', value: 'Elektromagnetische Wellen' },
      ],
      description: 'Jedes Übertragungsmedium verwendet eine bestimmte Signalart.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// fundamentals/tcp-udp
// ---------------------------------------------------------------------------

const TCP_UDP_ITEMS = [
  {
    id: 'nb.tcpudp.tcp',
    topicKey: TCP_UDP_TOPIC_KEY,
    sourceTopicKey: TCP_UDP_TOPIC_KEY,
    sourceSection: 'tcp-classic',
    conceptCluster: 'tcpudp.protocols',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'TCP',
      definition: 'Transmission Control Protocol – verbindungsorientiert, zuverlässig, mit Reihenfolge- und Fehlerkontrolle.',
      description: 'TCP baut eine Verbindung auf, bestätigt jedes Segment und stellt die Reihenfolge sicher.',
      distractorDefinitions: [
        'User Datagram Protocol – verbindungslos, schnell, ohne Zustell- oder Reihenfolgegarantie.',
        'Internet Protocol – verantwortlich für die logische Adressierung und das Routing von Paketen.',
        'Hypertext Transfer Protocol – regelt den Austausch von Webseiten zwischen Browser und Server.',
      ],
    },
    siblings: ['nb.tcpudp.udp', 'nb.tcpudp.compare', 'nb.tcpudp.handshake'],
    roleHints: ['technical'],
  },
  {
    id: 'nb.tcpudp.udp',
    topicKey: TCP_UDP_TOPIC_KEY,
    sourceTopicKey: TCP_UDP_TOPIC_KEY,
    sourceSection: 'udp-classic',
    conceptCluster: 'tcpudp.protocols',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'UDP',
      definition: 'User Datagram Protocol – verbindungslos, schnell, ohne Zustell- oder Reihenfolgegarantie.',
      description: 'UDP sendet Daten einfach los, ohne Verbindungsaufbau, Bestätigung oder Reihenfolgegarantie.',
      distractorDefinitions: [
        'Transmission Control Protocol – verbindungsorientiert, zuverlässig, mit Reihenfolgekontrolle.',
        'Internet Protocol – verantwortlich für die logische Adressierung und das Routing von Paketen.',
        'Address Resolution Protocol – ermittelt die MAC-Adresse zu einer bekannten IP-Adresse.',
      ],
    },
    siblings: ['nb.tcpudp.tcp', 'nb.tcpudp.compare', 'nb.tcpudp.handshake'],
    roleHints: ['technical'],
  },
  {
    id: 'nb.tcpudp.compare',
    topicKey: TCP_UDP_TOPIC_KEY,
    sourceTopicKey: TCP_UDP_TOPIC_KEY,
    sourceSection: 'comparison-classic',
    conceptCluster: 'tcpudp.compare',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      compareOn: 'connection',
      items: [
        {
          name: 'TCP',
          connection: 'verbindungsorientiert',
          reliability: 'zuverlässig (ACK, Fehlerkontrolle, Flusskontrolle)',
          order: 'Reihenfolge garantiert',
          overhead: 'höher (mindestens 20 Byte Header)',
          speed: 'langsamer',
          useCases: 'Web, E-Mail, Dateiübertragung, SSH',
        },
        {
          name: 'UDP',
          connection: 'verbindungslos',
          reliability: 'keine Garantie',
          order: 'keine Reihenfolgegarantie',
          overhead: 'gering (8 Byte Header)',
          speed: 'schneller',
          useCases: 'DNS, VoIP, Streaming, Gaming, DHCP',
        },
      ],
      description: 'TCP und UDP stehen für Zuverlässigkeit versus Geschwindigkeit auf der Transportschicht.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
  {
    id: 'nb.tcpudp.handshake',
    topicKey: TCP_UDP_TOPIC_KEY,
    sourceTopicKey: TCP_UDP_TOPIC_KEY,
    sourceSection: 'handshake-classic',
    conceptCluster: 'tcpudp.handshake',
    type: KNOWLEDGE_TYPES.ORDER,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      steps: [
        { id: 'syn', label: 'SYN (Client → Server)' },
        { id: 'synack', label: 'SYN + ACK (Server → Client)' },
        { id: 'ack', label: 'ACK (Client → Server)' },
      ],
      description: 'TCP baut die Verbindung über den Three-Way Handshake auf: SYN → SYN-ACK → ACK.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// fundamentals/dns
// ---------------------------------------------------------------------------

const DNS_ITEMS = [
  {
    id: 'nb.dns.definition',
    topicKey: DNS_TOPIC_KEY,
    sourceTopicKey: DNS_TOPIC_KEY,
    sourceSection: 'was-classic',
    conceptCluster: 'dns.purpose',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'DNS',
      definition: 'Domain Name System – übersetzt Namen wie www.beispiel.de in IP-Adressen und umgekehrt (PTR).',
      description: 'DNS übersetzt für Menschen merkbare Namen in die IP-Adressen, die Rechner für die Kommunikation benötigen.',
      distractorDefinitions: [
        'Dynamic Host Configuration Protocol – vergibt IP-Adresse, Subnetzmaske, Gateway und DNS-Server automatisch an Clients.',
        'Hypertext Transfer Protocol – regelt den Abruf und die Übertragung von Webseiten.',
        'Simple Mail Transfer Protocol – überträgt E-Mails zwischen Mailservern im Internet.',
      ],
    },
    siblings: ['nb.dns.records', 'nb.dns.resolution'],
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.dns.records',
    topicKey: DNS_TOPIC_KEY,
    sourceTopicKey: DNS_TOPIC_KEY,
    sourceSection: 'records-classic',
    conceptCluster: 'dns.records',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.MATCHING],
    data: {
      pairs: [
        { key: 'A', value: 'Name → IPv4-Adresse' },
        { key: 'PTR', value: 'IP-Adresse → Name' },
        { key: 'CNAME', value: 'Alias-Name für einen anderen Namen' },
        { key: 'MX', value: 'Zuständiger Mailserver für eine Domain' },
      ],
      description: 'DNS-Eintragstypen haben klar unterschiedliche Aufgaben.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
  {
    id: 'nb.dns.resolution',
    topicKey: DNS_TOPIC_KEY,
    sourceTopicKey: DNS_TOPIC_KEY,
    sourceSection: 'ablauf-classic',
    conceptCluster: 'dns.resolution',
    type: KNOWLEDGE_TYPES.ORDER,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      steps: [
        { id: 'cache', label: 'Client prüft den eigenen DNS-Cache' },
        { id: 'server', label: 'Client fragt den konfigurierten DNS-Server' },
        { id: 'recursive', label: 'DNS-Server fragt notfalls rekursiv weiter' },
        { id: 'answer', label: 'Antwort wird an den Client zurückgegeben und zwischengespeichert' },
      ],
      description: 'Eine DNS-Namensauflösung folgt einem festen Ablauf: Cache → Server → Rekursion → Antwort.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// fundamentals/dhcp
// ---------------------------------------------------------------------------

const DHCP_ITEMS = [
  {
    id: 'nb.dhcp.definition',
    topicKey: DHCP_TOPIC_KEY,
    sourceTopicKey: DHCP_TOPIC_KEY,
    sourceSection: 'was-classic',
    conceptCluster: 'dhcp.purpose',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'DHCP',
      definition: 'Dynamic Host Configuration Protocol – vergibt IP-Adresse, Subnetzmaske, Gateway und DNS-Server automatisch an Clients.',
      description: 'DHCP vergibt IP-Adressen und weitere Netzwerkeinstellungen automatisch, statt jedes Gerät manuell zu konfigurieren.',
      distractorDefinitions: [
        'Domain Name System – übersetzt Namen wie www.beispiel.de in IP-Adressen und umgekehrt.',
        'Address Resolution Protocol – ermittelt die MAC-Adresse zu einer bekannten IP-Adresse.',
        'Network Address Translation – übersetzt private IP-Adressen in öffentliche für den Internetzugang.',
      ],
    },
    siblings: ['nb.dhcp.dora'],
    roleHints: ['technical', 'support'],
  },
  {
    id: 'nb.dhcp.dora',
    topicKey: DHCP_TOPIC_KEY,
    sourceTopicKey: DHCP_TOPIC_KEY,
    sourceSection: 'dora-classic',
    conceptCluster: 'dhcp.dora',
    type: KNOWLEDGE_TYPES.ORDER,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      steps: [
        { id: 'discover', label: 'Discover (Client sendet Broadcast)' },
        { id: 'offer', label: 'Offer (Server bietet IP-Konfiguration an)' },
        { id: 'request', label: 'Request (Client fordert Angebot an)' },
        { id: 'ack', label: 'Acknowledge (Server bestätigt Zuweisung)' },
      ],
      description: 'Der DHCP-Ablauf heißt DORA: Discover → Offer → Request → Acknowledge.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// fundamentals/routing
// ---------------------------------------------------------------------------

const ROUTING_ITEMS = [
  {
    id: 'nb.routing.definition',
    topicKey: ROUTING_TOPIC_KEY,
    sourceTopicKey: ROUTING_TOPIC_KEY,
    sourceSection: 'was-classic',
    conceptCluster: 'routing.purpose',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Routing',
      definition: 'Aufgabe, Datenpakete von einem Netzwerk in ein anderes weiterzuleiten.',
      description: 'Routing leitet Datenpakete über Netzgrenzen hinweg weiter; Switching reicht nur innerhalb eines Netzes.',
      distractorDefinitions: [
        'Switching – Weiterleitung von Datenpaketen innerhalb desselben lokalen Netzes anhand von MAC-Adressen.',
        'Network Address Translation – Übersetzung von privaten IP-Adressen in öffentliche für den Internetzugang.',
        'Bridging – Verbindung mehrerer Netzwerksegmente auf der Data-Link-Schicht.',
      ],
    },
    siblings: ['nb.routing.table', 'nb.routing.nextHop', 'nb.routing.defaultRoute', 'nb.routing.staticDynamic'],
    roleHints: ['technical'],
  },
  {
    id: 'nb.routing.table',
    topicKey: ROUTING_TOPIC_KEY,
    sourceTopicKey: ROUTING_TOPIC_KEY,
    sourceSection: 'tabelle-classic',
    conceptCluster: 'routing.table',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Routingtabelle',
      description: 'Jeder Router führt eine Routingtabelle mit Zielnetz, Next Hop, Ausgangsschnittstelle und Metrik.',
      distractorDescriptions: [
        'Eine Tabelle, die MAC-Adressen zu den Switch-Ports zuordnet, an denen die Geräte erreichbar sind.',
        'Eine Liste aller verbundenen Kabel und deren physischen Port-Bezeichnungen auf einem Router.',
        'Ein Protokoll, das automatisch alle erreichbaren Netze im Netzwerk bekannt macht.',
      ],
    },
    siblings: ['nb.routing.nextHop', 'nb.routing.defaultRoute', 'nb.routing.staticDynamic'],
    roleHints: ['technical'],
  },
  {
    id: 'nb.routing.nextHop',
    topicKey: ROUTING_TOPIC_KEY,
    sourceTopicKey: ROUTING_TOPIC_KEY,
    sourceSection: 'tabelle-classic',
    conceptCluster: 'routing.table',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Next Hop',
      description: 'Der Next Hop ist die IP-Adresse des nächsten Routers, an den ein Paket auf dem Weg zum Ziel weitergegeben wird.',
      distractorDescriptions: [
        'Die eigene IP-Adresse des Routers, über die das Paket das Gerät verlässt.',
        'Der Name der physischen Schnittstelle, an der das Paket empfangen wurde.',
        'Die MAC-Adresse des Zielgeräts im lokalen Netzwerksegment.',
      ],
    },
    siblings: ['nb.routing.table', 'nb.routing.defaultRoute', 'nb.routing.staticDynamic'],
    roleHints: ['technical'],
  },
  {
    id: 'nb.routing.defaultRoute',
    topicKey: ROUTING_TOPIC_KEY,
    sourceTopicKey: ROUTING_TOPIC_KEY,
    sourceSection: 'entscheidung-classic',
    conceptCluster: 'routing.table',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Standardroute',
      description: 'Die Standardroute 0.0.0.0/0 greift, wenn kein spezifischerer Eintrag in der Routingtabelle passt.',
      distractorDescriptions: [
        'Die Route mit der kürzesten Pfadlänge zu einem Zielnetz, unabhängig von der Präfixlänge.',
        'Eine statische Route, die immer dann verwendet wird, wenn mehrere Routen dasselbe Ziel erreichen.',
        'Der Eintrag, der angibt, welches Protokoll eine Route gelernt hat.',
      ],
    },
    siblings: ['nb.routing.table', 'nb.routing.nextHop', 'nb.routing.staticDynamic'],
    roleHints: ['technical'],
  },
  {
    id: 'nb.routing.staticDynamic',
    topicKey: ROUTING_TOPIC_KEY,
    sourceTopicKey: ROUTING_TOPIC_KEY,
    sourceSection: 'statisch-dynamisch-classic',
    conceptCluster: 'routing.compare',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      compareOn: 'config',
      items: [
        { name: 'Statisches Routing', config: 'vom Administrator manuell eingetragen', changes: 'muss bei Änderungen manuell angepasst werden', use: 'kleine, stabile Netze' },
        { name: 'Dynamisches Routing', config: 'Router tauschen Informationen automatisch per Routingprotokoll aus', changes: 'passt sich automatisch an', use: 'große oder sich häufig ändernde Netze' },
      ],
      description: 'Statisches und dynamisches Routing unterscheiden sich darin, wie Routing-Einträge in die Tabelle gelangen.',
    },
    siblings: [],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// fundamentals/vlsm
// ---------------------------------------------------------------------------

const VLSM_ITEMS = [
  {
    id: 'nb.vlsm.definition',
    topicKey: VLSM_TOPIC_KEY,
    sourceTopicKey: VLSM_TOPIC_KEY,
    sourceSection: 'vlsm-concept-classic',
    conceptCluster: 'vlsm.concept',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'VLSM',
      definition: 'Variable Length Subnet Masking – erlaubt unterschiedlich große Subnetze innerhalb desselben Netzes, um Adressen nicht zu verschwenden.',
      description: 'VLSM erlaubt unterschiedlich große Subnetze innerhalb desselben Netzes.',
      distractorDefinitions: [
        'Classful Subnetting – unterteilt Netze nur nach festen Klassen ohne variable Subnetzmasken.',
        'Supernetting – fasst mehrere kleine Netze zu einer größeren Route zusammen.',
        'Network Address Translation – Übersetzung von privaten in öffentliche IP-Adressen für das Routing ins Internet.',
      ],
    },
    siblings: ['nb.vlsm.rule'],
    roleHints: ['technical'],
  },
  {
    id: 'nb.vlsm.rule',
    topicKey: VLSM_TOPIC_KEY,
    sourceTopicKey: VLSM_TOPIC_KEY,
    sourceSection: 'vlsm-concept-classic',
    conceptCluster: 'vlsm.method',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'VLSM-Planung',
      description: 'Sortiere Subnetze nach Größe (größte zuerst), berechne den kleinstmöglichen passenden Präfix und reihe die Blöcke direkt aneinander.',
      distractorDescriptions: [
        'Teile das Netz zuerst in gleichgroße Blöcke auf und weise die Adressen nachträglich den Subnetzen zu.',
        'Verwende für alle Subnetze dieselbe Subnetzmaske, um die Planung einfach zu halten.',
        'Sortiere die Subnetze nach ihrer zukünftigen Wachstumsrate und reserviere doppelt so viele Adressen.',
      ],
    },
    siblings: ['nb.vlsm.definition'],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// fundamentals/supernetting
// ---------------------------------------------------------------------------

const SUPERNETTING_ITEMS = [
  {
    id: 'nb.supernetting.definition',
    topicKey: SUPERNETTING_TOPIC_KEY,
    sourceTopicKey: SUPERNETTING_TOPIC_KEY,
    sourceSection: 'supernetting-concept-classic',
    conceptCluster: 'supernetting.concept',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      term: 'Supernetting',
      definition: 'Zusammenfassung benachbarter Netze zu einer größeren Route, um Routing-Tabellen zu verkleinern.',
      description: 'Supernetting fasst viele kleine Netze zu einer größeren Route zusammen.',
      distractorDefinitions: [
        'Variable Length Subnet Masking – erlaubt unterschiedlich große Subnetze innerhalb desselben Netzes.',
        'Subnetting – Unterteilung eines Netzes in mehrere kleinere gleichgroße Teilnetze.',
        'Classful Addressing – Aufteilung von IP-Adressen in feste Netzklassen A, B und C.',
      ],
    },
    siblings: ['nb.supernetting.rule'],
    roleHints: ['technical'],
  },
  {
    id: 'nb.supernetting.rule',
    topicKey: SUPERNETTING_TOPIC_KEY,
    sourceTopicKey: SUPERNETTING_TOPIC_KEY,
    sourceSection: 'supernetting-intuitive',
    conceptCluster: 'supernetting.method',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      subject: 'Supernetting-Bedingungen',
      description: 'Die zusammenzufassenden Netze müssen lückenlos nebeneinanderliegen, dieselbe Größe haben und an Blockgrenzen ausgerichtet sein.',
      distractorDescriptions: [
        'Die Netze dürfen beliebige Lücken enthalten, solange sie im selben Adressraum liegen.',
        'Die Subnetzmasken der Einzelnetze müssen unterschiedlich lang sein.',
        'Supernetting erfordert, dass alle Netze dieselbe Default-Gateway-Adresse besitzen.',
      ],
    },
    siblings: ['nb.supernetting.definition'],
    roleHints: ['technical'],
  },
];

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export const NETWORK_BASICS_ITEMS = [
  ...GRUNDBEGRIFFE_ITEMS,
  ...TOPOLOGIE_ITEMS,
  ...KOMMUNIKATION_ITEMS,
  ...TCP_UDP_ITEMS,
  ...DNS_ITEMS,
  ...DHCP_ITEMS,
  ...ROUTING_ITEMS,
  ...VLSM_ITEMS,
  ...SUPERNETTING_ITEMS,
];
