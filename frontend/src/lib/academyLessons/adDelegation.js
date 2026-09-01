import { topicKey } from '../academyTopics.js';

export const AD_DELEGATION_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-delegation');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const delegationFlowSvg = `<svg viewBox="0 0 320 240" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Delegation: Account → Gruppe → OU → Aufgabe</text>

  <rect x="40" y="40" width="80" height="30" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="80" y="60" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">S6Offz</text>

  <path d="M120 55 L140 55" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="145" y="40" width="110" height="30" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="200" y="60" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">G_S6</text>

  <path d="M255 55 L270 55 L270 85 L245 85" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="145" y="90" width="110" height="30" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="200" y="110" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">DL_StabPwReset</text>

  <path d="M200 120 L200 150" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="120" y="155" width="160" height="30" rx="4" fill="#0d1117" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="200" y="175" text-anchor="middle" fill="#7c3aed" font-size="9" font-weight="bold">OU Stab</text>

  <path d="M200 185 L200 205" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="100" y="210" width="200" height="25" rx="4" fill="#0d1117" stroke="#2ea043" stroke-width="1.5"/>
  <text x="200" y="227" text-anchor="middle" fill="#2ea043" font-size="9" font-weight="bold">Kennwort zurücksetzen</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#8b949e"/>
    </marker>
  </defs>
</svg>`;

export function buildAdDelegationLesson() {
  const title = 'Delegation & Objektverwaltung';

  const explanations = [
    explanation('ad-delegation-why', 'Warum Delegation?', 'classic', [
      { type: 'text', content: 'In einer Domäne können nicht alle Verwaltungsaufgaben zentral von wenigen Domänenadmins erledigt werden. Häufig brauchen Hilfskräfte nur eine ganz bestimmte Aufgabe für einen begrenzten Bereich – zum Beispiel Passwörter für die OU Stab zurücksetzen. Delegation bedeutet, eine klar definierte Verwaltungsaufgabe an andere Benutzer oder Gruppen mit passenden Rechten zu übertragen, ohne pauschal Vollzugriff zu gewähren.' },
      { type: 'question', question: 'Warum ist Delegation in AD sinnvoll?', options: ['Weil jeder Administrator alle Rechte bekommt', 'Weil Aufgaben gezielt an Rollen mit passenden Rechten vergeben werden', 'Weil Passwörter automatisch gesetzt werden', 'Weil lokale Konten ersetzt werden'], correct: 1, explanation: 'Delegation teilt Verwaltungsaufgaben so auf, dass jede Rolle nur die nötigen Rechte erhält.' },
    ]),

    explanation('ad-delegation-least-privilege', 'Least Privilege', 'classic', [
      { type: 'text', content: 'Der S6Offz soll Passwörter für die OU Stab zurücksetzen dürfen. Er soll aber kein Domänenadmin sein und keine anderen OUs verwalten. Least Privilege bedeutet: nur die kleinste notwendige Aufgabe im kleinsten notwendigen Scope erlauben. Nicht mehr.' },
      { type: 'question', question: 'Was bedeutet Least Privilege bei Delegation?', options: ['Möglichst viele Rechte, um später nichts ändern zu müssen', 'Nur die nötigen Rechte im nötigen Scope', 'Jeder bekommt Vollzugriff', 'Nur Admins dürfen delegieren'], correct: 1, explanation: 'Least Privilege gewährt genau die Rechte, die für die Aufgabe benötigt werden.' },
    ]),

    explanation('ad-delegation-group-model', 'Gruppenmodell wiederverwenden', 'classic', [
      { type: 'text', content: 'Wir delegieren nicht direkt an einen Einzelbenutzer wie S6Offz. Stattdessen verwenden wir die bekannte Kette: Account → globale Funktionsgruppe → domänenlokale Berechtigungsgruppe. S6Offz ist Mitglied in G_S6; G_S6 ist Mitglied in DL_StabPwReset; der Delegation Wizard wendet DL_StabPwReset auf die OU Stab an. Bei Personalwechsel ändert man nur die Funktionsgruppenmitgliedschaft.' },
      { type: 'diagram', content: delegationFlowSvg },
      { type: 'question', question: 'Welche Kette wird für die Delegation verwendet?', options: ['S6Offz → OU Stab', 'S6Offz → G_S6 → DL_StabPwReset → OU Stab', 'DL_StabPwReset → G_S6 → S6Offz', 'Domänenadmin → S6Offz'], correct: 1, explanation: 'Account landet in der globalen Funktionsgruppe, diese in der domänenlokalen Berechtigungsgruppe, diese erhält die Delegation auf der OU.' },
    ]),

    explanation('ad-delegation-scope', 'Scope: OU Stab', 'classic', [
      { type: 'text', content: 'Delegation wird immer auf einen Bereich angewendet. Hier ist das die OU Stab. Das bedeutet: das Recht gilt für Benutzer in der OU Stab, nicht für die gesamte Domäne und nicht für andere OUs. Recht plus Scope gehören zusammen.' },
      { type: 'question', question: 'Auf welchem Bereich soll das Passwortreset-Recht delegiert werden?', options: ['Auf der gesamten Domäne', 'Auf der OU Stab', 'Auf dem Computerobjekt', 'Auf dem Schema'], correct: 1, explanation: 'Der Scope ist die OU Stab, um Least Privilege zu wahren.' },
    ]),

    explanation('ad-delegation-wizard', 'Objektverwaltung zuweisen', 'classic', [
      { type: 'text', content: 'Im Active Directory-Benutzer und -Computer (ADUC) wählt man die OU Stab aus, öffnet das Kontextmenü und startet "Objektverwaltung zuweisen...". Der Delegation Wizard führt durch die Auswahl der berechtigten Gruppe und der zu delegierenden Aufgabe.' },
      { type: 'question', question: 'Wo startest du den Delegation Wizard für eine OU?', options: ['Im Eigenschaften-Dialog der OU', 'Im Kontextmenü der OU → Objektverwaltung zuweisen', 'Im Startmenü', 'In der Ereignisanzeige'], correct: 1, explanation: 'Der Wizard startet aus dem Kontextmenü der OU über "Objektverwaltung zuweisen...".' },
    ]),

    explanation('ad-delegation-principal', 'Berechtigte Gruppe wählen', 'classic', [
      { type: 'text', content: 'Im Wizard fragt der Wizard nach dem Benutzer oder der Gruppe, der die Aufgabe delegiert werden soll. Hier trägt man die Berechtigungsgruppe DL_StabPwReset ein, nicht den einzelnen Benutzer S6Offz. Das ermöglicht, später einfach Mitgliedschaften zu ändern, ohne die Delegation anzufassen.' },
      { type: 'question', question: 'Welche Gruppe sollte im Delegation Wizard eingetragen werden?', options: ['S6Offz direkt', 'G_S6', 'DL_StabPwReset', 'Domänen-Admins'], correct: 2, explanation: 'DL_StabPwReset ist die Berechtigungsgruppe, der das Recht auf der OU zugewiesen wird.' },
    ]),

    explanation('ad-delegation-task', 'Aufgabe wählen', 'classic', [
      { type: 'text', content: 'Anschließend wählt man die konkrete Aufgabe. Für dieses Szenario wählt man "Kennwort zurücksetzen" für Benutzerkonten. Es ist wichtig, genau diese Aufgabe zu wählen und nicht etwa "Benutzer erstellen" oder "löschen", wenn das nicht gewollt ist.' },
      { type: 'question', question: 'Welche Aufgabe wird in diesem Szenario delegiert?', options: ['Benutzerkonten erstellen und löschen', 'Kennwort zurücksetzen', 'Domänenverwaltung', 'DNS-Zonen verwalten'], correct: 1, explanation: 'Das Szenario sieht vor, dass das Kennwort zurückgesetzt werden darf, aber keine weiteren Benutzeränderungen.' },
    ]),

    explanation('ad-delegation-vs-mmc', 'Delegation ≠ MMC', 'classic', [
      { type: 'text', content: 'Thema 15 hat erklärt: eine eingeschränkte MMC beschränkt nur die Oberfläche. Delegation ist das Gegenstück: sie definiert echte AD-Berechtigungen. Beide können später kombiniert werden, aber eine MMC-UI-Einschränkung allein erteilt keine Rechte und umgekehrt erteilen delegierte Rechte keinen automatischen UI-Zugriff.' },
      { type: 'question', question: 'Was ist der Unterschied zwischen Delegation und eingeschränkter MMC?', options: ['Beides ist dasselbe', 'MMC beschränkt die Oberfläche, Delegation erteilt echte Berechtigungen', 'Delegation ersetzt die MMC', 'MMC erteilt echte Berechtigungen'], correct: 1, explanation: 'MMC ist UI, Delegation ist Berechtigung. Beides arbeitet auf unterschiedlichen Ebenen.' },
    ]),

    explanation('ad-delegation-verification', 'Verification', 'classic', [
      { type: 'text', content: 'Nach der Delegation muss man prüfen, ob das Recht funktioniert. Sinnvoll ist ein Test mit Hilfsadmin: ein Benutzer in der OU Stab bekommt ein neues Passwort; ein Benutzer außerhalb der OU Stab darf nicht zurückgesetzt werden; andere Adminfunktionen wie Gruppen anlegen oder OUs ändern sind nicht möglich.' },
      { type: 'question', question: 'Was ist ein sinnvoller Verification-Test nach Delegation?', options: ['Domänenadmin-Rechte prüfen', 'Passwortreset nur innerhalb der OU Stab testen', 'Alle Benutzer aus der Domäne löschen', 'DNS-Server neu starten'], correct: 1, explanation: 'Der Test stellt sicher, dass das Recht nur im vorgesehenen Scope funktioniert.' },
    ]),

    explanation('ad-delegation-preview', 'Ausblick auf Thema 17', 'classic', [
      { type: 'text', content: 'In Thema 17 bauen wir eine passende MMC für den Hilfsadmin: ADUC-Snap-In, OU Stab, passender Menübefehl und ein eingeschränkter Anzeigemodus. Dann sehen wir, wie eine reduzierte MMC-Oberfläche mit tatsächlich delegierten Rechten zusammenspielt.' },
      { type: 'question', question: 'Was folgt in Thema 17?', options: ['MMC für Hilfsadmin erstellen und einschränken', 'Schema Master verwalten', 'DNS-Konfiguration', 'Gruppenrichtlinien-Editor'], correct: 0, explanation: 'Thema 17 baut die MMC für den Hilfsadmin mit passendem Menübefehl und eingeschränkter Oberfläche.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-delegation-purpose',
      type: 'select-best',
      question: 'Warum wird in AD Delegation statt Domain Admin verwendet?',
      options: ['Damit jeder alle Rechte bekommt', 'Damit nur die nötige Aufgabe im nötigen Scope vergeben wird', 'Damit Passwörter automatisch ablaufen', 'Damit keine Gruppen gebraucht werden'],
      correct: 1,
      explanation: 'Delegation ermöglicht gezielte Rechtevergabe ohne Vollzugriff.',
    },
    {
      id: 'ad-delegation-least-privilege',
      type: 'select-best',
      question: 'Was bedeutet Least Privilege für den S6Offz?',
      options: ['Er wird Domänenadmin', 'Er erhält nur das Recht, Passwörter in OU Stab zurückzusetzen', 'Er verwaltet alle OUs', 'Er darf Gruppen erstellen'],
      correct: 1,
      explanation: 'Least Privilege gewährt nur die minimal nötigen Rechte im minimal nötigen Scope.',
    },
    {
      id: 'ad-delegation-group-ordering',
      type: 'ordering',
      question: 'Ordne die Delegationskette in die richtige Reihenfolge.',
      items: ['S6Offz', 'G_S6', 'DL_StabPwReset', 'Delegation auf OU Stab'],
      correctOrder: [0, 1, 2, 3],
      explanation: 'S6Offz → G_S6 → DL_StabPwReset → Delegation auf OU Stab.',
    },
    {
      id: 'ad-delegation-scope',
      type: 'select-best',
      question: 'Passwortreset soll nur für die Stab-OU gelten. Wo delegierst du?',
      options: ['Auf der Domain Root', 'Auf der OU Stab', 'Auf dem Domain Controller', 'Auf dem Schema'],
      correct: 1,
      explanation: 'Die Delegation muss auf der OU Stab erfolgen, damit der Scope begrenzt bleibt.',
    },
    {
      id: 'ad-delegation-principal',
      type: 'select-best',
      question: 'Welche Identität wird im Delegation Wizard bevorzugt delegiert?',
      options: ['S6Offz direkt', 'G_S6', 'DL_StabPwReset', 'Domänenadmin'],
      correct: 2,
      explanation: 'DL_StabPwReset ist die Berechtigungsgruppe, der das Recht auf der OU zugewiesen wird.',
    },
    {
      id: 'ad-delegation-misconception',
      type: 'select-best',
      question: 'Die Aussage: "Wenn ein Benutzer eine eingeschränkte MMC besitzt, braucht man keine Delegation mehr." Ist das korrekt?',
      options: ['Ja', 'Nein', 'Nur im Autorenmodus', 'Nur für Domänenadmins'],
      correct: 1,
      explanation: 'Eine eingeschränkte MMC ist nur UI. Rechte müssen separat delegiert werden.',
    },
    {
      id: 'ad-delegation-transfer',
      type: 'select-best',
      question: 'Eine neue Mitarbeiterin übernimmt die S6-Rolle. Was änderst du primär?',
      options: ['Die Delegation auf der OU neu erstellen', 'Die Mitgliedschaft in G_S6', 'Die OU Struktur', 'Das Schema'],
      correct: 1,
      explanation: 'Man ändert die Mitgliedschaft in der Funktionsgruppe; die Delegation bleibt erhalten.',
    },
    {
      id: 'ad-delegation-admin-challenge',
      type: 'select-best',
      question: 'Helpdesk-Auftrag: S6-Mitarbeiter soll für OU Stab Kennwörter zurücksetzen, ohne weitere AD-Rechte. Welche Schritte sind korrekt?',
      options: ['S6Offz direkt auf OU delegieren', 'G_S6 in DL_StabPwReset verschachteln und DL_StabPwReset auf OU Stab für Passwortreset delegieren', 'DL_StabPwReset in G_S6 verschachteln', 'Domänenadmin-Rechte vergeben'],
      correct: 1,
      explanation: 'Richtig ist S6Offz → G_S6 → DL_StabPwReset → OU Stab → Passwortreset.',
    },

    {
      id: 'ad-delegation-open-wizard-guided-ui',
      type: 'guided-ui',
      title: 'Delegation Wizard öffnen',
      question: 'Öffne den Delegation Wizard für die OU Stab.',
      explanation: 'ADUC öffnen → OU Stab wählen → Rechtsklick → Objektverwaltung zuweisen.',
      intro: 'Für die OU Stab soll eine Aufgabe delegiert werden.',
      steps: [
        {
          id: 'ad-del-wizard-start',
          kind: 'navigation',
          screen: { title: 'ADUC', subtitle: 'Werkzeug starten' },
          instruction: 'Welches Snap-In brauchst du, um AD-Benutzer und OUs zu verwalten?',
          targets: [
            { id: 'aduc', label: 'Active Directory-Benutzer und -Computer', description: 'ADUC für Benutzer und OUs' },
            { id: 'dns', label: 'DNS-Manager', description: 'DNS-Zonen' },
            { id: 'events', label: 'Ereignisanzeige', description: 'Logs' },
          ],
          correctTarget: 'aduc',
          feedbackWrong: 'Für Active Directory-Benutzer und OUs brauchst du ADUC.',
          feedbackCorrect: 'Richtig: Active Directory-Benutzer und -Computer.',
        },
        {
          id: 'ad-del-wizard-ou',
          kind: 'decision',
          screen: { title: 'ADUC', subtitle: 'OU wählen' },
          instruction: 'Welche OU ist das Ziel der Delegation?',
          targets: [
            { id: 'domain', label: 'Domäne', description: 'Zu großer Scope' },
            { id: 'stab', label: 'Stab', description: 'Ziel-OU' },
            { id: 'users', label: 'Users-Container', description: 'Standardcontainer' },
          ],
          correctTarget: 'stab',
          feedbackWrong: 'Für dieses Szenario ist die OU Stab der richtige Scope.',
          feedbackCorrect: 'Richtig: OU Stab.',
        },
        {
          id: 'ad-del-wizard-open',
          kind: 'navigation',
          screen: { title: 'OU Stab', subtitle: 'Kontextmenü' },
          instruction: 'Wie startest du den Delegation Wizard?',
          targets: [
            { id: 'properties', label: 'Eigenschaften', description: 'Einstellungen' },
            { id: 'delete', label: 'Löschen', description: 'Entfernt die OU' },
            { id: 'delegate', label: 'Objektverwaltung zuweisen...', description: 'Delegation starten' },
          ],
          correctTarget: 'delegate',
          feedbackWrong: '"Objektverwaltung zuweisen..." startet den Delegation Wizard.',
          feedbackCorrect: 'Richtig: Objektverwaltung zuweisen.',
        },
      ],
    },

    {
      id: 'ad-delegation-group-guided-ui',
      type: 'guided-ui',
      title: 'Prinzipal im Wizard wählen',
      question: 'Trage im Delegation Wizard die richtige Gruppe ein.',
      explanation: 'Im Wizard Benutzer/Gruppen → Hinzufügen → DL_StabPwReset → Namen überprüfen → Weiter.',
      intro: 'Wähle die Berechtigungsgruppe, der das Recht zugewiesen werden soll.',
      steps: [
        {
          id: 'ad-del-group-principal',
          kind: 'decision',
          screen: { title: 'Delegation Wizard', subtitle: 'Benutzer oder Gruppen' },
          instruction: 'Welche Gruppe trägst du ein?',
          targets: [
            { id: 's6offz', label: 'S6Offz', description: 'Einzelbenutzer, schlecht skalierbar' },
            { id: 'g_s6', label: 'G_S6', description: 'Funktionsgruppe, nicht Berechtigungsgruppe' },
            { id: 'dl_stab', label: 'DL_StabPwReset', description: 'Berechtigungsgruppe' },
          ],
          correctTarget: 'dl_stab',
          feedbackWrong: 'DL_StabPwReset ist die Berechtigungsgruppe für den Passwortreset.',
          feedbackCorrect: 'Richtig: DL_StabPwReset.',
        },
        {
          id: 'ad-del-group-check',
          kind: 'navigation',
          screen: { title: 'Namen überprüfen', subtitle: 'Validierung' },
          instruction: 'Wie validierst du den eingegebenen Gruppennamen?',
          targets: [
            { id: 'check', label: 'Namen überprüfen', description: 'Überprüft den Namen' },
            { id: 'cancel', label: 'Abbrechen', description: 'Bricht ab' },
            { id: 'back', label: 'Zurück', description: 'Voriger Schritt' },
          ],
          correctTarget: 'check',
          feedbackWrong: 'Namen überprüfen validiert, dass die Gruppe existiert.',
          feedbackCorrect: 'Richtig: Namen überprüfen.',
        },
        {
          id: 'ad-del-group-next',
          kind: 'navigation',
          screen: { title: 'Prinzipal bestätigt', subtitle: 'Weiter' },
          instruction: 'Wie gehst du zum nächsten Schritt?',
          targets: [
            { id: 'next', label: 'Weiter', description: 'Nächster Schritt' },
            { id: 'finish', label: 'Fertigstellen', description: 'Zu früh, Aufgabe fehlt noch' },
            { id: 'cancel', label: 'Abbrechen', description: 'Abbruch' },
          ],
          correctTarget: 'next',
          feedbackWrong: 'Zuerst muss die Aufgabe gewählt werden, bevor man fertigstellen kann.',
          feedbackCorrect: 'Richtig: Weiter.',
        },
      ],
    },

    {
      id: 'ad-delegation-password-reset-guided-ui',
      type: 'guided-ui',
      title: 'Aufgabe Kennwort zurücksetzen wählen',
      question: 'Wähle im Wizard die richtige delegierte Aufgabe.',
      explanation: 'Delegierte Aufgabe auswählen → Kennwort zurücksetzen für Benutzerkonten → Weiter → Zusammenfassung prüfen → Fertigstellen.',
      intro: 'Nun entscheidest du, welche Aktion DL_StabPwReset auf der OU Stab ausführen darf.',
      steps: [
        {
          id: 'ad-del-task-select',
          kind: 'decision',
          screen: { title: 'Delegierte Aufgabe', subtitle: 'Aktion wählen' },
          instruction: 'Welche Aufgabe soll delegiert werden?',
          targets: [
            { id: 'create_delete', label: 'Benutzer erstellen und löschen', description: 'Zu viel Recht' },
            { id: 'password_reset', label: 'Kennwort zurücksetzen', description: 'Gewünschte Aufgabe' },
            { id: 'change_domain', label: 'Domänenname ändern', description: 'Nicht sinnvoll' },
          ],
          correctTarget: 'password_reset',
          feedbackWrong: 'Gewünscht ist das Zurücksetzen von Kennwörtern, nicht das Erstellen/Löschen von Benutzern.',
          feedbackCorrect: 'Richtig: Kennwort zurücksetzen.',
        },
        {
          id: 'ad-del-task-next',
          kind: 'navigation',
          screen: { title: 'Aufgabe bestätigt', subtitle: 'Weiter' },
          instruction: 'Wie forderst du die Zusammenfassung an?',
          targets: [
            { id: 'next', label: 'Weiter', description: 'Zur Zusammenfassung' },
            { id: 'back', label: 'Zurück', description: 'Prinzipal ändern' },
            { id: 'cancel', label: 'Abbrechen', description: 'Abbruch' },
          ],
          correctTarget: 'next',
          feedbackWrong: 'Weiter führt zur Zusammenfassung vor dem Fertigstellen.',
          feedbackCorrect: 'Richtig: Weiter.',
        },
        {
          id: 'ad-del-task-finish',
          kind: 'navigation',
          screen: { title: 'Zusammenfassung', subtitle: 'Fertigstellen' },
          instruction: 'Nach der Prüfung der Zusammenfassung: Wie schließt du den Wizard ab?',
          targets: [
            { id: 'back', label: 'Zurück', description: 'Nochmals ändern' },
            { id: 'finish', label: 'Fertigstellen', description: 'Delegation anwenden' },
            { id: 'cancel', label: 'Abbrechen', description: 'Abbruch' },
          ],
          correctTarget: 'finish',
          feedbackWrong: 'Fertigstellen wendet die Delegation an.',
          feedbackCorrect: 'Richtig: Fertigstellen.',
        },
      ],
    },

    {
      id: 'ad-delegation-troubleshooting-1',
      type: 'select-best',
      question: 'Fehler: S6Offz wurde direkt im Delegation Wizard eingetragen. Was ist administrativ besser?',
      options: ['S6Offz direkt belassen', 'DL_StabPwReset als delegierte Gruppe verwenden', 'G_S6 als Prinzipal eintragen', 'Domänenadmin eintragen'],
      correct: 1,
      explanation: 'Besser ist die delegierte DL-Gruppe, damit Personalwechsel einfach über Gruppenmitgliedschaft gelöst wird.',
    },
    {
      id: 'ad-delegation-troubleshooting-2',
      type: 'select-best',
      question: 'Fehler: Delegation wurde auf der Domain Root statt OU Stab gesetzt. Was ist das Problem?',
      options: ['Scope zu klein', 'Scope zu groß, Least Privilege verletzt', 'Wizard startet nicht', 'Passwortreset funktioniert besser'],
      correct: 1,
      explanation: 'Domain Root würde alle Benutzer in der Domäne umfassen. Der Scope ist zu groß.',
    },
    {
      id: 'ad-delegation-troubleshooting-3',
      type: 'select-best',
      question: 'Fehler: G_S6 wurde direkt auf die OU delegiert, DL_StabPwReset wurde übersprungen. Was fehlt?',
      options: ['Kein Fehler', 'Verschachtelung G_S6 → DL_StabPwReset → Delegation', 'Domänenadmin-Gruppe', 'Neue OU'],
      correct: 1,
      explanation: 'G_S6 ist die Funktionsgruppe. DL_StabPwReset ist die Berechtigungsgruppe, die delegiert wird.',
    },
    {
      id: 'ad-delegation-troubleshooting-4',
      type: 'select-best',
      question: 'Fehler: Richtige Gruppe, richtige OU, aber "Benutzer erstellen und löschen" statt "Kennwort zurücksetzen" delegiert. Was ist zu tun?',
      options: ['Delegation entfernen und korrekte Aufgabe wählen', 'S6Offz hinzufügen', 'Keine Änderung nötig', 'OU umbenennen'],
      correct: 0,
      explanation: 'Die delegierte Aufgabe muss auf "Kennwort zurücksetzen" korrigiert werden.',
    },
    {
      id: 'ad-delegation-troubleshooting-5',
      type: 'select-best',
      question: 'Fehler: Hilfsadmin sieht Benutzer in der MMC, kann aber Passwörter nicht zurücksetzen. Was fehlt?',
      options: ['Eine eingeschränktere MMC', 'Delegationsrecht auf der OU', 'Mehr RAM', 'Neuer DNS-Server'],
      correct: 1,
      explanation: 'Sichtbarkeit in der MMC bedeutet nicht, dass Berechtigungen vorhanden sind. Delegationsrecht fehlt.',
    },
  ];

  const quiz = [
    { question: 'Was bedeutet Delegation in AD?', options: ['Aufgaben gezielt an Rollen mit passenden Rechten vergeben', 'Jeder Administrator bekommt alle Rechte', 'Automatisches Löschen alter Konten', 'Lokale Passwortänderung durch Benutzer'], correct: 0, explanation: 'Delegation teilt Verwaltungsaufgaben gezielt auf.' },
    { question: 'Welche Kette wird für das Passwortreset-Szenario verwendet?', options: ['S6Offz → OU Stab', 'S6Offz → G_S6 → DL_StabPwReset → OU Stab', 'DL_StabPwReset → G_S6 → S6Offz', 'Domänenadmin → S6Offz'], correct: 1, explanation: 'S6Offz in G_S6, G_S6 in DL_StabPwReset, DL_StabPwReset auf OU Stab delegiert.' },
    { question: 'Auf welchem Scope wird das Recht delegiert?', options: ['Domäne', 'OU Stab', 'Domain Controller', 'Schema'], correct: 1, explanation: 'Scope ist die OU Stab.' },
    { question: 'Was ist der Unterschied zwischen eingeschränkter MMC und Delegation?', options: ['Beides ist dasselbe', 'MMC beschränkt UI, Delegation erteilt Rechte', 'Delegation ersetzt MMC', 'MMC erteilt Rechte'], correct: 1, explanation: 'MMC ist Oberfläche, Delegation ist Berechtigung.' },
    { question: 'Warum sollte man nicht direkt S6Offz delegieren?', options: ['Weil es einfacher ist', 'Weil bei Personalwechsel nur die Gruppenmitgliedschaft geändert werden muss', 'Weil S6Offz keine Rechte braucht', 'Weil der Wizard keinen Benutzer akzeptiert'], correct: 1, explanation: 'Gruppen sind wartbarer als direkte Benutzerberechtigungen.' },
    { question: 'Wie testet man eine delegiertes Passwortreset?', options: ['Domänenadmin-Rechte prüfen', 'Passwortreset innerhalb der OU Stab testen, außerhalb verweigert', 'Alle OUs testen', 'DNS-Server prüfen'], correct: 1, explanation: 'Verification prüft, dass das Recht nur im vorgesehenen Scope funktioniert.' },
  ];

  const summary = [
    'Delegation gibt gezielt Verwaltungsaufgaben an Rollen mit passenden Rechten.',
    'Least Privilege: nur die nötige Aufgabe im nötigen Scope.',
    'Gruppenmodell: S6Offz → G_S6 → DL_StabPwReset → OU Stab.',
    'Delegation findet in ADUC über „Objektverwaltung zuweisen...“ statt.',
    'Prinzipal ist die Berechtigungsgruppe DL_StabPwReset, nicht der Einzelbenutzer.',
    'Delegierte Aufgabe: „Kennwort zurücksetzen“ für Benutzerkonten.',
    'Delegation ist echte AD-Berechtigung; MMC ist nur Oberfläche.',
    'Verification testet, dass das Recht nur in OU Stab funktioniert.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
