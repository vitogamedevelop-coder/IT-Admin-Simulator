import { topicKey } from '../academyTopics.js';

// =============================================================================
// "DHCP Relay" - new catalog slot `cisco-packet-tracer/dhcp` (see
// academyTopics.js). Builds on "Router-Grundlagen"/"Statisches Routing"
// (physisches L3-Interface), "Router on a Stick" (Subinterfaces) and
// "Multilayer Switch" (SVI) - the three scenarios in which a learner must
// decide WHERE to place "ip helper-address" - plus the conceptual
// "fundamentals/dhcp" topic (DORA process, why DHCP exists at all).
//
// Core competency this lesson trains: given a topology with a client
// network and a DHCP server elsewhere, determine the correct Layer-3
// interface for the relay - NOT just memorizing the command syntax. Equally
// important: never confuse the DHCP-server IP (behind "ip helper-address")
// with the client network's gateway IP (the "default-router" inside the
// DHCP pool) - a dedicated comprehension question targets exactly this.
// =============================================================================

export const CISCO_DHCP_TOPIC_KEY = topicKey('cisco-packet-tracer', 'dhcp');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('problem-classic', 'Warum braucht DHCP über Netzgrenzen einen Helfer?', 'classic', [
    { type: 'text', content: 'Ein DHCP-Client kennt zu Beginn noch keine IP-Adresse und sendet seine erste Anfrage (Discover) deshalb als Broadcast. Router leiten Broadcasts aber grundsätzlich NICHT in andere Netze/VLANs weiter - das ist gewollt, sonst würden Broadcasts das gesamte Netzwerk überfluten.' },
    { type: 'text', content: 'Steht der DHCP-Server im selben Netz wie der Client, ist das kein Problem. Steht er - wie in der Praxis meist - in einem anderen Netz oder VLAN (z. B. zentral im Serverraum), kommt die Broadcast-Anfrage des Clients dort nie an.' },
    { type: 'text', content: 'Die Lösung: ein DHCP Relay Agent. Auf Cisco-Geräten aktivierst du das mit einem einzigen Befehl auf dem passenden Layer-3-Interface:' },
    { type: 'list', title: 'Der Relay-Befehl', items: [
      'ip helper-address <IP-DHCP-Server>',
    ] },
    { type: 'text', content: 'Der Relay Agent wandelt die Broadcast-Anfrage in ein gezieltes Unicast-Paket an den DHCP-Server um und leitet die Antwort ebenso gezielt zurück an den Client - der Client merkt davon nichts.' },
  ]));

  exps.push(explanation('wo-vs-welche-ip-classic', 'Die wichtigste Unterscheidung: WO vs. WELCHE IP', 'classic', [
    { type: 'text', content: 'Bei "ip helper-address" werden in der Praxis am häufigsten zwei Dinge verwechselt - diese Unterscheidung ist der Kern dieser Lektion:' },
    { type: 'table', headers: ['Frage', 'Antwort'], rows: [
      ['A) WO wird der Befehl konfiguriert?', 'Auf dem Layer-3-Interface, das die DHCP-Broadcasts des Client-Netzes empfängt - also dem Gateway-Interface dieses Client-Netzes (physisches Interface, Subinterface oder SVI).'],
      ['B) WELCHE IP steht hinter dem Befehl?', 'Die IP-Adresse des DHCP-SERVERS - NICHT die eigene Gateway-IP des Interfaces, auf dem der Befehl steht.'],
    ] },
    { type: 'text', content: 'Beispiel: Clientnetz 192.168.100.0/24, Gateway 192.168.100.254, DHCP-Server 10.10.10.10.' },
    { type: 'list', title: 'Richtig vs. falsch', items: [
      'Richtig, auf dem Gateway-Interface des Clientnetzes: "ip helper-address 10.10.10.10"',
      'Falsch: "ip helper-address 192.168.100.254" - das wäre die eigene Gateway-IP, nicht die IP des DHCP-Servers.',
    ] },
    { type: 'question', question: 'Clientnetz 192.168.100.0/24 mit Gateway 192.168.100.254, DHCP-Server unter 10.10.10.10. Welcher Befehl ist auf dem Gateway-Interface des Clientnetzes korrekt?', options: ['ip helper-address 192.168.100.254', 'ip helper-address 10.10.10.10', 'ip helper-address 192.168.100.0', 'ip address helper 10.10.10.10'], correct: 1, explanation: 'Hinter "ip helper-address" steht immer die IP-Adresse des DHCP-SERVERS (10.10.10.10) - nicht die eigene Gateway-IP des Interfaces (192.168.100.254).' },
  ]));

  exps.push(explanation('szenario-a-classic', 'Szenario A: physisches Router-/L3-Interface', 'classic', [
    { type: 'text', content: 'Der einfachste Fall: Ein Clientnetz hängt direkt an einem gerouteten physischen Interface. Das Gateway-Interface dieses Netzes ist genau die richtige Stelle für den Helper.' },
    { type: 'list', title: 'Beispiel', items: [
      'Router(config)# interface fa0/0',
      'Router(config-if)# ip address 192.168.10.1 255.255.255.0',
      'Router(config-if)# ip helper-address 172.16.0.10',
      'Router(config-if)# no shutdown',
    ] },
    { type: 'text', content: 'Warum genau hier? "fa0/0" IST das Gateway für 192.168.10.0/24 - jede DHCP-Broadcast-Anfrage aus diesem Netz kommt zwangsläufig auf diesem Interface an. Nur hier kann der Router sie in Unicast an den Server umwandeln.' },
  ]));

  exps.push(explanation('szenario-b-classic', 'Szenario B: Router on a Stick (Subinterfaces)', 'classic', [
    { type: 'text', content: 'Bei Router on a Stick routet ein Router mehrere VLANs über Subinterfaces. Jedes Subinterface ist das Gateway für genau ein VLAN - der Helper gehört deshalb auf das Subinterface DES VLANs, in dem die DHCP-Clients stehen.' },
    { type: 'list', title: 'Beispiel: VLAN 100 (Clients) benötigt DHCP, VLAN 200 (Server) nicht', items: [
      'Router(config)# interface fa0/0.100',
      'Router(config-subif)# encapsulation dot1Q 100',
      'Router(config-subif)# ip address 192.168.100.1 255.255.255.0',
      'Router(config-subif)# ip helper-address 172.16.0.10',
      'Router(config)# interface fa0/0.200',
      'Router(config-subif)# encapsulation dot1Q 200',
      'Router(config-subif)# ip address 192.168.200.1 255.255.255.0',
    ] },
    { type: 'text', content: 'Wichtig: Existieren mehrere Subinterfaces, gehört der Helper NUR auf das Subinterface des Client-VLANs (hier 100) - nicht auf jedes Subinterface pauschal, und nicht auf das physische Hauptinterface (das bei Router on a Stick selbst keine IP-Adresse trägt).' },
    { type: 'question', question: 'Ein Router hat drei Subinterfaces: fa0/0.10 (VLAN 10, Clients, Gateway 192.168.10.1), fa0/0.20 (VLAN 20, Server, Gateway 192.168.20.1) und fa0/0.30 (VLAN 30, Voice-Clients, Gateway 192.168.30.1). Der DHCP-Server 172.16.0.10 soll sowohl VLAN 10 als auch VLAN 30 versorgen. Auf welchen Subinterfaces muss "ip helper-address 172.16.0.10" konfiguriert werden?', options: ['Nur auf fa0/0.10', 'Auf fa0/0.10 UND fa0/0.30 - jeweils dort, wo tatsächlich DHCP-Clients stehen', 'Auf allen drei Subinterfaces inklusive fa0/0.20', 'Auf dem physischen Hauptinterface fa0/0'], correct: 1, explanation: 'Der Helper gehört auf jedes Gateway-Interface, dessen Netz tatsächlich DHCP-Clients enthält - hier VLAN 10 und VLAN 30. VLAN 20 (Server, keine DHCP-Clients) braucht ihn nicht, und das physische Hauptinterface hat bei Router on a Stick ohnehin keine eigene IP.' },
  ]));

  exps.push(explanation('szenario-c-classic', 'Szenario C: Multilayer-Switch / SVI', 'classic', [
    { type: 'text', content: 'Erfolgt Inter-VLAN-Routing über einen Multilayer-Switch, ist die SVI ("interface vlan <ID>") das Gateway des jeweiligen VLANs - der Helper gehört auf die SVI des Client-VLANs, genau wie beim physischen Interface oder Subinterface.' },
    { type: 'list', title: 'Beispiel', items: [
      'Switch(config)# interface vlan 100',
      'Switch(config-if)# ip address 192.168.100.1 255.255.255.0',
      'Switch(config-if)# ip helper-address 172.16.0.10',
      'Switch(config-if)# no shutdown',
    ] },
    { type: 'text', content: 'Das Prinzip ist in allen drei Szenarien identisch: Der Helper steht IMMER auf dem Layer-3-Interface, das für das Client-Netz das Gateway ist - egal ob physisches Interface, Subinterface oder SVI.' },
  ]));

  exps.push(explanation('packet-tracer-server-classic', 'Der simulierte DHCP-Server in Packet Tracer', 'classic', [
    { type: 'text', content: 'Der DHCP-Server in Packet Tracer braucht selbst eine erreichbare IP-Konfiguration. Für jedes Clientnetz legst du dort einen eigenen DHCP-Pool an.' },
    { type: 'table', headers: ['Pool-Parameter', 'Bedeutung'], rows: [
      ['Netzwerk/Adressbereich', 'Das Clientnetz, für das dieser Pool IP-Adressen vergibt, z. B. 192.168.100.0.'],
      ['Subnetzmaske', 'Die passende Maske des Clientnetzes, z. B. 255.255.255.0.'],
      ['Default Gateway', 'Das Gateway DES CLIENTNETZES (z. B. 192.168.100.254 oder 192.168.100.1) - das, was die Clients später als ihren Router eintragen.'],
      ['DNS-Server (optional)', 'Nur einzutragen, wenn das Szenario einen DNS-Server vorsieht.'],
    ] },
    { type: 'text', content: 'Didaktisch entscheidend: Das "Default Gateway" im DHCP-Pool ist das Gateway DES CLIENTNETZES - eine völlig andere Adresse als die IP-Adresse hinter "ip helper-address" (das ist die Adresse DES DHCP-SERVERS selbst). Beide Adressen liegen meist in unterschiedlichen Netzen und dürfen nicht verwechselt werden.' },
    { type: 'question', question: 'Im DHCP-Pool für das Clientnetz 192.168.100.0/24 trägst du unter "Default Gateway" welche Adresse ein?', options: ['Die IP-Adresse des DHCP-Servers', 'Das Gateway des Clientnetzes (z. B. 192.168.100.254), also dieselbe Adresse, die auch am Interface mit "ip helper-address" konfiguriert ist', 'Eine beliebige freie Adresse im DHCP-Server-Netz', 'Die IP-Adresse des Relay-Routers im DHCP-Server-Netz'], correct: 1, explanation: 'Das Default Gateway im Pool ist das Gateway des Clientnetzes - dieselbe IP, die am Gateway-Interface konfiguriert ist. Die DHCP-Server-IP hat damit nichts zu tun.' },
  ]));

  exps.push(explanation('troubleshooting-classic', 'DHCP-Relay-Fehler diagnostizieren', 'classic', [
    { type: 'table', headers: ['Symptom', 'Mögliche Ursache'], rows: [
      ['Client bekommt gar keine IP-Adresse per DHCP', '"ip helper-address" fehlt komplett auf dem Gateway-Interface des Clientnetzes.'],
      ['Client bekommt weiterhin keine IP, obwohl irgendwo ein Helper konfiguriert ist', 'Der Helper wurde auf dem FALSCHEN Interface konfiguriert (z. B. auf einem anderen VLAN/Subinterface als dem des Clients).'],
      ['Client bekommt eine Fehlermeldung / keine Antwort vom Server', 'Hinter "ip helper-address" steht versehentlich die eigene Gateway-IP statt der DHCP-Server-IP.'],
      ['Bei Router on a Stick: nur ein VLAN funktioniert, ein anderes nicht', 'Der Helper wurde nur auf einem Subinterface gesetzt, fehlt aber auf dem Subinterface des zweiten Client-VLANs.'],
      ['Bei einem Multilayer-Switch: Clients im VLAN bekommen keine IP', 'Der Helper fehlt auf der SVI des Client-VLANs (evtl. wurde er versehentlich auf einer anderen SVI konfiguriert).'],
      ['Client bekommt eine IP, aber falsches Gateway/Subnetz', 'Der DHCP-Pool verwendet ein falsches Default Gateway oder eine falsche Netz-/Maskenkonfiguration.'],
    ] },
    { type: 'question', question: 'Ein Multilayer-Switch routet VLAN 10 (Clients) und VLAN 20 (Server) über SVIs. Clients in VLAN 10 bekommen keine IP-Adresse. Der Helper "ip helper-address 172.16.0.10" ist auf "interface vlan 20" konfiguriert. Was ist das Problem und wie behebst du es?', options: ['Der DHCP-Server ist ausgefallen - Server neu starten', 'Der Helper steht auf der falschen SVI - er muss auf "interface vlan 10" (dem Gateway des Client-VLANs) konfiguriert werden, nicht auf VLAN 20', 'VLAN 10 muss gelöscht und neu angelegt werden', 'Die Subnetzmaske des DHCP-Servers ist falsch'], correct: 1, explanation: 'Der Helper muss auf dem Gateway-Interface DES CLIENT-NETZES stehen - hier die SVI von VLAN 10, nicht von VLAN 20.' },
  ]));

  exps.push(explanation('optional-classic', 'Optional: Cisco-Gerät als DHCP-Server/Client', 'classic', [
    { type: 'text', content: 'Ergänzend zum Relay-Schwerpunkt dieser Lektion kann ein Cisco-Router auch selbst als DHCP-Server oder DHCP-Client arbeiten - für den Unterricht reicht ein kurzer Überblick.' },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['ip dhcp pool <Name>', 'Legt auf dem Router selbst einen DHCP-Pool an (Router als eigener DHCP-Server statt Relay zu einem externen Server).'],
      ['network <Netz> <Maske>', 'Definiert innerhalb des Pools das zu vergebende Adressnetz.'],
      ['default-router <Gateway-IP>', 'Legt innerhalb des Pools das Gateway fest, das die Clients bekommen.'],
      ['ip address dhcp', 'Konfiguriert ein Interface so, dass es selbst per DHCP eine Adresse bezieht (Router als DHCP-Client).'],
    ] },
    { type: 'text', content: 'Der Schwerpunkt dieser Lektion bleibt jedoch der DHCP Relay zu einem separaten (z. B. simulierten) DHCP-Server - diese beiden Befehle sind nur eine kurze Ergänzung für den Fall, dass der Router selbst als Server auftreten soll.' },
  ]));

  exps.push(explanation('verifizierung-classic', 'DHCP Relay verifizieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wofür'], rows: [
      ['show ip interface brief', 'Prüft, ob das Gateway-Interface des Clientnetzes "up" ist - ein down-Interface leitet auch keine Broadcasts weiter.'],
      ['show running-config | include helper', 'Zeigt auf einen Blick, auf welchem Interface welche "ip helper-address" konfiguriert ist.'],
      ['show ip dhcp binding', 'Auf einem Cisco-Gerät, das selbst als DHCP-Server arbeitet: zeigt vergebene Adressen.'],
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'DHCP-Clients senden anfangs Broadcasts - Router leiten Broadcasts normalerweise nicht in andere Netze weiter.',
      'Lösung: "ip helper-address <DHCP-Server-IP>" auf dem Gateway-Interface des Client-Netzes.',
      'WO: auf dem Layer-3-Interface, das Gateway des Client-Netzes ist (physisches Interface, Subinterface oder SVI).',
      'WELCHE IP: immer die IP-Adresse des DHCP-SERVERS - niemals die eigene Gateway-IP.',
      'Drei gleichwertige Szenarien: physisches Interface, Router-on-a-Stick-Subinterface, Multilayer-Switch-SVI.',
      'Im Packet-Tracer-DHCP-Pool ist das "Default Gateway" das Gateway des Clientnetzes - eine andere Adresse als die DHCP-Server-IP.',
      'Verifizieren mit "show running-config | include helper" und "show ip interface brief".',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'dhcp-wo-welche-select',
      type: 'select-best',
      question: 'Clientnetz 192.168.50.0/24, Gateway 192.168.50.1, DHCP-Server 10.20.20.20. Welcher Befehl ist am Gateway-Interface korrekt?',
      options: ['ip helper-address 192.168.50.1', 'ip helper-address 10.20.20.20', 'ip helper-address 192.168.50.0', 'ip dhcp-relay 10.20.20.20'],
      correct: 1,
      explanation: 'Hinter "ip helper-address" steht die IP-Adresse des DHCP-Servers (10.20.20.20), nicht die eigene Gateway-IP.',
    },
    {
      id: 'dhcp-begriffe-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff seiner Bedeutung zu.',
      pairs: [
        { left: 'ip helper-address', leftLabel: 'ip helper-address', right: 'Wird auf dem Gateway-Interface des Client-Netzes konfiguriert, Wert ist die DHCP-Server-IP' },
        { left: 'Default Gateway (im DHCP-Pool)', leftLabel: 'Default Gateway (im Pool)', right: 'Das Gateway des Client-Netzes, das die Clients selbst bekommen' },
        { left: 'DHCP Discover', leftLabel: 'DHCP Discover', right: 'Die erste Anfrage eines Clients, gesendet als Broadcast' },
      ],
      explanation: 'Helper-Ziel und Pool-Gateway sind unterschiedliche IP-Adressen in unterschiedlichen Netzen und dürfen nicht verwechselt werden.',
    },
    {
      id: 'dhcp-physisch-cli',
      type: 'cli-input',
      question: 'Konfiguriere fa0/0 mit der Gateway-IP 192.168.10.1/24 und richte den DHCP Relay zum Server 172.16.0.10 ein.',
      expectedLines: ['interface fa0/0', 'ip address 192.168.10.1 255.255.255.0', 'ip helper-address 172.16.0.10', 'no shutdown'],
      explanation: 'Der Helper gehört auf das Gateway-Interface des Client-Netzes - hier das physische Interface fa0/0.',
    },
    {
      id: 'dhcp-subinterface-cli',
      type: 'cli-input',
      question: 'Router on a Stick: Konfiguriere das Subinterface fa0/0.100 für VLAN 100 (Clients) mit Gateway 192.168.100.1/24 und DHCP Relay zum Server 172.16.0.10.',
      expectedLines: ['interface fa0/0.100', 'encapsulation dot1Q 100', 'ip address 192.168.100.1 255.255.255.0', 'ip helper-address 172.16.0.10'],
      explanation: 'Der Helper gehört auf das Subinterface DES Client-VLANs - nicht auf das physische Hauptinterface und nicht auf andere Subinterfaces ohne DHCP-Clients.',
    },
    {
      id: 'dhcp-svi-cli',
      type: 'cli-input',
      question: 'Multilayer-Switch: Konfiguriere die SVI für VLAN 100 mit Gateway 192.168.100.1/24 und DHCP Relay zum Server 172.16.0.10.',
      expectedLines: ['interface vlan 100', 'ip address 192.168.100.1 255.255.255.0', 'ip helper-address 172.16.0.10', 'no shutdown'],
      explanation: 'Auf einem Multilayer-Switch ist die SVI des Client-VLANs das Gateway - der Helper gehört dorthin.',
    },
    {
      id: 'dhcp-mehrfach-subinterface-select',
      type: 'select-best',
      question: 'Ein Router routet drei VLANs über Subinterfaces: fa0/0.10 (Clients, DHCP nötig), fa0/0.20 (Server, statische IPs, kein DHCP), fa0/0.30 (Voice-Clients, DHCP nötig). Auf wie vielen und welchen Subinterfaces muss "ip helper-address" konfiguriert werden?',
      options: ['Nur auf fa0/0.10', 'Auf fa0/0.10 und fa0/0.30 - überall dort, wo tatsächlich DHCP-Clients stehen', 'Auf allen drei Subinterfaces', 'Auf keinem, DHCP funktioniert automatisch über alle VLANs'],
      correct: 1,
      explanation: 'Der Helper gehört auf jedes Gateway-Interface mit tatsächlichen DHCP-Clients - hier VLAN 10 und VLAN 30, aber nicht VLAN 20 (Server mit statischen IPs).',
    },
    {
      id: 'dhcp-troubleshooting-svi-cli',
      type: 'cli-input',
      question: 'Der Helper "ip helper-address 172.16.0.10" steht fälschlich auf "interface vlan 20" (Server-VLAN) statt auf "interface vlan 10" (Client-VLAN). Entferne den falschen Eintrag auf VLAN 20 und setze ihn korrekt auf VLAN 10.',
      expectedLines: ['interface vlan 20', 'no ip helper-address 172.16.0.10', 'interface vlan 10', 'ip helper-address 172.16.0.10'],
      explanation: '"no ip helper-address <IP>" entfernt den fehlerhaften Eintrag, danach wird der Helper auf dem richtigen Gateway-Interface (VLAN 10) gesetzt.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Warum kommt eine DHCP-Discover-Anfrage eines Clients nicht automatisch bei einem DHCP-Server in einem anderen Netz an?', options: ['DHCP-Server akzeptieren grundsätzlich keine Anfragen aus anderen Netzen', 'Die Anfrage wird als Broadcast gesendet, und Router leiten Broadcasts normalerweise nicht in andere Netze weiter', 'DHCP funktioniert nur innerhalb desselben Switches', 'Der Client kennt die IP-Adresse des Servers nicht'], correct: 1, explanation: 'Discover ist ein Broadcast, und Broadcasts werden von Routern grundsätzlich nicht in andere Netze weitergeleitet.' },
    { question: 'Welche IP-Adresse steht hinter "ip helper-address"?', options: ['Die Gateway-IP des Interfaces, auf dem der Befehl steht', 'Die IP-Adresse des DHCP-Servers', 'Die IP-Adresse des Clients', 'Die Broadcast-Adresse des Client-Netzes'], correct: 1, explanation: 'Der Wert hinter "ip helper-address" ist immer die IP-Adresse des DHCP-Servers - nie die eigene Gateway-IP.' },
    { question: 'Auf welchem Interface wird "ip helper-address" bei Router on a Stick konfiguriert?', options: ['Auf dem physischen Hauptinterface', 'Auf dem Subinterface des Client-VLANs', 'Auf jedem beliebigen Subinterface', 'Auf dem Subinterface des DHCP-Server-VLANs'], correct: 1, explanation: 'Der Helper gehört auf das Subinterface, das Gateway des VLANs mit den DHCP-Clients ist.' },
    { question: 'Was trägt man im Packet-Tracer-DHCP-Pool unter "Default Gateway" ein?', options: ['Die IP-Adresse des DHCP-Servers selbst', 'Das Gateway des Client-Netzes (dieselbe IP wie am Interface mit ip helper-address)', 'Die IP-Adresse eines beliebigen Routers', 'Die Subnetzmaske des Client-Netzes'], correct: 1, explanation: 'Das Default Gateway im Pool ist das Gateway des Client-Netzes - unabhängig von der DHCP-Server-IP.' },
    { question: 'Ein Multilayer-Switch hat SVIs für VLAN 10 (Clients) und VLAN 20 (Server). Wo muss der DHCP-Relay-Befehl stehen, damit VLAN-10-Clients eine IP bekommen?', options: ['Auf der SVI von VLAN 20', 'Auf der SVI von VLAN 10', 'Auf beiden SVIs gleichzeitig', 'Auf keiner SVI, das erfolgt automatisch'], correct: 1, explanation: 'Der Helper gehört auf das Gateway-Interface DES Client-VLANs - hier die SVI von VLAN 10.' },
    { question: 'Ein Client bekommt trotz korrekt konfiguriertem Helper keine IP-Adresse. Der Helper zeigt auf 192.168.10.1 - das ist aber die eigene Gateway-IP des Interfaces. Was ist das Problem?', options: ['Nichts, die Konfiguration ist korrekt', 'Hinter "ip helper-address" wurde versehentlich die eigene Gateway-IP statt der DHCP-Server-IP eingetragen', 'Der Client braucht eine statische IP', 'Das Interface muss neu gestartet werden'], correct: 1, explanation: 'Der Helper muss auf die IP-Adresse des DHCP-SERVERS zeigen - eine Gateway-IP an dieser Stelle ist ein klassischer Konfigurationsfehler.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Prüfe zuerst, ob das Gateway-Interface des Clientnetzes überhaupt aktiv ist, bevor wir uns um DHCP kümmern."',
      expectedLines: [['show ip interface brief', 'sh ip int br']],
      explanation: 'Ein down-Interface leitet auch keine DHCP-Broadcasts weiter - deshalb zuerst den grundsätzlichen Interface-Status prüfen.',
    },
    {
      prompt: 'Sam: "Auf dem physischen Interface fa0/0 hängt das Clientnetz 192.168.20.0/24, Gateway 192.168.20.1. Der DHCP-Server ist unter 172.16.0.10 erreichbar. Richte den Relay ein."',
      expectedLines: ['interface fa0/0', 'ip helper-address 172.16.0.10'],
      explanation: 'Der Helper gehört auf das Gateway-Interface des Client-Netzes und zeigt auf die DHCP-Server-IP.',
    },
    {
      prompt: 'Sam: "Bei Router on a Stick liegt VLAN 100 auf Subinterface fa0/0.100 - dort stehen die DHCP-Clients. Der Server ist 172.16.0.10. Konfiguriere den Relay auf dem richtigen Subinterface."',
      expectedLines: ['interface fa0/0.100', 'ip helper-address 172.16.0.10'],
      explanation: 'Nur das Subinterface des Client-VLANs braucht den Helper.',
    },
    {
      prompt: 'Sam: "Auf dem Multilayer-Switch ist VLAN 30 das Client-VLAN mit SVI interface vlan 30. Server: 172.16.0.10. Konfiguriere den Relay."',
      expectedLines: ['interface vlan 30', 'ip helper-address 172.16.0.10'],
      explanation: 'Die SVI des Client-VLANs ist auch hier die richtige Stelle für den Helper.',
    },
    {
      prompt: 'Sam: "Zeig mir kurz, auf welchen Interfaces aktuell überall ein DHCP-Helper konfiguriert ist."',
      expectedLines: [['show running-config | include helper', 'sh run | include helper']],
      explanation: '"show running-config | include helper" filtert die laufende Konfiguration direkt auf alle "ip helper-address"-Zeilen.',
    },
  ];
}

export function buildCiscoDhcpLesson() {
  return {
    title: 'DHCP Relay',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
