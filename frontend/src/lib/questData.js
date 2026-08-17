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
    subtitle: 'VLANs für Personal und Buchhaltung auf Sw2',
    briefing: 'Personal und Buchhaltung hängen künftig am selben Access-Switch, sollen aber logisch getrennt bleiben. Richte VLAN 10 PERSONAL und VLAN 20 BUCHHALTUNG auf Sw2 ein, parke ungenutzte Ports im Parking-VLAN 999, bereite den Uplink als Trunk vor, prüfe die Konfiguration und speichere sie.',
    minutes: 12,
    difficulty: 2,
    boss: false,
    requires: ['cisco-main-001'],
    sideMissionsRequired: ['cisco-side-basic-001', 'cisco-side-basic-002', 'cisco-side-basic-003'],
    sideMissionsRequiredCount: 2,
    resolution: 'VLAN 10 PERSONAL und VLAN 20 BUCHHALTUNG konfiguriert, ungenutzte Ports geparkt, Uplink als Trunk vorbereitet.',
    recommendedAcademyTopics: ['cisco-packet-tracer/vlan', 'cisco-packet-tracer/trunk'],
  },
  {
    id: 'cisco-main-003',
    chapter: 3,
    department: 'Netzwerk',
    title: 'Fernwartung per SSH',
    subtitle: 'Management-VLAN, SVI und SSH auf SW-ADM-01',
    briefing: 'SW-ADM-01 ist bisher nur lokal erreichbar. Richte ein Management-VLAN mit SVI und IP-Adresse ein, setze ein Default Gateway und einen Domain-Namen, erzeuge einen RSA-Schlüssel, erzwinge SSH Version 2 und beschränke die VTY-Leitungen auf "login local" und "transport input ssh".',
    minutes: 15,
    difficulty: 3,
    boss: false,
    requires: ['cisco-main-002'],
    sideMissionsRequired: ['cisco-side-l2-001'],
    sideMissionsRequiredCount: 1,
    resolution: 'Management-VLAN 172/ADMIN mit SVI und IP eingerichtet, Default Gateway und Domain-Name gesetzt, RSA-Schlüssel erzeugt, SSH Version 2 erzwungen, VTY auf login local/transport input ssh beschränkt.',
    recommendedAcademyTopics: ['cisco-packet-tracer/ssh'],
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
