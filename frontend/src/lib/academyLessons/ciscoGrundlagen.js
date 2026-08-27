import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Grundlagen" - the new entry-point lesson for the "Cisco - Packet Tracer"
// category. Covers Cisco device/network fundamentals (hierarchical design,
// device types, interfaces, IOS, memory, config files, boot process, CLI
// access/configuration modes, ROMMON/factory reset, CLI conveniences) before
// the hands-on Packet Tracer topics that follow it. Structured exactly like
// every other LessonRunner lesson (theory sections, then exercises, then a
// quiz) - no new mechanics introduced.
// =============================================================================

export const CISCO_GRUNDLAGEN_TOPIC_KEY = topicKey('cisco-packet-tracer', 'grundlagen');

const HIERARCHY_SVG = `<svg viewBox="0 0 240 180" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><rect x="70" y="10" width="100" height="30" rx="6" fill="#00f0ff" opacity="0.9"/><text x="120" y="30" text-anchor="middle" fill="#0a1628" font-size="12" font-weight="bold">Core</text><rect x="30" y="70" width="80" height="30" rx="6" fill="#00f0ff" opacity="0.6"/><text x="70" y="90" text-anchor="middle" fill="#0a1628" font-size="11" font-weight="bold">Distribution</text><rect x="130" y="70" width="80" height="30" rx="6" fill="#00f0ff" opacity="0.6"/><text x="170" y="90" text-anchor="middle" fill="#0a1628" font-size="11" font-weight="bold">Distribution</text><rect x="10" y="130" width="60" height="30" rx="6" fill="#00f0ff" opacity="0.35"/><text x="40" y="150" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">Access</text><rect x="90" y="130" width="60" height="30" rx="6" fill="#00f0ff" opacity="0.35"/><text x="120" y="150" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">Access</text><rect x="170" y="130" width="60" height="30" rx="6" fill="#00f0ff" opacity="0.35"/><text x="200" y="150" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">Access</text><line x1="120" y1="40" x2="70" y2="70" stroke="#8b949e" stroke-width="2"/><line x1="120" y1="40" x2="170" y2="70" stroke="#8b949e" stroke-width="2"/><line x1="70" y1="100" x2="40" y2="130" stroke="#8b949e" stroke-width="2"/><line x1="70" y1="100" x2="120" y2="130" stroke="#8b949e" stroke-width="2"/><line x1="170" y1="100" x2="200" y2="130" stroke="#8b949e" stroke-width="2"/></svg>`;

const DEVICE_COMPARISON_SVG = `<svg viewBox="0 0 320 180" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="90" height="160" rx="8" fill="#00f0ff" opacity="0.2" stroke="#00f0ff" stroke-width="2"/><text x="55" y="30" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">L2-Switch</text><text x="55" y="55" text-anchor="middle" fill="#8b949e" font-size="9">Layer 2</text><text x="55" y="80" text-anchor="middle" fill="#8b949e" font-size="9">MAC-Adressen</text><text x="55" y="105" text-anchor="middle" fill="#8b949e" font-size="9">ein VLAN</text><text x="55" y="140" text-anchor="middle" fill="#c9d1d9" font-size="9">Access-Layer</text><rect x="115" y="10" width="90" height="160" rx="8" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="30" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Multilayer</text><text x="160" y="50" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Switch</text><text x="160" y="75" text-anchor="middle" fill="#8b949e" font-size="9">Layer 2 + 3</text><text x="160" y="100" text-anchor="middle" fill="#8b949e" font-size="9">MAC + IP</text><text x="160" y="125" text-anchor="middle" fill="#8b949e" font-size="9">Routing</text><text x="160" y="150" text-anchor="middle" fill="#c9d1d9" font-size="9">Distribution/Core</text><rect x="220" y="10" width="90" height="160" rx="8" fill="#00f0ff" opacity="0.5" stroke="#00f0ff" stroke-width="2"/><text x="265" y="35" text-anchor="middle" fill="#0a1628" font-size="11" font-weight="bold">Router</text><text x="265" y="60" text-anchor="middle" fill="#0a1628" font-size="9">Layer 3</text><text x="265" y="85" text-anchor="middle" fill="#0a1628" font-size="9">IP-Adressen</text><text x="265" y="110" text-anchor="middle" fill="#0a1628" font-size="9">Netze verbinden</text><text x="265" y="145" text-anchor="middle" fill="#0a1628" font-size="9">WAN/Internet</text></svg>`;

const BOOT_FLOW_SVG = `<svg viewBox="0 0 240 260" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><rect x="70" y="10" width="100" height="30" rx="6" fill="#00f0ff" opacity="0.9"/><text x="120" y="30" text-anchor="middle" fill="#0a1628" font-size="11" font-weight="bold">POWER ON</text><polygon points="120,45 110,60 130,60" fill="#8b949e"/><rect x="70" y="65" width="100" height="30" rx="6" fill="#00f0ff" opacity="0.75"/><text x="120" y="85" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">POST</text><polygon points="120,100 110,115 130,115" fill="#8b949e"/><rect x="70" y="120" width="100" height="30" rx="6" fill="#00f0ff" opacity="0.6"/><text x="120" y="140" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">BOOTLOADER</text><polygon points="120,155 110,170 130,170" fill="#8b949e"/><rect x="70" y="175" width="100" height="30" rx="6" fill="#00f0ff" opacity="0.45"/><text x="120" y="190" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">IOS aus Flash</text><polygon points="120,210 110,225 130,225" fill="#8b949e"/><rect x="70" y="230" width="100" height="25" rx="6" fill="#00f0ff" opacity="0.3"/><text x="120" y="247" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">startup-config</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Hierarchisches Netzwerk-Design
  // ---------------------------------------------------------------------
  exps.push(explanation('hierarchie-classic', 'Hierarchisches Netzwerk', 'classic', [
    { type: 'text', content: 'Größere Netzwerke werden nicht wahllos verkabelt, sondern nach einem hierarchischen Modell mit drei Schichten aufgebaut: Access, Distribution und Core. Das macht das Netzwerk übersichtlicher, leichter zu erweitern und einfacher zu warten.' },
    { type: 'diagram', content: HIERARCHY_SVG },
    { type: 'list', title: 'Die drei Schichten', items: [
      'Access-Layer: Verbindet Endgeräte (PCs, Drucker, IP-Telefone) mit dem Netzwerk. Hier arbeiten typischerweise L2-Switches.',
      'Distribution-Layer: Fasst mehrere Access-Switches zusammen, übernimmt Routing zwischen VLANs und Policy-Durchsetzung.',
      'Core-Layer: Das schnelle "Rückgrat" des Netzwerks. Leitet Daten zwischen den Distribution-Geräten so schnell wie möglich weiter - ohne aufwändige Filterung.',
    ] },
  ]));

  exps.push(explanation('hierarchie-intuitive', 'Hierarchisches Netzwerk', 'intuitive', [
    { type: 'text', content: 'Stell dir eine Stadt vor: Wohnstraßen (Access) führen zu Sammelstraßen (Distribution), die wiederum auf die Autobahn (Core) führen. Jede Ebene hat eine klare Aufgabe, und Störungen bleiben meist lokal begrenzt.' },
  ]));

  // ---------------------------------------------------------------------
  // 2. Collapsed Core
  // ---------------------------------------------------------------------
  exps.push(explanation('collapsed-core-classic', 'Collapsed Core', 'classic', [
    { type: 'text', content: 'In kleineren Netzwerken lohnt sich oft keine strikte Drei-Schichten-Trennung. Beim "Collapsed Core"-Design werden Distribution- und Core-Layer auf denselben Geräten zusammengefasst (kollabiert) - es bleiben effektiv nur zwei Schichten: Access und ein kombinierter Distribution/Core-Layer.' },
    { type: 'list', title: 'Wann sinnvoll?', items: [
      'Kleine bis mittlere Standorte mit überschaubarer Anzahl an Switches.',
      'Wenn die Kosten/Komplexität einer vollen Drei-Schichten-Architektur nicht gerechtfertigt sind.',
      'Weiterhin skalierbar: Bei Wachstum kann später wieder in drei getrennte Schichten aufgeteilt werden.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 3. Netzwerkgeräte: L2-Switch, Multilayer-Switch, Router
  // ---------------------------------------------------------------------
  exps.push(explanation('geraete-classic', 'L2-Switch, Multilayer-Switch und Router', 'classic', [
    { type: 'list', title: 'Die drei zentralen Gerätetypen', items: [
      'L2-Switch (Layer-2-Switch): Vermittelt Datenverkehr innerhalb eines lokalen Netzes anhand von MAC-Adressen. Typisch im Access-Layer.',
      'Multilayer-Switch (Layer-3-Switch): Kann zusätzlich zur klassischen Switch-Funktion auch routen - also Datenverkehr zwischen verschiedenen Subnetzen/VLANs weiterleiten. Typisch im Distribution- oder Core-Layer.',
      'Router: Verbindet unterschiedliche Netzwerke (z. B. LAN mit WAN/Internet) und trifft Weiterleitungsentscheidungen anhand von IP-Adressen (Schicht 3).',
    ] },
    { type: 'text', content: 'Merksatz: Ein L2-Switch bleibt innerhalb eines Netzes, ein Router und ein Multilayer-Switch können zwischen Netzen vermitteln.' },
  ]));

  exps.push(explanation('geraete-compare-visual', 'Gerätetypen im Vergleich', 'visual', [
    { type: 'diagram', content: DEVICE_COMPARISON_SVG },
    { type: 'table', headers: ['Gerät', 'Layer 2', 'Layer 3', 'Typische Aufgabe'], rows: [
      ['L2-Switch', 'Ja', 'Nein (nur Management-SVI)', 'Frames im LAN'],
      ['Multilayer-Switch', 'Ja', 'Ja', 'Switching + Routing'],
      ['Router', 'Nein im klassischen LAN-Switching-Sinn', 'Ja', 'Netze verbinden'],
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 4. Schnittstellen: Bezeichnungen und Geschwindigkeiten
  // ---------------------------------------------------------------------
  exps.push(explanation('interfaces-classic', 'Schnittstellen und Schnittstellenbezeichnungen', 'classic', [
    { type: 'text', content: 'Jede physische Schnittstelle (Interface) eines Cisco-Geräts hat einen Typ und eine Nummerierung, die ihre Position im Gerät (Slot/Modul/Port) beschreibt.' },
    { type: 'table', headers: ['Bezeichnung', 'Typischer Name', 'Geschwindigkeit'], rows: [
      ['Ethernet', 'Ethernet0/0', '10 Mbit/s'],
      ['FastEthernet', 'FastEthernet0/1', '100 Mbit/s'],
      ['GigabitEthernet', 'GigabitEthernet0/0', '1.000 Mbit/s (1 Gbit/s)'],
      ['TenGigabitEthernet', 'TenGigabitEthernet0/1', '10.000 Mbit/s (10 Gbit/s)'],
      ['Serial', 'Serial0/0/0', 'variabel (WAN-Verbindung)'],
    ] },
    { type: 'text', content: 'Die Schreibweise Modul/Port (z. B. GigabitEthernet0/1) gibt an, in welchem Steckplatz (Modul) und an welchem Port sich die Schnittstelle befindet. Bei modularen Geräten kommt oft noch eine dritte Zahl für den Steckplatz einer Erweiterungskarte hinzu (z. B. Serial0/1/0).' },
  ]));

  // ---------------------------------------------------------------------
  // 5. Cisco IOS
  // ---------------------------------------------------------------------
  exps.push(explanation('ios-classic', 'Cisco IOS', 'classic', [
    { type: 'text', content: 'Cisco IOS (Internetwork Operating System) ist das Betriebssystem, das auf Cisco-Switches und -Routern läuft. Es stellt die Kommandozeile (CLI) bereit, über die das Gerät konfiguriert und überwacht wird.' },
    { type: 'text', content: 'IOS wird als Datei (Image) im Flash-Speicher des Geräts abgelegt und beim Systemstart in den Arbeitsspeicher (RAM) geladen und dort ausgeführt.' },
  ]));

  // ---------------------------------------------------------------------
  // 6. Speicherkomponenten
  // ---------------------------------------------------------------------
  exps.push(explanation('speicher-classic', 'Speicherkomponenten', 'classic', [
    { type: 'table', headers: ['Speicher', 'Inhalt', 'Flüchtig?'], rows: [
      ['ROM', 'Bootstrap-Programm, ROMMON, Basis-Diagnoseprogramme', 'Nein (nicht veränderbar)'],
      ['Flash', 'Das IOS-Betriebssystem-Image (und ggf. Backup-Images)', 'Nein (überschreibbar)'],
      ['NVRAM', 'Die startup-config (gespeicherte Konfiguration)', 'Nein'],
      ['RAM', 'Die running-config (aktive Konfiguration), laufendes IOS, Routing-/ARP-Tabellen', 'Ja - Inhalt geht beim Ausschalten verloren'],
    ] },
    { type: 'text', content: 'Merksatz: "RAM ist flüchtig, NVRAM nicht" - deshalb muss die running-config aus dem RAM erst per "copy running-config startup-config" ins NVRAM gesichert werden, sonst ist sie nach einem Neustart weg.' },
  ]));

  // ---------------------------------------------------------------------
  // 7. Konfigurationsdateien
  // ---------------------------------------------------------------------
  exps.push(explanation('configfiles-classic', 'Konfigurationsdateien', 'classic', [
    { type: 'list', title: 'Die zwei zentralen Konfigurationsdateien', items: [
      'running-config: Die aktuell aktive Konfiguration im RAM. Jede Änderung im Konfigurationsmodus wirkt sich sofort auf die running-config aus.',
      'startup-config: Die gespeicherte Konfiguration im NVRAM, die beim nächsten Neustart geladen wird.',
    ] },
    { type: 'text', content: 'Änderungen an der running-config sind ohne explizites Speichern NICHT dauerhaft. Der Befehl "copy running-config startup-config" (kurz: "copy run start") überträgt die aktive Konfiguration dauerhaft ins NVRAM.' },
  ]));

  // ---------------------------------------------------------------------
  // 8. Bootvorgang
  // ---------------------------------------------------------------------
  exps.push(explanation('boot-classic', 'Der Bootvorgang', 'classic', [
    { type: 'text', content: 'Beim Einschalten eines Cisco-Geräts läuft ein fester Ablauf ab, bevor das Gerät betriebsbereit ist.' },
    { type: 'list', title: 'Schritte des Bootvorgangs', items: [
      '1. POST (Power-On Self-Test): Das Gerät prüft die eigene Hardware auf Funktionsfähigkeit.',
      '2. Das Bootstrap-Programm aus dem ROM wird ausgeführt und sucht das IOS-Image.',
      '3. Das IOS-Image wird aus dem Flash-Speicher in den RAM geladen und gestartet.',
      '4. Die startup-config wird aus dem NVRAM geladen und als running-config in den RAM übernommen.',
    ] },
    { type: 'text', content: 'Wird keine startup-config gefunden (z. B. bei einem neuen, unkonfigurierten Gerät), startet das Gerät stattdessen in den Setup Mode.' },
  ]));

  exps.push(explanation('boot-visual', 'Bootvorgang als Ablauf', 'visual', [
    { type: 'diagram', content: BOOT_FLOW_SVG },
    { type: 'text', content: 'Merke: Ohne gültiges IOS-Image landet das Gerät im ROMMON. Ohne startup-config startet der Setup Mode.' },
  ]));

  // ---------------------------------------------------------------------
  // 9. Zugriff und Inbetriebnahme
  // ---------------------------------------------------------------------
  exps.push(explanation('zugriff-classic', 'Serieller Zugriff und Inbetriebnahme', 'classic', [
    { type: 'text', content: 'Ein neues, noch nicht im Netzwerk erreichbares Gerät wird zunächst über den Konsolenport in Betrieb genommen - meist über ein serielles Konsolenkabel (RJ45-zu-USB oder RJ45-zu-DB9) und ein Terminalprogramm.' },
    { type: 'list', title: 'Typische Terminal-Einstellungen', items: [
      'Baudrate: 9600 Bit/s',
      '8 Datenbits, keine Parität, 1 Stoppbit (8-N-1)',
      'Keine Flusssteuerung',
    ] },
    { type: 'text', content: 'Über den Konsolenzugang lässt sich das Gerät konfigurieren, auch wenn noch keine IP-Adresse oder Netzwerkverbindung besteht - das ist besonders bei der Erstinbetriebnahme wichtig.' },
  ]));

  // ---------------------------------------------------------------------
  // 10. Konfigurationsmodi und Wechsel zwischen ihnen
  // ---------------------------------------------------------------------
  exps.push(explanation('modi-classic', 'Konfigurationsmodi', 'classic', [
    { type: 'table', headers: ['Modus', 'Prompt', 'Zweck'], rows: [
      ['User EXEC Mode', 'Router>', 'Eingeschränkter Modus direkt nach dem Login, nur einfache Befehle (z. B. show-Befehle mit Einschränkungen).'],
      ['Privileged EXEC Mode', 'Router#', 'Erweiterte Rechte, alle show-/Diagnosebefehle, Ausgangspunkt für die Konfiguration.'],
      ['Global Configuration Mode', 'Router(config)#', 'Änderungen, die das gesamte Gerät betreffen (z. B. Hostname, Passwörter).'],
      ['Interface Configuration Mode', 'Router(config-if)#', 'Änderungen an einer bestimmten Schnittstelle (z. B. IP-Adresse).'],
      ['Line Configuration Mode', 'Router(config-line)#', 'Änderungen an einer Zugriffslinie (Konsole, VTY, AUX).'],
    ] },
    { type: 'list', title: 'Wechsel zwischen den Modi', items: [
      'User EXEC → Privileged EXEC: Befehl "enable" (ggf. Passwort erforderlich)',
      'Privileged EXEC → Global Config: Befehl "configure terminal" (kurz "conf t")',
      'Global Config → Interface Config: Befehl "interface <Name>" (z. B. "interface gi0/1")',
      'Zurück eine Ebene: "exit"',
      'Direkt zurück zum Privileged EXEC: "end" oder Tastenkombination Strg+Z',
    ] },
  ]));

  exps.push(explanation('modi-intuitive', 'Konfigurationsmodi', 'intuitive', [
    { type: 'text', content: 'Stell dir die Modi wie Zimmer in einem Haus vor: Du kommst zunächst in den Flur (User EXEC), brauchst einen Schlüssel für das Wohnzimmer (Privileged EXEC), von dort einen weiteren für den Keller (Global Config), und von dort einen für einen bestimmten Raum im Keller (Interface Config). "exit" bringt dich einen Raum zurück, "end" direkt zurück ins Wohnzimmer.' },
  ]));

  exps.push(explanation('cli-hilfe-classic', 'Das IOS-Hilfesystem nutzen', 'classic', [
    { type: 'text', content: 'Ein guter Administrator muss nicht jeden Befehl auswendig kennen. Die Cisco-CLI hilft kontextsensitiv weiter.' },
    { type: 'list', title: 'Hilfsmittel', items: [
      '?: Zeigt im aktuellen Modus alle verfügbaren Befehle an.',
      'Tab: Vervollständigt eine eindeutig erkennbare Befehlseingabe.',
      'Abkürzungen: Befehle dürfen verkürzt werden, solange sie eindeutig bleiben (z. B. "conf t" für "configure terminal").',
      'Fehlermeldungen: "% Ambiguous command", "% Incomplete command", "% Invalid input detected" zeigen präzise, was schiefläuft.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 11. Setup Mode, ROMMON, Werksreset
  // ---------------------------------------------------------------------
  exps.push(explanation('setup-rommon-classic', 'Setup Mode, ROMMON und Werksreset', 'classic', [
    { type: 'list', title: 'Setup Mode', items: [
      'Startet automatisch, wenn das Gerät beim Booten keine startup-config im NVRAM findet.',
      'Führt in einem geführten Dialog durch die grundlegende Erstkonfiguration (Hostname, Passwörter, IP-Adressen).',
      'Kann jederzeit mit Strg+C abgebrochen werden, um die Konfiguration manuell über die CLI vorzunehmen.',
    ] },
    { type: 'list', title: 'ROMMON (ROM Monitor)', items: [
      'Ein sehr einfacher, im ROM enthaltener Notfall-/Wiederherstellungsmodus.',
      'Wird erreicht, wenn kein gültiges IOS-Image gefunden oder geladen werden kann, oder manuell durch Unterbrechen des Bootvorgangs (z. B. Break-Taste).',
      'Erlaubt grundlegende Wiederherstellungsschritte, z. B. das erneute Laden eines IOS-Images oder das Zurücksetzen des Passworts.',
    ] },
    { type: 'list', title: 'IOS auf Werkseinstellungen zurücksetzen', items: [
      'Befehl: "erase startup-config" löscht die gespeicherte Konfiguration im NVRAM.',
      'Auf Switches zusätzlich "delete vlan.dat", um gespeicherte VLAN-Informationen zu entfernen.',
      'Danach "reload", um das Gerät neu zu starten.',
    ] },
    { type: 'text', content: 'Auswirkungen des Zurücksetzens: Alle individuellen Einstellungen (Hostname, Passwörter, VLANs, IP-Adressen, ACLs usw.) gehen verloren. Das Gerät startet nach dem Neustart ohne startup-config - und damit automatisch wieder im Setup Mode.' },
  ]));

  // ---------------------------------------------------------------------
  // 12. CLI-Komfort
  // ---------------------------------------------------------------------
  exps.push(explanation('cli-classic', 'Befehlsvervollständigung, -verkürzung, Fehlermeldungen und Copy & Paste', 'classic', [
    { type: 'list', title: 'Arbeiten mit der CLI', items: [
      'Befehlsvervollständigung: Die Tabulator-Taste vervollständigt einen eindeutig erkennbaren, angefangenen Befehl automatisch.',
      'Befehlsverkürzung: Befehle dürfen abgekürzt werden, solange sie eindeutig bleiben (z. B. "conf t" statt "configure terminal", "int gi0/1" statt "interface gigabitethernet0/1").',
      'Copy & Paste: Mehrere Konfigurationszeilen können gesammelt in die CLI eingefügt werden - IOS verarbeitet sie Zeile für Zeile, als wären sie einzeln eingegeben worden.',
    ] },
    { type: 'table', headers: ['Fehlermeldung', 'Bedeutung'], rows: [
      ['% Ambiguous command', 'Die Abkürzung ist nicht eindeutig - mehrere Befehle passen dazu.'],
      ['% Incomplete command', 'Der Befehl ist unvollständig - es fehlen noch Parameter.'],
      ['% Invalid input detected at \'^\' marker', 'Der Befehl enthält an der markierten Stelle einen Tippfehler oder ist im aktuellen Modus nicht gültig.'],
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Hierarchisches Design: Access, Distribution, Core - bei kleinen Netzen ggf. als Collapsed Core zusammengefasst.',
      'L2-Switch vermittelt innerhalb eines Netzes, Multilayer-Switch und Router auch zwischen Netzen.',
      'Schnittstellen tragen Typ + Modul/Port (z. B. GigabitEthernet0/1) und haben feste Geschwindigkeiten.',
      'IOS liegt im Flash, running-config im RAM, startup-config im NVRAM, Bootstrap/ROMMON im ROM.',
      'Boot-Reihenfolge: POST → Bootstrap → IOS aus Flash laden → startup-config aus NVRAM laden.',
      'Konfigurationsmodi: User EXEC (>) → Privileged EXEC (#) → Global Config → Interface/Line Config.',
      'Kein startup-config beim Booten → Setup Mode. Kein IOS-Image ladbar → ROMMON.',
      '"erase startup-config" + "reload" setzt auf Werkseinstellungen zurück - alle Einstellungen gehen verloren.',
      'Tab vervollständigt Befehle, Befehle dürfen eindeutig abgekürzt werden, mehrere Zeilen können per Copy & Paste eingefügt werden.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'boot-process-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte des Bootvorgangs in die richtige Reihenfolge.',
      items: [
        { id: 'post', label: 'POST (Power-On Self-Test)' },
        { id: 'bootstrap', label: 'Bootstrap-Programm aus dem ROM ausführen' },
        { id: 'ios', label: 'IOS-Image aus dem Flash in den RAM laden' },
        { id: 'config', label: 'startup-config aus dem NVRAM laden' },
      ],
      correctOrder: ['post', 'bootstrap', 'ios', 'config'],
      explanation: 'Reihenfolge: Erst Selbsttest (POST), dann Bootstrap-Programm, danach IOS aus dem Flash, zuletzt die Konfiguration aus dem NVRAM.',
    },
    {
      id: 'memory-matching',
      type: 'matching',
      question: 'Ordne jede Speicherkomponente ihrem Inhalt zu.',
      pairs: [
        { left: 'ROM', leftLabel: 'ROM', right: 'Bootstrap-Programm / ROMMON' },
        { left: 'Flash', leftLabel: 'Flash', right: 'IOS-Image' },
        { left: 'NVRAM', leftLabel: 'NVRAM', right: 'startup-config' },
        { left: 'RAM', leftLabel: 'RAM', right: 'running-config' },
      ],
      explanation: 'ROM enthält das Bootstrap-Programm und ROMMON, Flash das IOS-Image, NVRAM die startup-config, RAM die aktive running-config.',
    },
    {
      id: 'mode-prompt-matching',
      type: 'matching',
      question: 'Ordne jeden Konfigurationsmodus dem passenden Prompt zu.',
      pairs: [
        { left: 'User EXEC Mode', leftLabel: 'User EXEC Mode', right: 'Router>' },
        { left: 'Privileged EXEC Mode', leftLabel: 'Privileged EXEC Mode', right: 'Router#' },
        { left: 'Global Configuration Mode', leftLabel: 'Global Configuration Mode', right: 'Router(config)#' },
        { left: 'Interface Configuration Mode', leftLabel: 'Interface Configuration Mode', right: 'Router(config-if)#' },
      ],
      explanation: 'User EXEC endet mit ">", Privileged EXEC mit "#", Global Config zeigt "(config)#", Interface Config zeigt "(config-if)#".',
    },
    {
      id: 'error-message-select',
      type: 'select-best',
      question: 'Welche Fehlermeldung erscheint, wenn eine abgekürzte Eingabe nicht eindeutig einem Befehl zugeordnet werden kann?',
      options: ['% Incomplete command', '% Ambiguous command', '% Invalid input detected', '% Access denied'],
      correct: 1,
      explanation: '"% Ambiguous command" bedeutet, dass die Abkürzung zu mehreren möglichen Befehlen passt.',
    },
    {
      id: 'reset-command-input',
      type: 'input',
      question: 'Welcher Befehl löscht die startup-config, um ein Gerät auf Werkseinstellungen zurückzusetzen? (Befehl eingeben)',
      answers: ['erase startup-config', 'erase startup config'],
      explanation: 'Der Befehl "erase startup-config" löscht die gespeicherte Konfiguration im NVRAM; anschließend macht "reload" den Neustart.',
    },
    {
      id: 'cli-enable-conf-term',
      type: 'cli-input',
      question: 'Wechsle vom User EXEC in den Global Configuration Mode (nur die nötigen Befehle).',
      expectedLines: ['enable', 'configure terminal'],
      explanation: '"enable" bringt dich in den Privileged EXEC Mode, "configure terminal" (kurz "conf t") in den Global Configuration Mode.',
    },
    {
      id: 'cli-save-config',
      type: 'cli-input',
      question: 'Speichere die aktuelle running-config dauerhaft als startup-config.',
      expectedLines: ['copy running-config startup-config'],
      explanation: '"copy running-config startup-config" (oder "write") überträgt die aktive Konfiguration ins NVRAM.',
    },
    {
      id: 'cli-show-running-config',
      type: 'cli-input',
      question: 'Zeige die aktuell laufende Konfiguration an.',
      expectedLines: [['show running-config', 'show run']],
      explanation: '"show running-config" (kurz "show run") zeigt die aktive Konfiguration im RAM an.',
    },
    {
      id: 'cli-interface-no-shutdown',
      type: 'cli-input',
      question: 'Das Interface g0/1 ist administrativ deaktiviert. Aktiviere es.',
      expectedLines: ['interface g0/1', 'no shutdown'],
      explanation: 'Zuerst das Interface auswählen, dann "no shutdown" eingeben, um die administrative Deaktivierung aufzuheben.',
    },
  ];
}

function buildQuiz() {
  return [
    // --- Hierarchisches Netzwerk / Layer ---
    { question: 'Aus welchen drei Schichten besteht das klassische hierarchische Netzwerk-Design?', options: ['LAN, WAN, MAN', 'Access, Distribution, Core', 'Physisch, Logisch, Virtuell', 'Client, Server, Cloud'], correct: 1, explanation: 'Das hierarchische Modell besteht aus Access-, Distribution- und Core-Layer.' },
    { question: 'Welche Aufgabe hat der Access-Layer?', options: ['Schnelles Weiterleiten zwischen Distribution-Geräten', 'Verbindung der Endgeräte mit dem Netzwerk', 'Verbindung zum Internet-Provider', 'Verschlüsselung des gesamten Datenverkehrs'], correct: 1, explanation: 'Der Access-Layer verbindet Endgeräte wie PCs und Drucker mit dem Netzwerk.' },
    { question: 'Welche Aufgabe hat der Core-Layer?', options: ['Endgeräte anbinden', 'Möglichst schnelles Weiterleiten von Datenverkehr im Backbone', 'VLANs auf Switchports zuweisen', 'Passwörter verwalten'], correct: 1, explanation: 'Der Core-Layer bildet das schnelle Rückgrat des Netzwerks ohne aufwändige Filterung.' },
    { question: 'Was beschreibt ein "Collapsed Core"-Design?', options: ['Ein komplett ausgefallenes Netzwerk', 'Distribution- und Core-Layer werden auf denselben Geräten zusammengefasst', 'Nur der Access-Layer existiert', 'Vier statt drei Schichten'], correct: 1, explanation: 'Beim Collapsed Core werden Distribution und Core auf denselben Geräten kombiniert - typisch für kleinere Netze.' },
    // --- Geräte ---
    { question: 'Worin unterscheidet sich ein Multilayer-Switch von einem klassischen L2-Switch?', options: ['Er kann zusätzlich zwischen Subnetzen routen', 'Er hat mehr Ports', 'Er benötigt kein Betriebssystem', 'Er kann nur WAN-Verbindungen herstellen'], correct: 0, explanation: 'Ein Multilayer-Switch (L3-Switch) kann zusätzlich zur Switch-Funktion auch zwischen Subnetzen routen.' },
    { question: 'Welches Gerät verbindet typischerweise ein lokales Netzwerk (LAN) mit dem Internet (WAN)?', options: ['L2-Switch', 'Hub', 'Router', 'Repeater'], correct: 2, explanation: 'Ein Router verbindet unterschiedliche Netzwerke, z. B. LAN und WAN.' },
    // --- Interfaces ---
    { question: 'Welche Geschwindigkeit hat eine GigabitEthernet-Schnittstelle typischerweise?', options: ['10 Mbit/s', '100 Mbit/s', '1.000 Mbit/s', '10.000 Mbit/s'], correct: 2, explanation: 'GigabitEthernet arbeitet mit 1.000 Mbit/s (1 Gbit/s).' },
    { question: 'Was gibt die Notation "GigabitEthernet0/1" an?', options: ['Nur die Geschwindigkeit', 'Schnittstellentyp sowie Modul und Port', 'Die IP-Adresse der Schnittstelle', 'Die VLAN-ID'], correct: 1, explanation: 'Die Notation beschreibt Typ, Modul (Slot) und Portnummer der Schnittstelle.' },
    // --- IOS / Speicher / Konfigurationsdateien ---
    { question: 'Was ist Cisco IOS?', options: ['Ein physisches Netzwerkkabel', 'Das Betriebssystem auf Cisco-Switches und -Routern', 'Ein Verschlüsselungsprotokoll', 'Ein Simulationsprogramm'], correct: 1, explanation: 'Cisco IOS ist das Betriebssystem, das die CLI zur Konfiguration bereitstellt.' },
    { question: 'In welchem Speicher liegt das IOS-Image?', options: ['RAM', 'ROM', 'Flash', 'NVRAM'], correct: 2, explanation: 'Das IOS-Image liegt im Flash-Speicher und wird beim Booten in den RAM geladen.' },
    { question: 'Wo liegt die startup-config gespeichert?', options: ['RAM', 'ROM', 'Flash', 'NVRAM'], correct: 3, explanation: 'Die startup-config liegt im NVRAM und wird beim Booten geladen.' },
    { question: 'Was passiert mit der running-config beim Ausschalten des Geräts, wenn sie nicht gespeichert wurde?', options: ['Sie bleibt erhalten', 'Sie geht verloren, da RAM flüchtig ist', 'Sie wird automatisch ins NVRAM kopiert', 'Sie wird ins ROM verschoben'], correct: 1, explanation: 'RAM ist flüchtig - ungespeicherte Änderungen an der running-config gehen beim Ausschalten verloren.' },
    { question: 'Welcher Befehl sichert die aktuelle Konfiguration dauerhaft?', options: ['copy startup-config running-config', 'copy running-config startup-config', 'erase startup-config', 'reload'], correct: 1, explanation: '"copy running-config startup-config" überträgt die aktive Konfiguration dauerhaft ins NVRAM.' },
    // --- Bootvorgang ---
    { question: 'Was passiert direkt nach dem POST beim Bootvorgang?', options: ['Die startup-config wird geladen', 'Das Bootstrap-Programm sucht das IOS-Image', 'Der Setup Mode startet automatisch', 'Das Gerät wechselt in ROMMON'], correct: 1, explanation: 'Nach dem Selbsttest (POST) sucht das Bootstrap-Programm aus dem ROM das IOS-Image.' },
    { question: 'Was passiert, wenn beim Booten keine startup-config im NVRAM gefunden wird?', options: ['Das Gerät schaltet sich ab', 'Es lädt automatisch eine Ersatzkonfiguration aus dem Internet', 'Es startet den Setup Mode', 'Es bleibt dauerhaft im ROMMON'], correct: 2, explanation: 'Fehlt eine startup-config, startet das Gerät den geführten Setup Mode.' },
    // --- Zugriff / Inbetriebnahme ---
    { question: 'Über welchen Anschluss wird ein neues, unkonfiguriertes Gerät typischerweise zuerst in Betrieb genommen?', options: ['Über den Konsolenport (seriell)', 'Über das Internet', 'Über einen VPN-Tunnel', 'Über Bluetooth'], correct: 0, explanation: 'Der serielle Konsolenport erlaubt Zugriff, auch ohne bestehende Netzwerkverbindung.' },
    { question: 'Welche Baudrate wird bei der Konsolenverbindung typischerweise verwendet?', options: ['1200 Bit/s', '9600 Bit/s', '56000 Bit/s', '115200 Bit/s'], correct: 1, explanation: 'Die Standard-Baudrate für die Konsolenverbindung ist 9600 Bit/s.' },
    // --- Konfigurationsmodi ---
    { question: 'Welcher Prompt zeigt den Privileged EXEC Mode an?', options: ['Router>', 'Router#', 'Router(config)#', 'Router(config-if)#'], correct: 1, explanation: 'Der Privileged EXEC Mode endet mit "#".' },
    { question: 'Welcher Befehl wechselt vom Privileged EXEC in den Global Configuration Mode?', options: ['enable', 'configure terminal', 'exit', 'interface'], correct: 1, explanation: '"configure terminal" (kurz "conf t") wechselt in den Global Configuration Mode.' },
    { question: 'Wie gelangt man vom User EXEC Mode in den Privileged EXEC Mode?', options: ['exit', 'end', 'enable', 'configure terminal'], correct: 2, explanation: 'Der Befehl "enable" wechselt vom User EXEC in den Privileged EXEC Mode.' },
    { question: 'Welcher Befehl bringt dich aus einem beliebigen Konfigurationsmodus direkt zurück zum Privileged EXEC Mode?', options: ['exit', 'end', 'enable', 'disable'], correct: 1, explanation: '"end" (oder Strg+Z) springt direkt zurück zum Privileged EXEC Mode.' },
    // --- Setup Mode / ROMMON / Werksreset ---
    { question: 'Wozu dient ROMMON?', options: ['Zur normalen Konfiguration im Tagesbetrieb', 'Als Notfall-/Wiederherstellungsmodus, wenn kein IOS geladen werden kann', 'Zur Verwaltung von VLANs', 'Zur Verschlüsselung von Passwörtern'], correct: 1, explanation: 'ROMMON ist ein einfacher Wiederherstellungsmodus im ROM für den Fall, dass kein gültiges IOS geladen werden kann.' },
    { question: 'Welcher Befehl löscht die gespeicherte Konfiguration im NVRAM?', options: ['reload', 'erase startup-config', 'copy running-config startup-config', 'configure terminal'], correct: 1, explanation: '"erase startup-config" löscht die startup-config im NVRAM.' },
    { question: 'Was passiert nach "erase startup-config" und "reload" beim nächsten Start?', options: ['Die alte Konfiguration wird automatisch wiederhergestellt', 'Das Gerät startet ohne Konfiguration in den Setup Mode', 'Das Gerät bleibt dauerhaft im ROMMON', 'Nur die Passwörter werden zurückgesetzt'], correct: 1, explanation: 'Ohne startup-config startet das Gerät automatisch in den Setup Mode.' },
    // --- CLI-Komfort ---
    { question: 'Welche Taste vervollständigt einen eindeutig erkennbaren Befehl automatisch?', options: ['Leertaste', 'Tabulator', 'Enter', 'Escape'], correct: 1, explanation: 'Die Tabulator-Taste vervollständigt einen eindeutigen, angefangenen Befehl.' },
    { question: 'Welche Fehlermeldung erscheint, wenn einem Befehl noch Parameter fehlen?', options: ['% Ambiguous command', '% Incomplete command', '% Invalid input detected', '% Access denied'], correct: 1, explanation: '"% Incomplete command" zeigt an, dass der Befehl unvollständig ist.' },
    { question: 'Was passiert, wenn mehrere Konfigurationszeilen gleichzeitig in die CLI eingefügt (Copy & Paste) werden?', options: ['IOS verarbeitet sie Zeile für Zeile wie einzeln eingegeben', 'IOS lehnt die Eingabe komplett ab', 'Nur die erste Zeile wird verarbeitet', 'Das Gerät startet neu'], correct: 0, explanation: 'IOS verarbeitet eingefügte Zeilen sequenziell, genauso als wären sie einzeln eingegeben worden.' },
    { question: 'Ist "conf t" als Abkürzung für "configure terminal" gültig?', options: ['Nein, Abkürzungen sind nie erlaubt', 'Ja, solange die Abkürzung eindeutig ist', 'Nur im User EXEC Mode', 'Nur in ROMMON'], correct: 1, explanation: 'Befehle dürfen abgekürzt werden, solange die Abkürzung eindeutig einem Befehl zugeordnet werden kann.' },
  ];
}

function buildSummary() {
  return [
    'Hierarchisches Netzwerk-Design: Access-, Distribution- und Core-Layer, bei kleinen Netzen oft als Collapsed Core zusammengefasst.',
    'L2-Switch vermittelt innerhalb eines Netzes; Multilayer-Switch und Router leiten auch zwischen Netzen weiter.',
    'Speicher: ROM (Bootstrap/ROMMON), Flash (IOS-Image), NVRAM (startup-config), RAM (running-config, flüchtig).',
    'Bootvorgang: POST → Bootstrap → IOS aus Flash laden → startup-config aus NVRAM laden.',
    'Konfigurationsmodi: User EXEC (>) → Privileged EXEC (#) → Global Config → Interface/Line Config.',
    'Fehlt die startup-config beim Booten, startet der Setup Mode; fehlt ein ladbares IOS, landet man im ROMMON.',
    '"erase startup-config" + "reload" setzt ein Gerät auf Werkseinstellungen zurück - alle individuellen Einstellungen gehen verloren.',
    'CLI-Komfort: Tab vervollständigt Befehle, eindeutige Abkürzungen sind erlaubt, mehrere Zeilen können per Copy & Paste eingefügt werden.',
  ];
}

export function buildCiscoGrundlagenLesson() {
  return {
    title: 'Grundlagen',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}
