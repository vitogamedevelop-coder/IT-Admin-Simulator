import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const component = readFileSync(join(__dirname, '..', 'src', 'components', 'CiscoNetworkStatePanel.jsx'), 'utf8');
const mission = readFileSync(join(__dirname, '..', 'src', 'pages', 'MissionV2.jsx'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(component.includes('device.runningConfig'), 'System model must derive state from the simulated device');
assert(component.includes('device.startupConfig'), 'System model must reflect persistence state');
assert(component.includes('administrativelyDown'), 'System model must distinguish administrative shutdown');
assert(component.includes('operationalStatus'), 'System model must reflect operational link state');
assert(component.includes('errDisabled'), 'System model must expose observable error-disabled state');
assert(component.includes('switchportMode'), 'System model must reflect configured port mode');
assert(component.includes('trunkAllowedVlans'), 'System model must reflect current trunk VLAN state');
assert(component.includes('encapsulationVlan'), 'System model must reflect current 802.1Q subinterfaces');
assert(component.includes('ipDefaultGateway'), 'System model must reflect the configured management gateway');
assert(component.includes('Beobachteter Zustand · keine Musterlösung'), 'Panel must explain that it exposes state, not the solution');
assert(!component.includes('correctAnswer') && !component.includes('solution:'), 'System model must not embed answer or solution data');
assert(mission.includes('<CiscoNetworkStatePanel device={device} scenario={scenario} />'), 'Desktop mission must render the live system model');
assert(mission.includes('<CiscoNetworkStatePanel device={device} scenario={scenario} compact />'), 'Mobile mission must offer a compact system model');
assert(mission.includes('Live-System anzeigen'), 'Mobile system model must be explicitly expandable');

console.log('Cisco visible system model contract OK');
