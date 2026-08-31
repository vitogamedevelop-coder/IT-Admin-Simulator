import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Benutzer anlegen & Benutzerkonto konfigurieren
// Thema 7: active-directory-virtualbox/users
// =============================================================================

export const AD_USERS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'users');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const creationFlowSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="45" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Identität</text>
  <text x="85" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Lisa Berger</text>
  <text x="85" y="83" text-anchor="middle" fill="#c9d1d9" font-size="10">Full Name</text>

  <rect x="170" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="45" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Position</text>
  <text x="235" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Vertrieb</text>
  <text x="235" y="83" text-anchor="middle" fill="#c9d1d9" font-size="10">Anmeldename</text>
  <text x="235" y="101" text-anchor="middle" fill="#c9d1d9" font-size="10">Kennwort + Status</text>
</svg>`;

const nameVsLogonSvg = `<svg viewBox="0 0 320 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="80" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Full Name</text>
  <text x="85" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Lisa Berger</text>
  <text x="85" y="85" text-anchor="middle" fill="#8b949e" font-size="9">Anzeige / Identität</text>

  <rect x="170" y="20" width="130" height="80" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="45" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">Logon Name</text>
  <text x="235" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">lisa.berger</text>
  <text x="235" y="85" text-anchor="middle" fill="#8b949e" font-size="9">@nexus.local</text>
</svg>`;

const disabledVsDeletedSvg = `<svg viewBox="0 0 320 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="80" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="85" y="45" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">Deaktiviert</text>
  <text x="85" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Objekt bleibt</text>
  <text x="85" y="85" text-anchor="middle" fill="#c9d1d9" font-size="10">Login nicht möglich</text>

  <rect x="170" y="20" width="130" height="80" rx="6" fill="#0d1117" stroke="#ff3355" stroke-width="2"/>
  <text x="235" y="45" text-anchor="middle" fill="#ff3355" font-size="11" font-weight="bold">Gelöscht</text>
  <text x="235" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Objekt entfernt</text>
  <text x="235" y="85" text-anchor="middle" fill="#c9d1d9" font-size="10">Nicht wiederherstellbar</text>
</svg>`;

function buildExplanations() {
  return [
    explanation('adusers-einstieg', 'Lisa startet im Vertrieb', 'classic', [
      { type: 'text', content: 'Lisa Berger beginnt heute in der Abteilung Vertrieb. Für sie muss ein neues Domänenkonto angelegt werden. Die Domäne ist nexus.local, die OU Vertrieb existiert bereits.' },
      { type: 'text', content: 'Sam mahnt: „Leg Lisa nicht einfach nur an. Sorge dafür, dass das Konto an der richtigen Stelle liegt und sinnvoll konfiguriert ist.“' },
      { type: 'question', question: 'Warum ist die richtige OU bei der Benutzeranlage wichtig?', options: ['Sie ist nur für die Suche relevant.', 'Sie ist eine bewusste administrative Entscheidung und sortiert das Konto organisatorisch ein.', 'Sie legt automatisch alle Berechtigungen fest.'], correct: 1, explanation: 'Die Ziel-OU ist eine administrative Entscheidung; sie strukturiert das Konto im Verzeichnis.' },
    ]),

    explanation('adusers-wer-darf', 'Wer darf Benutzer anlegen?', 'classic', [
      { type: 'text', content: 'Nicht jeder Benutzer darf AD-Benutzer anlegen. Typischerweise haben administrative Gruppen wie Konten-Operatoren, Domänen-Admins oder Organisations-Admins entsprechende Berechtigungen. Durch Delegation können auch andere geeignete Administratoren diese Rechte erhalten.' },
      { type: 'text', content: 'Wichtig ist: die genannten Gruppen sind typische Beispiele, aber nicht der einzige mögliche Weg. Berechtigungen können delegiert werden.' },
      { type: 'question', question: 'Wer darf typischerweise Benutzerkonten in Active Directory anlegen?', options: ['Jeder normale Benutzer', 'Konten-Operatoren, Domänen-Admins, Organisations-Admins', 'Nur Computerkonten'], correct: 1, explanation: 'Typischerweise besitzen administrative Gruppen oder delegierte Administratoren das Recht, Benutzer anzulegen.' },
    ]),

    explanation('adusers-creation-flow', 'Zutaten einer Benutzeranlage', 'classic', [
      { type: 'text', content: 'Eine Benutzeranlage besteht aus mehreren bewussten Entscheidungen: Identität (Name), Position im Verzeichnis (OU), Benutzeranmeldename, Kennwort und Kontooptionen.' },
      { type: 'diagram', content: creationFlowSvg },
      { type: 'list', title: 'Komponenten', items: ['Identität: Vor-/Nachname, Anzeigename', 'Ziel-OU: administrative Position', 'Logon: eindeutiger Anmeldename in der Domäne', 'Passwort: Initialkennwort und Optionen', 'Kontostatus: aktiv, deaktiviert, Ablaufdatum'] },
      { type: 'question', question: 'Was gehört nicht automatisch zur Benutzeranlage?', options: ['Name', 'Ziel-OU', 'Zusätzliche Profileinstellungen', 'Anmeldename'], correct: 2, explanation: 'Zusätzliche Profileinstellungen gehören zu späteren Themen, nicht zum Kern der Anlage.' },
    ]),

    explanation('adusers-name-vs-logon', 'Anzeigename ≠ Anmeldename', 'classic', [
      { type: 'text', content: 'Der Anzeigename (Full Name) steht für die lesbare Bezeichnung, etwa „Lisa Berger“. Der Benutzeranmeldename ist der technische Wert, mit dem man sich anmeldet, zum Beispiel lisa.berger@nexus.local. Beides ist unterschiedlich.' },
      { type: 'diagram', content: nameVsLogonSvg },
      { type: 'question', question: 'Was ist ein Benutzeranmeldename?', options: ['Der vollständige Name der Person', 'Der technische Wert für die Anmeldung, z. B. lisa.berger@nexus.local', 'Die Beschreibung des Computers'], correct: 1, explanation: 'Der Anmeldename ist der Wert, der bei der Anmeldung verwendet wird.' },
    ]),

    explanation('adusers-eindeutigkeit', 'Eindeutigkeit des Anmeldenamens', 'classic', [
      { type: 'text', content: 'Der Anmeldename muss im relevanten Namensraum eindeutig sein. Existiert bereits ein „lisa.berger@nexus.local“, kann es kein zweites Konto mit dem gleichen Wert geben. Dann muss ein anderer Name gewählt werden.' },
      { type: 'question', question: 'Was passiert, wenn ein Anmeldename bereits existiert?', options: ['Das alte Konto wird überschrieben.', 'Es wird ein anderer Anmeldename benötigt.', 'Der Name wird automatisch ergänzt.'], correct: 1, explanation: 'Ein Anmeldename muss eindeutig sein; existiert er bereits, muss ein anderer gewählt werden.' },
    ]),

    explanation('adusers-kennwort', 'Initialkennwort und Optionen', 'classic', [
      { type: 'text', content: 'Bei der Anlage wird ein Initialkennwort vergeben. Eine typische Sicherheitsoption ist „User must change password at next logon“. Der Benutzer muss dann bei der ersten Anmeldung ein eigenes Kennwort wählen.' },
      { type: 'list', title: 'Kontooptionen', items: ['User must change password at next logon', 'User cannot change password', 'Password never expires', 'Account is disabled'] },
      { type: 'text', content: '„Password never expires“ sollte nicht für normale Benutzer pauschal empfohlen werden. Es ist eine gezielt einsetzbare Option.' },
      { type: 'question', question: 'Welche Option erzwingt eine Kennwortänderung bei der nächsten Anmeldung?', options: ['User cannot change password', 'User must change password at next logon', 'Password never expires'], correct: 1, explanation: 'Diese Option zwingt den Benutzer, beim ersten Login ein neues Kennwort zu setzen.' },
    ]),

    explanation('adusers-eigenschaften', 'Benutzerkonto-Eigenschaften', 'classic', [
      { type: 'text', content: 'Nach der Erstellung können Eigenschaften geöffnet und angepasst werden. Der Reiter „Konto“ enthält Optionen für den Anmeldename, Anmeldezeiten, erlaubte Computer, Sperrstatus, Kennworteinstellungen und Ablaufdatum.' },
      { type: 'list', title: 'Konto-Einstellungen', items: ['Anmeldezeiten – wann darf sich der Benutzer anmelden?', 'Log On To – an welchen Computern?', 'Account expires – befristete Konten', 'Account is disabled – deaktivieren'] },
      { type: 'question', question: 'In welchem Reiter werden Anmeldezeiten und erlaubte Computer eingestellt?', options: ['General', 'Address', 'Account', 'Member Of'], correct: 2, explanation: 'Anmeldezeiten, erlaubte Computer und Ablaufdatum befinden sich im Account-Reiter.' },
    ]),

    explanation('adusers-ou-vs-workstation', 'OU ≠ Arbeitsplatzbeschränkung', 'classic', [
      { type: 'text', content: 'Die OU-Zugehörigkeit ist eine strukturelle Einordnung. Ob sich ein Benutzer an bestimmten Computern anmelden darf, wird separat über die Einstellung „Log On To“ geregelt. Aus der OU ergibt sich nicht automatisch eine Workstation-Beschränkung.' },
      { type: 'question', question: 'Folgt die Workstation-Beschränkung automatisch aus der OU-Zugehörigkeit?', options: ['Ja', 'Nein', 'Nur in der Domäne'], correct: 1, explanation: 'OU-Zugehörigkeit und „Log On To“ sind separate Mechanismen.' },
    ]),

    explanation('adusers-expiry', 'Ablaufdatum und Deaktivieren', 'classic', [
      { type: 'text', content: 'Für befristete Mitarbeiter kann ein Ablaufdatum sinnvoll sein. Ein deaktiviertes Konto bleibt als Objekt erhalten, erlaubt aber keine Anmeldung mehr. Deaktivieren ist nicht dasselbe wie Löschen.' },
      { type: 'diagram', content: disabledVsDeletedSvg },
      { type: 'question', question: 'Was ist der Unterschied zwischen „disabled“ und „gelöscht“?', options: ['Keiner', 'Deaktiviert bleibt als Objekt erhalten; gelöscht entfernt es.', 'Deaktiviert löscht das Konto sofort.'], correct: 1, explanation: 'Deaktivieren sperrt die Anmeldung, das Objekt bleibt. Löschen entfernt es.' },
    ]),

    explanation('adusers-gruppen', 'Gruppenmitgliedschaften im Überblick', 'classic', [
      { type: 'text', content: 'Benutzer können Mitglied mehrerer Gruppen sein. Standardmäßig gehört ein neuer Domänenbenutzer zu Domain Users. Weitere Gruppen wie Administrationsgruppen sind bewusst zuzuweisen. Domain Admin sollte nicht als normale Benutzerrolle geamifiziert werden.' },
      { type: 'question', question: 'Welche Gruppe ist ein typischer Standard für neue Domänenbenutzer?', options: ['Domain Admins', 'Domain Users', 'Schema Admins'], correct: 1, explanation: 'Neue Domänenbenutzer gehören standardmäßig zu Domain Users.' },
    ]),

    explanation('adusers-computerkonto', 'Computerkonto', 'classic', [
      { type: 'text', content: 'Ein Computerkonto repräsentiert ein Gerät in Active Directory. Beim Domain Join entsteht es meist automatisch. Je nach Plattform, Join-Verfahren und Berechtigungen kann es auch vorab angelegt werden.' },
      { type: 'question', question: 'Was repräsentiert ein Computerkonto?', options: ['Eine Person', 'Ein Gerät/System in der Domäne', 'Eine Berechtigungsgruppe'], correct: 1, explanation: 'Ein Computerkonto repräsentiert ein Gerät in der Domäne.' },
    ]),

    explanation('adusers-powershell', 'Optional: New-ADUser', 'classic', [
      { type: 'text', content: 'PowerShell kann dieselben Aktionen wie die GUI ausführen: New-ADUser erzeugt ein Benutzerobjekt. Wichtige Parameter sind Name, SamAccountName, UserPrincipalName, Path (Ziel-OU) und Enabled. Passwörter werden nicht als Plaintext im Prompt verwendet, sondern sicher übergeben.' },
      { type: 'text', content: 'Beispiel: New-ADUser -Name "Lisa Berger" -SamAccountName "lisa.berger" -UserPrincipalName "lisa.berger@nexus.local" -Path "OU=Vertrieb,DC=nexus,DC=local" -Enabled $true' },
      { type: 'question', question: 'Welchem GUI-Schritt entspricht New-ADUser?', options: ['Benutzerkonto anlegen', 'Gruppe anlegen', 'Computer herunterfahren'], correct: 0, explanation: 'New-ADUser erzeugt ein neues Benutzerkonto, äquivalent zu ADUC → New → User.' },
    ]),
  ];
}

function buildExercises() {
  return [
    {
      id: 'ad-user-create-guided-ui',
      type: 'guided-ui',
      title: 'Lisa Berger in OU Vertrieb anlegen',
      question: 'Lege Lisa Berger als neues Benutzerkonto in der OU Vertrieb an.',
      explanation: 'Über Server Manager → Tools → Active Directory Users and Computers wird in der richtigen OU ein neuer Benutzer angelegt. Anmeldename und Kennwortoptionen sind dabei bewusst zu prüfen.',
      intro: 'Lisa Berger startet heute im Vertrieb. Folge dem reduzierten ADUC-Ablauf, um ihr Konto anzulegen.',
      steps: [
        {
          id: 'adusr-create-tools',
          kind: 'navigation',
          screen: { title: 'Server Manager', subtitle: 'Verwaltungswerkzeug öffnen' },
          instruction: 'Wo öffnest du das Werkzeug für Benutzer und OUs?',
          targets: [
            { id: 'dashboard', label: 'Dashboard', description: 'Nur Zusammenfassungen' },
            { id: 'local-server', label: 'Local Server' },
            { id: 'all-servers', label: 'All Servers' },
            { id: 'tools', label: 'Tools', description: 'Liste der Verwaltungsprogramme' },
          ],
          correctTarget: 'tools',
          feedbackWrong: 'Dashboard, Local Server und All Servers zeigen Informationen. Für Benutzerverwaltung brauchst du Tools.',
          feedbackCorrect: 'Richtig: Tools öffnet die Verwaltungskonsolen.',
        },
        {
          id: 'adusr-create-aduc',
          kind: 'navigation',
          screen: { title: 'Tools', subtitle: 'Verwaltungsprogramme' },
          instruction: 'Welches Werkzeug verwaltet Benutzer und OUs?',
          targets: [
            { id: 'dns', label: 'DNS', description: 'Namensauflösung' },
            { id: 'gpm', label: 'Group Policy Management', description: 'Gruppenrichtlinien' },
            { id: 'aduc', label: 'Active Directory Users and Computers', description: 'Benutzer und OUs verwalten' },
            { id: 'compmgmt', label: 'Computer Management', description: 'Lokale Verwaltung' },
          ],
          correctTarget: 'aduc',
          feedbackWrong: 'DNS und GPM dienen anderen Zwecken. Für Benutzer und OUs brauchst du ADUC.',
          feedbackCorrect: 'Richtig: ADUC verwaltet Benutzer, Gruppen und OUs.',
        },
        {
          id: 'adusr-create-ou',
          kind: 'decision',
          screen: { title: 'nexus.local', subtitle: 'Ziel-OU wählen' },
          instruction: 'Lisa gehört in den Vertrieb. Welche OU wählst du?',
          targets: [
            { id: 'it', label: 'IT', description: 'Falsche Abteilung' },
            { id: 'personal', label: 'Personal', description: 'Falsche Abteilung' },
            { id: 'vertrieb', label: 'Vertrieb', description: 'Richtige Abteilung' },
            { id: 'entwicklung', label: 'Entwicklung', description: 'Falsche Abteilung' },
          ],
          correctTarget: 'vertrieb',
          feedbackWrong: 'Das Konto wäre technisch gültig, aber organisatorisch falsch. Der Auftrag nennt Vertrieb.',
          feedbackCorrect: 'Richtig: Lisa gehört zur OU Vertrieb.',
        },
        {
          id: 'adusr-create-new',
          kind: 'navigation',
          screen: { title: 'OU Vertrieb', subtitle: 'Neues Objekt' },
          instruction: 'Wie startest du die Erstellung eines neuen Objekts?',
          targets: [
            { id: 'find', label: 'Find', description: 'Objekt suchen' },
            { id: 'new', label: 'New', description: 'Neues Objekt erstellen' },
            { id: 'properties', label: 'Properties', description: 'Eigenschaften anzeigen' },
            { id: 'refresh', label: 'Refresh', description: 'Ansicht aktualisieren' },
          ],
          correctTarget: 'new',
          feedbackWrong: 'Find, Properties und Refresh erstellen kein neues Objekt.',
          feedbackCorrect: 'Richtig: New öffnet den Dialog für ein neues Objekt.',
        },
        {
          id: 'adusr-create-type',
          kind: 'navigation',
          screen: { title: 'New', subtitle: 'Objekttyp wählen' },
          instruction: 'Welchen Objekttyp brauchst du für Lisa?',
          targets: [
            { id: 'computer', label: 'Computer', description: 'Gerätekonto' },
            { id: 'group', label: 'Group', description: 'Gruppe' },
            { id: 'ou', label: 'Organizational Unit', description: 'Organisationseinheit' },
            { id: 'user', label: 'User', description: 'Benutzerkonto' },
          ],
          correctTarget: 'user',
          feedbackWrong: 'Für Lisa brauchst du ein Benutzerkonto, also User.',
          feedbackCorrect: 'Richtig: Ein User-Objekt für Lisa Berger.',
        },
        {
          id: 'adusr-create-name',
          kind: 'decision',
          screen: { title: 'New Object – User', subtitle: 'Name eingeben' },
          instruction: 'Welche Eingabe ist als vollständiger Name korrekt?',
          targets: [
            { id: 'lisa-berger', label: 'Lisa Berger', description: 'Vollständiger Anzeigename' },
            { id: 'lisa-berger-logon', label: 'lisa.berger', description: 'Benutzeranmeldename' },
            { id: 'vertrieb-lisa', label: 'Vertrieb/Lisa', description: 'Pfad, kein Name' },
            { id: 'p-berge', label: 'P@ssw0rd Berger', description: 'Kein sinnvoller Name' },
          ],
          correctTarget: 'lisa-berger',
          feedbackWrong: 'Der vollständige Name ist „Lisa Berger“. Logon und Pfad gehören in andere Felder.',
          feedbackCorrect: 'Richtig: „Lisa Berger“ ist der vollständige Name.',
        },
        {
          id: 'adusr-create-logon',
          kind: 'decision',
          screen: { title: 'New Object – User', subtitle: 'Anmeldename wählen' },
          instruction: 'Welcher Anmeldename ist passend und eindeutig?',
          targets: [
            { id: 'lisa-berger', label: 'lisa.berger', description: 'Eindeutiger Anmeldename' },
            { id: 'lisa', label: 'lisa', description: 'Zu kurz / möglicherweise bereits vergeben' },
            { id: 'admin', label: 'admin', description: 'Kritisch / wahrscheinlich vergeben' },
            { id: 'lisa-berger-logon', label: 'Lisa Berger', description: 'Das ist der Anzeigename, nicht der Logon' },
          ],
          correctTarget: 'lisa-berger',
          feedbackWrong: 'Der Anmeldename sollte eindeutig sein. Der Anzeigename oder reservierte Namen sind nicht geeignet.',
          feedbackCorrect: 'Richtig: lisa.berger ist ein passender, eindeutiger Logon-Name.',
        },
        {
          id: 'adusr-create-password',
          kind: 'decision',
          screen: { title: 'Password Options', subtitle: 'Kontooptionen' },
          instruction: 'Lisa bekommt ein Initialpasswort und soll es bei der ersten Anmeldung ändern. Zusätzlich soll das Konto aktiv sein.',
          targets: [
            { id: 'change-enabled', label: 'User must change password at next logon + Account is disabled = false', description: 'Richtig' },
            { id: 'no-change', label: 'User cannot change password', description: 'Verhindert die Änderung' },
            { id: 'disabled', label: 'Account is disabled', description: 'Konto wäre gesperrt' },
            { id: 'never', label: 'Password never expires', description: 'Nicht gefragt' },
          ],
          correctTarget: 'change-enabled',
          feedbackWrong: 'Lisa soll ihr Passwort beim ersten Login ändern und das Konto muss aktiv sein.',
          feedbackCorrect: 'Richtig: Passwort muss geändert werden; Konto ist aktiv.',
        },
      ],
    },

    {
      id: 'ad-user-account-properties-guided-ui',
      type: 'guided-ui',
      title: 'Kontoeigenschaften für Lisa konfigurieren',
      question: 'Lisa darf sich nur zu bestimmten Zeiten und nur an zugelassenen Arbeitsplatz-PCs anmelden.',
      explanation: 'Im Reiter Account können Anmeldezeiten, erlaubte Computer, Ablaufdatum und Status konfiguriert werden.',
      intro: 'NEXUS will Lisas Konto einschränken. Öffne ihre Eigenschaften und konfiguriere die Kontoeinstellungen.',
      steps: [
        {
          id: 'adusr-prop-open',
          kind: 'navigation',
          screen: { title: 'OU Vertrieb', subtitle: 'Lisa Berger' },
          instruction: 'Wie öffnest du die Eigenschaften des Benutzers?',
          targets: [
            { id: 'delete', label: 'Delete', description: 'Entfernt das Konto' },
            { id: 'move', label: 'Move', description: 'Verschiebt das Konto' },
            { id: 'properties', label: 'Properties', description: 'Eigenschaften öffnen' },
            { id: 'refresh', label: 'Refresh', description: 'Ansicht aktualisieren' },
          ],
          correctTarget: 'properties',
          feedbackWrong: 'Delete und Move ändern Position/Existenz. Für Einstellungen brauchst du Properties.',
          feedbackCorrect: 'Richtig: Properties öffnet die Kontoeinstellungen.',
        },
        {
          id: 'adusr-prop-account-tab',
          kind: 'navigation',
          screen: { title: 'Eigenschaften', subtitle: 'Reiter wählen' },
          instruction: 'In welchem Reiter findest du Anmeldezeiten, erlaubte Computer und Ablaufdatum?',
          targets: [
            { id: 'general', label: 'General' },
            { id: 'address', label: 'Address' },
            { id: 'account', label: 'Account', description: 'Anmeldename, Zeiten, Computer, Ablauf, Status' },
            { id: 'member-of', label: 'Member Of', description: 'Gruppenmitgliedschaften' },
          ],
          correctTarget: 'account',
          feedbackWrong: 'Anmeldezeiten, Computerbeschränkungen und Ablaufdatum liegen im Account-Reiter.',
          feedbackCorrect: 'Richtig: Der Account-Reiter enthält Anmeldeeinschränkungen.',
        },
        {
          id: 'adusr-prop-logon-hours',
          kind: 'decision',
          screen: { title: 'Account', subtitle: 'Logon Hours' },
          instruction: 'Lisa darf sich werktags zwischen 07:00 und 18:00 Uhr anmelden.',
          targets: [
            { id: 'always', label: 'Immer erlaubt', description: 'Keine Einschränkung' },
            { id: 'work-hours', label: 'Werktags 07:00–18:00', description: 'Passend' },
            { id: 'nights', label: 'Nur 22:00–06:00', description: 'Falsch' },
            { id: 'weekend', label: 'Nur Wochenende', description: 'Falsch' },
          ],
          correctTarget: 'work-hours',
          feedbackWrong: 'Der Auftrag verlangt werktags zwischen 07:00 und 18:00 Uhr.',
          feedbackCorrect: 'Richtig: Die Anmeldezeiten passen zum Arbeitsvertrag.',
        },
        {
          id: 'adusr-prop-workstation',
          kind: 'decision',
          screen: { title: 'Account', subtitle: 'Log On To' },
          instruction: 'An welchen Computern darf Lisa sich anmelden?',
          targets: [
            { id: 'all', label: 'All computers', description: 'Keine Beschränkung' },
            { id: 'sales', label: 'SALES-PC01; SALES-PC02', description: 'Passend' },
            { id: 'it', label: 'IT-PC01; IT-PC02', description: 'Falscher Bereich' },
            { id: 'ou', label: 'Allen PCs in der OU Vertrieb', description: 'SO funktioniert das nicht' },
          ],
          correctTarget: 'sales',
          feedbackWrong: 'Die OU-Zugehörigkeit bestimmt nicht automatisch die erlaubten Computer. Der Auftrag nennt SALES-PC01 und SALES-PC02.',
          feedbackCorrect: 'Richtig: Lisa darf sich nur an den genannten Arbeitsplatz-PCs anmelden.',
        },
        {
          id: 'adusr-prop-expiry',
          kind: 'decision',
          screen: { title: 'Account', subtitle: 'Ablaufdatum' },
          instruction: 'Lisa ist befristet. Wie setzt du das Ablaufdatum?',
          targets: [
            { id: 'never', label: 'Never', description: 'Unbefristet' },
            { id: 'date', label: 'End of contract date', description: 'Passend' },
            { id: 'now', label: 'Disable immediately', description: 'Konto sofort sperren' },
            { id: 'delete', label: 'Delete now', description: 'Konto sofort entfernen' },
          ],
          correctTarget: 'date',
          feedbackWrong: 'Eine Befristung wird typischerweise durch ein Ablaufdatum abgebildet, nicht durch sofortiges Löschen.',
          feedbackCorrect: 'Richtig: Ein Ablaufdatum beendet das Konto automatisch zum Vertragsende.',
        },
      ],
    },

    {
      id: 'ad-user-disable-guided-ui',
      type: 'guided-ui',
      title: 'Benutzerkonto deaktivieren',
      question: 'Ein Mitarbeiter verlässt NEXUS heute. Das Konto soll sofort nicht mehr nutzbar sein, aber vorerst erhalten bleiben.',
      explanation: 'Deaktivieren sperrt die Anmeldung, das Objekt bleibt erhalten. Löschen entfernt es.',
      intro: 'Ein Mitarbeiter verlässt NEXUS. Du sollst das Konto sofort unbrauchbar machen, aber noch nicht löschen.',
      steps: [
        {
          id: 'adusr-disable-action',
          kind: 'decision',
          screen: { title: 'Benutzerkonto', subtitle: 'Aktion wählen' },
          instruction: 'Welche Aktion passt?',
          targets: [
            { id: 'delete', label: 'Delete', description: 'Objekt entfernen' },
            { id: 'disable', label: 'Disable Account', description: 'Login sperren, Objekt bleibt' },
            { id: 'move', label: 'Move', description: 'In andere OU verschieben' },
            { id: 'reset', label: 'Reset Password', description: 'Kennwort zurücksetzen' },
          ],
          correctTarget: 'disable',
          feedbackWrong: 'Löschen entfernt das Konto. Move und Reset lösen das Problem nicht. Disable ist passend.',
          feedbackCorrect: 'Richtig: Das Konto ist deaktiviert und bleibt als Objekt erhalten.',
        },
      ],
    },

    {
      id: 'ad-user-name-vs-logon-select',
      type: 'select-best',
      title: 'Name oder Logon?',
      question: 'Welche Aussage unterscheidet korrekt zwischen Full Name und User Logon Name?',
      options: [
        'Beide sind identisch.',
        'Full Name ist der lesbare Name; Logon Name ist der technische Wert für die Anmeldung.',
        'Full Name wird für die Anmeldung verwendet; Logon Name ist nur der Spitzname.',
      ],
      correct: 1,
      explanation: 'Full Name ist der Anzeigename, Logon Name der eindeutige Anmeldewert.',
    },

    {
      id: 'ad-user-creation-decisions-select',
      type: 'select-best',
      title: 'Ziel-OU',
      question: 'Ein neuer Mitarbeiter startet im Vertrieb. An welche Stelle sollte sein Konto angelegt werden?',
      options: [
        'In den Container Users',
        'In die OU Vertrieb',
        'Auf den Domain Controller',
      ],
      correct: 1,
      explanation: 'Die richtige OU ist eine administrative Entscheidung und sollte zur Abteilung passen.',
    },

    {
      id: 'ad-user-account-options-select',
      type: 'select-best',
      title: 'Kontooptionen',
      question: 'Ein neuer Benutzer erhält ein Initialpasswort. Welche Option erzwingt eine Änderung beim ersten Login?',
      options: [
        'User cannot change password',
        'User must change password at next logon',
        'Password never expires',
      ],
      correct: 1,
      explanation: '„User must change password at next logon“ zwingt den Benutzer, beim ersten Login ein neues Passwort zu setzen.',
    },

    {
      id: 'ad-user-disable-vs-delete-select',
      type: 'select-best',
      title: 'Disable vs Delete',
      question: 'Ein Konto soll sofort keine Anmeldung mehr erlauben, aber als Objekt erhalten bleiben. Was ist richtig?',
      options: [
        'Delete',
        'Disable Account',
        'Move in eine andere OU',
      ],
      correct: 1,
      explanation: 'Disable sperrt die Anmeldung, das Objekt bleibt. Delete entfernt es.',
    },

    {
      id: 'ad-user-newaduser-matching',
      type: 'matching',
      title: 'GUI oder PowerShell?',
      question: 'Ordne die Aktion oder den Parameter ihrem Zweck zu.',
      pairs: [
        { left: 'ADUC → New → User', right: 'GUI: Benutzerkonto anlegen' },
        { left: 'New-ADUser', right: 'PowerShell: Benutzerkonto anlegen' },
        { left: 'Path', right: 'Ziel-OU / DN' },
        { left: 'Enabled', right: 'Konto aktivieren' },
      ],
      explanation: 'New-ADUser erzeugt dasselbe Objekt wie die GUI; Parameter wie Path und Enabled ersetzen die entsprechenden Dialoge.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Warum ist die Ziel-OU bei der Benutzeranlage wichtig?', options: ['Sie legt automatisch alle Berechtigungen fest.', 'Sie ist eine bewusste administrative Entscheidung zur strukturellen Einordnung.', 'Sie ist nur für die Suche relevant.'], correct: 1, explanation: 'Die OU sortiert das Konto organisatorisch ein; Berechtigungen sind ein separates Thema.' },
    { question: 'Was ist der Unterschied zwischen Full Name und User Logon Name?', options: ['Keiner', 'Full Name ist der lesbare Name; Logon Name ist der technische Wert für die Anmeldung.', 'Full Name wird zum Einloggen verwendet.'], correct: 1, explanation: 'Full Name = Anzeigename; Logon Name = Anmeldename.' },
    { question: 'Was passiert, wenn ein Benutzeranmeldename bereits existiert?', options: ['Der alte Account wird überschrieben.', 'Ein anderer Anmeldename muss gewählt werden.', 'Der Name wird automatisch ergänzt.'], correct: 1, explanation: 'Der Anmeldename muss eindeutig sein.' },
    { question: 'Welche Option erzwingt eine Kennwortänderung bei der nächsten Anmeldung?', options: ['User cannot change password', 'User must change password at next logon', 'Password never expires'], correct: 1, explanation: 'Diese Option zwingt den Benutzer, beim ersten Login ein neues Kennwort zu setzen.' },
    { question: 'Wie unterscheidet sich „Account disabled“ vom Löschen?', options: ['Keinerlei Unterschied', 'Disabled bleibt als Objekt erhalten; Delete entfernt es.', 'Disabled löscht sofort.'], correct: 1, explanation: 'Deaktivieren sperrt die Anmeldung, Löschen entfernt das Objekt.' },
    { question: 'Folgt die Workstation-Beschränkung automatisch aus der OU-Zugehörigkeit?', options: ['Ja', 'Nein', 'Nur für Standard-OUs'], correct: 1, explanation: 'OU und Workstation-Beschränkung sind separate Mechanismen.' },
    { question: 'Welcher Parameter in New-ADUser legt die Ziel-OU fest?', options: ['Name', 'Path', 'Enabled'], correct: 1, explanation: 'Path gibt den OU-Pfad an, in dem das Konto erstellt wird.' },
    { question: 'Welche Standardgruppe erhält ein neuer Domänenbenutzer typischerweise?', options: ['Domain Admins', 'Domain Users', 'Schema Admins'], correct: 1, explanation: 'Neue Domänenbenutzer gehören standardmäßig zu Domain Users.' },
  ];
}

function buildSummary() {
  return [
    'Benutzerkonten werden bewusst in der passenden OU angelegt.',
    'Anzeigename und Anmeldename sind unterschiedlich; der Anmeldename muss eindeutig sein.',
    'Initialkennwort und Kontooptionen beeinflussen die sofortige Anmeldung.',
    'Kontoeigenschaften wie Anmeldezeiten, erlaubte Computer und Ablaufdatum schränken die Nutzung ein.',
    'Deaktivieren und Löschen sind verschiedene Aktionen.',
    'Gruppenmitgliedschaften können erweitert werden; Domain Admin ist keine normale Benutzerrolle.',
    'New-ADUser ist die PowerShell-Alternative zur GUI.',
  ];
}

export function buildAdUsersLesson() {
  return {
    title: 'Benutzer anlegen & Benutzerkonto konfigurieren',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}
