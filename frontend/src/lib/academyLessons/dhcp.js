import { topicKey } from '../academyTopics.js';

// =============================================================================
// "DHCP" - fundamentals topic. Self-contained like the DNS lesson: covers the
// theory (why DHCP exists, the DORA process, lease concept) AND the hands-on
// Windows Server side (install the DHCP role, create a scope, exclusions,
// lease duration, gateway/DNS options, reservations, authorization, testing,
// the relevant Windows shortcuts) in one lesson.
// =============================================================================

export const DHCP_TOPIC_KEY = topicKey('fundamentals', 'dhcp');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Was ist DHCP und wozu dient es?
  // ---------------------------------------------------------------------
  exps.push(explanation('was-classic', 'Was ist DHCP?', 'classic', [
    { type: 'text', content: 'DHCP (Dynamic Host Configuration Protocol) vergibt IP-Adressen und weitere Netzwerkeinstellungen (Subnetzmaske, Standardgateway, DNS-Server) automatisch an Geräte, die einem Netzwerk beitreten - anstatt jedes Gerät manuell (statisch) konfigurieren zu müssen.' },
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

  // ---------------------------------------------------------------------
  // 2. Der DORA-Prozess
  // ---------------------------------------------------------------------
  exps.push(explanation('dora-classic', 'Der Ablauf einer IP-Zuweisung (DORA)', 'classic', [
    { type: 'text', content: 'Wenn ein Client eine IP-Adresse per DHCP anfragt, läuft im Hintergrund ein vierstufiger Ablauf ab, kurz "DORA" genannt.' },
    { type: 'list', title: 'DORA', items: [
      'Discover: Der Client sendet einen Broadcast ins Netz ("Ist hier ein DHCP-Server?").',
      'Offer: Ein DHCP-Server antwortet mit einem Angebot (eine freie IP-Adresse samt Konfiguration).',
      'Request: Der Client fordert genau dieses angebotene Angebot offiziell an.',
      'Acknowledge: Der DHCP-Server bestätigt die Zuweisung - der Client darf die IP-Adresse ab jetzt verwenden.',
    ] },
    { type: 'question', question: 'Wie sendet ein Client seine erste Anfrage, um überhaupt einen DHCP-Server zu finden?', options: ['Als gezielte Anfrage an eine bekannte IP', 'Als Broadcast ins gesamte lokale Netz', 'Per E-Mail an den Administrator', 'Über eine feste DNS-Anfrage'], correct: 1, explanation: 'Der Client kennt anfangs noch keinen DHCP-Server und sendet daher einen Broadcast ("Discover") ins lokale Netz.' },
  ]));

  // ---------------------------------------------------------------------
  // 3. Lease-Konzept
  // ---------------------------------------------------------------------
  exps.push(explanation('lease-classic', 'Das Lease-Konzept', 'classic', [
    { type: 'text', content: 'Eine per DHCP vergebene IP-Adresse wird nicht dauerhaft, sondern nur für eine begrenzte Zeit ("Lease", Miete) vergeben.' },
    { type: 'list', title: 'Wichtige Punkte zur Lease', items: [
      'Vor Ablauf der Leasedauer versucht der Client automatisch, dieselbe Adresse zu verlängern.',
      'Wird die Adresse nicht verlängert (z. B. Gerät bleibt lange offline), fällt sie nach Ablauf wieder in den freien Adresspool zurück.',
      'Kurze Leasedauern eignen sich für Netze mit vielen wechselnden Geräten (z. B. Gäste-WLAN), lange Leasedauern für stabile, selten wechselnde Umgebungen.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 4. Praxis: DHCP-Rolle installieren
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-rolle-classic', 'Praxis: DHCP-Rolle unter Windows Server installieren', 'classic', [
    { type: 'list', title: 'DHCP-Server-Rolle installieren', items: [
      'Server-Manager öffnen → "Rollen und Features hinzufügen".',
      'Rolle "DHCP-Server" auswählen und die Installation abschließen.',
      'Alternativ per PowerShell: Install-WindowsFeature DHCP -IncludeManagementTools',
      'Verwaltet wird der Dienst danach über Server-Manager → Tools → DHCP.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 5. Praxis: Autorisierung
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-autorisierung-classic', 'Praxis: Autorisierung in der Domäne', 'classic', [
    { type: 'text', content: 'In einer Active-Directory-Umgebung muss ein DHCP-Server zusätzlich in der Domäne autorisiert werden, bevor er Anfragen beantworten darf.' },
    { type: 'list', title: 'Warum Autorisierung?', items: [
      'Verhindert, dass versehentlich (oder böswillig) aufgesetzte, nicht autorisierte DHCP-Server im Netz Adressen verteilen ("Rogue DHCP Server").',
      'Ein nicht autorisierter Microsoft-DHCP-Server in einer Domänenumgebung startet den Dienst gar nicht erst.',
      'Die Autorisierung erfolgt in der DHCP-Konsole per Rechtsklick auf den Server → "Autorisieren", durch ein Domänen-Admin-Konto.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 6. Praxis: Scope erstellen
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // 7. Praxis: Reservierungen
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-reservierung-classic', 'Praxis: Reservierungen', 'classic', [
    { type: 'text', content: 'Eine Reservierung sorgt dafür, dass ein bestimmtes Gerät (identifiziert über seine MAC-Adresse) über DHCP immer dieselbe IP-Adresse erhält - eine Art "statische IP-Adresse über DHCP".' },
    { type: 'list', title: 'Wann sinnvoll?', items: [
      'Für Geräte, die eine feste Adresse brauchen (Drucker, interne Server, Netzwerkkameras), aber trotzdem zentral über DHCP verwaltet werden sollen.',
      'Angelegt wird eine Reservierung im Scope unter "Reservierungen" mit MAC-Adresse und gewünschter IP-Adresse.',
      'Vorteil gegenüber rein statischer Konfiguration am Gerät: Änderungen (z. B. neuer DNS-Server) werden weiterhin zentral über den Scope ausgerollt.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 8. Praxis: DHCP testen
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-test-classic', 'Praxis: DHCP testen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Zweck'], rows: [
      ['ipconfig /release', 'Gibt die aktuelle, per DHCP bezogene IP-Konfiguration frei.'],
      ['ipconfig /renew', 'Fordert erneut eine IP-Konfiguration per DHCP an (löst DORA erneut aus).'],
      ['ipconfig /all', 'Zeigt die aktuelle IP-Konfiguration inkl. DHCP-Server und Leasedauer.'],
    ] },
    { type: 'text', content: 'Serverseitig lässt sich in der DHCP-Konsole unter "Adressleases" direkt einsehen, welcher Client welche Adresse mit welcher Restlaufzeit erhalten hat.' },
  ]));

  // ---------------------------------------------------------------------
  // 9. Typische Fehlerbilder
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-fehler-classic', 'Typische Fehlerbilder in der Praxis', 'classic', [
    { type: 'list', title: 'Woran es meistens liegt, wenn DHCP nicht funktioniert', items: [
      'Client bekommt eine 169.254.x.x-Adresse (APIPA): Es war kein DHCP-Server erreichbar - meist Dienst gestoppt, Scope nicht aktiviert, oder Server nicht autorisiert.',
      'Adresskonflikt: Eine IP aus dem Scope ist bereits statisch vergeben und wurde nicht als Ausschlussbereich eingetragen.',
      'Scope ist "leer": Alle Adressen sind vergeben - der Bereich muss erweitert oder die Leasedauer verkürzt werden.',
      'Client bekommt falsches Gateway/DNS: Die Scope-Optionen sind falsch konfiguriert.',
      'Server in der Domäne vergibt keine Adressen: Der DHCP-Server ist nicht autorisiert.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 10. Windows-Shortcuts und Verwaltungswege
  // ---------------------------------------------------------------------
  exps.push(explanation('shortcuts-classic', 'Wichtige Windows-Shortcuts und Verwaltungswege', 'classic', [
    { type: 'table', headers: ['Befehl/Weg', 'Öffnet'], rows: [
      ['ncpa.cpl', 'Netzwerkverbindungen (Ethernet-Eigenschaften, z. B. um auf "IP-Adresse automatisch beziehen" zu prüfen)'],
      ['sysdm.cpl', 'Systemeigenschaften (u. a. Computername/Domain)'],
      ['Server-Manager → Verwalten → Rollen und Features hinzufügen', 'Installation der DHCP-Serverrolle'],
      ['Server-Manager → Tools → DHCP', 'Öffnet die DHCP-Verwaltungskonsole'],
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'DHCP vergibt IP-Adresse, Subnetzmaske, Gateway und DNS-Server automatisch statt manuell.',
      'Ablauf: Discover → Offer → Request → Acknowledge (DORA).',
      'Adressen werden nur befristet vergeben (Lease) und automatisch verlängert oder freigegeben.',
      'In einer Domäne muss der DHCP-Server erst autorisiert werden, bevor er antwortet.',
      'Ein Scope legt IP-Bereich, Ausschlussbereich, Leasedauer, Gateway und DNS-Server für ein Subnetz fest.',
      'Reservierungen geben einem Gerät über seine MAC-Adresse dauerhaft dieselbe IP, bleiben aber zentral verwaltet.',
      'Testen: ipconfig /release, /renew, /all auf dem Client, "Adressleases" auf dem Server.',
      'Typischer Fehler: APIPA-Adresse (169.254.x.x) bedeutet, dass kein DHCP-Server erreichbar war.',
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
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist die Hauptaufgabe von DHCP?', options: ['Namen in IP-Adressen übersetzen', 'IP-Konfigurationen automatisch an Clients vergeben', 'Daten verschlüsseln', 'Router miteinander verbinden'], correct: 1, explanation: 'DHCP vergibt automatisch IP-Adresse, Subnetzmaske, Gateway und DNS-Server.' },
    { question: 'Wofür steht das "D" in DORA?', options: ['Domain', 'Discover', 'DNS', 'Default'], correct: 1, explanation: 'Discover ist der erste Schritt: der Client sucht per Broadcast einen DHCP-Server.' },
    { question: 'Wie sucht ein Client zu Beginn einen DHCP-Server?', options: ['Per DNS-Anfrage', 'Per Broadcast ins lokale Netz', 'Per E-Mail', 'Per statischer IP'], correct: 1, explanation: 'Der Client kennt noch keinen Server und sendet daher einen Broadcast (Discover).' },
    { question: 'Was passiert, wenn die Lease einer IP-Adresse abläuft, ohne verlängert zu werden?', options: ['Die IP bleibt dem Gerät fest zugeordnet', 'Die IP fällt in den freien Adresspool zurück', 'Der Client wird vom Netz getrennt', 'Der DHCP-Server stürzt ab'], correct: 1, explanation: 'Ohne Verlängerung wird die Adresse nach Ablauf der Lease wieder frei für andere Clients.' },
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
      'Adressen werden nur befristet vergeben (Lease) und automatisch verlängert oder wieder freigegeben.',
      'In einer Domäne muss der DHCP-Server erst autorisiert werden.',
      'Ein Scope legt IP-Bereich, Ausschlussbereich, Leasedauer, Gateway und DNS-Server fest.',
      'Reservierungen geben einem Gerät über seine MAC-Adresse dauerhaft dieselbe IP, bleiben aber zentral verwaltet.',
      'Testen: ipconfig /release, /renew, /all auf dem Client, "Adressleases" auf dem Server.',
      'Eine 169.254.x.x-Adresse (APIPA) bedeutet: kein DHCP-Server erreichbar.',
    ],
  };
}
