# C3-Abschlussbericht: Learning Evidence Layer

**Version:** 1.97.0 (versionCode 19700, SW-Cache `cyberlearn-v1.97.0`)  
**Scope:** Semantische Evidence-Ebene für Academy-Lektionen (kein Mikro-Learning-Flow, kein neuer Mastery-Ladder, kein DHCP-Feature).  
**Ziel:** `viewed`, `completed` und `understood` sauber trennen; pro Facet/Section das höchste nachgewiesene Können speichern, ohne neuen parallelen Store, ohne XP/Gamification, ohne bestehende IDs/Scores zu verändern.

---

## A. Ausgangslage & Ziel

Bisher hat `academyProgress.js` pro Topic:
- `completedSectionIds`, `completedQuestionIds`, `completedExerciseIds`
- `theoryCompletion`, `theoryScore`, `practiceScore`, `retentionScore`
- Status-Maschine `locked → available → started → learned → applied → consolidated`

Was fehlte: eine semantische Schicht, die sagt *welche* Kompetenz einzelne Interaktionen tatsächlich belegen – unabhängig vom Score und unabhängig vom Topic-Status. C3 fügt eine kompakte `evidence`-Map pro Topic hinzu.

---

## B. Gültige Evidence-Typen

| Typ | Bedeutung |
|---|---|
| `viewed` | Inhalt wurde geöffnet / gesehen |
| `self-reported` | Lerner sagt „ich habe es verstanden“ |
| `recognized` | Aus vorgegebenen Optionen korrekt erkannt |
| `understood` | Struktur/Beziehungen korrekt abgebildet (Multi, Ordering, Matching, Kategorisierung) |
| `recalled` | Aktive Abruf ohne vorgegebene Optionen (Input, CLI-Input) |
| `applied` | Geführt angewendet (Guided-UI, Subnetting-Übung) |
| `diagnosed` | Fehlersituation richtig eingeordnet |
| `transferred` | Transfer in neuer Situation |

---

## C. Semantik der Evidence-Typen

- **VIEWED** ist legitim, aber kein UNDERSTOOD.
- **SELF_REPORTED** ist schwächer als RECOGNIZED; es darf nie als UNDERSTOOD zählen.
- Höhere Typen überschreiben niedrigere, niemals umgekehrt.
- Falsche oder partielle Antworten erzeugen kein positives Evidence.
- Evidence beschreibt Kompetenz, keinen Belohnungs-Score.

---

## D. Default Mapping Interaction → Evidence

| Interaction | Default Evidence |
|---|---|
| `select-best` / `single` | `recognized` |
| `multi` (exact-set) | `understood` |
| `ordering` | `understood` |
| `matching` | `understood` |
| `categorization` | `understood` |
| `input` (Freitext/Zahl) | `recalled` |
| `cli-input` | `recalled` |
| `guided-ui` / `guided-subnetting` | `applied` |
| `adaptive-subnetting` / `adaptive-number-systems` / `adaptive-subnet-requirements` / `adaptive-supernetting` | `applied` |
| `diagnostic` / `scenario` | `diagnosed` |
| `mission` | `applied` |
| `section` (reiner Text) | `viewed` |

---

## E. Mapping-Override pro Inhalt

Jede Frage/Übung kann optional `evidenceType` setzen, um das Default zu überschreiben. Bisher nutzt kein Content dieses Feld – die Defaults greifen. Für zukünftige Diagnose-/Transfer-Fragen ist der Hook bereits vorhanden.

---

## F. Architektur: `learningEvidence.js`

- Konstanten + Ranking: `EVIDENCE_TYPES`, `rankOfEvidence`.
- `inferEvidenceType(interactionType, override?)`.
- `resolveFacetIds({ facet, knowledgeFacet, relatedKnowledgeIds, sourceTopicId, sourceSection, id, sectionId, topicId })`.
- `recordEvidence({ categoryId, topicId, facetIds, evidenceType, source, quality, correct, partial })`.
- `getEvidenceForFacet`, `getTopicEvidenceSummary`.
- Speicherort: `academyProgress.topics[key].evidence`.

---

## G. Architektur: `academyEngine.js`

Neue / erweiterte Funktionen:
- `recordSectionView(categoryId, topicId, sectionId, facetIds)` – setzt `viewed`.
- `recordSectionCompletion(...)` – weiterhin Score/Completion; zusätzlich `viewed` als Fallback.
- `recordQuestionAnswer(..., evidenceType, facetIds)` – bei korrekter Antwort Evidence.
- `recordExerciseCompletion(..., evidenceType, facetIds)` – bei korrekter Übung Evidence.
- `recordSelfAssessment(categoryId, topicId, facetIds)` – setzt `self-reported`.

Alle Engine-Funktionen bleiben idempotent; Locked-Topics blockieren weiterhin alles.

---

## H. Architektur: `academyProgress.js`

- `STATE_VERSION` 11 → 12.
- `defaultProgressForTopic` enthält jetzt `evidence: {}`.
- Legacy-Saves ohne `evidence` bekommen beim Laden/Wegschreiben ein leeres Objekt.
- Kein Datenverlust; bestehende `completed*`-Arrays und Scores bleiben unverändert.

---

## I. `LessonRunner.jsx` Integration

- `useEffect` auf `currentSectionId` ruft `recordSectionView` – VIEWED idempotent.
- `completeExercise(exercise)` übergibt Objekt; `inferEvidenceType` + `resolveFacetIds` pro Übung.
- `answerQuiz` erfasst Evidence für `quiz-${index}`.
- `SectionCheckQuestion` erfasst Evidence für inline-Fragen.
- `handleHelpResponse(true)` erfasst `self-reported`, danach `completeLesson`.
- `PracticeQuiz` + `FachgespraechRunner` erfassen Evidence für Praxis-/Mündliche-Fragen.

---

## J. Practice / Fachgespräch Integration

- Multiple-Choice-Fragen aus `collectQuestionsFromLesson` → `recognized`.
- CLI-Tasks aus `collectCliTasksFromLesson` → `recalled`.
- Facet-Auflösung berücksichtigt `sourceTopicId` aus den normalisierten CLI-Tasks.

---

## K. Themencheck / Abschlusscheck

Themencheck wurde **nicht** direkt an die Evidence-Ebene angebunden, weil der Themencheck eine globale Kategorie-Abschlussprüfung ist und keine einzelnen Facet-IDs pro Frage mitführt. Eine spätere Anbindung ist über `evidenceFromThemencheckCompetency` vorbereitet, wenn `competency` (`recall`, `interpretation`, `diagnosis`, `transfer`) pro Frage bekannt wird.

---

## L. Missions / Cisco Simulator

- `MissionV2`, `ProceduralMission`, `ciscoCliEngine.js`, `Terminal.jsx` wurden **nicht** angetastet.
- `LearningCommandInput` bleibt Lern-Eingabe-Primitive; echte IOS-Simulation, Interface-State und Missionsvalidierung bleiben in den spezialisierten Engines.
- Für zukünftige Missions-Integration: `mission` → `applied`, `diagnostic` Szenario → `diagnosed`, erfolgreiche Transfer-Mission → `transferred`.

---

## M. Self-Assessment Regel

Die Frage „Hat dir die Erklärung geholfen?“ → `Ja` erzeugt `self-reported`, niemals `understood`. Ein späteres korrektes Quiz/Übung zu derselben Facet kann `understood` überschreiben.

---

## N. Viewed ≠ Completed ≠ Understood

- **VIEWED**: Section wurde geöffnet.
- **COMPLETED**: `completedSectionIds` / `completedQuestionIds` / `completedExerciseIds` enthalten die ID.
- **UNDERSTOOD**: Evidence-Typ mindestens `understood` für eine Facet.

Ein abgeschlossener Abschnitt ist somit nicht automatisch verstanden; das verhindert falsche Mastery-Claims.

---

## O. Migration & Kompatibilität

- Keine neue parallele Persistenz.
- Keine ID-Änderungen.
- Kein Schema-Bruch.
- Bestehende Save-States werden automatisch auf `STATE_VERSION 12` migriert; `evidence` startet leer.
- Alle bisherigen Tests (C1, C2) bleiben gültig.

---

## P. Tests

Neue Testskripte:

1. `frontend/scripts/learning-evidence-contract-test.mjs`
   - Evidence-Typ-Validierung, Ranking, Default-Mapping, `recordEvidence`, Überschreiben, partielle/falsche Antworten, Summary.
2. `frontend/scripts/lesson-section-completion-semantics-test.mjs`
   - `viewed` vs `understood`, `completed` vs Mastery, falsche Fragen erzeugen kein Evidence, Self-Assessment, Locked-Topic Blockade.
3. `frontend/scripts/lesson-self-assessment-evidence-test.mjs`
   - Self-Assessment ist `self-reported`, nicht `understood`.
4. `frontend/scripts/academy-progress-evidence-migration-test.mjs`
   - v11-Save wird auf v12 migriert, alte Felder erhalten, `evidence` leer geseeded.
5. `frontend/scripts/topic-status-evidence-test.mjs`
   - Theory-Completion, Scores und Status bleiben stabil nach Evidence-Calls.

Alle 5 Tests erfolgreich.

---

## Q. Manuelle Lesson-Prüfung pro Kategorie

| Kategorie | Beispiel-Lektion | VIEWED | COMPLETED | UNDERSTOOD/APPLIED | Bemerkung |
|---|---|---|---|---|---|
| Grundlagen | `osi-model` | Section öffnen → `viewed` | Übung/Quiz abschließen → `completed*` | Ordering/Matching → `understood`, Select-Best → `recognized` | Facets wie `switch-learning`, `arp` werden getroffen |
| Grundlagen | `binary-system` | Section öffnen → `viewed` | Input-Übungen → `completed*` | `input` → `recalled` | Default-Mapping greift |
| Cisco | `ciscoVlan` | Section öffnen → `viewed` | CLI-Input → `completed*` | `cli-input` → `recalled` | Kein Simulator-State berührt |
| Cisco | `ciscoMultilayerSwitching` | Section öffnen → `viewed` | Matching/Ordering/Select-Best → `completed*` | Matching/Ordering → `understood`, Select-Best → `recognized` | `cli-input` → `recalled` |
| Subnetting | `subnetting` | Section öffnen → `viewed` | `guided-subnetting` / `adaptive-subnetting` → `completed*` | `guided-subnetting` / `adaptive-subnetting` → `applied` | Überschreibt `viewed` |
| Active Directory | `adUsers` | Section öffnen → `viewed` | `guided-ui` Aufgaben → `completed*` | `guided-ui` → `applied` | AD MMC-Abläufe |
| Information Security | `informationSecurity` | Section öffnen → `viewed` | Select-Best/Matching → `completed*` | Select-Best → `recognized`, Matching → `understood` | Keine Anpassungen nötig |

Keine falschen UNDERSTOOD-Claims gefunden; Defaults passen zum jeweiligen Interaktionstyp.

---

## R. DHCP Preview (konzeptuell)

Für eine zukünftige DHCP-Lektion (DORA, Relay, APIPA):
- Reiner Text/Diagramm → `viewed`
- DORA-Ordering → `understood`
- `ip helper-address` CLI-Input → `recalled`
- „Wo liegt der DHCP-Fehler?“ Diagnose-Szenario → `diagnosed`
- Konfiguration in einer echten Cisco Mission → `applied`

Diese Mapping-Logik ist bereits aktiv; es fehlt nur der DHCP-Lektionsinhalt.

---

## S. Versionierung

- `frontend/package.json`: `1.97.0`
- `frontend/src/lib/version.js`: `APP_VERSION = '1.97.0'`
- `frontend/public/version.json`: `1.97.0`
- `frontend/android/app/build.gradle`: `versionCode 19700`, `versionName "1.97.0"`
- `AGENTS.md`: aktuelle Version auf `1.97.0`
- Build-Stamp: `sw.js cache bucket = cyberlearn-v1.97.0`

---

## T. Lint / Build / Cap Sync / APK Ergebnisse

| Schritt | Ergebnis |
|---|---|
| `npm run lint` | ✅ 0 Fehler, 18 bekannte Warnungen |
| `npm run build` | ✅ Production-Build erfolgreich, Cache `cyberlearn-v1.97.0` |
| `npx cap sync` | ✅ Android/Web Sync erfolgreich |
| `gradlew assembleDebug` (via `build-apk.ps1`) | ✅ BUILD SUCCESSFUL |
| APK-Archiv | `frontend/android/app/build/outputs/apk/debug/IT-Admin-Simulator.apk` + `frontend/apk-archive/IT-Admin-Simulator_2026-09-07_17-35.apk` |

---

## U. Geänderte Dateien

- `frontend/src/lib/learningEvidence.js` (neu)
- `frontend/src/lib/academyProgress.js` (`STATE_VERSION` 12, `evidence` default)
- `frontend/src/lib/academyEngine.js` (`recordSectionView`, `recordSelfAssessment`, erweiterte `recordQuestionAnswer`/`recordExerciseCompletion`, Evidence-Import)
- `frontend/src/components/LessonRunner.jsx` (Evidence-Calls in allen Interaktionspfaden)
- `frontend/package.json`, `frontend/src/lib/version.js`, `frontend/public/version.json`, `frontend/android/app/build.gradle` (1.97.0)
- `AGENTS.md` (Versionshinweis)
- `frontend/docs/learning-architecture-c3-report.md` (dieser Bericht)
- 5 neue Test-Skripte unter `frontend/scripts/`

---

## V. Open Points / Bekannte Einschränkungen

- `Themencheck` liefert noch kein Evidence; Mapping-Hilfsfunktion `evidenceFromThemencheckCompetency` ist aber bereit.
- `ciscoCliEngine` / Missions geben noch kein Evidence an die Academy zurück; Schnittstelle wäre zukünftig `recordEvidence` pro Mission-Ziel.
- Evidence wird pro Topic gespeichert, nicht global; das ist bewusst, da die Academy der primäre Kontext ist.
- `competency.js` und `facetMastery.js` bleiben unberührt; eine spätere Bridge kann Evidence als zusätzliche Signalquelle nutzen.

---

## W. Lokaler Commit

Commit mit aussagekräftiger Message:
- Add learning evidence layer (`viewed`/`self-reported`/`recognized`/`understood`/`recalled`/`applied`/`diagnosed`/`transferred`).
- Separate viewed/completed/understood semantics.
- Integrate Evidence recording into LessonRunner, PracticeQuiz, FachgespraechRunner.
- State version 12 with backward-compatible migration.
- Bump version to 1.97.0 and build APK.

Kein Push; lokal committet.

---

## X. Regeln für zukünftige Erweiterungen

1. Neue Frage-/Übungstypen müssen einen Default-Evidence-Typ in `learningEvidence.js` erhalten.
2. Wenn ein Typ diagnostisch ist, muss er `diagnosed` erzeugen; wenn er Transfer verlangt, `transferred`.
3. Self-Assessment darf nie höher als `self-reported` sein.
4. `evidenceType`-Override darf nur in Inhaltsdateien verwendet werden, nicht in der Engine.
5. Kein neuer paralleler Store; Evidence gehört weiterhin `academyProgress.topics[topicKey].evidence`.
6. Missions/Simulationen bleiben außerhalb; sie können `recordEvidence` aufrufen, wenn sie Academy-Facets treffen.

---

## Y. Zusammenfassung

C3 fügt eine schlanke, semantische Evidence-Ebene hinzu, die bestehende Progress/Score/Status-Systeme nicht ersetzt, sondern ergänzt. Sie verhindert, dass „angeschaut“ oder „abgeschlossen“ als „verstanden“ zählt, und gibt jedem Interaktionstyp einen sinnvollen default Evidence-Typ. Alle C1/C2-Primitiven und Save-Kontrakte bleiben gültig.

---

## Z. Verweise

- `frontend/src/lib/learningEvidence.js`
- `frontend/src/lib/academyEngine.js` (Zeilen mit `EVIDENCE_TYPES`, `recordEvidence`)
- `frontend/src/lib/academyProgress.js` (Default `evidence`, `STATE_VERSION 12`)
- `frontend/src/components/LessonRunner.jsx` (`recordSectionView`, `completeExercise`, `answerQuiz`, `handleHelpResponse`)
- `frontend/scripts/*-evidence*-test.mjs`
- `AGENTS.md` (Versionshinweis)

---

## AA. Nächste Schritte (nicht Teil C3)

1. `Themencheck` optional an Evidence anbinden, wenn `competency` pro Frage verfügbar ist.
2. Missions-/Simulator-Erfolge als `applied`/`diagnosed`/`transferred` in Academy-Evidence schreiben.
3. Adaptive Auswahl kann Evidence-Summary als Signalquelle nutzen.
4. UI: Lerner-Fortschritt pro Facet anzeigen („Wie oft/Schwachstellen“), ohne XP zu erfinden.
5. DHCP-Lektion inhaltlich umsetzen und dabei Evidence-Mapping validieren.
