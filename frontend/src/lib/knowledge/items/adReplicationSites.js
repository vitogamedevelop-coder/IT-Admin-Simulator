// =============================================================================
// Knowledge Items – Active Directory Thema 23
// Sites, Subnetze & Intra-/Intersite-Replikation
// Source: frontend/src/lib/academyLessons/adReplicationSites.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const THEME_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-sites');

function facetItem(id, cluster, type, fields) {
  return {
    id,
    topicKey: THEME_TOPIC_KEY,
    sourceTopicKey: THEME_TOPIC_KEY,
    sourceSection: 'ad-replication-sites',
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

export const adReplicationSitesKnowledgeItems = [
  facetItem('ad.replicationSites.siteDefinition', 'ad.replicationSites', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'AD Site',
    definition: 'Eine AD Site beschreibt einen Bereich des physischen Netzwerks, dessen Systeme über schnelle, zuverlässige Netzwerkverbindungen miteinander verbunden sind.',
    distractorDefinitions: [
      'Eine AD Site ist eine Unterdomäne im DNS-Namensraum.',
      'Eine AD Site ist eine OU für Benutzer eines Standorts.',
      'Eine AD Site definiert die logische Verwaltungsstruktur einer Domäne.',
    ],
  }),
  facetItem('ad.replicationSites.physicalTopology', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Physische Netzstruktur',
    description: 'Eine Site repräsentiert eine physische Netzwerkstruktur wie Gebäude, Campus oder lokales Netzsegment. Entscheidend ist die Konnektivität, nicht nur der geografische Ort.',
    distractorDescriptions: [
      'Eine Site ist ausschließlich ein geografischer Ort.',
      'Eine Site beschreibt die logische Verwaltungsebene.',
      'Eine Site ersetzt die Domain.',
    ],
  }),
  facetItem('ad.replicationSites.siteVsDomain', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site vs. Domain',
    description: 'Eine Domain ist eine logische Verwaltungs- und Identitätsstruktur, eine Site eine physische Netzwerkstruktur. Eine Domain kann mehrere Sites umfassen, eine Site kann Systeme aus mehreren Domains enthalten.',
    distractorDescriptions: [
      'Site und Domain sind identisch.',
      'Jede Site benötigt eine eigene Domain.',
      'Eine Domain kann nur maximal eine Site enthalten.',
    ],
  }),
  facetItem('ad.replicationSites.siteVsOu', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site vs. OU',
    description: 'Eine OU ordnet AD-Objekte logisch/administrativ. Eine Site ordnet Netzwerkstandorte und Subnetze. Benutzer werden nicht wie in eine OU in eine Site verschoben.',
    distractorDescriptions: [
      'Eine Site ist eine spezielle OU mit geografischer Sortierung.',
      'Ein Benutzer wird per Drag-and-Drop in eine Site verschoben.',
      'OUs und Sites haben denselben Zweck.',
    ],
  }),
  facetItem('ad.replicationSites.siteVsNamespace', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site vs. Namensraum',
    description: 'Sites sind nicht Teil des AD-DNS-Namensraums. Eine Site namens Lechfeld in der Domäne its.bw erzeugt nicht automatisch den DNS-Namen lechfeld.its.bw.',
    distractorDescriptions: [
      'Jede Site erscheint automatisch als Subdomäne im DNS.',
      'Sites bilden den DNS-Namensraum.',
      'Sites und DNS-Zonen sind identisch.',
    ],
  }),
  facetItem('ad.replicationSites.subnet', 'ad.replicationSites', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Subnetz',
    definition: 'Ein Subnetz ist ein IP-Netzwerkbereich. Eine Site enthält oder repräsentiert typischerweise ein oder mehrere Subnetze, um Clients und DCs einer Site zuzuordnen.',
    distractorDefinitions: [
      'Ein Subnetz ist eine logische Verwaltungseinheit wie eine OU.',
      'Ein Subnetz ersetzt eine Domain.',
      'Ein Subnetz ist ein DNS-Eintrag.',
    ],
  }),
  facetItem('ad.replicationSites.subnetToSite', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Subnetz → Site',
    description: 'Die IP-Adresse eines Clients führt zu einem passenden Subnetz. Das Subnetz ist einer Site zugeordnet, sodass AD bevorzugt passende lokale DCs und Dienste finden kann.',
    distractorDescriptions: [
      'Die Site-Zuordnung erfolgt über den Computernamen.',
      'Subnetze haben keine Bedeutung für die Site-Zuordnung.',
      'Die OU-Zugehörigkeit bestimmt die Site.',
    ],
  }),
  facetItem('ad.replicationSites.dcSelection', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Lokale DC-Auswahl',
    description: 'AD nutzt Site- und Subnetzinformationen, um Clients bevorzugt lokale Domain Controller zuzuweisen. Bei Bedarf können auch andere DCs genutzt werden; es handelt sich um eine Bevorzugung, keine absolute Garantie.',
    distractorDescriptions: [
      'Clients verwenden immer nur den nächstgelegenen DC, ohne Ausnahme.',
      'Die DC-Auswahl erfolgt ausschließlich nach Geschwindigkeit des Benutzernamens.',
      'Sites haben keinen Einfluss auf die DC-Auswahl.',
    ],
  }),
  facetItem('ad.replicationSites.authentication', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Authentifizierung und Site',
    description: 'Lokale DCs reduzieren Latenz, WAN-Verkehr und beschleunigen die Authentifizierung. Außerdem ermöglichen sie eine bessere Ausfalls- und Standortsteuerung.',
    distractorDescriptions: [
      'Lokale DCs erhöhen den WAN-Verkehr.',
      'Lokale DCs verlangsamen die Authentifizierung.',
      'Sites haben keine Auswirkung auf Authentifizierung.',
    ],
  }),
  facetItem('ad.replicationSites.siteAwareServices', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site-aware Services',
    description: 'Site-aware Services nutzen Site- und Subnetzinformationen, um bevorzugt nahegelegene Dienstinstanzen auszuwählen.',
    distractorDescriptions: [
      'Site-aware Services ignorieren die physische Topologie.',
      'Site-aware Services ersetzen DNS vollständig.',
      'Site-aware Services konfigurieren automatisch Subnetze.',
    ],
  }),
  facetItem('ad.replicationSites.intrasite', 'ad.replicationSites', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Intrasite-Replikation',
    definition: 'Intrasite-Replikation findet zwischen DCs innerhalb derselben Site statt und nutzt typischerweise schnelle LAN-Verbindungen, um Änderungen zeitnah zu verteilen.',
    distractorDefinitions: [
      'Intrasite-Replikation läuft zwischen verschiedenen Sites.',
      'Intrasite-Replikation überträgt immer die gesamte NTDS.DIT.',
      'Intrasite-Replikation findet nur zwischen RODCs statt.',
    ],
  }),
  facetItem('ad.replicationSites.intersite', 'ad.replicationSites', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Intersite-Replikation',
    definition: 'Intersite-Replikation findet zwischen DCs unterschiedlicher Sites statt, typischerweise über WAN. Sie wird stärker geplant und auf Bandbreite/Latenz optimiert.',
    distractorDefinitions: [
      'Intersite-Replikation findet immer innerhalb eines LANs statt.',
      'Intersite-Replikation ist langsamer, weil AD technisch schlechter repliziert.',
      'Intersite-Replikation ignoriert Sites vollständig.',
    ],
  }),
  facetItem('ad.replicationSites.lanWan', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'LAN vs. WAN',
    description: 'Intrasite-Replikation nutzt typischerweise schnelles LAN und priorisiert Aktualität. Intersite-Replikation berücksichtigt WAN-Eigenschaften wie höhere Latenz, geringere Bandbreite und höhere Kosten.',
    distractorDescriptions: [
      'WAN ist immer schneller als LAN.',
      'Intrasite-Replikation wird stärker bandbreitenoptimiert als Intersite.',
      'Sites sind nur bei WLAN relevant.',
    ],
  }),
  facetItem('ad.replicationSites.bandwidthTradeoff', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Aktualität vs. Bandbreite',
    description: 'AD wägt bei der Replikation Aktualität gegen verfügbare Bandbreite und Netzwerkkosten ab. Im LAN steht Aktualität im Vordergrund, im WAN spielt Bandbreite eine größere Rolle.',
    distractorDescriptions: [
      'AD repliziert immer sofort alles, unabhängig vom Netz.',
      'Bandbreite spielt bei Replikation keine Rolle.',
      'Intersite-Replikation priorisiert immer maximale Aktualität.',
    ],
  }),
  facetItem('ad.replicationSites.bridgeheadBasic', 'ad.replicationSites', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Bridgehead Server',
    definition: 'Ein Bridgehead Server ist ein Domain Controller, der als Replikations-Ansprechpartner zwischen Sites dient. Er empfängt standortübergreifende Änderungen und verteilt sie lokal innerhalb seiner Site.',
    distractorDefinitions: [
      'Ein Bridgehead Server ersetzt alle anderen DCs in einer Site.',
      'Ein Bridgehead Server erstellt neue Subnetze.',
      'Ein Bridgehead Server verwaltet DNS-Namensräume.',
    ],
  }),
  facetItem('ad.replicationSites.noDeepConfig', 'ad.replicationSites', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Keine KCC/Site-Link-Details',
    description: 'Dieses Thema behandelt nur die konzeptionellen Grundlagen von Sites, Subnetzen und Intra-/Intersite-Replikation. KCC, Site Links, Zeitpläne, manuelle Bridgehead-Konfiguration und Active Directory Sites and Services folgen in späteren Themen.',
    distractorDescriptions: [
      'KCC und Site Links werden in diesem Thema detailliert konfiguriert.',
      'Bridgehead-Server werden hier manuell festgelegt.',
      'Replikationszeitpläne werden in diesem Thema erstellt.',
    ],
  }),
];
