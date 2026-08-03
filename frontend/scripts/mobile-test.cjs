const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log('loading login...');
  await page.goto('http://localhost:3001/login');
  await page.waitForSelector('input[placeholder*="username"], input');
  await page.screenshot({ path: path.join(outDir, '01-login.png') });

  const inputs = page.locator('input');
  await inputs.nth(0).fill('admin');
  await inputs.nth(1).fill('admin123');
  await page.click('button[type="submit"]');

  console.log('waiting for dashboard...');
  await page.waitForSelector('text=IT & Systeme', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, '02-dashboard.png') });

  await page.goto('http://localhost:3001/module/1');
  await page.waitForSelector('text=Schicht 1', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, '03-module-study.png') });

  await page.click('text=quiz');
  await page.waitForSelector('text=F1 / 8', { timeout: 5000 });
  await page.screenshot({ path: path.join(outDir, '04-module-quiz.png') });

  await page.goto('http://localhost:3001/cheat');
  await page.waitForSelector('text=git clone', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, '05-cheat.png') });

  await page.goto('http://localhost:3001/custom');
  await page.waitForSelector('text=karteikarten', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, '06-custom.png') });

  await page.goto('http://localhost:3001/speedrun/it');
  await page.waitForSelector('text=60 sekunden', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, '07-speedrun.png') });

  await page.goto('http://localhost:3001/challenge');
  await page.waitForSelector('text=tageschallenge', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, '08-challenge.png') });

  await browser.close();
  console.log('screenshots saved to', outDir);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
