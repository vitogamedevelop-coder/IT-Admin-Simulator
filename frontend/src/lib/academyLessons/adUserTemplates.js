import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Vorlagenbenutzer / Dummy-Benutzer
// Erweitert active-directory-virtualbox/users
// =============================================================================

export const AD_USER_TEMPLATES_TOPIC_KEY = topicKey('active-directory-virtualbox', 'users');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const templateDisabledSvg = `<svg viewBox="0 0 320 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="30" width="200" height="60" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="55" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">_Vorlage</text>
  <text x="160" y="75" text-anchor="middle" fill="#8b949e" font-size="10">disabled – nicht zur Anmeldung</text>
</svg>`;

const templateToUsersSvg = `<svg viewBox="0 0 360 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="120" height="80" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2" stroke-dasharray="4,2"/>
  <text x="80" y="70" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">_Vorlage</text>
  <text x="80" y="95" text-anchor="middle" fill="#8b949e" font-size="10">disabled</text>
  <line x1="140" y1="80" x2="200" y2="80" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="220" y="20" width="120" height="50" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="280" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Tom Weber</text>
  <text x="280" y="60" text-anchor="middle" fill="#c9d1d9" font-size="9">tom.weber</text>
  <rect x="220" y="90" width="120" height="50" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="280" y="115" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Jana Klein</text>
  <text x="280" y="130" text-anchor="middle" fill="#c9d1d9" font-size="9">jana.klein</text>
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/>
    </marker>
  </defs>
</svg>`;

const usernameExpansionSvg = `<svg viewBox="0 0 360 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="160" height="80" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="100" y="48" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">Vorlage</text>
  <text x="100" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">\\\\FILE01\\Profile$\\%username%</text>
  <line x1="180" y1="60" x2="220" y2="60" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="230" y="20" width="110" height="80" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="285" y="48" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Tom Weber</text>
  <text x="285" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">\\\\FILE01\\Profile$\\tom.weber</text>
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/>
    </marker>
  </defs>
</svg>`;

const copyVsRenameSvg = `<svg viewBox="0 0 360 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="30" width="130" height="60" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="85" y="58" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">_Vorlage</text>
  <text x="85" y="75" text-anchor="middle" fill="#8b949e" font-size="9">bleibt erhalten</text>
  <line x1="150" y1="60" x2="200" y2="60" stroke="#00f0ff" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="210" y="30" width="130" height="60" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="275" y="58" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Tom Weber</text>
  <text x="275" y="75" text-anchor="middle" fill="#c9d1d9" font-size="9">neuer Benutzer</text>
  <text x="180" y="105" text-anchor="middle" fill="#8b949e" font-size="10">Copy = Vorlage bleibt; Rename = Vorlage wäre verloren</text>
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#00f0ff"/>
    </marker>
  </defs>
</svg>`;

export function buildAdUserTemplateExplanations() {
  return [
    explanation('adusrtemplate-einstieg', 'Acht neue Mitarbeiter im Vertrieb', 'classic', [
      { type: 'text', content: 'Die Vertriebsabteilung bekommt acht neue Mitarbeiter. Jedes Konto braucht gleichartige Einstellungen: Home-Pfad, Profilpfad und bestimmte Kontoeigenschaften. Statt jeden Account achtmal komplett von Hand zu konfigurieren, baut Sam zuerst eine saubere Vorlage.' },
      { type: 'diagram', content: templateToUsersSvg },
      { type: 'text', content: 'Sam sagt: „Du könntest jeden Account achtmal komplett von Hand konfigurieren. Oder du baust zuerst eine saubere Vorlage.“' },
      { type: 'question', question: 'Was ist der Hauptvorteil eines Vorlagenbenutzers?', options: ['Er ersetzt alle Sicherheitsgruppen.', 'Er beschleunigt wiederkehrende Konfiguration für viele ähnliche Benutzer.', 'Er muss immer ein Domain-Admin-Konto sein.'], correct: 1, explanation: 'Ein Vorlagenkonto bereitet wiederkehrende Einstellungen vor, die auf neue Benutzer übertragen werden.' },
    ]),

    explanation('adusrtemplate-begriff', 'Was ist ein Vorlagenbenutzer?', 'classic', [
      { type: 'text', content: 'Ein Vorlagen- oder Dummy-Benutzer ist ein bewusst nicht produktiv genutztes Benutzerkonto, das als Ausgangspunkt für neue Benutzerkonten dient. Er ist kein echter Mitarbeiter, kein Testaccount und kein Service Account.' },
      { type: 'question', question: 'Was ist ein Vorlagenbenutzer?', options: ['Ein normaler Mitarbeiter, der noch nicht startet.', 'Ein bewusst nicht produktiv genutztes Konto als Ausgangspunkt für neue Benutzer.', 'Ein automatisch angelegtes Computerkonto.'], correct: 1, explanation: 'Ein Vorlagenbenutzer dient als administratives Hilfsmittel, nicht als produktiver Account.' },
    ]),

    explanation('adusrtemplate-namensgebung', 'Auffällig benennen', 'classic', [
      { type: 'text', content: 'Der Name sollte klar erkennbar sein, damit das Konto nicht versehentlich als echter Benutzer behandelt wird. Ein Unterstrich-Präfix wie `_Vorlage` macht das Konto leicht in Listen auffindbar. Wichtig ist nicht der exakte Name, sondern die klare Erkennbarkeit als Template.' },
      { type: 'question', question: 'Warum sollte ein Vorlagenkonto auffällig benannt werden?', options: ['Um es leicht als Template erkennbar zu machen.', 'Weil nur Unterstrich-Namen ADUC erlaubt.', 'Weil es dadurch automatisch deaktiviert wird.'], correct: 0, explanation: 'Ein auffälliger Name verhindert Verwechslungen mit echten Benutzerkonten.' },
    ]),

    explanation('adusrtemplate-status', 'Vorlage deaktivieren', 'classic', [
      { type: 'text', content: 'Ein Vorlagenkonto muss deaktiviert sein. Es soll nicht zur Anmeldung verwendet werden. Ein deaktiviertes Konto bleibt als Objekt erhalten, erlaubt aber keinen Login.' },
      { type: 'diagram', content: templateDisabledSvg },
      { type: 'question', question: 'Warum wird ein Vorlagenkonto deaktiviert?', options: ['Damit es nicht zur Anmeldung benutzt wird.', 'Damit es aus dem AD gelöscht wird.', 'Damit es sich selbst kopiert.'], correct: 0, explanation: 'Deaktivieren verhindert eine produktive Anmeldung; das Objekt bleibt für weitere Kopien erhalten.' },
    ]),

    explanation('adusrtemplate-einstellungen', 'Geeignete Einstellungen für eine Vorlage', 'classic', [
      { type: 'text', content: 'In die Vorlage gehören nur Einstellungen, die für alle Zielbenutzer wirklich gleich sein sollen. Typisch sind Home-Pfad, Profilpfad und bestimmte Kontoeigenschaften. Gruppenmitgliedschaften können ebenfalls sinnvoll sein, wenn sie für alle Zielbenutzer passen. Domain Admin oder andere hochprivilegierte Gruppen gehören nicht in eine Vorlage.' },
      { type: 'list', title: 'Geeignet für eine Vorlage', items: ['Home-Pfad', 'Profilpfad', 'Anmelde-/Kontoeigenschaften', 'Wiederkehrende Gruppenmitgliedschaften (nur passende)'] },
      { type: 'list', title: 'Nicht geeignet', items: ['Domain Admins', 'Enterprise Admins', 'Persönliche Namen', 'Individuelle Anmeldedaten'] },
      { type: 'question', question: 'Welche Einstellung gehört NICHT in eine Benutzer-Vorlage?', options: ['Home-Pfad', 'Profilpfad', 'Domain Admins-Gruppenmitgliedschaft'], correct: 2, explanation: 'Hochprivilegierte Gruppen haben in einem Benutzer-Template nichts verloren.' },
    ]),

    explanation('adusrtemplate-username', '%username% in Home- und Profilpfad', 'classic', [
      { type: 'text', content: 'Der Platzhalter `%username%` wird beim neuen Benutzer durch den tatsächlichen Anmeldenamen ersetzt. So zeigt jeder Benutzer auf seinen eigenen Ordner, ohne dass der Pfad im Template individuell angepasst werden muss.' },
      { type: 'diagram', content: usernameExpansionSvg },
      { type: 'question', question: 'Was bewirkt `%username%` im Profilpfad der Vorlage?', options: ['Alle Benutzer teilen sich denselben Ordner.', 'Beim neuen Benutzer wird der Pfad automatisch auf den Anmeldenamen erweitert.', 'Der Pfad bleibt leer.'], correct: 1, explanation: '`%username%` expandiert zum Anmeldenamen des neuen Benutzers, z. B. `tom.weber`.' },
    ]),

    explanation('adusrtemplate-copy', 'Kopieren statt umbenennen', 'classic', [
      { type: 'text', content: 'Werden neue Benutzer aus der Vorlage kopiert, bleibt `_Vorlage` erhalten. Umbenennen würde das Template selbst verändern und für weitere Benutzer verlieren. Copy ist daher der richtige Weg.' },
      { type: 'diagram', content: copyVsRenameSvg },
      { type: 'question', question: 'Warum sollte ein neuer Benutzer aus der Vorlage kopiert statt umbenannt werden?', options: ['Weil Kopieren schneller ist.', 'Weil die Vorlage erhalten bleibt und erneut genutzt werden kann.', 'Weil Umbenennen mehr Attribute kopiert.'], correct: 1, explanation: 'Copy bewahrt das Template; Rename würde es verändern.' },
    ]),

    explanation('adusrtemplate-nicht-100', 'Copy übernimmt nicht alles', 'classic', [
      { type: 'text', content: 'ADUC Copy User übernimmt nur bestimmte Attribute. Der neue Benutzer braucht danach individuelle Anpassungen. Es ist falsch anzunehmen, dass Kopieren 100 Prozent der Einstellungen überträgt.' },
      { type: 'list', title: 'Immer individuell prüfen', items: ['Vorname und Nachname', 'Full Name', 'Logon Name (SamAccountName / UPN)', 'Passwort / Initialkennwort', 'Persönliche Zielparameter'] },
      { type: 'question', question: 'Ist die Aussage „Copy User kopiert 100 % aller Einstellungen“ korrekt?', options: ['Ja', 'Nein', 'Nur für Gruppenmitgliedschaften'], correct: 1, explanation: 'Copy User übernimmt nur bestimmte Attribute; individuelle Felder müssen nachträglich geprüft werden.' },
    ]),

    explanation('adusrtemplate-verifikation', 'Nach dem Kopieren kontrollieren', 'classic', [
      { type: 'text', content: 'Nach dem Kopieren soll der neue Benutzer geprüft werden: Name, Login, Konto aktiv, Passwort-Optionen, Profilpfad, Home-Pfad und der Zustand der Vorlage selbst. Eine Vorlage ersetzt nicht die fachliche Kontrolle.' },
      { type: 'list', title: 'Kontroll-Checkliste', items: ['Name und Logon korrekt?', 'Account enabled?', 'Initialpasswort-Option passend?', 'Profile Path korrekt?', 'Home Path korrekt?', 'Vorlage weiterhin deaktiviert?'] },
      { type: 'question', question: 'Warum muss ein kopierter Benutzer trotz Vorlage kontrolliert werden?', options: ['Weil Kopieren nur bestimmte Eigenschaften übernimmt.', 'Weil die Vorlage automatisch ungültig wird.', 'Weil der Name immer falsch ist.'], correct: 0, explanation: 'Copy übernimmt nicht alles; individuelle und technische Felder müssen geprüft werden.' },
    ]),

    explanation('adusrtemplate-troubleshooting', 'Falsche Einstellung nach Copy', 'classic', [
      { type: 'text', content: 'Wenn Tom nach dem Kopieren noch falsche Einstellungen zeigt, öffne seine Eigenschaften und prüfe die betroffenen Attribute. Gehe nicht blind davon aus, dass das Template alles korrekt übernommen hat.' },
      { type: 'question', question: 'Was ist sinnvoll, wenn ein kopierter Benutzer falsche Einstellungen zeigt?', options: ['Tom sofort löschen und neu anlegen.', 'Die Eigenschaften des neuen Benutzers kontrollieren und korrigieren.', 'Die Vorlage aktivieren.'], correct: 1, explanation: 'Kontrolle und Korrektur im neuen Benutzer sind der sinnvolle Weg.' },
    ]),
  ];
}

export function buildAdUserTemplateExercises() {
  return [
    {
      id: 'ad-user-template-create-guided-ui',
      type: 'guided-ui',
      title: 'Vertriebs-Vorlage vorbereiten',
      question: 'Bereite eine deaktivierte Vorlage `_Vorlage` für den Vertrieb mit Home- und Profilpfad vor.',
      explanation: 'ADUC → richtige OU → New → User → _Vorlage → Properties → Profile. Home- und Profilpfad enthalten `%username%`; das Konto wird deaktiviert.',
      intro: 'Acht neue Vertriebsmitarbeiter sollen aus einer Vorlage erzeugt werden. Bereite das Template sauber vor.',
      steps: [
        {
          id: 'adusrtmpl-create-ou',
          kind: 'navigation',
          screen: { title: 'nexus.local', subtitle: 'Ziel-OU wählen' },
          instruction: 'In welche OU gehört die Vorlage, wenn spätere Vertriebsbenutzer dort angelegt werden?',
          targets: [
            { id: 'it', label: 'IT', description: 'Falsche Abteilung' },
            { id: 'vertrieb', label: 'Vertrieb', description: 'Richtige Abteilung' },
            { id: 'personal', label: 'Personal', description: 'Falsche Abteilung' },
            { id: 'entwicklung', label: 'Entwicklung', description: 'Falsche Abteilung' },
          ],
          correctTarget: 'vertrieb',
          feedbackWrong: 'Die Vorlage sollte in der OU liegen, in der auch die späteren Benutzer angelegt werden.',
          feedbackCorrect: 'Richtig: Vertrieb ist die passende OU.',
        },
        {
          id: 'adusrtmpl-create-new',
          kind: 'navigation',
          screen: { title: 'OU Vertrieb', subtitle: 'Neues Objekt' },
          instruction: 'Wie erstellst du ein neues Objekt?',
          targets: [
            { id: 'find', label: 'Find' },
            { id: 'new', label: 'New' },
            { id: 'properties', label: 'Properties' },
            { id: 'refresh', label: 'Refresh' },
          ],
          correctTarget: 'new',
          feedbackWrong: 'New öffnet den Dialog für ein neues Objekt.',
          feedbackCorrect: 'Richtig: New → User.',
        },
        {
          id: 'adusrtmpl-create-name',
          kind: 'decision',
          screen: { title: 'New Object – User', subtitle: 'Name eingeben' },
          instruction: 'Welcher vollständige Name kennzeichnet das Konto eindeutig als Vorlage?',
          targets: [
            { id: 'lisa', label: 'Lisa Berger', description: 'Echte Person' },
            { id: 'vorlage', label: '_Vorlage', description: 'Auffälliger Template-Name' },
            { id: 'admin', label: 'admin', description: 'Reserviert' },
            { id: 'tom', label: 'Tom Weber', description: 'Echte Person' },
          ],
          correctTarget: 'vorlage',
          feedbackWrong: 'Ein Vorlagenkonto braucht einen auffälligen, nicht personenbezogenen Namen.',
          feedbackCorrect: 'Richtig: `_Vorlage` ist klar als Template erkennbar.',
        },
        {
          id: 'adusrtmpl-create-profile',
          kind: 'decision',
          screen: { title: 'Profile', subtitle: 'Profilpfad' },
          instruction: 'Welcher Profilpfad passt für eine wiederverwendbare Vorlage?',
          targets: [
            { id: 'profile-c', label: 'C:\\Profile', description: 'Lokaler Pfad, nicht zentral' },
            { id: 'profile-unc', label: '\\\\FILE01\\Profile$\\%username%', description: 'Zentraler UNC-Pfad mit %username%' },
            { id: 'profile-all', label: '\\\\FILE01\\Profile$\\_Vorlage', description: 'Würde allen denselben Ordner geben' },
            { id: 'profile-missing', label: 'Leer lassen', description: 'Keine Profilvorgabe' },
          ],
          correctTarget: 'profile-unc',
          feedbackWrong: 'Der Pfad sollte zentral und mit `%username%` benutzerbezogen sein.',
          feedbackCorrect: 'Richtig: `%username%` expandiert beim neuen Benutzer zum Logon-Namen.',
        },
        {
          id: 'adusrtmpl-create-home',
          kind: 'decision',
          screen: { title: 'Home', subtitle: 'Home-Pfad' },
          instruction: 'Welche Home-Pfad-Kombination ist korrekt?',
          targets: [
            { id: 'home-c', label: 'C:\\Home', description: 'Lokales Laufwerk' },
            { id: 'home-unc', label: 'H: \\\FILE01\\Home$\\%username%', description: 'Laufwerksbuchstabe + UNC mit %username%' },
            { id: 'home-all', label: 'H: \\\FILE01\\Home$\\_Vorlage', description: 'Gemeinsamer Ordner' },
            { id: 'home-missing', label: 'Leer lassen', description: 'Keine Homevorgabe' },
          ],
          correctTarget: 'home-unc',
          feedbackWrong: 'Der Home-Pfad sollte zentral, mit Laufwerksbuchstaben und `%username%` benutzerbezogen sein.',
          feedbackCorrect: 'Richtig: `H:` + `\\\\FILE01\\Home$\\%username%` passt für alle neuen Benutzer.',
        },
        {
          id: 'adusrtmpl-create-status',
          kind: 'decision',
          screen: { title: 'Account', subtitle: 'Kontostatus' },
          instruction: 'Wie stellst du sicher, dass die Vorlage nicht zur Anmeldung verwendet werden kann?',
          targets: [
            { id: 'enabled', label: 'Account enabled', description: 'Vorlage wäre anmeldbar' },
            { id: 'disabled', label: 'Account disabled', description: 'Vorlage bleibt erhalten, Login nicht möglich' },
            { id: 'delete', label: 'Delete', description: 'Vorlage wäre weg' },
            { id: 'move', label: 'Move', description: 'Ändert nur die OU' },
          ],
          correctTarget: 'disabled',
          feedbackWrong: 'Eine Vorlage muss deaktiviert sein, damit niemand sich mit ihr anmeldet.',
          feedbackCorrect: 'Richtig: Deaktiviert, Objekt bleibt erhalten.',
        },
      ],
    },

    {
      id: 'ad-user-template-copy-guided-ui',
      type: 'guided-ui',
      title: 'Tom Weber aus der Vorlage kopieren',
      question: 'Erstelle Tom Weber aus der vorbereiteten Vorlage und trage die individuellen Werte ein.',
      explanation: '`_Vorlage` → right click → Copy → neuer Benutzer → Name und Logon anpassen → Initialpasswort → Account aktiv lassen.',
      intro: 'Tom Weber startet im Vertrieb. Verwende die Vorlage, um ihn schneller anzulegen.',
      steps: [
        {
          id: 'adusrtmpl-copy-action',
          kind: 'navigation',
          screen: { title: '_Vorlage', subtitle: 'Aktion wählen' },
          instruction: 'Welche Aktion erzeugt einen neuen Benutzer und lässt die Vorlage erhalten?',
          targets: [
            { id: 'rename', label: 'Rename', description: 'Vorlage würde verloren gehen' },
            { id: 'copy', label: 'Copy', description: 'Vorlage bleibt erhalten' },
            { id: 'delete', label: 'Delete', description: 'Vorlage würde entfernt' },
            { id: 'move', label: 'Move', description: 'Ändert nur die OU' },
          ],
          correctTarget: 'copy',
          feedbackWrong: 'Rename würde das Template selbst verändern; Copy bewahrt es.',
          feedbackCorrect: 'Richtig: Copy erzeugt einen neuen Benutzer aus der Vorlage.',
        },
        {
          id: 'adusrtmpl-copy-fullname',
          kind: 'decision',
          screen: { title: 'New Object – User', subtitle: 'Vollständiger Name' },
          instruction: 'Was trägst du als vollständigen Namen ein?',
          targets: [
            { id: 'vorlage', label: '_Vorlage', description: 'Name des Templates' },
            { id: 'tom-weber', label: 'Tom Weber', description: 'Voller Name des neuen Mitarbeiters' },
            { id: 'vertrieb', label: 'Vertrieb', description: 'Abteilung, kein Name' },
            { id: 'tom', label: 'tom', description: 'Zu kurz' },
          ],
          correctTarget: 'tom-weber',
          feedbackWrong: 'Der vollständige Name muss der neuen Person entsprechen.',
          feedbackCorrect: 'Richtig: Tom Weber ist der Anzeigename des neuen Benutzers.',
        },
        {
          id: 'adusrtmpl-copy-logon',
          kind: 'decision',
          screen: { title: 'New Object – User', subtitle: 'Anmeldename' },
          instruction: 'Welcher Anmeldename passt für Tom Weber?',
          targets: [
            { id: 'vorlage', label: '_Vorlage', description: 'Template-Name' },
            { id: 'tom-weber', label: 'Tom Weber', description: 'Anzeigename, kein Logon' },
            { id: 'tom.weber', label: 'tom.weber', description: 'Einmaliger Anmeldename' },
            { id: 'admin', label: 'admin', description: 'Reserviert' },
          ],
          correctTarget: 'tom.weber',
          feedbackWrong: 'Der Logon-Name muss eindeutig und technisch verwendbar sein.',
          feedbackCorrect: 'Richtig: tom.weber ist ein passender Anmeldename.',
        },
        {
          id: 'adusrtmpl-copy-password',
          kind: 'decision',
          screen: { title: 'Password Options', subtitle: 'Kennwort' },
          instruction: 'Tom bekommt ein Initialkennwort und soll es bei der ersten Anmeldung ändern.',
          targets: [
            { id: 'change', label: 'User must change password at next logon + Account enabled', description: 'Initialkennwort muss geändert werden' },
            { id: 'nochange', label: 'User cannot change password', description: 'Verhindert Änderung' },
            { id: 'disabled', label: 'Account disabled', description: 'Neuer Benutzer könnte sich nicht anmelden' },
            { id: 'never', label: 'Password never expires', description: 'Nicht gefragt' },
          ],
          correctTarget: 'change',
          feedbackWrong: 'Tom soll das Initialkennwort ändern und sich anmelden können.',
          feedbackCorrect: 'Richtig: Änderung erzwingen und Konto aktiv.',
        },
      ],
    },

    {
      id: 'ad-user-template-purpose-select',
      type: 'select-best',
      title: 'Sinn eines Vorlagenbenutzers',
      question: 'Was ist der Hauptzweck eines Vorlagenbenutzers?',
      options: [
        'Ein echter Benutzer, der vorübergehend deaktiviert wird.',
        'Ein administratives Hilfskonto, um wiederkehrende Einstellungen für neue Benutzer vorzubereiten.',
        'Ein Service Account für automatisierte Prozesse.',
      ],
      correct: 1,
      explanation: 'Ein Vorlagenkonto bereitet wiederkehrende Einstellungen vor; es ist kein echter Benutzer oder Service Account.',
    },

    {
      id: 'ad-user-template-disabled-select',
      type: 'select-best',
      title: 'Vorlage deaktiviert',
      question: 'Warum muss ein Vorlagenkonto deaktiviert bleiben?',
      options: [
        'Damit es nicht zur Anmeldung verwendet werden kann.',
        'Damit es automatisch gelöscht wird.',
        'Damit es sich nicht kopieren lässt.',
      ],
      correct: 0,
      explanation: 'Deaktivieren verhindert, dass sich jemand mit dem Template anmeldet; das Objekt bleibt erhalten.',
    },

    {
      id: 'ad-user-template-copy-vs-rename-select',
      type: 'select-best',
      title: 'Copy vs Rename',
      question: 'Warum ist Kopieren einer Vorlage besser als Umbenennen?',
      options: [
        'Weil Umbenennen schneller ist.',
        'Weil Kopieren die Vorlage erhält und mehrere Benutzer daraus erzeugen können.',
        'Weil Umbenennen immer Adminrechte erfordert.',
      ],
      correct: 1,
      explanation: 'Copy bewahrt das Template; Rename würde es verändern und für weitere Benutzer verlieren.',
    },

    {
      id: 'ad-user-template-username-select',
      type: 'select-best',
      title: '%username%',
      question: 'Was bewirkt `%username%` in einem Home- oder Profilpfad der Vorlage?',
      options: [
        'Alle Benutzer erhalten denselben Ordner.',
        'Der Pfad wird auf den Anmeldenamen des neuen Benutzers angepasst.',
        'Der Pfad wird ignoriert.',
      ],
      correct: 1,
      explanation: 'Beim neuen Benutzer wird `%username%` durch den Logon-Namen ersetzt, z. B. `tom.weber`.',
    },

    {
      id: 'ad-user-template-individual-select',
      type: 'select-best',
      title: 'Individuelle Felder',
      question: 'Welche Werte müssen nach dem Kopieren einer Vorlage in der Regel individuell gesetzt werden?',
      options: [
        'Nur das Passwort.',
        'Vorname, Nachname, Full Name, Logon Name und Passwort.',
        'Keine; das Template übernimmt alles.',
      ],
      correct: 1,
      explanation: 'Name, Logon und Passwort sind persönliche Werte, die individuell festgelegt werden müssen.',
    },

    {
      id: 'ad-user-template-verify-select',
      type: 'select-best',
      title: 'Verifikation',
      question: 'Was gehört zur sinnvollen Kontrolle nach dem Kopieren einer Vorlage?',
      options: [
        'Nichts prüfen, weil das Template stimmt.',
        'Name, Logon, Passwort-Optionen, Profile Path, Home Path und Template-Status prüfen.',
        'Nur den Anzeigename prüfen.',
      ],
      correct: 1,
      explanation: 'Auch mit Vorlage müssen Name, Logon, Pfade und der Zustand des Templates kontrolliert werden.',
    },

    {
      id: 'ad-user-template-security-select',
      type: 'select-best',
      title: 'Template-Sicherheit',
      question: 'Warum sollte eine Benutzer-Vorlage keine Domain Admins-Gruppenmitgliedschaft enthalten?',
      options: [
        'Weil Domain Admins nicht kopierbar ist.',
        'Weil so alle daraus erzeugten Benutzer unnötig hochprivilegiert wären.',
        'Weil Domain Admins in OUs nicht zulässig ist.',
      ],
      correct: 1,
      explanation: 'Eine Vorlage darf keine hochprivilegierten Gruppen vorsehen, weil diese auf alle kopierten Benutzer übertragen würden.',
    },
  ];
}

export function buildAdUserTemplateQuiz() {
  return [
    { question: 'Was ist ein Vorlagenbenutzer?', options: ['Ein bewusst nicht produktiv genutztes Konto als Ausgangspunkt für neue Benutzer.', 'Ein normaler Mitarbeiter.', 'Ein Service Account.'], correct: 0, explanation: 'Ein Template ist ein administratives Hilfskonto, kein echter Benutzer oder Service Account.' },
    { question: 'Warum sollte ein Vorlagenkonto deaktiviert sein?', options: ['Damit es nicht zur Anmeldung benutzt wird.', 'Damit es automatisch kopiert wird.', 'Damit es sicher ist.'], correct: 0, explanation: 'Deaktivieren verhindert, dass jemand sich mit dem Template anmeldet.' },
    { question: 'Was bewirkt `%username%` in einem Profilpfad?', options: ['Alle Benutzer teilen denselben Ordner.', 'Der Pfad wird auf den Anmeldenamen des neuen Benutzers angepasst.', 'Der Pfad bleibt leer.'], correct: 1, explanation: '`%username%` expandiert zum tatsächlichen Logon-Namen.' },
    { question: 'Warum ist Kopieren einer Vorlage besser als Umbenennen?', options: ['Weil Kopieren schneller ist.', 'Weil die Vorlage erhalten bleibt.', 'Weil Umbenennen mehr kopiert.'], correct: 1, explanation: 'Copy bewahrt das Template; Rename würde es verändern.' },
    { question: 'Übernimmt Copy User 100 % aller Einstellungen?', options: ['Ja', 'Nein', 'Nur Gruppenmitgliedschaften'], correct: 1, explanation: 'Copy User übernimmt nur bestimmte Attribute; individuelle Felder müssen geprüft werden.' },
    { question: 'Welche Einstellung gehört nicht in eine Benutzer-Vorlage?', options: ['Home-Pfad', 'Profilpfad', 'Domain Admins-Mitgliedschaft'], correct: 2, explanation: 'Hochprivilegierte Gruppen haben in einem Benutzer-Template nichts verloren.' },
    { question: 'Was muss nach dem Kopieren kontrolliert werden?', options: ['Nichts, das Template stimmt.', 'Name, Logon, Passwort-Optionen, Pfade und Template-Status.', 'Nur der Vorname.'], correct: 1, explanation: 'Auch aus einer Vorlage erzeugte Benutzer müssen fachlich kontrolliert werden.' },
  ];
}

export function buildAdUserTemplateSummary() {
  return [
    'Ein Vorlagenkonto ist ein deaktiviertes Hilfskonto für wiederkehrende Benutzerkonfiguration.',
    'Es bereitet gemeinsame Einstellungen wie Home- und Profilpfad vor.',
    '`%username%` im Pfad sorgt für benutzerbezogene Ordner.',
    'Neue Benutzer werden per Copy aus der Vorlage erzeugt; Rename würde sie verlieren.',
    'Copy User übernimmt nicht alles; individuelle Felder müssen geprüft werden.',
    'Eine Vorlage darf keine hochprivilegierten Gruppen wie Domain Admins enthalten.',
    'Nach dem Kopieren kontrolliert man Name, Logon, Passwort, Pfade und den Template-Status.',
  ];
}
