import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Switching" - fundamentals topic. Purely conceptual (device-agnostic): what
// a switch does, the MAC address table, how it learns/floods/forwards, and
// how switches compare to hubs and routers. No vendor CLI here - that lives
// in the Cisco category, this lesson stays self-contained as general theory.
// =============================================================================

export const SWITCHING_TOPIC_KEY = topicKey('fundamentals', 'switching');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Was macht ein Switch?
  // ---------------------------------------------------------------------
  exps.push(explanation('was-classic', 'Was macht ein Switch?', 'classic', [
    { type: 'text', content: 'Ein Switch verbindet mehrere Geräte innerhalb eines lokalen Netzes (LAN) und vermittelt den Datenverkehr zwischen ihnen anhand von MAC-Adressen (Schicht 2 des OSI-Modells).' },
    { type: 'list', title: 'Warum nicht einfach alles an alle senden?', items: [
      'Unnötiger Verkehr auf Leitungen, die das Ziel gar nicht betrifft.',
      'Schlechtere Performance, da alle Geräte jedes Signal verarbeiten müssten.',
      'Ein Switch sendet ein Frame möglichst gezielt nur an den Port, hinter dem das Zielgerät tatsächlich hängt.',
    ] },
  ]));

  exps.push(explanation('was-intuitive', 'Was macht ein Switch?', 'intuitive', [
    { type: 'text', content: 'Stell dir einen Switch wie eine Telefonvermittlung vor: Er kennt genau, welcher Anschluss zu welcher Person gehört, und verbindet zwei Gesprächspartner direkt - ohne dass alle anderen Anschlüsse mithören müssen.' },
  ]));

  // ---------------------------------------------------------------------
  // 2. Switch vs. Hub vs. Router
  // ---------------------------------------------------------------------
  exps.push(explanation('vergleich-classic', 'Switch, Hub und Router im Vergleich', 'classic', [
    { type: 'table', headers: ['Gerät', 'Arbeitet auf', 'Verhalten'], rows: [
      ['Hub', 'Schicht 1 (Physisch)', 'Sendet jedes eingehende Signal an ALLE anderen Ports - keine Intelligenz, viele Kollisionen.'],
      ['Switch', 'Schicht 2 (Sicherung)', 'Sendet ein Frame gezielt nur an den Port des bekannten Ziels, anhand der MAC-Adresse.'],
      ['Router', 'Schicht 3 (Vermittlung)', 'Leitet Pakete zwischen unterschiedlichen Netzen anhand von IP-Adressen weiter.'],
    ] },
    { type: 'text', content: 'Hubs werden in modernen Netzen praktisch nicht mehr eingesetzt - Switches haben sie komplett verdrängt, da sie deutlich effizienter arbeiten und Kollisionen vermeiden.' },
  ]));

  // ---------------------------------------------------------------------
  // 3. Die MAC-Adresstabelle
  // ---------------------------------------------------------------------
  exps.push(explanation('mac-tabelle-classic', 'Die MAC-Adresstabelle', 'classic', [
    { type: 'text', content: 'Damit ein Switch gezielt weiterleiten kann, führt er eine MAC-Adresstabelle (auch CAM-Tabelle genannt): eine Liste, welche MAC-Adresse an welchem Port erreichbar ist.' },
    { type: 'list', title: 'Wie die Tabelle entsteht (MAC-Learning)', items: [
      '1. Ein Frame trifft an einem Port ein.',
      '2. Der Switch schaut sich die Absender-MAC-Adresse des Frames an.',
      '3. Er trägt (oder aktualisiert) den Eintrag "diese MAC-Adresse ist über diesen Port erreichbar" in seine Tabelle ein.',
      '4. Dieser Vorgang wiederholt sich fortlaufend für jeden eintreffenden Frame - der Switch "lernt" so mit der Zeit, wo jedes Gerät hängt.',
    ] },
    { type: 'question', question: 'Anhand welcher Information trägt ein Switch einen neuen Eintrag in seine MAC-Adresstabelle ein?', options: ['Der Ziel-IP-Adresse des Frames', 'Der Absender-MAC-Adresse des eingehenden Frames', 'Der Portnummer des Empfängers', 'Der Subnetzmaske des Absenders'], correct: 1, explanation: 'Der Switch liest die Absender-MAC-Adresse aus und merkt sich, über welchen Port sie erreichbar ist.' },
  ]));

  // ---------------------------------------------------------------------
  // 4. Weiterleiten, Fluten, Filtern
  // ---------------------------------------------------------------------
  exps.push(explanation('forwarding-classic', 'Weiterleiten, Fluten und Filtern', 'classic', [
    { type: 'list', title: 'Was der Switch mit einem Frame macht', items: [
      'Forward (Weiterleiten): Ist die Ziel-MAC-Adresse bereits bekannt, wird der Frame gezielt nur an den passenden Port gesendet.',
      'Flood (Fluten): Ist die Ziel-MAC-Adresse noch unbekannt (oder es handelt sich um einen Broadcast), wird der Frame an alle Ports außer dem Eingangsport gesendet.',
      'Filter (Verwerfen/Nicht weiterleiten): Liegt Quelle und Ziel eines Frames am selben Port, muss der Switch ihn nicht auf einen anderen Port weiterleiten.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 5. Broadcast- und Kollisionsdomänen
  // ---------------------------------------------------------------------
  exps.push(explanation('domaenen-classic', 'Broadcast- und Kollisionsdomänen', 'classic', [
    { type: 'list', title: 'Zwei wichtige Begriffe', items: [
      'Kollisionsdomäne: Der Bereich, in dem zwei gleichzeitig sendende Geräte miteinander kollidieren könnten. Jeder Switch-Port bildet für sich eine eigene Kollisionsdomäne (im Vollduplex-Betrieb praktisch keine Kollisionen mehr).',
      'Broadcast-Domäne: Der Bereich, den ein Broadcast (Nachricht an "alle") erreicht. Ein Switch leitet Broadcasts an alle seine Ports weiter - alle an einen Switch (oder mehrere verbundene Switches) angeschlossenen Geräte bilden daher eine gemeinsame Broadcast-Domäne, sofern sie nicht per VLAN getrennt sind.',
    ] },
    { type: 'text', content: 'Diese Unterscheidung ist wichtig für die spätere VLAN-Lektion: VLANs teilen genau diese eine große Broadcast-Domäne in mehrere kleinere auf.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Ein Switch vermittelt Datenverkehr innerhalb eines lokalen Netzes anhand von MAC-Adressen (Schicht 2).',
      'Ein Hub sendet blind an alle Ports, ein Switch gezielt, ein Router routet zwischen Netzen anhand von IP-Adressen.',
      'Die MAC-Adresstabelle (CAM-Tabelle) merkt sich, welche MAC-Adresse über welchen Port erreichbar ist.',
      'Ist das Ziel bekannt: Forward. Ist es unbekannt oder ein Broadcast: Flood. Quelle=Ziel-Port: Filter.',
      'Jeder Switch-Port ist eine eigene Kollisionsdomäne; alle verbundenen Geräte teilen sich (ohne VLANs) eine gemeinsame Broadcast-Domäne.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'switch-learning-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte des MAC-Address-Learnings in die richtige Reihenfolge.',
      items: [
        { id: 'eingang', label: 'Ein Frame trifft an einem Port ein' },
        { id: 'lesen', label: 'Switch liest die Absender-MAC-Adresse aus' },
        { id: 'eintragen', label: 'Switch trägt MAC-Adresse und Port in die MAC-Adresstabelle ein' },
        { id: 'wiederholen', label: 'Vorgang wiederholt sich für jeden weiteren Frame' },
      ],
      correctOrder: ['eingang', 'lesen', 'eintragen', 'wiederholen'],
      explanation: 'Der Switch lernt fortlaufend, indem er bei jedem Frame die Absender-MAC-Adresse mit dem Eingangsport verknüpft.',
    },
    {
      id: 'device-function-matching',
      type: 'matching',
      question: 'Ordne jedem Gerät seine Funktion zu.',
      pairs: [
        { left: 'Hub', leftLabel: 'Hub', right: 'Sendet jedes Signal blind an alle Ports' },
        { left: 'Switch', leftLabel: 'Switch', right: 'Leitet Frames gezielt anhand von MAC-Adressen weiter' },
        { left: 'Router', leftLabel: 'Router', right: 'Leitet Pakete zwischen Netzen anhand von IP-Adressen weiter' },
      ],
      explanation: 'Hub = blind an alle, Switch = gezielt per MAC-Adresse, Router = zwischen Netzen per IP-Adresse.',
    },
    {
      id: 'forward-flood-filter-matching',
      type: 'matching',
      question: 'Ordne jede Situation der passenden Switch-Aktion zu.',
      pairs: [
        { left: 'Ziel-MAC bekannt', leftLabel: 'Ziel-MAC bekannt', right: 'Forward (gezielt weiterleiten)' },
        { left: 'Ziel-MAC unbekannt oder Broadcast', leftLabel: 'Ziel-MAC unbekannt oder Broadcast', right: 'Flood (an alle Ports außer Eingang)' },
        { left: 'Quelle und Ziel am selben Port', leftLabel: 'Quelle und Ziel am selben Port', right: 'Filter (nicht weiterleiten)' },
      ],
      explanation: 'Bekanntes Ziel → Forward, unbekanntes Ziel/Broadcast → Flood, gleicher Port → Filter.',
    },
    {
      id: 'broadcast-domain-select',
      type: 'select-best',
      question: 'Was beschreibt eine Broadcast-Domäne am besten?',
      options: ['Den Bereich, in dem zwei Geräte kollidieren könnten', 'Den Bereich, den eine Broadcast-Nachricht erreicht', 'Die Anzahl der Ports eines Switches', 'Die maximale Kabellänge eines Netzes'],
      correct: 1,
      explanation: 'Die Broadcast-Domäne umfasst alle Geräte, die eine an "alle" gerichtete Nachricht (Broadcast) empfangen.',
    },
    {
      id: 'mac-table-input',
      type: 'input',
      question: 'Wie wird die Tabelle genannt, in der ein Switch speichert, welche MAC-Adresse über welchen Port erreichbar ist? (Begriff eingeben)',
      answers: ['mac-adresstabelle', 'mac adresstabelle', 'mac-adress-tabelle', 'cam-tabelle', 'cam tabelle'],
      explanation: 'Diese Tabelle wird MAC-Adresstabelle oder (nach dem verwendeten Speicherbaustein) CAM-Tabelle genannt.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Auf welcher OSI-Schicht arbeitet ein klassischer Switch?', options: ['Schicht 1 (Physisch)', 'Schicht 2 (Sicherung)', 'Schicht 3 (Vermittlung)', 'Schicht 4 (Transport)'], correct: 1, explanation: 'Ein klassischer Switch arbeitet auf Schicht 2 und vermittelt anhand von MAC-Adressen.' },
    { question: 'Was unterscheidet einen Hub grundlegend von einem Switch?', options: ['Ein Hub sendet Signale gezielt, ein Switch nicht', 'Ein Hub sendet blind an alle Ports, ein Switch gezielt an den passenden Port', 'Ein Hub arbeitet auf Schicht 3', 'Es gibt keinen Unterschied'], correct: 1, explanation: 'Ein Hub hat keine Intelligenz und sendet an alle Ports, ein Switch leitet gezielt weiter.' },
    { question: 'Was speichert die MAC-Adresstabelle eines Switches?', options: ['IP-Adressen aller Geräte im Internet', 'Welche MAC-Adresse über welchen Port erreichbar ist', 'Die Passwörter angeschlossener Geräte', 'Die Routingtabelle des Netzes'], correct: 1, explanation: 'Sie verknüpft MAC-Adressen mit dem Port, über den sie erreichbar sind.' },
    { question: 'Wie lernt ein Switch, welches Gerät an welchem Port hängt?', options: ['Durch manuelle Eingabe jeder MAC-Adresse', 'Durch Auswertung der Absender-MAC-Adresse eingehender Frames', 'Durch Abfrage eines DNS-Servers', 'Durch Analyse der IP-Adresse'], correct: 1, explanation: 'Der Switch liest bei jedem eingehenden Frame die Absender-MAC-Adresse aus und lernt so den zugehörigen Port.' },
    { question: 'Was macht ein Switch, wenn die Ziel-MAC-Adresse eines Frames noch nicht bekannt ist?', options: ['Er verwirft den Frame sofort', 'Er flutet den Frame an alle Ports außer dem Eingangsport', 'Er sendet ihn an einen DNS-Server', 'Er wartet, bis das Ziel sich meldet'], correct: 1, explanation: 'Bei unbekanntem Ziel (oder einem Broadcast) flutet der Switch den Frame an alle anderen Ports.' },
    { question: 'Was ist eine Kollisionsdomäne?', options: ['Der Bereich, den ein Broadcast erreicht', 'Der Bereich, in dem gleichzeitig sendende Geräte kollidieren könnten', 'Die Anzahl der VLANs auf einem Switch', 'Die maximale Anzahl an Switches in Reihe'], correct: 1, explanation: 'Eine Kollisionsdomäne umfasst Geräte, deren gleichzeitiges Senden zu einer Kollision führen könnte.' },
    { question: 'Wie viele Kollisionsdomänen bildet typischerweise jeder Switch-Port?', options: ['Keine', 'Genau eine pro Port', 'Immer genau zwei', 'Eine pro angeschlossenem Switch insgesamt'], correct: 1, explanation: 'Jeder Switch-Port bildet für sich eine eigene Kollisionsdomäne.' },
    { question: 'Was passiert mit einem Broadcast in einem Netz ohne VLANs?', options: ['Er wird nur an den Absender zurückgeschickt', 'Er wird an alle Geräte im gesamten (verbundenen) Netz weitergeleitet', 'Er wird automatisch blockiert', 'Er wird in eine Unicast-Nachricht umgewandelt'], correct: 1, explanation: 'Ohne VLAN-Trennung erreicht ein Broadcast alle Geräte in derselben Broadcast-Domäne.' },
    { question: 'Welches Gerät leitet Datenverkehr zwischen unterschiedlichen IP-Netzen weiter?', options: ['Hub', 'Switch', 'Router', 'Repeater'], correct: 2, explanation: 'Ein Router leitet Pakete anhand von IP-Adressen zwischen unterschiedlichen Netzen weiter.' },
    { question: 'Wann leitet ein Switch einen Frame NICHT an einen anderen Port weiter (Filter)?', options: ['Wenn Ziel-MAC unbekannt ist', 'Wenn Quelle und Ziel am selben Port hängen', 'Wenn es sich um einen Broadcast handelt', 'Nie - jeder Frame wird immer weitergeleitet'], correct: 1, explanation: 'Hängen Quelle und Ziel am selben Port, muss der Frame nicht auf einen anderen Port weitergeleitet werden.' },
  ];
}

export function buildSwitchingLesson() {
  return {
    title: 'Switching',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'Ein Switch vermittelt Datenverkehr innerhalb eines lokalen Netzes anhand von MAC-Adressen (Schicht 2).',
      'Hub = blind an alle Ports, Switch = gezielt per MAC-Adresse, Router = zwischen Netzen per IP-Adresse.',
      'Die MAC-Adresstabelle (CAM-Tabelle) merkt sich, welche MAC-Adresse über welchen Port erreichbar ist.',
      'Bekanntes Ziel → Forward, unbekanntes Ziel/Broadcast → Flood, gleicher Port → Filter.',
      'Jeder Switch-Port bildet eine eigene Kollisionsdomäne; ohne VLANs teilen sich alle Geräte eine Broadcast-Domäne.',
    ],
  };
}
