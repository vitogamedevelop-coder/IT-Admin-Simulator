import { topicKey } from '../academyTopics.js';
import { decimalToBinaryOctet, binaryOctetToDecimal } from '../networking/ipv4Math.js';

const BIT_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];

const BIT_SVG = `<svg viewBox="0 0 400 110" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="200" y="18" text-anchor="middle" fill="#c9d1d9" font-size="12">Acht Bits = ein Oktett</text><g fill="#00f0ff" stroke="#00f0ff" stroke-width="2"><rect x="10" y="35" width="40" height="45" rx="4" fill-opacity="0.1"/><rect x="60" y="35" width="40" height="45" rx="4" fill-opacity="0.1"/><rect x="110" y="35" width="40" height="45" rx="4" fill-opacity="0.1"/><rect x="160" y="35" width="40" height="45" rx="4" fill-opacity="0.1"/><rect x="210" y="35" width="40" height="45" rx="4" fill-opacity="0.1"/><rect x="260" y="35" width="40" height="45" rx="4" fill-opacity="0.1"/><rect x="310" y="35" width="40" height="45" rx="4" fill-opacity="0.1"/><rect x="360" y="35" width="40" height="45" rx="4" fill-opacity="0.1"/></g><text x="30" y="65" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">128</text><text x="80" y="65" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">64</text><text x="130" y="65" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">32</text><text x="180" y="65" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">16</text><text x="230" y="65" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">8</text><text x="280" y="65" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">4</text><text x="330" y="65" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">2</text><text x="380" y="65" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">1</text><text x="200" y="95" text-anchor="middle" fill="#8b949e" font-size="11">Jedes Bit ist ein Schalter mit festem Wert.</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Binär für IPv4', 'classic', [
    { type: 'text', content: 'Ein IPv4-Oktett besteht aus acht Bits. Jedes Bit ist entweder 0 oder 1 und hat einen festen Stellenwert. Das linkeste Bit ist 128, das rechteste 1.' },
    { type: 'diagram', content: BIT_SVG },
    { type: 'list', title: 'Die acht Stellenwerte', items: BIT_VALUES.map((v, i) => `Bit ${i + 1}: ${v}`) },
    { type: 'text', content: 'Aktive Bits addierst du. Alle acht Bits gesetzt ergeben 255, keine davon ergibt 0.' },
  ]));

  exps.push(explanation('intro-intuitive', 'Binär für IPv4', 'intuitive', [
    { type: 'text', content: 'Stell dir acht Schalter vor, die von links nach rechts die Werte 128, 64, 32, 16, 8, 4, 2 und 1 besitzen.' },
    { type: 'text', content: 'Ist ein Schalter aus (0), zählt er nicht. Ist er an (1), addierst du seinen Wert. Das ist keine andere Mathematik – wir lesen dieselben acht Bits nur als Schalter.' },
    { type: 'diagram', content: BIT_SVG },
  ]));

  exps.push(explanation('conversion-classic', 'Umrechnen', 'classic', [
    { type: 'text', content: 'Beispiel: 11000000' },
    { type: 'list', title: 'Berechnung', items: [
      'Bit 1 = 128, Bit 2 = 64 sind gesetzt',
      '128 + 64 = 192',
      '11000000 = 192',
    ] },
    { type: 'text', content: 'Beispiel: 11111111 – alle Bits gesetzt: 128+64+32+16+8+4+2+1 = 255.' },
    { type: 'text', content: 'Beispiel: 00000000 – kein Bit gesetzt: 0.' },
  ]));

  exps.push(explanation('conversion-intuitive', 'Umrechnen', 'intuitive', [
    { type: 'text', content: 'Zielzahl 192: Welche Schalter sind an? Der 128er und der 64er passen zusammen. Also sind genau diese beiden Schalter an.' },
    { type: 'text', content: 'Zielzahl 255: Alle Schalter an. Zielzahl 0: Alle Schalter aus. Dazwischen kombinierst du die passenden Werte.' },
  ]));

  exps.push(explanation('why-binary-classic', 'Warum acht Bit?', 'classic', [
    { type: 'text', content: 'IPv4 verwendet vier Oktette. Jedes Oktett hat acht Bit, also insgesamt 32 Bit. Weil acht Bit Werte von 0 bis 255 darstellen können, passt die Notation gut zu dezimalen Punkten wie 192.168.10.25.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'text', content: 'Ein Oktett hat acht Bit mit den Stellenwerten 128, 64, 32, 16, 8, 4, 2, 1. Gesetzte Bits addieren sich. Das Oktett kann daher 0 bis 255 darstellen.' },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'binary-decimal-to-binary',
      type: 'input',
      difficulty: 'easy',
      question: 'Wandle die Dezimalzahl 192 in eine achtstellige Binärzahl um.',
      answers: [decimalToBinaryOctet(192)],
      placeholder: 'z.B. 10101010',
      explanation: '128 + 64 = 192, also sind die ersten beiden Bits 1 und die restlichen 0: 11000000.',
    },
    {
      id: 'binary-decimal-to-binary-240',
      type: 'input',
      difficulty: 'medium',
      question: 'Wandle die Dezimalzahl 240 in acht Bit um.',
      answers: [decimalToBinaryOctet(240)],
      placeholder: 'z.B. 10101010',
      explanation: '128+64+32+16 = 240, also 11110000.',
    },
    {
      id: 'binary-binary-to-decimal',
      type: 'input',
      difficulty: 'easy',
      question: 'Wandle 11000000 in eine Dezimalzahl um.',
      answers: [String(binaryOctetToDecimal('11000000'))],
      placeholder: 'Dezimalzahl eingeben',
      explanation: '128 + 64 = 192.',
    },
    {
      id: 'binary-binary-to-decimal-10101010',
      type: 'input',
      difficulty: 'medium',
      question: 'Wandle 10101010 in eine Dezimalzahl um.',
      answers: [String(binaryOctetToDecimal('10101010'))],
      placeholder: 'Dezimalzahl eingeben',
      explanation: '128 + 32 + 8 + 2 = 170.',
    },
    {
      id: 'binary-error-spot',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Jemand behauptet: 10000000 = 64. Was stimmt nicht?',
      options: [
        'Das linke Bit hat den Wert 128, nicht 64.',
        'Das linke Bit hat den Wert 64.',
        '10000000 hat kein Bit gesetzt.',
      ],
      correct: 0,
      explanation: 'Das höchstwertige Bit links ist 128. 10000000 = 128.',
    },
    {
      id: 'binary-place-values',
      type: 'ordering',
      difficulty: 'easy',
      question: 'Sortiere die acht Stellenwerte von groß nach klein.',
      items: [...BIT_VALUES].sort(() => Math.random() - 0.5).map((v) => ({ id: `v${v}`, label: String(v) })),
      correctOrder: BIT_VALUES.map((v) => `v${v}`),
      explanation: 'Die Reihe lautet: 128, 64, 32, 16, 8, 4, 2, 1.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Welcher Wert hat das linkeste Bit in einem Oktett?', options: ['1', '128', '255', '64'], correct: 1, explanation: 'Das höchstwertige Bit links hat den Wert 128.' },
    { question: 'Wie viele Bit hat ein IPv4-Oktett?', options: ['4', '8', '16', '32'], correct: 1, explanation: 'Ein Oktett besteht aus acht Bit.' },
    { question: 'Was ergibt 11111111?', options: ['0', '128', '255', '256'], correct: 2, explanation: 'Alle acht Bits gesetzt ergeben 255.' },
    { question: 'Was ergibt 00000000?', options: ['255', '128', '0', '1'], correct: 2, explanation: 'Kein Bit gesetzt ergibt 0.' },
    { question: 'Welche Binärdarstellung hat die Dezimalzahl 224?', options: ['11100000', '11000000', '11110000', '10100000'], correct: 0, explanation: '128+64+32 = 224, also 11100000.' },
  ];
}

function buildSummary() {
  return [
    'Ein IPv4-Oktett hat acht Bit.',
    'Die Stellenwerte lauten 128, 64, 32, 16, 8, 4, 2, 1.',
    'Gesetzte Bits werden addiert.',
    'Ein Oktett kann Werte von 0 bis 255 darstellen.',
    'Diese Umrechnung ist die Grundlage für Subnetzmasken.',
  ];
}

export function buildBinarySystemLesson() {
  return {
    title: 'Binärsystem für IPv4',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}

export const BINARY_SYSTEM_TOPIC_KEY = topicKey('fundamentals', 'binary-system');
