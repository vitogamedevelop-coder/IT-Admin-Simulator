import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Gruppenrichtlinien – Grundlagen
// Thema 27
// =============================================================================

export const AD_GROUP_POLICY_BASICS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-group-policy-basics');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const centralSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="80" height="40" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="60" y="45" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Admin</text>
  <line x1="100" y1="40" x2="140" y2="40" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <rect x="145" y="20" width="90" height="40" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="190" y="40" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">GPO</text>
  <text x="120" y="32" text-anchor="middle" fill="#8b949e" font-size="8">erstellt</text>
  <line x1="190" y1="60" x2="120" y2="100" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <line x1="190" y1="60" x2="190" y2="100" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <line x1="190" y1="60" x2="260" y2="100" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <rect x="70" y="105" width="80" height="30" rx="6" fill="#161b22" stroke="#8b949e" stroke-width="1.5"/>
  <text x="110" y="125" text-anchor="middle" fill="#c9d1d9" font-size="8">Client 1</text>
  <rect x="150" y="105" width="80" height="30" rx="6" fill="#161b22" stroke="#8b949e" stroke-width="1.5"/>
  <text x="190" y="125" text-anchor="middle" fill="#c9d1d9" font-size="8">Client 2</text>
  <rect x="230" y="105" width="80" height="30" rx="6" fill="#161b22" stroke="#8b949e" stroke-width="1.5"/>
  <text x="270" y="125" text-anchor="middle" fill="#c9d1d9" font-size="8">Client 3</text>
  <text x="160" y="160" text-anchor="middle" fill="#8b949e" font-size="10">zentral viele Rechner / Benutzer steuern</text>
  <defs><marker id="a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L5,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const userVsComputerSvg = `<svg viewBox="0 0 320 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">User vs Computer Configuration</text>
  <rect x="20" y="40" width="120" height="80" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="60" text-anchor="middle" fill="#00f0ff" font-size="10">Benutzer</text>
  <text x="80" y="80" text-anchor="middle" fill="#c9d1d9" font-size="8">Startmenü</text>
  <text x="80" y="95" text-anchor="middle" fill="#c9d1d9" font-size="8">Desktop</text>
  <text x="80" y="110" text-anchor="middle" fill="#c9d1d9" font-size="8">Benutzeroptionen</text>
  <rect x="180" y="40" width="120" height="80" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="240" y="60" text-anchor="middle" fill="#ffcc00" font-size="10">Computer</text>
  <text x="240" y="80" text-anchor="middle" fill="#c9d1d9" font-size="8">Systemverhalten</text>
  <text x="240" y="95" text-anchor="middle" fill="#c9d1d9" font-size="8">Sicherheitsoptionen</text>
  <text x="240" y="110" text-anchor="middle" fill="#c9d1d9" font-size="8">Rechnerkonfiguration</text>
  <line x1="80" y1="125" x2="80" y2="145" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="80" y="155" text-anchor="middle" fill="#8b949e" font-size="8">unabhängig vom Rechner</text>
  <line x1="240" y1="125" x2="240" y2="145" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="240" y="155" text-anchor="middle" fill="#8b949e" font-size="8">unabhängig vom Benutzer</text>
</svg>`;

const linkVsTargetSvg = `<svg viewBox="0 0 320 200" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Link vs Target</text>
  <text x="160" y="40" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">LINK</text>
  <rect x="20" y="55" width="70" height="30" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="55" y="75" text-anchor="middle" fill="#00f0ff" font-size="9">Site</text>
  <rect x="110" y="55" width="70" height="30" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="145" y="75" text-anchor="middle" fill="#00f0ff" font-size="9">Domain</text>
  <rect x="200" y="55" width="70" height="30" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="235" y="75" text-anchor="middle" fill="#00f0ff" font-size="9">OU</text>
  <line x1="160" y1="90" x2="160" y2="115" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <rect x="125" y="120" width="70" height="30" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="140" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">GPO</text>
  <line x1="160" y1="155" x2="160" y2="180" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <text x="160" y="195" text-anchor="middle" fill="#8b949e" font-size="9">TARGET = Benutzer oder Computer</text>
  <text x="160" y="105" text-anchor="middle" fill="#c9d1d9" font-size="8">wird verknüpft an</text>
  <text x="160" y="170" text-anchor="middle" fill="#c9d1d9" font-size="8">wirkt auf</text>
  <defs><marker id="a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L5,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const storageSvg = `<svg viewBox="0 0 320 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">GPO = GPC + GPT</text>
  <rect x="20" y="40" width="120" height="80" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="60" text-anchor="middle" fill="#00f0ff" font-size="10">GPC</text>
  <text x="80" y="80" text-anchor="middle" fill="#c9d1d9" font-size="8">Container in</text>
  <text x="80" y="95" text-anchor="middle" fill="#c9d1d9" font-size="8">Active Directory</text>
  <text x="80" y="110" text-anchor="middle" fill="#c9d1d9" font-size="8">Metadaten</text>
  <rect x="180" y="40" width="120" height="80" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="240" y="60" text-anchor="middle" fill="#ffcc00" font-size="10">GPT</text>
  <text x="240" y="80" text-anchor="middle" fill="#c9d1d9" font-size="8">Dateisystemanteil</text>
  <text x="240" y="95" text-anchor="middle" fill="#c9d1d9" font-size="8">in SYSVOL</text>
  <text x="240" y="110" text-anchor="middle" fill="#c9d1d9" font-size="8">Datei-Inhalte</text>
  <line x1="140" y1="80" x2="180" y2="80" stroke="#8b949e" stroke-width="2" marker-end="url(#a)" marker-start="url(#a)"/>
  <text x="160" y="130" text-anchor="middle" fill="#8b949e" font-size="10">beide Teile gehören zum selben GPO</text>
  <defs><marker id="a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L5,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

export function buildAdGroupPolicyBasicsLesson() {
  const explanations = [
    explanation('ad-gpo-what', 'Was sind Gruppenrichtlinien?', 'classic', [
      { type: 'text', content: 'Gruppenrichtlinien (Group Policies) legen Einstellungen für Benutzer und Computer in einer Windows-Domäne zentral fest. Sie regeln Sicherheitsrichtlinien, Desktop-Einstellungen, Startmenüs, Netzwerkzugriff und weitere Konfigurationen.' },
      { type: 'diagram', content: centralSvg },
      { type: 'question', question: 'Wofür werden Gruppenrichtlinien hauptsächlich verwendet?', options: ['Zentrale Steuerung von Benutzer- und Computereinstellungen', 'Drucken auf lokalen PCs', 'Ersetzen des AD-Backups', 'DNS-Zonen verwalten'], correct: 0, explanation: 'Gruppenrichtlinien steuern zentral Benutzer- und Computereinstellungen in einer Domäne.' },
    ]),
    explanation('ad-gpo-object', 'Was ist ein GPO?', 'classic', [
      { type: 'text', content: 'Ein Group Policy Object (GPO) ist ein Gruppenrichtlinienobjekt, das viele einzelne Richtlinieneinstellungen enthält. Es ist also nicht nur eine einzelne Einstellung, sondern ein Behälter mit Regeln.' },
      { type: 'question', question: 'Was ist ein GPO?', options: ['Ein Gruppenrichtlinienobjekt mit vielen Einstellungen', 'Ein einzelner Registry-Wert', 'Eine DNS-Zone', 'Eine OU'], correct: 0, explanation: 'Ein GPO enthält mehrere Richtlinieneinstellungen und ist kein einzelner Wert.' },
    ]),
    explanation('ad-gpo-user-computer', 'Benutzer- vs. Computerkonfiguration', 'classic', [
      { type: 'text', content: 'Ein GPO teilt sich grob in Benutzerkonfiguration und Computerkonfiguration. Benutzereinstellungen wirken auf Benutzer unabhängig vom Rechner, Computereinstellungen wirken auf den Rechner unabhängig vom angemeldeten Benutzer.' },
      { type: 'diagram', content: userVsComputerSvg },
      { type: 'question', question: 'Wohin wirkt die Computerkonfiguration eines GPOs?', options: ['Auf den angemeldeten Benutzer', 'Auf den Computer, unabhängig vom Benutzer', 'Nur auf den Administrator', 'Nur auf Gruppen'], correct: 1, explanation: 'Computereinstellungen gelten für den Computer selbst, egal wer sich anmeldet.' },
    ]),
    explanation('ad-gpo-local-central', 'Lokale vs. zentrale Gruppenrichtlinien', 'classic', [
      { type: 'text', content: 'Lokale Gruppenrichtlinien gelten nur auf einem einzelnen Computer und werden im Local Group Policy Editor verwaltet. Zentrale Gruppenrichtlinien werden im Active Directory über GPOs verwaltet und erreichen viele Benutzer und Computer. Beide Arten können an einem Rechner relevant sein, domänenbasierte Richtlinien werden aber im AD-Kontext angewendet.' },
      { type: 'question', question: 'Wo werden zentrale Gruppenrichtlinien verwaltet?', options: ['Nur auf dem Client', 'Im Active Directory über GPOs', 'Im DNS-Manager', 'Im DHCP-Server'], correct: 1, explanation: 'Zentrale Gruppenrichtlinien werden in Active Directory über GPOs verwaltet.' },
    ]),
    explanation('ad-gpo-links', 'Verknüpfungsorte: Site, Domain, OU', 'classic', [
      { type: 'text', content: 'Ein GPO kann an eine Site, eine Domain oder eine OU verknüpft werden. Der Verknüpfungsort ist aber nicht dasselbe wie das Ziel: eine an eine OU verknüpfte GPO wirkt auf Benutzer und/oder Computer innerhalb des Scopes, nicht auf die OU selbst.' },
      { type: 'diagram', content: linkVsTargetSvg },
      { type: 'question', question: 'An welche Objekte kann ein GPO verknüpft werden?', options: ['Site, Domain, OU', 'Nur OU', 'Nur Domain', 'Einzelne Datei'], correct: 0, explanation: 'Ein GPO lässt sich an Site, Domain oder OU verknüpfen.' },
    ]),
    explanation('ad-gpo-gpmc', 'GPMC und Speicherung', 'classic', [
      { type: 'text', content: 'Die Group Policy Management Console (GPMC) ist das zentrale Werkzeug, um GPOs anzuzeigen, zu verwalten und zu verknüpfen. Ein GPO besteht konzeptionell aus zwei Teilen: dem Group Policy Container (GPC) als AD-Anteil und dem Group Policy Template (GPT) als Dateisystemanteil in SYSVOL. gpupdate und gpresult werden nur erwähnt: gpupdate aktualisiert Richtlinien, gpresult zeigt angewendete Richtlinien an.' },
      { type: 'diagram', content: storageSvg },
      { type: 'question', question: 'Was ist die GPMC?', options: ['Group Policy Management Console', 'Group Policy Container', 'Gruppenrichtlinienobjekt', 'Ein DNS-Werkzeug'], correct: 0, explanation: 'GPMC = Group Policy Management Console, das zentrale Verwaltungswerkzeug für GPOs.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-gpo-matching-basic',
      type: 'matching',
      question: 'Ordne jedem Begriff seine Bedeutung zu.',
      pairs: [
        { left: 'GPO', right: 'Gruppenrichtlinienobjekt' },
        { left: 'GPMC', right: 'zentrale GPO-Verwaltung' },
        { left: 'GPC', right: 'AD-Anteil' },
        { left: 'GPT', right: 'SYSVOL-Anteil' },
        { left: 'Local Group Policy', right: 'einzelner Rechner' },
      ],
      explanation: 'Jeder Begriff hat eine klar abgegrenzte Bedeutung in der GPO-Welt.',
    },
    {
      id: 'ad-gpo-classification-user-computer-1',
      type: 'select-best',
      question: 'Startmenü für einen bestimmten Benutzer konfigurieren. Zu welchem Konfigurationsbereich gehört das?',
      options: ['Benutzerkonfiguration', 'Computerkonfiguration', 'Lokale Richtlinie', 'DNS-Zone'],
      correct: 0,
      explanation: 'Startmenü-Einstellungen betreffen den Benutzer, nicht den Computer.',
    },
    {
      id: 'ad-gpo-classification-user-computer-2',
      type: 'select-best',
      question: 'Windows-Firewall am Client konfigurieren. Zu welchem Konfigurationsbereich gehört das?',
      options: ['Benutzerkonfiguration', 'Computerkonfiguration', 'Local Group Policy', 'SYSVOL'],
      correct: 1,
      explanation: 'Firewall-Einstellungen für den Rechner gehören zur Computerkonfiguration.',
    },
    {
      id: 'ad-gpo-classification-user-computer-3',
      type: 'select-best',
      question: 'Desktop-Einstellung für bestimmte Benutzer. Zu welchem Bereich gehört das?',
      options: ['Benutzerkonfiguration', 'Computerkonfiguration', 'Group Policy Template', 'DNS'],
      correct: 0,
      explanation: 'Benutzerbezogene Desktop-Einstellungen gehören zur Benutzerkonfiguration.',
    },
    {
      id: 'ad-gpo-classification-user-computer-4',
      type: 'select-best',
      question: 'Systemdienst konfigurieren. Zu welchem Bereich gehört das?',
      options: ['Benutzerkonfiguration', 'Computerkonfiguration', 'GPC', 'GPMC'],
      correct: 1,
      explanation: 'Systemdienste betreffen den Computer.',
    },
    {
      id: 'ad-gpo-classification-local-central-1',
      type: 'select-best',
      question: 'Nur ein einzelner PC soll konfiguriert werden. Was ist passend?',
      options: ['Lokale Gruppenrichtlinie', 'Zentrale GPO', 'GPMC', 'AD-Schema'],
      correct: 0,
      explanation: 'Lokale Gruppenrichtlinien gelten nur auf dem einzelnen Rechner.',
    },
    {
      id: 'ad-gpo-classification-local-central-2',
      type: 'select-best',
      question: '200 Domain-Clients sollen zentral gesteuert werden. Was ist passend?',
      options: ['Lokale Gruppenrichtlinie', 'Zentrale GPO', 'Local Group Policy Editor', 'DNS-Manager'],
      correct: 1,
      explanation: 'Zentrale GPOs ermöglichen die Verwaltung vieler Domain-Rechner.',
    },
    {
      id: 'ad-gpo-classification-local-central-3',
      type: 'select-best',
      question: 'Lokaler Editor auf dem einzelnen Rechner. Welches Tool?',
      options: ['Local Group Policy Editor', 'GPMC', 'ADSI Edit', 'DNS-Manager'],
      correct: 0,
      explanation: 'Lokale Richtlinien werden im Local Group Policy Editor konfiguriert.',
    },
    {
      id: 'ad-gpo-classification-local-central-4',
      type: 'select-best',
      question: 'Tool für zentrale GPO-Verwaltung im AD?',
      options: ['GPMC', 'Local Group Policy Editor', 'AD Recycle Bin', 'DNS-Manager'],
      correct: 0,
      explanation: 'GPMC = Group Policy Management Console für zentrale GPO-Verwaltung.',
    },
    {
      id: 'ad-gpo-link-locations',
      type: 'select-best',
      question: 'An welche Objekte kann ein GPO verknüpft werden?',
      options: ['Site, Domain, OU', 'Nur OU', 'Nur Datei', 'Nur Registry-Key'],
      correct: 0,
      explanation: 'Ein GPO kann an Site, Domain oder OU verknüpft werden.',
    },
    {
      id: 'ad-gpo-link-vs-target',
      type: 'select-best',
      question: 'Ein GPO ist an die OU Clients verknüpft. Auf welche Objekte wirkt es typischerweise?',
      options: ['Auf Benutzer und/oder Computer in diesem Scope', 'Auf die OU selbst', 'Auf den GPO-Container', 'Auf DNS-Server'],
      correct: 0,
      explanation: 'Der Verknüpfungsort ist OU, die Wirkung richtet sich an Benutzer/Computer.',
    },
    {
      id: 'ad-gpo-misconception-only-ou',
      type: 'select-best',
      question: '„Eine GPO kann nur an eine OU gebunden werden." Stimmt das?',
      options: ['Ja', 'Nein, auch an Site und Domain', 'Nur an Domain', 'Nur an Computer'],
      correct: 1,
      explanation: 'GPOs können an Site, Domain und OU verknüpft werden.',
    },
    {
      id: 'ad-gpo-misconception-ou-target',
      type: 'select-best',
      question: '„Eine GPO wirkt direkt auf die OU selbst." Stimmt das?',
      options: ['Ja', 'Nein, OU ist Link-/Scope-Struktur, Wirkung richtet sich an Benutzer/Computer', 'Nur bei Domain-OUs', 'Nur bei leeren OUs'],
      correct: 1,
      explanation: 'Die OU ist der Verknüpfungsort, das Ziel sind Benutzer oder Computer im Scope.',
    },
    {
      id: 'ad-gpo-misconception-computer-user',
      type: 'select-best',
      question: '„Computerkonfiguration gilt nur, wenn ein bestimmter Benutzer angemeldet ist." Stimmt das?',
      options: ['Ja', 'Nein, Computereinstellungen gelten für den Rechner unabhängig vom Benutzer', 'Nur bei lokalen Richtlinien', 'Nur bei Domain-Admins'],
      correct: 1,
      explanation: 'Computereinstellungen wirken auf den Rechner, egal wer sich anmeldet.',
    },
    {
      id: 'ad-gpo-misconception-local-distributed',
      type: 'select-best',
      question: '„Lokale Gruppenrichtlinien werden zentral über alle PCs verteilt." Stimmt das?',
      options: ['Ja', 'Nein, lokale Richtlinien gelten nur auf dem jeweiligen Rechner', 'Nur bei Domänenbeitritt', 'Nur beim lokalen Administrator'],
      correct: 1,
      explanation: 'Lokale Richtlinien sind lokal und werden nicht zentral verteilt.',
    },
    {
      id: 'ad-gpo-misconception-gpc-gpt',
      type: 'select-best',
      question: '„GPC und GPT sind zwei unabhängige GPOs." Stimmt das?',
      options: ['Ja', 'Nein, beide sind Bestandteile desselben GPO', 'Nur in SYSVOL', 'Nur in AD'],
      correct: 1,
      explanation: 'GPC (AD-Anteil) und GPT (SYSVOL-Anteil) gehören logisch zum selben GPO.',
    },
    {
      id: 'ad-gpo-scenario-200-clients',
      type: 'select-best',
      question: 'NEXUS will auf 200 Clients eine Sicherheitsoption setzen. Welche Lösung ist sinnvoller?',
      options: ['Zentrales GPO', 'Jeden Rechner einzeln lokal konfigurieren', 'Einen DNS-Eintrag setzen', 'ADSI Edit auf jedem Client'],
      correct: 0,
      explanation: 'Eine zentrale GPO skaliert für viele Clients.',
    },
    {
      id: 'ad-gpo-scenario-single-lab',
      type: 'select-best',
      question: 'Ein einzelner isolierter Test-PC soll lokal konfiguriert werden. Was reicht?',
      options: ['Lokale Gruppenrichtlinie', 'Zentrales GPO', 'SYSVOL-Replikation', 'Schemaerweiterung'],
      correct: 0,
      explanation: 'Für einen isolierten Rechner reicht die lokale Gruppenrichtlinie.',
    },
    {
      id: 'ad-gpo-transfer-ou',
      type: 'select-best',
      question: 'Ein GPO ist an die OU Clients verknüpft und enthält nur Benutzerkonfiguration. In der OU befinden sich nur Computerobjekte. Wirkt die Einstellung auf diese Computer als Benutzerkonfiguration?',
      options: ['Nein, Benutzerkonfiguration braucht Benutzerobjekte im Scope', 'Ja, weil Computer im Scope sind', 'Ja, weil OU verknüpft ist', 'Nur bei Anmeldung'],
      correct: 0,
      explanation: 'Benutzerkonfiguration wirkt auf Benutzerobjekte; reine Computerobjekte reagieren darauf nicht.',
    },
    {
      id: 'ad-gpo-troubleshoot-user-computer',
      type: 'select-best',
      question: 'Ein Admin sucht eine Benutzeroption unter Computer Configuration. Was prüft er?',
      options: ['Ob die Einstellung in Benutzerkonfiguration gehört', 'Ob er DNS hat', 'Ob das GPO in SYSVOL liegt', 'Ob gpupdate fehlt'],
      correct: 0,
      explanation: 'Benutzereinstellungen stehen in der Benutzerkonfiguration, nicht in der Computerkonfiguration.',
    },
  ];

  const quiz = [
    { question: 'Was ist ein GPO?', options: ['Ein Gruppenrichtlinienobjekt', 'Eine einzelne Einstellung', 'Ein DNS-Record', 'Ein Verzeichnisdienst'], correct: 0, explanation: 'Ein GPO enthält viele Richtlinieneinstellungen.' },
    { question: 'Welche Konfiguration wirkt auf den Computer unabhängig vom Benutzer?', options: ['Benutzerkonfiguration', 'Computerkonfiguration', 'GPC', 'GPMC'], correct: 1, explanation: 'Computerkonfiguration betrifft den Rechner, egal wer angemeldet ist.' },
    { question: 'Wo werden zentrale Gruppenrichtlinien verwaltet?', options: ['Im Active Directory über GPOs', 'Nur auf dem Client', 'Im DHCP-Server', 'Im Local Group Policy Editor'], correct: 0, explanation: 'Zentrale Richtlinien werden im AD über GPOs verwaltet.' },
    { question: 'An welche Objekte kann ein GPO verknüpft werden?', options: ['Site, Domain, OU', 'Nur Computer', 'Nur Gruppen', 'Nur Drucker'], correct: 0, explanation: 'GPOs verknüpfen sich an Site, Domain oder OU.' },
    { question: 'Wofür steht die GPMC?', options: ['Group Policy Management Console', 'Group Policy Container', 'Group Policy Template', 'Group Policy Object'], correct: 0, explanation: 'GPMC ist die Verwaltungskonsole für GPOs.' },
  ];

  const summary = [
    'Gruppenrichtlinien legen Einstellungen für Benutzer und Computer in einer Domäne zentral fest.',
    'Ein GPO ist ein Gruppenrichtlinienobjekt mit vielen Einstellungen.',
    'Benutzerkonfiguration wirkt auf Benutzer, Computerkonfiguration auf den Rechner.',
    'Lokale Gruppenrichtlinien gelten nur auf einem Rechner, zentrale GPOs werden im AD verwaltet.',
    'Ein GPO kann an Site, Domain oder OU verknüpft werden.',
    'Der Verknüpfungsort ist nicht das Ziel: GPOs wirken auf Benutzer/Computer im Scope.',
    'GPMC ist das zentrale Verwaltungswerkzeug für GPOs.',
    'Ein GPO besteht konzeptionell aus GPC (AD-Anteil) und GPT (SYSVOL-Dateianteil).',
    'gpupdate und gpresult sind ein erster Ausblick; Details folgen später.',
  ];

  return { title: 'Gruppenrichtlinien – Grundlagen', explanations, exercises, quiz, summary };
}
