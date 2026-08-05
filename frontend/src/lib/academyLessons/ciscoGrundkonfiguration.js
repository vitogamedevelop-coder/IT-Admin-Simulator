import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Grundkonfiguration" - the second lesson in the "Cisco - Packet Tracer"
// category, directly after "Grundlagen". Based on the course notes: VLANs,
// Access-Ports, Trunk-Ports, unused-port hardening, IOS basic configuration
// commands and troubleshooting show-commands. Every practical CLI section is
// preceded by a short conceptual refresher, so the learner is never forced to
// jump back to the fundamentals lessons to follow along - small repetition is
// intentional here. Structured exactly like every other LessonRunner lesson
// (theory sections, then exercises, then a quiz) - no new mechanics.
// =============================================================================

export const CISCO_GRUNDKONFIGURATION_TOPIC_KEY = topicKey('cisco-packet-tracer', 'grundkonfiguration');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Einordnung
  // ---------------------------------------------------------------------
  exps.push(explanation('intro-classic', 'Von der Theorie zur echten Konfiguration', 'classic', [
    { type: 'text', content: 'In dieser Lektion konfigurierst du zum ersten Mal einen echten Cisco-Switch über die Kommandozeile (CLI). Vor jedem neuen Befehlsblock wiederholen wir kurz die dahinterliegende Theorie, damit du nicht zwischen Lektionen wechseln musst, um die Konfiguration zu verstehen.' },
    { type: 'list', title: 'Was du am Ende dieser Lektion kannst', items: [
      'VLANs auf einem Switch anlegen und Ports zuweisen (Access-Ports).',
      'Trunk-Ports einrichten, damit mehrere VLANs über eine Leitung laufen.',
      'Ungenutzte Ports absichern.',
      'Ein Gerät grundlegend absichern (Hostname, Passwörter, lokale Benutzer).',
      'Mit den wichtigsten show-Befehlen den aktuellen Zustand des Switches prüfen.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 2. VLAN + Access-Port - kurze Wiederholung + eine zusammenhängende
  // Konfiguration (VLAN anlegen und direkt einem Access-Port zuweisen).
  // Beide Konzepte gehören in der Praxis unmittelbar zusammen, deshalb hier
  // bewusst EIN Abschnitt statt zwei getrennter mit sich wiederholenden
  // Befehlen.
  // ---------------------------------------------------------------------
  exps.push(explanation('vlan-access-classic', 'VLAN und Access-Port: kurze Wiederholung', 'classic', [
    { type: 'list', title: 'VLAN - zur Erinnerung', items: [
      'Was ist ein VLAN? Eine logische Aufteilung eines physischen Netzwerks in mehrere getrennte Netze, unabhängig von der physischen Verkabelung.',
      'Warum verwendet man VLANs? Für Sicherheit (logische Trennung), weniger Broadcast-Verkehr und mehr Flexibilität/Struktur.',
      'Welche Probleme lösen VLANs? Eine zu große, gemeinsame Broadcast-Domäne und die fehlende logische Trennung unterschiedlicher Bereiche (z. B. Abteilungen) am selben Switch.',
    ] },
    { type: 'list', title: 'Access-Port - zur Erinnerung', items: [
      'Was ist ein Access-Port? Ein Switch-Port, der ein einzelnes Endgerät (PC, Drucker, IP-Telefon) mit genau einem VLAN verbindet.',
      'Wann verwendet man ihn? Immer dann, wenn ein Endgerät angeschlossen wird, das selbst nichts von VLANs "wissen" muss - also praktisch an jedem normalen Benutzer-Port.',
    ] },
    { type: 'text', content: 'Ein VLAN allein bewirkt noch nichts - es muss auch einem Port zugewiesen werden. Genau diese beiden Schritte (VLAN anlegen, Port zuweisen) setzt du jetzt zusammenhängend auf einem echten Switch um.' },
  ]));

  exps.push(explanation('vlan-access-config-classic', 'VLAN anlegen und einem Access-Port zuweisen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['vlan <VLAN-ID>', 'Legt ein neues VLAN mit der angegebenen ID an (bzw. wechselt in dessen Konfiguration).'],
      ['name <Name>', 'Benennt das aktuelle VLAN.'],
      ['interface <Interface>', 'Wechselt in den Konfigurationsmodus der angegebenen Schnittstelle, z. B. "interface fa0/1" oder "interface g0/1".'],
      ['switchport mode access', 'Legt diesen Port als Access-Port fest (überträgt nur ein VLAN, ungetaggt).'],
      ['switchport access vlan <VLAN-ID>', 'Weist dem Access-Port das vorher angelegte VLAN zu.'],
      ['show vlan brief', 'Zeigt alle angelegten VLANs und welche Ports ihnen zugewiesen sind.'],
    ] },
    { type: 'text', content: 'Beispiel: Ein VLAN 10 mit dem Namen "Verwaltung" wird angelegt und Schnittstelle FastEthernet0/1 als Access-Port diesem VLAN zugewiesen:' },
    { type: 'list', title: 'Beispielkonfiguration', items: [
      'Switch(config)# vlan 10',
      'Switch(config-vlan)# name Verwaltung',
      'Switch(config-vlan)# exit',
      'Switch(config)# interface fa0/1',
      'Switch(config-if)# switchport mode access',
      'Switch(config-if)# switchport access vlan 10',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 3. Trunk-Port - kurze Wiederholung + Konfiguration
  // ---------------------------------------------------------------------
  exps.push(explanation('trunk-classic', 'Trunk-Port: kurze Wiederholung', 'classic', [
    { type: 'list', title: 'Zur Erinnerung', items: [
      'Was ist ein Trunk? Eine Verbindung (meist zwischen zwei Switches, oder Switch und Router), die Datenverkehr für mehrere VLANs gleichzeitig über eine einzige physische Leitung transportiert.',
      'Warum benötigt man Trunks? Ohne Trunk bräuchtest du zwischen zwei Switches für jedes VLAN eine eigene Kabelverbindung (ein eigenes Kabel samt eigenem Port auf beiden Seiten). Ein Trunk macht eine einzelne, bereits vorhandene Verbindung dazu fähig, mehrere VLANs gleichzeitig zu transportieren - du benötigst also kein zusätzliches Kabel pro VLAN, sondern konfigurierst den vorhandenen Port entsprechend.',
      'Tagged Frames: Auf einem Trunk wird jeder Frame mit einem VLAN-Tag versehen (IEEE 802.1Q), damit der empfangende Switch weiß, zu welchem VLAN er gehört.',
      'Mehrere VLANs über eine Leitung: Genau das macht ein Trunk möglich - dank Tagging bleiben die VLANs auf derselben Leitung sauber voneinander getrennt.',
    ] },
  ]));

  exps.push(explanation('trunk-config-classic', 'Einen Port als Trunk-Port konfigurieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['switchport mode trunk', 'Legt den Port als Trunk-Port fest (überträgt mehrere VLANs, getaggt).'],
      ['switchport trunk allowed vlan <Liste>', 'Legt fest, welche VLANs über diesen Trunk erlaubt sind, z. B. "switchport trunk allowed vlan 10,20".'],
      ['show interfaces trunk', 'Zeigt alle Ports, die aktuell als Trunk konfiguriert sind, inklusive der erlaubten VLANs.'],
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 4. Ungenutzte Ports
  // ---------------------------------------------------------------------
  exps.push(explanation('ungenutzt-classic', 'Ungenutzte Ports absichern', 'classic', [
    { type: 'text', content: 'Warum stellen ungenutzte Ports ein Sicherheitsrisiko dar? Ein aktiver, aber nicht benötigter Port kann von Unbefugten einfach eingesteckt werden, um sich unbemerkt Zugang zum Netzwerk zu verschaffen. Deshalb werden ungenutzte Ports in der Praxis konsequent deaktiviert und - falls sie doch aktiviert werden - vorsichtshalber einem eigenen, isolierten "Default"-VLAN zugewiesen statt dem produktiven VLAN.' },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['interface range <Interface-Liste>', 'Wählt mehrere Schnittstellen gleichzeitig aus, z. B. "interface range fa0/3-24, g0/2" für alle Ports von FastEthernet0/3 bis 0/24 sowie GigabitEthernet0/2.'],
      ['switchport mode access', 'Setzt (vorsorglich) auch ungenutzte Ports auf Access statt Trunk.'],
      ['switchport access vlan <VLAN-ID>', 'Weist die ungenutzten Ports einem vorher angelegten, isolierten "Default"-VLAN zu - nicht dem produktiven VLAN.'],
      ['shutdown', 'Deaktiviert die ausgewählten Ports administrativ - sie nehmen so lange keinen Datenverkehr an, bis sie bei Bedarf bewusst wieder aktiviert werden.'],
    ] },
    { type: 'text', content: 'Wichtig: Das isolierte VLAN muss vorher mit "vlan <VLAN-ID>" angelegt werden (siehe oben), bevor es ungenutzten Ports zugewiesen werden kann.' },
    { type: 'question', question: 'Warum sollten ungenutzte Switch-Ports deaktiviert (shutdown) werden?', options: ['Um Strom zu sparen', 'Um zu verhindern, dass Unbefugte sich über einen freien Port Zugang zum Netz verschaffen', 'Weil sonst kein VLAN funktioniert', 'Weil sie sonst automatisch zu Trunks werden'], correct: 1, explanation: 'Ein aktiver, ungenutzter Port ist ein Sicherheitsrisiko, da er unbemerkten Netzzugang ermöglichen könnte.' },
  ]));

  // ---------------------------------------------------------------------
  // 5. IOS-Grundkonfiguration
  // ---------------------------------------------------------------------
  exps.push(explanation('ios-grundlagen-classic', 'IOS-Grundkonfiguration: Navigation und Hilfe', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['?', 'Hilfe: zeigt an, welche Befehle im aktuellen Modus verfügbar sind bzw. wie ein angefangener Befehl fortgesetzt werden kann.'],
      ['enable', 'Wechselt vom User EXEC in den Privileged EXEC Mode.'],
      ['configure terminal', 'Wechselt vom Privileged EXEC in den Global Configuration Mode (kurz "conf t").'],
      ['no <Befehl>', 'Kehrt die Wirkung des nachfolgenden Befehls um - fast jeder Konfigurationsbefehl kann so wieder entfernt werden.'],
      ['do <Befehl>', 'Führt im Configuration Mode einen Privileged-EXEC-Befehl (z. B. einen show-Befehl) aus, ohne den Modus vorher verlassen zu müssen.'],
    ] },
  ]));

  exps.push(explanation('ios-identitaet-classic', 'IOS-Grundkonfiguration: Identität des Geräts', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['hostname <Name>', 'Vergibt einen Gerätenamen, z. B. "hostname SW1".'],
      ['ip domain-name <Name>', 'Legt den Domainnamen des Geräts fest (u. a. Voraussetzung für die Schlüsselerzeugung bei SSH).'],
    ] },
  ]));

  exps.push(explanation('ios-passwoerter-classic', 'IOS-Grundkonfiguration: Passwörter und Benutzer', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['enable secret <Passwort>', 'Setzt ein verschlüsseltes (gehashtes) Passwort für den Privileged EXEC Mode - Standardweg in der Praxis.'],
      ['enable password <Passwort>', 'Setzt ein Passwort für den Privileged EXEC Mode im Klartext - wird durch "enable secret" überschrieben/bevorzugt, falls beide gesetzt sind.'],
      ['username <Name> secret/password <Passwort>', 'Legt einen lokalen Benutzer mit Passwort an, z. B. für die spätere Anmeldung an der Konsole oder per SSH.'],
      ['service password-encryption', 'Verschlüsselt im Klartext gespeicherte Passwörter (z. B. aus "enable password") in der Konfiguration, statt sie lesbar anzuzeigen.'],
    ] },
  ]));

  exps.push(explanation('ios-line-console-classic', 'IOS-Grundkonfiguration: Konsolenzugang absichern', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['line console 0', 'Wechselt in den Konfigurationsmodus der Konsolenleitung.'],
      ['password <Passwort>', 'Vergibt (innerhalb von "line console 0") ein Passwort für den Konsolenzugang.'],
      ['login', 'Aktiviert die Passwortabfrage anhand des mit "password" gesetzten Passworts.'],
      ['login local', 'Aktiviert stattdessen die Anmeldung mit einem vorher per "username" angelegten lokalen Benutzer.'],
      ['exec-timeout <Minuten> <Sekunden>', 'Legt die Inaktivitätszeit fest, nach der die Sitzung automatisch abgemeldet wird - "exec-timeout 0 0" bedeutet "niemals abmelden" (in der Praxis nur mit Bedacht einsetzen).'],
    ] },
  ]));

  exps.push(explanation('ios-speichern-classic', 'IOS-Grundkonfiguration: Konfiguration speichern', 'classic', [
    { type: 'text', content: 'Wie schon in der Lektion "Grundlagen" beschrieben, ist die running-config nur im flüchtigen RAM aktiv - erst ein explizites Speichern überträgt sie dauerhaft ins NVRAM.' },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['write', 'Kurzform zum Sichern der aktuellen Konfiguration (entspricht im Ergebnis "copy running-config startup-config").'],
      ['copy running-config startup-config', 'Sichert die aktive Konfiguration (running-config) dauerhaft als startup-config im NVRAM.'],
      ['do write', 'Führt "write" auch innerhalb eines Konfigurationsmodus aus, ohne diesen vorher verlassen zu müssen.'],
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 6. Troubleshooting
  // ---------------------------------------------------------------------
  exps.push(explanation('troubleshooting-classic', 'Troubleshooting: die wichtigsten show-Befehle', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wann verwenden'], rows: [
      ['show ip interface brief', 'Schneller Überblick über den Status (up/down) und die IP-Adresse aller Schnittstellen - der erste Befehl bei fast jedem Verbindungsproblem.'],
      ['show vlan brief', 'Zeigt, welche VLANs existieren und welche Ports welchem VLAN zugewiesen sind - hilfreich, wenn ein Gerät im "falschen" Netz zu landen scheint.'],
      ['show interfaces trunk', 'Zeigt, welche Ports aktuell als Trunk arbeiten und welche VLANs darüber erlaubt sind - hilfreich, wenn VLANs zwischen Switches nicht ankommen.'],
      ['show interfaces status', 'Zeigt kompakt Status, VLAN-Zuordnung, Duplex und Geschwindigkeit aller Ports auf einen Blick - guter Einstieg, um sich schnell einen Gesamtüberblick zu verschaffen.'],
    ] },
    { type: 'text', content: 'Merke: "show ip interface brief" für den Verbindungsstatus, "show vlan brief" für die VLAN-Zuordnung, "show interfaces trunk" für Trunk-Probleme, "show interfaces status" für den Gesamtüberblick.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'VLAN anlegen und einem Access-Port zuweisen: "vlan <ID>" → "name <Name>" → "interface <Interface>" → "switchport mode access" → "switchport access vlan <ID>". Prüfen: "show vlan brief".',
      'Trunk-Port: "switchport mode trunk" → "switchport trunk allowed vlan <Liste>". Prüfen: "show interfaces trunk".',
      'Ungenutzte Ports: mit "interface range" auswählen, einem isolierten VLAN zuweisen und mit "shutdown" deaktivieren.',
      'IOS-Grundkonfiguration: "enable" → "configure terminal" → "hostname" / "ip domain-name" → "enable secret" → "username ... secret ..." → "line console 0" mit "login local" und "exec-timeout" → "service password-encryption" → speichern mit "write" bzw. "copy running-config startup-config".',
      'Troubleshooting: "show ip interface brief" (Status), "show vlan brief" (VLAN-Zuordnung), "show interfaces trunk" (Trunk-VLANs), "show interfaces status" (Gesamtüberblick).',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'vlan-config-ordering',
      type: 'ordering',
      question: 'Bringe die Befehle zum Anlegen eines VLANs und Zuweisen an einen Port in die richtige Reihenfolge.',
      items: [
        { id: 'vlan', label: 'vlan 10' },
        { id: 'name', label: 'name Verwaltung' },
        { id: 'interface', label: 'interface fa0/1' },
        { id: 'assign', label: 'switchport access vlan 10' },
      ],
      correctOrder: ['vlan', 'name', 'interface', 'assign'],
      explanation: 'Zuerst das VLAN anlegen und benennen, danach die Schnittstelle auswählen und ihr das VLAN zuweisen.',
    },
    {
      id: 'ios-grundkonfig-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte einer grundlegenden Geräteabsicherung in die richtige Reihenfolge.',
      items: [
        { id: 'enable', label: 'enable' },
        { id: 'conft', label: 'configure terminal' },
        { id: 'hostname', label: 'hostname SW1' },
        { id: 'secret', label: 'enable secret <Passwort>' },
        { id: 'save', label: 'copy running-config startup-config' },
      ],
      correctOrder: ['enable', 'conft', 'hostname', 'secret', 'save'],
      explanation: 'Erst in den Privileged EXEC, dann in den Global Config wechseln, Hostname und Passwort setzen, zuletzt speichern.',
    },
    {
      id: 'access-trunk-matching',
      type: 'matching',
      question: 'Ordne jeden Befehl seiner Bedeutung zu.',
      pairs: [
        { left: 'switchport mode access', leftLabel: 'switchport mode access', right: 'Legt den Port als Access-Port fest' },
        { left: 'switchport mode trunk', leftLabel: 'switchport mode trunk', right: 'Legt den Port als Trunk-Port fest' },
        { left: 'switchport trunk allowed vlan', leftLabel: 'switchport trunk allowed vlan', right: 'Legt fest, welche VLANs über den Trunk erlaubt sind' },
        { left: 'show interfaces trunk', leftLabel: 'show interfaces trunk', right: 'Zeigt alle aktuell konfigurierten Trunk-Ports' },
      ],
      explanation: 'Access = ein VLAN pro Port, Trunk = mehrere VLANs über eine Leitung, "allowed vlan" grenzt diese ein, "show interfaces trunk" zeigt den Status.',
    },
    {
      id: 'ios-passwort-matching',
      type: 'matching',
      question: 'Ordne jeden Befehl seiner Bedeutung zu.',
      pairs: [
        { left: 'enable secret', leftLabel: 'enable secret', right: 'Verschlüsseltes Passwort für den Privileged EXEC Mode' },
        { left: 'login local', leftLabel: 'login local', right: 'Anmeldung mit einem lokal angelegten Benutzer' },
        { left: 'exec-timeout 0 0', leftLabel: 'exec-timeout 0 0', right: 'Sitzung wird nie automatisch wegen Inaktivität abgemeldet' },
        { left: 'service password-encryption', leftLabel: 'service password-encryption', right: 'Verschlüsselt im Klartext gespeicherte Passwörter in der Konfiguration' },
      ],
      explanation: '"enable secret" verschlüsselt das Privileged-Passwort, "login local" nutzt lokale Benutzer, "exec-timeout 0 0" deaktiviert das automatische Abmelden, "service password-encryption" verschlüsselt Klartext-Passwörter.',
    },
    {
      id: 'troubleshooting-select',
      type: 'select-best',
      question: 'Ein PC in VLAN 20 kann einen Server erreichen, der eigentlich in VLAN 10 sein sollte - offenbar wurde der Switch-Port falsch konfiguriert. Mit welchem Befehl prüfst du zuerst, welchem VLAN die Ports zugewiesen sind?',
      options: ['show interfaces trunk', 'show vlan brief', 'show ip interface brief', 'copy running-config startup-config'],
      correct: 1,
      explanation: '"show vlan brief" zeigt direkt, welche Ports welchem VLAN zugewiesen sind - der schnellste Weg, eine falsche VLAN-Zuordnung zu erkennen.',
    },
    {
      id: 'unused-ports-input',
      type: 'input',
      question: 'Mit welchem Befehl deaktivierst du eine zuvor mit "interface range" ausgewählte Gruppe von Ports? (Befehl eingeben)',
      answers: ['shutdown'],
      explanation: '"shutdown" deaktiviert die ausgewählten Schnittstellen administrativ.',
    },
  ];
}

function buildQuiz() {
  return [
    // --- VLAN ---
    { question: 'Welcher Befehl legt ein neues VLAN mit der ID 10 an?', options: ['vlan 10', 'switchport access vlan 10', 'interface vlan 10', 'name 10'], correct: 0, explanation: '"vlan 10" legt das VLAN an bzw. wechselt in dessen Konfigurationsmodus.' },
    { question: 'Welcher Befehl vergibt einem VLAN einen sprechenden Namen?', options: ['hostname', 'name', 'ip domain-name', 'username'], correct: 1, explanation: 'Innerhalb der VLAN-Konfiguration vergibt "name <Name>" die Bezeichnung.' },
    { question: 'Mit welchem Befehl siehst du, welche Ports welchem VLAN zugewiesen sind?', options: ['show interfaces trunk', 'show vlan brief', 'show running-config vlan', 'show ip route'], correct: 1, explanation: '"show vlan brief" listet alle VLANs mit ihren zugewiesenen Ports.' },
    // --- Access ---
    { question: 'Welcher Befehl legt einen Port als Access-Port fest?', options: ['switchport mode trunk', 'switchport mode access', 'switchport access vlan', 'interface range'], correct: 1, explanation: '"switchport mode access" definiert den Port-Typ als Access-Port.' },
    { question: 'Wie viele VLANs überträgt ein klassischer Access-Port?', options: ['Beliebig viele', 'Genau eines', 'Immer genau zwei', 'Keines'], correct: 1, explanation: 'Ein Access-Port ist immer genau einem VLAN zugeordnet.' },
    // --- Trunk ---
    { question: 'Welcher Befehl legt einen Port als Trunk-Port fest?', options: ['switchport mode access', 'switchport mode trunk', 'switchport trunk allowed vlan', 'vlan trunk'], correct: 1, explanation: '"switchport mode trunk" definiert den Port-Typ als Trunk.' },
    { question: 'Womit schränkst du ein, welche VLANs über einen Trunk erlaubt sind?', options: ['switchport trunk allowed vlan <Liste>', 'switchport access vlan <Liste>', 'vlan allowed <Liste>', 'interface range <Liste>'], correct: 0, explanation: '"switchport trunk allowed vlan" legt die erlaubten VLAN-IDs für den Trunk fest.' },
    { question: 'Welcher Befehl zeigt alle aktuell als Trunk konfigurierten Ports?', options: ['show vlan brief', 'show ip interface brief', 'show interfaces trunk', 'show running-config'], correct: 2, explanation: '"show interfaces trunk" zeigt Trunk-Ports inklusive erlaubter VLANs.' },
    // --- Ungenutzte Ports ---
    { question: 'Warum stellen ungenutzte, aktive Switch-Ports ein Sicherheitsrisiko dar?', options: ['Sie verbrauchen zu viel Strom', 'Unbefugte könnten sich darüber Zugang zum Netz verschaffen', 'Sie verlangsamen alle anderen Ports', 'Sie verhindern VLAN-Konfigurationen'], correct: 1, explanation: 'Ein aktiver, ungenutzter Port kann von Unbefugten für unbemerkten Netzzugang missbraucht werden.' },
    { question: 'Mit welchem Befehl wählst du mehrere Schnittstellen gleichzeitig aus, z. B. fa0/3 bis fa0/24?', options: ['interface range fa0/3-24', 'interface group fa0/3-24', 'switchport range fa0/3-24', 'vlan range fa0/3-24'], correct: 0, explanation: '"interface range" wählt einen Bereich von Schnittstellen für eine gemeinsame Konfiguration aus.' },
    { question: 'Welcher Befehl deaktiviert eine Schnittstelle administrativ?', options: ['no interface', 'shutdown', 'switchport mode access', 'disable'], correct: 1, explanation: '"shutdown" deaktiviert den Port, bis er bewusst wieder aktiviert wird.' },
    // --- IOS-Grundkonfiguration ---
    { question: 'Welcher Befehl zeigt im aktuellen Modus die verfügbaren Befehle bzw. hilft bei der Eingabe?', options: ['help', '?', 'show help', 'man'], correct: 1, explanation: 'Das Fragezeichen "?" ist die eingebaute Hilfe der Cisco-CLI.' },
    { question: 'Welcher Befehl wechselt vom Privileged EXEC in den Global Configuration Mode?', options: ['enable', 'configure terminal', 'line console 0', 'exit'], correct: 1, explanation: '"configure terminal" (kurz "conf t") wechselt in den Global Configuration Mode.' },
    { question: 'Womit vergibst du ein verschlüsseltes (gehashtes) Passwort für den Privileged EXEC Mode?', options: ['enable password', 'enable secret', 'username secret', 'service password-encryption'], correct: 1, explanation: '"enable secret" speichert das Passwort gehasht - der empfohlene Standardweg.' },
    { question: 'Womit legst du einen lokalen Benutzer mit Passwort an?', options: ['hostname', 'username <Name> secret <Passwort>', 'enable secret', 'ip domain-name'], correct: 1, explanation: '"username <Name> secret/password <Passwort>" legt einen lokalen Benutzer an.' },
    { question: 'Welche Befehlsfolge aktiviert die Anmeldung an der Konsole mit einem vorher angelegten lokalen Benutzer?', options: ['line console 0 → login', 'line console 0 → login local', 'configure terminal → login local', 'enable → login local'], correct: 1, explanation: 'Innerhalb von "line console 0" aktiviert "login local" die Anmeldung mit lokal angelegten Benutzern.' },
    { question: 'Was bewirkt "exec-timeout 0 0"?', options: ['Die Sitzung wird nach 0 Sekunden beendet', 'Die Sitzung wird wegen Inaktivität niemals automatisch beendet', 'Der Konsolenzugang wird komplett deaktiviert', 'Alle Passwörter werden gelöscht'], correct: 1, explanation: '"0 0" (0 Minuten, 0 Sekunden) bedeutet in diesem Kontext "kein automatisches Timeout".' },
    { question: 'Wofür wird "service password-encryption" verwendet?', options: ['Um VLANs zu verschlüsseln', 'Um im Klartext gespeicherte Passwörter in der Konfiguration zu verschlüsseln', 'Um Trunks abzusichern', 'Um die running-config zu löschen'], correct: 1, explanation: 'Der Befehl verschlüsselt Passwörter, die sonst im Klartext in der Konfiguration sichtbar wären.' },
    { question: 'Welcher Befehl führt einen show-Befehl aus dem Configuration Mode heraus aus, ohne diesen zu verlassen?', options: ['no', 'do', 'exit', 'end'], correct: 1, explanation: '"do <Befehl>" führt einen Privileged-EXEC-Befehl direkt aus dem Configuration Mode heraus aus.' },
    { question: 'Was passiert, wenn du einen Konfigurationsbefehl mit vorangestelltem "no" eingibst?', options: ['Der Befehl wird zweimal ausgeführt', 'Die Wirkung des Befehls wird umgekehrt/entfernt', 'Der Befehl wird zwischengespeichert', 'Das Gerät startet neu'], correct: 1, explanation: '"no" vor einem Befehl macht dessen Konfiguration rückgängig.' },
    { question: 'Welcher Befehl sichert die aktive Konfiguration dauerhaft ins NVRAM?', options: ['write oder copy running-config startup-config', 'show running-config', 'reload', 'erase startup-config'], correct: 0, explanation: '"write" bzw. "copy running-config startup-config" sichert die running-config dauerhaft.' },
    // --- Troubleshooting ---
    { question: 'Welcher Befehl gibt den schnellsten Überblick über Status und IP-Adresse aller Schnittstellen?', options: ['show vlan brief', 'show ip interface brief', 'show interfaces trunk', 'show running-config'], correct: 1, explanation: '"show ip interface brief" ist meist der erste Befehl bei einem Verbindungsproblem.' },
    { question: 'Welcher Befehl hilft, wenn ein Gerät scheinbar im falschen VLAN landet?', options: ['show interfaces status', 'show vlan brief', 'show ip route', 'show version'], correct: 1, explanation: '"show vlan brief" zeigt direkt die VLAN-Zuordnung jedes Ports.' },
    { question: 'Welcher Befehl zeigt kompakt Status, VLAN, Duplex und Geschwindigkeit aller Ports auf einen Blick?', options: ['show interfaces status', 'show vlan brief', 'show interfaces trunk', 'show ip interface brief'], correct: 0, explanation: '"show interfaces status" liefert einen kompakten Gesamtüberblick über alle Ports.' },
  ];
}

export function buildCiscoGrundkonfigurationLesson() {
  return {
    title: 'Grundkonfiguration',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'VLAN anlegen und einem Access-Port zuweisen: "vlan <ID>" → "name <Name>" → "interface <Interface>" → "switchport mode access" → "switchport access vlan <ID>", prüfen: "show vlan brief".',
      'Trunk-Port: "switchport mode trunk" → "switchport trunk allowed vlan <Liste>" - mehrere VLANs, getaggt, prüfen mit "show interfaces trunk".',
      'Ungenutzte Ports: mit "interface range" auswählen, isoliertem VLAN zuweisen, mit "shutdown" deaktivieren - schließt ein Sicherheitsrisiko.',
      'IOS-Grundkonfiguration: enable → configure terminal → hostname/ip domain-name → enable secret → username ... secret ... → line console 0 (login local, exec-timeout) → service password-encryption → write/copy running-config startup-config.',
      'Troubleshooting: show ip interface brief (Status), show vlan brief (VLAN-Zuordnung), show interfaces trunk (Trunk-VLANs), show interfaces status (Gesamtüberblick).',
    ],
  };
}
