import { topicKey } from '../academyTopics.js';

// =============================================================================
// "DHCP" - fundamentals topic. Self-contained like the DNS lesson: covers the
// theory (why DHCP exists, the DORA process, lease concept, relay agent) AND the
// hands-on Windows Server side (install the DHCP role, create a scope, exclusions,
// lease duration, gateway/DNS options, reservations, authorization, testing,
// the relevant Windows shortcuts) in one lesson.
// =============================================================================

export const DHCP_TOPIC_KEY = topicKey('fundamentals', 'dhcp');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const doraSvg = `<svg viewBox="0 0 360 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="110" height="180" rx="6" fill="#0a1628" stroke="#00f0ff" stroke-width="2"/>
  <text x="75" y="50" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">CLIENT</text>
  <rect x="230" y="20" width="110" height="180" rx="6" fill="#0a1628" stroke="#00ff66" stroke-width="2"/>
  <text x="285" y="50" text-anchor="middle" fill="#c9d1d9" font-size="14" font-weight="bold">SERVER</text>
  <line x1="130" y1="70" x2="230" y2="70" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="180" y="62" text-anchor="middle" fill="#00f0ff" font-size="11">DISCOVER</text>
  <text x="180" y="85" text-anchor="middle" fill="#8b949e" font-size="10">„Ist hier ein DHCP-Server?“</text>
  <line x1="230" y1="110" x2="130" y2="110" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="180" y="102" text-anchor="middle" fill="#00ff66" font-size="11">OFFER</text>
  <text x="180" y="125" text-anchor="middle" fill="#8b949e" font-size="10">„Ich biete dir diese Konfiguration an.“</text>
  <line x1="130" y1="150" x2="230" y2="150" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="180" y="142" text-anchor="middle" fill="#00f0ff" font-size="11">REQUEST</text>
  <text x="180" y="165" text-anchor="middle" fill="#8b949e" font-size="10">„Dieses Angebot möchte ich verwenden.“</text>
  <line x1="230" y1="190" x2="130" y2="190" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="180" y="182" text-anchor="middle" fill="#00ff66" font-size="11">ACK</text>
  <text x="180" y="205" text-anchor="middle" fill="#8b949e" font-size="10">„Die Lease ist bestätigt.“</text>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const relaySvg = `<svg viewBox="0 0 360 200" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="70" width="80" height="60" rx="6" fill="#0a1628" stroke="#00f0ff" stroke-width="2"/>
  <text x="60" y="105" text-anchor="middle" fill="#c9d1d9" font-size="12">CLIENT</text>
  <text x="60" y="120" text-anchor="middle" fill="#8b949e" font-size="10">VLAN 10</text>
  <rect x="140" y="70" width="80" height="60" rx="6" fill="#0a1628" stroke="#ffcc00" stroke-width="2"/>
  <text x="180" y="100" text-anchor="middle" fill="#c9d1d9" font-size="12">L3-SWITCH</text>
  <text x="180" y="115" text-anchor="middle" fill="#ffcc00" font-size="10">Relay-Agent</text>
  <rect x="260" y="70" width="80" height="60" rx="6" fill="#0a1628" stroke="#00ff66" stroke-width="2"/>
  <text x="300" y="105" text-anchor="middle" fill="#c9d1d9" font-size="12">DHCP</text>
  <line x1="100" y1="95" x2="140" y2="95" stroke="#00f0ff" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="120" y="88" text-anchor="middle" fill="#00f0ff" font-size="10">Broadcast</text>
  <line x1="220" y1="95" x2="260" y2="95" stroke="#00ff66" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="240" y="88" text-anchor="middle" fill="#00ff66" font-size="10">Unicast</text>
  <text x="180" y="170" text-anchor="middle" fill="#8b949e" font-size="10">Der Router leitet DHCP-Broadcasts nicht weiter, sondern sendet sie gezielt an den Server.</text>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const leaseTimelineSvg = `<svg viewBox="0 0 400 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <line x1="30" y1="70" x2="370" y2="70" stroke="#8b949e" stroke-width="2"/>
  <line x1="30" y1="65" x2="30" y2="75" stroke="#00f0ff" stroke-width="2"/>
  <text x="30" y="95" text-anchor="middle" fill="#c9d1d9" font-size="10">0 %</text>
  <text x="30" y="55" text-anchor="middle" fill="#00f0ff" font-size="10">Lease Start</text>
  <line x1="200" y1="65" x2="200" y2="75" stroke="#ffcc00" stroke-width="2"/>
  <text x="200" y="95" text-anchor="middle" fill="#c9d1d9" font-size="10">50 %</text>
  <text x="200" y="55" text-anchor="middle" fill="#ffcc00" font-size="10">Renew (T1)</text>
  <line x1="297" y1="65" x2="297" y2="75" stroke="#ff6633" stroke-width="2"/>
  <text x="297" y="95" text-anchor="middle" fill="#c9d1d9" font-size="10">87,5 %</text>
  <text x="297" y="55" text-anchor="middle" fill="#ff6633" font-size="10">Rebind (T2)</text>
  <line x1="370" y1="65" x2="370" y2="75" stroke="#ff3355" stroke-width="2"/>
  <text x="370" y="95" text-anchor="middle" fill="#c9d1d9" font-size="10">100 %</text>
  <text x="370" y="55" text-anchor="middle" fill="#ff3355" font-size="10">Expire</text>
</svg>`;

function buildExplanations() {
  const exps = [];

  // -------------------------------------------------------------------
  // 1. Was ist DHCP und wozu dient es?
  // -------------------------------------------------------------------
  exps.push(explanation('was-classic', 'Was ist DHCP?', 'classic', [
    { type: 'text', content: 'DHCP (Dynamic Host Configuration Protocol) vergibt IP-Adressen und weitere Netzwerkeinstellungen (Subnetzmaske, Standardgateway, DNS-Server) automatisch an Geräte, die einem Netzwerk beitreten - anstatt jedes Gerät manuell (statisch) konfigurieren zu müssen.' },
    { type: 'text', content: 'DHCP ist ein Anwendungsprotokoll und verwendet UDP als Transport. Es wird nicht als feste einzelne OSI-Schicht auswendig gelernt.' },
    { type: 'list', title: 'Warum automatisch statt statisch?', items: [
      'Deutlich weniger manueller Aufwand, besonders bei vielen Endgeräten.',
      'Deutlich geringeres Risiko von Adresskonflikten (zwei Geräte mit derselben IP).',
      'Geräte können problemlos zwischen Netzen wechseln (z. B. Laptops).',
      'Zentrale Änderungen (z. B. neuer DNS-Server) wirken sich automatisch auf alle Clients aus.',
    ] },
  ]));

  exps.push(explanation('was-intuitive', 'Was ist DHCP?', 'intuitive', [
    { type: 'text', content: 'Stell dir DHCP wie die Garderobe eines Hotels vor: Du kommst an, bekommst automatisch eine freie Nummer (IP-Adresse) zugewiesen - musst dir keine eigene aussuchen. Beim Auschecken (Verbindung trennen) wird die Nummer wieder frei für den nächsten Gast.' },
  ]));

  // -------------------------------------------------------------------
  // 2. Der DORA-Prozess
  // -------------------------------------------------------------------
  exps.push(explanation('dora-classic', 'Der Ablauf einer IP-Zuweisung (DORA)', 'classic', [
    { type: 'text', content: 'Wenn ein Client eine IP-Adresse per DHCP anfragt, läuft im Hintergrund ein vierstufiger Ablauf ab, kurz "DORA" genannt.' },
    { type: 'list', title: 'DORA', items: [
      'Discover: Der Client sendet einen Broadcast ins Netz ("Ist hier ein DHCP-Server?").',
      'Offer: Ein DHCP-Server antwortet mit einem Angebot (eine freie IP-Adresse samt Konfiguration).',
      'Request: Der Client fordert genau dieses angebotene Angebot offiziell an.',
      'Acknowledge: Der DHCP-Server bestätigt die Zuweisung - der Client darf die IP-Adresse ab jetzt verwenden.',
    ] },
    { type: 'list', title: 'Weitere DHCP-Nachrichten (grob)', items: [
      'NAK: Der Server lehnt den Request ab.',
      'Decline: Der Client stellt fest, dass die angebotene Adresse bereits verwendet wird.',
      'Release: Der Client gibt die Lease vorzeitig zurück.',
      'Inform: Der Client hat bereits eine Adresse und fragt nur zusätzliche DHCP-Optionen ab.',
    ] },
    { type: 'list', title: 'DHCP-Ports für IPv4', items: [
      'Server-Port: UDP 67',
      'Client-Port: UDP 68',
    ] },
    { type: 'question', question: 'Wie sendet ein Client seine erste Anfrage, um überhaupt einen DHCP-Server zu finden?', options: ['Als gezielte Anfrage an eine bekannte IP', 'Als Broadcast ins gesamte lokale Netz', 'Per E-Mail an den Administrator', 'Über eine feste DNS-Anfrage'], correct: 1, explanation: 'Der Client kennt anfangs noch keinen DHCP-Server und sendet daher einen Broadcast ("Discover") ins lokale Netz.' },
  ]));

  exps.push(explanation('dora-visual', 'DORA im Überblick', 'visual', [
    { type: 'text', content: 'Die vier Schritte im Wechselspiel zwischen Client und Server. Merke: der Client beginnt stets mit einem Broadcast, weil er noch keine IP hat.' },
    { type: 'diagram', content: doraSvg },
    { type: 'list', title: 'Was passiert in jedem Schritt?', items: [
      'Discover: Client sucht einen DHCP-Server.',
      'Offer: Server bietet eine IP-Konfiguration an.',
      'Request: Client nimmt das Angebot an.',
      'ACK: Server bestätigt die Lease.',
    ] },
  ]));

  exps.push(explanation('dora-example', 'DORA in einem Satz', 'example', [
    { type: 'text', content: 'Ein neuer PC startet im Büro: Er ruft per Broadcast "Ist hier ein DHCP-Server?" (Discover). Der Server antwortet: "Ja, nimm 192.168.10.50 mit Gateway 192.168.10.1" (Offer). Der PC sagt: "OK, die nehme ich" (Request). Der Server bestätigt: "Die Lease gehört dir für 8 Tage" (ACK).' },
  ]));

  // -------------------------------------------------------------------
  // 3. DHCP Relay Agent
  // -------------------------------------------------------------------
  exps.push(explanation('relay-classic', 'Warum braucht DHCP über Netzgrenzen einen Relay-Agent?', 'classic', [
    { type: 'text', content: 'Ein DHCP-Client kennt zu Beginn noch keine IP-Adresse und sendet seine erste Anfrage (Discover) deshalb als Broadcast. Router leiten Broadcasts aber grundsätzlich NICHT in andere Netze oder VLANs weiter - das ist gewollt, sonst würden Broadcasts das gesamte Netzwerk überfluten.' },
    { type: 'text', content: 'Steht der DHCP-Server im selben Netz wie der Client, ist das kein Problem. Steht er - wie in der Praxis meist - in einem anderen Netz oder VLAN (z. B. zentral im Serverraum), kommt die Broadcast-Anfrage des Clients dort nie an.' },
    { type: 'text', content: 'Die Lösung: ein DHCP Relay Agent. Er sitzt typischerweise auf dem L3-Gerät, das das Clientnetz verbindet, empfängt den Broadcast, wandelt ihn in ein gezieltes Unicast-Paket an den DHCP-Server um und leitet die Antwort zurück.' },
    { type: 'diagram', content: relaySvg },
    { type: 'question', question: 'Clients in VLAN 10 bekommen keine IP-Adresse. Routing funktioniert, der DHCP-Server steht im Servernetz. Was fehlt wahrscheinlich auf dem Gateway von VLAN 10?', options: ['Ein DHCP Relay Agent / DHCP-Weiterleitung', 'Ein neuer DNS-Server', 'Eine kürzere Lease-Time', 'Eine zusätzliche Subnetzmaske'], correct: 0, explanation: 'Ohne Relay-Agent erreicht der DHCP-Broadcast des Clients den Server im anderen Netz nicht.' },
  ]));

  // -------------------------------------------------------------------
  // 4. Lease-Konzept
  // -------------------------------------------------------------------
  exps.push(explanation('lease-classic', 'Das Lease-Konzept', 'classic', [
    { type: 'text', content: 'Eine per DHCP vergebene IP-Adresse wird nicht dauerhaft, sondern nur für eine begrenzte Zeit ("Lease", Miete) vergeben.' },
    { type: 'list', title: 'Wichtige Punkte zur Lease', items: [
      'Vor Ablauf der Leasedauer versucht der Client automatisch, dieselbe Adresse zu verlängern.',
      'Wird die Adresse nicht verlängert (z. B. Gerät bleibt lange offline), fällt sie nach Ablauf wieder in den freien Adresspool zurück.',
      'Kurze Leasedauern eignen sich für Netze mit vielen wechselnden Geräten (z. B. Gäste-WLAN), lange Leasedauern für stabile, selten wechselnde Umgebungen.',
    ] },
  ]));

  exps.push(explanation('lease-visual', 'Lease-Lebenslauf', 'visual', [
    { type: 'text', content: 'Die wichtigsten Zeitpunkte im Lease-Leben. Renew und Rebind sind typische Werte; der genaue Zeitpunkt kann je nach Implementierung leicht variieren.' },
    { type: 'diagram', content: leaseTimelineSvg },
    { type: 'list', title: 'Lease-Phasen', items: [
      'T1 (ca. 50 % der Lease): Renewing - der Client fragt bevorzugt den bisherigen Server nach einer Verlängerung.',
      'T2 (ca. 87,5 % der Lease): Rebinding - der ursprüngliche Server antwortet nicht, der Client versucht einen beliebigen DHCP-Server zu erreichen.',
      '100 %: Expire - ohne Verlängerung darf der Client die Lease nicht mehr unbegrenzt verwenden.',
    ] },
  ]));

  // -------------------------------------------------------------------
  // 5. Betriebsmodi
  // -------------------------------------------------------------------
  exps.push(explanation('modes-classic', 'Betriebsmodi: statisch, automatisch, dynamisch', 'classic', [
    { type: 'list', title: 'Statische Vergabe / Reservierung', items: [
      'Ein bestimmter Client (meist identifiziert über seine MAC-Adresse) erhält immer dieselbe IP-Adresse.',
      'Geeignet für Drucker, Server, Infrastruktur.',
      'Wichtig: Das ist NICHT dasselbe wie eine manuell am Client eingetragene statische IP. Die Konfiguration bleibt zentral verwaltet.',
    ] },
    { type: 'list', title: 'Automatische Vergabe', items: [
      'Adresse einmal automatisch zugewiesen und dauerhaft gebunden.',
      'Nicht überpriorisieren; in manchen Systemen ähnlich einer sehr langen Reservierung.',
    ] },
    { type: 'list', title: 'Dynamische Vergabe', items: [
      'Typischer DHCP-Betrieb: Adresse aus dem Pool mit einer Lease-Time.',
      'Nach Ablauf kann die Adresse erneut vergeben werden.',
    ] },
    { type: 'question', question: 'Ein Drucker soll über DHCP immer dieselbe IP bekommen, die Konfiguration aber zentral bleiben. Was nutzt man?', options: ['Manuelle statische IP am Drucker', 'Eine DHCP-Reservierung anhand der MAC-Adresse', 'Einen beliebigen Adress aus dem Pool', 'DNS-Forwarding'], correct: 1, explanation: 'Eine Reservierung bindet eine feste IP an die MAC-Adresse des Geräts, bleibt aber zentral im DHCP-Server verwaltet.' },
  ]));

  // -------------------------------------------------------------------
  // 6. Ausfallsicherheit
  // -------------------------------------------------------------------
  exps.push(explanation('redundancy-classic', 'DHCP-Ausfallsicherheit', 'classic', [
    { type: 'text', content: 'Damit ein einzelner DHCP-Serverausfall nicht alle Clients sofort lahmlegt, gibt es verschiedene Redundanzstrategien. Moderne Failover-Systeme arbeiten anders als klassische Split-Scopes.' },
    { type: 'list', title: 'Klassische Split-Scope-Modelle', items: [
      '80/20: Hauptserver verwaltet den größeren Anteil des Pools, Backupserver den kleineren.',
      '50/50: Zwei Server teilen den Pool, um Lastverteilung und Ausfallsicherheit zu bieten.',
    ] },
    { type: 'list', title: 'Wichtige technische Präzisierung', items: [
      'Bei manuell unabhängigen Split-Scope-Servern dürfen sich die Pools NICHT überschneiden.',
      'Bei echtem DHCP-Failover koordinieren sich die Server und teilen Lease-Informationen, um Doppelvergaben zu vermeiden.',
    ] },
    { type: 'question', question: 'Zwei unabhängige DHCP-Server sollen denselben Bereich abdecken. Was muss für die Pools gelten?', options: ['Sie dürfen sich überschneiden, Failover regelt alles', 'Sie dürfen sich nicht überschneiden', 'Nur der erste Server darf Adressen vergeben', 'Beide verwenden dieselbe Lease-Datenbank automatisch'], correct: 1, explanation: 'Ohne echte Failover-Koordination würden sich überschneidende Pools zu doppelten Adressvergaben führen.' },
  ]));

  // -------------------------------------------------------------------
  // 7. Praxis: DHCP-Rolle installieren
  // -------------------------------------------------------------------
  exps.push(explanation('praxis-rolle-classic', 'Praxis: DHCP-Rolle unter Windows Server installieren', 'classic', [
    { type: 'list', title: 'DHCP-Server-Rolle installieren', items: [
      'Server-Manager öffnen → "Rollen und Features hinzufügen".',
      'Rolle "DHCP-Server" auswählen und die Installation abschließen.',
      'Alternativ per PowerShell: Install-WindowsFeature DHCP -IncludeManagementTools',
      'Verwaltet wird der Dienst danach über Server-Manager → Tools → DHCP.',
    ] },
  ]));

  // -------------------------------------------------------------------
  // 8. Praxis: Autorisierung
  // -------------------------------------------------------------------
  exps.push(explanation('praxis-autorisierung-classic', 'Praxis: Autorisierung in der Domäne', 'classic', [
    { type: 'text', content: 'In einer Active-Directory-Umgebung muss ein DHCP-Server zusätzlich in der Domäne autorisiert werden, bevor er Anfragen beantworten darf.' },
    { type: 'list', title: 'Warum Autorisierung?', items: [
      'Verhindert, dass versehentlich (oder böswillig) aufgesetzte, nicht autorisierte DHCP-Server im Netz Adressen verteilen ("Rogue DHCP Server").',
      'Ein nicht autorisierter Microsoft-DHCP-Server in einer Domänenumgebung startet den Dienst gar nicht erst.',
      'Die Autorisierung erfolgt in der DHCP-Konsole per Rechtsklick auf den Server → "Autorisieren", durch ein Domänen-Admin-Konto.',
    ] },
  ]));

  // -------------------------------------------------------------------
  // 9. Praxis: Scope erstellen
  // -------------------------------------------------------------------
  exps.push(explanation('praxis-scope-classic', 'Praxis: Einen Scope (Bereich) erstellen', 'classic', [
    { type: 'text', content: 'Ein Scope definiert, welche IP-Adressen ein DHCP-Server für ein bestimmtes Subnetz vergeben darf, inklusive der zugehörigen Einstellungen.' },
    { type: 'list', title: 'Scope-Assistent (DHCP-Konsole → IPv4 → Rechtsklick → "Neuer Bereich...")', items: [
      'Name und Beschreibung für den Scope vergeben.',
      'IP-Bereich festlegen: Start- und End-IP-Adresse (z. B. 192.168.10.50 bis 192.168.10.150) sowie die Subnetzmaske.',
      'Ausschlussbereich (Exclusion) festlegen: IP-Adressen innerhalb des Bereichs, die NICHT automatisch vergeben werden sollen (z. B. weil sie bereits für Server/Drucker statisch reserviert sind).',
      'Leasedauer festlegen (Standard bei Windows: 8 Tage für Kabel-Netze).',
      'Optionen konfigurieren: Standardgateway (Router-IP), bevorzugter DNS-Server, ggf. DNS-Suffix.',
      'Scope am Ende des Assistenten aktivieren.',
    ] },
  ]));

  // -------------------------------------------------------------------
  // 10. Praxis: Reservierungen
  // -------------------------------------------------------------------
  exps.push(explanation('praxis-reservierung-classic', 'Praxis: Reservierungen', 'classic', [
    { type: 'text', content: 'Eine Reservierung sorgt dafür, dass ein bestimmtes Gerät (identifiziert über seine MAC-Adresse) über DHCP immer dieselbe IP-Adresse erhält - eine Art "statische IP-Adresse über DHCP".' },
    { type: 'list', title: 'Wann sinnvoll?', items: [
      'Für Geräte, die eine feste Adresse brauchen (Drucker, interne Server, Netzwerkkameras), aber trotzdem zentral über DHCP verwaltet werden sollen.',
      'Angelegt wird eine Reservierung im Scope unter "Reservierungen" mit MAC-Adresse und gewünschter IP-Adresse.',
      'Vorteil gegenüber rein statischer Konfiguration am Gerät: Änderungen (z. B. neuer DNS-Server) werden weiterhin zentral über den Scope ausgerollt.',
    ] },
  ]));

  // -------------------------------------------------------------------
  // 11. Praxis: DHCP testen
  // -------------------------------------------------------------------
  exps.push(explanation('praxis-test-classic', 'Praxis: DHCP testen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Zweck'], rows: [
      ['ipconfig /release', 'Gibt die aktuelle, per DHCP bezogene IP-Konfiguration frei.'],
      ['ipconfig /renew', 'Fordert erneut eine IP-Konfiguration per DHCP an (löst DORA erneut aus).'],
      ['ipconfig /all', 'Zeigt die aktuelle IP-Konfiguration inkl. DHCP-Server und Leasedauer.'],
    ] },
    { type: 'text', content: 'Serverseitig lässt sich in der DHCP-Konsole unter "Adressleases" direkt einsehen, welcher Client welche Adresse mit welcher Restlaufzeit erhalten hat.' },
  ]));

  // -------------------------------------------------------------------
  // 12. Typische Fehlerbilder
  // -------------------------------------------------------------------
  exps.push(explanation('praxis-fehler-classic', 'Typische Fehlerbilder in der Praxis', 'classic', [
    { type: 'list', title: 'Woran es meistens liegt, wenn DHCP nicht funktioniert', items: [
      'Client bekommt eine 169.254.x.x-Adresse (APIPA): Es war kein DHCP-Server erreichbar - Hinweis auf fehlende DHCP-Konfiguration, nicht automatisch ein kaputter Server. Prüfe: Server erreichbar? Richtiger VLAN-/Netzpfad? Relay vorhanden? Scope/Pool verfügbar? Client korrekt konfiguriert?',
      'Adresskonflikt: Eine IP aus dem Scope ist bereits statisch vergeben und wurde nicht als Ausschlussbereich eingetragen.',
      'Scope ist "leer": Alle Adressen sind vergeben - der Bereich muss erweitert oder die Leasedauer verkürzt werden.',
      'Client bekommt falsches Gateway/DNS: Die Scope-Optionen sind falsch konfiguriert.',
      'Server in der Domäne vergibt keine Adressen: Der DHCP-Server ist nicht autorisiert.',
      'DHCP-Server in anderem Netz: Es fehlt ein Relay-Agent auf dem Gateway des Clientnetzes.',
      'Lease läuft aus: Während eines kurzen Serverausfalls bleibt der Client durch die Lease noch funktionsfähig.',
    ] },
  ]));

  // -------------------------------------------------------------------
  // 13. Windows-Shortcuts und Verwaltungswege
  // -------------------------------------------------------------------
  exps.push(explanation('shortcuts-classic', 'Wichtige Windows-Shortcuts und Verwaltungswege', 'classic', [
    { type: 'table', headers: ['Befehl/Weg', 'Öffnet'], rows: [
      ['ncpa.cpl', 'Netzwerkverbindungen (Ethernet-Eigenschaften, z. B. um auf "IP-Adresse automatisch beziehen" zu prüfen)'],
      ['sysdm.cpl', 'Systemeigenschaften (u. a. Computername/Domain)'],
      ['Server-Manager → Verwalten → Rollen und Features hinzufügen', 'Installation der DHCP-Serverrolle'],
      ['Server-Manager → Tools → DHCP', 'Öffnet die DHCP-Verwaltungskonsole'],
    ] },
  ]));

  // -------------------------------------------------------------------
  // 14. Zusammenfassung
  // -------------------------------------------------------------------
  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'DHCP vergibt IP-Adresse, Subnetzmaske, Gateway und DNS-Server automatisch statt manuell.',
      'Ablauf: Discover → Offer → Request → Acknowledge (DORA).',
      'DHCP verwendet UDP; Server-Port 67, Client-Port 68.',
      'Router leiten DHCP-Broadcasts nicht weiter - über Netzgrenzen braucht es einen Relay-Agenten.',
      'Adressen werden nur befristet vergeben (Lease) und automatisch verlängert (Renew/Rebind) oder freigegeben.',
      'Eine Reservierung bindet eine IP an eine MAC-Adresse, bleibt aber zentral verwaltet - nicht dasselbe wie eine manuelle statische IP.',
      'In einer Domäne muss der DHCP-Server erst autorisiert werden, bevor er antwortet.',
      'Ein Scope legt IP-Bereich, Ausschlussbereich, Leasedauer, Gateway und DNS-Server für ein Subnetz fest.',
      'Testen: ipconfig /release, /renew, /all auf dem Client, "Adressleases" auf dem Server.',
      'Typischer Fehler: 169.254.x.x (APIPA) bedeutet, dass keine reguläre DHCP-Konfiguration erhalten wurde.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'dhcp-dora-ordering',
      type: 'ordering',
      question: 'Bringe die vier Schritte des DORA-Prozesses in die richtige Reihenfolge.',
      items: [
        { id: 'discover', label: 'Discover (Client sucht per Broadcast einen DHCP-Server)' },
        { id: 'offer', label: 'Offer (Server bietet eine IP-Adresse an)' },
        { id: 'request', label: 'Request (Client fordert das Angebot offiziell an)' },
        { id: 'ack', label: 'Acknowledge (Server bestätigt die Zuweisung)' },
      ],
      correctOrder: ['discover', 'offer', 'request', 'ack'],
      explanation: 'DORA: Discover → Offer → Request → Acknowledge.',
    },
    {
      id: 'dhcp-extra-messages-matching',
      type: 'matching',
      question: 'Ordne jede DHCP-Nachricht ihrer Bedeutung zu.',
      pairs: [
        { left: 'NAK', leftLabel: 'NAK', right: 'Server lehnt den Request ab' },
        { left: 'Decline', leftLabel: 'Decline', right: 'Client lehnt angebotene Adresse wegen Konflikt ab' },
        { left: 'Release', leftLabel: 'Release', right: 'Client gibt die Lease vorzeitig zurück' },
        { left: 'Inform', leftLabel: 'Inform', right: 'Client hat bereits IP und fragt nur Optionen ab' },
      ],
      explanation: 'NAK = Ablehnung, Decline = Client-Ablehnung, Release = Rückgabe, Inform = Optionsabfrage.',
    },
    {
      id: 'dhcp-lease-timeline-ordering',
      type: 'ordering',
      question: 'Bringe die Lease-Phasen in die typische Reihenfolge.',
      items: [
        { id: 'start', label: 'Lease Start' },
        { id: 'renew', label: 'Renew (T1, ca. 50 %)' },
        { id: 'rebind', label: 'Rebind (T2, ca. 87,5 %)' },
        { id: 'expire', label: 'Expire (100 %)' },
      ],
      correctOrder: ['start', 'renew', 'rebind', 'expire'],
      explanation: 'Lease Start → Renew (ca. 50 %) → Rebind (ca. 87,5 %) → Expire (100 %).',
    },
    {
      id: 'dhcp-udp-ports-matching',
      type: 'matching',
      question: 'Ordne Port und Rolle im DHCPv4-Prozess zu.',
      pairs: [
        { left: 'UDP 67', leftLabel: 'UDP 67', right: 'DHCP-Server' },
        { left: 'UDP 68', leftLabel: 'UDP 68', right: 'DHCP-Client' },
      ],
      explanation: 'DHCPv4 verwendet UDP 67 auf dem Server und UDP 68 auf dem Client.',
    },
    {
      id: 'dhcp-allocation-modes-matching',
      type: 'matching',
      question: 'Ordne jedem Betriebsmodus seine Beschreibung zu.',
      pairs: [
        { left: 'statisch', leftLabel: 'Statisch / Reservierung', right: 'Feste IP für einen bestimmten Client, meist über MAC-Adresse, zentral verwaltet' },
        { left: 'automatisch', leftLabel: 'Automatisch', right: 'Einmal automatisch zugewiesen und dauerhaft gebunden' },
        { left: 'dynamisch', leftLabel: 'Dynamisch', right: 'IP aus dem Pool mit zeitlich begrenzter Lease' },
      ],
      explanation: 'Reservierung = MAC-basierte feste IP; Automatisch = dauerhaft gebunden; Dynamisch = Lease-basiert.',
    },
    {
      id: 'dhcp-scope-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte zum Einrichten eines DHCP-Scopes in die richtige Reihenfolge.',
      items: [
        { id: 'role', label: 'DHCP-Serverrolle installieren' },
        { id: 'auth', label: 'Server in der Domäne autorisieren' },
        { id: 'scope', label: 'Scope mit IP-Bereich anlegen' },
        { id: 'options', label: 'Gateway und DNS-Server als Optionen konfigurieren' },
        { id: 'activate', label: 'Scope aktivieren' },
      ],
      correctOrder: ['role', 'auth', 'scope', 'options', 'activate'],
      explanation: 'Rolle installieren, autorisieren, Scope mit Bereich anlegen, Optionen setzen, zuletzt aktivieren.',
    },
    {
      id: 'dhcp-terms-matching',
      type: 'matching',
      question: 'Ordne jedem Begriff seine Bedeutung zu.',
      pairs: [
        { left: 'Scope', leftLabel: 'Scope', right: 'Definiert den vergebbaren IP-Bereich für ein Subnetz' },
        { left: 'Ausschlussbereich', leftLabel: 'Ausschlussbereich', right: 'IPs innerhalb des Bereichs, die nicht automatisch vergeben werden' },
        { left: 'Lease', leftLabel: 'Lease', right: 'Zeitlich befristete Vergabe einer IP-Adresse' },
        { left: 'Reservierung', leftLabel: 'Reservierung', right: 'Feste IP für ein bestimmtes Gerät über dessen MAC-Adresse' },
      ],
      explanation: 'Scope = Bereich, Ausschlussbereich = ausgenommene IPs, Lease = befristete Vergabe, Reservierung = feste IP für ein bestimmtes Gerät.',
    },
    {
      id: 'dhcp-options-matching',
      type: 'matching',
      question: 'Ordne jede Scope-Option ihrem Zweck zu.',
      pairs: [
        { left: 'Gateway', leftLabel: 'Gateway', right: 'IP-Adresse des Routers, über den andere Netze erreicht werden' },
        { left: 'DNS-Server', leftLabel: 'DNS-Server', right: 'Wird für die Namensauflösung an den Client verteilt' },
        { left: 'Autorisierung', leftLabel: 'Autorisierung', right: 'Erlaubt dem Server erst, in der Domäne Adressen zu vergeben' },
      ],
      explanation: 'Gateway und DNS-Server sind typische Scope-Optionen, die Autorisierung ist Voraussetzung für den Betrieb in der Domäne.',
    },
    {
      id: 'dhcp-relay-select',
      type: 'select-best',
      question: 'Ein neues VLAN 20 mit Clients hat einen funktionierenden Gateway. Der zentrale DHCP-Server liegt im Servernetz. Clients bekommen trotzdem keine IP. Was fehlt wahrscheinlich?',
      options: ['Ein DHCP Relay Agent auf dem Gateway von VLAN 20', 'Eine neue DNS-Zone für VLAN 20', 'Eine kürzere Lease-Time', 'Ein zusätzlicher DHCP-Server im Clientnetz'],
      correct: 0,
      explanation: 'Router leiten DHCP-Broadcasts nicht in andere Netze weiter. Auf dem Gateway des Clientnetzes muss ein Relay-Agent konfiguriert sein.',
    },
    {
      id: 'dhcp-apipa-select',
      type: 'select-best',
      question: 'Ein Client zeigt in "ipconfig /all" eine IP-Adresse aus dem Bereich 169.254.x.x. Was bedeutet das am wahrscheinlichsten?',
      options: ['Der Client hat eine Reservierung erhalten', 'Es war kein DHCP-Server erreichbar (APIPA-Adresse)', 'Der Scope ist falsch konfiguriert, aber erreichbar', 'Der Client nutzt DNS statt DHCP'],
      correct: 1,
      explanation: '169.254.x.x ist eine APIPA-Adresse, die sich der Client selbst vergibt, wenn kein DHCP-Server geantwortet hat.',
    },
    {
      id: 'dhcp-renew-input',
      type: 'input',
      question: 'Welcher Befehl fordert auf einem Windows-Client eine neue IP-Konfiguration per DHCP an? (Befehl eingeben)',
      answers: ['ipconfig /renew', 'ipconfig/renew'],
      explanation: '"ipconfig /renew" löst erneut den DORA-Prozess aus und fordert eine (ggf. neue) IP-Konfiguration an.',
    },
    {
      id: 'dhcp-troubleshooting-select',
      type: 'select-best',
      question: 'Ein Client erhält eine IP per DHCP, aber das Gateway ist falsch. Welcher Bereich sollte als Erstes geprüft werden?',
      options: ['DHCP-Scope-Optionen', 'DNS-Server-Autorisierung', 'MAC-Adresse des Clients', 'Switch-Port-VLAN'],
      correct: 0,
      explanation: 'Gateway, DNS und Subnetzmaske werden typischerweise über DHCP-Scope-Optionen verteilt.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist die Hauptaufgabe von DHCP?', options: ['Namen in IP-Adressen übersetzen', 'IP-Konfigurationen automatisch an Clients vergeben', 'Daten verschlüsseln', 'Router miteinander verbinden'], correct: 1, explanation: 'DHCP vergibt automatisch IP-Adresse, Subnetzmaske, Gateway und DNS-Server.' },
    { question: 'Wofür steht das "D" in DORA?', options: ['Domain', 'Discover', 'DNS', 'Default'], correct: 1, explanation: 'Discover ist der erste Schritt: der Client sucht per Broadcast einen DHCP-Server.' },
    { question: 'Wie sucht ein Client zu Beginn einen DHCP-Server?', options: ['Per DNS-Anfrage', 'Per Broadcast ins lokale Netz', 'Per E-Mail', 'Per statischer IP'], correct: 1, explanation: 'Der Client kennt noch keinen Server und sendet daher einen Broadcast (Discover).' },
    { question: 'Welches Transportprotokoll und welche Ports nutzt DHCPv4 typischerweise?', options: ['TCP 67/68', 'UDP 67/68', 'UDP 53/53', 'TCP 80/443'], correct: 1, explanation: 'DHCPv4 verwendet UDP; der Server hört auf Port 67, der Client auf Port 68.' },
    { question: 'Was passiert, wenn die Lease einer IP-Adresse abläuft, ohne verlängert zu werden?', options: ['Die IP bleibt dem Gerät fest zugeordnet', 'Die IP fällt in den freien Adresspool zurück', 'Der Client wird vom Netz getrennt', 'Der DHCP-Server stürzt ab'], correct: 1, explanation: 'Ohne Verlängerung wird die Adresse nach Ablauf der Lease wieder frei für andere Clients.' },
    { question: 'Wann braucht man typischerweise einen DHCP Relay-Agenten?', options: ['Wenn der DHCP-Server im selben Netz wie die Clients steht', 'Wenn der DHCP-Server in einem anderen Netz/VLAN als die Clients steht', 'Wenn der Client eine statische IP verwendet', 'Wenn die Lease-Time sehr kurz ist'], correct: 1, explanation: 'Router leiten DHCP-Broadcasts nicht weiter; über Netzgrenzen hinweg braucht es einen Relay-Agenten.' },
    { question: 'Warum muss ein Microsoft-DHCP-Server in einer Active-Directory-Domäne autorisiert werden?', options: ['Damit er schneller Adressen vergibt', 'Um zu verhindern, dass nicht autorisierte ("Rogue") DHCP-Server Adressen verteilen', 'Weil sonst keine DNS-Auflösung funktioniert', 'Weil sonst keine Lease-Zeiten möglich sind'], correct: 1, explanation: 'Die Autorisierung schützt vor ungewollten oder böswilligen DHCP-Servern im Netz.' },
    { question: 'Was legt ein Scope fest?', options: ['Nur die Leasedauer', 'Den vergebbaren IP-Bereich und zugehörige Optionen für ein Subnetz', 'Nur den DNS-Server', 'Die MAC-Adressen aller Geräte'], correct: 1, explanation: 'Ein Scope definiert IP-Bereich, Ausschlussbereich, Leasedauer und Optionen wie Gateway/DNS für ein Subnetz.' },
    { question: 'Wofür wird ein Ausschlussbereich (Exclusion) innerhalb eines Scopes verwendet?', options: ['Um IPs zu markieren, die NICHT automatisch vergeben werden sollen', 'Um zusätzliche IPs für mehr Clients freizugeben', 'Um die Leasedauer zu verlängern', 'Um DNS-Server auszuschließen'], correct: 0, explanation: 'Ausschlussbereiche verhindern, dass bereits statisch vergebene Adressen (z. B. Server, Drucker) doppelt vergeben werden.' },
    { question: 'Wie erhält ein Drucker über DHCP dauerhaft dieselbe IP-Adresse?', options: ['Über eine Reservierung anhand seiner MAC-Adresse', 'Über eine besonders lange Lease', 'Über den Ausschlussbereich', 'Das ist über DHCP nicht möglich'], correct: 0, explanation: 'Eine Reservierung bindet eine feste IP-Adresse an die MAC-Adresse eines bestimmten Geräts.' },
    { question: 'Welche Windows-Rolle muss installiert werden, um einen DHCP-Server zu betreiben?', options: ['DNS-Server', 'DHCP-Server', 'Active Directory-Domänendienste', 'Datei- und Speicherdienste'], correct: 1, explanation: 'Die Rolle "DHCP-Server" stellt den Dienst und die Verwaltungskonsole bereit.' },
    { question: 'Welcher Befehl gibt auf einem Windows-Client die aktuelle IP-Konfiguration frei?', options: ['ipconfig /renew', 'ipconfig /release', 'ipconfig /flushdns', 'ipconfig /all'], correct: 1, explanation: '"ipconfig /release" gibt die aktuell bezogene DHCP-Konfiguration frei.' },
    { question: 'Ein Client zeigt eine 169.254.x.x-Adresse. Was bedeutet das?', options: ['Er hat eine Reservierung erhalten', 'Es konnte kein DHCP-Server erreicht werden (APIPA)', 'Er verwendet eine statische Konfiguration', 'Der DNS-Server ist falsch konfiguriert'], correct: 1, explanation: '169.254.x.x ist eine APIPA-Adresse, die der Client sich selbst vergibt, wenn DHCP nicht erreichbar war.' },
    { question: 'Wo im DHCP-Server lässt sich einsehen, welcher Client welche IP mit welcher Restlaufzeit hat?', options: ['Unter "Adressleases"', 'Unter "Reservierungen" ausschließlich', 'In den Netzwerkverbindungen des Servers', 'Im DNS-Manager'], correct: 0, explanation: 'Der Bereich "Adressleases" in der DHCP-Konsole zeigt aktive Zuweisungen inklusive Restlaufzeit.' },
    { question: 'Warum eignen sich kurze Leasedauern für ein Gäste-WLAN?', options: ['Weil Gäste-Geräte häufig wechseln und Adressen so schneller wieder freiwerden', 'Weil kurze Leases sicherer verschlüsselt sind', 'Weil DHCP sonst nicht funktioniert', 'Weil Gäste keine IP-Adressen benötigen'], correct: 0, explanation: 'Bei häufig wechselnden Geräten sorgen kurze Leasedauern dafür, dass ungenutzte Adressen schnell wieder verfügbar werden.' },
    { question: 'Welcher Shortcut öffnet unter Windows die Netzwerkverbindungen, um am Client "IP-Adresse automatisch beziehen" zu prüfen?', options: ['ncpa.cpl', 'sysdm.cpl', 'services.msc', 'dnsmgmt.msc'], correct: 0, explanation: '"ncpa.cpl" öffnet die Netzwerkverbindungen mit den Adapter-Eigenschaften.' },
    { question: 'Ein Client hat eine IP, aber das Gateway ist falsch. Wo liegt die Ursache typischerweise?', options: ['Falsch konfigurierte DHCP-Scope-Optionen', 'Fehlender DHCP Relay Agent', 'Falsche MAC-Adresse', 'Falscher DNS-Server'], correct: 0, explanation: 'Gateway und DNS werden als DHCP-Optionen verteilt; ein falsches Gateway deutet auf Scope-Optionen hin.' },
    { question: 'Was bedeutet DHCP-NAK?', options: ['Der Server bietet eine Adresse an', 'Der Server lehnt den Request ab', 'Der Client gibt die Lease zurück', 'Die Lease wurde verlängert'], correct: 1, explanation: 'NAK bedeutet Negative Acknowledgement - der Server lehnt den Request ab.' },
    { question: 'Was ist der Unterschied zwischen einer DHCP-Reservierung und einer manuell gesetzten statischen IP?', options: ['Keiner, beide sind identisch', 'Bei der Reservierung bleibt die Konfiguration zentral im DHCP-Server; bei einer statischen IP steht sie direkt am Gerät', 'Eine Reservierung wird nie an ein Gerät vergeben', 'Eine statische IP kann nie denselben Wert haben wie eine Reservierung'], correct: 1, explanation: 'Eine Reservierung liefert dieselbe IP, bleibt aber zentral verwaltet und nutzt z. B. zentrale DNS-Änderungen.' },
    { question: 'Bei zwei unabhängigen DHCP-Servern mit Split-Scope darf gelten:', options: ['Die Pools dürfen sich überschneiden', 'Die Pools dürfen sich nicht überschneiden', 'Nur ein Server darf den Dienst starten', 'Beide Server benötigen keine Autorisierung'], correct: 1, explanation: 'Ohne gemeinsame Lease-Koordination würden sich überschneidende Pools zu doppelten Adressvergaben führen.' },
  ];
}

export function buildDhcpLesson() {
  return {
    title: 'DHCP',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'DHCP vergibt IP-Konfigurationen (IP, Subnetzmaske, Gateway, DNS) automatisch statt manuell.',
      'Ablauf: Discover → Offer → Request → Acknowledge (DORA).',
      'DHCP verwendet UDP; Server-Port 67, Client-Port 68.',
      'Router leiten DHCP-Broadcasts nicht weiter - über Netzgrenzen braucht es einen Relay-Agenten.',
      'Adressen werden nur befristet vergeben (Lease) und automatisch verlängert (Renew/Rebind) oder wieder freigegeben.',
      'Eine Reservierung bindet eine IP an eine MAC-Adresse, bleibt aber zentral verwaltet.',
      'In einer Domäne muss der DHCP-Server erst autorisiert werden.',
      'Ein Scope legt IP-Bereich, Ausschlussbereich, Leasedauer, Gateway und DNS-Server fest.',
      'Testen: ipconfig /release, /renew, /all auf dem Client, "Adressleases" auf dem Server.',
      'Eine 169.254.x.x-Adresse (APIPA) bedeutet: keine reguläre DHCP-Konfiguration erhalten.',
    ],
  };
}
