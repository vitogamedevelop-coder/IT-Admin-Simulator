const CONTENT_SCHEMA = {
  required: ['id', 'version', 'topic', 'title', 'learningGoal', 'explanation'],
  recommended: ['terms', 'commands', 'commonMistakes', 'mainMission', 'sideMissions', 'notebookEntries', 'questions', 'difficulty'],
};

export function validateLearningContent(content) {
  const errors = [];
  if (!content || typeof content !== 'object') {
    errors.push('Inhalt ist kein gültiges Objekt.');
    return { valid: false, errors };
  }
  CONTENT_SCHEMA.required.forEach((key) => {
    if (content[key] === undefined || content[key] === null || content[key] === '') {
      errors.push(`Pflichtfeld fehlt: ${key}`);
    }
  });
  if (content.mainMission && typeof content.mainMission !== 'object') {
    errors.push('mainMission muss ein Objekt sein.');
  }
  if (content.sideMissions && !Array.isArray(content.sideMissions)) {
    errors.push('sideMissions muss ein Array sein.');
  }
  if (content.questions && !Array.isArray(content.questions)) {
    errors.push('questions muss ein Array sein.');
  }
  (content.questions || []).forEach((question, index) => {
    if (!question.prompt) errors.push(`Frage ${index}: prompt fehlt.`);
    if (!Array.isArray(question.options) || question.options.length === 0) errors.push(`Frage ${index}: options fehlen.`);
    if (question.answer === undefined) errors.push(`Frage ${index}: answer fehlt.`);
  });
  return { valid: errors.length === 0, errors };
}

export function previewFromContent(content) {
  const validation = validateLearningContent(content);
  return {
    ...validation,
    mainMission: content.mainMission || null,
    sideMissions: content.sideMissions || [],
    notebookEntries: content.notebookEntries || [],
    questions: content.questions || [],
    commands: content.commands || [],
  };
}

export function parseMarkdownLearningContent(text) {
  const result = { version: 1, terms: [], commands: [], commonMistakes: [], sideMissions: [], notebookEntries: [], questions: [], difficulty: 1 };
  const sections = text.split(/^## /m).map((s) => s.trim()).filter(Boolean);
  const getSection = (title) => sections.find((s) => s.toLowerCase().startsWith(title.toLowerCase()));
  const extractLines = (title) => {
    const section = getSection(title);
    if (!section) return [];
    return section.split('\n').slice(1).map((line) => line.replace(/^[-*]\s*/, '').trim()).filter((line) => line && !line.startsWith('#'));
  };

  result.id = getSection('ID')?.split('\n')[1]?.trim() || '';
  result.topic = getSection('Thema')?.split('\n')[1]?.trim() || '';
  result.title = getSection('Lerninhalt')?.split('\n')[0]?.replace(/^Lerninhalt:\s*/, '').trim() || getSection('Titel')?.split('\n')[1]?.trim() || '';
  result.learningGoal = getSection('Lernziel')?.split('\n').slice(1).join('\n').trim() || '';
  result.explanation = getSection('Erklärung')?.split('\n').slice(1).join('\n').trim() || '';
  result.terms = extractLines('Begriffe');
  result.commonMistakes = extractLines('Typische Fehler');
  result.notebookEntries = extractLines('Notizhefteinträge');

  const cmdSection = getSection('Befehle');
  if (cmdSection) {
    const cmdLine = cmdSection.split('\n').slice(1).find((line) => line.trim() && !line.startsWith('```'));
    if (cmdLine) result.commands.push({ command: cmdLine.trim(), syntax: cmdLine.trim(), example: cmdLine.trim() });
  }

  const mainSection = getSection('Hauptmission');
  if (mainSection) {
    const lines = mainSection.split('\n').slice(1);
    result.mainMission = { id: '', title: '', channel: 'email' };
    lines.forEach((line) => {
      if (line.toLowerCase().startsWith('id:')) result.mainMission.id = line.split(':')[1]?.trim() || '';
      if (line.toLowerCase().startsWith('titel:')) result.mainMission.title = line.split(':')[1]?.trim() || '';
      if (line.toLowerCase().startsWith('kanal:')) result.mainMission.channel = line.split(':')[1]?.trim() || 'email';
    });
  }

  return result;
}

export function uniqueIdCheck(content, existingIds) {
  const conflicts = [];
  if (existingIds.includes(content.id)) conflicts.push(`ID ${content.id} existiert bereits.`);
  (content.notebookEntries || []).forEach((entryId) => {
    if (existingIds.includes(entryId)) conflicts.push(`Notizhefteintrag ${entryId} existiert bereits.`);
  });
  return conflicts;
}

export function generateMissionFromContent(content) {
  return {
    id: content.mainMission?.id || content.id,
    type: 'main',
    title: content.mainMission?.title || content.title,
    subtitle: content.topic,
    briefing: content.mainMission?.briefing || content.explanation.slice(0, 200),
    resolution: content.learningGoal,
    unlockNotebook: content.notebookEntries || [],
    questions: (content.questions || []).map((q) => ({ ...q, id: `${content.id}-q-${Math.random().toString(36).slice(2, 7)}` })),
  };
}
