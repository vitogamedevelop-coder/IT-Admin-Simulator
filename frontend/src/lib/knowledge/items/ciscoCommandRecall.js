// =============================================================================
// Knowledge Items – Cisco IOS Command Recall
//
// Derived layer for systematic command recall in multiple-choice form.
// Sources: Cisco lesson CLI content (cisco-packet-tracer/*).
// One item per exam-relevant command/idiom, not every syntax variant.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

const CMD = (topicId, clusterSuffix, fields) => ({
  id: `ciscoCmd.${clusterSuffix}`,
  topicKey: topicKey('cisco-packet-tracer', topicId),
  sourceTopicKey: topicKey('cisco-packet-tracer', topicId),
  sourceSection: 'command-recall',
  conceptCluster: `cisco.command.${clusterSuffix}`,
  type: KNOWLEDGE_TYPES.PROPERTY,
  difficulty: DIFFICULTY.EASY,
  allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SCENARIO],
  roleHints: ['technical'],
  data: fields,
  siblings: [],
});

export const ciscoCommandRecallKnowledgeItems = [
  // Basic IOS navigation
  CMD('grundlagen', 'enable', {
    command: 'enable',
    purpose: 'wechselt vom User-EXEC in den Privileged-EXEC-Modus',
    context: 'Du bist im Benutzermodus eines Cisco-Geräts und brauchst erweiterte Rechte.',
    parameter: null,
    example: 'enable',
    distractorCommands: ['disable', 'logout', 'configure terminal'],
    distractorPurposes: [
      'kehrt aus dem Privileged-EXEC-Modus zurück',
      'beendet die Konsolensitzung',
      'wechselt in den globalen Konfigurationsmodus',
    ],
  }),
  CMD('grundlagen', 'configureTerminal', {
    command: 'configure terminal',
    purpose: 'wechselt in den globalen Konfigurationsmodus',
    context: 'Du willst globale Einstellungen oder Schnittstellen konfigurieren.',
    parameter: null,
    example: 'configure terminal',
    distractorCommands: ['enable', 'interface gi0/0', 'show running-config'],
    distractorPurposes: [
      'zeigt die aktuelle Konfiguration an',
      'wechselt in die Schnittstellenkonfiguration',
      'schaltet erweiterte Rechte frei',
    ],
  }),
  CMD('grundlagen', 'hostname', {
    command: 'hostname <NAME>',
    purpose: 'gibt dem Gerät einen Namen',
    context: 'Im globalen Konfigurationsmodus soll das Gerät erkennbar benannt werden.',
    parameter: 'Name des Geräts',
    example: 'hostname SW-IT-01',
    distractorCommands: ['banner motd', 'enable secret', 'ip domain-name'],
    distractorPurposes: [
      'setzt das Passwort für den privilegierten Modus',
      'definiert den DNS-Domänennamen',
      'zeigt eine Login-Meldung an',
    ],
  }),
  CMD('grundlagen', 'copyRunStart', {
    command: 'copy running-config startup-config',
    purpose: 'speichert die aktuelle Konfiguration dauerhaft im NVRAM',
    context: 'Nach Konfigurationsänderungen sollen diese einen Neustart überleben.',
    parameter: null,
    example: 'copy running-config startup-config',
    distractorCommands: ['write erase', 'reload', 'show startup-config'],
    distractorPurposes: [
      'löscht die gesamte Konfiguration',
      'startet das Gerät neu',
      'zeigt die Startkonfiguration an',
    ],
  }),

  // Interface IP basics
  CMD('basic-device-configuration', 'interface', {
    command: 'interface <INTERFACE>',
    purpose: 'wechselt in die Konfiguration einer bestimmten Schnittstelle',
    context: 'Du befindest dich im globalen Konfigurationsmodus und willst ein Interface bearbeiten.',
    parameter: 'Schnittstellenkennung, z. B. GigabitEthernet0/1',
    example: 'interface GigabitEthernet0/1',
    distractorCommands: ['interface range', 'ip address', 'no shutdown'],
    distractorPurposes: [
      'konfiguriert eine IP-Adresse auf der Schnittstelle',
      'aktiviert eine heruntergefahrene Schnittstelle',
      'konfiguriert mehrere Interfaces gleichzeitig',
    ],
  }),
  CMD('basic-device-configuration', 'ipAddress', {
    command: 'ip address <IP> <MASK>',
    purpose: 'weist einer Layer-3-Schnittstelle eine IPv4-Adresse und Subnetzmaske zu',
    context: 'Auf einem Router-Interface oder einer SVI soll das Gerät im Netz erreichbar sein.',
    parameter: 'IPv4-Adresse und Subnetzmaske',
    example: 'ip address 192.168.10.1 255.255.255.0',
    distractorCommands: ['ip route', 'ip default-gateway', 'switchport access vlan'],
    distractorPurposes: [
      'legt eine statische Route fest',
      'weist einem Switch das Management-Gateway zu',
      'weist einem Access-Port ein VLAN zu',
    ],
  }),
  CMD('basic-device-configuration', 'noShutdown', {
    command: 'no shutdown',
    purpose: 'aktiviert eine administrativ deaktivierte Schnittstelle',
    context: 'Eine Schnittstelle wurde konfiguriert, ist aber im Status administratively down.',
    parameter: null,
    example: 'no shutdown',
    distractorCommands: ['shutdown', 'interface up', 'ip routing'],
    distractorPurposes: [
      'deaktiviert die Schnittstelle',
      'schaltet Layer-3-Routing global ein',
      'ist kein gültiger Cisco-Befehl',
    ],
  }),
  CMD('basic-device-configuration', 'description', {
    command: 'description <TEXT>',
    purpose: 'hinterlässt einen Kommentar für eine Schnittstelle',
    context: 'Damit die Dokumentation stimmt, soll ein Interface mit einem Hinweis versehen werden.',
    parameter: 'Beschreibungstext',
    example: 'description Uplink-CORE',
    distractorCommands: ['hostname', 'banner motd', 'cdp run'],
    distractorPurposes: [
      'benennt das Gerät um',
      'zeigt eine Nachricht beim Login an',
      'aktiviert Cisco Discovery Protocol',
    ],
  }),

  // Console / local user / SSH basics
  CMD('basic-device-configuration', 'lineConsole', {
    command: 'line console 0',
    purpose: 'wechselt in die Konfiguration der Konsolenleitung',
    context: 'Du willst den lokalen Konsolenzugang absichern.',
    parameter: null,
    example: 'line console 0',
    distractorCommands: ['line vty 0 15', 'interface console 0', 'login local'],
    distractorPurposes: [
      'wechselt in die Konfiguration virtueller Terminal-Leitungen',
      'wechselt in eine Schnittstelle',
      'aktiviert die lokale Benutzerdatenbank',
    ],
  }),
  CMD('basic-device-configuration', 'password', {
    command: 'password <PASSWORD>',
    purpose: 'setzt ein Passwort für die aktuelle Line',
    context: 'Innerhalb einer Line-Konfiguration soll ein einfaches Line-Passwort vergeben werden.',
    parameter: 'Klartext-Passwort',
    example: 'password cisco',
    distractorCommands: ['enable secret', 'username admin secret', 'login local'],
    distractorPurposes: [
      'setzt ein verschlüsseltes Privileged-Passwort',
      'legt einen lokalen Benutzer an',
      'zwingt zur Prüfung gegen die lokale Benutzerdatenbank',
    ],
  }),
  CMD('basic-device-configuration', 'login', {
    command: 'login',
    purpose: 'prüft bei der Anmeldung an einer Line gegen das konfigurierte Line-Passwort',
    context: 'Auf der Konsole wurde ein Passwort mit "password" gesetzt; nun soll es geprüft werden.',
    parameter: null,
    example: 'login',
    distractorCommands: ['login local', 'password cisco', 'transport input ssh'],
    distractorPurposes: [
      'prüft gegen die lokale Benutzerdatenbank',
      'setzt das Line-Passwort',
      'beschränkt den Remote-Zugang auf SSH',
    ],
  }),
  CMD('basic-device-configuration', 'enableSecret', {
    command: 'enable secret <PASSWORD>',
    purpose: 'setzt ein sicher gehashtes Passwort für den privilegierten Modus',
    context: 'Das Privileged-EXEC-Passwort soll im Gegensatz zu "enable password" stärker geschützt gespeichert werden.',
    parameter: 'Passwort',
    example: 'enable secret SecurePass123!',
    distractorCommands: ['enable password', 'service password-encryption', 'username admin secret'],
    distractorPurposes: [
      'verschleiert Passwörter im laufenden Konfigurationstext',
      'legt einen lokalen Benutzer mit Secret an',
      'setzt ein Klartext-Privileged-Passwort',
    ],
  }),
  CMD('basic-device-configuration', 'servicePasswordEncryption', {
    command: 'service password-encryption',
    purpose: 'verschleiert Klartext-Passwörter in der Konfiguration (Type 7)',
    context: 'Line-Passwörter sollen im Startup- bzw. Running-Config nicht mehr im Klartext stehen.',
    parameter: null,
    example: 'service password-encryption',
    distractorCommands: ['enable secret', 'username admin secret', 'crypto key generate rsa'],
    distractorPurposes: [
      'setzt ein stark gehashtes Privileged-Passwort',
      'legt einen lokalen Benutzer an',
      'erzeugt RSA-Schlüssel für SSH',
    ],
  }),
  CMD('basic-device-configuration', 'usernameSecret', {
    command: 'username <NAME> secret <PASSWORD>',
    purpose: 'legt einen lokalen Benutzer mit gehashtem Secret an',
    context: 'Für SSH-Zugriff sollen Benutzer lokal auf dem Gerät hinterlegt werden.',
    parameter: 'Benutzername und Passwort',
    example: 'username admin secret SecurePass123!',
    distractorCommands: ['password cisco', 'enable secret', 'login'],
    distractorPurposes: [
      'setzt ein Line-Passwort',
      'setzt das Privileged-Passwort',
      'prüft das Line-Passwort',
    ],
  }),

  // SSH
  CMD('ssh', 'ipDomainName', {
    command: 'ip domain-name <DOMAIN>',
    purpose: 'setzt den DNS-Domänennamen des Geräts (Voraussetzung für RSA-Schlüsselerzeugung)',
    context: 'Bevor SSH-Schlüssel generiert werden, braucht das Gerät einen Domain-Namen.',
    parameter: 'Domänenname',
    example: 'ip domain-name it-lernen.local',
    distractorCommands: ['hostname', 'ip name-server', 'crypto key generate rsa'],
    distractorPurposes: [
      'gibt dem Gerät einen einfachen Namen',
      'erzeugt die RSA-Schlüssel',
      'konfiguriert einen DNS-Server',
    ],
  }),
  CMD('ssh', 'cryptoKeyGenerateRsa', {
    command: 'crypto key generate rsa',
    purpose: 'erzeugt die RSA-Schlüssel, die für SSHv2 benötigt werden',
    context: 'Das Gerät soll SSH-fähig gemacht werden; im Anschluss wird die Modulus-Größe abgefragt.',
    parameter: null,
    example: 'crypto key generate rsa',
    distractorCommands: ['ip ssh version 2', 'transport input ssh', 'line vty 0 15'],
    distractorPurposes: [
      'beschränkt den VTY-Zugang auf SSH',
      'wechselt in die VTY-Line-Konfiguration',
      'erzwingt SSHv2',
    ],
  }),
  CMD('ssh', 'ipSshVersion2', {
    command: 'ip ssh version 2',
    purpose: 'erlaubt ausschließlich SSHv2-Verbindungen',
    context: 'SSHv1 gilt als unsicher; nur SSHv2 soll akzeptiert werden.',
    parameter: null,
    example: 'ip ssh version 2',
    distractorCommands: ['crypto key generate rsa', 'transport input ssh', 'username admin secret'],
    distractorPurposes: [
      'erzeugt die RSA-Schlüssel',
      'legt einen lokalen Benutzer an',
      'beschränkt den VTY-Transport auf SSH',
    ],
  }),
  CMD('ssh', 'lineVty', {
    command: 'line vty 0 15',
    purpose: 'wechselt in die Konfiguration der virtuellen Terminal-Leitungen',
    context: 'Du willst den Remote-Zugang (SSH/Telnet) auf dem Gerät absichern.',
    parameter: null,
    example: 'line vty 0 15',
    distractorCommands: ['line console 0', 'interface vlan 1', 'transport input all'],
    distractorPurposes: [
      'wechselt in die Konsolenleitung',
      'wechselt in eine logische SVI-Schnittstelle',
      'erlaubt alle Protokolle am VTY',
    ],
  }),
  CMD('ssh', 'transportInputSsh', {
    command: 'transport input ssh',
    purpose: 'erlaubt auf den VTY-Leitungen nur noch SSH-Verbindungen',
    context: 'Telnet soll deaktiviert und ausschließlich SSH erlaubt werden.',
    parameter: null,
    example: 'transport input ssh',
    distractorCommands: ['transport input telnet', 'transport input all', 'login local'],
    distractorPurposes: [
      'erlaubt alle Protokolle',
      'erlaubt nur Telnet',
      'prüft gegen die lokale Benutzerdatenbank',
    ],
  }),

  // VLAN / Access / Trunk
  CMD('vlan', 'vlan', {
    command: 'vlan <ID>',
    purpose: 'legt ein VLAN an oder wechselt in die VLAN-Konfiguration',
    context: 'Im globalen Konfigurationsmodus soll ein neues VLAN erstellt werden.',
    parameter: 'VLAN-ID',
    example: 'vlan 10',
    distractorCommands: ['interface vlan 10', 'switchport access vlan 10', 'name VLAN10'],
    distractorPurposes: [
      'weist einem Access-Port ein VLAN zu',
      'erzeugt eine Layer-3-SVI',
      'vergibt einen VLAN-Namen',
    ],
  }),
  CMD('vlan', 'vlanName', {
    command: 'name <NAME>',
    purpose: 'vergibt einem VLAN einen sprechenden Namen',
    context: 'Innerhalb der VLAN-Konfiguration soll das VLAN beschrieben werden.',
    parameter: 'Beschreibender Name',
    example: 'name VERTRIEB',
    distractorCommands: ['vlan 10', 'description', 'switchport mode access'],
    distractorPurposes: [
      'wechselt in die VLAN-Konfiguration',
      'legt den Switchport-Modus fest',
      'hinterlässt einen Interface-Kommentar',
    ],
  }),
  CMD('access-port', 'interfaceRange', {
    command: 'interface range <RANGE>',
    purpose: 'konfiguriert mehrere Interfaces gleichzeitig',
    context: 'Mehrere Access-Ports sollen mit denselben Befehlen bearbeitet werden.',
    parameter: 'Schnittstellenbereich, z. B. fa0/1-24',
    example: 'interface range FastEthernet0/1-24',
    distractorCommands: ['interface fa0/1', 'switchport access vlan 10', 'vlan 10'],
    distractorPurposes: [
      'wechselt in ein einzelnes Interface',
      'legt ein VLAN an',
      'weist einem Port ein VLAN zu',
    ],
  }),
  CMD('access-port', 'switchportModeAccess', {
    command: 'switchport mode access',
    purpose: 'setzt einen Switchport in den Access-Modus für genau ein VLAN',
    context: 'Ein Port soll einem Endgerät-VLAN zugeordnet werden.',
    parameter: null,
    example: 'switchport mode access',
    distractorCommands: ['switchport mode trunk', 'switchport access vlan 10', 'switchport nonegotiate'],
    distractorPurposes: [
      'weist das eigentliche VLAN zu',
      'aktiviert den Trunk-Modus',
      'deaktiviert DTP-Nachbarhandel',
    ],
  }),
  CMD('access-port', 'switchportAccessVlan', {
    command: 'switchport access vlan <VLAN>',
    purpose: 'ordnet einem Access-Port ein bestimmtes VLAN zu',
    context: 'Der Access-Port soll Endgeräte in VLAN 10 transportieren.',
    parameter: 'VLAN-ID',
    example: 'switchport access vlan 10',
    distractorCommands: ['switchport mode trunk', 'vlan 10', 'interface vlan 10'],
    distractorPurposes: [
      'legt das VLAN global an',
      'erzeugt eine SVI',
      'aktiviert den Trunk-Modus',
    ],
  }),
  CMD('trunk', 'switchportModeTrunk', {
    command: 'switchport mode trunk',
    purpose: 'setzt einen Switchport in den Trunk-Modus für mehrere VLANs',
    context: 'Zwischen zwei Switches sollen mehrere VLANs über dieselbe Verbindung transportiert werden.',
    parameter: null,
    example: 'switchport mode trunk',
    distractorCommands: ['switchport mode access', 'switchport trunk allowed vlan', 'switchport nonegotiate'],
    distractorPurposes: [
      'legt die erlaubten VLANs auf dem Trunk fest',
      'setzt den Port auf Access',
      'deaktiviert DTP',
    ],
  }),
  CMD('trunk', 'switchportTrunkAllowedVlan', {
    command: 'switchport trunk allowed vlan <LIST>',
    purpose: 'steuert, welche VLANs über einen Trunk weitergeleitet werden',
    context: 'Auf dem Trunk sollen nur bestimmte VLANs erlaubt sein.',
    parameter: 'Kommaseparierte VLAN-IDs',
    example: 'switchport trunk allowed vlan 10,20,30',
    distractorCommands: ['switchport trunk native vlan 10', 'switchport access vlan 10', 'vlan 10,20,30'],
    distractorPurposes: [
      'legt das Native VLAN fest',
      'weist einem Access-Port VLANs zu',
      'erzeugt mehrere VLANs',
    ],
  }),
  CMD('trunk', 'switchportTrunkNativeVlan', {
    command: 'switchport trunk native vlan <VLAN>',
    purpose: 'setzt das Native VLAN auf einem Trunk',
    context: 'Ungetaggter Verkehr auf dem Trunk soll VLAN 99 zugeordnet werden.',
    parameter: 'VLAN-ID',
    example: 'switchport trunk native vlan 99',
    distractorCommands: ['switchport trunk allowed vlan 99', 'switchport access vlan 99', 'vlan 99'],
    distractorPurposes: [
      'erlaubt VLAN 99 auf dem Trunk',
      'weist einem Access-Port VLAN 99 zu',
      'legt VLAN 99 an',
    ],
  }),

  // Router basics / static / inter-vlan
  CMD('router-basics', 'ipDefaultGateway', {
    command: 'ip default-gateway <IP>',
    purpose: 'gibt einem Layer-2-Switch das Default Gateway für Management-Verkehr',
    context: 'Ein L2-Switch ohne Routing soll aus einem anderen Netz per SSH erreichbar sein.',
    parameter: 'IP-Adresse des Default Gateways',
    example: 'ip default-gateway 192.168.10.1',
    distractorCommands: ['ip route 0.0.0.0 0.0.0.0', 'ip address 192.168.10.1 255.255.255.0', 'ip helper-address 192.168.10.1'],
    distractorPurposes: [
      'weist der SVI eine IP zu',
      'konfiguriert DHCP Relay',
      'legt eine Default Route auf einem Router fest',
    ],
  }),
  CMD('router-basics', 'ipRoute', {
    command: 'ip route <NET> <MASK> <NEXT-HOP>',
    purpose: 'legt eine statische Route zu einem fernen Netz fest',
    context: 'Ein Router kennt ein Netz nicht und soll es manuell erlernen.',
    parameter: 'Zielnetz, Subnetzmaske und Next-Hop',
    example: 'ip route 192.168.20.0 255.255.255.0 10.0.0.2',
    distractorCommands: ['router rip', 'ip default-gateway 10.0.0.2', 'ip address 10.0.0.1 255.255.255.0'],
    distractorPurposes: [
      'weist einer Schnittstelle eine IP zu',
      'setzt das Default Gateway eines L2-Switches',
      'startet ein dynamisches Routing-Protokoll',
    ],
  }),
  CMD('inter-vlan-routing', 'encapsulationDot1q', {
    command: 'encapsulation dot1Q <VLAN>',
    purpose: 'taggt ein Router-Subinterface für das angegebene VLAN',
    context: 'Bei Router-on-a-Stick soll ein Subinterface einem VLAN zugeordnet werden.',
    parameter: 'VLAN-ID',
    example: 'encapsulation dot1Q 10',
    distractorCommands: ['interface vlan 10', 'switchport mode trunk', 'ip address 192.168.10.1 255.255.255.0'],
    distractorPurposes: [
      'weist der physischen Schnittstelle eine IP zu',
      'aktiviert den Trunk auf einem Switchport',
      'erzeugt eine logische SVI',
    ],
  }),

  // Multilayer switch
  CMD('multilayer-switching', 'ipRouting', {
    command: 'ip routing',
    purpose: 'schaltet das Layer-3-Routing auf einem Multilayer-Switch global ein',
    context: 'Ein Multilayer-Switch soll zwischen SVIs routen können.',
    parameter: null,
    example: 'ip routing',
    distractorCommands: ['no switchport', 'interface vlan 10', 'ip route'],
    distractorPurposes: [
      'legt eine statische Route fest',
      'erzeugt eine SVI',
      'macht einen einzelnen Port zu einem gerouteten Port',
    ],
  }),
  CMD('multilayer-switching', 'interfaceVlan', {
    command: 'interface vlan <ID>',
    purpose: 'erzeugt oder konfiguriert eine Switched Virtual Interface (SVI)',
    context: 'Ein L3-Switch oder L2-Switch benötigt eine logische Schnittstelle für ein VLAN.',
    parameter: 'VLAN-ID',
    example: 'interface vlan 10',
    distractorCommands: ['vlan 10', 'switchport access vlan 10', 'interface GigabitEthernet0/1'],
    distractorPurposes: [
      'wechselt in ein physisches Interface',
      'legt das VLAN an',
      'weist einem Access-Port VLAN 10 zu',
    ],
  }),
  CMD('multilayer-switching', 'noSwitchport', {
    command: 'no switchport',
    purpose: 'macht einen physischen Switchport zu einem gerouteten Layer-3-Port',
    context: 'Auf einem Multilayer-Switch soll ein Port wie ein Router-Interface arbeiten.',
    parameter: null,
    example: 'no switchport',
    distractorCommands: ['switchport mode access', 'switchport mode trunk', 'ip routing'],
    distractorPurposes: [
      'aktiviert den Trunk-Modus',
      'aktiviert Layer-3-Routing global',
      'setzt den Port auf Access',
    ],
  }),

  // OSPF
  CMD('ospf', 'routerOspf', {
    command: 'router ospf <PROCESS-ID>',
    purpose: 'startet den OSPF-Routing-Prozess',
    context: 'Dynamisches Routing mit OSPF soll konfiguriert werden.',
    parameter: 'Prozess-ID',
    example: 'router ospf 1',
    distractorCommands: ['ip ospf 1 area 0', 'router rip', 'network 192.168.10.0 0.0.0.255 area 0'],
    distractorPurposes: [
      'aktiviert OSPF direkt auf einem Interface',
      'startet das RIP-Protokoll',
      'ist ein OSPF-Netzwerk-Befehl',
    ],
  }),
  CMD('ospf', 'ospfNetwork', {
    command: 'network <NET> <WILDCARD> area <AREA>',
    purpose: 'aktiviert OSPF auf passenden Interfaces anhand von Netz und Wildcard',
    context: 'Im Router-OSPF-Konfigurationsmodus sollen Interfaces in eine Area aufgenommen werden.',
    parameter: 'Netz, Wildcard-Maske und Area',
    example: 'network 192.168.10.0 0.0.0.255 area 0',
    distractorCommands: ['ip route 192.168.10.0 255.255.255.0', 'router ospf 1', 'passive-interface gi0/0'],
    distractorPurposes: [
      'startet den OSPF-Prozess',
      'unterdrückt OSPF-Nachbarschaften auf einem Interface',
      'legt eine statische Route fest',
    ],
  }),
  CMD('ospf', 'passiveInterface', {
    command: 'passive-interface <INTERFACE>',
    purpose: 'verhindert OSPF-Nachbarschaften auf einem Interface, lässt aber das Netzwerk noch bekanntgeben',
    context: 'Ein Interface mit Endgeräten soll keine OSPF-Hello-Pakete verschicken.',
    parameter: 'Schnittstelle',
    example: 'passive-interface GigabitEthernet0/0',
    distractorCommands: ['no shutdown', 'interface GigabitEthernet0/0', 'network 10.0.0.0 0.0.0.3 area 0'],
    distractorPurposes: [
      'wechselt in die Schnittstellenkonfiguration',
      'aktiviert die Schnittstelle',
      'aktiviert OSPF auf einem Netzwerk',
    ],
  }),

  // DHCP relay
  CMD('dhcp', 'ipHelperAddress', {
    command: 'ip helper-address <DHCP-SERVER-IP>',
    purpose: 'leitet DHCP-Broadcasts vom Client-Netz als Unicast an den DHCP-Server weiter',
    context: 'Auf dem Gateway-Interface/SVI des Client-VLANs soll DHCP Relay eingerichtet werden.',
    parameter: 'IP-Adresse des DHCP-Servers',
    example: 'ip helper-address 192.168.0.1',
    distractorCommands: ['ip default-gateway 192.168.0.1', 'ip route 192.168.0.1', 'ip address 192.168.0.1 255.255.255.0'],
    distractorPurposes: [
      'weist der Schnittstelle eine IP zu',
      'setzt das Default Gateway eines L2-Switches',
      'legt eine statische Route fest',
    ],
  }),

  // STP
  CMD('stp', 'spanningTreePortfast', {
    command: 'spanning-tree portfast',
    purpose: 'überspringt Listening/Learning auf einem Endgeräte-Port und schaltet sofort in Forwarding',
    context: 'Ein Access-Port mit einem PC/Drucker soll nicht die üblichen STP-Zwischenzustände durchlaufen.',
    parameter: null,
    example: 'spanning-tree portfast',
    distractorCommands: ['spanning-tree bpduguard enable', 'spanning-tree vlan 10 priority 0', 'switchport mode access'],
    distractorPurposes: [
      'weist einem Port ein VLAN zu',
      'legt die Root Bridge für VLAN 10 fest',
      'deaktiviert einen Port bei BPDU-Empfang',
    ],
  }),
  CMD('stp', 'spanningTreeBpduguard', {
    command: 'spanning-tree bpduguard enable',
    purpose: 'versetzt einen Port bei BPDU-Empfang in den Zustand err-disabled',
    context: 'Ein Access-Port soll vor versehentlichem Anschluss eines Switches geschützt werden.',
    parameter: null,
    example: 'spanning-tree bpduguard enable',
    distractorCommands: ['spanning-tree portfast', 'spanning-tree vlan 10 root primary', 'shutdown'],
    distractorPurposes: [
      'überspringt STP-Zwischenzustände',
      'legt die Root Bridge fest',
      'deaktiviert die Schnittstelle administrativ',
    ],
  }),
  CMD('stp', 'spanningTreeVlanPriority', {
    command: 'spanning-tree vlan <ID> priority <PRIORITY>',
    purpose: 'beeinflusst die Root-Bridge-Wahl für ein VLAN',
    context: 'Ein bestimmter Switch soll bevorzugt Root Bridge für VLAN 10 werden.',
    parameter: 'VLAN-ID und Priority (in 4096er-Schritten)',
    example: 'spanning-tree vlan 10 priority 4096',
    distractorCommands: ['spanning-tree vlan 10 root primary', 'spanning-tree portfast', 'vlan 10'],
    distractorPurposes: [
      'legt VLAN 10 an',
      'überspringt STP-Zwischenzustände',
      'verwendet den Cisco-Komfortbefehl zur Root-Wahl',
    ],
  }),

  // ACL / packet filter
  CMD('acl', 'accessList', {
    command: 'access-list <NUM> permit|deny <PROTO> <SRC> <DST>',
    purpose: 'erstellt eine nummerierte Standard- oder Extended-ACL-Regel',
    context: 'Ein Router soll Datenverkehr anhand von Quelle, Ziel und Protokoll filtern.',
    parameter: 'Nummer, Aktion, Protokoll, Quelle und Ziel',
    example: 'access-list 100 permit tcp 192.168.10.0 0.0.0.255 any eq 80',
    distractorCommands: ['ip access-group 100 in', 'ip route 192.168.10.0', 'router ospf 1'],
    distractorPurposes: [
      'legt eine statische Route fest',
      'startet den OSPF-Prozess',
      'wendet eine ACL an einem Interface an',
    ],
  }),
  CMD('acl', 'ipAccessGroup', {
    command: 'ip access-group <NAME|NUM> <in|out>',
    purpose: 'wendet eine ACL an einem Interface in Richtung ein- oder ausgehend an',
    context: 'Eine ACL wurde erstellt und soll nun an einem Interface wirksam werden.',
    parameter: 'ACL-Nummer/-Name und Richtung',
    example: 'ip access-group 100 in',
    distractorCommands: ['access-list 100 permit ip any any', 'interface GigabitEthernet0/0', 'ip route 0.0.0.0 0.0.0.0'],
    distractorPurposes: [
      'wechselt in ein Interface',
      'legt eine statische Route fest',
      'erzeugt eine ACL-Regel',
    ],
  }),

  // NAT
  CMD('nat', 'ipNatInside', {
    command: 'ip nat inside',
    purpose: 'kennzeichnet eine Schnittstelle als Inside-Interface für NAT',
    context: 'Ein Router-Interface grenzt an das private Netz.',
    parameter: null,
    example: 'ip nat inside',
    distractorCommands: ['ip nat outside', 'ip nat inside source list', 'ip address 10.0.0.1 255.255.255.0'],
    distractorPurposes: [
      'kennzeichnet das öffentliche Interface',
      'legt eine NAT-Übersetzungsregel fest',
      'weist der Schnittstelle eine IP zu',
    ],
  }),
  CMD('nat', 'ipNatInsideSource', {
    command: 'ip nat inside source list <ACL> interface <IF> overload',
    purpose: 'übersetzt viele interne Adressen auf eine öffentliche Interface-IP (PAT)',
    context: 'Mehrere interne Clients sollen über eine öffentliche IP ins Internet.',
    parameter: 'ACL, Interface und Überladungsschlüsselwort',
    example: 'ip nat inside source list 1 interface GigabitEthernet0/1 overload',
    distractorCommands: ['ip nat inside', 'access-list 1 permit any', 'ip route 0.0.0.0 0.0.0.0'],
    distractorPurposes: [
      'erzeugt eine statische Route',
      'kennzeichnet die interne Seite',
      'erzeugt die ACL',
    ],
  }),

  // Show / verify
  CMD('troubleshooting', 'showIpInterfaceBrief', {
    command: 'show ip interface brief',
    purpose: 'zeigt Interface-Status und zugewiesene IP-Adressen kompakt an',
    context: 'Du willst schnell sehen, welche Interfaces up sind und welche IPs konfiguriert sind.',
    parameter: null,
    example: 'show ip interface brief',
    distractorCommands: ['show running-config', 'show interfaces', 'show ip route'],
    distractorPurposes: [
      'zeigt die gesamte Konfiguration',
      'zeigt die Routing-Tabelle',
      'zeigt detaillierte Interface-Statistiken',
    ],
  }),
  CMD('troubleshooting', 'showRunningConfig', {
    command: 'show running-config',
    purpose: 'zeigt die aktuell im RAM befindliche Konfiguration',
    context: 'Du möchtest prüfen, ob eine Konfigurationsänderung übernommen wurde.',
    parameter: null,
    example: 'show running-config',
    distractorCommands: ['show startup-config', 'write', 'copy running-config startup-config'],
    distractorPurposes: [
      'speichert die Konfiguration',
      'zeigt die Startkonfiguration',
      'ist ein veralteter Speicherbefehl',
    ],
  }),
  CMD('troubleshooting', 'showVlanBrief', {
    command: 'show vlan brief',
    purpose: 'listet alle VLANs mit ihren zugewiesenen Ports auf',
    context: 'Du möchtest wissen, welche Ports in welchem VLAN liegen.',
    parameter: null,
    example: 'show vlan brief',
    distractorCommands: ['show interfaces trunk', 'show spanning-tree', 'show mac address-table'],
    distractorPurposes: [
      'zeigt gelernte MAC-Adressen',
      'zeigt Trunk-Verbindungen',
      'zeigt den Spanning-Tree',
    ],
  }),
  CMD('troubleshooting', 'showInterfacesTrunk', {
    command: 'show interfaces trunk',
    purpose: 'zeigt Trunk-Ports, Native VLAN und erlaubte VLANs',
    context: 'Du vermutet ein Problem mit der Trunk-Konfiguration.',
    parameter: null,
    example: 'show interfaces trunk',
    distractorCommands: ['show vlan brief', 'show ip interface brief', 'show spanning-tree'],
    distractorPurposes: [
      'zeigt die VLAN-Zuordnung aller Ports',
      'zeigt den STP-Zustand',
      'zeigt Interface-IPs und Status',
    ],
  }),
  CMD('troubleshooting', 'showIpRoute', {
    command: 'show ip route',
    purpose: 'zeigt die IPv4-Routing-Tabelle',
    context: 'Ein Host in einem entfernten Netz ist nicht erreichbar.',
    parameter: null,
    example: 'show ip route',
    distractorCommands: ['show ip interface brief', 'show running-config', 'ping'],
    distractorPurposes: [
      'prüft grundlegende Erreichbarkeit',
      'zeigt Interface-IPs',
      'zeigt die aktive Konfiguration',
    ],
  }),
  CMD('troubleshooting', 'showSpanningTree', {
    command: 'show spanning-tree',
    purpose: 'zeigt Root Bridge, Portrollen und -zustände',
    context: 'Du willst STP-Informationen zu Redundanz und blockierten Ports sehen.',
    parameter: null,
    example: 'show spanning-tree',
    distractorCommands: ['show vlan brief', 'show interfaces trunk', 'show mac address-table'],
    distractorPurposes: [
      'zeigt gelernte MAC-Adressen',
      'zeigt VLANs und Ports',
      'zeigt Trunk-Ports',
    ],
  }),
];
