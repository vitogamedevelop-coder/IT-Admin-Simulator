import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, '..', 'src', 'components', 'EmailApp.jsx'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(source.includes('lg:grid-cols-[minmax(250px,0.72fr)_minmax(420px,1.35fr)_minmax(250px,0.72fr)]'), 'Desktop mail must use a three-column ticket workbench');
assert(source.includes('Posteingang'), 'Workbench must keep the inbox visible');
assert(source.includes('Auftragskontext'), 'Workbench must provide mission context');
assert(source.includes('Nächster Schritt'), 'Workbench must provide a clear next action');
assert(source.includes('Einsatz übernehmen'), 'Workbench must expose a focused primary action');
assert(source.includes('Einsatz fortsetzen'), 'Accepted missions must expose a resume action');
assert(source.includes("active ? 'hidden lg:flex' : 'flex'"), 'Mobile must keep the inbox/detail drill-down');
assert(source.includes("active ? 'flex' : 'hidden lg:flex'"), 'Desktop must preserve the detail pane while mobile hides an empty pane');
assert(source.includes('emailCompleted(active)'), 'Completion status must come from mission state');
assert(source.includes('isProceduralMissionId'), 'Procedural tickets must stay supported');
assert(source.includes('isMainMission'), 'Main mission routing must stay supported');
assert(source.includes('isCiscoSideMission'), 'Cisco side mission routing must stay supported');
assert(!source.includes('leaderboard') && !source.includes('streak'), 'Ticket flow must not add manipulative reward mechanics');

console.log('Email desktop ticket workbench contract OK');
