import { topicKey } from './academyTopics.js';

// =============================================================================
// NEXUS Diagnostic Scenarios for Themencheck
//
// Troubleshooting-first questions: player derives a cause from symptoms,
// config snippets and show outputs. Each scenario is a single-choice MC
// question with explicit reasoning feedback.
// =============================================================================

export const SCENARIO_ARCHETYPE = 'diagnostic';

function scenario({
  id,
  sourceCategoryId,
  sourceTopicId,
  problem,
  observations = [],
  knownGood = [],
  knownBad = [],
  configSnippet = null,
  showOutput = null,
  suspects = [],
  rootCause,
  question,
  options,
  correct,
  explanation,
  nextCheck = null,
  fix = null,
  reasoning,
  relatedKnowledgeIds = [],
  difficulty = 'medium',
}) {
  const questionText = `
${problem ? `Problem: ${problem}` : ''}
${observations.length ? `Beobachtungen:\n${observations.map((o) => `- ${o}`).join('\n')}` : ''}
${knownGood.length ? `Bekannt gut:\n${knownGood.map((o) => `- ${o}`).join('\n')}` : ''}
${knownBad.length ? `Bekannt schlecht:\n${knownBad.map((o) => `- ${o}`).join('\n')}` : ''}
${configSnippet ? `Config:\n\`\`\`\n${configSnippet}\n\`\`\`` : ''}
${showOutput ? `Output:\n\`\`\`\n${showOutput}\n\`\`\`` : ''}

${question}
  `.trim().replace(/\n{3,}/g, '\n\n');

  return {
    question: questionText,
    options,
    correct,
    explanation,
    sourceTopicId,
    sourceCategoryId,
    semanticKey: `${sourceCategoryId}/${sourceTopicId}/diag:${id}`,
    isDiagnostic: true,
    difficulty,
    diagnostic: {
      id,
      problem,
      observations,
      knownGood,
      knownBad,
      configSnippet,
      showOutput,
      suspects,
      rootCause,
      nextCheck,
      fix,
      reasoning,
      relatedKnowledgeIds,
    },
  };
}

// =============================================================================
// Cisco – Packet Tracer
// =============================================================================

const cisco = {};

function ciscoTopic(topicId, items) {
  cisco[topicKey('cisco-packet-tracer', topicId)] = items;
}

ciscoTopic('router-basics', [
  scenario({
    id: 'interface-admin-down',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'router-basics',
    problem: 'Ein Router-Interface leuchtet nicht und kann kein OSPF-Nachbar werden.',
    observations: ['show ip interface brief zeigt Status administratively down.', 'Kabel ist gesteckt.', 'Switch-Port zeigt Link-Up.'],
    configSnippet: 'interface GigabitEthernet0/0/0\n shutdown',
    question: 'Was ist die wahrscheinlichste Ursache und der schnellste Fix?',
    options: ['Defektes Kabel', 'Falsche IP-Maske', 'Interface ist administrativ deaktiviert', 'Fehlende statische Route'],
    correct: 2,
    explanation: 'Der Befehl shutdown deaktiviert das Interface. no shutdown würde es aktivieren.',
    rootCause: 'Interface ist administrativ deaktiviert.',
    fix: 'no shutdown auf dem Interface.',
    reasoning: 'show ip interface brief zeigt administratively down, was immer bedeutet, dass das Interface per Konfiguration ausgeschaltet wurde.',
    relatedKnowledgeIds: ['cisco.router.noshutdown'],
  }),
]);

ciscoTopic('dhcp', [
  scenario({
    id: 'dhcp-relay-missing',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'dhcp',
    problem: 'Ein Client in VLAN 20 erhält statt einer DHCP-Adresse 169.254.x.x.',
    observations: [
      'Mit statischer IP ist Gateway erreichbar.',
      'Mit statischer IP ist der DHCP-Server erreichbar.',
      'Routing zwischen VLANs funktioniert.',
      'Der DHCP-Server bedient ein anderes Netz erfolgreich.',
    ],
    configSnippet: 'interface GigabitEthernet0/0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0',
    question: 'Was ist die wahrscheinlichste Ursache?',
    options: ['DHCP-Server ist ausgefallen', 'Client-Netzwerkkarte defekt', 'Fehlender oder falscher DHCP Relay', 'Falsches Default-Gateway'],
    correct: 2,
    explanation: 'Da statische Kommunikation klappt, ist Layer-3-Forwarding grundsätzlich vorhanden. DHCP-Discover ist jedoch ein Broadcast und braucht im anderen Netz einen Relay-Agent (ip helper-address).',
    rootCause: 'Fehlender oder falscher DHCP Relay am Gateway des Clientnetzes.',
    fix: 'ip helper-address <DHCP-Server-IP> auf dem Gateway-Interface des Clientnetzes.',
    reasoning: 'Statische Kommunikation klappt, also sind Routing und IP-Konfiguration korrekt. Nur die Broadcast-DHCP-Anfrage kommt nicht ins andere Netz, daher fehlt der Relay.',
    relatedKnowledgeIds: ['cisco.dhcp.relay'],
  }),
  scenario({
    id: 'dhcp-pool-wrong-network',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'dhcp',
    problem: 'Clients in einem bestimmten VLAN erhalten keine Adresse, obwohl ip helper-address konfiguriert ist.',
    observations: ['show ip dhcp pool zeigt keinen Pool für das Clientnetz.', 'Ein Pool existiert nur für ein anderes Subnetz.', 'Requests werden am Router empfangen.'],
    question: 'Was muss als Nächstes geprüft werden?',
    options: ['ip helper-address fehlt', 'DHCP-Pool/Scope für das Clientnetz', 'Default Route', 'NAT-Overload'],
    correct: 1,
    explanation: 'Der Relay leitet die Broadcasts weiter, aber der DHCP-Server muss auch ein gültiges Angebot für das Clientnetz besitzen.',
    rootCause: 'DHCP-Pool oder Scope passt nicht zum Clientnetz.',
    fix: 'Pool für das korrekte Subnetz anlegen oder prüfen.',
    reasoning: 'Der Router leitet Anfragen korrekt weiter, aber der Server kann nur Adressen aus seinem definierten Scope vergeben.',
    relatedKnowledgeIds: ['cisco.dhcp.pool'],
  }),
]);

ciscoTopic('vlan', [
  scenario({
    id: 'wrong-access-vlan',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'vlan',
    problem: 'Ein PC im Büro VLAN 10 erreicht keine Geräte in seinem Netz.',
    observations: ['Der gleiche Port nutzte früher VLAN 20.', 'show vlan brief zeigt switchport access vlan 20.', 'Andere VLAN-10-Ports funktionieren.'],
    configSnippet: 'interface FastEthernet0/1\n switchport mode access\n switchport access vlan 20',
    question: 'Was ist die wahrscheinlichste Ursache?',
    options: ['Falsches Native VLAN', 'Access-Port im falschen VLAN', 'Trunk Allowed falsch', 'Spanning-Tree-Blocking'],
    correct: 1,
    explanation: 'Der Access-Port ist explizit in VLAN 20 konfiguriert, während der Benutzer VLAN 10 erwarten würde.',
    rootCause: 'Access-Port im falschen VLAN.',
    fix: 'switchport access vlan 10 auf dem Port.',
    reasoning: 'Der Port ist korrekt als Access gekennzeichnet, aber die VLAN-Zuordnung ist veraltet.',
    relatedKnowledgeIds: ['cisco.vlan.access'],
  }),
]);

ciscoTopic('trunk', [
  scenario({
    id: 'trunk-allowed-missing',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'trunk',
    problem: 'VLAN 30-Geräte auf Switch A können VLAN-30-Geräte auf Switch B nicht erreichen.',
    observations: ['show interfaces trunk zeigt den Link als trunk.', 'allowed vlan 10,20 ist konfiguriert.', 'VLAN 30 existiert auf beiden Switches.'],
    configSnippet: 'interface FastEthernet0/24\n switchport trunk allowed vlan 10,20',
    question: 'Was ist die wahrscheinlichste Ursache?',
    options: ['VLAN 30 fehlt', 'Trunk ist nicht aktiviert', 'VLAN 30 nicht in allowed list', 'Native VLAN falsch'],
    correct: 2,
    explanation: 'Trunk-Ports leiten nur die VLANs, die in switchport trunk allowed vlan gelistet sind. VLAN 30 ist ausgeschlossen.',
    rootCause: 'VLAN 30 fehlt in der allowed-VLAN-Liste des Trunks.',
    fix: 'switchport trunk allowed vlan add 30.',
    reasoning: 'Der Trunk funktioniert, aber allowed vlan 10,20 blockiert explizit VLAN 30.',
    relatedKnowledgeIds: ['cisco.trunk.allowed'],
  }),
  scenario({
    id: 'native-vlan-mismatch',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'trunk',
    problem: 'Native-VLAN-Datenverkehr zwischen zwei Switches funktioniert nicht.',
    observations: ['CDP meldet Native VLAN mismatch.', 'Switch A nutzt VLAN 1, Switch B VLAN 99.', 'Nur untagged Pakete betroffen.'],
    question: 'Was muss korrigiert werden?',
    options: ['Allowed VLANs anpassen', 'Native VLAN auf beiden Seiten angleichen', 'Access-VLAN wechseln', 'IP-Subnetz prüfen'],
    correct: 1,
    explanation: 'Untagged Pakete werden einem bestimmten Native VLAN zugeordnet. Bei Mismatch landen sie im falschen VLAN.',
    rootCause: 'Native VLAN Mismatch am Trunk.',
    fix: 'Beide Trunk-Seiten auf dieselbe Native VLAN-ID setzen.',
    reasoning: 'CDP warnt explizit. Tagged VLANs funktionieren, nur untagged Native-VLAN-Datenverkehr ist betroffen.',
    relatedKnowledgeIds: ['cisco.trunk.native'],
  }),
]);

ciscoTopic('inter-vlan-routing', [
  scenario({
    id: 'router-on-stick-no-subinterface',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'inter-vlan-routing',
    problem: 'Ein Router-on-a-Stick kann Inter-VLAN-Routing für VLAN 40 nicht anbieten.',
    observations: ['show vlan brief zeigt VLAN 40 existent.', 'Clients in VLAN 40 erhalten Gateway nicht.', 'Nur VLAN 10 und 20 sind auf dem Router konfiguriert.'],
    configSnippet: 'interface GigabitEthernet0/0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0',
    question: 'Was fehlt für VLAN 40?',
    options: ['Trunk-Port', 'Subinterface mit 802.1Q-Encapsulation', 'Switch-VLAN 40', 'DHCP-Pool'],
    correct: 1,
    explanation: 'Für VLAN 40 braucht der Router ein Subinterface mit encapsulation dot1Q 40 und die zugehörige IP.',
    rootCause: 'Fehlendes Subinterface für VLAN 40.',
    fix: 'Subinterface mit 802.1Q-Encapsulation und IP für VLAN 40 anlegen.',
    reasoning: 'VLAN 10 und 20 funktionieren, da ihre Subinterfaces existieren. VLAN 40 hat keine Router-Schnittstelle.',
    relatedKnowledgeIds: ['cisco.intervlan.subinterface'],
  }),
]);

ciscoTopic('static-routing', [
  scenario({
    id: 'missing-static-route',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'static-routing',
    problem: 'Ein Router kann ein entferntes Netz nicht erreichen.',
    observations: ['show ip route zeigt keinen Eintrag für 10.2.0.0/16.', 'Nexthop 10.1.1.2 ist erreichbar.', 'Ping zum Nexthop klappt.'],
    configSnippet: 'ip route 10.1.0.0 255.255.0.0 10.1.1.2',
    question: 'Was ist die wahrscheinlichste Ursache?',
    options: ['Nexthop defekt', 'Fehlende Route für 10.2.0.0/16', 'Interface-Shutdown', 'Falsche IP-Maske'],
    correct: 1,
    explanation: 'Ping zum Nexthop zeigt, dass der direkte Nachbar erreichbar ist. show ip route fehlt ein Eintrag für das Zielnetz.',
    rootCause: 'Route für das Zielnetz fehlt oder ist falsch.',
    fix: 'Statische Route 10.2.0.0 255.255.0.0 <Nexthop> hinzufügen.',
    reasoning: 'Nexthop erreichbar, aber Routingtabelle kennt Zielnetz nicht.',
    relatedKnowledgeIds: ['cisco.routing.static'],
  }),
  scenario({
    id: 'wrong-default-route',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'static-routing',
    problem: 'Ein Host im Netz kann weder 8.8.8.8 noch das Internet erreichen.',
    observations: ['show ip route zeigt Gateway of last resort is not set.', 'Lokale Netze sind erreichbar.', 'Der Router hat keine spezifischen Internetrouten.'],
    question: 'Was fehlt?',
    options: ['Eine Default Route', 'Eine ACL', 'Ein DHCP-Relay', 'Ein VLAN-Trunk'],
    correct: 0,
    explanation: 'Ohne Default Route oder Gateway of Last Resort kann der Router Pakete für unbekannte Netze nicht weiterleiten.',
    rootCause: 'Fehlende Default Route.',
    fix: 'ip route 0.0.0.0 0.0.0.0 <Internet-Gateway> eintragen.',
    reasoning: 'Lokale Netze funktionieren, aber externe Ziele scheitern, weil kein Fallback-Route existiert.',
    relatedKnowledgeIds: ['cisco.routing.default'],
  }),
]);

ciscoTopic('acl', [
  scenario({
    id: 'acl-too-broad-deny',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'acl',
    problem: 'Ein Host aus dem Management-Netz kann plötzlich keine SSH-Verbindungen mehr zu Servern aufbauen.',
    observations: ['show access-lists enthält: deny tcp 10.0.0.0 0.255.255.255 any eq 22', 'Permit-Regel für Management-VLAN 10 kommt danach.', 'Router hinter dem Host blockiert.'],
    configSnippet: 'access-list 101 deny tcp 10.0.0.0 0.255.255.255 any eq 22\naccess-list 101 permit ip 10.10.0.0 0.0.255.255 any',
    question: 'Was ist das Problem?',
    options: ['ACL in falsche Richtung angewendet', 'Deny-Regel ist zu breit und greift vor Permit', 'SSH-Port falsch', 'Quellnetz der Permit-Regel passt nicht'],
    correct: 1,
    explanation: 'Die Deny-Regel mit Wildcard 0.255.255.255 trifft alle 10.x-Netze, also auch das Management-VLAN, bevor die Permit-Regel wirken kann.',
    rootCause: 'Deny-Regel zu breit und steht vor der Permit-Regel.',
    fix: 'Deny-Regel präzisieren oder Permit-Regel vorziehen.',
    reasoning: 'ACLs werden top-down ausgewertet. Eine zu breite Deny-Regel blockiert erlaubten Verkehr.',
    relatedKnowledgeIds: ['cisco.acl.order'],
  }),
]);

ciscoTopic('stp', [
  scenario({
    id: 'stp-blocked-port',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'stp',
    problem: 'Ein Switch-Port zeigt keinen Datenverkehr, obwohl der Link physikalisch oben ist.',
    observations: ['show spanning-tree zeigt Alternate/Blocking.', 'Andere Ports in VLAN 1 sind Forwarding.', 'Kein Kabel- oder Duplex-Problem.'],
    question: 'Was ist die wahrscheinlichste Erklärung?',
    options: ['Port ist administrativ down', 'STP blockiert den Port, um Schleifen zu vermeiden', 'VLAN fehlt', 'ACL filtert'],
    correct: 1,
    explanation: 'Spanning Tree blockiert redundant wirkende Ports, um Layer-2-Schleifen zu verhindern.',
    rootCause: 'STP hat den Port als Alternate/Blocking markiert.',
    fix: 'Topologie prüfen oder PortFast für Endgeräte-Ports aktivieren.',
    reasoning: 'Physikalisch up, aber spanning-tree zeigt blocking. Das ist normales STP-Verhalten.',
    relatedKnowledgeIds: ['cisco.stp.blocking'],
  }),
]);

ciscoTopic('nat', [
  scenario({
    id: 'nat-inside-outside-mismatch',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'nat',
    problem: 'Interne Clients können keine Verbindungen ins Internet aufbauen, obwohl PAT konfiguriert ist.',
    observations: ['show ip nat translations ist leer.', 'Interface zum LAN ist als outside markiert.', 'Interface zum Internet ist als inside markiert.'],
    configSnippet: 'interface GigabitEthernet0/0/0\n ip nat outside\ninterface GigabitEthernet0/0/1\n ip nat inside',
    question: 'Was ist das Problem?',
    options: ['ACL fehlt', 'PAT-Pool erschöpft', 'inside/outside-Interfaces sind vertauscht', 'Default Route fehlt'],
    correct: 2,
    explanation: 'NAT braucht die korrekte inside/outside-Zuordnung. Hier ist sie vertauscht.',
    rootCause: 'inside/outside-Interfaces bei NAT vertauscht.',
    fix: 'ip nat inside am LAN-Interface, ip nat outside am Internet-Interface.',
    reasoning: 'Ohne korrekte Zuordnung weiß NAT nicht, welche Adressen übersetzt werden sollen.',
    relatedKnowledgeIds: ['cisco.nat.insideoutside'],
  }),
]);

// =============================================================================
// Active Directory / Windows
// =============================================================================

const ad = {};

function adTopic(topicId, items) {
  ad[topicKey('active-directory-virtualbox', topicId)] = items;
}

adTopic('ad-foundation', [
  scenario({
    id: 'site-wrong-subnet',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-foundation',
    problem: 'Ein Client aus der Niederlassung Pöcking wird regelmäßig einem DC in Lechfeld zugeordnet.',
    observations: ['Client-IP 10.10.20.0/24.', 'Site Pöcking hat nur 10.10.10.0/24 hinterlegt.', 'Lechfeld ist 10.10.0.0/16 zugeordnet.'],
    question: 'Was ist die wahrscheinlichste Ursache?',
    options: ['Subnet-to-Site-Mapping fehlt/ist falsch', 'Site Link Down', 'Replikation abgebrochen', 'DC in Pöcking ausgefallen'],
    correct: 0,
    explanation: 'Jedes Subnetz muss einer Site zugeordnet sein. Fehlt das, greift die übergeordnete Zuordnung und wählt möglicherweise einen DC in Lechfeld.',
    rootCause: 'Falsches oder fehlendes Subnet-to-Site-Mapping.',
    fix: 'Subnetz 10.10.20.0/24 korrekt der Site Pöcking zuweisen.',
    reasoning: 'Die IP des Clients wird anhand des Subnetz-Mappings einer Site zugeordnet. Ist das falsch, wählt der Client den falschen DC.',
    relatedKnowledgeIds: ['ad.sites.subnet'],
  }),
]);

adTopic('ad-groups', [
  scenario({
    id: 'group-nesting-unexpected-access',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-groups',
    problem: 'S1-Offiziere greifen plötzlich auf S6-Ressourcen zu.',
    observations: ['S1-User ist Mitglied der Global Group G_S1.', 'G_S1 ist Mitglied der Domain Local Group DL_S6_RW.'],
    question: 'Warum haben S1-Benutzer Zugriff auf S6?',
    options: ['Falsche OU', 'G_S1 wurde in DL_S6_RW verschachtelt', 'S1-Benutzer hat persönliche Admin-Rechte', 'DNS-Problem'],
    correct: 1,
    explanation: 'Durch die Verschachtelung G_S1 → DL_S6_RW erben alle G_S1-Mitglieder die Berechtigungen der Domain Local Group auf S6-Ressourcen.',
    rootCause: 'Falsche Gruppenverschachtelung.',
    fix: 'Gruppenmitgliedschaft G_S1 aus DL_S6_RW entfernen.',
    reasoning: 'Gruppenmitgliedschaften aggregieren effektive Rechte. Eine falsche Verschachtelung führt zu unerwartetem Zugriff.',
    relatedKnowledgeIds: ['ad.groups.verschachtelung'],
  }),
]);

adTopic('ntfs-permissions', [
  scenario({
    id: 'share-vs-ntfs-restricted',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ntfs-permissions',
    problem: 'Ein Benutzer greift über das Netzwerk auf einen Ordner zu und kann nicht schreiben.',
    observations: ['NTFS-Berechtigung: Modify.', 'Share-Berechtigung: Read.', 'Lokale NTFS-Interaktion erlaubt Schreiben.'],
    question: 'Warum scheitert Schreiben über das Netzwerk?',
    options: ['NTFS verbietet Schreiben', 'Share-Berechtigung begrenzt Netzwerkzugriff', 'Benutzer nicht in lokaler Gruppe', 'Offlinedateien aktiv'],
    correct: 1,
    explanation: 'Beim Zugriff über das Netzwerk ist die effektive Berechtigung das restriktivere Ergebnis aus Share- und NTFS-Rechten.',
    rootCause: 'Share-Berechtigung ist auf Read begrenzt.',
    fix: 'Share-Berechtigung auf Change/Full Control erweitern.',
    reasoning: 'Netzwerkzugriff = Share ∩ NTFS. NTFS erlaubt Modify, aber Share erlaubt nur Read, also ist effektiv nur Read.',
    relatedKnowledgeIds: ['ad.permissions.sharentfs'],
  }),
  scenario({
    id: 'share-full-ntfs-read',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ntfs-permissions',
    problem: 'Share Full Control + NTFS Read. Was ist der effektive Netzwerkzugriff?',
    observations: ['Share: Full Control.', 'NTFS: Read.'],
    question: 'Welcher effektive Zugriff gilt?',
    options: ['Full Control', 'Read', 'Modify', 'Kein Zugriff'],
    correct: 1,
    explanation: 'Das restriktivere Recht gewinnt. NTFS erlaubt nur Read.',
    rootCause: 'NTFS ist restriktiver als Share.',
    fix: 'NTFS-Berechtigung anpassen, falls Schreibzugriff gewollt.',
    reasoning: 'Share und NTFS werden kombiniert, NTFS ist hier der Engpass.',
    relatedKnowledgeIds: ['ad.permissions.effective'],
  }),
]);

adTopic('ad-replication-sites', [
  scenario({
    id: 'site-link-schedule',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-replication-sites',
    problem: 'Änderungen in Site Pöcking treffen in Site Lechfeld erst mit großer Verzögerung ein.',
    observations: ['showip route zeigt Erreichbarkeit.', 'Site Link hat Schedule außerhalb der Bürozeiten.', 'Cost ist niedrig.'],
    question: 'Was ist die wahrscheinlichste Ursache?',
    options: ['Site Link fehlt', 'Site Link Schedule erlaubt nur bestimmte Zeiten', 'Subnet-Mapping falsch', 'DNS-Problem'],
    correct: 1,
    explanation: 'Der Site Link existiert, aber sein Schedule begrenzt die Replikation auf bestimmte Zeiträume.',
    rootCause: 'Site Link Schedule ist restriktiv.',
    fix: 'Schedule auf Geschäftszeiten erweitern.',
    reasoning: 'Erreichbarkeit ist gegeben, also ist der Link vorhanden. Zeitverzögerungen deuten auf einen eingeschränkten Schedule hin.',
    relatedKnowledgeIds: ['ad.replication.schedule'],
  }),
]);

adTopic('ad-replication-practice', [
  scenario({
    id: 'recycle-bin-restore',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-replication-practice',
    problem: 'Ein Benutzer hat ein AD-Objekt versehentlich gelöscht.',
    observations: ['AD-Recycle Bin ist aktiviert.', 'Objekt ist in Deleted Objects sichtbar.', 'LDP.exe / ADAC kann darauf zugreifen.'],
    question: 'Wie kann das Objekt am schnellsten originalgetreu wiederhergestellt werden?',
    options: ['Authoritative Restore', 'AD-Recycle Bin Restore', 'Neuanlegen', 'Systemzustands-Restore'],
    correct: 1,
    explanation: 'Wenn der AD-Recycle Bin aktiviert ist, lässt sich das Objekt über den Papierkorb wiederherstellen, ohne Authoritative Restore.',
    rootCause: 'Löschung kann via AD-Recycle Bin rückgängig gemacht werden.',
    fix: 'Objekt in Deleted Objects markieren und Restore oder Restore To ausführen.',
    reasoning: 'Recycle Bin behält Attribute und Link-Informationen bei, Systemzustands-Restore wäre viel aufwendiger.',
    relatedKnowledgeIds: ['ad.recyclebin.restore'],
  }),
]);

adTopic('ad-group-policy-basics', [
  scenario({
    id: 'gpo-link-target',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-group-policy-basics',
    problem: 'Eine GPO soll für alle Computer in der OU IT gelten, greift aber auch für Helpdesk-Computer.',
    observations: ['GPO ist an OU IT verknüpft.', 'Helpdesk-OU ist eine Child-OU von IT.', 'Keine Sicherheitsfilterung konfiguriert.'],
    question: 'Warum greift die GPO für Helpdesk-Computer?',
    options: ['GPO falsch verknüpft', 'Vererbung wirkt auf Child-OUs', 'DNS-Problem', 'Replikation verzögert'],
    correct: 1,
    explanation: 'GPOs wirken auf die verknüpfte OU und standardmäßig auch auf alle darunter liegenden OUs.',
    rootCause: 'Vererbung der GPO auf Child-OUs.',
    fix: 'GPO direkt an Ziel-OU verknüpfen oder Vererbung blockieren.',
    reasoning: 'Verknüpfung an einer übergeordneten OU bewirkt, dass Child-OU-Objekte die Richtlinie ebenfalls anwenden.',
    relatedKnowledgeIds: ['ad.gpo.link'],
  }),
]);

// =============================================================================
// Linux
// =============================================================================

const linux = {};

function linuxTopic(topicId, items) {
  linux[topicKey('linux-virtualbox', topicId)] = items;
}

linuxTopic('permissions', [
  scenario({
    id: 'file-owner-no-read',
    sourceCategoryId: 'linux-virtualbox',
    sourceTopicId: 'permissions',
    problem: 'Nutzer admin1 kann backup.sh nicht lesen.',
    observations: ['ls -l zeigt: -rw------- 1 root root 824 backup.sh.', 'admin1 gehört der Gruppe root nicht an.'],
    question: 'Warum scheitert der Lesezugriff?',
    options: ['Datei ist nicht ausführbar', 'Owner ist root, admin1 ist Other ohne Rechte', 'Verzeichnis fehlt', 'SELinux blockiert'],
    correct: 1,
    explanation: 'rw------- bedeutet: Owner root darf lesen/schreiben, Group und Other haben keine Rechte. admin1 ist Other.',
    rootCause: 'Rechte im Other-Bereich fehlen.',
    fix: 'chown oder chmod o+r anwenden, je nach gewünschtem Szenario.',
    reasoning: 'Die Permission-Bits zeigen, dass nur root Lesezugriff hat. Andere Benutzer sind Other ohne r.',
    relatedKnowledgeIds: ['linux.permissions.rwx'],
  }),
]);

linuxTopic('networking', [
  scenario({
    id: 'dns-vs-connectivity',
    sourceCategoryId: 'linux-virtualbox',
    sourceTopicId: 'networking',
    problem: 'ping 8.8.8.8 funktioniert, ping server.example nicht.',
    observations: ['IP-Konnektivität vorhanden.', 'Hostname-Auflösung für server.example scheitert.', '/etc/resolv.conf zeigt einen falschen DNS-Server.'],
    question: 'Was ist die wahrscheinlichste Ursache?',
    options: ['Default Gateway falsch', 'DNS-Resolver falsch', 'Firewall blockiert ICMP', 'Netzwerkkabel defekt'],
    correct: 1,
    explanation: 'IP-Konnektivität klappt, aber Namensauflösung scheitert. Das zeigt auf ein DNS-Problem.',
    rootCause: 'DNS-Resolver in /etc/resolv.conf falsch.',
    fix: 'Korrekten DNS-Server eintragen.',
    reasoning: 'ping IP funktioniert → Layer-3 okay. ping Hostname scheitert → DNS nicht funktionsfähig.',
    relatedKnowledgeIds: ['linux.networking.dns'],
  }),
]);

// =============================================================================
// Information Security
// =============================================================================

const infosec = {};

function infosecTopic(topicId, items) {
  infosec[topicKey('information-security', topicId)] = items;
}

infosecTopic('security-fundamentals', [
  scenario({
    id: 'least-privilege-helpdesk',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-fundamentals',
    problem: 'Der Helpdesk-Dienstleister bekommt für gelegentliche Passwort-Resets Domain-Admin-Rechte.',
    observations: ['Tätigkeit erfordert nur Passwort-Reset.', 'Dauerhafte Domain-Admin-Rechte werden vergeben.', 'Audit zeigt unnötigen Administratorzugriff.'],
    question: 'Welches Prinzip ist verletzt?',
    options: ['Verfügbarkeit', 'Least Privilege', 'Defense in Depth', 'Trennungsgrundsatz'],
    correct: 1,
    explanation: 'Least Privilege besagt, dass ein Benutzer nur die minimal nötigen Rechte erhalten soll. Domain-Admin ist hier völlig überdimensioniert.',
    rootCause: 'Verletzung des Least-Privilege-Prinzips.',
    fix: 'Delegation für Passwort-Reset vergeben, Domain-Admin-Rechte entziehen.',
    reasoning: 'Für Passwort-Resets reicht eine delegierte Berechtigung auf dem OU-Ebene, nicht Domain-Admin.',
    relatedKnowledgeIds: ['infosec.leastprivilege'],
  }),
  scenario({
    id: 'cia-availability',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-fundamentals',
    problem: 'Ein Serverraum überhitzt, mehrere Systeme fallen aus.',
    observations: ['Hardware thermisch beschädigt.', 'Keine redundante Kühlung.', 'Daten sind nicht verloren.'],
    question: 'Welcher Schutzziel-Bereich ist primär betroffen?',
    options: ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Authentizität'],
    correct: 2,
    explanation: 'Überhitzung führt zu Ausfällen. Verfügbarkeit ist das Schutzziel, das betroffen ist.',
    rootCause: 'Mangelnde Verfügbarkeitssicherung.',
    fix: 'Redundante Kühlung, Temperaturüberwachung, Not-Aus-Verfahren.',
    reasoning: 'Systeme stehen nicht zur Verfügung. Daten sind intakt, also primär Verfügbarkeit.',
    relatedKnowledgeIds: ['infosec.cia.availability'],
  }),
]);

infosecTopic('security-threats-malware', [
  scenario({
    id: 'threat-vs-vulnerability',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-threats-malware',
    problem: 'Ungepatchte Software führt dazu, dass ein Angreifer Code aus der Ferne ausführt.',
    observations: ['Bekannte Sicherheitslücke vorhanden.', 'Kein Patch eingespielt.', 'Angreifer nutzt die Lücke aus.'],
    question: 'Was ist die Lücke und was ist die ausnutzende Entität?',
    options: ['Vulnerability = Lücke, Threat = Angreifer', 'Vulnerability = Angreifer, Threat = Lücke', 'Risk = Angreifer, Control = Lücke', 'Threat = Patch, Vulnerability = Antivirus'],
    correct: 0,
    explanation: 'Eine Vulnerability ist die Schwachstelle, eine Threat ist die potenzielle Gefahr bzw. der Akteur, der die Lücke ausnutzen kann.',
    rootCause: 'Vorhandene Schwachstelle wurde nicht geschlossen.',
    fix: 'Patch-Management etablieren.',
    reasoning: 'Vulnerability = Zustand, Threat = mögliche Schadensursache/Akteur.',
    relatedKnowledgeIds: ['infosec.threat.vulnerability'],
  }),
]);

infosecTopic('security-technical-measures', [
  scenario({
    id: 'control-sensible',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-technical-measures',
    problem: 'In einem öffentlichen Zugangsbereich sollen sensible Daten nicht einsehbar sein.',
    observations: ['Monitore sind für jeden sichtbar.', 'Passwörter werden auf Post-its notiert.', 'Papierdokumente liegen herum.'],
    question: 'Welche Maßnahme passt am besten?',
    options: ['Pentesting', 'Zutritts- und Clean-Desk-Policy', 'Vollständige Netzwerksegmentierung', 'Public Key Infrastructure'],
    correct: 1,
    explanation: 'Clean Desk und Zutrittskontrolle verhindern, dass Unbefugte sensible Daten physisch einsehen.',
    rootCause: 'Physische Angriffsoberfläche.',
    fix: 'Clean-Desk-Policy, Sichtschutz, Verschlossene Schränke.',
    reasoning: 'Szenario beschreibt ein physisches Expositionsproblem, kein Netzwerk- oder PKI-Problem.',
    relatedKnowledgeIds: ['infosec.technical.physical'],
  }),
]);

// =============================================================================
// Registry export
// =============================================================================

const DIAGNOSTIC_SCENARIOS = { ...cisco, ...ad, ...linux, ...infosec };

export function getDiagnosticScenariosForTopic(categoryId, topicId) {
  return DIAGNOSTIC_SCENARIOS[topicKey(categoryId, topicId)] || [];
}

export function getAllDiagnosticScenarios() {
  return Object.values(DIAGNOSTIC_SCENARIOS).flat();
}

export function getDiagnosticScenariosForCategory(categoryId) {
  return getAllDiagnosticScenarios().filter((s) => s.sourceCategoryId === categoryId);
}
