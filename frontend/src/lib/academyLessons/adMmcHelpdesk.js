import { topicKey } from '../academyTopics.js';

export const AD_MMC_HELPDESK_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-mmc-helpdesk');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const endToEndSvg = `<svg viewBox="0 0 360 280" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">End-to-End: Berechtigung + MMC für Hilfsadmin</text>

  <rect x="20" y="40" width="90" height="28" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="65" y="58" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">S6Offz</text>

  <path d="M110 54 L125 54" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="130" y="40" width="90" height="28" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="175" y="58" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">G_S6</text>

  <path d="M220 54 L235 54" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="240" y="40" width="100" height="28" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="290" y="58" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">DL_StabPwReset</text>

  <path d="M290 68 L290 95" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="220" y="100" width="140" height="28" rx="4" fill="#0d1117" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="290" y="119" text-anchor="middle" fill="#7c3aed" font-size="9" font-weight="bold">Delegation OU Stab</text>

  <path d="M290 128 L290 150" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="100" y="155" width="200" height="28" rx="4" fill="#0d1117" stroke="#2ea043" stroke-width="1.5"/>
  <text x="200" y="174" text-anchor="middle" fill="#2ea043" font-size="9" font-weight="bold"> echte Passwortreset-Berechtigung</text>

  <path d="M200 183 L200 200" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="100" y="205" width="200" height="28" rx="4" fill="#0d1117" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="200" y="224" text-anchor="middle" fill="#58a6ff" font-size="9" font-weight="bold">MMC + Taskpad + Filter + Restricted Single</text>

  <path d="M200 233 L200 250" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="120" y="255" width="160" height="25" rx="4" fill="#0d1117" stroke="#f78166" stroke-width="1.5"/>
  <text x="200" y="272" text-anchor="middle" fill="#f78166" font-size="9" font-weight="bold">Hilfsadmin bedient .msc</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#8b949e"/>
    </marker>
  </defs>
</svg>`;

export function buildAdMmcHelpdeskLesson() {
  const title = 'MMC für Hilfsadmin';

  const explanations = [
    explanation('ad-mmc-helpdesk-why', 'Warum noch eine MMC?', 'classic', [
      { type: 'text', content: 'Thema 16 hat echte Berechtigungen delegiert. Der Hilfsadmin darf Passwörter in der OU Stab zurücksetzen. Aber eine normale ADUC-Konsole zeigt zu viel und ist für einen Hilfsadmin unnötig komplex. Eine benutzerdefinierte MMC reduziert die Bedienoberfläche auf genau die benötigte Aufgabe.' },
      { type: 'question', question: 'Warum ist nach einer erfolgreichen Delegation noch eine MMC nötig?', options: ['Um neue Rechte zu vergeben', 'Um die Bedienoberfläche auf die Aufgabe zu reduzieren', 'Um DNS-Einträge zu ändern', 'Um Gruppen anzulegen'], correct: 1, explanation: 'Delegation erteilt Rechte; die MMC reduziert die Benutzeroberfläche.' },
    ]),

    explanation('ad-mmc-helpdesk-aduc', 'ADUC Snap-In anwenden', 'classic', [
      { type: 'text', content: 'Der erste Schritt ist bekannt: In der MMC fügst du das Snap-In Active Directory-Benutzer und -Computer hinzu. Damit hast du das Werkzeug, mit dem du später die OU Stab anzeigen kannst.' },
      { type: 'question', question: 'Welches Snap-In brauchst du, um Benutzer in einer OU zu verwalten?', options: ['DNS-Manager', 'Active Directory-Benutzer und -Computer', 'Ereignisanzeige', 'Dienste'], correct: 1, explanation: 'Für AD-Benutzer und -OUs ist ADUC das richtige Snap-In.' },
    ]),

    explanation('ad-mmc-helpdesk-ou', 'OU Stab als Arbeitsbereich', 'classic', [
      { type: 'text', content: 'Nachdem das Snap-In geladen ist, navigierst du zur OU Stab. Sie ist der Arbeitsbereich, für den der Hilfsadmin zuständig ist. Auf diesem Punkt erstellst du später die Aufgabenblockansicht.' },
      { type: 'question', question: 'Auf welche OU bezieht sich die Helpdesk-MMC?', options: ['Domain Root', 'OU Stab', 'OU Verwaltung', 'Users-Container'], correct: 1, explanation: 'Der Arbeitsbereich ist die OU Stab.' },
    ]),

    explanation('ad-mmc-helpdesk-taskpad', 'Aufgabenblockansicht', 'classic', [
      { type: 'text', content: 'Eine Aufgabenblockansicht, auch Taskpad View genannt, ist eine vereinfachte Verwaltungsansicht. Sie stellt ausgewählte administrative Aktionen als Aufgaben bereit. Für den Hilfsadmin soll sie den Befehl Kennwort zurücksetzen bereitstellen. Manche Wizard-Seiten enthalten keine didaktisch wichtigen Einstellungen und können mit der Standardkonfiguration übernommen werden.' },
      { type: 'question', question: 'Was ist eine Aufgabenblockansicht?', options: ['Eine Berechtigungsgruppe', 'Eine vereinfachte Verwaltungsansicht mit Aufgaben', 'Ein Snap-In für DNS', 'Eine Art Firewall'], correct: 1, explanation: 'Taskpad zeigt ausgewählte Aktionen als Aufgaben.' },
    ]),

    explanation('ad-mmc-helpdesk-command', 'Passwort zurücksetzen als Aufgabe', 'classic', [
      { type: 'text', content: 'Nach der Erstellung der Aufgabenblockansicht fügst du eine neue Aufgabe hinzu. Als Befehlstyp wählst du Menübefehl und dann Kennwort zurücksetzen. Der Name soll klar sein, damit der Hilfsadmin sofort versteht, welche Aktion ausgeführt wird.' },
      { type: 'question', question: 'Welcher Menübefehl wird für das Helpdesk-Szenario ausgewählt?', options: ['Benutzer erstellen', 'Kennwort zurücksetzen', 'Gruppe löschen', 'Computer entfernen'], correct: 1, explanation: 'Der Befehl muss zur delegierten Aufgabe passen.' },
    ]),

    explanation('ad-mmc-helpdesk-filter', 'Ansicht filtern', 'classic', [
      { type: 'text', content: 'Eine normale ADUC-Ansicht zeigt Benutzer, Gruppen, Computer, Kontakte und mehr. Für den Helpdesk reichen Benutzer. Über Ansicht → Filteroptionen wählst du den Objekttyp Benutzer. In den Optionen entfernst du unnötige Haken. Dadurch sieht der Hilfsadmin nur, was er braucht.' },
      { type: 'question', question: 'Welcher Objekttyp soll im Helpdesk-Filter bevorzugt sichtbar sein?', options: ['Computer', 'Benutzer', 'Gruppen', 'Kontakte'], correct: 1, explanation: 'Für Passwortrücksetzungen sind Benutzer relevant.' },
    ]),

    explanation('ad-mmc-helpdesk-console', 'Konsolenmodus einschränken', 'classic', [
      { type: 'text', content: 'Nun wendest du den Konsolenmodus an: Datei → Optionen → Konsolenmodus. Du wählst Benutzermodus – beschränkter Zugriff, Einzelfenster. Damit verhinderst du, dass der Hilfsadmin neue Fenster öffnet, Snap-Ins hinzufügt oder die Konsole umbaut. Wichtig: das ist eine UI-Einschränkung, keine Berechtigungsgrenze. Echte Schutz kommt weiterhin aus der Delegation.' },
      { type: 'question', question: 'Was bewirkt der Konsolenmodus „Benutzermodus – beschränkter Zugriff, Einzelfenster“?', options: ['Er erteilt Domänenadmin-Rechte', 'Er verhindert Umbau der MMC', 'Er löscht alle Snap-Ins', 'Er ersetzt die Delegation'], correct: 1, explanation: 'Der Modus beschränkt die Benutzeroberfläche, nicht die AD-Berechtigungen.' },
    ]),

    explanation('ad-mmc-helpdesk-save', 'MMC speichern', 'classic', [
      { type: 'text', content: 'Konfigurierte Konsolen kann man speichern. Das ergibt eine .msc-Datei, zum Beispiel Stab-Hilfsadmin.msc. Die Datei enthält die gewählten Snap-Ins, die Ansicht, den Konsolenmodus und die Aufgaben.' },
      { type: 'question', question: 'Welche Dateiendung hat eine gespeicherte MMC?', options: ['.msc', '.dll', '.exe', '.txt'], correct: 0, explanation: 'Gespeicherte Konsolen erhalten die Endung .msc.' },
    ]),

    explanation('ad-mmc-helpdesk-deploy', 'MMC bereitstellen', 'classic', [
      { type: 'text', content: 'Die .msc-Datei kann dem Hilfsadmin zugänglich gemacht werden. Das Homelaufwerk ist im Szenario eine mögliche Bereitstellungsmethode. Andere Wege sind technisch ebenfalls denkbar. Wichtig: die Datei ist nur eine Oberfläche; für die tatsächliche Berechtigung sorgt die aus Thema 16 delegierte Gruppe.' },
      { type: 'question', question: 'Was wird beim Bereitstellen der MMC auf das Zielsystem gebracht?', options: ['Eine .msc-Datei', 'Neue AD-Gruppen', 'Änderungen am Gruppenmodell', 'Domänenadmin-Rechte'], correct: 0, explanation: 'Es wird nur die vorkonfigurierte Konsole verteilt.' },
    ]),

    explanation('ad-mmc-helpdesk-verify', 'Verification', 'classic', [
      { type: 'text', content: 'Am Ende testest du als Hilfsadmin: Die MMC öffnet sich, es wird nur OU Stab gezeigt, nur Benutzer sind sichtbar, die Aufgabe Kennwort zurücksetzen ist vorhanden, Snap-Ins lassen sich nicht hinzufügen und Passwörter in OU Stab können tatsächlich zurückgesetzt werden – weil Thema 16 die Delegation erledigt hat.' },
      { type: 'question', question: 'Was prüfst du bei der Verification?', options: ['Ob die MMC sichtbar und Passwortreset funktioniert', 'Ob ein neuer Domain Controller installiert ist', 'Ob neue Gruppen erstellt werden können', 'Ob DNS funktioniert'], correct: 0, explanation: 'Verification prüft sichtbare Bereiche und tatsächliche Funktion.' },
    ]),

    explanation('ad-mmc-helpdesk-end-to-end', 'Zusammenspiel', 'classic', [
      { type: 'text', content: 'Am Ende steht ein durchgängiges Modell: G_S6 organisiert die Funktion, DL_StabPwReset repräsentiert die Berechtigung, die Delegation auf OU Stab erteilt das echte Recht, die MMC bietet die Oberfläche, das Taskpad die Aktion, der Filter die reduzierte Ansicht, der Konsolenmodus den Schutz vor Umbau und die gespeicherte .msc wird bereitgestellt.' },
      { type: 'diagram', content: endToEndSvg },
      { type: 'question', question: 'Was schützt vor ungewollten Aktionen außerhalb OU Stab?', options: ['Der Filter', 'Die Delegation', 'Die .msc-Datei', 'Das Symbol'], correct: 1, explanation: 'Der echte Schutz ist die AD-Berechtigung, nicht die Oberfläche.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-mmc-helpdesk-purpose',
      type: 'select-best',
      question: 'Warum wird nach Delegation noch eine MMC für den Hilfsadmin erstellt?',
      options: ['Um neue Rechte zu vergeben', 'Um die Bedienoberfläche zu reduzieren', 'Um DNS zu verwalten', 'Um die Domäne zu sichern'],
      correct: 1,
      explanation: 'Die MMC begrenzt die Oberfläche, nicht die Berechtigungen.',
    },
    {
      id: 'ad-mmc-helpdesk-ordering',
      type: 'ordering',
      question: 'Ordne die Schritte für die Helpdesk-MMC in die richtige Reihenfolge.',
      items: ['Delegation vorhanden', 'MMC öffnen', 'ADUC Snap-In', 'OU Stab', 'Taskpad', 'Passwortreset', 'Filter', 'Restricted Single', 'Speichern', 'Bereitstellen'],
      correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      explanation: 'Zuerst Delegation, dann MMC, ADUC, OU, Taskpad, Aufgabe, Filter, Konsolenmodus, Speichern, Bereitstellen.',
    },
    {
      id: 'ad-mmc-helpdesk-matching',
      type: 'matching',
      question: 'Ordne Konzept und Bedeutung zu.',
      pairs: [
        { left: 'Delegation', right: 'echte Berechtigung' },
        { left: 'Taskpad', right: 'vereinfachte Aktion' },
        { left: 'Filter', right: 'sichtbare Objekte reduzieren' },
        { left: 'Restricted Single', right: 'Oberfläche einschränken' },
        { left: '.msc', right: 'gespeicherte Konsole' },
      ],
      explanation: 'Jede Komponente hat eine klar definierte Rolle im Helpdesk-Workflow.',
    },
    {
      id: 'ad-mmc-helpdesk-misconception',
      type: 'select-best',
      question: 'Die Aussage: „Restricted Single Window ersetzt Delegationsrechte." Ist das korrekt?',
      options: ['Ja', 'Nein'],
      correct: 1,
      explanation: 'Konsolenmodus schützt nur die UI; echte Rechte kommen aus der Delegation.',
    },
    {
      id: 'ad-mmc-helpdesk-transfer',
      type: 'select-best',
      question: 'Ein anderer Hilfsadmin soll nur Benutzer entsperren, nicht Kennwörter zurücksetzen. Welche zwei Schichten müssen anpassen?',
      options: ['Nur die MMC', 'Nur die Delegation', 'Delegation und MMC/Taskpad', 'Nur den Filter'],
      correct: 2,
      explanation: 'Echte Berechtigung und passende Oberfläche müssen zusammen passen.',
    },
    {
      id: 'ad-mmc-helpdesk-admin-challenge',
      type: 'select-best',
      question: 'Baue für den S6-Hilfsadmin eine eingeschränkte MMC. Welche Kombination ist korrekt?',
      options: ['ADUC → OU Stab → Taskpad → Passwortreset → Benutzerfilter → Restricted Single → speichern', 'DNS-Manager → Domain Root → Passwortreset → kein Filter → Autorenmodus', 'ADUC → OU Stab → Gruppenfilter → Benutzer erstellen → Autorenmodus', 'Ereignisanzeige → OU Stab → Passwortreset → Computer → Single Window'],
      correct: 0,
      explanation: 'Korrekt ist ADUC, OU Stab, Taskpad, Passwortreset, Benutzerfilter, Restricted Single und Speichern.',
    },

    {
      id: 'ad-mmc-helpdesk-taskpad-guided-ui',
      type: 'guided-ui',
      title: 'Aufgabenblockansicht erstellen',
      question: 'Erstelle eine neue Aufgabenblockansicht für die OU Stab.',
      explanation: 'MMC mit ADUC öffnen → OU Stab → Rechtsklick → Neue Aufgabenblockansicht → Standardkonfiguration → Name z.B. Stab – Passwortverwaltung.',
      intro: 'Eine Aufgabenblockansicht soll den Helpdesk-Bereich vereinfachen.',
      steps: [
        {
          id: 'ad-mmc-hd-taskpad-ou',
          kind: 'decision',
          screen: { title: 'ADUC', subtitle: 'OU wählen' },
          instruction: 'Auf welcher OU erstellst du die Aufgabenblockansicht?',
          targets: [
            { id: 'domain', label: 'Domäne', description: 'Zu großer Scope' },
            { id: 'stab', label: 'Stab', description: 'Richtige OU' },
            { id: 'users', label: 'Users-Container', description: 'Standardcontainer' },
          ],
          correctTarget: 'stab',
          feedbackWrong: 'Der Arbeitsbereich ist die OU Stab.',
          feedbackCorrect: 'Richtig: OU Stab.',
        },
        {
          id: 'ad-mmc-hd-taskpad-open',
          kind: 'navigation',
          screen: { title: 'OU Stab', subtitle: 'Kontextmenü' },
          instruction: 'Wie startest du den Taskpad-Wizard?',
          targets: [
            { id: 'properties', label: 'Eigenschaften', description: 'Einstellungen' },
            { id: 'taskpad', label: 'Neue Aufgabenblockansicht', description: 'Taskpad erstellen' },
            { id: 'delegate', label: 'Objektverwaltung zuweisen', description: 'Delegation' },
          ],
          correctTarget: 'taskpad',
          feedbackWrong: '"Neue Aufgabenblockansicht" startet den Taskpad-Wizard.',
          feedbackCorrect: 'Richtig: Neue Aufgabenblockansicht.',
        },
        {
          id: 'ad-mmc-hd-taskpad-name',
          kind: 'decision',
          screen: { title: 'Aufgabenblockname', subtitle: 'Name vergeben' },
          instruction: 'Welcher Name passt?',
          targets: [
            { id: 'all', label: 'Gesamte Domäne', description: 'Zu allgemein' },
            { id: 'stabpw', label: 'Stab – Passwortverwaltung', description: 'Passend' },
            { id: 'dns', label: 'DNS-Manager', description: 'Falsches Tool' },
          ],
          correctTarget: 'stabpw',
          feedbackWrong: 'Der Name soll den Bereich und die Aufgabe beschreiben.',
          feedbackCorrect: 'Richtig: Stab – Passwortverwaltung.',
        },
      ],
    },

    {
      id: 'ad-mmc-helpdesk-password-task-guided-ui',
      type: 'guided-ui',
      title: 'Passwortreset-Aufgabe hinzufügen',
      question: 'Füge dem Taskpad die richtige Aufgabe hinzu.',
      explanation: 'Neue Aufgabe → Menübefehl → Kennwort zurücksetzen → Name vergeben → Symbol → Zusammenfassung.',
      intro: 'Das Taskpad soll dem Hilfsadmin den Passwortreset-Befehl als Aufgabe anbieten.',
      steps: [
        {
          id: 'ad-mmc-hd-pw-new',
          kind: 'navigation',
          screen: { title: 'Taskpad', subtitle: 'Aufgabe hinzufügen' },
          instruction: 'Wie fügst du eine neue Aufgabe hinzu?',
          targets: [
            { id: 'new', label: 'Neue Aufgabe', description: 'Aufgabe erzeugen' },
            { id: 'edit', label: 'Bearbeiten', description: 'Bestehende ändern' },
            { id: 'delete', label: 'Löschen', description: 'Entfernen' },
          ],
          correctTarget: 'new',
          feedbackWrong: 'Neue Aufgabe erstellt einen Eintrag im Taskpad.',
          feedbackCorrect: 'Richtig: Neue Aufgabe.',
        },
        {
          id: 'ad-mmc-hd-pw-type',
          kind: 'decision',
          screen: { title: 'Befehlstyp', subtitle: 'Typ wählen' },
          instruction: 'Welchen Befehlstyp wählst du?',
          targets: [
            { id: 'shell', label: 'Shellbefehl', description: 'Führt Kommando aus' },
            { id: 'menu', label: 'Menübefehl', description: 'ADUC-Menübefehl' },
            { id: 'script', label: 'Skript', description: 'Eigene Automatisierung' },
          ],
          correctTarget: 'menu',
          feedbackWrong: 'Für ADUC-Standardbefehle wählst du Menübefehl.',
          feedbackCorrect: 'Richtig: Menübefehl.',
        },
        {
          id: 'ad-mmc-hd-pw-command',
          kind: 'decision',
          screen: { title: 'Menübefehl', subtitle: 'Aktion' },
          instruction: 'Welcher Menübefehl passt?',
          targets: [
            { id: 'create', label: 'Benutzer erstellen', description: 'Nicht delegiert' },
            { id: 'reset', label: 'Kennwort zurücksetzen', description: 'Richtige Aufgabe' },
            { id: 'delete', label: 'Benutzer löschen', description: 'Zu viel Recht' },
          ],
          correctTarget: 'reset',
          feedbackWrong: 'Der gewählte Befehl muss zur delegierten Aufgabe passen.',
          feedbackCorrect: 'Richtig: Kennwort zurücksetzen.',
        },
      ],
    },

    {
      id: 'ad-mmc-helpdesk-view-filter-guided-ui',
      type: 'guided-ui',
      title: 'Ansicht filtern',
      question: 'Reduziere die Ansicht auf Benutzer.',
      explanation: 'Ansicht → Filteroptionen → Objekttyp Benutzer → weitere Objektarten ausblenden.',
      intro: 'Der Hilfsadmin soll nur Benutzer sehen, die er verwalten darf.',
      steps: [
        {
          id: 'ad-mmc-hd-filter-menu',
          kind: 'navigation',
          screen: { title: 'MMC', subtitle: 'Menü' },
          instruction: 'In welchem Menü findest du die Filteroptionen?',
          targets: [
            { id: 'file', label: 'Datei', description: 'Speichern/Snap-Ins' },
            { id: 'view', label: 'Ansicht', description: 'Filter und Optionen' },
            { id: 'help', label: 'Hilfe', description: 'Dokumentation' },
          ],
          correctTarget: 'view',
          feedbackWrong: 'Ansicht enthält Filteroptionen.',
          feedbackCorrect: 'Richtig: Ansicht.',
        },
        {
          id: 'ad-mmc-hd-filter-type',
          kind: 'decision',
          screen: { title: 'Filteroptionen', subtitle: 'Objekttyp' },
          instruction: 'Welchen Objekttyp wählst du?',
          targets: [
            { id: 'computer', label: 'Computer', description: 'Nicht das Ziel' },
            { id: 'user', label: 'Benutzer', description: 'Für Passwortreset' },
            { id: 'group', label: 'Gruppen', description: 'Nicht das Ziel' },
          ],
          correctTarget: 'user',
          feedbackWrong: 'Für Passwortrücksetzungen sind Benutzer relevant.',
          feedbackCorrect: 'Richtig: Benutzer.',
        },
        {
          id: 'ad-mmc-hd-filter-options',
          kind: 'navigation',
          screen: { title: 'Ansichtsoptionen', subtitle: 'Reduktion' },
          instruction: 'Wie entfernst du unnötige Objektarten aus der Ansicht?',
          targets: [
            { id: 'check', label: 'Alle Haken entfernen außer Benutzer', description: 'Ansicht reduzieren' },
            { id: 'add', label: 'Alle Haken setzen', description: 'Zeigt mehr' },
            { id: 'default', label: 'Standard übernehmen', description: 'Keine Änderung' },
          ],
          correctTarget: 'check',
          feedbackWrong: 'Unnötige Haken entfernen reduziert die Ansicht.',
          feedbackCorrect: 'Richtig: Nur Benutzer anzeigen.',
        },
      ],
    },

    {
      id: 'ad-mmc-helpdesk-console-mode-guided-ui',
      type: 'guided-ui',
      title: 'Konsolenmodus einschränken',
      question: 'Stelle den Konsolenmodus so ein, dass der Hilfsadmin die Konsole nicht verändern kann.',
      explanation: 'Datei → Optionen → Konsolenmodus → Benutzermodus – beschränkter Zugriff, Einzelfenster.',
      intro: 'Der Hilfsadmin soll die Konsole nutzen, nicht umbauen.',
      steps: [
        {
          id: 'ad-mmc-hd-console-menu',
          kind: 'navigation',
          screen: { title: 'MMC', subtitle: 'Optionen öffnen' },
          instruction: 'Wo findest du den Konsolenmodus?',
          targets: [
            { id: 'file', label: 'Datei → Optionen', description: 'Optionen' },
            { id: 'view', label: 'Ansicht', description: 'Filter' },
            { id: 'help', label: 'Hilfe', description: 'Dokumentation' },
          ],
          correctTarget: 'file',
          feedbackWrong: 'Datei → Optionen enthält den Konsolenmodus.',
          feedbackCorrect: 'Richtig: Datei → Optionen.',
        },
        {
          id: 'ad-mmc-hd-console-mode',
          kind: 'decision',
          screen: { title: 'Konsolenmodus', subtitle: 'Modus wählen' },
          instruction: 'Welcher Modus passt?',
          targets: [
            { id: 'author', label: 'Autorenmodus', description: 'Erlaubt Änderungen' },
            { id: 'full', label: 'Benutzermodus – Vollzugriff, mehrere Fenster', description: 'Zu offen' },
            { id: 'restricted', label: 'Benutzermodus – beschränkter Zugriff, Einzelfenster', description: 'Hilfsadmin' },
          ],
          correctTarget: 'restricted',
          feedbackWrong: 'Hilfsadmin bekommt beschränkten Einzelfenstermodus.',
          feedbackCorrect: 'Richtig: Benutzermodus – beschränkter Zugriff, Einzelfenster.',
        },
        {
          id: 'ad-mmc-hd-console-save',
          kind: 'decision',
          screen: { title: 'Speicherverhalten', subtitle: 'Schutz' },
          instruction: 'Soll der Benutzer Änderungen an der Konsole speichern dürfen?',
          targets: [
            { id: 'yes', label: 'Ja', description: 'Konsole veränderbar' },
            { id: 'no', label: 'Änderungen für diese Konsole nicht speichern', description: 'Konsole geschützt' },
            { id: 'ask', label: 'Jedes Mal nachfragen', description: 'Unsicher' },
          ],
          correctTarget: 'no',
          feedbackWrong: 'Änderungen nicht speichern schützt die vorkonfigurierte Konsole.',
          feedbackCorrect: 'Richtig: Änderungen nicht speichern.',
        },
      ],
    },

    {
      id: 'ad-mmc-helpdesk-save-guided-ui',
      type: 'guided-ui',
      title: 'MMC speichern',
      question: 'Speichere die Konsole mit sinnvollem Namen.',
      explanation: 'Datei → Speichern unter → Name und Speicherort wählen → speichern.',
      intro: 'Die fertige Konsole wird als .msc-Datei gespeichert.',
      steps: [
        {
          id: 'ad-mmc-hd-save-menu',
          kind: 'navigation',
          screen: { title: 'MMC', subtitle: 'Speichern' },
          instruction: 'Wo findest du Speichern unter?',
          targets: [
            { id: 'edit', label: 'Bearbeiten', description: 'Fehler' },
            { id: 'file', label: 'Datei → Speichern unter', description: 'Richtig' },
            { id: 'view', label: 'Ansicht', description: 'Fehler' },
          ],
          correctTarget: 'file',
          feedbackWrong: 'Speichern unter liegt im Datei-Menü.',
          feedbackCorrect: 'Richtig: Datei → Speichern unter.',
        },
        {
          id: 'ad-mmc-hd-save-name',
          kind: 'decision',
          screen: { title: 'Dateiname', subtitle: 'Name wählen' },
          instruction: 'Welcher Name passt?',
          targets: [
            { id: 'admin', label: 'Domänenadmin.msc', description: 'Irrführend' },
            { id: 'stab', label: 'Stab-Hilfsadmin.msc', description: 'Passend' },
            { id: 'dns', label: 'DNS-Manager.msc', description: 'Falsches Tool' },
          ],
          correctTarget: 'stab',
          feedbackWrong: 'Der Name soll Bereich und Verwendung beschreiben.',
          feedbackCorrect: 'Richtig: Stab-Hilfsadmin.msc.',
        },
      ],
    },

    {
      id: 'ad-mmc-helpdesk-deploy-guided-ui',
      type: 'guided-ui',
      title: 'MMC bereitstellen',
      question: 'Stelle die gespeicherte MMC dem Hilfsadmin bereit.',
      explanation: 'MMC-Datei kopieren → Ziel z.B. Homelaufwerk des Hilfsadmins → als Hilfsadmin öffnen und kontrollieren.',
      intro: 'Die .msc-Datei muss dem Benutzer zugänglich gemacht werden.',
      steps: [
        {
          id: 'ad-mmc-hd-deploy-target',
          kind: 'decision',
          screen: { title: 'Bereitstellung', subtitle: 'Ziel wählen' },
          instruction: 'Wo bringst du die .msc im Szenario am besten unter?',
          targets: [
            { id: 'local', label: 'Nur auf dem Admin-Desktop lassen', description: 'Hilfsadmin kommt nicht ran' },
            { id: 'home', label: 'Homelaufwerk des Hilfsadmins', description: 'Szenario-konform' },
            { id: 'windows', label: 'Windows-Verzeichnis', description: 'Falsch' },
          ],
          correctTarget: 'home',
          feedbackWrong: 'Im Szenario bietet sich das Homelaufwerk des Hilfsadmins an.',
          feedbackCorrect: 'Richtig: Homelaufwerk des Hilfsadmins.',
        },
        {
          id: 'ad-mmc-hd-deploy-verify',
          kind: 'decision',
          screen: { title: 'Kontrolle', subtitle: 'Öffnen als Hilfsadmin' },
          instruction: 'Was prüfst du nach dem Öffnen?',
          targets: [
            { id: 'dns', label: 'DNS funktioniert', description: 'Falscher Fokus' },
            { id: 'view', label: 'OU Stab, Benutzer, Passwortreset-Aufgabe, keine Snap-In-Ergänzung', description: 'Richtig' },
            { id: 'admin', label: 'Domänenadmin-Rechte', description: 'Falsch' },
          ],
          correctTarget: 'view',
          feedbackWrong: 'Die Ansicht muss reduziert sein und die gewünschte Aufgabe bieten.',
          feedbackCorrect: 'Richtig: OU, Benutzer, Passwortreset, keine Umbau-Möglichkeit.',
        },
      ],
    },

    {
      id: 'ad-mmc-helpdesk-t1',
      type: 'select-best',
      question: 'Fehler: Hilfsadmin sieht die komplette Domäne. Was ist die Ursache?',
      options: ['Scope der MMC-/Ansicht nicht sinnvoll eingeschränkt', 'Delegation fehlt', 'Symbol falsch', 'Netzwerk kaputt'],
      correct: 0,
      explanation: 'Der Arbeitsbereich der MMC muss auf OU Stab und sinnvolle Filter reduziert werden.',
    },
    {
      id: 'ad-mmc-helpdesk-t2',
      type: 'select-best',
      question: 'Fehler: Hilfsadmin kann neue Snap-Ins hinzufügen. Was fehlt?',
      options: ['Mehr RAM', 'Autorenmodus', 'Falscher Konsolenmodus', 'Neuer DNS-Server'],
      correct: 2,
      explanation: 'Statt Autorenmodus muss der Benutzermodus mit beschränktem Zugriff gewählt werden.',
    },
    {
      id: 'ad-mmc-helpdesk-t3',
      type: 'select-best',
      question: 'Fehler: Hilfsadmin sieht nur Benutzer, aber Passwortreset funktioniert nicht. Was fehlt?',
      options: ['Ein größerer Filter', 'Delegationsrecht', 'Mehr Snap-Ins', 'Ein anderes Symbol'],
      correct: 1,
      explanation: 'Sichtbarkeit ist nicht Berechtigung. Die Delegation muss funktionieren.',
    },
    {
      id: 'ad-mmc-helpdesk-t4',
      type: 'select-best',
      question: 'Fehler: Passwortreset funktioniert, aber Taskpad zeigt falsche Aktion. Was ist die Ursache?',
      options: ['Falscher Menübefehl gewählt', 'Symbol zu klein', 'Konsolenmodus zu offen', 'Filter falsch'],
      correct: 0,
      explanation: 'Im Taskpad muss der richtige Menübefehl „Kennwort zurücksetzen" ausgewählt werden.',
    },
    {
      id: 'ad-mmc-helpdesk-t5',
      type: 'select-best',
      question: 'Fehler: MMC wurde konfiguriert, aber Hilfsadmin verändert und speichert Änderungen. Was fehlt?',
      options: ['Mehr Filter', 'Konsolenmodus / Speichereinstellungen', 'Neues Symbol', 'Mehr Aufgaben'],
      correct: 1,
      explanation: 'Benutzermodus und „Änderungen für diese Konsole nicht speichern" verhindern Umbau.',
    },
    {
      id: 'ad-mmc-helpdesk-t6',
      type: 'select-best',
      question: 'Fehler: MMC-Datei liegt nur auf dem Admin-Desktop; Hilfsadmin kommt nicht ran. Was ist zu tun?',
      options: ['Bereitstellen z.B. ins Homelaufwerk', 'Passwort ändern', 'Neue Gruppe anlegen', 'GPO installieren'],
      correct: 0,
      explanation: 'Die .msc muss für den Hilfsadmin an einem erreichbaren Ort liegen.',
    },
  ];

  const quiz = [
    { question: 'Was ist die Aufgabe der Helpdesk-MMC?', options: ['Rechte vergeben', 'Bedienoberfläche reduzieren', 'Gruppen anlegen', 'DNS verwalten'], correct: 1, explanation: 'Die MMC reduziert die Oberfläche, nicht die Berechtigungen.' },
    { question: 'Welches Snap-In wird verwendet?', options: ['DNS-Manager', 'Active Directory-Benutzer und -Computer', 'Ereignisanzeige', 'Dienste'], correct: 1, explanation: 'ADUC ist das richtige Snap-In.' },
    { question: 'Was ist eine Aufgabenblockansicht?', options: ['Eine Berechtigungsgruppe', 'Eine vereinfachte Verwaltungsansicht', 'Ein Snap-In für DNS', 'Ein Dateisystem'], correct: 1, explanation: 'Taskpad zeigt ausgewählte Aufgaben.' },
    { question: 'Welchen Menübefehl wählst du für das Taskpad?', options: ['Benutzer erstellen', 'Kennwort zurücksetzen', 'Computer entfernen', 'Gruppe umbenennen'], correct: 1, explanation: 'Der Befehl muss zur delegierten Aufgabe passen.' },
    { question: 'Was bewirkt Restricted Single Window?', options: ['Erteilt Domänenadmin-Rechte', 'Verhindert Umbau der MMC', 'Filtert Berechtigungen', 'Erstellt Gruppen'], correct: 1, explanation: 'Der Modus schützt die Oberfläche vor Umbau.' },
    { question: 'Welche Dateiendung hat die gespeicherte Konsole?', options: ['.msc', '.dll', '.exe', '.txt'], correct: 0, explanation: 'Gespeicherte Konsolen erhalten die Endung .msc.' },
    { question: 'Warum funktioniert Passwortreset in der MMC?', options: ['Wegen der .msc-Datei', 'Wegen der Delegation aus Thema 16', 'Wegen des Filters', 'Wegen des Symbols'], correct: 1, explanation: 'Die echte Berechtigung kommt aus der Delegation.' },
  ];

  const summary = [
    'Delegation allein ergibt noch keine gute Benutzeroberfläche.',
    'Eine Helpdesk-MMC reduziert den Bedienumfang.',
    'ADUC wird als Snap-In in eine neue MMC eingebunden.',
    'Der Arbeitsbereich ist die OU Stab.',
    'Aufgabenblockansicht stellt Kennwort zurücksetzen als Aufgabe bereit.',
    'Filter zeigen nur Benutzer, keine Gruppen, Computer oder Kontakte.',
    'Konsolenmodus „Benutzermodus – beschränkter Zugriff, Einzelfenster" verhindert Umbau.',
    'Änderungen an der Konsole dürfen nicht gespeichert werden.',
    'Konsole als .msc speichern und bereitstellen.',
    'Berechtigung kommt aus Delegation, Oberfläche aus MMC.',
    'Verification prüft Ansicht und tatsächliche Funktion.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
