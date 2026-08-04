import { topicKey } from '../academyTopics.js';
import {
  prefixToSubnetMask,
  hostsToPrefix,
  prefixToHosts,
  generateVlsmProblem,
} from '../networking/ipv4Math.js';

export const VLSM_TOPIC_KEY = topicKey('fundamentals', 'vlsm');

function buildExplanations() {
  const exps = [];

  exps.push({
    id: 'vlsm-concept-classic',
    title: 'Warum VLSM?',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'In klassischem Subnetting sind alle Subnetze gleich groß. In der Praxis brauchen Abteilungen aber unterschiedlich viele Hosts: Das Büro hat 60 Mitarbeiter, ein Technikraum nur 10.' },
      { type: 'text', content: 'Variable Length Subnet Masking (VLSM) erlaubt unterschiedlich große Subnetze innerhalb desselben Netzes. So verschwendest du keine Adressen.' },
      { type: 'list', title: 'Zentrale Idee', items: [
        'Zuerst das größte Subnetz planen',
        'Danach das nächstgrößte an den freien Block anschließen',
        'Jedes Subnetz bekommt den kleinstmöglichen, passenden Präfix',
        'Freie Lücken können später für kleinere Subnetze genutzt werden',
      ] },
    ],
  });

  const EXAMPLE = generateVlsmProblem();

  exps.push({
    id: 'vlsm-method',
    title: 'VLSM-Schritt für Schritt',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Gegeben ist ein Basisnetz. Du bekommst eine Liste mit benötigten Hosts. Sortiere absteigend und rechne jedem Subnetz den passenden Präfix aus.' },
      { type: 'text', content: `Beispiel: Basisnetz ${EXAMPLE.baseNetwork}/${EXAMPLE.basePrefix}` },
      { type: 'text', content: `Benötigte Hosts: ${EXAMPLE.requiredHosts.join(', ')}` },
      { type: 'list', title: 'Vorgehen', items: [
        'Hosts sortieren: größte zuerst',
        'Aus Hosts den kleinsten passenden Präfix berechnen',
        'Blockgröße bestimmen und Netz-ID ausrichten',
        'Nächstes Subnetz direkt anschließen',
      ] },
      ...EXAMPLE.allocations.flatMap((alloc, i) => [
        { type: 'text', content: `Subnetz ${i + 1}: ${alloc.requiredHosts} Hosts → /${alloc.prefix}` },
        { type: 'list', title: 'Werte', items: [
          `Netz-ID: ${alloc.network}/${alloc.prefix}`,
          `Subnetzmaske: ${prefixToSubnetMask(alloc.prefix).decimal}`,
          `Broadcast: ${alloc.broadcast}`,
          `Erster Host: ${alloc.firstHost}`,
          `Letzter Host: ${alloc.lastHost}`,
          `Nutzbare Hosts: ${alloc.usableHosts}`,
        ] },
      ]),
    ],
  });

  exps.push({
    id: 'vlsm-intuitive',
    title: 'Die Faustregel',
    style: 'intuitive',
    blocks: [
      { type: 'text', content: 'VLSM ist wie Tetris mit Adressblöcken. Du hast einen großen Kasten und musst kleinere Kästchen so reinpacken, dass möglichst wenig Platz verloren geht.' },
      { type: 'text', content: 'Wenn 60 Hosts benötigt werden, braucht das Kästchen Platz für mindestens 62 Adressen. Die nächste Zweierpotenz ist 64, also 6 Hostbits und ein Präfix von /26.' },
      { type: 'list', title: 'Merksatz', items: [
        'Suche die kleinste Zweierpotenz, die Hosts + 2 aufnimmt',
        '32 minus die Anzahl Hostbits ergibt den Präfix',
        'Reihe die Blöcke direkt aneinander',
      ] },
    ],
  });

  exps.push({
    id: 'vlsm-summary',
    title: 'Zusammenfassung',
    style: 'classic',
    blocks: [
      { type: 'list', title: 'Wichtigste Regeln', items: [
        'Sortiere Subnetze nach Größe – größte zuerst.',
        'Präfix = 32 − ceil(log2(Hosts + 2)).',
        'Jeder Block muss an einer passenden Grenze beginnen.',
        'Restliche Lücken können später kleinere Subnetze aufnehmen.',
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

function buildExercises() {
  const exs = [];

  exs.push(inputExercise(
    'vlsm-prefix-60',
    'Präfix aus Hosts',
    'Wie lautet der kleinste Präfix für 60 Hosts?',
    hostsToPrefix(60),
    '60 Hosts + 2 = 62 Adressen. Die nächste Zweierpotenz ist 64 = 2^6, also 6 Hostbits und Präfix /26.',
    '/__'
  ));

  exs.push(inputExercise(
    'vlsm-prefix-5',
    'Präfix aus Hosts',
    'Wie lautet der kleinste Präfix für 5 Hosts?',
    hostsToPrefix(5),
    '5 Hosts + 2 = 7 Adressen. Die nächste Zweierpotenz ist 8 = 2^3, also 3 Hostbits und Präfix /29.',
    '/__'
  ));

  exs.push(inputExercise(
    'vlsm-usable-28',
    'Nutzbare Hosts',
    'Wie viele nutzbare Hosts bietet ein /27?',
    prefixToHosts(27),
    'Ein /27 hat 5 Hostbits = 32 Adressen. Abzüglich Netz-ID und Broadcast bleiben 30 nutzbare Hosts.',
  ));

  const p1 = generateVlsmProblem();
  exs.push({
    id: 'vlsm-order',
    type: 'ordering',
    title: 'Reihenfolge bei VLSM',
    question: 'Ordne die Planungsschritte in die richtige Reihenfolge.',
    items: [
      'Subnetze nach benötigten Hosts sortieren',
      'Größten benötigten Block berechnen',
      'Block an freier Stelle platzieren',
      'Nächstgrößeren Block anschließen',
    ],
    correctOrder: ['0', '1', '2', '3'],
    explanation: 'Zuerst sortieren, dann den größten Block berechnen und platzieren, anschließend die nächsten Blöcke anreihen.',
  });

  exs.push(inputExercise(
    'vlsm-network-largest',
    'Netz-ID des größten Subnetzes',
    `Bei Basisnetz ${p1.baseNetwork}/${p1.basePrefix} und ${p1.requiredHosts.join('/')} Hosts: Wie lautet die Netz-ID des größten Subnetzes?`,
    p1.allocations.find((a) => a.requiredHosts === Math.max(...p1.requiredHosts)).network,
    'Das größte Subnetz bekommt den kleinsten Präfix und beginnt am Anfang des Basisnetzes.',
  ));

  const p2 = generateVlsmProblem();
  exs.push(inputExercise(
    'vlsm-prefix-largest',
    'Präfix des größten Subnetzes',
    `Bei ${p2.requiredHosts.join('/')} Hosts: Welchen Präfix braucht das größte Subnetz?`,
    p2.allocations.find((a) => a.requiredHosts === Math.max(...p2.requiredHosts)).prefix,
    'Der größte Hostbedarf bestimmt den größten Adressblock.',
    '/__'
  ));

  return exs;
}

function buildQuiz() {
  const problems = Array.from({ length: 3 }, () => generateVlsmProblem());
  const questions = [];
  problems.forEach((p, i) => {
    const largest = p.allocations.reduce((max, a) => (a.requiredHosts > max.requiredHosts ? a : max), p.allocations[0]);
    const smallest = p.allocations.reduce((min, a) => (a.requiredHosts < min.requiredHosts ? a : min), p.allocations[0]);
    questions.push({
      id: `vlsm-quiz-${i}-a`,
      question: `Welcher Präfix passt für ${largest.requiredHosts} Hosts?`,
      options: [`/${largest.prefix}`, `/${largest.prefix + 1}`, `/${largest.prefix - 1}`],
      correct: 0,
      explanation: `Für ${largest.requiredHosts} Hosts benötigt man mindestens ${largest.requiredHosts + 2} Adressen, also /${largest.prefix}.`,
    });
    questions.push({
      id: `vlsm-quiz-${i}-b`,
      question: `Wie viele nutzbare Hosts hat ein /${smallest.prefix}?`,
      options: [prefixToHosts(smallest.prefix), prefixToHosts(smallest.prefix) + 2, prefixToHosts(smallest.prefix) - 2].map(String),
      correct: 0,
      explanation: `Ein /${smallest.prefix} hat ${prefixToHosts(smallest.prefix) + 2} Adressen, abzüglich Netz-ID und Broadcast bleiben ${prefixToHosts(smallest.prefix)} Hosts.`,
    });
  });
  return questions;
}

export function buildVlsmLesson() {
  return {
    title: 'VLSM',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'VLSM erlaubt unterschiedlich große Subnetze im selben Netz.',
      'Sortiere Subnetze nach Größe, größte zuerst.',
      'Präfix = 32 − ceil(log2(Hosts + 2)).',
      'Blöcke werden direkt aneinandergereiht, freie Lücken bleiben nutzbar.',
    ],
  };
}
