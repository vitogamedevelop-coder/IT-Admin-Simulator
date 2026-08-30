import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory Foundation – academy lesson
// =============================================================================

export const AD_FOUNDATION_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-foundation');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const objectAttributeSchemaSvg = `<svg viewBox="0 0 320 190" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="15" width="130" height="150" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="35" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Objekt: Benutzer</text>
  <line x1="35" y1="45" x2="135" y2="45" stroke="#30363d" stroke-width="1"/>
  <text x="40" y="62" fill="#c9d1d9" font-size="10">Name: Max Mustermann</text>
  <text x="40" y="77" fill="#c9d1d9" font-size="10">E-Mail: max@nexus.local</text>
  <text x="40" y="92" fill="#c9d1d9" font-size="10">Abteilung: IT</text>
  <text x="40" y="107" fill="#c9d1d9" font-size="10">Telefon: 1234</text>
  <text x="40" y="122" fill="#c9d1d9" font-size="10">Status: Aktiv</text>

  <rect x="170" y="15" width="130" height="150" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="35" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Schema</text>
  <line x1="185" y1="45" x2="285" y2="45" stroke="#30363d" stroke-width="1"/>
  <text x="190" y="62" fill="#c9d1d9" font-size="10">erlaubte Eigenschaften:</text>
  <text x="190" y="79" fill="#c9d1d9" font-size="10">- Name</text>
  <text x="190" y="94" fill="#c9d1d9" font-size="10">- E-Mail</text>
  <text x="190" y="109" fill="#c9d1d9" font-size="10">- Abteilung</text>
  <text x="190" y="124" fill="#c9d1d9" font-size="10">- Telefon</text>
  <text x="190" y="139" fill="#c9d1d9" font-size="10">- Status</text>

  <text x="160" y="178" text-anchor="middle" fill="#8b949e" font-size="9">Attribute = die Eigenschaften, die das Schema für ein Objekt erlaubt.</text>
</svg>`;

const withoutVsWithAdSvg = `<svg viewBox="0 0 320 240" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="80" y="20" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Ohne AD</text>
  <rect x="20" y="35" width="50" height="40" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="45" y="55" text-anchor="middle" fill="#c9d1d9" font-size="9">PC1</text>
  <text x="45" y="68" text-anchor="middle" fill="#8b949e" font-size="7">lokale Konten</text>
  <rect x="90" y="35" width="50" height="40" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="115" y="55" text-anchor="middle" fill="#c9d1d9" font-size="9">PC2</text>
  <text x="115" y="68" text-anchor="middle" fill="#8b949e" font-size="7">lokale Konten</text>
  <rect x="20" y="90" width="50" height="40" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="45" y="110" text-anchor="middle" fill="#c9d1d9" font-size="9">PC3</text>
  <text x="45" y="123" text-anchor="middle" fill="#8b949e" font-size="7">lokale Konten</text>
  <rect x="90" y="90" width="50" height="40" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="115" y="110" text-anchor="middle" fill="#c9d1d9" font-size="9">PC4</text>
  <text x="115" y="123" text-anchor="middle" fill="#8b949e" font-size="7">lokale Konten</text>

  <text x="240" y="20" text-anchor="middle" fill="#00ff66" font-size="12" font-weight="bold">Mit AD</text>
  <rect x="215" y="35" width="50" height="95" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="240" y="60" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">AD</text>
  <text x="240" y="75" text-anchor="middle" fill="#c9d1d9" font-size="8">zentrale</text>
  <text x="240" y="88" text-anchor="middle" fill="#c9d1d9" font-size="8">Verwaltung</text>
  <text x="240" y="101" text-anchor="middle" fill="#c9d1d9" font-size="8">Identitäten</text>
  <text x="240" y="114" text-anchor="middle" fill="#c9d1d9" font-size="8">Richtlinien</text>

  <rect x="170" y="155" width="50" height="40" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="195" y="175" text-anchor="middle" fill="#c9d1d9" font-size="9">PC1</text>
  <rect x="260" y="155" width="50" height="40" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="285" y="175" text-anchor="middle" fill="#c9d1d9" font-size="9">PC2</text>
  <rect x="170" y="205" width="50" height="40" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="195" y="225" text-anchor="middle" fill="#c9d1d9" font-size="9">PC3</text>
  <rect x="260" y="205" width="50" height="40" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="285" y="225" text-anchor="middle" fill="#c9d1d9" font-size="9">PC4</text>

  <line x1="195" y1="155" x2="240" y2="130" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="285" y1="155" x2="240" y2="130" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="195" y1="205" x2="240" y2="130" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="285" y1="205" x2="240" y2="130" stroke="#00f0ff" stroke-width="1.5"/>

  <text x="160" y="155" text-anchor="middle" fill="#8b949e" font-size="9">gleiche Konten & Rechte überall</text>
</svg>`;

const protocolOverviewSvg = `<svg viewBox="0 0 320 240" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="90" width="60" height="50" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="50" y="115" text-anchor="middle" fill="#c9d1d9" font-size="9">Client</text>
  <text x="50" y="128" text-anchor="middle" fill="#c9d1d9" font-size="9">PC</text>

  <rect x="240" y="20" width="60" height="50" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="270" y="40" text-anchor="middle" fill="#00f0ff" font-size="9">AD DS</text>
  <text x="270" y="53" text-anchor="middle" fill="#c9d1d9" font-size="9">Domain</text>
  <text x="270" y="66" text-anchor="middle" fill="#c9d1d9" font-size="9">Controller</text>

  <rect x="240" y="95" width="60" height="50" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="270" y="115" text-anchor="middle" fill="#00f0ff" font-size="9">DNS</text>
  <text x="270" y="128" text-anchor="middle" fill="#c9d1d9" font-size="9">Dienst-</text>
  <text x="270" y="141" text-anchor="middle" fill="#c9d1d9" font-size="9">findung</text>

  <rect x="240" y="170" width="60" height="50" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="270" y="190" text-anchor="middle" fill="#00f0ff" font-size="9">Kerberos</text>
  <text x="270" y="203" text-anchor="middle" fill="#c9d1d9" font-size="9">Authen-</text>
  <text x="270" y="216" text-anchor="middle" fill="#c9d1d9" font-size="9">tifizierung</text>

  <rect x="130" y="170" width="60" height="50" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="160" y="190" text-anchor="middle" fill="#ffcc00" font-size="9">LDAP</text>
  <text x="160" y="203" text-anchor="middle" fill="#c9d1d9" font-size="9">Verzeichnis-</text>
  <text x="160" y="216" text-anchor="middle" fill="#c9d1d9" font-size="9">abfrage</text>

  <line x1="80" y1="105" x2="240" y2="45" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="145" y="55" text-anchor="middle" fill="#8b949e" font-size="8">DNS: Wo ist der DC?</text>

  <line x1="80" y1="115" x2="240" y2="120" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="145" y="128" text-anchor="middle" fill="#8b949e" font-size="8">Kerberos: Ticket</text>

  <line x1="80" y1="125" x2="160" y2="170" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="100" y="160" text-anchor="middle" fill="#8b949e" font-size="8">LDAP: Suche</text>

  <line x1="190" y1="195" x2="240" y2="195" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3,2"/>
</svg>`;

const smbVsNtfsSvg = `<svg viewBox="0 0 320 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="100" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="40" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">SMB</text>
  <text x="85" y="58" text-anchor="middle" fill="#c9d1d9" font-size="10">Netzwerkprotokoll</text>
  <text x="85" y="76" text-anchor="middle" fill="#8b949e" font-size="9">„Weg zur Freigabe“</text>
  <text x="85" y="94" text-anchor="middle" fill="#8b949e" font-size="9">\\Server\\Freigabe</text>

  <rect x="170" y="20" width="130" height="100" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="40" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">NTFS</text>
  <text x="235" y="58" text-anchor="middle" fill="#c9d1d9" font-size="10">Dateisystemrechte</text>
  <text x="235" y="76" text-anchor="middle" fill="#8b949e" font-size="9">„Rechte auf der Platte“</text>
  <text x="235" y="94" text-anchor="middle" fill="#8b949e" font-size="9">Lesen / Schreiben</text>

  <line x1="150" y1="70" x2="170" y2="70" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#8b949e"/></marker></defs>
  <text x="160" y="85" text-anchor="middle" fill="#8b949e" font-size="8">beide wirken zusammen</text>
</svg>`;

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------------
  // 1. NEXUS-Einstieg
  // ---------------------------------------------------------------------------
  exps.push(explanation('nexus-einstieg-classic', 'Ein typischer Arbeitstag in NEXUS', 'classic', [
    { type: 'text', content: 'In der IT-Abteilung von NEXUS gibt es mehrere Arbeitsplatz-PCs. Jeder Rechner verfügt über eigene, lokal angelegte Benutzerkonten. Max arbeitet normalerweise an PC3. An diesem Morgen fällt PC3 aus – das Netzteil ist defekt.' },
    { type: 'text', content: 'Max wechselt zu PC2 und möchte sich anmelden. Doch sein Konto existiert dort nicht, weil Benutzer und Passwörter nur auf PC3 hinterlegt sind. Seine lokal gespeicherten Daten sind ebenfalls nicht erreichbar. Der Helpdesk muss jetzt entweder ein neues lokales Konto auf PC2 einrichten oder Max wartet, bis PC3 repariert ist.' },
    { type: 'text', content: 'Das ist kein Hardwareproblem des einzelnen PCs. Das eigentliche Problem ist, dass Identitäten, Daten und Rechte nicht zentral, sondern nur auf jedem einzelnen Rechner verwaltet werden.' },
    { type: 'question', question: 'Was ist hier das eigentliche Verwaltungsproblem?', options: ['Der PC ist zu langsam', 'Benutzer, Daten und Rechte werden nur lokal verwaltet', 'Das Netzwerk hat zu viele Switches', 'Der Bildschirm ist defekt'], correct: 1, explanation: 'Der zentrale Schwachpunkt ist die fehlende zentrale Verwaltung von Identitäten, Ressourcen und Einstellungen. Ein Hardwaredefekt am Arbeitsplatz würde sonst nicht den Zugriff auf die gesamte Arbeitsumgebung blockieren.' },
  ]));

  exps.push(explanation('nexus-einstieg-intuitive', 'Jeder Schrank hat sein eigenes Schlüsselbund', 'intuitive', [
    { type: 'text', content: 'Stell dir ein Büro vor, in dem jeder Schrank sein eigenes Schlüsselbund hat. Willst du an einem anderen Schrank arbeiten, passt kein Schlüssel. Deine Unterlagen liegen im ursprünglichen Schrank, und du musst erst beim Hausmeister nach einem neuen Schlüssel fragen. Genau so fühlt sich reine lokale Benutzerverwaltung an.' },
    { type: 'text', content: 'Ein Verzeichnisdienst ist vergleichbar mit einer zentralen Zutrittskontrolle: Ein Schlüsselbund für das gesamte Gebäude, ein zentrales Mitarbeiterverzeichnis, das weiß, wer wohin darf. Wechselt jemand den Arbeitsplatz, ändert sich an seinen Rechten nichts.' },
  ]));

  // ---------------------------------------------------------------------------
  // 2. Verzeichnisdienst
  // ---------------------------------------------------------------------------
  exps.push(explanation('verzeichnisdienst-classic', 'Was ist ein Verzeichnisdienst?', 'classic', [
    { type: 'text', content: 'Ein Verzeichnisdienst verwaltet Netzwerkobjekte und ihre Eigenschaften zentral. Statt an jedem einzelnen Rechner lokal zu hinterlegen, gibt es eine zentrale Datenbank, die alle relevanten Informationen bereithält.' },
    { type: 'list', title: 'Typische Verzeichnisobjekte', items: [
      'Benutzer',
      'Computer',
      'Gruppen',
      'Drucker',
      'Organisationseinheiten',
    ] },
    { type: 'list', title: 'Typische Attribute', items: [
      'Name',
      'E-Mail-Adresse',
      'Abteilung',
      'Telefonnummer',
    ] },
    { type: 'question', question: 'Was ist ein Verzeichnisdienst?', options: ['Eine zentrale Datenbank für Netzwerkobjekte und ihre Eigenschaften', 'Ein Programm zur Formatierung von Festplatten', 'Ein Routing-Protokoll für große Netze', 'Ein Antivirus-Tool'], correct: 0, explanation: 'Ein Verzeichnisdienst hält Objekte und ihre Attribute zentral vor.' },
  ]));

  exps.push(explanation('verzeichnisdienst-intuitive', 'Das digitale Telefonbuch', 'intuitive', [
    { type: 'text', content: 'Stell dir ein digitales Telefonbuch vor: Es hält nicht nur die Namen, sondern auch Adresse, Abteilung und Rolle jedes Mitarbeiters an einem zentralen Ort. Jeder, der danach sucht, bekommt aktuelle Daten – nicht eine eigene Kopie auf dem eigenen Rechner.' },
  ]));

  // ---------------------------------------------------------------------------
  // 3. Objekt, Attribut, Schema
  // ---------------------------------------------------------------------------
  exps.push(explanation('objekt-attribut-schema-classic', 'Objekt, Attribut und Schema', 'classic', [
    { type: 'text', content: 'Ein Verzeichnis speichert Objekte. Ein Objekt ist eine konkrete verwaltete Einheit, zum Beispiel ein Benutzer, ein Computer oder ein Drucker. Jedes Objekt besitzt Attribute – also Eigenschaften wie Name, E-Mail-Adresse oder Abteilung.' },
    { type: 'text', content: 'Das Schema legt fest, welche Objektarten es überhaupt geben darf und welche Attribute sie besitzen dürfen. Es ist somit das Regelwerk des Verzeichnisdienstes. Beispielsweise kann das Schema vorsehen, dass ein Benutzerobjekt die Attribute Name, E-Mail und Abteilung haben muss, aber kein Attribut Fahrzeugkennzeichen.' },
    { type: 'text', content: 'Das Schema ist erweiterbar, aber eine alltägliche Admin-Aufgabe ist das Ändern des Schemas nicht. Für das Verständnis reicht: Das Schema definiert die erlaubten Strukturen im Verzeichnis.' },
    { type: 'diagram', content: objectAttributeSchemaSvg },
    { type: 'question', question: 'Welche Aussage unterscheidet Objekt und Attribut korrekt?', options: ['Ein Attribut ist eine konkrete verwaltete Einheit, ein Objekt beschreibt eine Eigenschaft', 'Ein Objekt ist eine verwaltete Einheit; ein Attribut ist eine Eigenschaft dieses Objekts', 'Objekte und Attribute sind dasselbe', 'Ein Schema enthält nur Objekte, keine Attribute'], correct: 1, explanation: 'Ein Objekt ist das eigentliche Verzeichnis-Element. Attribute beschreiben seine Eigenschaften.' },
  ]));

  exps.push(explanation('objekt-attribut-schema-intuitive', 'Mitarbeiterkarteikarte', 'intuitive', [
    { type: 'text', content: 'Stell dir eine Mitarbeiterkarteikarte vor: Die Karte selbst ist das Objekt. Die darauf eingetragenen Felder wie Name, Abteilung oder Durchwahl sind Attribute. Das Formular, das vorschreibt, welche Felder ausgefüllt werden dürfen, ist das Schema.' },
  ]));

  // ---------------------------------------------------------------------------
  // 4. Lokale Verwaltung
  // ---------------------------------------------------------------------------
  exps.push(explanation('lokale-verwaltung-classic', 'Das Problem lokaler Konten', 'classic', [
    { type: 'text', content: 'Ohne zentrale Verwaltung benötigt jeder Rechner eigene lokale Benutzerkonten. Mitarbeiter können an einem fremden Arbeitsplatz nicht arbeiten, und Passwörter müssen an vielen Stellen getrennt gepflegt werden.' },
    { type: 'list', title: 'Nachteile', items: [
      'Hoher Verwaltungsaufwand',
      'Keine automatische Anmeldung an einem anderen Rechner',
      'Passwörter an vielen Stellen',
      'Ressourcen sind schwer zentral verfügbar',
    ] },
    { type: 'diagram', content: withoutVsWithAdSvg },
    { type: 'text', content: 'Ein Beispiel: 4 Computer × 3 Benutzer können bis zu 12 separate lokale Konten erfordern. Bei zentraler Verwaltung reichen dagegen 3 zentrale Konten, die für alle passenden Rechner gelten.' },
    { type: 'question', question: 'Welches Problem vermeidet man mit Active Directory?', options: ['Zu viele lokale Konten an einzelnen Rechnern', 'Zu wenige DNS-Root-Server', 'Zu schnelle CPU-Taktraten', 'Zu kurze Netzwerkkabel'], correct: 0, explanation: 'AD ermöglicht zentrale Konten statt dezentraler lokaler Konten.' },
  ]));

  // ---------------------------------------------------------------------------
  // 5. AD DS und AD-Fähigkeiten
  // ---------------------------------------------------------------------------
  exps.push(explanation('ad-ds-classic', 'Active Directory Domain Services (AD DS)', 'classic', [
    { type: 'text', content: 'Active Directory Domain Services ist der Windows-Dienst für einen zentralen Verzeichnisdienst in einer Domäne. AD DS verwaltet Identitäten, Authentifizierung, Autorisierungsgrundlagen und zentrale Verwaltung.' },
    { type: 'text', content: 'Wichtig: AD DS verwaltet Identitäten und Verzeichnisinformationen, nicht alle Unternehmensdaten. Dateien und Datenbanken liegen auf eigenen Dateiservern. AD DS sagt aber, wer auf welche Ressourcen zugreifen darf.' },
    { type: 'list', title: 'Kernfunktionen', items: [
      'Zentrale Identitäten',
      'Computerobjekte',
      'Gruppen',
      'Authentifizierung',
      'Autorisierung',
      'Richtlinienbezug',
      'Verzeichnisabfragen',
      'Replikation',
    ] },
    { type: 'text', content: 'Zusätzlich bietet AD weitere organisatorische und technische Fähigkeiten: Mehrere Domain Controller können Informationen miteinander abgleichen. Administratoren können Aufgaben gezielt delegieren, ohne jedem volle Rechte zu geben. Das Verzeichnis ist erweiterbar und lässt sich an verschiedene Organisationsgrößen anpassen.' },
    { type: 'question', question: 'Welche Rolle spielt AD DS?', options: ['Windows-Dienst für zentralen Verzeichnisdienst und Identitäten in einer Domäne', 'Dateiserver für alle Unternehmensdaten', 'Netzwerkprotokoll für Druckaufträge', 'Backup-Tool für lokale Festplatten'], correct: 0, explanation: 'AD DS ist der zentrale Verzeichnisdienst für Windows-Domänen. Daten selbst liegen auf anderen Servern.' },
  ]));

  exps.push(explanation('ad-ds-intuitive', 'Das zentrale Mitarbeiter- und Rechtekontrollzentrum', 'intuitive', [
    { type: 'text', content: 'Stell dir AD DS als zentrale Personal- und Zutrittsverwaltung eines größeren Gebäudes vor: Sie weiß, wer wer ist, welche Berechtigungen jemand hat und welche Regeln für Computer gelten. Wer den Arbeitsplatz wechselt, nimmt sein Profil und seine Rechte mit – weil alles zentral gespeichert ist.' },
  ]));

  // ---------------------------------------------------------------------------
  // 6. DNS, Kerberos, Zeit, LDAP
  // ---------------------------------------------------------------------------
  exps.push(explanation('dns-kerberos-classic', 'DNS, Kerberos, LDAP und Zeitsynchronisation', 'classic', [
    { type: 'text', content: 'AD DS ist stark auf DNS angewiesen: Clients finden über DNS passende Domain Controller und Dienste. Ohne funktionierendes DNS kann ein Client den Weg zur Domäne nicht finden.' },
    { type: 'text', content: 'Kerberos ist das in typischen Windows-Domänen verwendete Authentifizierungsprotokoll. Nach einer erfolgreichen Anmeldung stellt es Tickets aus, mit denen sich der Benutzer bei berechtigten Diensten ausweisen kann, ohne das Passwort erneut eingeben zu müssen. Das ermöglicht Single Sign-On.' },
    { type: 'text', content: 'Für Kerberos ist eine konsistente Uhrzeit wichtig. Große Zeitabweichungen zwischen Client und Server können Authentifizierungsvorgänge verhindern. Daher wird in AD-Umgebungen ein Zeitsynchronisationsdienst wie NTP verwendet.' },
    { type: 'text', content: 'LDAP ist ein standardisiertes Protokoll, mit dem man Verzeichnisinformationen abfragen und ändern kann. AD DS unterstützt LDAP, aber LDAP ist nicht gleich Active Directory. LDAP ist ein Protokoll, AD DS ein Verzeichnisdienst.' },
    { type: 'diagram', content: protocolOverviewSvg },
    { type: 'question', question: 'Welche Rolle spielt DNS für AD DS?', options: ['Clients finden Domain Controller und Dienste', 'DNS speichert Passwörter', 'DNS ersetzt die zentrale Benutzerverwaltung', 'DNS ist nur für Webseiten zuständig'], correct: 0, explanation: 'DNS hilft Clients, passende Domain Controller und Dienste aufzufinden.' },
  ]));

  // ---------------------------------------------------------------------------
  // 7. SMB und NTFS
  // ---------------------------------------------------------------------------
  exps.push(explanation('smb-ntfs-classic', 'SMB und NTFS', 'classic', [
    { type: 'text', content: 'SMB ist ein Netzwerkprotokoll für Datei-, Druck- und Ressourcenzugriff über das Netz. NTFS ist ein lokales Dateisystem, das Berechtigungen auf Datei- und Ordnerebene regelt.' },
    { type: 'text', content: 'Beide Ebenen wirken zusammen: SMB transportiert den Netzwerkzugriff, NTFS prüft die Rechte auf dem Datenträger. Ein Benutzer kann eine Freigabe erreichen, trotzdem aber eine Datei nicht öffnen, wenn die NTFS-Berechtigungen das verweigern.' },
    { type: 'diagram', content: smbVsNtfsSvg },
    { type: 'question', question: 'Ein Benutzer erreicht die Freigabe, kann die darin enthaltene Datei aber nicht öffnen. Welche Berechtigungsebene ist zusätzlich entscheidend?', options: ['SMB', 'NTFS', 'DNS', 'Kerberos'], correct: 1, explanation: 'SMB regelt den Weg zur Freigabe. NTFS regelt die Rechte auf der Datei oder dem Ordner im Dateisystem.' },
  ]));

  // ---------------------------------------------------------------------------
  // 8. Authentifizierung vs. Autorisierung
  // ---------------------------------------------------------------------------
  exps.push(explanation('authn-authz-classic', 'Authentifizierung vs. Autorisierung', 'classic', [
    { type: 'text', content: 'Authentifizierung beantwortet die Frage: Wer bist du? Autorisierung beantwortet die Frage: Was darfst du? Beides sind getrennte Schritte.' },
    { type: 'text', content: 'Ein Mitarbeiter kann sich erfolgreich anmelden (Authentifizierung), aber trotzdem keinen Ordner öffnen, wenn die Berechtigung fehlt (Autorisierung). Umgekehrt nützt eine Berechtigung nichts, wenn sich niemand authentifiziert hat.' },
    { type: 'question', question: 'Was ist der Unterschied zwischen Authentifizierung und Autorisierung?', options: ['Wer bist du? vs. Was darfst du?', 'Was darfst du? vs. Wer bist du?', 'IP-Adresse vs. MAC-Adresse', 'Router vs. Switch'], correct: 0, explanation: 'Authentifizierung prüft die Identität, Autorisierung die Berechtigung.' },
  ]));

  // ---------------------------------------------------------------------------
  // 9. Replikation, Delegation, Richtlinien, Interoperabilität
  // ---------------------------------------------------------------------------
  exps.push(explanation('replikation-delegation-classic', 'Replikation, Delegation und zentrale Richtlinien', 'classic', [
    { type: 'text', content: 'Mehrere Domain Controller können Verzeichnisdaten miteinander abgleichen. Dadurch entsteht keine einzelne Fehlerstelle, und Informationen bleiben verfügbar. Die genaue Replikationstopologie hängt von Sites, Verbindungen und Konfiguration ab.' },
    { type: 'text', content: 'Delegierung bedeutet, dass nicht jeder Administrator alle Rechte braucht. Ein Helpdesk darf beispielsweise Passwörter zurücksetzen, darf aber nicht Domänencontroller verwalten. Das unterstützt das Prinzip der geringsten Rechte.' },
    { type: 'text', content: 'Richtlinien ermöglichen es, Einstellungen für viele Benutzer oder Computer zentral vorzugeben. Beispiele sind Passwortregeln, Bildschirmsperren oder Softwareeinschränkungen. AD nutzt dafür Gruppenrichtlinien, die später detailliert behandelt werden.' },
    { type: 'text', content: 'AD basiert auf Standards wie DNS und LDAP. Das ermöglicht die Einbindung weiterer Dienste und Systeme, ohne dass jedes System Windows-spezifisch sein muss.' },
    { type: 'question', question: 'Was bedeutet Delegation in einem Verzeichnisdienst?', options: ['Aufgaben gezielt an Rollen mit passenden Rechten vergeben', 'Jeder Administrator erhält alle Rechte', 'Automatisches Löschen alter Konten', 'Lokale Passwortänderung durch Benutzer'], correct: 0, explanation: 'Delegation teilt Verwaltungsaufgaben so auf, dass jede Rolle nur die nötigen Rechte erhält.' },
  ]));

  // ---------------------------------------------------------------------------
  // 10. Transfer / Zusammenfassung
  // ---------------------------------------------------------------------------
  exps.push(explanation('ad-zusammenfassung-classic', 'Warum Active Directory?', 'classic', [
    { type: 'text', content: 'Active Directory löst das zentrale Verwaltungsproblem dezentraler lokaler Konten. Es bietet eine strukturierte, zentrale Datenbank für Objekte wie Benutzer, Computer und Gruppen. Attribute beschreiben diese Objekte, das Schema definiert die erlaubten Strukturen.' },
    { type: 'text', content: 'Clients finden Domain Controller über DNS, Kerberos übernimmt die Authentifizierung mit Single Sign-On, und LDAP ermöglicht standardisierte Verzeichnisabfragen. SMB ermöglicht Netzwerkzugriff auf Ressourcen, NTFS regelt die Rechte im Dateisystem.' },
    { type: 'text', content: 'AD ist erweiterbar, skalierbar und unterstützt Delegation, Replikation und zentrale Richtlinien. Es ersetzt keine Dateiserver oder Backups, organisiert aber, wer auf welche Ressourcen zugreifen darf.' },
    { type: 'question', question: 'Warum ist ein Verzeichnisdienst in einer größeren Organisation sinnvoll?', options: ['Weil er zentrale Identitäten, Rechte und Richtlinien konsistent verwaltet', 'Weil er lokale Festplatten schneller macht', 'Weil er alle Dateien zentral speichert', 'Weil er Switches überflüssig macht'], correct: 0, explanation: 'Ein Verzeichnisdienst zentralisiert Identitäten und Rechte. Daten und Switches bleiben weiterhin notwendig.' },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'ad-objekt-attribut-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff der passenden Kategorie zu: Objekt oder Attribut?',
      pairs: [
        { left: 'Benutzer Max Mustermann', right: 'Objekt' },
        { left: 'E-Mail-Adresse', right: 'Attribut' },
        { left: 'Computer PC-023', right: 'Objekt' },
        { left: 'Abteilung', right: 'Attribut' },
        { left: 'Drucker HQ-Laser', right: 'Objekt' },
        { left: 'Telefonnummer', right: 'Attribut' },
      ],
      explanation: 'Objekte sind die verwalteten Einheiten. Attribute beschreiben ihre Eigenschaften.',
    },
    {
      id: 'ad-protokolle-matching',
      type: 'matching',
      question: 'Ordne jedes System seiner Hauptaufgabe im AD-Umfeld zu.',
      pairs: [
        { left: 'DNS', right: 'Dienst- und DC-Lokalisierung' },
        { left: 'Kerberos', right: 'Ticket-basierte Authentifizierung' },
        { left: 'LDAP', right: 'Verzeichnisabfragen und -änderungen' },
        { left: 'SMB', right: 'Netzwerkzugriff auf Freigaben' },
        { left: 'NTFS', right: 'Dateisystemberechtigungen' },
      ],
      explanation: 'DNS findet Dienste, Kerberos authentifiziert, LDAP fragt das Verzeichnis ab, SMB transportiert Netzwerkzugriff, NTFS prüft Dateirechte.',
    },
    {
      id: 'ad-smb-ntfs-szenario',
      type: 'select-best',
      question: 'Ein Mitarbeiter erreicht die Freigabe "\\Datei01\\Dokumente", kann darin liegende Dateien aber nicht öffnen. Welche Ebene prüfst du zusätzlich?',
      options: ['DNS', 'SMB', 'NTFS-Berechtigungen', 'Kerberos-Ticketgröße'],
      correct: 2,
      explanation: 'Der Zugriff auf die Freigabe klappt, also ist SMB meist in Ordnung. NTFS-Berechtigungen auf den Dateien oder Ordnern können den Zugriff trotzdem verweigern.',
    },
    {
      id: 'ad-authn-authz-select',
      type: 'select-best',
      question: 'Ein Benutzer meldet sich erfolgreich an, darf aber einen bestimmten Ordner nicht öffnen. Welcher Schritt fehlt?',
      options: ['Authentifizierung', 'Autorisierung', 'Replikation', 'Delegation'],
      correct: 1,
      explanation: 'Die Authentifizierung hat geklappt. Es fehlen die passenden Berechtigungen, also die Autorisierung.',
    },
    {
      id: 'ad-delegation-select',
      type: 'select-best',
      question: 'Ein Helpdesk-Mitarbeiter soll Passwörter zurücksetzen dürfen, aber keine Domänencontroller verwalten. Wie nennt man diese gezielte Rechtevergabe?',
      options: ['Replikation', 'Delegation', 'Authentifizierung', 'Autorisierung'],
      correct: 1,
      explanation: 'Delegation teilt Verwaltungsaufgaben so auf, dass jede Rolle nur die nötigen Rechte erhält.',
    },
    {
      id: 'ad-ldap-vs-ad',
      type: 'select-best',
      question: 'Was beschreibt LDAP am besten im Vergleich zu Active Directory?',
      options: ['Ein Microsoft-Verzeichnisdienst', 'Ein Protokoll zum Zugriff auf Verzeichnisinformationen', 'Ein Dateisystem', 'Ein Authentifizierungsdienst'],
      correct: 1,
      explanation: 'LDAP ist ein Protokoll. Active Directory ist ein Verzeichnisdienst, der LDAP unter anderem unterstützt.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist ein Verzeichnisdienst?', options: ['Eine zentrale Datenbank für Netzwerkobjekte und ihre Eigenschaften', 'Ein Programm zur Formatierung von Festplatten', 'Ein Routing-Protokoll für große Netze', 'Ein Antivirus-Tool'], correct: 0, explanation: 'Ein Verzeichnisdienst hält Objekte und ihre Attribute zentral.' },
    { question: 'Welche Aussage unterscheidet Objekt und Attribut korrekt?', options: ['Ein Attribut ist eine verwaltete Einheit, ein Objekt beschreibt eine Eigenschaft', 'Ein Objekt ist eine verwaltete Einheit; ein Attribut ist eine Eigenschaft dieses Objekts', 'Objekte und Attribute sind dasselbe', 'Ein Schema enthält nur Objekte, keine Attribute'], correct: 1, explanation: 'Ein Objekt ist das eigentliche Verzeichnis-Element. Attribute beschreiben seine Eigenschaften.' },
    { question: 'Was ist das Schema eines Verzeichnisdienstes?', options: ['Eine Liste aller Passwörter', 'Das Regelwerk für erlaubte Objektarten und Attribute', 'Das Netzwerkprotokoll für den Datenzugriff', 'Ein Backup-Verzeichnis'], correct: 1, explanation: 'Das Schema definiert, welche Objektarten und Attribute erlaubt sind.' },
    { question: 'Welches Problem vermeidet man mit Active Directory?', options: ['Zu viele lokale Konten an einzelnen Rechnern', 'Zu wenige DNS-Root-Server', 'Zu schnelle CPU-Taktraten', 'Zu kurze Netzwerkkabel'], correct: 0, explanation: 'AD ermöglicht zentrale Konten statt dezentraler lokaler Konten.' },
    { question: 'Welche Rolle spielt DNS für AD DS?', options: ['Clients finden Domain Controller und Dienste', 'DNS speichert Passwörter', 'DNS ersetzt die zentrale Benutzerverwaltung', 'DNS ist nur für Webseiten zuständig'], correct: 0, explanation: 'DNS hilft Clients, passende Domain Controller und Dienste aufzufinden.' },
    { question: 'Wozu dient Kerberos in einer AD-Domäne?', options: ['Authentifizierung mit Tickets und Single Sign-On', 'Dateisystemberechtigungen', 'Netzwerkdruck', 'DNS-Auflösung'], correct: 0, explanation: 'Kerberos ist ein Authentifizierungsprotokoll mit Tickets.' },
    { question: 'Was ist der Unterschied zwischen SMB und NTFS?', options: ['SMB ist das Dateisystem, NTFS das Netzwerkprotokoll', 'SMB transportiert Netzwerkzugriff, NTFS regelt Rechte im Dateisystem', 'Beide regeln nur Netzwerkzugriff', 'Beide sind identisch'], correct: 1, explanation: 'SMB ist ein Netzwerkprotokoll für Ressourcenzugriff. NTFS regelt Berechtigungen auf Datei- und Ordnerebene.' },
    { question: 'Was bedeutet Delegation im AD-Kontext?', options: ['Aufgaben gezielt an Rollen mit passenden Rechten vergeben', 'Jeder Administrator erhält alle Rechte', 'Automatisches Löschen alter Konten', 'Lokale Passwortänderung durch Benutzer'], correct: 0, explanation: 'Delegation teilt Verwaltungsaufgaben so auf, dass jede Rolle nur die nötigen Rechte erhält.' },
  ];
}

function buildSummary() {
  return [
    'Ein Verzeichnisdienst verwaltet Objekte und Attribute zentral.',
    'Objekte sind verwaltete Einheiten, Attribute deren Eigenschaften. Das Schema definiert erlaubte Strukturen.',
    'Lokale Konten skalieren schlecht und vervielfachen den Verwaltungsaufwand.',
    'AD DS ist der Windows-Dienst für Domänenverzeichnisse.',
    'DNS hilft AD-Clients, Dienste zu finden.',
    'Kerberos authentifiziert mit Tickets und ermöglicht Single Sign-On.',
    'LDAP ist ein Protokoll, AD DS ein Verzeichnisdienst.',
    'SMB ermöglicht Netzwerkzugriff, NTFS regelt Dateisystemrechte.',
    'Authentifizierung prüft die Identität, Autorisierung die Berechtigung.',
    'Replikation, Delegation und zentrale Richtlinien sind wichtige AD-Fähigkeiten.',
  ];
}

export function buildAdFoundationLesson() {
  const explanations = buildExplanations();
  return {
    title: 'Active Directory – Grundlagen',
    explanations,
    summary: buildSummary(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
  };
}
