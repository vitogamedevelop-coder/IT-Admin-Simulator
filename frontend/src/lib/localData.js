import seed from '../../../backend/data/seed.js';

export const modules = seed.modules.map((module, index) => ({ ...module, id: index + 1, content: module.content, questions: module.questions.map((question, questionIndex) => ({ ...question, id: index * 100 + questionIndex + 1, module_id: index + 1, options: JSON.stringify(question.options) })) }));
export const cheats = seed.cheats.map((cheat, index) => ({ ...cheat, id: index + 1 }));
