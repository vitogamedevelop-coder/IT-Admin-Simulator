# Workspace Simulation – Abschlussdokumentation

## Was umgesetzt wurde

Das Spiel wurde von einem Multiple-Choice-Quiz zu einer interaktiven IT-Arbeitsplatz-Simulation erweitert. Der Spieler sitzt an einem Schreibtisch, öffnet E-Mail, Telefon, Terminal und Notizheft, und löst Vorfälle in einem modularen, datengetriebenen System.

## Geänderte und neue Dateien

### Neue Systeme

| Datei | Zweck |
|-------|-------|
| `frontend/src/lib/shuffleOptions.js` | Deterministisches Mischen von Antwortmöglichkeiten, korrekte Antwort über ID/Objekt |
| `frontend/src/lib/dialogSystem.js` | Datenmodell für Telefonate und direkte Gespräche |
| `frontend/src/components/DialogView.jsx` | Typewriter-Dialog mit Tap-to-skip/advance |
| `frontend/src/lib/emails.js` | E-Mail-Modell, Beispiele, Lesestatus |
| `frontend/src/components/EmailApp.jsx` | E-Mail-Anwendung mit Absender, Betreff, Priorität, Anhängen |
| `frontend/src/components/PhoneApp.jsx` | Telefon mit eingehenden Anrufen und Dialog |
| `frontend/src/lib/workspace.js` | Arbeitsplatzbereiche (Mitte, links, rechts, Serverraum) |
| `frontend/src/pages/Workspace.jsx` | Zentrale Arbeitsplatzansicht mit Benachrichtigungen |
| `frontend/src/lib/notificationSystem.js` | Zentrale Benachrichtigungswarteschlange |
| `frontend/src/lib/notebook.js` | Freischaltbares Notizheft / Cheat Sheet |
| `frontend/src/components/Notebook.jsx` | UI für Notizheft mit Suche und Kategorien |
| `frontend/src/lib/terminal/commands.js` | Simulierte Befehle: ipconfig, ping, nslookup, tracert, netstat, hostname |
| `frontend/src/lib/terminal/scenarios.js` | Missionsabhängige Terminal-Umgebungen |
| `frontend/src/components/Terminal.jsx` | Mobile Terminal-UI mit Verlauf und Befehlsvorschlägen |
| `frontend/src/lib/learningImport.js` | Validierung und Vorschau für Lehrgangsimporte |
| `frontend/src/pages/LearningImport.jsx` | UI zum Einfügen und Prüfen neuer Lerninhalte |
| `LearningContent/Templates/*` | Vorlagen für JSON- und Markdown-Importe |

### Geänderte Kerndateien

| Datei | Änderung |
|-------|----------|
| `frontend/src/lib/gameState.js` | Savegame-Version 3, neue Felder für Benachrichtigungen, Workday, Import-IDs, Notebook-Freischaltung bei Quest-Abschluss |
| `frontend/src/lib/questData.js` | `unlockNotebook` für `first-day` und `dns-outage` |
| `frontend/src/pages/Quest.jsx` | Antwortmischung für Quest-Schritte |
| `frontend/src/pages/SideMission.jsx` | Antwortmischung für Nebenmissionen |
| `frontend/src/pages/GuidedMission.jsx` | Antwortmischung für tägliche Missionen |
| `frontend/src/pages/Dashboard.jsx` | Link zu Arbeitsplatz und Lehrgangsimport, Initialisierung der Benachrichtigungen |
| `frontend/src/App.jsx` | Neue Routen `/workspace` und `/import` |

## Architektur

### Antwortsystem

- `normalizeOptions()` wandelt String-Arrays in Objekte mit `id`, `label`, `correct` um.
- `getOrderedOptions()` liefert eine gemischte Reihenfolge, die pro Frage in `localStorage` persistiert wird.
- Die Auswertung prüft `option.correct`, nicht die Position.

### Dialogsystem

- Dialoge bestehen aus Knoten mit `text`, `delay`, `options` und `autoNext`.
- `DialogView` zeigt Text Buchstabe für Buchstabe an. Ein Tap beendet den aktuellen Block, ein weiterer Tap springt weiter.
- Porträts werden aus `rpgAssets` geladen.

### Benachrichtigungssystem

- `notificationSystem.js` verwaltet eine lokale Warteschlange.
- `seedInitialNotifications()` erzeugt die erste E-Mail und Hauptmissions-Benachrichtigung.
- `hasBlockingNotification()` verhindert, dass wichtige Ereignisse verloren gehen oder gleichzeitig beginnen.
- Alle Verzögerungen sind in `defaultRules` konfigurierbar (zentral, keine festen Zeiten im Code).

### Terminal

- Befehle werden in `lib/terminal/commands.js` registriert.
- Das aktive Szenario kommt aus `lib/terminal/scenarios.js` und hängt von der Mission ab.
- Ausgaben sind konsistent: `ipconfig`, `ping`, `nslookup` passen zum gleichen simulierten Rechner.
- Es werden keine echten Systembefehle ausgeführt.

### Notizheft

- Einträge haben `unlocked`, `unlockedBy`, Kategorie, Syntax, Beispiel und Anwendungsfall.
- Quest-Abschlüsse rufen `unlockNotebookEntries(quest.id)` auf.
- `Notebook` zeigt nur freigeschaltete Einträge, filterbar und durchsuchbar.

### Lehrgangsimport

- Ordnerstruktur:
  - `LearningContent/Inbox` – neue Inhalte
  - `LearningContent/Processed` – verarbeitete Inhalte
  - `LearningContent/Rejected` – ungültige Inhalte
  - `LearningContent/Templates` – Vorlagen
  - `LearningContent/Generated` – Vorschaudaten
- Formate: JSON und Markdown.
- `validateLearningContent()` prüft Pflichtfelder, Fragen und Missionen.
- `previewFromContent()` zeigt eine Vorschau, bevor Inhalte aktiv werden.
- Aktivierung ist momentan noch manuell vorbereitet (UI zeigt, was übernommen werden würde).

## Mobile Optimierung

- Alle neuen Komponenten verwenden große Touch-Buttons, lesbare Schrift und scrollbare Bereiche.
- Das Terminal funktioniert mit der mobilen Systemtastatur (`inputMode="text"`, keine Auto-Korrektur).
- Die Arbeitsplatzansicht ist in Bereiche unterteilt, die auf kleinen Displays gut bedienbar sind.
- Die APK wurde erfolgreich gebaut: `IT-Learn-Workspace-Sim-debug.apk` (ca. 6,5 MB).

## Beispiel-Lernkette `ipconfig`

1. **Hauptmission `first-day`** – E-Mail von Mara, APIPA-Adresse, geführte Anwendung von `ipconfig /all`.
2. **Nebenmissionen** – Wiederverwendung der Lernziele `dhcp-apipa`, `dns-isolation`, `effective-permissions` mit zufälliger Antwortposition.
3. **Notizhefteinträge** – `note-ipconfig` und `note-ping` werden nach Abschluss freigeschaltet.
4. **E-Mail/Telefon** – `exampleEmails` und `examplePhoneDialog` zeigen realistische Kommunikation.
5. **Terminal** – Szenario `first-day` gibt passende `ipconfig`-Ausgaben.
6. **Speicherung** – Lernfortschritt, freigeschaltete Einträge und Quest-Status bleiben im `localStorage` erhalten.

## Bekannte Einschränkungen und nächste Schritte

- Der Benachrichtigungs-Scheduler verwendet noch statische Zeiten; ein echter zeitgesteuerter Worker wäre für produktive Nutzung sinnvoll.
- Der Lehrgangsimport zeigt Vorschauen, die manuelle Aktivierung in die Spieldaten ist noch als UI-Platzhalter vorbereitet.
- Workspace-Hintergrundbilder sind noch Platzhalter (farbiges Panel mit Text).
- Weitere Terminalbefehle (z. B. `netsh`, `Get-ADUser`) können als Module ergänzt werden.
- Gesicht-zu-Gesicht-Gespräche an der Tür/Schreibtisch sind technisch vorbereitet, brauchen aber noch eigene Trigger und Posen.

## Fehlende Assets

- Workspace-Hintergrund für Mitte (Schreibtisch mit PC und Telefon).
- Workspace-Hintergrund für links (Regal/Whiteboard).
- Workspace-Hintergrund für rechts (Tür/Flur mit Kollegen).
- Workspace-Hintergrund für Serverraum.
- Charakterposen für direkte Gespräche an der Tür oder am Schreibtisch.
- Benachrichtigungs-Overlay-Icon oder Badge-Grafik.
- In-world Icons für PC, Telefon, Notizheft, Terminal (aktuell werden Lucide-Icons verwendet).

## Build-Status

- `npm run lint` – 0 Fehler, nur bestehende Warnungen.
- `npm run build` – erfolgreich.
- `npx cap sync` – erfolgreich.
- `./gradlew assembleDebug` – erfolgreich, APK erzeugt.
