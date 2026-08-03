const sizeOf = require('image-size');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'screenshots');
fs.readdirSync(dir).forEach((f) => {
  if (f.endsWith('.png')) {
    const dim = sizeOf(path.join(dir, f));
    console.log(`${f}: ${dim.width}x${dim.height}`);
  }
});
