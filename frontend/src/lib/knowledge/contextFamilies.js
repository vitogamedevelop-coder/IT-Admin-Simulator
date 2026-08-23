// Context families group concept clusters into coarse thematic buckets so the
// conversation engine can reuse basic knowledge in believable cross-topic work
// situations (e.g. a TCP/UDP question that references port 443 at a firewall).

const CONTEXT_FAMILIES = {
  binary: { name: 'Binary', lore: ['Bei der Recherche zu IP-Adressen und Netzmasken bin ich immer wieder über diese Bitwerte gestolpert.', 'Ich habe gerade bei einer Subnetz-Maske geschaut und mir wird klar, dass ich die Bit-Stellen nicht richtig lese.'] },
  tcpudp: { name: 'TCP/UDP', lore: ['Ich habe gerade an der Firewall eine Regel für 443/TCP gesehen und mich gefragt, was das eigentlich bedeutet.', 'Ein Kollege sagte, SSH läuft über TCP-Port 22, aber ich blicke nicht ganz durch, was das für die Übertragung bedeutet.', 'Bei der Fehlersuche ist mir aufgefallen, dass einige Dienste UDP verwenden, andere aber TCP.'] },
  osi: { name: 'OSI', lore: ['Wir haben gerade über TCP/IP gesprochen, und ich versuche das auf die Schichten des OSI-Modells zu mappen.', 'Ein Ticket beschreibt einen Fehler auf "Schicht 3" – ich will sicher sein, was das in unserem Netz bedeutet.'] },
  ipv4: { name: 'IPv4', lore: ['Ein neuer Mitarbeiter hat eine IP-Adresse bekommen, die irgendwie nicht ins Subnetz passt.', 'Ich sehe gerade in der ARP-Tabelle etwas, das ich mit der IP-Adresse in Verbindung bringen will.'] },
  subnetting: { name: 'Subnetting', lore: ['Wir bekommen einen neuen Raum und ich soll die VLANs und IP-Bereiche sinnvoll abstimmen.', 'Ich habe gerade eine Netz-ID berechnet und will sicherstellen, dass der Broadcast auch stimmt.'] },
  switching: { name: 'Switching', lore: ['Im Serverraum flackert ein Port – ich soll prüfen, ob der Switch den richtigen Eintrag in der MAC-Tabelle hat.', 'Ein Port soll ins richtige VLAN, aber ich weiß nicht, ob es ein Access- oder Trunk-Port sein muss.'] },
  vlanCli: { name: 'Cisco VLAN', lore: ['Auf dem Switch muss ich ein neues VLAN anlegen und Ports zuweisen.', 'Ich prüfe gerade die VLAN-Datenbank und will sicher sein, wie wir die ID-Ranges nutzen.'] },
  dns: { name: 'DNS', lore: ['Ein Benutzer kann eine Seite nicht erreichen, obwohl die IP stimmt. Ich vermute ein DNS-Problem.', 'Ich habe gerade in Wireshark gesehen, dass DNS sowohl UDP als auch TCP nutzen kann, je nach Situation.'] },
  dhcp: { name: 'DHCP', lore: ['Ein Gerät bekommt keine IP. Ich vermute ein DHCP-Problem im VLAN.', 'Ich lese gerade, wie Broadcasts im VLAN funktionieren, weil DHCP das braucht.'] },
  routing: { name: 'Routing', lore: ['Ein Rechner im anderen VLAN kommt nicht ins Netz – ich vermute ein Default-Gateway-Problem.', 'Ich habe gerade die Routing-Tabelle geprüft und frage mich, wie statisch vs. dynamisch aussieht.'] },
  basicConfig: { name: 'Cisco Basic', lore: ['Bei der Grundkonfiguration eines neuen Geräts bin ich unsicher, in welcher Reihenfolge ich vorgehen soll.', 'Ich will das Konfigurations-Verfahren sicher beherrschen, bevor ich die Schnittstellen anfasse.'] },
  ssh: { name: 'SSH', lore: ['Wir richten gerade den Fernzugriff ein und ich will sicherstellen, dass wir SSH richtig absichern.', 'Jemand fragte, warum TCP-Port 22 wichtig ist, wenn man sich per SSH verbindet.'] },
  cisco: { name: 'Cisco', lore: ['Ich stehe gerade vor einem Cisco-Gerät und bin mir bei einem Befehl nicht ganz sicher.', 'Beim Packet Tracer ist mir eine CLI-Ausgabe aufgefallen, die ich zuordnen will.'] },
  default: { name: 'Netzwerk', lore: ['Kannst du mir kurz bei etwas helfen?', 'Ich bin mir bei einer Sache gerade nicht sicher.'] },
};

const CONTEXT_FAMILY_RELATIONSHIPS = {
  binary: ['ipv4', 'subnetting'],
  tcpudp: ['dns', 'dhcp', 'ssh', 'ipv4'],
  osi: ['tcpudp', 'ipv4', 'switching', 'subnetting'],
  ipv4: ['subnetting', 'switching', 'tcpudp'],
  subnetting: ['ipv4', 'switching', 'tcpudp'],
  switching: ['vlanCli', 'ipv4', 'subnetting', 'cisco'],
  vlanCli: ['switching', 'cisco', 'subnetting'],
  dns: ['tcpudp', 'dhcp'],
  dhcp: ['dns', 'tcpudp', 'subnetting'],
  routing: ['ipv4', 'subnetting', 'cisco'],
  basicConfig: ['ssh', 'cisco'],
  ssh: ['tcpudp', 'basicConfig', 'cisco'],
  cisco: ['basicConfig', 'ssh', 'switching', 'vlanCli'],
  default: [],
};

export function getContextFamily(item) {
  const c = item?.conceptCluster || '';
  const t = item?.topicKey || '';
  if (c.startsWith('binary')) return 'binary';
  if (c.startsWith('tcpudp')) return 'tcpudp';
  if (c.startsWith('osi')) return 'osi';
  if (c.startsWith('ipv4')) return 'ipv4';
  if (c.startsWith('subnetting') || t.includes('subnetting')) return 'subnetting';
  if (c.startsWith('switching')) return 'switching';
  if (c.startsWith('vlanCli')) return 'vlanCli';
  if (c.startsWith('dns')) return 'dns';
  if (c.startsWith('dhcp')) return 'dhcp';
  if (c.startsWith('routing')) return 'routing';
  if (c.startsWith('basicConfig')) return 'basicConfig';
  if (c.startsWith('ssh')) return 'ssh';
  if (c.startsWith('cisco')) return 'cisco';
  if (t.startsWith('cisco-packet-tracer')) return 'cisco';
  return 'default';
}

export function getRelatedContextFamilies(family) {
  return CONTEXT_FAMILY_RELATIONSHIPS[family] || [];
}

export function getLoreLeadIn(item, rng) {
  if (!rng) return '';
  const family = getContextFamily(item);
  const entries = CONTEXT_FAMILIES[family] || CONTEXT_FAMILIES.default;
  const lore = entries.lore || [];
  if (lore.length === 0) return '';
  const idx = Math.floor(rng.next() * lore.length);
  return lore[idx];
}

export function getFamilyName(item) {
  const family = getContextFamily(item);
  return (CONTEXT_FAMILIES[family] || CONTEXT_FAMILIES.default).name;
}

export function getRelatedTopicKeys(item) {
  return Array.isArray(item?.relatedTopicKeys) ? item.relatedTopicKeys : [];
}
