export const CONTENT_SCHEMA_VERSION = 1;

export const campaignRoadmap = [
  { packId: 'core-office', chapters: 3, status: 'active', themes: ['Helpdesk', 'DNS', 'Berechtigungen', 'Security'] },
  { packId: 'branch-expansion', chapters: 3, status: 'planned', themes: ['Subnetting', 'VLAN', 'Routing', 'VPN', 'Außenstelle'] },
  { packId: 'service-platform', chapters: 3, status: 'planned', themes: ['Linux', 'Datenbanken', 'Webserver', 'Automatisierung'] },
  { packId: 'resilience', chapters: 3, status: 'planned', themes: ['Backup', 'Restore', 'Monitoring', 'Hochverfügbarkeit'] },
  { packId: 'security-operations', chapters: 4, status: 'planned', themes: ['Phishing', 'Incident Response', 'Hardening', 'Forensik'] },
  { packId: 'enterprise-architecture', chapters: 4, status: 'planned', themes: ['Cloud', 'Identity', 'Change Management', 'Kapazitätsplanung'] },
];

export function validateQuestPack(pack) {
  const errors = [];
  if (!pack || typeof pack !== 'object') errors.push('Content-Pack fehlt.');
  if (!pack?.id) errors.push('Pack-ID fehlt.');
  if (pack?.schemaVersion !== CONTENT_SCHEMA_VERSION) errors.push(`Schema-Version muss ${CONTENT_SCHEMA_VERSION} sein.`);
  if (!Array.isArray(pack?.quests)) errors.push('quests muss ein Array sein.');
  (pack?.quests || []).forEach((quest, index) => {
    if (!quest.id) errors.push(`Quest ${index}: ID fehlt.`);
    if (!quest.title) errors.push(`Quest ${index}: Titel fehlt.`);
    if (!Array.isArray(quest.steps) || quest.steps.length === 0) errors.push(`Quest ${quest.id || index}: Schritte fehlen.`);
    (quest.steps || []).forEach((step, stepIndex) => {
      if (!step.type || !step.prompt) errors.push(`Quest ${quest.id || index}, Schritt ${stepIndex}: type/prompt fehlt.`);
      if (!Array.isArray(step.options) || !step.options.some((option) => option.correct)) errors.push(`Quest ${quest.id || index}, Schritt ${stepIndex}: korrekte Option fehlt.`);
    });
  });
  return { valid: errors.length === 0, errors };
}

export function normalizeQuestPack(pack) {
  const validation = validateQuestPack(pack);
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  return {
    ...pack,
    quests: pack.quests.map((quest) => ({ difficulty: 1, minutes: 5, requires: [], unlockTools: [], unlockInfrastructure: [], ...quest })),
  };
}
