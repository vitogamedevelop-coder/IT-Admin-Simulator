import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Fernwartung mit SSH" - new catalog slot `cisco-packet-tracer/ssh` (see
// academyTopics.js). Builds on "Grundkonfiguration" (hostname, ip domain-name,
// enable secret, username, line console), "Router-Grundlagen"/"Statisches
// Routing" (Router-Szenario), "Trunk"/"Multilayer Switch" (Management-SVI
// auf einem L2- bzw. L3-Switch). Covers Telnet vs. SSH, SSHv1 vs. SSHv2, die
// vollständige SSH-Konfigurationsreihenfolge auf Router/L2-Switch/MLS sowie
// Troubleshooting typischer SSH-Fehlkonfigurationen.
// =============================================================================

export const CISCO_SSH_TOPIC_KEY = topicKey('cisco-packet-tracer', 'ssh');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('grundlagen-classic', 'Fernwartung: Was und warum?', 'classic', [
    { type: 'text', content: 'Fernwartung bedeutet, ein Gerät (Router, Switch) über das Netzwerk zu konfigurieren, statt physisch mit einem Konsolenkabel davor zu sitzen. Dafür betreibt das Gerät einen Server-Dienst, auf den sich ein Administrator per Client-Software verbindet.' },
    { type: 'table', headers: ['Protokoll', 'Standard-Port'], rows: [
      ['Telnet', 'TCP 23'],
      ['SSH', 'TCP 22'],
    ] },
  ]));

  exps.push(explanation('telnet-vs-ssh-classic', 'Telnet vs. SSH', 'classic', [
    { type: 'table', headers: ['', 'Telnet', 'SSH'], rows: [
      ['Verschlüsselung', 'Keine - alles im Klartext', 'Verschlüsselte Verbindung'],
      ['Passwort-Übertragung', 'Im Klartext, für jeden im selben Netzsegment mitlesbar', 'Verschlüsselt, nicht mitlesbar'],
      ['Einsatz in Produktivumgebungen', 'Unsicher, gilt als veraltet', 'Standard für Remote-Administration'],
    ] },
    { type: 'question', question: 'Ein Administrator meldet sich über Telnet an einem Router an, um das Passwort zu ändern. Warum ist das problematisch?', options: ['Telnet ist zu langsam für Konfigurationsänderungen', 'Telnet überträgt Benutzername und Passwort unverschlüsselt im Klartext - jeder, der den Datenverkehr mitlesen kann, sieht die Zugangsdaten', 'Telnet funktioniert nicht mit Cisco-Geräten', 'Telnet benötigt zwingend eine grafische Oberfläche'], correct: 1, explanation: 'Telnet verschlüsselt nichts. Ein Angreifer, der den Verkehr mitlesen kann (z. B. per Sniffing im selben Segment), sieht Login und Passwort direkt im Klartext.' },
  ]));

  exps.push(explanation('ssh-version-classic', 'SSH Version 1 vs. Version 2', 'classic', [
    { type: 'text', content: 'SSH existiert in zwei Versionen. SSHv1 hat bekannte Sicherheitsschwächen und sollte nicht mehr verwendet werden. Auf Cisco-Geräten muss SSHv2 explizit aktiviert werden, sonst akzeptiert der Router/Switch je nach IOS-Version ggf. auch das unsichere SSHv1.' },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['ip ssh version 2', 'Erzwingt ausschließlich SSH Version 2 - die sichere, aktuelle Variante.'],
    ] },
  ]));

  exps.push(explanation('konfig-reihenfolge-classic', 'SSH konfigurieren: die Reihenfolge', 'classic', [
    { type: 'text', content: 'SSH baut auf mehreren Voraussetzungen auf, die in dieser Reihenfolge erfüllt sein müssen - fehlt eine davon, lässt sich SSH nicht aktivieren oder die Verbindung schlägt fehl.' },
    { type: 'list', title: 'Konfigurationsreihenfolge', items: [
      '1. Hostname vergeben (Voraussetzung für die Schlüsselerzeugung).',
      '2. Domain Name vergeben (ebenfalls Voraussetzung für die Schlüsselerzeugung).',
      '3. Privileged EXEC Mode absichern (enable secret).',
      '4. Lokalen Benutzer anlegen.',
      '5. RSA-Schlüsselpaar generieren.',
      '6. SSH Version 2 aktivieren.',
      '7. IP-Erreichbarkeit herstellen (Interface-/SVI-Konfiguration).',
      '8. VTY-Lines konfigurieren (nur SSH erlauben, lokale Benutzerdatenbank).',
      '9. SSH-Zugriff testen.',
      '10. Konfiguration verifizieren (show-Befehle).',
    ] },
  ]));

  exps.push(explanation('befehle-classic', 'Die einzelnen Befehle', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['hostname <Name>', 'Vergibt den Gerätenamen - Teil des RSA-Schlüssel-Namens (Hostname.Domainname).'],
      ['ip domain-name <Domain>', 'Legt den Domainnamen fest - ebenfalls Teil des Schlüssel-Namens.'],
      ['enable secret <Passwort>', 'Sichert den Privileged EXEC Mode mit einem verschlüsselt gespeicherten Passwort.'],
      ['username <Benutzer> secret <Passwort>', 'Legt einen lokalen Benutzer für die SSH-Anmeldung an (sicherer als "password").'],
      ['crypto key generate rsa', 'Erzeugt das RSA-Schlüsselpaar, das SSH für die Verschlüsselung benötigt - erst danach ist SSH überhaupt aktivierbar.'],
      ['ip ssh version 2', 'Erzwingt SSH Version 2.'],
      ['line vty 0 15', 'Wechselt in die Konfiguration aller virtuellen Terminal-Leitungen (Remote-Zugänge).'],
      ['login local', 'Aktiviert die Anmeldung über die lokale Benutzerdatenbank (statt eines einzelnen Line-Passworts).'],
      ['transport input ssh', 'Erlaubt auf den VTY-Lines ausschließlich SSH - Telnet wird damit explizit blockiert.'],
    ] },
    { type: 'text', content: 'Die sichere Variante "username <Benutzer> secret <Passwort>" wird bevorzugt vermittelt - manche älteren Unterrichtsbeispiele verwenden noch "username <Benutzer> password <Passwort>" (unverschlüsselt gespeichert), das funktioniert technisch genauso, ist aber schwächer.' },
    { type: 'question', question: 'Warum schlägt "crypto key generate rsa" fehl, wenn vorher kein Hostname und kein Domain Name konfiguriert wurden?', options: ['Weil RSA-Schlüssel zufällige Namen brauchen', 'Weil der Name des Schlüssels aus Hostname und Domainname zusammengesetzt wird (Hostname.Domainname) - ohne beide fehlt dem Befehl die nötige Grundlage', 'Weil RSA nur mit IP-Adressen funktioniert', 'Das stimmt nicht, der Befehl funktioniert immer'], correct: 1, explanation: 'Der RSA-Schlüsselname setzt sich aus Hostname und Domainname zusammen - ohne beide bricht "crypto key generate rsa" mit einer Fehlermeldung ab.' },
  ]));

  exps.push(explanation('router-szenario-classic', 'Praxisbeispiel: Router per SSH', 'classic', [
    { type: 'text', content: 'Szenario: Router0 soll per SSH erreichbar sein. Hostname "Router0", Management-IP 192.168.100.254/24, Domain "name.ms.hw", Benutzer "admin".' },
    { type: 'table', headers: ['Schritt', 'Befehl'], rows: [
      ['Hostname', 'hostname Router0'],
      ['Domain', 'ip domain-name name.ms.hw'],
      ['Privileged EXEC absichern', 'enable secret <Passwort>'],
      ['Benutzer anlegen', 'username admin secret <Passwort>'],
      ['RSA-Schlüssel', 'crypto key generate rsa'],
      ['SSH-Version', 'ip ssh version 2'],
      ['IP-Adresse am Interface', 'interface g0/0 → ip address 192.168.100.254 255.255.255.0 → no shutdown'],
      ['VTY-Lines', 'line vty 0 15 → login local → transport input ssh'],
    ] },
    { type: 'text', content: 'Sam gibt dir die Anforderungen vor - die Befehle schreibst du selbst, nicht als vorgefertigte Liste zum Wiedererkennen.' },
  ]));

  exps.push(explanation('l2-switch-szenario-classic', 'Praxisbeispiel: L2-Switch per SSH', 'classic', [
    { type: 'text', content: 'Ein reiner Layer-2-Switch hat von Haus aus keine eigene IP-Adresse - er leitet nur Frames weiter. Für die Fernwartung braucht er trotzdem eine Management-IP. Dafür wird ein eigenes Management-VLAN mit einer SVI (Switched Virtual Interface) verwendet - NICHT das produktive Daten-VLAN.' },
    { type: 'table', headers: ['Schritt', 'Befehl'], rows: [
      ['Management-VLAN anlegen', 'vlan 99 → name Management'],
      ['SVI konfigurieren', 'interface vlan 99 → ip address 192.168.99.100 255.255.255.128 → no shutdown'],
      ['Default Gateway (falls Management außerhalb des lokalen Netzes erreicht werden soll)', 'ip default-gateway <Gateway-IP>'],
      ['Danach', 'Die übliche SSH-Konfiguration (Hostname, Domain, Benutzer, RSA-Key, SSH v2, VTY) wie beim Router.'],
    ] },
    { type: 'question', question: 'Warum konfigurieren wir die Management-IP eines Layer-2-Switches auf "interface vlan 99" und nicht einfach auf einem normalen Access-Port?', options: ['Weil Access-Ports keine IP-Adressen unterstützen und ein separates Management-VLAN die Verwaltung vom produktiven Datenverkehr trennt und unabhängig von einzelnen Ports erreichbar bleibt', 'Weil VLAN 99 immer automatisch die Management-VLAN-ID ist', 'Weil ein L2-Switch sonst nicht bootet', 'Es gibt keinen Unterschied, beide Varianten sind identisch'], correct: 0, explanation: 'Ein L2-Switch hat keine IP je Access-Port - eine SVI in einem eigenen Management-VLAN trennt die Verwaltung sauber vom Nutzdatenverkehr und ist unabhängig von einem einzelnen physischen Port erreichbar.' },
  ]));

  exps.push(explanation('gemeinsamkeiten-classic', 'Router, L2-Switch, Multilayer-Switch: Gemeinsamkeiten und Unterschiede', 'classic', [
    { type: 'text', content: 'Die SSH-Grundkonfiguration (Hostname, Domain, enable secret, Benutzer, RSA-Key, SSH v2, VTY-Lines) ist auf allen drei Gerätetypen IDENTISCH. Der einzige Unterschied liegt darin, WIE die IP-Erreichbarkeit hergestellt wird.' },
    { type: 'table', headers: ['Gerät', 'IP-Erreichbarkeit über'], rows: [
      ['Router', 'Eine normale physische Schnittstelle (z. B. interface g0/0).'],
      ['L2-Switch', 'Eine SVI in einem eigenen Management-VLAN (z. B. interface vlan 99) - er kann selbst nicht routen.'],
      ['Multilayer-Switch (MLS)', 'Eine SVI in einem beliebigen VLAN, z. B. dem produktiven Management-VLAN - er kann zusätzlich selbst zwischen VLANs routen ("ip routing").'],
    ] },
  ]));

  exps.push(explanation('troubleshooting-classic', 'SSH-Fehler diagnostizieren', 'classic', [
    { type: 'table', headers: ['Symptom', 'Mögliche Ursache'], rows: [
      ['"% Please configure a hostname other than Router/Switch"', 'Kein individueller Hostname vergeben - Voraussetzung für crypto key generate rsa.'],
      ['crypto key generate rsa lässt sich nicht ausführen', 'Hostname oder Domain Name fehlt.'],
      ['SSH-Client verweigert die Verbindung', 'SSH ist gar nicht aktiv - meist fehlt "ip ssh version 2" oder der RSA-Key.'],
      ['Verbindung per Ping klappt, SSH-Login aber nicht', 'Auf den VTY-Lines fehlt "login local" oder "transport input ssh", oder der lokale Benutzer fehlt.'],
      ['Gerät per Ping gar nicht erreichbar', 'Management-IP/SVI fehlt, ist falsch konfiguriert oder administrativ "down" (kein "no shutdown").'],
    ] },
    { type: 'question', question: 'Der Router ist per Ping erreichbar, aber der SSH-Login funktioniert nicht. Auf den VTY-Lines fehlt "login local". Was musst du konfigurieren?', options: ['ip ssh version 2 erneut eingeben', 'Unter "line vty 0 15" den Befehl "login local" eintragen, damit die lokale Benutzerdatenbank für die Anmeldung verwendet wird', 'Den Router neu starten', 'transport input telnet eintragen'], correct: 1, explanation: 'Ohne "login local" weiß die VTY-Line nicht, wie sie den Login prüfen soll - der lokal angelegte Benutzer wird dafür erst mit "login local" aktiviert.' },
  ]));

  exps.push(explanation('verifizierung-classic', 'SSH verifizieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wofür'], rows: [
      ['show ip ssh', 'Zeigt die aktive SSH-Version und den Verbindungsstatus.'],
      ['show ssh', 'Zeigt aktuell bestehende SSH-Sitzungen.'],
      ['show running-config | include vty', 'Prüft schnell die VTY-Konfiguration innerhalb der laufenden Konfiguration.'],
      ['show ip interface brief', 'Prüft, ob die Management-Schnittstelle/SVI "up" und mit der richtigen IP konfiguriert ist.'],
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Telnet (Port 23) ist unverschlüsselt und unsicher, SSH (Port 22) verschlüsselt die Verbindung.',
      'Immer SSH Version 2 verwenden: "ip ssh version 2".',
      'Reihenfolge: Hostname → Domain Name → enable secret → Benutzer → RSA-Key → SSH v2 → IP-Erreichbarkeit → VTY (login local, transport input ssh).',
      'Ein L2-Switch braucht für die Fernwartung eine SVI in einem eigenen Management-VLAN, da er selbst keine IP je Port hat und nicht routet.',
      'Die SSH-Grundkonfiguration ist auf Router, L2-Switch und MLS identisch - nur die IP-Erreichbarkeit unterscheidet sich.',
      'Verifizieren mit "show ip ssh", "show ssh", "show ip interface brief".',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'ssh-telnet-vs-ssh-select',
      type: 'select-best',
      question: 'Warum ist Telnet für die Produktivadministration ungeeignet?',
      options: ['Telnet ist zu neu und noch nicht ausgereift', 'Telnet übertragt Login-Daten und Konfigurationsbefehle unverschlüsselt im Klartext', 'Telnet funktioniert nur mit IPv6', 'Telnet benötigt zwingend einen RSA-Schlüssel'],
      correct: 1,
      explanation: 'Telnet verschlüsselt nichts - alle Daten inklusive Zugangsdaten sind im Klartext mitlesbar.',
    },
    {
      id: 'ssh-reihenfolge-matching',
      type: 'matching',
      question: 'Ordne jeden Schritt seiner Voraussetzung zu.',
      pairs: [
        { left: 'crypto key generate rsa', leftLabel: 'crypto key generate rsa', right: 'Setzt Hostname UND Domain Name voraus' },
        { left: 'login local', leftLabel: 'login local', right: 'Setzt einen vorher angelegten lokalen Benutzer voraus' },
        { left: 'ip ssh version 2', leftLabel: 'ip ssh version 2', right: 'Setzt ein bereits erzeugtes RSA-Schlüsselpaar voraus' },
      ],
      explanation: 'Jeder Schritt baut auf dem vorherigen auf - fehlt eine Voraussetzung, schlägt der nächste Schritt fehl.',
    },
    {
      id: 'ssh-grundkonfig-cli',
      type: 'cli-input',
      question: 'Vergib den Hostnamen "Router0" und den Domainnamen "name.ms.hw".',
      expectedLines: ['hostname Router0', 'ip domain-name name.ms.hw'],
      explanation: 'Beide Werte zusammen bilden später den Namen des RSA-Schlüssels.',
    },
    {
      id: 'ssh-user-rsa-cli',
      type: 'cli-input',
      question: 'Lege den lokalen Benutzer "admin" mit dem Passwort "Cisco123!" an (sichere Variante) und erzeuge anschließend das RSA-Schlüsselpaar.',
      expectedLines: ['username admin secret Cisco123!', 'crypto key generate rsa'],
      explanation: '"secret" statt "password" speichert das Passwort verschlüsselt. Das RSA-Schlüsselpaar braucht vorher Hostname und Domain Name.',
    },
    {
      id: 'ssh-version-cli',
      type: 'cli-input',
      question: 'Erzwinge auf diesem Gerät ausschließlich SSH Version 2.',
      expectedLines: ['ip ssh version 2'],
      explanation: '"ip ssh version 2" deaktiviert die unsichere Version 1.',
    },
    {
      id: 'ssh-vty-cli',
      type: 'cli-input',
      question: 'Erlaube auf den VTY-Lines ausschließlich SSH und verwende die lokale Benutzerdatenbank.',
      expectedLines: ['line vty 0 15', 'login local', 'transport input ssh'],
      explanation: '"login local" aktiviert die lokale Benutzerdatenbank, "transport input ssh" blockiert Telnet auf denselben Lines.',
    },
    {
      id: 'ssh-management-svi-cli',
      type: 'cli-input',
      question: 'Lege für die Fernwartung eines Layer-2-Switches das Management-VLAN 99 an und konfiguriere die SVI mit der IP-Adresse 192.168.99.100/25.',
      expectedLines: ['vlan 99', 'interface vlan 99', 'ip address 192.168.99.100 255.255.255.128', 'no shutdown'],
      explanation: 'VLAN anlegen, dann die zugehörige SVI konfigurieren und aktivieren - erst danach ist der Switch über diese IP erreichbar.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Welchen TCP-Port verwendet SSH standardmäßig?', options: ['21', '22', '23', '80'], correct: 1, explanation: 'SSH verwendet TCP Port 22, Telnet TCP Port 23.' },
    { question: 'Was ist der zentrale Sicherheitsvorteil von SSH gegenüber Telnet?', options: ['SSH ist schneller', 'SSH verschlüsselt die gesamte Verbindung inklusive Zugangsdaten', 'SSH benötigt kein Passwort', 'SSH funktioniert nur mit IPv6'], correct: 1, explanation: 'Telnet überträgt alles im Klartext, SSH verschlüsselt die Verbindung.' },
    { question: 'Welche Voraussetzungen müssen erfüllt sein, bevor "crypto key generate rsa" funktioniert?', options: ['Nur eine IP-Adresse muss konfiguriert sein', 'Hostname und Domain Name müssen konfiguriert sein', 'Der Router muss bereits eine SSH-Sitzung haben', 'Es gibt keine Voraussetzungen'], correct: 1, explanation: 'Der RSA-Schlüsselname setzt sich aus Hostname und Domainname zusammen.' },
    { question: 'Was bewirkt "transport input ssh" auf den VTY-Lines?', options: ['Aktiviert Telnet zusätzlich zu SSH', 'Erlaubt auf den VTY-Lines ausschließlich SSH-Verbindungen, Telnet wird blockiert', 'Löscht alle VTY-Lines', 'Aktiviert SSH Version 1'], correct: 1, explanation: '"transport input ssh" lässt nur noch SSH als Zugangsprotokoll auf den VTY-Lines zu.' },
    { question: 'Warum braucht ein reiner Layer-2-Switch für die Fernwartung eine SVI statt einer IP auf einem Access-Port?', options: ['Access-Ports können generell keine IP-Adressen haben, und eine SVI in einem eigenen Management-VLAN trennt die Verwaltung vom produktiven Datenverkehr', 'Weil SVIs schneller sind als Access-Ports', 'Weil ein L2-Switch sonst nicht bootet', 'Es gibt keinen Unterschied'], correct: 0, explanation: 'Ein L2-Switch besitzt keine IP je Port - die Management-Erreichbarkeit läuft über eine SVI in einem eigenen VLAN.' },
    { question: 'Was ist der Unterschied bei der SSH-Grundkonfiguration zwischen Router, L2-Switch und Multilayer-Switch?', options: ['Es gibt keinen - die Befehle für Hostname, Domain, Benutzer, RSA-Key, SSH v2 und VTY sind identisch, nur die Art der IP-Erreichbarkeit unterscheidet sich', 'Nur der Router kann SSH', 'L2-Switches brauchen kein enable secret', 'Multilayer-Switches benötigen kein RSA-Schlüsselpaar'], correct: 0, explanation: 'Die SSH-Grundkonfiguration ist auf allen drei Gerätetypen gleich - unterschiedlich ist nur die IP-Erreichbarkeit (physisches Interface vs. SVI).' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Konfiguriere Hostname Router0 und Domain name.ms.hw als Vorbereitung für SSH."',
      expectedLines: ['hostname Router0', 'ip domain-name name.ms.hw'],
      explanation: 'Beide Werte werden für den Namen des RSA-Schlüssels benötigt.',
    },
    {
      prompt: 'Sam: "Erzeuge jetzt das RSA-Schlüsselpaar und aktiviere ausschließlich SSH Version 2."',
      expectedLines: ['crypto key generate rsa', 'ip ssh version 2'],
      explanation: 'Erst das RSA-Schlüsselpaar, danach die SSH-Version erzwingen.',
    },
    {
      prompt: 'Sam: "Erlaube auf den VTY-Lines ausschließlich SSH und verwende die lokale Benutzerdatenbank."',
      expectedLines: ['line vty 0 15', 'transport input ssh', 'login local'],
      explanation: 'Reihenfolge von "transport input ssh" und "login local" ist untereinander egal, beide müssen aber unter "line vty 0 15" gesetzt werden.',
    },
    {
      prompt: 'Sam: "Ein L2-Switch besitzt keine Management-IP. Was musst du konfigurieren, damit er remote erreichbar wird?"',
      expectedLines: ['vlan 99', 'interface vlan 99', 'ip address 192.168.99.100 255.255.255.128', 'no shutdown'],
      explanation: 'Management-VLAN anlegen, SVI konfigurieren, IP-Adresse vergeben und aktivieren.',
    },
    {
      prompt: 'Sam: "Zeig mir kurz, welche SSH-Version aktiv ist und ob schon jemand verbunden ist."',
      expectedLines: [['show ip ssh', 'sh ip ssh']],
      explanation: '"show ip ssh" zeigt die aktive Version und den Verbindungsstatus.',
    },
  ];
}

export function buildCiscoSshLesson() {
  return {
    title: 'Fernwartung mit SSH',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
