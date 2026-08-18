// =============================================================================
// Knowledge Items – SSH / Remote Management
//
// Source: frontend/src/lib/academyLessons/ciscoSsh.js
// This covers only the Block 1.5 SSH content already taught in the Academy.
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

export const SSH_TOPIC_KEY = topicKey('cisco-packet-tracer', 'ssh');

export const sshKnowledgeItems = [
  {
    id: 'ssh.telnetVsSsh',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'telnet-vs-ssh-classic',
    conceptCluster: 'ssh.protocol',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      items: [
        { name: 'Telnet', port: 23, encrypted: false, status: 'veraltet/unsicher' },
        { name: 'SSH', port: 22, encrypted: true, status: 'Standard für Remote-Administration' },
      ],
      description: 'Telnet überträgt Daten im Klartext; SSH verschlüsselt die gesamte Verbindung inklusive Zugangsdaten.',
    },
    siblings: [],
  },
  {
    id: 'ssh.version',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'ssh-version-classic',
    conceptCluster: 'ssh.version',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      requiredVersion: 2,
      command: 'ip ssh version 2',
      description: 'SSHv1 hat bekannte Sicherheitsschwächen. SSHv2 muss explizit aktiviert werden.',
    },
    siblings: [],
  },
  {
    id: 'ssh.configProcedure',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'konfig-reihenfolge-classic',
    conceptCluster: 'ssh.procedure',
    type: KNOWLEDGE_TYPES.PROCEDURE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      steps: [
        'Hostname vergeben',
        'Domain Name vergeben',
        'Privileged EXEC Mode absichern (enable secret)',
        'Lokalen Benutzer anlegen',
        'RSA-Schlüsselpaar generieren',
        'SSH Version 2 aktivieren',
        'IP-Erreichbarkeit herstellen',
        'VTY-Lines konfigurieren (nur SSH, lokale Benutzerdatenbank)',
        'SSH-Zugriff testen',
        'Konfiguration verifizieren',
      ],
      description: 'SSH baut auf mehreren Voraussetzungen auf, die in einer bestimmten Reihenfolge erfüllt werden müssen.',
    },
    siblings: [],
  },
  {
    id: 'ssh.rsaKeyRequirements',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'befehle-classic',
    conceptCluster: 'ssh.rsa',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      command: 'crypto key generate rsa',
      prerequisites: ['Hostname vergeben', 'Domain Name vergeben'],
      reason: 'Der RSA-Schlüsselname setzt sich aus Hostname und Domainname zusammen (Hostname.Domainname).',
      description: 'crypto key generate rsa schlägt fehl, wenn Hostname oder Domain Name fehlen.',
    },
    siblings: [],
  },
  {
    id: 'ssh.vtyConfig',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'befehle-classic',
    conceptCluster: 'ssh.vty',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      commands: ['line vty 0 15', 'login local', 'transport input ssh'],
      dependencies: {
        'login local': 'Lokaler Benutzer muss vorher angelegt sein.',
        'transport input ssh': 'Schließt Telnet auf den VTY-Lines aus und erlaubt nur SSH.',
      },
      description: 'Die VTY-Lines müssen lokale Authentifizierung verwenden und ausschließlich SSH erlauben.',
    },
    siblings: [],
  },
  {
    id: 'ssh.managementSvi',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'l2-switch-szenario-classic',
    conceptCluster: 'ssh.svi',
    type: KNOWLEDGE_TYPES.RELATION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      deviceType: 'Layer-2-Switch',
      reason: 'Ein reiner L2-Switch hat keine IP je Access-Port und kann nicht routen.',
      solution: 'Management-SVI in einem eigenen Management-VLAN (interface vlan <ID>) konfigurieren und mit no shutdown aktivieren.',
      optionalGateway: 'ip default-gateway <Gateway-IP> für Erreichbarkeit außerhalb des lokalen Netzes.',
      description: 'Ein L2-Switch braucht für SSH-Fernwartung eine SVI in einem Management-VLAN.',
    },
    siblings: [],
  },
  {
    id: 'ssh.ipReachabilityTypes',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'gemeinsamkeiten-classic',
    conceptCluster: 'ssh.reachability',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      items: [
        { name: 'Router', ipReachability: 'physische Schnittstelle (z. B. interface g0/0)' },
        { name: 'L2-Switch', ipReachability: 'SVI in einem eigenen Management-VLAN' },
        { name: 'Multilayer-Switch', ipReachability: 'SVI in einem beliebigen VLAN (kann zusätzlich selbst routen)' },
      ],
      shared: 'Hostname, Domain, enable secret, Benutzer, RSA-Key, SSH v2 und VTY-Konfiguration sind auf allen drei identisch.',
      description: 'Die eigentliche SSH-Absicherung ist auf allen Gerätetypen identisch; nur die IP-Erreichbarkeit unterscheidet sich.',
    },
    siblings: [],
  },
  {
    id: 'ssh.troubleshooting',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'troubleshooting-classic',
    conceptCluster: 'ssh.troubleshooting',
    type: KNOWLEDGE_TYPES.TROUBLESHOOT,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.TROUBLESHOOT, QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.SCENARIO],
    data: {
      symptoms: [
        { symptom: 'crypto key generate rsa bricht mit Hostname-Fehler ab', cause: 'Kein individueller Hostname und/oder Domain Name vergeben' },
        { symptom: 'SSH-Client verweigert die Verbindung sofort', cause: 'SSH ist nicht aktiv (RSA-Key fehlt oder SSHv2 nicht aktiviert)' },
        { symptom: 'Ping klappt, SSH-Login nicht', cause: 'VTY-Line fehlt login local oder transport input ssh; oder lokaler Benutzer fehlt' },
        { symptom: 'Gerät per Ping gar nicht erreichbar', cause: 'Management-IP/SVI fehlt, falsch konfiguriert oder administrativ down' },
      ],
      description: 'SSH-Probleme lassen sich anhand von Symptomen auf fehlende Konfigurationsschritte zurückführen.',
    },
    siblings: [],
  },
  {
    id: 'ssh.verificationCommands',
    topicKey: SSH_TOPIC_KEY,
    sourceTopicKey: SSH_TOPIC_KEY,
    sourceSection: 'verifizierung-classic',
    conceptCluster: 'ssh.verification',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.SELECT_BEST],
    data: {
      mapping: [
        { command: 'show ip ssh', purpose: 'Zeigt aktive SSH-Version und Verbindungsstatus' },
        { command: 'show ssh', purpose: 'Zeigt aktuell bestehende SSH-Sitzungen' },
        { command: 'show running-config | include vty', purpose: 'Prüft VTY-Konfiguration in der laufenden Konfiguration' },
        { command: 'show ip interface brief', purpose: 'Prüft, ob Management-Schnittstelle/SVI up und korrekt ist' },
      ],
      description: 'Mit bestimmten show-Befehlen lässt sich die SSH-Konfiguration und Erreichbarkeit verifizieren.',
    },
    siblings: [],
  },
];
