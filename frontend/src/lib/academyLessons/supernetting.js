import { topicKey } from '../academyTopics.js';
import {
  generateSupernetProblem,
} from '../networking/ipv4Math.js';

export const SUPERNETTING_TOPIC_KEY = topicKey('fundamentals', 'supernetting');

function buildExplanations() {
  const exps = [];

  exps.push({
    id: 'supernetting-concept-classic',
    title: 'Warum Supernetting?',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Wenn ein Router viele kleine Netze kennt, die alle nebeneinander liegen, kann er sie zu einer größeren Route zusammenfassen. Das nennt man Supernetting oder Route Summarization.' },
      { type: 'text', content: 'Statt vier einzelne /24-Netze in der Routing-Tabelle zu halten, reicht oft eine einzige /22-Route.' },
      { type: 'list', title: 'Vorteile', items: [
        'Kleinere Routing-Tabellen',
        'Weniger Speicher auf Routern',
        'Schnellere Konvergenz bei Änderungen',
        'Übersichtlichere Netzstruktur',
      ] },
    ],
  });

  const EXAMPLE = generateSupernetProblem();

  exps.push({
    id: 'supernetting-method',
    title: 'Zusammenfassung berechnen',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Finde die gemeinsamen Bits aller zu fassenden Netzwerkadressen. Von links beginnend zählen, wie viele Bits in allen Adressen identisch sind.' },
      { type: 'text', content: `Beispiel: ${EXAMPLE.networks.join(', ')}` },
      { type: 'list', title: 'Lösung', items: [
        'Adressen sortieren: kleinste zuerst',
        `Erste und letzte Adresse vergleichen: ${EXAMPLE.ranges[0].networkId} bis ${EXAMPLE.ranges[EXAMPLE.ranges.length - 1].broadcast}`,
        `Gemeinsame führende Bits: ${EXAMPLE.commonBits}`,
        `Zusammenfassung: ${EXAMPLE.superNetwork}/${EXAMPLE.superPrefix}`,
        `Adressumfang der Zusammenfassung: ${EXAMPLE.totalAddresses}`,
      ] },
    ],
  });

  exps.push({
    id: 'supernetting-intuitive',
    title: 'Blockhöhen verstehen',
    style: 'intuitive',
    blocks: [
      { type: 'text', content: 'Stell dir eine Straße mit Hausnummern vor. Supernetting fasst alle Häuser in einem bestimmten Straßenabschnitt zusammen, statt jede Hausnummer einzeln anzugeben.' },
      { type: 'text', content: 'Wichtig: Die Häuser müssen lückenlos nebeneinander liegen. Wenn eine Nummer fehlt, passt die Zusammenfassung nicht mehr.' },
      { type: 'list', title: 'Faustregel', items: [
        'Alle Netze müssen dieselbe Größe haben',
        'Die Netzwerkadressen müssen an Blockgrenzen liegen',
        'Die Anzahl muss eine Zweierpotenz sein',
      ] },
    ],
  });

  exps.push({
    id: 'supernetting-summary',
    title: 'Zusammenfassung',
    style: 'classic',
    blocks: [
      { type: 'list', title: 'Merke', items: [
        'Supernetting fasst benachbarte Netze zu einer größeren Route zusammen.',
        'Gemeinsame Präfixbits bestimmen die Zusammenfassung.',
        'Die zusammengefassten Netze müssen einen zusammenhängenden Bereich bilden.',
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
    acceptedAnswers: [String(answer)],
    placeholder,
    explanation,
  };
}

function buildExercises() {
  const exs = [];

  const p1 = generateSupernetProblem();
  exs.push(inputExercise(
    'supernetting-prefix',
    'Gemeinsamer Präfix',
    `Welchen Präfix haben ${p1.networks.join(' und ')} gemeinsam?`,
    p1.superPrefix,
    `Erste Netz-ID ${p1.ranges[0].networkId}, letzte Broadcast ${p1.ranges[p1.ranges.length - 1].broadcast}. Gemeinsame Bits: ${p1.commonBits}.`,
    '/__'
  ));

  exs.push(inputExercise(
    'supernetting-network',
    'Zusammenfassende Netz-ID',
    `Wie lautet die zusammenfassende Netz-ID für ${p1.networks.join(' und ')}?`,
    p1.superNetwork,
    `Die Netz-ID ergibt sich aus den gemeinsamen Bits: ${p1.superNetwork}/${p1.superPrefix}.`,
  ));

  const p2 = generateSupernetProblem();
  exs.push({
    id: 'supernetting-select',
    type: 'select-best',
    title: 'Richtige Zusammenfassung',
    question: `Welche Route fasst ${p2.networks.join(' und ')} korrekt zusammen?`,
    options: [
      `${p2.superNetwork}/${p2.superPrefix}`,
      `${p2.distractors[0] || p2.superNetwork}/${p2.superPrefix - 1}`,
      `${p2.superNetwork}/${p2.superPrefix + 1}`,
      `${p2.distractors[1] || p2.superNetwork}/${p2.superPrefix}`,
    ],
    correct: 0,
    explanation: `Gemeinsamer Präfix: /${p2.superPrefix}, Netz-ID: ${p2.superNetwork}.`,
  });

  exs.push({
    id: 'supernetting-truth',
    type: 'select-best',
    title: 'Wahr oder falsch?',
    question: 'Welche Aussage zu Supernetting ist korrekt?',
    options: [
      'Supernetting verkleinert Routing-Tabellen, indem es benachbarte Netze zusammenfasst.',
      'Supernetting kann beliebige, nicht zusammenhängende Netze zusammenfassen.',
      'Supernetting vergrößert die Anzahl der Einträge in der Routing-Tabelle.',
      'Supernetting funktioniert nur mit IPv6.',
    ],
    correct: 0,
    explanation: 'Supernetting fasst ausschließlich benachbarte Netze zusammen und reduziert so die Routing-Tabelle.',
  });

  return exs;
}

function buildQuiz() {
  const problems = Array.from({ length: 3 }, () => generateSupernetProblem());
  return problems.map((p, i) => ({
    id: `supernetting-quiz-${i}`,
    question: `Welche Route fasst ${p.networks.join(' und ')} korrekt zusammen?`,
    options: [
      `${p.superNetwork}/${p.superPrefix}`,
      `${p.distractors[0] || p.superNetwork}/${p.superPrefix}`,
      `${p.superNetwork}/${p.superPrefix + 1}`,
      `${p.distractors[1] || p.superNetwork}/${p.superPrefix - 1}`,
    ],
    correct: 0,
    explanation: `Gemeinsamer Präfix: /${p.superPrefix}, zusammenfassende Netz-ID: ${p.superNetwork}.`,
  }));
}

export function buildSupernettingLesson() {
  return {
    title: 'Supernetting',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'Supernetting fasst benachbarte Netze zu einer Route zusammen.',
      'Gemeinsame führende Bits bestimmen den neuen Präfix.',
      'Voraussetzung: lückenloser, an Blockgrenzen ausgerichteter Adressbereich.',
    ],
  };
}
