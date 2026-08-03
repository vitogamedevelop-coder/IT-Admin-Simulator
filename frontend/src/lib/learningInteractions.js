// Learning Interactions Data
// Generic structure for embedded quiz-like interactions within conversations.
// Types: 'sort' (order items), 'match' (pair items), 'choice' (pick one), 'assign' (categorize)

export const interactions = {
  'osi-layers': {
    id: 'osi-layers',
    type: 'sort',
    topic: 'Netzwerk',
    title: 'OSI-Schichtenmodell',
    prompt: 'Bringe die sieben OSI-Schichten in die richtige Reihenfolge (von unten nach oben):',
    items: [
      { id: 'L1', label: 'Bitübertragung (Physical)' },
      { id: 'L2', label: 'Sicherung (Data Link)' },
      { id: 'L3', label: 'Vermittlung (Network)' },
      { id: 'L4', label: 'Transport' },
      { id: 'L5', label: 'Sitzung (Session)' },
      { id: 'L6', label: 'Darstellung (Presentation)' },
      { id: 'L7', label: 'Anwendung (Application)' },
    ],
    correctOrder: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'],
    explanation: [
      { label: 'Schicht 1', detail: 'Kabel, Stecker, Link-LED – physische Signale' },
      { label: 'Schicht 2', detail: 'MAC-Adressen, Switches – lokale Zustellung' },
      { label: 'Schicht 3', detail: 'IP-Adressen, Router – Wegfindung zwischen Netzen' },
      { label: 'Schicht 4', detail: 'TCP/UDP, Ports – zuverlässige Verbindung' },
    ],
    takeaway: 'Merkhilfe von unten: „Please Do Not Throw Sausage Pizza Away“ – Physical, Data Link, Network, Transport, Session, Presentation, Application.',
    knowledgeEntry: {
      id: 'osi-model',
      title: 'OSI-Schichtenmodell',
      category: 'Netzwerk',
    },
  },

  'subnet-powers': {
    id: 'subnet-powers',
    type: 'sort',
    topic: 'Subnetting',
    title: 'Zweierpotenzen',
    prompt: 'Sortiere die Zweierpotenzen von größtem zu kleinstem Wert:',
    items: [
      { id: 'p7', label: '128' },
      { id: 'p6', label: '64' },
      { id: 'p5', label: '32' },
      { id: 'p4', label: '16' },
      { id: 'p3', label: '8' },
      { id: 'p2', label: '4' },
      { id: 'p1', label: '2' },
      { id: 'p0', label: '1' },
    ],
    correctOrder: ['p7', 'p6', 'p5', 'p4', 'p3', 'p2', 'p1', 'p0'],
    explanation: [
      { label: 'Zweierpotenzen', detail: 'Jede Stelle im Binärsystem verdoppelt den Wert: 1, 2, 4, 8, 16, 32, 64, 128' },
      { label: 'Subnetzmasken', detail: 'Subnetzmasken bestehen aus zusammenhängenden 1-Bits. Die Zweierpotenzen bestimmen die Blockgröße.' },
    ],
    takeaway: '128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255. Ein volles Oktett hat 8 gesetzte Bits.',
    knowledgeEntry: {
      id: 'subnet-binary',
      title: 'Zweierpotenzen und Binärsystem',
      category: 'Subnetting',
    },
  },

  'subnet-cidr': {
    id: 'subnet-cidr',
    type: 'choice',
    topic: 'Subnetting',
    title: 'CIDR und Blockgröße',
    prompt: '/26 bedeutet: 26 Bits für das Netz, 6 Bits für Hosts.\n\nWelche Subnetzmaske ergibt sich, und wie groß ist der Block?',
    options: [
      { id: 'a', label: '255.255.255.192 – Blockgröße 64', correct: true },
      { id: 'b', label: '255.255.255.128 – Blockgröße 128', correct: false },
      { id: 'c', label: '255.255.255.224 – Blockgröße 32', correct: false },
      { id: 'd', label: '255.255.255.240 – Blockgröße 16', correct: false },
    ],
    explanation: [
      { label: 'Berechnung', detail: '26 Bits = 11111111.11111111.11111111.11000000 = 255.255.255.192' },
      { label: 'Blockgröße', detail: '256 − 192 = 64. Netzgrenzen: .0, .64, .128, .192' },
    ],
    takeaway: 'Blockgröße = 256 minus Maskenwert im relevanten Oktett. Bei /26: 256 − 192 = 64.',
    knowledgeEntry: {
      id: 'subnet-cidr',
      title: 'CIDR-Notation und Blockgröße',
      category: 'Subnetting',
    },
  },

  'subnet-calculate': {
    id: 'subnet-calculate',
    type: 'choice',
    topic: 'Subnetting',
    title: 'Subnetting berechnen',
    prompt: 'Gegeben: IP 192.168.1.50/26\nBlockgröße: 64 (Grenzen: .0, .64, .128, .192)\n\nWelche Angaben sind korrekt?',
    options: [
      { id: 'a', label: 'Netz-ID: 192.168.1.0, Broadcast: 192.168.1.63, nutzbar: .1 bis .62', correct: true },
      { id: 'b', label: 'Netz-ID: 192.168.1.0, Broadcast: 192.168.1.64, nutzbar: .1 bis .63', correct: false },
      { id: 'c', label: 'Netz-ID: 192.168.1.32, Broadcast: 192.168.1.63, nutzbar: .33 bis .62', correct: false },
      { id: 'd', label: 'Netz-ID: 192.168.1.48, Broadcast: 192.168.1.64, nutzbar: .49 bis .63', correct: false },
    ],
    explanation: [
      { label: 'Netz-ID', detail: '50 liegt im Block 0–63 (nächste Grenze 64). Netz-ID = 192.168.1.0' },
      { label: 'Broadcast', detail: 'Letzte Adresse im Block: 192.168.1.63' },
      { label: 'Nutzbar', detail: 'Erste nutzbare: .1 (Netz-ID + 1), letzte nutzbare: .62 (Broadcast − 1)' },
      { label: 'Hosts', detail: '64 − 2 = 62 nutzbare Adressen' },
    ],
    takeaway: 'IP in Block finden: Blockgrenzen durchgehen, bis die IP darin liegt. Netz-ID = Blockstart, Broadcast = Blockende − 1.',
    knowledgeEntry: {
      id: 'subnet-calculate',
      title: 'Subnetting-Berechnung',
      category: 'Subnetting',
    },
  },
};

// Subnetting learning path structure (for future expansion)
export const subnetLearningPath = [
  { id: 1, title: 'Zweierreihe', interactionId: 'subnet-powers', description: '128, 64, 32, 16, 8, 4, 2, 1 korrekt sortieren' },
  { id: 2, title: 'Binär zu Dezimal', interactionId: null, description: 'Binäre Oktette in Dezimalzahlen umwandeln' },
  { id: 3, title: 'CIDR zu Subnetzmaske', interactionId: 'subnet-cidr', description: '/26 → 255.255.255.192 und Blockgröße bestimmen' },
  { id: 4, title: 'Blockgröße bestimmen', interactionId: 'subnet-cidr', description: '256 minus Maskenwert im relevanten Oktett' },
  { id: 5, title: 'IP einem Netzbereich zuordnen', interactionId: 'subnet-calculate', description: 'Prüfen, in welchem Block eine IP liegt' },
  { id: 6, title: 'Netzwerk-ID und Broadcast', interactionId: 'subnet-calculate', description: 'Erste und letzte Adresse des Blocks' },
  { id: 7, title: 'Erste und letzte nutzbare Adresse', interactionId: 'subnet-calculate', description: 'Netz-ID + 1 bis Broadcast − 1' },
  { id: 8, title: 'Hostanzahl berechnen', interactionId: null, description: 'Blockgröße − 2 = nutzbare Hosts' },
  { id: 9, title: 'Vollständige Subnetting-Fälle', interactionId: null, description: 'Alle Schritte kombiniert' },
  { id: 10, title: 'Supernetting', interactionId: null, description: 'Gemeinsame Präfixbits finden (spätere Erweiterung)' },
];

export function interactionById(id) {
  return interactions[id] || null;
}
