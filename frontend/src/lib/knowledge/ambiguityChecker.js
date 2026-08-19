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
  {
    id: 'subnetting-hosts-without-usable',
    description: 'Subnetting questions asking for "hosts" must specify whether they mean usable hosts.',
    detect: (instance) => {
      if (instance.conceptCluster !== 'subnetting.calculation') return false;
      const prompt = String(instance.prompt).toLowerCase();
      const asksHosts = /wie\s+viele\s+hosts?|anzahl\s+hosts?|hosts?\s+gibt\s+es/.test(prompt);
      const usable = /nutzbar|usab|verfügbar/.test(prompt);
      return asksHosts && !usable;
    },
  },
  {
    id: 'vlan-port-without-access-trunk',
    description: 'VLAN port questions must make clear whether Access or Trunk is meant.',
    detect: (instance) => {
      if (!instance.conceptCluster || !instance.conceptCluster.startsWith('vlan')) return false;
      const prompt = String(instance.prompt).toLowerCase();
      const asksPort = /welcher\s+port|an\s+welchem\s+port|port\s+gehört|porttyp/.test(prompt);
      const accessTrunk = /\b(access|trunk)\b/.test(prompt);
      const contextClear = /\b(endgerät|mehrere vlans|genau ein vlan|switch|router)\b/.test(prompt);
      return asksPort && !accessTrunk && !contextClear;
    },
  },
  {
    id: 'ssh-vague-requirement',
    description: 'SSH questions must specify the concrete facet (key, version, VTY, reachability) instead of "what does SSH need".',
    detect: (instance) => {
      if (!instance.conceptCluster || !instance.conceptCluster.startsWith('ssh')) return false;
      const prompt = String(instance.prompt).toLowerCase();
      const vague = /was\s+braucht\s+ssh|was\s+benötigt\s+ssh|was\s+ist\s+für\s+ssh/.test(prompt);
      return vague && !/version|vty|rsa|key|management|svi|gateway|reachab/.test(prompt);
    },
  },
  {
    id: 'binary-conversion-without-base',
    description: 'Binary conversion questions must explicitly state the source and target numeral system.',
    detect: (instance) => {
      if (!instance.conceptCluster || !instance.conceptCluster.startsWith('binary')) return false;
      const prompt = String(instance.prompt).toLowerCase();
      const conversion = /umwandeln|konvertieren|berechne|wie\s+lautet/.test(prompt);
      const explicit = /dezimal|decimal|binär|binary/.test(prompt);
      return conversion && !explicit;
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
