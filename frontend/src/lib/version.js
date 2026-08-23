/**
 * Central version information for IT-Admin-Simulator / CyberLearn.
 *
 * This single source of truth is used by the web UI, PWA manifest,
 * Android build scripts, and GitHub Pages deployments.
 *
 * Semantic Versioning (SemVer):
 *   MAJOR.MINOR.PATCH
 *
 *   MAJOR: complete releases, large architecture changes
 *   MINOR: new lessons, academy areas, major features, game mechanics
 *   PATCH: bug fixes, small improvements, performance, UI corrections,
 *          translations, small academy extensions
 *
 * Keep this value in sync with frontend/package.json.
 */
export const APP_VERSION = '1.33.1';
export const APP_NAME = 'IT-Admin Simulator';
export const APP_SHORT_NAME = 'IT-Admin';
export const APP_DESCRIPTION = 'Lerne IT-Administration spielerisch – Netzwerke, Security, Linux, Active Directory und mehr.';
export const APP_REPOSITORY = 'https://github.com/vitogamedevelop-coder/IT-Admin-Simulator';
export const APP_HOMEPAGE = 'https://vitogamedevelop-coder.github.io/IT-Admin-Simulator/';

/**
 * Returns the current version string, e.g. "1.2.0".
 * Useful for menus, settings, and build logs.
 */
export function getAppVersion() {
  return APP_VERSION;
}

/**
 * Returns a full version line for display.
 */
export function getVersionLabel() {
  return `${APP_NAME} v${APP_VERSION}`;
}
