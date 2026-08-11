// Procedural ticket templates for side missions.
// Phase 0 reset: legacy demo templates have been removed.

export const proceduralTicketTemplates = [];

export function eligibleTicketTemplates({ stage, unlockedObjectives }) {
  const known = new Set(unlockedObjectives);
  return proceduralTicketTemplates.filter((template) => template.minStage <= stage && template.prerequisites.every((item) => known.has(item) || known.has(template.domain)));
}

export function instantiateTicket(template, seed = Date.now()) {
  const choose = (values, offset) => values[(seed + offset) % values.length];
  const number = 1 + (seed % 24);
  return {
    templateId: template.id,
    system: choose(template.systems, 1).replace('{n}', String(number).padStart(2, '0')),
    symptom: choose(template.symptoms, 2),
    cause: choose(template.causes, 3),
    priority: choose(template.priorities, 4),
    channel: choose(template.channels, 5),
    safeActions: template.safeActions,
    unsafeActions: template.unsafeActions,
    generatedAt: Date.now(),
  };
}
