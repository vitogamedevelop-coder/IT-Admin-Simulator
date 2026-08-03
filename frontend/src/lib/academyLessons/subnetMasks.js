import { topicKey } from '../academyTopics.js';
import { prefixToSubnetMask, subnetMaskToPrefix } from '../networking/ipv4Math.js';

const CHEAT_VALUES = [
  { bits: 0, value: 0 },
  { bits: 1, value: 128 },
  { bits: 2, value: 192 },
  { bits: 3, value: 224 },
  { bits: 4, value: 240 },
  { bits: 5, value: 248 },
  { bits: 6, value: 252 },
  { bits: 7, value: 254 },
  { bits: 8, value: 255 },
];

const MASK_SVG = `<svg viewBox="0 0 400 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="200" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12">/26 = 255.255.255.192</text><g transform="translate(10,35)"><rect x="0" y="0" width="260" height="45" rx="4" fill="#00f0ff" fill-opacity="0.35" stroke="#00f0ff" stroke-width="2"/><rect x="260" y="0" width="60" height="45" rx="4" fill="#8b949e" fill-opacity="0.25" stroke="#8b949e" stroke-width="2"/><text x="130" y="28" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">26 Netzbits</text><text x="290" y="28" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">6 Hostbits</text></g><text x="200" y="105" text-anchor="middle" fill="#8b949e" font-size="11">Die ersten 24 Bit in den ersten drei Oktetten plus 2 Bit im vierten Oktett.</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Subnetzmasken', 'classic', [
    { type: 'text', content: 'Die Subnetzmaske zeigt, welche Bits einer IPv4-Adresse zum Netzanteil und welche zum Hostanteil gehören. Gesetzte Netzbits sind 1, Hostbits sind 0.' },
    { type: 'text', content: 'Der CIDR-Präfix sagt dir, wie viele Einsen von links gesetzt werden. Aus dem Präfix lässt sich die Maske berechnen.' },
  ]));

  exps.push(explanation('prefix-to-mask-classic', 'Vom Präfix zur Maske', 'classic', [
    { type: 'text', content: 'Bei /24 sind die ersten 24 Bit 1 und die restlichen 8 Bit 0. Das ergibt 11111111.11111111.11111111.00000000 oder 255.255.255.0.' },
    { type: 'text', content: 'Bei /26 sind 26 Bit 1. Die ersten drei Oktette sind voll (24 Bit), im vierten Oktett bleiben 2 Netzbits. 128 + 64 = 192, also ist die Maske 255.255.255.192.' },
    { type: 'diagram', content: MASK_SVG },
  ]));

  exps.push(explanation('bitwerte-classic', 'Bitwerte eines Oktetts', 'classic', [
    { type: 'text', content: 'Diese Bitwerte gelten für jedes einzelne Oktett einer IPv4-Adresse:' },
    { type: 'text', content: '128 | 64 | 32 | 16 | 8 | 4 | 2 | 1' },
    { type: 'text', content: 'Jedes gesetzte Bit addiert seinen Stellenwert zum Oktett-Wert. Daraus ergibt sich für jede Anzahl gesetzter Netzbits ein fester Maskenwert:' },
    { type: 'list', title: 'Beispiele', items: [
      '1 Netzbit: 10000000 = 128',
      '2 Netzbits: 11000000 = 192',
      '3 Netzbits: 11100000 = 224',
      '4 Netzbits: 11110000 = 240',
    ] },
  ]));

  exps.push(explanation('prefix-tabelle-classic', 'Präfixe im relevanten Oktett', 'classic', [
    { type: 'text', content: 'Im vierten Oktett (Präfixe /25 bis /32) ergeben sich folgende Maskenwerte:' },
    { type: 'table', headers: ['Präfix', 'Netzbits', 'Maskenwert'], rows: [
      ['/25', '1', '128'],
      ['/26', '2', '192'],
      ['/27', '3', '224'],
      ['/28', '4', '240'],
      ['/29', '5', '248'],
      ['/30', '6', '252'],
      ['/31', '7', '254'],
      ['/32', '8', '255'],
    ] },
    { type: 'text', content: 'Dasselbe Prinzip gilt genauso für alle anderen Oktette: /17 bis /24 im dritten, /9 bis /16 im zweiten, /1 bis /8 im ersten.' },
  ]));

  exps.push(explanation('sprungweiten-classic', 'Sprungweiten', 'classic', [
    { type: 'text', content: 'Die Sprungweite sagt dir, wie groß ein Subnetzblock im relevanten Oktett ist. Sie ergibt sich direkt aus dem Maskenwert:' },
    { type: 'table', headers: ['Präfix', 'Maskenwert', 'Sprungweite'], rows: [
      ['/25', '128', '128'],
      ['/26', '192', '64'],
      ['/27', '224', '32'],
      ['/28', '240', '16'],
      ['/29', '248', '8'],
      ['/30', '252', '4'],
      ['/31', '254', '2'],
      ['/32', '255', '1'],
    ] },
    { type: 'text', content: 'Sprungweite = 256 − Maskenwert' },
    { type: 'list', title: 'Beispiele', items: [
      '256 − 192 = 64',
      '256 − 224 = 32',
      '256 − 240 = 16',
    ] },
    { type: 'text', content: 'Diese Tabellen sind keine Auswendiglernhilfe, sondern zeigen nur das Prinzip. Ziel ist es, später alles selbst aus den Bitwerten herleiten zu können. Das entspricht genau der Lernmethode, die wir in der gesamten Academy verfolgen.' },
  ]));

  exps.push(explanation('prefix-to-mask-intuitive', 'Sprungweite im relevanten Oktett', 'intuitive', [
    { type: 'text', content: 'Nutze die Stellenwertreihe 128, 64, 32, 16, 8, 4, 2, 1. Im relevanten Oktett addierst du so viele Werte von links zusammen, wie dort Netzbits gesetzt sind.' },
    { type: 'text', content: 'Bei /20 sind 16 vollständige Netzbits in den ersten beiden Oktetten und 4 weitere im dritten. 128 + 64 + 32 + 16 = 240. Maske: 255.255.240.0.' },
    { type: 'text', content: 'Dieser Denkweg ist die Vorbereitung für die spätere Sprungweiten-Methode. Im nächsten Schritt nutzen wir genau dieses Oktett, um Netz-ID und Broadcast zu finden.' },
  ]));

  exps.push(explanation('relevant-octet-classic', 'Relevantes Oktett', 'classic', [
    { type: 'text', content: 'Das relevante Oktett ist das Oktett, in dem der Präfix die Grenze zwischen Netz- und Hostanteil durchschneidet.' },
    { type: 'list', title: 'Regel', items: [
      '/1 bis /8 → erstes Oktett',
      '/9 bis /16 → zweites Oktett',
      '/17 bis /24 → drittes Oktett',
      '/25 bis /32 → viertes Oktett',
    ] },
    { type: 'text', content: 'Bei /24 ist die Grenze genau am Ende des dritten Oktetts. Das vierte Oktett ist dann vollständig Hostanteil.' },
  ]));

  exps.push(explanation('valid-mask-classic', 'Gültige und ungültige Masken', 'classic', [
    { type: 'text', content: 'Eine normale Subnetzmaske besteht aus zusammenhängenden Einsen gefolgt von Nullen. 255.255.255.0 ist gültig, 255.0.255.0 ist es nicht, weil die Einsen nicht mehr zusammenhängen.' },
    { type: 'text', content: 'In speziellen Szenarien können auch andere Muster auftreten, aber für das klassische Subnetting gilt die Regel: erst Einsen, dann Nullen.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'text', content: 'Der Präfix bestimmt die Maske. Gesetzte Bits sind Netzbits, der Rest Hostbits. Der Maskenwert im relevanten Oktett ergibt sich aus der Summe der Stellenwerte.' },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'subnet-prefix-to-mask',
      type: 'input',
      difficulty: 'easy',
      question: 'Welche Subnetzmaske gehört zu /24?',
      answers: [prefixToSubnetMask(24).decimal],
      placeholder: 'z.B. 255.255.0.0',
      explanation: 'Bei /24 sind die ersten 24 Bit 1, also 255.255.255.0.',
    },
    {
      id: 'subnet-prefix-to-mask-26',
      type: 'input',
      difficulty: 'medium',
      question: 'Welche Subnetzmaske gehört zu /26?',
      answers: [prefixToSubnetMask(26).decimal],
      placeholder: 'z.B. 255.255.0.0',
      explanation: 'Bei /26 sind 26 Bit 1. Im vierten Oktett: 128 + 64 = 192.',
    },
    {
      id: 'subnet-mask-to-prefix',
      type: 'input',
      difficulty: 'medium',
      question: 'Welcher Präfix gehört zur Maske 255.255.255.192?',
      answers: [String(subnetMaskToPrefix('255.255.255.192'))],
      placeholder: 'z.B. 24',
      explanation: '192 = 11000000, das sind 2 zusätzliche Netzbits. 24 + 2 = /26.',
    },
    {
      id: 'subnet-mask-to-prefix-240',
      type: 'input',
      difficulty: 'medium',
      question: 'Welcher Präfix gehört zur Maske 255.255.240.0?',
      answers: [String(subnetMaskToPrefix('255.255.240.0'))],
      placeholder: 'z.B. 24',
      explanation: '240 = 11110000, also 4 zusätzliche Netzbits im dritten Oktett. 16 + 4 = /20.',
    },
    {
      id: 'subnet-relevant-octet',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Bei /26 ist welches Oktett das relevante?',
      options: ['Erstes', 'Zweites', 'Drittes', 'Viertes'],
      correct: 3,
      explanation: '/26 liegt im Bereich /25 bis /32, also ist das vierte Oktett relevant.',
    },
    {
      id: 'subnet-valid-mask',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Welche Maske ist als normale Subnetzmaske gültig?',
      options: ['255.255.255.0', '255.0.255.0', '255.255.240.128', '255.255.255.255.255'],
      correct: 0,
      explanation: 'Eine gültige Maske hat zusammenhängende Einsen gefolgt von Nullen.',
    },
    {
      id: 'subnet-cheat-bits',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Wie viele Netzbits im relevanten Oktett ergeben den Maskenwert 224?',
      options: ['2', '3', '4', '5'],
      correct: 1,
      explanation: '128 + 64 + 32 = 224, also 3 gesetzte Bits.',
    },
    {
      id: 'subnet-table-fill',
      type: 'matching',
      difficulty: 'medium',
      question: 'Ordne den Präfixen die passende Subnetzmaske zu.',
      pairs: [
        { left: '/8', leftLabel: '/8', right: '255.0.0.0' },
        { left: '/16', leftLabel: '/16', right: '255.255.0.0' },
        { left: '/20', leftLabel: '/20', right: '255.255.240.0' },
        { left: '/24', leftLabel: '/24', right: '255.255.255.0' },
        { left: '/30', leftLabel: '/30', right: '255.255.255.252' },
      ],
      explanation: 'Der Präfix legt fest, wie viele Bits 1 sind, der Rest ist 0.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Welche Subnetzmaske gehört zu /16?', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.192'], correct: 1, explanation: '/16 = 255.255.0.0.' },
    { question: 'Welcher Präfix gehört zur Maske 255.255.255.224?', options: ['/24', '/25', '/26', '/27'], correct: 3, explanation: '224 = 11100000, also 3 zusätzliche Netzbits im vierten Oktett: /27.' },
    { question: 'Bei /20 ist welches Oktett relevant?', options: ['Erstes', 'Zweites', 'Drittes', 'Viertes'], correct: 2, explanation: '/17 bis /24 betreffen das dritte Oktett, da /20 in diesem Bereich liegt.' },
    { question: 'Welche Maske ist ungültig?', options: ['255.255.255.0', '255.255.255.192', '255.0.255.0', '255.255.240.0'], correct: 2, explanation: '255.0.255.0 hat nicht zusammenhängende Einsen.' },
    { question: 'Wie viele Netzbits im relevanten Oktett ergeben den Wert 240?', options: ['2', '3', '4', '5'], correct: 2, explanation: '128+64+32+16 = 240, also 4 Bits.' },
  ];
}

function buildSummary() {
  return [
    'Der CIDR-Präfix legt die Anzahl der Netzbits fest.',
    'Aus dem Präfix lässt sich die Subnetzmaske berechnen.',
    'Gültige Masken bestehen aus zusammenhängenden Einsen gefolgt von Nullen.',
    'Das relevante Oktett hängt vom Präfixbereich ab.',
    'Stellenwerte im Oktett: 128, 64, 32, 16, 8, 4, 2, 1.',
  ];
}

export function buildSubnetMasksLesson() {
  return {
    title: 'Subnetzmasken',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}

export const SUBNET_MASKS_TOPIC_KEY = topicKey('fundamentals', 'subnet-masks');
