// Procedural Side-Mission System V1 (Phase 1H / 1I).
//
// Domain-agnostic generator/validator/adaptive-selector/scheduler built on
// top of the EXISTING skill tree, mission log, delivery (mail/phone)
// and objective systems. This does NOT replace the hand-built main/side
// mission engines - it produces additional, procedurally varied Cisco side
// work from skills the player has already been taught (item 28).
//
// Pipeline: GENERATE -> VALIDATE -> ACCEPT/REJECT (item 14). A rejected
// candidate is discarded and a new one is attempted; an invalid mission is
// never shown to the player.
import {
  getSubskill, recordSkillEvent, readSkillEvents, listAllSubskills,
  SKILL_DIMENSION, SKILL_SOURCE, COMPETENCY_STATE,
} from './skillTree.js';
import { readGameState, hasMissionDelivery, recordMissionDelivery } from './gameState.js';
import { registerMission, updateMissionStatus, MissionStatus } from './missionLog.js';
import { readEmails, writeEmails } from './emails.js';
import {
  enqueue, createNotification, notificationTypes, readNotifications, writeNotifications,
} from './notificationSystem.js';
import { executeCommand } from './ciscoCliEngine.js';
import {
  createHintState, getNextHint, consumeHint, revealSolution, HINT_LEVEL_LABELS,
} from './missionHintSystem.js';
import { MAIN_MISSION_ORDER } from './missionV2.js';
import {
  allTemplates, getTemplate, seededRng, pickFrom,
  MISSION_ARCHETYPE, MISSION_CHANNEL, ARCHETYPE_CHANNEL_AFFINITY,
  DIFFICULTY_PROFILE, DIFFICULTY_ORDER,
} from './missionTemplateEngine.js';

const INSTANCES_KEY = 'cyberlearn:procedural-instances-v1';
const HISTORY_KEY = 'cyberlearn:procedural-history-v1';
const SCHEDULER_KEY = 'cyberlearn:procedural-scheduler-v1';

const MISSION_ID_PREFIX = 'procedural:';
export function proceduralMissionId(instanceId) {
  return `${MISSION_ID_PREFIX}${instanceId}`;
}
export function isProceduralMissionId(id) {
  return typeof id === 'string' && id.startsWith(MISSION_ID_PREFIX);
}
export function instanceIdFromMissionId(id) {
  return isProceduralMissionId(id) ? id.slice(MISSION_ID_PREFIX.length) : null;
}

// ============================================================================
// Persistence (item 10, 34)
// ============================================================================

export function readInstances() {
  try {
    return JSON.parse(localStorage.getItem(INSTANCES_KEY)) || {};
  } catch {
    return {};
  }
}

export function writeInstances(instances) {
  localStorage.setItem(INSTANCES_KEY, JSON.stringify(instances));
}

export function getInstance(instanceId) {
  return readInstances()[instanceId] || null;
}

function saveInstance(instance) {
  const instances = readInstances();
  instances[instance.instanceId] = instance;
  writeInstances(instances);
  return instance;
}

// Open = still relevant for the batch cap (item 19): available, accepted or
// active. Completed/declined instances do not count against the cap.
const OPEN_STATUSES = ['available', 'accepted', 'active'];

export function getOpenInstances() {
  return Object.values(readInstances()).filter((i) => OPEN_STATUSES.includes(i.status));
}

export function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function pushHistory(entry) {
  const history = readHistory();
  history.push({ ...entry, at: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-50)));
}

function readScheduler() {
  try {
    return JSON.parse(localStorage.getItem(SCHEDULER_KEY)) || { completedSinceLastBatch: 0, contentEndAnnounced: false };
  } catch {
    return { completedSinceLastBatch: 0, contentEndAnnounced: false };
  }
}

function writeScheduler(s) {
  localStorage.setItem(SCHEDULER_KEY, JSON.stringify(s));
}

// ============================================================================
// Phase 1I migration: legacy "ticket" channel -> e-mail
// ============================================================================

const MIGRATION_KEY = 'cyberlearn:ticket-channel-migrated';

export function migrateTicketChannel() {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(MIGRATION_KEY)) return;

  // Migrate persisted procedural instances.
  const instances = readInstances();
  let instancesChanged = false;
  Object.values(instances).forEach((instance) => {
    if (instance.channel === 'ticket') {
      instance.channel = MISSION_CHANNEL.EMAIL;
      instancesChanged = true;
    }
  });
  if (instancesChanged) writeInstances(instances);

  // Migrate pending ticket notifications to e-mails, then dismiss them.
  const notifications = readNotifications ? readNotifications() : [];
  let notificationsChanged = false;
  const emails = readEmails();
  let emailsChanged = false;
  notifications.forEach((n) => {
    if (n.type !== 'ticket' || !n.linkedMissionId || n.dismissed || n.acknowledged) return;
    const instanceId = instanceIdFromMissionId(n.linkedMissionId);
    if (!instanceId) return;
    const instance = instances[instanceId];
    if (!instance) return;
    const emailId = `procedural-mail-${instanceId}`;
    if (!emails.some((e) => e.id === emailId)) {
      emails.push({
        id: emailId,
        from: { personId: n.source?.personId || 'sam', name: n.source?.name || 'Sam Richter', role: 'Senior-Administrator' },
        to: ['spieler@nexus.local'],
        subject: n.title || instance.title,
        body: instance.briefing || n.body || '',
        priority: 'normal',
        date: n.createdAt || Date.now(),
        read: false,
        attachments: [],
        linkedMissionId: n.linkedMissionId,
      });
      emailsChanged = true;
    }
    n.acknowledged = true;
    n.dismissed = true;
    notificationsChanged = true;
  });
  if (notificationsChanged && writeNotifications) writeNotifications(notifications);
  if (emailsChanged) writeEmails(emails);

  localStorage.setItem(MIGRATION_KEY, '1');
}

// Run once at module load. Safe to call repeatedly because of the guard above.
migrateTicketChannel();

// ============================================================================
// Curriculum unlock (item 1, 2, 23, 28)
// ============================================================================

// Which hand-built main mission unlocks which skill *group* (skillId in
// skillTree.js) for procedural practice. Extend this map (item 26) whenever
// a new main mission introduces a new skill group.
const SKILL_GROUP_UNLOCK = {
  basic_configuration: 'cisco-main-001',
  switching: 'cisco-main-002',
  routing: 'cisco-main-003',
};

export function isSkillGroupUnlocked(skillId, state = readGameState()) {
  const requiredMission = SKILL_GROUP_UNLOCK[skillId];
  if (!requiredMission) return false; // unknown/未 introduced skill groups are never generated
  return (state.completedQuests || []).includes(requiredMission);
}

export function isTemplateUnlocked(template, state = readGameState()) {
  return (template.unlockedBy || []).every((missionId) => (state.completedQuests || []).includes(missionId));
}

function templatesForSkillPath(skillPath, state) {
  return allTemplates().filter((t) => t.requiredSkills.includes(skillPath) && isTemplateUnlocked(t, state));
}

// All subskill paths that at least one unlocked template can practice.
export function generatableSkillPaths(state = readGameState()) {
  const templates = allTemplates().filter((t) => isTemplateUnlocked(t, state));
  const paths = new Set();
  templates.forEach((t) => t.requiredSkills.forEach((p) => paths.add(p)));
  return Array.from(paths);
}

// ============================================================================
// Content-end detection (item 23, 24)
// ============================================================================

export function hasReachedContentEnd(state = readGameState()) {
  const completed = state.completedQuests || [];
  return MAIN_MISSION_ORDER.length > 0 && MAIN_MISSION_ORDER.every((id) => completed.includes(id));
}

// Announce the content-end message exactly once. Returns the message text
// if it should be shown now, otherwise null. This never blocks the
// workspace - the generator keeps running in "endless work mode" (item 25)
// regardless of whether the message has been shown.
export function maybeAnnounceContentEnd() {
  const state = readGameState();
  if (!hasReachedContentEnd(state)) return null;
  const scheduler = readScheduler();
  if (scheduler.contentEndAnnounced) return null;
  scheduler.contentEndAnnounced = true;
  writeScheduler(scheduler);
  return 'Der aktuelle Ausbildungsstand ist abgeschlossen. Weitere Inhalte folgen. Dein Arbeitsplatz bleibt currently voll nutzbar - neue, an deinen Lernstand angepasste Aufgaben kommen weiterhin herein.'
    .replace('currently ', '');
}

// ============================================================================
// Adaptive skill selection (item 18)
// ============================================================================

// Configurable weights - deliberately exported so balancing does not
// require touching the selection logic itself.
export const ADAPTIVE_WEIGHTS = {
  weakness: 0.40,
  reviewDue: 0.25,
  progression: 0.15,
  timeSincePractice: 0.10,
  varietyNeed: 0.10,
  // Explicit signal for "this skill has been gotten wrong repeatedly",
  // independent of raw mastery/time-since-practice. Without this, a
  // never-attempted sibling skill (which naturally scores high on
  // time-since-practice) could outrank a skill the player has visibly
  // struggled with several times.
  strugglingRepeatedErrors: 0.35,
};

export const WEAKNESS_THRESHOLD = 0.4;
const BASELINE_DISTRIBUTION = [0.6, 0.25, 0.15]; // current / previous / older skill group

function recentGenerationCount(subskillPath, history) {
  return history.filter((h) => h.skillPath === subskillPath).length;
}

function timeSinceFactor(record) {
  if (!record.lastAttemptAt) return 1; // never practiced -> high need
  const days = (Date.now() - record.lastAttemptAt) / 86400000;
  return Math.min(1, days / 14);
}

function skillGroupsUnlockedInOrder(state) {
  // Order matches SKILL_GROUP_UNLOCK's underlying main-mission order.
  return Object.entries(SKILL_GROUP_UNLOCK)
    .filter(([, missionId]) => (state.completedQuests || []).includes(missionId))
    .map(([skillId]) => skillId);
}

// Returns { path, domainId, skillId, subskillId, record, score, reason } or
// null if nothing is unlocked yet for procedural practice.
export function selectSkillForGeneration(state = readGameState()) {
  const paths = generatableSkillPaths(state);
  if (paths.length === 0) return null;

  const history = readHistory();
  const unlockedGroups = skillGroupsUnlockedInOrder(state);
  const currentGroup = unlockedGroups[unlockedGroups.length - 1];

  const candidates = paths.map((path) => {
    const [domainId, skillId, subskillId] = path.split('.');
    const record = getSubskill(domainId, skillId, subskillId);
    const weakness = 1 - record.mastery;
    const reviewDue = record.state === COMPETENCY_STATE.REVIEW_DUE ? 1 : 0;
    const progression = skillId === currentGroup ? 1 : 0;
    const timeSince = timeSinceFactor(record);
    const variety = 1 / (1 + recentGenerationCount(path, history));
    const struggling = Math.min(1, record.incorrectCount / 3);
    const score = ADAPTIVE_WEIGHTS.weakness * weakness
      + ADAPTIVE_WEIGHTS.reviewDue * reviewDue
      + ADAPTIVE_WEIGHTS.progression * progression
      + ADAPTIVE_WEIGHTS.timeSincePractice * timeSince
      + ADAPTIVE_WEIGHTS.varietyNeed * variety
      + ADAPTIVE_WEIGHTS.strugglingRepeatedErrors * struggling;
    return { path, domainId, skillId, subskillId, record, weakness, score };
  });

  const clearWeakness = candidates.filter((c) => c.record.mastery < WEAKNESS_THRESHOLD);
  if (clearWeakness.length > 0) {
    clearWeakness.sort((a, b) => b.score - a.score);
    return { ...clearWeakness[0], reason: 'weakness' };
  }

  // Baseline distribution (60/25/15 across current/previous/older skill
  // groups) when nothing stands out as a clear weakness.
  const buckets = [
    candidates.filter((c) => c.skillId === unlockedGroups[unlockedGroups.length - 1]),
    candidates.filter((c) => c.skillId === unlockedGroups[unlockedGroups.length - 2]),
    candidates.filter((c) => unlockedGroups.slice(0, Math.max(0, unlockedGroups.length - 2)).includes(c.skillId)),
  ].filter((b) => b.length > 0);

  if (buckets.length === 0) {
    candidates.sort((a, b) => b.score - a.score);
    return { ...candidates[0], reason: 'fallback' };
  }

  const weights = BASELINE_DISTRIBUTION.slice(0, buckets.length);
  const total = weights.reduce((s, w) => s + w, 0);
  const roll = Math.random() * total;
  let acc = 0;
  let chosenBucket = buckets[0];
  for (let i = 0; i < buckets.length; i += 1) {
    acc += weights[i];
    if (roll <= acc) { chosenBucket = buckets[i]; break; }
  }
  chosenBucket.sort((a, b) => b.score - a.score);
  return { ...chosenBucket[0], reason: 'baseline' };
}

// ============================================================================
// Adaptive difficulty (item 6, 31)
// ============================================================================

function trailingOutcomes(subskillPath, limit = 8) {
  return readSkillEvents()
    .filter((e) => e.skillPath === subskillPath && !e.revealedSolution)
    .slice(-limit)
    .map((e) => e.correct);
}

export function suggestDifficulty(subskillPath) {
  const outcomes = trailingOutcomes(subskillPath);
  let failStreak = 0;
  let successStreak = 0;
  for (let i = outcomes.length - 1; i >= 0 && outcomes[i] === false; i -= 1) failStreak += 1;
  for (let i = outcomes.length - 1; i >= 0 && outcomes[i] === true; i -= 1) successStreak += 1;
  const [domainId, skillId, subskillId] = subskillPath.split('.');
  const record = getSubskill(domainId, skillId, subskillId);
  if (failStreak >= 2) return DIFFICULTY_PROFILE.EASY;
  if (successStreak >= 2 && record.mastery > 0.5) return DIFFICULTY_PROFILE.HARD;
  return DIFFICULTY_PROFILE.MEDIUM;
}

// ============================================================================
// Archetype / channel selection
// ============================================================================

// Mastery shifts the ODDS, it never hard-excludes an archetype: even at low
// mastery there is a chance of REPAIR/AUDIT etc. so repeated generation for
// the same skill still varies (item 35-B), while low mastery still leans
// clearly towards the more guided BUILD archetype.
function archetypeWeight(archetype, mastery) {
  switch (archetype) {
    case MISSION_ARCHETYPE.BUILD: return Math.max(0.2, 1 - mastery);
    case MISSION_ARCHETYPE.COMPLETE: return 0.3;
    case MISSION_ARCHETYPE.REPAIR: return 0.3 + mastery * 0.2;
    case MISSION_ARCHETYPE.AUDIT: return Math.max(0.2, mastery);
    case MISSION_ARCHETYPE.DIAGNOSE: return Math.max(0.15, mastery * 0.8);
    default: return 0.25;
  }
}

function pickArchetype(template, record, rng) {
  const pool = template.archetypes;
  const mastery = record?.mastery || 0;
  const weights = pool.map((a) => archetypeWeight(a, mastery));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const roll = (rng(0, 9999) / 10000) * total;
  let acc = 0;
  for (let i = 0; i < pool.length; i += 1) {
    acc += weights[i];
    if (roll <= acc) return pool[i];
  }
  return pool[pool.length - 1];
}

function pickChannel(template, archetype, rng) {
  const affinity = ARCHETYPE_CHANNEL_AFFINITY[archetype] || template.allowedChannels;
  const intersection = template.allowedChannels.filter((c) => affinity.includes(c));
  return pickFrom(rng, intersection.length ? intersection : template.allowedChannels);
}

// ============================================================================
// Anti-repetition (item 17)
// ============================================================================

export function isImmediateRepeat(combo, history = readHistory()) {
  if (history.length === 0) return false;
  const last = history[history.length - 1];
  return last.skillPath === combo.skillPath
    && last.archetype === combo.archetype
    && last.context === combo.context
    && JSON.stringify(last.centralParam) === JSON.stringify(combo.centralParam);
}

function hasOpenDuplicate(candidate) {
  const instances = readInstances();
  for (const inst of Object.values(instances)) {
    if (!OPEN_STATUSES.includes(inst.status)) continue;
    if (inst.templateId !== candidate.templateId) continue;
    if (inst.archetype !== candidate.archetype) continue;
    if (inst.context !== candidate.context) continue;
    if (JSON.stringify(inst.centralParam) !== JSON.stringify(candidate.centralParam)) continue;
    return true;
  }
  return false;
}

// ============================================================================
// Validator (item 14)
// ============================================================================

export function validateMissionInstance(candidate, template, state) {
  const reasons = [];

  if (!candidate.params || typeof candidate.params !== 'object' || Object.keys(candidate.params).length === 0) {
    reasons.push('parameters_missing');
  }
  if (!isTemplateUnlocked(template, state)) {
    reasons.push('skills_not_unlocked');
  }
  if (typeof template.evaluate !== 'function') {
    reasons.push('no_success_criteria');
  }
  if (!DIFFICULTY_ORDER.includes(candidate.difficulty)) {
    reasons.push('invalid_difficulty');
  }
  if (!template.allowedChannels.includes(candidate.channel)) {
    reasons.push('channel_not_allowed_by_template');
  }
  const affinity = ARCHETYPE_CHANNEL_AFFINITY[candidate.archetype] || template.allowedChannels;
  if (!affinity.includes(candidate.channel)) {
    reasons.push('channel_does_not_fit_archetype');
  }
  if (isImmediateRepeat({ skillPath: candidate.skillIds[0], archetype: candidate.archetype, context: candidate.context, centralParam: candidate.centralParam })) {
    reasons.push('immediate_repetition');
  }
  if (hasOpenDuplicate(candidate)) {
    reasons.push('active_duplicate');
  }

  // Device-state sanity (Cisco-specific, item 15): every referenced
  // interface must actually exist on the generated device, and VLAN
  // parameters must not collide with reserved/parking IDs.
  if (candidate.device) {
    const ports = candidate.params.targetPorts || (candidate.params.targetPort ? [candidate.params.targetPort] : []);
    ports.forEach((port) => {
      if (!candidate.device.runningConfig.interfaces[port]) reasons.push(`interface_missing:${port}`);
    });
    const uplinkPort = 'GigabitEthernet0/1';
    if (ports.includes(uplinkPort)) reasons.push('target_port_is_uplink');
    if (candidate.params.vlanId != null) {
      if (candidate.params.vlanId === 1 || candidate.params.vlanId === 999) reasons.push('vlan_id_reserved');
      if (candidate.params.decoyVlanId === candidate.params.vlanId) reasons.push('vlan_id_collision');
    }
  }

  return { valid: reasons.length === 0, reasons };
}

// ============================================================================
// Generator (item 9, 10, 11, 12, 13)
// ============================================================================

const MAX_GENERATION_ATTEMPTS = 12;

function centralParamFor(templateId, params) {
  if (templateId === 'cisco-vlan-access-port') return { hostname: params.hostname, port: params.targetPort, vlanId: params.vlanId };
  if (templateId === 'cisco-vlan-access-range') return { hostname: params.hostname, port: params.targetPorts?.[0], vlanId: params.vlanId };
  if (templateId === 'cisco-vlan-move') return { hostname: params.hostname, port: params.targetPort, targetVlanId: params.targetVlanId };
  if (templateId === 'cisco-trunk-uplink') return { hostname: params.hostname, port: params.uplinkPort, vlanIds: params.vlans?.map((v) => v.id) };
  if (templateId === 'cisco-trunk-allowed-vlan') return { hostname: params.hostname, port: params.uplinkPort, missingVlanId: params.missingVlanId };
  if (templateId === 'cisco-router-on-a-stick' || templateId === 'cisco-router-fault') return { hostname: params.hostname, vlanIds: params.vlans?.map((v) => v.id), faultId: params.faultId };
  return { hostname: params.targetHostname || params.initialHostname };
}

// Generates ONE validated MissionInstance, or null if nothing could be
// generated (e.g. no skills unlocked yet, or the validator kept rejecting
// candidates). Never persists or delivers an invalid mission.
export function generateMissionInstance({ seed = Date.now() } = {}) {
  const state = readGameState();
  const skillChoice = selectSkillForGeneration(state);
  if (!skillChoice) return null;

  const templates = templatesForSkillPath(skillChoice.path, state);
  if (templates.length === 0) return null;

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const attemptSeed = seed + attempt * 7919;
    const rng = seededRng(attemptSeed);
    const template = pickFrom(rng, templates);
    const archetype = pickArchetype(template, skillChoice.record, rng);
    const context = pickFrom(rng, template.contexts);
    const difficulty = suggestDifficulty(skillChoice.path);
    const channel = pickChannel(template, archetype, rng);
    const params = template.resolveParameters(rng, archetype, context, difficulty);
    const { device } = template.buildDevice(params, archetype);
    const centralParam = centralParamFor(template.id, params);

    const candidate = {
      instanceId: `proc-${attemptSeed}-${Math.floor(Math.random() * 1e6)}`,
      templateId: template.id,
      seed: attemptSeed,
      channel,
      skillIds: [skillChoice.path],
      difficulty,
      archetype,
      context,
      params,
      centralParam,
      device,
    };

    const validation = validateMissionInstance(candidate, template, state);
    if (!validation.valid) continue; // reject, try again with a fresh attempt seed

    const instance = {
      instanceId: candidate.instanceId,
      templateId: template.id,
      seed: attemptSeed,
      generatedAt: Date.now(),
      channel,
      skillIds: candidate.skillIds,
      difficulty,
      archetype,
      context,
      resolvedParameters: params,
      device,
      title: template.buildTitle(params, archetype, context),
      briefing: template.buildBriefing(params, archetype, context, difficulty),
      status: 'available',
      readState: { read: false, readAt: null },
      acceptedState: { accepted: false, acceptedAt: null },
      completedState: { completed: false, completedAt: null },
      attempts: 0,
      hintsUsed: [],
      solutionRevealedFor: [],
      showCommandsUsed: [],
    };

    saveInstance(instance);
    pushHistory({
      skillPath: skillChoice.path,
      templateId: template.id,
      archetype,
      context,
      channel,
      difficulty,
      centralParam,
      deviceType: device.type,
    });
    return instance;
  }

  return null;
}

// ============================================================================
// Delivery (item 21, 22)
// ============================================================================

const CHANNEL_PERSONA = {
  [MISSION_CHANNEL.EMAIL]: { personId: 'sam', name: 'Sam Richter', role: 'Senior-Administrator' },
  [MISSION_CHANNEL.PHONE]: { personId: 'mara', name: 'Mara König', role: 'Helpdesk' },
};

export function deliverMissionInstance(instance) {
  const linkedMissionId = proceduralMissionId(instance.instanceId);
  if (hasMissionDelivery(instance.instanceId, instance.channel)) return false;
  const persona = CHANNEL_PERSONA[instance.channel] || CHANNEL_PERSONA[MISSION_CHANNEL.EMAIL];

  if (instance.channel === MISSION_CHANNEL.EMAIL) {
    const email = {
      id: `procedural-mail-${instance.instanceId}`,
      from: { personId: persona.personId, name: persona.name, role: persona.role },
      to: ['spieler@nexus.local'],
      subject: instance.title,
      body: instance.briefing,
      priority: 'normal',
      date: Date.now(),
      read: false,
      attachments: [],
      linkedMissionId,
    };
    if (!readEmails().some((e) => e.id === email.id)) {
      writeEmails([...readEmails(), email]);
    }
  } else if (instance.channel === MISSION_CHANNEL.PHONE) {
    const notification = createNotification({
      id: `phone-${instance.instanceId}`,
      type: notificationTypes.PHONE,
      priority: 2,
      source: { personId: persona.personId, channel: 'phone' },
      title: `${persona.name} ruft an`,
      body: instance.briefing.split('\n')[0],
      linkedMissionId,
    });
    enqueue(notification);
  }

  recordMissionDelivery(instance.instanceId, instance.channel);
  registerMission({ instanceId: instance.instanceId, questId: instance.templateId, source: instance.channel, title: instance.title });
  return instance;
}

// ============================================================================
// Batch scheduler (item 19, 20)
// ============================================================================

export const BATCH_CAP = 3;

// The ONLY entry point that may create new procedural instances outside of
// a direct debug call. `trigger` documents WHY this was called; callers
// must pass a real gameplay signal (e.g. 'mission_completed'). This is
// never wired to page load / navigation / mailbox-open - reading the
// current state (getOpenInstances, badges, objectives) never generates
// anything, so reload/re-navigation can never farm new missions.
export function maybeGenerateBatch(trigger) {
  if (!trigger) return [];
  const open = getOpenInstances().length;
  if (open >= BATCH_CAP) return [];

  let toGenerate = 0;
  if (open === 0) toGenerate = 1; // spec allows 1-3; V1 generates 1 at a time to stay conservative
  else if (open === 1) toGenerate = 1;
  else if (open === 2) toGenerate = 0; // "meist nichts oder maximal 1" - V1 default: nothing
  else toGenerate = 0;

  const generated = [];
  for (let i = 0; i < toGenerate; i += 1) {
    const instance = generateMissionInstance({ seed: Date.now() + i });
    if (!instance) break;
    deliverMissionInstance(instance);
    generated.push(instance);
  }
  return generated;
}

// Convenience hook to be called wherever an existing mission (main, side,
// or procedural) is completed, so the batch replenishes without any
// separate "check on load" logic (item 20).
export function notifyMissionCompleted() {
  return maybeGenerateBatch('mission_completed');
}

// ============================================================================
// Runtime adapter (executes commands against the stored device, evaluates
// success, manages hints) - mirrors missionV2.js's executeMissionCommand /
// evaluateMainMission, but is template-driven and domain-agnostic at the
// top level. Reuses ciscoCliEngine.js exclusively for command parsing
// (item 16) - no custom command logic here.
// ============================================================================

export function loadProceduralRuntimeState(instanceId) {
  const instance = getInstance(instanceId);
  if (!instance) return null;
  return {
    instanceId,
    templateId: instance.templateId,
    device: instance.device,
    params: instance.resolvedParameters,
    archetype: instance.archetype,
    difficulty: instance.difficulty,
    showCommandsUsed: instance.showCommandsUsed || [],
    hintState: createHintState(Object.values(getTemplate(instance.templateId)?.hintDefinitions || {})),
    hintsConsumed: instance.hintsUsed || [],
    solutionRevealedFor: instance.solutionRevealedFor || [],
    attempts: instance.attempts || 0,
    completed: instance.completedState?.completed || false,
  };
}

function persistRuntimeState(state) {
  const instance = getInstance(state.instanceId);
  if (!instance) return;
  instance.device = state.device;
  instance.showCommandsUsed = state.showCommandsUsed;
  instance.hintsUsed = state.hintsConsumed;
  instance.solutionRevealedFor = state.solutionRevealedFor;
  instance.attempts = state.attempts;
  instance.completedState = { completed: state.completed, completedAt: state.completed ? Date.now() : null };
  saveInstance(instance);
}

export function acceptProceduralMission(instanceId) {
  const instance = getInstance(instanceId);
  if (!instance) return null;
  if (!instance.acceptedState.accepted) {
    instance.acceptedState = { accepted: true, acceptedAt: Date.now() };
  }
  instance.status = 'accepted';
  saveInstance(instance);
  updateMissionStatus(instanceId, MissionStatus.ACCEPTED);
  return instance;
}

export function startProceduralMission(instanceId) {
  const instance = acceptProceduralMission(instanceId);
  if (!instance) return null;
  instance.status = 'active';
  saveInstance(instance);
  updateMissionStatus(instanceId, MissionStatus.IN_PROGRESS);
  return loadProceduralRuntimeState(instanceId);
}

// Leaving the mission (without completing) does NOT clear or reroll it -
// it stays exactly as-is and remains reachable via its original delivery
// (item 5, reused from the Phase 1G world-flow rules).
export function markProceduralMissionRead(instanceId) {
  const instance = getInstance(instanceId);
  if (!instance) return null;
  instance.readState = { read: true, readAt: Date.now() };
  saveInstance(instance);
  return instance;
}

export function declineProceduralMission(instanceId) {
  const instance = getInstance(instanceId);
  if (!instance) return null;
  instance.status = 'declined';
  saveInstance(instance);
  return instance;
}

export function executeProceduralMissionCommand(state, input) {
  const result = executeCommand(state.device, input, { helpCompact: true });
  if (result.isHelp) return { ...result, state };

  if (result.success) {
    const cmd = result.command?.toLowerCase() || '';
    if (cmd.startsWith('show ') || cmd.startsWith('do show ')) {
      state.showCommandsUsed.push(cmd);
    }
  }

  state.attempts += 1;
  persistRuntimeState(state);
  return { ...result, state };
}

export function getProceduralMissionProgress(state) {
  const template = getTemplate(state.templateId);
  if (!template) return { completed: 0, total: 0, checks: [], allCorrect: false };
  return template.evaluate(state.device, state.params, state.archetype, state);
}

// Records one skill event per requirement check, honoring the hint/solution
// rules (item 4, 5): revealedSolution never counts as positive mastery,
// usedHint reduces (but does not zero out) the credited success.
export function evaluateProceduralMission(state) {
  const progress = getProceduralMissionProgress(state);
  const instance = getInstance(state.instanceId);
  const skillPath = instance?.skillIds?.[0];

  if (skillPath) {
    const [domainId, skillId, subskillId] = skillPath.split('.');
    const usedHint = state.hintsConsumed.length > 0;
    const revealedSolution = state.solutionRevealedFor.length > 0;
    recordSkillEvent(domainId, skillId, subskillId, {
      dimension: SKILL_DIMENSION.CONFIGURE,
      correct: progress.allCorrect,
      usedHint,
      revealedSolution,
      difficulty: { easy: 1, medium: 3, hard: 5 }[state.difficulty] || 2,
      source: SKILL_SOURCE.PROCEDURAL,
      missionId: proceduralMissionId(state.instanceId),
    });
  }

  if (progress.allCorrect) {
    state.completed = true;
    updateMissionStatus(state.instanceId, MissionStatus.COMPLETED);
    const instanceRef = getInstance(state.instanceId);
    if (instanceRef) {
      instanceRef.status = 'completed';
      saveInstance(instanceRef);
    }
    notifyMissionCompleted();
  }

  persistRuntimeState(state);
  return { ...progress, state };
}

// UI helper: the selectable requirement/hint options for a template, with
// human-readable labels reused directly from the skill-tree catalog (no
// duplicated label strings).
export function getProceduralRequirementOptions(templateId) {
  const template = getTemplate(templateId);
  if (!template) return [];
  const labelByPath = Object.fromEntries(listAllSubskills('cisco').map((s) => [s.path, s.label]));
  return Object.keys(template.hintDefinitions || {}).map((path) => ({ id: path, label: labelByPath[path] || path }));
}

export function getProceduralMissionHint(state, subskillPath) {
  const template = getTemplate(state.templateId);
  const ladder = template?.hintDefinitions?.[subskillPath];
  if (!ladder) return null;
  const next = getNextHint(state.hintState, subskillPath);
  if (!next) return null;
  return { level: next.level, label: HINT_LEVEL_LABELS[next.level], text: next.text, explanation: next.explanation, requirementId: subskillPath };
}

export function consumeProceduralMissionHint(state, subskillPath) {
  const template = getTemplate(state.templateId);
  const ladder = template?.hintDefinitions?.[subskillPath];
  if (!ladder) return state;
  const parts = subskillPath.split('.');
  state.hintState = consumeHint(state.hintState, subskillPath, parts[0], parts[1], parts.slice(2).join('.'));
  state.hintsConsumed.push({ subskillPath, at: Date.now() });
  persistRuntimeState(state);
  return state;
}

export function revealProceduralMissionSolution(state, subskillPath) {
  const template = getTemplate(state.templateId);
  const ladder = template?.hintDefinitions?.[subskillPath];
  if (!ladder) return { state };
  const parts = subskillPath.split('.');
  const step = ladder.steps.find((s) => s.level === 4);
  const answer = step?.text || '';
  const explanation = step?.explanation || '';
  state.hintState = revealSolution(state.hintState, subskillPath, parts[0], parts[1], parts.slice(2).join('.'), { answer, explanation });
  state.solutionRevealedFor.push({ subskillPath, answer, at: Date.now() });
  persistRuntimeState(state);
  return { state, answer, explanation };
}

// ============================================================================
// Test/debug helpers
// ============================================================================

export function __resetProceduralState() {
  writeInstances({});
  localStorage.removeItem(HISTORY_KEY);
  writeScheduler({ completedSinceLastBatch: 0, contentEndAnnounced: false });
}

export { readNotifications as __readNotificationsForTest };
