// ============================================================================
// IPv4 & Subnetting Exercise Generator
// Generates random problems at three difficulty levels (easy, medium, hard).
// Used by the adaptive drill and exam modes in LessonRunner.
// ============================================================================
import {
  prefixToSubnetMask,
  getRelevantOctet,
  calculateJumpSize,
  calculateTotalAddresses,
  calculateUsableHosts,
  generateSubnetProblem,
} from '../networking/ipv4Math.js';

// ---------- Sam Tips (Denkanstöße, NICHT Lösungen) ----------
const SAM_TIPS = {
  relevantOctet: [
    'Welches Oktett verändert sich überhaupt?',
    'Schau dir an, in welchem Bereich dein Präfix liegt: /1–/8, /9–/16, /17–/24, /25–/32.',
    'Wo genau liegt die Grenze zwischen Netz- und Hostanteil?',
  ],
  jumpSize: [
    'Die Sprungweite ergibt sich aus 256 minus dem Maskenwert im relevanten Oktett.',
    'Erinnere dich an die Reihe: 128, 64, 32, 16, 8, 4, 2, 1.',
    'Wo beginnt der nächste Block?',
  ],
  networkId: [
    'Die Netz-ID ist immer ein Vielfaches der Sprungweite.',
    'Welches Vielfache der Sprungweite kommt noch VOR deiner IP?',
    'Kontrolliere zuerst deine Sprungweite.',
  ],
  broadcast: [
    'Der Broadcast ist immer eins weniger als die nächste Netz-ID.',
    'Netz-ID plus Sprungweite minus eins ergibt den Broadcast.',
    'Schau dir den Block an – wo endet er?',
  ],
  firstHost: [
    'Der erste Host ist immer die Netz-ID plus eins.',
    'Wer sitzt direkt hinter der Netz-ID?',
  ],
  lastHost: [
    'Der letzte Host ist immer der Broadcast minus eins.',
    'Wer sitzt direkt vor dem Broadcast?',
  ],
  hosts: [
    'Gesamtadressen minus Netz-ID minus Broadcast ergibt die nutzbaren Hosts.',
    'Denk dran: zwei Adressen sind immer reserviert.',
    '2 hoch (32 minus Präfix) minus 2 – das ist die Formel.',
  ],
  prefix: [
    'Wie viele Bits gehören zum Netzanteil?',
    'Zähle die zusammenhängenden Einsen in der Maske.',
  ],
  mask: [
    'Der Präfix sagt dir, wie viele Bits von links 1 sind.',
    'Nutze die Stellenwerte: 128, 64, 32, 16, 8, 4, 2, 1.',
  ],
};

export function getRandomTip(category) {
  const tips = SAM_TIPS[category] || SAM_TIPS.networkId;
  return tips[Math.floor(Math.random() * tips.length)];
}

// ---------- Difficulty-level parameters ----------
const DIFFICULTY_PARAMS = {
  easy: { prefixMin: 24, prefixMax: 28 },
  medium: { prefixMin: 16, prefixMax: 30 },
  hard: { prefixMin: 8, prefixMax: 30 },
};

// ---------- Question types per difficulty ----------

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate a random IP for exercises
function randomIp(privateOnly = true) {
  if (privateOnly) {
    const ranges = [
      () => `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
      () => `172.${randomInt(16, 31)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
      () => `192.168.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    ];
    return randomChoice(ranges)();
  }
  return `${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

// ---------- Easy-level questions ----------
function generateEasyQuestion() {
  const types = ['recognizeIp', 'recognizeMask', 'recognizePrefix', 'calculateHosts', 'privateOrPublic', 'specialAddress'];
  const type = randomChoice(types);

  switch (type) {
    case 'recognizeIp': {
      const validIp = randomIp();
      const invalid = [
        `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(256, 999)}`,
        `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`,
        `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`,
      ];
      const options = shuffleArray([validIp, ...invalid.slice(0, 3)]);
      return {
        question: 'Welche davon ist eine gültige IPv4-Adresse?',
        type: 'select',
        options,
        correct: options.indexOf(validIp),
        tipCategory: 'prefix',
        explanation: `${validIp} hat vier Oktette mit Werten zwischen 0 und 255.`,
      };
    }
    case 'recognizeMask': {
      const prefix = randomChoice([8, 16, 20, 24, 26, 27, 28]);
      const mask = prefixToSubnetMask(prefix).decimal;
      const wrong = [
        prefixToSubnetMask(Math.max(8, prefix - 4)).decimal,
        prefixToSubnetMask(Math.min(30, prefix + 2)).decimal,
        '255.0.255.0',
      ].filter(m => m !== mask);
      const options = shuffleArray([mask, ...wrong.slice(0, 3)]);
      return {
        question: `Welche Subnetzmaske gehört zu /${prefix}?`,
        type: 'select',
        options,
        correct: options.indexOf(mask),
        tipCategory: 'mask',
        explanation: `/${prefix} ergibt die Maske ${mask}.`,
      };
    }
    case 'recognizePrefix': {
      const prefix = randomChoice([8, 16, 20, 24, 25, 26, 27, 28, 30]);
      const mask = prefixToSubnetMask(prefix).decimal;
      const wrongPrefixes = [prefix - 2, prefix + 2, prefix - 4].filter(p => p >= 1 && p <= 32);
      const options = shuffleArray([`/${prefix}`, ...wrongPrefixes.map(p => `/${p}`)].slice(0, 4));
      return {
        question: `Welcher Präfix gehört zur Maske ${mask}?`,
        type: 'select',
        options,
        correct: options.indexOf(`/${prefix}`),
        tipCategory: 'prefix',
        explanation: `${mask} hat ${prefix} gesetzte Bits, also /${prefix}.`,
      };
    }
    case 'calculateHosts': {
      const prefix = randomChoice([24, 25, 26, 27, 28]);
      const hosts = calculateUsableHosts(prefix);
      const wrong = [hosts + 2, hosts - 2, hosts * 2].filter(h => h > 0 && h !== hosts);
      const options = shuffleArray([String(hosts), ...wrong.map(String)].slice(0, 4));
      return {
        question: `Wie viele nutzbare Hosts hat ein /${prefix}-Netz?`,
        type: 'select',
        options,
        correct: options.indexOf(String(hosts)),
        tipCategory: 'hosts',
        explanation: `2^${32 - prefix} - 2 = ${hosts} nutzbare Hosts.`,
      };
    }
    case 'privateOrPublic': {
      const isPrivate = Math.random() < 0.5;
      let ip, explanation;
      if (isPrivate) {
        const range = randomChoice([
          { fn: () => `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`, name: '10.0.0.0/8' },
          { fn: () => `172.${randomInt(16, 31)}.${randomInt(0, 255)}.${randomInt(1, 254)}`, name: '172.16.0.0/12' },
          { fn: () => `192.168.${randomInt(0, 255)}.${randomInt(1, 254)}`, name: '192.168.0.0/16' },
        ]);
        ip = range.fn();
        explanation = `${ip} gehört zum privaten Bereich ${range.name}.`;
      } else {
        ip = `${randomChoice([8, 1, 203, 51, 93])}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
        explanation = `${ip} gehört zu keinem der drei privaten Bereiche und ist daher öffentlich.`;
      }
      const correct = isPrivate ? 'Privat' : 'Öffentlich';
      const options = ['Privat', 'Öffentlich', 'Loopback', 'APIPA'];
      return {
        question: `Ist ${ip} eine private oder öffentliche Adresse?`,
        type: 'select',
        options,
        correct: options.indexOf(correct),
        tipCategory: 'prefix',
        explanation,
      };
    }
    case 'specialAddress': {
      const scenarios = [
        { ip: '127.0.0.1', answer: 'Loopback', explanation: '127.0.0.1 ist die Loopback-Adresse – ein Gerät spricht mit sich selbst.' },
        { ip: `127.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`, answer: 'Loopback', explanation: 'Alles im Bereich 127.0.0.0/8 ist Loopback.' },
        { ip: `169.254.${randomInt(1, 254)}.${randomInt(1, 254)}`, answer: 'APIPA', explanation: '169.254.0.0/16 ist der APIPA-/Link-Local-Bereich – entsteht oft, wenn kein DHCP verfügbar ist.' },
        { ip: `224.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`, answer: 'Multicast', explanation: '224.0.0.0/4 (224–239) ist der Multicast-Bereich.' },
        { ip: `239.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`, answer: 'Multicast', explanation: '224.0.0.0/4 (224–239) ist der Multicast-Bereich.' },
      ];
      const chosen = randomChoice(scenarios);
      const options = shuffleArray(['Loopback', 'APIPA', 'Multicast', 'Privat']);
      return {
        question: `Um welchen Adresstyp handelt es sich bei ${chosen.ip}?`,
        type: 'select',
        options,
        correct: options.indexOf(chosen.answer),
        tipCategory: 'prefix',
        explanation: chosen.explanation,
      };
    }
    default:
      return generateEasyQuestion();
  }
}

// ---------- Medium-level questions ----------
function generateMediumQuestion() {
  const types = ['hostCount', 'prefixFromHosts', 'subnetMask', 'relevantOctet', 'jumpSize'];
  const type = randomChoice(types);

  switch (type) {
    case 'hostCount': {
      const prefix = randomInt(16, 28);
      const hosts = calculateUsableHosts(prefix);
      return {
        question: `Wie viele nutzbare Hosts hat ein /${prefix}-Netz?`,
        type: 'input',
        answer: String(hosts),
        tipCategory: 'hosts',
        explanation: `2^${32 - prefix} - 2 = ${hosts} nutzbare Hosts.`,
      };
    }
    case 'prefixFromHosts': {
      const prefix = randomChoice([24, 25, 26, 27, 28, 29, 30]);
      const hosts = calculateUsableHosts(prefix);
      return {
        question: `Du brauchst mindestens ${hosts} Hosts. Welcher Präfix passt genau?`,
        type: 'input',
        answer: String(prefix),
        tipCategory: 'prefix',
        explanation: `/${prefix} bietet genau ${hosts} nutzbare Hosts.`,
      };
    }
    case 'subnetMask': {
      const prefix = randomInt(17, 30);
      const mask = prefixToSubnetMask(prefix).decimal;
      return {
        question: `Welche Subnetzmaske gehört zu /${prefix}?`,
        type: 'input',
        answer: mask,
        tipCategory: 'mask',
        explanation: `/${prefix} ergibt ${mask}.`,
      };
    }
    case 'relevantOctet': {
      const prefix = randomInt(9, 30);
      const octet = getRelevantOctet(prefix) + 1;
      return {
        question: `Bei /${prefix} – welches Oktett ist relevant? (1–4)`,
        type: 'input',
        answer: String(octet),
        tipCategory: 'relevantOctet',
        explanation: `/${prefix} liegt im ${octet}. Oktett.`,
      };
    }
    case 'jumpSize': {
      const prefix = randomInt(9, 30);
      const jump = calculateJumpSize(prefix);
      return {
        question: `Wie groß ist die Sprungweite bei /${prefix}?`,
        type: 'input',
        answer: String(jump),
        tipCategory: 'jumpSize',
        explanation: `Sprungweite bei /${prefix} = ${jump}.`,
      };
    }
    default:
      return generateMediumQuestion();
  }
}

// ---------- Hard-level questions ----------
function generateHardQuestion() {
  const types = ['networkId', 'broadcast', 'firstHost', 'lastHost', 'hostRange', 'totalAddresses', 'prefixFromContext'];
  const type = randomChoice(types);
  const params = DIFFICULTY_PARAMS.hard;
  const problem = generateSubnetProblem(params);

  switch (type) {
    case 'networkId':
      return {
        question: `Netz-ID von ${problem.ip}/${problem.prefix}?`,
        type: 'input',
        answer: problem.network,
        tipCategory: 'networkId',
        explanation: `Sprungweite ${calculateJumpSize(problem.prefix)} im ${getRelevantOctet(problem.prefix) + 1}. Oktett → Netz-ID ${problem.network}.`,
      };
    case 'broadcast':
      return {
        question: `Broadcast von ${problem.ip}/${problem.prefix}?`,
        type: 'input',
        answer: problem.broadcast,
        tipCategory: 'broadcast',
        explanation: `Block endet bei ${problem.broadcast}.`,
      };
    case 'firstHost':
      return {
        question: `Erster nutzbarer Host in ${problem.network}/${problem.prefix}?`,
        type: 'input',
        answer: problem.firstHost,
        tipCategory: 'firstHost',
        explanation: `Netz-ID + 1 = ${problem.firstHost}.`,
      };
    case 'lastHost':
      return {
        question: `Letzter nutzbarer Host in ${problem.network}/${problem.prefix}?`,
        type: 'input',
        answer: problem.lastHost,
        tipCategory: 'lastHost',
        explanation: `Broadcast − 1 = ${problem.lastHost}.`,
      };
    case 'hostRange':
      return {
        question: `Hostbereich (erster–letzter) von ${problem.ip}/${problem.prefix}?`,
        type: 'input',
        answer: `${problem.firstHost}-${problem.lastHost}`,
        alternateAnswers: [
          `${problem.firstHost} - ${problem.lastHost}`,
          `${problem.firstHost}–${problem.lastHost}`,
          `${problem.firstHost} – ${problem.lastHost}`,
        ],
        tipCategory: 'firstHost',
        explanation: `Hostbereich: ${problem.firstHost} bis ${problem.lastHost}.`,
      };
    case 'totalAddresses': {
      const total = calculateTotalAddresses(problem.prefix);
      return {
        question: `Wie viele Adressen insgesamt hat ${problem.network}/${problem.prefix}?`,
        type: 'input',
        answer: String(total),
        tipCategory: 'hosts',
        explanation: `2^${32 - problem.prefix} = ${total} Adressen insgesamt.`,
      };
    }
    case 'prefixFromContext': {
      const jump = calculateJumpSize(problem.prefix);
      return {
        question: `Ein Netz hat die Sprungweite ${jump} im ${getRelevantOctet(problem.prefix) + 1}. Oktett. Welcher Präfix ist das?`,
        type: 'input',
        answer: String(problem.prefix),
        tipCategory: 'prefix',
        explanation: `Sprungweite ${jump} im ${getRelevantOctet(problem.prefix) + 1}. Oktett = /${problem.prefix}.`,
      };
    }
    default:
      return generateHardQuestion();
  }
}

// ---------- Public API ----------
export const DIFFICULTY_NAMES = ['easy', 'medium', 'hard'];
export const DIFFICULTY_LABELS = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

export function generateQuestion(difficulty) {
  switch (difficulty) {
    case 'easy': return generateEasyQuestion();
    case 'medium': return generateMediumQuestion();
    case 'hard': return generateHardQuestion();
    default: return generateEasyQuestion();
  }
}

// Generate a set of exam questions (no repeats via type variety)
export function generateExamQuestions(difficulty, count = 10) {
  const questions = [];
  const seen = new Set();
  let attempts = 0;
  while (questions.length < count && attempts < count * 5) {
    attempts++;
    const q = generateQuestion(difficulty);
    const key = q.question;
    if (!seen.has(key)) {
      seen.add(key);
      questions.push(q);
    }
  }
  return questions;
}

// Check if an answer is correct (handles alternate answers + /prefix normalization)
export function checkAnswer(question, userAnswer) {
  const normalized = String(userAnswer).trim().toLowerCase();
  const expected = String(question.answer).trim().toLowerCase();
  if (expected === normalized) return true;
  // Accept /26 when answer is 26 and vice versa (prefix questions)
  const stripSlash = (s) => s.replace(/^\//, '');
  if (/^\/?(\d+)$/.test(normalized) && /^\/?(\d+)$/.test(expected)) {
    if (stripSlash(normalized) === stripSlash(expected)) return true;
  }
  if (question.alternateAnswers) {
    return question.alternateAnswers.some(a => {
      const alt = String(a).trim().toLowerCase();
      if (alt === normalized) return true;
      if (/^\/?(\d+)$/.test(normalized) && /^\/?(\d+)$/.test(alt)) {
        return stripSlash(normalized) === stripSlash(alt);
      }
      return false;
    });
  }
  return false;
}

// Subnetting-specific generator (for the subnetting lesson)
export function generateSubnettingQuestion(difficulty) {
  const params = DIFFICULTY_PARAMS[difficulty] || DIFFICULTY_PARAMS.easy;
  const problem = generateSubnetProblem(params);

  if (difficulty === 'easy') {
    const types = ['jumpSize', 'relevantOctet', 'networkIdSimple'];
    const type = randomChoice(types);
    switch (type) {
      case 'jumpSize':
        return {
          question: `Sprungweite bei /${problem.prefix}?`,
          type: 'input',
          answer: String(calculateJumpSize(problem.prefix)),
          tipCategory: 'jumpSize',
          explanation: `Sprungweite bei /${problem.prefix} = ${calculateJumpSize(problem.prefix)}.`,
        };
      case 'relevantOctet':
        return {
          question: `Welches Oktett ist bei /${problem.prefix} relevant? (1–4)`,
          type: 'input',
          answer: String(getRelevantOctet(problem.prefix) + 1),
          tipCategory: 'relevantOctet',
          explanation: `/${problem.prefix} liegt im ${getRelevantOctet(problem.prefix) + 1}. Oktett.`,
        };
      case 'networkIdSimple':
        return {
          question: `Netz-ID von ${problem.ip}/${problem.prefix}?`,
          type: 'input',
          answer: problem.network,
          tipCategory: 'networkId',
          explanation: `Netz-ID = ${problem.network}.`,
        };
      default:
        return generateSubnettingQuestion(difficulty);
    }
  }

  if (difficulty === 'medium') {
    const types = ['networkId', 'broadcast', 'hosts'];
    const type = randomChoice(types);
    switch (type) {
      case 'networkId':
        return {
          question: `Netz-ID von ${problem.ip}/${problem.prefix}?`,
          type: 'input',
          answer: problem.network,
          tipCategory: 'networkId',
          explanation: `Netz-ID = ${problem.network}.`,
        };
      case 'broadcast':
        return {
          question: `Broadcast von ${problem.ip}/${problem.prefix}?`,
          type: 'input',
          answer: problem.broadcast,
          tipCategory: 'broadcast',
          explanation: `Broadcast = ${problem.broadcast}.`,
        };
      case 'hosts':
        return {
          question: `Nutzbare Hosts bei /${problem.prefix}?`,
          type: 'input',
          answer: String(calculateUsableHosts(problem.prefix)),
          tipCategory: 'hosts',
          explanation: `2^${32 - problem.prefix} - 2 = ${calculateUsableHosts(problem.prefix)}.`,
        };
      default:
        return generateSubnettingQuestion(difficulty);
    }
  }

  // Hard: mixed everything
  const types = ['networkId', 'broadcast', 'firstHost', 'lastHost', 'suffix', 'prefix', 'hosts', 'jumpSize'];
  const type = randomChoice(types);
  switch (type) {
    case 'networkId':
      return { question: `Netz-ID von ${problem.ip}/${problem.prefix}?`, type: 'input', answer: problem.network, tipCategory: 'networkId', explanation: `Netz-ID = ${problem.network}.` };
    case 'broadcast':
      return { question: `Broadcast von ${problem.ip}/${problem.prefix}?`, type: 'input', answer: problem.broadcast, tipCategory: 'broadcast', explanation: `Broadcast = ${problem.broadcast}.` };
    case 'firstHost':
      return { question: `Erster Host in ${problem.network}/${problem.prefix}?`, type: 'input', answer: problem.firstHost, tipCategory: 'firstHost', explanation: `Erster Host = ${problem.firstHost}.` };
    case 'lastHost':
      return { question: `Letzter Host in ${problem.network}/${problem.prefix}?`, type: 'input', answer: problem.lastHost, tipCategory: 'lastHost', explanation: `Letzter Host = ${problem.lastHost}.` };
    case 'suffix':
      return { question: `Wie viele Hostbits hat /${problem.prefix}?`, type: 'input', answer: String(32 - problem.prefix), tipCategory: 'prefix', explanation: `32 - ${problem.prefix} = ${32 - problem.prefix} Hostbits.` };
    case 'prefix':
      return { question: `Sprungweite ${calculateJumpSize(problem.prefix)} im ${getRelevantOctet(problem.prefix) + 1}. Oktett – welcher Präfix?`, type: 'input', answer: String(problem.prefix), tipCategory: 'prefix', explanation: `/${problem.prefix}.` };
    case 'hosts':
      return { question: `Nutzbare Hosts bei /${problem.prefix}?`, type: 'input', answer: String(calculateUsableHosts(problem.prefix)), tipCategory: 'hosts', explanation: `${calculateUsableHosts(problem.prefix)} Hosts.` };
    case 'jumpSize':
      return { question: `Sprungweite bei /${problem.prefix}?`, type: 'input', answer: String(calculateJumpSize(problem.prefix)), tipCategory: 'jumpSize', explanation: `Sprungweite = ${calculateJumpSize(problem.prefix)}.` };
    default:
      return generateSubnettingQuestion(difficulty);
  }
}
