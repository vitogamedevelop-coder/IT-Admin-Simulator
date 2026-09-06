import { topicKey } from './academyTopics.js';
import { shuffleInPlace } from './random.js';

export function shuffleOptions(question, rng) {
  const isMulti = question.type === 'multi-select';
  const correctSet = isMulti
    ? new Set(question.correctIndices || [])
    : new Set([question.correct]);
  const indexed = question.options.map((opt, i) => ({ opt, isCorrect: correctSet.has(i) }));
  shuffleInPlace(rng, indexed);
  if (isMulti) {
    return {
      ...question,
      options: indexed.map((x) => x.opt),
      correctIndices: indexed.map((x, i) => (x.isCorrect ? i : -1)).filter((i) => i !== -1),
    };
  }
  return {
    ...question,
    options: indexed.map((x) => x.opt),
    correct: indexed.findIndex((x) => x.isCorrect),
  };
}

// =============================================================================
// Multi-Select Themencheck Questions
//
// Each item: question, options, correctIndices, explanation, sourceTopicId,
// sourceCategoryId, semanticKey, type: 'multi-select', difficulty.
//
// Criteria:
// - >= 2 correct indices
// - >= 1 incorrect index
// - >= 3 options
// - 4–6 options preferred
// - no "all" or "none" options
// - options are not exact duplicates
// =============================================================================

function multiSelect({
  id,
  sourceCategoryId,
  sourceTopicId,
  question,
  options,
  correctIndices,
  explanation,
  relatedKnowledgeIds = [],
  difficulty = 'medium',
}) {
  if (!Array.isArray(correctIndices) || correctIndices.length < 1) {
    throw new Error(`multi-select ${id}: needs at least 2 correct indices`);
  }
  if (options.length < 3) {
    throw new Error(`multi-select ${id}: needs at least 3 options`);
  }
  if (correctIndices.length >= options.length) {
    throw new Error(`multi-select ${id}: cannot have all options correct`);
  }
  if (new Set(options).size !== options.length) {
    throw new Error(`multi-select ${id}: duplicate options`);
  }
  return {
    question,
    options,
    correctIndices,
    explanation,
    sourceTopicId,
    sourceCategoryId,
    semanticKey: `${sourceCategoryId}/${sourceTopicId}/ms:${id}`,
    type: 'multi-select',
    difficulty,
    isMultiSelect: true,
    relatedKnowledgeIds,
  };
}

// =============================================================================
// Cisco
// =============================================================================

const cisco = {};

function ciscoTopic(topicId, items) {
  cisco[topicKey('cisco-packet-tracer', topicId)] = items;
}

ciscoTopic('trunk', [
  multiSelect({
    id: 'trunk-verification',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'trunk',
    question: 'Eine VLAN 30-Verbindung über einen Trunk scheitert. show interfaces trunk zeigt, dass VLAN 10, 20 erlaubt sind. Was solltest du prüfen?',
    options: ['Ist VLAN 30 in der allowed list?', 'Stimmt das Native VLAN auf beiden Enden?', 'Ist der Trunk-Port als access konfiguriert?', 'Ist der DHCP-Server erreichbar?'],
    correctIndices: [0, 1],
    explanation: 'Für Trunking sind allowed-VLAN-Liste und Native-VLAN-Übereinstimmung entscheidend. Access-Mode wäre ein anderes Problem; DHCP hat hier nichts mit dem Trunk zu tun.',
    relatedKnowledgeIds: ['cisco.trunk.allowed', 'cisco.trunk.native'],
  }),
]);

ciscoTopic('router-basics', [
  multiSelect({
    id: 'interface-down-checks',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'router-basics',
    question: 'Ein Router-Interface zeigt administratively down. show ip interface brief meldet down/down. Welche Prüfungen sind sinnvoll?',
    options: ['Interface-Status: shutdown?', 'Kabelverbindung prüfen', 'IP-Adresse und Subnetzmaske prüfen', 'Spanning-Tree-Root-Bidge prüfen'],
    correctIndices: [0, 1, 2],
    explanation: 'administratively down bedeutet ein Konfigurationsproblem (shutdown) oder fehlende Verbindung. IP und Kabel sind ebenfalls plausibel; STP spielt auf Router-Interfaces keine Rolle.',
    relatedKnowledgeIds: ['cisco.router.noshutdown', 'cisco.router.ipmask'],
  }),
]);

ciscoTopic('dhcp', [
  multiSelect({
    id: 'dhcp-apipa-checks',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'dhcp',
    question: 'Ein Client erhält 169.254.x.x. Mit statischer IP ist das Gateway und der DHCP-Server erreichbar. Routing funktioniert. Was sind sinnvolle nächste Prüfungen?',
    options: ['ip helper-address am Client-Gateway', 'DHCP-Scope für das Clientnetz', 'STP-Portfast am Access-Port', 'DNS-A-Record des Clients'],
    correctIndices: [0, 1],
    explanation: 'APIPA bedeutet, dass der Client keine DHCP-Antwort bekommt. Wenn der Server remote ist, braucht der Router ip helper-address; außerdem muss ein Scope für das Clientnetz existieren. DNS-A-Record und STP-Portfast erklären nicht den Fehler.',
    relatedKnowledgeIds: ['cisco.dhcp.relay', 'cisco.dhcp.pool'],
  }),
  multiSelect({
    id: 'dhcp-failures',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'dhcp',
    question: 'Ein Client bekommt gar keine IP. show ip dhcp pool zeigt, dass der einzig vorhandene Scope 172.16.0.0/24 ist. Client ist in 10.1.1.0/24. Was könnte die Ursache sein?',
    options: ['Fehlender DHCP-Scope für 10.1.1.0/24', 'ip helper-address fehlt am Router', 'Default-Route im Clientnetz fehlt', 'VLAN ist gelöscht'],
    correctIndices: [0, 1],
    explanation: 'Der Server braucht einen Scope für das Clientnetz. Wenn der Server remote ist, braucht der Router auch ip helper-address. Default-Route und gelöschtes VLAN sind anhand des Outputs nicht gestützt.',
    relatedKnowledgeIds: ['cisco.dhcp.scope', 'cisco.dhcp.relay'],
  }),
]);

ciscoTopic('static-routing', [
  multiSelect({
    id: 'routing-diagnosis',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'static-routing',
    question: 'Ein Router kann ein entferntes Netz nicht erreichen. ping zum Next-Hop klappt. Was sind sinnvolle Prüfungen?',
    options: ['Ist eine Route für das Zielnetz vorhanden?', 'Ist die Next-Hop-IP in einem erreichbaren Subnetz?', 'Ist der Next-Hop ein DHCP-Server?', 'Ist die Default Route korrekt?'],
    correctIndices: [0, 1, 3],
    explanation: 'Wenn der Next-Hop erreichbar ist, fehlt wahrscheinlich eine passende Route. Die Default Route kann ebenfalls relevant sein. Ob der Next-Hop ein DHCP-Server ist, spielt für Routing nicht.',
    relatedKnowledgeIds: ['cisco.routing.static', 'cisco.routing.default'],
  }),
]);

ciscoTopic('inter-vlan-routing', [
  multiSelect({
    id: 'inter-vlan-missing',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'inter-vlan-routing',
    question: 'Clients in VLAN 50 können ihr Gateway nicht erreichen. show ip route zeigt keine Route für 10.5.0.0/16. Was ist sinnvoll?',
    options: ['Subinterface für VLAN 50 anlegen', ' encapsulation dot1Q 50', 'DHCP-Relay auf dem Subinterface', 'IPv6 auf dem Subinterface aktivieren'],
    correctIndices: [0, 1],
    explanation: 'Für Inter-VLAN-Routing braucht es ein Subinterface und eine 802.1Q-Encapsulation für das jeweilige VLAN. DHCP-Relay und IPv6 sind an dieser Stelle nicht zwingend.',
    relatedKnowledgeIds: ['cisco.intervlan.subinterface'],
  }),
]);

ciscoTopic('acl', [
  multiSelect({
    id: 'acl-troubleshooting',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'acl',
    question: 'Eine ACL blockiert mehr Verkehr als gewollt. Welche Punkte prüfst du?',
    options: ['Reihenfolge der ACEs', 'Wildcard-Masken', 'Richtung der Anwendung (in/out)', 'STP-Port-Status'],
    correctIndices: [0, 1, 2],
    explanation: 'ACLs arbeiten top-down, benutzen Wildcard-Masken und müssen in die richtige Richtung (inbound/outbound) am Interface angewendet werden. STP hat nichts mit ACLs zu tun.',
    relatedKnowledgeIds: ['cisco.acl.order', 'cisco.acl.wildcard'],
  }),
]);

ciscoTopic('stp', [
  multiSelect({
    id: 'stp-observations',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'stp',
    question: 'Ein Port ist im STP-Status blocking/alternate. Was sind plausible Interpretationen?',
    options: ['Der Port verhindert eine Layer-2-Schleife.', 'Der Port ist Teil einer redundanten Topologie.', 'Der Port hat kein physisches Link.', 'Der Port darf keinen Datenverkehr weiterleiten.'],
    correctIndices: [0, 1, 3],
    explanation: 'Blocking/Alternate sind normale STP-Zustände, um Schleifen zu vermeiden. Ein physisches Link-Problem würde nicht durch STP, sondern durch Link-Down gemeldet.',
    relatedKnowledgeIds: ['cisco.stp.blocking', 'cisco.stp.redundancy'],
  }),
]);

ciscoTopic('nat', [
  multiSelect({
    id: 'nat-pat-checks',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'nat',
    question: 'Internetzugriff über PAT scheitert. show ip nat translations ist leer. Was prüfst du?',
    options: ['Sind inside/outside-Interfaces richtig?', 'Ist das zu übersetzende Netz im NAT-Statement?', 'Ist ein DHCP-Scope verfügbar?', 'Sind ACL-Matches für das inside-Netz vorhanden?'],
    correctIndices: [0, 1, 3],
    explanation: 'PAT braucht korrekte inside/outside-Zuordnung, ein passendes inside-Netz und üblicherweise eine ACL, die den zu übersetzenden Verkehr matcht. DHCP-Scope hat keinen Einfluss auf PAT.',
    relatedKnowledgeIds: ['cisco.nat.insideoutside', 'cisco.nat.acl'],
  }),
]);

ciscoTopic('packet-filter', [
  multiSelect({
    id: 'packet-filter-order',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'packet-filter',
    question: 'Eine Paketfilter-Regel blockiert erlaubten Verkehr. Welche Fehler sind typisch?',
    options: ['Deny-Regel steht vor einer Permit-Regel', 'Wildcard-Maske ist zu groß', 'ACL ist am falschen Interface angewendet', 'RIPv2 ist deaktiviert'],
    correctIndices: [0, 1, 2],
    explanation: 'Paketfilter arbeiten sequenziell. Eine zu breite Deny-Regel, falsche Wildcard-Maske oder falsche Interface-Richtung führen zu unbeabsichtigtem Blockieren. RIPv2 ist irrelevant.',
    relatedKnowledgeIds: ['cisco.acl.order', 'cisco.acl.wildcard'],
  }),
]);

ciscoTopic('basic-device-configuration', [
  multiSelect({
    id: 'basic-ssh-security',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'basic-device-configuration',
    question: 'SSH-Zugriff auf einen Switch sollte sicher eingerichtet werden. Was sollte geprüft sein?',
    options: ['Domain-Name konfiguriert', 'Crypto-Key vorhanden', 'VTY-Lines transport input ssh', 'HTTP-Server deaktiviert'],
    correctIndices: [0, 1, 2],
    explanation: 'Für SSH braucht der Router einen Domain-Namen, RSA-Crypto-Keys und transport input ssh auf den VTY-Lines. HTTP-Server ist ein separates Thema.',
    relatedKnowledgeIds: ['cisco.ssh.keys', 'cisco.ssh.vty'],
  }),
]);

// =============================================================================
// AD / Windows
// =============================================================================

const ad = {};

function adTopic(topicId, items) {
  ad[topicKey('active-directory-virtualbox', topicId)] = items;
}

adTopic('ad-groups', [
  multiSelect({
    id: 'ad-group-troubleshooting',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-groups',
    question: 'Benutzer aus S1 bekommen unerwartet Zugriff auf S6-Ressourcen. Welche Konfigurationen könnten das erklären?',
    options: ['Benutzer ist direkt Mitglied einer S6-Gruppe', 'S1-Global-Gruppe ist Mitglied einer S6-Domain-Local-Gruppe', 'Site Link Cost ist zu niedrig', 'AGDLP-Kette wurde falsch verkettet'],
    correctIndices: [0, 1, 3],
    explanation: 'Direkte Mitgliedschaften, falsche Gruppenverschachtelung und fehlerhafte AGDLP-Ketten können zu unerwarteten Berechtigungen führen. Site-Link-Cost beeinflusst Replikation, nicht Zugriff.',
    relatedKnowledgeIds: ['ad.groups.verschachtelung', 'ad.groups.agdlp'],
  }),
]);

adTopic('ntfs-permissions', [
  multiSelect({
    id: 'effective-net-permissions',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ntfs-permissions',
    question: 'Share-Berechtigung = Full Control, NTFS = Read. Was trifft für Netzwerkzugriff zu?',
    options: ['Über Netzwerk ist nur Lesen möglich', 'Lokaler Zugriff ist Read', 'Share Full Control hebt NTFS Read auf', 'NTFS ist der einschränkendere Faktor'],
    correctIndices: [0, 1, 3],
    explanation: 'Netzwerkzugriff = Share ∩ NTFS. NTFS ist restriktiver, also gilt Read. Lokal ebenfalls NTFS. Share Full Control wird durch NTFS eingeschränkt.',
    relatedKnowledgeIds: ['ad.permissions.sharentfs', 'ad.permissions.effective'],
  }),
  multiSelect({
    id: 'ntfs-share-modify',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ntfs-permissions',
    question: 'NTFS = Modify, Share = Read. Was sind korrekte Aussagen?',
    options: ['Netzwerkzugriff erlaubt Schreiben', 'Netzwerkzugriff ist auf Read begrenzt', 'Lokaler Zugriff erlaubt Modify', 'Share-Berechtigung hebt NTFS Modify auf'],
    correctIndices: [1, 2],
    explanation: 'Beim Netzwerkzugriff ist die Share-Berechtigung der Engpass, also nur Read. Lokal gilt NTFS Modify.',
    relatedKnowledgeIds: ['ad.permissions.sharentfs'],
  }),
]);

adTopic('ad-user-profiles', [
  multiSelect({
    id: 'profile-path-considerations',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-user-profiles',
    question: 'Ein Roaming-Profile wird nicht korrekt geladen. Was sind sinnvolle Prüfungen?',
    options: ['Ist der Profilpfad erreichbar?', 'Ist der Benutzer lokal angemeldet?', 'Sind NTFS-Rechte auf dem Profilordner korrekt?', 'Ist der DNS-Server erreichbar?'],
    correctIndices: [0, 2, 3],
    explanation: 'Roaming-Profile brauchen einen erreichbaren Profilpfad, korrekte Berechtigungen und DNS-Namensauflösung. Lokale Anmeldung ist irrelevant, da es sich um ein Domänenprofil handelt.',
    relatedKnowledgeIds: ['ad.profiles.path', 'ad.profiles.permissions'],
  }),
]);

adTopic('ad-replication-sites', [
  multiSelect({
    id: 'replication-checks',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-replication-sites',
    question: 'Replikation zwischen zwei Sites ist langsam. Was sind sinnvolle Prüfungen?',
    options: ['Site Link Cost', 'Site Link Schedule', 'Subnet-to-Site-Mapping', 'DHCP Lease-Time'],
    correctIndices: [0, 1, 2],
    explanation: 'Kosten, Zeitplan und Subnet-Mapping beeinflussen AD-Replikation. DHCP Lease-Time hat damit nichts zu tun.',
    relatedKnowledgeIds: ['ad.replication.schedule', 'ad.replication.cost'],
  }),
]);

adTopic('ad-foundation', [
  multiSelect({
    id: 'site-subnet-mapping',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-foundation',
    question: 'Ein Client wird ständig einem falschen AD-Site zugeordnet. Was solltest du prüfen?',
    options: ['Subnet-to-Site-Mapping', 'Site Link Cost', 'DNS SRV-Records', 'Default-First-Site-Name'],
    correctIndices: [0, 1, 3],
    explanation: 'Site-Zuordnung basiert primär auf dem Subnet-Mapping. Cost und Default-First-Site-Name spielen eine Rolle, SRV-Records sind für DC-Lokalisierung, aber nicht das Mapping selbst.',
    relatedKnowledgeIds: ['ad.sites.subnet', 'ad.sites.default'],
  }),
]);

adTopic('ad-administration', [
  multiSelect({
    id: 'delegation-practices',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-administration',
    question: 'Du willst einem Helpdesk-Team erlauben, Passwörter zurückzusetzen, aber keine Domain-Admin-Rechte vergeben. Was ist sinnvoll?',
    options: ['Delegation an OU-Ebene', 'Zuweisung zu Domain Admins', 'Einschränkung auf bestimmte OUs', 'Erteilung von SeShutdownPrivilege'],
    correctIndices: [0, 2],
    explanation: 'Delegation auf OU-Ebene und Einschränkung auf bestimmte OUs ermöglichen gezielte Berechtigungen. Domain Admins und Shutdown-Privilege sind übermäßig.',
    relatedKnowledgeIds: ['ad.delegation.ou'],
  }),
]);

adTopic('ad-group-policy-basics', [
  multiSelect({
    id: 'gpo-inheritance',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-group-policy-basics',
    question: 'Eine GPO greift auf Child-OUs, obwohl sie nur an der Parent-OU hängen soll. Was sind mögliche Ursachen?',
    options: ['GPO-Vererbung ist aktiv', 'Enforced ist gesetzt', 'Security-Filterung fehlt', 'Site-Link Cost zu hoch'],
    correctIndices: [0, 1, 2],
    explanation: 'GPOs werden an Child-OUs vererbt. Enforced erzwingt die Vererbung; fehlende Sicherheitsfilterung greift nicht auf Vererbung, sondern auf Anwendung. Site Link Cost ist irrelevant für GPOs.',
    relatedKnowledgeIds: ['ad.gpo.inheritance', 'ad.gpo.enforced'],
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
  multiSelect({
    id: 'chown-chgrp-commands',
    sourceCategoryId: 'linux-virtualbox',
    sourceTopicId: 'permissions',
    question: 'Welche Befehle können Eigentümer oder Gruppe einer Datei direkt ändern?',
    options: ['chown', 'chgrp', 'chmod', 'usermod'],
    correctIndices: [0, 1],
    explanation: 'chown ändert den Eigentümer, chgrp die Gruppe. chmod ändert Rechte, usermod ändert Benutzereigenschaften.',
    relatedKnowledgeIds: ['linux.permissions.chown', 'linux.permissions.chgrp'],
  }),
]);

linuxTopic('network-commands', [
  multiSelect({
    id: 'linux-dns-checks',
    sourceCategoryId: 'linux-virtualbox',
    sourceTopicId: 'networking',
    question: 'Ein Linux-Client kann Hostnamen nicht auflösen, aber IP-Ziele erreichen. Was prüfst du?',
    options: ['/etc/resolv.conf', 'DNS-Server-Erreichbarkeit', 'Default-Gateway', 'Netzwerkkabel'],
    correctIndices: [0, 1, 2],
    explanation: 'Namensauflösung betrifft Resolver-Config und DNS-Erreichbarkeit. Default-Gateway ist nur für entfernte Netze relevant. Kabel würde IP-Verbindung verhindern.',
    relatedKnowledgeIds: ['linux.networking.resolv', 'linux.networking.dns'],
  }),
]);

// =============================================================================
// InfoSec
// =============================================================================

const infosec = {};

function infosecTopic(topicId, items) {
  infosec[topicKey('information-security', topicId)] = items;
}

infosecTopic('security-fundamentals', [
  multiSelect({
    id: 'least-privilege-measures',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-fundamentals',
    question: 'Welche Maßnahmen unterstützen Least Privilege?',
    options: ['Rollenbasierte Zugriffsrechte', 'Regelmäßige Berechtigungsüberprüfung', 'Jeder Benutzer bekommt Admin-Rechte', 'Entzug unnötiger Berechtigungen'],
    correctIndices: [0, 1, 3],
    explanation: 'Least Privilege bedeutet minimale nötige Rechte. Admin-Rechte für alle widersprechen dem Prinzip.',
    relatedKnowledgeIds: ['infosec.leastprivilege'],
  }),
  multiSelect({
    id: 'cia-impacts',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-fundamentals',
    question: 'Ein Serverraum überhitzt und mehrere Systeme fallen aus. Welche Schutzziele sind betroffen?',
    options: ['Vertraulichkeit', 'Verfügbarkeit', 'Integrität', 'Authentizität'],
    correctIndices: [1, 2],
    explanation: 'Ausfälle betreffen Verfügbarkeit. Datenverlust/Bit-Rot könnte Integrität betreffen, wenn Hardware Schaden nimmt. Vertraulichkeit und Authentizität sind nicht primär.',
    relatedKnowledgeIds: ['infosec.cia'],
  }),
]);

infosecTopic('security-threats-malware', [
  multiSelect({
    id: 'threat-vulnerability-risk',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-threats-malware',
    question: 'Welche Aussagen beschreiben die Begriffe korrekt?',
    options: ['Vulnerability ist eine Schwachstelle.', 'Threat ist eine potenzielle Gefahr.', 'Risk ist die verbleibende Restgefahr.', 'Control ist ein unbeabsichtigtes Risiko.'],
    correctIndices: [0, 1, 2],
    explanation: 'Vulnerability = Schwachstelle, Threat = Gefahr, Risk = verbleibendes Risiko, Control = Schutzmaßnahme.',
    relatedKnowledgeIds: ['infosec.threat.vulnerability', 'infosec.risk'],
  }),
]);

infosecTopic('security-technical-measures', [
  multiSelect({
    id: 'physical-controls',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-technical-measures',
    question: 'In einem öffentlichen Empfangsbereich liegen sensible Unterlagen herum. Welche Maßnahmen sind sinnvoll?',
    options: ['Clean-Desk-Policy', 'Zutrittskontrolle', 'Verschlussschränke', 'Penetrationstest'],
    correctIndices: [0, 1, 2],
    explanation: 'Clean Desk, Zutrittskontrolle und Verschlussschränke reduzieren physische Angriffsoberfläche. Ein Pentest ist kein direktes physisches Gegenmittel.',
    relatedKnowledgeIds: ['infosec.technical.physical'],
  }),
  multiSelect({
    id: 'defense-in-depth',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-technical-measures',
    question: 'Welche Elemente sind typisch für Defense in Depth?',
    options: ['Firewall', 'Antivirus', 'Patch-Management', 'Mitarbeiter-Schulung', 'Eine einzelne zentrale Kontrollstelle'],
    correctIndices: [0, 1, 2, 3],
    explanation: 'Defense in Depth setzt mehrere Schichten: Netzwerk, Endpunkt, Software, Mensch. Eine einzelne Kontrollstelle wäre ein Single Point of Failure.',
    relatedKnowledgeIds: ['infosec.defenseindepth'],
  }),
]);

// =============================================================================
// Registry
// =============================================================================

const MULTI_SELECT_QUESTIONS = { ...cisco, ...ad, ...linux, ...infosec };

export function getMultiSelectQuestionsForTopic(categoryId, topicId) {
  return MULTI_SELECT_QUESTIONS[topicKey(categoryId, topicId)] || [];
}

export function getAllMultiSelectQuestions() {
  return Object.values(MULTI_SELECT_QUESTIONS).flat();
}

export function getMultiSelectQuestionsForCategory(categoryId) {
  return getAllMultiSelectQuestions().filter((q) => q.sourceCategoryId === categoryId);
}
