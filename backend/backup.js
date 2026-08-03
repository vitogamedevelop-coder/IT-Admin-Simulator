const fs = require('fs');
const path = require('path');
const { run } = require('./db');

const dataDir = path.join(__dirname, 'data');
const databasePath = path.join(dataDir, 'cyberlearn.db');
const backupDir = path.join(dataDir, 'backups');
const retention = 14;

async function createBackup() {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  await run('PRAGMA wal_checkpoint(FULL)');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(backupDir, `cyberlearn-${stamp}.db`);
  await fs.promises.copyFile(databasePath, target);
  const backups = (await fs.promises.readdir(backupDir)).filter((file) => file.endsWith('.db')).sort().reverse();
  await Promise.all(backups.slice(retention).map((file) => fs.promises.unlink(path.join(backupDir, file))));
  return path.basename(target);
}

function scheduleBackups() {
  const delay = 24 * 60 * 60 * 1000;
  createBackup().catch((error) => console.error('Backup fehlgeschlagen:', error.message));
  setInterval(() => createBackup().catch((error) => console.error('Backup fehlgeschlagen:', error.message)), delay).unref();
}

async function listBackups() {
  if (!fs.existsSync(backupDir)) return [];
  return (await fs.promises.readdir(backupDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.db'))
    .map((entry) => entry.name)
    .sort()
    .reverse();
}

module.exports = { createBackup, scheduleBackups, listBackups };
