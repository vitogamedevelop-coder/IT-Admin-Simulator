export const colleagues = [
  // Core story characters
  { id: 'mara', firstName: 'Mara', lastName: 'König', name: 'Mara König', username: 'mkoenig', department: 'Helpdesk', role: 'Helpdesk', channel: 'phone', tone: 'direkt und freundlich', topics: ['DHCP', 'DNS', 'Berechtigungen'] },
  { id: 'david', firstName: 'David', lastName: 'Chen', name: 'David Chen', username: 'dchen', department: 'Entwicklung', role: 'Entwicklung', channel: 'mail', tone: 'technisch neugierig', topics: ['DNS', 'Datenbanken', 'Automatisierung'] },
  { id: 'lea', firstName: 'Lea', lastName: 'Novak', name: 'Lea Novak', username: 'lnovak', department: 'Security Operations', role: 'Security Operations', channel: 'monitor', tone: 'präzise und ruhig', topics: ['IT-Sicherheit', 'Monitoring', 'Backup'] },
  { id: 'thomas', firstName: 'Thomas', lastName: 'Weber', name: 'Thomas Weber', username: 'tweber', department: 'Geschäftsführung', role: 'Geschäftsführung', channel: 'mail', tone: 'fragt nach Risiko und Auswirkung', topics: ['Backup', 'Change Management', 'Infrastruktur'] },
  { id: 'sam', firstName: 'Sam', lastName: 'Richter', name: 'Sam Richter', username: 'sritter', department: 'Netzwerk', role: 'Senior-Administrator', channel: 'phone', tone: 'hilfreich, aber fordert Begründungen', topics: ['Netzwerk', 'Active Directory', 'Linux'] },
  { id: 'aylin', firstName: 'Aylin', lastName: 'Demir', name: 'Aylin Demir', username: 'ademir', department: 'Personalabteilung', role: 'Personalabteilung', channel: 'phone', tone: 'praxisorientiert', topics: ['Berechtigungen', 'Active Directory', 'IT-Sicherheit'] },
  // Expanded employee registry for missions / accounts / conversations
  { id: 'nina', firstName: 'Nina', lastName: 'Berger', name: 'Nina Berger', username: 'nberger', department: 'Vertrieb', role: 'Vertriebsmitarbeiterin', channel: 'mail', tone: 'ergebnisorientiert', topics: ['VPN', 'Mail', 'Berechtigungen'] },
  { id: 'tom', firstName: 'Tom', lastName: 'Weiß', name: 'Tom Weiß', username: 'tweiss', department: 'Buchhaltung', role: 'Buchhalter', channel: 'mail', tone: 'sachlich', topics: ['Backup', 'Berechtigungen', 'Drucker'] },
  { id: 'julia', firstName: 'Julia', lastName: 'Krause', name: 'Julia Krause', username: 'jkrause', department: 'Marketing', role: 'Marketing-Managerin', channel: 'mail', tone: 'kreativ', topics: ['DNS', 'Web', 'Mail'] },
  { id: 'marco', firstName: 'Marco', lastName: 'Feldt', name: 'Marco Feldt', username: 'mfeldt', department: 'Lager', role: 'Lagermitarbeiter', channel: 'phone', tone: 'direkt', topics: ['WLAN', 'Barcode', 'Drucker'] },
  { id: 'lisa', firstName: 'Lisa', lastName: 'Schmidt', name: 'Lisa Schmidt', username: 'lschmidt', department: 'Personal', role: 'Personalsachbearbeiterin', channel: 'mail', tone: 'freundlich', topics: ['Berechtigungen', 'Active Directory', 'Backup'] },
  { id: 'felix', firstName: 'Felix', lastName: 'Hoffmann', name: 'Felix Hoffmann', username: 'fhoffmann', department: 'Entwicklung', role: 'Entwickler', channel: 'mail', tone: 'technisch', topics: ['DNS', 'Datenbanken', 'Automatisierung'] },
  { id: 'sarah', firstName: 'Sarah', lastName: 'Mueller', name: 'Sarah Mueller', username: 'smueller', department: 'Vertrieb', role: 'Key-Account-Managerin', channel: 'phone', tone: 'zielstrebig', topics: ['VPN', 'Mail', 'IT-Sicherheit'] },
  { id: 'lukas', firstName: 'Lukas', lastName: 'Braun', name: 'Lukas Braun', username: 'lbraun', department: 'Buchhaltung', role: 'Buchhalter', channel: 'mail', tone: 'genau', topics: ['Backup', 'Drucker', 'Berechtigungen'] },
  { id: 'emily', firstName: 'Emily', lastName: 'Fischer', name: 'Emily Fischer', username: 'efischer', department: 'Marketing', role: 'Content-Managerin', channel: 'mail', tone: 'kommunikativ', topics: ['Web', 'DNS', 'Mail'] },
  { id: 'jonas', firstName: 'Jonas', lastName: 'Schneider', name: 'Jonas Schneider', username: 'jschneider', department: 'Lager', role: 'Teamleiter', channel: 'phone', tone: 'pragmatisch', topics: ['WLAN', 'Drucker', 'Monitoring'] },
  { id: 'anna', firstName: 'Anna', lastName: 'Klein', name: 'Anna Klein', username: 'aklein', department: 'Personal', role: 'Recruiterin', channel: 'mail', tone: 'freundlich', topics: ['Berechtigungen', 'Active Directory'] },
  { id: 'max', firstName: 'Max', lastName: 'Lang', name: 'Max Lang', username: 'mlang', department: 'Entwicklung', role: 'DevOps-Engineer', channel: 'mail', tone: 'analytisch', topics: ['Automatisierung', 'Linux', 'Monitoring'] },
  { id: 'sophie', firstName: 'Sophie', lastName: 'Wolf', name: 'Sophie Wolf', username: 'swolf', department: 'Vertrieb', role: 'Inside-Sales', channel: 'phone', tone: 'geduldig', topics: ['Mail', 'VPN', 'Berechtigungen'] },
  { id: 'paul', firstName: 'Paul', lastName: 'Huber', name: 'Paul Huber', username: 'phuber', department: 'Buchhaltung', role: 'Finanzbuchhalter', channel: 'mail', tone: 'genau', topics: ['Backup', 'Berechtigungen', 'Drucker'] },
  { id: 'marie', firstName: 'Marie', lastName: 'Becker', name: 'Marie Becker', username: 'mbecker', department: 'Marketing', role: 'Campaign-Managerin', channel: 'mail', tone: 'kreativ', topics: ['Web', 'DNS', 'Mail'] },
  { id: 'tim', firstName: 'Tim', lastName: 'Frank', name: 'Tim Frank', username: 'tfrank', department: 'Lager', role: 'Lagerist', channel: 'phone', tone: 'direkt', topics: ['WLAN', 'Barcode', 'Drucker'] },
  { id: 'lena', firstName: 'Lena', lastName: 'Keller', name: 'Lena Keller', username: 'lkeller', department: 'Personal', role: 'HR-Generalistin', channel: 'mail', tone: 'freundlich', topics: ['Berechtigungen', 'Active Directory', 'Backup'] },
  { id: 'noah', firstName: 'Noah', lastName: 'Koch', name: 'Noah Koch', username: 'nkoch', department: 'Entwicklung', role: 'Backend-Entwickler', channel: 'mail', tone: 'technisch', topics: ['Datenbanken', 'Linux', 'Automatisierung'] },
  { id: 'hannah', firstName: 'Hannah', lastName: 'Bauer', name: 'Hannah Bauer', username: 'hbauer', department: 'Vertrieb', role: 'Sales-Managerin', channel: 'phone', tone: 'zielstrebig', topics: ['VPN', 'Mail', 'IT-Sicherheit'] },
  { id: 'ben', firstName: 'Ben', lastName: 'Richter', name: 'Ben Richter', username: 'brichter', department: 'Buchhaltung', role: 'Bilanzbuchhalter', channel: 'mail', tone: 'sachlich', topics: ['Backup', 'Drucker', 'Berechtigungen'] },
  { id: 'laura', firstName: 'Laura', lastName: 'Schulz', name: 'Laura Schulz', username: 'lschulz', department: 'Marketing', role: 'SEO-Managerin', channel: 'mail', tone: 'kommunikativ', topics: ['Web', 'DNS', 'Mail'] },
  { id: 'leon', firstName: 'Leon', lastName: 'Maier', name: 'Leon Maier', username: 'lmaier', department: 'Lager', role: 'Kommissionierer', channel: 'phone', tone: 'pragmatisch', topics: ['WLAN', 'Barcode', 'Drucker'] },
  { id: 'mia', firstName: 'Mia', lastName: 'Lehmann', name: 'Mia Lehmann', username: 'mlehmann', department: 'Personal', role: 'Personalleiterin', channel: 'mail', tone: 'freundlich', topics: ['Berechtigungen', 'Active Directory'] },
  { id: 'finn', firstName: 'Finn', lastName: 'Neumann', name: 'Finn Neumann', username: 'fneumann', department: 'Entwicklung', role: 'Frontend-Entwickler', channel: 'mail', tone: 'analytisch', topics: ['Web', 'DNS', 'Automatisierung'] },
  { id: 'clara', firstName: 'Clara', lastName: 'Schwarz', name: 'Clara Schwarz', username: 'cschwarz', department: 'Vertrieb', role: 'Kundenberaterin', channel: 'phone', tone: 'geduldig', topics: ['Mail', 'VPN'] },
  { id: 'eli', firstName: 'Elias', lastName: 'Zimmermann', name: 'Elias Zimmermann', username: 'ezimmermann', department: 'Buchhaltung', role: 'Buchhaltungs-Azubi', channel: 'mail', tone: 'lernbereit', topics: ['Backup', 'Drucker'] },
  { id: 'nora', firstName: 'Nora', lastName: 'Hofmann', name: 'Nora Hofmann', username: 'nhofmann', department: 'Marketing', role: 'Social-Media-Managerin', channel: 'mail', tone: 'kreativ', topics: ['Web', 'Mail'] },
  { id: 'henrik', firstName: 'Henrik', lastName: 'Krüger', name: 'Henrik Krüger', username: 'hkroeger', department: 'Lager', role: 'Lagermeer', channel: 'phone', tone: 'direkt', topics: ['WLAN', 'Barcode'] },
  { id: 'zoe', firstName: 'Zoe', lastName: 'Hartmann', name: 'Zoe Hartmann', username: 'zhartmann', department: 'Personal', role: 'Recruiting-Managerin', channel: 'mail', tone: 'freundlich', topics: ['Berechtigungen', 'Active Directory'] },
  { id: 'mats', firstName: 'Mats', lastName: 'Werner', name: 'Mats Werner', username: 'mwerner', department: 'Entwicklung', role: 'QA-Engineer', channel: 'mail', tone: 'technisch', topics: ['Automatisierung', 'Linux'] },
  { id: 'ida', firstName: 'Ida', lastName: 'Schmitt', name: 'Ida Schmitt', username: 'ischmitt', department: 'Vertrieb', role: 'Vertriebsassistentin', channel: 'phone', tone: 'geduldig', topics: ['Mail', 'VPN'] },
  { id: 'theo', firstName: 'Theo', lastName: 'König', name: 'Theo König', username: 'tkoenig', department: 'Buchhaltung', role: 'Controller', channel: 'mail', tone: 'genau', topics: ['Backup', 'Berechtigungen'] },
  { id: 'lilly', firstName: 'Lilly', lastName: 'Weiß', name: 'Lilly Weiß', username: 'lweiss', department: 'Marketing', role: 'Art-Director', channel: 'mail', tone: 'kreativ', topics: ['Web', 'DNS'] },
  { id: 'ole', firstName: 'Ole', lastName: 'Peters', name: 'Ole Peters', username: 'opeters', department: 'Lager', role: 'Versandmitarbeiter', channel: 'phone', tone: 'pragmatisch', topics: ['WLAN', 'Drucker'] },
  { id: 'emilia', firstName: 'Emilia', lastName: 'Jung', name: 'Emilia Jung', username: 'ejung', department: 'Personal', role: 'HR-Administratorin', channel: 'mail', tone: 'freundlich', topics: ['Berechtigungen', 'Active Directory', 'Backup'] },
  { id: 'anton', firstName: 'Anton', lastName: 'Fuchs', name: 'Anton Fuchs', username: 'afuchs', department: 'Entwicklung', role: 'Systemadministrator', channel: 'mail', tone: 'analytisch', topics: ['Linux', 'Monitoring', 'Automatisierung'] },
  { id: 'mila', firstName: 'Mila', lastName: 'Lang', name: 'Mila Lang', username: 'mlang2', department: 'Vertrieb', role: 'Account-Managerin', channel: 'phone', tone: 'zielstrebig', topics: ['VPN', 'Mail'] },
];

// Preferred voice profiles for spoken NPC dialogs. The numeric index is a
// hint for the current Android test device; the matcher primarily looks for
// a concrete voice identity (URI/name/lang) and only falls back to the index.
export const CHARACTER_VOICE_PROFILES = {
  mara: { lang: 'de-DE', preferredIndex: 59, genderHint: 'female' },
  david: { lang: 'de-DE', preferredIndex: 64, genderHint: 'male' },
  sam: { lang: 'de-DE', preferredIndex: 62, genderHint: 'male' },
  aylin: { lang: 'de-DE', preferredIndex: 61, genderHint: 'female' },
  thomas: { lang: 'de-DE', preferredIndex: 63, genderHint: 'male' },
};

export function colleagueById(id) {
  return colleagues.find((c) => c.id === id) || null;
}

export function randomEmployee() {
  const pool = colleagues.filter((c) => c.id !== 'sam');
  return pool[Math.floor(Math.random() * pool.length)] || colleagues[0];
}

export function randomPersonalUsername() {
  const pool = colleagues.filter((c) => c.id !== 'sam' && c.username);
  const person = pool[Math.floor(Math.random() * pool.length)] || colleagues[0];
  return person.username;
}

export function colleagueForTopic(topic, preferredChannel) {
  const matches = colleagues.filter((person) => person.topics.includes(topic) && (!preferredChannel || person.channel === preferredChannel));
  const pool = matches.length ? matches : colleagues.filter((person) => !preferredChannel || person.channel === preferredChannel);
  return pool[Math.floor(Math.random() * pool.length)] || colleagues[0];
}

export const companyStages = [
  { id: 1, title: 'Kleines Büro', requiredMainQuests: 0, description: '12 Arbeitsplätze, ein Switch, ein Domain Controller und ein Fileserver.' },
  { id: 2, title: 'Wachsende Abteilung', requiredMainQuests: 2, description: 'Mehr Teams, Linux-Webserver und strukturierte Berechtigungen.' },
  { id: 3, title: 'Zentrale mit Außenstelle', requiredMainQuests: 4, description: 'Standortvernetzung, Backup-System und Security Operations Center.' },
  { id: 4, title: 'Unternehmens-IT', requiredMainQuests: 7, description: 'Change Management, Monitoring und mehrere produktive Dienste.' },
];

export function companyStage(completedMainQuests) {
  return [...companyStages].reverse().find((stage) => completedMainQuests >= stage.requiredMainQuests) || companyStages[0];
}
