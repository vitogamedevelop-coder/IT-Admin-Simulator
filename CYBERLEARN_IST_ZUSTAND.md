# CyberLearn – vollständiger IST-Zustand

**Erhebungsdatum:** 25. August 2026  
**Untersuchungsart:** statische Repository- und Codeanalyse, read-only; einziges erzeugtes Artefakt ist dieses Dokument.  
**Geltungsbereich:** aktueller lokaler Stand des Repositorys `C:\Users\vitog\CyberLearn`.

> Dieses Dokument beschreibt ausschließlich nachweisbaren Bestand. Wo Reichweite oder Laufzeitnutzung nicht zweifelsfrei aus statischem Code hervorgehen, steht ausdrücklich **NICHT EINDEUTIG AUS DEM AKTUELLEN CODE ERMITTELBAR**.

---

## 1. Verifizierter Repository- und Versionsstand

| Merkmal | Tatsächlicher Stand |
|---|---|
| Repository-Wurzel | `C:/Users/vitog/CyberLearn` |
| Branch | `main` |
| HEAD | `c0836c940e12e9a7dfa0a2bfd1d2cebc0568dce4` |
| Kurz-Commit | `c0836c9` – `Phase 10 C: AD Kapitel 3+4 v1.35.0` |
| Remote-Stand | `origin/main` zeigte bei Erhebung auf demselben Commit |
| Git-Tags | keine Tags durch `git tag --sort=-creatordate` ausgegeben |
| Frontend-Version | `1.35.0` |
| Backend-Paketversion | `1.0.0` (eigenständige package.json-Version, keine Produktversion) |
| Lokale Änderungen vor Bericht | zwei unversionierte temporäre Dateien: `frontend/scripts/.tmp-ad-samples.txt`, `frontend/scripts/.tmp-conversation-samples.mjs` |

Die Produktversion `1.35.0` stimmt in `frontend/package.json:4`, `frontend/src/lib/version.js:17` und `frontend/public/version.json:2` überein. `AGENTS.md` im tatsächlich gelesenen Arbeitsbaum nennt ebenfalls 1.35.0; eine zusätzlich injizierte Regelkopie zeigte 1.34.0 und ist damit gegenüber dem Arbeitsbaum veraltet. Der letzte Commit 1.34.0 ist `bee6226` (`Active Directory Foundation`); 1.35.0 enthält zusätzlich AD Benutzerprofile und Berechtigungsverwaltung.

Parallel vorhandene Versions-/Buildformen:

- Web-Quellen und gegebenenfalls vorhandenes `frontend/dist/` (Vite-Ausgabe).
- PWA-Dateien unter `frontend/public/`.
- Capacitor-Android-Projekt unter `frontend/android/`.
- Debug-APK-Ziel laut Buildskript/Projektregel: `frontend/android/app/build/outputs/apk/debug/IT-Admin-Simulator.apk`.
- Zeitgestempelte APK-Archive werden laut `AGENTS.md:149-153` unter `frontend/apk-archive/` erzeugt; die Dateisuche fand bei der Erhebung dort keine sichtbaren `*.apk`. Ob sie ignoriert, außerhalb des aktuellen Sichtbereichs oder entfernt sind, ist **NICHT EINDEUTIG AUS DEM AKTUELLEN CODE ERMITTELBAR**.

**Quellen:** `frontend/package.json`, `frontend/src/lib/version.js`, `frontend/public/version.json`, `backend/package.json`, Git-Kommandos, `AGENTS.md`.

---

## 2. Technische Architektur

### 2.1 Technologien und tatsächliche Aufgaben

#### Frontend

- **JavaScript/JSX, ES Modules:** Content, Engines und UI sind überwiegend direkt in `.js`/`.jsx` implementiert; kein TypeScript-Produktionscode festgestellt.
- **React 19:** Seiten, Komponenten, lokale UI-Zustände und Context. Einstieg über `frontend/src/main.jsx`, Routing in `frontend/src/App.jsx`.
- **React Router 7:** geschützte SPA-Routen; Workspace, Missionen, Academy, Inbox, Infrastruktur, Karriere usw. (`App.jsx:45-66`).
- **Tailwind CSS 3 + projektspezifische CSS-Klassen:** Layout und Cyber-/NEXUS-Darstellung.
- **Lucide React:** Icons.
- **Vite 8:** Entwicklungsserver und Produktionsbuild.
- **PWA:** Manifest, Service Worker und GitHub-Pages-404-Routing unter `frontend/public/`; die SPA repariert Pages-Redirects in `main.jsx`/`App.jsx:35-37`.
- **Capacitor 8 + Android:** Web-App als Android-App; Text-to-Speech über `@capacitor-community/text-to-speech`, App-Lifecycle über `@capacitor/app`.
- **Text-to-Speech:** Lektionen, Dialoge und Charakterstimmen über `speechSynthesis.js`, `SpeakButton` und Charakterprofile in `officeWorld.js:174-180`.
- **Kein zentraler Redux-/MobX-Store:** Zustand liegt in React-local state, Context und mehreren `localStorage`-Stores.

#### Backend

- **Node.js/CommonJS + Express 5:** Authentifizierung und ältere Lernportal-APIs; Produktion kann `frontend/dist` ausliefern (`backend/server.js:35-46`).
- **SQLite 3:** Benutzer, Module, Fragen, Antworten, Progress, Patch Center, Flashcards, Lückentexte, Merkhilfen, Cheat Sheets, XP-Log, Daily Challenges und Streaks (`backend/db.js:37-166`).
- **JWT, bcrypt, Cookies:** Authentifizierung; Helmet, CORS und Rate-Limits als Sicherheitsmiddleware/Abhängigkeiten.
- Die moderne NEXUS Academy und RPG-Welt speichern wesentliche Zustände clientseitig und sind nicht als relationales Academy-Modell in SQLite abgebildet. Das Backend-Modul-/Fragensystem ist ein paralleles Lernportal-System.

#### Tests und Qualität

- `oxlint` als Linter.
- Viele ausführbare `.mjs`-Audit-/Regression-Skripte unter `frontend/scripts/`; kein einheitlicher Test-Runner in `package.json` registriert.
- Playwright ist Dev-Abhängigkeit und wird für Browser-/Screenshotprüfungen verwendet.
- Knowledge-Validatoren prüfen Datenmodell, Lösbarkeit, Distraktoren, Antwortformate und Positionsleaks (`knowledge/validators.js`).

**Quellen:** `frontend/package.json`, `backend/package.json`, `backend/server.js`, `backend/db.js`, `frontend/src/App.jsx`.

### 2.2 Relevante Projektstruktur

| Bereich | Verantwortung |
|---|---|
| `frontend/src/pages/` | Routbare Screens: Workspace, Academy, Kategorie/Thema, Missionen, Inbox, Infrastruktur, Karriere, Runbooks, Import, Einstellungen. |
| `frontend/src/components/` | Wiederverwendbare UI und Runner: `LessonRunner`, Terminal, Dialoge, Mitarbeitergespräche, ObjectivePanel, Office-Apps. |
| `frontend/src/lib/academyTopics.js` | Statischer Katalog aller Academy-Kategorien und Topics, Reihenfolge und Voraussetzungen. |
| `frontend/src/lib/academyLessons/` | Datengetriebene Theorie, Übungen, Quizze und Generatoren je implementierter Lektion. |
| `frontend/src/lib/academyLessonData.js` | Zentrale Registry der tatsächlich an `LessonRunner` angeschlossenen Lektionen. |
| `frontend/src/lib/academyProgress.js` | Separater persistenter Academy-Fortschritt und Migrationen. |
| `frontend/src/lib/academyEngine.js` | Scores, Statusübergänge, Voraussetzungen, Freischaltungen und Activity-Scoring. |
| `frontend/src/lib/knowledge/` | Strukturierte Knowledge Items, Templates, Generator, Balancer, Facet-Mastery, History, Validierung. |
| `frontend/src/lib/missionV2.js`, `missionGenerator.js`, `missionTemplateEngine.js` | Autorisierte Hauptmissionen und adaptive prozedurale Missionen. |
| `frontend/src/lib/ciscoCliEngine.js` | Zustandsbehaftete Cisco-IOS-Simulation und Kommando-Parser. |
| `frontend/src/lib/terminal/` + `components/Terminal.jsx` | Kleine Windows-/Netzwerk-Kommandoantwort-Simulation; getrennt von Cisco CLI. |
| `frontend/src/lib/gameState.js` | RPG-Weltzustand, Karriere-XP, Reputation, Infrastruktur, Missionsergebnisse, Runbooks. |
| `frontend/src/lib/officeWorld.js`, `directory.js` | NEXUS-Personen, Geräte, Server, Firmenevolution und Verzeichnisdaten. |
| `frontend/src/lib/employeeConversations.js` | Mitarbeiter-Fragen, Knowledge-Layer-Anbindung, Session, Feedback und Cooldowns. |
| `backend/` | Express/SQLite-Backend des parallelen klassischen Lernportal-/Auth-Systems. |
| `frontend/public/` | PWA, statische Assets und Versionsmetadaten. |
| `frontend/android/` | Capacitor-Android-Projekt. |

---

## 3. Tatsächliche Academy-Gesamtstruktur

### 3.1 Katalog und Reichweite

Der Katalog enthält **5 Kategorien und 108 Topics**. Davon haben **42 Topics eine registrierte datengetriebene Lektion**; `fundamentals/grundbegriffe` besitzt zusätzlich eine eigene Inline-Lektion in `AcademyTopic.jsx`. Alle anderen Topics zeigen bei Zugriff den Platzhaltertext aus `AcademyTopic.jsx:34-40`.

Automatisch aus `ACADEMY_TOPICS` und `LESSONS` gezählt:

| Reihenfolge | Kategorie / ID | Topics | registrierte `LESSONS` | zusätzlicher Spezialfall | Topics ohne `LESSONS` |
|---:|---|---:|---:|---|---:|
| 1 | Grundlagen / `fundamentals` | 20 | 16 | `grundbegriffe` (eigener Runner) | 4, davon 1 Spezialfall und 3 reine Platzhalter |
| 2 | Cisco – Packet Tracer / `cisco-packet-tracer` | 18 | 18 | – | 0 |
| 3 | Informationssicherheit / `information-security` | 36 | 5 | – | 31 |
| 4 | Linux – VirtualBox / `linux-virtualbox` | 16 | 0 | – | 16 |
| 5 | Active Directory – VirtualBox / `active-directory-virtualbox` | 18 | 3 | – | 15 |

**Quelle:** `academyTopics.js:29-35,80-263`, `academyLessonData.js`, `AcademyTopic.jsx:22-40,279-324`.

### 3.2 Hierarchie je Kategorie

Status bei einem frischen Save: Topic ohne Voraussetzungen = `available`, mit Voraussetzungen = `locked` (`academyTopics.js:45-62`). Laufzeitstatus kann davon abweichen.

#### 1. Grundlagen (`fundamentals`)

- `grundbegriffe` → eigene Sam-Dialoglektion.
- `topologien` ← `grundbegriffe` → Lektion.
- `kommunikation-uebertragung` ← `grundbegriffe` → Lektion.
- `osi-model` → Lektion.
- `tcp-ip-model` ← `osi-model` → Lektion.
- `ipv4` ← `tcp-ip-model` → Lektion.
- `binary-system` → Lektion.
- `subnet-masks` ← `ipv4`, `binary-system` → Lektion.
- `subnetting` ← `ipv4`, `binary-system`, `subnet-masks` → Lektion.
- `vlsm` ← `subnetting` → Lektion.
- `supernetting` ← `vlsm` → Lektion.
- `ports` ← `tcp-ip-model` → Platzhalter.
- `transport-protocols` ← `tcp-ip-model` → Platzhalter.
- `tcp-udp` ← `transport-protocols` → Lektion, trotz vorgeschaltetem Platzhalter erreichbar, sobald der Platzhalter über Kursmodus oder andere Progresswege Fortschritt erhält; regulärer Lernweg ist dadurch inhaltlich unterbrochen.
- `dns` ← `ports` → Lektion.
- `dhcp` ← `ports` → Lektion.
- `routing` ← `ipv4` → Lektion.
- `switching` ← `grundbegriffe` → Lektion.
- `vlan-basics` ← `switching` → Lektion.
- `inter-vlan-routing` ← `routing`, `vlan-basics` → Platzhalter.

#### 2. Cisco – Packet Tracer (`cisco-packet-tracer`)

Alle 18 Topics sind in `LESSONS` registriert:

`grundlagen` → `grundkonfiguration`; `basic-device-configuration` ← `grundlagen`; `vlan` ← `fundamentals/switching`, `fundamentals/ipv4`, `fundamentals/vlan-basics`; `access-port` und `trunk` ← `vlan`; `router-basics` ← `trunk`; `static-routing` ← `router-basics`; `ospf` ← `router-basics`, `static-routing`; `inter-vlan-routing` ← `trunk`, `router-basics`; `multilayer-switching` und `stp` ← `trunk`; `acl` ← `router-basics`; `packet-filter` ← `acl`; `nat` ← `router-basics`; `troubleshooting`, `ssh` ← `static-routing`, `inter-vlan-routing`, `multilayer-switching`; `dhcp` zusätzlich ← `fundamentals/dhcp`.

Die Academy-Lektionen sind nicht identisch mit den vier Story-Hauptmissionen. Hauptmissionen liegen separat in `missionV2.js`/`questData.js`, werden über `/mission/:missionId` ausgeführt und können Academy-Praxiswerte vergeben.

#### 3. Informationssicherheit (`information-security`)

Implementierte Blocklektionen:

1. `security-fundamentals`
2. `security-legal-data` ← Grundlagen
3. `security-incidents` ← Grundlagen
4. `security-threats-malware` ← Grundlagen
5. `security-technical-measures` ← Grundlagen

31 Detailtopics sind Katalog-/Knowledge-Struktur, aber ohne `LESSONS`: `security-objectives`, `confidentiality`, `integrity`, `availability`, `authenticity`, `passwords`, `mfa`, `phishing`, `malware`, `backup`, `logging`, `firewall-basics`, `hardening`, `incident-response`, `pimo`, `opti`, `isms`, `pdca`, `data-protection`, `art9-dsgvo`, `information-categories`, `security-breach`, `security-incident`, `firewall-types`, `ids-ips`, `dmz`, `allowlist-denylist`, `malware-types`, `attacks`, `malware-prevention`, `required-level`. Sie sind als Platzhalter erreichbar, wenn die jeweilige Voraussetzung erfüllt oder Kursmodus aktiv ist.

#### 4. Linux – VirtualBox (`linux-virtualbox`)

Alle 16 Topics sind reine Katalog-Platzhalter: `virtualbox-basics`, `start-virtual-machine`, `terminal`, `navigation`, `filesystem`, `files-and-directories`, `users`, `groups`, `permissions`, `processes`, `services`, `package-management`, `network-commands`, `ssh`, `logs`, `bash-basics`. Voraussetzungen bilden einen plausiblen Graphen, es existiert jedoch keine registrierte Linux-Lektion und keine Linux-Simulation im Academy-Runner.

#### 5. Active Directory – VirtualBox

Siehe Detailkapitel 4.

### 3.3 Zugriff und Freischaltung

- Normalmodus blockiert Topics mit Status `locked` (`AcademyTopic.jsx:273-276,348-352`).
- **Kursmodus** setzt `effectiveLocked = false`; damit lassen sich auch gesperrte Topics öffnen (`AcademyTopic.jsx:273-277`). Das ändert nicht automatisch deren Scorefähigkeit: Engine-Funktionen verweigern Punkte für tatsächlich `locked` gespeicherte Topics (`academyEngine.js:156-162`).
- Voraussetzung erfüllt, wenn mindestens eine Bedingung zutrifft: Status mindestens `learned`, mindestens eine Lektionsbeendigung, sichtbarer Gesamtfortschritt mindestens 15 %, oder Conversation Mastery mit 3 richtigen Antworten aus 2 Konzepten (`academyEngine.js:90-107`).
- Freischaltung ist nur vorwärtsgerichtet und wird bei Academy-Zugriff/Aktivität aktualisiert (`academyEngine.js:110-139`).

---

## 4. Active-Directory-Academy – vollständiger Bestand

### 4.1 Gesamtgraph

```text
virtualbox-lab [Platzhalter, initial verfügbar]
└─ ad-foundation [implementierte Theorie/Quiz]
   ├─ ad-user-profiles [implementierte Theorie/Quiz]
   │  └─ ad-permissions [implementierte Theorie/Quiz]
   └─ windows-server [Platzhalter]
      └─ domain [Platzhalter]
         └─ domain-controller [Platzhalter; zusätzlich fundamentals/ipv4 + fundamentals/dns]
            ├─ users → groups [Platzhalter]
            ├─ organizational-units → group-policy [Platzhalter]
            ├─ active-directory-dns → ldap [Platzhalter]
            ├─ kerberos [Platzhalter]
            ├─ shares → ntfs-permissions [Platzhalter]
            └─ domain-join → troubleshooting [Platzhalter]
```

**Wesentliche Erreichbarkeitsfolge:** Im regulären Modus ist `ad-foundation` von `virtualbox-lab` abhängig. `virtualbox-lab` hat keine Lektion, nur einen Platzhalter. Weil bloßes Öffnen keine Punkte vergibt, ist aus statischer Analyse kein regulärer Academy-Handlungspfad erkennbar, der dieses Topic auf 15 %/`learned`/Lektionsabschluss bringt. Conversation Mastery könnte es nur entsperren, wenn dafür Knowledge/Conversations existieren; für `virtualbox-lab` wurden keine Knowledge Items festgestellt. Daher sind die drei vorhandenen AD-Lektionen im normalen frischen Progress **vorhanden, aber vermutlich nicht regulär erreichbar**; im Kursmodus sind sie aufrufbar. Dies ist ein wichtiger Unterschied zwischen „implementiert“ und „erreichbar“.

### 4.2 `virtualbox-lab`

- **Name/ID/Position:** VirtualBox-Lab / `virtualbox-lab` / AD Position 1.
- **Voraussetzungen:** keine; initial verfügbar.
- **Lerninhalt laut Katalog:** Aufbau der Windows-Server-Laborumgebung.
- **Theorie/Interaktionen/Aufgaben/Fragen/Simulation/Terminal:** keine registrierte Lektion; Platzhalterkarte.
- **Feedback/Belohnung/persistente Änderung:** keine durch bloßes Öffnen.
- **Ressourcen:** nur Topicdefinition.
- **STATUS:** **Platzhalter**.

### 4.3 `ad-foundation`

- **Name/ID/Position:** Active Directory – Grundlagen / `ad-foundation` / Position 2.
- **Voraussetzung:** `virtualbox-lab`.
- **Freischaltung:** allgemeine Voraussetzungskriterien; im Kursmodus ohne UI-Sperre.
- **Lerninhalt:** Verzeichnisdienst; Objekte/Attribute; Problem lokaler Verwaltung; AD DS; DNS/Kerberos; LDAP; SMB/NTFS; Authentifizierung/Autorisierung; Replikation.
- **Theorie:** 7 logische Sections in 8 Erklärungsobjekten; `verzeichnisdienst` hat klassische und intuitive Variante, weitere Abschnitte überwiegend klassisch. Blocktypen Text, Listen und Tabellen gemäß Datei.
- **Interaktionen:** Abschnitt weiterblättern, Stil wechseln wo vorhanden, generische Abschnitts-Selbsteinschätzung, 5er-Abschlussquiz, Praxis-/Fachgespräch aus demselben Fragenpool.
- **Aufgaben:** keine `exercises[]`; nur Fragen.
- **Fragen:** keine Inline-Frageblöcke, 5 statische Quizfragen; Knowledge Layer mit 21 Items für generierte Mitarbeiterfragen.
- **Simulationen/Terminal:** keine.
- **Feedback:** direkt richtig/falsch plus Erklärung; am Ende Sam-Frage zur Erklärungshilfe und Wechsel des Erklärungsstils.
- **Belohnung:** Abschnitt/Frage/Lektions- und Quizfortschritt über Academy Engine; erster Abschluss +4 Theorie, korrekte Fragen +2 Theorie (letzte Quizfrage als Retention-Art), perfektes Gesamtquiz +2 Retention. Mehrfachwertung wird über IDs verhindert.
- **Persistenz:** `cyberlearn:academy-progress-v1` mit Sections, Questions, Attempts, Scores, Stil, Completion.
- **Ressourcen:** `academyLessons/adFoundation.js`, `knowledge/items/adFoundation.js`, `academyLessonData.js:47`.
- **STATUS:** **inhaltlich implementiert, aber durch vorgeschalteten Platzhalter im Normalmodus vermutlich nicht regulär erreichbar**.

### 4.4 `ad-user-profiles`

- **Name/ID/Position:** Benutzerprofile / `ad-user-profiles` / Position 3.
- **Voraussetzung:** `active-directory-virtualbox/ad-foundation`.
- **Lerninhalt/Theorieabschnitte:** Kontoarten; lokale/servergespeicherte Profile; Ordnerumleitung; UNC und Home-Verzeichnis; Benutzer/Computer anlegen; `New-ADUser`; Kontoeigenschaften; Admin-Tier-Modell.
- **Interaktionen:** dieselben LessonRunner-Modi und Abschnittschecks wie oben.
- **Aufgaben:** keine `exercises[]`.
- **Fragen:** Inline-MC und 6 Abschlussquizfragen; 12 Knowledge Items.
- **Simulationen/Terminalaktionen:** keine ADUC-, PowerShell-, Benutzer-, Profil- oder Dateifreigabe-Zustandssimulation. Befehle werden erklärt/abgefragt, nicht ausgeführt.
- **Feedback/Belohnung/Persistenz:** generischer LessonRunner/Academy-Engine-Flow.
- **Ressourcen:** `academyLessons/adUserProfiles.js`, `knowledge/items/adUserProfiles.js`.
- **STATUS:** **inhaltlich implementiert; keine praktische Simulation; reguläre Erreichbarkeit hängt an `ad-foundation` und damit indirekt am Platzhalter**.

### 4.5 `ad-permissions`

- **Name/ID/Position:** Berechtigungsverwaltung / `ad-permissions` / Position 4.
- **Voraussetzung:** `ad-user-profiles`.
- **Lerninhalt/Theorieabschnitte:** direkte Benutzerberechtigungen als Problem; Least Privilege; Sicherheits-/Verteilergruppen; Gruppenbereiche; Verschachtelung; A-G-DL-P; A-G-G-P; Praxistransfer.
- **Interaktionen:** LessonRunner-Abschnittschecks, Praxis-MC, Fachgespräch, Abschlussquiz.
- **Aufgaben:** keine `exercises[]`; A-G-DL-P wird nicht als echte Gruppen-/ACL-Zustandsänderung ausgeführt.
- **Fragen:** Inline-Fragen plus 6 Quizfragen; 11 Knowledge Items wurden durch den aktuellen Audit gezählt (der Bericht stützt sich auf Laufzeit-Audit `23 items` für Profile+Permissions und 12 Profile-Items; daraus 11 Permissions-Items).
- **Simulationen/Terminal:** keine.
- **Feedback/Belohnung/Persistenz:** generisch.
- **Ressourcen:** `academyLessons/adPermissions.js`, `knowledge/items/adPermissions.js`, `scripts/ad-chapters-3-4-audit.mjs`.
- **STATUS:** **inhaltlich implementiert; keine praktische Berechtigungssimulation; durch Vorgängerkette im Normalmodus abhängig**.

### 4.6 AD-Platzhalter Position 5–18

| Position | ID | Name | Voraussetzung | Status |
|---:|---|---|---|---|
| 5 | `windows-server` | Windows Server | `virtualbox-lab`, `ad-foundation` | Platzhalter |
| 6 | `domain` | Domäne | `windows-server`, `ad-foundation` | Platzhalter |
| 7 | `domain-controller` | Domain Controller | Windows Server, Domäne, Grundlagen IPv4/DNS | Platzhalter |
| 8 | `users` | Benutzer | Domain Controller | Platzhalter |
| 9 | `groups` | Gruppen | Benutzer | Platzhalter |
| 10 | `organizational-units` | Organisationseinheiten | Domain Controller | Platzhalter |
| 11 | `group-policy` | Gruppenrichtlinien | Organisationseinheiten | Platzhalter |
| 12 | `active-directory-dns` | AD-integriertes DNS | Domain Controller | Platzhalter |
| 13 | `ldap` | LDAP | AD-integriertes DNS | Platzhalter |
| 14 | `kerberos` | Kerberos | Domain Controller | Platzhalter |
| 15 | `shares` | Freigaben | Domain Controller | Platzhalter |
| 16 | `ntfs-permissions` | NTFS-Berechtigungen | Freigaben | Platzhalter |
| 17 | `domain-join` | Domänenbeitritt | Domain Controller | Platzhalter |
| 18 | `troubleshooting` | Troubleshooting | Domänenbeitritt | Platzhalter |

Keines dieser Topics hat Theorie, Übungen, Quiz, Simulation, Terminalaktion, Belohnung oder eigene persistente Weltänderung. Die UI zeigt den Platzhaltertext. „Kapitel 5–8“ als explizite nummerierte Lehrgangskapitel sind im Datenmodell nicht als solche markiert; eine eindeutige Zuordnung des gesamten Topicgraphs zu einer externen Kapitelnummerierung ist **NICHT EINDEUTIG AUS DEM AKTUELLEN CODE ERMITTELBAR**.

### 4.7 AD-Missionen und Weltänderungen

Es existieren keine AD-Hauptmissionen, AD-Nebenmissionen, ADUC-Simulation, PowerShell-Engine, echte Benutzer-/Gruppen-/OU-/Freigabe-/NTFS-Zustandsmodelle oder persistente AD-Ressourcenänderungen. Topicfelder `relatedMissions`, `relatedSideMissions`, `unlockedTools` sind initial leer (`academyTopics.js:56-60`). Vorhandene Weltressourcen DC01 und Domänenstatus sind Anzeige-/RPG-Daten, nicht durch AD-Academy-Aufgaben editierbar.

---

## 5. Theorie-System und tatsächlicher Lektionsflow

### 5.1 Speicherung und Format

Theorie liegt **direkt in JavaScript-Objekten**, nicht in Markdown, JSON-Dateien oder der Datenbank:

```text
academyLessons/*.js
→ build...Lesson()
→ LESSONS[category/topic]
→ LessonRunner
```

Ein Lesson-Objekt enthält typischerweise `title`, `explanations[]`, optional `exercises[]`, `quiz[]`, `summary[]`. Explanation: `id`, `style`, `title`, `blocks[]`. Blocktypen im aktuellen Gesamtbestand: `text`, `diagram`, `list`, `question`, `table`. SVGs sind teilweise als Inline-Strings eingebettet (`academyLessonData.js:51-58`). Cisco-Befehle erscheinen als Text/Tabellen sowie in `cli-input`-Übungen.

Typische Theorieabschnitte sind einzelne Karten mit mehreren kurzen Blöcken. Eine allgemeingültige Zeichenlänge ist **NICHT EINDEUTIG AUS DEM AKTUELLEN CODE ERMITTELBAR**; Inhalte reichen von kurzen Merksätzen bis zu langen Tabellen/Listen. Bilder kommen über RPG-Assets/Charakterporträts, technische Visualisierungen primär als Inline-SVG/Diagrammblöcke.

### 5.2 Tatsächlicher Standardflow

```text
Academy öffnen
→ Kategorie wählen
→ Topic-Karte wählen
→ Sperrprüfung (Normalmodus) bzw. Bypass (Kursmodus)
→ Sam-Einstiegskarte
→ Modus wählen:
   Theorie | Praxis | Fachgespräch
```

**Theorie:** Explanation Section → Stiloption (wenn vorhanden) → Vorlesen möglich → Weiter → Abschnitt als gelesen speichern → konkrete Inline-Frage oder generische Selbsteinschätzung → nächste Section → Übungen (falls vorhanden) → Abschlussquiz → Sam-Hilfreichkeitsfrage → Zusammenfassung/Abschluss.

**Praxis:** zufällige Teilmenge von 5 Fragen aus Inline- und Quizpool, ohne Theorie (`LessonRunner.jsx:58-69`). Trotz Bezeichnung „Praxis“ handelt es sich hier im Allgemeinen um Fragen, nicht zwingend praktische Zustandsmanipulation.

**Fachgespräch:** 5 Fragen aus demselben Pool in Sam-Dialogdarstellung. Ob Freitext semantisch bewertet wird, hängt von der konkreten Implementierung ab; der Pool beruht auf Fragen mit hinterlegten Antworten. Es ist keine LLM-Auswertung vorhanden.

Spezialfall `grundbegriffe`: 9 feste Sam-Beats, davon drei MC-Verständnisfragen, eigener Runner in `AcademyTopic.jsx:43-153`.

---

## 6. Sam- und Mentor-System

Sam ist kein einzelnes Dialogsystem, sondern tritt in mehreren technisch getrennten Rollen auf:

1. **Academy-Einstieg:** Porträt, Status-/Fortschrittsansprache und Wahl Theorie/Praxis/Fachgespräch (`AcademyTopic.jsx:184-241`).
2. **Theorie-Mentor:** Explanation-Karten werden als von Sam vermittelt dargestellt; TTS und Erklärungsstilwechsel.
3. **Lektionsabschluss:** Frage „Hat dir die Erklärung geholfen?“; negative Antwort wählt den nächsten verfügbaren Stil aus `classic → intuitive → example → visual → mnemonic` und startet erneut (`LessonRunner`, `STYLE_SEQUENCE`).
4. **Fachgespräch:** Fragepool als mündliche Prüfung inszeniert.
5. **Progressive Missionshilfe:** `samHelp.js` führt Hilfeaufrufe mit 30-Minuten-Fenster und Tonabstufung; Mission V2 besitzt zusätzlich pro Requirement vierstufige Hint-Ladders bis zur Lösung.
6. **Fehlerintervention in Mitarbeitergesprächen:** Nach falschen Antworten erklärt Sam bzw. verweist auf Academy-Review; Conversation-Komponente nutzt Knowledge-Auswertung.
7. **Flur/Büro/Smalltalk:** `corridorDialogs.js` und Workspace bieten 23 Smalltalkzeilen, Sams Büro und Pausenraum-Atmosphäre.
8. **Story/Telefon:** Sam ist stabiler Storycharakter `sam`/Sam Richter, Senior-Administrator, mit eigener Stimme (`officeWorld.js:44-55,174-180`).

Dialoge sind überwiegend lineare, datengetriebene Arrays/Bäume oder fest codierte Zustandsautomaten. Entscheidungen bestehen hauptsächlich aus Antwort-/Navigationsoptionen; eine generative KI ist nicht beteiligt. Sam kann Hinweise und komplette Lösungen zeigen. Unterschiedliche Systeme haben unterschiedliche Persistenz und Tonlogik.

---

## 7. Fragenpool und Fragen-Maker

### 7.1 Tatsächliche Quellen

Es existieren mehrere parallele Quellen:

1. **Statische Lesson-Fragen:** `blocks[type=question]` und `lesson.quiz[]`.
2. **Grundbegriffe-Spezialfragen:** `BASICS_BEATS` in `AcademyTopic.jsx`.
3. **Knowledge Layer:** strukturierte Items + regelbasierte Templates + Seed-RNG; primär Mitarbeitergespräche/automatische Varianten.
4. **Statische Conversation-Pools:** Alt-/Fallback-`CONVERSATION_TOPICS` in `employeeConversations.js`.
5. **IPv4/Subnetting-Generator:** mathematisch parametrische Fragen in `academyLessons/ipv4Generator.js` und `networking/ipv4Math.js`.
6. **Themencheck:** sammelt vorhandene Lesson-Fragen, erzeugt aber kein neues Fachwissen.
7. **SQLite-Backend-Fragen:** klassische Module/Questions mit `type`, `question`, `options`, `answer`, `explanation`, `diagnostic`, `difficulty`; separates System.

Es gibt **keine runtime KI/LLM-Fragengenerierung**. Automatik ist deterministisch/regelbasiert.

### 7.2 Datenmodelle

#### Lesson-MC

`question`, `options[]`, `correct` (Index), `explanation`; optional `id`/weitere kontextspezifische Felder. Inline-Question zusätzlich `type: 'question'`.

#### Knowledge Item

Nach Typ variierende Daten, gemeinsame Felder: `id`, `topicKey`, `sourceTopicKey`, `sourceSection`, `conceptCluster`, `type`, `difficulty`, `allowedQuestionTypes`, `data`, teils `siblings`, `roleHints`, Quellen-/Klassifikationsmetadaten.

Knowledge-Typen (`knowledge/types.js`): `DEFINITION`, `PROPERTY`, `RELATION`, `MAPPING`, `ORDER`, `COMPARE`, `CALCULATION`, `RANGE`, `PROCEDURE`, `TROUBLESHOOT`.

#### Generierte Question Instance

Nachweisbare Felder umfassen: `instanceId`, `templateId`, `contextFamily`, `topicKey`, `knowledgeItemId`, `conceptCluster`, `learningObjective`, `knowledgeFacet`, `questionArchetype`, `difficulty`, `prompt`, `promptStyle`, `contextDependency`, `options` (Objekte), `correctOptionId`, `correctAnswer`, `explanation`, `conversationText`, `ttsText`, optional `calculationParams`, `answerFormat`, `wrongOptionExplanations`, `semanticTags`; Kompatibilitätsfelder `type`, `text`, `correct` werden teils ergänzt.

#### Backend-Frage

SQLite `questions`: `id`, `module_id`, `type`, `question`, `options` (JSON-Text), `answer`, `explanation`, `diagnostic`, `difficulty` (`backend/db.js:63-74`).

### 7.3 Fragetypen

Tatsächlich implementiert und nutzerseitig eingesetzt:

- Single Choice/Select Best.
- Ordering/Reihenfolge.
- Matching/Zuordnung.
- Texteingabe/numerische Eingabe.
- CLI-Mehrzeileneingabe.
- Guided/Adaptive Subnetting-Rechenschritte.
- Gesprächs-/Szenario-/Troubleshooting-Fragen, deren UI je Instanz meist MC/Ordering/Matching ist.
- Generische Selbsteinschätzung nach Sections ohne eigene Frage.

Ein echter Multiple-Choice-Typ mit mehreren gleichzeitig richtigen Optionen wurde im untersuchten Academy-Runner nicht festgestellt. Wahr/Falsch wird als zweistufige Single Choice modelliert. „Fachgespräch“ ist als Modus vorhanden, aber keine generative semantische Freitextprüfung.

### 7.4 Knowledge-Generator: Input → Output

```text
Knowledge Item Registry
+ gewünschter Archetyp/Difficulty/Context
+ Seed/RNG
+ semantische History und Facet Mastery
↓
passende Templates über matches(item) und supportedQuestionTypes filtern
↓
Balancer gewichtet schwache Facets, Cooldowns, Historie und Wiederholungsrisiko
↓
Template erzeugt MC/Ordering/Matching/Calculation Instance
↓
Distraktoren aus Itemdaten, Geschwistern oder kontrollierten Listen
↓
Validatoren: Pflichtfelder, eindeutige Optionen, Lösbarkeit, Distraktor-Domain,
Positionsleaks, Antwortformat
↓
Conversation-kompatible Felder ergänzen
↓
Question Instance an Mitarbeitergespräch
```

Zentrale Quellen: `knowledge/index.js:20-99`, `knowledge/questionGenerator.js`, `knowledge/templates.js`, `knowledge/semanticBalancer.js`, `knowledge/facetMastery.js`, `knowledge/validators.js`.

### 7.5 Auswahlalgorithmen

- **Lesson-Theorie:** feste Reihenfolge der Sections; Fragen in den Sections fest zugeordnet.
- **Lesson-Praxis/Fachgespräch:** `collectQuestionsFromLesson`, Shuffle, bis zu 5 Fragen.
- **Quiz:** feste Reihenfolge, Antwortoptionen pro Anzeige zufällig geshuffelt (`shuffleOptions`).
- **Themencheck:** je Topic 2–3 Fragen, Ziel 15–30 pro Kategorie, am Ende Shuffle; Abschlusscheck 50–100 über Kategorien; Fehlerrunde wiederholt nur falsche Fragen.
- **Knowledge Conversations:** Semantic Balancer berücksichtigt schwache Topic-/Facet-Werte, Kurz-/Langzeithistorie, Archetyp-/Konzeptwiederholung und Difficulty.
- **IPv4:** parametrische Zufallsgenerierung innerhalb Difficulty-Bereichen; adaptive Auf-/Abstufung.

### 7.6 Bewertung und Folgen

- Lesson-MC: exakter Index nach Shuffle. Richtig → unmittelbare positive Anzeige/Erklärung und einmaliges Scoring; falsch → Erklärung, kein Punkt, Wiederholung grundsätzlich möglich.
- Ordering/Matching: ID-Reihenfolge bzw. Pair-Mapping.
- Input: normalisierter String, teils mehrere erlaubte Darstellungen.
- CLI-Input in Academy: zeilenweiser, case-/abkürzungstoleranter Vergleich gegen erwartete Befehlszeilen; dies ist nicht der vollständige IOS-Zustandsparser.
- Cisco-Mission: Zustand/Requirements werden geprüft, nicht nur Textgleichheit.
- Teilpunkte als einheitliches Academy-Konzept wurden nicht festgestellt. Difficulty-Drill/Prüfungen berechnen Prozentwerte und Passgrenze.

---

## 8. Inventar aller Interaktions- und Aufgabentypen

| Typ | Technische Komponente | Input/Validierung | Feedback/Persistenz | Charakter |
|---|---|---|---|---|
| Theorie-Navigation | `LessonRunner` | Weiter/Zurück/Stilwahl | Section-ID, Content-Seen, bevorzugter Stil | passiv-interaktiv |
| Single Choice | `LessonRunner`, Conversations, Themencheck | Index nach Shuffle | richtig/falsch + Erklärung; Progress/Result | Frage |
| Ordering | `OrderingExercise`, `ConversationOrdering` | Reihenfolge von IDs | Erklärung, Exercise/Conversation-Status | strukturierte Aufgabe |
| Matching | `MatchingExercise`, `ConversationMatching` | Paarzuordnung | per Pair/gesamt, persistierter Abschluss | strukturierte Aufgabe |
| Text-/Zahleneingabe | `InputExercise` | normalisierte Antwortliste | richtig/falsch, Retry | kurze Anwendung |
| Select Best | `SelectBestExercise` | korrekter Index | Erklärung | Frage |
| CLI Input | `CliInputExercise`, `ciscoCli.js` | zeilenweiser Sollvergleich mit IOS-Abkürzungen | Einzelzeilenfeedback, Retry | Befehlsübung, keine volle Gerätesimulation |
| Guided Subnetting | `GuidedSubnettingExercise` | 7 Rechenschritte | Schrittfeedback | berechneter Zustand |
| Adaptive Subnetting | `AdaptiveSubnettingExercise` | generierte Aufgaben | 3 richtig höher, 2 falsch niedriger; 5 richtig Abschluss | adaptive Rechenpraxis |
| Difficulty Drill | `DifficultyDrillExercise` | Practice + 10er-Exam, 80 % | Tierfreischaltung, persistierte Exams | adaptive Prüfung |
| Themencheck | `AcademyThemencheck` | 15–30 gesammelte Fragen | Note/Sterneanzeige, Wrong-only Retry | Prüfung |
| Abschlusscheck | gleicher Enginebereich | 50–100 Fragen | Ergebnisstore | Prüfung |
| Mitarbeitergespräch | `EmployeeConversation` | MC/Matching/Ordering | Sam-Intervention, Cooldown, Facet Mastery, Academy-Link | situativ inszenierte Frage |
| Cisco IOS Mission | `MissionV2`, `ciscoCliEngine` | echte IOS-Kommandos ändern Device State | Requirement-Checks, Hints, Lösung, XP/Reputation | **echte Simulation** |
| Prozedurale Mission | `ProceduralMission`, `missionGenerator` | generierter Cisco-Zustand/CLI | adaptive Skills, Persistenz | **echte Simulation** |
| Kleines Netzwerkterminal | `Terminal`, `terminal/commands.js` | Kommandoname + Argument | statische/szenariobasierte Ausgabe, History | begrenzte Kommandoantwort-Simulation |
| E-Mail/Telefon | `EmailApp`, `PhoneApp` | auswählen/annehmen/ablehnen | read/archive/navigation | Missionsauslöser, keine Fachsimulation |
| Office-Hotspots/Dialog | `Workspace` | Objekt/Person anklicken | Navigation, Atmosphäre, Dialog | Weltinteraktion |

---

## 9. Praktische Simulationen

### 9.1 Echte Simulation: Cisco IOS

`ciscoCliEngine.js` modelliert Device State (`runningConfig`, `startupConfig`, Interfaces, VLANs, Lines, Benutzer, Crypto/SSH, CLI-Mode, History), neun CLI-Modi, Command Tree, exakte/prefix/wildcard-Auflösung, Fehlerklassen, IP-/Masken-/Interfacevalidierung, `show`-Renderer, `copy`/`write`, Tab Completion und `?`-Hilfe. Konfiguration verändert den Zustand; Missionsevaluatoren prüfen den Zustand und ausgeführte Verifikationsbefehle.

Hauptmissionen:

1. `cisco-main-001` Der erste Switch – Hostname, Enable Secret, lokaler User, DNS Lookup aus, speichern.
2. `cisco-main-002` Neue Abteilung – VLAN 10/20/999, Access-Ports, Parking/Shut, Trunk, Show, speichern.
3. `cisco-main-003` Fernwartung per SSH – Management-VLAN/SVI/IP/Gateway/Domain/RSA/SSHv2/VTY.
4. `cisco-main-004` Router-on-a-Stick – VLAN, Trunk, Router-Subinterfaces, dot1q, Reachability.

Vier autorisierte Cisco-Sidemissions decken Console-Absicherung, Passwortverschlüsselung, `login local` und ungenutzte Ports/Parking-VLAN ab (`ciscoSideMissions.js`). Prozedurale Instanzen variieren Parameter, Archetypen BUILD/REPAIR/AUDIT/DIAGNOSE/HARDEN und Difficulty.

### 9.2 Begrenzte oder simulierte Frage

- Academy-CLI vergleicht erwartete Zeilen; sie baut nicht den vollen Gerätezustand auf.
- Windows-/Netzwerkterminal kennt `help`, `hostname`, `ipconfig`, `ping`, `tracert`, `nslookup`, `netstat`; Ausgabe kommt aus einem Szenario. Kein Dateisystem, PowerShell, CMD-Zustand, Pipes, Prozesse oder AD-Cmdlets.
- AD-Lektionen verändern keinen AD-Zustand.
- E-Mail, Telefon, Directory und Infrastructure sind Anzeige/Navigationswelt, keine administrierbaren Systeme.

---

## 10. Terminal- und Konsolensysteme

### 10.1 Cisco CLI

- Parser: tokenisiert Whitespace; exakte, eindeutige Prefix- und Wildcard-Matches.
- Modi: User Exec, Privileged Exec, Global Config, Interface, Interface Range, VLAN, Console Line, VTY Line, RSA Modulus Prompt.
- Fehlertypen: unbekannt, mehrdeutig, unvollständig, ungültiges Argument, falscher Modus.
- History: Pfeil hoch/runter in Mission UI; Engine-History.
- Autocomplete: Tab; Vorschläge und Kontext; `do` aus Config-Modi.
- Kontext-Hilfe: `?` und `command ?`.
- Show-Ausgaben: IP Interface Brief, IP SSH, VLAN Brief, Interface Status/Trunk/Switchport, Spanning Tree u. a.
- Persistenz: Running → Startup innerhalb des Missions-Device-Objekts; Mission-/Instanzzustände haben eigene LocalStorage-Stores. Ob jeder Zwischenzustand eines autorisierten Hauptmissionsgeräts einen Browserreload vollständig überlebt, ist **NICHT EINDEUTIG AUS DEM AKTUELLEN CODE ERMITTELBAR**.
- Verständnisanforderung: Story-Missionen verlangen Reihenfolge, Moduswechsel, Parameter und Zustandsprüfung; Hint-Ladder kann bis zur vollständigen Lösung führen.

### 10.2 NEXUS-Terminal

- Kleiner Stringparser, szenariobasierte Antwortfunktionen.
- History persistent unter missionsbezogenem Key.
- Kein Autocomplete, kein Dateisystem, keine echte Shell, kein PowerShell-/Linux-/AD-Parser.
- `defaultMissionScenarios` ist nach Phase-0-Reset leer; Standardscenario bleibt. Reichweite dieses Terminals in aktuellen Missionen ist daher **wahrscheinlich gering/legacy**, genaue Laufzeitnutzung **NICHT EINDEUTIG AUS DEM AKTUELLEN CODE ERMITTELBAR**.

---

## 11. NEXUS-Systems-Welt

### 11.1 Charaktere

Feste Storycharaktere (`officeWorld.js:18-91`):

| ID | Name | Rolle/Abteilung | Kanal | Themen |
|---|---|---|---|---|
| `mara` | Mara König | Helpdesk | Telefon | DHCP, DNS, Berechtigungen |
| `david` | David Chen | Entwicklung | Mail | DNS, Datenbanken, Automatisierung |
| `sam` | Sam Richter | Senior-Administrator/Netzwerk | Telefon | Netzwerk, AD, Linux |
| `aylin` | Aylin Demir | Personal | Telefon | Berechtigungen, AD, IT-Sicherheit |
| `thomas` | Thomas Weber | Geschäftsführung | Mail | Backup, Change, Infrastruktur |

Zusätzlich 39 Accounts im prozeduralen Namenspool; diese sind ausdrücklich keine automatischen NPCs. Separates Directory mit Greta Müller, Tom Schmid, Lisa Weber, Marc Hoffmann und Sabine Krause (`directory.js:1-7`). Diese beiden Personensätze sind unterschiedliche Datenquellen.

### 11.2 Clients, Server, Netz

- Workstations: `PC-BUCH-01`, `PC-VER-12`, `PC-EIN-05`, `PC-DEV-03`, `PC-HR-02`; Benutzer, 192.168.10.x, MAC, Gateway 192.168.10.1, DNS 192.168.10.10, OS und Status (`directory.js:9-15`).
- Server: FS01 `192.168.10.10` (Datei/DNS/DHCP), DC01 `192.168.10.5` (AD/Auth, warning), WEB01 `192.168.10.20` (locked).
- Geräte: Router/Gateway `192.168.10.1`, Core-Switch `192.168.10.2`.
- Domäne/FQDN: `nexus.local` in Serverdaten.
- RPG-Infrastruktur: clients, network, domain, fileserver initial frei; linux, backup, soc gesperrt (`gameState.js:32-40`).
- Firmenstufen: Kleines Büro (0 Hauptquests), Wachsende Abteilung (2), Zentrale mit Außenstelle (4), Unternehmens-IT (7) (`officeWorld.js:186-195`). Aktuell existieren nur vier Hauptmissionen, daher ist Stufe 4 mit 7 Abschlüssen aus dem aktuellen Hauptmissionsbestand nicht erreichbar.

### 11.3 Nicht vorhandene persistente Ressourcen

Keine zentrale Datenstruktur für echte AD-OUs, AD-Gruppen, Gruppenmitgliedschaften, Home-Verzeichnisse, Shares/ACLs, GPOs oder Subdomains. Cisco-Missionsgeräte sind szenariospezifische Simulationszustände und nicht identisch mit `directory.js`-Core-Switch/Router.

---

## 12. Persistenz und Weltzustand

Es gibt kein einheitliches Persistenzmodell, sondern mehrere Stores:

| Key/System | Inhalt/Lebensdauer |
|---|---|
| `it-learn:rpg-state-v1` | RPG-Welt, XP, Quest-/Side-Mission-Abschlüsse, Reputation, Infrastruktur, Tools, Inbox, Runbooks, Credentials, Events; browserlokal, Version 10. |
| `cyberlearn:academy-progress-v1` | Topicstatus/-scores, Sections, Questions, Exercises, Quiz, Stil, Difficulty; browserlokal, Schema 8. |
| `cyberlearn:skill-tree-v2` + Events | Skills und Versuche. |
| prozedurale Instance/History/Scheduler Keys | generierte Missionen und adaptive Historie. |
| `it-learn:emails` | Mailstatus. |
| `it-learn:notebook` | Notebookfreischaltungen. |
| Conversation Session/History/Facet Keys | laufendes Gespräch, semantische Historie und Mastery. |
| Themencheck-Result-Key | Ergebnisse und falsche Fragen. |
| Backend SQLite | Accounts und klassisches Modul-/Fragenportal; nicht die NEXUS-Welt. |

Missionen können XP, Reputation, Tools, Infrastrukturstatus, Notebook und Runbooks dauerhaft ändern (`gameState.js:200-240`). Academy-Aktivität ändert getrennte Topicwerte. Haupt-/Nebenmissionen können über Topicrefs Academy-Praxis/Retention beeinflussen. Die Welt ist damit **teilweise verbunden**, aber Ressourcen selbst werden nicht kapitelübergreifend als ein gemeinsames administrierbares IT-Modell weitergeführt. AD-Lektionen ändern die NEXUS-Domäne nicht.

Reset:

- Game-State-Migration <5 setzte alte Missionsdaten zurück, Academy blieb erhalten (`gameState.js:81-94`).
- Topic Lesson Reset entfernt nur Resume-/Activity-IDs, nicht Scores/Status (`academyProgress.js:215-232`).
- Einstellungen/weitere UI-Resetoptionen wurden nicht vollständig dynamisch ausgeführt; ihre exakte Reichweite ist **NICHT EINDEUTIG AUS DEM AKTUELLEN CODE ERMITTELBAR**.

---

## 13. Progression

### 13.1 Academy

Status: `locked → available → started → learned → applied → consolidated` (`academyTopics.js:20-27`). Keine `review_due`-Stufe im Academy-Statusmodell.

Schwellen:

- started: irgendein Theorie-/Praxiswert ≥1.
- learned: Theorie ≥25.
- applied: bereits learned, Praxis ≥20 und mindestens eine Main-Mission-Anwendung.
- consolidated: bereits applied, Retention ≥30 und mindestens zwei Repetitionsereignisse (`academyThresholds.js:12-24`).

Deltas: Mentor +4 Theorie, Miniübung +6 Praxis, Hauptmission +12 Praxis, Sidemission +6 Retention, Theoriefrage +2 Theorie, Retentionquiz +2 Retention, Gespräch +4 Praxis, Reflexion +3 Retention (`academyThresholds.js:29-42`).

Gesamtkompetenz = 30 % Theorie + 40 % Praxis + 30 % Retention. Sichtbarer Topicfortschritt = 60 % dieser Kompetenz + 30 % Content-Seen + 10 % Anteil von drei perfekten Quizzen (`academyEngine.js:47-50,321-326`). Mastery verlangt 100 % Content, drei perfekte Quizze und bei Praxisrelevanz ausreichend Praxis (`academyEngine.js:307-318`).

### 13.2 Karriere/RPG

Score = `careerXp + incidentsResolved * 40 + durchschnittliche Legacy-Competency-Mastery * 300`. Sieben Ränge von IT-Trainee bis IT-Architekt (`gameState.js:187-198`). Missionen vergeben XP und Reputation. Sterne/Achievements als dauerhaftes globales Achievement-System wurden nicht gefunden; Themencheck zeigt eine 1–5-Sternebewertung des Testergebnisses, was kein globales Achievement ist.

### 13.3 Skill Tree

Separates Skillmodell mit Zuständen `UNSEEN`, `INTRODUCED`, `PRACTICING`, `MOSTLY_SECURE`, `SECURE`, `REVIEW_DUE`, Dimensionen Knowledge/Configure/Verify/Troubleshoot und Quellen Academy/Main/Procedural/Conversation/Exam etc. Es steuert prozedurale Missionen, ist aber nicht identisch mit Academy Topic Status.

---

## 14. Wiederholungssysteme

1. **Lesson-Quiz-Wiederholung:** unbegrenzt; Attempts, Best/Last, Perfect Count/Streak; dreimal perfekt für Mastery.
2. **Themencheck-Fehlerrunde:** nur zuvor falsche Fragen.
3. **Mitarbeitergespräche:** schwache Facets/Themen, Difficulty und Cooldowns; semantische Historie reduziert unmittelbare Dopplung.
4. **Side Missions:** Academy Engine wertet sie als Retention + Repetition.
5. **Prozedurale Missionen:** 40 % Weakness, 25 % Review Due, 15 % Progression, 10 % Zeit, 10 % Variety; zusätzliche Fehlergewichtung; Skillgruppe verteilt 60/25/15 aktuell/vorher/älter. Difficulty sinkt bei wiederholtem Scheitern und steigt bei Erfolg/Mastery.
6. **Legacy Competency:** eigenes Spaced-Repetition-Modell; parallel, nicht vollständig mit Academy verschmolzen.

Ein zeitbasierter Verfall von Academy-`retentionScore` ist im untersuchten Academy Engine-Code nicht implementiert. „Spaced repetition“ besteht hauptsächlich über Missionsauswahl/Skill Tree und Wiederholungsereignisse, nicht über einen einheitlichen Academy-Fälligkeitsplan.

---

## 15. Fehler- und Feedbacksystem

| Mechanik | Fehlerreaktion |
|---|---|
| Lesson MC | Richtig/falsch, Erklärung; falsch gibt keine Punkte, Retry möglich. |
| Section-Selbsteinschätzung | nicht fachlich validierbar; Spieler bestätigt Verständnis. |
| Ordering/Matching/Input | spezifische Validierung und Erklärung; Korrekturversuch. |
| Academy CLI | zeilenweise Soll/Ist-Anzeige, Extra-Lines, Retry. |
| Difficulty Drill | Quote, Tier bleibt/Exam erneut; adaptive Schwierigkeit. |
| Themencheck | Ergebnis/Note, falsche Fragen speicherbar und gezielt wiederholbar. |
| Mitarbeitergespräch | option-/instanzbezogenes Feedback, Sam-Intervention, Weak-Topic-Link, kurzer Cooldown nach Fehler. |
| Cisco Mission | reale Requirement-Checks, Parserfehler, Fortschrittsliste, vierstufige Hinweise bis Lösung; Spieler korrigiert denselben Zustand. |
| NEXUS-Terminal | Unknown-command/Usage-Ausgabe; keine tiefe Diagnose. |

Die höchste Fehlerdidaktik liegt im Cisco-Missionssystem, weil falsche Konfiguration im Zustand bleibt und korrigiert werden muss. Viele Academy-Fragen erklären die richtige Antwort, modellieren aber keine technische Konsequenz.

---

## 16. Repräsentative tatsächliche Game-Flows

### Frühe Academy (`grundbegriffe`)

Workspace/Academy → Grundlagen → Grundbegriffe → Theorie → Sam-Satz → Weiter → nach zwei/drei Sätzen MC → sofortige Erklärung → drei Themenblöcke → Sam-Abschluss → Topicfortschritt.

### Normale theoretische Lektion (AD Foundation)

Academy → AD-Kategorie → bei Normalmodus Sperre wegen VirtualBox-Platzhalter / im Kursmodus Topic öffnen → Sam-Moduskarte → Theorie → Section mit Text/Liste/Tabelle → Abschnittscheck → nächste Sections → 5er-Quiz → Sam fragt nach Erklärungsqualität → Summary → Completion.

### Academy-Praxis

Topic → Praxis → 5 zufällig gesammelte Inline-/Quizfragen → Antwort/Erklärung → Ergebnis. Bezeichnung Praxis bedeutet hier Fragepraxis, nicht zwingend Simulation.

### Komplexe praktische Mission

Workspace → E-Mail/Telefon/Objective → Hauptmission akzeptieren → IOS-Terminal → Befehle in Modi eingeben, Tab/?/History nutzen → Device State verändert sich → Requirementliste aktualisiert sich → Show-/Save-Anforderungen → Abschluss → XP/Reputation/Quest/Academy-Praxis/Runbook → nächste Story-/prozedurale Freischaltung.

### Mitarbeitergespräch

Flur/Kollege → Knowledge-/Fallback-Frage passend zu schwacher Facet → MC/Ordering/Matching → Feedback; bei Fehler Sam-Erklärung/Review → weitere Frage oder Summary → Practice-Score/Mastery/History/Cooldown.

---

## 17. Quantitative Bestandsaufnahme

Methode: Node importierte zur Laufzeit ausschließlich `ACADEMY_TOPICS` und `LESSONS` und zählte Objekte; keine Datei/Zustand wurde verändert. Erklärungvarianten werden als Blöcke gezählt, daher können Inhalte derselben Section in mehreren Stilen mehrfach in Blockzahlen vorkommen.

| Messgröße | Gesamt |
|---|---:|
| Kategorien | 5 |
| Topics | 108 |
| registrierte datengetriebene Lessons | 42 |
| Speziallektion Grundbegriffe | 1 |
| logische Sections (Style-Suffix zusammengeführt) | 328 |
| Textblöcke | 544 |
| Diagrammblöcke | 37 |
| Listenblöcke | 244 |
| Tabellenblöcke | 120 |
| Inline-Frageblöcke | 170 |
| Abschlussquizfragen | 360 |
| Matching-Exercises | 35 |
| Ordering-Exercises | 25 |
| Select-Best-Exercises | 71 |
| Input-Exercises | 44 |
| CLI-Input-Exercises | 59 |
| Difficulty-Drills | 2 |
| Guided Subnetting | 1 |
| Adaptive Subnetting | 1 |
| Story-Hauptmissionen | 4 |
| autorisierte Cisco-Sidemissions | 4 |

AD: 3 registrierte Lessons, 23 logische Theorieabschnitte (7+8+8), 16 Inline-Frageblöcke (0+8+8), 17 Abschlussquizfragen (5+6+6), **0 exercises**, keine Terminal-/Zustandssimulation. Wegen Stilvarianten ist eine simple „Theorieschritte vs. Fragen“-Quote nur näherungsweise. Der sichere Befund ist: AD besteht aus Theorie/Fragen, nicht aus praktischen Exercises.

---

## 18. Content-Wiederverwendung

| Komponente/System | Einsatz | Wiederverwendbar | Besonderheiten |
|---|---|---|---|
| `LessonRunner` | 42 Lessons | ja | fünf Stile, 8 Exercise-Typen, drei Modi, Resume, TTS. |
| `AcademyTopic` | alle Topics | ja | Sperre, Placeholder, Spezialfall Grundbegriffe. |
| `academyEngine` | Lessons, Missions, Conversations | ja | zentrale Score-/Unlocklogik. |
| `collectQuestionsFromLesson` | Praxis, Fachgespräch, Themencheck | ja | gleiche statische Lesson-Fragen mehrfach genutzt. |
| Knowledge Templates | Mitarbeitergespräche | ja | deterministisch, validierbar, facetbezogen. |
| `ciscoCliEngine` | Haupt-/Side-/prozedurale Missionen | ja | stärkste echte Simulation. |
| `ciscoCli.js` | Academy CLI Inputs | ja, aber nur Sollvergleich | nicht identisch mit Engine. |
| Employee Conversation UI | mehrere Wissensbereiche | ja | unterstützt MC, Ordering, Matching. |
| ObjectivePanel | Workspace | ja | bündelt aktive/Story/Lern-/Sideziele. |
| Office Apps | Workspace | teilweise | Missionskommunikation/Navi, keine Fachsimulation. |

---

## 19. Dopplungen und Inkonsistenzen

### Funktionale Dopplungen

- Drei Frageformate: Lesson, Knowledge Instance, Conversation Legacy; zusätzlich SQLite-Fragen.
- Ordering/Matching jeweils im LessonRunner und Conversation-Komponenten; `OsiOrderExercise.jsx` ist ein weiterer spezifischer Altbaustein.
- Zwei CLI-Systeme plus Academy-CLI-Vergleicher: voller Cisco State Engine, kleines NEXUS-Terminal, Sollzeilenchecker.
- Mehrere Progresswelten: Academy Progress, Legacy Competency, Conversation Mastery, Skill Tree, Backend User Progress.
- Topickatalog `academyTopics` und separate Conversation-Topicregistry.
- Dialoge über LessonRunner, `samHelp`, Corridor/DialogSystem, Employee Conversations, Phone/Story.

### Inkonsistenzen

- Produktname wechselt zwischen CyberLearn, IT-Learn, IT-Admin Simulator.
- Quest/Mission-Terminologie und IDs werden gemischt (`completedQuests`, `/mission`, MissionLog).
- `questData.js` ist nur Metadaten-/Legacy-Registry, Runtime liegt in `missionV2.js`.
- `cisco-main-004` empfiehlt `cisco-packet-tracer/router-on-a-stick`, der Katalog-ID lautet `inter-vlan-routing` (`questData.js:69` vs. `academyTopics.js:146`). Dadurch kann Academy-Praxisscoring für dieses Topic ins Leere laufen.
- AD besitzt neue Kapitelkette und parallel ältere detailtopic-orientierte Kette; beide überlappen in Begriffen (AD Foundation enthält DNS/Kerberos/LDAP/SMB/NTFS, die später eigene Platzhalter sind).
- `virtualbox-lab` als inhaltsloses erstes AD-Gate blockiert vorhandene AD-Lektionen im normalen frischen Flow.
- `relatedMissions`, `availableLessons`, `availableExercises`, `unlockedTools` existieren im Topicmodell, bleiben im statischen Katalog leer; tatsächliche Lessons kommen aus separater Registry.
- Der Backend-Fragen-/XP-Stand und die lokale RPG-/Academy-Progression sind getrennte Systeme.

---

## 20. Wahrscheinlich veraltete, unerreichbare oder ungeklärte Systeme

| Bereich | Kennzeichnung | Begründung |
|---|---|---|
| `Quest.jsx` + klassische Quest-Route | **WAHRSCHEINLICH VERALTET, technisch erreichbar** | `questData.js` sagt, Legacy-Demos entfernt; neue V2-Missionen liegen separat. Route besteht weiter. |
| `components/OsiOrderExercise.jsx` | **WAHRSCHEINLICH VERALTET** | generisches Ordering im LessonRunner vorhanden; aktive Nutzung nicht gefunden. |
| `terminal/scenarios.js` alte Missionen | **WAHRSCHEINLICH VERALTET** | `defaultMissionScenarios` nach Phase-0-Reset leer. |
| `competency.js` | **WAHRSCHEINLICH AKTIV, aber Legacy/parallel** | `gameState.careerForState` liest Competency Overview; nicht mit Academy verschmolzen. |
| `dialogSystem.js` | **UNGEKLÄRT** | parallele Dialogsysteme; statische Analyse weist nicht zweifelsfrei alle Aufrufer nach. |
| `learningObjectives.js` | **TECHNISCH VORHANDEN, LEER** | `learningObjectives` und `foundationalObjectives` leer nach Reset. |
| Game-State-Felder `workday`, `specialization`, `investigatedScenarios`, `generatedTicketHistory`, `contentPackVersion` | **WAHRSCHEINLICH UNGENUTZT/TEILIMPLEMENTIERT** | Definition/Migration vorhanden, keine belastbare aktive Gameplaykette festgestellt. |
| Learning Import | **TEILIMPLEMENTIERT/UNGEKLÄRT** | Route/UI und Statefelder vorhanden; vollständige Aktivierungskette nicht eindeutig. |
| AD Topics 5–18 | **ERREICHBARE PLATZHALTER JE NACH UNLOCK/KURSMODUS** | Katalog/UI vorhanden, keine Lesson. |
| AD Lessons 1–4 | **IMPLEMENTIERT, NORMALFLOW BLOCKIERT** | `virtualbox-lab` ist inhaltsloses Gate. |

---

## 21. Lernziele, Schwierigkeit und Prüfungsbezug

### Lernziele

Ein zentrales explizites Lernzielregister ist leer (`learningObjectives.js`). Topicbeschreibungen fungieren als grobe Ziele. Knowledge Instances tragen `learningObjective`, `knowledgeFacet`, `conceptCluster` und `semanticTags`; diese sind für Fragen/Mastery relevant. Missionen besitzen Requirements/Skills, aber kein einheitliches Lernzielobjekt, das Theorie, Frage und Praxis über alle Systeme verbindet.

**Fazit:** Ein explizites Lernzielmodell existiert im Knowledge Layer auf Frage-/Facetebene und implizit über Topics/Requirements; ein projektweit verbindliches, befülltes Lernzielregister existiert nicht.

### Schwierigkeit

- Knowledge Items: easy/medium/hard; Balancer und Facet Mastery.
- Lesson Difficulty Drill: persistierte Levels 0–2, Prüfung 10 Fragen/80 %.
- Adaptive Subnetting: leistungsabhängige Stufe.
- Mitarbeitergespräch: Stufe steigt/sinkt durch Serien.
- Storymissionen: Difficulty 1–4 Metadatum.
- Prozedurale Missionen: EASY/MEDIUM/HARD anhand jüngster Ergebnisse/Mastery.
- Keine einheitliche globale Difficulty, die alle Systeme synchron steuert.

### Prüfungsbezug

- „Verstehen“: Theorie, Erklärungsstile, Inline-Fragen.
- „Erinnern“: Quiz, Themencheck, Fachgespräch, Perfect Count, Conversations.
- „Anwenden“: Exercises, Subnetting und vor allem Cisco State-Missionen.
- Das Datenmodell unterscheidet Academy-Theorie/Praxis/Retention und Skilldimensionen Knowledge/Configure/Verify/Troubleshoot. Es gibt jedoch kein einheitliches Metadatum „prüfungsrelevant“ über alle Inhalte. AD hat gegenwärtig nur Verstehen/Erinnern, keine echte Anwendung.

---

## 22. UI und Navigation

Routen (`App.jsx:45-66`): Workspace, Legacy Quest, Diagnostic, Side Mission, Mission V2, Procedural Mission, Inbox, Infrastructure, Career, Runbooks, Training Archive, Learning Import, Settings, Academy, Academy Mode, TCP/UDP Placement, Themencheck, Category, Topic.

Workspace ist Full-Bleed und teilt sich in Regal, Arbeitsplatz, Flur und Serverraum. Hotspots öffnen Notebook, Runbooks, Directory, Whiteboard, Workstation/Desktop, Flur und Serverraum. Desktop-Apps umfassen Mail, Telefon, Notebook, Terminal, Directory. ObjectivePanel empfiehlt den höchst priorisierten aktiven/Story-/Lern-/Side-Schritt.

Academy-Navigation:

```text
/academy
→ Kategorieübersicht
→ /academy/:categoryId (Topickarten, Status, Themencheck)
→ /academy/:categoryId/:topicId (Topicstatus + Sam-Moduswahl)
→ LessonRunner oder Platzhalter
```

Fehlergrenze: `ErrorBoundary` um Lessons kann Topic-Lektionszustand zurücksetzen und zurücknavigieren. Android Back wird kontextabhängig abgefangen.

---

## 23. Aktueller Core Game Loop

CyberLearn besitzt zwei gekoppelte Kernschleifen:

```text
Lernschleife:
Academy-Thema wählen
→ Theorie/Praxisfragen/Fachgespräch
→ Topic-Scores und Unlocks
→ Wiederholung über Quiz/Themencheck/Gespräche
```

```text
Simulations-/RPG-Schleife:
NEXUS Workspace
→ Kommunikations-/Objective-Auslöser
→ Cisco-Haupt- oder Nebenmission
→ IOS-Zustand konfigurieren und prüfen
→ XP, Reputation, Skills, Runbook, Welt-/Academyfortschritt
→ nächste Story- oder adaptive Mission
```

Die Kopplung erfolgt über empfohlene Academy-Topics und Activity-Scoring, nicht über einen einheitlichen persistenten Unternehmensressourcenzustand.

---

## 24. Bewertung des IST-Zustands

### Lernqualität

Wissen wird in Cisco-Missionen, CLI-Übungen und Subnetting tatsächlich angewendet. In vielen Academy-Themen wird es gelesen, per Auswahl/Zuordnung erinnert und wiederholt. Echte Verständnisaufgaben entstehen bei Troubleshooting-/Szenariofragen, Subnetting und zustandsbasierter IOS-Validierung. AD ist vollständig lese-/frageorientiert.

### Game-Flow

Interaktion entsteht durch Moduswahl, Erklärungsstile, Exercises, Gespräche, Office-Kommunikation und CLI. Passive Phasen entstehen in langen Explanation-Sequenzen; jede Section erzwingt zwar einen Check, dieser kann bei fehlender Frage nur Selbsteinschätzung sein. Der wiederholte Flow Theorie → Check → nächste Theorie → Quiz ist im Academy-Kern dominant.

### Simulator-Charakter

Der Cisco IOS-Bereich ist eine echte Simulation. Workspace und Unternehmenswelt liefern glaubwürdige Einbettung, sind aber überwiegend Navigation/Anzeige. Academy, Security und AD fühlen sich derzeit eher wie ein interaktives Lernportal an. Linux ist nur Gerüst.

### Persistente Welt

Missionserfolge, Karriere, Reputation, Infrastrukturflags, Runbooks und Skills bleiben erhalten. Konkrete Benutzer, Gruppen, ACLs oder Firmenserverkonfigurationen werden nicht als gemeinsame Welt weitergeführt. Ältere Entscheidungen beeinflussen Unlocks und Auswahl stärker als Ressourcen.

### Fehlerdidaktik

Cisco-Missionen bieten technische Fehlerzustände, Korrektur und gestufte Hinweise. Academy-Fragen bieten überwiegend richtig/falsch plus Erklärung und folgenloses Retry. Mitarbeitergespräche ergänzen Sam-Intervention und schwächenorientierte Auswahl.

### Progression

Neue Cisco-Komplexität, CLI-Modi und prozedurale Skills werden schrittweise freigeschaltet. Academy-Fortschritt schaltet vor allem weiteren Content frei; `applied`/`consolidated` verlangen Missions-/Wiederholungsevents. Viele Platzhalterketten begrenzen den realen Fortschritt. Firmenstufe 4 braucht mehr Hauptmissionen als vorhanden.

---

## 25. Priorisierte Problemliste

### KRITISCH

**Problem:** Regulärer AD-Einstieg blockiert vorhandene Lektionen.  
**Fundstelle:** `academyTopics.js:236-239`; `AcademyTopic.jsx:287-324`; `academyEngine.js:95-107`.  
**Gameplay:** Frischer Normalmodus erreicht AD Foundation nicht über den inhaltslosen VirtualBox-Lab-Platzhalter.  
**Lernen:** implementierte Kapitel bleiben ohne Kursmodus/externen Progressweg verborgen.  
**Technik:** Prerequisite verlangt Fortschritt, Platzhalter erzeugt keinen.

**Problem:** Vier bis fünf parallele Fortschritts-/Fragenwelten.  
**Fundstelle:** `academyProgress.js`, `competency.js`, `skillTree.js`, `conversationMastery.js`, `backend/db.js`.  
**Gameplay:** Fortschritt kann je Ansicht unterschiedlich wirken.  
**Lernen:** Mastery/Retention sind nicht projektweit einheitlich.  
**Technik:** Migration, Synchronisation und Fehleranalyse sind komplex.

### HOCH

**Problem:** AD hat keine echte praktische Aufgabe.  
**Fundstelle:** drei `academyLessons/ad*.js` ohne `exercises[]`; keine AD-Mission/Engine.  
**Gameplay:** kein Benutzer-/Gruppen-/ACL-Handeln.  
**Lernen:** Wissen wird gelesen/abgefragt, nicht in Zustand umgesetzt.  
**Technik:** kein AD-Domänenmodell vorhanden.

**Problem:** Hauptmission 004 referenziert wahrscheinlich falschen Academy-Key.  
**Fundstelle:** `questData.js:69` (`router-on-a-stick`) vs. `academyTopics.js:146` (`inter-vlan-routing`).  
**Gameplay/Lernen:** Mission kann dem vorgesehenen Topic keine Praxispunkte geben.  
**Technik:** stiller Nullpfad in `applyMainMission`.

**Problem:** Große Placeholder-Anteile.  
**Fundstelle:** 66 Topics ohne registrierte `LESSONS`-Registry, davon `grundbegriffe` als eigener Spezialrunner und 65 reine Platzhalter; Linux 16/16, Security 31/36, AD 15/18.  
**Gameplay:** viele Karten enden im Gerüst.  
**Lernen:** Progressionsgraph verspricht Inhalte, die fehlen.  
**Technik:** Unlocks können an inhaltslosen Knoten hängen.

**Problem:** „Praxis“ ist häufig ein MC-Fragenmodus.  
**Fundstelle:** `LessonRunner.jsx:58-69`, `AcademyTopic.jsx:218-230`.  
**Gameplay:** Benennung und Handlungstiefe divergieren.  
**Lernen:** Abruf statt Anwendung.

### MITTEL

**Problem:** Mehrere Frage- und Dialogformate.  
**Fundstelle:** Lesson-Daten, Knowledge Instances, Conversation Legacy, SQLite; `samHelp`, Corridor, DialogSystem.  
**Gameplay:** Feedback verhält sich unterschiedlich.  
**Lernen:** adaptive Mechaniken greifen nicht überall.  
**Technik:** Dopplung und Konvertierungsfelder.

**Problem:** Company Stage 4 nicht erreichbar.  
**Fundstelle:** `officeWorld.js:186-190`, nur vier Hauptmissionen in `questData.js`.  
**Gameplay:** sichtbare langfristige Stufe ohne aktuellen Pfad.  
**Lernen:** keine direkte Auswirkung.  
**Technik:** Content-/Threshold-Drift.

**Problem:** Academy-CLI-Sollvergleich und IOS-State-Engine sind getrennt.  
**Fundstelle:** `ciscoCli.js` vs. `ciscoCliEngine.js`.  
**Gameplay:** gleiche Befehle können anders bewertet werden.  
**Lernen:** Befehlsabschreiben kann genügen.  
**Technik:** doppelte Normalisierung/Validierung.

**Problem:** AD-Inhaltsüberlappung mit späteren Platzhaltern.  
**Fundstelle:** Foundation behandelt DNS/Kerberos/LDAP/SMB/NTFS, Katalog enthält eigene Detailtopics.  
**Gameplay/Lernen:** Progression/Abgrenzung unklar.  
**Technik:** Inhaltszuordnung doppeldeutig.

### NIEDRIG

**Problem:** Produkt-/Quest-/Mission-Benennung uneinheitlich.  
**Fundstelle:** Paketnamen, Keys, Dateinamen, UI.  
**Gameplay:** begriffliche Irritation.  
**Lernen:** gering.  
**Technik:** Navigation und Suche erschwert.

**Problem:** vermutlich alte Komponenten/Statefelder verbleiben.  
**Fundstelle:** `OsiOrderExercise`, leere Terminalscenarios, `workday`, `specialization`, `generatedTicketHistory`.  
**Gameplay/Lernen:** meist keine direkte Wirkung.  
**Technik:** erhöht kognitive Last; Nutzung teilweise ungeklärt.

---

## 26. Positive Bestandteile, die nachweisbar funktionieren

- **Zentraler Academy-Katalog und Engine:** klare Topic-Keys, Cross-Category-Prerequisites, migrationsfähiger Fortschritt, idempotentes Scoring.
- **LessonRunner:** hoher Wiederverwendungsgrad, TTS, Resume, mehrere Erklärungsstile, acht Exercise-Typen, drei Lernmodi.
- **Knowledge Layer:** strukturierte Items, kontrollierte Templates, deterministische RNG, Facet Mastery, semantische History und umfangreiche Validatoren.
- **Cisco IOS Engine:** echte Zustandsänderung, Modus-/Parserlogik, Abkürzungen, Hilfe, Autocomplete, Show-Ausgaben, Verifikation und realistische Korrekturschleife.
- **Gestufte Missionshinweise:** Nudge bis Lösung statt sofortiger Auflösung.
- **Adaptive prozedurale Missionen:** Weakness, Review Due, Zeit, Variety, Difficulty und Anti-Repetition werden berücksichtigt.
- **NEXUS-Einbettung:** stabile Storycharaktere, Kanäle, Stimmen, Workspace, ObjectivePanel, E-Mail/Telefon und Runbook-Folgen.
- **Persistenzmigrationen:** Game State und Academy Progress behandeln ältere Schemas explizit und getrennt.
- **Quantitativ großer vorhandener Contentkern:** 42 Datenlektionen, 328 Sections, 360 Quiz- und 170 Inline-Frageblöcke sowie 238 strukturierte Exercises.
- **AD Source-Klassifizierung:** Knowledge Items können Kursfakt, technische Präzisierung und Vereinfachung trennen; Audit für Kapitel 3+4 ist vorhanden.

---

## 27. Nicht eindeutig klärbare Punkte

1. Ob und wo ignorierte APK-Archive aktuell physisch vorhanden sind.
2. Welche Legacy-Routen/Komponenten in realen Nutzerflüssen noch aktiv aufgerufen werden, ohne die App interaktiv vollständig durchzuspielen.
3. Vollständige Reload-Persistenz jedes Cisco-Missionszwischenzustands.
4. Reichweite von Learning Import, DialogSystem und mehreren reservierten Game-State-Feldern.
5. Ob serverseitiges klassisches Modul-/Fragenportal in der aktuell deployten GitHub-Pages-Version überhaupt verfügbar ist; GitHub Pages kann keinen Express/SQLite-Prozess hosten.
6. Exakte externe Lehrgangskapitelnummern für alle AD-Katalogtopics; der Code modelliert Topics, nicht die vollständige externe Kapitelgliederung.
7. Nutzerindividueller aktueller Progress/Unlockstand; Repository-Code liefert nur Defaults und Algorithmen, nicht den Browser-LocalStorage eines konkreten Geräts.

---

## 28. Quellenindex

Zentrale Belegdateien:

- `frontend/src/App.jsx`
- `frontend/src/pages/Academy.jsx`
- `frontend/src/pages/AcademyCategory.jsx`
- `frontend/src/pages/AcademyTopic.jsx`
- `frontend/src/pages/AcademyThemencheck.jsx`
- `frontend/src/components/LessonRunner.jsx`
- `frontend/src/components/EmployeeConversation.jsx`
- `frontend/src/components/Terminal.jsx`
- `frontend/src/pages/MissionV2.jsx`
- `frontend/src/pages/ProceduralMission.jsx`
- `frontend/src/lib/academyTopics.js`
- `frontend/src/lib/academyLessonData.js`
- `frontend/src/lib/academyProgress.js`
- `frontend/src/lib/academyEngine.js`
- `frontend/src/lib/academyThresholds.js`
- `frontend/src/lib/academyThemencheck.js`
- `frontend/src/lib/academyLessons/*.js`
- `frontend/src/lib/knowledge/index.js`
- `frontend/src/lib/knowledge/types.js`
- `frontend/src/lib/knowledge/templates.js`
- `frontend/src/lib/knowledge/questionGenerator.js`
- `frontend/src/lib/knowledge/semanticBalancer.js`
- `frontend/src/lib/knowledge/facetMastery.js`
- `frontend/src/lib/knowledge/validators.js`
- `frontend/src/lib/employeeConversations.js`
- `frontend/src/lib/samHelp.js`
- `frontend/src/lib/corridorDialogs.js`
- `frontend/src/lib/ciscoCliEngine.js`
- `frontend/src/lib/ciscoCli.js`
- `frontend/src/lib/missionV2.js`
- `frontend/src/lib/missionGenerator.js`
- `frontend/src/lib/ciscoSideMissions.js`
- `frontend/src/lib/questData.js`
- `frontend/src/lib/gameState.js`
- `frontend/src/lib/skillTree.js`
- `frontend/src/lib/competency.js`
- `frontend/src/lib/officeWorld.js`
- `frontend/src/lib/directory.js`
- `frontend/src/lib/objectives.js`
- `frontend/src/lib/terminal/commands.js`
- `frontend/src/lib/terminal/scenarios.js`
- `backend/server.js`
- `backend/db.js`
- `backend/data/seed.js`

---

## Schlussbefund

Der tatsächliche IST-Kern von CyberLearn ist eine Kombination aus datengetriebener Academy, adaptivem Fragen-/Conversation-Layer und einem deutlich simulationsstärkeren Cisco-RPG-Missionssystem. Die Academy ist umfangreich, aber ungleich vollständig: Cisco ist vollständig mit Lektionen besetzt und besitzt echte Missionen; Grundlagen sind weit entwickelt; Informationssicherheit hat fünf große Blocklektionen; Linux ist reines Gerüst; Active Directory hat drei theorie-/fragenbasierte Lektionen hinter einem problematischen Platzhalter-Gate und keine praktische Zustandswelt. Der vorhandene Core Loop ist daher nicht ausschließlich „Theorie → MC“, aber außerhalb Cisco dominiert genau diese Art von Lese-/Frageinteraktion gegenüber persistenter technischer Handlung.
