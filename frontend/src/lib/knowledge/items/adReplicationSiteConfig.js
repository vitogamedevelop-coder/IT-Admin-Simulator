// =============================================================================
// Knowledge Items – Active Directory Thema 25
// Sites & Site Links praktisch konfigurieren
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const THEME_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-site-config');

function facetItem(id, cluster, type, fields) {
  return {
    id,
    topicKey: THEME_TOPIC_KEY,
    sourceTopicKey: THEME_TOPIC_KEY,
    sourceSection: 'ad-replication-site-config',
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

export const adReplicationSiteConfigKnowledgeItems = [
  facetItem('ad.replicationSiteConfig.siteConfigTool', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Active Directory-Standorte und -Dienste',
    definition: 'Das Verwaltungstool für die physische Replikations- und Standortstruktur: Sites, Subnets, Server-Standorte, Site Links und Inter-Site-Transports.',
    distractorDefinitions: [
      'Tool zur DNS-Zonenverwaltung.',
      'Tool zur Passwortrücksetzung.',
      'Tool zur Druckerwarteschlangenverwaltung.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.defaultSite', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Default-First-Site-Name',
    definition: 'Der initiale Standort nach einer AD-Installation. Darin landen DCs automatisch, bis eine saubere Standortstruktur angelegt und die DCs verschoben wurden.',
    distractorDefinitions: [
      'Ein fehlerhafter Zustand, der sofort behoben werden muss.',
      'Der Name, den jede Site tragen muss.',
      'Ein Site Link.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.createSite', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site anlegen',
    description: 'Eine Site legt man in Active Directory-Standorte und -Dienste unter Sites per Rechtsklick → Neuer Standort an und wählt einen passenden Site Link.',
    distractorDescriptions: [
      'Sites werden im DNS-Manager angelegt.',
      'Eine Site legt man unter Subnets an.',
      'Sites werden automatisch aus OUs erstellt.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.createSubnet', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Subnetz anlegen',
    description: 'Subnetze werden im Subnets-Container angelegt. Man gibt die CIDR-Notation ein, zum Beispiel 192.168.10.0/24, und ordnet das Subnetz einer Site zu.',
    distractorDescriptions: [
      'Subnetze werden unter Inter-Site Transports angelegt.',
      'Subnetze brauchen keine Site-Zuordnung.',
      'Subnetze legt man in ADUC an.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.assignSubnet', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Subnetz einer Site zuweisen',
    description: 'Beim Anlegen oder in den Eigenschaften eines Subnetzes wählt man die Site aus, der das IP-Netz zugeordnet werden soll.',
    distractorDescriptions: [
      'Subnetze werden automatisch anhand des DC-Namens zugeordnet.',
      'Subnetze werden Sites per DNS zugewiesen.',
      'Die Zuordnung geschieht im DHCP-Server.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.moveDc', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'DC in Site verschieben',
    description: 'Ein DC wird nicht automatisch in eine neu angelegte Site verschoben. Der Administrator wählt den DC unter Servers im Quellstandort, klickt auf Verschieben und wählt die Ziel-Site.',
    distractorDescriptions: [
      'DCs wandern automatisch, wenn eine passende Site existiert.',
      'DCs verschiebt man in ADUC.',
      'DCs müssen neu installiert werden.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.defaultIpSiteLink', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'DEFAULTIPSITELINK',
    definition: 'Der standardmäßig vorhandene Site Link nach der AD-Installation. Er verknüpft initial alle Sites und kann angepasst werden.',
    distractorDefinitions: [
      'Ein spezieller Subnetz-Container.',
      'Ein Bridgehead-Server.',
      'Ein automatisch erstelltes Subnetz.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.createSiteLink', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site Link anlegen',
    description: 'Site Links legt man unter Inter-Site Transports → IP über Neue Standortverknüpfung an. Man gibt einen sprechenden Namen an und fügt die beteiligten Sites hinzu.',
    distractorDescriptions: [
      'Site Links liegen unter Sites.',
      'Site Links werden im DNS-Manager erstellt.',
      'Site Links erzeugt der KCC.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.siteLinkMembership', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Site-Link-Mitgliedschaft',
    description: 'Ein Site Link muss die Sites enthalten, die er verbinden soll. Erst dann besteht der logische Pfad für die Intersite-Replikation.',
    distractorDescriptions: [
      'Site Links verbinden automatisch alle Sites.',
      'Site Links benötigen keine Mitgliedschaft.',
      'Site Link-Mitgliedschaften legt der Client fest.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.configureCost', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Cost setzen',
    description: 'Cost wird in den Eigenschaften eines Site Links gesetzt. Niedrigere Werte bevorzugen den Pfad gegenüber anderen möglichen Wegen.',
    distractorDescriptions: [
      'Cost wird in den Eigenschaften des Subnetzes gesetzt.',
      'Höhere Cost bevorzugen den Pfad.',
      'Cost ist eine monatliche Gebühr in Euro.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.configureInterval', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Replikationsintervall setzen',
    description: 'Das Intervall steuert die Häufigkeit der Intersite-Replikation. Ein kürzeres Intervall führt zu aktuelleren Daten, aber mehr Verkehr.',
    distractorDescriptions: [
      'Das Intervall steuert erlaubte Zeitfenster.',
      'Ein größeres Intervall führt zu aktuelleren Daten.',
      'Das Intervall legt die Anzahl der DCs fest.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.configureSchedule', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Replikationszeitplan setzen',
    description: 'Schedule legt erlaubte Replikationszeiträume fest. Damit kann der Admin steuern, wann über den Site Link repliziert werden darf, zum Beispiel außerhalb der Geschäftszeiten.',
    distractorDescriptions: [
      'Schedule steuert die Häufigkeit der Replikation.',
      'Schedule legt die DC-Namen fest.',
      'Schedule ist dasselbe wie das Replikationsintervall.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.preferredBridgehead', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Preferred Bridgehead',
    description: 'Preferred Bridgehead ist eine optionale administrative Festlegung eines DCs als bevorzugter Bridgehead für einen Transport. AD wählt Bridgeheads sonst automatisch; manuell sollte man sie nur bewusst und mit Grund setzen.',
    distractorDescriptions: [
      'Preferred Bridgehead ist zwingend für jede Site nötig.',
      'Preferred Bridgehead ersetzt den KCC.',
      'Preferred Bridgehead wird auf dem Client konfiguriert.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.verifySiteConfig', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Verifikation',
    description: 'Nach der Konfiguration prüft man: Site existiert, Subnetz zeigt auf richtige Site, DC liegt in richtiger Site, Site Link verbindet die gewünschten Sites, Cost/Interval/Schedule sind korrekt.',
    distractorDescriptions: [
      'Verifikation braucht man nicht, AD macht alles automatisch.',
      'Verifikation prüft nur, ob der Name der Site schön ist.',
      'Verifikation findet im DNS-Manager statt.',
    ],
  }),
  facetItem('ad.replicationSiteConfig.siteConfigTroubleshooting', 'ad.replicationSiteConfig', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Troubleshooting Site-Konfiguration',
    description: 'Falscher Standort → Subnetzzuordnung prüfen. DC im falschen Standort → DC verschieben. Fehlende Replikation zwischen Sites → Site-Link-Mitgliedschaft prüfen. Ungewollter Pfad → Costs prüfen. Zeitfenster nicht eingehalten → Schedule und Interval prüfen.',
    distractorDescriptions: [
      'Alle Probleme lösen sich durch Neustart des KCC.',
      'Für falscher Standort ist immer der DNS-Server schuld.',
      'Site Links müssen nie verifiziert werden.',
    ],
  }),
];
