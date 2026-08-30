import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Troubleshooting" - fills the catalog's existing `cisco-packet-tracer/
// troubleshooting` slot (re-chained in Milestone C6 to sit after
// static-routing/inter-vlan-routing/multilayer-switching instead of the
// still-empty "ip-configuration" placeholder). Deliberately NOT a plain list
// of show-commands: every exercise/quiz question describes a symptom and
// asks the learner to pick (or type) the right diagnostic command themselves -
// per the Milestone C6 requirement that troubleshooting be scenario-driven.
// =============================================================================

export const CISCO_TROUBLESHOOTING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'troubleshooting');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Systematische Fehlersuche statt Raten', 'classic', [
    { type: 'text', content: 'Du kennst inzwischen viele einzelne show-Befehle aus den vorherigen Lektionen. Troubleshooting bedeutet, anhand eines Symptoms selbst zu entscheiden, welcher Befehl dir am schnellsten die richtige Information liefert - statt wahllos alles nacheinander einzugeben.' },
  ]));

  exps.push(explanation('uebersicht-classic', 'Die wichtigsten Diagnosebefehle im Überblick', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wofür er die richtige Wahl ist'], rows: [
      ['show ip interface brief', 'Schnellster Überblick über Status (up/down) und IP-Adresse aller Schnittstellen - Standard-Einstiegspunkt bei "keine Verbindung".'],
      ['show vlan brief', 'Zeigt, welche Ports welchem VLAN zugewiesen sind - wenn ein Gerät im "falschen" Netz landet.'],
      ['show interfaces trunk', 'Zeigt Trunk-Ports mit erlaubten VLANs - wenn VLAN-Verkehr zwischen Switches nicht ankommt.'],
      ['show interfaces status', 'Kompakter Gesamtüberblick über Status, VLAN, Duplex und Geschwindigkeit aller Ports.'],
      ['show interfaces switchport', 'Detail-Ansicht eines einzelnen Ports (Access/Trunk-Modus, zugewiesenes VLAN).'],
      ['show ip route', 'Zeigt die Routing-Tabelle - wenn Pakete ein entferntes Netz nicht erreichen.'],
      ['show arp', 'Zeigt, welche MAC-Adresse zu welcher IP-Adresse im lokalen Netz bekannt ist - hilfreich bei "Host antwortet nicht, obwohl er erreichbar sein sollte".'],
      ['show mac address-table', 'Zeigt, an welchem Port welche MAC-Adresse gelernt wurde - hilfreich, um herauszufinden, wo ein Gerät tatsächlich angeschlossen ist.'],
      ['show running-config', 'Zeigt die komplette aktive Konfiguration - wenn du nicht mehr sicher bist, was insgesamt konfiguriert wurde.'],
    ] },
  ]));

  exps.push(explanation('vorgehen-classic', 'Eine sinnvolle Reihenfolge beim Troubleshooting', 'classic', [
    { type: 'list', title: 'Bewährter Ablauf', items: [
      '1. Ist die Schnittstelle überhaupt "up"? → "show ip interface brief".',
      '2. Ist der Port im richtigen VLAN? → "show vlan brief" bzw. "show interfaces switchport".',
      '3. Kommt VLAN-Verkehr über den Trunk richtig an? → "show interfaces trunk".',
      '4. Kennt der Router den Weg zum Ziel? → "show ip route".',
      '5. Ist das Zielgerät im lokalen Netz überhaupt bekannt? → "show arp" bzw. "show mac address-table".',
    ] },
    { type: 'text', content: 'Diese Reihenfolge arbeitet sich von "unten nach oben" durch die Schichten - von der physischen Verbindung bis zum Routing - und findet Fehler dadurch meist am schnellsten.' },
    { type: 'question', question: 'Ein PC hat gar keine Verbindung. Welcher Befehl ist der sinnvollste erste Schritt?', options: ['show ip route', 'show ip interface brief', 'show mac address-table', 'show running-config'], correct: 1, explanation: 'Zuerst prüfst du, ob die Schnittstelle überhaupt aktiv ist und eine IP-Adresse hat.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Merke dir pro Symptom den passenden Befehl', items: [
      'Keine Verbindung / Status unklar → "show ip interface brief".',
      'Falsches VLAN → "show vlan brief" / "show interfaces switchport".',
      'VLAN kommt nicht über den Trunk an → "show interfaces trunk".',
      'Entferntes Netz nicht erreichbar → "show ip route".',
      'Gerät im lokalen Netz nicht auffindbar → "show arp" / "show mac address-table".',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'troubleshooting-matching',
      type: 'matching',
      question: 'Ordne jedes Symptom dem passenden Diagnosebefehl zu.',
      pairs: [
        { left: 'Gerät landet im falschen VLAN', leftLabel: 'Gerät landet im falschen VLAN', right: 'show vlan brief' },
        { left: 'VLAN-Verkehr kommt nicht über den Trunk an', leftLabel: 'VLAN-Verkehr kommt nicht über den Trunk an', right: 'show interfaces trunk' },
        { left: 'Entferntes Netz nicht erreichbar', leftLabel: 'Entferntes Netz nicht erreichbar', right: 'show ip route' },
        { left: 'Gerät im lokalen Netz nicht auffindbar', leftLabel: 'Gerät im lokalen Netz nicht auffindbar', right: 'show mac address-table' },
      ],
      explanation: 'Jedes Symptom hat einen naheliegenden ersten Diagnosebefehl, der die relevante Information am schnellsten liefert.',
    },
    {
      id: 'troubleshooting-select-1',
      type: 'select-best',
      question: 'Sam: "Ein neuer PC an fa0/5 bekommt keine IP-Adresse und der Switch-Port zeigt \'down\' in einem anderen Befehl. Womit prüfst du das zuerst?"',
      options: ['show vlan brief', 'show ip interface brief', 'show ip route', 'show running-config'],
      correct: 1,
      explanation: '"show ip interface brief" zeigt sofort, ob die Schnittstelle up/down ist.',
    },
    {
      id: 'troubleshooting-select-2',
      type: 'select-best',
      question: 'Sam: "Zwei Switches sind per Trunk verbunden, aber Geräte in VLAN 20 auf dem einen Switch erreichen Geräte in VLAN 20 auf dem anderen Switch nicht. Was prüfst du?"',
      options: ['show mac address-table', 'show interfaces trunk - ist VLAN 20 dort überhaupt erlaubt?', 'show ip route', 'show arp'],
      correct: 1,
      explanation: 'Wenn VLAN 20 nicht in der "allowed vlan"-Liste des Trunks steht, kommt der Verkehr nicht durch.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      id: 'troubleshooting-cli-1',
      type: 'cli-input',
      question: 'Sam: "Ein Router soll ein entferntes Netz erreichen, tut es aber nicht. Prüfe zuerst die Routing-Tabelle."',
      expectedLines: [['show ip route', 'sh ip route']],
      explanation: '"show ip route" zeigt, ob überhaupt eine passende Route zum Zielnetz existiert.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      id: 'troubleshooting-cli-2',
      type: 'cli-input',
      question: 'Sam: "Wir wissen die MAC-Adresse eines Geräts, aber nicht an welchem Port es hängt. Finde es heraus."',
      expectedLines: [['show mac address-table', 'show mac address table']],
      explanation: '"show mac address-table" zeigt, an welchem Port welche MAC-Adresse gelernt wurde.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Sam: "Ein PC bekommt per DHCP keine Adresse und der Port zeigt in \'show vlan brief\' ein unerwartetes VLAN." Was ist der wahrscheinlichste nächste Schritt?', options: ['Den Port mit "switchport access vlan" dem richtigen VLAN zuweisen', 'Den Switch neu starten', 'Ein neues Kabel verlegen', 'VLAN 1 löschen'], correct: 0, explanation: 'Wenn der Port im falschen VLAN hängt, korrigiert "switchport access vlan <ID>" die Zuweisung.' },
    { question: 'Welcher Befehl zeigt am direktesten, ob ein Interface überhaupt "up" ist?', options: ['show vlan brief', 'show ip interface brief', 'show mac address-table', 'show interfaces trunk'], correct: 1, explanation: '"show ip interface brief" ist der Standard-Einstiegsbefehl für den Verbindungsstatus.' },
    { question: 'Ein Router kennt laut "show ip route" keine Route zu 10.10.10.0/24. Was ist eine sinnvolle nächste Handlung?', options: ['Eine statische Route mit "ip route" eintragen', '"show vlan brief" ausführen', 'Den Port als Trunk konfigurieren', 'Das VLAN umbenennen'], correct: 0, explanation: 'Fehlt die Route, muss sie entweder statisch eingetragen oder über ein dynamisches Protokoll gelernt werden.' },
    { question: 'Welcher Befehl hilft am meisten, wenn du wissen willst, an welchem Switch-Port ein bestimmtes Gerät physisch hängt?', options: ['show ip route', 'show mac address-table', 'show running-config', 'show vlan brief'], correct: 1, explanation: '"show mac address-table" verknüpft MAC-Adressen mit dem Port, an dem sie gelernt wurden.' },
    { question: 'Ein VLAN existiert, ein Port ist ihm korrekt zugewiesen, aber der Trunk zum anderen Switch lässt dieses VLAN laut "show interfaces trunk" nicht durch. Was ist die Ursache?', options: ['Das VLAN wurde falsch benannt', 'Die "allowed vlan"-Liste des Trunks schließt dieses VLAN aus', 'Der Access-Port ist defekt', 'Die IP-Adresse ist falsch'], correct: 1, explanation: 'Eine zu eng gefasste "switchport trunk allowed vlan"-Liste ist eine klassische Fehlerursache.' },
  ];
}

function buildCliTasks() {
  return [
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Ein Kollege sagt, VLAN 30 kommt nicht über die Trunk-Verbindung an. Prüfe, welche VLANs der Trunk überhaupt erlaubt."',
      expectedLines: [['show interfaces trunk', 'sh int trunk']],
      explanation: '"show interfaces trunk" zeigt die erlaubten VLANs pro Trunk-Port.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Ein PC an fa0/12 hat keine Verbindung. Prüfe zuerst den grundsätzlichen Interface-Status."',
      expectedLines: [['show ip interface brief', 'sh ip int br']],
      explanation: '"show ip interface brief" ist der schnellste erste Diagnoseschritt.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeig mir, welcher Port aktuell welchem VLAN zugewiesen ist - ich vermute einen Konfigurationsfehler."',
      expectedLines: [['show vlan brief', 'sh vlan brief']],
      explanation: '"show vlan brief" zeigt kompakt alle VLANs mit ihren zugewiesenen Ports.',
    },
  ];
}

export function buildCiscoTroubleshootingLesson() {
  return {
    title: 'Troubleshooting',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
