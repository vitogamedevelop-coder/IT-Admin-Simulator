const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'public', 'assets', 'workspace-bg');
const backupDir = path.join(root, 'assets-src', 'originals', 'workspace-bg');

async function optimize() {
  const files = fs.readdirSync(assetsDir).filter((f) => f.toLowerCase().endsWith('.png'));
  for (const file of files) {
    const src = path.join(assetsDir, file);
    const baseName = file.replace(/\.png$/i, '');
    const outName = `${baseName}.webp`;
    const outPath = path.join(assetsDir, outName);
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, file);
    if (!fs.existsSync(backupPath)) fs.copyFileSync(src, backupPath);

    await sharp(src)
      .resize(1536, 864, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(outPath);

    const srcStat = fs.statSync(src);
    const outStat = fs.statSync(outPath);
    const reduction = ((srcStat.size - outStat.size) / srcStat.size * 100).toFixed(1);
    // eslint-disable-next-line no-console
    console.log(`${baseName}: ${(srcStat.size / 1024).toFixed(0)}KB -> ${(outStat.size / 1024).toFixed(0)}KB (${reduction}%)`);
    fs.unlinkSync(src);
  }
}

optimize().catch((err) => { console.error(err); process.exit(1); });
