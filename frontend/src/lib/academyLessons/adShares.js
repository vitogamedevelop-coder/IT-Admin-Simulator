import { topicKey } from '../academyTopics.js';

export const AD_SHARES_TOPIC_KEY = topicKey('active-directory-virtualbox', 'shares');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const localToShareSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="120" height="140" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="2"/>
  <text x="80" y="45" text-anchor="middle" fill="#8b949e" font-size="11" font-weight="bold">LOKAL</text>
  <text x="80" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">FILE01</text>
  <text x="80" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">D:\\Freigaben\\Befehle</text>
  <text x="80" y="110" text-anchor="middle" fill="#8b949e" font-size="9">nur lokal sichtbar</text>

  <line x1="140" y1="90" x2="180" y2="90" stroke="#00f0ff" stroke-width="2" stroke-dasharray="4"/>
  <text x="160" y="80" text-anchor="middle" fill="#00f0ff" font-size="9">SMB Share</text>

  <rect x="180" y="20" width="120" height="140" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="240" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">NETZWERK</text>
  <text x="240" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">\\FILE01\\Befehle</text>
  <text x="240" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">erreichbar für</text>
  <text x="240" y="110" text-anchor="middle" fill="#c9d1d9" font-size="10">CLIENT01</text>
</svg>`;

const shareNameSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="120" height="140" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="2"/>
  <text x="80" y="45" text-anchor="middle" fill="#8b949e" font-size="11" font-weight="bold">Lokaler Ordner</text>
  <text x="80" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">D:\\Freigaben\\Befehle</text>
  <text x="80" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">Ordnername: Befehle</text>

  <line x1="140" y1="90" x2="180" y2="90" stroke="#ffcc00" stroke-width="2" stroke-dasharray="4"/>
  <text x="160" y="80" text-anchor="middle" fill="#ffcc00" font-size="9">Share</text>

  <rect x="180" y="20" width="120" height="140" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="240" y="45" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">Freigabename</text>
  <text x="240" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">Dokumente</text>
  <text x="240" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">\\FILE01\\Dokumente</text>
</svg>`;

const abeSvg = `<svg viewBox="0 0 320 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="120" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">ABE an</text>
  <text x="80" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">Lisa sieht nur</text>
  <text x="80" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">für sie erlaubte</text>
  <text x="80" y="110" text-anchor="middle" fill="#c9d1d9" font-size="10">Ordner/Dateien</text>

  <rect x="180" y="20" width="120" height="120" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="2"/>
  <text x="240" y="45" text-anchor="middle" fill="#8b949e" font-size="11" font-weight="bold">ABE aus</text>
  <text x="240" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">Lisa sieht alle</text>
  <text x="240" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">Namen, auch die</text>
  <text x="240" y="110" text-anchor="middle" fill="#c9d1d9" font-size="10">ohne Zugriff</text>
</svg>`;

export function buildAdSharesLesson() {
  const title = 'Fileserver und Freigaben';

  const explanations = [
    explanation('ads-einstieg', 'Lokaler Ordner reicht nicht', 'classic', [
      { type: 'text', content: 'Auf FILE01 liegt der Ordner D:\\Freigaben\\Befehle. CLIENT01 kann ihn aber nicht nutzen. Sam erklärt: Ein Ordner auf einem Server ist noch keine Netzwerkfreigabe.' },
      { type: 'question', question: 'Warum kann CLIENT01 nicht auf einen lokalen Ordner auf FILE01 zugreifen?', options: ['Weil der Ordner leer ist', 'Weil ein lokaler Ordner keine Netzwerkfreigabe ist', 'Weil FILE01 ausgeschaltet ist'], correct: 1, explanation: 'Ein lokaler Ordner muss erst freigegeben werden, damit Netzwerkclients darauf zugreifen.' },
    ]),

    explanation('ads-fileserver', 'Was ist ein Fileserver?', 'classic', [
      { type: 'text', content: 'Ein Fileserver ist ein Server, der Dateien und Ordner zentral für Netzwerkclients bereitstellt. Technisch kann auch ein normaler Rechner teilen; im Unternehmensbetrieb ist ein dedizierter Server sinnvoller.' },
      { type: 'question', question: 'Was ist die Hauptaufgabe eines Fileservers?', options: ['E-Mails senden', 'Dateien und Ordner zentral bereitstellen', 'Benutzerkonten anlegen'], correct: 1, explanation: 'Ein Fileserver stellt Datei- und Ordnerressourcen über das Netzwerk bereit.' },
    ]),

    explanation('ads-gui-core', 'GUI oder Core', 'classic', [
      { type: 'text', content: 'Ein Windows Server mit oder ohne GUI kann als Fileserver arbeiten. FILE01 ist unser Core-Server, wird aber remote mit Server Manager verwaltet.' },
      { type: 'question', question: 'Kann ein Windows Server Core als Fileserver dienen?', options: ['Nein, nur GUI-Server', 'Ja, Core kann Fileserver sein und wird remote verwaltet', 'Nur mit installiertem Client-OS'], correct: 1, explanation: 'Server Core kann die gleichen Serverrollen tragen, wird aber typischerweise remote administriert.' },
    ]),

    explanation('ads-fileserver-role', 'Dateiserverrolle', 'classic', [
      { type: 'text', content: 'Damit FILE01 Dateien im Netzwerk bereitstellen kann, muss die passende Serverrolle bzw. Funktion vorhanden sein. Je nach Installationsstand wird diese geprüft oder installiert. In diesem Block sorgt der Dateiserver für die Freigabefunktion.' },
      { type: 'question', question: 'Warum braucht FILE01 eine Dateiserverrolle?', options: ['Damit Benutzerkonten angelegt werden', 'Damit der Server Ordner als Netzwerkressourcen bereitstellen kann', 'Damit Drucker funktionieren'], correct: 1, explanation: 'Die Rolle/Funktion ermöglicht es, Ordner über das Netzwerk freizugeben.' },
    ]),

    explanation('ads-freigabe-definition', 'Was ist eine Freigabe?', 'classic', [
      { type: 'text', content: 'Eine Freigabe ist eine Ressource, die über das Netzwerk für andere Systeme erreichbar gemacht wird. Ein Ordner kann lokal existieren, ohne freigegeben zu sein.' },
      { type: 'diagram', content: localToShareSvg },
      { type: 'question', question: 'Was muss passieren, damit D:\\Freigaben\\Befehle über das Netzwerk erreichbar ist?', options: ['Er muss freigegeben werden', 'Er muss gelöscht werden', 'Er muss auf C: verschoben werden'], correct: 0, explanation: 'Ein Ordner wird zur Netzwerkressource, indem man ihn freigibt.' },
    ]),

    explanation('ads-smb', 'SMB', 'classic', [
      { type: 'text', content: 'SMB steht für Server Message Block. Es ist das Windows-typische Protokoll, über das Clients auf Dateifreigaben zugreifen. Wir vertiefen das Protokoll nicht; es transportiert den Zugriff auf die Freigabe.' },
      { type: 'question', question: 'Wozu dient SMB in diesem Zusammenhang?', options: ['Zum Domain-Join', 'Zum Zugriff auf Netzwerkfreigaben', 'Zum DNS-Update'], correct: 1, explanation: 'SMB ist ein Dateifreigabeprotokoll.' },
    ]),

    explanation('ads-nfs-basic', 'NFS nur kurz', 'classic', [
      { type: 'text', content: 'NFS ist ein weiteres Netzwerk-Dateifreigabeprotokoll, das aus der Unix-/Linux-Welt bekannt ist. Für den NEXUS-Windows-Auftrag spielen wir es nicht vertieft, sondern ordnen es nur als Alternative ein.' },
      { type: 'question', question: 'Was ist NFS?', options: ['Ein Windows-Profiltyp', 'Ein weiteres Netzwerk-Dateifreigabeprotokoll', 'Ein Active-Directory-Dienst'], correct: 1, explanation: 'NFS ist ein Netzwerk-Dateifreigabeprotokoll, das oft in Unix/Linux-Umgebungen genutzt wird.' },
    ]),

    explanation('ads-smb-quick', 'SMB Share - Quick', 'classic', [
      { type: 'text', content: 'Im Share-Wizard von Windows Server gibt es Profile wie SMB Share - Quick, SMB Share - Advanced, SMB Share - Applications und NFS. Für einen normalen NEXUS-Dateiordner ist SMB Share - Quick der passende einfache Einstieg. Das heißt nicht, dass Quick immer die beste Wahl ist, aber für diesen Auftrag passt es.' },
      { type: 'question', question: 'Welches Profil passt für eine einfache Windows-Dateifreigabe ohne Zusatzfunktionen?', options: ['NFS', 'SMB Share - Quick', 'SMB Share - Advanced'], correct: 1, explanation: 'SMB Share - Quick ist die schnelle Standardvariante für normale Windows-Freigaben.' },
    ]),

    explanation('ads-target-server', 'Zielserver wählen', 'classic', [
      { type: 'text', content: 'Wenn man aus dem Server Manager heraus einen Assistenten startet, muss man den Zielserver auswählen. Der Fileserver soll FILE01 sein, nicht DC01. Man verwaltet möglicherweise von DC01 aus, installiert die Rolle aber auf FILE01.' },
      { type: 'question', question: 'Für welchen Server soll die Freigabe eingerichtet werden?', options: ['DC01', 'FILE01', 'CLIENT01'], correct: 1, explanation: 'FILE01 ist der geplante Fileserver; DC01 ist ein Domain Controller.' },
    ]),

    explanation('ads-path', 'Volume und lokaler Pfad', 'classic', [
      { type: 'text', content: 'Für Unternehmensdaten ist eine getrennte Datenpartition häufig sinnvoller als C:. Das ist keine harte technische Regel, sondern eine organisatorische und betriebliche Entscheidung. Im NEXUS-Szenario liegt die Struktur unter D:\\Freigaben\\Befehle.' },
      { type: 'question', question: 'Warum ist D:\\Freigaben\\... als Speicherort für Netzwerkdaten meist sinnvoller als C:\\...?', options: ['Weil C: technisch unmöglich ist', 'Weil getrennte Datenpartitionen übersichtlicher und betrieblich besser zu trennen sind', 'Weil D: automatisch schneller ist'], correct: 1, explanation: 'C: ist nicht verboten; D: ist betrieblich meist sauberer für getrennte Daten.' },
    ]),

    explanation('ads-share-name', 'Ordnername vs Freigabename', 'classic', [
      { type: 'text', content: 'Lokaler Ordnername und Freigabename müssen nicht identisch sein. Der Ordner heißt intern Befehle, die Freigabe kann aber Dokumente heißen. Der UNC-Pfad verwendet den Freigabenamen: \\FILE01\\Dokumente.' },
      { type: 'diagram', content: shareNameSvg },
      { type: 'question', question: 'Lokaler Ordner: D:\\Freigaben\\Befehle; Freigabename: Dokumente. Wie lautet der UNC-Pfad?', options: ['\\FILE01\\Befehle', '\\FILE01\\Dokumente', 'D:\\Freigaben\\Dokumente'], correct: 1, explanation: 'Der UNC-Pfad verwendet den Freigabenamen, nicht den lokalen Ordnernamen.' },
    ]),

    explanation('ads-hidden-share', 'Versteckte Freigaben mit $', 'classic', [
      { type: 'text', content: 'Ein Freigabename mit $ am Ende, zum Beispiel Geheim$, wird typischerweise in normalen Browsing-Listen nicht angezeigt. Wer den UNC kennt und Berechtigungen hat, kann trotzdem zugreifen. Das $ ist kein Schutz, sondern ein Versteckmechanismus.' },
      { type: 'question', question: 'Was bedeutet ein $ am Ende eines Freigabenamens?', options: ['Vollständiger Zugriffsschutz', 'Verstecken in Standardlisten, kein Berechtigungsschutz', 'Automatische Verschlüsselung'], correct: 1, explanation: '$ versteckt die Freigabe, schützt aber nicht. Berechtigungen sind entscheidend.' },
    ]),

    explanation('ads-abe', 'Access-Based Enumeration', 'classic', [
      { type: 'text', content: 'Access-Based Enumeration sorgt dafür, dass Benutzer Inhalte, für die sie keine Berechtigung haben, nicht in der normalen Auflistung sehen. ABE ersetzt keine Berechtigungen, sondern beeinflusst nur die Sichtbarkeit.' },
      { type: 'diagram', content: abeSvg },
      { type: 'question', question: 'Was tut Access-Based Enumeration?', options: ['Gibt Berechtigungen', 'Verbirgt Inhalte ohne Zugriff in der Anzeige', 'Verschlüsselt Dateien'], correct: 1, explanation: 'ABE beeinflusst die Sichtbarkeit, vergibt aber keine Rechte.' },
    ]),

    explanation('ads-caching-encryption', 'Optionen im Überblick', 'classic', [
      { type: 'text', content: 'Im Share-Wizard gibt es weitere Optionen wie Offline-Caching, BranchCache und SMB Encryption. Sie sind kontextabhängig. Offline-Caching ermöglicht lokale Kopien, BranchCache optimiert entfernte Standorte und SMB Encryption schützt die Übertragung. Keine dieser Optionen ersetzt Berechtigungen.' },
      { type: 'question', question: 'Wozu kann SMB Encryption dienen?', options: ['Zum Ersetzen von Berechtigungen', 'Zum Schutz der Datenübertragung zwischen Client und Server', 'Zum automatischen Löschen alter Dateien'], correct: 1, explanation: 'SMB Encryption schützt die Übertragung, keine Rechtevergabe.' },
    ]),

    explanation('ads-next-permissions', 'Berechtigungen folgen später', 'classic', [
      { type: 'text', content: 'Dieser Block stoppt bewusst vor der Konfiguration von Berechtigungen. Die Freigabe existiert, aber wer darauf zugreifen darf, folgt im nächsten Block. Niemand bekommt automatisch Zugriff, nur weil er die Freigabe sieht.' },
      { type: 'question', question: 'Warum konfigurieren wir in diesem Block noch keine Rechte?', options: ['Weil Rechte automatisch gesetzt werden', 'Weil Rechte und Berechtigungen ein eigener nächster Block sind', 'Weil Freigaben keine Rechte brauchen'], correct: 1, explanation: 'Freigaben und Berechtigungen sind getrennte Themen. Dieser Block baut nur die Freigabe.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-fileserver-role-guided-ui',
      type: 'guided-ui',
      title: 'Dateiserverrolle auf FILE01 vorbereiten',
      question: 'Stelle sicher, dass FILE01 als Fileserver arbeiten kann.',
      explanation: 'Server Manager öffnet den Assistenten. Ziel ist FILE01, die Rolle ist File and Storage Services / File Server.',
      intro: 'Du verwaltest von DC01 aus, aber FILE01 soll als Fileserver arbeiten.',
      steps: [
        {
          id: 'ads-role-open',
          kind: 'navigation',
          screen: { title: 'Server Manager', subtitle: 'Rollen hinzufügen' },
          instruction: 'Wie startest du den Assistenten, um eine Rolle hinzuzufügen?',
          targets: [
            { id: 'manage', label: 'Manage' },
            { id: 'add-roles', label: 'Add Roles and Features', description: 'Assistent für neue Rollen' },
            { id: 'local-server', label: 'Local Server' },
            { id: 'dashboard', label: 'Dashboard' },
          ],
          correctTarget: 'add-roles',
          feedbackWrong: 'Manage und Add Roles and Features startet den Rollenassistenten.',
          feedbackCorrect: 'Richtig: Add Roles and Features startet den Assistenten.',
        },
        {
          id: 'ads-role-target',
          kind: 'navigation',
          screen: { title: 'Select destination server', subtitle: 'Zielserver' },
          instruction: 'Auf welchem Server soll die Dateiserverrolle installiert werden?',
          targets: [
            { id: 'dc01', label: 'DC01', description: 'Domain Controller, nicht der Fileserver' },
            { id: 'file01', label: 'FILE01', description: 'Geplanter Fileserver' },
            { id: 'client01', label: 'CLIENT01', description: 'Client' },
          ],
          correctTarget: 'file01',
          feedbackWrong: 'Die Rolle soll auf FILE01, nicht auf DC01 oder CLIENT01, installiert werden.',
          feedbackCorrect: 'Richtig: FILE01 ist der Zielserver.',
        },
        {
          id: 'ads-role-selection',
          kind: 'navigation',
          screen: { title: 'Server Roles', subtitle: 'Rolle wählen' },
          instruction: 'Welche Serverrolle brauchst du für Dateifreigaben?',
          targets: [
            { id: 'dns', label: 'DNS Server', description: 'Namensauflösung' },
            { id: 'file-storage', label: 'File and Storage Services', description: 'Datei- und Speicherdienste' },
            { id: 'dhcp', label: 'DHCP Server', description: 'IP-Vergabe' },
          ],
          correctTarget: 'file-storage',
          feedbackWrong: 'Für Dateifreigaben sind File and Storage Services zuständig.',
          feedbackCorrect: 'Richtig: File and Storage Services beinhaltet die Dateiserver-Funktion.',
        },
        {
          id: 'ads-role-fileserver',
          kind: 'navigation',
          screen: { title: 'File and Storage Services', subtitle: 'Rolldienst' },
          instruction: 'Welche Rolldienst-Funktion ist für Freigaben nötig?',
          targets: [
            { id: 'file-server', label: 'File Server', description: 'Stellt Dateien im Netzwerk bereit' },
            { id: 'iscsi', label: 'iSCSI', description: 'Storage-Technologie' },
            { id: 'data-dedup', label: 'Data Deduplication', description: 'Platzeinsparung' },
          ],
          correctTarget: 'file-server',
          feedbackWrong: 'File Server ist der passende Dienst für Netzwerkfreigaben.',
          feedbackCorrect: 'Richtig: File Server ermöglicht Dateifreigaben.',
        },
      ],
    },

    {
      id: 'ad-fileshare-create-guided-ui',
      type: 'guided-ui',
      title: 'SMB-Freigabe Befehle erstellen',
      question: 'Erstelle auf FILE01 eine SMB-Freigabe für den Ordner D:\\Freigaben\\Befehle.',
      explanation: 'Server Manager → File and Storage Services → Shares → New Share → SMB Share - Quick → FILE01 → D:\\Freigaben\\Befehle → Freigabename Befehle.',
      intro: 'FILE01 hat die Dateiserverrolle. Jetzt wird der Ordner Befehle als SMB-Freigabe sichtbar.',
      steps: [
        {
          id: 'ads-share-menu',
          kind: 'navigation',
          screen: { title: 'Server Manager', subtitle: 'Datei- und Speicherdienste' },
          instruction: 'Wo findest du die Freigaben?',
          targets: [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'file-storage-services', label: 'File and Storage Services', description: 'Dateidienste' },
            { id: 'local-server', label: 'Local Server' },
          ],
          correctTarget: 'file-storage-services',
          feedbackWrong: 'File and Storage Services führt zu den Freigaben.',
          feedbackCorrect: 'Richtig: File and Storage Services.',
        },
        {
          id: 'ads-share-section',
          kind: 'navigation',
          screen: { title: 'File and Storage Services', subtitle: 'Bereich wählen' },
          instruction: 'In welchem Bereich erstellst du eine neue Freigabe?',
          targets: [
            { id: 'servers', label: 'Servers' },
            { id: 'volumes', label: 'Volumes' },
            { id: 'shares', label: 'Shares', description: 'Freigaben' },
            { id: 'disks', label: 'Disks' },
          ],
          correctTarget: 'shares',
          feedbackWrong: 'Freigaben werden im Bereich Shares erstellt.',
          feedbackCorrect: 'Richtig: Shares öffnet die Freigaben.',
        },
        {
          id: 'ads-share-new',
          kind: 'navigation',
          screen: { title: 'Shares', subtitle: 'Neue Freigabe' },
          instruction: 'Wie startest du den Assistenten für eine neue Freigabe?',
          targets: [
            { id: 'new-share', label: 'New Share', description: 'Neue Freigabe' },
            { id: 'refresh', label: 'Refresh' },
            { id: 'delete', label: 'Delete' },
          ],
          correctTarget: 'new-share',
          feedbackWrong: 'New Share startet den Assistenten.',
          feedbackCorrect: 'Richtig: New Share.',
        },
        {
          id: 'ads-share-profile',
          kind: 'navigation',
          screen: { title: 'New Share Wizard', subtitle: 'Profil wählen' },
          instruction: 'Welches Profil passt für eine normale Windows-Dateifreigabe ohne Zusatzfunktionen?',
          targets: [
            { id: 'nfs', label: 'NFS Share', description: 'Unix-/Linux-Protokoll' },
            { id: 'smb-quick', label: 'SMB Share - Quick', description: 'Schnelle Standardfreigabe' },
            { id: 'smb-advanced', label: 'SMB Share - Advanced', description: 'Mit zusätzlichen Einstellungen' },
          ],
          correctTarget: 'smb-quick',
          feedbackWrong: 'SMB Share - Quick ist die passende Wahl für eine einfache Windows-Freigabe.',
          feedbackCorrect: 'Richtig: SMB Share - Quick.',
        },
        {
          id: 'ads-share-server',
          kind: 'navigation',
          screen: { title: 'New Share Wizard', subtitle: 'Zielserver' },
          instruction: 'Auf welchem Server soll die Freigabe erstellt werden?',
          targets: [
            { id: 'dc01', label: 'DC01' },
            { id: 'file01', label: 'FILE01' },
            { id: 'client01', label: 'CLIENT01' },
          ],
          correctTarget: 'file01',
          feedbackWrong: 'Die Freigabe soll auf FILE01 liegen.',
          feedbackCorrect: 'Richtig: FILE01.',
        },
        {
          id: 'ads-share-path',
          kind: 'decision',
          screen: { title: 'New Share Wizard', subtitle: 'Lokaler Pfad' },
          instruction: 'Welcher lokale Pfad soll freigegeben werden?',
          targets: [
            { id: 'c-windows', label: 'C:\\Windows', description: 'Systemverzeichnis, kein Netzwerkdaten' },
            { id: 'd-freigaben-befehle', label: 'D:\\Freigaben\\Befehle', description: 'Geplanter Datenpfad' },
            { id: 'c-users', label: 'C:\\Users', description: 'Benutzerprofile, nicht passend' },
          ],
          correctTarget: 'd-freigaben-befehle',
          feedbackWrong: 'D:\\Freigaben\\Befehle ist der geplante Datenpfad. C:\\Windows und C:\\Users sind ungeeignet.',
          feedbackCorrect: 'Richtig: D:\\Freigaben\\Befehle.',
        },
        {
          id: 'ads-share-name',
          kind: 'decision',
          screen: { title: 'New Share Wizard', subtitle: 'Freigabename' },
          instruction: 'Wie soll die Freigabe im Netzwerk heißen?',
          targets: [
            { id: 'befehle', label: 'Befehle', description: 'Freigabename = lokaler Ordnername, funktioniert' },
            { id: 'dokumente', label: 'Dokumente', description: 'Anderer Freigabename, UNC wäre \\FILE01\\Dokumente' },
            { id: 'windows', label: 'Windows', description: 'Unpassend' },
          ],
          correctTarget: 'befehle',
          feedbackWrong: 'Befehle ist der geplante Freigabename. Dokumente wäre zwar möglich, aber nicht der Auftrag.',
          feedbackCorrect: 'Richtig: Die Freigabe heißt Befehle, der UNC ist \\FILE01\\Befehle.',
        },
      ],
    },

    {
      id: 'ad-share-abe-guided-ui',
      type: 'guided-ui',
      title: 'Access-Based Enumeration aktivieren',
      question: 'Konfiguriere die Freigabe so, dass nicht berechtigte Inhalte nicht sichtbar aufgelistet werden.',
      explanation: 'ABE beeinflusst die Sichtbarkeit, ersetzt aber keine Rechte. Im Wizard ist ABE eine Share-Option.',
      intro: 'Die Personal-Freigabe soll nicht berechtigte Inhalte ausblenden.',
      steps: [
        {
          id: 'ads-abe-screen',
          kind: 'navigation',
          screen: { title: 'Share Settings', subtitle: 'Sichtbarkeit' },
          instruction: 'Welche Option sorgt dafür, dass Benutzer nur Inhalte sehen, für die sie Berechtigungen haben?',
          targets: [
            { id: 'offline-caching', label: 'Offline Caching' },
            { id: 'abe', label: 'Access-Based Enumeration', description: 'Sichtbarkeit an Berechtigungen koppeln' },
            { id: 'branchcache', label: 'BranchCache' },
          ],
          correctTarget: 'abe',
          feedbackWrong: 'Access-Based Enumeration steuert die Sichtbarkeit, nicht die Rechtevergabe.',
          feedbackCorrect: 'Richtig: ABE blendet nicht berechtigte Inhalte aus der Auflistung aus.',
        },
      ],
    },

    {
      id: 'ads-local-vs-share-select',
      type: 'select-best',
      title: 'Lokaler Ordner vs Freigabe',
      question: 'Auf FILE01 existiert D:\\Freigaben\\Befehle. CLIENT01 kann ihn trotzdem nicht nutzen. Warum?',
      options: [
        'Weil CLIENT01 keinen Ordner sehen kann',
        'Weil der Ordner noch nicht als Netzwerkfreigabe eingerichtet ist',
        'Weil FILE01 kein Server ist',
      ],
      correct: 1,
      explanation: 'Ein lokaler Ordner muss freigegeben werden, damit Netzwerkclients darauf zugreifen.',
    },

    {
      id: 'ads-smb-vs-nfs-select',
      type: 'select-best',
      title: 'SMB oder NFS?',
      question: 'NEXUS nutzt Windows-Clients und FILE01 als Windows Fileserver. Welches Protokoll ist passend?',
      options: [
        'SMB',
        'NFS',
        'FTP',
      ],
      correct: 0,
      explanation: 'SMB ist das Windows-typische Protokoll für Dateifreigaben. NFS kommt häufiger aus der Unix/Linux-Welt.',
    },

    {
      id: 'ads-folder-vs-share-name-select',
      type: 'select-best',
      title: 'Ordnername vs Freigabename',
      question: 'Lokaler Ordner: D:\\Freigaben\\Befehle; Freigabename: Dokumente. Wie lautet der UNC-Pfad?',
      options: [
        '\\FILE01\\Befehle',
        '\\FILE01\\Dokumente',
        'D:\\Freigaben\\Dokumente',
      ],
      correct: 1,
      explanation: 'Der UNC verwendet den Freigabenamen, nicht den lokalen Ordnernamen.',
    },

    {
      id: 'ads-unc-result-select',
      type: 'select-best',
      title: 'UNC entsteht',
      question: 'FILE01 teilt den Ordner D:\\Freigaben\\Befehle unter dem Freigabenamen Befehle. Welcher UNC-Pfad entsteht?',
      options: [
        'C:\\Freigaben\\Befehle',
        '\\FILE01\\Befehle',
        '\\DC01\\Befehle',
      ],
      correct: 1,
      explanation: 'UNC = Server + Freigabename, also \\FILE01\\Befehle.',
    },

    {
      id: 'ads-hidden-share-select',
      type: 'select-best',
      title: 'Versteckte Freigabe',
      question: 'Eine Freigabe heißt Geheim$. Was bedeutet das?',
      options: [
        'Niemand kann zugreifen',
        'Sie wird normal nicht in Browsing-Listen angezeigt, der UNC funktioniert trotzdem',
        'Sie ist automatisch verschlüsselt',
      ],
      correct: 1,
      explanation: '$ versteckt die Freigabe, schützt aber nicht. Zugriff braucht den richtigen UNC und passende Berechtigungen.',
    },
  ];

  const quiz = [
    { question: 'Was macht einen lokalen Ordner auf FILE01 für CLIENT01 erreichbar?', options: ['Nichts, er ist automatisch erreichbar', 'Eine Freigabe', 'Ein DNS-Eintrag'], correct: 1, explanation: 'Eine Freigabe macht den Ordner über das Netzwerk erreichbar.' },
    { question: 'Welches Protokoll ist Windows-typisch für Dateifreigaben?', options: ['NFS', 'SMB', 'HTTP'], correct: 1, explanation: 'SMB ist das gängige Windows-Protokoll für Dateifreigaben.' },
    { question: 'Wo soll der Assistent die Dateiserverrolle installieren?', options: ['Auf DC01', 'Auf FILE01', 'Auf CLIENT01'], correct: 1, explanation: 'Der Fileserver ist FILE01, daher muss die Rolle auf FILE01 installiert werden.' },
    { question: 'Welches Share-Profil passt für eine einfache Windows-Freigabe ohne Zusatzfunktionen?', options: ['NFS Share', 'SMB Share - Quick', 'SMB Share - Advanced'], correct: 1, explanation: 'SMB Share - Quick ist der einfache Einstieg.' },
    { question: 'Lokaler Ordner: D:\\Freigaben\\Befehle; Freigabename: Dokumente. Wie lautet UNC?', options: ['\\FILE01\\Befehle', '\\FILE01\\Dokumente', 'D:\\Freigaben\\Dokumente'], correct: 1, explanation: 'UNC verwendet den Freigabenamen, nicht den lokalen Ordnernamen.' },
    { question: 'Was bedeutet Access-Based Enumeration?', options: ['Berechtigungen vergeben', 'Sichtbarkeit an Berechtigungen koppeln', 'Freigabe verschlüsseln'], correct: 1, explanation: 'ABE blendet Inhalte ohne Berechtigung aus der Auflistung aus.' },
    { question: 'Schützt ein $ am Ende des Freigabenamens vor unberechtigtem Zugriff?', options: ['Ja, vollständig', 'Nein, es versteckt die Freigabe nur', 'Nur lokal'], correct: 1, explanation: '$ versteckt die Freigabe, schützt aber nicht. Berechtigungen entscheiden.' },
  ];

  const summary = [
    'Ein Ordner auf einem Server ist noch keine Netzwerkfreigabe.',
    'Ein Fileserver stellt Ordner über Protokolle wie SMB zentral bereit.',
    'Der Assistent erwartet den richtigen Zielserver, meist FILE01.',
    'Lokaler Pfad und Freigabename sind unterschiedlich; der UNC verwendet den Freigabenamen.',
    'SMB Share - Quick ist der einfache Einstieg für normale Windows-Dateifreigaben.',
    'Eine Freigabe mit $ am Ende wird in Standardlisten versteckt, aber nicht geschützt.',
    'Access-Based Enumeration steuert die Sichtbarkeit, ersetzt aber keine Berechtigungen.',
    'Berechtigungen werden in einem separaten Block konfiguriert.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
