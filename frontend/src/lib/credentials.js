// Simulated credential continuity for the game world.
// These are NOT real device credentials — they are in-game values the player
// creates during missions and that later missions can reference consistently.

import { readGameState, writeGameState } from './gameState.js';

export function createKnownCredentials() {
  return {
    enableSecret: null,
    localAdminUsername: null,
    localAdminPassword: null,
  };
}

export function getKnownCredentials() {
  const state = readGameState();
  return state.knownCredentials || createKnownCredentials();
}

export function recordKnownCredentials(values) {
  const state = readGameState();
  if (!state.knownCredentials) state.knownCredentials = createKnownCredentials();
  if (values.enableSecret != null) state.knownCredentials.enableSecret = values.enableSecret;
  if (values.localAdminUsername != null) state.knownCredentials.localAdminUsername = values.localAdminUsername;
  if (values.localAdminPassword != null) state.knownCredentials.localAdminPassword = values.localAdminPassword;
  return writeGameState(state).knownCredentials;
}

export function recordKnownCredentialsFromMission001(device, scenario) {
  const result = {};
  if (device.runningConfig?.enableSecret) {
    result.enableSecret = device.runningConfig.enableSecret;
  }
  const username = scenario.parameters?.username;
  const user = device.runningConfig?.users?.[username];
  if (username && user) {
    result.localAdminUsername = username;
    result.localAdminPassword = user.secret || user.password || null;
  }
  if (Object.values(result).some((v) => v != null)) {
    recordKnownCredentials(result);
  }
  return result;
}

export function hasKnownCredentials() {
  const known = getKnownCredentials();
  return known.localAdminUsername != null && known.localAdminPassword != null;
}

export function formatCredentialTemplate(text, known = getKnownCredentials()) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/\[username\]/g, known.localAdminUsername || '???')
    .replace(/\[password\]/g, known.localAdminPassword || '???')
    .replace(/\[enableSecret\]/g, known.enableSecret || '???');
}
