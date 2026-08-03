import { topicKey } from '../academyTopics.js';

const TCP_IP_LAYERS = [
  { num: 1, de: 'Netzzugang', en: 'Network Access', osi: '1 und 2', description: 'Physische und lokale Übertragung: Kabel, Funk, MAC-Adressen, Ethernet, WLAN.', examples: 'Ethernet, WLAN, PPP, ARP' },
  { num: 2, de: 'Internet', en: 'Internet', osi: '3', description: 'Wegweisendes Routing zwischen Netzwerken anhand logischer Adressen.', examples: 'IPv4, IPv6, ICMP, Routing-Protokolle' },
  { num: 3, de: 'Transport', en: 'Transport', osi: '4', description: 'Ende-zu-Ende-Verbindungen, Portnummern, Zuverlässigkeit oder Geschwindigkeit.', examples: 'TCP, UDP' },
  { num: 4, de: 'Anwendung', en: 'Application', osi: '5 bis 7', description: 'Protokolle, die Anwendungen direkt nutzen.', examples: 'HTTP, DNS, SMTP, FTP, SSH' },
];

const TCP_IP_SVG = `<svg viewBox="0 0 240 260" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00ff66"/><stop offset="100%" stop-color="#00cc55"/></linearGradient></defs><rect x="30" y="20" width="180" height="45" rx="6" fill="url(#tg1)" opacity="0.95"/><text x="120" y="50" text-anchor="middle" fill="#0a1628" font-size="14" font-weight="bold">4 Anwendung (OSI 5–7)</text><rect x="30" y="75" width="180" height="45" rx="6" fill="#00ff66" opacity="0.75"/><text x="120" y="105" text-anchor="middle" fill="#0a1628" font-size="14" font-weight="bold">3 Transport (OSI 4)</text><rect x="30" y="130" width="180" height="45" rx="6" fill="#00ff66" opacity="0.55"/><text x="120" y="160" text-anchor="middle" fill="#0a1628" font-size="14" font-weight="bold">2 Internet (OSI 3)</text><rect x="30" y="185" width="180" height="45" rx="6" fill="#00ff66" opacity="0.35"/><text x="120" y="215" text-anchor="middle" fill="#0a1628" font-size="14" font-weight="bold">1 Netzzugang (OSI 1–2)</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function layerBlocks(layer, style) {
  if (style === 'classic') {
    return [
      { type: 'text', content: `Schicht ${layer.num} – ${layer.de} (${layer.en}). ${layer.description}` },
      { type: 'list', title: 'Typische Protokolle und Technologien', items: layer.examples.split(', ') },
      { type: 'text', content: `Im OSI-Modell entspricht diese Schicht ungefähr OSI-Schicht ${layer.osi}.` },
    ];
  }
  return [
    { type: 'text', content: `Schicht ${layer.num} – ${layer.de}. Einfach gesagt: ${layerSimple(layer.num)}` },
    { type: 'text', content: 'Auch hier gilt: Die Analogie ist nur eine Eselsbrücke, die Technik ist komplexer.' },
    { type: 'list', title: 'Merke dir', items: layer.examples.split(', ').slice(0, 2).map((x) => `${x} gehört in diese Schicht.`) },
  ];
}

function layerSimple(num) {
  const simple = [
    'Kabel oder Funk anschließen und das nächste Gerät erreichen.',
    'Adressen finden und Pakete ins richtige Netz schicken.',
    'Sorgen, dass Daten vollständig und in der richtigen Reihenfolge ankommen.',
    'Die eigentliche Anwendung spricht mit ihrem Dienst, z. B. Browser mit Webserver.',
  ];
  return simple[num - 1];
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Warum TCP/IP?', 'classic', [
    { type: 'text', content: 'Das TCP/IP-Modell ist das praktische Modell des Internets. Es wurde nicht theoretisch entworfen, sondern aus den Protokollen heraus entwickelt, die heute das Internet bilden.' },
    { type: 'text', content: 'Während das OSI-Modell sieben Schichten hat, reichen für TCP/IP meist vier Schichten aus, weil mehrere OSI-Schichten in einer TCP/IP-Schicht zusammengefasst werden.' },
    { type: 'diagram', content: TCP_IP_SVG },
  ]));

  exps.push(explanation('intro-intuitive', 'Warum TCP/IP?', 'intuitive', [
    { type: 'text', content: 'TCP/IP ist wie ein vereinfachter Fahrplan für das Internet. Man braucht nicht jede einzelne Zwischenstation, sondern nur die wichtigsten: Anwendung, Transport, Internet und Anschluss ans Netz.' },
    { type: 'text', content: 'Für die Fehlersuche reichen oft vier Stufen: funktioniert die App, kommen die Pakete an, ist das Routing korrekt, leuchtet das Kabel?' },
  ]));

  for (const layer of TCP_IP_LAYERS) {
    exps.push(explanation(`layer${layer.num}-classic`, `${layer.num}. ${layer.de}`, 'classic', [
      ...layerBlocks(layer, 'classic'),
      { type: 'question', id: `q-layer${layer.num}-classic`, question: `Welche Aussage passt zur TCP/IP-Schicht „${layer.de}"?`, options: [
        'Sie ist nur für E-Mail zuständig.',
        `${layer.description}`,
        'Sie kümmert sich ausschließlich um Bildschirmauflösungen.',
      ], correct: 1, explanation: layer.description },
    ]));
    exps.push(explanation(`layer${layer.num}-intuitive`, `${layer.num}. ${layer.de}`, 'intuitive', [
      ...layerBlocks(layer, 'intuitive'),
      { type: 'question', id: `q-layer${layer.num}-intuitive`, question: `Was macht die TCP/IP-Schicht „${layer.de}" in einem Satz?`, options: [
        layerSimple(layer.num),
        'Sie berechnet Steuern.',
        'Sie speichert Passwörter.',
      ], correct: 0, explanation: layerSimple(layer.num) },
    ]));
  }

  exps.push(explanation('osi-mapping-classic', 'OSI und TCP/IP im Vergleich', 'classic', [
    { type: 'text', content: 'Beide Modelle beschreiben dieselbe Kommunikation, aber mit unterschiedlicher Granularität. TCP/IP ist für die Praxis entstanden, OSI als allgemeines Lehrmodell.' },
    { type: 'table', headers: ['TCP/IP', 'ungefähre OSI-Schichten'], rows: [
      ['Anwendung', '5 Sitzung, 6 Darstellung, 7 Anwendung'],
      ['Transport', '4 Transportschicht'],
      ['Internet', '3 Vermittlungsschicht'],
      ['Netzzugang', '1 Bitübertragung, 2 Sicherung'],
    ] },
    { type: 'text', content: 'Wichtig: Das ist eine didaktische Zuordnung. Reale Implementierungen lassen sich nicht immer hundertprozentig in starre Schichten pressen.' },
  ]));

  exps.push(explanation('osi-mapping-intuitive', 'OSI und TCP/IP im Vergleich', 'intuitive', [
    { type: 'text', content: 'TCP/IP ist wie eine grobe Landkarte: Anwendung, Transport, Internet, Anschluss. OSI ist wie eine detaillierte Wanderkarte mit mehreren Etappen.' },
    { type: 'text', content: 'Für den Alltag reicht oft die grobe Karte. Wenn ein Problem komplex ist, zoomt man mit dem OSI-Modell näher heran.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'text', content: 'TCP/IP hat vier Schichten: Netzzugang, Internet, Transport, Anwendung. Es ist das praktische Modell des Internets und fasst mehrere OSI-Schichten zusammen.' },
    { type: 'list', title: 'Kernaussagen', items: [
      'Netzzugang = Kabel/Funk + lokale Übertragung (OSI 1–2)',
      'Internet = Routing und logische Adressen (OSI 3)',
      'Transport = TCP/UDP und Ports (OSI 4)',
      'Anwendung = HTTP, DNS, SMTP etc. (OSI 5–7)',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'tcpip-ordering',
      type: 'ordering',
      question: 'Sortiere die vier TCP/IP-Schichten von oben nach unten.',
      items: TCP_IP_LAYERS.map((l) => ({ id: `l${l.num}`, label: `${l.num}. ${l.de}` })).reverse(),
      correctOrder: TCP_IP_LAYERS.map((l) => `l${l.num}`).reverse(),
      explanation: 'Von oben nach unten: Anwendung, Transport, Internet, Netzzugang.',
    },
    {
      id: 'tcpip-osi-mapping',
      type: 'matching',
      question: 'Ordne jeder TCP/IP-Schicht die ungefähren OSI-Schichten zu.',
      pairs: TCP_IP_LAYERS.map((l) => ({ left: l.de, leftLabel: `${l.num}. ${l.de}`, right: `OSI ${l.osi}` })),
      explanation: 'TCP/IP Netzzugang ≈ OSI 1–2, Internet ≈ OSI 3, Transport ≈ OSI 4, Anwendung ≈ OSI 5–7.',
    },
    {
      id: 'tcpip-protocols',
      type: 'matching',
      question: 'Ordne das Protokoll der passenden TCP/IP-Schicht zu.',
      pairs: [
        { left: 'HTTP', leftLabel: 'HTTP', right: '4. Anwendung' },
        { left: 'TCP', leftLabel: 'TCP', right: '3. Transport' },
        { left: 'UDP', leftLabel: 'UDP', right: '3. Transport' },
        { left: 'IPv4', leftLabel: 'IPv4', right: '2. Internet' },
        { left: 'Ethernet', leftLabel: 'Ethernet', right: '1. Netzzugang' },
        { left: 'DNS', leftLabel: 'DNS', right: '4. Anwendung' },
      ],
      explanation: 'HTTP/DNS = Anwendung, TCP/UDP = Transport, IPv4 = Internet, Ethernet = Netzzugang.',
    },
    {
      id: 'tcpip-truefalse',
      type: 'select-best',
      question: 'Welche Aussage über das TCP/IP-Modell ist richtig?',
      options: [
        'TCP/IP hat genau sieben Schichten wie OSI.',
        'TCP/IP fasst mehrere OSI-Schichten zusammen und arbeitet mit vier Schichten.',
        'TCP/IP ist nur für WLAN-Netze gedacht.',
      ],
      correct: 1,
      explanation: 'TCP/IP verwendet vier Schichten und fasst z. B. OSI 5–7 in der Anwendungsschicht zusammen.',
    },
    {
      id: 'tcpip-layer-error',
      type: 'select-best',
      question: 'Ein Router leitet ein Paket ins falsche Netz weiter. Auf welcher TCP/IP-Schicht sucht man das Problem zuerst?',
      options: ['Netzzugang', 'Internet', 'Transport', 'Anwendung'],
      correct: 1,
      explanation: 'Routing und logische Adressierung liegen in der Internet-Schicht.',
    },
  ];
}

function buildQuiz() {
  return [
    {
      question: 'Wie viele Schichten hat das TCP/IP-Modell?',
      options: ['3', '4', '5', '7'],
      correct: 1,
      explanation: 'TCP/IP besteht aus vier Schichten: Netzzugang, Internet, Transport, Anwendung.',
    },
    {
      question: 'Welche TCP/IP-Schicht enthält typischerweise HTTP und DNS?',
      options: ['Netzzugang', 'Internet', 'Transport', 'Anwendung'],
      correct: 3,
      explanation: 'HTTP und DNS sind Anwendungsprotokolle und liegen in der Anwendungsschicht.',
    },
    {
      question: 'Welche OSI-Schichten werden in TCP/IP üblicherweise in der Anwendungsschicht zusammengefasst?',
      options: ['1 und 2', '3', '4', '5 bis 7'],
      correct: 3,
      explanation: 'TCP/IP Anwendung ≈ OSI Sitzung, Darstellung und Anwendung (Schichten 5–7).',
    },
    {
      question: 'Auf welcher TCP/IP-Schicht arbeitet ein Router primär?',
      options: ['Netzzugang', 'Internet', 'Transport', 'Anwendung'],
      correct: 1,
      explanation: 'Ein Router arbeitet mit IP-Adressen und Routing, also auf der Internet-Schicht.',
    },
    {
      question: 'Welche Protokolle gehören zur TCP/IP-Transportschicht?',
      options: ['IPv4 und IPv6', 'TCP und UDP', 'HTTP und FTP', 'Ethernet und WLAN'],
      correct: 1,
      explanation: 'TCP und UDP bilden die Transportschicht mit Ports und Ende-zu-Ende-Verbindungen.',
    },
  ];
}

function buildSummary() {
  return [
    'TCP/IP hat vier Schichten: Netzzugang, Internet, Transport, Anwendung.',
    'Netzzugang ≈ OSI 1–2, Internet ≈ OSI 3, Transport ≈ OSI 4, Anwendung ≈ OSI 5–7.',
    'Das Modell ist praxisorientiert und das Fundament des Internets.',
    'TCP/UDP liegen auf der Transportschicht, IPv4/IPv6 auf der Internetschicht.',
  ];
}

export function buildTcpIpLesson() {
  return {
    title: 'TCP/IP-Modell',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}

export const TCP_IP_TOPIC_KEY = topicKey('fundamentals', 'tcp-ip-model');
