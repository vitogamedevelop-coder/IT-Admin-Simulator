// =============================================================================
// NEXUS Academy - learning mode persistence.
//
// Separate localStorage key (same pattern as academyProgress.js), so this
// can evolve independently and never touches gameState.js or the topic
// progress store.
//
// This phase only needs: a data model, a selection view, a persisted mode,
// and a simple placeholder for per-category placement tests (only TCP/UDP
// has a real one - see AcademyPlacementTcpUdp.jsx).
// =============================================================================

const KEY = 'cyberlearn:academy-mode-v1';
const STATE_VERSION = 1;

export const LEARNING_MODES = {
  BEGINNER: 'beginner',
  PRIOR_KNOWLEDGE: 'prior-knowledge',
  COURSE: 'course',
  SANDBOX: 'sandbox',
};

function defaults() {
  return {
    stateVersion: STATE_VERSION,
    mode: null, // null = not chosen yet
    // Per-category placement-test results, keyed by an arbitrary testId
    // (e.g. "fundamentals/tcp-udp"). Only used where a real test exists.
    placementResults: {},
  };
}

function migrate(saved) {
  if (!saved || typeof saved !== 'object') return defaults();
  return { ...defaults(), ...saved, placementResults: { ...saved.placementResults } };
}

export function readAcademyMode() {
  try {
    return migrate(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    return defaults();
  }
}

function writeAcademyMode(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('cyberlearn:academy-mode'));
  return data;
}

export function setLearningMode(mode) {
  const data = readAcademyMode();
  data.mode = mode;
  return writeAcademyMode(data);
}

export function recordPlacementResult(testId, result) {
  const data = readAcademyMode();
  data.placementResults = { ...data.placementResults, [testId]: { ...result, completedAt: Date.now() } };
  return writeAcademyMode(data);
}

export function getPlacementResult(testId) {
  return readAcademyMode().placementResults[testId] || null;
}
