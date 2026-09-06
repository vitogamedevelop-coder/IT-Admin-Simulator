import { topicKey } from './academyTopics.js';
import { shuffleInPlace } from './random.js';

// =============================================================================
// Drag & Drop Themencheck Questions
//
// Supports:
// - mode: 'matching'    (item -> target)
// - mode: 'ordering'    (items in correct order)
// - mode: 'categorization' (item -> category)
//
// Each question has a stable semanticKey that does NOT depend on shuffled order.
// =============================================================================

function dragDrop({
  id,
  sourceCategoryId,
  sourceTopicId,
  question,
  mode,
  items,
  targets,
  categories,
  correctMapping,
  correctOrder,
  explanation,
  relatedKnowledgeIds = [],
  difficulty = 'medium',
}) {
  if (!['matching', 'ordering', 'categorization'].includes(mode)) {
    throw new Error(`drag-drop ${id}: invalid mode ${mode}`);
  }
  if (!Array.isArray(items) || items.length < 2) {
    throw new Error(`drag-drop ${id}: needs at least 2 items`);
  }
  const itemIds = items.map((it) => it.id);
  const uniqueIds = new Set(itemIds);
  if (uniqueIds.size !== items.length) {
    throw new Error(`drag-drop ${id}: duplicate item ids`);
  }
  for (const it of items) {
    if (!it.id || !it.label || it.label.trim() === '') {
      throw new Error(`drag-drop ${id}: invalid item`);
    }
  }
  if (mode === 'matching') {
    if (!Array.isArray(targets) || targets.length < 2) throw new Error(`drag-drop ${id}: needs targets`);
    if (new Set(targets).size !== targets.length) throw new Error(`drag-drop ${id}: duplicate targets`);
    if (!correctMapping || Object.keys(correctMapping).length !== items.length) {
      throw new Error(`drag-drop ${id}: correctMapping mismatch`);
    }
    for (const [k, v] of Object.entries(correctMapping)) {
      if (!itemIds.includes(k) || !targets.includes(v)) throw new Error(`drag-drop ${id}: bad mapping ${k}=>${v}`);
    }
  } else if (mode === 'ordering') {
    if (!Array.isArray(correctOrder) || correctOrder.length !== items.length) {
      throw new Error(`drag-drop ${id}: correctOrder mismatch`);
    }
    for (const id of correctOrder) {
      if (!itemIds.includes(id)) throw new Error(`drag-drop ${id}: unknown id in correctOrder`);
    }
    if (new Set(correctOrder).size !== correctOrder.length) throw new Error(`drag-drop ${id}: duplicate in correctOrder`);
  } else if (mode === 'categorization') {
    if (!Array.isArray(categories) || categories.length < 2) throw new Error(`drag-drop ${id}: needs categories`);
    if (new Set(categories).size !== categories.length) throw new Error(`drag-drop ${id}: duplicate categories`);
    if (!correctMapping || Object.keys(correctMapping).length !== items.length) {
      throw new Error(`drag-drop ${id}: correctMapping mismatch`);
    }
    for (const [k, v] of Object.entries(correctMapping)) {
      if (!itemIds.includes(k) || !categories.includes(v)) throw new Error(`drag-drop ${id}: bad mapping ${k}=>${v}`);
    }
  }

  return {
    question,
    mode,
    items,
    targets,
    categories,
    correctMapping,
    correctOrder,
    explanation,
    sourceTopicId,
    sourceCategoryId,
    semanticKey: `${sourceCategoryId}/${sourceTopicId}/dd:${id}`,
    type: 'drag-drop',
    isDragDrop: true,
    difficulty,
    relatedKnowledgeIds,
  };
}

export function shuffleDragDropItems(question, rng) {
  const items = [...question.items];
  // Fisher–Yates shuffle. Re-shuffle if ordering accidentally starts in correct order (pre-solved guard).
  let attempts = 0;
  do {
    shuffleInPlace(rng, items);
    attempts++;
  } while (
    question.mode === 'ordering' &&
    attempts < 20 &&
    items.every((it, i) => it.id === question.correctOrder[i])
  );
  return { ...question, items };
}

// =============================================================================
// Cisco
// =============================================================================

const cisco = {};

function ciscoTopic(topicId, items) {
  cisco[topicKey('cisco-packet-tracer', topicId)] = items;
}

ciscoTopic('router-basics', [
  dragDrop({
    id: 'show-commands-match',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'router-basics',
    question: 'Ordne jedem show-Befehl die passende Aufgabe zu.',
    mode: 'matching',
    items: [
      { id: 'show-ip-int-brief', label: 'show ip interface brief' },
      { id: 'show-vlan-brief', label: 'show vlan brief' },
      { id: 'show-ip-route', label: 'show ip route' },
      { id: 'show-running', label: 'show running-config' },
    ],
    targets: [
      'Interface-Status und IPs anzeigen',
      'VLANs und Portzuordnung anzeigen',
      'Routing-Tabelle anzeigen',
      'Aktive Konfiguration anzeigen',
    ],
    correctMapping: {
      'show-ip-int-brief': 'Interface-Status und IPs anzeigen',
      'show-vlan-brief': 'VLANs und Portzuordnung anzeigen',
      'show-ip-route': 'Routing-Tabelle anzeigen',
      'show-running': 'Aktive Konfiguration anzeigen',
    },
    explanation: 'show ip interface brief zeigt alle Interfaces, show vlan brief die VLANs, show ip route die Routing-Tabelle und show running-config die aktuelle Konfiguration.',
    relatedKnowledgeIds: ['cisco.show.commands'],
  }),
]);

ciscoTopic('vlan', [
  dragDrop({
    id: 'vlan-concepts-match',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'vlan',
    question: 'Ordne jedem VLAN-Konzept die passende Beschreibung zu.',
    mode: 'matching',
    items: [
      { id: 'access', label: 'Access Port' },
      { id: 'trunk', label: 'Trunk' },
      { id: 'native', label: 'Native VLAN' },
      { id: 'allowed', label: 'Allowed VLANs' },
    ],
    targets: [
      'trägt Endgerät in einem VLAN',
      'transportiert mehrere VLANs',
      'ungetaggter Verkehr am 802.1Q-Trunk',
      'VLANs, die über den Trunk dürfen',
    ],
    correctMapping: {
      access: 'trägt Endgerät in einem VLAN',
      trunk: 'transportiert mehrere VLANs',
      native: 'ungetaggter Verkehr am 802.1Q-Trunk',
      allowed: 'VLANs, die über den Trunk dürfen',
    },
    explanation: 'Access Port endet in einem VLAN, Trunk transportiert mehrere VLANs, Native VLAN ist das untagged VLAN und Allowed VLANs begrenzt, welche VLANs passieren dürfen.',
    relatedKnowledgeIds: ['cisco.vlan.access', 'cisco.trunk.allowed', 'cisco.trunk.native'],
  }),
]);

ciscoTopic('trunk', [
  dragDrop({
    id: 'troubleshooting-order',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'trunk',
    question: 'Bringe die Schritte zur Fehlersuche bei einem VLAN-Trunk in eine sinnvolle Reihenfolge.',
    mode: 'ordering',
    items: [
      { id: 'physical', label: 'Physische Verbindung prüfen' },
      { id: 'mode', label: 'Trunk-Modus an beiden Enden prüfen' },
      { id: 'allowed', label: 'Allowed-VLAN-Liste vergleichen' },
      { id: 'native', label: 'Native-VLAN-Übereinstimmung prüfen' },
      { id: 'svi', label: 'SVI/IP-Konfiguration prüfen' },
    ],
    correctOrder: ['physical', 'mode', 'allowed', 'native', 'svi'],
    explanation: 'Zuerst physisches Kabel, dann Trunk-Modus, allowed VLANs, Native VLAN und zuletzt die Layer-3-Konfiguration.',
    relatedKnowledgeIds: ['cisco.trunk.allowed', 'cisco.trunk.native'],
  }),
]);

ciscoTopic('dhcp', [
  dragDrop({
    id: 'dhcp-dora-order',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'dhcp',
    question: 'Bringe die DHCP-Nachrichten in die richtige Reihenfolge.',
    mode: 'ordering',
    items: [
      { id: 'discover', label: 'DHCP Discover' },
      { id: 'offer', label: 'DHCP Offer' },
      { id: 'request', label: 'DHCP Request' },
      { id: 'ack', label: 'DHCP Ack' },
    ],
    correctOrder: ['discover', 'offer', 'request', 'ack'],
    explanation: 'DORA: Discover → Offer → Request → Ack.',
    relatedKnowledgeIds: ['cisco.dhcp.dora'],
  }),
]);

ciscoTopic('static-routing', [
  dragDrop({
    id: 'osi-layer-categorize',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'static-routing',
    question: 'Ordne jedem Problem die passende OSI-Schicht zu.',
    mode: 'categorization',
    items: [
      { id: 'cable', label: 'Kabelbruch' },
      { id: 'wrong-vlan', label: 'Port im falschen VLAN' },
      { id: 'no-route', label: 'Route fehlt' },
      { id: 'wrong-mask', label: 'Falsche Subnetzmaske' },
    ],
    categories: ['Layer 1', 'Layer 2', 'Layer 3'],
    correctMapping: {
      cable: 'Layer 1',
      'wrong-vlan': 'Layer 2',
      'no-route': 'Layer 3',
      'wrong-mask': 'Layer 3',
    },
    explanation: 'Kabelbruch ist Layer 1, falsches VLAN Layer 2, fehlende Route und falsche Maske sind Layer 3.',
    relatedKnowledgeIds: ['cisco.troubleshooting.osi'],
  }),
]);

ciscoTopic('acl', [
  dragDrop({
    id: 'acl-order',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'acl',
    question: 'Bringe diese Schritte beim Erstellen einer ACL in sinnvolle Reihenfolge.',
    mode: 'ordering',
    items: [
      { id: 'define', label: 'ACL-Einträge definieren' },
      { id: 'verify', label: 'Reihenfolge prüfen' },
      { id: 'apply', label: 'An Interface und Richtung anwenden' },
      { id: 'test', label: 'Verhalten testen' },
    ],
    correctOrder: ['define', 'verify', 'apply', 'test'],
    explanation: 'Zuerst Einträge definieren, dann Reihenfolge prüfen, anwenden und abschließend testen.',
    relatedKnowledgeIds: ['cisco.acl.order'],
  }),
]);

ciscoTopic('nat', [
  dragDrop({
    id: 'nat-concepts',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'nat',
    question: 'Ordne die NAT-Begriffe der passenden Beschreibung zu.',
    mode: 'matching',
    items: [
      { id: 'inside', label: 'inside interface' },
      { id: 'outside', label: 'outside interface' },
      { id: 'pat', label: 'PAT / NAT Overload' },
      { id: 'inside-local', label: 'inside local address' },
    ],
    targets: [
      'Anschluss zum privaten Netz',
      'Anschluss zum externen Netz',
      'Mehrere interne Adressen auf eine öffentliche',
      'Private Adresse vor der Übersetzung',
    ],
    correctMapping: {
      inside: 'Anschluss zum privaten Netz',
      outside: 'Anschluss zum externen Netz',
      pat: 'Mehrere interne Adressen auf eine öffentliche',
      'inside-local': 'Private Adresse vor der Übersetzung',
    },
    explanation: 'inside = privates Netz, outside = externes Netz, PAT teilt eine öffentliche IP, inside local ist die private IP.',
    relatedKnowledgeIds: ['cisco.nat.insideoutside', 'cisco.nat.pat'],
  }),
]);

ciscoTopic('stp', [
  dragDrop({
    id: 'stp-ports-categorize',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'stp',
    question: 'Ordne die STP-Portrollen einer Beschreibung zu.',
    mode: 'matching',
    items: [
      { id: 'root', label: 'Root Port' },
      { id: 'designated', label: 'Designated Port' },
      { id: 'blocked', label: 'Blocked/Alternate' },
    ],
    targets: [
      'Bester Pfad zum Root-Bridge',
      'Port, der den Verkehr für ein Segment weitergibt',
      'Redundanter Pfad, der Schleifen verhindert',
    ],
    correctMapping: {
      root: 'Bester Pfad zum Root-Bridge',
      designated: 'Port, der den Verkehr für ein Segment weitergibt',
      blocked: 'Redundanter Pfad, der Schleifen verhindert',
    },
    explanation: 'Root Port führt zum Root, Designated Port weitersendet, Blocked/Alternate verhindert Schleifen.',
    relatedKnowledgeIds: ['cisco.stp.ports'],
  }),
]);

ciscoTopic('packet-filter', [
  dragDrop({
    id: 'acl-wildcards',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'packet-filter',
    question: 'Ordne jeder Wildcard-Maske ihre Bedeutung zu.',
    mode: 'matching',
    items: [
      { id: '0.0.0.0', label: '0.0.0.0' },
      { id: '0.0.0.255', label: '0.0.0.255' },
      { id: '0.255.255.255', label: '0.255.255.255' },
    ],
    targets: [
      'nur eine einzelne IP',
      'alle Hosts in einem /24-Netz',
      'alle 10.x.x.x Netze',
    ],
    correctMapping: {
      '0.0.0.0': 'nur eine einzelne IP',
      '0.0.0.255': 'alle Hosts in einem /24-Netz',
      '0.255.255.255': 'alle 10.x.x.x Netze',
    },
    explanation: 'Wildcard 0.0.0.0 = eine IP, 0.0.0.255 = /24, 0.255.255.255 = ganze 10.0.0.0/8.',
    relatedKnowledgeIds: ['cisco.acl.wildcard'],
  }),
]);

ciscoTopic('basic-device-configuration', [
  dragDrop({
    id: 'ssh-order',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'basic-device-configuration',
    question: 'Bringe die SSH-Konfigurationsschritte in sinnvolle Reihenfolge.',
    mode: 'ordering',
    items: [
      { id: 'domain', label: 'ip domain-name konfigurieren' },
      { id: 'crypto', label: 'crypto key generate rsa' },
      { id: 'version', label: 'ip ssh version 2' },
      { id: 'vty', label: 'line vty transport input ssh' },
    ],
    correctOrder: ['domain', 'crypto', 'version', 'vty'],
    explanation: 'Domain-Name, RSA-Keys, SSHv2, dann VTY-Lines auf SSH beschränken.',
    relatedKnowledgeIds: ['cisco.ssh.keys', 'cisco.ssh.vty'],
  }),
]);

ciscoTopic('ospf', [
  dragDrop({
    id: 'ospf-neighbor-states',
    sourceCategoryId: 'cisco-packet-tracer',
    sourceTopicId: 'ospf',
    question: 'Ordne den OSPF-Nachbar-Zuständen ihre Bedeutung zu.',
    mode: 'matching',
    items: [
      { id: 'init', label: 'Init' },
      { id: 'twoway', label: '2-Way' },
      { id: 'exstart', label: 'ExStart' },
      { id: 'full', label: 'Full' },
    ],
    targets: [
      'Hello empfangen, aber eigene Router-ID noch nicht bestätigt',
      'bidirektionale Kommunikation hergestellt',
      'Master/Slave für Datenbank-Austausch bestimmt',
      'LSDB synchronisiert',
    ],
    correctMapping: {
      init: 'Hello empfangen, aber eigene Router-ID noch nicht bestätigt',
      twoway: 'bidirektionale Kommunikation hergestellt',
      exstart: 'Master/Slave für Datenbank-Austausch bestimmt',
      full: 'LSDB synchronisiert',
    },
    explanation: 'OSPF-Nachbarn durchlaufen Init, 2-Way, ExStart und Full, während sie ihre LSDB synchronisieren.',
    relatedKnowledgeIds: ['cisco.ospf.neighbor'],
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
  dragDrop({
    id: 'agdlp-order',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-groups',
    question: 'Bringe die AGDLP-Kette in die richtige Reihenfolge.',
    mode: 'ordering',
    items: [
      { id: 'account', label: 'Account' },
      { id: 'global', label: 'Global Group' },
      { id: 'domainlocal', label: 'Domain Local Group' },
      { id: 'permission', label: 'Permission' },
    ],
    correctOrder: ['account', 'global', 'domainlocal', 'permission'],
    explanation: 'AGDLP: Account → Global Group → Domain Local Group → Permission.',
    relatedKnowledgeIds: ['ad.groups.agdlp'],
  }),
  dragDrop({
    id: 'group-scope-match',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-groups',
    question: 'Ordne den Gruppenscopings ihre typische Verwendung zu.',
    mode: 'matching',
    items: [
      { id: 'universal', label: 'Universal' },
      { id: 'global', label: 'Global' },
      { id: 'domainlocal', label: 'Domain Local' },
    ],
    targets: [
      'frei zwischen Domänen verschiebbar',
      'kann Mitglieder aus eigener Domäne enthalten',
      'erhält Berechtigungen innerhalb einer Domäne',
    ],
    correctMapping: {
      universal: 'frei zwischen Domänen verschiebbar',
      global: 'kann Mitglieder aus eigener Domäne enthalten',
      domainlocal: 'erhält Berechtigungen innerhalb einer Domäne',
    },
    explanation: 'Universal-Gruppen domänenübergreifend, Global-Gruppen aus eigener Domäne, Domain Local-Gruppen zur Rechtevergabe.',
    relatedKnowledgeIds: ['ad.groups.scope'],
  }),
]);

adTopic('users', [
  dragDrop({
    id: 'user-account-types',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'users',
    question: 'Ordne die Kontentypen ihrer Verwaltungsebene zu.',
    mode: 'categorization',
    items: [
      { id: 'local', label: 'lokales Benutzerkonto' },
      { id: 'domain', label: 'Domänen-Benutzerkonto' },
      { id: 'builtin', label: 'Built-in Administrator' },
      { id: 'service', label: 'Dienstkonto' },
    ],
    categories: ['lokal', 'Domäne'],
    correctMapping: {
      local: 'lokal',
      builtin: 'lokal',
      domain: 'Domäne',
      service: 'Domäne',
    },
    explanation: 'Lokale Konten und Built-in-Admin werden lokal verwaltet; Domänen- und Dienstkonten in AD.',
    relatedKnowledgeIds: ['ad.users.account'],
  }),
]);

adTopic('ad-foundation', [
  dragDrop({
    id: 'ad-objects-categorize',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-foundation',
    question: 'Ordne diese Objekte der passenden AD-Containerebene zu.',
    mode: 'categorization',
    items: [
      { id: 'site', label: 'Site' },
      { id: 'domain', label: 'Domain' },
      { id: 'ou', label: 'OU' },
      { id: 'subnet', label: 'Subnet' },
    ],
    categories: ['Physische Topologie', 'Logische Verwaltung'],
    correctMapping: {
      site: 'Physische Topologie',
      subnet: 'Physische Topologie',
      domain: 'Logische Verwaltung',
      ou: 'Logische Verwaltung',
    },
    explanation: 'Site und Subnet beschreiben physische Topologie; Domain und OU logische Verwaltung.',
    relatedKnowledgeIds: ['ad.sites.subnet', 'ad.ou'],
  }),
]);

adTopic('ntfs-permissions', [
  dragDrop({
    id: 'permissions-categorize',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ntfs-permissions',
    question: 'Ordne jede Berechtigung den passenden Aktionen zu.',
    mode: 'categorization',
    items: [
      { id: 'read', label: 'Read' },
      { id: 'modify', label: 'Modify' },
      { id: 'full', label: 'Full Control' },
      { id: 'write', label: 'Write' },
    ],
    categories: ['Lesen und Ausführen', 'Schreiben + Ändern', 'Alle Aktionen'],
    correctMapping: {
      read: 'Lesen und Ausführen',
      write: 'Schreiben + Ändern',
      modify: 'Schreiben + Ändern',
      full: 'Alle Aktionen',
    },
    explanation: 'Read = Lesen, Write/Modify = Schreiben und Ändern, Full Control = alle Rechte.',
    relatedKnowledgeIds: ['ad.permissions.levels'],
  }),
]);

adTopic('ad-replication-sites', [
  dragDrop({
    id: 'replication-order',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-replication-sites',
    question: 'Bringe die Schritte zur Site- und Replikationskonfiguration in sinnvolle Reihenfolge.',
    mode: 'ordering',
    items: [
      { id: 'site', label: 'Site erstellen' },
      { id: 'subnet', label: 'Subnet zuordnen' },
      { id: 'dc', label: 'DC der Site zuweisen' },
      { id: 'sitelink', label: 'Site Link konfigurieren' },
      { id: 'verify', label: 'Replikation prüfen' },
    ],
    correctOrder: ['site', 'subnet', 'dc', 'sitelink', 'verify'],
    explanation: 'Site, Subnet, DC, Site Link, dann Replikation verifizieren.',
    relatedKnowledgeIds: ['ad.replication.sites'],
  }),
]);

adTopic('ad-replication-practice', [
  dragDrop({
    id: 'recycle-bin-match',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-replication-practice',
    question: 'Ordne die Recovery-Begriffe ihrer Bedeutung zu.',
    mode: 'matching',
    items: [
      { id: 'deleted', label: 'Deleted Objects' },
      { id: 'restore', label: 'Restore' },
      { id: 'restoreto', label: 'Restore To' },
      { id: 'recycle', label: 'AD-Recycle Bin' },
    ],
    targets: [
      'Container für gelöschte Objekte',
      'Wiederherstellung am ursprünglichen Ort',
      'Wiederherstellung an anderem Ort',
      'Wiederherstellung ohne Authoritative Restore',
    ],
    correctMapping: {
      deleted: 'Container für gelöschte Objekte',
      restore: 'Wiederherstellung am ursprünglichen Ort',
      restoreto: 'Wiederherstellung an anderem Ort',
      recycle: 'Wiederherstellung ohne Authoritative Restore',
    },
    explanation: 'Deleted Objects speichert gelöschte Objekte, Restore holt sie zurück, Restore To verschiebt sie, Recycle Bin ermöglicht einfache Wiederherstellung.',
    relatedKnowledgeIds: ['ad.recyclebin.restore'],
  }),
]);

adTopic('ad-group-policy-basics', [
  dragDrop({
    id: 'gpo-processing-order',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-group-policy-basics',
    question: 'Bringe die GPO-Verarbeitungsreihenfolge vom niedrigsten zum höchsten Scope.',
    mode: 'ordering',
    items: [
      { id: 'local', label: 'Local' },
      { id: 'site', label: 'Site' },
      { id: 'domain', label: 'Domain' },
      { id: 'ou', label: 'OU' },
    ],
    correctOrder: ['local', 'site', 'domain', 'ou'],
    explanation: 'LSDOU: Local → Site → Domain → OU; OU gewinnt bei Konflikten.',
    relatedKnowledgeIds: ['ad.gpo.lsdou'],
  }),
]);

adTopic('ad-fsmo-transfer', [
  dragDrop({
    id: 'fsmo-match',
    sourceCategoryId: 'active-directory-virtualbox',
    sourceTopicId: 'ad-fsmo-transfer',
    question: 'Ordne den FSMO-Rollen ihre Aufgabe zu.',
    mode: 'matching',
    items: [
      { id: 'pdc', label: 'PDC Emulator' },
      { id: 'rid', label: 'RID Master' },
      { id: 'infra', label: 'Infrastructure Master' },
      { id: 'schema', label: 'Schema Master' },
    ],
    targets: [
      'Zeit- und Passwort-Emulation',
      'Vergabe von SIDs/Reihenfolge',
      'Aktualisierung von Phantom-Objekten',
      'Schema-Änderungen kontrollieren',
    ],
    correctMapping: {
      pdc: 'Zeit- und Passwort-Emulation',
      rid: 'Vergabe von SIDs/Reihenfolge',
      infra: 'Aktualisierung von Phantom-Objekten',
      schema: 'Schema-Änderungen kontrollieren',
    },
    explanation: 'PDC Emulator, RID Master, Infrastructure Master und Schema Master haben diese spezifischen Rollen.',
    relatedKnowledgeIds: ['ad.fsmo.roles'],
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
  dragDrop({
    id: 'chmod-categorize',
    sourceCategoryId: 'linux-virtualbox',
    sourceTopicId: 'permissions',
    question: 'Ordne die rwx-Bits ihrer Position in den Berechtigungsklassen zu.',
    mode: 'categorization',
    items: [
      { id: 'user-r', label: 'user-read' },
      { id: 'group-w', label: 'group-write' },
      { id: 'other-x', label: 'other-execute' },
      { id: 'user-x', label: 'user-execute' },
    ],
    categories: ['Owner', 'Group', 'Other'],
    correctMapping: {
      'user-r': 'Owner',
      'user-x': 'Owner',
      'group-w': 'Group',
      'other-x': 'Other',
    },
    explanation: 'Berechtigungen sind in drei Klassen aufgeteilt: Owner, Group, Other.',
    relatedKnowledgeIds: ['linux.permissions.rwx'],
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
  dragDrop({
    id: 'cia-match',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-fundamentals',
    question: 'Ordne jedem Szenario die betroffene Schutzziel-Kategorie zu.',
    mode: 'matching',
    items: [
      { id: 'leak', label: 'Datenleck' },
      { id: 'modify', label: 'unautorisierte Datenänderung' },
      { id: 'down', label: 'Server nicht erreichbar' },
    ],
    targets: ['Confidentiality', 'Integrity', 'Availability'],
    correctMapping: {
      leak: 'Confidentiality',
      modify: 'Integrity',
      down: 'Availability',
    },
    explanation: 'Datenleck = Confidentiality, unerlaubte Änderung = Integrity, Ausfall = Availability.',
    relatedKnowledgeIds: ['infosec.cia'],
  }),
  dragDrop({
    id: 'security-concept-categorize',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-fundamentals',
    question: 'Ordne jedem Begriff der passenden Kategorie zu.',
    mode: 'categorization',
    items: [
      { id: 'vulnerability', label: 'ungepatchte Software' },
      { id: 'threat', label: 'Angreifer' },
      { id: 'control', label: 'Firewall' },
      { id: 'risk', label: 'Restgefahr' },
    ],
    categories: ['Vulnerability', 'Threat', 'Control', 'Risk'],
    correctMapping: {
      vulnerability: 'Vulnerability',
      threat: 'Threat',
      control: 'Control',
      risk: 'Risk',
    },
    explanation: 'unbekannte Schwachstelle = Vulnerability, Gefahr = Threat, Schutzmaßnahme = Control, verbleibende Gefahr = Risk.',
    relatedKnowledgeIds: ['infosec.threat.vulnerability'],
  }),
]);

infosecTopic('security-threats-malware', [
  dragDrop({
    id: 'malware-categorize',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-threats-malware',
    question: 'Ordne die Bedrohungen der passenden Kategorie zu.',
    mode: 'categorization',
    items: [
      { id: 'virus', label: 'Virus' },
      { id: 'worm', label: 'Wurm' },
      { id: 'trojan', label: 'Trojaner' },
      { id: 'ransomware', label: 'Ransomware' },
    ],
    categories: ['Selbstverbreitend', 'Benutzeraktion nötig'],
    correctMapping: {
      worm: 'Selbstverbreitend',
      virus: 'Benutzeraktion nötig',
      trojan: 'Benutzeraktion nötig',
      ransomware: 'Benutzeraktion nötig',
    },
    explanation: 'Würmer verbreiten sich selbst; Viren, Trojaner und Ransomware benötigen oft eine Benutzeraktion.',
    relatedKnowledgeIds: ['infosec.malware.types'],
  }),
]);

infosecTopic('security-technical-measures', [
  dragDrop({
    id: 'measures-categorize',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-technical-measures',
    question: 'Ordne die Maßnahmen ihrer Art zu.',
    mode: 'categorization',
    items: [
      { id: 'firewall', label: 'Firewall' },
      { id: 'policy', label: 'Clean-Desk-Policy' },
      { id: 'badge', label: 'Zutrittskontrolle' },
      { id: 'awareness', label: 'Schulung' },
    ],
    categories: ['technisch', 'organisatorisch', 'physisch'],
    correctMapping: {
      firewall: 'technisch',
      policy: 'organisatorisch',
      awareness: 'organisatorisch',
      badge: 'physisch',
    },
    explanation: 'Firewall ist technisch, Clean Desk/Schulung organisatorisch, Zutrittskontrolle physisch.',
    relatedKnowledgeIds: ['infosec.measures'],
  }),
]);

infosecTopic('security-incidents', [
  dragDrop({
    id: 'incident-order',
    sourceCategoryId: 'information-security',
    sourceTopicId: 'security-incidents',
    question: 'Bringe die Phasen eines Incident-Response-Ablaufs in sinnvolle Reihenfolge.',
    mode: 'ordering',
    items: [
      { id: 'detect', label: 'Erkennen' },
      { id: 'contain', label: 'Eindämmen' },
      { id: 'eradicate', label: 'Beseitigen' },
      { id: 'recover', label: 'Wiederherstellen' },
      { id: 'lessons', label: 'Lessons Learned' },
    ],
    correctOrder: ['detect', 'contain', 'eradicate', 'recover', 'lessons'],
    explanation: 'Detect → Contain → Eradicate → Recover → Lessons Learned.',
    relatedKnowledgeIds: ['infosec.incident.response'],
  }),
]);

// =============================================================================
// Registry
// =============================================================================

const DRAG_DROP_QUESTIONS = { ...cisco, ...ad, ...linux, ...infosec };

export function getDragDropQuestionsForTopic(categoryId, topicId) {
  return DRAG_DROP_QUESTIONS[topicKey(categoryId, topicId)] || [];
}

export function getAllDragDropQuestions() {
  return Object.values(DRAG_DROP_QUESTIONS).flat();
}

export function getDragDropQuestionsForCategory(categoryId) {
  return getAllDragDropQuestions().filter((q) => q.sourceCategoryId === categoryId);
}
