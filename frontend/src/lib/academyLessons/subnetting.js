import { topicKey } from '../academyTopics.js';
import {
  prefixToSubnetMask,
  getRelevantOctet,
  getHostOctet,
  calculateJumpSize,
  calculateNetworkId,
  calculateBroadcast,
  calculateFirstHost,
  calculateLastHost,
  calculateTotalAddresses,
  calculateUsableHosts,
  getSubnetBlockBounds,
  generateUniqueSubnetProblems,
  subnetBitsForCount,
  prefixForSubnetCount,
  hostBitsForRequirement,
  prefixForHostRequirement,
  generateFixedSubnetSequence,
} from '../networking/ipv4Math.js';

export const SUBNETTING_TOPIC_KEY = topicKey('fundamentals', 'subnetting');

const CLASSIC_EXAMPLE = { ip: '192.168.1.50', prefix: 26 };
const INTUITIVE_EXAMPLES = [
  { ip: '192.168.199.3', prefix: 20, network: '192.168.192.0', broadcast: '192.168.207.255' },
  { ip: '10.25.140.18', prefix: 21, network: '10.25.136.0', broadcast: '10.25.143.255' },
];
const BORROW_BITS_SVG = `<svg viewBox="0 0 430 135" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="215" y="20" text-anchor="middle" fill="#c9d1d9" font-size="11">Grenze verschieben – keine neuen Bits erzeugen</text><text x="20" y="55" fill="#8b949e" font-size="10">Ausgang /23</text><text x="115" y="55" fill="#00f0ff" font-size="12">NNNNNNNN.NNNNNNNN.NNNNNN</text><text x="313" y="55" fill="#ffcc00" font-size="12">NH.HHHHHHHH</text><text x="20" y="96" fill="#8b949e" font-size="10">Neu /26</text><text x="115" y="96" fill="#00f0ff" font-size="12">NNNNNNNN.NNNNNNNN.NNNNNNNN.NN</text><text x="349" y="96" fill="#ffcc00" font-size="12">HHHHHH</text><text x="215" y="123" text-anchor="middle" fill="#00ff66" font-size="10">3 Hostbits werden Netzbits → mehr, aber kleinere Subnetze</text></svg>`;
const FLSM_BLOCKS_SVG = `<svg viewBox="0 0 430 145" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="215" y="18" text-anchor="middle" fill="#c9d1d9" font-size="11">192.168.1.0/24 in vier gleich große /26-Blöcke</text><g font-size="9"><rect x="12" y="40" width="98" height="48" rx="5" fill="#00f0ff" opacity="0.25" stroke="#00f0ff"/><rect x="114" y="40" width="98" height="48" rx="5" fill="#58a6ff" opacity="0.25" stroke="#58a6ff"/><rect x="216" y="40" width="98" height="48" rx="5" fill="#00ff66" opacity="0.2" stroke="#00ff66"/><rect x="318" y="40" width="98" height="48" rx="5" fill="#ffcc00" opacity="0.25" stroke="#ffcc00"/><text x="61" y="60" text-anchor="middle" fill="#c9d1d9">.0 – .63</text><text x="163" y="60" text-anchor="middle" fill="#c9d1d9">.64 – .127</text><text x="265" y="60" text-anchor="middle" fill="#c9d1d9">.128 – .191</text><text x="367" y="60" text-anchor="middle" fill="#c9d1d9">.192 – .255</text><text x="61" y="78" text-anchor="middle" fill="#00f0ff">/26</text><text x="163" y="78" text-anchor="middle" fill="#58a6ff">/26</text><text x="265" y="78" text-anchor="middle" fill="#00ff66">/26</text><text x="367" y="78" text-anchor="middle" fill="#ffcc00">/26</text></g><text x="215" y="115" text-anchor="middle" fill="#8b949e" font-size="10">2 zusätzliche Netzbits → 2² = 4 Netze · 6 Hostbits → 62 nutzbare Hosts</text><text x="215" y="134" text-anchor="middle" fill="#8b949e" font-size="10">Fixed Length: alle erzeugten Subnetze sind gleich groß</text></svg>`;

function buildExplanations() {
  const exps = [];

  // ---------- Classic explanation ----------
  exps.push({
    id: 'subnetting-concept-classic',
    title: 'Was ist ein Subnetz?',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Stell dir ein großes Firmengebäude vor. Nicht jeder Mitarbeiter muss mit jedem gleichzeitig kommunizieren. Deshalb teilen wir große Netzwerke in kleinere Bereiche – sogenannte Subnetze.' },
      { type: 'text', content: 'Subnetting teilt einen vorhandenen IP-Adressraum in mehrere kleinere Netze. Es erzeugt keine zusätzlichen IPv4-Adressen: Hostbits werden zu Netzbits und die Grenze zwischen beiden Anteilen verschiebt sich.' },
      { type: 'diagram', content: BORROW_BITS_SVG },
      { type: 'text', content: 'Der zentrale Trade-off: Mehr Netzbits ermöglichen mehr Subnetze, lassen aber weniger Hostbits und damit weniger Hosts pro Subnetz übrig.' },
      { type: 'list', title: 'Warum Subnetting?', items: [
        'Weniger Broadcast-Traffic pro Teilnetz',
        'Einfachere Fehlersuche durch klar abgegrenzte Bereiche',
        'Bessere Sicherheit: kritische Abteilungen können getrennt werden',
        'Effizientere Adressvergabe, weil große Blöcke passend aufgeteilt werden',
      ] },
    ],
  });

  exps.push({
    id: 'requirements-classic',
    title: 'Welche Anforderung ist gegeben?',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Vor jeder Rechnung entscheidest du: Ist die Anzahl gleich großer Subnetze gegeben, oder ist eine Mindestzahl an Hosts pro Subnetz gegeben? Diese beiden Wege beginnen unterschiedlich.' },
      { type: 'table', headers: ['Anforderung', 'Gesuchte Bits', 'Kernbedingung'], rows: [
        ['Anzahl Subnetze', 'zusätzliche Netzbits n', 'kleinstes n mit 2^n ≥ benötigte Subnetze'],
        ['Hosts pro Subnetz', 'Hostbits h', 'kleinstes h mit 2^h − 2 ≥ benötigte Hosts'],
      ] },
      { type: 'question', facet: 'requirement-type', question: 'NEXUS benötigt mindestens 50 Hosts je Abteilungsnetz. Welcher Denkweg passt?', options: ['Hostbits über 2^h − 2 bestimmen', 'zusätzliche Netzbits gleich 50 setzen', 'nur die Anzahl der Abteilungen zählen'], correct: 0, explanation: 'Bei gegebenem Hostbedarf wird zuerst die kleinste ausreichende Anzahl Hostbits bestimmt.' },
    ],
  });

  exps.push({
    id: 'subnet-count-classic',
    title: 'Weg A: Anzahl gleich großer Subnetze',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Für sechs gewünschte Subnetze reichen zwei Bits nicht: 2² = 4. Drei zusätzliche Netzbits liefern 2³ = 8 mögliche, gleich große Subnetze. Es entstehen acht binäre Kombinationen, auch wenn zunächst nur sechs gebraucht werden.' },
      { type: 'text', content: `Beim Ausgangsnetz 192.168.2.0/23 führen ${subnetBitsForCount(6)} zusätzliche Netzbits zum Präfix /${prefixForSubnetCount(23, 6)}.` },
      { type: 'list', title: 'Die ersten sechs benötigten Netz-IDs', items: generateFixedSubnetSequence('192.168.2.0', 23, 26).slice(0, 6).map((subnet) => `${subnet.network}/${subnet.prefix}`) },
      { type: 'question', facet: 'subnet-count', question: 'Warum benötigen sechs Subnetze drei zusätzliche Netzbits?', options: ['2² liefert nur 4, 2³ liefert 8 mögliche Kombinationen.', 'Jedes gewünschte Netz benötigt genau ein eigenes Bit.', 'Drei Bits liefern exakt sechs und niemals acht Netze.'], correct: 0, explanation: 'Subnetzanzahlen folgen Zweierpotenzen. Drei Bits stellen acht Kombinationen bereit.' },
    ],
  });

  exps.push({
    id: 'host-count-classic',
    title: 'Weg B: Hostbedarf',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Für normale Hostnetze werden Netz-ID und Broadcast mitgerechnet. Bei 15 benötigten Hosts reichen vier Hostbits deshalb nicht: 2⁴ − 2 = 14. Fünf Hostbits liefern 2⁵ − 2 = 30 nutzbare Hosts.' },
      { type: 'text', content: `15 Hosts benötigen ${hostBitsForRequirement(15)} Hostbits. 32 − 5 ergibt den Präfix /${prefixForHostRequirement(25, 15)}.` },
      { type: 'question', facet: 'host-count', question: 'Warum reichen vier Hostbits nicht für 15 Hosts in einem normalen IPv4-Hostnetz?', options: ['2⁴ liefert 16 Adressen, nach Netz-ID und Broadcast bleiben nur 14 Hosts.', 'Vier Hostbits liefern grundsätzlich nur vier Adressen.', 'Weil ein /28 immer acht Broadcastadressen benötigt.'], correct: 0, explanation: 'Bei klassischen Hostnetzen werden zwei Adressen nicht normalen Hosts zugewiesen. Daher gilt zunächst 2^h − 2.' },
    ],
  });

  exps.push({
    id: 'flsm-blocks-classic',
    title: 'Feste, gleich große Blöcke',
    style: 'classic',
    blocks: [
      { type: 'diagram', content: FLSM_BLOCKS_SVG },
      { type: 'text', content: 'Die Sprungweite gibt den Abstand aufeinanderfolgender Netz-IDs im relevanten Oktett an. Bei /26 beträgt sie 64: .0, .64, .128 und .192.' },
      { type: 'text', content: 'Fixed-Length Subnetting erzeugt gleich große Netze. Wenn Abteilungen unterschiedlich große Blöcke benötigen, folgt später VLSM: Dort wird der größte Bedarf zuerst geplant.' },
    ],
  });

  exps.push({
    id: 'classic-method',
    title: 'Die klassische Methode',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Bei der klassischen Methode arbeitest du dich Schritt für Schritt durch die Subnetzmaske vor.' },
      { type: 'list', title: 'Schrittfolge', items: [
        'Präfix betrachten (z.B. /26)',
        'Subnetzmaske bestimmen',
        'relevantes Oktett ermitteln',
        'Sprungweite berechnen: 256 − Maskenwert',
        'Netzblöcke bestimmen',
        'passenden Block finden',
        'Netz-ID bestimmen',
        'Broadcast bestimmen',
        'ersten Host bestimmen',
        'letzten Host bestimmen',
        'Gesamtadressen und nutzbare Hosts ermitteln',
      ] },
      { type: 'text', content: `Beispiel: ${CLASSIC_EXAMPLE.ip}/${CLASSIC_EXAMPLE.prefix}` },
      { type: 'list', title: 'Lösung Schritt für Schritt', items: [
        `Präfix: /${CLASSIC_EXAMPLE.prefix}`,
        `Subnetzmaske: ${prefixToSubnetMask(CLASSIC_EXAMPLE.prefix).decimal}`,
        `veränderliches Oktett (Hostanteil): ${getHostOctet(CLASSIC_EXAMPLE.prefix) + 1}. Oktett`,
        `Sprungweite: ${calculateJumpSize(CLASSIC_EXAMPLE.prefix)}`,
        `Netz-ID: ${calculateNetworkId(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix)}`,
        `Broadcast: ${calculateBroadcast(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix)}`,
        `erster Host: ${calculateFirstHost(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix)}`,
        `letzter Host: ${calculateLastHost(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix)}`,
        `Adressen: ${calculateTotalAddresses(CLASSIC_EXAMPLE.prefix)}`,
        `nutzbare Hosts: ${calculateUsableHosts(CLASSIC_EXAMPLE.prefix)}`,
      ] },
    ],
  });

  // ---------- Intuitive explanation ----------
  exps.push({
    id: 'intuitive-intro',
    title: 'Sams Methode',
    style: 'intuitive',
    blocks: [
      { type: 'text', content: 'Eigentlich rechnet man das meist über Zweierpotenzen. Viele kommen damit aber durcheinander. Ich zeige dir eine Methode, mit der sich viele leichter tun.' },
      { type: 'text', content: 'Du musst dir gar nicht ständig „2 hoch irgendwas" merken. Schau einfach, in welchem Oktett dein Präfix liegt. Dann läufst du eine feste Reihe durch.' },
    ],
  });

  exps.push({
    id: 'intuitive-jump-table',
    title: 'Die Sprungweiten-Tabelle',
    style: 'intuitive',
    blocks: [
      { type: 'text', content: 'In jedem Oktett wiederholt sich dieselbe Reihe: 128, 64, 32, 16, 8, 4, 2, 1.' },
      { type: 'table', headers: ['Präfix', 'Oktett', 'Sprungweite'], rows: [
        ['/1', '1.', '128'], ['/2', '1.', '64'], ['/3', '1.', '32'], ['/4', '1.', '16'],
        ['/5', '1.', '8'], ['/6', '1.', '4'], ['/7', '1.', '2'], ['/8', '1.', '1'],
        ['/9', '2.', '128'], ['/10', '2.', '64'], ['/11', '2.', '32'], ['/12', '2.', '16'],
        ['/13', '2.', '8'], ['/14', '2.', '4'], ['/15', '2.', '2'], ['/16', '2.', '1'],
        ['/17', '3.', '128'], ['/18', '3.', '64'], ['/19', '3.', '32'], ['/20', '3.', '16'],
        ['/21', '3.', '8'], ['/22', '3.', '4'], ['/23', '3.', '2'], ['/24', '3.', '1'],
        ['/25', '4.', '128'], ['/26', '4.', '64'], ['/27', '4.', '32'], ['/28', '4.', '16'],
        ['/29', '4.', '8'], ['/30', '4.', '4'], ['/31', '4.', '2'], ['/32', '4.', '1'],
      ] },
      { type: 'text', content: 'Die Reihe beginnt immer bei 128 und endet bei 1. Danach startet sie im nächsten Oktett wieder bei 128.' },
      { type: 'text', content: 'Du musst also nur zwei Dinge wissen: 1) In welchem Oktett liegt dein Präfix? 2) An welcher Stelle in der Reihe? Die Zahl dort ist deine Sprungweite.' },
    ],
  });

  exps.push({
    id: 'intuitive-examples',
    title: 'Intuitive Beispiele',
    style: 'intuitive',
    blocks: [
      { type: 'text', content: 'Probieren wir dieselben Aufgaben noch einmal mit der intuitiven Methode.' },
      ...INTUITIVE_EXAMPLES.flatMap((ex) => [
        { type: 'text', content: `Beispiel: ${ex.ip}/${ex.prefix}` },
        { type: 'list', title: 'Lösung', items: [
          `Bei /${ex.prefix} liegt das veränderliche Oktett im ${getHostOctet(ex.prefix) + 1}. Oktett`,
          `Sprungweite: ${calculateJumpSize(ex.prefix)}`,
          `${ex.ip.split('.')[getHostOctet(ex.prefix)]} liegt im Block ${getSubnetBlockBounds(ex.ip, ex.prefix).lower} bis ${getSubnetBlockBounds(ex.ip, ex.prefix).upper}`,
          `Netz-ID: ${ex.network}`,
          `Broadcast: ${ex.broadcast}`,
        ] },
      ]),
    ],
  });

  // Both styles end with the same summary.
  exps.push({
    id: 'summary-classic',
    title: 'Zusammenfassung',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Beide Methoden führen zum gleichen Ergebnis. Entscheidend ist, das richtige Oktett zu erkennen und die Sprungweite korrekt anzuwenden.' },
      { type: 'list', title: 'Wichtigste Schritte', items: [
        'Präfix → Oktett → Sprungweite',
        'Netz-ID = Anfang des passenden Blocks',
        'Broadcast = Ende des Blocks',
        'erster Host = Netz-ID + 1',
        'letzter Host = Broadcast − 1',
        'nutzbare Hosts = Adressen − 2',
      ] },
    ],
  });

  return exps;
}

function inputExercise(id, title, question, answer, explanation, placeholder = '') {
  return {
    id,
    type: 'input',
    title,
    question,
    // NOTE: the InputExercise component in LessonRunner.jsx reads
    // `exercise.answers` (see the "answers.some(...)" check) - this field
    // must be named exactly "answers", not "acceptedAnswers", or every
    // input exercise built with this helper throws immediately on render.
    answers: [String(answer)],
    placeholder,
    explanation,
  };
}

function selectBlockExercise(id, ip, prefix) {
  const correct = calculateNetworkId(ip, prefix);
  const broadcast = calculateBroadcast(ip, prefix);
  const jump = calculateJumpSize(prefix);
  const relevant = getHostOctet(prefix) + 1;
  const bounds = getSubnetBlockBounds(ip, prefix);
  const octetValue = Number(ip.split('.')[getHostOctet(prefix)]);
  const distractors = [
    `${calculateNetworkId([ip.split('.')[0], ip.split('.')[1], ip.split('.')[2], ip.split('.')[3] - (octetValue % jump || jump)].join('.'), prefix)} bis ${calculateBroadcast([ip.split('.')[0], ip.split('.')[1], ip.split('.')[2], ip.split('.')[3] - (octetValue % jump || jump)].join('.'), prefix)}`,
  ].filter((d) => d !== `${correct} bis ${broadcast}`);
  const options = [
    `${correct} bis ${broadcast}`,
    ...distractors,
    `${ip} bis ${broadcast}`,
    `${correct} bis ${ip}`,
  ].slice(0, 4).sort(() => Math.random() - 0.5);
  return {
    id,
    type: 'select-best',
    question: `Zwischen welchen Grenzen liegt ${ip}/${prefix}? (Netz-ID bis Broadcast)`,
    options,
    correct: options.indexOf(`${correct} bis ${broadcast}`),
    explanation: `Im ${relevant}. Oktett ist die Sprungweite ${jump}. ${octetValue} liegt im Block ${bounds.lower} bis ${bounds.upper}, also Netz-ID ${correct} und Broadcast ${broadcast}.`,
  };
}

function findErrorExercise(id, ip, prefix, wrongField) {
  const network = calculateNetworkId(ip, prefix);
  const broadcast = calculateBroadcast(ip, prefix);
  const first = calculateFirstHost(ip, prefix);
  const last = calculateLastHost(ip, prefix);
  const total = calculateTotalAddresses(prefix);
  const usable = calculateUsableHosts(prefix);

  const wrongValues = {
    netzid: calculateBroadcast(ip, prefix),
    broadcast: calculateNetworkId(ip, prefix),
    erster: calculateLastHost(ip, prefix),
    letzter: calculateFirstHost(ip, prefix),
    hosts: total,
    adressen: usable,
  };

  const labels = {
    netzid: 'Netz-ID',
    broadcast: 'Broadcast',
    erster: 'erster Host',
    letzter: 'letzter Host',
    hosts: 'nutzbare Hosts',
    adressen: 'Gesamtadressen',
  };

  const profile = {
    'Netz-ID': wrongField === 'netzid' ? wrongValues.netzid : network,
    'Broadcast': wrongField === 'broadcast' ? wrongValues.broadcast : broadcast,
    'erster Host': wrongField === 'erster' ? wrongValues.erster : first,
    'letzter Host': wrongField === 'letzter' ? wrongValues.letzter : last,
    'nutzbare Hosts': wrongField === 'hosts' ? wrongValues.hosts : usable,
    'Gesamtadressen': wrongField === 'adressen' ? wrongValues.adressen : total,
  };

  return {
    id,
    type: 'select-best',
    question: `Welcher Wert ist falsch?\n${ip}/${prefix}\n${Object.entries(profile).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
    options: Object.values(labels),
    correct: Object.values(labels).indexOf(labels[wrongField]),
    explanation: `Der falsche Wert ist "${labels[wrongField]}". Für ${ip}/${prefix} lautet ${labels[wrongField]} ${wrongField === 'netzid' || wrongField === 'broadcast' ? (wrongField === 'netzid' ? network : broadcast) : (wrongField === 'erster' ? first : (wrongField === 'letzter' ? last : (wrongField === 'hosts' ? usable : total)))}.`,
  };
}

function buildExercises() {
  const exs = [];

  // Static input exercises based on the canonical examples.
  exs.push(inputExercise(
    'relevant-octet-classic',
    'Relevantes Oktett',
    `Bei ${CLASSIC_EXAMPLE.ip}/${CLASSIC_EXAMPLE.prefix}: In welchem Oktett liegt der veränderliche Hostanteil? (1-4)`,
    getHostOctet(CLASSIC_EXAMPLE.prefix) + 1,
    `Bei /${CLASSIC_EXAMPLE.prefix} verändert sich der Hostanteil im ${getHostOctet(CLASSIC_EXAMPLE.prefix) + 1}. Oktett.`
  ));
  exs.push(inputExercise(
    'jump-classic',
    'Sprungweite klassisch',
    `Bei /${CLASSIC_EXAMPLE.prefix}: Wie groß ist die Sprungweite im relevanten Oktett?`,
    calculateJumpSize(CLASSIC_EXAMPLE.prefix),
    `Subnetzmaske: ${prefixToSubnetMask(CLASSIC_EXAMPLE.prefix).decimal}. Im relevanten Oktett ist der Maskenwert ${prefixToSubnetMask(CLASSIC_EXAMPLE.prefix).octets[getRelevantOctet(CLASSIC_EXAMPLE.prefix)]}, also Sprungweite ${calculateJumpSize(CLASSIC_EXAMPLE.prefix)}.`
  ));
  exs.push(inputExercise(
    'network-classic',
    'Netz-ID berechnen',
    `Netz-ID von ${CLASSIC_EXAMPLE.ip}/${CLASSIC_EXAMPLE.prefix}?`,
    calculateNetworkId(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix),
    `Die IP liegt im Block, der bei ${calculateNetworkId(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix)} beginnt.`
  ));
  exs.push(inputExercise(
    'broadcast-classic',
    'Broadcast berechnen',
    `Broadcast von ${CLASSIC_EXAMPLE.ip}/${CLASSIC_EXAMPLE.prefix}?`,
    calculateBroadcast(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix),
    `Der Block endet bei ${calculateBroadcast(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix)}.`
  ));
  exs.push(inputExercise(
    'first-host-classic',
    'Erster Host',
    `Erster nutzbarer Host in ${calculateNetworkId(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix)}/${CLASSIC_EXAMPLE.prefix}?`,
    calculateFirstHost(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix),
    'Der erste Host ist die Netz-ID plus eins.'
  ));
  exs.push(inputExercise(
    'last-host-classic',
    'Letzter Host',
    `Letzter nutzbarer Host in ${calculateNetworkId(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix)}/${CLASSIC_EXAMPLE.prefix}?`,
    calculateLastHost(CLASSIC_EXAMPLE.ip, CLASSIC_EXAMPLE.prefix),
    'Der letzte Host ist die Broadcast-Adresse minus eins.'
  ));
  exs.push(inputExercise(
    'usable-hosts-classic',
    'Nutzbare Hosts',
    `Wie viele nutzbare Hosts hat ein /${CLASSIC_EXAMPLE.prefix}?`,
    calculateUsableHosts(CLASSIC_EXAMPLE.prefix),
    `${calculateTotalAddresses(CLASSIC_EXAMPLE.prefix)} Adressen insgesamt minus Netz-ID und Broadcast ergibt ${calculateUsableHosts(CLASSIC_EXAMPLE.prefix)} nutzbare Hosts.`
  ));

  // Intuitive example exercises.
  INTUITIVE_EXAMPLES.forEach((ex, idx) => {
    exs.push(inputExercise(
      `network-intuitive-${idx}`,
      'Netz-ID intuitiv',
      `Netz-ID von ${ex.ip}/${ex.prefix}?`,
      ex.network,
      `Im ${getRelevantOctet(ex.prefix) + 1}. Oktett sind die Sprünge ${calculateJumpSize(ex.prefix)} groß. ${ex.ip.split('.')[getRelevantOctet(ex.prefix)]} liegt im Block ${getSubnetBlockBounds(ex.ip, ex.prefix).lower}.`
    ));
    exs.push(inputExercise(
      `broadcast-intuitive-${idx}`,
      'Broadcast intuitiv',
      `Broadcast von ${ex.ip}/${ex.prefix}?`,
      ex.broadcast,
      `Im Block bis ${getSubnetBlockBounds(ex.ip, ex.prefix).upper} endet der Broadcast bei ${ex.broadcast}.`
    ));
  });

  // Mixed input exercises.
  const mixed = [
    { ip: '172.16.200.10', prefix: 18 },
    { ip: '192.168.1.130', prefix: 27 },
    { ip: '10.0.0.1', prefix: 8 },
  ];
  mixed.forEach((m, idx) => {
    exs.push(inputExercise(
      `network-mixed-${idx}`,
      'Netz-ID',
      `Netz-ID von ${m.ip}/${m.prefix}?`,
      calculateNetworkId(m.ip, m.prefix),
      `veränderliches Oktett: ${getHostOctet(m.prefix) + 1}, Sprungweite: ${calculateJumpSize(m.prefix)}.`
    ));
    exs.push(inputExercise(
      `broadcast-mixed-${idx}`,
      'Broadcast',
      `Broadcast von ${m.ip}/${m.prefix}?`,
      calculateBroadcast(m.ip, m.prefix),
      `Der Block endet bei ${getSubnetBlockBounds(m.ip, m.prefix).upper} im ${getHostOctet(m.prefix) + 1}. Oktett.`
    ));
    exs.push(inputExercise(
      `first-host-mixed-${idx}`,
      'Erster Host',
      `Erster Host in ${calculateNetworkId(m.ip, m.prefix)}/${m.prefix}?`,
      calculateFirstHost(m.ip, m.prefix),
      'Netz-ID plus eins.'
    ));
  });

  // Select-block and find-error exercises.
  exs.push(selectBlockExercise('select-block-1', '192.168.50.75', 26));
  exs.push(selectBlockExercise('select-block-2', '10.10.200.5', 22));
  exs.push(findErrorExercise('find-error-1', '192.168.1.50', 26, 'netzid'));
  exs.push(findErrorExercise('find-error-2', '10.25.140.18', 21, 'letzter'));

  // Guided and adaptive special exercises.
  exs.push({
    id: 'guided-subnetting',
    type: 'guided-subnetting',
    ip: '192.168.1.50',
    prefix: 26,
    title: 'Geführte Berechnung',
    explanation: 'Schritt für Schritt durch ein Subnetting-Problem.',
  });

  exs.push({
    id: 'adaptive-subnetting',
    type: 'adaptive-subnetting',
    title: 'Adaptive Übung',
    explanation: 'Die Schwierigkeit passt sich deinen Antworten an.',
  });

  exs.push({
    id: 'subnetting-requirements-trainer',
    type: 'adaptive-subnet-requirements',
    title: 'NEXUS-Anforderungs-Trainer',
    explanation: 'Erkenne zuerst den Aufgabentyp und bestimme dann Bits, Präfix und Sprungweite.',
  });

  exs.push({
    id: 'subnetting-difficulty-drill',
    type: 'difficulty-drill',
    generator: 'subnetting',
    title: 'Subnetting-Trainer',
    explanation: 'Zufällige Subnetting-Aufgaben mit steigender Schwierigkeit. Bestehe die Prüfung pro Stufe.',
  });

  return exs;
}

function buildQuiz() {
  const problems = generateUniqueSubnetProblems(8, { prefixMin: 16, prefixMax: 30 });
  const calculated = problems.map((p, i) => {
    const variants = [
      {
        question: `Netz-ID von ${p.ip}/${p.prefix}?`,
        options: [p.network, p.broadcast, p.firstHost, p.lastHost],
        correct: 0,
      },
      {
        question: `Broadcast von ${p.ip}/${p.prefix}?`,
        options: [p.network, p.broadcast, p.firstHost, p.lastHost],
        correct: 1,
      },
      {
        question: `Erster Host in ${p.network}/${p.prefix}?`,
        options: [p.firstHost, p.lastHost, p.network, p.broadcast],
        correct: 0,
      },
      {
        question: `Letzter Host in ${p.network}/${p.prefix}?`,
        options: [p.firstHost, p.lastHost, p.network, p.broadcast],
        correct: 1,
      },
    ];
    const selected = variants[i % variants.length];
    return {
      id: `subnetting-quiz-${i}`,
      question: selected.question,
      options: selected.options,
      correct: selected.correct,
      explanation: `Für ${p.ip}/${p.prefix}: Netz-ID ${p.network}, Broadcast ${p.broadcast}, erster Host ${p.firstHost}, letzter Host ${p.lastHost}.`,
    };
  });
  return [
    { facet: 'subnetting-definition', question: 'Was bewirkt Subnetting?', options: ['Es teilt einen vorhandenen Adressraum in kleinere Netze.', 'Es erzeugt zusätzliche IPv4-Adressen.', 'Es entfernt den Hostanteil vollständig.'], correct: 0, explanation: 'Subnetting verschiebt die Grenze zwischen Netz- und Hostanteil innerhalb des vorhandenen Adressraums.' },
    { facet: 'subnet-count', question: 'Wie viele zusätzliche Netzbits braucht man mindestens für sechs gleich große Subnetze?', options: ['3', '6', '2'], correct: 0, explanation: '2² = 4 reicht nicht, 2³ = 8 deckt sechs benötigte Netze ab.' },
    { facet: 'host-count', question: 'Welches Präfix bietet in einem normalen IPv4-Hostnetz mindestens 50 nutzbare Hosts?', options: ['/26', '/27', '/28'], correct: 0, explanation: '/26 lässt sechs Hostbits: 64 Gesamtadressen minus Netz-ID und Broadcast ergeben 62 Hosts.' },
    { facet: 'tradeoff', question: 'Was passiert bei einem größeren Präfix?', options: ['Es entstehen kleinere Netze mit weniger Hostkapazität.', 'Das einzelne Netz wird größer.', 'Die Gesamtzahl der IPv4-Adressen wächst.'], correct: 0, explanation: 'Mehr Präfixbits sind mehr Netzbits; entsprechend bleiben weniger Hostbits.' },
    { facet: 'vlsm-transition', question: 'Was unterscheidet Fixed-Length Subnetting von VLSM?', options: ['Fixed-Length erzeugt gleich große Netze; VLSM erlaubt unterschiedliche Größen.', 'VLSM erzeugt zusätzliche IPv4-Adressen.', 'Fixed-Length besitzt keine Netz-IDs.'], correct: 0, explanation: 'Unterschiedliche Anforderungen werden später mit VLSM und variablen Präfixen geplant.' },
    ...calculated,
  ];
}

export function buildSubnettingLesson() {
  return {
    title: 'Subnetting',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'Subnetting teilt einen vorhandenen Adressraum in kleinere, gleich große Netze und erzeugt keine neuen IPv4-Adressen.',
      'Netzanzahl und Hostbedarf sind zwei unterschiedliche Ausgangsfragen.',
      'Mehr Netzbits ergeben mehr kleinere Netze; mehr Hostbits ergeben weniger, aber größere Netze.',
      'Die klassische Methode geht Schritt für Schritt über die Subnetzmaske.',
      'Die intuitive Methode nutzt die Sprungweiten-Reihe 128, 64, 32, 16, 8, 4, 2, 1.',
      'Netz-ID = Blockanfang, Broadcast = Blockende.',
      'Erster Host = Netz-ID + 1, letzter Host = Broadcast − 1.',
      'Nutzbare Hosts = Gesamtadressen − 2 in den normalen Hostnetzen dieser Übungen.',
      'VLSM folgt separat, wenn unterschiedlich große Subnetze benötigt werden.',
    ],
  };
}
