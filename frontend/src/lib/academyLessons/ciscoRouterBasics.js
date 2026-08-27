import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Router-Grundlagen" - fills the catalog's existing `cisco-packet-tracer/
// router-basics` slot. Covers configuring a router's interfaces/IP addresses
// and, crucially, HOW a router decides where to send a packet (Longest
// Prefix Match, Administrative Distance, Metric, Connected/Static/OSPF) -
// the conceptual foundation the later "Statisches Routing", "Router on a
// Stick" and "Multilayer Switch" lessons build on. Heavy CLI-input practice
// for interface configuration, theory-only for the routing-decision part
// (no CLI yet - that comes with "Statisches Routing").
// =============================================================================

export const CISCO_ROUTER_BASICS_TOPIC_KEY = topicKey('cisco-packet-tracer', 'router-basics');

const ROUTING_DECISION_SVG = `<svg viewBox="0 0 320 240" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Routing-Entscheidung</text><rect x="110" y="40" width="100" height="35" rx="5" fill="#00f0ff" opacity="0.9"/><text x="160" y="62" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">Ziel-IP</text><polygon points="160,80 150,95 170,95" fill="#00f0ff"/><rect x="60" y="105" width="200" height="30" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="124" text-anchor="middle" fill="#c9d1d9" font-size="10">Passende Routen?</text><polygon points="160,140 150,155 170,155" fill="#00f0ff"/><rect x="80" y="165" width="160" height="30" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="184" text-anchor="middle" fill="#c9d1d9" font-size="9">Längster Präfix</text><polygon points="160,200 150,215 170,215" fill="#00f0ff"/><text x="160" y="232" text-anchor="middle" fill="#8b949e" font-size="9">gleich? AD, dann Metrik</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Was ein Router grundlegend tut', 'classic', [
    { type: 'text', content: 'Ein Router verbindet unterschiedliche Netzwerke (z. B. verschiedene VLANs, oder ein LAN mit dem Internet) und entscheidet anhand der Ziel-IP-Adresse eines Pakets, über welche Schnittstelle es weitergeleitet wird - im Gegensatz zum Switch, der nur innerhalb eines Netzes anhand von MAC-Adressen vermittelt.' },
  ]));

  exps.push(explanation('routing-decision-visual', 'So entscheidet ein Router', 'visual', [
    { type: 'diagram', content: ROUTING_DECISION_SVG },
    { type: 'text', content: 'Zuerst sucht der Router alle passenden Routen, wählt den längsten Präfix (spezifischste Route), und prüft erst danach Administrative Distance bzw. Metrik.' },
  ]));

  exps.push(explanation('interface-cli-classic', 'Router-Interface konfigurieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['interface <Interface>', 'Wechselt in den Konfigurationsmodus der Schnittstelle, z. B. "interface g0/0".'],
      ['ip address <IP-Adresse> <Subnetzmaske>', 'Vergibt dem Interface eine IP-Adresse, z. B. "ip address 192.168.10.1 255.255.255.0".'],
      ['no shutdown', 'Aktiviert die Schnittstelle - Router-Interfaces sind im Auslieferungszustand administrativ deaktiviert (shutdown) und müssen explizit aktiviert werden.'],
      ['show ip interface brief', 'Zeigt kompakt Status (up/down) und IP-Adresse aller Schnittstellen - der erste Kontrollbefehl nach jeder Interface-Konfiguration.'],
    ] },
    { type: 'list', title: 'Beispiel: GigabitEthernet0/0 konfigurieren', items: [
      'Router(config)# interface g0/0',
      'Router(config-if)# ip address 192.168.10.1 255.255.255.0',
      'Router(config-if)# no shutdown',
    ] },
    { type: 'question', question: 'Warum muss man bei einem Router-Interface fast immer "no shutdown" eingeben?', options: ['Weil sonst die IP-Adresse gelöscht wird', 'Weil Router-Interfaces im Auslieferungszustand deaktiviert sind', 'Weil sonst kein Passwort funktioniert', 'Weil "no shutdown" die Konfiguration speichert'], correct: 1, explanation: 'Anders als viele Switch-Ports sind Router-Interfaces standardmäßig administrativ deaktiviert.' },
  ]));

  exps.push(explanation('entscheidung-classic', 'Wie ein Router die Weiterleitung entscheidet', 'classic', [
    { type: 'text', content: 'Für jedes Paket schaut der Router in seine Routing-Tabelle und sucht den am besten passenden Eintrag für die Ziel-IP-Adresse.' },
    { type: 'list', title: 'Longest Prefix Match', items: [
      'Gibt es mehrere passende Einträge (z. B. eine Route zu 192.168.0.0/16 UND eine zu 192.168.10.0/24), gewinnt immer der Eintrag mit der LÄNGEREN (spezifischeren) Subnetzmaske.',
      'Das stellt sicher, dass spezifischere, genauere Routen bevorzugt werden, bevor auf allgemeinere "Auffang"-Routen zurückgegriffen wird.',
    ] },
  ]));

  exps.push(explanation('ad-metrik-classic', 'Administrative Distance und Metrik', 'classic', [
    { type: 'table', headers: ['Begriff', 'Bedeutung'], rows: [
      ['Administrative Distance (AD)', 'Bewertet, wie "vertrauenswürdig" eine Routing-Quelle ist, wenn mehrere Quellen dieselbe Zielroute liefern. Niedrigere AD gewinnt.'],
      ['Metrik', 'Bewertet innerhalb EINER Routing-Quelle, welcher Weg der "beste" ist (z. B. die kürzeste oder schnellste Strecke). Wird nur verglichen, wenn die AD gleich ist.'],
    ] },
    { type: 'table', headers: ['Routing-Quelle', 'Typische Administrative Distance'], rows: [
      ['Connected (direkt angeschlossenes Netz)', '0 - die vertrauenswürdigste Quelle überhaupt.'],
      ['Static (manuell eingetragene Route)', '1 - fast immer bevorzugt, außer gegenüber Connected.'],
      ['OSPF', '110 - ein verbreitetes dynamisches Routing-Protokoll, dazu mehr in einer späteren Lektion.'],
    ] },
    { type: 'text', content: 'Merksatz: Zuerst gewinnt die spezifischere Route (Longest Prefix Match), bei gleicher Spezifität die Quelle mit der niedrigeren Administrative Distance, und erst bei Gleichstand entscheidet die Metrik.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Router-Interface konfigurieren: "interface <Interface>" → "ip address <IP> <Maske>" → "no shutdown". Prüfen: "show ip interface brief".',
      'Longest Prefix Match: Bei mehreren passenden Routen gewinnt die spezifischere (längere Subnetzmaske).',
      'Administrative Distance: bewertet die Vertrauenswürdigkeit der Quelle (Connected 0, Static 1, OSPF 110) - niedriger gewinnt.',
      'Metrik: entscheidet erst bei gleicher Administrative Distance zwischen mehreren Wegen derselben Quelle.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'router-if-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte zur Router-Interface-Konfiguration in die richtige Reihenfolge.',
      items: [
        { id: 'int', label: 'interface g0/0' },
        { id: 'ip', label: 'ip address 10.0.0.1 255.255.255.0' },
        { id: 'no-shut', label: 'no shutdown' },
      ],
      correctOrder: ['int', 'ip', 'no-shut'],
      explanation: 'Erst die Schnittstelle wählen, dann die IP-Adresse vergeben, zuletzt die Schnittstelle aktivieren.',
    },
    {
      id: 'ad-matching',
      type: 'matching',
      question: 'Ordne jeder Routing-Quelle ihre typische Administrative Distance zu.',
      pairs: [
        { left: 'Connected', leftLabel: 'Connected', right: '0' },
        { left: 'Static', leftLabel: 'Static', right: '1' },
        { left: 'OSPF', leftLabel: 'OSPF', right: '110' },
      ],
      explanation: 'Connected hat die niedrigste (vertrauenswürdigste) AD, gefolgt von Static, dann dynamischen Protokollen wie OSPF.',
    },
    {
      id: 'lpm-select',
      type: 'select-best',
      question: 'Ein Router kennt sowohl eine Route zu 192.168.0.0/16 als auch zu 192.168.10.0/24. Ein Paket ist an 192.168.10.5 adressiert. Welche Route wird verwendet?',
      options: ['Immer die zuerst eingetragene Route', 'Die zu 192.168.0.0/16, weil sie allgemeiner ist', 'Die zu 192.168.10.0/24, weil sie spezifischer ist (Longest Prefix Match)', 'Beide Routen gleichzeitig'],
      correct: 2,
      explanation: 'Longest Prefix Match bevorzugt immer die spezifischere (längere) Subnetzmaske.',
    },
    {
      id: 'router-if-cli',
      type: 'cli-input',
      question: 'Konfiguriere GigabitEthernet0/1 mit der IP-Adresse 192.168.20.1/24 und aktiviere die Schnittstelle.',
      expectedLines: ['interface g0/1', 'ip address 192.168.20.1 255.255.255.0', 'no shutdown'],
      explanation: 'interface wählt die Schnittstelle, ip address vergibt Adresse und Maske, no shutdown aktiviert sie.',
    },
    {
      id: 'router-status-select',
      type: 'select-best',
      question: '"show ip interface brief" zeigt für g0/1 "administratively down/down". Was fehlt wahrscheinlich?',
      options: ['Eine falsche IP-Adresse', '"no shutdown" auf der Schnittstelle', 'Eine statische Route', 'Ein VLAN-Tag'],
      correct: 1,
      explanation: '"administratively down" bedeutet, dass die Schnittstelle noch mit "no shutdown" aktiviert werden muss.',
    },
    {
      id: 'lpm-ad-select',
      type: 'select-best',
      question: 'Ein Router kennt 10.0.0.0/8 (AD 1), 10.1.0.0/16 (AD 110) und 10.1.1.0/24 (AD 110). Wohin schickt er ein Paket an 10.1.1.5?',
      options: ['Über 10.0.0.0/8, weil es die niedrigste AD hat', 'Über 10.1.1.0/24, weil es der längste Präfix ist', 'Über 10.1.0.0/16, weil OSPF genutzt wird', 'Zufällige Auswahl'],
      correct: 1,
      explanation: 'Longest Prefix Match hat Vorrang vor Administrative Distance. Erst wenn mehrere Routen denselben Präfix haben, spielt die AD.',
    },
    {
      id: 'router-if-mask-select',
      type: 'select-best',
      question: 'Ein Interface ist mit "ip address 192.168.10.1 255.255.0.0" konfiguriert, soll aber ein /24-Netz bilden. Was ist zu tun?',
      options: ['Nichts, das ist richtig', 'Subnetzmaske auf 255.255.255.0 korrigieren', 'Default Route eintragen', 'Interface löschen'],
      correct: 1,
      explanation: 'Eine falsche Subnetzmaske muss korrigiert werden, indem der Befehl mit der richtigen Maske erneut eingegeben wird.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was unterscheidet einen Router grundlegend von einem L2-Switch?', options: ['Ein Router hat mehr Ports', 'Ein Router leitet Pakete anhand der IP-Adresse zwischen unterschiedlichen Netzen weiter', 'Ein Router kann keine Kabel verwenden', 'Ein Router hat kein Betriebssystem'], correct: 1, explanation: 'Der Router entscheidet auf Layer 3 (IP-Adresse) und verbindet unterschiedliche Netze.' },
    { question: 'Warum bleibt ein frisch konfiguriertes Router-Interface trotz korrekter IP-Adresse "down"?', options: ['Die Subnetzmaske ist falsch', 'Es fehlt "no shutdown"', 'Es fehlt ein Passwort', 'Router-Interfaces brauchen immer DHCP'], correct: 1, explanation: 'Router-Interfaces sind standardmäßig administrativ deaktiviert.' },
    { question: 'Welcher Grundsatz entscheidet zuerst, wenn mehrere Routen zu einem Ziel passen?', options: ['Die zuletzt konfigurierte Route gewinnt immer', 'Longest Prefix Match - die spezifischere Route gewinnt', 'Die Route mit der kleinsten IP-Adresse gewinnt', 'Es wird zufällig eine Route gewählt'], correct: 1, explanation: 'Die spezifischere (längere) Subnetzmaske hat immer Vorrang.' },
    { question: 'Eine Connected-Route und eine Static-Route führen zum selben Ziel mit derselben Präfixlänge. Welche wird verwendet?', options: ['Static, weil sie manuell konfiguriert wurde', 'Connected, weil sie die niedrigere Administrative Distance hat', 'Beide werden gleichzeitig verwendet', 'Es kommt auf die Metrik an'], correct: 1, explanation: 'Connected hat AD 0 und gewinnt gegenüber Static (AD 1).' },
    { question: 'Wann wird die Metrik zur Entscheidung herangezogen?', options: ['Immer, bei jeder Route', 'Nur wenn mehrere Wege derselben Routing-Quelle mit gleicher Administrative Distance existieren', 'Nur bei statischen Routen', 'Nie, die Metrik ist rein informativ'], correct: 1, explanation: 'Die Metrik entscheidet erst innerhalb derselben Quelle bei gleicher Administrative Distance.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Konfiguriere GigabitEthernet0/1 mit der IP-Adresse 192.168.10.1/24 und aktiviere sie."',
      expectedLines: ['interface g0/1', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown'],
      explanation: 'interface, ip address mit Maske, no shutdown - die drei Standardschritte jeder Router-Interface-Konfiguration.',
    },
    {
      prompt: 'Sam: "Zeig mir kurz, welche Interfaces up sind und welche IP-Adresse sie haben."',
      expectedLines: [['show ip interface brief', 'sh ip int br']],
      explanation: '"show ip interface brief" liefert Status und IP-Adresse aller Schnittstellen kompakt auf einen Blick.',
    },
  ];
}

export function buildCiscoRouterBasicsLesson() {
  return {
    title: 'Router-Grundlagen',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
