import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Multilayer Switch (MLS)" - fills the newly added `cisco-packet-tracer/
// multilayer-switching` catalog slot (Milestone C6). The second way to solve
// inter-VLAN routing, as an alternative to "Router on a Stick": a Layer-3
// switch routes directly between VLANs via SVIs (Switched Virtual
// Interfaces), without needing a separate router at all.
// =============================================================================

export const CISCO_MULTILAYER_SWITCHING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'multilayer-switching');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Die zweite Lösung für Inter-VLAN-Routing', 'classic', [
    { type: 'text', content: 'Router on a Stick löst Inter-VLAN-Routing mit einem separaten Router. Ein Multilayer-Switch (MLS, auch Layer-3-Switch genannt) geht einen anderen Weg: Er kann VLANs selbst routen, ohne dass überhaupt ein Router im Spiel ist.' },
  ]));

  exps.push(explanation('l2-l3-classic', 'Layer-2-Switch vs. Multilayer-Switch', 'classic', [
    { type: 'table', headers: ['Gerät', 'Fähigkeit'], rows: [
      ['L2-Switch', 'Vermittelt nur innerhalb eines VLANs anhand von MAC-Adressen (Layer 2). Für Inter-VLAN-Routing wird immer ein zusätzliches Layer-3-Gerät benötigt.'],
      ['Multilayer-Switch (L3-Switch)', 'Kann zusätzlich zur normalen Switch-Funktion selbst routen (Layer 3) - er übernimmt die Rolle des Routers gleich mit.'],
    ] },
    { type: 'list', title: 'Wann lohnt sich ein MLS statt Router on a Stick?', items: [
      'Wenn ohnehin schon ein Multilayer-Switch im Netz vorhanden ist (typisch im Distribution-/Core-Layer) - kein zusätzliches Gerät nötig.',
      'Bei höherem Datenverkehrsaufkommen zwischen VLANs: MLS-Routing erfolgt in Hardware (ASICs) und ist meist deutlich schneller als das Routing über eine einzelne Router-Verbindung.',
      'Router on a Stick bleibt sinnvoll, wenn ohnehin schon ein Router vorhanden ist oder kein Layer-3-Switch verfügbar ist.',
    ] },
  ]));

  exps.push(explanation('svi-classic', 'SVI - Switched Virtual Interface', 'classic', [
    { type: 'text', content: 'Statt physischer Subinterfaces (wie bei Router on a Stick) verwendet ein Multilayer-Switch für jedes VLAN eine virtuelle Schnittstelle direkt auf dem Switch selbst: die SVI ("interface vlan <ID>"). Sie ist das Gateway für genau dieses VLAN.' },
    { type: 'list', title: 'Voraussetzung: ip routing', items: [
      'Ein Switch routet standardmäßig NICHT zwischen VLANs, auch wenn er technisch ein Multilayer-Switch ist - das globale Routing muss erst mit "ip routing" aktiviert werden.',
      'Ohne "ip routing" bleiben die SVIs zwar erreichbar, aber es findet keine Weiterleitung zwischen unterschiedlichen VLANs statt.',
    ] },
    { type: 'question', question: 'Was ist eine SVI?', options: ['Ein physisches Kabel zwischen zwei Switches', 'Eine virtuelle, VLAN-gebundene Schnittstelle direkt auf dem Multilayer-Switch', 'Ein Sicherheitsprotokoll für Trunks', 'Ein Synonym für Access-Port'], correct: 1, explanation: 'Die SVI ("interface vlan <ID>") ist das Gateway für ein VLAN, direkt auf dem Layer-3-Switch.' },
  ]));

  exps.push(explanation('cli-classic', 'Multilayer-Switching konfigurieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['ip routing', 'Aktiviert globales Routing auf dem Switch - ohne diesen Befehl routet der Switch nicht zwischen VLANs.'],
      ['interface vlan <VLAN-ID>', 'Legt die SVI für ein VLAN an bzw. wechselt in deren Konfiguration, z. B. "interface vlan 10".'],
      ['ip address <IP-Adresse> <Subnetzmaske>', 'Vergibt der SVI die Gateway-IP-Adresse für dieses VLAN.'],
      ['no shutdown', 'Aktiviert die SVI - wie bei jeder anderen Schnittstelle.'],
    ] },
    { type: 'list', title: 'Beispiel: SVIs für VLAN 10 und VLAN 20 auf einem Multilayer-Switch', items: [
      'Switch(config)# ip routing',
      'Switch(config)# interface vlan 10',
      'Switch(config-if)# ip address 192.168.10.1 255.255.255.0',
      'Switch(config-if)# no shutdown',
      'Switch(config-if)# exit',
      'Switch(config)# interface vlan 20',
      'Switch(config-if)# ip address 192.168.20.1 255.255.255.0',
      'Switch(config-if)# no shutdown',
    ] },
    { type: 'text', content: 'Die VLANs selbst (vlan 10 / vlan 20) müssen wie gewohnt vorher angelegt worden sein - eine SVI ersetzt nicht das Anlegen des VLANs, sondern ergänzt es um ein Layer-3-Gateway.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Ein Multilayer-Switch routet selbst zwischen VLANs - ohne separaten Router.',
      'Voraussetzung: globales Routing mit "ip routing" aktivieren.',
      'Pro VLAN eine SVI: "interface vlan <ID>" → "ip address <IP> <Maske>" → "no shutdown".',
      'MLS lohnt sich besonders bei hohem Inter-VLAN-Verkehr und wenn ohnehin ein Layer-3-Switch vorhanden ist.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'mls-l2-l3-matching',
      type: 'matching',
      question: 'Ordne jedem Gerätetyp seine Fähigkeit zu.',
      pairs: [
        { left: 'L2-Switch', leftLabel: 'L2-Switch', right: 'Vermittelt nur innerhalb eines VLANs' },
        { left: 'Multilayer-Switch', leftLabel: 'Multilayer-Switch', right: 'Kann selbst zwischen VLANs routen' },
        { left: 'SVI', leftLabel: 'SVI', right: 'Virtuelles Gateway für ein einzelnes VLAN' },
      ],
      explanation: 'L2-Switches bleiben in einem VLAN, Multilayer-Switches routen selbst, SVIs sind deren Gateway pro VLAN.',
    },
    {
      id: 'mls-ip-routing-select',
      type: 'select-best',
      question: 'Ein Multilayer-Switch hat korrekt konfigurierte SVIs für VLAN 10 und 20, aber es findet trotzdem kein Routing zwischen ihnen statt. Was fehlt vermutlich?',
      options: ['Die VLANs müssen umbenannt werden', 'Der Befehl "ip routing" wurde nicht ausgeführt', 'SVIs unterstützen kein Routing', 'Es muss zusätzlich ein Router angeschlossen werden'],
      correct: 1,
      explanation: 'Ohne globales "ip routing" bleibt der Switch beim reinen Layer-2-Verhalten, egal wie viele SVIs konfiguriert sind.',
    },
    {
      id: 'mls-cli-svi',
      type: 'cli-input',
      question: 'Aktiviere Routing und lege eine SVI für VLAN 30 mit der IP-Adresse 192.168.30.1/24 an.',
      expectedLines: ['ip routing', 'interface vlan 30', 'ip address 192.168.30.1 255.255.255.0', 'no shutdown'],
      explanation: 'ip routing aktiviert das globale Routing, danach folgt die SVI-Konfiguration wie bei jeder anderen Schnittstelle.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was kann ein Multilayer-Switch zusätzlich zu einem normalen L2-Switch?', options: ['Er kann mehr Kabel gleichzeitig anschließen', 'Er kann selbst zwischen VLANs routen (Layer 3)', 'Er benötigt kein Betriebssystem', 'Er kann keine VLANs anlegen'], correct: 1, explanation: 'Der zentrale Unterschied ist die Fähigkeit zum Layer-3-Routing.' },
    { question: 'Wie wird die Gateway-Schnittstelle für ein VLAN auf einem Multilayer-Switch genannt?', options: ['Subinterface', 'Trunk', 'SVI (Switched Virtual Interface)', 'Access-Port'], correct: 2, explanation: 'Die SVI ("interface vlan <ID>") ist das VLAN-Gateway direkt auf dem Switch.' },
    { question: 'Welcher Befehl aktiviert das globale Routing auf einem Multilayer-Switch?', options: ['ip route', 'ip routing', 'router ospf', 'switchport mode routed'], correct: 1, explanation: '"ip routing" schaltet die Layer-3-Funktion des Switches grundsätzlich ein.' },
    { question: 'Wann ist ein MLS gegenüber Router on a Stick oft im Vorteil?', options: ['Wenn nur ein einziges VLAN existiert', 'Bei hohem Datenverkehr zwischen VLANs, da das Routing in Hardware erfolgt', 'Wenn kein VLAN benötigt wird', 'MLS ist nie im Vorteil'], correct: 1, explanation: 'Hardware-basiertes Routing auf einem MLS ist bei viel Inter-VLAN-Verkehr meist performanter.' },
    { question: 'Ersetzt eine SVI das Anlegen eines VLANs mit "vlan <ID>"?', options: ['Ja, die SVI erstellt das VLAN automatisch', 'Nein, das VLAN muss weiterhin separat angelegt werden', 'Nur bei VLAN 1', 'Nur wenn "ip routing" aktiv ist'], correct: 1, explanation: 'Die SVI ergänzt ein bereits angelegtes VLAN um ein Layer-3-Gateway, ersetzt aber nicht das Anlegen des VLANs selbst.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Aktiviere auf dem Multilayer-Switch das Routing und richte die SVI für VLAN 10 mit Gateway 192.168.10.1/24 ein."',
      expectedLines: ['ip routing', 'interface vlan 10', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown'],
      explanation: 'ip routing zuerst, dann SVI anlegen, IP vergeben, aktivieren.',
    },
    {
      prompt: 'Sam: "Jetzt noch die SVI für VLAN 20, Gateway 192.168.20.1/24 - "ip routing" ist schon aktiv."',
      expectedLines: ['interface vlan 20', 'ip address 192.168.20.1 255.255.255.0', 'no shutdown'],
      explanation: '"ip routing" muss nur einmal global aktiviert werden, danach reicht pro VLAN die SVI-Konfiguration.',
    },
  ];
}

export function buildCiscoMultilayerSwitchingLesson() {
  return {
    title: 'Multilayer Switch (MLS)',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
