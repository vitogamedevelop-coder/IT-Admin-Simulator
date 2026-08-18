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

import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES } from './types.js';
import {
  siblingDistractors,
  buildMcOptions,
} from './distractors.js';
import { generateCalculationData } from './calculationGenerators.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function chooseLead(leads, rng) {
  if (!leads || leads.length === 0) return '';
  return leads[Math.floor(rng.next() * leads.length)];
}

function makeInstanceId(templateId, itemId, seed) {
  return `${templateId}.${itemId}.${seed}`;
}

function baseInstance({ templateId, item, archetype, seed, prompt, contextType, speechLeadIn, roleHints }) {
  return {
    instanceId: makeInstanceId(templateId, item.id, seed),
    topicKey: item.topicKey,
    knowledgeItemId: item.id,
    conceptCluster: item.conceptCluster,
    questionArchetype: archetype,
    difficulty: item.difficulty,
    prompt,
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

function buildMcInstance({ templateId, item, archetype, seed, prompt, correctValue, distractorValues, explanation, contextType, speechLeadIn, roleHints, rng, calculationParams = null, answerFormat = null, extraSemanticTags = [] }) {
  const { options, correctOptionId } = buildMcOptions(String(correctValue), distractorValues, rng, 'opt');
  const instance = baseInstance({ templateId, item, archetype, seed, prompt, contextType, speechLeadIn, roleHints });
  instance.options = options;
  instance.correctOptionId = correctOptionId;
  instance.correctAnswer = { optionId: correctOptionId, label: String(correctValue) };
  instance.explanation = explanation || item.data.description || prompt;
  if (calculationParams) instance.calculationParams = calculationParams;
  if (answerFormat) instance.answerFormat = answerFormat;
  if (extraSemanticTags.length > 0) {
    instance.semanticTags = Array.from(new Set([...instance.semanticTags, ...extraSemanticTags]));
  }
  // Conversation-compatible legacy fields.
  instance.type = 'mc';
  instance.text = prompt;
  instance.correct = options.findIndex((o) => o.id === correctOptionId);
  return instance;
}

function buildOrderingInstance({ templateId, item, archetype, seed, prompt, items, correctOrderIds, explanation, contextType, speechLeadIn, roleHints, rng }) {
  const instance = baseInstance({ templateId, item, archetype, seed, prompt, contextType, speechLeadIn, roleHints });
  instance.items = rng.shuffle([...items]);
  instance.correctOrderIds = correctOrderIds;
  instance.correctAnswer = { orderIds: correctOrderIds };
  instance.explanation = explanation;
  instance.type = 'ordering';
  instance.text = prompt;
  return instance;
}

function buildMatchingInstance({ templateId, item, archetype, seed, prompt, pairs, correctPairs, explanation, contextType, speechLeadIn, roleHints, rng }) {
  const instance = baseInstance({ templateId, item, archetype, seed, prompt, contextType, speechLeadIn, roleHints });
  const left = rng.shuffle([...pairs.map((p) => ({ id: p.leftId, label: p.leftLabel }))]);
  const right = rng.shuffle([...pairs.map((p) => ({ id: p.rightId, label: p.rightLabel }))]);
  instance.pairs = { left, right };
  instance.correctPairs = correctPairs;
  instance.correctAnswer = { pairs: correctPairs };
  instance.explanation = explanation;
  instance.type = 'matching';
  instance.text = prompt;
  return instance;
}

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
        return buildMcInstance({
          templateId: 'osi.layer.numberToName',
          item,
          archetype: QUESTION_ARCHETYPES.MAPPING,
          seed,
          prompt,
          correctValue: name,
          distractorValues: distractors,
          contextType,
          speechLeadIn: contextType === 'coworker_question' ? prompt.split('.')[0] + '.' : null,
          roleHints: ['technical'],
          rng,
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
        return buildMcInstance({
          templateId: 'osi.layer.nameToNumber',
          item,
          archetype: QUESTION_ARCHETYPES.MAPPING,
          seed,
          prompt,
          correctValue: num,
          distractorValues: distractors,
          contextType,
          speechLeadIn: contextType === 'coworker_question' ? prompt.split('.')[0] + '.' : null,
          roleHints: ['technical'],
          rng,
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
          ? `Ein Kollege fragt: "Wenn ich '${task}' höre, auf welcher OSI-Schicht bin ich dann?"`
          : directPrompt;
        const name = layer(item).name;
        const distractors = siblingDistractors(item, allItemsById, 3, (sib) => sib.data.name, rng);
        return buildMcInstance({
          templateId: 'osi.layer.taskToLayer',
          item,
          archetype: QUESTION_ARCHETYPES.SCENARIO,
          seed,
          prompt,
          correctValue: name,
          distractorValues: distractors,
          contextType,
          speechLeadIn: contextType === 'coworker_question' ? 'Ein Kollege fragt:' : null,
          roleHints: ['helpdesk'],
          rng,
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
        const directPrompt = `Ein Techniker stellt fest: "${fault}". Auf welcher OSI-Schicht beginnst du die Diagnose?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Kabelproblem:', 'Ein Techniker meldet:', 'Fehlersuche:'], rng)
          : directPrompt;
        const name = layer(item).name;
        const distractors = siblingDistractors(item, allItemsById, 3, (sib) => sib.data.name, rng);
        return buildMcInstance({
          templateId: 'osi.layer.faultToLayer',
          item,
          archetype: QUESTION_ARCHETYPES.TROUBLESHOOT,
          seed,
          prompt,
          correctValue: name,
          distractorValues: distractors,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk', 'technical'],
          rng,
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
        const items = order.map((num, idx) => ({ id: `l${num}`, label: `${num}. ${labels[idx]}` }));
        const directPrompt = 'Bringe die OSI-Schichten in die Reihenfolge, in der Daten beim Sender durchlaufen werden (oben nach unten).';
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
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Binary templates
// ---------------------------------------------------------------------------

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
        const directPrompt = 'Sortiere die Bit-Stellenwerte eines Oktetts von links (128) nach rechts (1).';
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
          ? withCoworkerLead(directPrompt, ['Kurze Abfrage zum Binär:', 'Ich rechne gerade Oktette.'], rng)
          : directPrompt;
        const correct = `Von ${item.data.min} bis ${item.data.max}.`;
        const distractors = ['Von 0 bis 256.', 'Von 1 bis 256.', 'Von 0 bis 128.'];
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
        });
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// IPv4 templates
// ---------------------------------------------------------------------------

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
          ? withCoworkerLead(directPrompt, ['Schnelle Abfrage:', 'Stimmt das so?'], rng)
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
        const directPrompt = 'Welche der folgenden Adressen liegt in einem privaten IPv4-Bereich?';
        const prompt = contextType === 'coworker_question'
          ? 'Ein Kollege fragt, ob diese Adresse wirklich nur intern geroutet werden darf. ' + directPrompt
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
        return buildMcInstance({
          templateId: 'ipv4.privateRanges',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correctIp,
          distractorValues: rng.shuffle(distractorIps).slice(0, 3),
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
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
        return buildMcInstance({
          templateId: 'ipv4.loopback',
          item,
          archetype: QUESTION_ARCHETYPES.RECALL,
          seed,
          prompt,
          correctValue: item.data.typical,
          distractorValues: ['0.0.0.0', '255.255.255.255', '192.168.0.1'],
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
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
        return buildMcInstance({
          templateId: 'ipv4.apipa',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          explanation: item.data.meaning,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
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
        const directPrompt = `Welche Aussage über ${fact.source === 'collisionDomain' ? 'Kollisionsdomänen' : 'Broadcast-Domänen'} ist korrekt?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, ['Ich verwechsle Kollisions- und Broadcast-Domänen.', 'Kurze Frage zu Domänen:'], rng)
          : directPrompt;
        const distractors = [
          'Ein Switch teilt Broadcast-Domänen pro Port.',
          'Hubs bilden eigene Kollisionsdomänen pro Port.',
          'Router leiten Broadcasts im selben Netz weiter.',
        ];
        return buildMcInstance({
          templateId: 'switching.domains',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: fact.label,
          distractorValues: rng.shuffle(distractors).slice(0, 3),
          explanation: item.data.description,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
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
        const distractors = item.data.items
          .filter((d) => d.name !== correctDevice.name)
          .map((d) => d.behavior);
        return buildMcInstance({
          templateId: 'switching.deviceCompare',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: correctLabel,
          distractorValues: distractors,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
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
        const distractors = item.data.cases
          .filter((c) => c.action !== correct)
          .map((c) => c.action);
        return buildMcInstance({
          templateId: 'switching.forwardFloodFilter',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
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
        const directPrompt = `Welche Aussage beschreibt einen ${portType.name}?`;
        const prompt = contextType === 'coworker_question'
          ? withCoworkerLead(directPrompt, vlanLeads, rng)
          : directPrompt;
        const correct = `${portType.endpoint}: ${portType.carries}`;
        const distractors = item.data.items
          .filter((p) => p.name !== portType.name)
          .map((p) => `${p.endpoint}: ${p.carries}`);
        return buildMcInstance({
          templateId: 'vlan.accessVsTrunk',
          item,
          archetype: QUESTION_ARCHETYPES.COMPARE,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          contextType,
          speechLeadIn: null,
          roleHints: ['helpdesk'],
          rng,
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
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
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
        return buildMcInstance({
          templateId: 'ssh.rsaKeyRequirements',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
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
        return buildMcInstance({
          templateId: 'ssh.managementSvi',
          item,
          archetype: QUESTION_ARCHETYPES.SELECT_BEST,
          seed,
          prompt,
          correctValue: correct,
          distractorValues: distractors,
          contextType,
          speechLeadIn: null,
          roleHints: ['technical'],
          rng,
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
        const distractors = item.data.items
          .filter((d) => d.name !== device.name)
          .map((d) => d.ipReachability);
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
        const distractors = item.data.symptoms
          .filter((s) => s.cause !== correct)
          .map((s) => s.cause);
        return buildMcInstance({
          templateId: 'ssh.troubleshooting',
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
