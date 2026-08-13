// Phase 1E: Credential continuity tests.
// Verifies that player-created credentials from Mission 001 are stored as
// in-game "known credentials" and that later missions can resolve them,
// while a fresh device does not magically contain them.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}

const storage = new Storage();
global.localStorage = storage;
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  speechSynthesis: null,
};

const { pathToFileURL } = await import('node:url');

const {
  startMission001, executeMissionCommand, evaluateMission001, MISSION_001_ID,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const { executeCommand } = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);
const { completeQuest } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const {
  recordKnownCredentialsFromMission001, getKnownCredentials, formatCredentialTemplate, hasKnownCredentials,
} = await import(pathToFileURL(join(srcDir, 'lib/credentials.js')).href);
const { generateSideMission003, createSide003Device, getSide003Progress } = await import(pathToFileURL(join(srcDir, 'lib/ciscoSideMissions.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('Mission 001 records known credentials');
{
  storage.clear();
  const mission = startMission001();
  const p = mission.scenario.parameters;
  const commands = [
    'enable',
    'configure terminal',
    `hostname ${p.targetHostname}`,
    `enable secret ${p.enableSecret}`,
    `username ${p.username} secret ${p.userSecret}`,
    'no ip domain-lookup',
    'end',
    'copy running-config startup-config',
  ];
  for (const cmd of commands) {
    const result = executeMissionCommand(mission, cmd);
    assert(result.success, `Command should succeed: ${cmd}`);
  }
  assert(evaluateMission001(mission).allCorrect, 'Mission 001 should be complete');

  const recorded = recordKnownCredentialsFromMission001(mission.device, mission.scenario);
  test('enable secret stored', () => assert(recorded.enableSecret === p.enableSecret));
  test('local admin username stored', () => assert(recorded.localAdminUsername === p.username));
  test('local admin password stored', () => assert(recorded.localAdminPassword === p.userSecret));

  completeQuest({ id: MISSION_001_ID }, { xp: 60, reputation: { network: 5, management: 3 } });
  const known = getKnownCredentials();
  test('known credentials survive in gameState', () => {
    assert(known.enableSecret === p.enableSecret);
    assert(known.localAdminUsername === p.username);
    assert(known.localAdminPassword === p.userSecret);
  });
}

console.log('\nKnown credential placeholders resolved');
{
  const known = getKnownCredentials();
  const text = 'User [username] hat Passwort [password] und enable secret [enableSecret].';
  const resolved = formatCredentialTemplate(text, known);
  test('placeholders replaced', () => {
    assert(!resolved.includes('[username]'));
    assert(!resolved.includes('[password]'));
    assert(!resolved.includes('[enableSecret]'));
    assert(resolved.includes(known.localAdminUsername));
    assert(resolved.includes(known.localAdminPassword));
    assert(resolved.includes(known.enableSecret));
  });
}

console.log('\nSide Mission 003 uses known credentials');
{
  const scenario = generateSideMission003(12345);
  test('side-003 username equals known admin username', () => {
    assert(scenario.parameters.username === getKnownCredentials().localAdminUsername);
  });
  test('side-003 userSecret equals known admin password', () => {
    assert(scenario.parameters.userSecret === getKnownCredentials().localAdminPassword);
  });

  const device = createSide003Device(scenario);
  test('fresh device already contains the known user', () => {
    assert(device.runningConfig.users[scenario.parameters.username], 'known user should exist on the device');
  });

  const before = getSide003Progress(device, scenario);
  assert(before.checks.find((c) => c.id === 'auth_fixed').ok === false, 'login local not yet active');
  executeCommand(device, 'configure terminal');
  executeCommand(device, 'line console 0');
  executeCommand(device, 'login local');
  executeCommand(device, 'end');
  executeCommand(device, 'copy running-config startup-config');
  const after = getSide003Progress(device, scenario);
  test('side-003 completes with known user and login local', () => assert(after.allCorrect === true));
}

console.log('\nFresh state has no known credentials');
{
  storage.clear();
  const known = getKnownCredentials();
  test('no known credentials initially', () => assert(hasKnownCredentials() === false));
  test('template falls back to placeholder markers', () => {
    const resolved = formatCredentialTemplate('[username] / [password]', known);
    assert(resolved.includes('???'));
  });

  const scenario = generateSideMission003(99999);
  test('fallback username generated when no known credentials', () => {
    assert(scenario.parameters.username !== getKnownCredentials().localAdminUsername);
  });
}

console.log(`\n${passed} tests passed`);
