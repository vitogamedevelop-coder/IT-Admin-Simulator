// =============================================================================
// Knowledge Items – Active Directory Thema 21
// FSMO-Rollen anzeigen & verschieben
// Source: frontend/src/lib/academyLessons/adFsmoTransfer.js
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const THEME_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-fsmo-transfer');

function facetItem(id, cluster, type, fields) {
  return {
    id,
    topicKey: THEME_TOPIC_KEY,
    sourceTopicKey: THEME_TOPIC_KEY,
    sourceSection: 'fsmo-transfer-practice',
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

export const adFsmoTransferKnowledgeItems = [
  facetItem('ad.fsmo.transfer.definition', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'FSMO-Transfer',
    definition: 'Ein geplantes Verschieben einer FSMO-Rolle von einem erreichbaren Rolleninhaber auf einen Ziel-DC. Transfer setzt voraus, dass sowohl der alte als auch der neue DC verfügbar sind.',
    distractorDefinitions: [
      'Ein FSMO-Transfer funktioniert auch, wenn der alte Rolleninhaber offline ist.',
      'Ein FSMO-Transfer löscht den alten DC.',
      'Ein FSMO-Transfer ändert das Active-Directory-Schema.',
    ],
  }),
  facetItem('ad.fsmo.transferVsSeize', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Transfer vs. Seize',
    description: 'Transfer ist die geplante Rollenübertragung bei erreichbarem alten DC. Seize ist die erzwungene Übernahme, typischerweise wenn der bisherige Rolleninhaber nicht mehr verfügbar ist.',
    distractorDescriptions: [
      'Transfer und Seize sind identisch.',
      'Seize setzt einen erreichbaren alten DC voraus.',
      'Transfer ist ein Notfallverfahren.',
    ],
  }),
  facetItem('ad.fsmo.transfer.secondDc', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Voraussetzung zweiter DC',
    description: 'Um eine FSMO-Rolle sinnvoll verschieben zu können, muss ein geeigneter Ziel-DC existieren und erreichbar sein.',
    distractorDescriptions: [
      'Ein Transfer ist auch ohne Ziel-DC möglich.',
      'Der Ziel-DC darf kein Global Catalog sein.',
      'Ein zweiter DC ist nur für Seize nötig.',
    ],
  }),
  facetItem('ad.fsmo.transfer.currentOwner', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Aktuellen Rolleninhaber ermitteln',
    description: 'Vor einem Transfer muss bekannt sein, welcher DC welche Rolle aktuell hält. Dazu kann man die grafische Konsole oder den Befehl netdom query fsmo verwenden.',
    distractorDescriptions: [
      'Den aktuellen Inhaber muss man nicht kennen, bevor man transferiert.',
      'netdom query fsmo löst den Transfer aus.',
      'Den Rolleninhaber ermittelt man nur über die Registry.',
    ],
  }),
  facetItem('ad.fsmo.transfer.query', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'netdom query fsmo',
    description: 'Der Befehl netdom query fsmo zeigt die aktuellen Inhaber aller fünf FSMO-Rollen an. Er dient der Übersicht und der Verifikation nach einem Transfer.',
    distractorDescriptions: [
      'netdom query fsmo überträgt FSMO-Rollen.',
      'netdom query fsmo registriert das Schema Snap-In.',
      'netdom query fsmo zeigt nur den Schema Master an.',
    ],
  }),
  facetItem('ad.fsmo.transfer.targetDc', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Ziel-DC auswählen',
    description: 'Bevor eine FSMO-Rolle übertragen wird, muss der Ziel-DC als Verwaltungsziel ausgewählt werden, beispielsweise über „Domänencontroller ändern".',
    distractorDescriptions: [
      'Der Ziel-DC wird automatisch nach dem Transfer ausgewählt.',
      'Der Ziel-DC muss derselbe wie der alte DC sein.',
      'Der Ziel-DC spielt nur bei Schema Master eine Rolle.',
    ],
  }),
  facetItem('ad.fsmo.transfer.domainRoleGui', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Domänenweite Rollen in ADUC',
    description: 'RID Master, PDC Emulator und Infrastructure Master werden in Active Directory-Benutzer und -Computer verwaltet. Man erreicht sie über Rechtsklick auf die Domäne → Betriebsmaster.',
    distractorDescriptions: [
      'Domänenweite Rollen werden in AD-Domänen und -Vertrauensstellungen verwaltet.',
      'Domänenweite Rollen findet man im DNS-Manager.',
      'Domänenweite Rollen werden im Schema Snap-In verwaltet.',
    ],
  }),
  facetItem('ad.fsmo.transfer.changeButton', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Rolle übertragen',
    description: 'Im Betriebsmaster-Dialog wird die Übertragung mit „Ändern" ausgelöst und bestätigt. Anschließend sollte der Dialog den neuen Inhaber anzeigen.',
    distractorDescriptions: [
      'Die Übertragung startet man mit „Domänencontroller ändern".',
      'Die Übertragung startet man mit „Aktualisieren".',
      'Die Übertragung startet man mit „Neue Rolle".',
    ],
  }),
  facetItem('ad.fsmo.transfer.verifyTransfer', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Transfer verifizieren',
    description: 'Nach einem Transfer sollte das Ergebnis überprüft werden, idealerweise sowohl in der grafischen Ansicht als auch mit netdom query fsmo.',
    distractorDescriptions: [
      'Eine Verifikation ist nicht nötig, wenn der Dialog keinen Fehler zeigt.',
      'Zur Verifikation löscht man den alten DC.',
      'Zur Verifikation startet man gpupdate /force.',
    ],
  }),
  facetItem('ad.fsmo.transfer.domainNamingTool', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Domain Naming Master Tool',
    description: 'Der Domain Naming Master wird in Active Directory-Domänen und -Vertrauensstellungen verwaltet, nicht in ADUC.',
    distractorDescriptions: [
      'Domain Naming Master wird in ADUC verwaltet.',
      'Domain Naming Master wird im Schema Snap-In verwaltet.',
      'Domain Naming Master wird im DNS-Manager verwaltet.',
    ],
  }),
  facetItem('ad.fsmo.transfer.schemaTool', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Schema Master Tool',
    description: 'Der Schema Master wird über die MMC mit dem Active Directory-Schema Snap-In verwaltet.',
    distractorDescriptions: [
      'Schema Master wird in ADUC verwaltet.',
      'Schema Master wird in AD-Domänen und -Vertrauensstellungen verwaltet.',
      'Schema Master wird im DNS-Manager verwaltet.',
    ],
  }),
  facetItem('ad.fsmo.transfer.schemaRegistration', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Schema Snap-In registrieren',
    description: 'Im Quell-/Laborszenario wird das Active Directory-Schema Snap-In mit regsvr32 schmmgmt.dll für die MMC verfügbar gemacht.',
    distractorDescriptions: [
      'regsvr32 schmmgmt.dll löst einen FSMO-Transfer aus.',
      'regsvr32 schmmgmt.dll zeigt FSMO-Rollen an.',
      'regsvr32 schmmgmt.dll ist nur für den Domain Naming Master nötig.',
    ],
  }),
  facetItem('ad.fsmo.transfer.roleToolMapping', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Tool-Mapping',
    description: 'RID Master, PDC Emulator und Infrastructure Master werden in ADUC verwaltet; Domain Naming Master in AD-Domänen und -Vertrauensstellungen; Schema Master in der MMC mit dem Active Directory-Schema Snap-In.',
    distractorDescriptions: [
      'Alle FSMO-Rollen werden in ADUC verwaltet.',
      'Schema Master wird in ADUC und Domain Naming Master im Schema Snap-In verwaltet.',
      'Alle FSMO-Rollen werden mit netdom query fsmo verwaltet.',
    ],
  }),
  facetItem('ad.fsmo.transfer.noSeize', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Kein Seize in diesem Szenario',
    description: 'Wenn der bisherige Rolleninhaber nicht erreichbar ist, ist kein normaler Transfer möglich. Seize wäre dann erforderlich, wird aber in diesem Szenario nicht praktisch behandelt.',
    distractorDescriptions: [
      'Ein normaler Transfer funktioniert auch bei offlineem altem DC.',
      'Seize ist dasselbe wie ein normaler Transfer.',
      'Ein ausgefallener DC erzwingt die Neuinstallation des Forests.',
    ],
  }),
  facetItem('ad.fsmo.transfer.schemaCaution', 'ad.fsmo.transfer', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Schmmgmt Caution',
    description: 'regsvr32 schmmgmt.dll ist im Quell-/Laborszenario nötig, um das Schema Snap-In verfügbar zu machen. Moderne Windows-Versionen können das Snap-In bereits vorinstalliert haben; es wird nicht als universelle Gesetzmäßigkeit gelehrt.',
    distractorDescriptions: [
      'regsvr32 schmmgmt.dll ist auf jedem Windows-Server zwingend erforderlich.',
      'Das Schema Snap-In ist immer ohne Registrierung sichtbar.',
      'regsvr32 schmmgmt.dll ändert das Schema.',
    ],
  }),
];
