const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

// Unlock all conversation topics for the sample.
store.set('cyberlearn:academy-mode-v1', JSON.stringify({ stateVersion: 1, mode: 'course', placementResults: {} }));

const { pathToFileURL: ptfu } = await import('node:url');
const { startEmployeeConversation } = await import(ptfu('C:/Users/vitog/CyberLearn/frontend/src/lib/employeeConversations.js').href);

const samples = [];
for (let i = 0; i < 30; i += 1) {
  const conv = startEmployeeConversation();
  if (!conv || !conv.question) continue;
  const q = conv.question;
  samples.push({
    employee: conv.employee.name,
    topic: conv.topicKey,
    conceptCluster: q.conceptCluster,
    knowledgeFacet: q.knowledgeFacet,
    templateId: q.templateId,
    difficulty: q.difficulty,
    loreLeadIn: q.loreLeadIn,
    context: q.context,
    coreQuestion: q.coreQuestion,
    type: q.type,
    answers: (q.options || []).map((o) => o.label || o.text),
    hasContextQuestion: q.context && q.context.includes('?'),
  });
}

console.log(`Generated ${samples.length} samples`);
for (const s of samples.slice(0, 10)) {
  console.log('\n---');
  console.log('Employee:', s.employee);
  console.log('Topic:', s.topic);
  console.log('Concept:', s.conceptCluster, '| Facet:', s.knowledgeFacet, '| Template:', s.templateId);
  console.log('Lore:', s.loreLeadIn);
  console.log('Context:', s.context);
  console.log('Core:', s.coreQuestion);
  console.log('Answers:', s.answers.join(' | '));
  console.log('HasContextQuestion:', s.hasContextQuestion);
}
