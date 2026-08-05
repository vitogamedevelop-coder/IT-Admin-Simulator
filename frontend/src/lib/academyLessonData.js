import { topicKey } from './academyTopics.js';
import { buildOsiLesson, OSI_TOPIC_KEY } from './academyLessons/osi.js';
import { buildTcpIpLesson, TCP_IP_TOPIC_KEY } from './academyLessons/tcpIp.js';
import { buildBinarySystemLesson, BINARY_SYSTEM_TOPIC_KEY } from './academyLessons/binarySystem.js';
import { buildIpv4Lesson, IPV4_TOPIC_KEY } from './academyLessons/ipv4.js';
import { buildSubnetMasksLesson, SUBNET_MASKS_TOPIC_KEY } from './academyLessons/subnetMasks.js';
import { buildSubnettingLesson, SUBNETTING_TOPIC_KEY } from './academyLessons/subnetting.js';
import { buildVlsmLesson, VLSM_TOPIC_KEY } from './academyLessons/vlsm.js';
import { buildSupernettingLesson, SUPERNETTING_TOPIC_KEY } from './academyLessons/supernetting.js';
import { buildTcpUdpLesson, TCP_UDP_TOPIC_KEY } from './academyLessons/tcpUdp.js';
import { buildKommunikationUebertragungLesson, KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY } from './academyLessons/kommunikationUebertragung.js';
import { buildCiscoGrundlagenLesson, CISCO_GRUNDLAGEN_TOPIC_KEY } from './academyLessons/ciscoGrundlagen.js';
import { buildDnsLesson, DNS_TOPIC_KEY } from './academyLessons/dns.js';
import { buildDhcpLesson, DHCP_TOPIC_KEY } from './academyLessons/dhcp.js';
import { buildRoutingLesson, ROUTING_TOPIC_KEY } from './academyLessons/routing.js';
import { buildSwitchingLesson, SWITCHING_TOPIC_KEY } from './academyLessons/switching.js';
import { buildVlanBasicsLesson, VLAN_BASICS_TOPIC_KEY } from './academyLessons/vlanBasics.js';
import { buildCiscoGrundkonfigurationLesson, CISCO_GRUNDKONFIGURATION_TOPIC_KEY } from './academyLessons/ciscoGrundkonfiguration.js';

// Simple inline SVG diagrams for the five network topologies.
const diagramSvg = {
  bus: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="55" width="180" height="10" rx="2" fill="#00f0ff" opacity="0.85"/><circle cx="40" cy="40" r="8" fill="#c9d1d9"/><circle cx="100" cy="40" r="8" fill="#c9d1d9"/><circle cx="160" cy="40" r="8" fill="#c9d1d9"/><line x1="40" y1="48" x2="40" y2="55" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="48" x2="100" y2="55" stroke="#8b949e" stroke-width="2"/><line x1="160" y1="48" x2="160" y2="55" stroke="#8b949e" stroke-width="2"/><circle cx="40" cy="80" r="8" fill="#c9d1d9"/><circle cx="100" cy="80" r="8" fill="#c9d1d9"/><circle cx="160" cy="80" r="8" fill="#c9d1d9"/><line x1="40" y1="65" x2="40" y2="72" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="65" x2="100" y2="72" stroke="#8b949e" stroke-width="2"/><line x1="160" y1="65" x2="160" y2="72" stroke="#8b949e" stroke-width="2"/></svg>`,
  ring: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="60" rx="80" ry="45" fill="none" stroke="#00f0ff" stroke-width="3" opacity="0.85"/><circle cx="100" cy="15" r="8" fill="#c9d1d9"/><circle cx="172" cy="60" r="8" fill="#c9d1d9"/><circle cx="100" cy="105" r="8" fill="#c9d1d9"/><circle cx="28" cy="60" r="8" fill="#c9d1d9"/><circle cx="145" cy="32" r="8" fill="#c9d1d9"/><circle cx="145" cy="88" r="8" fill="#c9d1d9"/><circle cx="55" cy="88" r="8" fill="#c9d1d9"/><circle cx="55" cy="32" r="8" fill="#c9d1d9"/></svg>`,
  star: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="60" r="10" fill="#00f0ff"/><circle cx="100" cy="20" r="7" fill="#c9d1d9"/><circle cx="145" cy="40" r="7" fill="#c9d1d9"/><circle cx="145" cy="80" r="7" fill="#c9d1d9"/><circle cx="100" cy="100" r="7" fill="#c9d1d9"/><circle cx="55" cy="80" r="7" fill="#c9d1d9"/><circle cx="55" cy="40" r="7" fill="#c9d1d9"/><line x1="100" y1="60" x2="100" y2="27" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="145" y2="40" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="145" y2="80" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="100" y2="93" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="55" y2="80" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="55" y2="40" stroke="#8b949e" stroke-width="2"/></svg>`,
  tree: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="20" r="8" fill="#00f0ff"/><line x1="100" y1="28" x2="60" y2="55" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="28" x2="140" y2="55" stroke="#8b949e" stroke-width="2"/><circle cx="60" cy="55" r="7" fill="#c9d1d9"/><circle cx="140" cy="55" r="7" fill="#c9d1d9"/><line x1="60" y1="62" x2="40" y2="90" stroke="#8b949e" stroke-width="2"/><line x1="60" y1="62" x2="80" y2="90" stroke="#8b949e" stroke-width="2"/><line x1="140" y1="62" x2="120" y2="90" stroke="#8b949e" stroke-width="2"/><line x1="140" y1="62" x2="160" y2="90" stroke="#8b949e" stroke-width="2"/><circle cx="40" cy="90" r="6" fill="#c9d1d9"/><circle cx="80" cy="90" r="6" fill="#c9d1d9"/><circle cx="120" cy="90" r="6" fill="#c9d1d9"/><circle cx="160" cy="90" r="6" fill="#c9d1d9"/></svg>`,
  mesh: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="35" r="8" fill="#c9d1d9"/><circle cx="140" cy="35" r="8" fill="#c9d1d9"/><circle cx="40" cy="85" r="8" fill="#c9d1d9"/><circle cx="100" cy="85" r="8" fill="#c9d1d9"/><circle cx="160" cy="85" r="8" fill="#c9d1d9"/><line x1="60" y1="35" x2="140" y2="35" stroke="#8b949e" stroke-width="2"/><line x1="60" y1="35" x2="40" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="60" y1="35" x2="100" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="140" y1="35" x2="100" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="140" y1="35" x2="160" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="40" y1="85" x2="100" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="85" x2="160" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="40" y1="85" x2="160" y2="85" stroke="#8b949e" stroke-width="2" opacity="0.4"/><line x1="60" y1="35" x2="160" y2="85" stroke="#8b949e" stroke-width="2" opacity="0.4"/><line x1="140" y1="35" x2="40" y2="85" stroke="#8b949e" stroke-width="2" opacity="0.4"/></svg>`,
};

const topologies = {
  bus: {
    name: 'Bus',
    tagline: 'Alle Geräte hängen an einem einzigen Kabelstrang.',
    description: 'Bei einer Bus-Topologie sind alle Geräte an ein gemeinsames Übertragungsmedium angeschlossen. Daten werden als Signal an alle Teilnehmer gesendet; jeder prüft, ob die Nachricht für ihn bestimmt ist.',
    advantages: ['Einfach und kostengünstig bei wenigen Geräten', 'Leicht zu erweitern, solange das Kabel noch Reichweite bietet', 'Geringer Kabelaufwand in kleinen Netzen'],
    disadvantages: ['Ein Kabelbruch legt das gesamte Netz lahm', 'Kollisionen nehmen mit mehr Geräten stark zu', 'Schwer zu diagnostizieren, wenn das Backbone defekt ist'],
    useCases: ['Historisch in klassischen Ethernet-Netzen mit Koaxialkabel (10BASE2, 10BASE5)', 'Kleine Laboraufbauten', 'Einfache I2C-/Sensornetzwerke in der Elektronik'],
    resilience: 'Niedrig: ein einzelner Fehler im Backbone unterbricht die Kommunikation für alle.',
    cost: 'Sehr günstig bei wenigen Teilnehmern, aber Terminatoren und exakte Kabellängen sind wichtig.',
    scalability: 'Schlecht: ab etwa 20-30 aktiven Geräten steigen Kollisionen und die Leistung sinkt.',
    example: 'Ein altes Büronetzwerk aus den 1990ern, bei dem alle PCs an einem Koaxialkabel hängen.',
    questions: [
      { question: 'Was passiert in einer reinen Bus-Topologie, wenn das Hauptkabel durchtrennt wird?', options: ['Das Netz bleibt funktionsfähig.', 'Alle Geräte verlieren die Verbindung.', 'Nur die angeschlossenen Endgeräte sind betroffen.'], correct: 1, explanation: 'Der Bus bildet ein gemeinsames Medium. Ein Bruch unterbricht die Kommunikation für alle Teilnehmer.' },
      { question: 'Warum skaliert der Bus bei vielen Geräten schlecht?', options: ['Weil er zu viele Kabel braucht', 'Weil Kollisionen zunehmen und die effektive Datenrate sinkt', 'Weil die Spannung zu hoch wird'], correct: 1, explanation: 'Je mehr Geräte senden, desto häufiger treten Kollisionen auf - das Netz muss wiederholt auf das Medium warten.' },
    ],
    mnemonic: 'Bus = Backbone: Ein einziger Weg, der bei einem Bruch allen den Weg versperrt.',
  },
  ring: {
    name: 'Ring',
    tagline: 'Jedes Gerät ist mit genau zwei Nachbarn verbunden und bildet einen Kreis.',
    description: 'In einer Ring-Topologie ist jedes Gerät mit genau zwei anderen verbunden. Daten laufen in eine Richtung (oder in beiden bei Dual Ring) um den Kreis, bis sie das Ziel erreichen. Token-Passing regelt, wer gerade senden darf.',
    advantages: ['Keine Kollisionen dank Token-Passing', 'Vorhersagbare Laufzeit pro Station', 'Gleichberechtigter Zugriff für alle Teilnehmer'],
    disadvantages: ['Ein Ausfall einer Station oder Leitung unterbricht den Ring', 'Jede Station muss jedes Paket weiterleiten', 'Hinzufügen/Entfernen von Geräten erfordert kurzzeitig den Ring aufzubrechen'],
    useCases: ['Token Ring-Netze (IEEE 802.5)', 'FDDI als Glasfaser-Ring für Backbone-Verbindungen', 'Einige industrielle Netze mit Redundanzprotokollen'],
    resilience: 'Mittel bis niedrig: ein Single-Ring fällt bei einem Fehler aus. Dual Ring oder Redundanzprotokolle wie RSTP können helfen.',
    cost: 'Mittel: weniger Kabel als Stern/Vollvermaschung, aber Switches/MAUs und Token-Management sind notwendig.',
    scalability: 'Befriedigend für kleine bis mittlere Netze; bei vielen Stationen steigt die Latenz pro Umlauf.',
    example: 'Ein klassisches Token-Ring-Netz in einer Bankfiliale aus den 1990ern.',
    questions: [
      { question: 'Wie verhindert Token Ring Kollisionen?', options: ['Durch höhere Spannung', 'Durch einen Token, den nur der Besitzer senden darf', 'Durch kürzere Kabel'], correct: 1, explanation: 'Der Token kreist im Ring. Nur wer den Token besitzt, darf senden - so gibt es keine Kollisionen.' },
      { question: 'Was passiert, wenn eine Station im Single-Ring ausfällt?', options: ['Das Netz funktioniert weiter.', 'Der Ring ist unterbrochen und die Kommunikation bricht ab.', 'Nur der direkte Nachbar bemerkt es.'], correct: 1, explanation: 'Im reinen Ring führt jede Unterbrechung dazu, dass der Kreis aufgebrochen wird.' },
    ],
    mnemonic: 'Ring = Reihe im Kreis: Jeder gibt das Paket an den nächsten weiter, bis es ankommt.',
  },
  star: {
    name: 'Stern',
    tagline: 'Alle Endgeräte laufen in einem zentralen Verteiler zusammen.',
    description: 'Bei einer Stern-Topologie ist jedes Endgerät über einen eigenen Link mit einem zentralen Gerät - meist einem Switch - verbunden. Der Switch entscheidet, wohin Pakete weitergeleitet werden.',
    advantages: ['Einfache Fehlersuche: ein defekter Link betrifft nur ein Gerät', 'Hohe Bandbreite pro Verbindung', 'Zentrale Verwaltung und Sicherheit am Switch'],
    disadvantages: ['Zentrales Gerät ist Single Point of Failure', 'Mehr Kabel als beim Bus/Ring', 'Switch-Ausfall legt das ganze Segment lahm'],
    useCases: ['Fast alle modernen Ethernet-LANs', 'Büroetagen mit RJ45-Anschlüssen', 'WLAN mit zentraler Router/Firewall'],
    resilience: 'Hoch für Endgeräte-Links, niedrig für das zentrale Gerät. Redundante Switche oder Stack-Technologie verbessern die Ausfallsicherheit.',
    cost: 'Niedrig bis mittel: Standard-Switche und Patchkabel sind sehr günstig, aber viele Kabel verlaufen in einem Stern zum Verteilerschrank.',
    scalability: 'Sehr gut: Switche lassen sich stapeln und verbinden, solange genug Ports verfügbar sind.',
    example: 'Ein typisches Büro-LAN, bei dem jeder PC über ein eigenes Kabel mit dem Switches im Serverschrank verbunden ist.',
    questions: [
      { question: 'Was ist der Hauptvorteil der Stern-Topologie gegenüber dem Bus?', options: ['Sie braucht weniger Kabel', 'Ein einzelner Kabelfehler betrifft meist nur ein Gerät', 'Sie funktioniert ohne zentrales Gerät'], correct: 1, explanation: 'Im Stern hat jedes Endgerät einen eigenen Link zum Switch. Ein defektes Kabel isoliert nur dieses Gerät.' },
      { question: 'Was ist bei einem klassischen Stern der größte Schwachpunkt?', options: ['Die Endgeräte', 'Der zentrale Switch/Router', 'Die Stromversorgung der Endgeräte'], correct: 1, explanation: 'Wenn der zentrale Verteiler ausfällt, sind alle Endgeräte vom Netz getrennt.' },
    ],
    mnemonic: 'Stern = Switch in der Mitte: Jeder spricht direkt mit der Mitte, Störungen bleiben lokal.',
  },
  tree: {
    name: 'Baum',
    tagline: 'Mehrere Sterne werden über weitere Sterne miteinander verbunden.',
    description: 'Eine Baum-Topologie entsteht, wenn mehrere Stern-Netze über Switche oder Router miteinander verbunden werden. Sie bildet eine Hierarchie aus Verteilern - typisch für größere Unternehmensnetze.',
    advantages: ['Kombiniert Vorteile des Sterns mit guter Skalierbarkeit', 'Klare Hierarchie erleichtert Planung und Fehlersuche', 'Einfache Erweiterung um weitere Etagen oder Standorte'],
    disadvantages: ['Wurzelswitch-Ausfall beeinträchtigt mehrere Bereiche', 'Komplexere Konfiguration als ein einzelner Stern', 'Überlastung an Aggregationsswitchen möglich'],
    useCases: ['Mehrstöckige Firmengebäude', 'Campus-Netze mit Kern-, Verteilungs- und Zugriffsebene', 'Netzwerke mit mehreren Standorten und zentralem Backbone'],
    resilience: 'Mittel: Fehler in einem Blatt bleiben dort lokal, aber die Wurzel oder Backbone-Links beeinträchtigen viele Geräte.',
    cost: 'Mittel bis hoch: mehr Switche, aber durch Standardkomponenten beherrschbar.',
    scalability: 'Sehr gut: Bäume lassen sich durch zusätzliche Ebenen und Verbindungen beliebig vergrößern.',
    example: 'Ein vierstöckiges Bürogebäude: Jede Etage ist ein Stern, alle Etagen-Switche hängen am zentralen Kern-Switch im Keller.',
    questions: [
      { question: 'Aus welcher Grundtopologie setzt sich ein Baum typischerweise zusammen?', options: ['Aus mehreren Ringen', 'Aus mehreren Sternen, die hierarchisch verbunden sind', 'Aus mehreren Bus-Leitungen'], correct: 1, explanation: 'Ein Baum ist eine Hierarchie aus Sternen, die über weitere Switche miteinander verbunden sind.' },
      { question: 'Wo wirkt sich ein Ausfall im Baum am stärksten aus?', options: ['Nur am ausgefallenen Endgerät', 'An der Wurzel oder den Backbone-Links', 'Nur an Blatt-Switchen'], correct: 1, explanation: 'Die Wurzel und Backbone-Links verbinden große Teile des Baums. Ihr Ausfall beeinträchtigt viele Geräte.' },
    ],
    mnemonic: 'Baum = Büroetagen: Blätter unten, Äste in der Mitte, Stamm/Wurzel oben oder zentral.',
  },
  mesh: {
    name: 'Vermascht',
    tagline: 'Jedes wichtige Gerät ist mit mehreren anderen direkt verbunden.',
    description: 'In einer vermaschten Topologie gibt es viele direkte Verbindungen zwischen den Knoten. Jedes wichtige Gerät kennt mehrere Pfade zum Ziel - Routing-Protokolle wählen den besten Weg aus und reagieren automatisch auf Ausfälle.',
    advantages: ['Hohe Ausfallsicherheit durch redundante Pfade', 'Automatische Umleitung bei Leitungs- oder Geräteausfällen', 'Hohe Verfügbarkeit für kritische Anwendungen'],
    disadvantages: ['Sehr viele Verbindungen und hoher Kabelaufwand', 'Komplexe Konfiguration und Fehlersuche', 'Teuer, besonders im Vollvermaschungs-Fall'],
    useCases: ['Internet-Backbone und Rechenzentren', 'WLAN-Mesh-Netze für große Flächenabdeckung', 'Kritische Infrastrukturen wie Krankenhäuser oder Energienetze'],
    resilience: 'Sehr hoch: Solange ein alternativer Pfad existiert, bleibt das Netz erreichbar.',
    cost: 'Hoch: viele Leitungen, Switche/Router und Routing-Protokolle erforderlich.',
    scalability: 'Gut für definierte Bereiche, aber voll vermaschte Netze wachsen quadratisch im Aufwand. Teilmeshes sind daher üblich.',
    example: 'Ein Rechenzentrum, in dem jeder Core-Switch mit jedem anderen verbunden ist und automatisch Ausfälle umgeht.',
    questions: [
      { question: 'Warum ist eine vermaschte Topologie besonders ausfallsicher?', options: ['Weil sie weniger Kabel braucht', 'Weil redundante Pfade den Ausfall einzelner Leitungen oder Geräte auffangen', 'Weil alle Geräte gleichzeitig senden'], correct: 1, explanation: 'Mehrere Pfade zwischen den Knoten ermöglichen Umleitungen, wenn ein Weg ausfällt.' },
      { question: 'Was ist der Hauptnachteil einer vollständigen Vermaschung?', options: ['Zu geringe Geschwindigkeit', 'Hoher Kabel- und Verwaltungsaufwand', 'Zu einfache Fehlersuche'], correct: 1, explanation: 'Vollvermaschte Netze wachsen quadratisch im Verbindungsaufwand und sind aufwendig zu verwalten.' },
    ],
    mnemonic: 'Vermascht = Viele Wege: Wenn einer blockiert ist, nimmt der Verkehr einfach einen anderen.',
  },
};

function buildExplanationForTopology(key, topology, style) {
  const blocks = [];
  if (style === 'classic') {
    blocks.push(
      { type: 'text', content: `${topology.name}-Topologie: ${topology.tagline}` },
      { type: 'text', content: topology.description },
      { type: 'diagram', content: diagramSvg[key] },
      { type: 'list', title: 'Vorteile', items: topology.advantages },
      { type: 'list', title: 'Nachteile', items: topology.disadvantages }
    );
  } else if (style === 'intuitive') {
    blocks.push(
      { type: 'text', content: `Stell dir die ${topology.name}-Topologie so vor:` },
      { type: 'text', content: topology.tagline },
      { type: 'diagram', content: diagramSvg[key] },
      { type: 'text', content: topology.resilience },
      { type: 'text', content: topology.scalability }
    );
  } else if (style === 'example') {
    blocks.push(
      { type: 'text', content: `Praxisbeispiel ${topology.name}:` },
      { type: 'text', content: topology.example },
      { type: 'diagram', content: diagramSvg[key] },
      { type: 'text', content: topology.cost },
      { type: 'text', content: `Typische Einsatzgebiete: ${topology.useCases.join('; ')}` }
    );
  } else if (style === 'visual') {
    blocks.push(
      { type: 'text', content: `Visueller Fokus: ${topology.name}` },
      { type: 'diagram', content: diagramSvg[key] },
      { type: 'text', content: topology.tagline },
      { type: 'list', title: 'Worauf du achten solltest', items: [topology.resilience, topology.scalability, topology.cost] }
    );
  } else if (style === 'mnemonic') {
    blocks.push(
      { type: 'text', content: `Merksatz für die ${topology.name}-Topologie:` },
      { type: 'text', content: topology.mnemonic },
      { type: 'diagram', content: diagramSvg[key] },
      { type: 'text', content: `Kurz gesagt: ${topology.description.split('.')[0]}.` }
    );
  }

  // Append one or two comprehension questions per topology.
  topology.questions.forEach((q, i) => {
    blocks.push({ type: 'question', id: `${key}-q${i}`, ...q });
  });

  return { id: `${key}-${style}`, style, blocks };
}

function buildTopologienLesson() {
  const explanations = [];
  const order = ['bus', 'ring', 'star', 'tree', 'mesh'];

  // Classic intro and one classic explanation per topology.
  explanations.push({
    id: 'intro-classic',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Netzwerk-Topologien beschreiben, wie Geräte in einem Netzwerk miteinander verbunden sind. Sie sind das „Skelett“ eines Netzes.' },
      { type: 'text', content: 'Die fünf grundlegenden Topologien sind Bus, Ring, Stern, Baum und Vermascht. Jede hat eigene Stärken, Schwächen und typische Einsatzgebiete.' },
      { type: 'text', content: 'In dieser Lektion lernst du alle fünf anhand von Beschreibungen, Diagrammen, Beispielen und Merksätzen kennen.' },
    ],
  });

  order.forEach((key) => {
    explanations.push(buildExplanationForTopology(key, topologies[key], 'classic'));
  });

  // Optional intuitive overview at the end.
  order.forEach((key) => {
    explanations.push(buildExplanationForTopology(key, topologies[key], 'intuitive'));
  });

  order.forEach((key) => {
    explanations.push(buildExplanationForTopology(key, topologies[key], 'example'));
  });

  order.forEach((key) => {
    explanations.push(buildExplanationForTopology(key, topologies[key], 'visual'));
  });

  order.forEach((key) => {
    explanations.push(buildExplanationForTopology(key, topologies[key], 'mnemonic'));
  });

  const quiz = [
    {
      question: 'Welche Topologie wird oft in modernen Ethernet-LANs eingesetzt, weil jeder PC einen eigenen Link zum zentralen Gerät hat?',
      options: ['Bus', 'Ring', 'Stern', 'Vermascht'],
      correct: 2,
      explanation: 'Im Stern hat jedes Endgerät einen eigenen Link zum Switch - das ist das Standardmodell moderner Büro-LANs.',
    },
    {
      question: 'Welche Topologie ist besonders ausfallsicher, weil mehrere redundante Pfade zwischen den Knoten existieren?',
      options: ['Bus', 'Baum', 'Ring', 'Vermascht'],
      correct: 3,
      explanation: 'Vermaschte Topologien bieten redundante Pfade. Wenn ein Weg ausfällt, kann der Verkehr umgeleitet werden.',
    },
    {
      question: 'Welche Topologie entsteht, wenn mehrere Sterne hierarchisch miteinander verbunden werden?',
      options: ['Baum', 'Bus', 'Ring', 'Vollvermascht'],
      correct: 0,
      explanation: 'Ein Baum ist eine Hierarchie aus mehreren Stern-Netzen, typisch für größere Unternehmensnetze.',
    },
    {
      question: 'Bei welcher Topologie wird ein Token verwendet, um zu regeln, welches Gerät gerade senden darf?',
      options: ['Bus', 'Ring', 'Stern', 'Baum'],
      correct: 1,
      explanation: 'Token Ring verwendet Token-Passing, um Kollisionen zu vermeiden und den Sendezugriff zu regeln.',
    },
    {
      question: 'Welche Aussage über die Bus-Topologie ist korrekt?',
      options: ['Sie skaliert sehr gut mit vielen Geräten.', 'Ein Kabelbruch legt das gesamte Netz lahm.', 'Sie benötigt immer einen zentralen Switch.'],
      correct: 1,
      explanation: 'Der Bus basiert auf einem gemeinsamen Kabel. Ein Bruch unterbricht die Verbindung für alle Teilnehmer.',
    },
  ];

  const summary = order.map((key) => `${topologies[key].name}: ${topologies[key].mnemonic}`);

  return {
    title: 'Netzwerk-Topologien',
    explanations,
    summary,
    exercises: [
      {
        id: 'topo-match',
        type: 'matching',
        question: 'Ordne die Topologie-Namen ihren Beschreibungen zu.',
        pairs: order.map((key) => ({
          left: key,
          leftLabel: topologies[key].name,
          right: topologies[key].tagline,
        })),
        explanation: 'Jeder Name beschreibt die typische Struktur der Topologie.',
      },
    ],
    quiz,
  };
}

export const LESSONS = {
  [topicKey('fundamentals', 'topologien')]: buildTopologienLesson(),
  [OSI_TOPIC_KEY]: buildOsiLesson(),
  [TCP_IP_TOPIC_KEY]: buildTcpIpLesson(),
  [BINARY_SYSTEM_TOPIC_KEY]: buildBinarySystemLesson(),
  [IPV4_TOPIC_KEY]: buildIpv4Lesson(),
  [SUBNET_MASKS_TOPIC_KEY]: buildSubnetMasksLesson(),
  [SUBNETTING_TOPIC_KEY]: buildSubnettingLesson(),
  [VLSM_TOPIC_KEY]: buildVlsmLesson(),
  [SUPERNETTING_TOPIC_KEY]: buildSupernettingLesson(),
  [TCP_UDP_TOPIC_KEY]: buildTcpUdpLesson(),
  [KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY]: buildKommunikationUebertragungLesson(),
  [CISCO_GRUNDLAGEN_TOPIC_KEY]: buildCiscoGrundlagenLesson(),
  [DNS_TOPIC_KEY]: buildDnsLesson(),
  [DHCP_TOPIC_KEY]: buildDhcpLesson(),
  [ROUTING_TOPIC_KEY]: buildRoutingLesson(),
  [SWITCHING_TOPIC_KEY]: buildSwitchingLesson(),
  [VLAN_BASICS_TOPIC_KEY]: buildVlanBasicsLesson(),
  [CISCO_GRUNDKONFIGURATION_TOPIC_KEY]: buildCiscoGrundkonfigurationLesson(),
};

// Topics with custom interactive lessons (not in LESSONS, but not placeholders)
const CUSTOM_LESSON_TOPICS = new Set([
  'fundamentals/grundbegriffe',
]);

/** Returns true if a topic has actual lesson content (LessonRunner, custom, or mini-lesson). */
export function hasLessonContent(categoryId, topicId) {
  const key = topicKey(categoryId, topicId);
  return !!LESSONS[key] || CUSTOM_LESSON_TOPICS.has(key);
}

export function getTopicScoreDimensions(categoryId, topicId) {
  const key = topicKey(categoryId, topicId);
  // Special interactive mini lessons that do not use the generic LessonRunner.
  if (categoryId === 'fundamentals' && topicId === 'grundbegriffe') {
    return { theory: true, practice: false, retention: false };
  }
  const lesson = LESSONS[key];
  if (!lesson) return { theory: false, practice: false, retention: false };
  const hasTheory = (lesson.explanations && lesson.explanations.length > 0)
    || (lesson.quiz && lesson.quiz.length > 0);
  const hasPractice = lesson.exercises && lesson.exercises.length > 0;
  return { theory: hasTheory, practice: hasPractice, retention: false };
}
