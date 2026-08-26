import { topicKey } from '../academyTopics.js';

// =============================================================================
// Milestone C5.3 - consolidates the four previously separate placeholder
// topics "Kommunikationsarten", "Betriebsarten", "Ausbreitungsarten" and
// "Übertragungsmedien" into ONE full LessonRunner lesson with four sections
// (following the same multi-section pattern as osi.js). No prior lesson
// content existed for any of the four topics, so this is newly authored
// content rather than a merge of pre-existing material.
// =============================================================================

export const KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY = topicKey('fundamentals', 'kommunikation-uebertragung');

const UNICAST_SVG = `<svg viewBox="0 0 200 100" class="w-full h-auto max-h-48" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="50" r="10" fill="#00f0ff"/><circle cx="170" cy="50" r="10" fill="#c9d1d9"/><line x1="40" y1="50" x2="160" y2="50" stroke="#00f0ff" stroke-width="2" marker-end="url(#a1)"/><defs><marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#00f0ff"/></marker></defs><text x="30" y="75" fill="#8b949e" font-size="10" text-anchor="middle">Sender</text><text x="170" y="75" fill="#8b949e" font-size="10" text-anchor="middle">Ein Empfänger</text></svg>`;
const BROADCAST_SVG = `<svg viewBox="0 0 200 120" class="w-full h-auto max-h-48" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="60" r="10" fill="#00f0ff"/><circle cx="170" cy="20" r="8" fill="#c9d1d9"/><circle cx="170" cy="60" r="8" fill="#c9d1d9"/><circle cx="170" cy="100" r="8" fill="#c9d1d9"/><line x1="40" y1="60" x2="162" y2="24" stroke="#00f0ff" stroke-width="2"/><line x1="40" y1="60" x2="162" y2="60" stroke="#00f0ff" stroke-width="2"/><line x1="40" y1="60" x2="162" y2="96" stroke="#00f0ff" stroke-width="2"/><text x="30" y="85" fill="#8b949e" font-size="10" text-anchor="middle">Sender</text><text x="170" y="115" fill="#8b949e" font-size="10" text-anchor="middle">Alle im Netz</text></svg>`;
const MULTICAST_SVG = `<svg viewBox="0 0 200 120" class="w-full h-auto max-h-48" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="60" r="10" fill="#00f0ff"/><circle cx="170" cy="30" r="8" fill="#00ff66"/><circle cx="170" cy="90" r="8" fill="#00ff66"/><circle cx="170" cy="60" r="8" fill="#3a3f4b" opacity="0.5"/><line x1="40" y1="60" x2="162" y2="33" stroke="#00f0ff" stroke-width="2"/><line x1="40" y1="60" x2="162" y2="87" stroke="#00f0ff" stroke-width="2"/><text x="30" y="85" fill="#8b949e" font-size="10" text-anchor="middle">Sender</text><text x="170" y="110" fill="#8b949e" font-size="10" text-anchor="middle">Nur die Gruppe</text></svg>`;
const COAX_SVG = `<svg viewBox="0 0 340 130" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="72" cy="65" r="52" fill="#30363d"/><circle cx="72" cy="65" r="42" fill="#8b949e"/><circle cx="72" cy="65" r="31" fill="#f0f6fc"/><circle cx="72" cy="65" r="11" fill="#d29922"/><line x1="83" y1="65" x2="180" y2="30" stroke="#d29922"/><text x="186" y="33" fill="#d29922" font-size="11">Innenleiter</text><line x1="101" y1="80" x2="180" y2="65" stroke="#c9d1d9"/><text x="186" y="68" fill="#c9d1d9" font-size="11">Isolierung</text><line x1="112" y1="95" x2="180" y2="98" stroke="#8b949e"/><text x="186" y="101" fill="#8b949e" font-size="11">Schirmung</text><line x1="104" y1="28" x2="180" y2="116" stroke="#00f0ff"/><text x="186" y="119" fill="#00f0ff" font-size="11">Außenmantel</text><text x="270" y="64" text-anchor="middle" fill="#00ff66" font-size="12">gemeinsame Achse</text><text x="270" y="82" text-anchor="middle" fill="#8b949e" font-size="10">ko-axial</text></svg>`;
const FIBER_SVG = `<svg viewBox="0 0 340 130" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="25" width="304" height="80" rx="36" fill="#30363d" stroke="#8b949e"/><rect x="30" y="42" width="280" height="46" rx="22" fill="#07111f" stroke="#00f0ff"/><text x="50" y="37" fill="#8b949e" font-size="10">Cladding</text><text x="50" y="69" fill="#00f0ff" font-size="10">Core</text><polyline points="84,66 125,47 166,83 207,47 248,83 290,64" fill="none" stroke="#ffcc00" stroke-width="3"/><text x="170" y="120" text-anchor="middle" fill="#ffcc00" font-size="11">Licht wird an der Grenzfläche zurückgeführt</text></svg>`;
const SATELLITE_SVG = `<svg viewBox="0 0 340 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="170" cy="42" r="15" fill="#ffcc00"/><rect x="128" y="36" width="26" height="12" fill="#58a6ff"/><rect x="186" y="36" width="26" height="12" fill="#58a6ff"/><path d="M55 120 L74 96 L93 120 Z" fill="#c9d1d9"/><path d="M247 120 L266 96 L285 120 Z" fill="#c9d1d9"/><line x1="82" y1="98" x2="158" y2="53" stroke="#00f0ff" stroke-width="3"/><line x1="182" y1="53" x2="258" y2="98" stroke="#00ff66" stroke-width="3"/><text x="104" y="68" fill="#00f0ff" font-size="11">Uplink</text><text x="236" y="68" fill="#00ff66" font-size="11">Downlink</text><text x="170" y="143" text-anchor="middle" fill="#8b949e" font-size="10">großer Signalweg → zusätzliche Laufzeit</text></svg>`;
const NETWORK_SCOPE_SVG = `<svg viewBox="0 0 360 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="8" width="348" height="164" rx="12" fill="#00f0ff" opacity="0.08" stroke="#00f0ff"/><text x="336" y="26" text-anchor="end" fill="#00f0ff" font-size="11">GAN · global</text><rect x="28" y="32" width="304" height="126" rx="10" fill="#58a6ff" opacity="0.09" stroke="#58a6ff"/><text x="314" y="50" text-anchor="end" fill="#58a6ff" font-size="11">WAN · Regionen/Länder</text><rect x="52" y="56" width="256" height="88" rx="9" fill="#ffcc00" opacity="0.09" stroke="#ffcc00"/><text x="290" y="74" text-anchor="end" fill="#ffcc00" font-size="11">MAN · Stadt</text><rect x="78" y="80" width="204" height="52" rx="8" fill="#00ff66" opacity="0.1" stroke="#00ff66"/><text x="264" y="98" text-anchor="end" fill="#00ff66" font-size="11">LAN · Gebäude/Gelände</text><circle cx="130" cy="112" r="14" fill="#c9d1d9"/><text x="130" y="116" text-anchor="middle" fill="#07111f" font-size="9">Person</text><text x="156" y="110" fill="#c9d1d9" font-size="10">BAN · körpernah</text><text x="156" y="124" fill="#c9d1d9" font-size="10">PAN · persönliche Geräte</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Warum diese vier Themen zusammengehören', 'classic', [
    { type: 'text', content: 'Wenn zwei oder mehr Geräte kommunizieren, stellen sich immer dieselben vier Grundfragen: Wer redet mit wem (Kommunikationsart)? In welche Richtung fließen die Daten (Betriebsart)? Wie breitet sich das Signal überhaupt aus (Ausbreitungsart)? Und über welches physische Medium (Übertragungsmedium)?' },
    { type: 'text', content: 'Diese vier Bereiche ergänzen sich und werden deshalb hier gemeinsam behandelt.' },
  ]));

  // --- 1. Kommunikationsarten ---
  exps.push(explanation('kommunikation-classic', '1. Kommunikationsarten', 'classic', [
    { type: 'text', content: 'Die Kommunikationsart beschreibt, WER mit WEM spricht: ein Sender mit einem Empfänger, mit allen, oder mit einer bestimmten Gruppe.' },
    { type: 'list', title: 'Die drei Kommunikationsarten', items: [
      'Unicast: Ein Sender kommuniziert mit genau einem Empfänger (1-zu-1).',
      'Broadcast: Ein Sender sendet an ALLE Geräte im Netzwerk (1-zu-alle).',
      'Multicast: Ein Sender sendet an eine ausgewählte Gruppe von Empfängern (1-zu-Gruppe).',
    ] },
    { type: 'diagram', content: UNICAST_SVG },
    { type: 'diagram', content: BROADCAST_SVG },
    { type: 'diagram', content: MULTICAST_SVG },
    { type: 'text', content: 'Praxisbeispiel: Ein normaler Webseitenaufruf ist Unicast. Eine ARP-Anfrage ("Wer hat diese IP-Adresse?") ist Broadcast. Ein Live-Videostream an mehrere Abonnenten einer Gruppe kann Multicast nutzen.' },
    { type: 'text', content: 'Merksatz: "Uni = einer, Broad = breit/alle, Multi = mehrere - aber gezielt."' },
  ]));

  exps.push(explanation('kommunikation-intuitive', '1. Kommunikationsarten', 'intuitive', [
    { type: 'list', title: 'Alltags-Analogie', items: [
      'Unicast = ein persönlicher Brief an eine Person.',
      'Broadcast = eine Durchsage über den Lautsprecher, die alle hören.',
      'Multicast = eine E-Mail an eine bestimmte Verteilerliste, nicht an alle Mitarbeiter.',
    ] },
  ]));

  // --- 2. Betriebsarten ---
  exps.push(explanation('betrieb-classic', '2. Betriebsarten', 'classic', [
    { type: 'text', content: 'Die Betriebsart beschreibt, in welche RICHTUNG(EN) Daten gleichzeitig übertragen werden können.' },
    { type: 'list', title: 'Die drei Betriebsarten', items: [
      'Simplex: Übertragung nur in eine Richtung (z. B. Radio-Rundfunk).',
      'Halbduplex: Beide Seiten können senden und empfangen, aber nicht gleichzeitig (z. B. Walkie-Talkie).',
      'Vollduplex: Beide Seiten können gleichzeitig senden UND empfangen (z. B. Telefonanruf, moderne Netzwerkkabel).',
    ] },
    { type: 'text', content: 'Praxisbeispiel: Ein Videoanruf, bei dem beide Seiten gleichzeitig sprechen und hören können, ist Vollduplex. Ein klassisches Funkgerät, bei dem man erst die Sprechtaste loslassen muss, ist Halbduplex.' },
    { type: 'text', content: 'Merksatz: "Simplex = eine Einbahnstraße, Halbduplex = abwechselnd, Vollduplex = gleichzeitig in beide Richtungen."' },
  ]));

  exps.push(explanation('betrieb-intuitive', '2. Betriebsarten', 'intuitive', [
    { type: 'list', title: 'Alltags-Analogie', items: [
      'Simplex = ein Fernsehsender, der nur sendet - du kannst nicht zurücksprechen.',
      'Halbduplex = ein Funkgerät: erst reden, dann loslassen, dann hören.',
      'Vollduplex = ein normales Telefongespräch: beide reden und hören gleichzeitig.',
    ] },
  ]));

  exps.push(explanation('netzausdehnung-classic', '3. Netzausdehnung: BAN bis GAN', 'classic', [
    { type: 'text', content: 'Netze lassen sich nach ihrem typischen räumlichen oder organisatorischen Umfang einordnen. Die Kategorien sind Orientierungshilfen für Einsatzbereiche – keine mathematisch festen Kilometergrenzen.' },
    { type: 'diagram', content: NETWORK_SCOPE_SVG },
    { type: 'table', headers: ['Kürzel', 'Bezeichnung', 'Typischer Kontext'], rows: [
      ['BAN', 'Body Area Network', 'Sensoren und Kommunikationsgeräte am oder im Körper einer Person'],
      ['PAN', 'Personal Area Network', 'Persönliche Geräte in unmittelbarer Umgebung, etwa über USB oder Bluetooth'],
      ['LAN', 'Local Area Network', 'Räumlich begrenzter Bereich wie Etage, Gebäude, Gelände oder Organisation'],
      ['MAN', 'Metropolitan Area Network', 'Stadt oder vergleichbar großes urbanes Gebiet'],
      ['WAN', 'Wide Area Network', 'Verbindung von LANs oder MANs über Regionen, Länder oder Kontinente'],
      ['GAN', 'Global Area Network', 'Globale Verbindung mehrerer WANs ohne feste geografische Begrenzung'],
    ] },
    { type: 'text', content: 'BAN bleibt körpernah: Vitalwertsensoren für Blutdruck, Puls, Herzwerte oder Sauerstoffsättigung gehören zu einer Person. PAN verbindet dagegen persönliche Geräte in ihrer unmittelbaren Umgebung – zum Beispiel Smartphone, Bluetooth-Headset oder USB-Gerät.' },
    { type: 'text', content: 'Vom NEXUS-Büro zum Standortverbund wächst der Kontext: Ein Gebäude oder Gelände ist typischerweise LAN, ein stadtweites System MAN und die Verbindung weit entfernter Standorte WAN. GAN beschreibt eine globale Verbindung mehrerer WANs; satellitengestützte Netze wie Inmarsat sind mögliche Beispiele.' },
    { type: 'question', facet: 'scope-scenario', question: 'Mehrere NEXUS-Standorte in verschiedenen Ländern werden miteinander verbunden. Welche Kategorie passt am besten?', options: ['WAN', 'LAN', 'BAN'], correct: 0, explanation: 'Ein WAN verbindet räumlich weit entfernte Netze beziehungsweise Standorte über Regionen oder Länder hinweg.' },
  ]));

  exps.push(explanation('netzausdehnung-intuitive', '3. Netzausdehnung: BAN bis GAN', 'intuitive', [
    { type: 'text', content: 'Denk vom persönlichen Umfeld nach außen: körpernahe Sensoren (BAN), persönliche Geräte (PAN), NEXUS-Gebäude (LAN), Stadtgebiet (MAN), weit entfernte Standorte (WAN), globale Verbindung mehrerer WANs (GAN).' },
  ]));

  exps.push(explanation('internet-intranet-classic', '4. Internet und Intranet', 'classic', [
    { type: 'text', content: 'Das Internet verbindet weltweit viele eigenständige Netzwerke miteinander. Es kann als Global Area Network betrachtet werden, doch nicht jedes GAN ist automatisch das Internet.' },
    { type: 'text', content: 'Ein Intranet ist ein abgegrenztes Informationsnetz für den internen Gebrauch einer Organisation. Das interne NEXUS-Portal kann Webtechnik, Datenbanken, Kommunikation und Schulungsangebote bereitstellen, ohne dadurch eine öffentlich erreichbare Internetseite zu sein.' },
    { type: 'table', headers: ['Bereich', 'Kennzeichen', 'NEXUS-Beispiel'], rows: [
      ['Internet', 'weltweiter öffentlicher Netzwerkverbund', 'öffentlich erreichbare Webseiten'],
      ['Intranet', 'interner Informations- und Netzwerkbereich einer Organisation', 'Mitarbeiterportal nur innerhalb von NEXUS'],
    ] },
    { type: 'question', facet: 'internet-intranet', question: 'Das Mitarbeiterportal ist nur innerhalb von NEXUS erreichbar, läuft aber im Browser. Wie wird es eingeordnet?', options: ['Intranet', 'automatisch Internet', 'Body Area Network'], correct: 0, explanation: 'Browser- und Webtechnik machen ein Angebot nicht automatisch öffentlich. Der abgegrenzte interne Organisationsbereich ist ein Intranet.' },
  ]));

  // --- 3. Ausbreitungsarten ---
  exps.push(explanation('ausbreitung-classic', '5. Signalausbreitung', 'classic', [
    { type: 'text', content: 'Die Ausbreitungsart beschreibt, WIE sich ein Signal im Übertragungsmedium fortbewegt - geführt entlang eines physischen Leiters oder ungeführt (frei) durch den Raum.' },
    { type: 'list', title: 'Die zwei Grund-Ausbreitungsarten', items: [
      'Geführte (leitungsgebundene) Ausbreitung: Das Signal läuft entlang eines physischen Mediums - Kupferkabel (elektrische Signale) oder Glasfaser (Lichtimpulse).',
      'Ungeführte (drahtlose) Ausbreitung: Das Signal breitet sich frei als elektromagnetische Welle im Raum aus - z. B. WLAN, Bluetooth, Mobilfunk.',
    ] },
    { type: 'list', title: 'Eigenschaften, die die Ausbreitung beeinflussen', items: [
      'Dämpfung: Das Signal wird mit zunehmender Entfernung schwächer.',
      'Reflexion/Streuung: Besonders bei Funk können Signale an Wänden reflektiert oder gestreut werden.',
      'Störanfälligkeit: Elektrische Leitungen sind anfälliger für elektromagnetische Störungen als Glasfaser oder abgeschirmte Kabel.',
    ] },
    { type: 'text', content: 'Praxisbeispiel: Ein WLAN-Signal wird schwächer, je weiter man sich vom Router entfernt (Dämpfung), und kann durch dicke Wände zusätzlich abgeschwächt werden.' },
  ]));

  exps.push(explanation('ausbreitung-intuitive', '5. Signalausbreitung', 'intuitive', [
    { type: 'text', content: 'Geführte Ausbreitung ist wie Wasser in einem Schlauch: Es folgt exakt dem vorgegebenen Weg. Ungeführte Ausbreitung ist wie ein Ruf im Raum: Er breitet sich in alle Richtungen aus und wird mit der Entfernung leiser.' },
  ]));

  // --- 4. Übertragungsmedien ---
  exps.push(explanation('medien-classic', '6. Übertragungsmedien', 'classic', [
    { type: 'text', content: 'Ein Übertragungsmedium ist der Weg beziehungsweise Träger, über den Signale vom Sender zum Empfänger gelangen. Leitungsgebundene Medien besitzen einen physischen Übertragungsweg; leitungsungebundene Medien übertragen ohne verlegten Leiter durch den freien Raum.' },
    { type: 'table', headers: ['Medium', 'Kategorie', 'Signalart', 'Typischer Trade-off'], rows: [
      ['Koaxialkabel / Twisted Pair', 'leitungsgebunden, metallisch', 'elektrische Signale', 'günstig und verbreitet, aber abhängig von Schirmung und Störumgebung'],
      ['Glasfaser / LWL', 'leitungsgebunden, nichtmetallisch', 'Lichtimpulse', 'hohes Bandbreitenpotenzial und störfest, aber Installation und Optik verursachen Aufwand'],
      ['Funk / Satellit / Infrarot', 'leitungsungebunden', 'elektromagnetische beziehungsweise optische Wellen', 'flexibel ohne Kabel, aber Reichweite, Laufzeit oder Umgebung können begrenzen'],
    ] },
    { type: 'text', content: 'Praxisbeispiel: Ein Rechenzentrum verbindet Server untereinander meist über Glasfaser (hohe Bandbreite, wenig Störung), während Endgeräte im Büro oft per Kupferkabel oder WLAN angebunden werden.' },
    { type: 'text', content: 'Merksatz: "Kupfer = günstig und elektrisch, Glasfaser = schnell und Licht, Funk = frei aber geteilt."' },
  ]));

  exps.push(explanation('kupfer-classic', '6.1 Koax und Twisted Pair', 'classic', [
    { type: 'text', content: 'Koaxialkabel übertragen elektrische Signale über einen Innenleiter. Isolierung, umgebende Schirmung und Außenmantel liegen konzentrisch auf derselben Achse. Die Schirmung reduziert äußere elektromagnetische Störeinflüsse; typische Anwendungen sind Antennen-/TV-Verkabelung und Internet über Fernsehkabel.' },
    { type: 'diagram', content: COAX_SVG },
    { type: 'text', content: 'Twisted Pair besteht aus miteinander verdrillten Adernpaaren. Die Verdrillung selbst reduziert Störeinflüsse und gegenseitige Beeinflussung – sie ist nicht dasselbe wie eine zusätzliche Schirmung.' },
    { type: 'table', headers: ['Variante', 'Gemeinsamkeit', 'Unterschied / Einsatz'], rows: [
      ['UTP – Unshielded Twisted Pair', 'verdrillte Adernpaare', 'keine zusätzliche entsprechende Schirmung; häufige Ethernet-LAN-Verkabelung'],
      ['geschirmte Varianten / STP', 'verdrillte Adernpaare', 'zusätzliche Schirmung für erhöhte Störfestigkeit; mehr Installationsaufwand'],
    ] },
    { type: 'text', content: 'Schirmungsbezeichnungen folgen dem Muster AA/B TP: Vor dem Schrägstrich steht die äußere Gesamtschirmung, danach die Schirmung der Adernpaare. U bedeutet ungeschirmt, F Folienschirm, S Geflechtschirm und SF eine Kombination. S/UTP besitzt damit einen äußeren Geflechtschirm und ungeschirmte Adernpaare.' },
    { type: 'question', facet: 'utp-stp', question: 'Was unterscheidet UTP und geschirmte Twisted-Pair-Varianten grundlegend?', options: ['Beide nutzen verdrillte Adernpaare; geschirmte Varianten besitzen zusätzliche Schirmung.', 'Nur geschirmte Varianten besitzen verdrillte Adernpaare.', 'UTP überträgt Licht, geschirmte Varianten übertragen Strom.'], correct: 0, explanation: 'Verdrillung und Schirmung sind getrennte Maßnahmen. Beide Varianten sind Twisted Pair; zusätzliche Schirmung erhöht die Störfestigkeit, aber auch den Aufwand.' },
  ]));

  exps.push(explanation('glasfaser-classic', '6.2 Glasfaser / LWL', 'classic', [
    { type: 'text', content: 'Glasfaser beziehungsweise Lichtwellenleiter (LWL) sind leitungsgebunden, aber nicht metallisch. Lichtimpulse laufen im Kern (Core); der umgebende Mantel (Cladding) führt das Licht durch Totalreflexion an der Grenzfläche zurück.' },
    { type: 'diagram', content: FIBER_SVG },
    { type: 'table', headers: ['Faserart', 'Prinzip', 'Typischer Einsatz'], rows: [
      ['Singlemode / Monomode', 'kleiner Kern, ein dominanter Ausbreitungsmodus', 'besonders für große Entfernungen'],
      ['Multimode', 'größerer Kern, mehrere Ausbreitungswege beziehungsweise Moden', 'eher kürzere Strecken, häufig günstigere Optik'],
    ] },
    { type: 'text', content: 'Singlemode und Multimode sind keine starre Gut-/Schlecht-Rangliste. Entfernung, Leistungsbedarf, vorhandene Optik und Kosten bestimmen die Auswahl; konkrete Kilometer- oder Datenraten sind technikabhängige Beispielwerte.' },
    { type: 'question', facet: 'fiber-mode', question: 'Welche Faserart ist grundsätzlich stärker auf große Entfernungen ausgerichtet?', options: ['Singlemode / Monomode', 'Multimode', 'Koaxialkabel'], correct: 0, explanation: 'Singlemode führt Licht in einem kleinen Kern mit einem dominanten Modus und ist deshalb grundsätzlich für größere Entfernungen ausgelegt.' },
  ]));

  exps.push(explanation('drahtlos-classic', '6.3 Funk, Satellit und Infrarot', 'classic', [
    { type: 'text', content: 'Leitungsungebundene Übertragung benötigt keinen verlegten Leiter zwischen Sender und Empfänger. Funk nutzt elektromagnetische Wellen; Beispiele sind WLAN, Bluetooth, Mobilfunk, HF-Funk und Richtfunk.' },
    { type: 'text', content: 'Bei Satellitenkommunikation sendet eine Bodenstation per Uplink zum Satelliten. Dieser wirkt vereinfacht als Relais und überträgt per Downlink zur Empfangsstation. Der große Signalweg verursacht typischerweise zusätzliche Laufzeit.' },
    { type: 'diagram', content: SATELLITE_SVG },
    { type: 'text', content: 'Infrarot ist drahtlose optische Übertragung über kurze Distanz und häufig als Punkt-zu-Punkt-Verbindung ausgeführt. Eine Fernbedienung ist das bekannteste Beispiel.' },
    { type: 'question', facet: 'wireless', question: 'Warum besitzt eine Satellitenverbindung typischerweise mehr Laufzeit als eine kurze lokale Kabelverbindung?', options: ['Das Signal legt über Uplink und Downlink einen sehr großen Weg zurück.', 'Satelliten übertragen grundsätzlich nur einmal pro Minute.', 'Infrarot blockiert den Downlink.'], correct: 0, explanation: 'Der lange Weg von der Bodenstation zum Satelliten und zurück verlängert die Signallaufzeit.' },
  ]));

  exps.push(explanation('medien-intuitive', '6. Übertragungsmedien', 'intuitive', [
    { type: 'list', title: 'Eselsbrücken', items: [
      'Kupfer → elektrische Signale → wie eine klassische Stromleitung.',
      'Glasfaser → Licht → wie ein Lichtstrahl, der durch ein Glasrohr geschickt wird.',
      'Funk → Wellen → wie ein Radiosignal, das sich frei im Raum ausbreitet.',
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Kommunikationsarten: Unicast (1-zu-1), Broadcast (1-zu-alle), Multicast (1-zu-Gruppe).',
      'Betriebsarten: Simplex (eine Richtung), Halbduplex (abwechselnd), Vollduplex (gleichzeitig beide Richtungen).',
      'Netzausdehnung: BAN/PAN (persönlich), LAN (lokal), MAN (Stadt), WAN (weite Entfernungen), GAN (global).',
      'Internet verbindet Netzwerke weltweit; ein Intranet ist ein interner Organisationsbereich.',
      'Signalausbreitung: geführt (leitungsgebunden, z. B. Kupfer/Glasfaser) oder ungeführt (drahtlos, z. B. Funk).',
      'Übertragungsmedien: Koax/Twisted Pair (elektrisch), Glasfaser/LWL (optisch), Funk/Satellit/Infrarot (leitungsungebunden).',
      'Die passende Medienwahl hängt von Entfernung, Störumgebung, Leistungsbedarf, Kosten, Flexibilität und Einsatzgebiet ab.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'kommunikationsarten-matching',
      type: 'matching',
      question: 'Ordne jedes Beispiel der passenden Kommunikationsart zu.',
      pairs: [
        { left: 'Normaler Webseitenaufruf', leftLabel: 'Normaler Webseitenaufruf', right: 'Unicast' },
        { left: 'ARP-Anfrage an alle Geräte im Subnetz', leftLabel: 'ARP-Anfrage an alle Geräte im Subnetz', right: 'Broadcast' },
        { left: 'Live-Stream an eine Abonnentengruppe', leftLabel: 'Live-Stream an eine Abonnentengruppe', right: 'Multicast' },
      ],
      explanation: 'Ein Webseitenaufruf ist 1-zu-1 (Unicast), eine ARP-Anfrage geht an alle (Broadcast), und ein gruppenweiter Stream ist Multicast.',
    },
    {
      id: 'betriebsarten-ordering',
      type: 'select-best',
      question: 'Ein klassisches Walkie-Talkie, bei dem man erst die Sprechtaste loslassen muss, um den anderen zu hören, ist ein Beispiel für...',
      options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Multiplex'],
      correct: 1,
      explanation: 'Bei Halbduplex können beide Seiten senden und empfangen, aber nicht gleichzeitig - genau wie beim Walkie-Talkie.',
    },
    {
      id: 'medien-matching',
      type: 'matching',
      question: 'Ordne jedes Übertragungsmedium der passenden Signalart zu.',
      pairs: [
        { left: 'Kupferkabel', leftLabel: 'Kupferkabel', right: 'Elektrische Signale' },
        { left: 'Glasfaser', leftLabel: 'Glasfaser', right: 'Lichtimpulse' },
        { left: 'WLAN', leftLabel: 'WLAN', right: 'Elektromagnetische Wellen' },
      ],
      explanation: 'Kupfer überträgt elektrisch, Glasfaser über Licht, Funk über elektromagnetische Wellen im Raum.',
    },
    {
      id: 'ausbreitung-input',
      type: 'input',
      question: 'Wie nennt man die Ausbreitungsart, bei der ein Signal frei durch den Raum läuft, ohne an ein physisches Kabel gebunden zu sein? (ein Wort)',
      answers: ['ungeführt', 'ungefuehrt', 'drahtlos'],
      explanation: 'Man spricht von "ungeführter" (oder drahtloser) Ausbreitung, im Gegensatz zur geführten Ausbreitung entlang eines Kabels.',
    },
    {
      id: 'network-scope-acronyms',
      type: 'matching',
      question: 'Ordne die Kürzel ihren ausgeschriebenen Bezeichnungen zu.',
      pairs: [
        { left: 'BAN', leftLabel: 'BAN', right: 'Body Area Network' },
        { left: 'PAN', leftLabel: 'PAN', right: 'Personal Area Network' },
        { left: 'LAN', leftLabel: 'LAN', right: 'Local Area Network' },
        { left: 'MAN', leftLabel: 'MAN', right: 'Metropolitan Area Network' },
        { left: 'WAN', leftLabel: 'WAN', right: 'Wide Area Network' },
        { left: 'GAN', leftLabel: 'GAN', right: 'Global Area Network' },
      ],
      explanation: 'Die Kürzel benennen typische Netzkontexte von körpernah bis global.',
    },
    {
      id: 'network-scope-scenarios',
      type: 'matching',
      question: 'Ordne die NEXUS-Situationen der passenden Netzkategorie zu.',
      pairs: [
        { left: 'Vitalwertsensoren am Körper', leftLabel: 'Vitalwertsensoren am Körper', right: 'BAN' },
        { left: 'Smartphone und Bluetooth-Headset', leftLabel: 'Smartphone und Bluetooth-Headset', right: 'PAN' },
        { left: 'Arbeitsplätze im NEXUS-Hauptgebäude', leftLabel: 'Arbeitsplätze im NEXUS-Hauptgebäude', right: 'LAN' },
        { left: 'Stadtweites Verkehrsleitsystem', leftLabel: 'Stadtweites Verkehrsleitsystem', right: 'MAN' },
        { left: 'Standorte in verschiedenen Ländern', leftLabel: 'Standorte in verschiedenen Ländern', right: 'WAN' },
      ],
      explanation: 'Entscheidend ist der typische räumliche beziehungsweise organisatorische Kontext, nicht eine starre Kilometergrenze.',
    },
    {
      id: 'internet-intranet-scenario',
      type: 'select-best',
      question: 'Ein NEXUS-Portal läuft im Browser, ist aber ausschließlich für Mitarbeiter im internen Organisationsnetz erreichbar. Was ist es?',
      options: ['Intranet', 'automatisch öffentliches Internet', 'GAN, weil ein Browser verwendet wird'],
      correct: 0,
      explanation: 'Ein Intranet ist ein interner Informations- und Netzwerkbereich. Die verwendete Webtechnik macht ihn nicht automatisch öffentlich.',
    },
    {
      id: 'media-category-matching',
      type: 'matching',
      question: 'Ordne die Medien ihrer grundlegenden Kategorie zu.',
      pairs: [
        { left: 'Koaxialkabel', leftLabel: 'Koaxialkabel', right: 'leitungsgebunden / elektrisch' },
        { left: 'Twisted Pair', leftLabel: 'Twisted Pair', right: 'leitungsgebunden / elektrisch' },
        { left: 'Glasfaser', leftLabel: 'Glasfaser', right: 'leitungsgebunden / optisch' },
        { left: 'Funk', leftLabel: 'Funk', right: 'leitungsungebunden' },
        { left: 'Satellit', leftLabel: 'Satellit', right: 'leitungsungebunden' },
        { left: 'Infrarot', leftLabel: 'Infrarot', right: 'leitungsungebunden / optisch' },
      ],
      explanation: 'Leitungsgebunden bedeutet nicht automatisch metallisch: Glasfaser führt Licht in einem physischen Leiter.',
    },
    {
      id: 'shielding-notation',
      type: 'select-best',
      question: 'Wie ist S/UTP zu lesen?',
      options: ['äußerer Geflechtschirm und ungeschirmte Adernpaare', 'keine Gesamtschirmung und jedes Adernpaar foliengeschirmt', 'Glasfaserkern mit Kupferschirm'],
      correct: 0,
      explanation: 'Vor dem Schrägstrich steht die Gesamtschirmung: S = Geflechtschirm. UTP danach bezeichnet ungeschirmte verdrillte Adernpaare.',
    },
    {
      id: 'fiber-mode-matching',
      type: 'matching',
      question: 'Ordne die Faserart ihrer grundlegenden Einsatzrichtung zu.',
      pairs: [
        { left: 'Singlemode / Monomode', leftLabel: 'Singlemode / Monomode', right: 'kleiner Kern, besonders für lange Strecken' },
        { left: 'Multimode', leftLabel: 'Multimode', right: 'größerer Kern, eher kürzere Strecken' },
      ],
      explanation: 'Die konkrete Reichweite hängt von Technik und Optik ab; entscheidend ist hier das grundlegende Modenprinzip.',
    },
    {
      id: 'nexus-medium-selection',
      type: 'select-best',
      question: 'NEXUS verbindet zwei weit entfernte Gebäudeteile mit hohem Leistungsbedarf durch eine elektromagnetisch belastete Umgebung. Welches Medium ist grundsätzlich naheliegend?',
      options: ['Glasfaser', 'ungeschirmtes Twisted Pair unabhängig von der Strecke', 'Infrarot-Fernbedienung'],
      correct: 0,
      explanation: 'Glasfaser bietet hohes Bandbreitenpotenzial über größere Entfernungen und ist unempfindlich gegenüber elektromagnetischen Störungen. Die konkrete Planung prüft zusätzlich Kosten und Installation.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Wie nennt man die Kommunikation von einem Sender zu genau einem Empfänger?', options: ['Broadcast', 'Multicast', 'Unicast', 'Anycast'], correct: 2, explanation: 'Unicast ist die 1-zu-1-Kommunikation.' },
    { question: 'Wie nennt man die Kommunikation von einem Sender an alle Geräte im Netzwerk?', options: ['Unicast', 'Broadcast', 'Multicast', 'Simplex'], correct: 1, explanation: 'Broadcast sendet an alle Teilnehmer im Netzwerksegment.' },
    { question: 'Wie nennt man die Kommunikation an eine ausgewählte Gruppe von Empfängern?', options: ['Unicast', 'Broadcast', 'Multicast', 'Vollduplex'], correct: 2, explanation: 'Multicast adressiert gezielt eine Gruppe, nicht alle und nicht nur einen.' },
    { question: 'Welche Betriebsart erlaubt Übertragung nur in eine Richtung?', options: ['Vollduplex', 'Halbduplex', 'Simplex', 'Multicast'], correct: 2, explanation: 'Simplex erlaubt nur eine Übertragungsrichtung, z. B. klassischer Rundfunk.' },
    { question: 'Welche Betriebsart erlaubt gleichzeitiges Senden und Empfangen auf beiden Seiten?', options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Broadcast'], correct: 2, explanation: 'Vollduplex erlaubt gleichzeitige Kommunikation in beide Richtungen, wie bei einem Telefonanruf.' },
    { question: 'Ein Funkgerät, bei dem abwechselnd gesprochen werden muss, ist ein Beispiel für...', options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Multicast'], correct: 1, explanation: 'Halbduplex: beide Richtungen möglich, aber nicht gleichzeitig.' },
    { question: 'Wie nennt man die Ausbreitung eines Signals entlang eines physischen Kabels?', options: ['Ungeführt', 'Geführt', 'Simplex', 'Multicast'], correct: 1, explanation: 'Geführte (leitungsgebundene) Ausbreitung folgt einem physischen Medium wie Kupfer oder Glasfaser.' },
    { question: 'Wie nennt man die Ausbreitung eines Signals frei im Raum, z. B. bei WLAN?', options: ['Geführt', 'Ungeführt', 'Vollduplex', 'Unicast'], correct: 1, explanation: 'Ungeführte (drahtlose) Ausbreitung verläuft ohne physisches Leitmedium durch den Raum.' },
    { question: 'Welches Übertragungsmedium nutzt Lichtimpulse zur Datenübertragung?', options: ['Kupferkabel', 'Glasfaser', 'WLAN', 'Bluetooth'], correct: 1, explanation: 'Glasfaser übertragt Daten als Lichtimpulse.' },
    { question: 'Welches Übertragungsmedium ist am störanfälligsten gegenüber elektromagnetischen Feldern?', options: ['Glasfaser', 'Kupferkabel', 'Beide gleich stark', 'Keines von beiden'], correct: 1, explanation: 'Kupferkabel übertragen elektrische Signale und sind dadurch anfälliger für elektromagnetische Störungen als Glasfaser.' },
    { question: 'Welches Übertragungsmedium benötigt keine physische Verkabelung zwischen Sender und Empfänger?', options: ['Kupferkabel', 'Glasfaser', 'Funk', 'Koaxialkabel'], correct: 2, explanation: 'Funk überträgt Signale drahtlos als elektromagnetische Wellen.' },
    { question: 'Ein Administrator plant eine Verbindung zwischen zwei Serverräumen über mehrere hundert Meter mit maximaler Bandbreite und Störunanfälligkeit. Welches Medium ist am besten geeignet?', options: ['Kupferkabel', 'Glasfaser', 'WLAN', 'Bluetooth'], correct: 1, explanation: 'Glasfaser bietet hohe Bandbreite über große Distanzen und ist gegen elektromagnetische Störungen unempfindlich.' },
    { facet: 'acronym', question: 'Wofür steht BAN?', options: ['Body Area Network', 'Building Access Network', 'Broad Area Network'], correct: 0, explanation: 'BAN steht für Body Area Network und beschreibt körpernahe Geräte oder Sensoren einer Person.' },
    { facet: 'ban-pan', question: 'Ein Patient trägt Sensoren für Puls und Sauerstoffsättigung direkt am Körper. Welche Kategorie passt?', options: ['BAN', 'PAN', 'LAN'], correct: 0, explanation: 'Körpernahe medizinische Sensorik gehört zum Body Area Network. Ein PAN verbindet dagegen persönliche Geräte in unmittelbarer Umgebung.' },
    { facet: 'scope-scenario', question: 'Alle Arbeitsplätze in einem NEXUS-Gebäude nutzen gemeinsame Ressourcen. Welche Kategorie passt typischerweise?', options: ['LAN', 'MAN', 'WAN'], correct: 0, explanation: 'Ein räumlich begrenztes Gebäude- oder Geländenetz ist typischerweise ein Local Area Network.' },
    { facet: 'scope-compare', question: 'Was unterscheidet MAN und WAN am besten?', options: ['MAN beschreibt typischerweise ein Stadtgebiet, WAN verbindet Netze über große geografische Entfernungen.', 'MAN ist immer drahtlos, WAN immer kabelgebunden.', 'WAN besteht nur aus einzelnen Computern und verbindet keine Netze.'], correct: 0, explanation: 'MAN ordnet man einem urbanen Gebiet zu; WAN verbindet LANs oder MANs über Regionen, Länder oder Kontinente.' },
    { facet: 'wan-gan', question: 'Welche Aussage zu GAN und Internet ist korrekt?', options: ['Das Internet kann als GAN betrachtet werden, aber nicht jedes GAN ist automatisch das Internet.', 'Jedes GAN ist definitionsgemäß das öffentliche Internet.', 'Ein GAN darf keine WANs miteinander verbinden.'], correct: 0, explanation: 'GAN bezeichnet einen globalen Netzverbund. Das Internet ist ein Beispiel, aber nicht die einzig mögliche globale Netzstruktur.' },
    { facet: 'internet-intranet', question: 'Welche Aussage beschreibt ein Intranet?', options: ['Ein interner Informations- und Netzwerkbereich einer Organisation', 'Das Internet ohne aktive Verbindung', 'Jede weltweit öffentlich erreichbare Webseite'], correct: 0, explanation: 'Ein Intranet stellt interne Informationen und Dienste für eine abgegrenzte Organisation bereit.' },
    { facet: 'misconception', question: 'Ein LAN muss zwingend auf einen einzelnen Raum begrenzt sein. Stimmt das?', options: ['Nein, es kann beispielsweise eine Etage, ein Gebäude oder ein Gelände umfassen.', 'Ja, mehrere Räume ergeben automatisch ein MAN.', 'Ja, sonst ist es immer ein WAN.'], correct: 0, explanation: 'LAN beschreibt einen räumlich begrenzten lokalen Bereich, aber keine starre Ein-Raum-Grenze.' },
    { facet: 'transfer', question: 'NEXUS verbindet sein Hauptgebäude mit einem weit entfernten Standort in einem anderen Land. Was wird dabei typischerweise aufgebaut?', options: ['Eine WAN-Verbindung zwischen lokalen Netzen', 'Ein einziges BAN', 'Nur ein größeres PAN'], correct: 0, explanation: 'Ein WAN verbindet räumlich weit entfernte Netze beziehungsweise Standorte.' },
    { facet: 'guided-unguided', question: 'Welche Aussage ist korrekt?', options: ['Glasfaser ist leitungsgebunden und überträgt optisch.', 'Leitungsgebunden bedeutet immer Kupfer.', 'Infrarot benötigt einen metallischen Leiter.'], correct: 0, explanation: 'Glasfaser besitzt einen physischen Lichtwellenleiter, nutzt aber keine metallische elektrische Übertragung.' },
    { facet: 'coax', question: 'Welche Aufgabe hat die umgebende Schirmung eines Koaxialkabels?', options: ['Sie reduziert äußere elektromagnetische Störeinflüsse.', 'Sie wandelt elektrische Signale in Licht um.', 'Sie ersetzt den Innenleiter vollständig.'], correct: 0, explanation: 'Die konzentrische Schirmung schützt den elektrischen Innenleiter vor äußeren Störeinflüssen.' },
    { facet: 'utp-stp', question: 'Welche Aussage zu UTP ist richtig?', options: ['Auch UTP nutzt verdrillte Adernpaare zur Verringerung von Störeinflüssen.', 'UTP besitzt weder Verdrillung noch andere Maßnahmen gegen Störungen.', 'UTP ist eine Glasfaservariante.'], correct: 0, explanation: 'UTP ist ungeschirmtes Twisted Pair. Die Verdrillung bleibt als eigene Maßnahme gegen Störeinflüsse erhalten.' },
    { facet: 'shielding', question: 'Wofür steht der Teil vor dem Schrägstrich bei S/UTP?', options: ['für die äußere Gesamtschirmung', 'für die Länge des Kabels', 'für den Glasfaserkern'], correct: 0, explanation: 'S bezeichnet hier einen äußeren Geflechtschirm; UTP danach beschreibt die ungeschirmten Adernpaare.' },
    { facet: 'fiber', question: 'Welche Aufgabe haben Core und Cladding bei einem Lichtwellenleiter?', options: ['Licht läuft im Core und wird an der Grenzfläche zum Cladding zurückgeführt.', 'Beide transportieren elektrische Signale.', 'Das Cladding ist eine Funkantenne.'], correct: 0, explanation: 'Der Core führt die Lichtimpulse; das Cladding unterstützt die Führung durch Totalreflexion.' },
    { facet: 'fiber-mode', question: 'Was unterscheidet Singlemode und Multimode grundlegend?', options: ['Kern und Anzahl der Ausbreitungsmoden; Singlemode ist besonders für lange Strecken ausgerichtet.', 'Nur die Farbe des Außenmantels.', 'Singlemode ist Funk, Multimode ist Kupfer.'], correct: 0, explanation: 'Singlemode nutzt einen kleineren Kern mit dominantem Modus; Multimode einen größeren Kern mit mehreren Moden.' },
    { facet: 'satellite', question: 'Welche Reihenfolge beschreibt Satellitenkommunikation vereinfacht?', options: ['Bodenstation → Uplink → Satellit → Downlink → Empfangsstation', 'Satellit → Kupferkabel → Infrarot → Bodenstation', 'Empfangsstation → Glasfaser-Core → Satellit'], correct: 0, explanation: 'Der Satellit fungiert zwischen Uplink und Downlink vereinfacht als Relais.' },
    { facet: 'misconception-media', question: 'STP ist für jede Umgebung automatisch besser als UTP. Stimmt das?', options: ['Nein, zusätzliche Schirmung erhöht Störfestigkeit, aber auch Installationsaufwand und muss zur Anforderung passen.', 'Ja, Schirmung hat niemals Nachteile oder Anforderungen.', 'Ja, weil UTP keine verdrillten Adern besitzt.'], correct: 0, explanation: 'Medienwahl ist ein Trade-off. Schirmung kann sinnvoll sein, ist aber kein pauschales Qualitätsurteil für jede Situation.' },
    { facet: 'scenario-selection', question: 'Ein mobiles NEXUS-Gerät benötigt Kommunikation ohne verlegtes Kabel. Welche Grundkategorie passt?', options: ['leitungsungebundene Übertragung, beispielsweise Funk', 'ausschließlich Koaxialkabel', 'nur Singlemode-Glasfaser'], correct: 0, explanation: 'Funk ermöglicht flexible Kommunikation ohne physischen Leiter zwischen Sender und Empfänger.' },
  ];
}

function buildSummary() {
  return [
    'Kommunikationsarten: Unicast (1-zu-1), Broadcast (1-zu-alle), Multicast (1-zu-Gruppe).',
    'Betriebsarten: Simplex, Halbduplex, Vollduplex - abhängig von der möglichen Übertragungsrichtung.',
    'Netzausdehnung: BAN, PAN, LAN, MAN, WAN und GAN beschreiben typische Kontexte von körpernah bis global.',
    'Internet ist ein weltweiter Netzwerkverbund; Intranet bezeichnet einen internen Organisationsbereich.',
    'Signalausbreitung: geführt (Kabel) vs. ungeführt (drahtlos/Funk).',
    'Übertragungsmedien: Koax/Twisted Pair (elektrisch), Glasfaser/LWL (optisch), Funk/Satellit/Infrarot (leitungsungebunden).',
    'Die passende Wahl hängt von Entfernung, Störumgebung, Leistungsbedarf, Kosten, Flexibilität und Einsatzgebiet ab.',
  ];
}

export function buildKommunikationUebertragungLesson() {
  return {
    title: 'Kommunikations- und Übertragungsarten',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}
