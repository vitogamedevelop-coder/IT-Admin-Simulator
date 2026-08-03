import { topicKey } from '../academyTopics.js';
import { decimalToBinaryOctet } from '../networking/ipv4Math.js';

const EXAMPLE_IP = '192.168.10.25';

const IP_SVG = `<svg viewBox="0 0 400 130" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="200" y="22" text-anchor="middle" fill="#c9d1d9" font-size="12">IPv4-Adresse: 192.168.10.25</text><g stroke="#00f0ff" stroke-width="2" fill="none"><rect x="10" y="40" width="85" height="55" rx="6"/><rect x="110" y="40" width="85" height="55" rx="6"/><rect x="210" y="40" width="85" height="55" rx="6"/><rect x="310" y="40" width="85" height="55" rx="6"/></g><text x="52" y="75" text-anchor="middle" fill="#c9d1d9" font-size="18" font-weight="bold">192</text><text x="152" y="75" text-anchor="middle" fill="#c9d1d9" font-size="18" font-weight="bold">168</text><text x="252" y="75" text-anchor="middle" fill="#c9d1d9" font-size="18" font-weight="bold">10</text><text x="352" y="75" text-anchor="middle" fill="#c9d1d9" font-size="18" font-weight="bold">25</text><text x="95" y="115" text-anchor="middle" fill="#8b949e" font-size="10">1. Oktett</text><text x="195" y="115" text-anchor="middle" fill="#8b949e" font-size="10">2. Oktett</text><text x="295" y="115" text-anchor="middle" fill="#8b949e" font-size="10">3. Oktett</text><text x="395" y="115" text-anchor="middle" fill="#8b949e" font-size="10">4. Oktett</text></svg>`;

const PREFIX_SVG = `<svg viewBox="0 0 420 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="210" y="22" text-anchor="middle" fill="#c9d1d9" font-size="12">192.168.10.25/24 – Netzanteil orange, Hostanteil grau</text><g transform="translate(10,35)"><rect x="0" y="0" width="240" height="45" rx="4" fill="#00f0ff" fill-opacity="0.35" stroke="#00f0ff" stroke-width="2"/><rect x="240" y="0" width="80" height="45" rx="4" fill="#8b949e" fill-opacity="0.25" stroke="#8b949e" stroke-width="2"/><text x="120" y="28" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">24 Bit Netzanteil</text><text x="280" y="28" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">8 Bit Host</text></g><text x="210" y="105" text-anchor="middle" fill="#8b949e" font-size="11">/24 bedeutet: die ersten 24 Bit beschreiben das Netz.</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Was ist eine IPv4-Adresse?', 'classic', [
    { type: 'text', content: 'Eine IPv4-Adresse kennzeichnet eine Netzwerkschnittstelle innerhalb eines IP-Netzes. Ein Gerät kann mehrere Schnittstellen und damit mehrere Adressen haben; Adressen können sich auch ändern.' },
    { type: 'text', content: 'Für den Anfang reicht das Bild eines PCs mit einer Adresse. Merke dir aber: technisch gehört die Adresse zur Schnittstelle, nicht zwingend zum Gerät.' },
  ]));

  exps.push(explanation('structure-classic', 'Aufbau einer IPv4-Adresse', 'classic', [
    { type: 'text', content: 'Eine IPv4-Adresse hat 32 Bit, aufgeteilt in vier Oktette. Jedes Oktett hat acht Bit und wird in der Punktnotation dezimal geschrieben.' },
    { type: 'diagram', content: IP_SVG },
    { type: 'text', content: `Beispiel ${EXAMPLE_IP}: vier Oktette mit je acht Bit. Zusammen also 4 × 8 = 32 Bit.` },
    { type: 'text', content: `Als Binärzahl: ${EXAMPLE_IP.split('.').map(decimalToBinaryOctet).join('.')}` },
  ]));

  exps.push(explanation('network-host-classic', 'Netzanteil und Hostanteil', 'classic', [
    { type: 'text', content: 'Jede IPv4-Adresse teilt sich in Netzanteil und Hostanteil. Der Netzanteil beschreibt das gemeinsame Netz, der Hostanteil unterscheidet die Teilnehmer darin.' },
    { type: 'diagram', content: PREFIX_SVG },
    { type: 'text', content: 'Bei 192.168.10.25/24 sind die ersten 24 Bit der Netzanteil und die letzten 8 Bit der Hostanteil. /24 ist der CIDR-Präfix.' },
  ]));

  exps.push(explanation('prefix-classic', 'CIDR-Präfix', 'classic', [
    { type: 'text', content: 'Der Präfix nach dem Schrägstrich sagt, wie viele Bits zum Netzanteil gehören. Er reicht von /0 bis /32. Je größer der Präfix, desto kleiner der Hostbereich.' },
    { type: 'list', title: 'Beispiele', items: [
      '/8 – erstes Oktett Netz, drei Oktette Host',
      '/16 – zwei Oktette Netz, zwei Oktette Host',
      '/24 – drei Oktette Netz, ein Oktett Host',
      '/30 – sehr kleiner Hostbereich, oft Punkt-zu-Punkt',
      '/32 – eine einzelne Adresse',
    ] },
  ]));

  exps.push(explanation('prefix-special-classic', 'Sonderfälle', 'classic', [
    { type: 'text', content: 'Einige Präfixe verdienen eine kurze Vertiefung, ohne dass sie Anfänger überfordern.' },
    { type: 'list', title: 'Wichtige Sonderfälle', items: [
      '/32 beschreibt genau eine einzelne Adresse.',
      '/31 kann bei Punkt-zu-Punkt-Verbindungen verwendet werden.',
      '/0 umfasst den gesamten IPv4-Adressraum und ist aus der Default-Route 0.0.0.0/0 bekannt.',
    ] },
  ]));

  exps.push(explanation('private-classic', 'Private IPv4-Bereiche', 'classic', [
    { type: 'text', content: 'Private Adressen werden in internen Netzen verwendet und werden im öffentlichen Internet normalerweise nicht direkt geroutet. NAT übersetzt sie gegebenenfalls.' },
    { type: 'list', title: 'Private Bereiche', items: [
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16',
    ] },
    { type: 'text', content: '127.0.0.0/8 ist der Loopback-Bereich, typisch 127.0.0.1. 169.254.0.0/16 ist Link-Local/APIPA und deutet oft darauf hin, dass kein DHCP erreichbar war.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'text', content: 'IPv4-Adressen haben 32 Bit in vier Oktetten. Der Präfix legt Netz- und Hostanteil fest. Private Bereiche wie 10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16 werden intern verwendet.' },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'ipv4-bit-count',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Wie viele Bit hat eine IPv4-Adresse insgesamt?',
      options: ['16', '24', '32', '48'],
      correct: 2,
      explanation: 'IPv4 verwendet 32 Bit, aufgeteilt in vier Oktette.',
    },
    {
      id: 'ipv4-octet-count',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Wie viele Oktette hat eine IPv4-Adresse?',
      options: ['2', '4', '6', '8'],
      correct: 1,
      explanation: 'Eine IPv4-Adresse besteht aus vier Oktetten.',
    },
    {
      id: 'ipv4-valid-address',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Welche Adresse ist gültig?',
      options: ['192.168.1.10', '10.0.0.256', '192.168.-1.5', '1.2.3'],
      correct: 0,
      explanation: 'Jedes Oktett muss zwischen 0 und 255 liegen und es müssen vier Oktette vorhanden sein.',
    },
    {
      id: 'ipv4-private-public',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Welche Adresse gehört typischerweise zu einem privaten Bereich?',
      options: ['8.8.8.8', '192.168.5.20', '1.1.1.1', '203.0.113.5'],
      correct: 1,
      explanation: '192.168.0.0/16 ist ein privater Bereich.',
    },
    {
      id: 'ipv4-network-host-24',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Bei 172.16.5.4/16 beschreiben die ersten 16 Bit welchen Anteil?',
      options: ['Hostanteil', 'Netzanteil', 'Broadcast', 'Präfix'],
      correct: 1,
      explanation: 'Der Präfix /16 legt fest, dass die ersten 16 Bit den Netzanteil bilden.',
    },
    {
      id: 'ipv4-prefix-compare',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Welches Netz bietet mehr Hostadressen: /24 oder /28?',
      options: ['/24', '/28', 'Beide gleich', 'Kommt darauf an'],
      correct: 0,
      explanation: 'Ein kleinerer Präfix bedeutet mehr Hostbits. /24 hat 8 Hostbits, /28 nur 4.',
    },
    {
      id: 'ipv4-loopback',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Welche Adresse ist ein typisches Loopback-Beispiel?',
      options: ['192.168.1.1', '127.0.0.1', '10.0.0.1', '169.254.1.1'],
      correct: 1,
      explanation: '127.0.0.1 ist der bekannteste Loopback.',
    },
    {
      id: 'ipv4-difficulty-drill',
      type: 'difficulty-drill',
      generator: 'ipv4',
      title: 'Adaptive IPv4-Übung',
      explanation: 'Zufällige Aufgaben mit steigender Schwierigkeit. Bestehe die Prüfung, um die nächste Stufe freizuschalten.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Wie viele Bit hat ein IPv4-Oktett?', options: ['4', '8', '16', '32'], correct: 1, explanation: 'Ein Oktett hat acht Bit.' },
    { question: 'Was legt der CIDR-Präfix fest?', options: ['Die MAC-Adresse', 'Anzahl der Netzbits', 'Die Portnummer', 'Das Betriebssystem'], correct: 1, explanation: 'Der Präfix gibt an, wie viele Bits zum Netzanteil gehören.' },
    { question: 'Welcher Bereich ist privat?', options: ['8.8.8.0/24', '172.16.0.0/12', '203.0.113.0/24', '1.1.1.0/24'], correct: 1, explanation: '172.16.0.0/12 ist einer der drei privaten IPv4-Bereiche.' },
    { question: 'Was beschreibt /32?', options: ['Ein ganzes Netz', 'Eine einzelne Adresse', 'Einen Broadcast', 'Einen Router'], correct: 1, explanation: '/32 beschreibt genau eine einzelne IPv4-Adresse.' },
    { question: 'Welche Adresse deutet oft auf fehlenden DHCP hin?', options: ['127.0.0.1', '169.254.x.x', '192.168.1.1', '10.0.0.1'], correct: 1, explanation: '169.254.0.0/16 ist der Link-Local-/APIPA-Bereich.' },
  ];
}

function buildSummary() {
  return [
    'IPv4-Adressen haben 32 Bit in vier Oktetten.',
    'Der Präfix legt Netz- und Hostanteil fest.',
    'Private Bereiche: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
    '/32 ist eine einzelne Adresse, /0 der gesamte Raum.',
    'Loopback: 127.0.0.1, APIPA: 169.254.x.x.',
  ];
}

export function buildIpv4Lesson() {
  return {
    title: 'IPv4-Grundlagen',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}

export const IPV4_TOPIC_KEY = topicKey('fundamentals', 'ipv4');
