import { topicKey } from '../academyTopics.js';

export const AD_MMC_BASICS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-mmc-basics');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const mmcContainerSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="280" height="140" rx="8" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="45" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Microsoft Management Console</text>
  <rect x="40" y="60" width="110" height="30" rx="4" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="95" y="80" text-anchor="middle" fill="#ffcc00" font-size="9">AD-Benutzer &amp; Computer</text>
  <rect x="170" y="60" width="110" height="30" rx="4" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="225" y="80" text-anchor="middle" fill="#ffcc00" font-size="9">DNS-Manager</text>
  <rect x="40" y="105" width="110" height="30" rx="4" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="95" y="125" text-anchor="middle" fill="#ffcc00" font-size="9">Ereignisanzeige</text>
  <rect x="170" y="105" width="110" height="30" rx="4" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="225" y="125" text-anchor="middle" fill="#ffcc00" font-size="9">Dienste</text>
</svg>`;

const modesSvg = `<svg viewBox="0 0 320 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="18" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Konsolenmodi</text>
  <rect x="20" y="35" width="280" height="25" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="30" y="52" fill="#00f0ff" font-size="10" font-weight="bold">Autorenmodus</text>
  <text x="140" y="52" fill="#c9d1d9" font-size="9">Snap-Ins hinzufügen/entfernen, Struktur anpassen</text>
  <rect x="20" y="67" width="280" height="20" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="30" y="81" fill="#8b949e" font-size="9" font-weight="bold">Benutzermodus – Vollzugriff</text>
  <text x="170" y="81" fill="#c9d1d9" font-size="9">Verwalten, ohne Struktur zu ändern</text>
  <rect x="20" y="92" width="280" height="20" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="30" y="106" fill="#8b949e" font-size="9" font-weight="bold">Benutzermodus – beschränkt</text>
  <text x="175" y="106" fill="#c9d1d9" font-size="9">Nur vorgegebener Bereich sichtbar</text>
</svg>`;

export function buildAdMmcBasicsLesson() {
  const title = 'Microsoft Management Console & Snap-Ins';

  const explanations = [
    explanation('ad-mmc-why', 'Warum braucht Windows einen Verwaltungsrahmen?', 'classic', [
      { type: 'text', content: 'In Windows gibt es Dutzende Verwaltungswerkzeuge: Benutzer, DNS, Dienste, Ereignisse, Datenträger, Firewall und mehr. Jeder Administrator müsste sich durch viele einzelne Programme klicken. Die Microsoft Management Console (MMC) packt diese Werkzeuge in einen gemeinsamen Rahmen.' },
      { type: 'question', question: 'Was ist das Hauptproblem, das die MMC lösen soll?', options: ['Zu wenige Administratoren', 'Viele separate Verwaltungswerkzeuge, die nicht zentral erreichbar sind', 'Zu viele Netzwerkprotokolle', 'Fehlende Grafikkartentreiber'], correct: 1, explanation: 'Die MMC bietet einen einheitlichen Rahmen für viele unterschiedliche Windows-Verwaltungswerkzeuge.' },
    ]),

    explanation('ad-mmc-definition', 'Was ist die MMC?', 'classic', [
      { type: 'text', content: 'Die Microsoft Management Console ist selbst kein Verwaltungsprogramm – sie ist ein Host, ein Rahmen, ein Werkzeugkoffer. Sie lädt andere Verwaltungstools, sogenannte Snap-Ins, und stellt sie in einer gemeinsamen Oberfläche dar.' },
      { type: 'text', content: 'Mentalmodell: MMC = leerer Werkzeugkoffer; Snap-In = konkretes Werkzeug, das in diesen Koffer eingelegt wird.' },
      { type: 'question', question: 'Was ist die MMC?', options: ['Ein Verwaltungsrahmen, der Snap-Ins hostet', 'Das eigentliche AD-Benutzerverwaltungstool', 'Ein Serverdienst', 'Ein Netzwerkprotokoll'], correct: 0, explanation: 'Die MMC ist der Rahmen, die eigentliche Verwaltungsfunktion kommt immer vom jeweiligen Snap-In.' },
    ]),

    explanation('ad-mmc-snapin', 'Was ist ein Snap-In?', 'classic', [
      { type: 'text', content: 'Ein Snap-In ist ein Verwaltungstool, das innerhalb der MMC ausgeführt wird. Beispiele sind Active Directory-Benutzer und -Computer, DNS-Manager, Ereignisanzeige oder Dienste. Das Snap-In liefert die eigentliche Funktionalität, die MMC nur den gemeinsamen Rahmen.' },
      { type: 'question', question: 'Welches Element führt die konkrete Verwaltungsfunktion aus?', options: ['Die MMC', 'Das Snap-In', 'Das Startmenü', 'Der Windows-Explorer'], correct: 1, explanation: 'Das Snap-In führt die eigentliche Verwaltungsfunktion aus; die MMC ist der Host.' },
    ]),

    explanation('ad-mmc-msc', 'Was bedeutet .msc?', 'classic', [
      { type: 'text', content: 'Viele Windows-Verwaltungskonsolen lassen sich über gespeicherte Dateien mit der Endung .msc aufrufen. Beispiele sind dnsmgmt.msc für den DNS-Manager oder services.msc für die Diensteverwaltung. Die Datei repräsentiert eine gespeicherte Konfiguration der MMC mit bestimmten Snap-Ins.' },
      { type: 'text', content: 'Wichtig: Nicht jedes Snap-In hat eine eigene .msc-Datei, und nicht jede .msc-Datei ist automatisch ein Snap-In. Sauber trennen: Snap-In = in MMC eingebundenes Werkzeug; .msc = gespeicherte MMC-Konsole.' },
      { type: 'question', question: 'Was ist typischerweise eine .msc-Datei?', options: ['Eine gespeicherte Microsoft Management Console-Konfiguration', 'Ein Virusscanner', 'Eine Firewall-Regel', 'Eine Netzwerkkarte'], correct: 0, explanation: 'Eine .msc-Datei enthält typischerweise eine gespeicherte MMC-Konsole mit Snap-Ins.' },
    ]),

    explanation('ad-mmc-tools', 'Typische Snap-Ins', 'classic', [
      { type: 'text', content: 'Für unterschiedliche Aufgaben benötigt man unterschiedliche Snap-Ins: AD-Benutzer verwalten → Active Directory-Benutzer und -Computer; DNS-Zonen prüfen → DNS-Manager; Dienste starten/stoppen → Dienste; Logs lesen → Ereignisanzeige; Datenträger verwalten → Datenträgerverwaltung.' },
      { type: 'diagram', content: mmcContainerSvg },
      { type: 'question', question: 'Welches Snap-In verwendest du, um DNS-Zonen zu prüfen?', options: ['Active Directory-Benutzer und -Computer', 'DNS-Manager', 'Ereignisanzeige', 'Datenträgerverwaltung'], correct: 1, explanation: 'Der DNS-Manager ist das passende Snap-In für DNS-Zonen.' },
    ]),

    explanation('ad-mmc-open', 'MMC öffnen', 'classic', [
      { type: 'text', content: 'Die MMC kann über die Windows-Suche oder die Eingabeaufforderung mit dem Befehl mmc geöffnet werden. Standardmäßig erscheint eine leere Konsole, die der Administrator mit Snap-Ins füllen kann.' },
      { type: 'question', question: 'Welcher Befehl öffnet die Microsoft Management Console?', options: ['mmc', 'cmd', 'notepad', 'explorer'], correct: 0, explanation: 'Der Befehl mmc startet die Microsoft Management Console.' },
    ]),

    explanation('ad-mmc-add', 'Snap-In hinzufügen', 'classic', [
      { type: 'text', content: 'In der MMC fügt man Snap-Ins über Datei → Snap-In hinzufügen/entfernen hinzu. Dann wählt man das gewünschte Snap-In aus, klickt auf Hinzufügen, ggf. auf einen Zielcomputer und bestätigt mit OK.' },
      { type: 'question', question: 'In welchem Menü findest du "Snap-In hinzufügen/entfernen"?', options: ['Datei', 'Bearbeiten', 'Ansicht', 'Extras'], correct: 0, explanation: 'Snap-Ins fügt man über Datei → Snap-In hinzufügen/entfernen hinzu.' },
    ]),

    explanation('ad-mmc-modes', 'Konsolenmodi', 'classic', [
      { type: 'text', content: 'Gespeicherte MMC-Konsolen können in verschiedenen Modi betrieben werden: Autorenmodus, Benutzermodus – Vollzugriff, Benutzermodus – beschränkter Zugriff mit mehreren Fenstern und Benutzermodus – beschränkter Zugriff mit Einzelfenster.' },
      { type: 'diagram', content: modesSvg },
      { type: 'question', question: 'Welcher Modus erlaubt es, Snap-Ins hinzuzufügen?', options: ['Autorenmodus', 'Benutzermodus – Vollzugriff', 'Benutzermodus – beschränkter Zugriff, mehrere Fenster', 'Benutzermodus – beschränkter Zugriff, Einzelfenster'], correct: 0, explanation: 'Im Autorenmodus lässt sich die Konsole umfassend anpassen, also auch Snap-Ins hinzufügen.' },
    ]),

    explanation('ad-mmc-limited', 'Eingeschränkte Konsole', 'classic', [
      { type: 'text', content: 'Eine eingeschränkte MMC zeigt nur einen bestimmten Bereich. Das ist sinnvoll für Hilfsadministratoren, die nur wenige Aufgaben erledigen sollen. Der Einzelfenstermodus verhindert sogar, dass Benutzer neue Fenster öffnen.' },
      { type: 'question', question: 'Wann ist der beschränkte Einzelfenstermodus sinnvoll?', options: ['Wenn ein Benutzer nur einen klar definierten Bereich sehen soll', 'Wenn die MMC schneller starten soll', 'Wenn kein Snap-In verfügbar ist', 'Wenn der Server heruntergefahren ist'], correct: 0, explanation: 'Der Einzelfenstermodus ist sinnvoll, wenn ein Hilfsadmin nur einen vorgegebenen Verwaltungsbereich sehen darf.' },
    ]),

    explanation('ad-mmc-ui-vs-permission', 'UI-Einschränkung ≠ Berechtigungen', 'classic', [
      { type: 'text', content: 'Eine eingeschränkte MMC-Oberfläche ist keine Sicherheitsgrenze. Nur weil ein Benutzer etwas in der MMC nicht sieht, heißt das nicht, dass er technisch keine Berechtigung dafür besitzt. Tatsächliche Rechte werden separat über Active Directory oder Windows-Rechte delegiert. Die MMC reduziert nur den Bedienumfang.' },
      { type: 'question', question: 'Eine eingeschränkte MMC-Oberfläche ersetzt ...?', options: ['AD-Berechtigungen', 'Netzwerkkabel', 'Die Ansicht, aber nicht die Berechtigungen', 'Windows-Updates'], correct: 2, explanation: 'Die MMC beschränkt die Oberfläche, nicht die eigentlichen Berechtigungen. Rechte müssen separat delegiert werden.' },
    ]),

    explanation('ad-mmc-preview', 'Ausblick', 'classic', [
      { type: 'text', content: 'In späteren Themen lernst du konkrete Delegation: wie du Passwortrücksetzungen, Objektverwaltung und ähnliche Aufgaben über AD-Gruppen und OUs delegierst. Dann wird auch klar, wie eine eingeschränkte Hilfsadmin-MMC mit tatsächlichen Rechten zusammenspielt.' },
      { type: 'question', question: 'Was folgt in späteren Themen?', options: ['Konkrete Delegation und Hilfsadmin-MMC', 'Grafiktreiber-Installation', 'DNS-Protokoll-Details', 'Windows-Explorer-Anpassung'], correct: 0, explanation: 'Später folgen konkrete Delegation und die passende MMC für Hilfsadmins.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-mmc-vs-snapin',
      type: 'select-best',
      question: 'Was ist die Microsoft Management Console?',
      options: ['Das eigentliche AD-Benutzerverwaltungstool', 'Ein Rahmen, der Verwaltungswerkzeuge hostet', 'Ein Berechtigungsmodell', 'Ein Serverdienst'],
      correct: 1,
      explanation: 'Die MMC ist ein Verwaltungsrahmen, kein konkretes Verwaltungstool.',
    },
    {
      id: 'ad-mmc-snapin-executes',
      type: 'select-best',
      question: 'Welches Element führt die konkrete Verwaltungsfunktion aus?',
      options: ['Die MMC', 'Das Snap-In', 'Das Startmenü', 'Die Eingabeaufforderung'],
      correct: 1,
      explanation: 'Das Snap-In liefert die eigentliche Verwaltungsfunktionalität.',
    },
    {
      id: 'ad-mmc-msc',
      type: 'select-best',
      question: 'Was bedeutet die Dateiendung .msc bei Windows-Verwaltungskonsolen?',
      options: ['Eine gespeicherte MMC-Konfiguration', 'Ein Schnellstart für den Editor', 'Eine Firewall-Regel', 'Eine Netzwerkkartenkonfiguration'],
      correct: 0,
      explanation: '.msc steht für Microsoft Management Console – typischerweise eine gespeicherte Konsole mit Snap-Ins.',
    },
    {
      id: 'ad-mmc-tool-matching',
      type: 'matching',
      question: 'Ordne die Verwaltungsaufgabe dem passenden Snap-In zu.',
      pairs: [
        { left: 'Benutzer verwalten', right: 'AD-Benutzer und -Computer' },
        { left: 'DNS-Zonen prüfen', right: 'DNS-Manager' },
        { left: 'Logs lesen', right: 'Ereignisanzeige' },
        { left: 'Dienste starten', right: 'Dienste' },
        { left: 'Datenträger verwalten', right: 'Datenträgerverwaltung' },
      ],
      explanation: 'Jede Aufgabe hat ihr passendes Snap-In innerhalb der MMC.',
    },
    {
      id: 'ad-mmc-add-snapin-ordering',
      type: 'ordering',
      question: 'Ordne die Schritte zum Hinzufügen eines Snap-Ins in die richtige Reihenfolge.',
      items: ['MMC öffnen', 'Datei', 'Snap-In hinzufügen/entfernen', 'Snap-In auswählen', 'Hinzufügen', 'OK'],
      correctOrder: [0, 1, 2, 3, 4, 5],
      explanation: 'Der typische Weg ist: MMC öffnen, Datei, Snap-In hinzufügen/entfernen, Snap-In wählen, Hinzufügen, OK.',
    },
    {
      id: 'ad-mmc-author-mode',
      type: 'select-best',
      question: 'In welchem Modus darf man Snap-Ins hinzufügen und die Konsole umfassend anpassen?',
      options: ['Autorenmodus', 'Benutzermodus – Vollzugriff', 'Benutzermodus – beschränkter Zugriff, mehrere Fenster', 'Benutzermodus – beschränkter Zugriff, Einzelfenster'],
      correct: 0,
      explanation: 'Der Autorenmodus erlaubt das Hinzufügen und Entfernen von Snap-Ins und die Strukturanpassung.',
    },
    {
      id: 'ad-mmc-restricted-single',
      type: 'select-best',
      question: 'Ein Hilfsadmin soll nur einen vorgegebenen Bereich sehen und keine neuen Fenster öffnen. Welcher Modus passt?',
      options: ['Autorenmodus', 'Benutzermodus – Vollzugriff', 'Benutzermodus – beschränkter Zugriff, mehrere Fenster', 'Benutzermodus – beschränkter Zugriff, Einzelfenster'],
      correct: 3,
      explanation: 'Der beschränkte Einzelfenstermodus zeigt nur den vorgesehenen Bereich und erlaubt keine neuen Fenster.',
    },
    {
      id: 'ad-mmc-ui-vs-permission',
      type: 'select-best',
      question: 'Die Aussage: "Eine eingeschränkte MMC-Oberfläche ersetzt AD-Berechtigungen." Ist das korrekt?',
      options: ['Ja', 'Nein', 'Nur im Autorenmodus', 'Nur auf Server Core'],
      correct: 1,
      explanation: 'Eine eingeschränkte MMC beschränkt nur die UI. Tatsächliche Rechte müssen separat delegiert werden.',
    },

    {
      id: 'ad-mmc-add-snapin-guided-ui',
      type: 'guided-ui',
      title: 'ADUC-Snap-In zur MMC hinzufügen',
      question: 'Füge das Snap-In "Active Directory-Benutzer und -Computer" zu einer neuen MMC hinzu.',
      explanation: 'MMC öffnen → Datei → Snap-In hinzufügen/entfernen → Active Directory-Benutzer und -Computer → Hinzufügen → OK.',
      intro: 'Eine leere MMC soll das AD-Benutzerverwaltungswerkzeug enthalten.',
      steps: [
        {
          id: 'ad-mmc-step-open',
          kind: 'navigation',
          screen: { title: 'Windows', subtitle: 'Konsole starten' },
          instruction: 'Wie startest du die Microsoft Management Console?',
          targets: [
            { id: 'notepad', label: 'notepad' },
            { id: 'mmc', label: 'mmc', description: 'Startet die MMC' },
            { id: 'explorer', label: 'explorer' },
          ],
          correctTarget: 'mmc',
          feedbackWrong: 'Der Befehl mmc startet die Microsoft Management Console.',
          feedbackCorrect: 'Richtig: mmc.',
        },
        {
          id: 'ad-mmc-step-menu',
          kind: 'navigation',
          screen: { title: 'MMC', subtitle: 'Menü wählen' },
          instruction: 'In welchem Menü findest du "Snap-In hinzufügen/entfernen"?',
          targets: [
            { id: 'datei', label: 'Datei', description: 'Snap-In hinzufügen/entfernen' },
            { id: 'bearbeiten', label: 'Bearbeiten' },
            { id: 'ansicht', label: 'Ansicht' },
          ],
          correctTarget: 'datei',
          feedbackWrong: 'Datei enthält den Punkt Snap-In hinzufügen/entfernen.',
          feedbackCorrect: 'Richtig: Datei.',
        },
        {
          id: 'ad-mmc-step-add',
          kind: 'navigation',
          screen: { title: 'Snap-In hinzufügen/entfernen', subtitle: 'Hinzufügen' },
          instruction: 'Wie fügst du ein neues Snap-In hinzu?',
          targets: [
            { id: 'entfernen', label: 'Entfernen' },
            { id: 'hinzufuegen', label: 'Hinzufügen', description: 'Snap-In auswählen' },
            { id: 'ok', label: 'OK' },
          ],
          correctTarget: 'hinzufuegen',
          feedbackWrong: 'Hinzufügen öffnet die Auswahl eines Snap-Ins.',
          feedbackCorrect: 'Richtig: Hinzufügen.',
        },
        {
          id: 'ad-mmc-step-snapin',
          kind: 'decision',
          screen: { title: 'Snap-In auswählen', subtitle: 'Verwaltungswerkzeug' },
          instruction: 'Welches Snap-In brauchst du, um AD-Benutzer zu verwalten?',
          targets: [
            { id: 'dns', label: 'DNS-Manager', description: 'DNS-Zonen' },
            { id: 'aduc', label: 'Active Directory-Benutzer und -Computer', description: 'AD-Benutzer und -Gruppen' },
            { id: 'events', label: 'Ereignisanzeige', description: 'Logs' },
          ],
          correctTarget: 'aduc',
          feedbackWrong: 'Active Directory-Benutzer und -Computer ist das richtige Snap-In für AD-Benutzer.',
          feedbackCorrect: 'Richtig: Active Directory-Benutzer und -Computer.',
        },
        {
          id: 'ad-mmc-step-finish',
          kind: 'navigation',
          screen: { title: 'Snap-In hinzufügen/entfernen', subtitle: 'Bestätigen' },
          instruction: 'Wie schließt du den Dialog, um das Snap-In zu übernehmen?',
          targets: [
            { id: 'abbrechen', label: 'Abbrechen' },
            { id: 'ok', label: 'OK', description: 'Bestätigen' },
            { id: 'hilfe', label: 'Hilfe' },
          ],
          correctTarget: 'ok',
          feedbackWrong: 'OK übernimmt das ausgewählte Snap-In.',
          feedbackCorrect: 'Richtig: OK.',
        },
      ],
    },

    {
      id: 'ad-mmc-tool-selection-guided-ui',
      type: 'guided-ui',
      title: 'Passendes Snap-In auswählen',
      question: 'Du möchtest DNS-Zonen verwalten. Welches Snap-In fügst du hinzu?',
      explanation: 'Für DNS verwendet man das Snap-In DNS-Manager.',
      intro: 'Wähle das passende Werkzeug für die Aufgabe.',
      steps: [
        {
          id: 'ad-mmc-tool-step',
          kind: 'decision',
          screen: { title: 'Snap-In auswählen', subtitle: 'Aufgabe: DNS verwalten' },
          instruction: 'Welches Snap-In fügst du hinzu?',
          targets: [
            { id: 'events', label: 'Ereignisanzeige', description: 'Logs prüfen' },
            { id: 'dns', label: 'DNS-Manager', description: 'DNS-Zonen verwalten' },
            { id: 'services', label: 'Dienste', description: 'Dienste starten/stoppen' },
            { id: 'compmgmt', label: 'Computerverwaltung', description: 'Systemverwaltung' },
          ],
          correctTarget: 'dns',
          feedbackWrong: 'Der DNS-Manager ist das passende Snap-In für DNS-Zonen.',
          feedbackCorrect: 'Richtig: DNS-Manager.',
        },
      ],
    },

    {
      id: 'ad-mmc-transfer',
      type: 'select-best',
      question: 'Ein Mitarbeiter soll Benutzer verwalten und Ereignisse prüfen, aber keine DNS-Verwaltung durchführen. Welche Snap-Ins nimmst du in seine MMC auf?',
      options: ['DNS-Manager und Dienste', 'Active Directory-Benutzer und -Computer sowie Ereignisanzeige', 'Datenträgerverwaltung und Geräte-Manager', 'Firewall und WSUS'],
      correct: 1,
      explanation: 'Man fügt nur die Snap-Ins hinzu, die für die tatsächlichen Aufgaben benötigt werden: AD-Benutzer und -Computer sowie Ereignisanzeige.',
    },
  ];

  const quiz = [
    { question: 'Was ist die Microsoft Management Console?', options: ['Ein Verwaltungsrahmen für Snap-Ins', 'Das eigentliche AD-Benutzerverwaltungstool', 'Ein Berechtigungsmodell', 'Ein Netzwerkdienst'], correct: 0, explanation: 'Die MMC ist der Rahmen, Snap-Ins liefern die eigentlichen Verwaltungsfunktionen.' },
    { question: 'Welches Element führt die konkrete Verwaltungsfunktion aus?', options: ['Die MMC', 'Ein Snap-In', 'Das Startmenü', 'Die PowerShell'], correct: 1, explanation: 'Ein Snap-In führt die eigentliche Verwaltungsfunktion aus.' },
    { question: 'Wofür steht die Dateiendung .msc?', options: ['Microsoft Management Console-Datei', 'Media Player', 'Mail-Datei', 'Bildschirmauflösung'], correct: 0, explanation: '.msc kennzeichnet gespeicherte MMC-Konsolen.' },
    { question: 'In welchem Menü findest du "Snap-In hinzufügen/entfernen"?', options: ['Datei', 'Bearbeiten', 'Ansicht', 'Extras'], correct: 0, explanation: 'Der Punkt liegt im Datei-Menü.' },
    { question: 'Welcher Modus erlaubt Snap-Ins hinzuzufügen?', options: ['Autorenmodus', 'Benutzermodus – Vollzugriff', 'Beschränkter Zugriff, mehrere Fenster', 'Beschränkter Zugriff, Einzelfenster'], correct: 0, explanation: 'Im Autorenmodus kann man die Konsole umfassend anpassen, also auch Snap-Ins hinzufügen.' },
    { question: 'Ist eine eingeschränkte MMC-Oberfläche eine echte Sicherheitsgrenze?', options: ['Ja, sie verhindert jede unbefugte Aktion', 'Nein, Berechtigungen müssen separat delegiert werden', 'Ja, aber nur im Einzelfenstermodus', 'Nein, sie ist ein Serverdienst'], correct: 1, explanation: 'Eine eingeschränkte MMC beschränkt nur die UI. Tatsächliche Rechte werden separat vergeben.' },
  ];

  const summary = [
    'Die MMC ist ein Verwaltungsrahmen, kein Verwaltungstool.',
    'Ein Snap-In ist ein Verwaltungswerkzeug, das innerhalb der MMC läuft.',
    '.msc ist die Endung für gespeicherte MMC-Konsolen.',
    'Typische Snap-Ins: AD-Benutzer und -Computer, DNS-Manager, Ereignisanzeige, Dienste, Datenträgerverwaltung.',
    'Snap-Ins fügt man über Datei → Snap-In hinzufügen/entfernen hinzu.',
    'Konsolenmodi: Autorenmodus, Vollzugriff, beschränkter Mehrfachfenster, beschränkter Einzelfenster.',
    'Eine eingeschränkte MMC-Oberfläche ersetzt keine AD-Berechtigungen.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
