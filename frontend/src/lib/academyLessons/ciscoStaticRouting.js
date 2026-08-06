import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Statisches Routing" - fills the catalog's existing `cisco-packet-tracer/
// static-routing` slot. Builds directly on "Router-Grundlagen" (routing
// decision, AD, metric) - focuses on manually configuring and verifying
// static routes, with heavy CLI-input practice.
// =============================================================================

export const CISCO_STATIC_ROUTING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'static-routing');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Warum statische Routen?', 'classic', [
    { type: 'text', content: 'Ein Router kennt automatisch nur die Netze, die direkt an seinen eigenen Schnittstellen angeschlossen sind (Connected-Routen). Für alle anderen, entfernten Netze muss er entweder ein dynamisches Routing-Protokoll (z. B. OSPF, spätere Lektion) sprechen - oder du trägst den Weg manuell ein: eine statische Route.' },
    { type: 'list', title: 'Wann eignen sich statische Routen?', items: [
      'In kleinen, überschaubaren Netzen mit wenigen Routern - der Aufwand bleibt gering.',
      'Für eine einzelne, klar definierte Standardroute ins Internet (Default Route).',
      'Wenn volle Kontrolle über den Pfad gewünscht ist, ohne die Komplexität eines dynamischen Protokolls.',
    ] },
  ]));

  exps.push(explanation('begriffe-classic', 'Next Hop, Zielnetz und Subnetzmaske', 'classic', [
    { type: 'table', headers: ['Begriff', 'Bedeutung'], rows: [
      ['Zielnetz', 'Das entfernte Netzwerk, das über diese Route erreichbar werden soll, z. B. 192.168.30.0.'],
      ['Subnetzmaske', 'Legt fest, wie groß das Zielnetz ist, z. B. 255.255.255.0 für ein /24-Netz.'],
      ['Next Hop', 'Die IP-Adresse des nächsten Routers auf dem Weg zum Zielnetz - dorthin schickt dieser Router alle passenden Pakete weiter.'],
    ] },
    { type: 'text', content: 'Eine statische Route beantwortet also die Frage: "Um Netz X (mit Maske Y) zu erreichen, schicke die Pakete an den nächsten Router Z."' },
  ]));

  exps.push(explanation('cli-classic', 'Eine statische Route konfigurieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['ip route <Zielnetz> <Subnetzmaske> <Next-Hop>', 'Trägt eine statische Route in die Routing-Tabelle ein.'],
      ['ip route 0.0.0.0 0.0.0.0 <Next-Hop>', 'Spezialfall Default Route: gilt für JEDES Ziel, das keine spezifischere passende Route hat - typisch für den Weg ins Internet.'],
    ] },
    { type: 'list', title: 'Beispiel: Route zu 192.168.30.0/24 über den nächsten Router 10.0.0.2', items: [
      'Router(config)# ip route 192.168.30.0 255.255.255.0 10.0.0.2',
    ] },
    { type: 'list', title: 'Beispiel: Default Route ins Internet über 203.0.113.1', items: [
      'Router(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1',
    ] },
  ]));

  exps.push(explanation('fehlersuche-classic', 'Fehlersuche bei statischen Routen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wann verwenden'], rows: [
      ['show ip route', 'Zeigt die komplette Routing-Tabelle inklusive aller statischen (mit "S" markierten), connected (mit "C") und dynamischen Routen.'],
      ['show ip interface brief', 'Prüft, ob die Schnittstelle zum Next Hop überhaupt "up" ist - eine Route über eine down-Schnittstelle bleibt wirkungslos.'],
    ] },
    { type: 'list', title: 'Typische Fehler', items: [
      'Falsche Subnetzmaske eingetragen - die Route passt dann nicht auf die erwarteten Pakete.',
      'Der Next Hop ist selbst nicht erreichbar (z. B. weil das verbindende Interface "down" ist).',
      'Die Route fehlt auf dem Rückweg - ein Router am anderen Ende braucht ebenfalls eine (statische oder connected) Route zurück, sonst kommt keine Antwort an.',
    ] },
    { type: 'question', question: 'Ein Ping über eine neu eingetragene statische Route schlägt fehl, obwohl die Route in "show ip route" korrekt erscheint. Was prüfst du als Nächstes?', options: ['Ob die Route eine gerade IP-Adresse hat', 'Ob der Router am anderen Ende ebenfalls eine Route zurück zum Quellnetz hat', 'Ob das Kabel eine andere Farbe hat', 'Ob VLAN 1 gelöscht wurde'], correct: 1, explanation: 'Für eine erfolgreiche Antwort braucht auch der Router am anderen Ende einen Weg zurück zum Quellnetz.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Statische Route: "ip route <Zielnetz> <Subnetzmaske> <Next-Hop>".',
      'Default Route (für alles ohne spezifischere Route): "ip route 0.0.0.0 0.0.0.0 <Next-Hop>".',
      'Kontrolle: "show ip route" zeigt alle Routen, "show ip interface brief" prüft die Erreichbarkeit des Next Hop.',
      'Für erfolgreiche Kommunikation braucht meist auch der Router am anderen Ende eine Route zurück.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'static-routing-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff seiner Bedeutung zu.',
      pairs: [
        { left: 'Zielnetz', leftLabel: 'Zielnetz', right: 'Das entfernte Netzwerk, das erreichbar werden soll' },
        { left: 'Next Hop', leftLabel: 'Next Hop', right: 'Die IP-Adresse des nächsten Routers auf dem Weg' },
        { left: 'Default Route', leftLabel: 'Default Route', right: 'Gilt für jedes Ziel ohne spezifischere passende Route' },
      ],
      explanation: 'Das Zielnetz definiert das Ziel, der Next Hop den nächsten Schritt, die Default Route fängt alles andere ab.',
    },
    {
      id: 'static-route-select',
      type: 'select-best',
      question: 'Welcher Befehl trägt eine Route zu 172.16.5.0/24 über den nächsten Router 10.1.1.2 ein?',
      options: ['ip route 172.16.5.0 24 10.1.1.2', 'ip route 172.16.5.0 255.255.255.0 10.1.1.2', 'route static 172.16.5.0 10.1.1.2', 'ip address 172.16.5.0 255.255.255.0 10.1.1.2'],
      correct: 1,
      explanation: '"ip route" erwartet Zielnetz, Subnetzmaske (nicht Präfixlänge) und Next Hop.',
    },
    {
      id: 'static-route-cli',
      type: 'cli-input',
      question: 'Trage eine statische Route zu 192.168.40.0/24 über den nächsten Router 10.10.10.2 ein.',
      expectedLines: ['ip route 192.168.40.0 255.255.255.0 10.10.10.2'],
      explanation: 'Zielnetz, Subnetzmaske und Next Hop in genau dieser Reihenfolge.',
    },
    {
      id: 'default-route-cli',
      type: 'cli-input',
      question: 'Trage eine Default Route ins Internet über den nächsten Router 203.0.113.1 ein.',
      hint: 'Zielnetz und Maske sind bei der Default Route beide 0.0.0.0.',
      expectedLines: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1'],
      explanation: 'Die Default Route verwendet 0.0.0.0 0.0.0.0 als "passt auf alles"-Platzhalter für Zielnetz und Maske.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Welche Routen kennt ein Router automatisch, ohne jede Konfiguration?', options: ['Routen zu allen Netzen im Internet', 'Nur die direkt an seinen Schnittstellen angeschlossenen (Connected) Netze', 'Alle Routen aus OSPF', 'Keine, alles muss manuell eingetragen werden'], correct: 1, explanation: 'Automatisch bekannt sind nur die direkt angeschlossenen (Connected) Netze.' },
    { question: 'Welche Syntax hat der Befehl für eine statische Route?', options: ['ip route <Next-Hop> <Zielnetz> <Maske>', 'ip route <Zielnetz> <Maske> <Next-Hop>', 'route ip <Zielnetz> <Next-Hop>', 'ip static <Zielnetz> <Maske>'], correct: 1, explanation: 'Reihenfolge: Zielnetz, Subnetzmaske, dann Next Hop.' },
    { question: 'Wofür steht 0.0.0.0 0.0.0.0 in einer statischen Route?', options: ['Für ein ungültiges Netz', 'Für die Default Route, die auf jedes Ziel ohne spezifischere Route passt', 'Für das eigene Netz des Routers', 'Für eine deaktivierte Route'], correct: 1, explanation: 'Das ist die Default Route - der "Auffang"-Eintrag für alles andere.' },
    { question: 'Ein Ping funktioniert nicht, obwohl die Route korrekt in "show ip route" erscheint. Was ist eine typische Ursache?', options: ['Die Route ist zu neu', 'Der Router am anderen Ende hat keine Route zurück zum Quellnetz', 'Der Befehl "ip route" wurde großgeschrieben', 'Die Route wurde nicht mit Farbe markiert'], correct: 1, explanation: 'Ohne Rückweg kommt keine Antwort an, auch wenn der Hinweg funktioniert.' },
    { question: 'In "show ip route" markiert welcher Buchstabe eine statische Route?', options: ['C', 'O', 'S', 'D'], correct: 2, explanation: '"S" steht für Static, "C" für Connected, "O" für OSPF.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Trage eine Route zu 192.168.50.0/24 über den nächsten Router 10.0.0.2 ein."',
      expectedLines: ['ip route 192.168.50.0 255.255.255.0 10.0.0.2'],
      explanation: 'Zielnetz, Maske, Next Hop - in dieser Reihenfolge.',
    },
    {
      prompt: 'Sam: "Richte eine Default Route über den Internet-Router 198.51.100.1 ein."',
      expectedLines: ['ip route 0.0.0.0 0.0.0.0 198.51.100.1'],
      explanation: 'Default Route: Zielnetz und Maske sind beide 0.0.0.0.',
    },
    {
      prompt: 'Sam: "Zeig mir kurz die aktuelle Routing-Tabelle."',
      expectedLines: [['show ip route', 'sh ip route']],
      explanation: '"show ip route" zeigt alle bekannten Routen mit ihrer Quelle (C, S, O, ...).',
    },
  ];
}

export function buildCiscoStaticRoutingLesson() {
  return {
    title: 'Statisches Routing',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
