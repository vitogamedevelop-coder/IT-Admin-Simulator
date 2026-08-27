// Skill Tree & Adaptive Competency Architecture
// Phase 0.5: granular skills with dimensions (knowledge / configure / verify / troubleshoot).
//
// Design goals:
// - Domain-agnostic: the same engine must later work for Cisco, Linux,
//   Active Directory, Windows, Networking Fundamentals, etc.
// - Hierarchical skills with subskills.
// - Per-skill competency state: exposure → practice → mastery.
// - Per-dimension tracking: a learner can know the theory but still fail
//   the configuration, or vice versa.
// - Fine-grained event tracking: correct/incorrect answers, hints used,
//   solutions revealed, CLI errors, repeated errors, timing, difficulty,
//   successful applications without help.
// - Stable IDs: never use localized labels as primary IDs.
// - Adaptive difficulty support: the engine can later ask for increasingly
//   open-ended tasks on success and drop to focused subskill drills on
//   repeated failures.

const SKILL_TREE_KEY = 'cyberlearn:skill-tree-v2';
const SKILL_EVENTS_KEY = 'cyberlearn:skill-events-v2';
const SKILL_TREE_SCHEMA_VERSION = 2;

export const COMPETENCY_STATE = {
  UNSEEN: 'unseen',
  INTRODUCED: 'introduced',
  PRACTICING: 'practicing',
  MOSTLY_SECURE: 'mostly_secure',
  SECURE: 'secure',
  REVIEW_DUE: 'review_due',
};

export const SKILL_DIMENSION = {
  KNOWLEDGE: 'knowledge',
  CONFIGURE: 'configure',
  VERIFY: 'verify',
  TROUBLESHOOT: 'troubleshoot',
};

export const SKILL_SOURCE = {
  ACADEMY: 'academy',
  MAIN_MISSION: 'main_mission',
  TICKET: 'ticket',
  LAB: 'lab',
  CONVERSATION: 'conversation',
  EXAM: 'exam',
  // Phase 1H: procedural (generated) side missions.
  PROCEDURAL: 'procedural',
};

// Common misconception IDs, stored per-skill.  More can be added later.
export const MISCONCEPTION = {
  ACL_DIRECTION_CONFUSION: 'acl_direction_confusion',
  NAT_INSIDE_LOCAL_GLOBAL_CONFUSION: 'nat_inside_local_global_confusion',
  OSPF_WILDCARD_SUBNETMASK_CONFUSION: 'ospf_wildcard_subnetmask_confusion',
  FORGOT_NO_SHUTDOWN: 'forgot_no_shutdown',
  FORGOT_SAVE_CONFIG: 'forgot_save_config',
  WILDCARD_ZERO_ALL: 'wildcard_zero_all',
  TRUNK_NATIVE_VLAN: 'trunk_native_vlan',
};

// Skill hierarchy derived from existing Academy lessons.
// Each skill belongs to a domain and carries a list of subskills.
// Subskill IDs are stable and describe one concrete trainable ability.
// The optional `lessonTopic` points to the matching Cisco Academy topic.
export const SKILL_TREE = {
  cisco: {
    label: 'Cisco',
    description: 'Netzwerkinfrastruktur mit Cisco IOS/Packet Tracer.',
    skills: {
      basic_configuration: {
        label: 'Basic Configuration',
        description: 'CLI-Modi, Hostname, Passwörter, lokale Benutzer, Interface-Konfiguration, Speichern.',
        subskills: {
          cli_navigation: { label: 'CLI-Modi wechseln (User/Privileged/Config)', lessonTopic: 'cisco-packet-tracer/grundlagen' },
          hostname: { label: 'Hostname konfigurieren', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          disable_dns_lookup: { label: 'DNS-Lookup abschalten (no ip domain-lookup)', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          enable_secret: { label: 'Enable Secret setzen', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          local_user: { label: 'Lokale Benutzer anlegen', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          console_security: { label: 'Console-Sicherheit (password/secret)', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          login: { label: 'Line-Login aktivieren', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          login_local: { label: 'Login local vs. login', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          exec_timeout: { label: 'EXEC-Timeout konfigurieren', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          service_password_encryption: { label: 'service password-encryption', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          do_command: { label: 'EXEC-Befehle aus Konfigurationsmodus mit do', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          verify_basic_config: { label: 'Grundkonfiguration mit show running-config prüfen', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          troubleshoot_console_lockout: { label: 'Console-Lockout durch login local ohne User erkennen', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          troubleshoot_config_not_saved: { label: 'Vergessenes Speichern erkennen', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          domain_name: { label: 'IP-Domain-Name setzen', lessonTopic: 'cisco-packet-tracer/ssh' },
          interface_ip: { label: 'Interface-IP konfigurieren', lessonTopic: 'cisco-packet-tracer/router-basics' },
          interface_enable: { label: 'Interface aktivieren (no shutdown)', lessonTopic: 'cisco-packet-tracer/router-basics' },
          default_gateway: { label: 'Default Gateway (Switch-Management)', lessonTopic: 'cisco-packet-tracer/basic-device-configuration' },
          save_config: { label: 'Konfiguration speichern', lessonTopic: 'cisco-packet-tracer/grundlagen' },
          verify_running_config: { label: 'Running-Config prüfen', lessonTopic: 'cisco-packet-tracer/grundlagen' },
        },
      },
      switching: {
        label: 'Switching',
        description: 'VLAN, Access-Ports, Trunk-Ports.',
        subskills: {
          'vlan.create': { label: 'VLAN anlegen', lessonTopic: 'cisco-packet-tracer/vlan' },
          'vlan.name': { label: 'VLAN benennen', lessonTopic: 'cisco-packet-tracer/vlan' },
          'vlan.verify': { label: 'VLAN verifizieren', lessonTopic: 'cisco-packet-tracer/vlan' },
          'vlan.troubleshoot': { label: 'VLAN-Fehlersuche', lessonTopic: 'cisco-packet-tracer/vlan' },
          'access_port.configure': { label: 'Access-Port konfigurieren', lessonTopic: 'cisco-packet-tracer/access-port' },
          'access_port.assign_vlan': { label: 'Access-Port VLAN zuweisen', lessonTopic: 'cisco-packet-tracer/access-port' },
          'access_port.range': { label: 'Interface Range nutzen', lessonTopic: 'cisco-packet-tracer/access-port' },
          'access_port.verify': { label: 'Access-Port verifizieren', lessonTopic: 'cisco-packet-tracer/access-port' },
          'access_port.troubleshoot': { label: 'Access-Port-Fehlersuche', lessonTopic: 'cisco-packet-tracer/access-port' },
          'trunk.configure': { label: 'Trunk konfigurieren', lessonTopic: 'cisco-packet-tracer/trunk' },
          'trunk.native_vlan': { label: 'Native VLAN am Trunk', lessonTopic: 'cisco-packet-tracer/trunk' },
          'trunk.allowed_vlans': { label: 'Allowed VLANs am Trunk', lessonTopic: 'cisco-packet-tracer/trunk' },
          'trunk.allowed_vlans_add_remove': { label: 'Allowed VLANs ergänzen/entfernen', lessonTopic: 'cisco-packet-tracer/trunk' },
          'trunk.verify': { label: 'Trunk verifizieren', lessonTopic: 'cisco-packet-tracer/trunk' },
          'trunk.troubleshoot': { label: 'Trunk-Fehlersuche', lessonTopic: 'cisco-packet-tracer/trunk' },
        },
      },
      routing: {
        label: 'Routing',
        description: 'Router-Grundlagen, statische Routen, OSPF, Default-Routen.',
        subskills: {
          'router_interface.configure': { label: 'Router-Interface konfigurieren', lessonTopic: 'cisco-packet-tracer/router-basics' },
          'router_interface.verify': { label: 'Router-Interface verifizieren', lessonTopic: 'cisco-packet-tracer/router-basics' },
          'route_selection.longest_prefix_match': { label: 'Longest Prefix Match', lessonTopic: 'cisco-packet-tracer/router-basics' },
          'route_selection.administrative_distance': { label: 'Administrative Distance', lessonTopic: 'cisco-packet-tracer/router-basics' },
          'route_selection.metric': { label: 'Metrik', lessonTopic: 'cisco-packet-tracer/router-basics' },
          'static_route.configure': { label: 'Statische Route konfigurieren', lessonTopic: 'cisco-packet-tracer/static-routing' },
          'default_route.configure': { label: 'Default Route konfigurieren', lessonTopic: 'cisco-packet-tracer/static-routing' },
          'static_route.verify': { label: 'Statische Route verifizieren', lessonTopic: 'cisco-packet-tracer/static-routing' },
          'static_route.troubleshoot': { label: 'Statische Route Fehlersuche', lessonTopic: 'cisco-packet-tracer/static-routing' },
          'inter_vlan.subinterface': { label: 'Subinterface anlegen', lessonTopic: 'cisco-packet-tracer/inter-vlan-routing' },
          'inter_vlan.encapsulation_dot1q': { label: 'encapsulation dot1Q', lessonTopic: 'cisco-packet-tracer/inter-vlan-routing' },
          'inter_vlan.gateway': { label: 'Inter-VLAN Gateway', lessonTopic: 'cisco-packet-tracer/inter-vlan-routing' },
          'inter_vlan.verify': { label: 'Inter-VLAN verifizieren', lessonTopic: 'cisco-packet-tracer/inter-vlan-routing' },
          'inter_vlan.troubleshoot': { label: 'Inter-VLAN Fehlersuche', lessonTopic: 'cisco-packet-tracer/inter-vlan-routing' },
          'ospf.wildcard': { label: 'OSPF Wildcard-Maske', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.network_method': { label: 'OSPF Network-Methode', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.interface_method': { label: 'OSPF Interface-Methode', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.passive_interface': { label: 'OSPF passive-interface', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.default_information_originate': { label: 'OSPF default-information originate', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.authentication_plaintext': { label: 'OSPF Klartext-Authentifizierung', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.authentication_md5': { label: 'OSPF MD5-Authentifizierung', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.neighbor': { label: 'OSPF Neighbor', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.verify': { label: 'OSPF verifizieren', lessonTopic: 'cisco-packet-tracer/ospf' },
          'ospf.troubleshoot': { label: 'OSPF Fehlersuche', lessonTopic: 'cisco-packet-tracer/ospf' },
        },
      },
      multilayer_switching: {
        label: 'Multilayer Switching',
        description: 'Layer-3-Switch, SVIs, Inter-VLAN-Routing ohne Router.',
        subskills: {
          svi_create: { label: 'SVI anlegen', lessonTopic: 'cisco-packet-tracer/multilayer-switching' },
          svi_ip: { label: 'SVI-IP konfigurieren', lessonTopic: 'cisco-packet-tracer/multilayer-switching' },
          ip_routing: { label: 'ip routing aktivieren', lessonTopic: 'cisco-packet-tracer/multilayer-switching' },
          routed_port: { label: 'Routed Port', lessonTopic: 'cisco-packet-tracer/multilayer-switching' },
          verify: { label: 'Multilayer-Switch verifizieren', lessonTopic: 'cisco-packet-tracer/multilayer-switching' },
          troubleshoot: { label: 'Multilayer-Switch Fehlersuche', lessonTopic: 'cisco-packet-tracer/multilayer-switching' },
        },
      },
      stp: {
        label: 'Spanning Tree',
        description: 'PVST+, Root Bridge, Portrollen, Path Cost.',
        subskills: {
          loop_problem: { label: 'Schleifenproblem erkennen', lessonTopic: 'cisco-packet-tracer/stp' },
          bridge_id: { label: 'Bridge ID', lessonTopic: 'cisco-packet-tracer/stp' },
          root_election: { label: 'Root-Wahl', lessonTopic: 'cisco-packet-tracer/stp' },
          root_primary_secondary: { label: 'Root Primary / Secondary', lessonTopic: 'cisco-packet-tracer/stp' },
          port_roles: { label: 'Portrollen erkennen', lessonTopic: 'cisco-packet-tracer/stp' },
          path_cost: { label: 'Path Cost und Priorität', lessonTopic: 'cisco-packet-tracer/stp' },
          port_states: { label: 'Port-States', lessonTopic: 'cisco-packet-tracer/stp' },
          portfast: { label: 'PortFast', lessonTopic: 'cisco-packet-tracer/stp' },
          bpdu_guard: { label: 'BPDU Guard', lessonTopic: 'cisco-packet-tracer/stp' },
          verify: { label: 'STP verifizieren', lessonTopic: 'cisco-packet-tracer/stp' },
          troubleshoot: { label: 'STP Fehlersuche', lessonTopic: 'cisco-packet-tracer/stp' },
        },
      },
      remote_administration: {
        label: 'Remote Administration',
        description: 'SSH-Konfiguration für sichere Fernwartung.',
        subskills: {
          telnet_vs_ssh: { label: 'Telnet vs. SSH', lessonTopic: 'cisco-packet-tracer/ssh' },
          hostname_domain_dependency: { label: 'Hostname/Domain-Abhängigkeit', lessonTopic: 'cisco-packet-tracer/ssh' },
          rsa_keys: { label: 'RSA-Schlüssel erzeugen', lessonTopic: 'cisco-packet-tracer/ssh' },
          ssh_version: { label: 'SSH-Version setzen', lessonTopic: 'cisco-packet-tracer/ssh' },
          local_user: { label: 'SSH lokaler Benutzer', lessonTopic: 'cisco-packet-tracer/ssh' },
          vty_login_local: { label: 'VTY login local', lessonTopic: 'cisco-packet-tracer/ssh' },
          vty_transport_ssh: { label: 'VTY transport input ssh', lessonTopic: 'cisco-packet-tracer/ssh' },
          management_svi: { label: 'Management-SVI', lessonTopic: 'cisco-packet-tracer/ssh' },
          ssh_connect: { label: 'SSH-Verbindung testen', lessonTopic: 'cisco-packet-tracer/ssh' },
          verify: { label: 'SSH verifizieren', lessonTopic: 'cisco-packet-tracer/ssh' },
          troubleshoot: { label: 'SSH Fehlersuche', lessonTopic: 'cisco-packet-tracer/ssh' },
        },
      },
      dhcp: {
        label: 'DHCP',
        description: 'DHCP Relay und Helper-Adresse.',
        subskills: {
          relay_concept: { label: 'DHCP-Relay Konzept', lessonTopic: 'cisco-packet-tracer/dhcp' },
          helper_address: { label: 'ip helper-address', lessonTopic: 'cisco-packet-tracer/dhcp' },
          relay_interface_choice: { label: 'Richtiges Relay-Interface wählen', lessonTopic: 'cisco-packet-tracer/dhcp' },
          server_simulation: { label: 'DHCP-Server/Client simulieren', lessonTopic: 'cisco-packet-tracer/dhcp' },
          verify: { label: 'DHCP verifizieren', lessonTopic: 'cisco-packet-tracer/dhcp' },
          troubleshoot: { label: 'DHCP Fehlersuche', lessonTopic: 'cisco-packet-tracer/dhcp' },
        },
      },
      acl: {
        label: 'ACL',
        description: 'Access Control Lists: standard, extended, named, numbered.',
        subskills: {
          first_match: { label: 'First-Match-Logik', lessonTopic: 'cisco-packet-tracer/acl' },
          implicit_deny: { label: 'Implicit Deny', lessonTopic: 'cisco-packet-tracer/acl' },
          wildcard: { label: 'Wildcard-Maske', lessonTopic: 'cisco-packet-tracer/acl' },
          host_any: { label: 'host / any', lessonTopic: 'cisco-packet-tracer/acl' },
          'standard.numbered': { label: 'Standard ACL nummeriert', lessonTopic: 'cisco-packet-tracer/acl' },
          'standard.named': { label: 'Standard ACL benannt', lessonTopic: 'cisco-packet-tracer/acl' },
          'standard.place_correctly': { label: 'Standard ACL richtig platzieren', lessonTopic: 'cisco-packet-tracer/acl' },
          'extended.numbered': { label: 'Extended ACL nummeriert', lessonTopic: 'cisco-packet-tracer/acl' },
          'extended.named': { label: 'Extended ACL benannt', lessonTopic: 'cisco-packet-tracer/acl' },
          'extended.protocol': { label: 'Extended ACL Protokoll', lessonTopic: 'cisco-packet-tracer/acl' },
          'extended.ports': { label: 'Extended ACL Ports', lessonTopic: 'cisco-packet-tracer/acl' },
          'extended.place_correctly': { label: 'Extended ACL richtig platzieren', lessonTopic: 'cisco-packet-tracer/acl' },
          direction_in_out: { label: 'in / out Richtung', lessonTopic: 'cisco-packet-tracer/acl' },
          bind_interface: { label: 'ACL an Interface binden', lessonTopic: 'cisco-packet-tracer/acl' },
          vty_access_class: { label: 'VTY access-class', lessonTopic: 'cisco-packet-tracer/acl' },
          sequence_editing: { label: 'ACL Sequence-Bearbeitung', lessonTopic: 'cisco-packet-tracer/acl' },
          established: { label: 'established-Keyword', lessonTopic: 'cisco-packet-tracer/acl' },
          verify: { label: 'ACL verifizieren', lessonTopic: 'cisco-packet-tracer/acl' },
          troubleshoot: { label: 'ACL Fehlersuche', lessonTopic: 'cisco-packet-tracer/acl' },
        },
      },
      packet_filter: {
        label: 'Stateful Packet Filtering',
        description: 'Stateless vs. Stateful, CBAC, ip inspect.',
        subskills: {
          stateless_concept: { label: 'Stateless Paketfilter', lessonTopic: 'cisco-packet-tracer/packet-filter' },
          stateful_concept: { label: 'Stateful Inspection Konzept', lessonTopic: 'cisco-packet-tracer/packet-filter' },
          return_traffic: { label: 'Rückverkehr erlauben', lessonTopic: 'cisco-packet-tracer/packet-filter' },
          cbac_inspect_rule: { label: 'CBAC inspect-Regel', lessonTopic: 'cisco-packet-tracer/packet-filter' },
          cbac_interface_binding: { label: 'CBAC an Interface binden', lessonTopic: 'cisco-packet-tracer/packet-filter' },
          session_state: { label: 'Session-State verstehen', lessonTopic: 'cisco-packet-tracer/packet-filter' },
          verify: { label: 'Paketfilter verifizieren', lessonTopic: 'cisco-packet-tracer/packet-filter' },
          troubleshoot: { label: 'Paketfilter Fehlersuche', lessonTopic: 'cisco-packet-tracer/packet-filter' },
        },
      },
      nat: {
        label: 'NAT / PAT',
        description: 'Static NAT, Dynamic NAT, PAT/Overload, Port Forwarding.',
        subskills: {
          inside_outside: { label: 'Inside/Outside-Interfaces', lessonTopic: 'cisco-packet-tracer/nat' },
          inside_local: { label: 'Inside Local', lessonTopic: 'cisco-packet-tracer/nat' },
          inside_global: { label: 'Inside Global', lessonTopic: 'cisco-packet-tracer/nat' },
          outside_local: { label: 'Outside Local', lessonTopic: 'cisco-packet-tracer/nat' },
          outside_global: { label: 'Outside Global', lessonTopic: 'cisco-packet-tracer/nat' },
          'static.configure': { label: 'Statisches NAT konfigurieren', lessonTopic: 'cisco-packet-tracer/nat' },
          'dynamic.acl_selection': { label: 'Dynamic NAT ACL-Auswahl', lessonTopic: 'cisco-packet-tracer/nat' },
          'dynamic.pool': { label: 'Dynamic NAT Pool', lessonTopic: 'cisco-packet-tracer/nat' },
          'dynamic.configure': { label: 'Dynamic NAT konfigurieren', lessonTopic: 'cisco-packet-tracer/nat' },
          'dynamic.pool_exhaustion': { label: 'Dynamic NAT Pool-Exhaustion', lessonTopic: 'cisco-packet-tracer/nat' },
          'pat.interface_overload': { label: 'PAT über Interface (overload)', lessonTopic: 'cisco-packet-tracer/nat' },
          'pat.pool_overload': { label: 'PAT über Pool (overload)', lessonTopic: 'cisco-packet-tracer/nat' },
          'pat.concept': { label: 'PAT Konzept', lessonTopic: 'cisco-packet-tracer/nat' },
          port_forwarding: { label: 'Port Forwarding', lessonTopic: 'cisco-packet-tracer/nat' },
          translation_table: { label: 'NAT Translation Table', lessonTopic: 'cisco-packet-tracer/nat' },
          statistics: { label: 'NAT Statistics', lessonTopic: 'cisco-packet-tracer/nat' },
          clear_translation: { label: 'NAT Translation löschen', lessonTopic: 'cisco-packet-tracer/nat' },
          verify: { label: 'NAT verifizieren', lessonTopic: 'cisco-packet-tracer/nat' },
          troubleshoot: { label: 'NAT Fehlersuche', lessonTopic: 'cisco-packet-tracer/nat' },
        },
      },
      verification: {
        label: 'Verification',
        description: 'Meta-Kompetenz: richtigen show-Befehl wählen und interpretieren.',
        subskills: {
          choose_correct_show_command: { label: 'Richtigen show-Befehl wählen', lessonTopic: 'cisco-packet-tracer/troubleshooting' },
          interpret_output: { label: 'Ausgabe interpretieren', lessonTopic: 'cisco-packet-tracer/troubleshooting' },
          systematic_testing: { label: 'Systematisch testen', lessonTopic: 'cisco-packet-tracer/troubleshooting' },
        },
      },
    },
  },
};

// Default per-subskill record.  Numeric fields are kept between 0 and 1
// where 0 means "never succeeded" and 1 means "fully secure without help".
function defaultSubskill() {
  return {
    schemaVersion: SKILL_TREE_SCHEMA_VERSION,
    state: COMPETENCY_STATE.UNSEEN,
    exposureCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    hintCount: 0,
    solutionRevealedCount: 0,
    cliErrorCount: 0,
    repeatedErrorCount: 0,
    lastSuccessfulAt: null,
    lastAttemptAt: null,
    mastery: 0,
    difficulty: 1,
    successWithoutHelpStreak: 0,
    // Per-dimension mastery: knowledge / configure / verify / troubleshoot
    dimensions: {
      [SKILL_DIMENSION.KNOWLEDGE]: { mastery: 0, attempts: 0, correct: 0, lastAt: null },
      [SKILL_DIMENSION.CONFIGURE]: { mastery: 0, attempts: 0, correct: 0, lastAt: null },
      [SKILL_DIMENSION.VERIFY]: { mastery: 0, attempts: 0, correct: 0, lastAt: null },
      [SKILL_DIMENSION.TROUBLESHOOT]: { mastery: 0, attempts: 0, correct: 0, lastAt: null },
    },
    misconceptions: {},
  };
}

export function readSkillTree() {
  try {
    const raw = localStorage.getItem(SKILL_TREE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && parsed.schemaVersion === SKILL_TREE_SCHEMA_VERSION) return parsed;
    return migrateSkillTree(parsed || {});
  } catch {
    return {};
  }
}

function writeSkillTree(data) {
  const toWrite = { ...data, schemaVersion: SKILL_TREE_SCHEMA_VERSION };
  localStorage.setItem(SKILL_TREE_KEY, JSON.stringify(toWrite));
  window.dispatchEvent(new Event('cyberlearn:skill-tree-changed'));
}

function migrateSkillTree(old) {
  // Phase 0.5 migration: old records used a flat structure without
  // dimensions.  We keep whatever numeric history we can, but we reset
  // per-dimension mastery to a neutral starting point because the old
  // subskill IDs do not map 1:1 to the new granular IDs.
  const fresh = { schemaVersion: SKILL_TREE_SCHEMA_VERSION };

  Object.entries(old).forEach(([path, record]) => {
    if (typeof record !== 'object' || record === null) return;
    if (path.includes('.') && SKILL_TREE.cisco.skills[path.split('.')[1]]) {
      // Old direct skill.* records cannot be mapped cleanly; skip them.
      return;
    }
    fresh[path] = {
      ...defaultSubskill(),
      exposureCount: record.exposureCount || 0,
      correctCount: record.correctCount || 0,
      incorrectCount: record.incorrectCount || 0,
      hintCount: record.hintCount || 0,
      solutionRevealedCount: record.solutionRevealedCount || 0,
      cliErrorCount: record.cliErrorCount || 0,
      repeatedErrorCount: record.repeatedErrorCount || 0,
      lastSuccessfulAt: record.lastSuccessfulAt || null,
      lastAttemptAt: record.lastAttemptAt || null,
      // Old mastery is kept as overall starting point; dimensions remain 0
      // until the new granular skill is trained.
      mastery: typeof record.mastery === 'number' ? record.mastery : 0,
      misconceptions: record.misconceptions || {},
    };
  });

  return fresh;
}

export function readSkillEvents() {
  try {
    return JSON.parse(localStorage.getItem(SKILL_EVENTS_KEY)) || [];
  } catch {
    return [];
  }
}

function writeSkillEvents(events) {
  localStorage.setItem(SKILL_EVENTS_KEY, JSON.stringify(events.slice(-2000)));
}

export function skillPath(domainId, skillId, subskillId) {
  return `${domainId}.${skillId}.${subskillId}`;
}

function ensureSubskill(data, domainId, skillId, subskillId) {
  const path = skillPath(domainId, skillId, subskillId);
  if (!data[path]) data[path] = defaultSubskill();
  return data[path];
}

export function getSubskill(domainId, skillId, subskillId) {
  const data = readSkillTree();
  return { ...defaultSubskill(), ...ensureSubskill(data, domainId, skillId, subskillId) };
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function updateDimensionMastery(dimensionRecord, correct, usedHint, revealedSolution, difficulty, responseTimeMs) {
  if (revealedSolution) {
    // Do not count as independent mastery.
    return dimensionRecord;
  }

  const alpha = dimensionRecord.attempts < 5 ? 0.28 : 0.16;
  const helpPenalty = usedHint ? 0.72 : 1;
  const difficultyWeight = (difficulty || 2) / 5;
  const speedBonus = responseTimeMs && responseTimeMs < 8000 ? 0.08 : 0;

  const evidence = (correct ? 1 : 0) * helpPenalty * difficultyWeight + speedBonus;
  const next = { ...dimensionRecord };
  next.attempts += 1;
  if (correct) next.correct += 1;
  next.mastery = clamp(dimensionRecord.mastery * (1 - alpha) + evidence * alpha);
  next.lastAt = Date.now();
  return next;
}

function updateOverallMastery(sub) {
  const dims = Object.values(sub.dimensions);
  const dimMastery = dims.reduce((sum, d) => sum + d.mastery, 0) / dims.length;
  const totalAttempts = sub.correctCount + sub.incorrectCount;
  const accuracy = totalAttempts > 0 ? sub.correctCount / totalAttempts : 0;
  const helpRatio = sub.exposureCount > 0 ? (sub.hintCount + sub.solutionRevealedCount) / sub.exposureCount : 0;
  const streakFactor = Math.min(1, sub.successWithoutHelpStreak / 3 + 0.2);
  sub.mastery = clamp((dimMastery * 0.5 + accuracy * 0.5) * (1 - helpRatio * 0.5) * streakFactor);
  return sub;
}

function advanceState(sub) {
  if (sub.state === COMPETENCY_STATE.UNSEEN) sub.state = COMPETENCY_STATE.INTRODUCED;
  if (sub.state === COMPETENCY_STATE.INTRODUCED && sub.correctCount >= 1) sub.state = COMPETENCY_STATE.PRACTICING;
  if (sub.state === COMPETENCY_STATE.PRACTICING && sub.mastery >= 0.6) sub.state = COMPETENCY_STATE.MOSTLY_SECURE;
  if (sub.mastery >= 0.85) sub.state = COMPETENCY_STATE.SECURE;

  if (sub.lastSuccessfulAt && Date.now() - sub.lastSuccessfulAt > 7 * 24 * 60 * 60 * 1000 && sub.mastery < 0.85) {
    sub.state = COMPETENCY_STATE.REVIEW_DUE;
  }
  return sub;
}

// Record a learning/practice event for a subskill.
// This is the central entry point used by missions, CLI tasks and quizzes.
export function recordSkillEvent(domainId, skillId, subskillId, event) {
  const data = readSkillTree();
  const sub = ensureSubskill(data, domainId, skillId, subskillId);

  const dimension = event.dimension || SKILL_DIMENSION.KNOWLEDGE;
  if (!sub.dimensions[dimension]) sub.dimensions[dimension] = { mastery: 0, attempts: 0, correct: 0, lastAt: null };

  sub.lastAttemptAt = Date.now();
  sub.exposureCount += 1;

  if (event.revealedSolution) {
    sub.solutionRevealedCount += 1;
    if (sub.state === COMPETENCY_STATE.UNSEEN) sub.state = COMPETENCY_STATE.INTRODUCED;
    // Solution reveal does not increase dimension mastery.
  } else if (event.correct) {
    sub.correctCount += 1;
    sub.successWithoutHelpStreak = event.usedHint ? 0 : sub.successWithoutHelpStreak + 1;
    sub.lastSuccessfulAt = Date.now();
    if (event.usedHint) sub.hintCount += 1;
  } else {
    sub.incorrectCount += 1;
    sub.successWithoutHelpStreak = 0;
    if (event.usedHint) sub.hintCount += 1;
    if (event.cliError) sub.cliErrorCount += 1;
    if (event.misconception) {
      sub.misconceptions[event.misconception] = (sub.misconceptions[event.misconception] || 0) + 1;
      sub.repeatedErrorCount += 1;
    }
  }

  sub.dimensions[dimension] = updateDimensionMastery(
    sub.dimensions[dimension],
    event.correct,
    event.usedHint,
    event.revealedSolution,
    event.difficulty,
    event.responseTimeMs,
  );

  updateOverallMastery(sub);
  advanceState(sub);

  writeSkillTree(data);

  const events = readSkillEvents();
  events.push({
    at: Date.now(),
    skillPath: skillPath(domainId, skillId, subskillId),
    domainId,
    skillId,
    subskillId,
    dimension,
    correct: !!event.correct,
    difficulty: event.difficulty || 2,
    attempts: event.attempts || 1,
    usedHint: !!event.usedHint,
    hintLevel: event.hintLevel || null,
    revealedSolution: !!event.revealedSolution,
    cliError: !!event.cliError,
    misconception: event.misconception || null,
    responseTimeMs: event.responseTimeMs || null,
    source: event.source || SKILL_SOURCE.ACADEMY,
    missionId: event.missionId || null,
    taskId: event.taskId || null,
  });
  writeSkillEvents(events);

  return sub;
}

// Map an Academy lesson topic to the concrete subskills it trains.
export function subskillsForLessonTopic(lessonTopic, dimension = null) {
  const matches = [];
  Object.entries(SKILL_TREE).forEach(([domainId, domain]) => {
    Object.entries(domain.skills).forEach(([skillId, skill]) => {
      Object.entries(skill.subskills).forEach(([subskillId, subskill]) => {
        if (subskill.lessonTopic === lessonTopic) {
          matches.push({
            domainId,
            skillId,
            subskillId,
            label: subskill.label,
            dimension: dimension || SKILL_DIMENSION.KNOWLEDGE,
          });
        }
      });
    });
  });
  return matches;
}

function dimensionWeakness(record, dimension) {
  const dim = record.dimensions[dimension];
  if (!dim) return 1;
  // Prefer dimensions that have not been practiced yet.
  if (dim.attempts === 0) return 0.3;
  return dim.mastery;
}

export function nextSubskillForPractice(domainId = 'cisco', options = {}) {
  const {
    preferUnseen = true,
    excludeSecure = true,
    dimension = null,
    focusSkillId = null,
  } = options;

  const data = readSkillTree();
  const domain = SKILL_TREE[domainId];
  if (!domain) return null;

  const candidates = [];
  Object.entries(domain.skills).forEach(([skillId, skill]) => {
    if (focusSkillId && skillId !== focusSkillId) return;
    Object.entries(skill.subskills).forEach(([subskillId, subskill]) => {
      const record = ensureSubskill(data, domainId, skillId, subskillId);
      if (excludeSecure && record.state === COMPETENCY_STATE.SECURE) return;

      const dimMastery = dimension ? dimensionWeakness(record, dimension) : record.mastery;
      const priority = record.state === COMPETENCY_STATE.UNSEEN && preferUnseen ? 0
        : record.state === COMPETENCY_STATE.REVIEW_DUE ? 1
        : record.state === COMPETENCY_STATE.PRACTICING ? 2
        : 3;

      candidates.push({
        domainId,
        skillId,
        subskillId,
        path: skillPath(domainId, skillId, subskillId),
        label: subskill.label,
        dimension: dimension || SKILL_DIMENSION.KNOWLEDGE,
        priority,
        mastery: dimMastery,
        record,
      });
    });
  });

  candidates.sort((a, b) => a.priority - b.priority || a.mastery - b.mastery);
  return candidates[0] || null;
}

export function listAllSubskills(domainId = 'cisco') {
  const domain = SKILL_TREE[domainId];
  if (!domain) return [];
  const result = [];
  Object.entries(domain.skills).forEach(([skillId, skill]) => {
    Object.entries(skill.subskills).forEach(([subskillId, subskill]) => {
      result.push({
        domainId,
        skillId,
        subskillId,
        path: skillPath(domainId, skillId, subskillId),
        label: subskill.label,
        lessonTopic: subskill.lessonTopic,
        skillLabel: skill.label,
      });
    });
  });
  return result;
}

export function listSkillIds(domainId = 'cisco') {
  const all = listAllSubskills(domainId);
  return all.map((s) => s.path);
}

// Development helper: dump the current skill state for debugging.
export function skillStateDebug(domainId = 'cisco') {
  const data = readSkillTree();
  const all = listAllSubskills(domainId);
  return all.map((s) => {
    const record = data[s.path] || defaultSubskill();
    return {
      ...s,
      state: record.state,
      mastery: record.mastery,
      dimensions: record.dimensions,
    };
  });
}
