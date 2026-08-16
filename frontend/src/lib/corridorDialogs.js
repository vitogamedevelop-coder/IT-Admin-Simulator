import { getPlayerName } from './gameState.js';
import { getFullTopic } from './academyProgress.js';
import { TOPIC_STATUS } from './academyTopics.js';

// Smalltalk lines for the hallway fallback and Sam's "Nur kurz reden" option.
export const SAM_SMALLTALK = [
  'Das Netzwerk läuft vielleicht nicht immer, aber der Kaffee muss laufen.',
  'Ich hab heute Morgen schon drei E-Mails gesehen, die mit "Hilfe, kein Internet!" angefangen haben.',
  'Manchmal vermisse ich die Zeit, in der ein einfacher Neustart wirklich alles gelöst hat.',
  'Wusstest du, dass der durchschnittliche Mensch sein Passwort häufiger ändert als seine Zahnpasta?',
  'Ich überlege, ob ich meinen Schreibtisch mal wieder nach MAC-Adressen sortiere.',
  'Der Drucker im zweiten Stock hat heute schon wieder einen Existenzkampf gewonnen.',
  'CyberSecurity ist im Grunde nur digitaler Hausputz – nur dass der Staub dich ausrauben will.',
  'Ich hab gestern versucht, meinem Kaffeebecher eine feste IP zu geben. Hat nicht geklappt.',
  'Willkommen im NEXUS-Team. Regel Nummer eins: Frag nie, warum der Router gerade gebootet hat.',
  'Ich habe gehört, jemand hat den Serverraum als "sauna" bezeichnet. Nur halb falsch.',
  'Wenn du jemals das Gefühl hast, langsam zu sein – denk an unsere alten 10-Mbit-Hubs.',
  'Ein Backup ist wie ein Regenschirm: Man merkt erst, dass man keins hat, wenn es anfängt zu regnen.',
  'Ich plane, meinen Ruhestand in einem voll vermaschten Netzwerk zu verbringen.',
  'Der beste IT-Support-Satz der Welt: "Haben Sie es schon aus- und wieder eingeschaltet?"',
  'Ich schwöre, manche Probleme lösen sich nur, weil das Gerät spürt, dass wir uns nähern.',
  'Unser WLAN-Passwort ist so lang, dass es theoretisch als Netzwerkkabel durchgeht.',
  'Ich habe versucht, ein VLAN für meine Gefühle einzurichten. Zu viel Broadcast-Verkehr.',
  'In der IT ist der einzige Konstante Wandel – und dass jemand den Kaffee ausgetrunken hat.',
  'Manchmal frage ich mich, ob wir das Netzwerk administrieren oder das Netzwerk uns.',
  'Wenn du jemals alle Lichter im Serverraum ausmachst, hörst du das Internet atmen.',
  'Mein Tipp fürs Wochenende: Updates installieren, dann spazieren gehen.',
  'Ich habe einen Verdacht: Unsere Firewall trinkt heimlich Kaffee.',
];

export function randomSamSmalltalk() {
  return SAM_SMALLTALK[Math.floor(Math.random() * SAM_SMALLTALK.length)];
}

// The hallway room menu. The ONLY place new corridor rooms need to be added;
// Workspace.jsx dispatches purely by `action`.
export const CORRIDOR_ROOMS = [
  { id: 'sams-office', label: "Sam's Büro", icon: '🧑‍💻', action: 'sams-office', description: 'Mentor, Academy und Lernfortschritt' },
  { id: 'break-room', label: 'Aufenthaltsraum', icon: '☕', action: 'break-room', description: 'Kollegen treffen, Hinweise erhalten, kleine Gespräche.' },
  { id: 'colleagues', label: 'Mitarbeiter', icon: '💬', action: 'colleagues', description: 'Adaptive Fachgespräche, Nebenmissionen, Smalltalk.' },
];

function samProgressLine(topic) {
  if (!topic) return 'Dann fangen wir mit den Grundbegriffen an.';
  if (topic.status === TOPIC_STATUS.AVAILABLE) return 'Dann fangen wir mit den Grundbegriffen an.';
  if (topic.status === TOPIC_STATUS.STARTED) return 'Beim letzten Mal haben wir über Netzwerke gesprochen.';
  return 'Die Grundbegriffe sitzen schon ganz gut.';
}

export function buildSamOfficeDialog() {
  const name = getPlayerName();
  const greeting = name ? `Na ${name}, wie läuft's heute?` : `Na, wie läuft's heute?`;
  const topic = getFullTopic('fundamentals', 'grundbegriffe');
  const progressLine = samProgressLine(topic);
  const howFarLine = !topic || topic.status === TOPIC_STATUS.AVAILABLE
    ? 'Noch nichts angefangen. Am besten fangen wir mit den Grundbegriffen an.'
    : topic.status === TOPIC_STATUS.STARTED
      ? 'Du bist mitten in den Grundbegriffen - lass uns das zu Ende bringen.'
      : 'Die Grundbegriffe hast du drauf. Der Rest der Grundlagen ist aktuell noch gesperrt, aber das kommt noch.';
  return {
    id: 'sams-office', personId: 'sam', mode: 'face-to-face',
    nodes: [
      { id: 'start', text: `${greeting}\n\n${progressLine}`, options: [
        { label: '📘 Ich möchte etwas lernen.', nextId: 'learn' },
        { label: '📈 Wie weit bin ich?', nextId: 'progress' },
        { label: '☕ Nur kurz reden.', nextId: 'smalltalk' },
        { label: '👋 Bis später.', nextId: 'bye' },
      ] },
      { id: 'learn', text: `${progressLine} Komm mit, ich zeig dir die Academy.`, tts: true, ttsMode: 'voice-test', onComplete: { action: 'academy' } },
      { id: 'progress', text: howFarLine },
      { id: 'smalltalk', text: randomSamSmalltalk(), onComplete: { action: 'close' } },
      { id: 'bye', text: 'Bis später dann. Mein Büro findest du immer hier im Flur.', onComplete: { action: 'close' } },
    ],
    entryNode: 'start',
  };
}

export function buildDefaultDialog() {
  return {
    id: 'no-mission-smalltalk', personId: 'sam', mode: 'face-to-face',
    nodes: [
      { id: 'start', text: 'Für den Moment haben wir die aktuellen Themen ziemlich gut abgeklopft. Wenn du gezielt weiterlernen willst, schau bei mir oder in der Academy vorbei.', options: [
        { label: 'Kannst du mir etwas beibringen?', nextId: 'academy' },
        { label: 'Reden wir kurz.', nextId: 'smalltalk' },
        { label: 'Ist schon gut, danke.', nextId: 'bye' },
      ] },
      { id: 'academy', text: 'Klar, komm mit rüber zur NEXUS Academy. Da gehen wir das in Ruhe durch.', onComplete: { action: 'academy' } },
      { id: 'smalltalk', text: randomSamSmalltalk(), onComplete: { action: 'close' } },
      { id: 'bye', text: 'Alles klar. Schau sonst ins Notizheft oder starte ein freiwilliges Training.', onComplete: { action: 'close' } },
    ],
    entryNode: 'start',
  };
}
