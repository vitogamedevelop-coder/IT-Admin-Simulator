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

const DHCP_RELAY_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">DHCP Relay: Broadcast-Grenze</text><rect x="30" y="50" width="90" height="45" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="75" y="70" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">CLIENT</text><text x="75" y="85" text-anchor="middle" fill="#8b949e" font-size="7">VLAN 10</text><rect x="125" y="95" width="90" height="50" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="113" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">ROUTER / MLS</text><text x="170" y="128" text-anchor="middle" fill="#0a1628" font-size="7">ip helper-address</text><rect x="220" y="50" width="90" height="45" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="265" y="70" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">DHCP SERVER</text><text x="265" y="85" text-anchor="middle" fill="#8b949e" font-size="7">10.0.0.2</text><line x1="120" y1="70" x2="125" y2="110" stroke="#ff7b72" stroke-width="2" stroke-dasharray="6,4"/><text x="115" y="95" text-anchor="end" fill="#ff7b72" font-size="7">Broadcast</text><line x1="215" y1="110" x2="220" y2="70" stroke="#00f0ff" stroke-width="2"/><text x="255" y="105" text-anchor="end" fill="#00f0ff" font-size="7">Unicast</text><text x="170" y="175" text-anchor="middle" fill="#c9d1d9" font-size="8">Router leitet Broadcast weiter</text><text x="170" y="190" text-anchor="middle" fill="#c9d1d9" font-size="8">als Unicast an den Server</text></svg>`;

const DHCP_PLACEMENT_SVG = `<svg viewBox="0 0 340 180" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="18" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Wo gehört der Helper?</text><rect x="10" y="40" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="55" y="55" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Router</text><text x="55" y="68" text-anchor="middle" fill="#8b949e" font-size="7">Gi0/0</text><text x="55" y="88" text-anchor="middle" fill="#00f0ff" font-size="7">phys. Interface</text><rect x="125" y="40" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="170" y="55" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Router</text><text x="170" y="68" text-anchor="middle" fill="#8b949e" font-size="7">Gi0/0.10</text><text x="170" y="88" text-anchor="middle" fill="#00f0ff" font-size="7">Subinterface</text><rect x="240" y="40" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="285" y="55" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">L3-Switch</text><text x="285" y="68" text-anchor="middle" fill="#8b949e" font-size="7">Vlan10</text><text x="285" y="88" text-anchor="middle" fill="#00f0ff" font-size="7">SVI</text><rect x="135" y="110" width="70" height="25" rx="3" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="170" y="126" text-anchor="middle" fill="#c9d1d9" font-size="8">Clients</text><text x="170" y="155" text-anchor="middle" fill="#8b949e" font-size="8">Immer auf dem clientseitigen L3-Interface</text></svg>`;

const DHCP_MULTI_VLAN_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Multi-VLAN → zentraler DHCP-Server</text><rect x="30" y="50" width="70" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="70" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">VLAN 10</text><rect x="30" y="100" width="70" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="120" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">VLAN 20</text><rect x="30" y="150" width="70" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="170" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">VLAN 30</text><rect x="135" y="90" width="80" height="55" rx="4" fill="#00f0ff" opacity="0.9"/><text x="175" y="113" text-anchor="middle" fill="#0a1628" font-size="8" font-weight="bold">L3-Switch</text><text x="175" y="130" text-anchor="middle" fill="#0a1628" font-size="7">Vlan10/20/30</text><line x1="100" y1="65" x2="135" y2="110" stroke="#00f0ff" stroke-width="2"/><line x1="100" y1="115" x2="135" y2="118" stroke="#00f0ff" stroke-width="2"/><line x1="100" y1="165" x2="135" y2="125" stroke="#00f0ff" stroke-width="2"/><text x="115" y="90" text-anchor="middle" fill="#8b949e" font-size="7">je Helper</text><rect x="240" y="100" width="80" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="120" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">DHCP</text><text x="280" y="133" text-anchor="middle" fill="#8b949e" font-size="7">10.0.0.2</text><line x1="215" y1="118" x2="240" y2="118" stroke="#00f0ff" stroke-width="2"/><text x="170" y="195" text-anchor="middle" fill="#8b949e" font-size="8">Jedes Client-VLAN braucht einen eigenen Relay</text></svg>`;

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

  exps.push(explanation('problem-visual', 'DHCP Relay: Broadcast-Grenze', 'visual', [
    { type: 'diagram', content: DHCP_RELAY_SVG },
    { type: 'text', content: 'Der Client sendet im eigenen VLAN einen Broadcast. Der Router nimmt diesen entgegen und leitet ihn als Unicast an den DHCP-Server weiter - aber nur, wenn "ip helper-address" auf dem clientseitigen L3-Interface konfiguriert ist.' },
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

  exps.push(explanation('placement-visual', 'Helper-Placement: phys. Interface, Subinterface, SVI', 'visual', [
    { type: 'diagram', content: DHCP_PLACEMENT_SVG },
    { type: 'text', content: 'Unabhängig vom Gerätetyp gehört der Helper auf das clientseitige L3-Interface. Nicht auf dem Server-Interface, nicht auf einem L2-Access-Port und nicht einmalig "global" für alle VLANs.' },
  ]));

  exps.push(explanation('multi-vlan-visual', 'Mehrere VLANs brauchen mehrere Helper', 'visual', [
    { type: 'diagram', content: DHCP_MULTI_VLAN_SVG },
    { type: 'text', content: 'Jedes Client-VLAN braucht auf seinem eigenen Gateway-Interface (SVI oder Subinterface) einen Helper, der auf denselben zentralen DHCP-Server zeigt. Ein Helper auf VLAN 10 hilft nicht automatisch VLAN 20.' },
  ]));

  exps.push(explanation('routing-dependency-classic', 'Relay ersetzt kein Routing', 'classic', [
    { type: 'text', content: 'Ein korrekt gesetzter "ip helper-address" reicht nicht automatisch, wenn der Relay-Agent den DHCP-Server nicht routingmäßig erreichen kann. Der Router oder Multilayer-Switch braucht einen funktionierenden Layer-3-Pfad zum Netz des DHCP-Servers.' },
    { type: 'list', title: 'Was zu prüfen ist', items: [
      'Das Relay-Interface muss aktiv sein ("show ip interface brief").',
      'Der DHCP-Server muss per "show ip route" erreichbar sein (Connected, Static oder dynamische Route).',
      'Bei einem L2-Switch-Relay (z. B. SVI) muss das Gerät selbst nicht routen - aber der angeschlossene L3-Gerät muss den Server erreichen können.',
    ] },
    { type: 'question', question: 'Der Helper ist korrekt konfiguriert, aber Clients bekommen keine IP. "show ip route" zeigt keine Route zum Netz 10.10.10.0/24, in dem der DHCP-Server liegt. Was fehlt?', options: ['Ein neuer DHCP-Server im gleichen Netz', 'Eine Route zum DHCP-Server-Netz', 'Eine schnellere Netzwerkkarte', 'Ein weiterer Helper auf dem Server-Interface'], correct: 1, explanation: 'DHCP Relay setzt voraus, dass der Relay-Agent den DHCP-Server routen kann. Ohne passende Route zum Server-Netz kommt die Anfrage nicht an.' },
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
      ['ip dhcp excluded-address <IP> oder <Start> <Ende>', 'Schließt feste Adressen (z. B. Gateway oder Server) von der dynamischen Vergabe aus.'],
      ['ip dhcp pool <Name>', 'Legt auf dem Router selbst einen DHCP-Pool an (Router als eigener DHCP-Server statt Relay zu einem externen Server).'],
      ['network <Netz> <Maske>', 'Definiert innerhalb des Pools das zu vergebende Adressnetz.'],
      ['default-router <Gateway-IP>', 'Legt innerhalb des Pools das Gateway fest, das die Clients bekommen.'],
      ['dns-server <DNS-IP>', 'Legt optional einen DNS-Server fest, den die Clients verwenden.'],
      ['ip address dhcp', 'Konfiguriert ein Interface so, dass es selbst per DHCP eine Adresse bezieht (Router als DHCP-Client).'],
    ] },
    { type: 'text', content: 'Der Schwerpunkt dieser Lektion bleibt jedoch der DHCP Relay zu einem separaten (z. B. simulierten) DHCP-Server - diese beiden Befehle sind nur eine kurze Ergänzung für den Fall, dass der Router selbst als Server auftreten soll.' },
  ]));

  exps.push(explanation('verifizierung-classic', 'DHCP Relay verifizieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wofür'], rows: [
      ['show ip interface brief', 'Prüft, ob das Gateway-Interface des Clientnetzes "up" ist - ein down-Interface leitet auch keine Broadcasts weiter.'],
      ['show ip interface <Interface>', 'Zeigt unter anderem die auf diesem Interface konfigurierte Helper-Adresse.'],
      ['show running-config | include helper', 'Zeigt auf einen Blick, auf welchem Interface welche "ip helper-address" konfiguriert ist.'],
      ['show ip route', 'Prüft, ob der DHCP-Server-Netz routingmäßig erreichbar ist.'],
      ['show ip dhcp binding', 'Auf einem Cisco-Gerät, das selbst als DHCP-Server arbeitet: zeigt vergebene Adressen.'],
      ['show ip dhcp pool', 'Auf einem Cisco-Gerät, das selbst als DHCP-Server arbeitet: zeigt Poolstatus und verfügbare Adressen.'],
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'DHCP-Clients senden anfangs Broadcasts - Router leiten Broadcasts normalerweise nicht in andere Netze weiter.',
      'Lösung: "ip helper-address <DHCP-Server-IP>" auf dem Gateway-Interface des Client-Netzes.',
      'WO: auf dem Layer-3-Interface, das Gateway des Client-Netzes ist (physisches Interface, Subinterface oder SVI).',
      'WELCHE IP: immer die IP-Adresse des DHCP-SERVERS - niemals die eigene Gateway-IP.',
      'Drei gleichwertige Szenarien: physisches Interface, Router-on-a-Stick-Subinterface, Multilayer-Switch-SVI.',
      'Mehrere Client-VLANs brauchen mehrere Helper - einer pro clientseitigem Gateway-Interface.',
      'DHCP Relay ersetzt kein Routing: Der Router/MLS muss den DHCP-Server routingmäßig erreichen können.',
      'Im Packet-Tracer-DHCP-Pool ist das "Default Gateway" das Gateway des Clientnetzes - eine andere Adresse als die DHCP-Server-IP.',
      'Verifizieren mit "show running-config | include helper", "show ip interface <if>" und "show ip interface brief".',
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
    {
      id: 'dhcp-wrong-server-ip-select',
      type: 'select-best',
      question: 'Clients bekommen keine IP. In "show running-config | include helper" siehst du "ip helper-address 192.168.10.1". Das ist aber die eigene Gateway-IP des Interfaces. Was ist zu tun?',
      options: ['Nichts, das ist korrekt', 'Auf die DHCP-Server-IP ändern (z. B. 172.16.0.10)', 'Den Helper auf ein anderes Interface verschieben', 'Das Interface neu starten'],
      correct: 1,
      explanation: 'Hinter "ip helper-address" muss die DHCP-Server-IP stehen, nicht die eigene Gateway-IP.',
    },
    {
      id: 'dhcp-routing-dependency-select',
      type: 'select-best',
      question: 'Der Helper ist korrekt gesetzt, aber "show ip route" zeigt keine Route zum DHCP-Server-Netz. Was fehlt?',
      options: ['Der DHCP-Server muss neu gestartet werden', 'Eine funktionierende Route zum DHCP-Server-Netz', 'Ein zweiter Helper auf dem Server-Interface', 'Die Subnetzmaske des Clients ist falsch'],
      correct: 1,
      explanation: 'Relay setzt funktionierendes Routing voraus. Ohne Route zum Server-Netz kann der Relay-Agent die Anfrage nicht weiterleiten.',
    },
    {
      id: 'dhcp-multi-vlan-select',
      type: 'select-best',
      question: 'Ein Router-on-a-Stick versorgt VLAN 10 und VLAN 20. Der DHCP-Server 172.16.0.10 soll beide VLANs bedienen. Auf welchen Interfaces muss "ip helper-address" stehen?',
      options: ['Nur auf fa0/0.10', 'Nur auf fa0/0.20', 'Auf fa0/0.10 UND fa0/0.20', 'Auf dem physischen fa0/0'],
      correct: 2,
      explanation: 'Jedes Client-VLAN braucht einen eigenen Helper auf seinem Subinterface. Ein Helper auf VLAN 10 hilft VLAN 20 nicht.',
    },
    {
      id: 'dhcp-show-helper-select',
      type: 'select-best',
      question: 'Welcher Befehl zeigt dir, auf welchem Interface ein Helper konfiguriert ist?',
      options: ['show ip route', 'show running-config | include helper', 'show ip interface brief', 'show vlan brief'],
      correct: 1,
      explanation: '"show running-config | include helper" filtert die laufende Konfiguration auf alle Zeilen mit "helper" und zeigt Interface plus IP.',
    },
    {
      id: 'dhcp-l2-port-select',
      type: 'select-best',
      question: 'Ein Kollege versucht, "ip helper-address" auf einem Access-Port zu konfigurieren. Warum ist das falsch?',
      options: ['Access-Ports können keine IP-Befehle enthalten', 'DHCP Relay gehört auf ein Layer-3-Interface, nicht auf einen L2-Switchport', 'Access-Ports leiten keine Broadcasts', 'DHCP funktioniert nur auf Trunks'],
      correct: 1,
      explanation: 'Der Helper-Befehl ist ein Layer-3-Feature und gehört auf das Gateway-Interface des Client-Netzes (Router-Interface, Subinterface oder SVI).',
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
    { question: 'Ein Router-on-a-Stick bedient VLAN 10 und VLAN 20 von DHCP. Der DHCP-Server ist 10.0.0.2. Auf wie vielen Subinterfaces muss "ip helper-address" stehen?', options: ['Nur auf fa0/0.10', 'Nur auf fa0/0.20', 'Auf fa0/0.10 und fa0/0.20', 'Auf dem physischen fa0/0'], correct: 2, explanation: 'Jedes Client-VLAN braucht einen eigenen Helper auf seinem Subinterface. Ein einzelner Helper reicht nicht für alle VLANs.' },
    { question: 'Warum bekommt ein Client trotz "ip helper-address" keine IP, wenn der DHCP-Server in einem anderen Netz liegt und "show ip route" keine Route dorthin zeigt?', options: ['Der DHCP-Server ist defekt', 'Der Relay-Agent kann den Server nicht erreichen, weil Routing fehlt', 'Der Client muss neu gestartet werden', 'Der Helper steht auf dem falschen Interface'], correct: 1, explanation: 'DHCP Relay setzt funktionierendes Routing zum DHCP-Server voraus. Ohne Route kann die Anfrage nicht weitergeleitet werden.' },
    { question: 'Welcher Befehl zeigt am schnellsten, auf welchen Interfaces ein DHCP-Helper konfiguriert ist?', options: ['show ip route', 'show running-config | include helper', 'show ip interface brief', 'show vlan brief'], correct: 1, explanation: '"show running-config | include helper" filtert die Konfiguration auf alle Zeilen, die "helper" enthalten.' },
    { question: 'Auf welchem Interface wird "ip helper-address" bei einem Multilayer-Switch mit SVIs konfiguriert?', options: ['Auf der SVI des Client-VLANs', 'Auf der SVI des Server-VLANs', 'Auf dem physischen Uplink-Port', 'Global im Config-Modus'], correct: 0, explanation: 'Auf einem Multilayer-Switch gehört der Helper auf die SVI, die Gateway des Client-VLANs ist.' },
    { question: 'Warum ist "ip helper-address" auf einem reinen L2-Switch-Access-Port falsch?', options: ['Weil Access-Ports kein DHCP unterstützen', 'Weil der Befehl ein Layer-3-Feature ist und auf einem Gateway-Interface gehört', 'Weil der Port blockiert ist', 'Weil Helper nur auf Trunks funktionieren'], correct: 1, explanation: 'DHCP Relay ist ein Layer-3-Feature. Es gehört auf das Gateway-Interface des Client-Netzes, nicht auf einen L2-Access-Port.' },
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
    {
      prompt: 'Sam: "Prüfe am Interface fa0/0, ob dort ein Helper eingetragen ist und auf welche IP er zeigt."',
      expectedLines: [['show ip interface fa0/0', 'sh ip int fa0/0']],
      explanation: '"show ip interface <IF>" zeigt unter anderem die konfigurierte Helper-Adresse für dieses Interface.',
    },
    {
      prompt: 'Sam: "Für Redundanz sollen auf diesem Interface zwei DHCP-Server als Helper eingetragen werden: 10.0.0.2 und 10.0.0.3."',
      expectedLines: ['interface fa0/0', 'ip helper-address 10.0.0.2', 'ip helper-address 10.0.0.3'],
      explanation: 'Mehrere "ip helper-address"-Einträge auf demselben Interface leiten DHCP-Anfragen redundant an mehrere Server weiter.',
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
