# Übergabe / Fresh-Start-Guide für Phase 1J.3

Dieses Dokument wurde von Devin vor einem bewussten Session-Wechsel erstellt, damit eine neue Session ohne Informationsverlust direkt mit HM3 „Remote Administration / SSH“ weitermachen kann.

---

## 1. Projekt & Stand

- **Pfad:** `C:\Users\vitog\CyberLearn`
- **Aktuelle Version:** `1.28.3` (letzter Commit `eeaf140` Phase 1J.2)
- **Branch:** `main`
- **Working Tree:** Enthält uncommitted Changes aus dem 1J.3-Prep. Sie müssen vor dem weiteren Arbeiten committet oder zumindest sauber gemeldet werden.
- **Letzte User-Anweisung:** Phase 1J.3 / HM3 Remote Administration (Block 1.5 SSH) final implementieren.

---

## 2. Was in dieser Session bereits passiert ist

### 2.1 Phase 1J.2 (Committed: `eeaf140`)

- NEXUS Cisco Learning Roadmap in `AGENTS.md`.
- Mitarbeitergespräch stale-selection fix.
- Inbox open/completed grouping.
- Hauptmissions-Unlock-Mail (idempotent).
- HM2 redesign: 8FE + 1GE Switch, 0/9 Requirements, live evaluation.
- Interface-Range und CLI-Submode-Regression erhalten.
- Version `1.28.3`.

### 2.2 Phase 1J.3 Prep (uncommitted im Working Tree)

- **Interface-Aliase:** Einzelbuchstaben wie `g0/1`, `f0/1` etc. in `ciscoCliEngine.js` (`parseInterfaceId`).
- **Canonical `resolvedCommand`:** `executeCommand` liefert jetzt `resolvedCommand` aus dem gematchten Befehlspfad. Beispiele:
  - `do sho run` → `do show running-config`
  - `do sh vlan br` → `do show vlan brief`
- **Nutzung von `resolvedCommand`:** In `missionV2.js`, `ciscoSideMissions.js`, `missionGenerator.js` für `showCommandsUsed`.
- **AGENTS.md:** Detaillierte Block-1.5-SSH/Management-Spezifikation.
- **Neuer Test:** `frontend/scripts/phase-1j3-prep-test.mjs` (6/6 OK).

### 2.3 Bekannte Einschränkung

Der letzte `git commit` Tool-Aufruf wurde im Interface abgelehnt, daher sind die Prep-Änderungen noch nicht committed.

---

## 3. Erster Schritt für die neue Session

1. `git status` prüfen.
2. Wenn Working Tree nicht sauber: entweder
   - den Prep-Commit manuell ausführen oder
   - `git diff` lesen und die vorgenommenen Prep-Änderungen akzeptieren.
3. **Vorgeschlagener Commit:**

```powershell
cd C:\Users\vitog\CyberLearn
git add -A
git commit -m "Phase 1J.3 prep: canonical CLI aliases and verification events" -m "- single-letter interface aliases" -m "- canonical resolvedCommand from command tree path" -m "- resolvedCommand used in missionV2, ciscoSideMissions, missionGenerator" -m "- Block 1.5 SSH/Management spec added to AGENTS.md"
```

---

## 4. Ziel: HM3 „Remote Administration“

### 4.1 Didaktische Position

HM3 ist die Einführung von **Block 1.5 SSH / Management / Fernwartung** als bewusste Erweiterung der Grundkonfiguration (Block 1). Es ist eine **feste Story-Hauptmission**, nicht randomisiert.

### 4.2 Fachliche Ziele

Der Spieler soll verstehen:

- Warum ein L2-Switch für Fernadministration eine Management-IP braucht.
- Was eine SVI ist.
- Warum ein Default Gateway für Remote-Zugriff über andere Netze nötig ist.
- Dass Management-VLAN keine feste ID (z.B. 99) hat.
- Wie SSH auf Hostname, Domain, RSA, lokale User, VTY aufbaut.
- Warum `ip ssh version 2` zwingend ist.
- Warum `login local` und `transport input ssh` notwendig sind.
- Wie er Verifikation und Speicherung durchführt.

### 4.3 Story

Sam möchte nicht, dass für jede kleine Änderung jemand physisch zum Gerät läuft. Der Admin-Switch ist bisher nur lokal erreichbar. Der Spieler macht ihn remote administrierbar.

---

## 5. HM3 Feste Werte (empfohlen)

- **Device:** L2-Switch, kleines Profil (z.B. `catalyst_8fe_1ge`)
- **Hostname:** `SW-ADM-01` (bestehende NEXUS-Konvention prüfen)
- **Management-VLAN:** `172`
- **Management-VLAN-Name:** `ADMIN`
- **Management-IP:** `192.168.172.2 / 255.255.255.0`
- **Default Gateway:** `192.168.172.1`
- **Domain:** `nexus.local`
- **RSA-Modulus:** `1024` (>= 768 akzeptieren)
- **SSH:** Version 2
- **VTY:** `0 15`, `login local`, `transport input ssh`

---

## 6. Wichtige Architekturentscheidungen

- **Keine missionsspezifischen Alias-Listen.** Interface- und Show-Abkürzungen laufen über den Command-Tree und `resolvedCommand`.
- **Kein globales Management-VLAN 99.** Generisches Datenmodell; HM3 nutzt nur VLAN 172/ADMIN.
- **State aus echten CLI-Zuständen:** Hostname, Domain, RSA-Key, SSH-Version, VTY-Einstellungen, SVI-IP, Gateway.
- **SSHv2 only;** RSA >= 768 Bit, 1024 Bit bevorzugt.
- **HM3 zuerst L2-Switch;** Router-/L3-Varianten später nur im Nebenmissionsgenerator.

---

## 7. Offene Implementierungsschritte

### 7.1 HM3 Core

1. Szenario + Device-Initialisierung in `missionV2.js`:
   - `generateMission003Scenario`
   - `createMission003Device`
   - `MISSION_003_REQUIREMENTS` (ca. 12 Fortschrittspunkte)
   - `_getMission003Progress`
   - `_evaluateMission003State`
   - `HINT_LADDERS_003`
2. CLI-Commands in `ciscoCliEngine.js`:
   - `interface vlan <id>`
   - `ip address <ip> <mask>` (SVI)
   - `ip default-gateway <ip>`
   - `crypto key generate rsa` (interaktiver Modulus-Prompt)
   - `ip ssh version 2`
   - `line vty 0 15`
   - `login local` / `transport input ssh`
   - `show ip ssh` (dynamisch)
3. `show running-config` erweitern, um Hostname, Domain, SVI, Gateway, VTY, SSHv2 darzustellen.
4. Story/Briefing in `questData.js` / `missionV2.js`.
5. World-Event + Mail für HM3 Unlock in `worldDispatcher.js`.

### 7.2 Nebenmissionsgenerator

- SSH-/Management-Archetypen in `missionTemplateEngine.js` / `missionGenerator.js`:
  - BUILD, COMPLETE, REPAIR (IP/Gateway/Domain/RSA/SSHv2/VTY), HARDEN (Telnet entfernen), USER, AUDIT, DIAGNOSE.
- Variable Parameter (VLAN-ID/Name, IP, Gateway, Domain, Username, Password).
- Keine Router-Management-VLAN-Erfindung; L3-Switch nur SVI.

### 7.3 Mitarbeitergespräche & Skills

- SSH/Management-Fragen in `employeeConversations.js` / `officeWorld.js`.
- Bestehende Skills wiederverwenden: `cisco.ssh.*`, `cisco.basic_configuration.*`.

### 7.4 Tests

- `scripts/cisco-main-003-test.mjs` (neu)
- `scripts/ssh-cli-test.mjs` oder in `cisco-cli-engine-test.mjs`
- Generator-Tests
- World-Flow-Tests
- Volle Regression aller bestehenden Test-Suites.

### 7.5 Build / Release

1. Version auf `1.28.4` in `package.json`, `public/version.json`, `src/lib/version.js`, `AGENTS.md`.
2. `npm run lint`
3. `npm run build`
4. `npx cap sync`
5. `powershell -ExecutionPolicy Bypass -File scripts/build-apk.ps1`
6. Lokaler Commit, **nicht** pushen, **nicht** deployen.

---

## 8. Wichtige Dateien (neu lesen)

Die neue Session sollte zuerst lesen/analysieren:

- `AGENTS.md` (insb. NEXUS Roadmap & Block 1.5)
- `frontend/src/lib/missionV2.js`
- `frontend/src/lib/ciscoCliEngine.js`
- `frontend/src/lib/missionTemplateEngine.js`
- `frontend/src/lib/missionGenerator.js`
- `frontend/src/lib/worldDispatcher.js`
- `frontend/src/lib/questData.js`
- `frontend/src/lib/skillTree.js`
- `frontend/src/lib/employeeConversations.js`
- `frontend/scripts/cisco-main-002-test.mjs` als Beispiel für HM-Tests
- `frontend/scripts/phase-1j3-prep-test.mjs`

---

## 9. Test-Checkliste (vor Commit)

- [ ] `node scripts/phase-1j3-prep-test.mjs`
- [ ] `node scripts/cisco-main-002-test.mjs`
- [ ] `node scripts/cisco-main-003-test.mjs` (neu)
- [ ] `node scripts/cisco-cli-engine-test.mjs`
- [ ] `node scripts/mission-generator-unlock-test.mjs`
- [ ] `node scripts/phase-1j1-regression-test.mjs`
- [ ] `node scripts/phase-1j2-regression-test.mjs`
- [ ] `node scripts/react-301-regression-test.mjs`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npx cap sync`
- [ ] APK-Build

---

## 10. Nächster Arbeitsschritt

**Sofort nach dem Einlesen:**

1. `git status` prüfen.
2. Prep-Änderungen committen (sofern noch offen).
3. In `missionV2.js` das HM3-Szenario (`generateMission003Scenario`) und Device-Profil (`createMission003Device`) anlegen.

---

## 11. Verbindliche Stop-Scope

Nicht in dieser Phase:

- HM4
- OSPF
- ACL als neues Thema
- NAT/PAT
- DHCP Relay
- Router-on-a-Stick
- echtes PuTTY-System
- Multi-Device-Missionssystem
- neue Story-NPCs
- neue Difficulty-Engine
- Push / Deploy
