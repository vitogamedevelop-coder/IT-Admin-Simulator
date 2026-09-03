import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Replikationsgrundlagen & AD-Datenbank
// Thema 22
// =============================================================================

export const AD_REPLICATION_BASICS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-basics');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const partitionScopeSvg = `<svg viewBox="0 0 320 240" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="10" width="280" height="50" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="30" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Forest</text>
  <text x="160" y="46" text-anchor="middle" fill="#c9d1d9" font-size="9">Schema + Configuration → alle DCs</text>

  <rect x="20" y="75" width="130" height="70" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="85" y="95" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">Domain A</text>
  <text x="85" y="113" text-anchor="middle" fill="#c9d1d9" font-size="9">Domain-Partition</text>
  <text x="85" y="131" text-anchor="middle" fill="#8b949e" font-size="8">nur DCs in Domain A</text>

  <rect x="170" y="75" width="130" height="70" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="235" y="95" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">Domain B</text>
  <text x="235" y="113" text-anchor="middle" fill="#c9d1d9" font-size="9">Domain-Partition</text>
  <text x="235" y="131" text-anchor="middle" fill="#8b949e" font-size="8">nur DCs in Domain B</text>

  <rect x="95" y="160" width="130" height="50" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="160" y="178" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">Application</text>
  <text x="160" y="196" text-anchor="middle" fill="#8b949e" font-size="9">definierter Scope (z.B. DNS)</text>
</svg>`;

const deltaSvg = `<svg viewBox="0 0 320 200" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="110" height="70" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="75" y="40" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">DC01</text>
  <text x="75" y="56" text-anchor="middle" fill="#c9d1d9" font-size="9">Lisa</text>
  <text x="75" y="72" text-anchor="middle" fill="#c9d1d9" font-size="9">department: IT</text>
  <text x="75" y="86" text-anchor="middle" fill="#8b949e" font-size="8">↓ Änderung</text>

  <rect x="190" y="20" width="110" height="70" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="245" y="40" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">DC02</text>
  <text x="245" y="56" text-anchor="middle" fill="#c9d1d9" font-size="9">Lisa</text>
  <text x="245" y="72" text-anchor="middle" fill="#c9d1d9" font-size="9">department: IT</text>
  <text x="245" y="86" text-anchor="middle" fill="#8b949e" font-size="8">noch alt</text>

  <path d="M 135 60 L 180 60" stroke="#00f0ff" stroke-width="2" marker-end="url(#arrow)" />
  <text x="157" y="80" text-anchor="middle" fill="#c9d1d9" font-size="8">Δ department: Support</text>

  <rect x="190" y="115" width="110" height="70" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="245" y="135" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">DC02</text>
  <text x="245" y="151" text-anchor="middle" fill="#c9d1d9" font-size="9">Lisa</text>
  <text x="245" y="167" text-anchor="middle" fill="#c9d1d9" font-size="9">department: Support</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#00f0ff" />
    </marker>
  </defs>
  <text x="160" y="182" text-anchor="middle" fill="#8b949e" font-size="9">Es wird nur die Änderung übertragen, nicht die ganze Datenbank</text>
</svg>`;

export function buildAdReplicationBasicsLesson() {
  const explanations = [
    explanation('ad-repl-intro-classic', 'Warum braucht AD Replikation?', 'classic', [
      { type: 'text', content: 'In einer Active-Directory-Domäne arbeiten in der Regel mehrere Domain Controller. Damit Benutzer sich an jedem DC anmelden und Administratoren überall dieselben Objekte sehen, müssen die DCs konsistente Verzeichnisinformationen besitzen.' },
      { type: 'text', content: 'AD-Replikation sorgt dafür, dass Verzeichnisinformationen auf den Domain Controllern konsistent und aktuell gehalten werden. Ohne Replikation würden Änderungen auf einem DC die anderen DCs nicht erreichen.' },
      { type: 'question', question: 'Was ist die zentrale Aufgabe der AD-Replikation?', options: ['Alle DCs mit identischen, aktuellen Verzeichnisinformationen versorgen', 'Den primären DC schneller machen', 'Den AD-Papierkorb leeren', 'DNS-Zonen löschen'], correct: 0, explanation: 'Replikation gleicht Verzeichnisdaten zwischen den DCs ab, damit alle denselben Stand kennen.' },
    ]),
    explanation('ad-repl-problem-intuitive', 'Das Problem ohne Replikation', 'intuitive', [
      { type: 'text', content: 'Stell dir zwei DCs wie zwei Notizbücher vor: Auf DC01 wird eine neue Seite für die Benutzerin Lisa angelegt. Wenn das zweite Notizbuch nicht informiert wird, existiert Lisa dort nicht.' },
      { type: 'text', content: 'Ohne Replikation entstehen unterschiedliche Datenstände: DC01 kennt die Änderung, DC02 nicht. Das führt zu uneinheitlicher Verwaltung und kann Authentifizierungsprobleme verursachen.' },
      { type: 'question', question: 'Auf DC01 wird ein Benutzer angelegt. Ohne Replikation kennt DC02 ihn nicht. Was ist die Folge?', options: ['Beide DCs haben sofort denselben Stand', 'Unterschiedliche Datenstände und mögliche Anmeldeprobleme', 'Der Benutzer ist im DNS sichtbar', 'Das Passwort wird automatisch synchronisiert'], correct: 1, explanation: 'Ohne Replikation bleibt der neue Benutzer auf DC02 unbekannt, was inkonsistente Sichten und Anmeldeprobleme verursachen kann.' },
    ]),
    explanation('ad-repl-multimaster-classic', 'Multi-Master Grundidee', 'classic', [
      { type: 'text', content: 'Active Directory arbeitet grundsätzlich als Multi-Master-System. Das bedeutet: Viele Änderungen können auf verschiedenen schreibbaren Domain Controllern erfolgen und werden später abgeglichen.' },
      { type: 'text', content: 'Beispiel: Auf DC01 wird ein neuer Benutzer angelegt, während auf DC02 eine Gruppenmitgliedschaft geändert wird. Beide Änderungen werden repliziert, sodass beide DCs am Ende beide Informationen kennen.' },
      { type: 'question', question: 'Was bedeutet Multi-Master im AD-Kontext?', options: ['Nur ein DC darf jemals schreiben', 'Änderungen können auf mehreren DCs erfolgen und werden abgeglichen', 'Replikation findet nie statt', 'Jeder DC verwaltet eine eigene Domäne'], correct: 1, explanation: 'Multi-Master erlaubt Änderungen auf mehreren DCs; die Replikation gleicht sie ab.' },
    ]),
    explanation('ad-repl-fsmo-link-classic', 'FSMO: Die gezielte Ausnahme', 'classic', [
      { type: 'text', content: 'AD ist also grundsätzlich Multi-Master. Trotzdem gibt es einige besondere Aufgaben, bei denen ein eindeutiger Zuständiger sinnvoll ist, um Konflikte zu vermeiden. Diese Ausnahmen heißen FSMO-Rollen und wurden bereits in den vorherigen Themen behandelt.' },
      { type: 'text', content: 'Wichtig ist der Zusammenhang: Multi-Master ist der Normalfall, FSMO-Rollen sind gezielte Ausnahmen für bestimmte Sonderoperationen.' },
      { type: 'question', question: 'Wie verhalten sich Multi-Master und FSMO zueinander?', options: ['FSMO-Rollen ersetzen Multi-Master komplett', 'Multi-Master ist der Grundsatz, FSMO-Rollen sind Ausnahmen', 'Multi-Master und FSMO sind identisch', 'Multi-Master gilt nur für Schemaänderungen'], correct: 1, explanation: 'Multi-Master ist der Normalfall im AD. FSMO-Rollen ergänzen ihn für besondere Aufgaben.' },
    ]),
    explanation('ad-repl-rodc-classic', 'RODC – ein Sonderfall', 'classic', [
      { type: 'text', content: 'Ein Read-Only Domain Controller (RODC) ist kein normaler schreibbarer Multi-Master-DC. Er besitzt eine schreibgeschützte Kopie der AD-Datenbank für bestimmte Szenarien, beispielsweise an kleineren oder weniger vertrauenswürdigen Standorten.' },
      { type: 'text', content: 'RODCs replizieren normalerweise empfangen, aber Änderungen müssen auf einem schreibbaren DC durchgeführt werden. Das ist hier nur ein kurzer Ausblick; Details folgen später, falls die Quelle es verlangt.' },
      { type: 'question', question: 'Was ist ein RODC?', options: ['Ein schreibbarer Multi-Master-DC', 'Ein DC mit schreibgeschützter AD-Datenbankkopie', 'Ein spezieller DNS-Server', 'Eine FSMO-Rolle'], correct: 1, explanation: 'RODC = Read-Only Domain Controller. Er hält eine schreibgeschützte Kopie und ist kein normaler Multi-Master-DC.' },
    ]),
    explanation('ad-repl-ntds-classic', 'NTDS.DIT – die AD-Datenbank', 'classic', [
      { type: 'text', content: 'Jeder Domain Controller besitzt eine lokale Kopie der Active-Directory-Datenbank. Sie wird in der Datei NTDS.DIT gespeichert. Dabei handelt es sich um eine einzelne Datenbankdatei, die logisch in mehrere Verzeichnispartitionen gegliedert ist.' },
      { type: 'text', content: 'Wichtig: NTDS.DIT ist nicht eine separate Datei pro Partition, sondern eine Datenbank mit logischen Partitionen. Das bestimmt, welche Daten an welche DCs repliziert werden.' },
      { type: 'question', question: 'Was ist NTDS.DIT?', options: ['Eine separate Datei für jede AD-Partition', 'Die zentrale AD-Datenbankdatei auf einem DC', 'Ein Replikationsprotokoll', 'Ein DNS-Tool'], correct: 1, explanation: 'NTDS.DIT ist die AD-Datenbankdatei eines DCs, logisch in Partitionen gegliedert.' },
    ]),
    explanation('ad-repl-why-partitions-classic', 'Warum werden Partitionen verwendet?', 'classic', [
      { type: 'text', content: 'Nicht jede Information muss an jeden Domain Controller gelangen. Das Schema legt beispielsweise für den ganzen Forest fest, welche Objekttypen erlaubt sind. Benutzerobjekte einer bestimmten Domain interessieren dagegen primär die DCs dieser Domain.' },
      { type: 'text', content: 'Durch Partitionen kann AD den Replikationsumfang sinnvoll steuern: forestweite, domänenspezifische und anwendungsspezifische Daten werden getrennt behandelt.' },
      { type: 'question', question: 'Warum gibt es unterschiedliche AD-Partitionen?', options: ['Damit jeder DC jede Information bekommt', 'Um den Replikationsumfang sinnvoll zu steuern', 'Damit die Datenbankdatei kleiner aussieht', 'Weil jede Partition eine eigene Datenbankdatei ist'], correct: 1, explanation: 'Partitionen trennen Daten nach Replikationsscope und vermeiden unnötige Übertragungen.' },
    ]),
    explanation('ad-repl-schema-partition-classic', 'Schema Partition', 'classic', [
      { type: 'text', content: 'Die Schema-Partition beschreibt, welche Objekttypen und Attribute in Active Directory existieren dürfen. Sie ist für den gesamten Forest identisch und wird an alle DCs im Forest repliziert.' },
      { type: 'text', content: 'Anknüpfung an Thema 20: Schemaänderungen werden vom Schema Master koordiniert. Hier geht es aber nicht um die Rolle, sondern um die Partition und ihren Replikationsscope.' },
      { type: 'question', question: 'Welche Aussage zur Schema-Partition stimmt?', options: ['Sie gilt nur für eine Domain', 'Sie ist forestweit und wird an alle DCs des Forests repliziert', 'Sie enthält alle Benutzerkonten', 'Sie wird niemals repliziert'], correct: 1, explanation: 'Die Schema-Partition gilt forestweit und ist auf allen DCs des Forests identisch.' },
    ]),
    explanation('ad-repl-config-partition-classic', 'Configuration Partition', 'classic', [
      { type: 'text', content: 'Die Configuration-Partition enthält forestweite Konfigurationsinformationen: die logische AD-Struktur, Replikationszusammenhänge und Trust- sowie Site-bezogene Konfiguration. Auch sie wird an alle DCs des Forests repliziert.' },
      { type: 'text', content: 'Damit jeder DC den Forest „versteht“, muss er dieselben Konfigurationsdaten haben. Das ist der Grund für den forestweiten Scope.' },
      { type: 'question', question: 'Was ist typischer Inhalt der Configuration-Partition?', options: ['Nur Benutzerkonten einer Domain', 'Forestweite Konfiguration wie Struktur, Trusts, Sites', 'Die Anmeldehistorie einzelner Clients', 'Der lokale DNS-Cache'], correct: 1, explanation: 'Die Configuration-Partition enthält forestweite Konfiguration wie AD-Struktur, Trusts und Site-Informationen.' },
    ]),
    explanation('ad-repl-domain-partition-classic', 'Domain Partition', 'classic', [
      { type: 'text', content: 'Die Domain-Partition enthält die Objekte einer bestimmten Domain: Benutzer, Gruppen, Computer, OUs und Gruppenrichtlinien. Sie wird nur an die Domain Controller dieser Domain repliziert.' },
      { type: 'text', content: 'Eine Änderung an einem Benutzer in Domain A muss nicht automatisch jedem DC in Domain B als vollständige Domain-A-Partition zur Verfügung stehen. Das ist der Sinn der partitionierten Datenbank.' },
      { type: 'question', question: 'Wer erhält typischerweise die Domain-Partition von its.bw?', options: ['Alle DCs im Forest', 'Nur die DCs der Domain its.bw', 'Nur der PDC Emulator', 'Nur der Schema Master'], correct: 1, explanation: 'Die Domain-Partition enthält Objekte einer Domain und wird an die DCs dieser Domain repliziert.' },
    ]),
    explanation('ad-repl-application-partition-classic', 'Application Partition', 'classic', [
      { type: 'text', content: 'Anwendungsverzeichnispartitionen enthalten anwendungsspezifische Daten. Ein bekanntes Beispiel sind AD-integrierte DNS-Daten. Ihr Replikationsscope ist an die Anwendung und das Szenario angepasst.' },
      { type: 'text', content: 'Wichtig: Man darf Application-Partitionen weder zu „immer alle DCs des Forests“ noch zu „immer nur eine Domain“ vereinfachen. Ihr Scope ist konfigurierbar.' },
      { type: 'question', question: 'Was ist typisch für eine Anwendungsverzeichnispartition?', options: ['Sie enthält immer alle Objekte aller Domänen vollständig', 'Sie hat einen anwendungsspezifischen, konfigurierbaren Replikationsscope', 'Sie wird niemals repliziert', 'Sie ist identisch mit der Configuration-Partition'], correct: 1, explanation: 'Anwendungsverzeichnispartitionen wie AD-integriertes DNS haben einen anwendungsspezifischen Scope.' },
    ]),
    explanation('ad-repl-partition-visual-classic', 'Partition-Replikationsscope im Überblick', 'classic', [
      { type: 'text', content: 'Die folgende Übersicht zeigt, welche Partition an welche DCs repliziert wird. Forestweite Daten müssen überall gleich sein, domänenspezifische Daten nur in der jeweiligen Domain.' },
      { type: 'diagram', content: partitionScopeSvg },
      { type: 'list', title: 'Scopes', items: [
        'Schema-Partition → forestweit',
        'Configuration-Partition → forestweit',
        'Domain-Partition → domänenspezifisch',
        'Application-Partition → definierter/anwendungsspezifischer Scope',
      ] },
      { type: 'question', question: 'Welche Partition wird an alle DCs des Forests repliziert?', options: ['Nur die Domain-Partition', 'Schema- und Configuration-Partition', 'Nur die Application-Partition', 'Keine Partition wird repliziert'], correct: 1, explanation: 'Schema- und Configuration-Partition sind forestweit.' },
    ]),
    explanation('ad-repl-triggers-classic', 'Replikationsauslöser', 'classic', [
      { type: 'text', content: 'Replikation wird durch Änderungen am Verzeichniszustand ausgelöst. Typische Auslöser sind: ein Objekt erstellen, ein Objekt ändern, ein Objekt verschieben oder ein Objekt löschen.' },
      { type: 'text', content: 'Der Spieler soll erkennen: Replikation reagiert auf Veränderungen, nicht auf regelmäßiges vollständiges Kopieren der Datenbank.' },
      { type: 'question', question: 'Welcher Vorgang löst typischerweise Replikation aus?', options: ['Das regelmäßige Hochfahren des Servers', 'Eine Änderung an einem AD-Objekt', 'Das Öffnen eines Webbrowsers', 'Das Drucken eines Dokuments'], correct: 1, explanation: 'Änderungen an AD-Objekten wie Erstellen, Ändern, Verschieben oder Löschen lösen Replikation aus.' },
    ]),
    explanation('ad-repl-delta-classic', 'Delta-Prinzip', 'classic', [
      { type: 'text', content: 'Bei der AD-Replikation werden Änderungen übertragen, nicht jedes Mal der komplette Datenbestand. Wenn sich bei einem Benutzer die Abteilung von IT auf Support ändert, wird nur diese Änderung repliziert.' },
      { type: 'text', content: 'Dieses Delta-Prinzip macht die Replikation effizienter und verringert die Netzwerklast. Es ist ein zentrales Konzept, das man sich beim Verständnis von Replikation merken sollte.' },
      { type: 'diagram', content: deltaSvg },
      { type: 'question', question: 'Was bedeutet Delta-Replikation?', options: ['Jedes Mal die gesamte NTDS.DIT wird übertragen', 'Nur die tatsächlichen Änderungen werden übertragen', 'Nur neue Benutzer werden repliziert', 'Alle Partitionen werden jedes Mal komplett kopiert'], correct: 1, explanation: 'Delta-Replikation überträgt nur die geänderten Werte, nicht die komplette Datenbank.' },
    ]),
    explanation('ad-repl-models-classic', 'Grundlegende Replikationsmodelle', 'classic', [
      { type: 'text', content: 'Die Quelle nennt unterschiedliche Modellbegriffe: Multi-Master-Replikation, Pull, Push, Store-and-Forward und statusbasierte Replikation. Für dieses Thema reicht das Verständnis der Grundideen.' },
      { type: 'text', content: 'Store-and-Forward bedeutet: Nicht jeder DC muss direkt mit jedem anderen kommunizieren. Änderungen können über Replikationspartner weitergegeben werden. Statusinformationen helfen den DCs zu erkennen, welche Änderungen bereits bekannt sind.' },
      { type: 'text', content: 'Wichtig: Das sind Modelle, keine starre Auswahl. In der Praxis arbeitet AD mit verschiedenen Mechanismen gemeinsam.' },
      { type: 'question', question: 'Was beschreibt Store-and-Forward in groben Zügen?', options: ['Jeder DC kopiert jede Sekunde die ganze Datenbank', 'Änderungen können über Replikationspartner weitergegeben werden, nicht jeder DC muss direkt erreichbar sein', 'Nur der PDC darf Replikationsdaten senden', 'Es gibt keine Replikationstopologie'], correct: 1, explanation: 'Store-and-Forward bedeutet, dass Änderungen über die Topologie weitergeleitet werden können.' },
    ]),
    explanation('ad-repl-troubleshooting-classic', 'Erste Verdachtsrichtung', 'classic', [
      { type: 'text', content: 'Wenn ein DC eine Änderung zeigt und ein anderer nicht, ist die erste sinnvolle Vermutung: Die Replikation oder der Replikationszustand ist noch nicht abgeschlossen. In diesem Thema vertiefen wir keine Site- oder KCC-Diagnose; das folgt später.' },
      { type: 'text', content: 'Wichtig ist, das Problem zuerst als Replikationsthema zu erkennen, bevor man in komplexere Ursachen abtaucht.' },
      { type: 'question', question: 'DC01 zeigt eine neue Gruppenmitgliedschaft, DC02 noch nicht. Was prüfst du zuerst?', options: ['Ob Replikation noch aussteht', 'Ob der Client neu installiert werden muss', 'Ob das Schema erweitert werden muss', 'Ob ein externer Trust eingerichtet werden muss'], correct: 0, explanation: 'Unterschiedliche Datenstände zwischen DCs deuten zunächst auf Replikation hin.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-repl-why-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff seiner Bedeutung zu.',
      pairs: [
        { left: 'Replikation', right: 'Hält Verzeichnisinformationen auf den DCs konsistent' },
        { left: 'Multi-Master', right: 'Änderungen können auf mehreren DCs erfolgen und werden abgeglichen' },
        { left: 'Delta', right: 'Nur Änderungen werden übertragen' },
        { left: 'Partition', right: 'Logischer Bereich in NTDS.DIT mit definiertem Replikationsscope' },
      ],
      explanation: 'Replikation sorgt für Konsistenz, Multi-Master erlaubt verteilte Änderungen, Delta reduziert den Übertragungsumfang, Partitionen strukturieren NTDS.DIT.',
    },
    {
      id: 'ad-repl-why-select',
      type: 'select-best',
      question: 'Auf DC01 wird die Benutzerin Lisa erstellt. Wie erfährt DC02 davon?',
      options: ['Über DNS', 'Über AD-Replikation', 'Über den lokalen Windows-Explorer', 'Über das Schema Master automatisch'],
      correct: 1,
      explanation: 'AD-Replikation verteilt Änderungen an Verzeichnisobjekten auf die betroffenen DCs.',
    },
    {
      id: 'ad-repl-multimaster-select',
      type: 'select-best',
      question: 'Welche Aussage beschreibt Multi-Master im AD am besten?',
      options: ['Nur der PDC Emulator darf Änderungen vornehmen', 'Änderungen können auf mehreren schreibbaren DCs erfolgen und werden später abgeglichen', 'Jeder DC verwaltet eine eigene Domäne', 'Replikation findet nur bei Schemaänderungen statt'],
      correct: 1,
      explanation: 'Multi-Master ermöglicht verteilte Änderungen, die anschließend repliziert werden.',
    },
    {
      id: 'ad-repl-fsmo-misconception',
      type: 'select-best',
      question: '„Multi-Master bedeutet, dass FSMO-Rollen überflüssig sind." Stimmt das?',
      options: ['Ja, denn FSMO-Rollen werden nicht mehr gebraucht', 'Nein, Multi-Master ist der Grundsatz, FSMO-Rollen sind gezielte Ausnahmen', 'Ja, denn FSMO ist nur ein Synonym für Replikation', 'Nein, Multi-Master gilt nur für Gruppenrichtlinien'],
      correct: 1,
      explanation: 'FSMO-Rollen koordinieren bestimmte Sonderaufgaben; sie ergänzen den Multi-Master-Grundsatz.',
    },
    {
      id: 'ad-repl-rodc-select',
      type: 'select-best',
      question: 'Was ist ein RODC?',
      options: ['Ein schreibbarer Multi-Master-DC', 'Ein DC mit schreibgeschützter AD-Datenbankkopie', 'Eine FSMO-Rolle', 'Ein spezieller DNS-Eintrag'],
      correct: 1,
      explanation: 'RODC = Read-Only Domain Controller mit schreibgeschützter Kopie der AD-Datenbank.',
    },
    {
      id: 'ad-repl-ntds-select',
      type: 'select-best',
      question: 'Was ist NTDS.DIT?',
      options: ['Eine separate Datenbankdatei pro Partition', 'Die zentrale AD-Datenbankdatei auf einem DC', 'Ein Replikationsprotokoll', 'Ein Netzwerkdienst'],
      correct: 1,
      explanation: 'NTDS.DIT ist die AD-Datenbankdatei, logisch in Partitionen gegliedert.',
    },
    {
      id: 'ad-repl-partition-scope-matching',
      type: 'matching',
      question: 'Ordne jeder Partition ihren typischen Replikationsscope zu.',
      pairs: [
        { left: 'Schema', right: 'forestweit' },
        { left: 'Configuration', right: 'forestweit' },
        { left: 'Domain', right: 'domänenspezifisch' },
        { left: 'Application', right: 'anwendungsspezifisch / definierbar' },
      ],
      explanation: 'Schema und Configuration werden forestweit repliziert, Domain nur innerhalb der jeweiligen Domain, Application je nach Anwendung.',
    },
    {
      id: 'ad-repl-classification-select',
      type: 'select-best',
      question: 'Welcher Datensatz gehört typischerweise in welche Partition?',
      options: [
        'Schemaattribut → Schema; User Lisa → Domain; Site-Konfiguration → Configuration; AD-integrierte DNS-Daten → Application',
        'Schemaattribut → Domain; User Lisa → Configuration; Site-Konfiguration → Application; DNS-Daten → Schema',
        'Schemaattribut → Application; User Lisa → Schema; Site-Konfiguration → Domain; DNS-Daten → Configuration',
        'Schemaattribut → Configuration; User Lisa → Application; Site-Konfiguration → Schema; DNS-Daten → Domain',
      ],
      correct: 0,
      explanation: 'Schemaattribute in Schema, Benutzer in Domain, Site-/Forest-Konfiguration in Configuration, anwendungsspezifische Daten in Application.',
    },
    {
      id: 'ad-repl-all-data-misconception',
      type: 'select-best',
      question: '„Alle AD-Daten werden immer an jeden DC des Forests repliziert." Stimmt das?',
      options: ['Ja, damit alle DCs identisch sind', 'Nein, Partitionen haben unterschiedliche Replikationsscopes', 'Ja, außer Gruppenrichtlinien', 'Nein, nur das Schema wird repliziert'],
      correct: 1,
      explanation: 'Partitionen steuern den Replikationsumfang; nicht jeder DC benötigt jede Domain-Partition.',
    },
    {
      id: 'ad-repl-full-ntds-misconception',
      type: 'select-best',
      question: '„Bei jeder Änderung wird die komplette NTDS.DIT übertragen." Stimmt das?',
      options: ['Ja, damit die Datenbank konsistent bleibt', 'Nein, das ist falsch – es werden nur Änderungen als Deltas repliziert', 'Ja, aber nur bei Objektlöschungen', 'Nein, nur neue Objekte werden jemals repliziert'],
      correct: 1,
      explanation: 'Delta-Replikation überträgt nur die tatsächlichen Änderungen, nicht die komplette Datenbank.',
    },
    {
      id: 'ad-repl-trigger-select',
      type: 'select-best',
      question: 'Welche Vorgänge lösen typischerweise AD-Replikation aus?',
      options: ['Nur das regelmäßige Herunterfahren eines DCs', 'Objekt erstellen, ändern, verschieben, löschen', 'Nur Schemaänderungen', 'Nur das Hinzufügen neuer DCs'],
      correct: 1,
      explanation: 'Änderungen am Verzeichniszustand wie Erstellen, Ändern, Verschieben und Löschen lösen Replikation aus.',
    },
    {
      id: 'ad-repl-delta-select',
      type: 'select-best',
      question: 'Ein Benutzer wechselt die Abteilung. Was wird repliziert?',
      options: ['Die gesamte NTDS.DIT', 'Nur die geänderte Abteilungsinformation', 'Nichts, denn der Name des Benutzers ist gleich geblieben', 'Alle Benutzer der Domain'],
      correct: 1,
      explanation: 'Delta-Replikation überträgt nur die geänderten Attribute, nicht die ganze Datenbank.',
    },
    {
      id: 'ad-repl-ordering',
      type: 'ordering',
      question: 'Ordne die konzeptionellen Schritte einer Änderung.',
      items: ['Änderung auf DC01', 'Replikationsbedarf', 'Änderung übertragen', 'DC02 aktualisiert'],
      correctOrder: [0, 1, 2, 3],
      explanation: 'Zuerst die Änderung, dann Erkennen des Bedarfs, Übertragung und schließlich Aktualisierung des Partners.',
    },
    {
      id: 'ad-repl-schema-change-transfer',
      type: 'select-best',
      question: 'Im Forest gibt es Domain A und Domain B. Das Schema wird geändert. Welche DCs benötigen diese Änderung?',
      options: ['Nur die DCs in Domain A', 'Alle DCs im Forest', 'Nur der Schema Master', 'Nur die DCs in Domain B'],
      correct: 1,
      explanation: 'Schema-Partition ist forestweit, daher erhalten alle DCs des Forests die Schemaänderung.',
    },
    {
      id: 'ad-repl-domain-change-transfer',
      type: 'select-best',
      question: 'Ein Benutzer in Domain A wird geändert. Muss deshalb automatisch jeder DC in Domain B die vollständige Domain-A-Partition erhalten?',
      options: ['Ja, damit alle DCs des Forests synchron sind', 'Nein, Domain-Partitionen sind domänenspezifisch', 'Ja, aber nur wenn ein Trust besteht', 'Nein, denn Änderungen werden niemals repliziert'],
      correct: 1,
      explanation: 'Domain-Partitionen werden an die DCs der jeweiligen Domain repliziert, nicht automatisch an alle DCs im Forest.',
    },
    {
      id: 'ad-repl-store-forward-select',
      type: 'select-best',
      question: 'Was versteht man unter Store-and-Forward im Grundmodell?',
      options: ['Jeder DC kopiert sekündlich die ganze Datenbank', 'Änderungen können über Replikationspartner weitergegeben werden', 'Nur der PDC darf Daten senden', 'Es gibt keine Topologie, jeder DC ist isoliert'],
      correct: 1,
      explanation: 'Store-and-Forward erlaubt es, Änderungen über die Topologie weiterzureichen, ohne dass jeder DC direkt mit jedem anderen kommunizieren muss.',
    },
    {
      id: 'ad-repl-status-select',
      type: 'select-best',
      question: 'Warum halten DCs Statusinformationen über bekannte Änderungen?',
      options: ['Um zu wissen, welche Änderungen bereits repliziert wurden und welche noch fehlen', 'Um den Benutzer zu benachrichtigen', 'Um die NTDS.DIT zu verschlüsseln', 'Um DNS-Einträge zu aktualisieren'],
      correct: 0,
      explanation: 'Statusinformationen helfen den DCs, Duplikate zu vermeiden und ausstehende Änderungen zu erkennen.',
    },
    {
      id: 'ad-repl-troubleshooting-select',
      type: 'select-best',
      question: 'DC01 zeigt eine neue Gruppenmitgliedschaft, DC02 noch nicht. Was ist zuerst verdächtig?',
      options: ['Replikation / Replikationszustand', 'Das Netzwerkkabel von DC02 ist defekt', 'Der Benutzer muss neu angelegt werden', 'Das Schema muss erweitert werden'],
      correct: 0,
      explanation: 'Unterschiedliche Datenstände zwischen DCs deuten zunächst auf Replikation hin, bevor man tiefere Ursachen sucht.',
    },
  ];

  const quiz = [
    { question: 'Warum braucht AD Replikation?', options: ['Damit alle DCs konsistente Verzeichnisinformationen haben', 'Damit der primäre DC schneller wird', 'Damit DNS-Zonen gelöscht werden', 'Damit Benutzer lokal gespeichert werden'], correct: 0, explanation: 'Replikation hält die Verzeichnisdaten auf den DCs konsistent.' },
    { question: 'Was bedeutet Multi-Master?', options: ['Nur ein DC darf Änderungen vornehmen', 'Änderungen können auf mehreren DCs erfolgen und werden abgeglichen', 'Jeder DC hat eine eigene Domäne', 'Replikation wird abgeschaltet'], correct: 1, explanation: 'Multi-Master erlaubt verteilte Änderungen, die später repliziert werden.' },
    { question: 'Was ist NTDS.DIT?', options: ['Eine separate Datei pro Partition', 'Die zentrale AD-Datenbankdatei auf einem DC', 'Ein Replikationsprotokoll', 'Ein DNS-Server'], correct: 1, explanation: 'NTDS.DIT ist die AD-Datenbank eines DCs, logisch in Partitionen unterteilt.' },
    { question: 'Welche Partitionen werden forestweit repliziert?', options: ['Schema und Configuration', 'Nur die Domain-Partition', 'Nur Application', 'Nur DNS-Daten'], correct: 0, explanation: 'Schema- und Configuration-Partition gelten für den gesamten Forest.' },
    { question: 'Wohin gehören Benutzerkonten einer Domain typischerweise?', options: ['In die Schema-Partition', 'In die Domain-Partition ihrer Domäne', 'In die Configuration-Partition', 'In die Application-Partition'], correct: 1, explanation: 'Benutzer, Gruppen, Computer und OUs einer Domain liegen in der Domain-Partition.' },
    { question: 'Was ist ein RODC?', options: ['Ein schreibbarer Multi-Master-DC', 'Ein DC mit schreibgeschützter AD-Kopie', 'Eine FSMO-Rolle', 'Ein DNS-Tool'], correct: 1, explanation: 'RODC hält eine schreibgeschützte Kopie der AD-Datenbank.' },
    { question: 'Was bedeutet Delta-Replikation?', options: ['Die ganze NTDS.DIT wird übertragen', 'Nur Änderungen werden übertragen', 'Nur neue Objekte werden repliziert', 'Partitionen werden nie repliziert'], correct: 1, explanation: 'Delta-Replikation überträgt nur die tatsächlichen Änderungen.' },
    { question: 'Welcher Vorgang löst Replikation aus?', options: ['Das Herunterfahren eines DCs', 'Eine Änderung an einem AD-Objekt', 'Das Öffnen des Browsers', 'Das Installieren eines Druckers'], correct: 1, explanation: 'Erstellen, Ändern, Verschieben oder Löschen von AD-Objekten löst Replikation aus.' },
  ];

  const summary = [
    'Active Directory repliziert Verzeichnisinformationen, damit alle DCs konsistente und aktuelle Daten haben.',
    'Ohne Replikation würden Änderungen auf einem DC andere DCs nicht erreichen.',
    'AD arbeitet grundsätzlich Multi-Master: Änderungen können auf mehreren schreibbaren DCs erfolgen und werden abgeglichen.',
    'FSMO-Rollen sind gezielte Ausnahmen vom Multi-Master-Grundsatz, nicht dessen Ersatz.',
    'Ein RODC hält eine schreibgeschützte Kopie und ist kein normaler Multi-Master-DC.',
    'NTDS.DIT ist die AD-Datenbankdatei eines DCs, logisch in Partitionen gegliedert.',
    'Schema- und Configuration-Partition werden forestweit repliziert.',
    'Die Domain-Partition enthält Objekte einer Domain und wird nur innerhalb dieser Domain repliziert.',
    'Anwendungsverzeichnispartitionen haben einen anwendungsspezifischen, konfigurierbaren Scope.',
    'Replikation wird durch Änderungen an AD-Objekten ausgelöst und arbeitet delta-basiert.',
    'Store-and-Forward und Statusinformationen helfen, Änderungen effizient in der Topologie weiterzugeben.',
  ];

  return { title: 'Replikationsgrundlagen & AD-Datenbank', explanations, exercises, quiz, summary };
}
