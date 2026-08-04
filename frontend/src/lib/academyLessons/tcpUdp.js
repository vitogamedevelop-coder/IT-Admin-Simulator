import { topicKey } from '../academyTopics.js';

// =============================================================================
// Milestone C5.3 - "TCP & UDP" merges the former three separate topics
// (tcp, udp, tcp-vs-udp) into ONE full LessonRunner lesson, including a
// dedicated Three-Way-Handshake section. See academyLessonData.js for the
// registration and academyProgress.js for the legacy-topic score migration.
// =============================================================================

export const TCP_UDP_TOPIC_KEY = topicKey('fundamentals', 'tcp-udp');

const HANDSHAKE_SVG = `<svg viewBox="0 0 260 170" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="40" y="20" fill="#00f0ff" font-size="12" font-weight="bold" text-anchor="middle">Client</text><text x="220" y="20" fill="#00f0ff" font-size="12" font-weight="bold" text-anchor="middle">Server</text><line x1="40" y1="28" x2="40" y2="160" stroke="#30363d" stroke-width="2"/><line x1="220" y1="28" x2="220" y2="160" stroke="#30363d" stroke-width="2"/><line x1="40" y1="55" x2="220" y2="75" stroke="#00f0ff" stroke-width="2" marker-end="url(#arrow)"/><text x="130" y="50" fill="#c9d1d9" font-size="11" text-anchor="middle">1. SYN</text><line x1="220" y1="95" x2="40" y2="115" stroke="#00ff66" stroke-width="2" marker-end="url(#arrow2)"/><text x="130" y="90" fill="#c9d1d9" font-size="11" text-anchor="middle">2. SYN + ACK</text><line x1="40" y1="135" x2="220" y2="155" stroke="#00f0ff" stroke-width="2" marker-end="url(#arrow)"/><text x="130" y="130" fill="#c9d1d9" font-size="11" text-anchor="middle">3. ACK</text><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#00f0ff"/></marker><marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#00ff66"/></marker></defs></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Intro: warum zwei Transportprotokolle?
  // ---------------------------------------------------------------------
  exps.push(explanation('intro-classic', 'TCP und UDP im Überblick', 'classic', [
    { type: 'text', content: 'TCP steht für "Transmission Control Protocol", UDP für "User Datagram Protocol". Beide arbeiten auf der Transportschicht (Schicht 4) und bringen Daten von einer Anwendung zur anderen - aber mit gegensätzlicher Philosophie.' },
    { type: 'text', content: 'TCP ist verbindungsorientiert und zuverlässig: Es baut eine Verbindung auf, bestätigt jedes Segment und stellt die richtige Reihenfolge sicher. UDP ist verbindungslos: Es sendet Daten einfach los, ohne Verbindungsaufbau, Bestätigung oder Reihenfolgegarantie.' },
    { type: 'text', content: 'Warum existieren beide? Weil es keine Lösung gibt, die für ALLE Anwendungsfälle optimal ist. Zuverlässigkeit kostet Zeit und Overhead - manche Anwendungen brauchen das unbedingt, andere brauchen vor allem Geschwindigkeit.' },
  ]));

  exps.push(explanation('intro-intuitive', 'TCP und UDP im Überblick', 'intuitive', [
    { type: 'text', content: 'TCP ist wie ein Einschreiben mit Rückschein: Du bekommst eine Bestätigung, dass alles ankam - dafür dauert es etwas länger. UDP ist wie ein Flyer in den Briefkasten werfen: schnell und ohne Aufwand, aber ohne Garantie, dass er gelesen wird.' },
    { type: 'text', content: 'Diese Analogie ist nur eine Eselsbrücke, aber sie trifft den Kern: Zuverlässigkeit gegen Geschwindigkeit ist die zentrale Abwägung zwischen TCP und UDP.' },
  ]));

  // ---------------------------------------------------------------------
  // 2. TCP im Detail
  // ---------------------------------------------------------------------
  exps.push(explanation('tcp-classic', 'TCP im Detail', 'classic', [
    { type: 'text', content: 'TCP (Transmission Control Protocol) ist verbindungsorientiert: Vor dem eigentlichen Datenaustausch wird über den Three-Way Handshake eine Verbindung aufgebaut.' },
    { type: 'list', title: 'Eigenschaften von TCP', items: [
      'Verbindungsorientiert - Verbindung wird auf- und abgebaut',
      'Zuverlässig - jedes Segment wird bestätigt (ACK)',
      'Reihenfolge garantiert - Segmente werden nummeriert und in Reihenfolge zusammengesetzt',
      'Fehlerkontrolle - verlorene Segmente werden automatisch erneut gesendet',
      'Flusskontrolle - Sender passt Tempo an den Empfänger an',
      'Höherer Overhead durch Header, Bestätigungen und Verbindungsverwaltung',
    ] },
    { type: 'text', content: 'Typische Einsatzgebiete: Web (HTTP/HTTPS), E-Mail (SMTP/IMAP), Dateiübertragung (FTP), SSH - überall dort, wo jedes Byte ankommen muss.' },
  ]));

  exps.push(explanation('tcp-intuitive', 'TCP im Detail', 'intuitive', [
    { type: 'text', content: 'TCP ist wie ein Telefongespräch: Du wählst (Verbindungsaufbau), ihr sprecht abwechselnd und bestätigt euch gegenseitig ("Ja, verstanden"), und am Ende legt ihr bewusst auf (Verbindungsabbau).' },
    { type: 'text', content: 'Merksatz: TCP = "Erst anklopfen, dann reden - und nachfragen, ob alles angekommen ist."' },
  ]));

  // ---------------------------------------------------------------------
  // 3. UDP im Detail
  // ---------------------------------------------------------------------
  exps.push(explanation('udp-classic', 'UDP im Detail', 'classic', [
    { type: 'text', content: 'UDP (User Datagram Protocol) ist verbindungslos: Es gibt keinen Handshake, keine Bestätigungen und keine Wiederholung verlorener Pakete.' },
    { type: 'list', title: 'Eigenschaften von UDP', items: [
      'Verbindungslos - keine Verbindung wird auf- oder abgebaut',
      'Keine Zustellgarantie - verlorene Pakete werden nicht automatisch erneut gesendet',
      'Keine Reihenfolgegarantie - Pakete können in falscher Reihenfolge ankommen',
      'Geringer Overhead - sehr kleiner Header (nur 8 Byte)',
      'Geringe Verzögerung (Latenz) - ideal für Echtzeitanwendungen',
      'Zuverlässigkeit muss die Anwendung selbst übernehmen, falls nötig',
    ] },
    { type: 'text', content: 'Typische Einsatzgebiete: DNS-Anfragen, Voice over IP (VoIP), Video-Streaming, Online-Gaming, DHCP - überall dort, wo Geschwindigkeit wichtiger ist als hundertprozentige Zuverlässigkeit.' },
  ]));

  exps.push(explanation('udp-intuitive', 'UDP im Detail', 'intuitive', [
    { type: 'text', content: 'UDP ist wie ein Zuruf über die Straße: Schnell und direkt, aber wenn der andere es nicht hört, bemerkst du es nicht automatisch - und niemand ruft es noch einmal.' },
    { type: 'text', content: 'Merksatz: UDP = "Einfach losreden - ohne Rückfrage."' },
  ]));

  // ---------------------------------------------------------------------
  // 4. Direkter Vergleich
  // ---------------------------------------------------------------------
  exps.push(explanation('comparison-classic', 'TCP vs. UDP im direkten Vergleich', 'classic', [
    { type: 'table', headers: ['Eigenschaft', 'TCP', 'UDP'], rows: [
      ['Verbindungsaufbau', 'Ja (Three-Way Handshake)', 'Nein'],
      ['Zuverlässigkeit', 'Ja - Bestätigungen (ACK) & erneute Übertragung', 'Nein - keine Garantie'],
      ['Reihenfolge', 'Wird garantiert eingehalten', 'Nicht garantiert'],
      ['Geschwindigkeit', 'Langsamer (mehr Overhead)', 'Schneller (weniger Overhead)'],
      ['Header-Größe', '20 Byte (mindestens)', '8 Byte'],
      ['Flusskontrolle', 'Ja', 'Nein'],
      ['Typische Nutzung', 'Web, E-Mail, Dateiübertragung, SSH', 'DNS, VoIP, Streaming, Gaming, DHCP'],
    ] },
    { type: 'text', content: 'Merksatz: "TCP prüft nach, UDP schickt einfach los." Die Wahl hängt immer vom Anwendungsfall ab - nicht davon, welches Protokoll grundsätzlich "besser" ist.' },
  ]));

  exps.push(explanation('comparison-intuitive', 'TCP vs. UDP im direkten Vergleich', 'intuitive', [
    { type: 'list', title: 'Entscheidungshilfe: TCP oder UDP?', items: [
      'Muss JEDES Byte ankommen? → TCP (Dateien, Webseiten, E-Mails)',
      'Ist eine kurze Verzögerung schlimmer als ein kleiner Datenverlust? → UDP (Live-Video, Sprachchat, Spiele)',
      'Ist die Anfrage klein und wird bei Bedarf einfach wiederholt? → UDP (DNS-Anfrage)',
      'Muss eine Reihenfolge zwingend eingehalten werden? → TCP',
    ] },
    { type: 'text', content: 'Diese Fragen helfen dir in der Praxis schneller zu entscheiden als reines Auswendiglernen.' },
  ]));

  // ---------------------------------------------------------------------
  // 5. Three-Way Handshake
  // ---------------------------------------------------------------------
  exps.push(explanation('handshake-classic', 'Der TCP Three-Way Handshake', 'classic', [
    { type: 'text', content: 'Bevor TCP Daten überträgt, muss eine Verbindung aufgebaut werden. Das passiert über genau drei Schritte - deshalb "Three-Way Handshake".' },
    { type: 'diagram', content: HANDSHAKE_SVG },
    { type: 'table', headers: ['Schritt', 'Richtung', 'Flag', 'Bedeutung'], rows: [
      ['1', 'Client → Server', 'SYN', '"Hallo Server, ich möchte eine Verbindung aufbauen."'],
      ['2', 'Server → Client', 'SYN + ACK', '"Hallo Client, ich habe deine Anfrage erhalten und bin bereit."'],
      ['3', 'Client → Server', 'ACK', '"Perfekt, Verbindung steht. Jetzt können wir Daten austauschen."'],
    ] },
    { type: 'text', content: 'Erst NACH dem dritten Schritt beginnt der eigentliche Datenaustausch. So wissen beide Seiten sicher, dass die Gegenseite erreichbar und sendebereit ist.' },
    { type: 'text', content: 'Praktisches Beispiel: Öffnest du eine HTTPS-Webseite, baut dein Browser zuerst per TCP-Handshake eine Verbindung zum Webserver auf Port 443 auf - erst danach beginnt der eigentliche Datenaustausch (inkl. TLS-Verschlüsselung).' },
    { type: 'text', content: 'Danach folgt die eigentliche Datenübertragung, und am Ende wird die Verbindung über einen separaten Abbau (typischerweise mit FIN/ACK-Nachrichten) wieder geordnet beendet.' },
  ]));

  exps.push(explanation('handshake-intuitive', 'Der TCP Three-Way Handshake', 'intuitive', [
    { type: 'text', content: 'Stell dir vor, du rufst jemanden an: Du sagst "Hallo?" (SYN), die andere Person antwortet "Hallo, ja ich höre dich!" (SYN-ACK), und du bestätigst "Super, ich dich auch!" (ACK). Erst dann redet ihr los.' },
    { type: 'list', title: 'Warum wird der Handshake benötigt?', items: [
      'Beide Seiten bestätigen, dass sie erreichbar sind, bevor Daten verloren gehen könnten.',
      'Beide Seiten tauschen erste Sequenznummern aus, damit spätere Segmente zugeordnet werden können.',
      'UDP verzichtet komplett darauf - deshalb ist UDP schneller, aber ohne diese Absicherung.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 6. Ports (kurzer Bezug, vertieft im eigenen Thema "Ports")
  // ---------------------------------------------------------------------
  exps.push(explanation('ports-classic', 'TCP/UDP und Ports', 'classic', [
    { type: 'text', content: 'Sowohl TCP als auch UDP nutzen Portnummern (0-65535), um innerhalb eines Geräts den richtigen Dienst zu adressieren. Ein Socket besteht aus IP-Adresse + Port + Protokoll (TCP oder UDP).' },
    { type: 'table', headers: ['Dienst', 'Port', 'Protokoll'], rows: [
      ['HTTP', '80', 'TCP'],
      ['HTTPS', '443', 'TCP'],
      ['DNS', '53', 'TCP/UDP'],
      ['DHCP', '67/68', 'UDP'],
      ['SSH', '22', 'TCP'],
    ] },
    { type: 'text', content: 'Wichtig für Administratoren: Ein Dienst kann denselben Port auf TCP und UDP unabhängig voneinander belegen - das sind zwei technisch getrennte "Adressen".' },
  ]));

  // ---------------------------------------------------------------------
  // 7. Administrator-Bezug / Zusammenfassung
  // ---------------------------------------------------------------------
  exps.push(explanation('admin-classic', 'Bezug zum Admin-Alltag', 'classic', [
    { type: 'list', title: 'Typische Situationen', items: [
      'Eine Firewall blockiert Port 443/TCP → HTTPS-Zugriffe schlagen fehl, nicht aber ein UDP-Dienst auf einem anderen Port.',
      'Ein VoIP-Gespräch stockt bei Netzwerküberlastung eher, als komplett abzubrechen - typisch für UDP-Anwendungen.',
      'Ein Datei-Upload bricht bei Verbindungsabbruch ab und muss neu gestartet werden - typisch für TCP-Anwendungen, die auf eine bestehende Verbindung angewiesen sind.',
      'Bei der Fehlersuche hilft die Frage "Ist die Anwendung TCP oder UDP-basiert?", um zu wissen, ob überhaupt ein Handshake stattfinden muss.',
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'TCP = Transmission Control Protocol: verbindungsorientiert, zuverlässig, mit Reihenfolge- und Fehlerkontrolle.',
      'UDP = User Datagram Protocol: verbindungslos, schnell, ohne Zustell- oder Reihenfolgegarantie.',
      'TCP baut die Verbindung über den Three-Way Handshake auf: SYN → SYN-ACK → ACK.',
      'UDP verzichtet komplett auf Verbindungsaufbau und Bestätigungen.',
      'Die Wahl hängt vom Anwendungsfall ab: Zuverlässigkeit (TCP) oder Geschwindigkeit/geringe Latenz (UDP).',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'handshake-ordering',
      type: 'ordering',
      question: 'Bringe die drei Schritte des TCP Three-Way Handshakes in die richtige Reihenfolge.',
      items: [
        { id: 'syn', label: 'SYN (Client → Server)' },
        { id: 'synack', label: 'SYN + ACK (Server → Client)' },
        { id: 'ack', label: 'ACK (Client → Server)' },
      ],
      correctOrder: ['syn', 'synack', 'ack'],
      explanation: 'Der Handshake läuft immer in dieser Reihenfolge: Erst SYN, dann SYN-ACK, dann ACK. Erst danach beginnt die Datenübertragung.',
    },
    {
      id: 'tcp-udp-scenarios',
      type: 'matching',
      question: 'Ordne jede Anwendung dem passenden Transportprotokoll zu.',
      pairs: [
        { left: 'Dateiübertragung', leftLabel: 'Dateiübertragung', right: 'TCP' },
        { left: 'Live-Videostreaming', leftLabel: 'Live-Videostreaming', right: 'UDP' },
        { left: 'E-Mail-Versand', leftLabel: 'E-Mail-Versand', right: 'TCP' },
        { left: 'DNS-Namensauflösung', leftLabel: 'DNS-Namensauflösung', right: 'UDP' },
        { left: 'Online-Gaming', leftLabel: 'Online-Gaming', right: 'UDP' },
        { left: 'SSH-Fernzugriff', leftLabel: 'SSH-Fernzugriff', right: 'TCP' },
      ],
      explanation: 'TCP für alles, was vollständig und in Reihenfolge ankommen muss (Dateien, E-Mail, SSH). UDP für Echtzeit-Anwendungen, bei denen Geschwindigkeit wichtiger ist als Vollständigkeit.',
    },
    {
      id: 'tcp-vs-udp-properties',
      type: 'select-best',
      question: 'Welche Aussage über UDP ist korrekt?',
      options: [
        'UDP baut vor der Übertragung eine Verbindung auf.',
        'UDP garantiert die Zustellung jedes Pakets.',
        'UDP sendet Daten ohne vorherigen Verbindungsaufbau.',
        'UDP hält automatisch die Reihenfolge der Pakete ein.',
      ],
      correct: 2,
      explanation: 'UDP ist verbindungslos - es sendet Daten direkt, ohne Handshake, Zustell- oder Reihenfolgegarantie.',
    },
    {
      id: 'handshake-why',
      type: 'input',
      question: 'Wie viele Schritte hat der TCP Three-Way Handshake? (Zahl eingeben)',
      answers: ['3', 'drei'],
      explanation: 'Der Name sagt es bereits: "Three-Way" - drei Schritte (SYN, SYN-ACK, ACK).',
    },
  ];
}

function buildQuiz() {
  return [
    // --- TCP/UDP ausgeschrieben ---
    { question: 'Wofür steht die Abkürzung TCP?', options: ['Transfer Control Protocol', 'Transmission Control Protocol', 'Transport Connection Protocol', 'Total Control Process'], correct: 1, explanation: 'TCP steht für "Transmission Control Protocol".' },
    { question: 'Wofür steht die Abkürzung UDP?', options: ['Universal Data Protocol', 'User Datagram Protocol', 'Unified Delivery Protocol', 'User Data Packet'], correct: 1, explanation: 'UDP steht für "User Datagram Protocol".' },
    // --- Grundeigenschaften ---
    { question: 'Welches Protokoll ist verbindungsorientiert?', options: ['UDP', 'TCP', 'Beide', 'Keines von beiden'], correct: 1, explanation: 'TCP ist verbindungsorientiert - es baut vor der Übertragung eine Verbindung auf.' },
    { question: 'Welches Protokoll ist verbindungslos?', options: ['TCP', 'UDP', 'Beide', 'Keines von beiden'], correct: 1, explanation: 'UDP ist verbindungslos und sendet ohne vorherigen Verbindungsaufbau.' },
    { question: 'Welche Aussage zur Zuverlässigkeit ist korrekt?', options: ['TCP und UDP sind beide zuverlässig.', 'TCP ist zuverlässig, UDP nicht.', 'UDP ist zuverlässig, TCP nicht.', 'Keines der beiden Protokolle ist zuverlässig.'], correct: 1, explanation: 'TCP bestätigt jedes Segment und wiederholt verlorene Übertragungen - UDP nicht.' },
    { question: 'Welches Protokoll garantiert die Reihenfolge der Datenpakete?', options: ['UDP', 'TCP', 'Beide gleich stark', 'Keines von beiden'], correct: 1, explanation: 'TCP nummeriert Segmente und setzt sie in der richtigen Reihenfolge zusammen.' },
    { question: 'Welches Protokoll hat den geringeren Overhead?', options: ['TCP', 'UDP', 'Beide identisch', 'Kommt auf die Anwendung an'], correct: 1, explanation: 'UDP hat einen deutlich kleineren Header (8 Byte) und keine Verbindungsverwaltung - daher geringerer Overhead.' },
    { question: 'Welches Protokoll bietet Fehlerkontrolle mit erneuter Übertragung verlorener Daten?', options: ['UDP', 'TCP', 'Beide', 'Keines von beiden'], correct: 1, explanation: 'TCP erkennt verlorene Segmente und sendet sie automatisch erneut.' },
    // --- Einsatzgebiete ---
    { question: 'Welches Protokoll wird typischerweise für Web (HTTPS) verwendet?', options: ['UDP', 'TCP', 'ICMP', 'ARP'], correct: 1, explanation: 'HTTPS läuft über TCP, da Webseiten vollständig und in Reihenfolge ankommen müssen.' },
    { question: 'Welches Protokoll wird typischerweise für Live-Sprachchat (VoIP) verwendet?', options: ['TCP', 'UDP', 'FTP', 'SSH'], correct: 1, explanation: 'VoIP nutzt UDP, weil geringe Verzögerung wichtiger ist als hundertprozentige Zuverlässigkeit.' },
    { question: 'Über welches Protokoll läuft eine gewöhnliche DNS-Namensauflösung meist zuerst?', options: ['TCP', 'UDP', 'HTTP', 'FTP'], correct: 1, explanation: 'Kleine DNS-Anfragen laufen normalerweise über UDP; TCP wird nur in bestimmten Fällen (z. B. große Antworten) verwendet.' },
    // --- Handshake ---
    { question: 'In welcher Reihenfolge laufen die drei Schritte des TCP Handshakes ab?', options: ['ACK → SYN → SYN-ACK', 'SYN → SYN-ACK → ACK', 'SYN-ACK → SYN → ACK', 'ACK → SYN-ACK → SYN'], correct: 1, explanation: 'Die korrekte Reihenfolge ist SYN, dann SYN-ACK, dann ACK.' },
    { question: 'Welches Protokoll führt einen Three-Way Handshake durch?', options: ['UDP', 'TCP', 'IP', 'ICMP'], correct: 1, explanation: 'Nur TCP führt vor der Datenübertragung den Three-Way Handshake durch.' },
    { question: 'Wann findet der Three-Way Handshake statt?', options: ['Nach jeder einzelnen Datenübertragung', 'Einmal, bevor die eigentliche Datenübertragung beginnt', 'Nur beim Verbindungsabbau', 'Nur bei UDP-Verbindungen'], correct: 1, explanation: 'Der Handshake findet einmal am Anfang statt, bevor Daten ausgetauscht werden.' },
    { question: 'Was passiert direkt nach einem erfolgreichen Three-Way Handshake?', options: ['Die Verbindung wird sofort wieder beendet.', 'Die eigentliche Datenübertragung beginnt.', 'Der Handshake startet automatisch erneut.', 'UDP übernimmt die weitere Kommunikation.'], correct: 1, explanation: 'Nach dem Handshake beginnt der eigentliche Datenaustausch zwischen den beiden Seiten.' },
    // --- TCP oder UDP? (Admin-Szenarien) ---
    { question: 'Ein Administrator muss eine große Konfigurationsdatei zuverlässig auf einen Server übertragen. Welches Protokoll?', options: ['UDP', 'TCP', 'ICMP', 'ARP'], correct: 1, explanation: 'Bei Dateiübertragungen muss jedes Byte ankommen - TCP ist hier die richtige Wahl.' },
    { question: 'Eine Firewall-Regel blockiert eingehenden Traffic auf TCP-Port 443. Welche Auswirkung hat das am ehesten?', options: ['DNS-Anfragen schlagen fehl.', 'HTTPS-Verbindungen zum Webserver schlagen fehl.', 'Das gesamte Netzwerk fällt aus.', 'Nur UDP-Dienste sind betroffen.'], correct: 1, explanation: 'Port 443/TCP wird von HTTPS genutzt - eine Blockierung verhindert genau diese Verbindungen.' },
    { question: 'Ein Nutzer beschwert sich über kurze "Ruckler" im Videocall, aber die Verbindung bricht nie komplett ab. Welches Protokoll wird der Videocall wahrscheinlich nutzen?', options: ['TCP', 'UDP', 'FTP', 'SSH'], correct: 1, explanation: 'Kurze Ruckler ohne Komplettabbruch sind typisch für UDP: einzelne Pakete gehen verloren, ohne dass die ganze Verbindung neu aufgebaut werden muss.' },
    { question: 'Welche Portnummer nutzt DHCP typischerweise (Server-Seite)?', options: ['Port 53', 'Port 67', 'Port 80', 'Port 443'], correct: 1, explanation: 'DHCP nutzt Port 67 auf Serverseite und Port 68 auf Clientseite, beide über UDP.' },
  ];
}

function buildSummary() {
  return [
    'TCP (Transmission Control Protocol): verbindungsorientiert, zuverlässig, mit Reihenfolge- und Fehlerkontrolle.',
    'UDP (User Datagram Protocol): verbindungslos, schnell, ohne Zustell- oder Reihenfolgegarantie.',
    'Three-Way Handshake: SYN → SYN-ACK → ACK, danach beginnt die Datenübertragung.',
    'TCP für Zuverlässigkeit (Web, E-Mail, Dateien, SSH), UDP für Geschwindigkeit (DNS, VoIP, Streaming, Gaming, DHCP).',
    'Beide Protokolle nutzen Portnummern, um Dienste auf einem Gerät zu unterscheiden.',
  ];
}

export function buildTcpUdpLesson() {
  return {
    title: 'TCP & UDP',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}
