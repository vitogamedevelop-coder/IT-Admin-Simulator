import { cheats, modules } from './localData.js';

const STORE_KEY = 'cyberlearn:offline-state';
const OFFLINE_USER = { id: 'offline', username: 'Lokaler Operator', role: 'offline', xp: 0, rank: 'Script-Kiddie' };

function readState() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { xp: 0, answers: [], progress: {}, flashcards: [], fillblanks: [], mnemonics: [] }; } catch { return { xp: 0, answers: [], progress: {}, flashcards: [], fillblanks: [], mnemonics: [] }; } }
function saveState(state) { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function user(state) { const xp = state.xp || 0; return { ...OFFLINE_USER, xp, rank: xp >= 1000 ? 'Pentester' : xp >= 400 ? 'SysAdmin' : xp >= 150 ? 'Script-Runner' : 'Script-Kiddie' }; }
function response(data) { return Promise.resolve(data); }
function body(options) { try { return JSON.parse(options.body || '{}'); } catch { return {}; } }
function moduleById(id) { return modules.find((module) => module.id === Number(id)); }

export function getToken() { return 'offline'; }
export function setToken() {}
export function clearToken() {}

export async function api(path, options = {}) {
  const state = readState(); const method = options.method || 'GET'; const url = new URL(path, 'https://offline.local'); const parts = url.pathname.split('/').filter(Boolean);
  if (path === '/api/auth/me') return response(user(state));
  if (path === '/api/modules' && method === 'GET') return response(modules.map((module) => ({ ...module, progress: state.progress[module.id] || null, locked: false, questions: undefined })));
  if (parts[0] === 'api' && parts[1] === 'modules' && parts[2] === 'questions') { const faculty = url.searchParams.get('faculty'); return response(modules.filter((module) => module.faculty_id === faculty).flatMap((module) => module.questions)); }
  if (parts[0] === 'api' && parts[1] === 'modules' && parts.length === 3 && method === 'GET') { const module = moduleById(parts[2]); if (!module) throw new Error('Modul nicht gefunden'); return response({ ...module, progress: state.progress[module.id] || null }); }
  if (parts[0] === 'api' && parts[1] === 'modules' && parts[3] === 'answer' && method === 'POST') { const module = moduleById(parts[2]); const data = body(options); const question = module?.questions.find((item) => item.id === Number(data.questionId)); if (!question) throw new Error('Frage nicht gefunden'); const correct = String(data.answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase(); if (correct && !state.answers.includes(question.id)) { state.answers.push(question.id); state.xp += 10; } const correctCount = module.questions.filter((item) => state.answers.includes(item.id)).length; const progress = { completed: correctCount === module.questions.length ? 1 : 0, score: Math.round((correctCount / module.questions.length) * 100) }; if (progress.completed && !state.progress[module.id]?.completed) state.xp += 50; state.progress[module.id] = progress; saveState(state); return response({ correct, answer: question.answer, explanation: question.explanation, diagnostic: correct ? null : question.diagnostic, xp: correct ? user(state) : null, progress }); }
  if (path.startsWith('/api/cheat/categories')) return response([...new Set(cheats.map((item) => item.category))]);
  if (path.startsWith('/api/cheat')) { const search = (url.searchParams.get('search') || '').toLowerCase(); const category = url.searchParams.get('category'); return response(cheats.filter((item) => (!category || category === 'all' || item.category === category) && (!search || `${item.title} ${item.syntax} ${(item.tags || []).join(' ')}`.toLowerCase().includes(search)))); }
  if (path === '/api/user/profile') return response({ user: user(state), xpLog: [], streak: { current_streak: 0 } });
  if (path === '/api/user/leaderboard') return response([user(state)]);
  if (path === '/api/user/stats') return response({ totals: { attempts: state.answers.length, correct: state.answers.length, unique_questions: state.answers.length }, modules: modules.map((module) => ({ title: module.title, faculty_id: module.faculty_id, ...(state.progress[module.id] || { score: 0, completed: 0 }) })), days: [] });
  if (path.startsWith('/api/patch')) return response([]);
  if (path.startsWith('/api/user/daily-challenge')) { const question = modules[0].questions[0]; return response(method === 'GET' ? { completed: false, question: { ...question, options: JSON.parse(question.options) } } : { correct: false }); }
  if (path.startsWith('/api/custom/flashcards')) return response(state.flashcards);
  if (path.startsWith('/api/custom/fillblanks')) return response(state.fillblanks);
  if (path.startsWith('/api/custom/mnemonics')) return response(state.mnemonics);
  if (path === '/api/user/export') return response({ version: 1, flashcards: state.flashcards, fillblanks: state.fillblanks, mnemonics: state.mnemonics });
  if (path === '/api/user/import' && method === 'POST') { const imported = body(options); state.flashcards.push(...(imported.flashcards || [])); state.fillblanks.push(...(imported.fillblanks || [])); state.mnemonics.push(...(imported.mnemonics || [])); saveState(state); return response({ ok: true }); }
  if (path.startsWith('/api/search')) return response([]);
  return response({ ok: true });
}

export async function login() { return user(readState()); }
export async function register() { return user(readState()); }
export async function me() { return user(readState()); }
