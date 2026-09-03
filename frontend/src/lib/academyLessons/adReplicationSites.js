import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Sites, Subnetze & Intra-/Intersite-Replikation
// Thema 23
// =============================================================================

export const AD_REPLICATION_SITES_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-sites');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const nexusScenarioSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="120" height="120" rx="8" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Site LECHFELD</text>
  <circle cx="55" cy="75" r="10" fill="#c9d1d9"/>
  <text x="55" y="78" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">DC</text>
  <circle cx="105" cy="75" r="10" fill="#c9d1d9"/>
  <text x="105" y="78" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">DC</text>
  <rect x="50" y="100" width="60" height="22" rx="4" fill="#ffcc00" opacity="0.15" stroke="#ffcc00" stroke-width="1"/>
  <text x="80" y="115" text-anchor="middle" fill="#ffcc00" font-size="8">192.168.10.0/24</text>

  <rect x="180" y="20" width="120" height="120" rx="8" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="240" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Site PÖCKING</text>
  <circle cx="215" cy="75" r="10" fill="#c9d1d9"/>
  <text x="215" y="78" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">DC</text>
  <circle cx="265" cy="75" r="10" fill="#c9d1d9"/>
  <text x="265" y="78" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">DC</text>
  <rect x="210" y="100" width="60" height="22" rx="4" fill="#ffcc00" opacity="0.15" stroke="#ffcc00" stroke-width="1"/>
  <text x="240" y="115" text-anchor="middle" fill="#ffcc00" font-size="8">192.168.20.0/24</text>

  <line x1="140" y1="80" x2="180" y2="80" stroke="#8b949e" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="160" y="72" text-anchor="middle" fill="#8b949e" font-size="9">WAN</text>

  <text x="160" y="160" text-anchor="middle" fill="#c9d1d9" font-size="10">Ein Client in Lechfeld soll den lokalen DC bevorzugen.</text>
</svg>`;

const siteVsDomainSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="280" height="140" rx="8" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Domain its.bw (logisch)</text>

  <rect x="40" y="60" width="110" height="80" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="95" y="80" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Site A</text>
  <text x="95" y="100" text-anchor="middle" fill="#c9d1d9" font-size="8">physisches LAN</text>
  <text x="95" y="118" text-anchor="middle" fill="#c9d1d9" font-size="8">DCs, Clients</text>

  <rect x="170" y="60" width="110" height="80" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="225" y="80" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Site B</text>
  <text x="225" y="100" text-anchor="middle" fill="#c9d1d9" font-size="8">physisches LAN</text>
  <text x="225" y="118" text-anchor="middle" fill="#c9d1d9" font-size="8">DCs, Clients</text>

  <text x="160" y="156" text-anchor="middle" fill="#8b949e" font-size="9">Eine Domain kann mehrere Sites umfassen.</text>
</svg>`;

const subnetToSiteSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="110" width="60" height="40" rx="4" fill="#0d1117" stroke="#c9d1d9" stroke-width="1"/>
  <text x="50" y="125" text-anchor="middle" fill="#c9d1d9" font-size="8">Client</text>
  <text x="50" y="140" text-anchor="middle" fill="#c9d1d9" font-size="8">192.168.10.55</text>

  <line x1="80" y1="130" x2="110" y2="130" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="110" y="105" width="80" height="50" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="150" y="125" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">192.168.10.0/24</text>
  <text x="150" y="142" text-anchor="middle" fill="#c9d1d9" font-size="8">Subnetz</text>

  <line x1="190" y1="130" x2="220" y2="130" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="220" y="105" width="80" height="50" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="260" y="125" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">Site LECHFELD</text>
  <text x="260" y="142" text-anchor="middle" fill="#c9d1d9" font-size="8">bevorzugter DC</text>

  <text x="160" y="60" text-anchor="middle" fill="#c9d1d9" font-size="10">IP → passendes Subnetz → zugeordnete Site → lokaler DC</text>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const intrasiteSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="20" width="200" height="120" rx="8" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Site LECHFELD</text>

  <circle cx="110" cy="90" r="14" fill="#c9d1d9"/>
  <text x="110" y="94" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC01</text>
  <circle cx="160" cy="90" r="14" fill="#c9d1d9"/>
  <text x="160" y="94" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC02</text>
  <circle cx="210" cy="90" r="14" fill="#c9d1d9"/>
  <text x="210" y="94" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC03</text>

  <line x1="124" y1="90" x2="146" y2="90" stroke="#8b949e" stroke-width="2"/>
  <line x1="174" y1="90" x2="196" y2="90" stroke="#8b949e" stroke-width="2"/>

  <text x="160" y="130" text-anchor="middle" fill="#8b949e" font-size="9">schnelles LAN</text>
  <text x="160" y="160" text-anchor="middle" fill="#c9d1d9" font-size="10">Intrasite = Replikation innerhalb einer Site</text>
</svg>`;

const intersiteSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="20" width="110" height="100" rx="8" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Site LECHFELD</text>
  <circle cx="70" cy="75" r="10" fill="#c9d1d9"/>
  <text x="70" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">DC</text>
  <circle cx="100" cy="75" r="10" fill="#c9d1d9"/>
  <text x="100" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">DC</text>

  <rect x="180" y="20" width="110" height="100" rx="8" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">Site PÖCKING</text>
  <circle cx="220" cy="75" r="10" fill="#c9d1d9"/>
  <text x="220" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">DC</text>
  <circle cx="250" cy="75" r="10" fill="#c9d1d9"/>
  <text x="250" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">DC</text>

  <line x1="140" y1="70" x2="180" y2="70" stroke="#8b949e" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arrow)"/>
  <text x="160" y="62" text-anchor="middle" fill="#8b949e" font-size="8">WAN</text>

  <text x="160" y="145" text-anchor="middle" fill="#c9d1d9" font-size="10">Intersite = Replikation zwischen Sites</text>
  <text x="160" y="162" text-anchor="middle" fill="#8b949e" font-size="9">typischerweise bandbreiten-/latenzbewusst</text>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const bridgeheadSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="20" width="110" height="100" rx="8" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Site A</text>
  <circle cx="65" cy="75" r="10" fill="#c9d1d9"/>
  <text x="65" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">DC1</text>
  <circle cx="105" cy="75" r="10" fill="#00f0ff" stroke="#c9d1d9" stroke-width="1.5"/>
  <text x="105" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">BH</text>

  <rect x="180" y="20" width="110" height="100" rx="8" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">Site B</text>
  <circle cx="215" cy="75" r="10" fill="#ffcc00" stroke="#c9d1d9" stroke-width="1.5"/>
  <text x="215" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">BH</text>
  <circle cx="255" cy="75" r="10" fill="#c9d1d9"/>
  <text x="255" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">DC2</text>

  <line x1="115" y1="75" x2="205" y2="75" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="160" y="68" text-anchor="middle" fill="#8b949e" font-size="8">WAN</text>

  <text x="160" y="145" text-anchor="middle" fill="#c9d1d9" font-size="10">Bridgehead = Replikations-Ansprechpartner zwischen Sites</text>
  <text x="160" y="162" text-anchor="middle" fill="#8b949e" font-size="9">Danach lokale Verteilung innerhalb der Site</text>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

export function buildAdReplicationSitesLesson() {
  const explanations = [
    explanation('ad-repl-sites-intro-classic', 'Das NEXUS-Szenario: Zwei Standorte, eine Domain', 'classic', [
      { type: 'text', content: 'NEXUS betreibt zwei Standorte: Lechfeld und Pöcking. Beide gehören zur selben Active-Directory-Domäne. Ein Client in Lechfeld soll aber nicht unnötig über eine WAN-Verbindung einen Domain Controller in Pöcking verwenden.' },
      { type: 'diagram', content: nexusScenarioSvg },
      { type: 'text', content: 'AD Sites und Subnetze helfen, Clients bevorzugt lokale Ressourcen zuzuweisen. Sie beschreiben die physische Netzwerktopologie, nicht die logische Domänenstruktur.' },
      { type: 'question', question: 'Warum verwendet NEXUS AD Sites und Subnetze?', options: ['Um zwei separate Domains für Lechfeld und Pöcking zu schaffen', 'Um Clients bevorzugt lokale DCs zuzuweisen und WAN-Verkehr zu vermeiden', 'Um OUs an geografische Orte zu binden', 'Um den DNS-Namensraum aufzuteilen'], correct: 1, explanation: 'Sites und Subnetze steuern die physische Nähe zu Diensten wie DCs, ohne die logische Domänenstruktur zu verändern.' },
    ]),
    explanation('ad-repl-sites-definition-classic', 'Was ist eine AD Site?', 'classic', [
      { type: 'text', content: 'Eine AD Site beschreibt einen Bereich des physischen Netzwerks, dessen Systeme über schnelle und zuverlässige Netzwerkverbindungen miteinander verbunden sind. Typisch sind Gebäude, Standorte oder Campus-Netze.' },
      { type: 'text', content: 'Wichtig ist dabei nicht nur der geografische Ort, sondern vor allem die Netzwerktopologie und die Konnektivität. Eine Site ist also eine physische Netzwerkstruktur, keine logische Verwaltungseinheit.' },
      { type: 'question', question: 'Was beschreibt eine AD Site am besten?', options: ['Eine Unterdomäne innerhalb einer Domäne', 'Einen Bereich des physischen Netzwerks mit schnellen, zuverlässigen Verbindungen', 'Eine OU für Benutzer eines Standorts', 'Einen Teil des DNS-Namensraums'], correct: 1, explanation: 'Eine Site ist eine physische Netzwerkstruktur, keine Domain, OU oder DNS-Einheit.' },
    ]),
    explanation('ad-repl-sites-vs-domain-classic', 'Site ≠ Domain', 'classic', [
      { type: 'text', content: 'Eine Domain ist eine logische Verwaltungs- und Identitätsstruktur. Eine Site ist eine physische Netzwerkstruktur. Diese beiden Dinge lösen unterschiedliche Probleme und dürfen nicht 1:1 gleichgesetzt werden.' },
      { type: 'diagram', content: siteVsDomainSvg },
      { type: 'text', content: 'Eine Domain kann mehrere Sites umfassen. Umgekehrt kann eine Site auch Systeme aus unterschiedlichen Domains enthalten, wenn diese physisch am selben Ort liegen.' },
      { type: 'question', question: 'Welche Aussage zu Sites und Domains stimmt?', options: ['Eine Site ist immer gleich einer Domain', 'Eine Domain kann mehrere Sites umfassen', 'Jede Site benötigt eine eigene Domain', 'Sites sind logische Verwaltungseinheiten wie Domains'], correct: 1, explanation: 'Domänen sind logisch, Sites sind physisch. Eine Domain kann viele Sites haben.' },
    ]),
    explanation('ad-repl-sites-vs-ou-classic', 'Site ≠ OU', 'classic', [
      { type: 'text', content: 'Eine OU (Organizational Unit) ordnet AD-Objekte logisch oder administrativ an, beispielsweise nach Abteilungen. Eine Site ordnet dagegen Netzwerkstandorte und Subnetze.' },
      { type: 'text', content: 'Ein Benutzer wird nicht einfach „in eine Site verschoben“ wie in eine OU. Die Site-Zuordnung ergibt sich aus dem Netzwerkstandort bzw. dem Subnetz des Clients oder Servers.' },
      { type: 'question', question: 'Was ist der Unterschied zwischen OU und Site?', options: ['Eine OU ordnet Objekte administrativ, eine Site ordnet Netzwerkstandorte', 'Eine OU ist eine physische Netzwerkstruktur', 'Eine Site ist eine Art OU mit geografischer Sortierung', 'Es gibt keinen Unterschied'], correct: 0, explanation: 'OUs dienen der administrativen Organisation, Sites der physischen Netzwerkzuordnung.' },
    ]),
    explanation('ad-repl-sites-vs-namespace-classic', 'Site ≠ Namensraum', 'classic', [
      { type: 'text', content: 'Sites sind nicht Teil des AD-DNS-Namensraums. Die Domain its.bw kann die Site „Lechfeld“ enthalten, ohne dass daraus automatisch der DNS-Name lechfeld.its.bw entsteht.' },
      { type: 'text', content: 'Der DNS-Namensraum wird durch Domänen, Subdomänen und Delegierungen gebildet. Sites dienen der physischen Struktur und beeinflussen nicht direkt die DNS-Namen.' },
      { type: 'question', question: 'Ist die Site „Lechfeld“ Teil des DNS-Namensraums its.bw?', options: ['Ja, sie erscheint automatisch als lechfeld.its.bw', 'Nein, Sites sind nicht Teil des DNS-Namensraums', 'Ja, aber nur, wenn ein Trust eingerichtet wurde', 'Nur innerhalb einer Subdomäne'], correct: 1, explanation: 'Sites sind physische Netzwerkstrukturen und gehören nicht automatisch zum DNS-Namensraum.' },
    ]),
    explanation('ad-repl-sites-subnet-classic', 'Subnetze', 'classic', [
      { type: 'text', content: 'Eine Site enthält oder repräsentiert typischerweise ein oder mehrere IP-Subnetze. Beispiel: Die Site LECHFELD kann die Netze 192.168.10.0/24 und 192.168.11.0/24 umfassen, während PÖCKING das Netz 192.168.20.0/24 verwendet.' },
      { type: 'text', content: 'Subnetze sind also der technische Schlüssel, um Clients und Server einer Site zuzuordnen. Sie verknüpfen die physische Netzwerktopologie mit der logischen AD-Struktur.' },
      { type: 'question', question: 'Wozu dienen Subnetze im Site-Kontext?', options: ['Um neue Domains anzulegen', 'Um Clients und DCs einer Site zuzuordnen', 'Um OUs zu ersetzen', 'Um DNS-Zonen zu löschen'], correct: 1, explanation: 'Subnetze ordnen IP-Geräte einer Site zu, sodass AD bevorzugt lokale Dienste wählen kann.' },
    ]),
    explanation('ad-repl-sites-subnet-to-site-classic', 'Subnetz → Site → DC', 'classic', [
      { type: 'text', content: 'Die Site-Zuordnung funktioniert konzeptionell als Kette: Die IP-Adresse des Clients führt zu einem passenden Subnetz. Das Subnetz ist einer Site zugeordnet. Für diese Site kennt AD bevorzugte Domain Controller und andere Dienste.' },
      { type: 'diagram', content: subnetToSiteSvg },
      { type: 'text', content: 'Dieses Modell hilft, Verkehr lokal zu halten, Latenz zu reduzieren und WAN-Bandbreite zu schonen.' },
      { type: 'question', question: 'Wie findet ein Client konzeptionell seine bevorzugte Site?', options: ['Über den Computernamen im DNS', 'IP-Adresse → passendes Subnetz → zugeordnete Site', 'Durch Verschieben in eine OU', 'Durch manuelle Auswahl beim Anmelden'], correct: 1, explanation: 'IP-Adresse, Subnetz und Site-Zuordnung bilden die konzeptionelle Kette.' },
    ]),
    explanation('ad-repl-sites-dc-selection-classic', 'Lokale DC-Auswahl', 'classic', [
      { type: 'text', content: 'AD nutzt Site- und Subnetzinformationen, um Clients bevorzugt passende, lokale Domain Controller zuzuweisen. Das bedeutet nicht, dass ein Client immer ausschließlich den nächsten DC verwendet – bei Ausfällen oder bestimmten Bedingungen kann auch ein anderer DC genutzt werden.' },
      { type: 'text', content: 'Die bevorzugte lokale Auswahl reduziert Latenz, WAN-Verkehr und beschleunigt die Authentifizierung. Sie ist ein Planungsprinzip, keine absolute Garantie.' },
      { type: 'question', question: 'Warum soll ein Client nach Möglichkeit einen lokalen DC verwenden?', options: ['Weil Sites Domains ersetzen', 'Weniger Latenz, weniger WAN-Verkehr, schnellere Authentifizierung', 'Weil globale Kataloge nur lokal existieren', 'Weil Remotedesktop nur lokal funktioniert'], correct: 1, explanation: 'Lokale DCs reduzieren Latenz, WAN-Last und beschleunigen die Authentifizierung.' },
    ]),
    explanation('ad-repl-sites-aware-services-classic', 'Site-Aware Services', 'classic', [
      { type: 'text', content: 'Auch andere AD-nahe Dienste können Site- und Subnetzinformationen nutzen, um möglichst nahegelegene Dienstinstanzen auszuwählen. Das Prinzip ist nützlich, aber hier geht es nicht darum, bestimmte Produkte oder Details auswendig zu lernen.' },
      { type: 'text', content: 'Wichtig ist das Konzept: Wenn ein Dienst „site-aware“ ist, achtet er auf die physische Nähe des Clients und wählt bevorzugt lokale Ressourcen.' },
      { type: 'question', question: 'Was bedeutet „site-aware“ im AD-Kontext?', options: ['Der Dienst ignoriert die physische Topologie', 'Der Dienst berücksichtigt Site-/Subnetzinformationen für die Auswahl naher Instanzen', 'Der Dienst ersetzt DNS', 'Der Dienst konfiguriert Sites automatisch'], correct: 1, explanation: 'Site-aware Services bevorzugen nähere Instanzen basierend auf AD-Site-Informationen.' },
    ]),
    explanation('ad-repl-sites-intrasite-classic', 'Intrasite-Replikation', 'classic', [
      { type: 'text', content: 'Intrasite-Replikation findet zwischen Domain Controllern statt, die derselben Site angehören. Der typische Kontext ist ein schnelles LAN, weshalb Änderungen relativ zeitnah unter den lokalen DCs verteilt werden können.' },
      { type: 'diagram', content: intrasiteSvg },
      { type: 'text', content: 'Innerhalb einer Site steht die Aktualität oft im Vordergrund, weil Bandbreite und Latenz normalerweise keine großen Einschränkungen sind.' },
      { type: 'question', question: 'Was kennzeichnet Intrasite-Replikation?', options: ['Replikation zwischen unterschiedlichen Sites', 'Replikation innerhalb derselben Site über typischerweise schnelles LAN', 'Replikation nur über WAN', 'Replikation ohne jegliche Planung'], correct: 1, explanation: 'Intrasite bedeutet innerhalb einer Site, typischerweise mit schnellem LAN.' },
    ]),
    explanation('ad-repl-sites-intersite-classic', 'Intersite-Replikation', 'classic', [
      { type: 'text', content: 'Intersite-Replikation findet zwischen Domain Controllern unterschiedlicher Sites statt. Der typische Kontext ist ein WAN, das höhere Latenz, geringere Bandbreite oder höhere Kosten haben kann.' },
      { type: 'diagram', content: intersiteSvg },
      { type: 'text', content: 'Daher wird Intersite-Replikation stärker geplant und auf Bandbreitenbedingungen optimiert. Konkrete Zeitwerte oder Mechanismen sind versions- und umgebungsabhängig; das Grundprinzip ist entscheidend.' },
      { type: 'question', question: 'Was ist typisch für Intersite-Replikation?', options: ['Sie findet nur innerhalb einer Site statt', 'Sie läuft typischerweise über WAN und wird stärker bandbreitenbewusst geplant', 'Sie überträgt immer die gesamte NTDS.DIT', 'Sie ignoriert Sites vollständig'], correct: 1, explanation: 'Intersite-Replikation verbindet Sites, meist über WAN, und erfordert mehr Planung.' },
    ]),
    explanation('ad-repl-sites-lan-wan-classic', 'LAN vs. WAN im Replikationskontext', 'classic', [
      { type: 'text', content: 'Replikation ist nicht nur ein AD-Thema, sondern auch ein Netzwerkdesign-Thema. WAN-Verbindungen können höhere Latenz, geringere Bandbreite, höhere Kosten und eingeschränkte Verfügbarkeit haben. Genau deshalb unterscheidet AD zwischen Sites.' },
      { type: 'text', content: 'Intrasite = typischerweise schnelle lokale Verbindung, Fokus auf Aktualität. Intersite = typischerweise WAN, Fokus auf geplante, bandbreitenoptimierte Verteilung.' },
      { type: 'question', question: 'Warum werden WAN-Verbindungen bei Replikation besonders beachtet?', options: ['Weil sie immer schneller als LAN sind', 'Wegen höherer Latenz, geringerer Bandbreite und höherer Kosten', 'Weil AD nur über WAN repliziert', 'Weil WAN automatisch NTDS.DIT kopiert'], correct: 1, explanation: 'WAN ist oft langsamer, teurer und latenzbehafteter, weshalb Intersite-Replikation geplant wird.' },
    ]),
    explanation('ad-repl-sites-bandwidth-classic', 'Aktualität vs. Bandbreite', 'classic', [
      { type: 'text', content: 'AD muss abwägen: Wie aktuell müssen die Daten sein, und wie viel Netzwerkkapazität steht zur Verfügung? Innerhalb einer Site ist Aktualität wichtiger, weil das LAN die schnelle Verteilung erlaubt. Zwischen Sites spielt die Bandbreitennutzung eine größere Rolle.' },
      { type: 'text', content: 'Konkrete Intervalle oder Kostenwerte sind abhängig von der Version und der Konfiguration. Es geht um das Verständnis des grundlegenden Zielkonflikts.' },
      { type: 'question', question: 'Womit muss AD bei der Replikation primär abwägen?', options: ['Nur mit der schnellsten Verbindung', 'Aktualität der Daten vs. verfügbare Bandbreite/Netzwerkkosten', 'Nur mit der Uhrzeit', 'Mit der Anzahl der Benutzer pro OU'], correct: 1, explanation: 'Der Kernkonflikt ist Aktualität gegen Bandbreite und Netzwerkkosten.' },
    ]),
    explanation('ad-repl-sites-bridgehead-classic', 'Bridgehead Server – Grundidee', 'classic', [
      { type: 'text', content: 'Ein Bridgehead Server ist ein Domain Controller, der als Replikations-Ansprechpartner für standortübergreifende Kommunikation dient. Er nimmt Änderungen von anderen Sites entgegen und verteilt sie anschließend innerhalb seiner eigenen Site.' },
      { type: 'diagram', content: bridgeheadSvg },
      { type: 'text', content: 'Für Thema 23 reicht die Grundidee: Bridgehead Server vermitteln Replikation zwischen Sites. Manuelle Konfiguration, KCC-Details und Ausfallszenarien folgen später.' },
      { type: 'question', question: 'Was ist die Grundaufgabe eines Bridgehead Servers?', options: ['Er ersetzt alle anderen DCs in einer Site', 'Er vermittelt standortübergreifende Replikation und verteilt dann lokal', 'Er erstellt neue Subnetze', 'Er verwaltet DNS-Namensräume'], correct: 1, explanation: 'Bridgehead Server sind Replikationsknoten zwischen Sites, die Änderungen dann lokal weitergeben.' },
    ]),
    explanation('ad-repl-sites-troubleshooting-classic', 'Erste Verdachtsrichtung', 'classic', [
      { type: 'text', content: 'Wenn ein Client in Lechfeld regelmäßig einen Domain Controller in Pöcking verwendet, deutet das darauf hin, dass die Site- oder Subnetzzuordnung nicht passt. In diesem Thema vertiefen wir keine KCC-Details, sondern prüfen zuerst die Zuordnung.' },
      { type: 'text', content: 'Eine fehlende oder falsche Subnetzdefinition kann dazu führen, dass AD den Client einer anderen Site zuordnet und somit einen entfernten DC bevorzugt.' },
      { type: 'question', question: 'Ein Client in Lechfeld verwendet regelmäßig einen DC in Pöcking. Was prüfst du zuerst?', options: ['Site-/Subnetzzuordnung', 'Ob die Firewall NTDS.DIT blockiert', 'Ob der Client neu installiert werden muss', 'Ob die Domäne getrennt werden muss'], correct: 0, explanation: 'Eine falsche Site- oder Subnetzzuordnung ist die wahrscheinlichste Ursache für ungünstige DC-Auswahl.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-repl-sites-concept-matching',
      type: 'matching',
      question: 'Ordne jedem Begriff seine Bedeutung zu.',
      pairs: [
        { left: 'Site', right: 'physische Netzwerkstruktur mit schnellen Verbindungen' },
        { left: 'Domain', right: 'logische Verwaltungs- und Identitätsstruktur' },
        { left: 'OU', right: 'logische/administrative Organisation von AD-Objekten' },
        { left: 'Subnet', right: 'Netzwerkbereich für die Site-Zuordnung' },
      ],
      explanation: 'Site, Domain, OU und Subnetz haben klar unterschiedliche Rollen in AD.',
    },
    {
      id: 'ad-repl-sites-definition-select',
      type: 'select-best',
      question: 'Was beschreibt eine AD Site am besten?',
      options: ['Eine Unterdomäne im DNS', 'Einen Bereich des physischen Netzwerks mit schnellen, zuverlässigen Verbindungen', 'Eine OU für einen Standort', 'Einen Teil des AD-Schemas'],
      correct: 1,
      explanation: 'Eine Site ist eine physische Netzwerkstruktur, keine logische Einheit wie Domain oder OU.',
    },
    {
      id: 'ad-repl-sites-vs-domain-misconception',
      type: 'select-best',
      question: '„Eine AD Site ist eine Unterdomäne der Domäne." Stimmt das?',
      options: ['Ja, jede Site wird zu einer Subdomäne', 'Nein, Site ist physische Netzwerkstruktur, Domain ist logische Verwaltungsstruktur', 'Ja, wenn sie im DNS registriert ist', 'Nein, Site und Domain sind identisch'],
      correct: 1,
      explanation: 'Sites und Domains lösen unterschiedliche Probleme und sind nicht 1:1 verknüpft.',
    },
    {
      id: 'ad-repl-sites-vs-ou-misconception',
      type: 'select-best',
      question: '„Ein Benutzer wird einer Site zugeordnet, indem man ihn wie in eine OU verschiebt." Stimmt das?',
      options: ['Ja, ADUC erlaubt das Verschieben in eine Site', 'Nein, Site-Zuordnung ergibt sich aus Netzwerk/Subnetz', 'Ja, aber nur für Computerkonten', 'Nein, Sites existieren nur für Gruppen'],
      correct: 1,
      explanation: 'Site-Zuordnung erfolgt über das Subnetz des Clients/DCs, nicht durch OU-Verschiebung.',
    },
    {
      id: 'ad-repl-sites-vs-namespace-misconception',
      type: 'select-best',
      question: 'Die Domäne heißt its.bw und es gibt eine Site „Lechfeld". Was folgt daraus für den DNS-Namensraum?',
      options: ['Es gibt automatisch die Subdomäne lechfeld.its.bw', 'Die Site ist nicht automatisch Teil des DNS-Namensraums', 'Der DNS-Namensraum wird aufgeteilt', 'Jede Site benötigt eine eigene DNS-Zone'],
      correct: 1,
      explanation: 'Sites gehören nicht automatisch zum DNS-Namensraum; DNS wird durch Domänenstruktur gebildet.',
    },
    {
      id: 'ad-repl-sites-subnet-to-site-matching',
      type: 'matching',
      question: 'Ordne die IP-Adressen basierend auf den Subnetzen der passenden Site zu.',
      pairs: [
        { left: '192.168.10.55', right: 'Site LECHFELD' },
        { left: '192.168.20.10', right: 'Site PÖCKING' },
        { left: '192.168.10.200', right: 'Site LECHFELD' },
      ],
      explanation: 'Über die Subnetzzuordnung ermittelt AD die bevorzugte Site des Clients.',
    },
    {
      id: 'ad-repl-sites-local-dc-scenario',
      type: 'select-best',
      question: 'Ein Client in Lechfeld soll sich anmelden. Welche DC-Wahl ist bevorzugt?',
      options: ['Ein DC in Pöcking über WAN', 'Ein DC in Lechfeld im selben LAN', 'Ein RODC in einer fremden Site', 'Ein beliebiger GC weltweit'],
      correct: 1,
      explanation: 'AD wählt bevorzugt lokale DCs, um Latenz und WAN-Verkehr zu minimieren.',
    },
    {
      id: 'ad-repl-sites-intra-inter-matching',
      type: 'matching',
      question: 'Ordne die Szenarien Intrasite- oder Intersite-Replikation zu.',
      pairs: [
        { left: 'DC01 und DC02 in Lechfeld', right: 'Intrasite' },
        { left: 'DC01 in Lechfeld und DC03 in Pöcking', right: 'Intersite' },
        { left: 'Zwei DCs im selben Gebäude', right: 'Intrasite' },
        { left: 'Replikation über WAN zwischen zwei Standorten', right: 'Intersite' },
      ],
      explanation: 'Intrasite = innerhalb einer Site, Intersite = zwischen Sites.',
    },
    {
      id: 'ad-repl-sites-lan-wan-select',
      type: 'select-best',
      question: 'Warum wird Intersite-Replikation stärker geplant als Intrasite-Replikation?',
      options: ['Weil AD bei WAN-Verbindungen prinzipiell langsamer repliziert', 'Weil WAN meist höhere Latenz, geringere Bandbreite und höhere Kosten hat', 'Weil Intrasite nie funktioniert', 'Weil Subnetze nur im WAN existieren'],
      correct: 1,
      explanation: 'WAN-Verbindungen sind oft begrenzter, deshalb wird Intersite-Replikation geplant und optimiert.',
    },
    {
      id: 'ad-repl-sites-bandwidth-tradeoff',
      type: 'select-best',
      question: 'AD muss bei der Replikation Aktualität und Bandbreite gegeneinander abwägen. Wo steht typischerweise die Aktualität im Vordergrund?',
      options: ['Bei Intersite-Replikation über WAN', 'Bei Intrasite-Replikation im schnellen LAN', 'Nur bei Schema-Replikation', 'Nur bei der Bridgehead-Konfiguration'],
      correct: 1,
      explanation: 'Im LAN ist Bandbreite meist ausreichend, daher kann Aktualität priorisiert werden.',
    },
    {
      id: 'ad-repl-sites-bridgehead-select',
      type: 'select-best',
      question: 'Was ist die Grundidee eines Bridgehead Servers?',
      options: ['Er löscht veraltete Subnetze', 'Er vermittelt standortübergreifende Replikation und gibt sie lokal weiter', 'Er ersetzt den Schema Master', 'Er erstellt automatisch neue Domains'],
      correct: 1,
      explanation: 'Ein Bridgehead Server ist der Replikations-Ansprechpartner zwischen Sites.',
    },
    {
      id: 'ad-repl-sites-same-domain-transfer',
      type: 'select-best',
      question: 'its.bw besitzt Site A und Site B. Sind dafür zwei Domains erforderlich?',
      options: ['Ja, jede Site braucht eine eigene Domain', 'Nein, eine Domain kann mehrere Sites umfassen', 'Ja, aber nur bei WAN-Verbindungen', 'Nein, Sites und Domains sind identisch'],
      correct: 1,
      explanation: 'Eine Domain kann beliebig viele Sites umfassen, solange die physische Topologie so geplant ist.',
    },
    {
      id: 'ad-repl-sites-wan-transfer',
      type: 'select-best',
      question: 'Zwei Standorte sind nur über ein langsames WAN verbunden. Was ist sinnvoll?',
      options: ['Alle DCs dauerhaft direkt miteinander replizieren lassen', 'Intersite-Replikation bandbreitenbewusst planen', 'Beide Standorte in dieselbe Site packen', 'Keine Replikation zwischen den Standorten zulassen'],
      correct: 1,
      explanation: 'Langsames WAN erfordert eine geplante, bandbreitenbewusste Intersite-Replikation.',
    },
    {
      id: 'ad-repl-sites-troubleshooting-scenario',
      type: 'select-best',
      question: 'Ein Client in Lechfeld verwendet regelmäßig einen DC in Pöcking. Was prüfst du zuerst?',
      options: ['Site-/Subnetzzuordnung', 'Ob das Schema erweitert werden muss', 'Ob die Client-Festplatte voll ist', 'Ob ein externer Trust fehlt'],
      correct: 0,
      explanation: 'Eine falsche Site-/Subnetzzuordnung führt dazu, dass AD den Client falsch lokalisiert.',
    },
    {
      id: 'ad-repl-sites-site-aware-select',
      type: 'select-best',
      question: 'Was bedeutet „site-aware“ für einen Dienst?',
      options: ['Der Dienst ignoriert Sites', 'Der Dienst bevorzugt nahegelegene Instanzen basierend auf Site-Informationen', 'Der Dienst konfiguriert automatisch Subnetze', 'Der Dienst ersetzt Active Directory'],
      correct: 1,
      explanation: 'Site-aware Services nutzen AD-Site-Informationen, um nahe Instanzen zu bevorzugen.',
    },
    {
      id: 'ad-repl-sites-ordering',
      type: 'ordering',
      question: 'Bringe die konzeptionellen Schritte in die richtige Reihenfolge, wie AD eine bevorzugte Site ermittelt.',
      items: ['IP-Adresse des Clients', 'passendes Subnetz ermitteln', 'zugeordnete Site finden', 'lokalen DC bevorzugen'],
      correctOrder: [0, 1, 2, 3],
      explanation: 'Vom Client ausgehend führt IP → Subnetz → Site → bevorzugter lokaler DC.',
    },
  ];

  const quiz = [
    { question: 'Was ist eine AD Site?', options: ['Eine Unterdomäne', 'Eine physische Netzwerkstruktur mit schnellen Verbindungen', 'Eine OU', 'Eine DNS-Zone'], correct: 1, explanation: 'Sites beschreiben die physische Netzwerktopologie.' },
    { question: 'Welche Aussage zu Sites und Domains stimmt?', options: ['Jede Site braucht eine eigene Domain', 'Eine Domain kann mehrere Sites umfassen', 'Sites sind identisch mit Domains', 'Eine Site ist ein DNS-Subnamespace'], correct: 1, explanation: 'Domain = logisch, Site = physisch; eine Domain kann viele Sites haben.' },
    { question: 'Wozu dienen Subnetze im Site-Kontext?', options: ['Zum Ersetzen von OUs', 'Zur Zuordnung von Clients und DCs zu einer Site', 'Zum Erstellen neuer Domains', 'Zum Löschen alter DCs'], correct: 1, explanation: 'Subnetze sind der technische Schlüssel für die Site-Zuordnung.' },
    { question: 'Was ist der Hauptvorteil einer lokalen DC-Auswahl?', options: ['Vermeidung von WAN-Verkehr und geringere Latenz', 'Keine Replikation mehr nötig', 'Jeder Client bekommt eine eigene Domain', 'Schemaänderungen entfallen'], correct: 0, explanation: 'Lokale DCs sparen WAN-Bandbreite und reduzieren die Latenz.' },
    { question: 'Was ist Intrasite-Replikation?', options: ['Replikation zwischen verschiedenen Sites', 'Replikation innerhalb derselben Site über typischerweise schnelles LAN', 'Replikation über das Internet', 'Replikation nur zwischen RODCs'], correct: 1, explanation: 'Intrasite = innerhalb einer Site.' },
    { question: 'Warum wird Intersite-Replikation stärker geplant?', options: ['Weil AD langsamer ist', 'Weil WAN meist Bandbreite, Latenz und Kosten begrenzt', 'Weil Intrasite nie funktioniert', 'Weil keine DCs in anderen Sites existieren dürfen'], correct: 1, explanation: 'Intersite-Replikation berücksichtigt WAN-Beschränkungen.' },
    { question: 'Was ist die Grundidee eines Bridgehead Servers?', options: ['Er löscht Sites', 'Er vermittelt Replikation zwischen Sites und verteilt sie lokal', 'Er verwaltet DNS', 'Er ersetzt einen DC'], correct: 1, explanation: 'Bridgehead Server sind Replikationsknoten zwischen Sites.' },
    { question: 'Ein Client in Lechfeld nutzt einen DC in Pöcking. Was prüfst du zuerst?', options: ['Site-/Subnetzzuordnung', 'Schemaänderungen', 'Festplattenplatz', 'Externe Trusts'], correct: 0, explanation: 'Falsche Site-/Subnetzzuordnung führt zu ungünstiger DC-Auswahl.' },
  ];

  const summary = [
    'Eine AD Site beschreibt einen Bereich des physischen Netzwerks mit schnellen, zuverlässigen Verbindungen.',
    'Sites sind nicht dasselbe wie Domains, OUs oder DNS-Namensräume.',
    'Eine Domain kann mehrere Sites umfassen; eine Site kann Systeme aus mehreren Domains enthalten.',
    'Subnetze ordnen Clients und DCs einer Site zu: IP-Adresse → Subnetz → Site → bevorzugter lokaler DC.',
    'Lokale DC-Auswahl reduziert Latenz, WAN-Verkehr und beschleunigt die Authentifizierung.',
    'Site-aware Services nutzen Site-Informationen, um nahegelegene Dienstinstanzen zu bevorzugen.',
    'Intrasite-Replikation findet innerhalb einer Site statt und nutzt typischerweise schnelles LAN.',
    'Intersite-Replikation verbindet Sites, typischerweise über WAN, und wird stärker geplant.',
    'AD wägt Aktualität gegen Bandbreite und Netzwerkkosten ab.',
    'Ein Bridgehead Server ist ein DC, der standortübergreifende Replikation vermittelt und Änderungen lokal weiterverteilt.',
    'Falls ein Client fremde DCs nutzt, prüft man zuerst die Site-/Subnetzzuordnung.',
  ];

  return { title: 'Sites, Subnetze & Intra-/Intersite-Replikation', explanations, exercises, quiz, summary };
}
