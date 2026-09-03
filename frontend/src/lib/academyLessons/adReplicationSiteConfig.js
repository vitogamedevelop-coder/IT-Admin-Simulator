import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Sites & Site Links praktisch konfigurieren
// Thema 25
// =============================================================================

export const AD_REPLICATION_SITE_CONFIG_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-site-config');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const toolSvg = `<svg viewBox="0 0 320 200" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="280" height="160" rx="8" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Active Directory-Standorte und -Dienste</text>
  <rect x="40" y="65" width="110" height="28" rx="4" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="95" y="83" text-anchor="middle" fill="#ffcc00" font-size="8">Sites</text>
  <rect x="40" y="100" width="110" height="28" rx="4" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="95" y="118" text-anchor="middle" fill="#ffcc00" font-size="8">Subnets</text>
  <rect x="40" y="135" width="110" height="28" rx="4" fill="#161b22" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="95" y="153" text-anchor="middle" fill="#ffcc00" font-size="8">Servers</text>
  <rect x="170" y="65" width="110" height="28" rx="4" fill="#161b22" stroke="#8b949e" stroke-width="1.5"/>
  <text x="225" y="83" text-anchor="middle" fill="#8b949e" font-size="8">Site Links</text>
  <rect x="170" y="100" width="110" height="28" rx="4" fill="#161b22" stroke="#8b949e" stroke-width="1.5"/>
  <text x="225" y="118" text-anchor="middle" fill="#8b949e" font-size="8">Inter-Site Transports</text>
  <text x="160" y="185" text-anchor="middle" fill="#8b949e" font-size="9">Hier konfiguriert man physische Replikationsstruktur</text>
</svg>`;

const workflowSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="90" r="16" fill="#00f0ff"/>
  <text x="40" y="94" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">Site</text>
  <circle cx="110" cy="90" r="16" fill="#00f0ff"/>
  <text x="110" y="94" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">Subnet</text>
  <circle cx="180" cy="90" r="16" fill="#00f0ff"/>
  <text x="180" y="94" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC</text>
  <circle cx="250" cy="60" r="16" fill="#ffcc00"/>
  <text x="250" y="64" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">Link</text>
  <circle cx="250" cy="120" r="16" fill="#ffcc00"/>
  <text x="250" y="124" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">C/I/S</text>
  <line x1="56" y1="90" x2="94" y2="90" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <line x1="126" y1="90" x2="164" y2="90" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <line x1="196" y1="84" x2="234" y2="66" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <line x1="196" y1="96" x2="234" y2="114" stroke="#8b949e" stroke-width="2" marker-end="url(#a)"/>
  <text x="160" y="160" text-anchor="middle" fill="#c9d1d9" font-size="10">Reihenfolge: Site → Subnet → DC → Site Link → Cost/Interval/Schedule</text>
  <defs><marker id="a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L5,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

function guidedUiStep({ id, kind, title, subtitle, instruction, targets, correctTarget, feedbackWrong, feedbackCorrect }) {
  return { id, kind, screen: { title, subtitle }, instruction, targets, correctTarget, feedbackWrong, feedbackCorrect };
}

export function buildAdReplicationSiteConfigLesson() {
  const explanations = [
    explanation('ad-repl-sitecfg-tool', 'Active Directory-Standorte und -Dienste', 'classic', [
      { type: 'text', content: 'Das Verwaltungstool für physische Replikationsstrukturen heißt Active Directory-Standorte und -Dienste (Active Directory Sites and Services). Hier konfiguriert man Sites, Subnets, Server-Standorte, Site Links und Inter-Site-Transports.' },
      { type: 'diagram', content: toolSvg },
      { type: 'question', question: 'Wofür ist Active Directory-Standorte und -Dienste zuständig?', options: ['Für die physische Replikations- und Standortstruktur', 'Für DNS-Zonenverwaltung', 'Für Benutzerpasswörter', 'Für Druckwarteschlangen'], correct: 0, explanation: 'Das Tool verwaltet Sites, Subnets, Server-Standorte und Site Links.' },
    ]),
    explanation('ad-repl-sitecfg-default-site', 'Default-First-Site-Name', 'classic', [
      { type: 'text', content: 'Nach der AD-Installation existiert initial meist ein Standort namens Default-First-Site-Name. Darin landen die Domain Controller automatisch, bis eine saubere Standortstruktur angelegt wurde. Auch der Site Link DEFAULTIPSITELINK verknüpft initial alle Sites. Das ist kein Fehler, sondern der normale Ausgangszustand.' },
      { type: 'question', question: 'Wie ist der Ausgangszustand nach einer frischen AD-Installation?', options: ['Es gibt bereits alle benötigten Sites und Subnets', 'Es existiert Default-First-Site-Name als initialer Standort', 'Es gibt gar keine Sites', 'Alle DCs sind sofort korrekt verteilt'], correct: 1, explanation: 'Default-First-Site-Name ist der normale Ausgangsstandort.' },
    ]),
    explanation('ad-repl-sitecfg-workflow', 'Logischer Admin-Workflow', 'classic', [
      { type: 'text', content: 'Beim Einrichten einer Standortstruktur folgt man einem sinnvollen Ablauf: zuerst die Site anlegen, dann das passende Subnetz in CIDR-Notation und seine Zuordnung, dann die DCs in die richtige Site verschieben. Danach folgen Site Link, Cost, Interval und Schedule. Abschließend verifizieren und prüfen wir alle Einstellungen.' },
      { type: 'diagram', content: workflowSvg },
      { type: 'question', question: 'In welcher Reihenfolge konfiguriert man grundsätzlich?', options: ['Site → Subnet → DC → Site Link → Cost/Interval/Schedule → Verify', 'Site Link → Subnet → Site → DC', 'DC verschieben → Subnet → Site', 'Cost setzen → Site anlegen'], correct: 0, explanation: 'Site zuerst, dann Subnet-Zuordnung, dann DC, dann Verbindung und Parameter, dann Verifikation.' },
    ]),
    explanation('ad-repl-sitecfg-cautions', 'Wichtige Abgrenzungen und Troubleshooting', 'classic', [
      { type: 'text', content: 'Sprechende Namen sind eine Best Practice, aber nicht technisch zwingend. Replikationsintervalle sind umgebungsabhängig und keine feste Prüfungszahl. Bridgehead-Server wählt AD normalerweise automatisch aus; eine manuelle bevorzugte Bridgehead-Konfiguration ist nur eine gezielte administrative Einschränkung, wenn ein Grund besteht. Typische Fehler: falsche Subnetzzuordnung, DC noch in Default-First-Site-Name, fehlende Site-Link-Mitgliedschaft, unerwünschter Pfad durch falsche Cost oder Schedule-Zeitraum.' },
      { type: 'question', question: 'Wie ist die Auswahl von Bridgehead-Servern normalerweise?', options: ['Immer manuell', 'Immer automatisch, manuell nur bewusst und optional', 'Nie automatisch', 'Nur per Skript'], correct: 1, explanation: 'KCC wählt bevorzugt automatisch; manuelle Festlegung ist optional.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-repl-sitecfg-create-site-guided-ui',
      type: 'guided-ui',
      title: 'Neue Site anlegen',
      question: 'Lege im Tool Active Directory-Standorte und -Dienste eine neue Site namens LECHFELD an.',
      explanation: 'Active Directory-Standorte und -Dienste öffnen → Sites auswählen → Neuer Standort → Name LECHFELD → passenden Site Link auswählen → Bestätigen.',
      intro: 'Für den neuen NEXUS-Standort LECHFELD muss zuerst eine Site existieren, bevor Subnetze und DCs zugeordnet werden können.',
      steps: [
        guidedUiStep({
          id: 'ad-repl-sitecfg-create-site-tool',
          kind: 'navigation',
          title: 'Verwaltungstool',
          subtitle: 'Neue Site anlegen',
          instruction: 'Welches Tool öffnest du, um Sites in AD zu verwalten?',
          targets: [
            { id: 'aduc', label: 'Active Directory-Benutzer und -Computer', description: 'Benutzer und Gruppen' },
            { id: 'adss', label: 'Active Directory-Standorte und -Dienste', description: 'Sites und Replikation' },
            { id: 'dns', label: 'DNS-Manager', description: 'DNS-Zonen' },
          ],
          correctTarget: 'adss',
          feedbackWrong: 'Sites und Replikation konfiguriert man in Active Directory-Standorte und -Dienste.',
          feedbackCorrect: 'Richtig: Active Directory-Standorte und -Dienste.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-create-site-node',
          kind: 'navigation',
          title: 'Sites',
          subtitle: 'Container auswählen',
          instruction: 'Unter welchem Knoten legst du eine neue Site an?',
          targets: [
            { id: 'sites', label: 'Sites', description: 'Container für Standorte' },
            { id: 'subnets', label: 'Subnets', description: 'Hier legt man Subnetze an' },
            { id: 'servers', label: 'Servers', description: 'Hier sind die DCs' },
          ],
          correctTarget: 'sites',
          feedbackWrong: 'Neue Sites legt man unter dem Sites-Container an.',
          feedbackCorrect: 'Richtig: Sites.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-create-site-action',
          kind: 'navigation',
          title: 'Neuer Standort',
          subtitle: 'Kontextaktion',
          instruction: 'Wie erstellst du den neuen Standort?',
          targets: [
            { id: 'neu', label: 'Neuer Standort', description: 'Site anlegen' },
            { id: 'eigenschaften', label: 'Eigenschaften' },
            { id: 'loeschen', label: 'Löschen' },
          ],
          correctTarget: 'neu',
          feedbackWrong: 'Neuer Standort legt eine neue Site an.',
          feedbackCorrect: 'Richtig: Neuer Standort.',
        }),
      ],
    },
    {
      id: 'ad-repl-sitecfg-create-subnet-guided-ui',
      type: 'guided-ui',
      title: 'Subnetz anlegen und zuordnen',
      question: 'Erstelle das Subnetz 192.168.10.0/24 und ordne es der Site LECHFELD zu.',
      explanation: 'Subnets → Neues Subnetz → Prefix 192.168.10.0/24 → Site LECHFELD auswählen → Bestätigen.',
      intro: 'Damit Clients korrekt ihrem Standort zugeordnet werden, muss das IP-Netz der Site zugeordnet sein.',
      steps: [
        guidedUiStep({
          id: 'ad-repl-sitecfg-create-subnet-node',
          kind: 'navigation',
          title: 'Subnets',
          subtitle: 'Subnet-Container',
          instruction: 'Wo legst du ein neues Subnetz an?',
          targets: [
            { id: 'sites', label: 'Sites' },
            { id: 'subnets', label: 'Subnets', description: 'Subnet-Container' },
            { id: 'sitelinks', label: 'Inter-Site Transports' },
          ],
          correctTarget: 'subnets',
          feedbackWrong: 'Subnetze werden unter dem Subnets-Container angelegt.',
          feedbackCorrect: 'Richtig: Subnets.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-create-subnet-prefix',
          kind: 'decision',
          title: 'Subnet-Prefix',
          subtitle: 'CIDR-Notation',
          instruction: 'Welche Eingabe gehört in das Prefix-Feld für das Lechfeld-Netz?',
          targets: [
            { id: 'a', label: '192.168.10.0/24', description: 'CIDR für Lechfeld' },
            { id: 'b', label: '192.168.20.0/24', description: 'CIDR für Pöcking' },
            { id: 'c', label: '192.168.10.0/16', description: 'Zu groß, deckt beide Netze' },
          ],
          correctTarget: 'a',
          feedbackWrong: 'Für Lechfeld gilt 192.168.10.0/24.',
          feedbackCorrect: 'Richtig: 192.168.10.0/24.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-create-subnet-site',
          kind: 'decision',
          title: 'Site-Zuordnung',
          subtitle: 'Subnetz → Site',
          instruction: 'Welcher Site weist du 192.168.10.0/24 zu?',
          targets: [
            { id: 'lechfeld', label: 'LECHFELD', description: 'Lechfeld-Subnetz' },
            { id: 'poecking', label: 'PÖCKING', description: 'Pöcking-Subnetz' },
            { id: 'default', label: 'Default-First-Site-Name' },
          ],
          correctTarget: 'lechfeld',
          feedbackWrong: 'Das 10er-Netz gehört zur Site LECHFELD.',
          feedbackCorrect: 'Richtig: LECHFELD.',
        }),
      ],
    },
    {
      id: 'ad-repl-sitecfg-move-dc-guided-ui',
      type: 'guided-ui',
      title: 'Domain Controller in Site verschieben',
      question: 'Bewege den DC DC01 in die Site LECHFELD.',
      explanation: 'Default-First-Site-Name → Servers → DC01 auswählen → Verschieben → Ziel-Site LECHFELD wählen → Bestätigen.',
      intro: 'Ein DC wird nicht automatisch in die passende Site verschoben, wenn man eine neue Site anlegt. Das muss der Admin explizit tun.',
      steps: [
        guidedUiStep({
          id: 'ad-repl-sitecfg-move-dc-source',
          kind: 'navigation',
          title: 'Servers',
          subtitle: 'Quell-Container',
          instruction: 'Wo suchst du den DC, bevor du ihn verschiebst?',
          targets: [
            { id: 'sites', label: 'Sites' },
            { id: 'subnets', label: 'Subnets' },
            { id: 'servers', label: 'Servers', description: 'DC-Objekte' },
          ],
          correctTarget: 'servers',
          feedbackWrong: 'DC-Objekte finden sich unter Servers.',
          feedbackCorrect: 'Richtig: Servers.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-move-dc-action',
          kind: 'navigation',
          title: 'DC01',
          subtitle: 'Verschieben',
          instruction: 'Welche Aktion startet das Verschieben in eine andere Site?',
          targets: [
            { id: 'eigenschaften', label: 'Eigenschaften' },
            { id: 'loeschen', label: 'Löschen' },
            { id: 'verschieben', label: 'Verschieben', description: 'In andere Site bewegen' },
          ],
          correctTarget: 'verschieben',
          feedbackWrong: 'Mit Verschieben wird ein DC einer anderen Site zugeordnet.',
          feedbackCorrect: 'Richtig: Verschieben.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-move-dc-target',
          kind: 'decision',
          title: 'Ziel-Site',
          subtitle: 'DC01 zuordnen',
          instruction: 'Wohin verschiebst du DC01?',
          targets: [
            { id: 'lechfeld', label: 'LECHFELD' },
            { id: 'poecking', label: 'PÖCKING' },
            { id: 'default', label: 'Default-First-Site-Name' },
          ],
          correctTarget: 'lechfeld',
          feedbackWrong: 'DC01 soll in die Site LECHFELD.',
          feedbackCorrect: 'Richtig: LECHFELD.',
        }),
      ],
    },
    {
      id: 'ad-repl-sitecfg-create-site-link-guided-ui',
      type: 'guided-ui',
      title: 'Site Link anlegen',
      question: 'Erstelle den Site Link LECHFELD-PÖCKING und füge beide Sites hinzu.',
      explanation: 'Inter-Site Transports → IP → Neue Standortverknüpfung → Name LECHFELD-PÖCKING → LECHFELD und PÖCKING hinzufügen → Bestätigen.',
      intro: 'Ein Site Link beschreibt den möglichen logischen Replikationsweg zwischen den beiden Sites.',
      steps: [
        guidedUiStep({
          id: 'ad-repl-sitecfg-sitelink-parent',
          kind: 'navigation',
          title: 'Inter-Site Transports',
          subtitle: 'Transportprotokoll',
          instruction: 'Wo legst du für IP ein neues Site Link an?',
          targets: [
            { id: 'ip', label: 'IP', description: 'IP-basierter Transport' },
            { id: 'smtp', label: 'SMTP', description: 'Wird hier nicht vertieft' },
            { id: 'sites', label: 'Sites' },
          ],
          correctTarget: 'ip',
          feedbackWrong: 'Site Links für normale IP-Replikation legt man unter Inter-Site Transports → IP an.',
          feedbackCorrect: 'Richtig: IP.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-sitelink-action',
          kind: 'navigation',
          title: 'IP',
          subtitle: 'Neue Verknüpfung',
          instruction: 'Welcher Befehl legt eine neue Standortverknüpfung an?',
          targets: [
            { id: 'neu', label: 'Neue Standortverknüpfung', description: 'Neuer Site Link' },
            { id: 'eigenschaften', label: 'Eigenschaften' },
            { id: 'entfernen', label: 'Entfernen' },
          ],
          correctTarget: 'neu',
          feedbackWrong: 'Neue Standortverknüpfung legt einen neuen Site Link an.',
          feedbackCorrect: 'Richtig: Neue Standortverknüpfung.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-sitelink-members',
          kind: 'decision',
          title: 'Mitglieder',
          subtitle: 'Sites hinzufügen',
          instruction: 'Welche Sites müssen dem Site Link LECHFELD-PÖCKING hinzugefügt werden?',
          targets: [
            { id: 'lechfeld-only', label: 'Nur LECHFELD' },
            { id: 'both', label: 'LECHFELD und PÖCKING', description: 'Beide Standorte' },
            { id: 'default', label: 'Nur Default-First-Site-Name' },
          ],
          correctTarget: 'both',
          feedbackWrong: 'Ein Site Link zwischen LECHFELD und PÖCKING muss beide Sites enthalten.',
          feedbackCorrect: 'Richtig: LECHFELD und PÖCKING.',
        }),
      ],
    },
    {
      id: 'ad-repl-sitecfg-set-cost-guided-ui',
      type: 'guided-ui',
      title: 'Site Link Cost setzen',
      question: 'Setze den Cost des Site Links LECHFELD-PÖCKING auf 10.',
      explanation: 'Site Link öffnen → Eigenschaften → Cost-Feld → 10 eingeben → Bestätigen. Cost ist ein Pfadgewicht; niedrigere Werte werden bevorzugt.',
      intro: 'Cost steuert, ob der Replikationspfad gegenüber alternativen Wegen bevorzugt wird.',
      steps: [
        guidedUiStep({
          id: 'ad-repl-sitecfg-cost-open',
          kind: 'navigation',
          title: 'Site Link',
          subtitle: 'LECHFELD-PÖCKING',
          instruction: 'Wie öffnest du die Eigenschaften des Site Links?',
          targets: [
            { id: 'rechtsklick', label: 'Rechtsklick → Eigenschaften', description: 'Eigenschaften öffnen' },
            { id: 'doppelklick', label: 'Doppelklick', description: 'Öffnet Details' },
            { id: 'neu', label: 'Neue Standortverknüpfung' },
          ],
          correctTarget: 'rechtsklick',
          feedbackWrong: 'Rechtsklick → Eigenschaften öffnet die Site-Link-Eigenschaften.',
          feedbackCorrect: 'Richtig: Rechtsklick → Eigenschaften.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-cost-field',
          kind: 'decision',
          title: 'Eigenschaften',
          subtitle: 'Cost',
          instruction: 'Welchen Cost-Wert setzt du für den gewünschten bevorzugten Pfad?',
          targets: [
            { id: 'high', label: '100', description: 'Hoher Cost, weniger bevorzugt' },
            { id: 'low', label: '10', description: 'Niedriger Cost, bevorzugt' },
            { id: 'zero', label: '0', description: 'Kein sinnvoller Cost' },
          ],
          correctTarget: 'low',
          feedbackWrong: 'Niedrigere Kosten machen den Pfad bevorzugt. Hier ist 10 sinnvoll.',
          feedbackCorrect: 'Richtig: Cost 10.',
        }),
      ],
    },
    {
      id: 'ad-repl-sitecfg-set-interval-guided-ui',
      type: 'guided-ui',
      title: 'Replikationsintervall setzen',
      question: 'Stelle das Replikationsintervall des Site Links auf den vorgegebenen Wert ein.',
      explanation: 'Site Link → Eigenschaften → Replikationsintervall ändern → Wert einstellen → Bestätigen. Kleinere Intervalle bedeuten aktuellere Daten, aber mehr Verkehr.',
      intro: 'Das Intervall beeinflusst, wie oft über den Site Link repliziert wird.',
      steps: [
        guidedUiStep({
          id: 'ad-repl-sitecfg-interval-open',
          kind: 'navigation',
          title: 'Site Link',
          subtitle: 'Intervall',
          instruction: 'In welchem Dialog findest du das Replikationsintervall?',
          targets: [
            { id: 'eigenschaften', label: 'Eigenschaften des Site Links', description: 'Cost und Interval' },
            { id: 'subnets', label: 'Subnets' },
            { id: 'servers', label: 'Servers' },
          ],
          correctTarget: 'eigenschaften',
          feedbackWrong: 'Cost und Intervall liegen in den Eigenschaften des Site Links.',
          feedbackCorrect: 'Richtig: Eigenschaften des Site Links.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-interval-effect',
          kind: 'decision',
          title: 'Intervall-Tradeoff',
          subtitle: 'Aktualität vs. Bandbreite',
          instruction: 'Was bedeutet ein kürzeres Replikationsintervall?',
          targets: [
            { id: 'more', label: 'Aktuellere Daten, aber mehr Verkehr' },
            { id: 'less', label: 'Weniger Verkehr, aber längere Verzögerung', description: 'Beschreibt ein längeres Intervall' },
            { id: 'none', label: 'Keine Auswirkung' },
          ],
          correctTarget: 'more',
          feedbackWrong: 'Ein kürzeres Intervall führt zu häufigerer Replikation und damit mehr Verkehr.',
          feedbackCorrect: 'Richtig: Aktuellere Daten, aber mehr Verkehr.',
        }),
      ],
    },
    {
      id: 'ad-repl-sitecfg-set-schedule-guided-ui',
      type: 'guided-ui',
      title: 'Replikationszeitplan setzen',
      question: 'Setze einen Zeitplan, der die Replikation außerhalb der Hauptgeschäftszeit erlaubt.',
      explanation: 'Site Link → Eigenschaften → Zeitplan ändern → Erlaubte Zeiträume markieren → Übernehmen. Der Admin steuert damit, wann über den Link repliziert werden darf.',
      intro: 'Ein Schedule legt fest, zu welchen Zeiten Intersite-Replikation stattfinden darf.',
      steps: [
        guidedUiStep({
          id: 'ad-repl-sitecfg-schedule-open',
          kind: 'navigation',
          title: 'Site Link',
          subtitle: 'Zeitplan',
          instruction: 'Wo änderst du den Zeitplan für den Site Link?',
          targets: [
            { id: 'eigenschaften', label: 'Eigenschaften → Zeitplan ändern', description: 'Schedule bearbeiten' },
            { id: 'subnets', label: 'Subnets' },
            { id: 'neu', label: 'Neuer Standort' },
          ],
          correctTarget: 'eigenschaften',
          feedbackWrong: 'Der Zeitplan ist in den Eigenschaften des Site Links.',
          feedbackCorrect: 'Richtig: Eigenschaften → Zeitplan ändern.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-schedule-set',
          kind: 'decision',
          title: 'Zeitfenster',
          subtitle: 'Erlaubte Zeiten',
          instruction: 'Welche Fenster markierst du am sinnvollsten, um das WAN tagsüber zu entlasten?',
          targets: [
            { id: 'day', label: '09:00–17:00 Uhr', description: 'Hauptgeschäftszeit' },
            { id: 'night', label: '18:00–07:00 Uhr', description: 'Außerhalb der Kernzeit' },
            { id: 'none', label: 'Gar keine Zeiten', description: 'Replikation deaktiviert' },
          ],
          correctTarget: 'night',
          feedbackWrong: 'Außerhalb der Hauptgeschäftszeit entlastet das WAN.',
          feedbackCorrect: 'Richtig: Nacht-/Randzeiten.',
        }),
      ],
    },
    {
      id: 'ad-repl-sitecfg-preferred-bridgehead-guided-ui',
      type: 'guided-ui',
      title: 'Preferred Bridgehead markieren',
      question: 'Markiere DC01 in LECHFELD gezielt als bevorzugten Bridgehead für den IP-Transport.',
      explanation: 'LECHFELD → Servers → DC01 → Eigenschaften → IP-Transport hinzufügen → Bestätigen. Das ist optional und nur sinnvoll, wenn es einen administrativen Grund gibt.',
      intro: 'AD wählt Bridgeheads normalerweise automatisch. Ein Preferred Bridgehead ist eine gezielte Einschränkung.',
      steps: [
        guidedUiStep({
          id: 'ad-repl-sitecfg-bridgehead-site',
          kind: 'navigation',
          title: 'Site',
          subtitle: 'LECHFELD',
          instruction: 'Wo findest du den Server, den du als Bridgehead markieren möchtest?',
          targets: [
            { id: 'sites', label: 'Sites' },
            { id: 'servers', label: 'Site → Servers', description: 'DCs der Site' },
            { id: 'subnets', label: 'Subnets' },
          ],
          correctTarget: 'servers',
          feedbackWrong: 'DCs einer Site liegen unter Site → Servers.',
          feedbackCorrect: 'Richtig: Site → Servers.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-bridgehead-action',
          kind: 'navigation',
          title: 'DC01',
          subtitle: 'Eigenschaften',
          instruction: 'Wie öffnest du die Bridgehead-Steuerung für DC01?',
          targets: [
            { id: 'rechtsklick', label: 'Rechtsklick → Eigenschaften', description: 'Eigenschaften öffnen' },
            { id: 'verschieben', label: 'Verschieben' },
            { id: 'neu', label: 'Neuer Standort' },
          ],
          correctTarget: 'rechtsklick',
          feedbackWrong: 'Die Bridgehead-Transporteinstellung liegt in den Eigenschaften des DCs.',
          feedbackCorrect: 'Richtig: Rechtsklick → Eigenschaften.',
        }),
        guidedUiStep({
          id: 'ad-repl-sitecfg-bridgehead-transport',
          kind: 'decision',
          title: 'IP-Transport',
          subtitle: 'Preferred Bridgehead',
          instruction: 'Welche Aktion markiert DC01 als bevorzugten Bridgehead für IP?',
          targets: [
            { id: 'add', label: 'IP-Transport hinzufügen', description: 'Preferred Bridgehead' },
            { id: 'remove', label: 'IP-Transport entfernen' },
            { id: 'change', label: 'Domänencontroller ändern' },
          ],
          correctTarget: 'add',
          feedbackWrong: 'IP-Transport hinzufügen markiert den DC als bevorzugten Bridgehead für IP.',
          feedbackCorrect: 'Richtig: IP-Transport hinzufügen.',
        }),
      ],
    },
    {
      id: 'ad-repl-sitecfg-admin-challenge',
      type: 'select-best',
      question: 'NEXUS-Auftrag: Baue die Standortstruktur für Lechfeld und Pöcking. In welcher Reihenfolge führst du die Schritte am sinnvollsten aus?',
      options: [
        'Sites anlegen → Subnetze anlegen/zuordnen → DCs verschieben → Site Link erstellen → Cost/Interval/Schedule setzen → verifizieren',
        'DCs verschieben → Subnetze anlegen → Site Link erstellen → Sites anlegen',
        'Cost setzen → Sites anlegen → Subnetze anlegen → DCs verschieben',
        'Site Link erstellen → Sites anlegen → Subnetze anlegen',
      ],
      correct: 0,
      explanation: 'Site muss existieren, bevor Subnetz und DC zugeordnet werden; Site Link braucht die Sites; Parameter und Verifikation folgen zuletzt.',
    },
    {
      id: 'ad-repl-sitecfg-matching',
      type: 'matching',
      question: 'Ordne jedem Begriff seine Bedeutung zu.',
      pairs: [
        { left: 'Site', right: 'physischer Netzwerkstandort' },
        { left: 'Subnet', right: 'ordnet ein IP-Netz einer Site zu' },
        { left: 'Site Link', right: 'verbindet Sites logisch' },
        { left: 'Cost', right: 'Pfadgewichtung' },
        { left: 'Schedule', right: 'erlaubte Replikationszeiten' },
        { left: 'Bridgehead', right: 'Intersite-Replikationspartner' },
      ],
      explanation: 'Site, Subnet, Site Link, Cost, Schedule und Bridgehead haben klar getrennte Rollen.',
    },
    {
      id: 'ad-repl-sitecfg-ordering',
      type: 'ordering',
      question: 'Bringe die Konfigurationsschritte in die richtige Reihenfolge.',
      items: ['Site anlegen', 'Subnetz anlegen und zuordnen', 'DC in Site verschieben', 'Site Link erstellen', 'Cost/Interval/Schedule setzen', 'Verifikation'],
      correctOrder: [0, 1, 2, 3, 4, 5],
      explanation: 'Site zuerst, dann Subnetz, DC, Link, Parameter, Verifikation.',
    },
    {
      id: 'ad-repl-sitecfg-misconception-client-site',
      type: 'select-best',
      question: '„Wenn eine Site existiert, erkennen Clients automatisch ihre Site, auch ohne Subnetzdefinition." Stimmt das?',
      options: ['Ja', 'Nein, Subnetzzuordnung ist zentral für die Site-Erkennung', 'Nur in derselben Domäne', 'Nur für Windows 11'],
      correct: 1,
      explanation: 'Ohne passende Subnetzzuordnung kann AD den Client nicht zuverlässig der richtigen Site zuordnen.',
    },
    {
      id: 'ad-repl-sitecfg-misconception-dc-auto',
      type: 'select-best',
      question: '„Ein DC wird durch das Erstellen einer Site automatisch dorthin verschoben." Stimmt das?',
      options: ['Ja', 'Nein, DCs müssen explizit verschoben werden', 'Nur bei PDC', 'Nur bei Schema Master'],
      correct: 1,
      explanation: 'Neue Sites führen nicht automatisch zur Umsortierung der DCs; der Admin muss das verschieben.',
    },
    {
      id: 'ad-repl-sitecfg-misconception-cost',
      type: 'select-best',
      question: '„Niedrigere Site-Link-Cost bedeutet eine schlechtere Verbindung." Stimmt das?',
      options: ['Ja', 'Nein, niedrigere Cost bedeutet bevorzugterer Pfad', 'Cost hat keine Bedeutung', 'Cost ist echte Geldzahlung'],
      correct: 1,
      explanation: 'Niedrigere Cost bevorzugen einen Pfad; es ist ein administrativer Gewichtungswert.',
    },
    {
      id: 'ad-repl-sitecfg-misconception-bridgehead',
      type: 'select-best',
      question: '„Bridgehead-Server sollten immer manuell gesetzt werden." Stimmt das?',
      options: ['Ja', 'Nein, automatisch ist Standard; manuell nur bewusst und optional', 'Nur in großen Domänen', 'Nur für RODCs'],
      correct: 1,
      explanation: 'KCC wählt Bridgeheads normalerweise automatisch; Preferred Bridgehead ist optional.',
    },
    {
      id: 'ad-repl-sitecfg-troubleshoot-subnet',
      type: 'select-best',
      question: 'Ein Client aus 192.168.10.0/24 wird der falschen Site zugeordnet. Was prüfst du zuerst?',
      options: ['Subnetzzuordnung zu LECHFELD', 'Schemaänderungen', 'Festplattenplatz', 'DNS-Forwarder'],
      correct: 0,
      explanation: 'Die Subnetzzuordnung bestimmt, welchem Standort AD Clients zuordnet.',
    },
    {
      id: 'ad-repl-sitecfg-troubleshoot-dc-default',
      type: 'select-best',
      question: 'Eine Site existiert, aber der DC liegt noch in Default-First-Site-Name. Was tust du?',
      options: ['DC in die richtige Site verschieben', 'Den DC neu installieren', 'Die Site umbenennen', 'Subnetz löschen'],
      correct: 0,
      explanation: 'Ein DC wird nicht automatisch verschoben; der Admin muss ihn unter Servers in die Ziel-Site verschieben.',
    },
    {
      id: 'ad-repl-sitecfg-troubleshoot-site-link-membership',
      type: 'select-best',
      question: 'LECHFELD und PÖCKING sollen direkt replizieren, tun es aber nicht. Was prüfst du?',
      options: ['Site-Link-Mitgliedschaft beider Sites', 'Ob die Clients Windows 11 sind', 'Ob es genug Arbeitsspeicher gibt', 'Ob das Schema erweitert wurde'],
      correct: 0,
      explanation: 'Nur wenn beide Sites im selben Site Link enthalten sind, ist ein direkter logischer Pfad vorhanden.',
    },
    {
      id: 'ad-repl-sitecfg-troubleshoot-cost',
      type: 'select-best',
      question: 'Ein unerwünschter Replikationsweg wird bevorzugt. Was prüfst du?',
      options: ['Site Link Costs', 'Subnet-Masken', 'Client-Namen', 'DNS-Suffix'],
      correct: 0,
      explanation: 'Costs bestimmen, welche logischen Pfade bevorzugt werden.',
    },
    {
      id: 'ad-repl-sitecfg-troubleshoot-schedule',
      type: 'select-best',
      question: 'Replikation findet im erwarteten Zeitfenster nicht statt. Was prüfst du?',
      options: ['Schedule und Interval des Site Links', 'Ob die DCs dieselbe Uhrzeit haben', 'Ob Antivirus läuft', 'Ob das Netzwerkkabel steckt'],
      correct: 0,
      explanation: 'Schedule erlaubt bestimmte Zeiten; Interval bestimmt die Häufigkeit innerhalb dieser Zeiten.',
    },
    {
      id: 'ad-repl-sitecfg-verify-checklist',
      type: 'select-best',
      question: 'Was gehört zur finalen Verifikation der NEXUS-Standortstruktur?',
      options: [
        'Site existiert, Subnetz zeigt auf Site, DC liegt in Site, Site Link verbindet beide Sites',
        'Nur Site existiert',
        'Nur Site Link existiert',
        'Nur Subnetz ist korrekt',
      ],
      correct: 0,
      explanation: 'Verifikation prüft Site, Subnet, DC-Platzierung und Site-Link-Verbindung.',
    },
  ];

  const quiz = [
    { question: 'Wo legt man eine neue AD Site an?', options: ['Active Directory-Standorte und -Dienste → Sites', 'Active Directory-Benutzer und -Computer', 'DNS-Manager', 'Ereignisanzeige'], correct: 0, explanation: 'Sites werden in Active Directory-Standorte und -Dienste angelegt.' },
    { question: 'Welches Objekt ordnet Clients anhand der IP-Adresse einem Standort zu?', options: ['Site', 'Subnet', 'Site Link', 'Bridgehead'], correct: 1, explanation: 'Subnetze mappen IP-Netze auf Sites.' },
    { question: 'Was muss der Administrator nach dem Anlegen einer neuen Site für DCs manuell tun?', options: ['DCs in die Site verschieben', 'Nichts, DCs wandern automatisch', 'Neue DCs installieren', 'DNS neu aufsetzen'], correct: 0, explanation: 'DCs müssen explizit in die passende Site verschoben werden.' },
    { question: 'Was steuert, welcher Intersite-Pfad bevorzugt wird?', options: ['Site Link Cost', 'Client-Betriebssystem', 'DC-Name', 'Subnetzgröße'], correct: 0, explanation: 'Cost ist das Pfadgewicht; niedrigere Werte bevorzugen.' },
    { question: 'Was ist der Unterschied zwischen Interval und Schedule?', options: ['Interval = Häufigkeit, Schedule = erlaubte Zeitfenster', 'Beides ist gleich', 'Interval = Zeitfenster, Schedule = Häufigkeit', 'Interval gibt es nicht'], correct: 0, explanation: 'Interval bestimmt, wie oft; Schedule, wann es erlaubt ist.' },
  ];

  const summary = [
    'Active Directory-Standorte und -Dienste verwaltet Sites, Subnets, Server-Standorte und Site Links.',
    'Default-First-Site-Name ist der normale Ausgangsstandort nach einer AD-Installation.',
    'Site muss existieren, bevor Subnetze und DCs zugeordnet werden.',
    'Subnetze ordnen IP-Netze in CIDR-Notation einer Site zu.',
    'DCs werden nicht automatisch in neue Sites verschoben; der Admin muss sie verschieben.',
    'Site Links verbinden Sites logisch und werden unter Inter-Site Transports → IP angelegt.',
    'Site Link Cost ist ein Pfadgewicht; niedrigere Kosten bevorzugen den Pfad.',
    'Replikationsintervall steuert die Häufigkeit; ein kürzeres Intervall bedeutet mehr Verkehr.',
    'Schedule legt erlaubte Replikationszeiträume fest.',
    'Preferred Bridgehead ist optional und nur sinnvoll, wenn ein administrativer Grund besteht.',
    'Verifikation prüft Site, Subnet, DC-Platzierung und Site-Link-Mitgliedschaft.',
  ];

  return { title: 'Sites & Site Links praktisch konfigurieren', explanations, exercises, quiz, summary };
}
