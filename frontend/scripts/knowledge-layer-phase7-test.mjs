// =============================================================================
// NEXUS Knowledge Layer – Phase 7 Mass Quality Test
//
// Generates 10,000+ Question Instances across the expanded Knowledge Layer
// and reports validation errors, ambiguity, quiz language, distractor quality,
// topic/facet/role distribution, and consecutive repetition streaks.
// =============================================================================

import {
  getAllKnowledgeItems,
  generateQuestion,
  listApplicableTemplates,
  checkAmbiguity,
  validateQuestionInstance,
} from '../src/lib/knowledge/index.js';
import { validateConversationInstance } from '../src/lib/knowledge/validators.js';

const QUIZ_PATTERNS = [
  /welche der folgenden/i,
  /welche aussage/i,
  /welche antwort/i,
  /nenne /i,
  /laut definition/i,
  /ist korrekt/i,
  /richtig ist/i,
  /frage \d+/i,
  /teste dein wissen/i,
  /wähle die richtige/i,
];

const DOUBLE_ACTOR_PATTERNS = ['Ein Techniker meldet', 'Ein Techniker stellt fest', 'Ein Kollege fragt', 'Ein Kollege berichtet'];

function hasQuizLanguage(text) {
  return QUIZ_PATTERNS.some((re) => re.test(text));
}

function hasDoubleActor(text) {
  const found = DOUBLE_ACTOR_PATTERNS.filter((p) => text.includes(p));
  return found.length > 1 ? found : false;
}

function semanticCategory(option) {
  const label = String(option).toLowerCase();
  if (/\b(svi|schnittstelle|interface g[0-9]\/[0-9]|physical interface)\b/.test(label)) return 'interface-description';
  if (/\b(login|transport|password|username|crypto|key|interface|line vty|hostname|ip ssh|ip default-gateway)\b/.test(label)) return 'command-snippet';
  if (/\b(vlans?|vlan-tag|trunk|access|port|interface)\b/.test(label)) return 'vlan-port';
  if (/\b(layer|schicht)\b/.test(label)) return 'layer';
  if (/\b(ssh|telnet|http|https|ftp|dns|dhcp|smtp|snmp|tcp|udp|ip|icmp|arp)\b/.test(label)) return 'protocol';
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(label)) return 'ip-address';
  if (/\/(\d{1,2})\b/.test(label)) return 'prefix';
  if (/\b(hub|switch|router|bridge|repeater|access point|firewall)\b/.test(label)) return 'device';
  if (/\b(bit|byte|oktett|binary|dezimal|hex)\b/.test(label)) return 'binary';
  if (/\b(host|subnet|netz|broadcast|network id|sprungweite)\b/.test(label)) return 'subnet';
  if (/\b(crypto|key|rsa|ssh version|login|transport|vty|console)\b/.test(label)) return 'ssh';
  return 'other';
}

function isNumeric(text) {
  return /^\d+([.,]\d+)?$/.test(String(text).trim());
}

function isFullSentence(text) {
  const t = String(text).trim();
  return /[.!?]$/.test(t) && t.split(/\s+/).length >= 3;
}

function countWords(text) {
  return String(text).trim().split(/\s+/).length;
}

function runMassTest(samplesPerTemplate = 20) {
  const items = getAllKnowledgeItems();
  const findings = {
    ambiguity: 0,
    ambiguitySamples: [],
    doubleActor: 0,
    quizLanguage: 0,
    contextMismatch: 0,
    distractorIssues: 0,
    missingExplanation: 0,
    validationErrors: 0,
    validationErrorSamples: [],
  };
  const stats = {
    total: 0,
    byTopic: {},
    byLearningObjective: {},
    byFacet: {},
    byTemplate: {},
    byContextType: {},
    byRoleHint: {},
    byArchetype: {},
    consecutiveItemStreaks: [],
  };

  let lastItemId = null;
  let streak = 0;

  for (const item of items) {
    const templates = listApplicableTemplates(item.id);
    for (const tmpl of templates) {
      for (let i = 0; i < samplesPerTemplate; i += 1) {
        ['direct_question', 'coworker_question'].forEach((contextType) => {
          const seed = `phase7-mass-${i}-${contextType}`;
          let instance;
          try {
            instance = generateQuestion(item.id, tmpl.id, { contextType, seed });
          } catch (e) {
            findings.validationErrors += 1;
            findings.validationErrorSamples.push({ item: item.id, template: tmpl.id, contextType, error: e.message });
            return;
          }

          stats.total += 1;
          stats.byTopic[instance.topicKey] = (stats.byTopic[instance.topicKey] || 0) + 1;
          stats.byLearningObjective[instance.learningObjective] = (stats.byLearningObjective[instance.learningObjective] || 0) + 1;
          stats.byFacet[instance.knowledgeFacet] = (stats.byFacet[instance.knowledgeFacet] || 0) + 1;
          stats.byTemplate[instance.context.templateId] = (stats.byTemplate[instance.context.templateId] || 0) + 1;
          stats.byContextType[contextType] = (stats.byContextType[contextType] || 0) + 1;
          stats.byArchetype[instance.questionArchetype] = (stats.byArchetype[instance.questionArchetype] || 0) + 1;
          (instance.context.roleHints || []).forEach((r) => {
            stats.byRoleHint[r] = (stats.byRoleHint[r] || 0) + 1;
          });

          const text = contextType === 'coworker_question' ? instance.conversationText : instance.prompt;

          if (checkAmbiguity(instance).length) {
            findings.ambiguity += 1;
            if (findings.ambiguitySamples.length < 5) {
              findings.ambiguitySamples.push({ id: instance.instanceId, text, ambiguities: checkAmbiguity(instance) });
            }
          }

          if (hasDoubleActor(text)) {
            findings.doubleActor += 1;
          }

          if (hasQuizLanguage(text)) {
            findings.quizLanguage += 1;
          }

          if (instance.contextDependency === 'parametric' && instance.calculationParams && text) {
            const params = instance.calculationParams;
            const maskOctets = new Set([0, 128, 192, 224, 240, 248, 252, 254, 255]);
            if ((text.includes('Subnetzmaske') || text.includes('subnet mask')) && params.decimal !== undefined) {
              if (!maskOctets.has(params.decimal)) {
                findings.contextMismatch += 1;
              }
            }
          }

          if (instance.type === 'mc' && instance.options) {
            const labels = instance.options.map((o) => o.label);
            const unique = new Set(labels);
            if (unique.size !== labels.length) {
              findings.distractorIssues += 1;
            }
            const sentenceCount = labels.filter(isFullSentence).length;
            if (sentenceCount === labels.length) {
              const lengths = labels.map(countWords);
              const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
              const maxDev = Math.max(...lengths.map((l) => Math.abs(l - avg)));
              if (maxDev > 8) findings.distractorIssues += 1;
            } else {
              const numericCount = labels.filter(isNumeric).length;
              if (numericCount > 0 && numericCount < labels.length) findings.distractorIssues += 1;
              const categories = labels.map(semanticCategory);
              const dominant = categories.find((c) => c !== 'other');
              if (dominant && categories.some((c) => c !== dominant && c !== 'other')) findings.distractorIssues += 1;
            }
          }

          if (instance.type === 'mc' && instance.options && !instance.wrongOptionExplanations) {
            findings.missingExplanation += 1;
          }

          if (!instance.explanation || instance.explanation.length < 10) {
            findings.missingExplanation += 1;
          }

          const errors = contextType === 'coworker_question'
            ? validateConversationInstance(instance)
            : validateQuestionInstance(instance);
          if (errors.length) {
            findings.validationErrors += 1;
            if (findings.validationErrorSamples.length < 5) {
              findings.validationErrorSamples.push({ id: instance.instanceId, contextType, errors });
            }
          }

          // Track same-item consecutive streaks within this generated sequence.
          if (instance.knowledgeItemId === lastItemId) {
            streak += 1;
          } else {
            if (streak >= 2) stats.consecutiveItemStreaks.push({ itemId: lastItemId, length: streak + 1 });
            lastItemId = instance.knowledgeItemId;
            streak = 0;
          }
        });
      }
    }
  }

  return { findings, stats };
}

function distributionReport(map, total, label, limit = 15) {
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, limit);
  const maxRatio = total ? (entries[0]?.[1] / total) : 0;
  console.log(`\n${label} (${Object.keys(map).length} distinct):`);
  top.forEach(([k, v]) => console.log(`  ${k}: ${v} (${((v / total) * 100).toFixed(1)}%)`));
  console.log(`  max ratio: ${(maxRatio * 100).toFixed(1)}%`);
}

function samplesByCategory() {
  const items = getAllKnowledgeItems();
  const targetTopics = [
    'fundamentals/grundbegriffe',
    'fundamentals/topologien',
    'fundamentals/kommunikation-uebertragung',
    'fundamentals/tcp-udp',
    'fundamentals/dns',
    'fundamentals/dhcp',
    'fundamentals/routing',
    'fundamentals/vlsm',
    'fundamentals/supernetting',
    'cisco-packet-tracer/grundlagen',
    'cisco-packet-tracer/router-basics',
    'cisco-packet-tracer/static-routing',
  ];
  console.log('\n=== Phase 7 Quality Samples ===');
  for (const topic of targetTopics) {
    const topicItems = items.filter((i) => i.topicKey === topic);
    if (!topicItems.length) {
      console.log(`\n## ${topic}\n(no knowledge items yet)`);
      continue;
    }
    console.log(`\n## ${topic}`);
    let shown = 0;
    for (const item of topicItems) {
      if (shown >= 2) break;
      const templates = listApplicableTemplates(item.id);
      if (!templates.length) continue;
      const tmpl = templates[0];
      try {
        const instance = generateQuestion(item.id, tmpl.id, { contextType: 'coworker_question', seed: `phase7-sample-${shown}` });
        console.log(`[${item.id} / ${tmpl.id}] facet=${instance.knowledgeFacet} roles=[${(instance.context.roleHints || []).join(',')}]`);
        console.log(`  ${instance.conversationText}`);
        if (instance.type === 'mc') {
          instance.options.forEach((o) => console.log(`    ${o.id}: ${o.label}${o.id === instance.correctOptionId ? ' (correct)' : ''}`));
        } else if (instance.type === 'ordering') {
          console.log(`    order items: ${instance.items.map((it) => it.label).join(' | ')}`);
        } else if (instance.type === 'matching') {
          console.log(`    pairs: ${instance.pairs.map((p) => `${p.leftLabel} → ${p.rightLabel}`).join(' | ')}`);
        }
        shown += 1;
      } catch {
        // skip
      }
    }
  }
}

console.log('=== Phase 7 Mass Quality Test ===');
const { findings, stats } = runMassTest(20);

console.log(`\nTotal instances: ${stats.total}`);
console.log(`Findings:`);
console.log(`  validation errors: ${findings.validationErrors}`);
console.log(`  ambiguity: ${findings.ambiguity}`);
console.log(`  double actor: ${findings.doubleActor}`);
console.log(`  quiz language: ${findings.quizLanguage}`);
console.log(`  context mismatch: ${findings.contextMismatch}`);
console.log(`  distractor issues: ${findings.distractorIssues}`);
console.log(`  missing explanation: ${findings.missingExplanation}`);
console.log(`  same-item streaks >=3: ${stats.consecutiveItemStreaks.length}`);

if (findings.validationErrorSamples.length) {
  console.log('\nFirst validation error samples:');
  findings.validationErrorSamples.forEach((s) => console.log(JSON.stringify(s, null, 2)));
}
if (findings.ambiguitySamples.length) {
  console.log('\nAmbiguity samples:');
  findings.ambiguitySamples.forEach((s) => console.log(JSON.stringify(s, null, 2)));
}

distributionReport(stats.byTopic, stats.total, 'Topic distribution', 15);
distributionReport(stats.byFacet, stats.total, 'Facet distribution', 15);
distributionReport(stats.byArchetype, stats.total, 'Archetype distribution', 15);
distributionReport(stats.byRoleHint, stats.total, 'Role distribution', 10);

samplesByCategory();

if (findings.validationErrors > 0 || findings.ambiguity > 0 || findings.quizLanguage > 0) {
  console.log('\n❌ Phase 7 mass quality test failed');
  process.exit(1);
}

console.log('\n✅ Phase 7 mass quality test passed');
