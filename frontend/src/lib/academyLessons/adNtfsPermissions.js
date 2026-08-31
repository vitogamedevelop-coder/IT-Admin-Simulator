import { topicKey } from '../academyTopics.js';

export const AD_NTFS_PERMISSIONS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ntfs-permissions');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const twoGatesSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="40" y="25" fill="#c9d1d9" font-size="12" font-weight="bold">CLIENT01</text>
  <line x1="80" y1="40" x2="80" y2="70" stroke="#8b949e" stroke-width="2"/>
  <rect x="30" y="70" width="100" height="40" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="95" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Share Permission</text>
  <line x1="80" y1="110" x2="80" y2="140" stroke="#8b949e" stroke-width="2"/>
  <rect x="30" y="140" width="100" height="40" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="80" y="165" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">NTFS Permission</text>
  <line x1="130" y1="160" x2="180" y2="160" stroke="#00f0ff" stroke-width="2" stroke-dasharray="4"/>
  <rect x="190" y="120" width="100" height="70" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="2"/>
  <text x="240" y="148" text-anchor="middle" fill="#c9d1d9" font-size="10">Datei</text>
  <text x="240" y="170" text-anchor="middle" fill="#c9d1d9" font-size="10">beide Tore</text>
</svg>`;

const localVsNetworkSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="25" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Lokaler vs Netzwerkzugriff</text>
  <rect x="20" y="50" width="120" height="100" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="80" y="75" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">LOCAL</text>
  <text x="80" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9">D:\\Freigaben\\Befehle</text>
  <text x="80" y="115" text-anchor="middle" fill="#c9d1d9" font-size="9">nur NTFS</text>
  <text x="80" y="135" text-anchor="middle" fill="#c9d1d9" font-size="9">Share irrelevant</text>

  <rect x="180" y="50" width="120" height="100" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="240" y="75" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">NETWORK</text>
  <text x="240" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9">\\FILE01\\Befehle</text>
  <text x="240" y="115" text-anchor="middle" fill="#c9d1d9" font-size="9">Share + NTFS</text>
  <text x="240" y="135" text-anchor="middle" fill="#c9d1d9" font-size="9">beide relevant</text>
</svg>`;

const inheritanceSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="100" y="20" width="120" height="50" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="40" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">D:\\Freigaben</text>
  <text x="160" y="55" text-anchor="middle" fill="#c9d1d9" font-size="9">Administrators: Vollzugriff</text>
  <line x1="160" y1="70" x2="160" y2="90" stroke="#8b949e" stroke-width="1" stroke-dasharray="3"/>
  <text x="170" y="85" fill="#8b949e" font-size="9">Vererbung</text>
  <rect x="100" y="90" width="120" height="50" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="110" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Befehle</text>
  <text x="160" y="128" text-anchor="middle" fill="#c9d1d9" font-size="9">geerbt: Administrators: Vollzugriff</text>
</svg>`;

export function buildAdNtfsPermissionsLesson() {
  const title = 'NTFS- & Freigabeberechtigungen';

  const explanations = [
    explanation('adn-einstieg', 'Warum darf Lisa nur lesen?', 'classic', [
      { type: 'text', content: 'Lisa kann \\FILE01\\Befehle öffnen, aber keine Datei ändern. Die Freigabe ist erreichbar, doch etwas begrenzt ihre Aktionen. Es gibt zwei Berechtigungsebenen: Share Permissions und NTFS.' },
      { type: 'question', question: 'Lisa kann eine Datei in \\FILE01\\Befehle öffnen, aber nicht bearbeiten. Woran liegt das?', options: ['Die Freigabe ist kaputt', 'Eine der Berechtigungsebenen erlaubt nur Lesen', 'Der Client ist ausgeschaltet'], correct: 1, explanation: 'Share und NTFS können den Zugriff unterschiedlich erlauben; die effektive Berechtigung begrenzt das Ergebnis.' },
    ]),

    explanation('adn-share-definition', 'Share Permissions', 'classic', [
      { type: 'text', content: 'Share Permissions wirken, wenn ein Client über die Netzwerkfreigabe zugreift. Die wichtigsten Ebenen sind Read, Change und Full Control.' },
      { type: 'text', content: 'Read erlaubt das Ansehen. Change erlaubt Lesen und Ändern. Full Control ist die höchste Ebene auf der Freigabe.' },
      { type: 'question', question: 'Wann wirken Share Permissions?', options: ['Immer', 'Nur beim lokalen Zugriff', 'Beim Zugriff über die Netzwerkfreigabe'], correct: 2, explanation: 'Share Permissions greifen beim Netzwerkzugriff über die Freigabe.' },
    ]),

    explanation('adn-ntfs-definition', 'NTFS-Berechtigungen', 'classic', [
      { type: 'text', content: 'NTFS-Berechtigungen gelten auf Dateien und Ordnern des NTFS-Dateisystems. Sie regeln, was eine Identität mit dem Objekt tun darf, unabhängig davon, ob der Zugriff lokal oder über das Netzwerk erfolgt.' },
      { type: 'question', question: 'Wo gelten NTFS-Berechtigungen?', options: ['Nur lokal', 'Auf Dateien und Ordnern, egal ob lokal oder über Netzwerk', 'Nur auf Freigaben'], correct: 1, explanation: 'NTFS wirkt auf dem Dateisystemobjekt selbst, sowohl lokal als auch bei Netzwerkzugriff.' },
    ]),

    explanation('adn-principal', 'Prinzipal', 'classic', [
      { type: 'text', content: 'Ein Prinzipal ist eine Sicherheitsidentität, der Berechtigungen zugewiesen werden können. Das sind typischerweise Benutzer, Gruppen oder Computerkonten.' },
      { type: 'question', question: 'Was ist ein Prinzipal?', options: ['Ein Protokoll', 'Eine Sicherheitsidentität für Berechtigungen', 'Eine Freigabe'], correct: 1, explanation: 'Ein Prinzipal ist ein Benutzer, eine Gruppe oder ein Computerkonto, das Berechtigungen erhalten kann.' },
    ]),

    explanation('adn-user-vs-group', 'Gruppe statt Einzeluser', 'classic', [
      { type: 'text', content: 'Berechtigungen an Gruppen zu vergegen skaliert besser als die Vergabe an einzelne Benutzer. Wer die Gruppenzugehörigkeit ändert, beeinflusst die Rechte ohne Ressourcen neu verrechten zu müssen. Hier geht es um die Grundidee, nicht um AGDLP-Scopes, die im ad-permissions-Block behandelt werden.' },
      { type: 'question', question: 'Warum sind Gruppen für Berechtigungen besser skalierbar als Einzelbenutzer?', options: ['Weil sie schneller sind', 'Weil Mitgliedschaftsänderungen die Rechte über Gruppen steuern', 'Weil Benutzer keine Rechte erhalten können'], correct: 1, explanation: 'Gruppen vereinfachen die Verwaltung; man ändert nur die Mitgliedschaft.' },
    ]),

    explanation('adn-ntfs-levels', 'NTFS-Standardrechte', 'classic', [
      { type: 'text', content: 'Die wichtigsten NTFS-Standardrechte: Lesen zeigt Inhalte an; Schreiben erstellt oder ändert Daten; Lesen & Ausführen erlaubt Lesen plus Ausführen von Programmen/Skripten; Ändern erlaubt Lesen, Schreiben, Löschen und Umbenennen; Vollzugriff beinhaltet zudem Berechtigungsverwaltung.' },
      { type: 'question', question: 'Was unterscheidet Schreiben von Ändern?', options: ['Nichts', 'Ändern erlaubt zusätzlich Löschen/Umbenennen', 'Schreiben erlaubt Vollzugriff'], correct: 1, explanation: 'Ändern umfasst mehr als Schreiben, etwa Löschen und Umbenennen.' },
    ]),

    explanation('adn-share-levels', 'Share-Permission-Stufen', 'classic', [
      { type: 'text', content: 'Read erlaubt Anzeigen; Change erlaubt Lesen und Verändern; Full Control ist die höchste Stufe auf der Freigabe.' },
      { type: 'question', question: 'Welche Share-Permission erlaubt Lesen und Ändern?', options: ['Read', 'Change', 'Full Control'], correct: 1, explanation: 'Change erlaubt Lesen und Ändern.' },
    ]),

    explanation('adn-local-vs-network', 'Lokal vs Netzwerk', 'classic', [
      { type: 'text', content: 'Greift man lokal auf FILE01 auf D:\\Freigaben\\Befehle zu, spielen Share Permissions keine Rolle. NTFS gilt trotzdem. Über das Netzwerk \\FILE01\\Befehle müssen sowohl Share Permissions als auch NTFS den Zugriff erlauben.' },
      { type: 'diagram', content: localVsNetworkSvg },
      { type: 'question', question: 'Welche Berechtigung ist beim lokalen Zugriff irrelevant?', options: ['NTFS', 'Share Permissions', 'Beide'], correct: 1, explanation: 'Lokal zählt NTFS, Share Permissions greifen nur über die Netzwerkfreigabe.' },
    ]),

    explanation('adn-two-gates', 'Zwei Tore', 'classic', [
      { type: 'text', content: 'Beim Netzwerkzugriff passiert man zwei Tore: Share Permission und NTFS Permission. Beide müssen die Aktion erlauben. Das Visual zeigt: CLIENT01 geht durch Share, dann NTFS, und erreicht erst dann die Datei.' },
      { type: 'diagram', content: twoGatesSvg },
      { type: 'question', question: 'Wie viele Berechtigungsebenen wirken beim Zugriff über eine Freigabe?', options: ['Eine', 'Zwei', 'Drei'], correct: 1, explanation: 'Share Permission und NTFS Permission wirken beide.' },
    ]),

    explanation('adn-effective', 'Effektive Berechtigung', 'classic', [
      { type: 'text', content: 'Die effektive Berechtigung ist das, was der Benutzer am Ende tatsächlich darf. Bei Netzwerkzugriff bestimmt die restriktivere wirksame Ebene das Ergebnis.' },
      { type: 'text', content: 'Beispiele: Share Read und NTFS Ändern ergibt effektiv Read. Share Full Control und NTFS Read ergibt ebenfalls effektiv Read. Share Change und NTFS Ändern ergibt Ändern.' },
      { type: 'question', question: 'Share = Read, NTFS = Ändern. Was ist effektiv über Netzwerk?', options: ['Ändern', 'Read', 'Vollzugriff'], correct: 1, explanation: 'Share Read ist restriktiver; daher bleibt es bei Read.' },
    ]),

    explanation('adn-source-correction', 'Kein Share schlägt NTFS', 'classic', [
      { type: 'text', content: 'Manche Quellen sagen vereinfacht: Freigaberechte schlagen NTFS-Rechte. Das ist irreführend. Richtig ist: Beim Netzwerkzugriff wirken beide zusammen; die effektive Berechtigung wird durch die restriktivere wirksame Ebene begrenzt.' },
      { type: 'question', question: 'Wie verhalten sich Share und NTFS beim Netzwerkzugriff?', options: ['Share schlägt NTFS immer', 'Beide wirken zusammen; die restriktivere Ebene begrenzt', 'NTFS ist nie relevant'], correct: 1, explanation: 'Es gibt zwei Ebenen; die restriktivere wirksame Berechtigung begrenzt das Ergebnis.' },
    ]),

    explanation('adn-nexus-standard', 'NEXUS-Standardmodell', 'classic', [
      { type: 'text', content: 'Für die Übungswelt verwenden wir ein einfaches Verwaltungsmodell: Share Permissions sind breit genug für die vorgesehene Gruppe, die granulare Kontrolle passiert über NTFS. Das ist eine Designentscheidung, nicht die einzige technisch richtige Methode.' },
      { type: 'question', question: 'Wozu dient in diesem Modell die granulare Steuerung?', options: ['Share Permissions', 'NTFS-Berechtigungen', 'DNS'], correct: 1, explanation: 'NTFS erlaubt die detaillierte Steuerung, während Share Permissions das Netzwerktor öffnen.' },
    ]),

    explanation('adn-everyone-authusers', 'Everyone & Authenticated Users', 'classic', [
      { type: 'text', content: 'Everyone und Authenticated Users sind breite Gruppen. Sie können in bestimmten Szenarien sinnvoll sein, dürfen aber nicht blind als Universal-Best-Practice eingesetzt werden. In NEXUS arbeiten wir bevorzugt mit klar definierten Gruppen wie Vertrieb, um den Zugriff bewusst zu begrenzen.' },
      { type: 'question', question: 'Warum sollte man Everyone/Authenticated Users nicht pauschal verwenden?', options: ['Weil sie kein AD-Prinzipal sind', 'Weil ihr Scope sehr breit ist und bewusst gewählt werden muss', 'Weil technisch unmöglich'], correct: 1, explanation: 'Breite Gruppen erlauben vielen Benutzern Zugriff und sollten bewusst eingesetzt werden.' },
    ]),

    explanation('adn-inheritance', 'Vererbung', 'classic', [
      { type: 'text', content: 'NTFS-Berechtigungen können von einem übergeordneten Ordner auf untergeordnete Ordner und Dateien vererbt werden. Das erleichtert zentrale Verwaltung.' },
      { type: 'diagram', content: inheritanceSvg },
      { type: 'question', question: 'Was ist der Vorteil der Vererbung?', options: ['Manuelle ACLs an jedem Objekt', 'Zentrale Verwaltung übergeordneter Berechtigungen', 'Freigaben werden automatisch erstellt'], correct: 1, explanation: 'Vererbung sorgt dafür, dass Berechtigungen an untergeordnete Objekte weitergegeben werden.' },
    ]),

    explanation('adn-disable-inheritance', 'Vererbung deaktivieren', 'classic', [
      { type: 'text', content: 'Wenn man Vererbung deaktiviert, kann man geerbte Einträge konvertieren oder entfernen. Convert macht sie zu expliziten Einträgen; Remove löscht sie. Remove kann Zugriffe auch für Administratoren oder Systemkonten verändern, daher muss man zuerst prüfen, welche Berechtigungen tatsächlich benötigt werden.' },
      { type: 'question', question: 'Was passiert bei Remove bei deaktivierter Vererbung?', options: ['Geerbte Einträge bleiben', 'Geerbte Einträge werden entfernt', 'Neue Rechte werden automatisch gesetzt'], correct: 1, explanation: 'Remove entfernt die geerbten Einträge. Das kann Folgen für den Zugriff haben.' },
    ]),

    explanation('adn-convert-remove', 'Convert vs Remove', 'classic', [
      { type: 'text', content: 'Convert: Geerbte Berechtigungen werden zu expliziten Einträgen auf diesem Ordner. Remove: Geerbte Berechtigungen werden gelöscht. Convert ist meist sicherer, weil bestehende Rechte erhalten bleiben und gezielt weiter angepasst werden können.' },
      { type: 'question', question: 'Welche Option erhält die bisherigen Berechtigungen als explizite Einträge?', options: ['Remove', 'Convert', 'Beide'], correct: 1, explanation: 'Convert übernimmt geerbte Einträge als eigene Einträge.' },
    ]),

    explanation('adn-deny', 'Deny kurz erwähnt', 'classic', [
      { type: 'text', content: 'Ein explizites Deny kann Zugriff einschränken und sollte bewusst eingesetzt werden. Für diesen Block vertiefen wir keine komplexe Allow/Deny-Vererbungslogik, sondern merken: Deny ist ein mächtiges Werkzeug, das mit Bedacht verwendet werden muss.' },
      { type: 'question', question: 'Was sollte man bei der Verwendung von Deny beachten?', options: ['Automatisch anwenden', 'Bewusst einsetzen, weil es Zugriff stark einschränkt', 'Nie verwenden'], correct: 1, explanation: 'Deny ist ein starkes Werkzeug und sollte gezielt eingesetzt werden.' },
    ]),

    explanation('adn-no-home-profile', 'Keine Home/Profile ACLs', 'classic', [
      { type: 'text', content: 'Dieser Block behandelt keine Spezialkonfigurationen für Home$ oder Profile$ Freigaben, keinen Creator Owner und keine automatischen Benutzerordner. Diese Sonderfälle folgen später.' },
      { type: 'question', question: 'Was wird in diesem Block NICHT behandelt?', options: ['Share Permissions', 'NTFS-Rechte', 'Home-/Profil-ACL-Sonderfälle'], correct: 2, explanation: 'Home- und Profilfreigaben sowie Spezial-ACLs sind ein eigener späterer Block.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-ntfs-permission-guided-ui',
      type: 'guided-ui',
      title: 'NTFS-Berechtigung für Vertrieb setzen',
      question: 'Gib der Gruppe Vertrieb das Recht, den Ordner Befehle lesen und ändern zu dürfen.',
      explanation: 'Ordner Befehle → Eigenschaften → Security → Edit → Add → Principal Vertrieb → NTFS-Recht Ändern.',
      intro: 'Lisa sollte Mitglied der Gruppe Vertrieb sein. Die Gruppe erhält die Berechtigung, nicht Lisa direkt.',
      steps: [
        {
          id: 'adn-ntfs-open',
          kind: 'navigation',
          screen: { title: 'Befehle Properties', subtitle: 'Reiter wählen' },
          instruction: 'In welchem Reiter setzt man NTFS-Berechtigungen?',
          targets: [
            { id: 'general', label: 'General' },
            { id: 'security', label: 'Security', description: 'NTFS-Berechtigungen' },
            { id: 'sharing', label: 'Sharing', description: 'Share Permissions' },
          ],
          correctTarget: 'security',
          feedbackWrong: 'NTFS-Berechtigungen liegen im Security- /Sicherheitsreiter.',
          feedbackCorrect: 'Richtig: Security.',
        },
        {
          id: 'adn-ntfs-edit',
          kind: 'navigation',
          screen: { title: 'Security', subtitle: 'Berechtigungen bearbeiten' },
          instruction: 'Wie öffnest du den Dialog, um einen neuen Prinzipal hinzuzufügen?',
          targets: [
            { id: 'edit', label: 'Edit', description: 'Berechtigungen bearbeiten' },
            { id: 'advanced', label: 'Advanced', description: 'Erweiterte Berechtigungen' },
            { id: 'ok', label: 'OK', description: 'Schließen' },
          ],
          correctTarget: 'edit',
          feedbackWrong: 'Edit öffnet die Bearbeitung der Prinzipalen.',
          feedbackCorrect: 'Richtig: Edit.',
        },
        {
          id: 'adn-ntfs-add',
          kind: 'navigation',
          screen: { title: 'Permissions', subtitle: 'Prinzipal hinzufügen' },
          instruction: 'Wie fügst du einen Prinzipal hinzu?',
          targets: [
            { id: 'add', label: 'Add', description: 'Neuer Prinzipal' },
            { id: 'remove', label: 'Remove', description: 'Entfernen' },
            { id: 'edit-user', label: 'Edit...', description: 'Bearbeiten' },
          ],
          correctTarget: 'add',
          feedbackWrong: 'Add fügt einen neuen Prinzipal hinzu.',
          feedbackCorrect: 'Richtig: Add.',
        },
        {
          id: 'adn-ntfs-principal',
          kind: 'decision',
          screen: { title: 'Select Users or Groups', subtitle: 'Prinzipal' },
          instruction: 'Welchem Objekt gibst du die Berechtigung, wenn die ganze Abteilung betroffen ist?',
          targets: [
            { id: 'lisa', label: 'lisa.berger', description: 'Einzelbenutzer, schlecht skalierbar' },
            { id: 'vertrieb', label: 'Vertrieb', description: 'Gruppe für die Abteilung' },
            { id: 'everyone', label: 'Everyone', description: 'Sehr breite Gruppe' },
          ],
          correctTarget: 'vertrieb',
          feedbackWrong: 'Für eine ganze Abteilung ist die Gruppe Vertrieb skalierbarer als eine einzelne Benutzerin oder Everyone.',
          feedbackCorrect: 'Richtig: Vertrieb wird als Gruppe berechtigt.',
        },
        {
          id: 'adn-ntfs-level',
          kind: 'decision',
          screen: { title: 'Permissions for Vertrieb', subtitle: 'NTFS-Recht' },
          instruction: 'Die Gruppe soll lesen und ändern dürfen, aber keine Berechtigungen verwalten.',
          targets: [
            { id: 'read', label: 'Read', description: 'Nur Lesen' },
            { id: 'modify', label: 'Modify', description: 'Lesen, ändern, löschen' },
            { id: 'full', label: 'Full control', description: 'Inklusive Berechtigungsverwaltung' },
          ],
          correctTarget: 'modify',
          feedbackWrong: 'Modify erlaubt Lesen und Ändern ohne Berechtigungsverwaltung; Full control wäre zu viel.',
          feedbackCorrect: 'Richtig: Modify.',
        },
      ],
    },

    {
      id: 'ad-share-permission-guided-ui',
      type: 'guided-ui',
      title: 'Share Permission für Vertrieb setzen',
      question: 'Die Gruppe Vertrieb soll über das Netzwerk auf die Freigabe zugreifen können.',
      explanation: 'Freigabe Befehle → Sharing → Advanced Sharing → Permissions → Add → Vertrieb → mindestens Change.',
      intro: 'NTFS erlaubt Ändern. Für den Netzwerkzugriff muss auch die Share Permission passen.',
      steps: [
        {
          id: 'adn-share-open',
          kind: 'navigation',
          screen: { title: 'Befehle Properties', subtitle: 'Share-Reiter' },
          instruction: 'In welchem Bereich findest du die Share Permissions?',
          targets: [
            { id: 'security', label: 'Security', description: 'NTFS' },
            { id: 'sharing', label: 'Sharing', description: 'Share Permissions' },
            { id: 'general', label: 'General' },
          ],
          correctTarget: 'sharing',
          feedbackWrong: 'Share Permissions liegen im Sharing-Reiter.',
          feedbackCorrect: 'Richtig: Sharing.',
        },
        {
          id: 'adn-share-advanced',
          kind: 'navigation',
          screen: { title: 'Sharing', subtitle: 'Erweiterte Freigabe' },
          instruction: 'Wie bearbeitest du die eigentlichen Freigabeberechtigungen?',
          targets: [
            { id: 'advanced-sharing', label: 'Advanced Sharing', description: 'Freigabeberechtigungen bearbeiten' },
            { id: 'share', label: 'Share', description: 'Freigabename ändern' },
            { id: 'offline', label: 'Offline Settings', description: 'Cache-Verhalten' },
          ],
          correctTarget: 'advanced-sharing',
          feedbackWrong: 'Advanced Sharing führt zu den Berechtigungen der Freigabe.',
          feedbackCorrect: 'Richtig: Advanced Sharing.',
        },
        {
          id: 'adn-share-add',
          kind: 'navigation',
          screen: { title: 'Share Permissions', subtitle: 'Prinzipal hinzufügen' },
          instruction: 'Wie fügst du einen Prinzipal hinzu?',
          targets: [
            { id: 'add', label: 'Add', description: 'Neuer Prinzipal' },
            { id: 'remove', label: 'Remove' },
            { id: 'deny', label: 'Deny' },
          ],
          correctTarget: 'add',
          feedbackWrong: 'Add fügt einen Prinzipal hinzu.',
          feedbackCorrect: 'Richtig: Add.',
        },
        {
          id: 'adn-share-principal',
          kind: 'decision',
          screen: { title: 'Select Users or Groups', subtitle: 'Prinzipal' },
          instruction: 'Welche Gruppe soll berechtigt werden?',
          targets: [
            { id: 'lisa', label: 'lisa.berger' },
            { id: 'vertrieb', label: 'Vertrieb' },
            { id: 'authenticated', label: 'Authenticated Users', description: 'Sehr breiter Scope' },
          ],
          correctTarget: 'vertrieb',
          feedbackWrong: 'Vertrieb ist die geplante Gruppe. Authenticated Users ist zu breit für die NEXUS-Übung.',
          feedbackCorrect: 'Richtig: Vertrieb.',
        },
        {
          id: 'adn-share-level',
          kind: 'decision',
          screen: { title: 'Permissions for Vertrieb', subtitle: 'Share-Permission' },
          instruction: 'Welche Share-Permission passt, wenn NTFS Modify erlaubt und die Gruppe Lesen+Ändern braucht?',
          targets: [
            { id: 'read', label: 'Read', description: 'Würde auf Read begrenzen' },
            { id: 'change', label: 'Change', description: 'Lesen und Ändern' },
            { id: 'full', label: 'Full Control', description: 'Öffnet alle Freigaberechte' },
          ],
          correctTarget: 'change',
          feedbackWrong: 'Read würde auf Lesen begrenzt; Change passt für Lesen+Ändern.',
          feedbackCorrect: 'Richtig: Change. NTFS Modify bleibt limitierend, also effektiv Ändern.',
        },
      ],
    },

    {
      id: 'ad-effective-permission-guided-ui',
      type: 'guided-ui',
      title: 'Effektive Berechtigung bestimmen',
      question: 'Welche Aktionen darf Vertrieb am Ende über das Netzwerk ausführen?',
      explanation: 'Share Change und NTFS Modify ergeben effektiv Ändern. Share Read und NTFS Modify ergibt effektiv Read. Share Full Control und NTFS Read ergibt effektiv Read.',
      intro: 'Zwei Tore, ein Ergebnis: die restriktivere wirksame Ebene gewinnt.',
      steps: [
        {
          id: 'adn-eff-share',
          kind: 'decision',
          screen: { title: 'Share Permission', subtitle: 'Freigabeebene' },
          instruction: 'Share Permission ist auf Read eingestellt. NTFS ist Modify. Was ist effektiv über Netzwerk?',
          targets: [
            { id: 'modify', label: 'Ändern', description: 'NTFS erlaubt Ändern' },
            { id: 'read', label: 'Read', description: 'Share ist restriktiver' },
            { id: 'full', label: 'Full Control', description: 'Höchste Stufe' },
          ],
          correctTarget: 'read',
          feedbackWrong: 'Share Read ist die restriktivere Ebene. Sie begrenzt das Ergebnis.',
          feedbackCorrect: 'Richtig: effektiv Read, weil Share Read restriktiver ist.',
        },
        {
          id: 'adn-eff-ntfs',
          kind: 'decision',
          screen: { title: 'NTFS Permission', subtitle: 'Dateisystemebene' },
          instruction: 'Share Permission ist Full Control. NTFS ist Read. Was ist effektiv über Netzwerk?',
          targets: [
            { id: 'read', label: 'Read', description: 'NTFS ist restriktiver' },
            { id: 'full', label: 'Full Control', description: 'Share ist offen' },
            { id: 'modify', label: 'Ändern', description: 'NTFS erlaubt mehr' },
          ],
          correctTarget: 'read',
          feedbackWrong: 'NTFS Read ist restriktiver; Full Control auf der Freigabe hilft nicht.',
          feedbackCorrect: 'Richtig: effektiv Read, weil NTFS Read restriktiver ist.',
        },
        {
          id: 'adn-eff-both',
          kind: 'decision',
          screen: { title: 'Beide passen', subtitle: 'Kombination' },
          instruction: 'Share ist Change und NTFS ist Modify. Was ist effektiv?',
          targets: [
            { id: 'read', label: 'Read', description: 'Zu wenig' },
            { id: 'modify', label: 'Ändern', description: 'Beide erlauben Ändern' },
            { id: 'full', label: 'Full Control', description: 'Keine Ebene erlaubt Vollzugriff' },
          ],
          correctTarget: 'modify',
          feedbackWrong: 'Beide Ebenen erlauben Ändern; effektiv ist also Modify.',
          feedbackCorrect: 'Richtig: beide Ebenen erlauben Ändern, effektiv Ändern.',
        },
      ],
    },

    {
      id: 'ad-ntfs-inheritance-guided-ui',
      type: 'guided-ui',
      title: 'Vererbung für Geheim deaktivieren',
      question: 'Der Ordner Geheim soll die Rechte von D:\\Freigaben nicht erben.',
      explanation: 'Geheim → Eigenschaften → Security → Advanced → Disable inheritance → Wahl zwischen Convert und Remove.',
      intro: 'Geheim braucht eigene Rechte. Vorsicht: Remove löscht geerbte Einträge und kann Zugriff entziehen.',
      steps: [
        {
          id: 'adn-inh-advanced',
          kind: 'navigation',
          screen: { title: 'Geheim Properties', subtitle: 'Advanced' },
          instruction: 'Wie erreichst du die Vererbungseinstellungen?',
          targets: [
            { id: 'edit', label: 'Edit' },
            { id: 'advanced', label: 'Advanced', description: 'Vererbung und Spezialrechte' },
            { id: 'add', label: 'Add' },
          ],
          correctTarget: 'advanced',
          feedbackWrong: 'Advanced enthält die Vererbungseinstellungen.',
          feedbackCorrect: 'Richtig: Advanced.',
        },
        {
          id: 'adn-inh-disable',
          kind: 'navigation',
          screen: { title: 'Advanced Security Settings', subtitle: 'Vererbung' },
          instruction: 'Wie deaktivierst du die Vererbung?',
          targets: [
            { id: 'enable-inheritance', label: 'Enable inheritance' },
            { id: 'disable-inheritance', label: 'Disable inheritance', description: 'Vererbung abschalten' },
            { id: 'replace-aces', label: 'Replace all child permissions' },
          ],
          correctTarget: 'disable-inheritance',
          feedbackWrong: 'Disable inheritance deaktiviert die Vererbung.',
          feedbackCorrect: 'Richtig: Disable inheritance.',
        },
        {
          id: 'adn-inh-choice',
          kind: 'decision',
          screen: { title: 'Block Inheritance', subtitle: 'Option' },
          instruction: 'Welche Option ist meist sicherer, um bestehende Rechte zunächst zu erhalten?',
          targets: [
            { id: 'convert', label: 'Convert inherited permissions into explicit permissions on this object', description: 'Einträge werden explizit übernommen' },
            { id: 'remove', label: 'Remove all inherited permissions from this object', description: 'Einträge werden gelöscht' },
            { id: 'cancel', label: 'Cancel', description: 'Keine Änderung' },
          ],
          correctTarget: 'convert',
          feedbackWrong: 'Remove löscht alle geerbten Berechtigungen und kann Zugriff entziehen. Convert übernimmt sie zunächst explizit.',
          feedbackCorrect: 'Richtig: Convert übernimmt die Einträge als eigene.',
        },
      ],
    },

    {
      id: 'adn-local-vs-network-select',
      type: 'select-best',
      title: 'Lokal oder Netzwerk?',
      question: 'Ein Benutzer greift lokal auf FILE01 auf D:\\Freigaben\\Befehle zu. Welche Berechtigungsart ist irrelevant?',
      options: [
        'NTFS',
        'Share Permissions',
        'Beide',
      ],
      correct: 1,
      explanation: 'Lokaler Zugriff prüft NTFS, Share Permissions spielen dabei keine Rolle.',
    },

    {
      id: 'adn-effective-select-1',
      type: 'select-best',
      title: 'Effektive Berechtigung 1',
      question: 'Share Permission = Read, NTFS = Modify. Was ist effektiv über Netzwerk?',
      options: [
        'Modify',
        'Read',
        'Full Control',
      ],
      correct: 1,
      explanation: 'Share Read ist restriktiver, daher bleibt es bei Read.',
    },

    {
      id: 'adn-effective-select-2',
      type: 'select-best',
      title: 'Effektive Berechtigung 2',
      question: 'Share Permission = Full Control, NTFS = Read. Was ist effektiv über Netzwerk?',
      options: [
        'Full Control',
        'Read',
        'Modify',
      ],
      correct: 1,
      explanation: 'NTFS Read ist restriktiver; Full Control auf der Freigabe erweitert es nicht.',
    },

    {
      id: 'adn-ntfs-levels-select',
      type: 'select-best',
      title: 'NTFS-Recht wählen',
      question: 'Eine Gruppe soll Dateien lesen, ändern und löschen, aber keine Berechtigungen verwalten. Welches NTFS-Recht passt?',
      options: [
        'Read',
        'Modify',
        'Full Control',
      ],
      correct: 1,
      explanation: 'Modify erlaubt Lesen, Ändern und Löschen, aber keine Berechtigungsverwaltung.',
    },

    {
      id: 'adn-convert-vs-remove-select',
      type: 'select-best',
      title: 'Convert oder Remove?',
      question: 'Du deaktivierst die Vererbung eines Ordners und willst die bisherigen Berechtigungen zunächst behalten. Was wählst du?',
      options: [
        'Remove',
        'Convert',
        'Cancel',
      ],
      correct: 1,
      explanation: 'Convert macht geerbte Einträge zu expliziten Einträgen und behält sie.',
    },

    {
      id: 'adn-principal-select',
      type: 'select-best',
      title: 'Prinzipal wählen',
      question: 'Die Abteilung Vertrieb soll auf Befehle zugreifen. Welcher Prinzipal ist skalierbarer als eine einzelne Benutzerin?',
      options: [
        'lisa.berger',
        'Vertrieb',
        'Everyone',
      ],
      correct: 1,
      explanation: 'Die Gruppe Vertrieb erlaubt zentrale Steuerung über die Mitgliedschaft.',
    },
  ];

  const quiz = [
    { question: 'Welche Berechtigungen wirken beim Zugriff über \\FILE01\\Befehle?', options: ['Nur NTFS', 'Nur Share', 'Share und NTFS'], correct: 2, explanation: 'Beim Netzwerkzugriff müssen Share Permission und NTFS Permission passen.' },
    { question: 'Was ist die effektive Berechtigung, wenn Share Read und NTFS Modify wirken?', options: ['Modify', 'Read', 'Full Control'], correct: 1, explanation: 'Share Read ist restriktiver; das Ergebnis ist Read.' },
    { question: 'Welche Ebenen sind beim lokalen Zugriff auf D:\\Freigaben\\Befehle relevant?', options: ['Share', 'NTFS', 'Beide'], correct: 1, explanation: 'Lokal zählen NTFS-Berechtigungen; Share Permissions greifen nicht.' },
    { question: 'Was bedeutet Modify?', options: ['Nur Lesen', 'Lesen, ändern, löschen, aber keine Berechtigungsverwaltung', 'Alles inklusive Berechtigungsverwaltung'], correct: 1, explanation: 'Modify umfasst Lesen, Ändern, Löschen, aber keine Rechteverwaltung.' },
    { question: 'Warum sind Gruppen für Berechtigungen besser als viele Einzelbenutzer?', options: ['Weil sie schneller sind', 'Weil Mitgliedschaftsänderungen die Rechte steuern', 'Weil Benutzer keine Rechte haben'], correct: 1, explanation: 'Gruppen ermöglichen zentrale Verwaltung über Mitgliedschaften.' },
    { question: 'Was passiert bei Convert beim Deaktivieren der Vererbung?', options: ['Geerbte Einträge werden entfernt', 'Geerbte Einträge werden explizit übernommen', 'Nichts'], correct: 1, explanation: 'Convert übernimmt geerbte Berechtigungen als eigene Einträge.' },
    { question: 'Wie verhalten sich Share und NTFS?', options: ['Share schlägt immer NTFS', 'Beide wirken zusammen, restriktivere Ebene begrenzt', 'NTFS ist nie relevant'], correct: 1, explanation: 'Beide wirken zusammen; die restriktivere wirksame Ebene begrenzt.' },
    { question: 'Was ist ein Prinzipal?', options: ['Eine Freigabe', 'Eine Sicherheitsidentität, der Berechtigungen zugewiesen werden', 'Ein Protokoll'], correct: 1, explanation: 'Ein Prinzipal ist Benutzer, Gruppe oder Computerkonto.' },
  ];

  const summary = [
    'Beim lokalen Zugriff sind NTFS-Berechtigungen relevant.',
    'Beim Netzwerkzugriff wirken Share- und NTFS-Berechtigungen zusammen.',
    'Die effektive Berechtigung wird durch die restriktivere wirksame Ebene begrenzt.',
    'NTFS-Standardrechte: Read, Write, Read & Execute, Modify, Full Control.',
    'Share-Permission-Stufen: Read, Change, Full Control.',
    'Berechtigungen sollten möglichst über Gruppen vergeben werden.',
    'Vererbung erleichtert die Verwaltung, muss aber bewusst verändert werden.',
    'Convert übernimmt geerbte Einträge, Remove löscht sie.',
    'Everyone/Authenticated Users sind breit und sollten bewusst eingesetzt werden.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
