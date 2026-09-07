# CyberLearn Learning Architecture – Phase C4 Report

Version: 1.98.0  
State: local only, no push  
Base: C3 (1.97.0) evidence layer

---

## A. Bestehende Mastery-Systeme vor C4

Auditierte Systeme (keine Neuerfindung, sondern Erweiterung):

- `knowledge/facetMastery.js` – einfaches Score-Modell [-5, +5] pro Facet für Cooldown/Selektion.
- `competency.js` – topic-level Knowledge/Application/Speed/Stability mit `nextReview` für Praxis-/Quiz-Missionen.
- `conversationMastery.js` – informeller Flur-Gesprächs-Score pro `topicKey`.
- `academyStatus.js` – aggregierte Topic-Status `available ... consolidated`.
- `academyThresholds.js` – Score-Schwellen für Statuswechsel.
- `academyProgress.js` – Persistenz, `evidence` (C3), `theoryScore`, `practiceScore`, `retentionScore`, `appliedCount`, `repetitionCount`.
- `academyThemencheck.js` – Themencheck-Resultate, `competency` `recall | interpretation | diagnosis | transfer` pro Frage.
- `semanticHistory.js` + `semanticBalancer.js` – Anti-Repetition und Auswahl nach Schwäche/Abkühlung.
- `learningEvidence.js` (C3) – Evidence-Layer mit 8 Evidence-Typen.

## B. Welche davon weiterverwendet wurden

- `academyProgress` als einzige zentrale Persistenz; `mastery` wurde pro Topic ergänzt.
- `academyStatus.js` und `academyThresholds.js` wurden nicht verändert.
- `academyThemencheck.js` wurde an `learningMastery` angebunden.
- `learningEvidence.js` dient weiterhin als Evidence-Quelle; `applyEvidenceToData` exportiert, damit `learningMastery` in einem Write-Pfad arbeiten kann.

## C. Welche bewusst nicht verändert wurden

- `competency.js` – weiterhin Produktiv für Missionen/Quiz, nicht angetastet.
- `conversationMastery.js` – unverändert; C5/C6 kann hier einen `recordLearningResult`-Hook ergänzen.
- `facetMastery.js` – unverändert; `learningMastery` ist die feinere semantische Ebene, `facetMastery` bleibt für bestehenden Balancer gültig.
- `semanticBalancer.js` – kein Eingriff; `getReviewPriority`/`getRecommendedDifficulty` sind Ausgabe-APIs für spätere Selektor-Erweiterungen.
- Lesson-Strukturen, Fragen, Fachinhalte – unverändert.

## D. Neues/erweitertes Mastery Model

Neu: `frontend/src/lib/learningMastery.js`.

Pro Facet speichert `topic.mastery[facetId]`:

- `confidence` (0..1)
- `stability` (0..1)
- `consecutiveSuccesses`
- `recentFailureCount` (bounded 0..3)
- `lastEvidenceAt`, `lastSuccessAt`, `lastFailureAt`
- `lastFailureSource`, `lastFailureEvidenceRank`
- `needsReview`, `recoveryPending`
- `totalAttempts`
- `state` (`new | learning | uncertain | stable | needs-review`)

Kein neuer Store; alles in `academyProgress.topics[key].mastery`.

## E. Granularität

1. Facet (Knowledge-Item / `relatedKnowledgeIds`, `facet`, `sourceSection`)
2. Section-Fallback
3. Topic-Aggregate

`recordLearningResult` nimmt `facetIds`; ohne Facet wird `sourceSection` oder `topicId` als Facet verwendet (Aufrufer passen das an).

## F. Confidence / Stability Semantik

- `confidence`: wie sicher ist das aktuelle Wissen, basierend auf Evidence-Typ, Schwierigkeit, Hinweisnutzung, Correct/Partial/Wrong.
- `stability`: wie stabil ist das Wissen, basierend auf zeitlich getrennten Erfolgen; Sofort-Wiederholungen zählen weniger, lange Pausen mehr.

Update ist EMA-ähnlich; `confidence` entwickelt sich langsamer als bei einer einzelnen Antwort, `stability` braucht mehrere zeitlich getrennte Erfolge.

## G. Partial / Incomplete Behandlung

- Partial fügt `confidence` mit `PARTIAL_CREDIT = 0.4` des vollen Evidence-Werts hinzu.
- Partial erhöht `stability` nur minimal.
- Partial erhält kein höherwertiges Evidence in `learningEvidence.js`.
- Partial führt bei sehr niedrigem `confidence` zu `needsReview`.

## H. Wrong Answer Behandlung

- Keine Punkte, keine positive Evidence.
- `recentFailureCount` + bounded `consecutiveSuccesses = 0`.
- `needsReview = true`, `recoveryPending = true`.
- `confidence` und `stability` sinken, aber nicht auf `0`.
- Thema/Status wird nicht zurückgesetzt (kein `new`).

## I. Recovery Pending

- Wird bei `wrong` gesetzt.
- Lösungsanzeige setzt ihn nicht zurück.
- Bleibt bestehen, bis der Lernende in einer neuen Instanz (anderer `source` oder ausreichender zeitlicher Abstand) erneut erfolgreich ist.

## J. Recovery Evidence

- `recordLearningResult` prüft bei `correct` automatisch: `source !== lastFailureSource` und `at - lastFailureAt >= MASTERY.MIN_GAP_FOR_RECOVERY`.
- Dann wird `recoveryPending = false`.
- `markRecoverySuccess(...)` erlaubt explizites Schließen.
- Recovery beweist, dass der Fehler korrigiert wurde, nicht dass dauerhaftes Beherrschen erreicht ist.

## K. Semantic Anti-Repetition für Recovery

- Recovery erfordert unterschiedlichen `source`.
- Sofortgleiche Frage (gleicher `source`) zählt nicht.
- `semanticHistory` / `semanticBalancer` bleiben die Kanäle für inhaltliche Diversität.

## L. Zeitlicher Abstand

- `MASTERY.MIN_GAP_FOR_RECOVERY = 60 000 ms` (1 Minute) als untere Schranke.
- `timeSeparationFactor` belohnt Stunden- und Tagesabstand für `stability`.
- Review-Priorität steigt bei langer Nicht-Wiederholung wieder an.

## M. Review Priority

- `getReviewPriority(categoryId, topicId, facetId)` liefert numerischen Wert.
- Höher bei `recoveryPending`, `needsReview`, `recentFailureCount`, geringem `confidence`/`stability` und langer Inaktivität.
- Niedriger bei `stable`.
- `getReviewCandidates(...)` sortiert und liefert Top-K.

## N. Recommended Difficulty / Right Challenge

- `getRecommendedDifficulty(categoryId, topicId, facetId)`:
  - `easy` bei `recoveryPending`, `needsReview` oder `confidence < 0.3`.
  - `hard` bei `confidence >= 0.8` und `stability >= 0.6`.
  - sonst `medium`.

## O. Weak-Facet Integration

- `getWeakFacets(...)` filtert Review-Kandidaten mit `priority > 30` oder aktiv pending.
- Bestehendes `facetMastery.js` wurde nicht ersetzt; `learningMastery` ist die neue Semantik-Ebene.
- In C5/C6 kann eine Bridge entstehen, die `facetMastery.js` aus `learningMastery` speist, falls nötig.

## P. Evidence Integration C3

- `recordLearningResult` ruft `applyEvidenceToData` auf und aktualisiert danach `mastery` in einem einzigen Write.
- `recordEvidence` bleibt unverändert für `viewed` / `self-reported`.
- `academyEngine.recordQuestionAnswer` und `recordExerciseCompletion` nutzen jetzt `recordLearningResult` (statt nur `recordEvidence`).
- `LessonRunner.completeExercise` übergibt jetzt das Exercise-Objekt, damit `difficulty` und `id` fließen.

## Q. Themencheck Integration

- `academyThemencheck.js` importiert `recordLearningResult` und `evidenceFromThemencheckCompetency`.
- `saveThemencheckResult` iteriert nach dem Speichern über `answers` und ruft `recordLearningResult` pro Frage auf (nur für echte Kategorien, nicht `global`).
- `AcademyThemencheck.jsx` übergibt `competency`, `facet`, `difficulty`, `semanticKey` in `handleFinish`, damit die Mapping-Daten sauber verfügbar sind.

## R. Conversation zukünftige Integration

- `conversationMastery.js` bleibt unverändert.
- Zukünftig: bei signifikantem Recall/Transfer im Gespräch `recordLearningResult(categoryId, topicId, [facet], 'recognized' | 'understood', ...)` aufrufen.
- Nicht in C4 implementiert, da Conversation-Events informell sind.

## S. Mission zukünftige Integration

- `applyMainMission` / `applySideMission` im Academy-Engine bleiben Score-Quelle.
- Zukünftig: `recordLearningResult(... evidenceType: 'applied' | 'diagnosed' | 'transferred' ...)` mit passenden `facetIds` aus Missions-Validierung.
- Echte Simulatoren `ciscoCliEngine.js`, `MissionV2`, `ProceduralMission` unverändert.

## T. Topic Status Kompatibilität

- `academyStatus.js` unverändert.
- `academyEngine.js` aktualisiert weiterhin `theoryScore`, `practiceScore`, `retentionScore`, `appliedCount`, `repetitionCount`.
- Facet-Mastery ist feinere Ebene; beide Systeme konkurrieren nicht.
- `computeNextStatus` wurde nicht angefasst.

## U. Save Architektur

- Kein neuer LocalStorage-Key.
- `academyProgress` enthält jetzt pro Topic `mastery`.
- Keine Event-Log-Inflation; State ist kompakt (counters, flags, timestamps).

## V. STATE_VERSION / Migration

- `academyProgress.js`: `STATE_VERSION` 12 → 13.
- `mastery: {}` als neues Topic-Default.
- Legacy-Saves ohne `mastery` erhalten `mastery: {}` durch Spread-Defaults.
- C3-Evidence bleibt erhalten.
- Test `academy-progress-mastery-migration-test.mjs` grün.

## W. DHCP Pilot Simulation

Das Modell ist prinzipiell für den C5-DHCP-Relay-Piloten bereit:

- `viewed` (Explain) → kein Mastery.
- `recognized` (Erkennen Relay-Bedarf) → Mastery `new -> learning`.
- `understood` (DORA-Ordnung) → `learning`.
- `recalled` (`ip helper-address`) → `learning`, evtl. `easy` empfohlen.
- `applied` (geführte Interface-Konfig) → `learning/uncertain`.
- `diagnosed` (APIPA-Szenario) → höhere `confidence`/`stability`.
- `transferred` (neues Szenario) → `stable` Richtung.
- Fehler in Step 4 → `recoveryPending` mit `easy` Empfehlung bis Recovery-Evidence.

Bewertung: **READY / PARTIAL** – technische Basis vorhanden, C5 muss Content-Metadaten nutzen.

## X. Micro-Learning Readiness

| Bereich            | Status   |
|--------------------|----------|
| Interaction Layer  | READY    |
| Evidence Layer     | READY    |
| Mastery Layer      | READY    |
| Recovery           | READY    |
| Review Priority    | READY    |
| DHCP Pilot         | PARTIAL  |

C5 erhält eigenen Prompt; keine Pilot-Implementierung in C4.

## Y. Tests

Hinzugefügt:

- `learning-mastery-contract-test.mjs`
- `learning-recovery-evidence-test.mjs`
- `learning-partial-answer-mastery-test.mjs`
- `learning-review-priority-test.mjs`
- `learning-temporal-mastery-test.mjs`
- `themencheck-mastery-evidence-integration-test.mjs`
- `academy-progress-mastery-migration-test.mjs`

Alle grün. C3-Regressionstests ebenfalls grün.

## Z. Lint

- `npm run lint`: 0 Fehler, 19 Warnungen (bekannte + neue `learning-mastery-contract-test.mjs`-Warnung beseitigt).
- Keine neuen produktiven Lint-Warnungen.

## AA. Build

- `npm run build`: erfolgreich.
- `[build-stamp] sw.js cache bucket = cyberlearn-v1.98.0`
- `[build-stamp] version.json buildHash = faa110b55c27`

## AB. Capacitor

- `npx cap sync`: erfolgreich.
- Plugins: `@capacitor-community/text-to-speech@8.0.2`, `@capacitor/app@8.1.1`.

## AC. APK

- `scripts/build-apk.ps1`: `BUILD SUCCESSFUL`.
- APK: `frontend/android/app/build/outputs/apk/debug/IT-Admin-Simulator.apk`
- Archiv: `frontend/apk-archive/IT-Admin-Simulator_2026-09-07_18-42.apk`

## AD. Version / versionCode / Cache

- `package.json`: `1.98.0`
- `src/lib/version.js`: `1.98.0`
- `public/version.json`: `1.98.0`
- `android/app/build.gradle`: `versionCode 19800`, `versionName "1.98.0"`
- Service-Worker-Cache: `cyberlearn-v1.98.0`
- `AGENTS.md`: 1.98.0

## AE. Commit

Lokaler Commit folgt im Anschluss an diesen Report.

## AF. LOCAL ONLY

Kein Push, kein GitHub Actions, kein GitHub Pages, kein Remote Release.

## AG. Empfehlung für C5

1. DHCP-Relay-Lesson mit `evidenceType`-Defaults und `facet`-Zuordnungen ausstatten.
2. `getReviewPriority`/`getRecommendedDifficulty` in Micro-Learning-Selektor einbinden.
3. Bridge von `learningMastery` zu `facetMastery.js` prüfen, falls Balancer facet-scores braucht.
4. Conversation- und Mission-Hooks für `recordLearningResult` erweitern.
5. Keine starren 4-Level-Global-Mastery-Levels einführen; Granularität beibehalten.
