import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Routing" - fundamentals topic. Purely conceptual (device-agnostic): what
// routing is, why it's needed, the routing table, default gateway, static vs.
// dynamic routing. Deliberately does NOT include any vendor CLI commands -
// that hands-on part lives in the Cisco category so this lesson stays
// self-contained as general networking theory.
// =============================================================================

export const ROUTING_TOPIC_KEY = topicKey('fundamentals', 'routing');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Was ist Routing?
  // ---------------------------------------------------------------------
  exps.push(explanation('was-classic', 'Was ist Routing?', 'classic', [
    { type: 'text', content: 'Routing ist die Aufgabe, Datenpakete von einem Netzwerk in ein anderes weiterzuleiten. Innerhalb eines einzelnen Netzwerks reicht Switching (siehe die Switching-Lektion) - sobald aber Absender und Ziel in unterschiedlichen Netzwerken liegen, muss ein Router die Pakete über die Netzgrenze hinweg weiterleiten.' },
    { type: 'list', title: 'Wann wird geroutet?', items: [
      'Ein PC in Netz 192.168.10.0/24 will einen Server in 192.168.20.0/24 erreichen.',
      'Ein Heimnetz will das Internet erreichen (Router zum Provider).',
      'Zwei VLANs (siehe VLAN-Grundlagen) sollen miteinander kommunizieren - auch das ist Routing zwischen zwei logischen Netzen.',
    ] },
  ]));

  exps.push(explanation('was-intuitive', 'Was ist Routing?', 'intuitive', [
    { type: 'text', content: 'Ein Switch ist wie die Poststelle innerhalb eines einzelnen Bürogebäudes - er kennt jeden Mitarbeiter im Haus. Ein Router ist wie die Poststelle zwischen verschiedenen Gebäuden: Er kennt nicht jeden Mitarbeiter persönlich, weiß aber genau, an welches Gebäude ein Brief mit einer bestimmten Adresse weitergeleitet werden muss.' },
  ]));

  // ---------------------------------------------------------------------
  // 2. Die Routingtabelle
  // ---------------------------------------------------------------------
  exps.push(explanation('tabelle-classic', 'Die Routingtabelle', 'classic', [
    { type: 'text', content: 'Jeder Router (und auch jeder PC) führt eine Routingtabelle: eine Liste von Einträgen, die festlegen, über welchen Weg (Next Hop) ein bestimmtes Zielnetz erreichbar ist.' },
    { type: 'table', headers: ['Begriff', 'Bedeutung'], rows: [
      ['Zielnetz', 'Das Netzwerk (z. B. 192.168.20.0/24), für das der Eintrag gilt.'],
      ['Next Hop', 'Die IP-Adresse des nächsten Routers, an den das Paket weitergereicht wird.'],
      ['Ausgangsschnittstelle', 'Über welche eigene Schnittstelle das Paket das Gerät verlässt.'],
      ['Metrik', 'Ein Wert, der "Kosten" bzw. Bevorzugung eines Weges ausdrückt - je niedriger, desto bevorzugter.'],
    ] },
    { type: 'question', question: 'Was gibt der "Next Hop" in einem Routingeintrag an?', options: ['Die eigene IP-Adresse des Routers', 'Die IP-Adresse des nächsten Routers auf dem Weg zum Ziel', 'Die MAC-Adresse des Zielrechners', 'Die Subnetzmaske des eigenen Netzes'], correct: 1, explanation: 'Der Next Hop ist die Adresse des nächsten Routers, an den ein Paket auf dem Weg zu seinem Ziel weitergegeben wird.' },
  ]));

  // ---------------------------------------------------------------------
  // 3. Direkt verbundene Netze
  // ---------------------------------------------------------------------
  exps.push(explanation('direkt-classic', 'Direkt verbundene Netze', 'classic', [
    { type: 'text', content: 'Jeder Router trägt automatisch die Netze in seine Routingtabelle ein, die an seinen eigenen Schnittstellen direkt angeschlossen sind - dafür ist keine zusätzliche Konfiguration nötig.' },
    { type: 'text', content: 'Beispiel: Hat ein Router eine Schnittstelle mit der IP 192.168.10.1/24, weiß er automatisch, dass das gesamte Netz 192.168.10.0/24 über genau diese Schnittstelle erreichbar ist.' },
  ]));

  // ---------------------------------------------------------------------
  // 4. Das Standardgateway
  // ---------------------------------------------------------------------
  exps.push(explanation('gateway-classic', 'Das Standardgateway', 'classic', [
    { type: 'text', content: 'Ein PC führt nur eine sehr einfache Routingentscheidung: Liegt das Ziel im eigenen Netz, wird direkt zugestellt. Liegt es in einem anderen Netz, schickt der PC das Paket an sein Standardgateway - üblicherweise die IP-Adresse des Routers in seinem eigenen Netz.' },
    { type: 'list', title: 'Merke', items: [
      'Ohne (oder mit falschem) Standardgateway kann ein PC nur mit Geräten im eigenen Netz kommunizieren.',
      'Das Standardgateway ist selbst immer eine Adresse aus dem eigenen Subnetz des PCs.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 5. Statisches vs. dynamisches Routing
  // ---------------------------------------------------------------------
  exps.push(explanation('statisch-dynamisch-classic', 'Statisches vs. dynamisches Routing', 'classic', [
    { type: 'table', headers: ['', 'Statisches Routing', 'Dynamisches Routing'], rows: [
      ['Konfiguration', 'Von Hand durch den Administrator', 'Router tauschen Informationen automatisch per Routingprotokoll aus'],
      ['Aufwand bei Änderungen', 'Muss manuell angepasst werden', 'Passt sich automatisch an'],
      ['Typischer Einsatz', 'Kleine, stabile Netze mit wenigen Routen', 'Große oder sich häufig ändernde Netze'],
      ['Beispiele für Protokolle', '–', 'RIP, OSPF, EIGRP, BGP (Namen genügen an dieser Stelle - Details folgen in vertiefenden Themen)'],
    ] },
    { type: 'text', content: 'Beide Varianten schreiben letztlich Einträge in dieselbe Routingtabelle - der Unterschied liegt nur darin, wie diese Einträge zustande kommen.' },
  ]));

  // ---------------------------------------------------------------------
  // 6. Wie eine Weiterleitungsentscheidung getroffen wird
  // ---------------------------------------------------------------------
  exps.push(explanation('entscheidung-classic', 'Wie ein Router entscheidet, wohin ein Paket geht', 'classic', [
    { type: 'list', title: 'Ablauf einer Weiterleitung', items: [
      '1. Der Router betrachtet die Ziel-IP-Adresse des eingehenden Pakets.',
      '2. Er sucht in seiner Routingtabelle nach dem am besten passenden Eintrag für dieses Ziel (je genauer/spezifischer das Zielnetz passt, desto bevorzugter).',
      '3. Passt kein Eintrag, wird eine ggf. konfigurierte Standardroute (Default Route, "0.0.0.0/0") verwendet - oder das Paket wird verworfen.',
      '4. Das Paket wird an den passenden Next Hop bzw. über die passende Ausgangsschnittstelle weitergeleitet.',
    ] },
    { type: 'text', content: 'Eine Standardroute funktioniert für einen Router ähnlich wie ein Standardgateway für einen PC: "Wenn ich kein spezifisches Ziel finde, schicke ich es dorthin."' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Routing leitet Pakete zwischen unterschiedlichen Netzwerken weiter - Switching reicht nur innerhalb eines Netzes.',
      'Die Routingtabelle enthält Zielnetz, Next Hop, Ausgangsschnittstelle und Metrik.',
      'Direkt angeschlossene Netze werden automatisch eingetragen.',
      'Ein PC schickt alles außerhalb seines eigenen Netzes an sein Standardgateway.',
      'Statisches Routing wird manuell gepflegt, dynamisches Routing tauscht Informationen automatisch über Routingprotokolle aus.',
      'Ohne passenden Eintrag greift eine Standardroute (0.0.0.0/0) - oder das Paket wird verworfen.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'routing-decision-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte einer Router-Weiterleitungsentscheidung in die richtige Reihenfolge.',
      items: [
        { id: 'ziel', label: 'Ziel-IP-Adresse des Pakets betrachten' },
        { id: 'suche', label: 'Passenden Eintrag in der Routingtabelle suchen' },
        { id: 'default', label: 'Falls kein Eintrag passt: Standardroute verwenden (oder verwerfen)' },
        { id: 'senden', label: 'Paket an Next Hop / Ausgangsschnittstelle weiterleiten' },
      ],
      correctOrder: ['ziel', 'suche', 'default', 'senden'],
      explanation: 'Erst die Ziel-IP betrachten, dann die Routingtabelle durchsuchen, bei Bedarf die Standardroute nutzen, zuletzt weiterleiten.',
    },
    {
      id: 'routing-terms-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff seiner Bedeutung zu.',
      pairs: [
        { left: 'Next Hop', leftLabel: 'Next Hop', right: 'IP-Adresse des nächsten Routers auf dem Weg zum Ziel' },
        { left: 'Standardgateway', leftLabel: 'Standardgateway', right: 'Adresse, an die ein PC alles außerhalb seines Netzes schickt' },
        { left: 'Metrik', leftLabel: 'Metrik', right: 'Wert, der einen Weg mehr oder weniger bevorzugt' },
        { left: 'Standardroute', leftLabel: 'Standardroute', right: 'Eintrag für "alles, was sonst nicht passt" (0.0.0.0/0)' },
      ],
      explanation: 'Next Hop = nächster Router, Standardgateway = Ausweg des PCs, Metrik = Bevorzugung eines Weges, Standardroute = Auffangregel.',
    },
    {
      id: 'routing-static-dynamic-select',
      type: 'select-best',
      question: 'In welcher Situation ist statisches Routing typischerweise die passendere Wahl?',
      options: ['In einem sehr großen, sich ständig ändernden Netz', 'In einem kleinen, stabilen Netz mit wenigen Routen', 'Wenn Router automatisch Informationen austauschen sollen', 'Wenn täglich neue Subnetze hinzukommen'],
      correct: 1,
      explanation: 'Statisches Routing eignet sich gut für kleine, stabile Netze - bei häufigen Änderungen ist dynamisches Routing praktischer.',
    },
    {
      id: 'routing-gateway-select',
      type: 'select-best',
      question: 'Ein PC in 192.168.10.0/24 will einen Server in 192.168.50.0/24 erreichen. An wen schickt der PC das Paket zuerst?',
      options: ['Direkt an die IP des Servers', 'An sein Standardgateway', 'An einen beliebigen DNS-Server', 'An einen DHCP-Server'],
      correct: 1,
      explanation: 'Da das Ziel in einem anderen Netz liegt, schickt der PC das Paket an sein Standardgateway, das die Weiterleitung übernimmt.',
    },
    {
      id: 'routing-directly-connected-input',
      type: 'input',
      question: 'Wie werden Netze genannt, die automatisch (ohne zusätzliche Konfiguration) in die Routingtabelle eines Routers eingetragen werden, weil sie an einer seiner Schnittstellen hängen?',
      answers: ['direkt verbundene netze', 'direkt angeschlossene netze', 'direkt verbunden', 'directly connected'],
      explanation: 'Direkt verbundene (direkt angeschlossene) Netze werden automatisch eingetragen, sobald eine Schnittstelle eine passende IP-Adresse trägt.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist die Hauptaufgabe von Routing?', options: ['Datenverkehr innerhalb eines Netzes anhand von MAC-Adressen vermitteln', 'Datenpakete zwischen unterschiedlichen Netzwerken weiterleiten', 'IP-Adressen automatisch vergeben', 'Namen in IP-Adressen übersetzen'], correct: 1, explanation: 'Routing leitet Pakete über Netzgrenzen hinweg weiter, im Gegensatz zum Switching innerhalb eines Netzes.' },
    { question: 'Was enthält ein Eintrag in der Routingtabelle typischerweise NICHT?', options: ['Zielnetz', 'Next Hop', 'Ausgangsschnittstelle', 'Das Passwort des Routers'], correct: 3, explanation: 'Passwörter haben in der Routingtabelle nichts zu suchen - sie enthält Zielnetz, Next Hop, Schnittstelle und Metrik.' },
    { question: 'Wie gelangen direkt angeschlossene Netze in die Routingtabelle?', options: ['Nur durch manuelle Konfiguration', 'Automatisch, sobald eine Schnittstelle eine passende IP-Adresse trägt', 'Nur über ein Routingprotokoll', 'Gar nicht, sie werden ignoriert'], correct: 1, explanation: 'Direkt verbundene Netze werden automatisch eingetragen, ohne dass der Administrator etwas konfigurieren muss.' },
    { question: 'Wohin schickt ein PC ein Paket, dessen Ziel außerhalb seines eigenen Netzes liegt?', options: ['An einen zufälligen Router', 'An sein Standardgateway', 'An den DNS-Server', 'Direkt an die Ziel-IP ohne Umweg'], correct: 1, explanation: 'Liegt das Ziel in einem anderen Netz, schickt der PC das Paket an sein konfiguriertes Standardgateway.' },
    { question: 'Welche Aussage zum Standardgateway ist korrekt?', options: ['Es liegt immer außerhalb des eigenen Subnetzes', 'Es ist selbst eine Adresse aus dem eigenen Subnetz des PCs', 'Es wird nur für DNS-Anfragen benötigt', 'Es ersetzt die Subnetzmaske'], correct: 1, explanation: 'Das Standardgateway muss im selben Subnetz liegen wie der PC, damit es direkt erreichbar ist.' },
    { question: 'Was unterscheidet dynamisches von statischem Routing?', options: ['Dynamisches Routing wird nie verwendet', 'Bei dynamischem Routing tauschen Router Informationen automatisch über Routingprotokolle aus', 'Statisches Routing passt sich automatisch an Änderungen an', 'Es gibt keinen Unterschied'], correct: 1, explanation: 'Dynamisches Routing nutzt Routingprotokolle, damit sich Router automatisch über verfügbare Wege informieren.' },
    { question: 'Wofür wird eine Standardroute (0.0.0.0/0) verwendet?', options: ['Für das am meisten genutzte Zielnetz', 'Als Auffangregel, wenn kein spezifischerer Eintrag passt', 'Nur für direkt verbundene Netze', 'Um DHCP-Anfragen zu blockieren'], correct: 1, explanation: 'Die Standardroute greift, wenn kein anderer Eintrag der Routingtabelle zum Ziel passt.' },
    { question: 'Welches Beispiel ist ein Routingprotokoll für dynamisches Routing?', options: ['DHCP', 'OSPF', 'DNS', 'HTTP'], correct: 1, explanation: 'OSPF ist ein klassisches dynamisches Routingprotokoll (neben z. B. RIP, EIGRP, BGP).' },
    { question: 'Zwei VLANs sollen miteinander kommunizieren können. Was ist dafür grundsätzlich notwendig?', options: ['Ein zusätzlicher DHCP-Server', 'Routing zwischen den beiden logischen Netzen', 'Ein zweiter DNS-Server', 'Ein längeres Netzwerkkabel'], correct: 1, explanation: 'Auch zwischen VLANs (verschiedenen logischen Netzen) muss geroutet werden, damit sie sich erreichen können.' },
    { question: 'Was passiert, wenn ein Router für ein Ziel weder einen passenden Eintrag noch eine Standardroute hat?', options: ['Das Paket wird trotzdem zufällig weitergeleitet', 'Das Paket wird verworfen', 'Das Paket wird automatisch an DNS gesendet', 'Der Router erstellt selbstständig eine neue Route'], correct: 1, explanation: 'Ohne passenden Eintrag und ohne Standardroute kann der Router das Paket nicht zustellen und verwirft es.' },
    { question: 'Was beschreibt die Metrik eines Routingeintrags?', options: ['Die physische Kabellänge', 'Wie stark ein Weg gegenüber Alternativen bevorzugt wird', 'Die Anzahl der Benutzer im Netz', 'Die IP-Adresse des Ziels'], correct: 1, explanation: 'Die Metrik drückt die "Kosten" eines Weges aus - je niedriger, desto bevorzugter wird er gewählt.' },
  ];
}

export function buildRoutingLesson() {
  return {
    title: 'Routing',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'Routing leitet Pakete zwischen unterschiedlichen Netzwerken weiter, Switching reicht nur innerhalb eines Netzes.',
      'Die Routingtabelle enthält Zielnetz, Next Hop, Ausgangsschnittstelle und Metrik.',
      'Direkt verbundene Netze werden automatisch eingetragen.',
      'Ein PC schickt alles außerhalb seines eigenen Netzes an sein Standardgateway.',
      'Statisches Routing wird manuell gepflegt, dynamisches Routing (z. B. RIP, OSPF, EIGRP, BGP) automatisch.',
      'Ohne passenden Eintrag greift die Standardroute (0.0.0.0/0) - sonst wird das Paket verworfen.',
    ],
  };
}
