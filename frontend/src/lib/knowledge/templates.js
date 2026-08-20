// =============================================================================
// NEXUS Knowledge Layer – Phase 2 Templates
//
// Minimal template system that turns Knowledge Items into controlled Question
// Instances. Each template declares which Knowledge Items it can consume,
// which question archetype it produces, and a deterministic generator.
//
// Principles:
//   - No free text generation at runtime.
//   - Templates only use fields the Knowledge Item actually provides.
//   - Distractors come from siblings, explicit lists or controlled math.
//   - Natural-language variants are optional metadata, not the faktual core.
// =============================================================================

import {
  KNOWLEDGE_TYPES,
  QUESTION_ARCHETYPES,
  PROMPT_STYLES,
  CONTEXT_DEPENDENCIES,
} from './types.js';
import {
  siblingDistractors,
  sameClusterDistractors,
  buildMcOptions,
} from './distractors.js';
import { generateCalculationData } from './calculationGenerators.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const NEUTRAL_LEADS = [
  'Kannst du mir kurz bei etwas helfen?',
  'Ich bin mir bei einer Sache gerade nicht sicher.',
  'Kannst du das kurz gegenprüfen?',
  'Kurze Abfrage:',
  'Ich wollte das gerade nochmal sicher wissen:',
];

function chooseLead(leads, rng) {
  if (!leads || leads.length === 0) return '';
  return leads[Math.floor(rng.next() * leads.length)];
}

function makeInstanceId(templateId, itemId, seed) {
  return `${templateId}.${itemId}.${seed}`;
}

/**
 * Build the full natural-language utterance for a conversation.
 * - bare prompt           -> prepend a compatible lead
 * - self-contained prompt -> render as-is (the template already owns the full utterance)
 * - direct/academy mode    -> return the bare prompt
 */
function buildConversationText({ prompt, promptStyle, contextType, conversationLeads, rng }) {
  if (contextType !== 'coworker_question') return prompt;
  if (promptStyle === PROMPT_STYLES.SELF_CONTAINED) return prompt;
  const lead = chooseLead(conversationLeads || NEUTRAL_LEADS, rng);
  return lead ? `${lead} ${prompt}` : prompt;
}

function baseInstance({ templateId, item, archetype, seed, prompt, contextType, speechLeadIn, roleHints, learningObjective, knowledgeFacet, promptStyle, contextDependency }) {
  return {
    instanceId: makeInstanceId(templateId, item.id, seed),
    topicKey: item.topicKey,
    knowledgeItemId: item.id,
    conceptCluster: item.conceptCluster,
    learningObjective: learningObjective || item.conceptCluster || null,
    knowledgeFacet: knowledgeFacet || `${item.conceptCluster}.${templateId}` || null,
    questionArchetype: archetype,
    difficulty: item.difficulty,
    prompt,
    promptStyle: promptStyle || PROMPT_STYLES.SELF_CONTAINED,
    contextDependency: contextDependency || CONTEXT_DEPENDENCIES.NEUTRAL,
    sourceTopicKey: item.sourceTopicKey,
    semanticTags: [item.conceptCluster.split('.')[0], item.conceptCluster, archetype],
    context: {
      contextType,
      roleHints: roleHints || [],
      speechLeadIn: speechLeadIn || null,
      templateId,
    },
  };
}

function buildMcInstance({ templateId, item, archetype, seed, prompt, correctValue, distractorValues, explanation, contextType, speechLeadIn, roleHints, rng, calculationParams = null, answerFormat = null, extraSemanticTags = [], learningObjective = null, knowledgeFacet = null, promptStyle = PROMPT_STYLES.SELF_CONTAINED, contextDependency = CONTEXT_DEPENDENCIES.NEUTRAL, conversationLeads = null, wrongOptionExplanations = null }) {
  const { options, correctOptionId } = buildMcOptions(String(correctValue), distractorValues, rng, 'opt');
  const instance = baseInstance({ templateId, item, archetype, seed, prompt, contextType, speechLeadIn, roleHints, learningObjective, knowledgeFacet, promptStyle, contextDependency });
  instance.options = options;
  instance.correctOptionId = correctOptionId;
  instance.correctAnswer = { optionId: correctOptionId, label: String(correctValue) };
  instance.explanation = explanation || item.data.description || prompt;
  instance.conversationText = buildConversationText({ prompt, promptStyle, contextType, conversationLeads, rng });
  instance.ttsText = instance.conversationText;
  if (calculationParams) instance.calculationParams = calculationParams;
  if (answerFormat) instance.answerFormat = answerFormat;
  if (wrongOptionExplanations) {
    // Templates usually know explanations by label; map them to the generated
    // option IDs so the conversation engine can look them up by answer id.
    instance.wrongOptionExplanations = {};
    for (const opt of options) {
      const expl = wrongOptionExplanations[opt.label];
      if (expl) instance.wrongOptionExplanations[opt.id] = expl;
    }
  }
  if (extraSemanticTags.length > 0) {
    instance.semanticTags = Array.from(new Set([...instance.semanticTags, ...extraSemanticTags]));
  }
  // Conversation-compatible legacy fields.
  instance.type = 'mc';
  instance.text = prompt;
  instance.correct = options.findIndex((o) => o.id === correctOptionId);
  return instance;
}

function buildOrderingInstance({ templateId, item, archetype, seed, prompt, items, correctOrderIds, explanation, contextType, speechLeadIn, roleHints, rng, learningObjective = null, knowledgeFacet = null, promptStyle = PROMPT_STYLES.SELF_CONTAINED, contextDependency = CONTEXT_DEPENDENCIES.NEUTRAL, conversationLeads = null }) {
  const instance = baseInstance({ templateId, item, archetype, seed, prompt, contextType, speechLeadIn, roleHints, learningObjective, knowledgeFacet, promptStyle, contextDependency });
  instance.itemMap = Object.fromEntries(items.map((it) => [it.id, it.label]));
  instance.items = rng.shuffle([...items]);
  instance.correctOrderIds = correctOrderIds;
  instance.correctOrderLabels = correctOrderIds.map((id) => instance.itemMap[id]);
  instance.correctAnswer = { orderIds: correctOrderIds };
  instance.explanation = explanation;
  instance.conversationText = buildConversationText({ prompt, promptStyle, contextType, conversationLeads, rng });
  instance.ttsText = instance.conversationText;
  instance.type = 'ordering';
  instance.text = prompt;
  return instance;
}

function buildMatchingInstance({ templateId, item, archetype, seed, prompt, pairs, correctPairs, explanation, contextType, speechLeadIn, roleHints, rng, learningObjective = null, knowledgeFacet = null, promptStyle = PROMPT_STYLES.SELF_CONTAINED, contextDependency = CONTEXT_DEPENDENCIES.NEUTRAL, conversationLeads = null }) {
  const instance = baseInstance({ templateId, item, archetype, seed, prompt, contextType, speechLeadIn, roleHints, learningObjective, knowledgeFacet, promptStyle, contextDependency });
  const left = rng.shuffle([...pairs.map((p) => ({ id: p.leftId, label: p.leftLabel }))]);
  const right = rng.shuffle([...pairs.map((p) => ({ id: p.rightId, label: p.rightLabel }))]);
  instance.pairs = { left, right };
  instance.leftMap = Object.fromEntries(pairs.map((p) => [p.leftId, p.leftLabel]));
  instance.rightMap = Object.fromEntries(pairs.map((p) => [p.rightId, p.rightLabel]));
  instance.correctPairLabels = correctPairs.map((p) => ({ left: instance.leftMap[p.leftId], right: instance.rightMap[p.rightId] }));
  // Provide the same data under the legacy leftItems/rightItems keys so that
  // conversation components and older evaluators keep working.
  instance.leftItems = left;
  instance.rightItems = right;
  instance.correctPairs = correctPairs;
  instance.correctAnswer = { pairs: correctPairs };
  instance.explanation = explanation;
  instance.conversationText = buildConversationText({ prompt, promptStyle, contextType, conversationLeads, rng });
  instance.ttsText = instance.conversationText;
  instance.type = 'matching';
  instance.text = prompt;
  return instance;
}

/**
 * Legacy helper: prepends a lead to a prompt.  Prefer using buildConversationText
 * with explicit promptStyle/conversationLeads to avoid double actor embedding.
 */
function withCoworkerLead(prompt, leads, rng) {
  const lead = chooseLead(leads, rng);
  return lead ? `${lead} ${prompt}` : prompt;
}

// ---------------------------------------------------------------------------
// OSI templates
// ---------------------------------------------------------------------------

const osiLayerLeads = [
  'Ich verwechsle die Schichten ständig.',
  'Kannst du mir kurz helfen?',
  'Ich lerne gerade für die Prüfung und bin unsicher:',
  'Ich habe gelesen, dass die OSI-Schichten wichtig sind.',
];

function osiLayerObjective(item, aspect) {
  return `osi.layer${item.data.layer}.${aspect}`;
}

function osiLayerTemplates() {
  const layer = (item) => item.data;
  return [
    {
      id: 'osi.layer.numberToName',
      archetype: QUESTION_ARCHETYPES.MAPPING,
      matches: (item) => item.conceptCluster === 'osi.layers' && item.type === KNOWLEDGE_TYPES.MAPPING,
      supportedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.RECALL],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = `Wie heißt OSI-Schicht ${layer(item).layer}?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, osiLayerLeads, rng)
          : directPrompt;
        const name = layer(item).name;
        const distractors = siblingDistractors(item, allItemsById, 3, (sib) => sib.data.name, rng);
        const siblings = Object.values(allItemsById).filter((sib) => sib.conceptCluster === item.conceptCluster && sib.id !== item.id);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[sib.data.name] = `${sib.data.name} ist OSI-Schicht ${sib.data.layer}. Schicht ${layer(item).layer} heißt dagegen ${name}.`;
        }
        return buildMcInstance({
          templateId: 'osi.layer.numberToName',
          item,
          archetype: QUESTION_ARCHETYPES.MAPPING,
          seed,
          prompt,
          correctValue: name,
          distractorValues: distractors,
          explanation: `${name} ist OSI-Schicht ${layer(item).layer}.`,
          contextType,
          speechLeadIn: contextType === 'coworker_question' ? prompt.split('.')[0] + '.' : null,
          roleHints: ['technical'],
          rng,
          learningObjective: `osi.layer${layer(item).layer}`,
          knowledgeFacet: osiLayerObjective(item, 'name'),
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: osiLayerLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'osi.layer.nameToNumber',
      archetype: QUESTION_ARCHETYPES.MAPPING,
      matches: (item) => item.conceptCluster === 'osi.layers' && item.type === KNOWLEDGE_TYPES.MAPPING,
      supportedQuestionTypes: [QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.RECALL],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = `Welche Nummer hat die OSI-Schicht "${layer(item).name}"?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, osiLayerLeads, rng)
          : directPrompt;
        const num = layer(item).layer;
        const distractors = siblingDistractors(item, allItemsById, 3, (sib) => String(sib.data.layer), rng);
        const siblings = Object.values(allItemsById).filter((sib) => sib.conceptCluster === item.conceptCluster && sib.id !== item.id);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[String(sib.data.layer)] = `Schicht ${sib.data.layer} ist die ${sib.data.name}. Die gesuchte Schicht "${layer(item).name}" hat dagegen die Nummer ${num}.`;
        }
        return buildMcInstance({
          templateId: 'osi.layer.nameToNumber',
          item,
          archetype: QUESTION_ARCHETYPES.MAPPING,
          seed,
          prompt,
          correctValue: num,
          distractorValues: distractors,
          explanation: `${layer(item).name} ist OSI-Schicht ${num}.`,
          contextType,
          speechLeadIn: contextType === 'coworker_question' ? prompt.split('.')[0] + '.' : null,
          roleHints: ['technical'],
          rng,
          learningObjective: `osi.layer${layer(item).layer}`,
          knowledgeFacet: osiLayerObjective(item, 'name'),
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: osiLayerLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'osi.layer.taskToLayer',
      archetype: QUESTION_ARCHETYPES.SCENARIO,
      matches: (item) => item.conceptCluster === 'osi.layers' && item.type === KNOWLEDGE_TYPES.MAPPING,
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const task = layer(item).responsibility;
        const directPrompt = `Auf welcher OSI-Schicht ist man zuständig für: "${task}"?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, osiLayerLeads, rng)
          : directPrompt;
        const name = layer(item).name;
        const distractors = siblingDistractors(item, allItemsById, 3, (sib) => sib.data.name, rng);
        const siblings = Object.values(allItemsById).filter((sib) => sib.conceptCluster === item.conceptCluster && sib.id !== item.id);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[sib.data.name] = `Die ${sib.data.name} ist zuständig für ${sib.data.responsibility}. Für ${task} ist dagegen die ${name} zuständig.`;
        }
        return buildMcInstance({
          templateId: 'osi.layer.taskToLayer',
          item,
          archetype: QUESTION_ARCHETYPES.SCENARIO,
          seed,
          prompt,
          correctValue: name,
          distractorValues: distractors,
          explanation: `Für ${task} ist die ${name} zuständig.`,
          contextType,
          speechLeadIn: contextType === 'coworker_question' ? prompt.split('.')[0] + '.' : null,
          roleHints: ['helpdesk'],
          rng,
          learningObjective: `osi.layer${layer(item).layer}`,
          knowledgeFacet: osiLayerObjective(item, 'function'),
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: osiLayerLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'osi.layer.faultToLayer',
      archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
      matches: (item) => item.conceptCluster === 'osi.layers' && item.type === KNOWLEDGE_TYPES.MAPPING && item.data.typicalFaults.length > 0,
      supportedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const fault = rng.pick(layer(item).typicalFaults);
        const directPrompt = `Bei "${fault}" – auf welcher OSI-Schicht beginnst du die Diagnose?`;
        const scenarioLeads = [
          'Ein Techniker meldet einen Fehler.',
          'Fehlersuche:',
          'Ein Kollege berichtet:',
        ];
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, scenarioLeads, rng)
          : directPrompt;
        const name = layer(item).name;
        const distractors = siblingDistractors(item, allItemsById, 3, (sib) => sib.data.name, rng);
        const siblings = Object.values(allItemsById).filter((sib) => sib.conceptCluster === item.conceptCluster && sib.id !== item.id);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          const sibFaults = sib.data.typicalFaults.slice(0, 2).join(', ');
          wrongOptionExplanations[sib.data.name] = `Die ${sib.data.name} behandelt eher ${sibFaults || 'andere Probleme'}. Bei "${fault}" beginnst du dagegen bei der ${name}.`;
        }
        return buildMcInstance({
          templateId: 'osi.layer.faultToLayer',
          item,
          archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
          seed,
          prompt,
          correctValue: name,
          distractorValues: distractors,
          explanation: `Bei "${fault}" beginnst du die Diagnose auf der ${name}.`,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk', 'technical'],
          rng,
          learningObjective: `osi.layer${layer(item).layer}`,
          knowledgeFacet: osiLayerObjective(item, 'troubleshooting'),
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: scenarioLeads,
          wrongOptionExplanations,
        });
      },
    },
  ];
}

function osiOrderingTemplates() {
  return [
    {
      id: 'osi.encapsulationOrder.sender',
      archetype: QUESTION_ARCHETYPES.ORDERING,
      matches: (item) => item.id === 'osi.encapsulationOrder',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const order = item.data.senderOrder;
        const labels = ['Anwendung', 'Darstellung', 'Sitzung', 'Transport', 'Vermittlung', 'Sicherung', 'Bitübertragung'];
        const items = order.map((num, idx) => ({ id: `l${num}`, label: labels[idx] }));
        const directPrompt = 'Bringe die OSI-Schichten in die Reihenfolge, in der Daten beim Sender kapselt werden – beginnend mit der höchsten Schicht.';
        const prompt = contextType === 'coworker_question'
          ? `Ich verwechsle ständig die Kapselungsrichtung. ${directPrompt}`
          : directPrompt;
        return buildOrderingInstance({
          templateId: 'osi.encapsulationOrder.sender',
          item,
          archetype: QUESTION_ARCHETYPES.ORDERING,
          seed,
          prompt,
          items,
          correctOrderIds: order.map((num) => `l${num}`),
          explanation: 'Beim Senden kapseln Daten von Schicht 7 (Anwendung) nach Schicht 1 (Bitübertragung).',
          contextType,
          speechLeadIn: contextType === 'coworker_question' ? 'Ich verwechsle ständig die Kapselungsrichtung.' : null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'osi.encapsulation',
          knowledgeFacet: 'osi.encapsulation.senderOrder',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Ich verwechsle ständig die Kapselungsrichtung.'],
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Binary templates
// ---------------------------------------------------------------------------

const binaryLeads = [
  'Ich rechne gerade an Oktett-Werten.',
  'Kurze Abfrage zum Binär:',
  'Ich brauche für die Dokumentation die Binärdarstellung.',
];

function binaryTemplates() {
  return [
    {
      id: 'binary.bitValues.order',
      archetype: QUESTION_ARCHETYPES.ORDERING,
      matches: (item) => item.id === 'binary.bitValues',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const values = item.data.values;
        const items = values.map((v, i) => ({ id: `bit${i}`, label: String(v) }));
        const directPrompt = 'Sortiere die Bit-Stellenwerte eines Oktetts beginnend mit dem höchsten Stellenwert (128) bis zum niedrigsten (1).';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Ich habe die Bitwerte durcheinandergebracht.', 'Kurze Abfrage:'], rng)
          : directPrompt;
        return buildOrderingInstance({
          templateId: 'binary.bitValues.order',
          item,
          archetype: QUESTION_ARCHETYPES.ORDERING,
          seed,
          prompt,
          items,
          correctOrderIds: items.map((it) => it.id),
          explanation: 'Ein Oktett hat die Stellenwerte 128, 64, 32, 16, 8, 4, 2, 1.',
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'binary.values',
          knowledgeFacet: 'binary.values.order',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Ich habe die Bitwerte durcheinandergebracht.', 'Kurze Abfrage:'],
        });
      },
    },
    {
      id: 'binary.decimalToBinary',
      archetype: QUESTION_ARCHETYPES.CALCULATION,
      matches: (item) => item.id === 'binary.decimalToBinary',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0', difficulty = null } = {}) => {
        const calc = generateCalculationData(item, rng, { difficulty, contextType });
        return buildMcInstance({
          templateId: 'binary.decimalToBinary',
          item,
          archetype: QUESTION_ARCHETYPES.CALCULATION,
          seed,
          prompt: calc.prompt,
          correctValue: calc.correctAnswer,
          distractorValues: calc.distractors,
          explanation: calc.explanation,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          calculationParams: calc.params,
          answerFormat: calc.answerFormat,
          extraSemanticTags: calc.semanticTags,
          learningObjective: 'binary.decimalToBinary',
          knowledgeFacet: 'binary.decimalToBinary.calculation',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.PARAMETRIC,
        });
      },
    },
    {
      id: 'binary.binaryToDecimal',
      archetype: QUESTION_ARCHETYPES.CALCULATION,
      matches: (item) => item.id === 'binary.binaryToDecimal',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0', difficulty = null } = {}) => {
        const calc = generateCalculationData(item, rng, { difficulty, contextType });
        return buildMcInstance({
          templateId: 'binary.binaryToDecimal',
          item,
          archetype: QUESTION_ARCHETYPES.CALCULATION,
          seed,
          prompt: calc.prompt,
          correctValue: calc.correctAnswer,
          distractorValues: calc.distractors,
          explanation: calc.explanation,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          calculationParams: calc.params,
          answerFormat: calc.answerFormat,
          extraSemanticTags: calc.semanticTags,
          learningObjective: 'binary.binaryToDecimal',
          knowledgeFacet: 'binary.binaryToDecimal.calculation',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.PARAMETRIC,
        });
      },
    },
    {
      id: 'binary.octetRange',
      archetype: QUESTION_ARCHETYPES.RECALL,
      matches: (item) => item.id === 'binary.octetRange',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Welchen Wertebereich kann ein Oktett (8 Bit) darstellen?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, binaryLeads, rng)
          : directPrompt;
        const correct = `Von ${item.data.min} bis ${item.data.max}.`;
        const distractors = ['Von 0 bis 256.', 'Von 1 bis 256.', 'Von 0 bis 128.'];
        const wrongOptionExplanations = {
          'Von 0 bis 256.': 'Mit 8 Bit lassen sich 256 verschiedene Werte darstellen, aber die Zählung beginnt bei 0, daher ist die obere Grenze 255.',
          'Von 1 bis 256.': 'Ein Oktett kann den Wert 0 annehmen und maximal 255, nicht 256.',
          'Von 0 bis 128.': '0 bis 128 sind nur 129 Werte; 8 Bit können 256 verschiedene Werte darstellen.',
        };
        return buildMcInstance({
          templateId: 'binary.octetRange',
          item,
          archetype: QUESTION_ARCHETYPES.RECALL,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['general'],
          rng,
          learningObjective: 'binary.range',
          knowledgeFacet: 'binary.range.octet',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: binaryLeads,
          wrongOptionExplanations,
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// IPv4 templates
// ---------------------------------------------------------------------------

const ipv4Leads = ['Schnelle Abfrage:', 'Stimmt das so?', 'Kurze Abfrage:'];

function ipv4Templates() {
  return [
    {
      id: 'ipv4.structure.bits',
      archetype: QUESTION_ARCHETYPES.RECALL,
      matches: (item) => item.id === 'ipv4.structure',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Wie viele Bit hat eine IPv4-Adresse insgesamt?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ipv4Leads, rng)
          : directPrompt;
        const correct = item.data.totalBits;
        return buildMcInstance({
          templateId: 'ipv4.structure.bits',
          item,
          archetype: QUESTION_ARCHETYPES.RECALL,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: [16, 48, 64],
          contextType,
          speechLeadIn: null,
          roleHints: ['general'],
          rng,
          learningObjective: 'ipv4.structure',
          knowledgeFacet: 'ipv4.structure.bits',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ipv4Leads,
        });
      },
    },
    {
      id: 'ipv4.privateRanges',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'ipv4.privateRanges',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const ranges = item.data.ranges;
        const correctEntry = rng.pick([...ranges]);
        const directPrompt = 'Welche dieser IPv4-Adressen liegt in einem privaten Bereich?';
        const prompt = contextType === 'coworker_question'
          ? 'Ein Kollege fragt, ob diese Adresse wirklich nur intern geroutet werden darf. Welche davon wäre im privaten IPv4-Bereich?'
          : directPrompt;
        // Build plausible options: one from the correct range, others public/loopback.
        const correctIp = pickFromRange(correctEntry.network, rng);
        const distractorIps = [
          '8.8.8.8',
          '1.1.1.1',
          '9.9.9.9',
          '127.0.0.1',
          '169.254.1.5',
        ];
        const wrongOptionExplanations = {
          '8.8.8.8': '8.8.8.8 ist ein öffentlicher Google-DNS-Server, kein privater Bereich.',
          '1.1.1.1': '1.1.1.1 ist ein öffentlicher Cloudflare-DNS-Server, kein privater Bereich.',
          '9.9.9.9': '9.9.9.9 ist ein öffentlicher Quad9-DNS-Server, kein privater Bereich.',
          '127.0.0.1': '127.0.0.1 ist Loopback und für lokale Diagnose gedacht, nicht für private Netzwerke.',
          '169.254.1.5': '169.254.x.x ist APIPA/Link-Local, nicht einer der privaten Bereiche.',
        };
        return buildMcInstance({
          templateId: 'ipv4.privateRanges',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correctIp,
          distractorValues: rng.shuffle(distractorIps).slice(0, 3),
          explanation: `${correctEntry.network} gehört zu den privaten IPv4-Bereichen.`,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
          learningObjective: 'ipv4.ranges',
          knowledgeFacet: 'ipv4.ranges.private',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.SCENARIO,
          conversationLeads: [],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ipv4.loopback',
      archetype: QUESTION_ARCHETYPES.RECALL,
      matches: (item) => item.id === 'ipv4.loopback',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Welche Adresse wird typischerweise als Loopback-Adresse verwendet?';
        const prompt = contextType === 'coworker_question'
          ? 'Ein Test soll prüfen, ob der eigene TCP/IP-Stack funktioniert. ' + directPrompt
          : directPrompt;
        const wrongOptionExplanations = {
          '0.0.0.0': '0.0.0.0 ist die Default-Route, keine Loopback-Adresse.',
          '255.255.255.255': '255.255.255.255 ist eine Limited-Broadcast-Adresse, kein Loopback.',
          '192.168.0.1': '192.168.0.1 ist eine typische private Router-IP, kein Loopback.',
        };
        return buildMcInstance({
          templateId: 'ipv4.loopback',
          item,
          archetype: QUESTION_ARCHETYPES.RECALL,
          seed,
          prompt,
          correctValue: item.data.typical,
          distractorValues: ['0.0.0.0', '255.255.255.255', '192.168.0.1'],
          explanation: `Die Loopback-Adresse ${item.data.typical} testet den eigenen TCP/IP-Stack.`,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ipv4.special',
          knowledgeFacet: 'ipv4.special.loopback',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.SCENARIO,
          conversationLeads: [],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ipv4.apipa',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'ipv4.apipa',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Ein Client bekommt keine IP von DHCP und zeigt eine 169.254.x.x-Adresse. Was bedeutet das typischerweise?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Ich habe einen Client, der keine IP bekommt.', 'Kurze Abfrage:'], rng)
          : directPrompt;
        const correct = 'Kein DHCP-Server war erreichbar; der Client hat sich selbst eine Link-Local-Adresse zugewiesen.';
        const distractors = [
          'Der Client hat eine gültige öffentliche IP erhalten.',
          'Das Gateway ist nicht konfiguriert.',
          'Der Switch-Port ist deaktiviert.',
        ];
        const wrongOptionExplanations = {
          'Der Client hat eine gültige öffentliche IP erhalten.': '169.254.x.x ist kein öffentlicher Bereich, sondern Link-Local/APIPA.',
          'Das Gateway ist nicht konfiguriert.': 'Fehlendes Gateway würde andere Symptome zeigen; 169.254.x.x entsteht durch fehlenden DHCP.',
          'Der Switch-Port ist deaktiviert.': 'Bei deaktiviertem Port würde gar keine IP-Anzeige erfolgen, nicht APIPA.',
        };
        return buildMcInstance({
          templateId: 'ipv4.apipa',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: correct,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
          learningObjective: 'ipv4.special',
          knowledgeFacet: 'ipv4.special.apipa',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.SCENARIO,
          conversationLeads: [],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ipv4.cidrPrefix',
      archetype: QUESTION_ARCHETYPES.RECALL,
      matches: (item) => item.id === 'ipv4.cidrPrefix',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Was gibt der CIDR-Präfix in einer IPv4-Adresse an?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Kurze Abfrage zum Präfix:', 'Ich prüfe gerade die IP-Notation.'], rng)
          : directPrompt;
        const correct = 'Wie viele Bits zum Netzanteil gehören.';
        const distractors = [
          'Wie viele Hosts im Netz maximal aktiv sein dürfen.',
          'Welches Subnetz als erstes vergeben wird.',
          'Die Anzahl der verfügbaren Ports auf dem Server.',
        ];
        const wrongOptionExplanations = {
          'Wie viele Hosts im Netz maximal aktiv sein dürfen.': 'Die Hostanzahl ergibt sich aus den Hostbits, also 32 minus Präfix. Der Präfix selbst gibt die Netzbits an.',
          'Welches Subnetz als erstes vergeben wird.': 'Der Präfix legt die Größe fest, nicht die Reihenfolge oder Nummerierung der Subnetze.',
          'Die Anzahl der verfügbaren Ports auf dem Server.': 'Ports auf einem Server haben nichts mit dem CIDR-Präfix zu tun.',
        };
        return buildMcInstance({
          templateId: 'ipv4.cidrPrefix',
          item,
          archetype: QUESTION_ARCHETYPES.RECALL,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['general'],
          rng,
          learningObjective: 'ipv4.cidr',
          knowledgeFacet: 'ipv4.cidr.prefixMeaning',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Kurze Abfrage zum Präfix:', 'Ich prüfe gerade die IP-Notation.'],
          wrongOptionExplanations,
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Subnetting / IPv4 calculation templates
// ---------------------------------------------------------------------------

function makeCalculationTemplate(id, itemId, allowedQuestionTypes) {
  return {
    id,
    archetype: QUESTION_ARCHETYPES.CALCULATION,
    matches: (item) => item.id === itemId,
    supportedQuestionTypes: allowedQuestionTypes,
    generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0', difficulty = null } = {}) => {
      const calc = generateCalculationData(item, rng, { difficulty, contextType });
      const family = item.data.calculationFamily;
      const target = item.data.target || 'mask';
      const learningObjective = family === 'subnetting' ? 'subnetting.calculation' : `binary.${family}`;
      const knowledgeFacet = family === 'subnetting'
        ? `subnetting.calculation.${target}`
        : `binary.${family}.calculation`;
      return buildMcInstance({
        templateId: id,
        item,
        archetype: QUESTION_ARCHETYPES.CALCULATION,
        seed,
        prompt: calc.prompt,
        correctValue: calc.correctAnswer,
        distractorValues: calc.distractors,
        explanation: calc.explanation,
        contextType,
        speechLeadIn: null,
        roleHints: ['technical'],
        rng,
        calculationParams: calc.params,
        answerFormat: calc.answerFormat,
        extraSemanticTags: calc.semanticTags,
        learningObjective,
        knowledgeFacet,
        promptStyle: PROMPT_STYLES.SELF_CONTAINED,
        contextDependency: CONTEXT_DEPENDENCIES.PARAMETRIC,
      });
    },
  };
}

const SUBNETTING_QT = [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO];
const PREFIX_TO_MASK_QT = [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.MAPPING, QUESTION_ARCHETYPES.SELECT_BEST];
const MASK_TO_PREFIX_QT = [QUESTION_ARCHETYPES.CALCULATION, QUESTION_ARCHETYPES.INPUT, QUESTION_ARCHETYPES.SELECT_BEST];

function subnettingTemplates() {
  return [
    makeCalculationTemplate('subnetting.prefixToMask', 'subnetMasks.prefixToMask', PREFIX_TO_MASK_QT),
    makeCalculationTemplate('subnetting.maskToPrefix', 'subnetMasks.maskToPrefix', MASK_TO_PREFIX_QT),
    makeCalculationTemplate('subnetting.networkId', 'subnetting.networkId', SUBNETTING_QT),
    makeCalculationTemplate('subnetting.broadcast', 'subnetting.broadcast', SUBNETTING_QT),
    makeCalculationTemplate('subnetting.firstHost', 'subnetting.firstHost', SUBNETTING_QT),
    makeCalculationTemplate('subnetting.lastHost', 'subnetting.lastHost', SUBNETTING_QT),
    makeCalculationTemplate('subnetting.usableHosts', 'subnetting.usableHosts', SUBNETTING_QT),
    makeCalculationTemplate('subnetting.jumpSize', 'subnetting.jumpSize', SUBNETTING_QT),
  ];
}

// ---------------------------------------------------------------------------
// Switching / VLAN templates
// ---------------------------------------------------------------------------

const vlanLeads = [
  'Wir planen gerade die Netzwerkstruktur um.',
  'Ich will zwei Abteilungen logisch trennen.',
  'Ein PC wurde umgezogen und landet im falschen Netz.',
];

function switchingVlanTemplates() {
  return [
    {
      id: 'switching.domains',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'switching.domains',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const facts = [
          { label: 'Jeder Switch-Port bildet eine eigene Kollisionsdomäne.', correct: true, source: 'collisionDomain' },
          { label: 'Ohne VLANs teilen sich alle angeschlossenen Geräte eine gemeinsame Broadcast-Domäne.', correct: true, source: 'broadcastDomain' },
        ];
        const fact = rng.pick(facts);
        const isCollision = fact.source === 'collisionDomain';
        const directPrompt = isCollision
          ? 'Was gilt bei einem Switch für Kollisionsdomänen pro Port?'
          : 'Wann endet eine Broadcast-Domäne in einem normalen (nicht VLAN-segmentierten) Switch-Netz?';
        const leads = isCollision
          ? [
            'Ich verwechsle Kollisions- und Broadcast-Domänen ständig.',
            'Beim Kabeltausch diskutierten wir gerade: teilt ein Switch damit auch Kollisionsdomänen?',
          ]
          : [
            'Ich trenne hier gerade zwei Bereiche logisch.',
            'Wir planen ein flaches Netz ohne VLANs.',
          ];
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, leads, rng)
          : directPrompt;
        const distractors = [
          'Ein Switch teilt Broadcast-Domänen pro Port.',
          'Hubs bilden eigene Kollisionsdomänen pro Port.',
          'Router leiten Broadcasts im selben Netz weiter.',
        ];
        const wrongOptionExplanations = {
          'Ein Switch teilt Broadcast-Domänen pro Port.': 'Nein – ein Switch teilt Kollisionsdomänen pro Port, aber Broadcasts gehen an alle Ports innerhalb desselben VLANs.',
          'Hubs bilden eigene Kollisionsdomänen pro Port.': 'Nein – Hubs kennen keine eigenen Kollisionsdomänen pro Port, das macht erst ein Switch.',
          'Router leiten Broadcasts im selben Netz weiter.': 'Nein – Router begrenzen Broadcast-Domänen und leiten Broadcasts normalerweise nicht weiter.',
        };
        return buildMcInstance({
          templateId: 'switching.domains',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: fact.label,
          distractorValues: rng.shuffle(distractors).slice(0, 3),
          explanation: fact.label,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'switching.domains',
          knowledgeFacet: 'switching.domains.kinds',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: leads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'switching.macLearning',
      archetype: QUESTION_ARCHETYPES.ORDERING,
      matches: (item) => item.id === 'switching.macLearning',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const steps = item.data.steps;
        const items = steps.map((step, idx) => ({ id: `m${idx}`, label: step }));
        const directPrompt = 'Bringe die Schritte des MAC-Address-Learnings in die richtige Reihenfolge.';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Wie lernt ein Switch eigentlich MAC-Adressen?', 'Kurze Abfrage:'], rng)
          : directPrompt;
        return buildOrderingInstance({
          templateId: 'switching.macLearning',
          item,
          archetype: QUESTION_ARCHETYPES.ORDERING,
          seed,
          prompt,
          items,
          correctOrderIds: items.map((it) => it.id),
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'switching.macLearning',
          knowledgeFacet: 'switching.macLearning.order',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Wie lernt ein Switch eigentlich MAC-Adressen?', 'Kurze Abfrage:'],
        });
      },
    },
    {
      id: 'switching.deviceCompare',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.id === 'switching.deviceCompare',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const correctDevice = rng.pick(item.data.items);
        const directPrompt = `Was ist die Hauptaufgabe eines ${correctDevice.name}?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Ich verwechsle Hub, Switch und Router.', 'Kurze Abfrage:'], rng)
          : directPrompt;
        const correctLabel = correctDevice.behavior;
        const siblings = item.data.items.filter((d) => d.name !== correctDevice.name);
        const distractors = siblings.map((d) => d.behavior);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[sib.behavior] = `Das beschreibt eher ein ${sib.name}. Ein ${correctDevice.name} ${correctDevice.behavior.toLowerCase()}.`;
        }
        return buildMcInstance({
          templateId: 'switching.deviceCompare',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: correctLabel,
          distractorValues: distractors,
          explanation: `Ein ${correctDevice.name} ${correctDevice.behavior.toLowerCase()}.`,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
          learningObjective: 'switching.devices',
          knowledgeFacet: 'switching.devices.compare',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Ich verwechsle Hub, Switch und Router.', 'Kurze Abfrage:'],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'switching.forwardFloodFilter',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'switching.forwardFloodFilter',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const caseEntry = rng.pick(item.data.cases);
        const directPrompt = `Ein Switch empfängt einen Frame, bei dem ${caseEntry.condition}. Was tut er?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Kannst du mir kurz helfen?', 'Switch-Verhalten:'], rng)
          : directPrompt;
        const correct = caseEntry.action;
        const siblingCases = item.data.cases.filter((c) => c.action !== correct);
        const distractors = siblingCases.map((c) => c.action);
        const wrongOptionExplanations = {};
        for (const sib of siblingCases) {
          wrongOptionExplanations[sib.action] = `Das würde eher passen, wenn ${sib.condition}. Hier ist aber ${caseEntry.condition}.`;
        }
        return buildMcInstance({
          templateId: 'switching.forwardFloodFilter',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: `Wenn ${caseEntry.condition}, ${caseEntry.action}.`,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'switching.actions',
          knowledgeFacet: 'switching.actions.behavior',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Kannst du mir kurz helfen?', 'Switch-Verhalten:'],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'vlan.accessVsTrunk',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.id === 'vlan.accessVsTrunk',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const portType = rng.pick(item.data.items);
        const isAccess = portType.name === 'Access-Port';
        const directPrompt = isAccess
          ? 'An welchem Porttyp hängt typischerweise ein Endgerät und transportiert er genau ein VLAN?'
          : 'Welcher Porttyp transportiert mehrere VLANs, typischerweise zwischen Switchen oder zu einem Router?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, vlanLeads, rng)
          : directPrompt;
        const correct = `${portType.endpoint}: ${portType.carries}`;
        const siblings = item.data.items.filter((p) => p.name !== portType.name);
        const distractors = siblings.map((p) => `${p.endpoint}: ${p.carries}`);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[`${sib.endpoint}: ${sib.carries}`] = `Das beschreibt einen ${sib.name}. Ein ${portType.name} ist dagegen für ${portType.endpoint} gedacht.`;
        }
        return buildMcInstance({
          templateId: 'vlan.accessVsTrunk',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: `Ein ${portType.name} ist für ${correct.toLowerCase()}.`,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
          learningObjective: 'vlan.ports',
          knowledgeFacet: 'vlan.ports.compare',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: vlanLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'vlan.benefits',
      archetype: QUESTION_ARCHETYPES.MATCHING,
      matches: (item) => item.id === 'vlan.benefits',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const benefits = item.data.benefits;
        const directPrompt = 'Ordne jedem VLAN-Vorteil die passende Beschreibung zu.';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Wir prüfen gerade die VLAN-Argumente.', vlanLeads[1]], rng)
          : directPrompt;
        const pairs = benefits.map((b, idx) => ({
          leftId: `b${idx}`,
          leftLabel: b.name,
          rightId: `d${idx}`,
          rightLabel: b.description,
        }));
        const correctPairs = pairs.map((p) => ({ leftId: p.leftId, rightId: p.rightId }));
        return buildMatchingInstance({
          templateId: 'vlan.benefits',
          item,
          archetype: QUESTION_ARCHETYPES.MATCHING,
          seed,
          prompt,
          pairs,
          correctPairs,
          explanation: 'VLANs bringen Sicherheit, weniger Broadcast-Verkehr, Flexibilität und bessere Struktur.',
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
          learningObjective: 'vlan.reasons',
          knowledgeFacet: 'vlan.reasons.benefits',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Wir prüfen gerade die VLAN-Argumente.', vlanLeads[1]],
        });
      },
    },
    {
      id: 'vlan.definition',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'vlan.definition',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Was beschreibt ein VLAN am besten?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, vlanLeads, rng)
          : directPrompt;
        const correct = item.data.definition;
        const distractors = [
          'Ein VLAN verbindet physisch getrennte Switches zu einem einzigen Broadcast-Bereich.',
          'Ein VLAN ist eine spezielle Router-Schnittstelle für das Internet.',
          'Ein VLAN ersetzt die MAC-Adresstabelle eines Switches.',
        ];
        const wrongOptionExplanations = {
          'Ein VLAN verbindet physisch getrennte Switches zu einem einzigen Broadcast-Bereich.': 'Nein – VLANs trennen Broadcast-Domänen, selbst wenn die Geräte am selben Switch hängen.',
          'Ein VLAN ist eine spezielle Router-Schnittstelle für das Internet.': 'Nein – VLANs arbeiten auf Layer 2 und sind keine Router-Schnittstellen.',
          'Ein VLAN ersetzt die MAC-Adresstabelle eines Switches.': 'Nein – der Switch behält seine MAC-Tabelle, VLANs ergänzen nur die logische Trennung.',
        };
        return buildMcInstance({
          templateId: 'vlan.definition',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.effect,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
          learningObjective: 'vlan.concept',
          knowledgeFacet: 'vlan.concept.definition',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: vlanLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'vlan.tagging',
      archetype: QUESTION_ARCHETYPES.RECALL,
      matches: (item) => item.id === 'vlan.tagging',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Wie weiß ein Trunk-Port, zu welchem VLAN ein Frame gehört?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Wir planen gerade Trunk-Verbindungen.', 'Kurze Abfrage zu VLANs:'], rng)
          : directPrompt;
        const correct = `Durch ein VLAN-Tag gemäß ${item.data.standard}.`;
        const distractors = [
          'Durch die Quell-MAC-Adresse.',
          'Durch die Ziel-IP-Adresse.',
          'Durch die Portnummer des Endgeräts.',
        ];
        const wrongOptionExplanations = {
          'Durch die Quell-MAC-Adresse.': 'Die MAC-Adresse hilft dem Switch beim Forwarding, nicht der VLAN-Zuordnung auf einem Trunk.',
          'Durch die Ziel-IP-Adresse.': 'IP-Adressen werden erst auf Layer 3 ausgewertet, nicht für VLAN-Tags.',
          'Durch die Portnummer des Endgeräts.': 'Die physische Portnummer hat nichts mit dem VLAN-Tag im Frame zu tun.',
        };
        return buildMcInstance({
          templateId: 'vlan.tagging',
          item,
          archetype: QUESTION_ARCHETYPES.RECALL,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'vlan.ports',
          knowledgeFacet: 'vlan.ports.tagging',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Wir planen gerade Trunk-Verbindungen.', 'Kurze Abfrage zu VLANs:'],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'vlan.problemSolved',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'vlan.problemSolved',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Welches Problem lösen VLANs vor allem?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, vlanLeads, rng)
          : directPrompt;
        const correct = item.data.solution;
        const distractors = [
          'Zu langsame Internetverbindungen im LAN.',
          'Fehlende Stromversorgung von Switches.',
          'Zu wenige physische Netzwerkkabel.',
        ];
        const wrongOptionExplanations = {
          'Zu langsame Internetverbindungen im LAN.': 'VLANs beeinflussen die Internetgeschwindigkeit nicht direkt, sondern die logische Segmentierung.',
          'Fehlende Stromversorgung von Switches.': 'Stromversorgung ist ein Hardware-Problem, das VLANs nicht lösen.',
          'Zu wenige physische Netzwerkkabel.': 'VLANs reduzieren sogar oft die Kabelanzahl, weil ein Link mehrere VLANs tragen kann.',
        };
        return buildMcInstance({
          templateId: 'vlan.problemSolved',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.problem,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
          learningObjective: 'vlan.reasons',
          knowledgeFacet: 'vlan.reasons.problem',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: vlanLeads,
          wrongOptionExplanations,
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// SSH templates
// ---------------------------------------------------------------------------

const sshLeads = [
  'Wir müssen einen Switch per SSH fernadministrieren.',
  'Ich bekomme beim SSH-Verbindungsaufbau eine Fehlermeldung.',
  'Kannst du mir kurz die SSH-Reihenfolge bestätigen?',
];

function sshTemplates() {
  return [
    {
      id: 'ssh.telnetVsSsh',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.id === 'ssh.telnetVsSsh',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const proto = rng.pick(item.data.items);
        const directPrompt = `Was ist ein wesentlicher Unterschied von ${proto.name}?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Wir prüfen gerade die Remote-Zugänge.', 'Sicherheitsfrage:'], rng)
          : directPrompt;
        const correct = proto.encrypted
          ? 'SSH verschlüsselt die gesamte Verbindung inklusive Zugangsdaten.'
          : 'Telnet überträgt Daten und Zugangsdaten im Klartext.';
        const wrongOptionExplanations = {
          'SSH überträgt alles im Klartext.': 'Nein – SSH verschlüsselt Daten und Zugangsdaten. Klartextübertragung ist Telnet.',
          'Telnet verschlüsselt die Verbindung.': 'Nein – Telnet überträgt alles unverschlüsselt. SSH ist das Protokoll mit Verschlüsselung.',
        };
        const distractors = item.data.items
          .filter((p) => p.name !== proto.name)
          .map((p) => (p.encrypted
            ? 'SSH überträgt alles im Klartext.'
            : 'Telnet verschlüsselt die Verbindung.'));
        return buildMcInstance({
          templateId: 'ssh.telnetVsSsh',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: correct,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.protocol',
          knowledgeFacet: 'ssh.protocol.encryptionCompare',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Wir prüfen gerade die Remote-Zugänge.', 'Sicherheitsfrage:'],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ssh.configProcedure',
      archetype: QUESTION_ARCHETYPES.ORDERING,
      matches: (item) => item.id === 'ssh.configProcedure',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const steps = item.data.steps;
        const items = steps.map((step, idx) => ({ id: `s${idx}`, label: step }));
        const directPrompt = 'Bringe die Schritte für eine korrekte SSH-Grundkonfiguration in die richtige Reihenfolge.';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, sshLeads, rng)
          : directPrompt;
        return buildOrderingInstance({
          templateId: 'ssh.configProcedure',
          item,
          archetype: QUESTION_ARCHETYPES.ORDERING,
          seed,
          prompt,
          items,
          correctOrderIds: items.map((it) => it.id),
          explanation: 'SSH benötigt Hostname, Domain, Benutzer, RSA-Key, SSHv2, IP-Erreichbarkeit und VTY-Konfiguration in der richtigen Abfolge.',
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.procedure',
          knowledgeFacet: 'ssh.procedure.order',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: sshLeads,
        });
      },
    },
    {
      id: 'ssh.rsaKeyRequirements',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'ssh.rsaKeyRequirements',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Warum schlägt "crypto key generate rsa" fehl, wenn vorher kein Hostname und kein Domain Name vergeben wurden?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['SSH-Fehlersuche:', sshLeads[1]], rng)
          : directPrompt;
        const correct = item.data.reason;
        const distractors = [
          'RSA-Schlüssel brauchen zufällige Namen.',
          'RSA funktioniert nur mit IP-Adressen.',
          'Der Befehl funktioniert auch ohne Hostname und Domain.',
        ];
        const wrongOptionExplanations = {
          'RSA-Schlüssel brauchen zufällige Namen.': 'Der Name ist nicht zufällig – Hostname und Domain Name bilden den FQDN, der im RSA-Schlüssel hinterlegt wird.',
          'RSA funktioniert nur mit IP-Adressen.': 'RSA-Schlüssel selbst haben nichts mit einer IP zu tun; sie brauchen einen FQDN.',
          'Der Befehl funktioniert auch ohne Hostname und Domain.': 'Ohne Hostname und Domain Name kann der Router keinen FQDN erzeugen, der Befehl schlägt fehl.',
        };
        return buildMcInstance({
          templateId: 'ssh.rsaKeyRequirements',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: correct,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.rsa',
          knowledgeFacet: 'ssh.rsa.requirements',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['SSH-Fehlersuche:', sshLeads[1]],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ssh.managementSvi',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'ssh.managementSvi',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Warum braucht ein reiner Layer-2-Switch für SSH-Fernwartung eine Management-SVI?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Wir konfigurieren einen L2-Switch per SSH.', sshLeads[0]], rng)
          : directPrompt;
        const correct = item.data.reason;
        const distractors = [
          'Weil VLAN 99 automatisch das Management-VLAN ist.',
          'Weil ein L2-Switch sonst nicht bootet.',
          'Es gibt keinen Unterschied zu einem Access-Port.',
        ];
        const wrongOptionExplanations = {
          'Weil VLAN 99 automatisch das Management-VLAN ist.': 'VLAN 99 ist nur eine Konvention, keine Pflicht. Das Problem ist, dass ein reiner L2-Switch keine geroutete IP besitzt.',
          'Weil ein L2-Switch sonst nicht bootet.': 'Booten funktioniert auch ohne Management-SVI; sie wird für die IP-Erreichbarkeit benötigt.',
          'Es gibt keinen Unterschied zu einem Access-Port.': 'Doch – ein Access-Port dient Endgeräten; die SVI ist die logische IP-Schnittstelle des Switches selbst.',
        };
        return buildMcInstance({
          templateId: 'ssh.managementSvi',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: correct,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.svi',
          knowledgeFacet: 'ssh.svi.reason',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Wir konfigurieren einen L2-Switch per SSH.', sshLeads[0]],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ssh.version',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'ssh.version',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Was bewirkt der Befehl "ip ssh version 2"?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Wir härten gerade den SSH-Zugang.', 'Sicherheitsfrage:'], rng)
          : directPrompt;
        const correct = 'Er erzwingt ausschließlich SSH Version 2.';
        const distractors = [
          'Er aktiviert SSH Version 1.',
          'Er erlaubt sowohl SSHv1 als auch SSHv2.',
          'Er schaltet Telnet auf Port 22 um.',
        ];
        const wrongOptionExplanations = {
          'Er aktiviert SSH Version 1.': 'Nein – "ip ssh version 2" verbietet SSHv1. SSHv1 muss vorher schon aktiviert gewesen sein.',
          'Er erlaubt sowohl SSHv1 als auch SSHv2.': 'Nein – gerade Version 2 erzwingt, dass Version 1 abgelehnt wird.',
          'Er schaltet Telnet auf Port 22 um.': 'Nein – Telnet bleibt ein eigenes Protokoll; Port 22 gehört SSH.',
        };
        return buildMcInstance({
          templateId: 'ssh.version',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: 'SSHv1 hat bekannte Sicherheitsschwächen. "ip ssh version 2" erzwingt die sichere Variante.',
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.version',
          knowledgeFacet: 'ssh.version.v2',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Wir härten gerade den SSH-Zugang.', 'Sicherheitsfrage:'],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ssh.vtyConfig',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'ssh.vtyConfig',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = 'Welche Befehle auf den VTY-Lines erlauben ausschließlich SSH mit lokaler Benutzerdatenbank?';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Wir konfigurieren die VTY-Lines.', sshLeads[0]], rng)
          : directPrompt;
        const correct = 'login local und transport input ssh';
        const distractors = [
          'login und transport input telnet',
          'password cisco und login',
          'username admin privilege 15',
        ];
        const wrongOptionExplanations = {
          'login und transport input telnet': '"login" ohne "local" nutzt das Line-Passwort, nicht die lokale Benutzerdatenbank; "transport input telnet" erlaubt zudem unsicheres Telnet.',
          'password cisco und login': 'Das setzt ein Line-Passwort, aber wir wollen die lokale Benutzerdatenbank und ausschließlich SSH.',
          'username admin privilege 15': 'Der Benutzer wird global angelegt, aber auf den VTY-Lines muss noch "login local" und "transport input ssh" stehen.',
        };
        return buildMcInstance({
          templateId: 'ssh.vtyConfig',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: 'Auf den VTY-Lines sorgen "login local" für die lokale Benutzerdatenbank und "transport input ssh" dafür, dass nur SSH erlaubt ist.',
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.vty',
          knowledgeFacet: 'ssh.vty.commands',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Wir konfigurieren die VTY-Lines.', sshLeads[0]],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ssh.ipReachabilityTypes',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.id === 'ssh.ipReachabilityTypes',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const device = rng.pick(item.data.items);
        const directPrompt = `Wie stellt ein ${device.name} typischerweise seine IP-Erreichbarkeit für SSH her?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Wir vergleichen Router, L2-Switch und MLS.', 'SSH-Planung:'], rng)
          : directPrompt;
        const correct = device.ipReachability;
        const siblings = item.data.items.filter((d) => d.name !== device.name);
        const distractors = siblings.map((d) => d.ipReachability);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[sib.ipReachability] = `Das trifft eher auf einen ${sib.name}. Ein ${device.name} ${device.ipReachability.toLowerCase()}.`;
        }
        return buildMcInstance({
          templateId: 'ssh.ipReachabilityTypes',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.shared,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.reachability',
          knowledgeFacet: 'ssh.reachability.devices',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Wir vergleichen Router, L2-Switch und MLS.', 'SSH-Planung:'],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ssh.troubleshooting',
      archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
      matches: (item) => item.id === 'ssh.troubleshooting',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const symptomEntry = rng.pick(item.data.symptoms);
        const directPrompt = `Symptom: "${symptomEntry.symptom}". Was ist die wahrscheinlichste Ursache?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Ich bekomme beim SSH-Verbindungsaufbau eine Fehlermeldung.', 'SSH-Fehlersuche:'], rng)
          : directPrompt;
        const correct = symptomEntry.cause;
        const siblings = item.data.symptoms.filter((s) => s.cause !== correct);
        const distractors = siblings.map((s) => s.cause);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[sib.cause] = `Bei "${sib.symptom}" wäre das passend. Hier ist aber "${symptomEntry.symptom}" zu sehen.`;
        }
        return buildMcInstance({
          templateId: 'ssh.troubleshooting',
          item,
          archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: `Symptom "${symptomEntry.symptom}" deutet meist auf: ${correct}.`,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.troubleshooting',
          knowledgeFacet: 'ssh.troubleshooting.symptoms',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.SCENARIO,
          conversationLeads: [],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'ssh.verificationCommands',
      archetype: QUESTION_ARCHETYPES.MATCHING,
      matches: (item) => item.id === 'ssh.verificationCommands',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const mapping = item.data.mapping;
        const directPrompt = 'Ordne jedem show-Befehl seiner Aufgabe zu.';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Nach der SSH-Konfiguration wollen wir verifizieren.', sshLeads[2]], rng)
          : directPrompt;
        const pairs = mapping.map((entry, idx) => ({
          leftId: `cmd${idx}`,
          leftLabel: entry.command,
          rightId: `purp${idx}`,
          rightLabel: entry.purpose,
        }));
        const correctPairs = pairs.map((p) => ({ leftId: p.leftId, rightId: p.rightId }));
        return buildMatchingInstance({
          templateId: 'ssh.verificationCommands',
          item,
          archetype: QUESTION_ARCHETYPES.MATCHING,
          seed,
          prompt,
          pairs,
          correctPairs,
          explanation: 'Mit show ip ssh, show ssh, show running-config | include vty und show ip interface brief lässt sich SSH-Verhalten verifizieren.',
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'ssh.verification',
          knowledgeFacet: 'ssh.verification.commands',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Nach der SSH-Konfiguration wollen wir verifizieren.', sshLeads[2]],
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Phase 7 generic templates (network basics & Cisco theory)
// ---------------------------------------------------------------------------

const PHASE7_PREFIXES = new Set([
  'grundbegriffe',
  'topologien',
  'kommunikation',
  'tcpudp',
  'dns',
  'dhcp',
  'routing',
  'vlsm',
  'supernetting',
  'cisco',
  'security',
]);

function isPhase7Item(item) {
  const first = item.conceptCluster.split('.')[0];
  return PHASE7_PREFIXES.has(first);
}

function phase7DefinitionTemplates() {
  return [
    {
      id: 'phase7.definition.recall',
      archetype: QUESTION_ARCHETYPES.RECALL,
      matches: (item) => item.type === KNOWLEDGE_TYPES.DEFINITION && isPhase7Item(item),
      supportedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const term = item.data.term || item.data.subject || 'diesen Begriff';
        const directPrompt = `Was ist ${term}?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, NEUTRAL_LEADS, rng)
          : directPrompt;
        const correctValue = item.data.definition || item.data.description;
        let distractors = sameClusterDistractors(
          item,
          allItemsById,
          3,
          (sib) => sib.data?.definition || sib.data?.description,
          rng,
        );
        if (distractors.length < 3 && Array.isArray(item.data.distractorDefinitions)) {
          const seen = new Set(distractors);
          for (const d of item.data.distractorDefinitions) {
            if (distractors.length >= 3) break;
            if (d === correctValue) continue;
            const ds = String(d);
            if (!seen.has(ds)) {
              distractors.push(ds);
              seen.add(ds);
            }
          }
        }
        const wrongOptionExplanations = {};
        const siblings = Object.values(allItemsById).filter((sib) => sib.conceptCluster === item.conceptCluster && sib.id !== item.id);
        for (const sib of siblings) {
          const label = sib.data?.definition || sib.data?.description;
          if (label) {
            const sibTerm = sib.data?.term || sib.data?.subject || 'einen anderen Begriff';
            wrongOptionExplanations[label] = `Das beschreibt ${sibTerm}, nicht ${term}.`;
          }
        }
        for (const d of distractors) {
          if (!wrongOptionExplanations[d]) {
            wrongOptionExplanations[d] = `Das ist keine zutreffende Definition für ${term}.`;
          }
        }
        return buildMcInstance({
          templateId: 'phase7.definition.recall',
          item,
          archetype: QUESTION_ARCHETYPES.RECALL,
          seed,
          prompt,
          correctValue,
          distractorValues: distractors,
          explanation: item.data.definition || item.data.description,
          contextType,
          roleHints: item.roleHints || ['technical'],
          rng,
          learningObjective: item.conceptCluster,
          knowledgeFacet: `${item.conceptCluster}.definition`,
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: NEUTRAL_LEADS,
          wrongOptionExplanations,
        });
      },
    },
  ];
}

function phase7PropertyTemplates() {
  return [
    {
      id: 'phase7.property.selectBest',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.type === KNOWLEDGE_TYPES.PROPERTY && isPhase7Item(item),
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const subject = item.data.subject || item.data.name || item.data.term || 'dieses Thema';
        const directPrompt = `Was trifft auf ${subject} zu?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, NEUTRAL_LEADS, rng)
          : directPrompt;
        const correctValue = item.data.description;
        let distractors = sameClusterDistractors(
          item,
          allItemsById,
          3,
          (sib) => sib.data?.description || sib.data?.definition,
          rng,
        );
        if (distractors.length < 3 && Array.isArray(item.data.distractorDescriptions)) {
          const seen = new Set(distractors);
          for (const d of item.data.distractorDescriptions) {
            if (distractors.length >= 3) break;
            if (d === correctValue) continue;
            const ds = String(d);
            if (!seen.has(ds)) {
              distractors.push(ds);
              seen.add(ds);
            }
          }
        }
        const wrongOptionExplanations = {};
        const siblings = Object.values(allItemsById).filter((sib) => sib.conceptCluster === item.conceptCluster && sib.id !== item.id);
        for (const sib of siblings) {
          const label = sib.data?.description || sib.data?.definition;
          if (label) {
            const sibSubject = sib.data?.subject || sib.data?.name || sib.data?.term || 'einen anderen Begriff';
            wrongOptionExplanations[label] = `Das trifft eher auf ${sibSubject} zu, nicht auf ${subject}.`;
          }
        }
        for (const d of distractors) {
          if (!wrongOptionExplanations[d]) {
            wrongOptionExplanations[d] = `Das trifft nicht auf ${subject} zu.`;
          }
        }
        return buildMcInstance({
          templateId: 'phase7.property.selectBest',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          roleHints: item.roleHints || ['technical'],
          rng,
          learningObjective: item.conceptCluster,
          knowledgeFacet: `${item.conceptCluster}.property`,
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: NEUTRAL_LEADS,
          wrongOptionExplanations,
        });
      },
    },
  ];
}

function phase7CompareTemplates() {
  return [
    {
      id: 'phase7.compare.identify',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.type === KNOWLEDGE_TYPES.COMPARE
        && isPhase7Item(item)
        && Array.isArray(item.data.items)
        && item.data.items.length >= 2,
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const compareOn = item.data.compareOn;
        const selected = rng.pick(item.data.items);
        const detail = (compareOn && selected[compareOn] != null)
          ? selected[compareOn]
          : selected.description
            || selected.tagline
            || selected.reach
            || selected.scope
            || selected.resilience
            || selected.connection
            || selected.config
            || selected.purpose
            || selected.volatility
            || selected.reliability
            || selected.order
            || selected.overhead
            || selected.speed
            || selected.useCases
            || selected.example;
        const directPrompt = `Welcher Begriff passt zu dieser Beschreibung? „${detail}“`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, NEUTRAL_LEADS, rng)
          : directPrompt;
        const correctValue = selected.name;
        const distractors = item.data.items
          .filter((i) => i.name !== selected.name)
          .map((i) => i.name);
        const wrongOptionExplanations = {};
        for (const i of item.data.items) {
          if (i.name !== selected.name) {
            wrongOptionExplanations[i.name] = `${i.name} passt nicht – diese Beschreibung gehört zu ${selected.name}.`;
          }
        }
        return buildMcInstance({
          templateId: 'phase7.compare.identify',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          roleHints: item.roleHints || ['technical'],
          rng,
          learningObjective: item.conceptCluster,
          knowledgeFacet: `${item.conceptCluster}.compare`,
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: NEUTRAL_LEADS,
          wrongOptionExplanations,
        });
      },
    },
  ];
}

function phase7OrderTemplates() {
  return [
    {
      id: 'phase7.order.steps',
      archetype: QUESTION_ARCHETYPES.ORDERING,
      matches: (item) => item.type === KNOWLEDGE_TYPES.ORDER
        && isPhase7Item(item)
        && Array.isArray(item.data.steps)
        && item.data.steps.length >= 2,
      supportedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING],
      generate: (item, _allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        let directPrompt = 'Bringe die Schritte in die richtige Reihenfolge.';
        const cluster = item.conceptCluster || '';
        if (cluster.startsWith('grundbegriffe.networkSizes')) {
          directPrompt = 'Sortiere die Netzwerktypen nach typischer geografischer Ausdehnung – beginnend mit dem kleinsten.';
        } else if (cluster.startsWith('binary')) {
          directPrompt = 'Sortiere die Bit-Stellenwerte eines Oktetts beginnend mit dem höchsten Stellenwert.';
        } else if (cluster.startsWith('dns.resolution')) {
          directPrompt = 'Bringe die Schritte einer DNS-Namensauflösung in die richtige Reihenfolge.';
        } else if (cluster.startsWith('cisco.boot')) {
          directPrompt = 'Bringe die Boot-Schritte eines Cisco-Geräts in die richtige Reihenfolge.';
        } else if (item.data.description && item.data.description.includes('Reihenfolge')) {
          directPrompt = item.data.description;
        }
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, NEUTRAL_LEADS, rng)
          : directPrompt;
        const items = item.data.steps.map((step, idx) => ({
          id: step.id || `step-${idx}`,
          label: step.label || step,
        }));
        const correctOrderIds = items.map((s) => s.id);
        return buildOrderingInstance({
          templateId: 'phase7.order.steps',
          item,
          archetype: QUESTION_ARCHETYPES.ORDERING,
          seed,
          prompt,
          items,
          correctOrderIds,
          explanation: item.data.description,
          contextType,
          roleHints: item.roleHints || ['technical'],
          rng,
          learningObjective: item.conceptCluster,
          knowledgeFacet: `${item.conceptCluster}.order`,
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: NEUTRAL_LEADS,
        });
      },
    },
  ];
}

function phase7MappingTemplates() {
  return [
    {
      id: 'phase7.mapping.pairs',
      archetype: QUESTION_ARCHETYPES.MATCHING,
      matches: (item) => item.type === KNOWLEDGE_TYPES.MAPPING
        && isPhase7Item(item)
        && Array.isArray(item.data.pairs)
        && item.data.pairs.length >= 2,
      supportedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
      generate: (item, _allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const pairs = item.data.pairs.map((p, idx) => ({
          leftId: `l-${idx}`,
          leftLabel: p.key || p.left,
          rightId: `r-${idx}`,
          rightLabel: p.value || p.right,
        }));
        const termList = pairs.map((p) => p.leftLabel).join(', ');
        let typeLabel = item.data.subject || item.data.term || null;
        if (!typeLabel) {
          if (item.conceptCluster?.startsWith('dns')) typeLabel = 'DNS-Record-Typen';
          else if (item.conceptCluster?.startsWith('cisco.memory')) typeLabel = 'Cisco-Speicherbereiche';
          else if (item.conceptCluster?.startsWith('cisco.static')) typeLabel = 'Komponenten einer statischen Route';
          else if (item.conceptCluster?.startsWith('grundbegriffe.networkSizes')) typeLabel = 'Netzwerktypen';
        }
        const directPrompt = pairs.length <= 4
          ? `Ordne ${typeLabel ? `die ${typeLabel} ${termList}` : termList} der passenden Bedeutung zu.`
          : `Ordne die ${typeLabel || 'Begriffe'} der passenden Bedeutung zu.`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, NEUTRAL_LEADS, rng)
          : directPrompt;
        const correctPairs = pairs.map((p) => ({ leftId: p.leftId, rightId: p.rightId }));
        return buildMatchingInstance({
          templateId: 'phase7.mapping.pairs',
          item,
          archetype: QUESTION_ARCHETYPES.MATCHING,
          seed,
          prompt,
          pairs,
          correctPairs,
          explanation: item.data.description,
          contextType,
          roleHints: item.roleHints || ['technical'],
          rng,
          learningObjective: item.conceptCluster,
          knowledgeFacet: `${item.conceptCluster}.mapping`,
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: NEUTRAL_LEADS,
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Phase 9A templates – Cisco Grundkonfiguration (dependency-aware)
// ---------------------------------------------------------------------------

const basicConfigLeads = [
  'Ich richte gerade einen neuen Switch ein.',
  'Kurze Rückfrage zur Grundkonfiguration:',
  'Ich bin mir bei der Konsolen-Absicherung nicht sicher.',
];

function ciscoBasicConfigTemplates() {
  return [
    {
      id: 'basicConfig.passwordVsSecret',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.id === 'basicConfig.passwordVsSecret',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const proto = rng.pick(item.data.items);
        const directPrompt = `Wie wird das Passwort bei "${proto.name}" gespeichert?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, basicConfigLeads, rng)
          : directPrompt;
        const sibling = item.data.items.find((p) => p.name !== proto.name);
        const distractors = [sibling.storage];
        const wrongOptionExplanations = { [sibling.storage]: `Das trifft auf "${sibling.name}" zu, nicht auf "${proto.name}".` };
        return buildMcInstance({
          templateId: 'basicConfig.passwordVsSecret',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: proto.storage,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical', 'security'],
          rng,
          learningObjective: 'basicConfig.passwordVsSecret',
          knowledgeFacet: 'basicConfig.passwordVsSecret.storage',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: basicConfigLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'basicConfig.consoleAuthModes',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.id === 'basicConfig.consoleAuthModes',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const proto = rng.pick(item.data.items);
        const directPrompt = `Mit welchen Befehlen wird die Konsole abgesichert, wenn gegen "${proto.db}" geprüft werden soll?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, basicConfigLeads, rng)
          : directPrompt;
        const sibling = item.data.items.find((p) => p.name !== proto.name);
        const distractors = [sibling.commands];
        const wrongOptionExplanations = { [sibling.commands]: `Das gehört zu "${sibling.name}" (prüft gegen ${sibling.db}), nicht zu "${proto.name}".` };
        return buildMcInstance({
          templateId: 'basicConfig.consoleAuthModes',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: proto.commands,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'basicConfig.consoleAuth',
          knowledgeFacet: 'basicConfig.consoleAuth.modes',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: basicConfigLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'basicConfig.consoleLoginDependency',
      archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
      matches: (item) => item.id === 'basicConfig.consoleLoginDependency',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const symptomEntry = rng.pick(item.data.symptoms);
        const directPrompt = `Zustand: "${symptomEntry.symptom}". Was ist die Ursache?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Konsolen-Absicherung funktioniert nicht wie erwartet.', basicConfigLeads[2]], rng)
          : directPrompt;
        const correct = symptomEntry.cause;
        const siblings = item.data.symptoms.filter((s) => s.cause !== correct);
        const distractors = siblings.map((s) => s.cause);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[sib.cause] = `Das würde eher zu "${sib.symptom}" passen. Hier liegt aber "${symptomEntry.symptom}" vor.`;
        }
        return buildMcInstance({
          templateId: 'basicConfig.consoleLoginDependency',
          item,
          archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'basicConfig.consoleAuth',
          knowledgeFacet: 'basicConfig.consoleAuth.dependency',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.SCENARIO,
          conversationLeads: [],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'basicConfig.execTimeoutPurpose',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'basicConfig.execTimeoutPurpose',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = `Wozu dient "${item.data.command}" auf einer Konsolen- oder VTY-Line?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, basicConfigLeads, rng)
          : directPrompt;
        const correct = 'Er beendet eine inaktive Sitzung nach der angegebenen Zeit automatisch.';
        const distractors = [
          'Er verschlüsselt das Line-Passwort.',
          'Er begrenzt, wie viele Benutzer sich gleichzeitig anmelden dürfen.',
          'Er legt fest, wie lange ein Passwort gültig bleibt.',
        ];
        const wrongOptionExplanations = {
          'Er verschlüsselt das Line-Passwort.': 'Dafür ist "service password-encryption" zuständig, nicht exec-timeout.',
          'Er begrenzt, wie viele Benutzer sich gleichzeitig anmelden dürfen.': 'Das steuert die Anzahl konfigurierter Lines (z. B. "line vty 0 15"), nicht exec-timeout.',
          'Er legt fest, wie lange ein Passwort gültig bleibt.': 'Cisco IOS kennt keine Passwort-Ablaufzeit über exec-timeout - das betrifft nur inaktive Sitzungen.',
        };
        return buildMcInstance({
          templateId: 'basicConfig.execTimeoutPurpose',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: correct,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical', 'security'],
          rng,
          learningObjective: 'basicConfig.execTimeout',
          knowledgeFacet: 'basicConfig.execTimeout.purpose',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: basicConfigLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'basicConfig.servicePasswordEncryption',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'basicConfig.servicePasswordEncryption',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = `Was bewirkt "${item.data.command}" tatsächlich?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Sicherheitsfrage zur Konfiguration:', basicConfigLeads[1]], rng)
          : directPrompt;
        const correct = 'Es verschleiert gespeicherte Klartext-Passwörter mit einem schwachen, umkehrbaren Verfahren.';
        const distractors = [
          'Es verschlüsselt alle Passwörter genauso stark wie "enable secret" (MD5).',
          'Es macht das Line-Passwort komplett unsichtbar, auch für Administratoren.',
          'Es verhindert, dass Passwörter im Klartext eingegeben werden können.',
        ];
        const wrongOptionExplanations = {
          'Es verschlüsselt alle Passwörter genauso stark wie "enable secret" (MD5).': `Nein - ${item.data.strength}`,
          'Es macht das Line-Passwort komplett unsichtbar, auch für Administratoren.': `Nein - Type-7-Verschleierung ist umkehrbar, kein echter Schutz vor gezieltem Entschlüsseln.`,
          'Es verhindert, dass Passwörter im Klartext eingegeben werden können.': 'Nein - die Eingabe bleibt Klartext, nur die Speicherung wird verschleiert.',
        };
        return buildMcInstance({
          templateId: 'basicConfig.servicePasswordEncryption',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: correct,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical', 'security'],
          rng,
          learningObjective: 'basicConfig.servicePasswordEncryption',
          knowledgeFacet: 'basicConfig.servicePasswordEncryption.strength',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: ['Sicherheitsfrage zur Konfiguration:', basicConfigLeads[1]],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'basicConfig.runningVsStartupConfig',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.id === 'basicConfig.runningVsStartupConfig',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const proto = rng.pick(item.data.items);
        const directPrompt = `Was passiert mit der "${proto.name}" bei einem Neustart des Geräts?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, basicConfigLeads, rng)
          : directPrompt;
        const sibling = item.data.items.find((p) => p.name !== proto.name);
        const distractors = [sibling.persistence];
        const wrongOptionExplanations = { [sibling.persistence]: `Das trifft auf die "${sibling.name}" zu, nicht auf die "${proto.name}".` };
        return buildMcInstance({
          templateId: 'basicConfig.runningVsStartupConfig',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: proto.persistence,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'basicConfig.persistence',
          knowledgeFacet: 'basicConfig.persistence.runningVsStartup',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: basicConfigLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'basicConfig.configOrder',
      archetype: QUESTION_ARCHETYPES.ORDERING,
      matches: (item) => item.id === 'basicConfig.configOrder',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const steps = item.data.steps;
        const items = steps.map((step, idx) => ({ id: `s${idx}`, label: step }));
        const directPrompt = 'Bringe die Schritte einer sinnvollen Cisco-Grundkonfiguration in die richtige Reihenfolge.';
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, basicConfigLeads, rng)
          : directPrompt;
        return buildOrderingInstance({
          templateId: 'basicConfig.configOrder',
          item,
          archetype: QUESTION_ARCHETYPES.ORDERING,
          seed,
          prompt,
          items,
          correctOrderIds: items.map((it) => it.id),
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'basicConfig.order',
          knowledgeFacet: 'basicConfig.order.sequence',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: basicConfigLeads,
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Phase 9A templates – PortFast, BPDU Guard, Native VLAN
// ---------------------------------------------------------------------------

const stpLeads = [
  'Wir sichern gerade neue Arbeitsplatzports ab.',
  'Kurze Frage zu PortFast/BPDU Guard:',
  'Ich bin mir beim Trunk-Verhalten nicht sicher.',
];

function ciscoStpTemplates() {
  return [
    {
      id: 'stp.portfastPurpose',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'stp.portfastPurpose',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = `Auf welchem Porttyp sollte "${item.data.command}" aktiviert werden?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, stpLeads, rng)
          : directPrompt;
        const correct = item.data.suitableFor;
        const distractors = [
          item.data.unsuitableFor,
          'Auf allen Ports gleichermaßen, unabhängig von der Funktion.',
          'Nur auf dem Port mit der Management-SVI.',
        ];
        const wrongOptionExplanations = {
          [item.data.unsuitableFor]: item.data.reason,
          'Auf allen Ports gleichermaßen, unabhängig von der Funktion.': item.data.reason,
          'Nur auf dem Port mit der Management-SVI.': 'Eine SVI ist eine logische Schnittstelle, kein physischer Port - PortFast wird auf physischen Access-Ports mit Endgeräten konfiguriert.',
        };
        return buildMcInstance({
          templateId: 'stp.portfastPurpose',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'stp.portfast',
          knowledgeFacet: 'stp.portfast.suitablePorts',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: stpLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'stp.bpduGuardPurpose',
      archetype: QUESTION_ARCHETYPES.SELECT_BEST,
      matches: (item) => item.id === 'stp.bpduGuardPurpose',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO, QUESTION_ARCHETYPES.TROUBLESHOOT],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const directPrompt = `Was passiert, wenn ein Port mit aktivem "${item.data.command}" eine BPDU empfängt?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, stpLeads, rng)
          : directPrompt;
        const correct = item.data.reaction;
        const distractors = [
          'Nichts - BPDU Guard protokolliert nur ein Ereignis.',
          'Der Port wechselt automatisch in den Trunk-Modus.',
          'Der Port ignoriert die BPDU, weil PortFast aktiv ist.',
        ];
        const wrongOptionExplanations = {
          'Nichts - BPDU Guard protokolliert nur ein Ereignis.': 'BPDU Guard ist ein harter Trigger, kein reines Logging - der Port wird tatsächlich abgeschaltet.',
          'Der Port wechselt automatisch in den Trunk-Modus.': 'BPDU Guard ändert nicht den Switchport-Modus, sondern deaktiviert den Port.',
          'Der Port ignoriert die BPDU, weil PortFast aktiv ist.': 'PortFast beeinflusst BPDU Guard nicht - im Gegenteil, beide werden meist zusammen konfiguriert, genau weil ein PortFast-Port keine BPDU erwarten sollte.',
        };
        return buildMcInstance({
          templateId: 'stp.bpduGuardPurpose',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical', 'security'],
          rng,
          learningObjective: 'stp.bpduGuard',
          knowledgeFacet: 'stp.bpduGuard.reaction',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: stpLeads,
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'stp.portfastBpduGuardMisplacement',
      archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
      matches: (item) => item.id === 'stp.portfastBpduGuardMisplacement',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const symptomEntry = rng.pick(item.data.symptoms);
        const directPrompt = `Situation: "${symptomEntry.symptom}". Was ist die wahrscheinlichste Ursache?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Ein Port verhält sich seltsam.', stpLeads[1]], rng)
          : directPrompt;
        const correct = symptomEntry.cause;
        const siblings = item.data.symptoms.filter((s) => s.cause !== correct);
        const distractors = siblings.map((s) => s.cause);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[sib.cause] = `Das würde eher zu "${sib.symptom}" passen. Hier liegt aber "${symptomEntry.symptom}" vor.`;
        }
        return buildMcInstance({
          templateId: 'stp.portfastBpduGuardMisplacement',
          item,
          archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'stp.misplacement',
          knowledgeFacet: 'stp.misplacement.diagnosis',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.SCENARIO,
          conversationLeads: [],
          wrongOptionExplanations,
        });
      },
    },
    {
      id: 'trunk.nativeVlanVsAccessAllowed',
      archetype: QUESTION_ARCHETYPES.COMPARE,
      matches: (item) => item.id === 'trunk.nativeVlanVsAccessAllowed',
      supportedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
      generate: (item, allItemsById, rng, { contextType = 'direct_question', seed = '0' } = {}) => {
        const proto = rng.pick(item.data.items);
        const directPrompt = `Wofür steht "${proto.command}"?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, stpLeads, rng)
          : directPrompt;
        const siblings = item.data.items.filter((p) => p.name !== proto.name);
        const distractors = siblings.map((p) => p.meaning);
        const wrongOptionExplanations = {};
        for (const sib of siblings) {
          wrongOptionExplanations[sib.meaning] = `Das beschreibt "${sib.name}" (${sib.command}), nicht "${proto.name}".`;
        }
        return buildMcInstance({
          templateId: 'trunk.nativeVlanVsAccessAllowed',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: proto.meaning,
          distractorValues: distractors,
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
          learningObjective: 'trunk.nativeVlan',
          knowledgeFacet: 'trunk.nativeVlan.distinction',
          promptStyle: PROMPT_STYLES.SELF_CONTAINED,
          contextDependency: CONTEXT_DEPENDENCIES.NEUTRAL,
          conversationLeads: stpLeads,
          wrongOptionExplanations,
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Public registry
// ---------------------------------------------------------------------------

export const TEMPLATES = [
  ...osiLayerTemplates(),
  ...osiOrderingTemplates(),
  ...binaryTemplates(),
  ...ipv4Templates(),
  ...subnettingTemplates(),
  ...switchingVlanTemplates(),
  ...sshTemplates(),
  ...ciscoBasicConfigTemplates(),
  ...ciscoStpTemplates(),
  ...phase7DefinitionTemplates(),
  ...phase7PropertyTemplates(),
  ...phase7CompareTemplates(),
  ...phase7OrderTemplates(),
  ...phase7MappingTemplates(),
];

export function findTemplatesForItem(item, archetype = null) {
  return TEMPLATES.filter((t) => {
    if (!t.matches(item)) return false;
    if (archetype && !t.supportedQuestionTypes.includes(archetype)) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function pickFromRange(cidr, rng) {
  const [network, prefix] = cidr.split('/');
  const p = Number(prefix);
  const octets = network.split('.').map(Number);
  const hostBits = 32 - p;
  if (hostBits <= 8) {
    const max = (1 << hostBits) - 2;
    const host = rng.nextInt(1, Math.max(1, max));
    octets[3] += host;
    return octets.join('.');
  }
  // For larger ranges just pick a simple host in the last octet.
  octets[3] = rng.nextInt(1, 254);
  return octets.join('.');
}
