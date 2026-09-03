// =============================================================================
// Knowledge Items – Active Directory Thema 26
// AD-Papierkorb & Wiederherstellung
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const THEME_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-recycle-bin');

function facetItem(id, cluster, type, fields) {
  return {
    id,
    topicKey: THEME_TOPIC_KEY,
    sourceTopicKey: THEME_TOPIC_KEY,
    sourceSection: 'ad-recycle-bin',
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

export const adRecycleBinKnowledgeItems = [
  facetItem('ad.recycleBin.definition', 'ad.recycleBin', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'AD Recycle Bin',
    definition: 'Funktion zur Wiederherstellung versehentlich gelöschter Active-Directory-Objekte wie Benutzer, Computer, Gruppen und OUs.',
    distractorDefinitions: [
      'Funktion zur Neuinstallation des Forests.',
      'Ersatz für ein vollwertiges Backup-System.',
      'Werkzeug zum Löschen von Objekten.',
    ],
  }),
  facetItem('ad.recycleBin.enable', 'ad.recycleBin', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Papierkorb aktivieren',
    description: 'Der AD-Papierkorb wird bewusst für den gesamten Forest aktiviert, typischerweise im Active Directory Administrative Center. Er muss vor dem Löschen aktiv sein.',
    distractorDescriptions: [
      'Aktivierung pro OU.',
      'Automatisch auf jedem Client.',
      'Aktivierung im DNS-Manager.',
    ],
  }),
  facetItem('ad.recycleBin.forestScope', 'ad.recycleBin', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Forestweite Wirkung',
    definition: 'Die Aktivierung des AD-Papierkorbs wirkt forestweit, nicht nur für eine einzelne Domain oder OU.',
    distractorDefinitions: [
      'Wirkt nur auf den lokalen Client.',
      'Wirkt nur pro Domain Controller.',
      'Wirkt nur auf Benutzerobjekte.',
    ],
  }),
  facetItem('ad.recycleBin.irreversibleEnable', 'ad.recycleBin', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Irreversible Aktivierung',
    definition: 'Die Aktivierung des AD-Papierkorbs ist forestweit wirksam und kann nicht einfach rückgängig gemacht werden.',
    distractorDefinitions: [
      'Kann jederzeit einfach deaktiviert werden.',
      'Ist automatisch nach 180 Tagen deaktiviert.',
      'Gilt nur bis zum nächsten Neustart.',
    ],
  }),
  facetItem('ad.recycleBin.deletedObjects', 'ad.recycleBin', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Deleted Objects',
    definition: 'Container, in dem gelöschte AD-Objekte angezeigt und aus dem sie wiederhergestellt werden können, wenn der Recycle Bin aktiv war.',
    distractorDefinitions: [
      'Container für neue Objekte.',
      'Container für DNS-Zonen.',
      'Container für Gruppenrichtlinien.',
    ],
  }),
  facetItem('ad.recycleBin.restore', 'ad.recycleBin', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Restore',
    description: 'Restore bringt ein gelöschtes Objekt an seinen ursprünglichen Ort zurück.',
    distractorDescriptions: [
      'Restore führt an einen beliebigen Zielort.',
      'Restore löscht das Objekt endgültig.',
      'Restore kopiert das Objekt in eine andere Domain.',
    ],
  }),
  facetItem('ad.recycleBin.restoreTo', 'ad.recycleBin', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Restore To',
    description: 'Restore To bzw. „Wiederherstellen in..." ermöglicht das Wiederherstellen eines gelöschten Objekts an einem anderen Zielort.',
    distractorDescriptions: [
      'Restore To bringt an den ursprünglichen Ort zurück.',
      'Restore To endgültiges Löschen.',
      'Restore To ist nur für Benutzer gültig.',
    ],
  }),
  facetItem('ad.recycleBin.retention', 'ad.recycleBin', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Aufbewahrungsdauer',
    definition: 'Gelöschte Objekte bleiben für eine definierte Aufbewahrungsdauer im Recycle Bin, im Laborkontext oft 180 Tage. Danach wird das Objekt endgültig bereinigt.',
    distractorDefinitions: [
      'Gelöschte Objekte bleiben ewig erhalten.',
      'Aufbewahrungsdauer gilt nur für OUs.',
      'Aufbewahrungsdauer ist unveränderlich für alle Umgebungen.',
    ],
  }),
  facetItem('ad.recycleBin.tombstoneLifetime', 'ad.recycleBin', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'tombstoneLifetime',
    definition: 'Technischer Hintergrundwert, der die Aufbewahrungsdauer gelöschter Objekte in AD steuert. Wird im Thema nicht praktisch geändert.',
    distractorDefinitions: [
      'Ein Tool zum Wiederherstellen.',
      'Ein Backup-Verfahren.',
      'Ein Client-Konfigurationswert.',
    ],
  }),
  facetItem('ad.recycleBin.verify', 'ad.recycleBin', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Verifikation nach Restore',
    description: 'Nach Restore prüft man, ob das Objekt wieder existiert, am erwarteten Ort liegt und wichtige Attribute sowie Bezüge vorhanden sind.',
    distractorDescriptions: [
      'Verifikation ist nicht nötig.',
      'Verifikation löscht das Objekt.',
      'Verifikation findet im DNS-Manager statt.',
    ],
  }),
  facetItem('ad.recycleBin.vsBackup', 'ad.recycleBin', KNOWLEDGE_TYPES.DEFINITION, {
    term: 'Recycle Bin vs Backup',
    definition: 'Der Recycle Bin ist eine Objekt-Recovery-Funktion für kurzfristig gelöschte Objekte. Backup ist für umfassende Disaster-Recovery und langfristigen Schutz notwendig.',
    distractorDefinitions: [
      'Recycle Bin ersetzt vollständig ein Backup.',
      'Backup ist nur für kurzfristige Löschung.',
      'Beides sind identische Verfahren.',
    ],
  }),
  facetItem('ad.recycleBin.preEnableRequirement', 'ad.recycleBin', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Vorherige Aktivierung',
    description: 'Der AD-Papierkorb muss vor dem Löschen aktiv sein, damit gelöschte Objekte im Container Deleted Objects landen und wiederherstellbar sind.',
    distractorDescriptions: [
      'Aktivierung nach dem Löschen reicht sicher aus.',
      'Aktivierung ist nicht nötig.',
      'Aktivierung erfolgt automatisch.',
    ],
  }),
  facetItem('ad.recycleBin.adsiEditAdvanced', 'ad.recycleBin', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'ADSI Edit',
    description: 'ADSI Edit ist ein fortgeschrittenes Tool für direkte Arbeit mit AD-Attributen. Es ist für normale Recycle-Bin-Restore-Aufgaben nicht erforderlich.',
    distractorDescriptions: [
      'ADSI Edit ist der normale Weg für Restore.',
      'ADSI Edit muss für jeden Restore genutzt werden.',
      'ADSI Edit aktiviert den Papierkorb.',
    ],
  }),
  facetItem('ad.recycleBin.troubleshooting', 'ad.recycleBin', KNOWLEDGE_TYPES.PROPERTY, {
    subject: 'Troubleshooting Recycle Bin',
    description: 'Deleted Objects nicht sichtbar → prüfen, ob Recycle Bin aktiviert ist, Ansicht aktualisiert wurde und das richtige Verwaltungstool verwendet wird. Objekt wurde vor Aktivierung gelöscht → normaler Recycle-Bin-Workflow möglicherweise nicht verfügbar.',
    distractorDescriptions: [
      'DNS-Server ist immer schuld.',
      'Objekte werden ewig in allen Fällen gespeichert.',
      'ADSI Edit löst jedes Problem.',
    ],
  }),
];
