// Mission Event System (Mission System V2)
//
// Prepares the data model and trigger architecture for later random events.
// This is intentionally NOT a real-time scheduler — it only provides the
// structure so the future runtime can trigger events based on playtime,
// mission completion, location entry, weak skills or random chance.

const EVENT_LOG_KEY = 'cyberlearn:mission-events-v1';

export const EVENT_TRIGGER = {
  PLAYTIME: 'playtime',          // after N minutes of active playtime
  MISSION_COMPLETE: 'mission_complete',
  LOCATION_ENTER: 'location_enter',
  WEAK_SKILL: 'weak_skill',
  RANDOM: 'random',
  STORY_GATE: 'story_gate',
};

export const EVENT_TYPE = {
  CONVERSATION: 'conversation',  // NPC approaches the player
  TICKET: 'ticket',              // new ticket appears in the inbox
  ALERT: 'alert',                // monitoring alert
  LAB_UNLOCK: 'lab_unlock',      // training environment becomes available
  STORY_INTRO: 'story_intro',    // main mission intro / cutscene
};

export const LOCATION = {
  WORKSPACE: 'workspace',
  CORRIDOR: 'corridor',
  BREAK_ROOM: 'break_room',
  SERVER_ROOM: 'server_room',
  SAM_OFFICE: 'sam_office',
  ACADEMY: 'academy',
};

// A trigger condition is a predicate that can be evaluated later by the
// runtime.  It is serializable and testable.
export function playtimeTrigger(minutes) {
  return { type: EVENT_TRIGGER.PLAYTIME, minutes };
}

export function missionCompleteTrigger(missionType, count = 1) {
  return { type: EVENT_TRIGGER.MISSION_COMPLETE, missionType, count };
}

export function locationEnterTrigger(location) {
  return { type: EVENT_TRIGGER.LOCATION_ENTER, location };
}

export function weakSkillTrigger(domainId, skillId, subskillId, masteryThreshold = 0.35) {
  return { type: EVENT_TRIGGER.WEAK_SKILL, domainId, skillId, subskillId, masteryThreshold };
}

export function randomTrigger(chance, cooldownMinutes = 60) {
  return { type: EVENT_TRIGGER.RANDOM, chance, cooldownMinutes };
}

// An event template defines what happens when the trigger fires.
// The runtime later resolves the template into a concrete mission/ticket.
export function defineEvent({
  id,
  triggers,
  type,
  payload,
  once = false,
  priority = 2,
  cooldownMinutes = 0,
  maxActive = 1,
}) {
  return {
    id,
    triggers,
    type,
    payload,
    once,
    priority,
    cooldownMinutes,
    maxActive,
    createdAt: Date.now(),
  };
}

function readEventLog() {
  try {
    return JSON.parse(localStorage.getItem(EVENT_LOG_KEY)) || { events: [], lastEventAt: null };
  } catch {
    return { events: [], lastEventAt: null };
  }
}

function writeEventLog(log) {
  localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(log));
}

export function recordEvent(eventId, result = 'accepted') {
  const log = readEventLog();
  log.events.push({
    eventId,
    result,
    at: Date.now(),
  });
  log.lastEventAt = Date.now();
  // Keep the last 500 events.
  log.events = log.events.slice(-500);
  writeEventLog(log);
  return log;
}

export function eventHistory(eventId) {
  const log = readEventLog();
  return log.events.filter((e) => e.eventId === eventId);
}

export function isEventOnCooldown(eventId, cooldownMinutes) {
  const history = eventHistory(eventId);
  if (!history.length) return false;
  const last = history[history.length - 1];
  return Date.now() - last.at < cooldownMinutes * 60 * 1000;
}

export function hasEventFired(eventId) {
  return eventHistory(eventId).length > 0;
}

// Evaluate a single trigger against runtime context.
// The context is supplied by the runtime and kept deliberately small.
export function evaluateTrigger(trigger, context = {}) {
  switch (trigger.type) {
    case EVENT_TRIGGER.PLAYTIME:
      return (context.playtimeMinutes || 0) >= trigger.minutes;
    case EVENT_TRIGGER.MISSION_COMPLETE:
      return (context.completedMissionsByType?.[trigger.missionType] || 0) >= trigger.count;
    case EVENT_TRIGGER.LOCATION_ENTER:
      return context.location === trigger.location;
    case EVENT_TRIGGER.WEAK_SKILL:
      return (context.subskillMastery?.[`${trigger.domainId}.${trigger.skillId}.${trigger.subskillId}`] || 1) <= trigger.masteryThreshold;
    case EVENT_TRIGGER.RANDOM:
      // Randomness is resolved by the runtime, not here.
      return context.randomRoll !== undefined ? context.randomRoll <= trigger.chance : false;
    case EVENT_TRIGGER.STORY_GATE:
      return context.completedStoryGates?.includes(trigger.gateId) || false;
    default:
      return false;
  }
}

export function canEventFire(event, context = {}) {
  if (event.once && hasEventFired(event.id)) return false;
  if (event.cooldownMinutes && isEventOnCooldown(event.id, event.cooldownMinutes)) return false;
  const activeCount = (context.activeEventIds || []).filter((id) => id === event.id).length;
  if (activeCount >= event.maxActive) return false;
  return event.triggers.some((trigger) => evaluateTrigger(trigger, context));
}

// Example event templates for the new system.  Kept here as documentation
// and as a base for the first concrete events.
export const EXAMPLE_EVENTS = [
  defineEvent({
    id: 'break-room-mac-table',
    triggers: [locationEnterTrigger(LOCATION.BREAK_ROOM), randomTrigger(0.3, 120)],
    type: EVENT_TYPE.CONVERSATION,
    payload: {
      personId: 'sandra',
      topic: 'switching',
      skillPath: 'cisco.switching.mac_table',
      prompt: 'Warum braucht ein Switch eigentlich eine MAC-Adress-Tabelle?',
      interaction: {
        type: 'choice',
        options: [
          { label: 'Um Frames an den richtigen Port weiterzuleiten', correct: true },
          { label: 'Um IP-Adressen zu vergeben', correct: false },
          { label: 'Um den Standardgateway zu finden', correct: false },
        ],
      },
    },
    once: false,
    cooldownMinutes: 120,
  }),
  defineEvent({
    id: 'ticket-dhcp-no-lease',
    triggers: [missionCompleteTrigger('main', 1), randomTrigger(0.25, 60)],
    type: EVENT_TYPE.TICKET,
    payload: {
      templateId: 'client-no-lease',
      requiredSkills: ['cisco.dhcp.dhcp_relay'],
    },
    once: false,
    cooldownMinutes: 60,
  }),
];
