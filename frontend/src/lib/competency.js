const KEY = 'cyberlearn:competency-v1';
const HISTORY_LIMIT = 500;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function readCompetencies() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { topics: {}, history: [], sessions: [] };
  } catch {
    return { topics: {}, history: [], sessions: [] };
  }
}

function writeCompetencies(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('cyberlearn:competency-changed'));
}

export function topicForQuestion(question, module) {
  if (question.topic) return question.topic;
  const text = `${module?.title || ''} ${question.question || ''}`.toLowerCase();
  const rules = [
    ['dns', 'DNS'], ['dhcp', 'DHCP'], ['subnet', 'Subnetting'], ['osi', 'OSI-Modell'],
    ['active directory|ad-|domänen|gpo|kerberos|ldap', 'Active Directory'],
    ['powershell', 'PowerShell'], ['linux|chmod|systemctl|journalctl|sudo', 'Linux'],
    ['sql|datenbank|select|join', 'Datenbanken'], ['backup|raid|wiederherstell', 'Backup'],
    ['phishing|mfa|least privilege|sicherheit|ransomware', 'IT-Sicherheit'],
    ['tcp|udp|port|routing|gateway|vlan|arp|nat', 'Netzwerk'],
    ['monitor|log|ereignisanzeige|alert', 'Monitoring'], ['git|script|automatis', 'Automatisierung'],
    ['c#|unity|vector|monobehaviour', 'Coding'],
  ];
  return rules.find(([pattern]) => new RegExp(pattern).test(text))?.[1] || module?.title?.replace(/^Modul \d+:\s*/, '') || 'IT-Grundlagen';
}

export function expectedSeconds(question) {
  const textLength = `${question.question || ''} ${question.explanation || ''}`.length;
  const optionLength = (question.options || []).reduce((sum, option) => sum + String(option).length, 0);
  const difficulty = Number(question.difficulty) || 2;
  const typeFactor = question.type === 'free' ? 18 : question.type === 'scenario' ? 14 : 5;
  return Math.round(8 + textLength / 18 + optionLength / 35 + difficulty * 3 + typeFactor);
}

export function recordAnswer({ question, module, correct, elapsedMs, confidence = 2, usedHint = false, mode = 'quiz' }) {
  const data = readCompetencies();
  const topic = topicForQuestion(question, module);
  const current = data.topics[topic] || { knowledge: 0.15, application: 0.1, speed: 0.5, stability: 0.1, attempts: 0, correct: 0, misconceptions: {} };
  const expected = expectedSeconds(question);
  const elapsed = Math.max(1, elapsedMs / 1000);
  const speedScore = clamp(expected / elapsed, 0.25, 1.25) / 1.25;
  const confidenceWeight = confidence === 3 ? 1.12 : confidence === 1 ? 0.82 : 1;
  const hintWeight = usedHint ? 0.72 : 1;
  const difficulty = (Number(question.difficulty) || 2) / 5;
  const evidence = (correct ? 1 : 0) * confidenceWeight * hintWeight;
  const alpha = current.attempts < 5 ? 0.28 : 0.16;
  const applicationTask = question.type === 'scenario' || mode === 'mission';
  const next = {
    ...current,
    knowledge: clamp(current.knowledge * (1 - alpha) + evidence * alpha),
    application: clamp(current.application * (1 - alpha) + (applicationTask ? evidence : evidence * 0.6) * alpha),
    speed: clamp(current.speed * 0.8 + speedScore * 0.2),
    stability: clamp(current.stability * 0.88 + (correct && elapsed <= expected * 1.5 ? 1 : 0) * 0.12),
    attempts: current.attempts + 1,
    correct: current.correct + (correct ? 1 : 0),
    lastSeen: Date.now(),
    nextReview: Date.now() + reviewInterval(current, correct, confidence, usedHint),
    misconceptions: { ...current.misconceptions },
  };
  if (!correct) {
    const misconception = question.misconception || question.topic || 'Anwendung';
    next.misconceptions[misconception] = (next.misconceptions[misconception] || 0) + 1;
  }
  data.topics[topic] = next;
  data.history.push({ questionId: question.id, topic, correct, elapsed, expected, confidence, usedHint, mode, at: Date.now(), difficulty });
  data.history = data.history.slice(-HISTORY_LIMIT);
  writeCompetencies(data);
  return { topic, competency: next, expectedSeconds: expected };
}

function reviewInterval(current, correct, confidence, usedHint) {
  if (!correct) return 2 * 60 * 1000;
  if (usedHint || confidence === 1) return 24 * 60 * 60 * 1000;
  if (current.stability > 0.8) return 60 * 24 * 60 * 60 * 1000;
  if (current.stability > 0.6) return 21 * 24 * 60 * 60 * 1000;
  if (current.stability > 0.35) return 7 * 24 * 60 * 60 * 1000;
  return 3 * 24 * 60 * 60 * 1000;
}

export function weakestTopics(limit = 3) {
  const topics = Object.entries(readCompetencies().topics);
  return topics
    .sort(([, a], [, b]) => mastery(a) - mastery(b))
    .slice(0, limit)
    .map(([name, value]) => ({ name, ...value, mastery: mastery(value) }));
}

export function competencyOverview() {
  return Object.entries(readCompetencies().topics)
    .map(([name, value]) => ({ name, ...value, mastery: mastery(value) }))
    .sort((a, b) => b.mastery - a.mastery);
}

function mastery(value) {
  return clamp(value.knowledge * 0.4 + value.application * 0.3 + value.stability * 0.2 + value.speed * 0.1);
}

export function estimateMissionMinutes(questions) {
  const seconds = questions.reduce((sum, question) => sum + expectedSeconds(question) + 8, 0);
  return Math.max(2, Math.ceil(seconds / 60));
}

export function saveSession(summary) {
  const data = readCompetencies();
  data.sessions.push({ ...summary, at: Date.now() });
  data.sessions = data.sessions.slice(-100);
  writeCompetencies(data);
}
