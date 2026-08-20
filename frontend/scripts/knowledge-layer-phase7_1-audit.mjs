// =============================================================================
// NEXUS Knowledge Layer – Phase 7.1 Audit & Validation Helpers
//
// Runs conversation-level checks: distractor domain, ordering position leaks,
// direction/UI mismatches, missing feedback, facet IDs, progress mapping,
// network-scope coverage, and a dedicated 300-question network-scope mass test.
// =============================================================================

import {
  getAllKnowledgeItems,
  generateQuestion,
  listApplicableTemplates,
} from '../src/lib/knowledge/index.js';
import {
  validateDistractorDomain,
  validateOrderingPositionLeak,
} from '../src/lib/knowledge/validators.js';
import {
  startEmployeeConversation,
  evaluateEmployeeAnswer,
  advanceConversation,
  resetEmployeeConversations,
  getConversationSummary,
} from '../src/lib/employeeConversations.js';
import { updateTopicProgress, getTopicProgress } from '../src/lib/academyProgress.js';
import { topicKey, ACADEMY_TOPICS } from '../src/lib/academyTopics.js';

// =============================================================================
// Node test environment mocks
// =============================================================================
const store = new Map();
global.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
};
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { href: '' },
};
global.document = { createElement: () => ({}) };

function answerForQuestion(question) {
  if (question.type === 'mc') return question.correctOptionId;
  if (question.type === 'ordering') return question.correctOrderIds;
  if (question.type === 'matching') {
    const result = {};
    for (const pair of question.correctPairs) {
      result[pair.leftId ?? pair.left] = pair.rightId ?? pair.right;
    }
    return result;
  }
  if (question.type === 'input') return question.answers?.[0] || '';
  return null;
}

function isKnowledgeQuestion(question) {
  return !!question.knowledgeItemId;
}

function unlockAllTopics() {
  for (const topic of ACADEMY_TOPICS) {
    const key = topicKey(topic.categoryId, topic.topicId);
    updateTopicProgress(topic.categoryId, topic.topicId, { status: 'available' });
    if (!getTopicProgress(topic.categoryId, topic.topicId)) {
      throw new Error(`Topic progress not found for ${key}`);
    }
  }
}

function topicIdsFromKey(key) {
  const [categoryId, ...rest] = key.split('/');
  return { categoryId, topicId: rest.join('/') };
}

function isCalculationQuestion(question) {
  return question.questionArchetype === 'calculation'
    || (question.answerFormat && ['number', 'binary', 'ipv4-address', 'ipv4-mask', 'prefix'].includes(question.answerFormat.type));
}

function isPhase7KnowledgeItem(item) {
  if (!item?.conceptCluster) return false;
  const prefix = item.conceptCluster.split('.')[0];
  return ['grundbegriffe', 'topologien', 'kommunikation', 'tcpudp', 'dns', 'dhcp', 'routing', 'vlsm', 'supernetting', 'cisco'].includes(prefix);
}

function isAllowedIssue(issue, question, item) {
  // Existing SSH / Cisco-static distractor cross-domain issues are known/allowed.
  if (issue.type === 'cross-domain-distractor') {
    const sshCluster = /^(ssh\.|cisco\.static\.)/;
    if (sshCluster.test(issue.sourceCluster || '') || sshCluster.test(issue.correctCluster || '')) return true;
  }
  // Calculation questions do not require per-option explanations.
  if (issue.type === 'missing-feedback' && isCalculationQuestion(question)) return true;
  // Only Phase 7 knowledge-layer MC questions are required to have
  // answer-aware wrong-option explanations in this milestone.
  if (issue.type === 'missing-feedback' && issue.subtype === 'mc-wrongOptionExplanations' && !isPhase7KnowledgeItem(item)) return true;
  return false;
}

function recordFinding(findings, issueCounts, issue, question, item) {
  const key = issue.type;
  issueCounts[key] = (issueCounts[key] || 0) + 1;
  if (!isAllowedIssue(issue, question, item)) {
    findings.push(issue);
  }
}

// =============================================================================
// Main conversation audit (>= 1000 questions)
// =============================================================================
function runConversationAudit(targetQuestions = 1000) {
  resetEmployeeConversations();
  unlockAllTopics();

  const allItemsById = Object.fromEntries(getAllKnowledgeItems().map((i) => [i.id, i]));
  const findings = [];
  const issueCounts = {};
  const networkScopeTerms = { PAN: 0, LAN: 0, MAN: 0, WAN: 0 };
  const facetCounts = {};
  let total = 0;
  let conversations = 0;
  let progressFailures = 0;
  const progressBeforeByTopic = new Map();

  const directionPatterns = [
    /links nach rechts/i,
    /rechts nach links/i,
    /von links/i,
    /von rechts/i,
    /oben nach unten/i,
    /unten nach oben/i,
  ];

  while (total < targetQuestions) {
    const conv = startEmployeeConversation();
    if (!conv) {
      recordFinding(findings, issueCounts, { type: 'start-failed' }, null, null);
      break;
    }
    conversations += 1;

    while (!conv.completed) {
      const question = conv.question;
      total += 1;
      const item = isKnowledgeQuestion(question) ? allItemsById[question.knowledgeItemId] : null;

      // Distractor domain check for knowledge MC questions.
      if (question.type === 'mc' && item) {
        for (const issue of validateDistractorDomain(question, item, allItemsById)) {
          recordFinding(findings, issueCounts, { ...issue, questionId: question.instanceId, itemId: item.id }, question, item);
        }
      }

      // Ordering position leak check.
      if (question.type === 'ordering') {
        for (const issue of validateOrderingPositionLeak(question)) {
          recordFinding(findings, issueCounts, { ...issue, questionId: question.instanceId, itemId: item?.id }, question, item);
        }
      }

      // Direction/UI mismatch: prompt text describes a UI direction.
      const text = `${question.prompt || ''} ${question.conversationText || ''}`;
      if (directionPatterns.some((re) => re.test(text))) {
        recordFinding(findings, issueCounts, {
          type: 'direction-ui-mismatch',
          questionId: question.instanceId,
          itemId: item?.id,
          text: text.trim().slice(0, 140),
        }, question, item);
      }

      // Missing feedback checks.
      if (question.type === 'ordering' && !question.correctOrderLabels) {
        recordFinding(findings, issueCounts, {
          type: 'missing-feedback',
          subtype: 'ordering-correctOrderLabels',
          questionId: question.instanceId,
          itemId: item?.id,
        }, question, item);
      }
      if (question.type === 'matching' && !question.correctPairLabels) {
        recordFinding(findings, issueCounts, {
          type: 'missing-feedback',
          subtype: 'matching-correctPairLabels',
          questionId: question.instanceId,
          itemId: item?.id,
        }, question, item);
      }
      if (question.type === 'mc' && !question.wrongOptionExplanations) {
        recordFinding(findings, issueCounts, {
          type: 'missing-feedback',
          subtype: 'mc-wrongOptionExplanations',
          questionId: question.instanceId,
          itemId: item?.id,
        }, question, item);
      }

      // Facet ID missing for knowledge questions.
      if (isKnowledgeQuestion(question) && !question.knowledgeFacet) {
        recordFinding(findings, issueCounts, {
          type: 'missing-facet-id',
          questionId: question.instanceId,
          itemId: item?.id,
        }, question, item);
      }

      // Network-scope coverage counters.
      if (isKnowledgeQuestion(question) && question.conceptCluster?.startsWith('grundbegriffe.networkSizes')) {
        const haystack = JSON.stringify(question);
        for (const term of Object.keys(networkScopeTerms)) {
          if (haystack.includes(term)) networkScopeTerms[term] += 1;
        }
        if (question.knowledgeFacet) {
          facetCounts[question.knowledgeFacet] = (facetCounts[question.knowledgeFacet] || 0) + 1;
        }
      }

      // Answer correctly and verify practiceScore bump.
      const answer = answerForQuestion(question);
      const evaluation = evaluateEmployeeAnswer(conv, answer);
      if (evaluation.scoreAwarded) {
        const { categoryId, topicId } = topicIdsFromKey(conv.currentTopicKey);
        const before = progressBeforeByTopic.get(conv.currentTopicKey) ?? 0;
        const after = getTopicProgress(categoryId, topicId)?.practiceScore || 0;
        if (before < 100 && after <= before) {
          progressFailures += 1;
          recordFinding(findings, issueCounts, {
            type: 'progress-mapping-missing',
            questionId: question.instanceId,
            topicKey: conv.currentTopicKey,
            before,
            after,
          }, question, item);
        }
        progressBeforeByTopic.set(conv.currentTopicKey, after);
      }

      const next = advanceConversation(conv);
      if (next.state === 'summary') {
        // Keep summary available but stop this conversation.
        Object.assign(conv, { completed: true, summary: getConversationSummary(conv) });
        break;
      }
      Object.assign(conv, next.conversation);
    }
  }

  return {
    total,
    conversations,
    findings,
    issueCounts,
    networkScopeTerms,
    facetCounts,
    progressFailures,
  };
}

// =============================================================================
// Separate 300-question network-scope mass test
// =============================================================================
function runNetworkScopeMassTest(targetQuestions = 300) {
  const networkItems = getAllKnowledgeItems().filter((i) => i.conceptCluster?.startsWith('grundbegriffe.networkSizes'));
  const terms = { PAN: 0, LAN: 0, MAN: 0, WAN: 0 };
  const facets = {
    definition: 0,
    relativeSize: 0,
    identification: 0,
    scenarioClassification: 0,
  };
  let generated = 0;
  const samples = [];

  for (const item of networkItems) {
    const templates = listApplicableTemplates(item.id);
    if (!templates.length) continue;
    for (const tmpl of templates) {
      for (let seedIndex = 0; seedIndex < 50; seedIndex += 1) {
        if (generated >= targetQuestions) break;
        const seed = `phase7_1-network-${item.id}-${tmpl.id}-${seedIndex}`;
        try {
          const q = generateQuestion(item.id, tmpl.id, { contextType: 'coworker_question', seed });
          generated += 1;
          const haystack = `${q.prompt || ''} ${q.conversationText || ''} ${JSON.stringify(q.options || [])} ${JSON.stringify(q.items || [])}`;
          for (const term of Object.keys(terms)) {
            if (haystack.includes(term)) terms[term] += 1;
          }
          const facet = q.knowledgeFacet;
          if (facet) {
            if (facet.includes('definition')) facets.definition += 1;
            if (facet.includes('relativeSize')) facets.relativeSize += 1;
            if (facet.includes('identification')) facets.identification += 1;
            if (facet.includes('scenarioClassification')) facets.scenarioClassification += 1;
          }
          if (samples.length < 5) samples.push({ item: item.id, template: tmpl.id, facet, prompt: (q.prompt || q.conversationText || '').slice(0, 120) });
        } catch (e) {
          samples.push({ item: item.id, template: tmpl.id, error: e.message });
        }
      }
    }
  }

  return { generated, terms, facets, samples };
}

// =============================================================================
// Reporting
// =============================================================================
function printIssueCounts(issueCounts, label) {
  console.log(`\n${label}:`);
  const entries = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    console.log('  (none)');
    return;
  }
  for (const [key, count] of entries) {
    console.log(`  ${key}: ${count}`);
  }
}

function printTopFacets(facetCounts, label, limit = 15) {
  console.log(`\n${label}:`);
  const entries = Object.entries(facetCounts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    console.log('  (none)');
    return;
  }
  const top = entries.slice(0, limit);
  for (const [facet, count] of top) {
    console.log(`  ${facet}: ${count}`);
  }
}

console.log('=== Phase 7.1 Audit & Validation Helpers ===');

const audit = runConversationAudit(1000);

console.log(`\n--- Conversation audit results ---`);
console.log(`Total questions: ${audit.total}`);
console.log(`Conversations started: ${audit.conversations}`);
console.log(`Progress-mapping failures: ${audit.progressFailures}`);

printIssueCounts(audit.issueCounts, 'Issue counts (allowed + non-allowed)');
printTopFacets(audit.facetCounts, 'Top grundbegriffe.networkSizes facets', 20);

console.log('\nNetwork-scope term occurrences:');
for (const [term, count] of Object.entries(audit.networkScopeTerms)) {
  console.log(`  ${term}: ${count}`);
}

const networkTest = runNetworkScopeMassTest(500);

console.log(`\n--- Network-scope mass test results ---`);
console.log(`Generated questions: ${networkTest.generated}`);
console.log('Term coverage:');
for (const [term, count] of Object.entries(networkTest.terms)) {
  console.log(`  ${term}: ${count}`);
}
console.log('Facet coverage:');
for (const [facet, count] of Object.entries(networkTest.facets)) {
  console.log(`  ${facet}: ${count}`);
}
if (networkTest.samples.length) {
  console.log('\nFirst network-scope samples:');
  networkTest.samples.forEach((s) => console.log(`  ${JSON.stringify(s)}`));
}

// =============================================================================
// PASS / FAIL
// =============================================================================
let failed = false;

if (audit.total < 1000) {
  console.log(`\nFAIL: Only generated ${audit.total} questions, expected >= 1000`);
  failed = true;
}

if (audit.findings.length > 0) {
  console.log(`\nFAIL: ${audit.findings.length} non-allowed issue(s) found`);
  const samples = audit.findings.slice(0, 10);
  for (const issue of samples) {
    console.log(`  ${JSON.stringify(issue)}`);
  }
  if (audit.findings.length > 10) {
    console.log(`  ... and ${audit.findings.length - 10} more`);
  }
  failed = true;
}

const allTermsPresent = Object.values(networkTest.terms).every((c) => c > 0);
const allFacetsPresent = Object.values(networkTest.facets).every((c) => c > 0);

if (!allTermsPresent) {
  console.log('\nFAIL: Not all network-scope terms (PAN/LAN/MAN/WAN) were covered');
  failed = true;
}
if (!allFacetsPresent) {
  console.log('\nFAIL: Not all required network-scope facets were covered');
  failed = true;
}
if (networkTest.generated < 300) {
  console.log(`\nFAIL: Network-scope mass test generated only ${networkTest.generated} questions, expected >= 300`);
  failed = true;
}

if (failed) {
  console.log('\n❌ Phase 7.1 audit failed');
  process.exit(1);
}

console.log('\n✅ Phase 7.1 audit passed');
