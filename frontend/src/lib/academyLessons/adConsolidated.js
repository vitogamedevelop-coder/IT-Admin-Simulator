import { topicKey } from '../academyTopics.js';

import { buildAdFoundationLesson } from './adFoundation.js';
import { buildAdDomainLesson, buildAdDomainControllerLesson } from './adLogicalComponents.js';
import { buildAdPermissionsLesson } from './adPermissions.js';
import { buildAdGroupPracticeLesson } from './adGroupPractice.js';
import { buildAdMmcBasicsLesson } from './adMmcBasics.js';
import { buildAdDelegationLesson } from './adDelegation.js';
import { buildAdTrustsLesson } from './adTrusts.js';
import { buildAdFsmoAdminGroupsLesson } from './adFsmoAdminGroups.js';
import { buildAdReplicationSiteConfigLesson } from './adReplicationSiteConfig.js';
import { buildAdRecycleBinLesson } from './adRecycleBin.js';
import { buildAdWindowsServerLesson } from './adWindowsServer.js';
import { buildAdSharesLesson } from './adShares.js';

// =============================================================================
// Konsolidierte Active-Directory-Lektionen (Curriculum-Merge v1.93.0)
// =============================================================================

export const AD_FOUNDATION_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-foundation');
export const AD_INSTALL_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-install');
export const AD_GROUPS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-groups');
export const AD_ADMINISTRATION_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-administration');
export const AD_TRUSTS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-trusts');
export const AD_REPLICATION_PRACTICE_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-practice');
export const AD_WINDOWS_STORAGE_TOPIC_KEY = topicKey('active-directory-virtualbox', 'windows-server');

function mergeLessons(title, ...parts) {
  return {
    title,
    explanations: parts.flatMap((p) => p.explanations || []),
    exercises: parts.flatMap((p) => p.exercises || []),
    quiz: parts.flatMap((p) => p.quiz || []),
    summary: parts.flatMap((p) => p.summary || []),
  };
}

export function buildAdFoundationConsolidatedLesson() {
  return mergeLessons('Active Directory – Grundlagen', buildAdFoundationLesson(), buildAdDomainLesson());
}

export function buildAdInstallConsolidatedLesson() {
  // virtualbox-lab ist leer, daher nur Domain-Controller übernommen.
  // Späterer Lab-Content wird hier ergänzt.
  const base = buildAdDomainControllerLesson();
  return { ...base, title: 'Domain Controller & AD-Konfiguration' };
}

export function buildAdGroupsConsolidatedLesson() {
  const permissions = buildAdPermissionsLesson();
  const practice = buildAdGroupPracticeLesson();
  return {
    title: 'Gruppen & Berechtigungsverwaltung',
    explanations: [...permissions.explanations, ...practice.explanations],
    exercises: [...permissions.exercises, ...practice.exercises],
    quiz: [...permissions.quiz, ...practice.quiz],
    summary: [...(permissions.summary || []), ...(practice.summary || [])],
  };
}

export function buildAdAdministrationConsolidatedLesson() {
  return mergeLessons('Administration, MMC & Delegation', buildAdMmcBasicsLesson(), buildAdDelegationLesson());
}

export function buildAdTrustsConsolidatedLesson() {
  return mergeLessons('Trusts, FSMO & Forest-Administration', buildAdTrustsLesson(), buildAdFsmoAdminGroupsLesson());
}

export function buildAdReplicationPracticeConsolidatedLesson() {
  return mergeLessons('Standorte praktisch & AD-Wiederherstellung', buildAdReplicationSiteConfigLesson(), buildAdRecycleBinLesson());
}

export function buildAdWindowsStorageConsolidatedLesson() {
  return mergeLessons('Windows Server & Freigaben', buildAdWindowsServerLesson(), buildAdSharesLesson());
}
