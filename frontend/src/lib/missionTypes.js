// Mission Type Registry (Mission System V2)
//
// The new mission system supports four mission archetypes.  Each type is a
// contract: the runtime engine (MissionRuntime) only needs to know the type
// and the mission definition; the concrete presentation can be swapped later.

export const MISSION_TYPE = {
  MAIN: 'main',
  TICKET: 'ticket',
  LAB: 'lab',
  CONVERSATION: 'conversation',
};

export const MISSION_TYPE_META = {
  [MISSION_TYPE.MAIN]: {
    label: 'Hauptmission',
    description: 'Lehrgangsprogression: führt neue Kompetenzen ein und verknüpft mehrere Geräte/Themen.',
    icon: 'Shield',
    color: '#00ff66',
    allowsRetry: true,
    gatesProgression: true,
  },
  [MISSION_TYPE.TICKET]: {
    label: 'Ticket',
    description: 'Laufender Betrieb: zufällige Szenarien aus bereits bekannten Skills, selbstständige Diagnose.',
    icon: 'Inbox',
    color: '#ffcc00',
    allowsRetry: true,
    gatesProgression: false,
  },
  [MISSION_TYPE.LAB]: {
    label: 'Lab',
    description: 'Trainingsumgebung: gezieltes Training eines bestimmten schwachen Skills.',
    icon: 'Terminal',
    color: '#00f0ff',
    allowsRetry: true,
    gatesProgression: false,
  },
  [MISSION_TYPE.CONVERSATION]: {
    label: 'Gespräch',
    description: 'Wissensevent: Grundlagen organisch in Kaffeeküche, Flur oder Büro wiederholen.',
    icon: 'MessageSquare',
    color: '#8b949e',
    allowsRetry: false,
    gatesProgression: false,
  },
};

// Skill difficulty progression for a single subskill.  Used by the lab
// generator and by adaptive main/ticket missions.
export const DIFFICULTY_LEVEL = {
  GUIDED: 1,      // Every step is given explicitly.
  PROMPTED: 2,    // The goal is given, but the player chooses the command.
  OPEN: 3,        // Only the symptom/goal, full command sequence required.
  EXAM: 4,        // Multi-device, multi-topic, no hints unless requested.
};

export const DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVEL.GUIDED]: 'Geführt',
  [DIFFICULTY_LEVEL.PROMPTED]: 'Angestoßen',
  [DIFFICULTY_LEVEL.OPEN]: 'Offen',
  [DIFFICULTY_LEVEL.EXAM]: 'Prüfungsnah',
};

// A mission definition is intentionally UI-agnostic.  It describes what the
// player must do, not how the screen is laid out.
//
// Required fields:
//   id, type, title, requiredSubskills[], difficulty, scenario
// Optional fields:
//   prerequisites (mission ids), recommendedFor (subskill paths), durationMinutes,
//   devices[], topology, introduction, successCriteria, verificationCommands[]
export function defineMission(definition) {
  return {
    type: MISSION_TYPE.MAIN,
    durationMinutes: 5,
    retries: 0,
    completed: false,
    ...definition,
  };
}

export function isMissionType(type) {
  return Object.values(MISSION_TYPE).includes(type);
}

// Helper to describe a mission to the player without exposing internals.
export function missionSummary(mission) {
  const meta = MISSION_TYPE_META[mission.type] || MISSION_TYPE_META[MISSION_TYPE.MAIN];
  return {
    title: mission.title,
    subtitle: mission.subtitle || meta.description,
    typeLabel: meta.label,
    typeColor: meta.color,
    durationMinutes: mission.durationMinutes,
    difficulty: DIFFICULTY_LABELS[mission.difficulty] || DIFFICULTY_LABELS[DIFFICULTY_LEVEL.GUIDED],
  };
}
