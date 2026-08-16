// =============================================================================
// NEXUS Academy - central, data-driven catalog of learning categories/topics.
//
// This file is ONLY the static content definition (what topics exist, how
// they're organized, and their default/starting values). It intentionally
// contains NO player-specific state, NO lesson content, NO Sam dialogue and
// NO unlock logic - see academyProgress.js for how per-player progress is
// tracked and migrated on top of this catalog.
//
// Design goals (per the "prepare technical foundation" task):
//  - Topics are never hardcoded in UI components - everything reads from
//    ACADEMY_CATEGORIES / ACADEMY_TOPICS.
//  - New topics/categories can be appended here later without touching any
//    existing save data (see academyProgress.js migration).
//  - `topicId` strings are only guaranteed unique WITHIN a category (e.g.
//    "users" exists both under Linux and Active Directory) - use
//    `topicKey(categoryId, topicId)` to get a globally unique lookup key.
// =============================================================================

export const TOPIC_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  STARTED: 'started',
  LEARNED: 'learned',
  APPLIED: 'applied',
  CONSOLIDATED: 'consolidated',
};

export const ACADEMY_CATEGORIES = [
  { categoryId: 'fundamentals', title: 'Grundlagen', description: 'Netzwerk- und Protokollgrundlagen.', order: 1 },
  { categoryId: 'cisco-packet-tracer', title: 'Cisco – Packet Tracer', description: 'Praktische Netzwerkkonfiguration in Packet Tracer.', order: 2 },
  { categoryId: 'information-security', title: 'Informationssicherheit', description: 'Schutzziele und Sicherheitsgrundlagen.', order: 3 },
  { categoryId: 'linux-virtualbox', title: 'Linux – VirtualBox', description: 'Linux-Administration in der virtuellen Maschine.', order: 4 },
  { categoryId: 'active-directory-virtualbox', title: 'Active Directory – VirtualBox', description: 'Windows-Domänenverwaltung in der virtuellen Maschine.', order: 5 },
];

// Builds a single topic record. `prerequisites` entries are either a bare
// topicId (assumed to live in the SAME category) or a fully-qualified
// "categoryId/topicId" string for cross-category dependencies (e.g. the
// Cisco VLAN topic needs "fundamentals/switching"). Status defaults to
// LOCKED whenever prerequisites exist, AVAILABLE otherwise - this is only a
// starting-value convenience; the actual runtime unlock logic that flips
// LOCKED -> AVAILABLE once prerequisites are fulfilled lives in
// academyEngine.js.
function topic(categoryId, topicId, title, description, prerequisites = []) {
  return {
    categoryId,
    topicId,
    title,
    description,
    prerequisites,
    status: prerequisites.length > 0 ? TOPIC_STATUS.LOCKED : TOPIC_STATUS.AVAILABLE,
    theoryScore: 0,
    practiceScore: 0,
    retentionScore: 0,
    availableLessons: [],
    availableExercises: [],
    unlockedTools: [],
    relatedMissions: [],
    relatedSideMissions: [],
    version: 1,
  };
}

// Globally unique lookup key (topicId alone is only unique per category).
export function topicKey(categoryId, topicId) {
  return `${categoryId}/${topicId}`;
}

// Resolves a prerequisite reference (bare topicId or "categoryId/topicId")
// relative to the topic that declares it, returning { categoryId, topicId }.
export function resolvePrerequisiteRef(ownerCategoryId, ref) {
  if (ref.includes('/')) {
    const [categoryId, topicId] = ref.split('/');
    return { categoryId, topicId };
  }
  return { categoryId: ownerCategoryId, topicId: ref };
}

export const ACADEMY_TOPICS = [
  // ---------------------------------------------------------------------
  // 1. Grundlagen
  // ---------------------------------------------------------------------
  // Grundbegriffe is the entry-point lesson (guided Sam dialogue).
  // Ping is unlockable via Grundbegriffe. The old "network-basics" topic
  // has been removed; Grundbegriffe covers its content.
  topic('fundamentals', 'grundbegriffe', 'Grundbegriffe', 'Was ein Netzwerk ist, wozu es dient, und die wichtigsten Grundbegriffe (Dienste, Protokolle, Kommunikations- und Betriebsarten).'),
  topic('fundamentals', 'topologien', 'Topologien', 'Wie Geräte in einem Netzwerk physisch/logisch angeordnet sind.', ['grundbegriffe']),
  // Merged (Milestone C5.3) from the four previously separate placeholder
  // topics "Kommunikationsarten", "Betriebsarten", "Ausbreitungsarten" and
  // "Übertragungsmedien" into one topic with four sections - see
  // academyLessons/kommunikationUebertragung.js. academyProgress.js migrates
  // any pre-existing progress under the old topicIds into this one.
  topic('fundamentals', 'kommunikation-uebertragung', 'Kommunikations- und Übertragungsarten', 'Unicast/Broadcast/Multicast, Simplex/Halbduplex/Vollduplex, Ausbreitungsarten und Übertragungsmedien im Vergleich.', ['grundbegriffe']),
  topic('fundamentals', 'osi-model', 'OSI-Modell', 'Die sieben Schichten der Netzwerkkommunikation.'),
  topic('fundamentals', 'tcp-ip-model', 'TCP/IP-Modell', 'Das praxisnahe Schichtenmodell des Internets.', ['osi-model']),
  topic('fundamentals', 'ipv4', 'IPv4', 'Aufbau und Notation von IPv4-Adressen.', ['tcp-ip-model']),
  topic('fundamentals', 'binary-system', 'Binärsystem', 'Zahlen im Binärsystem lesen und umrechnen.'),
  topic('fundamentals', 'subnet-masks', 'Subnetzmasken', 'Wie Subnetzmasken Netz- und Hostanteil trennen.', ['ipv4', 'binary-system']),
  topic('fundamentals', 'subnetting', 'Subnetting', 'Netzwerke in kleinere Subnetze aufteilen.', ['ipv4', 'binary-system', 'subnet-masks']),
  topic('fundamentals', 'vlsm', 'VLSM', 'Variable Subnetzmasken für unterschiedlich große Subnetze.', ['subnetting']),
  topic('fundamentals', 'supernetting', 'Supernetting', 'Mehrere Netze zu einem größeren zusammenfassen.', ['vlsm']),
  topic('fundamentals', 'ports', 'Ports', 'Wie Ports Dienste auf einem Host unterscheiden.', ['tcp-ip-model']),
  topic('fundamentals', 'transport-protocols', 'Transportprotokolle', 'Aufgabe der Transportschicht im TCP/IP-Modell.', ['tcp-ip-model']),
  // Merged (Milestone C5.3) from the three previously separate topics "TCP",
  // "UDP" and "TCP vs. UDP" into one topic - see academyLessons/tcpUdp.js.
  // academyProgress.js migrates any pre-existing progress under the old
  // topicIds into this one.
  topic('fundamentals', 'tcp-udp', 'TCP & UDP', 'Verbindungsorientiert vs. verbindungslos, Zuverlässigkeit, Reihenfolge, Fehlerkontrolle und der Three-Way Handshake.', ['transport-protocols']),
  topic('fundamentals', 'dns', 'DNS', 'Namensauflösung von Domainnamen zu IP-Adressen.', ['ports']),
  topic('fundamentals', 'dhcp', 'DHCP', 'Automatische Vergabe von IP-Konfigurationen.', ['ports']),
  topic('fundamentals', 'routing', 'Routing', 'Wie Pakete zwischen Netzwerken weitergeleitet werden.', ['ipv4']),
  topic('fundamentals', 'switching', 'Switching', 'Wie Switches Datenverkehr im lokalen Netz vermitteln.', ['grundbegriffe']),
  topic('fundamentals', 'vlan-basics', 'VLAN-Grundlagen', 'Logische Trennung eines physischen Netzwerks.', ['switching']),
  topic('fundamentals', 'inter-vlan-routing', 'Inter-VLAN Routing', 'Router-on-a-Stick, Subinterfaces, 802.1Q, Gateways und Layer-2-/Layer-3-Unterschiede.', ['routing', 'vlan-basics']),

  // ---------------------------------------------------------------------
  // 2. Cisco – Packet Tracer
  // ---------------------------------------------------------------------
  // "Grundlagen" is the entry-point lesson (hierarchical network design,
  // device types, IOS, memory, boot process, CLI/config modes, ROMMON,
  // factory reset, CLI conveniences).
  topic('cisco-packet-tracer', 'grundlagen', 'Grundlagen', 'Hierarchisches Netzwerk-Design, Cisco-Geräte, IOS, Speicher, Bootvorgang und Konfigurationsmodi.'),
  // Self-contained hands-on primer: VLANs, Access-/Trunk-Ports, unused-port
  // hardening, IOS basic configuration and troubleshooting show-commands -
  // each CLI section preceded by a short conceptual refresher.
  topic('cisco-packet-tracer', 'grundkonfiguration', 'Grundkonfiguration', 'VLANs, Access- und Trunk-Ports, ungenutzte Ports absichern, IOS-Grundkonfiguration und Troubleshooting-Befehle.', ['grundlagen']),
  // Removed (Milestone: Cisco-Struktur bereinigen): "Packet Tracer
  // Oberfläche", "Endgeräte verbinden" and "Switch-Grundlagen" were
  // content-less placeholders not needed as standalone lessons and have
  // been dropped from the catalog entirely (not just hidden) - see
  // academyProgress.js for how any pre-existing progress under these
  // topicIds is handled (silently dropped, same as any other topic that no
  // longer exists in the catalog). "basic-device-configuration" (below) is
  // re-chained directly to "grundlagen" instead of the now-removed
  // "switch-basics"/"router-basics" chain, and merged with the equally
  // content-less former "ip-configuration" placeholder (also removed) into
  // one combined lesson - see academyLessons/ciscoBasicDeviceConfiguration.js.
  topic('cisco-packet-tracer', 'basic-device-configuration', 'Grundkonfiguration & IP-Konfiguration', 'Ein neues Gerät grundlegend einrichten: CLI-Modi, Passwörter, lokale Benutzer, sowie eine IP-Adresse auf einer Schnittstelle vergeben und aktivieren.', ['grundlagen']),
  topic('cisco-packet-tracer', 'vlan', 'VLAN', 'VLANs auf einem Switch anlegen und zuweisen.', ['fundamentals/switching', 'fundamentals/ipv4', 'fundamentals/vlan-basics']),
  topic('cisco-packet-tracer', 'access-port', 'Access-Port', 'Einen Switchport einem einzelnen VLAN zuweisen.', ['vlan']),
  topic('cisco-packet-tracer', 'trunk', 'Trunk', 'Mehrere VLANs über eine Verbindung transportieren.', ['vlan']),
  topic('cisco-packet-tracer', 'router-basics', 'Router-Grundlagen', 'Router-Interfaces konfigurieren und die Routingentscheidung (Longest Prefix Match, Administrative Distance, Metrik) verstehen.', ['trunk']),
  topic('cisco-packet-tracer', 'static-routing', 'Statisches Routing', 'Routen manuell auf einem Router konfigurieren.', ['router-basics']),
  topic('cisco-packet-tracer', 'ospf', 'OSPF', 'Dynamisches Routing mit OSPF: Network- und Interface-Methode, Authentifizierung, passive-interface, Default Route und Verifizierung.', ['router-basics', 'static-routing']),
  topic('cisco-packet-tracer', 'inter-vlan-routing', 'Router on a Stick', 'Kommunikation zwischen VLANs über Subinterfaces auf einem einzelnen Router ermöglichen.', ['trunk', 'router-basics']),
  // Added (Milestone C6): alternative to Router on a Stick for inter-VLAN
  // routing - a Layer-3 switch routes directly via SVIs, without a separate
  // router. Depends on "trunk" (needs the VLAN/trunk concepts) but NOT on
  // "router-basics", since a multilayer switch replaces the router entirely.
  topic('cisco-packet-tracer', 'multilayer-switching', 'Multilayer Switch (MLS)', 'Inter-VLAN-Routing direkt auf einem Layer-3-Switch über SVIs, ohne separaten Router.', ['trunk']),
  // STP is about redundant switch-to-switch links, which builds directly on
  // trunk knowledge.
  topic('cisco-packet-tracer', 'stp', 'Spanning Tree Protocol (PVST+)', 'Schleifen und Broadcast-Storms in redundanten Switch-Netzen verhindern, Root Bridge, Portrollen und Path Cost bestimmen.', ['trunk']),
  topic('cisco-packet-tracer', 'acl', 'Access Control Lists', 'Datenverkehr anhand von Regeln filtern.', ['router-basics']),
  topic('cisco-packet-tracer', 'packet-filter', 'Paketfilter', 'Statische und dynamische Paketfilter, Stateless vs. Stateful, Cisco CBAC / ip inspect.', ['acl']),
  topic('cisco-packet-tracer', 'nat', 'NAT', 'Private Adressen auf öffentliche Adressen übersetzen.', ['router-basics']),
  topic('cisco-packet-tracer', 'troubleshooting', 'Troubleshooting', 'Systematische Fehlersuche im Netzwerk anhand der passenden show-Befehle.', ['static-routing', 'inter-vlan-routing', 'multilayer-switching']),
  // Added (Milestone C7): remote management via SSH on router, L2 switch (via
  // management SVI) and multilayer switch - depends on the same chain as
  // troubleshooting so all three device scenarios are already unlocked.
  topic('cisco-packet-tracer', 'ssh', 'Fernwartung mit SSH', 'Cisco-Geräte (Router, L2-Switch, Multilayer-Switch) sicher per SSH statt Telnet aus der Ferne administrieren.', ['static-routing', 'inter-vlan-routing', 'multilayer-switching']),
  // Added (Milestone C7 part 2): DHCP Relay on Cisco devices - the practical
  // skill of determining the correct Layer-3 interface for "ip helper-
  // address" across all three routing scenarios already covered (physical
  // router interface, Router on a Stick subinterface, MLS SVI). Depends on
  // the same device chain as ssh/troubleshooting plus the conceptual
  // fundamentals/dhcp topic (DORA process, why DHCP exists).
  topic('cisco-packet-tracer', 'dhcp', 'DHCP Relay', 'DHCP-Anfragen über Router-/Switch-Grenzen weiterleiten und das richtige Layer-3-Interface für ip helper-address bestimmen.', ['static-routing', 'inter-vlan-routing', 'multilayer-switching', 'fundamentals/dhcp']),

  // ---------------------------------------------------------------------
  // 3. Informationssicherheit
  // ---------------------------------------------------------------------
  topic('information-security', 'security-objectives', 'Schutzziele', 'Die klassischen Ziele der Informationssicherheit.'),
  topic('information-security', 'confidentiality', 'Vertraulichkeit', 'Schutz von Daten vor unbefugtem Zugriff.', ['security-objectives']),
  topic('information-security', 'integrity', 'Integrität', 'Schutz von Daten vor unbemerkter Veränderung.', ['security-objectives']),
  topic('information-security', 'availability', 'Verfügbarkeit', 'Sicherstellen, dass Systeme nutzbar bleiben.', ['security-objectives']),
  topic('information-security', 'authenticity', 'Authentizität', 'Nachweis der Echtheit von Identität und Daten.', ['security-objectives']),
  topic('information-security', 'passwords', 'Passwörter', 'Anforderungen an sichere Passwörter.'),
  topic('information-security', 'mfa', 'Multi-Faktor-Authentifizierung', 'Absicherung von Zugängen durch mehrere Faktoren.', ['passwords']),
  topic('information-security', 'phishing', 'Phishing', 'Betrügerische Nachrichten erkennen.'),
  topic('information-security', 'malware', 'Malware', 'Arten von Schadsoftware und ihre Wirkung.'),
  topic('information-security', 'backup', 'Backup', 'Datensicherung als Schutz vor Datenverlust.', ['availability']),
  topic('information-security', 'logging', 'Logging', 'Protokollierung sicherheitsrelevanter Ereignisse.'),
  topic('information-security', 'firewall-basics', 'Firewall-Grundlagen', 'Wie eine Firewall Netzwerkverkehr kontrolliert.'),
  topic('information-security', 'hardening', 'Hardening', 'Systeme durch Reduktion der Angriffsfläche absichern.', ['firewall-basics']),
  topic('information-security', 'incident-response', 'Incident Response', 'Reaktion auf sicherheitsrelevante Vorfälle.', ['logging']),

  // ---------------------------------------------------------------------
  // 4. Linux – VirtualBox
  // ---------------------------------------------------------------------
  topic('linux-virtualbox', 'virtualbox-basics', 'VirtualBox-Grundlagen', 'Umgang mit der VirtualBox-Oberfläche.'),
  topic('linux-virtualbox', 'start-virtual-machine', 'Virtuelle Maschine starten', 'Eine Linux-VM starten und bedienen.', ['virtualbox-basics']),
  topic('linux-virtualbox', 'terminal', 'Terminal', 'Grundlegender Umgang mit dem Linux-Terminal.', ['start-virtual-machine']),
  topic('linux-virtualbox', 'navigation', 'Navigation', 'Sich im Dateisystem über die Kommandozeile bewegen.', ['terminal']),
  topic('linux-virtualbox', 'filesystem', 'Dateisystem', 'Aufbau der Linux-Verzeichnisstruktur.', ['navigation']),
  topic('linux-virtualbox', 'files-and-directories', 'Dateien und Verzeichnisse', 'Dateien und Ordner erstellen, kopieren, löschen.', ['filesystem']),
  topic('linux-virtualbox', 'users', 'Benutzer', 'Benutzerkonten unter Linux verwalten.', ['terminal']),
  topic('linux-virtualbox', 'groups', 'Gruppen', 'Benutzer zu Gruppen zusammenfassen.', ['users']),
  topic('linux-virtualbox', 'permissions', 'Berechtigungen', 'Lese-, Schreib- und Ausführungsrechte verstehen.', ['navigation', 'files-and-directories', 'users', 'groups']),
  topic('linux-virtualbox', 'processes', 'Prozesse', 'Laufende Prozesse anzeigen und steuern.', ['terminal']),
  topic('linux-virtualbox', 'services', 'Dienste', 'Systemdienste starten, stoppen und prüfen.', ['processes']),
  topic('linux-virtualbox', 'package-management', 'Paketverwaltung', 'Software installieren und aktualisieren.', ['terminal']),
  topic('linux-virtualbox', 'network-commands', 'Netzwerkbefehle', 'Netzwerkstatus über die Kommandozeile prüfen.', ['terminal']),
  topic('linux-virtualbox', 'ssh', 'SSH', 'Sichere Remote-Verbindung zu einem Linux-System.', ['network-commands']),
  topic('linux-virtualbox', 'logs', 'Logs', 'Systemprotokolle lesen und auswerten.', ['filesystem']),
  topic('linux-virtualbox', 'bash-basics', 'Bash-Grundlagen', 'Einfache Bash-Befehle und -Skripte.', ['terminal']),

  // ---------------------------------------------------------------------
  // 5. Active Directory – VirtualBox
  // ---------------------------------------------------------------------
  topic('active-directory-virtualbox', 'virtualbox-lab', 'VirtualBox-Lab', 'Aufbau der Windows-Server-Laborumgebung.'),
  topic('active-directory-virtualbox', 'windows-server', 'Windows Server', 'Grundlegende Bedienung von Windows Server.', ['virtualbox-lab']),
  topic('active-directory-virtualbox', 'domain', 'Domäne', 'Was eine Windows-Domäne ist und leistet.', ['windows-server']),
  // Corrected: Linux users/groups are NOT valid prerequisites for Active
  // Directory (different, unrelated user/group concepts). domain-controller
  // now only depends on the AD chain itself (windows-server -> domain) plus
  // the networking fundamentals it actually needs (ipv4, dns). AD's own
  // users/groups/organizational-units correctly depend on domain-controller
  // below, without any circular reference back to it.
  // A neutral, shared "Benutzer- und Gruppenkonzepte" fundamentals topic
  // could later replace the Linux-specific reference entirely - intentionally
  // not introduced yet.
  topic('active-directory-virtualbox', 'domain-controller', 'Domain Controller', 'Rolle und Funktion des Domain Controllers.', ['active-directory-virtualbox/windows-server', 'active-directory-virtualbox/domain', 'fundamentals/ipv4', 'fundamentals/dns']),
  topic('active-directory-virtualbox', 'users', 'Benutzer', 'Benutzerkonten in Active Directory anlegen.', ['domain-controller']),
  topic('active-directory-virtualbox', 'groups', 'Gruppen', 'Gruppen in Active Directory verwalten.', ['users']),
  topic('active-directory-virtualbox', 'organizational-units', 'Organisationseinheiten', 'Struktur der Domäne über OUs abbilden.', ['domain-controller']),
  topic('active-directory-virtualbox', 'group-policy', 'Gruppenrichtlinien', 'Einstellungen zentral per GPO verteilen.', ['organizational-units']),
  topic('active-directory-virtualbox', 'active-directory-dns', 'AD-integriertes DNS', 'Zusammenspiel von Active Directory und DNS.', ['domain-controller']),
  topic('active-directory-virtualbox', 'ldap', 'LDAP', 'Verzeichniszugriff über das LDAP-Protokoll.', ['active-directory-dns']),
  topic('active-directory-virtualbox', 'kerberos', 'Kerberos', 'Authentifizierung über das Kerberos-Protokoll.', ['domain-controller']),
  topic('active-directory-virtualbox', 'shares', 'Freigaben', 'Netzwerkfreigaben einrichten und verwalten.', ['domain-controller']),
  topic('active-directory-virtualbox', 'ntfs-permissions', 'NTFS-Berechtigungen', 'Zugriffsrechte auf Dateisystemebene steuern.', ['shares']),
  topic('active-directory-virtualbox', 'domain-join', 'Domänenbeitritt', 'Einen Client in die Domäne aufnehmen.', ['domain-controller']),
  topic('active-directory-virtualbox', 'troubleshooting', 'Troubleshooting', 'Systematische Fehlersuche in der Domäne.', ['domain-join']),
];

export function categoriesSorted() {
  return [...ACADEMY_CATEGORIES].sort((a, b) => a.order - b.order);
}

export function topicsForCategory(categoryId) {
  return ACADEMY_TOPICS.filter((t) => t.categoryId === categoryId);
}

export function findTopic(categoryId, topicId) {
  return ACADEMY_TOPICS.find((t) => t.categoryId === categoryId && t.topicId === topicId) || null;
}
