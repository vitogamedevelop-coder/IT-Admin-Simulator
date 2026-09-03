import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – AD-Papierkorb & Wiederherstellung
// Thema 26
// =============================================================================

export const AD_RECYCLE_BIN_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-recycle-bin');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const lifecycleSvg = `<svg viewBox="0 0 400 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="20" fill="#00f0ff"/>
  <text x="60" y="65" text-anchor="middle" fill="#0d1117" font-size="9" font-weight="bold">Objekt</text>
  <line x1="82" y1="60" x2="118" y2="60" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <text x="100" y="52" text-anchor="middle" fill="#8b949e" font-size="8">Löschen</text>
  <circle cx="140" cy="60" r="20" fill="#ffcc00"/>
  <text x="140" y="64" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">Deleted</text>
  <line x1="162" y1="60" x2="218" y2="60" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <text x="190" y="52" text-anchor="middle" fill="#8b949e" font-size="8">Restore</text>
  <circle cx="240" cy="60" r="20" fill="#00ff66"/>
  <text x="240" y="64" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">Zurück</text>
  <line x1="162" y1="80" x2="218" y2="90" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3,2" marker-end="url(#a)"/>
  <text x="190" y="102" text-anchor="middle" fill="#8b949e" font-size="8">später</text>
  <circle cx="240" cy="100" r="14" fill="#8b949e"/>
  <text x="240" y="104" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">Ende</text>
  <text x="330" y="65" text-anchor="middle" fill="#c9d1d9" font-size="9">Zeitfenster</text>
  <text x="330" y="80" text-anchor="middle" fill="#c9d1d9" font-size="9">begrenzt</text>
  <rect x="300" y="45" width="60" height="40" rx="4" fill="none" stroke="#ffcc00" stroke-width="1.5" stroke-dasharray="4,2"/>
  <defs><marker id="a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L5,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const restoreVsSvg = `<svg viewBox="0 0 320 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Restore vs Restore To</text>
  <rect x="20" y="40" width="120" height="40" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="65" text-anchor="middle" fill="#00f0ff" font-size="10">Restore</text>
  <text x="80" y="100" text-anchor="middle" fill="#8b949e" font-size="9">ursprünglicher Ort</text>
  <line x1="140" y1="80" x2="200" y2="80" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <rect x="210" y="40" width="90" height="40" rx="6" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="255" y="65" text-anchor="middle" fill="#ffcc00" font-size="9">Ziel-Ort</text>
  <rect x="20" y="120" width="120" height="30" rx="6" fill="#0d1117" stroke="#00ff66" stroke-width="2"/>
  <text x="80" y="140" text-anchor="middle" fill="#00ff66" font-size="10">Restore To</text>
  <line x1="140" y1="135" x2="200" y2="135" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <rect x="210" y="120" width="90" height="30" rx="6" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="255" y="140" text-anchor="middle" fill="#ffcc00" font-size="9">anderer Ort</text>
  <defs><marker id="a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L5,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const vsBackupSvg = `<svg viewBox="0 0 320 140" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Recycle Bin vs Backup</text>
  <rect x="20" y="40" width="120" height="80" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="60" text-anchor="middle" fill="#00f0ff" font-size="10">Recycle Bin</text>
  <text x="80" y="80" text-anchor="middle" fill="#c9d1d9" font-size="8">Einzelne AD-Objekte</text>
  <text x="80" y="95" text-anchor="middle" fill="#c9d1d9" font-size="8">Kurzes Zeitfenster</text>
  <text x="80" y="110" text-anchor="middle" fill="#c9d1d9" font-size="8">Voreilige Löschung</text>
  <rect x="180" y="40" width="120" height="80" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="240" y="60" text-anchor="middle" fill="#ffcc00" font-size="10">Backup</text>
  <text x="240" y="80" text-anchor="middle" fill="#c9d1d9" font-size="8">Disaster Recovery</text>
  <text x="240" y="95" text-anchor="middle" fill="#c9d1d9" font-size="8">Langfristige Sicherung</text>
  <text x="240" y="110" text-anchor="middle" fill="#c9d1d9" font-size="8">System-/Datenverlust</text>
</svg>`;

function guidedUiStep({ id, kind, title, subtitle, instruction, targets, correctTarget, feedbackWrong, feedbackCorrect }) {
  return { id, kind, screen: { title, subtitle }, instruction, targets, correctTarget, feedbackWrong, feedbackCorrect };
}

export function buildAdRecycleBinLesson() {
  const explanations = [
    explanation('ad-recycle-bin-what', 'Was ist der AD-Papierkorb?', 'classic', [
      { type: 'text', content: 'Der Active Directory Recycle Bin ist eine Funktion zur Wiederherstellung versehentlich gelöschter AD-Objekte – Benutzer, Computer, Gruppen, OUs und andere Verzeichnisobjekte. Er ersetzt kein vollwertiges Backup, hilft aber bei schnellen Fehlbedienungen.' },
      { type: 'question', question: 'Wofür ist der AD-Papierkorb gedacht?', options: ['Wiederherstellung versehentlich gelöschter AD-Objekte', 'Ersatz für ein Backup-System', 'Löschen von Objekten', 'Neuinstallation des Forest'], correct: 0, explanation: 'Der Papierkorb stellt gelöschte AD-Objekte wieder her, ersetzt aber kein Backup.' },
    ]),
    explanation('ad-recycle-bin-enable', 'Aktivierung und Voraussetzungen', 'classic', [
      { type: 'text', content: 'Der Recycle Bin muss bewusst für den gesamten Forest aktiviert werden, bevor seine Funktionen verfügbar sind. Einmal aktiviert wirkt er forestweit und lässt sich nicht einfach wieder rückgängig machen. Die Aktivierung erfolgt typischerweise im Active Directory Administrative Center.' },
      { type: 'question', question: 'Wie wirkt die Aktivierung des AD-Papierkorbs?', options: ['Nur für die aktuelle OU', 'Nur für die aktuelle Domain', 'Forestweit', 'Nur für den lokalen DC'], correct: 2, explanation: 'Die Aktivierung des Recycle Bin wirkt forestweit und ist irreversibel.' },
    ]),
    explanation('ad-recycle-bin-lifecycle', 'Objekt-Lebenszyklus', 'classic', [
      { type: 'text', content: 'Ein Objekt existiert, wird gelöscht und landet im Container Deleted Objects. Dort bleibt es für die konfigurierte Aufbewahrungsdauer erhalten und kann wiederhergestellt werden. Danach erfolgt die endgültige Bereinigung.' },
      { type: 'diagram', content: lifecycleSvg },
      { type: 'question', question: 'Wohin gelangt ein gelöschtes AD-Objekt?', options: ['In den DNS-Manager', 'In den Container Deleted Objects', 'Auf den Desktop', 'In den DHCP-Server'], correct: 1, explanation: 'Gelöschte Objekte erscheinen im Container Deleted Objects, wenn der Recycle Bin aktiv ist.' },
    ]),
    explanation('ad-recycle-bin-restore', 'Restore und Restore To', 'classic', [
      { type: 'text', content: 'Restore bringt das Objekt an seinen ursprünglichen Ort zurück. Restore To oder „Wiederherstellen in...“ ermöglicht es, das Objekt an einem anderen Zielort wiederherzustellen. Das ist sinnvoll, wenn der alte Container nicht mehr existiert oder man das Objekt zunächst unter Quarantäne isolieren möchte. Nach dem Restore verifiziert und prüft man das Ergebnis: Ort, Attribute und wichtige Bezüge.' },
      { type: 'diagram', content: restoreVsSvg },
      { type: 'question', question: 'Was ist der Unterschied zwischen Restore und Restore To?', options: ['Keiner', 'Restore = Ursprungsort, Restore To = anderer Zielort', 'Restore = anderer Zielort, Restore To = Ursprungsort', 'Beides löscht'], correct: 1, explanation: 'Restore bringt das Objekt an den Ursprungsort, Restore To an einen wählbaren Zielort.' },
    ]),
    explanation('ad-recycle-bin-vs-backup', 'Papierkorb ≠ Backup', 'classic', [
      { type: 'text', content: 'Der Recycle Bin rettet versehentlich gelöschte Einzelobjekte innerhalb eines begrenzten Zeitraums. Backups dienen der umfassenden Wiederherstellung bei Datenverlust, Serverausfall, Katastrophen oder wenn ein Zustand länger zurückliegt. Papierkorb und Backup ergänzen sich, ersetzen sich aber nicht.' },
      { type: 'diagram', content: vsBackupSvg },
      { type: 'question', question: 'Kann der AD-Papierkorb ein vollwertiges Backup ersetzen?', options: ['Ja', 'Nein', 'Nur für Benutzer', 'Nur für Computer'], correct: 1, explanation: 'Recycle Bin und Backup haben unterschiedliche Zwecke; der Papierkorb ersetzt kein Backup.' },
    ]),
    explanation('ad-recycle-bin-adsi', 'ADSI Edit als fortgeschrittenes Werkzeug', 'classic', [
      { type: 'text', content: 'ADSI Edit ist ein fortgeschrittenes Werkzeug, das direkten Zugriff auf AD-Attribute bietet. Für normale Restore-Aufgaben braucht man es nicht. Man sollte es nur bewusst einsetzen, wenn tiefergehende Verzeichniserwaltung erforderlich ist.' },
      { type: 'question', question: 'Wann wird ADSI Edit für den Recycle-Bin-Restore benötigt?', options: ['Immer', 'Nie', 'Nur für fortgeschrittene Szenarien, nicht für normalen Restore', 'Bei jedem Löschen'], correct: 2, explanation: 'ADSI Edit ist ein fortgeschrittenes Tool; normale Restore-Aufgaben erfolgen über das AD Administrative Center.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-recycle-bin-enable-guided-ui',
      type: 'guided-ui',
      title: 'Papierkorb aktivieren',
      question: 'Aktiviere den AD-Papierkorb forestweit über das Active Directory Administrative Center.',
      explanation: 'Active Directory Administrative Center öffnen → betroffene Domain/Forest auswählen → Papierkorb aktivieren → Warnhinweis lesen → bestätigen → Ansicht aktualisieren.',
      intro: 'Damit gelöschte Objekte vollständig wiederhergestellt werden können, muss der Recycle Bin zuvor aktiv sein.',
      steps: [
        guidedUiStep({
          id: 'ad-recycle-bin-enable-tool',
          kind: 'decision',
          title: 'Verwaltungstool',
          subtitle: 'Papierkorb aktivieren',
          instruction: 'Welches Tool verwendest du, um den AD-Papierkorb zu aktivieren?',
          targets: [
            { id: 'adac', label: 'Active Directory Administrative Center', description: 'Richtiges Tool' },
            { id: 'aduc', label: 'Active Directory-Benutzer und -Computer', description: 'Nicht für Papierkorb-Aktivierung' },
            { id: 'dns', label: 'DNS-Manager', description: 'Nicht hier' },
          ],
          correctTarget: 'adac',
          feedbackWrong: 'Der Papierkorb wird im Active Directory Administrative Center aktiviert.',
          feedbackCorrect: 'Richtig: Active Directory Administrative Center.',
        }),
        guidedUiStep({
          id: 'ad-recycle-bin-enable-scope',
          kind: 'decision',
          title: 'Wirkungsbereich',
          subtitle: 'Aktivierung',
          instruction: 'Auf welcher Ebene wirkt die Aktivierung?',
          targets: [
            { id: 'forest', label: 'Forestweit', description: 'Gesamter Forest' },
            { id: 'domain', label: 'Nur aktuelle Domain', description: 'Falsch' },
            { id: 'ou', label: 'Nur aktuelle OU', description: 'Falsch' },
          ],
          correctTarget: 'forest',
          feedbackWrong: 'Die Aktivierung gilt forestweit.',
          feedbackCorrect: 'Richtig: forestweit.',
        }),
        guidedUiStep({
          id: 'ad-recycle-bin-enable-irreversible',
          kind: 'decision',
          title: 'Warnhinweis',
          subtitle: 'Aktivierung',
          instruction: 'Was ist ein wichtiger Hinweis zur Aktivierung?',
          targets: [
            { id: 'reversible', label: 'Kann jederzeit rückgängig gemacht werden', description: 'Falsch' },
            { id: 'irreversible', label: 'Ist forestweit aktiv und nicht einfach rückgängig', description: 'Richtig' },
            { id: 'auto', label: 'Läuft automatisch auf jedem Client', description: 'Falsch' },
          ],
          correctTarget: 'irreversible',
          feedbackWrong: 'Die Aktivierung ist forestweit und wird nicht einfach rückgängig gemacht.',
          feedbackCorrect: 'Richtig: bewusste, forestweit wirkende Aktivierung.',
        }),
      ],
    },
    {
      id: 'ad-recycle-bin-restore-guided-ui',
      type: 'guided-ui',
      title: 'Objekt an ursprünglichen Ort wiederherstellen',
      question: 'Stelle Lisa.Mueller aus Deleted Objects an ihren ursprünglichen Ort wieder her.',
      explanation: 'Deleted Objects öffnen → Lisa.Mueller auswählen → Wiederherstellen → Objekt an ursprünglichem Ort prüfen.',
      intro: 'Der Benutzer Lisa.Mueller wurde versehentlich gelöscht. Du möchtest sie an ihren ursprünglichen Ort zurückbringen.',
      steps: [
        guidedUiStep({
          id: 'ad-recycle-bin-restore-location',
          kind: 'navigation',
          title: 'Container',
          subtitle: 'Gelöschte Objekte',
          instruction: 'Wo findest du gelöschte Objekte, nachdem der Papierkorb aktiv ist?',
          targets: [
            { id: 'deleted', label: 'Deleted Objects', description: 'Gelöschte Objekte' },
            { id: 'users', label: 'Users', description: 'Normale Benutzer-OU' },
            { id: 'sites', label: 'Sites', description: 'Falsch' },
          ],
          correctTarget: 'deleted',
          feedbackWrong: 'Gelöschte Objekte befinden sich im Container Deleted Objects.',
          feedbackCorrect: 'Richtig: Deleted Objects.',
        }),
        guidedUiStep({
          id: 'ad-recycle-bin-restore-action',
          kind: 'navigation',
          title: 'Lisa.Mueller',
          subtitle: 'Wiederherstellen',
          instruction: 'Welche Aktion stellt das Objekt an den ursprünglichen Ort zurück?',
          targets: [
            { id: 'restore', label: 'Wiederherstellen', description: 'Original-Ort' },
            { id: 'restoreto', label: 'Wiederherstellen in...', description: 'Anderer Ort' },
            { id: 'delete', label: 'Dauerhaft löschen', description: 'Entfernt Objekt' },
          ],
          correctTarget: 'restore',
          feedbackWrong: 'Wiederherstellen bringt das Objekt an seinen ursprünglichen Ort zurück.',
          feedbackCorrect: 'Richtig: Wiederherstellen.',
        }),
        guidedUiStep({
          id: 'ad-recycle-bin-restore-verify',
          kind: 'decision',
          title: 'Verifikation',
          subtitle: 'Ergebnis prüfen',
          instruction: 'Was prüfst du nach dem Restore?',
          targets: [
            { id: 'exists', label: 'Objekt existiert am erwarteten Ort und hat wichtige Attribute', description: 'Richtig' },
            { id: 'nothing', label: 'Nichts, der Button reicht', description: 'Falsch' },
            { id: 'dns', label: 'DNS-Zone', description: 'Nicht primär' },
          ],
          correctTarget: 'exists',
          feedbackWrong: 'Nach Restore prüft man, ob das Objekt am erwarteten Ort mit den wichtigen Attributen vorhanden ist.',
          feedbackCorrect: 'Richtig: Verifikation am Zielort.',
        }),
      ],
    },
    {
      id: 'ad-recycle-bin-restore-to-guided-ui',
      type: 'guided-ui',
      title: 'Objekt an anderem Ort wiederherstellen',
      question: 'Stelle eine gelöschte OU in der Wiederherstellungs-OU OU=Recovered wieder her.',
      explanation: 'Deleted Objects → Objekt auswählen → Wiederherstellen in... → Ziel-OU Recovered auswählen → Ergebnis prüfen.',
      intro: 'Das Objekt soll nicht in die ursprüngliche OU, sondern in eine Quarantäne-/Recovered-OU zurückkehren.',
      steps: [
        guidedUiStep({
          id: 'ad-recycle-bin-restore-to-action',
          kind: 'navigation',
          title: 'Restore To',
          subtitle: 'Anderes Ziel',
          instruction: 'Welche Aktion wählst du, wenn das Objekt an einen anderen Ort soll?',
          targets: [
            { id: 'restore', label: 'Wiederherstellen', description: 'Ursprünglicher Ort' },
            { id: 'restoreto', label: 'Wiederherstellen in...', description: 'Anderer Zielort' },
            { id: 'move', label: 'Verschieben', description: 'Falsch' },
          ],
          correctTarget: 'restoreto',
          feedbackWrong: 'Wiederherstellen in... ermöglicht die Auswahl eines anderen Zielorts.',
          feedbackCorrect: 'Richtig: Wiederherstellen in...',
        }),
        guidedUiStep({
          id: 'ad-recycle-bin-restore-to-target',
          kind: 'decision',
          title: 'Ziel-OU',
          subtitle: 'Recovered',
          instruction: 'Welche OU wählst du als Ziel?',
          targets: [
            { id: 'recovered', label: 'OU=Recovered', description: 'Wiederherstellungs-OU' },
            { id: 'old', label: 'Ursprüngliche OU', description: 'Ziel bei Restore, nicht Restore To' },
            { id: 'sites', label: 'Sites', description: 'Falsch' },
          ],
          correctTarget: 'recovered',
          feedbackWrong: 'Restore To wählt die Recovered-OU als alternativen Zielort.',
          feedbackCorrect: 'Richtig: OU=Recovered.',
        }),
      ],
    },
    {
      id: 'ad-recycle-bin-admin-challenge',
      type: 'select-best',
      question: 'NEXUS-Auftrag: Benutzer Lisa.Mueller wurde versehentlich gelöscht. Stelle sie wieder her und belege, dass die Wiederherstellung erfolgreich war.',
      options: [
        'Deleted Objects öffnen → Lisa.Mueller identifizieren → Wiederherstellen → Zielort und Attribute prüfen',
        'Backup starten und den gesamten Forest wiederherstellen',
        'Lisa.Mueller neu anlegen und alte Kennung verlieren',
        'ADSI Edit öffnen und Attribute manuell setzen',
      ],
      correct: 0,
      explanation: 'Wenn der Papierkorb aktiv ist, findet man das gelöschte Objekt in Deleted Objects und stellt es mit Verifikation wieder her.',
    },
    {
      id: 'ad-recycle-bin-matching',
      type: 'matching',
      question: 'Ordne jedem Begriff seine Bedeutung zu.',
      pairs: [
        { left: 'Recycle Bin', right: 'gelöschte AD-Objekte wiederherstellen' },
        { left: 'Deleted Objects', right: 'gelöschte Objekte anzeigen' },
        { left: 'Restore', right: 'ursprünglicher Ort' },
        { left: 'Restore To', right: 'anderer Zielort' },
        { left: 'Backup', right: 'umfassende Wiederherstellung' },
      ],
      explanation: 'Jeder Begriff hat eine klar abgegrenzte Bedeutung.',
    },
    {
      id: 'ad-recycle-bin-classification',
      type: 'select-best',
      question: 'Eine gelöschte OU soll zunächst nicht in den Original-Container, sondern in eine Quarantäne-OU. Welche Restore-Variante verwendest du?',
      options: ['Restore', 'Restore To / Wiederherstellen in...', 'Beide gleichzeitig', 'Keine, weil OUs nicht wiederherstellbar sind'],
      correct: 1,
      explanation: 'Für einen alternativen Zielort verwendet man Restore To (Wiederherstellen in...).',
    },
    {
      id: 'ad-recycle-bin-ordering',
      type: 'ordering',
      question: 'Bringe die typischen Restore-Schritte in die richtige Reihenfolge.',
      items: ['Papierkorb aktivieren', 'Objekt wird gelöscht', 'Deleted Objects öffnen', 'Objekt auswählen', 'Restore ausführen', 'Ergebnis prüfen'],
      correctOrder: [0, 1, 2, 3, 4, 5],
      explanation: 'Aktivierung muss vor dem Löschen erfolgen; Restore und Verifikation folgen danach.',
    },
    {
      id: 'ad-recycle-bin-misconception-backup',
      type: 'select-best',
      question: '„Der AD-Papierkorb ersetzt Backups." Stimmt das?',
      options: ['Ja', 'Nein', 'Nur für Benutzer', 'Nur für kleine Domänen'],
      correct: 1,
      explanation: 'Papierkorb und Backup haben unterschiedliche Zwecke; Papierkorb ersetzt kein Backup.',
    },
    {
      id: 'ad-recycle-bin-misconception-enable-after',
      type: 'select-best',
      question: '„Ein Objekt kann auch dann noch über den Papierkorb wiederhergestellt werden, wenn die Funktion erst nach dem Löschen aktiviert wurde." Ist das eine sichere Annahme?',
      options: ['Ja', 'Nein, die Funktion muss vor dem Löschen aktiv sein', 'Nur bei Benutzern', 'Nur bei OUs'],
      correct: 1,
      explanation: 'Der Recycle Bin muss vor dem Löschen aktiv sein, damit die Objekte im Container Deleted Objects landen.',
    },
    {
      id: 'ad-recycle-bin-misconception-restore-to',
      type: 'select-best',
      question: '„Restore To bedeutet: Objekt am ursprünglichen Ort wiederherstellen." Stimmt das?',
      options: ['Ja', 'Nein, das ist Restore; Restore To ist ein anderer Zielort', 'Nein, Restore To löscht', 'Nur für Gruppen'],
      correct: 1,
      explanation: 'Restore bringt an den Ursprungsort zurück, Restore To an einen wählbaren anderen Ort.',
    },
    {
      id: 'ad-recycle-bin-misconception-adsi',
      type: 'select-best',
      question: '„ADSI Edit ist der normale Weg, um Objekte aus dem Papierkorb wiederherzustellen." Stimmt das?',
      options: ['Ja', 'Nein, ADSI Edit ist fortgeschritten und nicht der Standard-Restore-Weg', 'Nur für Experten', 'Ja, aber nur für OUs'],
      correct: 1,
      explanation: 'Normale Restore-Aufgaben erfolgen über das Active Directory Administrative Center; ADSI Edit ist fortgeschritten.',
    },
    {
      id: 'ad-recycle-bin-scenario-user',
      type: 'select-best',
      question: 'Ein Benutzer wurde versehentlich gelöscht und der Papierkorb ist aktiv. Was ist der erste sinnvolle Schritt?',
      options: ['Deleted Objects prüfen', 'Sofort ADSI Edit starten', 'Domain neu installieren', 'Backup des Forests einspielen'],
      correct: 0,
      explanation: 'Zuerst prüft man Deleted Objects, wenn der Recycle Bin aktiv war.',
    },
    {
      id: 'ad-recycle-bin-scenario-wrong-location',
      type: 'select-best',
      question: 'Ein gelöschtes Objekt soll nicht an den alten Ort, sondern in Quarantäne/Recovered zurück. Was verwendest du?',
      options: ['Restore', 'Restore To / Wiederherstellen in...', 'Neu anlegen', 'Backup'],
      correct: 1,
      explanation: 'Restore To ermöglicht die Auswahl eines alternativen Zielorts.',
    },
    {
      id: 'ad-recycle-bin-troubleshoot-invisible',
      type: 'select-best',
      question: 'Deleted Objects sind nicht sichtbar. Was prüfst du?',
      options: ['Ob Papierkorb aktiviert, Ansicht aktualisiert und richtiger Verwaltungsbereich gewählt ist', 'Den DNS-Server', 'Festplattenplatz', 'Druckerwarteschlangen'],
      correct: 0,
      explanation: 'Sichtbarkeit erfordert aktivierten Recycle Bin, Aktualisierung und richtiges Tool.',
    },
    {
      id: 'ad-recycle-bin-troubleshoot-too-late',
      type: 'select-best',
      question: 'Ein Objekt wurde gelöscht, bevor der Papierkorb aktiviert war. Was gilt?',
      options: ['Normaler Recycle-Bin-Restore ist möglicherweise nicht verfügbar', 'Restore funktioniert trotzdem', 'Man aktiviert den Papierkorb und das Objekt erscheint', 'Es gibt nie eine Möglichkeit'],
      correct: 0,
      explanation: 'Für den normalen Papierkorb-Workflow muss das Feature bereits vor dem Löschen aktiv sein.',
    },
    {
      id: 'ad-recycle-bin-troubleshoot-verify',
      type: 'select-best',
      question: 'Das Objekt ist wieder da, aber der Administrator prüft nichts weiter. Was fehlt?',
      options: ['Verifikation von Ort, Attributen und Strukturbezug', 'Ein Backup', 'Neustart des DCs', 'Löschen und erneutes Wiederherstellen'],
      correct: 0,
      explanation: 'Restore sollte durch Verifikation abgeschlossen werden: Ort, Attribute und Bezüge prüfen.',
    },
    {
      id: 'ad-recycle-bin-retention',
      type: 'select-best',
      question: 'Wie lange bleiben gelöschte Objekte typischerweise im aktuellen Laborkontext im Recycle Bin erhalten?',
      options: ['Für eine definierte Aufbewahrungsdauer, im Labor 180 Tage', 'Ewig', 'Nur bis zum nächsten Neustart', 'Nur 1 Tag'],
      correct: 0,
      explanation: 'Die Aufbewahrung ist zeitlich begrenzt; im Quell-Laborkontext werden 180 Tage genannt.',
    },
  ];

  const quiz = [
    { question: 'Wofür ist der AD-Papierkorb gedacht?', options: ['Wiederherstellung versehentlich gelöschter AD-Objekte', 'Backup-Strategie ersetzen', 'Neuinstallation', 'DNS-Verwaltung'], correct: 0, explanation: 'Der Papierkorb hilft bei versehentlich gelöschten Objekten.' },
    { question: 'Wo muss der AD-Papierkorb aktiviert werden?', options: ['Pro Client', 'Forestweit', 'Nur pro OU', 'Nur pro Computer'], correct: 1, explanation: 'Die Aktivierung wirkt forestweit im Active Directory Administrative Center.' },
    { question: 'Was ist der Unterschied zwischen Restore und Restore To?', options: ['Keiner', 'Restore = Ursprungsort, Restore To = anderer Ort', 'Restore = anderer Ort, Restore To = Ursprungsort', 'Beides löscht'], correct: 1, explanation: 'Restore führt an den Ursprungsort, Restore To an einen wählbaren Zielort.' },
    { question: 'Kann der Papierkorb ein Backup ersetzen?', options: ['Ja', 'Nein', 'Nur bei Benutzern', 'Nur bei kurzer Löschung'], correct: 1, explanation: 'Papierkorb und Backup haben unterschiedliche Aufgaben.' },
    { question: 'Wofür wird ADSI Edit im Recycle-Bin-Kontext genutzt?', options: ['Für normale Restore-Aufgaben', 'Nur als fortgeschrittenes Werkzeug', 'Zum Löschen', 'Zum Backup'], correct: 1, explanation: 'ADSI Edit ist fortgeschritten und für normale Restore-Aufgaben nicht nötig.' },
  ];

  const summary = [
    'Der AD-Papierkorb dient zur Wiederherstellung versehentlich gelöschter AD-Objekte.',
    'Er muss bewusst und forestweit im Active Directory Administrative Center aktiviert sein.',
    'Einmal aktiviert, wirkt er forestweit und ist nicht einfach rückgängig zu machen.',
    'Gelöschte Objekte landen im Container Deleted Objects.',
    'Restore bringt ein Objekt an den ursprünglichen Ort zurück.',
    'Restore To ermöglicht das Wiederherstellen an einem anderen Zielort.',
    'Die Aufbewahrung ist zeitlich begrenzt.',
    'Der Papierkorb ersetzt kein vollwertiges Backup.',
    'ADSI Edit ist ein fortgeschrittenes Werkzeug und nicht der Standard-Restore-Weg.',
    'Nach einem Restore sollte das Objekt auf Ort, Attribute und Bezüge verifiziert werden.',
  ];

  return { title: 'AD-Papierkorb & Wiederherstellung', explanations, exercises, quiz, summary };
}
