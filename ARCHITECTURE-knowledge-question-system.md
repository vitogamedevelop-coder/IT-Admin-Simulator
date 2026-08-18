# Architekturbericht: Kontrolliert-dynamisches Fragensystem für NEXUS Academy

**Stand:** Analysephase – keine Codeänderungen, kein Commit, kein Deployment.  
**Ziel:** Aus der bestehenden Academy eine kontrollierte, parametrisierte Wissens- und Fragengenerierung für Mitarbeitergespräche ableiten.

---

## 1. Zusammenfassung des obersten Ziels

Keine freie KI-Generierung zur Laufzeit. Stattdessen:

- Academy-Theorie wird in strukturierte **Knowledge Items** überführt.
- Aus ihnen entstehen **Templates** mit kontrollierten Platzhaltern.
- Parameter werden validiert, Lösungen berechnet oder eindeutig hinterlegt.
- Das Ergebnis wird in den bestehenden Mitarbeiter-/Simulationsflow eingebettet.

### 1.1 Designregel: Lernen soll in der Arbeit versteckt sein

NEXUS ist eine IT-Arbeitssimulation, kein Schulquiz. Die neue Knowledge Engine muss die unterschiedlichen Lernorte des Spiels respektieren und nicht verschwimmen lassen:

| Lernort | Rolle | Beispiel |
|---|---|---|
| **Academy** | Explizites Lernen und Theorie | OSI-Schichten in Lektionsform mit Erklärungen und Übungen. |
| **Sam** | Gezielter Mentor und fachliche Korrektur | Erklärt nach falscher Antwort, warum die gewählte Option nicht stimmt. |
| **Mitarbeitergespräche** | Beiläufige Wissensanwendung | Kollege fragt im Flur: "Wieso landet der PC plötzlich im Gäste-VLAN?" |
| **Hauptmissionen** | Einführung neuer praktischer Themen | SSH-Konfiguration auf einem Switch in einer Story-Mission. |
| **Nebenmissionen** | Anwendung, Wiederholung, Diagnose und Transfer | Ticket: Benutzer erreicht fremde Subnetze nicht. |

Die Knowledge Engine darf diese Rollen nicht vermischen. Sie sorgt dafür, dass Gespräche beiläufig wirken, ohne die fachliche Korrektheit zu opfern. Sie liefert die Werkzeuge, damit ein Kollege "natürlich neugierig" oder "vergesslich" klingt, während er in Wahrheit einen validierten Knowledge Point abfragt.

---

## 2. Liste aller vorhandenen Academy-Themen

### 2.1 Kategorie: fundamentals

| topicId | Titel | Voraussetzungen |
|---|---|---|
| grundbegriffe | Grundbegriffe | – |
| topologien | Topologien | grundbegriffe |
| kommunikation-uebertragung | Kommunikations- und Übertragungsarten | grundbegriffe |
| osi-model | OSI-Modell | – |
| tcp-ip-model | TCP/IP-Modell | osi-model |
| ipv4 | IPv4 | tcp-ip-model |
| binary-system | Binärsystem | – |
| subnet-masks | Subnetzmasken | ipv4, binary-system |
| subnetting | Subnetting | ipv4, binary-system, subnet-masks |
| vlsm | VLSM | subnetting |
| supernetting | Supernetting | vlsm |
| ports | Ports | tcp-ip-model |
| transport-protocols | Transportprotokolle | tcp-ip-model |
| tcp-udp | TCP & UDP | transport-protocols |
| dns | DNS | ports |
| dhcp | DHCP | ports |
| routing | Routing | ipv4 |
| switching | Switching | grundbegriffe |
| vlan-basics | VLAN-Grundlagen | switching |
| inter-vlan-routing | Inter-VLAN Routing | routing, vlan-basics |

### 2.2 Kategorie: cisco-packet-tracer

| topicId | Titel | Voraussetzungen |
|---|---|---|
| grundlagen | Grundlagen | – |
| grundkonfiguration | Grundkonfiguration | grundlagen |
| basic-device-configuration | Grundkonfiguration & IP-Konfiguration | grundlagen |
| vlan | VLAN | fundamentals/switching, fundamentals/ipv4, fundamentals/vlan-basics |
| access-port | Access-Port | vlan |
| trunk | Trunk | vlan |
| router-basics | Router-Grundlagen | trunk |
| static-routing | Statisches Routing | router-basics |
| ospf | OSPF | router-basics, static-routing |
| inter-vlan-routing | Router on a Stick | trunk, router-basics |
| multilayer-switching | Multilayer Switch (MLS) | trunk |
| stp | Spanning Tree Protocol (PVST+) | trunk |
| acl | Access Control Lists | router-basics |
| packet-filter | Paketfilter | acl |
| nat | NAT | router-basics |
| troubleshooting | Troubleshooting | static-routing, inter-vlan-routing, multilayer-switching |
| ssh | Fernwartung mit SSH | static-routing, inter-vlan-routing, multilayer-switching |
| dhcp | DHCP Relay | static-routing, inter-vlan-routing, multilayer-switching, fundamentals/dhcp |

### 2.3 Kategorie: information-security

| topicId | Titel | Voraussetzungen |
|---|---|---|
| security-objectives | Schutzziele | – |
| confidentiality | Vertraulichkeit | security-objectives |
| integrity | Integrität | security-objectives |
| availability | Verfügbarkeit | security-objectives |
| authenticity | Authentizität | security-objectives |
| passwords | Passwörter | – |
| mfa | Multi-Faktor-Authentifizierung | passwords |
| phishing | Phishing | – |
| malware | Malware | – |
| backup | Backup | availability |
| logging | Logging | – |
| firewall-basics | Firewall-Grundlagen | – |
| hardening | Hardening | firewall-basics |
| incident-response | Incident Response | logging |

### 2.4 Kategorie: linux-virtualbox

| topicId | Titel | Voraussetzungen |
|---|---|---|
| virtualbox-basics | VirtualBox-Grundlagen | – |
| start-virtual-machine | Virtuelle Maschine starten | virtualbox-basics |
| terminal | Terminal | start-virtual-machine |
| navigation | Navigation | terminal |
| filesystem | Dateisystem | navigation |
| files-and-directories | Dateien und Verzeichnisse | filesystem |
| users | Benutzer | terminal |
| groups | Gruppen | users |
| permissions | Berechtigungen | navigation, files-and-directories, users, groups |
| processes | Prozesse | terminal |
| services | Dienste | processes |
| package-management | Paketverwaltung | terminal |
| network-commands | Netzwerkbefehle | terminal |
| ssh | SSH | network-commands |
| logs | Logs | filesystem |
| bash-basics | Bash-Grundlagen | terminal |

### 2.5 Kategorie: active-directory-virtualbox

| topicId | Titel | Voraussetzungen |
|---|---|---|
| virtualbox-lab | VirtualBox-Lab | – |
| windows-server | Windows Server | virtualbox-lab |
| domain | Domäne | windows-server |
| domain-controller | Domain Controller | windows-server, domain, fundamentals/ipv4, fundamentals/dns |
| users | Benutzer | domain-controller |
| groups | Gruppen | users |
| organizational-units | Organisationseinheiten | domain-controller |
| group-policy | Gruppenrichtlinien | organizational-units |
| active-directory-dns | AD-integriertes DNS | domain-controller |
| ldap | LDAP | active-directory-dns |
| kerberos | Kerberos | domain-controller |
| shares | Freigaben | domain-controller |
| ntfs-permissions | NTFS-Berechtigungen | shares |

**Hinweis:** Vollständige LessonRunner-Inhalte existieren aktuell vor allem für `fundamentals` und `cisco-packet-tracer`. Die Kategorien `information-security`, `linux-virtualbox` und `active-directory-virtualbox` sind als Topic-Katalog mit Beschreibungen angelegt, besitzen aber noch keine vollständigen Lektionsdateien.

---

## 3. Speicherorte der Theorie

| Ebene | Datei | Inhalt |
|---|---|---|
| Topic-Katalog | `frontend/src/lib/academyTopics.js` | Statische Definition aller Topics, Kategorien, Voraussetzungen, Startstatus. |
| Spielerfortschritt | `frontend/src/lib/academyProgress.js` | Persistenz von Status, Scores, Abschnitts-/Fragen-/Übungs-Completion. |
| Progressions-Engine | `frontend/src/lib/academyEngine.js` | Status-Transitionen, Unlock-Logik, Score-Berechnung. |
| Schwellemwerte | `frontend/src/lib/academyThresholds.js` | Punkte-Deltas und Status-Grenzen. |
| Lektions-Registry | `frontend/src/lib/academyLessonData.js` | Verknüpft topicKey mit Builder-Funktionen. |
| Lektions-Inhalte | `frontend/src/lib/academyLessons/*.js` | Jeweils `buildXxxLesson()` mit explanations, exercises, quiz, summary. |
| Mathematische Hilfsmittel | `frontend/src/lib/networking/ipv4Math.js` | IPv4/Binär/Subnetting-Berechnungen. |
| Parametrische Übungen | `frontend/src/lib/academyLessons/ipv4Generator.js` | Schwierigkeitsgesteuerte IPv4-/Subnetting-Aufgaben mit Tipps. |
| Gesprächs-Engine | `frontend/src/lib/employeeConversations.js` | Auswahl, Cooldown, Archetypes, Mitarbeiter, Sam-Interventionen. |
| Gesprächs-Mastery | `frontend/src/lib/conversationMastery.js` | Zusätzliche Mastery-Tracking pro Topic. |
| Darstellung | `frontend/src/components/EmployeeConversation.jsx` | UI für MC, Ordering, Matching, Zusammenfassung, Deep-Links. |
| Mitarbeiterrollen | `frontend/src/lib/officeWorld.js` | Story-Charaktere mit Rollen und Themen-Gewichtungen. |
| Skill-Tree | `frontend/src/lib/skillTree.js` | Granulare Subskills pro Cisco-Thema. |

---

## 4. Struktur der aktuellen Inhalte

### 4.1 Academy-Lektionen

Jede Lektion ist ein Objekt:

```js
{
  title: '...',
  explanations: [
    { id, title, style: 'classic'|'intuitive'|..., blocks: [
      { type: 'text', content: '...' },
      { type: 'diagram', content: '...' },
      { type: 'list', title: '...', items: [...] },
      { type: 'table', headers: [...], rows: [...] },
      { type: 'question', id, question, options, correct, explanation }
    ]}
  ],
  exercises: [
    { id, type: 'select-best'|'input'|'ordering'|'matching'|'cli-input'|'guided-subnetting'|'difficulty-drill', ... }
  ],
  quiz: [...],
  summary: [...]
}
```

### 4.2 Mitarbeitergespräche

Die Gespräche nutzen denselben Topic-Katalog, aber eine **zweite Content-Datei** (`employeeConversations.js`). Darin wird pro Topic ein `CONVERSATION_TOPICS[key]`-Eintrag gepflegt:

```js
{
  title: '...',
  relatedTopics: [...],
  introPool: [...],
  samHelp: '...',
  questions: [
    { id, difficulty, text, options, correct, explanation }
  ],
  archetypes: [
    { id, type: 'ordering'|'matching'|'mc', concept, difficulty, ... }
  ]
}
```

Das bedeutet: **Lektionswissen und Gesprächswissen liegen heute an zwei Stellen**. Das ist das zentrale Erweiterungspotenzial.

---

## 5. Warum aktuell semantische Wiederholungen entstehen

### 5.1 Technische Ursachen

1. **Cooldown nur auf Archetype-ID-Ebene.**  
   In `pickQuestionForTopic()` wird `historyKey = `${topicKey}/${archetypeId}`` verwendet. Das verhindert exakte Textwiederholungen, aber **nicht** semantische Wiederholungen über verschiedene Archetypes desselben Knowledge Items.

2. **Konzept-Tracking ist rudimentär.**  
   Es gibt zwar `recentConcepts` und `CONCEPT_COOLDOWN_MS`, aber `concept` ist frei wählbar und nicht zentral definiert. Bei OSI erscheinen `osi.layer_order`, `osi.layer_functions`, `osi-1`, `osi-2` usw. als unabhängige Konzepte – obwohl sie alle dieselbe Schicht betreffen.

3. **Themenauswahl bevorzugt das schwächste Topic.**  
   `pickWeakestTopic()` sortiert nach `overall` und wählt aus den drei schwächsten zufällig. Das ist gut für Repetition, aber ohne semantische Distanz kann dasselbe Topic mehrere Gespräche lang dominieren.

4. **Zufälliger Topic-Wechsel innerhalb einer Session ist schwach gewichtet.**  
   `selectNextTopicKey()` versucht zwar verwandte Topics, aber `relatedTopics` sind hartcodiert und es gibt keine Gewichtung nach "wann zuletzt gesehen".

5. **Keine Topic-Balancing über mehrere Sessions hinweg.**  
   Es wird nicht persistiert, wann ein Topic zuletzt in einem Gespräch vorkam. Einzig Archetypes werden im Session- und History-Store erfasst.

6. **Fragen sind statisch und themen-fixiert.**  
   In `questions` sind 4 feste Fragen pro Topic hinterlegt. Wenn ein Topic nur wenige Archetypes hat, rotiert es schnell durch dieselben Konzepte.

### 5.2 Konkrete Beobachtungen

- **OSI Layer 1 / Kabelbruch** kommt häufig, weil mehrere Archetypes auf Layer-Fehlerbilder zurückgreifen, aber nicht gemeinsam als "Layer 1" gewichtet werden.
- **WAN** wird wiederholt, weil `grundbegriffe` ein schwaches Topic bleibt und die vier statischen Fragen darin häufig ziehen.
- **Switching** wiederholt Hub-vs-Switch und MAC-Learning, weil diese Konzepte in mehreren Fragen vorkommen, aber nicht zentral als Cluster erkannt werden.

---

## 6. Wiederverwendbare bestehende Systeme

| System | Wiederverwendbar für |
|---|---|
| `academyTopics.js` + `topicKey()` | Globale Topic-Identifikation, Unlock-Prüfung, Kategoriezuordnung. |
| `academyProgress.js` | Topic-Status, gesehene Inhalte, Quiz-Mastery, Difficulty-Level, Persistence. |
| `academyEngine.js` | `applyConversationPractice`, Status-Transitionen, Unlock-Kaskade. |
| `academyThresholds.js` | Difficulty- und Score-Parameter zentral regeln. |
| `academyLessons/*.js` | Rohstoff für Knowledge Items (Tabellen, Listen, Zusammenfassungen). |
| `ipv4Math.js` | Berechnung von Netz-ID, Broadcast, Hosts, Sprungweite usw. |
| `ipv4Generator.js` | Muster für difficulty-gesteuerte Fragegenerierung. |
| `employeeConversations.js` | Gesamter Flow, Archetype-System, Cooldown, Mitarbeiterauswahl. |
| `conversationMastery.js` | Unabhängiges Mastery-Tracking pro Topic. |
| `officeWorld.js` | Mitarbeiterrollen und Themen-Gewichtungen. |
| `skillTree.js` | Feinkörnige Subskills; kann als Concept-Map dienen. |
| `EmployeeConversation.jsx` | MC/Ordering/Matching-UI; braucht nur neue Question-Types. |
| `LessonRunner.jsx` | Vorhandene Übungstypen `input`, `select-best`, `ordering`, `matching`, `guided-subnetting`, `difficulty-drill`. |

**Fazit:** Es muss keine neue Quiz-App gebaut werden. Die Engine kann erweitert werden.

---

## 7. Knowledge-Item-Typen aus dem echten Academy-Content

Anhand der Lektionsdateien lassen sich folgende Typen ableiten:

| Typ | Beispiele aus der Academy |
|---|---|
| DEFINITION | Was ist ein VLAN? Was ist Routing? |
| RELATION | VLAN trennt Broadcast-Domäne; SSH verschlüsselt, Telnet nicht. |
| ORDER | OSI-Schichten, TCP-Three-Way-Handshake, MAC-Learning-Schritte, DHCP-DORA. |
| MAPPING | OSI-Schicht ↔ Name, OSI-Schicht ↔ Gerät, Port ↔ Dienst, TCP/UDP ↔ Eigenschaft. |
| CALCULATION | Binär ↔ Dezimal, Netz-ID, Broadcast, nutzbare Hosts, Sprungweite. |
| RANGE | Gültige IPv4-Oktette 0–255, Präfixe /0–/32. |
| CAUSE_EFFECT | Kabelbruch → Layer 1; falscher Default Gateway → fremde Netze nicht erreichbar. |
| COMPARE | Hub vs. Switch vs. Router, TCP vs. UDP, statisch vs. dynamisch, Telnet vs. SSH. |
| PROCEDURE | SSH-Konfigurationsreihenfolge, DHCP-DORA, Router-Weiterleitungsentscheidung. |
| TROUBLESHOOT | SSH-Verbindung abgelehnt → RSA-Key/SSHv2 fehlt; Ping geht, SSH nicht → VTY/login. |
| PROPERTY | Eigenschaften eines /24-Netzes, Eigenschaften von Vollduplex. |
| EXAMPLE | Stern-Topologie in modernen Büro-LANs, Bus in alten Koaxialnetzen. |

---

## 8. Pro Academy-Thema: geeignete Items, Fragetypen, Generatoren

### 8.1 OSI-Modell

- **Knowledge Items:** 7 Schichten mit `num`, `de`, `en`, `pdu`, `devices`, `protocols`, `examples`, `mnemonic`, `task`, `analogy`.
- **Question Types:** MAPPING (Schicht ↔ Name, Gerät, PDU, Protokoll), ORDER (Schichten sortieren), SELECT-BEST (Fehlerbild → Schicht), COMPARE (OSI ↔ TCP/IP).
- **Parametric:** Schichtnummer `1–7` als Parameter.
- **Calculation:** Keine.
- **Scenario:** "Ein Kabel ist durchtrennt – welche Schicht prüfst du zuerst?"
- **Premium:** Kapselung/Entkapselung als konzeptionelle Transferfrage.

### 8.2 TCP/IP-Modell

- **Knowledge Items:** 4 Schichten (Netzzugang, Internet, Transport, Anwendung), Mapping zu OSI-Schichten.
- **Question Types:** MAPPING, COMPARE (TCP/IP ↔ OSI), SELECT-BEST.
- **Parametric:** Schicht als Parameter.
- **Scenario:** "HTTP läuft auf welcher TCP/IP-Schicht?"

### 8.3 Netzwerkgrößen (Topologien)

- **Knowledge Items:** Bus, Ring, Stern, Baum, Vermascht mit `resilience`, `cost`, `scalability`, `advantages`, `disadvantages`.
- **Question Types:** MAPPING, SELECT-BEST (Single Point of Failure, Ausfallsicherheit), COMPARE.
- **Parametric:** Topologie als Parameter.
- **Scenario:** "Neuer Standort: Welche Topologie bietet höchste Ausfallsicherheit, ist aber teuer?"

### 8.4 Binärsystem

- **Knowledge Items:** 8 Bit-Werte `128, 64, 32, 16, 8, 4, 2, 1`.
- **Question Types:** CALCULATION (Binär ↔ Dezimal, Dezimal ↔ Binär), ORDER (Bitwerte sortieren).
- **Parametric:** Zahl 0–255.
- **Scenario:** "Subnetting steht an: 11000000 ist wie viel?"

### 8.5 IPv4

- **Knowledge Items:** Oktett-Struktur, private Bereiche, Loopback, APIPA, Multicast, CIDR-Präfix.
- **Question Types:** CALCULATION/IDENTIFICATION (gültige/ungültige Adressen, privat/öffentlich), MAPPING (Präfix ↔ Maske), SELECT-BEST (Sonderadressen).
- **Parametric:** IP, Präfix.
- **Generator:** `ipv4Generator.js` kann direkt wiederverwendet/adaptiert werden.

### 8.6 Subnetting

- **Knowledge Items:** Netz-ID, Broadcast, erster/letzter Host, nutzbare Hosts, Sprungweite, relevantes Oktett.
- **Question Types:** CALCULATION (alle obigen Werte), SELECT-BEST (Fehler finden).
- **Parametric:** IP + Präfix.
- **Generator:** `ipv4Math.js` + `ipv4Generator.js` liefern exakte Lösungen und Distraktoren.

### 8.7 Switching

- **Knowledge Items:** Switch, Hub, Router, MAC-Adresstabelle, Forward/Flood/Filter, Kollisions-/Broadcastdomäne.
- **Question Types:** COMPARE (Hub/Switch/Router), ORDER (MAC-Learning), MAPPING (Aktion → Situation), SELECT-BEST.
- **Parametric:** Gerät oder Situation.
- **Scenario:** "Switch kennt Ziel-MAC nicht – was passiert?"

### 8.8 VLAN

- **Knowledge Items:** VLAN-Definition, Access-/Trunk-Port, 802.1Q-Tagging, Broadcast-Domäne.
- **Question Types:** COMPARE, MAPPING, SELECT-BEST, TROUBLESHOOT.
- **Parametric:** VLAN-ID aus kontrolliertem Pool.
- **Scenario:** "Host im falschen Netz nach Portwechsel – woran liegt's?"

### 8.9 Ports

- **Knowledge Items:** Dienst ↔ Port (HTTP 80, HTTPS 443, SSH 22, Telnet 23, DNS 53, DHCP 67/68, FTP 20/21).
- **Question Types:** MAPPING (bidirektional), SELECT-BEST.
- **Parametric:** Port oder Dienst.
- **Scenario:** "Browser ruft Seite ab – welcher Port am Server?"

### 8.10 SSH

- **Knowledge Items:** Telnet vs. SSH, RSA-Key-Abhängigkeiten, SSHv2, VTY-Konfiguration, Management-SVI, Fehler-Symptome.
- **Question Types:** COMPARE, PROCEDURE (Reihenfolge), TROUBLESHOOT, SELECT-BEST.
- **Parametric:** Gerätetyp (Router/L2-Switch/MLS), Management-VLAN-ID.
- **Scenario:** "Ping geht, SSH wird sofort abgelehnt – was fehlt?"

### 8.11 Simulations-Flow-Checkliste pro Question Family

Für jede Fragenfamilie muss nicht nur geklärt werden, *welche* Frage möglich ist, sondern auch, *wie* derselbe Knowledge Point in einem glaubwürdigen NEXUS-Gespräch auftaucht.

| Question Family | Direkte Rückfrage | NEXUS-Kontext |
|---|---|---|
| **OSI Layer → Name** | "Wie heißt OSI-Schicht 2?" | *Mara:* "Ich habe wieder Schicht 2 und Schicht 3 verwechselt. Auf welcher Schicht arbeitet ein Switch nochmal?" |
| **OSI Fehler → Schicht** | "Auf welcher Schicht sucht man bei Kabelbruch?" | *David:* "Der Techniker sagt, das Kabel ist nicht eingesteckt. Ich vermute Schicht 1, oder?" |
| **TCP/IP ↔ OSI** | "Welche TCP/IP-Schicht entspricht OSI Layer 3?" | *Mara:* "Ich lerne gerade für die Prüfung. OSI Vermittlung ist im TCP/IP-Modell die Internet-Schicht, richtig?" |
| **Topologie → Eigenschaft** | "Welche Topologie ist am ausfallsichersten?" | *Thomas:* "Für den neuen Standort will ich keine teure Lösung, aber auch keinen Single Point of Failure. Was wäre der Kompromiss?" |
| **Binär → Dezimal** | "Wie viel ist 11000000?" | *David:* "Ich prüfe gerade die Subnetzmaske. 11000000 sind 192, oder?" |
| **IPv4 privat/öffentlich** | "Ist 192.168.5.20 privat?" | *Aylin:* "Diese IP sollte nicht ins Internet geroutet werden können. Liegt sie im privaten Bereich?" |
| **Subnetting Netz-ID** | "Netz-ID von 192.168.10.130/26?" | *Mara:* "Für die Dokumentation des neuen Büros brauche ich die Netzadresse. 192.168.10.130/26 gehört zu welchem Netz?" |
| **Switch Forward/Flood/Filter** | "Was macht ein Switch bei unbekannter Ziel-MAC?" | *David:* "Mein Switch sendet plötzlich an alle Ports. Bedeutet das, er kennt die Ziel-MAC nicht?" |
| **VLAN Access vs. Trunk** | "Was transportiert ein Trunk-Port?" | *Mara:* "Zwischen unseren Switchen läuft nur ein Kabel, aber mehrere VLANs sollen durch. Trunk reicht, oder?" |
| **Port → Dienst** | "Welcher Port wird für HTTPS verwendet?" | *Thomas:* "Die Firewall-Regel soll verschlüsselten Webverkehr erlauben. TCP 443, korrekt?" |
| **TCP vs. UDP** | "Wann nimmt man UDP?" | *Aylin:* "Das neue Videokonferenzsystem ruckelt. Sollte das nicht lieber UDP nutzen?" |
| **SSH Troubleshooting** | "SSH abgelehnt trotz Ping – was fehlt?" | *David:* "Ich erreiche den Router per Ping, aber SSH bricht sofort ab. RSA-Key oder SSH-Version?" |
| **DHCP DORA** | "Was ist der erste DHCP-Schritt?" | *Mara:* "Ein Client bekommt keine IP. Der erste Schritt ist ein Broadcast-Discover, oder?" |
| **Routing Next Hop** | "Was ist der Next Hop?" | *Thomas:* "Die Route ins andere Büro zeigt auf 192.168.100.1. Das ist der nächste Router, richtig?" |

**Regeln für den NEXUS-Kontext:**

- Die Story darf die Lösung nicht verraten.
- Nicht jede Frage braucht eine Story; direkte Rückfragen bleiben erlaubt.
- Der Mitarbeiter darf ruhig eine falsche Annahme oder Unsicherheit ausdrücken.
- Der fachliche Kern der Antwort bleibt identisch, unabhängig von der Einbettung.

---

## 9. Beispiel-Knowledge-Items

### 9.1 OSI

```js
{
  id: 'osi.layer1',
  topicKey: 'fundamentals/osi-model',
  type: 'MAPPING',
  layer: 1,
  name: 'Bitübertragungsschicht',
  en: 'Physical Layer',
  pdu: 'Bits',
  devices: ['Netzwerkkarte', 'Hub', 'Repeater', 'Kabel'],
  protocols: ['Ethernet-PHY', 'USB', 'Bluetooth-PHY', 'DSL'],
  responsibility: 'Physische Übertragung von Signalen, Kabel, Stecker, LEDs.',
  typicalFaults: ['Kabelbruch', 'nicht eingestecktes Kabel', 'defekter Port'],
  related: ['osi.layer2']
}
```

### 9.2 TCP/IP

```js
{
  id: 'tcpip.layer.internet',
  topicKey: 'fundamentals/tcp-ip-model',
  type: 'MAPPING',
  layer: 2, // Internet
  name: 'Internet',
  osiEquivalent: [3], // Vermittlung
  responsibility: 'IP-Adressierung und Routing zwischen Netzen.',
  protocols: ['IPv4', 'IPv6', 'ICMP', 'OSPF', 'BGP'],
  typicalFaults: ['Falsche IP', 'Fehlende Route', 'Falsches Gateway']
}
```

### 9.3 Netzwerkgrößen / Topologien

```js
{
  id: 'topology.mesh',
  topicKey: 'fundamentals/topologien',
  type: 'PROPERTY',
  name: 'Vermascht',
  resilience: 'sehr hoch',
  cost: 'hoch',
  scalability: 'gut, aber quadratischer Aufwand bei Vollvermaschung',
  useCases: ['Rechenzentrum', 'Internet-Backbone', 'kritische Infrastruktur'],
  typicalFault: 'Kein Single Point of Failure, aber viele Verbindungen zu verwalten.'
}
```

### 9.4 Binär

```js
{
  id: 'binary.bitValues',
  topicKey: 'fundamentals/binary-system',
  type: 'ORDER',
  values: [128, 64, 32, 16, 8, 4, 2, 1],
  rule: 'Ein Oktett hat 8 Bit; gesetzte Bits addieren sich.'
}
```

### 9.5 IPv4

```js
{
  id: 'ipv4.special.loopback',
  topicKey: 'fundamentals/ipv4',
  type: 'PROPERTY',
  range: '127.0.0.0/8',
  typical: '127.0.0.1',
  meaning: 'Gerät spricht mit sich selbst.'
}
```

### 9.6 Subnetting

```js
{
  id: 'subnetting.block',
  topicKey: 'fundamentals/subnetting',
  type: 'CALCULATION',
  params: ['ip', 'prefix'],
  targets: ['network', 'broadcast', 'firstHost', 'lastHost', 'usableHosts', 'jumpSize'],
  validator: 'ipv4Math.js'
}
```

### 9.7 Switching

```js
{
  id: 'switching.forwardFloodFilter',
  topicKey: 'fundamentals/switching',
  type: 'CAUSE_EFFECT',
  cases: [
    { condition: 'Ziel-MAC bekannt', action: 'Forward' },
    { condition: 'Ziel-MAC unbekannt oder Broadcast', action: 'Flood' },
    { condition: 'Quelle und Ziel am selben Port', action: 'Filter' }
  ]
}
```

### 9.8 VLAN

```js
{
  id: 'vlan.accessVsTrunk',
  topicKey: 'fundamentals/vlan-basics',
  type: 'COMPARE',
  items: [
    { name: 'Access-Port', carries: 'genau ein VLAN', endpoint: 'Endgerät' },
    { name: 'Trunk-Port', carries: 'mehrere VLANs', endpoint: 'Switch ↔ Switch/Router', tagging: '802.1Q' }
  ]
}
```

### 9.9 Ports

```js
{
  id: 'ports.https',
  topicKey: 'fundamentals/ports',
  type: 'MAPPING',
  service: 'HTTPS',
  port: 443,
  protocol: 'TCP',
  purpose: 'Verschlüsselte Webkommunikation'
}
```

### 9.10 SSH

```js
{
  id: 'ssh.telnetVsSsh',
  topicKey: 'cisco-packet-tracer/ssh',
  type: 'COMPARE',
  items: [
    { name: 'Telnet', port: 23, encrypted: false, status: 'veraltet/unsicher' },
    { name: 'SSH', port: 22, encrypted: true, status: 'Standard für Fernwartung' }
  ]
}
```

---

## 10. Beispiel-Templates mit Parametern

### 10.1 OSI Layer → Name

```
"Wie heißt die OSI-Schicht [LAYER]?"
Parameter: LAYER ∈ {1..7}
Lösung: knowledgeItem.name
Distraktoren: andere zulässige Schichtnamen
```

### 10.2 Name → OSI Layer

```
"Auf welcher OSI-Schicht arbeitet primär die [NAME]?"
Parameter: NAME aus Schicht- oder Gerätenamen
Lösung: knowledgeItem.layer
```

### 10.3 Fehlerbild → Schicht

```
"Ein Techniker stellt fest, dass ein Kabel nicht eingesteckt ist. Auf welcher OSI-Schicht beginnst du die Diagnose?"
Parameter: Fehlerbild aus knowledgeItem.typicalFaults
Lösung: knowledgeItem.layer
```

### 10.4 Binär → Dezimal

```
"Wie lautet die Dezimalzahl für [BINARY]?"
Parameter: BINARY ∈ 8-Bit-String
Lösung: parseInt(BINARY, 2)
Distraktoren: mathematisch nahe liegende Fehler
```

### 10.5 Subnetting Netz-ID

```
"Wie lautet die Netz-ID von [IP]/[PREFIX]?"
Parameter: IP (private), PREFIX ∈ {16..30} je Difficulty
Lösung: calculateNetworkId(IP, PREFIX)
Distraktoren: Broadcast, IP selbst, benachbarter Block
```

### 10.6 Port ↔ Dienst

```
"Welcher Dienst nutzt typischerweise Port [PORT]?"
Parameter: PORT aus gelernten Ports
Lösung: service
Distraktoren: andere gelernte Ports
```

### 10.7 Switch-Aktion

```
"Ein Switch empfängt einen Frame mit unbekannter Ziel-MAC. Was tut er?"
Parameter: situation
Lösung: Flood (an alle Ports außer Eingang)
```

### 10.8 SSH-Troubleshooting

```
"Das Gerät antwortet auf Ping, aber SSH wird sofort abgelehnt. Was fehlt wahrscheinlich?"
Parameter: symptom
Lösung: RSA-Schlüssel fehlt oder SSH nicht aktiviert
```

---

## 11. Mitarbeiter-/Arbeitssituationen aus denselben Knowledge Items

### 11.1 OSI Layer 1

- **Helpdesk-Mara:** "Der User sagt, sein Kabel wäre nicht richtig eingesteckt. Auf welcher Schicht fange ich an?"
- **Entwickler-David:** "Unser Sensor bekommt kein Signal mehr. OSI-technisch – wo suchen wir zuerst?"

### 11.2 Subnetting

- **Helpdesk-Mara:** "Ein Rechner in 192.168.10.130/26 soll auf 192.168.10.200 zugreifen. Sind die im selben Netz?"
- **Geschäftsführung-Thomas:** "Wir planen ein neues Büro. Wie viele Hosts passen in ein /26?"

### 11.3 SSH

- **Aylin Personal:** "Warum dürfen wir Telnet nicht mehr für die Routerwartung verwenden?"
- **David Entwicklung:** "Ich bekomme beim Verbindungsversuch sofort einen Reset. RSA-Key fehlt?"

### 11.4 VLAN

- **Mara:** "Ein PC wurde umgezogen und landet plötzlich im Gäste-VLAN. Wo schaue ich?"
- **Thomas:** "Können wir Buchhaltung und Produktion am selben Switch physisch trennen, ohne zwei Switches zu kaufen?"

### 11.5 Designregel: Mitarbeiter sind keine Prüfer

Mitarbeitergespräche müssen sich wie natürliche Gespräche im IT-Arbeitsalltag anfühlen. Multiple Choice ist nur die UI-Form, nicht der sprachliche Stil.

Erlaubte Mitarbeiter-Verhaltensweisen:

- **Neugierig:** "Ich habe gelesen, dass VLANs Broadcast-Domänen trennen. Stimmt das?"
- **Vergesslich:** "Ich verwechsle ständig TCP und UDP. Was war nochmal der wichtigste Unterschied?"
- **Problem meldend:** "Der User kommt nicht ins andere Netz. Gateway prüfen?"
- **Zweite Meinung suchend:** "Ich habe das Management-VLAN auf VLAN 50 gelegt. Macht das Sinn?"
- **Falsche Annahme äußernd:** "Ein Hub leitet doch auch gezielt weiter, oder?"

Nicht erwünscht sind prüfungsartige Formulierungen wie:

- "Frage 3: Welche der folgenden Aussagen ist korrekt?"
- "Was ist die Definition von X?"
- "Ordne die folgenden Begriffe zu."

Wenn ein natürlicher Kontext möglich ist, wird er bevorzugt. Kurze direkte Rückfragen bleiben erlaubt, aber sie sollen eher "Kollegen-Rückfrage" als "Prüferfrage" klingen.

---

## 12. Konzept: Semantic Cooldown

### 12.1 Was wird getrackt?

Statt nur `topicKey/archetypeId`:

```js
historyEntry = {
  topicKey,
  knowledgeItemId,   // z.B. 'osi.layer1'
  conceptCluster,    // z.B. 'osi.layer1', 'subnetting.calculation', 'vlan.accessTrunk'
  questionType,      // 'mapping', 'ordering', 'scenario', 'calculation'
  askedAt,
  correct,
  difficulty
}
```

### 12.2 Cooldown-Regeln

- **Gleiches Knowledge Item:** starke Herabgewichtung für z.B. 5–10 Minuten.
- **Gleicher Concept Cluster:** moderate Herabgewichtung.
- **Gleicher Question Type:** leichte Herabgewichtung.
- **Falsche Antwort:** Das Item darf **schneller** wieder kommen (spaced repetition), aber bevorzugt mit anderem Template oder Perspektive.

### 12.3 Bidirektionale Mappings

`443 → HTTPS` und `HTTPS → 443` nutzen dasselbe Knowledge Item. Der Cooldown muss **beide Richtungen** gemeinsam erfassen, nicht nur die jeweilige Archetype-ID.

---

## 13. Konzept: Topic Balancing

### 13.1 Gewichtungsfaktoren

```js
weight(topic) =
  baseWeight(topic.weakness) *          // niedriger Score → höher
  recencyPenalty(topic.lastSeen) *      // kürzlich gesehen → niedriger
  masteryPenalty(topic.mastery) *       // bereits konsolidiert → niedriger
  difficultyFit(topic, playerLevel) *  // passende Schwierigkeit → höher
  roleAffinity(topic, employee)         // leichte Rolle-Boni
```

### 13.2 Praktische Regeln

1. Nur `unlocked` Topics sind wählbar.
2. Kürzlich im Gespräch verwendete Topics erhalten einen starken Malus.
3. Mastered Topics werden seltener, aber nicht vollständig ausgeschlossen (Wiederholung).
4. Topics mit niedrigem `overall` Score werden bevorzugt, aber nicht monopolisiert.
5. In einem Gespräch: 60–70 % verwandte Konzepte, 30–40 % natürlicher Themenwechsel.

---

## 14. Konzept: Concept Clusters innerhalb eines Gesprächs

### 14.1 Cluster-Definition

Ein Cluster ist eine Menge von Knowledge Items, die fachlich nah beieinander liegen:

- **OSI-Cluster:** `osi.layer1`, `osi.layer2`, `osi.layer3`, `osi.layer4`
- **Switching-Cluster:** `switching.macLearning`, `switching.forwardFloodFilter`, `switching.collisionDomain`
- **SSH-Cluster:** `ssh.telnetVsSsh`, `ssh.rsaKey`, `ssh.vty`, `ssh.managementSvi`

### 14.2 Gesprächsverlauf

1. Starte mit einem schwachen Item aus einem Cluster.
2. Wähle die nächste Frage zu 60–70 % aus demselben Cluster, aber einem **anderen** Knowledge Item.
3. Mit 30–40 % Wahrscheinlichkeit wechsle in einen verwandten Cluster.
4. Verhindere, dass innerhalb desselben Clusters dasselbe Knowledge Item zweimal direkt hintereinander kommt.

---

## 15. Difficulty-Integration

### 15.1 Bestehende Difficulty

- `academyProgress.js` speichert pro Topic `difficultyLevel: 0|1|2` (easy/medium/hard).
- `academyThresholds.js` definiert Score-Deltas.
- `ipv4Generator.js` zeigt bereits ein dreistufiges Difficulty-System.

### 15.2 Difficulty pro Knowledge Item

Jedes Knowledge Item sollte eine **natürliche Schwierigkeit** erhalten:

| Difficulty | Merkmale |
|---|---|
| easy | Reines Erkennen/Definition, wenige Distraktoren, direkte Rückfrage. |
| medium | Zusammenhang, Vergleich, einfache Berechnung, einfache Arbeitssituation. |
| hard | Troubleshooting, Transfer, mehrere Fakten, komplexe Berechnung, Begründung. |

### 15.3 Difficulty passt sich an

- Bei korrekten Antworten: Fragen im selben Cluster schwerer.
- Bei falschen Antworten: Einfachere Perspektive auf dasselbe Item oder ein leichteres verwandtes Item.
- Nicht stufenlos erschweren, sondern innerhalb des Items schwierigere Templates wählen.

---

## 16. Academy-Unlock-Integration

### 16.1 Harte Grenzen

- Ein Knowledge Item darf nur abgefragt werden, wenn sein `topicKey` mindestens `available` ist.
- Kombinierte Fragen (z.B. OSI ↔ TCP/IP Mapping) erfordern **beide** Topics freigeschaltet.
- SSH-Troubleshooting erfordert `cisco-packet-tracer/ssh` oder mindestens dessen Voraussetzungen.

### 16.2 Umsetzung

```js
function isKnowledgeItemUnlocked(item) {
  const topic = getFullTopic(item.categoryId, item.topicId);
  return topic.status !== 'locked' || readAcademyMode().mode === 'course';
}
```

### 16.3 Dynamische Erweiterung

Wenn neue Academy-Themen hinzukommen, können sie automatisch Knowledge Items beisteuern, sofern die Metadaten in der Lesson-Datei oder im Knowledge Layer hinterlegt sind.

---

## 17. Mitarbeiterrollen-Integration

### 17.1 Bestehende Rollen

- **Mara (Helpdesk):** DHCP, DNS, Berechtigungen → eher Symptome, Benutzerprobleme, Erreichbarkeit.
- **David (Entwicklung):** DNS, Datenbanken, Automatisierung → eher Zusammenhänge, Ports, Kommunikation.
- **Aylin (Personalabteilung):** Berechtigungen, Active Directory, IT-Sicherheit → eher Richtlinien, Zugriff.
- **Thomas (Geschäftsführung):** Backup, Change Management, Infrastruktur → eher Risiko, Auswirkung.

### 17.2 Gewichtung (keine harte Einschränkung)

- Die Rolle beeinflusst die **Wahrscheinlichkeit** von Szenario-Templates.
- Helpdesk → mehr Symptom-/Troubleshooting-Fragen.
- Entwicklung → mehr Port-/Protokoll-/Kommunikationsfragen.
- Geschäftsführung → mehr Risiko-/Auswirkungsfragen.

### 17.3 Natürliche Situationen

Die Rolle bestimmt den **Einstieg**, nicht die fachliche Antwort. Die Antwort bleibt academy-konform.

---

## 18. Sam-Interventionen

### 18.1 Bestehender Mechanismus

- Bei falscher Antwort erscheint `pickSamStageDirection()` + `samExplanation = question.explanation`.
- Die Erklärung kommt aus dem Archetype/Question.

### 18.2 Verbesserungen

- Erklärungen sollten auf das **gewählte Distraktor-Argument** eingehen, nicht nur allgemein richtig sein.
- Bei Modellvergleichen (OSI ↔ TCP/IP) müssen **beide Modelle** explizit benannt werden.
- Erklärungen sollten kurz genug für den Gesprächsflow sein.
- Bei Berechnungsfragen: Schrittweise, aber kompakt.

---

## 19. Ambiguitäts-Schutz

### 19.1 Template-Regeln

- Jedes Template muss das **Modell** nennen, wenn es relevant ist (OSI, TCP/IP, IPv4).
- "Schicht" ohne Kontext ist verboten.
- "Layer 3" ohne Modellbezeichnung ist verboten.
- Vergleichsfragen müssen beide Vergleichsobjekte nennen.

### 19.2 Beispiele

- SCHLECHT: "Welche Schicht entspricht Layer 3?"
- GUT: "Welche Schicht des TCP/IP-Modells entspricht ungefähr der Vermittlungsschicht (Layer 3) des OSI-Modells?"

---

## 20. Distraktor-System

### 20.1 Quellen für Distraktoren

1. **Sibling Knowledge Items:** andere OSI-Schichten, andere Ports, andere Topologien.
2. **Kontrollierte Alternative Values:** z.B. benachbarte /24-Blöcke bei Subnetting.
3. **Mathematisch erzeugte Fehlerwerte:** Netz-ID + 1, Broadcast − 1, Sprungweite falsch.
4. **Verlocker:** aus der Academy bekannte, aber hier nicht passende Begriffe.

### 20.2 Distraktor-Validierung

- Kein Distraktor darf unter irgendeinem plausiblem Gesichtspunkt ebenfalls richtig sein.
- Bei Berechnungen: mindestens zwei plausibel falsche Werte erzeugen und prüfen, dass sie sich von der Lösung und voneinander unterscheiden.
- Bei Mappings: Distraktoren müssen aus demselben Wertebereich stammen (andere Schichten, andere Ports).

---

## 21. Entscheidung: Knowledge Layer vs. Academy-Metadaten vs. Hybrid

### 21.1 Option A: Knowledge Items direkt in Academy-Lektionen

**Vorteile:**
- Single Source of Truth für fachlichen Inhalt.
- Neue Lektion = automatisch neue Gesprächsinhalte.
- Keine separate Wartung.

**Nachteile:**
- Lektionsdateien werden größer und komplexer.
- Gesprächs-spezifische Metadaten (Distraktor-Gruppen, Scenario-Templates, Cooldown-Cluster) passen nicht gut in reine Lektionsinhalte.

### 21.2 Option B: Zentraler Knowledge Layer

**Vorteile:**
- Klare Trennung von Lerninhalten und Gesprächsgenerierung.
- Einfacheres Testing und Balancing.
- Knowledge Items können aus mehreren Quellen gespeist werden.

**Nachteile:**
- Gefahr der Duplikation mit Lektionsinhalten.
- Zusätzliche Datei, die gepflegt werden muss.

### 21.3 Option C: Hybrid (empfohlen)

**Konzept:**
- Die Academy-Lektionen bleiben die **fachliche Quelle**.
- Aus jeder Lektion wird beim Build oder zur Laufzeit eine **Knowledge-Map** extrahiert.
- Gesprächs-spezifische Ergänzungen (Templates, Scenarios, Distraktor-Gruppen, Cluster) werden in einer separaten, schlanken **Conversation-Knowledge-Erweiterung** gepflegt.

**Vorteile:**
- Lektionsinhalte und Gesprächsinhalte bleiben synchronisierbar.
- Gesprächs-Engine hat optimierte Datenstrukturen.
- Erweiterbar ohne Lektionsdateien zu überladen.

**Empfohlene Entscheidung:** Option C – Hybrid.

---

## 22. Existierende Dateien, die später geändert werden müssten

### 22.1 Kern-Engine

- `frontend/src/lib/employeeConversations.js`
  - Archetype-Generierung erweitern.
  - Semantic Cooldown einbauen.
  - Topic Balancing verbessern.
  - Concept Cluster Berücksichtigung.
- `frontend/src/lib/conversationMastery.js`
  - Auf Knowledge-Item-Ebene tracken.
- `frontend/src/lib/academyEngine.js`
  - Ggf. neuer Event-Typ für "knowledge item practiced".
- `frontend/src/lib/academyThresholds.js`
  - Ggf. Difficulty-Parameter für Gespräche.

### 22.2 Inhalte

- `frontend/src/lib/academyLessons/*.js`
  - Knowledge-Metadaten ergänzen (optional, falls Hybrid).
- `frontend/src/lib/academyLessonData.js`
  - Ggf. neue Knowledge-Map-Exporte.

### 22.3 Darstellung

- `frontend/src/components/EmployeeConversation.jsx`
  - Neue Question-Types (z.B. `input` für Gespräche).
- `frontend/src/components/ConversationOrdering.jsx`
- `frontend/src/components/ConversationMatching.jsx`

### 22.4 Tests

- `frontend/scripts/phase-1i-employee-conversations-test.mjs`
- `frontend/scripts/ssh-employee-conversation-test.mjs`
- Neue Testdateien für Knowledge Layer, Generatoren, Balancing.

---

## 23. Neue notwendige Dateien

| Datei | Zweck |
|---|---|
| `frontend/src/lib/knowledgeLayer.js` | Zentrale Knowledge-Item-Definitionen, Lookup, Unlock-Prüfung. |
| `frontend/src/lib/knowledgeTemplates.js` | Fragetemplates pro Knowledge-Item-Typ und Thema. |
| `frontend/src/lib/knowledgeScenarios.js` | Mitarbeiter-/Arbeitssituationen pro Cluster. |
| `frontend/src/lib/distractorPool.js` | Zentralisierte Distraktoren-Generierung. |
| `frontend/src/lib/conversationBalancer.js` | Topic Balancing, Concept Cluster, Semantic Cooldown. |
| `frontend/src/lib/knowledgeValidators.js` | Prüft generierte Fragen auf Eindeutigkeit, gültige Distraktoren, Unlock-Konformität. |
| `frontend/scripts/knowledge-layer-test.mjs` | Tests für Knowledge Items, Templates, Validatoren. |
| `frontend/scripts/conversation-balancer-test.mjs` | Tests für Cooldown, Balancing, Cluster-Verhalten. |

---

## 24. Risiken

### 24.1 Academy

- **Risiko:** Lektionsdateien werden durch Knowledge-Metadaten aufgebläht.
- **Mitigation:** Knowledge-Metadaten schlank halten; Gesprächs-spezifische Erweiterungen in separate Dateien auslagern.

### 24.2 Conversation Progress

- **Risiko:** Neue Cooldown-/Balancing-Logik macht Gespräche zu selten oder zu repetitiv.
- **Mitigation:** Parameter zentral in `academyThresholds.js` tunable machen und mit Tests überprüfen.

### 24.3 Savegames

- **Risiko:** Änderungen an `employee-conversation-history-v1` oder neuen Stores invalidieren alte Speicherstände.
- **Mitigation:** Versionsierung beibehalten; Migration schreiben, die fehlende Felder mit Defaults füllt.

### 24.4 Mastery

- **Risiko:** `conversationMastery.js` trackt pro Topic; bei feineren Knowledge Items muss die Datenstruktur erweitert werden.
- **Mitigation:** Rückwärtskompatibel: Topics bleiben als Aggregate, Knowledge Items werden intern erfasst.

### 24.5 Story/Mission Flow

- **Risiko:** Gespräche werden zu lang oder unterbrechen Missionen.
- **Mitigation:** Länge weiterhin 1–5 Fragen; Gespräche optional und nicht blockierend für Story.

### 24.6 Fachliche Korrektheit

- **Risiko:** Parametrische Generatoren erzeugen ungültige oder mehrdeutige Aufgaben.
- **Mitigation:** Alle Generatoren mit `knowledgeValidators.js` validieren; umfangreiche Stichproben-Tests.

---

## 25. Teststrategie

### 25.1 Fachliche Validierung

- Jede generierte Instanz hat **genau eine** richtige Lösung.
- Distraktoren sind eindeutig falsch.
- Ungültige Parameterkombinationen werden abgelehnt.

### 25.2 Parameter-Validierung

- IP + Präfix erzeugt gültige IPv4-Adressen.
- Subnetting-Ergebnisse stimmen mit `ipv4Math.js` überein.
- Binärwerte sind immer 8 Bit.

### 25.3 Variation

- Große Stichproben erzeugen und Verteilung prüfen.
- Keine Konzentration auf einzelne Knowledge Items.
- Beide Richtungen von Mappings kommen vor.

### 25.4 Semantic Cooldown

- Dasselbe Knowledge Item erscheint nicht innerhalb von N Zügen erneut.
- Bidirektionale Mappings teilen denselben Cooldown.

### 25.5 Topic Balancing

- Alle freigeschalteten Topics kommen in einer langen Stichprobe vor.
- Mastered Topics seltener, aber nicht ausgeschlossen.

### 25.6 Unlocks

- Gesperrte Topics werden niemals abgefragt.
- Kombinationsfragen prüfen beide Voraussetzungen.

### 25.7 Difficulty

- Easy/Medium/Hard erzeugen unterschiedliche Parameterbereiche.
- Erhöhte Schwierigkeit nach korrekten Antworten spürbar.

### 25.8 Regression

- Bestehende `employeeConversations.js`-Tests weiterhin grün.
- Academy-Lektionen unverändert funktionsfähig.
- Savegames migrierbar.

---

## 26. Migration vorhandener Fragen

### 26.1 Klassifizierung

| Kategorie | Maßnahme | Beispiele |
|---|---|---|
| **KEEP** | Handgeschriebene Premium-Fragen behalten. | SSH-Szenarien, komplexe Troubleshooting-Fragen. |
| **CONVERT** | Statische Fragen in Templates umwandeln. | OSI-Fragen, Port-Mappings, Binärumrechnung. |
| **FIX** | Grundidee gut, aber Mehrdeutigkeit oder schlechte Distraktoren. | "Welche Schicht entspricht OSI Schicht 3?" → Modell explizit nennen. |
| **REPLACE** | Fachlich problematisch oder stark repetitiv. | Mehrere Fragen, die Hub-vs-Switch in leicht abgewandelter Form stellen. |

### 26.2 Vorgehen

1. Alle `CONVERSATION_TOPICS`-Einträge analysieren und klassifizieren.
2. Statische `questions` in Knowledge Items + Templates überführen.
3. `archetypes` anpassen, um aus Knowledge Items zu generieren.
4. Alte statische Fragen als Fallback behalten, bis Generator stabil läuft.

---

## 27. Implementierungsplan in Etappen

### Etappe 1: Knowledge Layer Foundation

**Ziel:** Zentrale Knowledge-Item-Struktur für 3–5 Pilot-Themen (OSI, Ports, Binär, IPv4, Subnetting).

**Dateien:**
- Neu: `knowledgeLayer.js`, `knowledgeValidators.js`
- Geändert: `academyLessons/osi.js`, `ipv4.js`, `subnetMasks.js`, `binarySystem.js`, `switching.js`

**Tests:**
- Knowledge Items vollständig definiert.
- Unlock-Prüfung funktioniert.
- Validatoren finden keine Mehrdeutigkeiten.

**Mögliche Regressionen:** Keine, da nur neue Dateien und Metadaten.

**Review-Punkt:** User prüft Knowledge-Item-Struktur.

---

### Etappe 2: Template-Engine für MC/Ordering/Matching

**Ziel:** Aus Knowledge Items parametrisierte Fragen generieren.

**Dateien:**
- Neu: `knowledgeTemplates.js`, `distractorPool.js`
- Geändert: `employeeConversations.js` (neue Archetype-Generatoren)

**Tests:**
- Jede generierte Frage hat exakt eine Lösung.
- Distraktoren sind gültig.
- Bidirektionale Mappings erzeugen beide Richtungen.

**Mögliche Regressionen:** Gesprächs-Engine muss weiterhin statische Fragen unterstützen.

**Review-Punkt:** User prüft Beispiel-Fragen.

---

### Etappe 3: Parametrische Berechnungsgeneratoren

**Ziel:** Binär, IPv4, Subnetting vollständig aus `ipv4Math.js` generieren.

**Dateien:**
- Neu: `knowledgeCalculators.js`
- Geändert: `employeeConversations.js`, `EmployeeConversation.jsx` (Eingabe-Antworten für Gespräche)

**Tests:**
- 1000 zufällige Aufgaben validieren.
- Difficulty-Stufen erzeugen passende Parameter.

**Mögliche Regressionen:** UI muss Input-Fragen im Gespräch darstellen können.

**Review-Punkt:** User prüft Beispiel-Berechnungsaufgaben.

---

### Etappe 4: Semantic Cooldown & Topic Balancing

**Ziel:** Wiederholungen reduzieren, Topics balancieren.

**Dateien:**
- Neu: `conversationBalancer.js`
- Geändert: `employeeConversations.js`, `conversationMastery.js`

**Tests:**
- Semantic Cooldown funktioniert.
- Topic Balancing über lange Stichproben.
- Savegame-Migration funktioniert.

**Mögliche Regressionen:** Gesprächsverlauf ändert sich spürbar; ausgiebig testen.

**Review-Punkt:** User prüft Gesprächsverteilung.

---

### Etappe 5: Szenario-Templates & Mitarbeiterrollen

**Ziel:** Natürliche Arbeitssituationen pro Knowledge Cluster.

**Dateien:**
- Neu: `knowledgeScenarios.js`
- Geändert: `employeeConversations.js`, `officeWorld.js`

**Tests:**
- Szenarien passen zu Rollen.
- Storytext verrät nicht die Lösung.

**Mögliche Regressionen:** Keine.

**Review-Punkt:** User prüft Beispiel-Gespräche.

---

### Etappe 6: Sam-Interventionen & Ambiguitätsschutz

**Ziel:** Erklärungen zielgenauer und eindeutiger.

**Dateien:**
- Geändert: `employeeConversations.js`, `EmployeeConversation.jsx`

**Tests:**
- Erklärungen referenzieren gewählten Distraktor.
- Modellvergleiche benennen beide Modelle.

**Mögliche Regressionen:** Keine.

**Review-Punkt:** User prüft Fehlantwort-Flow.

---

### Etappe 7: Ausbau auf alle Academy-Themen

**Ziel:** Knowledge Items für Cisco, Security, Linux, Active Directory.

**Dateien:**
- `knowledgeLayer.js` erweitern.
- Academy-Lektionen für Security/Linux/AD ergänzen (falls nicht vorhanden).

**Tests:**
- Alle Topics mit Inhalt haben Knowledge Items.
- Gesperrte Topics werden nicht abgefragt.

**Mögliche Regressionen:** Größere Datenmenge; Balancing-Parameter eventuell anpassen.

**Review-Punkt:** User prüft vollständigen Katalog.

---

### Etappe 8: Integration, Regression, Release

**Ziel:** Gesamtes System stabilisieren.

**Schritte:**
- Alle bestehenden Gesprächs-Tests laufen.
- Neue Knowledge-Layer-Tests laufen.
- Lint, Build, Capacitor Sync, APK.
- Commit ohne Push.

**Review-Punkt:** User gibt Freigabe für Push/Deploy.

---

## 28. Stop-/Review-Punkte

Nach jeder Etappe wird ein expliziter Review-Punkt empfohlen:

1. **Etappe 1:** Knowledge-Item-Struktur.
2. **Etappe 2:** Erste Templates und Beispielfragen.
3. **Etappe 3:** Berechnungsaufgaben.
4. **Etappe 4:** Balancing/Cooldown-Parameter.
5. **Etappe 5:** Szenarien und Rollen.
6. **Etappe 6:** Sam-Interventionen.
7. **Etappe 7:** Vollständiger Themenkatalog.
8. **Etappe 8:** Release-Readiness.

---

## 29. Zusammenfassung der Kernempfehlung

1. **Hybrid-Architektur:** Academy-Lektionen bleiben fachliche Quelle; ein separater, daraus abgeleiteter **Knowledge Layer** speist die Gespräche.
2. **Knowledge Items** statt starre Fragen: pro Thema strukturierte Einheiten mit IDs, Typen, Parametern, Beziehungen.
3. **Templates + Validatoren:** kontrollierte Variation, berechenbare Lösungen, geprüfte Distraktoren.
4. **Semantic Cooldown + Topic Balancing:** verhindert Layer-1-/WAN-Wiederholungen.
5. **Mitarbeiterrollen** verpacken Fragen natürlich, verändern aber nicht die fachliche Antwort.
6. **Schrittweise Implementierung** mit Review-Punkten, ausgiebigen Tests und Rückwärtskompatibilität.

### 29.1 Verbindliche Designformel

Die Knowledge Engine folgt dieser Pipeline:

**Academy-Theorie → Knowledge Item → Question Archetype → kontrollierte Parameter → eindeutige Lösung → Mitarbeiter-/Arbeitskontext → natürlicher Conversation-Flow**

- **Academy-Theorie** bleibt die Single Source of Truth.
- **Knowledge Items** strukturieren die kleinste fachliche Wissenseinheit.
- **Question Archetypes** wählen die Fragetypik (Mapping, Ordering, Calculation, Scenario, …).
- **Kontrollierte Parameter** erzeugen Variation, ohne fachliche Korrektheit zu gefährden.
- **Eindeutige Lösungen** stammen aus hinterlegten Daten oder berechenbaren Regeln.
- **Mitarbeiter-/Arbeitskontext** verpackt den Wissenspunkt in einen natürlichen Gesprächsfluss.
- **Natürlicher Conversation-Flow** bedeutet: Mitarbeiter klingen wie Kollegen, nicht wie Prüfer.

---

**Ende des Architekturberichts.**
