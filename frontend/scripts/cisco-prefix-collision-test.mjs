import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { createCiscoDevice, executeCommand, getCommandHelp, completeInput, renderRunningConfig, CLI_ERROR } from '../src/lib/ciscoCliEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// localStorage/window stub so skillTree calls don't crash in Node
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = { dispatchEvent: () => {} };

const { BASE_COMMAND_TREE } = await import(pathToFileURL(join(__dirname, '../src/lib/ciscoCliEngine.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isArgumentWildcard(keyword) {
  return keyword.startsWith('<') && keyword.endsWith('>');
}

function setCliContext(device, mode) {
  device.cli.currentInterface = null;
  device.cli.currentInterfaceRange = null;
  device.cli.currentVlanId = null;
  device.cli.currentLine = null;

  if (mode === 'INTERFACE_CONFIG') {
    device.cli.currentInterface = Object.keys(device.runningConfig.interfaces)[0];
  } else if (mode === 'INTERFACE_RANGE_CONFIG') {
    device.cli.currentInterfaceRange = Object.keys(device.runningConfig.interfaces).slice(0, 2);
  } else if (mode === 'VLAN_CONFIG') {
    device.runningConfig.vlans[10] = device.runningConfig.vlans[10] || { id: 10, name: 'VLAN0010' };
    device.cli.currentVlanId = 10;
  } else if (mode === 'LINE_CONSOLE_CONFIG') {
    device.cli.currentLine = 'console';
  } else if (mode === 'LINE_VTY_CONFIG') {
    device.cli.currentLine = 'vty';
  }
}

function collectKeywords(nodes) {
  return (nodes || [])
    .filter((n) => !isArgumentWildcard(n.keyword))
    .map((n) => n.keyword);
}

function allConcreteKeywords(nodes) {
  return (nodes || []).filter((n) => !isArgumentWildcard(n.keyword));
}

function testSiblings(device, mode, path, siblings) {
  const keywords = collectKeywords(siblings);
  for (const keyword of keywords) {
    const pathPrefix = path ? `${path} /` : 'root';
    for (let len = 1; len <= keyword.length; len += 1) {
      const prefix = keyword.slice(0, len);
      const exactMatches = keywords.filter((k) => k === prefix).length;
      const prefixMatches = keywords.filter((k) => k.startsWith(prefix) && k !== prefix).length;
      const expected = exactMatches >= 1 ? 'exact' : prefixMatches === 0 ? 'none' : prefixMatches === 1 ? 'unique' : 'ambiguous';

      device.cli.mode = mode;
      setCliContext(device, mode);

      const fullInput = path ? `${path} ${prefix}` : prefix;
      const result = executeCommand(device, fullInput);
      let actual;
      if (result.success) actual = 'exact';
      else if (result.errorType === CLI_ERROR.AMBIGUOUS_COMMAND) actual = 'ambiguous';
      else if (result.errorType === CLI_ERROR.UNKNOWN_COMMAND) actual = 'none';
      else if (result.errorType === CLI_ERROR.INCOMPLETE_COMMAND) actual = 'exact';
      else actual = `other(${result.errorType})`;

      const expectedDescription = `${pathPrefix} "${prefix}" (from ${keyword}) should be ${expected}`;
      if (expected === 'ambiguous') {
        assert(actual === 'ambiguous', `${expectedDescription}, got ${actual}`);
      } else if (expected === 'unique') {
        assert(actual === 'exact', `${expectedDescription}, got ${actual}`);
      } else if (expected === 'none') {
        assert(actual === 'none', `${expectedDescription}, got ${actual}`);
      } else if (expected === 'exact') {
        assert(actual === 'exact', `${expectedDescription}, got ${actual}`);
      }
    }
  }
}

function testHelpAndTab(device, mode, path, siblings) {
  const keywords = collectKeywords(siblings);

  for (const keyword of keywords) {
    // Pick the shortest ambiguous prefix if one exists.
    for (let len = 1; len <= keyword.length; len += 1) {
      const prefix = keyword.slice(0, len);
      const exactMatches = keywords.filter((k) => k === prefix).length;
      const prefixMatches = keywords.filter((k) => k.startsWith(prefix) && k !== prefix).length;
      if (exactMatches === 0 && prefixMatches > 1) {
        device.cli.mode = mode;
        setCliContext(device, mode);
        const fullHelp = path ? `${path} ${prefix}?` : `${prefix}?`;
        const help = getCommandHelp(device, fullHelp);
        assert(help.isHelp, `Partial word help for "${fullHelp}" should return help (path: ${path})`);
        const rendered = help.help.toLowerCase().split(/\s+/).filter(Boolean);
        const expectedMatches = keywords.filter((k) => k.startsWith(prefix));
        for (const match of expectedMatches) {
          assert(rendered.includes(match), `Partial help for "${fullHelp}" should contain ${match}`);
        }
        device.cli.mode = mode;
        setCliContext(device, mode);
        const fullTab = path ? `${path} ${prefix}` : prefix;
        const tab = completeInput(device, fullTab);
        assert(!tab.completion && tab.suggestions.length > 1, `Tab on ambiguous "${fullTab}" should not auto-complete (path: ${path})`);
      }
      if (exactMatches === 0 && prefixMatches === 1) {
        device.cli.mode = mode;
        setCliContext(device, mode);
        const fullTab = path ? `${path} ${prefix}` : prefix;
        const tab = completeInput(device, fullTab);
        assert(tab.completion, `Tab on unique "${fullTab}" should complete (path: ${path})`);
      }
    }

    // Syntax help after unique keyword.
    device.cli.mode = mode;
    setCliContext(device, mode);
    const fullSyntax = path ? `${path} ${keyword} ?` : `${keyword} ?`;
    const help = getCommandHelp(device, fullSyntax);
    assert(help.isHelp, `Syntax help for "${fullSyntax}" should return help (path: ${path})`);

    // Tab on exact keyword should complete and add a space.
    device.cli.mode = mode;
    setCliContext(device, mode);
    const fullTab = path ? `${path} ${keyword}` : keyword;
    const tab = completeInput(device, fullTab);
    assert(tab.completion, `Tab on exact "${fullTab}" should complete (path: ${path})`);
  }
}

function walkTree(device, mode, path, nodes) {
  const siblings = allConcreteKeywords(nodes);
  testSiblings(device, mode, path, siblings);
  testHelpAndTab(device, mode, path, siblings);

  for (const node of siblings) {
    if (node.children && node.children.length > 0) {
      walkTree(device, mode, `${path ? `${path} ` : ''}${node.keyword}`, node.children);
    }
  }
}

const device = createCiscoDevice({ type: 'switch', hostname: 'Sw1' });

for (const [mode, tree] of Object.entries(BASE_COMMAND_TREE)) {
  device.cli.mode = mode;
  setCliContext(device, mode);
  walkTree(device, mode, '', tree);
}

console.log('Prefix collision, help and tab tests passed across all CLI modes.');

// ============================================================================
// Phase 1F: functional coverage for VLAN / interface range / switchport / show
// ============================================================================

function run(dev, input) {
  return executeCommand(dev, input);
}

const fdev = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: 'Sw2' });

// vlan / name
let r = run(fdev, 'enable');
assert(r.success, 'enable should succeed');
r = run(fdev, 'configure terminal');
assert(r.success, 'configure terminal should succeed');
r = run(fdev, 'vlan 10');
assert(r.success && fdev.cli.mode === 'VLAN_CONFIG', 'vlan 10 should enter VLAN_CONFIG mode');
r = run(fdev, 'name PERSONAL');
assert(r.success, 'name should succeed inside vlan config');
assert(fdev.runningConfig.vlans[10].name === 'PERSONAL', 'vlan 10 name should be PERSONAL');
r = run(fdev, 'exit');
assert(r.success && fdev.cli.mode === 'GLOBAL_CONFIG', 'exit should return to GLOBAL_CONFIG');

r = run(fdev, 'vlan 999');
run(fdev, 'name UNUSED');
run(fdev, 'end');
assert(fdev.cli.mode === 'PRIVILEGED_EXEC', 'end from vlan config should return to PRIVILEGED_EXEC');

const runningConfig = renderRunningConfig(fdev);
assert(runningConfig.includes('vlan 10'), 'running-config should include vlan 10');
assert(runningConfig.includes(' name PERSONAL'), 'running-config should include vlan 10 name');
assert(runningConfig.includes('vlan 999'), 'running-config should include vlan 999');
assert(runningConfig.includes(' name UNUSED'), 'running-config should include vlan 999 name');

// interface fa0/1 (single interface, prefix form)
run(fdev, 'configure terminal');
r = run(fdev, 'interface fa0/1');
assert(r.success && fdev.cli.mode === 'INTERFACE_CONFIG', 'interface fa0/1 should enter INTERFACE_CONFIG');
assert(fdev.cli.currentInterface === 'FastEthernet0/1', 'interface fa0/1 should resolve to FastEthernet0/1');

// switchport mode access / switchport access vlan
r = run(fdev, 'switchport mode access');
assert(r.success, 'switchport mode access should succeed');
r = run(fdev, 'switchport access vlan 10');
assert(r.success, 'switchport access vlan 10 should succeed');
assert(fdev.runningConfig.interfaces['FastEthernet0/1'].accessVlan === 10, 'FastEthernet0/1 should be assigned to vlan 10');

// switchport access vlan should auto-create a vlan that does not exist yet
r = run(fdev, 'switchport access vlan 55');
assert(r.success, 'switchport access vlan 55 should succeed even for a new vlan');
assert(fdev.runningConfig.vlans[55], 'vlan 55 should be auto-created');

// shutdown / no shutdown
r = run(fdev, 'shutdown');
assert(r.success, 'shutdown should succeed');
assert(fdev.runningConfig.interfaces['FastEthernet0/1'].administrativelyDown === true, 'interface should be administratively down');
assert(fdev.runningConfig.interfaces['FastEthernet0/1'].operationalStatus === 'disabled', 'interface operational status should be disabled');
r = run(fdev, 'no shutdown');
assert(r.success, 'no shutdown should succeed');
assert(fdev.runningConfig.interfaces['FastEthernet0/1'].administrativelyDown === false, 'interface should no longer be administratively down');
assert(fdev.runningConfig.interfaces['FastEthernet0/1'].operationalStatus === 'notconnect', 'interface operational status should be notconnect after no shutdown');
run(fdev, 'end');

// interface range fa0/1 - 4
run(fdev, 'configure terminal');
r = run(fdev, 'interface range fa0/1 - 4');
assert(r.success && fdev.cli.mode === 'INTERFACE_RANGE_CONFIG', 'interface range fa0/1 - 4 should enter INTERFACE_RANGE_CONFIG');
assert(fdev.cli.currentInterfaceRange.length === 4, 'interface range fa0/1 - 4 should target 4 interfaces');
r = run(fdev, 'switchport mode access');
assert(r.success, 'switchport mode access should succeed in interface range mode');
r = run(fdev, 'switchport access vlan 20');
assert(r.success, 'switchport access vlan 20 should succeed in interface range mode');
['FastEthernet0/1', 'FastEthernet0/2', 'FastEthernet0/3', 'FastEthernet0/4'].forEach((id) => {
  assert(fdev.runningConfig.interfaces[id].accessVlan === 20, `${id} should be assigned to vlan 20`);
  assert(fdev.runningConfig.interfaces[id].switchportMode === 'access', `${id} should be in access mode`);
});
r = run(fdev, 'shutdown');
assert(r.success, 'shutdown should succeed for interface range');
['FastEthernet0/1', 'FastEthernet0/2', 'FastEthernet0/3', 'FastEthernet0/4'].forEach((id) => {
  assert(fdev.runningConfig.interfaces[id].administrativelyDown === true, `${id} should be administratively down`);
});
run(fdev, 'end');

// interface range with a full type name should also work
run(fdev, 'configure terminal');
r = run(fdev, 'interface range fastethernet0/5 - 6');
assert(r.success && fdev.cli.mode === 'INTERFACE_RANGE_CONFIG', 'interface range fastethernet0/5 - 6 should enter INTERFACE_RANGE_CONFIG');
assert(fdev.cli.currentInterfaceRange.length === 2, 'interface range fastethernet0/5 - 6 should target 2 interfaces');
run(fdev, 'end');

// invalid interface range should be rejected
run(fdev, 'configure terminal');
r = run(fdev, 'interface range fa0/1 - 999');
assert(!r.success && r.errorType === CLI_ERROR.INVALID_ARGUMENT, 'interface range fa0/1 - 999 should be rejected as invalid');
run(fdev, 'end');

// show vlan brief / show interfaces status
r = run(fdev, 'show vlan brief');
assert(r.success, 'show vlan brief should succeed');
assert(r.output.includes('PERSONAL'), 'show vlan brief should include vlan 10 name');
assert(r.output.includes('Fa0/1'), 'show vlan brief should include Fa0/1 in a vlan port list');

r = run(fdev, 'show interfaces status');
assert(r.success, 'show interfaces status should succeed');
assert(r.output.includes('Fa0/1'), 'show interfaces status should include Fa0/1');
assert(r.output.includes('Gi0/1'), 'show interfaces status should include Gi0/1');
assert(r.output.includes('10/100BaseTX'), 'show interfaces status should include FastEthernet type');

console.log('Phase 1F VLAN / interface-range / switchport / show functional tests passed.');

// ============================================================================
// Phase 1F correction: trunk mode, switchport trunk allowed vlan, show
// interfaces trunk / switchport, and write/wr abbreviations.
// ============================================================================

const tdev = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: 'Sw2' });

// switchport mode trunk
run(tdev, 'enable');
run(tdev, 'configure terminal');
r = run(tdev, 'interface gi0/1');
assert(r.success && tdev.cli.mode === 'INTERFACE_CONFIG', 'interface gi0/1 should enter INTERFACE_CONFIG');
r = run(tdev, 'switchport mode trunk');
assert(r.success, 'switchport mode trunk should succeed');
assert(tdev.runningConfig.interfaces['GigabitEthernet0/1'].switchportMode === 'trunk', 'Gi0/1 should be in trunk mode');

// switchport trunk allowed vlan
r = run(tdev, 'switchport trunk allowed vlan 10,20');
assert(r.success, 'switchport trunk allowed vlan 10,20 should succeed');
assert(JSON.stringify(tdev.runningConfig.interfaces['GigabitEthernet0/1'].trunkAllowedVlans) === JSON.stringify([10, 20]), 'Gi0/1 trunk allowed vlans should be [10, 20]');
run(tdev, 'end');

const trunkRunningConfig = renderRunningConfig(tdev);
assert(trunkRunningConfig.includes('switchport mode trunk'), 'running-config should include switchport mode trunk');
assert(trunkRunningConfig.includes('switchport trunk allowed vlan 10,20'), 'running-config should include trunk allowed vlan list');

// show interfaces trunk / show interfaces <interface> switchport
r = run(tdev, 'show interfaces trunk');
assert(r.success, 'show interfaces trunk should succeed');
assert(r.output.includes('Gi0/1'), 'show interfaces trunk should list Gi0/1');
assert(r.output.includes('10,20'), 'show interfaces trunk should list the allowed vlans');

r = run(tdev, 'show interfaces gi0/1 switchport');
assert(r.success, 'show interfaces gi0/1 switchport should succeed');
assert(r.output.includes('Administrative Mode: trunk'), 'show interfaces gi0/1 switchport should report trunk mode');

r = run(tdev, 'show interfaces fa0/1 switchport');
assert(r.success, 'show interfaces fa0/1 switchport should succeed for an access port');
assert(r.output.includes('Access Mode VLAN'), 'show interfaces fa0/1 switchport should report access mode for a non-trunk port');

r = run(tdev, 'show interfaces fa0/99 switchport');
assert(!r.success && r.errorType === CLI_ERROR.INVALID_ARGUMENT, 'show interfaces fa0/99 switchport should fail for a non-existent interface');

// write / wr abbreviations - all equivalent ways to persist the config.
function freshWriteDevice() {
  const d = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: 'Sw2' });
  run(d, 'enable');
  run(d, 'configure terminal');
  run(d, 'hostname Sw2');
  run(d, 'end');
  return d;
}

let wdev = freshWriteDevice();
assert(wdev.startupConfig === null, 'startupConfig should start as null');
r = run(wdev, 'write');
assert(r.success, '"write" alone should be accepted as a valid save command');
assert(wdev.startupConfig !== null, '"write" should persist the running-config to startupConfig');

wdev = freshWriteDevice();
r = run(wdev, 'write memory');
assert(r.success, '"write memory" should still be accepted');
assert(wdev.startupConfig !== null, '"write memory" should persist the running-config to startupConfig');

wdev = freshWriteDevice();
r = run(wdev, 'wr');
assert(r.success, '"wr" should still be accepted as a unique shortcut');
assert(wdev.startupConfig !== null, '"wr" should persist the running-config to startupConfig');

wdev = freshWriteDevice();
r = run(wdev, 'copy running-config startup-config');
assert(r.success, '"copy running-config startup-config" should still be accepted');
assert(wdev.startupConfig !== null, '"copy running-config startup-config" should persist the running-config to startupConfig');

// "do write" must work from every configuration sub-mode.
function assertDoWriteWorksFrom(setup) {
  const d = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: 'Sw2' });
  run(d, 'enable');
  run(d, 'configure terminal');
  setup(d);
  const modeBefore = d.cli.mode;
  const result = run(d, 'do write');
  assert(result.success, `"do write" should succeed from ${modeBefore}`);
  assert(d.startupConfig !== null, `"do write" should persist config from ${modeBefore}`);
  assert(d.cli.mode === modeBefore, `"do write" should not change the current mode (${modeBefore})`);
}

assertDoWriteWorksFrom(() => {}); // GLOBAL_CONFIG
assertDoWriteWorksFrom((d) => run(d, 'interface fa0/1')); // INTERFACE_CONFIG
assertDoWriteWorksFrom((d) => run(d, 'interface range fa0/1 - 2')); // INTERFACE_RANGE_CONFIG
assertDoWriteWorksFrom((d) => run(d, 'vlan 50')); // VLAN_CONFIG

console.log('Phase 1F correction: trunk mode, switchport trunk allowed vlan, show interfaces trunk/switchport, and write/wr abbreviations passed.');

// ============================================================================
// Phase 1G fix: "switchport trunk allowed vlan" must NEVER create VLANs.
// ============================================================================

const avdev = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: 'Sw2' });
run(avdev, 'enable');
run(avdev, 'configure terminal');
// Only VLAN 10 is actually created; VLAN 20 is deliberately left out.
run(avdev, 'vlan 10');
run(avdev, 'name PERSONAL');
run(avdev, 'exit');
r = run(avdev, 'interface gi0/1');
assert(r.success, 'interface gi0/1 should succeed');
r = run(avdev, 'switchport mode trunk');
assert(r.success, 'switchport mode trunk should succeed');
r = run(avdev, 'switchport trunk allowed vlan 10,20,30');
assert(r.success, 'switchport trunk allowed vlan 10,20,30 should succeed even though 20/30 do not exist yet');

assert(avdev.runningConfig.vlans[10], 'VLAN 10 still exists (it was created explicitly)');
assert(!avdev.runningConfig.vlans[20], 'VLAN 20 must NOT be auto-created by "switchport trunk allowed vlan"');
assert(!avdev.runningConfig.vlans[30], 'VLAN 30 must NOT be auto-created by "switchport trunk allowed vlan"');
assert(
  JSON.stringify(avdev.runningConfig.interfaces['GigabitEthernet0/1'].trunkAllowedVlans) === JSON.stringify([10, 20, 30]),
  'the allowed-vlan list on the interface is still configured with all three IDs',
);
run(avdev, 'end');

const avRunningConfig = renderRunningConfig(avdev);
assert(avRunningConfig.includes('switchport trunk allowed vlan 10,20,30'), 'running-config reflects the configured allowed-vlan list as entered');
assert(!/^vlan 20$/m.test(avRunningConfig), 'running-config VLAN database section does not contain VLAN 20');
assert(!/^vlan 30$/m.test(avRunningConfig), 'running-config VLAN database section does not contain VLAN 30');

const avVlanBrief = run(avdev, 'show vlan brief').output;
assert(avVlanBrief.includes('PERSONAL'), 'show vlan brief lists the actually created VLAN 10');
assert(!avVlanBrief.includes('20   '), 'show vlan brief does not list the merely-allowed, never-created VLAN 20');

const avTrunk = run(avdev, 'show interfaces trunk').output;
assert(avTrunk.includes('Vlans allowed on trunk'), 'show interfaces trunk has an "allowed" section (configured, regardless of VLAN DB)');
assert(avTrunk.includes('Vlans allowed and active in management domain'), 'show interfaces trunk has an "active" section (intersected with the VLAN DB)');
const [allowedBlock, activeBlock] = avTrunk.split('Vlans allowed and active in management domain');
assert(allowedBlock.includes('Gi0/1       10,20,30'), 'the "allowed" section shows all three configured IDs, including the non-existent ones');
assert(activeBlock.trim() === 'Gi0/1       10', 'the "active" section only shows VLAN 10, since 20/30 were never created');

console.log('Phase 1G fix: switchport trunk allowed vlan no longer auto-creates VLANs; show interfaces trunk distinguishes allowed vs. active.');
