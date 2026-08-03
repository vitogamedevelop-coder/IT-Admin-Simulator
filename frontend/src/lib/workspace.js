export const workspaceAreas = {
  center: {
    id: 'center',
    label: 'Schreibtisch',
    description: 'PC, Monitor, Tastatur und deine direkte Arbeitsumgebung.',
    hotspots: [
      { id: 'pc', label: 'PC', app: 'email', icon: 'Monitor' },
      { id: 'terminal', label: 'Terminal', app: 'terminal', icon: 'Terminal' },
      { id: 'notebook', label: 'Notizheft', app: 'notebook', icon: 'BookOpen' },
      { id: 'phone', label: 'Telefon', app: 'phone', icon: 'Phone' },
    ],
  },
  left: {
    id: 'left',
    label: 'Linker Bereich',
    description: 'Regal mit Runbooks, Whiteboard und Hinweisen.',
    hotspots: [
      { id: 'runbooks', label: 'Runbooks', app: 'runbooks', icon: 'BookMarked' },
      { id: 'whiteboard', label: 'Whiteboard', app: 'missions', icon: 'Layout' },
    ],
  },
  right: {
    id: 'right',
    label: 'Tür & Flur',
    description: 'Hier erscheinen Kollegen, die dich direkt sprechen möchten.',
    hotspots: [
      { id: 'door', label: 'Flur', app: 'people', icon: 'Users' },
    ],
  },
  server: {
    id: 'server',
    label: 'Serverraum',
    description: 'Nur für Aufgaben, die physischen Zugang erfordern.',
    hotspots: [
      { id: 'rack', label: 'Server-Rack', app: 'infrastructure', icon: 'Server' },
    ],
  },
};

export function hotspotById(id) {
  return Object.values(workspaceAreas)
    .flatMap((area) => area.hotspots)
    .find((hotspot) => hotspot.id === id);
}

export function areaById(id) {
  return workspaceAreas[id] || workspaceAreas.center;
}
