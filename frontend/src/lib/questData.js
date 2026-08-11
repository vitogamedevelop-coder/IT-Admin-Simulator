// Mission quest registry.
// Phase 0 reset: legacy demo quests have been removed. The infrastructure
// (Quest page, quest router, mission log) remains in place for the new
// adaptive mission system.
export const quests = [
  {
    id: 'cisco-main-001-basic-configuration',
    chapter: 1,
    department: 'Netzwerk',
    title: 'Neues Netzwerkgerät vorbereiten',
    subtitle: 'Grundkonfiguration eines Cisco-Geräts durchführen',
    briefing: 'Ein neues Gerät wurde geliefert. Bereite es mit Hostname, Benutzer, Interface-IP und Sicherheitseinstellungen vor.',
    minutes: 5,
    difficulty: 1,
    boss: false,
    requires: [],
    resolution: 'Gerät erfolgreich vorbereitet.',
    recommendedAcademyTopics: ['cisco-packet-tracer/grundkonfiguration'],
  },
];

export function questById(id) {
  return quests.find((quest) => quest.id === id);
}

export function availableQuests(state) {
  return quests.filter((quest) => !state.completedQuests.includes(quest.id) && (quest.requires || []).every((id) => state.completedQuests.includes(id)));
}

export function recommendedQuest(state) {
  if (state.activeQuest) return questById(state.activeQuest);
  return availableQuests(state).sort((a, b) => a.difficulty - b.difficulty)[0] || null;
}
