import { topicKey } from '../academyTopics.js';
import {
  prefixToSubnetMask,
  getRelevantOctet,
  calculateJumpSize,
  calculateNetworkId,
  calculateBroadcast,
  calculateFirstHost,
  calculateLastHost,
  calculateTotalAddresses,
  calculateUsableHosts,
  getSubnetBlockBounds,
  generateUniqueSubnetProblems,
} from '../networking/ipv4Math.js';

export const SUBNETTING_TOPIC_KEY = topicKey('fundamentals', 'subnetting');

const CLASSIC_EXAMPLE = { ip: '192.168.1.50', prefix: 26 };
const INTUITIVE_EXAMPLES = [
  { ip: '192.168.199.3', prefix: 20, network: '192.168.192.0', broadcast: '192.168.207.255' },
  { ip: '10.25.140.18', prefix: 21, network: '10.25.136.0', broadcast: '10.25.143.255' },
];

function buildExplanations() {
  const exps = [];

  // ---------- Classic explanation ----------
  exps.push({
    id: 'subnetting-concept-classic',
    title: 'Was ist ein Subnetz?',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Stell dir ein großes Firmengebäude vor. Nicht jeder Mitarbeiter muss mit jedem gleichzeitig kommunizieren. Deshalb teilen wir große Netzwerke in kleinere Bereiche – sogenannte Subnetze.' },
      { type: 'text', content: 'Subnetting reduziert Broadcasts, erhöht die Sicherheit und macht das Netz übersichtlicher. Jeder Bereich bekommt einen eigenen Adressraum.' },
      { type: 'list', title: 'Warum Subnetting?', items: [
        'Weniger Broadcast-Traffic pro Teilnetz',
        'Einfachere Fehlersuche durch klar abgegrenzte Bereiche',
        'Bessere Sicherheit: kritische Abteilungen können getrennt werden',
        'Effizientere Adressvergabe, weil große Blöcke passend aufgeteilt werden',
      ] },
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
        `relevantes Oktett: ${getRelevantOctet(CLASSIC_EXAMPLE.prefix) + 1}. Oktett`,
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
          `${ex.prefix} liegt im ${getRelevantOctet(ex.prefix) + 1}. Oktett`,
          `Sprungweite: ${calculateJumpSize(ex.prefix)}`,
          `${ex.ip.split('.')[getRelevantOctet(ex.prefix)]} liegt im Block ${getSubnetBlockBounds(ex.ip, ex.prefix).lower} bis ${getSubnetBlockBounds(ex.ip, ex.prefix).upper}`,
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
    question,
    acceptedAnswers: [String(answer)],
    placeholder,
    explanation,
  };
}

function selectBlockExercise(id, ip, prefix) {
  const correct = calculateNetworkId(ip, prefix);
  const broadcast = calculateBroadcast(ip, prefix);
  const jump = calculateJumpSize(prefix);
  const relevant = getRelevantOctet(prefix) + 1;
  const bounds = getSubnetBlockBounds(ip, prefix);
  const octetValue = Number(ip.split('.')[getRelevantOctet(prefix)]);
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
    `Bei ${CLASSIC_EXAMPLE.ip}/${CLASSIC_EXAMPLE.prefix}: Welches Oktett ist relevant? (1-4)`,
    getRelevantOctet(CLASSIC_EXAMPLE.prefix) + 1,
    `Das Präfix /${CLASSIC_EXAMPLE.prefix} endet im ${getRelevantOctet(CLASSIC_EXAMPLE.prefix) + 1}. Oktett, weil es zwischen 25 und 32 liegt.`
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
      `Relevantes Oktett: ${getRelevantOctet(m.prefix) + 1}, Sprungweite: ${calculateJumpSize(m.prefix)}.`
    ));
    exs.push(inputExercise(
      `broadcast-mixed-${idx}`,
      'Broadcast',
      `Broadcast von ${m.ip}/${m.prefix}?`,
      calculateBroadcast(m.ip, m.prefix),
      `Der Block endet bei ${getSubnetBlockBounds(m.ip, m.prefix).upper} im ${getRelevantOctet(m.prefix) + 1}. Oktett.`
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
  return problems.map((p, i) => {
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
}

export function buildSubnettingLesson() {
  return {
    title: 'Subnetting',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'Subnetting teilt Netze in kleinere, übersichtliche Bereiche.',
      'Die klassische Methode geht Schritt für Schritt über die Subnetzmaske.',
      'Die intuitive Methode nutzt die Sprungweiten-Reihe 128, 64, 32, 16, 8, 4, 2, 1.',
      'Netz-ID = Blockanfang, Broadcast = Blockende.',
      'Erster Host = Netz-ID + 1, letzter Host = Broadcast − 1.',
      'Nutzbare Hosts = Gesamtadressen − 2.',
    ],
  };
}
