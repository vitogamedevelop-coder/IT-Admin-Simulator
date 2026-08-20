// Phase 9A - L2 Completion Audit
//
// Dedicated regression/negative-test suite for the Phase 9A additions:
//   - PortFast / BPDU Guard CLI commands + minimal err-disable simulation
//   - Native VLAN CLI command
//   - cisco-access-port-hardening mission template (BUILD/AUDIT/DIAGNOSE)
//   - cisco-trunk-native-vlan mission template (REPAIR/CHANGE/AUDIT)
//
// Run with: npx tsx scripts/phase9a-l2-completion-audit.mjs

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

const results = [];
function assert(condition, message) {
  results.push({ ok: !!condition, message });
  if (!condition) console.error(`  FAIL - ${message}`);
}

const {
  createCiscoDevice, executeCommand, simulateBpduReceived, renderSpanningTreeSummary, renderRunningConfig,
} = await import('../src/lib/ciscoCliEngine.js');
const {
  TEMPLATE_REGISTRY, MISSION_ARCHETYPE, seededRng,
} = await import('../src/lib/missionTemplateEngine.js');
const {
  startProceduralMission, executeProceduralMissionCommand, getProceduralMissionProgress,
} = await import('../src/lib/missionGenerator.js');

function runCli(device, commands) {
  for (const c of commands) {
    const r = executeCommand(device, c);
    if (r.error) throw new Error(`CLI error on "${c}": ${r.error}`);
  }
}

// ============================================================================
// A) CLI engine: PortFast / BPDU Guard / Native VLAN unit tests
// ============================================================================
console.log('A) CLI engine unit tests');
{
  const device = createCiscoDevice({ type: 'layer2_switch', hostname: 'Sw1', interfaces: ['FastEthernet0/1', 'FastEthernet0/2', 'GigabitEthernet0/1'] });
  runCli(device, [
    'enable', 'configure terminal',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'exit',
    'interface gi0/1', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20', 'switchport trunk native vlan 20', 'exit',
    'end',
  ]);
  const fa1 = device.runningConfig.interfaces['FastEthernet0/1'];
  const gi1 = device.runningConfig.interfaces['GigabitEthernet0/1'];
  assert(fa1.portfast === true, 'A1: spanning-tree portfast sets iface.portfast');
  assert(fa1.bpduGuard === true, 'A2: spanning-tree bpduguard enable sets iface.bpduGuard');
  assert(gi1.nativeVlan === 20, 'A3: switchport trunk native vlan sets iface.nativeVlan');

  const runningConfigText = renderRunningConfig(device);
  assert(runningConfigText.includes('spanning-tree portfast'), 'A4: running-config includes spanning-tree portfast');
  assert(runningConfigText.includes('spanning-tree bpduguard enable'), 'A5: running-config includes spanning-tree bpduguard enable');
  assert(runningConfigText.includes('switchport trunk native vlan 20'), 'A6: running-config includes switchport trunk native vlan');

  // Negation
  runCli(device, ['configure terminal', 'interface fa0/1', 'no spanning-tree portfast', 'no spanning-tree bpduguard enable', 'exit', 'interface gi0/1', 'no switchport trunk native vlan', 'exit', 'end']);
  assert(device.runningConfig.interfaces['FastEthernet0/1'].portfast === false, 'A7: no spanning-tree portfast clears the flag');
  assert(device.runningConfig.interfaces['FastEthernet0/1'].bpduGuard === false, 'A8: no spanning-tree bpduguard enable clears the flag');
  assert(device.runningConfig.interfaces['GigabitEthernet0/1'].nativeVlan === null, 'A9: no switchport trunk native vlan resets to default');

  // interface range variant
  const device2 = createCiscoDevice({ type: 'layer2_switch', hostname: 'Sw2', interfaces: ['FastEthernet0/1', 'FastEthernet0/2', 'FastEthernet0/3'] });
  runCli(device2, ['enable', 'configure terminal', 'interface range fa0/1 - 2', 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'exit', 'end']);
  assert(device2.runningConfig.interfaces['FastEthernet0/1'].portfast && device2.runningConfig.interfaces['FastEthernet0/2'].portfast, 'A10: spanning-tree portfast works via interface range');
  assert(!device2.runningConfig.interfaces['FastEthernet0/3'].portfast, 'A11: interface range does not affect ports outside the range');
}

// ============================================================================
// B) Minimal err-disable simulation
// ============================================================================
console.log('B) Err-disable simulation (BPDU Guard)');
{
  const device = createCiscoDevice({ type: 'layer2_switch', hostname: 'Sw1', interfaces: ['FastEthernet0/1'] });
  runCli(device, ['enable', 'configure terminal', 'interface fa0/1', 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'exit', 'end']);
  const before = simulateBpduReceived(device, 'FastEthernet0/1');
  assert(before === true, 'B1: simulateBpduReceived returns true for a BPDU-Guard-protected port');
  const iface = device.runningConfig.interfaces['FastEthernet0/1'];
  assert(iface.errDisabled === true, 'B2: port is marked err-disabled after receiving a BPDU');
  assert(iface.errDisableReason === 'bpduguard', 'B3: err-disable reason is recorded');

  const summary = renderSpanningTreeSummary(device);
  assert(summary.includes('err-disabled'), 'B4: show spanning-tree summary reports the err-disabled port');
  assert(summary.toLowerCase().includes('fa0/1'), 'B5: show spanning-tree summary names the affected port');

  // Recovery via shutdown / no shutdown
  runCli(device, ['configure terminal', 'interface fa0/1', 'shutdown', 'no shutdown', 'exit', 'end']);
  assert(device.runningConfig.interfaces['FastEthernet0/1'].errDisabled === false, 'B6: shutdown/no shutdown clears err-disable');

  // A port WITHOUT BPDU Guard must never be affected by simulateBpduReceived.
  const device2 = createCiscoDevice({ type: 'layer2_switch', hostname: 'Sw2', interfaces: ['FastEthernet0/1'] });
  const result = simulateBpduReceived(device2, 'FastEthernet0/1');
  assert(result === false, 'B7: simulateBpduReceived is a no-op without BPDU Guard');
  assert(device2.runningConfig.interfaces['FastEthernet0/1'].errDisabled === false, 'B8: port without BPDU Guard is never err-disabled');
}

// ============================================================================
// C) Negative tests (Phase 9A section 23)
// ============================================================================
console.log('C) Negative tests (section 23)');
{
  const template = TEMPLATE_REGISTRY['cisco-access-port-hardening'];
  const rng = seededRng(42);
  const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, template.contexts[0], 'medium');

  // A) PortFast on the correct access port -> correct
  {
    const { device } = template.buildDevice(params, MISSION_ARCHETYPE.BUILD);
    params.accessPorts.forEach((id) => {
      const iface = device.runningConfig.interfaces[id];
      iface.portfast = true;
      iface.bpduGuard = true;
    });
    const progress = template.evaluate(device, params, MISSION_ARCHETYPE.BUILD, { showCommandsUsed: [] });
    assert(progress.checks.find((c) => c.id === 'access_ports_hardened').ok === true, 'C-A: PortFast+BPDU Guard on correct access ports is accepted');
  }

  // B) PortFast on the uplink -> NOT accepted as a solution
  {
    const { device } = template.buildDevice(params, MISSION_ARCHETYPE.BUILD);
    params.accessPorts.forEach((id) => {
      const iface = device.runningConfig.interfaces[id];
      iface.portfast = true;
      iface.bpduGuard = true;
    });
    device.runningConfig.interfaces[params.uplinkPort].portfast = true;
    device.runningConfig.interfaces[params.uplinkPort].bpduGuard = true;
    const progress = template.evaluate(device, params, MISSION_ARCHETYPE.BUILD, { showCommandsUsed: [] });
    assert(progress.checks.find((c) => c.id === 'uplink_not_hardened').ok === false, 'C-B: PortFast/BPDU Guard on the uplink is rejected, not silently accepted');
    assert(progress.allCorrect === false, 'C-B2: overall mission is not solved while the uplink is misconfigured');
  }

  // C) BPDU Guard missing -> requirement open
  {
    const { device } = template.buildDevice(params, MISSION_ARCHETYPE.BUILD);
    params.accessPorts.forEach((id) => { device.runningConfig.interfaces[id].portfast = true; });
    const progress = template.evaluate(device, params, MISSION_ARCHETYPE.BUILD, { showCommandsUsed: [] });
    assert(progress.checks.find((c) => c.id === 'access_ports_hardened').ok === false, 'C-C: missing BPDU Guard keeps the requirement open even with PortFast set');
  }

  // D) BPDU Guard present (with PortFast) -> requirement fulfilled
  {
    const { device } = template.buildDevice(params, MISSION_ARCHETYPE.BUILD);
    params.accessPorts.forEach((id) => {
      device.runningConfig.interfaces[id].portfast = true;
      device.runningConfig.interfaces[id].bpduGuard = true;
    });
    const progress = template.evaluate(device, params, MISSION_ARCHETYPE.BUILD, { showCommandsUsed: [] });
    assert(progress.checks.find((c) => c.id === 'access_ports_hardened').ok === true, 'C-D: BPDU Guard + PortFast together fulfill the requirement');
  }

  // H) Pre-configuration already fully correct -> state immediately green (BUILD)
  {
    const { device } = template.buildDevice(params, MISSION_ARCHETYPE.BUILD);
    params.accessPorts.forEach((id) => {
      device.runningConfig.interfaces[id].portfast = true;
      device.runningConfig.interfaces[id].bpduGuard = true;
    });
    const progress = template.evaluate(device, params, MISSION_ARCHETYPE.BUILD, { showCommandsUsed: [] });
    assert(progress.allCorrect === true, 'C-H: fully pre-configured access-port hardening is immediately solved');
  }
}

{
  const template = TEMPLATE_REGISTRY['cisco-trunk-native-vlan'];
  const rng = seededRng(7);
  const params = template.resolveParameters(rng);

  // E) Native VLAN correct (and allowed VLANs correct) -> fulfilled
  {
    const { device } = template.buildDevice(params, MISSION_ARCHETYPE.REPAIR);
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    uplink.nativeVlan = params.targetNativeVlanId;
    uplink.trunkAllowedVlans = params.targetAllowedVlanIds;
    const progress = template.evaluate(device, params);
    assert(progress.checks.find((c) => c.id === 'native_vlan').ok === true, 'C-E: correct native VLAN is accepted');
    assert(progress.allCorrect === true, 'C-E2: fully correct trunk config is solved');
  }

  // F) Allowed VLAN correct, Native VLAN wrong -> NOT fulfilled
  {
    const { device } = template.buildDevice(params, MISSION_ARCHETYPE.REPAIR);
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    uplink.trunkAllowedVlans = params.targetAllowedVlanIds;
    uplink.nativeVlan = params.currentNativeVlanId; // still wrong
    const progress = template.evaluate(device, params);
    assert(progress.checks.find((c) => c.id === 'allowed_vlans').ok === true, 'C-F: allowed VLANs alone can be correct');
    assert(progress.checks.find((c) => c.id === 'native_vlan').ok === false, 'C-F2: wrong native VLAN is NOT accepted just because allowed VLANs are correct');
    assert(progress.allCorrect === false, 'C-F3: overall mission is not solved while native VLAN is wrong');
  }

  // G) Native VLAN correct, Allowed VLAN wrong -> corresponding trunk requirement NOT fulfilled
  {
    const { device } = template.buildDevice(params, MISSION_ARCHETYPE.REPAIR);
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    uplink.nativeVlan = params.targetNativeVlanId;
    uplink.trunkAllowedVlans = params.targetAllowedVlanIds.slice(0, 1); // incomplete
    const progress = template.evaluate(device, params);
    assert(progress.checks.find((c) => c.id === 'native_vlan').ok === true, 'C-G: native VLAN alone can be correct');
    assert(progress.checks.find((c) => c.id === 'allowed_vlans').ok === false, 'C-G2: incomplete allowed-VLAN list is NOT accepted just because native VLAN is correct');
    assert(progress.allCorrect === false, 'C-G3: overall mission is not solved while allowed VLANs are incomplete');
  }
}

// ============================================================================
// D) Mass test: templates x archetypes x seeds x preconfig states x reload
// ============================================================================
console.log('D) Mass test across seeds/archetypes/reload');
const NEW_TEMPLATE_IDS = ['cisco-access-port-hardening', 'cisco-trunk-native-vlan'];
for (const templateId of NEW_TEMPLATE_IDS) {
  const template = TEMPLATE_REGISTRY[templateId];
  for (const archetype of template.archetypes) {
    for (let seed = 1; seed <= 60; seed += 1) {
      storage.clear();
      const context = template.contexts[(seed - 1) % template.contexts.length];
      let state;
      let title;
      let briefing;
      try {
        const rng = seededRng(seed);
        const params = template.resolveParameters(rng, archetype, context, 'medium');
        const { device } = template.buildDevice(params, archetype);
        title = template.buildTitle(params, archetype, context, 'medium');
        briefing = template.buildBriefing(params, archetype, context, 'medium');
        const instanceId = `phase9a-${templateId}-${archetype}-${seed}`;
        const instance = {
          instanceId, templateId, seed, generatedAt: Date.now(), channel: 'email', skillIds: [],
          difficulty: 'medium', archetype, context, resolvedParameters: params, device,
          title, briefing, status: 'available',
          readState: { read: false, readAt: null }, acceptedState: { accepted: false, acceptedAt: null },
          completedState: { completed: false, completedAt: null }, attempts: 0, hintsUsed: [],
          solutionRevealedFor: [], showCommandsUsed: [],
        };
        storage.setItem('cyberlearn:procedural-instances-v1', JSON.stringify({ [instanceId]: instance }));
        state = startProceduralMission(instanceId);
      } catch (err) {
        assert(false, `${templateId}/${archetype}/seed${seed}: instance creation must not throw (${err.message})`);
        continue;
      }

      // Required params must never be undefined (no hidden state).
      const missing = (template.requiredResolvedParams || []).filter((k) => state.params[k] === undefined);
      assert(missing.length === 0, `${templateId}/${archetype}/seed${seed}: no missing required params (missing: ${missing.join(', ')})`);

      // Every interface referenced by the mission must appear in the briefing/title.
      const text = `${title} ${briefing}`.toLowerCase();
      const referencedPorts = [
        ...(state.params.accessPorts || []),
        state.params.uplinkPort,
        state.params.faultyPort,
      ].filter(Boolean);
      referencedPorts.forEach((port) => {
        const shortName = port.replace('FastEthernet', 'Fa').replace('GigabitEthernet', 'Gi').toLowerCase();
        const mentioned = text.includes(port.toLowerCase()) || text.includes(shortName);
        assert(mentioned, `${templateId}/${archetype}/seed${seed}: port ${port} must be mentioned in briefing/title (no hidden ports)`);
      });

      // Canonical solve + persistence/reload stability.
      const head = ['enable', 'configure terminal'];
      const tail = ['end', 'copy running-config startup-config'];
      const body = [];
      if (templateId === 'cisco-access-port-hardening') {
        state.params.accessPorts.forEach((port) => {
          body.push(`interface ${port}`, 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'exit');
        });
        if (archetype === 'diagnose') {
          body.unshift('do show spanning-tree summary');
          body.push(`interface ${state.params.faultyPort}`, 'shutdown', 'no shutdown', 'exit');
        }
      } else if (templateId === 'cisco-trunk-native-vlan') {
        body.push(
          `interface ${state.params.uplinkPort}`,
          `switchport trunk allowed vlan ${state.params.targetAllowedVlanIds.join(',')}`,
          `switchport trunk native vlan ${state.params.targetNativeVlanId}`,
          'no shutdown',
          'exit',
        );
      }
      const commands = [...head, ...body, ...tail];
      let current = state;
      for (const c of commands) {
        const result = executeProceduralMissionCommand(current, c);
        current = result.state;
      }
      const progress = getProceduralMissionProgress(current);
      assert(progress.allCorrect, `${templateId}/${archetype}/seed${seed}: canonical solver should reach allCorrect (checks: ${JSON.stringify(progress.checks)})`);

      // Reload from persisted storage: re-derived state must evaluate identically (idempotent).
      const reloaded = startProceduralMission(current.instanceId);
      const reloadedProgress = getProceduralMissionProgress(reloaded);
      assert(reloadedProgress.allCorrect === progress.allCorrect, `${templateId}/${archetype}/seed${seed}: reload after solving is stable (allCorrect unchanged)`);
    }
  }
}
assert(true, 'D: mass test completed for all new templates/archetypes/seeds');

console.log('\n=== Phase 9A L2 Completion Audit: Summary ===');
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`Total assertions: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailed assertions:');
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.message}`));
  process.exitCode = 1;
} else {
  console.log('All checks passed.');
}
