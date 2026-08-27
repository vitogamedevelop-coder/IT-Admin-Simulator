import { topicKey } from '../academyTopics.js';
import {
  generateSupernetProblem,
  aggregateWithoutExpansion,
  aggregateWithExpansion,
} from '../networking/ipv4Math.js';

export const SUPERNETTING_TOPIC_KEY = topicKey('fundamentals', 'supernetting');

const DIRECTION_SVG = `<svg viewBox="0 0 430 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="105" y="20" text-anchor="middle" fill="#00f0ff" font-size="11">SUBNETTING</text><rect x="24" y="38" width="162" height="30" rx="5" fill="#00f0ff" opacity="0.25" stroke="#00f0ff"/><text x="105" y="57" text-anchor="middle" fill="#c9d1d9" font-size="10">ein /24</text><text x="105" y="88" text-anchor="middle" fill="#ffcc00" font-size="15">↓</text><text x="105" y="112" text-anchor="middle" fill="#c9d1d9" font-size="10">/26 · /26 · /26 · /26</text><text x="325" y="20" text-anchor="middle" fill="#00ff66" font-size="11">SUPERNETTING</text><text x="325" y="52" text-anchor="middle" fill="#c9d1d9" font-size="10">/26 · /26</text><text x="325" y="83" text-anchor="middle" fill="#ffcc00" font-size="15">↓</text><rect x="244" y="98" width="162" height="30" rx="5" fill="#00ff66" opacity="0.2" stroke="#00ff66"/><text x="325" y="117" text-anchor="middle" fill="#c9d1d9" font-size="10">ein /25</text><text x="215" y="142" text-anchor="middle" fill="#8b949e" font-size="10">größeres Präfix → kleineres Netz · kleineres Präfix → größeres Netz</text></svg>`;
const ALIGNMENT_SVG = `<svg viewBox="0 0 430 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><g font-size="9"><rect x="12" y="28" width="100" height="38" fill="#00ff66" opacity="0.25" stroke="#00ff66"/><rect x="112" y="28" width="100" height="38" fill="#00ff66" opacity="0.25" stroke="#00ff66"/><rect x="218" y="28" width="100" height="38" fill="#ff7b72" opacity="0.25" stroke="#ff7b72"/><rect x="318" y="28" width="100" height="38" fill="#ff7b72" opacity="0.25" stroke="#ff7b72"/><text x="62" y="51" text-anchor="middle" fill="#c9d1d9">.0–.63</text><text x="162" y="51" text-anchor="middle" fill="#c9d1d9">.64–.127</text><text x="268" y="51" text-anchor="middle" fill="#c9d1d9">.64–.127</text><text x="368" y="51" text-anchor="middle" fill="#c9d1d9">.128–.191</text></g><text x="112" y="86" text-anchor="middle" fill="#00ff66" font-size="11">gültig: .0/25</text><text x="318" y="86" text-anchor="middle" fill="#ff7b72" font-size="11">nicht als .64/25 ausgerichtet</text><text x="215" y="115" text-anchor="middle" fill="#c9d1d9" font-size="10">Benachbarschaft allein reicht nicht – die neue Netz-ID muss zur Blockgrenze passen.</text><text x="215" y="136" text-anchor="middle" fill="#8b949e" font-size="10">Ohne Erweiterung dürfen außerdem keine Lücken oder fremden Bereiche enthalten sein.</text></svg>`;

function buildExplanations() {
  const exps = [];

  exps.push({
    id: 'supernetting-concept-classic',
    title: 'Warum Supernetting?',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Wenn ein Router viele kleine Netze kennt, die alle nebeneinander liegen, kann er sie zu einer größeren Route zusammenfassen. Das nennt man Supernetting oder Route Summarization.' },
      { type: 'text', content: 'Beim Supernetting wird der Netzanteil kleiner und der Hostanteil größer. Das ist die Gegenrichtung zu Subnetting, bei dem ein Netz in mehrere kleinere Netze zerlegt wird.' },
      { type: 'diagram', content: DIRECTION_SVG },
      { type: 'text', content: 'Statt vier einzelne /24-Netze in der Routing-Tabelle zu halten, kann bei passenden Grenzen eine einzige /22-Route genügen.' },
      { type: 'list', title: 'Mögliche Vorteile', items: [
        'Weniger Einträge in Routingtabellen',
        'Übersichtlichere Routinginformationen',
        'Änderungen innerhalb eines zusammengefassten Bereichs müssen nicht immer als einzelne Routen weitergegeben werden',
      ] },
    ],
  });

  exps.push({
    id: 'supernetting-validity-classic',
    title: 'Nachbarschaft, Alignment und Adressraum',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Gleiches Präfix und direkte Nachbarschaft reichen allein nicht. Die neue Netz-ID muss an einer gültigen Grenze des kleineren Präfixes liegen – alle neuen Hostbits müssen dort 0 sein.' },
      { type: 'diagram', content: ALIGNMENT_SVG },
      { type: 'text', content: 'Ohne Adressraumerweiterung muss die Summary ausschließlich die gegebenen Bereiche abdecken. Fehlt ein Zwischenblock oder gehört er einem fremden Bereich, bleibt er außerhalb; nicht alle Routen müssen am Ende zu genau einer Summary werden.' },
      { type: 'question', facet: 'alignment', question: 'Sind 192.168.0.64/26 und 192.168.0.128/26 automatisch ein gültiges /25-Paar?', options: ['Nein, sie sind benachbart, aber nicht an derselben /25-Grenze ausgerichtet.', 'Ja, jedes benachbarte /26-Paar ergibt /25.', 'Ja, weil beide mit 192.168 beginnen.'], correct: 0, explanation: 'Ein /25 beginnt im letzten Oktett bei 0 oder 128. Der Bereich .64–.191 ist daher kein ausgerichtetes /25.' },
    ],
  });

  exps.push({
    id: 'supernetting-expansion-classic',
    title: 'Ohne oder mit Adressraumerweiterung?',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Vor jeder Aufgabe steht die Entscheidungsfrage: Darf die Zusammenfassung zusätzliche, nicht gegebene Adressbereiche einschließen?' },
      { type: 'table', headers: ['Modus', 'Ziel'], rows: [
        ['ohne Erweiterung', 'nur exakt gegebene, lückenlose und korrekt ausgerichtete Bereiche paarweise zusammenfassen'],
        ['mit Erweiterung', 'kleinstes gemeinsames Supernetz bilden und die zusätzlich eingeschlossenen Bereiche bewusst prüfen'],
      ] },
      { type: 'text', content: 'Technisch könnte 0.0.0.0/0 alles abdecken, wäre aber fast nie die sinnvolle Antwort. Gesucht ist die kleinste fachlich erlaubte Summary.' },
      { type: 'question', facet: 'expansion', question: 'Was ist das Risiko einer zu großen Route Summary?', options: ['Sie kann Verkehr für fremde oder nicht vorhandene Netze in den zusammengefassten Bereich lenken.', 'Sie erzeugt automatisch neue physische Leitungen.', 'Sie wandelt IPv4 in MAC-Adressen um.'], correct: 0, explanation: 'Eine Summary behauptet Erreichbarkeit für ihren gesamten Bereich. Zusätzlich eingeschlossene Netze müssen deshalb bewusst erlaubt sein.' },
    ],
  });

  exps.push({
    id: 'supernetting-mixed-classic',
    title: 'Gemischte Präfixe schrittweise zusammenfassen',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Gemischte Präfixe werden Stück für Stück geprüft. Zuerst fasst du passende kleinere Geschwister zusammen und prüfst danach erneut Nachbarschaft, Alignment und Abdeckung.' },
      { type: 'list', title: 'Beispiel', items: [
        '128.192.25.16/29 + 128.192.25.24/29 → 128.192.25.16/28',
        '128.192.25.0/28 + 128.192.25.16/28 → 128.192.25.0/27',
      ] },
      { type: 'text', content: 'Jeder Zwischenschritt bleibt prüfbar. Das verhindert, dass versehentlich Lücken oder fremde Netze eingeschlossen werden.' },
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
        'Direkt zusammengefasste Geschwisterblöcke sind gleich groß und benachbart',
        'Die neue Netz-ID muss an der größeren Blockgrenze liegen',
        'Gemischte Präfixe werden zuerst in gültigen Paaren schrittweise zusammengeführt',
        'Ohne erlaubte Erweiterung dürfen keine Lücken eingeschlossen werden',
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

  const exactResult = aggregateWithoutExpansion(['192.168.0.0/26', '192.168.0.64/26', '192.168.0.192/26']);
  exs.push({
    id: 'supernetting-without-expansion',
    type: 'matching',
    question: 'Fasse ohne Adressraumerweiterung so weit wie möglich zusammen.',
    pairs: [
      { left: '192.168.0.0/26 + 192.168.0.64/26', leftLabel: '192.168.0.0/26 + 192.168.0.64/26', right: exactResult[0] },
      { left: '192.168.0.192/26', leftLabel: '192.168.0.192/26', right: exactResult[1] },
    ],
    explanation: 'Die ersten beiden Netze bilden 192.168.0.0/25. Der fehlende Block 192.168.0.128/26 verhindert eine weitere exakte Zusammenfassung.',
  });

  exs.push({
    id: 'supernetting-alignment-check',
    type: 'select-best',
    question: 'Warum dürfen 192.168.0.64/26 und 192.168.0.128/26 nicht einfach als 192.168.0.64/25 notiert werden?',
    options: ['192.168.0.64 ist keine gültige /25-Netzgrenze.', 'Die Netze sind nicht benachbart.', 'Ein /25 ist kleiner als ein /26.'],
    correct: 0,
    explanation: 'Ein /25 beginnt bei .0 oder .128. Benachbarschaft allein genügt nicht; Alignment und Netz-ID müssen stimmen.',
  });

  const expanded = aggregateWithExpansion(['220.78.168.0/28', '220.78.168.16/28', '220.78.168.48/28']);
  exs.push({
    id: 'supernetting-with-expansion',
    type: 'select-best',
    question: 'Adressraumerweiterung ist erlaubt. Welche kleinste Summary deckt 220.78.168.0/28, .16/28 und .48/28 ab?',
    options: [expanded.network, '0.0.0.0/0', '220.78.168.0/27'],
    correct: 0,
    explanation: `${expanded.network} schließt minimal auch den fehlenden Block .32/28 ein. /27 würde .48/28 nicht abdecken; /0 wäre unnötig groß.`,
  });

  exs.push({
    id: 'supernetting-adaptive-trainer',
    type: 'adaptive-supernetting',
    title: 'NEXUS-Summary-Trainer',
    explanation: 'Prüfe Erweiterung, Nachbarschaft, Alignment und kleinstes sinnvolles Ergebnis.',
  });

  return exs;
}

function buildQuiz() {
  const problems = Array.from({ length: 3 }, () => generateSupernetProblem());
  const calculated = problems.map((p, i) => ({
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
  return [
    { facet: 'direction', question: 'Was passiert mit dem Präfix beim Supernetting?', options: ['Es wird kleiner und das zusammengefasste Netz größer.', 'Es wird größer und jedes Netz kleiner.', 'Es bleibt unabhängig vom Ergebnis immer gleich.'], correct: 0, explanation: 'Supernetting verkürzt den gemeinsamen Netzanteil und vergrößert damit den abgedeckten Bereich.' },
    { facet: 'adjacency-alignment', question: 'Reicht direkte Nachbarschaft allein für eine exakte Aggregation?', options: ['Nein, auch Alignment und vollständige Abdeckung müssen passen.', 'Ja, jedes benachbarte Paar ist aggregierbar.', 'Ja, sofern beide Adressen privat sind.'], correct: 0, explanation: 'Die neue Netz-ID muss zur größeren Blockgrenze passen und darf ohne Erlaubnis keine zusätzlichen Bereiche einschließen.' },
    { facet: 'partial-result', question: 'Müssen am Ende immer alle gegebenen Netze in genau einer Summary stehen?', options: ['Nein, ohne Erweiterung können nicht passende Netze separat bleiben.', 'Ja, sonst ist es kein Supernetting.', 'Ja, notfalls immer als 0.0.0.0/0.'], correct: 0, explanation: 'Ziel ist eine korrekte Reduktion der Einträge, nicht zwingend genau ein Ergebnisnetz.' },
    { facet: 'expansion', question: 'Was muss bei erlaubter Adressraumerweiterung dokumentiert werden?', options: ['Welche zusätzlichen Bereiche die kleinste Summary einschließt.', 'Nur die Zahl der Router.', 'Ausschließlich der alte Präfix.'], correct: 0, explanation: 'Eine erweiterte Summary behauptet Erreichbarkeit auch für Lücken; diese Zusatzbereiche müssen bewusst geprüft werden.' },
    { facet: 'route-summary', question: 'Warum wird Supernetting bei Routinginformationen eingesetzt?', options: ['Mehrere spezifische Routen können durch eine übersichtlichere Summary ersetzt werden.', 'Es garantiert auf jedem Router höhere Geschwindigkeit.', 'Es erzeugt zusätzliche öffentliche Adressen.'], correct: 0, explanation: 'Route Summarization kann Routingtabellen verkleinern und Informationen übersichtlicher machen, ohne eine universelle Performancegarantie.' },
    ...calculated,
  ];
}

export function buildSupernettingLesson() {
  return {
    title: 'Supernetting',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'Supernetting fasst mehrere Netze zu einem größeren Bereich zusammen; das Präfix wird kleiner.',
      'Nachbarschaft, lückenlose Abdeckung und Alignment bestimmen eine exakte Summary ohne Erweiterung.',
      'Gemischte Präfixe werden schrittweise in gültigen Geschwisterpaaren zusammengefasst.',
      'Mit erlaubter Erweiterung wird die kleinste Summary gewählt und jeder zusätzlich eingeschlossene Bereich geprüft.',
      'Route Summarization kann Routinginformationen verkleinern und übersichtlicher machen.',
    ],
  };
}
