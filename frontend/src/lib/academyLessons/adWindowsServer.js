import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Windows Server Core Verwaltung
// Thema 5: Server Core, Remoteverwaltung, Rollenverwaltung
// =============================================================================

export const AD_WINDOWS_SERVER_TOPIC_KEY = topicKey('active-directory-virtualbox', 'windows-server');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const coreVsGuiSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Server mit GUI</text>
  <text x="85" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">lokale grafische</text>
  <text x="85" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">Verwaltung möglich</text>
  <text x="85" y="98" text-anchor="middle" fill="#8b949e" font-size="9">z. B. DC01</text>
  <text x="85" y="116" text-anchor="middle" fill="#8b949e" font-size="9">Server Manager</text>

  <rect x="170" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Server Core</text>
  <text x="235" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">lokal primär</text>
  <text x="235" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">PowerShell</text>
  <text x="235" y="98" text-anchor="middle" fill="#8b949e" font-size="9">z. B. FILE01</text>
  <text x="235" y="116" text-anchor="middle" fill="#8b949e" font-size="9">Remote mit Server Manager</text>
</svg>`;

const remoteManagementSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="20" width="120" height="60" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="90" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">DC01</text>
  <text x="90" y="60" text-anchor="middle" fill="#8b949e" font-size="9">Server mit GUI</text>
  <text x="90" y="72" text-anchor="middle" fill="#8b949e" font-size="9">Server Manager</text>

  <rect x="170" y="90" width="120" height="60" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="230" y="115" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">FILE01</text>
  <text x="230" y="130" text-anchor="middle" fill="#8b949e" font-size="9">Server Core</text>
  <text x="230" y="142" text-anchor="middle" fill="#8b949e" font-size="9">wird remote verwaltet</text>

  <line x1="150" y1="50" x2="190" y2="100" stroke="#c9d1d9" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="195" y="60" text-anchor="middle" fill="#c9d1d9" font-size="10">Verwalten</text>
  <text x="195" y="74" text-anchor="middle" fill="#c9d1d9" font-size="10">≠ anmelden</text>
  <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#c9d1d9"/></marker></defs>
</svg>`;

const roleVsToolSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="50" width="120" height="70" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="80" y="75" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">FILE01</text>
  <text x="80" y="92" text-anchor="middle" fill="#c9d1d9" font-size="10">Rolle läuft</text>
  <text x="80" y="108" text-anchor="middle" fill="#8b949e" font-size="9">Dienst</text>

  <rect x="180" y="50" width="120" height="70" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="240" y="75" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">DC01</text>
  <text x="240" y="92" text-anchor="middle" fill="#c9d1d9" font-size="10">Verwaltungstool</text>
  <text x="240" y="108" text-anchor="middle" fill="#8b949e" font-size="9">Remote Admin Tools</text>

  <line x1="140" y1="85" x2="180" y2="85" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="160" y="40" text-anchor="middle" fill="#c9d1d9" font-size="10">Verwaltung</text>
  <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

function buildExplanations() {
  const exps = [];

  exps.push(explanation(
    'windows-server-einstieg-classic',
    'NEXUS-Infrastruktur: DC01 und FILE01',
    'classic',
    [
      { type: 'text', content: 'NEXUS betreibt zwei Windows Server: DC01 mit grafischer Oberfläche und FILE01 als Server Core. FILE01 soll später Infrastrukturdienste übernehmen, muss aber zuerst zentral administrierbar werden.' },
      { type: 'text', content: 'Die Herausforderung: FILE01 hat keinen klassischen Desktop, über den man bequem Rollen und Dienste konfigurieren kann. Der Administrator braucht deshalb andere Wege, um die tägliche Verwaltung zu erledigen.' },
    ]
  ));

  exps.push(explanation(
    'windows-server-core-vs-gui-classic',
    'Server Core vs. Server mit GUI',
    'classic',
    [
      { type: 'text', content: 'Ein Windows Server mit Desktop Experience bietet die gewohnte grafische Oberfläche, also auch Server Manager, MMC und Konsolen lokal auf dem Server.' },
      { type: 'text', content: 'Server Core installiert nur das Nötigste. Die lokale grafische Verwaltung fehlt weitgehend; stattdessen verwendet man PowerShell und Remote-Tools.' },
      { type: 'diagram', content: coreVsGuiSvg },
      { type: 'question', facet: 'core-vs-gui', question: 'Was ist der wesentliche Unterschied zwischen Windows Server mit GUI und Server Core?', options: ['Server Core ist langsamer.', 'Server Core hat keine vollständige lokale grafische Verwaltung.', 'Server Core kann keine Rollen installieren.'], correct: 1, explanation: 'Server Core ist ohne klassische GUI-Verwaltung ausgestattet, kann aber trotzdem Rollen und Dienste ausführen.' },
    ]
  ));

  exps.push(explanation(
    'windows-server-remote-management-classic',
    'Remoteverwaltung über Server Manager',
    'classic',
    [
      { type: 'text', content: 'Ein Server Core muss nicht direkt an seinem eigenen Desktop administriert werden. Ein anderer Windows Server mit Server Manager kann ihn fernsteuern, solange beide Server in der gleichen Domäne oder zumindest erreichbar und berechtigt sind.' },
      { type: 'diagram', content: remoteManagementSvg },
      { type: 'text', content: 'Zentrale Verwaltung bedeutet, dass der Administrator an DC01 sitzt, aber Änderungen gezielt auf FILE01 ausführt. Das spart unnötige RDP-Sitzungen auf jedem einzelnen Server.' },
      { type: 'question', facet: 'remote-management', question: 'Warum ist Remoteverwaltung mit Server Manager sinnvoll?', options: ['Sie ersetzt Domänen.', 'Sie ermöglicht zentrale Administration mehrerer Server.', 'Sie ist nur für Server mit GUI möglich.'], correct: 1, explanation: 'Der Server Manager auf einem GUI-Server kann mehrere Server inklusive Core-Server zentral verwalten.' },
    ]
  ));

  exps.push(explanation(
    'windows-server-add-server-classic',
    'Server in den Server Manager aufnehmen',
    'classic',
    [
      { type: 'text', content: 'Bevor FILE01 verwaltet werden kann, muss der Server in die Serverliste von DC01 aufgenommen werden. Dafür öffnet man im Server Manager Manage → Add Servers.' },
      { type: 'text', content: 'Der Dialog bietet Suchen über Active Directory oder DNS. Ist FILE01 Domänenmitglied, findet die AD-Suche den Server. Danach erscheint FILE01 unter All Servers.' },
      { type: 'list', title: 'Schritte', items: ['Server Manager öffnen', 'Manage → Add Servers', 'Active Directory (oder DNS) als Suchquelle', 'FILE01 suchen und auswählen', 'Server hinzufügen', 'All Servers prüfen'] },
    ]
  ));

  exps.push(explanation(
    'windows-server-target-selection-classic',
    'Zielserver richtig wählen',
    'classic',
    [
      { type: 'text', content: 'Wenn im Server Manager Rollen oder Features installiert werden, fragt der Wizard auf dem Bildschirm Select Destination Server, auf welchem Rechner die Änderung tatsächlich erfolgen soll.' },
      { type: 'text', content: 'Auch wenn man von DC01 aus startet, ist nicht automatisch DC01 der Zielserver. Jeder Wizard-Schritt mit Zielserver-Auswahl muss bewusst geprüft werden, damit die Rolle auf FILE01 landet.' },
      { type: 'list', title: 'Typische Fehlannahme', items: ['Installation startet lokal auf DC01', 'Zielserver wird automatisch richtig gewählt', 'Remote installiert immer auf dem Verwaltungsserver'] },
    ]
  ));

  exps.push(explanation(
    'windows-server-role-vs-tool-classic',
    'Rolle vs. Verwaltungstool',
    'classic',
    [
      { type: 'text', content: 'Eine Rolle installiert den eigentlichen Dienst auf dem Zielserver. Das zugehörige Verwaltungswerkzeug muss nicht automatisch auf dem gleichen Server installiert sein.' },
      { type: 'diagram', content: roleVsToolSvg },
      { type: 'text', content: 'Lässt man ein Rollenverwaltungstool auf DC01 installieren, bleibt der Dienst selbst auf FILE01. Auf DC01 steht lediglich die grafische Konsole zur Fernverwaltung bereit.' },
      { type: 'question', facet: 'role-vs-tool', question: 'Eine Rolle wurde auf FILE01 installiert. Wo muss das passende Verwaltungstool liegen, um sie grafisch fernzuverwalten?', options: ['Auf demselben Server wie die Rolle.', 'Auf dem Server, von dem aus verwaltet wird.', 'Beide Teile müssen immer zusammen installiert sein.'], correct: 1, explanation: 'Das Verwaltungstool muss auf dem Rechner installiert sein, von dem aus verwaltet wird; die Rolle läuft auf dem Zielserver.' },
    ]
  ));

  exps.push(explanation(
    'windows-server-powershell-classic',
    'PowerShell auf Server Core',
    'classic',
    [
      { type: 'text', content: 'Arbeitet man direkt auf dem Server Core, öffnet man PowerShell von der Eingabeaufforderung aus mit dem Befehl powershell.' },
      { type: 'text', content: 'Get-WindowsFeature zeigt alle verfügbaren und installierten Serverrollen und Features an. Install-WindowsFeature installiert eine Rolle am lokalen Server.' },
      { type: 'list', title: 'PowerShell-Grundbefehle', items: ['powershell – startet PowerShell aus der Eingabeaufforderung', 'Get-WindowsFeature – zeigt Rollen und Features an', 'Install-WindowsFeature <Name> – installiert ein Feature'] },
      { type: 'question', facet: 'powershell', question: 'Welcher Befehl zeigt verfügbare und installierte Serverrollen an?', options: ['Get-WindowsFeature', 'Install-WindowsFeature', 'Format-List'], correct: 0, explanation: 'Get-WindowsFeature listet Rollen und Features auf; Install-WindowsFeature installiert sie.' },
    ]
  ));

  exps.push(explanation(
    'windows-server-zusammenfassung-classic',
    'Zusammenfassung',
    'classic',
    [
      { type: 'text', content: 'Server Core hat keine vollständige lokale GUI-Verwaltung, ist aber weder einschränkend noch weniger wertvoll. Man kann ihn lokal über PowerShell oder remote über Server Manager verwalten.' },
      { type: 'text', content: 'Wichtig ist stets die Unterscheidung: der Verwaltungsserver ist der Ort, von dem aus gearbeitet wird; der Zielserver ist der Rechner, der tatsächlich geändert wird; das Verwaltungstool muss am Verwaltungsort verfügbar sein.' },
      { type: 'list', title: 'Merke', items: ['Server Core ≠ keine Verwaltung', 'Remoteverwaltung mit Server Manager', 'Immer den Zielserver prüfen', 'Rolle und Verwaltungstool können auf unterschiedlichen Servern liegen', 'PowerShell: Get-WindowsFeature / Install-WindowsFeature'] },
    ]
  ));

  return exps;
}

function buildExercises() {
  const exs = [];

  exs.push({
    id: 'ad-windows-server-add-core-guided-ui',
    type: 'guided-ui',
    title: 'FILE01 im Server Manager aufnehmen',
    question: 'Füge FILE01 dem Server Manager auf DC01 hinzu, damit du den Core-Server fernverwalten kannst.',
    explanation: 'FILE01 muss in die Serverliste von DC01 aufgenommen werden. Dafür nutzt du Manage → Add Servers und suchst FILE01 über Active Directory.',
    intro: 'NEXUS will FILE01 zentral von DC01 aus verwalten. FILE01 ist Domänenmitglied. Folge dem reduzierten Server-Manager-Ablauf.',
    steps: [
      {
        id: 'win-srv-add-step-manage',
        kind: 'navigation',
        screen: { title: 'Server Manager', subtitle: 'Übersicht auf DC01' },
        instruction: 'Wo startest du, um weitere Server in den Server Manager aufzunehmen?',
        targets: [
          { id: 'dashboard', label: 'Dashboard', description: 'Nur Zusammenfassungen' },
          { id: 'local-server', label: 'Local Server', description: 'Lokale Einstellungen' },
          { id: 'all-servers', label: 'All Servers', description: 'Liste verwalteter Server' },
          { id: 'manage', label: 'Manage', description: 'Verwaltungsmenü' },
        ],
        correctTarget: 'manage',
        feedbackWrong: 'Dashboard, Local Server und All Servers zeigen Informationen an. Um Server hinzuzufügen, brauchst du das Manage-Menü.',
        feedbackCorrect: 'Richtig: Manage öffnet die Aktionen für den Server Manager.',
      },
      {
        id: 'win-srv-add-step-add-servers',
        kind: 'navigation',
        screen: { title: 'Manage-Menü', subtitle: 'Verfügbare Aktionen' },
        instruction: 'Welche Aktion fügt einen neuen Server hinzu?',
        targets: [
          { id: 'add-roles', label: 'Add Roles and Features', description: 'Installiert Rollen' },
          { id: 'add-servers', label: 'Add Servers', description: 'Neuer Server in die Serverliste' },
          { id: 'remove-roles', label: 'Remove Roles and Features', description: 'Entfernt Rollen' },
          { id: 'properties', label: 'Server Manager Properties', description: 'Einstellungen' },
        ],
        correctTarget: 'add-servers',
        feedbackWrong: 'Add Roles and Features installiert Rollen, fügt aber keine Server in die Liste hinzu.',
        feedbackCorrect: 'Richtig: Add Servers nimmt einen neuen Server in die zentrale Verwaltung auf.',
      },
      {
        id: 'win-srv-add-step-search-ad',
        kind: 'navigation',
        screen: { title: 'Add Servers', subtitle: 'Suchquelle wählen' },
        instruction: 'FILE01 ist Domänenmitglied. Welche Suchquelle nutzt du?',
        targets: [
          { id: 'active-directory', label: 'Active Directory', description: 'Sucht nach Domänenmitgliedern' },
          { id: 'dns', label: 'DNS', description: 'Sucht über Namensauflösung' },
          { id: 'import', label: 'Import', description: 'Liste aus Datei importieren' },
          { id: 'manual', label: 'Manuell', description: 'IP oder Name eintippen' },
        ],
        correctTarget: 'active-directory',
        feedbackWrong: 'Da FILE01 bereits Domänenmitglied ist, ist Active Directory der direkteste Weg.',
        feedbackCorrect: 'Richtig: Active Directory listet Domänenmitglieder wie FILE01.',
      },
      {
        id: 'win-srv-add-step-select-file01',
        kind: 'decision',
        screen: { title: 'Suchergebnis', subtitle: 'Gefundene Server' },
        instruction: 'Welchen Server nimmst du in die Verwaltung auf?',
        targets: [
          { id: 'dc01', label: 'DC01', description: 'Bereits bekannter Verwaltungsserver' },
          { id: 'client01', label: 'CLIENT01', description: 'Windows-Client' },
          { id: 'file01', label: 'FILE01', description: 'Server Core, Ziel der Verwaltung' },
          { id: 'router01', label: 'ROUTER01', description: 'Netzwerkgerät' },
        ],
        correctTarget: 'file01',
        feedbackWrong: 'Der Auftrag bezieht sich auf FILE01, den neuen Core-Server.',
        feedbackCorrect: 'Richtig: FILE01 wird der Serverliste hinzugefügt.',
      },
      {
        id: 'win-srv-add-step-confirm',
        kind: 'decision',
        screen: { title: 'Auswahl bestätigen', subtitle: 'FILE01 hinzufügen' },
        instruction: 'Bestätige das Hinzufügen.',
        targets: [
          { id: 'ok', label: 'Hinzufügen', description: 'FILE01 in All Servers aufnehmen' },
          { id: 'cancel', label: 'Abbrechen', description: 'Vorgang beenden' },
        ],
        correctTarget: 'ok',
        feedbackWrong: 'Ohne Hinzufügen landet FILE01 nicht in der Serverliste.',
        feedbackCorrect: 'Richtig: FILE01 ist jetzt im Server Manager verfügbar.',
      },
    ],
  });

  exs.push({
    id: 'ad-windows-server-role-target-guided-ui',
    type: 'guided-ui',
    title: 'Rolle auf dem richtigen Zielserver installieren',
    question: 'Eine neue Rolle soll auf FILE01 installiert werden. Du startest den Wizard auf DC01.',
    explanation: 'Bei jeder Installation muss der Zielserver bewusst geprüft werden. Startet man von DC01, ist nicht automatisch DC01 der Zielserver.',
    intro: 'NEXUS will eine Rolle auf FILE01 installieren. Folge dem Server-Manager-Wizard und wähle FILE01 als Zielserver.',
    steps: [
      {
        id: 'win-srv-role-step-manage',
        kind: 'navigation',
        screen: { title: 'Server Manager', subtitle: 'Auf DC01' },
        instruction: 'Welche Aktion startet die Rolleninstallation?',
        targets: [
          { id: 'add-servers', label: 'Add Servers', description: 'Serverliste erweitern' },
          { id: 'add-roles', label: 'Add Roles and Features', description: 'Rollen und Features installieren' },
          { id: 'all-servers', label: 'All Servers', description: 'Serverübersicht' },
          { id: 'tools', label: 'Tools', description: 'Verwaltungsprogramme' },
        ],
        correctTarget: 'add-roles',
        feedbackWrong: 'Add Servers fügt Server hinzu, installiert aber keine Rollen.',
        feedbackCorrect: 'Richtig: Add Roles and Features startet den Installationswizard.',
      },
      {
        id: 'win-srv-role-step-installation-type',
        kind: 'navigation',
        screen: { title: 'Select installation type', subtitle: 'Wizardseite' },
        instruction: 'Welcher Installationstyp ist für einzelne Serverrollen passend?',
        targets: [
          { id: 'role-based', label: 'Role-based or feature-based installation', description: 'Eine Rolle oder ein Feature auf einem Server' },
          { id: 'scenario', label: 'Remote Desktop Services scenario-based installation', description: 'RDS-Szenario' },
        ],
        correctTarget: 'role-based',
        feedbackWrong: 'Für eine einzelne Serverrolle wird rollen-/featurebasierte Installation verwendet.',
        feedbackCorrect: 'Richtig: Damit lässt sich eine Rolle auf einem bestimmten Server installieren.',
      },
      {
        id: 'win-srv-role-step-target',
        kind: 'decision',
        screen: { title: 'Select destination server', subtitle: 'Auf welchem Server? auf DC01' },
        instruction: 'Die Liste zeigt DC01 und FILE01. Auf welchem Server soll die Rolle installiert werden?',
        targets: [
          { id: 'dc01', label: 'DC01', description: 'Verwaltungsserver, hier startet der Wizard' },
          { id: 'file01', label: 'FILE01', description: 'Core-Server, Ziel der Aufgabe' },
        ],
        correctTarget: 'file01',
        feedbackWrong: 'DC01 ist der Verwaltungsserver, aber der Auftrag verlangt die Rolle auf FILE01. Remoteverwaltung bedeutet, dass du von einem Server aus einen anderen Server konfigurierst.',
        feedbackCorrect: 'Richtig: FILE01 ist der Zielserver. Die Rolle wird dort installiert.',
      },
      {
        id: 'win-srv-role-step-server-role',
        kind: 'navigation',
        screen: { title: 'Select server roles', subtitle: 'Auf FILE01' },
        instruction: 'Wähle einen Beispiel-Serverdienst, der auf FILE01 laufen soll.',
        targets: [
          { id: 'file-services', label: 'File and Storage Services', description: 'Passend für einen Dateiserver' },
          { id: 'web-server', label: 'Web Server (IIS)', description: 'Webserver-Rolle' },
          { id: 'ad-cs', label: 'Active Directory Certificate Services', description: 'Zertifikatsdienste' },
          { id: 'print', label: 'Print and Document Services', description: 'Druckdienste' },
        ],
        correctTarget: 'file-services',
        feedbackWrong: 'FILE01 ist als Dateiserver vorgesehen; DHCP ist hier nicht gefragt.',
        feedbackCorrect: 'Richtig: File and Storage Services ist eine sinnvolle Rolle für FILE01.',
      },
    ],
  });

  exs.push({
    id: 'ad-windows-server-management-tool-guided-ui',
    type: 'guided-ui',
    title: 'Verwaltungstool auf DC01 installieren',
    question: 'Die Rolle läuft auf FILE01. Du willst sie von DC01 grafisch verwalten.',
    explanation: 'Das Rollenverwaltungstool muss auf dem Rechner installiert sein, von dem aus verwaltet wird. Hier ist das DC01.',
    intro: 'Nach der Rolleninstallation auf FILE01 fehlt dir auf DC01 die passende grafische Konsole. Installiere das passende Verwaltungstool auf DC01.',
    steps: [
      {
        id: 'win-srv-tool-step-manage',
        kind: 'navigation',
        screen: { title: 'Server Manager', subtitle: 'Auf DC01' },
        instruction: 'Welche Aktion startest du, um auf DC01 ein Verwaltungstool zu installieren?',
        targets: [
          { id: 'add-roles', label: 'Add Roles and Features', description: 'Rollen und Features auf DC01' },
          { id: 'add-servers', label: 'Add Servers', description: 'Serverliste erweitern' },
          { id: 'all-servers', label: 'All Servers', description: 'Serverübersicht' },
        ],
        correctTarget: 'add-roles',
        feedbackWrong: 'Add Servers fügt keine Tools hinzu.',
        feedbackCorrect: 'Richtig: Add Roles and Features kann Features und Verwaltungstools installieren.',
      },
      {
        id: 'win-srv-tool-step-target-dc01',
        kind: 'decision',
        screen: { title: 'Select destination server', subtitle: 'Zielserver wählen' },
        instruction: 'Das Verwaltungstool soll auf DC01 verfügbar sein. Welchen Server wählst du?',
        targets: [
          { id: 'file01', label: 'FILE01', description: 'Dort läuft die Rolle' },
          { id: 'dc01', label: 'DC01', description: 'Hier soll das Verwaltungstool verfügbar sein' },
        ],
        correctTarget: 'dc01',
        feedbackWrong: 'Das Verwaltungstool muss auf dem Verwaltungsserver liegen, also DC01. FILE01 behält die Rolle.',
        feedbackCorrect: 'Richtig: DC01 erhält das Management-Tool, FILE01 bleibt der Dienst.',
      },
      {
        id: 'win-srv-tool-step-rsat',
        kind: 'navigation',
        screen: { title: 'Select features', subtitle: 'Verwaltungstools finden' },
        instruction: 'Wo findest du grafische Verwaltungskonsolen für entfernte Serverrollen?',
        targets: [
          { id: 'rsat', label: 'Remote Server Administration Tools', description: 'Verwaltungskonsolen für entfernte Rollen' },
          { id: 'dotnet', label: '.NET Framework', description: 'Entwicklungsframework' },
          { id: 'bitlocker', label: 'BitLocker', description: 'Laufwerkverschlüsselung' },
        ],
        correctTarget: 'rsat',
        feedbackWrong: 'Remote Server Administration Tools enthalten die grafischen Verwaltungskonsolen.',
        feedbackCorrect: 'Richtig: RSAT stellt die passende grafische Konsole zur Fernverwaltung bereit.',
      },
    ],
  });

  exs.push({
    id: 'ad-windows-server-core-vs-gui-select',
    type: 'select-best',
    title: 'Core oder GUI?',
    question: 'FILE01 ist ein Server Core. Welche Aussage trifft zu?',
    options: [
      'Er kann keine Serverrollen ausführen.',
      'Er hat keine vollständige lokale GUI und wird oft über PowerShell oder Remote-Tools verwaltet.',
      'Er ist ausschließlich für Clients gedacht.',
    ],
    correct: 1,
    explanation: 'Server Core ist ein reduziertes Windows Server-Image ohne vollständige lokale GUI, aber er kann Serverrollen ausführen und wird remote oder lokal über PowerShell verwaltet.',
  });

  exs.push({
    id: 'ad-windows-server-get-vs-install-select',
    type: 'select-best',
    title: 'Get oder Install?',
    question: 'Du arbeitest lokal auf einem Server Core und willst verfügbare Rollen anzeigen. Welcher Befehl ist passend?',
    options: ['Get-WindowsFeature', 'Install-WindowsFeature', 'Get-Help'],
    correct: 0,
    explanation: 'Get-WindowsFeature zeigt Rollen und Features an; Install-WindowsFeature installiert sie.',
  });

  exs.push({
    id: 'ad-windows-server-remote-procedure-ordering',
    type: 'ordering',
    title: 'Reihenfolge der Remote-Verwaltung',
    question: 'Bringe die Schritte in die richtige Reihenfolge, um FILE01 zentral zu verwalten.',
    items: [
      { id: 'search', label: 'FILE01 über Active Directory suchen' },
      { id: 'manage', label: 'Im Server Manager Manage öffnen' },
      { id: 'add-servers', label: 'Add Servers wählen' },
      { id: 'select-file01', label: 'FILE01 auswählen und hinzufügen' },
      { id: 'all-servers', label: 'All Servers prüfen' },
    ],
    correctOrder: ['manage', 'add-servers', 'search', 'select-file01', 'all-servers'],
    explanation: 'Manage → Add Servers → Suchen → FILE01 auswählen → in All Servers prüfen.',
  });

  return exs;
}

function buildQuiz() {
  return [
    { question: 'Was ist der wesentliche Unterschied zwischen Windows Server mit GUI und Server Core?', options: ['Core hat keinen Prozessor.', 'Core hat keine vollständige lokale grafische Verwaltung.', 'Core kann nicht in eine Domäne eingebunden werden.'], correct: 1, explanation: 'Server Core bietet keine vollständige lokale GUI-Verwaltung, ist aber dennoch vollständig als Server verwendbar.' },
    { question: 'Wo startest du im Server Manager, um einen weiteren Server hinzuzufügen?', options: ['Dashboard', 'Manage → Add Servers', 'Tools', 'Local Server'], correct: 1, explanation: 'Manage → Add Servers nimmt einen weiteren Server in die zentrale Verwaltung auf.' },
    { question: 'Eine Rolle soll auf FILE01 installiert werden, du startest aber auf DC01. Was musst du beachten?', options: ['Nichts, der Wizard weiß schon Bescheid.', 'Den Zielserver im Wizard explizit auf FILE01 setzen.', 'FILE01 muss zuerst neu gestartet werden.'], correct: 1, explanation: 'Der Wizard bietet den Zielserver an; hier muss bewusst FILE01 gewählt werden.' },
    { question: 'Eine Rolle läuft auf FILE01. Wo muss das grafische Verwaltungstool installiert sein, um sie von DC01 aus zu verwalten?', options: ['Auf FILE01', 'Auf DC01', 'Auf jedem Client'], correct: 1, explanation: 'Das Verwaltungstool muss auf dem Rechner liegen, von dem aus verwaltet wird.' },
    { question: 'Welcher Befehl installiert eine Windows-Server-Rolle über PowerShell?', options: ['Get-WindowsFeature', 'Install-WindowsFeature', 'Show-WindowsFeature'], correct: 1, explanation: 'Install-WindowsFeature installiert Rollen und Features.' },
    { question: 'Warum ist Remoteverwaltung mit Server Manager praktisch?', options: ['Sie ersetzt die Domäne.', 'Sie zentralisiert die Verwaltung mehrerer Server.', 'Sie funktioniert nur mit GUI-Servern.'], correct: 1, explanation: 'Server Manager ermöglicht zentrale Administration mehrerer Server, auch Core-Server.' },
    { question: 'FILE01 ist Domänenmitglied. Welche Suchquelle im Add-Servers-Dialog ist ein sinnvoller erster Schritt?', options: ['Active Directory', 'Nur manuell', 'DNS, da AD nicht funktioniert'], correct: 0, explanation: 'Active Directory listet Domänenmitglieder wie FILE01.' },
    { question: 'Was bedeutet der Unterschied zwischen „Rolle läuft auf FILE01“ und „Verwaltungstool auf DC01“?', options: ['Nichts, beides ist dasselbe.', 'Dienst und Verwaltung können auf verschiedenen Servern liegen.', 'Das Tool muss immer auf dem gleichen Server wie die Rolle sein.'], correct: 1, explanation: 'Eine Rolle kann auf FILE01 laufen, während die grafische Verwaltungskonsole auf DC01 installiert ist.' },
  ];
}

function buildSummary() {
  return [
    'Server Core hat keine vollständige lokale GUI, ist aber keine weniger wertvolle Betriebssystem-Option.',
    'Lokale Verwaltung auf Server Core läuft primär über PowerShell.',
    'Remoteverwaltung erfolgt mit Server Manager von einem GUI-Server aus.',
    'Server müssen erst in den Server Manager aufgenommen werden, ehe sie fernverwaltet werden.',
    'Bei jeder Installationsaufgabe muss der Zielserver bewusst geprüft werden.',
    'Eine Rolle und das passende Verwaltungstool können auf unterschiedlichen Servern installiert sein.',
    'Get-WindowsFeature zeigt an, Install-WindowsFeature installiert.',
  ];
}

export function buildAdWindowsServerLesson() {
  return {
    title: 'Windows Server Core verwalten',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}
