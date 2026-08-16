import assert from 'node:assert/strict';
import {
  generateMissionInstance,
} from '../src/lib/missionGenerator.js';
import { getTemplate } from '../src/lib/missionTemplateEngine.js';

function withLocalStorage(fn) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = globalThis.window || { dispatchEvent: () => {} };
  try {
    fn();
  } finally {
    delete globalThis.localStorage;
  }
}

withLocalStorage(() => {
  // Seed state so basic config template is unlocked.
  localStorage.setItem('it-learn:rpg-state-v1', JSON.stringify({
    stateVersion: 8,
    completedQuests: ['cisco-main-001'],
    activeQuest: null,
  }));

  const instance = generateMissionInstance({ seed: 12345 });
  assert.ok(instance, 'Generated a procedural mission');
  assert.ok(instance.resolvedParameters, 'Has resolved parameters');
  assert.ok(instance.resolvedParameters.targetHostname, 'Has hostname');
  assert.ok(instance.resolvedParameters.username, 'Has username');
  assert.ok(instance.title, 'Has title');

  // Title and briefing use the same hostname
  assert.ok(instance.title.includes(instance.resolvedParameters.targetHostname), 'Title includes hostname');
  assert.ok(instance.briefing.includes(instance.resolvedParameters.targetHostname), 'Briefing includes hostname');

  // Briefing should show parameters inline so the player does not need to scroll
  assert.ok(instance.briefing.includes('Hostname:'), 'Briefing shows hostname label');
  assert.ok(instance.briefing.includes(instance.resolvedParameters.username), 'Briefing shows username');

  // Evaluated checks should also mention concrete hostname / username
  const template = getTemplate(instance.templateId);
  const progress = template.evaluate(instance.device, instance.resolvedParameters, instance.archetype, instance);
  const hostnameCheck = progress.checks.find((c) => c.id === 'hostname');
  const userCheck = progress.checks.find((c) => c.id === 'local_user');
  assert.ok(hostnameCheck, 'Hostname check exists');
  assert.ok(userCheck, 'Local user check exists');
  assert.ok(hostnameCheck.label.includes(instance.resolvedParameters.targetHostname), 'Check label uses hostname');
  assert.ok(userCheck.label.includes(instance.resolvedParameters.username), 'Check label uses username');
});

console.log('Phase 1I.2 Procedural UX Tests: OK');
