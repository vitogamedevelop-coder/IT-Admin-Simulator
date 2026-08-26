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
import { buildCiscoVlanLesson, CISCO_VLAN_TOPIC_KEY } from './academyLessons/ciscoVlan.js';
import { buildCiscoAccessPortLesson, CISCO_ACCESS_PORT_TOPIC_KEY } from './academyLessons/ciscoAccessPort.js';
import { buildCiscoTrunkLesson, CISCO_TRUNK_TOPIC_KEY } from './academyLessons/ciscoTrunk.js';
import { buildCiscoRouterBasicsLesson, CISCO_ROUTER_BASICS_TOPIC_KEY } from './academyLessons/ciscoRouterBasics.js';
import { buildCiscoStaticRoutingLesson, CISCO_STATIC_ROUTING_TOPIC_KEY } from './academyLessons/ciscoStaticRouting.js';
import { buildCiscoOspfLesson, CISCO_OSPF_TOPIC_KEY } from './academyLessons/ciscoOspf.js';
import { buildCiscoAclLesson, CISCO_ACL_TOPIC_KEY } from './academyLessons/ciscoAcl.js';
import { buildCiscoPacketfilterLesson, CISCO_PACKETFILTER_TOPIC_KEY } from './academyLessons/ciscoPacketfilter.js';
import { buildCiscoNatLesson, CISCO_NAT_TOPIC_KEY } from './academyLessons/ciscoNat.js';
import { buildCiscoInterVlanRoutingLesson, CISCO_INTER_VLAN_ROUTING_TOPIC_KEY } from './academyLessons/ciscoInterVlanRouting.js';
import { buildCiscoMultilayerSwitchingLesson, CISCO_MULTILAYER_SWITCHING_TOPIC_KEY } from './academyLessons/ciscoMultilayerSwitching.js';
import { buildCiscoTroubleshootingLesson, CISCO_TROUBLESHOOTING_TOPIC_KEY } from './academyLessons/ciscoTroubleshooting.js';
import { buildCiscoStpLesson, CISCO_STP_TOPIC_KEY } from './academyLessons/ciscoStp.js';
import { buildCiscoSshLesson, CISCO_SSH_TOPIC_KEY } from './academyLessons/ciscoSsh.js';
import { buildCiscoDhcpLesson, CISCO_DHCP_TOPIC_KEY } from './academyLessons/ciscoDhcp.js';
import { buildCiscoBasicDeviceConfigurationLesson, CISCO_BASIC_DEVICE_CONFIGURATION_TOPIC_KEY } from './academyLessons/ciscoBasicDeviceConfiguration.js';
import {
  buildInformationSecurityFundamentalsLesson,
  buildInformationSecurityLegalDataLesson,
  buildInformationSecurityIncidentsLesson,
  buildInformationSecurityThreatsMalwareLesson,
  buildInformationSecurityTechnicalMeasuresLesson,
  SECURITY_FUNDAMENTALS_TOPIC_KEY,
  SECURITY_LEGAL_DATA_TOPIC_KEY,
  SECURITY_INCIDENTS_TOPIC_KEY,
  SECURITY_THREATS_MALWARE_TOPIC_KEY,
  SECURITY_TECHNICAL_MEASURES_TOPIC_KEY,
} from './academyLessons/informationSecurity.js';
import { buildAdFoundationLesson, AD_FOUNDATION_TOPIC_KEY } from './academyLessons/adFoundation.js';
import { buildAdUserProfilesLesson, AD_USER_PROFILES_TOPIC_KEY } from './academyLessons/adUserProfiles.js';
import { buildAdPermissionsLesson, AD_PERMISSIONS_TOPIC_KEY } from './academyLessons/adPermissions.js';

// Simple inline SVG diagrams for the five network topologies.
const diagramSvg = {
  bus: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="55" width="180" height="10" rx="2" fill="#00f0ff" opacity="0.85"/><circle cx="40" cy="40" r="8" fill="#c9d1d9"/><circle cx="100" cy="40" r="8" fill="#c9d1d9"/><circle cx="160" cy="40" r="8" fill="#c9d1d9"/><line x1="40" y1="48" x2="40" y2="55" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="48" x2="100" y2="55" stroke="#8b949e" stroke-width="2"/><line x1="160" y1="48" x2="160" y2="55" stroke="#8b949e" stroke-width="2"/><circle cx="40" cy="80" r="8" fill="#c9d1d9"/><circle cx="100" cy="80" r="8" fill="#c9d1d9"/><circle cx="160" cy="80" r="8" fill="#c9d1d9"/><line x1="40" y1="65" x2="40" y2="72" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="65" x2="100" y2="72" stroke="#8b949e" stroke-width="2"/><line x1="160" y1="65" x2="160" y2="72" stroke="#8b949e" stroke-width="2"/></svg>`,
  ring: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="60" rx="80" ry="45" fill="none" stroke="#00f0ff" stroke-width="3" opacity="0.85"/><circle cx="100" cy="15" r="8" fill="#c9d1d9"/><circle cx="172" cy="60" r="8" fill="#c9d1d9"/><circle cx="100" cy="105" r="8" fill="#c9d1d9"/><circle cx="28" cy="60" r="8" fill="#c9d1d9"/><circle cx="145" cy="32" r="8" fill="#c9d1d9"/><circle cx="145" cy="88" r="8" fill="#c9d1d9"/><circle cx="55" cy="88" r="8" fill="#c9d1d9"/><circle cx="55" cy="32" r="8" fill="#c9d1d9"/></svg>`,
  star: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="60" r="10" fill="#00f0ff"/><circle cx="100" cy="20" r="7" fill="#c9d1d9"/><circle cx="145" cy="40" r="7" fill="#c9d1d9"/><circle cx="145" cy="80" r="7" fill="#c9d1d9"/><circle cx="100" cy="100" r="7" fill="#c9d1d9"/><circle cx="55" cy="80" r="7" fill="#c9d1d9"/><circle cx="55" cy="40" r="7" fill="#c9d1d9"/><line x1="100" y1="60" x2="100" y2="27" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="145" y2="40" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="145" y2="80" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="100" y2="93" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="55" y2="80" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="60" x2="55" y2="40" stroke="#8b949e" stroke-width="2"/></svg>`,
  tree: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="20" r="8" fill="#00f0ff"/><line x1="100" y1="28" x2="60" y2="55" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="28" x2="140" y2="55" stroke="#8b949e" stroke-width="2"/><circle cx="60" cy="55" r="7" fill="#c9d1d9"/><circle cx="140" cy="55" r="7" fill="#c9d1d9"/><line x1="60" y1="62" x2="40" y2="90" stroke="#8b949e" stroke-width="2"/><line x1="60" y1="62" x2="80" y2="90" stroke="#8b949e" stroke-width="2"/><line x1="140" y1="62" x2="120" y2="90" stroke="#8b949e" stroke-width="2"/><line x1="140" y1="62" x2="160" y2="90" stroke="#8b949e" stroke-width="2"/><circle cx="40" cy="90" r="6" fill="#c9d1d9"/><circle cx="80" cy="90" r="6" fill="#c9d1d9"/><circle cx="120" cy="90" r="6" fill="#c9d1d9"/><circle cx="160" cy="90" r="6" fill="#c9d1d9"/></svg>`,
  mesh: `<svg viewBox="0 0 200 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="35" r="8" fill="#c9d1d9"/><circle cx="140" cy="35" r="8" fill="#c9d1d9"/><circle cx="40" cy="85" r="8" fill="#c9d1d9"/><circle cx="100" cy="85" r="8" fill="#c9d1d9"/><circle cx="160" cy="85" r="8" fill="#c9d1d9"/><line x1="60" y1="35" x2="140" y2="35" stroke="#8b949e" stroke-width="2"/><line x1="60" y1="35" x2="40" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="60" y1="35" x2="100" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="140" y1="35" x2="100" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="140" y1="35" x2="160" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="40" y1="85" x2="100" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="100" y1="85" x2="160" y2="85" stroke="#8b949e" stroke-width="2"/><line x1="40" y1="85" x2="160" y2="85" stroke="#8b949e" stroke-width="2" opacity="0.4"/><line x1="60" y1="35" x2="160" y2="85" stroke="#8b949e" stroke-width="2" opacity="0.4"/><line x1="140" y1="35" x2="40" y2="85" stroke="#8b949e" stroke-width="2" opacity="0.4"/></svg>`,
};

const physicalLogicalSvg = `<svg viewBox="0 0 320 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="80" y="18" text-anchor="middle" fill="#00f0ff" font-size="12">PHYSISCH</text><circle cx="30" cy="70" r="12" fill="#c9d1d9"/><rect x="68" y="58" width="24" height="24" rx="3" fill="#00f0ff"/><circle cx="130" cy="45" r="12" fill="#c9d1d9"/><circle cx="130" cy="95" r="12" fill="#c9d1d9"/><line x1="42" y1="70" x2="68" y2="70" stroke="#8b949e" stroke-width="2"/><line x1="92" y1="65" x2="118" y2="48" stroke="#8b949e" stroke-width="2"/><line x1="92" y1="76" x2="118" y2="92" stroke="#8b949e" stroke-width="2"/><text x="240" y="18" text-anchor="middle" fill="#ffcc00" font-size="12">LOGISCHER DATENWEG</text><circle cx="190" cy="70" r="12" fill="#c9d1d9"/><rect x="228" y="58" width="24" height="24" rx="3" fill="#00f0ff"/><circle cx="290" cy="45" r="12" fill="#c9d1d9"/><circle cx="290" cy="95" r="12" fill="#c9d1d9"/><path d="M202 70 H228 L278 92" fill="none" stroke="#ffcc00" stroke-width="3" marker-end="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#ffcc00"/></marker></defs><text x="80" y="135" text-anchor="middle" fill="#8b949e" font-size="10">reale Verbindungen</text><text x="240" y="135" text-anchor="middle" fill="#8b949e" font-size="10">tatsächlich genutzter Weg</text></svg>`;

const topologies = {
  bus: {
    name: 'Bus',
    tagline: 'Alle Geräte hängen an einem einzigen Kabelstrang.',
    description: 'Bei einer Bus-Topologie teilen sich alle Geräte ein gemeinsames Übertragungsmedium. Signale breiten sich entlang des passiven Busses aus und werden mit der Entfernung schwächer; Repeater können die Reichweite erweitern. Bei klassischen elektrischen Busstrukturen verhindern Abschlusswiderstände störende Signalreflexionen.',
    advantages: ['Einfach und kostengünstig bei wenigen Geräten', 'Geringer Kabelaufwand in kleinen Netzen', 'Ein gemeinsames Medium verbindet alle Teilnehmer'],
    disadvantages: ['Eine Störung des Hauptmediums kann das gesamte Netz beeinträchtigen', 'Die gemeinsam genutzte Kapazität wird bei mehr Datenverkehr zum Engpass', 'Fehler am gemeinsamen Medium sind schwer einzugrenzen'],
    useCases: ['Feldbusse und Automatisierung', 'Automobil- und Schienenfahrzeugtechnik', 'Flug- und Raumfahrt', 'Historische Ethernet-Netze mit Koaxialkabel'],
    resilience: 'Niedrig: Eine Störung des gemeinsamen Hauptmediums kann viele oder alle Teilnehmer betreffen.',
    cost: 'Bei wenigen Teilnehmern geringer Verkabelungsaufwand; Terminierung und gegebenenfalls Repeater erhöhen den technischen Aufwand.',
    scalability: 'Begrenzt: Reichweite, Teilnehmerzahl und gemeinsam genutztes Medium setzen der Erweiterung Grenzen.',
    capacity: 'Die Teilnehmer teilen sich die verfügbare Übertragungskapazität des gemeinsamen Mediums; die konkrete Leistung hängt von der eingesetzten Technik ab.',
    example: 'Ein altes Büronetzwerk aus den 1990ern, bei dem alle PCs an einem Koaxialkabel hängen.',
    questions: [
      { question: 'Was passiert in einer reinen Bus-Topologie, wenn das Hauptkabel durchtrennt wird?', options: ['Das Netz bleibt funktionsfähig.', 'Alle Geräte verlieren die Verbindung.', 'Nur die angeschlossenen Endgeräte sind betroffen.'], correct: 1, explanation: 'Der Bus bildet ein gemeinsames Medium. Ein Bruch unterbricht die Kommunikation für alle Teilnehmer.' },
      { facet: 'capacity', question: 'Warum kann ein Bus bei vielen aktiven Teilnehmern zum Engpass werden?', options: ['Weil alle Teilnehmer die Kapazität des gemeinsamen Mediums teilen', 'Weil jeder Teilnehmer eine eigene exklusive Leitung besitzt', 'Weil Abschlusswiderstände zusätzliche Daten erzeugen'], correct: 0, explanation: 'Alle Teilnehmer nutzen dasselbe Medium. Wie stark sich das auswirkt, hängt von der konkreten Bustechnik und ihrem Zugriffsverfahren ab.' },
    ],
    mnemonic: 'Bus = Backbone: Ein einziger Weg, der bei einem Bruch allen den Weg versperrt.',
  },
  ring: {
    name: 'Ring',
    tagline: 'Jedes Gerät ist mit genau zwei Nachbarn verbunden und bildet einen Kreis.',
    description: 'In einer Ring-Topologie ist jedes Gerät mit genau zwei Nachbarn zu einer geschlossenen Struktur verbunden. Wie der Sendezugriff geregelt wird, hängt von der eingesetzten Technik ab; klassische Token-Ring-Netze verwenden dafür Token-Passing.',
    advantages: ['Geschlossene, klar nachvollziehbare Struktur', 'Token-Passing kann in klassischen Token-Ring-Netzen Kollisionen vermeiden', 'Dual-Ring-Varianten können einen zusätzlichen Weg bereitstellen'],
    disadvantages: ['Im einfachen Ring kann eine Unterbrechung die Kommunikation des gesamten Rings stören', 'Daten durchlaufen je nach Technik mehrere Stationen', 'Änderungen an der Struktur können zusätzlichen Aufwand verursachen'],
    useCases: ['Klassische Token-Ring-Netze (IEEE 802.5)', 'FDDI als Glasfaser-Ring', 'Industrielle Ringstrukturen mit geeigneten Redundanzmechanismen'],
    resilience: 'Beim einfachen Ring kann eine Unterbrechung den Kreis aufbrechen; redundante Ringvarianten können die Auswirkung begrenzen.',
    cost: 'Der Aufwand hängt von Ringtechnik und Redundanz ab; ein zusätzlicher Gegenring benötigt weitere Verbindungen und Komponenten.',
    scalability: 'Zusätzliche Stationen erweitern den Ring, können aber Laufweg, Umbauaufwand und Fehlerabhängigkeiten erhöhen.',
    capacity: 'Die nutzbare Kapazität hängt von der Ringtechnik und dem Zugriffsverfahren ab; die Ringform allein legt keine feste Datenrate fest.',
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
    scalability: 'Neue Teilnehmer lassen sich typischerweise über freie Anschlüsse oder zusätzliche Verteiler ergänzen; die konkrete Grenze hängt von Komponenten und Planung ab.',
    capacity: 'Eigene Teilnehmerleitungen vermeiden ein gemeinsam genutztes Hauptkabel; die tatsächliche Kapazität hängt von Links und zentralem Verteiler ab.',
    example: 'Ein typisches Büro-LAN, bei dem jeder PC über ein eigenes Kabel mit dem Switch im Serverschrank verbunden ist.',
    questions: [
      { question: 'Was ist der Hauptvorteil der Stern-Topologie gegenüber dem Bus?', options: ['Sie braucht weniger Kabel', 'Ein einzelner Kabelfehler betrifft meist nur ein Gerät', 'Sie funktioniert ohne zentrales Gerät'], correct: 1, explanation: 'Im Stern hat jedes Endgerät einen eigenen Link zum Switch. Ein defektes Kabel isoliert nur dieses Gerät.' },
      { question: 'Was ist bei einem klassischen Stern der größte Schwachpunkt?', options: ['Die Endgeräte', 'Der zentrale Switch/Router', 'Die Stromversorgung der Endgeräte'], correct: 1, explanation: 'Wenn der zentrale Verteiler ausfällt, sind alle Endgeräte vom Netz getrennt.' },
    ],
    mnemonic: 'Stern = Switch in der Mitte: Jeder spricht direkt mit der Mitte, Störungen bleiben lokal.',
  },
  tree: {
    name: 'Baum',
    tagline: 'Mehrere Sterne werden über weitere Sterne miteinander verbunden.',
    description: 'Eine Baum-Topologie verbindet mehrere Sternstrukturen hierarchisch. Von einer Wurzel führen Uplinks zu Verteilern und Unterverteilungen, an denen weitere Teilnehmer oder Zweige angeschlossen sind.',
    advantages: ['Hierarchie aus Wurzel, Verteilern und Unterverteilungen erleichtert die Strukturierung', 'Einzelne Zweige lassen sich gezielt erweitern', 'Störungen in einem unteren Zweig können lokal begrenzt bleiben'],
    disadvantages: ['Wurzelswitch-Ausfall beeinträchtigt mehrere Bereiche', 'Komplexere Konfiguration als ein einzelner Stern', 'Überlastung an Aggregationsswitchen möglich'],
    useCases: ['Mehrstöckige Firmengebäude', 'Campus-Netze mit Kern-, Verteilungs- und Zugriffsebene', 'Netzwerke mit mehreren Standorten und zentralem Backbone'],
    resilience: 'Mittel: Fehler in einem Blatt bleiben dort lokal, aber die Wurzel oder Backbone-Links beeinträchtigen viele Geräte.',
    cost: 'Mittel bis hoch: mehr Switche, aber durch Standardkomponenten beherrschbar.',
    scalability: 'Weitere Zweige und Unterverteilungen lassen sich ergänzen; obere Verteiler und Uplinks müssen für das Wachstum passend ausgelegt sein.',
    capacity: 'Uplinks und höher gelegene Verteiler bündeln den Verkehr mehrerer Zweige und können abhängig von ihrer Auslegung zum Engpass werden.',
    example: 'Ein vierstöckiges Bürogebäude: Jede Etage ist ein Stern, alle Etagen-Switche hängen per Uplink am zentralen Verteiler.',
    questions: [
      { question: 'Aus welcher Grundtopologie setzt sich ein Baum typischerweise zusammen?', options: ['Aus mehreren Ringen', 'Aus mehreren Sternen, die hierarchisch verbunden sind', 'Aus mehreren Bus-Leitungen'], correct: 1, explanation: 'Ein Baum ist eine Hierarchie aus Sternen, die über weitere Switche miteinander verbunden sind.' },
      { question: 'Wo wirkt sich ein Ausfall im Baum am stärksten aus?', options: ['Nur am ausgefallenen Endgerät', 'An der Wurzel oder den Backbone-Links', 'Nur an Blatt-Switchen'], correct: 1, explanation: 'Die Wurzel und Backbone-Links verbinden große Teile des Baums. Ihr Ausfall beeinträchtigt viele Geräte.' },
    ],
    mnemonic: 'Baum = Büroetagen: Blätter unten, Äste in der Mitte, Stamm/Wurzel oben oder zentral.',
  },
  mesh: {
    name: 'Vermascht',
    tagline: 'Jedes wichtige Gerät ist mit mehreren anderen direkt verbunden.',
    description: 'In einer vermaschten Topologie besitzt jeder Knoten direkte Verbindungen zu mehreren anderen. Teilvermascht bedeutet, dass nicht jeder mit jedem direkt verbunden ist; bei einer Vollvermaschung besitzt jeder Knoten eine direkte Verbindung zu jedem anderen.',
    advantages: ['Mehrere Verbindungen können alternative Wege und hohe Ausfallsicherheit schaffen', 'Eine einzelne gestörte Verbindung muss nicht alle Kommunikation unterbrechen', 'Der Redundanzgrad lässt sich durch Teil- oder Vollvermaschung anpassen'],
    disadvantages: ['Mehr direkte Verbindungen erhöhen Verkabelungs-, Komponenten- und Verwaltungsaufwand', 'Fehlersuche und Planung werden komplexer', 'Vollvermaschung wächst mit jedem zusätzlichen Knoten stark im Aufwand'],
    useCases: ['Internet-Backbone und Rechenzentren', 'WLAN-Mesh-Netze für große Flächenabdeckung', 'Kritische Infrastrukturen wie Krankenhäuser oder Energienetze'],
    resilience: 'Sehr hoch: Solange ein alternativer Pfad existiert, bleibt das Netz erreichbar.',
    cost: 'Hoch: viele Leitungen, Switche/Router und Routing-Protokolle erforderlich.',
    scalability: 'Teilvermaschung begrenzt den Verbindungsaufwand; Vollvermaschung wird mit jedem zusätzlichen Knoten deutlich aufwendiger.',
    capacity: 'Mehrere direkte Wege können zusätzliche Übertragungsmöglichkeiten schaffen; die nutzbare Kapazität hängt jedoch von Links und Steuerung ab.',
    example: 'Kritische NEXUS-Verteiler sind teilvermascht: Wichtige Knoten haben alternative Verbindungen, ohne dass jeder Knoten mit jedem direkt verbunden ist.',
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
      { type: 'list', title: 'Worauf du achten solltest', items: [topology.cost, topology.scalability, topology.capacity, topology.resilience] }
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
      { type: 'text', content: 'Eine Netzwerk-Topologie beschreibt die Struktur und Anordnung eines Netzwerks – also wie seine Teilnehmer und Verbindungen organisiert sind.' },
      { type: 'text', content: 'Die fünf grundlegenden Strukturen Bus, Ring, Stern, Baum und Vermascht bringen unterschiedliche Stärken, Schwächen und Einsatzmöglichkeiten mit.' },
      { type: 'question', facet: 'definition', question: 'Was beschreibt eine Netzwerk-Topologie?', options: ['Die Struktur und Anordnung eines Netzwerks', 'Ausschließlich die Geschwindigkeit einer Internetverbindung', 'Nur die IP-Adressen der Teilnehmer'], correct: 0, explanation: 'Topologie bezeichnet die Struktur beziehungsweise Anordnung von Teilnehmern und Verbindungen.' },
    ],
  });

  explanations.push({
    id: 'physical-logical-classic',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Die physische Topologie zeigt die realen Kabel, Geräte und hardwareseitigen Verbindungen. Die logische Topologie beschreibt dagegen, welchen Weg Daten oder Signale tatsächlich durch das Netzwerk nehmen.' },
      { type: 'diagram', content: physicalLogicalSvg },
      { type: 'text', content: 'Beide Sichten können voneinander abweichen: Aus der sichtbaren Verkabelung allein folgt nicht automatisch, welchen Datenweg das System tatsächlich nutzt.' },
      { type: 'question', facet: 'physical-logical', question: 'Welche Frage beantwortet die logische Topologie?', options: ['Wie Daten oder Signale tatsächlich durch das Netzwerk verlaufen', 'Welche Kabel physisch in der Wand liegen', 'Wie teuer die Geräte beim Einkauf waren'], correct: 0, explanation: 'Die logische Topologie betrachtet den Daten- oder Signalweg; die physische Topologie betrachtet reale Verbindungen und Geräte.' },
    ],
  });

  explanations.push({
    id: 'criteria-classic',
    style: 'classic',
    blocks: [
      { type: 'text', content: 'Sam legt den NEXUS-Netzplan auf den Tisch: „Ein Name allein reicht nicht. Bewerte jede Struktur nach Aufwand, Skalierbarkeit, Kapazität und Ausfallsicherheit.“' },
      { type: 'table', headers: ['Kriterium', 'Leitfrage'], rows: [
        ['Aufwand', 'Wie viel Zeit, Verkabelung und welche Komponenten braucht der Aufbau?'],
        ['Skalierbarkeit', 'Wie einfach lässt sich die Struktur um weitere Teilnehmer oder Zweige erweitern?'],
        ['Kapazität', 'Wo werden Übertragungsmöglichkeiten geteilt oder gebündelt, und welche Komponenten können begrenzen?'],
        ['Ausfallsicherheit', 'Welche Teilnehmer sind betroffen, wenn ein Kabel, Gerät oder Verteiler ausfällt?'],
      ] },
      { type: 'text', content: 'Diese Kriterien sind kein starres Ranking. Die konkrete Technik, Dimensionierung und Redundanz entscheiden mit – eine Topologie ist nicht automatisch in jeder Situation die beste.' },
      { type: 'question', facet: 'criteria', question: 'Welches Kriterium prüft, wie sich ein Netzwerk um weitere Teilnehmer erweitern lässt?', options: ['Skalierbarkeit', 'Ausfallsicherheit', 'Topologiename'], correct: 0, explanation: 'Skalierbarkeit beschreibt, wie gut sich eine Struktur erweitern lässt.' },
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
      facet: 'identification',
      question: 'Welche Topologie wird oft in modernen Ethernet-LANs eingesetzt, weil jeder PC einen eigenen Link zum zentralen Gerät hat?',
      options: ['Bus', 'Ring', 'Stern', 'Vermascht'],
      correct: 2,
      explanation: 'Im Stern hat jedes Endgerät einen eigenen Link zum Switch - das ist das Standardmodell moderner Büro-LANs.',
    },
    {
      facet: 'resilience',
      question: 'Welche Topologie bietet durch mehrere alternative Verbindungen grundsätzlich hohe Ausfallsicherheit?',
      options: ['Bus', 'Baum', 'Ring', 'Vermascht'],
      correct: 3,
      explanation: 'Vermaschte Topologien bieten redundante Pfade. Wenn ein Weg ausfällt, kann der Verkehr umgeleitet werden.',
    },
    {
      facet: 'hierarchy',
      question: 'Welche Topologie entsteht, wenn mehrere Sterne hierarchisch miteinander verbunden werden?',
      options: ['Baum', 'Bus', 'Ring', 'Vollvermascht'],
      correct: 0,
      explanation: 'Ein Baum ist eine Hierarchie aus mehreren Stern-Netzen, typisch für größere Unternehmensnetze.',
    },
    {
      facet: 'ring-context',
      question: 'Bei welcher klassischen Netzwerktechnik wird ein Token verwendet, um zu regeln, welches Gerät gerade senden darf?',
      options: ['Bus', 'Ring', 'Stern', 'Baum'],
      correct: 1,
      explanation: 'Token Ring verwendet Token-Passing, um Kollisionen zu vermeiden und den Sendezugriff zu regeln.',
    },
    {
      facet: 'bus',
      question: 'Welche Aussage über die Bus-Topologie ist korrekt?',
      options: ['Alle Teilnehmer teilen sich ein gemeinsames Übertragungsmedium.', 'Jeder Teilnehmer braucht eine eigene Leitung zum zentralen Switch.', 'Sie ist automatisch vollvermascht.'],
      correct: 0,
      explanation: 'Der Bus basiert auf einem gemeinsamen Medium. Eine Störung dieses Hauptmediums kann deshalb viele Teilnehmer betreffen.',
    },
    {
      facet: 'physical-logical',
      question: 'Physisch hängen mehrere PCs an zentralen Verteilern. Was lässt sich daraus über den logischen Datenweg ableiten?',
      options: ['Er muss nicht einfach dem offensichtlichsten physischen Weg entsprechen.', 'Er ist immer mit der sichtbaren Verkabelung identisch.', 'Es gibt ohne Vollvermaschung keinen logischen Datenweg.'],
      correct: 0,
      explanation: 'Physische Topologie beschreibt reale Verbindungen, logische Topologie den tatsächlich genutzten Daten- oder Signalweg.',
    },
    {
      facet: 'tradeoff',
      question: 'Warum ist eine Vollvermaschung nicht automatisch für jedes Netzwerk die beste Wahl?',
      options: ['Hohe Redundanz steht einem stark steigenden Verbindungs- und Verwaltungsaufwand gegenüber.', 'Sie besitzt grundsätzlich keine alternativen Wege.', 'Sie kann nur aus zwei Teilnehmern bestehen.'],
      correct: 0,
      explanation: 'Vollvermaschung maximiert direkte Verbindungen, erhöht dadurch aber Aufwand und Komplexität. Die passende Struktur hängt von den Anforderungen ab.',
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
      {
        id: 'topo-nexus-failure',
        type: 'select-best',
        question: 'Im neuen NEXUS-Büro besitzt jeder Arbeitsplatz eine eigene Leitung zum zentralen Switch. Nur das Kabel eines Arbeitsplatzes fällt aus. Welche Auswirkung ist typisch?',
        options: ['Nur dieser Arbeitsplatz verliert zunächst die Verbindung.', 'Alle Arbeitsplätze verlieren zwingend die Verbindung.', 'Die Struktur wird automatisch vollvermascht.'],
        correct: 0,
        explanation: 'In der Sterntopologie betrifft der Ausfall einer einzelnen Teilnehmerleitung zunächst den angeschlossenen Arbeitsplatz. Der zentrale Verteiler bleibt dagegen ein kritischer gemeinsamer Punkt.',
      },
      {
        id: 'topo-nexus-tradeoff',
        type: 'select-best',
        question: 'NEXUS benötigt alternative Verbindungen zwischen kritischen Verteilern, will aber nicht jeden Verteiler mit jedem direkt verbinden. Welche Wahl beschreibt diesen Trade-off?',
        options: ['Teilvermaschung', 'Vollvermaschung', 'Ein einzelner passiver Bus'],
        correct: 0,
        explanation: 'Eine Teilvermaschung schafft gezielt Redundanz, begrenzt aber den Verbindungsaufwand gegenüber einer Vollvermaschung.',
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
  [CISCO_VLAN_TOPIC_KEY]: buildCiscoVlanLesson(),
  [CISCO_ACCESS_PORT_TOPIC_KEY]: buildCiscoAccessPortLesson(),
  [CISCO_TRUNK_TOPIC_KEY]: buildCiscoTrunkLesson(),
  [CISCO_ROUTER_BASICS_TOPIC_KEY]: buildCiscoRouterBasicsLesson(),
  [CISCO_STATIC_ROUTING_TOPIC_KEY]: buildCiscoStaticRoutingLesson(),
  [CISCO_OSPF_TOPIC_KEY]: buildCiscoOspfLesson(),
  [CISCO_ACL_TOPIC_KEY]: buildCiscoAclLesson(),
  [CISCO_PACKETFILTER_TOPIC_KEY]: buildCiscoPacketfilterLesson(),
  [CISCO_NAT_TOPIC_KEY]: buildCiscoNatLesson(),
  [CISCO_INTER_VLAN_ROUTING_TOPIC_KEY]: buildCiscoInterVlanRoutingLesson(),
  [CISCO_MULTILAYER_SWITCHING_TOPIC_KEY]: buildCiscoMultilayerSwitchingLesson(),
  [CISCO_TROUBLESHOOTING_TOPIC_KEY]: buildCiscoTroubleshootingLesson(),
  [CISCO_STP_TOPIC_KEY]: buildCiscoStpLesson(),
  [CISCO_SSH_TOPIC_KEY]: buildCiscoSshLesson(),
  [CISCO_DHCP_TOPIC_KEY]: buildCiscoDhcpLesson(),
  [CISCO_BASIC_DEVICE_CONFIGURATION_TOPIC_KEY]: buildCiscoBasicDeviceConfigurationLesson(),
  [SECURITY_FUNDAMENTALS_TOPIC_KEY]: buildInformationSecurityFundamentalsLesson(),
  [SECURITY_LEGAL_DATA_TOPIC_KEY]: buildInformationSecurityLegalDataLesson(),
  [SECURITY_INCIDENTS_TOPIC_KEY]: buildInformationSecurityIncidentsLesson(),
  [SECURITY_THREATS_MALWARE_TOPIC_KEY]: buildInformationSecurityThreatsMalwareLesson(),
  [SECURITY_TECHNICAL_MEASURES_TOPIC_KEY]: buildInformationSecurityTechnicalMeasuresLesson(),
  [AD_FOUNDATION_TOPIC_KEY]: buildAdFoundationLesson(),
  [AD_USER_PROFILES_TOPIC_KEY]: buildAdUserProfilesLesson(),
  [AD_PERMISSIONS_TOPIC_KEY]: buildAdPermissionsLesson(),
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
    return { theory: true, practice: true, retention: false };
  }
  const lesson = LESSONS[key];
  if (!lesson) return { theory: false, practice: false, retention: false };
  const hasTheory = (lesson.explanations && lesson.explanations.length > 0)
    || (lesson.quiz && lesson.quiz.length > 0);
  const hasPractice = lesson.exercises && lesson.exercises.length > 0;
  return { theory: hasTheory, practice: hasPractice, retention: false };
}
