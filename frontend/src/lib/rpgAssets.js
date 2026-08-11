// import.meta.env.BASE_URL already ends with a trailing slash (e.g. '/'
// locally or '/IT-Admin-Simulator/' on GitHub Pages), so appending 'assets'
// keeps all '${ROOT}/...' paths below correct in dev, APK and GitHub Pages.
const ROOT = `${import.meta.env.BASE_URL}assets`;

export const uiAssets = {
  pcMonitor: `${ROOT}/ui-objects/ui-pc-monitor.webp`,
  phone: `${ROOT}/ui-objects/ui-phone.webp`,
  notebook: `${ROOT}/ui-objects/ui-notebook.webp`,
  terminal: `${ROOT}/ui-objects/ui-terminal.webp`,
  notificationBadge: `${ROOT}/ui-objects/ui-notification-badge.webp`,
};

export const workspaceBackgrounds = {
  center: `${ROOT}/workspace-bg/workspace-center-desk.webp`,
  left: `${ROOT}/workspace-bg/workspace-left-shelf.webp`,
  right: `${ROOT}/workspace-bg/workspace-right-door.webp`,
  server: `${ROOT}/workspace-bg/workspace-server-room.webp`,
};

export const rpgAssets = {
  characters: {
    sam: `${ROOT}/characters/character-sam-richter.webp`,
    mara: `${ROOT}/characters/character-mara-koenig.webp`,
    lea: `${ROOT}/characters/character-lea-novak.webp`,
    david: `${ROOT}/characters/character-david-chen.webp`,
    weber: `${ROOT}/characters/character-thomas-weber.webp`,
    aylin: `${ROOT}/characters/character-aylin-demir.webp`,
  },
  locations: {
    helpdesk: `${ROOT}/location/location-helpdesk.webp`,
    management: `${ROOT}/location/location-management-office.webp`,
    networkRoom: `${ROOT}/location/location-network-room.webp`,
    serverRoom: `${ROOT}/location/location-server-room.webp`,
    soc: `${ROOT}/location/location-soc.webp`,
    development: `${ROOT}/location/location-development.webp`,
    meetingRoom: `${ROOT}/location/location-meeting-room.webp`,
    branchOffice: `${ROOT}/location/location-branch-office.webp`,
    dataCenter: `${ROOT}/location/location-data-center.webp`,
  },
  company: {
    stage1: `${ROOT}/company/company-stage-01-small-office.webp`,
    stage2: `${ROOT}/company/company-stage-02-growing-department.webp`,
    stage3: `${ROOT}/company/company-stage-03-branch-office.webp`,
    stage4: `${ROOT}/company/company-stage-04-enterprise-soc.webp`,
  },
  stories: {
    firstDay: `${ROOT}/stories/story-first-day-network-failure.webp`,
    dnsOutage: `${ROOT}/stories/story-dns-outage.webp`,
    permissions: `${ROOT}/stories/story-permissions-incident.webp`,
    securityIncident: `${ROOT}/stories/story-security-incident.webp`,
    backupFailure: `${ROOT}/stories/story-backup-failure.webp`,
    branchOutage: `${ROOT}/stories/story-branch-network-outage.webp`,
    ransomware: `${ROOT}/stories/story-ransomware-suspicion.webp`,
    powerFailure: `${ROOT}/stories/story-power-failure-ups.webp`,
  },
};

export const assetSpecifications = {
  characters: { width: 512, height: 768, transparent: true, format: 'webp' },
  locations: { width: 1200, height: 675, transparent: false, format: 'webp' },
  company: { width: 1200, height: 675, transparent: false, format: 'webp' },
  stories: { width: 1200, height: 675, transparent: false, format: 'webp' },
};

export function characterAsset(id) {
  return rpgAssets.characters[id] || null;
}

export function companyAsset(stage) {
  return rpgAssets.company[`stage${stage}`] || rpgAssets.company.stage1;
}

export function storyAsset(questId) {
  // Phase 0 reset: no legacy story mappings. New missions register their
  // own asset key here.
  return rpgAssets.stories[questId] || null;
}
