// Phase 1J: Verify procedural generator unlocks after HM2 and the routing
// main mission (cisco-main-004, renumbered from cisco-main-003 in Phase 1J.3).
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
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const { pathToFileURL } = await import('node:url');
const {
  getTemplate,
} = await import(pathToFileURL(join(srcDir, 'lib/missionTemplateEngine.js')).href);
const {
  generatableSkillPaths, generateMissionInstance, maybeGenerateBatch, getOpenInstances, isTemplateUnlocked,
} = await import(pathToFileURL(join(srcDir, 'lib/missionGenerator.js')).href);
const { completeQuest } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const { MISSION_001_ID, MISSION_002_ID, MISSION_004_ID } = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);

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

const stage2Templates = ['cisco-vlan-access-range', 'cisco-vlan-move', 'cisco-trunk-uplink', 'cisco-trunk-allowed-vlan'];
const stage3Templates = ['cisco-router-on-a-stick', 'cisco-router-fault'];

function makeState(completedQuests) {
  storage.clear();
  completeQuest({ id: 'tutorial' }, { xp: 0 });
  for (const q of completedQuests) completeQuest({ id: q }, { xp: 0 });
}

console.log('Template unlock logic');
{
  makeState([]);
  for (const id of stage2Templates) {
    test(`${id} locked before HM1`, () => assert(!isTemplateUnlocked(getTemplate(id))));
  }

  makeState([MISSION_001_ID, MISSION_002_ID]);
  for (const id of stage2Templates) {
    test(`${id} unlocked after HM2`, () => assert(isTemplateUnlocked(getTemplate(id))));
  }
  for (const id of stage3Templates) {
    test(`${id} locked before routing mission (HM4)`, () => assert(!isTemplateUnlocked(getTemplate(id))));
  }

  makeState([MISSION_001_ID, MISSION_002_ID, MISSION_004_ID]);
  for (const id of stage3Templates) {
    test(`${id} unlocked after routing mission (HM4)`, () => assert(isTemplateUnlocked(getTemplate(id))));
  }
}

console.log('\nGeneratable skill paths');
{
  makeState([MISSION_001_ID]);
  const pathsAfter1 = generatableSkillPaths();
  test('no routing paths after HM1', () => assert(!pathsAfter1.some((p) => p.startsWith('cisco.routing'))));

  makeState([MISSION_001_ID, MISSION_002_ID]);
  const pathsAfter2 = generatableSkillPaths();
  test('switching paths after HM2', () => assert(pathsAfter2.some((p) => p.includes('switching'))));
  test('no routing paths after HM2', () => assert(!pathsAfter2.some((p) => p.startsWith('cisco.routing'))));

  makeState([MISSION_001_ID, MISSION_002_ID, MISSION_004_ID]);
  const pathsAfter3 = generatableSkillPaths();
  test('routing paths after routing mission (HM4)', () => assert(pathsAfter3.some((p) => p.startsWith('cisco.routing'))));
}

console.log('\nGenerated instances respect unlocks');
{
  makeState([MISSION_001_ID]);
  for (let i = 0; i < 20; i += 1) {
    maybeGenerateBatch('test');
  }
  test('no stage-2 instances before HM2', () => {
    const open = getOpenInstances();
    assert(open.every((inst) => !stage2Templates.includes(inst.templateId)), `found ${open.map((i) => i.templateId)}`);
  });

  makeState([MISSION_001_ID, MISSION_002_ID]);
  let foundStage2 = false;
  for (let i = 0; i < 50; i += 1) {
    generateMissionInstance({ seed: Date.now() + i * 1000 });
    if (getOpenInstances().some((inst) => stage2Templates.includes(inst.templateId))) {
      foundStage2 = true;
      break;
    }
  }
  test('stage-2 instances can generate after HM2', () => assert(foundStage2));
  test('no stage-3 instances after HM2', () => {
    const open = getOpenInstances();
    assert(open.every((inst) => !stage3Templates.includes(inst.templateId)), `found ${open.map((i) => i.templateId)}`);
  });

  makeState([MISSION_001_ID, MISSION_002_ID, MISSION_004_ID]);
  let foundStage3 = false;
  for (let i = 0; i < 50; i += 1) {
    generateMissionInstance({ seed: Date.now() + i * 10000 });
    if (getOpenInstances().some((inst) => stage3Templates.includes(inst.templateId))) {
      foundStage3 = true;
      break;
    }
  }
  test('stage-3 instances can generate after routing mission (HM4)', () => assert(foundStage3));
}

console.log(`\n${passed} tests passed`);
