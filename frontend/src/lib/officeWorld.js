export const colleagues = [
  { id: 'mara', name: 'Mara König', role: 'Helpdesk', channel: 'phone', tone: 'direkt und freundlich', topics: ['DHCP', 'DNS', 'Berechtigungen'] },
  { id: 'david', name: 'David Chen', role: 'Entwicklung', channel: 'mail', tone: 'technisch neugierig', topics: ['DNS', 'Datenbanken', 'Automatisierung'] },
  { id: 'lea', name: 'Lea Novak', role: 'Security Operations', channel: 'monitor', tone: 'präzise und ruhig', topics: ['IT-Sicherheit', 'Monitoring', 'Backup'] },
  { id: 'weber', name: 'Thomas Weber', role: 'Geschäftsführung', channel: 'mail', tone: 'fragt nach Risiko und Auswirkung', topics: ['Backup', 'Change Management', 'Infrastruktur'] },
  { id: 'sam', name: 'Sam Richter', role: 'Senior-Administrator', channel: 'phone', tone: 'hilfreich, aber fordert Begründungen', topics: ['Netzwerk', 'Active Directory', 'Linux'] },
  { id: 'aylin', name: 'Aylin Demir', role: 'Personalabteilung', channel: 'phone', tone: 'praxisorientiert', topics: ['Berechtigungen', 'Active Directory', 'IT-Sicherheit'] },
];

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
