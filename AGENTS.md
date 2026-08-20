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

Aktuelle Version: **1.32.3**

- Quelle der Wahrheit: `frontend/package.json` und `frontend/src/lib/version.js`
- Format: `MAJOR.MINOR.PATCH`
  - **PATCH** (1.0.0 → 1.0.1): Bugfixes, kleine Verbesserungen, Performance, UI-Korrekturen, Übersetzungen, kleine Academy-Erweiterungen
  - **MINOR** (1.0.0 → 1.1.0): Neue Lektionen, neue Academy-Bereiche, größere Features, neue Systeme, neue Spielmechaniken
  - **MAJOR** (1.9.5 → 2.0.0): Vollständige Releases, große Architekturänderungen
- Die Version wird in Einstellungen, Web-Version, APK und GitHub-Pages-Build angezeigt.

## NEXUS Cisco Learning Roadmap (verbindlich)

Die fachliche Progression folgt dem realen Cisco/Packet-Tracer-Lehrgang. Nicht jeder Block ist implementiert – die Roadmap dient als verbindliche Planungs- und Unlock-Grundlage.

### BLOCK 1 – Grundkonfiguration
Bereits abgedeckt:
- `hostname`, `enable secret`, lokale Benutzer, `no ip domain-lookup`
- `line console 0`, `password`/`login`/`login local`, `exec-timeout`
- `service password-encryption`
- `copy running-config startup-config` / `write` und Verifikation

### BLOCK 1.5 – SSH / Remote Management
Als bewusste Erweiterung der Grundkonfiguration, NICHT als isoliertes Thema. Ziel: aus der lokalen Konsole wird sichere Fernadministration.

#### Lehrgangslogik
- RSA-Schlüssel mindestens 768 Bit für SSHv2 (Cisco/Packet-Tracer-konform); bevorzugt 1024 Bit.
- `crypto key generate rsa` gefolgt von Modulus 1024 ist die bevorzugte Lehrgangslösung.
- `ip ssh version 2` zwingend erforderlich. SSHv1 wird nicht gelehrt.

#### Router
- Grundkonfiguration unmittelbar davor; SSH baut darauf auf.
- Kein künstliches Management-VLAN erfinden, wenn eine geroutete Interface-IP existiert.
- Ablauf: `crypto key generate rsa`, `ip ssh version 2`, `line vty 0 15`, `login local`, `transport input ssh`.

#### Layer-2-Switch
- Management-SVI notwendig, weil das Gerät selbst keine geroutete IP hat.
- `vlan <ID>`, `name <NAME>`, `interface vlan <ID>`, `ip address <IP> <MASK>`, `no shutdown`.
- `ip default-gateway <GATEWAY>` für Fernzugriff über andere Netze.
- VLAN-ID und Name szenarioabhängig, kein globales VLAN 99. Kontrollierter Pool: 10, 50, 77, 99, 100, 172, 200, 250. Namen: MGMT, MANAGEMENT, ADMIN, IT, NETZADMIN.
- Trunk-Kontext: Management-VLAN auf Trunk erlauben, nur wenn Trunk bereits eingeführt. Sonst Topologie wählen, die keinen neuen Trunk-Befehl verlangt.

#### Layer-3-Switch
- Auch SVI möglich, aber sauber trennen zwischen reinem Management-SVI und echtem Inter-VLAN-Routing.
- Block 1.5 behandelt nur Management-Ansicht; Routing gehört Block 3.

#### Gameplay / Story
- HM3 zunächst L2-Switch-Einstieg, weil der Lernzusammenhang am vollständigsten ist (lokal → SVI → IP → Gateway → SSH).
- Nach HM3 dürfen Nebenmissionen Router/L3-Switch-Variationen nutzen.
- Generator variiert Management-VLAN; Aufgabenstellung gibt das VLAN vor.
- Sam-Fragen sollen Lerntransfer fordern: Router braucht kein Management-VLAN; L2-Switch ohne IP reicht SSH nicht; VLAN 99 ist keine automatische Lösung.

### BLOCK 2 – Layer 2 Switching
Bereits abgedeckt / in Ausbau:
- VLAN, VLAN-Name, Access-Ports, Trunk, `interface range`
- Allowed VLANs, Parking-VLAN, `shutdown` ungenutzter Ports
- STP-Grundlagen später ergänzen

### BLOCK 3 – Layer 3 / Routing
Bereits abgedeckt / in Ausbau:
- Interface-IP, `no switchport`, `no shutdown`
- Statische Routen, SVI, `ip routing`
- Router-on-a-Stick, Subinterfaces, `encapsulation dot1q`
- DHCP Relay erst nach L3-Kontext (`ip helper-address`)

### Danach
OSPF, ACLs, Paketfilter, NAT/PAT, komplexe kombinierte Szenarien.

### Grundsatz
- DHCP Relay nie als isolierter L2-Befehl lehren.
- STP erst nach VLAN/Trunk-Grundlagen einführen.
- `interface range` und Access-/Trunk-Konfiguration vor Layer-3-IP.

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

## Verbindlicher Release-Ablauf (ab Milestone W1.1)

Ab sofort gilt für **jede** abgeschlossene Änderung am Spiel — egal ob neues Quiz, neue Lektion,
Bugfix, UI-Änderung, Performance-Verbesserung, neue Mission oder neue Funktion — verpflichtend der
folgende Ablauf, bevor die Aufgabe als abgeschlossen gilt:

1. **Version erhöhen (SemVer)** in `frontend/package.json` (und wo sonst die Version referenziert
   wird, siehe „Versionierung" oben):
   - **PATCH**: Bugfix, Performance, kleine UI-Korrektur, kleinere inhaltliche Korrektur.
   - **MINOR**: neue Lektion, neues Quizpaket, neue Funktion, neuer größerer Spielinhalt.
   - **MAJOR**: großer inkompatibler Umbau oder vollständiger neuer Hauptrelease.
2. **Alle relevanten Tests ausführen** (z. B. `scripts/*-test.mjs` der betroffenen Milestones sowie
   ggf. ein neuer Test für die aktuelle Änderung).
3. **Lint ausführen**: `npm run lint` (frontend) — muss ohne neue Fehler/Warnungen durchlaufen.
4. **Web-Production-Build erzeugen**: `npm run build` (frontend).
5. **Android-/Capacitor-Sync ausführen**: `npx cap sync`.
6. **Neue Android-APK erstellen** und wie bisher archivieren:
   `powershell -ExecutionPolicy Bypass -File scripts/build-apk.ps1`.
7. **Änderungen committen** (aussagekräftige Commit-Message, Versionsnummer im Body erwähnen).
8. **Änderungen auf `main` pushen.**
9. **GitHub Actions bis zum Abschluss prüfen** (`.github/workflows/deploy-pages.yml`), z. B. über die
   GitHub Actions API (`GET /repos/.../actions/runs`), bis `status: completed` und
   `conclusion: success`.
10. **Sicherstellen, dass GitHub Pages erfolgreich aktualisiert wurde** (z. B. Live-Abruf eines
    geänderten Assets/Bundles von `https://vitogamedevelop-coder.github.io/IT-Admin-Simulator/`).
11. **Abschlussbericht ausgeben** mit:
    - neuer Versionsnummer
    - Commit-Hash
    - geänderten Dateien
    - Testergebnissen (Tests, Lint, Build)
    - APK-Pfad
    - GitHub-Actions-Ergebnis
    - Live-Web-URL
    - manuell zu prüfenden Punkten

**Wichtig:**
- Die Veröffentlichung auf GitHub Pages erfolgt ausschließlich automatisch über den bestehenden
  GitHub-Actions-Workflow nach einem Push auf `main` — niemals eigenständig oder zeitgesteuert
  außerhalb dieses Ablaufs.
- Schlagen Tests, Build, APK-Erstellung oder Deployment fehl: **nicht** so tun, als wäre das Release
  abgeschlossen. Stattdessen den Fehler konkret dokumentieren, die Ursache beheben und den
  Release-Ablauf vollständig erneut durchführen.

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

## Cisco – "Grundlagen" als erste Lektion

### Ziel
Neue Einstiegslektion "Grundlagen" für die Kategorie "Cisco – Packet Tracer", direkt nach dem
Themencheck und vor der bisherigen ersten Lektion "Packet Tracer Oberfläche".

### Neue Dateien
- `frontend/src/lib/academyLessons/ciscoGrundlagen.js` – vollständige LessonRunner-Lektion:
  hierarchisches Netzwerk-Design (Access/Distribution/Core, Collapsed Core), L2-/Multilayer-Switch,
  Router, Schnittstellenbezeichnungen/-geschwindigkeiten, Cisco IOS, Speicherkomponenten
  (ROM/RAM/NVRAM/Flash), Konfigurationsdateien, Bootvorgang, serieller Zugriff, Konfigurationsmodi
  und deren Wechsel, Setup Mode, ROMMON, Werksreset und dessen Auswirkungen, sowie
  Befehlsvervollständigung/-verkürzung, Fehlermeldungen und Copy & Paste.
- `frontend/scripts/academy-cisco-grundlagen-test.mjs` – Tests für Reihenfolge, Prerequisites,
  Vollständigkeit der bisherigen Themen und Inhaltsabdeckung.

### Geänderte Dateien
- `frontend/src/lib/academyTopics.js` – neues Thema `grundlagen` als erstes Thema der Kategorie
  `cisco-packet-tracer` (keine Prerequisites); `packet-tracer-ui` hat jetzt `grundlagen` als
  Voraussetzung. Alle anderen Cisco-Themen unverändert (nur eine Position weiter hinten).
- `frontend/src/lib/academyLessonData.js` – neue Lektion registriert.
- `frontend/scripts/academy-milestone-c5_1-test.mjs`, `academy-milestone-c5_2-test.mjs`,
  `academy-milestone-d5-test.mjs` – an die jetzt nicht mehr komplett leere Kategorie
  `cisco-packet-tracer` angepasst (leere-Kategorie-Tests laufen jetzt gegen `linux-virtualbox`).

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.

## Milestone C5.3: Grundlagen überarbeiten und Inhalte konsolidieren

### Ziel
Themencheck an den Anfang jeder Kategorie verschieben, TCP/UDP/TCP-vs-UDP zu einer vollständigen
Lektion mit Three-Way-Handshake zusammenführen, und die vier separaten Platzhalter-Themen
Kommunikationsarten/Betriebsarten/Ausbreitungsarten/Übertragungsmedien zu einer Lektion vereinen.

### Neue Dateien
- `frontend/src/lib/academyLessons/tcpUdp.js` – vollständige LessonRunner-Lektion „TCP & UDP“
  (TCP/UDP ausgeschrieben, Eigenschaften, Vergleich, Three-Way Handshake, Ports, Admin-Bezug).
- `frontend/src/lib/academyLessons/kommunikationUebertragung.js` – vollständige Lektion
  „Kommunikations- und Übertragungsarten“ mit vier Abschnitten.
- `frontend/scripts/academy-milestone-c5_3-test.mjs` – automatisierte Tests für dieses Milestone.

### Geänderte Dateien
- `frontend/src/lib/academyTopics.js` – Themen `tcp`, `udp`, `tcp-vs-udp` zu `tcp-udp` zusammengeführt;
  `kommunikationsarten`, `betriebsarten`, `ausbreitungsarten`, `uebertragungsmedien` zu
  `kommunikation-uebertragung` zusammengeführt.
- `frontend/src/lib/academyLessonData.js` – neue Lektionen registriert, alte Custom-Mini-Lesson-Fälle
  für TCP/UDP entfernt (laufen jetzt über den generischen LessonRunner).
- `frontend/src/lib/academyProgress.js` – `STATE_VERSION` 7: `migrateLegacyTopicMerges()` überführt
  vorhandenen Fortschritt unter den alten Themen-IDs automatisch in die neuen, zusammengeführten Themen
  (bester Status, höchste Scores, Vereinigung der Resume-Felder).
- `frontend/src/pages/AcademyCategory.jsx` – Themencheck-Karte direkt nach Lernzielen/Übersicht
  gerendert, nicht mehr am Ende der Themenliste.
- `frontend/src/pages/AcademyTopic.jsx` – TCP/UDP-Sonderfälle (`TcpUdpLesson`, `TcpVsUdpQuiz`,
  `isTcpUdpFamily`) entfernt; TCP & UDP läuft jetzt wie jede andere Lektion über `LessonRunner`.
- `frontend/src/pages/AcademyPlacementTcpUdp.jsx` – Einstufungstest markiert jetzt das zusammengeführte
  Thema `tcp-udp` statt drei einzelner Themen; zusätzliche Handshake-Frage ergänzt.

### Tests
- `npx tsx scripts/academy-milestone-c5_3-test.mjs` prüft Themencheck-Position, Inhalt und Struktur
  beider neuer Lektionen, Entfernen der alten Themen-IDs, Fortschrittsmigration und Konsistenz der
  Kategorie-Zusammenfassung.
- Bestehende Tests (C1–D7, Recovery) wurden an die neue Themenstruktur angepasst.

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.

## Hotfix H1: Übungen in Subnetting/VLSM/Supernetting funktionierten nicht

### Ursache
`subnetting.js`, `vlsm.js` und `supernetting.js` hatten jeweils eine lokale `inputExercise()`-
Hilfsfunktion, die das Feld `acceptedAnswers` statt `answers` zurückgab. Die `InputExercise`-
Komponente in `LessonRunner.jsx` liest aber unbedingt `exercise.answers.some(...)` bei **jedem**
Render – bei `undefined` wirft das sofort eine `TypeError`, die vom umgebenden `ErrorBoundary`
abgefangen wurde und statt der Übung einen Fehlerdialog zeigte. Nur diese drei Themen nutzten diese
fehlerhafte Hilfsfunktion; alle anderen Lektionen (z. B. Binärsystem, Subnetzmasken) verwendeten
bereits korrekt `answers`.

### Fix
- `answers` statt `acceptedAnswers` in allen drei Dateien.
- `frontend/src/lib/validateLessonDefinition.js` prüft jetzt zusätzlich, dass jede `input`-Übung ein
  nicht-leeres `answers`-Array besitzt – verhindert ein Wiederauftreten, statt nur das Symptom zu
  beheben.
- `frontend/scripts/hotfix-h1-test.mjs` (neu) validiert alle registrierten Lektionen und simuliert die
  echte Antwortprüfung für Binärsystem, IPv4, Subnetzmasken, Subnetting, VLSM und Supernetting.

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

## Mission System V2 Phase 0: Clean Reset & Fundament

### Ziel
Vorbereitung des neuen adaptiven, realitätsnahen Missionssystems. Alte Demo-/Prototyp-Missionen und ausschließlich dafür benötigte Inhalte entfernt, die technische Infrastruktur erhalten, ein domänenübergreifender Skill-Tree und eine erweiterte Kompetenzarchitektur geschaffen.

### Entfernte / geleerte Inhalte (alte Missionen)
- `frontend/src/lib/questData.js` – `quests` leer; `questById`, `availableQuests`, `recommendedQuest` beibehalten.
- `frontend/src/lib/diagnosticQuestData.js` – `diagnosticQuests` leer; `diagnosticQuestById` beibehalten.
- `frontend/src/lib/learningObjectives.js` – `learningObjectives` und `foundationalObjectives` leer.
- `frontend/src/lib/emails.js` – `exampleEmails` leer.
- `frontend/src/lib/terminal/scenarios.js` – Demo-Szenarien entfernt, leeres `defaultScenario` als Fallback.
- `frontend/src/lib/notebook.js` – `unlockedBy`-Felder entfernt, Notizen bleiben als Infrastruktur.
- `frontend/src/lib/proceduralTickets.js` – Ticket-Vorlagen leer.
- `frontend/src/lib/dialogSystem.js` – Beispiel-Dialog `examplePhoneDialog` entfernt, Factory-Funktionen beibehalten.
- `frontend/src/lib/rpgAssets.js` – Legacy-`storyAsset`-Mapping entfernt.

### Erhaltene Infrastruktur
- `frontend/src/pages/Quest.jsx` – Quest-Seite.
- `frontend/src/pages/DiagnosticQuest.jsx` – Diagnose-Quest-Seite.
- `frontend/src/pages/SideMission.jsx` – Nebenmissionsseite.
- `frontend/src/pages/GuidedMission.jsx` – „Tägliche Mission“; zeigt bei leerem Fragen-Pool einen Hinweis.
- `frontend/src/pages/Workspace.jsx` – Arbeitsplatz.
- `frontend/src/lib/gameState.js` – Spielerfortschritt; `stateVersion` 5 setzt Missionsdaten bei Migration zurück.
- `frontend/src/lib/competency.js` – Legacy-Kompetenzmodell bleibt für Quiz/Academy gültig.
- `frontend/src/lib/missionLog.js` – Missionslebenszyklus-Log.
- `frontend/src/lib/diagnosticState.js` – State-Machine für diagnostische Quests.
- `frontend/src/lib/sideMissionEngine.js` – Posteingang/Seiteneinsätze.
- `frontend/src/lib/notificationSystem.js` – Notifications, bleibt funktional.
- `frontend/src/lib/objectives.js` – Empfehlungslogik.
- `frontend/src/lib/missionPlanner.js` – Leere Mission als Platzhalter.

### Neue Fundament-Dateien
- `frontend/src/lib/skillTree.js` – Domänen-agnostischer Skill-Tree mit Cisco-Skill-Hierarchie, Kompetenzzuständen, Event-Tracking und Adaptive-Difficulty-Hilfsfunktionen.

### Skill-Hierarchie (Cisco, aus Academy-Lektionen abgeleitet)
- `basic_configuration`: CLI Navigation, Hostname, Passwörter, Benutzer, Interface, `no shutdown`, Speichern.
- `switching`: VLAN, Access-Port, Trunk.
- `routing`: Router-Basics, statisches Routing, OSPF, Default-Route, Inter-VLAN-Routing.
- `multilayer_switching`: SVI, Layer-3-Routing auf dem Switch.
- `stp`: Root Bridge, Portrollen, Path Cost.
- `remote_administration`: SSH.
- `dhcp`: DHCP Relay.
- `acl`: Standard/Extended/Named ACL und Anwendung.
- `packet_filter`: Stateless vs. Stateful (CBAC / `ip inspect`).
- `nat`: Static NAT, Dynamic NAT, PAT/Overload, Port Forwarding.
- `verification`: `show running-config`, `show ip interface brief`, `show ip route`, `show vlan brief`, `show ip nat translations`.

### Kompetenzzustände (Skill Tree)
- `unseen`, `introduced`, `practicing`, `mostly_secure`, `secure`, `review_due`.
- `recordSkillEvent` speichert: correct/incorrect, usedHint, revealedSolution, cliError, misconception, timing, difficulty, success streaks.
- Lösungs-Anzeige zählt **nicht** als selbstständig gelöst (keine Mastery-Erhöhung).

### CLI-Architektur: aktueller Stand und geplante Erweiterungen
- Aktuelle Logik: `frontend/src/lib/ciscoCli.js` normalisiert Zeilen, expandiert bekannte IOS-Abkürzungen (`en`, `conf t`, `sh run`, `int`, ...) und vergleicht sequentiell.
- Nächste Phase braucht:
  1. Kontextabhängigen Parser: aktueller Modus → verfügbare Befehle → Unterbefehle → eindeutige Präfixe.
  2. Command-Tree statt statischer String-Liste, damit `en?`, `en ?`, `show ?`, `enable ?` semantisch unterschieden werden.
  3. Interface-Expansions und Wildcards korrekt behandeln.
  4. Fehler- und Hilfsausgaben wie echtes IOS: `Ambiguous command`, `% Unknown command`, kontextspezifische `?`.
  5. Separate Validierung von Modi (User-EXEC, Privileged-EXEC, Config, Interface-Config, Line-Config, ...).

### Versionsnummer
- Auf **1.19.0** (MINOR) erhöht: Phase 0.5 – Skill-Tree Granularisierung und Dimensions-Tracking.

### Skill-Tree (Phase 0.5)
- `frontend/src/lib/skillTree.js` vollständig granularisiert:
  - **12 Cisco-Skills**, **>80 Subskills**.
  - IDs wie `cisco.basic_configuration.interface_enable`, `cisco.switching.trunk.allowed_vlans`, `cisco.nat.pat.interface_overload`.
  - `SKILL_DIMENSION`: `knowledge`, `configure`, `verify`, `troubleshoot`.
  - `SKILL_SOURCE`: `academy`, `main_mission`, `ticket`, `lab`, `conversation`, `exam`.
  - `MISCONCEPTION`-Konstanten vorbereitet.
  - `recordSkillEvent` speichert: `dimension`, `correct`, `difficulty`, `attempts`, `usedHint`, `hintLevel`, `revealedSolution`, `cliError`, `misconception`, `responseTimeMs`, `source`, `missionId`, `taskId`.
  - `updateDimensionMastery` erhöht Mastery nur, wenn **nicht** `revealedSolution`; `usedHint` reduziert Mastery-Wachstum.
  - State-Version 2, automatische Migration alte Skill-Daten.
- `subskillsForLessonTopic()` mappt jede Cisco-Academy-Lektion auf passende Subskills.

### Neue Fundament-Dateien (Phase 0 Erweiterung)
- `frontend/src/lib/missionTypes.js` – Mission-Arten: `main`, `ticket`, `lab`, `conversation`.
- `frontend/src/lib/missionEvents.js` – Trigger-Architektur für zufällige Events (Playtime, Mission-Completion, Location, Weak Skill, Random).
- `frontend/src/lib/missionChecklist.js` – Gerüst für Prüfungsmatrix / Arbeitsroutine: `identify_device → basic_config → layer2 → layer3 → extra_services → security → verification`.
- `frontend/src/lib/missionHintSystem.js` – Eskalierendes Hilfesystem (Nudge, Focus, Directive, Solution) inkl. Skill-Tracking und Lösungserklärung.

### TTS Voice-Persistenz
- `frontend/src/lib/speechSynthesis.js` –
  - Einstellungen auf `it-learn:tts-settings-v3` migriert.
  - `voiceKey` (`uri`, `name`, `lang`) wird persistiert und für Web Speech und native TTS verwendet.
  - Legacy `voiceId` wird automatisch in `voiceKey` migriert.
  - `selectVoice()` bevorzugt die gespeicherte Stimme; Fallback nur wenn diese nicht verfügbar.
  - `voiceschanged`-Event und asynchrones Laden berücksichtigt.
- `frontend/src/pages/Settings.jsx` –
  - Lädt Web- und Native-Stimmen über `getVoices()`.
  - Zeigt beide Plattformen an, speichert `voiceKey`.
  - TDZ-Sicherheit: `refreshDiagnostics` bleibt vor `useEffect` deklariert.
- `frontend/src/components/PhoneApp.jsx` – Beispielanruf entfernt, Hinweis auf zukünftige Fälle.

### Adaptive Schwierigkeit / kumulative Missionen
- Skill-Tree in `skillTree.js` speichert pro Subskill:
  - `state`, `mastery`, `exposureCount`, `correctCount`, `incorrectCount`
  - `hintCount`, `solutionRevealedCount`, `cliErrorCount`, `repeatedErrorCount`
  - `lastSuccessfulAt`, `successWithoutHelpStreak`, `misconceptions`
- `recordSkillEvent` erhöht Mastery nur bei selbstständig gelösten Aufgaben.
- Lösungs-Anzeige zählt als `revealedSolution` und verhindert eine Mastery-Erhöhung.

### Hilfesystem
- `missionHintSystem.js` –
  - 4 Eskalationsstufen: `nudge`, `focus`, `directive`, `solution`.
  - Beispiel-Ladder für vergessenes `no shutdown`.
  - `buildSolutionExplanation` liefert: Fehler, Lösung, Erkennungsmerkmal, Verifikationsbefehl.
  - Lösungs-Anzeige speichert `revealedSolution` im Skill-Profil.

### Prüfungsmatrix
- `missionChecklist.js` –
  - Geräte-Routine-Matrix für `router`, `switch`, `multilayer_switch`, `firewall`.
  - Standardablauf: Gerät identifizieren → Grundkonfiguration → Layer 2 → Layer 3 → Dienste → Security → Verifikation.
  - `buildExamMission` bereitet spätere Prüfungssimulation vor.

### Event-System
- `missionEvents.js` –
  - Trigger-Typen: `playtime`, `mission_complete`, `location_enter`, `weak_skill`, `random`, `story_gate`.
  - Event-Typen: `conversation`, `ticket`, `alert`, `lab_unlock`, `story_intro`.
  - `evaluateTrigger` und `canEventFire` als datengetriebene Evaluatoren.
  - Beispiel-Events für Kaffeeküchen-Gespräch und Ticket.

### Regressionstests
- `frontend/scripts/mission-v2-tts-voice-test.mjs`
- `frontend/scripts/mission-v2-foundation-test.mjs`
- `frontend/scripts/settings-tdz-regression-test.mjs`

### Acceptance checks
- `npm run lint` ✅ (13 bekannte Warnungen, 0 Fehler).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅.

### Offen für spätere Phasen
- Konkrete Cisco-Missionen (erstes Szenario: Basic Configuration → VLAN → Router → MLS → STP → SSH → DHCP → ACL → Stateful Filter → NAT/PAT).
- Kontextabhängiger Cisco-CLI-Parser.
- Integration Skill-Tree ↔ Mission-Generator ↔ Quest/DiagnosticQuest-Seiten.

## Mission System V2 Phase 1A: Cisco IOS CLI Engine Core

### Ziel
Eine wiederverwendbare, zustandsbasierte Cisco-IOS-CLI-Engine für zukünftige Missionen. Sie simuliert einen realistischen IOS-Ausschnitt für Grundkonfiguration und ist architektonisch für VLAN, Routing, OSPF, STP, SSH, DHCP, ACL, NAT/PAT usw. erweiterbar.

### Neue Dateien
- `frontend/src/lib/ciscoCliEngine.js` – Zustandsbasierte CLI-Engine.
- `frontend/scripts/cisco-cli-engine-test.mjs` – Umfassende CLI-Engine-Tests.

### Geänderte Dateien
- `frontend/package.json` – Version auf **1.20.0** erhöht.
- `frontend/src/lib/version.js` – Version auf **1.20.0** erhöht.
- `frontend/public/version.json` – Version auf **1.20.0** erhöht.

### Architektur der CLI-Engine
- **CLI-Modi**: `USER_EXEC`, `PRIVILEGED_EXEC`, `GLOBAL_CONFIG`, `INTERFACE_CONFIG`, `LINE_CONSOLE_CONFIG`, `LINE_VTY_CONFIG`.
- **Device State**: `hostname`, `runningConfig`, `startupConfig`, `interfaces`, `users`, `lines`, `ipDefaultGateway`, `noIpDomainLookup`.
- **Command Tree**: Hierarchisch, modusabhängig, erweiterbar. Jeder Knoten hat `keyword`, `children`, `execute`, `help`, `complete`, `skill`.
- **Generische Präfix-Abkürzung**: `en` → `enable`, `conf t` → `configure terminal`, eindeutige Kurzformen funktionieren ohne hartcodierte Alias-Tabelle. Mehrdeutige Eingaben erzeugen `% Ambiguous command`.
- **Context-sensitive `?`-Hilfe**:
  - `?` zeigt root-Befehle des aktuellen Modus.
  - `co?` zeigt Befehle, die mit `co` beginnen.
  - `configure ?` zeigt gültige Fortsetzungen.
  - `en?` und `en ?` liefern unterschiedliche Ergebnisse.
  - Vollständige Befehle zeigen `<cr>`.
- **Tab-Completion**: `completeInput(device, input)` API.
- **Fehlertypen**: `UNKNOWN_COMMAND`, `AMBIGUOUS_COMMAND`, `INCOMPLETE_COMMAND`, `INVALID_ARGUMENT`, `WRONG_MODE`.

### Implementierte Befehle (Phase 1A)
- User EXEC: `enable`
- Privileged EXEC: `disable`, `configure terminal`, `show running-config`, `show startup-config`, `show ip interface brief`, `copy running-config startup-config`, `write memory`, `wr`
- Global Config: `hostname`, `no ip domain-lookup`, `enable secret`, `username ... secret`, `interface <interface>`, `line console 0`, `line vty <start> <end>`, `exit`, `end`
- Interface Config: `ip address <ip> <mask>`, `no shutdown`, `shutdown`, `description`, `exit`, `end`
- Line Config (console/vty): `password`, `login`, `login local`, `exit`, `end`

### Interface-Handling
- Canonische IDs wie `GigabitEthernet0/0`, `FastEthernet0/1`.
- Akzeptiert `Gi0/0`, `gigabitethernet0/0`, eindeutige Präfixe.
- Interfaces besitzen `ipv4`, `mask`, `administrativelyDown`, `description`.

### Running/Startup Config
- `runningConfig` und `startupConfig` sind getrennt.
- `copy running-config startup-config`, `write memory`, `wr` kopieren `runningConfig` nach `startupConfig`.
- `show running-config` und `show startup-config` generieren Ausgabe aus dem jeweiligen Zustand.

### IP-Validierung
- Dotted-decimal IPv4-Prüfung.
- Subnetzmasken-Prüfung (kontinuierliche 1er gefolgt von 0er).
- Ungültige Eingaben werden mit `INVALID_ARGUMENT` abgelehnt.

### Skill-Metadaten
- Befehle können `skill` (domainId, skillId, subskillId, dimension) enthalten.
- Bei State-Änderung ruft die Engine `recordSkillEvent` aus `skillTree.js` auf.
- Keine automatische Mastery-Erhöhung ohne Mission-/Task-Kontext – die CLI liefert nur strukturierte Ergebnisse.

### Tests
- `frontend/scripts/cisco-cli-engine-test.mjs` prüft:
  - Modi und Prompt-Wechsel (`enable`, `configure terminal`, `interface`, `exit`, `end`, `disable`).
  - Falscher Modus wird abgelehnt.
  - Eindeutige Abkürzungen (`en`, `conf t`, `conf term`).
  - Mehrdeutige Abkürzungen (`co`).
  - `?` und ` ?` liefern unterschiedliche Hilfe.
  - Tab-Completion.
  - Hostname ändert Prompt und State.
  - Interface-IP wird gespeichert, `no shutdown` aktiviert Interface.
  - Ungültige IP/Mask wird abgelehnt.
  - Running/Startup getrennt, `copy run start` funktioniert.
  - `show running-config`, `show startup-config`, `show ip interface brief` aus State generiert.
  - Fehler: Unknown, Ambiguous, Incomplete, Invalid Argument.
  - Mehrere Device-Instanzen beeinflussen sich nicht.

### Regressionstests
- `node scripts/mission-v2-skilltree-test.mjs` ✅
- `node scripts/mission-v2-foundation-test.mjs` ✅
- `node scripts/cisco-cli-engine-test.mjs` ✅

### Acceptance checks
- `npm run lint` ✅ (13 bekannte Warnungen, 0 Fehler).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅.

### Bekannte Abweichungen zu echtem IOS
- Keine kryptografische Passwort-Darstellung (`enable secret` wird als Plaintext in `show running-config` ausgegeben).
- Keine vollständige IOS-Feature-Menge (nur Grundkonfiguration).
- Keine Logging-/AAA-/VTY-SSH-Spezifika in Phase 1A.
- Keine dynamische Interface-Liste (Gerät muss beim Erstellen wissen, welche Interfaces es hat).

### Offen für Phase 1B
- VLAN, Trunk, VTP.
- Routing (statisch, OSPF).
- STP, Port-Security.
- SSH, DHCP, ACL, NAT/PAT.
- Mission-Integration: Quest/DiagnosticQuest verwendet CLI-Engine und prüft Gerätezustand.

## Mission System V2 Phase 1B-1: Mission Runtime + Mission 001 + Bugfix

### Ziel
Erster spielbarer End-to-End-Loop: Auftrag erhalten → Arbeitsplatz → Cisco-Gerät → CLI-Konfiguration → Verifikation → Mission abschließen → Debriefing → Neue Variante.

### Neue Dateien
- `frontend/src/lib/missionV2.js` – Mission-001-Runtime, Szenario-Generator, State-Evaluierung, Hilfesystem, Skill-Tracking.
- `frontend/src/pages/MissionV2.jsx` – UI für Mission 001.
- `frontend/scripts/mission-v2-basic-config-test.mjs` – Mission-001-Tests.
- `frontend/scripts/mission-v2-goal-panel-test.mjs` – Zielpanel-Tests.
- `frontend/scripts/mission-v2-runtime-routing-test.mjs` – End-to-End Routing/Registry-Tests.

### Bugfix 1B-1 nach APK-Test
- Problem: Mission 001 war über den Workspace nicht erreichbar, „Einsatz nicht gefunden“ wurde angezeigt.
- Ursache: `Quest.jsx` wollte einen echten Quest-Eintrag im alten `questData.js` finden, anstatt Cisco-Missions-IDs an die neue V2-Route weiterzuleiten. `ObjectivePanel` navigierte außerdem ins Legacy-`/quest/`-Routing.
- Fix:
  - `Quest.jsx` leitet `/quest/<cisco-*>` per `useEffect` sofort ersetzend zu `/mission/<id>` weiter.
  - `ObjectivePanel` navigiert direkt zu `/mission/<id>`.
  - `MissionV2.jsx` setzt `gameState.activeQuest` beim Start und ruft `completeQuest` beim erfolgreichen Abschluss, damit `getNextMainMission` und das Zielpanel konsistent arbeiten.
  - `missionV2.js` persistiert aktive Mission unter `cyberlearn:active-mission-v1` und `missionLog`.

### Bugfix Zielpanel
- Problem: Panel landete oben links, überlappte Header/Statusleiste, war auf Touch nicht verschiebbar, zeigte Academy-Ziel statt aktiver Mission.
- Ursache: Drag-Logik nutzte kein `setPointerCapture`, `touch-action` war unzureichend, Defaultposition war nicht sauber gegen Safe Area geprüft, Zielpriorität ignorierte `gameState.activeQuest`.
- Fix:
  - Drag-Handle mit `pointerdown`/`pointermove`/`pointerup`/`pointercancel` + `setPointerCapture`.
  - `touch-action: none` und `userSelect: none` auf Griff und Panel.
  - Position wird gegen Safe Area (Header/Status/Insets) geprüft und geklemmt.
  - Defaultposition: oben rechts, unterhalb Header + Safe-Area-Top-Inset.
  - Invalidierte alte Positionen werden beim Laden zurückgesetzt.
  - Zielpriorität: aktive V2-Mission > Hauptmission > Lernen.

### Geänderte Dateien
- `frontend/src/components/ObjectivePanel.jsx` – draggable, safe-area-clamping, mission priority.
- `frontend/src/pages/Quest.jsx` – sofortige Weiterleitung Cisco-Missions-IDs an MissionV2.
- `frontend/src/pages/MissionV2.jsx` – activeQuest setzen, completeQuest aufrufen.
- `frontend/src/lib/questData.js` – ein Eintrag `cisco-main-001-basic-configuration` als Routing-Placeholder.
- `frontend/src/lib/version.js` – **1.21.1**.
- `frontend/package.json` – **1.21.1**.
- `frontend/public/version.json` – **1.21.1**.

### Tests
- `node scripts/mission-v2-basic-config-test.mjs` ✅
- `node scripts/mission-v2-goal-panel-test.mjs` ✅
- `node scripts/mission-v2-runtime-routing-test.mjs` ✅
- `node scripts/cisco-cli-engine-test.mjs` ✅

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, archiviert als `IT-Admin-Simulator_2026-08-12_11-28.apk`.

### Bekannte Einschränkungen
- Mission 001 ist derzeit die einzige Mission.
- Kein VLAN/Routing/SSH usw. in 1B-1.
- V2-Mission benötigt aktive Quest-ID in `gameState`; Replay generiert neue Variante, aber Fortschritts-XP nur beim ersten Abschluss.

## Mission System V2 Phase 1C: Referenz-Gameplay-Loop

### Ziel
Einen vollständigen Referenz-Loop bauen: Tutorial → NEXUS kennenlernen → erster echter Arbeitsauftrag → Mission 001 (Cisco Layer-2-Switch) → Fortschrittsfeedback → Selbstkontrolle → bewusster Abschluss. Mission 001 soll als Qualitätsreferenz für zukünftige Missionen dienen.

### Neue Dateien
- `frontend/scripts/mission-v2-basic-config-test.mjs` – Mission-001-Tests für Layer-2-Switch und 0/5-Fortschritt.
- `frontend/scripts/mission-v2-runtime-routing-test.mjs` – Routing/Registry/Persistenz-Tests.

### Geänderte Dateien
- `frontend/src/lib/missionV2.js` – Mission 001 komplett umgebaut:
  - ID `cisco-main-001`
  - Layer-2-Switch, initialer Hostname `Switch`, Ziel `Sw1`
  - Genau fünf Anforderungen: Hostname, Enable Secret, lokaler Benutzer, `no ip domain-lookup`, Konfiguration speichern
  - Fortschritt wird aus Device State berechnet (0/5)
  - Mehrstufiges Hilfesystem pro Anforderung (Nudge → Focus → Directive → Solution)
  - Skill-Tracking für jeden Befehl, Hinweis und `revealedSolution`
- `frontend/src/pages/MissionV2.jsx` – UI:
  - Fortschrittsanzeige 0/5
  - "Prüfen" und "Auftrag abschließen" getrennt
  - "Auftrag abschließen" erst bei 5/5 aktiv
  - Dropdown für gezielte Hilfe pro Anforderung
  - Story-Nachbereitung nach erfolgreichem Abschluss
- `frontend/src/lib/questData.js` – Routing-Placeholder `cisco-main-001`.
- `frontend/src/components/Onboarding.jsx` – Tutorial endet jetzt mit Navigation zu `/mission/cisco-main-001`.
- `frontend/src/lib/onboardingSteps.js` – Sam gibt den ersten Auftrag aus dem Tutorial heraus.
- `frontend/src/components/ObjectivePanel.jsx` – Drag & Drop überarbeitet:
  - Pointer Events + `setPointerCapture`
  - Klick-vs-Drag-Erkennung per Threshold
  - Defaultposition oben rechts unter Header + Safe Area
  - Clamping gegen Safe Area/Header bei Resize/Rotation
  - Position-Reset-Button
  - Current Goal priorisiert aktive Mission > Hauptmission > Lernen
- `frontend/src/lib/ciscoCliEngine.js` – `executeCommand` gibt jetzt das aufgelöste Command-Node zurück, damit Skill-Tracking auf Befehlsebene funktioniert.
- `frontend/src/lib/version.js`, `frontend/package.json`, `frontend/public/version.json` – **1.22.0**.

### Tutorial → Mission 001
1. Neuer Spielstand startet Onboarding.
2. Onboarding endet mit Sam, der den ersten Auftrag gibt.
3. Button "Erste Mission starten" navigiert zu `/mission/cisco-main-001`.
4. `MissionV2.jsx` initialisiert das Layer-2-Switch-Szenario.
5. `ObjectivePanel` zeigt "Der erste Switch" und linkt zur Mission.

### Mission 001 Ablauf
- Gerät: Cisco Layer-2-Switch, aktueller Name `Switch`, Ziel `Sw1`.
- Anforderungen:
  1. Hostname `Sw1`
  2. Enable Secret
  3. Lokalen Benutzer `admin` anlegen
  4. `no ip domain-lookup`
  5. `copy running-config startup-config` (oder `write memory`/`wr`)
- CLI-Prompt ändert sich nach `hostname Sw1` sofort zu `Sw1(config)#`.
- Fortschritt anhand Device State, nicht anhand eingegebener Strings.
- Falsche Befehle ziehen keine Punkte ab.
- Doppelte Erfüllung erhöht nicht über 5/5.
- `show running-config` und `show startup-config` funktionieren.
- Bewusster Abschluss über "Auftrag abschließen".

### Support-Level
- Datenmodell ist für zukünftige Stufen `GUIDED`, `SUPPORTED`, `INDEPENDENT`, `EXAM` vorbereitet.
- Mission 001 verwendet `GUIDED`.

### Gerätebenennung
- Einheitlicher Standard: `PC01`, `Sw1`, `R1`, `L3Sw1`.
- Frische Geräte starten mit `Switch>`, `Router>`, `Multiswitch>`.

### Tests
- `node scripts/mission-v2-basic-config-test.mjs` ✅
- `node scripts/mission-v2-runtime-routing-test.mjs` ✅
- `node scripts/mission-v2-goal-panel-test.mjs` ✅
- `node scripts/mission-v2-foundation-test.mjs` ✅
- `node scripts/mission-v2-skilltree-test.mjs` ✅
- `node scripts/mission-v2-skilltree-runtime-test.mjs` ✅
- `node scripts/cisco-cli-engine-test.mjs` ✅

### Acceptance checks
- `npm run lint` ✅ (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` (manuell fortsetzen, siehe Abschlussbericht).

## Mission System V2 Phase 1C.1: CLI & UX Polish

### Ziel
Die reale Android-Testsession von Mission 001 hat gezeigt, dass der Loop funktioniert, aber CLI- und UX-Details noch poliert werden müssen. Keine neuen Features, nur Mission 001 verbessern.

### Geänderte Dateien
- `frontend/src/lib/ciscoCliEngine.js`
  - Historische Prompts bleiben unverändert (Snapshot vor Befehlsausführung).
  - Prompt-Ausgabe wird nicht dupliziert.
  - `?`-Hilfe erscheint nie doppelt.
  - Rekursive, context-sensitive `?`-Hilfe:
    - `en?` → Word Help, alle Befehle mit "en".
    - `en ?` → nächste Keywords von `enable`.
    - `ena sec?` → `secret`.
    - `no ?`, `no ip ?`, `no ip dom?` funktionieren rekursiv.
    - `username ?` zeigt `<name>`.
    - `show ?`, `copy ?`, `copy run?` funktionieren.
  - `no ip domain-lookup` ist die verbindliche Syntax (kein `no domain-lookup`).
  - Modusabhängige Fehlermeldungen:
    - EXEC-Modi: `% Unknown command or computer name, unable to process.`
    - Config-Modi: `% Invalid input detected at '^' marker.`
  - `username <name> password <pw>` und `username <name> secret <pw>` werden akzeptiert.
  - Argument-Wildcards `<...>` im Command Tree für Benutzernamen.
- `frontend/src/lib/missionV2.js`
  - Anforderung "lokaler Benutzer" akzeptiert `password` und `secret`.
- `frontend/src/pages/MissionV2.jsx`
  - Terminal-History speichert `promptAtExecution` (Snapshot).
  - Keine separaten `output`-Wiederholungen, keine doppelten Prompt-Zeilen.
  - Terminal hat eigenen `overflow-y-auto`-Bereich und scrollt intern zur neuesten Ausgabe.
  - Kein `scrollIntoView` auf Parent-Seite bei Befehlseingabe.
  - Auftragsfortschritt zeigt nur `n/5` ohne Einzelcheckliste.
  - Feedback-Box behält Details für "Prüfen".
- `frontend/src/lib/version.js`, `frontend/package.json`, `frontend/public/version.json` – **1.22.1**.
- `frontend/scripts/cisco-cli-engine-test.mjs` – Erweitert um Prompt-Snapshot, `?`-Hilfe, `username password`, Config-Modus-Fehler.
- `frontend/scripts/mission-v2-basic-config-test.mjs` – Test für `username ... password`.
- `frontend/scripts/mission-v2-cli-ux-test.mjs` – Neue Regressionstests für Prompt-Snapshots, rekursive Hilfe, Fortschrittsanzeige.

### Befehle, die Mission 001 mit `?` lösbar machen
- `enable`, `configure terminal`, `hostname`, `enable secret`, `username`, `no ip domain-lookup`, `end`, `copy running-config startup-config`, `write memory`, `show running-config`, `show startup-config`.

### Tests
| Test | Ergebnis |
|---|---|
| `node scripts/cisco-cli-engine-test.mjs` | ✅ |
| `node scripts/mission-v2-basic-config-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-ux-test.mjs` | ✅ |
| `node scripts/mission-v2-runtime-routing-test.mjs` | ✅ |
| `node scripts/mission-v2-goal-panel-test.mjs` | ✅ |
| `node scripts/mission-v2-foundation-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-runtime-test.mjs` | ✅ |

### Acceptance checks
- `npm run lint` ✅ (0 Fehler, nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- `gradlew assembleDebug` ✅.
- APK archiviert ✅.

### Stop-Bedingung
- Keine Mission 002.
- Keine VLAN/Router/ACL/NAT/SSH-Features.
- APK muss auf echtem Android-Gerät getestet werden.
- Kein Push, kein Deployment.

## Mission System V2 Phase 1C.2: Cisco CLI Editor / IOS Help & Error Fidelity

### Ziel
Terminal-/CLI-Verhalten der bestehenden Referenzmission weiter an Cisco IOS angleichen. Keine neuen Cisco-Themen, keine Mission 002.

### Geänderte Dateien
- `frontend/src/lib/ciscoCliEngine.js`
  - `getCommandHelp()` exportiert: context-sensitive Help, partial vs. syntax Help, `inputAfterHelp` wird zurückgegeben.
  - `?` wird nicht mehr wie `Enter` behandelt: `executeCommand` liefert `isHelp: true`, ändert keinen State, führt kein Skill-Recording aus.
  - Trailing Space bei Syntax-Help erhalten (`no ip ?` → Input bleibt `no ip `).
  - Partial-Word-Help erhalten (`no ip dom?` → Input bleibt `no ip dom`).
  - Exakter `^` Marker basierend auf `errorTokenIndex` im `walkCommandTree`.
  - Config-Modus: `% Invalid input detected at '^' marker.` mit korrektem Caret.
  - EXEC-Modus: `% Unknown command or computer name, unable to process.`
  - `write memory` / `copy running-config startup-config` bleiben im `GLOBAL_CONFIG` ungültig; nur im `PRIVILEGED_EXEC` verfügbar.
- `frontend/src/lib/missionV2.js`
  - `executeMissionCommand` erkennt `isHelp` und speichert keinen `lastCommandAt`, kein Skill-Event, kein Mission-Progress.
- `frontend/src/pages/MissionV2.jsx`
  - Neuer Input-Editor:
    - `?` zeigt Help an, leert Eingabe nicht, landet nicht in History.
    - `Enter` führt aus (oder zeigt erneut Help falls `?` am Ende).
    - `Tab` vervollständigt oder zeigt Vorschläge.
    - `ArrowUp` / `ArrowDown` navigieren die Command-History.
  - Help-Output wird als transiente Zeile oberhalb des Prompts dargestellt, nicht in der Command-History.
- `frontend/src/lib/version.js`, `frontend/package.json`, `frontend/public/version.json` – **1.22.2**.
- `frontend/scripts/mission-v2-cli-editor-test.mjs` – Neue Regressionstests für Help-Erhalten, Caret-Position, Modusregeln, History-Pflege.

### IOS-verbindliches Verhalten
- `?` ist rein informativ, ändert nichts am Device State.
- `no ip ?` zeigt `domain-lookup` und lässt `no ip ` im Input stehen.
- `no ip dom?` zeigt `domain-lookup` und lässt `no ip dom` stehen.
- `not ip domain-lookup` markiert `not` mit `^`.
- `no domain-lookup` markiert `domain-lookup` mit `^`.
- `ena foo` markiert `foo` mit `^`.
- `hostname` (ohne Argument) gibt `% Incomplete command.`.
- `wr?` / `copy?` im `GLOBAL_CONFIG` liefern keinen Treffer; in `PRIVILEGED_EXEC` zeigen sie `write` / `copy`.

### Tests
| Test | Ergebnis |
|---|---|
| `node scripts/cisco-cli-engine-test.mjs` | ✅ |
| `node scripts/mission-v2-basic-config-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-ux-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-editor-test.mjs` | ✅ |
| `node scripts/mission-v2-runtime-routing-test.mjs` | ✅ |
| `node scripts/mission-v2-goal-panel-test.mjs` | ✅ |
| `node scripts/mission-v2-foundation-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-runtime-test.mjs` | ✅ |

### Acceptance checks
- `npm run lint` ✅ (0 Fehler, nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- `gradlew assembleDebug` ✅.
- APK archiviert ✅.

### Stop-Bedingung
- Keine Mission 002.
- Keine VLAN/Router/ACL/NAT/SSH-Features.
- Kein Push, kein Deployment.

## Mission System V2 Phase 1C.3: Verbindliche IOS-Abkürzungen / exec-timeout Command-Tree

### Ziel
`exec-timeout` als Beispiel für vollständige Command-Tree-Integration ohne hartcodierte Missions-Abkürzungen. Abkürzungen, Help, Tab und Ambiguous-Command-Logik sollen ausschließlich vom CLI-Parser bestimmt werden.

### Geänderte Dateien
- `frontend/src/lib/ciscoCliEngine.js`
  - `createCiscoDevice`: `execTimeout` als Objekt `{ minutes, seconds }` für Console und VTY.
  - `walkCommandTree`: am Ende wird ein Node mit `execute` als gültig akzeptiert, auch wenn er Kinder hat (optional weitere Argumente).
  - `LINE_CONSOLE_CONFIG` und `LINE_VTY_CONFIG`: neue Commands `exec` und `exec-timeout`.
    - `exec` und `exec-timeout` sind beide im Tree → `exec` allein ist `AMBIGUOUS_COMMAND`.
    - `exec-` ist eindeutig für `exec-timeout`.
    - `exec-timeout` hat Wildcard-Kinder `<minutes>` und `<seconds>`; `<seconds>` ist optional.
  - `renderRunningConfig`: zeigt `exec-timeout <minutes> <seconds>` für `line con 0` und `line vty`.
- `frontend/src/lib/version.js`, `frontend/package.json`, `frontend/public/version.json` – **1.22.3**.
- `frontend/scripts/mission-v2-exec-timeout-test.mjs` – Neue Regressionstests.

### Beispiele
| Eingabe | Ergebnis |
|---|---|
| `exec-timeout 5 0` | Setzt Console-Timeout auf 5 Min, 0 Sek. |
| `exec-timeout 3` | Setzt Console-Timeout auf 3 Min, 0 Sek. |
| `exec-t 5 0` | Vollständige, eindeutige Abkürzung für `exec-timeout`. |
| `exec 5 0` | `Ambiguous command` (nicht als `exec-timeout` interpretiert). |
| `exec?` | Zeigt `exec` und `exec-timeout`. |
| `exec-?` | Zeigt `exec-timeout`. |
| `exec-timeout ?` | Zeigt `<minutes>`. |
| `exec-timeout 5 ?` | Zeigt `<seconds>`. |

### Tests
| Test | Ergebnis |
|---|---|
| `node scripts/cisco-cli-engine-test.mjs` | ✅ |
| `node scripts/mission-v2-basic-config-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-ux-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-editor-test.mjs` | ✅ |
| `node scripts/mission-v2-exec-timeout-test.mjs` | ✅ |
| `node scripts/mission-v2-runtime-routing-test.mjs` | ✅ |
| `node scripts/mission-v2-goal-panel-test.mjs` | ✅ |
| `node scripts/mission-v2-foundation-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-runtime-test.mjs` | ✅ |

### Acceptance checks
- `npm run lint` ✅ (0 Fehler, nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- `gradlew assembleDebug` ✅.
- APK archiviert ✅.

### Stop-Bedingung
- Keine Mission 002.
- Keine VLAN/Router/ACL/NAT/SSH-Features.
- Kein Push, kein Deployment.
- Keine Missions-eigenen Abkürzungslisten.

## Mission System V2 Phase 1D: Cisco-Grundkonfig-Nebenmissionen, Story-Gate, Prefix-Test

### Ziel
Mission 001 abschließen und drei kleine Cisco-Grundkonfig-Nebenmissionen ergänzen, die nach dem ersten Auftrag freigeschaltet werden. Mindestens zwei davon sollen absolviert werden, um das nächste Story-Gate zu öffnen. CLI-Tab-Vervollständigung und `do`-Befehl werden verbessert; ein generischer Präfix-Kollisions-Test deckt Mehrdeutigkeiten über alle Modi ab.

### Neue Dateien
- `frontend/src/lib/ciscoSideMissions.js` – Side-Mission-Runtime, -Szenarien, -Evaluierung, -Hilfesystem.
- `frontend/scripts/cisco-side-missions-smoke-test.mjs` – End-to-End-Test für alle drei Side Missions.
- `frontend/scripts/cisco-prefix-collision-test.mjs` – Rekursiver Test aller Command-Tree-Siblings, Präfixauflösung, `?`-Hilfe und Tab-Vervollständigung pro CLI-Modus.

### Geänderte Dateien
- `frontend/src/lib/ciscoSideMissions.js`
  - IDs: `cisco-side-basic-001`, `cisco-side-basic-002`, `cisco-side-basic-003`.
  - Side 001: Console mit `password`, `login`, `exec-timeout` absichern.
  - Side 002: `service password-encryption` aktivieren.
  - Side 003: `login local` statt gemeinsamen Line-Passworts mit passendem `username`.
  - Skills: `console_security`, `login`, `exec_timeout`, `service_password_encryption`, `login_local`, `do_command`, `verify_running_config`.
- `frontend/src/pages/MissionV2.jsx` – Generisch für Haupt- und Cisco-Nebenmissionen: Start/Load/Execute/Progress/Evaluate/Feedback/Hints/Lösung/Speichern pro Mission.
- `frontend/src/pages/SideMission.jsx` – Cisco-Side-Missions leiten auf `/mission/:id` um.
- `frontend/src/lib/gameState.js` – `completedCiscoSideMissions`, `completeCiscoSideMission`, `ciscoSideMissionsCompleted`, `stateVersion` 6.
- `frontend/src/lib/objectives.js` – `getRecommendedSideMissions` listet Cisco-Side-Missions nach Mission 001; `getNextMainMission` prüft 2/3-Story-Gate.
- `frontend/src/lib/questData.js` – Story-Gate-Eintrag `cisco-main-002-gate` mit `gate: true`.
- `frontend/src/lib/skillTree.js` – Neue Subskills: `login`, `exec_timeout`, `service_password_encryption`, `do_command`.
- `frontend/src/lib/ciscoCliEngine.js`
  - `exec-timeout` Skill auf `basic_configuration` verschoben.
  - `completeInput` bevorzugt exakte Kommandos (wichtig für `wr` / `write` und `exec` / `exec-timeout`).
  - `do` ohne Argument Tab-vervollständigt zu `do `.
- `frontend/scripts/mission-v2-exec-timeout-test.mjs` – Angepasst: `exec` ist eindeutig; `ex` ist mehrdeutig.
- `frontend/scripts/mission-v2-runtime-routing-test.mjs` – Erlaubt mindestens zwei Einträge in `questData`.
- `frontend/package.json`, `frontend/src/lib/version.js`, `frontend/public/version.json` – **1.23.0**.

### 2/3-Story-Gate
- Nach Mission 001 werden in `getRecommendedSideMissions` die drei Cisco-Nebenmissionen angeboten.
- `getNextMainMission` zählt alte + Cisco-Nebenmissionen; `cisco-main-002-gate` bleibt gesperrt, bis 2/3 erfüllt sind.
- `questData.availableQuests` schließt Gate-Einträge aus, damit `Inbox` nicht darauf verlinkt.

### Tests
| Test | Ergebnis |
|---|---|
| `node scripts/cisco-cli-engine-test.mjs` | ✅ |
| `node scripts/mission-v2-basic-config-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-ux-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-editor-test.mjs` | ✅ |
| `node scripts/mission-v2-exec-timeout-test.mjs` | ✅ |
| `node scripts/mission-v2-runtime-routing-test.mjs` | ✅ |
| `node scripts/mission-v2-goal-panel-test.mjs` | ✅ |
| `node scripts/mission-v2-foundation-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-runtime-test.mjs` | ✅ |
| `node scripts/cisco-prefix-collision-test.mjs` | ✅ |
| `node scripts/cisco-side-missions-smoke-test.mjs` | ✅ |

### Acceptance checks
- `npm run lint` ✅ (0 Fehler, nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, archiviert.
- GitHub Actions deploy-pages ✅.
- GitHub Pages live-Version 1.23.0 ✅.

### Stop-Bedingung
- Keine Hauptmission 002.
- Keine VLAN/Router/SSH/ACL/NAT-Features.
- Auf echtem Android-Gerät testen.

## Mission System V2 Phase 1E: World Flow, Credential Continuity & TTS-Polish

### Ziel
Nach Mission 001 kein toter Ausgang mehr. Neue Aufgaben erreichen den Spieler über in-world Kanäle (Sam-Gespräch, E-Mail, Telefon), und das ObjectivePanel priorisiert danach, was gerade relevant ist. Zusätzlich werden gerade in Mission 001 erzeugte Credentials in späteren Einsätzen wiederverwendet, der IOS-Modus wird poliert und die TTS-Stimmenerkennung repariert.

### Neue Dateien
- `frontend/src/lib/credentials.js` – Zentrale Credential-Verwaltung (`knownCredentials`) und Platzhalterersetzung.
- `frontend/src/lib/worldDispatcher.js` – Datengesteuerter Dispatcher für Story-Events nach Mission 001.
- `frontend/scripts/world-flow-test.mjs` – Integrationstest: Sam-Dialog, E-Mail, Telefon, Reihenfolge, ObjectivePanel-Priorität.
- `frontend/scripts/cisco-credentials-test.mjs` – Testet Mission-001-Credential-Speicherung und Wiederverwendung in Side 003.
- `frontend/scripts/cisco-ios-mode-test.mjs` – Regressionstest für `do`, `exit`, `end`, keine Parent-Mode-Fallbacks.
- `frontend/scripts/tts-voice-selection-test.mjs` – Tests für Voice Discovery, deutsche männliche Stimme, Persistenz, Diagnose.

### Geänderte Dateien
- `frontend/src/lib/gameState.js` – `stateVersion` 7, Felder `knownCredentials`, `dispatchedWorldEvents`, `pendingWorldDialog`.
- `frontend/src/lib/missionV2.js` – `MISSION_001_ID` exportiert; `evaluateMission001` vereinfacht.
- `frontend/src/pages/MissionV2.jsx` – Speichert Credentials beim erfolgreichen Abschluss von Mission 001.
- `frontend/src/lib/ciscoSideMissions.js` – Side 003 verwendet `knownCredentials` statt Zufallswerte.
- `frontend/src/lib/objectives.js` – Relevanzscoring für Lernen / Hauptmission / Nebenmission; `getTopObjective`.
- `frontend/src/components/ObjectivePanel.jsx` – Sektionen nach Relevanz sortiert; Top-Ziel oben.
- `frontend/src/pages/Workspace.jsx` – Startet `processWorldEvents` beim Betreten des Arbeitsplatzes; rendert eingehende World-Dialogs.
- `frontend/src/components/PhoneApp.jsx` – Zeigt eingehende Telefonanrufe aus `notificationSystem` und leitet Side-Missions weiter.
- `frontend/src/components/EmailApp.jsx` – Cisco-Side-Missions nutzen jetzt `/side-mission/<id>`.
- `frontend/src/lib/speechSynthesis.js` – Robuste Native-Voice-Discovery mit Retry, bevorzugte deutsche männliche Stimme, Persistenz, Diagnose.
- `frontend/src/pages/Settings.jsx` – Stimmentest mit aktuell ausgewählter Stimme, Diagnose-Button.
- `frontend/package.json`, `frontend/src/lib/version.js`, `frontend/public/version.json` – **1.24.0**.

### World Flow nach Mission 001
1. `completeQuest(MISSION_001_ID)` wird in `MissionV2.jsx` aufgerufen.
2. `recordKnownCredentialsFromMission001(device, scenario)` speichert `enableSecret`, `localAdminUsername`, `localAdminPassword`.
3. Beim nächsten Betreten des Arbeitsplatzes (`Workspace.jsx`) ruft `processWorldEvents()` die Dispatcher-Tabelle ab:
   - `post-main-001-sam`: Sam spricht den Spieler an (Dialog) und kündigt die drei Folgeaufträge an.
   - `side-001-mail`: E-Mail von Sam mit Console-Security-Auftrag.
4. Nach Abschluss von Side 001:
   - `side-002-phone`: Telefonbenachrichtigung von Mara König über `service password-encryption`.
5. Nach Abschluss von Side 002:
   - `side-003-sam`: persönliches Gespräch mit Sam über `login local`.
6. Side-Missions werden über bestehende `sideMissionEngine` / `notificationSystem` kanalisiert; `Inbox.jsx` und `PhoneApp.jsx` leiten auf `/side-mission/<id>`.

### ObjectivePanel-Priorität
- `relevance.main = 90` wenn freigeschaltet, sonst 10 wenn Gate noch gesperrt.
- `relevance.main = 60` sobald die Voraussetzungen für das nächste Gate erfüllt sind.
- `relevance.side = 80`, solange sie für das nächste Story-Gate zählen, sonst 40.
- `relevance.learning = 30`.
- Anzeige im Panel entspricht der absteigenden Relevanz.

### Credential Continuity
- In `credentials.js` werden bekannte Credentials zentral verwaltet.
- Briefings können Platzhalter `[username]`, `[password]`, `[enableSecret]` enthalten; `formatCredentialTemplate` löst sie auf.
- Side 003 initialisiert den lokalen Admin-Benutzer mit dem aus Mission 001 bekannten Wert, damit der Einsatz konsistent bleibt.
- Ohne bekannte Credentials werden weiterhin zufällige, aber stabile Fallback-Werte generiert.

### IOS Mode Polish
- `do <cmd>` in allen Config-Modi funktioniert und erhält den aktuellen Modus.
- `exit` springt korrekt INTERFACE_CONFIG → GLOBAL_CONFIG → PRIVILEGED_EXEC.
- `end` springt aus allen Config-Modi direkt in PRIVILEGED_EXEC und räumt `currentInterface` / `currentLine` auf.
- Kein Parent-Mode-Fallback: Befehle, die im aktuellen Modus nicht existieren, liefern `UNKNOWN_COMMAND`/`INVALID_ARGUMENT`.

### TTS Regression Fix
- Native Voice Discovery mit Retry, Timeout und Cooldown; leere/Time-out-Listen werden nicht ewig gecacht.
- `useSystemVoice` default `false`.
- Bevorzugte deutsche männliche Google-TTS-Voices (z. B. `de-de-x-gpp-local`) als Fallback.
- `getSelectedVoice()` liefert die tatsächlich aufgelöste Stimme.
- `getTtsVoiceDiagnostics()` zeigt Discovery-Status, Anzahl Stimmen, gespeicherte Stimme und Auswahl.

### Tests
| Test | Ergebnis |
|---|---|
| `node scripts/world-flow-test.mjs` | ✅ |
| `node scripts/cisco-credentials-test.mjs` | ✅ |
| `node scripts/cisco-ios-mode-test.mjs` | ✅ |
| `node scripts/tts-voice-selection-test.mjs` | ✅ |
| `node scripts/cisco-cli-engine-test.mjs` | ✅ |
| `node scripts/mission-v2-basic-config-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-ux-test.mjs` | ✅ |
| `node scripts/mission-v2-cli-editor-test.mjs` | ✅ |
| `node scripts/mission-v2-exec-timeout-test.mjs` | ✅ |
| `node scripts/mission-v2-runtime-routing-test.mjs` | ✅ |
| `node scripts/mission-v2-goal-panel-test.mjs` | ✅ |
| `node scripts/mission-v2-foundation-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-test.mjs` | ✅ |
| `node scripts/mission-v2-skilltree-runtime-test.mjs` | ✅ |
| `node scripts/cisco-prefix-collision-test.mjs` | ✅ |
| `node scripts/cisco-side-missions-smoke-test.mjs` | ✅ |
| `node scripts/tts-sam-test.mjs` | ✅ |

### Acceptance checks
- `npm run lint` ✅ (0 Fehler, nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅, archiviert.

### Stop-Bedingung
- Keine Hauptmission 002.
- Keine neuen Cisco-Themen außer den drei Grundkonfig-Side-Missions.
- Auf echtem Android-Gerät testen (insbesondere TTS-Stimmenauswahl).
- Kein Push, kein Deployment außerhalb des vereinbarten Ablaufs.

## Phase 1F: TTS Voice UX, VLAN/Interface Range CLI, Main Mission 002 & L2-Security Side Mission

### Ziel
Verbessere die TTS-Sprachauswahl, erweitere den Cisco-CLI-Simulator um VLANs,
Interface-Ranges und Show-Commands, und bringe die naechste Story-Etappe mit
Main Mission 002 (VLAN fuer Personal auf Sw2) sowie einen L2-Security-
Nebeneinsatz (Parken ungenutzter Ports).

### Geaenderte/Neue Dateien
- `frontend/src/lib/speechSynthesis.js` – Sprachgruppen, stimmneutrale Labels,
  Persistenz und Fallback-Logik ohne erfundene Gender-Metadaten.
- `frontend/src/pages/Settings.jsx` – zweistufige Auswahl: Sprache, dann Stimme,
  mit Test-Satz ueber die tatsaechlich gewaehlte Stimme.
- `frontend/src/lib/ciscoCliEngine.js` – VLAN-Config, Interface-Range-Config,
  shutdown/no shutdown, switchport access vlan, `show vlan brief`,
  `show interfaces status`, erweitertes running-config, Device-Profile
  `catalyst_24fe_2ge` fuer Sw2.
- `frontend/src/lib/missionV2.js` – Main Mission 002, shared Runtime fuer Main-
  und Cisco-Side-Missions.
- `frontend/src/lib/ciscoSideMissions.js` – Side Mission 004 (Offene Tueren).
- `frontend/src/lib/worldDispatcher.js`, `frontend/src/lib/objectives.js`,
  `frontend/src/lib/questData.js`, `frontend/src/lib/gameState.js`,
  `frontend/src/pages/MissionV2.jsx`, `frontend/src/pages/Workspace.jsx`,
  `frontend/src/components/EmailApp.jsx` – Mission-Flow, Persistenz, UI-Icons.

### Neue Tests
- `frontend/scripts/cisco-main-002-test.mjs`
- `frontend/scripts/cisco-side-004-test.mjs`
- `frontend/scripts/cisco-interface-range-test.mjs`
- `frontend/scripts/cisco-discovery-test.mjs`
- Erweiterungen in `frontend/scripts/world-flow-test.mjs` und
  `frontend/scripts/tts-voice-selection-test.mjs`.

### Acceptance checks
- Alle `frontend/scripts/*-test.mjs` gruen.
- `npm run lint` ohne neue Fehler/Warnungen (nur bekannte Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅ und archiviert.
- Version auf 1.25.0 erhoeht (`frontend/package.json`,
  `frontend/src/lib/version.js`, `frontend/public/version.json`).

## Phase 1F Correction: VLAN-Mission-Redesign, Access/Trunk-Logik, Parking-VLAN, write-Abkürzung

### Ziel
Main Mission 002 war fachlich zu trivial (ein VLAN, vier Ports, fertig) und
zeigte nicht den eigentlichen Sinn von VLAN-Segmentierung. Außerdem akzeptierte
der Simulator das historische IOS-Kommando `write` (ohne `memory`) nicht als
gültige Abkürzung, obwohl unser Command Tree generische Präfix-Auflösung
unterstützt.

### `write`/`wr` Korrektur
- `frontend/src/lib/ciscoCliEngine.js`: Der `write`-Knoten in `PRIVILEGED_EXEC`
  hat jetzt zusätzlich zum Kind `memory` ein eigenes `execute`. Der generische
  Tree-Walker erkennt dadurch `write` (bare), `write memory`, `wr` und
  `copy running-config startup-config` gleichwertig als Speicherbefehl - auch
  über `do write`/`do wr` aus jedem Config-Untermodus (Interface, Interface
  Range, VLAN). Die Missionsbewertung prüft weiterhin nur den resultierenden
  `startupConfig`-Zustand, nie den exakten Befehlswortlaut.

### Neue Cisco-CLI-Befehle: Trunk
- `switchport mode trunk` (zusätzlich zu `switchport mode access`).
- `switchport trunk allowed vlan <id>[,<id>...]` (auto-erzeugt fehlende VLANs).
- `show interfaces trunk` - listet alle Trunk-Interfaces dynamisch aus dem
  Device State (Mode/Encapsulation/Status/Native VLAN + erlaubte VLANs).
- `show interfaces <interface> switchport` - Access- oder Trunk-Detailansicht
  pro Interface, ebenfalls dynamisch.
- `running-config`/`show vlan brief`/`show interfaces status` berücksichtigen
  jetzt den Trunk-Modus (z. B. Spalte „Vlan" zeigt `trunk`, Trunk-Ports
  erscheinen nicht mehr fälschlich unter VLAN 1).
- Alle neuen Befehle sind über `?`, Tab-Completion und die generische
  Präfix-/Ambiguitäts-Auflösung erreichbar (kein Sondercode nötig, da über
  den bestehenden Command-Tree-Mechanismus abgebildet).

### Main Mission 002 neu: "Neue Abteilung"
- `frontend/src/lib/missionV2.js`: Sw2 bekommt jetzt zwei produktive VLANs
  (10 PERSONAL, 20 BUCHHALTUNG), ein NEXUS-internes Parking-VLAN (999 UNUSED)
  für ungenutzte Ports, und einen Uplink (Gi0/1), der als Trunk vorbereitet
  werden muss.
- Portbelegung (Device Profile `catalyst_24fe_2ge`, Fa0/1-24 + Gi0/1-2):
  Fa0/1-4 Personal, Fa0/5-8 Buchhaltung, Fa0/9-24 aktuell unbenutzt (zu
  Missionsbeginn offen/nicht heruntergefahren - genau das Risiko, das die
  Mission beheben soll), Gi0/1 Uplink, Gi0/2 frei/reserviert (kein Check).
- Sechs Anforderungen statt vorher vier: `vlan_personal`, `vlan_buchhaltung`,
  `access_ports_configured` (beide Abteilungen), `unused_ports_parked`
  (VLAN 999 + shutdown), `uplink_trunk` (Trunk, nicht shutdown, nicht in
  VLAN 999), `verified_and_saved` (mind. ein passender Show-Befehl UND
  dauerhaft gespeichert). Einzelport- und Interface-Range-Konfiguration sind
  beide gültig; bewertet wird der Device State, keine Musterlösung.
- Verifikation akzeptiert mehrere passende Befehle (`show vlan brief`,
  `show interfaces trunk`, `show interfaces status`, `show interfaces
  <interface> switchport`, `show running-config`) statt nur eines fest
  vorgeschriebenen Kommandos.
- Story/Mail (`frontend/src/lib/worldDispatcher.js`, Briefing in
  `missionV2.js`, `frontend/src/lib/questData.js`) erklärt den betrieblichen
  Grund ("Personal und Buchhaltung hängen am selben Switch, sollen aber nicht
  in derselben Layer-2-Domäne landen") statt eine Musterlösung vorzugeben.
- Side Mission 004 ("Offene Türen", Layer-2-Security-Nachfolgeauftrag) bleibt
  unverändert - sie vertieft dasselbe Parking-VLAN-Konzept an einem eigenen
  Geräte-Snapshot nach Abschluss von Main Mission 002.

### Tests
- `frontend/scripts/cisco-main-002-test.mjs` komplett neu geschrieben: Device-
  Discovery, Erfolgspfad (Range- und Einzelport-Variante), sieben
  Negativfälle (fehlende VLANs, falscher Name, vergessener Port, offene
  Unused-Ports, Uplink nicht/falsch konfiguriert, Uplink im Parking-VLAN,
  nicht gespeichert) sowie ein Block, der `write`/`write memory`/`wr`/
  `copy running-config startup-config` gleichwertig als Abschluss verifiziert.
- `frontend/scripts/cisco-prefix-collision-test.mjs`: neuer Funktionsblock für
  Trunk-Modus, `switchport trunk allowed vlan`, `show interfaces trunk`/
  `show interfaces <interface> switchport`, sowie `write`/`wr`/`do write` aus
  allen Config-Untermodi (Global, Interface, Interface Range, VLAN). Der
  generische Präfix-Kollisions-Walker deckt weiterhin alle Modi automatisch ab.

### Acceptance checks
- Alle `frontend/scripts/*-test.mjs` grün (inkl. der neuen/erweiterten oben).
- `npm run lint` ohne neue Fehler/Warnungen (nur die 13 bekannten Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅ und archiviert.
- Version auf 1.25.1 erhöht (PATCH, da Korrektur einer bestehenden Mission
  ohne neuen Hauptinhalt).
- Kein Push, kein Deployment.

## Phase 1G: World Flow / UX / TTS / Delivery-Persistenz / Cisco-Regressionspass

### Ziel
Kein neuer Content-Pass. Der bestehende NEXUS-Spielablauf soll stabiler,
glaubwürdiger und simulationsartiger werden: Missionen brauchen einen
persistenten In-World-Anker, Jetzt/Später-Entscheidungen müssen Text UND
Gameplay konsistent behandeln, das ObjectivePanel soll nach Relevanz statt
Kategorie sortieren, Kommunikations-Badges müssen aus echtem State kommen,
ein Android-TTS-Bug (Mehrfachauswahl) und ein Cisco-Regressionsbug
(Allowed-VLAN erzeugt VLANs) mussten behoben werden, und das Cisco-Terminal
darf die Missionsseite nicht mehr endlos verlängern.

### TTS Single-Select Fix
- `frontend/src/lib/speechSynthesis.js`: `voiceMatchesKey()` neu geschrieben.
  Vorher fiel die Prüfung bei fehlendem/leerem `voiceURI` (typisch für
  manche Android-Engines, die für alle Stimmen einer Sprache den gleichen
  generischen `name` liefern, z. B. "Deutsch (Deutschland)") auf einen
  Name+Lang-Vergleich zurück, der dann ALLE gleichnamigen Stimmen als
  "ausgewählt" markierte. Jetzt ist die Priorität strikt: passender
  `voiceURI` ist entscheidend, wenn beide Seiten einen haben; sonst der
  stabile Discovery-`index`; erst danach (nur bei wirklich fehlenden IDs)
  Name+Lang als letzter Ausweg. `voiceKeyFromVoice()` persistiert jetzt
  zusätzlich den `index`.
- `frontend/src/pages/Settings.jsx`: `isVoiceSelected()` nutzt jetzt die
  gemeinsame `voiceMatchesKey()` statt einer eigenen (fehlerhaften) Kopie -
  Single-Select wie Radio-Buttons, exakt eine Karte markiert.
- Test: `frontend/scripts/tts-voice-selection-test.mjs`, neuer Abschnitt
  "Single-select identity" mit drei absichtlich gleichnamigen Sample-Voices.

### Cisco Fix: `switchport trunk allowed vlan` erzeugt keine VLANs mehr
- `frontend/src/lib/ciscoCliEngine.js`: Der Handler ruft `ensureVlan()`
  nicht mehr auf. Die Allowed-VLAN-Liste des Interfaces wird weiterhin
  gesetzt, aber die VLAN-Datenbank bleibt unverändert.
- `renderInterfacesTrunk()` zeigt jetzt zwei Abschnitte wie echtes IOS:
  "Vlans allowed on trunk" (konfiguriert, unabhängig von der VLAN-DB) und
  "Vlans allowed and active in management domain" (nur die VLANs, die
  tatsächlich existieren).
- Test: neuer Block in `frontend/scripts/cisco-prefix-collision-test.mjs`
  (VLAN 20/30 bleiben nicht angelegt, obwohl sie in der Allowed-Liste
  stehen; beide Show-Abschnitte respektieren den Unterschied).

### Terminal-Fenster
- `frontend/src/pages/MissionV2.jsx`: Die Terminal-Historie hatte
  `flex-1 min-h-0` gegen einen unbegrenzten Elterncontainer (`.app-shell`
  hat nur `min-height: 100vh`, nie eine Obergrenze) - dadurch hatte
  `flex-1` keine Wirkung und das Terminal wuchs mit jeder Ausgabe die ganze
  Seite auf. Jetzt hat die Historie eine feste, sichtbare Höhe
  (`h-64 sm:h-80`) mit eigenem `overflow-y-auto`. Auto-Scroll respektiert
  jetzt manuelles Hochscrollen (`autoScrollRef`, `handleTerminalScroll`);
  ein eigener Befehl scrollt immer zum aktuellen Prompt
  (`scrollTerminalToBottom()`).
- Test: `frontend/scripts/mission-v2-terminal-scroll-test.mjs` (statische
  Quellcode-Prüfung, gleiches Muster wie `settings-tdz-regression-test.mjs`,
  da es im Projekt keinen React-Rendering-Testharness gibt).

### Kommunikations-Badges
- `frontend/src/lib/communicationBadges.js` (neu): einzige Quelle für
  Mail-/Telefon-/Ticket-Zähler, direkt aus `emails.js`/`notificationSystem.js`/
  `sideMissionEngine.js` abgeleitet - kein separat gepflegter Zähler.
- `frontend/src/pages/Workspace.jsx`: Desktop-Icons (E-Mail, Telefon,
  Tickets) zeigen jetzt alle einen echten numerischen Badge; der
  Hotspot-Punkt berücksichtigt alle drei Kanäle. Badges werden bei
  App-Öffnen/-Schließen und beim `it-learn:game-state`-Event neu berechnet.
  Totes `notifications`/`pending`-State entfernt.
- Test: `frontend/scripts/communication-badges-test.mjs`.

### Delivery-Persistenz & Jetzt/Später
- `frontend/src/lib/worldDispatcher.js`: Die vier Sam-Dialoge mit
  Jetzt/Später-Wahl haben jetzt unterschiedliche Abschlusstexte für beide
  Zweige; die Mail/das Ereignis existiert bereits vorher unabhängig von der
  gewählten Option (WORLD_EVENTS lösen ausschließlich über Spielzustand
  aus, nie über die Dialogwahl). Neue Funktion `getMissionDeliveryState()`
  liefert einen einzelnen, klar benannten Zustand
  (`none | eventDispatched | deliveryCreated | missionAvailable |
  missionAccepted | missionActive | missionCompleted`) rein additiv aus
  bestehenden Stores (E-Mails, Notifications, `missionLog`, `gameState`).
- Verifiziert (nicht verändert, da bereits korrekt): Verlassen einer
  Mission ohne Abschluss (`returnToWorkspace()`) löscht den Mission-State
  nicht; die Mail/der Anruf bleibt im jeweiligen Store erhalten;
  App-Neustart liest denselben persistierten Zustand erneut.
- Test: `frontend/scripts/world-flow-delivery-test.mjs` (Jetzt-/Später-Mail,
  Mail-Persistenz, Telefon-Persistenz, Mission abbrechen, Reload,
  vollständiger Delivery-State-Lebenszyklus).

### ObjectivePanel: Relevanz statt Kategorie
- `frontend/src/lib/objectives.js`: neue `RELEVANCE_TIER`-Konstante als
  einzige Prioritätsskala (aktive Mission > dringendes Ereignis > ungelesene
  missionsrelevante Kommunikation > verfügbare Progressions-Mission >
  verfügbare Nebenmission > adaptive Wiederholung > gesperrte, bereit
  freischaltbare Hauptmission > gesperrte Hauptmission > reine
  Zukunftsinfo). Neue Funktionen `getActiveMissionObjective()` und
  `getUnreadMissionCommunication()` (mit Schutz gegen bereits abgeschlossene
  Missionen). `getObjectiveLabel()` liefert immer einen konkreten Text
  (nie nur "Verfügbar") - auch für den bisher fehlerhaften Fall, dass die
  Top-Nebenmission ein Array statt eines Titels war.
- `frontend/src/components/ObjectivePanel.jsx`: neue Karten für "Aktiver
  Auftrag" und "Ungelesen" (E-Mail/Anruf); Drag/Clamp/Persistenz-Logik
  unverändert (Regressionstest bleibt grün).
- Tests: `frontend/scripts/objective-priority-test.mjs` (neu),
  `frontend/scripts/world-flow-test.mjs` (Erwartungen an die neue,
  korrektere Prioritätsreihenfolge angepasst).

### Acceptance checks
- Alle `frontend/scripts/*-test.mjs` grün (inkl. neuer/erweiterter Tests).
- `npm run lint` ohne neue Fehler/Warnungen (nur die 13 bekannten Warnungen).
- `npm run build` ✅.
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅ und archiviert.
- Version auf 1.25.2 erhöht (PATCH: Stabilitäts-/UX-Fixes, kein neuer
  Hauptcontent, kein prozeduraler Missionsgenerator).
- Kein Push, kein Deployment.

## Phase 1H: Adaptive Learning + Prozedurales Nebenmissionssystem V1

### Ziel
Hauptmissionen bleiben handgebaut und lehren neue Fähigkeiten. Ein neues,
domänen-agnostisches Generator-/Validator-/Adaptive-Selector-System erzeugt
darüber hinaus glaubwürdige, an den echten Lernstand angepasste Cisco-
Nebenmissionen - ausschließlich aus Skills, die bereits durch Main 001/002
freigeschaltet wurden. Bestehende Systeme (Skill Tree, Mission Log, Hint
Ladder, World-Flow-Delivery, Objective-Relevanz, Badges) werden erweitert,
nicht ersetzt.

### Neue Dateien
- `frontend/src/lib/missionTemplateEngine.js` - domänen-agnostischer
  `MissionTemplate`-Vertrag (Archetypen, Channels, Difficulty-Profile,
  Seeded-RNG-Helfer) + zwei Cisco-V1-Templates:
  - `cisco-basic-config-hardening` (unlockedBy Main 001; Archetypen BUILD,
    AUDIT; Skills hostname/enable_secret/local_user/disable_dns_lookup/
    save_config).
  - `cisco-vlan-access-port` (unlockedBy Main 002; Archetypen BUILD, REPAIR,
    AUDIT, DIAGNOSE, COMPLETE - deckt genau das Beispiel aus dem Auftrag ab;
    Skills vlan.create/name, access_port.configure/assign_vlan/verify).
  - Beide Templates erzeugen einen echten `createCiscoDevice()`-Zustand und
    nutzen ausschließlich `ciscoCliEngine.js` zur Befehlsausführung - kein
    eigener Parser.
- `frontend/src/lib/missionGenerator.js` - der eigentliche Kern:
  - **Persistenz** (`readInstances`/`getInstance`/`getOpenInstances`) unter
    eigenen, additiven localStorage-Keys (`cyberlearn:procedural-*`) - keine
    Änderung an bestehenden Schemas, daher migrationsfrei.
  - **Curriculum-Unlock** (`isSkillGroupUnlocked`, `generatableSkillPaths`):
    `basic_configuration` durch `cisco-main-001`, `switching` durch
    `cisco-main-002` - Erweiterungspunkt für zukünftigen Content (item 26).
  - **Adaptive Selector** (`selectSkillForGeneration`): konfigurierbare
    Gewichte (`ADAPTIVE_WEIGHTS`: weakness/reviewDue/progression/
    timeSincePractice/varietyNeed/strugglingRepeatedErrors) mit
    60/25/15-Baseline-Fallback, wenn keine klare Schwäche vorliegt.
  - **Adaptive Difficulty** (`suggestDifficulty`): zwei Fehlversuche in Folge
    → EASY, zwei unabhängige Erfolge bei Mastery > 0.5 → HARD.
  - **Archetyp-/Channel-Wahl**: gewichtet nach Mastery (nie hart
    ausgeschlossen, sonst keine Varianz bei identischer Mastery), Channel
    aus der Schnittmenge von Template- und Archetyp-Affinität.
  - **Anti-Repetition** (`isImmediateRepeat`, 50 Einträge Historie).
  - **Validator** (`validateMissionInstance`): Parameter, Unlock-Status,
    Erfolgskriterien, Difficulty, Channel-Passung, Anti-Repetition,
    Device-State-Konsistenz (Ziel-Interface existiert, kein Uplink als Ziel,
    keine reservierten/kollidierenden VLAN-IDs).
  - **Generator** (`generateMissionInstance`): GENERATE → VALIDATE →
    ACCEPT/REJECT mit bis zu 12 Versuchen; zeigt nie eine ungültige Mission.
  - **Delivery** (`deliverMissionInstance`): E-Mail/Ticket/Telefon über die
    bestehenden Stores (`emails.js`, `notificationSystem.js`), verlinkt via
    `procedural:<instanceId>`.
  - **Batch-Scheduler** (`maybeGenerateBatch`, `notifyMissionCompleted`,
    `BATCH_CAP = 3`): läuft ausschließlich bei einem echten Trigger
    (Missionsabschluss), niemals bei Seitenaufruf/Reload/Postfach-Öffnen.
  - **Content-End** (`hasReachedContentEnd`, `maybeAnnounceContentEnd`):
    rein listenbasiert über `missionV2.js`' neues `MAIN_MISSION_ORDER` -
    verschiebt sich automatisch, sobald eine neue Hauptmission ergänzt wird.
  - **Runtime-Adapter** (`startProceduralMission`,
    `executeProceduralMissionCommand`, `evaluateProceduralMission`,
    `getProceduralMissionHint`/`consumeProceduralMissionHint`/
    `revealProceduralMissionSolution`): spiegelt `missionV2.js`s
    Ausführung/Bewertung, aber generisch über `getTemplate(...)`.
- `frontend/src/pages/ProceduralMission.jsx` - eigene, spielbare Seite unter
  `/procedural-mission/:instanceId`; übernimmt 1:1 das in Phase 1G fixierte
  Terminal-Verhalten (feste Höhe, eigener Scroll, manuelles Scrollen bleibt
  erhalten, eigener Befehl scrollt zum Prompt).

### Geänderte Dateien
- `frontend/src/lib/missionV2.js` - `MAIN_MISSION_ORDER`/
  `getHighestImplementedMainMissionId()` (einzige Stelle, die bei einer
  neuen Hauptmission erweitert werden muss).
- `frontend/src/lib/skillTree.js` - `SKILL_SOURCE.PROCEDURAL` ergänzt.
- `frontend/src/lib/notificationSystem.js` - `notificationTypes.TICKET`
  ergänzt (Tickets sind jetzt echte Notifications, keine Ad-hoc-Liste).
- `frontend/src/lib/communicationBadges.js` - Ticket-Badge zählt jetzt auch
  offene `TICKET`-Notifications zusätzlich zum Legacy-Inbox.
- `frontend/src/lib/objectives.js` - `getUnreadMissionCommunication()`
  erkennt jetzt auch Ticket-Kommunikation; `getActiveMissionObjective()`
  erkennt prozedurale Missions-IDs.
- `frontend/src/components/ObjectivePanel.jsx` - Navigation für aktive
  prozedurale Missionen.
- `frontend/src/components/EmailApp.jsx` / `PhoneApp.jsx` - erkennen
  `procedural:`-Missions-IDs und routen zu `/procedural-mission/:instanceId`;
  `emailCompleted()` prüft für prozedurale Mails den echten Instanz-Status.
- `frontend/src/pages/MissionV2.jsx` - ruft nach Abschluss einer
  Haupt-/Nebenmission `notifyMissionCompleted()` auf, damit der
  Batch-Scheduler an einen echten Trigger gekoppelt bleibt.
- `frontend/src/App.jsx` - neue Route `/procedural-mission/:instanceId`.

### Bekannte Einschränkungen (V1)
- Nur zwei Templates (Grundkonfiguration-Hardening, VLAN/Access-Port) - exakt
  die aktuell handgebaut eingeführten Skills, bewusst "Qualität vor Menge".
- Ticket-Channel-Missionen erscheinen als echte Notification (Badge korrekt),
  aber die bestehende `/inbox`-Seite (Legacy-Ticketliste aus
  `sideMissionEngine.js`) zeigt sie noch nicht zusätzlich an; erreichbar sind
  sie aktuell über den (im selben Kanal ebenfalls sinnvollen) Objective-Panel-
  Hinweis. Eine dedizierte Ticket-Ansicht ist ein sinnvoller Folgeschritt.
- `maybeGenerateBatch` erzeugt V1 bewusst konservativ höchstens 1 Mission pro
  Trigger (Spezifikation erlaubt bis zu 3) - einfacher zu balancieren und zu
  testen; Wert ist zentral als Konstante anpassbar.
- Troubleshooting-Steigerung (item 33) ist über den DIAGNOSE-Archetyp der
  VLAN-Vorlage angelegt, aber noch nicht mit einem eigenständigen
  Multi-Schritt-Diagnoseablauf (wie `diagnosticState.js`) verknüpft.

### Tests
- `frontend/scripts/procedural-mission-generator-test.mjs` (35 Tests,
  A-O aus dem Abnahmekatalog plus End-to-End-Runtime-Test plus
  Persistenz-/Migrationstest).
- Alle bestehenden `frontend/scripts/*-test.mjs` bleiben grün (Regression).

### Acceptance checks
- Alle `frontend/scripts/*-test.mjs` grün (inkl. der 35 neuen Tests).
- `npm run lint` ohne neue Fehler/Warnungen (nur die 13 bekannten Warnungen).
- `npm run build` ✅ (inkl. neuer `ProceduralMission`-Route).
- `npx cap sync` ✅.
- APK build via `scripts/build-apk.ps1` ✅ und archiviert.
- Version auf 1.26.0 erhöht (MINOR: neue große Funktionalität).
- Kein Push, kein Deployment.
