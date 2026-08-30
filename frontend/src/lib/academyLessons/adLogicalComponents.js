import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Logical Components
// Covers: domain, organizational-units, domain-controller
// =============================================================================

export const AD_DOMAIN_TOPIC_KEY = topicKey('active-directory-virtualbox', 'domain');
export const AD_OU_TOPIC_KEY = topicKey('active-directory-virtualbox', 'organizational-units');
export const AD_DC_TOPIC_KEY = topicKey('active-directory-virtualbox', 'domain-controller');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const physicalVsLogicalSvg = `<svg viewBox="0 0 320 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="110" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Physisch</text>
  <text x="85" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Server, Räume, Kabel</text>
  <text x="85" y="80" text-anchor="middle" fill="#c9d1d9" font-size="10">Domain Controller</text>
  <text x="85" y="98" text-anchor="middle" fill="#c9d1d9" font-size="10">als phys./virt. Maschine</text>

  <rect x="170" y="20" width="130" height="110" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Logisch</text>
  <text x="235" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Domäne, OU, Objekt</text>
  <text x="235" y="80" text-anchor="middle" fill="#c9d1d9" font-size="10">Distinguished Name</text>
  <text x="235" y="98" text-anchor="middle" fill="#c9d1d9" font-size="10">Namensraum</text>

  <line x1="150" y1="75" x2="170" y2="75" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const domainHierarchySvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="10" width="100" height="40" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="30" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">nexus.local</text>
  <text x="160" y="44" text-anchor="middle" fill="#8b949e" font-size="9">Domäne</text>

  <line x1="160" y1="50" x2="160" y2="70" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="80" y1="70" x2="240" y2="70" stroke="#00f0ff" stroke-width="1.5"/>

  <rect x="20" y="80" width="80" height="45" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="60" y="100" text-anchor="middle" fill="#c9d1d9" font-size="10">OU IT</text>
  <text x="60" y="115" text-anchor="middle" fill="#8b949e" font-size="8">Abteilung</text>

  <rect x="120" y="80" width="80" height="45" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="160" y="100" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Vertrieb</text>
  <text x="160" y="115" text-anchor="middle" fill="#8b949e" font-size="8">Abteilung</text>

  <rect x="220" y="80" width="80" height="45" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="260" y="100" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Personal</text>
  <text x="260" y="115" text-anchor="middle" fill="#8b949e" font-size="8">Abteilung</text>

  <line x1="60" y1="125" x2="60" y2="145" stroke="#8b949e" stroke-width="1"/>
  <rect x="30" y="150" width="60" height="25" rx="3" fill="#0d1117" stroke="#c9d1d9" stroke-width="1"/>
  <text x="60" y="167" text-anchor="middle" fill="#c9d1d9" font-size="9">Benutzer</text>

  <line x1="160" y1="125" x2="160" y2="145" stroke="#8b949e" stroke-width="1"/>
  <rect x="130" y="150" width="60" height="25" rx="3" fill="#0d1117" stroke="#c9d1d9" stroke-width="1"/>
  <text x="160" y="167" text-anchor="middle" fill="#c9d1d9" font-size="9">Computer</text>

  <line x1="260" y1="125" x2="260" y2="145" stroke="#8b949e" stroke-width="1"/>
  <rect x="230" y="150" width="60" height="25" rx="3" fill="#0d1117" stroke="#c9d1d9" stroke-width="1"/>
  <text x="260" y="167" text-anchor="middle" fill="#c9d1d9" font-size="9">Drucker</text>

  <text x="160" y="205" text-anchor="middle" fill="#8b949e" font-size="9">Hierarchie: Domäne → OU → Objekt</text>
</svg>`;

const domainVsDcSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Domäne</text>
  <text x="85" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">logischer Verwaltungs-</text>
  <text x="85" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">und Namensraum</text>
  <text x="85" y="98" text-anchor="middle" fill="#8b949e" font-size="9">nexus.local</text>
  <text x="85" y="116" text-anchor="middle" fill="#8b949e" font-size="9">enthält OUs und Objekte</text>

  <rect x="170" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Domain Controller</text>
  <text x="235" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Server, der AD DS</text>
  <text x="235" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">bereitstellt</text>
  <text x="235" y="98" text-anchor="middle" fill="#8b949e" font-size="9">hält Verzeichnisdaten</text>
  <text x="235" y="116" text-anchor="middle" fill="#8b949e" font-size="9">verarbeitet Authentifizierung</text>
</svg>`;

const ouVsGroupSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">OU</text>
  <text x="85" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">organisatorische</text>
  <text x="85" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">Struktur</text>
  <text x="85" y="98" text-anchor="middle" fill="#8b949e" font-size="9">IT / Vertrieb / Personal</text>
  <text x="85" y="116" text-anchor="middle" fill="#8b949e" font-size="9">administrativ sortieren</text>

  <rect x="170" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Gruppe</text>
  <text x="235" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Berechtigungs-/</text>
  <text x="235" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">Mitgliedschaftslogik</text>
  <text x="235" y="98" text-anchor="middle" fill="#8b949e" font-size="9">Drucker_Vertrieb</text>
  <text x="235" y="116" text-anchor="middle" fill="#8b949e" font-size="9">Rechte vergeben</text>
</svg>`;

const dnTreeSvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="10" width="100" height="36" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="28" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">nexus.local</text>
  <text x="160" y="40" text-anchor="middle" fill="#8b949e" font-size="8">DC=nexus, DC=local</text>

  <line x1="160" y1="46" x2="160" y2="66" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="100" y1="66" x2="220" y2="66" stroke="#00f0ff" stroke-width="1.5"/>

  <rect x="40" y="75" width="80" height="34" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="80" y="92" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Vertrieb</text>
  <text x="80" y="104" text-anchor="middle" fill="#8b949e" font-size="8">Berlin</text>

  <rect x="200" y="75" width="80" height="34" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="240" y="92" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Personal</text>
  <text x="240" y="104" text-anchor="middle" fill="#8b949e" font-size="8">München</text>

  <line x1="80" y1="109" x2="80" y2="130" stroke="#8b949e" stroke-width="1"/>
  <rect x="45" y="135" width="70" height="34" rx="4" fill="#0d1117" stroke="#c9d1d9" stroke-width="1.5"/>
  <text x="80" y="152" text-anchor="middle" fill="#c9d1d9" font-size="10">Max Mustermann</text>
  <text x="80" y="164" text-anchor="middle" fill="#8b949e" font-size="8">CN=Max Mustermann</text>

  <rect x="20" y="185" width="280" height="28" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="160" y="203" text-anchor="middle" fill="#ffcc00" font-size="9">CN=Max Mustermann,OU=Vertrieb,OU=Berlin,DC=nexus,DC=local</text>
</svg>`;

const dcAsServerSvg = `<svg viewBox="0 0 320 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="15" width="100" height="60" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="35" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">DC01</text>
  <text x="160" y="52" text-anchor="middle" fill="#c9d1d9" font-size="9">Server mit AD DS</text>
  <text x="160" y="66" text-anchor="middle" fill="#8b949e" font-size="8">physisch / virtuell</text>

  <line x1="160" y1="75" x2="160" y2="95" stroke="#ffcc00" stroke-width="1.5"/>
  <line x1="100" y1="95" x2="220" y2="95" stroke="#00f0ff" stroke-width="1.5"/>

  <rect x="50" y="105" width="70" height="32" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="85" y="122" text-anchor="middle" fill="#c9d1d9" font-size="9">Domäne</text>
  <text x="85" y="134" text-anchor="middle" fill="#8b949e" font-size="8">logischer Raum</text>

  <rect x="200" y="105" width="70" height="32" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="235" y="122" text-anchor="middle" fill="#c9d1d9" font-size="9">Authentifizierung</text>
  <text x="235" y="134" text-anchor="middle" fill="#8b949e" font-size="8">Anmeldung</text>
</svg>`;

const dcRedundancySvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="10" width="100" height="40" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="28" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Domäne</text>
  <text x="160" y="42" text-anchor="middle" fill="#8b949e" font-size="9">nexus.local</text>

  <line x1="160" y1="50" x2="160" y2="70" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="90" y1="70" x2="230" y2="70" stroke="#00f0ff" stroke-width="1.5"/>

  <rect x="50" y="80" width="80" height="40" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="90" y="98" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">DC01</text>
  <text x="90" y="112" text-anchor="middle" fill="#c9d1d9" font-size="8">Domain Controller</text>

  <rect x="190" y="80" width="80" height="40" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="230" y="98" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">DC02</text>
  <text x="230" y="112" text-anchor="middle" fill="#c9d1d9" font-size="8">Domain Controller</text>

  <line x1="90" y1="120" x2="230" y2="120" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="160" y="140" text-anchor="middle" fill="#8b949e" font-size="9">mehrere DCs für Verfügbarkeit und Replikation</text>
  <text x="160" y="155" text-anchor="middle" fill="#8b949e" font-size="9">(Details folgen später)</text>
</svg>`;

// =============================================================================
// Domain lesson
// =============================================================================
function buildDomainLesson() {
  const explanations = [
    explanation('domain-einstieg-classic', 'NEXUS wächst', 'classic', [
      { type: 'text', content: 'NEXUS hat inzwischen viele Mitarbeiter, Computer und Drucker. Die Abteilungen IT, Vertrieb, Personal und Verwaltung arbeiten mit denselben zentralen Konten – dank Active Directory. Aber die Objekte liegen bisher alle in einer flachen Liste. Wer sucht, findet schnell den Überblick.' },
      { type: 'text', content: 'Das eigentliche Problem ist nicht die Anzahl der Objekte. Das Problem ist die fehlende Struktur: Wo gehört ein Objekt hin? Was ist der übergeordnete Verwaltungsbereich? Wie findet man eindeutig, was man sucht?' },
      { type: 'question', question: 'Was ist hier das zentrale Strukturproblem?', options: ['Zu wenige Benutzer', 'Objekte ohne sinnvolle logische Einordnung', 'Zu langsame Server', 'Fehlende Druckertreiber'], correct: 1, explanation: 'Wenn viele Objekte existieren, aber keine klare logische Struktur, wird die Verwaltung unübersichtlich.' },
    ]),
    explanation('domain-einstieg-intuitive', 'Eine Stadt ohne Stadtteile', 'intuitive', [
      { type: 'text', content: 'Stell dir eine Stadt vor, in der alle Einwohner, Häuser und Behörden in einer einzigen langen Liste geführt werden. Jede Adresse existiert, aber niemand weiß, zu welchem Stadtteil oder Bezirk sie gehört. Post, Feuerwehr und Verwaltung müssen jedes Mal mühsam suchen.' },
      { type: 'text', content: 'Active Directory bietet genau die Struktur, die diese Stadt braucht: Stadtteile (Domänen), Bezirke (OUs) und eindeutige Adressen (Distinguished Names). Der Domain Controller ist vergleichbar mit dem Bürgeramt, das die zentrale Meldedatenbank bereitstellt.' },
    ]),
    explanation('domain-logisch-physikalisch-classic', 'Logisch vs. physisch', 'classic', [
      { type: 'text', content: 'In Active Directory unterscheidet man logische und physische Komponenten. Logische Komponenten beschreiben die organisatorische Struktur, unabhängig davon, auf welchem Server sie gerade gespeichert sind.' },
      { type: 'diagram', content: physicalVsLogicalSvg },
      { type: 'list', title: 'Beispiele', items: [
        'Physisch: Domain Controller als Server, Netzwerkkabel, Rechenzentrum, Standort',
        'Logisch: Domäne, OU, Objekt, Distinguished Name, DNS-Namensraum',
      ] },
      { type: 'question', question: 'Welche Komponente ist logisch?', options: ['Domain Controller als Server', 'Domäne als Verwaltungs- und Namensraum', 'Netzwerkkabel', 'Rechenzentrum'], correct: 1, explanation: 'Eine Domäne ist eine logische Struktur. Der Domain Controller ist die physische oder virtuelle Maschine, die den Dienst bereitstellt.' },
    ]),
    explanation('domain-rueckblick-classic', 'Rückblick: Objekt, Attribut, Schema', 'classic', [
      { type: 'text', content: 'Aus dem Grundlagen-Block ist bekannt: Ein Objekt ist eine verwaltete Einheit wie ein Benutzer, Computer oder Drucker. Attribute beschreiben Eigenschaften eines Objekts, und das Schema legt fest, welche Objektarten und Attribute erlaubt sind.' },
      { type: 'text', content: 'In diesem Block geht es darum, wie diese Objekte in einer Hierarchie angeordnet werden: Domäne → OU → Objekt.' },
    ]),
    explanation('domain-definition-classic', 'Was ist eine Domäne?', 'classic', [
      { type: 'text', content: 'Eine Domäne ist eine grundlegende logische Struktur in Active Directory. Sie bildet einen Verwaltungsbereich, einen Namensraum und die Umgebung, in der Objekte und OUs organisiert sind.' },
      { type: 'text', content: 'Die Domäne verwendet einen DNS-Namensraum. Ein Beispiel ist nexus.local. Das bedeutet nicht, dass AD-Domäne und DNS-Zone in jeder Hinsicht identisch sind, aber beide Namensräume hängen eng zusammen.' },
      { type: 'list', title: 'Eigenschaften einer Domäne', items: [
        'Verwaltungsbereich für Objekte',
        'Logischer Namensraum, typisch mit DNS-Bezug',
        'Grenze für bestimmte Verwaltungs- und Sicherheitsaspekte',
        'Enthält OUs und darin Objekte',
      ] },
      { type: 'question', question: 'Was beschreibt eine Domäne?', options: ['Einen physischen Server im Rechenzentrum', 'Einen logischen Verwaltungs- und Namensraum', 'Eine einzelne OU', 'Eine Sicherheitsgruppe'], correct: 1, explanation: 'Eine Domäne ist ein logischer Verwaltungs- und Namensraum, der OUs und Objekte enthält.' },
    ]),
    explanation('domain-definition-intuitive', 'Domäne = Stadt', 'intuitive', [
      { type: 'text', content: 'Eine Domäne ist wie eine Stadt: Sie hat einen Namen, eine klare Grenze und innerhalb dieser Grenze gibt es Stadtteile, Gebäude und Bewohner. Die Stadt selbst ist keine einzelne Straße und kein einzelnes Gebäude, sondern der übergeordnete Raum.' },
      { type: 'text', content: 'Eine OU ist vergleichbar mit einem Stadtteil, ein Objekt mit einem Bewohner oder Gebäude. Mehrere Städte können später zu einem Land zusammengefasst werden – das ist aber ein späteres Thema.' },
    ]),
    explanation('domain-vs-ou-classic', 'Domäne vs. OU', 'classic', [
      { type: 'text', content: 'Domäne und OU sind beide logische Strukturen, aber auf unterschiedlichen Ebenen. Die Domäne ist der übergeordnete Verwaltungs- und Namensraum. Die OU ist eine organisatorische Einheit innerhalb der Domäne.' },
      { type: 'diagram', content: domainHierarchySvg },
      { type: 'question', question: 'NEXUS bekommt eine neue Abteilung „Vertrieb“. Braucht sie deshalb zwingend eine neue Domäne?', options: ['Ja, jede Abteilung braucht eine eigene Domäne', 'Nein, für organisatorische Trennung reicht meist eine OU', 'Ja, weil die Domäne die Abteilungen abbildet', 'Nein, man muss stattdessen einen neuen Domain Controller kaufen'], correct: 1, explanation: 'Wenn nur eine organisatorische Trennung nötig ist, reicht typischerweise eine OU innerhalb der bestehenden Domäne. Neue Domänen sind ein größerer Architekturschritt.' },
    ]),
    explanation('domain-vs-dc-classic', 'Domäne ≠ Domain Controller', 'classic', [
      { type: 'text', content: 'Eine häufige Verwechslung: Domäne und Domain Controller sind nicht dasselbe. Die Domäne ist der logische Verwaltungsraum. Der Domain Controller ist ein physischer oder virtueller Server, der Active Directory Domain Services bereitstellt.' },
      { type: 'diagram', content: domainVsDcSvg },
      { type: 'question', question: 'Was ist ein Domain Controller?', options: ['Die gesamte Domäne', 'Ein Server, der AD DS bereitstellt und Verzeichnisdaten hält', 'Eine OU', 'Eine Sicherheitsgruppe'], correct: 1, explanation: 'Der Domain Controller ist ein Server, der AD DS hostet, Verzeichnisdaten hält und Authentifizierung ermöglicht.' },
    ]),
    explanation('domain-zusammenfassung-classic', 'Zusammenfassung Domäne', 'classic', [
      { type: 'text', content: 'Eine Domäne ist der logische Verwaltungs- und Namensraum in Active Directory. Innerhalb der Domäne werden Objekte über Organisationseinheiten strukturiert. Der Domain Controller ist der Server, der diese logische Struktur technisch bereitstellt.' },
      { type: 'question', question: 'Welche Aussage ist richtig?', options: ['Domäne und Domain Controller sind dasselbe', 'Eine Domäne ist logisch, ein Domain Controller ist ein physischer/virtueller Server', 'Eine OU ist größer als eine Domäne', 'Eine Domäne enthält keine OUs'], correct: 1, explanation: 'Domäne = logischer Raum. Domain Controller = Server, der AD DS bereitstellt.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-logisch-physikalisch-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff der passenden Ebene zu: physisch oder logisch.',
      pairs: [
        { left: 'Domain Controller als Server', right: 'physisch' },
        { left: 'Domäne als Namensraum', right: 'logisch' },
        { left: 'Netzwerkkabel', right: 'physisch' },
        { left: 'OU als organisatorische Einheit', right: 'logisch' },
        { left: 'Rechenzentrum', right: 'physisch' },
        { left: 'Distinguished Name', right: 'logisch' },
      ],
      explanation: 'Logische Komponenten beschreiben Strukturen im Verzeichnis. Physische Komponenten sind Geräte, Server und Infrastruktur.',
    },
    {
      id: 'ad-domain-vs-ou-select',
      type: 'select-best',
      question: 'Eine neue Abteilung soll organisatorisch getrennt verwaltet werden. Was ist typischerweise der einfachste Weg innerhalb einer bestehenden Domäne?',
      options: ['Sofort eine neue Domäne erstellen', 'Eine OU für die Abteilung anlegen', 'Einen neuen Domain Controller kaufen', 'Alle Benutzer in eine Sicherheitsgruppe packen'],
      correct: 1,
      explanation: 'Eine OU strukturiert Objekte innerhalb einer Domäne. Eine neue Domäne ist ein größerer Schritt und meist nicht nötig.',
    },
    {
      id: 'ad-domain-vs-dc-select',
      type: 'select-best',
      question: 'Was ist der entscheidende Unterschied zwischen Domäne und Domain Controller?',
      options: ['Beides ist dasselbe', 'Domäne ist logisch, Domain Controller ist ein Server mit AD DS', 'Domain Controller ist logisch, Domäne ist physisch', 'Eine Domäne ist ein spezieller Domain Controller'],
      correct: 1,
      explanation: 'Die Domäne ist der logische Verwaltungsraum. Der Domain Controller ist die technische Infrastruktur, die AD DS bereitstellt.',
    },
  ];

  const quiz = [
    { question: 'Was ist eine Domäne in Active Directory?', options: ['Ein physischer Server', 'Ein logischer Verwaltungs- und Namensraum', 'Eine OU', 'Eine Sicherheitsgruppe'], correct: 1, explanation: 'Eine Domäne ist ein logischer Verwaltungs- und Namensraum.' },
    { question: 'Welche Aussage zu OUs und Domänen ist richtig?', options: ['Eine OU ist größer als eine Domäne', 'Eine OU liegt innerhalb einer Domäne', 'Eine OU ersetzt eine Domäne', 'Domänen dürfen keine OUs enthalten'], correct: 1, explanation: 'Eine OU ist eine organisatorische Einheit innerhalb einer Domäne.' },
    { question: 'Was ist ein Domain Controller?', options: ['Ein logischer Namensraum', 'Ein Server, der AD DS bereitstellt', 'Eine Art OU', 'Ein Client-Betriebssystem'], correct: 1, explanation: 'Ein Domain Controller hostet AD DS und stellt Verzeichnisdienste bereit.' },
    { question: 'Welches Element ist logisch?', options: ['Domain Controller als Server', 'Rechenzentrum', 'Domäne als Namensraum', 'Netzwerkkabel'], correct: 2, explanation: 'Eine Domäne ist eine logische Struktur. Server, Kabel und Rechenzentrum sind physisch.' },
    { question: 'Warum reicht für eine neue Abteilung oft eine OU?', options: ['Weil OUs die gleichen Rechte wie Domänen haben', 'Weil OUs organisatorische Trennung innerhalb einer Domäne ermöglichen', 'Weil Domänen nicht mehr verwendet werden', 'Weil OUs keine Objekte enthalten dürfen'], correct: 1, explanation: 'Eine OU ermöglicht organisatorische Strukturierung innerhalb einer Domäne.' },
    { question: 'Welche Beziehung beschreibt die Hierarchie korrekt?', options: ['Objekt → Domäne → OU', 'Domäne → OU → Objekt', 'OU → Domäne → Objekt', 'Domäne → Objekt → OU'], correct: 1, explanation: 'Domäne ist die oberste logische Ebene, gefolgt von OU, gefolgt vom Objekt.' },
  ];

  const summary = [
    'Eine Domäne ist ein logischer Verwaltungs- und Namensraum in AD.',
    'OUs liegen innerhalb einer Domäne und strukturieren Objekte.',
    'Ein Domain Controller ist ein Server, der AD DS bereitstellt.',
    'Domäne und Domain Controller sind nicht dasselbe.',
    'Logische Komponenten (Domäne, OU, DN) sind von physischen Komponenten (Server, Kabel) zu unterscheiden.',
  ];

  return { title: 'Domäne', explanations, exercises, quiz, summary };
}

// =============================================================================
// Organizational Units lesson
// =============================================================================
function buildOrganizationalUnitsLesson() {
  const explanations = [
    explanation('ou-einstieg-classic', 'Ordnung schaffen', 'classic', [
      { type: 'text', content: 'NEXUS hat jetzt viele Benutzer, Computer und Drucker in der Domäne. Wenn alle Objekte in einer einzigen flachen Liste liegen, ist das unübersichtlich. Die Lösung ist eine zusätzliche Strukturebene: die Organisationseinheit (OU).' },
      { type: 'question', question: 'Welches Strukturelement hilft, Objekte innerhalb einer Domäne zu organisieren?', options: ['Ein neuer Domain Controller', 'Eine Organisationseinheit (OU)', 'Ein neues Netzwerkkabel', 'Ein neuer DNS-Server'], correct: 1, explanation: 'Eine OU dient dazu, Objekte innerhalb einer Domäne logisch und administrativ zu organisieren.' },
    ]),
    explanation('ou-einstieg-intuitive', 'Stadtteile in der Stadt', 'intuitive', [
      { type: 'text', content: 'Stell dir die Domäne als Stadt vor. Die Stadt hat viele Bewohner und Gebäude, aber ohne Stadtteile wäre die Verwaltung chaotisch. Eine OU ist vergleichbar mit einem Stadtteil: Er gruppiert Bewohner und Gebäude nach geografischer oder organisatorischer Nähe.' },
      { type: 'text', content: 'Ein Stadtteil sagt aber nicht automatisch, wer wohin darf. Das regelt man über Berechtigungen – in AD typischerweise über Gruppen. OU und Gruppe haben also unterschiedliche Zwecke.' },
    ]),
    explanation('ou-definition-classic', 'Was ist eine OU?', 'classic', [
      { type: 'text', content: 'Eine Organisationseinheit (OU) ist ein Container in Active Directory, der Objekte innerhalb einer Domäne gruppiert. OUs spiegeln oft Abteilungen, Standorte oder Verwaltungsbereiche wider.' },
      { type: 'list', title: 'Zwecke einer OU', items: [
        'Gruppierung von Objekten',
        'Abbildung organisatorischer Strukturen',
        'Bessere Auffindbarkeit',
        'Vereinfachte Verwaltung',
      ] },
      { type: 'text', content: 'Wichtig: Eine OU ist keine Sicherheitsgruppe. Die OU strukturiert, die Gruppe steuert typischerweise Berechtigungen und Mitgliedschaften.' },
      { type: 'question', question: 'Wozu dient eine OU primär?', options: ['Zur Vergabe von Dateiberechtigungen', 'Zur organisatorischen Gruppierung von Objekten', 'Zur Absicherung von Firewalls', 'Zur DNS-Auflösung'], correct: 1, explanation: 'Eine OU gruppiert Objekte organisatorisch. Berechtigungen werden typischerweise über Gruppen gesteuert.' },
    ]),
    explanation('ou-definition-intuitive', 'Regal vs. Mitgliedschaft', 'intuitive', [
      { type: 'text', content: 'Eine OU ist wie ein Regal in einem Archiv: Es sagt, wo ein Ordner liegt. Eine Gruppe ist wie eine Mailingliste: Sie sagt, wer zu einem Projekt gehört und welche Rechte diese Personen haben. Ein Ordner kann in einem Regal stehen und gleichzeitig in mehreren Themenlisten auftauchen – beides ist sinnvoll, aber es ist nicht dasselbe.' },
    ]),
    explanation('ou-vs-gruppe-classic', 'OU vs. Gruppe', 'classic', [
      { type: 'diagram', content: ouVsGroupSvg },
      { type: 'list', title: 'Unterschied', items: [
        'OU: organisatorische/administrative Struktur',
        'Gruppe: Mitgliedschaft und Berechtigungslogik',
      ] },
      { type: 'question', question: 'Was ist der Hauptunterschied zwischen OU und Gruppe?', options: ['Beides ist dasselbe', 'OU strukturiert organisatorisch, Gruppe verwaltet Berechtigungen/Mitgliedschaften', 'OU erteilt Berechtigungen, Gruppe strukturiert die Domäne', 'Gruppen können keine Benutzer enthalten'], correct: 1, explanation: 'OUs dienen der Struktur, Gruppen der Berechtigungs- und Mitgliedschaftslogik.' },
    ]),
    explanation('ou-hierarchie-classic', 'Domäne → OU → Objekt', 'classic', [
      { type: 'text', content: 'Die zentrale Hierarchie in diesem Block ist: Domäne → OU → Objekt. Die Domäne ist der übergeordnete Raum, die OU strukturiert ihn, und das Objekt ist die eigentliche verwaltete Einheit.' },
      { type: 'diagram', content: domainHierarchySvg },
      { type: 'question', question: 'Welche Reihenfolge beschreibt die Hierarchie korrekt?', options: ['Objekt → OU → Domäne', 'Domäne → OU → Objekt', 'OU → Domäne → Objekt', 'Objekt → Domäne → OU'], correct: 1, explanation: 'Domäne ist die oberste Ebene, gefolgt von OU, gefolgt vom Objekt.' },
    ]),
    explanation('dn-einfuehrung-classic', 'Distinguished Name', 'classic', [
      { type: 'text', content: 'Ein Distinguished Name (DN) beschreibt die eindeutige Position eines Objekts innerhalb der AD-Namensstruktur. Er zeigt, wo ein Objekt in der Hierarchie steht.' },
      { type: 'text', content: 'Die Bestandteile eines DN verwenden Abkürzungen: CN = Common Name (Name des Objekts), OU = Organizational Unit, DC = Domain Component (Bestandteil des Domänennamens).' },
      { type: 'diagram', content: dnTreeSvg },
      { type: 'list', title: 'Beispiel', items: [
        'CN=Max Mustermann',
        'OU=Vertrieb',
        'OU=Berlin',
        'DC=nexus',
        'DC=local',
      ] },
      { type: 'question', question: 'Was beschreibt ein Distinguished Name?', options: ['Den physischen Server', 'Die eindeutige Position eines Objekts in der Verzeichnisstruktur', 'Die Gruppenmitgliedschaft eines Benutzers', 'Das Betriebssystem des Clients'], correct: 1, explanation: 'Der DN gibt an, wo ein Objekt in der Hierarchie steht.' },
    ]),
    explanation('dn-dc-missverstaendnis-classic', 'DC-Zweideutigkeit', 'classic', [
      { type: 'text', content: 'Der Buchstabe DC hat in Active Directory zwei Bedeutungen, die sauber getrennt werden müssen. Als Serverrolle bedeutet DC „Domain Controller“. Im Distinguished Name bedeutet DC „Domain Component“.' },
      { type: 'list', title: 'Beispiele', items: [
        'DC01 ist ein Servername / ein Domain Controller.',
        'DC=nexus,DC=local sind Domain Components im DN.',
      ] },
      { type: 'question', question: 'Was bedeutet DC in einem Distinguished Name?', options: ['Domain Controller', 'Domain Component', 'Data Center', 'Disk Controller'], correct: 1, explanation: 'Im DN steht DC für Domain Component, also einen Bestandteil des Domänennamens.' },
    ]),
    explanation('ou-zusammenfassung-classic', 'Zusammenfassung OU & DN', 'classic', [
      { type: 'text', content: 'OUs strukturieren Objekte innerhalb einer Domäne, sind aber keine Berechtigungsgruppen. Der Distinguished Name beschreibt die eindeutige Position eines Objekts in der Hierarchie. DC bedeutet im DN „Domain Component“, als Serverrolle „Domain Controller“.' },
      { type: 'question', question: 'Welche Aussage ist richtig?', options: ['Eine OU ist eine Sicherheitsgruppe', 'Ein DN zeigt die Position eines Objekts in der Struktur', 'DC im DN bedeutet immer Domain Controller', 'Objekte liegen über der Domäne'], correct: 1, explanation: 'Der DN beschreibt die Position in der Verzeichnisstruktur. OU und Gruppe sind unterschiedlich, und DC hat je nach Kontext zwei Bedeutungen.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-hierarchie-ordering',
      type: 'ordering',
      question: 'Bringe die logischen Ebenen von groß nach klein in die richtige Reihenfolge.',
      items: [
        { id: 'domaene', label: 'Domäne' },
        { id: 'ou', label: 'OU' },
        { id: 'objekt', label: 'Objekt' },
      ],
      correctOrder: ['domaene', 'ou', 'objekt'],
      explanation: 'Die korrekte Hierarchie ist Domäne → OU → Objekt.',
    },
    {
      id: 'ad-ou-vs-gruppe-select',
      type: 'select-best',
      question: 'Eine OU soll dazu genutzt werden, allen Mitgliedern einer Abteilung Berechtigungen zu geben. Was ist hierfür typischerweise das passendere Instrument?',
      options: ['Die OU selbst', 'Eine Sicherheitsgruppe', 'Der Distinguished Name', 'Der Domain Controller'],
      correct: 1,
      explanation: 'OUs strukturieren Objekte. Berechtigungen werden typischerweise über Sicherheitsgruppen vergeben.',
    },
    {
      id: 'ad-dn-komponenten-matching',
      type: 'matching',
      question: 'Ordne jede DN-Komponente ihrer Bedeutung zu.',
      pairs: [
        { left: 'CN', right: 'Common Name – Name des Objekts' },
        { left: 'OU', right: 'Organizational Unit – OU in der Struktur' },
        { left: 'DC', right: 'Domain Component – Bestandteil des Domänennamens' },
      ],
      explanation: 'CN steht für das Objekt, OU für die Organisationseinheit, DC für die Domain Component.',
    },
    {
      id: 'ad-dn-interpretieren-select',
      type: 'select-best',
      question: 'Welche Position beschreibt der DN CN=Lisa Meyer,OU=Personal,DC=nexus,DC=local?',
      options: ['Lisa Meyer ist ein Domain Controller', 'Lisa Meyer befindet sich in der OU Personal innerhalb der Domäne nexus.local', 'Lisa Meyer ist eine Domäne', 'nexus.local ist in der OU Personal'],
      correct: 1,
      explanation: 'Der DN liest sich von klein nach groß: Objekt → OU → Domain Components.',
    },
  ];

  const quiz = [
    { question: 'Wozu dient eine OU?', options: ['Zur Vergabe aller Berechtigungen', 'Zur organisatorischen Gruppierung von Objekten in einer Domäne', 'Zum Ersetzen einer Domäne', 'Zur physischen Verkabelung'], correct: 1, explanation: 'Eine OU gruppiert Objekte organisatorisch.' },
    { question: 'Was ist der Hauptunterschied zwischen OU und Gruppe?', options: ['Keiner', 'OU strukturiert, Gruppe steuert Berechtigungen/Mitgliedschaften', 'OU erteilt Berechtigungen, Gruppe strukturiert', 'Gruppen können keine Benutzer enthalten'], correct: 1, explanation: 'OUs dienen der Struktur, Gruppen der Berechtigungslogik.' },
    { question: 'Welche Hierarchie ist korrekt?', options: ['Objekt → Domäne → OU', 'Domäne → OU → Objekt', 'OU → Objekt → Domäne', 'Domäne → Objekt → OU'], correct: 1, explanation: 'Domäne ist die oberste Ebene, gefolgt von OU, gefolgt vom Objekt.' },
    { question: 'Was beschreibt ein Distinguished Name?', options: ['Den physischen Server', 'Die Position eines Objekts in der Verzeichnisstruktur', 'Eine Sicherheitsgruppe', 'Ein Betriebssystem'], correct: 1, explanation: 'Der DN zeigt die eindeutige Position in der Hierarchie.' },
    { question: 'Was bedeutet DC im DN CN=Max,OU=IT,DC=nexus,DC=local?', options: ['Domain Controller als Server', 'Domain Component als Bestandteil der Domäne', 'Data Center', 'Disk Controller'], correct: 1, explanation: 'Im DN steht DC für Domain Component.' },
    { question: 'Wie lautet der Objektname im DN CN=Lisa Meyer,OU=Personal,DC=nexus,DC=local?', options: ['Personal', 'nexus.local', 'Lisa Meyer', 'OU=Personal'], correct: 2, explanation: 'CN steht für Common Name und benennt das Objekt selbst.' },
    { question: 'Warum ist eine OU keine Sicherheitsgruppe?', options: ['Weil sie keine Objekte enthalten darf', 'Weil ihre primäre Aufgabe die Strukturierung ist, nicht die Berechtigungsvergabe', 'Weil sie größer als eine Domäne ist', 'Weil sie nur Computer enthalten darf'], correct: 1, explanation: 'OUs strukturieren. Berechtigungen werden über Gruppen vergeben.' },
  ];

  const summary = [
    'Eine OU organisiert Objekte innerhalb einer Domäne.',
    'OUs spiegeln oft Abteilungen oder Standorte wider.',
    'OUs sind keine Sicherheitsgruppen.',
    'Die Hierarchie lautet Domäne → OU → Objekt.',
    'Ein Distinguished Name beschreibt die Position eines Objekts.',
    'DC im DN bedeutet Domain Component, als Serverrolle Domain Controller.',
  ];

  return { title: 'Organisationseinheiten', explanations, exercises, quiz, summary };
}

// =============================================================================
// Domain Controller lesson
// =============================================================================
function buildDomainControllerLesson() {
  const explanations = [
    explanation('dc-einstieg-classic', 'Wer stellt AD bereit?', 'classic', [
      { type: 'text', content: 'Die Domäne, die OUs und die Objekte in NEXUS müssen irgendwo verwaltet werden. Ein Benutzer muss sich anmelden können, ein Computer muss seine Identität bestätigen, und Verzeichnisabfragen müssen beantwortet werden. Diese Aufgaben übernimmt der Domain Controller.' },
      { type: 'question', question: 'Welche Rolle stellt Active Directory Domain Services in einer Domäne bereit?', options: ['Der Client-PC', 'Der Domain Controller', 'Der DNS-Root-Server im Internet', 'Der Router'], correct: 1, explanation: 'Der Domain Controller hostet AD DS und stellt Verzeichnisdienste bereit.' },
    ]),
    explanation('dc-einstieg-intuitive', 'Das Bürgeramt der Domäne', 'intuitive', [
      { type: 'text', content: 'Stell dir die Domäne als Stadt vor. Damit die Stadt funktioniert, braucht sie ein Bürgeramt, das weiß, wer wohnt, wo er wohnt und wer welche Berechtigungen hat. Der Domain Controller ist dieses Bürgeramt: Er führt die zentrale Datenbank und bestätigt die Identität der Einwohner.' },
      { type: 'text', content: 'Größere Städte haben mehrere Bürgerämter, damit Ausfälle und lange Wege kein Problem sind. Ebenso kann eine Domäne mehrere Domain Controller haben.' },
    ]),
    explanation('dc-definition-classic', 'Was macht ein Domain Controller?', 'classic', [
      { type: 'text', content: 'Ein Domain Controller (DC) ist ein Server, auf dem Active Directory Domain Services (AD DS) installiert ist. Er hält eine Kopie der AD-Verzeichnisdatenbank und stellt zentrale Dienste bereit.' },
      { type: 'diagram', content: dcAsServerSvg },
      { type: 'list', title: 'Aufgaben eines Domain Controllers', items: [
        'Hosten von AD DS',
        'Halten einer Kopie der Verzeichnisdatenbank',
        'Verarbeiten von Verzeichnisanfragen',
        'Unterstützen der Authentifizierung',
        'Bereitstellen zentraler AD-Dienste',
      ] },
      { type: 'text', content: 'Wichtig: Der DC ist ein Server, der AD DS bereitstellt. Er ist nicht die Domäne selbst und auch nicht einzelne darin enthaltene Objekte.' },
      { type: 'question', question: 'Was ist ein Domain Controller?', options: ['Die gesamte Domäne', 'Ein Server, der AD DS hostet und Verzeichnisdienste bereitstellt', 'Eine OU innerhalb der Domäne', 'Ein spezieller Client-PC'], correct: 1, explanation: 'Ein DC ist ein Server, der AD DS hostet und Authentifizierung sowie Verzeichnisdienste bereitstellt.' },
    ]),
    explanation('dc-mehrere-classic', 'Mehrere Domain Controller', 'classic', [
      { type: 'text', content: 'In einer Domäne können mehrere Domain Controller betrieben werden. Das erhöht Verfügbarkeit und Redundanz. Die Verzeichnisdaten werden zwischen den DCs abgeglichen, damit alle dieselben Informationen sehen.' },
      { type: 'diagram', content: dcRedundancySvg },
      { type: 'text', content: 'Der genaue Replikationsmechanismus und spezielle spätere Rollen gehören zu anderen Themen. Hier reicht das Verständnis: Mehrere DCs sind möglich und sinnvoll.' },
      { type: 'question', question: 'Warum kann eine Domäne mehrere Domain Controller haben?', options: ['Um Redundanz und Verfügbarkeit zu erhöhen', 'Um mehrere Domänen zu ersetzen', 'Weil jeder DC eine eigene Domäne braucht', 'Damit keine OUs mehr nötig sind'], correct: 0, explanation: 'Mehrere DCs erhöhen Verfügbarkeit und Redundanz innerhalb derselben Domäne.' },
    ]),
    explanation('dc-physisch-logisch-classic', 'Physisch vs. logisch am DC', 'classic', [
      { type: 'text', content: 'Ein Domain Controller ist physisch oder virtuell ein Server. Die Domäne, die OUs und die Objekte sind logische Strukturen, die dieser Server bereitstellt. Domäne und DC gehören zusammen, sind aber nicht identisch.' },
      { type: 'question', question: 'Welche Aussage trifft zu?', options: ['Eine Domäne ist ein Server', 'Ein Domain Controller ist ein Server, der logische AD-Strukturen bereitstellt', 'Eine OU ist ein physischer Server', 'Objekte sind physische Server'], correct: 1, explanation: 'Der DC ist der Server, Domäne, OU und Objekte sind logische Strukturen.' },
    ]),
    explanation('dc-vs-domain-component-classic', 'DC = Domain Controller oder Domain Component?', 'classic', [
      { type: 'text', content: 'Das Kürzel DC hat in Active Directory zwei Bedeutungen, die im Kontext klar unterschieden werden müssen: DC als Serverrolle bedeutet Domain Controller. DC im Distinguished Name bedeutet Domain Component.' },
      { type: 'list', title: 'Unterscheidung', items: [
        'DC01 oder „der DC“ → Domain Controller (Serverrolle)',
        'DC=nexus,DC=local → Domain Component (Bestandteil des DN)',
      ] },
      { type: 'question', question: 'Was bedeutet DC in „DC=nexus,DC=local“?', options: ['Domain Controller', 'Domain Component', 'Data Center', 'Direct Connect'], correct: 1, explanation: 'Im Distinguished Name steht DC für Domain Component.' },
    ]),
    explanation('dc-zusammenfassung-classic', 'Zusammenfassung Domain Controller', 'classic', [
      { type: 'text', content: 'Ein Domain Controller ist ein Server, der AD DS hostet, Verzeichnisdaten hält und Authentifizierung ermöglicht. Mehrere DCs in einer Domäne erhöhen Verfügbarkeit. DC bedeutet als Serverrolle Domain Controller, im DN Domain Component.' },
      { type: 'question', question: 'Welche Aussage ist richtig?', options: ['Ein DC ist die Domäne', 'Ein DC ist ein Server, der AD DS bereitstellt; DC im DN heißt Domain Component', 'Ein DC ist eine OU', 'Ein DC ist ein Client'], correct: 1, explanation: 'Der Domain Controller ist die Serverrolle, im DN bedeutet DC etwas anderes.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-dc-rolle-select',
      type: 'select-best',
      question: 'Was ist die Hauptaufgabe eines Domain Controllers?',
      options: ['Er ersetzt die Domäne', 'Er hostet AD DS und stellt Verzeichnisdienste bereit', 'Er verwaltet nur lokale Benutzer', 'Er ist ein Client-Betriebssystem'],
      correct: 1,
      explanation: 'Ein DC hostet AD DS, hält Verzeichnisdaten und ermöglicht Authentifizierung.',
    },
    {
      id: 'ad-mehrere-dcs-select',
      type: 'select-best',
      question: 'Warum kann eine Domäne mehrere Domain Controller haben?',
      options: ['Weil jeder DC eine eigene Domäne braucht', 'Um Redundanz und Verfügbarkeit zu erhöhen', 'Damit keine OUs mehr benötigt werden', 'Weil DNS sonst nicht funktioniert'],
      correct: 1,
      explanation: 'Mehrere DCs innerhalb derselben Domäne erhöhen Verfügbarkeit und Redundanz.',
    },
    {
      id: 'ad-dc-vs-domain-select',
      type: 'select-best',
      question: 'Was ist der Unterschied zwischen Domäne und Domain Controller?',
      options: ['Beides ist dasselbe', 'Domäne ist logisch, DC ist ein Server mit AD DS', 'DC ist logisch, Domäne ist physisch', 'Eine Domäne ist ein spezieller DC'],
      correct: 1,
      explanation: 'Domäne = logischer Verwaltungsraum. DC = Server, der AD DS bereitstellt.',
    },
    {
      id: 'ad-dc-komponente-select',
      type: 'select-best',
      question: 'Was bedeutet DC im Distinguished Name CN=Server,OU=IT,DC=nexus,DC=local?',
      options: ['Domain Controller', 'Domain Component', 'Data Center', 'Direct Connect'],
      correct: 1,
      explanation: 'Im DN steht DC für Domain Component, also einen Bestandteil des Domänennamens.',
    },
    {
      id: 'ad-dc-terms-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff der passenden Beschreibung zu.',
      pairs: [
        { left: 'Domäne', right: 'logischer Verwaltungs- und Namensraum' },
        { left: 'Domain Controller', right: 'Server, der AD DS bereitstellt' },
        { left: 'OU', right: 'organisatorische Einheit innerhalb einer Domäne' },
        { left: 'Objekt', right: 'verwaltete Einheit wie Benutzer oder Computer' },
      ],
      explanation: 'Domäne, OU und Objekt sind logische Strukturen. Der Domain Controller ist der Server, der AD DS bereitstellt.',
    },
  ];

  const quiz = [
    { question: 'Was ist ein Domain Controller?', options: ['Eine OU', 'Ein Server, der AD DS hostet', 'Eine Domäne', 'Ein Client'], correct: 1, explanation: 'Ein DC ist ein Server mit AD DS.' },
    { question: 'Welche Aufgabe hat ein DC?', options: ['Er ersetzt DNS', 'Er stellt Verzeichnisdienste und Authentifizierung bereit', 'Er verwaltet nur lokale Profile', 'Er ist ein Druckserver'], correct: 1, explanation: 'Der DC stellt AD-Dienste und Authentifizierung bereit.' },
    { question: 'Warum kann eine Domäne mehrere DCs haben?', options: ['Damit jeder DC eine eigene Domäne bildet', 'Für Redundanz und Verfügbarkeit', 'Damit keine OUs mehr nötig sind', 'Weil sonst keine Benutzer angelegt werden können'], correct: 1, explanation: 'Mehrere DCs erhöhen Verfügbarkeit und Redundanz.' },
    { question: 'Welche Aussage zu Domäne und DC ist richtig?', options: ['Domäne und DC sind identisch', 'Domäne ist logisch, DC ist ein physischer/virtueller Server', 'Eine Domäne ist ein physischer Server', 'Ein DC ist logisch, die Domäne physisch'], correct: 1, explanation: 'Domäne = logisch, DC = Server, der AD DS bereitstellt.' },
    { question: 'Was bedeutet DC im DN?', options: ['Domain Controller', 'Domain Component', 'Data Center', 'Direct Connect'], correct: 1, explanation: 'Im DN bedeutet DC Domain Component.' },
    { question: 'Wofür steht DC als Serverrolle?', options: ['Domain Component', 'Domain Controller', 'Data Center', 'Direct Connect'], correct: 1, explanation: 'Als Serverrolle ist DC der Domain Controller.' },
  ];

  const summary = [
    'Ein Domain Controller hostet AD DS.',
    'Er hält Verzeichnisdaten und ermöglicht Authentifizierung.',
    'Eine Domäne kann mehrere DCs für Redundanz haben.',
    'DC als Serverrolle ≠ DC im Distinguished Name.',
    'Domäne und DC sind eng verbunden, aber nicht identisch.',
  ];

  return { title: 'Domain Controller', explanations, exercises, quiz, summary };
}

export function buildAdDomainLesson() { return buildDomainLesson(); }
export function buildAdOrganizationalUnitsLesson() { return buildOrganizationalUnitsLesson(); }
export function buildAdDomainControllerLesson() { return buildDomainControllerLesson(); }
