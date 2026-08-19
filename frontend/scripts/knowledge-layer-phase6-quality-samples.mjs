// =============================================================================
// NEXUS Knowledge Layer – Phase 6 Quality Sample Generator
//
// Prints real generated conversation instances for manual inspection:
// employee, context, question, options, correct answer, facet, and the
// answer-aware Sam explanation that would be shown for a chosen wrong answer.
// =============================================================================

import {
  listApplicableTemplates,
  generateQuestion,
  setFacetMasteryOverride,
} from '../src/lib/knowledge/index.js';

const CATEGORIES = {
  osi: ['osi.layer1', 'osi.layer2', 'osi.layer3', 'osi.layer4', 'osi.layer7'],
  binarySubnet: ['binary.decimalToBinary', 'binary.prefixToMask', 'subnetting.networkId', 'subnetting.usableHosts', 'subnetting.broadcast'],
  switchingVlan: ['switching.domains', 'switching.forwardFloodFilter', 'vlan.definition', 'vlan.tagging', 'vlan.accessVsTrunk'],
  ssh: ['ssh.telnetVsSsh', 'ssh.version', 'ssh.vtyConfig', 'ssh.managementSvi', 'ssh.rsaKeyRequirements'],
};

function pickWrongOption(question) {
  if (question.type !== 'mc' || !question.options) return null;
  return question.options.find((o) => o.id !== question.correctOptionId) || null;
}

function sampleFor(itemId, seed) {
  const templates = listApplicableTemplates(itemId);
  if (templates.length === 0) return null;
  const template = templates[0];
  const question = generateQuestion(itemId, template.id, { contextType: 'coworker_question', seed });
  const wrong = pickWrongOption(question);
  let samExplanation = question.explanation;
  if (wrong && question.wrongOptionExplanations) {
    samExplanation = question.wrongOptionExplanations[wrong.id] || question.explanation;
  }
  return { question, wrong, samExplanation };
}

function printCategory(title, itemIds) {
  console.log(`\n## ${title}`);
  for (const itemId of itemIds) {
    const { question, wrong, samExplanation } = sampleFor(itemId, `phase6-sample-${itemId}`) || {};
    if (!question) continue;
    console.log(`\n[${question.knowledgeFacet}]`);
    console.log(`Employee: ${question.context?.roleHints?.join(', ') || 'any'}`);
    console.log(`Conversation: ${question.conversationText}`);
    console.log('Options:');
    for (const opt of question.options || []) {
      const marker = opt.id === question.correctOptionId ? ' (correct)' : '';
      console.log(`  - ${opt.label}${marker}`);
    }
    if (wrong) {
      console.log(`Wrong answer chosen: ${wrong.label}`);
      console.log(`Sam explains: ${samExplanation}`);
    }
  }
}

// Clear any mastery override for neutral samples.
setFacetMasteryOverride(null);

printCategory('OSI', CATEGORIES.osi);
printCategory('Binary / Subnetting', CATEGORIES.binarySubnet);
printCategory('Switching / VLAN', CATEGORIES.switchingVlan);
printCategory('SSH', CATEGORIES.ssh);
