/**
 * Milestone W1 – Versionierung, Web-Version & GitHub Pages
 *
 * Tests:
 * 1. Version file exists and follows SemVer
 * 2. Version displayed in Settings page
 * 3. PWA manifest is valid and complete
 * 4. GitHub Actions workflow exists and is valid YAML
 * 5. 404.html SPA redirect exists
 * 6. Vite config supports base URL for GitHub Pages
 * 7. GitHub Pages redirect restoration exists in main.jsx
 * 8. Responsive CSS breakpoints exist
 * 9. index.html has required PWA meta tags
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const frontend = path.join(root, 'frontend');

function read(rel) {
  return fs.readFileSync(path.join(frontend, rel), 'utf8');
}

function readRoot(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

// ============================================================
// 1. Version files
// ============================================================
console.log('1. Testing version files...');
const pkg = JSON.parse(read('package.json'));
assert.match(pkg.version, /^\d+\.\d+\.\d+$/, 'package.json version is SemVer');
assert.equal(pkg.name, 'it-admin-simulator');

const versionModule = read('src/lib/version.js');
assert(versionModule.includes("APP_VERSION = '" + pkg.version + "'"), 'version.js matches package.json');
assert(versionModule.includes('Semantic Versioning'), 'Explains SemVer');

const publicVersion = JSON.parse(read('public/version.json'));
assert.equal(publicVersion.version, pkg.version, 'public/version.json matches');
console.log(`   Version: ${pkg.version}`);

// ============================================================
// 2. Settings page displays version
// ============================================================
console.log('2. Testing Settings page version display...');
const settingsSrc = read('src/pages/Settings.jsx');
assert(settingsSrc.includes('getVersionLabel'), 'Settings imports getVersionLabel');
assert(settingsSrc.includes('Version'), 'Settings has version section');
console.log('   Settings page displays version.');

// ============================================================
// 3. PWA manifest
// ============================================================
console.log('3. Testing PWA manifest...');
const manifest = JSON.parse(read('public/manifest.json'));
assert(manifest.name, 'Has name');
assert(manifest.short_name, 'Has short_name');
assert(manifest.description, 'Has description');
assert.equal(manifest.display, 'standalone', 'display is standalone');
assert(manifest.theme_color, 'Has theme_color');
assert(manifest.background_color, 'Has background_color');
assert(manifest.icons && manifest.icons.length > 0, 'Has icons');
assert(manifest.start_url, 'Has start_url');
assert(manifest.scope, 'Has scope');
console.log(`   Manifest: ${manifest.short_name}, ${manifest.display}, theme=${manifest.theme_color}`);

// ============================================================
// 4. GitHub Actions workflow
// ============================================================
console.log('4. Testing GitHub Actions workflow...');
const workflowPath = path.join(root, '.github', 'workflows', 'deploy-pages.yml');
assert(fs.existsSync(workflowPath), 'Workflow file exists');
const workflowSrc = readRoot('.github/workflows/deploy-pages.yml');
assert(workflowSrc.includes('Deploy to GitHub Pages'), 'Workflow has correct name');
assert(workflowSrc.includes("branches: [main]"), 'Triggers on push to main');
assert(workflowSrc.includes('jobs:'), 'Has jobs');
assert(workflowSrc.includes('  build:'), 'Has build job');
assert(workflowSrc.includes('  deploy:'), 'Has deploy job');
assert(workflowSrc.includes('npm run lint'), 'Runs lint');
assert(workflowSrc.includes('npm run build'), 'Runs build');
assert(workflowSrc.includes('404.html'), 'Copies 404.html');
console.log('   GitHub Actions workflow valid.');

// ============================================================
// 5. 404.html SPA redirect
// ============================================================
console.log('5. Testing 404.html SPA redirect...');
const notFound = read('public/404.html');
assert(notFound.includes('gh-pages-redirect'), 'Stores redirect path');
assert(notFound.includes('IT-Admin-Simulator'), 'Redirects to repository base');
assert(notFound.includes('sessionStorage'), 'Uses sessionStorage');
console.log('   404.html redirect present.');

// ============================================================
// 6. Vite config supports base URL
// ============================================================
console.log('6. Testing Vite config...');
const viteConfig = read('vite.config.js');
assert(viteConfig.includes('VITE_BASE_URL'), 'Uses VITE_BASE_URL');
assert(viteConfig.includes('base:'), 'Configures base');
console.log('   Vite config supports GitHub Pages base URL.');

// ============================================================
// 7. main.jsx redirect restoration
// ============================================================
console.log('7. Testing main.jsx redirect restoration...');
const mainSrc = read('src/main.jsx');
assert(mainSrc.includes('restoreGitHubPagesRedirect'), 'Exports restore function');
assert(mainSrc.includes('gh-pages-redirect'), 'Restores redirect from sessionStorage');
assert(mainSrc.includes('BrowserRouter basename'), 'Uses basename');
console.log('   main.jsx handles SPA redirect restoration.');

// ============================================================
// 8. App.jsx calls restore
// ============================================================
console.log('8. Testing App.jsx integration...');
const appSrc = read('src/App.jsx');
assert(appSrc.includes('restoreGitHubPagesRedirect'), 'Imports restore function');
assert(appSrc.includes('useEffect'), 'Uses useEffect');
console.log('   App.jsx restores redirect on mount.');

// ============================================================
// 9. Responsive CSS breakpoints
// ============================================================
console.log('9. Testing responsive CSS...');
const css = read('src/index.css');
assert(css.includes('@media (min-width: 640px)'), 'Has sm breakpoint');
assert(css.includes('@media (min-width: 1024px)'), 'Has lg breakpoint');
assert(css.includes('max-width: 42rem'), 'Tablet max-width');
assert(css.includes('max-width: 56rem'), 'Desktop max-width');
console.log('   Responsive breakpoints present.');

// ============================================================
// 10. index.html PWA meta tags
// ============================================================
console.log('10. Testing index.html PWA meta tags...');
const indexHtml = read('index.html');
assert(indexHtml.includes('viewport'), 'Has viewport meta');
assert(indexHtml.includes('theme-color'), 'Has theme-color meta');
assert(indexHtml.includes('apple-mobile-web-app-capable'), 'Has apple capable meta');
assert(indexHtml.includes('manifest.json'), 'Links manifest');
console.log('   index.html PWA meta tags complete.');

console.log('\n=== All Milestone W1 Tests PASSED ===');
