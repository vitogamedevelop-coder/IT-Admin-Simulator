export const dialogModes = {
  PHONE: 'phone',
  FACE_TO_FACE: 'face-to-face',
};

export const defaultTypewriterSpeed = 22;

export function buildDialogId(missionId, personId) {
  return `${missionId}::${personId}`;
}

export function getNextDelay(text, speed = defaultTypewriterSpeed) {
  const base = text.length * speed;
  return Math.min(base, 3000);
}

export function createDialogNode({ id, text, personId, delay = 600, options = [], autoNext = null }) {
  return { id, text, personId, delay, options, autoNext };
}

export function findNode(dialog, nodeId) {
  return dialog.nodes.find((node) => node.id === nodeId) || dialog.nodes[0];
}

export function createDialog({ id, personId, mode = dialogModes.FACE_TO_FACE, nodes, entryNode, onComplete }) {
  return { id, personId, mode, nodes, entryNode: entryNode || nodes[0]?.id, onComplete };
}

// Phase 0 reset: legacy example dialogs have been removed.
// Use createDialog / createDialogNode to build new mission dialogs.

export function textLinesFromNode(node) {
  if (!node) return [];
  return node.text.split('\n').map((line) => line.trim()).filter(Boolean);
}
