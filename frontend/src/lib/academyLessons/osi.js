import { topicKey } from '../academyTopics.js';

export const OSI_LAYERS = [
  { num: 1, de: 'Bitübertragungsschicht', en: 'Physical Layer', pdu: 'Bits', examples: 'Kabel, Funk, Lichtimpulse, Hubs, Repeater', devices: 'Netzwerkkarte, Hub, Repeater, Kabel', protocols: 'Ethernet-PHY, USB, Bluetooth-PHY, DSL', mnemonic: 'Bitübertragung: Kabel und Funk sind hier zuhause.' },
  { num: 2, de: 'Sicherungsschicht', en: 'Data Link Layer', pdu: 'Frames', examples: 'Switching, MAC-Adressen, ARP, VLAN', devices: 'Switch, Bridge, Access Point', protocols: 'Ethernet, ARP, PPP, WLAN (MAC)', mnemonic: 'Sicherung: Switche kennen MAC-Adressen und Frames.' },
  { num: 3, de: 'Vermittlungsschicht', en: 'Network Layer', pdu: 'Packets', examples: 'Routing, IP-Adressen, Subnetting', devices: 'Router, Layer-3-Switch', protocols: 'IPv4, IPv6, ICMP, OSPF, BGP', mnemonic: 'Vermittlung: Router finden den Weg durchs Netz.' },
  { num: 4, de: 'Transportschicht', en: 'Transport Layer', pdu: 'Segments', examples: 'TCP, UDP, Ports, Flusskontrolle', devices: 'Betriebssystem-Stack, Firewalls (Stateful)', protocols: 'TCP, UDP, SCTP', mnemonic: 'Transport: TCP liefert zuverlässig, UDP schnell.' },
  { num: 5, de: 'Sitzungsschicht', en: 'Session Layer', pdu: 'Data', examples: 'Sitzungsverwaltung, Authentifizierung, Dialogkontrolle', devices: 'Application-Proxy, Load-Balancer', protocols: 'NetBIOS, RPC, PPTP', mnemonic: 'Sitzung: Wer darf wann mit wem reden?' },
  { num: 6, de: 'Darstellungsschicht', en: 'Presentation Layer', pdu: 'Data', examples: 'Verschlüsselung, Komprimierung, Zeichensätze', devices: 'Gateways, Verschlüsselungsbeschleuniger', protocols: 'TLS/SSL, JPEG, MPEG, ASCII, UTF-8', mnemonic: 'Darstellung: Daten werden lesbar und sicher.' },
  { num: 7, de: 'Anwendungsschicht', en: 'Application Layer', pdu: 'Data', examples: 'E-Mail, Web, Dateifreigaben', devices: 'Server, Client-Anwendungen', protocols: 'HTTP, SMTP, FTP, DNS, SSH', mnemonic: 'Anwendung: Hier arbeiten Browser und Mail.' },
];

function layerBlocks(layer, style = 'classic') {
  const blocks = [];
  if (style === 'classic') {
    blocks.push({ type: 'text', content: `Schicht ${layer.num} – ${layer.de} (${layer.en}). Zentrale Aufgabe: ${layerTask(layer.num)}` });
    blocks.push({ type: 'list', title: 'Typische Elemente', items: [
      `Geräte: ${layer.devices}`,
      `Protokolle/Standards: ${layer.protocols}`,
      `Dateneinheit: ${layer.pdu}`,
    ] });
    blocks.push({ type: 'text', content: `Praxisbeispiel: ${layerExample(layer.num)}` });
    blocks.push({ type: 'text', content: `Merksatz: ${layer.mnemonic}` });
  } else {
    blocks.push({ type: 'text', content: `Schicht ${layer.num} – ${layer.de}. In der Paket-Analogie: ${layerAnalogy(layer.num)}` });
    blocks.push({ type: 'text', content: 'Diese Analogie ist nur eine Eselsbrücke. Technisch ist die Schicht natürlich komplexer.' });
    blocks.push({ type: 'list', title: 'Worum es wirklich geht', items: [
      `Dateneinheit: ${layer.pdu}`,
      `Wichtige Begriffe: ${layer.devices.split(',')[0]}, ${layer.protocols.split(',')[0]}`,
    ] });
  }
  return blocks;
}

function layerTask(num) {
  const tasks = [
    'elektrische, optische oder funk­basierte Übertragung von Rohdaten.',
    'zuverlässige Übertragung im lokalen Netz über MAC-Adressen.',
    'wegweisendes Routing zwischen Netzwerken anhand IP-Adressen.',
    'Ende-zu-Ende-Verbindungen, Ports und ggf. Zuverlässigkeit.',
    'Aufbau, Steuerung und Beendigung von Kommunikationsdialogen.',
    'Umsetzung von Anwendungsdaten in ein einheitliches Format.',
    'Schnittstelle für Anwendungen wie Browser, Mail und Dateifreigabe.',
  ];
  return tasks[num - 1];
}

function layerExample(num) {
  const examples = [
    'Ein Techniker prüft, ob das Netzwerkkabel eingesteckt und die LEDs an der Buchse leuchten.',
    'Ein Switch leitet ein Frame anhand der Ziel-MAC-Adresse an den richtigen Port weiter.',
    'Ein Router sucht in seiner Routing-Tabelle den besten Weg zum Zielnetz 203.0.113.0/24.',
    'Ein Webserver kommuniziert über TCP-Port 443; der Browser bestätigt jedes empfangene Segment.',
    'Ein Video-Streaming-Dienst hält die Sitzung aufrecht, auch wenn kurz Daten nachgeladen werden.',
    'Der Browser wandelt ein JPG-Bild und verschlüsselt es per TLS, bevor es an die Anwendung weitergegeben wird.',
    'Du gibst eine URL ein und der Browser fragt per HTTP/HTTPS eine Webseite beim Server an.',
  ];
  return examples[num - 1];
}

function layerAnalogy(num) {
  const analogies = [
    'die Straße, Schiene oder Rolle – das physische Transportmittel.',
    'der Paketaufkleber mit Absender und Empfänger im lokalen Depot.',
    'die Postleitzahl und die Routenplanung über mehrere Städte.',
    'der Zustellungsnachweis bzw. die Entscheidung „Einschreiben oder normal?“.',
    'die Annahmebestätigung und der Hinweis „Bei Abwesenheit bitte Nachbarn“.',
    'das Übersetzen des Briefes in die Sprache des Empfängers und ggf. das Verschlüsseln.',
    'der eigentliche Inhalt des Briefes, den du in die Hand bekommst.',
  ];
  return analogies[num - 1];
}

const ETHERNET_FRAME_SVG = `<svg viewBox="0 0 360 105" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="30" width="76" height="38" fill="#00f0ff" opacity="0.85"/><rect x="84" y="30" width="76" height="38" fill="#58a6ff" opacity="0.85"/><rect x="160" y="30" width="55" height="38" fill="#ffcc00" opacity="0.85"/><rect x="215" y="30" width="92" height="38" fill="#00ff66" opacity="0.7"/><rect x="307" y="30" width="45" height="38" fill="#ff7b72" opacity="0.85"/><text x="46" y="52" text-anchor="middle" fill="#07111f" font-size="10">Ziel-MAC</text><text x="122" y="52" text-anchor="middle" fill="#07111f" font-size="10">Quell-MAC</text><text x="187" y="52" text-anchor="middle" fill="#07111f" font-size="10">Typ</text><text x="261" y="52" text-anchor="middle" fill="#07111f" font-size="10">Daten</text><text x="329" y="52" text-anchor="middle" fill="#07111f" font-size="10">FCS</text><text x="180" y="91" text-anchor="middle" fill="#8b949e" font-size="10">Layer-2-Datenstruktur: Ethernet-Frame</text></svg>`;
const ARP_SVG = `<svg viewBox="0 0 360 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="42" width="96" height="60" rx="8" fill="#0d2138" stroke="#00f0ff"/><text x="60" y="62" text-anchor="middle" fill="#00f0ff" font-size="11">PC A</text><text x="60" y="80" text-anchor="middle" fill="#c9d1d9" font-size="9">10.0.0.1</text><text x="60" y="94" text-anchor="middle" fill="#c9d1d9" font-size="9">MAC AAA</text><rect x="252" y="42" width="96" height="60" rx="8" fill="#0d2138" stroke="#00ff66"/><text x="300" y="62" text-anchor="middle" fill="#00ff66" font-size="11">PC B</text><text x="300" y="80" text-anchor="middle" fill="#c9d1d9" font-size="9">10.0.0.2</text><text x="300" y="94" text-anchor="middle" fill="#c9d1d9" font-size="9">MAC BBB</text><line x1="108" y1="58" x2="248" y2="58" stroke="#ffcc00" stroke-width="2"/><text x="178" y="48" text-anchor="middle" fill="#ffcc00" font-size="9">Broadcast: Wer hat 10.0.0.2?</text><line x1="252" y1="90" x2="112" y2="90" stroke="#00ff66" stroke-width="2"/><text x="180" y="112" text-anchor="middle" fill="#00ff66" font-size="9">Reply: 10.0.0.2 → MAC BBB</text><text x="180" y="137" text-anchor="middle" fill="#8b949e" font-size="10">IP-Ziel bekannt → MAC für lokalen Frame ermitteln</text></svg>`;
const ENCAPSULATION_SVG = `<svg viewBox="0 0 380 190" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="16" y="24" fill="#c9d1d9" font-size="11">Anwendung</text><rect x="110" y="8" width="170" height="24" rx="4" fill="#00ff66" opacity="0.75"/><text x="195" y="24" text-anchor="middle" fill="#07111f" font-size="10">DATA</text><text x="16" y="62" fill="#c9d1d9" font-size="11">Layer 4</text><rect x="78" y="45" width="62" height="24" fill="#ffcc00"/><rect x="140" y="45" width="170" height="24" fill="#00ff66" opacity="0.75"/><text x="109" y="61" text-anchor="middle" fill="#07111f" font-size="9">TCP/UDP</text><text x="16" y="100" fill="#c9d1d9" font-size="11">Layer 3</text><rect x="50" y="82" width="52" height="24" fill="#58a6ff"/><rect x="102" y="82" width="208" height="24" fill="#00ff66" opacity="0.6"/><text x="76" y="98" text-anchor="middle" fill="#07111f" font-size="9">IP</text><text x="16" y="138" fill="#c9d1d9" font-size="11">Layer 2</text><rect x="30" y="119" width="58" height="24" fill="#00f0ff"/><rect x="88" y="119" width="222" height="24" fill="#00ff66" opacity="0.45"/><rect x="310" y="119" width="42" height="24" fill="#ff7b72"/><text x="59" y="135" text-anchor="middle" fill="#07111f" font-size="9">ETH</text><text x="331" y="135" text-anchor="middle" fill="#07111f" font-size="9">FCS</text><text x="16" y="175" fill="#c9d1d9" font-size="11">Layer 1</text><text x="110" y="175" fill="#00f0ff" font-size="11">010101… physikalisches Signal</text></svg>`;
const OSI_SVG = `<svg viewBox="0 0 240 360" class="w-full h-auto max-h-72" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00f0ff"/><stop offset="100%" stop-color="#0055ff"/></linearGradient></defs><rect x="30" y="20" width="180" height="40" rx="6" fill="url(#g1)" opacity="0.9"/><text x="120" y="47" text-anchor="middle" fill="#0a1628" font-size="14" font-weight="bold">7 Anwendung</text><rect x="30" y="65" width="180" height="35" rx="6" fill="#00f0ff" opacity="0.8"/><text x="120" y="88" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">6 Darstellung</text><rect x="30" y="105" width="180" height="35" rx="6" fill="#00f0ff" opacity="0.7"/><text x="120" y="128" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">5 Sitzung</text><rect x="30" y="145" width="180" height="35" rx="6" fill="#00f0ff" opacity="0.6"/><text x="120" y="168" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">4 Transport</text><rect x="30" y="185" width="180" height="35" rx="6" fill="#00f0ff" opacity="0.5"/><text x="120" y="208" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">3 Vermittlung</text><rect x="30" y="225" width="180" height="35" rx="6" fill="#00f0ff" opacity="0.35"/><text x="120" y="248" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">2 Sicherung</text><rect x="30" y="265" width="180" height="35" rx="6" fill="#00f0ff" opacity="0.2"/><text x="120" y="288" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">1 Bitübertragung</text><text x="120" y="325" text-anchor="middle" fill="#c9d1d9" font-size="11">Sender: 7→1 kapseln · Empfänger: 1→7 entkapseln</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

export function layerQuestion(layer) {
  const correctTask = layerTask(layer.num);
  // Pick two plausible distractor tasks from other layers so the position of the
  // correct answer is not predictable and every option is actually meaningful.
  const otherLayers = OSI_LAYERS.filter((l) => l.num !== layer.num);
  const distractors = otherLayers
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((l) => `Sie ist zuständig für ${layerTask(l.num)}`);
  const options = [`Sie ist zuständig für ${correctTask}`, ...distractors];
  return {
    question: `Welche Aussage passt zur ${layer.de}?`,
    options,
    correct: 0,
    explanation: correctTask,
  };
}

function buildExplanations() {
  const exps = [];

  // Intro
  exps.push(explanation('intro-classic', 'Warum Schichtenmodelle?', 'classic', [
    { type: 'text', content: 'Netzwerke sind komplex. Schichtenmodelle zerlegen die Kommunikation in überschaubare Ebenen, damit Hersteller, Administratoren und Entwickler wissen, wer für welche Aufgabe zuständig ist.' },
    { type: 'text', content: 'OSI steht für Open Systems Interconnection. Das OSI-Modell ist ein Referenzmodell: keine einzelne Software und keine Sammlung physisch getrennter Systeme, sondern eine Denkhilfe für Aufgaben und Fehlerbereiche. Reale Protokolle passen nicht immer exakt in nur eine Schicht.' },
    { type: 'diagram', content: OSI_SVG },
  ]));

  exps.push(explanation('intro-intuitive', 'Warum Schichtenmodelle?', 'intuitive', [
    { type: 'text', content: 'Stell dir einen Paketversand vor: Jemand packt einen Karton, klebt das Etikett drauf, ein LKW transportiert ihn, ein Depot sortiert ihn und schließlich kommt er beim Empfänger an. Jeder Schritt ist eine eigene „Schicht“.' },
    { type: 'text', content: 'Das ist nur eine Eselsbrücke. In echten Netzwerken gibt es keine Kartons – aber die Idee ist dieselbe: Jede Schicht kümmert sich um einen klar abgegrenzten Teil der Kommunikation.' },
  ]));

  // Per-layer sections
  for (const layer of OSI_LAYERS) {
    const q = layerQuestion(layer);
    exps.push(explanation(`layer${layer.num}-classic`, `${layer.num}. ${layer.de}`, 'classic', [
      ...layerBlocks(layer, 'classic'),
      { type: 'question', id: `q-layer${layer.num}-classic`, question: q.question, options: q.options, correct: q.correct, explanation: q.explanation },
    ]));
    exps.push(explanation(`layer${layer.num}-intuitive`, `${layer.num}. ${layer.de}`, 'intuitive', [
      ...layerBlocks(layer, 'intuitive'),
      { type: 'question', id: `q-layer${layer.num}-intuitive`, question: q.question, options: q.options, correct: q.correct, explanation: q.explanation },
    ]));
  }

  exps.push(explanation('layer2-frame-classic', 'Layer 2: Frame und Switch', 'classic', [
    { type: 'text', content: 'Layer 2 strukturiert Daten als Frames und verwendet lokale MAC-Adressierung. Ein Ethernet-Frame trägt unter anderem Ziel-MAC, Quell-MAC, Type/Length, Nutzdaten und FCS zur Fehlererkennung.' },
    { type: 'diagram', content: ETHERNET_FRAME_SVG },
    { type: 'text', content: 'Ein Layer-2-Switch lernt die Quell-MAC eingehender Frames am jeweiligen Port (Learning). Ist die Ziel-MAC bekannt, leitet er gezielt weiter (Forwarding); ist sie unbekannt, verteilt er den Frame außer am Eingangsport (Flooding).' },
    { type: 'text', content: 'Wenn mehrere Teilnehmer dasselbe Medium teilen, regeln Zugriffsverfahren das Senden. Token Passing vergibt kontrollierten Zugriff; CSMA/CD hört das Medium ab, erkennt Kollisionen und versucht es nach zufälliger Wartezeit erneut. CSMA/CA versucht Kollisionen zu vermeiden.' },
    { type: 'question', facet: 'switch-learning', question: 'Die MAC-Tabelle ist leer und PC A sendet einen Frame. Welche Information lernt der Switch zuerst?', options: ['Quell-MAC von A und den Eingangsport', 'Ziel-IP und Standardgateway', 'TCP-Port des späteren Dienstes'], correct: 0, explanation: 'Ein Switch lernt aus der Quell-MAC eines eingehenden Frames, an welchem Port der Absender erreichbar ist.' },
  ]));

  exps.push(explanation('arp-classic', 'ARP: IP-Ziel, MAC für den Frame', 'classic', [
    { type: 'text', content: 'Layer 3 kennt die logische Ziel-IP. Für einen lokalen Ethernet-Frame wird zusätzlich eine Ziel-MAC benötigt. ARP verbindet diese beiden Sichten, ohne MAC- und IP-Adresse gleichzusetzen.' },
    { type: 'diagram', content: ARP_SVG },
    { type: 'list', title: 'Grundablauf', items: ['ARP-Cache prüfen', 'bei fehlendem Eintrag ARP Request als Broadcast senden', 'passender Host antwortet mit seiner MAC-Adresse', 'IP-MAC-Zuordnung im Cache speichern', 'Ethernet-Frame kann lokal adressiert werden'] },
    { type: 'question', facet: 'arp', question: 'Warum benötigt ein Rechner für lokale Ethernet-Kommunikation IP- und MAC-Adresse?', options: ['IP beschreibt das logische Ziel; MAC adressiert den lokalen Layer-2-Frame.', 'Beide Adressen erfüllen exakt dieselbe Aufgabe.', 'Ein Switch benötigt grundsätzlich nur die Ziel-IP.'], correct: 0, explanation: 'Layer 3 identifiziert das logische Zielnetz beziehungsweise den Host. Layer 2 benötigt für den lokalen Frame eine MAC-Adresse.' },
  ]));

  // --- Layer 4 Deep-Dive: Three-Way Handshake ---
  exps.push(explanation('handshake-classic', 'TCP Three-Way Handshake', 'classic', [
    { type: 'text', content: 'Bevor zwei Geräte zuverlässig Daten austauschen können, baut TCP zunächst eine Verbindung auf. Dafür nutzt TCP den sogenannten Three-Way Handshake.' },
    { type: 'table', headers: ['Schritt', 'Richtung', 'Paket', 'Bedeutung'], rows: [
      ['1', 'Client → Server', 'SYN', '„Hallo Server, ich möchte eine Verbindung aufbauen."'],
      ['2', 'Server → Client', 'SYN + ACK', '„Hallo Client, ich habe deine Anfrage erhalten und bin bereit."'],
      ['3', 'Client → Server', 'ACK', '„Perfekt, Verbindung steht. Jetzt können wir Daten austauschen."'],
    ] },
    { type: 'text', content: 'Erst jetzt beginnt der eigentliche Datenaustausch. TCP weiß dadurch, dass beide Kommunikationspartner erreichbar sind.' },
  ]));

  exps.push(explanation('handshake-intuitive', 'TCP Three-Way Handshake', 'intuitive', [
    { type: 'text', content: 'Stell dir vor, du rufst jemanden an: Du sagst „Hallo?" (SYN), die andere Person antwortet „Hallo, ja ich höre dich!" (SYN+ACK), und du bestätigst „Super, ich dich auch!" (ACK). Erst dann redet ihr los.' },
    { type: 'text', content: 'Genau so baut TCP sicher, dass beide Seiten bereit sind, bevor Daten fließen.' },
  ]));

  // --- Layer 4 Deep-Dive: TCP vs UDP ---
  exps.push(explanation('tcp-vs-udp-classic', 'TCP vs. UDP', 'classic', [
    { type: 'text', content: 'Auf der Transportschicht gibt es zwei grundlegende Protokolle: TCP und UDP. Sie lösen dasselbe Problem – Daten von A nach B bringen – aber mit völlig unterschiedlichem Ansatz.' },
    { type: 'table', headers: ['Eigenschaft', 'TCP', 'UDP'], rows: [
      ['Verbindungsaufbau', 'Ja (Three-Way Handshake)', 'Nein'],
      ['Zuverlässigkeit', 'Ja – verlorene Pakete werden erneut gesendet', 'Nein – keine Garantie'],
      ['Reihenfolge', 'Wird eingehalten', 'Nicht garantiert'],
      ['Geschwindigkeit', 'Langsamer (mehr Overhead)', 'Schneller (weniger Overhead)'],
      ['Einsatz', 'Web, E-Mail, Dateiübertragung', 'Streaming, VoIP, Spiele'],
    ] },
    { type: 'text', content: 'Merksatz: TCP = Erst anklopfen, dann reden. UDP = Einfach losreden.' },
  ]));

  exps.push(explanation('tcp-vs-udp-intuitive', 'TCP vs. UDP', 'intuitive', [
    { type: 'text', content: 'TCP ist wie ein Einschreiben: Du weißt sicher, dass es angekommen ist. UDP ist wie ein Flyer in den Briefkasten werfen: Schnell und günstig, aber ob er gelesen wird, ist ungewiss.' },
    { type: 'list', title: 'Wann was?', items: [
      'TCP: Wenn alles ankommen muss (Webseiten, E-Mails, Downloads)',
      'UDP: Wenn Geschwindigkeit wichtiger ist als Vollständigkeit (Livestreams, Online-Gaming, VoIP)',
    ] },
  ]));

  // --- Layer 4 Deep-Dive: Wichtige Ports ---
  exps.push(explanation('ports-classic', 'Wichtige Portnummern', 'classic', [
    { type: 'text', content: 'Eine IP-Adresse bringt ein Datenpaket zum richtigen Gerät. Die Portnummer sorgt dafür, dass es beim richtigen Dienst auf diesem Gerät ankommt.' },
    { type: 'table', headers: ['Dienst', 'Port', 'Protokoll', 'Merkhilfe'], rows: [
      ['DNS', '53', 'TCP/UDP', 'Namensauflösung'],
      ['DHCP', '67/68', 'UDP', 'IP-Adresse automatisch beziehen'],
      ['HTTP', '80', 'TCP', 'Unverschlüsselte Webseite'],
      ['HTTPS', '443', 'TCP', 'Verschlüsselte Webseite'],
      ['SSH', '22', 'TCP', 'Sicherer Fernzugriff'],
      ['Telnet', '23', 'TCP', 'Unsicherer Fernzugriff'],
      ['FTP', '20/21', 'TCP', 'Dateiübertragung'],
      ['WSUS', '8530/8531', 'TCP', 'Windows Updates'],
    ] },
    { type: 'text', content: 'Diese Ports musst du nicht sofort auswendig können. Die wichtigsten wirst du mit der Zeit automatisch lernen.' },
  ]));

  exps.push(explanation('ports-intuitive', 'Wichtige Portnummern', 'intuitive', [
    { type: 'text', content: 'Ports sind wie Zimmernummern in einem Hotel: Die IP-Adresse bringt dich zum richtigen Gebäude, der Port zum richtigen Zimmer. Jeder Dienst hat sein eigenes Zimmer.' },
    { type: 'list', title: 'Eselsbrücken', items: [
      '80 → HTTP → Standard-Webseite',
      '443 → HTTPS → Sicheres Web',
      '22 → SSH → Sicher administrieren',
      '23 → Telnet → Alt und unsicher',
      '53 → DNS → Namen auflösen',
      '67/68 → DHCP → Automatische IP-Adresse',
    ] },
  ]));

  // Encapsulation
  exps.push(explanation('encapsulation-classic', 'Kapselung und Entkapselung', 'classic', [
    { type: 'text', content: 'Beim Senden wandern Daten von Schicht 7 nach Schicht 1. Jede Schicht fügt ihre eigenen Steuerinformationen hinzu: Header, Trailer, Prüfsummen. Das nennt man Kapselung (Encapsulation).' },
    { type: 'text', content: 'Beim Empfangen passiert das Gegenteil: Schicht 1 liefert Bits an Schicht 2, die den Frame prüft, übergibt das Paket an Schicht 3 usw. Jede Schicht entfernt ihre Steuerinformationen – Entkapselung (Decapsulation).' },
    { type: 'diagram', content: ENCAPSULATION_SVG },
    { type: 'text', content: 'Vereinfacht entstehen dabei Daten → Segment beziehungsweise Datagramm → Paket → Frame → Bits beziehungsweise Signale. Jede Ebene ergänzt Informationen für ihre eigene Aufgabe.' },
    { type: 'list', title: 'Reihenfolge im Blick', items: [
      'Sender: Anwendung → Darstellung → Sitzung → Transport → Vermittlung → Sicherung → Bitübertragung',
      'Empfänger: Bitübertragung → Sicherung → Vermittlung → Transport → Sitzung → Darstellung → Anwendung',
    ] },
  ]));

  exps.push(explanation('encapsulation-intuitive', 'Kapselung und Entkapselung', 'intuitive', [
    { type: 'text', content: 'Beim Packen legst du zuerst den Inhalt in einen kleinen Umschlag, dann in einen Karton, dann kommt ein Adressetikett, dann fährt ein LKW. Jede Station packt etwas drumherum oder öffnet wieder Schicht für Schicht.' },
    { type: 'text', content: 'Genau so arbeitet auch ein Netzwerkstack: Header und Trailer werden beim Senden hinzugefügt und beim Empfangen wieder entfernt. Die Analogie ist keine 1:1-Abbildung, aber sie hilft, die Richtung zu merken.' },
  ]));

  // Summary
  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'text', content: 'Das OSI-Modell teilt die Kommunikation in sieben Schichten auf. Jede Schicht hat eigene Aufgaben, Geräte, Protokolle und Dateneinheiten.' },
    { type: 'list', title: 'Die wichtigsten Merkpunkte', items: [
      '1 Bitübertragung – physische Übertragung',
      '2 Sicherung – MAC-Adressen, Frames, Switche',
      '3 Vermittlung – IP, Routing',
      '4 Transport – TCP, UDP, Ports',
      '5 Sitzung – Dialogsteuerung',
      '6 Darstellung – Format, Verschlüsselung',
      '7 Anwendung – Browser, Mail, Server',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'osi-ordering',
      type: 'ordering',
      question: 'Bringe die OSI-Schichten von unten (Schicht 1) nach oben (Schicht 7) in die richtige Reihenfolge.',
      items: OSI_LAYERS.map((l) => ({ id: `l${l.num}`, label: l.de })),
      correctOrder: OSI_LAYERS.map((l) => `l${l.num}`),
      explanation: 'Von unten nach oben: Bitübertragung, Sicherung, Vermittlung, Transport, Sitzung, Darstellung, Anwendung.',
    },
    {
      id: 'osi-tasks',
      type: 'matching',
      question: 'Ordne die Aufgabe der passenden OSI-Schicht zu.',
      pairs: [
        { left: 'MAC-Adressen und Frames', leftLabel: 'MAC-Adressen und Frames', right: '2. Sicherungsschicht' },
        { left: 'IP-Adressen und Routing', leftLabel: 'IP-Adressen und Routing', right: '3. Vermittlungsschicht' },
        { left: 'TCP/UDP und Ports', leftLabel: 'TCP/UDP und Ports', right: '4. Transportschicht' },
        { left: 'Verschlüsselung und Kodierung', leftLabel: 'Verschlüsselung und Kodierung', right: '6. Darstellungsschicht' },
        { left: 'Browser, Mail, DNS', leftLabel: 'Browser, Mail, DNS', right: '7. Anwendungsschicht' },
      ],
      explanation: 'MAC/Frames = Sicherung, IP/Routing = Vermittlung, TCP/UDP = Transport, Verschlüsselung = Darstellung, Anwendungen = Anwendungsschicht.',
    },
    {
      id: 'osi-devices',
      type: 'matching',
      question: 'Ordne das Gerät oder die Funktion der passenden Schicht zu.',
      pairs: [
        { left: 'Hub / Repeater', leftLabel: 'Hub / Repeater', right: '1. Bitübertragungsschicht' },
        { left: 'Switch', leftLabel: 'Switch', right: '2. Sicherungsschicht' },
        { left: 'Router', leftLabel: 'Router', right: '3. Vermittlungsschicht' },
        { left: 'Stateful Firewall', leftLabel: 'Stateful Firewall', right: '4. Transportschicht' },
        { left: 'Webserver / Browser', leftLabel: 'Webserver / Browser', right: '7. Anwendungsschicht' },
      ],
      explanation: 'Hubs arbeiten auf Bit-Ebene, Switche auf Frame-Ebene, Router auf Paket-Ebene. Transportschicht-Geräte prüfen Ports, Anwendungen liegen ganz oben.',
    },
    {
      id: 'osi-errors',
      type: 'select-best',
      question: 'Bei welcher OSI-Schicht sucht man am ehesten, wenn ein Netzwerkkabel nicht eingesteckt ist?',
      options: ['Vermittlungsschicht', 'Bitübertragungsschicht', 'Anwendungsschicht', 'Transportschicht'],
      correct: 1,
      explanation: 'Ein nicht eingestecktes Kabel ist ein physisches Problem und wird zuerst in der Bitübertragungsschicht (Schicht 1) geprüft.',
    },
    {
      id: 'osi-port-blocked',
      type: 'select-best',
      question: 'Ein Server ist erreichbar, aber TCP-Port 443 wird blockiert. Auf welcher Schicht liegt das Problem typischerweise?',
      options: ['Sicherungsschicht', 'Vermittlungsschicht', 'Transportschicht', 'Anwendungsschicht'],
      correct: 2,
      explanation: 'Portnummern sind Teil der Transportschicht (Schicht 4).',
    },
    {
      id: 'osi-app-error',
      type: 'select-best',
      question: 'Eine Webanwendung zeigt einen 500-Fehler an. Wo liegt das Problem?',
      options: ['Bitübertragungsschicht', 'Transportschicht', 'Anwendungsschicht', 'Sicherungsschicht'],
      correct: 2,
      explanation: 'Ein HTTP-500-Fehler wird von der Anwendung selbst erzeugt und liegt daher in der Anwendungsschicht (Schicht 7).',
    },
    {
      id: 'osi-encapsulation-order',
      type: 'ordering',
      question: 'Bringe die vereinfachten Dateneinheiten beim Senden in die richtige Reihenfolge.',
      items: [
        { id: 'data', label: 'Anwendungsdaten' },
        { id: 'segment', label: 'Segment / Datagramm' },
        { id: 'packet', label: 'IP-Paket' },
        { id: 'frame', label: 'Ethernet-Frame' },
        { id: 'bits', label: 'Bits / physikalisches Signal' },
      ],
      correctOrder: ['data', 'segment', 'packet', 'frame', 'bits'],
      explanation: 'Jede Schicht ergänzt Informationen: Daten → Segment/Datagramm → Paket → Frame → Bits/Signal.',
    },
    {
      id: 'osi-arp-order',
      type: 'ordering',
      question: 'Bringe den vereinfachten ARP-Ablauf in die richtige Reihenfolge.',
      items: [
        { id: 'cache', label: 'ARP-Cache prüfen' },
        { id: 'request', label: 'ARP Request als Broadcast senden' },
        { id: 'reply', label: 'Zielhost antwortet mit seiner MAC-Adresse' },
        { id: 'store', label: 'IP-MAC-Zuordnung speichern' },
        { id: 'frame', label: 'Ethernet-Frame lokal adressieren' },
      ],
      correctOrder: ['cache', 'request', 'reply', 'store', 'frame'],
      explanation: 'ARP ermittelt zu einer bekannten IP die benötigte lokale MAC-Adresse.',
    },
    {
      id: 'osi-switch-learning',
      type: 'select-best',
      question: 'Switch-Tabelle leer: A sendet an B. Was geschieht zuerst?',
      options: ['Der Switch lernt Quell-MAC A am Eingangsport und floodet das unbekannte Ziel.', 'Der Switch berechnet anhand der Ziel-IP eine Route.', 'Der Switch verwirft jeden Frame mit unbekannter Ziel-MAC.'],
      correct: 0,
      explanation: 'Learning nutzt die Quell-MAC. Eine unbekannte Ziel-MAC führt zu Flooding; nach Bs Antwort kann gezielt weitergeleitet werden.',
    },
    {
      id: 'osi-troubleshooting-gateway',
      type: 'select-best',
      question: 'Der lokale Link funktioniert, aber das konfigurierte Standardgateway ist falsch. Welche Schicht prüfst du zuerst?',
      options: ['Layer 3 – Vermittlung', 'Layer 1 – Bitübertragung', 'Layer 6 – Darstellung'],
      correct: 0,
      explanation: 'IP-Konfiguration, Gateway und Routing gehören zur Layer-3-Einordnung.',
    },
  ];
}

function buildQuiz() {
  return [
    {
      question: 'Wie viele Schichten hat das OSI-Modell?',
      options: ['4', '5', '6', '7'],
      correct: 3,
      explanation: 'Das OSI-Modell hat sieben Schichten.',
    },
    {
      question: 'In welcher Reihenfolge kapselt ein Sender Daten?',
      options: ['7 → 1', '1 → 7', '3 → 7', '7 → 4 → 1'],
      correct: 0,
      explanation: 'Der Sender arbeitet von der Anwendungsschicht (7) bis zur Bitübertragungsschicht (1).',
    },
    {
      question: 'Welches Gerät arbeitet primär auf der Sicherungsschicht?',
      options: ['Router', 'Switch', 'Hub', 'Firewall'],
      correct: 1,
      explanation: 'Ein Switch arbeitet mit MAC-Adressen und Frames, also auf Schicht 2.',
    },
    {
      question: 'Welches Protokoll gehört zur Vermittlungsschicht?',
      options: ['HTTP', 'TCP', 'IP', 'Ethernet'],
      correct: 2,
      explanation: 'IP (IPv4/IPv6) ist das klassische Protokoll der Vermittlungsschicht (Schicht 3).',
    },
    {
      question: 'Wofür ist die Darstellungsschicht (Schicht 6) zuständig?',
      options: ['Routing', 'Verschlüsselung und Formatumwandlung', 'Portnummern', 'Physikalische Signale'],
      correct: 1,
      explanation: 'Schicht 6 kümmert sich um Darstellung, Kodierung, Komprimierung und Verschlüsselung.',
    },
    // --- Three-Way Handshake ---
    {
      question: 'Welches Paket sendet der Client als Erstes beim Three-Way Handshake?',
      options: ['ACK', 'SYN', 'SYN + ACK', 'FIN'],
      correct: 1,
      explanation: 'Der Client beginnt den Verbindungsaufbau mit einem SYN-Paket.',
    },
    {
      question: 'Aus wie vielen Schritten besteht der Three-Way Handshake?',
      options: ['2', '3', '4', '5'],
      correct: 1,
      explanation: 'Three-Way = drei Schritte: SYN, SYN+ACK, ACK.',
    },
    {
      question: 'Welches Protokoll verwendet den Three-Way Handshake?',
      options: ['UDP', 'IP', 'TCP', 'ICMP'],
      correct: 2,
      explanation: 'TCP baut über den Three-Way Handshake eine zuverlässige Verbindung auf.',
    },
    {
      question: 'Warum besitzt UDP keinen Handshake?',
      options: ['UDP ist kaputt', 'UDP braucht keine Verbindung – es sendet einfach los', 'UDP nutzt stattdessen vier Schritte', 'Der Handshake wurde bei UDP vergessen'],
      correct: 1,
      explanation: 'UDP ist verbindungslos. Es sendet Daten ohne vorherigen Verbindungsaufbau, was es schneller, aber unzuverlässiger macht.',
    },
    // --- Ports ---
    {
      question: 'Welcher Port gehört zu HTTPS?',
      options: ['80', '22', '443', '53'],
      correct: 2,
      explanation: 'HTTPS (verschlüsseltes Web) verwendet Port 443.',
    },
    {
      question: 'Welcher Port gehört zu SSH?',
      options: ['23', '22', '443', '80'],
      correct: 1,
      explanation: 'SSH (sicherer Fernzugriff) verwendet Port 22.',
    },
    {
      question: 'Welcher Dienst verwendet Port 53?',
      options: ['DHCP', 'HTTP', 'DNS', 'FTP'],
      correct: 2,
      explanation: 'DNS (Namensauflösung) nutzt Port 53.',
    },
    {
      question: 'Welcher Dienst verwendet Port 67/68?',
      options: ['DNS', 'DHCP', 'SSH', 'HTTPS'],
      correct: 1,
      explanation: 'DHCP nutzt Port 67 (Server) und 68 (Client) zur automatischen IP-Vergabe.',
    },
    { facet: 'pdu', question: 'Welche Zuordnung ist korrekt?', options: ['Layer 2 → Frame', 'Layer 3 → Port', 'Layer 1 → IP-Paket'], correct: 0, explanation: 'Layer 2 arbeitet mit Frames; Layer 3 mit Paketen und Layer 1 mit Bits beziehungsweise Signalen.' },
    { facet: 'encapsulation', question: 'Warum wird ein IP-Paket zusätzlich in einen Ethernet-Frame verpackt?', options: ['Damit Layer 2 es mit lokalen MAC-Informationen über den konkreten Link übertragen kann.', 'Damit der Router den Browser startet.', 'Damit Layer 1 die Ziel-IP als Portnummer liest.'], correct: 0, explanation: 'Das IP-Paket trägt Layer-3-Informationen. Der lokale Link benötigt zusätzlich einen Layer-2-Frame mit MAC-Adressierung.' },
    { facet: 'switch-learning', question: 'Ein normaler Layer-2-Switch entscheidet primär anhand welcher Information?', options: ['Ziel-MAC-Adresse im Frame', 'Ziel-IP-Adresse im Paket', 'HTTP-Statuscode'], correct: 0, explanation: 'Der Layer-2-Switch nutzt seine MAC-Tabelle und die Ziel-MAC des Frames.' },
    { facet: 'arp', question: 'Welche Aufgabe erfüllt ARP im lokalen Ethernet-Kontext?', options: ['Zu einer bekannten IP die passende MAC-Adresse ermitteln', 'Eine TCP-Verbindung per Handshake aufbauen', 'Eine Route zwischen Ländern berechnen'], correct: 0, explanation: 'ARP verbindet die logische IP-Sicht mit der lokalen MAC-Adressierung für den Frame.' },
    { facet: 'troubleshooting', question: 'Ein Kabel ist nicht eingesteckt. Wo beginnt die Fehlersuche?', options: ['Layer 1 – Physical', 'Layer 4 – Transport', 'Layer 7 – Application'], correct: 0, explanation: 'Physische Verbindung und Signalübertragung gehören zu Layer 1.' },
    { facet: 'misconception-osi', question: 'Sind OSI-Schichten sieben physisch getrennte Systeme?', options: ['Nein, sie sind funktionale Ebenen eines Referenzmodells.', 'Ja, jede Schicht benötigt zwingend einen eigenen Server.', 'Ja, aber nur bei TCP.'], correct: 0, explanation: 'Das OSI-Modell strukturiert Aufgaben konzeptionell; es beschreibt keine sieben getrennten Geräte.' },
  ];
}

function buildSummary() {
  return [
    'Das OSI-Modell ist ein Referenzmodell mit sieben Schichten.',
    'Sender kapseln von Schicht 7 nach 1, Empfänger entkapseln von 1 nach 7.',
    'Schicht 1 = Bits/Kabel, Schicht 2 = Frames/MAC, Schicht 3 = IP/Routing.',
    'Schicht 4 = TCP/UDP/Ports, Schicht 7 = Anwendungen wie HTTP/DNS.',
    'In der Praxis nutzt man das Modell, um Fehler einzugrenzen.',
  ];
}

export function buildOsiLesson() {
  return {
    title: 'OSI-Modell',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}

export const OSI_TOPIC_KEY = topicKey('fundamentals', 'osi-model');
