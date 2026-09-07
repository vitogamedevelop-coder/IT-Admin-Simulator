# CyberLearn Lernarchitektur – C5 DHCP/DHCP Relay Micro-Learning Pilot

**Version:** 1.99.0  
**Build:** `1882e95c2fde`  
**APK:** `IT-Admin-Simulator_2026-09-07_20-04.apk`  
**State version:** 14  
**SW Cache:** `cyberlearn-v1.99.0`

---

## A. DHCP IST vor Umbau

- `frontend/src/lib/academyLessons/ciscoDhcp.js` war als klassische Erklärungsketten-Lektion aufgebaut.
- 11 Erklärsektionen, 9 Übungen, 12 Quizfragen, 7 CLI-Tasks.
- Viele dedizierte Szenario-Abschnitte (physisch, Router-on-a-Stick, Multilayer-Switch, Packet-Tracer-Pool, Troubleshooting, Verifizierung).
- Dopplungen: `ip helper-address` Begriff wurde in Erklärung, Question, Übung, Quiz und CLI jeweils wiederholt, oft ohne neue Kompetenz.
- Theorieanteil hoch, aktive Interaktionen verteilt, passiver Leseanteil in Szenario-Tabellen signifikant.

## B. Source-/Lehrgangscoverage

Alle für den Pilot relevanten Inhalte erhalten:

- DHCP-Broadcast-Problem über Netzgrenzen
- Cisco `ip helper-address <DHCP-Server-IP>`
- WO (clientseitiges L3-Interface) vs. WELCHE IP (DHCP-Server)
- Physisches Interface, Subinterface, SVI
- Multi-VLAN: jeder Client-VLAN braucht eigenen Helper
- Routing-Abhängigkeit
- APIPA als Symptom
- `show running-config | include helper`, `show ip interface`, `show ip route`
- Default-Gateway im DHCP-Pool ist das Client-Gateway

## C. KEEP / REWORK / MERGE / REMOVE

| Element | Entscheidung | Begründung |
|---|---|---|
| DORA-Animation | KEEP | Grundverständnis DHCP bleibt in Erklärung |
| 3 Szenario-CLI-Beispiele | REWORK → `dhcp-recall-command`, `dhcp-apply-subinterface`, `dhcp-transfer-svi` | Aktiver, facetbasierter Abruf |
| Quizfragen | MERGE auf 5 zielgerichtete Items | Weniger reine Wiedererkennung |
| Packet-Tracer-Server-Pool | MERGE in `apply-multi-vlan` Erklärung | Default-Gateway-Frage erhalten |
| Troubleshooting-Tabelle | MERGE in `diagnose-apiipa` | Symptom/APIPA gezielt |
| Optional: Router als DHCP-Server/Client | REMOVE | Out-of-scope für Relay-Pilot |
| Verifizierungsbefehle | MERGE in `verify` + `cliTasks` | Weniger Text, mehr Praxis |

## D. Entfernte Dopplungen

- Keine 4x wiederholte `ip helper-address` Definition.
- Keine separaten Szenario-Abschnitte für jeden Gerätetyp mit langer Textwiederholung.
- Keine duplizierte `wo vs. welche IP` Multiple-Choice in Erklärung UND Quiz.
- Verifizierungsbefehle nicht mehr als reine Tabelle, sondern in CLI-Aufgaben aktiv.

## E. Neuer Lernflow

Kompakte Mikro-Sitzung (11 sections):

1. `nexus-intro` – Problem beobachten
2. `mental-model` – Broadcast-Grenze
3. `recognize` – DHCP Relay Konzept
4. `understand-placement` – WO vs. WELCHE IP
5. `scenarios` – physisch / subinterface / SVI
6. `recall-command` – Befehl eingeben
7. `apply-multi-vlan` – Multi-VLAN + Default Gateway
8. `diagnose-apiipa` – APIPA diagnostic
9. `verify` – Show-Befehle
10. `transfer` – leicht verändertes Szenario
11. `summary` – Kernaussagen

Rhythmus: TEACH → DO → TEACH → DO.

## F. NEXUS-Einstieg

Sam: „Neue Abteilung, keine IP. Statische IP funktioniert. Woran liegt es?"  
Der Spieler muss erst erkennen, dass statische Erreichbarkeit das Kabel/Netzwerk ausschließt – das Problem liegt im DHCP-Ablauf an der Netzgrenze.

## G. Mental Model

- Client → lokales VLAN → Broadcast → Router/Gateway → Unicast → DHCP-Server
- Router leitet Broadcasts normalerweise nicht weiter
- Relay wandelt Broadcast in Unicast um
- Visual: `DHCP_RELAY_SVG` in `mental-model`

## H. Micro-Explanations

Keine 10 Erklärseiten hintereinander. Jede Erklärung ist maximal 1–2 Textblöcke + 1 Visual/Table + 1 inline Question.

## I. Recognize Interaction

- `dhcp-recognize-concept`: select-best „Welches Konzept überbrückt die Broadcast-Grenze?"
- Evidence: `recognized`

## J. Understand Interaction

- `understand-placement` inline question: WO vs. WELCHE IP
- `scenarios` inline question: Multi-Subinterface
- Evidence: `understood`

## K. Recall Interaction

- `dhcp-recall-command`: CLI-Input `interface fa0/0` + `ip helper-address 172.16.0.10`
- Evidence: `recalled`

## L. Apply Interaction

- `dhcp-apply-subinterface`: Router-on-a-Stick
- `dhcp-multi-vlan-select`: Auswahl der richtigen Subinterfaces
- `cliTasks`: physisches, Subinterface, SVI
- Evidence: `applied`

## M. Diagnostic Interaction

- `diagnose-apiipa`: Client zeigt 169.254.x.x, statische IPs funktionieren
- `dhcp-recovery-wrong-svi`: Helper steht auf falscher SVI → entfernen und neu setzen
- Evidence: `diagnosed`

## N. Transfer Interaction

- `transfer` inline question: neues Netz 10.20.20.0/24, neues Interface Gi0/0.1, Server 172.22.5.10
- `dhcp-transfer-svi`: Multilayer-Switch VLAN 30
- Evidence: `transferred`

## O. Partial Handling

- `LearningCommandInput` wird `partial` an `recordQuestionAnswer` melden.
- `learningMastery.updateMasteryFromResult` aktualisiert `consecutiveSuccesses = 0` und gibt nur geringen Confidence-Gewinn.
- Keine Full-Recall Evidence, Mastery bleibt unsicher, Review-Priority steigt nicht sofort stark.

## P. Wrong Handling

- `recoveryPending` wird gesetzt, `needsReview` true, `recentFailureCount` erhöht.
- Feedback im `LessonRunner` zeigt kurze Erklärung, aber nicht sofort die ganze Lösung.
- Facet wird für `getReviewPriority` hochpriorisiert.

## Q. Recovery Flow

- `dhcp-recovery-wrong-svi` trägt `adaptive: 'recovery'` und wird von `selectDirectTheoryExercises` nur dann ausgewählt, wenn `ciscoDhcp.helperPlacement` `recoveryPending` ist.
- Nach einer späteren erfolgreichen Anwendung (`svi-ok`) auf derselben Facet in anderem Kontext und ausreichendem Abstand > 60s wird `recoveryPending` aufgehoben.
- Keine identische Wiederholung der ursprünglichen Frage.

## R. Mastery Adaptation

- `lessonExerciseSelector.js` bewertet jedenzeit `getReviewPriority`, `needsRecovery`, `getRecommendedDifficulty` für jede Übung.
- Recovery-Übungen werden erzwungen.
- Ansonsten wird nach absteigender Priorität + passendem Schwierigkeitsgrad sortiert.
- Starke Spieler sehen keine forced-Recovery, schwache bekommen geeignetere einfachere/Recovery-Items.

## S. Right Challenge

- `getRecommendedDifficulty` pro Facet wird in `selectDirectTheoryExercises` genutzt.
- Übungen, deren `difficulty` zum empfohlenen passt, werden priorisiert.
- Trotzdem bleibt der didaktische rote Faden erhalten, weil die Auswahl aus der vorgegebenen `exercises`-Liste kommt.

## T. Evidence generated

- `viewed` (durch Section-Durchlauf)
- `recognized` (Konzept erkannt)
- `understood` (Placement, Multi-VLAN, Default Gateway)
- `recalled` (Command-Input)
- `applied` (CLI-Übungen, CLI-Tasks)
- `diagnosed` (APIPA, falsche SVI)
- `transferred` (neuer Kontext)

## U. Progress / Completion Semantics

- Theory Completion bleibt per Section-Views.
- `completed` / `viewed` ≠ `understood/mastered` (C3-Regel bleibt).
- Exercise- und Quiz-Vervollständigungen vergaben Mastery, nicht nur Punkte.

## V. Alte IDs / Save Migration

- `legacyId` in `ciscoDhcp.js` Erklärungen und Übungen.
- `academyProgress.js` baut `legacySectionMap` und `legacyExerciseMap` aus `lesson.legacyId`.
- `sanitizeTopicProgress` mappt alte `completedSectionIds`/`completedExerciseIds` auf neue IDs.
- `STATE_VERSION` 14 migriert 1.98.0-Saves.
- Alte Theoriefortschritte bleiben monoton erhalten; keine Fake Evidence.

## W. Mission Bridge

- Keine neue Mission gebaut.
- Bestehende `ciscoSideMissions` und `skillTree` unverändert.
- Lesson bleibt Academy-Lernen; Missionen bleiben eigenständige Anwendung.

## X. Themencheck / Conversation Preservation

- `academyThemencheck.js` und `AcademyThemencheck.jsx` unverändert.
- Conversations unverändert.
- `ciscoDhcp.js` füttert Evidence/Mastery, ersetzt keine Prüfungs-Engine.

## Y. Before/After Passive Interaction Metrics

- Vorher: 11 längere Erklärungsseiten, oft mit Tabellen; passiver Leseanteil signifikant.
- Nachher: 11 Mikro-Sektionen, jede mit inline-Question oder direkter Übung; längste passive Sequenz ≤ 2 Textblöcke.
- Textmenge pro Explanation reduziert; Interaktionsdichte pro Section erhöht.

## Z. Mobile UX

- Inline-Fragen und CLI-Input sind primär Touch/Input optimiert.
- SVG-Diagramme `max-h-64` für kleine Viewports.
- Keine langen Textblöcke ohne Interaktion.
- Manual Mobile Playtest empfohlen für Command-Input und Feedback auf Small-Viewport.

## AA. Strong Player Path

- Alles richtig → keine `adaptive: 'recovery'`-Übung gezwungen.
- `selectDirectTheoryExercises` liefert kompakte Mischung aus `medium`/`hard` Items.
- Kein unendlicher Drill, schneller Abschluss möglich.

## AB. Struggling Player Path

- Mehrere Fehler → `needsRecovery`/`needsReview`.
- `selectDirectTheoryExercises` bevorzugt Recovery/Easier-Items.
- `dhcp-recovery-wrong-svi` gibt gezielte Hilfe.
- Kein Dead-End: Lesson trotz Unsicherheit abschließbar.

## AC. Legacy Player Path

- 1.98.0-Fortschritt wird beibehalten.
- `academy-cisco-dhcp-test.mjs` und `dhcp-microlearning-progress-migration-test.mjs` bestätigen ID-Mapping.
- Theoriecompletion sinkt nicht.

## AD. Tests

Neu:

- `dhcp-microlearning-contract-test.mjs` ✅
- `dhcp-microlearning-recovery-test.mjs` ✅
- `dhcp-microlearning-partial-command-test.mjs` ✅
- `dhcp-microlearning-strong-path-test.mjs` ✅
- `dhcp-microlearning-struggle-path-test.mjs` ✅
- `dhcp-microlearning-progress-migration-test.mjs` ✅
- `academy-cisco-dhcp-test.mjs` ✅ (angepasst an neue Micro-Struktur)

C1–C4 Regression:

- `learning-mastery-contract-test.mjs` ✅
- `learning-recovery-evidence-test.mjs` ✅
- `learning-partial-answer-mastery-test.mjs` ✅
- `learning-review-priority-test.mjs` ✅
- `learning-temporal-mastery-test.mjs` ✅
- `academy-progress-mastery-migration-test.mjs` ✅
- `academy-progress-evidence-migration-test.mjs` ✅

## AE. Regression

- `academy-cisco-dhcp-test.mjs` und `cisco-dhcp-relay-*` passen.
- `academy-progress-migration-*` aktualisiert auf `STATE_VERSION 14`.
- `academyLessons/dhcp.js` (Windows-fundamentals DHCP) unverändert.
- Keine Änderungen an `LessonRunner.jsx`, `academyThemencheck.js`, Conversation/Simulator/Mission.

## AF. Lint

- `npm run lint` erfolgreich.
- 18 Warnungen (alle pre-existing, keiner neu für C5), 0 Fehler.

## AG. Build

- `npm run build` erfolgreich.
- `cyberlearn-v1.99.0` Cache.
- `buildHash = 1882e95c2fde`.

## AH. Capacitor

- `npx cap sync` erfolgreich.
- Web-Assets in `android/app/src/main/assets/public` aktualisiert.

## AI. APK

- `build-apk.ps1` erfolgreich.
- `BUILD SUCCESSFUL`
- `IT-Admin-Simulator_2026-09-07_20-04.apk` archiviert.

## AJ. Version / versionCode / Cache

- `1.99.0`
- `versionCode 19900`
- Service-Worker-Cache `cyberlearn-v1.99.0`
- Aktualisiert in `package.json`, `src/lib/version.js`, `public/version.json`, `android/app/build.gradle`, `AGENTS.md`.

## AK. Commit

- Lokal commiten mit aussagekräftiger Message.
- Kein Push.

## AL. LOCAL ONLY

- Kein `git push`.
- Kein GitHub Actions.
- Kein GitHub Pages.
- Kein Remote Release.

## AM. Known Risks

- `lessonExerciseSelector.js` liest `localStorage`/`academyProgress` bei jedem `LessonRunner`-Render; Performance bei sehr großen Topics beobachten.
- Section IDs für `LessonRunner` werden aus `explanation.id` vor dem letzten `-` abgeleitet; unsere `id`s `nexus-intro`, `mental-model` etc. erzeugen Kurz-IDs `nexus`, `mental`, `understand`, `recognize`, `apply`, `diagnose`, `verify`, `transfer`, `summary`. Das ist korrekt, aber `recognize`- und `apply`-Sections haben jetzt den Kurznamen, der im Fortschritt erscheint.
- Manuelles Mobile-Playtest noch nicht durchgeführt.

## AN. Empfehlung für Playtest

1. Neuen Spieler: DHCP-Lektion starten, absichtlich Placement-Frage falsch beantworten, Recovery beobachten, Command-Input und Diagnose lösen, speichern.
2. Bestehenden Spieler: 1.98.0-Save laden, DHCP öffnen, Fortschritt prüfen.
3. Strong Player: schnell alles richtig, kein Recovery-Spam.
4. Struggling Player: mehrere Fehler, adaptive Hilfe, trotzdem abschließbar.

## AO. KEINE Rollout-Empfehlung vor Nutzerfeedback

Der Pilot sollte erst nach den oben genannten manuellen Playtests und Feedback zu Pace, Textmenge, Mobile UX sowie Diagnose-Interaktion auf andere Lektionen ausgeweitet werden.

---

*C5 ist der erste spielbare Micro-Learning-Pilot. Er demonstriert, dass die konsolidierte C1–C4-Architektur einen aktiveren, adaptiveren Lernflow ermöglicht, ohne eine parallele Engine oder einen neuen Store zu bauen.*
