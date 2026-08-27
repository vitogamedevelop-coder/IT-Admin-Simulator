import { topicKey } from '../academyTopics.js';
import {
  decimalToBinaryOctet, prefixToSubnetMask, calculateJumpSize,
} from '../networking/ipv4Math.js';
import { decimalToIpv4Binary, ipv4BinaryToDecimal } from '../networking/numberSystems.js';

const EXAMPLE_IP = '192.168.10.25';

const IP_SVG = `<svg viewBox="0 0 400 130" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="200" y="22" text-anchor="middle" fill="#c9d1d9" font-size="12">IPv4-Adresse: 192.168.10.25</text><g stroke="#00f0ff" stroke-width="2" fill="none"><rect x="10" y="40" width="85" height="55" rx="6"/><rect x="110" y="40" width="85" height="55" rx="6"/><rect x="210" y="40" width="85" height="55" rx="6"/><rect x="310" y="40" width="85" height="55" rx="6"/></g><text x="52" y="75" text-anchor="middle" fill="#c9d1d9" font-size="18" font-weight="bold">192</text><text x="152" y="75" text-anchor="middle" fill="#c9d1d9" font-size="18" font-weight="bold">168</text><text x="252" y="75" text-anchor="middle" fill="#c9d1d9" font-size="18" font-weight="bold">10</text><text x="352" y="75" text-anchor="middle" fill="#c9d1d9" font-size="18" font-weight="bold">25</text><text x="95" y="115" text-anchor="middle" fill="#8b949e" font-size="10">1. Oktett</text><text x="195" y="115" text-anchor="middle" fill="#8b949e" font-size="10">2. Oktett</text><text x="295" y="115" text-anchor="middle" fill="#8b949e" font-size="10">3. Oktett</text><text x="395" y="115" text-anchor="middle" fill="#8b949e" font-size="10">4. Oktett</text></svg>`;

const IPV6_SVG = `<svg viewBox="0 0 440 125" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="220" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12">IPv6 vollständig: acht Blöcke × 16 Bit = 128 Bit</text><g fill="#00f0ff" fill-opacity="0.12" stroke="#00f0ff"><rect x="8" y="38" width="48" height="34" rx="4"/><rect x="62" y="38" width="48" height="34" rx="4"/><rect x="116" y="38" width="48" height="34" rx="4"/><rect x="170" y="38" width="48" height="34" rx="4"/><rect x="224" y="38" width="48" height="34" rx="4"/><rect x="278" y="38" width="48" height="34" rx="4"/><rect x="332" y="38" width="48" height="34" rx="4"/><rect x="386" y="38" width="48" height="34" rx="4"/></g><g fill="#c9d1d9" font-size="9" text-anchor="middle"><text x="32" y="59">2001</text><text x="86" y="59">0db8</text><text x="140" y="59">0000</text><text x="194" y="59">0000</text><text x="248" y="59">0000</text><text x="302" y="59">ff00</text><text x="356" y="59">0042</text><text x="410" y="59">8329</text></g><text x="220" y="98" text-anchor="middle" fill="#00ff66" font-size="11">Hexadezimal: 0–9 und A–F · 4 Hexzeichen pro Block</text><text x="220" y="116" text-anchor="middle" fill="#8b949e" font-size="10">Komprimierungsregeln werden hier noch nicht vertieft.</text></svg>`;
const MASK_SVG = `<svg viewBox="0 0 430 135" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="215" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12">Dieselbe Subnetzmaske in drei Darstellungen</text><text x="20" y="52" fill="#8b949e" font-size="10">Binär</text><text x="110" y="52" fill="#00f0ff" font-size="11">11111111.11111111.11111100.00000000</text><text x="20" y="82" fill="#8b949e" font-size="10">Dezimal</text><text x="110" y="82" fill="#00ff66" font-size="12">255.255.252.0</text><text x="20" y="112" fill="#8b949e" font-size="10">CIDR</text><text x="110" y="112" fill="#ffcc00" font-size="13">/22 = 22 zusammenhängende Netzbits</text></svg>`;
const ADDRESS_ROLE_SVG = `<svg viewBox="0 0 430 125" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="215" y="18" text-anchor="middle" fill="#c9d1d9" font-size="11">Beispiel 192.168.1.0/24</text><rect x="15" y="38" width="82" height="45" rx="6" fill="#ffcc00" opacity="0.8"/><rect x="97" y="38" width="236" height="45" fill="#00ff66" opacity="0.35"/><rect x="333" y="38" width="82" height="45" rx="6" fill="#ff7b72" opacity="0.8"/><text x="56" y="58" text-anchor="middle" fill="#07111f" font-size="9">NETZ-ID</text><text x="56" y="72" text-anchor="middle" fill="#07111f" font-size="9">192.168.1.0</text><text x="215" y="58" text-anchor="middle" fill="#c9d1d9" font-size="9">HOSTADRESSEN</text><text x="215" y="72" text-anchor="middle" fill="#c9d1d9" font-size="9">192.168.1.1 – 192.168.1.254</text><text x="374" y="58" text-anchor="middle" fill="#07111f" font-size="9">BROADCAST</text><text x="374" y="72" text-anchor="middle" fill="#07111f" font-size="9">192.168.1.255</text><text x="215" y="108" text-anchor="middle" fill="#8b949e" font-size="10">Hostbits 0 → Netz-ID · dazwischen Hosts · Hostbits 1 → Broadcast</text></svg>`;
const PREFIX_SVG = `<svg viewBox="0 0 420 120" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="210" y="22" text-anchor="middle" fill="#c9d1d9" font-size="12">192.168.10.25/24 – Netzanteil orange, Hostanteil grau</text><g transform="translate(10,35)"><rect x="0" y="0" width="240" height="45" rx="4" fill="#00f0ff" fill-opacity="0.35" stroke="#00f0ff" stroke-width="2"/><rect x="240" y="0" width="80" height="45" rx="4" fill="#8b949e" fill-opacity="0.25" stroke="#8b949e" stroke-width="2"/><text x="120" y="28" text-anchor="middle" fill="#0a1628" font-size="13" font-weight="bold">24 Bit Netzanteil</text><text x="280" y="28" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">8 Bit Host</text></g><text x="210" y="105" text-anchor="middle" fill="#8b949e" font-size="11">/24 bedeutet: die ersten 24 Bit beschreiben das Netz.</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Was ist eine IPv4-Adresse?', 'classic', [
    { type: 'text', content: 'Eine IPv4-Adresse kennzeichnet eine Netzwerkschnittstelle innerhalb eines IP-Netzes. Ein Gerät kann mehrere Schnittstellen und damit mehrere Adressen haben; Adressen können sich auch ändern.' },
    { type: 'text', content: 'Für den Anfang reicht das Bild eines PCs mit einer Adresse. Merke dir aber: technisch gehört die Adresse zur Schnittstelle, nicht zwingend zum Gerät.' },
  ]));

  exps.push(explanation('ip-role-classic', 'IP-Adresse und MAC-Adresse', 'classic', [
    { type: 'text', content: 'Eine IP-Adresse ist eine logische Adresse auf OSI-Layer 3. Sie hilft, ein Ziel in einem IP-Netz zu erreichen und ermöglicht Weiterleitungsentscheidungen über Netzwerkgrenzen hinweg.' },
    { type: 'table', headers: ['Adresse', 'Ebene', 'Grundaufgabe'], rows: [
      ['MAC-Adresse', 'Layer 2', 'lokale Adressierung eines Frames auf dem konkreten Link'],
      ['IP-Adresse', 'Layer 3', 'logische und netzübergreifende Adressierung'],
    ] },
    { type: 'text', content: 'Ein System kann mehrere Netzwerkschnittstellen und mehrere IP-Adressen besitzen. Router verwenden IP-Informationen, um Daten zum logischen Ziel weiterzuleiten.' },
    { type: 'question', facet: 'ip-vs-mac', question: 'Warum benötigt ein Rechner eine IP-Adresse, obwohl er bereits eine MAC-Adresse besitzt?', options: ['IP ermöglicht logische und netzübergreifende Adressierung; MAC adressiert lokal auf Layer 2.', 'Beide Adressen erfüllen exakt dieselbe Aufgabe.', 'Eine IP-Adresse wird ausschließlich als Portnummer verwendet.'], correct: 0, explanation: 'MAC und IP gehören zu unterschiedlichen Ebenen und erfüllen unterschiedliche Adressierungsaufgaben.' },
  ]));

  exps.push(explanation('ip-versions-classic', 'IPv4 und IPv6', 'classic', [
    { type: 'table', headers: ['Version', 'Länge', 'Typische Darstellung'], rows: [
      ['IPv4', '32 Bit', 'vier dezimale Oktette in Punktnotation, z. B. 192.168.10.25'],
      ['IPv6', '128 Bit', 'acht Blöcke mit je vier Hexadezimalstellen in vollständiger Schreibweise'],
    ] },
    { type: 'diagram', content: IPV6_SVG },
    { type: 'text', content: 'IPv4 besitzt 2^32 mögliche Bitkombinationen, IPv6 2^128. Entscheidend ist nicht die ausgeschriebene riesige Zahl, sondern der Zusammenhang: mehr Bits ermöglichen einen wesentlich größeren möglichen Adressraum.' },
    { type: 'text', content: 'IPv4 wird für Menschen meist dezimal dargestellt, arbeitet darunter aber mit Bits. IPv6 nutzt Hexadezimalzeichen, weil jeweils vier Bits kompakt durch eine Hexadezimalstelle dargestellt werden können.' },
    { type: 'question', facet: 'ipv4-ipv6', question: 'Welche Zuordnung ist korrekt?', options: ['IPv4: 32 Bit und Dezimalpunktschreibweise; IPv6: 128 Bit und Hexadezimalblöcke', 'IPv4: 128 Bit; IPv6: 32 Bit', 'IPv4 und IPv6 besitzen beide vier 32-Bit-Blöcke'], correct: 0, explanation: 'IPv4 umfasst insgesamt 32 Bit. IPv6 umfasst 128 Bit und wird typischerweise hexadezimal dargestellt.' },
  ]));

  exps.push(explanation('structure-classic', 'Aufbau einer IPv4-Adresse', 'classic', [
    { type: 'text', content: 'Eine IPv4-Adresse hat 32 Bit, aufgeteilt in vier Oktette. Jedes Oktett hat acht Bit und wird in der Punktnotation dezimal geschrieben.' },
    { type: 'diagram', content: IP_SVG },
    { type: 'text', content: `Beispiel ${EXAMPLE_IP}: vier Oktette mit je acht Bit. Zusammen also 4 × 8 = 32 Bit.` },
    { type: 'text', content: `Als Binärzahl: ${EXAMPLE_IP.split('.').map(decimalToBinaryOctet).join('.')}` },
  ]));

  exps.push(explanation('network-host-classic', 'Netzanteil und Hostanteil', 'classic', [
    { type: 'text', content: 'Jede IPv4-Adresse teilt sich in Netzanteil und Hostanteil. Der Netzanteil beschreibt das gemeinsame Netz, der Hostanteil unterscheidet die Teilnehmer darin.' },
    { type: 'diagram', content: PREFIX_SVG },
    { type: 'text', content: 'Bei 192.168.10.25/24 sind die ersten 24 Bit der Netzanteil und die letzten 8 Bit der Hostanteil. /24 ist der CIDR-Präfix.' },
  ]));

  exps.push(explanation('mask-representations-classic', 'Subnetzmaske und CIDR', 'classic', [
    { type: 'text', content: 'Die Subnetzmaske trennt Netz- und Hostanteil. Zusammenhängende 1-Bits markieren den Netzanteil, die folgenden 0-Bits den Hostanteil. CIDR schreibt die Anzahl der Netzbits kompakt als Präfixlänge.' },
    { type: 'diagram', content: MASK_SVG },
    { type: 'question', facet: 'mask-cidr', question: 'Was bedeutet /22?', options: ['22 zusammenhängende Netzbits', '22 Hosts', '22 Oktette'], correct: 0, explanation: '/22 ist die Präfixlänge: Die ersten 22 Bit gehören zum Netzanteil.' },
  ]));

  exps.push(explanation('address-roles-classic', 'Netz-ID, Hosts und Broadcast', 'classic', [
    { type: 'text', content: 'Sind alle Hostbits 0, beschreibt die Adresse das Netz selbst: die Netz-ID. Sind alle Hostbits 1, ist es die Broadcastadresse dieses Netzes. Die normalen Hostadressen liegen dazwischen.' },
    { type: 'diagram', content: ADDRESS_ROLE_SVG },
    { type: 'text', content: 'Im dargestellten /24-Beispiel ist .0 die Netz-ID, .1 bis .254 sind Hostadressen und .255 ist der Broadcast. Bei anderen Präfixen liegen die Grenzen an anderen Stellen.' },
    { type: 'question', facet: 'address-role', question: 'Welche Rolle hat 192.168.1.255 im Netz 192.168.1.0/24?', options: ['Broadcastadresse', 'Netz-ID', 'normale Hostadresse'], correct: 0, explanation: 'Bei /24 sind im letzten Oktett alle Hostbits 1; damit ist .255 der Broadcast dieses Netzes.' },
  ]));

  exps.push(explanation('prefix-classic', 'CIDR-Präfix', 'classic', [
    { type: 'text', content: 'Der Präfix nach dem Schrägstrich sagt, wie viele Bits zum Netzanteil gehören. Er reicht von /0 bis /32. Je größer der Präfix, desto kleiner der Hostbereich.' },
    { type: 'list', title: 'Beispiele', items: [
      '/8 – erstes Oktett Netz, drei Oktette Host',
      '/16 – zwei Oktette Netz, zwei Oktette Host',
      '/24 – drei Oktette Netz, ein Oktett Host',
      '/30 – sehr kleiner Hostbereich, oft Punkt-zu-Punkt',
      '/32 – eine einzelne Adresse',
    ] },
  ]));

  exps.push(explanation('prefix-special-classic', 'Sonderfälle', 'classic', [
    { type: 'text', content: 'Einige Präfixe verdienen eine kurze Vertiefung, ohne dass sie Anfänger überfordern.' },
    { type: 'list', title: 'Wichtige Sonderfälle', items: [
      '/32 beschreibt genau eine einzelne Adresse.',
      '/31 kann bei Punkt-zu-Punkt-Verbindungen verwendet werden.',
      '/0 umfasst den gesamten IPv4-Adressraum und ist aus der Default-Route 0.0.0.0/0 bekannt.',
    ] },
  ]));

  exps.push(explanation('classful-classic', 'Historische Netzklassen', 'classic', [
    { type: 'text', content: 'Früher teilte man IPv4-Adressen in starre Klassen ein: A für sehr große, B für mittlere und C für kleinere Netze; D diente Multicast und E reservierten beziehungsweise experimentellen Zwecken.' },
    { type: 'text', content: 'Diese feste Einteilung verschwendete Adressraum. Moderne Netze verwenden deshalb classless CIDR mit flexiblen Präfixlängen. Eine Adresse, die mit 192 beginnt, bedeutet heute nicht automatisch /24.' },
    { type: 'question', facet: 'classful-cidr', question: 'Warum löste CIDR die starre klassenbasierte Einteilung weitgehend ab?', options: ['Flexible Präfixe nutzen Adressraum bedarfsgerechter.', 'CIDR macht jede Adresse automatisch privat.', 'CIDR ersetzt IP-Adressen durch MAC-Adressen.'], correct: 0, explanation: 'Starre Klassen passten oft schlecht zum tatsächlichen Bedarf. CIDR ermöglicht flexible Netzgrößen.' },
  ]));

  exps.push(explanation('jump-intro-classic', 'Sprungweite als Brücke zum Subnetting', 'classic', [
    { type: 'text', content: 'Die Sprungweite ist der Abstand zwischen zwei aufeinanderfolgenden Netz-IDs im relevanten Oktett. Sie hilft, Netzgrenzen zu erkennen; die vollständige Netzplanung folgt im Subnetting.' },
    { type: 'table', headers: ['Präfix', 'Maske', 'Sprungweite', 'Netzstarts im letzten Oktett'], rows: [
      ['/27', '255.255.255.224', '32', '0, 32, 64, 96, 128, 160, 192, 224'],
    ] },
    { type: 'text', content: '/27 lässt fünf Hostbits. Damit umfasst jeder Block 2^5 = 32 Adressen; die nächste Netz-ID beginnt 32 Werte später.' },
    { type: 'question', facet: 'block-size', question: 'Welche Sprungweite besitzt /27 im letzten Oktett?', options: ['32', '27', '255'], correct: 0, explanation: 'Fünf Hostbits ergeben 2^5 = 32 Adressen pro Block und damit eine Sprungweite von 32.' },
  ]));

  exps.push(explanation('private-classic', 'Private und besondere IPv4-Bereiche', 'classic', [
    { type: 'text', content: 'Private Adressen werden in internen Netzen verwendet und werden im öffentlichen Internet normalerweise nicht direkt geroutet. NAT übersetzt sie gegebenenfalls.' },
    { type: 'list', title: 'Private Bereiche', items: [
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16',
    ] },
    { type: 'text', content: '127.0.0.0/8 ist der Loopback-Bereich, typisch 127.0.0.1: Der Rechner spricht seinen eigenen TCP/IP-Stack an. 169.254.0.0/16 ist Link-Local/APIPA und kann entstehen, wenn keine manuelle Adresse gesetzt ist und kein DHCP-Server erreicht wird.' },
    { type: 'table', headers: ['Adresse/Bereich', 'Bedeutung'], rows: [
      ['255.255.255.255', 'Limited Broadcast im lokalen Netzsegment – nicht das gesamte Internet'],
      ['0.0.0.0/0', 'umfasst den gesamten IPv4-Adressraum und wird im Routing als Default Route verwendet'],
    ] },
    { type: 'question', facet: 'apipa-troubleshooting', question: 'Ein NEXUS-PC zeigt plötzlich 169.254.43.12. Was prüfst du zuerst?', options: ['DHCP-Erreichbarkeit und IP-Konfiguration', 'ob der Browser Port 443 nutzt', 'ob die MAC-Adresse ein Broadcast ist'], correct: 0, explanation: '169.254.x.x ist eine Link-Local-/APIPA-Adresse und häufig ein Hinweis, dass keine reguläre DHCP-Adresse bezogen wurde.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'text', content: 'IPv4-Adressen haben 32 Bit in vier Oktetten. Der Präfix legt Netz- und Hostanteil fest. Private Bereiche wie 10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16 werden intern verwendet.' },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'ipv4-bit-count',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Wie viele Bit hat eine IPv4-Adresse insgesamt?',
      options: ['16', '24', '32', '48'],
      correct: 2,
      explanation: 'IPv4 verwendet 32 Bit, aufgeteilt in vier Oktette.',
    },
    {
      id: 'ipv4-octet-count',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Wie viele Oktette hat eine IPv4-Adresse?',
      options: ['2', '4', '6', '8'],
      correct: 1,
      explanation: 'Eine IPv4-Adresse besteht aus vier Oktetten.',
    },
    {
      id: 'ipv4-valid-address',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Welche Adresse ist gültig?',
      options: ['192.168.1.10', '10.0.0.256', '192.168.-1.5', '1.2.3'],
      correct: 0,
      explanation: 'Jedes Oktett muss zwischen 0 und 255 liegen und es müssen vier Oktette vorhanden sein.',
    },
    {
      id: 'ipv4-private-public',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Welche Adresse gehört typischerweise zu einem privaten Bereich?',
      options: ['8.8.8.8', '192.168.5.20', '1.1.1.1', '203.0.113.5'],
      correct: 1,
      explanation: '192.168.0.0/16 ist ein privater Bereich.',
    },
    {
      id: 'ipv4-network-host-24',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Bei 172.16.5.4/16 beschreiben die ersten 16 Bit welchen Anteil?',
      options: ['Hostanteil', 'Netzanteil', 'Broadcast', 'Präfix'],
      correct: 1,
      explanation: 'Der Präfix /16 legt fest, dass die ersten 16 Bit den Netzanteil bilden.',
    },
    {
      id: 'ipv4-prefix-compare',
      type: 'select-best',
      difficulty: 'medium',
      question: 'Welches Netz bietet mehr Hostadressen: /24 oder /28?',
      options: ['/24', '/28', 'Beide gleich', 'Kommt darauf an'],
      correct: 0,
      explanation: 'Ein kleinerer Präfix bedeutet mehr Hostbits. /24 hat 8 Hostbits, /28 nur 4.',
    },
    {
      id: 'ipv4-loopback',
      type: 'select-best',
      difficulty: 'easy',
      question: 'Welche Adresse ist ein typisches Loopback-Beispiel?',
      options: ['192.168.1.1', '127.0.0.1', '10.0.0.1', '169.254.1.1'],
      correct: 1,
      explanation: '127.0.0.1 ist der bekannteste Loopback.',
    },
    {
      id: 'ipv4-vs-ipv6',
      type: 'matching',
      question: 'Ordne die Eigenschaften der passenden IP-Version zu.',
      pairs: [
        { left: '32 Bit', leftLabel: '32 Bit', right: 'IPv4' },
        { left: 'Dezimalpunktschreibweise', leftLabel: 'Dezimalpunktschreibweise', right: 'IPv4' },
        { left: '128 Bit', leftLabel: '128 Bit', right: 'IPv6' },
        { left: 'Hexadezimale Blöcke', leftLabel: 'Hexadezimale Blöcke', right: 'IPv6' },
      ],
      explanation: 'IPv4 verwendet 32 Bit in vier dezimalen Oktetten. IPv6 verwendet 128 Bit und eine hexadezimale Blockdarstellung.',
    },
    {
      id: 'ipv4-to-binary',
      type: 'input',
      question: 'Schreibe 192.168.1.10 als vier binäre 8-Bit-Gruppen mit Punkten.',
      answers: [decimalToIpv4Binary('192.168.1.10')],
      placeholder: 'xxxxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx',
      explanation: '192=11000000, 168=10101000, 1=00000001 und 10=00001010.',
    },
    {
      id: 'binary-to-ipv4',
      type: 'input',
      question: 'Wandle 11000000.10101000.00000001.00001010 in IPv4-Dezimalpunktschreibweise um.',
      answers: [ipv4BinaryToDecimal('11000000.10101000.00000001.00001010')],
      placeholder: 'xxx.xxx.xxx.xxx',
      explanation: 'Die vier Oktette ergeben 192.168.1.10.',
    },
    {
      id: 'ipv4-mask-cidr-22',
      type: 'input',
      question: 'Welche Dezimalmaske entspricht /22?',
      answers: [prefixToSubnetMask(22).decimal],
      placeholder: 'xxx.xxx.xxx.xxx',
      explanation: '/22 setzt 22 Netzbits: 11111111.11111111.11111100.00000000 = 255.255.252.0.',
    },
    {
      id: 'ipv4-address-role-24',
      type: 'matching',
      question: 'Ordne die Adressen im Netz 192.168.1.0/24 ihrer Rolle zu.',
      pairs: [
        { left: '192.168.1.0', leftLabel: '192.168.1.0', right: 'Netz-ID' },
        { left: '192.168.1.42', leftLabel: '192.168.1.42', right: 'Hostadresse' },
        { left: '192.168.1.255', leftLabel: '192.168.1.255', right: 'Broadcast' },
      ],
      explanation: 'Alle Hostbits 0 ergeben die Netz-ID, alle Hostbits 1 den Broadcast; normale Hosts liegen dazwischen.',
    },
    {
      id: 'ipv4-special-addresses',
      type: 'matching',
      question: 'Ordne die besonderen Adressen ihrer Bedeutung zu.',
      pairs: [
        { left: '127.0.0.1', leftLabel: '127.0.0.1', right: 'Loopback / eigener Rechner' },
        { left: '169.254.4.10', leftLabel: '169.254.4.10', right: 'APIPA / Link-Local' },
        { left: '255.255.255.255', leftLabel: '255.255.255.255', right: 'Limited Broadcast' },
        { left: '0.0.0.0/0', leftLabel: '0.0.0.0/0', right: 'gesamter Adressraum / Default Route' },
      ],
      explanation: 'Jeder Bereich besitzt eine eigene Funktion und ist nicht als normale öffentliche Hostadresse zu behandeln.',
    },
    {
      id: 'ipv4-jump-size-27',
      type: 'input',
      question: 'Welche Sprungweite besitzt /27 im letzten Oktett?',
      answers: [String(calculateJumpSize(27))],
      placeholder: 'Blockgröße',
      explanation: '/27 lässt fünf Hostbits: 2^5 = 32 Adressen pro Block.',
    },
    {
      id: 'ipv4-difficulty-drill',
      type: 'difficulty-drill',
      generator: 'ipv4',
      title: 'Adaptive IPv4-Übung',
      explanation: 'Zufällige Aufgaben mit steigender Schwierigkeit. Bestehe die Prüfung, um die nächste Stufe freizuschalten.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Wie viele Bit hat ein IPv4-Oktett?', options: ['4', '8', '16', '32'], correct: 1, explanation: 'Ein Oktett hat acht Bit.' },
    { question: 'Was legt der CIDR-Präfix fest?', options: ['Die MAC-Adresse', 'Anzahl der Netzbits', 'Die Portnummer', 'Das Betriebssystem'], correct: 1, explanation: 'Der Präfix gibt an, wie viele Bits zum Netzanteil gehören.' },
    { question: 'Welcher Bereich ist privat?', options: ['8.8.8.0/24', '172.16.0.0/12', '203.0.113.0/24', '1.1.1.0/24'], correct: 1, explanation: '172.16.0.0/12 ist einer der drei privaten IPv4-Bereiche.' },
    { question: 'Was beschreibt /32?', options: ['Ein ganzes Netz', 'Eine einzelne Adresse', 'Einen Broadcast', 'Einen Router'], correct: 1, explanation: '/32 beschreibt genau eine einzelne IPv4-Adresse.' },
    { facet: 'apipa', question: 'Welche Adresse deutet oft auf fehlenden DHCP hin?', options: ['127.0.0.1', '169.254.x.x', '192.168.1.1', '10.0.0.1'], correct: 1, explanation: '169.254.0.0/16 ist der Link-Local-/APIPA-Bereich.' },
    { facet: 'network-host', question: 'Was identifiziert der Hostanteil?', options: ['einen Teilnehmer innerhalb des Netzes', 'immer das gesamte Internet', 'die Länge einer MAC-Adresse'], correct: 0, explanation: 'Der Netzanteil beschreibt das Netz; der Hostanteil unterscheidet Teilnehmer darin.' },
    { facet: 'cidr', question: 'Welche Aussage zu /24 stimmt?', options: ['Die ersten 24 Bit sind Netzbits.', 'Das Netz besitzt exakt 24 Hosts.', 'Die Adresse enthält 24 Oktette.'], correct: 0, explanation: 'CIDR nennt die Anzahl zusammenhängender Netzbits.' },
    { facet: 'address-role', question: 'Was entsteht, wenn alle Hostbits 0 sind?', options: ['Netz-ID', 'Broadcast', 'erste Hostadresse'], correct: 0, explanation: 'Alle Hostbits 0 kennzeichnen das Netz selbst.' },
    { facet: 'limited-broadcast', question: 'Was beschreibt 255.255.255.255?', options: ['Limited Broadcast im lokalen Netzsegment', 'Broadcast an jeden Rechner im Internet', 'Loopback des eigenen Rechners'], correct: 0, explanation: 'Der Limited Broadcast bleibt auf das lokale Netzsegment beschränkt.' },
    { facet: 'default-route', question: 'Wie wird 0.0.0.0/0 typischerweise im Routing eingeordnet?', options: ['Default Route für alle nicht spezifischer bekannten Ziele', 'Loopback-Adresse', 'private Hostadresse'], correct: 0, explanation: '/0 umfasst den gesamten IPv4-Adressraum und dient als Standardroute.' },
    { facet: 'classful-cidr', question: 'Welche Aussage zur historischen Klasse C ist heute korrekt?', options: ['Die Klassen sind historisch; moderne Netzgrößen bestimmt der CIDR-Präfix.', 'Jede Adresse ab 192 besitzt zwingend /24.', 'CIDR verwendet ausschließlich Klasse C.'], correct: 0, explanation: 'Moderne classless Netze verwenden flexible Präfixe statt starrer Klassen.' },
    { facet: 'block-size', question: 'Warum beträgt die Sprungweite bei /27 im letzten Oktett 32?', options: ['Fünf Hostbits ergeben 2^5 = 32 Adressen pro Block.', '/27 bedeutet immer 27 Hosts.', 'Die Maske besitzt 32 Oktette.'], correct: 0, explanation: '32 Adressen liegen in jedem /27-Block; Netz-IDs beginnen daher bei 0, 32, 64 und so weiter.' },
  ];
}

function buildSummary() {
  return [
    'IPv4-Adressen haben 32 Bit in vier Oktetten.',
    'Subnetzmaske und CIDR-Präfix legen die Grenze zwischen Netz- und Hostanteil fest.',
    'Hostbits 0 ergeben die Netz-ID, Hostbits 1 den Broadcast; normale Hostadressen liegen dazwischen.',
    'Private Bereiche: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
    '/32 ist eine einzelne Adresse, 0.0.0.0/0 umfasst als Default Route den gesamten Adressraum.',
    'Loopback: 127.0.0.1, APIPA: 169.254.x.x, Limited Broadcast: 255.255.255.255.',
    'Sprungweiten markieren den Abstand zwischen Netz-IDs und bereiten auf Subnetting vor.',
  ];
}

export function buildIpv4Lesson() {
  return {
    title: 'IPv4-Grundlagen',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}

export const IPV4_TOPIC_KEY = topicKey('fundamentals', 'ipv4');
