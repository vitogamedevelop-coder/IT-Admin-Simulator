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

export const examplePhoneDialog = createDialog({
  id: 'mara-ipconfig-phone',
  personId: 'mara',
  mode: dialogModes.PHONE,
  nodes: [
    createDialogNode({ id: 'start', text: 'Guten Morgen, hier Mara vom Helpdesk. Ein neuer Mitarbeiter meldet, dass sein PC keine Verbindung zum Netzwerk hat.', delay: 800 }),
    createDialogNode({ id: 'ask', text: 'Ich sehe gerade seinen Schirm: die IP-Adresse beginnt mit 169.254. Was bedeutet das für Sie?', options: [
      { label: 'Das ist APIPA – der Client hat keinen DHCP-Lease erhalten.', nextId: 'good', effect: 'competency-dhcp' },
      { label: 'Der DNS-Server ist ausgefallen.', nextId: 'wrong' },
    ] }),
    createDialogNode({ id: 'good', text: 'Genau. Können Sie mir kurz sagen, welchen Befehl wir zuerst verwenden, um das zu prüfen?', delay: 500, options: [
      { label: 'ipconfig /all', nextId: 'finish', effect: 'tool-ipconfig' },
      { label: 'format C:', nextId: 'bad-idea' },
    ] }),
    createDialogNode({ id: 'wrong', text: 'Nein, DNS ist hier noch nicht das Thema. Die IP beginnt mit 169.254, weil DHCP nicht erreichbar ist. Schauen wir uns die Konfiguration an.', autoNext: 'good' }),
    createDialogNode({ id: 'bad-idea', text: 'Bitte nicht. Wir löschen keine Festplatten, nur weil ein DHCP-Lease fehlt. Wir machen es ordentlich.', autoNext: 'good' }),
    createDialogNode({ id: 'finish', text: 'Perfekt. Ich gebe das Ticket an Sie weiter. Untersuchen Sie den Vorfall, und melden Sie sich, wenn Sie die Ursache gefunden haben.', onComplete: { missionId: 'first-day' } }),
  ],
});

export function textLinesFromNode(node) {
  if (!node) return [];
  return node.text.split('\n').map((line) => line.trim()).filter(Boolean);
}
