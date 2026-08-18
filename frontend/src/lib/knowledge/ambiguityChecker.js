// =============================================================================
// NEXUS Knowledge Layer – Ambiguity Checker
//
// Phase 2: prevent known ambiguous question forms.
// Currently guards the OSI↔TCP-IP mapping because "OSI Layer 3" can map to
// TCP/IP "Internet" but is also often just called "Network Layer" in English,
// which can collide with the OSI name itself.
//
// The checker is invoked by the Question Instance validator; templates can also
// call it during generation.
// =============================================================================

import { QUESTION_ARCHETYPES } from './types.js';

export const KNOWN_AMBIGUITIES = [
  {
    id: 'osi.tcpIp.direct-layer-mapping',
    description: 'Questions asking "Which OSI layer corresponds to TCP/IP layer X?" without explicitly naming the TCP/IP model are ambiguous.',
    detect: (instance) => {
      if (instance.questionArchetype !== QUESTION_ARCHETYPES.MAPPING) return false;
      const prompt = String(instance.prompt).toLowerCase();
      const tcpIpMentioned = prompt.includes('tcp/ip') || prompt.includes('tcpip');
      const osiLayerMentioned = /os[\s/-]?i.*schicht/.test(prompt) || /os[\s/-]?i.*layer/.test(prompt);
      // Direct "Which layer ..." without explicit TCP/IP framing.
      const directWhich = /welche schicht/.test(prompt) && !tcpIpMentioned;
      return osiLayerMentioned && directWhich;
    },
  },
  {
    id: 'missing-explicit-model',
    description: 'Cross-model mappings must explicitly mention both models in the prompt.',
    detect: (instance) => {
      if (instance.conceptCluster !== 'osi.tcpipMapping') return false;
      const prompt = String(instance.prompt).toLowerCase();
      const hasOsi = prompt.includes('osi');
      const hasTcpIp = prompt.includes('tcp/ip') || prompt.includes('tcpip');
      return !(hasOsi && hasTcpIp);
    },
  },
  {
    id: 'hub-forward-confusion',
    description: 'Hubs do not forward based on MAC; questions about "unknown destination MAC" must not accept Hub as correct.',
    detect: (instance) => {
      const prompt = String(instance.prompt).toLowerCase();
      return /unbekannt.*ziel.*mac/.test(prompt) && /hub/.test(prompt);
    },
  },
];

export function checkAmbiguity(instance) {
  const findings = [];
  for (const rule of KNOWN_AMBIGUITIES) {
    if (rule.detect(instance)) {
      findings.push({ ruleId: rule.id, description: rule.description });
    }
  }
  return findings;
}

export function isAmbiguous(instance) {
  return checkAmbiguity(instance).length > 0;
}
