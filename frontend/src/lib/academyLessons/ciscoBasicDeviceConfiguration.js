import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Grundkonfiguration & IP-Konfiguration" - fills the catalog's existing
// `cisco-packet-tracer/basic-device-configuration` slot (previously an empty
// placeholder titled just "Grundkonfiguration", chained behind the removed
// "switch-basics"/"router-basics"; now re-chained directly to "grundlagen"
// and merged with the equally empty former "ip-configuration" placeholder,
// which has been removed from the catalog - see academyTopics.js).
//
// Distinct in focus from the existing "grundkonfiguration" topic (VLAN/
// Access-Port/Trunk-Port overview with a short IOS-hardening recap): this
// lesson is the full "bringing up a brand-new device" walkthrough - CLI
// modes, "no"/"do", hostname/domain-name, privilege levels, local users,
// login vs. login local, console security, password security, ip
// domain-lookup, then the interface/IP-address/no-shutdown sequence,
// verification and saving the configuration. Some terms (enable secret,
// login local, service password-encryption) are intentionally revisited
// here in more depth - repetition across two focused, self-contained
// lessons is fine and matches how the actual course covers this material.
// =============================================================================

export const CISCO_BASIC_DEVICE_CONFIGURATION_TOPIC_KEY = topicKey('cisco-packet-tracer', 'basic-device-configuration');

const LOGIN_VS_LOGIN_LOCAL_SVG = `<svg viewBox="0 0 320 200" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="160" y="25" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Console-Zugang absichern</text><rect x="20" y="50" width="125" height="120" rx="8" fill="#00f0ff" opacity="0.2" stroke="#00f0ff" stroke-width="2"/><text x="82" y="75" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Variante A</text><text x="82" y="100" text-anchor="middle" fill="#8b949e" font-size="9">line console 0</text><text x="82" y="120" text-anchor="middle" fill="#8b949e" font-size="9">password X</text><text x="82" y="140" text-anchor="middle" fill="#8b949e" font-size="9">login</text><line x1="82" y1="155" x2="82" y2="170" stroke="#8b949e" stroke-width="2"/><text x="82" y="185" text-anchor="middle" fill="#c9d1d9" font-size="9">Line-Passwort</text><rect x="175" y="50" width="125" height="120" rx="8" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="237" y="75" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Variante B</text><text x="237" y="100" text-anchor="middle" fill="#8b949e" font-size="9">username ... secret</text><text x="237" y="120" text-anchor="middle" fill="#8b949e" font-size="9">line console 0</text><text x="237" y="140" text-anchor="middle" fill="#8b949e" font-size="9">login local</text><line x1="237" y1="155" x2="237" y2="170" stroke="#8b949e" stroke-width="2"/><text x="237" y="185" text-anchor="middle" fill="#c9d1d9" font-size="9">Lokale Benutzer-DB</text></svg>`;

const WORKFLOW_SVG = `<svg viewBox="0 0 240 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><rect x="70" y="10" width="100" height="35" rx="6" fill="#00f0ff" opacity="0.9"/><text x="120" y="32" text-anchor="middle" fill="#0a1628" font-size="11" font-weight="bold">CONFIGURE</text><polygon points="120,50 110,65 130,65" fill="#8b949e"/><rect x="70" y="70" width="100" height="35" rx="6" fill="#00f0ff" opacity="0.65"/><text x="120" y="92" text-anchor="middle" fill="#0a1628" font-size="11" font-weight="bold">VERIFY</text><polygon points="120,110 110,125 130,125" fill="#8b949e"/><rect x="70" y="130" width="100" height="35" rx="6" fill="#00f0ff" opacity="0.4"/><text x="120" y="152" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">CORRECT</text><polygon points="120,170 110,185 130,185" fill="#8b949e"/><rect x="70" y="190" width="100" height="25" rx="6" fill="#00f0ff" opacity="0.25"/><text x="120" y="207" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">SAVE</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('modi-classic', 'CLI-Modi: kurze Wiederholung', 'classic', [
    { type: 'table', headers: ['Modus', 'Prompt', 'Wofür'], rows: [
      ['User EXEC', 'Switch>', 'Eingeschränkter Anfangsmodus nach dem Einloggen - kaum Befehle verfügbar.'],
      ['Privileged EXEC', 'Switch#', 'Voller Lesezugriff (u. a. alle show-Befehle), aber noch keine Konfigurationsänderungen - erreichbar über "enable".'],
      ['Global Configuration', 'Switch(config)#', 'Änderungen an der Gerätekonfiguration - erreichbar über "configure terminal" aus dem Privileged EXEC.'],
    ] },
    { type: 'text', content: 'In dieser Lektion richtest du ein Gerät von Grund auf ein: Zugang absichern, Identität festlegen, danach eine Schnittstelle mit einer IP-Adresse aktivieren.' },
  ]));

  exps.push(explanation('no-classic', 'Der "no"-Befehl', 'classic', [
    { type: 'text', content: '"no" vor einem Befehl macht die Wirkung dieses Befehls rückgängig bzw. deaktiviert die entsprechende Einstellung. Fast jeder Konfigurationsbefehl lässt sich so wieder entfernen.' },
    { type: 'table', headers: ['Befehl', 'Wirkung von "no"'], rows: [
      ['shutdown / no shutdown', '"shutdown" deaktiviert eine Schnittstelle administrativ, "no shutdown" aktiviert sie wieder.'],
      ['ip domain-lookup / no ip domain-lookup', '"no ip domain-lookup" deaktiviert die automatische DNS-Namensauflösung des Geräts selbst (dazu weiter unten mehr).'],
    ] },
    { type: 'question', question: 'Ein Interface ist administrativ deaktiviert (shutdown). Mit welchem Befehl aktivierst du es wieder?', options: ['shutdown', 'no shutdown', 'enable', 'no interface'], correct: 1, explanation: '"no" macht "shutdown" rückgängig - das Interface wird wieder aktiviert.' },
  ]));

  exps.push(explanation('do-classic', 'Der "do"-Befehlszusatz', 'classic', [
    { type: 'text', content: 'Manche Befehle (z. B. die meisten show-Befehle) gehören eigentlich zum Privileged EXEC Mode. Mit dem Zusatz "do" kannst du einen solchen Befehl trotzdem direkt aus einem Konfigurationsmodus heraus ausführen, ohne diesen erst verlassen zu müssen.' },
    { type: 'list', title: 'Beispiel', items: [
      'Switch(config-if)# do show running-config',
    ] },
    { type: 'text', content: 'Ohne "do" müsstest du zuerst mit mehreren "exit" wieder zurück in den Privileged EXEC Mode wechseln, den Befehl ausführen, und anschließend erneut in den Konfigurationsmodus zurückkehren, um weiterzumachen - "do" spart genau diesen Umweg.' },
    { type: 'question', question: 'Warum würdest du "do show running-config" verwenden, statt zuerst mit mehreren "exit" zurückzugehen?', options: ['"do" ist schneller in der Ausführung als show', 'Damit sparst du dir den Umweg über mehrere Modi zurück und wieder hinein - der Befehl läuft direkt aus dem aktuellen Konfigurationsmodus', '"show running-config" funktioniert nur mit "do"', '"do" ist nur eine Abkürzung für "configure terminal"'], correct: 1, explanation: '"do" führt einen Privileged-EXEC-Befehl direkt aus dem aktuellen Konfigurationsmodus aus - ohne den Umweg über "exit" und zurück.' },
  ]));

  exps.push(explanation('hostname-domain-classic', 'Hostname und Domainname', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['hostname <Name>', 'Vergibt einen eindeutigen Gerätenamen - erscheint fortan im Prompt (z. B. "SW-Core#").'],
      ['ip domain-name <Domain>', 'Legt den Domainnamen des Geräts fest.'],
    ] },
    { type: 'text', content: 'Warum ein eindeutiger Hostname? In einem Netz mit mehreren Geräten ist sofort erkennbar, mit welchem Gerät du aktuell verbunden bist - besonders wichtig, wenn mehrere Terminal-Sitzungen gleichzeitig offen sind. Eine konsistente Namenskonvention (z. B. Standort + Rolle) erleichtert die spätere Administration erheblich - ohne dass es dafür komplizierte Enterprise-Regeln braucht.' },
    { type: 'text', content: 'Der Domainname wird außerdem als Teil des Namens für das RSA-Schlüsselpaar benötigt, falls das Gerät später per SSH verwaltet werden soll (siehe die eigene SSH-Lektion) - hier geht es zunächst nur um die Basiskonfiguration.' },
  ]));

  exps.push(explanation('privilege-classic', 'Privileged EXEC und Privilege Level', 'classic', [
    { type: 'table', headers: ['Level', 'Bedeutung'], rows: [
      ['Level 1', 'User EXEC - Standard-Level nach der Anmeldung, stark eingeschränkt.'],
      ['Level 15', 'Privileged EXEC - volle administrative Rechte, Standard-Level nach "enable".'],
    ] },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['enable secret <Passwort>', 'Sichert den Wechsel in den Privileged EXEC Mode mit einem verschlüsselt (gehasht) gespeicherten Passwort - die bevorzugte Variante.'],
      ['enable password <Passwort>', 'Ältere Variante, speichert das Passwort im Klartext in der Konfiguration. Sind beide gesetzt, hat "enable secret" Vorrang.'],
    ] },
    { type: 'question', question: 'Warum wird "enable secret" gegenüber "enable password" bevorzugt?', options: ['"enable secret" ist kürzer zu tippen', '"enable secret" speichert das Passwort verschlüsselt (gehasht), "enable password" nur im Klartext', 'Beide sind technisch identisch', '"enable password" funktioniert nur bei Routern'], correct: 1, explanation: '"enable secret" speichert einen Hash statt des Klartext-Passworts und wird deshalb bevorzugt - zudem hat es Vorrang, falls beide gesetzt sind.' },
  ]));

  exps.push(explanation('user-classic', 'Lokalen Benutzer anlegen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['username <Name> secret <Passwort>', 'Legt einen lokalen Benutzer mit verschlüsselt gespeichertem Passwort an - die bevorzugte Variante für die Anmeldung an Konsole oder VTY-Lines.'],
    ] },
    { type: 'text', content: 'Dieser lokale Benutzer wird gleich für "login local" gebraucht.' },
  ]));

  exps.push(explanation('login-classic', 'login vs. login local', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['login', 'Aktiviert die Passwortabfrage anhand des mit "password" direkt auf dieser Line gesetzten Line-Passworts - EIN gemeinsames Passwort für alle, die sich hier anmelden.'],
      ['login local', 'Aktiviert stattdessen die Anmeldung gegen die lokale Benutzer-Datenbank (angelegt mit "username ... secret ...") - jeder Benutzer meldet sich mit seinem EIGENEN Zugang an.'],
    ] },
    { type: 'question', question: 'Du hast bereits mit "username admin secret ..." einen lokalen Benutzer erstellt. Welchen Befehl verwendest du auf der Console-/VTY-Line, damit genau diese lokale Benutzerdatenbank für die Anmeldung verwendet wird?', options: ['login', 'password admin', 'login local', 'enable secret'], correct: 2, explanation: '"login local" lässt die Line gegen die lokale Benutzerdatenbank prüfen - "login" allein würde stattdessen ein einzelnes, auf der Line selbst gesetztes Passwort erwarten.' },
  ]));

  exps.push(explanation('login-visual', 'login vs. login local im Vergleich', 'visual', [
    { type: 'diagram', content: LOGIN_VS_LOGIN_LOCAL_SVG },
    { type: 'text', content: 'Merke: "login" + "password" prüft gegen das Line-Passwort. "login local" prüft gegen alle lokal mit "username" angelegten Benutzer. Beide dürfen auf derselben Line nicht gleichzeitig aktiv sein.' },
  ]));

  exps.push(explanation('konsole-classic', 'Konsole absichern', 'classic', [
    { type: 'text', content: 'Wer physischen Zugriff auf die Konsolenschnittstelle eines Geräts hat, kann sich ohne weitere Absicherung anmelden - deshalb wird auch der Konsolenzugang grundsätzlich abgesichert, nicht nur der Fernzugriff.' },
    { type: 'table', headers: ['Variante', 'Konfiguration'], rows: [
      ['Line-Passwort', 'line console 0 → password <Passwort> → login'],
      ['Lokale Benutzerdatenbank', 'line console 0 → login local'],
    ] },
    { type: 'text', content: 'Welche Variante passt, hängt von der Aufgabenstellung ab: ein einzelnes Line-Passwort für alle, oder individuelle lokale Benutzer.' },
  ]));

  exps.push(explanation('kennwortsicherheit-classic', 'Kennwortsicherheit im Überblick', 'classic', [
    { type: 'table', headers: ['Maßnahme', 'Bedeutung'], rows: [
      ['enable secret <Passwort>', 'Verschlüsselt (gehasht) gespeichertes Passwort für den Privileged EXEC Mode.'],
      ['username <Name> secret <Passwort>', 'Verschlüsselt (gehasht) gespeichertes Passwort für einen lokalen Benutzer.'],
      ['service password-encryption', 'Verschlüsselt (verschleiert) einfache, im Klartext gespeicherte IOS-Passwörter (z. B. aus "enable password" oder einem Line-"password") in der Konfigurationsausgabe.'],
    ] },
    { type: 'text', content: 'Wichtig: "service password-encryption" verwendet nur eine schwache Verschleierung (Typ 7), keine echte, starke Passwort-Hashing-Sicherheit wie "secret" (Typ 8/9). Es verhindert vor allem, dass Passwörter beim Betrachten der Konfiguration im Klartext sichtbar sind - mehr nicht. Für den CyberLearn-Lehrgangskontext reicht diese Einordnung völlig aus.' },
  ]));

  exps.push(explanation('domain-lookup-classic', 'ip domain-lookup', 'classic', [
    { type: 'text', content: '"ip domain-lookup" ist standardmäßig aktiv: Tippst du an der CLI einen Befehl ein, den IOS nicht erkennt, versucht das Gerät, das eingegebene Wort als Hostnamen aufzulösen (DNS-Anfrage) - in der Annahme, du wolltest vielleicht per Telnet/SSH zu einem Host mit diesem Namen verbinden.' },
    { type: 'text', content: 'Ist kein DNS-Server erreichbar, wartet die CLI dabei mehrere Sekunden auf eine Antwort, bevor sie mit einer Fehlermeldung weitermacht - ein vertippter Befehl fühlt sich dann an, als würde das Gerät "hängen".' },
    { type: 'table', headers: ['Befehl', 'Wirkung'], rows: [
      ['no ip domain-lookup', 'Deaktiviert diesen automatischen Auflösungsversuch - Tippfehler werden sofort mit einer Fehlermeldung quittiert, ohne Wartezeit.'],
    ] },
    { type: 'question', question: 'Du vertippst dich bei einem Befehl, und das Gerät scheint anschließend einige Sekunden zu "hängen", bevor eine Fehlermeldung erscheint. Welche Einstellung würdest du deaktivieren, damit das nicht mehr passiert?', options: ['ip domain-lookup mit "no ip domain-lookup"', 'ip domain-name mit "no ip domain-name"', 'enable secret', 'login local'], correct: 0, explanation: 'Bei aktivem "ip domain-lookup" versucht das Gerät, einen nicht erkannten Befehl als Hostnamen per DNS aufzulösen - das kostet ohne erreichbaren DNS-Server mehrere Sekunden. "no ip domain-lookup" deaktiviert das.' },
  ]));

  exps.push(explanation('interface-ip-classic', 'Interface auswählen und IP-Adresse vergeben', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['interface <Interface>', 'Wechselt in die Konfiguration der angegebenen Schnittstelle, z. B. "interface g0/1" (Abkürzung für GigabitEthernet0/1).'],
      ['ip address <IP-Adresse> <Subnetzmaske>', 'Vergibt der Schnittstelle eine IP-Adresse und die zugehörige Subnetzmaske - beide zusammen, in dieser Reihenfolge.'],
      ['no shutdown', 'Aktiviert die Schnittstelle - ohne diesen Befehl bleibt sie administrativ deaktiviert, selbst mit korrekt vergebener IP-Adresse.'],
    ] },
    { type: 'list', title: 'Beispiel', items: [
      'Router(config)# interface g0/1',
      'Router(config-if)# ip address 192.168.10.1 255.255.255.0',
      'Router(config-if)# no shutdown',
    ] },
    { type: 'text', content: 'Die Subnetzmaske selbst wird hier nicht neu erklärt - das gehört in die Grundlagen-Lektion "Subnetzmasken". Hier geht es um die praktische Anwendung einer bereits bekannten Adresse/Maske auf einem Cisco-Interface.' },
    { type: 'question', question: 'Ein Interface hat die IP-Adresse 192.168.10.1/24 korrekt konfiguriert, bleibt aber laut "show ip interface brief" administratively down. Was fehlt am wahrscheinlichsten?', options: ['Die Subnetzmaske ist falsch', 'Der Befehl "no shutdown"', 'Der Hostname wurde nicht gesetzt', 'Es fehlt "ip domain-lookup"'], correct: 1, explanation: 'Eine korrekt konfigurierte IP-Adresse reicht nicht - ohne "no shutdown" bleibt das Interface administrativ deaktiviert.' },
  ]));

  exps.push(explanation('verifizierung-classic', 'Konfiguration prüfen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wofür'], rows: [
      ['show ip interface brief', 'Schneller Überblick über IP-Adresse und Up/Down-Status aller Schnittstellen.'],
      ['show running-config', 'Zeigt die vollständige, aktuell laufende Konfiguration.'],
    ] },
    { type: 'question', question: 'Du hast gerade drei Interfaces konfiguriert und willst schnell IP-Adresse und Up/Down-Zustand aller Interfaces sehen. Welchen Befehl verwendest du?', options: ['show running-config', 'show ip interface brief', 'show vlan brief', 'copy running-config startup-config'], correct: 1, explanation: '"show ip interface brief" liefert genau diese kompakte Übersicht auf einen Blick.' },
  ]));

  exps.push(explanation('workflow-visual', 'Vom Konfigurieren zum Speichern', 'visual', [
    { type: 'diagram', content: WORKFLOW_SVG },
    { type: 'text', content: 'Admin-Arbeitsweise: erst konfigurieren, dann mit show-Befehlen prüfen, gegebenenfalls korrigieren (z. B. mit "no" oder einem neuen Befehl) und erst dann dauerhaft speichern.' },
  ]));

  exps.push(explanation('speichern-classic', 'running-config dauerhaft speichern', 'classic', [
    { type: 'table', headers: ['Begriff', 'Bedeutung'], rows: [
      ['running-config', 'Die aktuell aktive, laufende Konfiguration - liegt im flüchtigen RAM.'],
      ['startup-config', 'Die Konfiguration, die beim nächsten Neustart geladen wird - liegt im NVRAM.'],
    ] },
    { type: 'text', content: 'Änderungen an der running-config gehen bei einem Neustart verloren, wenn sie nicht vorher in die startup-config übernommen werden.' },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['copy running-config startup-config', 'Übernimmt die aktuelle running-config dauerhaft als startup-config.'],
      ['write / wr', 'Kurzform mit demselben Ergebnis.'],
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      '"no <Befehl>" macht einen Befehl rückgängig (z. B. "no shutdown", "no ip domain-lookup").',
      '"do <Befehl>" führt einen Privileged-EXEC-Befehl direkt aus einem Konfigurationsmodus aus.',
      'Identität: "hostname <Name>", "ip domain-name <Domain>".',
      'Zugang absichern: "enable secret" (bevorzugt vor "enable password"), lokale Benutzer mit "username ... secret ...", "service password-encryption" für einfache Klartext-Passwörter.',
      '"login" prüft ein Line-Passwort, "login local" prüft gegen die lokale Benutzerdatenbank.',
      '"no ip domain-lookup" verhindert Wartezeiten durch versuchte DNS-Auflösung vertippter Befehle.',
      'Interface aktivieren: "interface <Interface>" → "ip address <IP> <Maske>" → "no shutdown".',
      'Prüfen mit "show ip interface brief" und "show running-config".',
      'Dauerhaft speichern mit "copy running-config startup-config" (bzw. "write"/"wr").',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'basic-no-shutdown-cli',
      type: 'cli-input',
      question: 'Das Interface ist administrativ deaktiviert. Aktiviere es.',
      expectedLines: ['no shutdown'],
      explanation: '"no shutdown" hebt die administrative Deaktivierung auf.',
    },
    {
      id: 'basic-no-domain-lookup-cli',
      type: 'cli-input',
      question: 'Die automatische DNS-Namensauflösung für vertippte Befehle soll deaktiviert werden.',
      expectedLines: ['no ip domain-lookup'],
      explanation: '"no ip domain-lookup" verhindert den automatischen Auflösungsversuch und damit die Wartezeit bei Tippfehlern.',
    },
    {
      id: 'basic-do-show-run-cli',
      type: 'cli-input',
      question: 'Zeig dir aus dem aktuellen Interface-Konfigurationsmodus heraus die komplette laufende Konfiguration an, ohne den Modus vorher zu verlassen.',
      expectedLines: [['do show running-config', 'do show run']],
      explanation: '"do" führt "show running-config" direkt aus, ohne den Konfigurationsmodus verlassen zu müssen.',
    },
    {
      id: 'basic-hostname-cli',
      type: 'cli-input',
      question: 'Ändere den Hostnamen auf SW-Core.',
      expectedLines: ['hostname SW-Core'],
      explanation: '"hostname <Name>" setzt den Gerätenamen.',
    },
    {
      id: 'basic-domain-name-cli',
      type: 'cli-input',
      question: 'Setze den Domainnamen auf firma.local.',
      expectedLines: ['ip domain-name firma.local'],
      explanation: '"ip domain-name <Domain>" legt den Domainnamen des Geräts fest.',
    },
    {
      id: 'basic-enable-secret-select',
      type: 'select-best',
      question: 'Warum wird "enable secret" gegenüber "enable password" bevorzugt?',
      options: ['Weil es kürzer ist', 'Weil das Passwort damit verschlüsselt (gehasht) statt im Klartext gespeichert wird', 'Beide sind funktional identisch', 'Weil "enable password" nur bei Switches funktioniert'],
      correct: 1,
      explanation: '"enable secret" speichert einen Hash - deutlich sicherer als das Klartext-Passwort von "enable password".',
    },
    {
      id: 'basic-user-cli',
      type: 'cli-input',
      question: 'Lege den Benutzer admin mit dem Passwort Cisco123! an (sichere Variante).',
      expectedLines: ['username admin secret Cisco123!'],
      explanation: '"secret" speichert das Passwort verschlüsselt statt im Klartext.',
    },
    {
      id: 'basic-login-local-select',
      type: 'select-best',
      question: 'Du hast bereits mit "username admin secret ..." einen lokalen Benutzer erstellt. Welchen Befehl verwendest du auf der Line, damit genau diese lokale Benutzerdatenbank für die Anmeldung verwendet wird?',
      options: ['login', 'password admin', 'login local', 'username local'],
      correct: 2,
      explanation: '"login local" lässt die Line gegen die lokale Benutzerdatenbank prüfen.',
    },
    {
      id: 'basic-console-password-cli',
      type: 'cli-input',
      question: 'Sichere die Konsole mit einem eigenen Line-Passwort "K0nsole!" ab (ohne lokale Benutzerdatenbank).',
      expectedLines: ['line console 0', 'password K0nsole!', 'login'],
      explanation: '"password" setzt das Line-Passwort, "login" aktiviert die Abfrage dieses Passworts.',
    },
    {
      id: 'basic-console-login-local-cli',
      type: 'cli-input',
      question: 'Sichere die Konsole stattdessen so ab, dass sich nur bereits angelegte lokale Benutzer anmelden können.',
      expectedLines: ['line console 0', 'login local'],
      explanation: '"login local" verwendet die lokale Benutzerdatenbank statt eines einzelnen Line-Passworts.',
    },
    {
      id: 'basic-password-encryption-cli',
      type: 'cli-input',
      question: 'Verhindere, dass einfache Klartext-Passwörter (z. B. aus "enable password") lesbar in der Konfiguration erscheinen.',
      expectedLines: ['service password-encryption'],
      explanation: '"service password-encryption" verschleiert einfache Klartext-Passwörter in der Konfigurationsausgabe.',
    },
    {
      id: 'basic-interface-select-cli',
      type: 'cli-input',
      question: 'Konfiguriere GigabitEthernet0/1.',
      expectedLines: [['interface g0/1', 'interface gigabitethernet0/1']],
      explanation: 'Die CLI-Engine akzeptiert die übliche Abkürzung "g0/1" für "GigabitEthernet0/1".',
    },
    {
      id: 'basic-ip-address-cli',
      type: 'cli-input',
      question: 'Vergib auf der aktuellen Schnittstelle die IP-Adresse 192.168.50.1 mit der Subnetzmaske 255.255.255.0.',
      expectedLines: ['ip address 192.168.50.1 255.255.255.0'],
      explanation: '"ip address <IP> <Maske>" - beide Werte zusammen, in dieser Reihenfolge.',
    },
    {
      id: 'basic-interface-down-troubleshoot-cli',
      type: 'cli-input',
      question: 'Das Interface g0/1 hat die korrekte IP-Adresse 192.168.10.1/24, "show ip interface brief" zeigt aber "administratively down". Behebe das Problem.',
      expectedLines: ['interface g0/1', 'no shutdown'],
      explanation: '"administratively down" bedeutet, dass "shutdown" aktiv ist - "no shutdown" behebt es.',
    },
    {
      id: 'basic-show-ip-int-brief-select',
      type: 'select-best',
      question: 'Du hast gerade drei Interfaces konfiguriert und willst schnell IP-Adresse und Up/Down-Zustand sehen. Welchen Befehl verwendest du?',
      options: ['show running-config', 'show ip interface brief', 'show vlan brief', 'copy running-config startup-config'],
      correct: 1,
      explanation: '"show ip interface brief" zeigt IP-Adresse und Status aller Interfaces auf einen Blick.',
    },
    {
      id: 'basic-save-cli',
      type: 'cli-input',
      question: 'Du hast die Konfiguration abgeschlossen. Stelle sicher, dass sie einen Neustart überlebt.',
      expectedLines: ['copy running-config startup-config'],
      explanation: '"copy running-config startup-config" (bzw. "write"/"wr") übernimmt die aktuelle Konfiguration dauerhaft ins NVRAM.',
    },
    {
      id: 'basic-fabrikneu-scenario-cli',
      type: 'cli-input',
      question: 'Du erhältst einen fabrikneuen Router. Konfiguriere: Hostname R-BER-01, Domain its.bw, lokalen Benutzer admin mit Passwort Cisco123!, Interface g0/0 mit 10.20.30.1/24, aktiviere das Interface und speichere anschließend die Konfiguration dauerhaft.',
      expectedLines: [
        'hostname R-BER-01',
        'ip domain-name its.bw',
        'username admin secret Cisco123!',
        'interface g0/0',
        'ip address 10.20.30.1 255.255.255.0',
        'no shutdown',
        'copy running-config startup-config',
      ],
      explanation: 'Identität zuerst (Hostname, Domain), dann Benutzer, dann Interface (auswählen → IP vergeben → aktivieren), zuletzt speichern.',
    },
    {
      id: 'basic-login-local-lockout-select',
      type: 'select-best',
      question: 'Du hast "line console 0" mit "login local" abgesichert, aber noch keinen lokalen Benutzer angelegt. Was passiert beim nächsten Konsolenversuch?',
      options: ['Die Anmeldung funktioniert mit dem Line-Passwort', 'Es gibt keine gültigen Zugangsdaten, der Zugang schlägt fehl', 'Der Zugriff ist automatisch ohne Authentifizierung möglich', 'Das Gerät fragt automatisch nach einem neuen Benutzernamen'],
      correct: 1,
      explanation: '"login local" prüft gegen die lokale Benutzerdatenbank. Ohne "username ... secret/password" existieren keine gültigen Zugangsdaten.',
    },
    {
      id: 'basic-config-not-saved-select',
      type: 'select-best',
      question: 'Hostname, Enable Secret und Console-Passwort wurden konfiguriert. Nach einem Stromausfall ist alles weg. Was wurde vergessen?',
      options: ['Nichts, das Gerät speichert automatisch', 'Die Konfiguration wurde nicht mit "copy running-config startup-config" dauerhaft gespeichert', 'Es wurde kein Benutzer angelegt', 'Das Interface wurde nicht aktiviert'],
      correct: 1,
      explanation: 'Änderungen landen zunächst nur in der flüchtigen running-config. Erst das Speichern überträgt sie ins NVRAM.',
    },
    {
      id: 'basic-dns-lookup-delay-select',
      type: 'select-best',
      question: 'Du tippst "conf t" falsch als "conft" und das Gerät scheint mehrere Sekunden zu hängen, bevor eine Fehlermeldung kommt. Welche Einstellung behebt das?',
      options: ['service password-encryption', 'no ip domain-lookup', 'exec-timeout 0 0', 'login local'],
      correct: 1,
      explanation: 'Bei aktivem "ip domain-lookup" versucht IOS, unbekannte Eingaben als Hostnamen per DNS aufzulösen. "no ip domain-lookup" deaktiviert das.',
    },
    {
      id: 'basic-exec-timeout-security-select',
      type: 'select-best',
      question: 'Ein Kollege setzt "exec-timeout 0 0". Was bedeutet das aus Sicherheitssicht?',
      options: ['Die Sitzung wird sofort beendet', 'Es gibt keinen automatischen Timeout bei Inaktivität - eine offene Sitzung bleibt dauerhaft bestehen', 'Das Gerät startet nach 0 Sekunden neu', 'Der Benutzer wird nach 0 Sekunden abgemeldet'],
      correct: 1,
      explanation: '"exec-timeout 0 0" deaktiviert den automatischen Inaktivitäts-Timeout. In der Produktion ist das meist ein Sicherheitsrisiko.',
    },
    {
      id: 'basic-no-command-select',
      type: 'select-best',
      question: 'Welche Aussage zu "no" vor einem Cisco-Befehl ist am besten?',
      options: ['Es macht jeden beliebigen IOS-Befehl rückgängig', 'Es kehrt bei vielen Konfigurationsbefehlen die Wirkung um oder deaktiviert die Einstellung; bei Unsicherheit hilft die IOS-Hilfe', 'Es speichert die Konfiguration', 'Es ist nur im User EXEC Mode verfügbar'],
      correct: 1,
      explanation: '"no" ist keine universelle Rückgängig-Taste, sondern die Gegenform vieler Konfigurationsbefehle. Nicht jeder Befehl besitzt eine sinnvolle no-Form.',
    },
    {
      id: 'basic-default-interface-select',
      type: 'select-best',
      question: 'Welche Wirkung hat "default interface FastEthernet0/1" typischerweise?',
      options: ['Das Interface wird gelöscht', 'Die meisten Interface-Konfigurationen werden auf ihre Defaults zurückgesetzt', 'Das Interface wird deaktiviert', 'Das Interface bekommt automatisch DHCP'],
      correct: 1,
      explanation: '"default interface <Interface>" setzt die Konfiguration eines Interfaces weitgehend auf die Werksdefaults zurück - nützlich für Troubleshooting.',
    },
    {
      id: 'basic-disable-mode-select',
      type: 'select-best',
      question: 'Was bewirkt "disable" im Privileged EXEC Mode?',
      options: ['Es deaktiviert das Gerät', 'Es wechselt zurück in den User EXEC Mode', 'Es speichert die Konfiguration', 'Es löscht das aktuelle Interface'],
      correct: 1,
      explanation: '"disable" ist das Gegenstück zu "enable" und bringt dich vom Privileged EXEC zurück in den User EXEC Mode.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was bewirkt "no" vor einem Cisco-Befehl?', options: ['Es wiederholt den Befehl', 'Es macht die Wirkung des Befehls rückgängig bzw. deaktiviert die Einstellung', 'Es zeigt eine Hilfeseite an', 'Es speichert die Konfiguration'], correct: 1, explanation: '"no <Befehl>" kehrt die Wirkung des jeweiligen Befehls um.' },
    { question: 'Wofür wird der Zusatz "do" verwendet?', options: ['Um einen Befehl doppelt auszuführen', 'Um einen Privileged-EXEC-Befehl direkt aus einem Konfigurationsmodus auszuführen, ohne diesen zu verlassen', 'Um in den Configuration Mode zu wechseln', 'Um ein Interface zu aktivieren'], correct: 1, explanation: '"do" erlaubt z. B. "do show running-config" direkt aus einem Konfigurationsmodus.' },
    { question: 'Welcher Befehl vergibt einen eindeutigen Gerätenamen?', options: ['ip domain-name', 'username', 'hostname', 'enable secret'], correct: 2, explanation: '"hostname <Name>" setzt den Gerätenamen.' },
    { question: 'Warum wird "enable secret" gegenüber "enable password" bevorzugt?', options: ['Es ist kürzer', 'Es speichert das Passwort verschlüsselt (gehasht) statt im Klartext', 'Es funktioniert nur auf Routern', 'Beide sind identisch'], correct: 1, explanation: '"enable secret" hasht das Passwort - "enable password" speichert es im Klartext.' },
    { question: 'Was ist der Unterschied zwischen "login" und "login local" auf einer Line?', options: ['Kein Unterschied', '"login" prüft ein einzelnes, auf der Line gesetztes Passwort; "login local" prüft gegen die lokale Benutzerdatenbank', '"login local" funktioniert nur bei VTY-Lines', '"login" ist nur für Router'], correct: 1, explanation: '"login" nutzt ein gemeinsames Line-Passwort, "login local" individuelle lokale Benutzer.' },
    { question: 'Was macht "service password-encryption" konkret?', options: ['Es ersetzt "enable secret" vollständig', 'Es verschleiert einfache Klartext-Passwörter in der angezeigten Konfiguration, ist aber keine starke Hashing-Sicherheit', 'Es verschlüsselt den gesamten Netzwerkverkehr', 'Es aktiviert SSH automatisch'], correct: 1, explanation: '"service password-encryption" bietet nur eine schwache Verschleierung (Typ 7), keine starke Passwort-Sicherheit.' },
    { question: 'Warum kann ein falsch eingegebener Befehl bei aktivem "ip domain-lookup" zu einer Verzögerung führen?', options: ['IOS prüft dabei automatisch alle VLANs', 'Das Gerät versucht, das nicht erkannte Wort per DNS als Hostnamen aufzulösen, was ohne erreichbaren DNS-Server mehrere Sekunden dauert', 'Der Befehl wird automatisch dreimal wiederholt', 'Es hat keinen Zusammenhang mit Verzögerungen'], correct: 1, explanation: 'Ohne "no ip domain-lookup" versucht IOS bei unbekannten Befehlen eine DNS-Auflösung - das kostet Zeit.' },
    { question: 'Eine IP-Adresse ist korrekt auf einem Interface konfiguriert, es bleibt aber "administratively down". Was fehlt?', options: ['Die Subnetzmaske', '"no shutdown"', 'Der Hostname', '"ip domain-lookup"'], correct: 1, explanation: 'Ohne "no shutdown" bleibt ein Interface administrativ deaktiviert, unabhängig von der IP-Konfiguration.' },
    { question: 'Mit welchem Befehl siehst du schnell IP-Adresse und Up/Down-Status aller Interfaces?', options: ['show running-config', 'show ip interface brief', 'show vlan brief', 'show version'], correct: 1, explanation: '"show ip interface brief" liefert genau diese kompakte Übersicht.' },
    { question: 'Was ist der Unterschied zwischen running-config und startup-config?', options: ['Kein Unterschied', 'running-config ist die aktuell aktive Konfiguration im RAM, startup-config wird beim nächsten Neustart geladen (NVRAM)', 'startup-config ist immer aktueller', 'running-config wird nie verändert'], correct: 1, explanation: 'Änderungen an der running-config gehen ohne "copy running-config startup-config" bei einem Neustart verloren.' },
    { question: 'Was passiert, wenn du "login local" auf der Console konfigurierst, aber keinen lokalen Benutzer angelegt hast?', options: ['Die Konsole verwendet automatisch das Line-Passwort', 'Es gibt keine gültigen Zugangsdaten; die Anmeldung schlägt fehl', 'Der Zugriff ist ohne Authentifizierung möglich', 'Das Gerät legt automatisch einen Benutzer an'], correct: 1, explanation: '"login local" benötigt mindestens einen per "username" angelegten Benutzer, sonst existieren keine gültigen Zugangsdaten.' },
    { question: 'Was ist der sicherheitstechnische Unterschied zwischen "enable secret" und "enable password"?', options: ['Es gibt keinen', 'enable secret speichert das Passwort als Hash, enable password als Klartext', 'enable password ist länger', 'enable secret funktioniert nur auf Routern'], correct: 1, explanation: 'enable secret speichert einen Hash; enable password speichert das Passwort lesbar.' },
    { question: 'Warum ist "exec-timeout 0 0" in der Produktion problematisch?', options: ['Es beendet die Sitzung sofort', 'Es deaktiviert den automatischen Timeout - offene Sitzungen bleiben dauerhaft offen', 'Es verhindert das Speichern', 'Es blockiert den Konsolenzugang'], correct: 1, explanation: 'Ein Timeout von 0 0 schließt inaktive Sessions nie automatisch - das ist ein Sicherheitsrisiko.' },
    { question: 'Was bewirkt "default interface FastEthernet0/1" grob?', options: ['Löscht das Interface', 'Setzt die Interface-Konfiguration auf Defaults zurück', 'Aktiviert das Interface', 'Löscht die VLAN-Datenbank'], correct: 1, explanation: '"default interface" setzt die meisten Interface-Einstellungen auf ihre Default-Werte zurück.' },
    { question: 'Was ist "logging synchronous" auf einer Line?', options: ['Es synchronisiert die Uhrzeit', 'Es verhindert, dass Systemmeldungen die gerade getippte Zeile zerreißen', 'Es speichert das Logging ins NVRAM', 'Es aktiviert SSH-Logging'], correct: 1, explanation: 'logging synchronous hält Log-Meldungen davon ab, die aktuelle Eingabezeile unleserlich zu machen.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Konfiguriere auf G0/1 die Adresse 172.16.10.254/24."',
      expectedLines: ['interface g0/1', 'ip address 172.16.10.254 255.255.255.0'],
      explanation: 'Zuerst das Interface auswählen, dann die IP-Adresse mit Maske vergeben.',
    },
    {
      prompt: 'Sam: "Speichere die Konfiguration dauerhaft."',
      expectedLines: ['copy running-config startup-config'],
      explanation: '"copy running-config startup-config" (bzw. "write"/"wr") übernimmt die running-config dauerhaft in die startup-config.',
    },
    {
      prompt: 'Sam: "Du hast eine IP-Adresse konfiguriert, aber \'show ip interface brief\' zeigt \'administratively down\'. Behebe das."',
      expectedLines: ['no shutdown'],
      explanation: '"administratively down" heißt: "shutdown" ist aktiv - "no shutdown" hebt das auf.',
    },
    {
      prompt: 'Sam: "Zeig mir aus dem aktuellen Konfigurationsmodus heraus die laufende Konfiguration, ohne den Modus zu verlassen."',
      expectedLines: [['do show running-config', 'do show run']],
      explanation: '"do" führt den Befehl direkt aus, ohne vorher "exit" zu benötigen.',
    },
    {
      prompt: 'Sam: "Fabrikneuer Router: Hostname R-BER-01, Domain its.bw, lokaler Benutzer admin mit Cisco123!, Interface g0/0 mit 10.20.30.1/24 aktivieren, danach speichern."',
      expectedLines: [
        'hostname R-BER-01',
        'ip domain-name its.bw',
        'username admin secret Cisco123!',
        'interface g0/0',
        'ip address 10.20.30.1 255.255.255.0',
        'no shutdown',
        'copy running-config startup-config',
      ],
      explanation: 'Identität, Benutzer, dann Interface-Sequenz (auswählen → IP → aktivieren), zuletzt dauerhaft speichern.',
    },
  ];
}

export function buildCiscoBasicDeviceConfigurationLesson() {
  return {
    title: 'Grundkonfiguration & IP-Konfiguration',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
