# IT-Learn Agent Notes

## Project
Mobile-first PWA built with React + TailwindCSS frontend and Node.js + SQLite backend. UI and learning content are in German.

## Commands

```bash
# Backend (from backend/)
npm install
npm run dev        # http://localhost:3001
npm start          # production

# Frontend (from frontend/)
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview

# Capacitor sync after build
npx cap sync

# Mobile screenshot test
node scripts/mobile-test.cjs
```

## Default credentials
- Username: `admin`
- Password: `admin123`
- Other whitelisted accounts: `vitog`, `student`

## Architecture
- Backend API: `http://localhost:3001/api`
- Vite dev proxy forwards `/api` to backend.
- In production the Express backend serves `frontend/dist` and the React SPA.
- SQLite database lives in `backend/data/cyberlearn.db`.
- PWA manifest and service worker are in `frontend/public/`.
- Capacitor Android project is in `frontend/android/`.

## Mobile usage without APK (fastest)
1. Start the backend (`npm start` in `backend/`).
2. Connect your phone to the same Wi-Fi as your PC.
3. Open `http://<PC-IP>:3001` in Chrome on your Samsung.
4. Tap menu → "Zum Startbildschirm hinzufügen". This installs the PWA like an app.

## APK build with Android Studio
The environment here has no JDK/Android SDK, so I prepared the project for you to build locally:
1. Install Android Studio with SDK + JDK.
2. Open `frontend/android/` in Android Studio.
3. Build → Build Bundle(s) / APK(s) → Build APK(s).
4. Transfer the `.apk` to your Samsung and install it.

For a network-based APK, set the backend IP before building:
```powershell
$env:VITE_API_BASE="http://192.168.x.x:3001"
npm run build
npx cap sync
```

## Next RPG expansion after image delivery
- The user is generating consistent RPG artwork. Expected paths are registered in `frontend/src/lib/rpgAssets.js` under `frontend/public/assets/{characters,location,company,stories}/`.
- When the user says the images are ready, first inspect and optimize every asset, then integrate character portraits, company stages, locations, and story art using `RpgArtwork` with fallbacks.
- After image integration, remind the user that the agreed next milestone is long-term gameplay: 20–30 main missions, 100+ learning objectives, 5–10 variants per objective, more company stages, realistic procedural tickets, combined-cause incidents, and a campaign plus endless mode.
- Expansion scaffolding already exists in `contentPacks.js`, `proceduralTickets.js`, versioned `gameState.js`, and `rpgAssets.js`.

## Versionierung (SemVer)

Aktuelle Version: **1.2.0**

- Quelle der Wahrheit: `frontend/package.json` und `frontend/src/lib/version.js`
- Format: `MAJOR.MINOR.PATCH`
  - **PATCH** (1.0.0 → 1.0.1): Bugfixes, kleine Verbesserungen, Performance, UI-Korrekturen, Übersetzungen, kleine Academy-Erweiterungen
  - **MINOR** (1.0.0 → 1.1.0): Neue Lektionen, neue Academy-Bereiche, größere Features, neue Systeme, neue Spielmechaniken
  - **MAJOR** (1.9.5 → 2.0.0): Vollständige Releases, große Architekturänderungen
- Die Version wird in Einstellungen, Web-Version, APK und GitHub-Pages-Build angezeigt.

## Web-Version & GitHub Pages

- Repository: `https://github.com/vitogamedevelop-coder/IT-Admin-Simulator`
- Branch: `main`
- Automatischer Deploy: jeder Push auf `main` triggert `.github/workflows/deploy-pages.yml`
- Ziel-URL: `https://vitogamedevelop-coder.github.io/IT-Admin-Simulator/`
- Build-Parameter: `VITE_BASE_URL=/IT-Admin-Simulator/`
- SPA-Routing: `public/404.html` speichert den ursprünglichen Pfad, `main.jsx` stellt ihn nach dem App-Start wieder her.
- PWA: Manifest unter `public/manifest.json` (display: standalone, Theme-Color, Icons, Start-URL).

## APK build on this Windows environment
- `frontend/scripts/build-apk.ps1` builds the Vite frontend, runs `npx cap sync` and `gradlew assembleDebug` in one step.
- It uses `C:\Program Files\Android\Android Studio\jbr` as `JAVA_HOME`.
- Result: `frontend/android/app/build/outputs/apk/debug/IT-Admin-Simulator.apk` plus a timestamped copy in `frontend/apk-archive/`.
- Example: `cd frontend; powershell -ExecutionPolicy Bypass -File scripts/build-apk.ps1`
- Der Android-Workflow bleibt unverändert; GitHub Pages beeinflusst ihn nicht.

## Milestone B: Sam als Mentor & Topologien

### Goal
Sam becomes a real mentor: multiple explanation styles, player feedback, alternative explanations, remembered learning style, smalltalk, break-room ambience, and the first complete chapter "Topologien".

### Changed/added files
- `frontend/src/lib/academyLessonData.js` (new): central lesson-content registry.
- `frontend/src/components/LessonRunner.jsx` (new): data-driven lesson UI with classic/intuitive/example/visual/mnemonic explanations, in-lesson questions, drag & drop, quiz, feedback and summary.
- `frontend/src/lib/academyProgress.js`: STATE_VERSION 3, added `playerProfile.preferredExplanationStyle`, per-topic `lastExplanationStyle` and `lessonCompletions`.
- `frontend/src/lib/academyEngine.js`: added `recordPreferredStyle()` and `recordLessonCompletion()`.
- `frontend/src/pages/AcademyTopic.jsx`: renders `LessonRunner` when a lesson entry exists for the current topic.
- `frontend/src/pages/Workspace.jsx`: 23 Sam smalltalk lines, atmospheric `BreakRoom` with hints/coffee/colleagues.

### Lesson data model
- `LESSONS[topicKey(categoryId, topicId)]`:
  - `title`, `explanations[]`, `summary[]`, `dragAndDrop`, `quiz[]`.
  - Each `explanation` has `id`, `style` (`classic` | `intuitive` | `example` | `visual` | `mnemonic`), `blocks[]`.
  - Each `block` has `type`: `text` | `diagram` | `list` | `question`.
- The runner uses `sectionId` (first part of `explanation.id`) to group all explanation styles for the same topic section.

### Explanation-style pipeline
1. Runner starts with `playerProfile.preferredExplanationStyle` or `classic`.
2. During a lesson the player can switch to `intuitive`, `example`, `classic` (Warum), `mnemonic`.
3. After the lesson Sam asks: "Hat dir die Erklärung geholfen?" with `Ja`, `Ich glaube schon`, `Noch nicht`.
4. `Noch not` switches to the next available style in the sequence `classic → intuitive → example → visual → mnemonic` and restarts the lesson.
5. Each switch calls `recordPreferredStyle()` so Sam remembers the preference across topics.
6. Completing a lesson calls `recordLessonCompletion()` which bumps theory score and stores the style.

### Topologies content
- Five topologies: Bus, Ring, Stern, Baum, Vermascht.
- Each has description, advantages, disadvantages, use cases, resilience, cost, scalability, example, 1-2 questions and a mnemonic.
- SVG diagrams generated inline for every topology.
- Drag & drop: tap a topology name, then tap the matching diagram.
- Mixed quiz with 5 questions.
- Summary recites the five mnemonic sentences.

### IPv4 preparation
- The `LessonRunner` and `academyLessonData` data model are generic; adding an `ipv4` topic is a matter of adding a new `LESSONS[topicKey('fundamentals', 'ipv4')]` object without touching the engine or progress storage.

### Acceptance checks
- `npm run lint` ✅ (only pre-existing warnings).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅.

## Milestone C1: OSI-Modell & TCP/IP-Modell

### Ziel
Zwei vollständige Academy-Lektionen mit klassischer und intuitiver Erklärung, interaktiven Übungen, Abschlussquiz, gespeichertem Lernfortschritt und Fortschrittssicherung.

### Neue Dateien
- `frontend/src/lib/academyLessons/osi.js` – Daten für das OSI-Modell.
- `frontend/src/lib/academyLessons/tcpIp.js` – Daten für das TCP/IP-Modell.
- `frontend/scripts/academy-milestone-c1-test.mjs` – Automatisierte Tests für Struktur und Fortschrittslogik.

### Geänderte Dateien
- `frontend/src/lib/academyLessonData.js` – registriert `fundamentals/osi-model` und `fundamentals/tcp-ip-model` in `LESSONS`.
- `frontend/src/lib/academyProgress.js` – STATE_VERSION 4, neue Felder `startedAt`, `lastCompletedSectionId`, `lastCompletedSectionTitle`, `completedSectionIds`, `completedQuestionIds`, `completedExerciseIds`.
- `frontend/src/lib/academyEngine.js` – Idempotente Fortschritts-Wrapper, gesperrte Themen geben keine Punkte.
- `frontend/src/components/LessonRunner.jsx` – Wiederaufnahme, Übungstypen `ordering`, `matching`, `input`, `select-best`, kein wiederholtes Scoring.
- `frontend/src/pages/AcademyTopic.jsx` – `openIntro`/`openReview` vergeben keine Punkte mehr „nur fürs Öffnen“.
- `frontend/src/lib/academyMode.js` & `frontend/src/pages/AcademyModeSelect.jsx` – Lehrgangsmodus `course`.
- `frontend/src/pages/AcademyCategory.jsx` – Kursmodus ermöglicht Zugriff auf gesperrte Themen.
- `frontend/src/pages/Workspace.jsx` – Regal-Hotfixes für Portrait.

### OSI-Lektion (7 Schichten)
- Abschnitte: Einführung, Schicht 1–7, Kapselung/Entkapselung, Zusammenfassung.
- Erklärungsstile: `classic` (fachlich) und `intuitive` (Paketversand-Analogie, mit Hinweis dass es nur eine Eselsbrücke ist).
- Übungen: Reihenfolge der 7 Schichten, Aufgaben zuordnen, Geräte/Funktionen zuordnen, Fehlersituationen (Kabel, Switch, IP, Port, App).
- Quiz: 5 Fragen zu Reihenfolge, Geräten, Protokollen, Fehlersuche.

### TCP/IP-Lektion (4 Schichten)
- Abschnitte: Einführung, Netzzugang, Internet, Transport, Anwendung, OSI-Vergleich, Zusammenfassung.
- Übungen: Reihenfolge der 4 Schichten, OSI ↔ TCP/IP zuordnen, Protokolle einordnen, richtig/falsch, Fehler auf Schichtebene.
- Quiz: 5 Fragen zu Schichten, Protokollen, Zuordnungen.

### Fortschrittsvergabe
- Keine Punkte für bloßes Öffnen, Platzhalter, gesperrte Themen oder Zurückgehen.
- Punkte nur für: abgeschlossener Abschnitt, beantwortete Frage, abgeschlossene Übung, Abschlussquiz, erstmalige Lektionsbeendigung.
- Bereits abgeschlossene Aktivitäten vergeben nicht erneut dieselben Punkte; Wiederholungen zählen über kontrollierte Logik.

### Wiederaufnahme
- `lastCompletedSectionId` und `lastCompletedSectionTitle` werden persistiert.
- Beim Wiedereinstieg zeigt Sam eine passende Begrüßung („Beim letzten Mal waren wir bei der Vermittlungsschicht.“).

### Tests
- `npx tsx scripts/academy-milestone-c1-test.mjs` prüft:
  - OSI hat 7 Schichten in korrekter Reihenfolge.
  - TCP/IP hat 4 Schichten in korrekter Reihenfolge.
  - OSI-/TCP-IP-Zuordnung stimmt.
  - Gesperrte Themen vergeben keine Punkte.
  - Bloßes Öffnen vergebt keine Punkte.
  - Abgeschlossene Aktivitäten werden nur einmal gewertet.
  - Wiederaufnahme speichert den letzten Abschnitt.
  - Bestehende Topologien-Lektion bleibt intakt.

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, Archivierung mit 3-Versionen-Rotation ✅.

## Milestone D3: Sams Feedback, realistischer Fortschritt und dynamische Ziele

### Ziel
Sams Hilfe aus Haupt- und Nebenmissionen entfernen, Fortschrittswerte robust auf 0–100 % begrenzen, Lernfortschritt realistisch gestalten, Antwortbewertung nach Inhalt statt Position erzwingen und ein dauerhaft sichtbares Zielsystem oben im Spielinhalt anzeigen.

### Geänderte Dateien
- `frontend/src/lib/academyProgress.js` – `STATE_VERSION` 5, Migration skaliert alte 0–1-Werte und klammt Überschreitungen/negative Werte auf 0–100 ein.
- `frontend/src/lib/academyEngine.js` –
  - `recordQuestionAnswer` akzeptiert `correct` und vergibt Punkte nur bei richtigen Antworten.
  - `recordQuizResult` erfasst Versuche, perfekte Läufe, Best-/Letztwert und gibt `retentionScore` nur bei fehlerfreiem Quiz.
  - `recordContentSeen` speichert tatsächlich gesehenen Lektionsanteil (0–100 %).
  - `isTopicMastered` definiert Meisterschaft: 100 % gesehen, 3 fehlerfreie Quizze, ausreichende Praxis bei praxisrelevanten Themen.
  - `topicOverallProgress` berechnet den sichtbaren Gesamtfortschritt 0–100.
- `frontend/src/components/LessonRunner.jsx` – Quiz-Ergebnis wird am Ende erfasst; falsch beantwortete Fragen geben keine Punkte.
- `frontend/src/pages/AcademyTopic.jsx` – dynamische Begrüßung je nach Fortschritt; Wiederholungsfrage, direkter Rückweg und Weiterlernen bei bereits freigeschaltetem Ping.
- `frontend/src/lib/shuffleOptions.js` – `isCorrectAnswer` akzeptiert auch `isCorrect`-Felder neben `correct`.
- `frontend/src/lib/gameState.js` – `completeQuest` wendet Hauptmissionen über `applyMainMission` auf empfohlene Academy-Themen an.
- `frontend/src/lib/sideMissionEngine.js` – `resolveSideMission` wendet bei korrekter Lösung `applySideMission` auf das zugehörige Academy-Thema an.
- `frontend/src/lib/objectives.js` (neu) – Empfehlungslogik für Lernen, Hauptmissionen und Nebenmissionen.
- `frontend/src/components/ObjectivePanel.jsx` (neu) – einklappbare Zielkarte oben rechts im Arbeitsplatz.
- `frontend/src/pages/Workspace.jsx` – ObjectivePanel in Landschafts- und Portrait-Ansicht eingebunden.
- `frontend/src/lib/onboardingSteps.js` (neu) – Onboarding-Schritte aus `Onboarding.jsx` ausgelagert, um Lint-Warnungen zu reduzieren.
- `frontend/src/lib/samHelp.js` – unbenutzter Parameter entfernt.

### Zielsystem
- **Lernen**: Priorität auf das erste < 30 % Kursthema in der definierten Reihenfolge; danach schwächstes nicht gemeistertes Thema.
- **Hauptmissionen**: Nächste freigeschaltete Mission; ab Kapitel 2 werden zuerst 2 Nebenmissionen benötigt. Grund: sichtbare Mission bleibt erreichbar, aber nächste große Story erfordert Seiteneinsätze.
- **Nebenmissionen**: Maximal 2 offene, thematisch deduplizierte Einsätze aus dem Posteingang.
- **Panel**: Klappt auf Wunsch aus, zeigt aktuelle Empfehlungen und verlinkt zu Academy, Quest oder Side-Mission.

### Tests
- `npx tsx scripts/academy-milestone-d3-test.mjs` prüft:
  - Fortschrittswerte bleiben in 0–100 %, Öffnen/erneutes Lösen zählt nicht doppelt, alte Werte werden migriert.
  - Richtige Antworten zählen, falsche nicht; `shuffleOptions` meldet den korrekten Index; falsche Optionen geben keine ermutigenden Worte.
  - Meisterschaft braucht 100 % Content und 3 fehlerfreie Quizze.
  - Lernempfehlung folgt Kursreihenfolge und überspringt gemeisterte Themen.
  - Hauptmission-Logik zeigt Voraussetzungen und entsperrt nach 2 Nebenmissionen.
  - Nebenmissionen werden maximiert und dedupliziert.

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, Archivrotation mit 4 Versionen ✅.
- Alle bisherigen Tests (D2, C1–C3, D1) weiterhin erfolgreich ✅.

### Offen für spätere Durchläufe
- IPv4, Binärsystem, Subnetzmasken, Subnetting, VLSM, Supernetting.

### Manuelle Geräte-Prüfung empfohlen
- Portrait-Modus: OSI/TCP/IP-Diagramme skalieren, Buttons nicht vom Header/Navigation verdeckt, Hotspots vollständig sichtbar.
- Übungen: Drag-Ordering per Pfeil-Buttons, Matching-Ziele ausreichend groß, Input-Feld mit numerischer Tastatur.

## Milestone C2: Binärsystem, IPv4-Grundlagen und Subnetzmasken

### Ziel
Vorbereitung für Subnetting: Binärrechnung auf Oktettebene, Aufbau von IPv4-Adressen, Netz-/Hostanteil, CIDR-Präfix und Umrechnung in Subnetzmasken.

### Neue Dateien
- `frontend/src/lib/networking/ipv4Math.js` – reine, testbare IPv4-/Binär-Hilfsfunktionen.
- `frontend/src/lib/academyLessons/binarySystem.js` – Lektion „Binärsystem für IPv4“.
- `frontend/src/lib/academyLessons/ipv4.js` – Lektion „IPv4-Grundlagen“.
- `frontend/src/lib/academyLessons/subnetMasks.js` – Lektion „Subnetzmasken“.
- `frontend/scripts/academy-milestone-c2-test.mjs` – automatisierte C2-Tests.

### Geänderte Dateien
- `frontend/src/lib/academyLessonData.js` – registriert `binary-system`, `ipv4`, `subnet-masks` in `LESSONS`.

### Inhalt Binärsystem
- Acht Stellenwerte 128, 64, 32, 16, 8, 4, 2, 1.
- Dezimal ↔ Binär für ein Oktett.
- Übungen: Umrechnung, Fehlersuche, Stellenwerte sortieren.
- Abschlussquiz (5 Fragen).

### Inhalt IPv4
- 32 Bit, vier Oktette, Punktnotation.
- Netzanteil, Hostanteil, CIDR-Präfix.
- Sonderfälle /32, /31, /0.
- Private Bereiche 10/8, 172.16/12, 192.168/16.
- Loopback (127/8), Link-Local/APIPA (169.254/16).
- Übungen: Oktette, Bitanzahl, gültige Adressen, Privat/öffentlich, Präfixvergleich, Netz-/Hostanteil.
- Abschlussquiz (5 Fragen).

### Inhalt Subnetzmasken
- Präfix → Maske, Maske → Präfix.
- Binärdarstellung, relevantes Oktett, Spickzettel 0–8 Netzbits.
- Gültige vs. ungültige Masken (zusammenhängende Einsen).
- Übungen: Umrechnungen, relevantes Oktett, Maskenvalidierung, Zuordnungstabelle.
- Abschlussquiz (5 Fragen).

### Zentrale IPv4-Mathematik
- `decimalToBinaryOctet(value)`
- `binaryOctetToDecimal(binary)`
- `prefixToSubnetMask(prefix)`
- `subnetMaskToPrefix(mask)` (validiert Kontinuität)
- `isValidSubnetMask(mask)`
- `getRelevantOctet(prefix)`
- `getNetworkBitsInRelevantOctet(prefix)`
- `maskValueForBitsInOctet(bits)`
- `isValidIpv4Address(address)`
- `isPrivateIpv4Address(address)`

### Fortschrittsvergabe
- Unverändert: keine Punkte für bloßes Öffnen, gesperrte Themen oder Wiederholungen.
- Punkte nur für echte Aktivitäten; idempotente Wrapper in `academyEngine.js` verhindern Farming.

### Tests
- `npx tsx scripts/academy-milestone-c2-test.mjs` prüft alle Hilfsfunktionen, Lektionsregistrierung, Fortschrittssicherung und bestehende C1-/Topologien-Lektionen.

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, Archivrotation mit 4 Versionen ✅.

### Bewusst NICHT enthalten (C3)
- Berechnung von Netz-ID, Broadcast, erster/letzter Host.
- Vollständiges Subnetting mit klassischer und Sprungweiten-Methode.
- VLSM und Supernetting (C4).

### Manuelle Geräte-Prüfung empfohlen
- Acht-Bit-Darstellung skaliert auf kleinen Bildschirmen.
- Eingabefelder für Binär-/Dezimalzahlen und Masken sind touch-groß.
- Tabellen (Spickzettel) sind im Portrait lesbar.

## Milestone D1: UX-Polish, Benutzerführung und Lernfluss

### Ziel
Verbesserung der Benutzerführung und des Spielflusses. Keine neue Architektur, keine neuen Features, keine Änderung der Lernlogik.

### Geänderte Dateien
- `frontend/src/pages/Workspace.jsx` – Flur-Hotspot, Flurübersicht, Sam-Smalltalk.
- `frontend/src/pages/AcademyTopic.jsx` – dynamische Score-Anzeige, Navigationsbutton, Ping-Übung.
- `frontend/src/pages/AcademyCategory.jsx` – dynamische Score-Anzeige.
- `frontend/src/components/LessonRunner.jsx` – zufällige Antwortreihenfolge, automatischer Scroll, „Warum“-Reset pro Abschnitt.
- `frontend/src/lib/academyLessonData.js` – `getTopicScoreDimensions()`.
- `frontend/src/lib/corridorDialogs.js` – neue zentrale Datei für Flur-Dialoge.
- `frontend/src/lib/shuffleOptions.js` – `shuffleOptions()` Export für LessonRunner.
- `frontend/src/lib/academyLessons/osi.js` – OSI-Schichten-Fragen variabler, Drag-Order ohne Nummern.

### UX-Verbesserungen
- **Flur-Hotspot**: Einheitlich zur Flurübersicht. Keine direkten Sprünge mehr.
- **Flurübersicht**: Buttons mit dezenten Untertiteln für Sam's Büro, Aufenthaltsraum, Mitarbeiter.
- **Sam-Menü**: 4 Einträge statt 5; „Ich habe Fragen“ entfernt.
- **„Nur kurz reden“ / „Bis später“**: Dialog wird korrekt geschlossen, Spieler landet im eigenen Büro.
- **Ping**: Als Teil von Netzwerkgrundlagen, mit Erklärung und Wiedererkennung bei erneutem Betreten.
- **Antwortreihenfolge**: Jede Frage und jedes Quiz startet neu gemischt; die richtige Position ist nicht vorhersagbar.
- **Erklärung anpassen**: Wechsel zwischen Erklärungsstilen scrollt sanft zum Kartenanfang. Jeder neue Abschnitt beginnt automatisch mit „Warum“.
- **OSI Drag-and-Drop**: Keine vorgegebenen Nummern mehr; reine Schichtbezeichnungen.
- **Theorie / Praxis / Festigung**: Nur die Dimensionen werden angezeigt, die das Thema tatsächlich besitzt.

### Tests
- `npx tsx scripts/academy-milestone-d1-test.mjs` prüft:
  - Flur-Hotspot führt zur Übersicht.
  - Sam-Menü hat vier Einträge.
  - Smalltalk/Bye schließen den Dialog.
  - Shuffle-Funktion ist korrekt.
  - OSI-Ordering hat keine Zahlen.
  - OSI-Schichtenfragen haben variierte Optionen.
  - Score-Dimensionen passen zum Thema.

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, Archivrotation mit 4 Versionen ✅.
- Alle bestehenden C1- und C2-Tests weiterhin erfolgreich ✅.

### Manuelle Geräte-Prüfung empfohlen
- Flur-Navigation im Portrait: Buttons mit Untertiteln nicht abgeschnitten.
- Erklärungswechsel in LessonRunner scrollt zuverlässig nach oben.
- OSI-Reihenfolge-Übung auf kleinem Display bedienbar.

## Milestone C3: Subnetting – Netz-ID, Broadcast, Hosts und Sprungweiten

### Ziel
Der Spieler kann relevantes Oktett, Sprungweite, Netz-ID, Broadcast, ersten/letzten Host, Adressanzahl und nutzbare Hosts berechnen. Klassische und intuitive Methode sind verfügbar und liefern identische Ergebnisse.

### Geänderte Dateien
- `frontend/src/lib/networking/ipv4Math.js` – zentrale Subnetting-Berechnungen und Generator.
- `frontend/src/lib/academyLessons/subnetting.js` – neue Lektion.
- `frontend/src/lib/academyLessonData.js` – Registrierung des Subnetting-Themas.
- `frontend/src/components/LessonRunner.jsx` – Unterstützung für `guided-subnetting` und `adaptive-subnetting`.

### Neue mathematische Funktionen
- `calculateNetworkId(ip, prefix)`
- `calculateBroadcast(ip, prefix)`
- `calculateFirstHost(ip, prefix)`
- `calculateLastHost(ip, prefix)`
- `calculateTotalAddresses(prefix)`
- `calculateUsableHosts(prefix)`
- `calculateJumpSize(prefix)`
- `getSubnetBlockBounds(ip, prefix)`
- `generateSubnetProblem(options)` / `generateUniqueSubnetProblems(count, options)`

### Lektionsaufbau
- **Teil 1**: Was ist ein Subnetz? Reines Verständnis ohne Rechnen.
- **Teil 2**: Klassische Methode anhand `192.168.1.50/26`.
- **Teil 3**: Intuitive Sprungweiten-Methode mit Beispielen `192.168.199.3/20` und `10.25.140.18/21`.
- **Interaktive Übungen**: Eingabe-Fragen zu Oktett, Sprungweite, Netz-ID, Broadcast, Hosts, Block-Auswahl, Fehlersuche.
- **Geführter Modus** (`guided-subnetting`): Schritt-für-Schritt-Berechnung eines Beispiels.
- **Adaptive Übung** (`adaptive-subnetting`): Schwierigkeit passt sich anhand von Richtig-/Falsch-Antworten an.
- **Abschlussquiz**: Gemischte, zufällige Fragen ohne Vorhersagbarkeit.

### Tests
- `npx tsx scripts/academy-milestone-c3-test.mjs` prüft:
  - Klassisches Beispiel `192.168.1.50/26`.
  - Intuitive Beispiele `/20` und `/21`.
  - Zusätzliche Fälle `/18`, `/27`, `/8`.
  - `/31` und `/32` Sonderfälle.
  - Generator-Konsistenz.
  - Lektionsregistrierung und Struktur.

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, Archivrotation mit 4 Versionen ✅.
- C1-, C2- und D1-Tests weiterhin erfolgreich ✅.

### Bestätigungen
- ✅ Netz-ID vollständig implementiert
- ✅ Broadcast vollständig implementiert
- ✅ Erster Host vollständig implementiert
- ✅ Letzter Host vollständig implementiert
- ✅ Klassische Methode vorhanden
- ✅ Intuitive Sprungweiten-Methode vorhanden
- ✅ Beide Methoden liefern identische Ergebnisse
- ✅ VLSM in Milestone C4 implementiert
- ✅ Supernetting in Milestone C4 implementiert

### Manuelle Geräte-Prüfung empfohlen
- Eingabefelder für IP-Adressen auf Touch-Geräten gut erreichbar.
- Lange Fragen in `select-best`-Übungen auf kleinem Display lesbar.
- Score-Balken werden korrekt ein- oder ausgeblendet.

## Milestone D2: Neues Spieler-Onboarding & Büro-Einführung

### Ziel
Neue Spieler sollen nach ca. 10 Minuten wissen, wo sie sich befinden, welche Hotspots es gibt, wie Missionen und Nebenmissionen funktionieren und warum Sam wichtig ist. Keine Informationsflut, immer nur ein Bereich zur Zeit.

### Geänderte Dateien
- `frontend/src/components/Onboarding.jsx` – komplette Überarbeitung der Einführung.
- `frontend/src/pages/Workspace.jsx` – zusätzliche Broadcast-Infos (`corridorMenu`, `activeHint`, `cyberlearn:hotspot-activated` Event) für das Tutorial.

### Aufbau der neuen Einführung
1. **Chef-Begrüßung** (Thomas Weber)
2. **Sam stellt sich vor** und kündigt die Büro-Führung an.
3. **Arbeitsplatz**: Computer öffnen und schließen.
4. **Telefon**: Telefon öffnen und schließen.
5. **Whiteboard**: Hinweis öffnen und schließen.
6. **Regal**: Dokumentation/Notebook öffnen und schließen.
7. **Flur**: Tür-Hotspot öffnen, Flurübersicht schließen.
8. **Serverraum**: Tür-Hotspot einmal betätigen.
9. **Abschluss**: Sam fasst zusammen, erste Mission startet.

### Verhalten
- Jeder Bereich wird einzeln und mit maximal 3–4 kurzen Sätzen erklärt.
- Der Spieler muss die geforderte Aktion ausführen, bevor es weitergeht.
- Überspringen ist jederzeit möglich und startet direkt die erste Mission.
- Tutorial kann in den Einstellungen neu gestartet werden.

### Tests
- `npx tsx scripts/academy-milestone-d2-test.mjs` prüft:
  - Einleitung durch Chef und Sam
  - Jeder Bereich kommt genau einmal vor
  - Keine Sackgassen
  - Tutorial kann übersprungen werden
  - Abschluss startet die erste Mission

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, Archivrotation mit 4 Versionen ✅.
- C1-, C2-, C3- und D1-Tests weiterhin erfolgreich ✅.

### Nicht verändert
- Keine Academy.
- Keine Missionen.
- Keine Progressionslogik.
- Keine Workspace-Architektur.
- Keine neuen Lerninhalte.

### Manuelle Geräte-Prüfung empfohlen
- Marker-Hervorhebungen passen auf Touch-Displays.
- Tutorial-Karte ist im Portrait gut lesbar und nicht abgeschnitten.
- "Überspringen"-Button ist erreichbar, ohne Hotspots zu verdecken.

## Milestone C4: VLSM und Supernetting

### Ziel
VLSM ermöglicht unterschiedlich große Subnetze innerhalb desselben Netzes. Supernetting fasst benachbarte Netze zu einer größeren Route zusammen.

### Neue Dateien
- `frontend/src/lib/academyLessons/vlsm.js` – Lektion „VLSM“.
- `frontend/src/lib/academyLessons/supernetting.js` – Lektion „Supernetting“.
- `frontend/scripts/academy-milestone-c4-test.mjs` – automatisierte C4-Tests.

### Geänderte Dateien
- `frontend/src/lib/academyTopics.js` – Themen `fundamentals/vlsm` und `fundamentals/supernetting` (Voraussetzung korrigiert).
- `frontend/src/lib/academyLessonData.js` – Registrierung der neuen Lektionen in `LESSONS`.
- `frontend/src/lib/networking/ipv4Math.js` –
  - `hostsToPrefix(hosts)` und `prefixToHosts(prefix)`
  - `calculateVlsmAllocations(baseNetwork, basePrefix, requiredHostsList)`
  - `generateVlsmProblem()`
  - `calculateSupernet(networks)`
  - `generateSupernetProblem()`

### Inhalt VLSM
- Warum klassisches Subnetting Adressen verschwendet.
- Sortieren nach Größe, größtes Subnetz zuerst.
- Präfix aus Hosts berechnen: `32 − ceil(log2(Hosts + 2))`.
- Blöcke aneinanderreihen und ausrichten.
- Übungen: Präfix aus Hosts, nutzbare Hosts, Reihenfolge, Netz-ID des größten Subnetzes.
- Abschlussquiz (6 Fragen).

### Inhalt Supernetting
- Zusammenfassen benachbarter Netze zu einer Route.
- Gemeinsame führende Bits ermitteln.
- Voraussetzungen: zusammenhängender Bereich, Blockgrenzen, Zweierpotenz.
- Übungen: gemeinsamer Präfix, zusammenfassende Netz-ID, richtige Route auswählen.
- Abschlussquiz (3 Fragen).

### Tests
- `npx tsx scripts/academy-milestone-c4-test.mjs` prüft:
  - `hostsToPrefix` für typische Hostzahlen.
  - `prefixToHosts` für typische Präfixe.
  - VLSM-Allokation passt ins Basisnetz.
  - Supernetting von vier /24-Netzen ergibt /22.
  - Beide Lektionen sind registriert und enthalten Erklärungen, Übungen und Quiz.

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, Archivrotation mit 4 Versionen ✅.
- Alle bisherigen Tests (C1–C3, D1–D3) weiterhin erfolgreich ✅.

## D3 Hotfix: Header, ObjectivePanel & Tutorial-Crash

### Ziel
Kleiner UX-/Layout-Hotfix ohne Änderungen an Academy, Progression, Missionen, Workspace, Panorama, Hotspots oder Swipe-System.

### Behobene Probleme

1. **ObjectivePanel wurde vom Header überdeckt**
   - Ursache: Das Panel lag innerhalb von `Workspace.jsx`, das als `fixed inset-0` Layer ohne eigenen `z-index` gerendert wird. Ein positioniertes Element ohne `z-index` bildet zwar einen Stacking-Context, liegt aber im Stapel unter dem Header (`z-10`). Dadurch war das Panel trotz internem `z-30` hinter dem Header.
   - Lösung: Das Panel wird jetzt in `Layout.jsx` oberhalb des Headers gerendert, hat `z-50` und startet bei `top: var(--header-height)`. Es verwendet damit denselben Viewport-Bereich wie andere normale Ansichten und überlappt den Header nicht.

2. **Globaler Header war zu hoch**
   - Header auf feste Höhe `h-12` (3rem) reduziert, vertikale Padding verkleinert, Logo auf 20px gesetzt.
   - `--header-height` wird als CSS-Variable auf dem Header gesetzt, damit das ObjectivePanel exakt darunter beginnt.

3. **Tutorial-Button „Sam einladen“**
   - Button-Text in `frontend/src/lib/onboardingSteps.js` auf „Weiter“ geändert.
   - Pfeil-Icon (`ArrowRight`) im Button ergänzt.

4. **Tutorial-Crash nach „Weiter“**
   - Root Cause: `frontend/src/components/Onboarding.jsx` wurde in einem früheren Refactoring auf `frontend/src/lib/onboardingSteps.js` umgestellt. Zwei interne Stellen verwendeten aber weiterhin die alte Konstante `STEPS` (z.B. `STEPS.length - 1`). Da `STEPS` nicht mehr existierte, warf der Code einen `ReferenceError`. Die App-`ErrorBoundary` fing den Fehler ab und zeigte „Ansicht konnte nicht geladen werden.“
   - Lösung: Beide Vorkommen von `STEPS` in `Onboarding.jsx` durch `ONBOARDING_STEPS` ersetzt.

### Geänderte Dateien
- `frontend/src/components/Layout.jsx` – Header-Höhe als CSS-Variable, ObjectivePanel oberhalb des main-Bereichs.
- `frontend/src/components/ObjectivePanel.jsx` – Positionierung auf `fixed top-[var(--header-height)] right-3 z-50`.
- `frontend/src/components/Onboarding.jsx` – `STEPS` durch `ONBOARDING_STEPS` ersetzt, Button mit Pfeil.
- `frontend/src/lib/onboardingSteps.js` – Button-Label „Weiter“.

### Tests
- `npx tsx scripts/academy-milestone-d2-test.mjs` ✅
- `npx tsx scripts/academy-milestone-d3-test.mjs` ✅

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, Archivrotation mit 4 Versionen ✅.
