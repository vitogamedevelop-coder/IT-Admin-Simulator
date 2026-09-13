import { topicKey } from '../academyTopics.js';

// =============================================================================
// C5: DHCP Relay Micro-Learning Pilot
//
// Design goals:
// - NEXUS-first: problem before solution.
// - TEACH → DO → TEACH → DO rhythm.
// - Every exercise and quiz item declares its evidenceType and related facet.
// - Recovery is built into the pool (exercises with 'adaptive: recovery').
// - Same source coverage as the original lesson, but with less duplication.
// - legacyId fields preserve previous progress through the v1.99.0 migration.
// =============================================================================

export const CISCO_DHCP_TOPIC_KEY = topicKey('cisco-packet-tracer', 'dhcp');

const FACETS = {
  PROBLEM: 'ciscoDhcp.relayPurpose',
  PLACEMENT: 'ciscoDhcp.helperPlacement',
  GATEWAY_VS_SERVER: 'ciscoDhcp.helperVsGatewayIp',
  VARIATIONS: 'ciscoDhcp.placementVariations',
  MULTI_VLAN: 'ciscoDhcp.multiVlan',
  ROUTING: 'ciscoDhcp.routingDependency',
  VERIFY: 'ciscoDhcp.verify',
  TROUBLESHOOT: 'ciscoDhcp.troubleshooting',
};

const DHCP_RELAY_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">DHCP Relay: Broadcast-Grenze</text><rect x="30" y="50" width="90" height="45" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="75" y="70" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">CLIENT</text><text x="75" y="85" text-anchor="middle" fill="#8b949e" font-size="7">VLAN 10</text><rect x="125" y="95" width="90" height="50" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="113" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">ROUTER / MLS</text><text x="170" y="128" text-anchor="middle" fill="#0a1628" font-size="7">ip helper-address</text><rect x="220" y="50" width="90" height="45" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="265" y="70" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">DHCP SERVER</text><text x="265" y="85" text-anchor="middle" fill="#8b949e" font-size="7">10.0.0.2</text><line x1="120" y1="70" x2="125" y2="110" stroke="#ff7b72" stroke-width="2" stroke-dasharray="6,4"/><text x="115" y="95" text-anchor="end" fill="#ff7b72" font-size="7">Broadcast</text><line x1="215" y1="110" x2="220" y2="70" stroke="#00f0ff" stroke-width="2"/><text x="255" y="105" text-anchor="end" fill="#00f0ff" font-size="7">Unicast</text><text x="170" y="175" text-anchor="middle" fill="#c9d1d9" font-size="8">Router leitet Broadcast weiter</text><text x="170" y="190" text-anchor="middle" fill="#c9d1d9" font-size="8">als Unicast an den Server</text></svg>`;

const DHCP_PLACEMENT_SVG = `<svg viewBox="0 0 340 180" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="18" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Wo gehört der Helper?</text><rect x="10" y="40" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="55" y="55" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Router</text><text x="55" y="68" text-anchor="middle" fill="#8b949e" font-size="7">Gi0/0</text><text x="55" y="88" text-anchor="middle" fill="#00f0ff" font-size="7">phys. Interface</text><rect x="125" y="40" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="170" y="55" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Router</text><text x="170" y="68" text-anchor="middle" fill="#8b949e" font-size="7">Gi0/0.10</text><text x="170" y="88" text-anchor="middle" fill="#00f0ff" font-size="7">Subinterface</text><rect x="240" y="40" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="285" y="55" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">L3-Switch</text><text x="285" y="68" text-anchor="middle" fill="#8b949e" font-size="7">Vlan10</text><text x="285" y="88" text-anchor="middle" fill="#00f0ff" font-size="7">SVI</text><rect x="135" y="110" width="70" height="25" rx="3" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="170" y="126" text-anchor="middle" fill="#c9d1d9" font-size="8">Clients</text><text x="170" y="155" text-anchor="middle" fill="#8b949e" font-size="8">Immer auf dem clientseitigen L3-Interface</text></svg>`;

const DHCP_MULTI_VLAN_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Multi-VLAN → zentraler DHCP-Server</text><rect x="30" y="50" width="70" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="70" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">VLAN 10</text><rect x="30" y="100" width="70" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="120" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">VLAN 20</text><rect x="30" y="150" width="70" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="170" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">VLAN 30</text><rect x="135" y="90" width="80" height="55" rx="4" fill="#00f0ff" opacity="0.9"/><text x="175" y="113" text-anchor="middle" fill="#0a1628" font-size="8" font-weight="bold">L3-Switch</text><text x="175" y="130" text-anchor="middle" fill="#0a1628" font-size="7">Vlan10/20/30</text><line x1="100" y1="65" x2="135" y2="110" stroke="#00f0ff" stroke-width="2"/><line x1="100" y1="115" x2="135" y2="118" stroke="#00f0ff" stroke-width="2"/><line x1="100" y1="165" x2="135" y2="125" stroke="#00f0ff" stroke-width="2"/><text x="115" y="90" text-anchor="middle" fill="#8b949e" font-size="7">je Helper</text><rect x="240" y="100" width="80" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="120" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">DHCP</text><text x="280" y="133" text-anchor="middle" fill="#8b949e" font-size="7">10.0.0.2</text><line x1="215" y1="118" x2="240" y2="118" stroke="#00f0ff" stroke-width="2"/><text x="170" y="195" text-anchor="middle" fill="#8b949e" font-size="8">Jedes Client-VLAN braucht einen eigenen Helper.</text></svg>`;

const APIPA_SVG = `<svg viewBox="0 0 320 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="160" y="18" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">APIPA = kein normaler DHCP-Lease</text><rect x="30" y="45" width="80" height="40" rx="4" fill="#ff7b72" opacity="0.3" stroke="#ff7b72" stroke-width="2"/><text x="70" y="70" text-anchor="middle" fill="#c9d1d9" font-size="9">Client DHCP</text><line x1="110" y1="65" x2="150" y2="65" stroke="#8b949e" stroke-width="2" stroke-dasharray="4,3"/><text x="130" y="58" text-anchor="middle" fill="#8b949e" font-size="8">keine Antwort</text><rect x="180" y="35" width="80" height="40" rx="4" fill="#0a1628" stroke="#00f0ff" stroke-width="2"/><text x="220" y="55" text-anchor="middle" fill="#c9d1d9" font-size="9">DHCP-Server</text><text x="160" y="100" text-anchor="middle" fill="#ff7b72" font-size="9">Client fällt auf 169.254.x.x zurück</text></svg>`;

function explanation(id, title, style, blocks, legacyId) {
  const out = { id, title, style, blocks };
  if (legacyId) out.legacyId = legacyId;
  return out;
}

function buildExplanations() {
  const exps = [];

  // NEXUS intro: problem first.
  exps.push(explanation('nexus-intro', 'Neue Abteilung, keine IP', 'classic', [
    { type: 'text', content: 'Sam: „Wir haben einen neuen Standort. Clients im VLAN 10 bekommen per DHCP keine Adresse. Mit einer statischen IP funktioniert der Zugriff zu allen Servern. Woran liegt es?"' },
    { type: 'text', content: 'Du beobachtest: statische Verbindung funktioniert, DHCP funktioniert nicht. Das Netzwerk ist grundsätzlich erreichbar – das DHCP-Verfahren selbst scheitert an einer Netzgrenze.' },
    { type: 'question', question: 'Welche Beobachtung ist der wichtigste Hinweis, dass das Problem nicht am Kabel oder am Client liegt?', options: ['Clients mit statischer IP kommen ins Netz', 'Das VLAN hat einen Namen', 'Der DHCP-Server ist neu', 'Der Router ist ausgeschaltet'], correct: 0, explanation: 'Wenn statische IPs funktionieren, ist Kabel, Port und grundlegende Erreichbarkeit in Ordnung. Das Problem liegt im automatischen DHCP-Ablauf.', evidenceType: 'recognized', relatedKnowledgeIds: [FACETS.PROBLEM] },
  ]));

  // Mental model: broadcast boundary.
  exps.push(explanation('mental-model', 'Warum DHCP-Clients über Netzgrenzen nichts erreichen', 'classic', [
    { type: 'text', content: 'Ein DHCP-Client kennt am Anfang keine IP. Er sendet deshalb seine erste Anfrage als Broadcast an alle Geräte im eigenen Netz. Router leiten Broadcasts aber grundsätzlich nicht in andere Netze oder VLANs weiter.' },
    { type: 'diagram', content: DHCP_RELAY_SVG },
    { type: 'text', content: 'Steht der DHCP-Server im gleichen Netz wie der Client, ist das kein Problem. Steht er in einem anderen Netz, kommt der Discover-Broadcast nie an. Ein DHCP Relay Agent muss den Broadcast entgegennehmen und als Unicast an den Server weiterleiten.' },
    { type: 'question', question: 'Warum erreicht ein DHCP-Discover-Broadcast aus VLAN 10 einen DHCP-Server im VLAN 20 nicht?', options: ['Weil DHCP-Server Broadcasts blockieren', 'Weil Router Broadcasts normalerweise nicht über Netzgrenzen weiterleiten', 'Weil der Client die Server-IP nicht kennt', 'Weil VLANs grundsätzlich kein DHCP erlauben'], correct: 1, explanation: 'Router leiten Broadcasts grundsätzlich nicht in andere Netze weiter. Das ist das eigentliche Problem.', evidenceType: 'understood', relatedKnowledgeIds: [FACETS.PROBLEM] },
  ], 'problem-classic'));

  // Recognize the concept.
  exps.push(explanation('recognize', 'Das Konzept: DHCP Relay', 'classic', [
    { type: 'text', content: 'Der Cisco-Befehl für DHCP Relay ist einfach. Die Schwierigkeit ist nicht die Syntax, sondern die richtige Stelle und die richtige IP.' },
    { type: 'list', title: 'Zwei Fragen entscheiden', items: [
      'WO muss der Befehl stehen? Auf dem Layer-3-Interface, das das Client-Netz als Gateway sieht.',
      'WELCHE IP wird angegeben? Die IP-Adresse des DHCP-Servers, nicht die eigene Interface-IP.',
    ] },
    { type: 'question', question: 'Welches Konzept löst das Problem, DHCP über Netzgrenzen zu ermöglichen?', options: ['DHCP Relay / ip helper-address', 'APIPA', 'Static MAC Binding', 'NAT Overload'], correct: 0, explanation: 'DHCP Relay ist der richtige Begriff; APIPA ist nur ein Symptom.', evidenceType: 'recognized', relatedKnowledgeIds: [FACETS.PROBLEM] },
  ]));

  // Understand placement and IP distinction.
  exps.push(explanation('understand-placement', 'WO vs. WELCHE IP', 'classic', [
    { type: 'text', content: 'Der gleiche Fehler tritt immer wieder auf: Der Befehl steht am Ende auf dem Server-Interface oder hinter dem Befehl steht versehentlich die eigene Interface-IP des Routers.' },
    { type: 'diagram', content: DHCP_PLACEMENT_SVG },
    { type: 'table', headers: ['Frage', 'Antwort'], rows: [
      ['WO?', 'Auf dem L3-Interface, das Gateway des Client-Netzes ist: physisches Interface, Subinterface oder SVI.'],
      ['WELCHE IP?', 'Die des DHCP-Servers.'],
    ] },
    { type: 'text', content: 'Beispiel: Clientnetz 192.168.100.0/24, Gateway des Clientnetzes 192.168.100.1, DHCP-Server 172.16.0.10.' },
    { type: 'question', question: 'Auf dem Gateway-Interface des Clientnetzes trägst du ein:', options: ['ip helper-address 192.168.100.1', 'ip helper-address 172.16.0.10', 'ip address 172.16.0.10 255.255.255.0', 'ip dhcp pool 192.168.100.0'], correct: 1, explanation: 'Hinter ip helper-address steht die IP des DHCP-Servers. 192.168.100.1 wäre die eigene Gateway-IP.', evidenceType: 'understood', relatedKnowledgeIds: [FACETS.PLACEMENT, FACETS.GATEWAY_VS_SERVER] },
  ], 'wo-vs-welche-ip-classic'));

  // Scenarios: physical / subinterface / SVI.
  exps.push(explanation('scenarios', 'Physikalisch, Subinterface, SVI – immer dasselbe Prinzip', 'classic', [
    { type: 'text', content: 'Das Prinzip ändert sich nicht. Egal ob Router-Interface, Router-on-a-Stick-Subinterface oder Multilayer-Switch-SVI: Der Helper steht auf dem clientseitigen Gateway-Interface.' },
    { type: 'diagram', content: DHCP_PLACEMENT_SVG },
    { type: 'text', content: 'Bei mehreren Client-VLANs braucht jedes VLAN einen eigenen Helper. Ein Helper auf VLAN 10 hilft VLAN 20 nicht.' },
    { type: 'diagram', content: DHCP_MULTI_VLAN_SVG },
    { type: 'question', question: 'Ein Router-on-a-Stick bedient VLAN 10 und VLAN 20. Auf welchen Subinterfaces muss ip helper-address stehen, wenn beide VLANs DHCP-Clients haben?', options: ['Nur auf fa0/0.10', 'Nur auf fa0/0.20', 'Auf fa0/0.10 und fa0/0.20', 'Auf dem physischen fa0/0'], correct: 2, explanation: 'Jedes Client-VLAN braucht einen eigenen Helper auf seinem Subinterface.', evidenceType: 'understood', relatedKnowledgeIds: [FACETS.VARIATIONS, FACETS.MULTI_VLAN] },
  ], 'szenario-b-classic'));

  // Recall: command itself.
  exps.push(explanation('recall-command', 'Den Befehl selbst eingeben', 'classic', [
    { type: 'text', content: 'Bisher hast du den Befehl erkannt. Jetzt wirst du ihn in einem konkreten Szenario selbst konfigurieren.' },
    { type: 'text', content: 'Merke: "interface" wählen, dann "ip helper-address <DHCP-Server-IP>". Keine andere Syntax.' },
    { type: 'question', question: 'Welcher Cisco-Befehl leitet DHCP-Broadcasts als Unicast an 10.0.0.2 weiter?', options: ['ip helper-address 10.0.0.2', 'ip dhcp-relay 10.0.0.2', 'ip forward-protocol 10.0.0.2', 'dhcp relay 10.0.0.2'], correct: 0, explanation: 'Der Cisco-Standardbefehl lautet "ip helper-address <IP>".', evidenceType: 'recalled', relatedKnowledgeIds: [FACETS.PLACEMENT] },
  ]));

  // Apply: multiple VLANs, one server.
  exps.push(explanation('apply-multi-vlan', 'Anwenden: ein zentraler Server, mehrere VLANs', 'classic', [
    { type: 'text', content: 'In Packet Tracer simulierst du oft das gleiche Bild: ein zentraler DHCP-Server im Server-VLAN soll mehrere Client-VLANs bedienen.' },
    { type: 'list', title: 'Vorgehen', items: [
      'Für jedes Client-VLAN das richtige Gateway-Interface identifizieren.',
      'Dort ip helper-address <Server-IP> konfigurieren.',
      'Routing zum Server-Netz prüfen.',
    ] },
    { type: 'question', question: 'Im DHCP-Pool für das Clientnetz 192.168.100.0/24 trägst du unter "Default Gateway" welche Adresse ein?', options: ['Die IP-Adresse des DHCP-Servers', 'Das Gateway des Clientnetzes (z. B. 192.168.100.1)', 'Eine beliebige freie Adresse im Servernetz', 'Die IP des Relay-Routers im Servernetz'], correct: 1, explanation: 'Das Default Gateway im Pool ist das Gateway des Clientnetzes – unabhängig von der DHCP-Server-IP.', evidenceType: 'understood', relatedKnowledgeIds: [FACETS.GATEWAY_VS_SERVER] },
    { type: 'question', question: 'Auf einem Multilayer-Switch routet VLAN 10 (Clients) und VLAN 20 (Server). VLAN-10-Clients bekommen keine IP. Der Helper wurde auf "interface vlan 20" konfiguriert. Was ist richtig?', options: ['Den Helper auf "interface vlan 10" setzen', 'Den Server nach VLAN 10 verschieben', 'VLAN 20 als Client-VLAN verwenden', 'Den Switch als DHCP-Server konfigurieren'], correct: 0, explanation: 'Der Helper gehört auf das Gateway-Interface des Client-VLANs, also auf die SVI von VLAN 10.', evidenceType: 'applied', relatedKnowledgeIds: [FACETS.MULTI_VLAN, FACETS.PLACEMENT] },
  ]));

  // Diagnose: APIPA, known good, routing.
  exps.push(explanation('diagnose-apiipa', 'Diagnose: APIPA als Symptom', 'classic', [
    { type: 'text', content: 'APIPA-Adressen (169.254.x.x) bedeuten: Der Client konnte kein normales DHCP-Angebot erhalten. Warum, muss der Administrator aus dem Kontext erschließen.' },
    { type: 'diagram', content: APIPA_SVG },
    { type: 'list', title: 'Known Good prüfen', items: [
      'Kabel und Port in Ordnung?',
      'Statische IP funktioniert?',
      'DHCP-Server ist erreichbar (Routing)?',
    ] },
    { type: 'text', content: 'Ist das Netz grundsätzlich okay, fehlt oft der DHCP Relay oder er steht auf dem falschen Interface.' },
    { type: 'question', question: 'Ein Client bekommt die IP 169.254.17.5. Statische IPs im gleichen Netz funktionieren. Was ist die wahrscheinlichste DHCP-spezifische Ursache?', options: ['Der DHCP-Server ist defekt', 'DHCP Relay fehlt oder ist falsch platziert', 'Das Standardgateway ist falsch', 'Der Switch ist aus'], correct: 1, explanation: '169.254.x.x bedeutet: kein DHCP-Lease. Wenn das Netz ansonsten funktioniert, ist Relay das wahrscheinlichste Problem.', evidenceType: 'diagnosed', relatedKnowledgeIds: [FACETS.TROUBLESHOOT, FACETS.PROBLEM] },
  ], 'troubleshooting-classic'));

  // Verify and Transfer.
  exps.push(explanation('verify', 'Schnell prüfen', 'classic', [
    { type: 'text', content: 'Nach dem Konfigurieren solltest du nicht einfach hoffen, sondern prüfen. Die wichtigsten Befehle:' },
    { type: 'list', title: 'Prüfung', items: [
      'show running-config | include helper',
      'show ip interface <Interface>',
      'show ip route',
      'show ip interface brief',
    ] },
    { type: 'question', question: 'Welcher Befehl zeigt dir am schnellsten, auf welchem Interface ein Helper konfiguriert ist?', options: ['show running-config | include helper', 'show ip route', 'show cdp neighbors', 'show vlan brief'], correct: 0, explanation: 'Das include-Filter zeigt alle Zeilen mit "helper" in der laufenden Konfiguration.', evidenceType: 'understood', relatedKnowledgeIds: [FACETS.VERIFY] },
  ], 'verifizierung-classic'));

  exps.push(explanation('transfer', 'Transfer: anderer Kontext, gleiche Logik', 'classic', [
    { type: 'text', content: 'Stelle dir das Szenario in einem anderen Gebäude vor: Clients im Netz 10.20.20.0/24, Gateway 10.20.20.1, DHCP-Server 172.22.5.10. Der Befehl bleibt derselbe – nur Adressen und Interface ändern sich.' },
    { type: 'question', question: 'In einem neuen Szenario ist das Client-Gateway 10.20.20.1 auf Gi0/0.1 und der DHCP-Server 172.22.5.10. Welche Konfiguration ist korrekt?', options: ['interface gi0/0.1\nip helper-address 10.20.20.1', 'interface gi0/0.1\nip helper-address 172.22.5.10', 'interface gi0/0\nip helper-address 172.22.5.10', 'interface vlan 1\nip helper-address 172.22.5.10'], correct: 1, explanation: 'Helper auf dem clientseitigen Subinterface und auf die DHCP-Server-IP 172.22.5.10 zeigen.', evidenceType: 'transferred', relatedKnowledgeIds: [FACETS.PLACEMENT, FACETS.GATEWAY_VS_SERVER] },
  ]));

  exps.push(explanation('summary', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Das Wichtigste', items: [
      'DHCP Discover ist ein Broadcast, der von Routern nicht über Netzgrenzen weitergeleitet wird.',
      'ip helper-address <DHCP-Server-IP> aktiviert den DHCP Relay.',
      'Der Befehl steht immer auf dem clientseitigen Gateway-Interface.',
      'Hinter dem Befehl steht die IP des DHCP-Servers, nie die eigene Interface-IP.',
      'APIPA (169.254.x.x) ist ein Symptom für fehlenden DHCP-Lease.',
      'Jedes Client-VLAN braucht seinen eigenen Helper.',
      'show running-config | include helper zeigt die Konfiguration.',
    ] },
  ], 'summary-classic'));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'dhcp-recognize-concept',
      legacyId: 'dhcp-begriffe-matching',
      type: 'select-best',
      evidenceType: 'recognized',
      relatedKnowledgeIds: [FACETS.PROBLEM],
      difficulty: 'easy',
      question: 'Ein Client in VLAN 10 braucht DHCP. Der DHCP-Server ist in VLAN 20. Welches Konzept überbrückt die Broadcast-Grenze?',
      options: ['DHCP Relay', 'NAT', 'ARP', 'STP'],
      correct: 0,
      explanation: 'DHCP Relay leitet DHCP-Broadcasts aus dem Client-VLAN als Unicast an den Server weiter.',
    },
    {
      id: 'dhcp-understand-where',
      legacyId: 'dhcp-wo-welche-select',
      type: 'select-best',
      evidenceType: 'understood',
      relatedKnowledgeIds: [FACETS.PLACEMENT],
      difficulty: 'easy',
      question: 'Wo muss ip helper-address konfiguriert werden?',
      options: ['Auf dem DHCP-Server', 'Auf dem clientseitigen Gateway-Interface', 'Auf jedem L2-Access-Port', 'Global im Config-Modus'],
      correct: 1,
      explanation: 'Der Helper gehört auf das Layer-3-Interface, das das Client-Netz als Gateway sieht.',
    },
    {
      id: 'dhcp-recall-command',
      legacyId: 'dhcp-physisch-cli',
      type: 'cli-input',
      evidenceType: 'recalled',
      relatedKnowledgeIds: [FACETS.PLACEMENT, FACETS.GATEWAY_VS_SERVER],
      difficulty: 'easy',
      startContext: 'Switch(config-if)#',
      question: 'Du befindest dich bereits im Interface-Konfigurationsmodus. Richte DHCP Relay zum Server 172.16.0.10 ein.',
      expectedLines: ['ip helper-address 172.16.0.10'],
      explanation: 'ip helper-address zeigt auf den DHCP-Server.',
    },
    {
      id: 'dhcp-apply-subinterface',
      legacyId: 'dhcp-subinterface-cli',
      type: 'cli-input',
      evidenceType: 'applied',
      relatedKnowledgeIds: [FACETS.VARIATIONS, FACETS.PLACEMENT],
      difficulty: 'medium',
      startContext: 'Globaler Konfigurationsmodus',
      question: 'Router on a Stick: Konfiguriere fa0/0.100 für VLAN 100 (Clients, 192.168.100.1/24) und DHCP Relay zum Server 172.16.0.10.',
      expectedLines: ['interface fa0/0.100', 'encapsulation dot1Q 100', 'ip address 192.168.100.1 255.255.255.0', 'ip helper-address 172.16.0.10'],
      explanation: 'Auf dem Subinterface des Client-VLANs wird der Helper konfiguriert.',
    },
    {
      id: 'dhcp-multi-vlan-select',
      legacyId: 'dhcp-mehrfach-subinterface-select',
      type: 'select-best',
      evidenceType: 'applied',
      relatedKnowledgeIds: [FACETS.MULTI_VLAN, FACETS.VARIATIONS],
      difficulty: 'hard',
      question: 'Ein Router-on-a-Stick bedient VLAN 10 (Clients), VLAN 20 (Server, statisch) und VLAN 30 (Voice-Clients). DHCP-Server 172.16.0.10 soll VLAN 10 und 30 bedienen. Auf welchen Subinterfaces muss "ip helper-address 172.16.0.10" stehen?',
      options: ['Nur auf fa0/0.10', 'Nur auf fa0/0.30', 'Auf fa0/0.10 und fa0/0.30', 'Auf fa0/0.20'],
      correct: 2,
      explanation: 'Nur Subinterfaces mit DHCP-Clients brauchen einen Helper.',
    },
    {
      id: 'dhcp-recovery-wrong-svi',
      legacyId: 'dhcp-troubleshooting-svi-cli',
      type: 'cli-input',
      evidenceType: 'applied',
      facet: FACETS.PLACEMENT,
      relatedKnowledgeIds: [FACETS.TROUBLESHOOT, FACETS.PLACEMENT],
      difficulty: 'hard',
      adaptive: 'recovery',
      startContext: 'Globaler Konfigurationsmodus',
      question: 'Ein Kollege hat den Helper fälschlich auf "interface vlan 20" gesetzt. Clients in VLAN 10 brauchen ihn. Entferne den falschen Eintrag und setze ihn auf vlan 10.',
      expectedLines: ['interface vlan 20', 'no ip helper-address 172.16.0.10', 'interface vlan 10', 'ip helper-address 172.16.0.10'],
      explanation: 'Keine Panik: no ip helper-address entfernt den alten Eintrag, dann setzt du ihn auf das richtige VLAN.',
    },
    {
      id: 'dhcp-diagnose-apiipa',
      legacyId: 'dhcp-routing-dependency-select',
      type: 'select-best',
      evidenceType: 'diagnosed',
      relatedKnowledgeIds: [FACETS.TROUBLESHOOT, FACETS.PROBLEM],
      difficulty: 'medium',
      question: 'Ein Client zeigt 169.254.8.12. Statische IPs im gleichen VLAN funktionieren. show running-config | include helper liefert keinen Eintrag. Was fehlt?',
      options: ['DHCP Relay auf dem Client-Gateway-Interface', 'Ein neuer DHCP-Server im Client-VLAN', 'Eine größere Subnetzmaske', 'Ein DNS-Server'],
      correct: 0,
      explanation: 'APIPA = kein DHCP-Lease. Wenn statische IPs funktionieren, liegt es am DHCP-Prozess, typisch fehlender/falscher Relay.',
    },
    {
      id: 'dhcp-transfer-svi',
      legacyId: 'dhcp-svi-cli',
      type: 'cli-input',
      evidenceType: 'transferred',
      relatedKnowledgeIds: [FACETS.PLACEMENT, FACETS.MULTI_VLAN],
      difficulty: 'hard',
      startContext: 'Globaler Konfigurationsmodus',
      question: 'Ein Multilayer-Switch hat VLAN 30 (Clients, 192.168.30.1/24). Konfiguriere DHCP Relay zum zentralen Server 10.10.10.10.',
      expectedLines: ['interface vlan 30', 'ip address 192.168.30.1 255.255.255.0', 'ip helper-address 10.10.10.10', 'no shutdown'],
      explanation: 'SVI des Client-VLANs trägt Gateway-IP und Helper. Das Prinzip ist identisch zum Router-Subinterface.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Warum braucht DHCP ein Relay, wenn Server und Client in verschiedenen Netzen liegen?', options: ['Weil Router Broadcasts nicht über Netzgrenzen weiterleiten', 'Weil der Client keine IP hat', 'Weil der Server zu langsam ist', 'Weil DHCP nur im lokalen VLAN funktioniert'], correct: 0, explanation: 'DHCP Discover ist ein Broadcast, der von Routern nicht in andere Netze weitergeleitet wird.', evidenceType: 'understood', relatedKnowledgeIds: [FACETS.PROBLEM] },
    { question: 'Welche IP steht hinter ip helper-address?', options: ['Die eigene Interface-IP', 'Die IP des DHCP-Servers', 'Die IP des Client-Netz-Gateways', 'Die Netzadresse des Client-Netzes'], correct: 1, explanation: 'ip helper-address zeigt auf den DHCP-Server.', evidenceType: 'understood', relatedKnowledgeIds: [FACETS.GATEWAY_VS_SERVER] },
    { question: 'Auf welchem Interface steht ip helper-address bei einem Multilayer-Switch?', options: ['Auf der SVI des Client-VLANs', 'Auf der SVI des Server-VLANs', 'Auf dem physischen Uplink', 'Global'], correct: 0, explanation: 'Der Helper steht auf dem Gateway-Interface des Client-VLANs.', evidenceType: 'recalled', relatedKnowledgeIds: [FACETS.PLACEMENT] },
    { question: 'Ein Router-on-a-Stick bedient VLAN 10 und VLAN 20 mit DHCP. Wie viele ip helper-address braucht es?', options: ['Nur auf fa0/0.10', 'Nur auf fa0/0.20', 'Auf fa0/0.10 und fa0/0.20', 'Auf fa0/0'], correct: 2, explanation: 'Jedes Client-VLAN braucht einen eigenen Helper.', evidenceType: 'applied', relatedKnowledgeIds: [FACETS.MULTI_VLAN] },
    { question: 'Client mit 169.254.x.x, statische IPs funktionieren. Was ist die wahrscheinlichste Ursache?', options: ['Falsche VLAN-Zuweisung', 'Fehlender DHCP Relay', 'Falsche DNS-Server', 'Port Security'], correct: 1, explanation: 'APIPA bedeutet kein DHCP-Lease. Wenn statisch funktioniert, liegt es am DHCP-Prozess / Relay.', evidenceType: 'diagnosed', relatedKnowledgeIds: [FACETS.TROUBLESHOOT] },
  ];
}

function buildCliTasks() {
  return [
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Prüfe zuerst, ob das Gateway-Interface des Clientnetzes aktiv ist."',
      expectedLines: [['show ip interface brief', 'sh ip int br']],
      explanation: 'Ein down-Interface leitet keine DHCP-Broadcasts weiter.',
      evidenceType: 'applied',
      relatedKnowledgeIds: [FACETS.VERIFY],
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Auf fa0/0 liegt das Clientnetz 192.168.20.0/24, Gateway 192.168.20.1. Der DHCP-Server ist 172.16.0.10. Richte den Relay ein."',
      expectedLines: ['interface fa0/0', 'ip address 192.168.20.1 255.255.255.0', 'ip helper-address 172.16.0.10', 'no shutdown'],
      explanation: 'Das physische Interface wird Gateway und trägt den Helper.',
      evidenceType: 'applied',
      relatedKnowledgeIds: [FACETS.PLACEMENT],
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Router on a Stick: VLAN 100 ist das Client-VLAN auf fa0/0.100. Server: 172.16.0.10. Konfiguriere."',
      expectedLines: ['interface fa0/0.100', 'encapsulation dot1Q 100', 'ip address 192.168.100.1 255.255.255.0', 'ip helper-address 172.16.0.10'],
      explanation: 'Nur das Subinterface des Client-VLANs braucht den Helper.',
      evidenceType: 'applied',
      relatedKnowledgeIds: [FACETS.VARIATIONS],
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Multilayer-Switch: VLAN 30 ist das Client-VLAN. Server: 10.0.0.2. Konfiguriere den Relay."',
      expectedLines: ['interface vlan 30', 'ip address 192.168.30.1 255.255.255.0', 'ip helper-address 10.0.0.2', 'no shutdown'],
      explanation: 'Auf der SVI des Client-VLANs wird der Helper konfiguriert.',
      evidenceType: 'applied',
      relatedKnowledgeIds: [FACETS.PLACEMENT],
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeig mir, auf welchen Interfaces ein DHCP-Helper konfiguriert ist."',
      expectedLines: [['show running-config | include helper', 'sh run | include helper']],
      explanation: 'Dieser Befehl filtert die laufende Konfiguration auf alle Helper-Einträge.',
      evidenceType: 'understood',
      relatedKnowledgeIds: [FACETS.VERIFY],
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
    finalQuizCount: 5,
  };
}
