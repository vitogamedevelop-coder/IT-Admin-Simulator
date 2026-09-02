import { topicKey } from '../academyTopics.js';

export const AD_TREE_FOREST_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-tree-forest');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const namespaceSvg = `<svg viewBox="0 0 320 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">DNS-Namensraum erweitern</text>

  <rect x="100" y="40" width="120" height="30" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="160" y="60" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">its.bw</text>
  <text x="160" y="78" text-anchor="middle" fill="#8b949e" font-size="8">Root Domain</text>

  <path d="M160 70 L160 100" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="70" y="105" width="180" height="30" rx="4" fill="#0d1117" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="160" y="125" text-anchor="middle" fill="#58a6ff" font-size="10" font-weight="bold">ausbildung.its.bw</text>
  <text x="160" y="143" text-anchor="middle" fill="#8b949e" font-size="8">Child Domain</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#8b949e"/>
    </marker>
  </defs>
</svg>`;

const treeForestSvg = `<svg viewBox="0 0 360 260" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Forest mit mehreren Trees</text>

  <rect x="110" y="35" width="140" height="30" rx="4" fill="#0d1117" stroke="#7c3aed" stroke-width="2"/>
  <text x="180" y="55" text-anchor="middle" fill="#7c3aed" font-size="10" font-weight="bold">Forest</text>

  <line x1="180" y1="65" x2="180" y2="85" stroke="#8b949e" stroke-width="2"/>
  <line x1="100" y1="85" x2="260" y2="85" stroke="#8b949e" stroke-width="2"/>
  <line x1="100" y1="85" x2="100" y2="100" stroke="#8b949e" stroke-width="2"/>
  <line x1="260" y1="85" x2="260" y2="100" stroke="#8b949e" stroke-width="2"/>

  <rect x="20" y="105" width="160" height="120" rx="4" fill="#0d1117" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="100" y="125" text-anchor="middle" fill="#58a6ff" font-size="10" font-weight="bold">Tree 1</text>
  <rect x="40" y="135" width="120" height="25" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="100" y="152" text-anchor="middle" fill="#00f0ff" font-size="9">its.bw</text>
  <rect x="40" y="170" width="120" height="25" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="100" y="187" text-anchor="middle" fill="#00f0ff" font-size="9">ausbildung.its.bw</text>
  <rect x="40" y="205" width="120" height="25" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="100" y="222" text-anchor="middle" fill="#00f0ff" font-size="9">verwaltung.its.bw</text>

  <rect x="180" y="105" width="160" height="120" rx="4" fill="#0d1117" stroke="#f78166" stroke-width="1.5"/>
  <text x="260" y="125" text-anchor="middle" fill="#f78166" font-size="10" font-weight="bold">Tree 2</text>
  <rect x="200" y="135" width="120" height="25" rx="4" fill="#0d1117" stroke="#2ea043" stroke-width="1.5"/>
  <text x="260" y="152" text-anchor="middle" fill="#2ea043" font-size="9">partner.local</text>
  <rect x="200" y="170" width="120" height="25" rx="4" fill="#0d1117" stroke="#2ea043" stroke-width="1.5"/>
  <text x="260" y="187" text-anchor="middle" fill="#2ea043" font-size="9">training.partner.local</text>
  <rect x="200" y="205" width="120" height="25" rx="4" fill="#0d1117" stroke="#2ea043" stroke-width="1.5"/>
  <text x="260" y="222" text-anchor="middle" fill="#2ea043" font-size="9">it.partner.local</text>
</svg>`;

const hierarchySvg = `<svg viewBox="0 0 280 280" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="140" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">AD-Hierarchie</text>

  <rect x="90" y="35" width="100" height="30" rx="4" fill="#0d1117" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="140" y="55" text-anchor="middle" fill="#7c3aed" font-size="10" font-weight="bold">Forest</text>

  <line x1="140" y1="65" x2="140" y2="85" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="90" y="90" width="100" height="30" rx="4" fill="#0d1117" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="140" y="110" text-anchor="middle" fill="#58a6ff" font-size="10" font-weight="bold">Tree</text>

  <line x1="140" y1="120" x2="140" y2="140" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="90" y="145" width="100" height="30" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="140" y="165" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Domain</text>

  <line x1="140" y1="175" x2="140" y2="195" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="90" y="200" width="100" height="30" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="140" y="220" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">OU</text>

  <line x1="140" y1="230" x2="140" y2="250" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="90" y="255" width="100" height="25" rx="4" fill="#0d1117" stroke="#2ea043" stroke-width="1.5"/>
  <text x="140" y="272" text-anchor="middle" fill="#2ea043" font-size="9" font-weight="bold">Object</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#8b949e"/>
    </marker>
  </defs>
</svg>`;

export function buildAdTreeForestLesson() {
  const title = 'Trees, Forests & Subdomänen';

  const explanations = [
    explanation('ad-tree-forest-recap', 'Bisherige logische Komponenten', 'classic', [
      { type: 'text', content: 'Bisher kennst du die kleineren Bausteine von Active Directory: Objekte, Organisationseinheiten und Domänen. Jetzt kommen zwei größere logische Ebenen hinzu: der Tree und der Forest. Sie ordnen Domänen in eine Hierarchie ein.' },
      { type: 'question', question: 'Welche logische Ebene kommt direkt über der Domäne?', options: ['Forest', 'Tree', 'OU', 'Objekt'], correct: 1, explanation: 'Eine Domäne gehört zu einem Tree; ein oder mehrere Trees bilden einen Forest.' },
    ]),

    explanation('ad-tree-forest-domain', 'Domäne als Basis', 'classic', [
      { type: 'text', content: 'Eine Domäne ist ein logischer Verwaltungs- und Namensbereich in Active Directory. Sie enthält Benutzer, Gruppen, Computer und weitere Objekte. Ein einfaches Beispiel ist its.bw.' },
      { type: 'question', question: 'Was ist eine Domäne in AD?', options: ['Ein physischer Server', 'Ein logischer Verwaltungs- und Namensbereich', 'Eine Netzwerkkarte', 'Eine Festplatte'], correct: 1, explanation: 'Eine Domäne ist ein logischer Bereich mit eigenen Objekten.' },
    ]),

    explanation('ad-tree-forest-root', 'Stammdomäne', 'classic', [
      { type: 'text', content: 'Die erste Domäne eines zusammenhängenden DNS-Namensraums bildet die Stammdomäne, auch Root Domain genannt. Sie ist die oberste Domäne dieses Trees. Beispiel: its.bw ist Root Domain für ausbildung.its.bw.' },
      { type: 'question', question: 'Was ist die Stammdomäne eines Trees?', options: ['Die unterste Child Domain', 'Die oberste Root Domain des Namensraums', 'Ein Domain Controller', 'Eine OU'], correct: 1, explanation: 'Die Root Domain ist die oberste Domäne des zusammenhängenden DNS-Namensraums.' },
    ]),

    explanation('ad-tree-forest-child', 'Subdomäne / Child Domain', 'classic', [
      { type: 'text', content: 'Eine Subdomäne, auch Child Domain, baut auf dem DNS-Namensraum der übergeordneten Domäne auf. Aus its.bw kann ausbildung.its.bw entstehen. Parent und Child bilden einen gemeinsamen, erweiterten Namensraum.' },
      { type: 'question', question: 'Welche dieser Domänen ist eine Child Domain von its.bw?', options: ['partner.local', 'ausbildung.its.bw', 'its.com', 'local.its'], correct: 1, explanation: 'ausbildung.its.bw erweitert den Namensraum von its.bw.' },
    ]),

    explanation('ad-tree-forest-namespace', 'DNS-Namensraum', 'classic', [
      { type: 'text', content: 'Der wichtigste Aspekt einer Child Domain ist der gemeinsame DNS-Namensraum. its.bw, ausbildung.its.bw und klasse1.ausbildung.its.bw gehören zusammen, weil jede Ebene den Namen der übergeordneten Ebene enthält und erweitert.' },
      { type: 'diagram', content: namespaceSvg },
      { type: 'question', question: 'Was bedeutet gemeinsamer DNS-Namensraum?', options: ['Jede Domäne hat einen völlig anderen Namen', 'Child Domains erweitern den Namen der Parent Domain', 'Alle Domänen heißen gleich', 'Nur OUs dürfen Namen haben'], correct: 1, explanation: 'Child Domains bauen den DNS-Namen der Parent Domain fort.' },
    ]),

    explanation('ad-tree-forest-tree', 'Tree', 'classic', [
      { type: 'text', content: 'Ein Tree besteht aus einer oder mehreren Domänen mit zusammenhängendem DNS-Namensraum. its.bw, ausbildung.its.bw und verwaltung.its.bw bilden zusammen einen Tree, weil ihre Namen logisch zusammenhängen.' },
      { type: 'question', question: 'Was kennzeichnet einen Tree?', options: ['Verschiedene DNS-Namensräume', 'Zusammenhängender DNS-Namensraum über mehrere Domänen', 'Nur eine einzelne Domäne', 'Kein Schema'], correct: 1, explanation: 'Ein Tree umfasst Domänen, deren Namen aufeinander aufbauen.' },
    ]),

    explanation('ad-tree-forest-forest', 'Forest', 'classic', [
      { type: 'text', content: 'Ein Forest ist die oberste logische AD-Struktur. Er kann einen oder mehrere Trees enthalten. Wichtig: ein einzelner Tree reicht bereits, um einen Forest zu bilden. Mehrere Trees mit unterschiedlichen Namensräumen können ebenfalls im selben Forest liegen.' },
      { type: 'question', question: 'Was ist ein Forest?', options: ['Eine einzelne Child Domain', 'Die oberste AD-Struktur aus einem oder mehreren Trees', 'Ein DNS-Server', 'Eine OU'], correct: 1, explanation: 'Der Forest ist die oberste logische Struktur in AD.' },
    ]),

    explanation('ad-tree-forest-multi-tree', 'Forest mit mehreren Trees', 'classic', [
      { type: 'text', content: 'Ein Forest kann mehrere Trees mit unterschiedlichen DNS-Namensräumen enthalten. Beispiel: Tree 1 nutzt its.bw, Tree 2 nutzt partner.local. Beide Trees gehören zur selben Gesamtstruktur, obwohl ihre Namen nicht zusammenhängen.' },
      { type: 'diagram', content: treeForestSvg },
      { type: 'question', question: 'Können verschiedene DNS-Namensräume im selben Forest liegen?', options: ['Ja, als verschiedene Trees', 'Nein, niemals', 'Nur innerhalb einer OU', 'Nur wenn sie identisch sind'], correct: 0, explanation: 'Unterschiedliche Trees im selben Forest können verschiedene DNS-Namensräume haben.' },
    ]),

    explanation('ad-tree-forest-shared', 'Gemeinsame Forest-Informationen', 'classic', [
      { type: 'text', content: 'Domänen in einem Forest teilen bestimmte forestweite Informationen: das Schema legt fest, welche Objekttypen und Attribute es gibt; die Konfigurationspartition enthält forestweite AD-Konfigurationen. Lokal können Domänen dennoch eigene Benutzer, Gruppen und Richtlinien besitzen.' },
      { type: 'question', question: 'Was teilen Domänen innerhalb eines Forests?', options: ['Nichts', 'Schema und Konfigurationspartition', 'Nur Benutzerkonten', 'Nur DNS-Namen'], correct: 1, explanation: 'Forest-weit gemeinsam sind Schema und Konfigurationspartition.' },
    ]),

    explanation('ad-tree-forest-distinction', 'Domain vs Tree vs Forest', 'classic', [
      { type: 'text', content: 'Drei Ebenen auf einen Blick: Domäne = einzelner Verwaltungs-/Namensbereich. Tree = Domänen mit zusammenhängendem DNS-Namensraum. Forest = oberste AD-Struktur aus einem oder mehreren Trees.' },
      { type: 'diagram', content: hierarchySvg },
      { type: 'question', question: 'Ordne: Was ist am größten?', options: ['Domain', 'Tree', 'Forest', 'OU'], correct: 2, explanation: 'Forest > Tree > Domain > OU > Objekt.' },
    ]),

    explanation('ad-tree-forest-lookahead', 'Ausblick', 'classic', [
      { type: 'text', content: 'In späteren Themen lernst du, wie Vertrauensstellungen zwischen Domänen und Forests funktionieren und welche forestweiten Verwaltungsrollen es gibt. Diese Details folgen separat.' },
      { type: 'question', question: 'Was folgt später?', options: ['Vertrauensstellungen und forestweite Rollen', 'DNS-Konfiguration', 'Windows-Explorer-Anpassung', 'Grafiktreiber'], correct: 0, explanation: 'Vertrauensstellungen und forestweite Rollen sind Thema 19 und später.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-tree-forest-child-domain',
      type: 'select-best',
      question: 'Welche Domain ist eine Child Domain von its.bw?',
      options: ['partner.local', 'ausbildung.its.bw', 'its.com', 'local.its'],
      correct: 1,
      explanation: 'ausbildung.its.bw erweitert den DNS-Namensraum von its.bw.',
    },
    {
      id: 'ad-tree-forest-tree-example',
      type: 'select-best',
      question: 'corp.local, hr.corp.local und it.corp.local bilden zusammen ...?',
      options: ['einen Tree', 'mehrere Forests', 'nur OUs', 'einen einzelnen Benutzer'],
      correct: 0,
      explanation: 'Die Domänen teilen einen zusammenhängenden DNS-Namensraum, also einen Tree.',
    },
    {
      id: 'ad-tree-forest-different-namespace',
      type: 'select-best',
      question: 'corp.local und research.example gehören zum gleichen Forest. Was gilt?',
      options: ['Es ist derselbe Tree', 'Es sind unterschiedliche Trees im gleichen Forest', 'Das ist unmöglich', 'Sie sind keine Domänen'],
      correct: 1,
      explanation: 'Unterschiedliche DNS-Namensräume können verschiedene Trees im selben Forest sein.',
    },
    {
      id: 'ad-tree-forest-matching',
      type: 'matching',
      question: 'Ordne Begriff und Bedeutung zu.',
      pairs: [
        { left: 'Domain', right: 'einzelner Verwaltungs-/Namensbereich' },
        { left: 'Tree', right: 'zusammenhängender DNS-Namensraum' },
        { left: 'Forest', right: 'oberste AD-Struktur' },
        { left: 'Child Domain', right: 'untergeordneter Domain-Namensraum' },
      ],
      explanation: 'Jede Ebene hat eine klare Rolle in der AD-Hierarchie.',
    },
    {
      id: 'ad-tree-forest-ordering',
      type: 'ordering',
      question: 'Ordne von groß nach klein.',
      items: ['Forest', 'Tree', 'Domain', 'OU', 'Object'],
      correctOrder: [0, 1, 2, 3, 4],
      explanation: 'Forest > Tree > Domain > OU > Object.',
    },
    {
      id: 'ad-tree-forest-classification',
      type: 'select-best',
      question: 'ausbildung.its.bw, verwaltung.its.bw und its.bw sind ein ...?',
      options: ['Forest', 'Tree', 'OU', 'Site'],
      correct: 1,
      explanation: 'Zusammenhängender DNS-Namensraum = Tree.',
    },
    {
      id: 'ad-tree-forest-misconception-1',
      type: 'select-best',
      question: '„Ein Forest benötigt zwingend mindestens zwei Trees." Stimmt das?',
      options: ['Ja', 'Nein'],
      correct: 1,
      explanation: 'Ein Forest kann auch nur aus einem Tree bestehen.',
    },
    {
      id: 'ad-tree-forest-misconception-2',
      type: 'select-best',
      question: '„Alle Domains eines Forests müssen exakt gleich konfiguriert sein." Stimmt das?',
      options: ['Ja, jede Einstellung identisch', 'Nein, nur forestweite Informationen wie Schema werden geteilt'],
      correct: 1,
      explanation: 'Domänen teilen Schema und Configuration Partition, können aber eigene Einstellungen haben.',
    },
    {
      id: 'ad-tree-forest-misconception-3',
      type: 'select-best',
      question: '„Wenn zwei Domains unterschiedliche DNS-Namensräume haben, können sie niemals im gleichen Forest liegen." Stimmt das?',
      options: ['Ja', 'Nein'],
      correct: 1,
      explanation: 'Sie können verschiedene Trees im selben Forest bilden.',
    },
    {
      id: 'ad-tree-forest-transfer-1',
      type: 'select-best',
      question: 'NEXUS besitzt nexus.local und möchte einen logisch untergeordneten Namensbereich für Ausbildung. Welche Domain passt?',
      options: ['partner.local', 'training.nexus.local', 'nexus.example', 'corp.local'],
      correct: 1,
      explanation: 'training.nexus.local erweitert den bestehenden Namensraum und ist eine Child Domain.',
    },
    {
      id: 'ad-tree-forest-transfer-2',
      type: 'select-best',
      question: 'NEXUS übernimmt lab.example. Dieser Namensraum soll im selben Forest integriert werden, ohne geändert zu werden. Was entsteht?',
      options: ['Ein weiterer Tree im Forest', 'Eine Child Domain von nexus.local', 'Eine OU', 'Ein neuer Forest'],
      correct: 0,
      explanation: 'Ein anderer DNS-Namensraum im selben Forest bildet einen eigenen Tree.',
    },
  ];

  const quiz = [
    { question: 'Was ist eine Domäne?', options: ['Ein physischer Server', 'Ein logischer Verwaltungs- und Namensbereich', 'Eine Netzwerkkarte', 'Ein Drucker'], correct: 1, explanation: 'Eine Domäne ist ein logischer AD-Bereich.' },
    { question: 'Welche Domain ist eine Child Domain von its.bw?', options: ['partner.local', 'ausbildung.its.bw', 'its.com', 'bw.its'], correct: 1, explanation: 'ausbildung.its.bw erweitert its.bw.' },
    { question: 'Was kennzeichnet einen Tree?', options: ['Unterschiedliche DNS-Namensräume', 'Zusammenhängender DNS-Namensraum', 'Nur eine Domäne', 'Nur OUs'], correct: 1, explanation: 'Ein Tree besteht aus Domänen mit zusammenhängendem Namensraum.' },
    { question: 'Was ist ein Forest?', options: ['Eine einzelne Child Domain', 'Die oberste AD-Struktur aus einem oder mehreren Trees', 'Ein DNS-Record', 'Eine OU'], correct: 1, explanation: 'Forest ist die oberste logische Einheit.' },
    { question: 'Kann ein Forest nur einen Tree haben?', options: ['Ja', 'Nein', 'Nur temporär', 'Nur bei zwei Domänen'], correct: 0, explanation: 'Ein Forest kann auch aus nur einem Tree bestehen.' },
    { question: 'Was teilen Domänen in einem Forest?', options: ['Alle lokalen Benutzerkonten', 'Schema und Konfigurationspartition', 'Nichts', 'Nur Computerkonten'], correct: 1, explanation: 'Schema und Konfigurationspartition sind forestweit.' },
  ];

  const summary = [
    'Domäne = einzelner logischer Verwaltungs- und Namensbereich.',
    'Root Domain = oberste Domäne eines DNS-Namensraums.',
    'Child Domain = erweitert den DNS-Namensraum der Parent Domain.',
    'Tree = Domänen mit zusammenhängendem DNS-Namensraum.',
    'Forest = oberste AD-Struktur, kann einen oder mehrere Trees enthalten.',
    'Ein Forest mit mehreren Trees kann unterschiedliche DNS-Namensräume enthalten.',
    'Domänen im Forest teilen Schema und Konfigurationspartition.',
    'Lokale Domänenkonfigurationen können unterschiedlich sein.',
    'Forest > Tree > Domain > OU > Object.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
