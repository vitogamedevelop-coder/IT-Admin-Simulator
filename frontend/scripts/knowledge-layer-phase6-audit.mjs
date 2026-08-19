// =============================================================================
// NEXUS Knowledge Layer – Phase 6 Quality Audit
//
// Generates a large sample of Question Instances and Conversation Texts and
// reports potential quality issues: ambiguity, distractor quality, quiz
// language, context mismatch, double actors, facet distribution, and
// explanation coverage.
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
  // Heuristic: classify an option label by its content.
  const label = String(option).toLowerCase();
  // Interface / SVI descriptions should be treated as one category.
  if (/\b(svi|schnittstelle|interface g[0-9]\/[0-9]|physical interface)\b/.test(label)) return 'interface-description';
  // Cisco command snippets / configurations should be treated as one category.
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

function audit(samplesPerTemplate = 5, seedPrefix = 'phase6-audit') {
  const items = getAllKnowledgeItems();
  const findings = {
    ambiguity: [],
    doubleActor: [],
    quizLanguage: [],
    contextMismatch: [],
    distractorIssues: [],
    missingExplanation: [],
    validationErrors: [],
  };
  const stats = {
    total: 0,
    byTopic: {},
    byLearningObjective: {},
    byFacet: {},
    byTemplate: {},
    byContextType: {},
    byRoleHint: {},
  };
  const conversationSamples = [];

  for (const item of items) {
    const templates = listApplicableTemplates(item.id);
    for (const tmpl of templates) {
      for (let i = 0; i < samplesPerTemplate; i += 1) {
        ['direct_question', 'coworker_question'].forEach((contextType) => {
          const seed = `${seedPrefix}-${i}`;
          let instance;
          try {
            instance = generateQuestion(item.id, tmpl.id, { contextType, seed });
          } catch (e) {
            findings.validationErrors.push({ item: item.id, template: tmpl.id, contextType, error: e.message });
            return;
          }

          stats.total += 1;
          stats.byTopic[instance.topicKey] = (stats.byTopic[instance.topicKey] || 0) + 1;
          stats.byLearningObjective[instance.learningObjective] = (stats.byLearningObjective[instance.learningObjective] || 0) + 1;
          stats.byFacet[instance.knowledgeFacet] = (stats.byFacet[instance.knowledgeFacet] || 0) + 1;
          stats.byTemplate[instance.context.templateId] = (stats.byTemplate[instance.context.templateId] || 0) + 1;
          stats.byContextType[contextType] = (stats.byContextType[contextType] || 0) + 1;
          (instance.context.roleHints || []).forEach((r) => {
            stats.byRoleHint[r] = (stats.byRoleHint[r] || 0) + 1;
          });

          const text = contextType === 'coworker_question' ? instance.conversationText : instance.prompt;

          // Ambiguity.
          const ambiguities = checkAmbiguity(instance);
          if (ambiguities.length) {
            findings.ambiguity.push({ id: instance.instanceId, text, ambiguities });
          }

          // Double actor.
          const double = hasDoubleActor(text);
          if (double) {
            findings.doubleActor.push({ id: instance.instanceId, text, actors: double });
          }

          // Quiz language.
          if (hasQuizLanguage(text)) {
            findings.quizLanguage.push({ id: instance.instanceId, text, contextType });
          }

          // Context mismatch for parametric calculations.
          if (instance.contextDependency === 'parametric' && instance.calculationParams && text) {
            const params = instance.calculationParams;
            const maskOctets = new Set([0, 128, 192, 224, 240, 248, 252, 254, 255]);
            if ((text.includes('Subnetzmaske') || text.includes('subnet mask')) && params.decimal !== undefined) {
              if (!maskOctets.has(params.decimal)) {
                findings.contextMismatch.push({ id: instance.instanceId, text, reason: `decimal ${params.decimal} not a mask octet` });
              }
            }
          }

          // Distractor quality for MC.
          if (instance.type === 'mc' && instance.options) {
            const labels = instance.options.map((o) => o.label);
            const unique = new Set(labels);
            if (unique.size !== labels.length) {
              findings.distractorIssues.push({ id: instance.instanceId, issue: 'duplicate option labels', labels });
            }
            const sentenceCount = labels.filter(isFullSentence).length;
            const allFullSentences = sentenceCount === labels.length;
            if (allFullSentences) {
              // For full-sentence options, ensure they are roughly the same length
              // to avoid a giveaway by option length.
              const lengths = labels.map(countWords);
              const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
              const maxDev = Math.max(...lengths.map((l) => Math.abs(l - avg)));
              if (maxDev > 8) {
                findings.distractorIssues.push({ id: instance.instanceId, issue: 'very uneven full-sentence option lengths', labels, lengths });
              }
            } else {
              // Numeric options should all be numeric to avoid giveaway.
              const numericCount = labels.filter(isNumeric).length;
              if (numericCount > 0 && numericCount < labels.length) {
                findings.distractorIssues.push({ id: instance.instanceId, issue: 'mixed numeric/non-numeric options', labels });
              }
              // Semantic category mixing heuristic (only for short options).
              const categories = labels.map(semanticCategory);
              const dominant = categories.find((c) => c !== 'other');
              if (dominant && categories.some((c) => c !== dominant && c !== 'other')) {
                findings.distractorIssues.push({ id: instance.instanceId, issue: `mixed semantic categories (${categories.join(', ')})`, labels });
              }
            }
          }

          // Answer-aware explanation coverage.
          if (instance.type === 'mc' && instance.options && !instance.wrongOptionExplanations) {
            findings.missingExplanation.push({ id: instance.instanceId, issue: 'no answer-aware wrongOptionExplanations' });
          }

          // Explanation presence.
          if (!instance.explanation || instance.explanation.length < 10) {
            findings.missingExplanation.push({ id: instance.instanceId, explanation: instance.explanation });
          }

          // Validator check.
          const errors = contextType === 'coworker_question'
            ? validateConversationInstance(instance)
            : validateQuestionInstance(instance);
          if (errors.length) {
            findings.validationErrors.push({ id: instance.instanceId, contextType, errors });
          }

          if (contextType === 'coworker_question') {
            conversationSamples.push({
              topicKey: instance.topicKey,
              templateId: instance.context.templateId,
              learningObjective: instance.learningObjective,
              knowledgeFacet: instance.knowledgeFacet,
              roleHints: instance.context.roleHints,
              text,
              prompt: instance.prompt,
            });
          }
        });
      }
    }
  }

  return { findings, stats, conversationSamples };
}

const { findings, stats, conversationSamples } = audit(3);

console.log('=== Phase 6 Quality Audit ===\n');
console.log(`Total instances: ${stats.total}`);
console.log(`Templates: ${Object.keys(stats.byTemplate).length}`);
console.log(`Learning Objectives: ${Object.keys(stats.byLearningObjective).length}`);
console.log(`Facets: ${Object.keys(stats.byFacet).length}\n`);

console.log('--- Findings ---');
for (const [key, list] of Object.entries(findings)) {
  console.log(`${key}: ${list.length}`);
}

console.log('\n--- Top Facets ---');
const topFacets = Object.entries(stats.byFacet).sort((a, b) => b[1] - a[1]).slice(0, 20);
for (const [facet, count] of topFacets) {
  console.log(`${facet}: ${count}`);
}

console.log('\n--- Quiz Language Samples ---');
for (const s of findings.quizLanguage.slice(0, 5)) {
  console.log(`[${s.id}] ${s.text}`);
}

console.log('\n--- Distractor Issues (first 5) ---');
for (const s of findings.distractorIssues.slice(0, 5)) {
  console.log(`[${s.id}] ${s.issue}`);
  console.log(`  labels: ${JSON.stringify(s.labels)}`);
}

console.log('\n--- Context Mismatches ---');
for (const s of findings.contextMismatch.slice(0, 10)) {
  console.log(`[${s.id}] ${s.reason}`);
  console.log(`  text: ${s.text}`);
}

console.log('\n--- Missing Answer-Aware Explanations (first 10) ---');
for (const s of findings.missingExplanation.slice(0, 10)) {
  console.log(`[${s.id}] ${s.issue}`);
}

console.log('\n--- Conversation Samples (first 10) ---');
for (const s of conversationSamples.slice(0, 10)) {
  console.log(`[${s.templateId}] ${s.learningObjective}/${s.knowledgeFacet} [${s.roleHints?.join(',')}]`);
  console.log(`  ${s.text}`);
}
