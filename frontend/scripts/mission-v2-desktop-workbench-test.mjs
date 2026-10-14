import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mission = readFileSync(join(__dirname, '..', 'src', 'pages', 'MissionV2.jsx'), 'utf8');
const workspace = readFileSync(join(__dirname, '..', 'src', 'pages', 'Workspace.jsx'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(mission.includes('lg:grid-cols-[minmax(280px,0.72fr)_minmax(560px,1.65fr)_minmax(280px,0.78fr)]'), 'Mission must provide a three-column desktop workbench');
assert(mission.includes('Einsatzbriefing'), 'Desktop workbench must keep the briefing visible');
assert(mission.includes('Abnahmekriterien'), 'Desktop workbench must expose live acceptance criteria');
assert(mission.includes('Cisco IOS Terminal'), 'Desktop workbench must prioritize the IOS terminal');
assert(mission.includes('Tab: vervollständigen · ?: Hilfe · ↑/↓: Verlauf'), 'Desktop workbench must expose real CLI affordances');
assert(mission.includes('Belohnt wird ein nachweislich funktionierender Zustand'), 'Reward copy must reinforce outcome-based problem solving');
assert(mission.includes('runtime.reward.xp'), 'Mission reward must be visible before completion');
assert(mission.includes("isMainMission(missionId) ? 'Hauptmission' : 'Nebenmission'"), 'Every authored main mission must be labeled as a main mission');
assert(mission.includes('progress.total - progress.completed'), 'Incomplete mission feedback must name remaining criteria');
assert(workspace.includes('sm:grid-cols-6 lg:grid-cols-8'), 'NEXUS desktop must make use of desktop width');
assert(workspace.includes('lg:h-14 lg:w-14'), 'NEXUS desktop icons must scale for pointer use');

console.log('Mission V2 desktop workbench contract OK');
