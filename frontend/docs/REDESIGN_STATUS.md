# CyberLearn Redesign – Status für neue Session

## Vision (abgestimmt mit User)

CyberLearn wird kein IT-Admin-Simulator, sondern ein spielerisches Lernspiel, das anehende IT-Administratoren das **Denken eines Admins** beibringt.

**Leitsatz:** Wir lehren Denken, nicht Klicken.

**Kernprinzipien:**

- Flow > Realismus
- Eine Hauptmission = ein Konzept
- Nebenmissionen festigen gelerntes Wissen
- Mentor Sam fragt, statt Lösungen zu geben
- Kompetenzen statt XP
- Wissensbibliothek = persönliches Admin-Handbuch
- Arbeitsplatz bleibt zentrale Hub
- Detective-Gameplay: Symptom → Information → Hypothese → Test → Lösung → Reflexion

## Bisher umgesetzte Redesign-Schritte

### Schritt 1: Spiel reduzieren

**Geänderte Dateien:**
- `frontend/src/App.jsx`
- `frontend/src/pages/Workspace.jsx`

**Was passierte:**

- Alle nicht zum Kernloop passenden Routen entfernt:
  - Dashboard, Faculty, Module, CheatTerminal, PatchCenter, CustomHub, SandboxTerminal, SpeedRun, Profile, DailyChallenge, Stats, Admin, SubnetTrainer, TicketSimulator, CommandFillBlanks, Flashcards, RetrievalPractice, FinalExam, GuidedMission, ChangeManagement, IhkPrep.
- Verbleibende Routen:
  - `/` und `/workspace` → Arbeitsplatz
  - `/quest/:questId` → Hauptmissionen
  - `/side-mission/:missionId` → Nebenmissionen
  - `/inbox` → Tickets
  - `/infrastructure` → Infrastruktur
  - `/career` → Kompetenzen
  - `/runbooks` → Runbooks
  - `/training` → Trainingsarchiv
  - `/import` → Lehrgangsimport
  - `/settings` → Einstellungen
- Arbeitsplatz-Bereiche neu zugeordnet:
  - **Mitte:** PC & E-Mail, Tickets, Telefon, Terminal
  - **Links:** Wissensbibliothek, Hinweise, Verzeichnis
  - **Rechts:** Flur
  - **Server:** Infrastruktur, Kompetenzen

### Schritt 2: Karriere → Kompetenzen, Missionssprache klarer

**Geänderte Dateien:**
- `frontend/src/pages/Career.jsx`
- `frontend/src/pages/Quest.jsx`
- `frontend/src/pages/Workspace.jsx`

**Was passierte:**

- `Career.jsx` komplett neu geschrieben:
  - Keine XP, keine Karriere-Levels.
  - Kompetenzbalken für jedes gelernte Thema (aus `competencyOverview`).
  - Übungs-Empfehlungen für schwache Bereiche.
  - Firmenstufe bleibt sichtbar.
- `Quest.jsx` auf Denkprozess reduziert:
  - Quest-Typ-Anzeige entfernt.
  - Schritte werden einfach nummeriert.
  - Feedback-Texte von Bewertungssprache zu Lernsprache geändert.
- `Workspace.jsx` Statusleiste:
  - Kein Karriere-Titel mehr, sondern Firmenstufe.

### Schritt 3: Mentor-Sam (angefangen, nicht fertig)

**Geänderte Dateien:**
- `frontend/src/lib/samHelp.js`
- `frontend/src/pages/Quest.jsx` (teilweise)

**Was passierte:**

- `samHelp.js` neu geschrieben:
  - Neue Funktion `requestSamMentor({ stepType, correctAnswer })`.
  - Sam stellt jetzt generische Mentor-Fragen basierend auf dem Schritttyp.
  - Antworten geben Feedback, keine Lösung.
- `Quest.jsx` begonnen:
  - States für `mentorQuestion` und `mentorAnswer` hinzugefügt.
  - Import auf `requestSamMentor` umgestellt.

**Was noch fehlt:**

- Der UI-Teil für den Mentor-Dialog in `Quest.jsx` ist noch nicht fertig eingebaut.
- Der Hilfe-Button muss noch auf den neuen Mentor-Dialog umgebaut werden.
- Der Mentor-Dialog muss gerendert werden (Frage + Optionen + Feedback).
- `requestSamHelp` (alte Funktion) wird nicht mehr verwendet, sollte später bereinigt werden.

## Dateien, die ebenfalls erstellt/geändert wurden (vor dem Redesign)

- `frontend/src/lib/directory.js` – Mitarbeiter-/Asset-Verzeichnis
- `frontend/src/components/Directory.jsx` – UI für Verzeichnis
- `frontend/src/components/DifficultyFeedback.jsx` – Schwierigkeitsfrage nach Missionen
- `frontend/src/lib/questData.js` – Missionen inkl. Checklisten und konkreten Infos
- `frontend/docs/PLAYER_JOURNEY_2HOURS.md` – Ausführliche erste Spielerreise
- `frontend/docs/WORKSPACE_SIMULATION.md` – Dokumentation der Workspace-Simulation
- `frontend/docs/ASSET_PROMPTS.md` – Prompts für fehlende Grafiken

## Bekannte Probleme / Risiken

- Seit dem Wechsel zu keinem Build-Test in dieser Session sind Lint/Buld **nicht geprüft**.
- `Quest.jsx` ist halbfertig umgebaut. Es kann Syntax-Probleme geben.
- `App.jsx` importiert nur noch Core-Seiten. Entfernte Seiten sind nicht mehr erreichbar.
- `Workspace.jsx` verweist auf Icons, die möglicherweise nicht mehr importiert sind (`BookMarked`, `Upload` wurden entfernt, `BookOpen`, `Users` etc. bleiben).

## Empfohlener nächster Schritt in neuer Session

1. **Build & Lint ausführen**, um Probleme zu finden.
2. **Mentor-Dialog in Quest.jsx fertig einbauen.**
   - Button „Mit Sam sprechen“.
   - Öffnet Dialog mit Frage und Optionen.
   - Richtige/falsche Antwort zeigt Feedback.
   - Danach normaler Spielverlauf.
3. **Erste Hauptmission `first-day` final testen.**
4. **Wissensbibliothek automatisch befüllen** nach jeder Hauptmission.
5. **Onboarding/Einarbeitungswoche** implementieren.

## Wichtige Befehle für die neue Session

```powershell
cd C:\Users\vitog\CyberLearn\frontend
npm run lint
npm run build
npx cap sync
cd android
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
./gradlew assembleDebug
```

## Hinweis zum Fortschritt in alter Session

- Git-Commits existieren, aber das letzte Commit wurde nach der halbfertigen Quest.jsx-Änderung nicht mehr gemacht.
- Eine Zusammenfassung der geänderten Dateien vor dem Session-Ende ist empfohlen.
