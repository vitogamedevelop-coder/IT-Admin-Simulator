import {
  Building2, MonitorSmartphone, Users, DoorOpen, Server, BookOpen, Lightbulb, MessageSquare, Move,
} from 'lucide-react';

// One-at-a-time office tour. Each step introduces exactly one area and waits
// for the player to interact with the real Workspace element before continuing.
export const ONBOARDING_STEPS = [
  {
    id: 'welcome-chef',
    person: 'Thomas Weber · Geschäftsführung', character: 'weber', icon: Building2,
    title: 'Herzlich willkommen bei NEXUS Systems',
    lines: [
      'Schön, dass du da bist.',
      'Das hier wird dein neuer Arbeitsplatz.',
      'Bevor du loslegst, zeigt dir Sam kurz die wichtigsten Stellen.',
    ],
    nextLabel: 'Weiter',
  },
  {
    id: 'sam-intro',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: Users,
    title: 'Willkommen im Team',
    lines: [
      'Hey, ich bin Sam.',
      'Bevor wir mit der Arbeit anfangen, zeige ich dir erst einmal das Büro.',
      'Keine Sorge, wir gehen alles Schritt für Schritt durch.',
    ],
    nextLabel: 'Los geht\'s',
  },
  {
    id: 'computer',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: MonitorSmartphone,
    title: '1. Arbeitsplatz',
    lines: [
      'Hier wirst du die meiste Zeit arbeiten.',
      'Über den Computer bearbeitest du später E-Mails, Anrufe und Aufgaben.',
      'Auch viele Werkzeuge werden hier freigeschaltet.',
      'Tippe einfach auf den Monitor.',
    ],
    target: { type: 'hotspot', key: 'workstation', zone: 'center' },
    success: (s) => s.monitorOpen === true,
  },
  {
    id: 'phone',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: MessageSquare,
    title: '2. Telefon',
    lines: [
      'Viele Aufgaben beginnen mit einem Anruf.',
      'Manchmal melden Kollegen oder Kunden ein Problem.',
      'Tippe auf das Telefon-Symbol auf dem Desktop.',
    ],
    success: (s) => s.openApp === 'phone',
  },
  {
    id: 'phone-close',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: MessageSquare,
    title: 'Zurück zum Büro',
    lines: [
      'Perfekt. So funktioniert das Telefon.',
      'Schließe den Computer wieder, damit wir weitermachen können.',
    ],
    success: (s) => s.monitorOpen === false && s.openApp === null,
  },
  {
    id: 'whiteboard',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: Lightbulb,
    title: '3. Whiteboard',
    lines: [
      'Hier findest du kleine Hinweise.',
      'Nicht jeder Hinweis ist wichtig, aber manchmal hilft dir genau dieser eine Satz.',
      'Tippe auf das Whiteboard.',
    ],
    target: { type: 'hotspot', key: 'whiteboard', zone: 'left' },
    success: (s) => s.activeHint === true,
  },
  {
    id: 'drag-tutorial',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: Move,
    title: 'Ups...',
    lines: [
      'Moment, ich stehe dir ja im Weg!',
      'Pack mein Fenster einfach irgendwo anders hin.',
      'Du kannst es jederzeit verschieben, wenn ich etwas verdecke.',
    ],
    nextLabel: 'Verstanden',
  },
  {
    id: 'whiteboard-close',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: Lightbulb,
    title: 'Zurück zum Büro',
    lines: [
      'Schließe den Hinweis wieder.',
    ],
    success: (s) => s.activeHint === false,
  },
  {
    id: 'shelf',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: BookOpen,
    title: '4. Regal',
    lines: [
      'Hier findest du Dokumentationen, Runbooks und Nachschlagewerke.',
      'Tippe auf einen der Regal-Hotspots, zum Beispiel die Wissensbibliothek.',
    ],
    target: { type: 'hotspot', key: 'notebook', zone: 'left' },
    success: (s) => ['notebook', 'directory'].includes(s.openApp),
  },
  {
    id: 'shelf-close',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: BookOpen,
    title: 'Zurück zum Büro',
    lines: [
      'Gut. Schließe die App wieder.',
    ],
    success: (s) => s.openApp === null,
  },
  {
    id: 'corridor',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: DoorOpen,
    title: '5. Flur',
    lines: [
      'Im Flur triffst du immer wieder Kollegen mit Fragen aus dem Arbeitsalltag. Dabei merkst du schnell, was von der Academy wirklich hängen geblieben ist.',
      'Wenn du dagegen ein bestimmtes Thema gezielt lernen oder wiederholen möchtest, komm direkt zu mir ins Büro.',
      'Und falls du es strukturierter magst: die NEXUS Academy führt dich Thema für Thema durch die Grundlagen.',
      'Tippe auf die Tür zum Flur.',
    ],
    target: { type: 'hotspot', key: 'door', zone: 'right' },
    success: (s) => s.corridorMenu === true,
  },
  {
    id: 'corridor-close',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: DoorOpen,
    title: 'Zurück zum Büro',
    lines: [
      'Schließe die Flurübersicht wieder.',
    ],
    success: (s) => s.corridorMenu === false,
  },
  {
    id: 'server',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: Server,
    title: '6. Serverraum',
    lines: [
      'Hier arbeiten wir später häufiger.',
      'Im Moment musst du dort noch nicht alles verstehen.',
      'Das kommt Schritt für Schritt.',
      'Tippe auf die Tür zum Serverraum.',
    ],
    target: { type: 'hotspot', key: 'serverDoor', zone: 'server' },
    success: (s, _initial, _monitorWasOpen, lastHotspot) => lastHotspot === 'serverDoor',
  },
  {
    id: 'finish',
    person: 'Sam Richter · Senior-Administrator', character: 'sam', icon: Users,
    title: 'Erster Auftrag',
    lines: [
      'Da steht noch ein neuer Switch, der heute eingebaut werden soll.',
      'Bevor wir den ins Netz hängen, machen wir erst die Grundkonfiguration.',
      'Das ist ein guter erster Auftrag für dich.',
    ],
    finish: true,
  },
];
