import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const key = topicKey('information-security', 'security-technical-measures');
const lesson = LESSONS[key];
let failures = 0;

function assert(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!condition) failures += 1;
}

function blockText(block) {
  return [block.content, block.title, block.question, ...(block.items || []), JSON.stringify(block.rows || [])].filter(Boolean).join(' ');
}

console.log('=== Security Technical Measures Quality Audit ===');
assert('Lesson existiert', !!lesson);
assert('Mindestens 12 Theory Sections', (lesson?.explanations?.length || 0) >= 12, `count=${lesson?.explanations?.length || 0}`);
assert('Mindestens 5 Übungen', (lesson?.exercises?.length || 0) >= 5, `count=${lesson?.exercises?.length || 0}`);
assert('Quiz hat 6–8 Fragen', (lesson?.quiz?.length || 0) >= 6 && (lesson?.quiz?.length || 0) <= 8, `count=${lesson?.quiz?.length || 0}`);

const sectionIds = (lesson?.explanations || []).map((e) => e.sectionId || e.id);
assert('Section IDs eindeutig', new Set(sectionIds).size === sectionIds.length);
const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
assert('Exercise IDs eindeutig', new Set(exerciseIds).size === exerciseIds.length);
assert('Exercise-Typen unterstützt', (lesson?.exercises || []).every((e) => ['matching', 'ordering', 'select-best', 'input'].includes(e.type)));

const text = [
  ...(lesson?.explanations || []).flatMap((e) => e.blocks.map(blockText)),
  ...(lesson?.exercises || []).map((e) => `${e.question} ${e.explanation} ${JSON.stringify(e.pairs || e.options || [])}`),
  ...(lesson?.quiz || []).map((q) => `${q.question} ${q.explanation}`),
].join(' ').toLowerCase();

const checks = [
  ['OPTI-Bezug', ['opti', 'organisatorisch', 'personell', 'technische schutzmaßnahmen', 'teil des gesamtschutzes']],
  ['Netzplan', ['netzplan', 'komponenten', 'server', 'clients', 'verbindungen', 'vertrauensgrenzen']],
  ['LAN-Schutzmaßnahmen', ['ungenutzte ports', 'dummy-vlan', 'vlan-trennung', 'acl']],
  ['Cisco-Transfer', ['cisco', 'konfiguration', 'sicherheitswirkung', 'grenzen']],
  ['Firewall-Grundlagen', ['firewall', 'sicherungssystem', 'kontrollierte kopplung', 'reglementiert zugriffe']],
  ['Firewall vs Paketfilter', ['firewall', 'oberbegriff', 'paketfilter', 'technik']],
  ['Paketfilter', ['header', 'quelle', 'ziel', 'protokoll', 'port', 'layer']],
  ['Allowlist / Denylist', ['allowlist', 'denylist', 'explizit erlaubt', 'bekannt unerwünscht']],
  ['Grenzen statischer Filter', ['keinen verbindungszustand', 'rückverkehr', 'anwendungsinhalte']],
  ['Stateful Inspection', ['verbindungszustand', 'session', 'rückverkehr', 'temporär']],
  ['Static vs Stateful', ['stateless', 'stateful', 'rückverkehr']],
  ['ALG', ['application layer gateway', 'anwendungsebene', 'protokoll', 'inhalte']],
  ['Paketfilter vs ALG', ['paketfilter', 'alg', 'anwendungsprotokoll', 'inhalt']],
  ['DMZ', ['dmz', 'demilitarisierte zone', 'öffentlich erreichbar', 'internes netz', 'trennung']],
  ['DMZ Tier', ['einstufig', 'mehrstufig', 'single point of failure', 'kombiniert']],
  ['Defense in Depth', ['defense in depth', 'schutzschichten', 'ausfall einer schicht']],
  ['IDS', ['ids', 'erkennt', 'meldet', 'signatur', 'anomalie']],
  ['IPS', ['ips', 'blocken', 'reaktion']],
  ['IDS vs IPS', ['ids', 'ips', 'blocken', 'meldet']],
  ['False Positive', ['false positive', 'legitimer traffic', 'anomal']],
  ['VPN-Grundlagen', ['vpn', 'logische verbindung', 'vertrauenswürdige infrastruktur']],
  ['VPN-Typen', ['site-to-site', 'end-to-site', 'end-to-end']],
  ['Authentisierung', ['authentisierung', 'nachweis']],
  ['Authentifizierung', ['authentifizierung', 'prüfung']],
  ['Autorisierung', ['autorisierung', 'rechte']],
  ['VPN-Protokolle', ['pptp', 'l2tp', 'ipsec', 'wireguard', 'tls']],
  ['IPsec Modi', ['tunnelmodus', 'transportmodus', 'gateway', 'endpunkte']],
  ['Optionaler IPsec-Exkurs', ['ah', 'esp', 'ike', 'optional']],
  ['Thema-1 Transfer', ['vertraulichkeit', 'integrität', 'verfügbarkeit']],
  ['Thema-3 Transfer', ['lücke', 'verstoß', 'vorkommnis', 'isb']],
  ['Thema-4 Transfer', ['bedrohung', 'schwachstelle', 'gefährdung', 'technische maßnahme']],
  ['Fehlannahmen', ['firewall', 'paketfilter', 'stateless', 'stateful', 'allowlist', 'denylist', 'dmz', 'ids', 'ips', 'vpn', 'authentisierung', 'autorisierung']],
];

for (const [label, needles] of checks) {
  assert(label, needles.every((needle) => text.includes(needle)), `needles=${needles.join(', ')}`);
}

const diagrams = (lesson?.explanations || []).flatMap((e) => e.blocks).filter((b) => b.type === 'diagram');
assert('Mindestens drei lernwertige Visuals', diagrams.length >= 3, `count=${diagrams.length}`);
assert('Visuals sind mobile SVGs', diagrams.every((b) => typeof b.content === 'string' && b.content.includes('<svg') && b.content.includes('viewBox')));

const allItems = getAllKnowledgeItems();
const requestedKeys = new Set([
  'security-technical-measures', 'firewall-types', 'allowlist-denylist', 'dmz', 'ids-ips',
].map((id) => topicKey('information-security', id)));
const topicItems = allItems.filter((item) => requestedKeys.has(item.topicKey));

const requiredIds = [
  'security.technicalMeasures.optiRole',
  'security.technicalMeasures.networkPlan',
  'security.technicalMeasures.defenseInDepth',
  'security.firewall.packetFilter',
  'security.firewall.stateful',
  'security.firewall.alg',
  'security.firewall.staticVsStateful',
  'security.firewall.packetVsAlg',
  'security.allowlist.definition',
  'security.denylist.definition',
  'security.dmz.definition',
  'security.dmz.singleTier',
  'security.dmz.multiTier',
  'security.ids.definition',
  'security.ids.networkVsHost',
  'security.ids.signature',
  'security.ids.anomaly',
  'security.ips.definition',
  'security.idsips.compare',
  'security.ips.falsePositive',
  'security.vpn.definition',
  'security.vpn.siteToSite',
  'security.vpn.endToSite',
  'security.vpn.endToEnd',
  'security.vpn.pptp',
  'security.vpn.l2tp',
  'security.vpn.ipsec',
  'security.vpn.ipsecTunnel',
  'security.vpn.ipsecTransport',
  'security.vpn.wireguard',
  'security.vpn.tls',
  'security.vpn.optionalDetails',
  'security.auth.authenticationProof',
  'security.auth.authenticationCheck',
  'security.auth.authorization',
  'security.auth.trio',
];

for (const id of requiredIds) {
  assert(`Knowledge Facet ${id}`, topicItems.some((item) => item.id === id));
}

const ids = allItems.map((item) => item.id);
assert('Keine doppelten Knowledge IDs', new Set(ids).size === ids.length);

const sourceSectionIds = new Set((lesson?.explanations || []).map((e) => e.id));
const blockFiveItems = topicItems.filter((item) => item.sourceTopicKey === key);
assert('Block-5 Knowledge verweist auf gültige Sections', blockFiveItems.every((item) => sourceSectionIds.has(item.sourceSection)), `items=${blockFiveItems.length}`);

const conversationKeys = ['security-technical-measures', 'firewall-types', 'allowlist-denylist', 'dmz', 'ids-ips'].map((id) => topicKey('information-security', id));
assert('Conversation Coverage vollständig', conversationKeys.every((k) => !!CONVERSATION_TOPICS[k]));
assert('Security-Technical-Measures Conversation hat Transferfragen', (CONVERSATION_TOPICS[key]?.questions?.length || 0) >= 6);

const validTopics = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
assert('Alle Conversation Topic Keys gültig', conversationKeys.every((k) => validTopics.has(k)));

assert('Keine große Simulations-Engine', !text.includes('firewall-gui') && !text.includes('vpn-client') && !text.includes('ids-sensor') && !text.includes('packet capture') && !text.includes('traffic generator') && !text.includes('ipsec configuration'));

console.log('');
if (failures === 0) {
  console.log('Security Technical Measures Quality Audit bestanden.');
  process.exit(0);
}
console.log(`${failures} Fehler gefunden.`);
process.exit(1);
