export const commandHelp = {
  ipconfig: 'Zeigt die aktuelle IPv4-Konfiguration an. ipconfig /all zeigt zusätzlich MAC, DHCP und DNS.',
  ping: 'Prüft mit ICMP, ob ein Ziel erreichbar ist. Beispiel: ping 192.168.10.1',
  tracert: 'Zeigt den Netzwerkpfad zu einem Ziel. Beispiel: tracert 8.8.8.8',
  nslookup: 'Fragt DNS nach einer Namensauflösung. Beispiel: nslookup fs01.nexus.local',
  netstat: 'Zeigt aktive Verbindungen und Ports. Beispiel: netstat -an',
  hostname: 'Gibt den Computernamen zurück.',
  help: 'Zeigt diese Hilfe an.',
};

function parseArgs(input) {
  return input.trim().split(/\s+/).filter(Boolean);
}

function renderIpconfig(scenario, all = false) {
  return scenario.adapters.map((adapter) => {
    const lines = [
      `${adapter.name}:`,
      `   Verbindungsspezifisches DNS-Suffix: . :`,
      `   IPv4-Adresse . . . . . . . . . . : ${adapter.ipv4}`,
      `   Subnetzmaske  . . . . . . . . . . : ${adapter.mask}`,
    ];
    if (all) {
      lines.push(
        `   Physische Adresse . . . . . . . . : ${adapter.mac}`,
        `   DHCP aktiviert . . . . . . . . . : ${adapter.dhcp}`,
      );
      if (adapter.gateway) lines.push(`   Standardgateway . . . . . . . . . : ${adapter.gateway}`);
      if (adapter.dns.length) lines.push(`   DNS-Server . . . . . . . . . . . : ${adapter.dns.join('\n                                          ')}`);
    } else if (adapter.gateway) {
      lines.push(`   Standardgateway . . . . . . . . . : ${adapter.gateway}`);
    }
    return lines.join('\n');
  }).join('\n\n');
}

export function executeCommand(input, scenario) {
  const args = parseArgs(input.toLowerCase());
  const command = args[0];
  const target = args[1] || '';

  switch (command) {
    case 'help':
      return Object.entries(commandHelp).map(([name, text]) => `${name.padEnd(10)} - ${text}`).join('\n');
    case 'hostname':
      return scenario.hostname;
    case 'ipconfig':
      return renderIpconfig(scenario, args.includes('/all'));
    case 'ping':
      if (!target) return 'Syntax: ping <Ziel>';
      if (target === '127.0.0.1') return 'Antwort von 127.0.0.1: Bytes=32 Zeit<1ms TTL=128\nPakete: Gesendet = 4, Empfangen = 4, Verloren = 0 (0% Verlust)';
      if (scenario.reachability[target] === true) return `Antwort von ${target}: Bytes=32 Zeit=1ms TTL=64\nPakete: Gesendet = 4, Empfangen = 4, Verloren = 0`;
      if (scenario.reachability[target] === false) return `Zeitüberschreitung der Anforderung an ${target}.\nPakete: Gesendet = 4, Empfangen = 0, Verloren = 4 (100% Verlust)`;
      return `Ping wird ausgeführt für ${target} [${target}]\nZeitüberschreitung der Anforderung.`;
    case 'nslookup':
      if (!target) return 'Standardserver:  UnKnown\nAddress:  127.0.0.1';
      if (scenario.dnsRecords[target]) {
        return `Server:  ${scenario.adapters[0]?.dns[0] || 'UnKnown'}\nAddress:  ${scenario.adapters[0]?.dns[0] || '127.0.0.1'}\n\nName:    ${target}\nAddress:  ${scenario.dnsRecords[target]}`;
      }
      return `Server:  ${scenario.adapters[0]?.dns[0] || 'UnKnown'}\nAddress:  ${scenario.adapters[0]?.dns[0] || '127.0.0.1'}\n\n*** ${target} kann nicht gefunden werden: Non-existent domain`;
    case 'tracert':
      if (!target) return 'Syntax: tracert <Ziel>';
      if (scenario.reachability[target] === true) return ` 1     1 ms     1 ms     1 ms  ${scenario.adapters[0]?.gateway || '192.168.10.1'}\n 2     2 ms     2 ms     2 ms  ${target}\nAblaufverfolgung beendet.`;
      return ` 1     *        *        *     Zeitüberschreitung\nAblaufverfolgung konnte das Ziel nicht erreichen.`;
    case 'netstat':
      return '  Proto  Lokale Adresse         Remoteadresse          Status\n  TCP    0.0.0.0:135              0.0.0.0:0              ABHÖREN\n  TCP    0.0.0.0:445              0.0.0.0:0              ABHÖREN\n  TCP    127.0.0.1:5037           0.0.0.0:0              ABHÖREN';
    default:
      return `Der Befehl "${command}" ist nicht verfügbar. Tippe "help" für eine Liste der Befehle.`;
  }
}
