const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'public', 'assets');
const backupDir = path.join(root, 'assets-src', 'originals');

const sets = {
  characters: { maxWidth: 512, maxHeight: 768, quality: 85, suffix: '' },
  company: { maxWidth: 1200, maxHeight: 675, quality: 85, suffix: '' },
  location: { maxWidth: 1200, maxHeight: 675, quality: 85, suffix: '' },
  stories: { maxWidth: 1200, maxHeight: 675, quality: 85, suffix: '' },
};

async function optimize() {
  const categories = fs.readdirSync(assetsDir).filter((f) =>
    fs.statSync(path.join(assetsDir, f)).isDirectory()
  );

  for (const category of categories) {
    const catPath = path.join(assetsDir, category);
    const files = fs
      .readdirSync(catPath)
      .filter((f) => f.toLowerCase().endsWith('.png'));

    const cfg = sets[category] || { maxWidth: 1200, maxHeight: 1200, quality: 85, suffix: '' };

    for (const file of files) {
      const src = path.join(catPath, file);
      const baseName = file.replace(/\.png$/i, '');
      const outName = `${baseName}.webp`;
      const outPath = path.join(catPath, outName);
      const backupCatDir = path.join(backupDir, category);
      fs.mkdirSync(backupCatDir, { recursive: true });
      const backupPath = path.join(backupCatDir, file);

      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(src, backupPath);
      }

      await sharp(src)
        .resize(cfg.maxWidth, cfg.maxHeight, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: cfg.quality, effort: 4 })
        .toFile(outPath);

      const srcStat = fs.statSync(src);
      const outStat = fs.statSync(outPath);
      const reduction = ((srcStat.size - outStat.size) / srcStat.size * 100).toFixed(1);
      // eslint-disable-next-line no-console
      console.log(
        `${category}/${baseName}: ${(srcStat.size / 1024).toFixed(0)}KB -> ${(outStat.size / 1024).toFixed(0)}KB (${reduction}%)`
      );

      fs.unlinkSync(src);
    }
  }
}

optimize().catch((err) => {
  console.error(err);
  process.exit(1);
});
