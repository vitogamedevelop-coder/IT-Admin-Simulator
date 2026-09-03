import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Forest-weite FSMO-Rollen & privilegierte Admin-Gruppen
// Thema 20
// =============================================================================

export const AD_FSMO_ADMIN_GROUPS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-fsmo-admin-groups');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const fsmoScopeSvg = `<svg viewBox="0 0 320 240" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="10" width="280" height="50" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="30" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Forest</text>
  <text x="160" y="46" text-anchor="middle" fill="#8b949e" font-size="9">Gesamtstruktur</text>

  <rect x="40" y="72" width="100" height="36" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="90" y="88" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">Schema Master</text>
  <text x="90" y="100" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Forest</text>

  <rect x="180" y="72" width="100" height="36" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="230" y="88" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">Domain Naming</text>
  <text x="230" y="100" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Forest</text>

  <rect x="20" y="125" width="280" height="105" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="160" y="145" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Domäne (Beispiel: nexus.local)</text>

  <rect x="40" y="160" width="75" height="34" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="77" y="174" text-anchor="middle" fill="#00f0ff" font-size="8" font-weight="bold">RID Master</text>
  <text x="77" y="186" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Domäne</text>

  <rect x="122" y="160" width="75" height="34" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="159" y="174" text-anchor="middle" fill="#00f0ff" font-size="8" font-weight="bold">PDC Emulator</text>
  <text x="159" y="186" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Domäne</text>

  <rect x="205" y="160" width="75" height="34" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="242" y="174" text-anchor="middle" fill="#00f0ff" font-size="8" font-weight="bold">Infrastructure</text>
  <text x="242" y="186" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Domäne</text>

  <text x="160" y="245" text-anchor="middle" fill="#8b949e" font-size="9">Forestweit 2 Rollen · Domänenweit 3 Rollen pro Domäne</text>
</svg>`;

const adminScopeSvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="90" y="10" width="140" height="40" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="30" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Forest</text>
  <text x="160" y="44" text-anchor="middle" fill="#8b949e" font-size="9">Enterprise Admins · Schema Admins</text>

  <rect x="40" y="70" width="240" height="40" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="88" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">Domain</text>
  <text x="160" y="102" text-anchor="middle" fill="#8b949e" font-size="9">Domain Admins</text>

  <rect x="110" y="130" width="100" height="40" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="2"/>
  <text x="160" y="148" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Lokal</text>
  <text x="160" y="162" text-anchor="middle" fill="#8b949e" font-size="9">Administratoren (Computer)</text>

  <text x="160" y="200" text-anchor="middle" fill="#c9d1d9" font-size="10">Scope wächst: Computer → Domain → Forest</text>
</svg>`;

export function buildAdFsmoAdminGroupsLesson() {
  const explanations = [
    explanation('fsmo-admin-intro-classic', 'Warum FSMO-Rollen?', 'classic', [
      { type: 'text', content: 'Active Directory arbeitet grundsätzlich als Multi-Master-System: Viele Änderungen können auf verschiedenen Domain Controllern erfolgen und werden repliziert. Manche Aufgaben sind aber so kritisch, dass sie nicht gleichzeitig von mehreren DCs unabhängig ausgeführt werden dürfen.' },
      { type: 'text', content: 'Dafür gibt es FSMO-Rollen (Flexible Single Master Operations). Sie legen für bestimmte Aufgaben einen eindeutigen Zuständigen fest – entweder pro Domäne oder pro gesamtem Forest.' },
      { type: 'question', question: 'Warum braucht AD trotz Multi-Master-Replikation FSMO-Rollen?', options: ['Damit alle DCs gleichzeitig denselben kritischen Vorgang ausführen', 'Weil bestimmte Aufgaben nur eindeutig zuständig sein dürfen, um Konflikte zu vermeiden', 'Damit die Replikation komplett abgeschaltet wird', 'Weil jeder DC sonst gleich viele RIDs bekommt'], correct: 1, explanation: 'FSMO-Rollen sind gezielte Ausnahmen vom Multi-Master-Prinzip. Sie vermeiden Konflikte bei besonders kritischen Änderungen.' },
    ]),
    explanation('fsmo-admin-intro-intuitive', 'Der Protokollführer im Bauprojekt', 'intuitive', [
      { type: 'text', content: 'Stell dir ein großes Bauprojekt vor: Tausende Handwerker arbeiten gleichzeitig, und in der Regel können viele Aufgaben parallel erledigt werden. Aber wenn zwei Planer unabhängig versuchen, die Gebäudeaußenwand zu verschieben, entsteht Chaos.' },
      { type: 'text', content: 'FSMO-Rollen sind wie ein besonderer Protokollführer: Für ganz bestimmte, konfliktträchtige Entscheidungen gibt es genau eine Person, die das letzte Wort hat. Der Rest des Projekts läuft weiter dezentral.' },
    ]),
    explanation('fsmo-admin-five-roles-classic', 'Die fünf FSMO-Rollen im Überblick', 'classic', [
      { type: 'text', content: 'Es gibt insgesamt fünf FSMO-Rollen. Drei davon gelten je einmal pro Domäne, zwei gelten für den gesamten Forest.' },
      { type: 'diagram', content: fsmoScopeSvg },
      { type: 'list', title: 'Domänenweit (pro Domäne)', items: [
        'RID Master – verteilt Bereiche eindeutiger Relative Identifier.',
        'PDC Emulator – koordiniert unter anderem Kennwortänderungen und Zeitsynchronisation.',
        'Infrastructure Master – hält domänenübergreifende Referenzen aktuell.',
      ] },
      { type: 'list', title: 'Forestweit (pro Forest)', items: [
        'Domain Naming Master – koordiniert Änderungen an der Domainstruktur.',
        'Schema Master – kontrolliert Änderungen am AD-Schema.',
      ] },
      { type: 'question', question: 'Welche Rollen gelten für den gesamten Forest?', options: ['RID Master und PDC Emulator', 'Schema Master und Domain Naming Master', 'Infrastructure Master und RID Master', 'PDC Emulator und Infrastructure Master'], correct: 1, explanation: 'Schema Master und Domain Naming Master sind forestweit. Die anderen drei Rollen gibt es pro Domäne.' },
    ]),
    explanation('fsmo-admin-forest-wide-classic', 'Forestweite Rollen: Domain Naming & Schema', 'classic', [
      { type: 'text', content: 'Schema Master und Domain Naming Master existieren genau einmal pro Forest. Sie greifen in Bereiche ein, die alle Domänen gemeinsam betreffen.' },
      { type: 'text', content: 'Der Schema Master ist zuständig für das Schema – also die Definition erlaubter Objekttypen, Attribute und Regeln. Änderungen am Schema betreffen den gesamten Forest.' },
      { type: 'text', content: 'Der Domain Naming Master koordiniert Änderungen am Domain-Namespace: das Hinzufügen, Entfernen oder Umbenennen von Domänen. Er sorgt dafür, dass der Forest konsistent bleibt.' },
      { type: 'question', question: 'Eine Anwendung benötigt eine Schemaerweiterung. Welche Rolle ist zuständig?', options: ['Domain Naming Master', 'Schema Master', 'RID Master', 'PDC Emulator'], correct: 1, explanation: 'Schemaänderungen für den gesamten Forest werden vom Schema Master koordiniert.' },
      { type: 'question', question: 'Eine neue Child-Domain soll dem Forest hinzugefügt werden. Welche forestweite Rolle ist besonders beteiligt?', options: ['Schema Master', 'Domain Naming Master', 'Infrastructure Master', 'RID Master'], correct: 1, explanation: 'Der Domain Naming Master koordiniert Änderungen an der Domainstruktur im Forest.' },
    ]),
    explanation('fsmo-admin-domain-wide-classic', 'Domänenweite Rollen im Rückblick', 'classic', [
      { type: 'text', content: 'Die drei domänenweiten Rollen wurden bereits im Domain-Controller-Block behandelt. Hier nur die Einordnung: Jede Domäne besitzt eigene Instanzen von RID Master, PDC Emulator und Infrastructure Master.' },
      { type: 'list', title: 'Kurzaufgaben', items: [
        'RID Master: Vergabe eindeutiger Anteile von Sicherheitskennungen.',
        'PDC Emulator: bevorzugtes Ziel für Kennwortänderungen und Zeitkoordination.',
        'Infrastructure Master: Aktualisierung von Referenzen auf Objekte anderer Domänen.',
      ] },
      { type: 'text', content: 'Ein Forest mit drei Domänen hat also drei RID Master, drei PDC Emulatoren und drei Infrastructure Master – aber nur je einen Schema Master und Domain Naming Master.' },
    ]),
    explanation('fsmo-admin-domain-naming-classic', 'Domain Naming Master im Detail', 'classic', [
      { type: 'text', content: 'Der Domain Naming Master wird immer dann relevant, wenn sich die Domainstruktur des Forests ändert: neue Domänen, entfernte Domänen oder Umbenennungen.' },
      { type: 'text', content: 'Er stellt sicher, dass der Forest-Namespace konsistent bleibt und keine widersprüchlichen Domain-Namen auftreten. Er ist nicht dafür zuständig, allgemeine Namenskonventionen zu prüfen – seine Aufgabe ist die konsistente Verwaltung des Domain-Namespace.' },
      { type: 'question', question: 'Was koordiniert der Domain Naming Master?', options: ['Schemaänderungen', 'Änderungen an der Domainstruktur des Forests', 'Zeitsynchronisation', 'RID-Vergabe'], correct: 1, explanation: 'Der Domain Naming Master kümmert sich um Hinzufügen, Entfernen und Umbenennen von Domänen.' },
    ]),
    explanation('fsmo-admin-schema-master-classic', 'Schema Master im Detail', 'classic', [
      { type: 'text', content: 'Das Active-Directory-Schema beschreibt, welche Objektarten es gibt, welche Attribute sie besitzen dürfen und wie sie strukturiert sind. Beispiele sind Benutzer, Computer, Gruppen und deren Eigenschaften.' },
      { type: 'text', content: 'Der Schema Master ist der einzige DC, auf dem Schemaänderungen für den gesamten Forest initiiert werden. Das ist beabsichtigt: Schemaänderungen wirken sich auf alle Domänen aus und müssen daher zentral koordiniert werden.' },
      { type: 'question', question: 'Welche Aussage zum Schema Master stimmt?', options: ['Es gibt ihn einmal pro Domäne', 'Er kontrolliert Schemaänderungen für den gesamten Forest', 'Er verwaltet DNS-Zonen', 'Er ist für die Zeitsynchronisation zuständig'], correct: 1, explanation: 'Der Schema Master existiert genau einmal pro Forest und koordiniert Schemaänderungen.' },
    ]),
    explanation('fsmo-admin-failure-classic', 'Ausfallverhalten', 'classic', [
      { type: 'text', content: 'Wenn eine forestweite FSMO-Rolle ausfällt, bricht der normale Betrieb nicht sofort zusammen. Anmeldungen, Dateizugriffe und Replikation laufen in der Regel weiter.' },
      { type: 'text', content: 'Allerdings sind bestimmte administrative Änderungen blockiert: Ohne Schema Master können keine Schemaerweiterungen durchgeführt werden; ohne Domain Naming Master lassen sich keine Domänen hinzufügen oder entfernen.' },
      { type: 'text', content: 'Wichtig: Das bedeutet nicht, dass der Ausfall „keine Auswirkungen“ hat. Es bedeutet, dass der laufende Betrieb zunächst weitergeht, während spezifische Änderungen nicht möglich sind.' },
      { type: 'question', question: 'Schema Master fällt aus. Was ist typisch?', options: ['Alle Anmeldungen im Forest sofort unmöglich', 'Schemaänderungen sind nicht möglich, der Betrieb läuft aber weiter', 'Alle Domänen werden sofort unbrauchbar', 'Replikation wird vollständig gestoppt'], correct: 1, explanation: 'Ein ausgefallener Schema Master blockiert Schemaänderungen, der laufende Betrieb kann aber weitergehen.' },
    ]),
    explanation('fsmo-admin-placement-classic', 'Platzierung als Designentscheidung', 'classic', [
      { type: 'text', content: 'Wo die forestweiten Rollen liegen, ist keine starre technische Pflicht, sondern eine Designentscheidung. In vielen Umgebungen liegen Schema Master und Domain Naming Master auf demselben gut erreichbaren DC – das ist ein häufiges und oft sinnvolles Muster, aber nicht zwingend.' },
      { type: 'text', content: 'Auch Empfehlungen wie „RID Master und PDC Emulator auf einem DC lassen“ oder „Infrastructure Master nicht auf einem Global Catalog“ sind situationsabhängig. Sie hängen vom Forest-Design, der Anzahl der Domänen, der Latenz und den Verfügbarkeitsanforderungen ab.' },
      { type: 'text', content: 'Die wichtigste Lernthese: FSMO-Platzierung ist eine bewusste Designentscheidung, keine universelle Schablone.' },
      { type: 'question', question: 'Wie sollte man FSMO-Platzierung verstehen?', options: ['Als starre Regel, die in jedem Forest gleich aussieht', 'Als Designentscheidung, die von der Umgebung abhängt', 'Als etwas, das Microsoft automatisch richtig macht', 'Als reinen DNS-Aspekt'], correct: 1, explanation: 'FSMO-Platzierung hängt von Design, Latenz, Verfügbarkeit und Forest-Struktur ab.' },
    ]),
    explanation('fsmo-admin-admin-groups-classic', 'Privilegierte Administratorgruppen', 'classic', [
      { type: 'text', content: 'Nicht jede „Administrator“-Gruppe hat denselben Wirkungsbereich. Es ist wichtig, den Unterschied zwischen lokalem, domänenweitem und forestweitem Scope zu verstehen.' },
      { type: 'diagram', content: adminScopeSvg },
      { type: 'list', title: 'Gruppen und ihre Reichweite', items: [
        'Lokale Administratoren: Rechte auf dem jeweiligen Computer, nicht forestweit.',
        'Domain Admins: Weitreichende Rechte innerhalb einer Domäne.',
        'Enterprise Admins (Organisations-Admins): Forestweite administrative Rechte.',
        'Schema Admins: Dürfen Schemaänderungen durchführen – sehr kritisch.',
      ] },
      { type: 'question', question: 'Welche Gruppe hat forestweiten administrativen Scope?', options: ['Domain Admins', 'Lokale Administratoren', 'Enterprise Admins', 'Schema Admins'], correct: 2, explanation: 'Enterprise Admins (Organisations-Admins) haben forestweiten Scope. Domain Admins sind domänenweit, lokale Administratoren beschränken sich auf einen Rechner.' },
    ]),
    explanation('fsmo-admin-admin-groups-detail-classic', 'Scope-Abgrenzung im Detail', 'classic', [
      { type: 'text', content: 'Enterprise Admins existieren nur in der Root-Domain des Forests. Ihr Scope ist der gesamte Forest. Das macht sie nicht einfach zu „stärkeren Domain Admins“, sondern zu einer eigenen Rolle mit eigenem Verantwortungsbereich.' },
      { type: 'text', content: 'Schema Admins ist keine alltägliche Admin-Gruppe. Sie sollte nur Mitglieder enthalten, wenn tatsächlich Schemaänderungen geplant sind. Nach der Änderung sollte die Mitgliedschaft – je nach Organisationsmodell – wieder reduziert werden.' },
      { type: 'text', content: 'Das eingebaute Administrator-Konto der ersten Domain ist besonders kritisch und sollte besonders geschützt werden: starke Authentifizierung, keine Alltagsnutzung, getrennte Admin-Konten und konsequentes Least Privilege.' },
      { type: 'question', question: 'Wie unterscheiden sich Domain Admins und Enterprise Admins am besten?', options: ['Domain Admins sind generell mächtiger', 'Sie haben unterschiedliche administrative Scopes', 'Enterprise Admins gelten pro Computer', 'Beide haben denselben Scope'], correct: 1, explanation: 'Domain Admins wirken domänenweit, Enterprise Admins forestweit. Sie haben unterschiedliche Scopes und Aufgaben.' },
    ]),
    explanation('fsmo-admin-least-privilege-classic', 'Least Privilege und kritische Konten', 'classic', [
      { type: 'text', content: 'Hochprivilegierte Gruppen sind kein Ersatz für gezielte Delegation. Ein Helpdesk-Mitarbeiter, der Passwörter zurücksetzen soll, braucht keine Domain-Admin- oder Enterprise-Admin-Mitgliedschaft. Stattdessen wird eine gezielte Delegation auf OU-Ebene verwendet.' },
      { type: 'text', content: 'Die Mitgliedschaft in Schema Admins sollte nur für die Dauer notwendiger Schemaänderungen bestehen bleiben. Normale administrative Tätigkeit, Domain-Admins- und Enterprise-Admins-Mitgliedschaften sind drei deutlich verschiedene Dinge.' },
      { type: 'question', question: 'Ein Helpdesk-Mitarbeiter soll Passwörter zurücksetzen. Was ist der sicherste Weg?', options: ['Mitgliedschaft in Domain Admins', 'Gezielte Delegation auf OU-Ebene', 'Mitgliedschaft in Enterprise Admins', 'Mitgliedschaft in Schema Admins'], correct: 1, explanation: 'Delegation nach Least Privilege erteilt nur die nötigen Rechte auf dem passenden Scope.' },
    ]),
  ];

  const exercises = [
    {
      id: 'fsmo-admin-role-scope-matching',
      type: 'matching',
      question: 'Ordne jede FSMO-Rolle dem passenden Scope zu.',
      pairs: [
        { left: 'Schema Master', right: 'forestweit' },
        { left: 'Domain Naming Master', right: 'forestweit' },
        { left: 'RID Master', right: 'domänenweit' },
        { left: 'PDC Emulator', right: 'domänenweit' },
        { left: 'Infrastructure Master', right: 'domänenweit' },
      ],
      explanation: 'Schema Master und Domain Naming Master gelten pro Forest. RID Master, PDC Emulator und Infrastructure Master gelten pro Domäne.',
    },
    {
      id: 'fsmo-admin-admin-scope-matching',
      type: 'matching',
      question: 'Ordne jede Admin-Gruppe ihrem Scope zu.',
      pairs: [
        { left: 'Lokale Administratoren', right: 'einzelner Computer' },
        { left: 'Domain Admins', right: 'eine Domäne' },
        { left: 'Enterprise Admins', right: 'Forest' },
        { left: 'Schema Admins', right: 'Schemaänderungen im Forest' },
      ],
      explanation: 'Die Gruppen haben unterschiedliche Reichweiten. Lokale Administratoren wirken nur auf einem System, Domain Admins domänenweit, Enterprise Admins forestweit und Schema Admins dürfen Schemaänderungen vornehmen.',
    },
    {
      id: 'fsmo-admin-scope-select',
      type: 'select-best',
      question: 'Welche FSMO-Rollen sind forestweit?',
      options: ['RID Master und PDC Emulator', 'Schema Master und Domain Naming Master', 'Infrastructure Master und RID Master', 'PDC Emulator und Infrastructure Master'],
      correct: 1,
      explanation: 'Nur Schema Master und Domain Naming Master gelten für den gesamten Forest.',
    },
    {
      id: 'fsmo-admin-domain-add-scenario',
      type: 'select-best',
      question: 'Eine neue Child-Domain soll dem Forest hinzugefügt werden. Welche forestweite Rolle ist hier zentral?',
      options: ['Schema Master', 'Domain Naming Master', 'RID Master', 'PDC Emulator'],
      correct: 1,
      explanation: 'Der Domain Naming Master koordiniert Änderungen an der Domainstruktur.',
    },
    {
      id: 'fsmo-admin-schema-change-scenario',
      type: 'select-best',
      question: 'Eine Anwendung erfordert eine Schemaerweiterung. Welche Rolle ist zuständig?',
      options: ['Domain Naming Master', 'Schema Master', 'Infrastructure Master', 'RID Master'],
      correct: 1,
      explanation: 'Der Schema Master kontrolliert Schemaänderungen für den gesamten Forest.',
    },
    {
      id: 'fsmo-admin-failure-scenario',
      type: 'select-best',
      question: 'Der Domain Naming Master fällt aus. Was trifft typischerweise zu?',
      options: ['Alle Anmeldungen im Forest sofort unmöglich', 'Domainstrukturänderungen sind nicht möglich, der laufende Betrieb läuft aber weiter', 'Alle Domänen werden unbrauchbar', 'Replikation wird vollständig gestoppt'],
      correct: 1,
      explanation: 'Der laufende Betrieb kann weitergehen, aber Hinzufügen/Entfernen von Domänen ist blockiert.',
    },
    {
      id: 'fsmo-admin-misconception-forestwide',
      type: 'select-best',
      question: 'Welche Aussage ist falsch?',
      options: ['Es gibt pro Forest genau einen Schema Master', 'Es gibt pro Domäne genau einen RID Master', 'Der Domain Naming Master existiert pro Forest nur einmal', 'Der PDC Emulator ist eine forestweite Rolle'],
      correct: 3,
      explanation: 'PDC Emulator ist eine domänenweite Rolle, nicht forestweit.',
    },
    {
      id: 'fsmo-admin-counting',
      type: 'select-best',
      question: 'Ein Forest hat drei Domänen. Wie viele FSMO-Rolleninstanzen gibt es insgesamt?',
      options: ['5', '9', '11', '15'],
      correct: 2,
      explanation: '2 forestweite Rollen + 3 Domänen × 3 domänenweite Rollen = 11.',
    },
    {
      id: 'fsmo-admin-helpdesk-delegation',
      type: 'select-best',
      question: 'Ein Helpdesk-Mitarbeiter soll Passwörter einer OU zurücksetzen. Welche Lösung passt am besten zu Least Privilege?',
      options: ['Mitgliedschaft in Domain Admins', 'Mitgliedschaft in Enterprise Admins', 'Gezielte Delegation auf OU-Ebene', 'Mitgliedschaft in Schema Admins'],
      correct: 2,
      explanation: 'Delegation auf OU-Ebene erteilt nur die nötigen Rechte.',
    },
    {
      id: 'fsmo-admin-schema-admin-transfer',
      type: 'select-best',
      question: 'Ein Administrator muss einmalig das Schema erweitern. Was ist aus Sicherheitssicht am besten?',
      options: ['Dauerhaft Mitglied in Schema Admins bleiben', 'Schema Admin nur für die Aufgabe verwenden und Mitgliedschaft danach wieder entziehen', 'Domain Admin verwenden, weil das ausreicht', 'Enterprise Admin verwenden, weil der mehr Rechte hat'],
      correct: 1,
      explanation: 'Schema Admins sind sehr mächtig; die Mitgliedschaft sollte auf das erforderliche Zeitfenster begrenzt werden.',
    },
    {
      id: 'fsmo-admin-enterprise-vs-domain',
      type: 'select-best',
      question: 'Wie unterscheiden sich Enterprise Admins von Domain Admins sinnvoll?',
      options: ['Enterprise Admins sind einfach stärkere Domain Admins', 'Domain Admins haben forestweiten Scope, Enterprise Admins domänenweiten', 'Sie haben unterschiedliche administrative Scopes', 'Beide Gruppen sind auf einen einzelnen Computer beschränkt'],
      correct: 2,
      explanation: 'Enterprise Admins wirken forestweit, Domain Admins domänenweit. Es sind Rollen mit unterschiedlichem Scope.',
    },
    {
      id: 'fsmo-admin-placement-design',
      type: 'select-best',
      question: 'Wie sollte man die Platzierung der FSMO-Rollen betrachten?',
      options: ['Als starre technische Pflicht', 'Als situationsabhängige Designentscheidung', 'Als Zufall, der keine Bedeutung hat', 'Als alleinige Entscheidung des Clients'],
      correct: 1,
      explanation: 'FSMO-Platzierung hängt von Design, Latenz und Verfügbarkeitsanforderungen ab.',
    },
  ];

  const quiz = [
    { question: 'Welche FSMO-Rollen gelten für den gesamten Forest?', options: ['RID Master und PDC Emulator', 'Schema Master und Domain Naming Master', 'Infrastructure Master und RID Master', 'PDC Emulator und Infrastructure Master'], correct: 1, explanation: 'Schema Master und Domain Naming Master sind forestweit.' },
    { question: 'Welche Rolle koordiniert Änderungen am Domain-Namespace des Forests?', options: ['Schema Master', 'Domain Naming Master', 'Infrastructure Master', 'RID Master'], correct: 1, explanation: 'Der Domain Naming Master ist für das Hinzufügen, Entfernen und Umbenennen von Domänen zuständig.' },
    { question: 'Was beschreibt das Active-Directory-Schema?', options: ['DNS-Zonen', 'Erlaubte Objekttypen, Attribute und Strukturen', 'Netzwerktopologien', 'Client-Betriebssysteme'], correct: 1, explanation: 'Das Schema legt fest, welche Objekte und Attribute es in AD gibt.' },
    { question: 'Wie viele FSMO-Rolleninstanzen gibt es in einem Forest mit zwei Domänen?', options: ['5', '8', '11', '15'], correct: 1, explanation: '2 forestweite Rollen + 2 × 3 domänenweite Rollen = 8.' },
    { question: 'Schema Master fällt aus. Was passiert typischerweise?', options: ['Alle Anmeldungen sind sofort unmöglich', 'Schemaänderungen sind blockiert, der Betrieb läuft weiter', 'Alle Domänen werden unbrauchbar', 'Replikation stoppt komplett'], correct: 1, explanation: 'Schemaänderungen sind nicht mehr möglich, der laufende Betrieb kann aber weitergehen.' },
    { question: 'Welche Gruppe hat forestweiten administrativen Scope?', options: ['Domain Admins', 'Lokale Administratoren', 'Enterprise Admins', 'Schema Admins'], correct: 2, explanation: 'Enterprise Admins (Organisations-Admins) haben forestweiten Scope.' },
    { question: 'Warum sollte ein Helpdesk-Mitarbeiter für Passwortresets kein Domain Admin sein?', options: ['Weil Domain Admins keine Passwörter ändern dürfen', 'Weil gezielte Delegation auf OU-Ebene nach Least Privilege ausreicht', 'Weil Helpdesk-Mitarbeiter keine AD-Rechte brauchen', 'Weil Domain Admins nur lokale Rechte haben'], correct: 1, explanation: 'Delegation erteilt nur die nötigen Rechte und vermeidet übermäßige Privilegien.' },
    { question: 'Wie sollte Schema-Admins-Mitgliedschaft aus Sicherheitssicht gehandhabt werden?', options: ['Dauerhaft für alle Administratoren', 'Nur wenn Schemaänderungen nötig sind, danach wieder reduzieren', 'Automatisch für das Built-in Administrator-Konto', 'Nie, Schemaänderungen sind verboten'], correct: 1, explanation: 'Schema Admins ist sehr mächtig und sollte nur temporär vergeben werden.' },
  ];

  const summary = [
    'Active Directory arbeitet grundsätzlich Multi-Master; FSMO-Rollen sind gezielte Ausnahmen für konfliktträchtige Aufgaben.',
    'Es gibt fünf FSMO-Rollen: zwei forestweit (Schema Master, Domain Naming Master) und drei domänenweit (RID Master, PDC Emulator, Infrastructure Master).',
    'Schema Master koordiniert Schemaänderungen für den gesamten Forest.',
    'Domain Naming Master koordiniert Änderungen an der Domainstruktur.',
    'Ein Ausfall forestweiter Rollen blockiert bestimmte Änderungen, der laufende Betrieb kann aber weitergehen.',
    'FSMO-Platzierung ist eine Designentscheidung, keine starre Schablone.',
    'Privilegierte Gruppen haben unterschiedliche Scopes: lokal, domänenweit, forestweit, Schema.',
    'Least Privilege und gezielte Delegation sind wichtiger als Mitgliedschaft in hochprivilegierten Gruppen.',
  ];

  return { title: 'FSMO-Rollen & privilegierte Admin-Gruppen', explanations, exercises, quiz, summary };
}
