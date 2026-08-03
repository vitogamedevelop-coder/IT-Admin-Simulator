// Diagnostic Quest Data Format
// Each quest is a non-linear investigation with phases, actions, hypotheses,
// and a knowledge entry that gets unlocked on completion.
// This structure is generic and reusable for future diagnostic quests.

export const diagnosticQuests = {
  'first-day': {
    id: 'first-day',
    chapter: 1,
    title: 'Der erste Arbeitstag',
    subtitle: 'Arbeitsplatz ohne Netzwerk',
    department: 'Helpdesk',
    difficulty: 1,
    minutes: 6,
    boss: false,
    briefing: '08:17 Uhr. Greta Müller aus der Buchhaltung ruft im Helpdesk an:\n\n„Ich komme nicht ins Internet und unser Drucker geht auch nicht. Seit heute Morgen.“\n\nDein erster Einsatz bei NEXUS Systems.',
    concept: 'Physische Netzwerkverbindung, DHCP und APIPA erkennen und strukturiert diagnostizieren.',
    unlockTools: ['nslookup', 'Test-NetConnection'],
    unlockNotebook: ['note-ipconfig', 'note-ping'],
    infrastructureEffect: { clients: 'online' },

    // Initial known facts the player starts with
    initialFacts: {
      person: 'Greta Müller',
      department: 'Buchhaltung',
      device: 'PC-BUCH-01',
      symptom: 'Kein Internet, Drucker geht nicht',
      othersAffected: null, // null = unknown
      linkStatus: null,
      ipConfig: null,
      dhcpStatus: null,
      gateway: null,
      dns: null,
      accountStatus: null,
    },

    // Labels for the facts panel
    factLabels: {
      person: 'Betroffene Person',
      department: 'Abteilung',
      device: 'Gerät',
      symptom: 'Symptom',
      othersAffected: 'Andere betroffen?',
      linkStatus: 'Link-Status',
      ipConfig: 'IP-Konfiguration',
      dhcpStatus: 'DHCP-Status',
      gateway: 'Gateway erreichbar',
      dns: 'DNS-Auflösung',
      accountStatus: 'Benutzerkonto',
    },

    // Available hypotheses the player can choose from
    hypotheses: [
      { id: 'no-link', label: 'Kein physischer Netzwerk-Link', correct: false },
      { id: 'no-dhcp', label: 'Kein DHCP-Lease erhalten', correct: true },
      { id: 'dns-problem', label: 'DNS-Problem', correct: false },
      { id: 'account-locked', label: 'Benutzerkonto gesperrt', correct: false },
      { id: 'site-down', label: 'Gesamter Standort ausgefallen', correct: false },
    ],

    // Checklist driven by actions, not stepIndex
    checklist: [
      { id: 'device-identified', label: 'Betroffenes Gerät identifiziert', trigger: 'lookup-directory' },
      { id: 'physical-checked', label: 'Physische Verbindung geprüft', trigger: 'check-cable' },
      { id: 'ip-checked', label: 'IP-Konfiguration geprüft', trigger: 'run-ipconfig' },
      { id: 'apipa-recognized', label: 'APIPA erkannt', trigger: 'interpret-apipa' },
      { id: 'hypothesis-set', label: 'Hypothese aufgestellt', trigger: 'set-hypothesis' },
      { id: 'fix-applied', label: 'Lösung angewendet', trigger: 'apply-fix' },
      { id: 'verified', label: 'Lösung verifiziert', trigger: 'verify-fix' },
    ],

    // Phases of the investigation - the core gameplay loop
    phases: [
      {
        id: 'intake',
        title: 'Symptom aufnehmen',
        prompt: 'Greta meldet: „Ich komme nicht ins Internet.“\n\nWas möchtest du zuerst herausfinden?',
        actions: [
          {
            id: 'ask-greta',
            label: 'Greta genauer befragen',
            feedback: 'Greta sagt: „Seit heute Morgen geht gar nichts. Meine Kollegin Sabine am Nachbarplatz hat aber Internet.“',
            facts: { othersAffected: 'Nein, nur Greta' },
            optimal: true,
          },
          {
            id: 'lookup-directory',
            label: 'PC im Verzeichnis nachschlagen',
            feedback: 'Verzeichnis: PC-BUCH-01 – IP 192.168.10.47 (DHCP), Gateway 192.168.10.1, DNS 192.168.10.10. Switchport: Raum 2.04, Dose B7.',
            facts: { device: 'PC-BUCH-01 (Raum 2.04, Dose B7)' },
            optimal: true,
          },
          {
            id: 'check-account',
            label: 'Benutzerkonto prüfen',
            feedback: 'Das Konto von Greta Müller ist aktiv und nicht gesperrt. Ein Accountproblem erklärt die fehlende Netzwerkverbindung nicht.',
            facts: { accountStatus: 'Aktiv, nicht gesperrt' },
            optimal: false,
          },
          {
            id: 'restart-server',
            label: 'Server neu starten',
            feedback: 'Welchen Server? Ohne Diagnose ist ein Neustart riskant. Andere Mitarbeiter arbeiten gerade produktiv am Netz. Sammle zuerst Fakten.',
            facts: {},
            optimal: false,
          },
        ],
        requiredActions: ['ask-greta', 'lookup-directory'],
        nextPhase: 'investigate',
      },
      {
        id: 'investigate',
        title: 'Informationen sammeln',
        prompt: 'Du weißt jetzt, welcher PC betroffen ist und dass Gretas Kollegin Internet hat. Das Problem scheint lokal zu sein.\n\nWas möchtest du mit dem Terminal herausfinden?',
        actions: [
          {
            id: 'run-ipconfig',
            label: 'IP-Konfiguration anzeigen (ipconfig /all)',
            feedback: null, // special: shows terminal output
            terminalOutput: 'C:\\> ipconfig /all\n\nEthernet-Adapter Büro:\n\n   Verbindungsspezifisches DNS-Suffix: nexus.local\n   DHCP aktiviert. . . . . . . . . : Ja\n   IPv4-Adresse. . . . . . . . . . : 169.254.31.8\n   Subnetzmaske  . . . . . . . . . : 255.255.0.0\n   Standardgateway . . . . . . . . :\n   DNS-Server  . . . . . . . . . . :\n   Beschreibung . . . . . . . . . : Intel Ethernet I219-LM',
            facts: { ipConfig: '169.254.31.8 (APIPA)', dhcpStatus: 'Aktiviert, aber kein Lease', gateway: 'Nicht vorhanden', dns: 'Nicht vorhanden' },
            optimal: true,
          },
          {
            id: 'check-cable',
            label: 'Kabelverbindung und Link-LED prüfen',
            feedback: 'Du bittest Greta, das Netzwerkkabel an der Rückseite des PCs zu prüfen. Sie sagt: „Das Kabel steckt, und das grüne Lämpchen an der Buchse blinkt.“ Die Link-LED ist aktiv.',
            facts: { linkStatus: 'Kabel steckt, Link-LED aktiv' },
            optimal: true,
          },
          {
            id: 'ping-gateway',
            label: 'Verbindung zum Gateway testen (ping 192.168.10.1)',
            feedback: null,
            terminalOutput: 'C:\\> ping 192.168.10.1\n\nPing wird ausgeführt für 192.168.10.1 mit 32 Bytes Daten:\n   Allgemeiner Fehler.\n   Allgemeiner Fehler.\n   Allgemeiner Fehler.\n   Allgemeiner Fehler.\n\nPing-Statistik für 192.168.10.1:\n    Pakete: Gesendet = 4, Empfangen = 0, Verloren = 4',
            facts: { gateway: 'Nicht erreichbar (kein gültiger Absender)' },
            optimal: false,
          },
          {
            id: 'test-dns',
            label: 'DNS-Auflösung testen (nslookup)',
            feedback: 'Ohne gültige IP-Konfiguration kann der DNS-Server nicht erreicht werden. DNS-Tests sind erst sinnvoll, wenn eine gültige Netzwerkadresse vorhanden ist.',
            facts: { dns: 'Nicht testbar ohne IP' },
            optimal: false,
          },
        ],
        requiredActions: ['run-ipconfig'],
        nextPhase: 'interpret',
      },
      {
        id: 'interpret',
        title: 'Ergebnis interpretieren',
        prompt: 'Die ipconfig-Ausgabe zeigt:\n\n• IPv4-Adresse: 169.254.31.8\n• Subnetzmaske: 255.255.0.0\n• Standardgateway: leer\n• DNS-Server: leer\n• DHCP: aktiviert\n\nWas sagt uns dieses Ergebnis?',
        actions: [
          {
            id: 'interpret-apipa',
            label: 'Der PC hat keinen DHCP-Lease erhalten (APIPA-Adresse)',
            feedback: 'Genau. 169.254.x.x ist eine APIPA-Adresse – der PC hat vergeblich auf eine DHCP-Antwort gewartet und sich selbst eine Link-Local-Adresse zugewiesen. Ohne echte IP kann er weder Gateway noch DNS erreichen.',
            facts: { ipConfig: '169.254.31.8 (APIPA – kein DHCP-Lease)' },
            optimal: true,
            correct: true,
          },
          {
            id: 'interpret-dns-down',
            label: 'Der DNS-Server ist ausgefallen',
            feedback: 'Der DNS-Server fehlt in der Ausgabe, aber das ist eine Folge. Ohne DHCP-Lease bekommt der PC weder IP noch DNS-Server zugewiesen. Die Ursache liegt früher in der Kette.',
            facts: {},
            optimal: false,
            correct: false,
          },
          {
            id: 'interpret-account',
            label: 'Das Benutzerkonto ist gesperrt',
            feedback: 'Ein gesperrtes Konto würde die IP-Konfiguration nicht beeinflussen. Die APIPA-Adresse zeigt ein Netzwerkproblem.',
            facts: {},
            optimal: false,
            correct: false,
          },
          {
            id: 'interpret-site-down',
            label: 'Der gesamte Serverraum ist offline',
            feedback: 'Gretas Kollegin Sabine hat Internet. Der Standort funktioniert, das Problem ist lokal bei Greta.',
            facts: {},
            optimal: false,
            correct: false,
          },
        ],
        requiredActions: ['interpret-apipa'],
        nextPhase: 'hypothesis',
        promptsHypothesis: true,
      },
      {
        id: 'hypothesis',
        title: 'Hypothese bilden',
        prompt: 'Du hast die APIPA-Adresse erkannt. Die Link-LED ist aktiv, also besteht eine physische Verbindung.\n\nWelche Hypothese erklärt das Problem am besten?',
        isHypothesisPhase: true,
        correctHypothesis: 'no-dhcp',
        hypothesisFeedback: {
          'no-dhcp': 'Das passt. Physischer Link besteht, aber DHCP liefert keinen Lease. Mögliche Ursachen: DHCP-Server nicht erreichbar, Switchport-Problem oder kurzzeitiger Ausfall.',
          'no-link': 'Die Link-LED blinkt – die physische Verbindung besteht. Die APIPA-Adresse deutet eher auf ein DHCP-Problem.',
          'dns-problem': 'DNS wäre erst relevant, wenn der PC eine gültige IP hätte. Ohne DHCP-Lease fehlt die Grundlage.',
          'account-locked': 'Das Benutzerkonto ist aktiv. APIPA hat nichts mit Konten zu tun.',
          'site-down': 'Der Standort funktioniert – Sabine hat Internet. Das Problem ist lokal.',
        },
        nextPhase: 'fix',
      },
      {
        id: 'fix',
        title: 'Lösung anwenden',
        prompt: 'Deine Hypothese: Kein DHCP-Lease. Die physische Verbindung steht.\n\nWelche Aktion führst du durch?',
        actions: [
          {
            id: 'apply-fix',
            label: 'DHCP-Lease erneuern (ipconfig /renew)',
            feedback: null,
            terminalOutput: 'C:\\> ipconfig /renew\n\nEthernet-Adapter Büro:\n\n   IPv4-Adresse. . . . . . . . . . : 192.168.10.47\n   Subnetzmaske  . . . . . . . . . : 255.255.255.0\n   Standardgateway . . . . . . . . : 192.168.10.1\n   DHCP-Server . . . . . . . . . . : 192.168.10.10\n   DNS-Server  . . . . . . . . . . : 192.168.10.10',
            facts: { ipConfig: '192.168.10.47/24 (DHCP-Lease erhalten)', dhcpStatus: 'Lease erhalten', gateway: '192.168.10.1', dns: '192.168.10.10' },
            optimal: true,
          },
          {
            id: 'reinstall-windows',
            label: 'Windows neu installieren',
            feedback: 'Viel zu drastisch. Eine Neuinstallation dauert Stunden und zerstört Daten. Zuerst solltest du die einfachste Lösung versuchen: einen neuen DHCP-Lease anfordern.',
            facts: {},
            optimal: false,
          },
          {
            id: 'disable-firewall',
            label: 'Firewall deaktivieren',
            feedback: 'Die Firewall blockiert keine DHCP-Anfragen. Das würde das Problem nicht lösen und die Sicherheit gefährden.',
            facts: {},
            optimal: false,
          },
        ],
        requiredActions: ['apply-fix'],
        nextPhase: 'verify',
      },
      {
        id: 'verify',
        title: 'Lösung verifizieren',
        prompt: 'Der PC hat jetzt die IP 192.168.10.47 erhalten. Aber eine Änderung ist noch kein Beweis.\n\nWie verifizierst du, dass das Problem gelöst ist?',
        actions: [
          {
            id: 'verify-gateway',
            label: 'Gateway anpingen (ping 192.168.10.1)',
            feedback: null,
            terminalOutput: 'C:\\> ping 192.168.10.1\n\nPing wird ausgeführt für 192.168.10.1 mit 32 Bytes Daten:\n   Antwort von 192.168.10.1: Bytes=32 Zeit<1ms TTL=255\n   Antwort von 192.168.10.1: Bytes=32 Zeit<1ms TTL=255\n\nPing-Statistik für 192.168.10.1:\n    Pakete: Gesendet = 2, Empfangen = 2, Verloren = 0',
            facts: { gateway: 'Erreichbar (< 1ms)' },
            optimal: true,
          },
          {
            id: 'verify-dns',
            label: 'DNS testen (nslookup nexus.local)',
            feedback: null,
            terminalOutput: 'C:\\> nslookup nexus.local\nServer:  DC01.nexus.local\nAddress:  192.168.10.10\n\nName:    nexus.local\nAddress:  192.168.10.10',
            facts: { dns: 'Funktioniert (DC01.nexus.local)' },
            optimal: true,
          },
          {
            id: 'verify-fix',
            label: 'Greta bitten, Browser und Drucker zu testen',
            feedback: 'Greta öffnet den Browser. „Es geht wieder! Und der Drucker druckt auch.“ Sie bedankt sich.',
            facts: { symptom: 'Behoben – Internet und Drucker funktionieren' },
            optimal: true,
          },
        ],
        requiredActions: ['verify-fix'],
        nextPhase: null, // triggers completion
      },
    ],

    // Sam's mentor hints per phase (3 levels)
    samHints: {
      intake: [
        'Welche Informationen brauchst du, um das Problem einzugrenzen?',
        'Finde heraus, ob nur Greta betroffen ist, und schau nach, welchen PC sie nutzt.',
        'Befrage Greta und schlag den PC im Verzeichnis nach. Das sind deine ersten zwei Schritte.',
      ],
      investigate: [
        'Welches Werkzeug zeigt dir, wie der PC gerade im Netzwerk konfiguriert ist?',
        'Die IP-Konfiguration verrät dir, ob der PC überhaupt eine gültige Adresse hat.',
        'Führe ipconfig /all aus. Das zeigt dir IP, Gateway, DNS und DHCP-Status.',
      ],
      interpret: [
        'Schau dir die IP-Adresse genau an. Gehört sie zum Firmennetz 192.168.10.x?',
        '169.254.x.x ist eine besondere Adresse. Was bedeutet sie?',
        'Eine 169.254-Adresse (APIPA) bedeutet: DHCP war aktiviert, aber kein Server hat geantwortet.',
      ],
      hypothesis: [
        'Überlege: Welche deiner bisherigen Beobachtungen passt zu welcher Hypothese?',
        'Link-LED aktiv = physische Verbindung ok. APIPA-Adresse = kein DHCP-Lease.',
        'Die wahrscheinlichste Ursache: Der PC konnte keinen DHCP-Lease beziehen.',
      ],
      fix: [
        'Was ist der einfachste und sicherste nächste Schritt?',
        'Wenn DHCP aktiviert ist aber kein Lease kam: Was könntest du erneut anfordern?',
        'Versuche ipconfig /renew – damit fordert der PC einen neuen DHCP-Lease an.',
      ],
      verify: [
        'Woher weißt du sicher, dass das Problem wirklich gelöst ist?',
        'Teste die Verbindung Schritt für Schritt: Gateway, DNS, dann die Anwendung.',
        'Ping das Gateway, prüfe DNS, und lass Greta Browser und Drucker testen.',
      ],
    },

    // Resolution text
    resolution: 'Der Switchport war kurzzeitig ohne Link. Nachdem die physische Verbindung wiederhergestellt war, konnte DHCP wieder einen Lease vergeben. Du hast die Störung strukturiert diagnostiziert, ohne riskante Änderungen vorzunehmen.',

    // Knowledge entry unlocked after completion
    knowledgeEntry: {
      id: 'dhcp-apipa',
      title: 'DHCP und APIPA',
      category: 'Netzwerk',
      symptoms: [
        'Keine Netzwerkverbindung',
        '169.254.x.x-Adresse (APIPA)',
        'Kein Standardgateway',
        'Kein DNS-Server',
      ],
      process: [
        'Physische Verbindung prüfen (Kabel, Link-LED)',
        'IP-Konfiguration ansehen (ipconfig /all)',
        'Gültigkeit der Adresse beurteilen',
        'DHCP-Lease erneuern (ipconfig /renew)',
        'Verbindung testen (Gateway, DNS, Anwendung)',
      ],
      takeaway: 'Eine 169.254-Adresse bedeutet: DHCP ist aktiviert, aber kein Lease wurde bezogen. Physische Verbindung prüfen, dann Lease erneuern.',
      tools: ['ipconfig /all', 'ipconfig /renew', 'ping'],
    },
  },
};

export function diagnosticQuestById(id) {
  return diagnosticQuests[id] || null;
}
