// officeWorld.js
//
// Two distinct data sources:
//
// 1. STORY_CHARACTERS — fixed NEXUS story NPCs that may appear in the corridor,
//    conversations, calls, mails and spoken dialogs. They have a stable id,
//    a display name and a dedicated voice profile.
//
// 2. ACCOUNT_NAME_POOL — a large pool of generated employee identities used only
//    for procedural mission accounts ("username mkoenig secret ..."). People
//    in this pool are NOT automatically corridor NPCs and do NOT get a
//    character voice.

// ============================================================================
// Story / Conversation Roster
// ============================================================================

const MARA = {
  id: 'mara',
  firstName: 'Mara',
  lastName: 'König',
  name: 'Mara König',
  username: 'mkoenig',
  department: 'Helpdesk',
  role: 'Helpdesk',
  channel: 'phone',
  tone: 'direkt und freundlich',
  topics: ['DHCP', 'DNS', 'Berechtigungen'],
};

const DAVID = {
  id: 'david',
  firstName: 'David',
  lastName: 'Chen',
  name: 'David Chen',
  username: 'dchen',
  department: 'Entwicklung',
  role: 'Entwicklung',
  channel: 'mail',
  tone: 'technisch neugierig',
  topics: ['DNS', 'Datenbanken', 'Automatisierung'],
};

const SAM = {
  id: 'sam',
  firstName: 'Sam',
  lastName: 'Richter',
  name: 'Sam Richter',
  username: 'sritter',
  department: 'Netzwerk',
  role: 'Senior-Administrator',
  channel: 'phone',
  tone: 'hilfreich, aber fordert Begründungen',
  topics: ['Netzwerk', 'Active Directory', 'Linux'],
};

const AYLIN = {
  id: 'aylin',
  firstName: 'Aylin',
  lastName: 'Demir',
  name: 'Aylin Demir',
  username: 'ademir',
  department: 'Personalabteilung',
  role: 'Personalabteilung',
  channel: 'phone',
  tone: 'praxisorientiert',
  topics: ['Berechtigungen', 'Active Directory', 'IT-Sicherheit'],
};

const THOMAS = {
  id: 'thomas',
  firstName: 'Thomas',
  lastName: 'Weber',
  name: 'Thomas Weber',
  username: 'tweber',
  department: 'Geschäftsführung',
  role: 'Geschäftsführung',
  channel: 'mail',
  tone: 'fragt nach Risiko und Auswirkung',
  topics: ['Backup', 'Change Management', 'Infrastruktur'],
};

export const STORY_CHARACTERS = [MARA, DAVID, SAM, AYLIN, THOMAS];

// Conversation partners are the story characters except Sam, who is reserved
// for mentor / intervention lines.
export const CONVERSATION_CHARACTERS = [MARA, DAVID, AYLIN, THOMAS];

// `colleagues` stays the story roster for existing callers (Workspace,
// PhoneApp, worldDispatcher, notificationSystem, objectives).
export const colleagues = STORY_CHARACTERS;

export function colleagueById(id) {
  return STORY_CHARACTERS.find((c) => c.id === id) || null;
}

export function randomConversationPartner() {
  const pool = CONVERSATION_CHARACTERS;
  return pool[Math.floor(Math.random() * pool.length)] || MARA;
}

export function colleagueForTopic(topic, preferredChannel) {
  const matches = STORY_CHARACTERS.filter((person) => person.id !== 'sam' && person.topics.includes(topic) && (!preferredChannel || person.channel === preferredChannel));
  const pool = matches.length ? matches : STORY_CHARACTERS.filter((person) => person.id !== 'sam' && (!preferredChannel || person.channel === preferredChannel));
  return pool[Math.floor(Math.random() * pool.length)] || MARA;
}

// ============================================================================
// Generated Account / Username Pool
//
// Used only for procedural mission usernames. These people are NOT story NPCs.
// ============================================================================

export const ACCOUNT_NAME_POOL = [
  { firstName: 'Nina', lastName: 'Berger', username: 'nberger' },
  { firstName: 'Tom', lastName: 'Weiß', username: 'tweiss' },
  { firstName: 'Julia', lastName: 'Krause', username: 'jkrause' },
  { firstName: 'Marco', lastName: 'Feldt', username: 'mfeldt' },
  { firstName: 'Lisa', lastName: 'Schmidt', username: 'lschmidt' },
  { firstName: 'Felix', lastName: 'Hoffmann', username: 'fhoffmann' },
  { firstName: 'Sarah', lastName: 'Mueller', username: 'smueller' },
  { firstName: 'Lukas', lastName: 'Braun', username: 'lbraun' },
  { firstName: 'Emily', lastName: 'Fischer', username: 'efischer' },
  { firstName: 'Jonas', lastName: 'Schneider', username: 'jschneider' },
  { firstName: 'Anna', lastName: 'Klein', username: 'aklein' },
  { firstName: 'Max', lastName: 'Lang', username: 'mlang' },
  { firstName: 'Sophie', lastName: 'Wolf', username: 'swolf' },
  { firstName: 'Paul', lastName: 'Huber', username: 'phuber' },
  { firstName: 'Marie', lastName: 'Becker', username: 'mbecker' },
  { firstName: 'Tim', lastName: 'Frank', username: 'tfrank' },
  { firstName: 'Lena', lastName: 'Keller', username: 'lkeller' },
  { firstName: 'Noah', lastName: 'Koch', username: 'nkoch' },
  { firstName: 'Hannah', lastName: 'Bauer', username: 'hbauer' },
  { firstName: 'Ben', lastName: 'Richter', username: 'brichter' },
  { firstName: 'Laura', lastName: 'Schulz', username: 'lschulz' },
  { firstName: 'Leon', lastName: 'Maier', username: 'lmaier' },
  { firstName: 'Mia', lastName: 'Lehmann', username: 'mlehmann' },
  { firstName: 'Finn', lastName: 'Neumann', username: 'fneumann' },
  { firstName: 'Clara', lastName: 'Schwarz', username: 'cschwarz' },
  { firstName: 'Elias', lastName: 'Zimmermann', username: 'ezimmermann' },
  { firstName: 'Nora', lastName: 'Hofmann', username: 'nhofmann' },
  { firstName: 'Henrik', lastName: 'Krüger', username: 'hkroeger' },
  { firstName: 'Zoe', lastName: 'Hartmann', username: 'zhartmann' },
  { firstName: 'Mats', lastName: 'Werner', username: 'mwerner' },
  { firstName: 'Ida', lastName: 'Schmitt', username: 'ischmitt' },
  { firstName: 'Theo', lastName: 'König', username: 'tkoenig' },
  { firstName: 'Lilly', lastName: 'Weiß', username: 'lweiss' },
  { firstName: 'Ole', lastName: 'Peters', username: 'opeters' },
  { firstName: 'Emilia', lastName: 'Jung', username: 'ejung' },
  { firstName: 'Anton', lastName: 'Fuchs', username: 'afuchs' },
  { firstName: 'Mila', lastName: 'Lang', username: 'mlang2' },
  // The core story characters can also appear as generated accounts, but they
  // are handled through the story roster above for all NPC/gameplay purposes.
  { firstName: 'Mara', lastName: 'König', username: 'mkoenig' },
  { firstName: 'David', lastName: 'Chen', username: 'dchen' },
  { firstName: 'Aylin', lastName: 'Demir', username: 'ademir' },
  { firstName: 'Thomas', lastName: 'Weber', username: 'tweber' },
];

export function randomPersonalUsername() {
  const pool = ACCOUNT_NAME_POOL.filter((p) => p.username);
  const person = pool[Math.floor(Math.random() * pool.length)] || ACCOUNT_NAME_POOL[0];
  return person.username;
}

// ============================================================================
// Voice Profiles
//
// Mapping from stable story-character id to the intended voice identity.
// `voiceName` is the primary key on the current test device; `preferredIndex`
// is a fallback hint. `lang` is the required locale.
// ============================================================================

export const CHARACTER_VOICE_PROFILES = {
  mara: { lang: 'de-DE', voiceName: 'Deutsch Stimme 1', preferredIndex: 59, genderHint: 'female' },
  david: { lang: 'de-DE', voiceName: 'Deutsch Stimme 4', preferredIndex: 64, genderHint: 'male' },
  sam: { lang: 'de-DE', voiceName: 'Deutsch Stimme 3', preferredIndex: 62, genderHint: 'male' },
  aylin: { lang: 'de-DE', voiceName: 'Deutsch Stimme 6', preferredIndex: 61, genderHint: 'female' },
  thomas: { lang: 'de-DE', voiceName: 'Deutsch Stimme 7', preferredIndex: 63, genderHint: 'male' },
};

// ============================================================================
// Company stages (unchanged)
// ============================================================================

export const companyStages = [
  { id: 1, title: 'Kleines Büro', requiredMainQuests: 0, description: '12 Arbeitsplätze, ein Switch, ein Domain Controller und ein Fileserver.' },
  { id: 2, title: 'Wachsende Abteilung', requiredMainQuests: 2, description: 'Mehr Teams, Linux-Webserver und strukturierte Berechtigungen.' },
  { id: 3, title: 'Zentrale mit Außenstelle', requiredMainQuests: 4, description: 'Standortvernetzung, Backup-System und Security Operations Center.' },
  { id: 4, title: 'Unternehmens-IT', requiredMainQuests: 7, description: 'Change Management, Monitoring und mehrere produktive Dienste.' },
];

export function companyStage(completedMainQuests) {
  return [...companyStages].reverse().find((stage) => completedMainQuests >= stage.requiredMainQuests) || companyStages[0];
}
