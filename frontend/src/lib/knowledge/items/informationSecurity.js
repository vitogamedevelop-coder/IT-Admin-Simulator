// =============================================================================
// Knowledge Items – Informationssicherheit
//
// Source: Academy course notes (Informationssicherheit module)
// =============================================================================

import { topicKey } from '../../academyTopics.js';
import { KNOWLEDGE_TYPES, QUESTION_ARCHETYPES, DIFFICULTY } from '../types.js';

// ---------------------------------------------------------------------------
// Topic keys
// ---------------------------------------------------------------------------

const SECURITY_FUNDAMENTALS_KEY = topicKey('information-security', 'security-fundamentals');
const SECURITY_OBJECTIVES_KEY = topicKey('information-security', 'security-objectives');
const AUTHENTICITY_KEY = topicKey('information-security', 'authenticity');
const PIMO_KEY = topicKey('information-security', 'pimo');
const OPTI_KEY = topicKey('information-security', 'opti');
const ISMS_KEY = topicKey('information-security', 'isms');
const PDCA_KEY = topicKey('information-security', 'pdca');
const REQUIRED_LEVEL_KEY = topicKey('information-security', 'required-level');
const DATA_PROTECTION_KEY = topicKey('information-security', 'data-protection');
const ART9_KEY = topicKey('information-security', 'art9-dsgvo');
const INFO_CATEGORIES_KEY = topicKey('information-security', 'information-categories');
const SECURITY_INCIDENTS_KEY = topicKey('information-security', 'security-incidents');
const ATTACKS_KEY = topicKey('information-security', 'attacks');
const MALWARE_TYPES_KEY = topicKey('information-security', 'malware-types');
const MALWARE_PREVENTION_KEY = topicKey('information-security', 'malware-prevention');
const FIREWALL_TYPES_KEY = topicKey('information-security', 'firewall-types');
const DMZ_KEY = topicKey('information-security', 'dmz');
const IDS_IPS_KEY = topicKey('information-security', 'ids-ips');
const ALLOWLIST_DENYLIST_KEY = topicKey('information-security', 'allowlist-denylist');

// ---------------------------------------------------------------------------
// Siblings helper
// ---------------------------------------------------------------------------

const CIA_SIBLINGS = [
  'security.cia.confidentiality',
  'security.cia.integrity',
  'security.cia.availability',
  'security.cia.interaction',
  'security.cia.measureMapping',
  'security.cia.definition',
];

const PIMO_SIBLINGS = [
  'security.pimo.personell',
  'security.pimo.infrastrukturell',
  'security.pimo.materiell',
  'security.pimo.organisatorisch',
  'security.pimo.mapping',
];

const OPTI_SIBLINGS = [
  'security.opti.organisatorisch',
  'security.opti.personell',
  'security.opti.technisch',
  'security.opti.infrastrukturell',
  'security.opti.mapping',
];

const MALWARE_SIBLINGS = [
  'security.malware.umbrella',
  'security.malware.virus',
  'security.malware.worm',
  'security.malware.trojan',
  'security.malware.ransomware',
  'security.malware.spyware',
  'security.malware.keylogger',
  'security.malware.rootkit',
  'security.malware.backdoor',
  'security.malware.payload',
  'security.malware.behaviorMapping',
];

const ATTACKS_SIBLINGS = [
  'security.attacks.dos',
  'security.attacks.identityTheft',
  'security.attacks.socialEngineering',
  'security.attacks.phishing',
  'security.attacks.goalMapping',
];

const FIREWALL_SIBLINGS = [
  'security.firewall.packetFilter',
  'security.firewall.stateful',
  'security.firewall.alg',
  'security.firewall.compare',
];

const IDS_IPS_SIBLINGS = [
  'security.ids.definition',
  'security.ips.definition',
  'security.idsips.compare',
];

const ALLOWLIST_SIBLINGS = [
  'security.allowlist.definition',
  'security.denylist.definition',
  'security.allowlist.compare',
];

const BREACH_INCIDENT_SIBLINGS = [
  'security.breach.definition',
  'security.incident.definition',
  'security.breachIncident.compare',
];

const DATENSCHUTZ_SIBLINGS = [
  'security.datenschutz.definition',
  'security.datenschutz.vsInfosec',
];

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

export const informationSecurityKnowledgeItems = [
  // ==========================================================================
  // Concept cluster: security.cia
  // ==========================================================================
  {
    id: 'security.cia.definition',
    topicKey: SECURITY_OBJECTIVES_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-grundwerte',
    conceptCluster: 'security.cia',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Informationssicherheit',
      definition: 'Informationssicherheit liegt vor, wenn Vertraulichkeit, Integrität und Verfügbarkeit im geforderten Maß gewährleistet werden.',
    },
    siblings: CIA_SIBLINGS.filter((id) => id !== 'security.cia.definition'),
  },
  {
    id: 'security.cia.confidentiality',
    topicKey: SECURITY_OBJECTIVES_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-grundwerte',
    conceptCluster: 'security.cia',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Vertraulichkeit',
      definition: 'Nur berechtigte Personen oder Prozesse d\u00FCrfen auf Informationen zugreifen.',
    },
    siblings: CIA_SIBLINGS.filter((id) => id !== 'security.cia.confidentiality'),
  },
  {
    id: 'security.cia.integrity',
    topicKey: SECURITY_OBJECTIVES_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-grundwerte',
    conceptCluster: 'security.cia',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Integrit\u00E4t',
      definition: 'Informationen und Systeme d\u00FCrfen nicht unzul\u00E4ssig oder unbemerkt ver\u00E4ndert werden.',
    },
    siblings: CIA_SIBLINGS.filter((id) => id !== 'security.cia.integrity'),
  },
  {
    id: 'security.cia.availability',
    topicKey: SECURITY_OBJECTIVES_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-grundwerte',
    conceptCluster: 'security.cia',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Verf\u00FCgbarkeit',
      definition: 'Informationen und Systeme stehen berechtigten Nutzern zum ben\u00F6tigten Zeitpunkt in erforderlicher Form zur Verf\u00FCgung.',
    },
    siblings: CIA_SIBLINGS.filter((id) => id !== 'security.cia.availability'),
  },
  {
    id: 'security.cia.interaction',
    topicKey: SECURITY_OBJECTIVES_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-wechselwirkung',
    conceptCluster: 'security.cia',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST, QUESTION_ARCHETYPES.RECALL],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      subject: 'Wechselwirkung der Grundwerte',
      description: 'Eine Ma\u00DFnahme oder Gef\u00E4hrdung kann mehrere Schutzziele gleichzeitig betreffen.',
    },
    siblings: CIA_SIBLINGS.filter((id) => id !== 'security.cia.interaction'),
  },
  {
    id: 'security.cia.measureMapping',
    topicKey: SECURITY_OBJECTIVES_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-wechselwirkung',
    conceptCluster: 'security.cia',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      subject: 'Ma\u00DFnahmen zu Schutzzielen',
      description: 'Zuordnung von Sicherheitsma\u00DFnahmen zu den prim\u00E4r gesch\u00FCtzten Schutzzielen.',
      pairs: [
        { key: 'Verschl\u00FCsselung', value: 'Vertraulichkeit' },
        { key: 'Redundanz', value: 'Verf\u00FCgbarkeit' },
        { key: 'Hash / Signatur', value: 'Integrit\u00E4t' },
        { key: 'Firewall', value: 'Kontrolle (u. a. Vertraulichkeit/Integrit\u00E4t)' },
        { key: 'Backup', value: 'Verf\u00FCgbarkeit' },
      ],
    },
    siblings: CIA_SIBLINGS.filter((id) => id !== 'security.cia.measureMapping'),
  },

  {
    id: 'security.cia.authenticity',
    topicKey: AUTHENTICITY_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-authentizitaet',
    conceptCluster: 'security.cia',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Authentizität',
      definition: 'Echtheit und Zuordenbarkeit: Von wem stammt etwas, und wer hat gehandelt? Im Kursmodell wird Authentizität im Zusammenhang mit Integrität betrachtet.',
    },
    siblings: ['security.cia.integrity'],
  },

  // ==========================================================================
  // Concept cluster: security.pimo
  // ==========================================================================
  {
    id: 'security.pimo.personell',
    topicKey: PIMO_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-pimo',
    conceptCluster: 'security.pimo',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'PIMO \u2013 personell',
      definition: 'Personelle Elemente des IT-Systems: Nutzer, Administratoren, F\u00FChrungspersonal, Sicherheitsrollen.',
    },
    siblings: PIMO_SIBLINGS.filter((id) => id !== 'security.pimo.personell'),
  },
  {
    id: 'security.pimo.infrastrukturell',
    topicKey: PIMO_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-pimo',
    conceptCluster: 'security.pimo',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'PIMO \u2013 infrastrukturell',
      definition: 'Infrastrukturelle Elemente: Geb\u00E4ude, Serverr\u00E4ume, Sicherheitsbereiche, Versorgung.',
    },
    siblings: PIMO_SIBLINGS.filter((id) => id !== 'security.pimo.infrastrukturell'),
  },
  {
    id: 'security.pimo.materiell',
    topicKey: PIMO_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-pimo',
    conceptCluster: 'security.pimo',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'PIMO \u2013 materiell',
      definition: 'Materielle Elemente: Server, Clients, Router, Switches, Datentr\u00E4ger, sonstige Ger\u00E4te.',
    },
    siblings: PIMO_SIBLINGS.filter((id) => id !== 'security.pimo.materiell'),
  },
  {
    id: 'security.pimo.organisatorisch',
    topicKey: PIMO_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-pimo',
    conceptCluster: 'security.pimo',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'PIMO \u2013 organisatorisch',
      definition: 'Organisatorische Elemente: Prozesse, Zust\u00E4ndigkeiten, Regelungen, Verfahren.',
    },
    siblings: PIMO_SIBLINGS.filter((id) => id !== 'security.pimo.organisatorisch'),
  },
  {
    id: 'security.pimo.mapping',
    topicKey: PIMO_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-pimo',
    conceptCluster: 'security.pimo',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['technical', 'management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      subject: 'PIMO-Kategorien',
      description: 'Zuordnung von Beispielen zu den vier PIMO-Kategorien.',
      pairs: [
        { key: 'Nutzer und Administratoren', value: 'personell' },
        { key: 'Serverr\u00E4ume und Geb\u00E4ude', value: 'infrastrukturell' },
        { key: 'Server und Switches', value: 'materiell' },
        { key: 'Prozesse und Regelungen', value: 'organisatorisch' },
      ],
    },
    siblings: PIMO_SIBLINGS.filter((id) => id !== 'security.pimo.mapping'),
  },

  // ==========================================================================
  // Concept cluster: security.opti
  // ==========================================================================
  {
    id: 'security.opti.organisatorisch',
    topicKey: OPTI_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-opti',
    conceptCluster: 'security.opti',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['management', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'OPTI \u2013 organisatorisch',
      definition: 'Organisatorische Ma\u00DFnahme: Regeln, Prozesse, Berechtigungskonzepte, Zutritts-/Zugriffsregelungen, Meldewege, Richtlinien.',
    },
    siblings: OPTI_SIBLINGS.filter((id) => id !== 'security.opti.organisatorisch'),
  },
  {
    id: 'security.opti.personell',
    topicKey: OPTI_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-opti',
    conceptCluster: 'security.opti',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['management', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'OPTI \u2013 personell',
      definition: 'Personelle Ma\u00DFnahme: Ausbildung, Weiterbildung, Sensibilisierung, Belehrung, geeignete Rollenbesetzung.',
    },
    siblings: OPTI_SIBLINGS.filter((id) => id !== 'security.opti.personell'),
  },
  {
    id: 'security.opti.technisch',
    topicKey: OPTI_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-opti',
    conceptCluster: 'security.opti',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['management', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'OPTI \u2013 technisch',
      definition: 'Technische Ma\u00DFnahme: Authentisierung, Verschl\u00FCsselung, Firewall, IDS/IPS, Redundanz, Zugriffskontrolle.',
    },
    siblings: OPTI_SIBLINGS.filter((id) => id !== 'security.opti.technisch'),
  },
  {
    id: 'security.opti.infrastrukturell',
    topicKey: OPTI_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-opti',
    conceptCluster: 'security.opti',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['management', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'OPTI \u2013 infrastrukturell',
      definition: 'Infrastrukturelle Ma\u00DFnahme: Sicherheitsbereiche, bauliche Schutzma\u00DFnahmen, physischer Zutrittsschutz.',
    },
    siblings: OPTI_SIBLINGS.filter((id) => id !== 'security.opti.infrastrukturell'),
  },
  {
    id: 'security.opti.mapping',
    topicKey: OPTI_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-opti',
    conceptCluster: 'security.opti',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['management', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      subject: 'OPTI-Ma\u00DFnahmenarten',
      description: 'Zuordnung von Beispielen zu den vier OPTI-Ma\u00DFnahmenarten.',
      pairs: [
        { key: 'Firewall und Verschl\u00FCsselung', value: 'technisch' },
        { key: 'Schulungen und Sensibilisierung', value: 'personell' },
        { key: 'Sicherheitsbereiche und Zutrittsschutz', value: 'infrastrukturell' },
        { key: 'Richtlinien und Meldewege', value: 'organisatorisch' },
      ],
    },
    siblings: OPTI_SIBLINGS.filter((id) => id !== 'security.opti.mapping'),
  },

  // PIMO vs OPTI compare (sits between opti and pimo clusters)
  {
    id: 'security.pimoVsOpti',
    topicKey: OPTI_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-pimo-vs-opti',
    conceptCluster: 'security.opti',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['management', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      description: 'PIMO beschreibt Betrachtungsobjekte, OPTI die Schutzma\u00DFnahmenarten.',
      items: [
        { name: 'PIMO', description: 'Welche Elemente/Bestandteile des IT-Systems betrachte ich?', compareOn: 'description' },
        { name: 'OPTI', description: 'Mit welchen Arten von Ma\u00DFnahmen sch\u00FCtze ich die Elemente?', compareOn: 'description' },
      ],
    },
    siblings: [],
  },

  // ==========================================================================
  // Concept cluster: security.isms
  // ==========================================================================
  {
    id: 'security.isms.definition',
    topicKey: ISMS_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-isms-pdca',
    conceptCluster: 'security.isms',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'ISMS',
      definition: 'Informationssicherheits-Managementsystem: ein System, um Informationssicherheit zu planen, umzusetzen, zu kontrollieren, aufrechtzuerhalten und kontinuierlich zu verbessern.',
      distractorDefinitions: [
        'Ein einzelnes Sicherheitsprodukt, das alle Angriffe abwehrt.',
        'Ein Verzeichnis aller Passwörter in einer Organisation.',
        'Eine Liste der zugelassenen Software-Lizenzen.',
      ],
    },
    siblings: [],
  },

  // ==========================================================================
  // Concept cluster: security.pdca
  // ==========================================================================
  {
    id: 'security.pdca.order',
    topicKey: PDCA_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-isms-pdca',
    conceptCluster: 'security.pdca',
    type: KNOWLEDGE_TYPES.ORDER,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.ORDERING],
    roleHints: ['management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      description: 'Der PDCA-Zyklus zur kontinuierlichen Verbesserung.',
      steps: [
        { id: 'plan', label: 'PLAN \u2013 Risiken, Ziele und Ma\u00DFnahmen festlegen' },
        { id: 'do', label: 'DO \u2013 Ma\u00DFnahmen umsetzen und betreiben' },
        { id: 'check', label: 'CHECK \u2013 Wirksamkeit pr\u00FCfen und auditieren' },
        { id: 'act', label: 'ACT \u2013 Abweichungen behandeln und verbessern' },
      ],
    },
    siblings: [],
  },

  {
    id: 'security.pdca.adminRole',
    topicKey: PDCA_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-adminrolle',
    conceptCluster: 'security.pdca',
    type: KNOWLEDGE_TYPES.PROPERTY,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      subject: 'Administratorrolle im PDCA-Zyklus',
      statement: 'Administratoren wirken besonders in DO, indem sie geplante technische Maßnahmen umsetzen, und liefern Betriebsinformationen für CHECK und ACT.',
      description: 'Administratoren setzen geplante technische Maßnahmen praktisch um und unterstützen die fortlaufende Verbesserung.',
    },
    siblings: ['security.pdca.order'],
  },

  // ==========================================================================
  // Concept cluster: security.requiredLevel
  // ==========================================================================
  {
    id: 'security.requiredLevel.definition',
    topicKey: REQUIRED_LEVEL_KEY,
    sourceTopicKey: SECURITY_FUNDAMENTALS_KEY,
    sourceSection: 'b1-gefordertes-mass',
    conceptCluster: 'security.requiredLevel',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['management', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Gefordertes Ma\u00DF',
      definition: 'Sicherheitsma\u00DFnahmen m\u00FCssen zum festgestellten Schutzbedarf und Risiko angemessen sein; nicht maximale Sicherheit um jeden Preis.',
      distractorDefinitions: [
        'Jede Information muss mit maximal möglicher Sicherheit um jeden Preis geschützt werden.',
        'Nur Verschlusssachen brauchen Sicherheitsmaßnahmen.',
        'Der günstigste Sicherheitsansatz wird immer gewählt.',
      ],
    },
    siblings: [],
  },

  // ==========================================================================
  // Concept cluster: security.datenschutz
  // ==========================================================================
  {
    id: 'security.datenschutz.definition',
    topicKey: DATA_PROTECTION_KEY,
    sourceTopicKey: DATA_PROTECTION_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.datenschutz',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['support', 'management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Datenschutz',
      definition: 'Schutz nat\u00FCrlicher Personen bei der Verarbeitung personenbezogener Daten.',
    },
    siblings: DATENSCHUTZ_SIBLINGS.filter((id) => id !== 'security.datenschutz.definition'),
  },
  {
    id: 'security.datenschutz.vsInfosec',
    topicKey: DATA_PROTECTION_KEY,
    sourceTopicKey: DATA_PROTECTION_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.datenschutz',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['support', 'management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      description: 'Datenschutz und Informationssicherheit sind verwandt, aber nicht identisch.',
      items: [
        { name: 'Datenschutz', description: 'Schutz nat\u00FCrlicher Personen bei der Verarbeitung personenbezogener Daten.' },
        { name: 'Informationssicherheit', description: 'Schutz von Informationen hinsichtlich ihrer Sicherheitsziele.' },
      ],
    },
    siblings: DATENSCHUTZ_SIBLINGS.filter((id) => id !== 'security.datenschutz.vsInfosec'),
  },

  // ==========================================================================
  // Concept cluster: security.schutzbereiche
  // ==========================================================================
  {
    id: 'security.schutzbereiche.mapping',
    topicKey: DATA_PROTECTION_KEY,
    sourceTopicKey: DATA_PROTECTION_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.schutzbereiche',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['support', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'course_specific',
    data: {
      subject: 'Schutzbereiche personenbezogener Daten',
      description: 'Zuordnung der Schutzbereiche zu ihren Inhalten.',
      pairs: [
        { key: 'Schutzbereich 1', value: 'Funktionstr\u00E4gerdaten wie Name, Dienstgrad, Funktion, dienstliche E-Mail, Personalnummer' },
        { key: 'Schutzbereich 2', value: 'Sonstige personenbezogene Daten, die nicht SB 1 oder 3 zugeordnet sind' },
        { key: 'Schutzbereich 3', value: 'Besonders sch\u00FCtzenswerte Daten: Beurteilungen, Sicherheitsakten, Disziplinarakten, Verurteilungen, besondere personenbezogene Daten' },
      ],
    },
    siblings: [],
  },

  // ==========================================================================
  // Concept cluster: security.art9
  // ==========================================================================
  {
    id: 'security.art9.categories',
    topicKey: ART9_KEY,
    sourceTopicKey: ART9_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.art9',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['support', 'management'],
    sourceType: 'eu_law',
    verificationStatus: 'verified',
    data: {
      subject: 'Art. 9 DSGVO Kategorien',
      description: 'Besondere Kategorien personenbezogener Daten gem\u00E4\u00DF Art. 9 DSGVO.',
      pairs: [
        { key: 'rassische/ethnische Herkunft', value: 'besondere Kategorie personenbezogener Daten' },
        { key: 'politische Meinungen', value: 'besondere Kategorie personenbezogener Daten' },
        { key: 'religi\u00F6se/weltanschauliche \u00DCberzeugungen', value: 'besondere Kategorie personenbezogener Daten' },
        { key: 'Gewerkschaftszugeh\u00F6rigkeit', value: 'besondere Kategorie personenbezogener Daten' },
        { key: 'genetische/biometrische Daten (Identifikation)', value: 'besondere Kategorie personenbezogener Daten' },
        { key: 'Gesundheitsdaten', value: 'besondere Kategorie personenbezogener Daten' },
        { key: 'Sexualleben/orientierung', value: 'besondere Kategorie personenbezogener Daten' },
      ],
    },
    siblings: [],
  },

  // ==========================================================================
  // Concept cluster: security.infoCategories
  // ==========================================================================
  {
    id: 'security.infoCategories.mapping',
    topicKey: INFO_CATEGORIES_KEY,
    sourceTopicKey: INFO_CATEGORIES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.infoCategories',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['management', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'needs_confirmation',
    data: {
      subject: 'Informationskategorien',
      description: 'Zuordnung der Informationskategorien zu ihrer Bedeutung.',
      pairs: [
        { key: '\u00D6ffentliche Informationen', value: 'F\u00FCr die \u00D6ffentlichkeit bestimmt' },
        { key: 'Offene Informationen', value: 'Intern, nicht \u00F6ffentlich, nicht geheimhaltungspflichtig' },
        { key: 'Verschlusssachen', value: 'Unterliegen Geheimhaltungsvorschriften' },
      ],
    },
    siblings: [],
  },

  // ==========================================================================
  // Concept cluster: security.breachIncident
  // ==========================================================================
  {
    id: 'security.breach.definition',
    topicKey: SECURITY_INCIDENTS_KEY,
    sourceTopicKey: SECURITY_INCIDENTS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.breachIncident',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['support', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'course_specific',
    data: {
      term: 'Informationssicherheitsversto\u00DF',
      definition: 'Versto\u00DF gegen Sicherheitsvorschriften oder -anforderungen.',
    },
    siblings: BREACH_INCIDENT_SIBLINGS.filter((id) => id !== 'security.breach.definition'),
  },
  {
    id: 'security.incident.definition',
    topicKey: SECURITY_INCIDENTS_KEY,
    sourceTopicKey: SECURITY_INCIDENTS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.breachIncident',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['support', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'course_specific',
    data: {
      term: 'Sicherheitsvorkommnis',
      definition: 'Ein Ereignis, das die Informationssicherheit negativ beeinflusst oder beeinflussen k\u00F6nnte.',
    },
    siblings: BREACH_INCIDENT_SIBLINGS.filter((id) => id !== 'security.incident.definition'),
  },
  {
    id: 'security.breachIncident.compare',
    topicKey: SECURITY_INCIDENTS_KEY,
    sourceTopicKey: SECURITY_INCIDENTS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.breachIncident',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['support', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      description: 'Versto\u00DF und Vorkommnis m\u00FCssen unterschieden, aber beide gemeldet werden.',
      items: [
        { name: 'Informationssicherheitsversto\u00DF', description: 'Regelversto\u00DF gegen Sicherheitsanforderungen.' },
        { name: 'Sicherheitsvorkommnis', description: 'Ereignis, das die Informationssicherheit negativ beeinflusst.' },
      ],
    },
    siblings: BREACH_INCIDENT_SIBLINGS.filter((id) => id !== 'security.breachIncident.compare'),
  },

  // ==========================================================================
  // Concept cluster: security.attacks
  // ==========================================================================
  {
    id: 'security.attacks.dos',
    topicKey: ATTACKS_KEY,
    sourceTopicKey: ATTACKS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.attacks',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Denial of Service (DoS)',
      definition: 'Ein Angriff, der einen Dienst oder ein System unerreichbar oder nur eingeschr\u00E4nkt verf\u00FCgbar macht.',
    },
    siblings: ATTACKS_SIBLINGS.filter((id) => id !== 'security.attacks.dos'),
  },
  {
    id: 'security.attacks.identityTheft',
    topicKey: ATTACKS_KEY,
    sourceTopicKey: ATTACKS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.attacks',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['support', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Identit\u00E4tsdiebstahl',
      definition: 'Angreifer missbraucht fremde Identit\u00E4ts- oder Zugangsinformationen.',
    },
    siblings: ATTACKS_SIBLINGS.filter((id) => id !== 'security.attacks.identityTheft'),
  },
  {
    id: 'security.attacks.socialEngineering',
    topicKey: ATTACKS_KEY,
    sourceTopicKey: ATTACKS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.attacks',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Social Engineering',
      definition: 'Manipulation von Menschen, um an Informationen oder Zug\u00E4nge zu gelangen.',
    },
    siblings: ATTACKS_SIBLINGS.filter((id) => id !== 'security.attacks.socialEngineering'),
  },
  {
    id: 'security.attacks.phishing',
    topicKey: ATTACKS_KEY,
    sourceTopicKey: ATTACKS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.attacks',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Phishing',
      definition: 'T\u00E4uschende Nachrichten, z. B. E-Mails, mit dem Ziel, Daten oder Zug\u00E4nge zu stehlen.',
    },
    siblings: ATTACKS_SIBLINGS.filter((id) => id !== 'security.attacks.phishing'),
  },
  {
    id: 'security.attacks.goalMapping',
    topicKey: ATTACKS_KEY,
    sourceTopicKey: ATTACKS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.attacks',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      subject: 'Angriffe zu Schutzzielen',
      description: 'Zuordnung von Angriffsarten zu den betroffenen Schutzzielen.',
      pairs: [
        { key: 'DoS/DDoS', value: 'Verf\u00FCgbarkeit' },
        { key: 'Phishing / Social Engineering', value: 'Vertraulichkeit' },
        { key: 'Identit\u00E4tsdiebstahl', value: 'Vertraulichkeit / Integrit\u00E4t' },
      ],
    },
    siblings: ATTACKS_SIBLINGS.filter((id) => id !== 'security.attacks.goalMapping'),
  },

  // ==========================================================================
  // Concept cluster: security.malware
  // ==========================================================================
  {
    id: 'security.malware.umbrella',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Malware',
      definition: 'Oberbegriff f\u00FCr Schadsoftware, die unerw\u00FCnschte oder sch\u00E4dliche Funktionen ausf\u00FChrt.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.umbrella'),
  },
  {
    id: 'security.malware.virus',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Virus',
      definition: 'Schadsoftware, die typischerweise einen Wirt braucht; infiziert Dateien oder Programme und wird bei deren Ausf\u00FChrung aktiv.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.virus'),
  },
  {
    id: 'security.malware.worm',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Wurm',
      definition: 'Schadsoftware, die sich selbstst\u00E4ndig \u00FCber Systeme und Netzwerke verbreiten kann.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.worm'),
  },
  {
    id: 'security.malware.trojan',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Trojaner',
      definition: 'Schadsoftware, die sich als legitime oder n\u00FCtzliche Software tarnt und im Hintergrund Schadfunktionen ausf\u00FChrt.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.trojan'),
  },
  {
    id: 'security.malware.ransomware',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Ransomware',
      definition: 'Schadsoftware, die Systeme blockiert oder Daten verschl\u00FCsselt und typischerweise L\u00F6segeld fordert.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.ransomware'),
  },
  {
    id: 'security.malware.spyware',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Spyware',
      definition: 'Schadsoftware, die Informationen oder Nutzerverhalten ausspioniert.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.spyware'),
  },
  {
    id: 'security.malware.keylogger',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Keylogger',
      definition: 'Funktion oder Schadsoftware, die Tastatureingaben aufzeichnet.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.keylogger'),
  },
  {
    id: 'security.malware.rootkit',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.HARD,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Rootkit',
      definition: 'Schadsoftware, die Schadaktivit\u00E4ten tief im System verbergen und dauerhaften Zugriff sichern soll.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.rootkit'),
  },
  {
    id: 'security.malware.backdoor',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Backdoor',
      definition: 'Versteckter, unautorisierter Zugang zu einem System.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.backdoor'),
  },
  {
    id: 'security.malware.payload',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Payload',
      definition: 'Die eigentliche Schadfunktion oder Nutzlast einer Malware.',
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.payload'),
  },
  {
    id: 'security.malware.behaviorMapping',
    topicKey: MALWARE_TYPES_KEY,
    sourceTopicKey: MALWARE_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.malware',
    type: KNOWLEDGE_TYPES.MAPPING,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.MATCHING, QUESTION_ARCHETYPES.MAPPING],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      subject: 'Malware-Typen zu typischem Verhalten',
      description: 'Zuordnung von typischem Verhalten zu Malware-Typen.',
      pairs: [
        { key: 'verbreitet sich selbstst\u00E4ndig', value: 'Wurm' },
        { key: 'tarnt sich als n\u00FCtzliche Software', value: 'Trojaner' },
        { key: 'verschl\u00FCsselt Daten und fordert L\u00F6segeld', value: 'Ransomware' },
        { key: 'zeichnet Tastatureingaben auf', value: 'Keylogger' },
        { key: 'versteckt Schadaktivit\u00E4ten tief im System', value: 'Rootkit' },
      ],
    },
    siblings: MALWARE_SIBLINGS.filter((id) => id !== 'security.malware.behaviorMapping'),
  },

  // ==========================================================================
  // Concept cluster: security.prevention
  // ==========================================================================
  {
    id: 'security.prevention.defenseInDepth',
    topicKey: MALWARE_PREVENTION_KEY,
    sourceTopicKey: MALWARE_PREVENTION_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.prevention',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security', 'management'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Defense in Depth',
      definition: 'Mehrere \u00FCbereinanderliegende Schutzma\u00DFnahmen, die sich erg\u00E4nzen, um Angriffe abzuwehren.',
      distractorDefinitions: [
        'Eine einzelne perfekte Sicherheitslösung, die alle Angriffe verhindert.',
        'Die ausschließliche Nutzung von Open-Source-Software.',
        'Ein regelmäßiger Wechsel aller Passwörter.',
      ],
    },
    siblings: [],
  },

  // ==========================================================================
  // Concept cluster: security.firewall
  // ==========================================================================
  {
    id: 'security.firewall.packetFilter',
    topicKey: FIREWALL_TYPES_KEY,
    sourceTopicKey: FIREWALL_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.firewall',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Paketfilter',
      definition: 'Firewall-Typ, die Verkehr anhand von Quell-/Zieladresse, Protokoll und Ports pr\u00FCft.',
    },
    siblings: FIREWALL_SIBLINGS.filter((id) => id !== 'security.firewall.packetFilter'),
  },
  {
    id: 'security.firewall.stateful',
    topicKey: FIREWALL_TYPES_KEY,
    sourceTopicKey: FIREWALL_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.firewall',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Stateful Inspection',
      definition: 'Firewall-Verfahren, das zus\u00E4tzlich den Zustand einer Verbindung ber\u00FCcksichtigt.',
    },
    siblings: FIREWALL_SIBLINGS.filter((id) => id !== 'security.firewall.stateful'),
  },
  {
    id: 'security.firewall.alg',
    topicKey: FIREWALL_TYPES_KEY,
    sourceTopicKey: FIREWALL_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.firewall',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Application Layer Gateway',
      definition: 'Proxy- oder anwendungsebene Komponente, die Protokollverkehr detaillierter pr\u00FCft als ein einfacher Paketfilter.',
    },
    siblings: FIREWALL_SIBLINGS.filter((id) => id !== 'security.firewall.alg'),
  },
  {
    id: 'security.firewall.compare',
    topicKey: FIREWALL_TYPES_KEY,
    sourceTopicKey: FIREWALL_TYPES_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.firewall',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      description: 'Firewall-Typen unterscheiden sich in der Tiefe der Verkehrspr\u00FCfung.',
      items: [
        { name: 'Paketfilter', description: 'Pr\u00FCft Adressen, Protokoll, Ports.' },
        { name: 'Stateful Inspection', description: 'Betrachtet zus\u00E4tzlich den Verbindungszustand.' },
        { name: 'Application Layer Gateway', description: 'Pr\u00FCft Verkehr bis auf Anwendungsebene oder vermittelt als Proxy.' },
      ],
    },
    siblings: FIREWALL_SIBLINGS.filter((id) => id !== 'security.firewall.compare'),
  },

  // ==========================================================================
  // Concept cluster: security.dmz
  // ==========================================================================
  {
    id: 'security.dmz.definition',
    topicKey: DMZ_KEY,
    sourceTopicKey: DMZ_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.dmz',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'course_specific',
    data: {
      term: 'DMZ',
      definition: 'Ein getrenntes Netzsegment f\u00FCr Systeme oder Dienste, die zwischen Netzen unterschiedlicher Vertrauensstufen stehen.',
      distractorDefinitions: [
        'Ein Software-Modul, das automatisch alle Malware-Arten entfernt.',
        'Ein zentrales Verzeichnis aller Benutzerkonten im Netzwerk.',
        'Eine Liste erlaubter E-Mail-Absender.',
      ],
    },
    siblings: [],
  },

  // ==========================================================================
  // Concept cluster: security.idsips
  // ==========================================================================
  {
    id: 'security.ids.definition',
    topicKey: IDS_IPS_KEY,
    sourceTopicKey: IDS_IPS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.idsips',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'IDS',
      definition: 'Intrusion Detection System: erkennt verd\u00E4chtige Aktivit\u00E4ten und meldet sie.',
    },
    siblings: IDS_IPS_SIBLINGS.filter((id) => id !== 'security.ids.definition'),
  },
  {
    id: 'security.ips.definition',
    topicKey: IDS_IPS_KEY,
    sourceTopicKey: IDS_IPS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.idsips',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'security'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'IPS',
      definition: 'Intrusion Prevention System: erkennt Angriffe und kann zus\u00E4tzlich aktiv blocken oder Gegenma\u00DFnahmen einleiten.',
    },
    siblings: IDS_IPS_SIBLINGS.filter((id) => id !== 'security.ips.definition'),
  },
  {
    id: 'security.idsips.compare',
    topicKey: IDS_IPS_KEY,
    sourceTopicKey: IDS_IPS_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.idsips',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      description: 'IDS erkennt, IPS erkennt und verhindert.',
      items: [
        { name: 'IDS', description: 'Erkennt und meldet Angriffe, greift aber nicht aktiv ein.' },
        { name: 'IPS', description: 'Erkennt Angriffe und kann sie blocken.' },
      ],
    },
    siblings: IDS_IPS_SIBLINGS.filter((id) => id !== 'security.idsips.compare'),
  },

  // ==========================================================================
  // Concept cluster: security.allowlist
  // ==========================================================================
  {
    id: 'security.allowlist.definition',
    topicKey: ALLOWLIST_DENYLIST_KEY,
    sourceTopicKey: ALLOWLIST_DENYLIST_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.allowlist',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Allowlist',
      definition: 'Nur explizit erlaubte Objekte oder Aktionen sind zugelassen.',
    },
    siblings: ALLOWLIST_SIBLINGS.filter((id) => id !== 'security.allowlist.definition'),
  },
  {
    id: 'security.denylist.definition',
    topicKey: ALLOWLIST_DENYLIST_KEY,
    sourceTopicKey: ALLOWLIST_DENYLIST_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.allowlist',
    type: KNOWLEDGE_TYPES.DEFINITION,
    difficulty: DIFFICULTY.EASY,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.RECALL, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      term: 'Denylist',
      definition: 'Bekannte, unerw\u00FCnschte Objekte oder Aktionen werden gesperrt.',
    },
    siblings: ALLOWLIST_SIBLINGS.filter((id) => id !== 'security.denylist.definition'),
  },
  {
    id: 'security.allowlist.compare',
    topicKey: ALLOWLIST_DENYLIST_KEY,
    sourceTopicKey: ALLOWLIST_DENYLIST_KEY,
    sourceSection: 'fundamentals',
    conceptCluster: 'security.allowlist',
    type: KNOWLEDGE_TYPES.COMPARE,
    difficulty: DIFFICULTY.MEDIUM,
    allowedQuestionTypes: [QUESTION_ARCHETYPES.COMPARE, QUESTION_ARCHETYPES.SELECT_BEST],
    roleHints: ['technical', 'support'],
    sourceType: 'academy_course_note',
    verificationStatus: 'verified',
    data: {
      description: 'Allowlist ist restriktiver als Denylist.',
      items: [
        { name: 'Allowlist', description: 'Nur explizit erlaubte Objekte/Aktionen sind zugelassen.' },
        { name: 'Denylist', description: 'Bekannte, unerw\u00FCnschte Objekte/Aktionen werden gesperrt.' },
      ],
    },
    siblings: ALLOWLIST_SIBLINGS.filter((id) => id !== 'security.allowlist.compare'),
  },
];
