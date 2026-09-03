// =============================================================================
// Knowledge Items – Active Directory Thema 24
// KCC, Replikationstopologie & Site Links
// Source: frontend/src/lib/academyLessons/adReplicationTopology.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const THEME_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-topology');

function facetItem(id, cluster, type, fields) {
  return {
    id,
    topicKey: THEME_TOPIC_KEY,
    sourceTopicKey: THEME_TOPIC_KEY,
    sourceSection: 'ad-replication-topology',
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

export const adReplicationTopologyKnowledgeItems = [
  facetItem('ad.replicationTopology.kcc', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'KCC',
    definition: 'Der Knowledge Consistency Checker (KCC) berechnet und pflegt die Active-Directory-Replikationstopologie. Er läuft auf Domain Controllern und erzeugt bzw. aktualisiert Verbindungsobjekte.',
    distractorDefinitions: [
      'Der KCC repliziert selbst alle AD-Daten.',
      'Der KCC verwaltet DNS-Zonen.',
      'Der KCC legt Benutzerkonten an.',
    ],
  }),
  facetItem('ad.replicationTopology.kccPurpose', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Aufgabe des KCC',
    description: 'Der Administrator beschreibt Rahmenbedingungen wie Sites, Subnetze, Site Links, Costs und Schedules. Der KCC erstellt daraus geeignete Replikationsverbindungen.',
    distractorDescriptions: [
      'Der KCC legt die AD-Datenbank fest.',
      'Der KCC entscheidet über Benutzerberechtigungen.',
      'Der KCC ersetzt den DNS-Server.',
    ],
  }),
  facetItem('ad.replicationTopology.kccNotReplicationEngine', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'KCC repliziert nicht selbst',
    description: 'Der KCC plant die Topologie und erzeugt Connection Objects. Die eigentliche Replikation nutzt diese Verbindungen, um Daten auszutauschen.',
    distractorDescriptions: [
      'Der KCC kopiert selbst alle Verzeichnisdaten.',
      'Der KCC ist der einzige DC, der repliziert.',
      'Der KCC ersetzt den Replikationsmechanismus vollständig.',
    ],
  }),
  facetItem('ad.replicationTopology.kccReacts', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'KCC reagiert auf Änderungen',
    description: 'Der KCC bewertet die Topologie bei relevanten Änderungen wie neuen/entfernten DCs oder geänderten Site-Strukturen regelmäßig neu und passt sie an.',
    distractorDescriptions: [
      'Der KCC berechnet die Topologie nur einmalig.',
      'Der KCC reagiert nicht auf Infrastrukturänderungen.',
      'Der KCC ändert nie Verbindungsobjekte.',
    ],
  }),
  facetItem('ad.replicationTopology.topology', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Replikationstopologie',
    definition: 'Die Replikationstopologie ist die logische Struktur der Replikationsbeziehungen zwischen Domain Controllern. Sie bestimmt, wer mit wem repliziert.',
    distractorDefinitions: [
      'Die Replikationstopologie beschreibt den physischen Standort der Serverräume.',
      'Die Replikationstopologie ist der DNS-Namensraum.',
      'Die Replikationstopologie legt Gruppenrichtlinien-Vererbungen fest.',
    ],
  }),
  facetItem('ad.replicationTopology.storeForward', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Store-and-Forward über die Topologie',
    description: 'Änderungen können über die vom KCC berechnete Topologie weitergegeben werden, sodass nicht jeder DC direkt mit jedem anderen kommunizieren muss.',
    distractorDescriptions: [
      'Store-and-Forward erfordert Direktverbindungen zwischen allen DCs.',
      'Store-and-Forward bedeutet, dass nur der PDC repliziert.',
      'Store-and-Forward funktioniert ohne Topologie.',
    ],
  }),
  facetItem('ad.replicationTopology.siteLink', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Site Link',
    definition: 'Ein Site Link ist eine logische Verbindung zwischen zwei oder mehr AD Sites. Er beschreibt einen möglichen Replikationsweg auf Site-Ebene, nicht eine konkrete DC-zu-DC-Verbindung.',
    distractorDefinitions: [
      'Ein Site Link ist eine konkrete DC-Replikationsverbindung.',
      'Ein Site Link verbindet einzelne Computerkonten.',
      'Ein Site Link ist ein DNS-Eintrag.',
    ],
  }),
  facetItem('ad.replicationTopology.connectionObject', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Connection Object',
    definition: 'Ein Connection Object ist eine konkrete Replikationsverbindung zwischen zwei Domain Controllern. Der KCC erzeugt diese Objekte aus der Topologieberechnung.',
    distractorDefinitions: [
      'Ein Connection Object ist eine logische Site-zu-Site-Verbindung.',
      'Ein Connection Object wird vom Administrator pro Site manuell erstellt.',
      'Ein Connection Object ist ein Subnetz.',
    ],
  }),
  facetItem('ad.replicationTopology.siteLinkVsConnection', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site Link vs Connection Object',
    description: 'Ein Site Link liegt auf Site-Ebene und beschreibt einen möglichen logischen Pfad. Ein Connection Object liegt auf DC-Ebene und ist die konkrete Verbindung, über die repliziert wird.',
    distractorDescriptions: [
      'Site Link und Connection Object sind identisch.',
      'Ein Site Link verbindet DCs direkt.',
      'Ein Connection Object wird vom Admin pro Site erstellt.',
    ],
  }),
  facetItem('ad.replicationTopology.cost', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Site Link Cost',
    definition: 'Site Link Cost ist ein administrativer Gewichtungswert für einen logischen Replikationspfad. Niedrigere Gesamtkosten führen zu bevorzugten Pfaden.',
    distractorDefinitions: [
      'Cost sind die monatlichen Leitungskosten in Euro.',
      'Cost wird automatisch aus der echten Bandbreite berechnet.',
      'Cost ist die Anzahl der DCs in einer Site.',
    ],
  }),
  facetItem('ad.replicationTopology.costPath', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Kumulierte Cost-Pfade',
    description: 'Wenn mehrere Pfade zwischen Sites existieren, addieren sich die Costs entlang eines Pfades. Der KCC bevorzugt den Pfad mit den niedrigsten Gesamtkosten.',
    distractorDescriptions: [
      'Der KCC bevorzugt immer den direkten Pfad.',
      'Höhere Costs werden bevorzugt.',
      'Costs haben keinen Einfluss auf die Pfadwahl.',
    ],
  }),
  facetItem('ad.replicationTopology.costNotBandwidth', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Cost ≠ automatische Bandbreite',
    description: 'AD misst nicht automatisch die echte Bandbreite und rechnet sie immer in Cost um. Cost wird administrativ gesetzt; Bandbreite kann eine Grundlage für die Wahl sein.',
    distractorDescriptions: [
      'AD misst die Bandbreite und berechnet daraus automatisch Cost.',
      'Cost ist gleich der Datenübertragungsrate.',
      'Cost wird vom Client ermittelt.',
    ],
  }),
  facetItem('ad.replicationTopology.schedule', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Site Link Schedule',
    definition: 'Ein Site Link Schedule steuert, zu welchen Zeiten über den Site Link repliziert werden darf. Damit kann das WAN entlastet und Replikation in günstige Zeitfenster gelegt werden.',
    distractorDefinitions: [
      'Ein Schedule legt die AD-Datenbankgröße fest.',
      'Ein Schedule erstellt neue DCs.',
      'Ein Schedule ist ein DNS-Eintrag.',
    ],
  }),
  facetItem('ad.replicationTopology.interval', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Replikationsintervall',
    definition: 'Das Replikationsintervall beeinflusst die Häufigkeit der Intersite-Replikation. Kürzere Intervalle führen zu aktuelleren Daten, aber mehr Verkehr; längere Intervalle senken den Verkehr, verzögern aber die Aktualisierung.',
    distractorDefinitions: [
      'Das Intervall legt die Anzahl der DCs pro Site fest.',
      'Das Intervall hat keinen Einfluss auf Verkehr oder Aktualität.',
      'Das Intervall wird vom KCC aus der Bandbreite berechnet.',
    ],
  }),
  facetItem('ad.replicationTopology.tradeoff', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Aktualität vs. Bandbreite',
    description: 'Der Administrator entscheidet über Cost, Schedule und Interval. Der KCC baut daraus die Topologie. Ziel ist der Abwägung von Aktualität gegen Bandbreite und Netzwerkkosten.',
    distractorDescriptions: [
      'Der KCC entscheidet allein über Cost und Intervalle.',
      'Aktualität und Bandbreite stehen nie im Konflikt.',
      'Der Client bestimmt den Zeitplan.',
    ],
  }),
  facetItem('ad.replicationTopology.bridgehead', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Bridgehead Server',
    definition: 'Ein Bridgehead Server ist ein Domain Controller, der die Intersite-Replikation für eine Site übernimmt. Er tauscht Änderungen mit anderen Sites aus und verteilt sie lokal weiter.',
    distractorDefinitions: [
      'Ein Bridgehead Server ersetzt alle anderen DCs in einer Site.',
      'Ein Bridgehead Server erstellt Subnetze.',
      'Ein Bridgehead Server verwaltet DNS-Namensräume.',
    ],
  }),
  facetItem('ad.replicationTopology.bridgeheadAutomatic', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Automatische Bridgehead-Auswahl',
    description: 'Der KCC kann Bridgehead Server automatisch auswählen. Das ist das bevorzugte Standardmodell. Manuelle Auswahl ist möglich, kann aber Flexibilität und Redundanz einschränken.',
    distractorDescriptions: [
      'Bridgehead Server müssen immer manuell festgelegt werden.',
      'Bridgehead Server können nicht automatisch gewählt werden.',
      'Nur RODCs dürfen Bridgehead sein.',
    ],
  }),
  facetItem('ad.replicationTopology.siteLinkBridge', 'ad.replicationTopology', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Site Link Bridge',
    definition: 'Eine Site Link Bridge verbindet mehrere Site Links konzeptionell zu einem transitiven Replikationspfad, sodass zum Beispiel Site A über Site B mit Site C replizieren kann.',
    distractorDefinitions: [
      'Eine Site Link Bridge ist eine direkte Verbindung zwischen zwei DCs.',
      'Eine Site Link Bridge ist identisch mit einem Site Link.',
      'Eine Site Link Bridge ist eine physische WAN-Leitung.',
    ],
  }),
  facetItem('ad.replicationTopology.siteLinkTransitivity', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site-Link-Transitivität',
    description: 'Site-Link-Transitivität kann standardmäßig breit ermöglicht sein, sodass transitive Pfade über mehrere Site Links entstehen können. Konkrete Edge Cases folgen später.',
    distractorDescriptions: [
      'Transitivität ist immer deaktiviert.',
      'Transitivität ersetzt alle Site Links.',
      'Transitivität hat keine Auswirkung auf Replikationspfade.',
    ],
  }),
  facetItem('ad.replicationTopology.noRigidClaims', 'ad.replicationTopology', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Keine starren Dogmen',
    description: 'Dieses Thema lehrt keine festen Prüfintervalle, starre Hop-Zahlen oder „immer Ring“-Topologien. Fokus liegt auf Rolle, Abgrenzung, Pfadlogik und Designentscheidung.',
    distractorDescriptions: [
      'Der KCC erzeugt immer exakt eine bidirektionale Ring-Topologie.',
      'KCC prüft alle 15 Minuten die Topologie.',
      'Bridgehead-Ausfall führt immer zum Totalausfall einer Site.',
    ],
  }),
];
