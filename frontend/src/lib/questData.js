// Mission quest registry.
// Phase 0 reset: legacy demo quests have been removed. The infrastructure
// (Quest page, quest router, mission log) remains in place for the new
// adaptive mission system.
//
// New V2 missions are stored in their own runtime modules (missionV2.js etc.).
// This registry only keeps a minimal placeholder so the objective system,
// legacy Quest route, and completion bookkeeping can resolve the ID.
export const quests = [
  {
    id: 'cisco-main-001',
    chapter: 1,
    department: 'Netzwerk',
    title: 'Der erste Switch',
    subtitle: 'Grundkonfiguration eines Cisco Layer-2-Switches',
    briefing: 'Für NEXUS wurde ein neuer Cisco Layer-2-Switch geliefert. Bereite das Gerät mit Hostname, Enable Secret, lokalem Benutzer und DNS-Einstellungen vor und speichere die Konfiguration.',
    minutes: 5,
    difficulty: 1,
    boss: false,
    requires: [],
    resolution: 'Switch erfolgreich vorbereitet.',
    recommendedAcademyTopics: ['cisco-packet-tracer/grundkonfiguration'],
  },
  {
    id: 'cisco-main-002',
    chapter: 2,
    department: 'Netzwerk',
    title: 'Neue Abteilung',
    subtitle: 'VLAN für die Personalabteilung auf Sw2',
    briefing: 'Für die neuen Arbeitsplätze der Personalabteilung wurde ein eigener Layer-2-Bereich vorgesehen. Richte VLAN 10 PERSONAL auf Sw2 ein, ordne die vier Arbeitsplatzports zu, prüfe die Konfiguration und speichere sie.',
    minutes: 8,
    difficulty: 2,
    boss: false,
    requires: ['cisco-main-001'],
    sideMissionsRequired: ['cisco-side-basic-001', 'cisco-side-basic-002', 'cisco-side-basic-003'],
    resolution: 'VLAN 10 PERSONAL für die Personalabteilung konfiguriert.',
    recommendedAcademyTopics: ['cisco-packet-tracer/vlan_basics'],
  },
];

export function questById(id) {
  return quests.find((quest) => quest.id === id);
}

export function availableQuests(state) {
  return quests.filter((quest) => !quest.gate && !state.completedQuests.includes(quest.id) && (quest.requires || []).every((id) => state.completedQuests.includes(id)));
}

export function recommendedQuest(state) {
  if (state.activeQuest) return questById(state.activeQuest);
  return availableQuests(state).sort((a, b) => a.difficulty - b.difficulty)[0] || null;
}
