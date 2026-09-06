# CyberLearn — Architektur- & Didaktik-Audit Lernsysteme

**Status:** Read-only. Keine Produktivcode-Änderungen.  
**Repository:** `C:\Users\vitog\CyberLearn`  
**Frontend:** `frontend/`, React + Vite + TailwindCSS, Capacitor-Android-Build  
**Version:** `1.94.0` (lokaler Commit `c52c863`)  
**Erstellt:** automatisierte Zählungen + manuelle Quelltext-Lektüre + Subagenten-Audits

---

## 1. Executive Summary

CyberLearn hat **mehrere gute, aber voneinander getrennte Lernmaschinen**. Das Erklärmodell, die Fragepools, die Auswahl, die Bewertung und die Speicherung sind funktionsfähig, aber zu oft finden sich für dieselbe Aufgabe zwei oder drei Implementierungen. Der Themencheck ist der am weitesten konsolidierte Auswahlmechanismus; der `LessonRunner` ist die größte Konzentrationsstelle für didaktische und technische Komplexität.

**Wichtigste Befunde:**

- **57 Lektionen** sind in `LESSONS` registriert, auf 5 Kategorien verteilt; die Kategorie **Linux – VirtualBox** hat **16 Katalogthemen, aber 0 Lektionen**.
- **≥14 parallele Fortschrittsspeicher** (Academy, Themencheck, Knowledge, Gespräche, Skill-Tree, Competency, adaptive Quiz-Skills, Mission-Log, Game-State …).
- **91 `Math.random`-Call-Sites** plus eigene LCGs, hash-seedete und nicht-seedete Shuffles — Reproduzierbarkeit und Tests sind unmöglich.
- **4 Ordering-, 3 Matching- und mindestens 6 Option-Button-Implementierungen** im Frontend.
- **Gute didaktische Ansätze** existieren: DHCP-Lektion deckt Mentalmodell → Befehl → Troubleshooting ab; `EmployeeConversation` liefert beispielhaft „Beobachtung → Warum → Regel → Transfer“.
- **Schwachstelle Passivität:** Einige Lektionen haben lange passive Sequenzen ohne Interaktion; Fortschritt wird teilweise vor der Beantwortung der Verständnisfrage registriert.

**Empfohlener Pilot für Micro-Learning:** `cisco-packet-tracer/dhcp` (DHCP Relay), weil es alle geforderten Stufen — Erklären, Erkennen, Bauen, Anwenden, Diagnostizieren, Transfer — bereits abdeckt und ein abgeschlossener, stabiler Lektionsbaum ist.

---

## 2. Methodik

- **Read-only:** keine Dateien geändert, keine Builds, keine APKs.
- **Statische Analyse:** `grep`, `find_file_by_name`, gezielte `read`-Durchsicht der in der Aufgabenstellung genannten Dateien.
- **Automatisierte Zählungen:** Node-Skripte im `frontend/scripts/.tmp-*` Bereich (werden nach Fertigstellung des Audits gelöscht), die `academyLessonData.js`, `academyTopics.js` importieren.
- **Manuelle Reviews:** jeweils eine Lektion pro Kategorie, ein Themencheck-Durchlauf, ein Employee-Conversation-Flow, eine Cisco-Mission.
- **Subagenten-Audits** zu Interactions/Feedback/Randomisierung, Fragetypen-Ökosystem und Wissensquellen wurden einbezogen.

---

## 3. Katalog-Abdeckung

| Kategorie | Themen im Katalog | Lektionen in `LESSONS` | Abdeckungslücken |
|---|---|---|---|
| `fundamentals` | 17 | 16 | `fundamentals/grundbegriffe` hat Katalog-Eintrag, aber keinen `LESSONS`-Eintrag; stattdessen `BASICS_BEATS` in `AcademyTopic.jsx`. |
| `cisco-packet-tracer` | 18 | 18 | Vollständig. |
| `information-security` | 5 | 5 | Vollständig. |
| `linux-virtualbox` | 16 | **0** | Vollständiger Lückenbereich. |
| `active-directory-virtualbox` | 18 | 18 | Vollständig. |
| **Gesamt** | **74** | **57** | Linux-Kategorie existiert nur als Katalog. |

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyTopics.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyLessonData.js" />

---

## 4. Die fünf Architektur-Fragen — aktuelle Antworten

Die zentrale Anforderung war: für jede Lerninteraktion müssen fünf Fragen eindeutig beantwortbar sein; wenn es widersprüchliche Antworten gibt, ist die Architektur noch zu komplex.

| Frage | Kurz-Antwort (Ist) | Problem |
|---|---|---|
| Wo lebt der Inhalt? | `academyLessons/*.js` (Lektions-Registry), `knowledge/items/*.js` (generierbare Fakten), `diagnosticScenarios.js`, `multiSelectQuestions.js`, `dragDropQuestions.js`, `localData.js` / `backend/data/seed.js` (legacy Module). | Derselbe Sachverhalt steht an mehreren Stellen (z. B. OSI-Reihenfolge in `academyLessons/osi.js`, `dragDropQuestions.js`, `employeeConversations.js`, `OsiOrderExercise.jsx`). |
| Wer entscheidet, wann was gezeigt wird? | `LessonRunner` (Lektion), `academyThemencheck.js` (Themencheck-Planer), `employeeConversations.js` (Konversations-Auswahl), `missionV2.js` / `missionGenerator.js` (Missionen), einzelne Seiten (`FinalExam`, `SubnetTrainer`, …). | Kein gemeinsamer `SessionPlanner`; jeder Modus rollt eigene RNG, eigene History, eigene Schwäche-Logik. |
| Wer rendert die Interaktion? | `LessonRunner.jsx` enthält ~11 Übungstyp-Renderer; `ThemencheckDragDrop.jsx`, `ConversationMatching.jsx`, `ConversationOrdering.jsx`, `MissionV2.jsx`, `ProceduralMission.jsx`, `Module.jsx`, Standalone-Seiten. | Vier Ordering-, drei Matching- und viele Option-Button-Implementierungen. |
| Wer bewertet die Antwort? | Inline in den Renderern (`checkCiscoInput`, `evaluateAnswer`, einfache Index-Vergleiche). | Kein getrenntes `Evaluator`-Layer; Bewertung und UI hängen zusammen. |
| Wer speichert Mastery? | `academyProgress` (Themenstatus), `competency.js` (0–1 Topic-Mastery), `knowledge/facetMastery.js` (Facets), `conversationMastery.js` (Gespräche), `skillTree.js` (Hierarchische Skills), `gameState.js` (XP/Missionen), `adaptiveQuiz.js` (pro Modul). | Mehrere sich überschneidende Mastery-Definitionen. |
| Wer entscheidet über Wiederholung? | `academyThresholds` + `academyEngine`, `knowledge/semanticHistory` + `semanticBalancer`, `employeeConversations` eigene Cooldowns, `competency.js` `nextReview`, `skillTree.js` `REVIEW_DUE`. | Keine gemeinsame Wiederholungs-Engine. |

**Fazit:** Die fünf Fragen haben derzeit mehrere widersprüchliche Antworten. Das ist der Kern des Konsolidierungsbedarfs.

---

## 5. Zielarchitektur (Vorschlag)

| Frage | Ziel-Antwort |
|---|---|
| **Inhalt** | `academyLessons/*.js` bleibt kanonische Autorenquelle. `knowledge/items/*.js` bleibt maschinenlesbare, abgeleitete Ebene. Spezialpools (`diagnosticScenarios`, `multiSelect`, `dragDrop`) werden in den `knowledge`- oder Lektions-Registry-Fluss integriert, nicht parallel gepflegt. |
| **Auswahl** | Ein `SessionPlanner`-Interface pro Modus (Lektion, Themencheck, Gespräch, Mission, Drill). Gemeinsame Services: `RngService`, `HistoryService`, `FacetMasteryService`, `CooldownService`. |
| **Rendering** | Wiederverwendbare `InteractionPrimitive`s: `OptionList`, `MatchingBoard`, `OrderingList`, `CommandConsole`, `FeedbackPanel`. `LessonRunner`, `Themencheck`, `Conversation`, `Mission` nutzen dieselben Primitives, nur mit unterschiedlichem Theming. |
| **Bewertung** | `EvaluationEngine` mit typ-spezifischen Checkern (`checkMultipleChoice`, `checkCiscoInput`, `evaluateDragDrop`), unabhängig vom Renderer. |
| **Mastery** | `academyProgress` für Themen-Status und grobe Score-Dimensionen; `skillTree` für granularere Kompetenzen; `conversationMastery` als spezialisierte Eingangsmastery, die `academyEngine` abfragen kann. `competency.js` und `adaptiveQuiz.js` zugunsten `skillTree` abbauen. |
| **Wiederholung** | Ein `SpacedRepetition`-Service auf Basis `semanticHistory` + `facetMastery` + `academyThresholds`, der von allen Modi konsultiert wird. |

---

## 6. LessonRunner — Detaillierter Befund

`LessonRunner.jsx` ist die zentrale Lern-Engine und gleichzeitig die größte technische Konzentrationsstelle.

### 6.1 Unterstützte Modi

- `theory` (Standard): Erklärungen → Verständnisfrage → Übungen → Abschlussquiz.
- `practice` (`<PracticeQuiz>`): zufällige Auswahl aus Lektions-Fragenpool + CLI-Tasks.
- `interview` (`<FachgespraechRunner>`): Gesprächs-Modus mit Sam-Porträt, zufälligen Reaktionen.

<ref_snippet file="C:\Users\vitog\CyberLearn\frontend\src\components\LessonRunner.jsx" lines="95" />

### 6.2 Theorie-Fluss

- Jede Sektion kann mehrere Erklärungsstile (`classic`, `intuitive`, `example`, `visual`, `mnemonic`) haben.
- Inline-`question`-Blöcke werden in der Theorie-Ansicht nicht angezeigt, sondern als Sektions-Check wiederverwendet (keine doppelte Präsentation).
- `advanceSection` speichert `recordSectionCompletion` **vor** der Verständnisfrage. Das bedeutet: `theoryCompletion` wächst bereits beim Lesen, nicht beim korrekten Beantworten.
- Verständnisfrage `SectionCheckQuestion` zeigt den `Weiter`-Button erst nach einer Antwort an, erlaubt aber falsche Antworten.

<ref_snippet file="C:\Users\vitog\CyberLearn\frontend\src\components\LessonRunner.jsx" lines="226" />
<ref_snippet file="C:\Users\vitog\CyberLearn\frontend\src\components\LessonRunner.jsx" lines="647" />

### 6.3 Übungstypen

| Übungstyp | Datei / Funktion | Bewertung / Anmerkung |
|---|---|---|
| `ordering` | `LessonRunner.jsx:686` | Pfeil-Buttons, kein Pointer-Drag. |
| `matching` | `LessonRunner.jsx:740` | Tap-to-pair. |
| `input` | `LessonRunner.jsx:845` | Freitext, exakte oder normalisierte Vergleiche. |
| `cli-input` | `LessonRunner.jsx:897` | Multi-line, nutzt `checkCiscoInput`. |
| `select-best` | `LessonRunner.jsx:967` | Single-Choice. |
| `guided-ui` | `LessonRunner.jsx:251` (delegiert an `GuidedUiExercise`) | Schritt-für-Schritt-UI. |
| `guided-subnetting` | `LessonRunner.jsx:1012` | Formular-basierte Subnetting-Schritte. |
| `adaptive-subnetting` / `adaptive-supernetting` / `adaptive-subnet-requirements` | `LessonRunner.jsx:1088`, `1602`, `1676` | Schwierigkeitsstufen, generierte Werte. |
| `adaptive-number-systems` | `LessonRunner.jsx:1799` | Binär/Dez/Hex-Drill. |
| `difficulty-drill` | `LessonRunner.jsx:1187` | IPv4/Subnetting-Generator-Auswahl. |

### 6.4 Übungsauswahl

- `selectDirectTheoryExercises` wählt deterministisch eine kleine, typ-diverse Teilmenge aus dem vollen Pool.
- `selectFinalQuiz` wählt maximal 8 quiz-Fragen facetten-divers.
- `PracticeQuiz` und `FachgespraechRunner` nutzen `pickRandomQuestions`, das `.sort(() => Math.random() - 0.5)` verwendet.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\lessonExerciseSelector.js" />
<ref_snippet file="C:\Users\vitog\CyberLearn\frontend\src\components\LessonRunner.jsx" lines="1849" />

---

## 7. Fragetypen- und Quellen-Inventar

| Quelle | Inhalt | Auswahl | Renderer | Bewertung | Mastery-Write | Historie | Doppelt? |
|---|---|---|---|---|---|---|---|
| `LESSONS.quiz` | Statische Lektions-Quizfragen | `selectFinalQuiz` | `LessonRunner` | Index-Vergleich | `recordQuizResult` → `academyProgress` | `completedQuestionIds` | Teils in Themencheck-Pool. |
| `LESSONS.explanations[].blocks[].type === 'question'` | Inline-Verständnisfragen | `findSectionCheckQuestion` | `SectionCheckQuestion` | Index-Vergleich | `recordQuestionAnswer` → `academyProgress` | `completedQuestionIds` | Wiederverwendet für Sektions-Check. |
| `LESSONS.cliTasks` | Cisco CLI-Aufgaben | `collectCliTasksFromLesson` | `CliInputExercise`, `CliTaskCard`, `MissionV2` | `checkCiscoInput` | `recordExerciseCompletion` / `recordQuizResult` | `completedExerciseIds` | Gut isoliert. |
| `diagnosticScenarios.js` | Troubleshooting-Szenarien | `academyThemencheck.js` | `AcademyThemencheck.jsx` (single-choice) | Index-Vergleich | `saveThemencheckResult` | `themencheck-history-v1` | Nur im Themencheck. |
| `multiSelectQuestions.js` | Mehrfachauswahl | `academyThemencheck.js` | `AcademyThemencheck.jsx` | Index-Vergleich | `saveThemencheckResult` | `themencheck-history-v1` | Nur im Themencheck. |
| `dragDropQuestions.js` | Matching/Ordering/Categorization | `academyThemencheck.js` | `ThemencheckDragDrop.jsx` | Mapping/Vergleich | `saveThemencheckResult` | `themencheck-history-v1` | Auch in Lektionen/Conversation. |
| `knowledge/items/*.js` + `questionGenerator.js` | Generierte MC/Ordering/Matching | `semanticBalancer`, `employeeConversations`, `academyThemencheck` (command-recall) | `EmployeeConversation.jsx`, `Themencheck` | `validateQuestionInstance` / `evaluateAnswer` | `conversationMastery`, `facetMastery` | `cyberlearn:semantic-history-v1` | Stärkste Quelle, aber nicht alle Modi nutzen sie. |
| `employeeConversations.js` Archetypes | Legacy statische Gesprächspools | `employeeConversations.js` | `EmployeeConversation.jsx` | `evaluateAnswer` | `conversationMastery` | `cyberlearn:employee-conversation-history-v1` | Überlappt mit Knowledge-Layer. |
| `RetrievalPractice.jsx` / `FinalExam.jsx` / `SpeedRun.jsx` | Backend-Module (`localData.js` / API) | Eigenes `.sort(() => Math.random() - 0.5)` | Je Seite | Index-Vergleich | `competency.js` / `adaptiveQuiz.js` | `cyberlearn:offline-state`, `exam-badges` | Vollständig separates Ökosystem. |
| `CommandFillBlanks.jsx` | Statische Befehls-Lückentexte | `Math.random` | `CommandFillBlanks.jsx` | String-Vergleich | — | — | Nicht in Academy integriert. |
| `SubnetTrainer.jsx` / `OsiOrderExercise.jsx` | Generierte Mini-Drills | `Math.random` | Standalone | Selbstvergleich | `adaptiveQuiz` skill key | — | Nicht in Academy integriert. |
| `TicketSimulator.jsx`, `DiagnosticQuest.jsx` | Szenario-basierte Interaktionen | Hardcoded / State-Machine | Je Komponente | Szenario-spezifisch | `skillTree` / `gameState` | `mission-events`, `rpg-state` | Gutes didaktisches Muster. |

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\knowledge\index.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyThemencheck.js" />

---

## 8. Fortschritt, Mastery und Historie

| System | Speicher-Key | Inhalt | Eigentümer | Überschneidung |
|---|---|---|---|---|
| Academy Progress | `cyberlearn:academy-progress-v1` | Themen-Status, `theoryScore`, `practiceScore`, `retentionScore`, `theoryCompletion`, Resume-IDs | `academyProgress.js` + `academyEngine.js` | Thematisch mit `competency.js` |
| Themencheck Results | `cyberlearn:themencheck-results-v1` | Pro-Kategorie Ergebnisse (richtig, falsch, Dauer, wrong-Questions) | `academyThemencheck.js` | Ergänzt Academy-Scores |
| Themencheck History | `cyberlearn:themencheck-history-v1` | `semanticKey`-basierte Cross-Run-Historie | `academyThemencheck.js` | Parallel zu `knowledge/semanticHistory` |
| Knowledge Semantic History | `cyberlearn:semantic-history-v1` | LongTerm (200) + Session (50) Records | `knowledge/semanticHistory.js` | Nicht mit Themencheck-History zusammengeführt |
| Facet Mastery | `cyberlearn:facet-mastery-v1` | Per-Facet Score [-5, +5] mit Cooldown-Infos | `knowledge/facetMastery.js` | Konzept verwandt mit `skillTree` |
| Conversation Mastery | `cyberlearn:conversation-mastery-v1` | Pro Topic: correct, independentCorrect, uniqueConcepts | `conversationMastery.js` | Wird in `academyEngine` für Voraussetzungen abgefragt |
| Employee Conversation Session | `cyberlearn:employee-conversations-v2` | Aktuelle Gesprächssession | `employeeConversations.js` | — |
| Employee Conversation History | `cyberlearn:employee-conversation-history-v1` | Vergangene Archetype-Abfragen | `employeeConversations.js` | — |
| Skill Tree | `cyberlearn:skill-tree-v2` + `cyberlearn:skill-events-v2` | Hierarchische Skills, Dimensionen, Mastery, Events | `skillTree.js` | Enthält eigene Mastery-Berechnung |
| Competency | `cyberlearn:competency-v1` | Topic-level `knowledge/application/speed/stability`, EMA | `competency.js` | Legacy-Parallel-System, gemäß `academyEngine.js`-Kommentar |
| Adaptive Quiz Skill | `cyberlearn:skill:<moduleId>` | Pro `localData`-Modul Elo-ähnlicher Skill | `adaptiveQuiz.js` | Überschneidet `competency` und `skillTree` |
| Mission Log | `cyberlearn:mission-log-v1` | Status jedes Mission-Instance | `missionLog.js` | — |
| Game State | `it-learn:rpg-state-v1` | XP, Inbox, Reputation, Incidents, Side-Missions | `gameState.js` | Sollte bewusst separat bleiben |
| Shuffle Option Order | `it-learn:shuffled-questions` | Persistierte Option-Reihenfolge pro Frage | `shuffleOptions.js` | Unklare Verwendung, da meist `Math.random` genutzt |

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyProgress.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyEngine.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\knowledge\semanticHistory.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\knowledge\facetMastery.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\conversationMastery.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\competency.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\skillTree.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\gameState.js" />

---

## 9. Randomisierungs-Audit

### 9.1 Zählung

- **`Math.random`** in `frontend/src`: **91 Vorkommen** (62 in `frontend/src/lib`).
- **`.sort(() => Math.random() - 0.5)`**: **18 Vorkommen**.
- **`shuffle` String-Matches**: **122** (63 in `lib`).
- **Eigene/seedete RNGs**: `knowledge/random.js` (`createRng`), `missionV2.js` (`seededRng`), `ciscoSideMissions.js` (`seededRng`), `missionTemplateEngine.js` (`seededRng`), `shuffleOptions.js` (`seededShuffle`).

### 9.2 Typische Problemstellen

| Datei | Zeilen / Muster | Problem |
|---|---|---|
| `frontend/src/lib/academyThemencheck.js` | 65, 556, 564 | Fisher-Yates in `shuffleNoStreaks`, `Math.random`-Rauschen im `scoreCandidate`, gewichteter `pickFrom` mit `Math.random`. |
| `frontend/src/components/LessonRunner.jsx` | 693, 774, 1119, 1594, 1657, 1764, 1850, 2080 | Ordering-Init, Matching-Rechte, adaptive Drill-Auswahl, Practice/Fachgespräch-Fragenauswahl, Reaktionen. |
| `frontend/src/lib/shuffleOptions.js` | 13–90 vs. 110–116 | Zwei APIs gleichen Namens: eine deterministisch/seedebar, eine `Math.random`-`.sort()`. |
| `frontend/src/lib/academyLessons/ipv4Generator.js` | 60–100 | Nahezu vollständig `Math.random`. |
| `frontend/src/pages/FinalExam.jsx` | 21 | `.sort(() => Math.random() - 0.5)`. |
| `frontend/src/pages/RetrievalPractice.jsx` | 22–23 | Doppelter `.sort(() => Math.random() - 0.5)`. |
| `frontend/src/pages/SpeedRun.jsx` | 21, 39, 41 | Dreifacher `.sort(() => Math.random() - 0.5)`. |
| `frontend/src/pages/CommandFillBlanks.jsx` | 15–16 | `.sort(() => Math.random() - 0.5)`. |
| `frontend/src/components/OsiOrderExercise.jsx` | 6–7 | `.sort(() => Math.random() - 0.5)`. |
| `frontend/src/lib/employeeConversations.js` | 15+ Stellen | Topic-, Archetype-, Fallback-, ID-Generierung. |

### 9.3 Empfehlung

- **Einen** seeded RNG-Service (`knowledge/random.js` als Basis) für alle lernrelevanten Auswahlen.
- `.sort(() => Math.random() - 0.5)` in Lernmodi ersetzen.
- Nicht-lernende Welt-Randomness (Smalltalk, Sound, Office) darf `Math.random` behalten, aber dokumentiert und getrennt werden.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\knowledge\random.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\shuffleOptions.js" />

---

## 10. Feedback- und UI-Primitiven-Duplikate

| Primitive | Implementierungen | Status |
|---|---|---|
| Option-Buttons (Single-Choice) | `LessonRunner`, `AcademyThemencheck`, `EmployeeConversation`, `GuidedUiExercise`, `TicketSimulator` | Nicht geteilt |
| Multi-Select | `AcademyThemencheck.jsx` | Nur hier |
| Matching | `ConversationMatching.jsx`, `ThemencheckDragDrop.jsx`, `LessonRunner.jsx` | 3 Varianten |
| Ordering | `ConversationOrdering.jsx` (Pointer-Drag, touch-ready), `ThemencheckDragDrop.jsx` (Tap-to-place), `LessonRunner.jsx` (Pfeile), `OsiOrderExercise.jsx` (HTML5 Drag, mobil problematisch) | 4 Varianten |
| Feedback-Panel | Jede Komponente hat eigene grüne/rote Karte mit generischen Phrasen | Kein shared `FeedbackPanel` |
| CLI-Eingabe | `CliInputExercise`, `MissionV2`, `ProceduralMission`, `CommandFillBlanks` | Mehrere Terminals |

**Gute Gegenbeispiele** (bereits nahe am angestrebten Modell „Beobachtung → Warum → Regel → Transfer“):

- `EmployeeConversation.jsx` + `employeeConversations.js` `buildAnswerAwareExplanation` zeigt konkret, welche Paare/Ordnung falsch waren.
- `TicketSimulator.jsx` erklärt pro Option, warum sie richtig/falsch ist.
- `DiagnosticQuest.jsx` reflektiert Hypothese, entscheidende Infos, unnötige Schritte, Takeaway.
- `GuidedUiExercise.jsx` hat pro Schritt `feedbackCorrect` / `feedbackWrong` / `explanation`.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\components\ConversationMatching.jsx" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\components\ConversationOrdering.jsx" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\components\ThemencheckDragDrop.jsx" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\components\GuidedUiExercise.jsx" />

---

## 11. Manuelle Reviews

### 11.1 Fundamentals — Beispiel: `ipv4.js`

- **Struktur:** 12+ Erklärungssektionen, inline SVG-Diagramme für IPv4/IPv6, Maske, Präfix, Netz-ID/Broadcast, private Bereiche, Classful-CIDR, Sprungweite.
- **Interaktionen:** 46 `input`-Übungen, 14 `ordering`, 32 `matching`, 43 `select-best`, adaptive Subnetting/Supernetting/Zahlensysteme.
- **Passive Sequenzen:** max. 12 Blöcke ohne Frage/Übung (höchster Wert im Katalog).
- **Didaktisches Urteil:** sehr visuell und gut strukturiert, aber IPv4-Lektion ist dicht; längere Textpassagen ohne Zwischenfrage. `adaptive-subnetting` und `guided-subnetting` sind starke „Bauen“-Elemente.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyLessons\ipv4.js" />

### 11.2 Cisco — Beispiel: `ciscoDhcp.js`

- **Mentalmodell:** DHCP-Client sendet Broadcast, Router leitet standardmäßig nicht weiter → `ip helper-address` auf dem Client-Gateway-Interface.
- **DORA/Broadcast:** als Grundlage erklärt.
- **Routing-Bezug:** Sektion „Relay ersetzt kein Routing“ mit `show ip route`.
- **Befehlswissen:** `ip helper-address`, `interface fa0/0`, `interface vlan 100`, Subinterfaces mit `encapsulation dot1Q`.
- **APIPA:** erwähnt in `private APIPA`-Eintrag der IPv4-Lektion; DHCP-Lektion nutzt den Troubleshooting-Winkel.
- **Troubleshooting:** Tabelle „Symptom → mögliche Ursache“ plus Verifizierungsbefehle.
- **Anwendung/Simulation:** drei CLI-Input-Aufgaben (physisches Interface, Subinterface, SVI).
- **Didaktisches Urteil:** deckt die vollständige Leiter `Erklären → Erkennen → Bauen → Anwenden → Diagnostizieren → Transfer` ab. Hervorragender Pilot-Kandidat.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyLessons\ciscoDhcp.js" />

### 11.3 Informationssicherheit — Beispiel: `informationSecurity.js` (Block 1)

- **Struktur:** 8 Sektionen, jede mit Inline-Frage, sehr kurze passive Phasen (max. 4).
- **Themen:** Vertraulichkeit, Integrität, Verfügbarkeit, Authentizität, PIMO/OPTI, PDCA, gefordertes Maß.
- **Interaktionen:** 15 Matching, 21 Select-Best, 5 Ordering, 1 Input.
- **Didaktisches Urteil:** stark didaktisch, gute Transferfragen („Klimatisierung versagt — ist das Informationssicherheit?“). Wenig echte IT-Admin-Handlung (keine CLI, keine Konfiguration). Ideal für Begriffsmuster, aber nicht für Micro-Learning mit Systemanwendung.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyLessons\informationSecurity.js" />

### 11.4 Linux — VirtualBox

- **Befund:** 16 Themen im Katalog, **keine Lektion in `LESSONS`**. Linux ist damit ein vollständig leerer Kategoriebereich.
- **Implikation:** Ein neues Micro-Learning-System kann nicht an Linux andocken, solange kein Inhalt vorhanden ist.

### 11.5 Active Directory — Beispiel: `adGroupPolicyBasics.js`

- **Struktur:** 6 Erklärungssektionen (GPO, User vs. Computer, lokal vs. zentral, Links, GPMC, Speicherung), 3 SVG-Diagramme.
- **Interaktionen:** 1 Matching, 223 Select-Best (viele Klassifikations- und Misskonzeptions-Fragen), 13 Ordering, **keine CLI/guided-ui** in dieser Lektion.
- **Quiz:** 5 Fragen.
- **Didaktisches Urteil:** gut für Begriffe, aber sehr MC-lastig. `guided-ui` fehlt; ein „GPO im AD anlegen/verknüpfen“-Workflow würde die Leiter `Erklären → Bauen → Anwenden` vervollständigen. Sauberer Katalog-Start, aber noch nicht ausgereift genug für Pilot.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyLessons\adGroupPolicyBasics.js" />

### 11.6 Themencheck

- `academyThemencheck.js` sammelt Lektions-Quiz, Inline-Fragen, Command-Recall (Knowledge), Diagnostik, Multi-Select und Drag-Drop in einen Pool.
- Der `planThemencheck` balanciert nach Kompetenz, Typ, Facette, Topic, weak-facet, Historie und verhindert Adjacency/Streaks.
- `generateAbschlusscheck()` dagegen nutzt nur `collectQuestionsFromLesson` + einfaches `Math.random`-Shuffle; inkonsistent mit `generateThemencheck`.
- `saveThemencheckResult` schreibt Ergebnisse und aktualisiert die Cross-Run-History.

<ref_snippet file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyThemencheck.js" lines="672" />
<ref_snippet file="C:\Users\vitog\CyberLearn\frontend\src\lib\academyThemencheck.js" lines="810" />

### 11.7 Employee Conversation

- `employeeConversations.js` kann zwischen Knowledge-Layer-Fragen und Legacy-Archetypen wechseln.
- Jede Antwort erzeugt eine `buildAnswerAwareExplanation`: konkrete Fehlerpaare, richtige Reihenfolge, erste Abweichung.
- Speichert in `conversationMastery` und `knowledge/facetMastery`.
- Schwäche: ID-Generierung und Topic-Auswahl nutzen noch `Math.random`.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\employeeConversations.js" />
<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\components\EmployeeConversation.jsx" />

### 11.8 Cisco-Mission (Side Mission)

- `ciscoSideMissions.js` definiert 4 Szenarien (z. B. „Die offene Konsole“).
- Jede Mission hat `requirements`, `HINT_LADDERS` (nudge → focus → directive → solution) und nutzt `ciscoCliEngine.js` plus `missionHintSystem`.
- Speichert Skill-Events in `skillTree.js` und Mission-Status in `missionLog.js`.
- Didaktisch stark: Terminal-Anwendung + Hinleitung + vollständige Lösungserklärung.

<ref_file file="C:\Users\vitog\CyberLearn\frontend\src\lib\ciscoSideMissions.js" />

---

## 12. Didaktisches Audit

### 12.1 Kriterien und Befund

| Kriterium | Befund | Beispiele / Hinweise |
|---|---|---|
| **Learn by doing** | Teilweise stark (CLI-Missionen, Cisco DHCP), teilweise schwach (AD GPO fast nur Select-Best). | DHCP-Lektion hat 3 CLI-Aufgaben; AD GPO 0. |
| **Bite-sized ohne Fragmentierung** | Lektionen sind lang (`Ø 14,7 Sektionen`, `Ø 12,4 Übungen`). | `ipv4.js` und AD-Replikation sehr dicht. |
| **Right challenge** | `adaptiveQuiz.js`, `semanticBalancer`, `facetMastery` existieren, aber nicht flächendeckend. | Viele Seiten nutzen noch reines Random. |
| **Spaced repetition** | Mehrere Historien, aber keine zentrale Wiederholungs-Engine. | `competency.js` `nextReview`, `skillTree` `REVIEW_DUE`, `semanticHistory` Cooldowns. |
| **Active recall** | Inline-Fragen und Quiz sind vorhanden. | Passive Textmenge 59 % der Blöcke (inkl. Übungen) → Raum für mehr Interaktion. |
| **Relevante Kompetenzen** | `academyThresholds` mit theory/practice/retention ist gedanklich sauber. | Trennung in `competency.js`, `skillTree` verwässert den Fokus. |
| **Motivation & Delight** | Sam-Dialog, Erklärungsstile, Feedback-Karten vorhanden. | Generische „Richtig!/Nicht ganz.“ dominieren. |
| **Troubleshooting & Transfer** | Am stärksten in Diagnostic Scenarios, TicketSimulator, Cisco DHCP, Missions. | GPO und InfoSec brauchen mehr Transfer/ Troubleshooting. |
| **Nexus/Game Flow** | Game-State (`it-learn:rpg-state-v1`) und Academy-Progress sind bewusst getrennt. | Verbindung zwischen Lernen und Karriere-Level ist schwer durchschaubar. |

### 12.2 Konkrete didaktische Risiken

1. **Fortschritt für Ansehen, nicht für Verstehen:** `recordSectionCompletion` wird in `advanceSection` aufgerufen, bevor die Verständnisfrage beantwortet wird. Das führt dazu, dass `theoryCompletion` durch reines Durchklicken steigen kann.
2. **Generisches Feedback:** `Richtig!` / `Nicht ganz.` in `LessonRunner`, `AcademyThemencheck`, `LearningInteraction` wiederholt sich. Das fördert nicht den Fehler-Transfer.
3. **Wortlaut- vs. Modellprüfung:** Viele Select-Best-Fragen in AD/GPO testen Klassifikation (User vs. Computer, Site/Domain/OU), nicht das Einrichten einer GPO.
4. **Wiederholung identischer Prompts:** `Math.random`-basierte Auswahl sorgt dafür, dass dieselbe Frage in verschiedenen Modi auftauchen kann; es fehlt die perspektivische Variation.
5. **Zu viel passive Theorie:** Im Schnitt 59 % der Erklärungsblöcke plus Übungen sind passiv; einige Sektionen haben 12 passive Blöcke ohne Zwischenfrage.

### 12.3 Positive Muster

- `ciscoDhcp.js`: Jede Sektion endet mit einer Frage; Troubleshooting-Tabelle; CLI-Bau-Aufgaben.
- `employeeConversations.js` `buildAnswerAwareExplanation`: konkrete Rückmeldung auf die Nutzerantwort.
- `DiagnosticQuest.jsx`: Reflexions-Struktur am Ende.
- `ciscoSideMissions.js`: Hinleitungs-Stufen, Terminal, vollständige Lösungserklärung.

---

## 13. Pilot-Bewertung: DHCP vs. GPO

### 13.1 DHCP (`cisco-packet-tracer/dhcp`)

| Stufe | Abgedeckt? | Belege |
|---|---|---|
| Erklären | Ja | Broadcast-Grenze, Relay-Agent, Helper-Placement SVGs. |
| Erkennen | Ja | Tabellen phys. Interface / Subinterface / SVI; „Wo vs. welche IP". |
| Bauen | Ja | Drei `cli-input` Übungen (fa0/0, fa0/0.100, vlan 100). |
| Anwenden | Ja | Multi-VLAN-Szenario, Default-Gateway im DHCP-Pool. |
| Diagnostizieren | Ja | Troubleshooting-Tabelle 6 Symptome/Ursachen. |
| Transfer | Ja | Routing-Abhängigkeit, `show ip route`, `show running-config \| include helper`. |

**Gesamturteil:** Bereit als Micro-Learning-Pilot. Inhalt ist vollständig, didaktisch durchdacht, technisch korrekt, deckt das vollständige Kompetenz-Spektrum ab.

### 13.2 GPO (`active-directory-virtualbox/ad-group-policy-basics`)

| Stufe | Abgedeckt? | Belege |
|---|---|---|
| Erklären | Ja | 6 Sektionen mit SVG-Diagrammen. |
| Erkennen | Ja | Viele Klassifikationsfragen. |
| Bauen | Nein | Keine `guided-ui` oder CLI-Äquivalent für „GPO erstellen und verknüpfen“. |
| Anwenden | Teilweise | Transfer-Fragen zu 200 Clients / isoliertem Test-PC. |
| Diagnostizieren | Teilweise | Troubleshoot-Fragen zur User/Computer-Konfiguration. |
| Transfer | Schwach | Keine echte System-Anwendung, nur MC. |

**Gesamturteil:** Sauberer, weil neu konzipierbar, aber **noch nicht ausgereift** genug. GPO als Pilot würde bedeuten, erst die Lektion selbst zu erweitern ( guided UI / Simulation ), bevor das Micro-Learning-System getestet werden kann.

### 13.3 Empfehlung

- **Primärer Pilot:** `cisco-packet-tracer/dhcp`.
- **GPO** erst nach Ergänzung von mindestens einer `guided-ui` oder simulierten AD-Policy-Übung in den Pilot-Scope nehmen.

---

## 14. Konsolidierungs-Roadmap

Reihenfolge orientiert am Prinzip: *gute existierende Lösung → kleiner didaktischer Fix → gezielte Konsolidierung → gezielte Ergänzung → neues Subsystem*.

### Phase A — Sofort, geringer Aufwand

1. **RNG vereinheitlichen:** `knowledge/random.js` `createRng` als einzigen geseelten Service für alle Lernfragen etablieren; `.sort(() => Math.random() - 0.5)` in Lernpfaden ersetzen.
2. **Shuffle-Konsolidierung:** `shuffleOptions.js` bereinigen; naive Variante entfernen oder umbenennen.
3. **Feedback-Strings zentralisieren:** Gemeinsame I18n-Keys für `Richtig!` / `Nicht ganz.` / Erklärungsslots.
4. **Kleiner didaktischer Fix:** `recordSectionCompletion` erst nach beantworteter Verständnisfrage (oder zumindest korrekter Beantwortung) auslösen, damit Fortschritt auf Verstehen basiert.

### Phase B — Gezielte Konsolidierung

5. **Interaktions-Primitives bauen:** `OptionList`, `MatchingBoard`, `OrderingList` (auf Basis `ConversationOrdering.jsx`), `CommandConsole`, `FeedbackPanel`.
6. **Render-Konsolidierung:** `LessonRunner` Übungstypen auf die neuen Primitives umstellen; `ThemencheckDragDrop` und `ConversationMatching` zusammenführen.
7. **Auswahl-Engine konsolidieren:** `SessionPlanner`-Interface für Lektion, Themencheck, Gespräch, Mission; gemeinsame `HistoryService`/`FacetMasteryService`.
8. **Bewertung auslagern:** `EvaluationEngine` mit `checkMultipleChoice`, `checkCiscoInput`, `evaluateDragDrop`.

### Phase C — Mastery-Harmonisierung

9. **Competency & adaptive Quiz Skills in Skill-Tree überführen** oder zumindest formal als Legacy markieren und neue Features nur noch auf `skillTree` bauen.
10. **Themencheck-History und Knowledge Semantic-History zusammenführen** oder eine gemeinsame Abfragschicht darüber legen.
11. **Academy-Progress als Source of Truth** für Themen-Status behalten, aber `skillTree` für granulare Kompetenzen und `conversationMastery` für Gesprächs-Voraussetzungen nutzen.

### Phase D — Micro-Learning-Pilot

12. **Pilot-Lektion wählen:** `cisco-packet-tracer/dhcp`.
13. **Micro-Learning-Modus entwerfen:** Kurze, aufeinanderfolgende Karten aus Erklärung → Erkennen → Bauen → Anwenden → Diagnose, gespeist aus `academyLessons/dhcp.js` und `knowledge/items/ciscoDhcp.js`.
14. **Keine neuen Subsysteme:** Kein neuer Question Type, kein Builder, keine Animationen, keine Streaks, keine neue Lesson Engine.

---

## 15. Nicht-Ziele & Safeguards

- **Keine neuen Subsysteme** in diesem Audit.
- **Keine Änderung des Produktivverhaltens** — keine Build-, Version-, UI- oder Inhaltsänderungen.
- **Kein Duplizieren** von Lernmechanismen; jede Konsolidierung muss begründet sein.
- **Linux-Lückenbereich** wird nicht durch einen neuen Subsystem gefüllt, sondern durch tatsächliche Lektionsinhalte.
- **Kein Remote-Push/Release.**

---

## 16. Fazit

CyberLearn besitzt bereits alle Bausteine für ein sehr gutes Micro-Learning-System, aber sie sind noch in mehreren parallelen Maschinen verteilt. Der naheliegendste nächste Schritt ist keine neue Engine, sondern die **Konsolidierung der Interaktions-Primitiven, der Randomisierung und der Mastery-Speicher** — gefolgt von einem **Piloten auf der existierenden, starken DHCP-Lektion**.

Die größten technischen Hebel:

1. Ein geteilter, seedeter RNG für alle Lernfragen.
2. Ein `FeedbackPanel` mit den Slots `observation / why / rule / transfer`.
3. Eine `OrderingList`/`MatchingBoard`-Familie für alle Modi.
4. Eine gemeinsame `HistoryService`-Schicht über `semanticHistory`, `themencheck-history` und `conversation-history`.

Die größten didaktischen Hebel:

1. Fortschritt erst nach aktiver, korrekter Demonstration gewähren.
2. Mehr `guided-ui` / CLI / Troubleshooting in AD und InfoSec.
3. Weniger `select-best`-Last, mehr perspektivische Variation und Transfer.

**Empfohlener nächster produktiver Schritt:** Phase A umsetzen (RNG/Shuffles/Feedback-Strings + kleiner didaktischer Fix), dann `ciscoDhcp` als Micro-Learning-Pilot designen.
